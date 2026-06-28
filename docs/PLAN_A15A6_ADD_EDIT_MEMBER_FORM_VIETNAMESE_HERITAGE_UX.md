# A-15A6 - Add/Edit Member Form Vietnamese Heritage UX

Status: `UI_POLISH_COMPLETED_LOCAL`

Marker: `A15A6_ADD_EDIT_MEMBER_FORM_VIETNAMESE_HERITAGE_UX`

## Mục Tiêu Thiết Kế

A-15A6 làm mới trải nghiệm thêm/sửa thành viên và thêm người thân theo hướng
`phiếu ghi thông tin gia tộc số`: ấm, trang trọng, dễ nhập cho người lớn tuổi,
chia nhóm rõ ràng và dùng tiếng Việt tự nhiên có dấu. Form cần giúp người dùng
nhập phần đã chắc chắn trước, hiểu mục nào bắt buộc, mục nào có thể bổ sung sau,
và nhận ra cảnh báo riêng tư/quan hệ trước khi lưu.

## Phạm Vi UI/UX-Only

Được chỉnh:

- `/admin/people/new`;
- form sửa thành viên đang dùng `components/people/person-form.tsx`;
- `/admin/relationships`;
- `components/relationships/relationship-form.tsx`;
- `components/relationships/couple-form.tsx`;
- phần nhập người thân trong `components/tree/tree-editor-side-panel.tsx`;
- nút submit dùng chung cho form qua `components/ui/form-submit-button.tsx`;
- docs/checker/package metadata của phase.

Không đụng:

- database, migration, seed, schema hoặc RLS;
- auth, role, permission logic hoặc API/server action contract;
- logic tạo/sửa/xóa thành viên;
- logic quan hệ gia đình;
- validation schema theo hướng đổi contract dữ liệu;
- privacy logic hoặc public/private filtering;
- tree canvas/layout algorithm, public tree, dashboard hoặc member profile;
- dependency/package mới;
- service runtime, Worker/OpenNext/Wrangler hoặc deploy config.

## Màn / Component Được Chỉnh

- Trang `Thêm thành viên` có header `Phiếu ghi thông tin gia tộc`, nút `Quay lại`
  và mô tả ngắn rằng thông tin chưa rõ có thể bổ sung sau.
- `PersonForm` có header form `Thêm thành viên` hoặc `Sửa thông tin thành viên`,
  các nhóm `Thông tin cơ bản`, `Ngày tháng & quê quán`, `Gia đình & quan hệ`,
  `Ghi chú`, `Quyền riêng tư`, help text `Thông tin bắt buộc`, `Không bắt buộc`,
  `Có thể bổ sung sau`, và pending `Đang lưu thông tin thành viên...`.
- Form quan hệ có card rõ cho tạo gia đình, thêm cha/mẹ, thêm con và thêm
  vợ/chồng, kèm cảnh báo nhẹ trước khi lưu vì thao tác có thể ảnh hưởng phả đồ.
- Form thêm người thân trong Tree Editor giữ flow cũ nhưng có hướng dẫn rõ hơn,
  help text bắt buộc và cảnh báo quyền riêng tư.

## Màn / Component Không Đụng

- Public Home;
- public `/tree` viewer;
- admin dashboard `/admin` và family list `/admin/genealogy`;
- member profile public/admin đã polish ở A-15A5 ngoài nhãn submit form;
- service/action/schema/permission/privacy/runtime.

## Nguyên Tắc Không Copy Website Tham Khảo

Phase này chỉ lấy cảm hứng ở mức cảm giác sản phẩm: nền giấy cổ, card mềm, nút
rõ, nhịp nhập liệu trang trọng và dễ đọc. Không copy code, asset, logo,
screenshot, CSS, hình ảnh hoặc bố cục y nguyên từ bất kỳ website tham khảo nào.

Checker phrase: không copy code, asset, logo từ website tham khảo.

## Không Đổi Schema/API/Logic

Các field name, hidden input, action import, submit action, permission gate và
service call hiện có được giữ nguyên. Nút submit mới chỉ đổi nhãn pending bằng
`useFormStatus`, không thay đổi dữ liệu gửi lên server.

## Checklist An Toàn

- Có marker `A15A6_ADD_EDIT_MEMBER_FORM_VIETNAMESE_HERITAGE_UX` trong doc,
  work log, handoff và UI.
- `package.json` có script
  `check:a15a6:add-edit-member-form-vietnamese-heritage-ux`.
- Không thay đổi migration/schema/seed, không mở service/runtime boundary.
- Không thêm dependency.
- Text chính có tiếng Việt có dấu: `Thêm thành viên`,
  `Sửa thông tin thành viên`, `Thông tin cơ bản`, `Gia đình & quan hệ`,
  `Quyền riêng tư`, `Đang lưu thông tin thành viên`,
  `Không thể lưu thông tin thành viên`.
- Không tham chiếu asset/logo external từ website mẫu.
- Checker/marker A-15A2, A-15A3, A-15A4 và A-15A5 vẫn còn.

## Smoke Test Dự Kiến

- Mở `/admin/people/new`; nếu thiếu quyền thì xác nhận guard state tiếng Việt và
  không tạo dữ liệu thật.
- Mở `/admin/relationships`; nếu thiếu quyền thì xác nhận guard/permission state;
  nếu có quyền thì kiểm tra form quan hệ không tràn ngang.
- Mở `/admin/people/[id]` chỉ khi có ID/session an toàn; nếu không có dữ liệu hoặc
  thiếu quyền thì ghi `SAFE_SKIP`.
- Kiểm tra mobile width không tràn ngang.

## Validation Plan

- `npm run check:env:safe`
- `npm run check:a15a2:modern-vietnamese-genealogy-tree-editor-ui`
- `npm run check:a15a3:vietnamese-heritage-public-tree-view-ui`
- `npm run check:a15a4:vietnamese-heritage-family-list-admin-dashboard-ui`
- `npm run check:a15a5:member-profile-person-detail-vietnamese-heritage-ui`
- `npm run check:a15a6:add-edit-member-form-vietnamese-heritage-ux`
- `npm run typecheck`
- `npm run lint`
- `npm run build`
- `git diff --check`
