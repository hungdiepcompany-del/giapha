# Export & Backup model

## Nguyên tắc

Export/backup là bắt buộc từ đầu.

Supabase không phải nơi giam dữ liệu vĩnh viễn.

Dữ liệu gia phả phải có thể rời khỏi hệ thống đang chạy mà vẫn giữ được quan hệ, nguồn, media metadata, layout và lịch sử cần thiết.

## File export

- family.json
- family.ged
- media.zip
- full-backup.zip

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
- exported_at
- people
- families
- relationships
- events
- media metadata
- sources
- tree layouts

## family.ged

Dùng để chuyển dữ liệu sang phần mềm gia phả khác.

Dữ liệu nào không map được sang GEDCOM thì giữ trong JSON.

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

