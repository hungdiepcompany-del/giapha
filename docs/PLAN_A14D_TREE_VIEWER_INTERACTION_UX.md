# Plan A-14D - Tree Viewer Interaction Polish

Status: `PASS_LOCAL_STATIC`

## Scope

A-14D improves tree viewer/editor interaction UX with the established classic
modern genealogy direction. In other words: classic modern genealogy, cổ điển pha hiện đại, warm paper, stone text, muted rust and restrained deep green.
This is UI/UX polish only for viewing,
selecting, zooming, fitting, node cards, mini help, empty/error states and
mobile/touch clarity.

Boundary:

- Public tree vẫn read-only.
- Không schema change.
- Không migration hoặc `.sql`.
- Không DB apply.
- Không check SQL trên DB.
- Không seed/backfill.
- Không mutate dữ liệu thật ngoài UI actions đã tồn tại.
- Không merge/dedupe runtime.
- Không route/action/service merge/dedupe mới.
- Không permission runtime.
- Không Worker/OpenNext/Wrangler/deploy change.
- Không deploy.
- Không dependency mới.
- Backup gate remains `BLOCKED_PENDING_OWNER_BACKUP_GATE_CONFIRMATION`.
- `PLANNING.MD` was not read or committed.

## A-14D1 - Audit Tree Interaction UX

Reviewed:

1. Drag/pan behavior.
2. Zoom in/out.
3. Fit/reset view.
4. Person selection.
5. Selected person information.
6. Node/person cards.
7. Public tree toolbar.
8. Admin Tree Editor toolbar.
9. Empty state.
10. Layouting/loading status.
11. Error state.
12. Mobile/touch behavior.
13. Accessibility/focus state.

Findings before polish:

- Public viewer explained pan/zoom but lacked explicit zoom buttons.
- Fit/reset wording was not consistent between public viewer and admin editor.
- Public viewer had node selection but no visible selected-person preview.
- Node selected state existed but could be warmer and more keyboard visible.
- Admin editor canvas still used a colder slate background.
- Empty/error states could better distinguish public hidden data, missing data
  and permission problems.
- Admin editor toolbar needed clearer `Chế độ chỉnh sửa` language.

## A-14D2 - Tree Toolbar Interaction Polish

Implemented:

- Public viewer toolbar now has explicit buttons:
  - `Vừa màn hình`.
  - `Phóng to`.
  - `Thu nhỏ`.
  - `Đưa cây về giữa`.
- Buttons include `title` and `aria-label`.
- Search copy explains that search centers the person.
- Admin editor toolbar now says `Cây gia phả · Chế độ chỉnh sửa`.
- Admin editor toolbar keeps primary `Lưu bố cục` visually distinct from view
  controls.

No route, action or service was added.

## A-14D3 - Mini Help / First-use Guidance

Public toolbar mini help now says:

- `Kéo để di chuyển cây`.
- `cuộn để phóng to hoặc thu nhỏ`.
- `bấm vào một người để xem thông tin`.
- use `Vừa màn hình` when the tree is out of frame.

Admin editor mini help keeps the stronger editing boundary: dragging only
changes layout, and relationship changes happen through existing deliberate
forms.

## A-14D4 - Node / Person Card Polish

Implemented:

- Person name remains prominent.
- Birth/death year range remains visible.
- Living/deceased status remains visible.
- Generation, clan and branch remain visible when safe data exists.
- Selected state now uses restrained deep green and a small `Đang chọn` badge.
- Hover and keyboard focus are clearer.
- Card width remains `248px` to avoid making the tree harder to scan.

No private notes or source notes were added to node cards.

## A-14D5 - Selected Person Panel / Preview Polish

Public/admin tree viewer now includes a read-only selected-person preview:

- Empty selected state: `Chọn một người trên cây để xem thông tin`.
- Selected state: `Đang chọn`.
- Grouped fields: year range, living/deceased status, generation and branch.
- Public CTA: `Xem hồ sơ công khai`.
- Admin viewer CTA: `Mở hồ sơ quản trị`.

The preview does not add mutation, merge/dedupe, private notes or source notes.

## A-14D6 - Empty / Loading / Error State Polish

Implemented:

- Public empty state: `Gia phả này chưa có dữ liệu công khai`.
- Admin empty state guides users to add the first member and connect
  relationships.
- Layouting state remains visible as `Đang tự sắp xếp`.
- Error state avoids raw Supabase/SQL/policy wording and can show:
  - `Bạn chưa có quyền xem cây gia phả này`.
  - `Cây gia phả chưa sẵn sàng hiển thị`.
  - retry/back-navigation guidance.

## A-14D7 - Mobile / Touch UX

Implemented:

- Toolbar wraps before the canvas and does not overlay the tree.
- Buttons keep `min-h-11`.
- Viewer uses a responsive grid: canvas first, selected preview beside it on
  wide screens and below it on smaller screens.
- Text remains at readable sizes.
- No gesture dependency was added.

## A-14D8 - Public/Admin Boundary Guard

Confirmed:

- Public tree remains read-only.
- Public viewer does not show admin edit/save/add controls.
- Public selected preview links only to public profile route.
- Admin viewer selected preview links to admin profile route.
- No private notes/source notes are rendered in public tree UI.
- No route/action/service merge/dedupe was added.
- Runtime merge/dedupe remains closed.
- Permission runtime remains unregistered.
- Backup gate remains blocked.
- No service-role-as-user or auth/session/token logging was added.

## A-14D9 - Vietnamese Copy / Accessibility Sweep

Touched tree copy is Vietnamese with diacritics and avoids raw technical
wording.

Accessibility:

- View buttons have `aria-label`/`title`.
- Node cards have keyboard focus ring.
- Status text uses `aria-live` where search status is announced.
- Meaning is not color-only; selected cards also show `Đang chọn`.

## A-14D10 - Checker

Added `scripts/check-a14d-tree-viewer-interaction-ux.cjs` and package script:

`npm run check:a14d-tree-viewer-interaction-ux`

Checker verifies:

- A-14D doc exists and records interaction scope.
- Classic modern genealogy style direction exists.
- Toolbar zoom/fit/reset expectations exist.
- Mini help/first-use guidance exists.
- Node/person card focus/selected/status expectations exist.
- Selected person preview expectations exist.
- Empty/error state expectations exist.
- Mobile/touch/accessibility expectations exist.
- Public/admin read-only boundary guard exists.
- No migration, `.sql`, DB file, Worker/OpenNext/Wrangler/deploy drift.
- No merge/dedupe route/action/service/runtime opening.
- No permission runtime registration.
- No dependency drift.
- Backup gate is not bypassed.
- `PLANNING.MD` is not changed or staged.

## A-14D11 - Docs / Decision / Handoff

Updated:

- `docs/PLAN_A14D_TREE_VIEWER_INTERACTION_UX.md`
- `docs/00_INDEX.md`
- `docs/08_AI_WORK_LOG.md`
- `docs/09_DECISION_LOG.md`
- `docs/99_NEXT_AI_HANDOFF.md`

Decision: A-14D is UI/UX polish only for tree viewer interaction. It keeps
public tree read-only and does not authorize schema, DB apply, check SQL
execution, merge/dedupe runtime, permission runtime or deploy.

## A-14D12 - Validation

Validation PASS:

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
- Browser visual smoke was not run because no Browser navigation tool was
  available in this Codex session.

## A-14D13 - Commit

Commit only after validation PASS. Do not push.

Suggested commit message:

`ui: polish tree viewer interactions`

## Explicitly Not Done

- No DB apply.
- No check SQL run on DB.
- No migration.
- No `.sql` file.
- No seed/backfill.
- No schema change.
- No runtime merge/dedupe.
- No route/action/service merge/dedupe.
- No permission runtime registration.
- No backup gate bypass.
- No deploy.
- No push.
- No dependency added.
- No secret committed.
- `PLANNING.MD` was not read or committed.
