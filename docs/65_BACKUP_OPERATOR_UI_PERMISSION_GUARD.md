# Phase 65 - Backup Operator UI Permission Guard

## Production Baseline

Production remains on the existing main worker `web-gia-pha`.

Phase 65 does not deploy, push, create migrations, mutate schema/data, read env files, call the backup service worker, create production backup, upload storage, restore data, or create a schedule.

## UI Baseline

The operator UI remains:

```txt
app/(admin)/admin/backups/page.tsx
```

Runtime path:

```txt
/admin/backups
```

The dry-run panel remains:

```txt
components/admin/backup-operator-dry-run-panel.tsx
```

Permission guard marker:

```txt
BACKUP_OPERATOR_UI_PERMISSION_GUARD
```

## UI Permission Guard Goal

Guard `/admin/backups` server-side before rendering the operator dry-run panel.

The page should be visible only to users with the future backup operator view permission or the documented administrative fallback.

## Existing Admin Guard Pattern Used

The page uses the existing server-side permission context helper:

```txt
lib/permissions/permission-service.ts
```

It redirects anonymous users to login and unauthorized users to the existing unauthorized page.

## Required Permission

Future intended UI permission:

```txt
backup.operator.view
```

This permission is checked first when present in the user's permission context.

## Fallback Behavior

Because Phase 65 does not add DB permission seed/migration, the page allows the existing administrative fallback:

```txt
permissions.manage
```

Users without the future permission or fallback are denied before the panel renders.

## Dry-Run Warning Policy

The UI must continue to show dry-run warnings:

- Dry-run only
- No production backup
- No storage upload
- No restore
- No real worker call

## No-Real-Backup Policy

The UI does not trigger production backup, real storage upload, real worker call, restore, deploy, or cloud API mutation.

The button still calls only the local route:

```txt
/api/admin/backups/service-dry-run
```

## Phase 65 Boundary

- No deploy.
- No push.
- No migration.
- No schema change.
- No DB mutation beyond the existing auth/permission read pattern.
- No worker call.
- No outbound network call from UI source.
- No secret read.
- No production backup.
- No real storage.
- No restore.

## Next Phase

Phase 66 - Backup Operator Permission Smoke & Guardrails.
