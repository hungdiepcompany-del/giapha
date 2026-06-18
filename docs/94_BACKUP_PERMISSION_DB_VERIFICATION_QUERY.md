# Phase 94 - Backup Permission DB Verification Query

## Production Baseline

Production remains on the existing main worker `web-gia-pha`.

The owner previously confirmed that migration `db/migrations/20260618_0007_backup_operator_permissions.sql` was applied on Supabase project ref `frkyeuxrlcflmsxxsolp`.

## Phase 93 Credential Contract Baseline

Phase 93 established a shell-only, read-only verification contract. Credentials are supplied only through explicit shell or CI secret environment variables.

The verifier does not read `.env.local` or `.dev.vars`.

## DB Verification Goal

Independently verify the four backup operator permission rows and the reviewed OWNER/ADMIN role assignments without changing database state.

## Verification Script Path

```txt
scripts/verify-backup-permissions-post-apply.cjs
```

Command:

```txt
npm run verify:backup-permissions:post-apply
```

Marker:

```txt
BACKUP_PERMISSION_DB_VERIFICATION_READ_ONLY
```

## Shell-Only Env Placeholders

```txt
BACKUP_PERMISSION_VERIFY_SUPABASE_URL
BACKUP_PERMISSION_VERIFY_SUPABASE_SERVER_KEY
BACKUP_PERMISSION_VERIFY_MODE=read_only
```

The server key may have broad privileges, but the verifier is restricted to SELECT/read-only operations. It does not print URL, secret, token, key, request headers, or connection strings.

## Query Scope

The verifier reads only:

- `permissions`: `id`, `code`
- `roles`: `id`, `code`
- `role_permissions`: `role_id`, `permission_id`

The schema is confirmed by the repository foundation migration and the reviewed backup permission migration. No schema inspection or mutation is required.

## Permission Expectations

- `backup.operator.view`
- `backup.operator.dry_run`
- `backup.operator.execute`
- `backup.operator.restore`

All four rows must exist for permission verification to pass.

## Role Assignment Expectations

- OWNER has all four backup operator permissions.
- ADMIN has `backup.operator.view`.
- ADMIN has `backup.operator.dry_run`.
- ADMIN does not have `backup.operator.execute`.
- ADMIN does not have `backup.operator.restore`.

## Safe Skip Behavior

If a required shell variable is missing, result:

```txt
SKIPPED_MISSING_VERIFICATION_CREDENTIALS
```

If `BACKUP_PERMISSION_VERIFY_MODE` is not exactly `read_only`, result:

```txt
SKIPPED_VERIFICATION_MODE_NOT_READ_ONLY
```

Both safe-skip paths return before client creation and do not call the network.

## Result Interpretation

- `PASS`: four permission rows and all OWNER/ADMIN assignment expectations match.
- `FAIL`: a read-only query fails, a permission/role is missing, an expected assignment is missing, or an ADMIN execute/restore assignment is present.
- `SKIPPED_MISSING_VERIFICATION_CREDENTIALS`: required shell-only env is unavailable; DB state remains independently unverified.
- `SKIPPED_VERIFICATION_MODE_NOT_READ_ONLY`: the explicit safety mode is absent from the approved value; no query runs.

Raw provider error messages are not printed. A failure may expose only the read-only query stage and a non-secret provider error code.

## Current Run Result

```txt
SKIPPED_MISSING_VERIFICATION_CREDENTIALS
```

At the Phase 94 run, all three shell-only variables were missing. The verifier returned before any Supabase/network call.

Permission verification result: `NOT_RUN`.

Role assignment verification result: `NOT_RUN`.

## Remaining Limitations

- The migration apply remains owner-confirmed rather than independently verified.
- The four permission rows remain independently unverified until an approved shell-only credential run returns `PASS`.
- OWNER/ADMIN role assignments remain independently unverified until that run returns `PASS`.
- Authenticated endpoint smoke remains separate.
- Fallback `permissions.manage` still remains.
- Execute/restore runtime remains disabled.

## Phase 94 Boundary

- No migration rerun or apply.
- No DB mutation.
- No deploy or push.
- No fallback `permissions.manage` removal.
- No execute/restore runtime enablement.
- No backup worker call.
- No production backup, upload, or restore.
- No env-file read.
- No secret/token/key/connection string printed or committed.

## Next Phase

Phase 95 may record a credentialed read-only verification result when approved shell-only env is available. It must not remove fallback or enable execute/restore without separate approval.
