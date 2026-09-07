import type { Lang } from './content.types';

const PREFIXES: { exp: number; symbol: string }[] = [
  { exp: 9, symbol: 'G' },
  { exp: 6, symbol: 'M' },
  { exp: 3, symbol: 'k' },
  { exp: 0, symbol: '' },
  { exp: -3, symbol: 'm' },
  { exp: -6, symbol: 'µ' },
  { exp: -9, symbol: 'n' },
  { exp: -12, symbol: 'p' },
];

const LOCALE: Record<Lang, string> = { en: 'en-CA', es: 'es-ES' };

/**
 * Engineering notation: 0.0136 A -> "13.6 mA", 10000 -> "10 kΩ".
 * Significant figures rather than fixed decimals, because a reading of
 * "0.00 V" next to "13.5673 mA" is how instruments stop being readable.
 */
export function formatSI(value: number, unit: string, lang: Lang, sig = 3): string {
  if (!Number.isFinite(value)) return `— ${unit}`;
  if (value === 0) return `0 ${unit}`;

  const magnitude = Math.abs(value);
  const chosen =
    PREFIXES.find((p) => magnitude >= Math.pow(10, p.exp)) ?? PREFIXES[PREFIXES.length - 1];
  const scaled = value / Math.pow(10, chosen.exp);

  // Keep `sig` significant figures, but never render trailing noise.
  const digits = Math.max(0, sig - 1 - Math.floor(Math.log10(Math.abs(scaled))));
  const text = new Intl.NumberFormat(LOCALE[lang], {
    maximumFractionDigits: Math.min(digits, 4),
    minimumFractionDigits: 0,
  }).format(scaled);

  return `${text} ${chosen.symbol}${unit}`;
}

export function formatNumber(value: number, lang: Lang, digits = 1): string {
  if (!Number.isFinite(value)) return '—';
  return new Intl.NumberFormat(LOCALE[lang], {
    maximumFractionDigits: digits,
    minimumFractionDigits: 0,
  }).format(value);
}

export function formatPercent(fraction: number, lang: Lang, digits = 1): string {
  if (!Number.isFinite(fraction)) return '—';
  return new Intl.NumberFormat(LOCALE[lang], {
    style: 'percent',
    maximumFractionDigits: digits,
  }).format(fraction);
}

const SUFFIX_SCALE: Record<string, number> = {
  p: 1e-12,
  n: 1e-9,
  u: 1e-6,
  µ: 1e-6,
  m: 1e-3,
  k: 1e3,
  K: 1e3,
  M: 1e6,
  G: 1e9,
};

/** Parses authoring shorthand from a widget directive: "10k", "4.7k", "100n". */
export function parseValue(raw: string | undefined, fallback: number): number {
  if (!raw) return fallback;
  const match = /^\s*(-?[\d.]+)\s*([pnuµmkKMG]?)\s*$/.exec(raw);
  if (!match) return fallback;
  const value = Number(match[1]);
  if (!Number.isFinite(value)) return fallback;
  return value * (SUFFIX_SCALE[match[2]] ?? 1);
}

/**
 * Snaps a resistance to the nearest E24 preferred value, which is what you can
 * actually buy. Used by the instruments so the numbers stay realistic.
 */
const E24 = [
  1.0, 1.1, 1.2, 1.3, 1.5, 1.6, 1.8, 2.0, 2.2, 2.4, 2.7, 3.0, 3.3, 3.6, 3.9, 4.3, 4.7, 5.1, 5.6,
  6.2, 6.8, 7.5, 8.2, 9.1,
];

export function snapToE24(value: number): number {
  if (!Number.isFinite(value) || value <= 0) return value;
  const decade = Math.pow(10, Math.floor(Math.log10(value)));
  const mantissa = value / decade;
  let best = E24[0];
  let bestErr = Infinity;
  for (const candidate of [...E24, 10]) {
    const err = Math.abs(Math.log(candidate) - Math.log(mantissa));
    if (err < bestErr) {
      bestErr = err;
      best = candidate;
    }
  }
  return Number((best * decade).toPrecision(3));
}

/** Maps a slider position (0..1) onto a logarithmic value range. */
export function logFromSlider(position: number, min: number, max: number): number {
  const lo = Math.log10(min);
  const hi = Math.log10(max);
  return Math.pow(10, lo + position * (hi - lo));
}

export function sliderFromLog(value: number, min: number, max: number): number {
  const lo = Math.log10(min);
  const hi = Math.log10(max);
  return (Math.log10(value) - lo) / (hi - lo);
}

export function parallel(a: number, b: number): number {
  if (!Number.isFinite(a)) return b;
  if (!Number.isFinite(b)) return a;
  if (a + b === 0) return 0;
  return (a * b) / (a + b);
}
