-- A-16P-TX - Official Import Transaction Helper / RPC Schema Readiness
-- SELECT_ONLY_VERIFICATION
-- DO_NOT_RUN_RPC
-- DO_NOT_RUN_OFFICIAL_IMPORT
-- DO_NOT_MUTATE_DB
-- Run manually only after owner-approved SQL apply.

with target_function as (
  select
    p.oid,
    n.nspname as schema_name,
    p.proname as function_name,
    p.prosecdef as security_definer,
    p.proconfig,
    pg_get_functiondef(p.oid) as function_definition,
    obj_description(p.oid, 'pg_proc') as function_comment,
    pg_get_function_identity_arguments(p.oid) as identity_arguments
  from pg_proc p
  join pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public'
    and p.proname = 'a16p_tx_execute_giapha4_official_import'
),
function_acl as (
  select
    tf.oid,
    coalesce(r.rolname, 'PUBLIC') as grantee,
    privilege_type
  from target_function tf
  left join aclexplode(coalesce(
    (select proacl from pg_proc where oid = tf.oid),
    acldefault('f', (select proowner from pg_proc where oid = tf.oid))
  )) acl on true
  left join pg_roles r on r.oid = acl.grantee
),
dangerous_a16p_tx_policy as (
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
      'tree_layout_nodes',
      'tree_layout_edges',
      'revisions',
      'revision_items'
    )
    and p.polname ilike 'a16p_tx_%'
),
auto_import_triggers as (
  select count(*) as trigger_count
  from pg_trigger t
  join pg_class c on c.oid = t.tgrelid
  join pg_namespace n on n.oid = c.relnamespace
  where not t.tgisinternal
    and n.nspname = 'public'
    and (
      t.tgname ilike '%official_import%'
      or t.tgname ilike '%a16p_tx%'
      or pg_get_triggerdef(t.oid) ilike '%a16p_tx_execute_giapha4_official_import%'
    )
)
select
  'A16P_TX_FUNCTION_EXISTS' as check_name,
  case when exists (select 1 from target_function) then 'PASS' else 'FAIL' end as status,
  jsonb_build_object(
    'function_name',
    'public.a16p_tx_execute_giapha4_official_import'
  ) as details
union all
select
  'A16P_TX_FUNCTION_IS_NOT_SECURITY_DEFINER',
  case
    when exists (select 1 from target_function where security_definer is false) then 'PASS'
    else 'FAIL'
  end,
  jsonb_build_object(
    'security_definer',
    coalesce((select security_definer from target_function limit 1), null)
  )
union all
select
  'A16P_TX_FUNCTION_HAS_FIXED_SEARCH_PATH',
  case
    when exists (
      select 1
      from target_function
      where exists (
        select 1
        from unnest(coalesce(proconfig, array[]::text[])) item
        where item like 'search_path=%'
      )
    ) then 'PASS'
    else 'FAIL'
  end,
  jsonb_build_object(
    'proconfig',
    (select to_jsonb(proconfig) from target_function limit 1)
  )
union all
select
  'A16P_TX_NO_EXECUTE_FOR_ANON_OR_PUBLIC',
  case
    when not exists (
      select 1
      from function_acl
      where privilege_type = 'EXECUTE'
        and grantee in ('anon', 'PUBLIC')
    ) then 'PASS'
    else 'FAIL'
  end,
  jsonb_build_object(
    'forbidden_execute_grantees',
    coalesce(
      (
        select jsonb_agg(grantee order by grantee)
        from function_acl
        where privilege_type = 'EXECUTE'
          and grantee in ('anon', 'PUBLIC')
      ),
      '[]'::jsonb
    )
  )
union all
select
  'A16P_TX_COMMENT_MARKS_NOT_APPLIED',
  case
    when coalesce((select function_comment from target_function limit 1), '') like '%SQL_CANDIDATE_STATUS=NOT_APPLIED%'
      and coalesce((select function_comment from target_function limit 1), '') like '%DO_NOT_RUN_AUTOMATICALLY%'
    then 'PASS'
    else 'FAIL'
  end,
  jsonb_build_object(
    'comment',
    (select function_comment from target_function limit 1)
  )
union all
select
  'A16P_TX_FUNCTION_FAILS_CLOSED',
  case
    when coalesce((select function_definition from target_function limit 1), '') like '%REAL_EXECUTION_BRANCH_NOT_OPEN_IN_A16P_TX%'
      and coalesce((select function_definition from target_function limit 1), '') like '%can_run_official_import%'
      and coalesce((select function_definition from target_function limit 1), '') like '%false%'
    then 'PASS'
    else 'FAIL'
  end,
  jsonb_build_object('fail_closed_tokens_present', exists (select 1 from target_function))
union all
select
  'A16P_TX_NO_A16P_POLICY_ON_REAL_TABLES',
  case when (select policy_count from dangerous_a16p_tx_policy) = 0 then 'PASS' else 'FAIL' end,
  jsonb_build_object('policy_count', (select policy_count from dangerous_a16p_tx_policy))
union all
select
  'A16P_TX_NO_AUTO_IMPORT_TRIGGER',
  case when (select trigger_count from auto_import_triggers) = 0 then 'PASS' else 'FAIL' end,
  jsonb_build_object('trigger_count', (select trigger_count from auto_import_triggers));
