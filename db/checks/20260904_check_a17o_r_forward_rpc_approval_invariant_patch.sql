with target_function as (
  select
    p.oid,
    p.prorettype,
    p.provolatile,
    p.prosecdef,
    p.proconfig,
    p.proacl,
    p.proowner,
    pg_catalog.pg_get_functiondef(p.oid) as function_definition
  from pg_catalog.pg_proc p
  join pg_catalog.pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public'
    and p.proname = 'a17o_tx_execute_grouped_giapha4_official_import'
    and pg_catalog.oidvectortypes(p.proargtypes) =
      'uuid, text, text, text, jsonb, text, text, boolean, boolean, boolean, boolean'
),
contract as (
  select
    *,
    position(
      'if v_session.status <> ''owner_approved_for_db_write'' then'
      in function_definition
    ) > 0 as exact_session_status,
    position(
      'for v_write_manifest in
    select *
    from public.import_write_manifests
    where import_session_id = p_import_session_id
      and status in (''owner_approved'', ''ready_for_apply'')
    order by id
    for update
  loop
    v_write_manifest_count := v_write_manifest_count + 1;
  end loop;

  if v_write_manifest_count <> 1 then'
      in function_definition
    ) > 0 as exact_one_locked_write_manifest,
    position(
      'order by approved_at desc nulls last, created_at desc
  limit 1
  for update;'
      in function_definition
    ) = 0 as no_latest_manifest_order_limit,
    position(
      'if nullif(btrim(p_confirm_marker), '''') is null then'
      in function_definition
    ) > 0 as nonblank_confirm_marker,
    position(
      'if nullif(btrim(v_write_manifest.approval_marker), '''') is null
    or v_write_manifest.approval_marker is distinct from p_confirm_marker then'
      in function_definition
    ) > 0 as nonblank_equal_write_manifest_marker,
    position(
      'if nullif(btrim(v_session.approval_marker), '''') is null
    or v_session.approval_marker is distinct from p_confirm_marker then'
      in function_definition
    ) > 0 as nonblank_equal_session_marker,
    position('A17O_TX_IDEMPOTENCY_RECORD_NOT_VISIBLE' in function_definition) > 0
      as idempotency_record_not_visible_preserved,
    position('if p_dry_run_only then' in function_definition) > 0
      and position('if p_dry_run_only then' in function_definition)
        < position('if auth.uid() is null or v_profile_id is null then' in function_definition)
      as dry_run_precedes_authentication,
    position('DRY_RUN_ONLY_TRUE' in function_definition) > 0
      as dry_run_reason_preserved,
    (length(function_definition) - length(replace(function_definition, 'extensions.digest(', '')))
      / length('extensions.digest(') as qualified_digest_count,
    (length(function_definition) - length(replace(function_definition, 'pg_catalog.encode(', '')))
      / length('pg_catalog.encode(') as qualified_encode_count,
    (length(function_definition) - length(replace(function_definition, 'pg_catalog.convert_to(', '')))
      / length('pg_catalog.convert_to(') as qualified_convert_to_count,
    (length(function_definition) - length(replace(function_definition, ' digest(', '')))
      / length(' digest(') as unqualified_digest_count
  from target_function
),
acl_evidence as (
  select
    tf.oid,
    ae.grantee,
    ae.privilege_type,
    ae.is_grantable
  from target_function tf
  cross join lateral pg_catalog.aclexplode(
    coalesce(tf.proacl, pg_catalog.acldefault('f', tf.proowner))
  ) as ae
)
,
acl_contract as (
  select
    contract.*,
    exists (
      select 1
      from acl_evidence ae
      where ae.oid = contract.oid
        and ae.grantee = 'authenticated'::pg_catalog.regrole
        and ae.privilege_type = 'EXECUTE'
    ) as authenticated_execute_present,
    not exists (
      select 1
      from acl_evidence ae
      where ae.oid = contract.oid
        and ae.grantee = 'anon'::pg_catalog.regrole
        and ae.privilege_type = 'EXECUTE'
    ) as anon_execute_absent,
    not exists (
      select 1
      from acl_evidence ae
      where ae.oid = contract.oid
        and ae.grantee = 0
        and ae.privilege_type = 'EXECUTE'
    ) as public_execute_absent
  from contract
)
select
  count(*) over () = 1 as exact_11_argument_overload,
  prorettype = 'jsonb'::pg_catalog.regtype as returns_jsonb,
  provolatile = 'v' as volatile_function,
  prosecdef = false as security_invoker,
  proconfig = array['search_path=public, auth, pg_temp'] as exact_fixed_search_path,
  authenticated_execute_present,
  anon_execute_absent,
  public_execute_absent,
  anon_execute_absent
    and public_execute_absent
    and authenticated_execute_present as exact_authenticated_only_acl,
  exact_session_status,
  exact_one_locked_write_manifest,
  no_latest_manifest_order_limit,
  nonblank_confirm_marker,
  nonblank_equal_write_manifest_marker,
  nonblank_equal_session_marker,
  idempotency_record_not_visible_preserved,
  dry_run_precedes_authentication,
  dry_run_reason_preserved,
  qualified_digest_count = 2 as qualified_digest_count_preserved,
  qualified_encode_count = 2 as qualified_encode_count_preserved,
  qualified_convert_to_count = 2 as qualified_convert_to_count_preserved,
  unqualified_digest_count = 0 as no_unqualified_digest,
  proacl as function_acl_catalog_evidence
from acl_contract;
