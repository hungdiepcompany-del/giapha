-- A17Q_EXEC2_FINAL_POST_RECONCILIATION_SELECT_ONLY_VERIFIER
-- SELECT_ONLY_VERIFIER=YES
-- DO_NOT_CALL_EXECUTOR
-- DO_NOT_MUTATE_DATA
-- Safe to run after the first execution and again after idempotency replay.

with recursive expected as (
  select
    'A17P_MANUAL_21_GROUP_RECONCILIATION_APPROVED'::text as owner_marker,
    '777a8bb13ff45eb9f46fd817c392098ada4a2d550cad8e6ee4c6cd896b874ad0'::text as decision_pack_sha256,
    '7dd719c926dc560aa69bc7070c395535942823e87739d9893d0161713e151740'::text as approved_group_plan_sha256,
    'ee255398f84dc2ce899d14056fb0573f771202ca7ad71e598cbbe7fc47707a9f'::text as role_correction_plan_sha256,
    '7898280dab816af96b6a9277b93b49429c5db8a71c9f24739a7d55660a0bdd61'::text as excluded_scope_sha256,
    '4c0beb0de1589a7728b7f8b4918844e3103aa773ad3a5ab8e87d1ab2cead9ff3'::text as forecast_sha256,
    'A17Q_EXEC1_SINGLE_EXECUTION_20260714_FBBF24C_001'::text as execution_idempotency_key,
    '16ead1f516a885724a2bddd11e14472b'::text as deleted_safe_family_ref,
    21::integer as expected_group_count,
    21::integer as expected_survivor_count,
    36::integer as expected_void_family_count,
    57::integer as expected_approved_child_membership_count,
    42::integer as expected_survivor_parent_membership_count,
    16::integer as expected_survivor_role_correction_count,
    20::integer as expected_superseded_role_correction_count
), batch_rows as (
  select b.*
  from public.family_reconciliation_batches b
  where b.approved_audit_hash = (select decision_pack_sha256 from expected)
    and b.idempotency_key = (select execution_idempotency_key from expected)
    and b.owner_execution_marker = (select owner_marker from expected)
), completed_batch as (
  select b.*
  from batch_rows b
  where b.status = 'completed'
), rollback_manifest as (
  select m.*
  from public.family_reconciliation_rollback_manifests m
  join completed_batch b on b.id = m.reconciliation_batch_id
  where m.payload_hash = (select decision_pack_sha256 from expected)
    and m.verification_status = 'verified'
    and m.rollback_status = 'ready'
), manifest_choice as (
  select
    m.reconciliation_batch_id,
    m.canonical_family_choice,
    m.parent_memberships_before,
    m.child_memberships_before,
    m.layout_refs_before
  from rollback_manifest m
), approved_groups as (
  select
    (group_item ->> 'group_review_order')::integer as group_review_order,
    group_item ->> 'safe_group_ref' as safe_group_ref,
    (group_item ->> 'survivor_family_id')::uuid as survivor_family_id,
    group_item -> 'void_families' as void_families
  from manifest_choice c
  cross join lateral jsonb_array_elements(c.canonical_family_choice -> 'approved_groups') group_item
), void_to_survivor as (
  select
    g.safe_group_ref,
    (void_family ->> 'family_id')::uuid as family_id,
    g.survivor_family_id
  from approved_groups g
  cross join lateral jsonb_array_elements(g.void_families) void_family
), approved_families as (
  select safe_group_ref, survivor_family_id as family_id, true as is_survivor, survivor_family_id
  from approved_groups
  union all
  select safe_group_ref, family_id, false, survivor_family_id
  from void_to_survivor
), role_corrections as (
  select
    role_item ->> 'safe_group_ref' as safe_group_ref,
    (role_item ->> 'family_id')::uuid as family_id,
    (role_item ->> 'membership_id')::uuid as membership_id,
    (role_item ->> 'person_id')::uuid as person_id,
    role_item ->> 'expected_current_role' as expected_current_role,
    role_item ->> 'target_role' as target_role,
    role_item ->> 'relationship_type' as relationship_type,
    coalesce(approved.is_survivor, false) as applies_to_survivor
  from manifest_choice c
  cross join lateral jsonb_array_elements(c.canonical_family_choice -> 'role_corrections') role_item
  left join approved_families approved
    on approved.family_id = (role_item ->> 'family_id')::uuid
), excluded_families as (
  select (family_id_json #>> '{}')::uuid as family_id
  from manifest_choice c
  cross join lateral jsonb_array_elements(c.canonical_family_choice -> 'excluded_groups') excluded_group
  cross join lateral jsonb_array_elements(excluded_group -> 'candidate_family_ids') family_id_json
), deleted_family_advisory as (
  select
    (advisory ->> 'family_id')::uuid as family_id,
    advisory ->> 'safe_family_ref' as safe_family_ref
  from manifest_choice c
  cross join lateral jsonb_array_elements(c.canonical_family_choice -> 'deleted_family_advisories') advisory
), child_before as (
  select child_row.*
  from manifest_choice c
  cross join lateral jsonb_to_recordset(c.child_memberships_before) as child_row(
    id uuid,
    family_id uuid,
    person_id uuid,
    child_relationship_type text,
    deleted_at timestamptz
  )
), parent_before as (
  select parent_row.*
  from manifest_choice c
  cross join lateral jsonb_to_recordset(c.parent_memberships_before) as parent_row(
    id uuid,
    family_id uuid,
    person_id uuid,
    parent_role text,
    relationship_type text,
    deleted_at timestamptz
  )
), expected_child_final_mapping as (
  select
    cb.id as membership_id,
    cb.person_id,
    cb.family_id as source_family_id,
    case when approved.is_survivor then cb.family_id else approved.survivor_family_id end as expected_final_family_id,
    cb.child_relationship_type
  from child_before cb
  join approved_families approved on approved.family_id = cb.family_id
  where cb.deleted_at is null
), expected_parent_final_state as (
  select
    pb.id as membership_id,
    pb.person_id,
    pb.family_id as source_family_id,
    approved.is_survivor as expected_active_after,
    case when approved.is_survivor then coalesce(role_plan.target_role, pb.parent_role) else pb.parent_role end as expected_role_after,
    pb.relationship_type,
    case
      when approved.is_survivor and role_plan.membership_id is not null then 'SURVIVOR_ROLE_CORRECTED'
      when approved.is_survivor then 'SURVIVOR_MEMBERSHIP_UNCHANGED'
      when role_plan.membership_id is not null then 'ROLE_CORRECTION_SUPERSEDED_BY_MEMBERSHIP_DEACTIVATION'
      else 'VOID_MEMBERSHIP_DEACTIVATED'
    end as disposition
  from parent_before pb
  join approved_families approved on approved.family_id = pb.family_id
  left join role_corrections role_plan on role_plan.membership_id = pb.id
  where pb.deleted_at is null
), active_families as (
  select f.id, f.canonical_key, f.canonical_status, f.merged_into_family_id
  from public.families f
  where f.deleted_at is null
    and coalesce(f.canonical_status, 'legacy_unreviewed') not in ('merged', 'voided')
), active_family_parents as (
  select fp.id, fp.family_id, fp.person_id, fp.parent_role, fp.relationship_type
  from public.family_parents fp
  join active_families f on f.id = fp.family_id
  where fp.deleted_at is null
), active_family_children as (
  select fc.id, fc.family_id, fc.person_id, fc.child_relationship_type
  from public.family_children fc
  join public.families f on f.id = fc.family_id
  where fc.deleted_at is null
    and f.deleted_at is null
), active_state as (
  select
    (select count(*) from active_families) as active_family_count,
    (select count(*) from active_family_parents) as active_parent_membership_count,
    (select count(*) from active_family_children) as active_child_membership_count
), family_state as (
  select
    (select count(*) from approved_groups) as approved_group_count,
    (select count(*) from approved_families where is_survivor) as survivor_plan_count,
    (select count(*) from approved_families where not is_survivor) as void_plan_count,
    count(*) filter (
      where approved.is_survivor
        and f.deleted_at is null
        and f.canonical_status = 'canonical'
        and f.merged_into_family_id is null
    ) as approved_survivor_active_count,
    count(*) filter (
      where not approved.is_survivor
        and f.deleted_at is null
        and f.canonical_status = 'merged'
        and f.merged_into_family_id = approved.survivor_family_id
    ) as approved_void_merged_count,
    count(*) filter (
      where not approved.is_survivor
        and f.deleted_at is null
        and coalesce(f.canonical_status, 'legacy_unreviewed') not in ('merged', 'voided')
    ) as active_void_family_count
  from approved_families approved
  join public.families f on f.id = approved.family_id
), child_state as (
  select
    (select count(*) from expected_child_final_mapping) as expected_child_membership_count,
    count(actual.id) as preserved_child_membership_count,
    count(*) filter (where actual.id is null) as child_loss_count,
    (
      select count(*)
      from public.family_children fc
      join void_to_survivor voided on voided.family_id = fc.family_id
      where fc.deleted_at is null
    ) as active_child_under_void_family_count
  from expected_child_final_mapping expected_child
  left join public.family_children actual
    on actual.id = expected_child.membership_id
   and actual.person_id = expected_child.person_id
   and actual.family_id = expected_child.expected_final_family_id
   and actual.child_relationship_type is not distinct from expected_child.child_relationship_type
   and actual.deleted_at is null
), parent_state as (
  select
    count(actual.id) filter (where expected_parent.expected_active_after) as active_survivor_parent_membership_count,
    count(*) filter (where expected_parent.expected_active_after and actual.id is null) as missing_active_survivor_parent_count,
    (
      select count(*)
      from public.family_parents fp
      join void_to_survivor voided on voided.family_id = fp.family_id
      where fp.deleted_at is null
    ) as active_parent_under_void_family_count
  from expected_parent_final_state expected_parent
  left join public.family_parents actual
    on actual.id = expected_parent.membership_id
   and actual.person_id = expected_parent.person_id
   and actual.parent_role = expected_parent.expected_role_after
   and actual.relationship_type = expected_parent.relationship_type
   and actual.deleted_at is null
), role_state as (
  select
    count(*) filter (
      where role_plan.applies_to_survivor
        and fp.id is not null
        and fp.deleted_at is null
        and fp.parent_role = role_plan.target_role
        and fp.relationship_type = role_plan.relationship_type
    ) as active_survivor_role_correction_count,
    count(*) filter (
      where not role_plan.applies_to_survivor
        and fp.id is not null
        and fp.deleted_at is not null
    ) as inactive_superseded_role_correction_count
  from role_corrections role_plan
  left join public.family_parents fp on fp.id = role_plan.membership_id
), excluded_scope as (
  select
    count(*) as excluded_family_count,
    count(*) filter (
      where f.deleted_at is null
        and f.canonical_status = 'legacy_unreviewed'
        and f.merged_into_family_id is null
        and f.reconciliation_batch_id is null
    ) as excluded_unchanged_count
  from excluded_families excluded
  join public.families f on f.id = excluded.family_id
), deleted_scope as (
  select
    count(*) as deleted_family_record_count,
    count(*) filter (where md5(f.id::text) = (select deleted_safe_family_ref from expected)) as deleted_safe_ref_match_count,
    count(*) filter (where f.deleted_at is not null) as deleted_family_soft_deleted_count,
    (
      select count(*)
      from public.family_parents fp
      join deleted_family_advisory d on d.family_id = fp.family_id
      where fp.deleted_at is null
    ) as deleted_family_active_parent_membership_count,
    (
      select count(*)
      from public.family_children fc
      join deleted_family_advisory d on d.family_id = fc.family_id
      where fc.deleted_at is null
    ) as deleted_family_active_child_membership_count,
    (
      select count(*)
      from public.tree_layout_nodes node
      join deleted_family_advisory d on d.family_id = node.family_id
      where node.deleted_at is null
    ) as deleted_family_layout_reference_count
  from deleted_family_advisory d
  join public.families f on f.id = d.family_id
), graph_state as (
  select
    (
      select count(*)
      from (
        select canonical_key
        from public.families
        where deleted_at is null
          and canonical_status = 'canonical'
          and canonical_key is not null
        group by canonical_key
        having count(*) > 1
      ) duplicate_keys
    ) as duplicate_active_canonical_key_count,
    (
      select count(*)
      from (
        select family_id, person_id
        from active_family_parents
        group by family_id, person_id
        having count(*) > 1
      ) duplicate_parent_pairs
    ) as duplicate_active_parent_pair_count,
    (
      select count(*)
      from (
        select family_id, person_id
        from active_family_children
        group by family_id, person_id
        having count(*) > 1
      ) duplicate_child_pairs
    ) as duplicate_active_child_pair_count,
    (
      select count(*)
      from active_family_parents fp
      join active_family_children fc
        on fc.family_id = fp.family_id
       and fc.person_id = fp.person_id
    ) as parent_child_overlap_count
), ancestry_edges as (
  select fp.person_id as parent_person_id, fc.person_id as child_person_id
  from active_family_parents fp
  join active_family_children fc on fc.family_id = fp.family_id
), ancestry_walk(ancestor_id, descendant_id, path, cycle_detected) as (
  select
    edges.parent_person_id,
    edges.child_person_id,
    array[edges.parent_person_id, edges.child_person_id]::uuid[],
    edges.parent_person_id = edges.child_person_id
  from ancestry_edges edges
  union all
  select
    walk.ancestor_id,
    edges.child_person_id,
    walk.path || edges.child_person_id,
    edges.child_person_id = any(walk.path)
  from ancestry_walk walk
  join ancestry_edges edges on edges.parent_person_id = walk.descendant_id
  where not walk.cycle_detected
    and cardinality(walk.path) < 128
), ancestry_state as (
  select count(*) as ancestry_cycle_count
  from ancestry_walk
  where cycle_detected
     or ancestor_id = descendant_id
), audit_evidence as (
  select
    count(*) filter (
      where after_json ->> 'event_type' = 'A17Q_LEGACY_FAMILY_RECONCILIATION_PRE_MUTATION'
    ) as pre_mutation_audit_count,
    count(*) filter (
      where after_json ->> 'event_type' = 'A17Q_LEGACY_FAMILY_RECONCILIATION_COMPLETED'
    ) as post_mutation_audit_count,
    (jsonb_agg(after_json) filter (
      where after_json ->> 'event_type' = 'A17Q_LEGACY_FAMILY_RECONCILIATION_PRE_MUTATION'
    ) -> 0) as pre_audit_json,
    (jsonb_agg(after_json) filter (
      where after_json ->> 'event_type' = 'A17Q_LEGACY_FAMILY_RECONCILIATION_COMPLETED'
    ) -> 0) as post_audit_json
  from public.revisions r
  join completed_batch b on b.id::text = (r.after_json ->> 'batch_id')
  where r.entity_type = 'families'
    and r.action = 'update'
    and r.before_json is null
    and jsonb_typeof(r.after_json) = 'object'
    and r.after_json ->> 'source' = 'A-17Q-TX1 legacy family reconciliation transaction executor'
    and r.after_json ->> 'decision_pack_sha256' = (select decision_pack_sha256 from expected)
), stored_result as (
  select
    b.id as batch_id,
    b.success_result,
    b.success_result_sha256,
    pg_catalog.encode(
      extensions.digest(pg_catalog.convert_to(coalesce(b.success_result, '{}'::jsonb)::text, 'UTF8'), 'sha256'::text),
      'hex'
    ) as recomputed_success_result_sha256
  from completed_batch b
), hash_integrity as (
  select
    coalesce(pre_audit_json ->> 'people_before_hash', '') as people_before_hash,
    coalesce(post_audit_json ->> 'people_after_hash', '') as people_after_hash,
    coalesce(pre_audit_json ->> 'layout_before_hash', '') as layout_before_hash,
    coalesce(post_audit_json ->> 'layout_after_hash', '') as layout_after_hash,
    coalesce(pre_audit_json ->> 'excluded_before_hash', '') as excluded_before_hash,
    coalesce(post_audit_json ->> 'excluded_after_hash', '') as excluded_after_hash,
    coalesce(pre_audit_json ->> 'deleted_before_hash', '') as deleted_before_hash,
    coalesce(post_audit_json ->> 'deleted_after_hash', '') as deleted_after_hash
  from audit_evidence
)
select
  'a17q_exec2_final_post_reconciliation_verification' as result_set,
  (select count(*) from batch_rows) as decision_pack_batch_count,
  (select count(*) from completed_batch) as completed_batch_count,
  (select count(*) from rollback_manifest) as rollback_manifest_count,
  (select active_family_count from active_state) as active_family_count,
  (select active_parent_membership_count from active_state) as active_parent_membership_count,
  (select active_child_membership_count from active_state) as active_child_membership_count,
  (select approved_group_count from family_state) as approved_group_count,
  (select approved_survivor_active_count from family_state) as approved_survivor_active_count,
  (select approved_void_merged_count from family_state) as approved_void_merged_count,
  (select active_void_family_count from family_state) as active_void_family_count,
  (select expected_child_membership_count from child_state) as expected_child_membership_count,
  (select preserved_child_membership_count from child_state) as preserved_child_membership_count,
  (select child_loss_count from child_state) as child_loss_count,
  (select active_child_under_void_family_count from child_state) as active_child_under_void_family_count,
  (select active_survivor_parent_membership_count from parent_state) as active_survivor_parent_membership_count,
  (select missing_active_survivor_parent_count from parent_state) as missing_active_survivor_parent_count,
  (select active_parent_under_void_family_count from parent_state) as active_parent_under_void_family_count,
  (select active_survivor_role_correction_count from role_state) as active_survivor_role_correction_count,
  (select inactive_superseded_role_correction_count from role_state) as inactive_superseded_role_correction_count,
  (select excluded_family_count from excluded_scope) as excluded_family_count,
  (select excluded_unchanged_count from excluded_scope) as excluded_unchanged_count,
  (select deleted_family_record_count from deleted_scope) as deleted_family_record_count,
  (select deleted_safe_ref_match_count from deleted_scope) as deleted_safe_ref_match_count,
  (select deleted_family_soft_deleted_count from deleted_scope) as deleted_family_soft_deleted_count,
  (select deleted_family_active_parent_membership_count from deleted_scope) as deleted_family_active_parent_membership_count,
  (select deleted_family_active_child_membership_count from deleted_scope) as deleted_family_active_child_membership_count,
  (select deleted_family_layout_reference_count from deleted_scope) as deleted_family_layout_reference_count,
  (select duplicate_active_canonical_key_count from graph_state) as duplicate_active_canonical_key_count,
  (select duplicate_active_parent_pair_count from graph_state) as duplicate_active_parent_pair_count,
  (select duplicate_active_child_pair_count from graph_state) as duplicate_active_child_pair_count,
  (select parent_child_overlap_count from graph_state) as parent_child_overlap_count,
  (select ancestry_cycle_count from ancestry_state) as ancestry_cycle_count,
  (select pre_mutation_audit_count from audit_evidence) as pre_mutation_audit_count,
  (select post_mutation_audit_count from audit_evidence) as post_mutation_audit_count,
  (select success_result_sha256 = recomputed_success_result_sha256 from stored_result) as stored_success_result_sha256_valid,
  (select success_result ->> 'batch_id' = batch_id::text from stored_result) as stored_batch_id_match,
  (select success_result ->> 'decision_pack_sha256' = (select decision_pack_sha256 from expected) from stored_result) as stored_decision_pack_hash_match,
  (select people_before_hash = people_after_hash and people_after_hash = coalesce((select success_result ->> 'people_after_hash' from stored_result), '') from hash_integrity) as people_rows_unchanged_pass,
  (select layout_before_hash = layout_after_hash and layout_after_hash = coalesce((select success_result ->> 'layout_after_hash' from stored_result), '') from hash_integrity) as layout_rows_unchanged_pass,
  (select excluded_before_hash = excluded_after_hash and excluded_after_hash = coalesce((select success_result ->> 'excluded_after_hash' from stored_result), '') from hash_integrity) as excluded_hash_unchanged_pass,
  (select deleted_before_hash = deleted_after_hash and deleted_after_hash = coalesce((select success_result ->> 'deleted_after_hash' from stored_result), '') from hash_integrity) as deleted_hash_unchanged_pass,
  (select count(*) = 1 from batch_rows) as decision_pack_batch_count_one_pass,
  (select count(*) = 1 from completed_batch) as completed_batch_count_one_pass,
  (select count(*) = 1 from rollback_manifest) as rollback_manifest_count_one_pass,
  (select active_family_count = 38 and active_parent_membership_count = 68 and active_child_membership_count = 73 from active_state) as active_post_state_pass,
  (select approved_survivor_active_count = (select expected_survivor_count from expected) from family_state) as approved_survivor_active_pass,
  (select approved_void_merged_count = (select expected_void_family_count from expected) and active_void_family_count = 0 from family_state) as approved_void_families_merged_pass,
  (select expected_child_membership_count = (select expected_approved_child_membership_count from expected) and preserved_child_membership_count = (select expected_approved_child_membership_count from expected) and child_loss_count = 0 and active_child_under_void_family_count = 0 from child_state) as child_memberships_preserved_pass,
  (select active_survivor_parent_membership_count = (select expected_survivor_parent_membership_count from expected) and missing_active_survivor_parent_count = 0 and active_parent_under_void_family_count = 0 from parent_state) as parent_memberships_final_state_pass,
  (select active_survivor_role_correction_count = (select expected_survivor_role_correction_count from expected) and inactive_superseded_role_correction_count = (select expected_superseded_role_correction_count from expected) from role_state) as role_correction_final_state_pass,
  (select excluded_family_count = 3 and excluded_unchanged_count = 3 from excluded_scope) as excluded_scope_unchanged_pass,
  (
    select deleted_family_record_count = 1
      and deleted_safe_ref_match_count = 1
      and deleted_family_soft_deleted_count = 1
      and deleted_family_active_parent_membership_count = 2
      and deleted_family_active_child_membership_count = 0
      and deleted_family_layout_reference_count = 0
    from deleted_scope
  ) as deleted_scope_unchanged_pass,
  (select duplicate_active_canonical_key_count = 0 and duplicate_active_parent_pair_count = 0 and duplicate_active_child_pair_count = 0 and parent_child_overlap_count = 0 from graph_state) as global_graph_integrity_pass,
  (select ancestry_cycle_count = 0 from ancestry_state) as ancestry_cycle_count_zero_pass,
  (select pre_mutation_audit_count = 1 and post_mutation_audit_count = 1 from audit_evidence) as mutation_audit_evidence_pass,
  (
    select success_result_sha256 = recomputed_success_result_sha256
      and success_result ->> 'batch_id' = batch_id::text
      and success_result ->> 'decision_pack_sha256' = (select decision_pack_sha256 from expected)
    from stored_result
  ) as stored_success_result_integrity_pass;
