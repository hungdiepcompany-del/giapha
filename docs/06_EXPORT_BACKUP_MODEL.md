# Export & Backup model

## Phase 10 import JSON foundation status

- `/admin/exports/import` cho upload hoặc paste `family.json` để preview an toàn.
- `json-import-validator` kiểm JSON parse, `schema_version = 1.0.0`, arrays bắt buộc, duplicate IDs, `full_name`, references giữa person/family/layout và vòng tổ tiên.
- `json-import-preview-service` kiểm `imports.create` khi auth/config đã có và chỉ chạy conflict check server-side.
- Conflict check hiện chỉ báo existing person IDs, duplicate person slugs, existing family IDs và existing tree layout IDs.
- Nếu thiếu Supabase config, vẫn có thể kiểm cấu trúc file; conflict DB được báo unavailable.
- Phase 10 không ghi DB, không lưu file upload, không restore, không overwrite dữ liệu hiện tại.

## Nguyên tắc

Export/backup là bắt buộc từ đầu.

Supabase không phải nơi giam dữ liệu vĩnh viễn.

Dữ liệu gia phả phải có thể rời khỏi hệ thống đang chạy mà vẫn giữ được quan hệ, nguồn, media metadata, layout và lịch sử cần thiết.

## File export

- family.json
- family.ged
- media.zip
- full-backup.zip

## Phase 8 foundation status

- `family.json`: đã có builder server-side từ people, families, family_parents, family_children, couple_relationships, tree_layouts và tree_layout_nodes.
- `family.ged`: đã có GEDCOM foundation với HEAD, INDI, FAM và TRLR. Dữ liệu không map được sang GEDCOM vẫn được giữ trong `family.json`.
- `full-backup.zip`: đã có ZIP foundation bằng `jszip`, gồm `family.json`, `family.ged`, `manifest.json` và `checksums.json`.
- `manifest.json`: đã có schema version, app version, count và checksum algorithm.
- `checksums.json`: dùng SHA-256 cho file backup chính.
- `media.zip`: chưa có media upload thật trong Phase 8, `media_count = 0`.
- Import: chưa bật import đầy đủ; chỉ ghi nguyên tắc để tránh ghi đè dữ liệu khi chưa có preview/validation.
- Migration: đã tạo migration `20260614_0006_export_backup_foundation.sql`, chưa chạy trên Supabase thật.

## Cấu trúc full-backup.zip

```txt
full-backup.zip
  family.json
  family.ged
  manifest.json
  media/
    avatars/
    photos/
    documents/
  checksums.json
```

## family.json

Phải chứa:

- schema_version
- app_name
- app_version
- exported_at
- exported_by
- privacy_mode
- people
- families
- family_parents
- family_children
- couple_relationships
- tree_layouts
- tree_layout_nodes
- manifest

## family.ged

Dùng để chuyển dữ liệu sang phần mềm gia phả khác.

Dữ liệu nào không map được sang GEDCOM thì giữ trong JSON.

Phase 8 GEDCOM foundation:

- Map person thành INDI.
- Map family thành FAM.
- Map parent/child thành HUSB/WIFE/CHIL khi xác định được.
- Nếu gender hoặc parent_role không đủ rõ, không crash; ghi NOTE an toàn.
- GEDCOM không phải nguồn dữ liệu đầy đủ duy nhất; `family.json` vẫn là bản bảo toàn dữ liệu chính.

## manifest.json

Phải có:

- app_name
- app_version
- schema_version
- exported_at
- people_count
- relationship_count
- media_count
- checksum_algorithm

## Quy tắc import

- Không đổi ID nếu không cần.
- Không làm mất quan hệ.
- Có kiểm tra schema_version.
- Có báo lỗi rõ nếu backup sai định dạng.
- Không import đè lên dữ liệu đang chạy nếu chưa có chế độ xem trước/xác nhận.
- Cần ghi revision/import log cho những thay đổi quan trọng.
- Phase 8 chưa bật import ghi dữ liệu. Import đầy đủ cần validation, preview, xác nhận và revision/import log trước.

## Quyền export/import

- `/admin/exports` yêu cầu `exports.download` để hiển thị nút tải.
- Route download JSON/GEDCOM/ZIP build file server-side và kiểm `exports.download`.
- `export_jobs` và `backup_records` bật RLS, không mở public.
- `imports.create` được giữ cho phase import sau, chưa có route ghi dữ liệu.
