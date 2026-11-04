import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import type { CurveTick } from './curve';
import { Histogram, HistogramBand } from './histogram';

/** The tolerance-spread brief's W-1 bins (batch 1, 5 %, bell): 66, max 64. */
const W1 = [
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 3, 2, 3, 2, 3, 10, 7, 10, 17, 18, 17, 25, 22, 32, 30, 43, 63,
  55, 37, 52, 64, 53, 50, 49, 46, 46, 46, 49, 25, 23, 22, 17, 13, 10, 9, 11, 8, 2, 1, 0, 2, 0, 0, 1,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
];

/** Hosts one histogram with every input driven by a signal. */
@Component({
  imports: [Histogram],
  template: `
    <app-histogram
      [w]="31"
      [h]="11"
      [xMin]="xMin()"
      [xMax]="xMax()"
      [counts]="counts()"
      [yMax]="yMax()"
      [xTicks]="xTicks()"
      xTitle="Vout"
      [band]="band()"
      [label]="label()"
    />
  `,
})
class HistogramHost {
  readonly xMin = signal(4.2525);
  readonly xMax = signal(4.7475);
  readonly counts = signal<readonly number[]>(W1);
  readonly yMax = signal(64 * 1.15);
  readonly xTicks = signal<readonly CurveTick[]>([]);
  readonly band = signal<HistogramBand | undefined>(undefined);
  readonly label = signal('Histogram of 1000 simulated dividers built from 5% parts.');
}

async function render(setup: (host: HistogramHost) => void = () => {}) {
  TestBed.configureTestingModule({ imports: [HistogramHost] });
  const fixture = TestBed.createComponent(HistogramHost);
  setup(fixture.componentInstance);
  fixture.detectChanges();
  await fixture.whenStable();
  const root = fixture.nativeElement as HTMLElement;
  const svg = root.querySelector('svg') as SVGSVGElement;
  const update = async (change: (host: HistogramHost) => void) => {
    change(fixture.componentInstance);
    fixture.detectChanges();
    await fixture.whenStable();
  };
  return { fixture, svg, update };
}

/** The x axis, read back from its path `M{left} {bottom} H{right}`. */
function axis(svg: SVGSVGElement) {
  const d = svg.querySelector('path.axis')!.getAttribute('d')!;
  const [left, bottom, right] = /^M(\d+) (\d+) H(\d+)$/.exec(d)!.slice(1).map(Number);
  return { left, bottom, right };
}

function rects(svg: SVGSVGElement) {
  return [...svg.querySelectorAll('rect')].map((r) => ({
    x: Number(r.getAttribute('x')),
    y: Number(r.getAttribute('y')),
    width: Number(r.getAttribute('width')),
    height: Number(r.getAttribute('height')),
  }));
}

const text = (svg: SVGSVGElement, s: string) =>
  [...svg.querySelectorAll('text')].find((t) => t.textContent?.trim() === s);

/** Every attribute value in the drawing, for the NaN check. */
const attributes = (svg: SVGSVGElement) =>
  [svg, ...svg.querySelectorAll('*')].flatMap((el) => [...el.attributes].map((a) => a.value));

describe('app-histogram', () => {
  it('is one role="img" svg labelled by the label input, updating with it', async () => {
    const { fixture, svg, update } = await render();
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelectorAll('svg')).toHaveLength(1);
    expect(svg.getAttribute('role')).toBe('img');
    expect(svg.getAttribute('aria-label')).toBe(
      'Histogram of 1000 simulated dividers built from 5% parts.',
    );
    expect(svg.getAttribute('aria-hidden')).toBeNull();
    expect(svg.getAttribute('viewBox')).toBe('0 0 310 110');
    expect(root.querySelector('[aria-live]')).toBeNull();

    await update((h) => h.label.set('Histogram of 1000 simulated dividers built from 1% parts.'));
    expect(svg.getAttribute('aria-label')).toBe(
      'Histogram of 1000 simulated dividers built from 1% parts.',
    );

    await update((h) => h.label.set(''));
    expect(svg.getAttribute('aria-hidden')).toBe('true');
    expect(svg.getAttribute('role')).not.toBe('img');
    expect(svg.getAttribute('aria-label')).toBeNull();
  });

  it('draws one adjacent 4-unit bar per non-empty bin, from x 16 to 280, whole units', async () => {
    const { svg } = await render((h) =>
      h.counts.set(W1.map((c, i) => (i === 0 || i === 65 ? 1 : c))),
    );
    expect(axis(svg)).toEqual({ left: 16, bottom: 86, right: 280 });
    const bars = rects(svg);
    const nonEmpty = W1.filter((c, i) => c > 0 || i === 0 || i === 65).length;
    expect(bars).toHaveLength(nonEmpty);
    expect(bars.length).toBeLessThanOrEqual(66);
    expect(bars.every((b) => b.width === 4)).toBe(true);
    expect(bars[0].x).toBe(16);
    expect(bars.at(-1)!.x + bars.at(-1)!.width).toBe(280);
    expect(bars.every((b) => (b.x - 16) % 4 === 0)).toBe(true);
    expect(bars.every((b) => b.y + b.height === 86)).toBe(true);
    for (const b of bars) {
      expect(Object.values(b).every(Number.isInteger)).toBe(true);
    }
    expect(svg.querySelector('circle')).toBeNull();
  });

  it('draws only non-empty bins of the W-1 data, zero bins none', async () => {
    const { svg } = await render();
    expect(rects(svg)).toHaveLength(W1.filter((c) => c > 0).length);
    // Bins 0-9 are empty, so the first bar is bin 10's.
    expect(rects(svg)[0].x).toBe(16 + 10 * 4);
  });

  it('a count equal to yMax reaches the plot top; 0 draws nothing; yMax 0 or NaN no bars', async () => {
    const { svg, update } = await render((h) => {
      h.counts.set([0, 10, 5, 20]);
      h.yMax.set(10);
    });
    const bars = rects(svg);
    // Bin 0 (count 0) draws nothing; bin 3 (above yMax) is clamped to the top.
    expect(bars).toHaveLength(3);
    expect(bars[0]).toEqual({ x: 82, y: 14, width: 66, height: 72 });
    expect(bars[1]).toEqual({ x: 148, y: 50, width: 66, height: 36 });
    expect(bars[2].y).toBe(14);

    for (const yMax of [0, NaN, -1, Infinity]) {
      await update((h) => h.yMax.set(yMax));
      expect(rects(svg)).toHaveLength(0);
      expect(attributes(svg).some((v) => v.includes('NaN'))).toBe(false);
    }

    await update((h) => {
      h.yMax.set(10);
      h.counts.set([NaN, -3, Infinity, 2]);
    });
    expect(rects(svg)).toHaveLength(1);
    expect(attributes(svg).some((v) => v.includes('NaN'))).toBe(false);
  });

  it('keeps a lone build visible: any positive count is at least 1 unit, above the axis', async () => {
    // The 1 % case: tallest bin 271, yMax 1.15 × 271; one build would round to 0.
    const { svg } = await render((h) => {
      h.counts.set([1, 271]);
      h.yMax.set(271 * 1.15);
    });
    const [lone] = rects(svg);
    expect(lone).toEqual({ x: 16, y: 85, width: 132, height: 1 });
    // The axis is drawn before the bars, so its stroke cannot cover them.
    const order = [...svg.children].map((el) => el.tagName.toLowerCase());
    expect(order.indexOf('path')).toBeLessThan(order.indexOf('rect'));
    expect(svg.children[0].classList.contains('axis')).toBe(true);
  });

  it('draws the band as two dashed full-height rules with a centred label, clamped', async () => {
    const { svg, update } = await render((h) =>
      h.band.set({ lo: 4.275, hi: 4.725, label: 'worst case' }),
    );
    const rules = () =>
      [...svg.querySelectorAll('path.guide')].map((p) => {
        expect(p.getAttribute('stroke-dasharray')).toBe('4 4');
        const [x, top, bottom] = /^M(\d+) (\d+) V(\d+)$/
          .exec(p.getAttribute('d')!)!
          .slice(1)
          .map(Number);
        return { x, top, bottom };
      });
    const map = (v: number) => 16 + ((v - 4.2525) / (4.7475 - 4.2525)) * 264;

    const [lo, hi] = rules();
    expect(rules()).toHaveLength(2);
    expect(Math.abs(lo.x - map(4.275))).toBeLessThanOrEqual(1);
    expect(Math.abs(hi.x - map(4.725))).toBeLessThanOrEqual(1);
    for (const r of [lo, hi]) expect([r.top, r.bottom]).toEqual([14, 86]);

    const label = text(svg, 'worst case')!;
    expect(label).toBeTruthy();
    expect(label.getAttribute('text-anchor')).toBe('middle');
    expect(Math.abs(Number(label.getAttribute('x')) - (lo.x + hi.x) / 2)).toBeLessThanOrEqual(1);
    expect(Number(label.getAttribute('y'))).toBeLessThan(14);
    expect(Number(label.getAttribute('y'))).toBeGreaterThan(0);

    // Ends outside the range are clamped to its edges; a reversed band is the same band.
    await update((h) => h.band.set({ lo: 5, hi: 4, label: 'worst case' }));
    expect(rules().map((r) => r.x)).toEqual([16, 280]);
    expect(Number(text(svg, 'worst case')!.getAttribute('x'))).toBe(148);

    // A band that cannot be placed draws nothing.
    await update((h) => h.band.set({ lo: NaN, hi: 4.5, label: 'worst case' }));
    expect(rules()).toHaveLength(0);
    expect(text(svg, 'worst case')).toBeUndefined();

    await update((h) => h.band.set(undefined));
    expect(rules()).toHaveLength(0);
  });

  it('renders tick labels at their mapped positions, with the title after the axis', async () => {
    const xTicks: CurveTick[] = [
      { at: 4.2525, label: '4.253 V' },
      { at: 4.455, label: '' },
      { at: 4.5, label: '4.5 V' },
      { at: 4.545, label: '' },
      { at: 4.7475, label: '4.748 V' },
      { at: 5, label: 'off the axis' },
    ];
    const { svg } = await render((h) => h.xTicks.set(xTicks));
    const at = { '4.253 V': 16, '4.5 V': 148, '4.748 V': 280 };
    for (const [s, x] of Object.entries(at)) {
      const t = text(svg, s)!;
      expect(t).toBeTruthy();
      expect(t.getAttribute('text-anchor')).toBe('middle');
      expect(Math.abs(Number(t.getAttribute('x')) - x)).toBeLessThanOrEqual(1);
      expect(Number(t.getAttribute('y'))).toBeGreaterThan(86);
    }
    expect(text(svg, 'off the axis')).toBeUndefined();

    // Five tick marks below the axis, the labelled ones longer.
    const marks = [...svg.querySelectorAll('path.axis')]
      .map((p) => p.getAttribute('d')!)
      .filter((d) => /^M\d+ 86 v/.test(d));
    expect(marks).toHaveLength(5);
    const len = (d: string) => Number(d.split('v')[1]);
    expect(len(marks[0])).toBeGreaterThan(len(marks[1]));

    const title = text(svg, 'Vout')!;
    expect(Number(title.getAttribute('x'))).toBeGreaterThan(280);
    expect(Math.abs(Number(title.getAttribute('y')) - 86)).toBeLessThan(10);

    for (const el of svg.querySelectorAll('rect, text')) {
      for (const attr of ['x', 'y']) {
        expect(Number.isInteger(Number(el.getAttribute(attr)))).toBe(true);
      }
    }
  });

  it('empty counts: the axis only, no rects, no error', async () => {
    const { svg, update } = await render((h) => h.counts.set([]));
    expect(svg.querySelectorAll('path.axis')).toHaveLength(1);
    expect(rects(svg)).toHaveLength(0);

    // The nominal-0 edge case: a degenerate range and yMax 0.
    await update((h) => {
      h.xMin.set(0);
      h.xMax.set(0);
      h.yMax.set(0);
      h.counts.set(new Array(66).fill(0));
      h.xTicks.set([{ at: 0, label: '0 V' }]);
      h.band.set({ lo: 0, hi: 0, label: 'worst case' });
    });
    expect(rects(svg)).toHaveLength(0);
    expect(svg.querySelectorAll('path.guide')).toHaveLength(0);
    expect(attributes(svg).some((v) => v.includes('NaN'))).toBe(false);
  });
});
