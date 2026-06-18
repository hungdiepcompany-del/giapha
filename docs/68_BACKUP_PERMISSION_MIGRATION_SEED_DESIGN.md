# Phase 68 - Backup Permission Migration/Seed Design

## Production Baseline

Production remains on the existing main worker `web-gia-pha`.

Phase 68 does not deploy, push, run migrations, apply schema, mutate DB, read env files, call production network/API/DB, call the backup service worker, create production backup, upload storage, restore data, or create a schedule.

## Backup Operator Permission Baseline

Current backup operator runtime already checks future permission names:

- API target: `backup.operator.dry_run`
- UI target: `backup.operator.view`
- Temporary fallback: `permissions.manage`

The permissions are not yet present in `db/migrations` or the TypeScript permission catalog.

## Existing Permission Model Summary

The current auth and permission model uses:

- `profiles`
- `roles`
- `permissions`
- `role_permissions`
- `profile_roles`
- `public.current_profile_id()`
- `public.has_permission(permission_code text)`

Existing role codes are:

- `OWNER`
- `ADMIN`
- `EDITOR`
- `CONTRIBUTOR`
- `FAMILY_VIEWER`
- `PUBLIC_VIEWER`

There is no `SYSTEM_ADMIN` role in the repo today.

## Existing Migration/Seed Pattern Summary

Current seed pattern lives in:

```txt
db/migrations/20260614_0001_foundation_auth_roles_permissions.sql
```

The pattern uses:

- `insert into public.roles ... on conflict (code) do update`
- `insert into public.permissions ... on conflict (code) do update`
- `insert into public.role_permissions ... on conflict (role_id, permission_id) do nothing`

RLS and management policies were hardened in:

```txt
db/migrations/20260614_0002_auth_permission_hardening.sql
```

## Proposed Backup Permissions

Future permission rows:

```txt
backup.operator.view
backup.operator.dry_run
backup.operator.execute
backup.operator.restore
```

## Permission Descriptions

- `backup.operator.view`: view the backup operator UI/panel.
- `backup.operator.dry_run`: run the backup dry-run route.
- `backup.operator.execute`: reserved for real backup execution later; not enabled now.
- `backup.operator.restore`: reserved for real restore execution later; not enabled now.

## Role Assignment Recommendation

Recommended future assignment using existing repo roles:

| Role | Recommended backup permissions |
| --- | --- |
| `OWNER` | `backup.operator.view`, `backup.operator.dry_run`, `backup.operator.execute`, `backup.operator.restore` |
| `ADMIN` | `backup.operator.view`, `backup.operator.dry_run` |
| `EDITOR` | none by default unless owner approves |
| `CONTRIBUTOR` | none |
| `FAMILY_VIEWER` | none |
| `PUBLIC_VIEWER` | none |

Prompt-level `SYSTEM_ADMIN` maps to the repo's current `OWNER` role unless a future approved migration adds a separate role.

## Migration Strategy Options

Option A - create a future migration `db/migrations/YYYYMMDD_0007_backup_operator_permissions.sql`.

This migration would only insert permission rows and role mappings with idempotent `on conflict` statements.

Option B - extend an existing seed migration is not recommended because existing migrations should remain stable after production use.

Option C - keep fallback `permissions.manage` only is acceptable short term but does not give a narrow backup operator boundary.

Recommended option: create a new future `0007` migration after owner approval.

## Seed Strategy Options

Recommended future seed shape:

- insert the four permission rows with names and descriptions
- assign all four to `OWNER`
- assign only `backup.operator.view` and `backup.operator.dry_run` to `ADMIN`
- do not assign execute/restore to `ADMIN` by default
- do not assign backup permissions to viewer/public roles

The seed should be idempotent and rerunnable.

## Rollback Strategy

Preferred rollback for a future migration:

- remove `role_permissions` mappings for `backup.operator.*`
- leave `permissions` rows in place if already referenced in audit history
- if no references exist and owner approves, delete the permission rows
- restore runtime fallback to `permissions.manage` until migration state is clear

Rollback must not revoke unrelated permissions.

## No-Mutation Policy

Phase 68 is design-only:

- no migration file is created
- no migration command is run
- no SQL is applied
- no role mapping is changed
- no profile role is changed
- no DB/network/API call is made
- no secret is read

## Acceptance Criteria

- Existing permission/migration pattern is summarized.
- The four backup permission names are documented.
- Role assignment recommendation uses existing repo roles.
- Migration, seed and rollback strategy options are documented.
- No mutation is performed.

## Phase 68 Boundary

- No deploy.
- No push.
- No package added.
- No migration/schema/data mutation.
- No real migration run.
- No `.env.local` read.
- No `.dev.vars` read.
- No production network/API/DB call.
- No backup service worker call.
- No production backup.
- No real storage.
- No restore.
- No hardcoded secret/token/key.

## Next Phase

Phase 69 - Backup Permission Seed Dry-Run Checker.
