import { Component, computed, inject, input, linkedSignal } from '@angular/core';
import { I18n } from '../../core/i18n';
import { formatPercent, formatSI, parseValue } from '../../core/format';
import { SCHEMATIC } from '../../schematic/schematic';
import { Control } from '../../ui/control';
import { Panel, type PanelHeadingPart } from '../../ui/panel';
import { Readout, type ReadoutTone } from '../../ui/readout';
import {
  type CurrentRange,
  errorTone,
  type MeterMode,
  meterFlow,
  parseMode,
  parseRange,
  solveAmmeter,
  solveVoltmeter,
} from './meter-loading-math';

// Same scheme as Control's ids: a module counter gives every instance its own
// radio group names, so the lesson's two instances never merge groups.
let nextId = 0;

/** The course's safety ceiling for anything it suggests building (ROADMAP §3.1). */
const V_MIN = 1;
const V_MAX = 24;
const R_MIN = 100;
const R_MAX = 10e6;
const RIN_MIN = 100e3;
const RIN_MAX = 1e9;
const RLOAD_MIN = 10;
const RLOAD_MAX = 1e6;

/** What a real meter shows on overload. */
const OVERLOAD = 'OL';

/** The meter's own term is accented: Rin in the voltmeter plate, Rm in the ammeter plate. */
const VOLTAGE_HEADING: readonly PanelHeadingPart[] = [
  { text: 'Vread = Vtrue · ' },
  { text: 'Rin', accent: true },
  { text: ' / (Zout + ' },
  { text: 'Rin', accent: true },
  { text: ')' },
];
const CURRENT_HEADING: readonly PanelHeadingPart[] = [
  { text: 'Iread = Itrue · RL / (RL + ' },
  { text: 'Rm', accent: true },
  { text: ')' },
];

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** Fills `{name}` placeholders in a ui.ts sentence. */
function fill(template: string, values: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => values[key] ?? match);
}

interface ReadoutRow {
  label: string;
  value: string;
  note: string;
  tone: ReadoutTone;
}

/**
 * A meter is part of the circuit while it measures: a large resistor across
 * what it reads (voltmeter) or a small one in series with it (ammeter). The
 * reading and the true value sit side by side, and the error's tone shows when
 * the meter's resistance is no longer far enough from the circuit's.
 */
@Component({
  selector: 'app-meter-loading',
  imports: [...SCHEMATIC, Panel, Control, Readout],
  template: `
    <app-panel [heading]="heading()" [headingAlt]="headingAlt()" [headingLabel]="spokenFormula()">
      <div panelFigure class="figure">
        <sch-canvas [w]="31" [h]="16" [label]="summary()">
          @if (mode() === 'voltage') {
            <svg:g schWire d="M40 30 H140" [flow]="supplyFlow()" />
            <svg:g schWire d="M40 75 V130 H140" [flow]="supplyFlow()" />
            <svg:g schWire d="M140 110 V130" [flow]="supplyFlow()" />
            <svg:g schWire d="M140 70 H250" [flow]="meterFlowV()" />
            <svg:g schWire d="M250 110 V130 H140" [flow]="meterFlowV()" />

            <svg:g schSource [x]="4" [y]="3" [value]="text(vin(), 'V')" />
            <svg:g
              schResistor
              [x]="14"
              [y]="3"
              [vertical]="true"
              name="R1"
              [value]="text(r1(), 'Ω')"
            />
            <svg:g
              schResistor
              [x]="14"
              [y]="7"
              [vertical]="true"
              name="R2"
              [value]="text(r2(), 'Ω')"
            />
            <svg:g
              schMeter
              kind="V"
              [x]="25"
              [y]="7"
              name="Rin"
              [value]="text(rin(), 'Ω')"
              [highlight]="true"
            />
            <svg:g schGround [x]="14" [y]="13" />
            <svg:g schJunction [x]="14" [y]="7" />
            <svg:g schJunction [x]="14" [y]="13" />
            <svg:g
              schLabel
              [x]="21"
              [y]="5.6"
              [text]="readingText()"
              [accent]="true"
              anchor="middle"
            />
          } @else {
            <svg:g schWire d="M40 30 H90" [flow]="loopFlow()" />
            <svg:g schWire d="M140 30 H250 V70" [flow]="loopFlow()" />
            <svg:g schWire d="M250 110 V130 H40 V75" [flow]="loopFlow()" />

            <svg:g schSource [x]="4" [y]="3" [value]="text(vin(), 'V')" />
            <svg:g
              schMeter
              kind="A"
              [x]="9"
              [y]="3"
              [vertical]="false"
              [plus]="true"
              name="Rm"
              [value]="text(ammeter().rMeter, 'Ω')"
              [highlight]="true"
            />
            <svg:g
              schResistor
              [x]="25"
              [y]="7"
              [vertical]="true"
              name="RL"
              [value]="text(rLoad(), 'Ω')"
            />
            <svg:g schGround [x]="14" [y]="13" />
            <!-- A T: the ground lead taps the return wire, so three conductors meet. -->
            <svg:g schJunction [x]="14" [y]="13" />
            <svg:g
              schLabel
              [x]="19.5"
              [y]="5.6"
              [text]="readingText()"
              [accent]="true"
              anchor="middle"
            />
          }
        </sch-canvas>
      </div>

      <div panelControls>
        <fieldset class="pix-segment">
          <legend>{{ t().widget.measure }}</legend>
          @for (option of modes; track option.key) {
            <label class="pix-key" [class.pix-key--on]="mode() === option.key">
              <input
                type="radio"
                [name]="modeName"
                [value]="option.key"
                [checked]="mode() === option.key"
                (change)="mode.set(option.key)"
              />
              {{ option.label() }}
            </label>
          }
        </fieldset>

        <app-control
          [label]="t().widget.supply"
          unit="V"
          [min]="vMin"
          [max]="vMax"
          [(value)]="vin"
        />

        @if (mode() === 'voltage') {
          <app-control
            label="R1"
            unit="Ω"
            [min]="rMin"
            [max]="rMax"
            [log]="true"
            [e24]="true"
            [(value)]="r1"
          />
          <app-control
            label="R2"
            unit="Ω"
            [min]="rMin"
            [max]="rMax"
            [log]="true"
            [e24]="true"
            [(value)]="r2"
          />
          <app-control
            [label]="t().widget.inputResistance"
            unit="Ω"
            [min]="rinMin"
            [max]="rinMax"
            [log]="true"
            [(value)]="rin"
          />
        } @else {
          <app-control
            [label]="t().widget.load"
            unit="Ω"
            [min]="rLoadMin"
            [max]="rLoadMax"
            [log]="true"
            [e24]="true"
            [(value)]="rLoad"
          />
          <div class="pix-rule">
            <fieldset class="pix-segment">
              <legend>{{ t().widget.range }}</legend>
              @for (key of ranges; track key) {
                <label class="pix-key" [class.pix-key--on]="range() === key">
                  <input
                    type="radio"
                    [name]="rangeName"
                    [value]="key"
                    [checked]="range() === key"
                    (change)="range.set(key)"
                  />
                  {{ key }}
                </label>
              }
            </fieldset>
          </div>
        }
      </div>

      <div panelReadouts>
        @for (row of readouts(); track $index) {
          <app-readout
            [label]="row.label"
            [value]="row.value"
            [note]="row.note"
            [tone]="row.tone"
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
  `,
})
export class MeterLoadingWidget {
  readonly props = input<Record<string, string>>({});

  private readonly i18n = inject(I18n);
  protected readonly t = this.i18n.t;

  private readonly id = nextId++;
  protected readonly modeName = `meter-mode-${this.id}`;
  protected readonly rangeName = `meter-range-${this.id}`;

  protected readonly vMin = V_MIN;
  protected readonly vMax = V_MAX;
  protected readonly rMin = R_MIN;
  protected readonly rMax = R_MAX;
  protected readonly rinMin = RIN_MIN;
  protected readonly rinMax = RIN_MAX;
  protected readonly rLoadMin = RLOAD_MIN;
  protected readonly rLoadMax = RLOAD_MAX;

  protected readonly modes: { key: MeterMode; label: () => string }[] = [
    { key: 'voltage', label: () => this.t().widget.voltage },
    { key: 'current', label: () => this.t().widget.current },
  ];
  protected readonly ranges: readonly CurrentRange[] = ['mA', 'A'];

  // Seeded from the directive, clamped to the controls' ranges (so a preset
  // can never exceed the 24 V ceiling), then owned by the reader. Each mode
  // keeps its own values; the supply is shared.
  protected readonly mode = linkedSignal(() => parseMode(this.props()['mode']));
  protected readonly range = linkedSignal(() => parseRange(this.props()['range']));
  protected readonly vin = linkedSignal(() =>
    clamp(parseValue(this.props()['vin'], 9), V_MIN, V_MAX),
  );
  protected readonly r1 = linkedSignal(() => this.ohms('r1', 10e3, R_MIN, R_MAX));
  protected readonly r2 = linkedSignal(() => this.ohms('r2', 10e3, R_MIN, R_MAX));
  protected readonly rin = linkedSignal(() => this.ohms('rin', 10e6, RIN_MIN, RIN_MAX));
  protected readonly rLoad = linkedSignal(() => this.ohms('rload', 1e3, RLOAD_MIN, RLOAD_MAX));

  protected readonly voltmeter = computed(() =>
    solveVoltmeter({ vin: this.vin(), r1: this.r1(), r2: this.r2(), rin: this.rin() }),
  );
  protected readonly ammeter = computed(() =>
    solveAmmeter({ vin: this.vin(), rLoad: this.rLoad(), range: this.range() }),
  );

  /** Nameplate: middle dot, not ×, and no subscripts (glyph rule). The other
   *  mode's plate is reserved as `headingAlt`, so the strip keeps one size. */
  protected readonly heading = computed(() =>
    this.mode() === 'voltage' ? VOLTAGE_HEADING : CURRENT_HEADING,
  );
  protected readonly headingAlt = computed(() =>
    this.mode() === 'voltage' ? CURRENT_HEADING : VOLTAGE_HEADING,
  );
  protected readonly spokenFormula = computed(() =>
    this.mode() === 'voltage'
      ? this.t().widget.meterVoltageSpoken
      : this.t().widget.meterCurrentSpoken,
  );

  protected readonly supplyFlow = computed(() => meterFlow(this.voltmeter().iSupply));
  protected readonly meterFlowV = computed(() => meterFlow(this.voltmeter().iMeter));
  protected readonly loopFlow = computed(() => meterFlow(this.ammeter().reading));

  /** The meter's display: the reading, or OL past the mA input's full scale. */
  protected readonly readingText = computed(() => {
    if (this.mode() === 'voltage') return this.text(this.voltmeter().reading, 'V');
    const a = this.ammeter();
    return a.overRange ? OVERLOAD : this.text(a.reading, 'A');
  });

  protected readonly readouts = computed<ReadoutRow[]>(() => {
    const w = this.t().widget;
    if (this.mode() === 'voltage') {
      const v = this.voltmeter();
      return [
        { label: w.reading, value: this.readingText(), note: '', tone: 'accent' },
        {
          label: w.trueValue,
          value: this.text(v.trueValue, 'V'),
          note: w.withoutMeter,
          tone: 'plain',
        },
        { label: w.error, value: this.percent(v.error), note: '', tone: errorTone(v.error) },
        { label: w.outputImpedance, value: this.text(v.zout, 'Ω'), note: '', tone: 'plain' },
      ];
    }
    const a = this.ammeter();
    const ol = a.overRange;
    return [
      {
        label: w.reading,
        value: this.readingText(),
        note: ol ? w.overRange : '',
        tone: ol ? 'danger' : 'accent',
      },
      {
        label: w.trueValue,
        value: this.text(a.trueValue, 'A'),
        note: w.withoutMeter,
        tone: 'plain',
      },
      {
        label: w.error,
        value: ol ? '—' : this.percent(a.error),
        note: '',
        tone: ol ? 'plain' : errorTone(a.error),
      },
      {
        label: w.burdenVoltage,
        value: ol ? '—' : this.text(a.burden, 'V'),
        note: w.acrossMeter,
        tone: 'plain',
      },
    ];
  });

  /** The drawing's text equivalent: the spoken formula, then the circuit and its values. */
  protected readonly summary = computed(() => {
    const w = this.t().widget;
    if (this.mode() === 'voltage') {
      const v = this.voltmeter();
      return `${w.meterVoltageSpoken}. ${fill(w.meterVoltageCircuitSpoken, {
        vin: this.text(this.vin(), 'V'),
        r1: this.text(this.r1(), 'Ω'),
        r2: this.text(this.r2(), 'Ω'),
        rin: this.text(this.rin(), 'Ω'),
        reading: this.text(v.reading, 'V'),
        trueValue: this.text(v.trueValue, 'V'),
      })}`;
    }
    const a = this.ammeter();
    return `${w.meterCurrentSpoken}. ${fill(w.meterCurrentCircuitSpoken, {
      vin: this.text(this.vin(), 'V'),
      range: this.range(),
      rm: this.text(a.rMeter, 'Ω'),
      rload: this.text(this.rLoad(), 'Ω'),
      reading: a.overRange ? `${OVERLOAD} (${w.overRange})` : this.text(a.reading, 'A'),
      trueValue: this.text(a.trueValue, 'A'),
    })}`;
  });

  protected text(value: number, unit: string): string {
    return formatSI(value, unit, this.i18n.lang());
  }

  /** Two decimals, so a 0.05 % error does not read as 0 %. */
  private percent(fraction: number): string {
    return formatPercent(fraction, this.i18n.lang(), 2);
  }

  private ohms(key: string, fallback: number, min: number, max: number): number {
    return clamp(parseValue(this.props()[key], fallback), min, max);
  }
}
