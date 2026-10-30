import { parallel } from '../../core/format';

/**
 * The arithmetic behind the `thevenin` instrument: a real source is an ideal
 * voltage Voc in series with an internal resistance Rint, and a load RL across
 * its terminals.
 *
 *   I    = Voc / (Rint + RL)
 *   V    = Voc − I · Rint = Voc · RL / (Rint + RL)
 *   P    = I² · RL,  Pint = I² · Rint,  efficiency = RL / (RL + Rint)
 *   Isc  = Voc / Rint            (computed, never measured)
 *   Pmax = Voc² / (4 · Rint)     at RL = Rint, where the efficiency is 50 %
 *
 * A voltage divider seen from its output is a source of the same kind
 * (Thévenin): Vth = Vin · R2 / (R1 + R2), Rth = R1 ∥ R2 (00-03's unloaded
 * output and output impedance). The equivalent predicts everything the load
 * sees; the heat inside comes from the real divider.
 *
 * Model assumptions (brief D-25):
 *   1. Rint is constant: it does not change with current, time, charge or
 *      temperature. Real cells' Rint rises as they run down and as they cool,
 *      and the maker calls the loaded-voltage estimate "a general guideline"
 *      (energizer-ir-bulletin p. 2).
 *   2. Voc is constant. A cell's voltage also falls as it discharges (an
 *      alkaline from 1.6 V towards 0.9 V, energizer-alkaline-handbook p. 3; a
 *      NiMH from about 1.4 V to its 1.2 V plateau, energizer-nimh-handbook p. 6).
 *   3. The figures at amps (the left half of the curve and the peaks) are the
 *      straight-line model's prediction, far outside how makers test or rate
 *      these cells.
 */

export type SourceKey = 'aa' | '9v' | 'nimh' | 'cr2032' | 'custom' | 'divider';
export type CellKey = 'aa' | '9v' | 'nimh' | 'cr2032';

export interface Cell {
  /** Open-circuit voltage used, V (fresh). */
  readonly voc: number;
  /** Internal resistance used, Ω (fresh, room temperature, DC method). */
  readonly rint: number;
  /** Which battery symbol draws it. */
  readonly symbol: 'cell' | 'battery';
}

/** One value per preset: fresh, room temperature, DC (pulse or load-step) method.
 *  AA: Rint stated, energizer-lithium-coin-manual p. 4 ("near 0.25 ohms"),
 *  inside energizer-ir-bulletin p. 1 (150–300 mΩ fresh, DC pulse); Voc 1.6 V,
 *  a course choice anchored to energizer-alkaline-handbook p. 3 and
 *  energizer-ir-bulletin p. 2.
 *  9 V: Rint typical, derived: duracell-mn1604 p. 2 (about 2.3 Ω DC near the
 *  start, read from the curve); Voc derived, the middle of its 9.5–9.7 V fresh.
 *  NiMH: Rint stated, energizer-nh15-2500 p. 1 (30 mΩ charged, ±20 %); Voc
 *  stated, its nominal 1.2 V.
 *  CR2032 (simulation only): Rint stated, energizer-lithium-coin-manual p. 4
 *  (near 10 Ω fresh); Voc 3.2 V, the maintainer's value (brief D-9). */
export const CELLS: Readonly<Record<CellKey, Cell>> = {
  aa: { voc: 1.6, rint: 0.25, symbol: 'cell' },
  '9v': { voc: 9.6, rint: 2.3, symbol: 'battery' },
  nimh: { voc: 1.2, rint: 0.03, symbol: 'cell' },
  cr2032: { voc: 3.2, rint: 10, symbol: 'cell' },
};

/** A 10 MΩ voltmeter (stated: fluke-80v-manual Table 18, fluke-11x-manual
 *  Table 7), for meterReading only: nothing is drawn. */
export const METER_RIN = 10e6;

export interface SourceInput {
  readonly voc: number;
  readonly rint: number;
  readonly rload: number;
  readonly loaded: boolean;
}

export interface SourceResult {
  /** V across the terminals (Voc when unloaded). */
  readonly terminal: number;
  /** V lost inside, Voc − terminal (Vth − V in divider mode). */
  readonly drop: number;
  /** A through the load; 0 unloaded. */
  readonly current: number;
  /** W in RL. */
  readonly loadPower: number;
  /** W heating the source (divider: the real R1 + R2). */
  readonly internalPower: number;
  /** loadPower / (power the source gives); 0 when no load; never NaN. */
  readonly efficiency: number;
  /** A, Voc / Rint (Vth / Rth), computed. */
  readonly isc: number;
  /** W, Voc² / (4 · Rint). */
  readonly pmax: number;
  /** loadPower / pmax; 0 when pmax is 0 or not finite. */
  readonly fractionOfMax: number;
  /** loaded && internalPower > loadPower. */
  readonly heatWarn: boolean;
}

/** NaN in, 0 used: no field of a result is ever NaN. */
function clean(value: number): number {
  return Number.isNaN(value) ? 0 : value;
}

/** a / b, with 0 / 0 = 0 and x / 0 = Infinity. */
function ratio(a: number, b: number): number {
  if (b === 0) return a === 0 ? 0 : Infinity;
  return a / b;
}

export function solveSource(input: SourceInput): SourceResult {
  const voc = clean(input.voc);
  const rint = clean(input.rint);
  const rload = clean(input.rload);
  const isc = ratio(voc, rint);
  const pmax = ratio(voc * voc, 4 * rint);
  const connected = input.loaded && Number.isFinite(rload);
  const total = rint + rload;
  if (!connected || total === 0 || voc === 0) {
    // Open circuit (or nothing to drive a current): the terminals read Voc.
    // Rint + RL = 0 is guarded to all zeros.
    const terminal = connected ? 0 : voc;
    return {
      terminal,
      drop: voc - terminal,
      current: 0,
      loadPower: 0,
      internalPower: 0,
      efficiency: 0,
      isc,
      pmax,
      fractionOfMax: 0,
      heatWarn: false,
    };
  }
  const current = voc / total;
  const terminal = (voc * rload) / total;
  const loadPower = current * current * rload;
  const internalPower = current * current * rint;
  return {
    terminal,
    drop: voc - terminal,
    current,
    loadPower,
    internalPower,
    // The same current flows through both, so power splits as the resistances.
    efficiency: rload / total,
    isc,
    pmax,
    fractionOfMax: fraction(loadPower, pmax),
    heatWarn: internalPower > loadPower,
  };
}

function fraction(power: number, pmax: number): number {
  return Number.isFinite(pmax) && pmax > 0 ? power / pmax : 0;
}

export interface DividerSourceInput {
  readonly vin: number;
  readonly r1: number;
  readonly r2: number;
  readonly rload: number;
  readonly loaded: boolean;
}

export interface DividerSourceResult extends SourceResult {
  readonly vth: number;
  readonly rth: number;
  /** Vin · I_R1. */
  readonly supplyPower: number;
}

/** Vth = Vin · R2 / (R1 + R2), Rth = R1 ∥ R2 (00-03). */
export function theveninOf(vin: number, r1: number, r2: number): { vth: number; rth: number } {
  const total = clean(r1) + clean(r2);
  const vth = total === 0 ? 0 : (clean(vin) * clean(r2)) / total;
  return { vth: clean(vth), rth: clean(parallel(clean(r1), clean(r2))) };
}

/** Load side from the equivalent; internalPower and efficiency from the real divider. */
export function solveDividerSource(input: DividerSourceInput): DividerSourceResult {
  const vin = clean(input.vin);
  const r1 = clean(input.r1);
  const r2 = clean(input.r2);
  const { vth, rth } = theveninOf(vin, r1, r2);
  const side = solveSource({ voc: vth, rint: rth, rload: input.rload, loaded: input.loaded });
  // As solveSource: a load of Infinity is no load.
  const connected = input.loaded && Number.isFinite(clean(input.rload));
  let internalPower: number;
  if (connected) {
    // The real divider: R1 carries Vin − V, R2 carries V. A zero resistance
    // takes no power (its current is finite through the other parts).
    const v = side.terminal;
    const inR1 = r1 === 0 ? 0 : ((vin - v) * (vin - v)) / r1;
    const inR2 = r2 === 0 ? 0 : (v * v) / r2;
    internalPower = inR1 + inR2;
  } else {
    internalPower = r1 + r2 === 0 ? 0 : (vin * vin) / (r1 + r2);
  }
  internalPower = clean(internalPower);
  // Vin · (Vin − V) / R1, written as what it equals (the energy balance), so
  // R1 = 0 needs no special case.
  const supplyPower = internalPower + side.loadPower;
  const efficiency = connected && supplyPower > 0 ? side.loadPower / supplyPower : 0;
  return {
    ...side,
    internalPower,
    efficiency,
    heatWarn: connected && internalPower > side.loadPower,
    vth,
    rth,
    supplyPower,
  };
}

/** Voc² · RL / (Rint + RL)², guarded. */
export function loadPower(voc: number, rint: number, rload: number): number {
  return solveSource({ voc, rint, rload, loaded: true }).loadPower;
}

/** n points, log-spaced from xMin to xMax inclusive, [RL, loadPower]. */
export function curvePoints(
  voc: number,
  rint: number,
  xMin: number,
  xMax: number,
  n = 121,
): [number, number][] {
  if (!(xMin > 0) || !(xMax > xMin) || !Number.isFinite(xMax)) return [];
  const count = Math.max(2, Math.floor(n));
  const lo = Math.log(xMin);
  const span = Math.log(xMax) - lo;
  const out: [number, number][] = [];
  for (let i = 0; i < count; i++) {
    const x = i === 0 ? xMin : i === count - 1 ? xMax : Math.exp(lo + (span * i) / (count - 1));
    out.push([x, loadPower(voc, rint, x)]);
  }
  return out;
}

/** RL · (Voc − V) / V: the two-reading method with a known load (D-4). */
export function rintFromReadings(voc: number, vLoaded: number, rload: number): number {
  return clean(ratio(rload * (voc - vLoaded), vLoaded));
}

/** What a voltmeter of `rin` reads across an open source: Voc · Rin / (Rin + Rint). */
export function meterReading(voc: number, rint: number, rin = METER_RIN): number {
  return clean(rin + rint === 0 ? 0 : (voc * rin) / (rin + rint));
}

/** warn when heatWarn, otherwise plain. Never signal or danger (§4). */
export function heatTone(result: SourceResult): 'plain' | 'warn' {
  return result.heatWarn ? 'warn' : 'plain';
}

/** Wire speed 0..1, log over 1 µA – 10 A, min 0.08 for any positive current;
 *  0 for zero, negative or non-finite. */
export function sourceFlow(amps: number): number {
  if (!Number.isFinite(amps) || amps <= 0) return 0;
  return Math.min(1, Math.max(0.08, (Math.log10(amps) + 6) / 7));
}

const SOURCE_KEYS: readonly SourceKey[] = ['aa', '9v', 'nimh', 'cr2032', 'custom', 'divider'];

/** Normalises the `source` prop (case-sensitive): unknown → 'aa'. */
export function parseSource(raw: string | undefined): SourceKey {
  return SOURCE_KEYS.find((key) => key === raw) ?? 'aa';
}

/** Normalises the `loaded` prop: 'false' → false, anything else → true. */
export function parseLoaded(raw: string | undefined): boolean {
  return raw !== 'false';
}

/** True for the four battery presets. */
export function isCell(key: SourceKey): key is CellKey {
  return key in CELLS;
}
