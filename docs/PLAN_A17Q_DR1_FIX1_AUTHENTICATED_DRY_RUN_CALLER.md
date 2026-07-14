# A-17Q-DR1-FIX1 - Authenticated Owner-Session Dry-Run Caller

Date: 2026-07-14

Status:
`A17Q_DR1_FIX1_STATUS=PASS_AUTHENTICATED_DRY_RUN_CALLER_PREPARED_NOT_EXECUTED`

## Cause

The Supabase SQL Editor path is not a valid dry-run path for
`public.execute_admin_a17q_legacy_family_reconciliation` because SQL Editor does
not carry the application user's authenticated Supabase cookie session. The
executor correctly requires an authenticated profile and rejects calls without
that end-user context.

## Runtime Caller

- `AUTHENTICATED_CALLER_CREATED=YES`
- `AUTHENTICATED_PAGE=/admin/reconciliation/a17q/dry-run`
- `AUTHENTICATED_API_ROUTE=/api/admin/a17q/reconciliation-dry-run`
- `AUTHENTICATED_SERVER_COOKIE_CLIENT_USED=YES`
- `SERVER_COOKIE_SESSION_USED=YES`
- `RPC_NAME=execute_admin_a17q_legacy_family_reconciliation`
- `SERVICE_ROLE_USED=NO`
- `JWT_CLAIMS_SPOOFED=NO`
- `SESSION_TOKEN_LOGGED=NO`

The caller uses `createServerSupabaseClient()` from `lib/supabase/server.ts`.
It checks the signed-in user, `current_profile_id`, visible OWNER/ADMIN role,
and the existing `relationships.update` plus `permissions.manage` permissions
before showing and before invoking the action.

## Dry-Run Contract

- `OWNER_MARKER=A17P_MANUAL_21_GROUP_RECONCILIATION_APPROVED`
- `DECISION_PACK_SHA256=777a8bb13ff45eb9f46fd817c392098ada4a2d550cad8e6ee4c6cd896b874ad0`
- `APPROVED_GROUP_PLAN_SHA256=7dd719c926dc560aa69bc7070c395535942823e87739d9893d0161713e151740`
- `ROLE_CORRECTION_PLAN_SHA256=ee255398f84dc2ce899d14056fb0573f771202ca7ad71e598cbbe7fc47707a9f`
- `EXCLUDED_SCOPE_SHA256=7898280dab816af96b6a9277b93b49429c5db8a71c9f24739a7d55660a0bdd61`
- `FORECAST_SHA256=4c0beb0de1589a7728b7f8b4918844e3103aa773ad3a5ab8e87d1ab2cead9ff3`
- `DRY_RUN_IDEMPOTENCY_KEY=A17Q_DR1_DRY_RUN_20260713_E04238C_001`
- `CONFIRM_BACKUP_REVIEWED=TRUE`
- `CONFIRM_ROLLBACK_REVIEWED=TRUE`
- `CONFIRM_AUDIT_REVIEWED=TRUE`
- `CONFIRM_EXCLUDED_SCOPE_REVIEWED=TRUE`
- `DRY_RUN_FLAG_HARDCODED_TRUE=YES`
- `NON_DRY_RUN_PATH_COUNT=0`
- `ACTIVE_EXECUTION_PATH_COUNT=0`

The API route does not accept a request body that can change the RPC name,
hashes, confirmation booleans, idempotency key or dry-run flag. There is no code
path capable of setting `p_dry_run_only=false`.

## Preserved Boundary

- `RPC_CALLED=NO`
- `DATABASE_MUTATION=NO`
- `RECONCILIATION_EXECUTED=NO`
- `MIGRATION_CHANGED=NO`
- `MIGRATION_0026_CHANGED=NO`
- `POST_DRY_RUN_VERIFIER_CHANGED=NO`
- `DEPLOY=NO`
- `PUSH=NO`

The existing SELECT-only post-dry-run verifier remains:
`db/checks/20260713_check_a17q_dr1_post_production_reconciliation_dry_run.sql`.

## Next Action

`NEXT_ACTION=A17Q_DR2_DEPLOY_AND_RUN_AUTHENTICATED_PRODUCTION_DRY_RUN`

`EXPECTED_SUCCESS_STATUS=PASS_AUTHENTICATED_DRY_RUN_CALLER_PREPARED_NOT_EXECUTED`
