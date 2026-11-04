import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import {
  SCHEMATIC,
  SchBattery,
  SchBatteryKind,
  SchBox,
  SchInductor,
  SchInductorKind,
  SchMeter,
  SchMeterKind,
  SchPot,
  SchPotKind,
  SchResistor,
} from './schematic';

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

/** Every vertex an absolute/relative M, L, H, V, h, v path visits, split into subpaths. */
function subpaths(d: string): [number, number][][] {
  const out: [number, number][][] = [];
  let x = 0;
  let y = 0;
  for (const [, cmd, args] of d.matchAll(/([MLHVhvZz])\s*([-\d\s]*)/g)) {
    const n = args.trim().split(/\s+/).filter(Boolean).map(Number);
    switch (cmd) {
      case 'M':
        [x, y] = n;
        out.push([[x, y]]);
        continue;
      case 'L':
        [x, y] = n;
        break;
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

/** Hosts one inductor inside an SVG, with every input driven by a signal. */
@Component({
  imports: [SchInductor],
  template: `
    <svg>
      <svg:g
        schInductor
        [kind]="kind()"
        [vertical]="vertical()"
        [name]="name()"
        [value]="value()"
        [dim]="dim()"
        [highlight]="highlight()"
      />
    </svg>
  `,
})
class InductorHost {
  readonly kind = signal<SchInductorKind>('air');
  readonly vertical = signal(false);
  readonly name = signal('L1');
  readonly value = signal('10 µH');
  readonly dim = signal(false);
  readonly highlight = signal(false);
}

/** Hosts one inductor with every input left at its default. */
@Component({
  imports: [SchInductor],
  template: `<svg><svg:g schInductor /></svg>`,
})
class BareInductorHost {}

/** Hosts one potentiometer or variable resistor inside an SVG. */
@Component({
  imports: [SchPot],
  template: `
    <svg>
      <svg:g
        schPot
        [kind]="kind()"
        [name]="name()"
        [value]="value()"
        [dim]="dim()"
        [highlight]="highlight()"
      />
    </svg>
  `,
})
class PotHost {
  readonly kind = signal<SchPotKind>('pot');
  readonly name = signal('RV1');
  readonly value = signal('10 kΩ');
  readonly dim = signal(false);
  readonly highlight = signal(false);
}

/** Hosts one pot with every input left at its default. */
@Component({
  imports: [SchPot],
  template: `<svg><svg:g schPot /></svg>`,
})
class BarePotHost {}

/** Hosts the vertical resistor, so schPot's body can be compared with it. */
@Component({
  imports: [SchResistor],
  template: `<svg><svg:g schResistor [vertical]="true" /></svg>`,
})
class ResistorHost {}

type Point = [number, number];

/** Each consecutive pair of vertices in every subpath, as one segment. */
const segmentsOf = (parts: Point[][]): [Point, Point][] =>
  parts.flatMap((p) => p.slice(1).map((b, i): [Point, Point] => [p[i], b]));

const allWhole = (parts: Point[][]) => parts.flat(2).every((n) => Number.isInteger(n));

const textAt = (t: Element) => [
  t.getAttribute('class'),
  t.getAttribute('x'),
  t.getAttribute('y'),
  t.getAttribute('text-anchor'),
];

const textWith = (g: SVGGElement, s: string) =>
  [...g.querySelectorAll('text')].find((t) => t.textContent?.trim() === s)!;

describe('schInductor', () => {
  beforeEach(() => TestBed.configureTestingModule({ imports: [InductorHost, BareInductorHost] }));
  const render = (setup?: (h: InductorHost) => void) =>
    renderHost(InductorHost, 'schInductor', setup);
  const coilOf = (g: SVGGElement) => subpaths(g.querySelector('path.coil')!.getAttribute('d')!);
  const leadsOf = (g: SVGGElement) => subpaths(g.querySelector('path.lead')!.getAttribute('d')!);

  it('is exported in SCHEMATIC', () => {
    expect(SCHEMATIC).toContain(SchInductor);
  });

  for (const vertical of [false, true]) {
    for (const kind of ['air', 'cored'] as const) {
      const orientation = vertical ? 'vertical' : 'horizontal';
      const setup = (h: InductorHost) => {
        h.kind.set(kind);
        h.vertical.set(vertical);
      };

      describe(`${kind} ${orientation}`, () => {
        it('takes the dim and highlight classes', async () => {
          const { fixture, group } = await render(setup);
          await expectEmphasis(fixture, fixture.componentInstance, group);
        });

        it('has the resistor footprint: leads from the pins meet the coil, whole units, axis-aligned', async () => {
          const { group } = await render(setup);
          const leads = leadsOf(group);
          expect(leads).toEqual(
            vertical
              ? [
                  [
                    [0, 0],
                    [0, 4],
                  ],
                  [
                    [0, 36],
                    [0, 40],
                  ],
                ]
              : [
                  [
                    [0, 0],
                    [9, 0],
                  ],
                  [
                    [41, 0],
                    [50, 0],
                  ],
                ],
          );
          const parts = coilOf(group);
          expect(parts).toHaveLength(1);
          const coil = parts[0];
          // The coil runs unbroken from the end of one lead to the start of the other.
          expect(coil[0]).toEqual(leads[0][1]);
          expect(coil[coil.length - 1]).toEqual(leads[1][0]);
          expect(allWhole(parts)).toBe(true);
          for (const [[x0, y0], [x1, y1]] of segmentsOf(parts)) {
            expect(x0 === x1 || y0 === y1).toBe(true);
          }
        });

        it('draws leads, coil and core inside one g.art layer, text outside it', async () => {
          const { group } = await render(setup);
          const art = group.querySelector(':scope > g.art')!;
          expect(art).not.toBeNull();
          const classes = [...art.querySelectorAll('path')].map((p) => p.getAttribute('class'));
          expect(classes).toEqual(
            kind === 'cored'
              ? ['stroke lead', 'stroke coil', 'stroke core']
              : ['stroke lead', 'stroke coil'],
          );
          expect(group.querySelectorAll('path')).toHaveLength(classes.length);
          expect(art.querySelector('text')).toBeNull();
          expect(group.querySelectorAll(':scope > text')).toHaveLength(2);
        });

        it('draws four humps 6 units off the axis, each crowned by a 4-unit run', async () => {
          const parts = coilOf((await render(setup)).group);
          // Distance off the axis (up, or to the right), and position along it.
          const off = ([x, y]: Point) => (vertical ? x : 0 - y); // 0 - y, not -y: no −0 on the axis
          const along = ([x, y]: Point) => (vertical ? y : x);
          const offs = parts[0].map(off);
          expect(Math.min(...offs)).toBe(0);
          expect(Math.max(...offs)).toBe(6);
          const crowns = segmentsOf(parts).filter(([a, b]) => off(a) === 6 && off(b) === 6);
          expect(crowns).toHaveLength(4);
          for (const [a, b] of crowns) expect(Math.abs(along(b) - along(a))).toBe(4);
        });

        it(
          kind === 'cored' ? 'adds two 32-unit core lines alongside' : 'has no core lines',
          async () => {
            const { group } = await render(setup);
            expect(group.querySelectorAll('path.stroke')).toHaveLength(kind === 'cored' ? 3 : 2);
            const core = group.querySelectorAll('path.stroke.core');
            if (kind === 'air') {
              expect(core).toHaveLength(0);
              return;
            }
            expect(core).toHaveLength(1);
            const lines = subpaths(core[0].getAttribute('d')!);
            expect(lines).toHaveLength(2);
            expect(allWhole(lines)).toBe(true);
            for (const [[x0, y0], [x1, y1]] of lines) {
              // Parallel to the coil's axis, 32 long, clear of the 6-unit humps.
              if (vertical) {
                expect(x0).toBe(x1);
                expect(Math.abs(y1 - y0)).toBe(32);
                expect(x0).toBeGreaterThan(6);
              } else {
                expect(y0).toBe(y1);
                expect(Math.abs(x1 - x0)).toBe(32);
                expect(y0).toBeLessThan(-6);
              }
            }
          },
        );

        it('places name and value as the brief sets out', async () => {
          const { group } = await render(setup);
          const [name, value] = [textWith(group, 'L1'), textWith(group, '10 µH')];
          if (vertical) {
            const x = kind === 'cored' ? '20' : '12';
            expect(textAt(name)).toEqual(['label', x, '17', null]);
            expect(textAt(value)).toEqual(['value', x, '29', null]);
          } else {
            const y = kind === 'cored' ? '-20' : '-12';
            expect(textAt(name)).toEqual(['label', '25', y, 'middle']);
            expect(textAt(value)).toEqual(['value', '25', '16', 'middle']);
          }
        });

        it('draws no circle', async () => {
          expect((await render(setup)).group.querySelector('circle')).toBeNull();
        });
      });
    }
  }

  it('defaults to an air-cored horizontal coil named L', async () => {
    const { group } = await renderHost(BareInductorHost, 'schInductor');
    expect(group.querySelector('path.core')).toBeNull();
    expect(group.querySelector('text.label')?.textContent?.trim()).toBe('L');
    const leads = leadsOf(group);
    expect(leads[leads.length - 1][1]).toEqual([50, 0]);
  });

  it('highlight thickens the leads to 4 and keeps the coil and core at 2', async () => {
    const { fixture, group } = await render((h) => {
      h.kind.set('cored');
      h.highlight.set(true);
    });
    const width = (sel: string) => getComputedStyle(group.querySelector(sel)!).strokeWidth;
    expect(width('path.lead')).toBe('4');
    expect(width('path.coil')).toBe('2');
    expect(width('path.core')).toBe('2');
    expect(getComputedStyle(group.querySelector('path.lead')!).strokeLinecap).toBe('butt');

    fixture.componentInstance.highlight.set(false);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(width('path.lead')).toBe('2');
  });
});

describe('schPot', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({ imports: [PotHost, BarePotHost, ResistorHost] }),
  );
  const render = (setup?: (h: PotHost) => void) => renderHost(PotHost, 'schPot', setup);
  const pathOf = (g: SVGGElement) => g.querySelector('path.stroke')!.getAttribute('d')!;

  it('is exported in SCHEMATIC', () => {
    expect(SCHEMATIC).toContain(SchPot);
  });

  for (const kind of ['pot', 'variable'] as const) {
    describe(kind, () => {
      it('takes the dim and highlight classes', async () => {
        const { fixture, group } = await render((h) => h.kind.set(kind));
        await expectEmphasis(fixture, fixture.componentInstance, group);
      });

      it('draws the vertical schResistor body, pins at (0, 0) and (0, 40)', async () => {
        const resistor = await renderHost(ResistorHost, 'schResistor');
        const body = subpaths(resistor.group.querySelector('path')!.getAttribute('d')!);
        const parts = subpaths(pathOf((await render((h) => h.kind.set(kind))).group));
        expect(parts.slice(0, body.length)).toEqual(body);
        expect(body[0][0]).toEqual([0, 0]);
        const lastLead = body[body.length - 1];
        expect(lastLead[lastLead.length - 1]).toEqual([0, 40]);
      });

      it('draws body, wiper or arrow, and fills inside one g.art layer, text outside it', async () => {
        const { group } = await render((h) => h.kind.set(kind));
        const art = group.querySelector(':scope > g.art')!;
        expect(art).not.toBeNull();
        const drawn = group.querySelectorAll('path, rect');
        expect(drawn.length).toBe(kind === 'pot' ? 4 : 2);
        for (const el of drawn) expect(art.contains(el)).toBe(true);
        expect(group.querySelectorAll(':scope > text')).toHaveLength(2);
      });

      it('uses whole units everywhere and draws no circle', async () => {
        const { group } = await render((h) => h.kind.set(kind));
        expect(group.querySelector('circle')).toBeNull();
        for (const p of group.querySelectorAll('path')) {
          expect(allWhole(subpaths(p.getAttribute('d')!))).toBe(true);
        }
        for (const r of group.querySelectorAll('rect')) {
          expect(Object.values(rectOf(r)).every(Number.isInteger)).toBe(true);
        }
      });
    });
  }

  it('pot: a wiper from the third pin at (30, 20), a left-pointing arrowhead, text left', async () => {
    const { group } = await render();
    expect(pathOf(group)).toContain('M16 20 H30');
    const parts = subpaths(pathOf(group));
    expect(parts[parts.length - 1]).toEqual([
      [16, 20],
      [30, 20],
    ]);
    const cols = [...group.querySelectorAll('rect.fill')].map(rectOf).sort((a, b) => a.x - b.x);
    expect(cols).toEqual([
      { x: 10, y: 19, w: 2, h: 2 },
      { x: 12, y: 17, w: 2, h: 6 },
      { x: 14, y: 15, w: 2, h: 10 },
    ]);
    // Each column centred on the wiper; the tip (x = 10) touches the body's edge.
    for (const c of cols) expect(c.y + c.h / 2).toBe(20);
    expect(group.querySelector('path.fill')).toBeNull();
    expect(textAt(textWith(group, 'RV1'))).toEqual(['label', '-14', '17', 'end']);
    expect(textAt(textWith(group, '10 kΩ'))).toEqual(['value', '-14', '29', 'end']);
  });

  it('variable: no wiper, one oblique arrow from (−12, 32) to (12, 8), a chevron, text right', async () => {
    const { group } = await render((h) => h.kind.set('variable'));
    expect(pathOf(group)).not.toContain('H30');
    expect(group.querySelectorAll('rect')).toHaveLength(0);
    const oblique = segmentsOf(subpaths(pathOf(group))).filter(
      ([[x0, y0], [x1, y1]]) => x0 !== x1 && y0 !== y1,
    );
    expect(oblique).toEqual([
      [
        [-12, 32],
        [12, 8],
      ],
    ]);
    const chevron = group.querySelectorAll('path.fill');
    expect(chevron).toHaveLength(1);
    expect(chevron[0].getAttribute('d')).toBe('M6 6 H14 V14 H12 V8 H6 Z');
    expect(textAt(textWith(group, 'RV1'))).toEqual(['label', '16', '17', null]);
    expect(textAt(textWith(group, '10 kΩ'))).toEqual(['value', '16', '29', null]);
  });

  it('defaults to a pot named R', async () => {
    const { group } = await renderHost(BarePotHost, 'schPot');
    expect(pathOf(group)).toContain('M16 20 H30');
    expect(group.querySelector('text.label')?.textContent?.trim()).toBe('R');
  });
});
