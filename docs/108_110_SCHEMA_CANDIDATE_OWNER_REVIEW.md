# Phase 108-110 Schema Candidate Owner Review

Status: `OWNER_REVIEW_PACKAGE`

Recommended owner decision: `REQUEST_CHANGES_BEFORE_PHASE_111`

## Summary

The Phase 108-110 schema candidate is directionally sound and follows the docs-only, additive-only, no-runtime-change boundary. It correctly preserves the existing separation between person profiles, relationship truth, tree layout, revisions, privacy filtering and export/backup.

The candidate is still too broad to approve directly for a first real migration. Before Phase 111 creates a migration file, the owner should narrow the first migration to low-risk lineage metadata and explicitly defer life events, burial/memorial details and media.

## Candidate Scorecard

| Candidate | Review result | First migration recommendation |
| --- | --- | --- |
| `clans` | Good fit for normalized lineage roots. | Must include in first migration |
| `clan_branches` | Good fit for `chi`/`nhanh`; keep compatibility with `people.branch_name`. | Must include in first migration |
| `generation_rules` | Needed to explain `people.generation_number` and future calculations. | Must include in first migration |
| `person_branch_memberships` | Needed to avoid overloading `people.branch_name`; privacy-sensitive but manageable. | Must include in first migration |
| `person_names` | Useful, but can expand UI/export/privacy surface. | Conditional; include only if owner wants name taxonomy immediately |
| `person_life_events` | Broad and likely to become a workflow module. | Should defer |
| `person_burials` | Sensitive memorial/grave data; needs privacy and cultural copy review. | Should defer |
| `person_media` | Requires storage/media/service boundary decisions. | Later only; requires separate boundary/design phase |

## Must Include In First Migration

- `clans`
- `clan_branches`
- `generation_rules`
- `person_branch_memberships`

These four tables are the smallest useful migration for Vietnamese genealogy structure. They solve the core gap around `dong_ho`, `chi`, `nhanh`, generation reference and branch filtering without touching runtime media/export/import workloads.

Recommended constraints for first migration:

- Additive-only tables.
- Nullable references to `people` where needed.
- Soft delete and audit fields aligned with existing tables.
- RLS enabled from the start.
- No backfill from `people.branch_name` during the migration.
- No removal or reinterpretation of `people.branch_name` or `people.generation_number`.

## Defer From First Migration

- `person_names`: defer unless the owner confirms that birth/legal/common/taboo/courtesy/dharma names are required before branch work. If included, keep it small and do not alter `people.full_name` or `people.display_name`.
- `person_life_events`: defer to a dedicated event design because it overlaps with planned `events`, public privacy and timeline UX.
- `person_burials`: defer until memorial privacy and public copy rules are clearer.
- `person_media`: defer until Phase 118A media/storage boundary design.
- Lightweight `people` fields such as `death_place`, `occupation`, lunar date parts and `generation_override_reason`: defer until owner chooses table-vs-column strategy.

## Privacy/RLS Review

All new first-migration tables should have RLS enabled.

Suggested access model:

- `clans`: not public directly. Admin/family read through permissions; public output only through sanitized DTOs.
- `clan_branches`: not public directly. Branch names may be public only after privacy filtering.
- `generation_rules`: not public directly. Public output may show generation number/range, not internal rule notes.
- `person_branch_memberships`: not public directly. Living-person membership can reveal private lineage data and must be filtered server-side.
- `person_names`: if included, name rows need field-level visibility. Legal/taboo/courtesy/dharma names should default family/private for living people.
- `person_life_events`, `person_burials`, `person_media`: should not be included yet because privacy risk is higher.

Living people remain protected. Public clients must not receive exact birth/lunar dates, private notes, precise private place data, hidden branch memberships, private names or private media.

## Export/Import Review

First migration impact:

- `clans`, `clan_branches`, `generation_rules` and `person_branch_memberships` must eventually be preserved in `family.json`.
- GEDCOM mapping is partial. Clan/branch/generation metadata should remain JSON-first, with GEDCOM notes only when safe and mappable.
- Import preview must validate:
  - clan references
  - branch parent references
  - branch-to-clan consistency
  - generation rule root person references
  - membership person/clan/branch references
  - visibility/privacy flags
  - duplicate codes within the same clan or branch scope
- Backup/restore must preserve stable IDs and must not infer branch membership from layout nodes.

No large export/import implementation should be part of Phase 111. Only schema compatibility notes are needed before the first migration file.

## Worker/Runtime Review

- Main Worker touched: NO
- Runtime dependency needed: NO
- New Worker needed now: NO
- OpenNext/Wrangler config change needed: NO
- Media/export/import heavy work deferred: YES

The candidate follows `docs/RUNTIME_WORKER_GUARDRAIL.md` and `docs/SERVICE_BOUNDARY_ROADMAP.md` as long as Phase 111 stays schema-only and does not add runtime processing, media upload, large GEDCOM/ZIP work or import execution.

## Open Questions For Owner

- Should `person_names` be included in the first real migration, or should the first migration focus only on clan/branch/generation?
- Should `clans` support only one active clan initially, or multiple clans from the start?
- Are branch codes required to be globally unique, unique per clan, or optional?
- Should `person_branch_memberships` allow multiple primary memberships over time, or only one current primary membership?
- What default visibility should branch membership use for living people?
- Should there be a manual generation override field in the first migration, or is `generation_rules` enough for now?
- Should any backfill from `people.branch_name` be manual/operator-assisted instead of automated?

## Recommended Owner Decision

`REQUEST_CHANGES_BEFORE_PHASE_111`

Reason:

- Candidate direction is good.
- First migration scope should be explicitly narrowed before migration-file creation.
- RLS policy shape, export/import JSON shape and owner choices for `person_names` need confirmation.
- No blocking technical defect was found in the candidate-only bundle.

## No-Go Conditions Before Phase 111

- Owner has not explicitly approved real migration file creation.
- First migration scope still includes media, life events or burial/memorial tables.
- RLS policy shape for new tables is not documented.
- Export/import `family.json` compatibility notes are missing.
- Backfill strategy from `people.branch_name` is unclear or automatic without review.
- Any SQL draft includes destructive operations.
- Any plan requires runtime dependency, Worker creation, deploy config change or DB apply.

## Proposed Phase 111 Scope If Owner Approves

Create a real migration file only for:

- `clans`
- `clan_branches`
- `generation_rules`
- `person_branch_memberships`

Optional, owner-dependent:

- `person_names`

Explicitly out of Phase 111:

- `person_life_events`
- `person_burials`
- `person_media`
- media processing
- large export/import/GEDCOM/ZIP work
- runtime app changes
- Worker or service creation
- DB apply

Phase 111 should create the migration file only. Phase 113 should apply DB only after a separate approval gate with backup/snapshot, project ref confirmation, rollback plan and post-apply verification.
