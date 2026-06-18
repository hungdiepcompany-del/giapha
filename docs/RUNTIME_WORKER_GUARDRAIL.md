# Runtime Worker Guardrail

## Purpose

Dự án GIA PHẢ phải tránh làm main Cloudflare/OpenNext Worker phình to, chậm khởi động hoặc gánh các tác vụ xử lý nặng.

Main app Worker chỉ nên phụ trách web UI, auth, CRUD nhẹ, API coordination nhẹ và logic nghiệp vụ Supabase cần thiết. Các tác vụ nặng phải được đánh giá service boundary trước khi triển khai.

## Main Worker responsibilities

Main app Worker được phép giữ:

- Public site, public tree và public person page đã lọc privacy.
- Admin app, auth callback và permission guard.
- People CRUD nhẹ.
- Relationship CRUD nhẹ.
- Tree viewer/editor nhẹ và layout persistence.
- Server-side privacy filtering và API coordination nhẹ.
- Gọi service phụ qua adapter/service binding/internal URL khi phase được duyệt.

## Heavy workload candidates

Không đưa các nhóm sau vào main Worker nếu chưa có approval riêng:

- ZIP backup/export lớn.
- GEDCOM export lớn.
- Import preview/validate file lớn.
- Conflict detection lớn.
- Media processing, thumbnail, resize, compress, metadata extraction.
- Backup/restore production lớn.
- Scheduled backup job.
- Data quality scan toàn bộ cây lớn.
- PDF/image tree export lớn.

## Hard rules

- Không thêm dependency runtime nặng vào main app nếu chưa có owner approval.
- Không import thư viện nặng vào route/component/service của main app như một side effect của phase docs/domain/schema.
- Không chuyển ZIP/import/export/media/backup/GEDCOM/data-quality scan lớn vào main Worker.
- Không sửa OpenNext, Wrangler, Cloudflare deploy config nếu phase hiện tại không cho phép.
- Không tạo service Worker mới nếu chưa có boundary doc, route contract, env/secret contract, smoke plan, rollback/deploy plan và owner approval.
- Không refactor runtime architecture như tác dụng phụ của phase tài liệu, domain hoặc schema candidate.
- Không hardcode service URL, token, key hoặc secret.
- Không đọc `.env.local` hoặc `.dev.vars` nếu task không yêu cầu và không có rule an toàn rõ ràng.
- Nếu nghi ngờ task làm tăng Worker size, ghi vào Recommendation / Later thay vì tự triển khai.

## Required review questions

Trước task liên quan runtime/export/import/media/backup/dependency/Worker, AI phải trả lời ngắn trong báo cáo cuối:

- Main Worker touched: YES/NO
- Runtime dependency added: YES/NO
- New service Worker created: YES/NO
- OpenNext/Wrangler config changed: YES/NO
- Worker size risk: YES/NO
- Service boundary recommendation: NONE hoặc mô tả ngắn

## Dependency policy

- Ưu tiên dùng code sẵn có hoặc service boundary thay vì thêm package runtime.
- Nếu cần package mới, phải ghi rõ:
  - Package dùng ở server/client/service nào.
  - Có ảnh hưởng main Worker bundle không.
  - Có thể tách sang dedicated service Worker không.
  - Có alternative nhẹ hơn không.
- Không thêm package chỉ để phục vụ tài liệu/checker nếu có thể dùng Node built-in.

## Default decision

Nếu chưa chắc workload thuộc main app hay service riêng, mặc định không sửa runtime. Ghi phân tích vào docs hoặc Recommendation / Later, chờ phase boundary/approval riêng.

## Related docs

- `docs/SERVICE_BOUNDARY_ROADMAP.md`
- `docs/02_ARCHITECTURE.md`
- `docs/15_SERVICE_BOUNDARY_WORKER_SPLIT.md`
- `docs/06_EXPORT_BACKUP_MODEL.md`
