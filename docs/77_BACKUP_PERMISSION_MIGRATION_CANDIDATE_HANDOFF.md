# Phase 77 - Backup Permission Migration Candidate Handoff

## Current Production Baseline

Production remains on the existing main worker `web-gia-pha`.

Phase 73-77 did not deploy, push, create a real migration, run migrations, apply schema, mutate DB, read env files, call Supabase/API/DB/network, call the backup service worker, create production backup, upload storage, restore data, or create a schedule.

## Backup Operator Permission Current Status

Current runtime status remains unchanged:

- `/admin/backups` is guarded by `backup.operator.view` with fallback `permissions.manage`.
- `/api/admin/backups/service-dry-run` is guarded by `backup.operator.dry_run` with fallback `permissions.manage`.
- The fallback `permissions.manage` remains because `backup.operator.*` permission rows have not been seeded in DB.
- Runtime remains dry-run-only.
- `backup.operator.execute` and `backup.operator.restore` are still not enabled.

## Phase 73-77 Summary

Phase 73-77 completed the migration candidate bundle:

- Phase 73 created a SQL candidate draft outside real migration folders.
- Phase 74 added static SQL safety checks.
- Phase 75 added local seed candidate smoke.
- Phase 76 added the real migration approval checklist.
- Phase 77 records this migration candidate handoff.

No migration/schema in Phase 73-77. No DB mutation. No real worker call. No deploy.

## SQL Candidate Status

SQL candidate status: draft only.

Path:

```txt
scripts/backup-permission-sql-candidate.sql.draft
```

The SQL candidate is not real migration and is not in `supabase/migrations/`.

Markers:

- `BACKUP_PERMISSION_SQL_CANDIDATE_ONLY`
- `DO_NOT_RUN_ON_PRODUCTION_WITHOUT_OWNER_APPROVAL`

Candidate permissions:

- `backup.operator.view`
- `backup.operator.dry_run`
- `backup.operator.execute`
- `backup.operator.restore`

Candidate role assignment:

- `OWNER`: all four backup permissions
- `ADMIN`: view and dry_run
- Other roles: none by default

## Static Safety Status

Static safety status: local source check added.

Command:

```txt
npm run check:backup-permission-sql-static-safety
```

The safety check rejects destructive SQL, network URL patterns, `service_role`, `anon key`, `jwt secret`, and missing required markers.

## Seed Candidate Smoke Status

Seed candidate smoke status: local source smoke added.

Commands:

```txt
npm run smoke:backup-permission:seed-candidate
npm run check:backup-permission-seed-candidate-smoke
```

The smoke checks that the SQL candidate and seed dry-run script agree on the four backup permission names and no-production marker. It does not run SQL, call DB, call network, read env, or mutate files.

## Approval Checklist Status

Approval checklist status: documented only.

Command:

```txt
npm run check:backup-permission-real-migration-approval-checklist
```

Required approval marker:

```txt
OWNER_APPROVAL_REQUIRED_BEFORE_BACKUP_PERMISSION_REAL_MIGRATION=true
```

A future real migration still requires explicit owner approval, SQL review, DB backup/snapshot, rollback plan, production window, post-migration validation, permission assignment confirmation, fallback removal plan, and execute/restore boundary confirmation.

## What Is Implemented

- SQL candidate draft.
- SQL candidate draft checker.
- SQL static safety checker.
- Seed candidate smoke.
- Seed candidate smoke checker.
- Real migration approval checklist.
- Migration candidate handoff.
- Package scripts and docs index/work log/decision log/handoff updates.

## What Is Not Implemented

- SQL candidate is not real migration.
- No file in `supabase/migrations/`.
- No migration/schema in Phase 73-77.
- No DB mutation.
- No real permission seed.
- No real role assignment.
- No fallback removal.
- No real worker call.
- No deploy.
- No production backup.
- No real storage.
- No restore.
- No cron/schedule.
- No secret committed.
- `backup.operator.execute` still not enabled.
- `backup.operator.restore` still not enabled.

## Required Future Real Migration

A future approved phase may create a real migration file after owner approval.

That future phase must:

- create the real migration file in the approved migrations folder
- keep SQL idempotent
- apply only approved permission rows and role mappings
- keep execute/restore runtime disabled unless separately approved
- update rollback and validation evidence
- run migration checks before any real apply

## Required Future DB Backup/Snapshot

Before any real DB apply:

- DB backup/snapshot must exist
- backup/snapshot time must be recorded
- restore access must be confirmed
- backup evidence must not expose sensitive data in chat or repo

## Required Rollback Plan

Rollback plan must be ready before real apply:

- remove unintended role mappings
- decide whether permission rows remain for audit/reference history
- restore fallback `permissions.manage` if needed
- verify unauthorized roles remain denied
- record rollback owner and decision path

## Boundary

Phase 77 keeps the full bundle boundary:

- No deploy.
- No push.
- No package added.
- No migration/schema/data mutation.
- No real migration file.
- No file in `supabase/migrations/`.
- No real migration run.
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

- Phase 78 - Backup Permission Real Migration File Implementation, only if owner explicitly approves real migration/schema creation.
- Phase 78 - Backup Service Worker Manual Deploy Execution, only if owner explicitly approves deploy and secrets are ready.
- Phase 78 - Vietnamese Genealogy Domain Model Readiness, if infrastructure work should pause.
