# Phase 59 - Backup Operator UI Dry-Run Panel

## Production Baseline

Production remains on the existing main worker `web-gia-pha`.

Phase 59 does not deploy, push, call the backup service worker, call production DB/network from validation, read env files, trigger real backup, upload storage, or restore data.

## UI Goal

Add an admin/operator panel for viewing and running the main app backup dry-run route.

The panel stays dry-run-only and does not call a real backup worker.

## Route/Page Path

Implemented filesystem page:

```txt
app/(admin)/admin/backups/page.tsx
```

Public admin path:

```txt
/admin/backups
```

Component:

```txt
components/admin/backup-operator-dry-run-panel.tsx
```

Local dry-run API path:

```txt
/api/admin/backups/service-dry-run
```

## Dry-Run UX

The UI displays:

- Dry-run only
- No production backup
- No storage upload
- No restore
- No real worker call

The button label is:

```txt
Run dry-run check
```

The button only calls the main app local dry-run route.

## Operator Warnings

The page shows a warning callout before the panel so an operator sees the dry-run limits before clicking anything.

## No-Real-Backup Policy

The UI must not:

- create production backup
- upload storage
- restore data
- schedule backup jobs
- delete backup artifacts

## No-Worker-Direct-Call Policy

The UI must not call a backup worker URL directly.

The UI may call the local main app route `/api/admin/backups/service-dry-run`.

## Permission Boundary

The page uses the existing admin permission pattern and requires `exports.download`.

The API route itself remains a dry-run contract route pending a later API permission hardening phase.

## Phase 59 Boundary

- No deploy.
- No push.
- No worker direct call.
- No production backup.
- No storage upload.
- No restore.
- No secret read.
- No `.env.local` read.
- No `.dev.vars` read.

## Next Phase

Phase 60 - Backup Operator UI Guardrails.
