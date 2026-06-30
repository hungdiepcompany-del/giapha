-- A-16SQL-RLS-IMPORT-STAGING-WRITE
-- SELECT_ONLY_VERIFICATION
-- Run manually after owner-approved SQL apply. Do not use this file to mutate DB.

with staging_tables(table_name) as (
  values
    ('import_sessions'),
    ('import_session_warnings'),
    ('import_duplicate_candidates'),
    ('import_relationship_candidates'),
    ('import_write_manifests')
),
rls_state as (
  select c.relname as table_name, c.relrowsecurity
  from pg_class c
  join pg_namespace n on n.oid = c.relnamespace
  join staging_tables st on st.table_name = c.relname
  where n.nspname = 'public'
),
policy_state as (
  select
    c.relname as table_name,
    p.polname as policy_name,
    p.polcmd,
    p.polroles,
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
  join staging_tables st on st.table_name = c.relname
  where n.nspname = 'public'
),
permission_state as (
  select count(*) as permission_count
  from public.permissions
  where code = 'imports.create'
),
real_table_a16sql_policy_state as (
  select count(*) as policy_count
  from pg_policy p
  join pg_class c on c.oid = p.polrelid
  join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public'
    and c.relname in (
      'people',
      'families',
      'family_parents',
      'family_children',
      'couple_relationships',
      'tree_layouts',
      'revisions'
    )
    and p.polname like 'a16sql_%'
)
select
  'A16SQL_RLS_ENABLED_ON_FIVE_STAGING_TABLES' as check_name,
  case
    when (select count(*) from rls_state where relrowsecurity) = 5 then 'PASS'
    else 'FAIL'
  end as status,
  jsonb_build_object('rls_enabled_count', (select count(*) from rls_state where relrowsecurity)) as details
union all
select
  'A16SQL_AUTHENTICATED_SELECT_POLICY_ON_FIVE_STAGING_TABLES',
  case
    when (
      select count(distinct table_name)
      from policy_state
      where polcmd in ('r', '*')
        and has_authenticated_role
    ) = 5 then 'PASS'
    else 'FAIL'
  end,
  jsonb_build_object(
    'table_count',
    (
      select count(distinct table_name)
      from policy_state
      where polcmd in ('r', '*')
        and has_authenticated_role
    )
  )
union all
select
  'A16SQL_AUTHENTICATED_INSERT_POLICY_ON_FIVE_STAGING_TABLES',
  case
    when (
      select count(distinct table_name)
      from policy_state
      where polcmd in ('a', '*')
        and has_authenticated_role
    ) = 5 then 'PASS'
    else 'FAIL'
  end,
  jsonb_build_object(
    'table_count',
    (
      select count(distinct table_name)
      from policy_state
      where polcmd in ('a', '*')
        and has_authenticated_role
    )
  )
union all
select
  'A16SQL_AUTHENTICATED_UPDATE_POLICY_ONLY_ON_IMPORT_SESSIONS',
  case
    when (
      select count(*)
      from policy_state
      where polcmd in ('w', '*')
        and has_authenticated_role
    ) = 1
    and exists (
      select 1
      from policy_state
      where table_name = 'import_sessions'
        and polcmd in ('w', '*')
        and has_authenticated_role
    ) then 'PASS'
    else 'FAIL'
  end,
  jsonb_build_object(
    'update_policy_count',
    (
      select count(*)
      from policy_state
      where polcmd in ('w', '*')
        and has_authenticated_role
    )
  )
union all
select
  'A16SQL_NO_ANON_OR_PUBLIC_STAGING_POLICY',
  case
    when not exists (
      select 1
      from policy_state
      where has_anon_role or has_public_role
    ) then 'PASS'
    else 'FAIL'
  end,
  jsonb_build_object(
    'forbidden_policy_count',
    (
      select count(*)
      from policy_state
      where has_anon_role or has_public_role
    )
  )
union all
select
  'A16SQL_IMPORTS_CREATE_PERMISSION_EXISTS',
  case
    when (select permission_count from permission_state) >= 1 then 'PASS'
    else 'FAIL'
  end,
  jsonb_build_object('permission_count', (select permission_count from permission_state))
union all
select
  'A16SQL_NO_A16SQL_POLICY_ON_REAL_GENEALOGY_TABLES',
  case
    when (select policy_count from real_table_a16sql_policy_state) = 0 then 'PASS'
    else 'FAIL'
  end,
  jsonb_build_object('policy_count', (select policy_count from real_table_a16sql_policy_state));
