# A-17C - Phả Tuệ-Oriented Tree UX Contract

Date: 2026-07-12

Status: `A17C_STATUS=PHATUE_ORIENTED_UX_CONTRACT_READY_FOR_OWNER_REVIEW`

## Inspiration Boundary

`A17C_PHATUE_INSPIRATION_BOUNDARY=STRUCTURAL_PRINCIPLES_ONLY`

The future tree UX may learn from common Vietnamese genealogy product
principles associated with Phả Tuệ: family-first reading, clear lineage context,
compact union nodes, older-user readability and direct relative navigation.

This contract does not copy proprietary code, assets, styling, copy, database
schema or interaction details from Phả Tuệ.

## View Modes

All user-facing mode labels must be Vietnamese with diacritics:

- `Gia đình trực tiếp`
- `Tổ tiên`
- `Hậu duệ`
- `Toàn bộ cây`
- `Theo chi/nhánh`
- `Người chưa kết nối`

Mode behavior:

- `Gia đình trực tiếp`: start from a focus person, show parents, spouse or
  spouses, children and sibling context.
- `Tổ tiên`: show ancestors by depth with spouse context only when it explains
  a parent unit.
- `Hậu duệ`: show descendants by generation bands and keep sibling groups under
  one family trunk.
- `Toàn bộ cây`: available as an explicit mode, not the default first viewport.
- `Theo chi/nhánh`: filter by branch label or generation context.
- `Người chưa kết nối`: list isolated people and small disconnected components.

## Focus And Navigation

`A17C_INITIAL_VIEW_FOCUS_PERSON_REQUIRED=YES`

Required context:

- `focusPersonId`: selected person or owner-configured root.
- `focusComponentId`: connected component containing the focus person.
- `generationDepthUp`: default ancestor depth.
- `generationDepthDown`: default descendant depth.
- `hiddenAncestorCount`, `hiddenDescendantCount`, `hiddenSiblingCount`,
  `hiddenSpouseCount`: visible counters, not silent omission.

Navigation contract:

- Breadcrumb shows a Vietnamese path such as `Cây gia phả / Tổ tiên / Đời 4`.
- Deep links must preserve selected person, mode and depth.
- Expand/collapse is per family unit and per generation band.
- Whole-graph fit is a deliberate command, not the default after every load.
- Search result selection centers the person and switches to the person's
  connected component.

## Canvas Visual Contract

- Person nodes are the primary visual anchors.
- Family units are compact union/junction nodes, not large technical cards.
- Spouses should sit on the same horizontal rank when they form one family unit.
- Siblings should share one trunk from the same family unit.
- Generation bands should be readable with labels such as `Đời 1`, `Đời 2`,
  `Đời 3`.
- Branch labels should be human-facing Vietnamese text, not raw enum names.
- Edge labels shown to users must be Vietnamese, for example `cha`, `mẹ`,
  `con`, `phối ngẫu`, `con nuôi`, `con riêng`.
- Technical enum values remain internal and must not appear as visible canvas
  labels.

## Editing UX Contract

Visible action labels:

- `Thêm cha`
- `Thêm mẹ`
- `Thêm phối ngẫu`
- `Thêm con`
- `Liên kết người có sẵn`
- `Xem đơn vị gia đình`
- `Chuyển quan hệ sang đơn vị gia đình phù hợp`

Editing behavior:

- Adding a parent or child should preview the target canonical family unit
  before creating a new unit.
- Adding a spouse should explain whether the spouse is only a couple relation
  or also part of a family unit.
- If the system detects an equivalent family unit, the UI should say
  `Có đơn vị gia đình phù hợp` and offer owner review when needed.
- If ambiguity exists, the UI should say `Cần kiểm tra trước khi gộp` and keep
  data unchanged.
- Rollback or undo wording must be plain Vietnamese and must not expose internal
  transaction identifiers.

## Search Contract

`A17C_VIETNAMESE_SEARCH_NORMALIZATION_REQUIRED=YES`

Search must normalize:

- Vietnamese diacritics.
- Upper/lowercase.
- Extra spaces.
- Common nickname or display-name fields when available.

Search result behavior:

- Show enough context to distinguish people without exposing private data in
  public mode.
- Do not silently choose the first match when multiple people match.
- For older users, result rows need large hit targets and clear family context.

## Mobile And Older-User Requirements

- Primary text must remain readable on phones.
- Important actions need stable button positions and generous touch targets.
- The canvas must support pan, zoom and centered navigation without requiring
  precise gestures.
- Public tree mode must avoid private notes, private dates and raw internal
  identifiers.
- Error states should use calm Vietnamese wording and offer a safe retry or
  return action.

## Acceptance Contract

- `A17C_MODE_LABELS_VIETNAMESE_WITH_DIACRITICS=YES`
- `A17C_FOCUS_PERSON_CONTEXT_DEFINED=YES`
- `A17C_CONNECTED_COMPONENT_BEHAVIOR_DEFINED=YES`
- `A17C_COMPACT_FAMILY_UNIT_VISUAL_DEFINED=YES`
- `A17C_EDITOR_ACTION_LABELS_DEFINED=YES`
- `A17C_SEARCH_NORMALIZATION_CONTRACT_DEFINED=YES`
- `A17C_PUBLIC_PRIVACY_BOUNDARY_PRESERVED=YES`
