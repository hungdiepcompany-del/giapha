# PLAN A-16I4U - Manual UI Real Gia Phả 4 Staging Upload Verification

Marker: `A-16I4U`

## Mục tiêu

A-16I4U ghi nhận owner đã upload file Gia Phả 4 thật qua UI vào vùng staging và parser/staging path hoạt động. Phase này chỉ ghi nhận bằng chứng an toàn, không claim nhập chính thức.

## Owner Manual Evidence

Owner báo UI hiển thị:

- `Đã nhận diện sheet Thành viên`.
- `Đã đọc mã Gia Phả 4 cho 102 thành viên`.
- `Quan hệ cha/mẹ được tạo từ Mã GP Bố/Mã GP Mẹ: 134`.
- `Dữ liệu này vẫn chỉ nằm ở staging, chưa nhập vào cây gia phả thật`.

Counts an toàn:

- staged people: `102`.
- staged parent relationships: `134`.
- KhÃ´ng ghi raw personal rows.
- file type recorded only as `.xlsx`; không ghi tên file thật nếu có PII.
- không ghi raw personal rows, họ tên, ngày sinh, địa chỉ, ghi chú riêng hoặc nội dung workbook.

## Kết Luận

- Manual UI real staging upload verification: `PASS_OWNER_CONFIRMED`.
- Parser mapping sheet `Thành viên`: `PASS_OWNER_CONFIRMED`.
- Staging insert path: `PASS_OWNER_CONFIRMED`.
- Parent relationship candidate mapping: `PASS_OWNER_CONFIRMED`.
- Official import: `NOT_OPENED`.
- Real genealogy writes: `NOT_RUN`.

## Preconditions

- A-16SQL owner manual Supabase Dashboard apply verification PASS: RLS enabled, authenticated staging SELECT/INSERT policies, authenticated UPDATE only on `import_sessions`, no anon/public staging policy, `imports.create` exists, and no A-16SQL policy on real genealogy tables.
- A-16I3/I4/I5 completed in commit `78320f9 runtime: harden Gia Pha 4 staging import review`.

## Remaining Review Required

- số lỗi validation;
- số cảnh báo;
- review pack status;
- duplicate/conflict decisions;
- owner review no-go/go decision for a future phase.

## Next Step

A-16M designs official import transaction/rollback/audit. A-16I4U does not import thật.

## Guardrails

- Không migration.
- Không DB push.
- Không SQL apply.
- Không `supabase migration repair`.
- Không seed.
- Không deploy.
- Không push.
- Không ghi people/person thật.
- Không ghi relationships/families/family_parents/family_children/couple_relationships thật.
- Không ghi layout/tree/revision.
- Không service-role bypass.
- Không anon/public grant.
- Không commit Excel/storage state/cookie/token/secret/screenshot/raw personal data.

`A16I4U_STATUS=PASS_OWNER_CONFIRMED_STAGING_ONLY_OFFICIAL_IMPORT_NOT_OPENED`
