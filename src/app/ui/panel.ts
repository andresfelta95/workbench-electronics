import { Component, input } from '@angular/core';

/** The shared frame every instrument sits in: caption, drawing, controls, readouts. */
@Component({
  selector: 'app-panel',
  template: `
    <section class="panel">
      @if (heading()) {
        <header class="panel__head">
          <h3>{{ heading() }}</h3>
          <ng-content select="[panelAction]" />
        </header>
      }
      <div class="panel__main">
        <div class="panel__figure"><ng-content select="[panelFigure]" /></div>
        <div class="panel__controls"><ng-content select="[panelControls]" /></div>
      </div>
      <div class="panel__readouts"><ng-content select="[panelReadouts]" /></div>
      <ng-content />
    </section>
  `,
  styles: `
    :host {
      display: block;
    }

    .panel {
      border: 1px solid var(--rule);
      background: var(--surface);
    }

    .panel__head {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 12px;
      padding: 12px 16px;
      border-bottom: 1px solid var(--rule);
    }

    .panel__head h3 {
      font-family: var(--sans);
      font-weight: 600;
      font-size: 16px;
    }

    .panel__main {
      display: grid;
      gap: 0;
    }

    @media (min-width: 700px) {
      .panel__main {
        grid-template-columns: minmax(0, 1.05fr) minmax(240px, 0.95fr);
      }
    }

    .panel__figure {
      padding: 20px 18px;
      display: flex;
      align-items: center;
      justify-content: center;
      min-width: 0;
    }

    .panel__controls {
      padding: 16px 18px 20px;
      border-top: 1px solid var(--rule);
      display: flex;
      flex-direction: column;
      gap: 16px;
      min-width: 0;
    }

    @media (min-width: 700px) {
      .panel__controls {
        border-top: none;
        border-left: 1px solid var(--rule);
      }
    }

    .panel__readouts:empty {
      display: none;
    }
  `,
})
export class Panel {
  readonly heading = input('');
}
