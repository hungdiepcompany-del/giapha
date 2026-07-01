# PLAN A-16P - Official Import Runtime Candidate

Marker: `A-16P`

Owner marker in prompt: `APPROVE_A16P_OFFICIAL_IMPORT_RUNTIME_CANDIDATE`

Runtime marker: `A16P_OFFICIAL_IMPORT_RUNTIME_CANDIDATE`

## Mục Tiêu

A-16P tạo ứng viên runtime nhập chính thức từ Gia Phả 4 staging sang bảng gia
phả thật để review code, nhưng không chạy import thật, không bật UI, không
deploy và không push.

## Scope Candidate

- Service candidate: `lib/import/giapha4/official-import-service.ts`.
- POST route candidate:
  `app/api/admin/import-sessions/[sessionId]/official-import/route.ts`.
- UI chỉ cập nhật trạng thái khóa trong block `Cổng nhập chính thức`.
- Không có button active, không có onClick, không có form submit gọi POST.

## Feature Flag / Locked Behavior

Route POST mặc định bị khóa bởi server-side flag:

`A16P_OFFICIAL_IMPORT_RUNTIME_CANDIDATE_ENABLED=false`

Khi flag không bật, route trả HTTP `423`:

`Nhập chính thức chưa được bật trong môi trường này.`

Kể cả khi flag được bật trong tương lai, route vẫn yêu cầu body có:

- `confirmMarker = APPROVE_A16P_OFFICIAL_IMPORT_RUNTIME_CANDIDATE`;
- `confirmSessionId` khớp session id;
- `confirmNoValidationErrors = true`;
- `confirmRollbackReviewed = true`;
- `confirmAuditReviewed = true`.

## Permission Boundary

Route yêu cầu user đã đăng nhập và có bộ quyền chặt hiện có:

- `imports.create`;
- `people.create`;
- `relationships.create`;
- `permissions.manage`.

A-16P không seed permission mới và không tạo migration permission mới. Một
permission riêng cho official import nên được thiết kế ở phase sau nếu owner
muốn tách khỏi `permissions.manage`.

## Service Candidate

Service chỉ đọc:

- import manifest staging;
- validation review;
- dry-run mapping preview;
- review pack.

Service không đọc Excel lại, không parse `.xls`, không ghi `people`,
`families`, `family_parents`, `family_children`, `couple_relationships`,
`tree_layouts`, `revisions` hoặc `profiles`.

Service không auto merge duplicates và không tự tạo spouse/couple từ
`Hôn nhân`.

## Transaction Capability

Kết quả kiểm tra code hiện có:

- People service hiện dùng Supabase client insert rời và log revision sau đó.
- Relationship service hiện dùng Supabase client insert rời và log revision sau
  đó.
- Revision service hiện insert rời vào `revisions`.
- Chưa có RPC/transaction helper an toàn để ghi nhiều bảng all-or-nothing.

Vì vậy A-16P không fake transaction và không implement best-effort insert.

Current blocker:

`A16P_BLOCKED_TRANSACTION_HELPER_MISSING`

Status:

`A16P_STATUS=BLOCKED_TRANSACTION_HELPER_MISSING`

## No-Go Conditions

Official import vẫn bị chặn nếu có bất kỳ điều kiện nào:

- thiếu feature flag;
- thiếu confirm marker/body;
- validation errors > 0;
- dry-run `blockedByErrorCount > 0`;
- review pack không `READY_FOR_OWNER_REVIEW`;
- duplicate/conflict chưa có quyết định owner;
- parent reference chưa rõ;
- session không hợp lệ, không thuộc quyền truy cập hoặc không ở trạng thái
  staging phù hợp;
- thiếu quyền;
- rollback manifest không tạo được;
- audit/revision manifest không tạo được;
- graph validation fail;
- transaction helper missing.

## Rollback / Audit Status

Rollback manifest hiện chỉ là preview trong response service:

- `rollbackManifestPreview.available=false`;
- blocker `A16P_BLOCKED_TRANSACTION_HELPER_MISSING`.

Audit manifest hiện chỉ là preview trong response service:

- `auditManifestPreview.available=false`;
- blocker `A16P_BLOCKED_TRANSACTION_HELPER_MISSING`.

Rollback/audit thật cần cùng transaction hoặc fail trước commit trong phase sau.

## UI Status

UI vẫn disabled:

- `Ứng viên nhập chính thức đã được chuẩn bị nhưng chưa được bật.`
- `Chưa chạy nhập chính thức.`
- `Cần xác nhận phiên nhập, lỗi/cảnh báo, rollback và audit trước khi chạy.`
- `Nút nhập chính thức vẫn khóa trong phase này.`

## Validation Boundary

A-16P validation không gọi POST official import route, không chạy import thật và
không tạo output `IMPORT_COMPLETED`.

## Guardrails Held

- Không chạy import thật.
- Không ghi people/person thật.
- Không ghi relationships/families thật.
- Không ghi layout/tree/revision/profile thật.
- Không migration.
- Không DB push.
- Không SQL apply.
- Không seed.
- Không deploy.
- Không push.
- Không commit Excel/storage state/cookie/token/secret.
- Không log raw personal rows.

## Next Phase

Vì transaction helper đang thiếu, bước tiếp theo an toàn là:

`A-16P-TX` - transaction RPC/schema readiness cho official import.

Chỉ sau khi transaction/rollback/audit helper được owner phê duyệt và verified,
mới mở `A-16Q` cho approval chạy theo session id cụ thể với marker execution
mới.
