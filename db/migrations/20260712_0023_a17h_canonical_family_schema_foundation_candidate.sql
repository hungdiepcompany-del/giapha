-- A17H_CANONICAL_FAMILY_SCHEMA_FOUNDATION_CANDIDATE
-- SQL_CANDIDATE_STATUS=NOT_APPLIED
-- DO_NOT_RUN_AUTOMATICALLY
-- OWNER_MANUAL_REVIEW_REQUIRED
-- DO_NOT_RUN_SUPABASE_DB_PUSH
-- DO_NOT_RUN_SUPABASE_MIGRATION_REPAIR
-- NO_SEED_DATA
-- NO_GENEALOGY_ROW_UPDATE
-- NO_CANONICAL_KEY_BACKFILL
-- NO_FAMILY_RECONCILIATION_EXECUTION
-- NO_RECONCILIATION_RPC
-- NO_AUTOMATIC_MERGE_TRIGGER
-- NO_OFFICIAL_IMPORT_EXECUTION
-- Foundation-only schema for future canonical family write paths, owner
-- decisions, all-or-nothing reconciliation batches and rollback manifests.

create table if not exists public.family_reconciliation_batches (
  id uuid primary key default gen_random_uuid(),
  idempotency_key text not null unique,
  status text not null default 'candidate',
  owner_execution_marker text,
  actor_profile_id uuid references public.profiles(id) on delete set null,
  dry_run_hash text,
  approved_audit_hash text,
  expected_counts jsonb not null default '{}'::jsonb,
  actual_counts jsonb not null default '{}'::jsonb,
  error_summary jsonb not null default '{}'::jsonb,
  blocker_summary jsonb not null default '{}'::jsonb,
  started_at timestamptz,
  completed_at timestamptz,
  voided_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  created_by uuid references public.profiles(id) on delete set null,
  updated_at timestamptz not null default timezone('utc', now()),
  updated_by uuid references public.profiles(id) on delete set null,
  constraint family_reconciliation_batches_status_check check (
    status in (
      'candidate',
      'approved',
      'running',
      'completed',
      'blocked',
      'rolled_back',
      'voided'
    )
  ),
  constraint family_reconciliation_batches_hash_shape_check check (
    (dry_run_hash is null or dry_run_hash ~* '^[a-f0-9]{64}$')
    and (approved_audit_hash is null or approved_audit_hash ~* '^[a-f0-9]{64}$')
  ),
  constraint family_reconciliation_batches_json_shape_check check (
    jsonb_typeof(expected_counts) = 'object'
    and jsonb_typeof(actual_counts) = 'object'
    and jsonb_typeof(error_summary) = 'object'
    and jsonb_typeof(blocker_summary) = 'object'
  ),
  constraint family_reconciliation_batches_running_timestamp_check check (
    status <> 'running' or started_at is not null
  ),
  constraint family_reconciliation_batches_completed_timestamp_check check (
    status <> 'completed' or completed_at is not null
  ),
  constraint family_reconciliation_batches_voided_timestamp_check check (
    status <> 'voided' or voided_at is not null
  )
);

create index if not exists family_reconciliation_batches_status_idx
  on public.family_reconciliation_batches(status, created_at desc);

create index if not exists family_reconciliation_batches_actor_idx
  on public.family_reconciliation_batches(actor_profile_id, created_at desc);

alter table public.families
  add column if not exists canonical_key text;

alter table public.families
  add column if not exists canonical_status text not null default 'legacy_unreviewed';

alter table public.families
  add column if not exists merged_into_family_id uuid references public.families(id) on delete restrict;

alter table public.families
  add column if not exists canonicalized_at timestamptz;

alter table public.families
  add column if not exists canonicalized_by uuid references public.profiles(id) on delete set null;

alter table public.families
  add column if not exists reconciliation_batch_id uuid references public.family_reconciliation_batches(id) on delete restrict;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'families_canonical_status_check'
  ) then
    alter table public.families
      add constraint families_canonical_status_check check (
        canonical_status in (
          'legacy_unreviewed',
          'canonical',
          'merged',
          'voided',
          'owner_review_required'
        )
      );
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'families_no_self_merge_check'
  ) then
    alter table public.families
      add constraint families_no_self_merge_check check (
        merged_into_family_id is null or merged_into_family_id <> id
      );
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'families_canonical_key_required_for_canonical_check'
  ) then
    alter table public.families
      add constraint families_canonical_key_required_for_canonical_check check (
        canonical_status <> 'canonical' or canonical_key is not null
      );
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'families_merge_target_required_for_merged_check'
  ) then
    alter table public.families
      add constraint families_merge_target_required_for_merged_check check (
        canonical_status <> 'merged' or merged_into_family_id is not null
      );
  end if;
end $$;

create index if not exists families_canonical_lookup_idx
  on public.families(canonical_key, canonical_status)
  where deleted_at is null and canonical_key is not null;

create unique index if not exists families_canonical_key_active_canonical_unique
  on public.families(canonical_key)
  where deleted_at is null
    and canonical_status = 'canonical'
    and canonical_key is not null;

create index if not exists families_canonical_status_idx
  on public.families(canonical_status)
  where deleted_at is null;

create index if not exists families_merged_into_family_idx
  on public.families(merged_into_family_id)
  where merged_into_family_id is not null;

create index if not exists families_reconciliation_batch_idx
  on public.families(reconciliation_batch_id)
  where reconciliation_batch_id is not null;

create table if not exists public.family_canonicalization_decisions (
  id uuid primary key default gen_random_uuid(),
  audit_group_key_hash text not null,
  parent_set_hash text,
  proposed_canonical_family_id uuid references public.families(id) on delete restrict,
  source_family_ids uuid[] not null default array[]::uuid[],
  status text not null default 'pending_review',
  reason_code text,
  decision_reason text,
  owner_actor_profile_id uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  dry_run_hash text,
  approved_audit_hash text,
  decision_version integer not null default 1,
  superseded_by_decision_id uuid references public.family_canonicalization_decisions(id) on delete restrict,
  superseded_at timestamptz,
  revoked_at timestamptz,
  revoked_by uuid references public.profiles(id) on delete set null,
  reconciliation_batch_id uuid references public.family_reconciliation_batches(id) on delete restrict,
  created_at timestamptz not null default timezone('utc', now()),
  created_by uuid references public.profiles(id) on delete set null,
  updated_at timestamptz not null default timezone('utc', now()),
  updated_by uuid references public.profiles(id) on delete set null,
  constraint family_canonicalization_decisions_status_check check (
    status in (
      'pending_review',
      'approved_merge',
      'approved_keep_separate',
      'blocked',
      'superseded'
    )
  ),
  constraint family_canonicalization_decisions_source_set_check check (
    cardinality(source_family_ids) > 0
  ),
  constraint family_canonicalization_decisions_version_check check (
    decision_version > 0
  ),
  constraint family_canonicalization_decisions_hash_shape_check check (
    audit_group_key_hash ~* '^[a-f0-9]{64}$'
    and (parent_set_hash is null or parent_set_hash ~* '^[a-f0-9]{64}$')
    and (dry_run_hash is null or dry_run_hash ~* '^[a-f0-9]{64}$')
    and (approved_audit_hash is null or approved_audit_hash ~* '^[a-f0-9]{64}$')
  ),
  constraint family_canonicalization_decisions_review_check check (
    status = 'pending_review'
    or (owner_actor_profile_id is not null and reviewed_at is not null)
  ),
  constraint family_canonicalization_decisions_superseded_check check (
    status <> 'superseded'
    or (superseded_by_decision_id is not null and superseded_at is not null)
  )
);

create index if not exists family_canonicalization_decisions_group_idx
  on public.family_canonicalization_decisions(audit_group_key_hash, decision_version desc);

create index if not exists family_canonicalization_decisions_status_idx
  on public.family_canonicalization_decisions(status, created_at desc);

create index if not exists family_canonicalization_decisions_batch_idx
  on public.family_canonicalization_decisions(reconciliation_batch_id)
  where reconciliation_batch_id is not null;

create table if not exists public.family_reconciliation_rollback_manifests (
  id uuid primary key default gen_random_uuid(),
  reconciliation_batch_id uuid not null references public.family_reconciliation_batches(id) on delete restrict,
  manifest_version integer not null default 1,
  payload_hash text not null,
  verification_status text not null default 'pending',
  rollback_status text not null default 'not_requested',
  affected_family_records_before jsonb not null default '[]'::jsonb,
  parent_memberships_before jsonb not null default '[]'::jsonb,
  child_memberships_before jsonb not null default '[]'::jsonb,
  couple_links_before jsonb not null default '[]'::jsonb,
  layout_refs_before jsonb not null default '[]'::jsonb,
  canonical_family_choice jsonb not null default '{}'::jsonb,
  merged_family_ids uuid[] not null default array[]::uuid[],
  voided_family_ids uuid[] not null default array[]::uuid[],
  audit_revision_ids uuid[] not null default array[]::uuid[],
  verification_details jsonb not null default '{}'::jsonb,
  rollback_details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  created_by uuid references public.profiles(id) on delete set null,
  updated_at timestamptz not null default timezone('utc', now()),
  updated_by uuid references public.profiles(id) on delete set null,
  constraint family_reconciliation_rollback_manifests_batch_unique unique (
    reconciliation_batch_id
  ),
  constraint family_reconciliation_rollback_manifests_version_check check (
    manifest_version > 0
  ),
  constraint family_reconciliation_rollback_manifests_payload_hash_check check (
    payload_hash ~* '^[a-f0-9]{64}$'
  ),
  constraint family_reconciliation_rollback_manifests_verification_status_check check (
    verification_status in ('pending', 'verified', 'failed', 'blocked')
  ),
  constraint family_reconciliation_rollback_manifests_rollback_status_check check (
    rollback_status in (
      'not_requested',
      'ready',
      'running',
      'completed',
      'failed',
      'blocked'
    )
  ),
  constraint family_reconciliation_rollback_manifests_json_shape_check check (
    jsonb_typeof(affected_family_records_before) = 'array'
    and jsonb_typeof(parent_memberships_before) = 'array'
    and jsonb_typeof(child_memberships_before) = 'array'
    and jsonb_typeof(couple_links_before) = 'array'
    and jsonb_typeof(layout_refs_before) = 'array'
    and jsonb_typeof(canonical_family_choice) = 'object'
    and jsonb_typeof(verification_details) = 'object'
    and jsonb_typeof(rollback_details) = 'object'
  )
);

create index if not exists family_reconciliation_rollback_manifests_status_idx
  on public.family_reconciliation_rollback_manifests(
    verification_status,
    rollback_status,
    created_at desc
  );

alter table public.family_reconciliation_batches enable row level security;
alter table public.family_canonicalization_decisions enable row level security;
alter table public.family_reconciliation_rollback_manifests enable row level security;

drop policy if exists a17h_family_reconciliation_batches_select on public.family_reconciliation_batches;
create policy a17h_family_reconciliation_batches_select
  on public.family_reconciliation_batches
  for select
  to authenticated
  using (
    public.has_permission('relationships.view')
    or public.has_permission('permissions.manage')
  );

drop policy if exists a17h_family_reconciliation_batches_insert on public.family_reconciliation_batches;
create policy a17h_family_reconciliation_batches_insert
  on public.family_reconciliation_batches
  for insert
  to authenticated
  with check (
    public.has_permission('relationships.update')
    and public.has_permission('permissions.manage')
  );

drop policy if exists a17h_family_reconciliation_batches_update on public.family_reconciliation_batches;
create policy a17h_family_reconciliation_batches_update
  on public.family_reconciliation_batches
  for update
  to authenticated
  using (
    public.has_permission('relationships.update')
    and public.has_permission('permissions.manage')
  )
  with check (
    public.has_permission('relationships.update')
    and public.has_permission('permissions.manage')
  );

drop policy if exists a17h_family_canonicalization_decisions_select on public.family_canonicalization_decisions;
create policy a17h_family_canonicalization_decisions_select
  on public.family_canonicalization_decisions
  for select
  to authenticated
  using (
    public.has_permission('relationships.view')
    or public.has_permission('permissions.manage')
  );

drop policy if exists a17h_family_canonicalization_decisions_insert on public.family_canonicalization_decisions;
create policy a17h_family_canonicalization_decisions_insert
  on public.family_canonicalization_decisions
  for insert
  to authenticated
  with check (
    public.has_permission('relationships.update')
    and public.has_permission('permissions.manage')
  );

drop policy if exists a17h_family_canonicalization_decisions_update on public.family_canonicalization_decisions;
create policy a17h_family_canonicalization_decisions_update
  on public.family_canonicalization_decisions
  for update
  to authenticated
  using (
    public.has_permission('relationships.update')
    and public.has_permission('permissions.manage')
  )
  with check (
    public.has_permission('relationships.update')
    and public.has_permission('permissions.manage')
  );

drop policy if exists a17h_family_reconciliation_rollback_manifests_select on public.family_reconciliation_rollback_manifests;
create policy a17h_family_reconciliation_rollback_manifests_select
  on public.family_reconciliation_rollback_manifests
  for select
  to authenticated
  using (public.has_permission('permissions.manage'));

drop policy if exists a17h_family_reconciliation_rollback_manifests_insert on public.family_reconciliation_rollback_manifests;
create policy a17h_family_reconciliation_rollback_manifests_insert
  on public.family_reconciliation_rollback_manifests
  for insert
  to authenticated
  with check (
    public.has_permission('relationships.update')
    and public.has_permission('permissions.manage')
  );

drop policy if exists a17h_family_reconciliation_rollback_manifests_update on public.family_reconciliation_rollback_manifests;
create policy a17h_family_reconciliation_rollback_manifests_update
  on public.family_reconciliation_rollback_manifests
  for update
  to authenticated
  using (
    public.has_permission('relationships.update')
    and public.has_permission('permissions.manage')
  )
  with check (
    public.has_permission('relationships.update')
    and public.has_permission('permissions.manage')
  );

revoke all on table public.family_reconciliation_batches from anon;
revoke all on table public.family_reconciliation_batches from public;
revoke all on table public.family_canonicalization_decisions from anon;
revoke all on table public.family_canonicalization_decisions from public;
revoke all on table public.family_reconciliation_rollback_manifests from anon;
revoke all on table public.family_reconciliation_rollback_manifests from public;
