import { formatSI } from '../../core/format';
import { ohmFlow, type OhmInput, powerLevel, solveOhm } from './ohm-law-math';

/** The instrument's start state (lesson 00-01: v="9" r="470"; i defaults to 20 mA). */
const DEFAULT: OhmInput = { unknown: 'i', v: 9, r: 470, i: 0.02 };

describe('solveOhm', () => {
  it('starts at 9 V and 470 Ω, which gives 19.1 mA (lesson 00-01)', () => {
    const r = solveOhm(DEFAULT);
    expect(r.current).toBeCloseTo(9 / 470, 15);
    expect(formatSI(r.current, 'A', 'en')).toBe('19.1 mA');
    expect(formatSI(r.current, 'A', 'es')).toBe('19,1 mA');
    expect(r.voltage).toBe(9);
    expect(r.resistance).toBe(470);
    expect(formatSI(r.power, 'W', 'en')).toBe('172 mW');
  });

  it('reproduces the LED worked example: 3 V across 220 Ω (lesson 00-01)', () => {
    const r = solveOhm({ ...DEFAULT, v: 3, r: 220 });
    expect(formatSI(r.current, 'A', 'en')).toBe('13.6 mA');
    expect(formatSI(r.power, 'W', 'en')).toBe('40.9 mW');
    expect(r.power).toBeLessThan(0.25);
    expect(powerLevel(r.power)).toBe('ok');
  });

  it('reproduces the 24 V failure: 22 V across 220 Ω (lesson 00-01)', () => {
    const r = solveOhm({ ...DEFAULT, v: 22, r: 220 });
    expect(formatSI(r.current, 'A', 'en')).toBe('100 mA');
    expect(formatSI(r.power, 'W', 'en')).toBe('2.2 W');
    // "almost nine times its 1/4 W rating"
    expect(r.power / 0.25).toBeCloseTo(8.8, 12);
    expect(powerLevel(r.power)).toBe('over-quarter');
  });

  it('reproduces the charger: 5 V at 2 A is 10 W (lesson 00-01)', () => {
    const r = solveOhm({ unknown: 'r', v: 5, i: 2, r: 470 });
    expect(r.power).toBe(10);
    expect(r.resistance).toBe(2.5);
  });

  it('derives whichever quantity is the unknown and ignores its stale state', () => {
    expect(solveOhm({ unknown: 'i', v: 9, r: 470, i: 999 }).current).toBe(9 / 470);
    expect(solveOhm({ unknown: 'v', v: 999, r: 470, i: 0.02 }).voltage).toBeCloseTo(9.4, 12);
    expect(solveOhm({ unknown: 'r', v: 9, r: 999, i: 0.02 }).resistance).toBeCloseTo(450, 12);
  });

  it('keeps V = I × R and P = V × I whichever quantity is derived', () => {
    for (const unknown of ['i', 'v', 'r'] as const) {
      const r = solveOhm({ unknown, v: 12, r: 3300, i: 0.004 });
      expect(r.voltage).toBeCloseTo(r.current * r.resistance, 12);
      expect(r.power).toBeCloseTo(r.voltage * r.current, 15);
    }
  });

  it('covers the ends of the control ranges (0.1–48 V, 1 Ω–1 MΩ, 10 µA–2 A)', () => {
    const most = solveOhm({ unknown: 'i', v: 48, r: 1, i: 0 });
    expect(most.current).toBe(48);
    expect(formatSI(most.power, 'W', 'en')).toBe('2.3 kW');
    const least = solveOhm({ unknown: 'i', v: 0.1, r: 1e6, i: 0 });
    expect(formatSI(least.current, 'A', 'en')).toBe('100 nA');
    expect(formatSI(solveOhm({ unknown: 'r', v: 0.1, i: 2, r: 0 }).resistance, 'Ω', 'en')).toBe(
      '50 mΩ',
    );
    expect(formatSI(solveOhm({ unknown: 'r', v: 48, i: 1e-5, r: 0 }).resistance, 'Ω', 'en')).toBe(
      '4.8 MΩ',
    );
    expect(formatSI(solveOhm({ unknown: 'v', v: 0, i: 2, r: 1e6 }).voltage, 'V', 'en')).toBe(
      '2 MV',
    );
  });

  it('gives no current and no power at 0 V', () => {
    const r = solveOhm({ ...DEFAULT, v: 0 });
    expect(r.current).toBe(0);
    expect(r.power).toBe(0);
  });

  it('shows a dash rather than a number for a zero divisor', () => {
    expect(formatSI(solveOhm({ ...DEFAULT, r: 0 }).current, 'A', 'en')).toBe('— A');
    expect(formatSI(solveOhm({ unknown: 'r', v: 9, i: 0, r: 1 }).resistance, 'Ω', 'en')).toBe(
      '— Ω',
    );
  });
});

describe('powerLevel', () => {
  it('flags power past 1/10 W and past 1/4 W, not at them', () => {
    expect(powerLevel(0)).toBe('ok');
    expect(powerLevel(0.1)).toBe('ok');
    expect(powerLevel(0.1000001)).toBe('over-tenth');
    expect(powerLevel(0.25)).toBe('over-tenth');
    expect(powerLevel(0.2500001)).toBe('over-quarter');
    expect(powerLevel(Infinity)).toBe('over-quarter');
    expect(powerLevel(NaN)).toBe('ok');
  });
});

describe('ohmFlow', () => {
  it('maps five decades of current onto 0..1, clamped', () => {
    expect(ohmFlow(1)).toBe(1);
    expect(ohmFlow(48)).toBe(1);
    expect(ohmFlow(1e-3)).toBeCloseTo(0.4, 12);
    expect(ohmFlow(1e-5)).toBe(0.08);
    expect(ohmFlow(1e-7)).toBe(0.08);
  });

  it('stops for zero, negative or non-finite current', () => {
    expect(ohmFlow(0)).toBe(0);
    expect(ohmFlow(-1)).toBe(0);
    expect(ohmFlow(NaN)).toBe(0);
    expect(ohmFlow(Infinity)).toBe(0);
  });
});
