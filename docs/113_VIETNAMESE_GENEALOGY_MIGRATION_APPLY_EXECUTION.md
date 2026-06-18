# Phase 113 - Vietnamese Genealogy Migration Apply Execution

Status: `OWNER_ACTION_REQUIRED_MANUAL_DASHBOARD_APPLY`

Apply status: `LOCAL_APPLY_NOT_RUN`

DB verification status: `NOT_RUN_APPLY_NOT_CONFIRMED`

## Summary

Phase 113 received explicit owner approval for DB apply of the Phase 111 Vietnamese genealogy migration file.

Local/static pre-apply validation passed and the migration checksum matched the owner-approved fingerprint. However, this workstation does not have a Supabase CLI available in PATH and does not have explicit DB verification/apply credentials in shell state. Because the phase constraints allow only the single approved migration file and forbid extra SQL, seed data or broad migration application, no local DB apply was run.

The safe execution path from this machine is owner/operator manual Supabase Dashboard apply of the exact approved migration file, followed by a separate read-only verification record.

## Owner Approval Received

- Approval status: `RECEIVED`
- Target Supabase project ref: `frkyeuxrlcflmsxxsolp`
- DB backup/snapshot: `DONE`
- Approved migration path: `db/migrations/20260618_0008_vietnamese_genealogy_first_migration.sql`
- Approved SHA256: `522B11AF4D8BDA4F1E29AB63C49C9718129ADF1B27F3F2119BB40D9F7214EA5F`

## Migration Fingerprint

- Expected SHA256: `522B11AF4D8BDA4F1E29AB63C49C9718129ADF1B27F3F2119BB40D9F7214EA5F`
- Actual SHA256: `522B11AF4D8BDA4F1E29AB63C49C9718129ADF1B27F3F2119BB40D9F7214EA5F`
- Checksum result: `PASS`

## Local Apply Tooling Check

- Supabase CLI in PATH: `NO`
- Local Supabase project ref file: `frkyeuxrlcflmsxxsolp`
- `.env.local`: `MISSING`
- Local apply decision: `BLOCKED_NO_SAFE_LOCAL_APPLY_TOOLING`

The local project ref matches the owner-approved target, but without Supabase CLI or explicit DB credentials this phase cannot safely prove or execute a one-file-only DB apply from the workstation.

## Apply Method

Apply method selected: `MANUAL_SUPABASE_DASHBOARD_OWNER_OPERATOR`

Required operator constraints:

- Apply only `db/migrations/20260618_0008_vietnamese_genealogy_first_migration.sql`.
- Do not apply any other migration.
- Do not run extra SQL.
- Do not seed data.
- Do not backfill `people.branch_name`.
- Do not backfill `people.generation_number`.
- Do not deploy.
- Do not change runtime app code.
- Do not create a Worker.
- Do not change OpenNext/Wrangler config.
- Do not add package/dependency.

## Apply Result

Apply result: `OWNER_ACTION_REQUIRED`

The migration was not applied by Codex in this phase because safe local apply tooling was unavailable. The owner/operator must apply the exact approved SQL through the Supabase Dashboard or another controlled owner-operated path that can guarantee one-file-only execution.

## DB Verification Result

DB verification result: `NOT_RUN_APPLY_NOT_CONFIRMED`

Read-only DB verification was not run because local apply did not occur and no explicit read-only verification credentials were present in shell state.

Post-apply verification must remain read-only and should confirm:

- `clans` exists.
- `clan_branches` exists.
- `generation_rules` exists.
- `person_branch_memberships` exists.
- RLS is enabled on all four new tables.
- Expected policies exist on all four new tables.
- No old tables changed unexpectedly.
- `person_names`, `person_life_events`, `person_burials` and `person_media` were not created by this migration.
- No seed rows or backfill rows were inserted.
- `people.branch_name` and `people.generation_number` were not modified.

## RLS/Policy Verification Result

- Static RLS review: `PASS`
- DB RLS verification: `NOT_RUN_APPLY_NOT_CONFIRMED`

Static review confirms the migration enables RLS on all four approved tables and uses existing permissions only:

- Read: `people.view` or `tree.view`
- Insert/update: `people.update`, `relationships.update`, `tree.edit_layout` or `settings.manage`

No public-wide direct table policy and no new permission seed are included in the approved migration file.

## Excluded Scope Verification

- No extra migration file created.
- No approved migration file modification.
- No seed data.
- No production data mutation.
- No automatic backfill from `people.branch_name`.
- No automatic backfill from `people.generation_number`.
- No `person_names` table.
- No `person_life_events` table.
- No `person_burials` table.
- No `person_media` table.
- No media processing.
- No large export/import/GEDCOM/ZIP work.

## Runtime And Worker Impact

- Main Worker touched: NO
- Runtime app code changed: NO
- UI changed: NO
- Runtime dependency added: NO
- New service Worker created: NO
- OpenNext/Wrangler config changed: NO
- Worker size risk introduced by Phase 113: NO
- Deploy run: NO

Large export/import/media/GEDCOM/ZIP processing remains governed by `docs/RUNTIME_WORKER_GUARDRAIL.md` and `docs/SERVICE_BOUNDARY_ROADMAP.md`.

## Remaining Limitations

- DB apply is not confirmed from this workstation.
- Read-only post-apply DB verification is not completed.
- Future runtime/UI/service integration must wait for apply confirmation and read-only verification evidence.

## Required Next Step

Recommended next phase before Phase 114 runtime planning:

Phase 113A - Owner Manual Apply Result Capture And Read-Only Verification.

Phase 114-117 UI/domain integration planning should wait until the exact migration apply result and read-only verification results are recorded.
