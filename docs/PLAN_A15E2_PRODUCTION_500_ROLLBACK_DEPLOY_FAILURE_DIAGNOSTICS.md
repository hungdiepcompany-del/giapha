# A-15E2 - Production 500 Rollback & Deploy Failure Diagnostics

Status: `DIAGNOSTICS_ONLY_RECORDED_LOCAL`

Marker: `A15E2_PRODUCTION_500_ROLLBACK_DEPLOY_FAILURE_DIAGNOSTICS`

## Muc Tieu

A-15E2 ghi nhan su co deploy production gay HTTP 500 toan bo route, xac nhan
rollback da dua production ve trang thai on dinh, va de xuat duong deploy an
toan tiep theo. Phase nay chi la diagnostics/documentation/checker.

## Pham Vi An Toan

Duoc lam:

- thu thap thong tin read-only tu git, package scripts, Wrangler deployments va
  config hien co;
- kiem tra secret/env production o muc ten-only neu Wrangler cho phep;
- smoke read-only production sau rollback cho cac route public/protected chinh;
- tao doc, checker va package script cho phase A-15E2;
- cap nhat docs index, work log, decision log va handoff.

Khong lam:

- no deploy rerun;
- no extra rollback while production is already 200;
- no DB migration;
- no seed;
- no RLS/auth/permission/API contract change;
- no production data mutation;
- no production form submit;
- no `.env.local` commit;
- no secret value log;
- no dependency;
- no OpenNext/Wrangler config change without owner approval;
- no new service Worker.

## Incident Record

Owner-reported incident:

```text
FAILED_DEPLOY_COMMAND=npx wrangler deploy after npm run build
FAILED_DEPLOY_BEHAVIOR=OpenNext project detected, calling opennextjs-cloudflare deploy
FAILED_DEPLOY_WARNING=OpenNext warned it is not fully compatible with Windows
FAILED_DEPLOY_ROUTE_/=500
FAILED_DEPLOY_ROUTE_/tree=500
FAILED_DEPLOY_ROUTE_/auth/login=500
FAILED_DEPLOY_ROUTE_/admin=500
ROLLBACK_VERSION=4134298b-ef89-4099-b20b-b13995f397c8
ROLLBACK_STATUS=OWNER_CONFIRMED_SUCCESS
POST_ROLLBACK_/=200
POST_ROLLBACK_/tree=200
POST_ROLLBACK_/auth/login=200
```

A-15E2 did not reproduce the deploy, did not roll back again and did not mutate
production state.

## Read-Only Evidence Collected

Commands run:

- `git status -sb`
- `git log --oneline --decorate -12`
- `npx wrangler deployments list`
- `npm run | findstr /I "deploy cloudflare opennext wrangler"`
- `type package.json | findstr /I "deploy cloudflare opennext wrangler"`
- `dir -Force | findstr /I "wrangler open-next opennext cloudflare next.config package"`
- `dir .open-next -Force`
- `type wrangler.toml`
- `type open-next.config.ts`
- `type next.config.ts`
- `npx wrangler secret list`
- `npx wrangler --version`
- read-only production route status check for `/`, `/tree`, `/auth/login`,
  `/admin`

Git state at collection time:

```text
GIT_STATUS=PASS_SYNCED_CLEAN
BRANCH=main
REMOTE_STATUS=main...origin/main
HEAD=11b8bd5 docs: add heritage UI production deploy smoke readiness
```

Recent commits included:

```text
11b8bd5 docs: add heritage UI production deploy smoke readiness
9e39e24 test: record manual authenticated admin UI smoke
e5f8b0c test: diagnose Supabase auth browser session binding
69666ed test: rerun authenticated admin heritage UI smoke
aa4c722 test: add authenticated heritage UI browser smoke
2d286ad ui: polish Vietnamese heritage member form
2eed889 ui: polish Vietnamese heritage member profile
4fee41f ui: polish Vietnamese heritage family dashboard
2acdb16 ui: polish Vietnamese heritage public tree view
303f90d ui: polish Vietnamese genealogy tree editor
2c9a33f ui: apply Vietnamese traditional genealogy interface polish
383921e ui: apply modern heritage public home polish
```

Wrangler deployment history showed:

```text
ACTIVE_AFTER_FINAL_ROLLBACK=4134298b-ef89-4099-b20b-b13995f397c8
ROLLBACK_EVENTS_SEEN=2026-06-29T03:30:34.809Z,2026-06-29T03:49:14.402Z
FAILED_CANDIDATE_VERSION_SEEN=06463326-b955-4954-947c-0f4d1e943d2e
FAILED_CANDIDATE_VERSION_SEEN=17a3e237-89a0-4f13-b1f8-b2e4f00e03cb
ROLLBACK_TARGET_MESSAGE_SOURCE=Secret Change
WRANGLER_DEPLOYMENTS_LIST_STATUS=PASS_READ_ONLY
```

The final deployment entry points 100% traffic to the rollback version
`4134298b-ef89-4099-b20b-b13995f397c8`.

Package/deploy scripts:

```text
SCRIPT_preview=opennextjs-cloudflare build && opennextjs-cloudflare preview
SCRIPT_deploy=opennextjs-cloudflare build && opennextjs-cloudflare deploy
SCRIPT_upload=opennextjs-cloudflare build && opennextjs-cloudflare upload
SCRIPT_cf_typegen=wrangler types --env-interface CloudflareEnv cloudflare-env.d.ts
STANDARD_DEPLOY_SCRIPT_PRESENT=true
```

Version/config snapshot:

```text
NEXT_VERSION=16.2.9
OPENNEXT_CLOUDFLARE_VERSION=^1.19.11
WRANGLER_PACKAGE_VERSION=^4.100.0
WRANGLER_CLI_VERSION=4.100.0
WRANGLER_UPDATE_AVAILABLE=4.105.0
WRANGLER_CONFIG=wrangler.toml
WRANGLER_NAME=web-gia-pha
WRANGLER_MAIN=.open-next/worker.js
WRANGLER_COMPATIBILITY_DATE=2024-12-30
WRANGLER_COMPATIBILITY_FLAGS=nodejs_compat
OPENNEXT_CONFIG=defineCloudflareConfig()
NEXT_CONFIG=empty NextConfig object
OPENNEXT_OUTPUT_PRESENT=true
OPENNEXT_OUTPUT_LAST_WRITE=2026-06-29 10:20 local
```

`.open-next` contained generated folders including `.build`, `assets`,
`cloudflare`, `middleware`, `server-functions` and `worker.js`. The output was
treated as build artifact evidence only and was not committed.

## Production Env / Secret Names-Only

`npx wrangler secret list` returned names only:

```text
WRANGLER_SECRET_LIST_STATUS=PASS_NAMES_ONLY
SECRET_NAME_PRESENT=SUPABASE_SERVICE_ROLE_KEY
SECRET_VALUE_LOGGED=NO
```

Not verified by `wrangler secret list`:

```text
NEXT_PUBLIC_SUPABASE_URL=NOT_LISTED_AS_SECRET
NEXT_PUBLIC_SUPABASE_ANON_KEY=NOT_LISTED_AS_SECRET
NEXT_PUBLIC_APP_URL=NOT_LISTED_AS_SECRET
```

These public values may be Cloudflare vars instead of secrets, but A-15E2 did
not read or mutate Cloudflare variables beyond the read-only deployment and
secret-name checks. A future deploy phase must verify both build-time and
runtime production env sources before deploying.

## Post-Rollback Production Smoke

Read-only route check on `https://web-gia-pha.hungdiepcompany.workers.dev`:

```text
PRODUCTION_STATUS_AFTER_ROLLBACK=PASS_PUBLIC_ROUTES
ROUTE_/=200
ROUTE_/tree=200
ROUTE_/auth/login=200
ROUTE_/admin=307_LOCATION_/auth/login?reason=auth_session_missing!
```

No authenticated smoke, form submit, cookie capture, DB write or production
data mutation was performed.

## Likely Cause Candidates

These are diagnostics candidates, not final proof:

1. Windows OpenNext runtime bundle issue.
   - Owner observed the OpenNext Windows compatibility warning during deploy.
   - The failed deploy command ran from Windows.
   - Recommendation: do not deploy the main OpenNext Worker from Windows until
     a separate A-15E3 deploy phase validates a Linux/WSL/GitHub Actions path.

2. Missing or mismatched production vars/secrets.
   - Names-only secret list confirmed `SUPABASE_SERVICE_ROLE_KEY`.
   - Public env vars were not listed as secrets and may be vars/build-time
     values.
   - A missing `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` or
     `NEXT_PUBLIC_APP_URL` at build/runtime could break server-rendered routes.

3. Wrong deploy command/order.
   - The repo already has `npm run deploy` mapped to
     `opennextjs-cloudflare build && opennextjs-cloudflare deploy`.
   - Owner reported running `npm run build` and then `npx wrangler deploy`.
   - Wrangler detected OpenNext and delegated, but this path may differ from the
     repo-standard script and may reuse unexpected artifacts.

4. Stale or incompatible `.open-next` output.
   - `.open-next` exists as local generated output.
   - Running deployment from a previously generated output, or after only
     `next build`, can risk artifact mismatch if the OpenNext build step is not
     the exact deploy preflight.

5. Wrangler/OpenNext version mismatch or Windows-local CLI behavior.
   - Local Wrangler is `4.100.0` and reported update `4.105.0`.
   - OpenNext Cloudflare is `^1.19.11`.
   - Compatibility should be tested on the same environment used for deploy,
     ideally Linux CI or WSL, before touching production again.

## Safe Next Deploy Direction

Do not deploy again in A-15E2.

Recommended next phase:

```text
NEXT_PHASE=A-15E3
NEXT_PHASE_SCOPE=owner-approved deploy preflight and controlled deploy retry
DEPLOY_FROM_WINDOWS=NO_UNLESS_OWNER_APPROVES_AND_OPENNEXT_WARNING_IS_CLOSED
PREFERRED_DEPLOY_PATH=GitHub Actions Linux or WSL
STANDARD_SCRIPT_STATUS=ALREADY_PRESENT_AS_npm_run_deploy
```

A-15E3 should require:

- owner approval marker for retry;
- confirmed current production rollback version;
- verified Cloudflare account/worker target;
- verified production secret names and required vars without logging values;
- clean Linux/WSL OpenNext build artifact;
- deployment through one documented path only;
- immediate route smoke and rollback plan;
- no DB/auth/permission/API/service-runtime changes.

## Runtime Worker Guardrail

- Main Worker touched: NO.
- Runtime dependency added: NO.
- New service Worker created: NO.
- OpenNext/Wrangler config changed: NO.
- Worker size risk: NO.
- Service boundary recommendation: NONE for A-15E2; use A-15E3 for deploy
  preflight/retry only after owner approval.

## Validation Plan

- `npm run check:env:safe`
- `npm run check:a15e:heritage-ui-production-deploy-readiness-smoke`
- `npm run check:a15e2:production-500-rollback-deploy-failure-diagnostics`
- `npm run typecheck`
- `npm run lint`
- `npm run build`
- `git diff --check`
