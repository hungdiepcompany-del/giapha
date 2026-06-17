# Phase 44 - Backup Service Worker Env Secret Contract

## Production Baseline

Production remains on the existing main worker `web-gia-pha` at `https://web-gia-pha.hungdiepcompany.workers.dev/`.

Phase 44 does not deploy, push, read runtime secrets, create production backup, configure storage, or mutate Cloudflare/Supabase/Google settings.

## Backup Service Baseline

The backup service worker remains a scaffold under `services/backup-service`.

Current status:

- Service path: `services/backup-service`
- Real deploy: not done
- Real route: not configured
- Real storage: not configured
- Main app integration: not implemented
- Production backup: not implemented

## Env/Secret Contract Goal

This runbook defines the future env and secret contract for the backup service worker. It does not provision secrets and does not store secret values.

The goal is to make future deploy or binding work explicit before any runtime secret is introduced.

## Required Secrets

Future required runtime secret:

```txt
BACKUP_SERVICE_INTERNAL_TOKEN
```

Rules:

- This is a future runtime secret.
- Do not put the real value in docs.
- Do not put the real value in `wrangler.jsonc` vars.
- Do not commit it to `.env.local`.
- Do not commit it to `.dev.vars`.
- Do not print it in logs.
- Do not expose it to client code.

## Optional Vars

Optional future non-secret or mode placeholders:

```txt
BACKUP_STORAGE_PROVIDER
BACKUP_STORAGE_DRY_RUN
BACKUP_STORAGE_PREFIX
BACKUP_RETENTION_POLICY
```

These names are placeholders only in Phase 44. They are not configured for production and do not select a real storage provider.

## Secret Provisioning Checklist

Before a future approved deploy:

- Confirm the repository owner approves backup service deploy.
- Confirm the exact runtime environment that needs `BACKUP_SERVICE_INTERNAL_TOKEN`.
- Generate a long random token outside the repository.
- Store the token only in the approved secret manager.
- Confirm the token is not present in docs, git diff, shell logs, or CI output.
- Confirm the main app integration phase has an approved way to send the auth header.
- Confirm rollback steps are documented before first production use.

No secret provisioning is performed in Phase 44.

## Secret Rotation Checklist

For future rotation:

- Create a new token outside the repository.
- Update the approved runtime secret store.
- Update any approved caller secret store in the same maintenance window.
- Smoke test `/health` and internal dry-run after rotation.
- Revoke the old token after the new one is confirmed.
- Record only the rotation date/status, never the token value.

No secret rotation is performed in Phase 44.

## Local Development Boundary

Phase 44 does not read or create local secret files.

Forbidden local files:

- `.env`
- `.env.local`
- `.dev.vars`

Local development can use documented placeholder names only. Any future local smoke script must skip safely unless explicit env values are provided by the operator.

## CI Boundary

Phase 44 does not add a scheduled job, deploy job, or secret-consuming CI job.

Future CI may check for presence of required secret names, but must not print values and must not run production backup without explicit approval.

## Logging Safety

Logs may include:

- safe error code
- safe status
- request id
- route name

Logs must not include:

- bearer token
- secret value
- Supabase key
- Cloudflare API token
- Google client secret
- backup payload with private family data

## Failure Modes

Expected future failure modes:

- missing `BACKUP_SERVICE_INTERNAL_TOKEN`
- invalid bearer token
- missing smoke base URL
- storage provider not configured
- storage dry-run disabled incorrectly
- retention policy not approved

Each failure should return a safe code/message without printing secret values.

## No-Secret-In-Docs Policy

Docs may contain placeholder names only.

Docs must not contain real token/key/secret values, JWT-looking strings, API keys, passwords, or copied dashboard secret values.

## Phase 44 Boundary

- No deploy.
- No push.
- No secret read.
- No secret provisioning.
- No secret rotation.
- No `.env.local` read or write.
- No `.dev.vars` read or write.
- No Cloudflare/Supabase/Google API call.
- No production backup.
- No real storage.
- No restore.

## Next Phase

Phase 45 - Backup Service Worker Post-Deploy Smoke Plan.
