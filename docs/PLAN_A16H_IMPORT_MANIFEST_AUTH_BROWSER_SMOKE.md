# A-16H - Authenticated Browser Smoke for Import Manifest Read Screen

Marker: `A16H_IMPORT_MANIFEST_AUTH_BROWSER_SMOKE`

## Mục tiêu

A-16H thêm browser smoke có đăng nhập cho màn đọc manifest import Gia Phả 4 tại
`/admin/exports/import`. Phase này chỉ kiểm chứng UI/runtime read-only đã mở ở
A-16G: người dùng đã có session hợp lệ có thể vào màn, trang render được,
empty state tiếng Việt hoạt động và CTA nhập chính thức vẫn bị khóa.

## Phạm vi

Được chỉnh trong phase này:

- `scripts/smoke-a16h-import-manifest-auth-browser.cjs`.
- `scripts/check-a16h-import-manifest-auth-browser-smoke.cjs`.
- Package scripts cho smoke/check A-16H.
- Tài liệu index, work log, decision log và handoff.

Không chỉnh trong phase này:

- Không tạo migration mới, không sửa migration cũ.
- Không chạy `supabase db push`, không chạy `supabase db push --dry-run`,
  không chạy SQL apply và không chạy `supabase migration repair`.
- Không seed/import data, không upload/parse file Gia Phả 4.
- Không tạo import session thật, không tạo person thật, không tạo relationship
  thật, không ghi layout/revision.
- Không mở nút nhập chính thức và không thêm POST/PUT/PATCH/DELETE import
  chính thức.
- Không deploy và không push.

Marker wording cho checker: không tạo import session thật, không tạo relationship thật, không deploy.

## Smoke Mode

`smoke:a16h-import-manifest-auth-browser` có ba trạng thái máy đọc được:

- `A16H_BROWSER_SMOKE_STATUS=PASS`: có explicit authenticated browser env, mở
  được `/admin/exports/import`, thấy text tiếng Việt chính, CTA bị disabled và
  không có mutation nguy hiểm.
- `A16H_BROWSER_SMOKE_STATUS=SAFE_SKIP_MISSING_EXPLICIT_ENV`: thiếu
  `A16H_IMPORT_MANIFEST_SMOKE_BASE_URL` hoặc
  `A16H_IMPORT_MANIFEST_SMOKE_STORAGE_STATE`, hoặc storage state file không tồn
  tại. Script dừng trước khi điều hướng browser.
- `A16H_BROWSER_SMOKE_STATUS=FAIL`: có env/browser runtime nhưng trang crash,
  redirect sai, thiếu assertion, CTA không disabled hoặc phát hiện mutation
  nguy hiểm.

Nếu repo/máy chạy chưa có Playwright runtime, script báo
`A16H_BROWSER_SMOKE_STATUS=SAFE_SKIP_BROWSER_RUNTIME_UNAVAILABLE` sau khi env
explicit đã có, thay vì thêm dependency mới trong phase này.

## Env Cần Thiết

- `A16H_IMPORT_MANIFEST_SMOKE_BASE_URL`: base URL explicit, ví dụ local server
  đã được owner/operator xác nhận đúng checkout.
- `A16H_IMPORT_MANIFEST_SMOKE_STORAGE_STATE`: đường dẫn tới Playwright storage
  state đã đăng nhập, truyền qua shell env. Không lưu credential, cookie hoặc
  token vào repo.

## Assertion Chính

Khi env hợp lệ, smoke mở `/admin/exports/import` và kiểm tra:

- Không redirect bất ngờ về `/auth/login` hoặc `/unauthorized`.
- Có text: `Phiên nhập dữ liệu`.
- Có text: `Manifest dữ liệu`.
- Có text:
  `Dữ liệu bên dưới chỉ là bản xem trước, chưa được nhập vào cây gia phả.`
- Có text `Xác nhận nhập chính thức` và `chưa mở`.
- CTA nhập chính thức tồn tại và disabled/read-only.
- Page không trả HTTP 500.

## Mutation Guard

Smoke ghi nhận browser network request và fail nếu thấy method
`POST`/`PUT`/`PATCH`/`DELETE` tới route import/admin liên quan hoặc route/action
chứa các từ nguy hiểm như `confirm`, `commit`, `finalize`, `official-import`,
`import-now`, `apply`, `write`, `create-person`, `relationship`, `layout`,
`revision`.

GET API A-16G vẫn là hành vi được phép:

- `GET /api/admin/import-sessions`
- `GET /api/admin/import-sessions/[sessionId]`
- `GET /api/admin/import-sessions/[sessionId]/manifest`

## Kết Quả Validation

Kết quả trên máy hiện tại:

- PASS: `npm run check:env:safe`
- PASS: `npm run check:migrations`
- PASS: `npm run check:a16g-import-session-read-manifest-runtime`
- PASS: `npm run check:a16h-import-manifest-auth-browser-smoke`
- SAFE_SKIP: `npm run smoke:a16h-import-manifest-auth-browser` với
  `A16H_BROWSER_SMOKE_STATUS=SAFE_SKIP_MISSING_EXPLICIT_ENV` vì thiếu
  `A16H_IMPORT_MANIFEST_SMOKE_BASE_URL`.
- PASS: `npm run typecheck`
- PASS: `npm run lint`
- PASS: `npm run build`

Các lệnh validation bắt buộc đã chạy:

- `npm run check:env:safe`
- `npm run check:migrations`
- `npm run check:a16g-import-session-read-manifest-runtime`
- `npm run check:a16h-import-manifest-auth-browser-smoke`
- `npm run smoke:a16h-import-manifest-auth-browser`
- `npm run typecheck`
- `npm run lint`
- `npm run build`
- `git diff --check`

## Giới Hạn Còn Lại

A-16H không chứng minh authenticated browser PASS thật nếu thiếu explicit
session env. Khi đó kết quả chỉ là checker/static PASS cộng smoke SAFE_SKIP,
không được nâng thành browser PASS. Bước tiếp theo có thể là A-16H2 để owner
cung cấp storage state an toàn, hoặc A-16I/A-16I-prep cho upload/parse staging
riêng nhưng vẫn chưa ghi people/relationships thật.
