import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { I18n } from '../../core/i18n';

@Component({
  selector: 'app-not-found',
  imports: [RouterLink],
  template: `
    <div class="nf page">
      <svg class="nf__mark" viewBox="0 0 120 30" aria-hidden="true">
        <g fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round">
          <path d="M2 15h44" />
          <circle cx="50" cy="15" r="3.5" />
          <circle cx="70" cy="15" r="3.5" />
          <path d="M74 15h44" />
        </g>
      </svg>
      <p class="eyebrow">404</p>
      <h1>{{ t().notFound.heading }}</h1>
      <p class="nf__body">{{ t().notFound.body }}</p>
      <a class="nf__cta" [routerLink]="['/', lang()]">{{ t().notFound.cta }}</a>
    </div>
  `,
  styles: `
    .nf {
      max-width: 48ch;
      margin-inline: auto;
      padding-block: clamp(56px, 12vh, 120px);
      display: flex;
      flex-direction: column;
      gap: 12px;
      align-items: flex-start;
    }
    .nf__mark {
      width: 160px;
      color: var(--rule-strong);
      margin-bottom: 8px;
    }
    h1 {
      font-size: var(--step-4);
      font-weight: 700;
    }
    .nf__body {
      color: var(--muted);
    }
    .nf__cta {
      margin-top: 14px;
      font-family: var(--mono);
      font-size: 12.5px;
      border: 1px solid var(--rule);
      padding: 11px 18px;
      text-decoration: none;
      color: var(--ink);
    }
    .nf__cta:hover {
      border-color: var(--copper);
      color: var(--copper);
    }
  `,
})
export class NotFound {
  private readonly i18n = inject(I18n);
  protected readonly t = this.i18n.t;
  protected readonly lang = this.i18n.lang;
}
