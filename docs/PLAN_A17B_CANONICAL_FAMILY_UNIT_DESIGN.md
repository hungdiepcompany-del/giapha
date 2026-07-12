# A-17B - Canonical Family Unit Design

Date: 2026-07-12

Status: `A17B_STATUS=CANONICAL_FAMILY_DESIGN_READY_FOR_OWNER_REVIEW`

## Principle

A canonical family represents one meaningful parent or union context and all
children belonging to that context. It is not keyed by a child ID.

Correct structure:

```text
Cha A + Mẹ B
    |
Đơn vị gia đình
 /      |       \
Con 1  Con 2   Con 3
```

Incorrect structure:

```text
Cha A + Mẹ B -> Gia đình 1 -> Con 1
Cha A + Mẹ B -> Gia đình 2 -> Con 2
Cha A + Mẹ B -> Gia đình 3 -> Con 3
```

## Canonical Identity Contract

`A17B_CANONICAL_IDENTITY_NOT_CHILD_KEYED=YES`

Canonical identity must evaluate:

- `normalizedActiveParentIds`: sorted active parent person IDs.
- `unionIdentity`: optional couple or union record identity when present.
- `relationshipPeriod`: date or period semantics when needed.
- `familyStatus`: active, separated, remarried, unknown, legacy or owner-marked.
- `sourceProvenance`: import source, manual edit, owner correction and audit
  lineage.
- `legacyException`: explicit marker for records that should remain separate.

Sorted parent IDs are necessary but not sufficient:

- `A17B_SORTED_PARENT_IDS_SUFFICIENT_FOR_ALL_CASES=NO`
- `A17B_OWNER_REVIEW_REQUIRED_FOR_AMBIGUOUS_UNIONS=YES`

## Required Domain Operations

The next implementation phase should provide interfaces equivalent to:

- `normalizeParentSet`
- `buildCanonicalFamilyIdentity`
- `findCanonicalFamily`
- `findOrCreateCanonicalFamily`
- `attachParentToCanonicalFamily`
- `attachChildToCanonicalFamily`
- `attachCoupleMetadata`
- `classifyFamilyMergeSafety`
- `previewFamilyReconciliation`
- `buildFamilyRollbackManifest`

Operation contract:

- `findOrCreateCanonicalFamily` may create a row only in a future approved
  mutation phase.
- `attachChildToCanonicalFamily` must preserve child relationship type such as
  biological, adopted, stepchild or unknown.
- `attachCoupleMetadata` must not duplicate a union already represented by the
  canonical family.
- `previewFamilyReconciliation` must be read-only and must return counts,
  safety classes and rollback requirements.
- `buildFamilyRollbackManifest` must be available before any reconciliation.

## Merge Safety Classes

- `SAFE_AUTOMATIC_CANDIDATE`: same normalized active parent set, same meaningful
  union identity, compatible status, compatible relationship period, compatible
  provenance and no conflicting child semantics.
- `OWNER_REVIEW_REQUIRED`: likely duplicate but status, provenance, period,
  adoption/stepchild semantics or couple linkage needs human confirmation.
- `BLOCKED_AMBIGUOUS`: insufficient evidence or conflicting data makes merge
  unsafe.
- `NOT_A_DUPLICATE`: same people can remain separate because the family context
  is meaningfully different.

## Required Case Behavior

| Case | Target behavior |
| --- | --- |
| 1. Two parents with multiple children | One canonical family unit contains both parents and all children when union identity is compatible. |
| 2. One known parent with multiple children | One single-parent canonical unit may contain multiple children; do not require an unknown second parent row. |
| 3. Two parents with no children | Keep as a family or union context only when owner intent or couple metadata exists. |
| 4. One person with multiple spouses | Create separate canonical identities per spouse or union context. |
| 5. Remarriage to a different spouse | Separate canonical family units. |
| 6. Repeated relationship with the same spouse | Do not merge automatically when relationship period or status marks distinct unions. |
| 7. Biological and adopted children in one family | Allow in one unit when owner intent says one household/family; preserve child relationship type per membership. |
| 8. Stepchildren | Allow attachment with explicit stepchild semantics; do not treat as duplicate biological lineage. |
| 9. Unknown parent | Represent known-parent unit and unknown-side metadata without inventing a person. |
| 10. Parent added after child already exists | Recompute canonical identity and move or merge only through review-safe operation. |
| 11. Existing couple relationship but no family | `attachCoupleMetadata` may seed a canonical unit in a future approved mutation phase. |
| 12. Existing family but no couple relationship | Family remains canonical source of the union; couple edge may be derived display metadata. |
| 13. Legacy duplicate families with identical parents | Classify as `SAFE_AUTOMATIC_CANDIDATE` only when child and union semantics are compatible. |
| 14. Families with meaningful differences that must not be merged | Classify as `NOT_A_DUPLICATE` or `OWNER_REVIEW_REQUIRED`. |
| 15. Family with more than two parent members | Preserve as special case; require owner review before splitting or merging. |
| 16. Soft-deleted memberships | Exclude from active identity, but include in rollback and conflict review. |
| 17. Conflicting source data | Classify as `BLOCKED_AMBIGUOUS`. |
| 18. Same child attached to multiple families intentionally | Preserve multiple memberships with visible Vietnamese explanation. |
| 19. Same child attached to equivalent families accidentally | Candidate for merge only with rollback manifest and owner approval. |
| 20. Family without sufficient information for canonicalization | Keep unchanged and classify as `BLOCKED_AMBIGUOUS`. |

## Data And Service Boundary

`A17B_SCHEMA_CHANGE_REQUIRED_NOW=NO`

This design phase does not create schema or migration changes. Future phases
must decide whether canonical identity is persisted in existing columns, derived
from memberships, or backed by new schema.

Service boundary:

- Import, admin edit and reconciliation must call the same canonical-family
  domain service.
- The graph builder must never infer merge decisions by itself.
- UI actions such as `Thêm cha`, `Thêm mẹ`, `Thêm phối ngẫu` and `Thêm con`
  must call domain operations that can reuse existing canonical units.

## Owner Review Questions

- Should repeated relationship with the same spouse usually be one family unit
  or multiple units by period?
- Should adopted children display in the same trunk by default or require a
  visual marker?
- Should single-parent imported rows be merged when a second parent is later
  added manually?
- What wording should explain an intentionally multi-family child membership to
  older family members?
