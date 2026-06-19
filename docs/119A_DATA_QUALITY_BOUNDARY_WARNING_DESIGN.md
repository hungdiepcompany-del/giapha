# Phase 119A - Data Quality Boundary And Warning Design

Status: `DESIGN_ONLY_LOCAL_STATIC_VALIDATED`

## Summary

Phase 119A defines how Vietnamese genealogy data quality warnings should be classified, displayed and bounded. It is a design-only phase. It does not create schema, persistent warning tables, migrations, DB jobs, full-tree scans, runtime scanners, service Workers, dependencies or deploy changes.

The goal is to make future quality guidance useful without turning the main app into a heavy validation engine.

## Data Quality Categories

- Missing birth date or death date when family history requires approximate chronology.
- Impossible dates, such as death before birth or child born before parent.
- Duplicate person suspicion based on similar names, dates, spouse or parent context.
- Missing parent link for a person whose branch/generation context expects parentage.
- Multiple primary memberships across lineage records when only one primary clan/branch path should be active.
- Branch or generation conflict between explicit lineage assignment and person profile hints.
- Spouse or child relationship inconsistency, such as conflicting parent links or duplicate child membership.
- Private/public visibility conflict where a record appears suitable for public display but contains living-person or private family data.

## Severity Model

- `info`: informational hint. Vietnamese label: `Thông tin`.
- `warning`: needs attention but does not block normal editing. Vietnamese label: `Cần chú ý`.
- `blocking`: must be resolved before a risky action proceeds, such as future import confirmation. Vietnamese label: `Cần xử lý trước khi tiếp tục`.

Severity must be explainable in plain language and must include a source context so admins can decide whether to fix, ignore or defer.

## Warning Locations

- Admin people: person detail, lineage membership section and future edit forms.
- Admin genealogy: clan, branch, generation rule and membership management.
- Tree editor: lightweight warnings for branch/generation conflicts and relationship inconsistencies.
- Import preview later: batch warnings before import confirmation, governed by import/service boundary rules.

Public routes must not expose private warnings or leak private family details.

## Boundary

- Main app allowed in future approved phases: lightweight inline hints derived from data already loaded for the current admin view.
- Main app not allowed without future approval: full-tree scans, large duplicate detection, media/document scans, import-wide validation, background jobs or long-running analysis.
- Data-quality service or scheduled checker required later: whole-family scans, duplicate scoring, branch/generation consistency reports, import preview validation and recurring quality reports.
- Large validation and scan work must follow `docs/RUNTIME_WORKER_GUARDRAIL.md` and `docs/SERVICE_BOUNDARY_ROADMAP.md`.

## Privacy

- Warnings must inherit the privacy of the underlying record.
- Public pages must not show internal warning labels or private source details.
- Living-person warnings must remain admin-only unless a future policy explicitly allows safer aggregate display.
- Duplicate suspicion must avoid exposing private candidate matches to users without permission.

## Future Persistent Warning Requirements

If a future phase needs persistent warning records, it must include:

- Separate owner approval for schema and migration.
- RLS and policy design before apply.
- A clear source and stale-warning invalidation model.
- Privacy-safe references instead of copying private person data into warning text.
- A service-boundary plan for batch generation if warnings are produced by scans.

## No-Go Conditions

- No migration approval.
- No RLS/privacy plan for persistent warnings.
- Any full-tree or import-wide scan running inside the main Worker.
- Any warning that leaks private living-person data on public routes.
- Any automatic mutation, seed, backfill or cleanup based only on warning detection.

## Recommended Phase 119B Scope

Phase 119B may design a lightweight warning contract and static examples for admin UI. It should not create a persistent warning table, run a full DB scan, add background jobs, mutate data or deploy service infrastructure.

## Runtime And Worker Boundary Status

- Main Worker touched: NO
- Runtime dependency added: NO
- New service Worker created: NO
- OpenNext/Wrangler config changed: NO
- Worker size risk introduced by this phase: NO
- Persistent warning table created: NO
- Full DB or full-tree scan implemented: NO
- SQL mutation: NO
- Seed/backfill: NO
- Deploy: NO
- Push: NO
