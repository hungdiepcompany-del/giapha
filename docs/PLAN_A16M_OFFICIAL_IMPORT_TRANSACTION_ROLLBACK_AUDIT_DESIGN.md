# PLAN A-16M - Official Import Transaction / Rollback / Audit Design

Marker: `A-16M`

## Mục tiêu

A-16M thiết kế chi tiết official import từ Gia Phả 4 staging sang bảng gia phả thật. Phase này là design-only: không implement runtime nhập thật, không tạo route POST, không ghi DB thật, không migration.

## Future Owner Marker

Required future marker: `APPROVE_A16P_OFFICIAL_IMPORT_RUNTIME_CANDIDATE`.

Marker này chỉ là requirement tương lai. A-16M không coi marker này là approval và không mở official import.

## Preconditions Trước Official Import

- import session tồn tại và chưa imported/cancelled/expired.
- session thuộc owner/current profile hoặc user có quyền phù hợp.
- user có permission nhập chính thức trong tương lai, tách khỏi `imports.create` nếu cần.
- A-16J validation không còn error nghiêm trọng.
- A-16L dry-run preview có `blockedByErrorCount = 0`.
- A-16I5 review pack phải `READY_FOR_OWNER_REVIEW`, không phải READY_FOR_OFFICIAL_IMPORT.
- owner đã review thủ công mapping/counts/warnings.
- duplicate/conflict có owner decision.
- parent references ambiguity đã xử lý.
- staging rows, manifest hash, dry-run preview và review pack không stale.
- backup/rollback readiness đã được owner xác nhận trong phase sau.

## Transaction All-Or-Nothing Design

- Official import phải chạy trong một transaction.
- Nếu bất kỳ row nào fail thì rollback toàn bộ.
- Không partial import.
- Không import nếu validation errors còn tồn tại.
- Không import nếu duplicate/conflict chưa review.
- Không import nếu parent reference ambiguity chưa xử lý.
- Không import nếu session đã imported/cancelled/expired.
- Import phải idempotency-safe bằng `import_session_id`, source fingerprint và import manifest hash.
- Không import lại cùng session nếu đã completed.
- Transaction phải tạo audit/revision/rollback manifest trong cùng boundary hoặc fail trước commit.

## People Import Design

- Mỗi staged person tạo `people` thật hoặc link tới existing person theo owner-approved decision.
- Mặc định không auto-merge duplicate.
- Nếu duplicate candidate tồn tại nhưng chưa owner decision, block.
- Map fields từ A-16L dry-run proposed payload, không đọc raw Excel lại.
- Preserve source metadata từ staging/dry-run ở audit/rollback manifest, không đưa raw personal row vào log.
- Living/private fields phải theo privacy policy hiện có.
- Không ghi `notes_private` hoặc public/private fields sai scope.
- Không hard delete existing person; nếu update existing person ở phase sau phải có before snapshot.

## Relationship Import Design

- Parent-child relationships lấy từ `Mã GP Bố` / `Mã GP Mẹ`.
- Chỉ tạo relationship nếu cả parent và child resolve rõ.
- Không tạo relationship nếu parent unresolved.
- Không tạo self-parent.
- Không tạo duplicate parent-child nếu đã tồn tại.
- Không tự tạo spouse/couple từ `Hôn nhân` nếu chưa có owner decision.
- Spouse/couple support sau này phải là phase riêng.
- Bảng thực tế cần tôn trọng model `families`, `family_parents`, `family_children`, `couple_relationships`.

## Graph Validation Policy

- Không cycle cha/mẹ/con.
- Không duplicate parent role nếu business rule không cho phép.
- Không child có quá số lượng cha/mẹ hợp lệ.
- Không relationship trỏ tới person không tồn tại.
- Không phá tree layout hiện có.
- Layout update nếu cần phải là phase sau, hoặc là optional safe layout refresh trong transaction design đã được phê duyệt.
- Có thể tái dùng `wouldCreateAncestorCycle`/relationship validation hiện có trong future runtime.

## Audit / Revision Design

Audit/revision phải ghi:

- actor profile id;
- `import_session_id`;
- source file hash / manifest hash nếu có;
- created person ids;
- created relationship ids;
- skipped/blocked rows;
- timestamp;
- reason/source: `Gia Phả 4 import`;
- before/after hoặc rollback manifest đủ để revert;
- revision model hiện có qua `revisions`, entity types `people`, `families`, `family_parents`, `family_children`, `couple_relationships`.

## Rollback Manifest Design

Rollback manifest phải biết:

- person ids đã tạo mới;
- relationships/families/family_parent/family_child/couple ids đã tạo mới;
- audit/revision ids;
- optional layout/revision impact.

Quy tắc:

- Tạo rollback manifest trước khi commit hoặc trong transaction.
- Không xóa person existing nếu import chỉ link/update.
- Nếu update existing person sau này, cần before snapshot.
- Rollback action thật là phase riêng; A-16M chỉ thiết kế.

## Failure / No-Go Conditions

- validation errors > 0.
- unresolved required parent references.
- duplicate candidates unresolved.
- import session ownership mismatch.
- permission missing.
- manifest hash mismatch.
- dry-run preview outdated.
- review pack outdated.
- official import already completed.
- staging rows changed after owner review.
- tree graph validation fail.
- audit/rollback cannot be created.
- backup/rollback readiness missing.

## Runtime Boundary Design

- Future official import endpoint nếu mở sẽ là POST riêng: `/api/admin/import-sessions/[sessionId]/official-import`.
- Không tạo route này trong A-16M.
- Future service có thể là `lib/import/giapha4/official-import-service.ts`.
- Không tạo service write runtime này trong A-16M.
- Future route phải server-only, authenticated, permission-guarded, RLS-aware.
- Không dùng service role ở client.
- Nếu cần service role server-side hoặc Postgres RPC transaction, phải thiết kế riêng, không implement trong A-16M.
- Nếu import lớn vượt main Worker safe boundary, cân nhắc `genealogy-import-service` hoặc operator tooling trong phase riêng.

## Status

`A16M_STATUS=OFFICIAL_IMPORT_DESIGN_READY_RUNTIME_NOT_OPENED`

## Guardrails

- Không migration.
- Không SQL apply.
- Không DB push.
- Không seed.
- Không people/relationship write.
- Không layout/tree/revision write.
- Không deploy.
- Không push.
