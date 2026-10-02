/**
 * The two-source, two-loop network the `kirchhoff` instrument draws:
 *
 *   V1 (+) ── R1 ──┬── R3 ── (+) V2
 *                  A
 *                  R2
 *   V1 (−) ────────┴──────── (−) V2   (common ground rail)
 *
 * Series and parallel cannot reduce it, because each source sits in a
 * different branch. There is one unknown, the voltage of node A, and the
 * current law at A gives it directly:
 *
 *   (V1 − VA)/R1 + (V2 − VA)/R3 = VA/R2
 *   VA = (V1/R1 + V2/R3) / (1/R1 + 1/R2 + 1/R3)
 *
 * Sign convention (stated on the instrument too):
 *   I1  through R1, positive flowing from V1 into A
 *   I3  through R3, positive flowing from V2 into A
 *   I2  through R2, positive flowing from A down to ground
 *   P   a source's power, V × (current leaving its + terminal): positive
 *       means it delivers energy, negative means it absorbs it (is charged)
 *
 * With that convention I1 leaves V1's + terminal and I3 leaves V2's, so
 * P1 = V1 · I1 and P2 = V2 · I3.
 */

export interface KirchhoffInput {
  readonly v1: number;
  readonly v2: number;
  readonly r1: number;
  readonly r2: number;
  readonly r3: number;
}

/** What a source is doing with energy right now. */
export type SourceState = 'delivering' | 'absorbing' | 'none';

/** One loop of the voltage law: each signed term, and what they add up to. */
export interface LoopSum {
  /** [source, −drop across the outer resistor, −drop across R2], in volts. */
  readonly terms: readonly [number, number, number];
  readonly sum: number;
}

export interface KirchhoffResult {
  readonly va: number;
  readonly i1: number;
  readonly i2: number;
  readonly i3: number;
  /** I1 + I3 − I2: everything into A minus everything out of it. */
  readonly kcl: number;
  /** The same balance as physical totals, both non-negative. */
  readonly currentIn: number;
  readonly currentOut: number;
  /** Left loop: V1 − I1·R1 − I2·R2. */
  readonly kvlLeft: LoopSum;
  /** Right loop: V2 − I3·R3 − I2·R2. */
  readonly kvlRight: LoopSum;
  readonly p1: number;
  readonly p2: number;
  readonly s1: SourceState;
  readonly s2: SourceState;
}

/**
 * Relative size below which a result is floating-point residue, not a value.
 * The sums are zero by construction; without this they read "-0 pA".
 */
const RESIDUE = 1e-9;

/** Snaps `value` to exactly 0 when it is residue relative to `scale`. */
export function clean(value: number, scale: number): number {
  return Math.abs(value) <= Math.abs(scale) * RESIDUE ? 0 : value;
}

function sourceState(power: number): SourceState {
  if (power > 0) return 'delivering';
  if (power < 0) return 'absorbing';
  return 'none';
}

function loop(source: number, outer: number, shared: number): LoopSum {
  const terms = [source, -outer, -shared] as const;
  const scale = Math.max(...terms.map(Math.abs));
  return { terms, sum: clean(terms[0] + terms[1] + terms[2], scale) };
}

/**
 * Solves the network. Resistances must be positive and finite; voltages may
 * be any finite number (the instrument keeps them within 0–24 V).
 */
export function solveKirchhoff({ v1, v2, r1, r2, r3 }: KirchhoffInput): KirchhoffResult {
  for (const r of [r1, r2, r3]) {
    if (!(r > 0) || !Number.isFinite(r)) {
      throw new RangeError(`resistance must be positive and finite, got ${r}`);
    }
  }
  if (!Number.isFinite(v1) || !Number.isFinite(v2)) {
    throw new RangeError(`source voltages must be finite, got ${v1} and ${v2}`);
  }

  const va = (v1 / r1 + v2 / r3) / (1 / r1 + 1 / r2 + 1 / r3);

  // A current that should be exactly zero (V2 = VA, say) comes out as 1e-19 A.
  const raw = [(v1 - va) / r1, va / r2, (v2 - va) / r3];
  const scale = Math.max(...raw.map(Math.abs));
  const [i1, i2, i3] = raw.map((i) => clean(i, scale));

  const inflow = Math.max(0, i1) + Math.max(0, i3) + Math.max(0, -i2);
  const outflow = Math.max(0, -i1) + Math.max(0, -i3) + Math.max(0, i2);

  const p1 = v1 * i1;
  const p2 = v2 * i3;

  return {
    va,
    i1,
    i2,
    i3,
    kcl: clean(i1 + i3 - i2, scale),
    currentIn: inflow,
    currentOut: outflow,
    kvlLeft: loop(v1, i1 * r1, i2 * r2),
    kvlRight: loop(v2, i3 * r3, i2 * r2),
    p1,
    p2,
    s1: sourceState(p1),
    s2: sourceState(p2),
  };
}
