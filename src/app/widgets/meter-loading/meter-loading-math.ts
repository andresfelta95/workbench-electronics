import { parallel } from '../../core/format';

/**
 * The arithmetic behind the `meter-loading` instrument: how much a meter
 * changes what it measures.
 *
 * Voltmeter across R2 of a divider (R1 on top), input resistance Rin:
 *   Vtrue = Vin · R2 / (R1 + R2)
 *   Vread = Vin · (R2 ∥ Rin) / (R1 + (R2 ∥ Rin)) = Vtrue · Rin / (Zout + Rin)
 *   e     = (Vread − Vtrue) / Vtrue = −Zout / (Zout + Rin),  Zout = R1 ∥ R2
 *
 * Ammeter in series with a load RL, meter resistance Rm:
 *   Itrue = Vin / RL
 *   Iread = Vin / (RL + Rm) = Itrue · RL / (RL + Rm)
 *   e     = −Rm / (RL + Rm),  burden voltage Vb = Iread · Rm
 */

export type MeterMode = 'voltage' | 'current';
export type CurrentRange = 'mA' | 'A';

/** Typical meter resistance per current range, derived from burden voltage
 *  (Fluke 87V: 1.8 mV/mA, 0.03 V/A; fluke-80v-manual Table 14). Not a
 *  published resistance. */
export const RANGE_OHMS: Readonly<Record<CurrentRange, number>> = { mA: 1.8, A: 0.03 };
/** The mA input's full scale (400 mA); above it the meter shows OL. */
export const RANGE_FULL_SCALE: Readonly<Record<CurrentRange, number>> = { mA: 0.4, A: 10 };

export interface VoltmeterInput {
  /** Supply, volts. */
  readonly vin: number;
  readonly r1: number;
  /** The resistor being measured. */
  readonly r2: number;
  /** Voltmeter input resistance, ohms; Infinity is an ideal meter. */
  readonly rin: number;
}

export interface VoltmeterResult {
  /** V across R2 with the meter connected. */
  readonly reading: number;
  /** V across R2 with no meter. */
  readonly trueValue: number;
  /** Fraction, ≤ 0; 0 when trueValue is 0. */
  readonly error: number;
  /** R1 ∥ R2, ohms. */
  readonly zout: number;
  /** A into the meter. */
  readonly iMeter: number;
  /** A from the supply, meter connected. */
  readonly iSupply: number;
}

export function solveVoltmeter({ vin, r1, r2, rin }: VoltmeterInput): VoltmeterResult {
  // R2 as the circuit sees it once the meter is across it.
  const r2Loaded = parallel(r2, rin);
  const loadedTotal = r1 + r2Loaded;
  const reading = loadedTotal === 0 ? 0 : (vin * r2Loaded) / loadedTotal;
  const total = r1 + r2;
  const trueValue = total === 0 ? 0 : (vin * r2) / total;
  const error = trueValue === 0 ? 0 : (reading - trueValue) / trueValue;
  const zout = parallel(r1, r2);
  const iSupply = loadedTotal === 0 ? 0 : vin / loadedTotal;
  let iMeter: number;
  if (!Number.isFinite(rin)) iMeter = 0;
  // A shorted meter takes the whole supply current away from R2.
  else if (rin === 0) iMeter = iSupply;
  else iMeter = reading / rin;
  return { reading, trueValue, error, zout, iMeter, iSupply };
}

export interface AmmeterInput {
  readonly vin: number;
  readonly rLoad: number;
  readonly range: CurrentRange;
}

export interface AmmeterResult {
  /** A through the loop with the meter in it. */
  readonly reading: number;
  /** A with the meter replaced by a wire. */
  readonly trueValue: number;
  readonly error: number;
  /** V across the meter. */
  readonly burden: number;
  /** RANGE_OHMS[range]. */
  readonly rMeter: number;
  /** reading > RANGE_FULL_SCALE[range]. */
  readonly overRange: boolean;
}

/** The ammeter loop for any meter resistance (the range-free core of solveAmmeter). */
export function solveAmmeterOhms(
  vin: number,
  rLoad: number,
  rMeter: number,
): Omit<AmmeterResult, 'overRange'> {
  // A zero resistance with a non-zero supply is a short: infinite current, which
  // the formatters show as "—". With no supply there is no current at all.
  const amps = (ohms: number) => (ohms === 0 ? (vin === 0 ? 0 : Infinity) : vin / ohms);
  const trueValue = amps(rLoad);
  const reading = amps(rLoad + rMeter);
  let error: number;
  if (trueValue === 0) error = 0;
  // No finite reference: a finite reading is all error, an infinite one none.
  else if (!Number.isFinite(trueValue)) error = Number.isFinite(reading) ? -1 : 0;
  else error = (reading - trueValue) / trueValue;
  const burden = rMeter === 0 ? 0 : reading * rMeter;
  return { reading, trueValue, error, burden, rMeter };
}

export function solveAmmeter({ vin, rLoad, range }: AmmeterInput): AmmeterResult {
  const result = solveAmmeterOhms(vin, rLoad, RANGE_OHMS[range]);
  return { ...result, overRange: result.reading > RANGE_FULL_SCALE[range] };
}

export type ErrorTone = 'signal' | 'warn' | 'danger';

/** < 1 % signal, < 10 % warn, otherwise danger (the divider's thresholds). */
export function errorTone(error: number): ErrorTone {
  const magnitude = Math.abs(error);
  if (magnitude < 0.01) return 'signal';
  if (magnitude < 0.1) return 'warn';
  return 'danger';
}

/** Wire speed 0..1, log over 1 µA–1 A, min 0.08 for any positive current
 *  (the divider's dividerFlow); 0 for zero, negative or non-finite. */
export function meterFlow(amps: number): number {
  if (!Number.isFinite(amps) || amps <= 0) return 0;
  return Math.min(1, Math.max(0.08, (Math.log10(amps) + 6) / 6));
}

/** Normalises the `mode` prop: anything but 'current' is 'voltage'. */
export function parseMode(raw: string | undefined): MeterMode {
  return raw === 'current' ? 'current' : 'voltage';
}

/** Normalises the `range` prop: anything but 'A' is 'mA'. */
export function parseRange(raw: string | undefined): CurrentRange {
  return raw === 'A' ? 'A' : 'mA';
}
