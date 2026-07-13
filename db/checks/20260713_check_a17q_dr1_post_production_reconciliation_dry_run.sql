-- A17Q_DR1_POST_PRODUCTION_RECONCILIATION_DRY_RUN_SELECT_ONLY_VERIFIER
-- SELECT_ONLY_VERIFIER=YES
-- DO_NOT_CALL_EXECUTOR
-- DO_NOT_MUTATE_DATA
-- Intended for owner execution only after the A-17Q-DR1 dry-run SQL returns.

with expected as (
  select
    '777a8bb13ff45eb9f46fd817c392098ada4a2d550cad8e6ee4c6cd896b874ad0'::text as decision_pack_sha256,
    'A17Q_DR1_DRY_RUN_20260713_E04238C_001'::text as dry_run_idempotency_key,
    array[
      '7e8e8b20-49ce-49f0-aba8-e55f441fc8cc'::uuid,
      '0dc5e67d-9f5e-4270-8783-3393fe3843a4'::uuid,
      '5b437738-e8a3-4fef-80de-9c8e5ff0839d'::uuid
    ] as excluded_family_ids,
    '990de69e-2239-4a00-995c-6292ce4a814a'::uuid as deleted_family_id,
    '16ead1f516a885724a2bddd11e14472b'::text as deleted_safe_family_ref
), active_people as (
  select id
  from public.people
  where deleted_at is null
), active_families as (
  select id
  from public.families
  where deleted_at is null
), active_family_parents as (
  select fp.id, fp.family_id, fp.person_id
  from public.family_parents fp
  join active_families f on f.id = fp.family_id
  join active_people p on p.id = fp.person_id
  where fp.deleted_at is null
), active_family_children as (
  select fc.id, fc.family_id, fc.person_id
  from public.family_children fc
  join active_families f on f.id = fc.family_id
  join active_people p on p.id = fc.person_id
  where fc.deleted_at is null
), batch_evidence as (
  select
    count(*) as total_reconciliation_batch_count,
    count(*) filter (
      where approved_audit_hash = (select decision_pack_sha256 from expected)
    ) as decision_pack_batch_count,
    count(*) filter (
      where approved_audit_hash = (select decision_pack_sha256 from expected)
        and status = 'completed'
    ) as completed_reconciliation_batch_count,
    count(*) filter (
      where idempotency_key = (select dry_run_idempotency_key from expected)
    ) as dry_run_idempotency_state_count
  from public.family_reconciliation_batches
), rollback_evidence as (
  select count(*) as rollback_manifest_count
  from public.family_reconciliation_rollback_manifests
), audit_evidence as (
  select count(*) as a17q_audit_revision_count
  from public.revisions
  where entity_type = 'families'
    and before_json is null
    and jsonb_typeof(after_json) = 'object'
    and after_json ->> 'source' = 'A-17Q-TX1 legacy family reconciliation transaction executor'
    and after_json ->> 'decision_pack_sha256' = (select decision_pack_sha256 from expected)
), active_baseline as (
  select
    (select count(*) from active_families) as active_family_count,
    (select count(*) from active_family_parents) as active_parent_membership_count,
    (select count(*) from active_family_children) as active_child_membership_count
), excluded_scope as (
  select
    count(*) as excluded_family_count,
    count(*) filter (where f.deleted_at is null) as excluded_active_family_count,
    count(*) filter (where f.canonical_status = 'legacy_unreviewed') as excluded_legacy_unreviewed_count,
    count(*) filter (where md5(f.id::text) in (
      '721e2ae3d95dd418af40b6459531b870',
      '16ead1f516a885724a2bddd11e14472b'
    )) as unexpected_hash_collision_count
  from public.families f
  where f.id = any((select excluded_family_ids from expected))
), deleted_scope as (
  select
    count(*) as deleted_family_record_count,
    count(*) filter (where md5(f.id::text) = (select deleted_safe_family_ref from expected)) as deleted_safe_ref_match_count,
    count(*) filter (where f.deleted_at is not null) as deleted_family_soft_deleted_count,
    (
      select count(*)
      from public.family_parents fp
      where fp.family_id = (select deleted_family_id from expected)
        and fp.deleted_at is null
    ) as deleted_family_active_parent_membership_count,
    (
      select count(*)
      from public.family_children fc
      where fc.family_id = (select deleted_family_id from expected)
        and fc.deleted_at is null
    ) as deleted_family_active_child_membership_count,
    (
      select count(*)
      from public.tree_layout_nodes tln
      where tln.family_id = (select deleted_family_id from expected)
        and tln.deleted_at is null
    ) as deleted_family_layout_reference_count
  from public.families f
  where f.id = (select deleted_family_id from expected)
)
select
  'a17q_dr1_post_dry_run_verification' as result_set,
  (select total_reconciliation_batch_count from batch_evidence) as total_reconciliation_batch_count,
  (select decision_pack_batch_count from batch_evidence) as decision_pack_batch_count,
  (select completed_reconciliation_batch_count from batch_evidence) as completed_reconciliation_batch_count,
  (select rollback_manifest_count from rollback_evidence) as rollback_manifest_count,
  (select a17q_audit_revision_count from audit_evidence) as a17q_audit_revision_count,
  (select dry_run_idempotency_state_count from batch_evidence) as dry_run_idempotency_state_count,
  (select active_family_count from active_baseline) as active_family_count,
  (select active_parent_membership_count from active_baseline) as active_parent_membership_count,
  (select active_child_membership_count from active_baseline) as active_child_membership_count,
  (select excluded_family_count from excluded_scope) as excluded_family_count,
  (select excluded_active_family_count from excluded_scope) as excluded_active_family_count,
  (select excluded_legacy_unreviewed_count from excluded_scope) as excluded_legacy_unreviewed_count,
  (select unexpected_hash_collision_count from excluded_scope) as unexpected_hash_collision_count,
  (select deleted_family_record_count from deleted_scope) as deleted_family_record_count,
  (select deleted_safe_ref_match_count from deleted_scope) as deleted_safe_ref_match_count,
  (select deleted_family_soft_deleted_count from deleted_scope) as deleted_family_soft_deleted_count,
  (select deleted_family_active_parent_membership_count from deleted_scope) as deleted_family_active_parent_membership_count,
  (select deleted_family_active_child_membership_count from deleted_scope) as deleted_family_active_child_membership_count,
  (select deleted_family_layout_reference_count from deleted_scope) as deleted_family_layout_reference_count,
  (select completed_reconciliation_batch_count = 0 from batch_evidence) as completed_batch_count_zero_pass,
  (select decision_pack_batch_count = 0 from batch_evidence) as decision_pack_batch_count_zero_pass,
  (select rollback_manifest_count = 0 from rollback_evidence) as rollback_manifest_count_zero_pass,
  (select a17q_audit_revision_count = 0 from audit_evidence) as audit_revision_count_zero_pass,
  (select dry_run_idempotency_state_count = 0 from batch_evidence) as dry_run_idempotency_state_count_zero_pass,
  (select active_family_count = 74 from active_baseline) as active_family_baseline_pass,
  (select active_parent_membership_count = 140 from active_baseline) as active_parent_membership_baseline_pass,
  (select active_child_membership_count = 73 from active_baseline) as active_child_membership_baseline_pass,
  (select excluded_family_count = 3 and excluded_active_family_count = 3 from excluded_scope) as excluded_scope_unchanged_pass,
  (
    select deleted_family_record_count = 1
      and deleted_safe_ref_match_count = 1
      and deleted_family_soft_deleted_count = 1
      and deleted_family_active_parent_membership_count = 2
      and deleted_family_active_child_membership_count = 0
      and deleted_family_layout_reference_count = 0
    from deleted_scope
  ) as deleted_scope_unchanged_pass;
