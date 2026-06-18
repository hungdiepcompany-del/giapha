# Phase 64 - Backup Operator API Permission Guard

## Production Baseline

Production remains on the existing main worker `web-gia-pha`.

Phase 64 does not deploy, push, create migrations, mutate schema/data, read env files, call the backup service worker, create production backup, upload storage, restore data, or create a schedule.

## API Route Baseline

The operator API route remains:

```txt
app/api/admin/backups/service-dry-run/route.ts
```

Runtime path:

```txt
/api/admin/backups/service-dry-run
```

Existing dry-run marker remains:

```txt
BACKUP_OPERATOR_API_DRY_RUN_ONLY
```

New permission guard marker:

```txt
BACKUP_OPERATOR_API_PERMISSION_GUARD
```

## Permission Guard Goal

Add a server-side permission guard before returning the dry-run envelope.

The route must fail closed for anonymous or unauthorized users and must still never trigger real backup work.

## Existing Auth Pattern Used

The route uses the existing server-side permission context helper:

```txt
lib/permissions/permission-service.ts
```

The route does not create a new auth model and does not use redirect-style page guards.

## Required Permission

Future intended dry-run API permission:

```txt
backup.operator.dry_run
```

This permission is checked first when present in the user's permission context.

## Fallback Behavior

Because Phase 64 does not add DB permission seed/migration, the route allows the existing administrative fallback:

```txt
permissions.manage
```

The fallback is documented and fail-closed. Users without the future permission or fallback receive JSON 403.

## Fail-Closed Policy

The route returns:

- `401` JSON for anonymous users.
- `403` JSON for authenticated users without permission.

Error envelopes still include dry-run safety fields:

```txt
worker_call: false
production_backup: false
storage_upload: false
restore: false
```

## No-Real-Backup Policy

The route does not create a production backup.

It only returns local dry-run adapter metadata and safety fields.

## No-Worker-Call Policy

The route does not call a worker URL, service binding, external network, cloud storage, or restore endpoint.

The backup service client remains dry-run only.

## Phase 64 Boundary

- No deploy.
- No push.
- No migration.
- No schema change.
- No DB mutation beyond the existing auth/permission read pattern.
- No worker call.
- No outbound network call.
- No secret read.
- No production backup.
- No real storage.
- No restore.

## Next Phase

Phase 65 - Backup Operator UI Permission Guard.
