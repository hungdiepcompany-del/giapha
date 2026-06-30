# A-16J - Manifest Staging Review / Validation Warnings

Marker: `A16J_MANIFEST_STAGING_REVIEW_VALIDATION_WARNINGS`

## Mục tiêu

A-16J thêm lớp review dữ liệu staging sau A-16I:

- Đọc import session và manifest staging đã có.
- Tính lỗi/cảnh báo/thông tin validation ở runtime/read-only.
- Hiển thị cảnh báo tiếng Việt trên `/admin/exports/import`.
- Mở API `GET /api/admin/import-sessions/[sessionId]/validation`.
- Giữ `canImport: false`, `dbWrite: false`, official import disabled.

## Phạm vi runtime

Thêm service server-only:

- `lib/import/giapha4/manifest-validation-service.ts`
- Marker: `A16J_MANIFEST_STAGING_VALIDATION_MARKER`
- Hàm thuần đọc: `buildManifestValidationReview`
- Hàm API: `validateImportManifestStaging`

Service dùng `getImportManifest` của A-16G/A-16I để đọc staging qua Supabase
server client hiện có. A-16J không ghi warning summary xuống DB vì chưa cần
mutation staging mới và prompt cho phép runtime/read-only nếu schema không có
vùng lưu phù hợp.

## API

`GET /api/admin/import-sessions/[sessionId]/validation`

Đầu ra luôn giữ:

- `stagingOnly: true`
- `readOnly: true`
- `dbWrite: false`
- `canImport: false`
- `summary.canProceedToDryRun: false`

Không thêm route POST/PUT/PATCH/DELETE. Không thêm route final/commit/import.

## UI

Panel `/admin/exports/import` thêm khối:

- `Kiểm tra dữ liệu staging`
- `Lỗi cần xử lý`
- `Cảnh báo dữ liệu`
- `Gợi ý kiểm tra`
- `Chưa phát hiện cảnh báo nghiêm trọng`
- `Dữ liệu này vẫn chưa được nhập vào cây gia phả thật.`
- `Xác nhận nhập chính thức — chưa mở`

Metric hiển thị:

- `Số người staging`
- `Số quan hệ staging`
- `Số lỗi`
- `Số cảnh báo`
- `Số thông tin`

CTA nhập chính thức vẫn disabled/read-only. Không có nút auto fix, merge,
import now hoặc mở nhập chính thức.

## Nhóm validation

A-16J kiểm tra các nhóm tối thiểu:

- Không có session hoặc manifest staging trống.
- Không có người staging.
- Thiếu fingerprint staging của người.
- Tên thành viên trống/quá ngắn.
- Thiếu tên hiển thị riêng.
- Ngày sinh/ngày mất không theo dạng `YYYY`, `YYYY-MM`, `YYYY-MM-DD`.
- Ngày mất trước ngày sinh.
- Trạng thái còn sống mâu thuẫn với ngày mất.
- Người staging có thể trùng theo họ tên/ngày sinh/quê quán.
- Quan hệ thiếu nguồn/đích.
- Quan hệ trỏ tới fingerprint không có trong danh sách người staging.
- Quan hệ tự trỏ tới chính mình.
- Quan hệ trùng nguồn/đích/loại.
- Quan hệ ambiguity khác `clear`.
- Cảnh báo parser từ A-16I được gom lại vào review.

## Guardrails

Trạng thái phase:

- `A16J_MIGRATION_STATUS=NO_NEW_MIGRATION`
- `A16J_DB_PUSH_STATUS=NOT_RUN`
- `A16J_DB_DRY_RUN_STATUS=NOT_RUN`
- `A16J_SQL_APPLY_STATUS=NOT_RUN`
- `A16J_SEED_STATUS=NO_SEED`
- `A16J_PEOPLE_WRITE_STATUS=NO_WRITE`
- `A16J_RELATIONSHIP_WRITE_STATUS=NO_WRITE`
- `A16J_TREE_LAYOUT_WRITE_STATUS=NO_WRITE`
- `A16J_REVISION_WRITE_STATUS=NO_WRITE`
- `A16J_OFFICIAL_IMPORT_STATUS=DISABLED`
- `A16J_DEPLOY_STATUS=NOT_RUN`
- `A16J_PUSH_STATUS=NOT_RUN`

Không migration. Không DB push. Không SQL apply. Không seed/import vào bảng
thật. Không tạo people/person thật. Không tạo relationship thật. Không cập
nhật layout/tree/revision. Không mở import chính thức. Không deploy. Không
push.

Guardrail exact tokens: Không seed/import vào bảng thật. Không cập nhật layout/tree/revision. Không push.

## Validation

Checker mới:

- `scripts/check-a16j-manifest-staging-review-validation-warnings.cjs`
- Package command:
  `check:a16j-manifest-staging-review-validation-warnings`

Kết quả local:

- `check:env:safe`: PASS
- `check:migrations`: PASS
- `check:a16g-import-session-read-manifest-runtime`: PASS
- `check:a16h-import-manifest-auth-browser-smoke`: PASS
- `check:a16i-upload-parse-giapha4-manifest-staging`: PASS
- `check:a16j-manifest-staging-review-validation-warnings`: PASS
- `typecheck`: PASS
- `lint`: PASS
- `build`: PASS
- `git diff --check`: PASS
- `git diff --cached --check`: PASS

## Next

Sau khi A-16J PASS, bước hợp lý tiếp theo là owner review dữ liệu staging thật
trên môi trường đã đăng nhập. Bất kỳ bước nhập chính thức nào vẫn phải là phase
riêng với approval marker, transaction/rollback và checker riêng.
