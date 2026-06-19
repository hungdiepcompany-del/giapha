# Phase 123B - Import Static Examples And Acceptance Checklist

Static examples status: `DESIGN_ONLY`

## Summary

Phase 123B provides static import payload cases, preview result examples and
acceptance checklists for future import work. These examples are not parser
code, not runtime fixtures, not production mutation approval and not permission
to add a large import service.

## Example Import Payload Cases

### Valid Small `family.json`

- Has `schema_version`.
- Has required arrays for people, families and relationships.
- Uses stable IDs.
- References resolve.
- Privacy metadata is present.
- Lineage membership references point to known clan, branch and generation
  rule IDs.

### Missing `schema_version`

Expected result: blocking error. The preview must reject before conflict
detection and before any mutation.

### Duplicate Person Candidate

Expected result: warning or blocking result depending on future policy. The
preview should show candidate reason without exposing private notes.

### Invalid Relationship

Expected result: blocking error when a parent/child/couple relationship uses an
invalid target or violates accepted relationship rules.

### Missing Parent Reference

Expected result: blocking error. The preview must identify the relationship row
and missing reference ID without mutating data.

### Clan Branch Mismatch

Expected result: blocking or warning result when a membership branch belongs to
a different clan than the membership clan.

### Generation Conflict

Expected result: warning or blocking result when a generation rule is outside
the selected clan/branch scope or generation number violates approved policy.

### Privacy Visibility Conflict

Expected result: warning or blocking result when a living-person record or
lineage membership is marked public in a context that violates privacy rules.

### Unsupported GEDCOM Extension

Expected result: reject or warn before mutation. Unsupported GEDCOM extensions
must not be silently mapped into canonical JSON.

### ZIP Manifest Checksum Mismatch

Expected result: blocking error. ZIP restore preview must stop before parsing
member payloads as trusted data.

## Example Import Preview Result

```json
{
  "status": "PREVIEW_ONLY",
  "accepted_rows": {
    "people": 3,
    "families": 1,
    "family_parents": 2,
    "family_children": 1,
    "clans": 1,
    "clan_branches": 1,
    "generation_rules": 1,
    "person_branch_memberships": 2
  },
  "warnings": [
    {
      "code": "DUPLICATE_PERSON_CANDIDATE",
      "severity": "warning",
      "target_id": "person-uuid",
      "message": "Possible duplicate based on name and year."
    }
  ],
  "blocking_errors": [
    {
      "code": "MISSING_PARENT_REFERENCE",
      "target_id": "family-parent-row-id",
      "message": "Parent reference does not resolve."
    }
  ],
  "conflict_candidates": [
    {
      "type": "person",
      "incoming_id": "person-uuid",
      "existing_id": "existing-person-uuid",
      "reason": "same slug"
    }
  ],
  "owner_approval_required": true,
  "apply_allowed": false
}
```

## Example Apply Gate

Future import apply must require:

- preview complete;
- conflicts reviewed;
- backup/snapshot confirmed;
- owner apply approval;
- rollback/no-go plan;
- target environment confirmed;
- expected mutation scope documented;
- revision/import log behavior documented;
- post-apply verification plan documented.

Apply must not be reachable from parse or preview as a side effect.

## Future Import-Service Acceptance Checklist

- [ ] Owner approval names `genealogy-import-service` or approved equivalent.
- [ ] Upload size limits are documented.
- [ ] Parse/validate/preview route contract is documented.
- [ ] Request/response envelope is documented.
- [ ] Auth, service binding or internal token strategy is documented.
- [ ] Env/secret contract avoids committing raw secrets.
- [ ] Safe-skip smoke plan exists.
- [ ] Deploy and rollback plan exists.
- [ ] Main app integration plan avoids heavy parsing in the main Worker.

## Future Large Import Acceptance Checklist

- [ ] Accepted formats are documented.
- [ ] Size thresholds are documented.
- [ ] Schema compatibility behavior is documented.
- [ ] Duplicate/conflict categories are documented.
- [ ] Privacy behavior for living/private records is documented.
- [ ] Transaction and rollback strategy is approved.
- [ ] Import log and revision behavior is approved.
- [ ] No direct production mutation can happen without owner approval.

## Explicitly Not Implemented

- No migration.
- No `.sql` file.
- No DB apply.
- No SQL mutation.
- No seed/backfill.
- No import parser runtime.
- No large import validation runtime.
- No import apply runtime.
- No media export/import.
- No backup/restore runtime.
- No import-service Worker.
- No Worker created.
- No OpenNext/Wrangler config change.
- No runtime dependency added.
- No deploy.
- No push.

## Recommended Future Phase

Recommended next import phase: a static import preview contract with example
error taxonomy and apply/no-go checklist, still without runtime parser or DB
mutation changes.
