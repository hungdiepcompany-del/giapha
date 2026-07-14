-- A-17Q-TX4 SELECT-only verifier.
-- Verifies the manually applied 0029 jsonb_build_object argument-limit patch
-- without calling public.execute_admin_a17q_legacy_family_reconciliation.
-- SELECT_ONLY_VERIFIER=YES
-- DO_NOT_CALL_EXECUTOR

with function_meta as (
  select
    p.oid,
    p.prosecdef,
    p.proconfig,
    p.proacl,
    p.proowner,
    r.rolname as owner_name,
    pg_get_function_identity_arguments(p.oid) as identity_arguments,
    pg_get_function_result(p.oid) as return_type,
    pg_get_functiondef(p.oid) as function_source
  from pg_proc p
  join pg_namespace n on n.oid = p.pronamespace
  join pg_roles r on r.oid = p.proowner
  where n.nspname = 'public'
    and p.proname = 'execute_admin_a17q_legacy_family_reconciliation'
),
grant_evidence as (
  select
    exists (
      select 1
      from function_meta fm
      cross join lateral aclexplode(coalesce(fm.proacl, acldefault('f', fm.proowner))) acl
      where acl.privilege_type = 'EXECUTE'
        and acl.grantee = 'authenticated'::regrole
    ) as authenticated_execute_grant_present,
    exists (
      select 1
      from function_meta fm
      cross join lateral aclexplode(coalesce(fm.proacl, acldefault('f', fm.proowner))) acl
      where acl.privilege_type = 'EXECUTE'
        and acl.grantee = 'anon'::regrole
    ) as anon_execute_grant_present,
    exists (
      select 1
      from function_meta fm
      cross join lateral aclexplode(coalesce(fm.proacl, acldefault('f', fm.proowner))) acl
      where acl.privilege_type = 'EXECUTE'
        and acl.grantee = 0
    ) as public_execute_grant_present
),
source_evidence as (
  select
    function_source like '%jsonb_build_object(%''event_type'', ''A17Q_LEGACY_FAMILY_RECONCILIATION_COMPLETED''%||%jsonb_build_object(%''missing_expected_family_state_count''%' as post_mutation_audit_builder_split,
    function_source like '%v_result := jsonb_build_object(%''status'', ''RECONCILIATION_COMPLETED''%||%jsonb_build_object(%''precondition_check_count''%' as final_success_result_builder_split,
    function_source like '%A17P_MANUAL_21_GROUP_RECONCILIATION_APPROVED%' as owner_marker_preserved,
    function_source like '%777a8bb13ff45eb9f46fd817c392098ada4a2d550cad8e6ee4c6cd896b874ad0%' as decision_pack_hash_preserved,
    function_source like '%7dd719c926dc560aa69bc7070c395535942823e87739d9893d0161713e151740%' as approved_group_hash_preserved,
    function_source like '%ee255398f84dc2ce899d14056fb0573f771202ca7ad71e598cbbe7fc47707a9f%' as role_correction_hash_preserved,
    function_source like '%7898280dab816af96b6a9277b93b49429c5db8a71c9f24739a7d55660a0bdd61%' as excluded_scope_hash_preserved,
    function_source like '%4c0beb0de1589a7728b7f8b4918844e3103aa773ad3a5ab8e87d1ab2cead9ff3%' as forecast_hash_preserved,
    function_source like '%p_idempotency_key text%' as idempotency_parameter_preserved,
    function_source like '%if p_dry_run_only is true then%return v_result;%end if;%' as dry_run_branch_preserved
  from function_meta
),
target_table_rls as (
  select
    bool_and(c.relrowsecurity) filter (
      where c.relname in ('families', 'family_parents', 'family_children')
    ) as target_rls_enabled,
    bool_or(c.relforcerowsecurity) filter (
      where c.relname in ('families', 'family_parents', 'family_children')
    ) as target_force_rls_enabled
  from pg_class c
  join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public'
    and c.relname in ('families', 'family_parents', 'family_children')
),
pre_execution_state as (
  select
    (select count(*) from public.families where deleted_at is null) as active_family_count,
    (select count(*) from public.family_parents where deleted_at is null) as active_parent_membership_count,
    (select count(*) from public.family_children where deleted_at is null) as active_child_membership_count,
    (select count(*) from public.family_reconciliation_batches) as decision_pack_batch_count,
    (
      select count(*)
      from public.family_reconciliation_batches
      where status = 'completed'
    ) as completed_batch_count,
    (select count(*) from public.family_reconciliation_rollback_manifests) as rollback_manifest_count,
    (
      select count(*)
      from public.revisions
      where change_reason = 'A-17Q-TX1 legacy family reconciliation transaction executor'
    ) as a17q_audit_revision_count
)
select
  'a17q_tx4_jsonb_argument_limit_patch' as result_set,
  exists(select 1 from function_meta) as function_exists,
  exists(select 1 from function_meta where return_type = 'jsonb') as return_type_jsonb,
  exists (
    select 1
    from function_meta
    where identity_arguments =
      'p_owner_approval_marker text, p_decision_pack_sha256 text, p_approved_group_plan_sha256 text, p_role_correction_plan_sha256 text, p_excluded_scope_sha256 text, p_forecast_sha256 text, p_idempotency_key text, p_confirm_backup_reviewed boolean, p_confirm_rollback_reviewed boolean, p_confirm_audit_reviewed boolean, p_confirm_excluded_scope_reviewed boolean, p_dry_run_only boolean'
  ) as rpc_signature_preserved,
  exists(select 1 from function_meta where owner_name = 'postgres') as function_owner_postgres,
  exists(select 1 from function_meta where prosecdef = true) as security_definer_enabled,
  exists(select 1 from function_meta where proconfig @> array['search_path=public, auth, pg_temp']) as fixed_search_path_preserved,
  (select not public_execute_grant_present from grant_evidence) as public_execute_grant_absent,
  (select not anon_execute_grant_present from grant_evidence) as anon_execute_grant_absent,
  (select authenticated_execute_grant_present from grant_evidence) as authenticated_execute_grant_present,
  (select target_rls_enabled from target_table_rls) as target_rls_enabled,
  not (select target_force_rls_enabled from target_table_rls) as target_force_rls_disabled,
  (select post_mutation_audit_builder_split from source_evidence) as post_mutation_audit_builder_split,
  (select final_success_result_builder_split from source_evidence) as final_success_result_builder_split,
  (select owner_marker_preserved from source_evidence) as owner_marker_preserved,
  (select decision_pack_hash_preserved from source_evidence) as decision_pack_hash_preserved,
  (select approved_group_hash_preserved from source_evidence) as approved_group_hash_preserved,
  (select role_correction_hash_preserved from source_evidence) as role_correction_hash_preserved,
  (select excluded_scope_hash_preserved from source_evidence) as excluded_scope_hash_preserved,
  (select forecast_hash_preserved from source_evidence) as forecast_hash_preserved,
  (select idempotency_parameter_preserved from source_evidence) as idempotency_parameter_preserved,
  (select dry_run_branch_preserved from source_evidence) as dry_run_branch_preserved,
  (select active_family_count from pre_execution_state) as active_family_count,
  (select active_parent_membership_count from pre_execution_state) as active_parent_membership_count,
  (select active_child_membership_count from pre_execution_state) as active_child_membership_count,
  (select decision_pack_batch_count from pre_execution_state) as decision_pack_batch_count,
  (select completed_batch_count from pre_execution_state) as completed_batch_count,
  (select rollback_manifest_count from pre_execution_state) as rollback_manifest_count,
  (select a17q_audit_revision_count from pre_execution_state) as a17q_audit_revision_count,
  (
    exists(select 1 from function_meta)
    and exists(select 1 from function_meta where owner_name = 'postgres')
    and exists(select 1 from function_meta where prosecdef = true)
    and exists(select 1 from function_meta where proconfig @> array['search_path=public, auth, pg_temp'])
    and (select not public_execute_grant_present from grant_evidence)
    and (select not anon_execute_grant_present from grant_evidence)
    and (select authenticated_execute_grant_present from grant_evidence)
    and (select post_mutation_audit_builder_split from source_evidence)
    and (select final_success_result_builder_split from source_evidence)
  ) as tx4_patch_contract_pass
from pre_execution_state;
