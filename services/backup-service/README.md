# Backup Service Worker

This folder is a scaffold for a future small Cloudflare Worker dedicated to backup/storage readiness.

Current status:

- Not deployed.
- No production route.
- No real storage provider.
- No production backup creation.
- No production restore.
- Internal endpoints use the placeholder env name `BACKUP_SERVICE_INTERNAL_TOKEN`.

Endpoints:

- `GET /health`
- `POST /internal/backup/dry-run`
- `POST /internal/backup/fixture-verify`

The scaffold exists to keep future backup/storage work out of the main Next/OpenNext worker until an explicit integration phase approves it.
