# UI-VN-01 - Vietnamese UI Copy Normalization

Status: `PASS_LOCAL_STATIC`

## Summary

UI-VN-01 normalizes user-visible UI copy to Vietnamese with diacritics across
admin/public genealogy surfaces, import/export preview, revisions, system
status, backup dry-run and tree editing controls.

This phase is copy-only and checker-only. It does not authorize schema,
migration, database apply, runtime expansion, Worker, dependency, deploy or push
work.

## UI Text Normalized

- Admin navigation and dashboard labels now use Vietnamese display copy.
- Public tree/profile/home copy now uses Vietnamese labels for public mode.
- People, relationships, tree viewer/editor, import/export, revisions and system
  status page headings now avoid English foundation labels.
- Service/user-facing error messages for lineage, import preview, relationship
  validation, people validation and public profile lookup now use Vietnamese
  wording.

## Textfield And Placeholder Normalized

- Form labels for IDs, family links, visibility and revision filters use
  Vietnamese display text.
- Technical placeholders that intentionally carry JSON shape, UUID or stable
  code examples remain unchanged where they represent input contracts.

## Combobox And Dropdown Normalized

- Person visibility, relationship visibility, tree-editor relationship type and
  relationship status dropdowns show Vietnamese labels.
- Internal option values such as `public`, `family`, `private`, `biological`,
  `father`, `married` and permission codes are unchanged.

## Code/Internal Values Unchanged

- No variable, function, component, route, table, column, enum/internal value,
  API field, JSON key, package, env, migration or SQL contract was renamed.
- Existing route paths and permission keys remain unchanged.
- `family.json`, `JSON`, `GEDCOM`, `ZIP`, `UUID`, `ID`, `schema_version` and
  permission keys remain where they are technical contract text.

## Checker Result

- Added `scripts/check-vietnamese-ui-copy.cjs`.
- Added `npm run check:vietnamese-ui-copy`.
- Checker verifies known English UI snippets are removed, expected Vietnamese
  UI copy is present, package dependencies are unchanged and no
  `PLANNING.MD`/SQL/migration file is modified.

## Validation Results

- `npm run check:vietnamese-ui-copy`: PASS.
- `npm run check:small-json-export-smoke`: PASS.
- `npm run check:small-json-export-hardening`: PASS.
- `npm run check:inline-admin-warning-ui`: PASS.
- `npm run check:export-import-final-readiness`: PASS.
- `npm run check:env:safe`: PASS.
- `npm run check:migrations`: PASS.
- `npm run typecheck`: PASS.
- `npm run lint`: PASS.
- Workspace-root `npm run build`: FAIL before compile due to the known Windows
  `.next` ACL `EPERM` artifact unlink issue:
  `D:\CODE\GIA PHẢ\.next\build\56416d4ae4ce586f.js`.
- Clean temp `npm run build`: PASS using a copy outside the repo with `.git`,
  `.next`, `node_modules`, env files and `PLANNING.MD` excluded.
- `git diff --check`: PASS.
- `git diff --cached --check`: PASS.

## Explicitly Not Done

- No migration.
- No `.sql` file.
- No DB apply.
- No SQL mutation.
- No seed/backfill.
- No schema change.
- No permission/auth logic change.
- No export/import runtime expansion.
- No Worker created.
- No OpenNext/Wrangler config change.
- No runtime dependency added.
- No deploy.
- No push.
- `PLANNING.MD` not read, modified or committed.

## Recommended Next Phase

Run a small UI smoke/review phase for Vietnamese copy consistency only if owner
wants browser-level screenshots. Otherwise continue with the next separately
approved product/runtime phase.
