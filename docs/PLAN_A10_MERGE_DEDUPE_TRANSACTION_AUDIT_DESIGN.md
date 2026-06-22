# Plan A-10 - Merge/Dedupe Transaction & Audit Design

Status: `PASS_DESIGN_READINESS`

## Summary

A-10 chỉ là phase thiết kế/readiness cho việc xử lý thành viên nghi trùng trong
tương lai. A-10 không implement runtime merge, không thay đổi DB/schema và
không ghi dữ liệu.

Các mức độ nghi trùng, transaction, audit, rollback, quyền và UI dưới đây là
hợp đồng đề xuất để review. Chúng không cấp quyền thực thi và không mở bất kỳ
route, action hoặc service merge nào.

## User problem

Khi nhập gia phả lâu dài, có thể tạo trùng cùng một người do nhiều người nhập,
tên giống nhau, thiếu năm sinh, hoặc thêm nhanh từ Cây gia phả. Tuy nhiên, cùng
tên không đồng nghĩa cùng người: một gia đình có thể có nhiều thành viên trùng
tên, gần năm sinh hoặc cùng chi nhánh.

Hệ thống cần giúp người quản trị tìm và so sánh ứng viên mà không biến tín hiệu
không chắc chắn thành thao tác phá hủy dữ liệu.

## Data objects impacted

Một merge tương lai phải lập manifest ảnh hưởng trước transaction cho các nhóm
dữ liệu hiện có hoặc đã được định hướng trong repo:

| Nhóm dữ liệu | Ảnh hưởng phải review |
| --- | --- |
| People/person records | ID, slug, tên, ngày sinh/mất, trạng thái còn sống, tiểu sử, visibility, audit fields, soft-delete state và trường riêng tư của source/target. |
| Relationships | `families`, `family_parents`, `family_children`, `couple_relationships`; role, loại quan hệ, nguồn/ghi chú, visibility, thứ tự và soft-delete state. |
| Tree layout | `tree_layout_nodes.person_id`, node ID, vị trí và tham chiếu layout. Layout là dữ liệu UI, không được dùng để suy diễn hay sửa quan hệ thật. |
| Clan/branch/generation membership | `branch_name`, `generation_number` hiện có và các membership gia phả Việt Nam tương lai; xung đột không được tự chọn. |
| Revision/history | Revision cũ phải tiếp tục truy vết được source và target; merge và rollback cần event riêng, actor và correlation `merge_id`. |
| Export JSON/GEDCOM/ZIP | Stable ID, slug, relationship reference, manifest và compatibility mapping phải bảo toàn; source ID cần alias/tombstone có chủ đích thay vì biến mất không dấu vết. |
| Privacy/public visibility | Không được nâng mức công khai do merge. Khác biệt `public`/`family`/`private`, living status và dữ liệu nhạy cảm là conflict bắt buộc review. |
| Data quality warnings | Candidate/warning cũ phải được resolve hoặc liên kết với `merge_id`; warning chỉ là bằng chứng hỗ trợ, không phải lệnh merge. |
| Backup/restore | Phải có backup readiness, pre-merge snapshot/manifest và kiểm tra restore trước khi mở production mutation. |

Các bảng media, events và sources đang được định hướng cũng phải được thêm vào
impact manifest nếu đã tồn tại lúc runtime được thiết kế. Không được bỏ qua một
tham chiếu chỉ vì A-10 chưa có schema cho nó.

## Candidate detection design

### Strong match

- Họ tên normalized giống nhau.
- Năm sinh giống hoặc rất gần, có xét độ chính xác của ngày.
- Năm mất giống hoặc rất gần, có xét độ chính xác của ngày.
- Quan hệ cha/mẹ, vợ/chồng/bạn đời hoặc con gần giống.

Strong chỉ hợp lệ khi có nhiều tín hiệu tương thích; tên giống nhau đơn lẻ
không đủ.

### Medium match

- Họ tên gần giống sau khi chuẩn hóa dấu, khoảng trắng và token.
- Cùng đời/thế hệ/chi nhánh nếu có.
- Một số dữ liệu sinh/mất thiếu nhưng ngữ cảnh gia đình tương thích.

### Weak match

- Chỉ trùng tên hoặc tên gần giống.
- Thiếu nhiều dữ liệu xác thực hoặc thiếu ngữ cảnh quan hệ.

Strong/medium/weak chỉ là gợi ý ưu tiên review. Không auto merge. Candidate
detection không được block người dùng tạo mới vì gia đình thật có thể có người
trùng tên. Tín hiệu mâu thuẫn về cha/mẹ, vợ/chồng, chi, đời, trạng thái sống,
visibility hoặc nguồn tư liệu phải hạ confidence và đưa vào review.

Người được xem gợi ý phải là operator đã đăng nhập và đã có quyền xem toàn bộ
dữ liệu nền tạo ra gợi ý. Candidate response không được làm lộ private notes,
source notes hoặc quan hệ mà người đó không được xem.

## Merge policy

Một yêu cầu tương lai phải xác định rõ:

- `source_person`: bản ghi được khôi phục độc lập trong rollback và không được
  xóa cứng.
- `target_person`: identity canonical dự kiến sau khi người duyệt xác nhận.
- `winning fields`: lựa chọn rõ theo từng field, kèm provenance và người chọn.
- `conflicting fields`: cả hai giá trị, visibility, nguồn, lý do chọn hoặc trạng
  thái chưa giải quyết.
- `relationships to move/copy`: từng relationship reference và kết quả dự kiến,
  không cập nhật hàng loạt mù.
- `layout references`: mapping node source sang target hoặc quyết định giữ node;
  không trộn layout với quan hệ thật.
- `branch memberships`: lựa chọn giữ riêng/hợp nhất có review; generation phải
  được kiểm tra lại theo quan hệ.
- `revision trail`: giữ lịch sử của cả source và target, thêm event request,
  approval, execution và rollback.
- `export identity`: target stable ID, source alias/tombstone và mapping tương
  thích cho JSON/GEDCOM/ZIP.

Nguyên tắc bắt buộc:

- Không mất dữ liệu.
- Không ghi đè field có dữ liệu bằng field trống.
- Không tự hợp nhất `notes_private`, source notes hoặc tài liệu nguồn.
- Mọi conflict phải hiển thị cho người duyệt và có lựa chọn rõ.
- Quan hệ trùng chỉ được dedupe sau khi so sánh family, role, type, thời gian,
  visibility, notes và provenance.
- Chặn transaction nếu kết quả tạo self-relationship, vòng tổ tiên, quan hệ đôi
  bất hợp lý, generation mâu thuẫn chưa giải quyết hoặc reference mồ côi.
- Không tự xóa thành viên.
- Không tự xóa quan hệ.

Transaction tương lai phải chạy all-or-nothing với lock/version check cho cả
source và target, lưu snapshot trước mutation, tính impact manifest, validate
graph trước và sau, ghi audit trong cùng transaction, và hỗ trợ idempotency bằng
`merge_id`. Nếu bất kỳ bước nào thất bại thì rollback toàn transaction; không
được để trạng thái merge một phần.

## Audit design

Audit record tương lai phải bất biến, riêng tư theo quyền và lưu ít nhất:

- `merge_id`
- `source_person_id`
- `target_person_id`
- `requested_by`
- `approved_by`
- `executed_by`
- `requested_at`
- `approved_at`
- `executed_at`
- `reason`
- `confidence_level`
- `field_changes`
- `relationship_changes`
- `layout_changes`
- `branch_generation_changes`
- `export_impact`
- `rollback_snapshot_manifest`

Mỗi change entry cần có entity/table, stable ID, before/after, quyết định
keep/move/copy/dedupe, provenance và visibility. Audit phải phân biệt người đề
xuất, người phê duyệt, người thực thi; production không được để một approval
ngầm thay cho các actor fields. Dữ liệu nhạy cảm trong audit không public và
phải tuân thủ cùng hoặc chặt hơn quyền của dữ liệu gốc.

A-10 không tạo bảng audit thật.

## Rollback design

Rollback tương lai phải dùng `rollback_snapshot_manifest` đã tạo trước merge để:

- Khôi phục source person với ID, slug, field, soft-delete state và provenance.
- Khôi phục relationships cùng ID, family link, role/type, notes, visibility và
  thứ tự trước merge.
- Khôi phục layout references và trạng thái node mà không sửa quan hệ thật.
- Khôi phục branch/generation memberships.
- Khôi phục public/private visibility và living-person privacy.
- Ghi revision rollback event liên kết `merge_id`, actor, reason và kết quả
  kiểm tra sau rollback.

Rollback phải là transaction có preflight. Nếu target hoặc entity liên quan đã
được sửa sau merge, hệ thống phải phát hiện version conflict và chuyển sang
manual reconciliation; không được ghi đè thay đổi mới một cách âm thầm. Export
mapping và warning resolution cũng phải được đảo hoặc ghi phiên bản kế tiếp.

Rollback chỉ an toàn nếu có snapshot/manifest trước merge. Không cho merge
production nếu không có rollback design được duyệt, backup readiness, restore
check và post-rollback graph/privacy verification.

## Permission and approval gate

Các permission đề xuất cho phase tương lai, chưa đăng ký runtime trong A-10:

- `people.merge.suggest`: xem candidate trong phạm vi dữ liệu đã được phép xem.
- `people.merge.review`: xem comparison, conflict và impact manifest.
- `people.merge.approve`: phê duyệt một request đã đầy đủ conflict resolution.
- `people.merge.execute`: thực thi request đã được phê duyệt và chưa stale.
- `people.merge.rollback`: chạy rollback có preflight và audit riêng.

Người đề xuất cần quyền suggest/review phù hợp. Người phê duyệt phải là OWNER
hoặc vai trò high-trust được owner cấu hình rõ; execute/rollback phải được kiểm
tra server-side và không suy ra từ việc UI hiển thị nút. Production nên áp dụng
separation of duties: requester không tự phê duyệt request của chính mình, trừ
khi policy khẩn cấp được owner duyệt và audit riêng.

Các marker owner approval tuần tự:

1. `APPROVE_A10_MERGE_DEDUPE_RUNTIME_DESIGN`
2. `APPROVE_A11_MERGE_DEDUPE_SCHEMA`
3. `APPROVE_A12_MERGE_DEDUPE_RUNTIME`

Marker trong tài liệu chỉ là tên gate, không phải approval đã được cấp. A-10
không cấp quyền mới. A-10 không mở route/action/service merge. Không merge nếu
chưa có audit/rollback. Không merge nếu chưa có quyền và phê duyệt rõ. Không
merge production nếu chưa có smoke/browser test và backup readiness.

## Future UI design

UI tương lai phải có các bước tách biệt, không implement trong A-10:

1. Màn `Nghi trùng thành viên`: danh sách candidate, confidence, lý do và lựa
   chọn bỏ qua/không phải cùng người.
2. Màn `So sánh thành viên`: so sánh field và provenance theo hai cột, không lộ
   dữ liệu vượt quyền.
3. Màn chọn dữ liệu: từng field có `Giữ thông tin này`; trường khác nhau hiển
   thị `Xung đột dữ liệu` và không có default phá hủy.
4. Màn quan hệ: hiển thị `Quan hệ bị ảnh hưởng`, quan hệ trùng, vòng hoặc conflict
   dự kiến.
5. Màn request/review: `Yêu cầu gộp` tạo request; `Phê duyệt gộp` chỉ hoạt động
   khi conflict, audit, backup và rollback gates đầy đủ.
6. Màn execute: `Thực hiện gộp` yêu cầu xác nhận cuối, version freshness và hiển
   thị toàn bộ impact manifest.
7. Màn audit: timeline actor/timestamp/change và `Hoàn tác gộp` với rollback
   preflight, conflict report và xác nhận riêng.

Không có nút auto-merge hoặc hành động merge ngay từ candidate list. Same-name
candidate luôn có đường `Không phải cùng người` và không block tạo người mới.

## Deferred items

- Runtime merge.
- Schema audit table.
- SQL migration.
- DB apply.
- Merge UI thật.
- Rollback thật.
- Production data mutation.
- Permission runtime.
- Deploy.

Guard tóm tắt: Không runtime merge. Không DB apply. Không migration. Không auto
merge. Không tự xóa thành viên. Không tự xóa quan hệ.

## Readiness decision

Merge/dedupe runtime remains closed until explicit approval, audit, rollback
and schema gates are approved. A phase sau chỉ được mở khi marker trước đó được
owner cấp rõ, thiết kế được review và checker/smoke tương ứng PASS; việc marker
xuất hiện trong doc này không tự mở gate.

## Recommended next phase

Chờ owner review A-10. Nếu được cấp
`APPROVE_A10_MERGE_DEDUPE_RUNTIME_DESIGN`, phase kế tiếp phù hợp là A-11
schema candidate/docs/checker riêng cho audit, snapshot, alias và transaction
contract; vẫn chưa DB apply hoặc runtime merge cho tới các approval tiếp theo.
