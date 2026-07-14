-- A-17Q-TX2 SELECT-only verifier.
-- Verifies the manually applied 0027 digest-resolution patch without calling
-- public.execute_admin_a17q_legacy_family_reconciliation.
-- SELECT_ONLY_VERIFIER=YES
-- DO_NOT_CALL_EXECUTOR

with function_meta as (
  select
    p.oid,
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
    and p.proname = 'execute_admin_a17q_legacy_family_reconciliation'
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
  from function_meta
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
)
select
  'a17q_tx2_schema_qualified_pgcrypto_digest_patch' as result_set,
  exists(select 1 from function_meta) as function_exists,
  exists(select 1 from function_meta where return_type = 'jsonb') as return_type_jsonb,
  exists (
    select 1
    from function_meta
    where identity_arguments =
      'p_owner_approval_marker text, p_decision_pack_sha256 text, p_approved_group_plan_sha256 text, p_role_correction_plan_sha256 text, p_excluded_scope_sha256 text, p_forecast_sha256 text, p_idempotency_key text, p_confirm_backup_reviewed boolean, p_confirm_rollback_reviewed boolean, p_confirm_audit_reviewed boolean, p_confirm_excluded_scope_reviewed boolean, p_dry_run_only boolean'
  ) as rpc_signature_unchanged,
  exists(select 1 from function_meta where prosecdef = false) as security_invoker_preserved,
  exists(select 1 from function_meta where proconfig @> array['search_path=public, auth, pg_temp']) as fixed_search_path_preserved,
  (select extensions_digest_bytea_text_exists from digest_evidence) as extensions_digest_bytea_text_exists,
  (select qualified_extensions_digest_call_count from digest_evidence) as qualified_extensions_digest_call_count,
  (select unqualified_executable_digest_call_count from digest_evidence) as unqualified_executable_digest_call_count,
  (select qualified_pg_catalog_encode_call_count from digest_evidence) as qualified_pg_catalog_encode_call_count,
  (select qualified_pg_catalog_convert_to_call_count from digest_evidence) as qualified_pg_catalog_convert_to_call_count,
  (select authenticated_execute_grant_present from grant_evidence) as authenticated_execute_grant_present,
  not (select anon_execute_grant_present from grant_evidence) as anon_execute_grant_absent,
  not (select public_execute_grant_present from grant_evidence) as public_execute_grant_absent,
  exists(select 1 from function_meta where function_source like '%A17P_MANUAL_21_GROUP_RECONCILIATION_APPROVED%') as owner_marker_preserved,
  exists(select 1 from function_meta where function_source like '%777a8bb13ff45eb9f46fd817c392098ada4a2d550cad8e6ee4c6cd896b874ad0%') as decision_pack_hash_preserved,
  exists(select 1 from function_meta where function_source like '%p_dry_run_only boolean%') as dry_run_signature_arg_present,
  exists(select 1 from function_meta where function_source like '%if p_dry_run_only then%') as dry_run_branch_preserved,
  not exists(select 1 from function_meta where function_source like '%search_path = public, auth, extensions, pg_temp%') as extensions_not_added_to_search_path,
  not exists(select 1 from function_meta where function_source ~* '\bcreate[[:space:]]+extension\b') as no_extension_created_or_moved;
