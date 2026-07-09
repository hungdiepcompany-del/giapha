# A-16AW - Runtime Env Flag Propagation Diagnosis

## Status

`A16AW_STATUS=DIAGNOSED_RUNTIME_ENV_PROPAGATION_BLOCKED_NO_IMPORT`

## Owner Production UI Evidence

The owner provided sanitized production UI evidence that permission/session gates
are no longer the active blocker:

- `A16AW_OWNER_ADMIN_CONTEXT=YES_OWNER_PROVIDED_SANITIZED`
- `A16AW_OWNER_ROLE=OWNER`
- `A16AW_VISIBLE_PERMISSION_COUNT=25`
- `A16AW_IMPORTS_CREATE_PRESENT=YES`
- `A16AW_PERMISSIONS_MANAGE_PRESENT=YES`
- `A16AW_TARGET_SESSION_ID=2af4bfb6-a20e-453e-9804-1b8c0afbdd68`

Remaining production UI blockers:

- `A16AW_CURRENT_BLOCKER=A16AR_LOCKED_RUNTIME_CANDIDATE_ENV_DISABLED`
- `A16AW_CURRENT_BLOCKER_2=A16AR_LOCKED_EXECUTION_BRANCH_ENV_DISABLED`
- `A16AW_CURRENT_BLOCKER_3=A16AR_LOCKED_SAME_RUN_PREFLIGHT_FALSE`

## Diagnosis

`A16AW_BLOCKER=GITHUB_ACTIONS_REPOSITORY_VARS_ARE_NOT_CLOUDFLARE_WORKER_RUNTIME_VARS_AND_DEPLOY_DOES_NOT_KEEP_DASHBOARD_RUNTIME_VARS`

Owner configured GitHub Actions repository variables:

- `A16P_OFFICIAL_IMPORT_RUNTIME_CANDIDATE_ENABLED=true`
- `A16AH_OFFICIAL_IMPORT_EXECUTION_BRANCH_ENABLED=true`

Those values are wired into `.github/workflows/cloudflare-deploy.yml` as job
environment variables. That proves the CI job can receive them, but it does not
by itself attach them as Cloudflare Worker runtime environment variables.

Cloudflare Worker environment variables are runtime bindings attached to the
Worker. OpenNext production guidance says runtime environment variables should
be set in the Cloudflare dashboard. It also notes that when dashboard runtime
variables are used, the deploy command should pass `--keep-vars` so deployments
do not delete them.

Current repository state:

- `A16AW_WORKFLOW_JOB_ENV_WIRED=YES`
- `A16AW_WRANGLER_VARS_PRESENT=NO`
- `A16AW_DEPLOY_COMMAND_USES_KEEP_VARS=NO`
- `A16AW_CLOUDFLARE_DASHBOARD_RUNTIME_VARS_VERIFIED=NO_NOT_READ_OR_MUTATED`
- `A16AW_PRODUCTION_RUNTIME_FLAGS_ACTIVE=NO_OWNER_UI_EVIDENCE`

## Source Gates

The UI and official import route still use strict string checks:

- `A16AW_ROUTE_REQUIRES_A16P_TRUE=YES`
- `A16AW_ROUTE_REQUIRES_A16AH_TRUE=YES`
- `A16AW_UI_REQUIRES_A16P_TRUE=YES`
- `A16AW_UI_REQUIRES_A16AH_TRUE=YES`

Source files:

- `app/api/admin/import-sessions/[sessionId]/official-import/route.ts`
- `components/imports/import-session-manifest-panel.tsx`

## Required Runtime Path

The minimum safe propagation path is:

1. Add both A-16 flags as production runtime environment variables on the
   Cloudflare Worker `web-gia-pha`:
   - `A16P_OFFICIAL_IMPORT_RUNTIME_CANDIDATE_ENABLED=true`
   - `A16AH_OFFICIAL_IMPORT_EXECUTION_BRANCH_ENABLED=true`
2. Update the manual Cloudflare deploy path in a later source phase to preserve
   dashboard runtime variables, for example by using the OpenNext deploy pass
   through form:
   - `opennextjs-cloudflare deploy -- --keep-vars`
3. Redeploy only in a separate owner-approved deploy phase.
4. Rerun authenticated owner/admin read-only UI smoke.
5. Stop after read-only verification. A real POST `/official-import` remains a
   separate explicit owner execution phase.

## Safety

- `A16AW_POST_OFFICIAL_IMPORT_CALLED=NO`
- `A16AW_A16R_IMPORT_RETRY_EXECUTED=NO`
- `A16AW_DIRECT_MANUAL_RPC_CALLED=NO`
- `A16AW_SQL_RUN=NO`
- `A16AW_DB_MUTATION_RUN=NO`
- `A16AW_MIGRATION_REPAIR_RUN=NO`
- `A16AW_SEED_RUN=NO`
- `A16AW_DEPLOY_RUN=NO`
- `A16AW_AUTH_ROLE_PERMISSION_MEMBERSHIP_MUTATION=NO`
- `A16AW_GENEALOGY_MUTATION=NO`
- `A16AW_CLOUDFLARE_ENV_SECRET_CHANGED=NO`
- `A16AW_WRANGLER_TOML_CHANGED=NO`
- `A16AW_RAW_JSON_COMMITTED=NO`
- `A16AW_PRIVATE_DATA_PRINTED=NO`
- `A16R_IMPORT_RETRY_NEXT=NO`

## Runtime Guardrail

- Main Worker touched: `NO`
- Runtime dependency added: `NO`
- New service Worker created: `NO`
- OpenNext/Wrangler config changed: `NO`
- Worker size risk: `NO`
- Service boundary recommendation: `NONE_FOR_A16AW_DIAGNOSIS_ONLY`

## References

- Cloudflare Workers environment variables are bindings available to the Worker
  runtime via the Worker environment.
- OpenNext Cloudflare production guidance separates build variables from runtime
  variables and recommends `--keep-vars` when preserving dashboard runtime
  variables during deploy.

## Next Action

`A16AW_NEXT_ACTION=A16AX_WIRE_DEPLOY_KEEP_VARS_OR_OWNER_SET_CLOUDFLARE_WORKER_RUNTIME_VARS_THEN_REDEPLOY_AND_RERUN_READ_ONLY_SMOKE_NO_POST`
