# Phase 103-107 - Vietnamese Genealogy Domain Model Readiness

Status: `DOCS_CHECKER_ONLY`

## Scope And Boundary

Phase 103-107 starts the Vietnamese genealogy product track after the infrastructure and backup-permission verification work. This bundle is deliberately limited to analysis, documentation and a static checker.

This bundle does not create a migration, does not apply DB changes, does not deploy, does not mutate production data and does not change runtime auth, permission, UI or service behavior.

## Phase 103 - Vietnamese Genealogy Domain Model Readiness

Vietnamese genealogy is not only a graph of parent-child edges. A usable family web app must represent how a family lineage talks about origin, clan branches, generations, roles, memorial information and public/private sharing.

Core domain concepts:

- `dong_ho`: the clan or lineage, usually organized around a shared ancestral line and family name.
- `chi`: a major branch of the clan, often split by children of an early ancestor or an agreed historical division.
- `nhanh`: a smaller branch inside a `chi`, usually useful when the family becomes large.
- `doi` or `the_he`: generation number counted from a chosen founder or reference person.
- `nguoi_khoi_to`: the founder or root ancestor used for generation numbering.
- `truong_ho`: clan representative or lineage head.
- `truong_chi`: branch representative.
- `nguoi_dai_dien_nhanh`: operational contact or representative for a smaller branch.

People in the domain:

- Member of the blood lineage.
- Spouse or partner connected to a lineage member.
- Biological child.
- Adopted child.
- Step child or spouse's child from another relationship.
- Person with an unknown or unverified relationship.
- Deceased person with memorial, death anniversary or burial information.

The target product should support Vietnamese family practice: identify the origin branch, show generation, preserve birth/death and memorial details, protect living-person privacy and export the complete data in durable formats.

### Required Domain Rules

- A person profile and a relationship edge are separate data concepts.
- A tree layout is not genealogy truth.
- A spouse does not automatically become a blood-lineage member unless explicitly classified by the family.
- A child relationship must record whether it is biological, adoptive, step, foster or unknown.
- Generation can be calculated from a root lineage, but the app also needs room for manually confirmed generation numbers where family books disagree.
- Memorial information can be sensitive and should follow privacy rules.

## Phase 104 - Existing Data Model Gap Analysis

The current app already avoids the simple `parent_id` and `spouse_id` model. It has `people`, `families`, `family_parents`, `family_children`, `couple_relationships`, tree layout tables, revision history and export/backup foundations.

### Current Strengths

- `people` already supports full name, display name, gender, birth/death dates, date precision, living status, birth place, home town, branch name, generation number, biography, private notes and visibility.
- Parent-child relationships already support biological, adoptive, step, foster and unknown child relationship types.
- Parent roles already support father, mother, parent and unknown.
- Couple relationships are separate from `people`, with status and date fields.
- Tree layout data is separated from relationship truth.
- Public/private service already sanitizes public output and protects living people.
- JSON/GEDCOM/ZIP export exists as a foundation for durable data.

### Gaps By Area

| Area | Current state | Gap | Priority |
| --- | --- | --- | --- |
| Clan/branch model | `people.branch_name` is free text | No normalized clan/branch table, representative, founder or sort order | Required Now |
| Generation rules | `people.generation_number` exists | No documented generation reference, numbering rule or override reason | Required Now |
| Person names | `full_name` and `display_name` exist | No structured birth name, common name, taboo name, courtesy name or dharma name | Required Now |
| Lunar dates | Gregorian date and precision exist | No lunar date fields or calendar metadata for birth/death/anniversary | Required Now |
| Burial and memorial | Not modeled directly | No burial location, cemetery, grave note, death anniversary or memorial privacy | Recommended Next |
| Life events | `events` is planned, not implemented | No structured events for marriage, migration, career, death anniversary or clan ceremonies | Recommended Next |
| Media | `media_assets` is planned, not implemented | No portrait/grave/document attachment model | Recommended Next |
| Relationship conflicts | Cycle check exists | Need richer warnings for duplicate biological parents, impossible dates and unclear relationships | Recommended Next |
| Branch filtering | Tree toolbar mentions filters | No normalized branch filter source | Required Now |
| Export compatibility | JSON/GEDCOM/ZIP foundation exists | New domain fields must be added to JSON first and GEDCOM where mappable | Required Now |

### Required Now

- Normalize the specification for clan, branch, sub-branch and generation.
- Specify person profile fields before adding schema.
- Specify relationship rules and conflict warnings.
- Preserve current RLS, permissions, public privacy and export requirements.
- Keep all schema work for Phase 108+ as candidate design, not this bundle.

### Recommended Next

- Design candidate tables for branch structure, person names, life events, burial/memorial records and media.
- Add static safety checks for additive-only schema candidates.
- Define how new fields flow into `family.json` and public-safe DTOs.

### Later

- UI for large family-tree navigation.
- Mobile and elder-friendly data entry.
- Production pilot with 50-100 sample people.
- GEDCOM mapping upgrades for any field that has a safe GEDCOM equivalent.

## Phase 105 - Person Profile Field Specification

The Vietnamese person profile should be richer than the current foundation but still privacy-aware.

| Field group | Field | Purpose | Privacy default | Current support |
| --- | --- | --- | --- | --- |
| Identity | Birth/legal full name | Official name at birth or on records | Family/private if living | Partial: `full_name` |
| Identity | Common/display name | Name family members use in UI/tree | Public-safe if approved | Yes: `display_name` |
| Identity | Taboo name / `ten_huy` | Traditional posthumous or ancestral name when known | Family/private | No |
| Identity | Courtesy name / `ten_tu` | Historical courtesy name where relevant | Family/private | No |
| Identity | Dharma name / `phap_danh` | Religious name where relevant | Family/private | No |
| Core | Gender | Tree and relationship interpretation | Public-safe if approved | Yes |
| Birth | Gregorian birth date | Exact or approximate birth date | Hide exact value for living public pages | Yes |
| Birth | Lunar birth date | Lunar birthday for family practice | Family/private by default | No |
| Death | Gregorian death date | Death record and display | Public-safe for deceased if approved | Yes |
| Death | Lunar death date | Death date by lunar calendar | Family/private or public for deceased if approved | No |
| Place | Home town / `que_quan` | Lineage origin and family context | Public-safe if approved | Yes: `home_town` |
| Place | Birth place | Place of birth | Family/private for living | Yes |
| Place | Death place | Place of death | Family/private by default | No |
| Work/life | Occupation | Main job, title, contribution | Family/private by default | No |
| Biography | Short biography | Public-safe summary when approved | Public/family/private by visibility | Yes: `short_bio` |
| Media | Portrait/avatar | Main profile image | Private unless approved and safe | No runtime media model |
| Status | Living/deceased/unknown | Privacy and display behavior | Public-safe as broad status | Partial: `is_living` |
| Privacy | Private note | Internal note for admins/family | Private only | Yes: `notes_private` |

### Public/Private Rules

- Living people: public pages should not expose exact birth date, lunar date, private note, precise location, contact details or private media.
- Deceased people: public display can include birth/death years, generation, branch and memorial summary only when `visibility` and field-level rules allow it.
- Private notes, sources containing personal documents, and sensitive memorial details must never be sent to public clients.
- Export for admins can include full data; any future public export must use public-safe DTOs.

## Phase 106 - Relationship Rule Specification

Relationships must be explicit, typed and reviewable. A family can preserve uncertainty without forcing a false biological edge.

### Parent And Child Types

| Relationship | Meaning | Data rule |
| --- | --- | --- |
| Biological father | Male or father-role biological parent | At most one active biological father warning per child |
| Biological mother | Female or mother-role biological parent | At most one active biological mother warning per child |
| Adoptive father/mother | Legal or family-recognized adoptive parent | Can coexist with biological parent, must be labeled |
| Step father/mother | Parent by marriage, not biological/adoptive unless separately recorded | Should not be used for generation bloodline calculation by default |
| Guardian | Caregiver or elder role without parent claim | Not a bloodline parent by default |
| Biological child | Child by birth | Used for bloodline/generation calculation |
| Adopted child | Adopted child | Family decides whether counted in branch/generation display |
| Step child | Spouse's child or child from a previous relationship | Not bloodline by default |
| Foster child | Care/foster relation | Not bloodline by default |
| Unknown child relation | Relationship is known but type is not verified | Needs review warning |

### Couple Relationship Types

The current `couple_relationships.relationship_status` should be used to distinguish current spouse, former spouse, divorced/separated/widowed or other partnership states. Future schema candidates can add `relationship_order`, ceremonial date and source fields if the family needs spouse order.

Rules:

- A person cannot have a couple relationship with themselves.
- Former spouse must remain historical, not be hard deleted.
- Multiple spouse relationships are allowed, but public display must be careful and culturally respectful.
- If spouse order is needed, it should be explicit rather than inferred from dates.

### Child Ordering

- Child order should use `family_children.sort_order` inside the family unit.
- If the child belongs to multiple family contexts, order must be scoped to the relevant family.
- Unknown order should be allowed and flagged as incomplete, not guessed.

### Conflict Warnings

The app should warn, not silently fix, when data looks inconsistent:

- One child has two active biological fathers or two active biological mothers.
- A person is their own ancestor or descendant.
- A parent-child edge creates a cycle.
- Death date is before birth date.
- Birth date is after a recorded child birth date by an impossible margin.
- Couple end date is before start date.
- Person is marked living but has a death date or memorial death anniversary.
- Relationship type is unknown for an edge used in generation calculation.

## Phase 107 - Branch, Generation, Clan Structure Specification

Vietnamese genealogy needs a normalized structure for clan and branch navigation. The current `branch_name` is useful for display but not enough for a durable product.

### Clan Structure

Recommended conceptual model for Phase 108 candidate design:

- `clans`: lineage root, family name, home village/origin, founder person, current clan head and description.
- `clan_branches`: branch or sub-branch tree with parent branch, branch head, representative, sort order and visibility.
- `generation_rules`: root person, generation start number, numbering method and notes.
- `person_branch_memberships`: person-to-branch assignment with start/end, primary flag and source note if needed.

This bundle does not create these tables. It only defines the vocabulary and rules so schema design can be reviewed safely in Phase 108.

### Generation Numbering

- The family must choose a reference root, usually the founder or a documented ancestor.
- `generation_number = 1` should normally refer to the selected root, unless the family book uses another convention.
- A person can have a manually confirmed generation number when historical records require an override.
- Adopted or step relationships must have an explicit rule for whether they count in generation display.
- Spouses should not automatically receive the bloodline generation number; they may display as spouse of generation N.

### Branch Sorting And Tree Filtering

- Branches need stable `sort_order` so tree and lists do not reorder unpredictably.
- Child order should continue to use relationship-scoped sort order.
- Tree filters should support clan, branch, sub-branch, generation range and public/internal mode.
- Public tree filters must use sanitized data and must not reveal hidden branch membership for private/living people.

### Export/Import Compatibility

- `family.json` must be the first complete export target for new clan, branch, generation, memorial and name fields.
- GEDCOM should receive only safe and mappable fields; non-mappable Vietnamese-specific fields remain in JSON.
- ZIP backup should include media and branch metadata once those models exist.
- Import preview must validate branch references, generation rule references and privacy flags before any future DB write.

## Recommendation For Phase 108-110

Proceed with a schema candidate only after this specification is accepted:

- Phase 108: write additive schema candidate design for names, branches, generation rules, memorial/life events and media references.
- Phase 109: add static safety checker for the candidate, including no DROP, no destructive ALTER, no auth/permission drift and export/privacy impact notes.
- Phase 110: create an approval gate before any real migration file.

Do not create or apply migrations until a later phase explicitly authorizes it.

