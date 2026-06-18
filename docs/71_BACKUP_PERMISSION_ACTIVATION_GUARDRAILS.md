# Phase 71 - Backup Permission Activation Guardrails

## Production Baseline

Production remains on the existing main worker `web-gia-pha`.

Phase 71 does not deploy, push, run migrations, apply schema, mutate DB, read env files, call production network/API/DB, call Supabase, call the backup service worker, create production backup, upload storage, restore data, or create a schedule.

## Activation Guardrail Goal

Add a source-static guardrail that proves backup permissions are still limited to operator view/dry-run surfaces.

This phase does not activate real backup execution or restore. It only checks that future high-risk permissions remain documented or simulated, not wired into runtime execution paths.

## Runtime Permission Boundary

Runtime backup operator surfaces must stay inside this permission boundary:

- `/admin/backups` may use `backup.operator.view`.
- `/api/admin/backups/service-dry-run` may use `backup.operator.dry_run`.
- Runtime may keep fallback `permissions.manage` until a real migration/seed is approved and applied.
- Runtime must not require or activate `backup.operator.execute`.
- Runtime must not require or activate `backup.operator.restore`.

## Execute/Restore Not Enabled

`backup.operator.execute` and `backup.operator.restore` are still future permissions only.

They may appear in design docs, runbooks, readiness handoff, and the seed dry-run script when clearly marked as not enabled now. They must not appear as runtime route/page/component guards for current dry-run behavior.

## Paths Scanned

The guardrail scans:

- `app/api/admin/backups`
- `app/(admin)/admin/backups`
- `components/admin/backup-operator-dry-run-panel.tsx`
- `server/services/backup-service-client.ts`
- `scripts/backup-permission-seed-dry-run.cjs`

## Forbidden Patterns

The guardrail fails if current runtime source introduces:

- `backup.operator.execute` in runtime route/page/component/service paths.
- `backup.operator.restore` in runtime route/page/component/service paths.
- production backup trigger.
- restore trigger.
- real storage upload.
- worker real call.
- hardcoded token/key.
- `.env.local` or `.dev.vars` read.

The guardrail also fails if dry-run markers drift to real execution markers such as `worker_call: true`, `workerCalled: true`, `production_backup: true`, `storage_upload: true`, `restore: true`, `realBackupCreated: true`, `realStorageUpload: true`, or `restoreExecuted: true`.

## Allowed Documentation Patterns

The checker allows future permission names in the dry-run seed script because that script is explicitly marked:

- `BACKUP_PERMISSION_SEED_DRY_RUN_ONLY`
- `dry_run: true`
- `migration_written: false`
- `db_mutation: false`
- `network_call: false`

This exception is only for simulated permission seed readiness. It does not allow runtime activation.

## No-Real-Backup Policy

Phase 71 keeps the existing dry-run-only policy:

- No production backup.
- No real worker call.
- No storage upload.
- No restore.
- No cron/schedule.
- No cloud/storage bucket creation.
- No Supabase, Cloudflare or Google API call.

## Phase 71 Boundary

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
- No production backup.
- No real storage.
- No restore.
- No hardcoded secret/token/key.

## Next Phase

Phase 72 - Backup Permission Seed Readiness Handoff.
