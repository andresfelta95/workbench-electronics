import { Component, inject, input } from '@angular/core';
import { I18n } from '../core/i18n';
import type { LessonBlock } from '../core/content.types';
import { WidgetHost } from './widget-host';

@Component({
  selector: 'app-lesson-body',
  imports: [WidgetHost],
  template: `
    @for (block of blocks(); track $index) {
      @switch (block.kind) {
        @case ('html') {
          <div class="prose" [innerHTML]="block.html"></div>
        }
        @case ('callout') {
          <div class="callout" role="note" [attr.data-tone]="block.tone">
            <p class="callout__label">
              {{ block.title || i18n.t().callout[block.tone] }}
            </p>
            <div class="prose callout__body" [innerHTML]="block.html"></div>
          </div>
        }
        @case ('widget') {
          <figure class="instrument">
            <figcaption class="instrument__label">
              <span class="instrument__dot"></span>
              {{ i18n.t().lesson.interactive }}
              <code>{{ block.type }}</code>
            </figcaption>
            <app-widget-host [type]="block.type" [props]="block.props" />
          </figure>
        }
      }
    }
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      gap: 26px;
    }

    .callout {
      max-width: var(--measure);
      border: 1px solid var(--rule);
      border-left: 3px solid var(--signal);
      background: var(--surface);
      padding: 18px 20px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .callout__label {
      font-family: var(--mono);
      font-size: 10.5px;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: var(--signal);
    }

    .callout[data-tone='warning'] {
      border-left-color: var(--warn);
      background: var(--warn-soft);
    }

    .callout[data-tone='warning'] .callout__label {
      color: var(--warn);
    }

    .callout[data-tone='safety'] {
      border-left-color: var(--danger);
      background: var(--danger-soft);
    }

    .callout[data-tone='safety'] .callout__label {
      color: var(--danger);
    }

    .callout[data-tone='key'] {
      border-left-color: var(--copper);
      background: var(--copper-soft);
    }

    .callout[data-tone='key'] .callout__label {
      color: var(--copper-ink);
    }

    .instrument {
      margin: 6px 0;
      max-width: 780px;
    }

    .instrument__label {
      display: flex;
      align-items: center;
      gap: 8px;
      font-family: var(--mono);
      font-size: 10.5px;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--faint);
      padding-bottom: 8px;
    }

    .instrument__label code {
      color: var(--copper);
      text-transform: none;
      letter-spacing: 0.02em;
    }

    .instrument__dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: var(--signal);
      flex: none;
    }
  `,
})
export class LessonBody {
  readonly blocks = input.required<LessonBlock[]>();
  protected readonly i18n = inject(I18n);
}
