import { parallel } from '../../core/format';

/**
 * The arithmetic behind the `divider` instrument: R1 from the supply to the
 * output, R2 from the output to ground, and an optional load RL across R2.
 *
 *   ideal:   Vout = Vin · R2 / (R1 + R2)
 *   loaded:  Vout = Vin · (R2 ∥ RL) / (R1 + (R2 ∥ RL))
 *   Zout  =  R1 ∥ R2   (what the load sees looking back into the output)
 */

export interface DividerInput {
  /** Supply, volts. */
  readonly vin: number;
  readonly r1: number;
  readonly r2: number;
  /** Load resistance, ohms. Ignored unless `loaded`. */
  readonly rLoad: number;
  readonly loaded: boolean;
}

export interface DividerResult {
  /** The output as built, with the load if it is connected. */
  readonly vout: number;
  /** The unloaded formula's answer. */
  readonly videal: number;
  /** (vout − videal) / videal, as a fraction; 0 when videal is 0. */
  readonly error: number;
  /** Output impedance, R1 ∥ R2, ohms. */
  readonly zout: number;
  /** Current into the load, amps; 0 with no load. */
  readonly iLoad: number;
  /** What the divider burns with nothing connected, Vin² / (R1 + R2). */
  readonly pQuiescent: number;
  /** Current drawn from the supply, amps. */
  readonly iTotal: number;
}

export function solveDivider({ vin, r1, r2, rLoad, loaded }: DividerInput): DividerResult {
  // R2 as the circuit actually sees it once something is hung off the output.
  const r2Effective = loaded ? parallel(r2, rLoad) : r2;
  const vout = (vin * r2Effective) / (r1 + r2Effective);
  const videal = (vin * r2) / (r1 + r2);
  const error = videal === 0 ? 0 : (vout - videal) / videal;
  const zout = parallel(r1, r2);
  const iLoad = loaded ? vout / rLoad : 0;
  const unloadedTotal = r1 + r2;
  const pQuiescent = unloadedTotal === 0 ? 0 : (vin * vin) / unloadedTotal;
  const total = r1 + r2Effective;
  const iTotal = total === 0 ? 0 : vin / total;
  return { vout, videal, error, zout, iLoad, pQuiescent, iTotal };
}

export type ErrorTone = 'signal' | 'warn' | 'danger';

/** Under 1 % is fine, under 10 % is a warning, beyond that the divider fails. */
export function errorTone(error: number): ErrorTone {
  const magnitude = Math.abs(error);
  if (magnitude < 0.01) return 'signal';
  if (magnitude < 0.1) return 'warn';
  return 'danger';
}

/**
 * Wire animation speed, 0..1, log-scaled across six decades of current
 * (1 µA to 1 A). Zero, negative or non-finite current stops it.
 */
export function dividerFlow(amps: number): number {
  if (!Number.isFinite(amps) || amps <= 0) return 0;
  return Math.min(1, Math.max(0.08, (Math.log10(amps) + 6) / 6));
}
