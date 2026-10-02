import { Component, computed, inject, input, linkedSignal } from '@angular/core';
import { I18n } from '../../core/i18n';
import { formatSI, parseValue } from '../../core/format';
import { SCHEMATIC, type SchDirection } from '../../schematic/schematic';
import { Control } from '../../ui/control';
import { Panel } from '../../ui/panel';
import { Readout, type ReadoutTone } from '../../ui/readout';
import { solveKirchhoff, type LoopSum, type SourceState } from './kirchhoff-math';

/** The course's safety ceiling for anything it suggests building (ROADMAP §3.1). */
const V_MAX = 24;
const R_MIN = 10;
const R_MAX = 100000;

type Point = readonly [number, number];

/** Each branch's wires, in SVG units, listed the way positive current flows
 *  (see the sign convention in kirchhoff-math.ts). A negative current walks
 *  them backwards, so the flow animation runs the way the charge does. */
const BRANCH_1: readonly (readonly Point[])[] = [
  [
    [30, 50],
    [80, 50],
  ],
  [
    [130, 50],
    [160, 50],
  ],
  [
    [160, 150],
    [30, 150],
    [30, 95],
  ],
];
const BRANCH_2: readonly (readonly Point[])[] = [
  [
    [160, 50],
    [160, 90],
  ],
  [
    [160, 130],
    [160, 150],
  ],
];
const BRANCH_3: readonly (readonly Point[])[] = [
  [
    [270, 50],
    [240, 50],
  ],
  [
    [190, 50],
    [160, 50],
  ],
  [
    [160, 150],
    [270, 150],
    [270, 95],
  ],
];

interface Wire {
  d: string;
  flow: number;
}

interface Arrow {
  dir: SchDirection;
  off: boolean;
  /** A current running against its positive direction is drawn hot. */
  hot: boolean;
}

interface ReadoutRow {
  label: string;
  value: string;
  note: string;
  tone: ReadoutTone;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function toPath(points: readonly Point[], forward: boolean): string {
  const ordered = forward ? points : [...points].reverse();
  return ordered.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x} ${y}`).join(' ');
}

/** Log-scaled like the divider's, so the animation reads from 1 µA to 1 A. */
function normalise(amps: number): number {
  const magnitude = Math.abs(amps);
  if (!Number.isFinite(magnitude) || magnitude <= 0) return 0;
  return Math.min(1, Math.max(0.08, (Math.log10(magnitude) + 6) / 6));
}

/** A narrow readout may wrap a note, but never between a number and its unit. */
function unbroken(text: string): string {
  return text.replace(/ /g, ' ');
}

function arrow(current: number, forward: SchDirection, backward: SchDirection): Arrow {
  return { dir: current < 0 ? backward : forward, off: current === 0, hot: current < 0 };
}

const STATE_TONE: Record<SourceState, ReadoutTone> = {
  delivering: 'signal',
  absorbing: 'warn',
  none: 'plain',
};

/**
 * Two sources feeding one node through three resistors: a network series and
 * parallel cannot reduce. Whatever the values, the currents at node A and the
 * voltages around each loop add up to zero, and when one source is weak
 * enough the other pushes current backwards into it, which the arrow, the
 * sign and the source's status all show at the same moment.
 */
@Component({
  selector: 'app-kirchhoff',
  imports: [...SCHEMATIC, Panel, Control, Readout],
  template: `
    <app-panel [heading]="heading" [headingLabel]="t().widget.kirchhoffSpoken">
      <div panelFigure class="figure">
        <sch-canvas [w]="32" [h]="18" [label]="summary()">
          @for (wire of wires(); track $index) {
            <svg:g schWire [d]="wire.d" [flow]="wire.flow" />
          }

          <svg:g
            schSource
            [x]="3"
            [y]="5"
            [value]="text(v1(), 'V')"
            [highlight]="result().s1 === 'absorbing'"
          />
          <svg:g schLabel [x]="4.8" [y]="6.4" text="V1" />
          <svg:g
            schSource
            [x]="27"
            [y]="5"
            [value]="text(v2(), 'V')"
            [highlight]="result().s2 === 'absorbing'"
          />
          <svg:g schLabel [x]="28.8" [y]="6.4" text="V2" />

          <svg:g schResistor [x]="8" [y]="5" name="R1" [value]="text(r1(), 'Ω')" />
          <svg:g
            schResistor
            [x]="16"
            [y]="9"
            [vertical]="true"
            name="R2"
            [value]="text(r2(), 'Ω')"
          />
          <svg:g schResistor [x]="19" [y]="5" name="R3" [value]="text(r3(), 'Ω')" />

          <svg:g schJunction [x]="16" [y]="5" />
          <svg:g schJunction [x]="16" [y]="15" />
          <svg:g schGround [x]="16" [y]="15" />
          <svg:g schLabel [x]="16" [y]="2.4" [text]="nodeLabel()" [accent]="true" anchor="middle" />

          <svg:g
            schCurrent
            [x]="14.5"
            [y]="5"
            name="I1"
            [dir]="arrows().i1.dir"
            [off]="arrows().i1.off"
            [highlight]="arrows().i1.hot"
          />
          <svg:g
            schCurrent
            [x]="16"
            [y]="7"
            name="I2"
            [dir]="arrows().i2.dir"
            [off]="arrows().i2.off"
            [highlight]="arrows().i2.hot"
          />
          <svg:g
            schCurrent
            [x]="17.5"
            [y]="5"
            name="I3"
            [dir]="arrows().i3.dir"
            [off]="arrows().i3.off"
            [highlight]="arrows().i3.hot"
          />
        </sch-canvas>
      </div>

      <div panelControls>
        <app-control label="V1" unit="V" [min]="0" [max]="vMax" [(value)]="v1" />
        <app-control label="V2" unit="V" [min]="0" [max]="vMax" [(value)]="v2" />
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
          label="R3"
          unit="Ω"
          [min]="rMin"
          [max]="rMax"
          [log]="true"
          [e24]="true"
          [(value)]="r3"
        />
        <p class="convention pix-rule">{{ t().widget.signConvention }}</p>
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

    .convention {
      margin: 0;
      font-family: var(--pix-font);
      font-size: var(--pix-text);
      line-height: 1.15;
      color: var(--pix-muted);
    }
  `,
})
export class KirchhoffWidget {
  readonly props = input<Record<string, string>>({});

  private readonly i18n = inject(I18n);
  protected readonly t = this.i18n.t;

  protected readonly vMax = V_MAX;
  protected readonly rMin = R_MIN;
  protected readonly rMax = R_MAX;

  /** Nameplate: both laws at once. Σ is Greek, so JetBrains Mono draws it,
   *  from the slice already fetched for Ω. The spoken form says it in words. */
  protected readonly heading = 'ΣI = 0, ΣV = 0';

  // Seeded from the directive and clamped to what the controls allow, so a
  // preset can never show more than the course's 24 V ceiling.
  protected readonly v1 = linkedSignal(() => this.volts('v1', 9));
  protected readonly v2 = linkedSignal(() => this.volts('v2', 6));
  protected readonly r1 = linkedSignal(() => this.ohms('r1', 1000));
  protected readonly r2 = linkedSignal(() => this.ohms('r2', 1000));
  protected readonly r3 = linkedSignal(() => this.ohms('r3', 1000));

  protected readonly result = computed(() =>
    solveKirchhoff({ v1: this.v1(), v2: this.v2(), r1: this.r1(), r2: this.r2(), r3: this.r3() }),
  );

  protected readonly wires = computed<Wire[]>(() => {
    const { i1, i2, i3 } = this.result();
    const branch = (points: readonly (readonly Point[])[], amps: number): Wire[] =>
      points.map((p) => ({ d: toPath(p, amps >= 0), flow: normalise(amps) }));
    return [...branch(BRANCH_1, i1), ...branch(BRANCH_2, i2), ...branch(BRANCH_3, i3)];
  });

  protected readonly arrows = computed(() => {
    const { i1, i2, i3 } = this.result();
    return {
      i1: arrow(i1, 'right', 'left'),
      i2: arrow(i2, 'down', 'up'),
      i3: arrow(i3, 'left', 'right'),
    };
  });

  protected readonly nodeLabel = computed(() => `VA = ${this.text(this.result().va, 'V')}`);

  protected readonly readouts = computed<ReadoutRow[]>(() => {
    const w = this.t().widget;
    const r = this.result();
    const branch = (name: string, resistor: string, amps: number, note: string): ReadoutRow => ({
      label: `${name} (${w.branch} ${resistor})`,
      value: this.text(amps, 'A'),
      note,
      tone: 'plain',
    });
    const power = (name: string, watts: number, state: SourceState): ReadoutRow => ({
      label: `${w.power} ${name}`,
      value: this.text(watts, 'W'),
      note: this.stateText(state),
      tone: STATE_TONE[state],
    });
    const loop = (label: string, formula: string, sum: LoopSum): ReadoutRow => ({
      label: `${label}: ${formula}`,
      value: this.text(sum.sum, 'V'),
      note: this.terms(sum.terms, 'V'),
      tone: 'signal',
    });

    // Two per row on a wide panel: the V1 side on the left, the V2 side on
    // the right, then the three checks.
    return [
      { label: w.nodeVoltage, value: this.text(r.va, 'V'), note: '', tone: 'accent' },
      branch('I2', 'R2', r.i2, this.direction(r.i2, 'A', w.ground)),
      branch('I1', 'R1', r.i1, this.direction(r.i1, 'V1', 'A')),
      branch('I3', 'R3', r.i3, this.direction(r.i3, 'V2', 'A')),
      power('V1', r.p1, r.s1),
      power('V2', r.p2, r.s2),
      {
        label: `${w.kcl}: I1 + I3 - I2`,
        value: this.text(r.kcl, 'A'),
        note: `${unbroken(`${w.currentIn} ${this.text(r.currentIn, 'A')}`)} = ${unbroken(`${w.currentOut} ${this.text(r.currentOut, 'A')}`)}`,
        tone: 'signal',
      },
      loop(w.kvlLeft, 'V1 - I1·R1 - I2·R2', r.kvlLeft),
      loop(w.kvlRight, 'V2 - I3·R3 - I2·R2', r.kvlRight),
    ];
  });

  /** The drawing's text equivalent: the circuit, then every current with the
   *  way it flows, then what each source is doing. Multiplication is not
   *  needed here, so nothing is left for a screen reader to mispronounce. */
  protected readonly summary = computed(() => {
    const w = this.t().widget;
    const r = this.result();
    const current = (name: string, amps: number, from: string, to: string) =>
      `${name} ${this.text(Math.abs(amps), 'A')}, ${this.direction(amps, from, to)}.`;
    const source = (name: string, volts: number, watts: number, state: SourceState) =>
      `${name} ${this.text(volts, 'V')}: ${this.stateText(state)}, ${this.text(Math.abs(watts), 'W')}.`;
    return [
      w.kirchhoffCircuit,
      `R1 ${this.text(this.r1(), 'Ω')}, R2 ${this.text(this.r2(), 'Ω')}, R3 ${this.text(this.r3(), 'Ω')}.`,
      `${w.nodeVoltage}: ${this.text(r.va, 'V')}.`,
      current('I1', r.i1, 'V1', 'A'),
      current('I2', r.i2, 'A', w.ground),
      current('I3', r.i3, 'V2', 'A'),
      source('V1', this.v1(), r.p1, r.s1),
      source('V2', this.v2(), r.p2, r.s2),
    ].join(' ');
  });

  protected text(value: number, unit: string): string {
    return formatSI(value, unit, this.i18n.lang());
  }

  /** "from V1 to A" for a positive current, "from A to V1" for a negative one. */
  private direction(amps: number, from: string, to: string): string {
    const w = this.t().widget;
    if (amps === 0) return w.noCurrent;
    const [a, b] = amps > 0 ? [from, to] : [to, from];
    return `${w.from} ${a} ${w.to} ${b}`;
  }

  private stateText(state: SourceState): string {
    const w = this.t().widget;
    if (state === 'delivering') return w.delivering;
    if (state === 'absorbing') return w.absorbing;
    return w.noPower;
  }

  /** "9 V - 4 V - 5 V": each term with its own sign, so the zero can be checked by eye. */
  private terms(terms: readonly number[], unit: string): string {
    return terms
      .map((term, i) => {
        if (i === 0) return unbroken(this.text(term, unit));
        return unbroken(`${term < 0 ? '-' : '+'} ${this.text(Math.abs(term), unit)}`);
      })
      .join(' ');
  }

  private volts(key: string, fallback: number): number {
    return clamp(parseValue(this.props()[key], fallback), 0, V_MAX);
  }

  private ohms(key: string, fallback: number): number {
    return clamp(parseValue(this.props()[key], fallback), R_MIN, R_MAX);
  }
}
