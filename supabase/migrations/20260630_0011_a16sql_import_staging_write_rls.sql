-- A-16SQL-RLS-IMPORT-STAGING-WRITE
-- SQL_CANDIDATE_STATUS=NOT_APPLIED
-- OWNER_REVIEW_REQUIRED_BEFORE_APPLY
-- DO_NOT_RUN_SUPABASE_DB_PUSH
-- DO_NOT_RUN_SUPABASE_DB_PUSH_DRY_RUN_IN_THIS_PHASE
-- DO_NOT_RUN_SUPABASE_MIGRATION_REPAIR
-- NO_SEED_DATA
-- NO_REAL_GENEALOGY_WRITE
-- NO_PEOPLE_RELATIONSHIP_LAYOUT_REVISION_WRITE
-- NO_ANON_OR_PUBLIC_POLICY
-- This candidate opens authenticated, owner-scoped staging writes only for
-- Gia Pha 4 import manifest tables that were manually verified in A-16F5M.
-- It does not disable RLS and does not add grants.

drop policy if exists a16sql_import_sessions_select_own on public.import_sessions;
create policy a16sql_import_sessions_select_own
  on public.import_sessions
  for select
  to authenticated
  using (
    public.has_permission('imports.create')
    and created_by = public.current_profile_id()
  );

drop policy if exists a16sql_import_sessions_insert_own on public.import_sessions;
create policy a16sql_import_sessions_insert_own
  on public.import_sessions
  for insert
  to authenticated
  with check (
    public.has_permission('imports.create')
    and created_by = public.current_profile_id()
    and (updated_by is null or updated_by = public.current_profile_id())
    and approved_by is null
    and approved_at is null
    and status in (
      'preview_generated',
      'rejected_needs_fix'
    )
  );

drop policy if exists a16sql_import_sessions_update_own_preview on public.import_sessions;
create policy a16sql_import_sessions_update_own_preview
  on public.import_sessions
  for update
  to authenticated
  using (
    public.has_permission('imports.create')
    and created_by = public.current_profile_id()
    and approved_by is null
    and approved_at is null
    and status in (
      'preview_generated',
      'owner_reviewing',
      'rejected_needs_fix',
      'expired_preview'
    )
  )
  with check (
    public.has_permission('imports.create')
    and created_by = public.current_profile_id()
    and (updated_by is null or updated_by = public.current_profile_id())
    and approved_by is null
    and approved_at is null
    and status in (
      'preview_generated',
      'owner_reviewing',
      'rejected_needs_fix',
      'expired_preview'
    )
  );

drop policy if exists a16sql_import_session_warnings_select_own_session on public.import_session_warnings;
create policy a16sql_import_session_warnings_select_own_session
  on public.import_session_warnings
  for select
  to authenticated
  using (
    public.has_permission('imports.create')
    and exists (
      select 1
      from public.import_sessions owned_session
      where owned_session.id = import_session_warnings.import_session_id
        and owned_session.created_by = public.current_profile_id()
    )
  );

drop policy if exists a16sql_import_session_warnings_insert_own_session on public.import_session_warnings;
create policy a16sql_import_session_warnings_insert_own_session
  on public.import_session_warnings
  for insert
  to authenticated
  with check (
    public.has_permission('imports.create')
    and exists (
      select 1
      from public.import_sessions owned_session
      where owned_session.id = import_session_warnings.import_session_id
        and owned_session.created_by = public.current_profile_id()
        and owned_session.approved_by is null
        and owned_session.approved_at is null
        and owned_session.status in (
          'preview_generated',
          'rejected_needs_fix'
        )
    )
  );

drop policy if exists a16sql_import_duplicate_candidates_select_own_session on public.import_duplicate_candidates;
create policy a16sql_import_duplicate_candidates_select_own_session
  on public.import_duplicate_candidates
  for select
  to authenticated
  using (
    public.has_permission('imports.create')
    and exists (
      select 1
      from public.import_sessions owned_session
      where owned_session.id = import_duplicate_candidates.import_session_id
        and owned_session.created_by = public.current_profile_id()
    )
  );

drop policy if exists a16sql_import_duplicate_candidates_insert_own_session on public.import_duplicate_candidates;
create policy a16sql_import_duplicate_candidates_insert_own_session
  on public.import_duplicate_candidates
  for insert
  to authenticated
  with check (
    public.has_permission('imports.create')
    and exists (
      select 1
      from public.import_sessions owned_session
      where owned_session.id = import_duplicate_candidates.import_session_id
        and owned_session.created_by = public.current_profile_id()
        and owned_session.approved_by is null
        and owned_session.approved_at is null
        and owned_session.status in (
          'preview_generated',
          'rejected_needs_fix'
        )
    )
  );

drop policy if exists a16sql_import_relationship_candidates_select_own_session on public.import_relationship_candidates;
create policy a16sql_import_relationship_candidates_select_own_session
  on public.import_relationship_candidates
  for select
  to authenticated
  using (
    public.has_permission('imports.create')
    and exists (
      select 1
      from public.import_sessions owned_session
      where owned_session.id = import_relationship_candidates.import_session_id
        and owned_session.created_by = public.current_profile_id()
    )
  );

drop policy if exists a16sql_import_relationship_candidates_insert_own_session on public.import_relationship_candidates;
create policy a16sql_import_relationship_candidates_insert_own_session
  on public.import_relationship_candidates
  for insert
  to authenticated
  with check (
    public.has_permission('imports.create')
    and exists (
      select 1
      from public.import_sessions owned_session
      where owned_session.id = import_relationship_candidates.import_session_id
        and owned_session.created_by = public.current_profile_id()
        and owned_session.approved_by is null
        and owned_session.approved_at is null
        and owned_session.status in (
          'preview_generated',
          'rejected_needs_fix'
        )
    )
  );

drop policy if exists a16sql_import_write_manifests_select_own_session on public.import_write_manifests;
create policy a16sql_import_write_manifests_select_own_session
  on public.import_write_manifests
  for select
  to authenticated
  using (
    public.has_permission('imports.create')
    and exists (
      select 1
      from public.import_sessions owned_session
      where owned_session.id = import_write_manifests.import_session_id
        and owned_session.created_by = public.current_profile_id()
    )
  );

drop policy if exists a16sql_import_write_manifests_insert_own_session on public.import_write_manifests;
create policy a16sql_import_write_manifests_insert_own_session
  on public.import_write_manifests
  for insert
  to authenticated
  with check (
    public.has_permission('imports.create')
    and created_by = public.current_profile_id()
    and approved_by is null
    and approved_at is null
    and completed_at is null
    and status = 'draft'
    and exists (
      select 1
      from public.import_sessions owned_session
      where owned_session.id = import_write_manifests.import_session_id
        and owned_session.created_by = public.current_profile_id()
        and owned_session.approved_by is null
        and owned_session.approved_at is null
        and owned_session.status in (
          'preview_generated',
          'rejected_needs_fix'
        )
    )
  );
