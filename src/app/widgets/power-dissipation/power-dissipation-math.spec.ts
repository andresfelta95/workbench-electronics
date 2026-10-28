import { formatPercent, formatSI } from '../../core/format';
import {
  derating,
  type DissipationInput,
  type DissipationResult,
  formatTemperature,
  heatFlow,
  parseRating,
  PARTS,
  ratingTone,
  solveDissipation,
  surfaceTone,
} from './power-dissipation-math';

/** The lesson's start state (00-06: rating="1/4" vin="5" r="100" ambient="25"). */
const START: DissipationInput = { vin: 5, r: 100, part: '1/4', ambient: 25 };

const si = (value: number, unit: string) => formatSI(value, unit, 'en');
const siEs = (value: number, unit: string) => formatSI(value, unit, 'es');
const pct = (value: number) => formatPercent(value, 'en');
const pctEs = (value: number) => formatPercent(value, 'es');
const deg = (value: number) => formatTemperature(value, 'en');
const degEs = (value: number) => formatTemperature(value, 'es');

describe('solveDissipation', () => {
  it('1: the start state is at its rating and too hot to touch', () => {
    const r = solveDissipation(START);
    expect(si(r.power, 'W')).toBe('250 mW');
    expect(siEs(r.power, 'W')).toBe('250 mW');
    expect(si(r.current, 'A')).toBe('50 mA');
    expect(deg(r.rise)).toBe('32 °C');
    expect(deg(r.surface)).toBe('57 °C');
    expect(degEs(r.surface)).toBe('57 °C');
    expect(pct(r.used)).toBe('100%');
    expect(pctEs(r.used)).toBe('100 %');
    expect(si(r.ratedNow, 'W')).toBe('250 mW');
    expect(formatTemperature(r.theta, 'en', '°C/W')).toBe('128 °C/W');
    expect(r.inData).toBe(true);
    expect(r.overRating).toBe(false);
    expect(ratingTone(r.used)).toBe('warn');
    expect(surfaceTone(r)).toBe('warn');
  });

  it('2: the 1 W part at the same power runs cooler', () => {
    const r = solveDissipation({ ...START, part: '1' });
    expect(r.rise).toBeCloseTo(21.25, 12);
    expect(deg(r.rise)).toBe('21 °C');
    expect(deg(r.surface)).toBe('46 °C');
    expect(pct(r.used)).toBe('25%');
    expect(pctEs(r.used)).toBe('25 %');
    expect(formatTemperature(r.theta, 'en', '°C/W')).toBe('85 °C/W');
    expect(ratingTone(r.used)).toBe('signal');
    expect(surfaceTone(r)).toBe('plain');
  });

  it('W-2b: 3.5 V on the 1/4 W part leaves headroom', () => {
    const r = solveDissipation({ ...START, vin: 3.5 });
    expect(si(r.power, 'W')).toBe('123 mW');
    expect(pct(r.used)).toBe('49%');
    expect(ratingTone(r.used)).toBe('signal');
    expect(deg(r.rise)).toBe('16 °C');
    expect(deg(r.surface)).toBe('41 °C');
    expect(surfaceTone(r)).toBe('plain');
  });

  it('3: the 1 W part at its own rating runs hotter', () => {
    const r = solveDissipation({ ...START, part: '1', vin: 10 });
    expect(si(r.power, 'W')).toBe('1 W');
    expect(si(r.current, 'A')).toBe('100 mA');
    expect(deg(r.rise)).toBe('85 °C');
    expect(deg(r.surface)).toBe('110 °C');
    expect(pct(r.used)).toBe('100%');
    expect(r.inData).toBe(true);
    expect(surfaceTone(r)).toBe('warn');
  });

  it('4: hot air shrinks the 1/4 W rating', () => {
    const r = solveDissipation({ ...START, ambient: 85 });
    expect(deg(r.rise)).toBe('32 °C');
    expect(deg(r.surface)).toBe('117 °C');
    expect(si(r.ratedNow, 'W')).toBe('206 mW');
    expect(pct(r.used)).toBe('121.4%');
    expect(pctEs(r.used)).toBe('121,4 %');
    expect(r.inData).toBe(true);
    expect(r.overRating).toBe(true);
    expect(ratingTone(r.used)).toBe('danger');
    expect(surfaceTone(r)).toBe('warn');
  });

  it('5: the 1 W part just inside its derated rating', () => {
    const r = solveDissipation({ vin: 9, r: 100, part: '1', ambient: 85 });
    expect(si(r.power, 'W')).toBe('810 mW');
    expect(deg(r.rise)).toBe('69 °C');
    expect(deg(r.surface)).toBe('154 °C');
    expect(degEs(r.surface)).toBe('154 °C');
    expect(si(r.ratedNow, 'W')).toBe('824 mW');
    expect(pct(r.used)).toBe('98.4%');
    expect(pctEs(r.used)).toBe('98,4 %');
    expect(ratingTone(r.used)).toBe('warn');
    expect(surfaceTone(r)).toBe('warn');
  });

  it('6: the 1 W line, at its derated rating the surface is 155 °C', () => {
    for (const ambient of [71, 85, 100, 120, 150]) {
      const ratedNow = PARTS['1'].rated * derating(ambient);
      const vin = Math.sqrt(ratedNow * 100);
      const r = solveDissipation({ vin, r: 100, part: '1', ambient });
      expect(r.surface).toBeCloseTo(155, 12);
    }
    const r = solveDissipation({ vin: 10, r: 100, part: '1', ambient: 70 });
    expect(deg(r.surface)).toBe('155 °C');
    expect(pct(r.used)).toBe('100%');
    expect(pctEs(r.used)).toBe('100 %');
    expect(surfaceTone(r)).toBe('warn');
  });

  it('7: in the data, a surface above 155 °C is danger', () => {
    const r = solveDissipation({ vin: 10, r: 100, part: '1', ambient: 85 });
    expect(r.inData).toBe(true);
    expect(r.surface).toBeCloseTo(170, 12);
    expect(deg(r.surface)).toBe('170 °C');
    expect(surfaceTone(r)).toBe('danger');
    expect(pct(r.used)).toBe('121.4%');
  });

  it('8: off the data past the 1/4 W rating; the 1 W part fixes it', () => {
    const r = solveDissipation({ vin: 12, r: 220, part: '1/4', ambient: 25 });
    expect(si(r.power, 'W')).toBe('655 mW');
    expect(si(r.current, 'A')).toBe('54.5 mA');
    expect(siEs(r.current, 'A')).toBe('54,5 mA');
    expect(pct(r.used)).toBe('261.8%');
    expect(pctEs(r.used)).toBe('261,8 %');
    expect(r.inData).toBe(false);
    expect(surfaceTone(r)).toBe('danger');
    expect(ratingTone(r.used)).toBe('danger');

    const big = solveDissipation({ vin: 12, r: 220, part: '1', ambient: 25 });
    expect(pct(big.used)).toBe('65.5%');
    expect(pctEs(big.used)).toBe('65,5 %');
    expect(deg(big.rise)).toBe('56 °C');
    expect(deg(big.surface)).toBe('81 °C');
    expect(surfaceTone(big)).toBe('warn');
    expect(ratingTone(big.used)).toBe('warn');
  });

  it('W-6: 22 V across 220 Ω is past both parts', () => {
    const r = solveDissipation({ vin: 22, r: 220, part: '1/4', ambient: 25 });
    expect(si(r.power, 'W')).toBe('2.2 W');
    expect(pct(r.used)).toBe('880%');
    expect(pctEs(r.used)).toBe('880 %');
    expect(pct(solveDissipation({ vin: 22, r: 220, part: '1', ambient: 25 }).used)).toBe('220%');
  });

  it('9: just past the rating is off the data', () => {
    const r = solveDissipation({ ...START, vin: 5.01 });
    expect(r.inData).toBe(false);
    expect(pct(r.used)).toBe('100.4%');
    expect(r.overRating).toBe(true);
  });

  it('11: at 150 °C the 1/4 W rating is 14.7 mW', () => {
    const r = solveDissipation({ ...START, ambient: 150 });
    expect(si(r.ratedNow, 'W')).toBe('14.7 mW');
    expect(siEs(r.ratedNow, 'W')).toBe('14,7 mW');
  });

  it('14: guards', () => {
    const off = solveDissipation({ ...START, vin: 0 });
    expect(off.current).toBe(0);
    expect(off.power).toBe(0);
    expect(off.rise).toBe(0);
    expect(off.used).toBe(0);
    expect(off.surface).toBe(25);
    expect(off.inData).toBe(true);

    const short = solveDissipation({ ...START, r: 0 });
    expect(short.power).toBe(Infinity);
    expect(short.used).toBe(Infinity);
    expect(short.inData).toBe(false);
    expect(si(short.power, 'W')).toBe('— W');
    expect(si(short.current, 'A')).toBe('— A');
    expect(pct(short.used)).toBe('—');

    const nothing = solveDissipation({ ...START, vin: 0, r: 0 });
    expect(nothing.current).toBe(0);
    expect(nothing.power).toBe(0);
    expect(nothing.used).toBe(0);

    const open = solveDissipation({ ...START, r: Infinity });
    expect(open.current).toBe(0);
    expect(open.power).toBe(0);

    const melted = solveDissipation({ ...START, vin: 0, ambient: 155 });
    expect(melted.ratedNow).toBe(0);
    expect(melted.used).toBe(0);
    expect(surfaceTone(melted)).toBe('danger');
    expect(solveDissipation({ ...START, ambient: 155 }).used).toBe(Infinity);

    const inputs: DissipationInput[] = [
      { ...START, vin: 0 },
      { ...START, r: 0 },
      { ...START, vin: 0, r: 0 },
      { ...START, r: Infinity },
      { ...START, vin: 0, ambient: 155 },
      { ...START, ambient: 155 },
      { ...START, ambient: 200 },
      { ...START, vin: NaN },
      { ...START, r: NaN },
      { ...START, ambient: NaN },
      { vin: NaN, r: NaN, part: '1', ambient: NaN },
      { ...START, vin: Infinity, r: Infinity },
      { ...START, vin: Infinity, r: 0 },
    ];
    for (const input of inputs) {
      const r = solveDissipation(input);
      for (const value of Object.values(r)) expect(Number.isNaN(value)).toBe(false);
    }
  });
});

describe('derating', () => {
  it('10: 100 % to 70 °C, half at 112.5 °C, 0 from 155 °C', () => {
    expect(derating(25)).toBe(1);
    expect(derating(70)).toBe(1);
    expect(derating(112.5)).toBeCloseTo(0.5, 12);
    expect(derating(155)).toBe(0);
    expect(derating(160)).toBe(0);
  });
});

describe('tones', () => {
  it('12: ratingTone boundaries', () => {
    expect(ratingTone(0.5)).toBe('signal');
    expect(ratingTone(0.5001)).toBe('warn');
    expect(ratingTone(1)).toBe('warn');
    expect(ratingTone(1.0001)).toBe('danger');
  });

  it('13: surfaceTone boundaries in the data', () => {
    const base: DissipationResult = solveDissipation(START);
    const at = (surface: number) => surfaceTone({ ...base, inData: true, surface });
    expect(at(50.9)).toBe('plain');
    expect(at(51)).toBe('warn');
    expect(at(155)).toBe('warn');
    expect(at(155.1)).toBe('danger');
  });
});

describe('parseRating', () => {
  it('15: anything but "1" is the 1/4 W part', () => {
    expect(parseRating(undefined)).toBe('1/4');
    expect(parseRating('')).toBe('1/4');
    expect(parseRating('0.25')).toBe('1/4');
    expect(parseRating('1/4')).toBe('1/4');
    expect(parseRating('1')).toBe('1');
  });
});

describe('heatFlow', () => {
  it('16: log over 10 µA to 1 A, stopped at zero', () => {
    expect(heatFlow(1)).toBe(1);
    expect(heatFlow(1e-3)).toBeCloseTo(0.4, 12);
    expect(heatFlow(1e-5)).toBeCloseTo(0.08, 12);
    expect(heatFlow(0)).toBe(0);
    expect(heatFlow(-1)).toBe(0);
    expect(heatFlow(NaN)).toBe(0);
  });
});

describe('formatTemperature', () => {
  it('17: whole degrees, never an SI prefix', () => {
    expect(formatTemperature(21.25, 'en')).toBe('21 °C');
    expect(formatTemperature(56.5, 'en')).toBe('57 °C');
    expect(formatTemperature(0.00128, 'en')).toBe('0 °C');
    expect(formatTemperature(153.85, 'es')).toBe('154 °C');
  });
});
