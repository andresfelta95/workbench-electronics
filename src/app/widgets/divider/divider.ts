import { Component, computed, inject, input, linkedSignal, signal } from '@angular/core';
import { I18n } from '../../core/i18n';
import { formatPercent, formatSI, parallel, parseValue } from '../../core/format';
import { SCHEMATIC } from '../../schematic/schematic';
import { Control } from '../../ui/control';
import { Panel, type PanelHeadingPart } from '../../ui/panel';
import { Readout } from '../../ui/readout';

const IDEAL_HEADING = 'Vout = Vin · R2 / (R1 + R2)';

/** The loaded nameplate, in the lesson's own shape:
 *  Vout = Vin × (R2 ∥ Rload) / (R1 + (R2 ∥ Rload)). */
const LOADED_HEADING: readonly PanelHeadingPart[] = [
  { text: 'Vout = Vin · ' },
  { text: '(R2||RL)', accent: true },
  { text: ' / (R1 + ' },
  { text: '(R2||RL)', accent: true },
  { text: ')' },
];

/**
 * A voltage divider with an optional load, which is the whole point: the ideal
 * formula and the loaded reality shown side by side, so the error is a number
 * the reader watches move rather than a warning they read.
 */
@Component({
  selector: 'app-divider',
  imports: [...SCHEMATIC, Panel, Control, Readout],
  template: `
    <app-panel [heading]="heading()" [headingAlt]="headingAlt()" [headingLabel]="label()">
      <div panelFigure class="figure">
        <sch-canvas [w]="31" [h]="16" [label]="label()">
          <svg:g schWire d="M40 30 H140" [flow]="flow()" />
          <svg:g schWire d="M40 75 V130 H140" [flow]="flow()" />
          <svg:g schWire d="M140 110 V130" [flow]="flow()" />
          <svg:g schWire d="M140 70 H280" [flow]="loaded() ? loadFlow() : 0" />
          @if (loaded()) {
            <svg:g schWire d="M250 110 V130 H140" [flow]="loadFlow()" />
          }

          <svg:g schSource [x]="4" [y]="3" [value]="text(vin(), 'V')" />
          <svg:g schResistor [x]="14" [y]="3" [vertical]="true" name="R1" [value]="text(r1(), 'Ω')" />
          <svg:g schResistor [x]="14" [y]="7" [vertical]="true" name="R2" [value]="text(r2(), 'Ω')" />
          @if (loaded()) {
            <svg:g
              schResistor
              [x]="25"
              [y]="7"
              [vertical]="true"
              name="RL"
              [value]="text(rLoad(), 'Ω')"
              [highlight]="true"
            />
            <svg:g schJunction [x]="25" [y]="7" />
          }
          <svg:g schGround [x]="14" [y]="13" />
          <svg:g schJunction [x]="14" [y]="7" />
          <svg:g schJunction [x]="14" [y]="13" />
          <svg:g schTerminal [x]="28" [y]="7" name="Vout" [right]="true" />
          <svg:g schLabel [x]="21" [y]="5.6" [text]="text(vout(), 'V')" [accent]="true" anchor="middle" />
        </sch-canvas>
      </div>

      <div panelControls>
        <app-control [label]="t().widget.supply" unit="V" [min]="1" [max]="24" [(value)]="vin" />
        <app-control
          label="R1"
          unit="Ω"
          [min]="100"
          [max]="1000000"
          [log]="true"
          [e24]="true"
          [(value)]="r1"
        />
        <app-control
          label="R2"
          unit="Ω"
          [min]="100"
          [max]="1000000"
          [log]="true"
          [e24]="true"
          [(value)]="r2"
        />

        <div class="load pix-rule">
          <label class="pix-switch" [class.pix-switch--on]="loaded()">
            <input type="checkbox" [checked]="loaded()" (change)="loaded.set(!loaded())" />
            {{ t().widget.load }}: {{ loaded() ? text(rLoad(), 'Ω') : t().widget.noLoad }}
          </label>
          @if (loaded()) {
            <app-control
              [label]="t().widget.load"
              unit="Ω"
              [min]="100"
              [max]="1000000"
              [log]="true"
              [e24]="true"
              [(value)]="rLoad"
            />
          }
        </div>
      </div>

      <div panelReadouts>
        <app-readout [label]="t().widget.output" [value]="text(vout(), 'V')" tone="accent" />
        <app-readout [label]="t().widget.idealOutput" [value]="text(videal(), 'V')" />
        <app-readout
          [label]="t().widget.error"
          [value]="errorText()"
          [tone]="errorTone()"
        />
        <app-readout [label]="t().widget.outputImpedance" [value]="text(zout(), 'Ω')" />
        <app-readout [label]="t().widget.drawnCurrent" [value]="text(iLoad(), 'A')" />
        <app-readout [label]="t().widget.wasted" [value]="text(pQuiescent(), 'W')" tone="signal" />
      </div>
    </app-panel>
  `,
  styles: `
    :host {
      display: block;
    }

    .figure {
      width: 100%;
    }

    .load {
      display: flex;
      flex-direction: column;
      gap: calc(6 * var(--px));
    }
  `,
})
export class DividerWidget {
  readonly props = input<Record<string, string>>({});

  private readonly i18n = inject(I18n);
  protected readonly t = this.i18n.t;
  /** Nameplate text. VT323's × is a small raised x, so the plate uses the
   *  middle dot. With the load on, R2 becomes R2 ∥ RL, written `||` because
   *  VT323 has no ∥ and the only served ∥ costs an 80 KiB font slice; the
   *  changed term is accented. The other form is passed as `headingAlt`, so
   *  the plate keeps one size and the Load switch never moves when toggled.
   *  See docs/DESIGN-PIXEL-ART.md, Nameplate formulas. */
  protected readonly heading = computed(() => (this.loaded() ? LOADED_HEADING : IDEAL_HEADING));
  protected readonly headingAlt = computed(() => (this.loaded() ? IDEAL_HEADING : LOADED_HEADING));
  /** Spoken form, for the nameplate and the drawing: × is read as "times" and
   *  the parallel relation is spelled out in the reader's language. */
  protected readonly label = computed(() => {
    if (!this.loaded()) return 'Vout = Vin × R2 / (R1 + R2)';
    const rp = this.t().widget.r2ParallelLoad;
    return `Vout = Vin × (${rp}) / (R1 + (${rp}))`;
  });

  protected readonly vin = linkedSignal(() => parseValue(this.props()['vin'], 9));
  protected readonly r1 = linkedSignal(() => parseValue(this.props()['r1'], 10000));
  protected readonly r2 = linkedSignal(() => parseValue(this.props()['r2'], 10000));
  protected readonly rLoad = linkedSignal(() => parseValue(this.props()['rload'], 10000));
  protected readonly loaded = signal(false);

  /** R2 as the circuit actually sees it once something is hung off the output. */
  private readonly r2Effective = computed(() =>
    this.loaded() ? parallel(this.r2(), this.rLoad()) : this.r2(),
  );

  protected readonly vout = computed(() => {
    const r2 = this.r2Effective();
    return (this.vin() * r2) / (this.r1() + r2);
  });

  protected readonly videal = computed(() => (this.vin() * this.r2()) / (this.r1() + this.r2()));

  protected readonly error = computed(() => {
    const ideal = this.videal();
    return ideal === 0 ? 0 : (this.vout() - ideal) / ideal;
  });

  protected readonly zout = computed(() => parallel(this.r1(), this.r2()));

  protected readonly iLoad = computed(() => (this.loaded() ? this.vout() / this.rLoad() : 0));

  /** What the divider burns just by existing, with nothing connected. */
  protected readonly pQuiescent = computed(() => {
    const total = this.r1() + this.r2();
    return total === 0 ? 0 : (this.vin() * this.vin()) / total;
  });

  private readonly iTotal = computed(() => {
    const total = this.r1() + this.r2Effective();
    return total === 0 ? 0 : this.vin() / total;
  });

  protected readonly flow = computed(() => this.normalise(this.iTotal()));
  protected readonly loadFlow = computed(() => this.normalise(this.iLoad()));

  protected readonly errorText = computed(() => formatPercent(this.error(), this.i18n.lang(), 1));

  protected readonly errorTone = computed(() => {
    const magnitude = Math.abs(this.error());
    if (magnitude < 0.01) return 'signal' as const;
    if (magnitude < 0.1) return 'warn' as const;
    return 'danger' as const;
  });

  protected text(value: number, unit: string): string {
    return formatSI(value, unit, this.i18n.lang());
  }

  private normalise(amps: number): number {
    if (!Number.isFinite(amps) || amps <= 0) return 0;
    return Math.min(1, Math.max(0.08, (Math.log10(amps) + 6) / 6));
  }
}
