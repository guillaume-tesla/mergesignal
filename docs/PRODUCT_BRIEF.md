# MergeSignal product brief

## Product thesis

Engineering leaders can see AI seats, usage, and spend, but those figures do not answer the budget question: which workflows should be expanded, which need a guardrail, and which spend should stop? MergeSignal turns approved rollout telemetry into a decision trail a leader can inspect and test.

The wedge is not another employee score or a black-box ROI dashboard. It is a lightweight **AI rollout lab**:

1. Observe team- and workflow-level associations.
2. Inspect the records, comparison method, confidence, and caveats.
3. Launch a bounded 14-day experiment.
4. Export a leadership summary that preserves the uncertainty.

## Primary users and jobs

| User | Job to be done | MergeSignal outcome |
|---|---|---|
| CTO / VP Engineering | Decide whether the AI budget is creating useful capacity | Scale, fix, and stop queue with transparent evidence |
| Engineering Operations | Run a trustworthy rollout without becoming an employee-surveillance program | Approved schema, cohort suppression, experiments, export |
| Engineering Manager | Improve a workflow without optimizing a vanity metric | Matched comparison, caveats, reversible 14-day target |
| Security / Privacy reviewer | Understand exactly what data enters the system | Field-level allowlist and explicit rejected categories |

## Differentiation

- **Decisions over dashboards:** every opportunity ends in a reversible action.
- **Evidence receipts:** sample, time window, matching method, confidence, and caveats are first-class product objects.
- **Experiment loop:** recommendations are hypotheses until a bounded test improves the evidence.
- **Team trust:** no individual leaderboard; views and exports under five active people are suppressed.
- **Content-blind contract:** prompt text, source code, diffs, paths, and command/model output are outside the accepted schema.
- **Honest demo:** fictional data and disconnected integrations are labelled everywhere they matter.

## v1 scope and value path

The public experience opens instantly and takes a buyer through one complete loop:

`Landing → overview → filter → opportunity → evidence receipt → 14-day experiment → Ask/export/privacy`

No credentials are needed. Experiments and privacy settings persist in namespaced, schema-versioned browser storage. Imports are parsed locally and never transmitted.

## Commercial hypothesis

The landing page tests transparent pricing at **$12 per active developer per month**, a $300 monthly minimum, and a 30-day pilot. This is a positioning hypothesis for customer discovery; the product makes no fabricated traction, certification, or customer-ROI claims.

## Success measures for a real pilot

- A leader reaches an evidence receipt within five minutes of first data validation.
- At least one opportunity becomes a named, measurable experiment.
- The team can explain each recommendation's inputs and limitations without vendor help.
- No prompt/code content appears in accepted records, logs, or exports.
- No aggregate below the configured cohort floor is exposed.
- A leadership export remains consistent with the active filters and evidence tier.

## Deliberately deferred

Real OAuth, tenant identity, continuous collectors, routing, scheduled digests, and multi-user collaboration require customer credentials and a separate production security review. The integration catalog describes those contracts without pretending they are connected.
