# Backup Service Worker Local Contract Checks

## Production Baseline

- Backup service worker scaffold exists at `services/backup-service/`.
- Worker is not deployed.
- Main app is not integrated with the backup service.
- Production backup upload is not implemented.
- Production restore execution is not implemented.

## Local Contract Goal

Phase 40 adds local static contract checks for the backup service worker source and config. It does not start a Cloudflare runtime, call a deployed worker, or perform production backup behavior.

## Contract Checks

The checks confirm:

- `GET /health` exists and is public/non-sensitive.
- `/internal/backup/dry-run` exists.
- `/internal/backup/fixture-verify` exists.
- `/internal/*` requires bearer auth.
- Missing token returns `401`.
- Bad token returns `401`.
- Dry-run endpoint returns `BACKUP_SERVICE_DRY_RUN_ONLY`.
- Fixture verify endpoint stays scaffold-only.
- No secret logging.
- No production route.
- No outbound API.
- No production backup.
- No restore.

## Auth Expectations

- `Authorization` header is read.
- `Bearer` prefix is required.
- `BACKUP_SERVICE_INTERNAL_TOKEN` is compared server-side.
- The token value must never be logged or returned.

## Response Envelope Expectations

Every response should contain:

- `ok`
- `code`
- `message`
- `data`
- `requestId`

## Static Vs Runtime Smoke Limitation

Phase 40 uses static/source checks and a static smoke script. It does not import and execute the TypeScript worker because no separate worker build/runtime harness is introduced in this phase.

This is enough to verify the scaffold contract shape before a future deploy-readiness or runtime-smoke phase.

## No-Deploy Policy

- No `wrangler deploy`.
- No preview worker.
- No production route.
- No Cloudflare API call.
- No GitHub Actions deploy workflow change.

## PASS/FAIL Criteria

PASS when:

- `npm run check:backup-service-worker-local-contract` passes.
- `npm run smoke:backup-service-worker:contract` prints `BACKUP_SERVICE_CONTRACT_SMOKE_ONLY`.
- Worker source includes expected routes, auth handling, response envelope, `401`, and dry-run marker.
- No outbound API pattern is present.

FAIL when:

- Internal routes do not require bearer auth.
- Dry-run marker is missing.
- Secret/token values are hardcoded.
- Source includes outbound API calls.
- Source includes production backup or restore behavior.

## Phase 40 Boundary

- Do not deploy.
- Do not push.
- Do not change schema.
- Do not create or run migrations.
- Do not mutate real data.
- Do not read `.env.local`.
- Do not read `.dev.vars`.
- Do not call production API/DB/network.
- Do not call Cloudflare/Supabase/Google API.
- Do not create bucket/folder/storage cloud resources.
- Do not create/upload production backup files.
- Do not restore production.
- Do not create scheduled backup jobs.
- Do not add GitHub Actions scheduled trigger.
- Do not hardcode secret/token/key values.
- Do not commit `.env.local` or `.dev.vars`.

## Next Phase

- Phase 41 - Backup Service Worker Integration Readiness.
