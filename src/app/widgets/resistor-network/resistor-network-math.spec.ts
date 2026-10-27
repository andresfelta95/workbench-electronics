import { formatPercent, formatSI } from '../../core/format';
import { equivalentResistance, networkFlow, solveNetwork } from './resistor-network-math';

const k = 1000;

/** The instrument's start state (lesson 00-02: supply="9"; 1 kΩ and 4.7 kΩ). */
const START = [1 * k, 4.7 * k];

describe('solveNetwork', () => {
  it('starts with 1 kΩ + 4.7 kΩ in series: 5.7 kΩ, 1.58 mA from 9 V (lesson 00-02)', () => {
    const r = solveNetwork(START, 'series', 9);
    expect(formatSI(r.total, 'Ω', 'en')).toBe('5.7 kΩ');
    expect(formatSI(r.supplyCurrent, 'A', 'en')).toBe('1.58 mA');
    expect(formatSI(r.supplyCurrent, 'A', 'es')).toBe('1,58 mA');
    expect(formatSI(r.totalPower, 'W', 'en')).toBe('14.2 mW');
    // The same current through every resistor in series.
    for (const branch of r.branches) expect(branch.current).toBe(r.supplyCurrent);
  });

  it('switches the starting pair to parallel: 825 Ω, below the smaller 1 kΩ (lesson 00-02)', () => {
    const r = solveNetwork(START, 'parallel', 9);
    expect(formatSI(r.total, 'Ω', 'en')).toBe('825 Ω');
    expect(r.total).toBeLessThan(1 * k);
    expect(formatSI(r.branches[0].current, 'A', 'en')).toBe('9 mA');
    expect(formatSI(r.branches[1].current, 'A', 'en')).toBe('1.91 mA');
    // The lower resistance takes the bigger share, and the shares add up.
    expect(r.branches[0].current + r.branches[1].current).toBeCloseTo(r.supplyCurrent, 15);
  });

  it('splits 10 V into 1 V and 9 V across 1 kΩ and 9 kΩ in series (lesson 00-02)', () => {
    const r = solveNetwork([1 * k, 9 * k], 'series', 10);
    const drops = r.branches.map((b) => b.current * b.value);
    expect(drops[0]).toBeCloseTo(1, 12);
    expect(drops[1]).toBeCloseTo(9, 12);
  });

  it('shares the heat: each of two 1 Ω in parallel takes half of one 0.5 Ω (lesson 00-02)', () => {
    const pair = solveNetwork([1, 1], 'parallel', 1);
    const single = solveNetwork([0.5], 'series', 1);
    expect(pair.total).toBe(0.5);
    expect(pair.branches[0].power).toBeCloseTo(single.branches[0].power / 2, 15);
    expect(pair.branches[0].current).toBeCloseTo(single.supplyCurrent / 2, 15);
  });

  it('conserves power: the supply delivers what the resistors dissipate', () => {
    for (const mode of ['series', 'parallel'] as const) {
      for (const values of [START, [10, 1e6], [47, 220, 3.3 * k, 100 * k]]) {
        const r = solveNetwork(values, mode, 24);
        const sum = r.branches.reduce((total, b) => total + b.power, 0);
        expect(sum / r.totalPower).toBeCloseTo(1, 12);
      }
    }
  });

  it('covers the ends of the control ranges (1–24 V, 10 Ω–1 MΩ, 2–4 resistors)', () => {
    const heavy = solveNetwork([10, 10, 10, 10], 'parallel', 24);
    expect(heavy.total).toBe(2.5);
    expect(heavy.supplyCurrent).toBeCloseTo(9.6, 12);
    expect(formatSI(heavy.totalPower, 'W', 'en')).toBe('230 W');
    const light = solveNetwork([1e6, 1e6, 1e6, 1e6], 'series', 1);
    expect(formatSI(light.total, 'Ω', 'en')).toBe('4 MΩ');
    expect(formatSI(light.supplyCurrent, 'A', 'en')).toBe('250 nA');
  });

  it('takes no current from an empty parallel network (an open circuit)', () => {
    const r = solveNetwork([], 'parallel', 9);
    expect(r.total).toBe(Infinity);
    expect(r.supplyCurrent).toBe(0);
    expect(r.totalPower).toBe(0);
    expect(r.branches).toEqual([]);
  });
});

describe('equivalentResistance', () => {
  it('ten 1 kΩ in parallel make 100 Ω, a hundred make 10 Ω (lesson 00-02)', () => {
    expect(equivalentResistance(Array(10).fill(1 * k), 'parallel')).toBeCloseTo(100, 9);
    expect(equivalentResistance(Array(100).fill(1 * k), 'parallel')).toBeCloseTo(10, 9);
  });

  it('two equal resistors in parallel give half of one', () => {
    expect(equivalentResistance([4.7 * k, 4.7 * k], 'parallel')).toBeCloseTo(2350, 9);
  });

  it('builds 15 kΩ from three 10 kΩ: a parallel pair plus one in series (lesson 00-02)', () => {
    const pair = equivalentResistance([10 * k, 10 * k], 'parallel');
    expect(pair).toBe(5 * k);
    expect(equivalentResistance([pair, 10 * k], 'series')).toBe(15 * k);
  });

  it('a meter’s 10 MΩ barely moves 1 kΩ but moves 1 MΩ by 9 % (lesson 00-02)', () => {
    const small = equivalentResistance([1 * k, 10e6], 'parallel');
    expect(formatPercent((1 * k - small) / (1 * k), 'en', 2)).toBe('0.01%');
    const large = equivalentResistance([1e6, 10e6], 'parallel');
    expect(formatPercent((1e6 - large) / 1e6, 'en', 0)).toBe('9%');
  });

  it('series total is above the largest part; parallel total is below the smallest', () => {
    const sets = [START, [10, 1e6], [10, 10], [47, 220, 3.3 * k, 100 * k], [1e6, 1e6, 1e6]];
    for (const values of sets) {
      expect(equivalentResistance(values, 'series')).toBeGreaterThan(Math.max(...values));
      expect(equivalentResistance(values, 'parallel')).toBeLessThan(Math.min(...values));
    }
  });
});

describe('networkFlow', () => {
  it('maps five decades of current onto 0..1, clamped', () => {
    expect(networkFlow(9.6)).toBe(1);
    expect(networkFlow(1e-3)).toBeCloseTo(0.4, 12);
    expect(networkFlow(2.5e-7)).toBe(0.08);
  });

  it('stops for zero, negative or non-finite current', () => {
    expect(networkFlow(0)).toBe(0);
    expect(networkFlow(-1)).toBe(0);
    expect(networkFlow(NaN)).toBe(0);
  });
});
