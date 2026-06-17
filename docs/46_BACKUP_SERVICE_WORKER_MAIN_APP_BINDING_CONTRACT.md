# Phase 46 - Backup Service Worker Main App Binding Contract

## Production Baseline

Production remains on the existing main worker `web-gia-pha` at `https://web-gia-pha.hungdiepcompany.workers.dev/`.

Phase 46 does not deploy, does not modify main app runtime, and does not call the backup service worker.

## Backup Service Baseline

The backup service worker remains a scaffold under `services/backup-service`.

Current status:

- Worker source exists.
- Deploy readiness gate exists.
- Env/secret contract exists.
- Post-deploy smoke plan exists.
- Real deploy is not done.
- Real storage is not configured.
- Main app integration is not implemented.
- Production backup is not implemented.

## Binding Contract Goal

This document defines how the main app could call the backup service worker in a future approved implementation.

Phase 46 is contract-only. It does not add runtime code, bindings, routes, env values, or secret values.

## Main App Boundary

Main app runtime remains unchanged in Phase 46.

Future implementation must keep:

- permission checks in the main app before backup actions
- server-only caller code
- no service role key on the client
- no backup payload in browser logs
- no production backup without explicit approval

## Service Binding Option

Option A: Cloudflare service binding

Future shape:

- Main app receives a Cloudflare service binding from runtime config.
- Main app calls the backup service worker through the binding from server-side code only.
- No public URL is needed for internal calls.
- Binding name must be documented before deployment.
- Binding must not be added until a dedicated implementation phase is approved.

## Internal URL Option

Option B: internal URL + Bearer token

Future shape:

- Main app reads an internal backup service URL from server-only runtime env.
- Main app reads `BACKUP_SERVICE_INTERNAL_TOKEN` from server-only runtime secret storage.
- Main app sends `Authorization: Bearer BACKUP_SERVICE_INTERNAL_TOKEN`.
- URL and token values must never be exposed to the client.
- This option requires explicit operator approval before implementation.

## Auth Header Contract

Future internal HTTP calls must use:

```txt
Authorization: Bearer BACKUP_SERVICE_INTERNAL_TOKEN
```

The header is contract text only in Phase 46. No real token is configured.

## Request Envelope Contract

Future requests from main app to backup service worker should include:

- `requestId`
- `requestedByProfileId`
- `action`
- `dryRun`
- `source`
- `createdAt`

Backup actions must default to dry-run until production backup approval is complete.

## Response Envelope Contract

Backup service worker responses should keep:

- `ok`
- `code`
- `message`
- `data`
- `requestId`

Main app should display safe `code` and `message` only. It must not display tokens, headers, or raw secret config.

## Error Mapping

Future main app mapping:

- `AUTH_REQUIRED` -> show internal auth configuration error
- `METHOD_NOT_ALLOWED` -> show service contract mismatch
- `NOT_FOUND` -> show service route mismatch
- `BACKUP_SERVICE_DRY_RUN_OK` -> show dry-run success
- unknown error -> show safe fallback and request id

## Timeout Policy

Future caller should use a short timeout for smoke/dry-run calls.

Timeout should fail closed with a safe message and should not retry indefinitely.

## Retry Policy

Future caller may retry idempotent smoke/dry-run checks once.

Future production backup actions must not retry automatically until idempotency, storage keys, and duplicate prevention are approved.

## Logging Policy

Allowed logs:

- request id
- action
- safe status code
- safe response code

Forbidden logs:

- bearer token
- internal service URL if private
- Supabase service role key
- Cloudflare API token
- backup payload with private family data
- raw response headers containing sensitive data

## Permission Boundary

Future main app calls must require an explicit server-side permission before invoking backup service worker actions.

Suggested future permission:

```txt
backup.manage
```

The exact permission model must be approved in the implementation phase and must not bypass existing role/permission checks.

## Future Implementation Checklist

- Choose Option A or Option B.
- Approve deploy/runtime boundary.
- Approve secret provisioning.
- Approve permission model.
- Add server-only caller code.
- Add safe UI state if needed.
- Add dry-run first.
- Add tests/checks before any production backup.
- Run post-deploy smoke with explicit env if deployed.

## Phase 46 Boundary

- No main app runtime change.
- No binding added to production config.
- No internal URL configured.
- No real token configured.
- No deploy.
- No service call.
- No production backup.
- No real storage.
- No restore.
- No secret read.

## Next Phase

Phase 47 - Backup Service Worker Deploy Readiness Handoff.
