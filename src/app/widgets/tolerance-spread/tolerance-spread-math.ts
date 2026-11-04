/**
 * Monte Carlo of an unloaded divider built from toleranced parts
 * (tolerance-spread brief §5).
 *
 * Everything about the random model is a labelled assumption, and the lesson
 * says so:
 * 1. Each part's value is independent of the other's (ti-snva112 §5).
 * 2. The shape inside the band is unknown, because makers do not publish it
 *    (ti-snva112 §6). `bell` follows TI's assumption and its one measured
 *    histogram of 1 % parts (one peak); `flat` is the pessimistic case. Neither
 *    is a measurement of 5 % parts.
 * 3. No part falls outside its band: the bell is truncated at three standard
 *    deviations, as if every part were tested and the outliers rejected
 *    (vishay-mbx-sma p. 7, "100 % of the individual resistors").
 * 4. Vin is exact; there is no load, temperature or ageing.
 *
 * Determinism (brief D-3, D-10): the generator uses only 32-bit integer
 * operations and +, −, ·, /, which IEEE 754 rounds the same way in every
 * engine, so the server prerender and the browser draw the same histogram.
 * No Math.log, Math.cos or Math.exp, which ECMA-262 lets engines approximate.
 */

export type ToleranceKey = '5' | '1';
export type ShapeKey = 'bell' | 'flat';

/** Gold 5 % (J), brown 1 % (F): tt-tn004 p. 1. */
export const TOLERANCES: Readonly<Record<ToleranceKey, number>> = { '5': 0.05, '1': 0.01 };
/** Simulated builds per batch (brief D-11). */
export const BUILDS = 1000;
/** Histogram bins: 4 units each across the 264-unit plot. */
export const BINS = 66;
/** The x axis runs ± SPAN × the 5 % worst-case deviation, whatever tolerance is shown (D-8). */
export const SPAN = 1.1;
/** Bell: standard deviation = tolerance / 3 (D-2; knudtsen-2022 Appendix B). */
export const SIGMA_FRACTION = 1 / 3;
/** The seed the instrument starts on; every prose figure is batch 1. */
export const FIRST_BATCH = 1;

/** Sum-of-twelve uniforms has variance 1; outside ±3 it is redrawn. */
const BELL_TERMS = 12;
const BELL_LIMIT = 3;

/** mulberry32: uniform in [0, 1), bit-identical in every engine. Any seed
 *  (0, negative, non-integer, NaN) becomes a valid 32-bit state via `>>> 0`. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), a | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function count(builds: number): number {
  return Number.isFinite(builds) && builds > 0 ? Math.floor(builds) : 0;
}

/**
 * 2 · builds deviates in −1 … +1, as fractions of the tolerance: R1's then
 * R2's for each build in turn. Bell: twelve consecutive uniforms summed, minus
 * 6; if the result is beyond ±3, all twelve are discarded and twelve more
 * drawn; divided by 3. Flat: 2u − 1.
 */
export function deviates(seed: number, builds: number, shape: ShapeKey): Float64Array {
  const n = 2 * count(builds);
  const out = new Float64Array(n);
  const next = mulberry32(seed);
  for (let i = 0; i < n; i++) {
    if (shape === 'flat') {
      out[i] = 2 * next() - 1;
      continue;
    }
    let z: number;
    do {
      z = -BELL_TERMS / 2;
      for (let j = 0; j < BELL_TERMS; j++) z += next();
    } while (Math.abs(z) > BELL_LIMIT);
    out[i] = z / BELL_LIMIT;
  }
  return out;
}

/** Unloaded divider output, Vin · R2 / (R1 + R2); 0 whenever that is not a number. */
export function dividerOut(vin: number, r1: number, r2: number): number {
  const v = (vin * r2) / (r1 + r2);
  return Number.isFinite(v) ? v : 0;
}

export interface WorstCase {
  readonly low: number;
  readonly high: number;
  /** max(nominal − low, high − nominal) / nominal; 0 if nominal is 0. */
  readonly rel: number;
}

function finiteOr0(value: number): number {
  return Number.isFinite(value) ? value : 0;
}

/** Relative deviation from nominal; 0 when nominal is 0 or nothing is a number. */
function relative(value: number, nominal: number): number {
  return nominal !== 0 ? finiteOr0((value - nominal) / nominal) : 0;
}

/** All extremes at once (ti-snva112 §3, Equations 2–3, in this circuit's form). */
export function worstCase(vin: number, r1: number, r2: number, tol: number): WorstCase {
  const t = finiteOr0(tol);
  const nominal = dividerOut(vin, r1, r2);
  const low = dividerOut(vin, r1 * (1 + t), r2 * (1 - t));
  const high = dividerOut(vin, r1 * (1 - t), r2 * (1 + t));
  const rel = Math.max(-relative(low, nominal), relative(high, nominal), 0);
  return { low, high, rel };
}

/** One output per build: R1' = R1 (1 + t · d1), R2' = R2 (1 + t · d2). */
export function buildOutputs(
  dev: Float64Array,
  vin: number,
  r1: number,
  r2: number,
  tol: number,
): Float64Array {
  const t = finiteOr0(tol);
  const n = Math.floor(dev.length / 2);
  const out = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    out[i] = dividerOut(vin, r1 * (1 + t * dev[2 * i]), r2 * (1 + t * dev[2 * i + 1]));
  }
  return out;
}

export interface SpreadStats {
  readonly nominal: number;
  /** sorted[round(0.025 · n)]: the 26th of 1000. */
  readonly lo95: number;
  /** sorted[n − 1 − round(0.025 · n)]: the 975th of 1000. */
  readonly hi95: number;
  /** The larger side of the 95 % range, relative to nominal. */
  readonly rel95: number;
  /** The output with the largest |v − nominal| (the first one on a tie). */
  readonly furthest: number;
  /** Signed. */
  readonly furthestRel: number;
  readonly mean: number;
  /** Sample standard deviation (n − 1). */
  readonly sd: number;
}

/** The 95 % range is empirical (D-23): it holds exactly 950 of 1000 builds. */
export function spreadStats(outputs: Float64Array, nominal: number): SpreadStats {
  const nom = finiteOr0(nominal);
  const n = outputs.length;
  if (n === 0) {
    return { nominal: nom, lo95: 0, hi95: 0, rel95: 0, furthest: 0, furthestRel: 0, mean: 0, sd: 0 };
  }
  const values = Float64Array.from(outputs, finiteOr0);
  const sorted = Float64Array.from(values).sort();
  const cut = Math.round(0.025 * n);
  const lo95 = sorted[cut];
  const hi95 = sorted[n - 1 - cut];

  let furthest = values[0];
  let sum = 0;
  for (const v of values) {
    if (Math.abs(v - nom) > Math.abs(furthest - nom)) furthest = v;
    sum += v;
  }
  const mean = sum / n;
  let squares = 0;
  for (const v of values) squares += (v - mean) * (v - mean);
  const sd = n > 1 ? Math.sqrt(squares / (n - 1)) : 0;

  return {
    nominal: nom,
    lo95,
    hi95,
    rel95: Math.max(Math.abs(relative(lo95, nom)), Math.abs(relative(hi95, nom))),
    furthest,
    furthestRel: relative(furthest, nom),
    mean,
    sd,
  };
}

/** nominal ± SPAN · (5 % worst-case deviation, larger side); 0 … 0 when that is 0. */
export function axisRange(vin: number, r1: number, r2: number): { xMin: number; xMax: number } {
  const nominal = dividerOut(vin, r1, r2);
  const wc = worstCase(vin, r1, r2, TOLERANCES['5']);
  const dev = Math.max(nominal - wc.low, wc.high - nominal);
  if (!(dev > 0) || !Number.isFinite(dev)) return { xMin: 0, xMax: 0 };
  return { xMin: nominal - SPAN * dev, xMax: nominal + SPAN * dev };
}

/** Counts in `bins` equal bins over xMin … xMax. A value on an inner edge goes
 *  to the upper bin; values outside are clamped into the end bins; values that
 *  are not numbers are skipped. An empty or reversed range counts nothing. */
export function histogram(
  values: Float64Array,
  xMin: number,
  xMax: number,
  bins: number,
): number[] {
  const n = count(bins);
  const counts = new Array<number>(n).fill(0);
  const span = xMax - xMin;
  if (n === 0 || !(span > 0) || !Number.isFinite(span)) return counts;
  for (const v of values) {
    if (!Number.isFinite(v)) continue;
    const i = Math.floor(((v - xMin) / span) * n);
    counts[Math.min(n - 1, Math.max(0, i))]++;
  }
  return counts;
}

/** First-order σ_out / Vout: R1/(R1 + R2) · √2 · σ_part (ti-snva112 §4, §7). */
export function analyticSpread(r1: number, r2: number, tol: number, shape: ShapeKey): number {
  const k = finiteOr0(r1 / (r1 + r2));
  const sigmaPart = shape === 'flat' ? tol / Math.sqrt(3) : tol * SIGMA_FRACTION;
  return finiteOr0(k * Math.SQRT2 * sigmaPart);
}

/** Directive `tolerance`: '1' or, for anything else, '5' (case-sensitive). */
export function parseTolerance(raw: string | undefined): ToleranceKey {
  return raw === '1' ? '1' : '5';
}

/** Directive `shape`: 'flat' or, for anything else, 'bell' (case-sensitive). */
export function parseShape(raw: string | undefined): ShapeKey {
  return raw === 'flat' ? 'flat' : 'bell';
}
