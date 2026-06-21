# UI-UX-VN-02 - Vietnamese Cultural UI/UX Hardening

Status: `PASS_LOCAL_STATIC`

## Summary

UI-UX-VN-02 hardens Vietnamese cultural UI/UX after UI-VN-01 and Plan A-01.
The main user-facing improvement is the broader relationship-management form:
operators now choose family members by Vietnamese name labels instead of being
asked to type or copy person UUIDs.

This is a UI/UX hardening phase only. It does not change schema, permissions,
routes, service contracts, database data, Worker boundaries, dependencies or
deployment configuration.

## Owner Requirements

- User-visible copy should be Vietnamese with diacritics.
- Tree and relationship workflows should favor kinship language and human names.
- Code/internal values may remain English.
- Internal IDs may remain submitted behind the UI, but ordinary operators should
  not be asked to remember or paste UUID values when a member list is available.

## UI Text Hardening Result

- `/admin/relationships` copy now explains choosing members by name.
- Relationship creation forms use Vietnamese labels such as `Chọn cha/mẹ`,
  `Chọn con`, `Chọn vợ/chồng/bạn đời`, `Nội bộ gia đình`, `Riêng tư` and
  `Công khai`.
- Manual visible `Person ID`, `ID thành viên`, `UUID thành viên`, `nhập UUID`
  and `copy ID` wording was removed from the relationship form surface.

## Vietnamese Style Direction

- Kinship labels are first-class: `cha/mẹ`, `con`, `vợ/chồng/bạn đời`, `dòng họ`,
  `chi`, `đời`.
- Technical identifiers remain hidden behind selectors where possible.
- Empty or blocked states explain the missing user capability in Vietnamese
  instead of exposing implementation details.

## Navigation/Menu Result

Existing navigation remains Vietnamese and culturally aligned. This phase did
not add routes or menu entries.

## Cây Gia Phả Priority Result

The Tree Editor remains the priority surface for daily genealogy editing. Plan
A-01 already replaced the Tree Editor related-person UUID field with a
Vietnamese searchable member picker. UI-UX-VN-02 keeps that guard in place and
extends the same human-name direction to `/admin/relationships`.

## Tree Viewer/Editor UX Result

- Tree Editor still uses the already-loaded graph for person selection.
- `related_person_id` remains the submitted internal field.
- The selected value remains the person UUID internally.
- No new API endpoint, route, permission, query boundary or full-tree scan was
  introduced.

## Form/Input/Dropdown Result

- `RelationshipForm` now accepts the already fetched member list and renders
  member selectors for parent/child creation.
- `CoupleForm` now accepts the same member list and renders selectors for spouse
  or partner creation.
- The `/admin/people/[id]` relationship panel passes the same member list to the
  relationship forms, so person-detail workflows also avoid visible manual ID
  entry.
- If a user lacks the required member-list visibility, the UI shows a Vietnamese
  warning that member viewing permission is needed before relationship creation.

## Code/Internal Values Unchanged

- Form field names remain `person_id`, `person1_id`, `person2_id`,
  `family_id`, `related_person_id` and the existing internal enum values.
- Existing relationship actions and validation remain the mutation boundary.
- UUIDs remain internal submitted values and are not replaced by names in server
  contracts.

## Privacy/Security Result

- No private notes or source notes are exposed by the new selectors.
- No service role key, token, cookie, session or bearer material is introduced.
- No auth or permission logic was changed.
- The member selector is only rendered from data fetched through existing
  server-side permission-checked services.

## Deferred Items

- Inline create-new-person from Tree Editor remains deferred.
- Full browser-level authenticated UX smoke remains deferred.
- Broader visual design polish is deferred to a separate UI phase.
- Export/import/GEDCOM/ZIP/media/backup runtime work remains outside this phase.

## Checker Result

Added `scripts/check-vietnamese-cultural-ui-ux.cjs` and
`npm run check:vietnamese-cultural-ui-ux` to guard:

- Vietnamese relationship form copy.
- Name-based relationship selectors.
- Tree Editor picker continuity.
- No visible manual UUID/ID copy on the hardened relationship form surfaces.
- No private/secret markers in the touched UI.
- No migration, SQL, Worker, OpenNext/Wrangler, workflow or dependency drift.

## Validation Results

Validation was run locally in this phase. See `docs/08_AI_WORK_LOG.md` and
`docs/99_NEXT_AI_HANDOFF.md` for command-level results.

## Recommended Next Phase

Optional browser-level authenticated Vietnamese relationship UX smoke, or a
small visual polish phase for dense admin relationship screens.
