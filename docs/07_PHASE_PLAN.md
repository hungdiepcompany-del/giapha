# Phase plan

## Phase 1 - Project foundation

### Mục tiêu

Tạo nền kỹ thuật đầu tiên để dự án có thể phát triển đúng stack và đúng nguyên tắc bảo vệ dữ liệu.

### Scope

- Next.js
- Supabase helper
- Auth cơ bản
- Roles/permissions nền
- Docs nền
- Script check schema

### Không làm gì

- Chưa làm People CRUD đầy đủ.
- Chưa làm cây gia phả.
- Chưa làm import/export thật nếu chưa có schema nền.
- Chưa polish UI nâng cao.

### Nghiệm thu

- App khởi động local được.
- Kết nối Supabase đúng boundary server/client.
- Có migration nền nếu phase được phép tạo migration.
- Có tài liệu và handoff cập nhật.

### Lệnh test

```bash
npm run typecheck
npm run lint
npm run build
```

## Phase 2 - People CRUD

### Mục tiêu

Quản lý thành viên gia phả có xóa mềm, khôi phục và tìm kiếm.

### Scope

- Thêm/sửa/xóa mềm/khôi phục thành viên.
- Danh sách thành viên.
- Hồ sơ thành viên.
- Search/filter.

### Không làm gì

- Không gán quan hệ phức tạp nếu chưa sang Phase 3.
- Không public thông tin nhạy cảm.
- Không xóa cứng dữ liệu.

### Nghiệm thu

- Tạo/sửa/xóa mềm/khôi phục thành viên đúng permission.
- Danh sách và hồ sơ lọc đúng privacy.
- Revision ghi nhận thay đổi quan trọng nếu đã có hệ thống revision.

### Lệnh test

```bash
npm run typecheck
npm run lint
npm run build
```

## Phase 3 - Relationship CRUD

### Mục tiêu

Quản lý quan hệ gia phả thật, không dựa vào `parent_id`/`spouse_id` đơn giản.

### Scope

- Cha
- Mẹ
- Vợ/chồng
- Con
- Con ruột/con nuôi/con riêng
- Kiểm tra vòng lặp sai dữ liệu

### Không làm gì

- Không trộn quan hệ thật với layout UI.
- Không lưu quan hệ chỉ trong React Flow edge.
- Không bỏ qua nguồn xác minh khi có.

### Nghiệm thu

- Gán/sửa/xóa mềm quan hệ đúng permission.
- Chặn dữ liệu vòng lặp hoặc quan hệ vô lý cơ bản.
- Cây có thể suy ra từ quan hệ đã lưu.

### Lệnh test

```bash
npm run typecheck
npm run lint
npm run build
```

## Phase 4 - Tree viewer

### Mục tiêu

Hiển thị cây gia phả tương tác cho người dùng được phép xem.

### Scope

- React Flow viewer
- ELK auto layout
- Node card
- Edge quan hệ
- Search/focus node

### Không làm gì

- Chưa cần chỉnh sửa trực tiếp trên cây.
- Không đưa dữ liệu private vào public viewer.
- Không coi layout UI là nguồn dữ liệu quan hệ.

### Nghiệm thu

- Cây hiện đúng từ dữ liệu quan hệ.
- Search/focus node hoạt động.
- Public/internal mode lọc dữ liệu đúng privacy.

### Lệnh test

```bash
npm run typecheck
npm run lint
npm run build
```

## Phase 5 - Tree editor

### Mục tiêu

Cho phép chỉnh sửa thông tin và layout trực tiếp trong trải nghiệm cây gia phả.

### Scope

- Click node sửa.
- Thêm cha/mẹ/vợ/chồng/con trên cây.
- Kéo node.
- Lưu layout.
- Reset layout.

### Không làm gì

- Không sửa quan hệ thật nếu user chỉ kéo layout.
- Không cập nhật dữ liệu khi permission không đủ.
- Không mất revision cho thay đổi quan hệ quan trọng.

### Nghiệm thu

- Chỉnh sửa node và thêm quan hệ từ cây đúng service layer.
- Layout lưu riêng với dữ liệu gia phả.
- Reset layout tạo lại được từ quan hệ thật.

### Lệnh test

```bash
npm run typecheck
npm run lint
npm run build
```

## Phase 6 - Public/private mode

### Mục tiêu

Tách rõ trang public, trang nội bộ và bộ lọc riêng tư.

### Scope

- Public page
- Internal page
- Privacy filter
- Ẩn người còn sống

### Không làm gì

- Không đưa dữ liệu private về client public.
- Không chỉ ẩn bằng CSS/UI.
- Không mở public media riêng tư.

### Nghiệm thu

- Public không thấy ngày sinh đầy đủ, địa chỉ, email, phone, ghi chú nội bộ.
- Người còn sống mặc định được bảo vệ.
- Internal view chỉ hiện theo permission.

### Lệnh test

```bash
npm run typecheck
npm run lint
npm run build
```

## Phase 7 - Revision history

### Mục tiêu

Theo dõi lịch sử thay đổi và có khả năng khôi phục.

### Scope

- Log thay đổi
- So sánh trước/sau
- Restore revision

### Không làm gì

- Không public revision có dữ liệu nhạy cảm.
- Không cho restore nếu không có quyền.
- Không ghi log sai khác với dữ liệu đã thay đổi.

### Nghiệm thu

- Mỗi thay đổi quan trọng có revision.
- Xem diff trước/sau được.
- Restore có kiểm tra permission và tạo revision mới.

### Lệnh test

```bash
npm run typecheck
npm run lint
npm run build
```

## Phase 8 - Export/backup

### Mục tiêu

Đảm bảo dữ liệu có thể xuất, lưu trữ và phục hồi ngoài Supabase.

### Scope

- JSON export/import
- GEDCOM export
- ZIP export
- Manifest/checksum

### Không làm gì

- Không bỏ qua media metadata.
- Không đổi ID nếu không cần.
- Không import ghi đè không có xác nhận.

### Nghiệm thu

- Tạo được `family.json`, `family.ged`, `media.zip`, `full-backup.zip`.
- Backup có `manifest.json` và `checksums.json`.
- Import báo lỗi rõ khi sai schema_version hoặc sai định dạng.

### Lệnh test

```bash
npm run typecheck
npm run lint
npm run build
```

## Phase 9 - UI polish

### Mục tiêu

Làm giao diện đẹp, rõ ràng, responsive và thân thiện với người dùng Việt Nam.

### Scope

- Giao diện đẹp
- Responsive
- Loading/error/empty state
- Form tiếng Việt rõ ràng

### Không làm gì

- Không đổi stack chỉ để polish UI.
- Không che lỗi backend bằng mock.
- Không phá permission/privacy boundary.

### Nghiệm thu

- UI đúng trên desktop và mobile.
- Trạng thái loading/error/empty rõ ràng.
- Copy tiếng Việt dễ hiểu.
- Không lỗi overlap nội dung cơ bản.

### Lệnh test

```bash
npm run typecheck
npm run lint
npm run build
```

