# A-15A4 - Vietnamese Heritage Family List / Admin Dashboard UI

Status: `UI_POLISH_COMPLETED_LOCAL`

Marker: `A15A4_VIETNAMESE_HERITAGE_FAMILY_LIST_ADMIN_DASHBOARD_UI`

## Mục Tiêu Thiết Kế

A-15A4 làm mới dashboard quản trị và danh sách gia phả theo hướng trang trọng,
gọn, dễ đọc cho người lớn tuổi và có chất gia phả Việt. Card gia phả cần thể
hiện rõ tên dòng họ, mô tả, số thành viên, số thế hệ, trạng thái công khai/riêng
tư, cập nhật gần nhất và các lối tắt thao tác đã có.

## Phạm Vi UI-Only

Được chỉnh:

- `/admin` qua `app/(admin)/admin/page.tsx`;
- `/admin/genealogy` qua `app/(admin)/admin/genealogy/page.tsx`;
- admin shell/sidebar qua `components/layout/admin-shell.tsx`;
- card danh sách dòng họ/gia phả qua `components/genealogy/lineage-admin.tsx`;
- docs/checker/package metadata của phase.

Không đụng:

- database, migration, seed, schema, RLS;
- auth, role, permission logic hoặc API contract;
- logic tạo/sửa/xóa gia phả/dòng họ;
- service runtime, Worker/OpenNext/Wrangler, deploy config hoặc route mới;
- tree canvas/editor, graph builder hoặc React Flow/ELK layout;
- dependency/package mới;
- asset, logo, screenshot, CSS hoặc layout y nguyên từ website tham khảo.

## Màn / Component Không Đụng

- Public tree `/tree` và tree editor `/admin/tree/edit`;
- export/import runtime;
- backup/operator runtime;
- relationship mutation logic;
- permission registration hoặc migration.

## Nguyên Tắc Không Copy Website Tham Khảo

Phase này chỉ lấy cảm hứng ở mức nhịp thông tin: card gia phả, banner ấm,
sidebar gọn và CTA rõ. Không copy code, asset, logo, screenshot, CSS, hình ảnh
hoặc bố cục y nguyên từ bất kỳ website tham khảo nào.

## Checklist An Toàn

- Có marker `A15A4_VIETNAMESE_HERITAGE_FAMILY_LIST_ADMIN_DASHBOARD_UI` trong
  UI, work log và handoff.
- `package.json` có script
  `check:a15a4:vietnamese-heritage-family-list-admin-dashboard-ui`.
- Không thay đổi migration/schema/seed, không mở service/runtime boundary.
- Không thêm dependency.
- Text chính có tiếng Việt có dấu: `Quản trị gia phả`, `Dòng họ của tôi`,
  `Chưa có gia phả nào`, `Đang tải danh sách gia phả`, `Tạo gia phả đầu tiên`.
- Checker A-15A2 và A-15A3 vẫn còn marker/script.

## Smoke Test Dự Kiến

- Mở `/admin` nếu phiên hiện tại có quyền; kiểm tra desktop/mobile không tràn
  ngang và thấy dashboard heritage.
- Mở `/admin/genealogy`; nếu thiếu quyền thì ghi rõ shell/error state đã xác
  nhận, không tạo dữ liệu thật.
- Không đăng nhập hoặc tạo dữ liệu mới chỉ để smoke.

## Validation Plan

- `npm run check:env:safe`
- `npm run check:a15a2:modern-vietnamese-genealogy-tree-editor-ui`
- `npm run check:a15a3:vietnamese-heritage-public-tree-view-ui`
- `npm run check:a15a4:vietnamese-heritage-family-list-admin-dashboard-ui`
- `npm run typecheck`
- `npm run lint`
- `npm run build`
- `git diff --check`
