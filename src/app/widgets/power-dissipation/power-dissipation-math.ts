import type { Lang } from '../../core/content.types';
import { formatNumber } from '../../core/format';

/**
 * The arithmetic behind the `power-dissipation` instrument: how hot a resistor
 * runs, and how that compares with its (derated) power rating.
 *
 *   I = V / R,  P = V · I = V² / R
 *   θ = rise at rated power / rated power     (ti-spra953 §1 p. 2)
 *   ΔT = P · θ,  T = Ta + P · θ
 *   f(Ta) = 1 up to 70 °C, (155 − Ta) / 85 up to 155 °C, 0 above
 *   used = P / (Prated · f(Ta))
 *
 * Model assumptions (brief D-20):
 *   1. A straight line from 0 to the 100 % point of the maker's rise curve. The
 *      real curve may bend a little below 100 %, so the figures are "about".
 *   2. θ does not depend on the ambient: the same power gives the same rise in
 *      25 °C or 85 °C air.
 *   3. The temperature is the surface at the middle of the body, as the maker
 *      measured it, in the maker's mounting. Leads, the board, neighbouring
 *      parts and an enclosure change it (vishay-mbx-sma p. 2; ti-spra953).
 *
 * Past the 70 °C rated power the maker's curve says nothing, so `inData` is
 * false and the widget shows no temperature (brief D-7).
 */

export type PartRating = '1/4' | '1';

export interface Part {
  /** Rating at 70 °C ambient, W (stackpole-cf p. 1). */
  readonly rated: number;
  /** °C per W, typical, derived from the maker's temperature-rise curve:
   *  surface rise at rated power / rated power (stackpole-cf p. 9 curve, read
   *  ±2 °C; surface at the middle of the body, for the maker's mounting). The
   *  datasheet states no θ. */
  readonly theta: number;
}

/**
 * One family, Stackpole CF carbon film, so both θ values come from the same
 * curve measured the same way (brief D-2):
 * - CF14, 1/4 W: about 32 °C rise at 0.25 W, so 128 °C/W (32 / 0.25).
 * - CF1, 1 W: about 85 °C rise at 1 W, so 85 °C/W (85 / 1).
 */
export const PARTS: Readonly<Record<PartRating, Part>> = {
  '1/4': { rated: 0.25, theta: 128 },
  '1': { rated: 1, theta: 85 },
};

/** Derating: 100 % to 70 °C, 0 % at 155 °C (stackpole-cf p. 3; yageo-cfr p. 3). */
export const T_KNEE = 70;
/** 0 % rating, and the top of the operating range (stackpole-cf p. 3). */
export const T_MAX = 155;
/** Bare metal, 1 min contact (cenelec-guide-29 Table A.1 p. 20; stated, not read from a curve). */
export const T_TOUCH = 51;
/** Course convention: warn above half the rating. No source (brief D-9). */
export const HEADROOM = 0.5;

/** 1 up to T_KNEE, linear to 0 at T_MAX, 0 above. NaN counts as below the knee. */
export function derating(ambient: number): number {
  if (!(ambient > T_KNEE)) return 1;
  if (ambient >= T_MAX) return 0;
  return (T_MAX - ambient) / (T_MAX - T_KNEE);
}

export interface DissipationInput {
  readonly vin: number;
  readonly r: number;
  readonly part: PartRating;
  readonly ambient: number;
}

export interface DissipationResult {
  /** A. */
  readonly current: number;
  /** W. */
  readonly power: number;
  /** °C/W, PARTS[part].theta. */
  readonly theta: number;
  /** °C, power · theta (always computed; the widget hides it off the data). */
  readonly rise: number;
  /** °C, ambient + rise. */
  readonly surface: number;
  /** W, PARTS[part].rated · derating(ambient). */
  readonly ratedNow: number;
  /** Fraction of ratedNow; 0 when power is 0. */
  readonly used: number;
  /** power ≤ PARTS[part].rated (the 70 °C figure, not the derated one). */
  readonly inData: boolean;
  /** used > 1 (drives the hot colour). */
  readonly overRating: boolean;
}

/** NaN in, 0 out, so no field of the result is ever NaN. */
const num = (x: number): number => (Number.isNaN(x) ? 0 : x);

export function solveDissipation(input: DissipationInput): DissipationResult {
  const vin = num(input.vin);
  const r = num(input.r);
  const ambient = num(input.ambient);
  const { rated, theta } = PARTS[input.part] ?? PARTS['1/4'];

  // 0 V across 0 Ω is 0 A, not 0 / 0; a short with a supply is unbounded.
  const current = r === 0 ? (vin === 0 ? 0 : Infinity) : num(vin / r);
  const power = vin === 0 || current === 0 ? 0 : Math.abs(vin * current);
  const rise = power * theta;
  const surface = ambient + rise;
  const ratedNow = rated * derating(ambient);
  const used = power === 0 ? 0 : ratedNow === 0 ? Infinity : power / ratedNow;
  return {
    current,
    power,
    theta,
    rise,
    surface,
    ratedNow,
    used,
    inData: power <= rated,
    overRating: used > 1,
  };
}

/** ≤ 0.5 signal, ≤ 1 warn, otherwise danger (brief D-9). */
export function ratingTone(used: number): 'signal' | 'warn' | 'danger' {
  if (used <= HEADROOM) return 'signal';
  if (used <= 1) return 'warn';
  return 'danger';
}

/**
 * Off the data or above T_MAX: danger; ≥ T_TOUCH: warn; otherwise plain, never
 * signal, because no temperature is "safe to touch" (brief D-10). A part in
 * air at or above T_MAX (rating 0) is danger too (brief §5 edge cases).
 */
export function surfaceTone(result: DissipationResult): 'plain' | 'warn' | 'danger' {
  if (!result.inData || result.surface > T_MAX || result.ratedNow <= 0) return 'danger';
  if (result.surface >= T_TOUCH) return 'warn';
  return 'plain';
}

/** Wire speed 0..1, log over 10 µA–1 A, min 0.08 for any positive current
 *  (ohm-law's ohmFlow); 0 for zero, negative or non-finite. */
export function heatFlow(amps: number): number {
  if (!Number.isFinite(amps) || amps <= 0) return 0;
  return Math.min(1, Math.max(0.08, (Math.log10(amps) + 5) / 5));
}

/** Normalises the `rating` prop: anything but '1' is '1/4'. */
export function parseRating(raw: string | undefined): PartRating {
  return raw?.trim() === '1' ? '1' : '1/4';
}

/**
 * Whole degrees, `formatNumber(t, lang, 0)` plus a plain space and the unit
 * (brief D-17). Not formatSI: a rise of 0.4 °C would read "400 m°C". Whole
 * degrees match the ±2 °C the rise was read to.
 */
export function formatTemperature(value: number, lang: Lang, unit = '°C'): string {
  return `${formatNumber(value, lang, 0)} ${unit}`;
}
