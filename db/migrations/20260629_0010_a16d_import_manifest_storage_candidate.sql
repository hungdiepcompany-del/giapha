-- A16D_IMPORT_SCHEMA_CANDIDATE_MANIFEST_STORAGE_DESIGN
-- A16E2_IMPORT_SCHEMA_CANDIDATE_APPLY_BLOCKER_RESOLUTION
-- SQL_CANDIDATE_STATUS=NOT_APPLIED
-- OWNER_APPROVED_FILE_CREATION_ONLY
-- DO_NOT_APPLY_WITHOUT_APPROVE_A16E_IMPORT_MANIFEST_SCHEMA_APPLY
-- DO_NOT_RUN_SUPABASE_DB_PUSH
-- NO_RUNTIME_IMPORT_WRITE
-- NO_EXCEL_FILE_STORAGE
-- NO_RAW_EXCEL_CONTENT
-- NO_RAW_PII_ROW_STORAGE
-- RLS_FAIL_CLOSED_NO_POLICY_NO_GRANT
-- A-16D creates a not-applied schema candidate for Gia Pha 4.0 import
-- session, review state, duplicate candidate, relationship candidate and
-- write manifest storage. It intentionally adds no RLS policies and no seed.

create table if not exists public.import_sessions (
  id uuid primary key default gen_random_uuid(),
  source_type text not null default 'giapha4_excel',
  source_file_name text,
  source_file_size_bytes bigint,
  source_file_hash text,
  preview_manifest_hash text,
  mapping_version text not null,
  parser_version text,
  status text not null default 'preview_generated',
  clan_id uuid references public.clans(id) on delete set null,
  branch_id uuid references public.clan_branches(id) on delete set null,
  row_count integer not null default 0,
  person_candidate_count integer not null default 0,
  relationship_candidate_count integer not null default 0,
  warning_count integer not null default 0,
  duplicate_candidate_count integer not null default 0,
  unmapped_column_count integer not null default 0,
  held_row_count integer not null default 0,
  approval_marker text,
  approved_by uuid references public.profiles(id) on delete set null,
  approved_at timestamptz,
  review_summary jsonb not null default '{}'::jsonb,
  privacy_summary jsonb not null default '{}'::jsonb,
  retention_until timestamptz,
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint import_sessions_source_type_check check (
    source_type in ('giapha4_excel')
  ),
  constraint import_sessions_status_check check (
    status in (
      'preview_generated',
      'owner_reviewing',
      'warnings_acknowledged',
      'duplicates_reviewed',
      'relationships_reviewed',
      'privacy_reviewed',
      'ready_for_owner_approval',
      'owner_approved_for_db_write',
      'rejected_needs_fix',
      'expired_preview',
      'write_started',
      'write_completed',
      'rollback_required',
      'rolled_back'
    )
  ),
  constraint import_sessions_non_negative_counts check (
    row_count >= 0
    and person_candidate_count >= 0
    and relationship_candidate_count >= 0
    and warning_count >= 0
    and duplicate_candidate_count >= 0
    and unmapped_column_count >= 0
    and held_row_count >= 0
  ),
  constraint import_sessions_source_file_size_check check (
    source_file_size_bytes is null or source_file_size_bytes >= 0
  ),
  constraint import_sessions_hash_presence_check check (
    status in ('preview_generated', 'owner_reviewing', 'rejected_needs_fix', 'expired_preview')
    or preview_manifest_hash is not null
  ),
  constraint import_sessions_approval_marker_check check (
    approval_marker is not null
    or (
      approved_by is null
      and approved_at is null
      and status not in (
        'owner_approved_for_db_write',
        'write_started',
        'write_completed',
        'rollback_required',
        'rolled_back'
      )
    )
  ),
  constraint import_sessions_review_summary_object_check check (
    jsonb_typeof(review_summary) = 'object'
  ),
  constraint import_sessions_privacy_summary_object_check check (
    jsonb_typeof(privacy_summary) = 'object'
  )
);

create table if not exists public.import_session_warnings (
  id uuid primary key default gen_random_uuid(),
  import_session_id uuid not null references public.import_sessions(id) on delete cascade,
  warning_code text not null,
  severity text not null default 'info',
  row_index integer,
  column_key text,
  message_vi text not null,
  review_status text not null default 'open',
  acknowledged_by uuid references public.profiles(id) on delete set null,
  acknowledged_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  constraint import_session_warnings_severity_check check (
    severity in ('info', 'warning', 'blocker')
  ),
  constraint import_session_warnings_review_status_check check (
    review_status in ('open', 'acknowledged', 'held', 'resolved')
  )
);

create table if not exists public.import_duplicate_candidates (
  id uuid primary key default gen_random_uuid(),
  import_session_id uuid not null references public.import_sessions(id) on delete cascade,
  source_row_index integer not null,
  source_person_fingerprint text not null,
  existing_person_id uuid references public.people(id) on delete set null,
  match_strength text not null,
  match_reason_codes text[] not null default array[]::text[],
  owner_decision text not null default 'unresolved',
  decided_by uuid references public.profiles(id) on delete set null,
  decided_at timestamptz,
  decision_note text,
  created_at timestamptz not null default timezone('utc', now()),
  constraint import_duplicate_candidates_match_strength_check check (
    match_strength in ('strong', 'medium', 'weak', 'ambiguous')
  ),
  constraint import_duplicate_candidates_owner_decision_check check (
    owner_decision in (
      'unresolved',
      'create_new',
      'link_existing',
      'hold',
      'skip'
    )
  )
);

create table if not exists public.import_relationship_candidates (
  id uuid primary key default gen_random_uuid(),
  import_session_id uuid not null references public.import_sessions(id) on delete cascade,
  relationship_type text not null,
  source_row_index integer not null,
  source_person_fingerprint text not null,
  related_row_index integer,
  related_person_fingerprint text,
  target_existing_person_id uuid references public.people(id) on delete set null,
  relationship_label_vi text not null,
  confidence text not null default 'ambiguous',
  ambiguity_status text not null default 'ambiguous',
  owner_decision text not null default 'unresolved',
  decided_by uuid references public.profiles(id) on delete set null,
  decided_at timestamptz,
  decision_note text,
  created_at timestamptz not null default timezone('utc', now()),
  constraint import_relationship_candidates_type_check check (
    relationship_type in ('parent_child', 'spouse_couple', 'branch_membership')
  ),
  constraint import_relationship_candidates_confidence_check check (
    confidence in ('strong', 'medium', 'weak', 'ambiguous')
  ),
  constraint import_relationship_candidates_ambiguity_status_check check (
    ambiguity_status in ('clear', 'ambiguous', 'missing_reference', 'conflicting')
  ),
  constraint import_relationship_candidates_owner_decision_check check (
    owner_decision in (
      'unresolved',
      'create_relationship',
      'link_existing',
      'hold',
      'skip'
    )
  )
);

create table if not exists public.import_write_manifests (
  id uuid primary key default gen_random_uuid(),
  import_session_id uuid not null references public.import_sessions(id) on delete cascade,
  manifest_hash text not null,
  approval_marker text not null,
  status text not null default 'draft',
  approved_scope jsonb not null default '{}'::jsonb,
  planned_counts jsonb not null default '{}'::jsonb,
  held_rows_summary jsonb not null default '{}'::jsonb,
  rollback_plan jsonb not null default '{}'::jsonb,
  created_record_ids jsonb not null default '{}'::jsonb,
  created_by uuid references public.profiles(id) on delete set null,
  approved_by uuid references public.profiles(id) on delete set null,
  approved_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  constraint import_write_manifests_status_check check (
    status in (
      'draft',
      'ready_for_apply',
      'owner_approved',
      'write_started',
      'write_completed',
      'rollback_required',
      'rolled_back',
      'voided'
    )
  ),
  constraint import_write_manifests_approved_scope_object_check check (
    jsonb_typeof(approved_scope) = 'object'
  ),
  constraint import_write_manifests_planned_counts_object_check check (
    jsonb_typeof(planned_counts) = 'object'
  ),
  constraint import_write_manifests_held_rows_summary_object_check check (
    jsonb_typeof(held_rows_summary) = 'object'
  ),
  constraint import_write_manifests_rollback_plan_object_check check (
    jsonb_typeof(rollback_plan) = 'object'
  ),
  constraint import_write_manifests_created_record_ids_object_check check (
    jsonb_typeof(created_record_ids) = 'object'
  ),
  constraint import_write_manifests_approval_consistency_check check (
    status in ('draft', 'voided')
    or (
      approval_marker is not null
      and manifest_hash is not null
    )
  )
);

create index if not exists import_sessions_status_idx
  on public.import_sessions(status);

create index if not exists import_sessions_source_file_hash_idx
  on public.import_sessions(source_file_hash);

create index if not exists import_sessions_created_at_idx
  on public.import_sessions(created_at desc);

create unique index if not exists import_sessions_approval_marker_unique_idx
  on public.import_sessions(approval_marker)
  where approval_marker is not null;

create index if not exists import_session_warnings_session_idx
  on public.import_session_warnings(import_session_id, severity, review_status);

create index if not exists import_duplicate_candidates_session_idx
  on public.import_duplicate_candidates(import_session_id, match_strength, owner_decision);

create index if not exists import_relationship_candidates_session_idx
  on public.import_relationship_candidates(import_session_id, relationship_type, owner_decision);

create unique index if not exists import_write_manifests_session_hash_unique_idx
  on public.import_write_manifests(import_session_id, manifest_hash);

create index if not exists import_write_manifests_status_idx
  on public.import_write_manifests(status);

alter table public.import_sessions enable row level security;
alter table public.import_session_warnings enable row level security;
alter table public.import_duplicate_candidates enable row level security;
alter table public.import_relationship_candidates enable row level security;
alter table public.import_write_manifests enable row level security;

comment on table public.import_sessions is
  'A-16D/A-16E2 not-applied candidate for Gia Pha 4.0 import session metadata and owner review state. Does not store Excel content or raw PII rows.';

comment on table public.import_session_warnings is
  'A-16D not-applied candidate for privacy-safe import warning codes and Vietnamese review messages.';

comment on table public.import_duplicate_candidates is
  'A-16D/A-16E2 not-applied candidate for duplicate suggestions. Owner decision required; no automatic merge and no raw source row storage.';

comment on table public.import_relationship_candidates is
  'A-16D/A-16E2 not-applied candidate for reviewed relationship suggestions. Ambiguous links stay held and no raw source row storage is required.';

comment on table public.import_write_manifests is
  'A-16D not-applied candidate for owner-approved write manifest and rollback scope.';
