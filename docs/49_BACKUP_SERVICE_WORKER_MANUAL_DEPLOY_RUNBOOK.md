# Phase 49 - Backup Service Worker Manual Deploy Runbook

## Production Baseline

Production remains on the existing main worker `web-gia-pha` at `https://web-gia-pha.hungdiepcompany.workers.dev/`.

Phase 49 does not deploy the backup service worker, does not provision secrets, does not call production APIs, and does not create production backup.

## Backup Service Baseline

Backup service worker status:

- Service path: `services/backup-service`
- Worker name: `web-gia-pha-backup-service`
- Endpoints: `/health`, `/internal/backup/dry-run`, `/internal/backup/fixture-verify`
- Real deploy: not done
- Real storage: not configured
- Main app integration: not implemented
- Production backup: not implemented

## Manual Deploy Goal

This runbook documents how a future operator can manually deploy the backup service worker after owner approval and secret readiness.

It is not an instruction to deploy during Phase 49.

## Pre-Deploy Checklist

Before any real deploy:

- Owner explicitly approves backup service worker deploy.
- Deploy target and worker name are confirmed.
- `services/backup-service/wrangler.jsonc` has no production route unless approved.
- Required secret is ready outside the repository.
- GitHub Actions manual-only workflow readiness has passed.
- Local readiness checks have passed.
- Post-deploy smoke owner is available.
- Rollback owner is available.
- Production backup remains disabled.

## Required Secrets

Required future runtime secret:

```txt
BACKUP_SERVICE_INTERNAL_TOKEN
```

Do not write the secret value in docs, shell history, screenshots, issue comments, or commit history.

## Required Vars

Existing non-secret scaffold var:

```txt
BACKUP_SERVICE_MODE=scaffold
```

Future storage vars must remain unconfigured until storage target approval is complete.

## Local Validation Commands

Run before a real deploy:

```bash
npm run check:backup-service-worker-github-actions-deploy-readiness
npm run check:backup-service-worker-deploy-readiness
npm run check:backup-service-worker-env-secret-contract
npm run check:backup-service-worker-post-deploy-smoke-plan
npm run check:backup-service-worker-main-app-binding-contract
npm run backup:pipeline:readiness
npm run typecheck
npm run lint
```

## Manual Deploy Command

Future manual deploy commands, not to be run in Phase 49:

```bash
cd services/backup-service
npx wrangler secret put BACKUP_SERVICE_INTERNAL_TOKEN
npx wrangler deploy
```

Rules:

- Do not run these commands unless owner approval is recorded.
- Do not paste the secret value into docs or logs.
- Do not deploy if rollback owner is unavailable.
- Do not deploy if post-deploy smoke owner is unavailable.
- Do not deploy if production backup could run.

## Post-Deploy Smoke Commands

After a future deploy, set explicit smoke env outside the repository and run:

```bash
npm run smoke:backup-service-worker:post-deploy
```

Smoke must verify:

- `GET /health`
- optional `POST /internal/backup/dry-run`
- optional `POST /internal/backup/fixture-verify`

Internal smoke requires `BACKUP_SERVICE_SMOKE_TOKEN`.

## Rollback Procedure

Rollback owner must decide whether to:

- re-run the previous known-good deploy
- disable the route if a route was configured
- remove or rotate `BACKUP_SERVICE_INTERNAL_TOKEN`
- pause main app integration if it exists in a future phase

Rollback must be documented without secret values.

## Failure Handling

If deploy fails:

- Stop.
- Do not retry blindly.
- Capture safe error status only.
- Do not print token values.
- Confirm whether any worker version changed.
- Run rollback if production exposure changed.

If smoke fails:

- Treat backup service as not ready.
- Do not enable main app integration.
- Do not run production backup.
- Roll back or disable exposure according to owner decision.

## No-Production-Backup Policy

Manual deploy does not approve production backup.

Production backup remains blocked until a separate approval confirms storage target, retention, privacy, restore drill, rollback, and owner sign-off.

## Phase 49 Boundary

- No deploy.
- No push.
- No secret provisioning.
- No secret read.
- No Cloudflare/Supabase/Google API call.
- No production backup.
- No real storage.
- No restore.
- No main app integration.

## Next Phase

Phase 50 - Backup Service Worker Secrets Preflight Checklist.
