import {
  formatNumber,
  formatPercent,
  formatSI,
  logFromSlider,
  parallel,
  parseValue,
  sliderFromLog,
  snapToE24,
} from './format';

/** es-ES puts a no-break space before the percent sign. */
const NBSP = ' ';

describe('formatSI', () => {
  it('picks the engineering prefix for each decade', () => {
    expect(formatSI(1.5e9, 'Ω', 'en')).toBe('1.5 GΩ');
    expect(formatSI(2.2e6, 'Ω', 'en')).toBe('2.2 MΩ');
    expect(formatSI(4700, 'Ω', 'en')).toBe('4.7 kΩ');
    expect(formatSI(470, 'Ω', 'en')).toBe('470 Ω');
    expect(formatSI(0.0136, 'A', 'en')).toBe('13.6 mA');
    expect(formatSI(2.5e-6, 'A', 'en')).toBe('2.5 µA');
    expect(formatSI(3.3e-9, 'F', 'en')).toBe('3.3 nF');
    expect(formatSI(6.8e-12, 'F', 'en')).toBe('6.8 pF');
  });

  it('matches the examples in its own doc comment', () => {
    expect(formatSI(0.0136, 'A', 'en')).toBe('13.6 mA');
    expect(formatSI(10000, 'Ω', 'en')).toBe('10 kΩ');
  });

  it('keeps three significant figures and drops trailing zeros', () => {
    expect(formatSI(1234, 'Ω', 'en')).toBe('1.23 kΩ');
    expect(formatSI(12345, 'Ω', 'en')).toBe('12.3 kΩ');
    expect(formatSI(123456, 'Ω', 'en')).toBe('123 kΩ');
    expect(formatSI(1500, 'Ω', 'en')).toBe('1.5 kΩ');
    expect(formatSI(2000, 'Ω', 'en')).toBe('2 kΩ');
    expect(formatSI(9, 'V', 'en')).toBe('9 V');
  });

  it('honours a custom number of significant figures', () => {
    expect(formatSI(0.0136, 'A', 'en', 2)).toBe('14 mA');
    expect(formatSI(1234.6, 'Ω', 'en', 4)).toBe('1.235 kΩ');
  });

  it('sits exactly on a prefix boundary', () => {
    expect(formatSI(1000, 'Ω', 'en')).toBe('1 kΩ');
    expect(formatSI(999, 'Ω', 'en')).toBe('999 Ω');
    expect(formatSI(999.4, 'Ω', 'en')).toBe('999 Ω');
    expect(formatSI(0.001, 'A', 'en')).toBe('1 mA');
    expect(formatSI(1e6, 'Ω', 'en')).toBe('1 MΩ');
  });

  it('rounds up into the next prefix instead of showing "1,000"', () => {
    expect(formatSI(999.95, 'Ω', 'en')).toBe('1 kΩ');
    expect(formatSI(999.5, 'Ω', 'en')).toBe('1 kΩ');
    expect(formatSI(999_950, 'Ω', 'en')).toBe('1 MΩ');
    expect(formatSI(0.00099995, 'A', 'en')).toBe('1 mA');
    expect(formatSI(0.99996, 'V', 'en')).toBe('1 V');
    expect(formatSI(-999.95, 'Ω', 'en')).toBe('-1 kΩ');
    expect(formatSI(999.95, 'Ω', 'es')).toBe('1 kΩ');
  });

  it('shows the sign of negative values', () => {
    expect(formatSI(-0.004, 'A', 'en')).toBe('-4 mA');
    expect(formatSI(-0.003, 'W', 'en')).toBe('-3 mW');
    expect(formatSI(-4.5, 'V', 'es')).toBe('-4,5 V');
  });

  it('shows zero without a prefix or a sign', () => {
    expect(formatSI(0, 'V', 'en')).toBe('0 V');
    expect(formatSI(-0, 'A', 'en')).toBe('0 A');
  });

  it('shows a dash for values that are not finite', () => {
    expect(formatSI(NaN, 'A', 'en')).toBe('— A');
    expect(formatSI(Infinity, 'Ω', 'en')).toBe('— Ω');
    expect(formatSI(-Infinity, 'W', 'es')).toBe('— W');
  });

  it('stays in pico for values below the smallest prefix', () => {
    expect(formatSI(1e-13, 'A', 'en')).toBe('0.1 pA');
    expect(formatSI(1e-15, 'A', 'en')).toBe('0.001 pA');
    // At most four decimals, so a vanishing value reads as zero, never "-0".
    expect(formatSI(1e-17, 'A', 'en')).toBe('0 pA');
    expect(formatSI(-1e-20, 'A', 'en')).toBe('0 pA');
  });

  it('stays in giga for values above the largest prefix', () => {
    expect(formatSI(1.5e12, 'Ω', 'en')).toBe('1,500 GΩ');
    expect(formatSI(999.95e9, 'Ω', 'en')).toBe('1,000 GΩ');
    // es-ES groups thousands only from five digits up.
    expect(formatSI(1.5e12, 'Ω', 'es')).toBe('1500 GΩ');
    expect(formatSI(1.5e13, 'Ω', 'es')).toBe('15.000 GΩ');
  });

  it('uses a decimal comma in Spanish', () => {
    expect(formatSI(4.5, 'V', 'es')).toBe('4,5 V');
    expect(formatSI(0.0191, 'A', 'es')).toBe('19,1 mA');
    expect(formatSI(2127.9, 'Ω', 'es')).toBe('2,13 kΩ');
    expect(formatSI(4700, 'Ω', 'es')).toBe('4,7 kΩ');
  });
});

describe('formatNumber', () => {
  it('rounds to the given decimals and drops trailing zeros', () => {
    expect(formatNumber(3.14159, 'en')).toBe('3.1');
    expect(formatNumber(3.14159, 'en', 3)).toBe('3.142');
    expect(formatNumber(5, 'en')).toBe('5');
    expect(formatNumber(2.5, 'en', 0)).toBe('3');
  });

  it('follows the locale', () => {
    expect(formatNumber(3.14159, 'es')).toBe('3,1');
    expect(formatNumber(1234.5, 'en')).toBe('1,234.5');
    expect(formatNumber(1234.5, 'es')).toBe('1234,5');
    expect(formatNumber(12345.5, 'es')).toBe('12.345,5');
  });

  it('keeps negatives, but never shows "-0"', () => {
    expect(formatNumber(-1.25, 'en', 1)).toBe('-1.3');
    expect(formatNumber(-0.0001, 'en')).toBe('0');
    expect(formatNumber(-0, 'es')).toBe('0');
  });

  it('shows a dash for values that are not finite', () => {
    expect(formatNumber(NaN, 'en')).toBe('—');
    expect(formatNumber(Infinity, 'es')).toBe('—');
  });
});

describe('formatPercent', () => {
  it('formats a fraction as a percentage', () => {
    expect(formatPercent(0.5, 'en')).toBe('50%');
    expect(formatPercent(-0.24228, 'en')).toBe('-24.2%');
    expect(formatPercent(-1 / 3, 'en')).toBe('-33.3%');
    expect(formatPercent(0.0909, 'en', 0)).toBe('9%');
    expect(formatPercent(0, 'en')).toBe('0%');
  });

  it('uses a decimal comma and a spaced sign in Spanish', () => {
    expect(formatPercent(0.5, 'es')).toBe(`50${NBSP}%`);
    expect(formatPercent(-0.24228, 'es')).toBe(`-24,2${NBSP}%`);
  });

  it('never shows "-0%" for a tiny negative error', () => {
    // A 100 Ω / 100 Ω divider under a 1 MΩ load is 0.005 % low.
    expect(formatPercent(-0.00005, 'en')).toBe('0%');
    expect(formatPercent(-0.00001, 'es')).toBe(`0${NBSP}%`);
    expect(formatPercent(0.00001, 'en')).toBe('0%');
  });

  it('shows a dash for values that are not finite', () => {
    expect(formatPercent(NaN, 'en')).toBe('—');
    expect(formatPercent(-Infinity, 'es')).toBe('—');
  });
});

describe('parseValue', () => {
  it('returns the fallback for missing or malformed input', () => {
    expect(parseValue(undefined, 9)).toBe(9);
    expect(parseValue('', 9)).toBe(9);
    expect(parseValue('abc', 9)).toBe(9);
    expect(parseValue('10kΩ', 9)).toBe(9);
    expect(parseValue('1.2.3', 9)).toBe(9);
    expect(parseValue('.', 9)).toBe(9);
    expect(parseValue('1e3', 9)).toBe(9);
    expect(parseValue('10x', 9)).toBe(9);
  });

  it('reads plain numbers, with spaces and signs', () => {
    expect(parseValue('9', 0)).toBe(9);
    expect(parseValue(' 4.5 ', 0)).toBe(4.5);
    expect(parseValue('-3', 0)).toBe(-3);
    expect(parseValue('0', 1)).toBe(0);
    expect(parseValue('.5', 0)).toBe(0.5);
  });

  it('applies every SI suffix', () => {
    expect(parseValue('47p', 0)).toBeCloseTo(47e-12, 24);
    expect(parseValue('100n', 0)).toBeCloseTo(1e-7, 20);
    expect(parseValue('10u', 0)).toBeCloseTo(1e-5, 18);
    expect(parseValue('10µ', 0)).toBeCloseTo(1e-5, 18);
    expect(parseValue('22m', 0)).toBeCloseTo(0.022, 15);
    expect(parseValue('10k', 0)).toBe(10000);
    expect(parseValue('4.7k', 0)).toBe(4700);
    expect(parseValue('1K', 0)).toBe(1000);
    expect(parseValue('2.2M', 0)).toBe(2.2e6);
    expect(parseValue('1G', 0)).toBe(1e9);
    expect(parseValue('10 k', 0)).toBe(10000);
  });
});

describe('snapToE24', () => {
  const E24 = [
    1.0, 1.1, 1.2, 1.3, 1.5, 1.6, 1.8, 2.0, 2.2, 2.4, 2.7, 3.0, 3.3, 3.6, 3.9, 4.3, 4.7, 5.1, 5.6,
    6.2, 6.8, 7.5, 8.2, 9.1,
  ];

  it('leaves every E24 value alone, in every decade the instruments use', () => {
    for (const decade of [1, 10, 100, 1e3, 1e4, 1e5]) {
      for (const mantissa of E24) {
        const value = Number((mantissa * decade).toPrecision(3));
        expect(snapToE24(value)).toBe(value);
      }
    }
    expect(snapToE24(1e6)).toBe(1e6);
  });

  it('snaps to the nearest value on a log scale', () => {
    expect(snapToE24(4800)).toBe(4700);
    expect(snapToE24(5000)).toBe(5100);
    expect(snapToE24(12345)).toBe(12000);
    expect(snapToE24(0.47)).toBe(0.47);
    expect(snapToE24(0.00034)).toBe(0.00033);
  });

  it('rounds up into the next decade above 9.1', () => {
    expect(snapToE24(9600)).toBe(10000);
    expect(snapToE24(9400)).toBe(9100);
  });

  it('passes through values it cannot snap', () => {
    expect(snapToE24(0)).toBe(0);
    expect(snapToE24(-5)).toBe(-5);
    expect(snapToE24(NaN)).toBeNaN();
    expect(snapToE24(Infinity)).toBe(Infinity);
  });
});

describe('logFromSlider / sliderFromLog', () => {
  it('maps the slider ends onto the range ends', () => {
    expect(logFromSlider(0, 1, 1e6)).toBeCloseTo(1, 12);
    expect(logFromSlider(1, 1, 1e6)).toBeCloseTo(1e6, 6);
    expect(sliderFromLog(10, 10, 1e6)).toBe(0);
    expect(sliderFromLog(1e6, 10, 1e6)).toBe(1);
  });

  it('puts the geometric middle at the halfway point', () => {
    expect(logFromSlider(0.5, 1, 1e6)).toBeCloseTo(1000, 9);
    expect(sliderFromLog(1000, 1, 1e6)).toBeCloseTo(0.5, 12);
    expect(logFromSlider(0.5, 0.00001, 2)).toBeCloseTo(Math.sqrt(0.00001 * 2), 12);
  });

  it('round-trips', () => {
    for (const position of [0, 0.1, 0.33, 0.5, 0.9, 1]) {
      expect(sliderFromLog(logFromSlider(position, 100, 1e6), 100, 1e6)).toBeCloseTo(position, 12);
    }
  });
});

describe('parallel', () => {
  it('combines two resistances', () => {
    expect(parallel(1000, 1000)).toBe(500);
    expect(parallel(1000, 4700)).toBeCloseTo(824.56, 2);
    expect(parallel(10000, 2700)).toBeCloseTo(2125.98, 2);
  });

  it('treats an infinite resistance as an open circuit', () => {
    expect(parallel(Infinity, 100)).toBe(100);
    expect(parallel(100, Infinity)).toBe(100);
    expect(parallel(Infinity, Infinity)).toBe(Infinity);
  });

  it('treats a zero resistance as a short', () => {
    expect(parallel(0, 100)).toBe(0);
    expect(parallel(0, 0)).toBe(0);
  });
});
