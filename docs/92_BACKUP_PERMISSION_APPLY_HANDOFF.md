# Phase 92 - Backup Permission Apply Handoff

## Current Production Baseline

Production remains on the existing main worker `web-gia-pha`.

The backup permission migration was owner-confirmed applied through the Supabase Dashboard SQL Editor on project ref `frkyeuxrlcflmsxxsolp`.

## Phase 88-92 Summary

- Phase 88 recorded the owner-confirmed manual migration apply.
- Phase 89 added read-only DB verification with safe-skip behavior.
- Phase 90 ran safe runtime smoke scripts.
- Phase 91 assessed fallback removal readiness.
- Phase 92 records this apply handoff.

## Migration Apply Status

Status:

```txt
OWNER_CONFIRMED_APPLIED
```

Migration:

```txt
db/migrations/20260618_0007_backup_operator_permissions.sql
```

Apply method: Supabase Dashboard SQL Editor manual execution.

## Permission Verification Status

Status:

```txt
SKIPPED_MISSING_VERIFICATION_CREDENTIALS
```

The migration apply is owner-confirmed, but Codex did not independently query the four permission rows or OWNER/ADMIN assignments because local verification credentials are unavailable.

## Runtime Smoke Status

Status:

```txt
PARTIAL_LOCAL_STATIC_ONLY
```

- Post-migration endpoint smoke: skipped because explicit env is missing.
- Permission guard smoke: PASS local/static.
- Dry-run smoke: PASS local/static.
- Worker call: no.
- Production backup/storage upload/restore: no.

## Fallback Removal Readiness Status

Status:

```txt
NOT_READY_FOR_FALLBACK_REMOVAL
```

Fallback `permissions.manage` still remains in the API and UI guards.

Separate owner approval is required after read-only DB verification and authenticated endpoint smoke pass.

## What Changed in DB

Owner-confirmed DB mutation was limited to the reviewed migration scope:

- backup operator permission metadata
- OWNER backup operator role-permission assignments
- ADMIN view and dry_run role-permission assignments

The expected permission codes are:

- `backup.operator.view`
- `backup.operator.dry_run`
- `backup.operator.execute`
- `backup.operator.restore`

This scope remains expected until independently verified.

## What Did Not Change in Runtime

- No runtime fallback removal.
- No real backup execute behavior.
- No real restore behavior.
- No backup service worker call.
- No production backup creation.
- No production storage upload.
- No production restore.
- No domain, Auth, or OAuth change.

## What Is Still Blocked

- independent DB permission/assignment verification
- authenticated endpoint smoke
- fallback removal
- runtime execute enablement
- runtime restore enablement
- backup worker production deployment/execution

## Boundary

- Migration apply: owner-confirmed.
- DB mutation: owner-confirmed within migration scope.
- No deploy.
- No push.
- No package added.
- No fallback removal.
- Execute/restore runtime still not enabled.
- Backup worker not called.
- No production backup/restore/storage operation.
- No cron/schedule.
- No Cloudflare/Google API call.
- No secret/token/key/connection string printed or committed.

## Known Notes

- Direct workspace `npm run build` still fails when `.next` is locked by Windows ACL/EPERM.
- Clean temp builds pass.
- `npm audit --audit-level=moderate` still reports known advisories in `esbuild`, `postcss`, and `ws`.
- No `npm audit fix --force` was run.

## Recommended Next Phase

Recommended options:

- Phase 93 - Backup Permission Verification Completion, after safe read-only credentials and explicit authenticated smoke env are available.
- Phase 93 - Backup Permission Runtime Fallback Removal, only after verification completion and separate owner approval.
- Phase 93 - Backup Service Worker Manual Deploy Execution, only with explicit deploy approval and ready secrets.
- Phase 93 - Vietnamese Genealogy Domain Model Readiness, if infrastructure work should pause.
