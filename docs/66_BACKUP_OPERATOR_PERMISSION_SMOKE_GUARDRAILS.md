# Phase 66 - Backup Operator Permission Smoke & Guardrails

## Production Baseline

Production remains on the existing main worker `web-gia-pha`.

Phase 66 does not deploy, push, create migrations, mutate schema/data, read env files, call the backup service worker, create production backup, upload storage, restore data, or create a schedule.

## Permission Smoke Goal

Add a source-static smoke check for backup operator permission guard readiness.

The smoke confirms that API and UI permission guard markers exist and that the operator surface remains dry-run only.

## Paths Scanned

Smoke and guardrails scan:

```txt
app/api/admin/backups
app/(admin)/admin/backups
components/admin/backup-operator-dry-run-panel.tsx
server/services/backup-service-client.ts
package.json
```

## Required Markers

Required markers:

```txt
BACKUP_OPERATOR_PERMISSION_GUARD_SMOKE_ONLY
BACKUP_OPERATOR_API_DRY_RUN_ONLY
BACKUP_OPERATOR_API_PERMISSION_GUARD
BACKUP_OPERATOR_UI_PERMISSION_GUARD
MAIN_APP_BACKUP_SERVICE_CLIENT_DRY_RUN_ONLY
```

Required permission names:

```txt
backup.operator.dry_run
backup.operator.view
permissions.manage
```

## Forbidden Patterns

Guardrails block:

- missing dry-run markers
- missing permission guard markers
- hardcoded worker URL
- hardcoded token/key/secret value
- production backup trigger
- restore trigger
- real storage upload trigger
- cron or schedule trigger
- `.env.local` or `.dev.vars` read
- outbound worker call from the operator source

## Expected Output

Smoke output includes:

```txt
BACKUP_OPERATOR_PERMISSION_GUARD_SMOKE_ONLY
API permission guard: PASS
UI permission guard: PASS
Dry-run boundary: PASS
Network execution: SKIPPED
Result: PASS
```

## No-Network Policy

The smoke and guardrail scripts read source files only.

They do not call network, DB, Cloudflare, Supabase, Google, backup worker, storage, restore, deploy, or env files.

## Phase 66 Boundary

- No deploy.
- No push.
- No migration.
- No schema change.
- No DB mutation.
- No worker call.
- No outbound network call.
- No secret read.
- No production backup.
- No real storage.
- No restore.

## Next Phase

Phase 67 - Backup Operator Permission Handoff.
