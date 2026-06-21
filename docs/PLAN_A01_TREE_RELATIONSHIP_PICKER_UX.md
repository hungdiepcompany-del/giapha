# Plan A-01 - Tree Relationship Picker UX

Status: `PASS_LOCAL_STATIC`

## Summary

Plan A-01 improves the Tree Editor relationship add UI so an operator no
longer has to remember or type a related member UUID manually.

The side panel now uses a Vietnamese search picker built from the already
loaded admin tree graph. The form still submits the selected person UUID as the
internal `related_person_id` value, and the existing server actions and
relationship service continue to enforce permissions and business rules.

## User Problem

Before this change, the Tree Editor side panel asked the user to type the UUID
of an existing related person. That made a normal genealogy workflow depend on
an internal identifier that users should not need to know.

## UX Before

- The selected person panel showed separate forms for adding parent, spouse or
  child relationships.
- Each form required a manual related person UUID input.
- The user had to leave the tree, find/copy an ID and paste it back into the
  relationship form.

## UX After

- The side panel shows `Người đang chọn: <tên người>`.
- Each relationship form keeps its existing behavior but uses a searchable
  member picker.
- The picker placeholder is `Tìm theo tên, năm sinh hoặc chi nhánh...`.
- Search results display human-readable labels such as name, birth year,
  generation number and branch name.
- Empty result copy is `Không tìm thấy thành viên phù hợp.`.
- The selected result is shown as `Kết quả chọn: <tên và thông tin phụ>`.
- UUID remains hidden/internal and is not presented as the primary user input.

## Files/Components Changed

- `components/tree/tree-editor-side-panel.tsx`
- `scripts/check-tree-relationship-picker-ux.cjs`
- `package.json`
- `docs/PLAN_A01_TREE_RELATIONSHIP_PICKER_UX.md`
- `docs/00_INDEX.md`
- `docs/08_AI_WORK_LOG.md`
- `docs/09_DECISION_LOG.md`
- `docs/99_NEXT_AI_HANDOFF.md`

## Relationship Picker Behavior

- Parent add form: selected related member is submitted as the parent candidate
  for the currently selected person.
- Spouse add form: selected related member is submitted as the spouse/partner
  candidate for the currently selected person.
- Child add form: selected related member is submitted as the child candidate
  for the currently selected person.
- Existing server actions remain unchanged:
  `addParentFromTreeAction`, `addSpouseFromTreeAction` and
  `addChildFromTreeAction`.
- Existing relationship service/validation remains unchanged.

## Internal UUID Behavior

- The picker uses `person.personId` as the internal option value.
- The submitted field name remains `related_person_id`.
- Code identifiers such as `personId`, `related_person_id` and internal route
  or permission values remain English and unchanged.
- UUID is not shown as the user-facing label or placeholder in the Tree Editor
  relationship picker.

## Vietnamese UI Copy Result

Result: PASS.

New user-visible copy is Vietnamese with diacritics:

- `Người đang chọn`
- `Tìm thành viên`
- `Tìm theo tên, năm sinh hoặc chi nhánh...`
- `Không tìm thấy thành viên phù hợp.`
- `Kết quả chọn`
- `Chưa chọn thành viên.`
- `ID nội bộ được dùng tự động sau khi chọn, người dùng không cần nhập thủ công.`

Technical/internal values remain unchanged.

## Privacy/Permission Result

Result: PASS.

- The picker uses the already loaded admin tree graph from the existing
  Tree Editor service path.
- No new API endpoint was added.
- No permission or auth logic was changed.
- The existing `/admin/tree/edit` permission checks remain in place.
- Relationship mutations still go through the existing relationship service and
  require `relationships.create`.
- The picker does not expose `notes_private`, `source_note`, hidden
  relationship facts, token/key/session/cookie values or service-role material.

## Deferred Items

- Inline create-new-person from Tree Editor: DEFERRED.
- Server-side remote search endpoint: DEFERRED because the already loaded tree
  graph is sufficient for this scoped UX change.
- Broader `/admin/relationships` UUID form replacement: DEFERRED to a separate
  UX phase.

## Validation Results

- `npm run check:tree-relationship-picker-ux`: PASS.
- Full validation is recorded in `docs/08_AI_WORK_LOG.md` and
  `docs/99_NEXT_AI_HANDOFF.md`.

## Recommended Next Phase

Recommended next phase: optional browser-level Tree Editor UX smoke with an
authenticated operator session prepared by the owner, or a separate scoped
phase to replace UUID inputs on `/admin/relationships`.
