# Phase 60 - Backup Operator UI Guardrails

## Production Baseline

Production remains on the existing main worker `web-gia-pha`.

Phase 60 does not deploy, push, call the backup service worker, call production DB/network, read env files, trigger real backup, upload storage, restore data, or create a schedule.

## Guardrail Goal

Add static guardrails for the backup operator UI and dry-run route so later edits do not accidentally become real backup execution.

## Paths Scanned

The checker scans these paths when present:

```txt
app/(admin)/admin/backups
components/admin
app/api/admin/backups
server/services/backup-service-client.ts
```

Missing optional paths are skipped safely.

## Forbidden Patterns

Forbidden in scanned source:

- hardcoded token/key
- hardcoded backup worker URL
- direct `wrangler`
- direct Cloudflare/Supabase/Google API calls
- production backup trigger
- restore trigger
- storage upload
- cron/schedule trigger
- `.env.local` read
- `.dev.vars` read

## Allowed Dry-Run Patterns

Allowed:

- dry-run marker strings
- placeholder names
- local route `/api/admin/backups/service-dry-run`
- UI warning text
- `fetch` to local route only

## Failure Examples

Examples that should fail the checker:

```txt
fetch("https://backup.example.workers.dev")
storage.from("backups").upload(...)
restore: true
production_backup: true
wrangler deploy
```

## Phase 60 Boundary

- No deploy.
- No push.
- No worker direct call.
- No production backup.
- No storage upload.
- No restore.
- No cron/schedule.
- No secret read.
- No `.env.local` read.
- No `.dev.vars` read.

## Next Phase

Phase 61 - Backup Operator Local Smoke.
