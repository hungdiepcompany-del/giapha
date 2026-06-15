-- Phase 6 tree layout foundation for WEB GIA PHA.
-- Layout tables store UI positions only. They do not replace relationship
-- data in people/families/family_parents/family_children/couple_relationships.

create table if not exists public.tree_layouts (
  id uuid primary key default gen_random_uuid(),
  layout_code text unique,
  layout_name text not null,
  layout_scope text not null default 'admin',
  is_default boolean not null default false,
  description text,
  created_at timestamptz not null default now(),
  created_by uuid references public.profiles(id) on delete set null,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles(id) on delete set null,
  deleted_at timestamptz,
  deleted_by uuid references public.profiles(id) on delete set null,
  delete_reason text,
  constraint tree_layouts_name_not_blank check (length(btrim(layout_name)) > 0),
  constraint tree_layouts_scope_check check (
    layout_scope in ('admin', 'family', 'public', 'custom')
  )
);

create table if not exists public.tree_layout_nodes (
  id uuid primary key default gen_random_uuid(),
  layout_id uuid not null references public.tree_layouts(id) on delete cascade,
  node_id text not null,
  node_kind text not null,
  person_id uuid references public.people(id) on delete set null,
  family_id uuid references public.families(id) on delete set null,
  x numeric not null,
  y numeric not null,
  is_locked boolean not null default false,
  is_collapsed boolean not null default false,
  style_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  created_by uuid references public.profiles(id) on delete set null,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles(id) on delete set null,
  deleted_at timestamptz,
  deleted_by uuid references public.profiles(id) on delete set null,
  delete_reason text,
  constraint tree_layout_nodes_node_id_not_blank check (length(btrim(node_id)) > 0),
  constraint tree_layout_nodes_kind_check check (node_kind in ('person', 'family')),
  constraint tree_layout_nodes_person_or_family_check check (
    (node_kind = 'person' and person_id is not null and family_id is null)
    or (node_kind = 'family' and family_id is not null and person_id is null)
  )
);

create index if not exists tree_layouts_scope_idx
on public.tree_layouts (layout_scope)
where deleted_at is null;

create unique index if not exists tree_layout_nodes_active_unique
on public.tree_layout_nodes (layout_id, node_id)
where deleted_at is null;

create index if not exists tree_layout_nodes_layout_idx
on public.tree_layout_nodes (layout_id)
where deleted_at is null;

drop trigger if exists tree_layouts_set_updated_at on public.tree_layouts;
create trigger tree_layouts_set_updated_at
before update on public.tree_layouts
for each row
execute function public.set_updated_at();

drop trigger if exists tree_layout_nodes_set_updated_at on public.tree_layout_nodes;
create trigger tree_layout_nodes_set_updated_at
before update on public.tree_layout_nodes
for each row
execute function public.set_updated_at();

alter table public.tree_layouts enable row level security;
alter table public.tree_layout_nodes enable row level security;

drop policy if exists "tree viewers can read active layouts" on public.tree_layouts;
create policy "tree viewers can read active layouts"
on public.tree_layouts
for select
to authenticated
using (
  deleted_at is null
  and public.has_permission('tree.view')
);

drop policy if exists "tree editors can insert layouts" on public.tree_layouts;
create policy "tree editors can insert layouts"
on public.tree_layouts
for insert
to authenticated
with check (public.has_permission('tree.edit_layout'));

drop policy if exists "tree editors can update layouts" on public.tree_layouts;
create policy "tree editors can update layouts"
on public.tree_layouts
for update
to authenticated
using (public.has_permission('tree.edit_layout'))
with check (public.has_permission('tree.edit_layout'));

drop policy if exists "tree viewers can read active layout nodes" on public.tree_layout_nodes;
create policy "tree viewers can read active layout nodes"
on public.tree_layout_nodes
for select
to authenticated
using (
  deleted_at is null
  and public.has_permission('tree.view')
);

drop policy if exists "tree editors can insert layout nodes" on public.tree_layout_nodes;
create policy "tree editors can insert layout nodes"
on public.tree_layout_nodes
for insert
to authenticated
with check (public.has_permission('tree.edit_layout'));

drop policy if exists "tree editors can update layout nodes" on public.tree_layout_nodes;
create policy "tree editors can update layout nodes"
on public.tree_layout_nodes
for update
to authenticated
using (public.has_permission('tree.edit_layout'))
with check (public.has_permission('tree.edit_layout'));

drop policy if exists "revision viewers can read tree layout revisions" on public.revisions;
create policy "revision viewers can read tree layout revisions"
on public.revisions
for select
to authenticated
using (
  entity_type in ('tree_layouts', 'tree_layout_nodes')
  and public.has_permission('revisions.view')
);

drop policy if exists "revision viewers can read tree layout revision items" on public.revision_items;
create policy "revision viewers can read tree layout revision items"
on public.revision_items
for select
to authenticated
using (
  exists (
    select 1
    from public.revisions r
    where r.id = revision_items.revision_id
      and r.entity_type in ('tree_layouts', 'tree_layout_nodes')
      and public.has_permission('revisions.view')
  )
);
