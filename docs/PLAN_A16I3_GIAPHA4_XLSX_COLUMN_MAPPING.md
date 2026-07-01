# PLAN A-16I3 - Gia Phả 4 XLSX Column Mapping

Marker: `A-16I3`

## Mục tiêu

A-16I3 làm cứng parser `.xlsx` Gia Phả 4 để đọc đúng sheet `Thành viên`, nhận diện các cột thực tế của file Gia Phả 4 và tạo manifest staging dễ rà soát hơn trước khi có bất kỳ phase nhập chính thức nào.

## Phạm vi an toàn

- Chỉ xử lý `.xlsx`; `.xls` vẫn không hỗ trợ nếu không có dependency parser riêng được phê duyệt.
- Không tạo migration, không chạy `supabase db push`, không chạy SQL apply.
- Không seed, không import Excel vào bảng thật, không deploy, không push.
- Không ghi `people/person` thật, không ghi `relationships/families/couple_relationships/family_parents/family_children` thật.
- Không ghi layout cây, tree state hoặc revision.
- Không mở đường `confirm`, `import-now`, `finalize`, hoặc nhập chính thức.
- Không commit file Excel thật, storage state, cookie, token, screenshot chứa dữ liệu thật hoặc secret.

## Mapping được chỉnh

Parser ưu tiên sheet `Thành viên` và cột bắt buộc:

- `Mã GP`
- `Họ tên`

Các cột Gia Phả 4 được nhận diện:

- `Đời thứ`, `Tên khác`, `Giới tính`, `Ngày Sinh`, `Hôn nhân`
- `Số điện thoại`, `Học vấn`, `Nghề nghiệp`
- `Tỉnh/Thành Phố`, `Quận/Huyện`, `Phường/Xã`, `Địa chỉ hiện tại`
- `Tiểu sử`, `Ngày mất (Dương lịch)`, `Ngày giỗ (Âm lịch)`, `Hưởng Thọ/Dương (Tuổi)`
- `Thờ cúng tại`, `Người phụ trách`, `Mộ táng`
- `Tên Bố`, `Mã GP Bố`, `Tên Mẹ`, `Mã GP Mẹ`

## Quy tắc dữ liệu

- `Mã GP` trở thành `externalId` trong staging.
- `Tên khác`, ngày giỗ âm lịch và tuổi thọ được giữ trong candidate staging để owner rà soát.
- Các giá trị placeholder `0`, `5`, `0/0/0`, ô trống và biến thể rỗng được xem là chưa có dữ liệu.
- Ngày tháng chấp nhận ngày Excel serial, năm, `/YYYY`, `YYYY-MM-DD`, và `DD/MM/YYYY`; dữ liệu không chắc định dạng được để trống và tạo warning tiếng Việt.
- Quan hệ cha/mẹ chỉ tạo từ `Mã GP Bố` và `Mã GP Mẹ`.
- `Hôn nhân` chỉ lưu vào metadata staging, không tạo quan hệ vợ/chồng trong phase này.
- Nếu `Mã GP Bố/Mẹ` không tồn tại trong sheet, quan hệ được đánh dấu `missing_reference` để owner rà soát, không tự ghi vào cây thật.

## Kết quả mong đợi

- Manifest staging có `parseSummary` gồm số dòng đọc được, số người map được, số quan hệ cha/mẹ map được, số quan hệ bị bỏ qua, số warning và số lỗi.
- UI upload hiển thị tóm tắt nhận diện sheet `Thành viên`, `Mã GP`, `Mã GP Bố/Mẹ`.
- `A16I3_STATUS=XLSX_COLUMN_MAPPING_READY_STAGING_ONLY`

## Kiểm tra

- `npm run check:a16i3-giapha4-xlsx-column-mapping`
- Các checker A-16 hiện có vẫn phải PASS.
- `npm run typecheck`, `npm run lint`, `npm run build`, `git diff --check`.
