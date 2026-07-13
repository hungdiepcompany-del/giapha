-- A17O_TX1_GROUPED_OFFICIAL_IMPORT_TRANSACTION_EXECUTOR_POST_APPLY_VERIFIER
-- SELECT_ONLY_METADATA_AND_COUNT_VERIFICATION
-- DO_NOT_CALL_RPC
-- DO_NOT_MUTATE_DATA
-- DO_NOT_LOCK_ROWS

with expected_function as (
  select
    p.oid,
    n.nspname as function_schema,
    p.proname as function_name,
    pg_get_function_identity_arguments(p.oid) as identity_arguments,
    pg_get_function_result(p.oid) as result_type,
    p.provolatile,
    p.prosecdef,
    coalesce(array_to_string(p.proconfig, ','), '') as function_config,
    pg_get_functiondef(p.oid) as function_definition
  from pg_proc p
  join pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public'
    and p.proname = 'a17o_tx_execute_grouped_giapha4_official_import'
),
old_function as (
  select
    pg_get_function_identity_arguments(p.oid) as identity_arguments,
    pg_get_function_result(p.oid) as result_type,
    p.prosecdef,
    coalesce(array_to_string(p.proconfig, ','), '') as function_config
  from pg_proc p
  join pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public'
    and p.proname = 'a16p_tx_execute_giapha4_official_import'
),
execute_grants as (
  select grantee, privilege_type
  from information_schema.routine_privileges
  where routine_schema = 'public'
    and routine_name = 'a17o_tx_execute_grouped_giapha4_official_import'
),
idempotency_table as (
  select c.oid, c.relrowsecurity
  from pg_class c
  join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public'
    and c.relname = 'official_import_grouped_execution_idempotency'
),
idempotency_rows as (
  select count(*)::integer as row_count
  from public.official_import_grouped_execution_idempotency
),
column_checks as (
  select
    exists (
      select 1 from information_schema.columns
      where table_schema = 'public'
        and table_name = 'official_import_batches'
        and column_name = 'grouped_execution_contract_version'
    ) as batch_contract_version_column_exists,
    exists (
      select 1 from information_schema.columns
      where table_schema = 'public'
        and table_name = 'official_import_batches'
        and column_name = 'mutation_plan_hash'
    ) as batch_mutation_plan_hash_column_exists,
    exists (
      select 1 from information_schema.columns
      where table_schema = 'public'
        and table_name = 'official_import_rollback_manifests'
        and column_name = 'grouped_family_rollback_summary'
    ) as rollback_grouped_summary_column_exists
),
constraint_checks as (
  select
    exists (
      select 1 from pg_constraint
      where conname = 'official_import_grouped_execution_actor_key_unique'
    ) as idempotency_actor_key_unique_exists,
    exists (
      select 1 from pg_constraint
      where conname = 'official_import_batches_grouped_contract_version_check'
    ) as batch_contract_version_check_exists,
    exists (
      select 1 from pg_constraint
      where conname = 'official_import_batches_mutation_plan_hash_check'
    ) as batch_mutation_plan_hash_check_exists,
    exists (
      select 1 from pg_constraint
      where conname = 'official_import_rollback_grouped_summary_shape_check'
    ) as rollback_grouped_summary_shape_check_exists
),
policy_checks as (
  select
    exists (
      select 1 from pg_policies
      where schemaname = 'public'
        and tablename = 'official_import_grouped_execution_idempotency'
        and policyname = 'a17o_tx1_grouped_execution_select_own'
    ) as select_policy_exists,
    exists (
      select 1 from pg_policies
      where schemaname = 'public'
        and tablename = 'official_import_grouped_execution_idempotency'
        and policyname = 'a17o_tx1_grouped_execution_insert_own'
    ) as insert_policy_exists,
    exists (
      select 1 from pg_policies
      where schemaname = 'public'
        and tablename = 'official_import_grouped_execution_idempotency'
        and policyname = 'a17o_tx1_grouped_execution_update_own'
    ) as update_policy_exists
),
table_grants as (
  select grantee, privilege_type
  from information_schema.table_privileges
  where table_schema = 'public'
    and table_name = 'official_import_grouped_execution_idempotency'
),
baseline_counts as (
  select
    (select count(*)::integer from public.families where deleted_at is null) as active_family_count,
    (
      select count(*)::integer
      from public.family_parents fp
      join public.families f on f.id = fp.family_id
      where fp.deleted_at is null
        and f.deleted_at is null
    ) as active_parent_membership_count,
    (
      select count(*)::integer
      from public.family_children fc
      join public.families f on f.id = fc.family_id
      where fc.deleted_at is null
        and f.deleted_at is null
    ) as active_child_membership_count,
    (
      select count(*)::integer
      from public.families
      where canonical_key is not null
    ) as canonical_key_backfill_count,
    (
      select count(*)::integer
      from public.revisions
      where change_reason = 'A-17O-TX1 grouped official import transaction executor'
        or after_json ->> 'source' = 'A-17O-TX1 grouped official import transaction executor'
    ) as grouped_executor_revision_count,
    (
      select count(*)::integer
      from public.official_import_batches
      where grouped_execution_contract_version = 1
         or mutation_plan_hash is not null
    ) as grouped_batch_count,
    (
      select count(*)::integer
      from public.official_import_rollback_manifests
      where grouped_family_rollback_summary <> '{}'::jsonb
    ) as grouped_rollback_manifest_count
),
completed_session_guard as (
  select
    exists (
      select 1
      from public.import_sessions
      where id = '2af4bfb6-a20e-453e-9804-1b8c0afbdd68'::uuid
        and status = 'write_completed'
    ) as completed_session_still_completed,
    exists (
      select 1
      from public.official_import_batches
      where import_session_id = '2af4bfb6-a20e-453e-9804-1b8c0afbdd68'::uuid
        and status = 'completed'
    ) as completed_batch_still_completed
)
select *
from (
  select
    'a17o_tx1_function_exists' as check_name,
    exists (select 1 from expected_function) as pass,
    jsonb_build_object('function_count', (select count(*) from expected_function)) as details
  union all
  select
    'a17o_tx1_exact_argument_types',
    exists (
      select 1
      from expected_function
      where identity_arguments =
        'p_import_session_id uuid, p_confirm_marker text, p_confirm_manifest_hash text, p_confirm_review_pack_hash text, p_grouped_plan jsonb, p_idempotency_key text, p_mutation_plan_hash text, p_confirm_validation_errors_resolved boolean, p_confirm_rollback_reviewed boolean, p_confirm_audit_reviewed boolean, p_dry_run_only boolean'
    ),
    jsonb_build_object('identity_arguments', (select identity_arguments from expected_function limit 1))
  union all
  select
    'a17o_tx1_return_type_jsonb',
    exists (select 1 from expected_function where result_type = 'jsonb'),
    jsonb_build_object('result_type', (select result_type from expected_function limit 1))
  union all
  select
    'a17o_tx1_volatility_volatile',
    exists (select 1 from expected_function where provolatile = 'v'),
    jsonb_build_object('provolatile', (select provolatile from expected_function limit 1))
  union all
  select
    'a17o_tx1_security_invoker',
    exists (select 1 from expected_function where prosecdef = false),
    jsonb_build_object('prosecdef', (select prosecdef from expected_function limit 1))
  union all
  select
    'a17o_tx1_fixed_search_path',
    exists (
      select 1 from expected_function
      where function_config like '%search_path=public, auth, pg_temp%'
    ),
    jsonb_build_object('function_config', (select function_config from expected_function limit 1))
  union all
  select
    'a17o_tx1_no_public_execute',
    not exists (select 1 from execute_grants where grantee = 'PUBLIC'),
    jsonb_build_object('public_execute_count', (select count(*) from execute_grants where grantee = 'PUBLIC'))
  union all
  select
    'a17o_tx1_no_anon_execute',
    not exists (select 1 from execute_grants where grantee = 'anon'),
    jsonb_build_object('anon_execute_count', (select count(*) from execute_grants where grantee = 'anon'))
  union all
  select
    'a17o_tx1_authenticated_execute_grant',
    exists (
      select 1 from execute_grants
      where grantee = 'authenticated'
        and privilege_type = 'EXECUTE'
    ),
    jsonb_build_object('authenticated_execute_count', (select count(*) from execute_grants where grantee = 'authenticated'))
  union all
  select
    'a17o_tx1_old_executor_preserved',
    exists (
      select 1
      from old_function
      where identity_arguments =
        'p_import_session_id uuid, p_confirm_marker text, p_confirm_manifest_hash text, p_confirm_review_pack_hash text, p_confirm_validation_errors_resolved boolean, p_confirm_rollback_reviewed boolean, p_confirm_audit_reviewed boolean, p_dry_run_only boolean'
        and result_type = 'jsonb'
        and prosecdef = false
        and function_config like '%search_path=public, pg_temp%'
    ),
    jsonb_build_object('old_function_count', (select count(*) from old_function))
  union all
  select
    'a17o_tx1_grouped_payload_contract_present',
    exists (
      select 1
      from expected_function
      where function_definition like '%familyGroups%'
        and function_definition like '%parentMemberships%'
        and function_definition like '%childMemberships%'
        and function_definition like '%sourcePersonFingerprint%'
        and function_definition like '%mutationPlanHash%'
    ),
    jsonb_build_object('payload_contract_checked', true)
  union all
  select
    'a17o_tx1_idempotency_table_exists',
    exists (select 1 from idempotency_table),
    jsonb_build_object('table_count', (select count(*) from idempotency_table))
  union all
  select
    'a17o_tx1_idempotency_rls_enabled',
    exists (select 1 from idempotency_table where relrowsecurity),
    jsonb_build_object('relrowsecurity', (select relrowsecurity from idempotency_table limit 1))
  union all
  select
    'a17o_tx1_idempotency_policies_exist',
    (select select_policy_exists and insert_policy_exists and update_policy_exists from policy_checks),
    to_jsonb((select policy_checks from policy_checks))
  union all
  select
    'a17o_tx1_idempotency_grants_safe',
    not exists (select 1 from table_grants where grantee in ('anon', 'PUBLIC'))
      and exists (select 1 from table_grants where grantee = 'authenticated' and privilege_type = 'SELECT')
      and exists (select 1 from table_grants where grantee = 'authenticated' and privilege_type = 'INSERT')
      and exists (select 1 from table_grants where grantee = 'authenticated' and privilege_type = 'UPDATE'),
    jsonb_build_object(
      'anon_public_grant_count', (select count(*) from table_grants where grantee in ('anon', 'PUBLIC')),
      'authenticated_grant_count', (select count(*) from table_grants where grantee = 'authenticated')
    )
  union all
  select
    'a17o_tx1_idempotency_constraints_exist',
    (select idempotency_actor_key_unique_exists from constraint_checks),
    to_jsonb((select constraint_checks from constraint_checks))
  union all
  select
    'a17o_tx1_batch_columns_and_constraints_exist',
    (select batch_contract_version_column_exists and batch_mutation_plan_hash_column_exists from column_checks)
      and (select batch_contract_version_check_exists and batch_mutation_plan_hash_check_exists from constraint_checks),
    jsonb_build_object('columns', (select to_jsonb(column_checks) from column_checks), 'constraints', (select to_jsonb(constraint_checks) from constraint_checks))
  union all
  select
    'a17o_tx1_rollback_summary_column_exists',
    (select rollback_grouped_summary_column_exists from column_checks)
      and (select rollback_grouped_summary_shape_check_exists from constraint_checks),
    jsonb_build_object('columns', (select to_jsonb(column_checks) from column_checks), 'constraints', (select to_jsonb(constraint_checks) from constraint_checks))
  union all
  select
    'a17o_tx1_no_seeded_idempotency_rows',
    (select row_count = 0 from idempotency_rows),
    jsonb_build_object('row_count', (select row_count from idempotency_rows))
  union all
  select
    'a17o_tx1_baseline_counts_unchanged',
    (select active_family_count = 74 and active_parent_membership_count = 140 and active_child_membership_count = 73 from baseline_counts),
    to_jsonb((select baseline_counts from baseline_counts))
  union all
  select
    'a17o_tx1_no_grouped_executor_rows_created_by_apply',
    (select grouped_executor_revision_count = 0 and grouped_batch_count = 0 and grouped_rollback_manifest_count = 0 from baseline_counts),
    to_jsonb((select baseline_counts from baseline_counts))
  union all
  select
    'a17o_tx1_completed_production_session_still_non_executable',
    (select completed_session_still_completed and completed_batch_still_completed from completed_session_guard),
    to_jsonb((select completed_session_guard from completed_session_guard))
) checks
order by check_name;
