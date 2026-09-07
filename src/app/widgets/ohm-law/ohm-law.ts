import { Component, computed, inject, input, linkedSignal, signal } from '@angular/core';
import { I18n } from '../../core/i18n';
import { formatSI, parseValue } from '../../core/format';
import { SCHEMATIC } from '../../schematic/schematic';
import { Control } from '../../ui/control';
import { Panel } from '../../ui/panel';
import { Readout } from '../../ui/readout';

type Unknown = 'i' | 'v' | 'r';

/**
 * V = I × R with one of the three held as the result. Fixing which quantity is
 * derived is the point: reading the law in all three directions is what turns it
 * from a formula into something you can use.
 */
@Component({
  selector: 'app-ohm-law',
  imports: [...SCHEMATIC, Panel, Control, Readout],
  template: `
    <app-panel [heading]="heading">
      <div panelFigure class="figure">
        <sch-canvas [w]="29" [h]="15" [label]="heading">
          <svg:g schWire d="M40 40 H100" [flow]="flow()" />
          <svg:g schWire d="M150 40 H250 V130 H40 V85" [flow]="flow()" />
          <svg:g schSource [x]="4" [y]="4" [value]="voltageText()" [highlight]="unknown() === 'v'" />
          <svg:g
            schResistor
            [x]="10"
            [y]="4"
            name="R"
            [value]="resistanceText()"
            [highlight]="unknown() === 'r'"
          />
          <svg:g schLabel [x]="20" [y]="11.2" [text]="currentText()" [accent]="true" anchor="middle" />
        </sch-canvas>
      </div>

      <div panelControls>
        <fieldset class="modes">
          <legend>{{ t().widget.solveFor }}</legend>
          @for (option of options; track option.key) {
            <label class="mode" [class.mode--on]="unknown() === option.key">
              <input
                type="radio"
                name="ohm-unknown"
                [value]="option.key"
                [checked]="unknown() === option.key"
                (change)="setUnknown(option.key)"
              />
              {{ option.label() }}
            </label>
          }
        </fieldset>

        @if (unknown() !== 'v') {
          <app-control
            [label]="t().widget.voltage"
            unit="V"
            [min]="0.1"
            [max]="48"
            [(value)]="v"
          />
        }
        @if (unknown() !== 'r') {
          <app-control
            [label]="t().widget.resistance"
            unit="Ω"
            [min]="1"
            [max]="1000000"
            [log]="true"
            [e24]="true"
            [(value)]="r"
          />
        }
        @if (unknown() !== 'i') {
          <app-control
            [label]="t().widget.current"
            unit="A"
            [min]="0.00001"
            [max]="2"
            [log]="true"
            [(value)]="i"
          />
        }
      </div>

      <div panelReadouts class="readouts">
        <app-readout
          [label]="t().widget.voltage"
          [value]="voltageText()"
          [tone]="unknown() === 'v' ? 'accent' : 'plain'"
        />
        <app-readout
          [label]="t().widget.current"
          [value]="currentText()"
          [tone]="unknown() === 'i' ? 'accent' : 'plain'"
        />
        <app-readout
          [label]="t().widget.resistance"
          [value]="resistanceText()"
          [tone]="unknown() === 'r' ? 'accent' : 'plain'"
        />
        <app-readout
          [label]="t().widget.power"
          [value]="powerText()"
          [note]="powerNote()"
          [tone]="power() > 0.25 ? 'danger' : 'signal'"
        />
      </div>
    </app-panel>
  `,
  styles: `
    :host {
      display: block;
    }

    .figure {
      width: 100%;
    }

    .modes {
      border: none;
      margin: 0;
      padding: 0;
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }

    .modes legend {
      font-family: var(--mono);
      font-size: 11px;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: var(--muted);
      padding: 0 0 7px;
    }

    .mode {
      font-family: var(--mono);
      font-size: 12px;
      border: 1px solid var(--rule);
      padding: 6px 11px;
      cursor: pointer;
      color: var(--muted);
      background: var(--bg);
    }

    .mode:hover {
      border-color: var(--rule-strong);
    }

    .mode--on {
      border-color: var(--copper);
      color: var(--copper);
      background: var(--copper-soft);
    }

    .mode input {
      position: absolute;
      opacity: 0;
      width: 0;
      height: 0;
    }

    .mode:focus-within {
      outline: 2px solid var(--copper);
      outline-offset: 2px;
    }

    .readouts {
      display: grid;
      gap: 1px;
      background: var(--rule);
      border-top: 1px solid var(--rule);
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    }
  `,
})
export class OhmLawWidget {
  readonly props = input<Record<string, string>>({});

  private readonly i18n = inject(I18n);
  protected readonly t = this.i18n.t;

  protected readonly unknown = signal<Unknown>('i');

  protected readonly options: { key: Unknown; label: () => string }[] = [
    { key: 'i', label: () => this.t().widget.current },
    { key: 'v', label: () => this.t().widget.voltage },
    { key: 'r', label: () => this.t().widget.resistance },
  ];

  // Seeded from the lesson's directive, then owned by the reader. Whichever
  // quantity is currently the unknown is derived rather than read from state.
  protected readonly v = linkedSignal(() => parseValue(this.props()['v'], 9));
  protected readonly r = linkedSignal(() => parseValue(this.props()['r'], 470));
  protected readonly i = linkedSignal(() => parseValue(this.props()['i'], 0.02));

  protected readonly voltage = computed(() =>
    this.unknown() === 'v' ? this.i() * this.r() : this.v(),
  );
  protected readonly resistance = computed(() =>
    this.unknown() === 'r' ? this.v() / this.i() : this.r(),
  );
  protected readonly current = computed(() =>
    this.unknown() === 'i' ? this.v() / this.r() : this.i(),
  );

  protected readonly power = computed(() => this.voltage() * this.current());

  protected readonly heading = 'V = I \u00d7 R';

  /**
   * Freezes what is on screen into state before changing which quantity is
   * derived, so switching the unknown never makes the numbers jump.
   */
  protected setUnknown(next: Unknown): void {
    const voltage = this.voltage();
    const current = this.current();
    const resistance = this.resistance();
    this.v.set(voltage);
    this.i.set(current);
    this.r.set(resistance);
    this.unknown.set(next);
  }

  protected readonly voltageText = computed(() => this.fmt(this.voltage(), 'V'));
  protected readonly currentText = computed(() => this.fmt(this.current(), 'A'));
  protected readonly resistanceText = computed(() => this.fmt(this.resistance(), 'Ω'));
  protected readonly powerText = computed(() => this.fmt(this.power(), 'W'));

  /** Flags the moment the numbers stop being survivable by a common part. */
  protected readonly powerNote = computed(() => {
    const watts = this.power();
    if (watts > 0.25) return '> 1/4 W';
    if (watts > 0.1) return '> 1/10 W';
    return '';
  });

  /** Log-scaled so the animation reads across five decades of current. */
  protected readonly flow = computed(() => {
    const amps = this.current();
    if (!Number.isFinite(amps) || amps <= 0) return 0;
    return Math.min(1, Math.max(0.08, (Math.log10(amps) + 5) / 5));
  });

  private fmt(value: number, unit: string): string {
    return formatSI(value, unit, this.i18n.lang());
  }
}
