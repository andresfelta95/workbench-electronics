import { formatPercent, formatSI } from '../../core/format';
import {
  errorTone,
  meterFlow,
  parseMode,
  parseRange,
  RANGE_OHMS,
  solveAmmeter,
  solveAmmeterOhms,
  solveVoltmeter,
  type VoltmeterInput,
} from './meter-loading-math';

const k = 1000;
const M = 1e6;

/** The voltage-mode start state (lesson 00-05: vin="9" r1="10k" r2="10k" rin="10M"). */
const V_START: VoltmeterInput = { vin: 9, r1: 10 * k, r2: 10 * k, rin: 10 * M };

const si = (value: number, unit: string) => formatSI(value, unit, 'en');
const siEs = (value: number, unit: string) => formatSI(value, unit, 'es');
const pct = (value: number) => formatPercent(value, 'en', 2);
const pctEs = (value: number) => formatPercent(value, 'es', 2);

describe('solveVoltmeter', () => {
  it('V-1: barely loads a 10 kΩ / 10 kΩ divider', () => {
    const r = solveVoltmeter(V_START);
    expect(si(r.reading, 'V')).toBe('4.5 V');
    expect(siEs(r.reading, 'V')).toBe('4,5 V');
    expect(si(r.trueValue, 'V')).toBe('4.5 V');
    expect(pct(r.error)).toBe('-0.05%');
    expect(pctEs(r.error)).toBe('-0,05 %');
    expect(si(r.zout, 'Ω')).toBe('5 kΩ');
    expect(errorTone(r.error)).toBe('signal');
    expect(si(r.iMeter, 'A')).toBe('450 nA');
  });

  it('V-2b: 1 MΩ / 1 MΩ reads 4.29 V, a warning', () => {
    const r = solveVoltmeter({ ...V_START, r1: M, r2: M });
    expect(si(r.reading, 'V')).toBe('4.29 V');
    expect(siEs(r.reading, 'V')).toBe('4,29 V');
    expect(pct(r.error)).toBe('-4.76%');
    expect(pctEs(r.error)).toBe('-4,76 %');
    expect(si(r.zout, 'Ω')).toBe('500 kΩ');
    expect(errorTone(r.error)).toBe('warn');
  });

  it('V-2: 10 MΩ / 10 MΩ reads 3 V instead of 4.5 V', () => {
    const r = solveVoltmeter({ ...V_START, r1: 10 * M, r2: 10 * M });
    expect(r.reading).toBeCloseTo(3, 12);
    expect(si(r.reading, 'V')).toBe('3 V');
    expect(si(r.trueValue, 'V')).toBe('4.5 V');
    expect(pct(r.error)).toBe('-33.33%');
    expect(pctEs(r.error)).toBe('-33,33 %');
    expect(si(r.zout, 'Ω')).toBe('5 MΩ');
    expect(errorTone(r.error)).toBe('danger');
    expect(si(r.iMeter, 'A')).toBe('300 nA');
  });

  it('100 kΩ / 100 kΩ reads 4.48 V, -0.5 %', () => {
    const r = solveVoltmeter({ ...V_START, r1: 100 * k, r2: 100 * k });
    expect(si(r.reading, 'V')).toBe('4.48 V');
    expect(pct(r.error)).toBe('-0.5%');
  });

  it('10 MΩ / 10 MΩ with a 1 GΩ meter reads 4.48 V, -0.5 %', () => {
    const r = solveVoltmeter({ ...V_START, r1: 10 * M, r2: 10 * M, rin: 1e9 });
    expect(si(r.reading, 'V')).toBe('4.48 V');
    expect(pct(r.error)).toBe('-0.5%');
  });

  it('reading is the true value times Rin / (Zout + Rin) (lesson 00-03)', () => {
    for (const r1 of [100, 10 * k, M, 10 * M]) {
      for (const r2 of [100, 4.7 * k, 1 * M, 10 * M]) {
        for (const rin of [100 * k, 10 * M, 1e9]) {
          const r = solveVoltmeter({ vin: 9, r1, r2, rin });
          expect(r.reading).toBeCloseTo((r.trueValue * rin) / (r.zout + rin), 12);
          expect(r.error).toBeCloseTo(-r.zout / (r.zout + rin), 12);
        }
      }
    }
  });

  it('follows the ratio rule: Rin = 99, 9, 1 × Zout gives -1 %, -10 %, -50 %', () => {
    const zout = parallel10k();
    expect(solveVoltmeter({ ...V_START, rin: 99 * zout }).error).toBeCloseTo(-0.01, 12);
    expect(solveVoltmeter({ ...V_START, rin: 9 * zout }).error).toBeCloseTo(-0.1, 12);
    expect(solveVoltmeter({ ...V_START, rin: zout }).error).toBeCloseTo(-0.5, 12);
  });

  it('an ideal (infinite) meter reads the true value and takes no current', () => {
    const r = solveVoltmeter({ ...V_START, rin: Infinity });
    expect(r.reading).toBe(r.trueValue);
    expect(r.error).toBe(0);
    expect(r.iMeter).toBe(0);
  });
});

/** Zout of the 10 kΩ / 10 kΩ start divider. */
function parallel10k(): number {
  return solveVoltmeter(V_START).zout;
}

describe('solveAmmeter', () => {
  it('A-1: barely loads a 1 kΩ load on the mA range', () => {
    const r = solveAmmeter({ vin: 9, rLoad: k, range: 'mA' });
    expect(si(r.reading, 'A')).toBe('8.98 mA');
    expect(siEs(r.reading, 'A')).toBe('8,98 mA');
    expect(si(r.trueValue, 'A')).toBe('9 mA');
    expect(pct(r.error)).toBe('-0.18%');
    expect(pctEs(r.error)).toBe('-0,18 %');
    expect(si(r.burden, 'V')).toBe('16.2 mV');
    expect(siEs(r.burden, 'V')).toBe('16,2 mV');
    expect(errorTone(r.error)).toBe('signal');
    expect(r.overRange).toBe(false);
  });

  it('the A range reads 9 mA with 270 µV of burden', () => {
    const r = solveAmmeter({ vin: 9, rLoad: k, range: 'A' });
    expect(si(r.reading, 'A')).toBe('9 mA');
    expect(r.error).toBeCloseTo(-0.00003, 6);
    expect(pct(r.error)).toBe('0%');
    expect(si(r.burden, 'V')).toBe('270 µV');
    expect(r.rMeter).toBe(RANGE_OHMS.A);
  });

  it('A-2: 1.5 V into 22 Ω on the mA range reads 7.56 % low', () => {
    const r = solveAmmeter({ vin: 1.5, rLoad: 22, range: 'mA' });
    expect(si(r.reading, 'A')).toBe('63 mA');
    expect(si(r.trueValue, 'A')).toBe('68.2 mA');
    expect(siEs(r.trueValue, 'A')).toBe('68,2 mA');
    expect(pct(r.error)).toBe('-7.56%');
    expect(pctEs(r.error)).toBe('-7,56 %');
    expect(si(r.burden, 'V')).toBe('113 mV');
    expect(errorTone(r.error)).toBe('warn');
  });

  it('A-2 on the A range: 68.1 mA, -0.14 %, 2.04 mV', () => {
    const r = solveAmmeter({ vin: 1.5, rLoad: 22, range: 'A' });
    expect(si(r.reading, 'A')).toBe('68.1 mA');
    expect(siEs(r.reading, 'A')).toBe('68,1 mA');
    expect(pct(r.error)).toBe('-0.14%');
    expect(pctEs(r.error)).toBe('-0,14 %');
    expect(si(r.burden, 'V')).toBe('2.04 mV');
    expect(siEs(r.burden, 'V')).toBe('2,04 mV');
    expect(errorTone(r.error)).toBe('signal');
  });

  it('is over range above 400 mA on the mA range, never on the A range', () => {
    const mA = solveAmmeter({ vin: 24, rLoad: 10, range: 'mA' });
    expect(mA.overRange).toBe(true);
    expect(si(mA.reading, 'A')).toBe('2.03 A');
    const A = solveAmmeter({ vin: 24, rLoad: 10, range: 'A' });
    expect(A.overRange).toBe(false);
    expect(si(A.reading, 'A')).toBe('2.39 A');
    expect(pct(A.error)).toBe('-0.3%');
    // Exactly full scale is still a reading: 4 V / (8.2 Ω + 1.8 Ω) = 0.4 A.
    const edge = solveAmmeter({ vin: 4, rLoad: 8.2, range: 'mA' });
    expect(edge.reading).toBe(0.4);
    expect(edge.overRange).toBe(false);
  });

  it('follows the ratio rule: RL = 99, 9, 1 × Rm gives -1 %, -10 %, -50 %', () => {
    for (const rMeter of [RANGE_OHMS.mA, RANGE_OHMS.A]) {
      expect(solveAmmeterOhms(9, 99 * rMeter, rMeter).error).toBeCloseTo(-0.01, 12);
      expect(solveAmmeterOhms(9, 9 * rMeter, rMeter).error).toBeCloseTo(-0.1, 12);
      expect(solveAmmeterOhms(9, rMeter, rMeter).error).toBeCloseTo(-0.5, 12);
    }
  });

  it('an ideal (zero-ohm) ammeter reads the true value with no burden', () => {
    const r = solveAmmeterOhms(9, k, 0);
    expect(r.reading).toBe(r.trueValue);
    expect(r.error).toBe(0);
    expect(r.burden).toBe(0);
  });
});

describe('errorTone', () => {
  it('uses the divider thresholds: under 1 % signal, under 10 % warn, else danger', () => {
    expect(errorTone(-0.0099)).toBe('signal');
    expect(errorTone(-0.01)).toBe('warn');
    expect(errorTone(-0.0999)).toBe('warn');
    expect(errorTone(-0.1)).toBe('danger');
  });
});

describe('guards', () => {
  const noNaN = (result: object) => {
    for (const value of Object.values(result)) {
      if (typeof value === 'number') expect(Number.isNaN(value)).toBe(false);
    }
  };

  it('with no supply everything is zero', () => {
    const v = solveVoltmeter({ ...V_START, vin: 0 });
    expect(v).toEqual({ reading: 0, trueValue: 0, error: 0, zout: 5000, iMeter: 0, iSupply: 0 });
    const a = solveAmmeter({ vin: 0, rLoad: k, range: 'mA' });
    expect([a.reading, a.trueValue, a.error, a.burden]).toEqual([0, 0, 0, 0]);
    noNaN(solveAmmeterOhms(0, 0, 0));
  });

  it('a shorted divider (R1 + R2 = 0) reads 0 with no error', () => {
    const r = solveVoltmeter({ ...V_START, r1: 0, r2: 0 });
    expect([r.reading, r.trueValue, r.error, r.zout]).toEqual([0, 0, 0, 0]);
    noNaN(r);
  });

  it('R2 = 0 reads 0 with no error; R1 = 0 reads the supply', () => {
    const r2 = solveVoltmeter({ ...V_START, r2: 0 });
    expect([r2.reading, r2.trueValue, r2.error]).toEqual([0, 0, 0]);
    noNaN(r2);
    const r1 = solveVoltmeter({ ...V_START, r1: 0 });
    expect(r1.reading).toBeCloseTo(9, 12);
    expect(r1.trueValue).toBe(9);
    expect(r1.zout).toBe(0);
    expect(r1.error).toBeCloseTo(0, 12);
    noNaN(r1);
  });

  it('a zero-ohm voltmeter reads 0, all error', () => {
    const r = solveVoltmeter({ ...V_START, rin: 0 });
    expect(r.reading).toBe(0);
    expect(r.error).toBe(-1);
    noNaN(r);
  });

  it('a zero-ohm load has no finite true value: the error is -1, shown as —', () => {
    const r = solveAmmeter({ vin: 9, rLoad: 0, range: 'mA' });
    expect(r.trueValue).toBe(Infinity);
    expect(si(r.trueValue, 'A')).toBe('— A');
    expect(r.reading).toBeCloseTo(5, 12);
    expect(r.error).toBe(-1);
    noNaN(r);
    const short = solveAmmeterOhms(9, 0, 0);
    expect(short.reading).toBe(Infinity);
    expect(short.error).toBe(0);
    expect(formatPercent(short.reading, 'en', 2)).toBe('—');
    noNaN(short);
  });
});

describe('parseMode / parseRange', () => {
  it('falls back to voltage and mA for anything unknown (case-sensitive)', () => {
    expect(parseMode(undefined)).toBe('voltage');
    expect(parseMode('')).toBe('voltage');
    expect(parseMode('VOLTAGE')).toBe('voltage');
    expect(parseMode('CURRENT')).toBe('voltage');
    expect(parseMode('current')).toBe('current');
    expect(parseRange(undefined)).toBe('mA');
    expect(parseRange('')).toBe('mA');
    expect(parseRange('a')).toBe('mA');
    expect(parseRange('A')).toBe('A');
    expect(parseRange('mA')).toBe('mA');
  });
});

describe('meterFlow', () => {
  it('is log-scaled from 1 µA to 1 A, with a floor for any current', () => {
    expect(meterFlow(1)).toBe(1);
    expect(meterFlow(1e-3)).toBeCloseTo(0.5, 12);
    expect(meterFlow(300e-9)).toBe(0.08);
    expect(meterFlow(0)).toBe(0);
    expect(meterFlow(-1)).toBe(0);
    expect(meterFlow(NaN)).toBe(0);
    expect(meterFlow(Infinity)).toBe(0);
  });
});
