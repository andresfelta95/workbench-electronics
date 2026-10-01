import { Component, computed, input } from '@angular/core';

export type ReadoutTone = 'plain' | 'accent' | 'signal' | 'warn' | 'danger';

/**
 * Pixel glyphs on a 7×7 grid, one per tone, so a tone change is visible
 * without colour: arrow = the answer, dot = nominal, triangle = caution,
 * cross = out of bounds. Drawn as rect runs so they stay crisp at any --px.
 */
const GLYPHS: Record<ReadoutTone, string> = {
  plain: '',
  accent: 'M1 0h2v7H1zM3 1h1v5H3zM4 2h1v3H4zM5 3h1v1H5z',
  signal: 'M2 1h3v5H2zM1 2h5v3H1z',
  warn: 'M3 0h1v2H3zM2 2h3v2H2zM1 4h5v2H1zM0 6h7v1H0z',
  danger:
    'M0 0h2v1H0zM5 0h2v1H5zM1 1h2v1H1zM4 1h2v1H4zM2 2h3v3H2zM1 5h2v1H1zM4 5h2v1H4zM0 6h2v1H0zM5 6h2v1H5z',
};

/**
 * One measured value, shown as an LCD window. Instruments arrange these in the
 * panel's readout bay, under the drawing.
 */
@Component({
  selector: 'app-readout',
  template: `
    <div class="readout" [attr.data-tone]="tone()">
      <span class="readout__label">{{ label() }}</span>
      <span class="readout__value">
        @if (glyph()) {
          <svg
            class="readout__flag"
            viewBox="0 0 7 7"
            shape-rendering="crispEdges"
            aria-hidden="true"
            focusable="false"
          >
            <path [attr.d]="glyph()" />
          </svg>
        }
        {{ value() }}
      </span>
      @if (note()) {
        <span class="readout__note">{{ note() }}</span>
      }
    </div>
  `,
  styles: `
    :host {
      display: block;
      min-width: 0;
    }

    /* LCD window: dark bezel line, shaded glass along the top-left. */
    .readout {
      display: flex;
      flex-direction: column;
      gap: calc(2 * var(--px));
      height: 100%;
      padding: calc(4 * var(--px)) calc(4 * var(--px)) calc(4 * var(--px)) calc(5 * var(--px));
      background: var(--pix-lcd);
      color: var(--pix-lcd-ink);
      font-family: var(--pix-font);
      box-shadow:
        inset 0 0 0 var(--px) var(--pix-line),
        inset calc(3 * var(--px)) calc(3 * var(--px)) 0 0 var(--pix-lcd-shade);
    }

    .readout__label {
      font-size: var(--pix-text-sm);
      line-height: 1;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: var(--pix-lcd-muted);
    }

    .readout__value {
      display: flex;
      align-items: center;
      gap: calc(3 * var(--px));
      font-size: var(--pix-text-xl);
      line-height: 1;
      font-variant-numeric: tabular-nums;
      white-space: nowrap;
    }

    .readout__flag {
      flex: none;
      width: calc(7 * var(--px));
      height: calc(7 * var(--px));
      fill: currentColor;
    }

    .readout__note {
      font-size: var(--pix-text);
      line-height: 1;
      color: var(--pix-lcd-muted);
    }

    [data-tone='accent'] .readout__value {
      color: var(--pix-accent);
    }

    [data-tone='signal'] .readout__value {
      color: var(--pix-signal);
    }

    [data-tone='warn'] .readout__value {
      color: var(--pix-warn);
    }

    [data-tone='danger'] .readout__value {
      color: var(--pix-danger);
    }

    @media (forced-colors: active) {
      .readout {
        border: var(--px) solid CanvasText;
      }
    }
  `,
})
export class Readout {
  readonly label = input.required<string>();
  readonly value = input.required<string>();
  readonly note = input('');
  readonly tone = input<ReadoutTone>('plain');

  protected readonly glyph = computed(() => GLYPHS[this.tone()]);
}
