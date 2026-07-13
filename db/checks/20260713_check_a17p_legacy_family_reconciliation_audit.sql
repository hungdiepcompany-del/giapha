with active_families as (
  select *
  from public.families
  where deleted_at is null
),
active_parent_memberships as (
  select fp.*
  from public.family_parents fp
  join active_families f on f.id = fp.family_id
  where fp.deleted_at is null
),
active_child_memberships as (
  select fc.*
  from public.family_children fc
  join active_families f on f.id = fc.family_id
  where fc.deleted_at is null
),
row_active_parent_memberships as (
  select *
  from public.family_parents
  where deleted_at is null
),
row_active_child_memberships as (
  select *
  from public.family_children
  where deleted_at is null
),
family_parent_sets as (
  select
    f.id as family_id,
    md5(f.id::text) as safe_family_ref,
    array_agg(fp.person_id order by fp.person_id) filter (where fp.person_id is not null) as parent_ids,
    count(fp.id)::integer as active_parent_membership_count,
    count(distinct fp.person_id)::integer as distinct_parent_count,
    count(fc.id)::integer as active_child_membership_count,
    count(distinct fc.person_id)::integer as distinct_child_count,
    f.canonical_key,
    f.canonical_status,
    f.merged_into_family_id,
    f.deleted_at,
    f.created_at,
    f.updated_at
  from active_families f
  left join active_parent_memberships fp on fp.family_id = f.id
  left join active_child_memberships fc on fc.family_id = f.id
  group by
    f.id,
    f.canonical_key,
    f.canonical_status,
    f.merged_into_family_id,
    f.deleted_at,
    f.created_at,
    f.updated_at
),
normalized_groups as (
  select
    md5(coalesce(array_to_string(parent_ids, ','), 'NO_PARENT_SET')) as safe_group_ref,
    coalesce(parent_ids, array[]::uuid[]) as parent_ids,
    count(*)::integer as candidate_family_count,
    count(*) filter (where deleted_at is null)::integer as active_candidate_family_count,
    count(*) filter (
      where deleted_at is not null
         or canonical_status in ('merged', 'voided')
    )::integer as inactive_or_noncanonical_candidate_count,
    sum(distinct_child_count)::integer as distinct_child_count,
    sum(active_child_membership_count - distinct_child_count)::integer as duplicate_child_membership_count,
    sum(distinct_parent_count)::integer as distinct_parent_membership_count,
    sum(active_parent_membership_count - distinct_parent_count)::integer as duplicate_parent_membership_count,
    count(*) filter (
      where canonical_key is not null
         or canonical_status <> 'legacy_unreviewed'
         or merged_into_family_id is not null
    )::integer as candidate_family_metadata_conflict_count,
    min(created_at) as oldest_candidate_created_at,
    max(updated_at) as newest_candidate_updated_at
  from family_parent_sets
  group by parent_ids
),
duplicate_groups as (
  select *
  from normalized_groups
  where active_candidate_family_count > 1
),
children_across_candidates as (
  select
    md5(array_to_string(array_agg(distinct fp.person_id order by fp.person_id), ',')) as safe_group_ref,
    count(distinct fc.person_id)::integer as children_appearing_across_multiple_candidates
  from active_parent_memberships fp
  join active_child_memberships fc on fc.family_id = fp.family_id
  group by fc.person_id
  having count(distinct fc.family_id) > 1
),
layout_refs as (
  select
    md5(coalesce(array_to_string(fps.parent_ids, ','), 'NO_PARENT_SET')) as safe_group_ref,
    count(tln.id)::integer as layout_reference_count
  from family_parent_sets fps
  left join public.tree_layout_nodes tln
    on tln.family_id = fps.family_id
   and tln.deleted_at is null
   and tln.node_kind = 'family'
  group by fps.parent_ids
),
revision_refs as (
  select
    md5(coalesce(array_to_string(fps.parent_ids, ','), 'NO_PARENT_SET')) as safe_group_ref,
    count(r.id)::integer as revision_reference_count
  from family_parent_sets fps
  left join public.revisions r
    on r.entity_id = fps.family_id
   and r.entity_type in ('families', 'family_parents', 'family_children')
  group by fps.parent_ids
),
deleted_family_advisory as (
  select
    md5(f.id::text) as safe_family_ref,
    count(fp.id)::integer as active_parent_memberships_under_deleted_family,
    count(fc.id)::integer as active_child_memberships_under_deleted_family,
    count(tln.id)::integer as layout_reference_count,
    count(r.id)::integer as revision_reference_count
  from public.families f
  left join public.family_parents fp
    on fp.family_id = f.id
   and fp.deleted_at is null
  left join public.family_children fc
    on fc.family_id = f.id
   and fc.deleted_at is null
  left join public.tree_layout_nodes tln
    on tln.family_id = f.id
   and tln.deleted_at is null
  left join public.revisions r
    on r.entity_id = f.id
   and r.entity_type in ('families', 'family_parents', 'family_children')
  where f.deleted_at is not null
  group by f.id
),
global_baseline as (
  select jsonb_build_object(
    'result_set', 'global_baseline',
    'active_family_count', (select count(*) from active_families),
    'total_family_count', (select count(*) from public.families),
    'active_parent_memberships_under_active_families', (select count(*) from active_parent_memberships),
    'active_child_memberships_under_active_families', (select count(*) from active_child_memberships),
    'row_active_parent_memberships', (select count(*) from row_active_parent_memberships),
    'row_active_child_memberships', (select count(*) from row_active_child_memberships),
    'deleted_family_count', (select count(*) from public.families where deleted_at is not null),
    'merged_or_voided_family_count', (select count(*) from public.families where canonical_status in ('merged', 'voided')),
    'orphan_active_parent_memberships_under_inactive_families', (
      select count(*)
      from public.family_parents fp
      join public.families f on f.id = fp.family_id
      where fp.deleted_at is null and f.deleted_at is not null
    ),
    'orphan_active_child_memberships_under_inactive_families', (
      select count(*)
      from public.family_children fc
      join public.families f on f.id = fc.family_id
      where fc.deleted_at is null and f.deleted_at is not null
    ),
    'canonical_key_population_count', (select count(*) from public.families where canonical_key is not null),
    'reconciliation_batch_count', (select count(*) from public.family_reconciliation_batches),
    'owner_decision_count', (select count(*) from public.family_canonicalization_decisions),
    'rollback_manifest_count', (select count(*) from public.family_reconciliation_rollback_manifests)
  ) as payload
),
duplicate_group_summary as (
  select jsonb_build_object(
    'result_set', 'duplicate_group_summary',
    'safe_group_ref', dg.safe_group_ref,
    'parent_count', cardinality(dg.parent_ids),
    'candidate_family_count', dg.candidate_family_count,
    'active_candidate_family_count', dg.active_candidate_family_count,
    'inactive_or_noncanonical_candidate_count', dg.inactive_or_noncanonical_candidate_count,
    'distinct_child_count', dg.distinct_child_count,
    'duplicate_child_membership_count', dg.duplicate_child_membership_count,
    'distinct_parent_membership_count', dg.distinct_parent_membership_count,
    'duplicate_parent_membership_count', dg.duplicate_parent_membership_count,
    'children_appearing_across_multiple_candidates', coalesce(cac.children_appearing_across_multiple_candidates, 0),
    'candidate_family_metadata_conflict_count', dg.candidate_family_metadata_conflict_count,
    'union_context_conflict_count', 0,
    'relationship_period_conflict_count', 0,
    'layout_reference_count', coalesce(lr.layout_reference_count, 0),
    'revision_reference_count', coalesce(rr.revision_reference_count, 0),
    'proposed_risk_class_evidence',
      case
        when cardinality(dg.parent_ids) > 2 then 'BLOCKED_GRAPH_INVARIANT'
        when coalesce(lr.layout_reference_count, 0) > 0 then 'OWNER_DECISION_REQUIRED'
        else 'OWNER_DECISION_REQUIRED'
      end
  ) as payload
  from duplicate_groups dg
  left join children_across_candidates cac on cac.safe_group_ref = dg.safe_group_ref
  left join layout_refs lr on lr.safe_group_ref = dg.safe_group_ref
  left join revision_refs rr on rr.safe_group_ref = dg.safe_group_ref
),
candidate_family_detail as (
  select jsonb_build_object(
    'result_set', 'candidate_family_detail',
    'safe_group_ref', md5(coalesce(array_to_string(fps.parent_ids, ','), 'NO_PARENT_SET')),
    'safe_family_ref', fps.safe_family_ref,
    'is_active', fps.deleted_at is null,
    'canonical_status', fps.canonical_status,
    'has_canonical_key', fps.canonical_key is not null,
    'has_merge_target', fps.merged_into_family_id is not null,
    'parent_membership_count', fps.active_parent_membership_count,
    'child_membership_count', fps.active_child_membership_count,
    'layout_reference_count', coalesce(lr.layout_reference_count, 0),
    'revision_reference_count', coalesce(rr.revision_reference_count, 0),
    'created_at', fps.created_at,
    'updated_at', fps.updated_at
  ) as payload
  from family_parent_sets fps
  join duplicate_groups dg on dg.parent_ids = fps.parent_ids
  left join layout_refs lr on lr.safe_group_ref = md5(coalesce(array_to_string(fps.parent_ids, ','), 'NO_PARENT_SET'))
  left join revision_refs rr on rr.safe_group_ref = md5(coalesce(array_to_string(fps.parent_ids, ','), 'NO_PARENT_SET'))
),
membership_detail as (
  select jsonb_build_object(
    'result_set', 'membership_detail',
    'safe_group_ref', md5(coalesce(array_to_string(dg.parent_ids, ','), 'NO_PARENT_SET')),
    'safe_family_ref', md5(fp.family_id::text),
    'membership_kind', 'parent',
    'safe_membership_ref', md5(fp.id::text),
    'safe_person_ref', md5(fp.person_id::text),
    'relationship_role', fp.parent_role,
    'relationship_type', fp.relationship_type
  ) as payload
  from duplicate_groups dg
  join active_parent_memberships fp on fp.person_id = any(dg.parent_ids)
  union all
  select jsonb_build_object(
    'result_set', 'membership_detail',
    'safe_group_ref', md5(coalesce(array_to_string(dg.parent_ids, ','), 'NO_PARENT_SET')),
    'safe_family_ref', md5(fc.family_id::text),
    'membership_kind', 'child',
    'safe_membership_ref', md5(fc.id::text),
    'safe_person_ref', md5(fc.person_id::text),
    'relationship_role', null,
    'relationship_type', fc.child_relationship_type
  ) as payload
  from duplicate_groups dg
  join family_parent_sets fps on fps.parent_ids = dg.parent_ids
  join active_child_memberships fc on fc.family_id = fps.family_id
),
deleted_family_advisory_result as (
  select jsonb_build_object(
    'result_set', 'deleted_family_advisory',
    'safe_family_ref', safe_family_ref,
    'active_parent_memberships_under_deleted_family', active_parent_memberships_under_deleted_family,
    'active_child_memberships_under_deleted_family', active_child_memberships_under_deleted_family,
    'layout_reference_count', layout_reference_count,
    'revision_reference_count', revision_reference_count,
    'deleted_family_action', 'SEPARATE_OWNER_DECISION_REQUIRED'
  ) as payload
  from deleted_family_advisory
)
select payload
from global_baseline
union all
select payload from duplicate_group_summary
union all
select payload from candidate_family_detail
union all
select payload from membership_detail
union all
select payload from deleted_family_advisory_result;
