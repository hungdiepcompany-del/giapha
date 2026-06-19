# Phase 128 - Production Deploy And Smoke

Status: `PRODUCTION_DEPLOY_PASS`

## Summary

Phase 128 completed the owner-approved manual production deploy check and
lightweight post-deploy smoke for the current `main` commit.

The existing GitHub Actions `Cloudflare Deploy` workflow deployed commit
`692920a5ba8779cde2d77bcf3fa8e5806cbc18aa` to the existing
`web-gia-pha` Worker. No new workflow, Worker, config, dependency, migration,
SQL or runtime feature was created.

## Owner Approval Scope

Owner approved:

- Confirm local `main` is synced with `origin/main`.
- Confirm Phase 127 status is `READY_FOR_MANUAL_DEPLOY_CHECK`.
- Run required pre-deploy gates.
- Trigger the existing manual production deploy path only after gates pass.
- Run lightweight post-deploy smoke.
- Record deploy and smoke results.

Owner did not approve migration, SQL, DB mutation, schema/auth changes, runtime
feature expansion, new Workers, config changes, dependency additions or push
after the report commit.

## Pre-Deploy Gate Result

Result: PASS.

- Phase 127 status: `READY_FOR_MANUAL_DEPLOY_CHECK`.
- Worktree before deploy: clean.
- Post-runtime/UI deploy readiness checker: PASS.
- Vietnamese UI copy checker: PASS.
- Small JSON export smoke: PASS.
- Small JSON export hardening: PASS.
- Inline admin warning UI checker: PASS.
- Export/import final readiness checker: PASS.
- Environment safety checker: PASS.
- Migration order checker: PASS.
- Typecheck: PASS.
- Lint: PASS.
- Git whitespace checks: PASS.

## Git Sync Result

Result: PASS.

- `git fetch origin --prune`: PASS.
- Local branch: `main`.
- Local HEAD: `692920a`.
- `origin/main`: `692920a`.
- `git rev-list --left-right --count HEAD...origin/main`: `0 0`.
- Working tree before deploy: clean.

No push was required or performed before deploy because local `main` and
`origin/main` were already synchronized.

## Build Result

- Workspace-root `npm run build`: FAIL before compile due to the known Windows
  `.next` ACL artifact lock:
  `EPERM: operation not permitted, unlink 'D:\CODE\GIA PHẢ\.next\build\56416d4ae4ce586f.js'`.
- Clean temp `npm run build`: PASS using a copy outside the repo with `.git`,
  `.next`, `node_modules`, env files and `PLANNING.MD` excluded.
- GitHub Actions Linux `Next build`: PASS.
- GitHub Actions deploy-step OpenNext/Next build: PASS.

The Windows root failure remains a local generated-artifact lock and did not
represent a source compile failure.

## Deploy Method

Existing approved deploy path:

- Workflow: `.github/workflows/cloudflare-deploy.yml`
- Workflow name: `Cloudflare Deploy`
- Trigger: manual `workflow_dispatch`
- Branch/ref: `main`
- GitHub Actions run:
  `https://github.com/hungdiepcompany-del/giapha/actions/runs/27817582152`

No workflow or deploy configuration was changed.

## Deploy Result

Result: PASS.

- Workflow conclusion: `success`.
- Deployed commit:
  `692920a5ba8779cde2d77bcf3fa8e5806cbc18aa`.
- Worker: `web-gia-pha`.
- Cloudflare upload: PASS.
- Cloudflare trigger deploy: PASS.
- Current Version ID:
  `4765471a-a05d-45e8-8db4-7ccb3795d002`.

## Production URL

`https://web-gia-pha.hungdiepcompany.workers.dev`

## Post-Deploy Smoke Result

Result: PASS for lightweight unauthenticated production smoke.

- Production stabilization checker against the production URL: PASS.
- `/`: HTTP 200, no obvious server error.
- `/tree`: HTTP 200, no obvious server error.
- `/auth/login`: HTTP 200, no obvious server error.
- Public tree response does not contain admin warning UI markers.
- Public tree response does not contain `notes_private`.

No write, import, restore, seed or data mutation action was performed.

## Authenticated Smoke Result

Status: `SAFE_SKIP_MISSING_EXPLICIT_AUTHENTICATED_SMOKE_ENV`.

No explicit authenticated-smoke cookie/header environment was configured in
the Codex execution process. Authenticated smoke was not attempted, and no
credential was requested, read, printed or written.

## Vietnamese UI Copy Smoke Result

Result: PASS.

- Public home response contains Vietnamese `Gia phả` copy.
- Public tree response contains `Cây gia phả công khai`.
- Login response contains `Đăng nhập`.
- Required routes returned HTTP 200 without obvious server error text.

Code/internal values remain unchanged.

## Small JSON Export Risk Note

- Current deployed change is limited to the approved small `family.json`
  hardening.
- Main Worker risk remains LOW.
- No runtime dependency was added.
- No large JSON, GEDCOM, ZIP, media, backup/restore or import runtime was
  opened.
- Authenticated export download was not run because explicit authenticated
  smoke material was unavailable.
- Large export/import/media/backup work remains governed by
  `docs/RUNTIME_WORKER_GUARDRAIL.md` and
  `docs/SERVICE_BOUNDARY_ROADMAP.md`.

## Privacy/Security Note

- Public tree smoke found no admin warning UI marker.
- Public tree smoke found no `notes_private` marker.
- No credential, token, key, cookie or secret value was written to this report.
- `/admin/system/status` authenticated content was not accessed without
  explicit authenticated smoke material.
- Existing server-side auth/permission and privacy boundaries were not changed.

## Explicitly Not Done

- No migration.
- No `.sql`.
- No DB apply.
- No SQL mutation.
- No seed/backfill.
- No schema change.
- No permission/auth logic change.
- No new runtime feature.
- No export/import runtime expansion.
- No GEDCOM/ZIP/media/backup runtime.
- No Worker created.
- No OpenNext/Wrangler config change.
- No runtime dependency added.
- No secret pasted into docs/chat.
- No authenticated smoke without explicit environment.
- No push after the deploy report commit.
- `PLANNING.MD` not read, modified or committed.

## Recommended Next Phase

Recommended next phase: an owner/operator authenticated production smoke phase
with explicit shell-only smoke material, or routine monitoring under
`docs/17_PRODUCTION_OPERATIONS_MONITORING.md`.
