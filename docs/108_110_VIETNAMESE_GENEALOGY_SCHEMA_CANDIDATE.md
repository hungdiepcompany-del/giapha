# Phase 108-110 - Vietnamese Genealogy Schema Candidate Gate

Status: `SCHEMA_CANDIDATE_ONLY`

Markers:

- `VIETNAMESE_GENEALOGY_SCHEMA_CANDIDATE_ONLY`
- `DO_NOT_RUN_ON_PRODUCTION`
- `NOT_A_REAL_MIGRATION`

## Scope And Boundary

Phase 108-110 prepares a Vietnamese genealogy schema candidate, a static safety check and an approval gate before any real migration work.

This bundle does not create a real migration file, does not place files in `db/migrations/`, does not apply DB changes, does not execute SQL, does not mutate production data, does not deploy, does not change runtime app code, does not create a Worker and does not add runtime dependencies.

Phase 110 does not create a real migration file. Phase 111 may create a real migration file only after owner approval. Phase 113 may apply DB only after separate apply approval.

## Phase 108 - Schema Candidate Design

### Schema Strategy

There are two possible strategies for Vietnamese genealogy data.

1. Lightly extend `people`
   - Good for simple fields that naturally belong to one person and are read frequently with the person profile.
   - Examples: `death_place`, `occupation`, lunar date display metadata, manually confirmed generation override reason.
   - Risk: if too many clan, branch, memorial, media or event concerns are pushed into `people`, the table becomes hard to query, privacy-filter and export cleanly.

2. Add normalized supporting tables
   - Better for clan/branch hierarchy, generation rules, multiple names, repeated life events, burial records and media references.
   - Keeps genealogy truth separate from UI layout and avoids turning free-text fields into long-term source of truth.
   - Requires careful RLS, export/import mapping and additive migration review.

Recommendation:

- Required Now for candidate review: normalized tables for `clans`, `clan_branches`, `generation_rules`, `person_branch_memberships` and `person_names`.
- Recommended Next: `person_life_events`, `person_burials` and lightweight `people` additive fields for death place, occupation and lunar date metadata if review confirms they are simpler than separate event rows.
- Later: `person_media` as metadata only after Phase 118A media/storage boundary design confirms storage, privacy, thumbnail and export manifest rules.
- Do not use this bundle to create or apply the migration. The next implementation step is review, then owner approval before Phase 111.

### Candidate Tables And Fields

#### `clans`

- Purpose: represent a lineage or clan root such as `dong_ho`.
- Suggested fields: `id`, `clan_code`, `family_name`, `display_name`, `origin_place`, `founder_person_id`, `current_head_person_id`, `description`, `visibility`, audit fields, soft delete fields.
- Relationship to current tables: references `people.id` for founder and current clan head; does not replace `people.branch_name` immediately.
- Privacy impact: origin and representative can be public only when `visibility` allows it; notes remain family/private.
- Export/import impact: add to `family.json` before any GEDCOM mapping; GEDCOM may only receive safe notes where mappable.
- Runtime/Worker impact: light metadata CRUD can remain in main app; no file processing or heavy scan implied.
- Migration risk level: medium, because it introduces a root table and references to `people`.
- Priority: Required Now.
- Additive-only strategy: create table and nullable references without changing existing `people` data.

#### `clan_branches`

- Purpose: represent `chi` and `nhanh` hierarchy inside a clan.
- Suggested fields: `id`, `clan_id`, `parent_branch_id`, `branch_code`, `branch_name`, `branch_level`, `branch_head_person_id`, `representative_person_id`, `sort_order`, `visibility`, `notes`, audit fields, soft delete fields.
- Relationship to current tables: normalizes current `people.branch_name`; tree filters can use this later while existing free text remains as compatibility fallback.
- Privacy impact: branch membership and branch representatives must follow public/private rules for living people.
- Export/import impact: `family.json` must include branch hierarchy and stable IDs; import preview must validate branch references before any future write.
- Runtime/Worker impact: metadata lookup/filter is acceptable in main app; large branch-wide scans belong to later data-quality boundary review.
- Migration risk level: medium.
- Priority: Required Now.
- Additive-only strategy: create table with nullable parent and person references; do not rewrite existing branch text in this phase.

#### `generation_rules`

- Purpose: define how generation numbers are derived for a clan or branch.
- Suggested fields: `id`, `clan_id`, `branch_id`, `root_person_id`, `generation_start_number`, `numbering_method`, `counts_adopted_children`, `counts_step_children`, `override_policy`, `notes`, audit fields, soft delete fields.
- Relationship to current tables: complements `people.generation_number`; does not overwrite manually stored values.
- Privacy impact: root and rule metadata can reveal family structure, so public output must be sanitized.
- Export/import impact: include rules in `family.json`; GEDCOM has no complete equivalent, so most details stay JSON-only.
- Runtime/Worker impact: lightweight rule lookup can remain in main app; full recomputation across very large trees should be deferred to data-quality/service-boundary phases.
- Migration risk level: medium.
- Priority: Required Now.
- Additive-only strategy: create optional rules and keep existing `people.generation_number` valid.

#### `person_branch_memberships`

- Purpose: assign a person to a clan branch or sub-branch with primary membership and source notes.
- Suggested fields: `id`, `person_id`, `clan_id`, `branch_id`, `membership_type`, `is_primary`, `start_date`, `end_date`, `source_note`, `visibility`, audit fields, soft delete fields.
- Relationship to current tables: references `people`, `clans` and `clan_branches`; does not change relationship truth in `families`.
- Privacy impact: living-person branch membership may need family/private visibility even if the branch is public.
- Export/import impact: include memberships in `family.json`; import preview must validate person, clan and branch references.
- Runtime/Worker impact: normal profile/tree filtering metadata can be main app CRUD; bulk validation can be a later checker/service concern.
- Migration risk level: medium.
- Priority: Required Now.
- Additive-only strategy: create join table; no backfill required during candidate review.

#### `person_names`

- Purpose: store structured Vietnamese names beyond `full_name` and `display_name`.
- Suggested fields: `id`, `person_id`, `name_type`, `name_value`, `script`, `is_primary`, `visibility`, `notes`, audit fields, soft delete fields.
- Relationship to current tables: complements `people.full_name` and `people.display_name`; those fields remain compatibility surface for current UI and exports.
- Privacy impact: taboo name, courtesy name, dharma name and legal name can be family/private for living people.
- Export/import impact: `family.json` should preserve all names; GEDCOM can map safe primary names and keep non-mappable names in JSON.
- Runtime/Worker impact: light metadata CRUD; no Worker boundary issue.
- Migration risk level: low-medium.
- Priority: Required Now.
- Additive-only strategy: create table and preserve existing name fields.

#### `person_life_events`

- Purpose: record repeatable life events such as marriage ceremony, migration, occupation milestone, death anniversary or clan ceremony.
- Suggested fields: `id`, `person_id`, `family_id`, `event_type`, `event_date`, `event_date_precision`, `calendar_type`, `lunar_day`, `lunar_month`, `lunar_year`, `place`, `description`, `visibility`, `source_note`, audit fields, soft delete fields.
- Relationship to current tables: can evolve from planned `events`; may reference `families` for family-level events.
- Privacy impact: events may expose sensitive living-person details, so public DTOs must filter by `visibility` and event type.
- Export/import impact: include in `family.json`; GEDCOM receives only safe and mappable event types.
- Runtime/Worker impact: CRUD and small profile reads can stay in main app; large timeline or quality scans belong to later boundary review.
- Migration risk level: medium.
- Priority: Recommended Next.
- Additive-only strategy: create optional table after review; no existing field is removed.

#### `person_burials`

- Purpose: record burial, cemetery, grave, memorial and death anniversary details separately from the core person profile.
- Suggested fields: `id`, `person_id`, `burial_place`, `cemetery_name`, `grave_location_note`, `death_anniversary_calendar`, `lunar_death_day`, `lunar_death_month`, `memorial_note`, `visibility`, audit fields, soft delete fields.
- Relationship to current tables: references `people`; can also be represented as a specialized `person_life_events` type if review prefers fewer tables.
- Privacy impact: memorial and grave details can be sensitive; default should be family/private unless explicitly public-safe.
- Export/import impact: preserve full data in `family.json`; GEDCOM can receive only safe burial fields.
- Runtime/Worker impact: metadata CRUD is light; media or grave-photo processing is not part of this table and must follow media boundary.
- Migration risk level: low-medium.
- Priority: Recommended Next.
- Additive-only strategy: create optional table or defer into events design after review.

#### `person_media`

- Purpose: link a person to portrait, grave photo, family photo or document metadata.
- Suggested fields: `id`, `person_id`, `media_kind`, `storage_ref`, `caption`, `visibility`, `sort_order`, `source_note`, audit fields, soft delete fields.
- Relationship to current tables: should align with planned `media_assets`; may be unnecessary if `media_assets.owner_person_id` and relation tables are enough.
- Privacy impact: media can expose living people and documents; default private until explicitly approved.
- Export/import impact: media manifest belongs in `family.json` and ZIP backup after media boundary design.
- Runtime/Worker impact: metadata only may be main app; upload, thumbnail, resize, compression, large ZIP and document processing must follow `docs/RUNTIME_WORKER_GUARDRAIL.md` and `docs/SERVICE_BOUNDARY_ROADMAP.md`.
- Migration risk level: medium-high due to storage, privacy and export implications.
- Priority: Later.
- Additive-only strategy: do not create until Phase 118A settles storage and service boundary.

### Lightweight `people` Field Candidates

These fields may be simpler as additive nullable columns if review decides they are core person attributes rather than repeatable records:

- `death_place`
- `occupation`
- `lunar_birth_day`, `lunar_birth_month`, `lunar_birth_year`
- `lunar_death_day`, `lunar_death_month`, `lunar_death_year`
- `generation_override_reason`
- `public_memorial_summary`

Keep this list candidate-only. It is not permission to alter the table.

### Current Model Compatibility

The candidate must remain compatible with:

- `people`: existing profile fields remain authoritative until new optional tables are reviewed and migrated.
- `families`: family units remain the parent-child context.
- `family_parents`: parent role and relationship type remain relationship truth.
- `family_children`: child relationship type and child order remain relationship truth.
- `couple_relationships`: spouse/partner history remains separate from `people`.
- `tree_layouts`: layout remains UI state, not genealogy truth.
- `tree_layout_nodes`: positions/collapsed state remain UI state and must not carry private genealogy facts.
- `revisions`: future CRUD for new tables must record changes without exposing sensitive fields publicly.
- export JSON/GEDCOM/ZIP foundation: `family.json` is the complete preservation target; GEDCOM is partial/mappable only; ZIP/media grows only after boundary review.
- public/private privacy model: all public DTOs must filter living-person, memorial, branch membership, notes and media data server-side.

### Worker And Service Boundary Note

Light metadata that can stay in main app CRUD:

- Clan rows.
- Branch rows.
- Generation rule rows.
- Person-to-branch membership rows.
- Person name rows.
- Small event or burial metadata reads after permission/privacy review.

Work that must follow `docs/RUNTIME_WORKER_GUARDRAIL.md` and `docs/SERVICE_BOUNDARY_ROADMAP.md`:

- Large export/import/media/GEDCOM/ZIP processing.
- Media upload processing, thumbnails, compression, document parsing or metadata extraction.
- Large import preview and conflict detection.
- Full-tree data-quality scans over large production datasets.
- Backup/restore production processing.

This schema candidate does not assume the main Cloudflare/OpenNext Worker will process large files, media, ZIP, GEDCOM or large imports.

### Runtime And Worker Boundary Status

- Main Worker touched: NO
- Runtime dependency added: NO
- New service Worker created: NO
- OpenNext/Wrangler config changed: NO
- Worker size risk introduced by this bundle: NO
- Heavy export/import/media work: deferred to boundary-governed future phases

## Phase 109 - Schema Candidate Static Safety Check

The checker for this bundle is `scripts/check-vietnamese-genealogy-schema-candidate.cjs`.

It must remain local/static only:

- No network calls.
- No `.env.local` read.
- No Supabase client.
- No SQL execution.
- No file mutation beyond normal process output.

Required checks:

- No new or modified files in `db/migrations/`.
- Candidate marker strings exist.
- Candidate has additive-only, privacy, export/import and worker/runtime notes.
- Approval gate exists before any real migration file.
- No destructive SQL appears in the candidate document or future candidate SQL drafts.
- Any future SQL draft under `docs/` or `scripts/` must include `VIETNAMESE_GENEALOGY_SCHEMA_CANDIDATE_ONLY`, `DO_NOT_RUN_ON_PRODUCTION` and `NOT_A_REAL_MIGRATION`.
- `package.json` adds only a checker script and no runtime dependency for this bundle.
- Runtime app directories remain untouched.

## Phase 110 - Real Migration File Approval Gate

Before Phase 111 can create a real migration file, all checklist items below must be explicitly approved.

Approval checklist:

- Owner approval required before real migration file creation.
- DB backup/snapshot required before apply.
- Supabase project ref confirmation required.
- Migration must be additive-only.
- Rollback/no-go plan required.
- Post-migration verification plan required.
- Runtime/Worker impact confirmation required.
- Export/import compatibility confirmation required.
- Privacy/RLS review confirmation required.
- No DB apply without separate explicit approval.

No-go conditions:

- Owner approval is unclear.
- Current database backup/snapshot is missing.
- Supabase project ref is not confirmed.
- Candidate contains destructive SQL.
- Candidate changes auth, permission or RLS boundaries without explicit review.
- Candidate requires a runtime dependency or Worker in Phase 108-110.
- Export/import compatibility is unresolved.
- Public privacy filtering is unresolved.

Recommended next step:

- Review this schema candidate with the owner.
- If accepted, start Phase 111 only to create a real migration file.
- Do not apply DB until a separate Phase 113 apply approval exists.
