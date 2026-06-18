Đúng hướng. Sau giai đoạn hạ tầng/production readiness, tôi đề xuất chuyển trọng tâm sang **nghiệp vụ gia phả Việt Nam**, nhưng cần bổ sung trước một lớp **Runtime Worker Guardrail + Service Boundary Roadmap** để tránh main Cloudflare/OpenNext Worker phình to khi làm các phần media/export/import/backup lớn.

## Tổng quan hướng đi đã cập nhật

```md
Phase 102B: Runtime Worker Guardrail + Service Boundary Roadmap

Phase 103–107: Chốt nghiệp vụ gia phả Việt Nam

Phase 108–113: Chuẩn bị và nâng cấp database/model

Phase 114–117: Nâng cấp UI nhập liệu cốt lõi

Phase 118A–118B: Media/domain boundary trước, Media UI sau

Phase 119A–120: Data quality design, warning system, admin dashboard

Phase 121–126: Nâng cấp cây phả hệ, trang công khai, tìm kiếm, mobile/elder UX

Phase 127A–128B: Export/import service-boundary design trước, implementation sau

Phase 129A–132: Data quality test suite, production smoke, pilot, product handoff
```

Mục tiêu là làm web **dùng được thật cho dòng họ Việt Nam**, không chỉ là cây quan hệ cơ bản, đồng thời không để main Worker bị biến thành nơi xử lý mọi tác vụ nặng.

---

# Nguyên tắc kiến trúc mới — Không để main Worker phình to

## Main app Worker nên phụ trách

```md
- UI web
- Auth/session
- Public/private page
- CRUD nhẹ
- API coordination nhẹ
- Query Supabase mức bình thường
- Tree viewer/editor ở mức app interaction
- Admin pages
```

## Main app Worker không nên phụ trách

```md
- ZIP backup lớn
- Export GEDCOM/JSON/ZIP dung lượng lớn
- Import file lớn
- Validate dữ liệu gia phả lớn
- Media processing
- Thumbnail generation
- Large document parsing
- Scheduled backup runtime nặng
- Scan toàn bộ dữ liệu dòng họ ở quy mô lớn nếu tốn CPU/time
```

## Service boundary candidate

| Service / Worker | Trạng thái | Trách nhiệm dự kiến |
|---|---:|---|
| `web-gia-pha` main app | Đang là app chính | UI, auth, CRUD nhẹ, public/private, tree, admin |
| `backup-service` | Theo roadmap backup trước đó | Backup, restore dry-run, fixture verify, scheduled backup |
| `genealogy-export-service` | Candidate, chưa tạo ngay | Export JSON/GEDCOM/ZIP lớn, media manifest |
| `genealogy-import-service` | Candidate, chưa tạo ngay | Import preview, conflict detection, validate dữ liệu lớn |
| `genealogy-media-service` | Candidate, chưa tạo ngay | Ảnh đại diện, ảnh mộ, tài liệu scan, metadata/thumbnail nếu cần |
| `genealogy-quality-service` | Later candidate | Scan vòng lặp quan hệ, trùng người, lỗi ngày tháng, privacy leak ở dữ liệu lớn |

## Quy tắc triển khai service

```md
- Không tạo Worker mới nếu phase hiện tại chưa yêu cầu.
- Không thêm dependency runtime nặng vào main app nếu chưa có approval.
- Không đổi Wrangler/OpenNext/Cloudflare deploy config nếu phase hiện tại không cho phép.
- Mọi service mới phải có:
  - boundary document
  - route contract
  - env/secret contract
  - auth/internal token rule
  - smoke plan
  - deploy plan
  - rollback/no-go checklist
- Nếu chưa chắc nên tách service hay không, chỉ ghi vào Recommendation / Later.
```

---

# Nhóm 0 — Runtime Worker Guardrail và Service Boundary Roadmap

## Phase 102B — Runtime Worker Guardrail and Service Boundary Roadmap

Mục tiêu: tạo guardrail cố định trong repo để AI/code agent sau này không dồn tác vụ nặng vào main Worker.

Kết quả cần có:

```md
- docs/RUNTIME_WORKER_GUARDRAIL.md
- docs/SERVICE_BOUNDARY_ROADMAP.md
- AGENTS.md trỏ tới 2 file trên khi task liên quan runtime/export/import/media/backup/dependency/Worker
- docs/00_INDEX.md cập nhật index
- docs/02_ARCHITECTURE.md thêm cross-reference ngắn
- docs/99_NEXT_AI_HANDOFF.md ghi nhận guardrail mới
- Chưa tạo Worker thật
- Chưa sửa runtime code
- Chưa sửa deploy config
- Chưa thêm package
- Chưa migration
```

Báo cáo cuối của các phase sau nếu có đụng runtime/export/import/media/backup/dependency/Worker phải có:

```md
- Main Worker touched: YES/NO
- Runtime dependency added: YES/NO
- New service Worker created: YES/NO
- OpenNext/Wrangler config changed: YES/NO
- Worker size risk: YES/NO
- Service boundary recommendation: NONE hoặc chi tiết
```

---

# Nhóm 1 — Chốt nghiệp vụ gia phả Việt Nam

## Phase 103 — Vietnamese Genealogy Domain Model Readiness

Mục tiêu: rà soát mô hình hiện tại và định nghĩa domain nghiệp vụ gia phả Việt Nam.

Kết quả cần có:

```md
- Docs mô tả nghiệp vụ gia phả Việt Nam
- Danh sách thiếu sót so với app hiện tại
- Quy tắc đời/thế hệ/chi/nhánh
- Quy tắc người trong họ, phối ngẫu, con, con nuôi, con riêng
- Quy tắc thông tin mộ phần, ngày giỗ, quê quán
- Ghi chú tương thích với runtime worker guardrail
- Chưa migration, chưa sửa runtime lớn
```

## Phase 104 — Existing Data Model Gap Analysis

Mục tiêu: so sánh database hiện tại với domain model cần có.

Cần trả lời:

```md
- Bảng people hiện thiếu field gì?
- Quan hệ family/couple/parent-child đã đủ chưa?
- Có cần bảng chi/nhánh/dòng họ không?
- Có cần bảng sự kiện đời người không?
- Có cần bảng mộ phần/ngày giỗ/media không?
- Cái gì nên thêm ngay, cái gì để sau?
- Field/bảng nào có rủi ro kéo theo xử lý nặng ở Worker?
```

## Phase 105 — Person Profile Field Specification

Mục tiêu: chốt hồ sơ cá nhân chuẩn Việt Nam.

Các nhóm field nên có:

```md
- Họ tên khai sinh
- Tên thường gọi
- Tên húy / tên tự / pháp danh nếu có
- Giới tính
- Ngày sinh dương lịch / âm lịch
- Ngày mất dương lịch / âm lịch
- Quê quán
- Nơi sinh
- Nơi mất
- Nghề nghiệp
- Ghi chú tiểu sử
- Ảnh đại diện
- Trạng thái còn sống/đã mất/không rõ
- Ghi chú riêng tư nếu cần
- Quy tắc public/private cho từng nhóm thông tin
```

## Phase 106 — Relationship Rule Specification

Mục tiêu: chuẩn hóa quy tắc quan hệ.

Cần định nghĩa rõ:

```md
- Cha ruột / mẹ ruột
- Cha nuôi / mẹ nuôi
- Cha kế / mẹ kế
- Con ruột / con nuôi / con riêng
- Vợ/chồng chính thức
- Hôn phối cũ
- Thứ tự vợ/chồng nếu cần
- Thứ tự con trong gia đình
- Quan hệ chưa xác định
- Cảnh báo dữ liệu mâu thuẫn
```

## Phase 107 — Branch, Generation, Clan Structure Specification

Mục tiêu: thêm khái niệm rất quan trọng trong gia phả Việt Nam.

Cần chốt:

```md
- Dòng họ
- Chi
- Nhánh
- Đời/thế hệ
- Trưởng họ
- Trưởng chi
- Người khởi tổ
- Người đại diện nhánh
- Cách đánh số đời
- Cách sắp xếp theo thứ tự con
- Cách filter/xem cây theo chi/nhánh
- Cách tương thích với public tree, export/import, backup
```

---

# Nhóm 2 — Chuẩn bị database/model

## Phase 108 — Vietnamese Genealogy Schema Candidate Design

Mục tiêu: thiết kế schema candidate, chưa tạo migration thật.

Có thể đề xuất thêm bảng:

```md
- clan_branches
- person_life_events
- person_burials
- person_names
- person_media
- generation_rules
```

Hoặc nếu muốn đơn giản, chỉ mở rộng bảng `people` trước.

Yêu cầu mới:

```md
- Phân loại field/bảng nào chỉ là metadata nhẹ
- Phân loại field/bảng nào có thể kéo theo service boundary sau này
- Không thiết kế schema khiến main Worker phải xử lý file/media/export lớn
```

## Phase 109 — Schema Candidate Static Safety Check

Mục tiêu: tạo checker kiểm tra schema candidate không phá dữ liệu cũ.

Bắt buộc kiểm tra:

```md
- Không DROP bảng cũ
- Không xóa dữ liệu
- Không đổi kiểu field nguy hiểm
- Migration phải additive
- Có rollback note
- Không đụng auth/permission nếu không cần
- Không tạo runtime dependency mới
- Không yêu cầu Worker mới trong phase schema candidate
```

## Phase 110 — Real Migration File Approval Gate

Mục tiêu: xin approval trước khi tạo migration thật.

Trạng thái nên là:

```md
- Có schema candidate
- Có static check
- Có owner approval checklist
- Có worker/runtime impact note
- Chưa tạo migration thật nếu chưa được xác nhận
```

## Phase 111 — Vietnamese Genealogy Real Migration File

Mục tiêu: tạo file migration thật trong:

```md
db/migrations/
```

Chưa chạy DB nếu chưa có approval apply.

## Phase 112 — Domain Migration Apply Readiness

Mục tiêu: chuẩn bị apply migration.

Cần có:

```md
- DB backup/snapshot confirmation
- Project ref confirmation
- Migration file checksum
- No-go checklist
- Post-apply verification plan
- Runtime/Worker impact confirmation
```

## Phase 113 — Domain Migration Apply Execution

Mục tiêu: apply DB thật nếu owner xác nhận.

Sau đó verify:

```md
- Bảng/field mới tồn tại
- Dữ liệu cũ không mất
- App build/typecheck/lint vẫn PASS
- Trang người/cây không lỗi
- Không phát sinh Worker/runtime regression
```

---

# Nhóm 3 — Nâng cấp UI nhập liệu và quản trị

## Phase 114 — Person Profile Admin UI Upgrade

Mục tiêu: nâng cấp form người thân.

UI cần có:

```md
- Thông tin cơ bản
- Thông tin sinh/mất
- Thông tin quê quán
- Thông tin mộ phần
- Tiểu sử
- Ghi chú riêng tư
- Ảnh đại diện ở mức metadata/URL nếu media boundary chưa triển khai
```

## Phase 115 — Relationship Editor UX Upgrade

Mục tiêu: nhập quan hệ dễ hơn.

Cần có:

```md
- Chọn cha/mẹ/con trực quan
- Chọn vợ/chồng
- Thứ tự con
- Loại quan hệ: ruột/nuôi/kế/riêng
- Cảnh báo quan hệ mâu thuẫn
```

## Phase 116 — Branch and Generation Admin UI

Mục tiêu: quản trị chi/nhánh/đời.

UI cần có:

```md
- Tạo chi/nhánh
- Gán người vào chi/nhánh
- Chọn trưởng chi/trưởng họ
- Quy tắc đánh số đời
- Xem danh sách người theo chi
```

## Phase 117 — Life Event and Memorial Data UI

Mục tiêu: nhập sự kiện đời người và ngày giỗ.

Bao gồm:

```md
- Sinh
- Mất
- Kết hôn
- Di cư
- Nghề nghiệp/sự kiện nổi bật
- Ngày giỗ
- Mộ phần
```

---

# Nhóm 3B — Media và tài liệu đính kèm

## Phase 118A — Media Domain and Storage Boundary Design

Mục tiêu: thiết kế trước cách lưu ảnh/tài liệu để không làm main Worker lớn.

Cần chốt:

```md
- Ảnh chân dung lưu ở đâu
- Ảnh mộ lưu ở đâu
- Ảnh gia đình lưu ở đâu
- Giấy tờ scan lưu ở đâu
- Metadata media nằm trong DB hay manifest
- File gốc/thumbnail xử lý ở đâu
- Khi nào cần genealogy-media-service
- Khi nào chỉ cần URL/storage metadata nhẹ trong main app
- Privacy của ảnh người còn sống
- Export/import media manifest tương thích backup
```

Không làm trong phase này:

```md
- Không upload media thật nếu boundary chưa rõ
- Không xử lý ảnh trong main Worker
- Không thêm image processing dependency vào main app
- Không tạo media Worker nếu chưa có approval
```

## Phase 118B — Media and Document Attachment UI

Mục tiêu: cho phép gắn ảnh/tài liệu sau khi boundary rõ.

Có thể gồm:

```md
- Ảnh chân dung
- Ảnh mộ
- Ảnh gia đình
- Giấy tờ scan
- Ghi chú nguồn tư liệu
- Hiển thị trạng thái public/private của media
```

---

# Nhóm 3C — Data quality và dashboard quản trị

## Phase 119A — Data Quality Boundary and Rule Design

Mục tiêu: thiết kế rule cảnh báo dữ liệu và phân loại rule nào chạy nhẹ trong main app, rule nào nên tách service/checker.

Cần phân loại:

```md
- Rule chạy realtime/nhẹ trong main app
- Rule chạy theo admin action
- Rule chạy trong checker script local/CI
- Rule cần dedicated service khi dữ liệu lớn
```

## Phase 119B — Data Quality Warning System

Mục tiêu: cảnh báo lỗi dữ liệu gia phả.

Ví dụ:

```md
- Người có 2 cha ruột
- Người có ngày mất trước ngày sinh
- Con sinh trước cha/mẹ quá vô lý
- Trùng tên/ngày sinh nghi là một người
- Quan hệ vòng lặp trong cây
```

## Phase 120 — Admin Review Dashboard

Mục tiêu: bảng tổng quan cho người quản trị.

Hiển thị:

```md
- Tổng số người
- Số người thiếu ngày sinh
- Số người thiếu quan hệ cha/mẹ
- Số người chưa gán chi/nhánh
- Cảnh báo dữ liệu
- Thay đổi gần đây
```

---

# Nhóm 4 — Cây phả hệ, public page, tìm kiếm

## Phase 121 — Tree Layout Upgrade for Vietnamese Genealogy

Mục tiêu: cây phả hệ hiển thị đúng văn hóa Việt Nam.

Cần cải thiện:

```md
- Thứ tự con từ lớn đến bé
- Hiển thị vợ/chồng rõ ràng
- Hiển thị đời/thế hệ
- Hiển thị chi/nhánh
- Tô nổi trưởng họ/trưởng chi
- Filter theo nhánh
```

## Phase 122 — Tree Navigation UX

Mục tiêu: cây lớn vẫn dễ dùng.

Cần có:

```md
- Tìm người trong cây
- Focus vào người
- Thu/phóng
- Mở rộng/thu gọn nhánh
- Xem đường huyết thống từ gốc tới người
```

## Phase 123 — Public Person Page Upgrade

Mục tiêu: trang cá nhân public đẹp và đầy đủ.

Hiển thị:

```md
- Ảnh
- Họ tên
- Đời/thế hệ
- Cha mẹ
- Vợ/chồng
- Con
- Tiểu sử
- Ngày sinh/mất
- Mộ phần
- Chi/nhánh
```

## Phase 124 — Public Tree Privacy Controls

Mục tiêu: kiểm soát riêng tư.

Quy tắc nên có:

```md
- Người còn sống có thể ẩn ngày sinh/số liệu nhạy cảm
- Người private không hiện public
- Public chỉ xem dữ liệu được duyệt
- Admin vẫn xem đầy đủ
- Media public/private phải theo cùng privacy model
```

## Phase 125 — Search and Filter Upgrade

Mục tiêu: tìm kiếm dùng được khi dữ liệu lớn.

Filter:

```md
- Theo tên
- Theo đời
- Theo chi/nhánh
- Theo quê quán
- Theo trạng thái còn sống/đã mất
- Theo thiếu dữ liệu
```

## Phase 126 — Mobile Tree and Elder-Friendly UX

Mục tiêu: người lớn tuổi cũng dùng được.

Yêu cầu:

```md
- Chữ lớn
- Nút rõ
- Ít thuật ngữ kỹ thuật
- Mobile dễ zoom
- Form nhập đơn giản
- Có hướng dẫn ngắn trong UI
```

---

# Nhóm 5 — Export/import, kiểm thử, production polish

## Phase 127A — Export Service Boundary Design

Mục tiêu: thiết kế trước export để không đưa ZIP/GEDCOM lớn vào main Worker một cách tùy tiện.

Cần chốt:

```md
- Export nhỏ có thể chạy trong main app hay không
- Export lớn cần genealogy-export-service hay không
- JSON export scope
- GEDCOM mapping scope
- ZIP backup scope
- Media manifest scope
- Timeout/size limit
- Privacy filtering trước export
- Audit log nếu cần
```

Không làm trong phase này:

```md
- Không tạo export Worker nếu chưa approval
- Không thêm ZIP/GEDCOM dependency nặng vào main app
- Không đổi deploy config
```

## Phase 127B — Vietnamese Genealogy Export Upgrade

Mục tiêu: export đầy đủ dữ liệu mới sau khi đã rõ boundary.

Export cần có:

```md
- JSON đầy đủ
- GEDCOM nếu mapping được
- ZIP backup
- Media manifest
- Branch/generation metadata
```

## Phase 128A — Import Service Boundary Design

Mục tiêu: thiết kế import preview/conflict detection để không làm hỏng dữ liệu và không làm main Worker quá tải.

Cần chốt:

```md
- Import JSON nhỏ chạy ở đâu
- Import lớn chạy ở đâu
- Conflict detection chạy ở đâu
- Preview token/manifest nếu cần
- Không ghi DB nếu chưa confirm
- Timeout/row limit/file size limit
- Khi nào cần genealogy-import-service
```

## Phase 128B — Import Upgrade and Conflict Preview

Mục tiêu: import không làm hỏng dữ liệu.

Cần có:

```md
- Preview trước khi import
- Báo trùng người
- Báo quan hệ mâu thuẫn
- Báo thiếu field
- Không ghi DB nếu chưa confirm
```

## Phase 129A — Genealogy Data Quality Test Suite Design

Mục tiêu: thiết kế bộ test/check riêng cho dữ liệu gia phả, phân loại chạy local/CI/main app/service.

Cần chốt:

```md
- Check nào chạy trong script local
- Check nào chạy trong CI
- Check nào chạy trong admin UI
- Check nào cần service khi dữ liệu lớn
- Không làm main Worker scan nặng nếu dữ liệu lớn
```

## Phase 129B — Genealogy Data Quality Test Suite

Mục tiêu: triển khai bộ test/check riêng cho dữ liệu gia phả.

Checks:

```md
- Relationship cycle
- Invalid birth/death order
- Duplicate people candidate
- Missing required branch/generation
- Public privacy leak
```

## Phase 130 — Production UX Smoke

Mục tiêu: smoke trên production URL.

Kiểm tra:

```md
- Login
- Admin people
- Relationship editor
- Tree viewer
- Public tree
- Export
- Import preview
```

## Phase 131 — Family Data Entry Pilot

Mục tiêu: nhập thử một nhánh gia đình thật hoặc dữ liệu mẫu lớn.

Không cần production data thật nếu chưa muốn. Có thể dùng fixture.

Kết quả:

```md
- Nhập 50–100 người mẫu
- Test cây lớn
- Test tìm kiếm
- Test export/import
- Ghi nhận lỗi UX
- Ghi nhận rủi ro Worker/runtime nếu thao tác lớn
```

## Phase 132 — Vietnamese Genealogy Product Handoff

Mục tiêu: tổng hợp toàn bộ trạng thái sau khi quay lại nghiệp vụ.

Kết quả:

```md
- Những gì đã sẵn sàng
- Những gì còn thiếu
- DB đã đổi gì
- UI đã đổi gì
- Privacy/export đã đảm bảo chưa
- Service boundary đã rõ chưa
- Có Worker/service nào đã tạo chưa
- Có thể mời người nhà test chưa
```

---

# Thứ tự tôi khuyên làm ngay

Không nên làm từ 102B đến 132 trong một prompt quá dài. Nên chia thành bundle nhỏ.

## Bundle 0 nên làm trước

```md
Phase 102B — Runtime Worker Guardrail and Service Boundary Roadmap
```

Bundle này tạo luật cố định để các AI sau không làm main Worker lớn.

Chỉ docs/checker nếu cần:

```md
- docs/RUNTIME_WORKER_GUARDRAIL.md
- docs/SERVICE_BOUNDARY_ROADMAP.md
- cập nhật AGENTS.md
- cập nhật docs/00_INDEX.md
- cập nhật docs/02_ARCHITECTURE.md
- cập nhật docs/99_NEXT_AI_HANDOFF.md
```

Không làm:

```md
- Không migration
- Không apply DB
- Không deploy
- Không sửa runtime code
- Không tạo Worker mới
- Không thêm package
- Không push
```

## Bundle 1 nên làm ngay sau Bundle 0

```md
Phase 103 — Vietnamese Genealogy Domain Model Readiness
Phase 104 — Existing Data Model Gap Analysis
Phase 105 — Person Profile Field Specification
Phase 106 — Relationship Rule Specification
Phase 107 — Branch and Generation Structure Specification
```

Bundle này **chỉ phân tích/docs/checker**, chưa migration. Rất an toàn.

## Bundle 2

```md
Phase 108 — Vietnamese Genealogy Schema Candidate Design
Phase 109 — Schema Candidate Static Safety Check
Phase 110 — Real Migration File Approval Gate
```

Bundle này chuẩn bị DB, nhưng chưa apply.

## Bundle 3

```md
Phase 111 — Real Migration File
Phase 112 — Migration Apply Readiness
Phase 113 — Migration Apply Execution
```

Bundle này mới chạm DB, cần owner approval riêng.

## Bundle 4

```md
Phase 114 — Person Profile Admin UI Upgrade
Phase 115 — Relationship Editor UX Upgrade
Phase 116 — Branch and Generation Admin UI
Phase 117 — Life Event and Memorial Data UI
Phase 118A — Media Domain and Storage Boundary Design
Phase 118B — Media and Document Attachment UI
```

## Bundle 5

```md
Phase 119A — Data Quality Boundary and Rule Design
Phase 119B — Data Quality Warning System
Phase 120 — Admin Review Dashboard
Phase 121 — Tree Layout Upgrade
Phase 122 — Tree Navigation UX
Phase 123 — Public Person Page Upgrade
Phase 124 — Public Tree Privacy Controls
Phase 125 — Search and Filter Upgrade
Phase 126 — Mobile/Elder-Friendly UX
```

## Bundle 6

```md
Phase 127A — Export Service Boundary Design
Phase 127B — Vietnamese Genealogy Export Upgrade
Phase 128A — Import Service Boundary Design
Phase 128B — Import Upgrade and Conflict Preview
Phase 129A — Genealogy Data Quality Test Suite Design
Phase 129B — Genealogy Data Quality Test Suite
Phase 130 — Production UX Smoke
Phase 131 — Family Data Entry Pilot
Phase 132 — Vietnamese Genealogy Product Handoff
```

---

# Prompt đầu tiên nên chạy sau khi cập nhật plan

```md
Bạn đang làm trong repo:

D:\CODE\GIA PHẢ

Mục tiêu: thực hiện Bundle 0 — Phase 102B: Runtime Worker Guardrail and Service Boundary Roadmap.

Phạm vi:
- Chỉ docs/checker nếu cần.
- Không migration.
- Không apply DB.
- Không deploy.
- Không sửa runtime code.
- Không sửa Wrangler/OpenNext config.
- Không tạo Worker mới.
- Không thêm package.
- Không push GitHub.

Đọc:
- AGENTS.md
- README.md
- docs/00_INDEX.md
- docs/02_ARCHITECTURE.md
- docs/06_EXPORT_BACKUP_MODEL.md
- docs/07_PHASE_PLAN.md
- docs/99_NEXT_AI_HANDOFF.md: chỉ phần mới nhất
- PLANNING.MD nếu có

Tạo mới:
- docs/RUNTIME_WORKER_GUARDRAIL.md
- docs/SERVICE_BOUNDARY_ROADMAP.md

Cập nhật:
- AGENTS.md
- docs/00_INDEX.md
- docs/02_ARCHITECTURE.md
- docs/07_PHASE_PLAN.md hoặc PLANNING.MD nếu phù hợp
- docs/99_NEXT_AI_HANDOFF.md

Validation:
- npm run check:env:safe nếu có
- npm run check:migrations nếu có
- git diff --check
- git status --short

Commit local:
docs: add service boundary roadmap

Báo cáo cuối:
- Summary
- Files changed
- Service boundary decisions
- Validation results
- Git commit hash
- Explicitly not done:
  - No migration
  - No DB apply
  - No deploy
  - No runtime code change
  - No Worker created
  - No package added
  - No push
```
