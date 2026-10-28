import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { SCHEMATIC, SchMeter, SchMeterKind } from './schematic';

/** Hosts one meter inside an SVG, with every input driven by a signal. */
@Component({
  imports: [SchMeter],
  template: `
    <svg>
      <svg:g
        schMeter
        [kind]="kind()"
        [vertical]="vertical()"
        [name]="name()"
        [value]="value()"
        [plus]="plus()"
        [dim]="dim()"
        [highlight]="highlight()"
      />
    </svg>
  `,
})
class MeterHost {
  readonly kind = signal<SchMeterKind>('V');
  readonly vertical = signal(true);
  readonly name = signal('Rin');
  readonly value = signal('10 MΩ');
  readonly plus = signal(false);
  readonly dim = signal(false);
  readonly highlight = signal(false);
}

async function render(setup: (host: MeterHost) => void = () => {}) {
  const fixture = TestBed.createComponent(MeterHost);
  setup(fixture.componentInstance);
  fixture.detectChanges();
  await fixture.whenStable();
  const root = fixture.nativeElement as HTMLElement;
  const group = root.querySelector('g[schMeter] > g') as SVGGElement;
  return { fixture, root, group };
}

/** Every vertex an absolute/relative M, H, V, v path visits, split into subpaths. */
function subpaths(d: string): [number, number][][] {
  const out: [number, number][][] = [];
  let x = 0;
  let y = 0;
  for (const [, cmd, args] of d.matchAll(/([MHVhvZz])\s*([-\d\s]*)/g)) {
    const n = args.trim().split(/\s+/).filter(Boolean).map(Number);
    switch (cmd) {
      case 'M':
        [x, y] = n;
        out.push([[x, y]]);
        continue;
      case 'H':
        x = n[0];
        break;
      case 'V':
        y = n[0];
        break;
      case 'h':
        x += n[0];
        break;
      case 'v':
        y += n[0];
        break;
      default: {
        const first = out[out.length - 1][0];
        [x, y] = first;
        break;
      }
    }
    out[out.length - 1].push([x, y]);
  }
  return out;
}

describe('schMeter', () => {
  beforeEach(() => TestBed.configureTestingModule({ imports: [MeterHost] }));

  it('is exported in SCHEMATIC', () => {
    expect(SCHEMATIC).toContain(SchMeter);
  });

  for (const vertical of [true, false]) {
    for (const kind of ['V', 'A', 'Ω'] as const) {
      const orientation = vertical ? 'vertical' : 'horizontal';

      it(`draws ${kind} ${orientation} with dim and highlight classes`, async () => {
        const { fixture, group } = await render((h) => {
          h.kind.set(kind);
          h.vertical.set(vertical);
        });
        expect(group.getAttribute('class')).toBe('sch');

        const letter = group.querySelector('text.label[text-anchor="middle"]');
        expect(letter?.textContent?.trim()).toBe(kind);
        // Baseline below the body's centre: 4 centres VT323 capitals, the taller Ω takes 6.
        const centre = vertical ? 20 : 0;
        const baseline = kind === 'Ω' ? 6 : 4;
        expect(Number(letter?.getAttribute('y'))).toBe(centre + baseline);

        fixture.componentInstance.dim.set(true);
        fixture.detectChanges();
        await fixture.whenStable();
        expect(group.getAttribute('class')).toBe('sch sch--dim');

        fixture.componentInstance.dim.set(false);
        fixture.componentInstance.highlight.set(true);
        fixture.detectChanges();
        await fixture.whenStable();
        expect(group.getAttribute('class')).toBe('sch sch--hot');
      });
    }
  }

  it('draws the body as a stroked path, never a circle', async () => {
    for (const vertical of [true, false]) {
      const { group } = await render((h) => h.vertical.set(vertical));
      expect(group.querySelector('circle')).toBeNull();
      expect(group.querySelectorAll('path.stroke')).toHaveLength(1);
    }
  });

  it('vertical: pins at (0, 0) and (0, 40), a closed symmetric 24 × 24 body centred on (0, 20)', async () => {
    const { group } = await render();
    const [lead1, lead2, body] = subpaths(group.querySelector('path')!.getAttribute('d')!);
    expect(lead1).toEqual([
      [0, 0],
      [0, 8],
    ]);
    expect(lead2).toEqual([
      [0, 32],
      [0, 40],
    ]);
    expectRoundBody(body, 0, 20);
  });

  it('horizontal: pins at (0, 0) and (50, 0), a closed symmetric body from x = 13 to 37', async () => {
    const { group } = await render((h) => h.vertical.set(false));
    const [lead1, lead2, body] = subpaths(group.querySelector('path')!.getAttribute('d')!);
    expect(lead1).toEqual([
      [0, 0],
      [13, 0],
    ]);
    expect(lead2).toEqual([
      [37, 0],
      [50, 0],
    ]);
    expectRoundBody(body, 25, 0);
  });

  it('places name and value beside the body as schResistor does', async () => {
    const v = (await render()).group;
    const [vName, vValue] = [...v.querySelectorAll('text')].slice(-2);
    expect([vName.getAttribute('x'), vName.getAttribute('y'), vName.textContent?.trim()]).toEqual([
      '16',
      '17',
      'Rin',
    ]);
    expect(vValue.getAttribute('class')).toBe('value');
    expect([vValue.getAttribute('x'), vValue.getAttribute('y')]).toEqual(['16', '29']);

    const h = (await render((m) => m.vertical.set(false))).group;
    const [hName, hValue] = [...h.querySelectorAll('text')].slice(-2);
    expect([hName.getAttribute('x'), hName.getAttribute('y')]).toEqual(['25', '-16']);
    expect([
      hValue.getAttribute('x'),
      hValue.getAttribute('y'),
      hValue.textContent?.trim(),
    ]).toEqual(['25', '28', '10 MΩ']);
  });

  it('draws + beside the first pin only when asked', async () => {
    const plusText = (g: SVGGElement) =>
      [...g.querySelectorAll('text')].filter((t) => t.textContent?.trim() === '+');

    expect(plusText((await render()).group)).toHaveLength(0);

    const [v] = plusText((await render((h) => h.plus.set(true))).group);
    expect(v.getAttribute('class')).toBe('label');
    expect(Number(v.getAttribute('x'))).toBeLessThan(0);
    expect(Number(v.getAttribute('y'))).toBeLessThan(8);

    const [h] = plusText(
      (
        await render((m) => {
          m.plus.set(true);
          m.vertical.set(false);
        })
      ).group,
    );
    expect(Number(h.getAttribute('x'))).toBeLessThan(13);
    expect(Number(h.getAttribute('y'))).toBeLessThan(0);
  });
});

/** Closed, whole-unit, axis-aligned, mirror-symmetric on both axes, and exactly 24 × 24 around (cx, cy). */
function expectRoundBody(body: [number, number][], cx: number, cy: number) {
  expect(body[body.length - 1]).toEqual(body[0]);
  for (let i = 1; i < body.length; i++) {
    const [[x0, y0], [x1, y1]] = [body[i - 1], body[i]];
    expect(x0 === x1 || y0 === y1).toBe(true);
    expect(Number.isInteger(x1) && Number.isInteger(y1)).toBe(true);
  }
  const xs = body.map(([x]) => x - cx);
  const ys = body.map(([, y]) => y - cy);
  expect([Math.min(...xs), Math.max(...xs)]).toEqual([-12, 12]);
  expect([Math.min(...ys), Math.max(...ys)]).toEqual([-12, 12]);
  const key = ([x, y]: [number, number]) => `${x},${y}`;
  const points = new Set(body.map(([x, y]) => key([x - cx, y - cy])));
  for (const p of points) {
    const [x, y] = p.split(',').map(Number);
    expect(points.has(key([-x, y]))).toBe(true);
    expect(points.has(key([x, -y]))).toBe(true);
  }
}
