import { clean, solveKirchhoff, type KirchhoffInput } from './kirchhoff-math';

const k = 1000;

/** The instrument's default: every current is a whole number of milliamps. */
const DEFAULT: KirchhoffInput = { v1: 9, v2: 6, r1: 1 * k, r2: 1 * k, r3: 1 * k };

/** The reverse-current preset: V2 is too low, so V1 pushes current into it. */
const REVERSE: KirchhoffInput = { ...DEFAULT, v2: 3 };

describe('solveKirchhoff', () => {
  it('solves the default network', () => {
    const r = solveKirchhoff(DEFAULT);
    expect(r.va).toBeCloseTo(5, 12);
    expect(r.i1).toBeCloseTo(0.004, 15);
    expect(r.i2).toBeCloseTo(0.005, 15);
    expect(r.i3).toBeCloseTo(0.001, 15);
    expect(r.p1).toBeCloseTo(0.036, 15);
    expect(r.p2).toBeCloseTo(0.006, 15);
    expect(r.s1).toBe('delivering');
    expect(r.s2).toBe('delivering');
  });

  it('reverses I3 and makes V2 absorb when V2 is below the node voltage', () => {
    const r = solveKirchhoff(REVERSE);
    expect(r.va).toBeCloseTo(4, 12);
    expect(r.i1).toBeCloseTo(0.005, 15);
    expect(r.i2).toBeCloseTo(0.004, 15);
    expect(r.i3).toBeCloseTo(-0.001, 15);
    expect(r.p1).toBeCloseTo(0.045, 15);
    expect(r.p2).toBeCloseTo(-0.003, 15);
    expect(r.s1).toBe('delivering');
    expect(r.s2).toBe('absorbing');
  });

  it('matches the closed form with unequal resistors', () => {
    const input = { v1: 9, v2: 6, r1: 1 * k, r2: 2.2 * k, r3: 1 * k };
    const r = solveKirchhoff(input);
    const va = (9 / 1000 + 6 / 1000) / (1 / 1000 + 1 / 2200 + 1 / 1000);
    expect(r.va).toBeCloseTo(va, 12);
    expect(r.va).toBeCloseTo(6.1111, 4);
    // V2 sits just below VA here, so even 6 V is pushed backwards.
    expect(r.i3).toBeLessThan(0);
    expect(r.s2).toBe('absorbing');
  });

  it('balances the current law at A exactly, for any values', () => {
    const cases: KirchhoffInput[] = [
      DEFAULT,
      REVERSE,
      { v1: 24, v2: 0.5, r1: 10, r2: 100 * k, r3: 47 },
      { v1: 1.3, v2: 22, r1: 68 * k, r2: 15, r3: 3.3 * k },
      { v1: 0, v2: 0, r1: 10, r2: 10, r3: 10 },
    ];
    for (const input of cases) {
      const r = solveKirchhoff(input);
      expect(r.kcl).toBe(0);
      const scale = Math.max(Math.abs(r.i1), Math.abs(r.i2), Math.abs(r.i3), 1e-30);
      expect(Math.abs(r.currentIn - r.currentOut) / scale).toBeLessThan(1e-9);
    }
  });

  it('balances the voltage law around both loops', () => {
    for (const input of [DEFAULT, REVERSE, { v1: 7, v2: 19, r1: 820, r2: 47 * k, r3: 12 }]) {
      const r = solveKirchhoff(input);
      expect(r.kvlLeft.sum).toBe(0);
      expect(r.kvlRight.sum).toBe(0);
      expect(r.kvlLeft.terms[0]).toBe(input.v1);
      expect(r.kvlRight.terms[0]).toBe(input.v2);
    }
  });

  it('lists the loop terms with their signs', () => {
    expect(solveKirchhoff(DEFAULT).kvlLeft.terms.map((v) => +v.toFixed(9))).toEqual([9, -4, -5]);
    expect(solveKirchhoff(DEFAULT).kvlRight.terms.map((v) => +v.toFixed(9))).toEqual([6, -1, -5]);
    // A reversed I3 makes the R3 term a rise, not a drop.
    expect(solveKirchhoff(REVERSE).kvlRight.terms.map((v) => +v.toFixed(9))).toEqual([3, 1, -4]);
  });

  it('gives exactly zero current, not residue, at the turning point', () => {
    // With equal resistors I3 stops when V2 is half of V1.
    const r = solveKirchhoff({ ...DEFAULT, v2: 4.5 });
    expect(r.i3).toBe(0);
    expect(r.s2).toBe('none');
  });

  it('reports no power for a 0 V source even when current flows through it', () => {
    const r = solveKirchhoff({ ...DEFAULT, v2: 0 });
    expect(r.i3).toBeLessThan(0);
    expect(r.s2).toBe('none');
  });

  it('rejects resistances that are not positive and finite', () => {
    expect(() => solveKirchhoff({ ...DEFAULT, r2: 0 })).toThrow(RangeError);
    expect(() => solveKirchhoff({ ...DEFAULT, r1: -10 })).toThrow(RangeError);
    expect(() => solveKirchhoff({ ...DEFAULT, r3: Infinity })).toThrow(RangeError);
    expect(() => solveKirchhoff({ ...DEFAULT, v1: NaN })).toThrow(RangeError);
  });
});

describe('clean', () => {
  it('snaps residue to zero and leaves real values alone', () => {
    expect(clean(1e-19, 0.005)).toBe(0);
    expect(clean(-1e-19, 0.005)).toBe(0);
    expect(clean(0.001, 0.005)).toBe(0.001);
  });
});
