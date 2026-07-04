# A-16R GitHub Actions Linux Deploy Smoke

## Status

- Phase marker: `A-16R-GITHUB-ACTIONS-LINUX-DEPLOY-SMOKE`.
- Current status:
  `A16R_GITHUB_ACTIONS_LINUX_DEPLOY_SMOKE_STATUS=PASS_DEPLOYED_SMOKE_GET_ONLY_IMPORT_LOCKED`.
- Preflight result:
  `A16R_GITHUB_ACTIONS_LINUX_DEPLOY_PREFLIGHT_STATUS=PASS`.
- Validation result:
  `A16R_GITHUB_ACTIONS_LINUX_DEPLOY_VALIDATION_STATUS=PASS_REPO_LOCAL_BUILD`.
- Deploy path:
  `A16R_GITHUB_ACTIONS_LINUX_DEPLOY_PATH=MANUAL_GITHUB_ACTIONS_LINUX_FROM_CLEAN_ORIGIN_MAIN`.
- Deploy result:
  `A16R_GITHUB_ACTIONS_LINUX_DEPLOY_RESULT=PASS`.
- Production smoke result:
  `A16R_GITHUB_ACTIONS_LINUX_PRODUCTION_SMOKE_RESULT=PASS_REQUIRED_GET_ROUTES_NO_500`.
- Rollback result:
  `A16R_GITHUB_ACTIONS_LINUX_ROLLBACK_RESULT=NOT_RUN_NO_PRODUCTION_BREAKING_500`.
- A-16R import retry next:
  `A16R_IMPORT_RETRY_NEXT=NO`.

This phase ran the already-approved manual GitHub Actions Linux deploy path and
GET-only smoke. It did not run official import, direct RPC, SQL, Supabase DB
push, migration repair, seed, or any real genealogy data write.

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
- Local HEAD:
  `cee98384e7df6b6fc3c6703c1ff523b844d89254`.
- `origin/main` HEAD:
  `cee98384e7df6b6fc3c6703c1ff523b844d89254`.
- `origin/main` includes:
  `cee98384e7df6b6fc3c6703c1ff523b844d89254`.
- Working tree before deploy:
  `WORKING_TREE_CLEAN=YES`.

## Validation Before Deploy

- `npm run check:env:safe`: PASS.
- `npm run check:migrations`: PASS.
- `npm run check:a16r-post-deploy-http500-root-cause`: PASS.
- `npm run check:a16r-giapha-correct-account-deploy-smoke`: PASS.
- `npm run check:a16r-opennext-cloudflare-deploy-bundle-fix-candidate`: PASS.
- Relevant A-16R/A-16V/A-16T/A-16U checkers: PASS.
- `npm run typecheck`: PASS.
- `npm run lint`: PASS.
- `npm run build`: PASS in repo-local checkout.
- Build caveat:
  `A16R_GITHUB_ACTIONS_LINUX_DEPLOY_BUILD_CAVEAT=NONE_REPO_LOCAL_BUILD_PASS`.
- `git diff --check`: PASS.
- `git diff --cached --check`: PASS.

## GitHub Actions Deploy Evidence

- Workflow name:
  `Cloudflare Deploy`.
- Workflow file:
  `.github/workflows/cloudflare-deploy.yml`.
- Workflow trigger:
  `workflow_dispatch`.
- Workflow runner:
  `ubuntu-latest`.
- Workflow install:
  `npm ci`.
- Workflow deploy command:
  `npm run deploy`.
- Workflow run id:
  `28656644567`.
- Workflow job id:
  `84987243856`.
- Workflow URL:
  `https://github.com/hungdiepcompany-del/giapha/actions/runs/28656644567`.
- Workflow commit SHA:
  `cee98384e7df6b6fc3c6703c1ff523b844d89254`.
- Workflow event:
  `workflow_dispatch`.
- Workflow result:
  `A16R_GITHUB_ACTIONS_LINUX_WORKFLOW_RESULT=SUCCESS`.
- Workflow completed at:
  `2026-07-03T11:10:29Z`.

Linux workflow steps verified through GitHub run metadata:

- Checkout: success.
- Setup Node.js: success.
- Install dependencies: success.
- Verify deploy environment: success.
- Check environment safety: success.
- Check migrations order: success.
- Check deploy readiness: success.
- Check OpenNext Cloudflare wiring: success.
- Check service boundary: success.
- Check GitHub Actions build gate: success.
- Check GitHub Actions deploy workflow: success.
- Typecheck: success.
- Lint: success.
- Next build: success.
- Deploy to Cloudflare: success.

## Cloudflare Deployment Evidence

- Worker:
  `web-gia-pha`.
- Account email from deployment metadata:
  `hungdiepcompany@gmail.com`.
- Pre-deploy active rollback version:
  `77fc3067-b197-4bce-8a36-eb2bde6bacc8`.
- Previous failed Windows-local deploy version:
  `d158869a-3d32-4697-8ad8-815a64526b36`.
- New active deployed version:
  `4e7841b6-62ca-4b71-a46c-ccc21ad6cefc`.
- New deployment created:
  `2026-07-03T11:10:25.249Z`.
- New version created:
  `2026-07-03T11:10:22.416Z`.
- Deployment traffic:
  `100%`.
- Deployment source:
  `UNKNOWN_CLOUDFLARE_METADATA_BUT_TRIGGERED_BY_GITHUB_ACTIONS_RUN_28656644567`.

## Production GET-Only Smoke Evidence

Safe GET-only smoke was run against
`https://web-gia-pha.hungdiepcompany.workers.dev`.

Routes checked after the GitHub Actions Linux deploy:

- `/`: `200`, body length `20799`.
- `/tree`: `200`, body length `18765`.
- `/auth/login`: `200`, body length `12180`.
- `/admin/exports/import`: `200`, body length `19173`.
- `/api/admin/import-sessions/2af4bfb6-a20e-453e-9804-1b8c0afbdd68/official-import-gate`:
  `401`, body length `1282`.

Classification:

- `A16R_GITHUB_ACTIONS_LINUX_PRODUCTION_PUBLIC_ROUTES_STATUS=PASS_GET_200`.
- `A16R_GITHUB_ACTIONS_LINUX_OFFICIAL_IMPORT_GATE_GET_STATUS=PASS_GUARDED_401`.
- `A16R_GITHUB_ACTIONS_LINUX_PRODUCTION_SMOKE_RESULT=PASS_REQUIRED_GET_ROUTES_NO_500`.
- `A16R_GITHUB_ACTIONS_LINUX_PRODUCTION_500_OBSERVED=NO`.
- `A16R_GITHUB_ACTIONS_LINUX_ROLLBACK_REQUIRED=NO`.

## Runtime Gate Evidence

The official-import gate was read with GET only. It returned a guarded 401 and
did not execute official import.

Observed gate fields:

- `httpStatus`: `401`.
- `gate.marker`: `A16N_LOCKED_OFFICIAL_IMPORT_PREFLIGHT_GATE`.
- `gate.readOnly`: `true`.
- `gate.canOpenOfficialImport`: `false`.
- `gate.officialImportEnabled`: `false`.
- `gate.requiredFutureMarker`:
  `APPROVE_A16R_RUN_OFFICIAL_IMPORT_FOR_SESSION_<SESSION_ID>`.
- `gate.reviewPackReadiness`: `NOT_READY`.

Runtime/import classification:

- `A16R_GITHUB_ACTIONS_LINUX_RUNTIME_ENABLEMENT_MARKER_RECOGNIZED=GET_GATE_GUARDED_LOCKED`.
- `A16R_GITHUB_ACTIONS_LINUX_A16V_RECONCILIATION_EVIDENCE_RECOGNIZED=UNKNOWN_PUBLIC_AUTH_REQUIRED`.
- `A16R_GITHUB_ACTIONS_LINUX_PRODUCTION_CAN_RUN_OFFICIAL_IMPORT=false`.
- `A16R_GITHUB_ACTIONS_LINUX_PRODUCTION_OFFICIAL_IMPORT_BUTTON=UNKNOWN_AUTH_REQUIRED`.
- `A16R_GITHUB_ACTIONS_LINUX_IMPORT_GATE_REMAINS_FAIL_CLOSED=YES`.
- `A16R_IMPORT_MAY_BE_RETRIED_NEXT=NO`.
- `A16R_IMPORT_RETRY_BLOCKER=OFFICIAL_IMPORT_GATE_REMAINS_LOCKED_AND_REQUIRES_SESSION_SPECIFIC_APPROVAL`.

The deploy-smoke PASS proves the GitHub Actions Linux deployment path no longer
reproduces the prior all-route HTTP 500. It does not authorize official import.

## Rollback Decision

- Rollback trigger condition:
  production-breaking HTTP 500 on required GET routes.
- Rollback target if needed:
  `77fc3067-b197-4bce-8a36-eb2bde6bacc8`.
- Rollback command run:
  `A16R_GITHUB_ACTIONS_LINUX_ROLLBACK_COMMAND_RUN=NO`.
- Rollback result:
  `A16R_GITHUB_ACTIONS_LINUX_ROLLBACK_RESULT=NOT_RUN_NO_PRODUCTION_BREAKING_500`.
- Active version retained:
  `4e7841b6-62ca-4b71-a46c-ccc21ad6cefc`.

## Forbidden Actions Confirmed

- `A16R_GITHUB_ACTIONS_LINUX_WINDOWS_LOCAL_DEPLOY_RUN=NO`.
- `A16R_GITHUB_ACTIONS_LINUX_POST_OFFICIAL_IMPORT_CALLED=NO`.
- `A16R_GITHUB_ACTIONS_LINUX_DIRECT_RPC_CALLED=NO`.
- `A16R_GITHUB_ACTIONS_LINUX_REAL_GENEALOGY_WRITE=NO`.
- `A16R_GITHUB_ACTIONS_LINUX_SQL_RUN=NO`.
- `A16R_GITHUB_ACTIONS_LINUX_DB_PUSH_RUN=NO`.
- `A16R_GITHUB_ACTIONS_LINUX_MIGRATION_REPAIR_RUN=NO`.
- `A16R_GITHUB_ACTIONS_LINUX_SEED_RUN=NO`.
- `A16R_GITHUB_ACTIONS_LINUX_CAN_RUN_OFFICIAL_IMPORT_BYPASSED=NO`.
- `A16R_GITHUB_ACTIONS_LINUX_SESSION_RUN_MARKER_USED_TO_EXECUTE_IMPORT=NO`.
- `A16R_GITHUB_ACTIONS_LINUX_FAIL_CLOSED_GUARDS_WEAKENED=NO`.
- `A16R_GITHUB_ACTIONS_LINUX_WRANGLER_TOML_CHANGED=NO`.
- No POST `/official-import`.
- No direct RPC call.
- No real genealogy data write.
- No SQL, Supabase DB push, migration repair or seed.
- No Windows-local deploy path.

## Runtime Boundary Review

- Main Worker source touched: NO.
- Runtime dependency added: NO.
- New service Worker created: NO.
- OpenNext/Wrangler config changed: NO.
- Worker size risk: NO_SOURCE_CHANGE_GITHUB_ACTIONS_DEPLOY_ONLY.
- Service boundary recommendation:
  `NONE_FOR_THIS_PHASE_DEPLOY_SMOKE_ONLY_IMPORT_STILL_LOCKED`.

## Next Safe Gate

`A16R_GITHUB_ACTIONS_LINUX_NEXT_GATE=SEPARATE_OFFICIAL_IMPORT_EXECUTION_APPROVAL_GATE_REQUIRED`

The next phase may not run official import from this evidence alone. It must
explicitly authorize the guarded official import execution path, include the
exact session-specific marker, re-check the live gate state, and still preserve
rollback/audit verification boundaries.
