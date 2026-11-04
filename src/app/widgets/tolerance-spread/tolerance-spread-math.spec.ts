import { formatPercent, formatSI } from '../../core/format';
import {
  analyticSpread,
  axisRange,
  BINS,
  buildOutputs,
  BUILDS,
  deviates,
  dividerOut,
  FIRST_BATCH,
  histogram,
  mulberry32,
  parseShape,
  parseTolerance,
  type ShapeKey,
  spreadStats,
  TOLERANCES,
  type ToleranceKey,
  worstCase,
} from './tolerance-spread-math';

const k = 1000;
const NBSP = ' ';

/** Voltages at 4 figures and percentages at 1 decimal, as the readouts show them. */
const v4 = (value: number) => formatSI(value, 'V', 'en', 4);
const v4Es = (value: number) => formatSI(value, 'V', 'es', 4);
const pct = (value: number) => formatPercent(value, 'en', 1);
const pctEs = (value: number) => formatPercent(value, 'es', 1);

/** The instrument's whole pipeline for one state. */
function run(
  vin: number,
  r1: number,
  r2: number,
  tolerance: ToleranceKey,
  shape: ShapeKey,
  batch = FIRST_BATCH,
) {
  const tol = TOLERANCES[tolerance];
  const outputs = buildOutputs(deviates(batch, BUILDS, shape), vin, r1, r2, tol);
  const nominal = dividerOut(vin, r1, r2);
  const worst = worstCase(vin, r1, r2, tol);
  const stats = spreadStats(outputs, nominal);
  const axis = axisRange(vin, r1, r2);
  const counts = histogram(outputs, axis.xMin, axis.xMax, BINS);
  return { outputs, nominal, worst, stats, axis, counts };
}

const sum = (values: readonly number[]) => values.reduce((a, b) => a + b, 0);

function expectNoNaN(result: object): void {
  for (const [key, value] of Object.entries(result)) {
    expect(Number.isNaN(value), key).toBe(false);
  }
}

/** §6 W-1's histogram, 66 bins low to high. */
const W1_BINS = [
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 3, 2, 3, 2, 3, 10, 7, 10, 17, 18, 17, 25, 22, 32, 30, 43,
  63, 55, 37, 52, 64, 53, 50, 49, 46, 46, 46, 49, 25, 23, 22, 17, 13, 10, 9, 11, 8, 2, 1, 0, 2, 0,
  0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
];

describe('constants', () => {
  it('match the brief', () => {
    expect(TOLERANCES).toEqual({ '5': 0.05, '1': 0.01 });
    expect(BUILDS).toBe(1000);
    expect(BINS).toBe(66);
    expect(FIRST_BATCH).toBe(1);
  });
});

describe('mulberry32', () => {
  it('reproduces the reference sequence for seed 1', () => {
    const next = mulberry32(1);
    expect(next()).toBeCloseTo(0.6270739405881613, 15);
    expect(next()).toBeCloseTo(0.002735721180215478, 15);
    expect(next()).toBeCloseTo(0.5274470399599522, 15);
  });

  it('turns any seed into a valid state', () => {
    for (const seed of [0, -1, 1.5, NaN, 2 ** 32 + 1]) {
      const value = mulberry32(seed)();
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
    // 2³² + 1 wraps to 1.
    expect(mulberry32(2 ** 32 + 1)()).toBe(mulberry32(1)());
  });
});

describe('deviates', () => {
  it('bell: 2 per build, the reference values, all inside the band', () => {
    const dev = deviates(1, 1000, 'bell');
    expect(dev.length).toBe(2000);
    expect(dev[0]).toBeCloseTo(0.3620168048267563, 15);
    expect(dev[1]).toBeCloseTo(-0.7967388605078062, 15);
    expect(dev[2]).toBeCloseTo(0.3283022728282958, 15);
    expect(dev[3]).toBeCloseTo(-0.656508892464141, 15);
    expect(dev.every((d) => d >= -1 && d <= 1)).toBe(true);
  });

  it('flat: the reference values, all inside the band', () => {
    const dev = deviates(1, 1000, 'flat');
    expect(dev.length).toBe(2000);
    expect(dev[0]).toBeCloseTo(0.2541478811763227, 15);
    expect(dev[1]).toBeCloseTo(-0.994528557639569, 15);
    expect(dev[2]).toBeCloseTo(0.05489407991990447, 15);
    expect(dev[3]).toBeCloseTo(0.9621019349433482, 15);
    expect(dev.every((d) => d >= -1 && d <= 1)).toBe(true);
  });

  it('is deterministic, and a new seed draws new values', () => {
    for (const shape of ['bell', 'flat'] as const) {
      expect(deviates(1, 1000, shape)).toEqual(deviates(1, 1000, shape));
      expect(deviates(2, 1000, shape)).not.toEqual(deviates(1, 1000, shape));
    }
  });

  it('gives nothing for no builds', () => {
    expect(deviates(1, 0, 'bell').length).toBe(0);
    expect(deviates(1, -5, 'flat').length).toBe(0);
    expect(deviates(1, NaN, 'bell').length).toBe(0);
  });
});

describe('W-1: the default state (9 V, 10k / 10k, 5 %, bell, batch 1)', () => {
  const r = run(9, 10 * k, 10 * k, '5', 'bell');

  it('nominal and worst case', () => {
    expect(v4(r.nominal)).toBe('4.5 V');
    expect(v4Es(r.nominal)).toBe('4,5 V');
    expect(v4(r.worst.low)).toBe('4.275 V');
    expect(v4(r.worst.high)).toBe('4.725 V');
    expect(v4Es(r.worst.low)).toBe('4,275 V');
    expect(v4Es(r.worst.high)).toBe('4,725 V');
    expect(pct(r.worst.rel)).toBe('5%');
    expect(pctEs(r.worst.rel)).toBe(`5${NBSP}%`);
  });

  it('the 95 % range and the furthest build', () => {
    expect(v4(r.stats.lo95)).toBe('4.388 V');
    expect(v4(r.stats.hi95)).toBe('4.605 V');
    expect(v4Es(r.stats.lo95)).toBe('4,388 V');
    expect(v4Es(r.stats.hi95)).toBe('4,605 V');
    expect(pct(r.stats.rel95)).toBe('2.5%');
    expect(pctEs(r.stats.rel95)).toBe(`2,5${NBSP}%`);
    expect(v4(r.stats.furthest)).toBe('4.668 V');
    expect(v4Es(r.stats.furthest)).toBe('4,668 V');
    expect(pct(r.stats.furthestRel)).toBe('3.7%');
    expect(pctEs(r.stats.furthestRel)).toBe(`3,7${NBSP}%`);
    expect(r.stats.furthestRel).toBeGreaterThan(0);
  });

  it('the first builds and the spread', () => {
    expect(Array.from(r.outputs.slice(0, 3), v4)).toEqual(['4.368 V', '4.388 V', '4.451 V']);
    expect(r.stats.sd).toBeCloseTo(0.05413, 4);
    expect(r.outputs.length).toBe(1000);
  });

  it('the 95 % range holds exactly 950 builds', () => {
    const inside = r.outputs.filter((v) => v >= r.stats.lo95 && v <= r.stats.hi95).length;
    expect(inside).toBe(950);
  });
});

describe('W-2: the same builds from 1 % parts', () => {
  const r = run(9, 10 * k, 10 * k, '1', 'bell');

  it('readouts', () => {
    expect(v4(r.worst.low)).toBe('4.455 V');
    expect(v4(r.worst.high)).toBe('4.545 V');
    expect(pct(r.worst.rel)).toBe('1%');
    expect(v4(r.stats.lo95)).toBe('4.477 V');
    expect(v4(r.stats.hi95)).toBe('4.521 V');
    expect(pct(r.stats.rel95)).toBe('0.5%');
    expect(pctEs(r.stats.rel95)).toBe(`0,5${NBSP}%`);
    expect(v4(r.stats.furthest)).toBe('4.534 V');
    expect(pct(r.stats.furthestRel)).toBe('0.7%');
  });

  it('first builds', () => {
    expect(Array.from(r.outputs.slice(0, 3), v4)).toEqual(['4.474 V', '4.478 V', '4.49 V']);
  });

  it('each build is a fifth as far from nominal as at 5 %', () => {
    const five = run(9, 10 * k, 10 * k, '5', 'bell');
    // Not exactly a fifth (the ratio is non-linear), but close to first order.
    for (let i = 0; i < 10; i++) {
      const d1 = r.outputs[i] - r.nominal;
      const d5 = five.outputs[i] - five.nominal;
      expect(Math.sign(d1)).toBe(Math.sign(d5));
      expect(d1 / d5).toBeCloseTo(0.2, 1);
    }
  });
});

describe('W-3: flat', () => {
  it('5 %', () => {
    const r = run(9, 10 * k, 10 * k, '5', 'flat');
    expect(v4(r.worst.low)).toBe('4.275 V');
    expect(v4(r.worst.high)).toBe('4.725 V');
    expect(v4(r.stats.lo95)).toBe('4.327 V');
    expect(v4(r.stats.hi95)).toBe('4.671 V');
    expect(pct(r.stats.rel95)).toBe('3.9%');
    expect(pctEs(r.stats.rel95)).toBe(`3,9${NBSP}%`);
    expect(v4(r.stats.furthest)).toBe('4.719 V');
    expect(pct(r.stats.furthestRel)).toBe('4.9%');
  });

  it('1 %', () => {
    const r = run(9, 10 * k, 10 * k, '1', 'flat');
    expect(v4(r.stats.lo95)).toBe('4.466 V');
    expect(v4(r.stats.hi95)).toBe('4.534 V');
    expect(pct(r.stats.rel95)).toBe('0.8%');
    expect(v4(r.stats.furthest)).toBe('4.544 V');
    expect(pct(r.stats.furthestRel)).toBe('1%');
    expect(pctEs(r.stats.furthestRel)).toBe(`1${NBSP}%`);
  });
});

describe('worst case bounds every build', () => {
  it('both shapes, both tolerances, batches 1–5, three ratios', () => {
    for (const shape of ['bell', 'flat'] as const) {
      for (const tolerance of ['5', '1'] as const) {
        for (const [r1, r2] of [
          [10 * k, 10 * k],
          [10 * k, 1 * k],
          [1 * k, 10 * k],
        ]) {
          for (let batch = 1; batch <= 5; batch++) {
            const r = run(9, r1, r2, tolerance, shape, batch);
            expect(r.outputs.every((v) => v >= r.worst.low && v <= r.worst.high)).toBe(true);
          }
        }
      }
    }
  });
});

describe('histogram', () => {
  it('default: the axis and the exact W-1 bins', () => {
    const r = run(9, 10 * k, 10 * k, '5', 'bell');
    expect(v4(r.axis.xMin)).toBe('4.253 V');
    expect(v4(r.axis.xMax)).toBe('4.748 V');
    expect(r.counts.length).toBe(66);
    expect(sum(r.counts)).toBe(1000);
    expect(Math.max(...r.counts)).toBe(64);
    expect(r.counts.slice(0, 10).every((c) => c === 0)).toBe(true);
    expect(r.counts.slice(56).every((c) => c === 0)).toBe(true);
    expect(r.counts).toEqual(W1_BINS);
  });

  it('the axis stays put across tolerances; the tallest bins', () => {
    const one = run(9, 10 * k, 10 * k, '1', 'bell');
    expect(one.axis).toEqual(run(9, 10 * k, 10 * k, '5', 'bell').axis);
    expect(Math.max(...one.counts)).toBe(271);
    expect(sum(one.counts)).toBe(1000);
    // W-2: every build in bins 28–37.
    expect(one.counts.slice(28, 38)).toEqual([5, 21, 67, 153, 271, 244, 166, 60, 12, 1]);
    expect(Math.max(...run(9, 10 * k, 10 * k, '5', 'flat').counts)).toBe(38);
    expect(Math.max(...run(9, 10 * k, 10 * k, '1', 'flat').counts)).toBe(158);
  });

  it('edges: an inner edge goes up, outside values clamp, non-numbers are skipped', () => {
    const values = Float64Array.from([0, 0.25, 0.5, 0.999, 1, -3, 7, NaN]);
    // Bins of 0.25 over 0 … 1.
    expect(histogram(values, 0, 1, 4)).toEqual([2, 1, 1, 3]);
  });
});

describe('new batches (W-1 table)', () => {
  const cases: [number, string, string, string][] = [
    [2, '2.4%', '4.688 V', '4.2%'],
    [3, '2.3%', '4.325 V', '-3.9%'],
    [4, '2.4%', '4.345 V', '-3.4%'],
    [5, '2.4%', '4.305 V', '-4.3%'],
  ];
  for (const [batch, rel95, far, farRel] of cases) {
    it(`batch ${batch}`, () => {
      const r = run(9, 10 * k, 10 * k, '5', 'bell', batch);
      expect(pct(r.stats.rel95)).toBe(rel95);
      expect(v4(r.stats.furthest)).toBe(far);
      expect(pct(r.stats.furthestRel)).toBe(farRel);
    });
  }

  it('batch 3: the Spanish minus is a hyphen-minus too', () => {
    const r = run(9, 10 * k, 10 * k, '5', 'bell', 3);
    expect(pctEs(r.stats.furthestRel)).toBe(`-3,9${NBSP}%`);
  });

  it('none of batches 1–5 reaches the worst case', () => {
    for (let batch = 1; batch <= 5; batch++) {
      expect(Math.abs(run(9, 10 * k, 10 * k, '5', 'bell', batch).stats.furthestRel)).toBeLessThan(
        0.05,
      );
    }
  });
});

describe('W-4: the ratio', () => {
  it('10k / 1k at 5 %', () => {
    const r = run(9, 10 * k, 1 * k, '5', 'bell');
    expect(v4(r.nominal)).toBe('818.2 mV');
    expect(v4Es(r.nominal)).toBe('818,2 mV');
    expect(v4(r.worst.low)).toBe('746.7 mV');
    expect(v4(r.worst.high)).toBe('895.7 mV');
    expect(v4Es(r.worst.low)).toBe('746,7 mV');
    expect(pct(r.worst.rel)).toBe('9.5%');
    // The high side is the larger one: −8.7 % / +9.5 %.
    expect(pct((r.worst.low - r.nominal) / r.nominal)).toBe('-8.7%');
    expect(v4(r.stats.lo95)).toBe('782 mV');
    expect(v4(r.stats.hi95)).toBe('853.4 mV');
    expect(pct(r.stats.rel95)).toBe('4.4%');
    expect(v4(r.stats.furthest)).toBe('875.5 mV');
    expect(pct(r.stats.furthestRel)).toBe('7%');
  });

  it('1k / 10k at 5 %', () => {
    const r = run(9, 1 * k, 10 * k, '5', 'bell');
    expect(v4(r.nominal)).toBe('8.182 V');
    expect(v4Es(r.nominal)).toBe('8,182 V');
    expect(v4(r.worst.low)).toBe('8.104 V');
    expect(v4(r.worst.high)).toBe('8.253 V');
    expect(pct(r.worst.rel)).toBe('0.9%');
    expect(v4(r.stats.lo95)).toBe('8.144 V');
    expect(v4(r.stats.hi95)).toBe('8.216 V');
    expect(pct(r.stats.rel95)).toBe('0.5%');
    expect(v4(r.stats.furthest)).toBe('8.125 V');
    expect(pct(r.stats.furthestRel)).toBe('-0.7%');
  });

  it('the 12 V battery divider (10k / 2.7k, 5 %)', () => {
    const r = run(12, 10 * k, 2.7 * k, '5', 'bell');
    expect(v4(r.nominal)).toBe('2.551 V');
    expect(v4(r.worst.low)).toBe('2.356 V');
    expect(v4(r.worst.high)).toBe('2.758 V');
    expect(pct(r.worst.rel)).toBe('8.1%');
  });

  it('at 1 %', () => {
    const a = run(9, 10 * k, 1 * k, '1', 'bell');
    expect(pct(a.worst.rel)).toBe('1.8%');
    expect(v4(a.worst.low)).toBe('803.4 mV');
    expect(v4(a.worst.high)).toBe('833.2 mV');
    expect(pct(a.stats.rel95)).toBe('0.9%');
    const b = run(9, 1 * k, 10 * k, '1', 'bell');
    expect(pct(b.worst.rel)).toBe('0.2%');
    expect(v4(b.worst.low)).toBe('8.167 V');
    expect(v4(b.worst.high)).toBe('8.197 V');
  });
});

describe('equal-resistor identity', () => {
  it('is off by exactly the tolerance', () => {
    for (const t of [0.01, 0.05, 0.1]) {
      for (const vin of [1, 9, 24]) {
        for (const r of [100, 10 * k, 1e6]) {
          const wc = worstCase(vin, r, r, t);
          expect(wc.low).toBeCloseTo((vin * (1 - t)) / 2, 12);
          expect(wc.high).toBeCloseTo((vin * (1 + t)) / 2, 12);
          expect(wc.rel).toBeCloseTo(t, 12);
        }
      }
    }
  });
});

describe('analytic cross-check', () => {
  it('first-order spread, and the batches agree within 10 %', () => {
    const bell = analyticSpread(10 * k, 10 * k, 0.05, 'bell');
    const flat = analyticSpread(10 * k, 10 * k, 0.05, 'flat');
    expect(bell).toBeCloseTo(0.011785, 5);
    expect(flat).toBeCloseTo(0.020412, 5);
    const b = run(9, 10 * k, 10 * k, '5', 'bell');
    const f = run(9, 10 * k, 10 * k, '5', 'flat');
    expect(Math.abs(b.stats.sd / b.nominal / bell - 1)).toBeLessThan(0.1);
    expect(Math.abs(f.stats.sd / f.nominal / flat - 1)).toBeLessThan(0.1);
    expect(f.stats.sd).toBeCloseTo(0.09217, 4);
  });
});

describe('method check against ti-snva112 (W-5)', () => {
  // Its adjustable regulator, Vout = Vref · (R1 + R2) / R1, the divider turned
  // round. Equation 2: every extreme at once. Ideal ratio for 5.0 V.
  const VREF = 1.275;
  const VOUT = 5;
  const ratio = VOUT / VREF - 1; // R2 / R1
  const regulator = (vref: number, r1: number, r2: number) => (vref * (r1 + r2)) / r1;

  function worstSide(t: number): number {
    const high = regulator(VREF * 1.01, 1 - t, ratio * (1 + t));
    const low = regulator(VREF * 0.99, 1 + t, ratio * (1 - t));
    return Math.max(high / VOUT - 1, 1 - low / VOUT);
  }

  it('worst case with Vref ±1 % (Table 1)', () => {
    expect(worstSide(0.01) * 100).toBeCloseTo(2.52, 3);
    expect(worstSide(0.05) * 100).toBeCloseTo(8.921, 3);
  });

  it('six-sigma RSS equals Table 4', () => {
    const sensitivity = 1 - VREF / VOUT;
    const rss = (t: number) =>
      6 * Math.sqrt((0.01 / 6) ** 2 + 2 * ((sensitivity * t) / 6) ** 2);
    expect(formatPercent(rss(0.01), 'en', 2)).toBe('1.45%');
    expect(formatPercent(rss(0.05), 'en', 2)).toBe('5.36%');
  });
});

describe('guards', () => {
  it('vin 0: every output 0, relative figures 0', () => {
    const r = run(0, 10 * k, 10 * k, '5', 'bell');
    expect(r.outputs.every((v) => v === 0)).toBe(true);
    expect(r.worst.rel).toBe(0);
    expectNoNaN(r.worst);
    expectNoNaN(r.stats);
    expect(r.stats.rel95).toBe(0);
    expect(r.stats.furthestRel).toBe(0);
    expect(r.axis).toEqual({ xMin: 0, xMax: 0 });
    expect(r.counts.every((c) => c === 0)).toBe(true);
  });

  it('r1 + r2 = 0 and r2 = 0 give 0; r1 = 0 gives Vin', () => {
    expect(dividerOut(9, 0, 0)).toBe(0);
    expect(dividerOut(9, 10 * k, 0)).toBe(0);
    expect(dividerOut(9, 0, 10 * k)).toBe(9);
    expectNoNaN(worstCase(9, 0, 0, 0.05));
    const r1zero = worstCase(9, 0, 10 * k, 0.05);
    expect(r1zero.rel).toBe(0);
    expect(axisRange(9, 0, 10 * k)).toEqual({ xMin: 0, xMax: 0 });
  });

  it('no builds: empty arrays, stats 0, histogram all zero', () => {
    const outputs = buildOutputs(deviates(1, 0, 'bell'), 9, 10 * k, 10 * k, 0.05);
    expect(outputs.length).toBe(0);
    const stats = spreadStats(outputs, 4.5);
    expect(stats).toEqual({
      nominal: 4.5,
      lo95: 0,
      hi95: 0,
      rel95: 0,
      furthest: 0,
      furthestRel: 0,
      mean: 0,
      sd: 0,
    });
    expect(histogram(outputs, 4, 5, 66)).toEqual(new Array(66).fill(0));
  });

  it('a reversed or empty range counts nothing', () => {
    const values = Float64Array.from([1, 2, 3]);
    expect(histogram(values, 0, 0, 5)).toEqual([0, 0, 0, 0, 0]);
    expect(histogram(values, 3, 1, 5)).toEqual([0, 0, 0, 0, 0]);
    expect(histogram(values, NaN, 1, 5)).toEqual([0, 0, 0, 0, 0]);
    expect(histogram(values, 0, 1, 0)).toEqual([]);
  });

  it('NaN inputs never give NaN', () => {
    expect(dividerOut(NaN, 1, 1)).toBe(0);
    expectNoNaN(worstCase(NaN, NaN, NaN, NaN));
    expectNoNaN(axisRange(NaN, 10 * k, 10 * k));
    expect(analyticSpread(NaN, NaN, 0.05, 'bell')).toBe(0);
    expect(analyticSpread(0, 0, 0.05, 'flat')).toBe(0);
    const outputs = buildOutputs(deviates(1, 10, 'bell'), NaN, 10 * k, 10 * k, NaN);
    expect(outputs.every((v) => v === 0)).toBe(true);
    expectNoNaN(spreadStats(Float64Array.from([NaN, 1, 2]), NaN));
  });
});

describe('directive parsing', () => {
  it('parseTolerance: only "1" selects 1 %', () => {
    for (const raw of [undefined, '', '5%', '0.05', '5']) expect(parseTolerance(raw)).toBe('5');
    expect(parseTolerance('1')).toBe('1');
  });

  it('parseShape: only "flat" selects flat', () => {
    for (const raw of [undefined, 'Bell', 'uniform', 'Flat', 'bell']) {
      expect(parseShape(raw)).toBe('bell');
    }
    expect(parseShape('flat')).toBe('flat');
  });
});
