# A-16R Post-Deploy HTTP 500 Root Cause

## Status

- Phase marker: `A-16R-POST-DEPLOY-HTTP500-ROOT-CAUSE`.
- Current status:
  `A16R_POST_DEPLOY_HTTP500_ROOT_CAUSE_STATUS=LIKELY_ROOT_CAUSE_IDENTIFIED_DOCS_ONLY`.
- Root cause classification:
  `A16R_POST_DEPLOY_HTTP500_ROOT_CAUSE_CLASSIFICATION=OPENNEXT_CLOUDFLARE_INCOMPATIBILITY`.
- Root cause confidence:
  `A16R_POST_DEPLOY_HTTP500_ROOT_CAUSE_CONFIDENCE=LIKELY_NOT_PROVEN_BY_FAILED_VERSION_STACKTRACE`.
- Failed deploy version:
  `d158869a-3d32-4697-8ad8-815a64526b36`.
- Rollback active version:
  `77fc3067-b197-4bce-8a36-eb2bde6bacc8`.
- A-16R import retry next:
  `A16R_IMPORT_RETRY_NEXT=NO`.

This phase is root-cause investigation and documentation only. It does not
deploy, does not call official import, does not call direct RPC, does not run
SQL and does not mutate production data.

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

## Incident Evidence

- Correct Cloudflare account had been confirmed:
  `hungdiepcompany@gmail.com`.
- Correct Cloudflare account id:
  `2974c02a3713cc906eddb18833d69077`.
- Target worker:
  `web-gia-pha`.
- Target worker found:
  `TARGET_WORKER_FOUND=YES`.
- Failed deploy source commit:
  `eb7d77d410c955b74ae73d963d8d8a4fe855b9df`.
- Failed deploy version:
  `d158869a-3d32-4697-8ad8-815a64526b36`.
- Failed deploy created:
  `2026-07-03T09:13:54.428Z`.
- Failed deploy command source:
  `DEPLOY_SOURCE=CLEAN_TEMP_MIRROR_CHECKOUT_NEXT_ACL_AVOIDANCE`.
- Failed deploy warning:
  `OPENNEXT_WINDOWS_COMPATIBILITY_WARNING_OBSERVED=YES`.
- Failed deploy smoke:
  `PRODUCTION_POST_DEPLOY_SMOKE_RESULT=FAILED_500_ALL_REQUIRED_GET_ROUTES`.
- Failed routes:
  `/`, `/tree`, `/auth/login`, `/admin/exports/import`,
  `/api/admin/import-sessions/2af4bfb6-a20e-453e-9804-1b8c0afbdd68/official-import-gate`.
- Failed route status:
  `HTTP_500_ALL_REQUIRED_GET_ROUTES`.
- Rollback version:
  `77fc3067-b197-4bce-8a36-eb2bde6bacc8`.
- Rollback result:
  `ROLLBACK_RESULT=PASS_RESTORED_PREVIOUS_VERSION`.
- Post-rollback public routes:
  `POST_ROLLBACK_PUBLIC_ROUTES_STATUS=PASS_GET_200`.
- Post-rollback official-import-gate GET:
  `POST_ROLLBACK_OFFICIAL_IMPORT_GATE_GET_STATUS=PASS_GUARDED_401`.

## Read-Only Cloudflare Evidence

Read-only Wrangler checks were run in this phase:

- `npx wrangler deployments list --name web-gia-pha`: PASS_READ_ONLY.
- `npx wrangler deployments status --name web-gia-pha`: PASS_READ_ONLY.
- `npx wrangler versions view d158869a-3d32-4697-8ad8-815a64526b36 --name web-gia-pha`:
  PASS_READ_ONLY.
- `npx wrangler versions view 77fc3067-b197-4bce-8a36-eb2bde6bacc8 --name web-gia-pha`:
  PASS_READ_ONLY.

The failed and rollback versions both reported:

- Handler: `fetch`.
- Compatibility date: `2024-12-30`.
- Compatibility flags: `nodejs_compat`.
- Secret name visible: `SUPABASE_SERVICE_ROLE_KEY`.
- Binding visible: `env.ASSETS`.

Classification from metadata:

- `WRANGLER_VERSION_METADATA_MATCH_FAILED_AND_ROLLBACK=YES`.
- `MISSING_ENV_AT_RUNTIME=LESS_LIKELY_FROM_VERSION_METADATA`.
- `BINDING_MISMATCH=NOT_SEEN_IN_VERSION_METADATA`.
- `FAILED_VERSION_LOGS_STATUS=NOT_AVAILABLE_AFTER_ROLLBACK_NO_TAIL_TRAFFIC_GENERATED`.

No `wrangler tail` session was used because the failed version had already been
rolled back and the phase did not generate traffic against a failed production
deployment.

## Source Range Review

Source range reviewed:

`5fb248c..eb7d77d`

This range was chosen because `5fb248c` recorded production import UI
post-deploy smoke PASS, while `eb7d77d` was the source commit deployed to the
failed version.

Runtime/source files changed in that range:

- `app/api/admin/import-sessions/[sessionId]/official-import/route.ts`.
- `components/imports/import-session-manifest-panel.tsx`.
- `lib/import/giapha4/official-import-service.ts`.
- `package.json` scripts only.

Important negative evidence:

- app/layout.tsx changed: NO.
- app/(public)/page.tsx changed: NO.
- app/(public)/tree/page.tsx changed: NO.
- app/auth/login/page.tsx changed: NO.
- lib/supabase/server.ts changed: NO.
- `lib/supabase/client.ts` changed: NO.
- `lib/supabase/admin.ts` changed: NO.
- wrangler.toml changed: NO.
- open-next.config.ts changed: NO.
- next.config.ts changed: NO.
- Runtime dependencies changed: NO.

The only runtime logic change was scoped to the official-import candidate
guard and import-session panel. That path is not a global route initializer and
does not explain `/`, `/tree` and `/auth/login` all returning HTTP 500.

## Root Cause Classification

`A16R_POST_DEPLOY_HTTP500_ROOT_CAUSE_CLASSIFICATION=OPENNEXT_CLOUDFLARE_INCOMPATIBILITY`

Likely subtype:

`A16R_POST_DEPLOY_HTTP500_ROOT_CAUSE_SUBTYPE=WINDOWS_LOCAL_OPENNEXT_CLOUDFLARE_DEPLOY_BUNDLE_INCOMPATIBILITY`

Reasoning:

- The failure shape was all-route HTTP 500, including `/auth/login`, which is
  not on the official-import runtime path.
- Failed and rollback Worker versions expose the same handler, compatibility
  date, compatibility flags, secret name and assets binding in read-only
  Wrangler metadata.
- The deployed source range did not change global app layout, public route
  entrypoints, Supabase client initialization, OpenNext config, Next config,
  Wrangler config or dependencies.
- The deploy emitted the OpenNext warning that Windows is not fully compatible.
- A prior documented A-15E2 incident had the same pattern: Windows/OpenNext
  deploy warning, all-route HTTP 500, and successful rollback.

Alternative classifications:

- `MODULE_TOP_LEVEL_RUNTIME_ERROR`: NOT_PROVEN. A failed-version stack trace is
  not available, and the source delta does not show a global initializer change.
- `MISSING_ENV_AT_RUNTIME`: LESS_LIKELY. Failed and rollback versions showed
  the same secret/binding metadata, and `/auth/login` is tolerant of missing
  public Supabase config.
- `OFFICIAL_IMPORT_GUARD_IMPORT_SIDE_EFFECT`: UNLIKELY. The changed import
  guard path is not used by `/`, `/tree` or `/auth/login`.
- `AUTH_MIDDLEWARE_RUNTIME_ERROR`: NOT_SUPPORTED. No middleware file is present
  and auth login route source did not change in the reviewed range.
- `UNKNOWN_NEEDS_LOGS`: SECONDARY_CAVEAT. A direct failed-version stack trace
  would be needed to make the classification final rather than likely.

## Next Allowed Action

`A16R_POST_DEPLOY_HTTP500_NEXT_ALLOWED_ACTION=PREPARE_LINUX_OR_GITHUB_ACTIONS_DEPLOY_RETRY_WITH_PREVIEW_AND_ROLLBACK_PLAN`

Before any redeploy:

1. Do not deploy from Windows-local OpenNext until this incompatibility is
   closed by evidence.
2. Prefer GitHub Actions Linux, WSL, or another Linux-like deploy environment.
3. Run OpenNext build/upload/deploy from one documented path only.
4. Confirm current active version remains
   `77fc3067-b197-4bce-8a36-eb2bde6bacc8` before retry.
5. Keep rollback ready before traffic moves.
6. Run immediate GET-only smoke after deploy.
7. Keep A-16R official import closed unless a later explicit execution phase
   separately proves all import gates.

## Forbidden Actions Confirmed

- `A16R_POST_DEPLOY_HTTP500_DEPLOY_RUN=NO`.
- `A16R_POST_DEPLOY_HTTP500_POST_OFFICIAL_IMPORT_CALLED=NO`.
- `A16R_POST_DEPLOY_HTTP500_DIRECT_RPC_CALLED=NO`.
- `A16R_POST_DEPLOY_HTTP500_REAL_GENEALOGY_WRITE=NO`.
- `A16R_POST_DEPLOY_HTTP500_SQL_RUN=NO`.
- `A16R_POST_DEPLOY_HTTP500_DB_PUSH_RUN=NO`.
- `A16R_POST_DEPLOY_HTTP500_MIGRATION_REPAIR_RUN=NO`.
- `A16R_POST_DEPLOY_HTTP500_SEED_RUN=NO`.
- `A16R_POST_DEPLOY_HTTP500_PRODUCTION_DATA_CHANGED=NO`.
- `A16R_POST_DEPLOY_HTTP500_WRANGLER_TOML_CHANGED=NO`.
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
- Worker size risk: NO_SOURCE_CHANGE_DOCS_ONLY.
- Service boundary recommendation:
  `NONE_FOR_THIS_PHASE_USE_LINUX_DEPLOY_RETRY_PHASE`.
