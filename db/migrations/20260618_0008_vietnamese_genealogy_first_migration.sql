-- Phase 111 Vietnamese genealogy first real migration file.
-- VIETNAMESE_GENEALOGY_PHASE_111_REAL_MIGRATION
-- OWNER_APPROVED_FILE_CREATION_ONLY
-- DO_NOT_APPLY_WITHOUT_SEPARATE_PHASE_113_APPROVAL
-- Additive-only: creates lineage metadata tables only. No DB apply, seed,
-- people backfill, runtime change, Worker change, or deploy is authorized here.

create table if not exists public.clans (
  id uuid primary key default gen_random_uuid(),
  clan_code text not null,
  clan_name text not null,
  family_name text,
  origin_place text,
  founder_person_id uuid references public.people(id) on delete set null,
  current_head_person_id uuid references public.people(id) on delete set null,
  description text,
  visibility text not null default 'family',
  created_at timestamptz not null default now(),
  created_by uuid references public.profiles(id) on delete set null,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles(id) on delete set null,
  deleted_at timestamptz,
  deleted_by uuid references public.profiles(id) on delete set null,
  delete_reason text,
  constraint clans_code_not_blank check (length(btrim(clan_code)) > 0),
  constraint clans_name_not_blank check (length(btrim(clan_name)) > 0),
  constraint clans_visibility_check check (
    visibility in ('public', 'family', 'private')
  )
);

create table if not exists public.clan_branches (
  id uuid primary key default gen_random_uuid(),
  clan_id uuid not null references public.clans(id) on delete restrict,
  parent_branch_id uuid references public.clan_branches(id) on delete restrict,
  branch_code text not null,
  branch_name text not null,
  branch_level integer not null default 1,
  sort_order integer not null default 0,
  founder_person_id uuid references public.people(id) on delete set null,
  head_person_id uuid references public.people(id) on delete set null,
  representative_person_id uuid references public.people(id) on delete set null,
  description text,
  visibility text not null default 'family',
  created_at timestamptz not null default now(),
  created_by uuid references public.profiles(id) on delete set null,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles(id) on delete set null,
  deleted_at timestamptz,
  deleted_by uuid references public.profiles(id) on delete set null,
  delete_reason text,
  constraint clan_branches_code_not_blank check (length(btrim(branch_code)) > 0),
  constraint clan_branches_name_not_blank check (length(btrim(branch_name)) > 0),
  constraint clan_branches_level_check check (branch_level >= 1),
  constraint clan_branches_not_own_parent_check check (
    parent_branch_id is null or parent_branch_id <> id
  ),
  constraint clan_branches_visibility_check check (
    visibility in ('public', 'family', 'private')
  ),
  unique (id, clan_id)
);

create table if not exists public.generation_rules (
  id uuid primary key default gen_random_uuid(),
  clan_id uuid not null references public.clans(id) on delete restrict,
  branch_id uuid,
  root_person_id uuid references public.people(id) on delete set null,
  start_generation integer not null default 1,
  numbering_method text not null default 'root_is_one',
  adopted_child_policy text not null default 'family_decision',
  step_child_policy text not null default 'not_bloodline_by_default',
  spouse_display_policy text not null default 'spouse_of_generation',
  notes text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  created_by uuid references public.profiles(id) on delete set null,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles(id) on delete set null,
  deleted_at timestamptz,
  deleted_by uuid references public.profiles(id) on delete set null,
  delete_reason text,
  constraint generation_rules_branch_same_clan_fk
    foreign key (branch_id, clan_id)
    references public.clan_branches(id, clan_id)
    on delete restrict,
  constraint generation_rules_start_generation_check check (start_generation >= 1),
  constraint generation_rules_numbering_method_check check (
    numbering_method in ('root_is_one', 'root_is_zero', 'manual')
  ),
  constraint generation_rules_adopted_policy_check check (
    adopted_child_policy in (
      'family_decision',
      'count_as_bloodline',
      'display_only',
      'exclude_from_generation'
    )
  ),
  constraint generation_rules_step_policy_check check (
    step_child_policy in (
      'not_bloodline_by_default',
      'family_decision',
      'display_only',
      'exclude_from_generation'
    )
  ),
  constraint generation_rules_spouse_policy_check check (
    spouse_display_policy in (
      'spouse_of_generation',
      'same_generation_display',
      'hide_generation',
      'family_decision'
    )
  )
);

create table if not exists public.person_branch_memberships (
  id uuid primary key default gen_random_uuid(),
  person_id uuid not null references public.people(id) on delete restrict,
  clan_id uuid not null references public.clans(id) on delete restrict,
  branch_id uuid,
  generation_rule_id uuid references public.generation_rules(id) on delete set null,
  generation_number integer,
  generation_override_reason text,
  membership_type text not null default 'bloodline',
  is_primary boolean not null default true,
  sort_order integer not null default 0,
  source_note text,
  visibility text not null default 'family',
  created_at timestamptz not null default now(),
  created_by uuid references public.profiles(id) on delete set null,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles(id) on delete set null,
  deleted_at timestamptz,
  deleted_by uuid references public.profiles(id) on delete set null,
  delete_reason text,
  constraint person_branch_memberships_branch_same_clan_fk
    foreign key (branch_id, clan_id)
    references public.clan_branches(id, clan_id)
    on delete restrict,
  constraint person_branch_memberships_generation_check check (
    generation_number is null or generation_number >= 1
  ),
  constraint person_branch_memberships_type_check check (
    membership_type in (
      'bloodline',
      'spouse',
      'adopted',
      'step',
      'in_law',
      'unknown'
    )
  ),
  constraint person_branch_memberships_visibility_check check (
    visibility in ('public', 'family', 'private')
  )
);

create unique index if not exists clans_active_code_unique
on public.clans (lower(clan_code))
where deleted_at is null;

create index if not exists clans_family_name_idx
on public.clans (family_name)
where deleted_at is null;

create index if not exists clans_visibility_idx
on public.clans (visibility)
where deleted_at is null;

create unique index if not exists clan_branches_active_code_per_clan_unique
on public.clan_branches (clan_id, lower(branch_code))
where deleted_at is null;

create index if not exists clan_branches_clan_idx
on public.clan_branches (clan_id)
where deleted_at is null;

create index if not exists clan_branches_parent_idx
on public.clan_branches (parent_branch_id)
where deleted_at is null;

create index if not exists generation_rules_clan_branch_idx
on public.generation_rules (clan_id, branch_id)
where deleted_at is null;

create index if not exists generation_rules_root_person_idx
on public.generation_rules (root_person_id)
where deleted_at is null;

create index if not exists person_branch_memberships_person_idx
on public.person_branch_memberships (person_id)
where deleted_at is null;

create index if not exists person_branch_memberships_clan_branch_idx
on public.person_branch_memberships (clan_id, branch_id)
where deleted_at is null;

create unique index if not exists person_branch_memberships_active_primary_person_unique
on public.person_branch_memberships (person_id)
where is_primary is true and deleted_at is null;

drop trigger if exists clans_set_updated_at on public.clans;
create trigger clans_set_updated_at
before update on public.clans
for each row
execute function public.set_updated_at();

drop trigger if exists clan_branches_set_updated_at on public.clan_branches;
create trigger clan_branches_set_updated_at
before update on public.clan_branches
for each row
execute function public.set_updated_at();

drop trigger if exists generation_rules_set_updated_at on public.generation_rules;
create trigger generation_rules_set_updated_at
before update on public.generation_rules
for each row
execute function public.set_updated_at();

drop trigger if exists person_branch_memberships_set_updated_at
on public.person_branch_memberships;
create trigger person_branch_memberships_set_updated_at
before update on public.person_branch_memberships
for each row
execute function public.set_updated_at();

alter table public.clans enable row level security;
alter table public.clan_branches enable row level security;
alter table public.generation_rules enable row level security;
alter table public.person_branch_memberships enable row level security;

drop policy if exists "lineage viewers can read active clans" on public.clans;
create policy "lineage viewers can read active clans"
on public.clans
for select
to authenticated
using (
  deleted_at is null
  and (
    public.has_permission('people.view')
    or public.has_permission('tree.view')
  )
);

drop policy if exists "lineage maintainers can insert clans" on public.clans;
create policy "lineage maintainers can insert clans"
on public.clans
for insert
to authenticated
with check (
  public.has_permission('people.update')
  or public.has_permission('relationships.update')
  or public.has_permission('tree.edit_layout')
  or public.has_permission('settings.manage')
);

drop policy if exists "lineage maintainers can update clans" on public.clans;
create policy "lineage maintainers can update clans"
on public.clans
for update
to authenticated
using (
  public.has_permission('people.update')
  or public.has_permission('relationships.update')
  or public.has_permission('tree.edit_layout')
  or public.has_permission('settings.manage')
)
with check (
  public.has_permission('people.update')
  or public.has_permission('relationships.update')
  or public.has_permission('tree.edit_layout')
  or public.has_permission('settings.manage')
);

drop policy if exists "lineage viewers can read active clan branches"
on public.clan_branches;
create policy "lineage viewers can read active clan branches"
on public.clan_branches
for select
to authenticated
using (
  deleted_at is null
  and (
    public.has_permission('people.view')
    or public.has_permission('tree.view')
  )
);

drop policy if exists "lineage maintainers can insert clan branches"
on public.clan_branches;
create policy "lineage maintainers can insert clan branches"
on public.clan_branches
for insert
to authenticated
with check (
  public.has_permission('people.update')
  or public.has_permission('relationships.update')
  or public.has_permission('tree.edit_layout')
  or public.has_permission('settings.manage')
);

drop policy if exists "lineage maintainers can update clan branches"
on public.clan_branches;
create policy "lineage maintainers can update clan branches"
on public.clan_branches
for update
to authenticated
using (
  public.has_permission('people.update')
  or public.has_permission('relationships.update')
  or public.has_permission('tree.edit_layout')
  or public.has_permission('settings.manage')
)
with check (
  public.has_permission('people.update')
  or public.has_permission('relationships.update')
  or public.has_permission('tree.edit_layout')
  or public.has_permission('settings.manage')
);

drop policy if exists "lineage viewers can read active generation rules"
on public.generation_rules;
create policy "lineage viewers can read active generation rules"
on public.generation_rules
for select
to authenticated
using (
  deleted_at is null
  and (
    public.has_permission('people.view')
    or public.has_permission('tree.view')
  )
);

drop policy if exists "lineage maintainers can insert generation rules"
on public.generation_rules;
create policy "lineage maintainers can insert generation rules"
on public.generation_rules
for insert
to authenticated
with check (
  public.has_permission('people.update')
  or public.has_permission('relationships.update')
  or public.has_permission('tree.edit_layout')
  or public.has_permission('settings.manage')
);

drop policy if exists "lineage maintainers can update generation rules"
on public.generation_rules;
create policy "lineage maintainers can update generation rules"
on public.generation_rules
for update
to authenticated
using (
  public.has_permission('people.update')
  or public.has_permission('relationships.update')
  or public.has_permission('tree.edit_layout')
  or public.has_permission('settings.manage')
)
with check (
  public.has_permission('people.update')
  or public.has_permission('relationships.update')
  or public.has_permission('tree.edit_layout')
  or public.has_permission('settings.manage')
);

drop policy if exists "lineage viewers can read active person branch memberships"
on public.person_branch_memberships;
create policy "lineage viewers can read active person branch memberships"
on public.person_branch_memberships
for select
to authenticated
using (
  deleted_at is null
  and (
    public.has_permission('people.view')
    or public.has_permission('tree.view')
  )
);

drop policy if exists "lineage maintainers can insert person branch memberships"
on public.person_branch_memberships;
create policy "lineage maintainers can insert person branch memberships"
on public.person_branch_memberships
for insert
to authenticated
with check (
  public.has_permission('people.update')
  or public.has_permission('relationships.update')
  or public.has_permission('tree.edit_layout')
  or public.has_permission('settings.manage')
);

drop policy if exists "lineage maintainers can update person branch memberships"
on public.person_branch_memberships;
create policy "lineage maintainers can update person branch memberships"
on public.person_branch_memberships
for update
to authenticated
using (
  public.has_permission('people.update')
  or public.has_permission('relationships.update')
  or public.has_permission('tree.edit_layout')
  or public.has_permission('settings.manage')
)
with check (
  public.has_permission('people.update')
  or public.has_permission('relationships.update')
  or public.has_permission('tree.edit_layout')
  or public.has_permission('settings.manage')
);
