# Phase 124A - Data Portability And Backup Compatibility Contract

Status: `DESIGN_ONLY_LOCAL_STATIC_VALIDATED`

## Summary

Phase 124A defines the long-term data portability and backup compatibility
contract direction after the Vietnamese genealogy lineage model and inline
warning UI work. This is a design and approval-gate phase only.

No runtime export/import implementation, migration, SQL, Worker, deploy or
dependency change is authorized by this document.

## Long-Term Portability Goals

The project must not lock genealogy data into one database, UI or cloud
provider. A family should be able to preserve, inspect and restore the data
using open, documented artifacts.

Long-term portability requires:

- canonical JSON data;
- stable IDs and references;
- schema version metadata;
- backward and forward compatibility rules;
- manifests and checksums;
- privacy-safe export modes;
- restore dry-run before mutation;
- clear separation between canonical data and lossy compatibility formats.

## Canonical `family.json` Contract Direction

`family.json` remains the canonical preservation format. Future versions should
include these top-level concepts:

- `schema_version`
- `app_name`
- `app_version`
- `exported_at`
- `exported_by`
- `privacy_mode`
- `people`
- `families`
- `family_parents`
- `family_children`
- `couple_relationships`
- `clans`
- `clan_branches`
- `generation_rules`
- `person_branch_memberships`
- `tree_layouts`
- `tree_layout_nodes`
- `revisions`
- `manifest`

GEDCOM and ZIP should be derived or packaged from canonical data, not treated
as the only complete source of truth.

## Stable IDs And References

- Existing UUIDs should be preserved by default.
- Import should not remap IDs unless a future approved conflict strategy
  requires it.
- Relationships must reference stable person/family IDs.
- Lineage memberships must reference stable person, clan, branch and generation
  rule IDs.
- Tree layout records must remain separate from genealogy relationship facts.

## Schema Versioning

Every canonical export must carry a schema version. Future schema versions
should document:

- added fields;
- removed or deprecated fields;
- compatibility behavior;
- migration/restore expectations;
- minimum app version if required.

## Backward Compatibility

Future import should be able to recognize older schema versions and either:

- import them through an approved compatibility path;
- preview them with clear warnings; or
- reject them with actionable errors.

Rejection must happen before mutation.

## Forward Compatibility

Future imports should preserve unknown compatible metadata when safe, or fail
closed when unknown data affects privacy, relationships, media, warnings or
mutation safety.

Forward compatibility must not silently drop lineage, privacy or relationship
data.

## Restore Dry-Run Expectations

Restore dry-run should report:

- schema version;
- counts by data group;
- missing references;
- duplicate candidates;
- privacy mode;
- lineage compatibility;
- media manifest compatibility when media exists;
- warnings compatibility when persistent warnings exist later;
- no-go reasons before any apply step.

Dry-run must not mutate production data.

## Backup Manifest Expectations

The backup manifest should include:

- app name and app version;
- schema version;
- export timestamp;
- privacy mode;
- data group counts;
- file list;
- checksum algorithm;
- checksum values;
- media count and media manifest reference when approved later.

## Clan/Branch/Generation Compatibility

Canonical export must preserve Vietnamese genealogy metadata:

- `clans`
- `clan_branches`
- `generation_rules`
- `person_branch_memberships`

Compatibility behavior must respect manual entry, no automatic backfill from
legacy people fields, and privacy visibility rules.

## Future Media Compatibility

Media compatibility is deferred until a media schema/storage design is
approved. Future media backup must include:

- metadata records;
- object references that do not leak private URLs;
- checksums;
- retention/deletion state;
- privacy visibility;
- restore behavior.

## Future Warnings Compatibility

Inline admin warnings from Phase 121A are not persistent data and do not belong
in canonical backup. Future persistent warnings, if approved, must define:

- warning schema version;
- lifecycle state;
- target references;
- privacy behavior;
- stale-warning invalidation;
- import/restore compatibility.

## Privacy-Safe Export Contract

- Admin backups may contain full authorized data and must stay permission
  guarded.
- Public export must use public-safe DTOs and must not reuse admin backup
  payloads.
- Living-person details must be redacted or omitted according to public/family
  mode.
- Private notes and source notes must not appear in public exports.
- Media storage keys, signed URLs and private object paths must not leak into
  public artifacts.

## What Must Be Included Now

The contract direction must include:

- canonical `family.json`;
- stable IDs and references;
- schema version;
- manifest and checksums;
- people/family/relationship groups;
- lineage groups;
- tree layout separation;
- privacy metadata;
- dry-run before mutation.

## What Must Be Deferred

- Large JSON/GEDCOM/ZIP runtime expansion.
- Import parser/runtime expansion.
- Media export/import.
- Persistent warning export/import.
- Export-service Worker.
- Import-service Worker.
- Production restore apply.
- Deploy and push.

## Approval Gates Before Runtime/Service Changes

Before runtime export/import/service changes, the owner must approve:

- exact data contract;
- schema version;
- examples and compatibility tests;
- privacy behavior;
- service-boundary placement;
- env/secret contract when service work is involved;
- smoke plan;
- rollback/no-go plan;
- production apply/deploy approval if mutation or deploy is involved.

## Explicitly Not Implemented

- No migration.
- No `.sql` file.
- No DB apply.
- No SQL mutation.
- No seed/backfill.
- No large JSON/GEDCOM/ZIP runtime.
- No import parser runtime.
- No media export/import.
- No persistent warning export/import.
- No Worker created.
- No OpenNext/Wrangler config change.
- No runtime dependency added.
- No deploy.
- No push.

## Recommended Future Phase

Recommended next phase: Phase 124B static `family.json` versioned contract
examples and restore dry-run acceptance checklist, still with no runtime
mutation.
