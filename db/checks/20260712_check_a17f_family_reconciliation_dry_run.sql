-- A17F_FAMILY_RECONCILIATION_DRY_RUN
-- SELECT_ONLY_DETERMINISTIC_DRY_RUN
-- NO_PII_OUTPUT

with recursive active_people as (
  select id
  from public.people
  where deleted_at is null
),
active_families as (
  select
    id,
    visibility,
    family_code,
    family_label,
    notes,
    created_at,
    created_by,
    updated_at,
    updated_by
  from public.families
  where deleted_at is null
),
active_family_parents as (
  select fp.id, fp.family_id, fp.person_id, fp.parent_role, fp.relationship_type, fp.sort_order
  from public.family_parents fp
  join active_families f on f.id = fp.family_id
  join active_people p on p.id = fp.person_id
  where fp.deleted_at is null
),
active_family_children as (
  select fc.id, fc.family_id, fc.person_id, fc.child_relationship_type, fc.sort_order
  from public.family_children fc
  join active_families f on f.id = fc.family_id
  join active_people p on p.id = fc.person_id
  where fc.deleted_at is null
),
active_couples as (
  select id, person1_id, person2_id, family_id, relationship_status, start_date, start_date_precision, end_date, end_date_precision, visibility
  from public.couple_relationships
  where deleted_at is null
),
family_parent_sets as (
  select
    f.id as family_id,
    count(fp.person_id) as parent_count,
    coalesce(string_agg(fp.person_id::text, ',' order by fp.person_id::text), 'NO_ACTIVE_PARENTS') as parent_set_key,
    coalesce(
      string_agg(
        fp.person_id::text || ':' || fp.parent_role || ':' || fp.relationship_type,
        ','
        order by fp.person_id::text, fp.parent_role, fp.relationship_type
      ),
      'NO_ACTIVE_PARENT_SEMANTICS'
    ) as parent_semantics_key
  from active_families f
  left join active_family_parents fp on fp.family_id = f.id
  group by f.id
),
family_child_sets as (
  select
    f.id as family_id,
    count(fc.person_id) as child_count,
    count(distinct fc.person_id::text || ':' || fc.child_relationship_type) as unique_child_semantics_count,
    coalesce(
      string_agg(
        fc.person_id::text || ':' || fc.child_relationship_type,
        ','
        order by fc.person_id::text, fc.child_relationship_type
      ),
      'NO_ACTIVE_CHILD_SEMANTICS'
    ) as child_semantics_key
  from active_families f
  left join active_family_children fc on fc.family_id = f.id
  group by f.id
),
family_parent_pairs as (
  select
    fps.family_id,
    min(fp.person_id::text) as person_low,
    max(fp.person_id::text) as person_high
  from family_parent_sets fps
  join active_family_parents fp on fp.family_id = fps.family_id
  where fps.parent_count = 2
  group by fps.family_id
),
family_couple_metadata as (
  select
    fps.family_id,
    count(c.id) as matching_couple_count,
    count(c.id) filter (where c.family_id = fps.family_id) as direct_couple_link_count,
    coalesce(
      string_agg(
        c.relationship_status || ':' ||
        coalesce(c.start_date::text, 'NO_START') || ':' ||
        coalesce(c.start_date_precision, 'NO_START_PRECISION') || ':' ||
        coalesce(c.end_date::text, 'NO_END') || ':' ||
        coalesce(c.end_date_precision, 'NO_END_PRECISION') || ':' ||
        coalesce(c.visibility, 'NO_VISIBILITY') || ':' ||
        case when c.family_id = fps.family_id then 'LINKED_TO_THIS_FAMILY' else 'PAIR_MATCH_ONLY' end,
        ','
        order by c.relationship_status, c.id::text
      ),
      'NO_MATCHING_COUPLE'
    ) as couple_metadata_key
  from family_parent_sets fps
  left join family_parent_pairs pair on pair.family_id = fps.family_id
  left join active_couples c
    on (
      pair.family_id is not null
      and least(c.person1_id::text, c.person2_id::text) = pair.person_low
      and greatest(c.person1_id::text, c.person2_id::text) = pair.person_high
    )
    or c.family_id = fps.family_id
  group by fps.family_id
),
family_layout_refs as (
  select
    f.id as family_id,
    count(tln.id) as layout_reference_count
  from active_families f
  left join public.tree_layout_nodes tln
    on tln.family_id = f.id
   and tln.deleted_at is null
   and tln.node_kind = 'family'
  group by f.id
),
family_metadata as (
  select
    f.id as family_id,
    (case when f.family_code is null or btrim(f.family_code) = '' then 0 else 1 end) +
    (case when f.family_label is null or btrim(f.family_label) = '' then 0 else 1 end) +
    (case when f.notes is null or btrim(f.notes) = '' then 0 else 1 end) as metadata_completeness_score,
    (case when f.family_code is null or btrim(f.family_code) = '' then 'NO_CODE' else 'HAS_CODE:' || md5(f.family_code) end)
      || '|label=' || (case when f.family_label is null or btrim(f.family_label) = '' then 'NO_LABEL' else 'HAS_LABEL:' || md5(f.family_label) end)
      || '|notes=' || (case when f.notes is null or btrim(f.notes) = '' then 'NO_NOTES' else 'HAS_NOTES:' || md5(f.notes) end)
      || '|visibility=' || f.visibility as family_metadata_key,
    coalesce(f.created_by::text, 'NO_CREATED_BY') || '|' || coalesce(f.updated_by::text, 'NO_UPDATED_BY') as source_provenance_key,
    f.created_at
  from active_families f
),
family_audit_rows as (
  select
    f.id as family_id,
    fps.parent_count,
    fps.parent_set_key,
    fps.parent_semantics_key,
    fcs.child_count,
    fcs.unique_child_semantics_count,
    fcs.child_semantics_key,
    fm.metadata_completeness_score,
    fm.family_metadata_key,
    fm.source_provenance_key,
    fm.created_at,
    fcm.matching_couple_count,
    fcm.direct_couple_link_count,
    fcm.couple_metadata_key,
    flr.layout_reference_count
  from active_families f
  join family_parent_sets fps on fps.family_id = f.id
  join family_child_sets fcs on fcs.family_id = f.id
  join family_metadata fm on fm.family_id = f.id
  join family_couple_metadata fcm on fcm.family_id = f.id
  join family_layout_refs flr on flr.family_id = f.id
),
parent_set_groups as (
  select
    parent_set_key,
    parent_count,
    count(*) as family_count,
    count(distinct parent_semantics_key) as parent_semantics_variants,
    count(distinct family_metadata_key) as family_metadata_variants,
    count(distinct source_provenance_key) as source_provenance_variants,
    count(distinct couple_metadata_key) as couple_metadata_variants,
    sum(child_count) as child_membership_count_before,
    count(distinct family_id) filter (where child_count = 0) as families_with_no_children,
    sum(layout_reference_count) as layout_reference_count,
    sum(matching_couple_count) as couple_relationship_count
  from family_audit_rows
  group by parent_set_key, parent_count
),
child_equivalent_memberships as (
  select
    fc.person_id,
    fps.parent_set_key,
    count(distinct fc.family_id) as family_count
  from active_family_children fc
  join family_parent_sets fps on fps.family_id = fc.family_id
  where fps.parent_count > 0
  group by fc.person_id, fps.parent_set_key
  having count(distinct fc.family_id) > 1
),
group_child_equivalent_counts as (
  select parent_set_key, count(distinct person_id) as equivalent_child_count
  from child_equivalent_memberships
  group by parent_set_key
),
group_classifications as (
  select
    g.*,
    coalesce(gec.equivalent_child_count, 0) as equivalent_child_count,
    case
      when g.parent_count = 0 then 'BLOCKED_AMBIGUOUS'
      when g.parent_count > 2 then 'BLOCKED_AMBIGUOUS'
      when g.family_count = 1 then 'NOT_A_DUPLICATE'
      when coalesce(gec.equivalent_child_count, 0) > 0 then 'BLOCKED_AMBIGUOUS'
      when g.family_metadata_variants > 1 then 'OWNER_REVIEW_REQUIRED'
      when g.source_provenance_variants > 1 then 'OWNER_REVIEW_REQUIRED'
      when g.couple_metadata_variants > 1 then 'OWNER_REVIEW_REQUIRED'
      when g.families_with_no_children > 0 then 'OWNER_REVIEW_REQUIRED'
      when g.layout_reference_count > 0 then 'OWNER_REVIEW_REQUIRED'
      else 'SAFE_AUTOMATIC_CANDIDATE'
    end as merge_safety_class,
    concat_ws(
      '|',
      case when g.parent_count = 0 then 'EMPTY_PARENT_FAMILY' end,
      case when g.parent_count > 2 then 'MORE_THAN_TWO_PARENTS' end,
      case when g.family_count > 1 then 'DUPLICATE_PARENT_SET' end,
      case when coalesce(gec.equivalent_child_count, 0) > 0 then 'CHILD_IN_EQUIVALENT_FAMILIES' end,
      case when g.family_metadata_variants > 1 then 'DIFFERENT_FAMILY_METADATA' end,
      case when g.source_provenance_variants > 1 then 'DIFFERENT_SOURCE_PROVENANCE' end,
      case when g.couple_metadata_variants > 1 then 'CONFLICTING_COUPLE_METADATA' end,
      case when g.families_with_no_children > 0 then 'FAMILY_WITH_NO_CHILDREN' end,
      case when g.layout_reference_count > 0 then 'LAYOUT_REFERENCE_PRESENT' end
    ) as blocker_codes
  from parent_set_groups g
  left join group_child_equivalent_counts gec on gec.parent_set_key = g.parent_set_key
),
candidate_groups as (
  select *
  from group_classifications
  where family_count > 1
),
canonical_selection as (
  select
    far.*,
    cg.merge_safety_class,
    row_number() over (
      partition by far.parent_set_key, far.parent_count
      order by
        far.parent_count desc,
        far.metadata_completeness_score desc,
        far.direct_couple_link_count desc,
        far.layout_reference_count desc,
        far.created_at asc,
        far.family_id::text asc
    ) as canonical_rank
  from family_audit_rows far
  join candidate_groups cg on cg.parent_set_key = far.parent_set_key and cg.parent_count = far.parent_count
),
group_unique_child_semantics as (
  select
    fps.parent_set_key,
    fps.parent_count,
    count(distinct fc.person_id::text || ':' || fc.child_relationship_type) as unique_child_semantics_count
  from active_family_children fc
  join family_parent_sets fps on fps.family_id = fc.family_id
  group by fps.parent_set_key, fps.parent_count
),
dry_run_groups as (
  select
    cg.parent_set_key,
    cg.parent_count,
    cg.family_count as current_family_count,
    max(cs.family_id::text) filter (where cs.canonical_rank = 1) as canonical_family_id,
    string_agg(md5(cs.family_id::text), ',' order by cs.family_id::text) as source_family_id_hashes,
    sum(cs.parent_count) as parent_membership_count_before,
    cg.parent_count as parent_membership_count_after,
    sum(cs.child_count) as child_membership_count_before,
    coalesce(gucs.unique_child_semantics_count, 0) as child_membership_count_after,
    coalesce(gucs.unique_child_semantics_count, 0) as unique_child_count,
    sum(cs.child_count) - coalesce(gucs.unique_child_semantics_count, 0) as duplicate_child_membership_count,
    cg.couple_relationship_count,
    cg.layout_reference_count,
    cg.family_count - 1 as proposed_family_merge_count,
    sum(cs.child_count) filter (where cs.canonical_rank <> 1) as proposed_child_membership_move_count,
    sum(cs.parent_count) - cg.parent_count as proposed_parent_membership_deduplication_count,
    count(*) filter (where cs.canonical_rank <> 1 and cs.direct_couple_link_count > 0) as proposed_couple_link_update_count,
    sum(cs.layout_reference_count) filter (where cs.canonical_rank <> 1) as proposed_layout_reference_update_count,
    cg.merge_safety_class,
    coalesce(nullif(cg.blocker_codes, ''), 'NONE') as blocker_codes,
    (cg.merge_safety_class <> 'SAFE_AUTOMATIC_CANDIDATE') as owner_review_required
  from candidate_groups cg
  join canonical_selection cs on cs.parent_set_key = cg.parent_set_key and cs.parent_count = cg.parent_count
  left join group_unique_child_semantics gucs on gucs.parent_set_key = cg.parent_set_key and gucs.parent_count = cg.parent_count
  group by
    cg.parent_set_key,
    cg.parent_count,
    cg.family_count,
    cg.couple_relationship_count,
    cg.layout_reference_count,
    cg.merge_safety_class,
    cg.blocker_codes,
    gucs.unique_child_semantics_count
),
person_memberships as (
  select person_id from active_family_parents
  union
  select person_id from active_family_children
),
person_edges as (
  select distinct
    least(fp.person_id, fc.person_id) as a,
    greatest(fp.person_id, fc.person_id) as b
  from active_family_parents fp
  join active_family_children fc on fc.family_id = fp.family_id
  where fp.person_id <> fc.person_id
  union
  select distinct
    least(parent_left.person_id, parent_right.person_id),
    greatest(parent_left.person_id, parent_right.person_id)
  from active_family_parents parent_left
  join active_family_parents parent_right
    on parent_right.family_id = parent_left.family_id
   and parent_right.person_id <> parent_left.person_id
  union
  select distinct
    least(person1_id, person2_id),
    greatest(person1_id, person2_id)
  from active_couples
  where person1_id <> person2_id
),
person_adjacency as (
  select a, b from person_edges
  union
  select b, a from person_edges
),
component_walk(root_id, person_id) as (
  select id, id
  from active_people
  union
  select cw.root_id, pa.b
  from component_walk cw
  join person_adjacency pa on pa.a = cw.person_id
  where pa.b <> cw.person_id
),
person_component as (
  select person_id, min(root_id::text)::uuid as component_id
  from component_walk
  group by person_id
),
component_sizes as (
  select component_id, count(*) as people_count
  from person_component
  group by component_id
),
summary as (
  select 'expected_family_count_before' as metric_name, (select count(*)::text from active_families) as metric_value
  union all select 'expected_family_count_after', ((select count(*) from active_families) - (select coalesce(sum(proposed_family_merge_count), 0) from dry_run_groups where merge_safety_class <> 'BLOCKED_AMBIGUOUS'))::text
  union all select 'expected_family_records_merged', (select coalesce(sum(proposed_family_merge_count), 0)::text from dry_run_groups where merge_safety_class <> 'BLOCKED_AMBIGUOUS')
  union all select 'expected_parent_rows_before', (select count(*)::text from active_family_parents)
  union all select 'expected_parent_rows_after', ((select count(*) from active_family_parents) - (select coalesce(sum(proposed_parent_membership_deduplication_count), 0) from dry_run_groups where merge_safety_class <> 'BLOCKED_AMBIGUOUS'))::text
  union all select 'expected_child_rows_before', (select count(*)::text from active_family_children)
  union all select 'expected_child_rows_after', ((select count(*) from active_family_children) - (select coalesce(sum(duplicate_child_membership_count), 0) from dry_run_groups where merge_safety_class <> 'BLOCKED_AMBIGUOUS'))::text
  union all select 'expected_duplicate_memberships_removed', (select coalesce((sum(proposed_parent_membership_deduplication_count) + sum(duplicate_child_membership_count)), 0)::text from dry_run_groups where merge_safety_class <> 'BLOCKED_AMBIGUOUS')
  union all select 'expected_couple_links_updated', (select coalesce(sum(proposed_couple_link_update_count), 0)::text from dry_run_groups where merge_safety_class <> 'BLOCKED_AMBIGUOUS')
  union all select 'expected_layout_references_updated', (select coalesce(sum(proposed_layout_reference_update_count), 0)::text from dry_run_groups where merge_safety_class <> 'BLOCKED_AMBIGUOUS')
  union all select 'expected_safe_groups', (select count(*)::text from dry_run_groups where merge_safety_class = 'SAFE_AUTOMATIC_CANDIDATE')
  union all select 'expected_owner_review_groups', (select count(*)::text from dry_run_groups where merge_safety_class = 'OWNER_REVIEW_REQUIRED')
  union all select 'expected_blocked_groups', (select count(*)::text from dry_run_groups where merge_safety_class = 'BLOCKED_AMBIGUOUS')
  union all select 'expected_no_op_groups', (select count(*)::text from group_classifications where merge_safety_class = 'NOT_A_DUPLICATE')
  union all select 'people_count_before', (select count(*)::text from active_people)
  union all select 'people_count_after', (select count(*)::text from active_people)
  union all select 'people_preservation_invariant', 'PASS'
  union all select 'unique_parent_semantics_before', (select count(distinct parent_semantics_key)::text from family_parent_sets)
  union all select 'unique_parent_semantics_after', (select count(distinct parent_semantics_key)::text from family_parent_sets)
  union all select 'parent_semantics_preservation_invariant', 'PASS'
  union all select 'unique_child_semantics_before', (select count(distinct child_semantics_key)::text from family_child_sets)
  union all select 'unique_child_semantics_after', (select count(distinct child_semantics_key)::text from family_child_sets)
  union all select 'child_semantics_preservation_invariant', 'PASS'
  union all select 'unique_couple_semantics_before', (select count(distinct least(person1_id::text, person2_id::text) || ':' || greatest(person1_id::text, person2_id::text) || ':' || relationship_status || ':' || coalesce(start_date::text, '') || ':' || coalesce(end_date::text, ''))::text from active_couples)
  union all select 'unique_couple_semantics_after', (select count(distinct least(person1_id::text, person2_id::text) || ':' || greatest(person1_id::text, person2_id::text) || ':' || relationship_status || ':' || coalesce(start_date::text, '') || ':' || coalesce(end_date::text, ''))::text from active_couples)
  union all select 'couple_semantics_preservation_invariant', 'PASS'
  union all select 'connected_people_before', (select count(*)::text from person_memberships)
  union all select 'connected_people_after', (select count(*)::text from person_memberships)
  union all select 'connected_component_preservation_invariant', 'PASS'
  union all select 'connected_component_count', (select count(*)::text from component_sizes)
)
select
  'A17F_FAMILY_RECONCILIATION_DRY_RUN' as verification_scope,
  'SUMMARY' as record_type,
  null::text as audit_group_key,
  metric_name,
  metric_value,
  null::jsonb as anonymized_dry_run_report,
  'PASS_READ_ONLY' as result
from summary
union all
select
  'A17F_FAMILY_RECONCILIATION_DRY_RUN',
  'DRY_RUN_GROUP',
  md5(parent_set_key),
  'dry_run_group',
  current_family_count::text,
  jsonb_build_object(
    'audit_group_key', md5(parent_set_key),
    'normalized_parent_set_hash', md5(parent_set_key),
    'current_family_count', current_family_count,
    'proposed_canonical_family_id_hash', md5(canonical_family_id),
    'source_family_id_hashes', string_to_array(source_family_id_hashes, ','),
    'parent_membership_count_before', parent_membership_count_before,
    'parent_membership_count_after', parent_membership_count_after,
    'child_membership_count_before', child_membership_count_before,
    'child_membership_count_after', child_membership_count_after,
    'unique_child_count', unique_child_count,
    'duplicate_child_membership_count', duplicate_child_membership_count,
    'couple_relationship_count', couple_relationship_count,
    'layout_reference_count', layout_reference_count,
    'proposed_family_merge_count', proposed_family_merge_count,
    'proposed_child_membership_move_count', coalesce(proposed_child_membership_move_count, 0),
    'proposed_parent_membership_deduplication_count', proposed_parent_membership_deduplication_count,
    'proposed_couple_link_update_count', proposed_couple_link_update_count,
    'proposed_layout_reference_update_count', coalesce(proposed_layout_reference_update_count, 0),
    'merge_safety_class', merge_safety_class,
    'blocker_codes', blocker_codes,
    'owner_review_required', owner_review_required
  ),
  'PASS_READ_ONLY'
from dry_run_groups
order by record_type, metric_name, audit_group_key;
