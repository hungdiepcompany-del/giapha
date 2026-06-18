# Phase 86 - Backup Permission Apply Approval Gate

## Production Baseline

Production remains on the existing main worker `web-gia-pha`.

Phase 86 creates the final approval gate for a future backup permission migration apply. It does not run migration, apply schema, mutate DB, read env files, call Supabase/API/DB/network, deploy, push, call the backup service worker, create production backup, upload storage, restore data, or create a schedule.

## Canonical Migration Path

The canonical migration path is:

```txt
db/migrations/20260618_0007_backup_operator_permissions.sql
```

## Apply Approval Goal

The goal is to make the final owner approval requirements explicit before any future execution phase runs the migration.

This approval gate is documentation and local static verification only.

## Required Owner Approval Statement

Required marker:

```txt
OWNER_APPROVAL_REQUIRED_BEFORE_APPLYING_BACKUP_PERMISSION_MIGRATION=true
```

The owner must explicitly approve running/applying this migration in a future phase. Creating this gate is not approval to apply.

## Required Supabase Project Confirmation

Before future apply:

- confirm the Supabase project name/reference
- confirm the environment target
- confirm the operator is not pointing at the wrong project
- do not continue if identity is ambiguous

## Required Backup/Snapshot Confirmation

Before future apply:

- confirm a fresh DB backup/snapshot exists
- confirm restore access
- record backup/snapshot time outside the repo if sensitive
- confirm rollback owner can use the recovery path

## Required Local Validation

Before future apply:

- `npm run check:backup-permission-apply-approval-gate`
- `npm run check:backup-permission-rollback-drill-plan`
- `npm run check:backup-permission-pre-apply-verification-checklist`
- `npm run check:backup-permission-migration-canonical-path`
- `npm run check:backup-permission-migration-execution-runbook`
- `npm run check:backup-permission-real-migration-static-verification`
- `npm run check:migrations`
- `npm run typecheck`
- `npm run lint`

## Required Rollback Owner

A named rollback owner must be available before apply.

The rollback owner must know the approved rollback option and whether restore-from-snapshot is allowed.

## Required Smoke Owner

A named smoke owner must be available before apply.

The smoke owner must confirm post-apply behavior for `/admin/backups` and `/api/admin/backups/service-dry-run`.

## Required Apply Window

The owner must approve an apply window with enough time for:

- final local validation
- migration apply
- post-apply verification
- rollback decision if needed
- work log and handoff updates

## Explicit No-Go Conditions

NO-GO if:

- owner approval marker is absent
- owner approval is not explicit for this migration
- Supabase project confirmation is missing
- DB backup/snapshot confirmation is missing
- rollback owner is missing
- smoke owner is missing
- apply window is missing
- local validation is failing
- fallback removal is bundled into the apply
- execute/restore runtime enablement is bundled into the apply

## No-Apply Policy

Phase 86 does not run migration.

Phase 86 does not apply DB changes.

Phase 86 does not connect to Supabase, call network, read secrets, deploy, push, create backups, upload storage, restore data, or create schedules.

## Phase 86 Boundary

- No deploy.
- No push.
- No package added.
- No migration run.
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

Phase 87 - Backup Permission Execution Readiness Handoff.
