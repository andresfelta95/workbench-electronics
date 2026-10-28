import { Component, computed, inject, input, linkedSignal } from '@angular/core';
import { I18n } from '../../core/i18n';
import { formatPercent, formatSI, parseValue, snapToE24 } from '../../core/format';
import { SCHEMATIC } from '../../schematic/schematic';
import { Control } from '../../ui/control';
import { Panel, type PanelHeadingPart } from '../../ui/panel';
import { Readout, type ReadoutTone } from '../../ui/readout';
import {
  formatTemperature,
  heatFlow,
  parseRating,
  type PartRating,
  ratingTone,
  solveDissipation,
  surfaceTone,
  T_MAX,
} from './power-dissipation-math';

// Same scheme as Control's ids: a module counter gives every instance its own
// radio group name, so two instances on one page never merge groups.
let nextId = 0;

/** The course's safety ceiling for anything it suggests building (ROADMAP §3.1). */
const V_MIN = 1;
const V_MAX = 24;
const R_MIN = 10;
const R_MAX = 100e3;
/** 10 °C, not 0, so the control never shows an SI prefix ("140 m°C"); 150 °C,
 *  not 155, so the rating never reaches 0 (brief D-6). */
const T_MIN = 10;
const T_MAX_CONTROL = 150;

/** What the readouts show where the maker's curve gives no figure (brief D-7). */
const NO_DATA = '—';

/** The temperature rise, P · θ, is the headline, so it is the accented run (brief D-13). */
const HEADING: readonly PanelHeadingPart[] = [
  { text: 'T = Ta + ' },
  { text: 'P · θ', accent: true },
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
 * A resistor turns its power into heat, and its surface settles P · θ above
 * the air. Two limits, shown side by side: the maker's power rating, which
 * shrinks above 70 °C ambient, and the temperature at which a surface burns
 * skin, which a part reaches well inside its rating.
 */
@Component({
  selector: 'app-power-dissipation',
  imports: [...SCHEMATIC, Panel, Control, Readout],
  template: `
    <app-panel [heading]="heading" [headingLabel]="t().widget.heatSpoken">
      <div panelFigure class="figure">
        <sch-canvas [w]="29" [h]="15" [label]="summary()">
          <svg:g schWire d="M40 40 H100" [flow]="flow()" />
          <svg:g schWire d="M150 40 H250 V130 H40 V85" [flow]="flow()" />
          <svg:g schSource [x]="4" [y]="4" [value]="text(vin(), 'V')" />
          <svg:g
            schResistor
            [x]="10"
            [y]="4"
            name="R"
            [value]="text(r(), 'Ω')"
            [highlight]="result().overRating"
          />
          <svg:g
            schLabel
            [x]="20"
            [y]="11.2"
            [text]="powerText()"
            [accent]="true"
            anchor="middle"
          />
        </sch-canvas>
      </div>

      <div panelControls>
        <fieldset class="pix-segment">
          <legend>{{ t().widget.resistor }}</legend>
          @for (option of parts; track option.key) {
            <label class="pix-key" [class.pix-key--on]="part() === option.key">
              <input
                type="radio"
                [name]="partName"
                [value]="option.key"
                [checked]="part() === option.key"
                (change)="part.set(option.key)"
              />
              {{ option.label }}
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

        <app-control
          label="R"
          unit="Ω"
          [min]="rMin"
          [max]="rMax"
          [log]="true"
          [e24]="true"
          [(value)]="r"
        />

        <div class="pix-rule">
          <app-control
            [label]="t().widget.ambientTemperature"
            unit="°C"
            [min]="tMin"
            [max]="tMax"
            [(value)]="ambient"
          />
        </div>
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
export class PowerDissipationWidget {
  readonly props = input<Record<string, string>>({});

  private readonly i18n = inject(I18n);
  protected readonly t = this.i18n.t;

  protected readonly partName = `heat-part-${nextId++}`;

  protected readonly vMin = V_MIN;
  protected readonly vMax = V_MAX;
  protected readonly rMin = R_MIN;
  protected readonly rMax = R_MAX;
  protected readonly tMin = T_MIN;
  protected readonly tMax = T_MAX_CONTROL;

  /** Same text in both languages (brief §3); `1/4 W`, not `¼ W` (D-12). */
  protected readonly parts: readonly { key: PartRating; label: string }[] = [
    { key: '1/4', label: '1/4 W' },
    { key: '1', label: '1 W' },
  ];

  protected readonly heading = HEADING;

  // Seeded from the directive, clamped to the controls' ranges (so a preset
  // can never exceed the 24 V ceiling), then owned by the reader. The supply,
  // R and the ambient are shared across a part switch: only θ and the rating
  // change, which is the comparison.
  protected readonly part = linkedSignal(() => parseRating(this.props()['rating']));
  protected readonly vin = linkedSignal(() =>
    clamp(parseValue(this.props()['vin'], 5), V_MIN, V_MAX),
  );
  protected readonly r = linkedSignal(() =>
    snapToE24(clamp(parseValue(this.props()['r'], 100), R_MIN, R_MAX)),
  );
  protected readonly ambient = linkedSignal(() =>
    clamp(parseValue(this.props()['ambient'], 25), T_MIN, T_MAX_CONTROL),
  );

  protected readonly result = computed(() =>
    solveDissipation({
      vin: this.vin(),
      r: this.r(),
      part: this.part(),
      ambient: this.ambient(),
    }),
  );

  protected readonly flow = computed(() => heatFlow(this.result().current));
  protected readonly powerText = computed(() => this.text(this.result().power, 'W'));

  protected readonly readouts = computed<ReadoutRow[]>(() => {
    const w = this.t().widget;
    const res = this.result();
    const off = !res.inData;
    const surfaceNote = off
      ? w.noMakerData
      : surfaceTone(res) === 'danger'
        ? w.aboveMax
        : surfaceTone(res) === 'warn'
          ? w.canBurn
          : w.midBody;
    return [
      {
        label: w.power,
        value: this.powerText(),
        note: fill(w.currentThrough, { current: this.text(res.current, 'A') }),
        tone: 'plain',
      },
      {
        label: w.temperatureRise,
        value: off ? NO_DATA : this.degrees(res.rise),
        note: `θ = ${this.degrees(res.theta, '°C/W')}`,
        tone: off ? 'danger' : 'accent',
      },
      {
        label: w.surfaceTemperature,
        value: off ? NO_DATA : this.degrees(res.surface),
        note: surfaceNote,
        tone: surfaceTone(res),
      },
      {
        label: w.ratingUsed,
        value: formatPercent(res.used, this.i18n.lang()),
        note: fill(w.ratingOf, {
          rating: this.text(res.ratedNow, 'W'),
          ambient: this.text(this.ambient(), '°C'),
        }),
        tone: ratingTone(res.used),
      },
    ];
  });

  /** The drawing's text equivalent: the spoken formula, then the circuit and its values. */
  protected readonly summary = computed(() => {
    const w = this.t().widget;
    const res = this.result();
    const values = {
      vin: this.text(this.vin(), 'V'),
      current: this.text(res.current, 'A'),
      r: this.text(this.r(), 'Ω'),
      rating: this.parts.find((p) => p.key === this.part())?.label ?? '',
      ambient: this.text(this.ambient(), '°C'),
      power: this.text(res.power, 'W'),
      used: formatPercent(res.used, this.i18n.lang()),
      rise: this.degrees(res.rise),
      surface: this.degrees(res.surface),
    };
    if (!res.inData) return `${w.heatSpoken}. ${fill(w.heatOverSpoken, values)}`;
    // Within the data, say what the readouts' tones say: past the derated
    // rating (the hot resistor) and above the part's 155 °C limit.
    const sentences = [w.heatSpoken + '.', fill(w.heatCircuitSpoken, values)];
    if (res.overRating) {
      sentences.push(
        fill(w.heatDeratedSpoken, {
          ratedNow: this.text(res.ratedNow, 'W'),
          ambient: values.ambient,
        }),
      );
    }
    if (res.surface > T_MAX) sentences.push(w.heatAboveMaxSpoken);
    return sentences.join(' ');
  });

  protected text(value: number, unit: string): string {
    return formatSI(value, unit, this.i18n.lang());
  }

  private degrees(value: number, unit = '°C'): string {
    return formatTemperature(value, this.i18n.lang(), unit);
  }
}
