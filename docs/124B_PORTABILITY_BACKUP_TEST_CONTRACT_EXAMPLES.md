# Phase 124B - Portability And Backup Test Contract Examples

Static test contract status: `DESIGN_ONLY`

## Summary

Phase 124B provides static portability checks, backup manifest examples and
restore dry-run report examples. These examples are design evidence only and do
not implement backup, restore, parser, Worker, storage or production mutation
runtime.

## Example Portability Checks

- Stable IDs preserved.
- References resolve across people, families, relationships, lineage and tree
  layout groups.
- Schema version known.
- Unknown future fields are preserved when safe or safely ignored when
  irrelevant.
- Unknown privacy, relationship, media or mutation-affecting fields fail
  closed.
- Required sections are present.
- Canonical `family.json` remains the complete preservation source.
- GEDCOM remains an optional compatibility artifact.

## Example Backup Manifest

```json
{
  "backup_id": "backup-20260619-example",
  "created_at": "2026-06-19T00:00:00.000Z",
  "app_version": "0.1.0",
  "schema_version": "1.1.0-draft",
  "file_list": [
    "family.json",
    "manifest.json",
    "checksums.json",
    "family.ged"
  ],
  "checksums": {
    "family.json": "sha256-example",
    "manifest.json": "sha256-example",
    "family.ged": "sha256-example"
  },
  "export_scope": "admin_full_backup",
  "privacy_scope": "sensitive_admin_artifact",
  "media": {
    "included": false,
    "reason": "media export deferred"
  }
}
```

## Example Restore Dry-Run Report

```json
{
  "status": "DRY_RUN_ONLY",
  "files_detected": [
    "family.json",
    "manifest.json",
    "checksums.json"
  ],
  "checksums_verified": true,
  "schema_compatibility_result": "SUPPORTED_DRAFT",
  "relationship_validation_result": "PASS",
  "lineage_validation_result": "PASS",
  "warning_summary": {
    "warnings": 1,
    "blocking_errors": 0,
    "notes": ["persistent warnings are deferred"]
  },
  "no_mutation_result": "PASS",
  "apply_allowed": false,
  "owner_approval_required": true
}
```

## Backward Compatibility Examples

- Older `family.json` without lineage tables may preview with lineage count
  zero and a warning that lineage metadata is absent.
- Older exports with tree layout data but no lineage data must not invent clan,
  branch or generation rows.
- Older GEDCOM-only artifacts must be treated as lossy compatibility imports,
  not full restore backups.
- Missing optional `family.ged` may pass if canonical `family.json`, manifest
  and checksums are valid.

## Forward Compatibility Examples

- Unknown descriptive metadata can be preserved or ignored when it does not
  affect privacy, relationships or mutation safety.
- Unknown privacy fields must fail closed or require owner review.
- Unknown relationship, lineage, media or warning lifecycle fields must not be
  silently discarded before restore/apply.
- Higher schema versions should preview with a clear compatibility warning and
  no mutation.

## No-Go Conditions Before Restore/Apply

- Missing `family.json`.
- Missing `schema_version`.
- Unknown schema version without compatibility policy.
- Missing manifest for ZIP backup.
- Missing checksum file for ZIP backup.
- Checksum mismatch.
- Broken person/family/relationship references.
- Broken clan/branch/generation membership references.
- Public export payload used as if it were a full admin backup.
- Backup/snapshot not confirmed.
- Owner apply approval missing.
- Rollback/no-go plan missing.

## Future Backup-Service Acceptance Checklist

- [ ] Owner approval names `backup-service` or approved equivalent.
- [ ] Responsibility boundary is documented.
- [ ] Storage target and retention policy are documented.
- [ ] Manifest and checksum verification contract is documented.
- [ ] Auth/env/secret contract avoids committing raw secrets.
- [ ] Restore dry-run remains non-mutating.
- [ ] Production restore apply is separately approved.
- [ ] Smoke and rollback plans exist.

## Future Import-Service Acceptance Checklist

- [ ] Restore/import preview accepts only approved file formats.
- [ ] Schema compatibility matrix is documented.
- [ ] Dry-run report shape is documented.
- [ ] Conflict and no-go categories are documented.
- [ ] Privacy redaction and fail-closed behavior are documented.
- [ ] Large validation placement is service-boundary approved.
- [ ] Apply path is gated by owner approval and backup/snapshot evidence.

## Explicitly Not Implemented

- No migration.
- No `.sql` file.
- No DB apply.
- No SQL mutation.
- No seed/backfill.
- No large JSON/GEDCOM/ZIP runtime.
- No import parser runtime.
- No media export/import.
- No backup job runtime.
- No restore runtime.
- No backup-service Worker.
- No import-service Worker.
- No Worker created.
- No OpenNext/Wrangler config change.
- No runtime dependency added.
- No deploy.
- No push.

## Recommended Future Phase

Recommended next phase: a static compatibility matrix for schema versions and
restore dry-run no-go categories, still without runtime backup/restore changes.
