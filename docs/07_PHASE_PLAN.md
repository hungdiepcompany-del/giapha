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

## Phase 102B - Runtime Worker Guardrail and Service Boundary Roadmap

### Mục tiêu

Chốt luật tránh main Cloudflare/OpenNext Worker phình to và đưa service-boundary roadmap vào repo trước khi tiếp tục các phase nghiệp vụ gia phả Việt Nam.

### Scope

- Tạo `docs/RUNTIME_WORKER_GUARDRAIL.md`.
- Tạo `docs/SERVICE_BOUNDARY_ROADMAP.md`.
- Cập nhật `AGENTS.md`, `docs/00_INDEX.md`, `docs/02_ARCHITECTURE.md`, `docs/07_PHASE_PLAN.md`, `docs/99_NEXT_AI_HANDOFF.md`.
- Định nghĩa khi nào phải đọc 2 file guardrail/boundary.
- Đưa các checkpoint boundary vào Phase 118, 127, 128 và 129.

### Không làm gì

- Không tạo Worker mới.
- Không deploy.
- Không sửa runtime code.
- Không sửa OpenNext/Wrangler config.
- Không thêm package.
- Không migration.
- Không apply DB.
- Không push.

### Nghiệm thu

- Có guardrail rõ ràng cho main Worker.
- Có service-boundary roadmap cho backup/export/import/media/data quality.
- AI sau này biết khi nào phải đọc guardrail docs, không cần nhắc lại trong mọi prompt.
- Các phase nặng có checkpoint design/boundary trước implementation.

### Lệnh test

```bash
npm run check:env:safe
npm run check:migrations
git diff --check
git status --short
```

## Phase 103-107 - Vietnamese Genealogy Domain Model Bundle

### Mục tiêu

Chốt nghiệp vụ gia phả Việt Nam trước khi thiết kế schema thật.

### Scope

- Phase 103: Vietnamese Genealogy Domain Model Readiness.
- Phase 104: Existing Data Model Gap Analysis.
- Phase 105: Person Profile Field Specification.
- Phase 106: Relationship Rule Specification.
- Phase 107: Branch, Generation, Clan Structure Specification.

### Không làm gì

- Không migration.
- Không apply DB.
- Không deploy.
- Không sửa runtime lớn.
- Không tạo Worker mới.

### Nghiệm thu

- Có domain docs rõ về dòng họ, chi, nhánh, đời/thế hệ.
- Có gap analysis giữa database hiện tại và nghiệp vụ cần có.
- Có field specification cho hồ sơ cá nhân Việt Nam.
- Có relationship rule specification.
- Có branch/generation/clan structure specification.

## Phase 108-110 - Schema Candidate and Approval Gate

### Mục tiêu

Thiết kế schema candidate cho nghiệp vụ gia phả Việt Nam nhưng chưa apply DB.

### Scope

- Phase 108: Vietnamese Genealogy Schema Candidate Design.
- Phase 109: Schema Candidate Static Safety Check.
- Phase 110: Real Migration File Approval Gate.

### Không làm gì

- Không apply DB.
- Không mutate production data.
- Không tạo migration thật nếu chưa được owner duyệt.
- Không đổi auth/permission/runtime nếu không cần.

### Nghiệm thu

- Schema candidate additive.
- Có static safety check.
- Có owner approval checklist trước migration thật.

## Phase 111-113 - Real Migration and Apply Execution

### Mục tiêu

Tạo và apply migration thật chỉ khi owner xác nhận riêng.

### Scope

- Phase 111: Vietnamese Genealogy Real Migration File.
- Phase 112: Domain Migration Apply Readiness.
- Phase 113: Domain Migration Apply Execution.

### Không làm gì

- Không apply DB nếu thiếu owner approval, backup/snapshot, project ref confirmation và rollback plan.
- Không deploy kèm migration nếu chưa có kế hoạch riêng.

### Nghiệm thu

- Migration additive.
- Dữ liệu cũ không mất.
- Verify field/table mới tồn tại.
- App typecheck/lint/build vẫn PASS.

## Phase 118A - Media Domain and Storage Boundary Design

### Mục tiêu

Chốt media/storage boundary trước khi làm UI upload tài liệu/ảnh.

### Scope

- Xác định metadata media.
- Xác định storage candidate.
- Xác định public/private media rule.
- Xác định thumbnail/resize có cần service riêng không.
- Xác định export/backup media manifest.

### Không làm gì

- Không upload media thật.
- Không xử lý ảnh nặng trong main Worker.
- Không thêm package xử lý ảnh nếu chưa được duyệt.
- Không tạo media service Worker thật.

## Phase 118B - Media and Document Attachment UI

### Mục tiêu

Triển khai UI gắn ảnh/tài liệu sau khi boundary đã rõ.

### Điều kiện trước

- Phase 118A PASS.
- Storage/privacy/export boundary đã rõ.
- Worker/runtime size risk đã được đánh giá.

## Phase 127A - Export Service Boundary Design

### Mục tiêu

Chốt export boundary trước khi nâng cấp JSON/GEDCOM/ZIP/media manifest.

### Scope

- Phân loại export nhỏ/lớn.
- Đánh giá timeout/memory/bundle risk.
- Chốt export chạy main Worker, service Worker, browser flow hay offline tooling.
- Smoke/safe-skip plan.

### Không làm gì

- Không thêm export dependency nặng vào main app.
- Không tạo export service Worker thật nếu chưa có approval.
- Không deploy.

## Phase 127B - Vietnamese Genealogy Export Upgrade

### Mục tiêu

Nâng export sau khi boundary đã rõ.

### Điều kiện trước

- Phase 127A PASS.
- Main Worker risk được đánh giá.
- Nếu cần service riêng, phải có owner approval và contract riêng.

## Phase 128A - Import Service Boundary Design

### Mục tiêu

Chốt import preview/conflict boundary trước khi nâng cấp import.

### Scope

- Preview không ghi DB.
- Large validation strategy.
- Conflict detection strategy.
- Transaction/rollback/revision/import log plan cho confirm thật.

### Không làm gì

- Không import ghi DB.
- Không ghi đè dữ liệu.
- Không đưa large import validation vào main Worker nếu rủi ro lớn.

## Phase 128B - Import Upgrade and Conflict Preview

### Mục tiêu

Nâng import preview/conflict sau khi boundary đã rõ.

### Điều kiện trước

- Phase 128A PASS.
- Backup/snapshot/no-go rule rõ nếu có confirm thật ở phase sau.

## Phase 129A - Data Quality Checker Design

### Mục tiêu

Chốt data-quality checker boundary trước khi làm test suite lớn.

### Scope

- Relationship cycle scan.
- Invalid birth/death order scan.
- Duplicate people candidate scan.
- Missing branch/generation scan.
- Public privacy leak scan.
- Phân loại static/local, DB read-only, service riêng hoặc offline tooling.

### Không làm gì

- Không quét dữ liệu production nếu thiếu explicit read-only env.
- Không in dữ liệu nhạy cảm.
- Không tạo service Worker thật.

## Phase 129B - Genealogy Data Quality Test Suite

### Mục tiêu

Triển khai data quality test suite sau khi boundary đã rõ.

### Điều kiện trước

- Phase 129A PASS.
- Read-only/privacy/logging rule rõ.
- Worker/runtime risk đã được đánh giá.
