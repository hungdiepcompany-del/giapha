# Backup Service Worker Scaffold

## Production Baseline

- Main worker: `web-gia-pha`
- Current production URL: https://web-gia-pha.hungdiepcompany.workers.dev/
- Backup service worker path: `services/backup-service/`
- Backup service worker deployment: not deployed.
- Production backup upload: not implemented.
- Production restore execution: not implemented.

## Scaffold Goal

Phase 39 creates the minimum backup service worker scaffold needed for future local contract checks. It does not deploy and does not integrate with the main app.

## Service Path

```text
services/backup-service/
```

Files:

- `services/backup-service/src/index.ts`
- `services/backup-service/wrangler.jsonc`
- `services/backup-service/README.md`

## Endpoint List

- `GET /health`
- `POST /internal/backup/dry-run`
- `POST /internal/backup/fixture-verify`

`GET /health` is public and non-sensitive. `/internal/*` routes require bearer auth.

## Auth Behavior

Internal routes expect:

```text
Authorization: Bearer BACKUP_SERVICE_INTERNAL_TOKEN
```

`BACKUP_SERVICE_INTERNAL_TOKEN` is an env placeholder only. No real token is stored in code, docs, or config.

## JSON Envelope

All responses use:

- `ok`
- `code`
- `message`
- `data`
- `requestId`

## Secret Handling

- Do not log token values.
- Do not print `Authorization`.
- Do not commit real secret values.
- `wrangler.jsonc` only contains non-secret `BACKUP_SERVICE_MODE`.
- Real token setup is deferred to a future approved phase.

## No-Network/No-Production Policy

- No Supabase client.
- No Google API.
- No Cloudflare API.
- No outbound network request.
- No real backup creation.
- No storage upload.
- No restore.
- Dry-run marker: `BACKUP_SERVICE_DRY_RUN_ONLY`.

## Wrangler Config Notes

- Worker name: `web-gia-pha-backup-service`
- Main: `src/index.ts`
- `workers_dev`: false
- No production route.
- No real secret in `vars`.

## Validation

- `npm run check:backup-service-worker-scaffold`
- `npm run check:backup-service-worker-boundary-design`
- `npm run check:service-boundary`
- `npm run check:opennext-cloudflare`
- `npm run backup:pipeline:readiness`
- `npm run typecheck`
- `npm run lint`

## Phase 39 Boundary

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

- Phase 40 - Backup Service Worker Local Contract Checks.
