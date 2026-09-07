import { Component, computed, inject, input, linkedSignal, model } from '@angular/core';
import { I18n } from '../core/i18n';
import { formatSI, logFromSlider, parseValue, sliderFromLog, snapToE24 } from '../core/format';

const STEPS = 1000;

// Deterministic ids: server and client instantiate controls in the same order,
// so a counter keeps label/for pairs stable across hydration.
let nextId = 0;

/**
 * A labelled control: a drag handle for exploring, and a text box for typing an
 * exact value. Both matter — dragging is how the intuition forms, typing is how
 * the lesson's worked example gets reproduced, and the text box is what makes
 * the instrument usable from a keyboard.
 */
@Component({
  selector: 'app-control',
  template: `
    <div class="control">
      <div class="control__top">
        <label class="control__label" [attr.for]="id">{{ label() }}</label>
        <input
          class="control__entry"
          type="text"
          inputmode="decimal"
          [id]="id + '-entry'"
          [attr.aria-label]="label()"
          [value]="entry()"
          (change)="commitText($any($event.target).value)"
          (blur)="entry.set(display())"
        />
      </div>
      <input
        class="control__range"
        type="range"
        [id]="id"
        min="0"
        [max]="steps"
        step="1"
        [value]="position()"
        [attr.aria-label]="label()"
        [attr.aria-valuetext]="display()"
        (input)="commitSlider(+$any($event.target).value)"
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
      gap: 7px;
    }

    .control__top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
    }

    .control__label {
      font-family: var(--mono);
      font-size: 11px;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: var(--muted);
    }

    .control__entry {
      width: 9.5ch;
      text-align: right;
      font-family: var(--mono);
      font-size: 13.5px;
      font-variant-numeric: tabular-nums;
      background: var(--bg);
      border: 1px solid var(--rule);
      color: var(--ink);
      padding: 4px 7px;
    }

    .control__entry:focus-visible {
      border-color: var(--copper);
    }

    .control__range {
      -webkit-appearance: none;
      appearance: none;
      width: 100%;
      height: 22px;
      background: transparent;
      cursor: grab;
      margin: 0;
    }

    .control__range:active {
      cursor: grabbing;
    }

    .control__range::-webkit-slider-runnable-track {
      height: 2px;
      background: var(--rule-strong);
    }

    .control__range::-moz-range-track {
      height: 2px;
      background: var(--rule-strong);
    }

    .control__range::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 14px;
      height: 14px;
      margin-top: -6px;
      border-radius: 50%;
      background: var(--copper);
      border: 2px solid var(--surface);
    }

    .control__range::-moz-range-thumb {
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background: var(--copper);
      border: 2px solid var(--surface);
    }

    .control__bounds {
      display: flex;
      justify-content: space-between;
      font-family: var(--mono);
      font-size: 10px;
      color: var(--faint);
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
