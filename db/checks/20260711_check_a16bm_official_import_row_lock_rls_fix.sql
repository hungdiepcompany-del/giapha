-- A16BM_OFFICIAL_IMPORT_ROW_LOCK_RLS_FIX_SELECT_ONLY_VERIFY
-- SQL_CHECK_STATUS=SELECT_ONLY
-- DO_NOT_MUTATE
-- DO_NOT_INVOKE_OFFICIAL_IMPORT_RPC
-- DO_NOT_LOCK_PRODUCTION_ROWS
-- NO_RAW_PRIVATE_DATA

with policy_catalog as (
  select
    tablename,
    policyname,
    cmd,
    coalesce(qual, '') as qual,
    coalesce(with_check, '') as with_check,
    roles
  from pg_policies
  where schemaname = 'public'
    and tablename in ('import_sessions', 'import_write_manifests')
),
grant_catalog as (
  select
    table_name,
    grantee,
    privilege_type
  from information_schema.role_table_grants
  where table_schema = 'public'
    and table_name in ('import_sessions', 'import_write_manifests')
),
rls_catalog as (
  select
    c.relname as table_name,
    c.relrowsecurity,
    c.relforcerowsecurity
  from pg_class c
  join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public'
    and c.relname in ('import_sessions', 'import_write_manifests')
),
rpc_catalog as (
  select
    p.prosecdef as security_definer,
    pg_get_functiondef(p.oid) as function_definition
  from pg_proc p
  join pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public'
    and p.proname = 'a16p_tx_execute_giapha4_official_import'
),
trigger_catalog as (
  select
    t.tgname,
    pg_get_triggerdef(t.oid) as trigger_definition,
    p.proname as trigger_function_name
  from pg_trigger t
  join pg_class c on c.oid = t.tgrelid
  join pg_namespace n on n.oid = c.relnamespace
  join pg_proc p on p.oid = t.tgfoid
  where not t.tgisinternal
    and n.nspname = 'public'
    and c.relname in ('import_sessions', 'import_write_manifests')
),
booleans as (
  select
    has_table_privilege('authenticated', 'public.import_sessions', 'SELECT') as authenticated_has_select_on_import_sessions,
    has_table_privilege('authenticated', 'public.import_sessions', 'UPDATE') as authenticated_has_update_on_import_sessions,
    has_table_privilege('authenticated', 'public.import_write_manifests', 'SELECT') as authenticated_has_select_on_import_write_manifests,
    has_table_privilege('authenticated', 'public.import_write_manifests', 'UPDATE') as authenticated_has_update_on_import_write_manifests,
    exists (
      select 1 from rls_catalog where table_name = 'import_sessions' and relrowsecurity
    ) as import_sessions_rls_enabled,
    exists (
      select 1 from rls_catalog where table_name = 'import_write_manifests' and relrowsecurity
    ) as import_write_manifests_rls_enabled,
    coalesce((
      select relforcerowsecurity from rls_catalog where table_name = 'import_sessions'
    ), false) as import_sessions_force_rls,
    coalesce((
      select relforcerowsecurity from rls_catalog where table_name = 'import_write_manifests'
    ), false) as import_write_manifests_force_rls,
    exists (
      select 1
      from policy_catalog
      where tablename = 'import_sessions'
        and policyname = 'a16sql_import_sessions_update_own_preview'
        and cmd = 'UPDATE'
        and qual like '%preview_generated%'
        and qual like '%approved_by IS NULL%'
    ) as existing_preview_policy_preserved,
    exists (
      select 1
      from policy_catalog
      where tablename = 'import_sessions'
        and policyname = 'a16bm_import_sessions_update_official_import_owner_lock'
        and cmd = 'UPDATE'
    ) as new_import_sessions_official_update_policy_exists,
    exists (
      select 1
      from policy_catalog
      where tablename = 'import_sessions'
        and policyname = 'a16bm_import_sessions_update_official_import_owner_lock'
        and qual like '%owner_approved_for_db_write%'
        and with_check like '%write_completed%'
    ) as new_session_policy_includes_owner_approved_and_write_completed,
    exists (
      select 1
      from policy_catalog
      where tablename = 'import_sessions'
        and policyname = 'a16bm_import_sessions_update_official_import_owner_lock'
        and qual like '%created_by = public.current_profile_id()%'
        and qual like '%approved_by = public.current_profile_id()%'
        and qual like '%public.has_permission(''imports.create'')%'
    ) as new_session_policy_owner_profile_scoped,
    exists (
      select 1
      from policy_catalog
      where tablename = 'import_write_manifests'
        and policyname = 'a16bm_import_write_manifests_update_official_import_owner_lock'
        and cmd = 'UPDATE'
    ) as new_manifest_update_policy_exists,
    exists (
      select 1
      from policy_catalog
      where tablename = 'import_write_manifests'
        and policyname = 'a16bm_import_write_manifests_update_official_import_owner_lock'
        and qual like '%owner_approved%'
        and qual like '%ready_for_apply%'
        and with_check like '%write_completed%'
    ) as new_manifest_policy_includes_required_states,
    exists (
      select 1
      from policy_catalog
      where tablename = 'import_write_manifests'
        and policyname = 'a16bm_import_write_manifests_update_official_import_owner_lock'
        and qual like '%from public.import_sessions owned_session%'
        and qual like '%owned_session.created_by = public.current_profile_id()%'
        and qual like '%owned_session.status = ''owner_approved_for_db_write''%'
    ) as new_manifest_policy_parent_session_owner_scoped,
    not exists (
      select 1
      from policy_catalog
      where roles::text ~* '(anon|public)'
    ) as no_anon_or_public_policies,
    not exists (
      select 1
      from grant_catalog
      where grantee in ('anon', 'public')
        and privilege_type in ('SELECT', 'INSERT', 'UPDATE', 'DELETE', 'TRUNCATE', 'REFERENCES', 'TRIGGER')
    ) as no_anon_or_public_table_grants,
    exists (
      select 1 from rpc_catalog where security_definer = false
    ) as rpc_remains_security_invoker,
    not exists (
      select 1
      from trigger_catalog
      where trigger_definition ilike '%a16p_tx_execute_giapha4_official_import%'
        or trigger_function_name ilike '%a16p_tx_execute_giapha4_official_import%'
    ) as no_automatic_import_trigger
)
select
  *,
  (
    authenticated_has_select_on_import_sessions
    and authenticated_has_update_on_import_sessions
    and authenticated_has_select_on_import_write_manifests
    and authenticated_has_update_on_import_write_manifests
    and import_sessions_rls_enabled
    and import_write_manifests_rls_enabled
    and existing_preview_policy_preserved
    and new_import_sessions_official_update_policy_exists
    and new_session_policy_includes_owner_approved_and_write_completed
    and new_session_policy_owner_profile_scoped
    and new_manifest_update_policy_exists
    and new_manifest_policy_includes_required_states
    and new_manifest_policy_parent_session_owner_scoped
    and no_anon_or_public_policies
    and no_anon_or_public_table_grants
    and rpc_remains_security_invoker
    and no_automatic_import_trigger
  ) as a16bm_row_lock_rls_fix_verified
from booleans;
