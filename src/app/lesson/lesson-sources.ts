import { Component, computed, inject, input } from '@angular/core';
import { I18n } from '../core/i18n';
import type { BibEntry, LessonReference } from '../core/content.types';

const ENDS_IN_PUNCT = /[.?!]$/;

/** "Hill, W" -> "Hill, W." but leaves "Hill, W." and "Why?" alone. */
function sentence(text: string): string {
  return ENDS_IN_PUNCT.test(text) ? text : `${text}.`;
}

/**
 * Host and path only, so the link text says where it goes without the noise.
 * The build has already checked that the URL parses.
 */
function shortUrl(url: string): string {
  const parsed = new URL(url);
  const pathPart = parsed.pathname === '/' ? '' : parsed.pathname.replace(/\/$/, '');
  const text = `${parsed.host}${pathPart}`;
  try {
    // "Resource%20Library" reads as "Resource Library".
    return decodeURI(text);
  } catch {
    // A stray "%" that is not an escape: show it as written.
    return text;
  }
}

/**
 * One entry in the course's entry format (docs/BIBLIOGRAPHY.md):
 * Authors. *Title*. Container. Edition. Publisher, year. Identifier. URL
 * The title is italic or “quoted.” as the build resolved `titleStyle`.
 */
@Component({
  selector: 'app-citation',
  template: `<span [attr.lang]="entry().lang">{{ parts().lead }}<cite [class.quoted]="parts().quoted">{{ parts().title }}</cite>{{ parts().tail }}@if (entry().url; as url) {<a [href]="url">{{ parts().linkText }}</a>}</span>`,
  styles: `
    :host {
      display: inline;
    }

    cite {
      font-style: italic;
    }

    cite.quoted {
      font-style: normal;
    }

    a {
      overflow-wrap: anywhere;
    }
  `,
})
export class Citation {
  readonly entry = input.required<BibEntry>();

  protected readonly parts = computed(() => {
    const e = this.entry();
    const quoted = e.titleStyle === 'quoted';

    const rest: string[] = [];
    if (e.container) rest.push(e.container);
    if (e.edition) rest.push(e.edition);
    if (e.publisher) {
      rest.push(e.year ? `${e.publisher}, ${e.year}` : e.publisher);
    } else if (e.year) {
      // "Analog Dialogue 52-09, 2018." reads better than a lone "2018."
      if (rest.length) rest[rest.length - 1] += `, ${e.year}`;
      else rest.push(e.year);
    }
    if (e.identifier) rest.push(e.identifier);

    const after = rest.map(sentence).join(' ');
    const titleStop = ENDS_IN_PUNCT.test(e.title) ? '' : '.';

    return {
      quoted,
      lead: e.authors ? `${sentence(e.authors)} ` : '',
      title: quoted ? `“${e.title}${titleStop}”` : e.title,
      tail: `${quoted ? '' : titleStop}${after ? ` ${after}` : ''}${e.url ? ' ' : ''}`,
      linkText: e.url ? shortUrl(e.url) : '',
    };
  });
}

/** "Sources and further reading": the lesson's references, after the body. */
@Component({
  selector: 'app-lesson-sources',
  imports: [Citation],
  template: `
    <section class="prose sources" aria-labelledby="lesson-sources-heading">
      <h2 id="lesson-sources-heading">{{ t().lesson.sources }}</h2>
      <ol class="sources__list">
        @for (ref of references(); track ref.id) {
          <li>
            <app-citation [entry]="ref" />
            @if (ref.note) {
              <p class="sources__note">{{ ref.note }}</p>
            }
            @if (ref.es; as alt) {
              <p class="sources__alt">{{ t().lesson.inSpanish }} <app-citation [entry]="alt" /></p>
            }
          </li>
        }
      </ol>
    </section>
  `,
  styles: `
    :host {
      display: block;
    }

    .sources__list {
      overflow-wrap: break-word;
    }

    .sources__note,
    .sources__alt {
      margin-top: 0.3em;
    }

    .sources__note {
      color: var(--muted);
    }
  `,
})
export class LessonSources {
  readonly references = input.required<LessonReference[]>();
  protected readonly t = inject(I18n).t;
}
