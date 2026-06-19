# Phase 119C - Data Quality Static Examples And Acceptance Checklist

Static examples status: `DESIGN_ONLY`

## Summary

Phase 119C provides static warning examples and acceptance criteria. The examples are documentation, not persisted records, runtime scan output or permission to create a warning table or quality-service Worker.

## Example Warnings

| Example | Code | Severity | Target type | Vietnamese copy | Admin-only detail | Public behavior | Expected resolution path |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Missing required identity fields | `PERSON_IDENTITY_INCOMPLETE` | `info` | person | `Hồ sơ còn thiếu thông tin nhận diện cần thiết.` | List missing field names only to authorized admins. | Show nothing. | Confirm family source, then update the person record. |
| Impossible date order | `PERSON_DATE_ORDER_INVALID` | `blocking` | person | `Ngày tháng đang có thứ tự không hợp lý.` | Show compared fields and dates only in admin. | Show nothing. | Correct the date or mark uncertainty using an approved model. |
| Duplicate person candidate | `PERSON_DUPLICATE_CANDIDATE` | `warning` | person | `Có hồ sơ khác có thông tin tương tự cần kiểm tra.` | Show only candidate records the admin may view. | Show nothing. | Compare sources; merge only in a separately approved workflow. |
| Missing parent link | `RELATIONSHIP_PARENT_LINK_MISSING` | `warning` | relationship | `Quan hệ cha/mẹ - con có thể chưa đầy đủ.` | Explain expected lineage context without revealing hidden relatives publicly. | Show nothing. | Verify sources and add the relationship through normal authorized CRUD. |
| Multiple primary branch memberships | `BRANCH_PRIMARY_MEMBERSHIP_MULTIPLE` | `blocking` | person | `Hồ sơ đang có nhiều chi chính.` | List authorized membership identifiers. | Show nothing. | Select one authoritative primary membership. |
| Branch/generation conflict | `LINEAGE_GENERATION_CONFLICT` | `warning` | person | `Thông tin chi hoặc đời có thể chưa khớp.` | Show the rule and explicit assignment to authorized admins. | Show nothing. | Verify lineage rule and update the appropriate source record. |
| Privacy visibility conflict | `PRIVACY_VISIBILITY_CONFLICT` | `blocking` | person | `Mức hiển thị có thể làm lộ thông tin riêng tư.` | Explain which privacy rule conflicts without copying private notes. | Fail closed; expose no warning detail. | Reduce visibility or complete privacy review. |
| Orphan layout node | `TREE_LAYOUT_NODE_ORPHANED` | `warning` | layout | `Vị trí cây không còn gắn với hồ sơ hợp lệ.` | Show layout identifier and missing authorized target. | Ignore the orphaned node. | Remove or relink layout metadata in an approved editor flow. |
| Relationship cycle risk | `RELATIONSHIP_CYCLE_RISK` | `blocking` | relationship | `Quan hệ này có thể tạo vòng lặp phả hệ.` | Show the minimal authorized path needed for diagnosis. | Show nothing. | Correct the proposed relationship before saving/import confirmation. |

## Per-Example Contract

Every future warning must provide:

- Code.
- Severity.
- Target type.
- User-facing Vietnamese copy.
- Admin-only detail.
- Privacy-safe public behavior.
- Expected resolution path.

## Warning Acceptance Checklist

- [ ] Deterministic code for the same condition.
- [ ] No private leakage in title, message, logs or public output.
- [ ] Severity is consistent across admin locations.
- [ ] No false blocking when data is incomplete but valid.
- [ ] Inline-only warnings work without a persistent table.
- [ ] Persistent warnings require a future migration and owner approval.
- [ ] Resolution guidance uses existing authorized CRUD rather than automatic mutation.
- [ ] Public behavior fails closed.

## Quality-Service Worker Acceptance Checklist

- [ ] Owner approval names the quality-service implementation phase.
- [ ] Scan responsibility and dataset limits are documented.
- [ ] Route/request/response contract exists.
- [ ] Auth and env/secret contracts are approved without storing secrets in repo.
- [ ] Privacy-safe logging and result redaction rules exist.
- [ ] Performance, timeout and pagination limits exist.
- [ ] Safe-skip smoke, deploy and rollback plans exist.
- [ ] Full-tree, duplicate and import-wide scans stay outside the main Worker.

## No-Go Conditions Before Runtime Scan Implementation

- Missing owner approval.
- Missing deterministic warning contract.
- Missing privacy/redaction rules.
- Missing limits for full-tree or import-wide scans.
- Missing service boundary for heavy scans.
- Warning logic would mutate data automatically.
- Blocking severity cannot distinguish invalid data from valid uncertainty.

## Explicitly Not Implemented

- No migration.
- No `.sql` file.
- No DB apply.
- No SQL mutation.
- No seed/backfill.
- No persistent warning table.
- No warning persistence.
- No full-tree runtime scan.
- No scheduled scan.
- No runtime warning UI.
- No quality-service Worker.
- No large export/import/GEDCOM/ZIP.
- No OpenNext/Wrangler config change.
- No runtime dependency added.
- No deploy.
- No push.

## Recommended Future Phase

Phase 119D may review deterministic warning rules using synthetic documentation cases, or prepare a separately approved schema/service candidate. This phase does not authorize runtime scanning.
