# Phase 80 - Backup Permission Runtime Fallback Removal Plan

## Production Baseline

Production remains on the existing main worker `web-gia-pha`.

Phase 80 does not deploy, push, run migrations, apply schema, mutate DB, read env files, call Supabase/API/DB/network, call the backup service worker, create production backup, upload storage, restore data, or create a schedule.

## Current Runtime Fallback Status

Current fallback:

```txt
permissions.manage
```

The fallback remains in:

- `/api/admin/backups/service-dry-run`
- `/admin/backups`

## Fallback Removal Goal

Plan how to remove fallback `permissions.manage` after the backup permission migration is applied in a future approved phase.

Phase 80 does not remove fallback from runtime.

## Preconditions Before Removal

Do not remove fallback until:

- migration has been applied
- `backup.operator.view` exists in DB
- `backup.operator.dry_run` exists in DB
- expected roles have assignments
- smoke test passes with real user
- rollback plan is ready
- owner approves fallback removal

## Required DB Migration Applied Confirmation

Before fallback removal:

- confirm migration file has been applied
- confirm DB contains the backup permission rows
- confirm `OWNER` and `ADMIN` role mappings match approval
- confirm viewer/public roles do not have backup permissions

## Required Permission Assignment Confirmation

Expected assignment after approved migration:

- `OWNER`: view, dry_run, execute, restore
- `ADMIN`: view, dry_run
- Other roles: none

## API Fallback Removal Plan

Future API change after validation:

- remove `FALLBACK_DRY_RUN_PERMISSION = "permissions.manage"`
- require only `backup.operator.dry_run`
- keep JSON 401/403 fail-closed behavior
- re-run API permission guard checks and smoke tests

## UI Fallback Removal Plan

Future UI change after validation:

- remove `FALLBACK_VIEW_PERMISSION = "permissions.manage"`
- require only `backup.operator.view`
- keep unauthenticated redirect and unauthorized redirect behavior
- re-run UI permission guard checks and smoke tests

## Post-Removal Smoke Plan

After fallback removal:

- OWNER should access `/admin/backups`
- intended ADMIN should access `/admin/backups`
- unauthorized user should receive unauthorized behavior
- API dry-run should return success only for users with `backup.operator.dry_run`
- API dry-run should return JSON 401/403 for unauthorized users
- execute/restore must remain not enabled unless separately approved

## Rollback Plan

If fallback removal breaks access:

- restore `permissions.manage` fallback in API/UI
- re-run permission guard checks
- verify DB assignments
- document failed role/user case
- do not broaden assignments without owner approval

## No-Runtime-Change Policy

Phase 80 is docs/check only.

It does not modify runtime fallback. `permissions.manage` must remain in the current API and UI guard files during this phase.

## Phase 80 Boundary

- No deploy.
- No push.
- No package added.
- No migration run.
- No DB apply/mutation.
- No runtime fallback removal.
- No `.env.local` read.
- No `.dev.vars` read.
- No Supabase/API/DB/network call.
- No backup service worker call.
- No production backup.
- No real storage.
- No restore.
- No hardcoded secret/token/key.

## Next Phase

Phase 81 - Backup Permission Post-Migration Smoke Plan.
