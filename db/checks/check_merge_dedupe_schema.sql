-- A12_MERGE_DEDUPE_POST_APPLY_READ_ONLY_CHECK
-- RUN_ONLY_AFTER_APPROVE_A12_MERGE_DEDUPE_DB_APPLY_AND_CONFIRMED_APPLY
-- This query reads PostgreSQL catalogs only. It does not read genealogy rows,
-- mutate data, grant access, create policies or open merge/dedupe runtime.

with
expected_tables(table_name) as (
  values
    ('merge_dedupe_candidates'),
    ('merge_dedupe_sessions'),
    ('merge_dedupe_field_decisions'),
    ('merge_dedupe_impact_snapshots'),
    ('merge_dedupe_audit_events'),
    ('merge_dedupe_rollback_manifests')
),
missing_tables as (
  select e.table_name
  from expected_tables e
  left join information_schema.tables t
    on t.table_schema = 'public'
   and t.table_name = e.table_name
  where t.table_name is null
),
expected_columns(table_name, column_name) as (
  values
    ('merge_dedupe_candidates', 'person_a_id'),
    ('merge_dedupe_candidates', 'person_b_id'),
    ('merge_dedupe_candidates', 'confidence_level'),
    ('merge_dedupe_candidates', 'evidence_json'),
    ('merge_dedupe_sessions', 'merge_id'),
    ('merge_dedupe_sessions', 'source_person_id'),
    ('merge_dedupe_sessions', 'target_person_id'),
    ('merge_dedupe_sessions', 'session_status'),
    ('merge_dedupe_sessions', 'requested_by'),
    ('merge_dedupe_sessions', 'requested_at'),
    ('merge_dedupe_sessions', 'approved_by'),
    ('merge_dedupe_sessions', 'approved_at'),
    ('merge_dedupe_sessions', 'executed_by'),
    ('merge_dedupe_sessions', 'executed_at'),
    ('merge_dedupe_sessions', 'source_person_version_token'),
    ('merge_dedupe_sessions', 'target_person_version_token'),
    ('merge_dedupe_sessions', 'version_checked_by'),
    ('merge_dedupe_sessions', 'version_checked_at'),
    ('merge_dedupe_sessions', 'conflict_review_checksum'),
    ('merge_dedupe_sessions', 'conflicts_resolved_by'),
    ('merge_dedupe_sessions', 'conflicts_resolved_at'),
    ('merge_dedupe_sessions', 'graph_validation_result'),
    ('merge_dedupe_sessions', 'graph_validated_by'),
    ('merge_dedupe_sessions', 'graph_validated_at'),
    ('merge_dedupe_sessions', 'impact_manifest_checksum'),
    ('merge_dedupe_sessions', 'approval_marker_code'),
    ('merge_dedupe_field_decisions', 'field_name'),
    ('merge_dedupe_field_decisions', 'source_value'),
    ('merge_dedupe_field_decisions', 'target_value'),
    ('merge_dedupe_field_decisions', 'resolution'),
    ('merge_dedupe_impact_snapshots', 'impact_scope'),
    ('merge_dedupe_impact_snapshots', 'before_json'),
    ('merge_dedupe_impact_snapshots', 'proposed_after_json'),
    ('merge_dedupe_audit_events', 'session_id'),
    ('merge_dedupe_audit_events', 'merge_id'),
    ('merge_dedupe_audit_events', 'actor_id'),
    ('merge_dedupe_audit_events', 'occurred_at'),
    ('merge_dedupe_audit_events', 'reason'),
    ('merge_dedupe_audit_events', 'field_impact'),
    ('merge_dedupe_audit_events', 'relationship_impact'),
    ('merge_dedupe_audit_events', 'layout_impact'),
    ('merge_dedupe_audit_events', 'membership_lineage_impact'),
    ('merge_dedupe_audit_events', 'visibility_privacy_impact'),
    ('merge_dedupe_audit_events', 'export_impact'),
    ('merge_dedupe_rollback_manifests', 'session_id'),
    ('merge_dedupe_rollback_manifests', 'merge_id'),
    ('merge_dedupe_rollback_manifests', 'source_person_snapshot'),
    ('merge_dedupe_rollback_manifests', 'target_person_snapshot'),
    ('merge_dedupe_rollback_manifests', 'relationships_snapshot'),
    ('merge_dedupe_rollback_manifests', 'layout_snapshot'),
    ('merge_dedupe_rollback_manifests', 'membership_lineage_snapshot'),
    ('merge_dedupe_rollback_manifests', 'visibility_privacy_snapshot'),
    ('merge_dedupe_rollback_manifests', 'revision_snapshot'),
    ('merge_dedupe_rollback_manifests', 'export_snapshot'),
    ('merge_dedupe_rollback_manifests', 'manifest_checksum')
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
expected_constraints(constraint_name) as (
  values
    ('merge_dedupe_candidates_order_check'),
    ('merge_dedupe_candidates_confidence_check'),
    ('merge_dedupe_sessions_people_different_check'),
    ('merge_dedupe_sessions_version_tokens_not_blank'),
    ('merge_dedupe_sessions_idempotency_key_not_blank'),
    ('merge_dedupe_sessions_impact_checksum_not_blank'),
    ('merge_dedupe_sessions_conflict_checksum_not_blank'),
    ('merge_dedupe_sessions_approval_marker_not_blank'),
    ('merge_dedupe_sessions_graph_passed_result_check'),
    ('merge_dedupe_sessions_ready_state_check'),
    ('merge_dedupe_sessions_executed_state_check'),
    ('merge_dedupe_audit_events_reason_not_blank'),
    ('merge_dedupe_audit_events_session_merge_fk'),
    ('merge_dedupe_rollback_manifests_checksum_not_blank'),
    ('merge_dedupe_rollback_manifests_verified_state_check'),
    ('merge_dedupe_rollback_manifests_used_state_check'),
    ('merge_dedupe_rollback_manifests_session_merge_fk')
),
missing_constraints as (
  select e.constraint_name
  from expected_constraints e
  left join pg_constraint c on c.conname = e.constraint_name
  left join pg_namespace n on n.oid = c.connamespace and n.nspname = 'public'
  where c.oid is null or n.oid is null
),
rls_status as (
  select e.table_name, coalesce(c.relrowsecurity, false) as rls_enabled
  from expected_tables e
  left join pg_class c
    on c.relnamespace = 'public'::regnamespace
   and c.relname = e.table_name
),
unexpected_policies as (
  select p.tablename, p.policyname
  from pg_policies p
  join expected_tables e on e.table_name = p.tablename
  where p.schemaname = 'public'
),
unexpected_triggers as (
  select c.relname as table_name, t.tgname as trigger_name
  from pg_trigger t
  join pg_class c on c.oid = t.tgrelid
  join expected_tables e on e.table_name = c.relname
  where c.relnamespace = 'public'::regnamespace
    and not t.tgisinternal
),
unexpected_routines as (
  select p.proname as routine_name
  from pg_proc p
  join pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public'
    and p.proname like 'merge_dedupe%'
),
composite_fk_status as (
  select count(*) = 2 as passed
  from pg_constraint c
  join pg_namespace n on n.oid = c.connamespace
  where n.nspname = 'public'
    and c.conname in (
      'merge_dedupe_audit_events_session_merge_fk',
      'merge_dedupe_rollback_manifests_session_merge_fk'
    )
    and c.contype = 'f'
    and pg_get_constraintdef(c.oid) ~*
      'foreign key \(session_id, merge_id\) references (public\.)?merge_dedupe_sessions\(id, merge_id\)'
),
impact_scope_status as (
  select count(*) = 1 as passed
  from pg_constraint c
  join pg_namespace n on n.oid = c.connamespace
  where n.nspname = 'public'
    and c.conname = 'merge_dedupe_impact_snapshots_scope_check'
    and pg_get_constraintdef(c.oid) like '%relationship%'
    and pg_get_constraintdef(c.oid) like '%layout%'
    and pg_get_constraintdef(c.oid) like '%membership_lineage%'
    and pg_get_constraintdef(c.oid) like '%visibility_privacy%'
    and pg_get_constraintdef(c.oid) like '%export%'
),
checks(check_name, passed, details) as (
  select
    'required_tables_exist',
    not exists (select 1 from missing_tables),
    coalesce((select string_agg(table_name, ', ' order by table_name) from missing_tables), 'none missing')
  union all
  select
    'required_columns_exist',
    not exists (select 1 from missing_columns),
    coalesce((select string_agg(table_name || '.' || column_name, ', ' order by table_name, column_name) from missing_columns), 'none missing')
  union all
  select
    'required_constraints_exist',
    not exists (select 1 from missing_constraints),
    coalesce((select string_agg(constraint_name, ', ' order by constraint_name) from missing_constraints), 'none missing')
  union all
  select
    'rls_enabled_fail_closed',
    not exists (select 1 from rls_status where not rls_enabled),
    coalesce((select string_agg(table_name, ', ' order by table_name) from rls_status where not rls_enabled), 'all enabled')
  union all
  select
    'no_merge_dedupe_policies',
    not exists (select 1 from unexpected_policies),
    coalesce((select string_agg(tablename || '.' || policyname, ', ' order by tablename, policyname) from unexpected_policies), 'none')
  union all
  select
    'no_merge_dedupe_triggers',
    not exists (select 1 from unexpected_triggers),
    coalesce((select string_agg(table_name || '.' || trigger_name, ', ' order by table_name, trigger_name) from unexpected_triggers), 'none')
  union all
  select
    'no_merge_dedupe_routines',
    not exists (select 1 from unexpected_routines),
    coalesce((select string_agg(routine_name, ', ' order by routine_name) from unexpected_routines), 'none')
  union all
  select
    'audit_rollback_composite_fk',
    (select passed from composite_fk_status),
    case when (select passed from composite_fk_status) then 'both present' else 'missing or invalid' end
  union all
  select
    'impact_scope_coverage',
    (select passed from impact_scope_status),
    case when (select passed from impact_scope_status) then 'all scopes present' else 'scope constraint incomplete' end
)
select check_name, passed, details
from checks
order by check_name;

-- Expected result: 9 rows and every passed value is true.
