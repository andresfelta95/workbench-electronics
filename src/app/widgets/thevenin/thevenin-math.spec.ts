import { formatPercent, formatSI, parallel } from '../../core/format';
import {
  CELLS,
  curvePoints,
  heatTone,
  loadPower,
  meterReading,
  parseLoaded,
  parseSource,
  rintFromReadings,
  solveDividerSource,
  solveSource,
  sourceFlow,
  type SourceInput,
  type SourceResult,
  theveninOf,
} from './thevenin-math';

const k = 1000;
const NBSP = ' ';

const si = (value: number, unit: string) => formatSI(value, unit, 'en');
const siEs = (value: number, unit: string) => formatSI(value, unit, 'es');
/** Battery-family voltages, as readout 1 shows them (brief D-17). */
const v4 = (value: number) => formatSI(value, 'V', 'en', 4);
const v4Es = (value: number) => formatSI(value, 'V', 'es', 4);
const pct = (value: number) => formatPercent(value, 'en', 1);
const pctEs = (value: number) => formatPercent(value, 'es', 1);

const cell = (key: keyof typeof CELLS, rload: number, loaded = true): SourceInput => ({
  voc: CELLS[key].voc,
  rint: CELLS[key].rint,
  rload,
  loaded,
});

const FIELDS: (keyof SourceResult)[] = [
  'terminal',
  'drop',
  'current',
  'loadPower',
  'internalPower',
  'efficiency',
  'isc',
  'pmax',
  'fractionOfMax',
];

function expectNoNaN(result: object): void {
  for (const [key, value] of Object.entries(result)) {
    if (typeof value === 'number') expect(Number.isNaN(value), key).toBe(false);
  }
}

describe('solveSource (battery family)', () => {
  it('1: the default, an AA on 10 Ω', () => {
    const r = solveSource(cell('aa', 10));
    expect(v4(r.terminal)).toBe('1.561 V');
    expect(v4Es(r.terminal)).toBe('1,561 V');
    expect(si(r.drop, 'V')).toBe('39 mV');
    expect(si(r.current, 'A')).toBe('156 mA');
    expect(si(r.loadPower, 'W')).toBe('244 mW');
    expect(si(r.pmax, 'W')).toBe('2.56 W');
    expect(siEs(r.pmax, 'W')).toBe('2,56 W');
    expect(pct(r.fractionOfMax)).toBe('9.5%');
    expect(pctEs(r.fractionOfMax)).toBe(`9,5${NBSP}%`);
    expect(si(r.internalPower, 'W')).toBe('6.09 mW');
    expect(siEs(r.internalPower, 'W')).toBe('6,09 mW');
    expect(pct(r.efficiency)).toBe('97.6%');
    expect(pctEs(r.efficiency)).toBe(`97,6${NBSP}%`);
    expect(si(r.isc, 'A')).toBe('6.4 A');
    expect(siEs(r.isc, 'A')).toBe('6,4 A');
    expect(heatTone(r)).toBe('plain');
  });

  it('2: an AA with the load off reads Voc', () => {
    const r = solveSource(cell('aa', 10, false));
    expect(v4(r.terminal)).toBe('1.6 V');
    expect(si(r.current, 'A')).toBe('0 A');
    expect(si(r.loadPower, 'W')).toBe('0 W');
    expect(si(r.internalPower, 'W')).toBe('0 W');
    expect(r.efficiency).toBe(0);
    expect(si(r.isc, 'A')).toBe('6.4 A');
    expect(heatTone(r)).toBe('plain');
  });

  it('3: an AA at 0.25 Ω is at its peak, 50 % efficiency, still plain', () => {
    const r = solveSource(cell('aa', 0.25));
    expect(v4(r.terminal)).toBe('800 mV');
    expect(si(r.current, 'A')).toBe('3.2 A');
    expect(si(r.loadPower, 'W')).toBe('2.56 W');
    expect(pct(r.fractionOfMax)).toBe('100%');
    expect(si(r.internalPower, 'W')).toBe('2.56 W');
    expect(pct(r.efficiency)).toBe('50%');
    expect(pctEs(r.efficiency)).toBe(`50${NBSP}%`);
    expect(heatTone(r)).toBe('plain');
  });

  it('4: an AA past its peak warns', () => {
    const r = solveSource(cell('aa', 0.1));
    expect(si(r.loadPower, 'W')).toBe('2.09 W');
    expect(pct(r.fractionOfMax)).toBe('81.6%');
    expect(si(r.internalPower, 'W')).toBe('5.22 W');
    expect(pct(r.efficiency)).toBe('28.6%');
    expect(pctEs(r.efficiency)).toBe(`28,6${NBSP}%`);
    expect(heatTone(r)).toBe('warn');
    const e24 = solveSource(cell('aa', 0.24));
    expect(pct(e24.efficiency)).toBe('49%');
    expect(heatTone(e24)).toBe('warn');
  });

  it('5: a 9 V battery on 220 Ω, and Rint back from the two readings', () => {
    const r = solveSource(cell('9v', 220));
    expect(v4(r.terminal)).toBe('9.501 V');
    expect(v4Es(r.terminal)).toBe('9,501 V');
    expect(si(r.drop, 'V')).toBe('99.3 mV');
    expect(si(r.current, 'A')).toBe('43.2 mA');
    expect(siEs(r.current, 'A')).toBe('43,2 mA');
    expect(si(r.loadPower, 'W')).toBe('410 mW');
    expect(pct(r.efficiency)).toBe('99%');
    expect(rintFromReadings(9.6, 9.501, 220)).toBeCloseTo(2.292, 3);
  });

  it('6: a 9 V battery at 2.3 Ω gives its 10 W peak', () => {
    const r = solveSource(cell('9v', 2.3));
    expect(v4(r.terminal)).toBe('4.8 V');
    expect(si(r.current, 'A')).toBe('2.09 A');
    expect(si(r.loadPower, 'W')).toBe('10 W');
    expect(pct(r.efficiency)).toBe('50%');
    expect(si(r.isc, 'A')).toBe('4.17 A');
    expect(siEs(r.isc, 'A')).toBe('4,17 A');
  });

  it('7: a 9 V battery at 1 Ω heats more than it delivers', () => {
    const r = solveSource(cell('9v', 1));
    expect(v4(r.terminal)).toBe('2.909 V');
    expect(si(r.current, 'A')).toBe('2.91 A');
    expect(si(r.loadPower, 'W')).toBe('8.46 W');
    expect(si(r.internalPower, 'W')).toBe('19.5 W');
    expect(pct(r.efficiency)).toBe('30.3%');
    expect(heatTone(r)).toBe('warn');
  });

  it('8: NiMH', () => {
    const open = solveSource(cell('nimh', 10, false));
    expect(si(open.isc, 'A')).toBe('40 A');
    expect(si(open.pmax, 'W')).toBe('12 W');
    const r = solveSource(cell('nimh', 10));
    expect(v4(r.terminal)).toBe('1.196 V');
    expect(si(r.current, 'A')).toBe('120 mA');
    expect(si(r.loadPower, 'W')).toBe('143 mW');
    expect(pct(r.fractionOfMax)).toBe('1.2%');
    expect(pctEs(r.fractionOfMax)).toBe(`1,2${NBSP}%`);
    expect(si(r.internalPower, 'W')).toBe('429 µW');
  });

  it('9: more volts is not more power (the misconception)', () => {
    const pmax = (key: keyof typeof CELLS) => solveSource(cell(key, 1)).pmax;
    expect(pmax('9v')).toBeCloseTo(10.017, 3);
    expect(pmax('nimh')).toBeGreaterThan(pmax('9v'));
    expect(pmax('9v')).toBeGreaterThan(pmax('aa'));
    expect(pmax('aa')).toBeGreaterThan(pmax('cr2032'));
    expect(pmax('nimh')).toBeCloseTo(12, 12);
    expect(pmax('aa')).toBeCloseTo(2.56, 12);
    expect(pmax('cr2032')).toBeCloseTo(0.256, 12);
    const at10 = (key: keyof typeof CELLS) => solveSource(cell(key, 10)).loadPower;
    expect(si(at10('9v'), 'W')).toBe('6.09 W');
    expect(si(at10('nimh'), 'W')).toBe('143 mW');
    expect(at10('9v')).toBeGreaterThan(at10('nimh'));
  });

  it('9a: the CR2032 coin cell', () => {
    const open = solveSource(cell('cr2032', 10, false));
    expect(v4(open.terminal)).toBe('3.2 V');
    expect(v4Es(open.terminal)).toBe('3,2 V');
    expect(si(open.isc, 'A')).toBe('320 mA');
    expect(si(open.pmax, 'W')).toBe('256 mW');

    const peak = solveSource(cell('cr2032', 10));
    expect(v4(peak.terminal)).toBe('1.6 V');
    expect(v4Es(peak.terminal)).toBe('1,6 V');
    expect(si(peak.drop, 'V')).toBe('1.6 V');
    expect(si(peak.current, 'A')).toBe('160 mA');
    expect(si(peak.loadPower, 'W')).toBe('256 mW');
    expect(pct(peak.fractionOfMax)).toBe('100%');
    expect(pctEs(peak.fractionOfMax)).toBe(`100${NBSP}%`);
    expect(si(peak.internalPower, 'W')).toBe('256 mW');
    expect(pct(peak.efficiency)).toBe('50%');
    expect(heatTone(peak)).toBe('plain');

    const r100 = solveSource(cell('cr2032', 100));
    expect(v4(r100.terminal)).toBe('2.909 V');
    expect(v4Es(r100.terminal)).toBe('2,909 V');
    expect(si(r100.drop, 'V')).toBe('291 mV');
    expect(si(r100.current, 'A')).toBe('29.1 mA');
    expect(siEs(r100.current, 'A')).toBe('29,1 mA');
    expect(si(r100.loadPower, 'W')).toBe('84.6 mW');
    expect(siEs(r100.loadPower, 'W')).toBe('84,6 mW');
    expect(pct(r100.fractionOfMax)).toBe('33.1%');
    expect(pctEs(r100.fractionOfMax)).toBe(`33,1${NBSP}%`);
    expect(si(r100.internalPower, 'W')).toBe('8.46 mW');
    expect(pct(r100.efficiency)).toBe('90.9%');
    expect(pctEs(r100.efficiency)).toBe(`90,9${NBSP}%`);

    const r25 = solveSource(cell('cr2032', 25));
    expect(v4(r25.terminal)).toBe('2.286 V');
    expect(si(r25.current, 'A')).toBe('91.4 mA');

    const worn = solveSource({ voc: 3.2, rint: 65, rload: 100, loaded: true });
    expect(v4(worn.terminal)).toBe('1.939 V');
    expect(v4Es(worn.terminal)).toBe('1,939 V');
    expect(si(worn.isc, 'A')).toBe('49.2 mA');

    // The manual's dual-pulse example (energizer-lithium-coin-manual p. 4).
    const manual = (3.279 - 2.429) / (0.097 - 0.000003);
    expect(si(manual, 'Ω')).toBe('8.76 Ω');
    expect(siEs(manual, 'Ω')).toBe('8,76 Ω');
  });

  it('10: the curve is its own mirror image about RL = Rint on a log axis', () => {
    for (const { voc, rint } of Object.values(CELLS)) {
      for (const f of [2, 10, 100]) {
        expect(loadPower(voc, rint, f * rint)).toBeCloseTo(loadPower(voc, rint, rint / f), 12);
      }
    }
    expect(si(loadPower(1.6, 0.25, 2.5), 'W')).toBe('846 mW');
    expect(si(loadPower(1.6, 0.25, 0.025), 'W')).toBe('846 mW');
  });

  it('11: the sampled peak is at the point nearest Rint, within 0.01 % of Pmax', () => {
    for (const { voc, rint } of Object.values(CELLS)) {
      const points = curvePoints(voc, rint, 0.01, 1e4, 2001);
      let best = points[0];
      for (const p of points) if (p[1] > best[1]) best = p;
      const nearest = points.reduce((a, b) =>
        Math.abs(Math.log(b[0] / rint)) < Math.abs(Math.log(a[0] / rint)) ? b : a,
      );
      const pmax = solveSource({ voc, rint, rload: rint, loaded: true }).pmax;
      expect(best[0]).toBe(nearest[0]);
      expect(Math.abs(best[1] - pmax) / pmax).toBeLessThan(1e-4);
      expect(pmax).toBe((voc * voc) / (4 * rint));
    }
  });

  it('12: identities over a grid', () => {
    for (const voc of [1, 1.6, 9.6, 24]) {
      for (const rint of [0.01, 0.25, 2.3, 100]) {
        for (const rload of [0.01, 0.3, 10, 1e4]) {
          const r = solveSource({ voc, rint, rload, loaded: true });
          expect(r.terminal).toBeCloseTo((voc * rload) / (rint + rload), 12);
          expect(r.loadPower + r.internalPower).toBeCloseTo(voc * r.current, 12);
          expect(r.efficiency).toBeCloseTo(rload / (rload + rint), 12);
        }
      }
    }
  });

  it('13: two readings give Rint back', () => {
    expect(rintFromReadings(1.6, 1.561, 10)).toBeCloseTo(0.2498, 4);
    // From the displayed figures: 39 mV over 156 mA.
    expect((1.6 - 1.561) / 0.156).toBeCloseTo(0.25, 12);
  });

  it('18: closing 00-05 loop, a 9 V battery into the meter current jacks', () => {
    const ma = solveSource(cell('9v', 1.8));
    expect(si(ma.current, 'A')).toBe('2.34 A');
    expect(siEs(ma.current, 'A')).toBe('2,34 A');
    const a = solveSource(cell('9v', 0.03));
    expect(si(a.current, 'A')).toBe('4.12 A');
    expect(siEs(a.current, 'A')).toBe('4,12 A');
  });

  it('20: heatTone boundaries', () => {
    const peak = solveSource({ voc: 2, rint: 3, rload: 3, loaded: true });
    expect(peak.efficiency).toBe(0.5);
    expect(heatTone(peak)).toBe('plain');
    expect(heatTone(solveSource({ voc: 2, rint: 3, rload: 0.999 * 3, loaded: true }))).toBe('warn');
    expect(heatTone(solveSource({ voc: 2, rint: 3, rload: 0.1, loaded: false }))).toBe('plain');
  });

  it('21: guards, and never NaN', () => {
    const ideal = solveSource({ voc: 5, rint: 0, rload: 10, loaded: true });
    expect(ideal.terminal).toBe(5);
    expect(ideal.isc).toBe(Infinity);
    expect(si(ideal.isc, 'A')).toBe('— A');
    expect(ideal.pmax).toBe(Infinity);
    expect(si(ideal.pmax, 'W')).toBe('— W');
    expect(ideal.fractionOfMax).toBe(0);

    const shorted = solveSource({ voc: 5, rint: 1, rload: 0, loaded: true });
    expect(shorted.terminal).toBe(0);
    expect(shorted.current).toBe(shorted.isc);
    expect(shorted.loadPower).toBe(0);
    expect(shorted.efficiency).toBe(0);
    expect(heatTone(shorted)).toBe('warn');

    const dead = solveSource({ voc: 0, rint: 1, rload: 10, loaded: true });
    for (const f of FIELDS) expect(dead[f], f).toBe(0);
    expect(dead.heatWarn).toBe(false);

    const zero = solveSource({ voc: 5, rint: 0, rload: 0, loaded: true });
    for (const f of ['terminal', 'current', 'loadPower', 'internalPower', 'efficiency'] as const)
      expect(zero[f], f).toBe(0);

    const infinite = solveSource({ voc: 5, rint: 1, rload: Infinity, loaded: true });
    expect(infinite.terminal).toBe(5);
    expect(infinite.current).toBe(0);
    expect(heatTone(infinite)).toBe('plain');

    const nans = [
      { voc: NaN, rint: 1, rload: 10, loaded: true },
      { voc: 5, rint: NaN, rload: 10, loaded: true },
      { voc: 5, rint: 1, rload: NaN, loaded: true },
      { voc: NaN, rint: NaN, rload: NaN, loaded: false },
    ];
    for (const input of nans) expectNoNaN(solveSource(input));
    for (const input of [
      { vin: 9, r1: 0, r2: 0, rload: 10, loaded: true },
      { vin: 9, r1: 0, r2: 0, rload: 10, loaded: false },
      { vin: 9, r1: 0, r2: 10, rload: 10, loaded: true },
      { vin: 9, r1: 10, r2: 0, rload: 10, loaded: true },
      { vin: NaN, r1: NaN, r2: NaN, rload: NaN, loaded: true },
      { vin: 9, r1: 10, r2: 10, rload: 0, loaded: true },
    ]) {
      expectNoNaN(solveDividerSource(input));
    }
    const noDivider = solveDividerSource({ vin: 9, r1: 0, r2: 0, rload: 10, loaded: true });
    expect(noDivider.terminal).toBe(0);
    expect(noDivider.internalPower).toBe(0);
    const r1Zero = solveDividerSource({ vin: 9, r1: 0, r2: 10, rload: 10, loaded: true });
    expect(r1Zero.rth).toBe(0);
    expect(r1Zero.isc).toBe(Infinity);
    expect(r1Zero.pmax).toBe(Infinity);
    expect(r1Zero.fractionOfMax).toBe(0);
    expectNoNaN(theveninOf(NaN, 0, 0));
    expectNoNaN({ a: loadPower(NaN, 0, 0), b: rintFromReadings(0, 0, 10) });
    expectNoNaN({ c: meterReading(1, 0, 0) });
  });
});

describe('solveDividerSource (divider family)', () => {
  const DEFAULTS = { vin: 9, r1: 10 * k, r2: 10 * k, rload: 10 * k, loaded: true };

  it('14: 00-03 defaults, 3 V, and the equivalent says nothing about the heat inside', () => {
    const r = solveDividerSource(DEFAULTS);
    expect(si(r.vth, 'V')).toBe('4.5 V');
    expect(si(r.rth, 'Ω')).toBe('5 kΩ');
    expect(si(r.terminal, 'V')).toBe('3 V');
    expect(si(r.current, 'A')).toBe('300 µA');
    expect(si(r.loadPower, 'W')).toBe('900 µW');
    expect(si(r.pmax, 'W')).toBe('1.01 mW');
    expect(siEs(r.pmax, 'W')).toBe('1,01 mW');
    expect(pct(r.fractionOfMax)).toBe('88.9%');
    expect(pctEs(r.fractionOfMax)).toBe(`88,9${NBSP}%`);
    expect(si(r.internalPower, 'W')).toBe('4.5 mW');
    expect(siEs(r.internalPower, 'W')).toBe('4,5 mW');
    expect(pct(r.efficiency)).toBe('16.7%');
    expect(pctEs(r.efficiency)).toBe(`16,7${NBSP}%`);
    expect(si(r.isc, 'A')).toBe('900 µA');
    expect(heatTone(r)).toBe('warn');
    const equivalentHeat = r.current * r.current * r.rth;
    expect(si(equivalentHeat, 'W')).toBe('450 µW');
    expect(equivalentHeat).not.toBeCloseTo(r.internalPower, 6);
    expect(r.supplyPower).toBeCloseTo((9 * (9 - r.terminal)) / (10 * k), 15);
  });

  it('15: unloaded, 4.5 V and 00-03 "Wasted in the divider"', () => {
    const r = solveDividerSource({ ...DEFAULTS, loaded: false });
    expect(si(r.terminal, 'V')).toBe('4.5 V');
    expect(si(r.internalPower, 'W')).toBe('4.05 mW');
    expect(siEs(r.internalPower, 'W')).toBe('4,05 mW');
    expect(si(r.loadPower, 'W')).toBe('0 W');
    expect(r.efficiency).toBe(0);
    expect(heatTone(r)).toBe('plain');
  });

  it('16: at 5 kΩ the divider gives its peak', () => {
    const r = solveDividerSource({ ...DEFAULTS, rload: 5 * k });
    expect(si(r.terminal, 'V')).toBe('2.25 V');
    expect(si(r.current, 'A')).toBe('450 µA');
    expect(si(r.loadPower, 'W')).toBe('1.01 mW');
    expect(pct(r.fractionOfMax)).toBe('100%');
    expect(si(r.internalPower, 'W')).toBe('5.06 mW');
    expect(pct(r.efficiency)).toBe('16.7%');
  });

  it('17: the 00-03 loaded formula, over a grid and at spot checks', () => {
    for (const vin of [1, 9, 24]) {
      for (const r1 of [100, 4.7 * k, 1e6]) {
        for (const r2 of [100, 10 * k, 1e6]) {
          for (const rload of [100, 10 * k, 1e6]) {
            const r = solveDividerSource({ vin, r1, r2, rload, loaded: true });
            const r2l = parallel(r2, rload);
            expect(r.terminal).toBeCloseTo((vin * r2l) / (r1 + r2l), 12);
          }
        }
      }
    }
    const stiff = solveDividerSource({ ...DEFAULTS, r1: 100, r2: 100 });
    expect(si(stiff.terminal, 'V')).toBe('4.48 V');
    expect(si(stiff.loadPower, 'W')).toBe('2 mW');
    expect(pct(stiff.fractionOfMax)).toBe('2%');
    expect(si(stiff.internalPower, 'W')).toBe('405 mW');
    expect(pct(stiff.efficiency)).toBe('0.5%');
    expect(pctEs(stiff.efficiency)).toBe(`0,5${NBSP}%`);
    const r47 = solveDividerSource({ ...DEFAULTS, r2: 4.7 * k });
    expect(si(r47.terminal, 'V')).toBe('2.18 V');
  });
});

describe('meterReading', () => {
  it('19: a 10 MΩ meter changes nothing on a battery, -0.05 % on the divider', () => {
    const aa = meterReading(1.6, 0.25);
    expect(v4(aa)).toBe('1.6 V');
    expect((aa - 1.6) / 1.6).toBeCloseTo(-2.5e-8, 12);
    const div = meterReading(4.5, 5000);
    const error = (div - 4.5) / 4.5;
    // −Zout / (Zout + Rin): −0.0499… %.
    expect(error).toBeCloseTo(-5000 / (10e6 + 5000), 12);
    expect(error * 100).toBeCloseTo(-0.04998, 5);
    expect(formatPercent(error, 'en', 2)).toBe('-0.05%');
  });
});

describe('curvePoints', () => {
  it('22: 121 log-spaced points across the battery load range', () => {
    const points = curvePoints(1.6, 0.25, 0.01, 1e4, 121);
    expect(points.length).toBe(121);
    expect(points[0][0]).toBe(0.01);
    expect(points[120][0]).toBe(1e4);
    const step = points[1][0] / points[0][0];
    for (let i = 1; i < points.length; i++) {
      expect(points[i][0] / points[i - 1][0]).toBeCloseTo(step, 9);
    }
    for (const [, y] of points) {
      expect(Number.isFinite(y)).toBe(true);
      expect(y).toBeGreaterThanOrEqual(0);
    }
  });

  it('defaults to 121 points and returns none for an unusable range', () => {
    expect(curvePoints(1.6, 0.25, 0.01, 1e4).length).toBe(121);
    expect(curvePoints(1.6, 0.25, 0, 1e4)).toEqual([]);
    expect(curvePoints(1.6, 0.25, 10, 1)).toEqual([]);
  });
});

describe('props, tone and flow', () => {
  it('23: parseSource and parseLoaded', () => {
    for (const raw of [undefined, '', 'AA', 'CR2032', 'battery'])
      expect(parseSource(raw)).toBe('aa');
    for (const raw of ['aa', '9v', 'nimh', 'cr2032', 'custom', 'divider'] as const) {
      expect(parseSource(raw)).toBe(raw);
    }
    for (const raw of [undefined, '', 'true', 'on']) expect(parseLoaded(raw)).toBe(true);
    expect(parseLoaded('false')).toBe(false);
  });

  it('24: sourceFlow', () => {
    expect(sourceFlow(10)).toBe(1);
    expect(sourceFlow(1e-3)).toBeCloseTo(3 / 7, 12);
    expect(sourceFlow(1e-6)).toBe(0.08);
    for (const amps of [0, -1, NaN, Infinity]) expect(sourceFlow(amps)).toBe(0);
  });

  it('25: CELLS', () => {
    expect(CELLS.aa).toEqual({ voc: 1.6, rint: 0.25, symbol: 'cell' });
    expect(CELLS['9v']).toEqual({ voc: 9.6, rint: 2.3, symbol: 'battery' });
    expect(CELLS.nimh).toEqual({ voc: 1.2, rint: 0.03, symbol: 'cell' });
    expect(CELLS.cr2032).toEqual({ voc: 3.2, rint: 10, symbol: 'cell' });
  });
});
