# Phase 125 - Small Main-App JSON Export Hardening

Status: `IMPLEMENTED_SMALL_JSON_ONLY`

## Summary

Phase 125 hardens the existing small/main-app `family.json` export only. The
existing JSON export surface was already synchronous and server-side, so this
phase keeps it lightweight while adding metadata, lineage sections and
privacy-safe behavior for non-admin export modes.

No migration. No `.sql` file. No DB apply. No SQL mutation. No seed/backfill.
No large JSON export runtime. No GEDCOM heavy runtime. No ZIP runtime. No
import parser runtime. No media export/import. No backup/restore runtime. No
Worker created. No OpenNext/Wrangler config change. No runtime dependency
added. No deploy. No push.

Boundary markers: No import parser runtime. No Worker created. No runtime dependency added.

## Owner Approval Scope

Owner approved Phase 125 for small main-app JSON export hardening only:

- Harden existing small/main-app JSON export.
- Add schema/version/export metadata if missing.
- Include lineage metadata already present in DB when it can be fetched with
  lightweight select queries.
- Improve privacy-safe JSON export behavior.
- Improve checker/docs/handoff.

The approval does not include large export runtime, GEDCOM/ZIP/media,
backup/restore runtime, Workers, dependency changes, deploy or push.

## Existing Export Surface Reviewed

Reviewed runtime surface:

- `app/(admin)/admin/exports/download/json/route.ts`
- `lib/family/json-exporter.ts`
- `lib/family/export-collector.ts`
- `lib/family/export-types.ts`

Existing JSON export was usable for small server-side export and already had
`schema_version`, `exported_at`, app metadata, manifest and checksum support.
The gap was that it did not yet expose `export_scope`, `privacy_scope`,
`app_export_version`, lineage table sections or non-admin privacy sanitization.

## JSON Export Hardening Result

Implemented:

- Added `app_export_version`.
- Added `export_scope`.
- Added `privacy_scope`.
- Kept stable top-level section ordering.
- Added lineage sections to `family.json`:
  - `clans`
  - `clan_branches`
  - `generation_rules`
  - `person_branch_memberships`
- Added lineage counts to the manifest.
- Updated JSON export `record_count` to include lineage rows.

## Schema/Version Metadata Result

`family.json` now includes:

- `schema_version`
- `app_name`
- `app_version`
- `app_export_version`
- `exported_at`
- `exported_by`
- `export_scope`
- `privacy_scope`
- `privacy_mode`
- `manifest`

The manifest mirrors the metadata and adds counts for people, families,
relationships, lineage rows, tree layouts, tree layout nodes and media count.

## Privacy Behavior

Admin export keeps full server-side admin export data under `exports.download`.

When the JSON builder is called with `privacy_mode: "family"` or
`privacy_mode: "public"`, the collector now:

- Uses the existing privacy sanitizer for people.
- Excludes people outside the requested privacy mode.
- Filters family/couple rows by visibility and visible person references.
- Strips relationship `notes` for non-admin export modes.
- Strips `notes_private`.
- Strips lineage `source_note`, `generation_override_reason`, `notes` and
  description for non-admin export modes.
- Clears audit/delete actor fields for non-admin export modes.
- Omits tree layout coordinates for non-admin export modes.

This does not create a public export route. It hardens the JSON builder if a
future approved caller requests public/family mode.

## Lineage Export Behavior

Lineage export uses only the verified existing tables:

- `clans`
- `clan_branches`
- `generation_rules`
- `person_branch_memberships`

The collector uses lightweight select queries through the existing server-side
Supabase admin client. It does not reference `person_media`, `person_names`,
`person_life_events`, `person_burials` or a persistent warning table.

## Explicitly Deferred Items

- Large JSON export runtime.
- GEDCOM heavy runtime.
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

## Worker/Runtime Impact

- Main Worker touched: YES, small existing JSON export code only.
- Runtime dependency added: NO
- New service Worker created: NO
- OpenNext/Wrangler config changed: NO
- Worker size risk: LOW
- Service boundary recommendation: NONE for this small JSON hardening. Large
  JSON/GEDCOM/ZIP/media/backup work remains deferred to boundary-governed
  future phases.

## Validation Results

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

## Next Recommended Phase

Recommended next phase: Phase 126 small JSON export smoke/review, or defer
further export implementation until a separate owner-approved export-service
boundary design phase.
