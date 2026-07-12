-- A-17I post-apply verifier for A-17H.
-- Scope: SELECT-only metadata and aggregate checks after owner applies 0023.
-- Do not run in A-17H. This file intentionally performs no mutation.

with expected_columns(table_name, column_name) as (
  values
    ('families', 'canonical_key'),
    ('families', 'canonical_status'),
    ('families', 'merged_into_family_id'),
    ('families', 'canonicalized_at'),
    ('families', 'canonicalized_by'),
    ('families', 'reconciliation_batch_id'),
    ('family_reconciliation_batches', 'id'),
    ('family_reconciliation_batches', 'idempotency_key'),
    ('family_reconciliation_batches', 'status'),
    ('family_reconciliation_batches', 'owner_execution_marker'),
    ('family_reconciliation_batches', 'actor_profile_id'),
    ('family_reconciliation_batches', 'dry_run_hash'),
    ('family_reconciliation_batches', 'approved_audit_hash'),
    ('family_reconciliation_batches', 'expected_counts'),
    ('family_reconciliation_batches', 'actual_counts'),
    ('family_canonicalization_decisions', 'audit_group_key_hash'),
    ('family_canonicalization_decisions', 'proposed_canonical_family_id'),
    ('family_canonicalization_decisions', 'source_family_ids'),
    ('family_canonicalization_decisions', 'status'),
    ('family_canonicalization_decisions', 'owner_actor_profile_id'),
    ('family_canonicalization_decisions', 'reviewed_at'),
    ('family_canonicalization_decisions', 'decision_version'),
    ('family_canonicalization_decisions', 'superseded_by_decision_id'),
    ('family_reconciliation_rollback_manifests', 'reconciliation_batch_id'),
    ('family_reconciliation_rollback_manifests', 'payload_hash'),
    ('family_reconciliation_rollback_manifests', 'verification_status'),
    ('family_reconciliation_rollback_manifests', 'rollback_status'),
    ('family_reconciliation_rollback_manifests', 'affected_family_records_before'),
    ('family_reconciliation_rollback_manifests', 'parent_memberships_before'),
    ('family_reconciliation_rollback_manifests', 'child_memberships_before'),
    ('family_reconciliation_rollback_manifests', 'couple_links_before'),
    ('family_reconciliation_rollback_manifests', 'layout_refs_before'),
    ('family_reconciliation_rollback_manifests', 'canonical_family_choice'),
    ('family_reconciliation_rollback_manifests', 'merged_family_ids'),
    ('family_reconciliation_rollback_manifests', 'voided_family_ids'),
    ('family_reconciliation_rollback_manifests', 'audit_revision_ids')
),
missing_columns as (
  select e.table_name, e.column_name
  from expected_columns e
  left join information_schema.columns c
    on c.table_schema = 'public'
   and c.table_name = e.table_name
   and c.column_name = e.column_name
  where c.column_name is null
),
expected_constraints(conname) as (
  values
    ('families_canonical_status_check'),
    ('families_no_self_merge_check'),
    ('families_canonical_key_required_for_canonical_check'),
    ('families_merge_target_required_for_merged_check'),
    ('family_reconciliation_batches_status_check'),
    ('family_canonicalization_decisions_status_check'),
    ('family_reconciliation_rollback_manifests_batch_unique'),
    ('family_reconciliation_rollback_manifests_payload_hash_check')
),
missing_constraints as (
  select e.conname
  from expected_constraints e
  left join pg_constraint c
    on c.conname = e.conname
  where c.conname is null
),
index_checks as (
  select
    exists (
      select 1
      from pg_indexes
      where schemaname = 'public'
        and indexname = 'families_canonical_lookup_idx'
        and indexdef ilike '%where ((deleted_at is null) and (canonical_key is not null))%'
    ) as canonical_lookup_index_present,
    exists (
      select 1
      from pg_indexes
      where schemaname = 'public'
        and indexname = 'families_canonical_key_active_canonical_unique'
        and indexdef ilike '%unique%'
        and indexdef ilike '%canonical_status = ''canonical''%'
        and indexdef ilike '%canonical_key is not null%'
    ) as legacy_safe_unique_index_present
),
rls_checks as (
  select
    count(*) filter (where relrowsecurity) as rls_enabled_count
  from pg_class c
  join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public'
    and c.relname in (
      'family_reconciliation_batches',
      'family_canonicalization_decisions',
      'family_reconciliation_rollback_manifests'
    )
),
policy_checks as (
  select
    count(*) filter (where lower(roles::text) like '%anon%') as anon_policy_count,
    count(*) filter (where lower(roles::text) like '%public%') as public_policy_count,
    count(*) filter (where lower(roles::text) like '%authenticated%') as authenticated_policy_count
  from pg_policies
  where schemaname = 'public'
    and tablename in (
      'family_reconciliation_batches',
      'family_canonicalization_decisions',
      'family_reconciliation_rollback_manifests'
    )
),
grant_checks as (
  select
    count(*) filter (where lower(grantee) = 'anon') as anon_grant_count,
    count(*) filter (where lower(grantee) = 'public') as public_grant_count
  from information_schema.role_table_grants
  where table_schema = 'public'
    and table_name in (
      'family_reconciliation_batches',
      'family_canonicalization_decisions',
      'family_reconciliation_rollback_manifests'
    )
),
aggregate_checks as (
  select
    (select count(*) from public.families where deleted_at is null) as active_family_count,
    (select count(*) from public.families where canonical_status in ('merged', 'voided')) as legacy_marked_merged_or_voided_count,
    (select count(*) from public.families where canonical_key is not null) as canonical_key_backfill_count,
    (select count(*) from public.family_reconciliation_batches) as reconciliation_batch_count,
    (select count(*) from public.family_canonicalization_decisions) as owner_decision_count,
    (select count(*) from public.family_reconciliation_rollback_manifests) as rollback_manifest_count
)
select *
from (
  values
    (
      'a17h_expected_columns_present',
      not exists (select 1 from missing_columns),
      coalesce((select string_agg(table_name || '.' || column_name, ', ') from missing_columns), 'ok')
    ),
    (
      'a17h_expected_constraints_present',
      not exists (select 1 from missing_constraints),
      coalesce((select string_agg(conname, ', ') from missing_constraints), 'ok')
    ),
    (
      'a17h_canonical_lookup_index_present',
      (select canonical_lookup_index_present from index_checks),
      (select canonical_lookup_index_present::text from index_checks)
    ),
    (
      'a17h_unique_index_legacy_safe',
      (select legacy_safe_unique_index_present from index_checks),
      (select legacy_safe_unique_index_present::text from index_checks)
    ),
    (
      'a17h_new_tables_rls_enabled',
      (select rls_enabled_count from rls_checks) = 3,
      (select rls_enabled_count::text from rls_checks)
    ),
    (
      'a17h_no_anon_or_public_policies',
      (select anon_policy_count + public_policy_count from policy_checks) = 0,
      (select jsonb_build_object(
        'anon_policy_count', anon_policy_count,
        'public_policy_count', public_policy_count,
        'authenticated_policy_count', authenticated_policy_count
      )::text from policy_checks)
    ),
    (
      'a17h_no_anon_or_public_grants',
      (select anon_grant_count + public_grant_count from grant_checks) = 0,
      (select jsonb_build_object(
        'anon_grant_count', anon_grant_count,
        'public_grant_count', public_grant_count
      )::text from grant_checks)
    ),
    (
      'a17h_existing_family_count_unchanged',
      (select active_family_count from aggregate_checks) = 74,
      (select active_family_count::text from aggregate_checks)
    ),
    (
      'a17h_no_legacy_rows_marked_merged_or_voided',
      (select legacy_marked_merged_or_voided_count from aggregate_checks) = 0,
      (select legacy_marked_merged_or_voided_count::text from aggregate_checks)
    ),
    (
      'a17h_no_canonical_key_backfill',
      (select canonical_key_backfill_count from aggregate_checks) = 0,
      (select canonical_key_backfill_count::text from aggregate_checks)
    ),
    (
      'a17h_no_batch_decision_or_manifest_seeded',
      (select reconciliation_batch_count + owner_decision_count + rollback_manifest_count from aggregate_checks) = 0,
      (select jsonb_build_object(
        'reconciliation_batch_count', reconciliation_batch_count,
        'owner_decision_count', owner_decision_count,
        'rollback_manifest_count', rollback_manifest_count
      )::text from aggregate_checks)
    )
) as results(check_name, passed, details)
order by check_name;
