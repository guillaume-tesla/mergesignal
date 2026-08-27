# Security policy

## Scope of this public demo

MergeSignal is a local-first fictional product demonstration. It has no login, production tenant data, live connectors, backend model call, or application database. Do not use the public demo for confidential company information.

## Data contract

The local preview accepts only aggregate telemetry fields documented in the product. Prompt text, source code, diffs, patches, paths, terminal/command output, and model output are rejected. Unknown and nested JSON fields, spreadsheet formulas, invalid ranges, oversized input, and dangerous prototype-related keys fail closed.

Imported text is parsed inside the browser. The application does not upload it. Exports contain only aggregate summaries, are formula-neutralized, and are refused for cohorts below five active people.

## Browser storage

Experiments and privacy preferences use namespaced local-storage keys. Stored experiment data is schema-versioned and validated for types, lengths, dates, status, duplicate IDs, and count before use. Reset actions remove only MergeSignal-owned state.

## Reporting a vulnerability

Please open a private GitHub security advisory on the repository rather than a public issue. Include the affected route, reproduction, impact, browser/runtime, and any proof that sensitive content crossed the documented trust boundary. Do not include real secrets or third-party data.

## Production warning

The integration catalog is a contract preview, not a claim of production security. Real OAuth, multi-tenancy, ingestion, RBAC, audit logs, data deletion, secret rotation, and collector updates require a separate security review before deployment.
