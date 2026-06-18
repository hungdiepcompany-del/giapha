# Phase 82 - Backup Permission Real Migration Handoff

## Current Production Baseline

Production remains on the existing main worker `web-gia-pha`.

Phase 78-82 created and verified a migration file in the repository, but did not run migration, apply schema, mutate DB, read env files, call Supabase/API/DB/network, deploy, push, call the backup service worker, create production backup, upload storage, restore data, or create a schedule.

## Backup Operator Permission Current Status

Current runtime status remains unchanged:

- `/admin/backups` is guarded by `backup.operator.view` with fallback `permissions.manage`.
- `/api/admin/backups/service-dry-run` is guarded by `backup.operator.dry_run` with fallback `permissions.manage`.
- Runtime remains dry-run-only.
- `backup.operator.execute` and `backup.operator.restore` are still not enabled.
- fallback `permissions.manage` still remains until post-migration phase.

## Phase 78-82 Summary

Phase 78-82 completed the real migration file bundle:

- Phase 78 created the migration file in `supabase/migrations/`.
- Phase 79 added static verification for the migration file.
- Phase 80 documented fallback removal plan.
- Phase 81 added post-migration smoke plan/script with safe-skip.
- Phase 82 records this handoff.

## Real Migration File Status

Migration file exists in `supabase/migrations/`:

```txt
supabase/migrations/20260618_0007_backup_operator_permissions.sql
```

Migration has not been run.

The migration file contains:

- `backup.operator.view`
- `backup.operator.dry_run`
- `backup.operator.execute`
- `backup.operator.restore`

The migration assigns:

- `OWNER`: all four backup permissions
- `ADMIN`: view and dry_run
- Other roles: none

## Static Verification Status

Static verification status: implemented and passing.

Command:

```txt
npm run check:backup-permission-real-migration-static-verification
```

The check validates markers, permission names, filename pattern, idempotency, allowed role assignments, no destructive SQL, no network text, no secret-like text, and no runtime execute/restore action wording.

## Fallback Removal Plan Status

Fallback removal plan status: documented only.

Command:

```txt
npm run check:backup-permission-runtime-fallback-removal-plan
```

Runtime fallback remains:

```txt
permissions.manage
```

Fallback must not be removed until migration is applied, DB permissions exist, expected roles have assignments, real-user smoke passes, rollback is ready, and owner approves.

## Post-Migration Smoke Plan Status

Post-migration smoke plan status: implemented as safe-skip.

Commands:

```txt
npm run smoke:backup-permission:post-migration
npm run check:backup-permission-post-migration-smoke-plan
```

Without explicit env, smoke returns skipped:

```txt
SKIPPED because BACKUP_PERMISSION_SMOKE_BASE_URL is not set
```

## What Is Implemented

- Real migration file in `supabase/migrations/`.
- Migration file checker.
- Static verification checker.
- Runtime fallback removal plan.
- Post-migration smoke plan and safe-skip smoke script.
- Real migration handoff.
- Package scripts and docs index/work log/decision log/handoff updates.

## What Is Not Implemented

- Migration has not been run.
- No DB mutation.
- No deploy.
- No production backup.
- No real storage.
- No restore.
- No fallback removal.
- No runtime execute action.
- No runtime restore action.
- No secret committed.
- `backup.operator.execute` still not enabled.
- `backup.operator.restore` still not enabled.

## Required Future Migration Execution Approval

A future phase must get explicit owner approval before running migration or applying DB changes.

That future phase must confirm:

- DB backup/snapshot exists
- rollback plan is ready
- production window is known
- migration file static verification passes
- expected role assignments are approved
- execute/restore runtime remains disabled unless separately approved

## Required Future DB Backup/Snapshot

Before migration execution:

- create or confirm DB backup/snapshot
- record backup/snapshot time
- confirm restore access
- keep sensitive backup evidence outside chat and outside repo

## Required Rollback Plan

Rollback plan must cover:

- removing unintended `role_permissions`
- deciding whether permission rows remain for audit/reference history
- restoring fallback `permissions.manage` if needed
- verifying unauthorized roles remain denied
- recording rollback owner and decision path

## Boundary

Phase 82 keeps the full bundle boundary:

- No deploy.
- No push.
- No package added.
- Migration file exists in `supabase/migrations/`.
- Migration has not been run.
- No DB apply/mutation.
- No `.env.local` read.
- No `.dev.vars` read.
- No Supabase/API/DB/network call.
- No backup service worker call.
- No Cloudflare/Supabase/Google API call.
- No bucket/folder/storage creation.
- No production backup.
- No real storage.
- No restore.
- No cron/schedule.
- No GitHub secrets used.
- No domain/Auth/OAuth config change.
- No hardcoded secret/token/key.

## Known Notes

- Direct `npm run build` in the root workspace can fail on Windows when `.next` files are locked by ACL/EPERM.
- Clean temp build is the expected verification path when the direct workspace build hits that local artifact.
- `npm audit --audit-level=moderate` still reports known advisories in `esbuild`, `postcss`, and `ws`.
- No `npm audit fix --force` has been run.

## Recommended Next Phase

Recommended options:

- Phase 83 - Backup Permission Migration Execution Runbook, if owner is preparing for apply DB but does not want to run it yet.
- Phase 83 - Backup Permission Real Migration Apply Execution, only if owner explicitly approves running migration/applying DB.
- Phase 83 - Backup Service Worker Manual Deploy Execution, only if owner approves deploy and secrets are ready.
- Phase 83 - Vietnamese Genealogy Domain Model Readiness, if infrastructure work should pause.
