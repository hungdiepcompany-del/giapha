-- A16V_OFFICIAL_IMPORT_REAL_TRANSACTION_EXECUTION_BRANCH_VERIFY
-- SELECT_ONLY_VERIFICATION
-- DO_NOT_MUTATE_DATA
-- DO_NOT_CALL_RPC
-- DO_NOT_RUN_OFFICIAL_IMPORT
-- Use after owner manually applies:
-- db/migrations/20260703_0016_a16v_official_import_real_transaction_execution_branch_candidate.sql

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
required_tokens as (
  select 'A16V marker' as check_name, 'A16V_OFFICIAL_IMPORT_REAL_TRANSACTION_EXECUTION_BRANCH_CANDIDATE' as token
  union all select 'all or nothing batch', 'official_import_batches'
  union all select 'rollback manifest', 'official_import_rollback_manifests'
  union all select 'idempotency guard', 'idempotency_key'
  union all select 'people insert branch', 'insert into public.people'
  union all select 'family insert branch', 'insert into public.families'
  union all select 'family parents insert branch', 'insert into public.family_parents'
  union all select 'family children insert branch', 'insert into public.family_children'
  union all select 'revision audit branch', 'insert into public.revisions'
  union all select 'completed batch branch', 'IMPORT_COMPLETED'
),
token_results as (
  select
    required_tokens.check_name,
    required_tokens.token,
    exists (
      select 1
      from function_check
      where function_check.function_def ilike '%' || required_tokens.token || '%'
        or coalesce(function_check.function_comment, '') ilike '%' || required_tokens.token || '%'
    ) as present
  from required_tokens
),
table_results as (
  select
    'official_import_batches exists' as check_name,
    to_regclass('public.official_import_batches') is not null as pass
  union all
  select
    'official_import_rollback_manifests exists',
    to_regclass('public.official_import_rollback_manifests') is not null
  union all
  select
    'idempotency unique guard exists',
    exists (
      select 1
      from pg_indexes
      where schemaname = 'public'
        and tablename = 'official_import_batches'
        and indexname = 'official_import_batches_import_session_unique_idx'
    )
  union all
  select
    'rollback unique guard exists',
    exists (
      select 1
      from pg_indexes
      where schemaname = 'public'
        and tablename = 'official_import_rollback_manifests'
        and indexname = 'official_import_rollback_session_unique_idx'
    )
),
policy_results as (
  select
    'no anon/public execute grants' as check_name,
    not exists (select 1 from execute_grants) as pass
  union all
  select
    'not security definer',
    exists (select 1 from function_check where prosecdef = false)
  union all
  select
    'fixed search_path public pg_temp',
    exists (
      select 1
      from function_check
      where proconfig::text like '%search_path=public, pg_temp%'
    )
  union all
  select
    'no auto import trigger',
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
  'A16V_REAL_TRANSACTION_BRANCH_VERIFY' as verification_scope,
  check_name,
  case when pass then 'PASS' else 'FAIL' end as result
from table_results
union all
select
  'A16V_REAL_TRANSACTION_BRANCH_VERIFY',
  check_name,
  case when pass then 'PASS' else 'FAIL' end
from policy_results
union all
select
  'A16V_REAL_TRANSACTION_BRANCH_VERIFY',
  check_name,
  case when present then 'PASS' else 'FAIL' end
from token_results
order by check_name;
