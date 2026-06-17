# Phase 47 - Backup Service Worker Deploy Readiness Handoff

## Current Production Baseline

Production remains on the existing main worker:

- Main Worker: `web-gia-pha`
- Production URL: `https://web-gia-pha.hungdiepcompany.workers.dev/`
- Deploy workflow: `.github/workflows/cloudflare-deploy.yml`
- Backup readiness workflow: `.github/workflows/backup-readiness.yml`

Phase 47 does not deploy, push, change production routing, call production APIs, create production backup, configure real storage, or restore data.

## Backup Service Current Status

The backup service worker is prepared as a standalone scaffold only.

- Service path: `services/backup-service`
- Worker source: `services/backup-service/src/index.ts`
- Wrangler config: `services/backup-service/wrangler.jsonc`
- README: `services/backup-service/README.md`
- Deploy status: not deployed
- Production route: not configured
- Real storage: not configured
- Main app integration: not implemented
- Production backup: not implemented

## Phase 43-47 Summary

Phase 43 added the backup service worker deploy readiness gate.

Phase 44 added the env/secret contract runbook.

Phase 45 added the post-deploy smoke plan and safe-skip smoke script.

Phase 46 added the main app binding contract.

Phase 47 records the deploy readiness handoff for future approval and execution phases.

## Service Files

- `services/backup-service/src/index.ts`
- `services/backup-service/wrangler.jsonc`
- `services/backup-service/README.md`
- `docs/43_BACKUP_SERVICE_WORKER_DEPLOY_READINESS_GATE.md`
- `docs/44_BACKUP_SERVICE_WORKER_ENV_SECRET_CONTRACT.md`
- `docs/45_BACKUP_SERVICE_WORKER_POST_DEPLOY_SMOKE_PLAN.md`
- `docs/46_BACKUP_SERVICE_WORKER_MAIN_APP_BINDING_CONTRACT.md`
- `docs/47_BACKUP_SERVICE_WORKER_DEPLOY_READINESS_HANDOFF.md`
- `scripts/check-backup-service-worker-deploy-readiness.cjs`
- `scripts/check-backup-service-worker-env-secret-contract.cjs`
- `scripts/check-backup-service-worker-post-deploy-smoke-plan.cjs`
- `scripts/smoke-backup-service-worker-post-deploy.cjs`
- `scripts/check-backup-service-worker-main-app-binding-contract.cjs`
- `scripts/check-backup-service-worker-deploy-readiness-handoff.cjs`

## Endpoints

Scaffolded worker endpoints:

- `GET /health`
- `POST /internal/backup/dry-run`
- `POST /internal/backup/fixture-verify`

Internal endpoints remain protected by placeholder bearer auth.

## Auth/Env Placeholders

Future runtime secret placeholder:

```txt
BACKUP_SERVICE_INTERNAL_TOKEN
```

Future smoke env placeholders:

```txt
BACKUP_SERVICE_SMOKE_BASE_URL
BACKUP_SERVICE_SMOKE_TOKEN
```

Optional future storage placeholders:

```txt
BACKUP_STORAGE_PROVIDER
BACKUP_STORAGE_DRY_RUN
BACKUP_STORAGE_PREFIX
BACKUP_RETENTION_POLICY
```

These are placeholder names only. No secret values are committed.

## Deploy Readiness Status

Deploy readiness is documented and locally checkable.

Current status:

- Static deploy readiness gate: ready
- Worker source/config checks: ready
- Production route: not configured
- Secret provisioning: not done
- Real deploy execution: not done
- GitHub Actions deploy workflow for backup service worker: not added

Important commands:

```bash
npm run check:backup-service-worker-deploy-readiness
npm run check:backup-service-worker-env-secret-contract
npm run check:backup-service-worker-post-deploy-smoke-plan
npm run smoke:backup-service-worker:post-deploy
npm run check:backup-service-worker-main-app-binding-contract
npm run check:backup-service-worker-deploy-readiness-handoff
```

## Post-Deploy Smoke Readiness

`smoke:backup-service-worker:post-deploy` exists and safe-skips when `BACKUP_SERVICE_SMOKE_BASE_URL` is not set.

Without `BACKUP_SERVICE_SMOKE_TOKEN`, it may only smoke `/health` after a base URL is explicitly provided.

With both smoke env values, it may smoke internal dry-run and fixture verify endpoints. It must not mutate data or print token values.

## Main App Binding Contract Status

Main app binding is contract-only.

Supported future options:

- Option A: Cloudflare service binding
- Option B: internal URL + Bearer token

No main app runtime code has been changed. No binding, URL, or secret has been configured.

## What Is Implemented

- Backup service worker scaffold.
- Health endpoint scaffold.
- Internal dry-run endpoint scaffold.
- Internal fixture verify endpoint scaffold.
- JSON envelope scaffold.
- Bearer auth placeholder.
- Deploy readiness gate.
- Env/secret contract runbook.
- Post-deploy smoke plan.
- Safe-skip post-deploy smoke script.
- Main app binding contract.
- Deploy readiness handoff checker.

## What Is Not Implemented

- No deploy.
- No push.
- No production route.
- No real storage.
- No production backup.
- No restore.
- No Cloudflare service binding.
- No internal URL configured.
- No real bearer token configured.
- No main app integration yet.
- No scheduled backup job.
- No schema or migration change.
- No secret committed.

## Required Approvals Before Deploy

Before any real deploy phase:

- Repository owner approval.
- Backup service worker deploy target approval.
- Cloudflare account/project approval.
- Production route or workers.dev exposure decision.
- Secret provisioning approval.
- Post-deploy smoke approval.
- Rollback procedure approval.
- Production backup disabled/blocked confirmation.

## Required Secrets Before Deploy

Required runtime secret before internal endpoints can be used:

- `BACKUP_SERVICE_INTERNAL_TOKEN`

Required smoke env only when manually running post-deploy smoke:

- `BACKUP_SERVICE_SMOKE_BASE_URL`
- `BACKUP_SERVICE_SMOKE_TOKEN`

No real secret value belongs in this repository.

## Boundary

- No deploy in Phase 47.
- No push in Phase 47.
- No production backup.
- No real storage.
- No restore.
- No secret committed.
- No main app integration yet.
- No `.env.local` read.
- No `.dev.vars` read.
- No network/API/DB call unless a future operator explicitly sets smoke env outside this phase.
- No Cloudflare/Supabase/Google config mutation.
- No cron/schedule.
- No domain/Auth/OAuth config change.

## Known Notes

- Direct workspace `npm run build` may fail on Windows because `.next` is locked with EPERM.
- Clean temp build is the reliable local verification path when workspace `.next` is locked.
- `npm audit --audit-level=moderate` still reports known advisories in the Next/OpenNext/Wrangler dependency chain.
- No audit fix is run in this bundle.

## Recommended Next Phase

Recommended options for Phase 48:

- Phase 48 - Backup Service Worker Manual Deploy Execution, only if the repository owner explicitly approves real deploy and required secrets are ready.
- Phase 48 - Backup Service Worker GitHub Actions Deploy Workflow Readiness, if the goal is to prepare workflow checks without deploying.
- Phase 48 - Main App Backup Service Binding Implementation, if the goal is to connect main app to the worker with dry-run/internal behavior only.
