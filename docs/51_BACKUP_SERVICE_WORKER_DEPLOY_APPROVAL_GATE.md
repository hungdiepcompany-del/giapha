# Phase 51 - Backup Service Worker Deploy Approval Gate

## Production Baseline

Production remains on the existing main worker `web-gia-pha` at `https://web-gia-pha.hungdiepcompany.workers.dev/`.

Phase 51 does not deploy, push, read secrets, call APIs, or create production backup.

## Backup Service Baseline

Backup service worker status:

- Service path: `services/backup-service`
- GitHub Actions deploy workflow readiness: documented
- Manual deploy runbook: documented
- Secrets preflight checklist: documented
- Real deploy: not done
- Production backup: not implemented

## Deploy Approval Goal

This gate defines the required owner approval before any real backup service worker deploy.

Approval is not granted by this document. Approval must be explicitly recorded by the repository owner before deploy execution.

## Approval Checklist

OWNER_APPROVAL_REQUIRED_BEFORE_REAL_DEPLOY=true

Owner confirms:

- deploy target
- worker name
- secret readiness
- smoke readiness
- rollback plan
- no production backup will run

Additional checklist:

- deployment window is approved
- rollback owner is assigned
- smoke owner is assigned
- secrets owner is assigned
- local validation commands have passed
- production backup remains disabled

## Required Validation Before Approval

Required validation commands before owner approval:

```bash
npm run check:backup-service-worker-github-actions-deploy-readiness
npm run check:backup-service-worker-manual-deploy-runbook
npm run check:backup-service-worker-secrets-preflight-checklist
npm run check:backup-service-worker-deploy-readiness
npm run check:backup-service-worker-post-deploy-smoke-plan
npm run backup:pipeline:readiness
npm run typecheck
npm run lint
```

## Required Secrets Before Approval

Required secret placeholders must be confirmed present in approved secret stores:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`
- `BACKUP_SERVICE_INTERNAL_TOKEN`

Required smoke env placeholders must be ready outside the repository:

- `BACKUP_SERVICE_SMOKE_BASE_URL`
- `BACKUP_SERVICE_SMOKE_TOKEN`

Do not write values in this document.

## Required Rollback Owner

Rollback owner must be named before real deploy.

Rollback owner responsibilities:

- decide rollback/no-rollback after smoke
- know previous known-good deploy path
- coordinate secret rotation if token exposure is suspected
- record incident status without secret values

## Required Smoke Owner

Smoke owner must be named before real deploy.

Smoke owner responsibilities:

- run post-deploy smoke
- confirm `/health`
- confirm internal dry-run only when token env is explicitly available
- report safe status without token values

## Required Deployment Window

Deploy window must be approved before real deploy.

The window must include:

- operator
- rollback owner
- smoke owner
- expected start time
- expected verification time
- no-production-backup confirmation

## Explicit Owner Approval Statement

Use this statement only when the owner has approved real deploy:

```txt
OWNER_APPROVAL_REQUIRED_BEFORE_REAL_DEPLOY=true
OWNER_APPROVED_BACKUP_SERVICE_WORKER_DEPLOY=<not set in repo>
```

The second line must be filled only outside the repository in the operational record.

## No-Go Conditions

Do not deploy if any condition is true:

- owner approval is missing
- deploy target is unclear
- worker name is unclear
- required secret readiness is missing
- smoke readiness is missing
- rollback plan is missing
- rollback owner is missing
- smoke owner is missing
- deployment window is missing
- production backup might run
- local validation has not passed

## Phase 51 Boundary

- No deploy.
- No push.
- No secret read.
- No secret creation.
- No API call.
- No production backup.
- No real storage.
- No restore.
- No main app integration.

## Next Phase

Phase 52 - Backup Service Worker Pre-Deploy Handoff.
