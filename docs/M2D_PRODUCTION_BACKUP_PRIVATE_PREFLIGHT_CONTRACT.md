# M2D production backup private preflight contract

## Authority and provenance

This document is the committed durable authority for the source contract authorized by
the Owner envelopes `GO M2D PRODUCTION BACKUP CONFIG + PRIVATE PREFLIGHT CONTRACT — SOURCE ONLY`
and `GO M2D CLEAN-MAIN LOCAL CHECKPOINT`, received 2026-09-13. Unrelated dirty logs and
decision records are intentionally excluded from the clean checkpoint; this document records
the applicable source authority and boundaries without asserting a numbered Decision.

## Scope

This source-only outcome creates no bucket, secret,
deployment, production backup, restore, database action, import, commit, push, or
cloud operation. A separate Owner gate remains required for every cloud or deployment action.
There is no production backup and no restore in this source-only outcome.

## Private worker contract

- `services/backup-service/wrangler.jsonc` keeps the top-level scaffold and isolated
  `fixture-local` contract unchanged in meaning.
- Named `production` resolves to `web-gia-pha-backup-service-production`, disables
  workers.dev and preview URLs, and declares no public route, domain, cron, or trigger.
- Production declares only `BACKUP_BUCKET` for proposed private bucket
  `gia-pha-prod-backups-apac-v1`; this source declaration neither creates nor accesses it.
- Required production secret names are `BACKUP_SERVICE_INTERNAL_TOKEN`,
  `BACKUP_DATA_KEY_V1_B64`, and `BACKUP_OBJECT_KEY_HMAC_V1_B64`. The active key version is `v1`.
- The free core main Worker declares neither `BACKUP_SERVICE_INTERNAL_TOKEN` nor
  `BACKUP_SERVICE_PRODUCTION`. Those optional backup bindings belong only to a
  future separately provisioned backup activation and must not block core releases.

## Marker-only preflight

`POST /internal/backup/production-preflight` requires the existing internal bearer check.
It validates production mode, R2 binding presence, both required production key values, and
active version `v1`. Both key values must be canonical base64 encoding of exactly 32 bytes.
Its response has only the fixed safe marker and configuration labels.
It performs zero R2/data operations, encryption, backup, multipart work, or restore.

## Crypto boundary

The independent production crypto module requires canonical base64 values that decode to exactly
32 bytes for both keys. It uses fresh 96-bit IV AES-256-GCM encryption and fixed versioned AAD
with only protocolVersion, dataKeyVersion, opaqueOperationId, chunkIndex, and totalChunks.
Production input is constrained to one sequential encrypted 8MiB chunk; larger payloads and any
non-zero/multi-chunk index fail closed. HMAC-derived opaque object keys are pure crypto only and
do not create, access, or list objects.

## Free core main app boundary

The top-level main Worker has no mandatory backup secret or service binding while backup
infrastructure is dormant. The server-only client models both optional bindings explicitly,
obtains the runtime environment with `getCloudflareContext`, and fails closed before any call
when either binding is unavailable. If a later separately approved activation provides them,
the client constructs a fixed new request to
the synthetic internal path, and sends only fixed method/path, content-type, accept, bearer,
x-request-id, and marker body. It never accepts or forwards inbound request URL, headers,
cookies, authorization, or body. It calls only the service binding and rejects any response that
does not exactly match the safe marker schema.

Core upload and traffic changes remain independently gated by the protected
`core-production` GitHub environment; this gate carries no R2 or backup dependency.

The admin preflight route reuses the existing `backup.operator.dry_run` or `permissions.manage`
permission shape. It reports safe status only; without the optional runtime it returns the fixed
`service_preflight_unavailable` response with HTTP 503. It exposes neither secret values nor raw
service errors and never creates a backup, storage upload, or restore.

## Manual workflow design

The manual-only workflow is upload-only: it creates a zero-traffic secret-bearing production
version and has no executable exact-version deployment branch. Upload creates a restrictive
ephemeral JSON secrets file in `RUNNER_TEMP`, applies `umask` and `chmod 600`, passes it to
`wrangler versions upload --env production --secrets-file`, and removes it with an EXIT trap.
There is no direct deploy command, version deployment command, artifact upload, automatic trigger,
or secret echo.

Exact-version deployment is deliberately absent and deferred. A future separate source + Owner
gate must first add and prove a protected GitHub environment and reviewer, a known-good prior version,
a private marker-only smoke path, routing-drift proof, and rollback ordering before any
deployment path may be introduced.

## Validation

Run locally without any cloud access:

```text
node scripts/check-m2d-production-backup-preflight.cjs
node --experimental-strip-types --experimental-loader ./scripts/m2a-node-ts-extension-loader.mjs scripts/test-m2d-production-backup-preflight.mjs
```
