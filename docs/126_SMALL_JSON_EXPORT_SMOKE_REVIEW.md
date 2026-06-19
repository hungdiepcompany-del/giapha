# Phase 126 - Small JSON Export Smoke Review

Status: `PASS_LOCAL_STATIC_SMOKE`

## Summary

Phase 126 reviews the Phase 125 small `family.json` export hardening with
static/source smoke checks. It does not call the database, export real data,
download files, create fixtures from production data, or expand runtime beyond
the existing small JSON export path.

No migration. No `.sql` file. No DB apply. No SQL mutation. No seed/backfill.
No large JSON export runtime. No GEDCOM runtime. No ZIP runtime. No import
parser runtime. No media export/import. No backup/restore runtime. No Worker
created. No OpenNext/Wrangler config change. No runtime dependency added. No
deploy. No push.

Boundary markers: No import parser runtime. No Worker created. No deploy.

## Smoke/Review Scope

Reviewed:

- `lib/family/export-types.ts`
- `lib/family/json-exporter.ts`
- `lib/family/export-collector.ts`
- `app/(admin)/admin/exports/download/json/route.ts`
- Phase 125 docs/checker/handoff boundary

Smoke method: local static/source inspection only. No live Supabase query and
no real export file generation were run in this phase.

## Export Metadata Review

PASS:

- `family.json` includes `schema_version`.
- `family.json` includes `app_export_version`.
- `family.json` includes `exported_at`.
- `family.json` includes `export_scope`.
- `family.json` includes `privacy_scope`.
- Manifest includes lineage counts.
- JSON `record_count` includes lineage rows:
  - `clans`
  - `clan_branches`
  - `generation_rules`
  - `person_branch_memberships`
- JSON download route still uses the existing `exports.download` guarded
  builder and returns checksum/header metadata.

## Privacy Review

PASS:

- Admin export remains the full existing admin JSON path under
  `exports.download`.
- Future non-admin `family`/`public` builder calls use the existing privacy
  sanitizer for people.
- Non-admin modes filter hidden people, families, couples and lineage rows by
  visibility and visible references.
- Non-admin modes clear:
  - `notes_private`
  - relationship `notes`
  - lineage `source_note`
  - lineage `generation_override_reason`
  - audit/delete actor fields
- Non-admin modes omit tree layout coordinates.
- Runtime export source does not reference credentials, signed URLs or storage
  APIs.

## Lineage Review

PASS:

- Lineage export references only verified existing tables:
  - `clans`
  - `clan_branches`
  - `generation_rules`
  - `person_branch_memberships`
- Runtime export source does not reference unsupported future tables:
  - `person_media`
  - `person_names`
  - `person_life_events`
  - `person_burials`
  - persistent warning table

## Runtime Boundary Review

PASS:

- Main Worker touched: NO in Phase 126 review work.
- Runtime dependency added: NO
- New service Worker created: NO
- OpenNext/Wrangler config changed: NO
- Worker size risk introduced by Phase 126: NO
- Service boundary recommendation: NONE. Large JSON/GEDCOM/ZIP/media/import
  and backup/restore work remains deferred to boundary-governed future phases.

## Checker Result

Added `scripts/check-small-json-export-smoke.cjs` and
`npm run check:small-json-export-smoke`.

The checker verifies metadata, lineage sections, privacy sanitizer usage,
record-count coverage, unsupported table absence, dependency safety,
Worker/config safety and no PLANNING.MD touch.

## Validation Results

- `npm run check:small-json-export-smoke`: PASS
- `npm run check:small-json-export-hardening`: PASS
- `npm run check:export-import-final-readiness`: PASS
- `npm run check:export-import-static-examples`: PASS
- `npm run check:export-import-boundary-design`: PASS
- `npm run check:inline-admin-warning-ui`: PASS
- `npm run check:vietnamese-genealogy-manual-sql-diagnostic-pass`: PASS
- `npm run check:vietnamese-genealogy-domain-ui`: PASS
- `npm run check:vietnamese-genealogy-domain`: PASS
- `npm run check:env:safe`: PASS
- `npm run check:migrations`: PASS
- `npm run typecheck`: PASS
- `npm run lint`: PASS
- Workspace-root `npm run build`: blocked before compile by the pre-existing
  Windows `.next` artifact ACL `EPERM` unlink error.
- Clean temp `npm run build`: PASS with `.git`, `.next`, env files and
  `PLANNING.MD` excluded.
- Git whitespace checks: PASS

## Explicitly Deferred Items

- Large JSON export runtime.
- GEDCOM runtime.
- ZIP runtime.
- Import parser runtime.
- Media export/import.
- Backup/restore runtime.
- Export-service Worker.
- Import-service Worker.
- New Worker.
- OpenNext/Wrangler config change.
- Runtime dependency addition.
- Deploy.
- Push.

## Recommended Next Phase

Recommended next phase: defer further export implementation, or start a
separately owner-approved export-service boundary design phase before any large
JSON/GEDCOM/ZIP/media/backup expansion.
