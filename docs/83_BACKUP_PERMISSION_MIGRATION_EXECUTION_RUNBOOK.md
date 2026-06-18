# Phase 83 - Backup Permission Migration Execution Runbook

## Production Baseline

Production remains on the existing main worker `web-gia-pha`.

Phase 83 corrects the repository migration path and prepares an execution runbook. It does not run migration, apply schema, mutate DB, read env files, call Supabase/API/DB/network, deploy, push, call the backup service worker, create production backup, upload storage, restore data, or create a schedule.

## Canonical Migration Directory

Canonical migration path:

```txt
db/migrations/20260618_0007_backup_operator_permissions.sql
```

Canonical migration directory:

```txt
db/migrations/
```

Wrong old path:

```txt
supabase/migrations/20260618_0007_backup_operator_permissions.sql
```

The wrong old path must not remain after Phase 83.

## Migration File Path Correction

Phase 78 created the migration file in the wrong old path. Phase 83 moves the same migration file into `db/migrations/` without changing SQL behavior.

Required state after correction:

- `db/migrations/20260618_0007_backup_operator_permissions.sql` exists.
- `supabase/migrations/20260618_0007_backup_operator_permissions.sql` does not exist.
- No duplicate backup permission migration exists in both directories.

## Migration File Baseline

The migration seeds:

- `backup.operator.view`
- `backup.operator.dry_run`
- `backup.operator.execute`
- `backup.operator.restore`

Approved role assignment shape in the file:

- `OWNER`: all four backup operator permissions
- `ADMIN`: view and dry_run only
- Other roles: none

Migration status: not run.

DB mutation status: none.

## Execution Runbook Goal

This runbook prepares a future manual execution phase. It is intentionally not an execution script and must not be treated as permission to apply DB changes.

## Required Owner Approval

Explicit owner approval is required before running any migration/apply command.

Approval must name the target Supabase project, the migration file path, the apply window, the rollback owner, and the smoke-test owner.

## Required DB Backup/Snapshot

Before any future apply:

- confirm a fresh DB backup/snapshot exists
- record backup/snapshot time outside the repo if it includes sensitive evidence
- confirm restore access
- confirm the rollback owner can reach the backup/snapshot

## Required Pre-Apply Checks

Required local checks before any future apply:

- `npm run check:backup-permission-migration-canonical-path`
- `npm run check:backup-permission-migration-execution-runbook`
- `npm run check:backup-permission-real-migration-static-verification`
- `npm run check:backup-permission-real-migration-file`
- `npm run check:migrations`
- `npm run typecheck`
- `npm run lint`

## Manual Apply Options

Future owner-approved execution may use either a CLI apply path or a Supabase Dashboard SQL editor path.

The executor must confirm the Supabase project identity before any apply. The executor must not paste secrets into docs, logs, commits, or chat.

## CLI Apply Command Placeholders

These placeholders are documented for a future approved execution phase only. They are not run in Phase 83.

```bash
supabase migration up
supabase db push
```

Use only the command style approved for the production Supabase project at execution time.

## Supabase Dashboard Apply Option

A future executor may copy the reviewed SQL from `db/migrations/20260618_0007_backup_operator_permissions.sql` into the Supabase Dashboard SQL editor after owner approval and backup/snapshot confirmation.

Before running, verify the visible project name/reference manually in the dashboard.

## Post-Apply Verification

Post-apply verification must confirm:

- `backup.operator.view` exists in DB
- `backup.operator.dry_run` exists in DB
- `backup.operator.execute` exists in DB but runtime execute remains disabled
- `backup.operator.restore` exists in DB but runtime restore remains disabled
- `OWNER` has all four backup operator permissions
- `ADMIN` has view and dry_run only
- unauthorized roles do not receive backup operator permissions
- `/admin/backups` and `/api/admin/backups/service-dry-run` still fail closed

## Rollback Notes

Rollback planning must be ready before apply:

- know whether to remove role mappings only or restore from DB backup/snapshot
- keep `permissions.manage` fallback until post-migration smoke passes
- do not enable execute/restore runtime behavior during rollback
- document every rollback action in work log and handoff

## No-Run Policy

Phase 83 does not run migration.

Phase 83 does not apply DB changes.

Phase 83 does not connect to Supabase, call network, read secrets, deploy, push, create backups, upload storage, restore data, or create schedules.

## Phase 83 Boundary

- No deploy.
- No push.
- No package added.
- Migration path corrected to `db/migrations/`.
- Migration has not been run.
- No DB apply/mutation.
- No `.env.local` read.
- No `.dev.vars` read.
- No Supabase/API/DB/network call.
- No backup service worker call.
- No production backup.
- No real storage.
- No restore.
- No hardcoded secret/token/key.

## Next Phase

Phase 84 - Backup Permission Pre-Apply Verification Checklist.
