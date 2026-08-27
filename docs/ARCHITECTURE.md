# Architecture and trust boundaries

## Current release

MergeSignal v1 is a Vinext/React application deployed through Sites. The public demo is intentionally self-contained:

```text
Browser
  ├─ deterministic fictional dataset
  ├─ pure analytics and Ask selectors
  ├─ local CSV/JSON parser
  ├─ namespaced experiment/privacy storage
  └─ client-generated aggregate export
```

There is no application database, authentication service, model call, telemetry collector, or production connector in this release. That makes the public evaluation path fast and keeps the trust boundary observable.

## Domain boundaries

- `web/lib/demo-data.ts` owns deterministic fictional records.
- `web/lib/analytics.ts` owns filtering and aggregate calculations.
- `web/lib/ask.ts` owns supported analytical intents and evidence citations.
- `web/lib/import.ts` owns the local import allowlist, parsing limits, normalization, and validation.
- `web/lib/export.ts` owns aggregate output, formula neutralization, and its own cohort guard.
- `web/lib/experiments.ts` owns versioned persistence and fails closed on malformed state.
- Components render domain results; charts do not calculate business metrics.

## Privacy invariants

1. The import schema accepts only date, team, tool, workflow, spend, assisted pull-request count, estimated net hours, cycle/review hours, rework rate, and change-failure rate.
2. Unknown, sensitive, nested, prototype-related, oversized, invalid, and formula-like values are rejected before preview.
3. Import parsing has a 2 MB and 5,000-row ceiling and makes no network request.
4. Aggregate UI, Ask, and export paths suppress active cohorts below five.
5. Export repeats the guard at its own boundary, so a caller cannot bypass a disabled button.
6. Stored experiments have a schema version, size/date/status validation, a 100-record ceiling, and duplicate-ID rejection.
7. Individual rankings are not part of the data model or navigation.

## Production evolution path

A real organization workspace should retain the same domain APIs behind repository adapters:

```text
Browser → authenticated API Worker → tenant-scoped D1 aggregates
                          ↑
signed allowlisted batches → Queue → validate/dedupe/roll up
```

Production gates before enabling that path:

- Managed identity with SSO-ready OIDC, secure cookies, CSRF protection, and role/team authorization.
- Organization scoping enforced at the repository boundary and tested against tenant-ID tampering.
- Signed idempotent ingestion, body/rate limits, replay protection, and unknown-field rejection.
- Separate pseudonymous identity mapping with per-organization salt.
- Content-free structured logs, deletion/export jobs, immutable audit events, and connector-health telemetry.
- Versioned D1 migrations, restore rehearsal, queued rollups, and explicit retention.
- Customer-owned OAuth credentials and security review per connector.
- An on-device collector/router only as a separately threat-modelled and signed product.

## Release gates

The exact release revision must pass ESLint, TypeScript, Vitest, a production Vinext build, a zero-high npm audit, Playwright journeys, route-wide axe checks, independent acceptance verification, CI, and deployed smoke checks.
