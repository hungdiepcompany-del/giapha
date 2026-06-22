# Plan A-04 + A-05 - Tree Editor Smoke And Duplicate Suggestion

Status: `PASS_LOCAL_STATIC`

## Summary

Plan A-04 reviewed the Tree Editor inline create-person flow added in Plan A-03.
Plan A-05 adds an advisory duplicate suggestion box when an operator creates a
new relative directly from the Tree Editor side panel.

The implementation uses only the already loaded Tree Editor graph. It does not
add schema, migrations, routes, permission keys, runtime dependencies, Worker
code or deploy configuration.

## Why A-04 and A-05 were grouped

The A-03 quick-create flow is the exact surface where duplicate member creation
can happen. Grouping the smoke review with the duplicate suggestion UX lets the
same source review confirm the existing flow first, then add a narrow guard
without changing the relationship service contract.

## A-04 smoke result

Result: `A04_AUTH_BROWSER_SMOKE_SKIPPED_MISSING_EXPLICIT_ENV`.

Static/source review found no A-03 blocker:

- Existing-member mode still submits through the existing relationship actions.
- New-member mode still calls `createPersonAndAttachFromTreeAction`.
- Father, mother, child and spouse/partner directions remain wired to the
  existing services.
- The UI still does not ask users to type or paste UUID values.
- Submit buttons still use a pending/disabled guard.

## A-04 safe-skip reason

No explicit authenticated browser smoke environment was present in the Codex
execution context. No credential was requested or printed, and no authenticated
browser claim was promoted from static review.

## A-03 bug fixes

No true A-03 bug was found that blocked A-05.

## A-05 user problem

When quickly adding a father, mother, child or spouse/partner, the person may
already exist in the family tree. Without a suggestion, operators can
accidentally create a second `Nguyễn Văn A` instead of attaching the existing
member.

## Duplicate suggestion UX result

The new-member form now shows `Gợi ý tránh tạo trùng` after the operator enters
a name. If similar existing members are found, the side panel shows up to five
safe suggestions with Vietnamese copy:

- `Có thể đã tồn tại thành viên tương tự`
- `Dùng thành viên này để gắn quan hệ`
- `Vẫn tạo thành viên mới`
- `Không tìm thấy thành viên tương tự`
- `Thành viên đã có`
- `Tạo mới vẫn đúng nếu đây là người khác trong gia đình`

## Matching strategy

Matching is local and advisory:

- Normalize Vietnamese names by trimming, lowercasing, collapsing spaces and
  comparing without diacritics.
- Prefer exact normalized name matches.
- Score medium matches when multiple name tokens overlap.
- Add light weight for equal or near birth/death years when present.
- Limit suggestions to five people.

## Use existing member behavior

Choosing `Dùng thành viên này để gắn quan hệ` switches the side panel to
existing-member mode, selects the matched person internally and submits through
the same existing relationship action. No new person is created.

Success copy for existing-member attachment is:
`Đã gắn quan hệ với thành viên đã có trong cây gia phả.`

## Create new anyway behavior

Choosing `Vẫn tạo thành viên mới` submits the existing quick-create form. The
person is created through `createPerson()` and then attached through the
existing relationship services.

Success copy for the new-member path is:
`Đã thêm thành viên mới và gắn quan hệ vào cây gia phả.`

## Internal UUID behavior

UUIDs and `personId` values remain internal form values. The UI shows names,
birth/death year, branch and generation information when already available, but
does not ask the operator to enter or paste an ID.

## Vietnamese UI copy result

User-visible text added in this bundle is Vietnamese with diacritics. English
words such as `Duplicate`, `Suggestion`, `Use existing`, `Create anyway` and
`Similar person` are not used as user-facing copy.

## Privacy/permission result

The suggestion box uses the same already loaded admin tree graph that the Tree
Editor already had permission to render. It does not show `notes_private`,
`source_note`, hidden relationship facts, tokens, cookies, sessions, service
role keys, signed URLs, storage keys, raw SQL or stack traces. Existing
server-side permission checks remain unchanged.

## Deferred items

- Merge duplicate members.
- Database-level dedupe.
- Unique constraints.
- Advanced whole-system fuzzy search.
- Multi-generation creation.
- Portrait upload, media or documents.
- GEDCOM/ZIP import/export.
- Backup/restore runtime.
- Separate Worker.
- Deploy.

## Checker result

Added `scripts/check-tree-duplicate-suggestion-ux.cjs` and
`npm run check:tree-duplicate-suggestion-ux`. The checker guards the duplicate
suggestion UI, required Vietnamese copy, internal ID boundary, no manual UUID
entry, docs/log/handoff updates and no migration/SQL/Worker/config/dependency
drift.

## Validation results

Validation was run locally for this bundle. See `docs/08_AI_WORK_LOG.md` and
`docs/99_NEXT_AI_HANDOFF.md` for the command-level result list.

## Recommended next phase

Recommended next phase: authenticated browser smoke for Tree Editor quick-create
when owner/operator provides an explicit browser/auth smoke environment, or a
narrow follow-up for merge/dedupe planning without schema changes.
