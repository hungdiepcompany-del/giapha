# A-16Q-DUP-RLS-VERIFY-UI-WRITE - Blocked

Marker: `A-16Q-DUP-RLS-VERIFY-UI-WRITE`

Status: `A16Q_DUP_RLS_UI_WRITE_STATUS=BLOCKED_MISSING_OWNER_RLS_APPLY_VERIFY_EVIDENCE`

## Mục tiêu

Phase này kiểm tra có đủ owner evidence để mở lưu quyết định ứng viên trùng hay chưa.

Session đang xét:

`A16Q_DUP_IMPORT_SESSION_ID=8158711d-1c3c-4208-987d-6fec6a1c5a1a`

## Evidence Gate

Prompt hiện tại thiếu ít nhất một trong hai marker bắt buộc:

- `A16Q_DUP_RLS_OWNER_APPLY_CONFIRMED`
- `A16Q_DUP_RLS_VERIFY_PASS_CONFIRMED`

Vì thiếu evidence apply/verify, phase này không được bật runtime write behavior.

## Kết luận

- Không bật PATCH route active.
- Không bật nút lưu decision.
- UI duplicate review vẫn read-only.
- `canEditDecisions=false`.
- `canRunOfficialImport=false`.
- Official import button vẫn disabled.
- A-16R chưa mở.

## Trạng thái A-16Q-DUP trước đó

A-16Q-DUP commit:

`2d8be3783dc1b18af5bc063bbb5b6c8635e84a5f`

Trạng thái trước:

`A16Q_DUP_STATUS=BLOCKED_DUPLICATE_DECISION_RLS_UPDATE_MISSING`

Owner evidence staging đang có:

- `duplicate_candidate_count=8`
- `unresolved_duplicate_rows=8`
- `blocker_rows=0`
- `relationship_rows=134`
- `parent_child_relationship_rows=134`
- Relationship candidates: `parent_child / strong / clear`

Không được chạy A-16R khi `unresolved_duplicate_rows > 0`.

## SQL/RLS Candidate

SQL candidate vẫn chỉ là candidate trong repo:

- `db/migrations/20260701_0013_a16q_dup_duplicate_decision_rls_candidate.sql`
- `supabase/migrations/20260701_0013_a16q_dup_duplicate_decision_rls_candidate.sql`
- `SQL_CANDIDATE_STATUS=NOT_APPLIED` trong file candidate.

SELECT-only check vẫn có sẵn nhưng Codex không chạy SQL trong phase này:

- `db/checks/20260701_check_a16q_dup_duplicate_decision_rls.sql`

Owner cần apply thủ công SQL candidate và xác nhận SELECT-only verification PASS trong prompt sau nếu muốn mở PATCH route.

## Runtime Boundary

Phase blocked này không sửa runtime write behavior:

- Không tạo `PATCH /api/admin/import-sessions/[sessionId]/duplicates/[duplicateId]`.
- Không gọi RPC `public.a16p_tx_execute_giapha4_official_import`.
- Không gọi POST `/official-import`.
- Không chạy official import.
- Không ghi `people`, `relationships`, `families`, `layout`, `tree`, `revision` hoặc `profile` thật.
- Không auto merge.
- Không auto link existing.

## Next

Owner cần cung cấp cả hai marker trong prompt tiếp theo:

- `A16Q_DUP_RLS_OWNER_APPLY_CONFIRMED`
- `A16Q_DUP_RLS_VERIFY_PASS_CONFIRMED`

Sau đó mới mở phase PASS branch để bật PATCH staging write và UI lưu quyết định. Bước sau nữa là owner vào UI quyết định 8 duplicate, rồi chạy `A-16Q-DUP-DECISION-VERIFY` để xác nhận `unresolved_duplicate_rows=0`.
