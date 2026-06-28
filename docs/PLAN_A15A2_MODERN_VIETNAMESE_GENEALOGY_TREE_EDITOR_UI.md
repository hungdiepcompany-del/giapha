# A-15A2 - Modern Vietnamese Genealogy Tree Editor UI

Status: `UI_POLISH_COMPLETED_LOCAL`

Marker: `A15A2_MODERN_VIETNAMESE_TREE_EDITOR_UI`

## Mục tiêu

Làm mới màn xem/chỉnh sửa cây gia phả theo hướng công cụ thao tác chuyên
nghiệp, hiện đại, gọn và dễ dùng cho người lớn tuổi. Cảm hứng sản phẩm là các
ứng dụng gia phả Việt hiện đại, nhưng không copy code, asset, logo, hình ảnh,
CSS hoặc layout y nguyên từ bất kỳ website tham khảo nào.

## Phạm vi UI-only

Được chỉnh:

- `/admin/tree`;
- `/admin/tree/edit`;
- `components/tree/family-tree-editor.tsx`;
- `components/tree/tree-editor-toolbar.tsx`;
- `components/tree/tree-editor-side-panel.tsx`;
- `components/tree/family-node-card.tsx`;
- `components/tree/family-tree-empty-state.tsx`;
- `components/tree/family-tree-error-state.tsx`.

Không đụng:

- public home/public shell visual direction;
- database, migration, seed, schema;
- RLS, auth, permission logic;
- API contract, server action contract, service runtime;
- React Flow/ELK layout algorithm;
- dependency/package mới;
- deploy/push.

## UI Result

- Canvas cây trong editor chiếm phần lớn màn hình hơn, nền sáng kiểu công cụ,
  ít khối phụ.
- Toolbar được gom gọn thành nhóm hành động `Căn giữa`, `Phóng to`, `Thu nhỏ`,
  `Sắp xếp lại`, `Lưu bố cục`, `Khôi phục tự động`.
- Node người nhỏ hơn, có placeholder chữ cái đầu, họ tên, đời/thế hệ, năm
  sinh/mất và trạng thái. Người đang chọn dùng viền/ring rõ; thẻ gia đình/người
  liên quan dùng màu xanh nhạt riêng.
- Side panel được trình bày như drawer/panel thao tác, chia rõ:
  `Thông tin cơ bản`, `Quan hệ gia đình`, `Ghi chú`, `Quyền riêng tư`,
  `Thêm người thân`.
- Hành động thêm quan hệ dùng nhãn rõ: `Thêm cha`, `Thêm mẹ`,
  `Thêm vợ/chồng`, `Thêm con`.
- Link hồ sơ ghi rõ `Sửa / xóa mềm hồ sơ`; không tạo action xóa mới trong cây.
- Empty state hướng về `Thêm người đầu tiên` và `Thêm quan hệ gia đình`.
- Mobile giữ canvas kéo/zoom được, panel nằm dưới canvas như drawer cuộn được;
  không ép toàn bộ cây vào màn nhỏ.

## Kiểm Tra An Toàn

Checker A-15A2 tree editor phải xác nhận:

- doc phase tồn tại;
- marker `A15A2_MODERN_VIETNAMESE_TREE_EDITOR_UI` xuất hiện trong doc, work log,
  handoff và UI;
- không đổi migration/schema;
- không mở service/runtime boundary;
- không tham chiếu asset/logo external từ website mẫu;
- có copy tiếng Việt chính cho cây gia phả, chỉnh sửa và thêm người thân.

## Validation Plan

- `npm run check:env:safe`
- `npm run check:a15a2:modern-vietnamese-genealogy-tree-editor-ui`
- `npm run typecheck`
- `npm run lint`
- `npm run build`
- `git diff --check`
