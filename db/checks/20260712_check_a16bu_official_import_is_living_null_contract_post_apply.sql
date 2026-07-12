-- A16BU_OFFICIAL_IMPORT_IS_LIVING_NULL_CONTRACT_POST_APPLY_VERIFY
-- SELECT_ONLY_METADATA_VERIFICATION
-- DO_NOT_MUTATE_DATA
-- DO_NOT_QUERY_GENEALOGY_ROWS
-- DO_NOT_CALL_RPC
-- DO_NOT_RUN_OFFICIAL_IMPORT
-- Use after owner manually applies:
-- db/migrations/20260712_0022_a16bu_official_import_is_living_null_contract_fix.sql

with function_check as (
  select
    p.oid,
    n.nspname,
    p.proname,
    pg_get_function_identity_arguments(p.oid) as identity_args,
    pg_get_functiondef(p.oid) as function_def,
    obj_description(p.oid, 'pg_proc') as function_comment,
    p.prosecdef,
    p.proconfig
  from pg_proc p
  join pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public'
    and p.proname = 'a16p_tx_execute_giapha4_official_import'
    and pg_get_function_identity_arguments(p.oid) =
      'p_import_session_id uuid, p_confirm_marker text, p_confirm_manifest_hash text, p_confirm_review_pack_hash text, p_confirm_validation_errors_resolved boolean, p_confirm_rollback_reviewed boolean, p_confirm_audit_reviewed boolean, p_dry_run_only boolean'
),
execute_grants as (
  select
    grantee,
    privilege_type
  from information_schema.routine_privileges
  where routine_schema = 'public'
    and routine_name = 'a16p_tx_execute_giapha4_official_import'
    and privilege_type = 'EXECUTE'
    and grantee in ('anon', 'PUBLIC')
),
token_results as (
  select
    'corrected_is_living_boolean_guard' as check_name,
    exists (
      select 1
      from function_check
      where function_def ilike '%lower(btrim(coalesce(candidate ->> ''isLiving'', ''''))) in (''true'', ''false'')%'
    ) as pass
  union all
  select
    'corrected_is_living_boolean_cast',
    exists (
      select 1
      from function_check
      where function_def ilike '%then lower(btrim(candidate ->> ''isLiving''))::boolean%'
    )
  union all
  select
    'corrected_is_living_death_text_fallback',
    exists (
      select 1
      from function_check
      where function_def ilike '%else nullif(btrim(coalesce(candidate ->> ''deathDateText'', '''')), '''') is null%'
    )
  union all
  select
    'old_nullable_is_living_branch_absent',
    not exists (
      select 1
      from function_check
      where function_def ilike '%candidate ? ''isLiving''%'
        or function_def ~* '\(candidate\s*->>\s*''isLiving''\)::boolean'
    )
),
policy_results as (
  select
    'function_exists_with_unchanged_signature' as check_name,
    exists (select 1 from function_check) as pass
  union all
  select
    'security_invoker_preserved',
    exists (select 1 from function_check where prosecdef = false)
  union all
  select
    'fixed_search_path_preserved',
    exists (
      select 1
      from function_check
      where proconfig::text like '%search_path=public, pg_temp%'
    )
  union all
  select
    'anon_execute_grant_count_zero',
    not exists (select 1 from execute_grants where grantee = 'anon')
  union all
  select
    'public_execute_grant_count_zero',
    not exists (select 1 from execute_grants where grantee = 'PUBLIC')
  union all
  select
    'no_automatic_import_trigger',
    not exists (
      select 1
      from pg_trigger t
      join pg_class c on c.oid = t.tgrelid
      join pg_namespace n on n.oid = c.relnamespace
      where n.nspname = 'public'
        and not t.tgisinternal
        and pg_get_triggerdef(t.oid) ilike '%a16p_tx_execute_giapha4_official_import%'
    )
)
select
  'A16BU_POST_APPLY_VERIFY' as verification_scope,
  check_name,
  case when pass then 'PASS' else 'FAIL' end as result
from policy_results
union all
select
  'A16BU_POST_APPLY_VERIFY',
  check_name,
  case when pass then 'PASS' else 'FAIL' end
from token_results
union all
select
  'A16BU_POST_APPLY_VERIFY',
  'a16bu_post_apply_verified',
  case
    when
      not exists (select 1 from policy_results where pass = false)
      and not exists (select 1 from token_results where pass = false)
    then 'PASS'
    else 'FAIL'
  end
order by check_name;
