# Phase 114-117 - Vietnamese Genealogy Domain UI Integration

Status: `COMPLETED_LOCAL_STATIC_VALIDATED`

## Summary

Grouped Phase 114-117 integrates the verified Vietnamese genealogy lineage tables into the main app as lightweight service and admin UI work.

This phase uses the Phase 113C manual SQL diagnostic PASS as its prerequisite. It does not create a migration, apply DB changes, run SQL mutation, seed data, backfill legacy people fields, deploy, create a Worker, change OpenNext/Wrangler config or add runtime dependencies.

- No migration created
- No DB apply
- No SQL mutation
- No seed/backfill

## Files changed

- `lib/family/lineage-types.ts`
- `lib/family/lineage-validation.ts`
- `lib/family/lineage-service.ts`
- `components/genealogy/lineage-admin.tsx`
- `components/genealogy/lineage-labels.ts`
- `app/(admin)/admin/genealogy/actions.ts`
- `app/(admin)/admin/genealogy/page.tsx`
- `app/(admin)/admin/genealogy/clans/page.tsx`
- `app/(admin)/admin/genealogy/branches/page.tsx`
- `app/(admin)/admin/genealogy/generation-rules/page.tsx`
- `app/(admin)/admin/genealogy/memberships/page.tsx`
- `app/(admin)/admin/people/[id]/page.tsx`
- `components/layout/admin-shell.tsx`
- `lib/family/tree-types.ts`
- `lib/family/tree-service.ts`
- `lib/family/tree-graph-builder.ts`
- `components/tree/family-node-card.tsx`
- `lib/privacy/privacy-service.ts`
- `scripts/check-vietnamese-genealogy-domain-ui.cjs`
- `package.json`

## Phase 114 service result

Added a lightweight lineage service for the four approved tables:

- `clans`
- `clan_branches`
- `generation_rules`
- `person_branch_memberships`

The service follows existing repo patterns:

- server-only service module
- admin Supabase helper on server
- permission checks before reads and mutations
- explicit `{ ok, data }` / `{ ok, error }` result shape
- validation helpers for form input
- revision logging for create/update operations

No fallback mock data was added. Serious DB errors are returned to the UI instead of silently becoming empty arrays.

## Phase 115 admin UI result

Added admin UI routes:

- `/admin/genealogy`
- `/admin/genealogy/clans`
- `/admin/genealogy/branches`
- `/admin/genealogy/generation-rules`
- `/admin/genealogy/memberships`

The UI supports lightweight create/update forms and list views for clans, branches, generation rules and memberships. Hard delete UI was not added.

## Phase 116 membership integration result

Person detail pages now show branch membership data and provide an explicit membership assignment form when the user has an existing manage permission.

The membership form supports:

- clan
- branch
- generation rule
- generation number
- membership type
- primary membership
- visibility
- source note
- generation override reason

No automatic backfill from `people.branch_name` or `people.generation_number` is performed.

## Phase 117 privacy/tree/public result

Admin tree data now includes lineage membership metadata and the node card can display clan/branch/generation details when present.

Public routes do not query the new lineage tables in this phase. The privacy service was hardened so if lineage fields are present in a future public graph, public mode only keeps them when the lineage visibility is `public` and the person is not living. Private/family lineage membership data is not exposed to public clients.

## Permissions used

Read:

- `people.view`
- `tree.view`

Manage:

- `people.update`
- `relationships.update`
- `tree.edit_layout`
- `settings.manage`

No new permission rows were created.

## Privacy/RLS notes

RLS remains enforced by the database policies recorded in Phase 111 and verified by Phase 113C owner/operator manual SQL diagnostic.

Runtime reads and mutations remain server-side. No service role key is sent to the client. No private lineage membership data is intentionally exposed on public routes.

## Export/import deferred notes

Export/import/GEDCOM/ZIP integration for lineage tables is deferred to future boundary-governed phases. This phase does not change JSON/GEDCOM/ZIP export or import behavior.

## Worker/runtime impact

- Main Worker touched: YES, lightweight admin CRUD/UI only
- Runtime dependency added: NO
- New service Worker created: NO
- OpenNext/Wrangler config changed: NO
- Worker size risk: LOW
- Service boundary recommendation: keep export/import/media/data-quality heavy work deferred to the existing boundary roadmap

## Validation result

Validation commands run:

- `npm run check:vietnamese-genealogy-manual-sql-diagnostic-pass`
- `npm run check:vietnamese-genealogy-domain-ui`
- `npm run check:vietnamese-genealogy-domain`
- `npm run check:vietnamese-genealogy-schema-candidate`
- `npm run check:vietnamese-genealogy-first-migration-scope`
- `npm run check:vietnamese-genealogy-real-migration-file`
- `npm run check:vietnamese-genealogy-migration-apply-readiness`
- `npm run check:vietnamese-genealogy-migration-apply-execution`
- `npm run check:vietnamese-genealogy-manual-apply-verification`
- `npm run check:vietnamese-genealogy-verification-diagnostic`
- `npm run check:env:safe`
- `npm run check:migrations`
- `npm run typecheck`
- `npm run lint`
- `npm run build`
- `git diff --check`
- `git diff --cached --check`
- `git status --short`

Results:

- Phase 103-117 Vietnamese genealogy static checkers: PASS
- `npm run check:env:safe`: PASS
- `npm run check:migrations`: PASS
- `npm run typecheck`: PASS
- `npm run lint`: PASS
- `npm run build`: PASS in a clean temp copy of the current working tree with `.next`, env files and `PLANNING.MD` excluded
- Workspace-root `npm run build`: BLOCKED by pre-existing Windows `.next` artifact ACL, `EPERM: operation not permitted, unlink 'D:\CODE\GIA PHẢ\.next\build\56416d4ae4ce586f.js'`
- `git diff --check`: PASS
- `git diff --cached --check`: PASS

Final command results are also recorded in `docs/08_AI_WORK_LOG.md` and `docs/99_NEXT_AI_HANDOFF.md`.

## Remaining limitations

- No dedicated lineage permission exists yet; this phase uses existing approved permissions from the migration policies.
- Public lineage display is intentionally conservative and does not query lineage tables directly.
- Export/import of lineage metadata is deferred.
- No delete UI is included for lineage records.
- No automatic generation computation is included.

## Next recommended phase

Recommended next phase: Phase 118A Media Domain and Storage Boundary Design, or a focused Phase 117A UX polish pass for genealogy admin forms if the owner wants friendlier selectors before media planning.
