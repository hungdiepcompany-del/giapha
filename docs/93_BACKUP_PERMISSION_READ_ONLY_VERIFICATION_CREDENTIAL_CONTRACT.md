# Phase 93 - Backup Permission Read-Only Verification Credential Contract

## Production Baseline

Production remains on the existing main worker `web-gia-pha`.

The backup permission migration was owner-confirmed applied on Supabase project ref `frkyeuxrlcflmsxxsolp`. Runtime fallback `permissions.manage` still remains and execute/restore runtime behavior is still disabled.

## Verification Limitation From Phase 89

Phase 89 could not independently query permission or role assignment rows because no explicit verification credentials were available.

The previous result was:

```txt
SKIPPED_MISSING_VERIFICATION_CREDENTIALS
```

## Credential Contract Goal

Define a shell-only credential contract for read-only verification without committing or printing credential values.

## Allowed Env Placeholders

Allowed environment variable names:

```txt
BACKUP_PERMISSION_VERIFY_SUPABASE_URL
BACKUP_PERMISSION_VERIFY_SUPABASE_SERVER_KEY
BACKUP_PERMISSION_VERIFY_MODE=read_only
```

Supabase does not provide a generic read-only server key. `BACKUP_PERMISSION_VERIFY_SUPABASE_SERVER_KEY` may have broad server-side privileges, but the verification script is still restricted to approved SELECT/read-only operations.

The owner must supply the URL and server key directly through the current shell or CI secret mechanism. They must not be committed, printed, copied into docs, stored in `.env.local`/`.dev.vars`, or exposed to client code.

An approved future verifier may alternatively use:

```txt
BACKUP_PERMISSION_VERIFY_DATABASE_URL
BACKUP_PERMISSION_VERIFY_MODE=read_only
```

Phase 93 does not create a database role or require this optional database URL path.

## Read-Only Query Policy

Verification may only SELECT:

- permission identifiers and codes from `permissions`
- OWNER and ADMIN identifiers/codes from `roles`
- matching assignment identifiers from `role_permissions`

No insert, update, delete, upsert, RPC mutation, schema command, migration apply, or policy change is permitted.

## No-Secret-Logging Policy

Scripts must never print:

- Supabase URL values
- key/token values
- authorization headers
- cookies
- connection strings

Output may contain status, permission codes, missing assignment labels, and non-sensitive project-ref comparison status.

## No-Env-File Policy

Verification scripts must not read:

- `.env.local`
- `.dev.vars`
- any other repository env file

Credentials must come only from environment variables already set directly in the current shell or CI secret context.

## Safe Skip Behavior

If either required verification variable is missing, the verifier must return:

```txt
SKIPPED_MISSING_VERIFICATION_CREDENTIALS
```

Safe skip must not call Supabase or any network endpoint.

## No-DB-Mutation Policy

The verifier is SELECT-only and must report `db_mutation: false`.

Phase 93 does not run the verifier against DB, rerun migration, apply DB, deploy, push, remove fallback, enable execute/restore, call the backup worker, create backup, upload storage, or restore data.

## Phase 93 Boundary

- Contract/docs/check only.
- No DB query required in Phase 93.
- No env file read.
- No credential value logged.
- No DB mutation.
- No deploy.
- No push.
- No fallback removal.
- No execute/restore runtime enablement.

## Next Phase

Phase 94 - Backup Permission DB Verification Query.
