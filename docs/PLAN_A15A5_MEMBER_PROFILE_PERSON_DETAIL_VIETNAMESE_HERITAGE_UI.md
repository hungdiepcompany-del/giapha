# A-15A5 - Member Profile / Person Detail Vietnamese Heritage UI

Status: `UI_POLISH_COMPLETED_LOCAL`

Marker: `A15A5_MEMBER_PROFILE_PERSON_DETAIL_VIETNAMESE_HERITAGE_UI`

## Mục Tiêu

A-15A5 làm mới giao diện hồ sơ thành viên và màn chi tiết người trong gia phả
theo hướng ấm, trang trọng, dễ đọc cho người lớn tuổi và phù hợp chất gia phả
Việt. Hồ sơ cần giúp người xem nhanh chóng hiểu họ tên, đời/thế hệ, chi nhánh,
năm sinh/mất, trạng thái, quan hệ gia đình và phạm vi riêng tư mà không biến màn
này thành dashboard hay tree editor.

## Phạm Vi UI-Only

Được chỉnh:

- public person profile route `/people/[slug]`;
- `components/public/public-person-profile.tsx`;
- admin person detail route `/admin/people/[id]`;
- `components/people/person-form.tsx`;
- docs/checker/package metadata của phase.

Không đụng:

- database, migration, seed, schema hoặc RLS;
- auth, role, permission logic hoặc API/server action contract;
- people/relationship/genealogy service runtime;
- route mới, deploy config, Worker/OpenNext/Wrangler;
- tree canvas/editor, public home, public tree viewer hoặc admin dashboard polish;
- dependency/package mới;
- asset, logo, screenshot, CSS hoặc layout y nguyên từ website tham khảo.

## Màn Được Chỉnh

Public hồ sơ thành viên:

- có hero hồ sơ ấm màu giấy cổ và xanh ngọc/đỏ nâu trầm;
- dùng avatar chữ cái thay cho ảnh bên ngoài;
- nhóm `Thông tin cơ bản`, `Gia đình & quan hệ`, `Ghi chú`, `Quyền riêng tư`;
- dùng `Chưa cập nhật` cho dữ liệu còn trống;
- giữ liên kết quay lại phả đồ, không thêm query hay mutation mới.

Admin chi tiết thành viên:

- header `Hồ sơ thành viên` rõ ràng, có lối tắt về danh sách, phả đồ và quan hệ;
- phần form chia nhóm dễ đọc: thông tin cơ bản, ngày sinh/mất, quê quán/dòng họ,
  ghi chú và quyền riêng tư;
- side summary giúp đối chiếu nhanh họ tên, giới tính, trạng thái, ngày sinh/mất,
  đời/thế hệ và phạm vi hiển thị;
- khối `Gia đình & quan hệ` giữ nguyên form hiện có cho cha/mẹ/con và vợ/chồng;
- cảnh báo, xóa mềm và khôi phục vẫn dùng permission/action hiện có.

## Màn Không Đụng

- Public Home;
- public `/tree` viewer;
- admin `/admin` dashboard và `/admin/genealogy` list;
- admin tree viewer/editor `/admin/tree` và `/admin/tree/edit`;
- relationship mutation service, graph builder, layout algorithm, export/import,
  backup/media/runtime boundary.

## Nguyên Tắc Không Copy Website Tham Khảo

Phase này chỉ lấy cảm hứng ở mức cảm giác sản phẩm gia phả Việt hiện đại: nền
giấy cổ, nhịp thông tin trang trọng, nút rõ, card mềm và chữ dễ đọc. Không copy
code, asset, logo, screenshot, CSS, hình ảnh hoặc bố cục y nguyên từ bất kỳ
website nào.

Checker phrase: không copy code, asset, logo từ website tham khảo.

## Kiểm Tra An Toàn

Checker A-15A5 xác nhận:

- doc phase tồn tại và có marker `A15A5_MEMBER_PROFILE_PERSON_DETAIL_VIETNAMESE_HERITAGE_UI`;
- work log và handoff có marker A-15A5;
- `package.json` có script
  `check:a15a5:member-profile-person-detail-vietnamese-heritage-ui`;
- không thay đổi migration/schema/seed, không mở runtime/service boundary;
- không thêm dependency;
- text chính có tiếng Việt có dấu: `Hồ sơ thành viên`, `Thông tin cơ bản`,
  `Gia đình & quan hệ`, `Chưa cập nhật`, `Không tìm thấy thành viên`,
  `Đang tải hồ sơ thành viên`;
- không tham chiếu asset/logo external từ website mẫu;
- marker/checker A-15A2, A-15A3 và A-15A4 vẫn còn.

## Validation Plan

- `npm run check:env:safe`
- `npm run check:a15a2:modern-vietnamese-genealogy-tree-editor-ui`
- `npm run check:a15a3:vietnamese-heritage-public-tree-view-ui`
- `npm run check:a15a4:vietnamese-heritage-family-list-admin-dashboard-ui`
- `npm run check:a15a5:member-profile-person-detail-vietnamese-heritage-ui`
- `npm run typecheck`
- `npm run lint`
- `npm run build`
- `git diff --check`
