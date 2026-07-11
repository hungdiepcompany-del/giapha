# A-16BQ - Downstream RPC Write-contract Read-only Verification

Status:
`A16BQ_STATUS=READY_FOR_OWNER_SELECT_ONLY_METADATA_VERIFICATION`.

A-16R retry:
`A16R_IMPORT_RETRY_NEXT=NO`.

Runbook:
`A16BQ_RUNBOOK_STATUS=SELECT_ONLY_OWNER_METADATA_VERIFICATION_NOT_EXECUTED_BY_CODEX`.

Purpose:
Verify the remaining table privilege/RLS/policy contract for every downstream
table touched by the production official-import RPC before any separate A-16R
retry is considered.

## RPC table coverage

RPC source:
`A16BQ_RPC_SOURCE=supabase/migrations/20260703_0016_a16v_official_import_real_transaction_execution_branch_candidate.sql`.

SELECT targets:
`A16BQ_RPC_SELECT_TARGETS=import_sessions,official_import_batches,import_write_manifests,import_session_warnings,import_duplicate_candidates,import_relationship_candidates,family_children,family_parents`.

SELECT FOR UPDATE targets:
`A16BQ_RPC_SELECT_FOR_UPDATE_TARGETS=import_sessions,official_import_batches,import_write_manifests`.

INSERT targets:
`A16BQ_RPC_INSERT_TARGETS=official_import_batches,people,revisions,families,family_children,family_parents,official_import_rollback_manifests`.

UPDATE targets:
`A16BQ_RPC_UPDATE_TARGETS=official_import_batches,import_write_manifests,import_sessions`.

Readback after insert:
`A16BQ_RPC_READBACK_AFTER_INSERT_TARGETS=family_children,family_parents`.

Required app permissions:
`A16BQ_REQUIRED_APP_PERMISSIONS=imports.create,people.create,relationships.create,permissions.manage`.

## Owner SELECT-only SQL runbook

The owner may run this SQL in a separate verification phase. It reads only
PostgreSQL metadata and returns sanitized booleans/counts. It must not invoke the
official-import RPC and must not query genealogy rows.

```sql
-- A16BQ_DOWNSTREAM_RPC_WRITE_CONTRACT_SELECT_ONLY_VERIFY
-- SQL_CHECK_STATUS=SELECT_ONLY
-- DO_NOT_MUTATE
-- DO_NOT_INVOKE_OFFICIAL_IMPORT_RPC
-- DO_NOT_LOCK_PRODUCTION_ROWS
-- NO_RAW_PRIVATE_DATA

with required_table_privileges(table_name, privilege_type) as (
  values
    ('import_sessions', 'SELECT'),
    ('import_sessions', 'UPDATE'),
    ('import_write_manifests', 'SELECT'),
    ('import_write_manifests', 'UPDATE'),
    ('official_import_batches', 'SELECT'),
    ('official_import_batches', 'INSERT'),
    ('official_import_batches', 'UPDATE'),
    ('official_import_rollback_manifests', 'INSERT'),
    ('people', 'INSERT'),
    ('families', 'INSERT'),
    ('family_parents', 'SELECT'),
    ('family_parents', 'INSERT'),
    ('family_children', 'SELECT'),
    ('family_children', 'INSERT'),
    ('revisions', 'INSERT'),
    ('import_session_warnings', 'SELECT'),
    ('import_duplicate_candidates', 'SELECT'),
    ('import_relationship_candidates', 'SELECT')
),
rpc_tables(table_name) as (
  values
    ('import_sessions'),
    ('import_write_manifests'),
    ('official_import_batches'),
    ('official_import_rollback_manifests'),
    ('people'),
    ('families'),
    ('family_parents'),
    ('family_children'),
    ('revisions'),
    ('import_session_warnings'),
    ('import_duplicate_candidates'),
    ('import_relationship_candidates')
),
policy_catalog_raw as (
  select
    tablename,
    policyname,
    cmd,
    roles,
    coalesce(qual, '') as qual,
    coalesce(with_check, '') as with_check
  from pg_policies
  where schemaname = 'public'
    and tablename in (select table_name from rpc_tables)
),
policy_catalog as (
  select
    tablename,
    policyname,
    cmd,
    roles,
    lower(regexp_replace(regexp_replace(qual, '::[a-zA-Z_][a-zA-Z0-9_]*(\[\])?', '', 'g'), '[[:space:]]+', ' ', 'g')) as normalized_qual,
    lower(regexp_replace(regexp_replace(with_check, '::[a-zA-Z_][a-zA-Z0-9_]*(\[\])?', '', 'g'), '[[:space:]]+', ' ', 'g')) as normalized_with_check
  from policy_catalog_raw
),
grant_catalog as (
  select
    table_name,
    grantee,
    privilege_type
  from information_schema.role_table_grants
  where table_schema = 'public'
    and table_name in (select table_name from rpc_tables)
),
rls_catalog as (
  select
    c.relname as table_name,
    c.relrowsecurity,
    c.relforcerowsecurity
  from pg_class c
  join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public'
    and c.relname in (select table_name from rpc_tables)
),
rpc_catalog as (
  select
    p.prosecdef as security_definer
  from pg_proc p
  join pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public'
    and p.proname = 'a16p_tx_execute_giapha4_official_import'
),
trigger_catalog as (
  select
    t.tgname,
    pg_get_triggerdef(t.oid) as trigger_definition,
    p.proname as trigger_function_name
  from pg_trigger t
  join pg_class c on c.oid = t.tgrelid
  join pg_namespace n on n.oid = c.relnamespace
  join pg_proc p on p.oid = t.tgfoid
  where not t.tgisinternal
    and n.nspname = 'public'
    and c.relname in (select table_name from rpc_tables)
),
privilege_checks as (
  select
    count(*) filter (
      where not has_table_privilege('authenticated', 'public.' || table_name, privilege_type)
    )::integer as missing_authenticated_required_privilege_count
  from required_table_privileges
),
forbidden_checks as (
  select
    (
      select count(*)::integer
      from grant_catalog
      where lower(grantee) in ('anon', 'public')
        and privilege_type in ('SELECT', 'INSERT', 'UPDATE', 'DELETE', 'TRUNCATE', 'REFERENCES', 'TRIGGER')
    ) as forbidden_anon_public_table_grant_count,
    (
      select count(*)::integer
      from policy_catalog pc
      where exists (
        select 1
        from unnest(pc.roles) as policy_role(role_name)
        where lower(policy_role.role_name::text) in ('anon', 'public')
      )
    ) as forbidden_anon_public_policy_count
),
policy_checks as (
  select
    exists (
      select 1 from policy_catalog
      where tablename = 'official_import_batches'
        and cmd = 'INSERT'
        and normalized_with_check like '%has_permission(''imports.create'')%'
    ) as official_import_batches_supports_rpc_insert,
    exists (
      select 1 from policy_catalog
      where tablename = 'official_import_batches'
        and cmd = 'SELECT'
        and normalized_qual like '%created_by = current_profile_id()%'
    ) as official_import_batches_supports_rpc_lock_select,
    exists (
      select 1 from policy_catalog
      where tablename = 'official_import_batches'
        and cmd = 'UPDATE'
        and normalized_qual like '%created_by = current_profile_id()%'
        and normalized_with_check like '%completed%'
    ) as official_import_batches_supports_rpc_update_lifecycle,
    exists (
      select 1 from policy_catalog
      where tablename = 'official_import_rollback_manifests'
        and cmd = 'INSERT'
        and normalized_with_check like '%has_permission(''imports.create'')%'
    ) as official_import_rollback_manifests_supports_rpc_insert,
    exists (
      select 1 from policy_catalog
      where tablename = 'people'
        and cmd = 'INSERT'
        and normalized_with_check like '%has_permission(''people.create'')%'
    ) as people_supports_rpc_insert,
    exists (
      select 1 from policy_catalog
      where tablename = 'families'
        and cmd = 'INSERT'
        and normalized_with_check like '%has_permission(''relationships.create'')%'
    ) as families_supports_rpc_insert,
    exists (
      select 1 from policy_catalog
      where tablename = 'family_parents'
        and cmd = 'INSERT'
        and normalized_with_check like '%has_permission(''relationships.create'')%'
    ) as family_parents_supports_rpc_insert,
    exists (
      select 1 from policy_catalog
      where tablename = 'family_parents'
        and cmd = 'SELECT'
        and normalized_qual like '%has_permission(''relationships.view'')%'
    ) as family_parents_supports_required_readback,
    exists (
      select 1 from policy_catalog
      where tablename = 'family_children'
        and cmd = 'INSERT'
        and normalized_with_check like '%has_permission(''relationships.create'')%'
    ) as family_children_supports_rpc_insert,
    exists (
      select 1 from policy_catalog
      where tablename = 'family_children'
        and cmd = 'SELECT'
        and normalized_qual like '%has_permission(''relationships.view'')%'
    ) as family_children_supports_required_readback,
    exists (
      select 1 from policy_catalog
      where tablename = 'revisions'
        and cmd = 'INSERT'
        and normalized_with_check like '%current_profile_id()%'
    ) as revisions_supports_rpc_insert
),
booleans as (
  select
    privilege_checks.missing_authenticated_required_privilege_count,
    forbidden_checks.forbidden_anon_public_table_grant_count,
    forbidden_checks.forbidden_anon_public_policy_count,
    forbidden_checks.forbidden_anon_public_table_grant_count = 0 as no_anon_or_public_table_grants,
    forbidden_checks.forbidden_anon_public_policy_count = 0 as no_anon_or_public_policies,
    not exists (
      select 1
      from rls_catalog
      where not relrowsecurity
    ) as all_rpc_tables_rls_enabled,
    count(*) filter (where relforcerowsecurity)::integer as force_rls_table_count,
    exists (select 1 from rpc_catalog where security_definer = false) as rpc_remains_security_invoker,
    not exists (
      select 1
      from trigger_catalog
      where trigger_definition ilike '%a16p_tx_execute_giapha4_official_import%'
        or trigger_function_name ilike '%a16p_tx_execute_giapha4_official_import%'
    ) as no_automatic_import_trigger,
    policy_checks.*
  from privilege_checks
  cross join forbidden_checks
  cross join policy_checks
  cross join rls_catalog
  group by
    privilege_checks.missing_authenticated_required_privilege_count,
    forbidden_checks.forbidden_anon_public_table_grant_count,
    forbidden_checks.forbidden_anon_public_policy_count,
    policy_checks.official_import_batches_supports_rpc_insert,
    policy_checks.official_import_batches_supports_rpc_lock_select,
    policy_checks.official_import_batches_supports_rpc_update_lifecycle,
    policy_checks.official_import_rollback_manifests_supports_rpc_insert,
    policy_checks.people_supports_rpc_insert,
    policy_checks.families_supports_rpc_insert,
    policy_checks.family_parents_supports_rpc_insert,
    policy_checks.family_parents_supports_required_readback,
    policy_checks.family_children_supports_rpc_insert,
    policy_checks.family_children_supports_required_readback,
    policy_checks.revisions_supports_rpc_insert
)
select
  *,
  (
    missing_authenticated_required_privilege_count = 0
    and no_anon_or_public_table_grants
    and no_anon_or_public_policies
    and all_rpc_tables_rls_enabled
    and rpc_remains_security_invoker
    and no_automatic_import_trigger
    and official_import_batches_supports_rpc_insert
    and official_import_batches_supports_rpc_lock_select
    and official_import_batches_supports_rpc_update_lifecycle
    and official_import_rollback_manifests_supports_rpc_insert
    and people_supports_rpc_insert
    and families_supports_rpc_insert
    and family_parents_supports_rpc_insert
    and family_parents_supports_required_readback
    and family_children_supports_rpc_insert
    and family_children_supports_required_readback
    and revisions_supports_rpc_insert
  ) as a16bq_downstream_rpc_write_contract_verified
from booleans;
```

## Interpretation

Expected owner verification status:
`A16BQ_EXPECTED_VERIFY=a16bq_downstream_rpc_write_contract_verified_TRUE`.

If any boolean is false, stop and record a blocker. Do not retry A-16R from this
phase.

## Safety

`A16BQ_SQL_RUN_BY_CODEX=NO`.

`A16BQ_RUNBOOK_EXECUTED_BY_CODEX=NO`.

`A16BQ_POST_OFFICIAL_IMPORT_CALLED=NO`.

`A16BQ_IMPORT_RPC_CALLED=NO`.

`A16BQ_SESSION_STATE_CHANGED=NO`.

`A16BQ_REAL_GENEALOGY_WRITE=NO`.

`A16BQ_DEPLOY_RUN=NO`.
