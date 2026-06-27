# Plan A-14B - Public Tree / Home UX Classic Modern Polish

Status: `PASS_LOCAL_STATIC`

## Scope

A-14B improves the public home, public tree viewer and public person profile
experience with a restrained classic modern genealogy style, tức phong cách
cổ điển pha hiện đại cho tư liệu gia đình. This is UI/UX runtime polish only.

Boundary:

- DB chưa apply.
- check SQL chưa chạy trên DB.
- runtime merge/dedupe vẫn đóng.
- permission runtime chưa đăng ký.
- backup gate chưa bị bypass and remains
  `BLOCKED_PENDING_OWNER_BACKUP_GATE_CONFIRMATION`.
- No migration, no `.sql`, no schema change, no Worker/OpenNext/Wrangler change,
  no dependency and no deploy.
- Không deploy trong phase này.

## A-14B1 - Audit Public/Home UX

Reviewed public surfaces:

1. Home/landing page.
2. Public tree page.
3. Public person detail/profile page.
4. Public header/navigation/footer.
5. Tree viewer toolbar.
6. Empty state.
7. Loading/layouting status through toolbar status.
8. Error state.
9. Mobile/responsive structure.
10. Typography, spacing and color.

Findings before polish:

- Home page had useful stats but felt too close to a generic app demo.
- It did not strongly communicate lưu giữ, kết nối and truyền lại gia phả.
- Public tree instructions were too thin for first-time or older users.
- Toolbar labels were understandable but could better explain search, pan, zoom
  and reset behavior.
- Person profile was safe but sparse; missing fields needed warmer "đang cập
  nhật" copy.
- Empty/error states could be clearer about public privacy and permission.
- Public shell needed a more family-archive feeling while staying simple.

## A-14B2 - Public Visual System Polish

Applied classic modern genealogy direction:

- Warm paper and ivory backgrounds: `#f4efe6`, `#fbf4e8`, `#fffaf0`.
- Stone text for readability.
- Muted rust accent for genealogy labels and deep green for primary actions.
- Moderate rounded corners with light borders/shadows.
- Public shell brand mark and footer reinforce "Lưu giữ ký ức gia đình".
- Tree canvas uses a warmer paper tone instead of cold slate gray.

No neon color, heavy gradient, busy animation or dashboard-industrial styling
was added.

## A-14B3 - Home / Landing Page UX

Implemented:

- Hero message: `Lưu giữ ký ức gia đình, kết nối các thế hệ`.
- CTA: `Khám phá cây gia phả`.
- Admin CTA: `Đăng nhập quản trị`.
- Clear explanation that public pages are read-only and management requires
  permission.
- Family archive stats panel: public people count and privacy-filtered node
  count.
- Benefit sections:
  - lưu giữ dòng họ;
  - xem cây trực quan;
  - bảo vệ riêng tư;
  - dữ liệu lâu dài.

Copy avoids promising features that do not exist and keeps export phrasing tied
to admin capability.

## A-14B4 - Public Tree Viewer UX

Implemented:

- Public tree title now says `Khám phá cây gia phả`.
- Guidance callout explains dragging, scroll zoom and search.
- Toolbar copy explains how to search and focus a person.
- Button labels are clearer: `Tìm người`, `Vừa màn hình`, `Sắp xếp lại`.
- Toolbar buttons have titles for assistive context.
- Tree frame, background and node cards use the warmer classic modern palette.
- Public empty state explains that private data may be hidden.
- Public error state avoids technical raw error language.

No public mutation, edit, delete, merge or layout save action was added.

## A-14B5 - Public Person Detail / Preview UX

Implemented:

- Public person profile now groups `Thông tin chính`.
- Missing values use: `Thông tin này đang được gia đình cập nhật`.
- Living-person privacy callout remains explicit.
- Non-living profile has a gentle "đang hoàn thiện" callout.
- Profile keeps public-safe fields only: status, year range, generation and
  branch.

Public UI still does not render `notes_private`, `source_note` or
`source_notes`.

## A-14B6 - Responsive / Accessibility

Implemented:

- Touch targets remain at least `min-h-11` for primary controls.
- Toolbar stacks on mobile and avoids horizontal overflow.
- Public nav wraps and retains visible focus.
- Search input uses readable text size.
- Tree control buttons have explanatory `title` attributes.
- Error/empty/callout states use text as well as color.

## A-14B7 - Vietnamese Copy Sweep

Public copy is Vietnamese with diacritics and avoids raw technical wording:

- `Lưu giữ ký ức gia đình`
- `Khám phá cây gia phả`
- `Thông tin này đang được gia đình cập nhật`
- `Không thể tải cây gia phả`
- `Công khai chỉ đọc, quản trị sau đăng nhập`

No English public labels were introduced.

## A-14B8 - Checker

Added `scripts/check-a14b-public-tree-home-ux.cjs` and package script:

`npm run check:a14b-public-tree-home-ux`

Checker verifies:

- A-14B doc exists and records the classic modern genealogy direction.
- Main public copy is Vietnamese with diacritics.
- Public UI has privacy-safe copy and does not expose private/source notes.
- Empty/error/tree instruction/responsive/accessibility expectations exist.
- No migration or `.sql` change.
- No DB apply or check SQL claim.
- No merge/dedupe route/action/service/runtime opening.
- No permission runtime registration.
- No Worker/OpenNext/Wrangler/deploy drift.
- No dependency drift.
- No secret-like public UI token.
- Backup gate remains blocked.

## A-14B9 - Docs / Decision / Handoff

Updated:

- `docs/PLAN_A14B_PUBLIC_TREE_HOME_UX.md`
- `docs/00_INDEX.md`
- `docs/08_AI_WORK_LOG.md`
- `docs/09_DECISION_LOG.md`
- `docs/99_NEXT_AI_HANDOFF.md`

Decision: A-14B is public/home/tree viewer UI polish only. It applies classic
modern genealogy styling and does not authorize schema, DB apply,
merge/dedupe runtime, permission runtime or deploy. Backup gate still needs
separate owner evidence.

## A-14B10 - Validation

Validation PASS:

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

Validation safe-skip / not available:

A-09 missing explicit auth/session remains an expected safe-skip when that
checker is run.

`check:merge-dedupe-backup-gate-readiness` is `NOT_AVAILABLE` in this checkout,
so A-13B backup gate remains blocked and was not recreated by A-14B.

## A-14B11 - Commit boundary

Commit only after validation PASS. Do not push.

Suggested commit message:

`ui: polish public genealogy experience`

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
