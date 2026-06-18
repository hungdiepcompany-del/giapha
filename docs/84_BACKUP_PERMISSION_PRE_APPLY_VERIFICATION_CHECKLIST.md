# Phase 84 - Backup Permission Pre-Apply Verification Checklist

## Production Baseline

Production remains on the existing main worker `web-gia-pha`.

Phase 84 creates the pre-apply verification checklist for a future owner-approved migration execution. It does not run migration, apply schema, mutate DB, read env files, call Supabase/API/DB/network, deploy, push, call the backup service worker, create production backup, upload storage, restore data, or create a schedule.

## Canonical Migration Path

The canonical migration path is:

```txt
db/migrations/20260618_0007_backup_operator_permissions.sql
```

## Pre-Apply Checklist Goal

The goal is to make a future migration apply decision explicit and auditable before touching a real Supabase project.

This checklist is a gate, not an execution instruction.

## Migration File Verification

Before any future apply:

- confirm the migration file exists at the canonical path
- confirm the wrong old path does not exist
- confirm no duplicate backup permission migration exists
- confirm the file was not changed after review
- confirm `npm run check:backup-permission-migration-canonical-path` passes

## Static Safety Verification

Before any future apply:

- confirm `npm run check:backup-permission-real-migration-static-verification` passes
- confirm `npm run check:backup-permission-real-migration-file` passes
- confirm destructive SQL, production URL text, secret-like text, and runtime execute/restore action wording remain absent

## DB Backup/Snapshot Verification

Before any future apply:

- confirm a fresh DB backup/snapshot exists
- record backup/snapshot time outside the repo if sensitive
- confirm restore access
- confirm rollback owner can access the recovery path

## Environment Identity Verification

Before any future apply:

- confirm the target Supabase project name/reference in the dashboard or CLI context
- confirm the environment is the intended production or staging target
- do not paste secrets into docs, logs, commits, or chat
- do not continue if the project identity is ambiguous

## Owner Approval Verification

Before any future apply:

- owner approval must explicitly mention the migration path
- owner approval must identify the target Supabase project
- owner approval must confirm DB backup/snapshot readiness
- owner approval must confirm rollback owner and smoke owner
- owner approval must confirm the apply window

## Permission Assignment Verification

Expected assignment after approved migration:

- `OWNER`: `backup.operator.view`, `backup.operator.dry_run`, `backup.operator.execute`, `backup.operator.restore`
- `ADMIN`: `backup.operator.view`, `backup.operator.dry_run`
- Other roles: none

## Fallback Behavior Verification

Runtime fallback `permissions.manage` must remain until post-migration smoke passes and owner separately approves removal.

Do not remove fallback in the migration apply phase.

## No-Go Conditions

NO-GO if:

- owner approval missing
- DB backup/snapshot missing
- wrong Supabase project
- migration file changed after review
- static checks not passing
- canonical path check not passing
- rollback owner missing
- post-migration smoke owner missing
- expected roles not confirmed
- fallback removal plan not understood

## No-Apply Policy

Phase 84 does not run migration.

Phase 84 does not apply DB changes.

Phase 84 does not connect to Supabase, call network, read secrets, deploy, push, create backups, upload storage, restore data, or create schedules.

## Phase 84 Boundary

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

Phase 85 - Backup Permission Rollback Drill Plan.
