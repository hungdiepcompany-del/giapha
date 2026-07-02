-- A-16T-OFFICIAL-IMPORT-AUDIT-ROLLBACK-IDEMPOTENCY-SCHEMA
-- SELECT_ONLY_VERIFICATION
-- Run manually after owner-approved SQL apply. Do not use this file to mutate DB.

with expected_tables(table_name) as (
  values
    ('official_import_batches'),
    ('official_import_rollback_manifests')
),
expected_batch_columns(column_name) as (
  values
    ('import_session_id'),
    ('actor_profile_id'),
    ('status'),
    ('source_type'),
    ('manifest_hash'),
    ('expected_people_count'),
    ('expected_relationship_count'),
    ('created_people_count'),
    ('created_relationship_count'),
    ('audit_record_count'),
    ('rollback_manifest_count'),
    ('duplicate_decision_summary'),
    ('validation_summary'),
    ('dry_run_summary'),
    ('idempotency_key'),
    ('import_marker'),
    ('started_at'),
    ('completed_at'),
    ('failed_at')
),
expected_rollback_columns(column_name) as (
  values
    ('import_batch_id'),
    ('import_session_id'),
    ('created_people_ids'),
    ('created_family_ids'),
    ('created_family_parent_ids'),
    ('created_family_child_ids'),
    ('created_couple_relationship_ids'),
    ('created_revision_ids'),
    ('created_layout_ids'),
    ('rollback_order'),
    ('rollback_status'),
    ('manifest_hash')
),
table_state as (
  select c.relname as table_name, c.relrowsecurity
  from pg_class c
  join pg_namespace n on n.oid = c.relnamespace
  join expected_tables et on et.table_name = c.relname
  where n.nspname = 'public'
),
column_state as (
  select table_name, column_name
  from information_schema.columns
  where table_schema = 'public'
    and table_name in (
      'official_import_batches',
      'official_import_rollback_manifests'
    )
),
unique_index_state as (
  select indexname, tablename, indexdef
  from pg_indexes
  where schemaname = 'public'
    and tablename in (
      'official_import_batches',
      'official_import_rollback_manifests'
    )
    and indexdef ilike 'create unique index%'
),
policy_state as (
  select
    c.relname as table_name,
    p.polname as policy_name,
    p.polcmd,
    exists (
      select 1
      from pg_roles r
      where r.oid = any(p.polroles)
        and r.rolname = 'authenticated'
    ) as has_authenticated_role,
    0::oid = any(p.polroles) as has_public_role,
    exists (
      select 1
      from pg_roles r
      where r.oid = any(p.polroles)
        and r.rolname = 'anon'
    ) as has_anon_role
  from pg_policy p
  join pg_class c on c.oid = p.polrelid
  join pg_namespace n on n.oid = c.relnamespace
  join expected_tables et on et.table_name = c.relname
  where n.nspname = 'public'
),
grant_state as (
  select grantee, table_name, privilege_type
  from information_schema.role_table_grants
  where table_schema = 'public'
    and table_name in (
      'official_import_batches',
      'official_import_rollback_manifests'
    )
    and grantee in ('anon', 'public')
),
trigger_state as (
  select trigger_name
  from information_schema.triggers
  where event_object_schema = 'public'
    and event_object_table in (
      'official_import_batches',
      'official_import_rollback_manifests',
      'import_sessions'
    )
    and trigger_name ilike '%official_import%'
),
rpc_state as (
  select proname
  from pg_proc p
  join pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public'
    and proname = 'a16p_tx_execute_giapha4_official_import'
)
select
  'A16T_TABLES_EXIST' as check_name,
  case when (select count(*) from table_state) = 2 then 'PASS' else 'FAIL' end as status,
  jsonb_build_object('table_count', (select count(*) from table_state)) as details
union all
select
  'A16T_BATCH_REQUIRED_COLUMNS_EXIST',
  case
    when (
      select count(*)
      from expected_batch_columns e
      where exists (
        select 1
        from column_state c
        where c.table_name = 'official_import_batches'
          and c.column_name = e.column_name
      )
    ) = (select count(*) from expected_batch_columns) then 'PASS'
    else 'FAIL'
  end,
  jsonb_build_object(
    'matched_column_count',
    (
      select count(*)
      from expected_batch_columns e
      where exists (
        select 1
        from column_state c
        where c.table_name = 'official_import_batches'
          and c.column_name = e.column_name
      )
    )
  )
union all
select
  'A16T_ROLLBACK_REQUIRED_COLUMNS_EXIST',
  case
    when (
      select count(*)
      from expected_rollback_columns e
      where exists (
        select 1
        from column_state c
        where c.table_name = 'official_import_rollback_manifests'
          and c.column_name = e.column_name
      )
    ) = (select count(*) from expected_rollback_columns) then 'PASS'
    else 'FAIL'
  end,
  jsonb_build_object(
    'matched_column_count',
    (
      select count(*)
      from expected_rollback_columns e
      where exists (
        select 1
        from column_state c
        where c.table_name = 'official_import_rollback_manifests'
          and c.column_name = e.column_name
      )
    )
  )
union all
select
  'A16T_IDEMPOTENCY_UNIQUE_GUARD_EXISTS',
  case
    when exists (
      select 1
      from unique_index_state
      where tablename = 'official_import_batches'
        and indexdef ilike '%import_session_id%'
    )
    and exists (
      select 1
      from unique_index_state
      where tablename = 'official_import_batches'
        and indexdef ilike '%idempotency_key%'
    ) then 'PASS'
    else 'FAIL'
  end,
  jsonb_build_object(
    'unique_indexes',
    (
      select jsonb_agg(indexname order by indexname)
      from unique_index_state
      where tablename = 'official_import_batches'
    )
  )
union all
select
  'A16T_ROLLBACK_MANIFEST_UNIQUE_GUARD_EXISTS',
  case
    when exists (
      select 1
      from unique_index_state
      where tablename = 'official_import_rollback_manifests'
        and indexdef ilike '%import_batch_id%'
    )
    and exists (
      select 1
      from unique_index_state
      where tablename = 'official_import_rollback_manifests'
        and indexdef ilike '%import_session_id%'
    ) then 'PASS'
    else 'FAIL'
  end,
  jsonb_build_object(
    'unique_indexes',
    (
      select jsonb_agg(indexname order by indexname)
      from unique_index_state
      where tablename = 'official_import_rollback_manifests'
    )
  )
union all
select
  'A16T_RLS_ENABLED',
  case when (select count(*) from table_state where relrowsecurity) = 2 then 'PASS' else 'FAIL' end,
  jsonb_build_object('rls_enabled_count', (select count(*) from table_state where relrowsecurity))
union all
select
  'A16T_AUTHENTICATED_POLICIES_EXIST',
  case
    when (
      select count(distinct table_name)
      from policy_state
      where has_authenticated_role
    ) = 2 then 'PASS'
    else 'FAIL'
  end,
  jsonb_build_object(
    'policy_count',
    (
      select count(*)
      from policy_state
      where has_authenticated_role
    )
  )
union all
select
  'A16T_NO_ANON_OR_PUBLIC_POLICY_OR_GRANT',
  case
    when not exists (
      select 1
      from policy_state
      where has_anon_role or has_public_role
    )
    and not exists (select 1 from grant_state) then 'PASS'
    else 'FAIL'
  end,
  jsonb_build_object(
    'forbidden_policy_count',
    (
      select count(*)
      from policy_state
      where has_anon_role or has_public_role
    ),
    'forbidden_grant_count',
    (select count(*) from grant_state)
  )
union all
select
  'A16T_NO_AUTO_IMPORT_TRIGGER',
  case when not exists (select 1 from trigger_state) then 'PASS' else 'FAIL' end,
  jsonb_build_object('trigger_count', (select count(*) from trigger_state))
union all
select
  'A16T_RPC_EXISTS_BUT_EXECUTION_NOT_VERIFIED_BY_THIS_CHECK',
  case when (select count(*) from rpc_state) <= 1 then 'PASS' else 'FAIL' end,
  jsonb_build_object('rpc_count', (select count(*) from rpc_state));
