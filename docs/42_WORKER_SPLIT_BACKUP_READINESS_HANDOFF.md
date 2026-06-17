# Phase 42 - Worker Split Backup Readiness Handoff

## Current Production Baseline

Production remains on the existing web app baseline at `https://web-gia-pha.hungdiepcompany.workers.dev/`.

Phase 42 does not deploy, push, change production routing, run a production backup, configure real storage, read secrets, or integrate the main app with the backup service worker.

## Phase 37-42 Summary

Phase 37 reviewed repository hygiene before worker split work. The dirty `GIA_PHA_GITHUB_MENU.bat` state was treated as line-ending/touched-file noise and restored to HEAD.

Phase 38 documented the backup service worker boundary design.

Phase 39 scaffolded a minimal standalone backup service worker under `services/backup-service`.

Phase 40 added local/static contract checks and a contract smoke command for the worker source.

Phase 41 documented future main app integration readiness by service binding or internal URL plus Bearer token, without implementing that integration.

Phase 42 records the worker split and backup readiness handoff so the next phase can choose deploy readiness, service binding design, or production backup approval follow-up from a stable baseline.

## Repository Hygiene Status

- GitHub menu script hygiene has been reviewed.
- No content change was committed for `GIA_PHA_GITHUB_MENU.bat`.
- Worker split files are separated from main app routes.
- Backup readiness remains docs/checker driven.
- No `.env`, `.env.local`, `.dev.vars`, token, key, or secret is committed.

## Backup Service Worker Status

The backup service worker exists as a small standalone scaffold. It is not deployed and has no production route.

Current service status:

- Service path: `services/backup-service`
- Worker source: `services/backup-service/src/index.ts`
- Worker config: `services/backup-service/wrangler.jsonc`
- Service README: `services/backup-service/README.md`
- Mode: local scaffold and contract readiness only
- Real storage: not implemented
- Main app integration: not implemented

## Service Files

- `services/backup-service/src/index.ts`
- `services/backup-service/wrangler.jsonc`
- `services/backup-service/README.md`
- `docs/38_BACKUP_SERVICE_WORKER_BOUNDARY_DESIGN.md`
- `docs/39_BACKUP_SERVICE_WORKER_SCAFFOLD.md`
- `docs/40_BACKUP_SERVICE_WORKER_LOCAL_CONTRACT_CHECKS.md`
- `docs/41_BACKUP_SERVICE_WORKER_INTEGRATION_READINESS.md`
- `docs/42_WORKER_SPLIT_BACKUP_READINESS_HANDOFF.md`
- `scripts/check-backup-service-worker-boundary-design.cjs`
- `scripts/check-backup-service-worker-scaffold.cjs`
- `scripts/check-backup-service-worker-local-contract.cjs`
- `scripts/smoke-backup-service-worker-contract.cjs`
- `scripts/check-backup-service-worker-integration-readiness.cjs`
- `scripts/check-worker-split-backup-readiness-handoff.cjs`

## Worker Endpoints

Documented/scaffolded endpoints:

- `GET /health`
- `POST /internal/backup/dry-run`
- `POST /internal/backup/fixture-verify`

Internal endpoints require a placeholder bearer auth boundary:

```txt
Authorization: Bearer BACKUP_SERVICE_INTERNAL_TOKEN
```

`BACKUP_SERVICE_INTERNAL_TOKEN` is a placeholder name only. No real token is stored in the repository.

## Checks Available

Run these commands before any next worker split or backup readiness phase:

```bash
npm run check:backup-service-worker-boundary-design
npm run check:backup-service-worker-scaffold
npm run check:backup-service-worker-local-contract
npm run smoke:backup-service-worker:contract
npm run check:backup-service-worker-integration-readiness
npm run check:worker-split-backup-readiness-handoff
```

Related backup readiness checks:

```bash
npm run check:production-backup-approval-checklist
npm run check:storage-upload-verification-dry-run
npm run backup:storage:verify-upload:dry-run
npm run check:local-sandbox-storage-adapter-prototype
npm run backup:storage:adapter:local
npm run backup:pipeline:readiness
npm run check:service-boundary
npm run check:opennext-cloudflare
```

## What Is Implemented

- Repository hygiene review for the GitHub menu script.
- Backup service worker boundary design.
- Backup service worker scaffold under `services/backup-service`.
- Public health endpoint scaffold.
- Internal dry-run endpoint scaffold.
- Internal fixture verify endpoint scaffold.
- JSON response envelope scaffold.
- Bearer auth placeholder boundary for internal routes.
- Local/static contract checks.
- Integration readiness design for future service binding or internal URL plus Bearer token.
- Handoff doc and checker for the worker split backup readiness baseline.

## What Is Not Implemented

- No deploy.
- No push.
- No production backup.
- No real storage.
- No cloud storage upload.
- No restore.
- No main app integration yet.
- No Cloudflare service binding yet.
- No internal backup service URL yet.
- No real bearer token configured.
- No schedule/cron job.
- No schema change.
- No migration.
- No secret/key committed.

## Deployment Boundary

Phase 42 does not run or authorize:

- Cloudflare Worker deploy command
- OpenNext Cloudflare deploy command
- Cloudflare production route changes
- Cloudflare service binding changes
- Worker custom domain changes
- Git push

Deploy readiness must be a separate phase with explicit approval.

## Secret Boundary

Phase 42 does not read or write secret files.

Forbidden in this phase:

- `.env`
- `.env.local`
- `.dev.vars`
- real Supabase keys
- real Cloudflare API tokens
- real Google client secrets
- real bearer tokens
- logging or documenting secret values

Placeholder names are allowed only as non-secret documentation.

## Production Backup Boundary

Phase 42 does not create, upload, delete, restore, or verify any production backup.

All backup commands remain fixture/local/sandbox oriented unless a later phase explicitly approves production backup with owner, storage target, privacy, retention, restore drill, and rollback criteria.

## Recommended Next Phase

Recommended next phase:

Phase 43 - Backup Service Worker Deploy Readiness Gate.

Suggested scope:

- Keep no-deploy until final approval.
- Decide whether the worker should be deployed as separate Cloudflare Worker or only prepared for future deploy.
- Define service binding names without setting real secret values.
- Add a local no-secret deploy readiness checker.
- Keep production backup disabled.
