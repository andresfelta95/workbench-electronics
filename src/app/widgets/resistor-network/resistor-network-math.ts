/**
 * The arithmetic behind the `resistor-network` instrument: two to four
 * resistors, all in series or all in parallel, across one supply.
 *
 *   series:    R = R1 + R2 + …        one current through every resistor
 *   parallel:  1/R = 1/R1 + 1/R2 + …  the full supply across every resistor
 */

export type NetworkMode = 'series' | 'parallel';

/** One resistor of the network as the instrument reads it. */
export interface BranchReading {
  /** Ohms. */
  readonly value: number;
  /** Amps through this resistor. */
  readonly current: number;
  /** Watts in this resistor, I² × R. */
  readonly power: number;
}

export interface NetworkResult {
  /** Equivalent resistance, ohms. */
  readonly total: number;
  /** Current taken from the supply, amps. */
  readonly supplyCurrent: number;
  /** Power delivered by the supply, watts. */
  readonly totalPower: number;
  /** One reading per resistor, in the order given. */
  readonly branches: readonly BranchReading[];
}

/**
 * Equivalent resistance. In parallel, conductances add; with no conductance
 * at all (no resistors) the result is an open circuit, Infinity.
 */
export function equivalentResistance(values: readonly number[], mode: NetworkMode): number {
  if (mode === 'series') return values.reduce((sum, value) => sum + value, 0);
  const conductance = values.reduce((sum, value) => sum + 1 / value, 0);
  return conductance === 0 ? Infinity : 1 / conductance;
}

/** Solves the network for a supply of `supply` volts. */
export function solveNetwork(
  values: readonly number[],
  mode: NetworkMode,
  supply: number,
): NetworkResult {
  const total = equivalentResistance(values, mode);
  const supplyCurrent = supply / total;
  const totalPower = supply * supplyCurrent;
  const branches = values.map((value) => {
    const current = mode === 'series' ? supplyCurrent : supply / value;
    return { value, current, power: current * current * value };
  });
  return { total, supplyCurrent, totalPower, branches };
}

/**
 * Wire animation speed, 0..1, log-scaled across five decades of current
 * (10 µA to 1 A). Zero, negative or non-finite current stops it.
 */
export function networkFlow(amps: number): number {
  if (!Number.isFinite(amps) || amps <= 0) return 0;
  return Math.min(1, Math.max(0.08, (Math.log10(amps) + 5) / 5));
}
