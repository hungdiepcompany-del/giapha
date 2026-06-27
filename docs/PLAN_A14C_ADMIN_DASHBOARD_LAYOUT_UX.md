# Plan A-14C - Admin Dashboard / Layout UX Polish

Status: `PASS_LOCAL_STATIC`

## Scope

A-14C improves admin dashboard, admin shell/sidebar, shared admin primitives,
people list/filter/form polish and admin safety copy with the same classic
modern genealogy direction established in A-14A and A-14B: cổ điển pha hiện đại,
warm paper, stone text, muted rust and restrained deep green.

Boundary:

- Không schema change.
- Không migration hoặc `.sql`.
- Không DB apply.
- Không check SQL trên DB.
- Không seed/backfill.
- Không merge/dedupe runtime.
- Không route/action/service merge/dedupe mới.
- Không permission runtime.
- Không Worker/OpenNext/Wrangler/deploy change.
- Không deploy.
- Không dependency mới.
- Backup gate remains `BLOCKED_PENDING_OWNER_BACKUP_GATE_CONFIRMATION`.
- `PLANNING.MD` was not read or committed.

## A-14C1 - Audit Admin UX

Reviewed admin surfaces:

1. Admin dashboard.
2. Sidebar/menu admin.
3. Header/topbar admin.
4. Page heading and descriptions.
5. People/member management.
6. Tree viewer and Tree Editor entry.
7. Export/import, backup dry-run, revision and system status pages.
8. Tables/lists.
9. Forms.
10. Empty/loading/error states.
11. Warning/permission states.
12. Mobile/responsive layout.

Findings before polish:

- Dashboard looked functional but too much like a technical module launcher.
- Sidebar groups were useful but could better match genealogy work: overview,
  member/profile, tree, import/export and safety/system.
- Menu items lacked short descriptions, so users had to know routes before
  choosing the next step.
- People filter and list used colder slate styling and did not strongly convey
  the safe workflow: find person, open profile, then edit.
- Row actions put edit/view and soft delete close together without enough visual
  separation.
- Empty state was acceptable but could better explain the first genealogy step.
- Admin safety states needed an explicit reminder that backup gate and
  merge/dedupe runtime remain closed.

## A-14C2 - Admin Visual System Alignment

Applied classic modern genealogy styling to admin UI:

- Warm paper backgrounds remain the admin base.
- Section cards now use rounded corners, light borders and gentle shadow.
- Action links use deep green for primary action and warm hover states.
- Status callouts use rounded containers and info callouts use warm paper.
- Admin form fields use rounded corners and deep-green focus state.
- Sidebar active state uses restrained deep green instead of a cold black slab.

No neon, heavy gradient, busy animation, route change or UI dependency was
added. Public UI from A-14B and Tree Editor UX from A-14A were not changed.

## A-14C3 - Admin Sidebar / Navigation Polish

Implemented grouped navigation:

- Tổng quan.
- Thành viên / hồ sơ.
- Cây gia phả.
- Nhập / xuất dữ liệu.
- An toàn / hệ thống.

Each group now has a short description, and each item has a short explanation
so users can choose the next step without knowing the route name. Active state
is clearer, accessible through `aria-current`, and visually warmer.

No existing admin route was hidden or renamed at the route level. No permission
runtime was added.

## A-14C4 - Admin Dashboard Polish

Dashboard now works as a practical starting point:

- Hero/title copy frames it as the internal genealogy administration notebook.
- Quick actions:
  - Thêm thành viên.
  - Mở Tree Editor.
  - Xem cây công khai.
  - Xuất dữ liệu.
- Status cards clarify:
  - Public/Admin are separated.
  - Merge/dedupe is still closed.
  - Backup gate still needs owner evidence.
- Module cards keep existing routes but use warmer text and action labels.

The dashboard does not claim the database is ready for merge/dedupe apply and
does not create any new mutation.

## A-14C5 - Tables / Lists UX Polish

People list polish:

- Summary banner explains how many members are visible.
- Desktop table uses warm header and rounded frame.
- Mobile cards use warm paper style.
- Empty state explains the first safe step: add the first member, then connect
  relationships.
- Missing branch/generation values say `Chưa rõ` instead of a bare dash.
- Edit/view action remains text-link style.
- Soft-delete action is visually separated with red low-emphasis chip/button.

No delete, merge or dedupe action was added.

## A-14C6 - Forms / Detail Pages Polish

Person form polish:

- Inputs use rounded corners.
- Focus state uses the same restrained deep green.
- Existing field groups and admin-only private-note guidance remain unchanged.

No field was added. Existing schema/service fields are still the only data
surface used by the form.

## A-14C7 - Admin Safety / Permission UX

Safety copy added or preserved:

- Dashboard warns that A-13B backup gate remains separate.
- Dashboard says DB apply, check SQL, merge/dedupe runtime and permission
  runtime are still closed.
- People page converts query error display into a generic Vietnamese operation
  failure message rather than echoing raw query content.
- System status still shows only yes/no configuration and does not expose
  secret values.
- Backup dry-run page remains explicit that it does not create production
  backup, upload storage, restore data or call a real Worker.

No permission bypass, service-role-as-user or permission runtime registration
was introduced.

## A-14C8 - Vietnamese Copy / Accessibility Sweep

Touched admin copy is Vietnamese with diacritics and avoids raw technical terms
where a user-facing phrase is clearer.

Accessibility and responsive behavior:

- Navigation retains `aria-current`.
- Primary controls keep `min-h-11`.
- Focus state remains visible.
- Sidebar descriptions are text, not color-only.
- People table keeps horizontal scroll on desktop widths and card fallback on
  mobile.

## A-14C9 - Checker

Added `scripts/check-a14c-admin-dashboard-layout-ux.cjs` and package script:

`npm run check:a14c-admin-dashboard-layout-ux`

Checker verifies:

- A-14C doc sections exist.
- Classic modern genealogy style direction is recorded.
- Admin sidebar/navigation tokens exist.
- Dashboard quick actions and safety status cards exist.
- People filter/list empty/action states exist.
- Admin primitives use rounded/warm style and green focus.
- Public privacy tokens are not exposed in touched public/admin surfaces.
- No migration, `.sql`, DB file, Worker/OpenNext/Wrangler/deploy drift.
- No merge/dedupe route/action/service/runtime opening.
- No permission runtime registration.
- No dependency drift.
- Backup gate is not bypassed.
- `PLANNING.MD` is not changed or staged.

## A-14C10 - Docs / Decision / Handoff

Updated:

- `docs/PLAN_A14C_ADMIN_DASHBOARD_LAYOUT_UX.md`
- `docs/00_INDEX.md`
- `docs/08_AI_WORK_LOG.md`
- `docs/09_DECISION_LOG.md`
- `docs/99_NEXT_AI_HANDOFF.md`

Decision: A-14C is UI/UX polish only for admin dashboard/layout and does not
authorize schema, DB apply, check SQL execution, merge/dedupe runtime,
permission runtime or deploy.

## A-14C11 - Validation

Validation PASS:

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

Root build PASS directly; no Windows `.next` EPERM occurred, so no clean
temp-copy build was needed.

A-09 missing explicit auth/session remains an expected safe-skip when that
checker is run.

`check:merge-dedupe-backup-gate-readiness` is `NOT_AVAILABLE` in this checkout,
so backup readiness is not inferred from A-14C.

Browser visual smoke was not run because no Browser navigation tool was
available in this Codex session.

## A-14C12 - Commit

Commit only after validation PASS. Do not push.

Suggested commit message:

`ui: polish admin genealogy experience`

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
