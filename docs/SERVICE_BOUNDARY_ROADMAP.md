# Service Boundary Roadmap

## Purpose

File này là bản đồ chia service/Worker cho các phase nghiệp vụ gia phả Việt Nam, nhằm tránh dồn xử lý nặng vào main Cloudflare/OpenNext Worker.

Roadmap này là định hướng kiến trúc. Không có nghĩa là được tạo/deploy Worker thật ngay. Mỗi service thật cần owner approval, route contract, env/secret contract, smoke plan và deploy/rollback plan riêng.

## Current baseline

### Main app Worker: `web-gia-pha`

Vai trò chính:

- Public site.
- Admin app.
- Supabase Auth callback.
- Permission/privacy guards.
- People CRUD nhẹ.
- Relationship CRUD nhẹ.
- Tree viewer/editor nhẹ.
- Export/import UI coordination nhẹ.
- Gọi service phụ qua adapter khi phase được duyệt.

Không nên gánh lâu dài:

- ZIP/GEDCOM/export lớn.
- Import validation lớn.
- Media processing.
- Backup/restore production lớn.
- Data quality scan toàn bộ cây lớn.

### Existing / prior service candidate: `backup-service`

Trách nhiệm:

- Backup dry-run.
- Fixture verification.
- Future backup/restore service boundary.
- Future scheduled/manual backup sau owner approval.

Trạng thái mặc định:

- Không tự deploy nếu chưa có approval.
- Không production backup thật nếu chưa có storage target, secret, smoke và rollback.

## Future service candidates

### `genealogy-export-service`

Ứng viên cho:

- JSON export lớn.
- GEDCOM export lớn.
- ZIP backup lớn.
- Media manifest.
- Checksums.
- Export package assembly.

Không tạo service thật cho đến khi:

- Phase 127A export boundary design hoàn tất.
- Đã có route contract.
- Đã có env/secret contract nếu cần.
- Đã có smoke plan safe-skip.
- Đã có owner approval cho implementation/deploy.

### `genealogy-import-service`

Ứng viên cho:

- Import preview file lớn.
- JSON schema validation lớn.
- Conflict detection.
- Relationship cycle scan trước import.
- Dry-run import report.

Không được ghi DB thật trong bước preview. Import confirm thật cần phase riêng có transaction, backup, rollback, revision/import log và owner approval.

### `genealogy-media-service`

Ứng viên cho:

- Ảnh đại diện.
- Ảnh mộ phần.
- Ảnh gia đình.
- Tài liệu scan.
- Metadata extraction.
- Thumbnail/resize/compress nếu cần.
- Media backup manifest.

Không đưa xử lý ảnh nặng vào main Worker. UI main app chỉ nên upload/coordinate nhẹ hoặc gọi storage/service boundary đã duyệt.

### `genealogy-quality-service`

Ứng viên Later cho:

- Scan vòng lặp quan hệ toàn bộ cây lớn.
- Duplicate people candidate scan.
- Invalid birth/death order scan.
- Parent/child age plausibility scan.
- Missing branch/generation scan.
- Public privacy leak scan.

Phase đầu có thể dùng checker/static/local scan nhỏ. Khi dữ liệu lớn, cân nhắc service riêng hoặc offline/operator tooling.

## Phase checkpoints

### Phase 102B — Runtime Worker Guardrail and Service Boundary Roadmap

Mục tiêu:

- Tạo guardrail cố định.
- Tạo service-boundary roadmap.
- Cập nhật AGENTS/INDEX/ARCHITECTURE/PHASE_PLAN/HANDOFF.
- Chưa tạo Worker thật.
- Chưa deploy.
- Chưa thêm package.
- Chưa sửa runtime code.

### Phase 118A — Media Domain and Storage Boundary Design

Trước Phase 118B Media UI phải chốt:

- Media metadata thuộc bảng nào.
- File lưu ở Supabase Storage, R2, service riêng hay provider khác.
- Public/private media rule.
- Thumbnail/resize có cần service riêng không.
- Export/backup media manifest đi theo đường nào.

### Phase 127A — Export Service Boundary Design

Trước Phase 127B Export implementation phải chốt:

- Export nhỏ có thể chạy trong main app hay phải chuyển service.
- JSON/GEDCOM/ZIP lớn xử lý ở đâu.
- Media manifest và checksum ở đâu.
- Timeout/memory risk.
- Smoke/safe-skip plan.

### Phase 128A — Import Service Boundary Design

Trước Phase 128B Import implementation phải chốt:

- Preview không ghi DB.
- Large validation chạy ở main app, service riêng hay offline tooling.
- Conflict detection strategy.
- Transaction/rollback/revision/import log cho confirm thật.
- No-go khi thiếu backup/snapshot.

### Phase 129A — Data Quality Checker Design

Trước Phase 129B Data Quality Test Suite phải chốt:

- Checker nào chạy static/local.
- Checker nào cần DB read-only.
- Checker nào quá nặng cần service/offline job.
- Privacy leak scan không được in dữ liệu nhạy cảm.

## Approval gate before creating a new Worker

Không tạo service Worker mới nếu thiếu bất kỳ mục nào:

- Owner approval rõ ràng.
- Service name/path.
- Responsibility boundary.
- Route contract.
- Request/response envelope.
- Auth/token/service binding strategy.
- Env/secret contract.
- Local/static check.
- Smoke plan safe-skip khi thiếu explicit URL/env.
- Deploy plan manual hoặc GitHub Actions manual-only.
- Rollback plan.
- Main app integration plan.

## Report requirements

Mọi phase liên quan export/import/media/backup/data-quality/runtime/dependency/Worker phải báo cáo:

- Main Worker touched: YES/NO
- Runtime dependency added: YES/NO
- New service Worker created: YES/NO
- OpenNext/Wrangler config changed: YES/NO
- Worker size risk: YES/NO
- Service boundary recommendation: NONE hoặc mô tả ngắn
- Explicitly not done: deploy/DB mutation/production backup/restore/push nếu không làm

## Related docs

- `docs/RUNTIME_WORKER_GUARDRAIL.md`
- `docs/02_ARCHITECTURE.md`
- `docs/15_SERVICE_BOUNDARY_WORKER_SPLIT.md`
- `docs/06_EXPORT_BACKUP_MODEL.md`
- `docs/07_PHASE_PLAN.md`
