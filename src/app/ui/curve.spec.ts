import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { Curve, CurveMarker, CurveTick } from './curve';

/** Hosts one curve with every input driven by a signal. */
@Component({
  imports: [Curve],
  template: `
    <app-curve
      [w]="31"
      [h]="12"
      [xMin]="xMin()"
      [xMax]="xMax()"
      [xLog]="xLog()"
      [yMax]="yMax()"
      [points]="points()"
      [xTicks]="xTicks()"
      [yTicks]="yTicks()"
      xTitle="RL"
      yTitle="P"
      [markers]="markers()"
      [label]="label()"
    />
  `,
})
class CurveHost {
  readonly xMin = signal(0.01);
  readonly xMax = signal(1e4);
  readonly xLog = signal(true);
  readonly yMax = signal(1.15);
  readonly points = signal<readonly (readonly [number, number])[]>([]);
  readonly xTicks = signal<readonly CurveTick[]>([]);
  readonly yTicks = signal<readonly CurveTick[]>([]);
  readonly markers = signal<readonly CurveMarker[]>([]);
  readonly label = signal('Plot of load power against load resistance.');
}

async function render(setup: (host: CurveHost) => void = () => {}) {
  TestBed.configureTestingModule({ imports: [CurveHost] });
  const fixture = TestBed.createComponent(CurveHost);
  setup(fixture.componentInstance);
  fixture.detectChanges();
  await fixture.whenStable();
  const root = fixture.nativeElement as HTMLElement;
  const svg = root.querySelector('svg') as SVGSVGElement;
  const update = async (change: (host: CurveHost) => void) => {
    change(fixture.componentInstance);
    fixture.detectChanges();
    await fixture.whenStable();
  };
  return { fixture, svg, update, plot: plotArea(svg) };
}

/** The plot area, read back from the axis path `M{left} {top} V{bottom} H{right}`. */
function plotArea(svg: SVGSVGElement) {
  const d = svg.querySelector('path.axis')!.getAttribute('d')!;
  const [left, top, bottom, right] = /^M(\d+) (\d+) V(\d+) H(\d+)$/.exec(d)!.slice(1).map(Number);
  return { left, top, bottom, right };
}

/** Centre of each marker rect, in SVG units. */
function centres(svg: SVGSVGElement, selector: string): [number, number][] {
  return [...svg.querySelectorAll(selector)].map((r) => {
    const x = Number(r.getAttribute('x'));
    const y = Number(r.getAttribute('y'));
    return [x + Number(r.getAttribute('width')) / 2, y + Number(r.getAttribute('height')) / 2];
  });
}

/** Every vertex of an M/L polyline. */
function vertices(d: string): [number, number][] {
  return [...d.matchAll(/[ML](-?[\d.]+) (-?[\d.]+)/g)].map((m) => [Number(m[1]), Number(m[2])]);
}

describe('app-curve', () => {
  it('is one role="img" svg labelled by the label input, updating with it', async () => {
    const { fixture, svg, update } = await render();
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelectorAll('svg')).toHaveLength(1);
    expect(svg.getAttribute('role')).toBe('img');
    expect(svg.getAttribute('aria-label')).toBe('Plot of load power against load resistance.');
    expect(svg.getAttribute('viewBox')).toBe('0 0 310 120');
    expect(root.querySelector('[aria-live]')).toBeNull();

    await update((h) => h.label.set('No load is connected.'));
    expect(svg.getAttribute('aria-label')).toBe('No load is connected.');
  });

  it('log x: xMin at the left edge, xMax at the right, the geometric mean in the middle', async () => {
    const { svg, plot } = await render((h) =>
      h.markers.set([
        { x: 0.01, y: 0, shape: 'filled' },
        { x: 1e4, y: 0, shape: 'filled' },
        { x: 10, y: 0, shape: 'filled' },
      ]),
    );
    const [[lx], [rx], [mx]] = centres(svg, 'rect.fill');
    expect(lx).toBe(plot.left);
    expect(rx).toBe(plot.right);
    expect(Math.abs(mx - (plot.left + plot.right) / 2)).toBeLessThanOrEqual(1);
  });

  it('linear x: the arithmetic mean in the middle', async () => {
    const { svg, plot } = await render((h) => {
      h.xLog.set(false);
      h.xMin.set(0);
      h.xMax.set(100);
      h.markers.set([{ x: 50, y: 0, shape: 'filled' }]);
    });
    const [[mx]] = centres(svg, 'rect.fill');
    expect(Math.abs(mx - (plot.left + plot.right) / 2)).toBeLessThanOrEqual(1);
  });

  it('y = 0 sits on the x axis and yMax at the top of the plot', async () => {
    const { svg, plot } = await render((h) =>
      h.markers.set([
        { x: 1, y: 0, shape: 'filled' },
        { x: 1, y: 1.15, shape: 'filled' },
      ]),
    );
    const [[, y0], [, yTop]] = centres(svg, 'rect.fill');
    expect(y0).toBe(plot.bottom);
    expect(yTop).toBe(plot.top);
  });

  it('draws the curve with one whole-unit vertex per point, never NaN', async () => {
    const n = 121;
    const points: [number, number][] = Array.from({ length: n }, (_, i) => {
      const x = 0.01 * Math.pow(1e6, i / (n - 1));
      return [x, (4 * 0.25 * x) / (0.25 + x) ** 2];
    });
    const { svg, update } = await render((h) => h.points.set(points));
    const d = svg.querySelector('path.curve')!.getAttribute('d')!;
    expect(d).not.toContain('NaN');
    const vs = vertices(d);
    expect(vs).toHaveLength(n);
    expect(vs.flat().every(Number.isInteger)).toBe(true);
    expect(d.startsWith('M')).toBe(true);

    // Points that cannot be placed are skipped, not drawn as NaN.
    await update((h) =>
      h.points.set([
        [NaN, 1],
        [1, NaN],
        [-1, 1],
        [1, 0.5],
      ]),
    );
    const one = svg.querySelector('path.curve')!.getAttribute('d')!;
    expect(one).not.toContain('NaN');
    expect(vertices(one)).toHaveLength(1);

    await update((h) => h.points.set([]));
    const empty = svg.querySelector('path.curve');
    expect(empty === null || (empty.getAttribute('d') ?? '') === '').toBe(true);
  });

  it('draws filled markers hot, hollow ones stroked, the dashed guide and the label', async () => {
    const { svg, plot } = await render((h) =>
      h.markers.set([
        { x: 0.25, y: 1, shape: 'hollow', label: 'max 2.56 W' },
        { x: 10, y: 0.095, shape: 'filled', guide: true },
      ]),
    );
    const filled = svg.querySelectorAll('rect.fill');
    expect(filled).toHaveLength(1);
    expect(filled[0].classList.contains('hot')).toBe(true);
    expect([filled[0].getAttribute('width'), filled[0].getAttribute('height')]).toEqual(['6', '6']);

    const hollow = svg.querySelectorAll('rect.stroke');
    expect(hollow).toHaveLength(1);
    expect(hollow[0].classList.contains('fill')).toBe(false);
    expect([hollow[0].getAttribute('width'), hollow[0].getAttribute('height')]).toEqual(['8', '8']);

    const guides = svg.querySelectorAll('path.guide');
    expect(guides).toHaveLength(1);
    expect(guides[0].getAttribute('stroke-dasharray')).toBeTruthy();
    const [gx, gyTop] = /^M(\d+) (\d+)/.exec(guides[0].getAttribute('d')!)!.slice(1).map(Number);
    const [[fx, fy]] = centres(svg, 'rect.fill');
    expect(gx).toBe(fx);
    expect(gyTop).toBeGreaterThan(fy);
    expect(guides[0].getAttribute('d')!.endsWith(`V${plot.bottom}`)).toBe(true);

    const label = [...svg.querySelectorAll('text')].find(
      (t) => t.textContent?.trim() === 'max 2.56 W',
    )!;
    expect(label).toBeTruthy();
    const [[hx, hy]] = centres(svg, 'rect.stroke');
    expect(Number(label.getAttribute('y'))).toBeLessThan(hy - 4);
    expect(Math.abs(Number(label.getAttribute('x')) - hx)).toBeLessThanOrEqual(4);
  });

  it('keeps marker labels inside the plot at its edges', async () => {
    const { svg } = await render((h) =>
      h.markers.set([
        { x: 0.01, y: 1, shape: 'hollow', label: 'left' },
        { x: 1e4, y: 1, shape: 'hollow', label: 'right' },
      ]),
    );
    const anchor = (s: string) =>
      [...svg.querySelectorAll('text')]
        .find((t) => t.textContent?.trim() === s)!
        .getAttribute('text-anchor');
    expect(anchor('left')).toBe('start');
    expect(anchor('right')).toBe('end');
  });

  it('skips markers it cannot place', async () => {
    const { svg } = await render((h) =>
      h.markers.set([
        { x: 1e5, y: 1, shape: 'filled' },
        { x: NaN, y: 1, shape: 'hollow' },
        { x: 1, y: Infinity, shape: 'filled', guide: true },
      ]),
    );
    expect(svg.querySelectorAll('rect')).toHaveLength(0);
    expect(svg.querySelectorAll('path.guide')).toHaveLength(0);
  });

  it('renders tick labels at their mapped positions, with titles', async () => {
    const xTicks: CurveTick[] = [0.01, 0.1, 1, 10, 100, 1e3, 1e4].map((at, i) => ({
      at,
      label: i % 2 === 0 ? ['10 mΩ', '1 Ω', '100 Ω', '10 kΩ'][i / 2] : '',
    }));
    const { svg, plot } = await render((h) => {
      h.xTicks.set(xTicks);
      h.yTicks.set([{ at: 0, label: '0' }]);
    });
    const text = (s: string) =>
      [...svg.querySelectorAll('text')].find((t) => t.textContent?.trim() === s)!;
    const span = plot.right - plot.left;
    ['10 mΩ', '1 Ω', '100 Ω', '10 kΩ'].forEach((s, i) => {
      const t = text(s);
      expect(t.getAttribute('text-anchor')).toBe('middle');
      expect(
        Math.abs(Number(t.getAttribute('x')) - (plot.left + (span * i) / 3)),
      ).toBeLessThanOrEqual(1);
      expect(Number(t.getAttribute('y'))).toBeGreaterThan(plot.bottom);
    });
    // Seven tick marks below the axis, the labelled ones longer.
    const marks = [...svg.querySelectorAll('path.axis')]
      .map((p) => p.getAttribute('d')!)
      .filter((d) => new RegExp(`^M\\d+ ${plot.bottom} v`).test(d));
    expect(marks).toHaveLength(7);
    const len = (d: string) => Number(d.split('v')[1]);
    expect(len(marks[0])).toBeGreaterThan(len(marks[1]));

    const zero = text('0');
    expect(Number(zero.getAttribute('x'))).toBeLessThan(plot.left);
    expect(zero.getAttribute('text-anchor')).toBe('end');
    expect(Number(zero.getAttribute('y'))).toBeGreaterThan(plot.bottom);
    expect(Number(zero.getAttribute('y'))).toBeLessThan(plot.bottom + 10);

    expect(Number(text('RL').getAttribute('x'))).toBeGreaterThan(plot.right);
    expect(Number(text('P').getAttribute('y'))).toBeLessThan(plot.top + 12);
  });

  it('draws no circles and only whole-unit rect and text coordinates', async () => {
    const { svg } = await render((h) => {
      h.markers.set([
        { x: 0.3, y: 0.7, shape: 'hollow', label: 'a' },
        { x: 7.7, y: 0.33, shape: 'filled', guide: true },
      ]);
      h.xTicks.set([{ at: 3.3, label: 'b' }]);
    });
    expect(svg.querySelector('circle')).toBeNull();
    for (const el of svg.querySelectorAll('rect, text')) {
      for (const attr of ['x', 'y']) {
        expect(Number.isInteger(Number(el.getAttribute(attr)))).toBe(true);
      }
    }
  });
});
