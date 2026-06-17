# Backup Service Worker Boundary Design

## Production Baseline

- Main worker: `web-gia-pha`
- Current production URL: https://web-gia-pha.hungdiepcompany.workers.dev/
- Backup readiness commands are local/dry-run only.
- Production backup storage target is not selected.
- Production backup upload is not implemented.
- Backup service worker is not deployed.

## Worker Split Goal

Design a small backup service worker boundary before adding runtime files. The goal is to keep backup/storage logic out of the main Next/OpenNext worker unless integration is explicitly approved later.

## Why A Small Worker

- Keep the main app focused on UI, auth, family data, tree, export/import pages, and lightweight server routes.
- Avoid increasing main worker bundle/startup with backup/storage concerns.
- Allow backup/storage contracts to evolve independently.
- Make future internal auth, retries, and logging easier to reason about.

## Proposed Service Path

Future service path:

```text
services/backup-service/
```

Phase 38 only designs this path. It does not create the worker code.

## Public Vs Internal Endpoints

Proposed endpoints:

```text
GET /health
POST /internal/backup/dry-run
POST /internal/backup/fixture-verify
```

- `GET /health` is public and non-sensitive.
- `POST /internal/*` endpoints are internal only.
- No public mutation endpoint is proposed.
- No endpoint creates production backup data in Phase 38.

## Auth Boundary

Future internal requests should use:

```text
Authorization: Bearer BACKUP_SERVICE_INTERNAL_TOKEN
```

`BACKUP_SERVICE_INTERNAL_TOKEN` is a placeholder name only. No real token is created, read, printed, or committed in Phase 38.

## Secret/Env Placeholders

Future placeholders may include:

- `BACKUP_SERVICE_INTERNAL_TOKEN`
- `BACKUP_SERVICE_MODE`
- `BACKUP_SERVICE_ALLOWED_CALLER`

These names are not secret values. Real values must be configured outside the repo and never printed.

## JSON Envelope

All responses should use a consistent JSON envelope:

```json
{
  "ok": true,
  "code": "BACKUP_SERVICE_HEALTH_OK",
  "message": "Service is reachable.",
  "data": {},
  "requestId": "local-placeholder"
}
```

Error envelope shape:

```json
{
  "ok": false,
  "code": "AUTH_REQUIRED",
  "message": "Authorization is required.",
  "data": null,
  "requestId": "local-placeholder"
}
```

## Error Handling

- Missing bearer token should return `401`.
- Invalid bearer token should return `401`.
- Unknown route should return `404`.
- Method mismatch should return `405`.
- Error messages must not include token, secret, request body, stack trace, or private payload data.

## Logging Policy

- Do not log `Authorization` headers.
- Do not log token values.
- Do not log request payloads containing family data.
- Log only safe request ID, route, status code, and high-level error code in a future runtime phase.

## Bundle/Startup Safety

- Keep dependencies minimal.
- Do not add provider SDKs in boundary/scaffold phases.
- Keep fixture/dry-run logic lightweight.
- Avoid importing main app modules into the backup worker.
- Avoid importing Next/OpenNext app code into the backup worker.

## No-Production-Backup Policy

Phase 38 does not create production backup behavior:

- No real backup creation.
- No real storage upload.
- No real restore.
- No cron.
- No scheduled trigger.
- No provider API call.
- No production storage mutation.

## Deployment Boundary

- Do not deploy the backup service worker in Phase 38.
- Do not add production routes.
- Do not add Cloudflare service binding.
- Do not add GitHub workflow deploy behavior for this service.
- Do not push.

## Acceptance Criteria

- Service path is documented as `services/backup-service`.
- Proposed endpoints include `GET /health`, `POST /internal/backup/dry-run`, and `POST /internal/backup/fixture-verify`.
- Auth placeholder uses `Authorization: Bearer BACKUP_SERVICE_INTERNAL_TOKEN`.
- JSON envelope is documented.
- No production backup/storage/deploy behavior is introduced.
- `npm run check:backup-service-worker-boundary-design` passes.

## Phase 38 Boundary

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

- Phase 39 - Backup Service Worker Scaffold.
