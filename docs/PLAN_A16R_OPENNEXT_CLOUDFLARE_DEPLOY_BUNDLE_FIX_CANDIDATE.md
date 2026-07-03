# A-16R OpenNext Cloudflare Deploy Bundle Fix Candidate

## Status

- Phase marker: `A-16R-OPENNEXT-CLOUDFLARE-DEPLOY-BUNDLE-FIX-CANDIDATE`.
- Current status:
  `A16R_OPENNEXT_CLOUDFLARE_DEPLOY_BUNDLE_FIX_CANDIDATE_STATUS=FIX_CANDIDATE_READY_DOCS_ONLY`.
- Fix candidate classification:
  `A16R_OPENNEXT_CLOUDFLARE_DEPLOY_BUNDLE_FIX_CANDIDATE_CLASSIFICATION=USE_MANUAL_GITHUB_ACTIONS_LINUX_DEPLOY_PATH`.
- Root-cause evidence referenced:
  `docs/PLAN_A16R_POST_DEPLOY_HTTP500_ROOT_CAUSE.md`.
- Correct-account failed deploy evidence referenced:
  `docs/PLAN_A16R_GIAPHA_CORRECT_ACCOUNT_DEPLOY_SMOKE.md`.
- Failed deploy version:
  `d158869a-3d32-4697-8ad8-815a64526b36`.
- Rollback active version:
  `77fc3067-b197-4bce-8a36-eb2bde6bacc8`.
- A-16R import retry next:
  `A16R_IMPORT_RETRY_NEXT=NO`.

This phase defines a safe fix candidate only. It does not deploy, does not call
official import, does not call direct RPC, does not run SQL and does not mutate
production data.

## Preflight Evidence

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
- Working tree before docs/checker updates:
  `WORKING_TREE_CLEAN=YES`.
- `origin/main` includes:
  `3cc224cb65757066b1bf48de7d2af49ca2f598ee`.

## Current Deploy Wiring

Current package scripts:

- `preview`: `opennextjs-cloudflare build && opennextjs-cloudflare preview`.
- `deploy`: `opennextjs-cloudflare build && opennextjs-cloudflare deploy`.
- `upload`: `opennextjs-cloudflare build && opennextjs-cloudflare upload`.

Current Worker/OpenNext config:

- `wrangler.toml` main: `.open-next/worker.js`.
- `wrangler.toml` assets directory: `.open-next/assets`.
- `wrangler.toml` compatibility flags: `nodejs_compat`.
- `open-next.config.ts`: default `defineCloudflareConfig()`.
- `next.config.ts`: no special deploy override.

Current workflow candidate:

- `.github/workflows/cloudflare-deploy.yml`.
- Trigger: manual `workflow_dispatch`.
- Runner: `ubuntu-latest`.
- Node: `24`.
- Install: `npm ci`.
- Build: `npm run build`.
- Deploy command in workflow: `npm run deploy`.
- Workflow auto deploy on push: NO.

## Why Repo-Local Windows Build/Deploy Is Unsafe

The failed A-16R deploy happened after local checkout validation had to avoid a
repo-local build artifact issue:

- Repo-local `npm run build` caveat:
  `REPO_LOCAL_WINDOWS_NEXT_ACL_CAVEAT=EPERM_UNLINK_DOT_NEXT_BUILD_56416d4ae4ce586f_JS`.
- Known locked path:
  `.next/build/56416d4ae4ce586f.js`.
- Previous failed deploy emitted:
  `OPENNEXT_WINDOWS_COMPATIBILITY_WARNING_OBSERVED=YES`.
- Previous failed deploy source:
  `DEPLOY_SOURCE=CLEAN_TEMP_MIRROR_CHECKOUT_NEXT_ACL_AVOIDANCE`.

The clean temp mirror reduced stale checkout artifact risk, but the deploy still
used Windows-local OpenNext/Cloudflare tooling and produced all-route HTTP 500
after deployment. Therefore the candidate must not treat local Windows temp
mirror deploy as the safest production deploy path.

## Safe Deploy Candidate Path

`A16R_OPENNEXT_CLOUDFLARE_DEPLOY_BUNDLE_SAFE_PATH=MANUAL_GITHUB_ACTIONS_LINUX_DEPLOY_FROM_CLEAN_CHECKOUT`

The safest deploy bundle strategy for the next execution phase is:

1. Use `.github/workflows/cloudflare-deploy.yml` manually with
   `workflow_dispatch` on branch `main`.
2. Let GitHub Actions create a fresh Linux checkout on `ubuntu-latest`.
3. Run `npm ci` from the clean checkout.
4. Run the existing safety checks in the workflow before deploy.
5. Run `npm run build` and `npm run deploy` from the same Linux runner.
6. Confirm active production version is still
   `77fc3067-b197-4bce-8a36-eb2bde6bacc8` immediately before any retry.
7. Keep rollback ready before traffic moves.
8. Run immediate GET-only post-deploy smoke.
9. Keep official import closed unless a later explicit execution phase proves
   all import gates again.

Clean temp mirror is still useful for local validation when repo-local `.next`
is ACL-locked:

`A16R_OPENNEXT_CLOUDFLARE_DEPLOY_BUNDLE_LOCAL_BUILD_FALLBACK=CLEAN_TEMP_MIRROR_BUILD_ONLY_NOT_PREFERRED_DEPLOY`

It is not the preferred production deploy path while the root-cause confidence
remains `LIKELY_NOT_PROVEN_BY_FAILED_VERSION_STACKTRACE`.

## Candidate Change Requirements

- `A16R_OPENNEXT_CLOUDFLARE_DEPLOY_BUNDLE_WRANGLER_TOML_CHANGE_REQUIRED=NO`.
- `A16R_OPENNEXT_CLOUDFLARE_DEPLOY_BUNDLE_OPENNEXT_CONFIG_CHANGE_REQUIRED=NO`.
- `A16R_OPENNEXT_CLOUDFLARE_DEPLOY_BUNDLE_NEXT_CONFIG_CHANGE_REQUIRED=NO`.
- `A16R_OPENNEXT_CLOUDFLARE_DEPLOY_BUNDLE_DEPLOY_SCRIPT_CHANGE_REQUIRED=NO`.
- `A16R_OPENNEXT_CLOUDFLARE_DEPLOY_BUNDLE_PACKAGE_SCRIPT_CHANGE_REQUIRED=YES_CHECKER_ONLY`.
- `A16R_OPENNEXT_CLOUDFLARE_DEPLOY_BUNDLE_HELPER_SCRIPT_ADDED=NO`.
- `A16R_OPENNEXT_CLOUDFLARE_DEPLOY_BUNDLE_WORKFLOW_CHANGE_REQUIRED=NO`.

No runtime code change is required for this candidate because the best current
evidence points to build/deploy environment risk, not a proven app code defect
or `wrangler.toml` defect.

## Forbidden Actions Confirmed

- `A16R_OPENNEXT_CLOUDFLARE_DEPLOY_BUNDLE_DEPLOY_RUN=NO`.
- `A16R_OPENNEXT_CLOUDFLARE_DEPLOY_BUNDLE_POST_OFFICIAL_IMPORT_CALLED=NO`.
- `A16R_OPENNEXT_CLOUDFLARE_DEPLOY_BUNDLE_DIRECT_RPC_CALLED=NO`.
- `A16R_OPENNEXT_CLOUDFLARE_DEPLOY_BUNDLE_REAL_GENEALOGY_WRITE=NO`.
- `A16R_OPENNEXT_CLOUDFLARE_DEPLOY_BUNDLE_SQL_RUN=NO`.
- `A16R_OPENNEXT_CLOUDFLARE_DEPLOY_BUNDLE_DB_PUSH_RUN=NO`.
- `A16R_OPENNEXT_CLOUDFLARE_DEPLOY_BUNDLE_MIGRATION_REPAIR_RUN=NO`.
- `A16R_OPENNEXT_CLOUDFLARE_DEPLOY_BUNDLE_SEED_RUN=NO`.
- `A16R_OPENNEXT_CLOUDFLARE_DEPLOY_BUNDLE_PRODUCTION_DATA_CHANGED=NO`.
- `A16R_OPENNEXT_CLOUDFLARE_DEPLOY_BUNDLE_RUNTIME_GUARDS_WEAKENED=NO`.
- `A16R_OPENNEXT_CLOUDFLARE_DEPLOY_BUNDLE_WRANGLER_TOML_CHANGED=NO`.
- No POST `/official-import`.
- No direct RPC call.
- No real genealogy data write.
- No SQL, Supabase DB push, migration repair or seed.
- No Cloudflare deploy.

## Runtime Boundary Review

- Main Worker source touched: NO.
- Runtime dependency added: NO.
- New service Worker created: NO.
- OpenNext/Wrangler config changed: NO.
- Worker size risk: NO_SOURCE_CHANGE_DOCS_CHECKER_ONLY.
- Service boundary recommendation:
  `NONE_FOR_THIS_PHASE_USE_MANUAL_GITHUB_ACTIONS_LINUX_DEPLOY_RETRY_PHASE`.

## Next Safe Gate

`A16R_OPENNEXT_CLOUDFLARE_DEPLOY_BUNDLE_NEXT_GATE=SEPARATE_MANUAL_GITHUB_ACTIONS_LINUX_DEPLOY_SMOKE_WITH_ROLLBACK_READY`

The next phase may run a manual GitHub Actions Linux deploy-smoke only if it
explicitly authorizes deploy. That later phase must still not call POST
`/official-import` unless it also explicitly authorizes official import
execution.
