-- A17E_FAMILY_DUPLICATE_READ_ONLY_AUDIT
-- SELECT_ONLY_STRUCTURAL_AUDIT
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
  select
    fp.id,
    fp.family_id,
    fp.person_id,
    fp.parent_role,
    fp.relationship_type,
    fp.sort_order,
    fp.created_by,
    fp.updated_by
  from public.family_parents fp
  join active_families f on f.id = fp.family_id
  join active_people p on p.id = fp.person_id
  where fp.deleted_at is null
),
active_family_children as (
  select
    fc.id,
    fc.family_id,
    fc.person_id,
    fc.child_relationship_type,
    fc.sort_order,
    fc.created_by,
    fc.updated_by
  from public.family_children fc
  join active_families f on f.id = fc.family_id
  join active_people p on p.id = fc.person_id
  where fc.deleted_at is null
),
active_couples as (
  select
    id,
    person1_id,
    person2_id,
    family_id,
    relationship_status,
    start_date,
    start_date_precision,
    end_date,
    end_date_precision,
    visibility,
    created_by,
    updated_by
  from public.couple_relationships
  where deleted_at is null
),
inactive_membership_counts as (
  select
    (select count(*) from public.family_parents where deleted_at is not null) +
    (select count(*) from public.family_children where deleted_at is not null) as inactive_membership_count
),
invalid_person_references as (
  select fp.id::text as ref_id
  from public.family_parents fp
  left join public.people p on p.id = fp.person_id and p.deleted_at is null
  left join public.families f on f.id = fp.family_id and f.deleted_at is null
  where fp.deleted_at is null and (p.id is null or f.id is null)
  union all
  select fc.id::text
  from public.family_children fc
  left join public.people p on p.id = fc.person_id and p.deleted_at is null
  left join public.families f on f.id = fc.family_id and f.deleted_at is null
  where fc.deleted_at is null and (p.id is null or f.id is null)
  union all
  select c.id::text
  from public.couple_relationships c
  left join public.people p1 on p1.id = c.person1_id and p1.deleted_at is null
  left join public.people p2 on p2.id = c.person2_id and p2.deleted_at is null
  where c.deleted_at is null and (p1.id is null or p2.id is null)
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
    ) as parent_semantics_key,
    coalesce(string_agg(fp.parent_role, ',' order by fp.person_id::text, fp.parent_role), 'NO_ACTIVE_PARENT_ROLES') as parent_roles_key
  from active_families f
  left join active_family_parents fp on fp.family_id = f.id
  group by f.id
),
family_child_sets as (
  select
    f.id as family_id,
    count(fc.person_id) as child_count,
    count(distinct fc.person_id) as unique_child_count,
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
family_metadata as (
  select
    f.id as family_id,
    (case when f.family_code is null or btrim(f.family_code) = '' then 'NO_CODE' else 'HAS_CODE:' || md5(f.family_code) end)
      || '|label=' || (case when f.family_label is null or btrim(f.family_label) = '' then 'NO_LABEL' else 'HAS_LABEL:' || md5(f.family_label) end)
      || '|notes=' || (case when f.notes is null or btrim(f.notes) = '' then 'NO_NOTES' else 'HAS_NOTES:' || md5(f.notes) end)
      || '|visibility=' || f.visibility as family_metadata_key,
    coalesce(f.created_by::text, 'NO_CREATED_BY') || '|' || coalesce(f.updated_by::text, 'NO_UPDATED_BY') as source_provenance_key
  from active_families f
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
family_audit_rows as (
  select
    f.id as family_id,
    fps.parent_count,
    fps.parent_set_key,
    fps.parent_semantics_key,
    fps.parent_roles_key,
    fcs.child_count,
    fcs.unique_child_count,
    fcs.child_semantics_key,
    fm.family_metadata_key,
    fm.source_provenance_key,
    fcm.matching_couple_count,
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
    sum(child_count) as child_membership_count,
    count(distinct case when child_count = 0 then family_id end) as families_with_no_children,
    count(distinct case when layout_reference_count > 0 then family_id end) as families_with_layout_refs,
    sum(layout_reference_count) as layout_reference_count,
    sum(matching_couple_count) as matching_couple_count,
    string_agg(md5(family_id::text), ',' order by family_id::text) as family_id_hashes
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
child_multiple_families as (
  select person_id, count(distinct family_id) as family_count
  from active_family_children
  group by person_id
  having count(distinct family_id) > 1
),
group_child_equivalent_counts as (
  select
    parent_set_key,
    count(distinct person_id) as equivalent_child_count
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
      when g.families_with_layout_refs > 0 then 'OWNER_REVIEW_REQUIRED'
      else 'SAFE_AUTOMATIC_CANDIDATE'
    end as merge_safety_class,
    concat_ws(
      '|',
      case when g.parent_count = 0 then 'EMPTY_PARENT_FAMILY' end,
      case when g.parent_count = 1 then 'ONE_PARENT_SET' end,
      case when g.parent_count = 2 then 'TWO_PARENT_SET' end,
      case when g.parent_count > 2 then 'MORE_THAN_TWO_PARENTS' end,
      case when g.family_count > 1 then 'DUPLICATE_PARENT_SET' end,
      case when coalesce(gec.equivalent_child_count, 0) > 0 then 'CHILD_IN_EQUIVALENT_FAMILIES' end,
      case when g.family_metadata_variants > 1 then 'DIFFERENT_FAMILY_METADATA' end,
      case when g.source_provenance_variants > 1 then 'DIFFERENT_SOURCE_PROVENANCE' end,
      case when g.couple_metadata_variants > 1 then 'CONFLICTING_COUPLE_METADATA' end,
      case when g.families_with_no_children > 0 then 'FAMILY_WITH_NO_CHILDREN' end,
      case when g.families_with_layout_refs > 0 then 'LAYOUT_REFERENCE_PRESENT' end
    ) as blocker_codes
  from parent_set_groups g
  left join group_child_equivalent_counts gec on gec.parent_set_key = g.parent_set_key
),
duplicate_groups as (
  select *
  from group_classifications
  where family_count > 1
),
family_parent_pair_without_matching_couple as (
  select pair.family_id
  from family_parent_pairs pair
  where not exists (
    select 1
    from active_couples c
    where least(c.person1_id::text, c.person2_id::text) = pair.person_low
      and greatest(c.person1_id::text, c.person2_id::text) = pair.person_high
  )
),
couple_without_matching_family as (
  select c.id
  from active_couples c
  where not exists (
    select 1
    from family_parent_pairs pair
    where (
      pair.person_low = least(c.person1_id::text, c.person2_id::text)
      and pair.person_high = greatest(c.person1_id::text, c.person2_id::text)
    )
    or pair.family_id = c.family_id
  )
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
duplicate_family_ids as (
  select far.family_id
  from family_audit_rows far
  join duplicate_groups dg on dg.parent_set_key = far.parent_set_key and dg.parent_count = far.parent_count
),
metrics as (
  select 'people_count' as metric_name, (select count(*)::text from active_people) as metric_value
  union all select 'current_family_count', (select count(*)::text from active_families)
  union all select 'family_parent_membership_count', (select count(*)::text from active_family_parents)
  union all select 'family_child_membership_count', (select count(*)::text from active_family_children)
  union all select 'couple_relationship_count', (select count(*)::text from active_couples)
  union all select 'normalized_parent_set_count', (select count(*)::text from parent_set_groups where parent_count > 0)
  union all select 'duplicate_parent_set_group_count', (select count(*)::text from duplicate_groups where parent_count > 0)
  union all select 'redundant_family_count', (select coalesce(sum(family_count - 1), 0)::text from duplicate_groups where parent_count > 0)
  union all select 'safe_automatic_group_count', (select count(*)::text from duplicate_groups where merge_safety_class = 'SAFE_AUTOMATIC_CANDIDATE')
  union all select 'owner_review_group_count', (select count(*)::text from duplicate_groups where merge_safety_class = 'OWNER_REVIEW_REQUIRED')
  union all select 'blocked_ambiguous_group_count', (select count(*)::text from duplicate_groups where merge_safety_class = 'BLOCKED_AMBIGUOUS')
  union all select 'non_duplicate_group_count', (select count(*)::text from group_classifications where merge_safety_class = 'NOT_A_DUPLICATE')
  union all select 'families_with_zero_parents', (select count(*)::text from family_audit_rows where parent_count = 0)
  union all select 'families_with_one_parent', (select count(*)::text from family_audit_rows where parent_count = 1)
  union all select 'families_with_two_parents', (select count(*)::text from family_audit_rows where parent_count = 2)
  union all select 'families_with_more_than_two_parents', (select count(*)::text from family_audit_rows where parent_count > 2)
  union all select 'families_with_zero_children', (select count(*)::text from family_audit_rows where child_count = 0)
  union all select 'families_with_one_child', (select count(*)::text from family_audit_rows where child_count = 1)
  union all select 'families_with_multiple_children', (select count(*)::text from family_audit_rows where child_count > 1)
  union all select 'children_in_multiple_families_count', (select count(*)::text from child_multiple_families)
  union all select 'children_in_equivalent_families_count', (select count(*)::text from child_equivalent_memberships)
  union all select 'couple_relationship_without_matching_family_count', (select count(*)::text from couple_without_matching_family)
  union all select 'family_parent_pair_without_matching_couple_count', (select count(*)::text from family_parent_pair_without_matching_couple)
  union all select 'invalid_person_reference_count', (select count(*)::text from invalid_person_references)
  union all select 'connected_component_count', (select count(*)::text from component_sizes)
  union all select 'largest_component_people_count', (select coalesce(max(people_count), 0)::text from component_sizes)
  union all select 'people_outside_largest_component_count', (select (count(*) - coalesce((select max(people_count) from component_sizes), 0))::text from active_people)
  union all select 'fully_unconnected_people_count', (select count(*)::text from component_sizes where people_count = 1)
  union all select 'layout_records_referencing_duplicate_families_count', (
    select count(*)::text
    from public.tree_layout_nodes tln
    join duplicate_family_ids dfi on dfi.family_id = tln.family_id
    where tln.deleted_at is null and tln.node_kind = 'family'
  )
  union all select 'inactive_or_soft_deleted_membership_count', (select inactive_membership_count::text from inactive_membership_counts)
)
select
  'A17E_FAMILY_DUPLICATE_READ_ONLY_AUDIT' as verification_scope,
  'METRIC' as record_type,
  null::text as audit_group_key,
  metric_name,
  metric_value,
  null::text as merge_safety_class,
  null::jsonb as anonymized_group_report,
  'PASS_READ_ONLY' as result
from metrics
union all
select
  'A17E_FAMILY_DUPLICATE_READ_ONLY_AUDIT',
  'DUPLICATE_GROUP',
  md5(parent_set_key),
  'duplicate_group',
  family_count::text,
  merge_safety_class,
  jsonb_build_object(
    'normalized_parent_set_hash', md5(parent_set_key),
    'parent_count', parent_count,
    'current_family_count', family_count,
    'family_id_hashes', string_to_array(family_id_hashes, ','),
    'parent_semantics_variants', parent_semantics_variants,
    'family_metadata_variants', family_metadata_variants,
    'source_provenance_variants', source_provenance_variants,
    'couple_metadata_variants', couple_metadata_variants,
    'child_membership_count', child_membership_count,
    'equivalent_child_count', equivalent_child_count,
    'layout_reference_count', layout_reference_count,
    'matching_couple_count', matching_couple_count,
    'blocker_codes', coalesce(nullif(blocker_codes, ''), 'NONE')
  ),
  'PASS_READ_ONLY'
from duplicate_groups
order by record_type, metric_name, audit_group_key;
