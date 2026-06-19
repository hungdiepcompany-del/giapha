# Phase 119B - Data Quality Static Contract And Approval Gate

Static data-quality contract status: `DESIGN_ONLY`

## Summary

Phase 119B turns the Phase 119A data-quality boundary design into a static warning contract and approval checklist. It does not create a persistent warning table, run a full-tree scan, add a scheduled checker, create a quality-service Worker or change runtime behavior.

The purpose is to make future warning work explicit and permission-safe before any database or service implementation.

## Proposed Warning Categories

- Missing required identity fields: missing display name, birth/death context or key lineage identity fields needed for admin review.
- Impossible dates: death before birth, child before parent or event chronology that cannot be true.
- Duplicate candidate: similar name/date/relationship context suggesting possible duplicate person records.
- Missing parent/child link: lineage or relationship context implies a missing parent or child edge.
- Multiple primary branch memberships: more than one primary membership where only one should be authoritative.
- Branch/generation conflict: explicit lineage assignment conflicts with generation rule, branch context or profile hint.
- Privacy visibility conflict: public-facing state conflicts with living-person or private-family information.
- Orphan layout node: tree layout references a person or relationship context that is missing or no longer visible.
- Relationship cycle risk: parent/child graph may create ancestry cycles or inconsistent traversal.

## Severity Contract

- `info`: useful context, not a blocker.
- `warning`: needs admin attention, but normal editing can continue.
- `blocking`: must be resolved before a risky action such as future import confirmation, public exposure or destructive cleanup.

Severity must be explainable, deterministic and privacy-aware. The same condition should not change severity based only on UI location.

## Suggested Future Warning Shape

This is a contract shape only, not a table or TypeScript runtime type:

- `id`: stable warning identifier.
- `target_type`: person, family, relationship, branch, clan, layout, import row or export package.
- `target_id`: identifier for the target when permitted.
- `code`: stable machine-readable warning code.
- `severity`: info, warning or blocking.
- `title`: short admin-facing title.
- `message`: privacy-safe explanation.
- `privacy_level`: public, family, private or admin-only.
- `source`: inline hint, import preview, scheduled scan, service scan or manual review.
- `created_at`: creation timestamp.
- `resolved_at`: optional resolution timestamp.

Warning text must avoid copying private notes, hidden relationship facts or raw source data into persistent messages.

## Boundary

- Lightweight inline hints are allowed in a future approved main-app phase when they are derived from data already loaded for the current admin view.
- A persistent warning table requires a migration and owner approval.
- Persistent warning table requires a migration.
- A full-tree scan requires separate approval and must define runtime, read-only, performance and privacy limits.
- A scheduled scan or quality-service requires a service boundary, route/env/auth contract, smoke plan and rollback/no-go plan.
- Import-wide validation and export-readiness scans remain governed by `docs/RUNTIME_WORKER_GUARDRAIL.md` and `docs/SERVICE_BOUNDARY_ROADMAP.md`.

## Privacy

- Warnings must not leak private data on public routes.
- Warning messages must avoid exposing hidden relationship facts.
- Duplicate candidates should only reveal records the current admin may view.
- Living-person warnings remain admin-only unless a future privacy review approves safer aggregate behavior.
- Export/import warnings must not print private source details into logs or public artifacts.

## Approval Gate Before Future Persistent Warning Migration

Do not create persistent warning schema until all items are satisfied:

- Owner approval explicitly names the warning migration phase.
- Schema design defines target references, stale-warning invalidation and resolution behavior.
- RLS/privacy review proves admin-only/private-safe access.
- Warning text storage rules prevent private data duplication.
- Migration rollback/no-go checklist exists.
- Export/backup impact is reviewed.

## Approval Gate Before Future Quality-Service Worker

Do not create a quality-service Worker until all items are satisfied:

- Responsibility boundary separates inline hints, batch scans and import/export readiness scans.
- Route contract and request/response envelope are documented.
- Env/secret contract names variables without storing secret values.
- Auth/internal token or service-binding strategy is approved.
- Smoke test plan safe-skips when explicit URL/env is missing.
- Deploy/rollback/no-go plan exists.
- Performance limits and privacy-safe logging rules are documented.

## Explicitly Not Implemented

- No migration.
- No `.sql` file.
- No DB apply.
- No SQL mutation.
- No seed/backfill.
- No persistent warning table.
- No full-tree runtime scan.
- No scheduled scan.
- No quality-service Worker.
- No Worker.
- No import-wide runtime validation.
- No export-readiness runtime scan.
- No runtime dependency.
- No deploy.
- No push.

## Recommended Future Phase

Recommended next data-quality phase: Phase 119C warning contract examples and static acceptance checklist, still without persistent schema or runtime scanning unless owner approval explicitly widens the phase.

## Runtime And Worker Boundary Status

- Main Worker touched: NO
- Runtime dependency added: NO
- New service Worker created: NO
- OpenNext/Wrangler config changed: NO
- Worker size risk introduced by this phase: NO
- Service boundary recommendation: keep full-tree scans, duplicate scoring, import-wide validation and scheduled checks outside the main Worker until approved
