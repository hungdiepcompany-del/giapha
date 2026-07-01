# PLAN A-16P-TX-APPLY-VERIFY - Manual SQL Apply Verification Record

Marker: `A-16P-TX-APPLY-VERIFY`

Status: `A16P_TX_APPLY_VERIFY_STATUS=PASS_OWNER_CONFIRMED`

## Mục tiêu

Ghi nhận owner đã apply thủ công SQL A-16P-TX trên Supabase và đã chạy
verification SELECT-only với kết quả PASS. Phase này chỉ là tài liệu và checker.

Phase này không chạy SQL, không gọi RPC, không gọi POST official import và
không mở nhập chính thức.

## Bối cảnh đã xác nhận bởi owner

- A-16P-TX commit:
  `e86efb0 db: add official Gia Pha 4 import transaction helper candidate`.
- Owner đã chạy thủ công SQL:
  `db/migrations/20260701_0012_a16p_tx_official_import_transaction_helper_candidate.sql`.
- Owner đã chạy verification:
  `db/checks/20260701_check_a16p_tx_official_import_transaction_helper.sql`.
- Owner manual apply PASS.
- Verification PASS.

## Kết quả verification được owner báo PASS

- Function `public.a16p_tx_execute_giapha4_official_import` exists.
- Function is not `SECURITY DEFINER`.
- Function has fixed `search_path=public, pg_temp`.
- No `EXECUTE` for `anon` or `public`.
- Function fails closed.
- No A-16P policy on real tables.
- No auto import trigger.

## Trạng thái function sau manual apply

RPC exists but fail-closed:

`public.a16p_tx_execute_giapha4_official_import`

Function comment vẫn còn guardrail cũ ghi `NOT_APPLIED`. Đây là nhãn an toàn
từ SQL candidate ban đầu, không phải bằng chứng rằng owner chưa apply. Trạng
thái phase này ghi nhận owner đã apply thủ công và verification PASS, nhưng
function vẫn fail-closed và không mở nhánh ghi dữ liệu thật.

Các guard vẫn giữ:

- `can_run_official_import=false`.
- `created_people_count=0`.
- `created_relationship_count=0`.
- `REAL_EXECUTION_BRANCH_NOT_OPEN_IN_A16P_TX`.

## Official import vẫn locked

- Official import still locked.
- `canRunOfficialImport=false`.
- UI button disabled.
- Runtime route vẫn bị khóa bởi
  `A16P_OFFICIAL_IMPORT_RUNTIME_CANDIDATE_ENABLED`.
- Không có client/script nào gọi POST official import trong phase này.
- Không có client/script nào gọi RPC trong phase này.

## Ranh giới giữ nguyên

- No SQL run.
- No DB push.
- No migration repair.
- No seed.
- No RPC call.
- No POST official import call.
- No real genealogy writes.
- Không ghi people/person thật.
- Không ghi relationships/families thật.
- Không ghi layout/tree/revision/profile thật.
- Không deploy.
- Không push.
- Không commit secret/env/Excel/storage state.
- Không sửa runtime behavior.

## Supabase note

Supabase changelog gần đây có thay đổi về việc table mới không tự expose ra
Data/GraphQL API. Phase này không tạo bảng mới trong code, không thêm grant,
không mở public/anon execute và không đổi RLS, nên không có hành động runtime
hoặc schema bổ sung trong phase này.

## Next phase

Next phase: A-16Q Session-specific Official Import Execution Approval.

Required future marker:

`APPROVE_A16Q_OFFICIAL_IMPORT_SESSION_EXECUTION`

A-16Q chỉ được mở khi owner chỉ định session cụ thể và xác nhận rõ ràng rằng
official import execution được phép. A-16P-TX-APPLY-VERIFY không tự mở A-16Q.
