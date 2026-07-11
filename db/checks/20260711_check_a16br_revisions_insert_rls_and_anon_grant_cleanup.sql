-- A16BR_REVISIONS_INSERT_RLS_AND_ANON_GRANT_CLEANUP_SELECT_ONLY_VERIFY
-- SQL_CHECK_STATUS=SELECT_ONLY
-- DO_NOT_MUTATE
-- DO_NOT_INVOKE_OFFICIAL_IMPORT_RPC
-- DO_NOT_LOCK_PRODUCTION_ROWS
-- NO_RAW_PRIVATE_DATA

with required_table_privileges(table_name, privilege_type) as (
  values
    ('import_sessions', 'SELECT'),
    ('import_sessions', 'UPDATE'),
    ('import_write_manifests', 'SELECT'),
    ('import_write_manifests', 'UPDATE'),
    ('official_import_batches', 'SELECT'),
    ('official_import_batches', 'INSERT'),
    ('official_import_batches', 'UPDATE'),
    ('official_import_rollback_manifests', 'INSERT'),
    ('people', 'INSERT'),
    ('families', 'INSERT'),
    ('family_parents', 'SELECT'),
    ('family_parents', 'INSERT'),
    ('family_children', 'SELECT'),
    ('family_children', 'INSERT'),
    ('revisions', 'INSERT'),
    ('import_session_warnings', 'SELECT'),
    ('import_duplicate_candidates', 'SELECT'),
    ('import_relationship_candidates', 'SELECT')
),
rpc_tables(table_name) as (
  values
    ('import_sessions'),
    ('import_write_manifests'),
    ('official_import_batches'),
    ('official_import_rollback_manifests'),
    ('people'),
    ('families'),
    ('family_parents'),
    ('family_children'),
    ('revisions'),
    ('import_session_warnings'),
    ('import_duplicate_candidates'),
    ('import_relationship_candidates')
),
public_core_tables(table_name) as (
  values
    ('families'),
    ('family_children'),
    ('family_parents'),
    ('people')
),
sensitive_revoke_tables(table_name) as (
  values
    ('revisions'),
    ('import_session_warnings'),
    ('import_duplicate_candidates'),
    ('import_relationship_candidates')
),
policy_catalog_raw as (
  select
    tablename,
    policyname,
    cmd,
    roles,
    coalesce(qual, '') as qual,
    coalesce(with_check, '') as with_check
  from pg_policies
  where schemaname = 'public'
    and tablename in (select table_name from rpc_tables)
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
    and table_name in (select table_name from rpc_tables)
),
rls_catalog as (
  select
    c.relname as table_name,
    c.relrowsecurity,
    c.relforcerowsecurity
  from pg_class c
  join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public'
    and c.relname in (select table_name from rpc_tables)
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
    and c.relname in (select table_name from rpc_tables)
),
privilege_checks as (
  select
    count(*) filter (
      where not has_table_privilege('authenticated', 'public.' || table_name, privilege_type)
    )::integer as missing_authenticated_required_privilege_count
  from required_table_privileges
),
forbidden_checks as (
  select
    (
      select count(*)::integer
      from grant_catalog
      where table_name in (select table_name from public_core_tables)
        and lower(grantee) = 'anon'
        and privilege_type in ('INSERT', 'UPDATE', 'DELETE', 'TRUNCATE', 'REFERENCES', 'TRIGGER')
    ) as forbidden_anon_mutation_grant_count,
    (
      select count(*)::integer
      from grant_catalog
      where table_name in (select table_name from public_core_tables)
        and lower(grantee) = 'public'
        and privilege_type in ('INSERT', 'UPDATE', 'DELETE', 'TRUNCATE', 'REFERENCES', 'TRIGGER')
    ) as forbidden_public_mutation_grant_count,
    (
      select count(*)::integer
      from grant_catalog
      where table_name in (select table_name from sensitive_revoke_tables)
        and lower(grantee) in ('anon', 'public')
        and privilege_type in ('SELECT', 'INSERT', 'UPDATE', 'DELETE', 'TRUNCATE', 'REFERENCES', 'TRIGGER')
    ) as staging_and_revision_anon_grant_count,
    (
      select count(*)::integer
      from public_core_tables
      where has_table_privilege('anon', 'public.' || table_name, 'SELECT')
    ) as public_core_anon_select_table_count,
    (
      select count(*)::integer
      from policy_catalog pc
      where exists (
        select 1
        from unnest(pc.roles) as policy_role(role_name)
        where lower(policy_role.role_name::text) in ('anon', 'public')
      )
      and pc.cmd in ('INSERT', 'UPDATE', 'DELETE')
    ) as forbidden_anon_public_write_policy_count
),
public_read_contract_checks as (
  select
    has_table_privilege('anon', 'public.people', 'SELECT')
    and has_table_privilege('anon', 'public.families', 'SELECT')
    and has_table_privilege('anon', 'public.family_parents', 'SELECT')
    and has_table_privilege('anon', 'public.family_children', 'SELECT')
      as public_core_anon_select_contract,
    exists (
      select 1
      from policy_catalog
      where tablename = 'people'
        and cmd = 'SELECT'
        and exists (
          select 1
          from unnest(roles) as policy_role(role_name)
          where lower(policy_role.role_name::text) in ('anon', 'public')
        )
        and normalized_qual like '%visibility = ''public''%'
        and normalized_qual like '%deleted_at is null%'
    ) as people_public_select_policy_exists_if_needed,
    exists (
      select 1
      from policy_catalog
      where tablename = 'families'
        and cmd = 'SELECT'
        and exists (
          select 1
          from unnest(roles) as policy_role(role_name)
          where lower(policy_role.role_name::text) in ('anon', 'public')
        )
        and normalized_qual like '%visibility = ''public''%'
        and normalized_qual like '%deleted_at is null%'
    ) as families_public_select_policy_exists_if_needed,
    exists (
      select 1
      from policy_catalog
      where tablename = 'family_parents'
        and cmd = 'SELECT'
        and exists (
          select 1
          from unnest(roles) as policy_role(role_name)
          where lower(policy_role.role_name::text) in ('anon', 'public')
        )
        and normalized_qual like '%deleted_at is null%'
    ) as family_parents_public_select_policy_exists_if_needed,
    exists (
      select 1
      from policy_catalog
      where tablename = 'family_children'
        and cmd = 'SELECT'
        and exists (
          select 1
          from unnest(roles) as policy_role(role_name)
          where lower(policy_role.role_name::text) in ('anon', 'public')
        )
        and normalized_qual like '%deleted_at is null%'
    ) as family_children_public_select_policy_exists_if_needed
),
revisions_policy_checks as (
  select
    exists (
      select 1
      from policy_catalog
      where tablename = 'revisions'
        and policyname = 'revision viewers can read people revisions'
        and cmd = 'SELECT'
        and normalized_qual like '%entity_type = ''people''%'
        and normalized_qual like '%has_permission(''revisions.view'')%'
    )
    and exists (
      select 1
      from policy_catalog
      where tablename = 'revisions'
        and policyname = 'revision viewers can read relationship revisions'
        and cmd = 'SELECT'
        and normalized_qual like '%families%'
        and normalized_qual like '%family_parents%'
        and normalized_qual like '%family_children%'
        and normalized_qual like '%couple_relationships%'
        and normalized_qual like '%has_permission(''revisions.view'')%'
    )
    and exists (
      select 1
      from policy_catalog
      where tablename = 'revisions'
        and policyname = 'revision viewers can read tree layout revisions'
        and cmd = 'SELECT'
        and normalized_qual like '%tree_layouts%'
        and normalized_qual like '%tree_layout_nodes%'
        and normalized_qual like '%has_permission(''revisions.view'')%'
    ) as existing_revisions_select_policies_remain_unchanged,
    exists (
      select 1
      from policy_catalog
      where tablename = 'revisions'
        and policyname = 'a16br_revisions_insert_official_import_create'
        and cmd = 'INSERT'
    ) as new_revisions_insert_policy_exists,
    exists (
      select 1
      from policy_catalog pc
      where pc.tablename = 'revisions'
        and pc.policyname = 'a16br_revisions_insert_official_import_create'
        and pc.cmd = 'INSERT'
        and not exists (
          select 1
          from unnest(pc.roles) as policy_role(role_name)
          where lower(policy_role.role_name::text) <> 'authenticated'
        )
        and exists (
          select 1
          from unnest(pc.roles) as policy_role(role_name)
          where lower(policy_role.role_name::text) = 'authenticated'
        )
    ) as new_revisions_policy_role_authenticated_only,
    exists (
      select 1
      from policy_catalog
      where tablename = 'revisions'
        and policyname = 'a16br_revisions_insert_official_import_create'
        and normalized_with_check like '%changed_by = current_profile_id()%'
    ) as new_revisions_policy_checks_changed_by_current_profile,
    exists (
      select 1
      from policy_catalog
      where tablename = 'revisions'
        and policyname = 'a16br_revisions_insert_official_import_create'
        and normalized_with_check like '%action = ''create''%'
    ) as new_revisions_policy_limits_action_create,
    exists (
      select 1
      from policy_catalog
      where tablename = 'revisions'
        and policyname = 'a16br_revisions_insert_official_import_create'
        and normalized_with_check like '%people%'
        and normalized_with_check like '%families%'
        and normalized_with_check not like '%family_parents%'
        and normalized_with_check not like '%family_children%'
        and normalized_with_check not like '%couple_relationships%'
        and normalized_with_check not like '%tree_layouts%'
    ) as new_revisions_policy_limits_entity_types_people_families,
    exists (
      select 1
      from policy_catalog
      where tablename = 'revisions'
        and policyname = 'a16br_revisions_insert_official_import_create'
        and normalized_with_check like '%has_permission(''imports.create'')%'
    ) as new_revisions_policy_checks_imports_create,
    exists (
      select 1
      from policy_catalog
      where tablename = 'revisions'
        and policyname = 'a16br_revisions_insert_official_import_create'
        and normalized_with_check like '%has_permission(''permissions.manage'')%'
    ) as new_revisions_policy_checks_permissions_manage,
    exists (
      select 1
      from policy_catalog
      where tablename = 'revisions'
        and policyname = 'a16br_revisions_insert_official_import_create'
        and normalized_with_check like '%entity_type = ''people''%'
        and normalized_with_check like '%has_permission(''people.create'')%'
        and normalized_with_check like '%entity_type = ''families''%'
        and normalized_with_check like '%has_permission(''relationships.create'')%'
    ) as new_revisions_policy_checks_people_relationships_create_by_entity_type,
    exists (
      select 1
      from policy_catalog
      where tablename = 'revisions'
        and policyname = 'a16br_revisions_insert_official_import_create'
        and normalized_with_check like '%a-16v gia pha 4 official import candidate%'
        and normalized_with_check like '%import_session_id%'
        and normalized_with_check like '%source_row_index%'
        and normalized_with_check like '%child_source_row_index%'
    ) as new_revisions_policy_requires_official_import_marker_fields,
    exists (
      select 1
      from policy_catalog
      where tablename = 'revisions'
        and policyname = 'a16br_revisions_insert_official_import_create'
        and normalized_with_check like '%import_session_id%'
        and normalized_with_check like '%owned_session.id%'
        and normalized_with_check like '%owned_session.created_by = current_profile_id()%'
    ) as new_revisions_policy_verifies_owned_import_session_id,
    exists (
      select 1
      from policy_catalog
      where tablename = 'revisions'
        and policyname = 'a16br_revisions_insert_official_import_create'
        and normalized_with_check like '%ready_for_owner_approval%'
        and normalized_with_check like '%owner_approved_for_db_write%'
    ) as new_revisions_policy_checks_session_status_compatible
),
official_import_batch_policy_checks as (
  select
    exists (
      select 1
      from policy_catalog pc
      where pc.tablename = 'official_import_batches'
        and pc.policyname = 'a16t_official_import_batches_update_own'
        and pc.cmd = 'UPDATE'
        and exists (
          select 1
          from unnest(pc.roles) as policy_role(role_name)
          where lower(policy_role.role_name::text) = 'authenticated'
        )
        and pc.normalized_qual like '%has_permission(''imports.create'')%'
        and pc.normalized_qual like '%from import_sessions owned_session%'
        and pc.normalized_qual like '%owned_session.created_by = current_profile_id()%'
        and pc.normalized_with_check like '%has_permission(''imports.create'')%'
        and pc.normalized_with_check like '%updated_by = current_profile_id()%'
        and pc.normalized_with_check like '%from import_sessions owned_session%'
        and pc.normalized_with_check like '%owned_session.created_by = current_profile_id()%'
    ) as official_import_batches_update_policy_unchanged_runtime_compatible,
    exists (
      select 1
      from policy_catalog
      where tablename = 'official_import_batches'
        and cmd = 'UPDATE'
        and normalized_qual like '%has_permission(''imports.create'')%'
        and normalized_qual like '%owned_session.created_by = current_profile_id()%'
        and normalized_with_check like '%has_permission(''imports.create'')%'
        and normalized_with_check like '%updated_by = current_profile_id()%'
        and normalized_with_check like '%owned_session.created_by = current_profile_id()%'
    ) as official_import_batches_update_contract_runtime_compatible_without_completed_literal
),
booleans as (
  select
    privilege_checks.missing_authenticated_required_privilege_count,
    forbidden_checks.forbidden_anon_mutation_grant_count,
    forbidden_checks.forbidden_public_mutation_grant_count,
    forbidden_checks.staging_and_revision_anon_grant_count,
    forbidden_checks.public_core_anon_select_table_count,
    forbidden_checks.forbidden_anon_public_write_policy_count,
    forbidden_checks.forbidden_anon_mutation_grant_count = 0 as no_anon_mutation_grants,
    forbidden_checks.forbidden_public_mutation_grant_count = 0 as no_public_mutation_grants,
    forbidden_checks.staging_and_revision_anon_grant_count = 0 as no_staging_or_revision_anon_public_grants,
    forbidden_checks.forbidden_anon_public_write_policy_count = 0 as no_anon_or_public_write_policies,
    not exists (
      select 1
      from rls_catalog
      where not relrowsecurity
    ) as all_rpc_tables_rls_enabled,
    count(*) filter (where relforcerowsecurity)::integer as force_rls_table_count,
    exists (select 1 from rpc_catalog where security_definer = false) as rpc_remains_security_invoker,
    not exists (
      select 1
      from trigger_catalog
      where trigger_definition ilike '%a16p_tx_execute_giapha4_official_import%'
        or trigger_function_name ilike '%a16p_tx_execute_giapha4_official_import%'
    ) as no_automatic_import_trigger,
    public_read_contract_checks.*,
    revisions_policy_checks.*,
    official_import_batch_policy_checks.*
  from privilege_checks
  cross join forbidden_checks
  cross join public_read_contract_checks
  cross join revisions_policy_checks
  cross join official_import_batch_policy_checks
  cross join rls_catalog
  group by
    privilege_checks.missing_authenticated_required_privilege_count,
    forbidden_checks.forbidden_anon_mutation_grant_count,
    forbidden_checks.forbidden_public_mutation_grant_count,
    forbidden_checks.staging_and_revision_anon_grant_count,
    forbidden_checks.public_core_anon_select_table_count,
    forbidden_checks.forbidden_anon_public_write_policy_count,
    public_read_contract_checks.public_core_anon_select_contract,
    public_read_contract_checks.people_public_select_policy_exists_if_needed,
    public_read_contract_checks.families_public_select_policy_exists_if_needed,
    public_read_contract_checks.family_parents_public_select_policy_exists_if_needed,
    public_read_contract_checks.family_children_public_select_policy_exists_if_needed,
    revisions_policy_checks.existing_revisions_select_policies_remain_unchanged,
    revisions_policy_checks.new_revisions_insert_policy_exists,
    revisions_policy_checks.new_revisions_policy_role_authenticated_only,
    revisions_policy_checks.new_revisions_policy_checks_changed_by_current_profile,
    revisions_policy_checks.new_revisions_policy_limits_action_create,
    revisions_policy_checks.new_revisions_policy_limits_entity_types_people_families,
    revisions_policy_checks.new_revisions_policy_checks_imports_create,
    revisions_policy_checks.new_revisions_policy_checks_permissions_manage,
    revisions_policy_checks.new_revisions_policy_checks_people_relationships_create_by_entity_type,
    revisions_policy_checks.new_revisions_policy_requires_official_import_marker_fields,
    revisions_policy_checks.new_revisions_policy_verifies_owned_import_session_id,
    revisions_policy_checks.new_revisions_policy_checks_session_status_compatible,
    official_import_batch_policy_checks.official_import_batches_update_policy_unchanged_runtime_compatible,
    official_import_batch_policy_checks.official_import_batches_update_contract_runtime_compatible_without_completed_literal
)
select
  *,
  (
    missing_authenticated_required_privilege_count = 0
    and no_anon_mutation_grants
    and no_public_mutation_grants
    and no_staging_or_revision_anon_public_grants
    and no_anon_or_public_write_policies
    and public_core_anon_select_contract
    and people_public_select_policy_exists_if_needed
    and families_public_select_policy_exists_if_needed
    and family_parents_public_select_policy_exists_if_needed
    and family_children_public_select_policy_exists_if_needed
    and all_rpc_tables_rls_enabled
    and force_rls_table_count = 0
    and rpc_remains_security_invoker
    and no_automatic_import_trigger
    and existing_revisions_select_policies_remain_unchanged
    and new_revisions_insert_policy_exists
    and new_revisions_policy_role_authenticated_only
    and new_revisions_policy_checks_changed_by_current_profile
    and new_revisions_policy_limits_action_create
    and new_revisions_policy_limits_entity_types_people_families
    and new_revisions_policy_checks_imports_create
    and new_revisions_policy_checks_permissions_manage
    and new_revisions_policy_checks_people_relationships_create_by_entity_type
    and new_revisions_policy_requires_official_import_marker_fields
    and new_revisions_policy_verifies_owned_import_session_id
    and new_revisions_policy_checks_session_status_compatible
    and official_import_batches_update_policy_unchanged_runtime_compatible
    and official_import_batches_update_contract_runtime_compatible_without_completed_literal
  ) as a16br_revisions_insert_rls_and_anon_grant_cleanup_verified
from booleans;
