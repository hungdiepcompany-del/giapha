# Phase 122B - Export Static Examples And Acceptance Checklist

Static examples status: `DESIGN_ONLY`

## Summary

Phase 122B provides static export payload examples and acceptance checklists
for future export work. These examples are review artifacts only. They are not
fixtures, not runtime data, not migration authorization and not permission to
expand JSON/GEDCOM/ZIP generation in the main Worker.

## Example `family.json` Export Shape

```json
{
  "metadata": {
    "app_name": "WEB GIA PHA",
    "app_version": "0.1.0",
    "schema_version": "1.1.0-draft",
    "exported_at": "2026-06-19T00:00:00.000Z",
    "exported_by": "admin-user-id",
    "privacy_mode": "admin_full_backup"
  },
  "people": [
    {
      "id": "person-uuid",
      "full_name": "Nguyen Van A",
      "display_name": "Ong A",
      "gender": "male",
      "birth_date": "1940-01-01",
      "death_date": null,
      "is_living": true,
      "visibility": "family",
      "private_fields_policy": "admin_backup_only"
    }
  ],
  "families": [],
  "family_parents": [],
  "family_children": [],
  "couple_relationships": [],
  "clans": [
    {
      "id": "clan-uuid",
      "clan_code": "NGUYEN_MAIN",
      "clan_name": "Ho Nguyen",
      "visibility": "family"
    }
  ],
  "clan_branches": [
    {
      "id": "branch-uuid",
      "clan_id": "clan-uuid",
      "branch_code": "CHI_1",
      "branch_name": "Chi 1",
      "visibility": "family"
    }
  ],
  "generation_rules": [
    {
      "id": "rule-uuid",
      "clan_id": "clan-uuid",
      "branch_id": "branch-uuid",
      "start_generation": 1,
      "numbering_method": "root_is_one",
      "is_active": true
    }
  ],
  "person_branch_memberships": [
    {
      "id": "membership-uuid",
      "person_id": "person-uuid",
      "clan_id": "clan-uuid",
      "branch_id": "branch-uuid",
      "generation_rule_id": "rule-uuid",
      "generation_number": 3,
      "membership_type": "bloodline",
      "is_primary": true,
      "visibility": "family"
    }
  ],
  "tree_layouts": [],
  "tree_layout_nodes": [],
  "revisions_summary": {
    "included": false,
    "reason": "full revision export requires a separate privacy review"
  },
  "privacy_metadata": {
    "living_person_policy": "redact in public export",
    "visibility_values": ["public", "family", "private"],
    "private_notes_policy": "exclude from public export"
  },
  "manifest": {
    "file": "family.json",
    "checksum_algorithm": "sha256"
  }
}
```

## Example Privacy-Safe Export Cases

### Public Export

- Includes only people and relationships that pass public privacy filtering.
- Redacts living-person birth dates, death dates, places, internal notes and
  private lineage details.
- Excludes `notes_private`, lineage `source_note`, raw revision payloads,
  storage keys and signed URLs.

### Family/Internal Export

- Includes family-visible records according to existing visibility rules.
- May include lineage metadata visible to family members.
- Still excludes secrets, service-role material and provider private URLs.
- Must state that it is not a public artifact.

### Admin Full Backup Export

- May include full authorized administrative data when the route is permission
  guarded.
- Must preserve stable IDs, references and privacy metadata.
- Must be stored and shared as a sensitive backup artifact.
- Must not be reused as a public export payload.

## Example GEDCOM Mapping Notes

### Maps Cleanly

- Person identity to `INDI`.
- Family records to `FAM`.
- Parent/child links to GEDCOM family child links when roles are clear.
- Couple relationships to spouse links when status is compatible.

### Becomes JSON Extension

- Vietnamese clan/branch/generation metadata.
- Membership type, primary membership and lineage visibility.
- Tree layout positions.
- Fine-grained privacy metadata.
- App-specific revision summaries.

### Deferred

- Large GEDCOM generation.
- GEDCOM import.
- GEDCOM extension schema.
- Media references in GEDCOM.
- Lossiness reconciliation between GEDCOM and canonical `family.json`.

## Example ZIP Bundle Manifest

```json
{
  "backup_id": "backup-20260619-example",
  "schema_version": "1.1.0-draft",
  "created_at": "2026-06-19T00:00:00.000Z",
  "files": [
    { "path": "family.json", "required": true },
    { "path": "manifest.json", "required": true },
    { "path": "checksums.json", "required": true },
    { "path": "family.ged", "required": false },
    { "path": "media/manifest.json", "required": false, "status": "later" }
  ],
  "checksum_algorithm": "sha256",
  "media_policy": "deferred"
}
```

## Unsafe Export Cases That Must Be Rejected

- Public export includes `notes_private`.
- Public export includes lineage `source_note`.
- Public export includes private living-person birth date, home town, address
  or equivalent sensitive detail.
- Public export includes storage keys, object paths or signed URLs.
- `family.json` is missing `schema_version`.
- ZIP backup is missing `manifest.json`.
- ZIP backup is missing checksum data.
- GEDCOM is treated as the only complete source of truth.
- Large ZIP/GEDCOM generation is added to the main Worker without approval.

## Future Export-Service Acceptance Checklist

- [ ] Owner approval names `genealogy-export-service` or approved equivalent.
- [ ] Route contract and request/response envelope are documented.
- [ ] Auth, service binding or internal token strategy is documented.
- [ ] Env/secret contract avoids committing raw secrets.
- [ ] Small versus large export threshold is documented.
- [ ] Privacy policy for public/family/admin exports is documented.
- [ ] Manifest and checksum behavior is documented.
- [ ] Safe-skip smoke plan exists.
- [ ] Deploy and rollback plan exists.
- [ ] Main app integration plan avoids heavy work in the main Worker.

## Future GEDCOM/ZIP Acceptance Checklist

- [ ] Canonical `family.json` remains the complete preservation source.
- [ ] GEDCOM lossiness is documented.
- [ ] ZIP file list is documented.
- [ ] Checksums are generated and verified.
- [ ] Manifest schema is versioned.
- [ ] Media remains deferred unless separately approved.
- [ ] Public export redaction tests are documented.
- [ ] Large export placement is approved before implementation.

## Explicitly Not Implemented

- No migration.
- No `.sql` file.
- No DB apply.
- No SQL mutation.
- No seed/backfill.
- No large JSON/GEDCOM/ZIP runtime.
- No export-service Worker.
- No media export/import.
- No backup job runtime.
- No Worker created.
- No OpenNext/Wrangler config change.
- No runtime dependency added.
- No deploy.
- No push.

## Recommended Future Phase

Recommended next export phase: a static `family.json` schema candidate with
sample manifests and privacy redaction examples, still without runtime export
changes.
