# A-16Q-DUP - Duplicate Candidate Owner Decision Review

Marker: `A-16Q-DUP`

Status: `A16Q_DUP_STATUS=BLOCKED_DUPLICATE_DECISION_RLS_UPDATE_MISSING`

## Mục tiêu

A-16Q-DUP bổ sung màn và API rà soát ứng viên trùng cho import session:

`A16Q_DUP_IMPORT_SESSION_ID=8158711d-1c3c-4208-987d-6fec6a1c5a1a`

Owner evidence hiện tại:

- `row_count=102`
- `person_candidate_count=102`
- `relationship_candidate_count=134`
- `relationship_rows=134`
- `parent_child_relationship_rows=134`
- `blocker_rows=0`
- `warning_rows=45`
- `info_rows=1`
- `unmapped_column_count=0`
- `held_row_count=0`
- `unclear_relationship_rows=0`
- `duplicate_candidate_count=8`
- `unresolved_duplicate_rows=8`
- Relationship candidates: `parent_child / strong / clear = 134`

Không được chạy A-16R khi `unresolved_duplicate_rows > 0`.

## Phạm vi

- Chỉ review staging/import manifest.
- Không chạy official import.
- Không gọi RPC `public.a16p_tx_execute_giapha4_official_import`.
- Không gọi POST `/official-import`.
- Không chạy SQL.
- Không `supabase db push`.
- Không migration repair.
- Không seed.
- Không ghi `people`, `relationships`, `families`, `layout`, `tree`, `revision` hoặc `profile` thật.
- Không auto merge, không auto link.
- Không deploy, không push.
- Không commit Excel, secret, env hoặc storage state.
- Không ghi raw personal rows trong terminal/docs/checker.

## Kết quả inspect

`public.import_duplicate_candidates` đã có các cột review:

- `id`
- `import_session_id`
- `source_row_index`
- `source_person_fingerprint`
- `existing_person_id`
- `match_strength`
- `match_reason_codes`
- `owner_decision`
- `decided_by`
- `decided_at`
- `decision_note`
- `created_at`

RLS hiện có từ A-16SQL cho bảng này chỉ có:

- SELECT owner-scoped.
- INSERT owner-scoped.

Không có policy UPDATE an toàn cho `owner_decision`, `decided_by`, `decided_at`, `decision_note`. Vì vậy phase này không tạo PATCH route active và không bật lưu quyết định trong UI.

## Runtime/UI

Đã thêm GET read-only:

- `GET /api/admin/import-sessions/[sessionId]/duplicates`

Response chỉ đọc gồm:

- `sessionId`
- `totalDuplicateCandidates`
- `unresolvedDuplicateCandidates`
- `candidates[]`
- `canEditDecisions=false`
- `editBlockedReasons[]`
- `canRunOfficialImport=false`

UI import session có block:

- “Ứng viên trùng cần quyết định”
- Tổng ứng viên trùng.
- Số ứng viên chưa có quyết định.
- Danh sách theo `source_row_index`, `match_strength`, `match_reason_codes`, `owner_decision`, `decision_note`.
- Tóm tắt hồ sơ hiện hữu chỉ dùng id rút gọn nếu có; không log raw personal data.
- Nút “Lưu quyết định ứng viên trùng — chưa mở” disabled.

## Decision Rules

Decision mong muốn cho phase sau:

- Final: `create_new`, `link_existing`, `ignore_candidate`.
- Blocking: `unresolved`, `needs_review`.
- Legacy schema aliases đang được giữ trong candidate để tránh phá dữ liệu cũ:
  - `hold` tương đương `needs_review`.
  - `skip` tương đương `ignore_candidate`.

Gate hiện tại:

- `unresolved`, `needs_review` hoặc `hold` đều chặn nhập chính thức.
- `canRunOfficialImport=false`.
- Official import UI button disabled.
- A-16R không được chạy khi còn unresolved duplicate.

## SQL Candidate

Vì thiếu UPDATE RLS an toàn, đã tạo SQL candidate nhưng chưa apply:

- `db/migrations/20260701_0013_a16q_dup_duplicate_decision_rls_candidate.sql`
- `supabase/migrations/20260701_0013_a16q_dup_duplicate_decision_rls_candidate.sql`
- `SQL_CANDIDATE_STATUS=NOT_APPLIED`

Candidate này:

- Mở constraint owner decision cho `needs_review` và `ignore_candidate`.
- Giữ alias legacy `hold` và `skip`.
- Revoke UPDATE rộng từ `authenticated`.
- Grant UPDATE hẹp theo cột:
  `owner_decision`, `decided_by`, `decided_at`, `decision_note`.
- Tạo policy UPDATE owner-scoped qua `imports.create`, `created_by=current_profile_id()`.
- Không thêm anon/public policy hoặc grant.
- Không ghi real genealogy table.
- Không mở official import.

SELECT-only verification file:

- `db/checks/20260701_check_a16q_dup_duplicate_decision_rls.sql`

File check này chỉ đọc catalog/policies/grants sau khi owner apply thủ công trong phase riêng.

## Trạng thái cuối

`A16Q_DUP_STATUS=BLOCKED_DUPLICATE_DECISION_RLS_UPDATE_MISSING`

Màn review duplicate đã có read-only. Lưu quyết định owner vẫn bị khóa cho đến khi có phase apply/verify RLS riêng. Official import vẫn khóa và `canRunOfficialImport=false`.

## Next

Phase tiếp theo cần owner quyết định:

1. Apply thủ công SQL candidate A-16Q-DUP và chạy SELECT-only check.
2. Sau verify PASS mới mở PATCH route staging decision.
3. Sau khi `unresolved_duplicate_rows=0`, mới xét A-16R session-specific official import approval.
