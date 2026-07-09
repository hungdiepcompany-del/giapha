# A-16AX - Cloudflare Runtime Vars Preservation Deploy Wiring

## Status

`A16AX_STATUS=PASS_DEPLOY_PATH_PRESERVES_CLOUDFLARE_RUNTIME_VARS_NOT_DEPLOYED`

## Starting Blocker

`A16AW_BLOCKER=GITHUB_ACTIONS_REPOSITORY_VARS_ARE_NOT_CLOUDFLARE_WORKER_RUNTIME_VARS_AND_DEPLOY_DOES_NOT_KEEP_DASHBOARD_RUNTIME_VARS`

Owner production UI evidence before this phase still showed:

- `A16AX_PREVIOUS_BLOCKER=A16AR_LOCKED_RUNTIME_CANDIDATE_ENV_DISABLED`
- `A16AX_PREVIOUS_BLOCKER_2=A16AR_LOCKED_EXECUTION_BRANCH_ENV_DISABLED`

Owner permission/session gates are already proven OK by sanitized owner
evidence. A-16R import retry remains closed.

## Deploy Wiring

The standard deploy script is now:

`A16AX_DEPLOY_SCRIPT=opennextjs-cloudflare build && opennextjs-cloudflare deploy -- --keep-vars`

The manual Cloudflare Deploy workflow still uses:

`A16AX_WORKFLOW_DEPLOY_STEP=run: npm run deploy`

Because the workflow calls the standard deploy script, the owner-approved manual
deploy path now preserves dashboard-managed Cloudflare Worker runtime variables.

The workflow also runs the scoped A-16AX checker before deploy:

`A16AX_WORKFLOW_CHECK_STEP=npm run check:a16ax-cloudflare-runtime-vars-preservation-deploy-wiring`

## Owner Runtime Variable Steps

GitHub Actions repository variables alone are insufficient. The owner must set
the runtime variables on the Cloudflare Worker `web-gia-pha` production runtime
surface:

- `A16P_OFFICIAL_IMPORT_RUNTIME_CANDIDATE_ENABLED=true`
- `A16AH_OFFICIAL_IMPORT_EXECUTION_BRANCH_ENABLED=true`

These are non-secret feature gates. Do not put secret values in this phase
evidence. After setting them, the owner can run a separate owner-approved manual
Cloudflare Deploy workflow. That deploy must preserve dashboard runtime vars via
`--keep-vars`.

## Source Gates Preserved

- `A16AX_ROUTE_REQUIRES_A16P_TRUE=YES`
- `A16AX_ROUTE_REQUIRES_A16AH_TRUE=YES`
- `A16AX_UI_REQUIRES_A16P_TRUE=YES`
- `A16AX_UI_REQUIRES_A16AH_TRUE=YES`
- `A16AX_FAIL_CLOSED_DEFAULTS_PRESERVED=YES`
- `A16R_IMPORT_RETRY_NEXT=NO`

## Safety

- `A16AX_POST_OFFICIAL_IMPORT_CALLED=NO`
- `A16AX_A16R_IMPORT_RETRY_EXECUTED=NO`
- `A16AX_DIRECT_MANUAL_RPC_CALLED=NO`
- `A16AX_SQL_RUN=NO`
- `A16AX_DB_MUTATION_RUN=NO`
- `A16AX_MIGRATION_REPAIR_RUN=NO`
- `A16AX_SEED_RUN=NO`
- `A16AX_DEPLOY_RUN=NO`
- `A16AX_CLOUDFLARE_ENV_SECRET_CHANGED=NO`
- `A16AX_AUTH_ROLE_PERMISSION_MEMBERSHIP_MUTATION=NO`
- `A16AX_GENEALOGY_MUTATION=NO`
- `A16AX_WRANGLER_TOML_CHANGED=NO`
- `A16AX_APP_LAYOUT_TSX_CHANGED=NO`
- `A16AX_RAW_JSON_COMMITTED=NO`
- `A16AX_PRIVATE_DATA_PRINTED=NO`

## Runtime Guardrail

- Main Worker touched: `NO`
- Runtime dependency added: `NO`
- New service Worker created: `NO`
- OpenNext/Wrangler config changed: `NO`
- Worker size risk: `NO`
- Service boundary recommendation: `NONE_FOR_A16AX_DEPLOY_SCRIPT_ONLY`

## References

- OpenNext Cloudflare production env guidance: runtime variables must be set for
  the deployed Worker, and dashboard vars should be preserved with
  `opennextjs-cloudflare deploy -- --keep-vars`.
- Cloudflare Wrangler deploy guidance: dashboard environment variables are
  overwritten by deploy unless `keep-vars` is enabled.

## Next Action

`A16AX_NEXT_ACTION=OWNER_SET_CLOUDFLARE_WORKER_RUNTIME_VARS_THEN_RUN_MANUAL_GITHUB_ACTIONS_DEPLOY_AND_RERUN_A16AY_READ_ONLY_SMOKE_NO_POST`
