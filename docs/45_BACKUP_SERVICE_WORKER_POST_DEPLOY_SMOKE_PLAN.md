# Phase 45 - Backup Service Worker Post-Deploy Smoke Plan

## Production Baseline

Production remains on the existing main worker `web-gia-pha` at `https://web-gia-pha.hungdiepcompany.workers.dev/`.

Phase 45 does not deploy the backup service worker and does not call production unless an operator explicitly provides smoke env values.

## Backup Service Baseline

The backup service worker remains a scaffold under `services/backup-service`.

Current status:

- Real deploy: not done
- Real route: not configured
- Real storage: not configured
- Main app integration: not implemented
- Production backup: not implemented

## Post-Deploy Smoke Goal

This phase prepares a future post-deploy smoke plan and a safe optional smoke script.

The smoke script must skip safely when no explicit smoke base URL is provided. It must not read local secret files, print tokens, mutate data, create backup artifacts, upload storage objects, or restore data.

## Smoke Env Placeholders

Future explicit smoke env placeholders:

```txt
BACKUP_SERVICE_SMOKE_BASE_URL
BACKUP_SERVICE_SMOKE_TOKEN
```

Rules:

- `BACKUP_SERVICE_SMOKE_BASE_URL` must be set explicitly by the operator before any network call.
- `BACKUP_SERVICE_SMOKE_TOKEN` is required only for internal endpoint smoke.
- The token value must never be printed.
- These env values are not committed to the repository.

## Health Smoke

When `BACKUP_SERVICE_SMOKE_BASE_URL` is set, the smoke script may call:

```txt
GET /health
```

Expected result:

- safe JSON response
- no secret value in output
- no production mutation

## Internal Dry-Run Smoke

When both `BACKUP_SERVICE_SMOKE_BASE_URL` and `BACKUP_SERVICE_SMOKE_TOKEN` are set, the smoke script may call:

```txt
POST /internal/backup/dry-run
```

The request body must contain only a smoke/dry-run marker and must not include family data.

## Fixture Verify Smoke

When both smoke env values are set, the smoke script may call:

```txt
POST /internal/backup/fixture-verify
```

The request body must contain only a smoke/fixture marker and must not include family data.

## Safe Skip Behavior

If `BACKUP_SERVICE_SMOKE_BASE_URL` is not set, the smoke script must print:

```txt
SKIPPED because BACKUP_SERVICE_SMOKE_BASE_URL is not set
```

If `BACKUP_SERVICE_SMOKE_BASE_URL` is set but `BACKUP_SERVICE_SMOKE_TOKEN` is missing, `/health` may run and internal endpoint smoke must be skipped.

## No-Mutation Policy

The smoke script must not:

- create production backup
- upload backup to storage
- delete backup
- restore backup
- mutate Supabase data
- mutate Cloudflare config
- mutate Google config

Smoke request bodies must be marker-only.

## Secret Logging Policy

The smoke script may log:

- route name
- status code
- safe response code
- safe response message

The smoke script must not log:

- bearer token
- secret values
- raw request headers
- Supabase service role key
- Cloudflare API token
- Google client secret

## Failure Handling

If env is missing, smoke exits successfully with SKIPPED.

If env is explicit and a network call fails, smoke exits with FAIL and a safe error message.

If a response is non-JSON or non-2xx, smoke exits with FAIL and a safe status/code summary.

## Phase 45 Boundary

- No deploy.
- No push.
- No `.env.local` read or write.
- No `.dev.vars` read or write.
- No default production URL.
- No network call unless `BACKUP_SERVICE_SMOKE_BASE_URL` is explicit.
- No token logging.
- No production backup.
- No real storage.
- No restore.

## Next Phase

Phase 46 - Backup Service Worker Main App Binding Contract.
