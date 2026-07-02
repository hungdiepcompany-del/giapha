-- A16T_OFFICIAL_IMPORT_AUDIT_ROLLBACK_IDEMPOTENCY_SCHEMA_CANDIDATE
-- SQL_CANDIDATE_STATUS=NOT_APPLIED
-- DO_NOT_RUN_AUTOMATICALLY
-- OWNER_MANUAL_REVIEW_REQUIRED
-- DO_NOT_RUN_SUPABASE_DB_PUSH
-- DO_NOT_RUN_SUPABASE_MIGRATION_REPAIR
-- NO_SEED_DATA
-- NO_REAL_GENEALOGY_WRITE
-- NO_PEOPLE_RELATIONSHIP_FAMILY_LAYOUT_REVISION_WRITE
-- NO_ANON_OR_PUBLIC_GRANT
-- NO_BROAD_GRANT
-- NO_RLS_DISABLE
-- NO_OFFICIAL_IMPORT_EXECUTION
-- Additive-only candidate for future Gia Pha 4 official import audit batch,
-- rollback manifest persistence and import_session_id idempotency guard.

create table if not exists public.official_import_batches (
  id uuid primary key default gen_random_uuid(),
  import_session_id uuid not null references public.import_sessions(id) on delete restrict,
  write_manifest_id uuid references public.import_write_manifests(id) on delete restrict,
  actor_profile_id uuid references public.profiles(id) on delete restrict,
  source_type text not null default 'giapha4_xlsx',
  status text not null default 'pending',
  manifest_hash text,
  review_pack_hash text,
  expected_people_count integer not null default 0,
  expected_relationship_count integer not null default 0,
  created_people_count integer not null default 0,
  created_relationship_count integer not null default 0,
  audit_record_count integer not null default 0,
  rollback_manifest_count integer not null default 0,
  duplicate_decision_summary jsonb not null default '{}'::jsonb,
  validation_summary jsonb not null default '{}'::jsonb,
  dry_run_summary jsonb not null default '{}'::jsonb,
  idempotency_key text not null,
  import_marker text,
  failure_code text,
  failure_message_sanitized text,
  started_at timestamptz,
  completed_at timestamptz,
  failed_at timestamptz,
  rolled_back_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  constraint official_import_batches_source_type_check check (
    source_type in ('giapha4_xlsx')
  ),
  constraint official_import_batches_status_check check (
    status in (
      'pending',
      'running',
      'completed',
      'failed',
      'rollback_required',
      'rolled_back',
      'voided'
    )
  ),
  constraint official_import_batches_non_negative_counts check (
    expected_people_count >= 0
    and expected_relationship_count >= 0
    and created_people_count >= 0
    and created_relationship_count >= 0
    and audit_record_count >= 0
    and rollback_manifest_count >= 0
  ),
  constraint official_import_batches_summary_objects check (
    jsonb_typeof(duplicate_decision_summary) = 'object'
    and jsonb_typeof(validation_summary) = 'object'
    and jsonb_typeof(dry_run_summary) = 'object'
  ),
  constraint official_import_batches_idempotency_key_check check (
    idempotency_key = import_session_id::text
  ),
  constraint official_import_batches_completed_consistency_check check (
    status <> 'completed'
    or (
      completed_at is not null
      and import_marker is not null
      and rollback_manifest_count > 0
    )
  ),
  constraint official_import_batches_failure_consistency_check check (
    status not in ('failed', 'rollback_required')
    or failed_at is not null
  )
);

create unique index if not exists official_import_batches_import_session_unique_idx
  on public.official_import_batches(import_session_id);

create unique index if not exists official_import_batches_idempotency_key_unique_idx
  on public.official_import_batches(idempotency_key);

create index if not exists official_import_batches_status_idx
  on public.official_import_batches(status, created_at desc);

create index if not exists official_import_batches_actor_idx
  on public.official_import_batches(actor_profile_id, created_at desc);

create table if not exists public.official_import_rollback_manifests (
  id uuid primary key default gen_random_uuid(),
  import_batch_id uuid not null references public.official_import_batches(id) on delete restrict,
  import_session_id uuid not null references public.import_sessions(id) on delete restrict,
  manifest_hash text not null,
  rollback_status text not null default 'not_started',
  rollback_order jsonb not null default '[]'::jsonb,
  created_people_ids uuid[] not null default array[]::uuid[],
  created_family_ids uuid[] not null default array[]::uuid[],
  created_family_parent_ids uuid[] not null default array[]::uuid[],
  created_family_child_ids uuid[] not null default array[]::uuid[],
  created_couple_relationship_ids uuid[] not null default array[]::uuid[],
  created_revision_ids uuid[] not null default array[]::uuid[],
  created_layout_ids uuid[] not null default array[]::uuid[],
  skipped_candidate_summary jsonb not null default '{}'::jsonb,
  blocked_candidate_summary jsonb not null default '{}'::jsonb,
  rollback_notes_sanitized text,
  created_at timestamptz not null default timezone('utc', now()),
  created_by uuid references public.profiles(id) on delete set null,
  updated_at timestamptz not null default timezone('utc', now()),
  updated_by uuid references public.profiles(id) on delete set null,
  constraint official_import_rollback_status_check check (
    rollback_status in (
      'not_started',
      'ready',
      'running',
      'completed',
      'failed',
      'manual_review_required'
    )
  ),
  constraint official_import_rollback_json_shapes_check check (
    jsonb_typeof(rollback_order) = 'array'
    and jsonb_typeof(skipped_candidate_summary) = 'object'
    and jsonb_typeof(blocked_candidate_summary) = 'object'
  )
);

create unique index if not exists official_import_rollback_batch_unique_idx
  on public.official_import_rollback_manifests(import_batch_id);

create unique index if not exists official_import_rollback_session_unique_idx
  on public.official_import_rollback_manifests(import_session_id);

create index if not exists official_import_rollback_status_idx
  on public.official_import_rollback_manifests(rollback_status, created_at desc);

alter table public.official_import_batches enable row level security;
alter table public.official_import_rollback_manifests enable row level security;

create policy a16t_official_import_batches_select_own
  on public.official_import_batches
  for select
  to authenticated
  using (
    public.has_permission('imports.create')
    and exists (
      select 1
      from public.import_sessions owned_session
      where owned_session.id = official_import_batches.import_session_id
        and owned_session.created_by = public.current_profile_id()
    )
  );

create policy a16t_official_import_batches_insert_own
  on public.official_import_batches
  for insert
  to authenticated
  with check (
    public.has_permission('imports.create')
    and public.has_permission('people.create')
    and public.has_permission('relationships.create')
    and actor_profile_id = public.current_profile_id()
    and created_by = public.current_profile_id()
    and idempotency_key = import_session_id::text
    and status = 'pending'
    and exists (
      select 1
      from public.import_sessions owned_session
      where owned_session.id = official_import_batches.import_session_id
        and owned_session.created_by = public.current_profile_id()
        and owned_session.status in (
          'owner_approved_for_db_write',
          'ready_for_owner_approval'
        )
    )
  );

create policy a16t_official_import_batches_update_own
  on public.official_import_batches
  for update
  to authenticated
  using (
    public.has_permission('imports.create')
    and exists (
      select 1
      from public.import_sessions owned_session
      where owned_session.id = official_import_batches.import_session_id
        and owned_session.created_by = public.current_profile_id()
    )
  )
  with check (
    public.has_permission('imports.create')
    and updated_by = public.current_profile_id()
    and exists (
      select 1
      from public.import_sessions owned_session
      where owned_session.id = official_import_batches.import_session_id
        and owned_session.created_by = public.current_profile_id()
    )
  );

create policy a16t_official_import_rollback_select_own
  on public.official_import_rollback_manifests
  for select
  to authenticated
  using (
    public.has_permission('imports.create')
    and exists (
      select 1
      from public.import_sessions owned_session
      where owned_session.id = official_import_rollback_manifests.import_session_id
        and owned_session.created_by = public.current_profile_id()
    )
  );

create policy a16t_official_import_rollback_insert_own
  on public.official_import_rollback_manifests
  for insert
  to authenticated
  with check (
    public.has_permission('imports.create')
    and public.has_permission('people.create')
    and public.has_permission('relationships.create')
    and created_by = public.current_profile_id()
    and exists (
      select 1
      from public.official_import_batches batch
      join public.import_sessions owned_session
        on owned_session.id = batch.import_session_id
      where batch.id = official_import_rollback_manifests.import_batch_id
        and batch.import_session_id = official_import_rollback_manifests.import_session_id
        and owned_session.created_by = public.current_profile_id()
    )
  );

create policy a16t_official_import_rollback_update_own
  on public.official_import_rollback_manifests
  for update
  to authenticated
  using (
    public.has_permission('imports.create')
    and exists (
      select 1
      from public.import_sessions owned_session
      where owned_session.id = official_import_rollback_manifests.import_session_id
        and owned_session.created_by = public.current_profile_id()
    )
  )
  with check (
    public.has_permission('imports.create')
    and updated_by = public.current_profile_id()
    and exists (
      select 1
      from public.import_sessions owned_session
      where owned_session.id = official_import_rollback_manifests.import_session_id
        and owned_session.created_by = public.current_profile_id()
    )
  );

comment on table public.official_import_batches is
  'A-16T NOT_APPLIED candidate for Gia Pha 4 official import batch audit and import_session_id idempotency guard. No import execution is opened by this schema.';

comment on table public.official_import_rollback_manifests is
  'A-16T NOT_APPLIED candidate for official import rollback manifest persistence. Stores created ids/refs, not raw Excel rows.';
