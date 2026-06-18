# Phase 95 - Backup Operator Authenticated Smoke Env Contract

## Production Baseline

Production remains on the existing main worker `web-gia-pha`.

Migration apply remains owner-confirmed. Independent DB verification and authenticated endpoint smoke have not completed because explicit shell env is unavailable.

## Authenticated Smoke Goal

Smoke the guarded backup operator surfaces with explicit authentication:

- `/admin/backups`
- `/api/admin/backups/service-dry-run`

The smoke verifies authenticated access and the existing dry-run safety envelope. It does not test or enable real backup execution.

## Allowed Env Placeholders

```txt
BACKUP_PERMISSION_SMOKE_BASE_URL
BACKUP_PERMISSION_SMOKE_EXPECTED_USER
BACKUP_PERMISSION_SMOKE_AUTH_COOKIE
BACKUP_PERMISSION_SMOKE_BEARER_TOKEN
```

Only variable names are documented. Values must be supplied directly through the current shell or CI secret context.

## Auth Material Handling

- Either `BACKUP_PERMISSION_SMOKE_AUTH_COOKIE` or `BACKUP_PERMISSION_SMOKE_BEARER_TOKEN` is required.
- Cookie is preferred if both are present.
- Auth material is attached only to the two approved main-app requests.
- The script does not print cookie/token values, request headers, base URL values, or response bodies.
- The script does not read `.env.local`, `.dev.vars`, or another repository env file.

## Safe Skip Behavior

If base URL, expected user, or both auth material options are unavailable, the script returns:

```txt
SKIPPED_MISSING_EXPLICIT_ENV
```

Safe-skip happens before `fetch` and reports `network_call: false`.

## API/UI Smoke Scope

API smoke uses `GET /api/admin/backups/service-dry-run` and requires:

- successful response
- `mode: dry_run`
- `worker_call: false`
- `production_backup: false`
- `storage_upload: false`
- `restore: false`

UI smoke uses `GET /admin/backups` with redirects disabled and requires HTTP 200 without redirect to login or unauthorized.

## No-Secret-Logging Policy

Output contains only status, selected auth method name, route labels, HTTP status codes, and safety booleans.

Cookie, bearer token, authorization header, base URL value, and response body are never printed.

## No-Real-Backup Policy

- No direct backup service worker call.
- No production backup creation.
- No storage upload.
- No restore.
- No execute/restore runtime enablement.
- No cron or schedule.

The API route remains the existing local dry-run adapter with safety fields set to false.

## Phase 95 Boundary

- Contract and authenticated smoke hardening only.
- No deploy or push.
- No migration rerun/apply or DB mutation.
- No fallback `permissions.manage` removal.
- Execute/restore runtime remains disabled.
- No domain, DNS, Auth, or OAuth configuration change.
- No env-file read.
- No secret committed.

## Next Phase

Phase 96 - Backup Permission Verification Completion Run.
