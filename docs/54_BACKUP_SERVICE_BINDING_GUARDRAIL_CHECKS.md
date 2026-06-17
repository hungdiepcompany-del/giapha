# Phase 54 - Backup Service Binding Guardrail Checks

## Production Baseline

Production remains on the existing main worker `web-gia-pha`.

Phase 54 does not deploy, push, call the backup service worker, call network/API/DB, read secrets, or create production backup.

## Guardrail Goal

Add static guardrails to ensure the main app does not accidentally call a real backup service worker, hardcode backup service secrets, or trigger real backup/restore/storage behavior.

The guardrail is local/static only.

## Paths Scanned

The checker scans these paths when they exist:

```txt
server/
app/
components/
lib/
services/
```

Missing paths are skipped safely.

## Forbidden Patterns

Forbidden patterns include:

- hardcoded `BACKUP_SERVICE_INTERNAL_TOKEN=...`
- hardcoded bearer token
- hardcoded backup service `workers.dev` URL
- backup service client outbound URL fetch without a dry-run guard
- `.env.local` read
- `.dev.vars` read
- direct production backup trigger
- production restore trigger
- real storage upload trigger

## Allowed Placeholders

Allowed placeholder names:

```txt
BACKUP_SERVICE_BASE_URL
BACKUP_SERVICE_INTERNAL_TOKEN
MAIN_APP_BACKUP_SERVICE_CLIENT_DRY_RUN_ONLY
backup_service_network_disabled
```

Placeholders must not include real values.

## Known Safe Exceptions

Safe exceptions:

- docs are not scanned by the guardrail.
- workflow files are not scanned by the guardrail.
- `services/backup-service` is allowed to contain the worker scaffold contract.
- false-valued safety markers such as `realBackupCreated: false`, `realStorageUpload: false`, and `restoreExecuted: false` are allowed.

## Failure Examples

Examples that should fail:

```txt
BACKUP_SERVICE_INTERNAL_TOKEN="real-value"
Authorization: Bearer real-token-value
https://web-gia-pha-backup-service.example.workers.dev
realBackupCreated: true
realStorageUpload: true
restoreExecuted: true
```

## Phase 54 Boundary

- No deploy.
- No push.
- No worker call.
- No network call.
- No secret read.
- No `.env.local` read.
- No `.dev.vars` read.
- No production backup.
- No real storage.
- No restore.

## Next Phase

Phase 55 - Backup Operator API Dry-Run Contract.
