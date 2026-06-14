# Tree UI model

## Công nghệ

- React Flow để hiển thị/chỉnh sửa cây.
- ELK.js để auto layout.
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

