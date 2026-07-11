-- A16BR_REVISIONS_INSERT_RLS_AND_ANON_GRANT_CLEANUP
-- SQL_CANDIDATE_STATUS=NOT_APPLIED
-- OWNER_MANUAL_REVIEW_REQUIRED
-- DO_NOT_RUN_AUTOMATICALLY
-- DO_NOT_RUN_SUPABASE_DB_PUSH
-- DO_NOT_RUN_SUPABASE_MIGRATION_REPAIR
-- NO_SEED_DATA
-- NO_DEPLOY
-- NO_POST_OFFICIAL_IMPORT
-- NO_IMPORT_RPC
-- NO_SESSION_STATE_CHANGE_IN_A16BR
-- NO_REAL_GENEALOGY_WRITE
-- NO_AUTHENTICATED_GRANT_CHANGE
-- NO_SERVICE_ROLE_CHANGE
-- NO_RLS_DISABLE
-- NO_FORCE_RLS
-- NO_ANON_OR_PUBLIC_POLICY
--
-- Purpose:
-- Add the narrow authenticated INSERT RLS policy needed for the SECURITY
-- INVOKER official-import RPC to write its A-16V people/families revision
-- markers, and revoke the remaining confirmed anon/PUBLIC table privileges
-- from the eight downstream RPC tables.

drop policy if exists a16br_revisions_insert_official_import_create
  on public.revisions;

create policy a16br_revisions_insert_official_import_create
on public.revisions
for insert
to authenticated
with check (
  public.has_permission('imports.create')
  and public.has_permission('permissions.manage')
  and changed_by = public.current_profile_id()
  and action = 'create'
  and entity_type in ('people', 'families')
  and (
    (entity_type = 'people' and public.has_permission('people.create'))
    or (entity_type = 'families' and public.has_permission('relationships.create'))
  )
  and before_json is null
  and change_reason = 'A-16V official import candidate'
  and jsonb_typeof(after_json) = 'object'
  and after_json ->> 'source' = 'A-16V Gia Pha 4 official import candidate'
  and after_json ? 'import_session_id'
  and (after_json ->> 'import_session_id') ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
  and (
    (entity_type = 'people' and after_json ? 'source_row_index')
    or (entity_type = 'families' and after_json ? 'child_source_row_index')
  )
  and exists (
    select 1
    from public.import_sessions owned_session
    where owned_session.id::text = lower(after_json ->> 'import_session_id')
      and owned_session.created_by = public.current_profile_id()
      and owned_session.status in (
        'ready_for_owner_approval',
        'owner_approved_for_db_write'
      )
  )
);

comment on policy a16br_revisions_insert_official_import_create
on public.revisions is
  'A-16BR candidate: narrow authenticated A-16V official-import revision INSERT policy for people/families create audit rows only.';

revoke all privileges on table public.families from anon;
revoke all privileges on table public.families from public;

revoke all privileges on table public.family_children from anon;
revoke all privileges on table public.family_children from public;

revoke all privileges on table public.family_parents from anon;
revoke all privileges on table public.family_parents from public;

revoke all privileges on table public.people from anon;
revoke all privileges on table public.people from public;

revoke all privileges on table public.revisions from anon;
revoke all privileges on table public.revisions from public;

revoke all privileges on table public.import_session_warnings from anon;
revoke all privileges on table public.import_session_warnings from public;

revoke all privileges on table public.import_duplicate_candidates from anon;
revoke all privileges on table public.import_duplicate_candidates from public;

revoke all privileges on table public.import_relationship_candidates from anon;
revoke all privileges on table public.import_relationship_candidates from public;
