# A-16BT - Secure public genealogy read boundary

Status:
`A16BT_STATUS=CANDIDATE_READY_NOT_APPLIED_OWNER_REVIEW_REQUIRED`.

Public access model:
`A16BT_PUBLIC_ACCESS_MODEL=COLUMN_LEVEL_GRANTS_PLUS_ANON_RLS`.

Private column exposure:
`A16BT_PRIVATE_COLUMN_EXPOSURE=BLOCKED`.

A-16R retry:
`A16R_IMPORT_RETRY_NEXT=NO`.

Deploy:
`A16BT_DEPLOY_REQUIRED=NO`.

Localhost smoke:
`A16BT_LOCALHOST_SMOKE=SAFE_SKIP_NO_ISOLATED_LOCAL_DB_NO_PRODUCTION_ROW_QUERY`.

## A-16BS applied evidence

`A16BS_MIGRATION_0020_APPLIED=YES_OWNER_MANUAL_APPLY`.

Applied immutable migration:
`db/migrations/20260711_0020_a16br_revisions_insert_rls_and_anon_grant_cleanup.sql`.

Immutable SHA256:
`A16BT_MIGRATION_0020_IMMUTABLE_SHA256=530129F27EAD748641C71D2C26718043D0B51639FC6104EFFC4B9D222550C0FC`.

A-16BS verification passed the RPC/import security checks and remained blocked
only by the missing secure public read policies for `people`, `families`,
`family_parents`, and `family_children`.

## Candidate files

- `A16BT_MIGRATION_0021=db/migrations/20260711_0021_a16bt_secure_public_genealogy_read_boundary.sql`
- `A16BT_SUPABASE_MIRROR=supabase/migrations/20260711_0021_a16bt_secure_public_genealogy_read_boundary.sql`
- `A16BT_VERIFICATION_SQL=db/checks/20260711_check_a16bt_secure_public_genealogy_read_boundary.sql`
- `A16BT_MIGRATION_0021_SHA256=A7277E8A682610447BEC8142564C1A94B5FDE1AB4726C76D7DDF8205486B5D2C`
- `A16BT_MIRROR_MATCH=BYTE_FOR_BYTE_REQUIRED_BY_CHECKER`

## Public routes and access path

Routes inspected:
`A16BT_PUBLIC_ROUTES_INSPECTED=/,/tree,/people/[slug],/admin/preview/public`.

Database access path:
`A16BT_PUBLIC_DB_ACCESS_PATH=SERVER_SIDE_SUPABASE_ANON_CLIENT_DIRECT_TABLE_SELECT`.

The public routes use `maybeCreateServerSupabaseClient()` with
`NEXT_PUBLIC_SUPABASE_ANON_KEY`, then query the public genealogy tables directly
through `lib/family/public-family-service.ts`.

## Public query column allowlist

`A16BT_PUBLIC_QUERY_PEOPLE_COLUMNS=id,slug,full_name,display_name,is_living,branch_name,generation_number,visibility,deleted_at`.

`A16BT_PUBLIC_QUERY_FAMILIES_COLUMNS=id,family_code,family_label,visibility,deleted_at`.

`A16BT_PUBLIC_QUERY_FAMILY_PARENTS_COLUMNS=id,family_id,person_id,parent_role,deleted_at`.

`A16BT_PUBLIC_QUERY_FAMILY_CHILDREN_COLUMNS=id,family_id,person_id,child_relationship_type,deleted_at`.

The public service no longer selects `notes_private`, full date fields, places,
short biography, private/admin notes, audit ownership fields, or soft-delete
actor/reason fields. Public birth/death years now remain null until a later
phase introduces dedicated public-safe year columns or a safe read view/RPC.

## Migration 0021 contract

Migration 0021 revokes broad table SELECT from `anon` and `PUBLIC` on:

- `public.people`
- `public.families`
- `public.family_parents`
- `public.family_children`

It then grants `anon` SELECT only on the explicit allowlisted columns above.
It does not grant broad table SELECT, does not grant SELECT to `PUBLIC`, does
not grant mutation privileges, and does not change authenticated or
`service_role` grants.

Anon RLS policies:

- `a16bt_public_people_select_active_public`: active public people only.
- `a16bt_public_families_select_active_public`: active public families only.
- `a16bt_public_family_parents_select_active_public_edges`: active edge whose
  referenced family and person are both active public rows.
- `a16bt_public_family_children_select_active_public_edges`: active edge whose
  referenced family and person are both active public rows.

Existing authenticated policies remain unchanged.

## Verification contract

The SELECT-only verification SQL checks:

- no broad anon table SELECT grant on the four public core tables;
- no broad PUBLIC table SELECT grant on the four public core tables;
- anon has all required column-level SELECT privileges;
- `forbidden_private_column_anon_grant_count=0`;
- `notes_private_anon_select_privilege=false`;
- no anon mutation grants;
- no PUBLIC mutation grants;
- all four anon SELECT policies exist with active/public predicates;
- existing authenticated policies remain unchanged;
- no anon/PUBLIC write policies exist;
- all four tables retain RLS enabled;
- A-16BR revisions INSERT policy remains unchanged;
- RPC remains SECURITY INVOKER;
- no automatic import trigger exists;
- final boolean `a16bt_secure_public_genealogy_read_boundary_verified=true`.

## Safety

- `A16BT_SQL_EXECUTED_BY_CODEX=NO`
- `A16BT_MIGRATION_0021_APPLIED=NO`
- `A16BT_SUPABASE_DB_PUSH_RUN=NO`
- `A16BT_MIGRATION_REPAIR_RUN=NO`
- `A16BT_PRODUCTION_ROW_QUERY_RUN=NO`
- `A16BT_POST_OFFICIAL_IMPORT_CALLED=NO`
- `A16BT_IMPORT_RPC_CALLED=NO`
- `A16BT_DEPLOY_RUN=NO`
- `A16R_IMPORT_RETRY_NEXT=NO`

## Worker boundary

- Main Worker touched: YES
- Runtime dependency added: NO
- New service Worker created: NO
- OpenNext/Wrangler config changed: NO
- Worker size risk: NO
- Service boundary recommendation: NONE
