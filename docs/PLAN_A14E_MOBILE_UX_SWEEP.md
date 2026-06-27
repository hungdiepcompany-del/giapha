# Plan A-14E - Mobile UX Sweep

Status: `PASS_LOCAL_STATIC`

## Scope

A-14E improves mobile and tablet usability across public UI, admin UI, Tree
Viewer, Tree Editor, people list/form, selected-person preview and shared
empty/loading/error surfaces. This follows the established classic modern
genealogy direction, tức phong cách cổ điển pha hiện đại: warm paper, stone
text, muted rust and restrained deep green, with readability/mobile use taking
priority.

Explicit direction: classic modern genealogy, responsive mobile readability,
touch target safety and accessibility are the core UX constraints for this
phase.

Boundary:

- Public tree remains read-only.
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
- `PLANNING.MD was not read or committed`.

## A-14E1 - Mobile UX Audit

Reviewed mobile/tablet risk areas:

1. Public home.
2. Public tree viewer.
3. Public person profile.
4. Admin shell/sidebar/header.
5. Admin dashboard surfaces through shared primitives.
6. People list/mobile cards.
7. Person form.
8. Tree Editor.
9. Related-member add panel.
10. Tree toolbar.
11. Selected-person preview.
12. Empty/loading/error states.
13. Public/admin auth boundary copy.

Findings before polish:

- Public/admin shell navigation could become cramped on narrow screens.
- Long brand text, email, role names, person names and profile titles needed
  stronger wrapping.
- Tree toolbar and Tree Editor toolbar had many controls and needed a mobile
  grid before wrapping into row layout.
- Tree canvas fixed desktop heights were too tall for small screens.
- People mobile card actions needed larger touch targets and safer spacing.
- Person forms and related-member add fields needed text-base inputs and
  mobile-first action layout.
- Related-member segmented controls were two columns even on very narrow
  devices.
- Empty/page header actions needed one-column mobile layout.

## A-14E2 - Responsive Layout Polish

Implemented:

- Public shell navigation uses a two-column mobile grid and full-width admin
  login action before returning to a flexible row layout.
- Public home hero uses smaller mobile heading, reduced mobile padding and
  one-column CTA layout.
- Public tree/profile pages use smaller mobile page padding.
- Admin navigation has a bounded scroll area on mobile so the sidebar does not
  make the page feel trapped.
- Page headers and shared cards now use `min-w-0`, `break-words` and mobile
  padding.
- People cards switch to one column on very narrow screens and two columns
  above 380px.
- Tree Viewer and Tree Editor canvas heights use viewport-relative mobile
  heights, then keep the larger desktop heights on wider screens.

No route was changed.

## A-14E3 - Touch Target / Button UX

Implemented:

- Public and admin shell links keep `min-h-11`.
- People mobile card actions use `min-h-11`; soft-delete remains visually
  separated from the profile action.
- Shared `ActionLink` keeps a max width, centered text and mobile-friendly
  sizing.
- Tree toolbar and editor toolbar use mobile grid layout, then wrap into row
  controls on larger screens.
- Related-member buttons and submit buttons use larger, rounded touch targets.
- Icon-only buttons were not added. Existing tree controls keep title and
  aria-label from A-14D.

No dangerous action was added.

## A-14E4 - Mobile Tree Viewer / Tree Editor

Implemented:

- Tree toolbar remains above the canvas and does not overlay tree content.
- Viewer toolbar control group is a grid on mobile.
- Selected-person preview is below the canvas on smaller screens and beside it
  only on wide screens.
- Node card width is capped with `max-w-[78vw]` so long names do not force
  horizontal page overflow.
- Tree Viewer canvas uses `h-[58vh]` and `min-h-[420px]` on mobile.
- Tree Editor canvas uses `h-[62vh]` and `min-h-[460px]` on mobile.
- Tree Editor toolbar control group is a mobile grid.
- Related-member add panel uses rounded warm paper blocks, mobile input sizing
  and narrow-screen segmented controls.

No gesture dependency was added and no mutation was added outside existing UI
actions.

## A-14E5 - Mobile Forms / Inputs

Implemented:

- Person form inputs use `text-base`, keeping mobile browsers from shrinking
  the editing experience.
- Person form submit/cancel actions stack on mobile and wrap on wider screens.
- Related-member add/search/create inputs use larger rounded controls.
- Textareas in related-member add use explicit mobile height and readable text.
- `notes_private` remains an admin-only field in the Tree Editor side panel and
  person form. It is not rendered in public tree/profile surfaces.

No DB field was added.

## A-14E6 - Mobile Empty / Loading / Error States

Implemented:

- Shared empty state uses mobile padding and one-column action layout.
- Page header action areas stack before switching to wrapped row layout.
- Tree loading/layouting state remains in the toolbar status area.
- Existing public/tree error copy remains privacy-safe and avoids raw
  Supabase/SQL/policy details.
- Permission/private guidance remains clear, including:
  `Bạn chưa có quyền xem nội dung này` as the general mobile permission
  expectation for future touched states.

No state promises unimplemented features.

## A-14E7 - Accessibility / Vietnamese Mobile Copy Sweep

Confirmed:

- Touched user-facing copy remains Vietnamese.
- Button and link touch targets remain readable and reachable.
- Focus-visible behavior from global CSS remains intact.
- Meaning is not color-only; selected states and warnings include text.
- Classic modern styling remains restrained and does not reduce readability.
- Long Vietnamese names and titles are handled through wrapping or truncation
  with safe titles on node cards.

## A-14E8 - Public/Admin/Security Boundary Guard

Confirmed:

- Public tree/profile remain read-only.
- Public UI does not expose admin actions.
- Public UI does not render `notes_private`, `source_note` or `source_notes`.
- No route/action/service merge/dedupe was added.
- Runtime merge/dedupe remains closed.
- Permission runtime remains unregistered.
- Backup gate remains blocked.
- No service-role-as-user pattern, auth/session/token/cookie logging or secret
  literal was added.

## A-14E9 - Checker

Added `scripts/check-a14e-mobile-ux-sweep.cjs` and package script:

`npm run check:a14e-mobile-ux-sweep`

Checker verifies:

- A-14E Mobile UX Sweep document exists with A-14E1 through A-14E12.
- Mobile/responsive expectations exist for public/admin/tree/form surfaces.
- Touch target/button expectations exist.
- Mobile Tree Viewer/Tree Editor expectations exist.
- Mobile form/input expectations exist.
- Empty/loading/error expectations exist.
- Accessibility/Vietnamese copy expectations exist.
- Public/admin/security boundary guard exists.
- No migration, `.sql`, DB file, Worker/OpenNext/Wrangler/deploy drift.
- No route/action/service merge/dedupe drift.
- No permission runtime registration.
- No dependency drift.
- No secret or service-role-as-user token in changed runtime files.
- Backup gate is not bypassed.
- `PLANNING.MD` is not changed or staged.

## A-14E10 - Docs / Decision / Handoff

Updated:

- `docs/PLAN_A14E_MOBILE_UX_SWEEP.md`
- `docs/00_INDEX.md`
- `docs/08_AI_WORK_LOG.md`
- `docs/09_DECISION_LOG.md`
- `docs/99_NEXT_AI_HANDOFF.md`

Decision: A-14E is mobile UX polish only. It improves readability, touch
targets and responsive behavior while preserving public/admin, DB, merge/dedupe,
permission runtime, Worker and deploy boundaries.

## A-14E11 - Validation

Validation PASS:

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

## A-14E12 - Commit

Commit only after validation PASS. Do not push.

Suggested commit message:

`ui: improve mobile genealogy experience`

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
