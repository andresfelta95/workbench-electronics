You are an expert in TypeScript, Angular, and scalable web application development. You write functional, maintainable, performant, and accessible code following Angular and TypeScript best practices.

## TypeScript Best Practices

- Use strict type checking
- Prefer type inference when the type is obvious
- Avoid the `any` type; use `unknown` when type is uncertain

## Angular Best Practices

- Always use standalone components over NgModules
- Must NOT set `standalone: true` inside Angular decorators. It's the default in Angular v20+.
- Do NOT set `changeDetection: ChangeDetectionStrategy.OnPush` explicitly. `OnPush` is the default in Angular v22+.
- Use signals for state management
- Implement lazy loading for feature routes
- Do NOT use the `@HostBinding` and `@HostListener` decorators. Put host bindings inside the `host` object of the `@Component` or `@Directive` decorator instead
- Use `NgOptimizedImage` for all static images.
  - `NgOptimizedImage` does not work for inline base64 images.

## Accessibility Requirements

- It MUST pass all AXE checks.
- It MUST follow all WCAG AA minimums, including focus management, color contrast, and ARIA attributes.

### Components

- Keep components small and focused on a single responsibility
- Use `input()` and `output()` functions instead of decorators
- Use `model()` for two-way bound properties with `[(prop)]` syntax instead of pairing `input()` with `output()`
- Use `computed()` for derived state
- Use `linkedSignal()` for state derived from multiple reactive sources that must stay synchronized
- Prefer inline templates for small components
- Prefer Signal Forms (`@angular/forms/signals`) for new forms. They are stable in Angular v22+ and provide signal-based state, type-safe field access, and schema-based validation
- When not using Signal Forms, prefer Reactive forms instead of Template-driven ones
- Do NOT use `ngClass`, use `class` bindings instead
- Do NOT use `ngStyle`, use `style` bindings instead
- When using external templates/styles, use paths relative to the component TS file.

## State Management

- Use signals for local component state
- Use `computed()` for derived state
- Keep state transformations pure and predictable
- Do NOT use `mutate` on signals, use `update` or `set` instead

## Templates

- Keep templates simple and avoid complex logic
- Use native control flow (`@if`, `@for`, `@switch`) instead of `*ngIf`, `*ngFor`, `*ngSwitch`
- Use the async pipe to handle observables
- Do not assume globals like (`new Date()`) are available.

## Services

- Design services around a single responsibility
- Use the `providedIn: 'root'` option for singleton services
- Prefer the `@Service` decorator over `@Injectable({providedIn: 'root'})` for new singleton services (Angular v22+)
- Use the `inject()` function instead of constructor injection

## Writing lessons

Any content work in `content/en` or `content/es` (new lessons, rewrites,
translations, `_module.md` files) must follow
`.claude/skills/course-writing/SKILL.md`: plain voice, no AI tells, every term
defined on first use, a real example for each concept, and the course
invariants. The author keeps `.claude/skills/course-writing/glossary.md` up to
date with every term the lesson defines. Every content agent's brief points to
the skill.

## Change workflow (mandatory for every requested change)

Every change the maintainer requests, however small, goes through this
workflow. Do not edit `main` directly and do not skip steps. The orchestrating
session plans, delegates, commits and merges; the subagents do the work.

1. **Branch.** Start from an up-to-date `main` and create a descriptive
   feature branch.
2. **Plan and split.** Break the change into independent work items with
   disjoint file ownership. Typical roles: content (`content/en` + `content/es`),
   widget/code (`src/app/widgets`, `src/app/ui`, `src/app/schematic`),
   design (`src/styles/_pixel.scss`, follow `.claude/agents/pixel-art-designer.md`),
   accessibility (`src/styles.scss`, `src/app/lesson`, `src/app/pages`),
   docs/plan (`docs/`, README, ARCHITECTURE). Spawn **one agent per item**;
   run them in parallel when their files do not overlap. Each agent's brief
   names the files it may touch and forbids the rest.
3. **Implement and self-check.** Each implementation agent follows this file,
   README and ARCHITECTURE, wraps every `pnpm content`/`pnpm build` in
   `flock /tmp/electronics-build.lock`, and verifies its own work (build, axe,
   a behaviour test for anything interactive) before reporting. Builds run
   concurrently, so inside the same `flock` copy the output
   (`cp -r dist/electronics /tmp/<name>-dist`) and run axe on the copy
   (`AXE_TOOLS_DIR=… node tools/axe-check.mjs /tmp/<name>-dist/browser`).
   Behaviour tests are throwaway Playwright scripts kept outside the repo that
   load Playwright from `AXE_TOOLS_DIR`. EN and ES always change together.
4. **Verify and document.** An independent verification agent (method:
   `.claude/agents/course-reviewer.md`) re-checks every claim rather than
   trusting reports: `pnpm build`, `tools/axe-check.mjs` on a private copy
   (as in step 3) with 0 violations across all routes and 4 theme states, a
   behaviour test for anything interactive, keyboard and 375/900/1280 px layout,
   maths and EN/ES parity, CLAUDE.md rules, docs consistency, repo hygiene. It
   records the result as a new dated section in `docs/REVIEW.md` with a
   Severity/Area/Location/Recommendation table, may fix only trivial,
   unambiguous issues (and records them), and states **Ready to merge: yes/no**.
   It is "yes" only with zero open Blocker, Major or Minor findings in the
   change's scope.
5. **Loop until clean.** If not ready, route each finding to a fix agent that
   owns the affected files, then verify again.
6. **Commit, push, PR.** Commit with a descriptive message, push the branch,
   and open a PR whose body summarises the change and the verification
   evidence.
7. **Independent PR review.** A separate agent reviews the PR from a fresh
   clone (`pnpm install --frozen-lockfile && pnpm build`, axe, full diff) and
   posts one PR comment ending in `Verdict: MERGE` or
   `Verdict: CHANGES NEEDED`. The CI build must be green.
8. **Fix or merge.** On CHANGES NEEDED, a fix agent addresses every finding,
   the branch is pushed, CI reruns and the same reviewer re-reviews. On MERGE,
   merge with a merge commit and fast-forward the local `main`.
9. **Deploy only when asked.** Merging does not deploy; the compose rebuild in
   README is run only on an explicit request.
