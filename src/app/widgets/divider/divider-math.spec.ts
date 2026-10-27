import { formatPercent, formatSI, parallel } from '../../core/format';
import { dividerFlow, type DividerInput, errorTone, solveDivider } from './divider-math';

const k = 1000;

/** The instrument's start state (lesson 00-03: vin="9" r1="10k" r2="10k"; RL 10 kΩ, off). */
const START: DividerInput = { vin: 9, r1: 10 * k, r2: 10 * k, rLoad: 10 * k, loaded: false };
const LOADED: DividerInput = { ...START, loaded: true };

/** The small divider of the same ratio (lesson 00-03). */
const SMALL: DividerInput = { ...START, r1: 100, r2: 100 };

/** The battery monitor (lesson 00-03): two E12 values. */
const BATTERY: DividerInput = { ...START, r1: 10 * k, r2: 2.7 * k };

const v = (value: number) => formatSI(value, 'V', 'en');

describe('solveDivider', () => {
  it('starts unloaded at 4.5 V, with no error and no load current', () => {
    const r = solveDivider(START);
    expect(r.vout).toBe(4.5);
    expect(r.videal).toBe(4.5);
    expect(r.error).toBe(0);
    expect(r.iLoad).toBe(0);
    expect(formatSI(r.vout, 'V', 'es')).toBe('4,5 V');
    expect(errorTone(r.error)).toBe('signal');
  });

  it('drops from 4.5 V to 3 V under the 10 kΩ load (lesson 00-03)', () => {
    const r = solveDivider(LOADED);
    expect(v(r.vout)).toBe('3 V');
    expect(v(r.videal)).toBe('4.5 V');
    expect(formatPercent(r.error, 'en')).toBe('-33.3%');
    expect(errorTone(r.error)).toBe('danger');
    expect(formatSI(r.iLoad, 'A', 'en')).toBe('300 µA');
    expect(formatSI(r.iTotal, 'A', 'en')).toBe('600 µA');
  });

  it('a 100 Ω / 100 Ω divider only drops to 4.48 V under the same load (lesson 00-03)', () => {
    expect(v(solveDivider(SMALL).vout)).toBe('4.5 V');
    expect(v(solveDivider({ ...SMALL, loaded: true }).vout)).toBe('4.48 V');
  });

  it('wastes 4.05 mW in the 10 kΩ pair and 405 mW in the 100 Ω pair (lesson 00-03)', () => {
    expect(formatSI(solveDivider(START).pQuiescent, 'W', 'en')).toBe('4.05 mW');
    expect(formatSI(solveDivider(SMALL).pQuiescent, 'W', 'en')).toBe('405 mW');
    // Quiescent power does not depend on the load.
    expect(solveDivider(LOADED).pQuiescent).toBe(solveDivider(START).pQuiescent);
  });

  it('has 5 kΩ of output impedance for 10 kΩ / 10 kΩ (lesson 00-03)', () => {
    expect(formatSI(solveDivider(START).zout, 'Ω', 'en')).toBe('5 kΩ');
  });

  it('loaded output is the unloaded output times RL / (Zout + RL) (lesson 00-03)', () => {
    for (const rLoad of [100, 5 * k, 10 * k, 500 * k, 1e6]) {
      for (const base of [START, SMALL, BATTERY]) {
        const r = solveDivider({ ...base, rLoad, loaded: true });
        expect(r.vout).toBeCloseTo((r.videal * rLoad) / (r.zout + rLoad), 12);
      }
    }
  });

  it('a 5 kΩ load halves the output; a 500 kΩ load lowers it by about 1 % (lesson 00-03)', () => {
    expect(solveDivider({ ...START, rLoad: 5 * k, loaded: true }).vout).toBeCloseTo(2.25, 12);
    const light = solveDivider({ ...START, rLoad: 500 * k, loaded: true });
    expect(formatPercent(light.error, 'en', 0)).toBe('-1%');
  });

  it('keeps within 10 % with parts 10× below the load, 1 % with 100× (lesson 00-03)', () => {
    const tenth = solveDivider({ vin: 9, r1: 1 * k, r2: 1 * k, rLoad: 10 * k, loaded: true });
    expect(Math.abs(tenth.error)).toBeLessThan(0.1);
    const hundredth = solveDivider({ vin: 9, r1: 100, r2: 100, rLoad: 10 * k, loaded: true });
    expect(Math.abs(hundredth.error)).toBeLessThan(0.01);
  });

  it('reads a 11–14.4 V battery with 10 kΩ / 2.7 kΩ (lesson 00-03)', () => {
    expect(v(solveDivider({ ...BATTERY, vin: 14.4 }).vout)).toBe('3.06 V');
    expect(v(solveDivider({ ...BATTERY, vin: 11 }).vout)).toBe('2.34 V');
    // Stays under 3.3 V up to 15.5 V.
    expect(solveDivider({ ...BATTERY, vin: 15.5 }).vout).toBeLessThan(3.3);
    expect(solveDivider({ ...BATTERY, vin: 15.6 }).vout).toBeGreaterThan(3.3);
    expect(formatSI(solveDivider(BATTERY).zout, 'Ω', 'en')).toBe('2.13 kΩ');
    // Connected to 24 V by mistake.
    expect(v(solveDivider({ ...BATTERY, vin: 24 }).vout)).toBe('5.1 V');
  });

  it('reproduces "predict before you drag": 2.88 V ideal, 2.18 V loaded, 24.2 % low (lesson 00-03)', () => {
    const r = solveDivider({ vin: 9, r1: 10 * k, r2: 4.7 * k, rLoad: 10 * k, loaded: true });
    expect(formatSI(parallel(4.7 * k, 10 * k), 'Ω', 'en')).toBe('3.2 kΩ');
    expect(v(r.videal)).toBe('2.88 V');
    expect(v(r.vout)).toBe('2.18 V');
    expect(formatPercent(r.error, 'en')).toBe('-24.2%');
    expect(formatPercent(r.error, 'es')).toBe('-24,2 %');
  });

  it('ignores the load resistance while the load is switched off', () => {
    expect(solveDivider({ ...START, rLoad: 100 })).toEqual(solveDivider(START));
  });

  it('covers the ends of the control ranges (1–24 V, 100 Ω–1 MΩ)', () => {
    const lowest = solveDivider({ vin: 24, r1: 1e6, r2: 100, rLoad: 1e6, loaded: true });
    expect(lowest.vout).toBeGreaterThan(0);
    expect(lowest.vout).toBeLessThan(lowest.videal);
    const highest = solveDivider({ vin: 24, r1: 100, r2: 1e6, rLoad: 100, loaded: true });
    expect(v(highest.vout)).toBe('12 V');
    expect(formatSI(highest.iLoad, 'A', 'en')).toBe('120 mA');
    // The smallest error the controls allow still reads 0 %, never "-0 %".
    const stiff = solveDivider({ vin: 1, r1: 100, r2: 100, rLoad: 1e6, loaded: true });
    expect(stiff.error).toBeLessThan(0);
    expect(formatPercent(stiff.error, 'en')).toBe('0%');
  });

  it('guards the divisions that could hit zero', () => {
    expect(solveDivider({ ...START, vin: 0 }).error).toBe(0);
    const shorted = solveDivider({ ...START, r1: 0, r2: 0 });
    expect(shorted.pQuiescent).toBe(0);
    expect(shorted.iTotal).toBe(0);
  });
});

describe('errorTone', () => {
  it('is calm under 1 %, a warning under 10 %, and danger beyond', () => {
    expect(errorTone(0)).toBe('signal');
    expect(errorTone(-0.0099)).toBe('signal');
    expect(errorTone(-0.01)).toBe('warn');
    expect(errorTone(0.0999)).toBe('warn');
    expect(errorTone(-0.1)).toBe('danger');
    expect(errorTone(-1 / 3)).toBe('danger');
  });
});

describe('dividerFlow', () => {
  it('maps six decades of current onto 0..1, clamped', () => {
    expect(dividerFlow(1)).toBe(1);
    expect(dividerFlow(1e-3)).toBeCloseTo(0.5, 12);
    expect(dividerFlow(1e-6)).toBe(0.08);
  });

  it('stops for zero, negative or non-finite current', () => {
    expect(dividerFlow(0)).toBe(0);
    expect(dividerFlow(-1)).toBe(0);
    expect(dividerFlow(NaN)).toBe(0);
  });
});
