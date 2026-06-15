# Tree UI model

## Công nghệ

- React Flow để hiển thị/chỉnh sửa cây.
- Phase 5 chọn package `@xyflow/react`.
- ELK.js để auto layout.
- Phase 5 chọn package `elkjs`.
- Custom node card.
- Custom edge.

## Nguyên tắc

- Dữ liệu gia phả tách khỏi dữ liệu layout.
- Quan hệ cha/mẹ/con/vợ/chồng là dữ liệu thật.
- Vị trí node/màu/trạng thái thu gọn là dữ liệu UI.
- Layout có thể reset hoặc tạo lại từ dữ liệu quan hệ.
- Không sửa quan hệ thật bằng cách chỉ sửa edge UI nếu không có hành động lưu quan hệ rõ ràng.

## Node card

Mỗi node nên có:

- ảnh đại diện
- họ tên
- năm sinh - năm mất nếu được phép hiện
- đời thứ
- chi/nhánh
- badge còn sống/đã mất nếu cần

## Side panel

Khi click node:

- thông tin cơ bản
- cha/mẹ
- vợ/chồng
- con
- ảnh/tài liệu
- nút sửa
- nút thêm cha
- nút thêm mẹ
- nút thêm vợ/chồng
- nút thêm con
- nút xem hồ sơ

## Toolbar

- tìm người
- fit view
- zoom in/out
- auto layout
- lưu layout
- reset layout
- lọc theo chi
- lọc theo đời
- export ảnh cây

## Mode

- Admin editor mode
- Family internal mode
- Public mode

## Phase 5 tree viewer foundation

- Route admin viewer: `/admin/tree`.
- Service: `getAdminFamilyTreeGraph()` kiểm quyền `tree.view` và query dữ liệu thật từ `people`, `families`, `family_parents`, `family_children`, `couple_relationships`.
- Graph builder: `lib/family/tree-graph-builder.ts`, không phụ thuộc React component và không gọi browser API.
- Layout helper: `lib/family/tree-layout-elk.ts`, chạy ELK hướng trên xuống dưới ở client viewer và fail mềm nếu layout lỗi.
- Viewer: `components/tree/family-tree-viewer.tsx` dùng React Flow với zoom/pan/fit view, reset layout và search/focus node theo tên.
- Node model: có `person` node và `family` node trung gian để gom cha/mẹ/con.
- Edge model: `family_unit`, `parent_child`, `couple`.
- Node card không hiển thị `notes_private`.
- Public mode chưa có route riêng, nhưng builder đã có option `admin`, `internal`, `public` để lọc visibility tối thiểu.
- Chưa làm Tree Editor.
- Chưa lưu layout thủ công.
- Chưa làm public tree.
- Chưa export ảnh cây/PDF.
