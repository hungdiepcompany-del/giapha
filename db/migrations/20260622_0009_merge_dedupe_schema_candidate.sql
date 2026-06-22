-- A12_MERGE_DEDUPE_REAL_MIGRATION_CANDIDATE
-- OWNER_APPROVED_FILE_CREATION_ONLY
-- APPROVE_A11_MERGE_DEDUPE_SCHEMA_CANDIDATE_GRANTED_FOR_FILE_CREATION_ONLY
-- DO_NOT_APPLY_WITHOUT_APPROVE_A12_MERGE_DEDUPE_DB_APPLY
-- RUNTIME_MERGE_DEDUPE_REMAINS_CLOSED
-- Additive migration candidate only. No seed, backfill, policy, permission registration,
-- function, route, action, service, runtime mutation, deploy or Worker change.

create table if not exists public.merge_dedupe_candidates (
  id uuid primary key default gen_random_uuid(),
  person_a_id uuid not null references public.people(id) on delete restrict,
  person_b_id uuid not null references public.people(id) on delete restrict,
  confidence_level text not null,
  evidence_json jsonb not null default '{}'::jsonb,
  detection_version text not null,
  candidate_status text not null default 'suggested',
  discovered_at timestamptz not null default now(),
  discovered_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  reviewed_by uuid references public.profiles(id) on delete set null,
  dismissal_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint merge_dedupe_candidates_order_check check (person_a_id < person_b_id),
  constraint merge_dedupe_candidates_confidence_check check (
    confidence_level in ('strong', 'medium', 'weak')
  ),
  constraint merge_dedupe_candidates_status_check check (
    candidate_status in ('suggested', 'reviewing', 'dismissed', 'accepted')
  ),
  constraint merge_dedupe_candidates_review_actor_time_check check (
    (reviewed_at is null and reviewed_by is null)
    or (reviewed_at is not null and reviewed_by is not null)
  )
);

create unique index if not exists merge_dedupe_candidates_pair_unique
on public.merge_dedupe_candidates (person_a_id, person_b_id);

create index if not exists merge_dedupe_candidates_status_confidence_idx
on public.merge_dedupe_candidates (candidate_status, confidence_level);

create table if not exists public.merge_dedupe_sessions (
  id uuid primary key default gen_random_uuid(),
  merge_id uuid not null default gen_random_uuid(),
  candidate_id uuid references public.merge_dedupe_candidates(id) on delete restrict,
  source_person_id uuid not null references public.people(id) on delete restrict,
  target_person_id uuid not null references public.people(id) on delete restrict,
  session_status text not null default 'draft',
  reason text not null,
  confidence_level text not null,
  requested_by uuid not null references public.profiles(id) on delete restrict,
  requested_at timestamptz not null default now(),
  approved_by uuid references public.profiles(id) on delete restrict,
  approved_at timestamptz,
  executed_by uuid references public.profiles(id) on delete restrict,
  executed_at timestamptz,
  source_person_updated_at timestamptz not null,
  target_person_updated_at timestamptz not null,
  source_person_version_token text not null,
  target_person_version_token text not null,
  version_check_status text not null default 'pending',
  version_checked_by uuid references public.profiles(id) on delete restrict,
  version_checked_at timestamptz,
  conflict_review_status text not null default 'pending',
  conflict_review_checksum text,
  conflicts_resolved_by uuid references public.profiles(id) on delete restrict,
  conflicts_resolved_at timestamptz,
  graph_validation_status text not null default 'pending',
  graph_validation_result jsonb not null default '{}'::jsonb,
  graph_validated_by uuid references public.profiles(id) on delete restrict,
  graph_validated_at timestamptz,
  impact_manifest_checksum text,
  idempotency_key text not null,
  approval_marker_code text,
  approval_granted_by uuid references public.profiles(id) on delete restrict,
  approval_granted_at timestamptz,
  approval_metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint merge_dedupe_sessions_merge_id_unique unique (merge_id),
  constraint merge_dedupe_sessions_id_merge_unique unique (id, merge_id),
  constraint merge_dedupe_sessions_idempotency_key_unique unique (idempotency_key),
  constraint merge_dedupe_sessions_people_different_check check (
    source_person_id <> target_person_id
  ),
  constraint merge_dedupe_sessions_reason_not_blank check (length(btrim(reason)) > 0),
  constraint merge_dedupe_sessions_version_tokens_not_blank check (
    length(btrim(source_person_version_token)) > 0
    and length(btrim(target_person_version_token)) > 0
  ),
  constraint merge_dedupe_sessions_idempotency_key_not_blank check (
    length(btrim(idempotency_key)) > 0
  ),
  constraint merge_dedupe_sessions_impact_checksum_not_blank check (
    impact_manifest_checksum is null
    or length(btrim(impact_manifest_checksum)) > 0
  ),
  constraint merge_dedupe_sessions_conflict_checksum_not_blank check (
    conflict_review_checksum is null
    or length(btrim(conflict_review_checksum)) > 0
  ),
  constraint merge_dedupe_sessions_approval_marker_not_blank check (
    approval_marker_code is null
    or length(btrim(approval_marker_code)) > 0
  ),
  constraint merge_dedupe_sessions_confidence_check check (
    confidence_level in ('strong', 'medium', 'weak')
  ),
  constraint merge_dedupe_sessions_status_check check (
    session_status in (
      'draft', 'reviewing', 'approved', 'executing', 'executed',
      'rejected', 'stale', 'rollback_review', 'rolled_back', 'failed'
    )
  ),
  constraint merge_dedupe_sessions_version_check_status_check check (
    version_check_status in ('pending', 'passed', 'stale', 'failed')
  ),
  constraint merge_dedupe_sessions_conflict_review_status_check check (
    conflict_review_status in ('pending', 'resolved', 'rejected')
  ),
  constraint merge_dedupe_sessions_graph_validation_status_check check (
    graph_validation_status in ('pending', 'passed', 'failed')
  ),
  constraint merge_dedupe_sessions_version_actor_time_check check (
    (version_checked_by is null and version_checked_at is null)
    or (version_checked_by is not null and version_checked_at is not null)
  ),
  constraint merge_dedupe_sessions_conflict_actor_time_check check (
    (conflicts_resolved_by is null and conflicts_resolved_at is null)
    or (conflicts_resolved_by is not null and conflicts_resolved_at is not null)
  ),
  constraint merge_dedupe_sessions_graph_actor_time_check check (
    (graph_validated_by is null and graph_validated_at is null)
    or (graph_validated_by is not null and graph_validated_at is not null)
  ),
  constraint merge_dedupe_sessions_graph_passed_result_check check (
    graph_validation_status <> 'passed'
    or graph_validation_result <> '{}'::jsonb
  ),
  constraint merge_dedupe_sessions_approval_actor_time_check check (
    (
      approval_marker_code is null
      and approval_granted_by is null
      and approval_granted_at is null
    )
    or (
      approval_marker_code is not null
      and approval_granted_by is not null
      and approval_granted_at is not null
    )
  ),
  constraint merge_dedupe_sessions_approved_actor_time_check check (
    (approved_by is null and approved_at is null)
    or (approved_by is not null and approved_at is not null)
  ),
  constraint merge_dedupe_sessions_executed_actor_time_check check (
    (executed_by is null and executed_at is null)
    or (executed_by is not null and executed_at is not null)
  ),
  constraint merge_dedupe_sessions_ready_state_check check (
    session_status not in (
      'approved', 'executing', 'executed', 'rollback_review', 'rolled_back'
    )
    or (
      version_check_status = 'passed'
      and conflict_review_status = 'resolved'
      and conflict_review_checksum is not null
      and graph_validation_status = 'passed'
      and impact_manifest_checksum is not null
      and approval_marker_code is not null
      and version_checked_by is not null
      and version_checked_at is not null
      and conflicts_resolved_by is not null
      and conflicts_resolved_at is not null
      and graph_validated_by is not null
      and graph_validated_at is not null
      and approved_by is not null
      and approved_at is not null
    )
  ),
  constraint merge_dedupe_sessions_executed_state_check check (
    session_status not in ('executed', 'rollback_review', 'rolled_back')
    or (executed_by is not null and executed_at is not null)
  )
);

create unique index if not exists merge_dedupe_sessions_active_candidate_unique
on public.merge_dedupe_sessions (candidate_id)
where candidate_id is not null
  and session_status in ('draft', 'reviewing', 'approved', 'executing');

create index if not exists merge_dedupe_sessions_source_idx
on public.merge_dedupe_sessions (source_person_id, session_status);

create index if not exists merge_dedupe_sessions_target_idx
on public.merge_dedupe_sessions (target_person_id, session_status);

create table if not exists public.merge_dedupe_field_decisions (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.merge_dedupe_sessions(id) on delete restrict,
  field_name text not null,
  source_value jsonb,
  target_value jsonb,
  resolution text not null default 'unresolved',
  selected_value jsonb,
  provenance_json jsonb not null default '{}'::jsonb,
  is_conflict boolean not null default true,
  decided_by uuid references public.profiles(id) on delete restrict,
  decided_at timestamptz,
  created_at timestamptz not null default now(),
  constraint merge_dedupe_field_decisions_field_not_blank check (
    length(btrim(field_name)) > 0
  ),
  constraint merge_dedupe_field_decisions_resolution_check check (
    resolution in (
      'unresolved', 'keep_source', 'keep_target', 'keep_both_separate',
      'manual_value', 'not_applicable'
    )
  ),
  constraint merge_dedupe_field_decisions_actor_time_check check (
    (decided_by is null and decided_at is null)
    or (decided_by is not null and decided_at is not null)
  ),
  constraint merge_dedupe_field_decisions_resolved_actor_check check (
    resolution = 'unresolved'
    or (decided_by is not null and decided_at is not null)
  ),
  constraint merge_dedupe_field_decisions_session_field_unique unique (
    session_id, field_name
  )
);

create index if not exists merge_dedupe_field_decisions_unresolved_idx
on public.merge_dedupe_field_decisions (session_id, resolution)
where resolution = 'unresolved';

create table if not exists public.merge_dedupe_impact_snapshots (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.merge_dedupe_sessions(id) on delete restrict,
  impact_scope text not null,
  entity_type text not null,
  entity_key text not null,
  entity_version_token text,
  before_json jsonb not null,
  proposed_after_json jsonb,
  impact_decision text not null default 'pending',
  validation_status text not null default 'pending',
  validation_errors jsonb not null default '[]'::jsonb,
  snapshot_order integer not null default 0,
  created_at timestamptz not null default now(),
  constraint merge_dedupe_impact_snapshots_scope_check check (
    impact_scope in (
      'relationship', 'layout', 'membership_lineage',
      'visibility_privacy', 'export'
    )
  ),
  constraint merge_dedupe_impact_snapshots_entity_type_not_blank check (
    length(btrim(entity_type)) > 0
  ),
  constraint merge_dedupe_impact_snapshots_entity_key_not_blank check (
    length(btrim(entity_key)) > 0
  ),
  constraint merge_dedupe_impact_snapshots_decision_check check (
    impact_decision in ('pending', 'move', 'copy', 'dedupe', 'preserve', 'reject')
  ),
  constraint merge_dedupe_impact_snapshots_validation_check check (
    validation_status in ('pending', 'passed', 'failed')
  ),
  constraint merge_dedupe_impact_snapshots_order_check check (snapshot_order >= 0),
  constraint merge_dedupe_impact_snapshots_entity_unique unique (
    session_id, impact_scope, entity_type, entity_key
  )
);

create index if not exists merge_dedupe_impact_snapshots_scope_idx
on public.merge_dedupe_impact_snapshots (session_id, impact_scope);

create table if not exists public.merge_dedupe_audit_events (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null,
  merge_id uuid not null,
  event_sequence integer not null,
  event_type text not null,
  actor_id uuid not null references public.profiles(id) on delete restrict,
  occurred_at timestamptz not null default now(),
  reason text not null,
  field_impact jsonb not null default '{}'::jsonb,
  relationship_impact jsonb not null default '{}'::jsonb,
  layout_impact jsonb not null default '{}'::jsonb,
  membership_lineage_impact jsonb not null default '{}'::jsonb,
  visibility_privacy_impact jsonb not null default '{}'::jsonb,
  export_impact jsonb not null default '{}'::jsonb,
  event_metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint merge_dedupe_audit_events_sequence_check check (event_sequence >= 1),
  constraint merge_dedupe_audit_events_reason_not_blank check (
    length(btrim(reason)) > 0
  ),
  constraint merge_dedupe_audit_events_type_check check (
    event_type in (
      'requested', 'reviewed', 'approved', 'rejected', 'version_checked',
      'graph_validated', 'executed', 'failed', 'rollback_requested',
      'rollback_executed', 'rollback_failed'
    )
  ),
  constraint merge_dedupe_audit_events_session_sequence_unique unique (
    session_id, event_sequence
  ),
  constraint merge_dedupe_audit_events_session_merge_fk
    foreign key (session_id, merge_id)
    references public.merge_dedupe_sessions(id, merge_id)
    on delete restrict
);

create index if not exists merge_dedupe_audit_events_merge_idx
on public.merge_dedupe_audit_events (merge_id, occurred_at);

create table if not exists public.merge_dedupe_rollback_manifests (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null,
  merge_id uuid not null,
  manifest_version integer not null default 1,
  manifest_status text not null default 'draft',
  source_person_snapshot jsonb not null,
  target_person_snapshot jsonb not null,
  relationships_snapshot jsonb not null default '[]'::jsonb,
  layout_snapshot jsonb not null default '[]'::jsonb,
  membership_lineage_snapshot jsonb not null default '[]'::jsonb,
  visibility_privacy_snapshot jsonb not null default '{}'::jsonb,
  revision_snapshot jsonb not null default '[]'::jsonb,
  export_snapshot jsonb not null default '{}'::jsonb,
  manifest_checksum text not null,
  created_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  verified_by uuid references public.profiles(id) on delete restrict,
  verified_at timestamptz,
  rollback_executed_by uuid references public.profiles(id) on delete restrict,
  rollback_executed_at timestamptz,
  rollback_revision_id uuid references public.revisions(id) on delete set null,
  constraint merge_dedupe_rollback_manifests_session_unique unique (session_id),
  constraint merge_dedupe_rollback_manifests_version_check check (
    manifest_version >= 1
  ),
  constraint merge_dedupe_rollback_manifests_status_check check (
    manifest_status in ('draft', 'verified', 'used', 'invalid')
  ),
  constraint merge_dedupe_rollback_manifests_checksum_not_blank check (
    length(btrim(manifest_checksum)) > 0
  ),
  constraint merge_dedupe_rollback_manifests_verified_actor_time_check check (
    (verified_by is null and verified_at is null)
    or (verified_by is not null and verified_at is not null)
  ),
  constraint merge_dedupe_rollback_manifests_executed_actor_time_check check (
    (rollback_executed_by is null and rollback_executed_at is null)
    or (rollback_executed_by is not null and rollback_executed_at is not null)
  ),
  constraint merge_dedupe_rollback_manifests_verified_state_check check (
    manifest_status not in ('verified', 'used')
    or (verified_by is not null and verified_at is not null)
  ),
  constraint merge_dedupe_rollback_manifests_used_state_check check (
    manifest_status <> 'used'
    or (
      rollback_executed_by is not null
      and rollback_executed_at is not null
      and rollback_revision_id is not null
    )
  ),
  constraint merge_dedupe_rollback_manifests_session_merge_fk
    foreign key (session_id, merge_id)
    references public.merge_dedupe_sessions(id, merge_id)
    on delete restrict
);

create index if not exists merge_dedupe_rollback_manifests_merge_idx
on public.merge_dedupe_rollback_manifests (merge_id, manifest_status);

alter table public.merge_dedupe_candidates enable row level security;
alter table public.merge_dedupe_sessions enable row level security;
alter table public.merge_dedupe_field_decisions enable row level security;
alter table public.merge_dedupe_impact_snapshots enable row level security;
alter table public.merge_dedupe_audit_events enable row level security;
alter table public.merge_dedupe_rollback_manifests enable row level security;

-- Intentionally no policies: if a later approved real migration uses this
-- migration, RLS stays fail-closed until separately approved permission runtime
-- and policies exist. No people.merge.* permission is registered here.
