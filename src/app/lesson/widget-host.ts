import {
  Component,
  ComponentRef,
  effect,
  inject,
  input,
  PendingTasks,
  signal,
  ViewContainerRef,
} from '@angular/core';
import { I18n } from '../core/i18n';
import { WIDGETS } from './widget-registry';

/**
 * Resolves a `::widget{type="…"}` directive to a component and instantiates it.
 * Runs during prerender too, so the instrument's initial state is in the static
 * HTML rather than appearing only after hydration.
 */
@Component({
  selector: 'app-widget-host',
  template: `
    @if (failed()) {
      <p class="widget-host__error">{{ i18n.t().widget.unavailable }}</p>
    }
  `,
  styles: `
    :host {
      display: block;
    }
    .widget-host__error {
      font-family: var(--mono);
      font-size: 12px;
      color: var(--muted);
      border: 1px dashed var(--rule-strong);
      padding: 14px;
    }
  `,
})
export class WidgetHost {
  readonly type = input.required<string>();
  readonly props = input<Record<string, string>>({});

  protected readonly i18n = inject(I18n);
  private readonly container = inject(ViewContainerRef);
  private readonly pendingTasks = inject(PendingTasks);

  protected readonly failed = signal(false);
  private created: ComponentRef<unknown> | null = null;

  constructor() {
    effect(() => {
      const type = this.type();
      const props = this.props();
      const loader = WIDGETS[type];
      this.created?.destroy();
      this.created = null;

      if (!loader) {
        this.failed.set(true);
        return;
      }

      // Registering the load as a pending task is what makes prerendering wait
      // for it: without this the instrument is missing from the static HTML and
      // only appears once the page hydrates.
      void this.pendingTasks.run(async () => {
        try {
          const component = await loader();
          this.created = this.container.createComponent(component);
          this.created.setInput('props', props);
          this.failed.set(false);
        } catch {
          this.failed.set(true);
        }
      });
    });
  }
}
