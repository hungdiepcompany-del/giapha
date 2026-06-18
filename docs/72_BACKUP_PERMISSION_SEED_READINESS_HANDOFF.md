# Phase 72 - Backup Permission Seed Readiness Handoff

## Current Production Baseline

Production remains on the existing main worker `web-gia-pha`.

Phase 68-72 did not deploy, push, run migrations, apply schema, mutate DB, read env files, call production network/API/DB, call Supabase, call the backup service worker, create production backup, upload storage, restore data, or create a schedule.

## Backup Operator Permission Current Status

Current runtime status:

- `/admin/backups` is guarded by `backup.operator.view` with fallback `permissions.manage`.
- `/api/admin/backups/service-dry-run` is guarded by `backup.operator.dry_run` with fallback `permissions.manage`.
- The fallback `permissions.manage` remains because `backup.operator.*` permission rows have not been seeded in DB.
- Runtime remains dry-run-only.
- `backup.operator.execute` and `backup.operator.restore` are still not enabled.

## Phase 68-72 Summary

Phase 68-72 completed the permission seed readiness bundle:

- Phase 68 designed future migration/seed strategy for backup permissions.
- Phase 69 added a local seed dry-run script and checker.
- Phase 70 added the future permission assignment runbook.
- Phase 71 added activation guardrails to prevent runtime execute/restore drift.
- Phase 72 records this readiness handoff.

No migration/schema in Phase 68-72. No DB mutation. No real worker call. No deploy.

## Permission Names

The future backup permissions are:

- `backup.operator.view`
- `backup.operator.dry_run`
- `backup.operator.execute`
- `backup.operator.restore`

## Seed Dry-Run Status

Seed dry-run status: ready as a local simulation only.

Script:

- `npm run backup:permission:seed:dry-run`

Behavior:

- Outputs `BACKUP_PERMISSION_SEED_DRY_RUN_ONLY`.
- Reports `dry_run: true`.
- Reports `migration_written: false`.
- Reports `db_mutation: false`.
- Reports `network_call: false`.
- Simulates `would_insert` permission rows.
- Simulates `would_assign` role mappings.

The seed dry-run does not call Supabase, read env files, write migration files, mutate DB, call network, or create any production backup.

## Assignment Runbook Status

Assignment runbook status: documented only.

Runbook:

- `docs/70_BACKUP_PERMISSION_ASSIGNMENT_RUNBOOK.md`

Recommended future role mapping:

- `OWNER`: `backup.operator.view`, `backup.operator.dry_run`, `backup.operator.execute`, `backup.operator.restore`
- `ADMIN`: `backup.operator.view`, `backup.operator.dry_run`
- Other roles: none by default unless owner approves

Assignment has not been applied. Owner approval is required before any real DB seed, role mapping, execute permission, restore permission, or broader role grant.

## Activation Guardrail Status

Activation guardrail status: active as source-static local checks.

Script:

- `npm run check:backup-permission-activation-guardrails`

The guardrail confirms:

- Runtime UI may use `backup.operator.view`.
- Runtime API may use `backup.operator.dry_run`.
- Runtime fallback `permissions.manage` remains allowed.
- Runtime must not use `backup.operator.execute`.
- Runtime must not use `backup.operator.restore`.
- Runtime must not call the real worker.
- Runtime must not create production backup.
- Runtime must not upload real storage.
- Runtime must not restore data.
- Runtime must not read `.env.local` or `.dev.vars`.
- Runtime must not hardcode secret/token/key.

## What Is Implemented

- Permission migration/seed design.
- Seed dry-run simulation and checker.
- Assignment runbook.
- Activation guardrail checker.
- Docs index, work log, decision log, and handoff updates.
- Runtime permission fallback remains documented and unchanged.

## What Is Not Implemented

- No migration/schema in Phase 68-72.
- No DB mutation.
- No real permission seed.
- No real role assignment.
- No real worker call.
- No deploy.
- No production backup.
- No real storage.
- No restore.
- No cron/schedule.
- No secret committed.
- `backup.operator.execute` still not enabled.
- `backup.operator.restore` still not enabled.

## Required Future Migration/Seed

A future approved phase may create a real idempotent migration/seed, recommended as a new migration rather than editing old migrations.

That future phase must:

- Require explicit owner approval.
- Insert the four permission rows idempotently.
- Assign role permissions according to the approved mapping.
- Keep execute/restore disabled in runtime unless separately approved.
- Include rollback and verification steps.
- Run migration validation before any production apply.

## Boundary

Phase 72 keeps the full bundle boundary:

- No deploy.
- No push.
- No package added.
- No migration/schema/data mutation.
- No real migration run.
- No `.env.local` read.
- No `.dev.vars` read.
- No Supabase call.
- No production network/API/DB call.
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

- Phase 73 - Backup Permission Real Migration/Seed Implementation, only if owner approves migration/schema/seed.
- Phase 73 - Backup Service Worker Manual Deploy Execution, only if owner explicitly approves deploy and secrets are ready.
- Phase 73 - Vietnamese Genealogy Domain Model Readiness, if infrastructure work should pause.
