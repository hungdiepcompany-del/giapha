# A-16R Official Import Gate Readiness Diagnosis

## Status

- Phase marker: `A-16R-OFFICIAL-IMPORT-GATE-READINESS-DIAGNOSIS`.
- Current status:
  `A16R_OFFICIAL_IMPORT_GATE_READINESS_DIAGNOSIS_STATUS=DIAGNOSED_AUTH_REQUIRED_AND_SOURCE_FAIL_CLOSED`.
- Gate status classification:
  `A16R_OFFICIAL_IMPORT_GATE_READINESS_CLASSIFICATION=UNKNOWN_NEEDS_AUTHENTICATED_SMOKE`.
- A-16R import retry next:
  `A16R_IMPORT_RETRY_NEXT=NO`.

This phase diagnoses the official-import gate after the GitHub Actions Linux
deploy/smoke PASS. It does not run official import and does not mutate data.

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
  `4f1635b94c7a884e5b3624768b1cb13939ba1bdb`.
- `origin/main` HEAD:
  `4f1635b94c7a884e5b3624768b1cb13939ba1bdb`.
- HEAD equals `origin/main`:
  `HEAD_EQUALS_ORIGIN_MAIN=YES`.
- Working tree before diagnosis updates:
  `WORKING_TREE_CLEAN=YES`.

## Prior Deploy And Smoke Evidence

- GitHub Actions Linux deploy evidence doc:
  `docs/PLAN_A16R_GITHUB_ACTIONS_LINUX_DEPLOY_SMOKE.md`.
- Workflow:
  `Cloudflare Deploy`.
- Workflow run:
  `28656644567`.
- Workflow SHA:
  `cee98384e7df6b6fc3c6703c1ff523b844d89254`.
- Active Worker version:
  `4e7841b6-62ca-4b71-a46c-ccc21ad6cefc`.
- Deploy result:
  `A16R_GITHUB_ACTIONS_LINUX_DEPLOY_RESULT=PASS`.
- Production smoke result:
  `A16R_GITHUB_ACTIONS_LINUX_PRODUCTION_SMOKE_RESULT=PASS_REQUIRED_GET_ROUTES_NO_500`.
- Required public/admin GET smoke:
  `/` = `200`, `/tree` = `200`, `/auth/login` = `200`,
  `/admin/exports/import` = `200`.
- Rollback:
  `A16R_GITHUB_ACTIONS_LINUX_ROLLBACK_RESULT=NOT_RUN_NO_PRODUCTION_BREAKING_500`.

The previous HTTP 500 deploy blocker is resolved by the GitHub Actions Linux
deploy path. That evidence only proves route availability and safe deploy path;
it does not authorize official import.

## Live GET Gate Evidence

Safe read-only production GET was run against:

`/api/admin/import-sessions/2af4bfb6-a20e-453e-9804-1b8c0afbdd68/official-import-gate`

Observed result:

- HTTP status:
  `A16R_OFFICIAL_IMPORT_GATE_READINESS_GET_STATUS=401`.
- Body marker:
  `A16N_LOCKED_OFFICIAL_IMPORT_PREFLIGHT_GATE`.
- Body read-only flag:
  `readOnly=true`.
- Body open flag:
  `canOpenOfficialImport=false`.
- Body enabled flag:
  `officialImportEnabled=false`.
- Required future marker:
  `APPROVE_A16R_RUN_OFFICIAL_IMPORT_FOR_SESSION_<SESSION_ID>`.
- Review pack readiness:
  `NOT_READY`.
- Message:
  `Bạn cần đăng nhập để xem phiên nhập dữ liệu.`

## Why The 401 Happened

The guarded `401` is expected unauthenticated behavior for the read-only gate:

- `getOfficialImportPreflightGate()` calls `getImportManifest(sessionId)`.
- `getImportManifest()` calls `ensureReadAccess()`.
- `ensureReadAccess()` returns `401` when there is no authenticated user and
  Supabase config is present.
- It requires at least an authenticated user and `imports.create` before it can
  read the import session manifest.

Therefore:

- `A16R_OFFICIAL_IMPORT_GATE_READINESS_GUARDED_401_EXPECTED_AUTH_BEHAVIOR=YES`.
- `A16R_OFFICIAL_IMPORT_GATE_READINESS_SMOKE_AUTH_CONTEXT=UNAUTHENTICATED_GET_ONLY`.
- `A16R_OFFICIAL_IMPORT_GATE_READINESS_AUTH_TOKEN_OR_COOKIE_PRESENT=NO`.
- `A16R_OFFICIAL_IMPORT_GATE_READINESS_AUTHENTICATED_GATE_STATE=UNKNOWN_NOT_TESTED`.

## Runtime And UI Diagnosis

Static source remains fail-closed:

- GET gate builder:
  `buildOfficialImportPreflightGateFromManifest()`.
- GET gate source flags:
  `canOpenOfficialImport: false`, `officialImportEnabled: false`.
- Manifest read service:
  `previewOnly: true`, `canImport: false`, `dbWrite: false`,
  `peopleWrite: false`, `relationshipWrite: false`.
- POST official import route still requires strict auth, the session-specific
  marker, the runtime enablement marker, deploy/UI/rollback/audit confirmations
  and then calls the runtime candidate service.
- Runtime candidate service still returns:
  `canRunOfficialImport: false`.
- Runtime candidate blocker:
  `A16R_BLOCKED_RUNTIME_EXECUTION_NOT_ENABLED_AFTER_A16V_VERIFY`.
- Runtime enablement marker constant:
  `APPROVE_A16R_RUNTIME_EXECUTION_AFTER_A16V_VERIFY`.
- Session-specific run marker:
  `APPROVE_A16R_RUN_OFFICIAL_IMPORT_FOR_SESSION_2af4bfb6-a20e-453e-9804-1b8c0afbdd68`.
- Admin import UI button source remains disabled:
  `disabled`, `aria-disabled="true"`.

Readiness answers:

- `A16R_OFFICIAL_IMPORT_GATE_READINESS_401_IS_AUTH_REQUIRED_ONLY_FOR_UNAUTHENTICATED_GET=YES`.
- `A16R_OFFICIAL_IMPORT_GATE_READINESS_CAN_RUN_OFFICIAL_IMPORT=false_SOURCE_STATIC`.
- `A16R_OFFICIAL_IMPORT_GATE_READINESS_OFFICIAL_IMPORT_BUTTON=DISABLED_SOURCE_STATIC`.
- `A16R_OFFICIAL_IMPORT_GATE_READINESS_RUNTIME_ENABLEMENT_MARKER_RECOGNIZED=SOURCE_MARKER_PRESENT_NOT_AUTHENTICATED_RUNTIME_PROVEN`.
- `A16R_OFFICIAL_IMPORT_GATE_READINESS_SESSION_RUN_MARKER_STATUS=REQUIRED_BUT_NOT_USED_FOR_EXECUTION`.
- `A16R_OFFICIAL_IMPORT_GATE_READINESS_A16V_RECONCILIATION_EVIDENCE=SOURCE_REFERENCES_OWNER_APPLIED_VERIFIED`.
- `A16R_OFFICIAL_IMPORT_GATE_READINESS_POST_DEPLOY_SMOKE_SUFFICIENT_FOR_IMPORT=NO_PUBLIC_GET_ONLY_AND_AUTH_REQUIRED`.

## Classification

Primary classification:

`A16R_OFFICIAL_IMPORT_GATE_READINESS_CLASSIFICATION=UNKNOWN_NEEDS_AUTHENTICATED_SMOKE`

Reasoning:

- The live `401` is expected unauthenticated read behavior, not a deploy
  failure and not a POST/import attempt.
- The unauthenticated GET cannot prove the authenticated admin gate state,
  session manifest readiness, or UI button state in a real owner session.
- Static source still keeps official import fail-closed, with
  `canRunOfficialImport=false`.
- No read-only authenticated evidence proves that A-16R may be retried.

Secondary static blockers:

- `A16R_OFFICIAL_IMPORT_GATE_READINESS_STATIC_BLOCKER=SOURCE_STILL_FAIL_CLOSED_CAN_RUN_FALSE`.
- `A16R_OFFICIAL_IMPORT_GATE_READINESS_AUTHENTICATED_SMOKE_REQUIRED=YES`.

## Next Allowed Action

`A16R_OFFICIAL_IMPORT_GATE_READINESS_NEXT_ALLOWED_ACTION=RUN_AUTHENTICATED_ADMIN_READ_ONLY_GATE_AND_UI_SMOKE_NO_POST`

The next allowed phase may only run authenticated read-only checks:

1. Use an owner/admin browser session or an explicitly approved safe auth
   context.
2. GET `/admin/exports/import`.
3. GET `/api/admin/import-sessions/2af4bfb6-a20e-453e-9804-1b8c0afbdd68/official-import-gate`.
4. Record whether the authenticated gate returns `200`, session id, review
   pack readiness, `canOpenOfficialImport`, `officialImportEnabled`,
   `canRunOfficialImport` if visible, and button enabled/disabled state.
5. Do not call POST `/official-import`.
6. Do not use the session-specific run marker to execute import.

A later execution phase is still required before any official import can run.

## Forbidden Actions Confirmed

- `A16R_OFFICIAL_IMPORT_GATE_READINESS_DEPLOY_RUN=NO`.
- `A16R_OFFICIAL_IMPORT_GATE_READINESS_POST_OFFICIAL_IMPORT_CALLED=NO`.
- `A16R_OFFICIAL_IMPORT_GATE_READINESS_DIRECT_RPC_CALLED=NO`.
- `A16R_OFFICIAL_IMPORT_GATE_READINESS_REAL_GENEALOGY_WRITE=NO`.
- `A16R_OFFICIAL_IMPORT_GATE_READINESS_SQL_RUN=NO`.
- `A16R_OFFICIAL_IMPORT_GATE_READINESS_DB_PUSH_RUN=NO`.
- `A16R_OFFICIAL_IMPORT_GATE_READINESS_MIGRATION_REPAIR_RUN=NO`.
- `A16R_OFFICIAL_IMPORT_GATE_READINESS_SEED_RUN=NO`.
- `A16R_OFFICIAL_IMPORT_GATE_READINESS_CAN_RUN_OFFICIAL_IMPORT_BYPASSED=NO`.
- `A16R_OFFICIAL_IMPORT_GATE_READINESS_SESSION_RUN_MARKER_USED_TO_EXECUTE_IMPORT=NO`.
- `A16R_OFFICIAL_IMPORT_GATE_READINESS_FAIL_CLOSED_GUARDS_WEAKENED=NO`.
- `A16R_OFFICIAL_IMPORT_GATE_READINESS_WRANGLER_TOML_CHANGED=NO`.
- No POST `/official-import`.
- No direct RPC call.
- No real genealogy data write.
- No SQL, Supabase DB push, migration repair or seed.

## Runtime Boundary Review

- Main Worker source touched: NO.
- Runtime dependency added: NO.
- New service Worker created: NO.
- OpenNext/Wrangler config changed: NO.
- Worker size risk: NO_SOURCE_CHANGE_DOCS_CHECKER_ONLY.
- Service boundary recommendation:
  `NONE_FOR_THIS_PHASE_AUTHENTICATED_READ_ONLY_GATE_SMOKE_NEXT`.
