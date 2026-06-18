# Phase 67 - Backup Operator Permission Handoff

## Current Production Baseline

Production remains on the existing main worker `web-gia-pha`.

Phase 63-67 did not deploy, push, create migrations, mutate schema/data, read env files, call the backup service worker, create production backup, upload storage, restore data, or create a schedule.

Bundle safety summary: no real worker call, no deploy, no production backup, no real storage, no secret committed, and no migration/schema in Phase 63-67.

## Backup Operator Current Status

Backup operator source now has server-side permission guards for both API and UI dry-run surfaces.

Runtime surfaces:

- API route: `app/api/admin/backups/service-dry-run/route.ts`
- UI page: `app/(admin)/admin/backups/page.tsx`
- UI component: `components/admin/backup-operator-dry-run-panel.tsx`
- Dry-run adapter: `server/services/backup-service-client.ts`

All surfaces remain dry-run only.

## Phase 63-67 Summary

Phase 63 reviewed and proposed the backup operator permission model.

Phase 64 guarded the backup operator API dry-run route.

Phase 65 guarded the backup operator UI dry-run page.

Phase 66 added permission smoke and guardrails.

Phase 67 records the handoff and boundary for future phases.

## Proposed Permission Model

Proposed and used permission names:

```txt
backup.operator.view
backup.operator.dry_run
backup.operator.execute
backup.operator.restore
```

Current implemented dry-run checks:

- UI target: `backup.operator.view`
- API target: `backup.operator.dry_run`
- Current fallback: `permissions.manage`

Future real backup should use `backup.operator.execute`.

Future real restore should use `backup.operator.restore`.

## API Guard Status

API route:

```txt
/api/admin/backups/service-dry-run
```

Markers:

```txt
BACKUP_OPERATOR_API_DRY_RUN_ONLY
BACKUP_OPERATOR_API_PERMISSION_GUARD
```

Status:

- checks `backup.operator.dry_run`
- falls back to `permissions.manage`
- returns JSON 401/403 on permission failure
- returns dry-run envelope only on success
- keeps `worker_call: false`
- keeps `production_backup: false`
- keeps `storage_upload: false`
- keeps `restore: false`

## UI Guard Status

UI page:

```txt
/admin/backups
```

Marker:

```txt
BACKUP_OPERATOR_UI_PERMISSION_GUARD
```

Status:

- checks `backup.operator.view`
- falls back to `permissions.manage`
- redirects anonymous users to login
- redirects unauthorized users to the existing unauthorized page
- renders the dry-run panel only after permission passes

## Smoke/Guardrail Status

Added scripts:

```txt
npm run smoke:backup-operator:permission-guard
npm run check:backup-operator-permission-guardrails
```

Smoke marker:

```txt
BACKUP_OPERATOR_PERMISSION_GUARD_SMOKE_ONLY
```

Guardrails scan operator route/page/component and the main app dry-run adapter.

## What Is Implemented

- Proposed backup operator permission model is documented.
- API dry-run route is guarded server-side.
- UI dry-run page is guarded server-side.
- Dry-run panel shows permission guard/source metadata.
- Static smoke confirms markers and no-real-backup fields.
- Static guardrails block drift toward worker URL, secret, storage upload, restore, production backup, cron, and env file reads.

## What Is Not Implemented

- No real worker call.
- No deploy.
- No production backup.
- No real storage.
- No restore.
- No cron or scheduled backup job.
- No Cloudflare/Supabase/Google config mutation.
- No backup permission migration/seed.
- No role grant for `backup.operator.*`.

## Required Future Migration/Seed If Needed

If the project wants first-class backup operator permissions in DB, create a separate approved phase for:

- inserting `backup.operator.view`
- inserting `backup.operator.dry_run`
- inserting `backup.operator.execute`
- inserting `backup.operator.restore`
- mapping those permissions to intended roles
- verifying OWNER/admin access remains correct
- smoke testing without granting broad access accidentally

That future phase must review RLS, seed order, rollback, owner approval, and production safety.

## Boundary

- No deploy.
- No push.
- No package added.
- No migration/schema/data mutation.
- No `.env.local` read.
- No `.dev.vars` read.
- No production API/DB/network call beyond existing auth/permission pattern in source.
- No backup service worker call.
- No Cloudflare/Supabase/Google API call.
- No bucket/folder/storage created.
- No production backup created or uploaded.
- No restore.
- No cron/schedule created.
- No real GitHub secret used.
- No domain/Auth/OAuth config changed.
- No hardcoded secret/token/key.

## Known Notes

- Direct workspace `npm run build` can fail on Windows due to `.next` ACL/EPERM.
- Clean temp build should be used to confirm product build when that happens.
- `npm audit --audit-level=moderate` still reports known advisories in `esbuild`, `postcss`, and `ws`.
- Do not run `npm audit fix --force` without a separate dependency upgrade phase.

## Recommended Next Phase

Choose one:

- Phase 68 - Backup Permission Migration/Seed Design.
- Phase 68 - Backup Service Worker Manual Deploy Execution, only with explicit owner approval and secret readiness.
- Phase 68 - Vietnamese Genealogy Domain Model Readiness.
