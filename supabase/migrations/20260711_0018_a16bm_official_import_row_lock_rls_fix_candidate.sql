-- A16BM_OFFICIAL_IMPORT_ROW_LOCK_RLS_FIX_CANDIDATE
-- SQL_CANDIDATE_STATUS=NOT_APPLIED
-- OWNER_MANUAL_REVIEW_REQUIRED
-- DO_NOT_RUN_AUTOMATICALLY
-- DO_NOT_RUN_SUPABASE_DB_PUSH
-- DO_NOT_RUN_SUPABASE_MIGRATION_REPAIR
-- NO_SEED_DATA
-- NO_DEPLOY
-- NO_POST_OFFICIAL_IMPORT
-- NO_IMPORT_RPC
-- NO_SESSION_STATE_CHANGE_IN_A16BM
-- NO_REAL_GENEALOGY_WRITE
-- NO_SERVICE_ROLE_EXECUTION
-- NO_SECURITY_DEFINER_SWITCH
-- NO_RLS_DISABLE
-- NO_ANON_OR_PUBLIC_GRANT
-- NO_BROAD_USING_TRUE_POLICY
-- PRESERVE_SELECT_FOR_UPDATE_CONCURRENCY_LOCK
--
-- Purpose:
-- Add the minimum authenticated owner-scoped UPDATE grants and RLS policies
-- needed for the SECURITY INVOKER official import RPC to lock and complete the
-- already owner-approved staging rows. This candidate preserves the existing
-- preview-state policies and does not touch real genealogy table policies.
--
-- Confirmed production metadata before this candidate:
-- - import_sessions_update_policy_exists=true
-- - import_sessions_update_policy_allows_owner_approved_state=false
-- - import_write_manifests_update_policy_exists=false

grant select, update on table public.import_sessions to authenticated;
grant select, update on table public.import_write_manifests to authenticated;

drop policy if exists a16bm_import_sessions_update_official_import_owner_lock
  on public.import_sessions;

create policy a16bm_import_sessions_update_official_import_owner_lock
on public.import_sessions
for update
to authenticated
using (
  public.has_permission('imports.create')
  and public.has_permission('people.create')
  and public.has_permission('relationships.create')
  and public.has_permission('permissions.manage')
  and created_by = public.current_profile_id()
  and approved_by = public.current_profile_id()
  and approved_at is not null
  and approval_marker is not null
  and preview_manifest_hash is not null
  and status = 'owner_approved_for_db_write'
)
with check (
  public.has_permission('imports.create')
  and public.has_permission('people.create')
  and public.has_permission('relationships.create')
  and public.has_permission('permissions.manage')
  and created_by = public.current_profile_id()
  and approved_by = public.current_profile_id()
  and updated_by = public.current_profile_id()
  and approved_at is not null
  and approval_marker is not null
  and preview_manifest_hash is not null
  and status = 'write_completed'
);

drop policy if exists a16bm_import_write_manifests_update_official_import_owner_lock
  on public.import_write_manifests;

create policy a16bm_import_write_manifests_update_official_import_owner_lock
on public.import_write_manifests
for update
to authenticated
using (
  public.has_permission('imports.create')
  and public.has_permission('people.create')
  and public.has_permission('relationships.create')
  and public.has_permission('permissions.manage')
  and approved_by = public.current_profile_id()
  and approved_at is not null
  and approval_marker is not null
  and manifest_hash is not null
  and status in ('owner_approved', 'ready_for_apply')
  and exists (
    select 1
    from public.import_sessions owned_session
    where owned_session.id = import_write_manifests.import_session_id
      and owned_session.created_by = public.current_profile_id()
      and owned_session.approved_by = public.current_profile_id()
      and owned_session.approved_at is not null
      and owned_session.status = 'owner_approved_for_db_write'
  )
)
with check (
  public.has_permission('imports.create')
  and public.has_permission('people.create')
  and public.has_permission('relationships.create')
  and public.has_permission('permissions.manage')
  and approved_by = public.current_profile_id()
  and approved_at is not null
  and completed_at is not null
  and approval_marker is not null
  and manifest_hash is not null
  and jsonb_typeof(created_record_ids) = 'object'
  and status = 'write_completed'
  and exists (
    select 1
    from public.import_sessions owned_session
    where owned_session.id = import_write_manifests.import_session_id
      and owned_session.created_by = public.current_profile_id()
      and owned_session.approved_by = public.current_profile_id()
      and owned_session.approved_at is not null
      and owned_session.status = 'owner_approved_for_db_write'
  )
);

comment on policy a16bm_import_sessions_update_official_import_owner_lock
on public.import_sessions is
  'A-16BM candidate: owner/admin official-import row-lock visibility and write_completed transition for SECURITY INVOKER RPC. NOT_APPLIED.';

comment on policy a16bm_import_write_manifests_update_official_import_owner_lock
on public.import_write_manifests is
  'A-16BM candidate: owner/admin official-import write-manifest row-lock visibility and write_completed transition. NOT_APPLIED.';
