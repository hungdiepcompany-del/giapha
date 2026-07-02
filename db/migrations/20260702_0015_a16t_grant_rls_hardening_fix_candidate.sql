-- A16T_GRANT_RLS_HARDENING_FIX_CANDIDATE
-- SQL_CANDIDATE_STATUS=NOT_APPLIED
-- DO_NOT_RUN_AUTOMATICALLY
-- OWNER_MANUAL_REVIEW_REQUIRED
-- DO_NOT_RUN_SUPABASE_DB_PUSH
-- DO_NOT_RUN_SUPABASE_MIGRATION_REPAIR
-- NO_SEED_DATA
-- NO_REAL_GENEALOGY_WRITE
-- NO_PEOPLE_RELATIONSHIP_FAMILY_LAYOUT_REVISION_WRITE
-- NO_ANON_OR_PUBLIC_GRANT
-- NO_BROAD_GRANT
-- NO_RLS_DISABLE
-- NO_OFFICIAL_IMPORT_EXECUTION
-- Purpose: remove inherited/default anon and PUBLIC grants from the A-16T
-- official import audit/rollback tables after owner verification reported:
-- A16T_NO_ANON_OR_PUBLIC_POLICY_OR_GRANT=FAIL
-- details={"forbidden_grant_count":14,"forbidden_policy_count":0}
--
-- This candidate intentionally preserves authenticated policies and does not
-- grant new privileges. Both A-16T tables use uuid primary keys with
-- gen_random_uuid(), so no table-owned identity/serial sequence is expected.
-- If a future schema revision adds table-owned sequences, run the SELECT-only
-- verification file before deciding whether a sequence-specific revoke
-- candidate is needed.

revoke all on table public.official_import_batches from anon;
revoke all on table public.official_import_batches from public;

revoke all on table public.official_import_rollback_manifests from anon;
revoke all on table public.official_import_rollback_manifests from public;
