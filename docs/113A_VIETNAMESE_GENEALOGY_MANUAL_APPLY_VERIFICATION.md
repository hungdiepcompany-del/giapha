# Phase 113A - Vietnamese Genealogy Manual Apply Verification

Status: `OWNER_CONFIRMED_APPLIED_VERIFICATION_SAFE_SKIPPED`

Apply status: `OWNER_CONFIRMED_APPLIED`

DB verification status: `SKIPPED_MISSING_EXPLICIT_VERIFICATION_CREDENTIALS`

## Summary

Phase 113A records the owner/operator confirmation that the Phase 111 Vietnamese genealogy migration was manually applied through the Supabase Dashboard SQL Editor.

Codex did not apply DB changes in this phase, did not rerun the migration and did not execute SQL mutation. The migration checksum was recomputed locally and still matches the owner-approved fingerprint.

Read-only DB verification was prepared as a shell-env-only verifier, but was safe-skipped because explicit verification credentials were not present in the current shell.

## Owner Confirmation Received

Owner/operator confirmation:

```txt
OWNER CONFIRMED MANUAL APPLY SUCCESS
Migration applied: db/migrations/20260618_0008_vietnamese_genealogy_first_migration.sql
Target Supabase project ref: frkyeuxrlcflmsxxsolp
Expected SHA256: 522B11AF4D8BDA4F1E29AB63C49C9718129ADF1B27F3F2119BB40D9F7214EA5F
Apply method: Supabase Dashboard SQL Editor
Apply result: SUCCESS
```

## Target Project Ref

`frkyeuxrlcflmsxxsolp`

## Migration File Path

`db/migrations/20260618_0008_vietnamese_genealogy_first_migration.sql`

## Migration Fingerprint

- Expected SHA256: `522B11AF4D8BDA4F1E29AB63C49C9718129ADF1B27F3F2119BB40D9F7214EA5F`
- Actual SHA256: `522B11AF4D8BDA4F1E29AB63C49C9718129ADF1B27F3F2119BB40D9F7214EA5F`
- Checksum result: `PASS`

## Manual Apply Method

`Supabase Dashboard SQL Editor`

## Apply Status

`OWNER_CONFIRMED_APPLIED`

The owner/operator reported successful manual apply of the exact approved migration file to the target Supabase project.

## DB Verification Status

`SKIPPED_MISSING_EXPLICIT_VERIFICATION_CREDENTIALS`

The read-only verifier was prepared, but the current shell did not provide all required explicit env values:

- `VIET_GENEALOGY_VERIFY_SUPABASE_URL`
- `VIET_GENEALOGY_VERIFY_SUPABASE_SERVER_KEY`
- `VIET_GENEALOGY_VERIFY_MODE=read_only`

No Supabase client was created before these env values were present. No `.env.local` or `.dev.vars` file was read.

## RLS/Policy Verification Status

`SKIPPED_MISSING_EXPLICIT_VERIFICATION_CREDENTIALS`

Static review from Phase 111-113 remains unchanged:

- `clans` RLS is enabled in the migration.
- `clan_branches` RLS is enabled in the migration.
- `generation_rules` RLS is enabled in the migration.
- `person_branch_memberships` RLS is enabled in the migration.
- Read policies use `people.view` or `tree.view`.
- Insert/update policies use `people.update`, `relationships.update`, `tree.edit_layout` or `settings.manage`.
- No public-wide direct table policy is included.
- No new permission seed is included.

DB-level RLS/policy verification still needs explicit read-only verification credentials.

## Excluded Scope Verification Status

`SKIPPED_MISSING_EXPLICIT_VERIFICATION_CREDENTIALS`

Static source verification remains `PASS`:

- No migration file modification.
- No new migration file.
- No local DB apply by Codex.
- No migration rerun by Codex.
- No SQL mutation executed by Codex.
- No seed/backfill code or command added.
- No runtime app code change.
- No UI change.

DB-level excluded-scope verification still needs explicit read-only verification credentials to confirm:

- `person_names` was not created.
- `person_life_events` was not created.
- `person_burials` was not created.
- `person_media` was not created.
- The four new lineage tables have no unexpected seed/backfill rows.

## Runtime And Worker Impact

- Main Worker touched: NO
- Runtime app code changed: NO
- UI changed: NO
- Runtime dependency added: NO
- New service Worker created: NO
- OpenNext/Wrangler config changed: NO
- Worker size risk introduced by Phase 113A: NO
- Deploy run: NO

Large export/import/media/GEDCOM/ZIP processing remains governed by `docs/RUNTIME_WORKER_GUARDRAIL.md` and `docs/SERVICE_BOUNDARY_ROADMAP.md`.

## Remaining Limitations

- Owner manual apply is recorded, but DB verification is not independently completed from this shell.
- RLS/policy status is still static-source verified only.
- Excluded table absence and no seed/backfill row checks still need read-only DB verification.
- Phase 114-117 should wait for credential-assisted read-only verification before runtime/UI planning.

## Next Phase Recommendation

Run a credential-assisted read-only verification phase before Phase 114-117.

Recommended next phase: Phase 113B - Credential-Assisted Vietnamese Genealogy Read-Only DB Verification.
