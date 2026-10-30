import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { SCHEMATIC, SchBattery, SchBatteryKind, SchBox, SchMeter, SchMeterKind } from './schematic';

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

/** Hosts one battery inside an SVG, with every input driven by a signal. */
@Component({
  imports: [SchBattery],
  template: `
    <svg>
      <svg:g
        schBattery
        [kind]="kind()"
        [name]="name()"
        [value]="value()"
        [plus]="plus()"
        [dim]="dim()"
        [highlight]="highlight()"
      />
    </svg>
  `,
})
class BatteryHost {
  readonly kind = signal<SchBatteryKind>('cell');
  readonly name = signal('Voc');
  readonly value = signal('1.6 V');
  readonly plus = signal(true);
  readonly dim = signal(false);
  readonly highlight = signal(false);
}

/** Hosts one dashed box inside an SVG. */
@Component({
  imports: [SchBox],
  template: `
    <svg>
      <svg:g schBox [w]="w()" [h]="h()" [name]="name()" [dim]="dim()" [highlight]="highlight()" />
    </svg>
  `,
})
class BoxHost {
  readonly w = signal(15);
  readonly h = signal(13);
  readonly name = signal('');
  readonly dim = signal(false);
  readonly highlight = signal(false);
}

interface EmphasisHost {
  readonly dim: { set(v: boolean): void };
  readonly highlight: { set(v: boolean): void };
}

async function renderHost<T>(
  type: new () => T,
  selector: string,
  setup: (host: T) => void = () => {},
) {
  const fixture = TestBed.createComponent(type);
  setup(fixture.componentInstance);
  fixture.detectChanges();
  await fixture.whenStable();
  const root = fixture.nativeElement as HTMLElement;
  const group = root.querySelector(`g[${selector}] > g`) as SVGGElement;
  return { fixture, group };
}

/** Steps a symbol through plain, dim and highlight, checking the group's class. */
async function expectEmphasis(
  fixture: { detectChanges(): void; whenStable(): Promise<unknown> },
  host: EmphasisHost,
  group: SVGGElement,
) {
  expect(group.getAttribute('class')).toBe('sch');
  host.dim.set(true);
  fixture.detectChanges();
  await fixture.whenStable();
  expect(group.getAttribute('class')).toBe('sch sch--dim');
  host.dim.set(false);
  host.highlight.set(true);
  fixture.detectChanges();
  await fixture.whenStable();
  expect(group.getAttribute('class')).toBe('sch sch--hot');
}

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

const rectOf = (r: Element): Rect => ({
  x: Number(r.getAttribute('x')),
  y: Number(r.getAttribute('y')),
  w: Number(r.getAttribute('width')),
  h: Number(r.getAttribute('height')),
});

const plusText = (g: SVGGElement) =>
  [...g.querySelectorAll('text')].filter((t) => t.textContent?.trim() === '+');

describe('schBattery', () => {
  beforeEach(() => TestBed.configureTestingModule({ imports: [BatteryHost] }));
  const render = (setup?: (h: BatteryHost) => void) => renderHost(BatteryHost, 'schBattery', setup);

  it('is exported in SCHEMATIC', () => {
    expect(SCHEMATIC).toContain(SchBattery);
  });

  for (const kind of ['cell', 'battery'] as const) {
    describe(kind, () => {
      it('takes the dim and highlight classes', async () => {
        const { fixture, group } = await render((h) => h.kind.set(kind));
        await expectEmphasis(fixture, fixture.componentInstance, group);
      });

      it('has pins at (0, 0) and (0, 40), whole units, mirror-symmetric about x = 0', async () => {
        const { group } = await render((h) => h.kind.set(kind));
        const parts = subpaths(group.querySelector('path')!.getAttribute('d')!);
        expect(parts[0][0]).toEqual([0, 0]);
        const last = parts[parts.length - 1];
        expect(last[last.length - 1]).toEqual([0, 40]);

        const key = ([x, y]: [number, number]) => `${x},${y}`;
        const segments = new Set<string>();
        for (const part of parts) {
          for (let i = 1; i < part.length; i++) {
            for (const [x, y] of [part[i - 1], part[i]]) {
              expect(Number.isInteger(x) && Number.isInteger(y)).toBe(true);
            }
            segments.add(`${key(part[i - 1])}>${key(part[i])}`);
          }
        }
        for (const s of segments) {
          const [[ax, ay], [bx, by]] = s.split('>').map((p) => p.split(',').map(Number));
          const mirrored = [`${-ax},${ay}>${-bx},${by}`, `${-bx},${by}>${-ax},${ay}`];
          expect(mirrored.some((m) => segments.has(m.replace(/-0\b/g, '0')))).toBe(true);
        }
        for (const r of group.querySelectorAll('rect')) {
          const box = rectOf(r);
          expect(box.x + box.w / 2).toBe(0);
          expect(Object.values(box).every(Number.isInteger)).toBe(true);
        }
      });

      it('puts a long thin plate on top, each above a 12 × 4 filled short plate', async () => {
        const { group } = await render((h) => h.kind.set(kind));
        const parts = subpaths(group.querySelector('path')!.getAttribute('d')!);
        const longPlates = parts
          .filter((p) => p.length === 2 && p[0][1] === p[1][1] && p[0][0] !== p[1][0])
          .map((p) => {
            expect([p[0][0], p[1][0]].sort((a, b) => a - b)).toEqual([-12, 12]);
            return p[0][1];
          })
          .sort((a, b) => a - b);
        const rects = [...group.querySelectorAll('rect.fill')].map(rectOf);
        const shortPlates = rects.filter((r) => r.w === 12 && r.h === 4).sort((a, b) => a.y - b.y);
        const pairs = kind === 'cell' ? 1 : 2;
        expect(longPlates).toHaveLength(pairs);
        expect(shortPlates).toHaveLength(pairs);
        expect(shortPlates.every((r) => r.x === -6)).toBe(true);
        // Long above short in each pair, and pairs do not interleave.
        for (let i = 0; i < pairs; i++) {
          expect(longPlates[i]).toBeLessThan(shortPlates[i].y);
          if (i + 1 < pairs) expect(shortPlates[i].y).toBeLessThan(longPlates[i + 1]);
        }
        if (kind === 'battery') {
          const dots = rects.filter(
            (r) =>
              r.w === 2 &&
              r.h === 2 &&
              r.x + r.w / 2 === 0 &&
              r.y >= shortPlates[0].y + shortPlates[0].h &&
              r.y + r.h <= longPlates[1],
          );
          expect(dots.length).toBeGreaterThanOrEqual(2);
        }
      });

      it('draws + beside the top pin by default, and not with plus = false', async () => {
        const [p] = plusText((await render((h) => h.kind.set(kind))).group);
        expect(p.getAttribute('class')).toBe('label');
        expect(Number(p.getAttribute('x'))).toBeLessThan(0);
        // The + sits at schSource's (−18, 8). That is a baseline: the glyph's
        // centre is about 4 units above it, so it reads level with or above
        // the first (long) plate in both kinds (16 for a cell, 6 for a battery).
        const firstPlate = kind === 'cell' ? 16 : 6;
        expect([p.getAttribute('x'), p.getAttribute('y')]).toEqual(['-18', '8']);
        expect(Number(p.getAttribute('y')) - 4).toBeLessThan(firstPlate);

        const off = await render((h) => {
          h.kind.set(kind);
          h.plus.set(false);
        });
        expect(plusText(off.group)).toHaveLength(0);
      });

      it('places name at (16, 17) and value at (16, 29), as schResistor and schMeter', async () => {
        const texts = [...(await render((h) => h.kind.set(kind))).group.querySelectorAll('text')];
        const name = texts.find((t) => t.textContent?.trim() === 'Voc')!;
        const value = texts.find((t) => t.textContent?.trim() === '1.6 V')!;
        const where = (t: Element) => [
          t.getAttribute('class'),
          t.getAttribute('x'),
          t.getAttribute('y'),
        ];
        expect(where(name)).toEqual(['label', '16', '17']);
        expect(where(value)).toEqual(['value', '16', '29']);
      });

      it('has one stroked path and no circle', async () => {
        const { group } = await render((h) => h.kind.set(kind));
        expect(group.querySelector('circle')).toBeNull();
        expect(group.querySelectorAll('path.stroke')).toHaveLength(1);
      });
    });
  }
});

describe('schBox', () => {
  beforeEach(() => TestBed.configureTestingModule({ imports: [BoxHost] }));
  const render = (setup?: (h: BoxHost) => void) => renderHost(BoxHost, 'schBox', setup);

  it('is exported in SCHEMATIC', () => {
    expect(SCHEMATIC).toContain(SchBox);
  });

  for (const [w, h] of [
    [15, 13],
    [19, 14],
  ]) {
    it(`draws one closed dashed outline for ${w} × ${h}`, async () => {
      const { group } = await render((host) => {
        host.w.set(w);
        host.h.set(h);
      });
      const paths = group.querySelectorAll('path.stroke');
      expect(paths).toHaveLength(1);
      const d = paths[0].getAttribute('d')!;
      expect(d.trim().endsWith('Z')).toBe(true);
      expect(subpaths(d)).toEqual([
        [
          [0, 0],
          [w * 10, 0],
          [w * 10, h * 10],
          [0, h * 10],
          [0, 0],
        ],
      ]);
      expect(paths[0].getAttribute('stroke-dasharray')).toBe('6 4');
      expect(paths[0].classList.contains('box')).toBe(true);
    });
  }

  it('writes the name above the top-left corner only when set', async () => {
    expect((await render()).group.querySelector('text')).toBeNull();
    const text = (await render((h) => h.name.set('AA'))).group.querySelector('text')!;
    expect([text.getAttribute('class'), text.getAttribute('x'), text.getAttribute('y')]).toEqual([
      'label',
      '4',
      '-4',
    ]);
    expect(text.textContent?.trim()).toBe('AA');
  });

  it('takes the dim and highlight classes', async () => {
    const { fixture, group } = await render();
    await expectEmphasis(fixture, fixture.componentInstance, group);
  });
});
