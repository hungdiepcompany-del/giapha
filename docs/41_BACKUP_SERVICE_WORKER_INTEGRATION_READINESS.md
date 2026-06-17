# Backup Service Worker Integration Readiness

## Production Baseline

- Main worker: `web-gia-pha`
- Backup service scaffold: `services/backup-service/`
- Backup service deployment: not deployed.
- Main app integration: not implemented.
- Production backup upload: not implemented.
- Production restore execution: not implemented.

## Integration Readiness Goal

Phase 41 documents how a future main app integration should call the backup service worker safely. It does not connect the main app, add bindings, add secrets, call the service, or deploy.

## Main App Boundary

- Do not import backup service source into the main app.
- Do not add main app routes that call the backup service in Phase 41.
- Do not add UI buttons for backup service execution.
- Do not move backup/storage logic back into the main Next/OpenNext worker.

## Service Binding Option

Option A: Cloudflare service binding.

- Future main worker could call the backup service through a Cloudflare service binding.
- Binding name should be explicit, for example `BACKUP_SERVICE`.
- Binding setup must be done in a future deploy-readiness phase.
- No production binding is added in Phase 41.

## Internal Token Option

Option B: internal URL + Bearer token.

- Future main worker could call an internal service URL.
- Requests must include `Authorization: Bearer BACKUP_SERVICE_INTERNAL_TOKEN`.
- Token value must stay outside repo and logs.
- No internal URL or token is configured in Phase 41.

## Request Envelope

Future requests should use:

```json
{
  "requestId": "generated-id",
  "operation": "backup-dry-run",
  "mode": "dry-run",
  "actor": {
    "type": "system",
    "id": "server"
  },
  "payload": {}
}
```

## Response Envelope

Future responses should use:

```json
{
  "ok": true,
  "code": "BACKUP_SERVICE_DRY_RUN_OK",
  "message": "Dry-run completed.",
  "data": {},
  "requestId": "generated-id"
}
```

## Error Mapping

- `401` maps to missing/invalid internal auth.
- `404` maps to service route mismatch.
- `405` maps to method mismatch.
- `5xx` maps to backup service unavailable or failed.
- Main app must show safe high-level errors only.

## Timeout/Retry Policy

- Use short timeouts for synchronous admin actions.
- Do not retry mutation-like operations blindly.
- Retry dry-run/readiness checks only when idempotent.
- Record request ID for debugging.

## Logging Policy

- Do not log bearer token.
- Do not log authorization header.
- Do not log private family payload.
- Log safe request ID, operation, status code, and error code only.

## No-Production-Call Policy

Phase 41 does not call the backup service from the main app.

- No service binding.
- No internal URL.
- No network call.
- No production backup.
- No real storage upload.
- No restore.
- No cron.

## Future Env Placeholders

- `BACKUP_SERVICE_BINDING`
- `BACKUP_SERVICE_INTERNAL_URL`
- `BACKUP_SERVICE_INTERNAL_TOKEN`
- `BACKUP_SERVICE_TIMEOUT_MS`

Names only; no real values are added.

## Required Approvals Before Real Integration

- Production backup approval checklist reviewed.
- Storage target selected if integration can trigger storage behavior.
- Secret handling plan approved.
- Privacy review approved.
- Restore drill evidence current.
- Deploy-readiness review completed.

## Phase 41 Boundary

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

- Phase 42 - Worker Split & Backup Readiness Handoff.
