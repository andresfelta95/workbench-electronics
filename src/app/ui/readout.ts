import { Component, input } from '@angular/core';

/** One measured value. Instruments arrange these in a strip under the drawing. */
@Component({
  selector: 'app-readout',
  template: `
    <div class="readout" [attr.data-tone]="tone()">
      <span class="readout__label">{{ label() }}</span>
      <span class="readout__value">{{ value() }}</span>
      @if (note()) {
        <span class="readout__note">{{ note() }}</span>
      }
    </div>
  `,
  styles: `
    :host {
      display: block;
      background: var(--surface);
    }

    .readout {
      display: flex;
      flex-direction: column;
      gap: 3px;
      padding: 12px 14px;
      height: 100%;
    }

    .readout__label {
      font-family: var(--mono);
      font-size: 10px;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--faint);
    }

    .readout__value {
      font-family: var(--mono);
      font-size: 17px;
      font-weight: 500;
      color: var(--ink);
      font-variant-numeric: tabular-nums;
    }

    .readout__note {
      font-family: var(--mono);
      font-size: 10.5px;
      color: var(--muted);
    }

    [data-tone='accent'] .readout__value {
      color: var(--copper);
    }

    [data-tone='signal'] .readout__value {
      color: var(--signal);
    }

    [data-tone='warn'] .readout__value {
      color: var(--warn);
    }

    [data-tone='danger'] .readout__value {
      color: var(--danger);
    }
  `,
})
export class Readout {
  readonly label = input.required<string>();
  readonly value = input.required<string>();
  readonly note = input('');
  readonly tone = input<'plain' | 'accent' | 'signal' | 'warn' | 'danger'>('plain');
}
