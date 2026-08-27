# Task contract: MergeSignal v1

## Goal alignment

- Active goal objective: Research Mentlio thoroughly and autonomously design, build, test, iterate, publish, and deliver a production-quality independent competitor with a working landing page and application, using parallel agents and the authenticated GitHub account.
- Authoritative inputs: the user's 27 August 2026 request and follow-up granting full product ownership; Mentlio's public website, app entry, documentation, research, changelog, security and status pages; its Y Combinator profile and launch video; public GitHub installer releases; the synchronized repository baseline at `2e6900c`.
- Verifiable stopping condition: the exact released revision is available from a GitHub repository and a deployed URL; both the landing page and seeded application complete their primary user paths; every acceptance criterion below has local, browser-level, independent, CI, and deployed evidence as applicable; no critical/high regression remains open.
- Goal/task-contract differences: none. This contract makes the active goal observable and bounded.

## Classification and scope

- Type: FEATURE
- In scope:
  - A clean-room competitor named **MergeSignal**, with original copy, visual system, data, and interaction design.
  - A conversion-focused public landing page and a no-login interactive demo application.
  - A fictional Northstar Cloud workspace showing AI spend, adoption, delivery, review quality, tool performance, opportunity evidence, and 14-day experiments.
  - Team/repository/workflow-level analysis by default; no employee-ranking experience.
  - Transparent evidence receipts with sample size, comparison method, confidence, caveats, and next action.
  - A complete local-first workflow: explore demo, filter data, inspect an opportunity, launch and manage an experiment, ask supported analytical questions, preview safe import fields, export leadership data, change privacy controls, and reset demo state.
  - Responsive, accessible, keyboard-operable UI; deterministic demo data; local persistence; errors and empty states; production metadata and social preview.
  - Automated unit/integration/component/end-to-end tests, independent verification, CI, deployment, and post-deployment checks.
  - Public research artifacts and source index, kept separate from shipped assets.
- Out of scope:
  - Copying Mentlio's trademarks, logo, prose, screenshots, proprietary formulas, benchmark claims, or visual trade dress into the shipped product.
  - Claiming real customer outcomes or causal impact from synthetic data.
  - A production on-device collector, model router, source-code analyzer, or live third-party OAuth connection without provider credentials and a separate security review.
  - Employee surveillance or default individual leaderboards.
- Assumptions:
  - The smallest safe, reversible interpretation of “full software” is a genuinely usable, deployed, persistent seeded product that demonstrates the complete decision loop and safe import contract; unavailable enterprise credentials are represented honestly as connection previews, not fake live integrations.
  - All Northstar Cloud numbers are labelled demo data.
  - The authenticated GitHub session is `guillaume-tesla`; the requested `GDemay` account is not authenticated in CLI or browser. Delivery proceeds on the authenticated account rather than pausing the product build.

## Baseline evidence

- Revision/environment: `2e6900c` on synchronized `main`; empty repository with only the GitHub-generated README.
- User or client path: open the repository or any local route.
- Expected: a working Mentlio-class competitor with landing page and application.
- Actual/missing: no application, routes, product model, tests, CI, or deployment exists.
- Evidence: baseline repository tree and revision log; public research captures under `research/`.

## Acceptance criteria

| ID | Observable requirement | Test/evidence | Status |
|---|---|---|---|
| AC-1 | `/` presents MergeSignal's original positioning, differentiated value, privacy promise, workflow, transparent pricing, FAQ, and working calls to action. | Browser journey at desktop/mobile; content and link assertions; screenshots. | pass — local |
| AC-2 | “Explore live demo” opens `/app` without authentication and clearly labels fictional demo data. | End-to-end navigation test and deployed browser check. | pass — local |
| AC-3 | `/app` shows a coherent 28-day Northstar Cloud overview with spend, active adoption, net capacity, cycle time, review time, quality signal, tool mix, and actionable opportunities. | Deterministic domain tests, component assertions, browser screenshot. | pass — local |
| AC-4 | Date, team, tool, and workflow filters change the visible metrics and charts consistently; reset restores the default dataset. | Unit tests for selectors; browser filter/reset journey. | pass — local |
| AC-5 | Opportunity detail exposes evidence window, sample size, matched comparison, confidence, caveats, and next action—never a causal claim. | Content assertions and normal-user inspection. | pass — local |
| AC-6 | A user can launch a 14-day experiment from an opportunity, edit its target, advance its status, and retain it after reload. | Storage integration test and browser persistence journey. | pass — local |
| AC-7 | The Ask surface answers supported product questions from the current filters, cites the records/metrics it used, handles unknown questions safely, and never implies a general-purpose AI backend. | Intent-routing unit tests and browser positive/negative journeys. | pass — local |
| AC-8 | Import preview accepts a bounded CSV/JSON telemetry schema, rejects unknown/sensitive fields and spreadsheet-formula risks, shows what stays local/uploads, and never sends raw file content to a server. | Parser/security tests and browser import-preview journey. | pass — local |
| AC-9 | Leadership export downloads a safe CSV/JSON summary whose values match the current filters and whose text fields cannot trigger spreadsheet formulas. | Export unit test and browser download evidence. | pass — local |
| AC-10 | Integrations and privacy surfaces distinguish demo/preview from real connectivity, show field-level data handling, and expose retention/cohort controls. | Browser content/interaction assertions. | pass — local |
| AC-11 | Small cohorts are suppressed below five members; individual ranking is absent; accessible explanations accompany charts. | Domain and accessibility tests; verifier inspection. | pass — local |
| AC-12 | Primary routes work at 390px, 768px, and desktop widths; keyboard focus is visible; reduced-motion is respected; automated accessibility scan has no serious/critical findings. | Responsive screenshots, keyboard journey, automated accessibility test. | pass — local |
| AC-13 | Production build, type check, lint, unit/component tests, end-to-end tests, and dependency/security checks pass for the exact released revision. | Local logs and GitHub CI for the head SHA. | pass — local; CI pending |
| AC-14 | A fresh independent verifier tests every criterion and reports PASS; any failure is repaired and reverified. | Clean-context verifier report with artifacts. | pending |
| AC-15 | The exact CI-green revision is deployed; `/`, `/app`, and representative subroutes return successfully with no console errors; core user paths pass against production. | Deployment status, HTTP checks, browser smoke, screenshots. | pending |

## Risk and release

- Security/privacy/data risks: accidental upload of prompts/code/paths; spreadsheet injection; misleading ROI claims; cross-context persistence leaks. Mitigations are allowlisted schemas, local-only parsing, formula escaping, explicit evidence tiers, demo labels, namespace/versioned storage, and negative tests.
- Compatibility/performance/accessibility risks: dense dashboard on small screens, chart-only meaning, hydration/state drift, motion sensitivity, slow initial bundle. Mitigations are semantic summaries/tables, responsive layouts, deterministic data, reduced motion, bundle inspection, and browser verification.
- Rollout: dedicated branch → pull request → exact-head CI → merge to `main` → production deployment → smoke and health check.
- Health signals and thresholds: zero uncaught console errors in tested paths; no failed network requests required for demo operation; all core route responses 2xx; no serious/critical accessibility violations; no critical/high dependency findings; build and E2E green.
- Rollback/disable path: redeploy the last known-good version or revert the release commit on `main`; demo data is device-local and disposable.

## Verification log

- 2026-08-27 — baseline `2e6900c` — repository contained no product implementation; FEATURE capability absent.
- 2026-08-27 — public research — Mentlio landing, app entry, docs, research, YC, security, status, changelog, product states, and downloadable public assets captured under `research/`; no protected assets will ship.
- 2026-08-27 — first independent verification of `ed78d97` — rejected: Overview filters did not carry into Ask (AC-7), and the configured 10-person cohort floor did not govern Overview/export (AC-10). Release was blocked before deployment.
- 2026-08-27 — TDD repair candidate — added a schema-validated shared workspace preference store; Overview filters now persist across navigation/reload and scope Ask; the configured 5/8/10-person floor now governs Overview, Ask, nested tool cohorts, and export; stale Ask answers are invalidated on scope changes; zero-record queries do not reveal roster totals; selected-tool queries cannot escape to siblings; exhaustive tool breakdowns use whole-partition suppression to prevent differencing.
- 2026-08-27 — repaired local gate — 40 unit/component tests, 9 end-to-end product journeys, and 9 route-wide accessibility audits pass; lint, TypeScript, production build, and full npm audit are green with zero known vulnerabilities. Fresh independent verification and exact-head CI remain required.
