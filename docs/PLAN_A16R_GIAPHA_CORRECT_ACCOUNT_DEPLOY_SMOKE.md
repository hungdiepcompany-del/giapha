# A-16R GIA PHA Correct Account Deploy Smoke

## Status

- Phase marker: `A-16R-GIAPHA-CORRECT-ACCOUNT-DEPLOY-SMOKE`.
- Current status:
  `A16R_GIAPHA_CORRECT_ACCOUNT_DEPLOY_SMOKE_STATUS=DEPLOYED_SMOKE_FAILED_ROLLED_BACK`.
- Preflight result:
  `A16R_GIAPHA_CORRECT_ACCOUNT_PREFLIGHT_STATUS=PASS`.
- Validation result:
  `A16R_GIAPHA_CORRECT_ACCOUNT_VALIDATION_STATUS=PASS_WITH_CLEAN_MIRROR_BUILD_CHECKOUT_NEXT_ACL_BLOCKED`.
- Cloudflare account match:
  `CLOUDFLARE_ACCOUNT_MATCH=YES`.
- Target worker found:
  `TARGET_WORKER_FOUND=YES`.
- Deploy allowed:
  `DEPLOY_ALLOWED=YES`.
- Deploy result:
  `DEPLOY_RESULT=PASS`.
- Production post-deploy smoke result:
  `PRODUCTION_POST_DEPLOY_SMOKE_RESULT=FAILED_500_ALL_REQUIRED_GET_ROUTES`.
- Rollback result:
  `ROLLBACK_RESULT=PASS_RESTORED_PREVIOUS_VERSION`.
- A-16R import retry next:
  `A16R_IMPORT_RETRY_NEXT=NO`.

This phase was deploy and smoke evidence only. It did not run official import,
direct RPC, SQL, Supabase DB mutation, migration repair or seed.

## Preflight Evidence

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
  `eb7d77d410c955b74ae73d963d8d8a4fe855b9df`.
- `origin/main` HEAD:
  `eb7d77d410c955b74ae73d963d8d8a4fe855b9df`.
- `origin/main` includes:
  `eb7d77d410c955b74ae73d963d8d8a4fe855b9df`.
- Latest local HEAD equals `origin/main`:
  `HEAD_EQUALS_ORIGIN_MAIN=YES`.
- Working tree before docs/checker updates:
  `WORKING_TREE_CLEAN=YES`.

## Validation Before Deploy

All required non-deploy validation commands passed before deploy except the
repo-local build, which hit the known ignored `.next` artifact ACL blocker.

- `npm run check:env:safe`: PASS.
- `npm run check:migrations`: PASS.
- `npm run check:a16v-production-runtime-evidence-reconciliation`: PASS.
- `npm run check:a16r-runtime-execution-enablement-gate`: PASS.
- `npm run check:a16r-runtime-execution-enablement-owner-review`: PASS.
- `npm run check:a16r-runtime-execution-enablement-push-deploy-smoke`: PASS.
- `npm run check:a16r-giapha-cloudflare-account-recovery`: PASS.
- `npm run check:a16r-giapha-cloudflare-account-verify-deploy-smoke`: PASS.
- Relevant A-16R/A-16V/A-16T/A-16U checkers: PASS.
- `npm run typecheck`: PASS.
- `npm run lint`: PASS.
- Repo-local `npm run build`:
  `FAIL_CHECKOUT_ARTIFACT_ACL_LOCKED`.
- Repo-local build error:
  `EPERM unlink .next/build/56416d4ae4ce586f.js`.
- Clean temp mirror build from current source with temp-local `npm ci`:
  PASS.
- Build classification:
  `BUILD_STATUS=PASS_CLEAN_MIRROR_SOURCE_BUILD_CHECKOUT_ARTIFACT_ACL_BLOCKED`.
- `git diff --check`: PASS.
- `git diff --cached --check`: PASS.

The clean mirror excluded `.git`, `.next`, `.open-next`, `.wrangler`,
`node_modules`, `.temp`, `.env.local`, `.dev.vars`, logs and local build
metadata. It did not read or copy repo-local secrets.

## Cloudflare Account Verification

- Wrangler command:
  `npx wrangler whoami`.
- Wrangler version observed:
  `4.100.0`.
- Current Wrangler email:
  `hungdiepcompany@gmail.com`.
- Current Wrangler account name:
  `Hungdiepcompany@gmail.com's Account`.
- Current Wrangler account id:
  `2974c02a3713cc906eddb18833d69077`.
- Expected Wrangler email:
  `hungdiepcompany@gmail.com`.
- Expected Wrangler account id:
  `2974c02a3713cc906eddb18833d69077`.
- Previous blocked account id:
  `dec1eb5cfb3f4b32956b1aff723e5ace`.
- Current account is not previous blocked account:
  `CURRENT_ACCOUNT_IS_NOT_PREVIOUS_WRONG_ACCOUNT=YES`.
- Account classification:
  `CLOUDFLARE_ACCOUNT_MATCH=YES`.

## Target Worker Verification

- Target worker name from repo config:
  `web-gia-pha`.
- Read-only target check command:
  `npx wrangler deployments list --name web-gia-pha`.
- Target check result:
  `TARGET_WORKER_FOUND=YES`.
- Pre-deploy active version:
  `77fc3067-b197-4bce-8a36-eb2bde6bacc8`.
- Pre-deploy active deployment created:
  `2026-07-03T05:10:30.367Z`.
- Target classification:
  `TARGET_WORKER_CLASSIFICATION=FOUND_IN_CORRECT_ACCOUNT`.

## Deploy Evidence

- Deploy command:
  `npm run deploy`.
- Deploy source:
  clean temp mirror of source commit
  `eb7d77d410c955b74ae73d963d8d8a4fe855b9df`.
- Deploy source classification:
  `DEPLOY_SOURCE=CLEAN_TEMP_MIRROR_CHECKOUT_NEXT_ACL_AVOIDANCE`.
- Deploy command run:
  `DEPLOY_COMMAND_RUN=YES`.
- Deployed worker:
  `web-gia-pha`.
- Production URL:
  `https://web-gia-pha.hungdiepcompany.workers.dev`.
- New deployed version:
  `d158869a-3d32-4697-8ad8-815a64526b36`.
- New deployment created:
  `2026-07-03T09:13:54.428Z`.
- Deploy classification:
  `DEPLOY_RESULT=PASS`.

Deploy warnings observed:

- OpenNext warning that Windows is not fully supported.
- Workerd compatibility-date warning for `2024-12-30`.
- Node `punycode` deprecation warning.
- npm `EBADENGINE` and deprecation warnings during temp mirror install.

## Post-Deploy Smoke Evidence

Safe GET-only smoke was run after deploy against
`https://web-gia-pha.hungdiepcompany.workers.dev`.

Routes checked:

- `/`: `500`, body length `21`.
- `/tree`: `500`, body length `21`.
- `/auth/login`: `500`, body length `21`.
- `/admin/exports/import`: `500`, body length `21`.
- `/api/admin/import-sessions/2af4bfb6-a20e-453e-9804-1b8c0afbdd68/official-import-gate`:
  `500`, body length `21`.

Classification:

- `PRODUCTION_POST_DEPLOY_SMOKE_RESULT=FAILED_500_ALL_REQUIRED_GET_ROUTES`.
- `RUNTIME_ENABLEMENT_MARKER_RECOGNIZED=UNKNOWN_SMOKE_500`.
- `A16V_RECONCILIATION_EVIDENCE_RECOGNIZED=UNKNOWN_SMOKE_500`.
- `PRODUCTION_CAN_RUN_OFFICIAL_IMPORT=unknown`.
- `PRODUCTION_OFFICIAL_IMPORT_BUTTON=unknown`.
- `REMAINING_BLOCKER=POST_DEPLOY_SMOKE_500_ALL_REQUIRED_GET_ROUTES`.

Because the required GET smoke failed, this phase does not prove runtime
readiness for A-16R official import execution.

## Rollback Evidence

The broad 500 smoke result was treated as production-impacting, so the active
Worker was rolled back to the previous known version.

- Rollback command:
  `npx wrangler rollback 77fc3067-b197-4bce-8a36-eb2bde6bacc8 --name web-gia-pha --message "Rollback A-16R deploy smoke 500 on required GET routes" --yes`.
- Rollback target version:
  `77fc3067-b197-4bce-8a36-eb2bde6bacc8`.
- Rollback result:
  `ROLLBACK_RESULT=PASS_RESTORED_PREVIOUS_VERSION`.
- Active deployment after rollback:
  `2026-07-03T09:17:16.407Z`.
- Active version after rollback:
  `77fc3067-b197-4bce-8a36-eb2bde6bacc8`.

Post-rollback GET-only smoke:

- `/`: `200`, body length `20799`.
- `/tree`: `200`, body length `18765`.
- `/auth/login`: `200`, body length `12180`.
- `/admin/exports/import`: `200`, body length `19173`.
- `/api/admin/import-sessions/2af4bfb6-a20e-453e-9804-1b8c0afbdd68/official-import-gate`:
  `401`, body length `1282`.

Post-rollback classification:

- `POST_ROLLBACK_PUBLIC_ROUTES_STATUS=PASS_GET_200`.
- `POST_ROLLBACK_OFFICIAL_IMPORT_GATE_GET_STATUS=PASS_GUARDED_401`.
- `ACTIVE_VERSION_AFTER_ROLLBACK=77fc3067-b197-4bce-8a36-eb2bde6bacc8`.

## A-16R Import Retry Classification

- A-16R import may be retried next:
  `A16R_IMPORT_MAY_BE_RETRIED_NEXT=NO`.
- Retry blocker:
  `A16R_IMPORT_RETRY_BLOCKER=POST_DEPLOY_SMOKE_FAILED_AND_ROLLED_BACK`.
- Runtime enablement marker:
  `RUNTIME_ENABLEMENT_MARKER_RECOGNIZED=UNKNOWN_SMOKE_500`.
- A-16V reconciliation evidence:
  `A16V_RECONCILIATION_EVIDENCE_RECOGNIZED=UNKNOWN_SMOKE_500`.

Actual official import execution must remain a separate explicit phase even
after a future deploy-smoke PASS.

## Forbidden Actions Confirmed

- `A16R_GIAPHA_CORRECT_ACCOUNT_POST_OFFICIAL_IMPORT_CALLED=NO`.
- `A16R_GIAPHA_CORRECT_ACCOUNT_DIRECT_RPC_CALLED=NO`.
- `A16R_GIAPHA_CORRECT_ACCOUNT_REAL_GENEALOGY_WRITE=NO`.
- `A16R_GIAPHA_CORRECT_ACCOUNT_SQL_RUN=NO`.
- `A16R_GIAPHA_CORRECT_ACCOUNT_DB_PUSH_RUN=NO`.
- `A16R_GIAPHA_CORRECT_ACCOUNT_MIGRATION_REPAIR_RUN=NO`.
- `A16R_GIAPHA_CORRECT_ACCOUNT_SEED_RUN=NO`.
- `A16R_GIAPHA_CORRECT_ACCOUNT_WRANGLER_TOML_CHANGED=NO`.
- No POST `/official-import`.
- No direct RPC call.
- No real genealogy data write.
- No SQL, Supabase DB push, migration repair or seed.
- No `wrangler.toml` change.

## Runtime Boundary Review

- Main Worker source touched: NO.
- Runtime dependency added: NO.
- New service Worker created: NO.
- OpenNext/Wrangler config changed: NO.
- Worker size risk: NO_SOURCE_CHANGE_DEPLOY_FAILED_SMOKE.
- Service boundary recommendation:
  `INVESTIGATE_DEPLOYED_RUNTIME_500_BEFORE_A16R_RETRY`.

## Next Safe Gate

`A16R_GIAPHA_CORRECT_ACCOUNT_NEXT_GATE=INVESTIGATE_DEPLOYED_RUNTIME_500_THEN_REDEPLOY_SMOKE`

The next safe step is to investigate why version
`d158869a-3d32-4697-8ad8-815a64526b36` returned 500 on required GET routes,
fix or recover that runtime blocker, then rerun a separate correct-account
deploy-smoke phase. Do not run A-16R official import while production evidence
is failed or rolled back.
