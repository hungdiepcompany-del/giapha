# AGENTS.md - Quy tắc cho AI coding

## Vai trò

- ChatGPT 5.5: kiến trúc sư, PM, reviewer, người viết prompt.
- Codex: lập trình viên triển khai code.

## Quy tắc đọc tài liệu

Trước khi làm task nhỏ:

- README.md
- AGENTS.md
- docs/00_INDEX.md
- Phần mới nhất của docs/99_NEXT_AI_HANDOFF.md
- File docs liên quan task

Không đọc toàn bộ docs nếu task nhỏ.

Nếu task liên quan database:

- docs/03_DATABASE_MODEL.md

Nếu task liên quan quyền/riêng tư:

- docs/04_PERMISSION_PRIVACY_MODEL.md

Nếu task liên quan cây gia phả:

- docs/05_TREE_UI_MODEL.md

Nếu task liên quan export/backup:

- docs/06_EXPORT_BACKUP_MODEL.md

Nếu task liên quan kiến trúc:

- docs/02_ARCHITECTURE.md
- docs/09_DECISION_LOG.md


## Quy tắc đọc Runtime Worker và Service Boundary

Không bắt AI đọc toàn bộ guardrail kiến trúc trong mọi task.

Luôn đọc `docs/RUNTIME_WORKER_GUARDRAIL.md` khi task chạm tới:

- Cloudflare Worker.
- OpenNext.
- Wrangler.
- Runtime code.
- Deploy/deployment config.
- Dependency/package changes.
- Bundle size/startup size.
- Service boundary decisions.

Đọc thêm `docs/SERVICE_BOUNDARY_ROADMAP.md` khi task chạm tới:

- Export.
- Import.
- Media/document attachment.
- Backup/restore.
- GEDCOM/ZIP generation.
- Large validation.
- Data quality scan.
- New service Worker planning.

Với phase thuần docs/domain không chạm runtime, migration, deploy, dependency, export/import/media/backup thì 2 file này là optional trừ khi prompt yêu cầu.

## Điều cấm

- Không làm mock che lỗi.
- Không tự ý đổi stack.
- Không bỏ RLS.
- Không đưa service role key ra client.
- Không hardcode secret.
- Không xóa cứng dữ liệu gia phả.
- Không trộn dữ liệu gia phả với dữ liệu layout cây.
- Không bỏ JSON/GEDCOM/ZIP export.
- Không sửa ngoài scope phase được giao.
- Không làm main Cloudflare/OpenNext Worker phình to bằng tác vụ nặng.
- Không đưa ZIP/export lớn/import lớn/media/backup/GEDCOM lớn vào main Worker nếu chưa có boundary/approval.
- Không commit/push nếu chưa được yêu cầu.

## Sau khi làm xong

Phải báo cáo:

- File đã sửa.
- Migration đã tạo nếu có.
- Package đã thêm nếu có.
- Lệnh kiểm thử đã chạy.
- Kết quả PASS/FAIL.
- Lỗi còn lại.
- Việc tiếp theo đề xuất.

Phải cập nhật:

- docs/08_AI_WORK_LOG.md
- docs/99_NEXT_AI_HANDOFF.md

Nếu có quyết định kiến trúc mới:

- docs/09_DECISION_LOG.md

