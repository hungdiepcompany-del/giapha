# Phase 111 - Vietnamese Genealogy Real Migration File

Status: `REAL_MIGRATION_FILE_CREATED_NOT_APPLIED`

Apply status: `NOT_APPLIED`

## Summary

Phase 111 creates the owner-approved real migration file for the first Vietnamese genealogy lineage metadata tables.

Owner approval covers file creation only. This phase does not apply DB changes, execute SQL, mutate production data, seed data, backfill existing rows, deploy, change runtime app code, change UI, create a Worker, change OpenNext/Wrangler config or add runtime dependencies.

## Migration File Path

`db/migrations/20260618_0008_vietnamese_genealogy_first_migration.sql`

Required migration markers:

```sql
-- VIETNAMESE_GENEALOGY_PHASE_111_REAL_MIGRATION
-- OWNER_APPROVED_FILE_CREATION_ONLY
-- DO_NOT_APPLY_WITHOUT_SEPARATE_PHASE_113_APPROVAL
```

## Approved Scope

Approved tables included:

- `clans`
- `clan_branches`
- `generation_rules`
- `person_branch_memberships`

The migration is additive-only. It creates new lineage metadata tables, indexes, constraints, update triggers and RLS policies. It does not change existing `people`, relationship, tree layout, revision, export or backup tables.

## Explicitly Excluded Scope

Not included in this migration:

- `person_names`
- `person_life_events`
- `person_burials`
- `person_media`
- media processing
- large export/import/GEDCOM/ZIP work
- runtime app changes
- UI changes
- Worker or service creation
- DB apply
- seed data
- production data mutation
- automatic backfill from `people.branch_name`
- automatic backfill from `people.generation_number`

## Table Notes

### `clans`

Stores lineage root metadata, including code, clan name, family name, origin place, optional founder person, optional current head person, description, visibility, audit fields and soft delete fields.

Important constraints and indexes:

- nonblank `clan_code`
- nonblank `clan_name`
- `visibility` in `public`, `family`, `private`
- unique active `clan_code`

### `clan_branches`

Stores `chi` and `nhanh` hierarchy inside a clan, including parent branch, branch code/name, branch level, sort order, optional founder/head/representative people, description, visibility, audit fields and soft delete fields.

Important constraints and indexes:

- nonblank `branch_code`
- nonblank `branch_name`
- `branch_level >= 1`
- branch cannot parent itself
- unique active `branch_code` per clan
- composite `(id, clan_id)` uniqueness for branch-to-clan validation

### `generation_rules`

Stores generation numbering rules for a clan or branch.

Phase 111 chooses `start_generation >= 1` to align with existing `people.generation_number > 0` semantics and the `root_is_one` default.

Important constraints:

- optional `branch_id` must belong to the same `clan_id`
- `numbering_method` is checked
- adopted, step and spouse policy values are checked
- no generation recomputation or backfill is performed

### `person_branch_memberships`

Stores person-to-clan/branch membership metadata and optional generation override notes.

Important constraints:

- optional `branch_id` must belong to the same `clan_id`
- `membership_type` in `bloodline`, `spouse`, `adopted`, `step`, `in_law`, `unknown`
- `generation_number` is null or `>= 1`
- unique active primary membership per person
- no automatic backfill from existing free-text fields

## RLS/Privacy Notes

RLS is enabled for all four new tables:

- `clans`
- `clan_branches`
- `generation_rules`
- `person_branch_memberships`

No public-wide direct table policy is added.

Read policies allow authenticated users with `people.view` or `tree.view` to read non-deleted rows. Insert and update policies use existing permissions only: `people.update`, `relationships.update`, `tree.edit_layout` or `settings.manage`.

No new permission rows are created in Phase 111. Future runtime/UI phases may narrow permissions further if the owner approves a dedicated lineage management permission.

Public output must continue to go through server-side DTO/privacy filtering. Living-person branch membership and internal rule notes must not be sent directly to public clients.

## Export/Import Follow-Up

Future export/import work must preserve these tables in `family.json` with stable IDs and reference validation:

- clan references
- branch parent references
- branch-to-clan consistency
- generation rule root person references
- membership person/clan/branch references
- visibility/privacy flags

GEDCOM remains partial and JSON-first for clan, branch and generation metadata. Large export/import/GEDCOM/ZIP processing is not part of Phase 111.

## Worker/Runtime Status

- Main Worker touched: NO
- Runtime dependency added: NO
- New service Worker created: NO
- OpenNext/Wrangler config changed: NO
- Worker size risk introduced by Phase 111: NO
- Runtime app change: NO
- UI change: NO
- Heavy export/import/media work: deferred to boundary-governed future phases

Any future large export/import/media/GEDCOM/ZIP work must follow `docs/RUNTIME_WORKER_GUARDRAIL.md` and `docs/SERVICE_BOUNDARY_ROADMAP.md`.

## Apply Status

`NOT_APPLIED`

This migration file must not be applied until a separate owner-approved apply phase exists.

## Required Next Phase

Recommended next phase: Phase 112 Domain Migration Apply Readiness.

Phase 112 should prepare the apply checklist, backup/snapshot requirement, Supabase project ref confirmation, rollback plan, post-apply verification plan and no-go conditions.

Phase 113 may execute/apply only after separate explicit owner approval.
