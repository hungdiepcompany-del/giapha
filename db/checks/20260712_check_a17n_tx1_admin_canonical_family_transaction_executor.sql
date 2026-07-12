-- A17N_TX1_ADMIN_CANONICAL_FAMILY_TRANSACTION_EXECUTOR_POST_APPLY_VERIFIER
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
    p.proowner::regrole::text as owner_name,
    coalesce(array_to_string(p.proconfig, ','), '') as function_config,
    pg_get_functiondef(p.oid) as function_definition
  from pg_proc p
  join pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public'
    and p.proname = 'execute_admin_canonical_family_parent_child_write'
),
execute_grants as (
  select
    grantee,
    privilege_type
  from information_schema.routine_privileges
  where routine_schema = 'public'
    and routine_name = 'execute_admin_canonical_family_parent_child_write'
),
idempotency_table as (
  select
    c.oid,
    n.nspname as table_schema,
    c.relname as table_name,
    c.relrowsecurity
  from pg_class c
  join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public'
    and c.relname = 'admin_canonical_family_write_idempotency'
),
idempotency_rows as (
  select count(*)::integer as row_count
  from public.admin_canonical_family_write_idempotency
),
baseline_counts as (
  select
    (select count(*)::integer from public.families) as family_count,
    (select count(*)::integer from public.family_parents) as family_parent_count,
    (select count(*)::integer from public.family_children) as family_child_count,
    (
      select count(*)::integer
      from public.families
      where canonical_key is not null
    ) as canonical_key_backfill_count,
    (
      select count(*)::integer
      from public.family_reconciliation_batches
    ) as reconciliation_batch_count,
    (
      select count(*)::integer
      from public.family_canonicalization_decisions
    ) as owner_decision_count,
    (
      select count(*)::integer
      from public.family_reconciliation_rollback_manifests
    ) as rollback_manifest_count
),
policy_checks as (
  select
    exists (
      select 1
      from pg_policies
      where schemaname = 'public'
        and tablename = 'admin_canonical_family_write_idempotency'
        and policyname = 'a17n_tx1_idempotency_select_own'
    ) as idempotency_select_policy_exists,
    exists (
      select 1
      from pg_policies
      where schemaname = 'public'
        and tablename = 'admin_canonical_family_write_idempotency'
        and policyname = 'a17n_tx1_idempotency_insert_own'
    ) as idempotency_insert_policy_exists,
    exists (
      select 1
      from pg_policies
      where schemaname = 'public'
        and tablename = 'admin_canonical_family_write_idempotency'
        and policyname = 'a17n_tx1_idempotency_update_own'
    ) as idempotency_update_policy_exists,
    exists (
      select 1
      from pg_policies
      where schemaname = 'public'
        and tablename = 'revisions'
        and policyname = 'a17n_tx1_revisions_insert_admin_canonical_family_write'
    ) as revision_insert_policy_exists
)
select *
from (
  select
    'a17n_tx1_function_exists' as check_name,
    exists (select 1 from expected_function) as pass,
    jsonb_build_object('function_count', (select count(*) from expected_function)) as details
  union all
  select
    'a17n_tx1_exact_argument_types',
    exists (
      select 1
      from expected_function
      where identity_arguments =
        'p_operation_type text, p_idempotency_key text, p_actor_profile_id uuid, p_family_action text, p_target_family_id uuid, p_expected_family_updated_at timestamp with time zone, p_allow_canonical_metadata_update boolean, p_canonical_key text, p_canonical_identity_version integer, p_parent_person_ids uuid[], p_parent_roles text[], p_parent_relationship_types text[], p_child_person_id uuid, p_child_relationship_type text, p_source_action text, p_mutation_plan_hash text'
    ),
    jsonb_build_object('identity_arguments', (select identity_arguments from expected_function limit 1))
  union all
  select
    'a17n_tx1_return_type_jsonb',
    exists (select 1 from expected_function where result_type = 'jsonb'),
    jsonb_build_object('result_type', (select result_type from expected_function limit 1))
  union all
  select
    'a17n_tx1_volatility_volatile',
    exists (select 1 from expected_function where provolatile = 'v'),
    jsonb_build_object('provolatile', (select provolatile from expected_function limit 1))
  union all
  select
    'a17n_tx1_security_invoker',
    exists (select 1 from expected_function where prosecdef = false),
    jsonb_build_object('prosecdef', (select prosecdef from expected_function limit 1))
  union all
  select
    'a17n_tx1_fixed_search_path',
    exists (
      select 1
      from expected_function
      where function_config like '%search_path=public, auth, pg_temp%'
    ),
    jsonb_build_object('function_config', (select function_config from expected_function limit 1))
  union all
  select
    'a17n_tx1_no_public_execute',
    not exists (select 1 from execute_grants where grantee = 'PUBLIC'),
    jsonb_build_object('public_execute_count', (select count(*) from execute_grants where grantee = 'PUBLIC'))
  union all
  select
    'a17n_tx1_no_anon_execute',
    not exists (select 1 from execute_grants where grantee = 'anon'),
    jsonb_build_object('anon_execute_count', (select count(*) from execute_grants where grantee = 'anon'))
  union all
  select
    'a17n_tx1_authenticated_execute_grant',
    exists (
      select 1
      from execute_grants
      where grantee = 'authenticated'
        and privilege_type = 'EXECUTE'
    ),
    jsonb_build_object('authenticated_execute_count', (select count(*) from execute_grants where grantee = 'authenticated'))
  union all
  select
    'a17n_tx1_function_scope_add_parent_child_only',
    exists (
      select 1
      from expected_function
      where function_definition like '%ADD_PARENT%'
        and function_definition like '%ADD_CHILD%'
        and function_definition not ilike '%ADD_SPOUSE%'
        and function_definition not ilike '%IMPORTER%'
        and function_definition not ilike '%RECONCILIATION_EXECUTED%'
    ),
    jsonb_build_object('scope_checked', true)
  union all
  select
    'a17n_tx1_idempotency_table_exists',
    exists (select 1 from idempotency_table),
    jsonb_build_object('table_count', (select count(*) from idempotency_table))
  union all
  select
    'a17n_tx1_idempotency_rls_enabled',
    exists (select 1 from idempotency_table where relrowsecurity),
    jsonb_build_object('relrowsecurity', (select relrowsecurity from idempotency_table limit 1))
  union all
  select
    'a17n_tx1_idempotency_policies_exist',
    (
      select idempotency_select_policy_exists
        and idempotency_insert_policy_exists
        and idempotency_update_policy_exists
      from policy_checks
    ),
    to_jsonb((select policy_checks from policy_checks))
  union all
  select
    'a17n_tx1_revision_insert_policy_exists',
    (select revision_insert_policy_exists from policy_checks),
    to_jsonb((select policy_checks from policy_checks))
  union all
  select
    'a17n_tx1_no_seeded_idempotency_rows',
    (select row_count = 0 from idempotency_rows),
    jsonb_build_object('row_count', (select row_count from idempotency_rows))
  union all
  select
    'a17n_tx1_existing_family_count_unchanged',
    (select family_count = 74 from baseline_counts),
    jsonb_build_object('family_count', (select family_count from baseline_counts))
  union all
  select
    'a17n_tx1_parent_count_unchanged',
    (select family_parent_count = 140 from baseline_counts),
    jsonb_build_object('family_parent_count', (select family_parent_count from baseline_counts))
  union all
  select
    'a17n_tx1_child_count_unchanged',
    (select family_child_count = 73 from baseline_counts),
    jsonb_build_object('family_child_count', (select family_child_count from baseline_counts))
  union all
  select
    'a17n_tx1_no_canonical_key_backfill',
    (select canonical_key_backfill_count = 0 from baseline_counts),
    jsonb_build_object('canonical_key_backfill_count', (select canonical_key_backfill_count from baseline_counts))
  union all
  select
    'a17n_tx1_no_reconciliation_rows_created',
    (
      select reconciliation_batch_count = 0
        and owner_decision_count = 0
        and rollback_manifest_count = 0
      from baseline_counts
    ),
    to_jsonb((select baseline_counts from baseline_counts))
) checks
order by check_name;
