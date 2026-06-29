# A-15B1 - Authenticated Admin Heritage UI Browser Smoke Rerun

Status: `BROWSER_SMOKE_RERUN_RECORDED_LOCAL`

Marker: `A15B1_AUTHENTICATED_ADMIN_HERITAGE_UI_BROWSER_SMOKE_RERUN`

## Mục Tiêu Rerun

A-15B1 rerun browser smoke admin heritage UI sau A-15C để kiểm tra liệu browser
local đã có session owner/admin thật hay chưa, và các màn admin sau A-15A2 đến
A-15A6 có render ổn trên desktop/mobile không.

## Lý Do Rerun Sau A-15C

A-15B trước đó public `/tree` đã PASS nhưng admin chỉ PARTIAL/SAFE_SKIP vì thiếu
browser session. A-15C readiness rerun result: `PASS` với
`OWNER_ADMIN_PERMISSION_READY_READ_ONLY`, `ROLE_COUNT=1`, `PERMISSION_COUNT=25`
và `REQUIRED_ADMIN_PERMISSION_MISSING_COUNT=0`. Vì vậy DB/auth permission đã sẵn
sàng, nhưng browser session vẫn cần được xác minh riêng.

## Phạm Vi Verification-Only

Được làm:

- mở route bằng in-app Browser trên `http://localhost:3000`;
- đọc DOM để kiểm text, link, form render, trạng thái session/quyền và overflow;
- dùng SELECT/read-only để tìm person id an toàn cho `/admin/people/[id]`;
- ghi kết quả PASS/PARTIAL/SAFE_SKIP/FAIL theo route.

Không làm:

- Không mutate dữ liệu;
- Không submit form;
- Không seed;
- Không gán role;
- Không tạo/sửa/xóa người, quan hệ, gia phả hoặc layout;
- Không đổi database, migration, seed, RLS, auth, permission, API contract hoặc
  service runtime;
- Không lưu cookie, token, screenshot hoặc browser artifact.

## Route Smoke

Admin:

- `/admin`;
- `/admin/genealogy`;
- `/admin/tree/edit`;
- `/admin/people/new`;
- `/admin/relationships`;
- `/admin/people/[id]`.

Public sau login check:

- `/tree`;
- `/people/[slug]` nếu có public slug an toàn.

## Điều Kiện Chạy

- `git status -sb`: clean trước khi làm.
- `.env.local`: ignored bởi `.gitignore`, không stage/commit.
- Dev server mới bật trên `http://localhost:3000` sau khi env sẵn sàng.
- A-15C readiness: `PASS`.
- Browser smoke chỉ đọc; không nhập form và không bấm submit.

## Kết Quả A-15C Readiness

```text
ENV_SUPABASE_URL_PRESENT=true
ENV_SUPABASE_ANON_PRESENT=true
ENV_SERVICE_ROLE_PRESENT=true
ADMIN_CLIENT_READY=true
AUTH_USER_FOUND=true
PROFILE_FOUND=true
ROLE_COUNT=1
PERMISSION_COUNT=25
REQUIRED_ADMIN_PERMISSION_MISSING_COUNT=0
READINESS_STATUS=PASS
READINESS_REASON=OWNER_ADMIN_PERMISSION_READY_READ_ONLY
```

## Kết Luận Session / Permission Browser

Browser session result: `FAIL_AUTH_SESSION_NOT_BOUND`.

Admin shell result: `FAIL_UNKNOWN_USER_ROLE_PERMISSION_ZERO`.

Quan sát:

- `/admin` vẫn redirect sang `/auth/login?reason=auth_session_missing!`.
- Các route admin khác render được shell/form ở chế độ đọc-only, nhưng shell vẫn
  hiện `Người dùng: Không rõ`, `Vai trò: Chưa có vai trò`, `Số quyền: 0`.
- Điều này nghĩa là A-15C DB readiness đã PASS nhưng browser hiện tại chưa có
  cookie/session owner/admin thật. Không nâng admin smoke thành PASS.

## Kết Quả Desktop/Mobile

Tất cả route đã mở trong desktop và mobile `390x844` đều không có horizontal
overflow ngoài canvas.

Text smoke chính được kiểm trong browser gồm: `Quản trị gia phả`,
`Dòng họ của tôi`, `Gia phả`, `Thành viên`, `Thế hệ`, `Nhánh quan hệ`,
`Thêm thành viên`, `Phiếu ghi thông tin gia tộc`, `Quan hệ gia đình`,
`Hồ sơ thành viên`, `Công khai chỉ đọc`.

| Route | Desktop | Mobile | Kết quả | Ghi chú |
| --- | --- | --- | --- | --- |
| `/admin` | No overflow | No overflow | `FAIL_AUTH_SESSION_NOT_BOUND` | Redirect login với `auth_session_missing!`; không có session owner/admin trong browser. |
| `/admin/genealogy` | No overflow | No overflow | `PARTIAL_UNAUTHENTICATED_READONLY_RENDER` | Render admin shell và nội dung gia phả/list, có CTA nội bộ như `Xem phả đồ`, nhưng shell vẫn `Người dùng: Không rõ`, `Vai trò: Chưa có vai trò`, `Số quyền: 0`. |
| `/admin/tree/edit` | No overflow | No overflow | `PARTIAL_UNAUTHENTICATED_READONLY_RENDER` | Màn `Công cụ chỉnh sửa phả đồ` render, nhưng toolbar/action sâu như `Thêm cha`, `Thêm mẹ`, `Thêm vợ/chồng`, `Thêm con`, `Căn giữa`, `Phóng to`, `Thu nhỏ` không xác nhận PASS vì session/quyền chưa bind. Không bấm lưu hay tạo quan hệ. |
| `/admin/people/new` | No overflow | No overflow | `PARTIAL_UNAUTHENTICATED_FORM_RENDER` | Thấy `Thêm thành viên` và `Phiếu ghi thông tin gia tộc`; không nhập và không submit form. |
| `/admin/relationships` | No overflow | No overflow | `PARTIAL_UNAUTHENTICATED_FORM_RENDER` | Thấy màn `Phiếu quan hệ gia đình` và `Quan hệ gia đình`; không nhập và không submit form. |
| `/admin/people/[id]` | No overflow | No overflow | `PARTIAL_UNAUTHENTICATED_DETAIL_RENDER` | Person id lấy bằng SELECT/read-only; thấy `Hồ sơ thành viên` trong admin shell nhưng chưa có session/role/permission thật. Không sửa/lưu. |
| `/tree` | No overflow | No overflow | `PASS` | Public phả đồ vẫn render trạng thái `Công khai chỉ đọc` và empty state tiếng Việt. |
| `/people/[slug]` | Not run | Not run | `SAFE_SKIP_NO_PUBLICLY_VISIBLE_PROFILE` | Anon/public lookup không tìm thấy public slug an toàn để smoke. |

Failure bucket result: `FAIL_AUTH_SESSION_NOT_BOUND`.

Partial bucket result: `PARTIAL_ADMIN_ROUTES_RENDER_WITHOUT_BOUND_SESSION`.

Safe skip bucket result: `SAFE_SKIP_NO_PUBLICLY_VISIBLE_PROFILE`.

Pass bucket result: `PASS_PUBLIC_TREE_ONLY`.

## Vấn Đề Còn Lại

- Cần đăng nhập owner/admin thật trong browser local hoặc cung cấp một cách bind
  session an toàn để rerun admin smoke thành authenticated PASS.
- A-15C không cần seed/gán quyền thêm; blocker hiện tại là browser session, không
  phải role/permission trong DB.

## Validation Plan

- `npm run check:env:safe`
- `npm run check:a15a2:modern-vietnamese-genealogy-tree-editor-ui`
- `npm run check:a15a3:vietnamese-heritage-public-tree-view-ui`
- `npm run check:a15a4:vietnamese-heritage-family-list-admin-dashboard-ui`
- `npm run check:a15a5:member-profile-person-detail-vietnamese-heritage-ui`
- `npm run check:a15a6:add-edit-member-form-vietnamese-heritage-ux`
- `npm run check:a15b:authenticated-heritage-ui-browser-smoke`
- `npm run check:a15c:owner-admin-session-permission-smoke-readiness`
- `npm run check:a15b1:authenticated-admin-heritage-ui-browser-smoke-rerun`
- `npm run typecheck`
- `npm run lint`
- `npm run build`
- `git diff --check`
