import { Component, computed, inject, input, linkedSignal, signal } from '@angular/core';
import { I18n } from '../../core/i18n';
import { formatSI, parseValue } from '../../core/format';
import { SCHEMATIC } from '../../schematic/schematic';
import { Control } from '../../ui/control';
import { Panel } from '../../ui/panel';
import { Readout } from '../../ui/readout';

type Mode = 'series' | 'parallel';

interface Placement {
  index: number;
  x: number;
  y: number;
  vertical: boolean;
  value: number;
  current: number;
  power: number;
}

const MAX_RESISTORS = 4;
const MIN_RESISTORS = 2;

/**
 * Builds a network and redraws the schematic from it. Watching the equivalent
 * value stay above the largest resistor in series, and below the smallest in
 * parallel, is the check the lesson asks the reader to internalise.
 */
@Component({
  selector: 'app-resistor-network',
  imports: [...SCHEMATIC, Panel, Control, Readout],
  template: `
    <app-panel [heading]="heading()">
      <div panelFigure class="figure">
        <sch-canvas [w]="canvasWidth()" [h]="13" [label]="heading()">
          @for (wire of wires(); track $index) {
            <svg:g schWire [d]="wire" [flow]="flow()" />
          }
          <svg:g schSource [x]="4" [y]="3" [value]="text(supply(), 'V')" />
          <svg:g schGround [x]="4" [y]="10" />
          @for (part of placements(); track part.index) {
            <svg:g
              schResistor
              [x]="part.x"
              [y]="part.y"
              [vertical]="part.vertical"
              [name]="'R' + (part.index + 1)"
              [value]="text(part.value, 'Ω')"
            />
          }
        </sch-canvas>
      </div>

      <div panelControls>
        <fieldset class="modes">
          <legend>{{ t().widget.arrangement }}</legend>
          @for (option of modes; track option.key) {
            <label class="mode" [class.mode--on]="mode() === option.key">
              <input
                type="radio"
                name="network-mode"
                [checked]="mode() === option.key"
                (change)="mode.set(option.key)"
              />
              {{ option.label() }}
            </label>
          }
        </fieldset>

        <app-control [label]="t().widget.supply" unit="V" [min]="1" [max]="24" [(value)]="supply" />

        @for (value of values(); track $index; let i = $index) {
          <app-control
            [label]="'R' + (i + 1)"
            unit="Ω"
            [min]="10"
            [max]="1000000"
            [log]="true"
            [e24]="true"
            [value]="value"
            (valueChange)="setResistor(i, $event)"
          />
        }

        <div class="actions">
          <button type="button" (click)="add()" [disabled]="values().length >= max">
            {{ t().widget.add }}
          </button>
          <button type="button" (click)="remove()" [disabled]="values().length <= min">
            {{ t().widget.remove }}
          </button>
        </div>
      </div>

      <div panelReadouts class="readouts">
        <app-readout [label]="t().widget.equivalent" [value]="text(total(), 'Ω')" tone="accent" />
        <app-readout [label]="t().widget.current" [value]="text(supplyCurrent(), 'A')" />
        <app-readout [label]="t().widget.power" [value]="text(totalPower(), 'W')" tone="signal" />
        @for (part of placements(); track part.index) {
          <app-readout
            [label]="t().widget.branch + ' R' + (part.index + 1)"
            [value]="text(part.current, 'A')"
            [note]="text(part.power, 'W')"
          />
        }
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

    .actions {
      display: flex;
      gap: 8px;
      border-top: 1px solid var(--rule);
      padding-top: 14px;
    }

    .actions button {
      font-family: var(--mono);
      font-size: 12px;
      border: 1px solid var(--rule);
      background: var(--bg);
      color: var(--ink);
      padding: 8px 12px;
      cursor: pointer;
    }

    .actions button:hover:not(:disabled) {
      border-color: var(--copper);
      color: var(--copper);
    }

    .actions button:disabled {
      color: var(--faint);
      cursor: not-allowed;
    }

    .readouts {
      display: flex;
      flex-wrap: wrap;
      gap: 1px;
      background: var(--rule);
      border-top: 1px solid var(--rule);
    }

    .readouts > * {
      flex: 1 1 150px;
    }
  `,
})
export class ResistorNetworkWidget {
  readonly props = input<Record<string, string>>({});

  private readonly i18n = inject(I18n);
  protected readonly t = this.i18n.t;

  protected readonly max = MAX_RESISTORS;
  protected readonly min = MIN_RESISTORS;

  protected readonly mode = signal<Mode>('series');
  protected readonly supply = linkedSignal(() => parseValue(this.props()['supply'], 9));
  protected readonly values = signal<number[]>([1000, 4700]);

  protected readonly modes: { key: Mode; label: () => string }[] = [
    { key: 'series', label: () => this.t().widget.series },
    { key: 'parallel', label: () => this.t().widget.parallel },
  ];

  protected readonly heading = computed(() =>
    this.mode() === 'series' ? 'R = R1 + R2 + …' : '1/R = 1/R1 + 1/R2 + …',
  );

  protected readonly total = computed(() => {
    const values = this.values();
    if (this.mode() === 'series') return values.reduce((sum, value) => sum + value, 0);
    const conductance = values.reduce((sum, value) => sum + 1 / value, 0);
    return conductance === 0 ? Infinity : 1 / conductance;
  });

  protected readonly supplyCurrent = computed(() => this.supply() / this.total());
  protected readonly totalPower = computed(() => this.supply() * this.supplyCurrent());

  protected readonly placements = computed<Placement[]>(() => {
    const values = this.values();
    const series = this.mode() === 'series';
    const supply = this.supply();
    const current = this.supplyCurrent();

    return values.map((value, index) => {
      const branchCurrent = series ? current : supply / value;
      return {
        index,
        x: series ? 9 + index * 7 : 10 + index * 6,
        y: 3,
        vertical: !series,
        value,
        current: branchCurrent,
        power: branchCurrent * branchCurrent * value,
      };
    });
  });

  protected readonly canvasWidth = computed(() => {
    const count = this.values().length;
    return this.mode() === 'series' ? 9 + count * 7 + 4 : 10 + count * 6 + 4;
  });

  /** Wires are rebuilt from the layout so the drawing always matches the state. */
  protected readonly wires = computed<string[]>(() => {
    const parts = this.placements();
    const rightEdge = (this.canvasWidth() - 3) * 10;
    const railY = 100;

    if (this.mode() === 'series') {
      const first = parts[0];
      const last = parts[parts.length - 1];
      const wires = [`M40 30 H${first.x * 10}`];
      for (let i = 0; i < parts.length - 1; i++) {
        wires.push(`M${parts[i].x * 10 + 50} 30 H${parts[i + 1].x * 10}`);
      }
      wires.push(`M${last.x * 10 + 50} 30 H${rightEdge} V${railY} H40 V75`);
      return wires;
    }

    const wires = [`M40 30 H${rightEdge}`, `M40 75 V${railY} H${rightEdge}`];
    for (const part of parts) {
      wires.push(`M${part.x * 10} 70 V${railY}`);
    }
    return wires;
  });

  protected readonly flow = computed(() => {
    const amps = this.supplyCurrent();
    if (!Number.isFinite(amps) || amps <= 0) return 0;
    return Math.min(1, Math.max(0.08, (Math.log10(amps) + 5) / 5));
  });

  protected setResistor(index: number, value: number): void {
    this.values.update((values) => values.map((current, i) => (i === index ? value : current)));
  }

  protected add(): void {
    this.values.update((values) => (values.length >= MAX_RESISTORS ? values : [...values, 10000]));
  }

  protected remove(): void {
    this.values.update((values) => (values.length <= MIN_RESISTORS ? values : values.slice(0, -1)));
  }

  protected text(value: number, unit: string): string {
    return formatSI(value, unit, this.i18n.lang());
  }
}
