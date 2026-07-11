-- A16BT_SECURE_PUBLIC_GENEALOGY_READ_BOUNDARY_SELECT_ONLY_VERIFY
-- SQL_CHECK_STATUS=SELECT_ONLY
-- DO_NOT_MUTATE
-- DO_NOT_QUERY_GENEALOGY_ROWS
-- DO_NOT_INVOKE_OFFICIAL_IMPORT_RPC
-- DO_NOT_LOCK_PRODUCTION_ROWS
-- NO_RAW_PRIVATE_DATA

with public_core_tables(table_name) as (
  values
    ('people'),
    ('families'),
    ('family_parents'),
    ('family_children')
),
required_anon_columns(table_name, column_name) as (
  values
    ('people', 'id'),
    ('people', 'slug'),
    ('people', 'full_name'),
    ('people', 'display_name'),
    ('people', 'is_living'),
    ('people', 'branch_name'),
    ('people', 'generation_number'),
    ('people', 'visibility'),
    ('people', 'deleted_at'),
    ('families', 'id'),
    ('families', 'family_code'),
    ('families', 'family_label'),
    ('families', 'visibility'),
    ('families', 'deleted_at'),
    ('family_parents', 'id'),
    ('family_parents', 'family_id'),
    ('family_parents', 'person_id'),
    ('family_parents', 'parent_role'),
    ('family_parents', 'deleted_at'),
    ('family_children', 'id'),
    ('family_children', 'family_id'),
    ('family_children', 'person_id'),
    ('family_children', 'child_relationship_type'),
    ('family_children', 'deleted_at')
),
forbidden_anon_columns(table_name, column_name) as (
  values
    ('people', 'gender'),
    ('people', 'birth_date'),
    ('people', 'birth_date_precision'),
    ('people', 'death_date'),
    ('people', 'death_date_precision'),
    ('people', 'birth_place'),
    ('people', 'home_town'),
    ('people', 'short_bio'),
    ('people', 'notes_private'),
    ('people', 'created_at'),
    ('people', 'created_by'),
    ('people', 'updated_at'),
    ('people', 'updated_by'),
    ('people', 'deleted_by'),
    ('people', 'delete_reason'),
    ('families', 'notes'),
    ('families', 'created_at'),
    ('families', 'created_by'),
    ('families', 'updated_at'),
    ('families', 'updated_by'),
    ('families', 'deleted_by'),
    ('families', 'delete_reason'),
    ('family_parents', 'relationship_type'),
    ('family_parents', 'sort_order'),
    ('family_parents', 'notes'),
    ('family_parents', 'created_at'),
    ('family_parents', 'created_by'),
    ('family_parents', 'updated_at'),
    ('family_parents', 'updated_by'),
    ('family_parents', 'deleted_by'),
    ('family_parents', 'delete_reason'),
    ('family_children', 'sort_order'),
    ('family_children', 'notes'),
    ('family_children', 'created_at'),
    ('family_children', 'created_by'),
    ('family_children', 'updated_at'),
    ('family_children', 'updated_by'),
    ('family_children', 'deleted_by'),
    ('family_children', 'delete_reason')
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
grant_catalog as (
  select
    table_name,
    grantee,
    privilege_type
  from information_schema.role_table_grants
  where table_schema = 'public'
    and table_name in (select table_name from public_core_tables)
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
    and tablename in (
      select table_name from rpc_tables
      union
      select table_name from public_core_tables
    )
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
rls_catalog as (
  select
    c.relname as table_name,
    c.relrowsecurity
  from pg_class c
  join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public'
    and c.relname in (select table_name from public_core_tables)
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
grant_checks as (
  select
    (
      select count(*)::integer
      from grant_catalog
      where lower(grantee) = 'anon'
        and privilege_type = 'SELECT'
    ) as broad_anon_table_select_grant_count,
    (
      select count(*)::integer
      from grant_catalog
      where lower(grantee) = 'public'
        and privilege_type = 'SELECT'
    ) as broad_public_table_select_grant_count,
    (
      select count(*)::integer
      from required_anon_columns
      where not has_column_privilege(
        'anon',
        'public.' || table_name,
        column_name,
        'SELECT'
      )
    ) as missing_required_anon_column_grant_count,
    (
      select count(*)::integer
      from forbidden_anon_columns
      where has_column_privilege(
        'anon',
        'public.' || table_name,
        column_name,
        'SELECT'
      )
    ) as forbidden_private_column_anon_grant_count,
    has_column_privilege(
      'anon',
      'public.people',
      'notes_private',
      'SELECT'
    ) as notes_private_anon_select_privilege,
    (
      select count(*)::integer
      from grant_catalog
      where lower(grantee) = 'anon'
        and privilege_type in ('INSERT', 'UPDATE', 'DELETE', 'TRUNCATE', 'REFERENCES', 'TRIGGER')
    ) as forbidden_anon_mutation_grant_count,
    (
      select count(*)::integer
      from grant_catalog
      where lower(grantee) = 'public'
        and privilege_type in ('INSERT', 'UPDATE', 'DELETE', 'TRUNCATE', 'REFERENCES', 'TRIGGER')
    ) as forbidden_public_mutation_grant_count
),
public_policy_checks as (
  select
    exists (
      select 1
      from policy_catalog
      where tablename = 'people'
        and policyname = 'a16bt_public_people_select_active_public'
        and cmd = 'SELECT'
        and roles = array['anon']::name[]
        and normalized_qual like '%deleted_at is null%'
        and normalized_qual like '%visibility = ''public''%'
    ) as people_anon_policy_active_public,
    exists (
      select 1
      from policy_catalog
      where tablename = 'families'
        and policyname = 'a16bt_public_families_select_active_public'
        and cmd = 'SELECT'
        and roles = array['anon']::name[]
        and normalized_qual like '%deleted_at is null%'
        and normalized_qual like '%visibility = ''public''%'
    ) as families_anon_policy_active_public,
    exists (
      select 1
      from policy_catalog
      where tablename = 'family_parents'
        and policyname = 'a16bt_public_family_parents_select_active_public_edges'
        and cmd = 'SELECT'
        and roles = array['anon']::name[]
        and normalized_qual like '%deleted_at is null%'
        and normalized_qual like '%from families public_family%'
        and normalized_qual like '%public_family.id = family_parents.family_id%'
        and normalized_qual like '%public_family.deleted_at is null%'
        and normalized_qual like '%public_family.visibility = ''public''%'
        and normalized_qual like '%from people public_person%'
        and normalized_qual like '%public_person.id = family_parents.person_id%'
        and normalized_qual like '%public_person.deleted_at is null%'
        and normalized_qual like '%public_person.visibility = ''public''%'
    ) as family_parents_anon_policy_active_public_family_and_person,
    exists (
      select 1
      from policy_catalog
      where tablename = 'family_children'
        and policyname = 'a16bt_public_family_children_select_active_public_edges'
        and cmd = 'SELECT'
        and roles = array['anon']::name[]
        and normalized_qual like '%deleted_at is null%'
        and normalized_qual like '%from families public_family%'
        and normalized_qual like '%public_family.id = family_children.family_id%'
        and normalized_qual like '%public_family.deleted_at is null%'
        and normalized_qual like '%public_family.visibility = ''public''%'
        and normalized_qual like '%from people public_person%'
        and normalized_qual like '%public_person.id = family_children.person_id%'
        and normalized_qual like '%public_person.deleted_at is null%'
        and normalized_qual like '%public_person.visibility = ''public''%'
    ) as family_children_anon_policy_active_public_family_and_person
),
authenticated_policy_checks as (
  select
    exists (
      select 1
      from policy_catalog
      where tablename = 'people'
        and policyname = 'people viewers can read active people'
        and cmd = 'SELECT'
        and roles = array['authenticated']::name[]
        and normalized_qual like '%deleted_at is null%'
        and normalized_qual like '%has_permission(''people.view'')%'
    )
    and exists (
      select 1
      from policy_catalog
      where tablename = 'families'
        and policyname = 'relationship viewers can read active families'
        and cmd = 'SELECT'
        and roles = array['authenticated']::name[]
        and normalized_qual like '%deleted_at is null%'
        and normalized_qual like '%has_permission(''relationships.view'')%'
    )
    and exists (
      select 1
      from policy_catalog
      where tablename = 'family_parents'
        and policyname = 'relationship viewers can read active parents'
        and cmd = 'SELECT'
        and roles = array['authenticated']::name[]
        and normalized_qual like '%deleted_at is null%'
        and normalized_qual like '%has_permission(''relationships.view'')%'
    )
    and exists (
      select 1
      from policy_catalog
      where tablename = 'family_children'
        and policyname = 'relationship viewers can read active children'
        and cmd = 'SELECT'
        and roles = array['authenticated']::name[]
        and normalized_qual like '%deleted_at is null%'
        and normalized_qual like '%has_permission(''relationships.view'')%'
    ) as existing_authenticated_policies_remain_unchanged
),
write_policy_checks as (
  select
    count(*)::integer as forbidden_anon_public_write_policy_count
  from policy_catalog pc
  where exists (
    select 1
    from unnest(pc.roles) as policy_role(role_name)
    where lower(policy_role.role_name::text) in ('anon', 'public')
  )
    and pc.cmd in ('INSERT', 'UPDATE', 'DELETE')
),
revisions_policy_checks as (
  select
    exists (
      select 1
      from policy_catalog
      where tablename = 'revisions'
        and policyname = 'a16br_revisions_insert_official_import_create'
        and cmd = 'INSERT'
        and roles = array['authenticated']::name[]
        and normalized_with_check like '%changed_by = current_profile_id()%'
        and normalized_with_check like '%action = ''create''%'
        and normalized_with_check like '%has_permission(''imports.create'')%'
        and normalized_with_check like '%has_permission(''permissions.manage'')%'
        and normalized_with_check like '%ready_for_owner_approval%'
        and normalized_with_check like '%owner_approved_for_db_write%'
    ) as a16br_revisions_insert_policy_remains_unchanged
),
booleans as (
  select
    grant_checks.*,
    public_policy_checks.*,
    authenticated_policy_checks.*,
    write_policy_checks.forbidden_anon_public_write_policy_count,
    (select count(*)::integer from rls_catalog where relrowsecurity) as rls_enabled_table_count,
    (select count(*)::integer from rls_catalog where not relrowsecurity) as rls_disabled_table_count,
    revisions_policy_checks.a16br_revisions_insert_policy_remains_unchanged,
    exists (select 1 from rpc_catalog where security_definer = false) as rpc_remains_security_invoker,
    not exists (
      select 1
      from trigger_catalog
      where trigger_definition ilike '%a16p_tx_execute_giapha4_official_import%'
        or trigger_function_name ilike '%a16p_tx_execute_giapha4_official_import%'
    ) as no_automatic_import_trigger
  from grant_checks
  cross join public_policy_checks
  cross join authenticated_policy_checks
  cross join write_policy_checks
  cross join revisions_policy_checks
)
select
  *,
  (
    broad_anon_table_select_grant_count = 0
    and broad_public_table_select_grant_count = 0
    and missing_required_anon_column_grant_count = 0
    and forbidden_private_column_anon_grant_count = 0
    and notes_private_anon_select_privilege = false
    and forbidden_anon_mutation_grant_count = 0
    and forbidden_public_mutation_grant_count = 0
    and people_anon_policy_active_public
    and families_anon_policy_active_public
    and family_parents_anon_policy_active_public_family_and_person
    and family_children_anon_policy_active_public_family_and_person
    and existing_authenticated_policies_remain_unchanged
    and forbidden_anon_public_write_policy_count = 0
    and rls_enabled_table_count = 4
    and rls_disabled_table_count = 0
    and a16br_revisions_insert_policy_remains_unchanged
    and rpc_remains_security_invoker
    and no_automatic_import_trigger
  ) as a16bt_secure_public_genealogy_read_boundary_verified
from booleans;
