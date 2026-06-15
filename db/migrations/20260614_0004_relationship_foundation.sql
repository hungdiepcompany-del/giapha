-- Phase 4 relationship CRUD foundation for WEB GIA PHA.
-- Relationship data stays in dedicated tables instead of people.father_id,
-- people.mother_id, or people.spouse_id. All write flows are soft-delete
-- capable and RLS is enabled from the start.

create table if not exists public.families (
  id uuid primary key default gen_random_uuid(),
  family_code text unique,
  family_label text,
  visibility text not null default 'family',
  notes text,
  created_at timestamptz not null default now(),
  created_by uuid references public.profiles(id) on delete set null,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles(id) on delete set null,
  deleted_at timestamptz,
  deleted_by uuid references public.profiles(id) on delete set null,
  delete_reason text,
  constraint families_visibility_check check (
    visibility in ('public', 'family', 'private')
  )
);

create table if not exists public.family_parents (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete restrict,
  person_id uuid not null references public.people(id) on delete restrict,
  parent_role text not null default 'unknown',
  relationship_type text not null default 'unknown',
  sort_order integer not null default 0,
  notes text,
  created_at timestamptz not null default now(),
  created_by uuid references public.profiles(id) on delete set null,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles(id) on delete set null,
  deleted_at timestamptz,
  deleted_by uuid references public.profiles(id) on delete set null,
  delete_reason text,
  constraint family_parents_parent_role_check check (
    parent_role in ('father', 'mother', 'parent', 'unknown')
  ),
  constraint family_parents_relationship_type_check check (
    relationship_type in ('biological', 'adoptive', 'step', 'guardian', 'unknown')
  )
);

create table if not exists public.family_children (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete restrict,
  person_id uuid not null references public.people(id) on delete restrict,
  child_relationship_type text not null default 'biological',
  sort_order integer not null default 0,
  notes text,
  created_at timestamptz not null default now(),
  created_by uuid references public.profiles(id) on delete set null,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles(id) on delete set null,
  deleted_at timestamptz,
  deleted_by uuid references public.profiles(id) on delete set null,
  delete_reason text,
  constraint family_children_relationship_type_check check (
    child_relationship_type in (
      'biological',
      'adoptive',
      'step',
      'foster',
      'unknown'
    )
  )
);

create table if not exists public.couple_relationships (
  id uuid primary key default gen_random_uuid(),
  person1_id uuid not null references public.people(id) on delete restrict,
  person2_id uuid not null references public.people(id) on delete restrict,
  relationship_status text not null default 'unknown',
  start_date date,
  start_date_precision text,
  end_date date,
  end_date_precision text,
  family_id uuid references public.families(id) on delete set null,
  visibility text not null default 'family',
  notes text,
  created_at timestamptz not null default now(),
  created_by uuid references public.profiles(id) on delete set null,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles(id) on delete set null,
  deleted_at timestamptz,
  deleted_by uuid references public.profiles(id) on delete set null,
  delete_reason text,
  constraint couple_relationships_distinct_people check (person1_id <> person2_id),
  constraint couple_relationships_status_check check (
    relationship_status in (
      'married',
      'partner',
      'engaged',
      'divorced',
      'separated',
      'widowed',
      'unknown'
    )
  ),
  constraint couple_relationships_start_precision_check check (
    start_date_precision is null
      or start_date_precision in (
        'exact',
        'year_month',
        'year',
        'approximate',
        'unknown'
      )
  ),
  constraint couple_relationships_end_precision_check check (
    end_date_precision is null
      or end_date_precision in (
        'exact',
        'year_month',
        'year',
        'approximate',
        'unknown'
      )
  ),
  constraint couple_relationships_visibility_check check (
    visibility in ('public', 'family', 'private')
  )
);

create index if not exists families_deleted_at_idx
on public.families (deleted_at);

create unique index if not exists family_parents_active_unique
on public.family_parents (family_id, person_id)
where deleted_at is null;

create index if not exists family_parents_person_idx
on public.family_parents (person_id)
where deleted_at is null;

create unique index if not exists family_children_active_unique
on public.family_children (family_id, person_id)
where deleted_at is null;

create index if not exists family_children_person_idx
on public.family_children (person_id)
where deleted_at is null;

create unique index if not exists couple_relationships_active_pair_unique
on public.couple_relationships (
  least(person1_id::text, person2_id::text),
  greatest(person1_id::text, person2_id::text),
  relationship_status
)
where deleted_at is null;

create index if not exists couple_relationships_person1_idx
on public.couple_relationships (person1_id)
where deleted_at is null;

create index if not exists couple_relationships_person2_idx
on public.couple_relationships (person2_id)
where deleted_at is null;

drop trigger if exists families_set_updated_at on public.families;
create trigger families_set_updated_at
before update on public.families
for each row
execute function public.set_updated_at();

drop trigger if exists family_parents_set_updated_at on public.family_parents;
create trigger family_parents_set_updated_at
before update on public.family_parents
for each row
execute function public.set_updated_at();

drop trigger if exists family_children_set_updated_at on public.family_children;
create trigger family_children_set_updated_at
before update on public.family_children
for each row
execute function public.set_updated_at();

drop trigger if exists couple_relationships_set_updated_at on public.couple_relationships;
create trigger couple_relationships_set_updated_at
before update on public.couple_relationships
for each row
execute function public.set_updated_at();

alter table public.families enable row level security;
alter table public.family_parents enable row level security;
alter table public.family_children enable row level security;
alter table public.couple_relationships enable row level security;

drop policy if exists "relationship viewers can read active families" on public.families;
create policy "relationship viewers can read active families"
on public.families
for select
to authenticated
using (
  deleted_at is null
  and public.has_permission('relationships.view')
);

drop policy if exists "relationship creators can insert families" on public.families;
create policy "relationship creators can insert families"
on public.families
for insert
to authenticated
with check (public.has_permission('relationships.create'));

drop policy if exists "relationship maintainers can update families" on public.families;
create policy "relationship maintainers can update families"
on public.families
for update
to authenticated
using (
  public.has_permission('relationships.update')
  or public.has_permission('relationships.delete')
)
with check (
  public.has_permission('relationships.update')
  or public.has_permission('relationships.delete')
);

drop policy if exists "relationship viewers can read active parents" on public.family_parents;
create policy "relationship viewers can read active parents"
on public.family_parents
for select
to authenticated
using (
  deleted_at is null
  and public.has_permission('relationships.view')
);

drop policy if exists "relationship creators can insert parents" on public.family_parents;
create policy "relationship creators can insert parents"
on public.family_parents
for insert
to authenticated
with check (public.has_permission('relationships.create'));

drop policy if exists "relationship maintainers can update parents" on public.family_parents;
create policy "relationship maintainers can update parents"
on public.family_parents
for update
to authenticated
using (
  public.has_permission('relationships.update')
  or public.has_permission('relationships.delete')
)
with check (
  public.has_permission('relationships.update')
  or public.has_permission('relationships.delete')
);

drop policy if exists "relationship viewers can read active children" on public.family_children;
create policy "relationship viewers can read active children"
on public.family_children
for select
to authenticated
using (
  deleted_at is null
  and public.has_permission('relationships.view')
);

drop policy if exists "relationship creators can insert children" on public.family_children;
create policy "relationship creators can insert children"
on public.family_children
for insert
to authenticated
with check (public.has_permission('relationships.create'));

drop policy if exists "relationship maintainers can update children" on public.family_children;
create policy "relationship maintainers can update children"
on public.family_children
for update
to authenticated
using (
  public.has_permission('relationships.update')
  or public.has_permission('relationships.delete')
)
with check (
  public.has_permission('relationships.update')
  or public.has_permission('relationships.delete')
);

drop policy if exists "relationship viewers can read active couples" on public.couple_relationships;
create policy "relationship viewers can read active couples"
on public.couple_relationships
for select
to authenticated
using (
  deleted_at is null
  and public.has_permission('relationships.view')
);

drop policy if exists "relationship creators can insert couples" on public.couple_relationships;
create policy "relationship creators can insert couples"
on public.couple_relationships
for insert
to authenticated
with check (public.has_permission('relationships.create'));

drop policy if exists "relationship maintainers can update couples" on public.couple_relationships;
create policy "relationship maintainers can update couples"
on public.couple_relationships
for update
to authenticated
using (
  public.has_permission('relationships.update')
  or public.has_permission('relationships.delete')
)
with check (
  public.has_permission('relationships.update')
  or public.has_permission('relationships.delete')
);

drop policy if exists "revision viewers can read relationship revisions" on public.revisions;
create policy "revision viewers can read relationship revisions"
on public.revisions
for select
to authenticated
using (
  entity_type in (
    'families',
    'family_parents',
    'family_children',
    'couple_relationships'
  )
  and public.has_permission('revisions.view')
);

drop policy if exists "revision viewers can read relationship revision items" on public.revision_items;
create policy "revision viewers can read relationship revision items"
on public.revision_items
for select
to authenticated
using (
  exists (
    select 1
    from public.revisions r
    where r.id = revision_items.revision_id
      and r.entity_type in (
        'families',
        'family_parents',
        'family_children',
        'couple_relationships'
      )
      and public.has_permission('revisions.view')
  )
);
