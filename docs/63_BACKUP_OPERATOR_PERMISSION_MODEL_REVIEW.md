# Phase 63 - Backup Operator Permission Model Review

## Production Baseline

Production remains on the existing main worker `web-gia-pha`.

Phase 63 does not deploy, push, call the backup service worker, call production DB/network, read env files, create migrations, mutate schema, trigger real backup, upload storage, or restore data.

## Backup Operator Baseline

Current operator backup surface:

- API route: `/api/admin/backups/service-dry-run`
- UI route: `/admin/backups`
- UI component: `components/admin/backup-operator-dry-run-panel.tsx`
- Guardrail: `scripts/check-backup-operator-ui-guardrails.cjs`
- Smoke: `scripts/smoke-backup-operator-dry-run.cjs`

All current behavior remains dry-run only.

## Permission Review Goal

Define the permission model that should control backup operator UI/API access before any real backup worker integration is allowed.

This phase is review-only and does not add DB permissions.

## Existing Auth/Role Model Summary

The current project uses:

- Supabase Auth user.
- `profiles`.
- `roles`.
- `permissions`.
- `role_permissions`.
- `profile_roles`.
- server-side permission context from `lib/permissions/permission-service.ts`.
- page guard helper from `lib/permissions/require-permission.ts`.

Existing permission codes include `exports.download`, `exports.create`, `settings.manage` and `permissions.manage`, but do not include backup operator permissions yet.

## Proposed Backup Permission

Proposed future permissions:

```txt
backup.operator.view
backup.operator.dry_run
backup.operator.execute
backup.operator.restore
```

These names are proposed only in Phase 63.

## Read-Only Dry-Run Permission Boundary

Dry-run UI access should require at least:

```txt
backup.operator.view
```

Dry-run API access should require:

```txt
backup.operator.dry_run
```

Dry-run must not require execute or restore permission.

## Real Backup Permission Boundary

Future real backup execution should require:

```txt
backup.operator.execute
```

Future real restore should require:

```txt
backup.operator.restore
```

These permissions must not be used for the current dry-run UI/API.

## UI Access Boundary

The `/admin/backups` page should be guarded server-side.

Until `backup.operator.view` exists in DB seed/migration, a later implementation may use a documented fail-closed fallback such as `permissions.manage`.

## API Access Boundary

The `/api/admin/backups/service-dry-run` route should be guarded server-side.

Until `backup.operator.dry_run` exists in DB seed/migration, a later implementation may use a documented fail-closed fallback such as `permissions.manage`.

## No-Migration Policy

Phase 63 does not create migration, seed data, schema changes, role grants, or owner grants.

Adding `backup.operator.*` to the real database requires a separate approved migration/seed phase.

## No-Production-Backup Policy

Permission review does not enable:

- production backup
- worker call
- storage upload
- restore
- cron/schedule
- Cloudflare/Supabase/Google API mutation

## Acceptance Criteria

- Proposed permission names are documented.
- Dry-run UI/API boundaries are documented separately.
- Execute and restore permissions are reserved for future real operations.
- No migration/schema/data mutation is performed.
- Existing dry-run-only backup boundary remains intact.

## Phase 63 Boundary

- No deploy.
- No push.
- No migration.
- No schema change.
- No DB mutation.
- No worker call.
- No network call.
- No secret read.
- No production backup.
- No real storage.
- No restore.

## Next Phase

Phase 64 - Backup Operator API Permission Guard.
