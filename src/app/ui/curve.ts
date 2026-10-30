import { Component, computed, input } from '@angular/core';

/** One tick on an axis. `at` is in data units; `label` is drawn text (already
 *  formatted by the caller, e.g. with `formatSI`), empty for a bare tick.
 *  `major` ticks are longer; it defaults to "has a label". */
export interface CurveTick {
  readonly at: number;
  readonly label: string;
  readonly major?: boolean;
}

/** A point marked on the plot, in data units. `hollow` is a stroked 8 × 8
 *  square in ink, `filled` a solid 6 × 6 square in the hot colour: the shape
 *  is the cue that does not depend on colour. `guide` drops a dashed line to
 *  the x axis; `label` is drawn above the marker. */
export interface CurveMarker {
  readonly x: number;
  readonly y: number;
  readonly shape: 'filled' | 'hollow';
  readonly label?: string;
  readonly guide?: boolean;
}

/** Units of the 10-unit grid, as the schematic canvas. */
const GRID = 10;

/** Room around the plot area, in SVG units: the y title and the origin label
 *  on the left, the x title after the axis on the right, the peak label above
 *  and the tick labels below. Fixed, so a given w × h always has the same
 *  plot area whatever the data. */
export const CURVE_MARGIN = { left: 22, right: 24, top: 12, bottom: 24 } as const;

/** Tick lengths below (or left of) the axis line. */
const MAJOR_TICK = 6;
const MINOR_TICK = 4;
/** Below the axis: tick labels' baseline. Beside it: the origin and x title's
 *  baseline, which centres VT323's capitals on the axis line. */
const TICK_LABEL_DROP = 19;
const AXIS_TEXT_DROP = 5;
/** Marker labels closer than this to a plot edge anchor to that edge's side,
 *  so they never leave the drawing. */
const LABEL_EDGE = 40;

interface PlacedTick {
  readonly pos: number;
  readonly label: string;
  readonly major: boolean;
}

interface PlacedMarker {
  readonly x: number;
  readonly y: number;
  readonly hollow: boolean;
  readonly label: string;
  readonly guide: boolean;
  /** Where the guide starts: just below the marker's outer edge. */
  readonly guideTop: number;
  readonly labelX: number;
  readonly anchor: 'start' | 'middle' | 'end';
}

/**
 * A minimal static XY plot: one series as a polyline, a log or linear x axis,
 * a linear y axis from 0, ticks with caller-formatted labels, and hollow or
 * filled square markers. Nothing on it is interactive; the widget's own
 * control is its cursor. (ROADMAP A2's `app-trace` is the larger primitive for
 * scope and Bode traces; it may absorb or wrap this one.)
 *
 * Pixel skin: `crispEdges`, stroke 2 with square caps, every coordinate
 * rounded to a whole unit, squares rather than circles. Colours come from the
 * `--pix-*` screen tokens (ink for the curve, titles and hollow marker, muted
 * for axes, ticks and guide, hot for the filled marker), with the prose tokens
 * as a fallback outside a panel, so it follows both themes. The viewBox is
 * `w · 10 × h · 10`; at the schematic's width its text (`--pix-sch-text`)
 * renders at the schematic's size. The SVG keeps its aspect ratio from the
 * viewBox, so it takes its height before any data arrives (no layout shift).
 *
 * `label` is the spoken text equivalent (WCAG 1.1.1): the caller writes a
 * sentence with the headline numbers and updates it with them. It is set as
 * the `aria-label` of a `role="img"` SVG, with no live region.
 */
@Component({
  selector: 'app-curve',
  template: `
    <svg
      [attr.viewBox]="viewBox()"
      [attr.aria-label]="label() || null"
      [attr.role]="label() ? 'img' : 'presentation'"
      [attr.aria-hidden]="label() ? null : 'true'"
      preserveAspectRatio="xMidYMid meet"
      focusable="false"
    >
      <path class="axis" [attr.d]="axisPath()" />
      @for (t of xTickMarks(); track $index) {
        <path
          class="axis"
          [attr.d]="'M' + t.pos + ' ' + plot().bottom + ' v' + (t.major ? MAJOR : MINOR)"
        />
        @if (t.label) {
          <text
            class="value"
            [attr.x]="t.pos"
            [attr.y]="plot().bottom + TICK_DROP"
            text-anchor="middle"
          >
            {{ t.label }}
          </text>
        }
      }
      @for (t of yTickMarks(); track $index) {
        <path
          class="axis"
          [attr.d]="'M' + plot().left + ' ' + t.pos + ' h-' + (t.major ? MAJOR : MINOR)"
        />
        @if (t.label) {
          <text
            class="value"
            [attr.x]="plot().left - MAJOR - 3"
            [attr.y]="t.pos + AXIS_DROP"
            text-anchor="end"
          >
            {{ t.label }}
          </text>
        }
      }
      @if (xTitle()) {
        <text class="label" [attr.x]="plot().right + MAJOR" [attr.y]="plot().bottom + AXIS_DROP">
          {{ xTitle() }}
        </text>
      }
      @if (yTitle()) {
        <text
          class="label"
          [attr.x]="plot().left - MAJOR"
          [attr.y]="plot().top + 9"
          text-anchor="end"
        >
          {{ yTitle() }}
        </text>
      }
      @for (m of placedMarkers(); track $index) {
        @if (m.guide && m.guideTop < plot().bottom) {
          <path
            class="guide"
            [attr.d]="'M' + m.x + ' ' + m.guideTop + ' V' + plot().bottom"
            stroke-dasharray="4 4"
          />
        }
      }
      @if (curvePath()) {
        <path class="stroke curve" [attr.d]="curvePath()" />
      }
      @for (m of placedMarkers(); track $index) {
        @if (m.hollow) {
          <rect class="stroke marker" [attr.x]="m.x - 4" [attr.y]="m.y - 4" width="8" height="8" />
        } @else {
          <rect
            class="fill hot marker"
            [attr.x]="m.x - 3"
            [attr.y]="m.y - 3"
            width="6"
            height="6"
          />
        }
        @if (m.label) {
          <text class="label" [attr.x]="m.labelX" [attr.y]="m.y - 9" [attr.text-anchor]="m.anchor">
            {{ m.label }}
          </text>
        }
      }
    </svg>
  `,
  styles: `
    :host {
      display: block;
      color: var(--pix-screen-ink, var(--ink));
    }
    svg {
      display: block;
      width: 100%;
      height: auto;
      overflow: visible;
      shape-rendering: crispEdges;
    }
    .axis,
    .guide,
    .stroke {
      fill: none;
      stroke-width: 2;
      stroke-linejoin: miter;
    }
    .axis,
    .stroke {
      stroke-linecap: square;
    }
    .axis,
    .guide {
      stroke: var(--pix-screen-muted, var(--muted));
    }
    /* Butt caps, or square caps would lengthen each dash and close the gaps. */
    .guide {
      stroke-linecap: butt;
    }
    .stroke {
      stroke: currentColor;
    }
    .fill {
      fill: currentColor;
    }
    .hot {
      color: var(--pix-hot, var(--copper));
    }
    .label,
    .value {
      font-family: var(--pix-font, var(--mono));
      font-size: var(--pix-sch-text, 10px);
    }
    .label {
      fill: currentColor;
    }
    .value {
      fill: var(--pix-screen-muted, var(--muted));
    }
    @media (forced-colors: active) {
      .axis,
      .guide,
      .stroke {
        stroke: CanvasText;
      }
      .fill,
      .label,
      .value {
        fill: CanvasText;
      }
    }
  `,
})
export class Curve {
  /** Size in grid units (10 SVG units each), as `sch-canvas`. */
  readonly w = input.required<number>();
  readonly h = input.required<number>();
  /** x range in data units; with `xLog` both must be positive. */
  readonly xMin = input.required<number>();
  readonly xMax = input.required<number>();
  readonly xLog = input(false);
  /** y runs linearly from 0 at the x axis to `yMax` at the plot's top. */
  readonly yMax = input.required<number>();
  /** The series, as [x, y] in data units, drawn in order as one polyline.
   *  Points outside the x range or not finite are skipped; y is clamped to
   *  0 … yMax. */
  readonly points = input<readonly (readonly [number, number])[]>([]);
  readonly xTicks = input<readonly CurveTick[]>([]);
  readonly yTicks = input<readonly CurveTick[]>([]);
  /** Short visible titles: x after the right end of the axis, y at its top. */
  readonly xTitle = input('');
  readonly yTitle = input('');
  /** Drawn in order (later on top); outside the x range or not finite: skipped. */
  readonly markers = input<readonly CurveMarker[]>([]);
  /** The spoken text equivalent. Empty: the plot is decorative (hidden). */
  readonly label = input('');

  protected readonly MAJOR = MAJOR_TICK;
  protected readonly MINOR = MINOR_TICK;
  protected readonly TICK_DROP = TICK_LABEL_DROP;
  protected readonly AXIS_DROP = AXIS_TEXT_DROP;

  protected readonly viewBox = computed(() => `0 0 ${this.w() * GRID} ${this.h() * GRID}`);

  /** The plot area in SVG units, whole numbers. */
  protected readonly plot = computed(() => {
    const width = Math.round(this.w() * GRID);
    const height = Math.round(this.h() * GRID);
    return {
      left: CURVE_MARGIN.left,
      right: Math.max(CURVE_MARGIN.left, width - CURVE_MARGIN.right),
      top: CURVE_MARGIN.top,
      bottom: Math.max(CURVE_MARGIN.top, height - CURVE_MARGIN.bottom),
    };
  });

  protected readonly axisPath = computed(() => {
    const { left, right, top, bottom } = this.plot();
    return `M${left} ${top} V${bottom} H${right}`;
  });

  /** x in data units → fraction of the axis, or NaN if it cannot be placed. */
  private readonly xFraction = computed(() => {
    const log = this.xLog();
    const t = (v: number) => (log ? Math.log(v) : v);
    const lo = t(this.xMin());
    const span = t(this.xMax()) - lo;
    return (x: number) => {
      if (!Number.isFinite(x) || (log && x <= 0) || !Number.isFinite(span) || span <= 0) {
        return NaN;
      }
      const f = (t(x) - lo) / span;
      // A hair of slack so the range's own ends survive floating-point rounding.
      return f < -1e-9 || f > 1 + 1e-9 ? NaN : Math.min(1, Math.max(0, f));
    };
  });

  private readonly mapX = computed(() => {
    const frac = this.xFraction();
    const { left, right } = this.plot();
    return (x: number) => {
      const f = frac(x);
      return Number.isNaN(f) ? NaN : Math.round(left + f * (right - left));
    };
  });

  private readonly mapY = computed(() => {
    const max = this.yMax();
    const { top, bottom } = this.plot();
    return (y: number) => {
      if (!Number.isFinite(y)) return NaN;
      const f = Number.isFinite(max) && max > 0 ? Math.min(1, Math.max(0, y / max)) : 0;
      return Math.round(bottom - f * (bottom - top));
    };
  });

  /** One vertex per drawable point; empty when there is nothing to draw. */
  protected readonly curvePath = computed(() => {
    const mx = this.mapX();
    const my = this.mapY();
    const vertices: string[] = [];
    for (const [x, y] of this.points()) {
      const px = mx(x);
      const py = my(y);
      if (Number.isNaN(px) || Number.isNaN(py)) continue;
      vertices.push(`${vertices.length ? 'L' : 'M'}${px} ${py}`);
    }
    return vertices.join(' ');
  });

  protected readonly xTickMarks = computed(() => this.place(this.xTicks(), this.mapX()));

  protected readonly yTickMarks = computed(() => {
    const max = this.yMax();
    const inRange = this.yTicks().filter((t) => t.at >= 0 && t.at <= max);
    return this.place(inRange, this.mapY());
  });

  protected readonly placedMarkers = computed((): PlacedMarker[] => {
    const mx = this.mapX();
    const my = this.mapY();
    const { left, right } = this.plot();
    const out: PlacedMarker[] = [];
    for (const m of this.markers()) {
      const x = mx(m.x);
      const y = my(m.y);
      if (Number.isNaN(x) || Number.isNaN(y)) continue;
      const anchor = x - left < LABEL_EDGE ? 'start' : right - x < LABEL_EDGE ? 'end' : 'middle';
      out.push({
        x,
        y,
        hollow: m.shape === 'hollow',
        label: m.label ?? '',
        guide: m.guide ?? false,
        // Filled: a 6-unit square. Hollow: 8 plus half the 2-unit stroke.
        guideTop: y + (m.shape === 'hollow' ? 5 : 3),
        anchor,
        labelX: anchor === 'start' ? x - 4 : anchor === 'end' ? x + 4 : x,
      });
    }
    return out;
  });

  private place(ticks: readonly CurveTick[], map: (v: number) => number): PlacedTick[] {
    const out: PlacedTick[] = [];
    for (const t of ticks) {
      const pos = map(t.at);
      if (Number.isNaN(pos)) continue;
      out.push({ pos, label: t.label, major: t.major ?? t.label !== '' });
    }
    return out;
  }
}
