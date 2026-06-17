# Phase 48 - Backup Service Worker GitHub Actions Deploy Workflow Readiness

## Production Baseline

Production remains on the existing main worker:

- Main Worker: `web-gia-pha`
- Production URL: `https://web-gia-pha.hungdiepcompany.workers.dev/`
- Existing main deploy workflow: `.github/workflows/cloudflare-deploy.yml`
- Existing backup readiness workflow: `.github/workflows/backup-readiness.yml`

Phase 48 does not run GitHub Actions, deploy, push, mutate Cloudflare config, read secrets, or create production backup.

## Backup Service Baseline

Backup service worker status:

- Service path: `services/backup-service`
- Worker source: `services/backup-service/src/index.ts`
- Wrangler config: `services/backup-service/wrangler.jsonc`
- Production route: not configured
- Real deploy: not done
- Real storage: not configured
- Main app integration: not implemented

## Workflow Readiness Goal

Create a manual-only GitHub Actions workflow file for a future backup service worker deploy.

The workflow is readiness infrastructure only until the repository owner explicitly runs it from GitHub with required secrets configured.

## Manual-Only Trigger

The workflow must use only:

```yaml
on:
  workflow_dispatch:
```

It must not include `push`, `pull_request`, or `schedule` triggers.

## Required GitHub Secrets Placeholders

The workflow may reference GitHub Actions secrets by name only:

- `secrets.CLOUDFLARE_API_TOKEN`
- `secrets.CLOUDFLARE_ACCOUNT_ID`

No secret value belongs in workflow YAML, docs, shell logs, or commits.

## Required Checks Before Deploy

The workflow runs readiness checks before the deploy step:

- `npm run check:backup-service-worker-deploy-readiness`
- `npm run check:backup-service-worker-env-secret-contract`
- `npm run check:backup-service-worker-post-deploy-smoke-plan`
- `npm run check:backup-service-worker-main-app-binding-contract`
- `npm run typecheck`
- `npm run lint`

## Deploy Job Safety

The deploy step is scoped to:

```txt
services/backup-service
```

The future deploy command is:

```bash
npx wrangler deploy
```

This command is present only inside the manual GitHub Actions workflow. It is not run locally in Phase 48.

## No-Schedule Policy

The workflow must not include `schedule:`.

Backup service deploy must not be automated until owner approval, secret readiness, smoke readiness, and rollback readiness are complete.

## No-Auto-Push Policy

The workflow must not include `push:` or `pull_request:`.

No backup service worker deploy should happen automatically from code changes in this phase.

## Rollback Notes

Before a real workflow run, the operator must know:

- previous known-good worker version
- how to re-run a previous deploy
- smoke test owner
- rollback decision owner
- expected downtime or route exposure

Rollback execution is not implemented in Phase 48.

## Phase 48 Boundary

- No deploy.
- No push.
- No workflow run.
- No schedule.
- No production backup.
- No real storage.
- No secret read.
- No secret committed.
- No Cloudflare/Supabase/Google API call from local workspace.
- No main app deploy change.

## Next Phase

Phase 49 - Backup Service Worker Manual Deploy Runbook.
