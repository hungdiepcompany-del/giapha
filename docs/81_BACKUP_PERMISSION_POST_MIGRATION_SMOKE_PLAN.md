# Phase 81 - Backup Permission Post-Migration Smoke Plan

## Production Baseline

Production remains on the existing main worker `web-gia-pha`.

Phase 81 does not deploy, push, run migrations, apply schema, mutate DB, read env files, call Supabase/API/DB directly, call the backup service worker, create production backup, upload storage, restore data, or create a schedule.

## Post-Migration Smoke Goal

Create a safe post-migration smoke plan and script for a future approved phase after the migration has been applied.

The smoke script safe-skips unless explicit smoke environment variables are provided.

## Smoke Env Placeholders

Explicit env placeholders:

```txt
BACKUP_PERMISSION_SMOKE_BASE_URL
BACKUP_PERMISSION_SMOKE_EXPECTED_USER
```

No token is required and no token should be printed.

## Safe Skip Behavior

If `BACKUP_PERMISSION_SMOKE_BASE_URL` is missing, expected result is:

```txt
SKIPPED because BACKUP_PERMISSION_SMOKE_BASE_URL is not set
```

If `BACKUP_PERMISSION_SMOKE_EXPECTED_USER` is missing, expected result is:

```txt
SKIPPED because BACKUP_PERMISSION_SMOKE_EXPECTED_USER is not set
```

The script must not call any URL unless both env values are explicitly set.

## API/UI Smoke Scope

When explicit env is set, the smoke scope is limited to:

- `/api/admin/backups/service-dry-run`
- `/admin/backups`

The script is intended to confirm safe route behavior only. It must not call the backup service worker directly.

## Permission Expectations

Post-migration expectations:

- intended `OWNER` user can access backup operator UI
- intended `ADMIN` user can access backup operator UI if assigned
- API dry-run remains guarded by `backup.operator.dry_run`
- unauthorized users receive fail-closed behavior
- `backup.operator.execute` remains not enabled unless separately approved
- `backup.operator.restore` remains not enabled unless separately approved

## No-Real-Backup Policy

The smoke must not trigger:

- production backup
- storage upload
- restore
- backup service worker call
- cron/schedule
- DB mutation

## Failure Handling

If smoke fails after migration apply:

- do not remove fallback `permissions.manage`
- verify DB permission rows and role mappings
- verify expected user has the right role
- keep execute/restore disabled
- record failure in work log and handoff

## Phase 81 Boundary

- No deploy.
- No push.
- No package added.
- No migration run.
- No DB apply/mutation.
- No `.env.local` read.
- No `.dev.vars` read.
- No Supabase/API/DB direct call.
- No backup service worker call.
- No production backup.
- No real storage.
- No restore.
- No hardcoded secret/token/key.

## Next Phase

Phase 82 - Backup Permission Real Migration Handoff.
