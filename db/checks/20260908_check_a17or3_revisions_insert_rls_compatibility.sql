-- A17O-R3_REVISIONS_INSERT_RLS_COMPATIBILITY_SELECT_ONLY_VERIFY
-- SQL_CHECK_STATUS=SELECT_ONLY
-- Run only after an Owner-authorized migration apply; never invokes the RPC.
with revision_table as (
  select c.oid, c.relrowsecurity, c.relforcerowsecurity, c.relacl, c.relowner
  from pg_catalog.pg_class c
  join pg_catalog.pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public' and c.relname = 'revisions'
),
policies as (
  select
    p.polname,
    p.polcmd,
    p.polpermissive,
    p.polroles,
    pg_catalog.pg_get_expr(p.polwithcheck, p.polrelid) as with_check
  from pg_catalog.pg_policy p
  join revision_table t on t.oid = p.polrelid
),
a16br_policy as (
  select * from policies
  where polname = 'a16br_revisions_insert_official_import_create'
),
a17or3_policy as (
  select * from policies
  where polname = 'a17or3_revisions_insert_grouped_official_import'
),
insert_policy_contract as (
  select
    count(*) as policy_count,
    array_agg(polname order by polname)::text[] as policy_names,
    bool_and(
      polpermissive
      and polroles = array['authenticated'::pg_catalog.regrole::oid]
    ) as all_permissive_authenticated_only
  from policies
  where polcmd = 'a'
),
revision_acl as (
  select ae.grantee, ae.privilege_type
  from revision_table t
  cross join lateral pg_catalog.aclexplode(
    coalesce(t.relacl, pg_catalog.acldefault('r', t.relowner))
  ) as ae
)
select
  exists (select 1 from revision_table where relrowsecurity and not relforcerowsecurity)
    as revisions_rls_enabled_not_forced,
  (select count(*) = 1 from a16br_policy)
    as a16br_revision_insert_policy_preserved,
  (select count(*) = 1 from a17or3_policy where polcmd = 'a')
    as a17or3_exactly_one_insert_policy,
  (select polroles = array['authenticated'::pg_catalog.regrole::oid] from a17or3_policy)
    as a17or3_authenticated_only,
  (select
    policy_count = 4
    and policy_names = array[
      'a16br_revisions_insert_official_import_create',
      'a17n_tx1_revisions_insert_admin_canonical_family_write',
      'a17or3_revisions_insert_grouped_official_import',
      'a17q_tx1_revisions_insert_legacy_family_reconciliation'
    ]::text[]
    and all_permissive_authenticated_only
  from insert_policy_contract) as exact_permissive_authenticated_insert_policy_allowlist,
  (select policy_names from insert_policy_contract)
    as revisions_insert_policy_name_inventory,
  (select policy_count from insert_policy_contract)
    as revisions_insert_policy_count,
  exists (
    select 1 from revision_acl
    where grantee = 'authenticated'::pg_catalog.regrole
      and privilege_type = 'INSERT'
  ) as revisions_authenticated_insert_grant_present,
  not exists (
    select 1 from revision_acl
    where grantee = 'anon'::pg_catalog.regrole
      and privilege_type = 'INSERT'
  ) as revisions_anon_insert_grant_absent,
  not exists (
    select 1 from revision_acl
    where grantee = 0 and privilege_type = 'INSERT'
  ) as revisions_public_insert_grant_absent,
  not exists (
    select 1 from revision_acl
    where grantee = 0 or grantee = 'anon'::pg_catalog.regrole
  ) as revisions_anon_public_grants_absent,
  (select
    position('imports.create' in with_check) > 0
    and position('permissions.manage' in with_check) > 0
    and position('changed_by' in with_check) > 0
    and position('before_json' in with_check) > 0
    and position('A-17O-TX1 grouped official import transaction executor' in with_check) > 0
    and position('owner_approved_for_db_write' in with_check) > 0
    and position('count(*)' in with_check) > 0
    and position('source_row_index' in with_check) > 0
    and position('group_key_hash' in with_check) > 0
    and position('family_created' in with_check) > 0
    and position('family_reused' in with_check) > 0
    and position('created_by_execution' in with_check) > 0
    and position('^[a-f0-9]{64}$' in with_check) > 0
    and position('target_person' in with_check) > 0
    and position('target_family' in with_check) > 0
    and position('target_parent' in with_check) > 0
    and position('target_child' in with_check) > 0
  from a17or3_policy) as a17or3_stable_provenance_and_target_identifier_catalog_markers_present,
  (select
    position('target_family' in with_check) > 0
    and position('entity_id' in with_check) > 0
    and position('deleted_at' in with_check) > 0
    and position('created_by' in with_check) > 0
  from a17or3_policy) as a17or3_target_family_catalog_markers_present,
  (select
    position('jsonb_object_keys' in with_check) > 0
    and position('source_row_index' in with_check) > 0
    and position('^(0|[1-9][0-9]*)$' in with_check) > 0
    and position('group_key_hash' in with_check) > 0
    and position('family_created' in with_check) > 0
    and position('family_reused' in with_check) > 0
    and position('created_by_execution' in with_check) > 0
  from a17or3_policy) as a17or3_json_shape_catalog_markers_present,
  (select
    position('owned_session.approved_by' in with_check) > 0
    and position('owned_session.approved_at' in with_check) > 0
    and position('owned_session.approval_marker' in with_check) > 0
    and position('owned_session.preview_manifest_hash' in with_check) > 0
    and position('eligible_manifest.approved_by' in with_check) > 0
    and position('eligible_manifest.approved_at' in with_check) > 0
    and position('eligible_manifest.approval_marker' in with_check) > 0
    and position('eligible_manifest.manifest_hash' in with_check) > 0
  from a17or3_policy) as a17or3_session_and_manifest_approval_catalog_markers_present,
  (select
    position('jsonb_typeof' in with_check) > 0
    and position('import_session_id' in with_check) > 0
    and position('executor_contract_version' in with_check) > 0
    and position('mutation_plan_hash' in with_check) > 0
  from a17or3_policy) as a17or3_json_type_and_hash_catalog_markers_present,
  (select with_check from a17or3_policy) as a17or3_policy_expression_catalog_evidence;
