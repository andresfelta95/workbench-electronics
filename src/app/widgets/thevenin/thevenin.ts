import { Component, computed, inject, input, linkedSignal } from '@angular/core';
import { I18n } from '../../core/i18n';
import { formatPercent, formatSI, parseValue, snapToE24 } from '../../core/format';
import { SCHEMATIC } from '../../schematic/schematic';
import { Control } from '../../ui/control';
import { Curve, type CurveMarker, type CurveTick } from '../../ui/curve';
import { Panel, type PanelHeadingPart } from '../../ui/panel';
import { Readout, type ReadoutTone } from '../../ui/readout';
import {
  CELLS,
  curvePoints,
  heatTone,
  isCell,
  parseLoaded,
  parseSource,
  solveDividerSource,
  solveSource,
  type SourceKey,
  type SourceResult,
  sourceFlow,
} from './thevenin-math';

// Same scheme as Control's ids: a module counter gives every instance its own
// radio group name, so the lesson's two instances never merge groups.
let nextId = 0;

/** The course's safety ceiling for anything it suggests building (ROADMAP §3.1). */
const V_MIN = 1;
const V_MAX = 24;
/** Internal resistance: 10 mΩ – 100 Ω, never 0, so no source is ideal (brief D-25). */
const RINT_MIN = 0.01;
const RINT_MAX = 100;
/** Divider parts, as `divider`. */
const R_MIN = 100;
const R_MAX = 1e6;
/** Loads per family (brief D-13): never 0, so no state is a short circuit. */
const BATTERY_LOAD_MIN = 0.01;
const BATTERY_LOAD_MAX = 1e4;
const DIVIDER_LOAD_MIN = 100;
const DIVIDER_LOAD_MAX = 1e6;

/** Samples along the P–R curve (brief §4). */
const CURVE_SAMPLES = 121;
/** Headroom above the peak for its label. */
const Y_HEADROOM = 1.15;

/** The voltage lost inside is the accented run (brief D-21). */
const BATTERY_HEADING: readonly PanelHeadingPart[] = [
  { text: 'V = Voc − ' },
  { text: 'I · Rint', accent: true },
];
const DIVIDER_HEADING: readonly PanelHeadingPart[] = [
  { text: 'V = Vth − ' },
  { text: 'I · Rth', accent: true },
];

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** Three significant figures, as `app-control` keeps a non-E24 value. */
function sig3(value: number): number {
  return Number(value.toPrecision(3));
}

/** Fills `{name}` placeholders in a ui.ts sentence. */
function fill(template: string, values: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => values[key] ?? match);
}

/** Decade ticks from min to max; a label on every `labelEvery`-th, from the first. */
function decadeTicks(
  min: number,
  max: number,
  labelEvery: number,
  format: (value: number) => string,
): CurveTick[] {
  const ticks: CurveTick[] = [];
  const first = Math.round(Math.log10(min));
  const last = Math.round(Math.log10(max));
  for (let e = first; e <= last; e++) {
    const at = Number(Math.pow(10, e).toPrecision(1));
    // Unlabelled decades get the short tick (the default for an empty label).
    ticks.push({ at, label: (e - first) % labelEvery === 0 ? format(at) : '' });
  }
  return ticks;
}

interface ReadoutRow {
  label: string;
  value: string;
  note: string;
  tone: ReadoutTone;
}

interface SourceOption {
  key: SourceKey;
  label: string;
}

/**
 * A real source is an ideal voltage behind a resistance. Its voltage drops by
 * I · Rint under load, its power into the load peaks when the load equals that
 * resistance (and then half heats the source), and a voltage divider seen from
 * its output is a source of the same kind (Thévenin). The P–R curve under the
 * drawing shows where the load sits against the source's maximum.
 */
@Component({
  selector: 'app-thevenin',
  imports: [...SCHEMATIC, Panel, Control, Readout, Curve],
  template: `
    <app-panel [heading]="heading()" [headingAlt]="headingAlt()" [headingLabel]="spokenFormula()">
      <div panelFigure class="figure">
        <sch-canvas [w]="32" [h]="16" [label]="summary()">
          @if (family() === 'battery') {
            <!-- One unit higher than the brief's (1, 2), so the box's top edge
                 clears Rint's name (brief §4 allows a unit's move). -->
            <svg:g schBox [x]="1" [y]="1" [w]="15" [h]="14" [name]="boxName()" />

            <svg:g schWire d="M40 80 V40 H70" [flow]="flow()" />
            <svg:g schWire d="M120 40 H160" [flow]="flow()" />
            <svg:g schWire [d]="returnWire()" [flow]="flow()" />
            @if (loaded()) {
              <svg:g schWire d="M160 40 H250 V70" [flow]="flow()" />
              <svg:g schWire d="M250 110 V140 H160" [flow]="flow()" />
            }

            @if (cellSymbol(); as symbol) {
              <svg:g
                schBattery
                [x]="4"
                [y]="8"
                [kind]="symbol"
                name="Voc"
                [value]="text(voc(), 'V')"
              />
            } @else {
              <svg:g schSource [x]="4" [y]="8" [value]="text(voc(), 'V')" />
            }
            <svg:g
              schResistor
              [x]="7"
              [y]="4"
              name="Rint"
              [value]="text(rint(), 'Ω')"
              [highlight]="tone() === 'warn'"
            />
            <svg:g schTerminal [x]="16" [y]="4" />
            <svg:g schTerminal [x]="16" [y]="14" />
            @if (loaded()) {
              <svg:g
                schResistor
                [x]="25"
                [y]="7"
                [vertical]="true"
                name="RL"
                [value]="text(rload(), 'Ω')"
              />
            }
            <svg:g
              schLabel
              [x]="20.5"
              [y]="9.4"
              [text]="terminalText()"
              [accent]="true"
              anchor="middle"
            />
          } @else {
            <svg:g schBox [x]="1" [y]="1" [w]="19" [h]="14" />

            <svg:g schWire d="M40 30 H140" [flow]="supplyFlow()" />
            <svg:g schWire d="M40 75 V130 H140" [flow]="supplyFlow()" />
            <svg:g schWire d="M140 110 V130" [flow]="supplyFlow()" />
            <svg:g schWire d="M140 70 H200" [flow]="flow()" />
            <svg:g schWire d="M140 130 H200" [flow]="flow()" />
            @if (loaded()) {
              <svg:g schWire d="M200 70 H260" [flow]="flow()" />
              <svg:g schWire d="M260 110 V130 H200" [flow]="flow()" />
            }

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
            <svg:g schGround [x]="14" [y]="13" />
            <svg:g schJunction [x]="14" [y]="7" />
            <svg:g schJunction [x]="14" [y]="13" />
            <svg:g schTerminal [x]="20" [y]="7" />
            <svg:g schTerminal [x]="20" [y]="13" />
            @if (loaded()) {
              <svg:g
                schResistor
                [x]="26"
                [y]="7"
                [vertical]="true"
                name="RL"
                [value]="text(rload(), 'Ω')"
              />
            }
            <svg:g schLabel [x]="21" [y]="3" [text]="vthText()" [accent]="true" />
            <svg:g schLabel [x]="21" [y]="4.6" [text]="rthText()" [accent]="true" />
            <svg:g
              schLabel
              [x]="23"
              [y]="9.6"
              [text]="terminalText()"
              [accent]="true"
              anchor="middle"
            />
          }
        </sch-canvas>

        <app-curve
          class="curve"
          [w]="31"
          [h]="12"
          [xLog]="true"
          [xMin]="loadMin()"
          [xMax]="loadMax()"
          [yMax]="yMax()"
          [points]="points()"
          [xTicks]="xTicks()"
          [yTicks]="yTicks"
          xTitle="RL"
          yTitle="P"
          [markers]="markers()"
          [label]="curveLabel()"
        />
      </div>

      <div panelControls>
        <fieldset class="pix-segment">
          <legend>{{ t().widget.source }}</legend>
          @for (option of sources(); track option.key) {
            <label class="pix-key" [class.pix-key--on]="source() === option.key">
              <input
                type="radio"
                [name]="sourceName"
                [value]="option.key"
                [checked]="source() === option.key"
                (change)="selectSource(option.key)"
              />
              {{ option.label }}
            </label>
            @if (option.key === '9v' || option.key === 'cr2032') {
              <span class="row-break" aria-hidden="true"></span>
            }
          }
        </fieldset>

        @if (family() === 'battery') {
          <app-control
            [label]="t().widget.openCircuitVoltage"
            unit="V"
            [min]="vMin"
            [max]="vMax"
            [value]="voc()"
            (valueChange)="editVoc($event)"
          />
          <app-control
            [label]="t().widget.internalResistance"
            unit="Ω"
            [min]="rintMin"
            [max]="rintMax"
            [log]="true"
            [value]="rint()"
            (valueChange)="editRint($event)"
          />
        } @else {
          <app-control label="Vin" unit="V" [min]="vMin" [max]="vMax" [(value)]="vin" />
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
        }

        <div class="load pix-rule">
          <label class="pix-switch" [class.pix-switch--on]="loaded()">
            <input type="checkbox" [checked]="loaded()" (change)="loaded.set(!loaded())" />
            {{ t().widget.load }}: {{ loaded() ? text(rload(), 'Ω') : t().widget.noLoad }}
          </label>
          <app-control
            [label]="t().widget.load"
            unit="Ω"
            [min]="loadMin()"
            [max]="loadMax()"
            [log]="true"
            [value]="rload()"
            (valueChange)="setLoad($event)"
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

    .curve {
      margin-top: calc(4 * var(--px));
    }

    /* Forced breaks after 9 V and after CR2032: three fixed rows of two
       (AA | 9 V, NiMH | CR2032, Custom | Divider) at every width, since the
       four batteries do not fit one row of the controls column at 900 or
       1280 px (coordinator's decision, superseding brief D-11's two rows).
       The breaks do not depend on the selection, so the segment's height
       never changes when a key is pressed. */
    .row-break {
      flex-basis: 100%;
      height: 0;
    }

    .load {
      display: flex;
      flex-direction: column;
      gap: calc(6 * var(--px));
    }
  `,
})
export class TheveninWidget {
  readonly props = input<Record<string, string>>({});

  private readonly i18n = inject(I18n);
  protected readonly t = this.i18n.t;

  protected readonly sourceName = `thevenin-source-${nextId++}`;

  protected readonly vMin = V_MIN;
  protected readonly vMax = V_MAX;
  protected readonly rintMin = RINT_MIN;
  protected readonly rintMax = RINT_MAX;
  protected readonly rMin = R_MIN;
  protected readonly rMax = R_MAX;
  protected readonly yTicks: readonly CurveTick[] = [{ at: 0, label: '0' }];

  /** Segment keys in order; the battery labels are the same in both languages. */
  protected readonly sources = computed<SourceOption[]>(() => [
    { key: 'aa', label: 'AA' },
    { key: '9v', label: '9 V' },
    { key: 'nimh', label: 'NiMH' },
    { key: 'cr2032', label: 'CR2032' },
    { key: 'custom', label: this.t().widget.custom },
    { key: 'divider', label: this.t().widget.dividerKey },
  ]);

  // Seeded from the directive, clamped to the controls' ranges (so a preset
  // can never exceed the 24 V ceiling), then owned by the reader. The battery
  // family shares one Voc/Rint pair (written by the preset keys) and one load;
  // the divider keeps its own Vin, R1, R2 and load.
  protected readonly source = linkedSignal(() => parseSource(this.props()['source']));
  private readonly startsDivider = computed(
    () => parseSource(this.props()['source']) === 'divider',
  );
  protected readonly voc = linkedSignal(() => {
    const start = parseSource(this.props()['source']);
    if (isCell(start)) return CELLS[start].voc;
    return clamp(parseValue(this.props()['voc'], 5), V_MIN, V_MAX);
  });
  protected readonly rint = linkedSignal(() => {
    const start = parseSource(this.props()['source']);
    if (isCell(start)) return CELLS[start].rint;
    return sig3(clamp(parseValue(this.props()['rint'], 1), RINT_MIN, RINT_MAX));
  });
  protected readonly vin = linkedSignal(() =>
    clamp(parseValue(this.props()['vin'], 9), V_MIN, V_MAX),
  );
  protected readonly r1 = linkedSignal(() =>
    snapToE24(clamp(parseValue(this.props()['r1'], 10e3), R_MIN, R_MAX)),
  );
  protected readonly r2 = linkedSignal(() =>
    snapToE24(clamp(parseValue(this.props()['r2'], 10e3), R_MIN, R_MAX)),
  );
  // `rload` seeds the load of the family the instrument starts in; the other
  // family's load starts at its own default.
  private readonly batteryLoad = linkedSignal(() =>
    this.startsDivider()
      ? 10
      : sig3(clamp(parseValue(this.props()['rload'], 10), BATTERY_LOAD_MIN, BATTERY_LOAD_MAX)),
  );
  private readonly dividerLoad = linkedSignal(() =>
    this.startsDivider()
      ? sig3(clamp(parseValue(this.props()['rload'], 10e3), DIVIDER_LOAD_MIN, DIVIDER_LOAD_MAX))
      : 10e3,
  );
  protected readonly loaded = linkedSignal(() => parseLoaded(this.props()['loaded']));

  protected readonly family = computed(() => (this.source() === 'divider' ? 'divider' : 'battery'));

  protected readonly rload = computed(() =>
    this.family() === 'divider' ? this.dividerLoad() : this.batteryLoad(),
  );
  protected readonly loadMin = computed(() =>
    this.family() === 'divider' ? DIVIDER_LOAD_MIN : BATTERY_LOAD_MIN,
  );
  protected readonly loadMax = computed(() =>
    this.family() === 'divider' ? DIVIDER_LOAD_MAX : BATTERY_LOAD_MAX,
  );

  private readonly dividerResult = computed(() =>
    solveDividerSource({
      vin: this.vin(),
      r1: this.r1(),
      r2: this.r2(),
      rload: this.dividerLoad(),
      loaded: this.loaded(),
    }),
  );

  protected readonly result = computed<SourceResult>(() =>
    this.family() === 'divider'
      ? this.dividerResult()
      : solveSource({
          voc: this.voc(),
          rint: this.rint(),
          rload: this.batteryLoad(),
          loaded: this.loaded(),
        }),
  );

  /** The source as the load sees it: Voc and Rint, or Vth and Rth. */
  private readonly equivalent = computed(() =>
    this.family() === 'divider'
      ? { voc: this.dividerResult().vth, rint: this.dividerResult().rth }
      : { voc: this.voc(), rint: this.rint() },
  );

  protected readonly tone = computed(() => heatTone(this.result()));

  /** Nameplate. The other family's plate is reserved as `headingAlt`, so the
   *  strip keeps one size. Middle dot and U+2212 minus, no subscripts. */
  protected readonly heading = computed(() =>
    this.family() === 'divider' ? DIVIDER_HEADING : BATTERY_HEADING,
  );
  protected readonly headingAlt = computed(() =>
    this.family() === 'divider' ? BATTERY_HEADING : DIVIDER_HEADING,
  );
  protected readonly spokenFormula = computed(() =>
    this.family() === 'divider'
      ? this.t().widget.dividerSourceSpoken
      : this.t().widget.sourceSpoken,
  );

  /** The single-cell or several-cell symbol for a preset; Custom draws schSource. */
  protected readonly cellSymbol = computed(() => {
    const key = this.source();
    return isCell(key) ? CELLS[key].symbol : null;
  });
  protected readonly boxName = computed(
    () => this.sources().find((s) => s.key === this.source())?.label ?? '',
  );
  /** schSource's bottom pin is at 45, not 40: its return wire starts half a unit lower. */
  protected readonly returnWire = computed(() =>
    this.cellSymbol() ? 'M40 120 V140 H160' : 'M40 125 V140 H160',
  );

  protected readonly flow = computed(() => sourceFlow(this.result().current));
  protected readonly supplyFlow = computed(() =>
    sourceFlow(this.dividerResult().supplyPower / this.vin()),
  );

  /** Readout 1's value: 4 figures for a battery, 3 for the divider (brief D-17). */
  protected readonly terminalText = computed(() =>
    formatSI(this.result().terminal, 'V', this.i18n.lang(), this.family() === 'divider' ? 3 : 4),
  );
  protected readonly vthText = computed(() => `Vth = ${this.text(this.dividerResult().vth, 'V')}`);
  protected readonly rthText = computed(() => `Rth = ${this.text(this.dividerResult().rth, 'Ω')}`);

  protected readonly readouts = computed<ReadoutRow[]>(() => {
    const w = this.t().widget;
    const res = this.result();
    const divider = this.family() === 'divider';
    const on = this.loaded();
    return [
      {
        label: divider ? w.output : w.terminalVoltage,
        value: this.terminalText(),
        note: on ? fill(w.lostInside, { drop: this.text(res.drop, 'V') }) : w.openCircuit,
        tone: 'accent',
      },
      {
        label: w.drawnCurrent,
        value: this.text(res.current, 'A'),
        note: fill(w.shortCircuitComputed, { isc: this.text(res.isc, 'A') }),
        tone: 'plain',
      },
      {
        label: w.loadPower,
        value: this.text(res.loadPower, 'W'),
        note: fill(w.ofMaximum, {
          fraction: this.percent(res.fractionOfMax),
          pmax: this.text(res.pmax, 'W'),
        }),
        tone: 'plain',
      },
      {
        label: divider ? w.heatInDivider : w.heatInside,
        value: this.text(res.internalPower, 'W'),
        note: on
          ? fill(w.efficiencyNote, { efficiency: this.percent(res.efficiency) })
          : w.noLoadNote,
        tone: this.tone(),
      },
    ];
  });

  /** The drawing's text equivalent: the spoken formula, then the circuit and its values. */
  protected readonly summary = computed(() => {
    const w = this.t().widget;
    const res = this.result();
    const plate = this.spokenFormula();
    const common = {
      v: this.terminalText(),
      i: this.text(res.current, 'A'),
      p: this.text(res.loadPower, 'W'),
      heat: this.text(res.internalPower, 'W'),
      rload: this.text(this.rload(), 'Ω'),
    };
    if (this.family() === 'divider') {
      const values = {
        ...common,
        vin: this.text(this.vin(), 'V'),
        r1: this.text(this.r1(), 'Ω'),
        r2: this.text(this.r2(), 'Ω'),
        vth: this.text(this.dividerResult().vth, 'V'),
        rth: this.text(this.dividerResult().rth, 'Ω'),
      };
      const body = this.loaded() ? w.dividerCircuitSpoken : w.dividerOpenSpoken;
      return `${plate}. ${fill(body, values)}`;
    }
    const values = {
      ...common,
      sourceName: this.spokenSourceName(),
      voc: this.text(this.voc(), 'V'),
      rint: this.text(this.rint(), 'Ω'),
    };
    if (!this.loaded()) return `${plate}. ${fill(w.sourceOpenSpoken, values)}`;
    const sentences = [`${plate}.`, fill(w.sourceCircuitSpoken, values)];
    if (this.tone() === 'warn') sentences.push(w.sourceHeatSpoken);
    return sentences.join(' ');
  });

  private readonly spokenSourceName = computed(() => {
    const w = this.t().widget;
    switch (this.source()) {
      case 'aa':
        return w.sourceNameAaSpoken;
      case '9v':
        return w.sourceName9vSpoken;
      case 'nimh':
        return w.sourceNameNimhSpoken;
      case 'cr2032':
        return w.sourceNameCr2032Spoken;
      default:
        return w.sourceNameCustomSpoken;
    }
  });

  /* The P–R plot (brief §4, D-16). */

  protected readonly points = computed(() => {
    const { voc, rint } = this.equivalent();
    return curvePoints(voc, rint, this.loadMin(), this.loadMax(), CURVE_SAMPLES);
  });
  protected readonly yMax = computed(() => {
    const pmax = this.result().pmax;
    return Number.isFinite(pmax) && pmax > 0 ? Y_HEADROOM * pmax : 1;
  });
  protected readonly xTicks = computed(() =>
    decadeTicks(this.loadMin(), this.loadMax(), this.family() === 'divider' ? 1 : 2, (v) =>
      this.text(v, 'Ω'),
    ),
  );
  /** The hollow peak first, then the filled present load on top (omitted when off). */
  protected readonly markers = computed<CurveMarker[]>(() => {
    const res = this.result();
    const peak: CurveMarker = {
      x: this.equivalent().rint,
      y: res.pmax,
      shape: 'hollow',
      label: fill(this.t().widget.curvePeak, { pmax: this.text(res.pmax, 'W') }),
    };
    if (!this.loaded()) return [peak];
    return [peak, { x: this.rload(), y: res.loadPower, shape: 'filled', guide: true }];
  });
  protected readonly curveLabel = computed(() => {
    const w = this.t().widget;
    const res = this.result();
    return fill(this.loaded() ? w.curveSpoken : w.curveOpenSpoken, {
      xmin: this.text(this.loadMin(), 'Ω'),
      xmax: this.text(this.loadMax(), 'Ω'),
      pmax: this.text(res.pmax, 'W'),
      rint: this.text(this.equivalent().rint, 'Ω'),
      rload: this.text(this.rload(), 'Ω'),
      p: this.text(res.loadPower, 'W'),
      fraction: this.percent(res.fractionOfMax),
    });
  });

  /* Writes. */

  /** A preset key writes its values into the always-visible controls (D-11);
   *  Custom keeps whatever is showing; Divider restores the divider's own state. */
  protected selectSource(key: SourceKey): void {
    this.source.set(key);
    if (isCell(key)) {
      this.voc.set(CELLS[key].voc);
      this.rint.set(CELLS[key].rint);
    }
  }

  /** Editing Voc or Rint (slider or text box) selects Custom and keeps the value. */
  protected editVoc(value: number): void {
    this.voc.set(value);
    this.source.set('custom');
  }

  protected editRint(value: number): void {
    this.rint.set(value);
    this.source.set('custom');
  }

  protected setLoad(value: number): void {
    if (this.family() === 'divider') this.dividerLoad.set(value);
    else this.batteryLoad.set(value);
  }

  protected text(value: number, unit: string): string {
    return formatSI(value, unit, this.i18n.lang());
  }

  /** One decimal (brief §4). */
  private percent(fraction: number): string {
    return formatPercent(fraction, this.i18n.lang(), 1);
  }
}
