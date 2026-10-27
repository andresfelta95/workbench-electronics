/**
 * The arithmetic behind the `ohm-law` instrument: V = I × R with one of the
 * three quantities derived from the other two, and the power P = V × I.
 *
 * The instrument keeps all three values in state; whichever one is the
 * unknown is ignored and recomputed, so switching the unknown can freeze the
 * displayed numbers into state without them jumping.
 */

/** Which quantity the instrument derives. */
export type OhmUnknown = 'i' | 'v' | 'r';

export interface OhmInput {
  readonly unknown: OhmUnknown;
  /** Volts. Ignored when `unknown` is 'v'. */
  readonly v: number;
  /** Amps. Ignored when `unknown` is 'i'. */
  readonly i: number;
  /** Ohms. Ignored when `unknown` is 'r'. */
  readonly r: number;
}

export interface OhmResult {
  readonly voltage: number;
  readonly current: number;
  readonly resistance: number;
  /** Watts turned into heat in the resistor, V × I. */
  readonly power: number;
}

/**
 * Solves V = I × R for the unknown. No guards: a zero divisor gives Infinity
 * or NaN, which `formatSI` shows as "—" (the controls never reach zero).
 */
export function solveOhm({ unknown, v, i, r }: OhmInput): OhmResult {
  const voltage = unknown === 'v' ? i * r : v;
  const resistance = unknown === 'r' ? v / i : r;
  const current = unknown === 'i' ? v / r : i;
  return { voltage, current, resistance, power: voltage * current };
}

/** How the power compares with the two common resistor ratings. */
export type PowerLevel = 'ok' | 'over-tenth' | 'over-quarter';

/** Past 1/10 W (a small surface-mount part) and past 1/4 W (a leaded part). */
export function powerLevel(watts: number): PowerLevel {
  if (watts > 0.25) return 'over-quarter';
  if (watts > 0.1) return 'over-tenth';
  return 'ok';
}

/**
 * Wire animation speed, 0..1, log-scaled so it reads across five decades of
 * current (10 µA to 1 A). Zero, negative or non-finite current stops it.
 */
export function ohmFlow(amps: number): number {
  if (!Number.isFinite(amps) || amps <= 0) return 0;
  return Math.min(1, Math.max(0.08, (Math.log10(amps) + 5) / 5));
}
