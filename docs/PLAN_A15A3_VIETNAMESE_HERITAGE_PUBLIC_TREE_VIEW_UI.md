# A-15A3 - Vietnamese Heritage Public Tree View UI

Status: `UI_POLISH_COMPLETED_LOCAL`

Marker: `A15A3_VIETNAMESE_HERITAGE_PUBLIC_TREE_VIEW_UI`

## Mục Tiêu Thiết Kế

A-15A3 làm mới màn public xem cây gia phả theo hướng không gian gia tộc số:
trang trọng, ấm, dễ đọc cho người lớn tuổi, có cảm giác truyền thống Việt Nam
với nền giấy cổ, sắc stone/amber/cream/brown, đỏ nâu trầm và xanh ngọc trầm.
Phả đồ là trung tâm của màn hình, không biến trang xem cây thành landing page
marketing hoặc dashboard SaaS lạnh.

## Phạm Vi UI-Only

Được chỉnh:

- `/tree` qua `components/public/public-tree-shell.tsx`;
- public shell/header qua `components/layout/public-shell.tsx`;
- viewer readonly qua `components/tree/family-tree-viewer.tsx`;
- toolbar xem cây qua `components/tree/family-tree-toolbar.tsx`;
- empty/error state dùng cho public tree qua `components/tree/family-tree-empty-state.tsx`
  và `components/tree/family-tree-error-state.tsx`.

Không đụng:

- database, migration, seed, schema hoặc RLS;
- auth, permission, public/private filtering hoặc API contract;
- service runtime, Worker/OpenNext/Wrangler, deploy config hoặc route mới;
- thuật toán React Flow/ELK layout, relationship model, graph builder;
- admin tree editor logic hoặc mutation path;
- dependency/package mới;
- asset, logo, screenshot, CSS hoặc layout y nguyên từ website tham khảo.

## Public Tree Khác Admin Editor

Public tree là chế độ chỉ đọc, dùng dữ liệu đã được lọc riêng tư trước khi vào
client component. Người xem chỉ tìm kiếm, kéo, phóng to, thu nhỏ, căn giữa và mở
hồ sơ công khai nếu có. Admin editor là công cụ thao tác nội bộ, có side panel,
lưu bố cục và form thêm quan hệ; A-15A3 không mở rộng các hành động đó.

## Nguyên Tắc Không Copy Website Tham Khảo

Phase này chỉ lấy cảm hứng ở mức cảm giác thị giác: giấy cổ, banner dòng họ,
màu ấm và nhịp thông tin trang trọng. Không copy code, asset, logo, screenshot,
CSS, hình ảnh hoặc bố cục y nguyên từ bất kỳ website nào.
Nguyên tắc kiểm tra dùng cụm rõ ràng: không copy code, asset, logo từ website
tham khảo.

## File / Component Dự Kiến Chỉnh

- `components/layout/public-shell.tsx`;
- `components/public/public-tree-shell.tsx`;
- `components/tree/family-tree-viewer.tsx`;
- `components/tree/family-tree-toolbar.tsx`;
- `components/tree/family-tree-empty-state.tsx`;
- `components/tree/family-tree-error-state.tsx`;
- docs/checker/package metadata của phase.

## Kiểm Tra An Toàn

Checker A-15A3 xác nhận:

- doc phase tồn tại và có marker `A15A3_VIETNAMESE_HERITAGE_PUBLIC_TREE_VIEW_UI`;
- work log và handoff có marker A-15A3;
- `package.json` có script `check:a15a3:vietnamese-heritage-public-tree-view-ui`;
- không đổi migration/schema/seed, không mở service/runtime boundary;
- không thêm dependency;
- UI có copy tiếng Việt chính: `Phả đồ`, `Gia phả`, `Đang tải phả đồ`,
  `Gia phả này chưa có thành viên`;
- không tham chiếu asset/logo external từ website mẫu;
- marker/checker A-15A2 vẫn còn.

## Validation Plan

- `npm run check:env:safe`
- `npm run check:a15a2:modern-vietnamese-genealogy-tree-editor-ui`
- `npm run check:a15a3:vietnamese-heritage-public-tree-view-ui`
- `npm run typecheck`
- `npm run lint`
- `npm run build`
- `git diff --check`
