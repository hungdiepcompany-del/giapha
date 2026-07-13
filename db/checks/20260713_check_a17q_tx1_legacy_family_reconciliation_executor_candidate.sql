-- A17Q_TX1_LEGACY_FAMILY_RECONCILIATION_EXECUTOR_CANDIDATE_SELECT_ONLY_VERIFIER
-- SELECT_ONLY_VERIFIER=YES
-- DO_NOT_CALL_EXECUTOR
-- DO_NOT_MUTATE_DATA
-- Intended for a later owner manual post-apply verification phase.

with expected as (
  select
    'execute_admin_a17q_legacy_family_reconciliation'::text as function_name,
    'A17P_MANUAL_21_GROUP_RECONCILIATION_APPROVED'::text as owner_marker,
    '777a8bb13ff45eb9f46fd817c392098ada4a2d550cad8e6ee4c6cd896b874ad0'::text as decision_pack_sha256,
    '7dd719c926dc560aa69bc7070c395535942823e87739d9893d0161713e151740'::text as approved_group_plan_sha256,
    'ee255398f84dc2ce899d14056fb0573f771202ca7ad71e598cbbe7fc47707a9f'::text as role_correction_plan_sha256,
    '7898280dab816af96b6a9277b93b49429c5db8a71c9f24739a7d55660a0bdd61'::text as excluded_scope_sha256,
    '4c0beb0de1589a7728b7f8b4918844e3103aa773ad3a5ab8e87d1ab2cead9ff3'::text as forecast_sha256,
    '721e2ae3d95dd418af40b6459531b870'::text as excluded_group_ref,
    array[
      '7e8e8b20-49ce-49f0-aba8-e55f441fc8cc'::uuid,
      '0dc5e67d-9f5e-4270-8783-3393fe3843a4'::uuid,
      '5b437738-e8a3-4fef-80de-9c8e5ff0839d'::uuid
    ] as excluded_family_ids,
    '990de69e-2239-4a00-995c-6292ce4a814a'::uuid as deleted_family_id,
    '16ead1f516a885724a2bddd11e14472b'::text as deleted_safe_family_ref
), function_meta as (
  select
    p.oid,
    n.nspname,
    p.proname,
    pg_get_function_identity_arguments(p.oid) as identity_arguments,
    pg_get_function_result(p.oid) as function_result,
    p.provolatile,
    p.prosecdef,
    p.proconfig,
    pg_get_functiondef(p.oid) as function_source
  from pg_proc p
  join pg_namespace n on n.oid = p.pronamespace
  join expected e on e.function_name = p.proname
  where n.nspname = 'public'
), grants as (
  select
    coalesce(bool_or(privilege_type = 'EXECUTE' and grantee = 'PUBLIC'), false) as public_execute_present,
    coalesce(bool_or(privilege_type = 'EXECUTE' and grantee = 'anon'), false) as anon_execute_present,
    coalesce(bool_or(privilege_type = 'EXECUTE' and grantee = 'authenticated'), false) as authenticated_execute_present
  from information_schema.routine_privileges rp
  join expected e on e.function_name = rp.routine_name
  where rp.routine_schema = 'public'
), column_evidence as (
  select
    exists (
      select 1
      from information_schema.columns
      where table_schema = 'public'
        and table_name = 'family_reconciliation_batches'
        and column_name = 'success_result'
        and data_type = 'jsonb'
    ) as a17q_tx1_success_result_column_present,
    exists (
      select 1
      from information_schema.columns
      where table_schema = 'public'
        and table_name = 'family_reconciliation_batches'
        and column_name = 'success_result_sha256'
        and data_type = 'text'
    ) as a17q_tx1_success_result_sha256_column_present
), constraint_evidence as (
  select
    exists (
      select 1
      from pg_constraint
      where conname = 'family_reconciliation_batches_success_result_shape_check'
        and conrelid = 'public.family_reconciliation_batches'::regclass
    ) as a17q_tx1_success_result_shape_constraint_present,
    exists (
      select 1
      from pg_constraint
      where conname = 'family_reconciliation_batches_success_result_sha256_check'
        and conrelid = 'public.family_reconciliation_batches'::regclass
    ) as a17q_tx1_success_result_sha256_constraint_present
), batch_evidence as (
  select
    count(*) filter (where approved_audit_hash = (select decision_pack_sha256 from expected)) as a17q_tx1_decision_pack_batch_count,
    count(*) filter (
      where approved_audit_hash = (select decision_pack_sha256 from expected)
        and status = 'completed'
    ) as a17q_tx1_completed_batch_count,
    count(*) filter (
      where approved_audit_hash = (select decision_pack_sha256 from expected)
        and status = 'completed'
        and jsonb_typeof(success_result) = 'object'
        and coalesce(success_result ->> 'batch_id', '') = id::text
        and coalesce(success_result ->> 'decision_pack_sha256', '') = (select decision_pack_sha256 from expected)
        and coalesce(success_result_sha256, '') = encode(digest(success_result::text, 'sha256'), 'hex')
    ) as a17q_tx1_completed_batch_stored_success_integrity_count
  from public.family_reconciliation_batches
), rollback_evidence as (
  select count(*) as a17q_tx1_rollback_manifest_count
  from public.family_reconciliation_rollback_manifests manifests
  join public.family_reconciliation_batches batches
    on batches.id = manifests.reconciliation_batch_id
  where batches.approved_audit_hash = (select decision_pack_sha256 from expected)
), policy_evidence as (
  select exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'revisions'
      and policyname = 'a17q_tx1_revisions_insert_legacy_family_reconciliation'
      and cmd = 'INSERT'
      and roles = array['authenticated']::name[]
  ) as a17q_tx1_revision_insert_policy_exists
)
select
  'a17q_tx1_function_contract' as result_set,
  exists(select 1 from function_meta) as a17q_tx1_function_exists,
  exists(
    select 1 from function_meta
    where identity_arguments = 'p_owner_approval_marker text, p_decision_pack_sha256 text, p_approved_group_plan_sha256 text, p_role_correction_plan_sha256 text, p_excluded_scope_sha256 text, p_forecast_sha256 text, p_idempotency_key text, p_confirm_backup_reviewed boolean, p_confirm_rollback_reviewed boolean, p_confirm_audit_reviewed boolean, p_confirm_excluded_scope_reviewed boolean, p_dry_run_only boolean'
  ) as a17q_tx1_exact_signature,
  exists(select 1 from function_meta where function_result = 'jsonb') as a17q_tx1_return_type_jsonb,
  exists(select 1 from function_meta where provolatile = 'v') as a17q_tx1_volatility_volatile,
  exists(select 1 from function_meta where prosecdef = false) as a17q_tx1_security_invoker,
  exists(select 1 from function_meta where proconfig @> array['search_path=public, auth, pg_temp']) as a17q_tx1_fixed_search_path,
  (select not public_execute_present from grants) as a17q_tx1_no_public_execute,
  (select not anon_execute_present from grants) as a17q_tx1_no_anon_execute,
  (select authenticated_execute_present from grants) as a17q_tx1_authenticated_execute_grant,
  exists(select 1 from function_meta where function_source like '%' || (select decision_pack_sha256 from expected) || '%') as a17q_tx1_decision_pack_hash_embedded,
  exists(select 1 from function_meta where function_source like '%' || (select approved_group_plan_sha256 from expected) || '%') as a17q_tx1_approved_group_hash_embedded,
  exists(select 1 from function_meta where function_source like '%' || (select role_correction_plan_sha256 from expected) || '%') as a17q_tx1_role_correction_hash_embedded,
  exists(select 1 from function_meta where function_source like '%' || (select excluded_scope_sha256 from expected) || '%') as a17q_tx1_excluded_scope_hash_embedded,
  exists(select 1 from function_meta where function_source like '%' || (select forecast_sha256 from expected) || '%') as a17q_tx1_forecast_hash_embedded,
  exists(select 1 from function_meta where function_source like '%' || (select excluded_group_ref from expected) || '%') as a17q_tx1_excluded_group_guard_embedded,
  exists(select 1 from function_meta where function_source like '%' || (select deleted_family_id::text from expected) || '%') as a17q_tx1_deleted_family_guard_embedded,
  exists(select 1 from function_meta where function_source like '%pg_try_advisory_xact_lock%') as a17q_tx1_advisory_lock_present,
  exists(select 1 from function_meta where function_source like '%for update%') as a17q_tx1_row_locking_present,
  exists(select 1 from function_meta where function_source like '%IDEMPOTENCY_STATE_CHECK%') as a17q_tx1_idempotency_state_check_present,
  exists(select 1 from function_meta where function_source like '%REPLAY_COMPLETED_SUCCESS%') as a17q_tx1_idempotency_replay_success_present,
  exists(select 1 from function_meta where function_source like '%A17Q_IDEMPOTENCY_KEY_CONFLICT%') as a17q_tx1_idempotency_conflict_guard_present,
  exists(select 1 from function_meta where function_source like '%A17Q_RECONCILIATION_BATCH_REQUIRES_RECOVERY%') as a17q_tx1_recovery_required_guard_present,
  exists(select 1 from function_meta where function_source like '%FULL_PRECONDITION_VALIDATION%') as a17q_tx1_full_precondition_validation_present,
  exists(select 1 from function_meta where function_source like '%DRY_RUN_NOT_CONSUMED%') as a17q_tx1_dry_run_not_consumed_present,
  exists(select 1 from function_meta where function_source like '%RUNNING_BATCH_INSERT%') as a17q_tx1_running_batch_insert_marker_present,
  exists(select 1 from function_meta where function_source like '%PRE_MUTATION_AUDIT_BEFORE_GENEALOGY_MUTATION%') as a17q_tx1_pre_mutation_audit_marker_present,
  exists(select 1 from function_meta where function_source like '%FIRST_GENEALOGY_MUTATION%') as a17q_tx1_first_genealogy_mutation_marker_present,
  exists(select 1 from function_meta where function_source like '%EXACT_EXPECTED_POST_STATE_SNAPSHOT%') as a17q_tx1_exact_expected_post_state_snapshot_present,
  exists(select 1 from function_meta where function_source like '%a17q_group_parent_sets%') as a17q_tx1_group_parent_set_snapshot_present,
  exists(select 1 from function_meta where function_source like '%a17q_expected_child_final_mapping%') as a17q_tx1_child_expected_mapping_present,
  exists(select 1 from function_meta where function_source like '%a17q_expected_parent_final_state%') as a17q_tx1_parent_expected_state_present,
  exists(select 1 from function_meta where function_source like '%A17Q_SAFE_GROUP_REF_MISMATCH%') as a17q_tx1_safe_group_ref_mismatch_guard_present,
  exists(select 1 from function_meta where function_source like '%A17Q_UNEXPECTED_FAMILY_IN_APPROVED_PARENT_SET%') as a17q_tx1_unlisted_parent_set_guard_present,
  exists(select 1 from function_meta where function_source like '%A17Q_MUTATION_ROW_COUNT_MISMATCH%') as a17q_tx1_mutation_count_guard_present,
  exists(select 1 from function_meta where function_source like '%REAL_POST_STATE_VALIDATION%') as a17q_tx1_real_post_state_validation_present,
  exists(select 1 from function_meta where function_source like '%EXACT_POST_STATE_VALIDATION%') as a17q_tx1_exact_post_state_validation_present,
  exists(select 1 from function_meta where function_source like '%A17Q_POST_STATE_VALIDATION_FAILED%') as a17q_tx1_post_state_failure_guard_present,
  exists(select 1 from function_meta where function_source like '%A17Q_GRAPH_VALIDATION_FAILED%') as a17q_tx1_graph_failure_guard_present,
  exists(select 1 from function_meta where function_source like '%A17Q_EXACT_CHILD_POST_STATE_VALIDATION_FAILED%') as a17q_tx1_exact_child_failure_guard_present,
  exists(select 1 from function_meta where function_source like '%A17Q_EXACT_PARENT_ROLE_POST_STATE_VALIDATION_FAILED%') as a17q_tx1_exact_parent_role_failure_guard_present,
  exists(select 1 from function_meta where function_source like '%A17Q_EXACT_FAMILY_CANONICAL_POST_STATE_VALIDATION_FAILED%') as a17q_tx1_exact_family_canonical_failure_guard_present,
  exists(select 1 from function_meta where function_source like '%A17Q_EXACT_GRAPH_POST_STATE_VALIDATION_FAILED%') as a17q_tx1_exact_graph_failure_guard_present,
  exists(select 1 from function_meta where function_source like '%GLOBAL_DUPLICATE_ACTIVE_CANONICAL_KEY_CHECK%') as a17q_tx1_global_duplicate_active_canonical_key_check_present,
  exists(select 1 from function_meta where function_source like '%APPROVED_CANONICAL_KEY_OWNER_CHECK%') as a17q_tx1_approved_canonical_key_owner_check_present,
  exists(select 1 from function_meta where function_source like '%global_duplicate_active_canonical_key_count%') as a17q_tx1_global_canonical_key_result_field_present,
  exists(select 1 from function_meta where function_source like '%approved_key_owned_by_unexpected_active_family_count%') as a17q_tx1_unexpected_approved_key_owner_result_field_present,
  exists(select 1 from function_meta where function_source like '%approved_key_active_owner_count%') as a17q_tx1_approved_key_owner_count_result_field_present,
  exists(select 1 from function_meta where function_source like '%void_family_canonical_active_count%') as a17q_tx1_void_family_canonical_active_result_field_present,
  exists(select 1 from function_meta where function_source like '%GLOBAL_DUPLICATE_ACTIVE_PARENT_MEMBERSHIP_CHECK%') as a17q_tx1_global_duplicate_parent_membership_check_present,
  exists(select 1 from function_meta where function_source like '%GLOBAL_DUPLICATE_ACTIVE_CHILD_MEMBERSHIP_CHECK%') as a17q_tx1_global_duplicate_child_membership_check_present,
  exists(select 1 from function_meta where function_source like '%GLOBAL_PARENT_CHILD_OVERLAP_CHECK%') as a17q_tx1_global_parent_child_overlap_check_present,
  exists(select 1 from function_meta where function_source like '%global_duplicate_active_parent_membership_count%') as a17q_tx1_global_parent_duplicate_result_field_present,
  exists(select 1 from function_meta where function_source like '%global_duplicate_active_child_membership_count%') as a17q_tx1_global_child_duplicate_result_field_present,
  exists(select 1 from function_meta where function_source like '%SUCCESS_RESULT_PERSISTED_BEFORE_COMPLETION%') as a17q_tx1_success_result_before_completed_marker_present,
  exists(select 1 from function_meta where function_source like '%BATCH_COMPLETED_UPDATE_AFTER_SUCCESS_RESULT%') as a17q_tx1_completed_after_success_result_marker_present,
  exists(select 1 from function_meta where function_source like '%REPLAY_REQUIRES_DURABLE_SUCCESS_RESULT%') as a17q_tx1_replay_requires_durable_success_result_present,
  exists(select 1 from function_meta where function_source like '%COMPLETED_REPLAY_INTEGRITY_VERIFIED%') as a17q_tx1_completed_replay_integrity_verified_present,
  exists(select 1 from function_meta where function_source like '%FRESH_RESULT_INTEGRITY_VERIFIED_BEFORE_COMPLETION%') as a17q_tx1_fresh_result_integrity_before_completion_present,
  exists(select 1 from function_meta where function_source like '%success_result_sha256%') as a17q_tx1_success_result_sha256_source_present,
  exists(select 1 from function_meta where function_source like '%v_existing_batch.success_result_sha256%') as a17q_tx1_replay_stored_sha256_check_present,
  exists(select 1 from function_meta where function_source like '%v_stored_success_result_sha256%') as a17q_tx1_fresh_stored_sha256_check_present,
  exists(select 1 from function_meta where function_source like '%digest(v_result::text, ''sha256'')%') as a17q_tx1_fresh_result_sha256_compute_present,
  exists(select 1 from function_meta where function_source like '%digest(coalesce(v_stored_success_result, ''{}''::jsonb)::text, ''sha256'')%') as a17q_tx1_stored_result_sha256_recompute_present,
  exists(select 1 from function_meta where function_source like '%replay_mutation_path_count%') as a17q_tx1_replay_mutation_path_count_zero_present,
  exists(select 1 from function_meta where function_source like '%A17Q_SUCCESS_RESULT_PERSIST_FAILED%') as a17q_tx1_success_result_persist_failure_guard_present,
  exists(select 1 from function_meta where function_source like '%A17Q_SUCCESS_RESULT_INTEGRITY_FAILED%') as a17q_tx1_success_result_integrity_failure_guard_present,
  exists(select 1 from function_meta where function_source like '%A17Q_BATCH_COMPLETION_UPDATE_FAILED%') as a17q_tx1_batch_completion_failure_guard_present,
  exists(select 1 from function_meta where function_source like '%STORE_COMPLETE_SUCCESS_RESULT%') as a17q_tx1_store_success_result_marker_present,
  exists(select 1 from function_meta where function_source like '%NEW_EXECUTION_COMPLETED%') as a17q_tx1_new_execution_completed_status_present,
  (select a17q_tx1_success_result_column_present from column_evidence) as a17q_tx1_success_result_column_present,
  (select a17q_tx1_success_result_sha256_column_present from column_evidence) as a17q_tx1_success_result_sha256_column_present,
  (select a17q_tx1_success_result_shape_constraint_present from constraint_evidence) as a17q_tx1_success_result_shape_constraint_present,
  (select a17q_tx1_success_result_sha256_constraint_present from constraint_evidence) as a17q_tx1_success_result_sha256_constraint_present,
  (select a17q_tx1_revision_insert_policy_exists from policy_evidence) as a17q_tx1_revision_insert_policy_exists,
  (select a17q_tx1_decision_pack_batch_count from batch_evidence) as a17q_tx1_decision_pack_batch_count,
  (select a17q_tx1_completed_batch_count from batch_evidence) as a17q_tx1_completed_batch_count,
  (select a17q_tx1_completed_batch_stored_success_integrity_count from batch_evidence) as a17q_tx1_completed_batch_stored_success_integrity_count,
  (select a17q_tx1_rollback_manifest_count from rollback_evidence) as a17q_tx1_rollback_manifest_count;
