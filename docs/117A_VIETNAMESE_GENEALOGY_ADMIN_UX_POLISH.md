# Phase 117A - Vietnamese Genealogy Admin UX Polish

Status: `COMPLETED_LOCAL_STATIC_VALIDATED`

## Summary

Phase 117A polishes the grouped Phase 114-117 Vietnamese genealogy admin surfaces after the lineage service/UI integration commit `22aff0f28e3f361a13e79cca831dd7935eb7ac45`.

This phase stays inside the already-approved lightweight main app UI/service boundary. It does not create migrations, apply DB changes, run SQL mutation, seed data, backfill legacy people fields, add media/storage/export/import work, create Workers, change OpenNext/Wrangler config, add runtime dependencies, deploy or push.

## UX Polish Changes

- Vietnamese genealogy admin dashboard copy now uses clearer Vietnamese labels for dòng họ, chi, quy tắc đời and gắn thành viên.
- Saved messages are mapped from internal action codes to user-facing Vietnamese confirmations.
- Empty states now include clearer next-step actions, such as creating a clan before branches/rules or opening the people list before assigning memberships.
- Admin tree node cards now label lineage display as `Dòng họ` and `Chi`, and prefer lineage branch data when present.

## Validation/Form Changes

- Lineage form labels, placeholders and helper text were polished for clan, branch, generation rule and membership forms.
- Required field validation now returns Vietnamese messages.
- Duplicate/unique and foreign-key action failures are mapped to clearer user-facing messages before redirect.
- Submit buttons now use `useFormStatus` to show a pending label and prevent double-submit while the server action is running.

## Person Membership UX Changes

- Person detail lineage section now uses Vietnamese copy and explains that memberships are explicit lineage-table records.
- If no clan exists, the person detail assignment area gives a clear prerequisite message instead of leaving the form feeling broken.
- Membership list rows link back to the member profile and admin tree.

## Tree Display Changes

- Admin tree cards show lineage clan/branch data lightly and do not change React Flow, ELK, query scope or layout persistence.
- Missing lineage data remains safe; the card falls back to existing branch display when lineage branch metadata is absent.

## Public Privacy Notes

- Public routes still do not query lineage tables in this phase.
- Public sanitizer behavior from Phase 114-117 remains intact: lineage fields are cleared in public mode unless lineage visibility is `public` and the person is not living.
- `source_note`, private/family-only membership data and hidden membership data are not exposed to public routes.

## Worker/Runtime Impact

- Main Worker touched: YES, lightweight admin UI polish only
- Runtime dependency added: NO
- New service Worker created: NO
- OpenNext/Wrangler config changed: NO
- Worker size risk: LOW
- Service boundary recommendation: keep media/storage/export/import/GEDCOM/ZIP/data-quality work deferred to boundary-governed future phases

## Explicitly Deferred Items

- No migration
- No DB apply
- No SQL mutation
- No seed/backfill
- No media/upload/storage
- No large export/import/GEDCOM/ZIP
- No Worker creation
- No OpenNext/Wrangler config change
- No runtime dependency addition
- No deploy
- No push

## Validation Results

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

- Phase 103-117A Vietnamese genealogy static checkers: PASS
- `npm run check:env:safe`: PASS
- `npm run check:migrations`: PASS
- `npm run typecheck`: PASS
- `npm run lint`: PASS
- `npm run build`: PASS in a clean temp copy of the current working tree with `.next`, env files and `PLANNING.MD` excluded
- Workspace-root `npm run build`: BLOCKED by pre-existing Windows `.next` artifact ACL, `EPERM: operation not permitted, unlink 'D:\CODE\GIA PHẢ\.next\build\56416d4ae4ce586f.js'`
- `git diff --check`: PASS
- `git diff --cached --check`: PASS

Final command results are also recorded in `docs/08_AI_WORK_LOG.md` and `docs/99_NEXT_AI_HANDOFF.md`.

## Next Recommended Phase

Recommended next phase: Phase 118A Media Domain and Storage Boundary Design.
