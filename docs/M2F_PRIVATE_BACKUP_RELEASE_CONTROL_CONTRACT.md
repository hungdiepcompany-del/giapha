# M2F private backup release control contract

## Scope and hard boundary

This is source-only release control. It does not run a workflow, read secret values, call Cloudflare, create a bucket or Worker, upload a version, promote traffic, roll back, delete a Worker/version, create a backup, restore data, or change DB/Auth/RLS.

Both manual-only workflows require a nonempty `expected_source_sha` that is exactly 40 lower-hex characters, `github.ref == refs/heads/main`, and `github.sha == inputs.expected_source_sha`. Baseline `1a07401dec7172f76c3575b4bfc4c0e6a9c03397` is provenance only, never an operational hardcoded release SHA.

## Shared release lock and free core boundary

Every backup bootstrap, upload, promotion, rollback, and main upload/promotion/rollback path uses the one fixed group `m2f-private-backup-release-control`, with `cancel-in-progress: false`. Neither workflow has push, pull_request, or schedule triggers, or ref-derived concurrency.

Only the dormant backup-service workflow uses `environment: backup-production` and its backup
secrets. The free core main workflow shares the concurrency lock but must not reference that
environment, `BACKUP_SERVICE_INTERNAL_TOKEN`, `BACKUP_SERVICE_PRODUCTION`, R2, or a backup
secrets file. This keeps future backup activation serialized without making it a prerequisite
for the free core application.

Both main upload and main promotion/rollback jobs use the separate `core-production`
GitHub environment. Before either action is allowed, that environment must exist with the
Owner configured as a required reviewer. This free GitHub control preserves the production
approval boundary without coupling core release to backup infrastructure or R2.

## Backup bootstrap and later release paths

Bootstrap accepts only the exact single Cloudflare not-found code `10007` for absent `web-gia-pha-backup-service-production`, including Wrangler's human `[code: 10007]` error text; auth, network, malformed, duplicate-code, and code `10042` responses fail closed. It validates `gia-pha-prod-backups-apac-v1` from bucket-info JSON, asserts private top-level/production config, captures the exact active main deployment/version from `wrangler deployments status --json` plus the remote active version view before and after bootstrap, and uses `wrangler deploy --strict --env production --secrets-file`.

The temporary secret JSON uses the shell-created file path exported to Node, umask 077, mode 0600, and EXIT-trap cleanup. First deployment failure is a hard stop: no automatic delete or rollback is allowed. Post-state must prove the exact tagged backup version via `annotations['workers/tag']` and the current 100% deployment from `wrangler deployments status --json`, plus unchanged main current deployment/version and remote active version view/bindings.

Later `versions upload` is separately zero-traffic: `wrangler deployments status --json` must prove equal current routing before and after, and the exact tag/version must exist. Main upload uses `--keep-vars` without a backup secrets file. Wrangler 4.100.0 documents that secrets are never deleted by deployments, while `--keep-vars` preserves dashboard-managed non-secret variables. Promotion and rollback first prove the exact target version exists from `versions list`, verify the declared current deployment/version from `deployments status`, and then use `wrangler versions deploy <id>@100% --yes` followed by a current 100%-route proof. `deployments list` is history only and must never authorize traffic or satisfy a current-state precondition/postcheck.

## Authenticated operator smoke, after main promotion

This is not a public backup URL smoke and not secret-cookie CI. While backup infrastructure is dormant, the authenticated route must fail closed with `service_preflight_unavailable`. After a separately approved backup activation and main binding, an authenticated operator/browser may perform `POST /api/admin/backups/service-preflight`. Accept only the safe marker `BACKUP_OPERATOR_PRODUCTION_PREFLIGHT_ONLY`, safe service marker `BACKUP_SERVICE_PRODUCTION_PREFLIGHT_OK`, and all no-write booleans: `production_backup: false`, `storage_upload: false`, `restore: false`. No R2/data operation, backup, or restore is permitted. The browser/operator gate is separate from CI and must never use a public Worker URL.

## Manual main-first rollback

Activation-smoke failure never triggers rollback automatically. The operator first uses the guarded main rollback action with exact prior current/target version and verifies a 100% main deployment. Only then may the backup rollback action run, and it requires the literal `MAIN_ROLLBACK_100_VERIFIED`. Neither action deletes a Worker/version.

## Local validation

```text
npm run test:m2f-release-evidence
npm run check:m2f-release-control
npm run check:m2d-production-backup-preflight
```
