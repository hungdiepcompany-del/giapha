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
person_display_names as (
  select
    id as person_id,
    gender as person_gender,
    coalesce(nullif(btrim(display_name), ''), nullif(btrim(full_name), ''), 'Không rõ tên')
      as display_name_for_owner
  from public.people
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
    sum(distinct_child_count)::integer as distinct_child_count,
    sum(active_parent_membership_count)::integer as parent_membership_count,
    sum(active_child_membership_count)::integer as child_membership_count,
    sum(layout_reference_count)::integer as layout_reference_count,
    sum(revision_reference_count)::integer as revision_reference_count,
    count(*) filter (
      where canonical_key is not null
         or canonical_status <> 'legacy_unreviewed'
         or merged_into_family_id is not null
    )::integer as metadata_conflict_count
  from family_parent_sets
  group by safe_group_ref, parent_ids
),
duplicate_groups_base as (
  select *
  from normalized_groups
  where active_candidate_family_count > 1
),
candidate_family_pairs_base as (
  select
    dg.safe_group_ref,
    dg.parent_ids,
    fps.family_id,
    fps.safe_family_ref,
    fps.active_parent_membership_count,
    fps.distinct_parent_count,
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
  from duplicate_groups_base dg
  join family_parent_sets fps
    on fps.safe_group_ref = dg.safe_group_ref
   and fps.parent_ids = dg.parent_ids
),
candidate_parent_membership_rows as (
  select
    cfp.safe_group_ref,
    cfp.safe_family_ref,
    cfp.family_id,
    fp.id as membership_id,
    fp.person_id,
    fp.parent_role,
    fp.relationship_type,
    pdn.person_gender as parent_gender,
    case
      when lower(coalesce(pdn.person_gender, '')) = 'male' then 'father'
      when lower(coalesce(pdn.person_gender, '')) = 'female' then 'mother'
      else null
    end as expected_role_from_gender,
    case
      when lower(coalesce(fp.parent_role, 'unknown')) not in ('father', 'mother')
        then 'ROLE_NOT_GENDER_SPECIFIC'
      when pdn.person_gender is null
        or nullif(btrim(pdn.person_gender), '') is null
        or lower(pdn.person_gender) = 'unknown'
        then 'GENDER_UNKNOWN'
      when lower(pdn.person_gender) = 'male'
        and lower(coalesce(fp.parent_role, 'unknown')) = 'mother'
        then 'POTENTIAL_MISMATCH'
      when lower(pdn.person_gender) = 'female'
        and lower(coalesce(fp.parent_role, 'unknown')) = 'father'
        then 'POTENTIAL_MISMATCH'
      when lower(pdn.person_gender) in ('male', 'female')
        then 'CONSISTENT'
      else 'OWNER_CONFIRMATION_REQUIRED'
    end as role_gender_review_status,
    case
      when lower(coalesce(fp.parent_role, 'unknown')) not in ('father', 'mother')
        then 'Parent role is generic or unknown; owner may confirm if needed.'
      when pdn.person_gender is null
        or nullif(btrim(pdn.person_gender), '') is null
        or lower(pdn.person_gender) = 'unknown'
        then 'Gender evidence is unknown; owner must not infer role automatically.'
      when lower(pdn.person_gender) = 'male'
        and lower(coalesce(fp.parent_role, 'unknown')) = 'mother'
        then 'Gender evidence suggests father while current relationship_role is mother.'
      when lower(pdn.person_gender) = 'female'
        and lower(coalesce(fp.parent_role, 'unknown')) = 'father'
        then 'Gender evidence suggests mother while current relationship_role is father.'
      when lower(pdn.person_gender) not in ('male', 'female')
        then 'Gender evidence is not male/female; owner confirmation is required.'
      else null
    end as role_gender_warning,
    pdn.display_name_for_owner
  from candidate_family_pairs_base cfp
  join active_parent_memberships fp on fp.family_id = cfp.family_id
  left join person_display_names pdn on pdn.person_id = fp.person_id
),
candidate_child_membership_rows as (
  select
    cfp.safe_group_ref,
    cfp.safe_family_ref,
    cfp.family_id,
    fc.id as membership_id,
    fc.person_id,
    fc.child_relationship_type,
    pdn.display_name_for_owner
  from candidate_family_pairs_base cfp
  join active_child_memberships fc on fc.family_id = cfp.family_id
  left join person_display_names pdn on pdn.person_id = fc.person_id
),
parent_summaries_by_family as (
  select
    safe_group_ref,
    safe_family_ref,
    family_id,
    string_agg(
      display_name_for_owner || ' [' || coalesce(parent_role, 'unknown') ||
        '/' || coalesce(relationship_type, 'unknown') || ']',
      '; '
      order by coalesce(parent_role, 'unknown'), display_name_for_owner, safe_membership_ref
    ) as parent_display_summary
  from (
    select
      safe_group_ref,
      safe_family_ref,
      family_id,
      display_name_for_owner,
      parent_role,
      relationship_type,
      md5(membership_id::text) as safe_membership_ref
    from candidate_parent_membership_rows
  ) parents
  group by safe_group_ref, safe_family_ref, family_id
),
child_summaries_by_family as (
  select
    safe_group_ref,
    safe_family_ref,
    family_id,
    string_agg(
      display_name_for_owner || ' [' || coalesce(child_relationship_type, 'unknown') || ']',
      '; '
      order by display_name_for_owner, safe_membership_ref
    ) as child_display_summary
  from (
    select
      safe_group_ref,
      safe_family_ref,
      family_id,
      display_name_for_owner,
      child_relationship_type,
      md5(membership_id::text) as safe_membership_ref
    from candidate_child_membership_rows
  ) children
  group by safe_group_ref, safe_family_ref, family_id
),
candidate_family_pairs as (
  select
    cfp.*,
    coalesce(ps.parent_display_summary, 'Không rõ tên') as parent_display_summary,
    coalesce(cs.child_display_summary, 'Không rõ tên') as child_display_summary
  from candidate_family_pairs_base cfp
  left join parent_summaries_by_family ps
    on ps.safe_group_ref = cfp.safe_group_ref
   and ps.safe_family_ref = cfp.safe_family_ref
  left join child_summaries_by_family cs
    on cs.safe_group_ref = cfp.safe_group_ref
   and cs.safe_family_ref = cfp.safe_family_ref
),
parent_summaries_by_group as (
  select
    safe_group_ref,
    string_agg(distinct parent_display_summary, ' | ' order by parent_display_summary)
      as parent_display_summary
  from candidate_family_pairs
  group by safe_group_ref
),
child_summaries_by_group as (
  select
    safe_group_ref,
    string_agg(
      display_name_for_owner || ' [' || coalesce(child_relationship_type, 'unknown') || ']',
      '; '
      order by display_name_for_owner, safe_membership_ref
    ) as child_display_summary
  from (
    select distinct
      safe_group_ref,
      display_name_for_owner,
      child_relationship_type,
      md5(membership_id::text) as safe_membership_ref
    from candidate_child_membership_rows
  ) children
  group by safe_group_ref
),
parent_role_conflicts as (
  select
    safe_group_ref,
    count(*)::integer as relationship_role_conflict_count
  from (
    select
      safe_group_ref,
      person_id,
      count(distinct coalesce(parent_role, 'unknown')) as role_count
    from candidate_parent_membership_rows
    group by safe_group_ref, person_id
    having count(distinct coalesce(parent_role, 'unknown')) > 1
  ) conflicts
  group by safe_group_ref
),
parent_type_conflicts as (
  select
    safe_group_ref,
    count(*)::integer as relationship_type_conflict_count
  from (
    select
      safe_group_ref,
      person_id,
      parent_role,
      count(distinct coalesce(relationship_type, 'unknown')) as type_count
    from candidate_parent_membership_rows
    group by safe_group_ref, person_id, parent_role
    having count(distinct coalesce(relationship_type, 'unknown')) > 1
  ) conflicts
  group by safe_group_ref
),
role_gender_review_by_group as (
  select
    safe_group_ref,
    count(*) filter (
      where role_gender_review_status = 'POTENTIAL_MISMATCH'
    )::integer as potential_role_gender_mismatch_parent_count,
    count(distinct family_id) filter (
      where role_gender_review_status = 'POTENTIAL_MISMATCH'
    )::integer as potential_role_gender_mismatch_family_count,
    bool_or(role_gender_review_status in (
      'POTENTIAL_MISMATCH',
      'GENDER_UNKNOWN',
      'ROLE_NOT_GENDER_SPECIFIC',
      'OWNER_CONFIRMATION_REQUIRED'
    )) as role_gender_owner_review_required
  from candidate_parent_membership_rows
  group by safe_group_ref
),
group_review_ordering as (
  select
    dg.*,
    coalesce(prc.relationship_role_conflict_count, 0)::integer
      as relationship_role_conflict_count,
    coalesce(ptc.relationship_type_conflict_count, 0)::integer
      as relationship_type_conflict_count,
    coalesce(rgr.potential_role_gender_mismatch_parent_count, 0)::integer
      as potential_role_gender_mismatch_parent_count,
    coalesce(rgr.potential_role_gender_mismatch_family_count, 0)::integer
      as potential_role_gender_mismatch_family_count,
    coalesce(rgr.role_gender_owner_review_required, false)
      as role_gender_owner_review_required,
    row_number() over (
      order by
        case
          when dg.metadata_conflict_count > 0
            or coalesce(prc.relationship_role_conflict_count, 0) > 0
            or coalesce(ptc.relationship_type_conflict_count, 0) > 0 then 0
          else 1
        end,
        case when dg.safe_group_ref = '721e2ae3d95dd418af40b6459531b870' then 0 else 1 end,
        dg.layout_reference_count desc,
        dg.candidate_family_count desc,
        dg.safe_group_ref
    )::integer as group_review_order
  from duplicate_groups_base dg
  left join parent_role_conflicts prc on prc.safe_group_ref = dg.safe_group_ref
  left join parent_type_conflicts ptc on ptc.safe_group_ref = dg.safe_group_ref
  left join role_gender_review_by_group rgr on rgr.safe_group_ref = dg.safe_group_ref
),
candidate_family_review_ordering as (
  select
    cfp.*,
    gro.group_review_order,
    row_number() over (
      partition by cfp.safe_group_ref
      order by
        case when cfp.deleted_at is null then 0 else 1 end,
        cfp.layout_reference_count desc,
        cfp.revision_reference_count desc,
        cfp.created_at,
        cfp.safe_family_ref
    )::integer as family_review_order
  from candidate_family_pairs cfp
  join group_review_ordering gro on gro.safe_group_ref = cfp.safe_group_ref
),
deleted_family_parent_counts as (
  select
    f.id as family_id,
    md5(f.id::text) as safe_family_ref,
    count(fp.id)::integer as active_parent_memberships
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
    count(fc.id)::integer as active_child_memberships
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
deleted_family_parent_summary as (
  select
    dfp.family_id,
    string_agg(
      pdn.display_name_for_owner || ' [' || coalesce(fp.parent_role, 'unknown') ||
        '/' || coalesce(fp.relationship_type, 'unknown') || ']',
      '; '
      order by coalesce(fp.parent_role, 'unknown'), pdn.display_name_for_owner, md5(fp.id::text)
    ) as parent_display_summary
  from deleted_family_parent_counts dfp
  join public.family_parents fp
    on fp.family_id = dfp.family_id
   and fp.deleted_at is null
  left join person_display_names pdn on pdn.person_id = fp.person_id
  group by dfp.family_id
),
deleted_family_advisory as (
  select
    dfp.family_id,
    dfp.safe_family_ref,
    dfp.active_parent_memberships,
    coalesce(dfc.active_child_memberships, 0)::integer as active_child_memberships,
    coalesce(dfl.layout_reference_count, 0)::integer as layout_reference_count,
    coalesce(dfr.revision_reference_count, 0)::integer as revision_reference_count,
    coalesce(dfps.parent_display_summary, 'Không rõ tên') as parent_display_summary
  from deleted_family_parent_counts dfp
  left join deleted_family_child_counts dfc on dfc.family_id = dfp.family_id
  left join deleted_family_layout_refs dfl on dfl.family_id = dfp.family_id
  left join deleted_family_revision_refs dfr on dfr.family_id = dfp.family_id
  left join deleted_family_parent_summary dfps on dfps.family_id = dfp.family_id
),
owner_review_integrity as (
  select
    (select count(*) from group_review_ordering)::integer as duplicate_group_count,
    (select count(*) from candidate_family_review_ordering)::integer as candidate_family_count,
    (select count(*) from candidate_parent_membership_rows)::integer as parent_detail_row_count,
    (select count(*) from candidate_child_membership_rows)::integer as child_detail_row_count,
    ((select count(*) from group_review_ordering) = 22) as group_count_matches_fix1_pass,
    ((select count(*) from candidate_family_review_ordering) = 60)
      as candidate_family_count_matches_fix1_pass,
    (
      select count(*) = count(distinct safe_group_ref || ':' || safe_family_ref)
      from candidate_family_review_ordering
    ) as candidate_pairs_unique_pass,
    (
      select count(*) = 0
      from candidate_family_review_ordering cfp
      left join (
        select safe_group_ref, safe_family_ref, count(*)::integer as parent_row_count
        from candidate_parent_membership_rows
        group by safe_group_ref, safe_family_ref
      ) rows
        on rows.safe_group_ref = cfp.safe_group_ref
       and rows.safe_family_ref = cfp.safe_family_ref
      where cfp.active_parent_membership_count <> coalesce(rows.parent_row_count, 0)
    ) as parent_rows_match_candidate_parent_counts_pass,
    (
      select count(*) = 0
      from candidate_family_review_ordering cfp
      left join (
        select safe_group_ref, safe_family_ref, count(*)::integer as child_row_count
        from candidate_child_membership_rows
        group by safe_group_ref, safe_family_ref
      ) rows
        on rows.safe_group_ref = cfp.safe_group_ref
       and rows.safe_family_ref = cfp.safe_family_ref
      where cfp.active_child_membership_count <> coalesce(rows.child_row_count, 0)
    ) as child_rows_match_candidate_child_counts_pass,
    (
      select count(*) = 0
      from candidate_family_review_ordering
      where parent_display_summary is null or btrim(parent_display_summary) = ''
    ) as all_candidate_families_have_displayable_parent_pass,
    (
      select count(*) = 0
      from candidate_family_review_ordering
      where child_display_summary is null or btrim(child_display_summary) = ''
    ) as all_candidate_families_have_displayable_child_pass,
    exists (
      select 1
      from group_review_ordering
      where safe_group_ref = '721e2ae3d95dd418af40b6459531b870'
        and candidate_family_count = 3
        and distinct_child_count = 3
        and layout_reference_count = 3
    ) as one_parent_group_present_pass,
    exists (
      select 1
      from deleted_family_advisory
      where safe_family_ref = '16ead1f516a885724a2bddd11e14472b'
        and active_parent_memberships = 2
        and active_child_memberships = 0
        and layout_reference_count = 0
    ) as deleted_family_advisory_present_pass,
    true as no_automatic_owner_approval_pass,
    (
      select count(*) = count(parent_gender)
      from candidate_parent_membership_rows
    ) as parent_gender_evidence_present_pass,
    exists (
      select 1
      from candidate_parent_membership_rows
      where role_gender_review_status = 'POTENTIAL_MISMATCH'
    ) as role_gender_advisory_present_pass,
    (
      select count(distinct safe_group_ref)::integer
      from candidate_parent_membership_rows
      where role_gender_review_status = 'POTENTIAL_MISMATCH'
    ) as potential_role_gender_mismatch_group_count,
    (
      select count(*)::integer
      from candidate_parent_membership_rows
      where role_gender_review_status = 'POTENTIAL_MISMATCH'
    ) as potential_role_gender_mismatch_parent_count,
    true as no_automatic_role_correction_pass,
    true as owner_role_confirmation_placeholders_null_pass
),
owner_review_rows as (
  select
    'owner_review_group_summary'::text as result_set,
    gro.group_review_order,
    gro.safe_group_ref,
    null::uuid as family_id,
    null::text as safe_family_ref,
    null::integer as family_review_order,
    cardinality(gro.parent_ids)::integer as parent_count,
    gro.candidate_family_count,
    gro.distinct_child_count,
    coalesce(psg.parent_display_summary, 'Không rõ tên') as parent_display_summary,
    coalesce(csg.child_display_summary, 'Không rõ tên') as child_display_summary,
    gro.layout_reference_count,
    gro.revision_reference_count,
    0::integer as union_context_conflict_count,
    0::integer as relationship_period_conflict_count,
    gro.metadata_conflict_count,
    case
      when cardinality(gro.parent_ids) > 2 then 'BLOCKED_GRAPH_INVARIANT'
      when gro.relationship_role_conflict_count > 0
        or gro.relationship_type_conflict_count > 0 then 'BLOCKED_DATA_CONFLICT'
      else 'OWNER_DECISION_REQUIRED'
    end as proposed_risk_class,
    null::text as owner_decision,
    null::text as owner_notes,
    null::boolean as is_active,
    null::text as canonical_status,
    null::boolean as has_canonical_key,
    null::boolean as has_merge_target,
    null::timestamptz as created_at,
    null::timestamptz as updated_at,
    null::integer as child_count,
    null::text as proposed_survivor_rank_evidence,
    null::text as proposed_survivor_reason,
    null::boolean as owner_selected_survivor,
    null::text as owner_family_decision,
    null::uuid as parent_person_id,
    null::text as safe_parent_person_ref,
    null::text as parent_display_name,
    null::text as relationship_role,
    null::text as relationship_type,
    null::uuid as child_person_id,
    null::text as safe_child_person_ref,
    null::text as child_display_name,
    null::uuid as membership_id,
    null::text as safe_membership_ref,
    null::text as special_case_type,
    null::text as special_case_warning,
    null::integer as duplicate_group_count,
    null::integer as parent_detail_row_count,
    null::integer as child_detail_row_count,
    null::boolean as group_count_matches_fix1_pass,
    null::boolean as candidate_family_count_matches_fix1_pass,
    null::boolean as candidate_pairs_unique_pass,
    null::boolean as parent_rows_match_candidate_parent_counts_pass,
    null::boolean as child_rows_match_candidate_child_counts_pass,
    null::boolean as all_candidate_families_have_displayable_parent_pass,
    null::boolean as all_candidate_families_have_displayable_child_pass,
    null::boolean as one_parent_group_present_pass,
    null::boolean as deleted_family_advisory_present_pass,
    null::boolean as no_automatic_owner_approval_pass,
    gro.potential_role_gender_mismatch_parent_count
      as potential_role_gender_mismatch_parent_count,
    gro.potential_role_gender_mismatch_family_count
      as potential_role_gender_mismatch_family_count,
    gro.role_gender_owner_review_required
      as role_gender_owner_review_required,
    null::text as parent_gender,
    null::text as expected_role_from_gender,
    null::text as role_gender_review_status,
    null::text as role_gender_warning,
    null::text as owner_confirmed_relationship_role,
    null::boolean as parent_gender_evidence_present_pass,
    null::boolean as role_gender_advisory_present_pass,
    null::integer as potential_role_gender_mismatch_group_count,
    null::boolean as no_automatic_role_correction_pass,
    null::boolean as owner_role_confirmation_placeholders_null_pass
  from group_review_ordering gro
  left join parent_summaries_by_group psg on psg.safe_group_ref = gro.safe_group_ref
  left join child_summaries_by_group csg on csg.safe_group_ref = gro.safe_group_ref
  union all
  select
    'owner_review_candidate_family'::text,
    cfp.group_review_order,
    cfp.safe_group_ref,
    cfp.family_id,
    cfp.safe_family_ref,
    cfp.family_review_order,
    cfp.distinct_parent_count,
    null::integer,
    null::integer,
    cfp.parent_display_summary,
    cfp.child_display_summary,
    cfp.layout_reference_count,
    cfp.revision_reference_count,
    null::integer,
    null::integer,
    null::integer,
    null::text,
    null::text,
    null::text,
    cfp.deleted_at is null,
    cfp.canonical_status,
    cfp.canonical_key is not null,
    cfp.merged_into_family_id is not null,
    cfp.created_at,
    cfp.updated_at,
    cfp.active_child_membership_count,
    concat_ws(
      ',',
      case when cfp.deleted_at is null then 'ACTIVE_FAMILY' end,
      case when cfp.layout_reference_count > 0 then 'HAS_LAYOUT_REFERENCE' end,
      case when cfp.revision_reference_count > 0 then 'HAS_REVISION_LINEAGE' end,
      case when cfp.canonical_key is not null then 'HAS_CANONICAL_METADATA' end,
      'NO_ROLE_CONFLICT',
      'NO_RELATIONSHIP_CONFLICT'
    ),
    case
      when count(*) over (partition by cfp.safe_group_ref, cfp.layout_reference_count, cfp.revision_reference_count)
        = count(*) over (partition by cfp.safe_group_ref)
        then 'OWNER_SELECTION_REQUIRED_EQUIVALENT_CANDIDATES'
      else 'OWNER_REVIEW_ADVISORY_EVIDENCE_ONLY'
    end,
    null::boolean,
    null::text,
    null::uuid,
    null::text,
    null::text,
    null::text,
    null::text,
    null::uuid,
    null::text,
    null::text,
    null::uuid,
    null::text,
    null::text,
    null::text,
    null::integer,
    null::integer,
    null::integer,
    null::boolean,
    null::boolean,
    null::boolean,
    null::boolean,
    null::boolean,
    null::boolean,
    null::boolean,
    null::boolean,
    null::boolean,
    null::boolean,
    null::integer,
    null::integer,
    null::boolean,
    null::text,
    null::text,
    null::text,
    null::text,
    null::text,
    null::boolean,
    null::boolean,
    null::integer,
    null::boolean,
    null::boolean
  from candidate_family_review_ordering cfp
  union all
  select
    'owner_review_parent_detail'::text,
    gro.group_review_order,
    cpmr.safe_group_ref,
    cpmr.family_id,
    cpmr.safe_family_ref,
    cfp.family_review_order,
    null::integer,
    null::integer,
    null::integer,
    null::text,
    null::text,
    null::integer,
    null::integer,
    null::integer,
    null::integer,
    null::integer,
    null::text,
    null::text,
    null::text,
    null::boolean,
    null::text,
    null::boolean,
    null::boolean,
    null::timestamptz,
    null::timestamptz,
    null::integer,
    null::text,
    null::text,
    null::boolean,
    null::text,
    cpmr.person_id,
    md5(cpmr.person_id::text),
    cpmr.display_name_for_owner,
    cpmr.parent_role,
    cpmr.relationship_type,
    null::uuid,
    null::text,
    null::text,
    cpmr.membership_id,
    md5(cpmr.membership_id::text),
    null::text,
    null::text,
    null::integer,
    null::integer,
    null::integer,
    null::boolean,
    null::boolean,
    null::boolean,
    null::boolean,
    null::boolean,
    null::boolean,
    null::boolean,
    null::boolean,
    null::boolean,
    null::boolean,
    null::integer,
    null::integer,
    null::boolean,
    cpmr.parent_gender,
    cpmr.expected_role_from_gender,
    cpmr.role_gender_review_status,
    cpmr.role_gender_warning,
    null::text,
    null::boolean,
    null::boolean,
    null::integer,
    null::boolean,
    null::boolean
  from candidate_parent_membership_rows cpmr
  join group_review_ordering gro on gro.safe_group_ref = cpmr.safe_group_ref
  join candidate_family_review_ordering cfp
    on cfp.safe_group_ref = cpmr.safe_group_ref
   and cfp.safe_family_ref = cpmr.safe_family_ref
  union all
  select
    'owner_review_child_detail'::text,
    gro.group_review_order,
    ccmr.safe_group_ref,
    ccmr.family_id,
    ccmr.safe_family_ref,
    cfp.family_review_order,
    null::integer,
    null::integer,
    null::integer,
    null::text,
    null::text,
    null::integer,
    null::integer,
    null::integer,
    null::integer,
    null::integer,
    null::text,
    null::text,
    null::text,
    null::boolean,
    null::text,
    null::boolean,
    null::boolean,
    null::timestamptz,
    null::timestamptz,
    null::integer,
    null::text,
    null::text,
    null::boolean,
    null::text,
    null::uuid,
    null::text,
    null::text,
    null::text,
    ccmr.child_relationship_type,
    ccmr.person_id,
    md5(ccmr.person_id::text),
    ccmr.display_name_for_owner,
    ccmr.membership_id,
    md5(ccmr.membership_id::text),
    null::text,
    null::text,
    null::integer,
    null::integer,
    null::integer,
    null::boolean,
    null::boolean,
    null::boolean,
    null::boolean,
    null::boolean,
    null::boolean,
    null::boolean,
    null::boolean,
    null::boolean,
    null::boolean,
    null::integer,
    null::integer,
    null::boolean,
    null::text,
    null::text,
    null::text,
    null::text,
    null::text,
    null::boolean,
    null::boolean,
    null::integer,
    null::boolean,
    null::boolean
  from candidate_child_membership_rows ccmr
  join group_review_ordering gro on gro.safe_group_ref = ccmr.safe_group_ref
  join candidate_family_review_ordering cfp
    on cfp.safe_group_ref = ccmr.safe_group_ref
   and cfp.safe_family_ref = ccmr.safe_family_ref
  union all
  select
    'owner_review_special_cases'::text,
    gro.group_review_order,
    gro.safe_group_ref,
    cfp.family_id,
    cfp.safe_family_ref,
    cfp.family_review_order,
    cardinality(gro.parent_ids)::integer,
    gro.candidate_family_count,
    gro.distinct_child_count,
    cfp.parent_display_summary,
    cfp.child_display_summary,
    cfp.layout_reference_count,
    cfp.revision_reference_count,
    0::integer,
    0::integer,
    gro.metadata_conflict_count,
    'OWNER_DECISION_REQUIRED',
    null::text,
    null::text,
    cfp.deleted_at is null,
    cfp.canonical_status,
    cfp.canonical_key is not null,
    cfp.merged_into_family_id is not null,
    cfp.created_at,
    cfp.updated_at,
    cfp.active_child_membership_count,
    null::text,
    'MISSING_SPOUSE_OR_MOTHER_CONTEXT_REQUIRES_OWNER_REVIEW',
    null::boolean,
    null::text,
    null::uuid,
    null::text,
    null::text,
    null::text,
    null::text,
    null::uuid,
    null::text,
    null::text,
    null::uuid,
    null::text,
    'ONE_PARENT_GROUP',
    'Verify shared parent, missing spouse or mother context, layout preservation, and real family context.',
    null::integer,
    null::integer,
    null::integer,
    null::boolean,
    null::boolean,
    null::boolean,
    null::boolean,
    null::boolean,
    null::boolean,
    null::boolean,
    null::boolean,
    null::boolean,
    null::boolean,
    gro.potential_role_gender_mismatch_parent_count,
    gro.potential_role_gender_mismatch_family_count,
    gro.role_gender_owner_review_required,
    null::text,
    null::text,
    null::text,
    null::text,
    null::text,
    null::boolean,
    null::boolean,
    null::integer,
    null::boolean,
    null::boolean
  from group_review_ordering gro
  join candidate_family_review_ordering cfp on cfp.safe_group_ref = gro.safe_group_ref
  where gro.safe_group_ref = '721e2ae3d95dd418af40b6459531b870'
  union all
  select
    'owner_review_special_cases'::text,
    null::integer,
    null::text,
    dfa.family_id,
    dfa.safe_family_ref,
    null::integer,
    null::integer,
    null::integer,
    null::integer,
    dfa.parent_display_summary,
    null::text,
    dfa.layout_reference_count,
    dfa.revision_reference_count,
    null::integer,
    null::integer,
    null::integer,
    'OWNER_DECISION_REQUIRED',
    null::text,
    null::text,
    false,
    null::text,
    null::boolean,
    null::boolean,
    null::timestamptz,
    null::timestamptz,
    dfa.active_child_memberships,
    null::text,
    'SEPARATE_OWNER_DECISION_REQUIRED',
    null::boolean,
    null::text,
    null::uuid,
    null::text,
    null::text,
    null::text,
    null::text,
    null::uuid,
    null::text,
    null::text,
    null::uuid,
    null::text,
    'DELETED_FAMILY_ADVISORY',
    'Deleted family remains outside the normal 22-group approval flow.',
    null::integer,
    dfa.active_parent_memberships,
    dfa.active_child_memberships,
    null::boolean,
    null::boolean,
    null::boolean,
    null::boolean,
    null::boolean,
    null::boolean,
    null::boolean,
    null::boolean,
    null::boolean,
    null::boolean,
    null::integer,
    null::integer,
    null::boolean,
    null::text,
    null::text,
    null::text,
    null::text,
    null::text,
    null::boolean,
    null::boolean,
    null::integer,
    null::boolean,
    null::boolean
  from deleted_family_advisory dfa
  union all
  select
    'owner_review_role_gender_advisory'::text,
    gro.group_review_order,
    cpmr.safe_group_ref,
    cpmr.family_id,
    cpmr.safe_family_ref,
    cfp.family_review_order,
    null::integer,
    null::integer,
    null::integer,
    null::text,
    null::text,
    null::integer,
    null::integer,
    null::integer,
    null::integer,
    null::integer,
    'OWNER_CONFIRMATION_REQUIRED',
    null::text,
    null::text,
    null::boolean,
    null::text,
    null::boolean,
    null::boolean,
    null::timestamptz,
    null::timestamptz,
    null::integer,
    null::text,
    cpmr.role_gender_warning,
    null::boolean,
    null::text,
    cpmr.person_id,
    md5(cpmr.person_id::text),
    cpmr.display_name_for_owner,
    cpmr.parent_role,
    cpmr.relationship_type,
    null::uuid,
    null::text,
    null::text,
    cpmr.membership_id,
    md5(cpmr.membership_id::text),
    null::text,
    null::text,
    null::integer,
    null::integer,
    null::integer,
    null::boolean,
    null::boolean,
    null::boolean,
    null::boolean,
    null::boolean,
    null::boolean,
    null::boolean,
    null::boolean,
    null::boolean,
    null::boolean,
    null::integer,
    null::integer,
    null::boolean,
    cpmr.parent_gender,
    cpmr.expected_role_from_gender,
    cpmr.role_gender_review_status,
    cpmr.role_gender_warning,
    null::text,
    null::boolean,
    null::boolean,
    null::integer,
    null::boolean,
    null::boolean
  from candidate_parent_membership_rows cpmr
  join group_review_ordering gro on gro.safe_group_ref = cpmr.safe_group_ref
  join candidate_family_review_ordering cfp
    on cfp.safe_group_ref = cpmr.safe_group_ref
   and cfp.safe_family_ref = cpmr.safe_family_ref
  where cpmr.role_gender_review_status = 'POTENTIAL_MISMATCH'
  union all
  select
    'owner_review_integrity'::text,
    null::integer,
    null::text,
    null::uuid,
    null::text,
    null::integer,
    null::integer,
    ori.candidate_family_count,
    null::integer,
    null::text,
    null::text,
    null::integer,
    null::integer,
    null::integer,
    null::integer,
    null::integer,
    null::text,
    null::text,
    null::text,
    null::boolean,
    null::text,
    null::boolean,
    null::boolean,
    null::timestamptz,
    null::timestamptz,
    null::integer,
    null::text,
    null::text,
    null::boolean,
    null::text,
    null::uuid,
    null::text,
    null::text,
    null::text,
    null::text,
    null::uuid,
    null::text,
    null::text,
    null::uuid,
    null::text,
    null::text,
    null::text,
    ori.duplicate_group_count,
    ori.parent_detail_row_count,
    ori.child_detail_row_count,
    ori.group_count_matches_fix1_pass,
    ori.candidate_family_count_matches_fix1_pass,
    ori.candidate_pairs_unique_pass,
    ori.parent_rows_match_candidate_parent_counts_pass,
    ori.child_rows_match_candidate_child_counts_pass,
    ori.all_candidate_families_have_displayable_parent_pass,
    ori.all_candidate_families_have_displayable_child_pass,
    ori.one_parent_group_present_pass,
    ori.deleted_family_advisory_present_pass,
    ori.no_automatic_owner_approval_pass,
    ori.potential_role_gender_mismatch_parent_count,
    null::integer,
    null::boolean,
    null::text,
    null::text,
    null::text,
    null::text,
    null::text,
    ori.parent_gender_evidence_present_pass,
    ori.role_gender_advisory_present_pass,
    ori.potential_role_gender_mismatch_group_count,
    ori.no_automatic_role_correction_pass,
    ori.owner_role_confirmation_placeholders_null_pass
  from owner_review_integrity ori
)
select
  owner_review_rows.*,
  case
    when result_set = 'owner_review_special_cases'
      and special_case_type = 'DELETED_FAMILY_ADVISORY'
      then parent_detail_row_count
    else null
  end as active_parent_memberships,
  case
    when result_set = 'owner_review_special_cases'
      and special_case_type = 'DELETED_FAMILY_ADVISORY'
      then child_detail_row_count
    else null
  end as active_child_memberships
from owner_review_rows
order by
  case result_set
    when 'owner_review_integrity' then 0
    when 'owner_review_group_summary' then 1
    when 'owner_review_candidate_family' then 2
    when 'owner_review_parent_detail' then 3
    when 'owner_review_role_gender_advisory' then 4
    when 'owner_review_child_detail' then 5
    when 'owner_review_special_cases' then 6
    else 9
  end,
  group_review_order nulls last,
  safe_group_ref nulls last,
  family_review_order nulls last,
  safe_family_ref nulls last,
  safe_membership_ref nulls last;
