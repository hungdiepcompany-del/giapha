# Phase 127 - Post Runtime/UI Deploy Readiness Gate

Status: `READY_FOR_MANUAL_DEPLOY_CHECK`

## Summary

Phase 127 reviews the recent runtime/UI changes after Phase 125, Phase 126 and
UI-VN-01 before any future manual deploy decision.

This is a docs/checker/readiness gate only. No deploy was performed. This gate
does not mean production is deployed, and it does not authorize deploy, push,
schema, migration, DB apply, Worker, dependency, OpenNext/Wrangler config or
runtime feature expansion.

## Scope

In scope:

- Review recent small runtime/UI changes for deploy readiness.
- Confirm main Worker and service-boundary risk after small JSON export
  hardening and Vietnamese UI copy normalization.
- Confirm dependency/config drift status.
- Confirm migration, SQL and DB impact status.
- Record owner approval requirements, pre-deploy commands and post-deploy
  smoke list for a future manual deploy phase.
- Add a static deploy-readiness checker.

Out of scope:

- Production deploy.
- GitHub push.
- Migration, SQL or DB apply.
- Runtime feature expansion.
- Large JSON/GEDCOM/ZIP/media/backup/import runtime.
- New Worker or service integration.
- OpenNext/Wrangler/deploy workflow mutation.

## Recent Commits Reviewed

- Small JSON export hardening:
  `Phase 125 - Small Main-App JSON Export Hardening`
- Small JSON export smoke:
  `Phase 126 - Small JSON Export Smoke Review`
- Vietnamese UI copy normalization:
  `UI-VN-01 - Vietnamese UI Copy Normalization`

Recent local commits referenced by this gate:

- `dbedfa1 docs: record small JSON export smoke review`
- `012dee7 chore: normalize Vietnamese UI copy`

## Runtime Impact Review

Phase 125 touched the existing small/main-app `family.json` export path only:

- Added metadata such as `app_export_version`, `export_scope` and
  `privacy_scope`.
- Added lightweight lineage sections from existing verified tables.
- Hardened future non-admin builder behavior using existing privacy filtering.

Phase 126 was static/source smoke review only and did not touch runtime.

UI-VN-01 normalized user-visible UI copy and user-facing service/validation
messages. It did not change route paths, identifiers, permission keys, enum
values, database names, JSON keys, package/env names, migration/SQL contracts
or runtime feature boundaries.

Runtime impact result: acceptable for a future manual deploy check, subject to
owner approval and the pre-deploy command list below.

## Main Worker Risk Review

- Main Worker touched: YES, from Phase 125 small existing JSON export code and
  UI-VN-01 lightweight UI/message copy.
- Runtime dependency added: NO.
- New service Worker created: NO.
- OpenNext/Wrangler config changed: NO.
- Worker size risk: LOW.
- Service boundary recommendation: NONE for the current small JSON and UI copy
  changes. Large JSON, GEDCOM, ZIP, media, import, backup and full-tree scans
  remain deferred to service-boundary-governed future phases.

This review follows `docs/RUNTIME_WORKER_GUARDRAIL.md` and
`docs/SERVICE_BOUNDARY_ROADMAP.md`.

## Dependency/Config Drift Review

Dependency/config drift result: PASS.

- No runtime dependency was added.
- No dev dependency was added.
- No `wrangler.toml` change.
- No OpenNext config change.
- No Cloudflare deploy workflow mutation.
- No deploy script mutation beyond adding the Phase 127 local checker script.

## Migration/SQL/DB Impact Review

Migration/SQL/DB impact result: PASS.

- No migration.
- No `.sql` file.
- No DB apply.
- No SQL mutation.
- No seed/backfill.
- No schema change.
- No permission/auth logic change.

## Privacy/Security Review

Privacy/security result: PASS for deploy-readiness review.

- Small JSON export hardening keeps admin export under the existing guarded
  `exports.download` path.
- Future non-admin JSON builder modes use existing privacy sanitizer behavior,
  filter hidden rows, strip private/source notes and omit non-admin tree layout
  coordinates.
- UI-VN-01 did not expose private notes, source notes, secrets, tokens or
  service-role material.
- `/admin/system/status` remains the safe route for yes/no configuration state,
  not raw environment values.
- Production smoke after a future deploy must verify public routes do not expose
  private fields or `notes_private`.

## Vietnamese UI Copy Review

Vietnamese UI copy gate result: PASS.

All user-visible UI text must remain Vietnamese with diacritics, including:

- labels
- buttons
- headings
- placeholders
- helper text
- dropdown/combobox/select labels
- toast/error/loading/empty states

Code/internal values remain English where required: route, enum, permission key,
API field, JSON key, DB table/column, env variable, package name,
function/variable names and migration/SQL contracts.

## Export JSON Review

Small JSON export gate result: PASS.

The current deploy-readiness scope includes only the existing small
`family.json` hardening:

- metadata and scope fields
- lineage sections for verified existing tables
- manifest lineage counts
- privacy-safe non-admin builder behavior

It does not authorize:

- large JSON export runtime
- GEDCOM runtime expansion
- ZIP runtime expansion
- import parser runtime
- media export/import
- backup/restore runtime
- export-service Worker
- import-service Worker

## Build Status

- Workspace-root `npm run build`: known FAIL before compile on this Windows
  checkout because old `.next` artifacts hit ACL `EPERM` during unlink at
  `D:\CODE\GIA PHẢ\.next\build\56416d4ae4ce586f.js`.
- Clean temp `npm run build`: PASS using a copy outside the repo with `.git`,
  `.next`, `node_modules`, env files and `PLANNING.MD` excluded.

The root build `EPERM` does not by itself prove a source compile failure. A
future deploy operator should use the clean temp build result and GitHub
Actions/Linux build gate to distinguish source issues from local generated
artifact locks.

## Deploy Readiness Status

`READY_FOR_MANUAL_DEPLOY_CHECK`

Meaning:

- Local/static deploy-readiness gates can be run.
- A human owner/operator may decide whether to start a separate deploy phase.
- This phase did not deploy production.
- This status is not `DEPLOYED`.

## Required Owner Approvals Before Deploy

Before any deploy phase:

- Owner explicitly approves deploy target and timing.
- Owner confirms latest local commit intended for deploy.
- Owner confirms no uncommitted files outside the deploy scope.
- Owner confirms production backup/snapshot expectations for the release.
- Owner confirms GitHub Actions/Cloudflare deploy path.
- Owner confirms Supabase Auth redirect settings and Google OAuth settings are
  still aligned with the production URL or intended custom domain.
- Owner confirms rollback owner/path.
- Owner confirms post-deploy smoke operator.

## Suggested Pre-Deploy Command List

Run before a future deploy phase:

```bash
npm run check:post-runtime-ui-deploy-readiness
npm run check:vietnamese-ui-copy
npm run check:small-json-export-smoke
npm run check:small-json-export-hardening
npm run check:inline-admin-warning-ui
npm run check:export-import-final-readiness
npm run check:export-import-static-examples
npm run check:export-import-boundary-design
npm run check:env:safe
npm run check:migrations
npm run typecheck
npm run lint
npm run build
git diff --check
git diff --cached --check
git status --short
```

If root `npm run build` hits the known Windows `.next` ACL `EPERM` before
compile, run the documented clean temp build pattern and record both results.

## Validation Results

- `npm run check:post-runtime-ui-deploy-readiness`: PASS.
- `npm run check:vietnamese-ui-copy`: PASS.
- `npm run check:small-json-export-smoke`: PASS.
- `npm run check:small-json-export-hardening`: PASS.
- `npm run check:inline-admin-warning-ui`: PASS.
- `npm run check:export-import-final-readiness`: PASS.
- `npm run check:export-import-static-examples`: PASS.
- `npm run check:export-import-boundary-design`: PASS.
- `npm run check:env:safe`: PASS.
- `npm run check:migrations`: PASS.
- `npm run typecheck`: PASS.
- `npm run lint`: PASS.
- Workspace-root `npm run build`: FAIL before compile due to the known Windows
  `.next` ACL `EPERM` artifact unlink issue.
- Clean temp `npm run build`: PASS.

## Suggested Post-Deploy Smoke List

After a future separately approved deploy:

- Confirm deployed commit/reference.
- Open `/`.
- Open `/tree`.
- Open `/auth/login`.
- Test Google OAuth callback to `/auth/callback`.
- Confirm `/admin` redirects/denies before login.
- Confirm OWNER/admin can access `/admin` after login.
- Open `/admin/system/status` and confirm no raw secret/token/key values.
- Open `/admin/people`.
- Open `/admin/relationships`.
- Open `/admin/tree`.
- Open `/admin/tree/edit`.
- Open `/admin/exports`.
- Download a small `family.json` only if permissions allow and do not commit or
  paste backup contents.
- Check public routes for privacy-safe output and no `notes_private`.
- Check Cloudflare Worker logs for 4xx/5xx spikes and secret-free logs.
- Check GitHub Actions deploy logs for secret-free output.

## Explicitly Not Done

- No deploy.
- No push.
- No migration.
- No `.sql`.
- No DB apply.
- No SQL mutation.
- No seed/backfill.
- No schema change.
- No permission/auth logic change.
- No export/import runtime expansion.
- No GEDCOM/ZIP/media/backup runtime.
- No Worker created.
- No OpenNext/Wrangler config change.
- No runtime dependency added.
- `PLANNING.MD` not read, modified or committed.

## Recommended Next Phase

Recommended next phase: owner-approved manual deploy check/deploy phase, or
defer deploy and continue with separately approved product/runtime work.
