# Plan A-14F - Browser Visual Smoke Readiness

Status: `PASS_LOCAL_STATIC_WITH_BROWSER_SAFE_SKIP`

## Scope

A-14F prepares the browser visual smoke checklist, readiness gates and static
checker for the UI/UX work completed in A-14A through A-14E. This is not a
claim that real browser visual smoke has passed. If Browser tooling or explicit
auth/session input is unavailable, the correct result is SAFE_SKIP, not a fake
PASS.

Style target remains classic modern genealogy: warm paper, stone text, muted
rust, restrained deep green, readable spacing and calm interaction states.

Boundary:

- Public tree remains read-only.
- Không schema change.
- Không migration hoặc `.sql`.
- Không DB apply.
- Không check SQL trên DB.
- Không seed/backfill.
- Không mutate dữ liệu thật.
- Không merge/dedupe runtime.
- Không route/action/service merge/dedupe mới.
- Không permission runtime.
- Không Worker/OpenNext/Wrangler/deploy change.
- Không deploy.
- Không dependency mới.
- Backup gate remains `BLOCKED_PENDING_OWNER_BACKUP_GATE_CONFIRMATION`.
- `PLANNING.MD` was not read or committed.

## A-14F1 - Visual Smoke Scope Audit

Public/read-only visual smoke candidates:

| Screen | Route | Auth | Dataset | A-14F status |
| --- | --- | --- | --- | --- |
| Public home | `/` | Not required | Existing public-safe data or safe empty state | Readiness only; can run with base URL |
| Public tree viewer | `/tree` | Not required | Existing public-safe data or safe empty state | Readiness only; can run with base URL |
| Public person profile | `/people/[slug]` | Not required | Known public-safe slug required | Readiness only; safe-skip if slug absent |
| Public error/private/not-found states | invalid public routes or hidden data | Not required | Safe route only | Readiness only |

Admin/auth-required visual smoke candidates:

| Screen | Route | Auth | Dataset | A-14F status |
| --- | --- | --- | --- | --- |
| Admin dashboard | `/admin` | Explicit auth session/env required | Read-only view | SAFE_SKIP without explicit auth |
| Admin shell/sidebar/header | any admin route | Explicit auth session/env required | Read-only view | SAFE_SKIP without explicit auth |
| People list | `/admin/people` | Explicit auth session/env required | Read-only view | SAFE_SKIP without explicit auth |
| Person form | `/admin/people/new` or `/admin/people/[id]` | Explicit auth session/env required | Safe dataset; no submit | SAFE_SKIP without explicit auth |
| Tree Editor | `/admin/tree/edit` | Explicit auth session/env required | Safe dataset; no mutation | SAFE_SKIP without explicit auth |
| Related-member add panel | `/admin/tree/edit` after selecting a person | Explicit auth session/env required | Safe dataset; no submit | SAFE_SKIP without explicit auth and dataset approval |
| Tree toolbar/selected preview | `/admin/tree` or `/admin/tree/edit` | Explicit auth session/env required for admin routes | Read-only interaction | SAFE_SKIP without explicit auth |
| Empty/loading/error states | controlled safe routes or fixture states | Depends on route | Safe fixture/dataset approval | Readiness only |

Mobile/tablet visual smoke candidates:

- Public home mobile.
- Public tree mobile.
- Admin dashboard mobile.
- Tree Editor mobile.
- Related-member add panel mobile.

Public screens can be smoked without auth when a local or deployed base URL is
explicitly provided. Admin screens require explicit auth/session. Mutation paths
require separate safe dataset approval and must not be clicked in A-14F.

## A-14F2 - Browser Environment Requirements

Required environment for real browser smoke:

- `LOCAL_SMOKE_BASE_URL` for local browser smoke, for example
  `http://127.0.0.1:3000`.
- `PROD_SMOKE_BASE_URL` only when owner wants deployed read-only route smoke.
- Browser navigation tooling or a project-approved Playwright/browser runner.
- Desktop, tablet and mobile viewport list:
  - desktop: 1440 x 900;
  - tablet: 768 x 1024;
  - mobile: 390 x 844.
- Screenshot output path outside committed source unless owner explicitly
  approves checked-in artifacts, for example `tmp/a14f-visual-smoke/`.

Admin smoke additionally requires explicit session input prepared outside the
repo:

- `GIA_PHA_AUTH_BROWSER_SMOKE=1`
- `GIA_PHA_SMOKE_BASE_URL`
- `GIA_PHA_AUTH_STORAGE_STATE_PATH`

Safety rules:

- Do not commit auth storage state.
- Do not print token, cookie, OAuth code, bearer value or session contents.
- Do not use a service role key as a browser user.
- Do not read `.env.local`, `.dev.vars` or secret files for this phase.
- Do not click submit/delete/soft-delete/merge/dedupe/mutation actions.
- Mutation-path smoke requires separate safe dataset approval.

If Browser tooling is unavailable, A-14F readiness may PASS with:

`SAFE_SKIP_BROWSER_TOOL_UNAVAILABLE`

That status means no real visual PASS was claimed.

## A-14F3 - Visual Pass/Fail Criteria

Classic modern genealogy criteria:

- Warm paper or ivory background remains visible.
- Stone text remains readable.
- Muted rust/deep green accents are restrained.
- Public/admin main screens do not feel like a cold industrial dashboard.

Readability criteria:

- Text is large enough on desktop/tablet/mobile.
- Headings are clear.
- Line-height remains comfortable.
- No horizontal overflow.
- Long names, roles and emails do not break layout.

Interaction criteria:

- Toolbar labels/tooltips are understandable.
- Zoom, fit and reset controls are easy to identify.
- Selected state is visible through text and styling.
- Node cards remain readable and not visually overloaded.
- Side panels do not cover the whole canvas on mobile unless the route
  intentionally stacks below it.

Mobile criteria:

- Touch targets are large enough.
- Actions stack predictably.
- Tree toolbar does not cover the canvas.
- Forms are easy to tap and read.
- No horizontal overflow.

Safety criteria:

- Public UI does not expose admin actions.
- Public UI does not expose `notes_private`, `source_note` or `source_notes`.
- Admin UI does not imply merge/dedupe runtime is open.
- Backup gate remains blocked.
- Raw technical errors are not exposed where privacy-safe copy exists.

## A-14F4 - Readiness Script / Safe-skip Checker

Added `scripts/check-a14f-browser-visual-smoke-readiness.cjs` and package
script:

`npm run check:a14f-browser-visual-smoke-readiness`

Checker verifies:

- A-14F doc exists and records visual smoke readiness.
- Public/admin/mobile visual scope exists.
- Browser environment requirements exist.
- Auth/session safety gates exist and admin smoke safe-skips without explicit
  auth/session.
- Mutation paths require safe dataset approval and safe-skip otherwise.
- Browser tooling unavailable is recorded as
  `SAFE_SKIP_BROWSER_TOOL_UNAVAILABLE`, not visual PASS.
- No secret/session/token/cookie/storage-state file is committed.
- No migration, `.sql`, DB apply, check SQL, Worker/OpenNext/Wrangler,
  dependency, merge/dedupe runtime or permission runtime drift.
- Backup gate is not bypassed.
- `PLANNING.MD` is not changed or staged.

## A-14F5 - Optional Local Smoke Commands Docs

Readiness commands:

```powershell
npm run check:a14f-browser-visual-smoke-readiness
npm run build
```

Optional public read-only smoke, only when Browser tooling is available:

```powershell
$env:LOCAL_SMOKE_BASE_URL="http://127.0.0.1:3000"
# open /, /tree, /people/[public-safe-slug] at desktop/tablet/mobile viewports
```

Optional admin smoke, only with explicit owner/operator-managed auth session:

```powershell
$env:GIA_PHA_AUTH_BROWSER_SMOKE="1"
$env:GIA_PHA_SMOKE_BASE_URL="http://127.0.0.1:3000"
$env:GIA_PHA_AUTH_STORAGE_STATE_PATH="C:\path\outside\repo\storage-state.json"
```

Do not commit screenshots, auth storage, cookies, tokens or local session files
unless a later owner-approved artifact phase explicitly says so. Do not install
Playwright or any browser dependency in A-14F.

## A-14F6 - Docs / Decision / Handoff

Updated:

- `docs/PLAN_A14F_BROWSER_VISUAL_SMOKE_READINESS.md`
- `docs/00_INDEX.md`
- `docs/08_AI_WORK_LOG.md`
- `docs/09_DECISION_LOG.md`
- `docs/99_NEXT_AI_HANDOFF.md`

Decision: A-14F is browser visual smoke readiness only. It prepares scope,
safe-skip behavior and pass/fail criteria. It does not claim browser visual
PASS unless a later run actually opens the routes with approved tooling and
explicit auth/session where required.

## A-14F7 - Validation

Validation PASS:

- `npm run check:a14f-browser-visual-smoke-readiness`
- `npm run check:a14e-mobile-ux-sweep`
- `npm run check:a14d-tree-viewer-interaction-ux`
- `npm run check:a14c-admin-dashboard-layout-ux`
- `npm run check:a14b-public-tree-home-ux`
- `npm run check:a14a-related-member-add-ux`
- `npm run check:a14-ui-ux-overhaul`
- `npm run check:ui-polish`
- `npm run check:vietnamese-ui-copy`
- `npm run check:vietnamese-cultural-ui-ux`
- `npm run check:tree-relationship-picker-ux`
- `npm run check:tree-inline-create-person-ux`
- `npm run check:tree-duplicate-suggestion-ux`
- `npm run check:tree-polish-dedupe-readiness-data-quality`
- `npm run check:tree-editor-auth-browser-smoke`
- `npm run check:merge-dedupe-transaction-audit-design`
- `npm run check:merge-dedupe-schema-candidate-readiness`
- `npm run check:merge-dedupe-real-migration-readiness`
- `npm run check:env:safe`
- `npm run check:migrations`
- `npm run typecheck`
- `npm run lint`
- `npm run build`
- `git diff --check`
- `git diff --cached --check`

Notes:

- `check:tree-editor-auth-browser-smoke` returned the expected
  `A09_AUTH_BROWSER_SMOKE_SKIPPED_MISSING_EXPLICIT_AUTH_SESSION` safe-skip.
- `check:merge-dedupe-backup-gate-readiness` is `NOT_AVAILABLE` in this
  checkout; this is not backup PASS and does not change A-13B status.
- Root `npm run build` passed directly; no clean temp-copy workaround was
  required.
- Browser visual smoke itself was not run; A-14F remains readiness with
  `SAFE_SKIP_BROWSER_TOOL_UNAVAILABLE` when Browser tooling is unavailable.

## A-14F8 - Commit

Commit only after validation PASS. Do not push.

Suggested commit message:

`docs: add browser visual smoke readiness`

## Explicitly Not Done

- No real browser visual PASS claimed.
- No DB apply.
- No check SQL run on DB.
- No migration.
- No `.sql` file.
- No seed/backfill.
- No data mutation.
- No runtime merge/dedupe.
- No route/action/service merge/dedupe.
- No permission runtime registration.
- No backup gate bypass.
- No deploy.
- No push.
- No Worker/OpenNext/Wrangler config change.
- No dependency added.
- No secret/session/token/cookie/storage state committed.
- `PLANNING.MD` was not read or committed.
