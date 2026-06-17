# Phase 50 - Backup Service Worker Secrets Preflight Checklist

## Production Baseline

Production remains on the existing main worker `web-gia-pha` at `https://web-gia-pha.hungdiepcompany.workers.dev/`.

Phase 50 does not deploy, push, read secrets, create secrets, call GitHub/Cloudflare APIs, or create production backup.

## Backup Service Baseline

Backup service worker status:

- Service path: `services/backup-service`
- Workflow readiness: documented
- Manual deploy runbook: documented
- Real deploy: not done
- Real storage: not configured
- Main app integration: not implemented
- Production backup: not implemented

## Secrets Preflight Goal

This checklist defines what must be true before a real backup service worker deploy can use secrets.

It verifies readiness by checklist only. It does not read, print, generate, rotate, or store secret values.

## Required GitHub Secrets

Required GitHub Actions secret placeholders:

```txt
CLOUDFLARE_API_TOKEN
CLOUDFLARE_ACCOUNT_ID
```

These values must be configured manually in GitHub before a workflow deploy. Do not put values in the repository.

## Required Wrangler Secrets

Required future Wrangler/runtime secret placeholder:

```txt
BACKUP_SERVICE_INTERNAL_TOKEN
```

This value must be provisioned only after owner approval and must not be stored in `wrangler.jsonc` vars.

## Required Smoke Env

Required explicit smoke env placeholders:

```txt
BACKUP_SERVICE_SMOKE_BASE_URL
BACKUP_SERVICE_SMOKE_TOKEN
```

`BACKUP_SERVICE_SMOKE_BASE_URL` is required before smoke can call any URL.

`BACKUP_SERVICE_SMOKE_TOKEN` is required before internal endpoint smoke.

## Secret Ownership

Before deploy, assign owners for:

- GitHub Actions secrets
- Wrangler runtime secret
- smoke env values
- rotation schedule
- incident revocation
- post-deploy smoke validation

No single doc should store the secret values.

## Secret Rotation

Rotation checklist:

- Create new value outside the repository.
- Update approved secret store.
- Run post-deploy smoke.
- Revoke old value after confirmation.
- Record status only, not value.

## Secret Verification Without Printing Values

Allowed verification:

- presence check
- masked CI status
- safe pass/fail result
- safe missing variable name

Forbidden verification:

- printing value
- echoing token
- copying dashboard value to docs
- storing value in shell history
- committing `.env.local` or `.dev.vars`

## No-Secret-Logging Policy

Logs must not include:

- `BACKUP_SERVICE_INTERNAL_TOKEN` value
- `BACKUP_SERVICE_SMOKE_TOKEN` value
- `CLOUDFLARE_API_TOKEN` value
- `CLOUDFLARE_ACCOUNT_ID` value
- JWT-looking tokens
- passwords

## No-Go Conditions

Do not deploy if any condition is true:

- missing owner approval
- missing Cloudflare API token
- missing account id
- missing backup internal token
- no smoke URL
- no rollback plan
- local checks have not run
- no post-deploy tester is assigned
- secret owner is unknown
- production backup could run during deploy

## Phase 50 Boundary

- No deploy.
- No push.
- No secret read.
- No secret creation.
- No `.env.local` read.
- No `.dev.vars` read.
- No GitHub/Cloudflare API call.
- No production backup.
- No real storage.
- No restore.

## Next Phase

Phase 51 - Backup Service Worker Deploy Approval Gate.
