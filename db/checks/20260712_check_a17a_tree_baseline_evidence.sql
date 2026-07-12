-- A17A_TREE_BASELINE_EVIDENCE
-- SELECT_ONLY_STRUCTURAL_BASELINE
-- NO_PII_OUTPUT

with recursive active_people as (
  select id, generation_number
  from public.people
  where deleted_at is null
),
active_families as (
  select id
  from public.families
  where deleted_at is null
),
active_family_parents as (
  select fp.id, fp.family_id, fp.person_id, fp.parent_role, fp.relationship_type
  from public.family_parents fp
  join active_families f on f.id = fp.family_id
  join active_people p on p.id = fp.person_id
  where fp.deleted_at is null
),
active_family_children as (
  select fc.id, fc.family_id, fc.person_id, fc.child_relationship_type
  from public.family_children fc
  join active_families f on f.id = fc.family_id
  join active_people p on p.id = fc.person_id
  where fc.deleted_at is null
),
active_couples as (
  select id, person1_id, person2_id, family_id
  from public.couple_relationships
  where deleted_at is null
),
family_parent_sets as (
  select
    f.id as family_id,
    count(fp.person_id) as parent_count,
    coalesce(
      string_agg(fp.person_id::text, ',' order by fp.person_id::text),
      'NO_ACTIVE_PARENTS'
    ) as parent_set_key
  from active_families f
  left join active_family_parents fp on fp.family_id = f.id
  group by f.id
),
family_child_counts as (
  select
    f.id as family_id,
    count(fc.person_id) as child_count
  from active_families f
  left join active_family_children fc on fc.family_id = f.id
  group by f.id
),
duplicate_parent_sets as (
  select parent_set_key, parent_count, count(*) as family_count
  from family_parent_sets
  where parent_count > 0
  group by parent_set_key, parent_count
  having count(*) > 1
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
couple_without_family as (
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
parent_pair_without_couple as (
  select pair.family_id
  from family_parent_pairs pair
  where not exists (
    select 1
    from active_couples c
    where least(c.person1_id::text, c.person2_id::text) = pair.person_low
      and greatest(c.person1_id::text, c.person2_id::text) = pair.person_high
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
layout_counts as (
  select
    (select count(*) from public.tree_layouts where deleted_at is null) as saved_tree_layout_count,
    (select count(*) from public.tree_layout_nodes where deleted_at is null) as saved_tree_layout_node_count,
    (select count(*) from public.tree_layout_nodes where deleted_at is null and is_locked = true) as locked_layout_node_count
),
metrics as (
  select 'people_count' as metric_name, (select count(*)::text from active_people) as metric_value
  union all select 'families_count', (select count(*)::text from active_families)
  union all select 'family_parents_count', (select count(*)::text from active_family_parents)
  union all select 'family_children_count', (select count(*)::text from active_family_children)
  union all select 'couple_relationships_count', (select count(*)::text from active_couples)
  union all select 'distinct_parent_set_count', (select count(distinct parent_set_key)::text from family_parent_sets where parent_count > 0)
  union all select 'duplicate_parent_set_group_count', (select count(*)::text from duplicate_parent_sets)
  union all select 'redundant_family_count_estimate', (select coalesce(sum(family_count - 1), 0)::text from duplicate_parent_sets)
  union all select 'families_with_zero_parents', (select count(*)::text from family_parent_sets where parent_count = 0)
  union all select 'families_with_one_parent', (select count(*)::text from family_parent_sets where parent_count = 1)
  union all select 'families_with_two_parents', (select count(*)::text from family_parent_sets where parent_count = 2)
  union all select 'families_with_more_than_two_parents', (select count(*)::text from family_parent_sets where parent_count > 2)
  union all select 'families_with_zero_children', (select count(*)::text from family_child_counts where child_count = 0)
  union all select 'families_with_one_child', (select count(*)::text from family_child_counts where child_count = 1)
  union all select 'families_with_multiple_children', (select count(*)::text from family_child_counts where child_count > 1)
  union all select 'child_membership_count', (select count(*)::text from active_family_children)
  union all select 'children_in_multiple_equivalent_families_count', (select count(distinct person_id)::text from child_equivalent_memberships)
  union all select 'people_without_any_family_membership_count', (select count(*)::text from active_people p where not exists (select 1 from person_memberships pm where pm.person_id = p.id))
  union all select 'connected_component_count', (select count(*)::text from component_sizes)
  union all select 'largest_connected_component_people_count', (select coalesce(max(people_count), 0)::text from component_sizes)
  union all select 'unconnected_people_count', (select count(*)::text from component_sizes where people_count = 1)
  union all select 'explicit_generation_number_distribution', (select coalesce(jsonb_object_agg(generation_number::text, count_text)::text, '{}'::text) from (select generation_number, count(*)::text as count_text from active_people where generation_number is not null group by generation_number order by generation_number) generation_counts)
  union all select 'people_without_generation_number_count', (select count(*)::text from active_people where generation_number is null)
  union all select 'saved_tree_layout_count', (select saved_tree_layout_count::text from layout_counts)
  union all select 'saved_tree_layout_node_count', (select saved_tree_layout_node_count::text from layout_counts)
  union all select 'locked_layout_node_count', (select locked_layout_node_count::text from layout_counts)
  union all select 'couple_relationship_without_matching_family_count', (select count(*)::text from couple_without_family)
  union all select 'family_parent_pair_without_matching_couple_relationship_count', (select count(*)::text from parent_pair_without_couple)
)
select
  'A17A_TREE_BASELINE_EVIDENCE' as verification_scope,
  metric_name,
  metric_value,
  'PASS_READ_ONLY' as result
from metrics
order by metric_name;
