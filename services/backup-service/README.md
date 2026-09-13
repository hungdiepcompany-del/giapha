# Backup Service Worker

This folder is a scaffold for a future small Cloudflare Worker dedicated to backup/storage readiness.

Current status:

- Not deployed.
- No production route.
- No real storage provider.
- No production backup creation.
- No production restore.
- Internal endpoints use the placeholder env name `BACKUP_SERVICE_INTERNAL_TOKEN`.
- The default configuration has no R2 binding. The fixture-only R2 binding exists
  only under named `fixture-local`, whose mode must be explicit; `scaffold` does
  not write.
- The fixture route accepts only the checked-in sample fixture SHA-256 allowlist,
  encrypts it with AES-256-GCM, and returns hashes/counts only.
- `remote: false` controls Wrangler local-development binding behavior only. It
  does not authorize a deploy, create a local-only deployment target, or prevent
  a named-environment deploy from reaching Cloudflare; any deploy remains forbidden
  and Owner-gated.

Endpoints:

- `GET /health`
- `POST /internal/backup/dry-run`
- `POST /internal/backup/fixture-verify`
- `POST /internal/backup/fixture-roundtrip` (authenticated, `fixture-local` only)

The scaffold exists to keep future backup/storage work out of the main Next/OpenNext worker until an explicit integration phase approves it.
