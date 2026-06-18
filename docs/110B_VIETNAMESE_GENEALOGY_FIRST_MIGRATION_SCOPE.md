# Phase 110B - Vietnamese Genealogy First Migration Scope

Status: `PHASE_111_NOT_APPROVED`

Marker: `OWNER_APPROVAL_REQUIRED_BEFORE_PHASE_111_REAL_MIGRATION_FILE=true`

## Summary

Phase 110B narrows the Vietnamese genealogy first migration scope after the Phase 108-110 candidate review. This is a documentation and static-check phase only.

This file does not authorize a real migration file, SQL migration, DB apply, data mutation, deploy, runtime app change, Worker creation, OpenNext/Wrangler config change or runtime dependency addition.

Phase 111 may create a real migration file only after explicit owner approval. Phase 113 may apply DB only after a separate apply approval with backup/snapshot, project ref confirmation, rollback and post-apply verification.

## Final Proposed First Migration Scope

The proposed first migration should focus on the smallest useful Vietnamese lineage metadata layer:

- `clans`
- `clan_branches`
- `generation_rules`
- `person_branch_memberships`

These tables support `dong_ho`, `chi`, `nhanh`, generation rules and person-to-branch membership without changing existing person profile truth, relationship truth, tree layout truth, export/import runtime, media handling or backup execution.

The first migration should be additive-only. It must not remove, reinterpret or backfill `people.branch_name`, `people.generation_number`, relationship tables, layout tables, revisions or existing export/backup foundations.

## Tables Allowed In Phase 111

If and only if the owner explicitly approves Phase 111 real migration file creation, the Phase 111 migration file may include only:

| Table | Phase 111 status | Reason |
| --- | --- | --- |
| `clans` | Allowed | Represents the lineage or clan root such as `dong_ho`. |
| `clan_branches` | Allowed | Represents `chi` and `nhanh` hierarchy inside a clan. |
| `generation_rules` | Allowed | Documents how generation numbers are interpreted for a clan or branch. |
| `person_branch_memberships` | Allowed | Links people to clan/branch metadata without overloading `people.branch_name`. |

Phase 111 should create the migration file only. It should not apply DB changes.

## Tables Explicitly Deferred

The following are explicitly out of the first migration scope:

- `person_life_events`
- `person_burials`
- `person_media`
- media processing
- large export/import/GEDCOM/ZIP work
- runtime app changes
- Worker or service creation
- DB apply
- automatic backfill from `people.branch_name`
- changes to `people`, `families`, `family_parents`, `family_children`, `couple_relationships`, `tree_layouts`, `tree_layout_nodes` or `revisions`

`person_life_events` should wait for a dedicated event/timeline design. `person_burials` should wait for memorial privacy and cultural copy review. `person_media` should wait for Phase 118A media/storage boundary design.

## Optional Table Decision: `person_names`

`person_names` is optional and not approved by default.

Owner decision required:

- Include `person_names` in Phase 111 only if structured Vietnamese names are required immediately before branch/generation work.
- Defer `person_names` if Phase 111 should stay strictly limited to clan, branch, generation and membership metadata.

If included later, `person_names` must remain additive-only and must not alter `people.full_name`, `people.display_name` or existing public display behavior without a separate runtime/UI phase.

## Owner Questions

- Does the owner explicitly approve creating a real Phase 111 migration file?
- Should `person_names` be included in Phase 111, or deferred?
- Should the first migration support one active clan initially, or multiple clans from the start?
- Should branch codes be globally unique, unique per clan or optional?
- Should `person_branch_memberships` allow multiple historical primary memberships, or only one current primary membership?
- What default visibility should branch membership use for living people?
- Should any future backfill from `people.branch_name` be manual/operator-assisted instead of automatic?

Until these are resolved, status remains `PHASE_111_NOT_APPROVED`.

## Privacy/RLS Requirements

All allowed Phase 111 tables must have RLS enabled from creation.

Minimum privacy requirements:

- `clans`: not public directly; public output only through sanitized DTOs.
- `clan_branches`: not public directly; branch names may be public only after privacy filtering.
- `generation_rules`: not public directly; public output may show safe generation labels/ranges, not private internal notes.
- `person_branch_memberships`: not public directly; living-person branch membership must be filtered server-side.
- `person_names`, if owner includes it: field-level visibility is required, and legal/taboo/courtesy/dharma names should default family/private for living people.

Public clients must not receive hidden branch memberships, private names, exact private dates, precise private place data, private notes or private media.

## Export/Import Compatibility Notes

The allowed Phase 111 tables must eventually be represented in `family.json` with stable IDs and reference validation:

- `clans`
- `clan_branches`
- `generation_rules`
- `person_branch_memberships`
- `person_names`, only if owner includes it

GEDCOM compatibility remains partial. Clan, branch and generation metadata should stay JSON-first, with GEDCOM notes only when safe and mappable.

Phase 111 must not implement export/import runtime. Large export/import/media/GEDCOM/ZIP work is deferred to boundary-governed future phases and must follow `docs/RUNTIME_WORKER_GUARDRAIL.md` and `docs/SERVICE_BOUNDARY_ROADMAP.md`.

## Worker/Runtime Impact Notes

- Main Worker touched: NO
- Runtime dependency added: NO
- New service Worker created: NO
- OpenNext/Wrangler config changed: NO
- Worker size risk introduced by Phase 110B: NO
- Runtime app change authorized by Phase 110B: NO
- Heavy export/import/media work: deferred to boundary-governed future phases

Phase 110B does not authorize adding runtime dependencies, moving heavy processing into the main Cloudflare/OpenNext Worker, changing OpenNext/Wrangler config or creating new service Workers.

## No-Go Conditions

Do not start Phase 111 if any item below is true:

- Owner approval for real migration file creation is missing or unclear.
- `OWNER_APPROVAL_REQUIRED_BEFORE_PHASE_111_REAL_MIGRATION_FILE=true` has not been acknowledged by the owner.
- `person_names` inclusion is unclear and the owner expects it in the first migration.
- First migration scope includes `person_life_events`, `person_burials`, `person_media`, media processing or large export/import/GEDCOM/ZIP work.
- RLS policy shape for new tables is undocumented.
- Export/import `family.json` compatibility notes are missing.
- Any SQL draft includes destructive operations.
- Any plan requires runtime dependency, Worker creation, deploy config change, runtime app change, DB apply or production data mutation.

## Approval Marker Required Before Phase 111

Current status:

```txt
PHASE_111_NOT_APPROVED
OWNER_APPROVAL_REQUIRED_BEFORE_PHASE_111_REAL_MIGRATION_FILE=true
```

Phase 111 is blocked until the owner explicitly approves creating a real migration file and answers the open scope questions above.
