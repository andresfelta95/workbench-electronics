import { Component, computed, inject, input, linkedSignal, signal } from '@angular/core';
import { I18n } from '../../core/i18n';
import { formatPercent, formatSI, parseValue, snapToE24 } from '../../core/format';
import { SCHEMATIC } from '../../schematic/schematic';
import { Control } from '../../ui/control';
import type { CurveTick } from '../../ui/curve';
import { Histogram, type HistogramBand } from '../../ui/histogram';
import { Panel, type PanelHeadingPart } from '../../ui/panel';
import { Readout, type ReadoutTone } from '../../ui/readout';
import {
  axisRange,
  BINS,
  buildOutputs,
  BUILDS,
  deviates,
  dividerOut,
  FIRST_BATCH,
  histogram,
  parseShape,
  parseTolerance,
  type ShapeKey,
  spreadStats,
  TOLERANCES,
  type ToleranceKey,
  worstCase,
} from './tolerance-spread-math';

// Same scheme as Control's ids: a module counter gives every instance its own
// radio group names.
let nextId = 0;

/** The course's safety ceiling for anything it suggests building (ROADMAP §3.1). */
const V_MIN = 1;
const V_MAX = 24;
/** Divider parts, as `divider`. */
const R_MIN = 100;
const R_MAX = 1e6;

/** Headroom above the tallest bin, so both tolerances fill the height (D-8). */
const Y_HEADROOM = 1.15;
/** Minor ticks at ±1 % of nominal. */
const MINOR_TICK = 0.01;
/** Voltages to 4 significant figures (brief §4). */
const VOLT_FIGURES = 4;

/** The same plate as `divider`'s unloaded one; the accent is the ratio the
 *  tolerances move. Middle dot, no ×. */
const HEADING: readonly PanelHeadingPart[] = [
  { text: 'Vout = Vin · ' },
  { text: 'R2 / (R1 + R2)', accent: true },
];

const TOLERANCE_KEYS: readonly ToleranceKey[] = ['5', '1'];
const SHAPE_KEYS: readonly ShapeKey[] = ['bell', 'flat'];

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

interface KeyOption<K> {
  key: K;
  label: string;
}

/**
 * Many dividers built from toleranced parts. The same circuit as 00-03's,
 * built 1000 times on the computer with each part somewhere inside its band
 * (an assumed shape, labelled as one), and a histogram of where the outputs
 * land between the dashed worst-case rules. The answer to "how far off can it
 * be" is the band; the answer to "how far off will it usually be" is the hump.
 */
@Component({
  selector: 'app-tolerance-spread',
  imports: [...SCHEMATIC, Panel, Control, Readout, Histogram],
  template: `
    <app-panel [heading]="heading" [headingLabel]="t().widget.toleranceSpreadSpoken">
      <div panelFigure class="figure">
        <sch-canvas [w]="31" [h]="16" [label]="summary()">
          <svg:g schWire d="M40 30 H140" />
          <svg:g schWire d="M40 75 V130 H140" />
          <svg:g schWire d="M140 110 V130" />
          <svg:g schWire d="M140 70 H280" />

          <svg:g schSource [x]="4" [y]="3" [value]="text(vin(), 'V')" />
          <svg:g
            schResistor
            [x]="14"
            [y]="3"
            [vertical]="true"
            name="R1"
            [value]="partText(r1())"
          />
          <svg:g
            schResistor
            [x]="14"
            [y]="7"
            [vertical]="true"
            name="R2"
            [value]="partText(r2())"
          />
          <svg:g schGround [x]="14" [y]="13" />
          <svg:g schJunction [x]="14" [y]="7" />
          <svg:g schJunction [x]="14" [y]="13" />
          <svg:g schTerminal [x]="28" [y]="7" name="Vout" [right]="true" />
          <!-- Not divider's (21, 5.6), anchor middle: the resistor values carry
               the tolerance here ("100 kΩ ±5 %" reaches x ≈ 215 at phone text
               size) and would run into it. Right-aligned over the Vout pad,
               the 4-figure value ("818,2 mV") keeps clear of them. -->
          <svg:g
            schLabel
            [x]="30"
            [y]="5.6"
            [text]="volts(nominal())"
            [accent]="true"
            anchor="end"
          />
        </sch-canvas>

        <app-histogram
          class="histogram"
          [w]="31"
          [h]="11"
          [xMin]="axis().xMin"
          [xMax]="axis().xMax"
          [counts]="counts()"
          [yMax]="yMax()"
          [xTicks]="xTicks()"
          xTitle="Vout"
          [band]="band()"
          [label]="histogramLabel()"
        />
      </div>

      <div panelControls>
        <fieldset class="pix-segment">
          <legend>{{ t().widget.tolerance }}</legend>
          @for (option of tolerances(); track option.key) {
            <label class="pix-key" [class.pix-key--on]="tolerance() === option.key">
              <input
                type="radio"
                [name]="toleranceName"
                [value]="option.key"
                [checked]="tolerance() === option.key"
                (change)="tolerance.set(option.key)"
              />
              {{ option.label }}
            </label>
          }
        </fieldset>

        <fieldset class="pix-segment">
          <legend>{{ t().widget.assumedShape }}</legend>
          @for (option of shapes(); track option.key) {
            <label class="pix-key" [class.pix-key--on]="shape() === option.key">
              <input
                type="radio"
                [name]="shapeName"
                [value]="option.key"
                [checked]="shape() === option.key"
                (change)="shape.set(option.key)"
              />
              {{ option.label }}
            </label>
          }
        </fieldset>

        <div class="batch">
          <button type="button" class="pix-key" (click)="newBatch()">
            {{ t().widget.newBatch }}
          </button>
          <p class="visually-hidden" aria-live="polite">{{ announcement() }}</p>
        </div>

        <div class="circuit pix-rule">
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
      display: flex;
      flex-direction: column;
    }

    /* Room above for the band label and below for the outer tick labels,
       which overhang the SVG's edges, as thevenin leaves for app-curve. */
    .histogram {
      margin-top: calc(4 * var(--px));
    }

    /* A 2 × 2 grid on wide panels; one column on phones, where two columns
       would break the range notes ("4.275 V to 4.725 V") before their unit. */
    div[panelReadouts] {
      grid-template-columns: repeat(auto-fit, minmax(min(100%, 180px), 1fr));
    }

    /* Positioned, so the visually hidden live region below is anchored here
       and not to whatever ancestor happens to be positioned. */
    .batch {
      position: relative;
      display: flex;
    }

    .circuit {
      display: flex;
      flex-direction: column;
      gap: calc(6 * var(--px));
    }

    .visually-hidden {
      position: absolute;
      width: 1px;
      height: 1px;
      margin: -1px;
      padding: 0;
      overflow: hidden;
      clip: rect(0 0 0 0);
      clip-path: inset(50%);
      white-space: nowrap;
      border: 0;
    }
  `,
})
export class ToleranceSpreadWidget {
  readonly props = input<Record<string, string>>({});

  private readonly i18n = inject(I18n);
  protected readonly t = this.i18n.t;

  private readonly id = nextId++;
  protected readonly toleranceName = `tolerance-spread-tolerance-${this.id}`;
  protected readonly shapeName = `tolerance-spread-shape-${this.id}`;

  protected readonly vMin = V_MIN;
  protected readonly vMax = V_MAX;
  protected readonly rMin = R_MIN;
  protected readonly rMax = R_MAX;
  protected readonly heading = HEADING;

  // Seeded from the directive, clamped to the controls' ranges (and E24 for
  // the parts), then owned by the reader. There is no seed prop (D-11): every
  // page load starts on batch 1, the batch the prose quotes.
  protected readonly vin = linkedSignal(() =>
    clamp(parseValue(this.props()['vin'], 9), V_MIN, V_MAX),
  );
  protected readonly r1 = linkedSignal(() =>
    snapToE24(clamp(parseValue(this.props()['r1'], 10e3), R_MIN, R_MAX)),
  );
  protected readonly r2 = linkedSignal(() =>
    snapToE24(clamp(parseValue(this.props()['r2'], 10e3), R_MIN, R_MAX)),
  );
  protected readonly tolerance = linkedSignal(() => parseTolerance(this.props()['tolerance']));
  protected readonly shape = linkedSignal(() => parseShape(this.props()['shape']));
  private readonly batch = signal(FIRST_BATCH);
  /** Written only by New batch; sliders and keys announce themselves. */
  protected readonly announcement = signal('');

  protected readonly tolerances = computed<KeyOption<ToleranceKey>[]>(() =>
    TOLERANCE_KEYS.map((key) => ({ key, label: this.percent(TOLERANCES[key]) })),
  );
  protected readonly shapes = computed<KeyOption<ShapeKey>[]>(() => {
    const w = this.t().widget;
    return SHAPE_KEYS.map((key) => ({ key, label: key === 'bell' ? w.shapeBell : w.shapeFlat }));
  });

  private readonly tol = computed(() => TOLERANCES[this.tolerance()]);

  /* The model (brief §5): deviates depend on (batch, shape) only, so a
     tolerance switch or a circuit change rescales the same builds (D-10). */
  private readonly deviates = computed(() => deviates(this.batch(), BUILDS, this.shape()));
  private readonly outputs = computed(() =>
    buildOutputs(this.deviates(), this.vin(), this.r1(), this.r2(), this.tol()),
  );
  protected readonly nominal = computed(() => dividerOut(this.vin(), this.r1(), this.r2()));
  private readonly worst = computed(() =>
    worstCase(this.vin(), this.r1(), this.r2(), this.tol()),
  );
  private readonly stats = computed(() => spreadStats(this.outputs(), this.nominal()));

  /* The histogram (brief §4). */

  /** Fixed at the 5 % worst-case span whatever tolerance is shown (D-8). */
  protected readonly axis = computed(() => axisRange(this.vin(), this.r1(), this.r2()));
  protected readonly counts = computed(() =>
    histogram(this.outputs(), this.axis().xMin, this.axis().xMax, BINS),
  );
  protected readonly yMax = computed(() => {
    const max = Math.max(0, ...this.counts());
    return this.axis().xMax > this.axis().xMin && max > 0 ? Y_HEADROOM * max : 0;
  });
  protected readonly xTicks = computed<CurveTick[]>(() => {
    const nominal = this.nominal();
    const five = worstCase(this.vin(), this.r1(), this.r2(), TOLERANCES['5']);
    return [
      { at: five.low, label: this.volts(five.low) },
      { at: nominal * (1 - MINOR_TICK), label: '' },
      { at: nominal, label: this.volts(nominal) },
      { at: nominal * (1 + MINOR_TICK), label: '' },
      { at: five.high, label: this.volts(five.high) },
    ];
  });
  protected readonly band = computed<HistogramBand>(() => ({
    lo: this.worst().low,
    hi: this.worst().high,
    label: this.t().widget.worstCaseBand,
  }));

  /* Text. */

  private readonly farRelText = computed(() => this.signedPercent(this.stats().furthestRel));
  private readonly rel95Text = computed(() => `±${this.percent(this.stats().rel95)}`);

  protected readonly readouts = computed<ReadoutRow[]>(() => {
    const w = this.t().widget;
    const worst = this.worst();
    const stats = this.stats();
    return [
      {
        label: w.nominal,
        value: this.volts(this.nominal()),
        note: w.exactParts,
        tone: 'plain',
      },
      {
        label: w.worstCase,
        value: `±${this.percent(worst.rel)}`,
        note: fill(w.rangeTo, { low: this.volts(worst.low), high: this.volts(worst.high) }),
        tone: 'plain',
      },
      {
        label: w.ninetyFiveOfBuilds,
        value: this.rel95Text(),
        note: fill(w.rangeTo, { low: this.volts(stats.lo95), high: this.volts(stats.hi95) }),
        tone: 'accent',
      },
      {
        label: fill(w.furthestOf, { n: String(BUILDS) }),
        value: this.farRelText(),
        note: fill(w.furthestNote, { v: this.volts(stats.furthest), k: String(this.batch()) }),
        tone: 'plain',
      },
    ];
  });

  /** The drawing's text equivalent: the spoken plate, then the circuit. */
  protected readonly summary = computed(() => {
    const w = this.t().widget;
    const body = fill(w.toleranceCircuitSpoken, {
      vin: this.text(this.vin(), 'V'),
      r1: this.text(this.r1(), 'Ω'),
      r2: this.text(this.r2(), 'Ω'),
      tol: this.percent(this.tol()),
      nominal: this.volts(this.nominal()),
    });
    return `${w.toleranceSpreadSpoken}. ${body}`;
  });

  protected readonly histogramLabel = computed(() => {
    const w = this.t().widget;
    const stats = this.stats();
    const worst = this.worst();
    return fill(w.histogramSpoken, {
      n: String(BUILDS),
      tol: this.percent(this.tol()),
      shape: this.shape() === 'bell' ? w.shapeBellSpoken : w.shapeFlatSpoken,
      nominal: this.volts(this.nominal()),
      lo95: this.volts(stats.lo95),
      hi95: this.volts(stats.hi95),
      far: this.volts(stats.furthest),
      farRel: this.farRelText(),
      low: this.volts(worst.low),
      high: this.volts(worst.high),
    });
  });

  /* Writes. */

  /** Seed + 1, wrapping at 2³²; then the one announcement the panel makes. */
  protected newBatch(): void {
    this.batch.update((k) => (k + 1) >>> 0);
    this.announcement.set(
      fill(this.t().widget.newBatchSpoken, {
        k: String(this.batch()),
        rel95: this.rel95Text(),
        farRel: this.farRelText(),
      }),
    );
  }

  /* Formatting. */

  protected text(value: number, unit: string): string {
    return formatSI(value, unit, this.i18n.lang());
  }

  protected volts(value: number): string {
    return formatSI(value, 'V', this.i18n.lang(), VOLT_FIGURES);
  }

  /** A resistor's value with its tolerance: `10 kΩ ±5%` / `10 kΩ ±5 %`. */
  protected partText(ohms: number): string {
    return `${this.text(ohms, 'Ω')} ±${this.percent(this.tol())}`;
  }

  /** One decimal (brief §4). */
  private percent(fraction: number): string {
    return formatPercent(fraction, this.i18n.lang(), 1);
  }

  /** `+3.7%` / `-3.9%`; a value that shows as 0 gets no sign. */
  private signedPercent(fraction: number): string {
    const text = this.percent(fraction);
    return fraction > 0 && /[1-9]/.test(text) ? `+${text}` : text;
  }
}
