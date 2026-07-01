# A-16Q-FIX2 - Row 95 Date Diagnosis and Staging Count Consistency

Marker: `A-16Q-FIX2`

Status: `A16Q_FIX2_STATUS=ROW95_WARNING_AND_COUNTS_ALIGNED`

## Mục tiêu

A-16Q-FIX2 xử lý hai điểm còn lại sau A-16Q-FIX:

1. Dòng 95 không được tiếp tục là blocker `death_before_birth` nếu dữ liệu chỉ cho thấy same-year, thiếu precision, khác hệ lịch hoặc chưa rõ hệ lịch ngày mất.
2. UI phải phân biệt tổng staging 102/134 với mẫu preview đang đọc 100/100.

Phase này không chạy import thật, không gọi RPC, không gọi POST `/official-import`, không chạy SQL, không DB push và không ghi dữ liệu gia phả thật.

## Row 95 Diagnosis

Không ghi tên đầy đủ hoặc dữ liệu cá nhân thô vào terminal/docs. Regression case được ghi dạng sanitized:

- Row number: 95.
- PII: redacted.
- Birth calendar: `solar`.
- Death calendar: `unknown`.
- Precision: year-only hoặc incomplete.
- Expected severity: `warning`.
- Expected blocker: `false`.

Rule sau FIX2:

- Same-year death with partial precision => WARNING.
- Birth/death calendar mismatch => WARNING.
- Death calendar unknown => WARNING.
- `death_before_birth` chỉ còn là ERROR khi có bằng chứng đủ chắc chắn:
  - cùng calendar type đã biết và `deathYear < birthYear`; hoặc
  - cùng calendar type đã biết, full date precision và `deathDate < birthDate`.

Với rule này, dòng 95 trong nhóm uncertain/same-year/calendar-needs-review không còn là blocker; nó phải hiển thị warning cần chủ nhà xác nhận.

## Count Consistency

Nguồn gây nhầm:

- Import session summary ghi tổng staging:
  - Dòng staging: 102.
  - Thành viên staging: 102.
  - Quan hệ staging: 134.
- `peoplePreview` trong write manifest và query relationships chỉ đang đọc sample tối đa 100 để UI nhẹ.
- Trước FIX2, validation/dry-run dùng sample length 100/100 làm nhãn “Số người staging” và “Số quan hệ staging”.

Sửa trong FIX2:

- `ManifestValidationSummary.peopleCount` dùng total từ `session.personCandidateCount`.
- `ManifestValidationSummary.relationshipCount` dùng total từ `session.relationshipCandidateCount`.
- Thêm `peoplePreviewCount` và `relationshipPreviewCount` để hiển thị sample 100/100 riêng.
- Dry-run preview tách total staging/proposed count với preview sample count.
- Review pack tách total count và preview sample count.
- UI panel hiển thị thêm “Mẫu người đang đọc”, “Mẫu quan hệ đang đọc”, “Mẫu người hiển thị” và “Mẫu quan hệ hiển thị”.

Kỳ vọng UI sau FIX2:

- Total staging count: 102 people, 134 relationships.
- Preview sample count: 100 people, 100 relationships.
- Dry-run/review pack không còn khiến 100/100 bị hiểu là tổng staging thật.

## Official Import Lock

Official import vẫn khóa:

- `canRunOfficialImport=false`.
- UI button disabled.
- Không script gọi RPC.
- Không script gọi POST official import.
- Không ghi people/relationships/families/layout/tree/revision/profile thật.

## Safety

- Không chạy official import.
- Không chạy RPC.
- Không chạy POST `/official-import`.
- Không chạy SQL.
- Không DB push.
- Không migration repair.
- Không seed.
- Không deploy.
- Không push.
- Không commit Excel/secret/env/storage state.
