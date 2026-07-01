# PLAN A-16I5 - Import Review Pack Official Import Gate

Marker: `A-16I5`

## Mục tiêu

A-16I5 tạo gói rà soát chỉ đọc cho owner trước khi mở bất kỳ bước nhập chính thức nào. Gói này tổng hợp manifest staging, validation summary và dry-run mapping preview để owner có cơ sở quyết định phase sau.

## Phạm vi an toàn

- Chỉ đọc dữ liệu staging đã có.
- Không tạo migration, không chạy `supabase db push`, không chạy SQL apply.
- Không seed, không import Excel mới, không deploy, không push.
- Không ghi `people/person`, quan hệ thật, layout cây, tree state hoặc revision.
- Không mở route/action `confirm`, `import-now`, `finalize`, hoặc nhập chính thức.
- Không dùng service role hoặc bypass RLS.
- Không in secret, không commit `.env.local`, storage state, cookie, token hoặc dữ liệu cá nhân thô.

## Màn được chỉnh

- Màn admin import manifest hiện có nhận thêm mục `Gói rà soát trước khi nhập`.
- API GET chỉ đọc: `GET /api/admin/import-sessions/[sessionId]/review-pack`.
- Không tạo route mới để ghi dữ liệu thật.

## Nội dung review pack

- `marker=A16I5_IMPORT_REVIEW_PACK_OFFICIAL_IMPORT_GATE`
- `previewOnly=true`
- `canProceedToOfficialImport=false`
- `readyForOfficialImport=false`
- session id, extension file, size và hash, không cần hiển thị tên file thật.
- parse summary từ A-16I3 nếu có.
- validation summary: số người, số quan hệ, lỗi, cảnh báo, thông tin, mã issue chính.
- dry-run summary: số người dự kiến, số quan hệ dự kiến, số lỗi chặn, số cảnh báo.

## Điều kiện mở phase sau

Phase nhập chính thức chỉ được mở khi owner phê duyệt riêng, có checker mới và vẫn giữ audit staging. A-16I5 không tự cấp quyền nhập chính thức.

## Kết quả

`A16I5_STATUS=OWNER_REVIEW_PACK_READY_OFFICIAL_IMPORT_CLOSED`

## Kiểm tra

- `npm run check:a16i5-import-review-pack-official-import-gate`
- `npm run typecheck`
- `npm run lint`
- `npm run build`
