# Plan A-14G - Public Browser Visual Smoke

Status: `SAFE_SKIP_MISSING_PUBLIC_BASE_URL`

## Scope

A-14G là phase smoke public bằng browser thật cho các màn public đã polish sau
A-14A/B/C/D/E/F: public home, public tree viewer, public person profile và các
trạng thái public-safe (empty / error / private / not-found).

Phase này chỉ đọc, không mutation, không admin/auth smoke, không click submit,
không DB apply, không check SQL trên DB, không deploy, không push.

Boundary:

- Public tree remains read-only.
- Không smoke admin/auth-required route trong A-14G.
- Không click mutation action trong A-14G.
- Không schema change, không migration, không `.sql`.
- Không DB apply.
- Không check SQL trên DB.
- Không seed/backfill.
- Không merge/dedupe runtime.
- Không route/action/service merge/dedupe mới.
- Không permission runtime.
- Không Worker/OpenNext/Wrangler/deploy change.
- Không dependency mới.
- Không commit secret/session/token/cookie/storage state.
- Backup gate remains `BLOCKED_PENDING_OWNER_BACKUP_GATE_CONFIRMATION`.
- `PLANNING.MD` was not read or committed.

## A-14G1 - Public Smoke Target Resolution

Base URL được chọn theo thứ tự ưu tiên:

1. `PUBLIC_VISUAL_SMOKE_BASE_URL` (ưu tiên cao nhất cho phase này).
2. `LOCAL_SMOKE_BASE_URL`.
3. `PROD_SMOKE_BASE_URL`.

Đo lường thực tế trong checkout này:

- `PUBLIC_VISUAL_SMOKE_BASE_URL`: **không được set**.
- `LOCAL_SMOKE_BASE_URL`: **không được set**.
- `PROD_SMOKE_BASE_URL`: **không được set**.

Kết quả: **`SAFE_SKIP_MISSING_PUBLIC_BASE_URL`**.

Không tự đoán URL, không tự deploy, không tự host local server trong phase này.
Không query DB để tự tìm dữ liệu public-safe.

## A-14G2 - Browser Tooling / Smoke Mode Check

Browser/Playwright MCP tooling trong môi trường này:

- Có `playwright` MCP server đăng ký cục bộ với các tool
  `browser_navigate`, `browser_resize`, `browser_take_screenshot`,
  `browser_snapshot`, `browser_close` v.v.
- Tuy nhiên không có base URL (xem A-14G1) nên không thể điều hướng tới bất kỳ
  route public thật nào.
- Theo A-14F2, local `Browser Visual Smoke` cần `LOCAL_SMOKE_BASE_URL`
  (ví dụ `http://127.0.0.1:3000`) hoặc `PROD_SMOKE_BASE_URL` để thật sự mở
  route. Khi thiếu env, kết quả phải là `SAFE_SKIP_*`, không phải PASS.

Trạng thái tooling: **`SAFE_SKIP_BROWSER_TOOL_UNAVAILABLE` vì không có
base URL** (Playwright có sẵn nhưng không có target để mở).

Không thêm dependency mới. Không cài Playwright như devDependency. Không
commit screenshot.

## A-14G3 - Public Home Visual Smoke

Target: `/`.

Kết quả trong checkout này: **`SAFE_SKIP_MISSING_PUBLIC_BASE_URL`**.

Lý do:

- Không có base URL hợp lệ để điều hướng tới `/`.
- Không tự host local server, không tự deploy, không query DB để lấy dữ liệu
  public-safe mẫu.

Static readiness cho home vẫn pass từ A-14B: hero `Lưu giữ ký ức gia đình,
kết nối các thế hệ`, CTA `Khám phá cây gia phả` / `Đăng nhập quản trị`,
bốn benefit section (lưu giữ dòng họ, xem cây trực quan, bảo vệ riêng tư,
dữ liệu lâu dài), classic modern palette warm paper/stone/muted rust/deep
green, không lộ admin action.

## A-14G4 - Public Tree Viewer Visual Smoke

Target: `/tree`.

Kết quả trong checkout này: **`SAFE_SKIP_MISSING_PUBLIC_BASE_URL`**.

Lý do:

- Không có base URL hợp lệ để điều hướng tới `/tree`.

Static readiness cho public tree viewer từ A-14B/A-14D: warm canvas,
toolbar read-only `Tìm người` / `Vừa màn hình` / `Phóng to` / `Thu nhỏ` /
`Đưa cây về giữa`, mini help `Kéo để di chuyển cây`, node card readable
với badge `Đang chọn`, public empty state `Gia phả này chưa có dữ liệu
công khai`, public error state ẩn chữ Supabase/SQL/policy, không lộ
`notes_private` hay source notes.

Nếu route có dữ liệu public thì empty/private state PASS khi hiển thị
đúng và an toàn — trong checkout này ta không chạm browser nên ghi nhận
chưa xác minh được runtime response.

## A-14G5 - Public Person Profile Visual Smoke

Target: `/people/<slug>`.

Env gợi ý: `PUBLIC_VISUAL_SMOKE_PERSON_SLUG`.

Kết quả trong checkout này:
**`SAFE_SKIP_MISSING_PUBLIC_SAFE_PERSON_SLUG`** (kèm `SAFE_SKIP_MISSING_PUBLIC_BASE_URL`).

Lý do:

- Không có `PUBLIC_VISUAL_SMOKE_BASE_URL` để truy cập route.
- Không có `PUBLIC_VISUAL_SMOKE_PERSON_SLUG` explicit.
- Không query DB để tự tìm slug người thật.

Static readiness cho public person profile từ A-14B: chỉ hiển thị
public-safe fields (Trạng thái, Năm sinh - năm mất, Đời thứ, Chi/nhánh),
không render `notes_private` hay source notes, missing value hiển thị
`Thông tin này đang được gia đình cập nhật`, copy sống/đã mất riêng,
link quay lại `/tree`.

## A-14G6 - Public Error / Not-found / Private State Smoke

Target: một route public không tồn tại, ví dụ `/people/this-slug-does-not-exist`
hoặc một path public-safe khác theo convention repo (xem `app/(public)/people/[slug]/page.tsx`
dùng `notFound()` cho `public_person_not_found` / `public_person_hidden`).

Kết quả trong checkout này: **`SAFE_SKIP_MISSING_PUBLIC_BASE_URL`**.

Lý do:

- Không có base URL hợp lệ để điều hướng tới route public không tồn tại.

Static readiness từ A-14B/A-14D:

- `FamilyTreeErrorState` ẩn chữ Supabase/SQL/policy/database/raw error.
- `publicTreeErrorMessage` ẩn chữ permission/policy/relation/raw error.
- Thông báo tiếng Việt rõ:
  `Không thể tải cây gia phả`, `Không tìm thấy gia phả được yêu cầu hoặc
  bạn chưa có quyền xem.`, `Bạn chưa có quyền xem cây gia phả này.`,
  `Cây gia phả chưa sẵn sàng hiển thị. Gia đình có thể đang cập nhật dữ
  liệu hoặc quyền xem.`
- Hướng dẫn quay lại: action `Quay về trang chủ` ở public empty state.

Không dùng route có thể mutate.

## A-14G7 - Mobile Public Visual Smoke

Kết quả trong checkout này:
**`SAFE_SKIP_MOBILE_VIEWPORT_TOOLING_UNAVAILABLE`** (kèm
`SAFE_SKIP_MISSING_PUBLIC_BASE_URL`).

Lý do:

- Mặc dù Playwright MCP có `browser_resize` và có thể đặt viewport, ta
  không có base URL để mở route. Vì vậy không thể resize và chụp ở
  390x844 hoặc 768x1024 cho các target public.
- Theo A-14F2, mobile viewport chỉ có ý nghĩa khi đã có base URL và đã
  mở route ở desktop trước.

Static readiness cho mobile từ A-14E đã cover: public shell dùng grid 2
cột mobile, public home CTA stack một cột, public tree/profile padding
mobile, tree canvas `h-[58vh] min-h-[420px]` mobile, node card capped
`max-w-[78vw]`, toolbar dùng mobile grid, không tràn ngang.

## A-14G8 - Screenshot / Evidence Handling

Trong checkout này: **không chụp screenshot**.

Lý do:

- Không có base URL nên browser không mở được route thật, không có nội
  dung public-safe nào để chụp.
- Theo A-14F2, không commit screenshot nếu có thể chứa dữ liệu người
  thật hoặc khi repo không có convention chính thức cho output path.
- Repo không có convention chính thức cho committed screenshot từ
  visual smoke; A-14F2 đề xuất `tmp/a14f-visual-smoke/` nhưng chỉ là gợi
  ý cho chủ sở hữu và vẫn phải tránh dữ liệu nhạy cảm.

Khi base URL xuất hiện ở phase sau, screenshot path nên đặt trong
`tmp/a14g-public-visual-smoke/` (ngoài source tree) và không commit.

Không lưu token/cookie/session/storage state. Không in URL có secret query
params.

## A-14G9 - Public Browser Smoke Report

Báo cáo tổng hợp:

| Target | Base URL | Viewport | Result | Lý do |
| --- | --- | --- | --- | --- |
| Public home `/` | (none) | (none) | `SAFE_SKIP_MISSING_PUBLIC_BASE_URL` | Không có env base URL |
| Public tree `/tree` | (none) | (none) | `SAFE_SKIP_MISSING_PUBLIC_BASE_URL` | Không có env base URL |
| Public person `/people/<slug>` | (none) | (none) | `SAFE_SKIP_MISSING_PUBLIC_SAFE_PERSON_SLUG` + `SAFE_SKIP_MISSING_PUBLIC_BASE_URL` | Không có slug env + không có base URL |
| Public error / not-found / private state | (none) | (none) | `SAFE_SKIP_MISSING_PUBLIC_BASE_URL` | Không có env base URL |
| Mobile viewport (390x844 / 768x1024) | (none) | mobile | `SAFE_SKIP_MOBILE_VIEWPORT_TOOLING_UNAVAILABLE` + `SAFE_SKIP_MISSING_PUBLIC_BASE_URL` | Không có base URL nên resize không khả thi |

Browser tooling:

- Playwright MCP server có sẵn nhưng không có target URL hợp lệ để mở.
- Trạng thái tổng: `SAFE_SKIP_BROWSER_TOOL_UNAVAILABLE` vì thiếu base URL.

Visual criteria result (static only):

- Style classic modern genealogy hiện rõ trong source:
  `bg-[#f4efe6]`, `bg-[#fffaf0]`, `bg-[#fbf4e8]`, `text-stone-*`, accent
  `text-[#8a4b2a]` (muted rust) và `bg-[#245744]` / `border-[#245744]`
  (deep green).
- Public copy tiếng Việt đầy đủ ở home/tree/profile.
- Toolbar/CTA/read-only guard đã được A-14A/B/C/D/E/F xác nhận static.

Privacy / public-read-only result:

- Static source đã exclude `notes_private`, `source_note`, `source_notes`
  khỏi `PublicShell`, `PublicHome`, `PublicTreeShell`, `PublicPersonProfile`,
  `FamilyTreeViewer`, `FamilyNodeCard` theo A-14B/A-14D/A-14E.
- `getPublicPersonProfile` lọc `notes_private` qua `sanitizePersonForMode`
  và reject nếu `notes_private` còn sót.

Screenshot / evidence: không có trong phase này. Xem A-14G8.

## A-14G10 - Checker

Added `scripts/check-a14g-public-browser-visual-smoke.cjs` và package
script `npm run check:a14g-public-browser-visual-smoke`.

Checker xác minh:

- Tài liệu A-14G tồn tại và ghi rõ phase trong docs.
- Public-only scope: chỉ smoke public/read-only.
- Không fake PASS khi base URL/browser tool thiếu: phase phải ghi
  `SAFE_SKIP_MISSING_PUBLIC_BASE_URL` và
  `SAFE_SKIP_BROWSER_TOOL_UNAVAILABLE` thay vì claim visual PASS.
- Admin/auth route không bị smoke trong A-14G.
- Mutation paths không bị click — checker guard code change có khớp với
  cùng giới hạn đã thiết lập ở A-14F.
- Base URL gate: `PUBLIC_VISUAL_SMOKE_BASE_URL`, `LOCAL_SMOKE_BASE_URL`,
  `PROD_SMOKE_BASE_URL` được nhắc trong plan nhưng không bắt buộc cho
  static PASS.
- Public-safe slug gate cho `/people/[slug]`:
  `PUBLIC_VISUAL_SMOKE_PERSON_SLUG` được nhắc trong plan.
- Screenshot/evidence safety: không tạo screenshot, không commit
  storage-state/session/cookie/token.
- Public privacy guard: source code các file public không nhúng
  `notes_private` / `source_note` / `source_notes`.
- Không migration, không `.sql`, không apply DB.
- Không route/action/service merge/dedupe mới.
- Không permission runtime mới.
- Không Worker/OpenNext/Wrangler change.
- Không dependency mới.
- Backup gate không bị bypass.
- `PLANNING.MD` không bị sửa hay stage.

## A-14G11 - Docs / Decision / Handoff

Cập nhật:

- `docs/PLAN_A14G_PUBLIC_BROWSER_VISUAL_SMOKE.md` (file này).
- `docs/00_INDEX.md` (thêm dòng chỉ mục cho `PLAN_A14G`).
- `docs/08_AI_WORK_LOG.md` (ghi nhận A-14G).
- `docs/09_DECISION_LOG.md` (Decision 175: A-14G public browser visual
  smoke là SAFE_SKIP, không claim visual PASS khi thiếu base URL).
- `docs/99_NEXT_AI_HANDOFF.md` (ghi nhận phase kế tiếp cần base URL).

Decision cần ghi rõ:

- A-14G là public browser visual smoke.
- Chỉ public/read-only.
- Không admin/auth smoke.
- Không mutation.
- Không schema change.
- Không DB apply.
- Không check SQL trên DB.
- Không merge/dedupe runtime.
- Không permission runtime change.
- Không deploy.
- Backup gate vẫn cần owner evidence riêng.
- Nếu browser/base URL thiếu thì kết quả là SAFE_SKIP, không phải PASS
  thật.

## A-14G12 - Validation

Chạy:

- `npm run check:a14g-public-browser-visual-smoke` (mới).
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

Ghi chú expected:

- `check:tree-editor-auth-browser-smoke` sẽ trả safe-skip vì thiếu auth
  env — đây là kết quả mong đợi, không phải failure.
- `check:merge-dedupe-backup-gate-readiness` không tồn tại trong
  checkout hiện tại; checker A-14G ghi `NOT_AVAILABLE` và không coi là
  PASS giả.

## A-14G13 - Commit

Sau khi validation PASS, commit một lần với message gợi ý:

`docs: record public browser visual smoke`

Không push trừ khi owner yêu cầu riêng.

## Explicitly Not Done

- Không smoke admin/auth-required route trong A-14G.
- Không click mutation.
- Không apply DB.
- Không chạy check SQL trên DB.
- Không chạy migration.
- Không tạo migration hoặc `.sql`.
- Không seed/backfill.
- Không mutate dữ liệu thật.
- Không mở runtime merge/dedupe.
- Không tạo route/action/service merge/dedupe mới.
- Không đăng ký permission runtime thật.
- Không bypass backup gate.
- Không deploy.
- Không push.
- Không đổi Worker/OpenNext/Wrangler.
- Không thêm dependency nếu không thật sự bắt buộc.
- Không commit secret/session/token/cookie/storage state.
- Không đọc hoặc commit `PLANNING.MD`.
- Không claim visual PASS khi browser/base URL thiếu.
