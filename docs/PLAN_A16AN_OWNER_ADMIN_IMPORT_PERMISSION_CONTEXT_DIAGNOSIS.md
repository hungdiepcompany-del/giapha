# A-16AN - Owner/Admin Import Permission Context Diagnosis

## Status

- `A16AN_STATUS=DIAGNOSED_READ_ONLY_OWNER_ADMIN_PERMISSION_CONTEXT_BLOCKED`.
- `A16AN_CLASSIFICATION=AUTHENTICATED_PROFILE_HAS_NO_ROLE_ASSIGNMENT_OR_WRONG_ACCOUNT_CONTEXT`.
- `A16AM_BLOCKER=AUTHENTICATED_OWNER_ADMIN_IMPORT_CONTEXT_NOT_AVAILABLE_OR_PERMISSION_INSUFFICIENT`.
- `A16AN_BLOCKER=AUTHENTICATED_PROFILE_ROLE_ASSIGNMENT_MISSING_OR_WRONG_ACCOUNT_CONTEXT`.
- `A16R_IMPORT_RETRY_NEXT=NO`.

## Starting Evidence

- A-16AM stopped before any official import POST.
- A-16AM observed an authenticated production context, but it was not an owner/admin import context.
- Observed role state was `NO_ROLE`.
- Observed permission count was `0`.
- Observed import permission state was `imports.create_MISSING`.
- `A16AN_DB_READ_RUN=NO`.
- `A16AN_EXACT_DB_STATE_PROVEN=NO`.

## Source Diagnosis

- `A16AN_PERMISSION_CONTEXT_SOURCE=lib/permissions/permission-service.ts`.
- Permission context flow is:
  `Supabase Auth user -> profiles.auth_user_id -> profile_roles -> roles -> role_permissions -> permissions`.
- If `profile_roles` has no rows for the authenticated profile, source returns:
  `A16AN_SOURCE_NO_ROLE_REASON=no_roles`.
- `/admin/exports/import` requires `context.permissions.includes("imports.create")` before it opens import preview/review UI for configured Supabase runtime.
- `POST /official-import` requires the strict permission set:
  `imports.create,people.create,relationships.create,permissions.manage`.
- `OWNER` and `ADMIN` receive the full permission catalog from
  `db/migrations/20260614_0001_foundation_auth_roles_permissions.sql`.
- The expected OWNER bootstrap account source is the reviewed email literal in
  `db/snippets/assign-owner-role.sql`; the literal is intentionally redacted
  from this evidence.

## Diagnosis

The source-consistent cause of A-16AM is one of these read-only possibilities:

- The browser is logged into an account other than the expected owner/admin account.
- The authenticated profile exists but has no `profile_roles` assignment.
- The authenticated profile has a role that is not `OWNER` or `ADMIN`.
- The role mapping does not include `imports.create`.
- The manual OWNER bootstrap was not run after the matching profile was created.
- The owner/admin account was repaired separately but the production session is stale and needs a fresh login.

Because this phase did not run SQL, DB reads, or permission repair, it does not
prove which DB row is missing. It only narrows the runtime blocker to the
authenticated app permission context.

## Owner Manual Verification

Owner should verify manually without running official import:

1. Review `db/snippets/assign-owner-role.sql` locally and confirm the expected account literal matches the intended owner/admin account. Do not paste that value into chat or docs.
2. Log out of production and log back in with the expected owner/admin account.
3. Open `/admin/exports/import`.
4. PASS UI condition: admin shell shows role `OWNER` or `ADMIN`, visible permission count is greater than `0`, and the missing `imports.create` warning is absent.
5. Do not click or submit official import.

Optional later admin/dashboard read-only verification, in a separate owner-approved
phase, can check `profiles.email -> profile_roles -> roles.code in ('OWNER',
'ADMIN') -> role_permissions -> permissions` and confirm the strict permission
set. If the role assignment is missing, request a separate owner-approved role
assignment/repair phase. A-16AN does not perform that mutation.

## Safety

- `A16AN_POST_OFFICIAL_IMPORT_CALLED=NO`.
- `A16AN_A16R_IMPORT_RETRY_EXECUTED=NO`.
- `A16AN_DIRECT_MANUAL_RPC_CALLED=NO`.
- `A16AN_SQL_RUN=NO`.
- `A16AN_DB_MUTATION_RUN=NO`.
- `A16AN_DB_PUSH_RUN=NO`.
- `A16AN_MIGRATION_REPAIR_RUN=NO`.
- `A16AN_SEED_RUN=NO`.
- `A16AN_DEPLOY_RUN=NO`.
- `A16AN_WRANGLER_DEPLOY_RUN=NO`.
- `A16AN_AUTH_USER_ROLE_PERMISSION_MEMBERSHIP_MUTATION=NO`.
- `A16AN_REAL_GENEALOGY_WRITE=NO`.
- `A16AN_RAW_JSON_COMMITTED=NO`.
- `A16AN_PRIVATE_DATA_PRINTED=NO`.
- `A16AN_WRANGLER_TOML_CHANGED=NO`.
- `A16AN_APP_LAYOUT_TSX_CHANGED=NO`.

## Boundary Review

- Main Worker source touched: NO.
- Runtime dependency added: NO.
- New service Worker created: NO.
- OpenNext/Wrangler config changed: NO.
- Worker size risk: NO.
- Service boundary recommendation: `NONE_FOR_THIS_PHASE_PERMISSION_CONTEXT_DIAGNOSIS_DOCS_CHECKER_ONLY`.

## Next Action

`A16AN_NEXT_ACTION=OWNER_VERIFY_EXPECTED_ACCOUNT_AND_OWNER_ADMIN_ROLE_ASSIGNMENT_READ_ONLY_THEN_RERUN_AUTHENTICATED_IMPORT_GATE_NO_POST`.
