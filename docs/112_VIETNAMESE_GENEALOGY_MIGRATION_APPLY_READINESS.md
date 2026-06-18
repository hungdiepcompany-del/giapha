# Phase 112 - Vietnamese Genealogy Migration Apply Readiness

Status: `APPLY_READINESS_ONLY`

Apply status: `NOT_APPLIED`

Required next phase: Phase 113 apply execution only with separate explicit owner approval.

## Summary

Phase 112 prepares the apply-readiness package for the Phase 111 Vietnamese genealogy migration file. It reviews the existing migration file, records a content fingerprint, defines pre-apply conditions, documents rollback/no-go criteria and prepares a post-apply verification plan.

This phase does not apply DB changes, execute SQL, run Supabase commands, mutate production data, modify the Phase 111 migration file, create a new migration, deploy, change runtime app code, change UI, create a Worker, change OpenNext/Wrangler config or add runtime dependencies.

## Migration File Path

`db/migrations/20260618_0008_vietnamese_genealogy_first_migration.sql`

Phase 111 commit: `a138afe`

Migration status: `NOT_APPLIED`

## Migration Checksum Or Content Fingerprint

SHA256:

```txt
522B11AF4D8BDA4F1E29AB63C49C9718129ADF1B27F3F2119BB40D9F7214EA5F
```

The checksum was computed locally from `db/migrations/20260618_0008_vietnamese_genealogy_first_migration.sql` during Phase 112. Phase 113 must recompute and compare the checksum before any DB apply.

## Approved Scope

Approved tables in the migration:

- `clans`
- `clan_branches`
- `generation_rules`
- `person_branch_memberships`

The migration is additive-only. It creates the approved tables, indexes, constraints, update triggers and RLS policies.

## Explicitly Excluded Scope

Phase 112 and the Phase 111 migration exclude:

- `person_names`
- `person_life_events`
- `person_burials`
- `person_media`
- media processing
- large export/import/GEDCOM/ZIP work
- runtime app changes
- UI changes
- Worker or service creation
- seed data
- production data mutation
- automatic backfill from `people.branch_name`
- automatic backfill from `people.generation_number`
- DB apply

## Migration Review Result

Readiness review result: `READY_FOR_PHASE_113_APPROVAL_REQUEST`

Static review found the Phase 111 migration file still matches the approved scope:

- Required Phase 111 markers are present.
- Only the four approved tables are created.
- RLS is enabled for all four new tables.
- RLS policies use existing permissions only.
- No public-wide direct table access is added.
- No seed data is inserted.
- No existing `people`, relationship, tree layout, revision, export or backup tables are altered.
- No DB apply command is present.

This does not mean the migration is applied or safe to apply without a backup. Phase 113 remains blocked until the owner explicitly approves DB apply.

## Pre-Apply Checklist

Before Phase 113 owner approval, all of the following must be true:

- Owner explicitly approves Phase 113 DB apply.
- Correct Supabase project ref confirmed.
- Current database backup/snapshot completed.
- Migration file path confirmed.
- Migration checksum/fingerprint recorded.
- RLS policies reviewed.
- Rollback owner confirmed.
- Post-apply verification command/checklist ready.
- No-go conditions reviewed.

## Owner Approval Checklist

Phase 113 must not start unless the owner explicitly confirms:

- Approval is for DB apply, not just file creation.
- The target project is the intended Supabase project.
- The current backup/snapshot is acceptable for rollback.
- The migration path is exactly `db/migrations/20260618_0008_vietnamese_genealogy_first_migration.sql`.
- The migration checksum matches the Phase 112 fingerprint or any difference has been reviewed.
- The owner understands this apply creates four new lineage metadata tables.
- The owner understands `person_names`, life events, burials and media remain excluded.
- The owner accepts the rollback plan and no-go conditions.

## Supabase Project Confirmation Checklist

Before apply, record without secrets:

- Supabase project ref.
- Supabase project display name.
- Environment type: local/staging/production.
- Operator name or owner confirmation source.
- Current app deployment target, if relevant.
- Confirmation that no other Supabase project is selected in the current shell/tooling.
- Confirmation that no secret values are pasted into chat or committed to the repo.

Do not read `.env.local` for this readiness phase. Phase 113 should use explicit owner-provided shell state or owner-operated dashboard steps, not repo-stored secrets.

## DB Backup/Snapshot Checklist

Before apply, confirm:

- Backup/snapshot completed after the last production data change.
- Backup/snapshot timestamp recorded.
- Backup/snapshot storage location known to the owner/operator.
- Restore method understood.
- Restore owner/operator identified.
- Backup includes schema and data needed to recover from a failed apply.
- Backup retention is long enough to cover apply and verification.
- No apply proceeds if backup/snapshot status is unknown.

## RLS/Privacy Verification Checklist

Before apply, review that the migration:

- Enables RLS on `clans`.
- Enables RLS on `clan_branches`.
- Enables RLS on `generation_rules`.
- Enables RLS on `person_branch_memberships`.
- Uses `people.view` or `tree.view` for authenticated non-deleted row reads.
- Uses `people.update`, `relationships.update`, `tree.edit_layout` or `settings.manage` for insert/update.
- Adds no public-wide direct table policy.
- Adds no new permission seed.
- Keeps public output dependent on future server-side DTO/privacy filtering.
- Does not expose living-person branch membership directly to public clients.

## Rollback/No-Go Plan

No-go conditions:

- Chua xac nhan dung Supabase project.
- Chua backup/snapshot DB.
- Chua hieu rollback path.
- Migration checker khong PASS.
- Migration contains scope outside approved tables.
- RLS/privacy chua ro.
- Owner chua approve Phase 113 rieng.
- Migration checksum differs from the Phase 112 fingerprint and the difference has not been reviewed.
- Any apply operator is unsure which project or environment is targeted.
- Any required credential or secret would need to be pasted into chat or committed.

Rollback plan:

- Stop immediately if apply fails or verification shows missing RLS/policies.
- Do not run ad hoc destructive cleanup in production.
- Use the owner-confirmed backup/snapshot restore path.
- Preserve logs/error messages without exposing secrets.
- Re-run post-restore read-only verification after rollback.
- Record the result in the work log and handoff before retrying.

## Post-Apply Verification Plan

Prepare, but do not run DB verification in Phase 112:

- Verify tables exist.
- Verify RLS enabled.
- Verify expected policies exist.
- Verify no old tables changed unexpectedly.
- Verify people/families/tree/export routes still build.
- Verify no runtime/Worker changes occurred.
- Verify `person_names`, `person_life_events`, `person_burials` and `person_media` were not created by this migration.
- Verify no seed rows or backfill rows were inserted.
- Verify `people.branch_name` and `people.generation_number` were not modified.

If a future verifier script is created, it must safe-skip when explicit shell env is missing, must not read `.env.local`, must not print secrets and must use read-only checks only.

## Runtime/Worker Impact Confirmation

- Main Worker touched: NO
- Runtime dependency added: NO
- New service Worker created: NO
- OpenNext/Wrangler config changed: NO
- Worker size risk introduced by Phase 112: NO
- Runtime app code changed: NO
- UI changed: NO
- Heavy export/import/media work: deferred to boundary-governed future phases

Large export/import/media/GEDCOM/ZIP processing remains governed by `docs/RUNTIME_WORKER_GUARDRAIL.md` and `docs/SERVICE_BOUNDARY_ROADMAP.md`.

## Apply Status

`NOT_APPLIED`

Phase 112 is not an apply approval and must not be interpreted as permission to run DB changes.

## Required Next Phase

Phase 113 may apply DB only if the owner explicitly approves DB apply after reviewing this readiness package.
