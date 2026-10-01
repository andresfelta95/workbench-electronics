import { Component, computed, inject, input, linkedSignal, model } from '@angular/core';
import { I18n } from '../core/i18n';
import { formatSI, logFromSlider, parseValue, sliderFromLog, snapToE24 } from '../core/format';

const STEPS = 1000;

// Unique ids from a module counter. It is not reset per page: the prerenderer
// renders many routes in one process, so the static HTML may say ctl-5 where
// the client says ctl-0. That is harmless, because `id` and `for` are both
// bindings and hydration rewrites them together; the pairs always match.
let nextId = 0;

/**
 * A labelled control: a drag handle for exploring, and a text box for typing an
 * exact value. Both matter — dragging is how the intuition forms, typing is how
 * the lesson's worked example gets reproduced, and the text box is what makes
 * the instrument usable from a keyboard.
 *
 * Skin: the slider is a pixel fader (square cap, slot that fills as it travels);
 * the text box is an LCD field. Both stay native inputs.
 */
@Component({
  selector: 'app-control',
  template: `
    <div class="control">
      <div class="control__top">
        <label class="control__label" [attr.for]="id">{{ label() }}</label>
        <input
          #entryEl
          class="control__entry"
          type="text"
          inputmode="decimal"
          [id]="id + '-entry'"
          [attr.aria-label]="entryLabel()"
          [value]="entry()"
          (change)="commitText(entryEl.value)"
          (blur)="entry.set(display())"
        />
      </div>
      <input
        #rangeEl
        class="control__range"
        type="range"
        [id]="id"
        min="0"
        [max]="steps"
        step="1"
        [value]="position()"
        [style.--travel]="travel()"
        [attr.aria-label]="label()"
        [attr.aria-valuetext]="display()"
        (input)="commitSlider(rangeEl.valueAsNumber)"
      />
      <div class="control__bounds">
        <span>{{ format(min()) }}</span>
        <span>{{ format(max()) }}</span>
      </div>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }

    .control {
      display: flex;
      flex-direction: column;
      gap: var(--px);
      font-family: var(--pix-font);
    }

    .control__top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: calc(3 * var(--px));
    }

    .control__label {
      font-size: var(--pix-text);
      line-height: 1.1;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: var(--pix-muted);
    }

    /* LCD field: outlined, shaded glass, monospaced digits. */
    .control__entry {
      flex: none;
      width: calc(8ch + 6 * var(--px));
      min-height: 44px;
      padding: 0 calc(3 * var(--px));
      border: 0;
      border-radius: 0;
      font-family: var(--pix-font);
      font-size: var(--pix-text-lg);
      line-height: 1;
      text-align: right;
      font-variant-numeric: tabular-nums;
      background: var(--pix-lcd);
      color: var(--pix-lcd-ink);
      box-shadow:
        inset 0 0 0 var(--px) var(--pix-line),
        inset calc(3 * var(--px)) calc(3 * var(--px)) 0 0 var(--pix-lcd-shade);
    }

    /* Fader. The track fills up to the cap (--travel is bound per control). */
    .control__range {
      --track: linear-gradient(90deg, var(--pix-fill) 0 var(--travel, 0%), var(--pix-lcd) 0);
      -webkit-appearance: none;
      appearance: none;
      width: 100%;
      height: 44px;
      margin: 0;
      background: transparent;
      cursor: pointer;
    }

    .control__range::-webkit-slider-runnable-track {
      height: calc(4 * var(--px));
      background: var(--track);
      box-shadow: var(--pix-edge);
    }

    .control__range::-moz-range-track {
      height: calc(4 * var(--px));
      background: var(--track);
      box-shadow: var(--pix-edge);
    }

    .control__range::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: calc(8 * var(--px));
      height: calc(12 * var(--px));
      margin-top: calc(-4 * var(--px));
      border: 0;
      border-radius: 0;
      background: linear-gradient(var(--pix-line) 0 0) center / 50% var(--px) no-repeat, var(--pix-hi);
      box-shadow: var(--pix-raised), var(--pix-edge);
    }

    .control__range::-moz-range-thumb {
      width: calc(8 * var(--px));
      height: calc(12 * var(--px));
      border: 0;
      border-radius: 0;
      background: linear-gradient(var(--pix-line) 0 0) center / 50% var(--px) no-repeat, var(--pix-hi);
      box-shadow: var(--pix-raised), var(--pix-edge);
    }

    .control__range:active::-webkit-slider-thumb {
      box-shadow: var(--pix-sunken), var(--pix-edge);
    }

    .control__range:active::-moz-range-thumb {
      box-shadow: var(--pix-sunken), var(--pix-edge);
    }

    .control__bounds {
      display: flex;
      justify-content: space-between;
      font-size: var(--pix-text-sm);
      line-height: 1;
      color: var(--pix-muted);
    }

    @media (forced-colors: active) {
      .control__entry {
        border: var(--px) solid FieldText;
      }

      .control__range {
        -webkit-appearance: auto;
        appearance: auto;
      }
    }
  `,
})
export class Control {
  readonly label = input.required<string>();
  readonly unit = input('');
  readonly min = input.required<number>();
  readonly max = input.required<number>();
  readonly value = model.required<number>();
  /** Logarithmic travel — right for resistance, wrong for a supply voltage. */
  readonly log = input(false);
  /** Snap to the E24 series, so the instrument only shows buyable values. */
  readonly e24 = input(false);

  private readonly i18n = inject(I18n);

  protected readonly steps = STEPS;
  protected readonly id = `ctl-${nextId++}`;

  /** The slider carries the plain label; the box needs a name of its own. */
  protected readonly entryLabel = computed(
    () => `${this.label()}, ${this.i18n.t().widget.exactValue}`,
  );

  protected readonly display = computed(() => this.format(this.value()));
  /** Follows the value while dragging, but holds whatever is being typed. */
  protected readonly entry = linkedSignal(() => this.display());

  protected readonly position = computed(() => {
    const value = this.value();
    const fraction = this.log()
      ? sliderFromLog(value, this.min(), this.max())
      : (value - this.min()) / (this.max() - this.min());
    return Math.round(Math.min(1, Math.max(0, fraction)) * STEPS);
  });

  /** How far the fader slot is lit, for the track gradient. */
  protected readonly travel = computed(() => `${(this.position() / STEPS) * 100}%`);

  protected format(value: number): string {
    return formatSI(value, this.unit(), this.i18n.lang());
  }

  protected commitSlider(position: number): void {
    const fraction = position / STEPS;
    const raw = this.log()
      ? logFromSlider(fraction, this.min(), this.max())
      : this.min() + fraction * (this.max() - this.min());
    this.set(raw);
  }

  protected commitText(text: string): void {
    const parsed = parseValue(text.replace(/[^\d.,pnuµmkKMG-]/g, '').replace(',', '.'), NaN);
    if (Number.isFinite(parsed)) this.set(parsed);
    this.entry.set(this.display());
  }

  private set(raw: number): void {
    let next = Math.min(this.max(), Math.max(this.min(), raw));
    if (this.e24()) next = Math.min(this.max(), Math.max(this.min(), snapToE24(next)));
    else next = Number(next.toPrecision(3));
    this.value.set(next);
    this.entry.set(this.format(next));
  }
}
