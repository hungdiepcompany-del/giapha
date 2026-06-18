# Phase 89 - Backup Permission Post-Apply Verification

## Production Baseline

Production remains on the existing main worker `web-gia-pha`.

Phase 89 adds a read-only post-apply verifier and records the current verification result. It does not deploy, push, remove fallback, enable execute/restore runtime behavior, call the backup worker, create a production backup, or restore production data.

## Migration Apply Baseline

Migration:

```txt
db/migrations/20260618_0007_backup_operator_permissions.sql
```

Apply result: owner-confirmed successful manual execution through the Supabase Dashboard SQL Editor on project ref `frkyeuxrlcflmsxxsolp`.

## Post-Apply Verification Goal

Verify that the four backup operator permissions exist and that OWNER/ADMIN role assignments match the reviewed migration.

The verifier is read-only and never prints credential values.

## Permission Existence Verification

Required permissions:

- `backup.operator.view`
- `backup.operator.dry_run`
- `backup.operator.execute`
- `backup.operator.restore`

Current automated verification result:

```txt
SKIPPED_MISSING_VERIFICATION_CREDENTIALS
```

The local workspace does not contain `.env.local`, `NEXT_PUBLIC_SUPABASE_URL`, or `SUPABASE_SERVICE_ROLE_KEY`. Therefore Codex did not independently query the permission rows.

## Role Assignment Verification

Expected assignments:

- `OWNER`: all four backup operator permissions
- `ADMIN`: `backup.operator.view`, `backup.operator.dry_run`
- `ADMIN`: no execute or restore assignment

Current automated role assignment verification result:

```txt
SKIPPED_MISSING_VERIFICATION_CREDENTIALS
```

The successful migration apply is owner-confirmed, but role assignment rows remain unverified by the local read-only script until safe verification credentials are available.

## Fallback Status

Runtime fallback `permissions.manage` still remains in the backup operator API and UI guards.

Phase 89 does not remove fallback.

## Execute/Restore Runtime Status

`backup.operator.execute` runtime behavior is not enabled.

`backup.operator.restore` runtime behavior is not enabled.

The permissions are metadata/assignment targets only.

## Verification Command/Result

Command:

```txt
npm run verify:backup-permissions:post-apply
```

Result:

```txt
SKIPPED_MISSING_VERIFICATION_CREDENTIALS
```

The script safe-skips without verification credentials, performs read-only queries when credentials are present, and prints only permission codes, assignment gaps, and status.

## Failure Handling

If future verification returns FAIL or ERROR:

- keep fallback `permissions.manage`
- keep execute/restore runtime disabled
- confirm the target Supabase project
- inspect permission and role assignment rows through an approved admin path
- do not broaden role assignments without owner approval
- record the result in work log and handoff

## Phase 89 Boundary

- Migration apply remains owner-confirmed.
- Automated DB verification: skipped because credentials are missing.
- No DB mutation by the verifier.
- No deploy.
- No push.
- No fallback removal.
- No runtime execute/restore enablement.
- No worker call.
- No production backup.
- No production restore.
- No secret/token/key printed or committed.

## Next Phase

Phase 90 - Backup Operator Permission Runtime Smoke.
