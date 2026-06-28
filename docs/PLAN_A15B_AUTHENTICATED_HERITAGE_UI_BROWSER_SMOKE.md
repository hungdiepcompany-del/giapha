# A-15B - Authenticated Heritage UI Browser Smoke

Status: `BROWSER_SMOKE_RECORDED_LOCAL`

Marker: `A15B_AUTHENTICATED_HERITAGE_UI_BROWSER_SMOKE`

## Mục Tiêu

A-15B ghi nhận smoke trình duyệt sau chuỗi A-15A2 đến A-15A6 cho các màn gia phả
public và admin. Phase này chỉ xác minh route, trạng thái phiên, quyền, dữ liệu
thật nếu có, responsive desktop/mobile, CTA đọc-only và trạng thái tiếng Việt.

## Phạm Vi Verification-Only

Được làm:

- mở route bằng trình duyệt local;
- kiểm tra text, link, form render, overflow ngang và trạng thái login/quyền;
- dùng truy vấn SELECT đọc-only để tìm public slug hoặc person id an toàn;
- ghi kết quả PASS, PARTIAL, SAFE_SKIP hoặc FAIL vào tài liệu.

Không làm:

- không submit form, không bấm nút tạo/sửa/xóa/lưu;
- không tạo, sửa, xóa dữ liệu;
- không đổi database, migration, seed, schema hoặc RLS;
- không đổi auth, permission, API contract, service runtime, Worker/OpenNext,
  Wrangler, deploy config hoặc dependency;
- không copy asset/logo/screenshot/code/CSS/layout từ website tham khảo;
- không lưu cookie, session, token, screenshot hoặc artifact chứa dữ liệu riêng.

## Route Được Smoke

Public:

- `/tree`;
- `/people/[slug]` nếu tìm được public slug thật sự đọc được qua public route.

Admin:

- `/admin`;
- `/admin/genealogy`;
- `/admin/tree/edit`;
- `/admin/people/new`;
- `/admin/people/[id]` nếu tìm được person id bằng SELECT đọc-only;
- `/admin/relationships`.

## Quy Ước Kết Quả

- `PASS`: route mở được đúng màn, trạng thái phù hợp, không overflow ngang ở
  desktop/mobile và không có lỗi chặn smoke.
- `PARTIAL`: route render được một phần hoặc đủ để kiểm tra UI đọc-only, nhưng
  thiếu session owner/admin thật, thiếu quyền xác thực hoặc còn vấn đề cần rà lại.
- `SAFE_SKIP`: không đủ điều kiện an toàn để smoke sâu hơn, ví dụ thiếu session,
  không có public slug đọc được hoặc không có dữ liệu phù hợp.
- `FAIL`: route hoặc UI có lỗi rõ ràng cần sửa trong một phase khác.

## Điều Kiện Chạy

- Base URL local: `http://localhost:3100`.
- Server local được bật từ checkout `D:\CODE\GIA PHẢ`.
- Trình duyệt smoke: in-app Browser, thao tác đọc-only.
- Viewport desktop mặc định và mobile `390x844`.
- SELECT đọc-only:
  - Có tìm thấy một person id để mở `/admin/people/[id]`.
  - Public/anon lookup không tìm thấy public profile thật sự đọc được; route
    public profile vì vậy không được nâng thành PASS.

## Kết Quả Smoke Thực Tế

Text smoke chính đã thấy trong browser: `Gia phả`, `Phả đồ`, `Thêm thành viên`,
`Quan hệ gia đình`, `Đăng nhập quản trị gia phả`.

Public route group result: `PARTIAL`.

| Route | Kết quả | Ghi chú |
| --- | --- | --- |
| `/tree` | `PASS` | Mở được public phả đồ, hiển thị trạng thái công khai chỉ đọc và empty state tiếng Việt. Desktop/mobile không overflow ngang. CTA `Quản trị gia phả` trỏ về `/auth/login`, `Quay về trang chủ` trỏ về `/`. |
| `/people/[slug]` | `SAFE_SKIP_NO_PUBLICLY_VISIBLE_PROFILE` | SELECT server-side tìm thấy một slug, nhưng public/anon lookup không đọc được hồ sơ và trình duyệt nhận 404. Không coi đây là FAIL của route vì chưa có slug public thật sự an toàn để smoke. |

Admin route group result: `PARTIAL`.

| Route | Kết quả | Ghi chú |
| --- | --- | --- |
| `/admin` | `SAFE_SKIP_AUTH_REQUIRED` | Redirect sang `/auth/login?reason=auth_session_missing!`, login UI tiếng Việt render được. Không có session admin/owner để smoke sâu hơn. Desktop/mobile không overflow ngang. |
| `/admin/genealogy` | `PARTIAL_UNAUTHENTICATED_READONLY_RENDER` | Render admin shell và danh sách gia phả với trạng thái `Người dùng: Không rõ`, `Vai trò: Chưa có vai trò`, `Số quyền: 0`. Không submit form. Desktop/mobile không overflow ngang. |
| `/admin/tree/edit` | `PARTIAL_UNAUTHENTICATED_READONLY_RENDER` | Render shell và màn `Công cụ chỉnh sửa phả đồ`, có permission/auth context chưa xác thực. Không bấm lưu/thêm quan hệ. Desktop/mobile không overflow ngang. |
| `/admin/people/new` | `PARTIAL_UNAUTHENTICATED_FORM_RENDER` | Form thêm thành viên render để kiểm tra bố cục đọc-only, nhưng không có session owner/admin. Không nhập và không submit. Desktop/mobile không overflow ngang. |
| `/admin/people/[id]` | `PARTIAL_UNAUTHENTICATED_DETAIL_RENDER` | Mở bằng person id từ SELECT đọc-only; màn chi tiết render trong admin shell nhưng không xác thực owner/admin. Không submit form. Desktop/mobile không overflow ngang. |
| `/admin/relationships` | `PARTIAL_UNAUTHENTICATED_FORM_RENDER` | Màn quan hệ gia đình render để kiểm tra bố cục đọc-only, nhưng không có session owner/admin. Không nhập và không submit. Desktop/mobile không overflow ngang. |

Failure bucket result: `FAIL_NONE_RECORDED`.

Không có route nào được gán `FAIL` trong smoke này. Hai vấn đề cần ghi nhận là
điều kiện smoke chưa đủ để PASS toàn phần:

- Không có session owner/admin hợp lệ trong browser; `/admin` redirect login.
- Một số route admin vẫn render shell với `Người dùng: Không rõ`, `Vai trò:
  Chưa có vai trò`, `Số quyền: 0`; cần phase riêng để rà lại guard nếu chủ dự án
  muốn kiểm chứng permission behavior sâu hơn.
- Public profile không có slug public thật sự đọc được qua public/anon lookup;
  `/people/[slug]` được safe-skip thay vì submit hay sửa dữ liệu.

## Safety Checks

- Không có migration/schema/seed/RLS/auth/permission/API/service/runtime change.
- Không có dependency mới.
- Không có artifact browser, screenshot, cookie, token hoặc session được lưu.
- Không submit form và không gọi mutation.
- Các checker A-15A2, A-15A3, A-15A4, A-15A5 và A-15A6 vẫn phải chạy lại.

## Validation Plan

- `npm run check:env:safe`
- `npm run check:a15a2:modern-vietnamese-genealogy-tree-editor-ui`
- `npm run check:a15a3:vietnamese-heritage-public-tree-view-ui`
- `npm run check:a15a4:vietnamese-heritage-family-list-admin-dashboard-ui`
- `npm run check:a15a5:member-profile-person-detail-vietnamese-heritage-ui`
- `npm run check:a15a6:add-edit-member-form-vietnamese-heritage-ux`
- `npm run check:a15b:authenticated-heritage-ui-browser-smoke`
- `npm run typecheck`
- `npm run lint`
- `npm run build`
- `git diff --check`
