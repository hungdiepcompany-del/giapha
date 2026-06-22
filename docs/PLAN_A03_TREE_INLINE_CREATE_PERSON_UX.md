# Plan A-03 - Tree Inline Create Person UX

Status: `PASS_LOCAL_STATIC`

## Summary

Plan A-03 adds a quick-create flow inside the Tree Editor side panel. When an
operator selects a person on the tree, they can add a new father, mother, child
or spouse/partner without leaving the tree and without typing an internal ID.

The flow reuses the existing person and relationship services. It does not add
schema, migrations, routes, permissions, Worker code, dependencies or deploy
configuration.

## User problem

Before Plan A-03, adding a new relative from the tree required leaving the tree,
creating the person elsewhere, returning to the tree and then selecting that
person. Plan A-01 removed manual ID entry for existing people, but creating a
brand-new relative was still too many steps for a genealogy editor.

## Scope

- Add a compact inline create-person form to the Tree Editor side panel.
- Support father, mother, child and spouse/partner relationship types.
- Keep choosing existing members by the Plan A-01 name picker.
- Keep internal IDs and existing form field names behind the UI.
- Reuse existing `createPerson`, relationship services and server actions.

## Existing create person flow reviewed

Reviewed and reused:

- `lib/family/people-service.ts`: `createPerson()` with server-side
  `people.create` permission check, validation, slug generation and revision log.
- `lib/family/people-validation.ts`: existing person input normalization and
  validation rules.
- `app/(admin)/admin/people/actions.ts`: existing create-person route action.
- `app/(admin)/admin/tree/edit/actions.ts`: existing tree relationship actions.
- `lib/family/relationship-service.ts`: existing family, parent/child and couple
  creation services with permission and cycle checks.

Result: reusable safely from Tree Editor through a new server action that
composes existing services.

## UX before

- The Tree Editor could attach an existing member by name picker.
- Creating a brand-new relative still required using the People section first.
- The tree editing flow was interrupted by navigation away from the selected
  person.

## UX after

- The side panel shows `Người đang chọn`.
- The relationship section is grouped as:
  - `Chọn quan hệ`
  - `Chọn hoặc tạo thành viên`
  - confirmation through `Lưu và gắn quan hệ`
- Existing-member mode keeps the searchable member picker.
- New-member mode asks only for compact fields: `Họ và tên`, `Chọn giới tính`,
  `Năm sinh`, `Năm mất` and `Ghi chú ngắn`.
- Submit button shows `Đang lưu thành viên...` while pending.
- Success message is `Đã thêm thành viên và gắn quan hệ vào cây gia phả.`

## Relationship types supported

- Father: create person, attach as father of the selected person.
- Mother: create person, attach as mother of the selected person.
- Child: create person, attach as child of the selected person.
- Spouse/partner: create person, attach as spouse/partner of the selected
  person.

## Create person then attach relationship behavior

The new `createPersonAndAttachFromTreeAction` first creates the person through
`createPerson()`. It then attaches the relationship through the same services
used by existing Tree Editor relationship actions.

If person creation succeeds but relationship creation fails, the user receives
a safe Vietnamese message beginning with `Đã tạo thành viên mới nhưng chưa gắn
được quan hệ`. The state is not hidden or treated as a full success.

After success, tree and relationship paths are revalidated through the existing
tree revalidation helper.

## Internal UUID behavior

- UUIDs remain internal values.
- Existing internal field names such as `selected_person_id`,
  `related_person_id`, `person1_id`, `person2_id` and `person_id` remain
  unchanged where services expect them.
- User-facing labels do not ask users to type or paste UUID values.

## Vietnamese UI copy result

User-visible copy is Vietnamese with diacritics, including:

- `Thêm người thân`
- `Thêm vào cây gia phả`
- `Người đang chọn`
- `Quan hệ với người đang chọn`
- `Tạo thành viên mới`
- `Chọn thành viên đã có`
- `Lưu và gắn quan hệ`
- `Đang lưu thành viên...`

## Privacy/permission result

- `people.create` remains enforced by `createPerson()`.
- `relationships.create` remains enforced by relationship services.
- The page passes `canCreatePeople` and `canCreateRelationships` to render the
  correct fail-closed UI.
- No private notes, hidden facts, tokens, sessions, cookies, service role key,
  signed URLs, storage keys, SQL or stack traces are exposed in the side panel.

## Deferred items

- Multi-person creation in one step.
- Creating an entire multi-generation family at once.
- Portrait upload, media or document attachment.
- GEDCOM/ZIP import/export expansion.
- Large graph auto-layout.
- Advanced duplicate detection and merge flow.

## Checker result

Added `scripts/check-tree-inline-create-person-ux.cjs` and
`npm run check:tree-inline-create-person-ux`.

The checker verifies UI copy, loading guard, service reuse, success/error copy,
privacy markers, docs/log/handoff updates and no migration/SQL/Worker/config or
dependency drift.

## Validation results

Validation was run locally for this phase. See `docs/08_AI_WORK_LOG.md` and
`docs/99_NEXT_AI_HANDOFF.md` for the command-level result list.

## Recommended next phase

Browser-level authenticated Tree Editor smoke for the inline create-person UX,
or a narrow polish phase for family linking after quick-create.
