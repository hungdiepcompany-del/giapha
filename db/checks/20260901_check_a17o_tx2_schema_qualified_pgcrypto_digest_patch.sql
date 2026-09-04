-- A-17O-TX2 SELECT-only verifier.
-- Verifies the manually applied 0030 digest-resolution patch without calling the executor.
-- SELECT_ONLY_VERIFIER=YES
-- DO_NOT_CALL_EXECUTOR

with target_function as (
  select
    p.oid,
    p.provolatile,
    p.prosecdef,
    p.proconfig,
    p.proacl,
    p.proowner,
    pg_get_function_identity_arguments(p.oid) as identity_arguments,
    pg_get_function_result(p.oid) as return_type,
    pg_get_functiondef(p.oid) as function_source
  from pg_proc p
  join pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public'
    and p.proname = 'a17o_tx_execute_grouped_giapha4_official_import'
    and pg_get_function_identity_arguments(p.oid) =
      'p_import_session_id uuid, p_confirm_marker text, p_confirm_manifest_hash text, p_confirm_review_pack_hash text, p_grouped_plan jsonb, p_idempotency_key text, p_mutation_plan_hash text, p_confirm_validation_errors_resolved boolean, p_confirm_rollback_reviewed boolean, p_confirm_audit_reviewed boolean, p_dry_run_only boolean'
),
function_cardinality as (
  select count(*) = 1 as exactly_one_overload_bound
  from target_function
),
digest_evidence as (
  select
    exists (
      select 1
      from pg_proc p
      join pg_namespace n on n.oid = p.pronamespace
      where n.nspname = 'extensions'
        and p.proname = 'digest'
        and pg_get_function_identity_arguments(p.oid) = 'bytea, text'
    ) as extensions_digest_bytea_text_exists,
    regexp_count(function_source, 'extensions[.]digest[[:space:]]*[(]') as qualified_extensions_digest_call_count,
    regexp_count(function_source, '(^|[^[:alnum:]_.])digest[[:space:]]*[(]') as unqualified_executable_digest_call_count,
    regexp_count(function_source, 'pg_catalog[.]encode[[:space:]]*[(]') as qualified_pg_catalog_encode_call_count,
    regexp_count(function_source, 'pg_catalog[.]convert_to[[:space:]]*[(]') as qualified_pg_catalog_convert_to_call_count
  from target_function
),
acl_evidence as (
  select
    exists (
      select 1
      from target_function tf
      cross join lateral aclexplode(coalesce(tf.proacl, acldefault('f', tf.proowner))) acl
      where acl.privilege_type = 'EXECUTE'
        and acl.grantee = 'authenticated'::regrole
    ) as authenticated_execute_grant_present,
    exists (
      select 1
      from target_function tf
      cross join lateral aclexplode(coalesce(tf.proacl, acldefault('f', tf.proowner))) acl
      where acl.privilege_type = 'EXECUTE'
        and acl.grantee = 'anon'::regrole
    ) as anon_execute_grant_present,
    exists (
      select 1
      from target_function tf
      cross join lateral aclexplode(coalesce(tf.proacl, acldefault('f', tf.proowner))) acl
      where acl.privilege_type = 'EXECUTE'
        and acl.grantee = 0
    ) as public_execute_grant_present
),
dry_run_positions as (
  select
    regexp_instr(lower(function_source), 'if[[:space:]]+p_dry_run_only([[:space:]]+is[[:space:]]+true)?[[:space:]]+then') as dry_run_condition_pos,
    strpos(lower(function_source), 'insert into public.official_import_grouped_execution_idempotency') as idempotency_write_pos,
    strpos(lower(function_source), 'insert into public.people (') as people_write_pos,
    strpos(lower(function_source), 'insert into public.official_import_batches (') as batch_write_pos,
    strpos(lower(function_source), 'insert into public.families (') as family_write_pos,
    strpos(lower(function_source), 'insert into public.revisions (') as audit_write_pos,
    strpos(lower(function_source), 'insert into public.official_import_rollback_manifests (') as rollback_write_pos,
    function_source
  from target_function
),
dry_run_return as (
  select
    dry_run_condition_pos,
    case when dry_run_condition_pos > 0 then
      dry_run_condition_pos + regexp_instr(substr(function_source, dry_run_condition_pos), 'return[[:space:]]+jsonb_build_object[[:space:]]*[(]') - 1
      else 0
    end as dry_run_return_pos,
    case when dry_run_condition_pos > 0 then
      dry_run_condition_pos + regexp_instr(substr(function_source, dry_run_condition_pos), 'end[[:space:]]+if[[:space:]]*;') - 1
      else 0
    end as dry_run_branch_end_pos,
    idempotency_write_pos,
    people_write_pos,
    batch_write_pos,
    family_write_pos,
    audit_write_pos,
    rollback_write_pos
  from dry_run_positions
),
dry_run_order as (
  select
    dry_run_condition_pos > 0 as dry_run_conditional_present,
    dry_run_return_pos > dry_run_condition_pos as dry_run_return_present,
    dry_run_return_pos > dry_run_condition_pos and dry_run_branch_end_pos > dry_run_return_pos and idempotency_write_pos > dry_run_branch_end_pos as dry_run_return_before_idempotency_write,
    dry_run_return_pos > dry_run_condition_pos and dry_run_branch_end_pos > dry_run_return_pos and people_write_pos > dry_run_branch_end_pos as dry_run_return_before_people_write,
    dry_run_return_pos > dry_run_condition_pos and dry_run_branch_end_pos > dry_run_return_pos and batch_write_pos > dry_run_branch_end_pos as dry_run_return_before_batch_write,
    dry_run_return_pos > dry_run_condition_pos and dry_run_branch_end_pos > dry_run_return_pos and family_write_pos > dry_run_branch_end_pos as dry_run_return_before_family_write,
    dry_run_return_pos > dry_run_condition_pos and dry_run_branch_end_pos > dry_run_return_pos and audit_write_pos > dry_run_branch_end_pos as dry_run_return_before_audit_write,
    dry_run_return_pos > dry_run_condition_pos and dry_run_branch_end_pos > dry_run_return_pos and rollback_write_pos > dry_run_branch_end_pos as dry_run_return_before_rollback_write,
    case when dry_run_return_pos <= dry_run_condition_pos or dry_run_branch_end_pos <= dry_run_return_pos then 1 else
      (case when idempotency_write_pos <= 0 or idempotency_write_pos < dry_run_branch_end_pos then 1 else 0 end)
      + (case when people_write_pos <= 0 or people_write_pos < dry_run_branch_end_pos then 1 else 0 end)
      + (case when batch_write_pos <= 0 or batch_write_pos < dry_run_branch_end_pos then 1 else 0 end)
      + (case when family_write_pos <= 0 or family_write_pos < dry_run_branch_end_pos then 1 else 0 end)
      + (case when audit_write_pos <= 0 or audit_write_pos < dry_run_branch_end_pos then 1 else 0 end)
      + (case when rollback_write_pos <= 0 or rollback_write_pos < dry_run_branch_end_pos then 1 else 0 end)
    end as dry_run_mutation_path_count
  from dry_run_return
)
select
  'a17o_tx2_schema_qualified_pgcrypto_digest_patch' as result_set,
  (select exactly_one_overload_bound from function_cardinality) as exactly_one_overload_bound,
  exists(select 1 from target_function where return_type = 'jsonb') as return_type_jsonb,
  exists(select 1 from target_function where prosecdef = false) as security_invoker_preserved,
  exists(select 1 from target_function where provolatile = 'v') as volatility_volatile_preserved,
  exists(select 1 from target_function where proconfig = array['search_path=public, auth, pg_temp']) as exact_single_entry_fixed_search_path_preserved,
  (select extensions_digest_bytea_text_exists from digest_evidence) as extensions_digest_bytea_text_exists,
  (select qualified_extensions_digest_call_count from digest_evidence) as qualified_extensions_digest_call_count,
  (select unqualified_executable_digest_call_count from digest_evidence) as unqualified_executable_digest_call_count,
  (select qualified_pg_catalog_encode_call_count from digest_evidence) as qualified_pg_catalog_encode_call_count,
  (select qualified_pg_catalog_convert_to_call_count from digest_evidence) as qualified_pg_catalog_convert_to_call_count,
  (select authenticated_execute_grant_present from acl_evidence) as authenticated_execute_grant_present,
  not (select anon_execute_grant_present from acl_evidence) as anon_execute_grant_absent,
  not (select public_execute_grant_present from acl_evidence) as public_execute_grant_absent,
  (select dry_run_conditional_present from dry_run_order) as dry_run_conditional_present,
  (select dry_run_return_present from dry_run_order) as dry_run_return_present,
  (select dry_run_return_before_idempotency_write from dry_run_order) as dry_run_return_before_idempotency_write,
  (select dry_run_return_before_people_write from dry_run_order) as dry_run_return_before_people_write,
  (select dry_run_return_before_batch_write from dry_run_order) as dry_run_return_before_batch_write,
  (select dry_run_return_before_family_write from dry_run_order) as dry_run_return_before_family_write,
  (select dry_run_return_before_audit_write from dry_run_order) as dry_run_return_before_audit_write,
  (select dry_run_return_before_rollback_write from dry_run_order) as dry_run_return_before_rollback_write,
  (select dry_run_mutation_path_count from dry_run_order) as dry_run_mutation_path_count,
  (
    select dry_run_conditional_present
      and dry_run_return_present
      and dry_run_return_before_idempotency_write
      and dry_run_return_before_people_write
      and dry_run_return_before_batch_write
      and dry_run_return_before_family_write
      and dry_run_return_before_audit_write
      and dry_run_return_before_rollback_write
      and dry_run_mutation_path_count = 0
    from dry_run_order
  ) as dry_run_branch_preserved;
