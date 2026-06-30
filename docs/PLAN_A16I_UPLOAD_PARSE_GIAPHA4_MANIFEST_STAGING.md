# A-16I - Upload/Parse Gia Phả 4 Into Manifest Staging

Status: `A16I_STATUS=UPLOAD_PARSE_MANIFEST_STAGING_READY`

Marker: `A16I_UPLOAD_PARSE_GIAPHA4_MANIFEST_STAGING`

## Mục tiêu

A-16I mở bước tải lên và đọc file Gia Phả 4 trong admin để tạo import session
và ghi dữ liệu đã parse vào vùng manifest staging đã được owner verify ở
A-16F5M. Phase này chỉ tạo dữ liệu review/staging, chưa nhập vào cây gia phả
thật.

## Ranh giới staging-only

A-16I chỉ được phép ghi các bảng import manifest staging:

- `import_sessions`
- `import_session_warnings`
- `import_duplicate_candidates`
- `import_relationship_candidates`
- `import_write_manifests`

Các xác nhận no-go:

- Không migration.
- Không DB push.
- Không SQL apply.
- Không `supabase migration repair`.
- Không seed/import vào bảng thật.
- Không tạo people/person thật.
- Không tạo relationship thật.
- Không cập nhật layout/tree/revision thật.
- Không mở import chính thức.
- Không deploy.
- Không push.

## API/UI/service đã thêm

Runtime:

- `POST /api/admin/import-sessions/upload`
- `lib/import/giapha4/xlsx-staging-parser.ts`
- `lib/import/giapha4/manifest-upload-service.ts`
- `components/imports/giapha4-manifest-upload-form.tsx`

UI được thêm trên `/admin/exports/import` với copy tiếng Việt:

- `Tải lên file Gia Phả 4`
- `Chỉ ghi vào vùng staging, chưa nhập vào cây gia phả thật.`
- `Chọn file`
- `Đọc file và tạo manifest`
- `Đang đọc file...`
- `Đã tạo manifest staging`
- `Không đọc được file Gia Phả 4`
- `Xác nhận nhập chính thức — chưa mở`

Màn A-16G tiếp tục hiển thị session/manifest và được mở rộng để đọc
`person_candidates` từ draft write manifest nếu A-16I đã staging thành công.
CTA nhập chính thức vẫn disabled/read-only.

## File format được hỗ trợ

Thực tế A-16I hỗ trợ:

- `.xlsx`: đọc server-side bằng `jszip` đã có sẵn trong repo.
- `.xls`: chưa hỗ trợ trong A-16I vì repo chưa có parser binary `.xls`.

Machine-readable format status: `XLSX=SUPPORTED`, `XLS=UNSUPPORTED_IN_A16I`.

Không thêm package mới. Nếu owner cần đọc `.xls` trực tiếp, bước tiếp theo nên
là phase riêng để duyệt parser dependency hoặc chuyển file `.xls` sang `.xlsx`
ngoài repo.

Giới hạn upload A-16I: 5MB để giữ main Worker ở mức coordination nhẹ. File lớn
hơn nên đi qua offline tooling hoặc `genealogy-import-service` trong phase sau.

## Mapping Gia Phả 4 vào manifest staging

Parser `.xlsx` thực hiện:

1. Đọc workbook/sheet/header server-side.
2. Chuẩn hóa header tiếng Việt/không dấu.
3. Tìm sheet có cột họ tên và tối thiểu một cột Gia Phả 4 liên quan.
4. Tạo person candidates normalized từ các cột như họ tên, tên gọi, giới tính,
   ngày sinh/mất, nơi sinh, quê quán, chi/nhánh, đời/thế hệ, tiểu sử và ghi
   chú riêng.
5. Ghi person candidates vào
   `import_write_manifests.approved_scope.person_candidates` với trạng thái
   draft và marker `A16I_STAGING_ONLY_NOT_APPROVED`.
6. Tạo relationship candidates cho cha, mẹ, vợ/chồng và con vào
   `import_relationship_candidates` nếu các cột tồn tại.
7. Tạo duplicate candidates nội bộ file theo cùng họ tên vào
   `import_duplicate_candidates`.
8. Ghi warning/error tiếng Việt vào `import_session_warnings`.
9. Cập nhật count/hash/status trên `import_sessions`.

Do schema A-16D/A-16F5M hiện chưa có bảng `import_person_candidates` riêng,
A-16I không tạo migration mới. Person candidates được giữ trong draft write
manifest JSONB để owner review, chưa phải write manifest được approve để nhập
thật.

## Xử lý lỗi parse

Nếu file không đúng định dạng, workbook/header không nhận diện được hoặc `.xls`
được tải lên:

- route trả lỗi tiếng Việt an toàn;
- tạo session `rejected_needs_fix` nếu RLS cho phép tạo session staging;
- ghi warning blocker vào `import_session_warnings` nếu schema/RLS cho phép;
- không ghi bất kỳ bảng people/relationship/layout/revision thật nào.

Nếu parse được nhưng ghi manifest staging lỗi, session được chuyển sang
`rejected_needs_fix` nếu update được và UI không báo đã import thành công.

Không log raw rows, không lưu file gốc vào repo, không upload ra dịch vụ ngoài.

## Guardrail không import thật

Route A-16I trả response có:

- `stagingOnly: true`
- `canImport: false`
- `dbWrite: false`
- `peopleWrite: false`
- `relationshipWrite: false`
- `treeLayoutWrite: false`
- `revisionWrite: false`

`dbWrite: false` ở đây nghĩa là không ghi bảng gia phả thật; phase này vẫn ghi
vào các bảng manifest staging được owner verify.

## Checker A-16I

Đã thêm:

- `scripts/check-a16i-upload-parse-giapha4-manifest-staging.cjs`
- package script
  `check:a16i-upload-parse-giapha4-manifest-staging`

Checker kiểm tra doc, API/service/parser/UI, package script, no migration,
không `supabase db push`, không `migration repair`, không SQL apply/seed mới,
không mutation vào people/person thật, relationships thật, layout/tree/revision,
không route confirm/commit/finalize/import-now/official-import, không service
role trong client, không hardcode credential/token/cookie và A-16G/A-16H
checker vẫn biết allowlist A-16I.

## Validation đã chạy

Kết quả trên máy hiện tại:

- PASS: `npm run check:env:safe`
- PASS: `npm run check:migrations`
- PASS: `npm run check:a16g-import-session-read-manifest-runtime`
- PASS: `npm run check:a16h-import-manifest-auth-browser-smoke`
- PASS: `npm run check:a16i-upload-parse-giapha4-manifest-staging`
- PASS: `npm run typecheck`
- PASS: `npm run lint`
- PASS: `npm run build`
- PASS: `git diff --check`
- PASS: `git diff --cached --check`
- Observed: `git status -sb` returned `main...origin/main [ahead 2]` before
  the final local A-16I commit.

## Giới hạn còn lại

- `.xls` chưa parse trực tiếp trong A-16I.
- Chưa có bảng `import_person_candidates` riêng; person candidates nằm trong
  draft `import_write_manifests.approved_scope`.
- A-16I chưa chứng minh upload thật trên môi trường authenticated nếu owner
  chưa cung cấp session/dev fixture an toàn.
- RLS vẫn là gate thật. Nếu DB chưa có policy cho user tạo staging session,
  upload route sẽ trả lỗi tiếng Việt thay vì bypass RLS.
- Chưa có transaction RPC vì phase này không được tạo migration/RPC mới.

## Bước tiếp theo đề xuất

- A-16J: Validate/review manifest warnings trước khi owner approval.
- Hoặc A-16I2: Test upload bằng file Gia Phả 4 thật do owner cung cấp trong môi
  trường dev/authenticated, không commit file và không paste dữ liệu nhạy cảm.

## Runtime Worker Boundary

- Main Worker touched: YES, small upload/parse coordination route and admin UI.
- Runtime dependency added: NO.
- New service Worker created: NO.
- OpenNext/Wrangler config changed: NO.
- Worker size risk: LOW for `.xlsx` <= 5MB using existing `jszip`; use
  `genealogy-import-service` or offline tooling for large/complex workbooks.
- Service boundary recommendation: NONE for A-16I small staging; revisit before
  large validation, `.xls` parser dependency or official import runtime.
