# A-16R Owner/Admin Import Permission Diagnosis

## Status

- Phase marker: `A-16R-OWNER-ADMIN-IMPORT-PERMISSION-DIAGNOSIS`.
- Diagnosis status:
  `A16R_OWNER_ADMIN_IMPORT_PERMISSION_DIAGNOSIS_STATUS=DIAGNOSED_READ_ONLY_NO_MUTATION`.
- Permission status classification:
  `A16R_OWNER_ADMIN_IMPORT_PERMISSION_DIAGNOSIS_CLASSIFICATION=AUTH_SESSION_COOKIE_MISSING`.
- Current blocker:
  `A16R_OWNER_ADMIN_IMPORT_PERMISSION_DIAGNOSIS_CURRENT_BLOCKER=AUTHENTICATED_OWNER_ADMIN_IMPORT_CONTEXT_NOT_AVAILABLE_OR_PERMISSION_INSUFFICIENT`.
- A-16R import retry next:
  `A16R_IMPORT_RETRY_NEXT=NO`.

This phase diagnoses the owner/admin import permission blocker from source,
docs and prior read-only smoke evidence. It does not grant permissions, run SQL,
run deploy or run official import.

## Preflight

- `git status -sb`: `## main...origin/main`.
- `git status --short`: clean.
- `git fetch origin --prune`: PASS.
- Branch: `main`.
- Remote URL:
  `git@github-giapha:hungdiepcompany-del/giapha.git`.
- Required repository slug:
  `hungdiepcompany-del/giapha.git`.
- Remote URL classification:
  `REMOTE_REPO_SLUG_MATCH=YES_SSH_ALIAS_ACCEPTED`.
- Ahead/behind after fetch:
  `0 / 0`.
- Local HEAD:
  `6e830c70b82a23fbd4bf55f2a471d6b76bd71a34`.
- `origin/main` HEAD:
  `6e830c70b82a23fbd4bf55f2a471d6b76bd71a34`.
- HEAD equals `origin/main`:
  `HEAD_EQUALS_ORIGIN_MAIN=YES`.
- Working tree before diagnosis updates:
  `WORKING_TREE_CLEAN=YES`.

## Observed Read-Only Evidence

- Previous owner/admin smoke retry status:
  `A16R_AUTH_OWNER_GATE_SMOKE_RETRY_STATUS=BLOCKED_AUTH_OR_PERMISSION_INSUFFICIENT`.
- Previous owner/admin smoke retry classification:
  `A16R_AUTH_OWNER_GATE_SMOKE_RETRY_CLASSIFICATION=BLOCKED_AUTH_OR_PERMISSION_INSUFFICIENT`.
- Production import page reached read-only:
  `A16R_AUTH_OWNER_GATE_SMOKE_RETRY_ADMIN_IMPORT_PAGE_GET=REACHED_READ_ONLY`.
- Visible permission count:
  `A16R_OWNER_ADMIN_IMPORT_PERMISSION_DIAGNOSIS_VISIBLE_PERMISSION_COUNT=0`.
- Login-required copy present:
  `A16R_OWNER_ADMIN_IMPORT_PERMISSION_DIAGNOSIS_LOGIN_REQUIRED_COPY_PRESENT=YES`.
- Authenticated admin gate readiness proven:
  `A16R_OWNER_ADMIN_IMPORT_PERMISSION_DIAGNOSIS_AUTHENTICATED_ADMIN_GATE_READINESS_PROVEN=NO`.
- Owner/admin import permission proven:
  `A16R_OWNER_ADMIN_IMPORT_PERMISSION_DIAGNOSIS_OWNER_ADMIN_IMPORT_PERMISSION_PROVEN=NO`.

The key source-based interpretation is that the import page chooses the
login-required message only when `context.user` is absent. The visible prior
smoke therefore does not prove a valid Supabase auth user cookie/session in the
server-rendered production app context.

## Required Permission Contract

Source contract for the import page and read-only manifest/gate:

- `A16R_OWNER_ADMIN_IMPORT_PERMISSION_REQUIRED_PAGE_PERMISSION=imports.create`.
- `/admin/exports/import` calls `getPermissionContext()`.
- The page sets `canPreview` only when Supabase config is missing or
  `context.permissions.includes("imports.create")`.
- `listImportSessions()` and `getImportManifest()` call `ensureReadAccess()`.
- `ensureReadAccess()` returns `401` when no authenticated user is present.
- `ensureReadAccess()` returns `403` when a user is present but lacks
  `imports.create`.
- The official-import-gate route is GET-only and depends on
  `getImportManifest(sessionId)`, so authenticated read access also depends on
  the same `imports.create` permission.

Source contract for permission resolution:

- `A16R_OWNER_ADMIN_IMPORT_PERMISSION_AUTH_USER_REQUIRED=YES`.
- `A16R_OWNER_ADMIN_IMPORT_PERMISSION_PROFILE_LINK_REQUIRED=YES_AUTH_USER_ID`.
- `A16R_OWNER_ADMIN_IMPORT_PERMISSION_PROFILE_ROLE_REQUIRED=YES_PROFILE_ROLES`.
- `A16R_OWNER_ADMIN_IMPORT_PERMISSION_ROLE_PERMISSION_MAPPING_REQUIRED=YES_ROLE_PERMISSIONS`.
- `A16R_OWNER_ADMIN_IMPORT_PERMISSION_FAMILY_TREE_MEMBERSHIP_REQUIRED=NO_SOURCE_EVIDENCE`.
- `A16R_OWNER_ADMIN_IMPORT_PERMISSION_SYSTEM_ADMIN_ROLE_REQUIRED=NO_ROLE_CODE_IN_SOURCE`.
- Role codes in source:
  `OWNER`, `ADMIN`, `EDITOR`, `CONTRIBUTOR`, `FAMILY_VIEWER`, `PUBLIC_VIEWER`.
- The foundation migration seeds all permissions to `OWNER` and `ADMIN`, but
  runtime gates check permission codes, not role names.

Source contract for official import POST if a later execution phase is ever
authorized:

- `A16R_OWNER_ADMIN_IMPORT_PERMISSION_REQUIRED_POST_PERMISSIONS=imports.create,people.create,relationships.create,permissions.manage`.
- POST `/official-import` requires an authenticated user.
- POST requires the strict permission bundle above before even checking runtime
  enablement, confirmations or the candidate service.
- POST still remains locked behind
  `A16P_OFFICIAL_IMPORT_RUNTIME_CANDIDATE_ENABLED`, session marker
  `APPROVE_A16R_RUN_OFFICIAL_IMPORT_FOR_SESSION_2af4bfb6-a20e-453e-9804-1b8c0afbdd68`,
  runtime marker `APPROVE_A16R_RUNTIME_EXECUTION_AFTER_A16V_VERIFY`, and the
  fail-closed service result `canRunOfficialImport: false`.

## Diagnosis

- Owner logged out:
  `A16R_OWNER_ADMIN_IMPORT_PERMISSION_OWNER_LOGGED_OUT=LIKELY_APP_SERVER_SESSION_MISSING`.
- Owner wrong account:
  `A16R_OWNER_ADMIN_IMPORT_PERMISSION_OWNER_WRONG_ACCOUNT=UNKNOWN_NOT_PROVEN`.
- Owner profile missing:
  `A16R_OWNER_ADMIN_IMPORT_PERMISSION_OWNER_PROFILE_MISSING=UNKNOWN_NOT_PROVEN`.
- Owner role missing:
  `A16R_OWNER_ADMIN_IMPORT_PERMISSION_OWNER_ROLE_MISSING=UNKNOWN_NOT_PROVEN`.
- Owner import permission missing:
  `A16R_OWNER_ADMIN_IMPORT_PERMISSION_OWNER_IMPORT_PERMISSION_MISSING=UNKNOWN_NOT_PROVEN`.
- Role/permission mapping mismatch:
  `A16R_OWNER_ADMIN_IMPORT_PERMISSION_ROLE_PERMISSION_MAPPING_MISMATCH=UNKNOWN_NOT_PROVEN`.
- Auth session cookie missing:
  `A16R_OWNER_ADMIN_IMPORT_PERMISSION_AUTH_SESSION_COOKIE_MISSING=YES_READ_ONLY_EVIDENCE`.
- Supabase auth redirect/session not persisting:
  `A16R_OWNER_ADMIN_IMPORT_PERMISSION_SUPABASE_AUTH_REDIRECT_SESSION_PERSISTING=UNKNOWN_NEEDS_OWNER_LOGIN_RETRY`.
- Production source still intentionally fail-closed:
  `A16R_OWNER_ADMIN_IMPORT_PERMISSION_SOURCE_STILL_FAIL_CLOSED=YES`.

Primary classification:

`A16R_OWNER_ADMIN_IMPORT_PERMISSION_DIAGNOSIS_CLASSIFICATION=AUTH_SESSION_COOKIE_MISSING`

Reasoning:

- The prior smoke page rendered the login-required import copy, which is the
  branch used when `context.user` is absent.
- The same smoke showed visible permission count `0` and did not prove a user
  email, profile, role or import permission.
- Because there is no proven authenticated app user context, this phase cannot
  distinguish wrong Google account, missing profile, missing role, missing
  `imports.create`, or role/permission mapping mismatch.
- No read-only DB verifier was run in this phase, and the prompt forbids SQL,
  role grants and permission mutation.

## Repair And Next Action

- DB/SQL role repair needed:
  `A16R_OWNER_ADMIN_IMPORT_PERMISSION_DB_SQL_ROLE_REPAIR_NEEDED=UNKNOWN_NOT_PROVEN`.
- Owner manual login/account action needed:
  `A16R_OWNER_ADMIN_IMPORT_PERMISSION_OWNER_MANUAL_ACTION_NEEDED=YES`.
- Permissions/roles mutated:
  `A16R_OWNER_ADMIN_IMPORT_PERMISSION_ROLES_PERMISSIONS_MUTATED=NO`.
- Auth/users/memberships mutated:
  `A16R_OWNER_ADMIN_IMPORT_PERMISSION_AUTH_USERS_MEMBERSHIPS_MUTATED=NO`.
- A-16R import may be retried next:
  `A16R_IMPORT_MAY_BE_RETRIED_NEXT=NO`.
- Import retry reason:
  `A16R_OWNER_ADMIN_IMPORT_PERMISSION_IMPORT_RETRY_REASON=OWNER_ADMIN_IMPORT_PERMISSION_NOT_PROVEN_AND_SOURCE_FAIL_CLOSED`.
- Exact next allowed action:
  `A16R_OWNER_ADMIN_IMPORT_PERMISSION_NEXT_ALLOWED_ACTION=OWNER_LOGIN_TO_PRODUCTION_WITH_EXPECTED_OWNER_ADMIN_ACCOUNT_VERIFY_ADMIN_SHELL_EMAIL_ROLE_PERMISSION_COUNT_THEN_RERUN_READ_ONLY_GATE_UI_SMOKE_NO_POST`.

The next read-only phase should first prove the production app server sees a
Supabase auth user by checking the AdminShell user email, role list and
permission count after owner login. Only then can a follow-up diagnosis
distinguish missing profile, missing role, missing `imports.create`, or mapping
mismatch.

## Forbidden Actions Confirmed

- `A16R_OWNER_ADMIN_IMPORT_PERMISSION_DEPLOY_RUN=NO`.
- `A16R_OWNER_ADMIN_IMPORT_PERMISSION_POST_OFFICIAL_IMPORT_CALLED=NO`.
- `A16R_OWNER_ADMIN_IMPORT_PERMISSION_DIRECT_RPC_CALLED=NO`.
- `A16R_OWNER_ADMIN_IMPORT_PERMISSION_REAL_GENEALOGY_WRITE=NO`.
- `A16R_OWNER_ADMIN_IMPORT_PERMISSION_SQL_RUN=NO`.
- `A16R_OWNER_ADMIN_IMPORT_PERMISSION_DB_PUSH_RUN=NO`.
- `A16R_OWNER_ADMIN_IMPORT_PERMISSION_MIGRATION_REPAIR_RUN=NO`.
- `A16R_OWNER_ADMIN_IMPORT_PERMISSION_SEED_RUN=NO`.
- `A16R_OWNER_ADMIN_IMPORT_PERMISSION_WINDOWS_LOCAL_DEPLOY_RUN=NO`.
- `A16R_OWNER_ADMIN_IMPORT_PERMISSION_CAN_RUN_OFFICIAL_IMPORT_BYPASSED=NO`.
- `A16R_OWNER_ADMIN_IMPORT_PERMISSION_FAIL_CLOSED_GUARDS_WEAKENED=NO`.
- `A16R_OWNER_ADMIN_IMPORT_PERMISSION_WRANGLER_TOML_CHANGED=NO`.
- No permission grant was performed.
- No user role update was performed.
- No auth/user/membership mutation was performed.
- No POST `/official-import`.
- No direct RPC call.
- No real genealogy data write.
- No SQL, Supabase DB push, migration repair or seed.
- No Windows-local deploy.

## Runtime Boundary Review

- Main Worker source touched: NO.
- Runtime dependency added: NO.
- New service Worker created: NO.
- OpenNext/Wrangler config changed: NO.
- Worker size risk: NO_SOURCE_CHANGE_DOCS_CHECKER_ONLY.
- Service boundary recommendation:
  `NONE_FOR_THIS_PHASE_PERMISSION_DIAGNOSIS_DOCS_CHECKER_ONLY`.
