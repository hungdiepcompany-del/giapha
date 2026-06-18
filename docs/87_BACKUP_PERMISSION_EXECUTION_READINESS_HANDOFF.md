# Phase 87 - Backup Permission Execution Readiness Handoff

## Current Production Baseline

Production remains on the existing main worker `web-gia-pha`.

Phase 83-87 prepared the backup permission migration execution readiness bundle. It did not run migration, apply schema, mutate DB, read env files, call Supabase/API/DB/network, deploy, push, call the backup service worker, create production backup, upload storage, restore data, or create a schedule.

## Canonical Migration Path

The canonical migration path is:

```txt
db/migrations/20260618_0007_backup_operator_permissions.sql
```

Wrong old path:

```txt
supabase/migrations/20260618_0007_backup_operator_permissions.sql
```

The wrong old path no longer exists after Phase 83.

## Migration File Status

Migration file exists in `db/migrations/`.

Migration has not been run.

No DB mutation has been performed.

The migration content still seeds:

- `backup.operator.view`
- `backup.operator.dry_run`
- `backup.operator.execute`
- `backup.operator.restore`

Expected assignment in the migration file:

- `OWNER`: all four backup operator permissions
- `ADMIN`: view and dry_run only
- Other roles: none

## Phase 83-87 Summary

- Phase 83 corrected the migration path to `db/migrations/` and added the execution runbook.
- Phase 84 added the pre-apply verification checklist.
- Phase 85 added the rollback drill plan.
- Phase 86 added the apply approval gate.
- Phase 87 records this execution readiness handoff.

## Execution Runbook Status

Execution runbook status: ready as documentation.

Checker:

```txt
npm run check:backup-permission-migration-execution-runbook
```

The runbook remains no-run and requires separate owner approval before apply.

## Pre-Apply Checklist Status

Pre-apply checklist status: ready as documentation.

Checker:

```txt
npm run check:backup-permission-pre-apply-verification-checklist
```

Checklist blocks apply if owner approval, DB backup/snapshot, project identity, static checks, rollback owner, smoke owner, role confirmation, or fallback-plan understanding is missing.

## Rollback Drill Status

Rollback drill status: ready as documentation.

Checker:

```txt
npm run check:backup-permission-rollback-drill-plan
```

Rollback is not executed in this bundle.

## Approval Gate Status

Approval gate status: ready as documentation.

Checker:

```txt
npm run check:backup-permission-apply-approval-gate
```

Required marker:

```txt
OWNER_APPROVAL_REQUIRED_BEFORE_APPLYING_BACKUP_PERMISSION_MIGRATION=true
```

## What Is Ready

Ready:

- canonical migration file path
- static migration verification
- execution runbook
- pre-apply checklist
- rollback drill plan
- apply approval gate
- post-migration smoke plan with safe-skip behavior
- local/static checks for the readiness bundle

## What Is Still Blocked

Still blocked:

- running migration
- applying DB changes
- removing fallback `permissions.manage`
- enabling runtime execute behavior
- enabling runtime restore behavior
- deploying backup service worker
- creating production backup
- restoring production data

## Required Owner Approval Before Real Apply

Owner approval is still required before apply.

The owner must explicitly approve the target Supabase project, canonical migration path, DB backup/snapshot, rollback owner, smoke owner, and apply window.

## Required DB Backup/Snapshot

A fresh DB backup/snapshot is required before apply.

Backup/snapshot evidence must not be committed and must not expose secrets in chat or logs.

## Required Post-Apply Smoke

After future apply, run the post-migration smoke only with explicit env:

```txt
BACKUP_PERMISSION_SMOKE_BASE_URL
BACKUP_PERMISSION_SMOKE_EXPECTED_USER
```

Default smoke status without env remains safe-skip.

## Boundary

- No deploy.
- No push.
- No package added.
- Migration file exists in `db/migrations/`.
- Wrong old path `supabase/migrations/20260618_0007_backup_operator_permissions.sql` no longer exists.
- Migration has not been run.
- No DB mutation.
- No DB apply.
- No `.env.local` read.
- No `.dev.vars` read.
- No Supabase/API/DB/network call.
- No backup service worker call.
- No Cloudflare/Supabase/Google API call.
- No production backup.
- No real storage.
- No restore.
- No cron/schedule.
- No GitHub secrets used.
- No domain/Auth/OAuth config change.
- No hardcoded secret/token/key.
- Fallback `permissions.manage` still remains.
- `backup.operator.execute` still not enabled in runtime.
- `backup.operator.restore` still not enabled in runtime.

## Known Notes

- Direct `npm run build` in the root workspace can fail on Windows when `.next` files are locked by ACL/EPERM.
- Clean temp build is the expected verification path when the direct workspace build hits that local artifact.
- `npm audit --audit-level=moderate` still reports known advisories in `esbuild`, `postcss`, and `ws`.
- No `npm audit fix --force` has been run.

## Recommended Next Phase

Recommended options:

- Phase 88 - Backup Permission Real Migration Apply Execution, only if owner explicitly approves running migration/applying DB.
- Phase 88 - Backup Service Worker Manual Deploy Execution, only if owner approves deploy and secrets are ready.
- Phase 88 - Vietnamese Genealogy Domain Model Readiness, if infrastructure work should pause.
