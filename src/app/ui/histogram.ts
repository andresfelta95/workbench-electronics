import { Component, computed, input } from '@angular/core';

import type { CurveTick } from './curve';

/** A range marked on the histogram, in data units: two dashed vertical rules
 *  at `lo` and `hi`, full plot height, with `label` centred above them. */
export interface HistogramBand {
  readonly lo: number;
  readonly hi: number;
  readonly label: string;
}

/** Units of the 10-unit grid, as the schematic canvas. */
const GRID = 10;

/** Room around the plot area, in SVG units: the band label above, the x title
 *  after the axis on the right and the tick labels below. Fixed, so a given
 *  w × h always has the same plot area whatever the data. At 31 × 11 the plot
 *  is x 16 … 280 (264 units: 66 bins of 4) and y 14 … 86. */
export const HISTOGRAM_MARGIN = { left: 16, right: 30, top: 14, bottom: 24 } as const;

/** Tick lengths below the axis. */
const MAJOR_TICK = 6;
const MINOR_TICK = 4;
/** Below the axis: tick labels' baseline. Beside it: the x title's baseline,
 *  which centres VT323's capitals on the axis line. */
const TICK_LABEL_DROP = 19;
const AXIS_TEXT_DROP = 5;
/** Above the plot: the band label's baseline, inside the top margin. */
const BAND_LABEL_RISE = 4;

interface PlacedTick {
  readonly pos: number;
  readonly label: string;
  readonly major: boolean;
}

interface PlacedBar {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

interface PlacedBand {
  readonly lo: number;
  readonly hi: number;
  readonly mid: number;
  readonly label: string;
}

/**
 * A minimal static histogram: equal-width bins as solid bars rising from a
 * linear x axis, ticks with caller-formatted labels, and an optional band of
 * two dashed vertical rules with a label. No y axis is drawn; the counts
 * belong in the spoken `label`. Nothing on it is interactive. A sibling of
 * `app-curve` rather than an extension of it (tolerance-spread brief, D-13):
 * it shares only the `CurveTick` shape.
 *
 * Pixel skin, as `app-curve`: `crispEdges`, stroke 2 with square caps (butt
 * for the dashes, so the gaps stay open), every coordinate a whole unit.
 * Colours come from the `--pix-*` screen tokens (ink for bars and title, muted
 * for axis, ticks, tick labels and the band), with the prose tokens as a
 * fallback outside a panel, so it follows both themes. Non-colour cue: bars
 * are solid, band rules dashed; in forced colours all turn `CanvasText`. The
 * viewBox is `w · 10 × h · 10`, so the SVG takes its height before any data
 * arrives (no layout shift).
 *
 * `label` is the spoken text equivalent (WCAG 1.1.1): the caller writes a
 * sentence with the headline numbers and updates it with them. It is set as
 * the `aria-label` of a `role="img"` SVG, with no live region.
 */
@Component({
  selector: 'app-histogram',
  template: `
    <svg
      [attr.viewBox]="viewBox()"
      [attr.aria-label]="label() || null"
      [attr.role]="label() ? 'img' : 'presentation'"
      [attr.aria-hidden]="label() ? null : 'true'"
      preserveAspectRatio="xMidYMid meet"
      focusable="false"
    >
      <!-- The axis first: its 2-unit stroke straddles y = bottom, and drawn
           later it would hide a 1-unit bar. The band last, so a bin that
           straddles an end cannot hide its rule. -->
      <path class="axis" [attr.d]="axisPath()" />
      @for (r of bars(); track $index) {
        <rect
          class="fill bar"
          [attr.x]="r.x"
          [attr.y]="r.y"
          [attr.width]="r.width"
          [attr.height]="r.height"
        />
      }
      @if (placedBand(); as b) {
        <path
          class="guide"
          [attr.d]="'M' + b.lo + ' ' + plot().top + ' V' + plot().bottom"
          stroke-dasharray="4 4"
        />
        <path
          class="guide"
          [attr.d]="'M' + b.hi + ' ' + plot().top + ' V' + plot().bottom"
          stroke-dasharray="4 4"
        />
        @if (b.label) {
          <text
            class="value"
            [attr.x]="b.mid"
            [attr.y]="plot().top - BAND_RISE"
            text-anchor="middle"
          >
            {{ b.label }}
          </text>
        }
      }
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
      @if (xTitle()) {
        <text class="label" [attr.x]="plot().right + MAJOR" [attr.y]="plot().bottom + AXIS_DROP">
          {{ xTitle() }}
        </text>
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
    .guide {
      fill: none;
      stroke-width: 2;
      stroke-linejoin: miter;
      stroke: var(--pix-screen-muted, var(--muted));
    }
    .axis {
      stroke-linecap: square;
    }
    /* Butt caps, or square caps would lengthen each dash and close the gaps. */
    .guide {
      stroke-linecap: butt;
    }
    .fill {
      fill: currentColor;
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
      .guide {
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
export class Histogram {
  /** Size in grid units (10 SVG units each), as `sch-canvas`. */
  readonly w = input.required<number>();
  readonly h = input.required<number>();
  /** The x range in data units, linear; the bins span it exactly. */
  readonly xMin = input.required<number>();
  readonly xMax = input.required<number>();
  /** Counts of equal-width bins spanning `xMin … xMax`, low to high. Counts
   *  that are not finite or not positive draw nothing; any positive count
   *  draws at least one unit. */
  readonly counts = input<readonly number[]>([]);
  /** The count at the plot's top; larger counts are clamped to it. ≤ 0 or not
   *  finite: no bars. */
  readonly yMax = input.required<number>();
  /** Ticks outside the x range or not finite are skipped. */
  readonly xTicks = input<readonly CurveTick[]>([]);
  /** Short visible title after the right end of the axis. */
  readonly xTitle = input('');
  /** Ends outside the x range are clamped to its edges; not finite: no band. */
  readonly band = input<HistogramBand | undefined>(undefined);
  /** The spoken text equivalent. Empty: the plot is decorative (hidden). */
  readonly label = input('');

  protected readonly MAJOR = MAJOR_TICK;
  protected readonly MINOR = MINOR_TICK;
  protected readonly TICK_DROP = TICK_LABEL_DROP;
  protected readonly AXIS_DROP = AXIS_TEXT_DROP;
  protected readonly BAND_RISE = BAND_LABEL_RISE;

  protected readonly viewBox = computed(() => `0 0 ${this.w() * GRID} ${this.h() * GRID}`);

  /** The plot area in SVG units, whole numbers. */
  protected readonly plot = computed(() => {
    const width = Math.round(this.w() * GRID);
    const height = Math.round(this.h() * GRID);
    return {
      left: HISTOGRAM_MARGIN.left,
      right: Math.max(HISTOGRAM_MARGIN.left, width - HISTOGRAM_MARGIN.right),
      top: HISTOGRAM_MARGIN.top,
      bottom: Math.max(HISTOGRAM_MARGIN.top, height - HISTOGRAM_MARGIN.bottom),
    };
  });

  /** The x axis only: bars rise from it, and no y axis is drawn. */
  protected readonly axisPath = computed(() => {
    const { left, right, bottom } = this.plot();
    return `M${left} ${bottom} H${right}`;
  });

  /** x in data units → fraction of the axis (unclamped), or NaN if the value
   *  or the range cannot be placed. */
  private readonly xFraction = computed(() => {
    const lo = this.xMin();
    const span = this.xMax() - lo;
    return (x: number) =>
      Number.isFinite(x) && Number.isFinite(span) && span > 0 ? (x - lo) / span : NaN;
  });

  private readonly fractionToX = computed(() => {
    const { left, right } = this.plot();
    return (f: number) => Math.round(left + f * (right - left));
  });

  /** Bin `i` of `n` spans round(left + i·W/n) to round(left + (i+1)·W/n). */
  protected readonly bars = computed((): PlacedBar[] => {
    const counts = this.counts();
    const max = this.yMax();
    const n = counts.length;
    if (!n || !Number.isFinite(max) || max <= 0) return [];
    const { left, right, top, bottom } = this.plot();
    const width = right - left;
    const height = bottom - top;
    const out: PlacedBar[] = [];
    for (let i = 0; i < n; i++) {
      const c = counts[i];
      if (!Number.isFinite(c) || c <= 0) continue;
      // At least one unit: a lone build (the furthest one, at 1 % where yMax
      // is ~310) must not round away.
      const barHeight = Math.max(1, Math.round(Math.min(1, c / max) * height));
      const x0 = Math.round(left + (i * width) / n);
      const x1 = Math.round(left + ((i + 1) * width) / n);
      if (x1 <= x0) continue;
      out.push({ x: x0, y: bottom - barHeight, width: x1 - x0, height: barHeight });
    }
    return out;
  });

  protected readonly xTickMarks = computed((): PlacedTick[] => {
    const frac = this.xFraction();
    const toX = this.fractionToX();
    const out: PlacedTick[] = [];
    for (const t of this.xTicks()) {
      const f = frac(t.at);
      // A hair of slack so the range's own ends survive floating-point rounding.
      if (Number.isNaN(f) || f < -1e-9 || f > 1 + 1e-9) continue;
      out.push({
        pos: toX(Math.min(1, Math.max(0, f))),
        label: t.label,
        major: t.major ?? t.label !== '',
      });
    }
    return out;
  });

  protected readonly placedBand = computed((): PlacedBand | null => {
    const band = this.band();
    if (!band) return null;
    const frac = this.xFraction();
    const toX = this.fractionToX();
    const a = frac(band.lo);
    const b = frac(band.hi);
    if (Number.isNaN(a) || Number.isNaN(b)) return null;
    const clamp = (f: number) => toX(Math.min(1, Math.max(0, f)));
    const lo = clamp(Math.min(a, b));
    const hi = clamp(Math.max(a, b));
    return { lo, hi, mid: Math.round((lo + hi) / 2), label: band.label };
  });
}
