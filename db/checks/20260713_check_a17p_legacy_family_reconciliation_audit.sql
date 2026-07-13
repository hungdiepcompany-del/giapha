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
family_parent_counts as (
  select
    f.id as family_id,
    coalesce(
      array_agg(distinct fp.person_id order by fp.person_id)
        filter (where fp.person_id is not null),
      array[]::uuid[]
    ) as parent_ids,
    count(fp.id)::integer as active_parent_membership_count,
    count(distinct fp.person_id)::integer as distinct_parent_count
  from active_families f
  left join active_parent_memberships fp on fp.family_id = f.id
  group by f.id
),
family_parent_identity_counts as (
  select
    fp.family_id,
    count(distinct concat_ws(
      '|',
      fp.person_id::text,
      coalesce(fp.parent_role, ''),
      coalesce(fp.relationship_type, '')
    ))::integer as distinct_parent_identity_count
  from active_parent_memberships fp
  group by fp.family_id
),
family_child_counts as (
  select
    f.id as family_id,
    count(fc.id)::integer as active_child_membership_count,
    count(distinct fc.person_id)::integer as distinct_child_count
  from active_families f
  left join active_child_memberships fc on fc.family_id = f.id
  group by f.id
),
family_layout_refs as (
  select
    f.id as family_id,
    count(distinct tln.id)::integer as layout_reference_count
  from active_families f
  left join public.tree_layout_nodes tln
    on tln.family_id = f.id
   and tln.deleted_at is null
   and tln.node_kind = 'family'
  group by f.id
),
family_revision_refs as (
  select
    family_id,
    count(distinct revision_id)::integer as revision_reference_count
  from (
    select f.id as family_id, r.id as revision_id
    from active_families f
    join public.revisions r
      on r.entity_type = 'families'
     and r.entity_id = f.id
    union all
    select fp.family_id, r.id as revision_id
    from active_parent_memberships fp
    join public.revisions r
      on r.entity_type = 'family_parents'
     and r.entity_id = fp.id
    union all
    select fc.family_id, r.id as revision_id
    from active_child_memberships fc
    join public.revisions r
      on r.entity_type = 'family_children'
     and r.entity_id = fc.id
  ) refs
  group by family_id
),
family_parent_sets as (
  select
    f.id as family_id,
    md5(f.id::text) as safe_family_ref,
    fpc.parent_ids,
    md5(coalesce(array_to_string(fpc.parent_ids, ','), 'NO_PARENT_SET')) as safe_group_ref,
    fpc.active_parent_membership_count,
    fpc.distinct_parent_count,
    coalesce(fpic.distinct_parent_identity_count, 0)::integer as distinct_parent_identity_count,
    coalesce(fcc.active_child_membership_count, 0)::integer as active_child_membership_count,
    coalesce(fcc.distinct_child_count, 0)::integer as distinct_child_count,
    coalesce(flr.layout_reference_count, 0)::integer as layout_reference_count,
    coalesce(frr.revision_reference_count, 0)::integer as revision_reference_count,
    f.canonical_key,
    f.canonical_status,
    f.merged_into_family_id,
    f.deleted_at,
    f.created_at,
    f.updated_at
  from active_families f
  join family_parent_counts fpc on fpc.family_id = f.id
  left join family_parent_identity_counts fpic on fpic.family_id = f.id
  left join family_child_counts fcc on fcc.family_id = f.id
  left join family_layout_refs flr on flr.family_id = f.id
  left join family_revision_refs frr on frr.family_id = f.id
),
normalized_groups as (
  select
    safe_group_ref,
    parent_ids,
    count(*)::integer as candidate_family_count,
    count(*) filter (where deleted_at is null)::integer as active_candidate_family_count,
    count(*) filter (
      where deleted_at is not null
         or canonical_status in ('merged', 'voided')
    )::integer as inactive_or_noncanonical_candidate_count,
    sum(distinct_child_count)::integer as distinct_child_count,
    sum(active_child_membership_count)::integer as child_membership_count,
    sum(distinct_parent_count)::integer as distinct_parent_membership_count,
    sum(active_parent_membership_count)::integer as parent_membership_count,
    sum(layout_reference_count)::integer as layout_reference_count,
    sum(revision_reference_count)::integer as revision_reference_count,
    count(*) filter (
      where canonical_key is not null
         or canonical_status <> 'legacy_unreviewed'
         or merged_into_family_id is not null
    )::integer as candidate_family_metadata_conflict_count,
    min(created_at) as oldest_candidate_created_at,
    max(updated_at) as newest_candidate_updated_at
  from family_parent_sets
  group by safe_group_ref, parent_ids
),
duplicate_groups as (
  select *
  from normalized_groups
  where active_candidate_family_count > 1
),
candidate_family_pairs as (
  select
    dg.safe_group_ref,
    dg.parent_ids,
    fps.family_id,
    fps.safe_family_ref,
    fps.active_parent_membership_count,
    fps.distinct_parent_count,
    fps.distinct_parent_identity_count,
    fps.active_child_membership_count,
    fps.distinct_child_count,
    fps.layout_reference_count,
    fps.revision_reference_count,
    fps.canonical_key,
    fps.canonical_status,
    fps.merged_into_family_id,
    fps.deleted_at,
    fps.created_at,
    fps.updated_at
  from duplicate_groups dg
  join family_parent_sets fps
    on fps.safe_group_ref = dg.safe_group_ref
   and fps.parent_ids = dg.parent_ids
),
candidate_parent_membership_rows as (
  select
    cfp.safe_group_ref,
    cfp.safe_family_ref,
    fp.family_id,
    fp.id as membership_id,
    fp.person_id,
    fp.parent_role,
    fp.relationship_type
  from candidate_family_pairs cfp
  join active_parent_memberships fp on fp.family_id = cfp.family_id
),
candidate_child_membership_rows as (
  select
    cfp.safe_group_ref,
    cfp.safe_family_ref,
    fc.family_id,
    fc.id as membership_id,
    fc.person_id,
    fc.child_relationship_type
  from candidate_family_pairs cfp
  join active_child_memberships fc on fc.family_id = cfp.family_id
),
duplicate_child_counts as (
  select
    safe_group_ref,
    count(*)::integer as children_appearing_across_multiple_candidates,
    sum(candidate_family_occurrence_count - 1)::integer as duplicate_child_membership_count
  from (
    select
      safe_group_ref,
      person_id,
      count(distinct family_id)::integer as candidate_family_occurrence_count
    from candidate_child_membership_rows
    group by safe_group_ref, person_id
    having count(distinct family_id) > 1
  ) duplicate_children
  group by safe_group_ref
),
duplicate_parent_counts as (
  select
    safe_group_ref,
    count(*)::integer as parents_appearing_across_multiple_candidates,
    sum(candidate_family_occurrence_count - 1)::integer as duplicate_parent_membership_count
  from (
    select
      safe_group_ref,
      person_id,
      parent_role,
      relationship_type,
      count(distinct family_id)::integer as candidate_family_occurrence_count
    from candidate_parent_membership_rows
    group by safe_group_ref, person_id, parent_role, relationship_type
    having count(distinct family_id) > 1
  ) duplicate_parents
  group by safe_group_ref
),
deleted_family_parent_counts as (
  select
    f.id as family_id,
    md5(f.id::text) as safe_family_ref,
    count(fp.id)::integer as active_parent_memberships_under_deleted_family
  from public.families f
  left join public.family_parents fp
    on fp.family_id = f.id
   and fp.deleted_at is null
  where f.deleted_at is not null
  group by f.id
),
deleted_family_child_counts as (
  select
    f.id as family_id,
    count(fc.id)::integer as active_child_memberships_under_deleted_family
  from public.families f
  left join public.family_children fc
    on fc.family_id = f.id
   and fc.deleted_at is null
  where f.deleted_at is not null
  group by f.id
),
deleted_family_layout_refs as (
  select
    f.id as family_id,
    count(distinct tln.id)::integer as layout_reference_count
  from public.families f
  left join public.tree_layout_nodes tln
    on tln.family_id = f.id
   and tln.deleted_at is null
   and tln.node_kind = 'family'
  where f.deleted_at is not null
  group by f.id
),
deleted_family_revision_refs as (
  select
    family_id,
    count(distinct revision_id)::integer as revision_reference_count
  from (
    select f.id as family_id, r.id as revision_id
    from public.families f
    join public.revisions r
      on r.entity_type = 'families'
     and r.entity_id = f.id
    where f.deleted_at is not null
    union all
    select fp.family_id, r.id as revision_id
    from public.family_parents fp
    join public.families f on f.id = fp.family_id
    join public.revisions r
      on r.entity_type = 'family_parents'
     and r.entity_id = fp.id
    where f.deleted_at is not null
    union all
    select fc.family_id, r.id as revision_id
    from public.family_children fc
    join public.families f on f.id = fc.family_id
    join public.revisions r
      on r.entity_type = 'family_children'
     and r.entity_id = fc.id
    where f.deleted_at is not null
  ) refs
  group by family_id
),
deleted_family_advisory as (
  select
    dfp.family_id,
    dfp.safe_family_ref,
    dfp.active_parent_memberships_under_deleted_family,
    coalesce(dfc.active_child_memberships_under_deleted_family, 0)::integer
      as active_child_memberships_under_deleted_family,
    coalesce(dfl.layout_reference_count, 0)::integer as layout_reference_count,
    coalesce(dfr.revision_reference_count, 0)::integer as revision_reference_count
  from deleted_family_parent_counts dfp
  left join deleted_family_child_counts dfc on dfc.family_id = dfp.family_id
  left join deleted_family_layout_refs dfl on dfl.family_id = dfp.family_id
  left join deleted_family_revision_refs dfr on dfr.family_id = dfp.family_id
),
global_counts as (
  select
    (select count(*) from active_families)::integer as active_family_count,
    (select count(*) from public.families)::integer as total_family_count,
    (select count(*) from active_parent_memberships)::integer
      as active_parent_memberships_under_active_families,
    (select count(*) from active_child_memberships)::integer
      as active_child_memberships_under_active_families,
    (select count(*) from row_active_parent_memberships)::integer
      as row_active_parent_memberships,
    (select count(*) from row_active_child_memberships)::integer
      as row_active_child_memberships,
    (select count(*) from public.families where deleted_at is not null)::integer
      as deleted_family_count,
    (select count(*) from public.families where canonical_status in ('merged', 'voided'))::integer
      as merged_or_voided_family_count,
    (
      select count(*)
      from public.family_parents fp
      join public.families f on f.id = fp.family_id
      where fp.deleted_at is null and f.deleted_at is not null
    )::integer as orphan_active_parent_memberships_under_inactive_families,
    (
      select count(*)
      from public.family_children fc
      join public.families f on f.id = fc.family_id
      where fc.deleted_at is null and f.deleted_at is not null
    )::integer as orphan_active_child_memberships_under_inactive_families,
    (select count(*) from public.families where canonical_key is not null)::integer
      as canonical_key_population_count,
    (select count(*) from public.family_reconciliation_batches)::integer
      as reconciliation_batch_count,
    (select count(*) from public.family_canonicalization_decisions)::integer
      as owner_decision_count,
    (select count(*) from public.family_reconciliation_rollback_manifests)::integer
      as rollback_manifest_count
),
audit_integrity_checks as (
  select
    (select count(*) from duplicate_groups)::integer as candidate_group_count,
    (select count(*) from candidate_family_pairs)::integer as candidate_family_count,
    (
      select count(*) = count(distinct safe_group_ref || ':' || safe_family_ref)
      from candidate_family_pairs
    ) as candidate_pair_uniqueness_pass,
    (
      select count(*) = 0
      from (
        select safe_group_ref, safe_family_ref from candidate_parent_membership_rows
        union all
        select safe_group_ref, safe_family_ref from candidate_child_membership_rows
      ) memberships
      left join candidate_family_pairs cfp
        on cfp.safe_group_ref = memberships.safe_group_ref
       and cfp.safe_family_ref = memberships.safe_family_ref
      where cfp.safe_family_ref is null
    ) as membership_pairs_subset_of_candidate_pairs_pass,
    (
      select count(*) = 0
      from candidate_family_pairs cfp
      left join (
        select safe_group_ref, safe_family_ref, count(*)::integer as detail_child_count
        from candidate_child_membership_rows
        group by safe_group_ref, safe_family_ref
      ) details
        on details.safe_group_ref = cfp.safe_group_ref
       and details.safe_family_ref = cfp.safe_family_ref
      where cfp.active_child_membership_count <> coalesce(details.detail_child_count, 0)
    ) as candidate_child_counts_match_detail_pass,
    (
      select count(*) = 0
      from candidate_family_pairs
      where distinct_parent_count <> cardinality(parent_ids)
    ) as candidate_parent_counts_match_group_identity_pass,
    (
      select count(*) = 0
      from duplicate_child_counts dcc
      where dcc.duplicate_child_membership_count < 1
         or dcc.children_appearing_across_multiple_candidates < 1
    ) as duplicate_child_count_semantics_pass,
    (
      select count(*) = 0
      from duplicate_parent_counts dpc
      where dpc.duplicate_parent_membership_count < 1
         or dpc.parents_appearing_across_multiple_candidates < 1
    ) as duplicate_parent_count_semantics_pass,
    (
      select coalesce(sum(active_parent_memberships_under_deleted_family), 0)
           = (select orphan_active_parent_memberships_under_inactive_families from global_counts)
      from deleted_family_advisory
    ) as deleted_family_advisory_matches_global_scope_pass,
    (
      select count(*) = 0
      from duplicate_groups dg
      left join (
        select safe_group_ref, sum(layout_reference_count)::integer as expected_layout_count
        from candidate_family_pairs
        group by safe_group_ref
      ) expected on expected.safe_group_ref = dg.safe_group_ref
      where dg.layout_reference_count <> coalesce(expected.expected_layout_count, 0)
    ) as layout_counts_not_join_multiplied_pass,
    (
      select count(*) = 0
      from duplicate_groups dg
      left join (
        select safe_group_ref, sum(revision_reference_count)::integer as expected_revision_count
        from candidate_family_pairs
        group by safe_group_ref
      ) expected on expected.safe_group_ref = dg.safe_group_ref
      where dg.revision_reference_count <> coalesce(expected.expected_revision_count, 0)
    ) as revision_counts_not_join_multiplied_pass
),
global_baseline as (
  select jsonb_build_object(
    'result_set', 'global_baseline',
    'active_family_count', active_family_count,
    'total_family_count', total_family_count,
    'active_parent_memberships_under_active_families',
      active_parent_memberships_under_active_families,
    'active_child_memberships_under_active_families',
      active_child_memberships_under_active_families,
    'row_active_parent_memberships', row_active_parent_memberships,
    'row_active_child_memberships', row_active_child_memberships,
    'deleted_family_count', deleted_family_count,
    'merged_or_voided_family_count', merged_or_voided_family_count,
    'orphan_active_parent_memberships_under_inactive_families',
      orphan_active_parent_memberships_under_inactive_families,
    'orphan_active_child_memberships_under_inactive_families',
      orphan_active_child_memberships_under_inactive_families,
    'canonical_key_population_count', canonical_key_population_count,
    'reconciliation_batch_count', reconciliation_batch_count,
    'owner_decision_count', owner_decision_count,
    'rollback_manifest_count', rollback_manifest_count
  ) as payload
  from global_counts
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
    'child_membership_count', dg.child_membership_count,
    'duplicate_child_membership_count', coalesce(dcc.duplicate_child_membership_count, 0),
    'children_appearing_across_multiple_candidates',
      coalesce(dcc.children_appearing_across_multiple_candidates, 0),
    'distinct_parent_membership_count', dg.distinct_parent_membership_count,
    'parent_membership_count', dg.parent_membership_count,
    'duplicate_parent_membership_count', coalesce(dpc.duplicate_parent_membership_count, 0),
    'parents_appearing_across_multiple_candidates',
      coalesce(dpc.parents_appearing_across_multiple_candidates, 0),
    'candidate_family_metadata_conflict_count', dg.candidate_family_metadata_conflict_count,
    'union_context_conflict_count', 0,
    'relationship_period_conflict_count', 0,
    'layout_reference_count', dg.layout_reference_count,
    'revision_reference_count', dg.revision_reference_count,
    'proposed_risk_class_evidence',
      case
        when cardinality(dg.parent_ids) > 2 then 'BLOCKED_GRAPH_INVARIANT'
        when dg.layout_reference_count > 0 then 'OWNER_DECISION_REQUIRED'
        else 'OWNER_DECISION_REQUIRED'
      end
  ) as payload
  from duplicate_groups dg
  left join duplicate_child_counts dcc on dcc.safe_group_ref = dg.safe_group_ref
  left join duplicate_parent_counts dpc on dpc.safe_group_ref = dg.safe_group_ref
),
candidate_family_detail as (
  select jsonb_build_object(
    'result_set', 'candidate_family_detail',
    'safe_group_ref', cfp.safe_group_ref,
    'safe_family_ref', cfp.safe_family_ref,
    'is_active', cfp.deleted_at is null,
    'canonical_status', cfp.canonical_status,
    'has_canonical_key', cfp.canonical_key is not null,
    'has_merge_target', cfp.merged_into_family_id is not null,
    'parent_membership_count', cfp.active_parent_membership_count,
    'distinct_parent_count', cfp.distinct_parent_count,
    'child_membership_count', cfp.active_child_membership_count,
    'distinct_child_count', cfp.distinct_child_count,
    'layout_reference_count', cfp.layout_reference_count,
    'revision_reference_count', cfp.revision_reference_count,
    'created_at', cfp.created_at,
    'updated_at', cfp.updated_at
  ) as payload
  from candidate_family_pairs cfp
),
membership_detail as (
  select jsonb_build_object(
    'result_set', 'membership_detail',
    'safe_group_ref', cpmr.safe_group_ref,
    'safe_family_ref', cpmr.safe_family_ref,
    'membership_kind', 'parent',
    'safe_membership_ref', md5(cpmr.membership_id::text),
    'safe_person_ref', md5(cpmr.person_id::text),
    'relationship_role', cpmr.parent_role,
    'relationship_type', cpmr.relationship_type
  ) as payload
  from candidate_parent_membership_rows cpmr
  union all
  select jsonb_build_object(
    'result_set', 'membership_detail',
    'safe_group_ref', ccmr.safe_group_ref,
    'safe_family_ref', ccmr.safe_family_ref,
    'membership_kind', 'child',
    'safe_membership_ref', md5(ccmr.membership_id::text),
    'safe_person_ref', md5(ccmr.person_id::text),
    'relationship_role', null,
    'relationship_type', ccmr.child_relationship_type
  ) as payload
  from candidate_child_membership_rows ccmr
),
deleted_family_advisory_result as (
  select jsonb_build_object(
    'result_set', 'deleted_family_advisory',
    'safe_family_ref', safe_family_ref,
    'active_parent_memberships_under_deleted_family',
      active_parent_memberships_under_deleted_family,
    'active_child_memberships_under_deleted_family',
      active_child_memberships_under_deleted_family,
    'layout_reference_count', layout_reference_count,
    'revision_reference_count', revision_reference_count,
    'deleted_family_action', 'SEPARATE_OWNER_DECISION_REQUIRED'
  ) as payload
  from deleted_family_advisory
),
audit_integrity_result as (
  select jsonb_build_object(
    'result_set', 'audit_integrity',
    'candidate_group_count', candidate_group_count,
    'candidate_family_count', candidate_family_count,
    'candidate_pair_uniqueness_pass', candidate_pair_uniqueness_pass,
    'membership_pairs_subset_of_candidate_pairs_pass',
      membership_pairs_subset_of_candidate_pairs_pass,
    'candidate_child_counts_match_detail_pass', candidate_child_counts_match_detail_pass,
    'candidate_parent_counts_match_group_identity_pass',
      candidate_parent_counts_match_group_identity_pass,
    'duplicate_child_count_semantics_pass', duplicate_child_count_semantics_pass,
    'duplicate_parent_count_semantics_pass', duplicate_parent_count_semantics_pass,
    'deleted_family_advisory_matches_global_scope_pass',
      deleted_family_advisory_matches_global_scope_pass,
    'layout_counts_not_join_multiplied_pass', layout_counts_not_join_multiplied_pass,
    'revision_counts_not_join_multiplied_pass', revision_counts_not_join_multiplied_pass
  ) as payload
  from audit_integrity_checks
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
select payload from deleted_family_advisory_result
union all
select payload from audit_integrity_result;
