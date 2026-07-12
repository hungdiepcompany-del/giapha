# A-17D - Canonical Tree Graph Contract

Date: 2026-07-12

Status: `A17D_STATUS=CANONICAL_GRAPH_CONTRACT_READY_FOR_OWNER_REVIEW`

## Purpose

A-17D defines the target graph model for the future canonical family tree. It
does not change runtime code, schema, migrations or production data.

## Core Types

```ts
type TreePersonNode = {
  kind: "person";
  id: `person:${string}`;
  personId: string;
  displayName: string;
  generationNumber?: number;
  branchLabel?: string;
  privacyMode: "admin" | "public";
  handles: {
    parentTop: boolean;
    childBottom: boolean;
    unionLeft: boolean;
    unionRight: boolean;
  };
};

type TreeFamilyUnit = {
  kind: "family_unit";
  id: `family:${string}`;
  familyId: string;
  canonicalIdentityKey: string;
  parentPersonIds: string[];
  childPersonIds: string[];
  unionStatus?: string;
  displayLabel: "Đơn vị gia đình";
  mergeSafety?: "SAFE_AUTOMATIC_CANDIDATE" | "OWNER_REVIEW_REQUIRED" | "BLOCKED_AMBIGUOUS" | "NOT_A_DUPLICATE";
};

type TreeGraphEdge = {
  id: string;
  kind: "parent_to_family" | "family_to_child" | "spouse_union" | "derived_couple_hidden";
  source: string;
  target: string;
  displayLabel?: "cha" | "mẹ" | "con" | "phối ngẫu" | "con nuôi" | "con riêng";
  rawRelationshipType?: string;
  privacySafe: boolean;
};

type TreeGraphContext = {
  mode: "admin" | "public";
  viewMode: "Gia đình trực tiếp" | "Tổ tiên" | "Hậu duệ" | "Toàn bộ cây" | "Theo chi/nhánh" | "Người chưa kết nối";
  focusPersonId?: string;
  focusComponentId?: string;
  connectedComponents: Array<{ id: string; personCount: number; familyUnitCount: number }>;
  layoutSource: "saved" | "locked_saved" | "generated" | "fallback";
};
```

## Graph Rules

- `A17D_PERSON_NODE_PRIMARY=YES`
- `A17D_FAMILY_UNIT_NODE_COMPACT=YES`
- `A17D_COUPLE_DUPLICATION_SUPPRESSED_WHEN_FAMILY_UNIT_EXISTS=YES`
- `A17D_TECHNICAL_ENUM_LABELS_INTERNAL_ONLY=YES`
- `A17D_CONNECTED_COMPONENTS_EXPLICIT=YES`
- `A17D_PUBLIC_PRIVACY_SANITIZATION_REQUIRED_BEFORE_GRAPH=YES`

Rules:

- Every visible parent-child path should pass through exactly one
  `TreeFamilyUnit`.
- Couple relationships are rendered as visible `spouse_union` edges only when
  they are not already represented by a family unit or when the UX explicitly
  asks to show couple metadata.
- A family unit can have zero, one, two or more parents, but the graph must mark
  one-parent, zero-parent and more-than-two-parent cases for review.
- One child may intentionally belong to multiple family units; the graph must
  explain this in Vietnamese rather than hiding the relationship.
- Raw relationship values may be included in internal data for editing but must
  be mapped before display.

## Layout Priority

`A17D_LAYOUT_PRIORITY_DEFINED=YES`

Priority order:

1. Locked saved position.
2. Saved position.
3. Generation-aware generated layout.
4. Deterministic fallback layout.

Layout rules:

- Spouses in one family unit should stay on the same horizontal rank.
- Siblings in one family unit should share a trunk and remain grouped.
- Generation bands should align by `generationNumber` when available and by
  derived lineage depth otherwise.
- Components should be laid out separately, with the focus component first.
- Whole-tree fit should never silently override a focus-person initial view.
- Missing saved-layout nodes must be reported as counts only.

## Handles And Edges

- Person nodes expose vertical handles for parent/child lineage.
- Person nodes expose side handles for union/spouse context.
- Family units expose parent-side and child-side handles.
- Edge routing should make spouse/union edges visually distinct from
  parent-child lineage.
- Public mode may hide or simplify labels while preserving safe structure.

## Diagnostics

`A17D_NO_PII_DIAGNOSTICS=YES`

Diagnostics may include:

- Counts.
- Component sizes.
- Node-kind counts.
- Missing layout node counts.
- Duplicate parent-set counts.
- Merge safety counts.
- Error codes such as `LAYOUT_FALLBACK_USED` or
  `CANONICAL_FAMILY_AMBIGUOUS`.

Diagnostics must not include names, dates, home towns, private notes, emails,
auth IDs, raw genealogy rows or raw import payloads.

## Future Implementation Boundary

- Graph builder consumes canonical domain data; it does not decide merge safety.
- Layout consumes graph context and saved-layout priority; it does not mutate
  saved layout.
- UI consumes Vietnamese display labels; it does not render raw enum values.
- Public graph projection must sanitize before graph construction or before
  returning graph data to the client.
