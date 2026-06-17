# Phase 43 - Backup Service Worker Deploy Readiness Gate

## Production Baseline

Production remains on the existing main worker:

- Main Worker: `web-gia-pha`
- Production URL: `https://web-gia-pha.hungdiepcompany.workers.dev/`
- Current deploy workflow: `.github/workflows/cloudflare-deploy.yml`
- Backup readiness workflow: `.github/workflows/backup-readiness.yml`

Phase 43 does not deploy, push, change routing, mutate Cloudflare config, read secrets, or create a production backup.

## Backup Service Baseline

The backup service worker exists only as a local scaffold:

- Service path: `services/backup-service`
- Worker source: `services/backup-service/src/index.ts`
- Wrangler config: `services/backup-service/wrangler.jsonc`
- Service README: `services/backup-service/README.md`
- Real deploy: not done
- Real storage: not implemented
- Main app integration: not implemented
- Production backup: not implemented

## Deploy Readiness Goal

This gate verifies that the backup service worker is structurally ready for a future deploy-readiness decision while remaining no-deploy in Phase 43.

The gate checks source files, Wrangler config, endpoint/auth/envelope markers, and secret safety. It does not call Cloudflare, Supabase, Google, production URLs, databases, or storage providers.

## Wrangler Config Readiness

Expected static config:

- `name` is `web-gia-pha-backup-service`
- `main` is `src/index.ts`
- `compatibility_date` is present
- `workers_dev` is `false`
- `vars.BACKUP_SERVICE_MODE` is non-secret scaffold metadata only

Not allowed in this phase:

- production `route` or `routes`
- token/key/secret values in `vars`
- real storage credentials
- deploy workflow changes

## Endpoint Readiness

Expected scaffold endpoints:

- `GET /health`
- `POST /internal/backup/dry-run`
- `POST /internal/backup/fixture-verify`

All endpoint checks are static/source-level in Phase 43.

## Auth Readiness

Internal endpoints must keep the placeholder auth boundary:

```txt
Authorization: Bearer BACKUP_SERVICE_INTERNAL_TOKEN
```

`BACKUP_SERVICE_INTERNAL_TOKEN` is a future runtime secret name only. No real value is stored in the repository.

## JSON Envelope Readiness

Worker responses must keep a structured JSON envelope with:

- `ok`
- `code`
- `message`
- `data`
- `requestId`

The envelope must be returned as `application/json; charset=utf-8`.

## Secret Safety

Phase 43 does not read:

- `.env`
- `.env.local`
- `.dev.vars`
- GitHub secrets
- Cloudflare secrets
- Supabase secrets
- Google secrets

Phase 43 does not print or document real secret values. Placeholder names are allowed only as non-secret contract text.

## No-Route/No-Deploy Policy

The backup worker must not have a production route in `services/backup-service/wrangler.jsonc`.

No deploy is authorized in Phase 43.

No package script may add a backup service deploy command.

No GitHub Actions deploy workflow is added for the backup service worker in Phase 43.

## Future Deploy Command Placeholder

Future deploy command, not to be run in Phase 43:

```bash
cd services/backup-service
npx wrangler deploy
```

This placeholder is documentation only.

## PASS/FAIL Criteria

PASS:

- Service source, config, and README exist.
- Wrangler config is static and has no production route.
- Worker source includes health and internal dry-run/fixture endpoints.
- Worker source includes `BACKUP_SERVICE_INTERNAL_TOKEN`.
- Worker source includes `BACKUP_SERVICE_DRY_RUN_ONLY`.
- Worker source keeps JSON envelope behavior.
- No real token/key/secret is hardcoded.
- No production backup/storage/restore behavior exists.

FAIL:

- A production route is configured.
- A real secret/key/token value is present.
- A deploy script is added.
- Worker source calls network/API/DB/storage providers for backup.
- Production backup or restore behavior is implemented.

## Phase 43 Boundary

- No deploy.
- No push.
- No schema or migration.
- No production API/DB/network call.
- No Cloudflare/Supabase/Google API mutation.
- No real storage target.
- No production backup.
- No restore.
- No secret read.
- No secret committed.

## Next Phase

Phase 44 - Backup Service Worker Env & Secret Contract Runbook.
