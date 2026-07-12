-- A16R_IMPORT_COMPLETED_POST_IMPORT_VERIFICATION
-- READ_ONLY_POST_IMPORT_VERIFICATION
-- TARGET_SESSION_ID=2af4bfb6-a20e-453e-9804-1b8c0afbdd68

with target as (
  select '2af4bfb6-a20e-453e-9804-1b8c0afbdd68'::uuid as session_id
),
session_row as (
  select
    s.id,
    s.status,
    s.warning_count,
    s.approval_marker,
    s.person_candidate_count,
    s.relationship_candidate_count
  from public.import_sessions s
  join target t on t.session_id = s.id
),
warning_counts as (
  select
    count(*) as stored_warning_row_count,
    count(*) filter (
      where severity = 'blocker'
        and review_status not in ('resolved', 'acknowledged')
    ) as unresolved_blocker_warning_count
  from public.import_session_warnings w
  join target t on t.session_id = w.import_session_id
),
batch_rows as (
  select b.*
  from public.official_import_batches b
  join target t on t.session_id = b.import_session_id
),
completed_batch as (
  select b.*
  from batch_rows b
  where b.status = 'completed'
  order by b.completed_at desc nulls last, b.created_at desc
  limit 1
),
rollback_rows as (
  select r.*
  from public.official_import_rollback_manifests r
  join target t on t.session_id = r.import_session_id
),
ready_rollback as (
  select r.*
  from rollback_rows r
  join completed_batch b on b.id = r.import_batch_id
  where r.rollback_status = 'ready'
  order by r.created_at desc
  limit 1
),
write_manifest_rows as (
  select w.*
  from public.import_write_manifests w
  join target t on t.session_id = w.import_session_id
),
completed_write_manifest as (
  select w.*
  from write_manifest_rows w
  where w.status = 'write_completed'
  order by w.completed_at desc nulls last, w.created_at desc
  limit 1
),
write_manifest_counts as (
  select
    case
      when jsonb_typeof(w.created_record_ids -> 'people') = 'array'
        then jsonb_array_length(w.created_record_ids -> 'people')
      else 0
    end as people_json_count,
    case
      when jsonb_typeof(w.created_record_ids -> 'families') = 'array'
        then jsonb_array_length(w.created_record_ids -> 'families')
      else 0
    end as families_json_count,
    case
      when jsonb_typeof(w.created_record_ids -> 'family_parents') = 'array'
        then jsonb_array_length(w.created_record_ids -> 'family_parents')
      else 0
    end as family_parents_json_count,
    case
      when jsonb_typeof(w.created_record_ids -> 'family_children') = 'array'
        then jsonb_array_length(w.created_record_ids -> 'family_children')
      else 0
    end as family_children_json_count,
    case
      when jsonb_typeof(w.created_record_ids -> 'revisions') = 'array'
        then jsonb_array_length(w.created_record_ids -> 'revisions')
      else 0
    end as revisions_json_count
  from completed_write_manifest w
),
rollback_counts as (
  select
    cardinality(r.created_people_ids) as rollback_people_count,
    cardinality(r.created_family_ids) as rollback_family_count,
    cardinality(r.created_family_parent_ids) as rollback_family_parent_count,
    cardinality(r.created_family_child_ids) as rollback_family_child_count,
    cardinality(r.created_revision_ids) as rollback_revision_count
  from ready_rollback r
),
visible_counts as (
  select
    (
      select count(*)
      from public.people p, ready_rollback r
      where p.id = any(r.created_people_ids)
        and p.deleted_at is null
    ) as active_people_count,
    (
      select count(*)
      from public.families f, ready_rollback r
      where f.id = any(r.created_family_ids)
        and f.deleted_at is null
    ) as active_family_count,
    (
      select count(*)
      from public.family_parents fp, ready_rollback r
      where fp.id = any(r.created_family_parent_ids)
        and fp.deleted_at is null
    ) as active_family_parent_count,
    (
      select count(*)
      from public.family_children fc, ready_rollback r
      where fc.id = any(r.created_family_child_ids)
        and fc.deleted_at is null
    ) as active_family_child_count,
    (
      select count(*)
      from public.revisions rv, ready_rollback r
      where rv.id = any(r.created_revision_ids)
    ) as revision_count
),
checks as (
  select
    'session_completed_state' as check_name,
    exists (select 1 from session_row where status = 'write_completed') as pass,
    coalesce((select status from session_row limit 1), 'missing') as metric_value
  union all
  select
    'owner_evidence_import_completed_status',
    exists (select 1 from completed_batch),
    coalesce((select status from completed_batch limit 1), 'missing')
  union all
  select
    'imported_people_count_102',
    exists (select 1 from completed_batch where created_people_count = 102),
    coalesce((select created_people_count::text from completed_batch limit 1), 'missing')
  union all
  select
    'owner_evidence_warnings_count_zero_recorded',
    true,
    'owner_evidence=0'
  union all
  select
    'stored_session_warning_count_recorded',
    exists (select 1 from session_row),
    coalesce((select warning_count::text from session_row limit 1), 'missing')
  union all
  select
    'unresolved_blocker_warning_count_zero',
    exists (
      select 1
      from warning_counts
      where unresolved_blocker_warning_count = 0
    ),
    coalesce(
      (select unresolved_blocker_warning_count::text from warning_counts limit 1),
      'missing'
    )
  union all
  select
    'transaction_helper_call_count_one',
    (select count(*) from batch_rows) = 1,
    (select count(*)::text from batch_rows)
  union all
  select
    'one_completed_audit_batch',
    (select count(*) from completed_batch) = 1,
    (select count(*)::text from completed_batch)
  union all
  select
    'imported_relationship_count_present',
    exists (select 1 from completed_batch where created_relationship_count > 0),
    coalesce((select created_relationship_count::text from completed_batch limit 1), 'missing')
  union all
  select
    'audit_record_count_present',
    exists (select 1 from completed_batch where audit_record_count > 0),
    coalesce((select audit_record_count::text from completed_batch limit 1), 'missing')
  union all
  select
    'rollback_manifest_ready',
    exists (select 1 from ready_rollback),
    coalesce((select rollback_status from ready_rollback limit 1), 'missing')
  union all
  select
    'rollback_manifest_count_one',
    exists (select 1 from completed_batch where rollback_manifest_count = 1)
      and (select count(*) from rollback_rows) = 1,
    coalesce((select rollback_manifest_count::text from completed_batch limit 1), 'missing')
  union all
  select
    'write_manifest_completed',
    exists (select 1 from completed_write_manifest),
    coalesce((select status from completed_write_manifest limit 1), 'missing')
  union all
  select
    'write_manifest_people_count_102',
    exists (select 1 from write_manifest_counts where people_json_count = 102),
    coalesce((select people_json_count::text from write_manifest_counts limit 1), 'missing')
  union all
  select
    'write_manifest_relationship_count_matches_batch',
    exists (
      select 1
      from write_manifest_counts c, completed_batch b
      where c.family_parents_json_count + c.family_children_json_count =
        b.created_relationship_count
    ),
    coalesce(
      (
        select
          (c.family_parents_json_count + c.family_children_json_count)::text
        from write_manifest_counts c
        limit 1
      ),
      'missing'
    )
  union all
  select
    'rollback_people_count_matches_batch',
    exists (
      select 1
      from rollback_counts c, completed_batch b
      where c.rollback_people_count = b.created_people_count
    ),
    coalesce((select rollback_people_count::text from rollback_counts limit 1), 'missing')
  union all
  select
    'rollback_relationship_count_matches_batch',
    exists (
      select 1
      from rollback_counts c, completed_batch b
      where c.rollback_family_parent_count + c.rollback_family_child_count =
        b.created_relationship_count
    ),
    coalesce(
      (
        select
          (c.rollback_family_parent_count + c.rollback_family_child_count)::text
        from rollback_counts c
        limit 1
      ),
      'missing'
    )
  union all
  select
    'audit_record_count_matches_rollback_revisions',
    exists (
      select 1
      from rollback_counts c, completed_batch b
      where c.rollback_revision_count = b.audit_record_count
    ),
    coalesce((select rollback_revision_count::text from rollback_counts limit 1), 'missing')
  union all
  select
    'basic_tree_people_visible',
    exists (
      select 1
      from visible_counts v, completed_batch b
      where v.active_people_count = b.created_people_count
        and v.active_people_count = 102
    ),
    coalesce((select active_people_count::text from visible_counts limit 1), 'missing')
  union all
  select
    'basic_tree_relationships_visible',
    exists (
      select 1
      from visible_counts v, completed_batch b
      where v.active_family_parent_count + v.active_family_child_count =
        b.created_relationship_count
        and v.active_family_count > 0
        and v.active_family_parent_count > 0
        and v.active_family_child_count > 0
    ),
    coalesce(
      (
        select
          (v.active_family_parent_count + v.active_family_child_count)::text
        from visible_counts v
        limit 1
      ),
      'missing'
    )
  union all
  select
    'basic_tree_audit_revisions_visible',
    exists (
      select 1
      from visible_counts v, completed_batch b
      where v.revision_count = b.audit_record_count
    ),
    coalesce((select revision_count::text from visible_counts limit 1), 'missing')
),
summary as (
  select
    'a16r_import_completed_post_import_verified' as check_name,
    not exists (select 1 from checks where pass = false) as pass,
    (select count(*)::text from checks where pass = true) || '/' ||
      (select count(*)::text from checks) as metric_value
)
select
  'A16R_IMPORT_COMPLETED_POST_IMPORT_VERIFY' as verification_scope,
  check_name,
  case when pass then 'PASS' else 'FAIL' end as result,
  metric_value
from checks
union all
select
  'A16R_IMPORT_COMPLETED_POST_IMPORT_VERIFY',
  check_name,
  case when pass then 'PASS' else 'FAIL' end,
  metric_value
from summary
order by check_name;
