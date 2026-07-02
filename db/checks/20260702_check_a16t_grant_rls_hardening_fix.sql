-- A-16T-GRANT-RLS-HARDENING-FIX
-- SELECT_ONLY_VERIFICATION
-- Run manually after owner-approved hardening SQL apply. Do not use this file
-- to mutate DB.

with target_tables(table_name) as (
  values
    ('official_import_batches'),
    ('official_import_rollback_manifests')
),
target_table_oids as (
  select c.oid, c.relname as table_name, c.relrowsecurity, c.relacl
  from pg_class c
  join pg_namespace n on n.oid = c.relnamespace
  join target_tables tt on tt.table_name = c.relname
  where n.nspname = 'public'
    and c.relkind in ('r', 'p')
),
target_sequences as (
  select distinct seq.oid, seq.relname as sequence_name, seq.relacl
  from pg_class seq
  join pg_namespace seq_ns on seq_ns.oid = seq.relnamespace
  join pg_depend dep on dep.objid = seq.oid
  join target_table_oids table_oids on table_oids.oid = dep.refobjid
  where seq_ns.nspname = 'public'
    and seq.relkind = 'S'
    and dep.deptype in ('a', 'i')
),
table_grants as (
  select
    table_name,
    grantee,
    privilege_type
  from information_schema.role_table_grants
  where table_schema = 'public'
    and table_name in (
      'official_import_batches',
      'official_import_rollback_manifests'
    )
    and lower(grantee) in ('anon', 'public')
),
sequence_grants as (
  select
    s.sequence_name,
    coalesce(r.rolname, 'public') as grantee,
    grant_item.privilege_type
  from target_sequences s
  cross join lateral aclexplode(coalesce(s.relacl, acldefault('S', s.oid))) as grant_item
  left join pg_roles r on r.oid = grant_item.grantee
  where lower(coalesce(r.rolname, 'public')) in ('anon', 'public')
),
policy_state as (
  select
    c.relname as table_name,
    p.polname as policy_name,
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
  join target_tables tt on tt.table_name = c.relname
  where n.nspname = 'public'
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
rpc_execute_grants as (
  select
    coalesce(r.rolname, 'public') as grantee,
    p.proname
  from pg_proc p
  join pg_namespace n on n.oid = p.pronamespace
  cross join lateral aclexplode(coalesce(p.proacl, acldefault('f', p.proowner))) as grant_item
  left join pg_roles r on r.oid = grant_item.grantee
  where n.nspname = 'public'
    and p.proname = 'a16p_tx_execute_giapha4_official_import'
    and grant_item.privilege_type = 'EXECUTE'
    and lower(coalesce(r.rolname, 'public')) in ('anon', 'public')
)
select
  'A16T_GRANT_FIX_TABLES_EXIST' as check_name,
  case when (select count(*) from target_table_oids) = 2 then 'PASS' else 'FAIL' end as status,
  jsonb_build_object('table_count', (select count(*) from target_table_oids)) as details
union all
select
  'A16T_GRANT_FIX_NO_ANON_PUBLIC_TABLE_GRANTS',
  case when not exists (select 1 from table_grants) then 'PASS' else 'FAIL' end,
  jsonb_build_object('forbidden_table_grant_count', (select count(*) from table_grants))
union all
select
  'A16T_GRANT_FIX_NO_ANON_PUBLIC_SEQUENCE_GRANTS',
  case when not exists (select 1 from sequence_grants) then 'PASS' else 'FAIL' end,
  jsonb_build_object(
    'related_sequence_count',
    (select count(*) from target_sequences),
    'forbidden_sequence_grant_count',
    (select count(*) from sequence_grants)
  )
union all
select
  'A16T_GRANT_FIX_NO_ANON_PUBLIC_POLICIES',
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
  'A16T_GRANT_FIX_RLS_STILL_ENABLED',
  case when (select count(*) from target_table_oids where relrowsecurity) = 2 then 'PASS' else 'FAIL' end,
  jsonb_build_object('rls_enabled_count', (select count(*) from target_table_oids where relrowsecurity))
union all
select
  'A16T_GRANT_FIX_AUTHENTICATED_POLICIES_STILL_EXIST',
  case
    when (
      select count(distinct table_name)
      from policy_state
      where has_authenticated_role
    ) = 2 then 'PASS'
    else 'FAIL'
  end,
  jsonb_build_object(
    'authenticated_policy_count',
    (
      select count(*)
      from policy_state
      where has_authenticated_role
    )
  )
union all
select
  'A16T_GRANT_FIX_NO_AUTO_IMPORT_TRIGGER',
  case when not exists (select 1 from trigger_state) then 'PASS' else 'FAIL' end,
  jsonb_build_object('trigger_count', (select count(*) from trigger_state))
union all
select
  'A16T_GRANT_FIX_RPC_EXECUTION_STILL_NOT_PUBLIC',
  case when not exists (select 1 from rpc_execute_grants) then 'PASS' else 'FAIL' end,
  jsonb_build_object('forbidden_rpc_execute_grant_count', (select count(*) from rpc_execute_grants));
