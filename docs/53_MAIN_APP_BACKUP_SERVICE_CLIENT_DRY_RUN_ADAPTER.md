# Phase 53 - Main App Backup Service Client Dry-Run Adapter

## Production Baseline

Production remains on the existing main worker `web-gia-pha`.

Phase 53 does not deploy, push, call the backup service worker, call production network/API/DB, read secrets, or create production backup.

## Backup Service Baseline

Backup service worker status:

- Service path: `services/backup-service`
- Endpoints: `/health`, `/internal/backup/dry-run`, `/internal/backup/fixture-verify`
- Real deploy: not done
- Real storage: not configured
- Main app integration real call: not implemented
- Production backup: not implemented

## Main App Client Goal

Create a main app backup service client adapter in:

```txt
server/services/backup-service-client.ts
```

The repo did not previously have `server/services`, so Phase 53 creates that server-side boundary for future backup service callers.

## Dry-Run Adapter Behavior

The adapter is dry-run only and contains:

```txt
MAIN_APP_BACKUP_SERVICE_CLIENT_DRY_RUN_ONLY
```

Supported simulated actions:

- `health`
- `dryRun`
- `fixtureVerify`

Each action returns a local response envelope and records that no worker was called.

## Disabled Network Policy

The adapter must not call network by default.

Future network behavior is disabled by:

```txt
backup_service_network_disabled
```

No real backup service worker call is made in Phase 53.

## Future Env Placeholders

Allowed placeholder names:

```txt
BACKUP_SERVICE_BASE_URL
BACKUP_SERVICE_INTERNAL_TOKEN
```

These are contract names only. No values are read, logged, or committed.

## Request Envelope

Dry-run request fields:

- `requestId`
- `requestedByProfileId`
- `source`

All fields are optional in Phase 53 and do not trigger real backup work.

## Response Envelope

The local response envelope includes:

- `ok`
- `code`
- `message`
- `data`
- `requestId`
- `dryRun`

## Error Mapping

Current dry-run behavior:

- health -> `MAIN_APP_BACKUP_SERVICE_HEALTH_DRY_RUN`
- dryRun -> `MAIN_APP_BACKUP_SERVICE_DRY_RUN_ONLY`
- fixtureVerify -> `MAIN_APP_BACKUP_SERVICE_FIXTURE_VERIFY_DRY_RUN`
- future network attempt -> `backup_service_network_disabled`

## Secret Safety

The adapter must not:

- read `.env.local`
- read `.dev.vars`
- log token values
- hardcode URLs
- hardcode `BACKUP_SERVICE_INTERNAL_TOKEN` values
- import Supabase clients
- call production API/DB/network

## Phase 53 Boundary

- No deploy.
- No push.
- No production backup.
- No real storage.
- No worker call.
- No network call.
- No secret read.
- No schema or migration change.
- No data mutation.

## Next Phase

Phase 54 - Backup Service Binding Guardrail Checks.
