# Phase 62 - Backup Operator Dry-Run Handoff

## Current Production Baseline

Production remains on the existing main worker `web-gia-pha`.

Phase 62 does not deploy, push, call network/API/DB, read env files, call the backup service worker, create production backup, upload storage, restore data, or create a schedule.

## Backup Service Status

Backup service worker status:

- Service path: `services/backup-service`
- Planned endpoints: `GET /health`, `POST /internal/backup/dry-run`, `POST /internal/backup/fixture-verify`
- Real deploy: not executed
- Real storage: not selected
- Real worker call from main app: not implemented
- Production backup: not created

## Main App Binding Status

Main app binding remains dry-run only.

Existing adapter:

```txt
server/services/backup-service-client.ts
```

Adapter marker:

```txt
MAIN_APP_BACKUP_SERVICE_CLIENT_DRY_RUN_ONLY
```

## Phase 58-62 Summary

Phase 58 added the operator API dry-run route.

Phase 59 added the operator UI dry-run panel.

Phase 60 added static guardrails for operator UI/API source.

Phase 61 added local/static smoke for operator dry-run.

Phase 62 records this handoff and keeps the bundle dry-run only.

## Operator API Status

Route file:

```txt
app/api/admin/backups/service-dry-run/route.ts
```

URL path:

```txt
/api/admin/backups/service-dry-run
```

Marker:

```txt
BACKUP_OPERATOR_API_DRY_RUN_ONLY
```

Current status:

- dry-run only
- no real worker call
- no production backup
- no real storage
- no restore
- API permission hardening remains a future phase

## Operator UI Status

Page file:

```txt
app/(admin)/admin/backups/page.tsx
```

URL path:

```txt
/admin/backups
```

Component:

```txt
components/admin/backup-operator-dry-run-panel.tsx
```

Current status:

- shows dry-run warnings
- has `Run dry-run check`
- calls only the local dry-run route
- does not call a backup worker URL

## Guardrail Status

Guardrail script:

```txt
scripts/check-backup-operator-ui-guardrails.cjs
```

Package script:

```txt
check:backup-operator-ui-guardrails
```

Guardrail blocks hardcoded worker URLs, hardcoded token/key patterns, direct Wrangler usage, direct Cloudflare/Supabase/Google API calls, production backup triggers, storage upload triggers, restore triggers and cron/schedule triggers.

## Smoke Status

Smoke script:

```txt
scripts/smoke-backup-operator-dry-run.cjs
```

Package scripts:

```txt
smoke:backup-operator:dry-run
check:backup-operator-local-smoke
```

Smoke marker:

```txt
BACKUP_OPERATOR_DRY_RUN_SMOKE_ONLY
```

Current behavior:

- source-static
- no server required
- no network required
- no env required
- no DB required

## What Is Implemented

- Operator API dry-run route.
- Operator UI dry-run page.
- Operator UI dry-run component.
- Operator source guardrails.
- Operator local/static smoke.
- Docs, checks and package scripts for Phase 58-62.

## What Is Not Implemented

- No real worker call.
- No deploy.
- No production backup.
- No real storage.
- No restore.
- No schedule/cron.
- No API permission hardening beyond current page-level admin permission pattern.
- No storage target selection for production backup.

## Boundary

- dry-run only
- no real worker call
- no deploy
- no push
- no production backup
- no real storage
- no restore
- no secret committed
- no `.env.local` read
- no `.dev.vars` read
- no Cloudflare/Supabase/Google API call
- no migration/schema/data mutation

## Known Notes

- Direct workspace `npm run build` may fail on Windows when `.next` files are locked.
- Clean temp build is the preferred confirmation when the workspace build hits EPERM.
- `npm audit --audit-level=moderate` has known advisories in the current dependency tree.
- Do not run `npm audit fix --force` unless a separate dependency upgrade phase approves breaking changes.

## Recommended Next Phase

Recommended options:

- Phase 63 - Backup Operator Permission Hardening.
- Phase 63 - Backup Service Worker Manual Deploy Execution, only with explicit owner approval and real secret readiness.
- Phase 63 - Vietnamese Genealogy Domain Model Readiness.
