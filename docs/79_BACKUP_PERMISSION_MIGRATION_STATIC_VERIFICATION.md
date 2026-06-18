# Phase 79 - Backup Permission Migration Static Verification

## Production Baseline

Production remains on the existing main worker `web-gia-pha`.

Phase 79 does not deploy, push, run migrations, apply schema, mutate DB, read env files, call Supabase/API/DB/network, call the backup service worker, create production backup, upload storage, restore data, or create a schedule.

## Static Verification Goal

Add stronger static verification for the real migration file created in Phase 78.

This verification reads the migration source only. It does not run SQL and does not connect to a database.

## Migration File Under Review

```txt
db/migrations/20260618_0007_backup_operator_permissions.sql
```

The filename follows the repo pattern `YYYYMMDD_000N_name.sql`.

Phase 83 corrected the repository path. The canonical migration directory is `db/migrations/`.

## Required Markers

The migration must include:

- `BACKUP_PERMISSION_REAL_MIGRATION_FILE`
- `OWNER_APPROVED_FILE_CREATION_ONLY`
- `DO_NOT_RUN_WITHOUT_SEPARATE_OWNER_APPROVAL`

## Permission Verification

The migration must include:

- `backup.operator.view`
- `backup.operator.dry_run`
- `backup.operator.execute`
- `backup.operator.restore`

## Role Assignment Verification

The current repo role equivalent of prompt-level `SYSTEM_ADMIN` is `OWNER`.

Allowed role assignment in this migration:

- `OWNER`: view, dry_run, execute, restore
- `ADMIN`: view, dry_run
- Viewer/public/anonymous roles: none

The migration must not assign backup permissions to `EDITOR`, `CONTRIBUTOR`, `FAMILY_VIEWER`, `PUBLIC_VIEWER`, or anonymous/public users.

## Forbidden Patterns

The checker rejects destructive SQL, secret-like text, production URLs, network-related text, and runtime activation wording.

Forbidden examples:

- `drop table`
- `drop schema`
- `truncate`
- `delete from`
- `alter table ... drop`
- `create extension`
- `grant all`
- `revoke all`
- `security definer`
- `http`
- `https`
- `service_role`
- `anon key`
- `jwt secret`
- `executeBackup`
- `restoreBackup`

## Idempotency Verification

The migration must include an idempotency concept such as `on conflict` or `where not exists`.

Current migration uses `on conflict`.

## No-Run Policy

Phase 79 does not run migration and does not apply DB changes.

The migration still requires separate owner approval before any execution.

## Phase 79 Boundary

- No deploy.
- No push.
- No package added.
- Migration file exists.
- Real migration run: no.
- DB apply/mutation: no.
- No `.env.local` read.
- No `.dev.vars` read.
- No Supabase/API/DB/network call.
- No backup service worker call.
- No production backup.
- No real storage.
- No restore.
- No hardcoded secret/token/key.

## Next Phase

Phase 80 - Backup Permission Runtime Fallback Removal Plan.
