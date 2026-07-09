# A-16AU - GitHub Actions Runtime Env Flag Wiring

## Status

`A16AU_STATUS=PASS_WORKFLOW_ENV_WIRING_READY_NOT_DEPLOYED`

## Goal

Wire the manual Cloudflare Deploy workflow so production can receive the two
A-16 runtime execution flags when the owner configures them in GitHub Actions
variables. This phase does not deploy and does not execute import.

## Flags

- `A16AU_FLAG_1=A16P_OFFICIAL_IMPORT_RUNTIME_CANDIDATE_ENABLED`
- `A16AU_FLAG_2=A16AH_OFFICIAL_IMPORT_EXECUTION_BRANCH_ENABLED`
- `A16AU_EXPECTED_ENABLED_VALUE=true`
- `A16AU_DEFAULT_WHEN_MISSING=false`
- `A16AU_FAIL_CLOSED_DEFAULT=YES`

## Workflow Wiring

File changed:

- `.github/workflows/cloudflare-deploy.yml`

The workflow job env now includes:

- `A16P_OFFICIAL_IMPORT_RUNTIME_CANDIDATE_ENABLED: ${{ vars.A16P_OFFICIAL_IMPORT_RUNTIME_CANDIDATE_ENABLED || 'false' }}`
- `A16AH_OFFICIAL_IMPORT_EXECUTION_BRANCH_ENABLED: ${{ vars.A16AH_OFFICIAL_IMPORT_EXECUTION_BRANCH_ENABLED || 'false' }}`

The deploy environment verification step also checks that both resolved values
are non-empty. Because both values default to `false`, missing owner vars do not
open the runtime path.

## Source Gates Preserved

- `A16AU_ROUTE_REQUIRES_A16P_TRUE=YES`
- `A16AU_ROUTE_REQUIRES_A16AH_TRUE=YES`
- `A16AU_UI_REQUIRES_A16P_TRUE=YES`
- `A16AU_UI_REQUIRES_A16AH_TRUE=YES`
- `A16AU_SERVER_SIDE_GATES_STILL_ENFORCED=YES`
- `A16R_IMPORT_RETRY_NEXT=NO`

## Owner Manual Steps

Before a later deploy/read-only smoke:

1. In GitHub repository Actions variables, set:
   - `A16P_OFFICIAL_IMPORT_RUNTIME_CANDIDATE_ENABLED=true`
   - `A16AH_OFFICIAL_IMPORT_EXECUTION_BRANCH_ENABLED=true`
2. Run the manual Cloudflare Deploy workflow in a separate owner-approved deploy
   phase.
3. After deploy, run authenticated owner/admin read-only UI smoke only.
4. Stop if A-16AR still reports any sanitized lock reason.
5. Do not submit POST `/official-import` until a later explicit owner execution
   phase rechecks all gates in the same run.

## Safety

- `A16AU_POST_OFFICIAL_IMPORT_CALLED=NO`
- `A16AU_A16R_IMPORT_RETRY_EXECUTED=NO`
- `A16AU_DIRECT_MANUAL_RPC_CALLED=NO`
- `A16AU_SQL_RUN=NO`
- `A16AU_DB_MUTATION_RUN=NO`
- `A16AU_AUTH_ROLE_PERMISSION_MEMBERSHIP_MUTATION=NO`
- `A16AU_GENEALOGY_MUTATION=NO`
- `A16AU_DEPLOY_RUN=NO`
- `A16AU_CLOUDFLARE_ENV_SECRET_CHANGED=NO`
- `A16AU_WRANGLER_TOML_CHANGED=NO`
- `A16AU_APP_LAYOUT_TSX_CHANGED=NO`
- `A16AU_RAW_JSON_COMMITTED=NO`
- `A16AU_PRIVATE_DATA_PRINTED=NO`

## Runtime Guardrail

- Main Worker touched: `NO`
- Runtime dependency added: `NO`
- New service Worker created: `NO`
- OpenNext/Wrangler config changed: `NO`
- Worker size risk: `NO`
- Service boundary recommendation: `NONE_FOR_A16AU_WORKFLOW_ENV_WIRING_ONLY`

## Next Action

`A16AU_NEXT_ACTION=OWNER_SET_GITHUB_ACTIONS_VARS_THEN_MANUAL_CLOUDFLARE_DEPLOY_AND_A16AV_READ_ONLY_UI_SMOKE_NO_POST`
