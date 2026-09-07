import { afterNextRender, Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { UI } from '../../i18n/ui';
import { LANGS, type Lang } from '../../core/content.types';

/**
 * The site root. Prerendered as a real, indexable page that offers both
 * languages; in a browser it forwards to whichever one the reader's browser
 * asks for. Static hosting means there is no server to negotiate this for us.
 */
@Component({
  selector: 'app-language-gate',
  imports: [RouterLink],
  template: `
    <div class="gate page">
      <svg class="gate__mark" viewBox="0 0 120 40" aria-hidden="true">
        <g fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round">
          <path d="M2 20h22" />
          <rect x="24" y="12" width="34" height="16" rx="1" />
          <path d="M58 20h60" />
          <path d="M88 20v10" />
          <path d="M78 30h20M78 36h20" />
        </g>
      </svg>
      <h1>Workbench · Banco de Trabajo</h1>
      <p>Interactive electronics, free and complete.</p>
      <p lang="es">Electrónica interactiva, gratis y completa.</p>
      <nav class="gate__choice">
        @for (option of options; track option.lang) {
          <a [routerLink]="['/', option.lang]" [attr.lang]="option.lang" [attr.hreflang]="option.lang">
            <span class="gate__code">{{ option.lang }}</span>
            <span>{{ option.label }}</span>
          </a>
        }
      </nav>
    </div>
  `,
  styles: `
    .gate {
      max-width: 46ch;
      margin-inline: auto;
      padding-block: clamp(56px, 14vh, 140px);
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
    }
    .gate__mark {
      width: 120px;
      color: var(--copper);
      margin-bottom: 12px;
    }
    h1 {
      font-size: var(--step-2);
      font-weight: 700;
    }
    p {
      color: var(--muted);
      font-size: 15.5px;
    }
    .gate__choice {
      display: flex;
      gap: 12px;
      margin-top: 26px;
      flex-wrap: wrap;
      justify-content: center;
    }
    .gate__choice a {
      display: flex;
      align-items: center;
      gap: 10px;
      border: 1px solid var(--rule);
      background: var(--surface);
      padding: 12px 20px;
      text-decoration: none;
      color: var(--ink);
      font-family: var(--sans);
      font-weight: 600;
    }
    .gate__choice a:hover {
      border-color: var(--copper);
      color: var(--copper);
    }
    .gate__code {
      font-family: var(--mono);
      font-size: 11px;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--faint);
    }
  `,
})
export class LanguageGate {
  private readonly router = inject(Router);

  protected readonly options = LANGS.map((lang) => ({ lang, label: UI[lang].siteName }));

  constructor() {
    afterNextRender(() => {
      const preferred = this.preferredLang();
      void this.router.navigate(['/', preferred], { replaceUrl: true });
    });
  }

  private preferredLang(): Lang {
    const candidates = navigator.languages?.length ? navigator.languages : [navigator.language];
    for (const tag of candidates) {
      const base = tag.toLowerCase().split('-')[0];
      if (base === 'es') return 'es';
      if (base === 'en') return 'en';
    }
    return 'en';
  }
}
