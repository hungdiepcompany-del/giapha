-- A16BO_REVOKE_ANON_IMPORT_STAGING_GRANTS_SELECT_ONLY_VERIFY
-- SQL_CHECK_STATUS=SELECT_ONLY
-- DO_NOT_MUTATE
-- DO_NOT_INVOKE_OFFICIAL_IMPORT_RPC
-- DO_NOT_LOCK_PRODUCTION_ROWS
-- NO_RAW_PRIVATE_DATA

with policy_catalog_raw as (
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
policy_catalog as (
  select
    tablename,
    policyname,
    cmd,
    roles,
    lower(regexp_replace(regexp_replace(qual, '::[a-zA-Z_][a-zA-Z0-9_]*(\[\])?', '', 'g'), '[[:space:]]+', ' ', 'g')) as normalized_qual,
    lower(regexp_replace(regexp_replace(with_check, '::[a-zA-Z_][a-zA-Z0-9_]*(\[\])?', '', 'g'), '[[:space:]]+', ' ', 'g')) as normalized_with_check
  from policy_catalog_raw
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
    p.prosecdef as security_definer
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
forbidden_counts as (
  select
    (
      select count(*)::integer
      from grant_catalog
      where lower(grantee) in ('anon', 'public')
        and privilege_type in ('SELECT', 'INSERT', 'UPDATE', 'DELETE', 'TRUNCATE', 'REFERENCES', 'TRIGGER')
    ) as forbidden_anon_public_table_grant_count,
    (
      select count(*)::integer
      from policy_catalog pc
      where exists (
        select 1
        from unnest(pc.roles) as policy_role(role_name)
        where lower(policy_role.role_name::text) in ('anon', 'public')
      )
    ) as forbidden_anon_public_policy_count
),
booleans as (
  select
    forbidden_counts.forbidden_anon_public_table_grant_count,
    forbidden_counts.forbidden_anon_public_policy_count,
    forbidden_counts.forbidden_anon_public_table_grant_count = 0 as no_anon_or_public_table_grants,
    forbidden_counts.forbidden_anon_public_policy_count = 0 as no_anon_or_public_policies,
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
    exists (
      select 1
      from policy_catalog
      where tablename = 'import_sessions'
        and policyname = 'a16bm_import_sessions_update_official_import_owner_lock'
        and cmd = 'UPDATE'
    ) as a16bm_import_sessions_policy_exists,
    exists (
      select 1
      from policy_catalog
      where tablename = 'import_write_manifests'
        and policyname = 'a16bm_import_write_manifests_update_official_import_owner_lock'
        and cmd = 'UPDATE'
    ) as a16bm_import_write_manifests_policy_exists,
    exists (
      select 1
      from policy_catalog
      where tablename = 'import_sessions'
        and policyname = 'a16bm_import_sessions_update_official_import_owner_lock'
        and normalized_qual like '%created_by = current_profile_id()%'
        and normalized_qual like '%approved_by = current_profile_id()%'
        and normalized_qual like '%has_permission(''imports.create'')%'
        and normalized_qual like '%owner_approved_for_db_write%'
        and normalized_with_check like '%write_completed%'
    ) as a16bm_session_policy_semantics_pass,
    exists (
      select 1
      from policy_catalog
      where tablename = 'import_write_manifests'
        and policyname = 'a16bm_import_write_manifests_update_official_import_owner_lock'
        and normalized_qual like '%from import_sessions owned_session%'
        and normalized_qual like '%owned_session.created_by = current_profile_id()%'
        and normalized_qual like '%owned_session.approved_by = current_profile_id()%'
        and normalized_qual like '%owner_approved_for_db_write%'
        and normalized_qual like '%owner_approved%'
        and normalized_qual like '%ready_for_apply%'
        and normalized_with_check like '%write_completed%'
    ) as a16bm_manifest_policy_semantics_pass,
    exists (
      select 1 from rpc_catalog where security_definer = false
    ) as rpc_remains_security_invoker,
    not exists (
      select 1
      from trigger_catalog
      where trigger_definition ilike '%a16p_tx_execute_giapha4_official_import%'
        or trigger_function_name ilike '%a16p_tx_execute_giapha4_official_import%'
    ) as no_automatic_import_trigger
  from forbidden_counts
)
select
  *,
  (
    no_anon_or_public_table_grants
    and no_anon_or_public_policies
    and authenticated_has_select_on_import_sessions
    and authenticated_has_update_on_import_sessions
    and authenticated_has_select_on_import_write_manifests
    and authenticated_has_update_on_import_write_manifests
    and import_sessions_rls_enabled
    and import_write_manifests_rls_enabled
    and a16bm_import_sessions_policy_exists
    and a16bm_import_write_manifests_policy_exists
    and a16bm_session_policy_semantics_pass
    and a16bm_manifest_policy_semantics_pass
    and rpc_remains_security_invoker
    and no_automatic_import_trigger
  ) as a16bo_revoke_anon_import_staging_grants_verified
from booleans;
