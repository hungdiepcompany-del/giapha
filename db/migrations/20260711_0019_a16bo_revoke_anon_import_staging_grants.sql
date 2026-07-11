-- A16BO_REVOKE_ANON_IMPORT_STAGING_GRANTS
-- SQL_CANDIDATE_STATUS=NOT_APPLIED
-- OWNER_MANUAL_REVIEW_REQUIRED
-- DO_NOT_RUN_AUTOMATICALLY
-- DO_NOT_RUN_SUPABASE_DB_PUSH
-- DO_NOT_RUN_SUPABASE_MIGRATION_REPAIR
-- NO_SEED_DATA
-- NO_DEPLOY
-- NO_POST_OFFICIAL_IMPORT
-- NO_IMPORT_RPC
-- NO_SESSION_STATE_CHANGE_IN_A16BO
-- NO_REAL_GENEALOGY_WRITE
-- NO_POLICY_CHANGE
-- NO_RLS_CHANGE
--
-- Purpose:
-- Revoke the anonymous/PUBLIC table privileges that remained after the
-- owner-applied A-16BM row-lock RLS migration. This candidate preserves the
-- authenticated SELECT/UPDATE grants and does not alter policies or RLS.

revoke all privileges on table public.import_sessions from anon;
revoke all privileges on table public.import_sessions from public;
revoke all privileges on table public.import_write_manifests from anon;
revoke all privileges on table public.import_write_manifests from public;
