-- Phase 3 people CRUD foundation for WEB GIA PHA.
-- This migration creates the people table plus minimal revision tables needed
-- to audit people create/update/delete/restore actions. RLS is enabled from
-- the start and no public-wide policy is added.

create extension if not exists "pgcrypto";

create table if not exists public.people (
  id uuid primary key default gen_random_uuid(),
  slug text unique,
  full_name text not null,
  display_name text,
  gender text,
  birth_date date,
  birth_date_precision text,
  death_date date,
  death_date_precision text,
  is_living boolean not null default true,
  birth_place text,
  home_town text,
  branch_name text,
  generation_number integer,
  short_bio text,
  notes_private text,
  visibility text not null default 'family',
  created_at timestamptz not null default now(),
  created_by uuid references public.profiles(id) on delete set null,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles(id) on delete set null,
  deleted_at timestamptz,
  deleted_by uuid references public.profiles(id) on delete set null,
  delete_reason text,
  constraint people_full_name_not_blank check (length(btrim(full_name)) > 0),
  constraint people_generation_positive check (
    generation_number is null or generation_number > 0
  ),
  constraint people_gender_check check (
    gender is null or gender in ('male', 'female', 'other', 'unknown')
  ),
  constraint people_birth_precision_check check (
    birth_date_precision is null
      or birth_date_precision in (
        'exact',
        'year_month',
        'year',
        'approximate',
        'unknown'
      )
  ),
  constraint people_death_precision_check check (
    death_date_precision is null
      or death_date_precision in (
        'exact',
        'year_month',
        'year',
        'approximate',
        'unknown'
      )
  ),
  constraint people_visibility_check check (
    visibility in ('public', 'family', 'private')
  )
);

create index if not exists people_full_name_idx on public.people using gin (
  to_tsvector('simple', coalesce(full_name, '') || ' ' || coalesce(display_name, ''))
);

create index if not exists people_visibility_idx on public.people (visibility);
create index if not exists people_is_living_idx on public.people (is_living);
create index if not exists people_deleted_at_idx on public.people (deleted_at);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists people_set_updated_at on public.people;
create trigger people_set_updated_at
before update on public.people
for each row
execute function public.set_updated_at();

create table if not exists public.revisions (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null,
  entity_id uuid not null,
  action text not null,
  before_json jsonb,
  after_json jsonb,
  changed_by uuid references public.profiles(id) on delete set null,
  changed_at timestamptz not null default now(),
  change_reason text,
  constraint revisions_entity_type_not_blank check (length(btrim(entity_type)) > 0),
  constraint revisions_action_check check (
    action in ('create', 'update', 'delete', 'restore')
  )
);

create index if not exists revisions_entity_idx on public.revisions (
  entity_type,
  entity_id,
  changed_at desc
);

create table if not exists public.revision_items (
  id uuid primary key default gen_random_uuid(),
  revision_id uuid not null references public.revisions(id) on delete cascade,
  field_name text,
  before_json jsonb,
  after_json jsonb,
  created_at timestamptz not null default now()
);

alter table public.people enable row level security;
alter table public.revisions enable row level security;
alter table public.revision_items enable row level security;

drop policy if exists "people viewers can read active people" on public.people;
create policy "people viewers can read active people"
on public.people
for select
to authenticated
using (
  deleted_at is null
  and public.has_permission('people.view')
);

drop policy if exists "people creators can insert people" on public.people;
create policy "people creators can insert people"
on public.people
for insert
to authenticated
with check (public.has_permission('people.create'));

drop policy if exists "people maintainers can update people" on public.people;
create policy "people maintainers can update people"
on public.people
for update
to authenticated
using (
  public.has_permission('people.update')
  or public.has_permission('people.delete')
  or public.has_permission('people.restore')
)
with check (
  public.has_permission('people.update')
  or public.has_permission('people.delete')
  or public.has_permission('people.restore')
);

drop policy if exists "revision viewers can read people revisions" on public.revisions;
create policy "revision viewers can read people revisions"
on public.revisions
for select
to authenticated
using (
  entity_type = 'people'
  and public.has_permission('revisions.view')
);

drop policy if exists "revision viewers can read people revision items" on public.revision_items;
create policy "revision viewers can read people revision items"
on public.revision_items
for select
to authenticated
using (
  exists (
    select 1
    from public.revisions r
    where r.id = revision_items.revision_id
      and r.entity_type = 'people'
      and public.has_permission('revisions.view')
  )
);

