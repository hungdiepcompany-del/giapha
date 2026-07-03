-- A16V_MARKER_VERIFICATION_FIX_CANDIDATE
-- SQL_CANDIDATE_STATUS=NOT_APPLIED
-- DO_NOT_RUN_AUTOMATICALLY
-- OWNER_MANUAL_REVIEW_REQUIRED
-- DO_NOT_RUN_SUPABASE_DB_PUSH
-- DO_NOT_RUN_SUPABASE_MIGRATION_REPAIR
-- NO_SEED_DATA
-- NO_OFFICIAL_IMPORT_EXECUTION
-- NO_RPC_CALL
-- NO_REAL_GENEALOGY_WRITE
-- COMMENT_ONLY_MARKER_FIX
--
-- Owner verification showed only `A16V marker = FAIL` while the transaction,
-- security and schema branch checks were PASS. The marker was present in the
-- SQL file header, but it was not persisted into database metadata after the
-- function was applied. This candidate persists the exact marker in the
-- function comment only. It does not change transaction logic, permissions,
-- RLS, grants, triggers or data.

comment on function public.a16p_tx_execute_giapha4_official_import(
  uuid,
  text,
  text,
  text,
  boolean,
  boolean,
  boolean,
  boolean
) is
  'A16V_OFFICIAL_IMPORT_REAL_TRANSACTION_EXECUTION_BRANCH_CANDIDATE; A16V_MARKER_VERIFICATION_FIX_CANDIDATE; SQL_CANDIDATE_STATUS=NOT_APPLIED; canonical RPC for Gia Pha 4 official import real transaction branch; marker persisted for SELECT-only verification; no logic, grant, RLS, trigger or data change in marker fix.';
