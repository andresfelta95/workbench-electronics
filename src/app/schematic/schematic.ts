import { Component, computed, Directive, input } from '@angular/core';

/**
 * Schematic primitives.
 *
 * Circuits are drawn as components on a 10-unit grid rather than as images, so
 * the prose can highlight a part, values can update live, and the whole thing
 * inherits `currentColor` — which means one drawing works in both themes.
 *
 * Symbols are attribute selectors on `svg:g` so they stay valid SVG.
 *
 * Pixel skin: the canvas renders with `crispEdges`, strokes are whole units
 * with square caps and mitred joins, junctions and terminals are squares, and
 * current flow moves in discrete steps. Colours come from the `--pix-*` tokens
 * when the canvas sits inside a panel, and fall back to the prose tokens when
 * it does not.
 */

export const GRID = 10;

@Component({
  selector: 'sch-canvas',
  template: `
    <svg
      [attr.viewBox]="viewBox()"
      [attr.aria-label]="label()"
      [attr.role]="label() ? 'img' : 'presentation'"
      preserveAspectRatio="xMidYMid meet"
    >
      <ng-content />
    </svg>
  `,
  styles: `
    :host {
      display: block;
      color: var(--pix-screen-ink, var(--ink));
    }
    svg {
      width: 100%;
      height: auto;
      overflow: visible;
      shape-rendering: crispEdges;
    }
  `,
})
export class SchCanvas {
  /** Width and height in grid units. */
  readonly w = input.required<number>();
  readonly h = input.required<number>();
  readonly label = input<string>('');

  protected readonly viewBox = computed(() => `0 0 ${this.w() * GRID} ${this.h() * GRID}`);
}

/** Shared placement + emphasis behaviour for every symbol. */
@Directive()
abstract class SchSymbol {
  readonly x = input(0);
  readonly y = input(0);
  readonly dim = input(false);
  readonly highlight = input(false);

  readonly transform = computed(() => `translate(${this.x() * GRID} ${this.y() * GRID})`);
  readonly klass = computed(() =>
    ['sch', this.dim() ? 'sch--dim' : '', this.highlight() ? 'sch--hot' : ''].join(' ').trim(),
  );
}

const SYMBOL_STYLES = `
  :host {
    display: contents;
  }
  .stroke,
  .fill {
    transition: opacity 160ms steps(2, end);
  }
  /* Dimming fades the drawing, never the text: dimmed strokes keep at least
     3:1 on the screen, and dimmed labels switch to the muted ink (at least
     6.5:1) instead of going transparent. */
  .sch--dim .stroke,
  .sch--dim .fill {
    opacity: 0.55;
  }
  .sch--dim .label,
  .sch--dim .accent {
    fill: var(--pix-screen-muted, var(--muted));
  }
  @media (prefers-reduced-motion: reduce) {
    .stroke,
    .fill {
      transition: none;
    }
  }
  .stroke {
    fill: none;
    stroke: currentColor;
    stroke-width: 2;
    stroke-linecap: square;
    stroke-linejoin: miter;
  }
  .fill {
    fill: currentColor;
  }
  .sch--hot {
    color: var(--pix-hot, var(--copper));
  }
  /* 4, not 3: an even width on whole-unit coordinates keeps both edges on
     unit boundaries, so crispEdges cannot round it to 2 or 4 unpredictably. */
  .sch--hot .stroke {
    stroke-width: 4;
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
  .sch--hot .value {
    fill: currentColor;
  }
`;

/**
 * IEC box resistor. Horizontal: 5 grid units long, pins at (0, 0) and (50, 0),
 * a 30 × 18 body from x = 10 to 40. Vertical: 4 grid units long, pins at (0, 0)
 * and (0, 40), an 18 × 20 body from y = 10 to 30. Each lead ends on the grid
 * line where the body's edge starts, so lead and body always meet.
 */
@Component({
  selector: 'svg:g[schResistor]',
  template: `
    <svg:g [attr.transform]="transform()" [attr.class]="klass()">
      <svg:path class="stroke" [attr.d]="path()" />
      @if (vertical()) {
        <svg:text class="label" x="14" y="17">{{ name() }}</svg:text>
        <svg:text class="value" x="14" y="29">{{ value() }}</svg:text>
      } @else {
        <svg:text class="label" x="25" y="-14" text-anchor="middle">{{ name() }}</svg:text>
        <svg:text class="value" x="25" y="26" text-anchor="middle">{{ value() }}</svg:text>
      }
    </svg:g>
  `,
  styles: SYMBOL_STYLES,
})
export class SchResistor extends SchSymbol {
  readonly name = input('R');
  readonly value = input('');
  readonly vertical = input(false);

  protected readonly path = computed(() =>
    this.vertical()
      ? 'M0 0 v10 M-9 10 h18 v20 h-18 z M0 30 v10'
      : 'M0 0 h10 M10 -9 h30 v18 h-30 z M40 0 h10',
  );
}

/** Capacitor: two plates, drawn vertically with pins top and bottom. */
@Component({
  selector: 'svg:g[schCapacitor]',
  template: `
    <svg:g [attr.transform]="transform()" [attr.class]="klass()">
      <svg:path class="stroke" d="M0 0 v14 M-11 14 h22 M-11 22 h22 M0 22 v14" />
      <svg:text class="label" x="16" y="16">{{ name() }}</svg:text>
      <svg:text class="value" x="16" y="28">{{ value() }}</svg:text>
    </svg:g>
  `,
  styles: SYMBOL_STYLES,
})
export class SchCapacitor extends SchSymbol {
  readonly name = input('C');
  readonly value = input('');
}

/** DC source: long plate positive, short plate negative, pins top and bottom. */
@Component({
  selector: 'svg:g[schSource]',
  template: `
    <svg:g [attr.transform]="transform()" [attr.class]="klass()">
      <svg:path class="stroke" d="M0 0 v12 M-12 12 h24 M-6 19 h12 M-12 26 h24 M-6 33 h12 M0 33 v12" />
      <svg:text class="label" x="-18" y="8" text-anchor="end">+</svg:text>
      <svg:text class="value" x="18" y="26">{{ value() }}</svg:text>
    </svg:g>
  `,
  styles: SYMBOL_STYLES,
})
export class SchSource extends SchSymbol {
  readonly value = input('');
}

@Component({
  selector: 'svg:g[schGround]',
  template: `
    <svg:g [attr.transform]="transform()" [attr.class]="klass()">
      <svg:path class="stroke" d="M0 0 v8 M-11 8 h22 M-7 14 h14 M-3 20 h6" />
    </svg:g>
  `,
  styles: SYMBOL_STYLES,
})
export class SchGround extends SchSymbol {}

/** Open terminal: a labelled node you would clip a probe to. Drawn as a hollow square pad. */
@Component({
  selector: 'svg:g[schTerminal]',
  template: `
    <svg:g [attr.transform]="transform()" [attr.class]="klass()">
      <svg:rect class="stroke" x="-4" y="-4" width="8" height="8" />
      <svg:text class="label" [attr.x]="right() ? 10 : -10" [attr.text-anchor]="right() ? 'start' : 'end'" y="4">
        {{ name() }}
      </svg:text>
    </svg:g>
  `,
  styles: SYMBOL_STYLES,
})
export class SchTerminal extends SchSymbol {
  readonly name = input('');
  readonly right = input(false);
}

/** Solid dot (a square pixel block) marking a real electrical junction, as opposed to a crossing. */
@Component({
  selector: 'svg:g[schJunction]',
  template: `
    <svg:g [attr.transform]="transform()" [attr.class]="klass()">
      <svg:rect class="fill" x="-3" y="-3" width="6" height="6" />
    </svg:g>
  `,
  styles: SYMBOL_STYLES,
})
export class SchJunction extends SchSymbol {}

export type SchDirection = 'right' | 'down' | 'left' | 'up';

const ROTATION: Record<SchDirection, number> = { right: 0, down: 90, left: 180, up: 270 };

/**
 * Current arrow: a pixel arrowhead sat on a wire, pointing the way
 * conventional current actually flows, with its name beside it. Place it on
 * the wire at (x, y); a widget flips `dir` with the sign of the current, so
 * the drawing never claims a direction the numbers contradict.
 *
 * The head is a 12 × 12 staircase of 2-unit columns, so it stays crisp at any
 * of the four quarter turns. `off` (no current) drops the head and keeps the
 * name, because a branch with no current has no direction to show.
 */
@Component({
  selector: 'svg:g[schCurrent]',
  template: `
    <svg:g [attr.transform]="transform()" [attr.class]="klass()">
      @if (!off()) {
        <svg:path
          class="fill"
          [attr.transform]="'rotate(' + rotation() + ')'"
          d="M-6 -6h2v12h-2z M-4 -5h2v10h-2z M-2 -4h2v8h-2z M0 -3h2v6h-2z M2 -2h2v4h-2z M4 -1h2v2h-2z"
        />
      }
      @if (vertical()) {
        <svg:text class="label" x="10" y="5">{{ name() }}</svg:text>
      } @else {
        <svg:text class="label" x="0" y="-12" text-anchor="middle">{{ name() }}</svg:text>
      }
    </svg:g>
  `,
  styles: SYMBOL_STYLES,
})
export class SchCurrent extends SchSymbol {
  readonly dir = input<SchDirection>('right');
  readonly name = input('I');
  readonly off = input(false);

  protected readonly rotation = computed(() => ROTATION[this.dir()]);
  /** A vertical wire takes its label to the right; a horizontal one, above. */
  protected readonly vertical = computed(() => this.dir() === 'up' || this.dir() === 'down');
}

/**
 * A wire. `d` is an ordinary SVG path in grid units multiplied by GRID by the
 * caller, and `flow` animates a dashed overlay along it at a speed proportional
 * to the current — the cheapest way to make a current path legible.
 *
 * The dashes are square blocks (4 on, 10 off, butt caps) that jump 4 units per
 * step instead of gliding: steps(7) over a 28-unit cycle, i.e. two dash periods,
 * so the loop is seamless.
 */
@Component({
  selector: 'svg:g[schWire]',
  template: `
    <svg:g [attr.class]="klass()">
      <svg:path class="stroke" [attr.d]="d()" />
      @if (flow() > 0) {
        <svg:path
          class="flow"
          [attr.d]="d()"
          [style.animation-duration.s]="duration()"
        />
      }
    </svg:g>
  `,
  styles: `
    ${SYMBOL_STYLES}
    .flow {
      fill: none;
      stroke: var(--pix-flow, var(--copper));
      stroke-width: 4;
      stroke-linecap: butt;
      stroke-linejoin: miter;
      stroke-dasharray: 4 10;
      animation-name: sch-flow;
      animation-timing-function: steps(7, end);
      animation-iteration-count: infinite;
    }
    @keyframes sch-flow {
      to {
        stroke-dashoffset: -28;
      }
    }
    @media (prefers-reduced-motion: reduce) {
      .flow {
        animation: none;
      }
    }
  `,
})
export class SchWire extends SchSymbol {
  readonly d = input.required<string>();
  /** Normalised 0..1 current; 0 hides the animation entirely. */
  readonly flow = input(0);

  protected readonly duration = computed(() => {
    const normalised = Math.min(1, Math.max(0, this.flow()));
    return normalised <= 0 ? 0 : 2.4 - normalised * 2;
  });
}

@Component({
  selector: 'svg:g[schLabel]',
  template: `
    <svg:g [attr.transform]="transform()" [attr.class]="klass()">
      <svg:text [attr.class]="accent() ? 'accent' : 'label'" [attr.text-anchor]="anchor()">
        {{ text() }}
      </svg:text>
    </svg:g>
  `,
  styles: `
    ${SYMBOL_STYLES}
    .accent {
      font-family: var(--pix-font, var(--mono));
      font-size: var(--pix-sch-text, 10px);
      fill: var(--pix-hot, var(--copper));
    }
  `,
})
export class SchLabel extends SchSymbol {
  readonly text = input('');
  readonly accent = input(false);
  readonly anchor = input<'start' | 'middle' | 'end'>('start');
}

export const SCHEMATIC = [
  SchCanvas,
  SchResistor,
  SchCapacitor,
  SchSource,
  SchGround,
  SchTerminal,
  SchJunction,
  SchCurrent,
  SchWire,
  SchLabel,
] as const;
