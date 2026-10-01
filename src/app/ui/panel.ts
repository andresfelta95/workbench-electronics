import { Component, computed, input } from '@angular/core';

/** One run of nameplate text. An `accent` run is set in inverse video, to
 *  point at the term that changed (the loaded divider's R2||RL, for one). */
export interface PanelHeadingPart {
  readonly text: string;
  readonly accent?: boolean;
}

function toParts(heading: string | readonly PanelHeadingPart[]): readonly PanelHeadingPart[] {
  if (typeof heading !== 'string') return heading;
  return heading ? [{ text: heading }] : [];
}

/**
 * The shared frame every instrument sits in: caption, drawing, controls, readouts.
 *
 * It is also the root of the pixel-art skin: the host carries `.pix`, which is
 * where every `--pix-*` token and the `--px` unit are defined (see
 * `src/styles/_pixel.scss`). Anything projected into a panel inherits the skin.
 */
@Component({
  selector: 'app-panel',
  host: { class: 'pix' },
  template: `
    <section class="panel">
      @if (parts().length) {
        <header class="panel__head">
          <span class="panel__led" aria-hidden="true"></span>
          <h3 [class.panel__stack]="altParts().length > 0">
            @if (headingLabel()) {
              <span class="panel__spoken">{{ headingLabel() }}</span>
            }
            <span [attr.aria-hidden]="headingLabel() ? 'true' : null">
              @for (part of parts(); track $index) {
                <span [class.panel__accent]="part.accent">{{ part.text }}</span>
              }
            </span>
            @if (altParts().length) {
              <span class="panel__reserve" aria-hidden="true">
                @for (part of altParts(); track $index) {
                  <span [class.panel__accent]="part.accent">{{ part.text }}</span>
                }
              </span>
            }
          </h3>
          <span class="panel__grille" aria-hidden="true"></span>
          <ng-content select="[panelAction]" />
        </header>
      }
      <div class="panel__main">
        <div class="panel__figure"><ng-content select="[panelFigure]" /></div>
        <div class="panel__controls"><ng-content select="[panelControls]" /></div>
        <div class="panel__readouts"><ng-content select="[panelReadouts]" /></div>
      </div>
      <ng-content />
    </section>
  `,
  styles: `
    :host {
      display: block;
    }

    /* The case: raised bevel, notched outline, hard drop shadow. It is also the
       size container for the screen/controls split below, so the layout
       follows the instrument's own width, not the viewport's. */
    .panel {
      container: panel / inline-size;
      padding: var(--px);
      background: var(--pix-case);
      color: var(--pix-ink);
      font-family: var(--pix-font);
      box-shadow: var(--pix-raised), var(--pix-edge), var(--pix-drop);
    }

    /* Nameplate strip. The LED and the grille are decoration only. */
    .panel__head {
      display: flex;
      align-items: center;
      gap: calc(4 * var(--px));
      padding: calc(3 * var(--px)) calc(5 * var(--px));
      background: var(--pix-plate);
      color: var(--pix-plate-ink);
    }

    .panel__head h3 {
      min-width: 0;
      font-family: var(--pix-font);
      font-weight: 400;
      font-size: var(--pix-text-lg);
      line-height: 1;
      letter-spacing: 0.02em;
    }

    /* With an alternate heading, both forms share one grid cell and the
       inactive one is invisible, so the strip is always the size of the larger
       form and switching between them moves nothing below it. */
    .panel__stack {
      display: grid;
      align-items: center;
    }

    .panel__stack > :not(.panel__spoken) {
      grid-area: 1 / 1;
      min-width: 0;
    }

    .panel__reserve {
      visibility: hidden;
    }

    /* Inverse video, the terminal way to mark a term. It swaps the plate's two
       colours, so it has the heading's own contrast and needs no new token. */
    .panel__accent {
      background: var(--pix-plate-ink);
      color: var(--pix-plate);
    }

    /* The spoken form replaces the visible formula for assistive tech only. */
    .panel__spoken {
      position: absolute;
      width: 1px;
      height: 1px;
      overflow: hidden;
      clip-path: inset(50%);
      white-space: nowrap;
    }

    .panel__led {
      flex: none;
      width: calc(3 * var(--px));
      height: calc(3 * var(--px));
      background: var(--pix-led);
    }

    .panel__grille {
      flex: 1 1 0;
      min-width: 0;
      align-self: stretch;
      background: repeating-conic-gradient(var(--pix-plate-dither) 0 25%, transparent 0 50%) 0 0 /
        calc(2 * var(--px)) calc(2 * var(--px));
    }

    /* Narrow panels stack the screen over the controls. */
    .panel__main {
      display: grid;
    }

    /* The drawing sits on a recessed screen that hugs it: the screen is only
       as tall as the drawing, never stretched to the controls column. */
    .panel__figure {
      margin: calc(4 * var(--px));
      padding: calc(6 * var(--px)) calc(5 * var(--px));
      display: flex;
      align-items: center;
      justify-content: center;
      min-width: 0;
      background: var(--pix-screen);
      box-shadow: var(--pix-sunken), var(--pix-edge);
    }

    /* Engraved groove between screen and controls. */
    .panel__controls {
      padding: calc(5 * var(--px)) calc(6 * var(--px)) calc(7 * var(--px));
      min-width: 0;
      border-top: var(--px) solid var(--pix-lo);
      box-shadow: inset 0 var(--px) 0 var(--pix-hi);
    }

    /* Wide panels: the screen and the readout bay share the left column, the
       controls run down the right. The screen row is sized by the drawing
       alone (the controls span both rows and their extra height lands in the
       1fr row), so the screen always hugs the drawing; the bay stretches to
       the bottom, so no bare case is left under the screen. The left column
       gets the larger share, so the drawing is as big as the panel allows.
       DOM order, and therefore tab order, is unchanged. */
    @container panel (min-width: 680px) {
      .panel__main {
        grid-template-columns: minmax(0, 3fr) minmax(250px, 2fr);
        grid-template-rows: auto 1fr;
      }

      .panel__figure {
        grid-column: 1;
        grid-row: 1;
      }

      .panel__controls {
        grid-column: 2;
        grid-row: 1 / span 2;
        border-top: none;
        border-left: var(--px) solid var(--pix-lo);
        box-shadow: inset var(--px) 0 0 var(--pix-hi);
      }

      .panel__readouts {
        grid-column: 1;
        grid-row: 2;
      }
    }

    /* Readout bay: a dithered, sunken tray the LCD windows sit in. */
    .panel__readouts {
      margin: 0 calc(4 * var(--px)) calc(4 * var(--px));
      padding: calc(3 * var(--px));
      background: repeating-conic-gradient(var(--pix-lo) 0 25%, var(--pix-case) 0 50%) 0 0 /
        calc(2 * var(--px)) calc(2 * var(--px));
      box-shadow: var(--pix-sunken), var(--pix-edge);
    }

    .panel__readouts:empty {
      display: none;
    }

    @media (prefers-reduced-motion: reduce), (prefers-contrast: more) {
      .panel__grille {
        background: none;
      }

      .panel__readouts {
        background: var(--pix-lo);
      }
    }

    @media (forced-colors: active) {
      .panel,
      .panel__figure,
      .panel__readouts {
        border: var(--px) solid CanvasText;
      }

      .panel__head {
        border-bottom: var(--px) solid CanvasText;
      }

      .panel__accent {
        forced-color-adjust: none;
        background: CanvasText;
        color: Canvas;
      }
    }
  `,
})
export class Panel {
  /** Nameplate text: a plain string, or runs of text when one should be accented. */
  readonly heading = input<string | readonly PanelHeadingPart[]>('');
  /** Optional spoken form of the heading, for a formula whose symbols a screen
   *  reader would mangle. When set, the visible text is hidden from assistive tech. */
  readonly headingLabel = input('');
  /** Optional other form of the heading (the one not showing now). The strip
   *  reserves room for it, invisibly and hidden from assistive tech, so
   *  switching between the two never resizes the nameplate. */
  readonly headingAlt = input<string | readonly PanelHeadingPart[]>('');

  protected readonly parts = computed(() => toParts(this.heading()));
  protected readonly altParts = computed(() => toParts(this.headingAlt()));
}
