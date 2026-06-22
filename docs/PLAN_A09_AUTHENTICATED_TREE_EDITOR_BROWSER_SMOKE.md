# Plan A-09 - Authenticated Tree Editor Browser Smoke

Status: `A09_AUTH_BROWSER_SMOKE_SKIPPED_MISSING_EXPLICIT_AUTH_SESSION`

## Summary

Plan A-09 is the authenticated browser smoke gate for `/admin/tree/edit` after
the inline create-person, duplicate suggestion, Tree polish and read-only data
quality warning phases.

No authenticated smoke request or mutation was executed because the Codex
process did not receive an explicit owner/operator-provided auth session.

## Smoke target

- Route: `/admin/tree/edit`
- Intended environment: explicit local, staging or production base URL.
- Intended session: an owner/operator-prepared browser profile or local storage
  state path with the required Tree Editor permissions.

## Auth/session safety rule

The smoke runs only with an explicit safe session prepared outside the repo.
Raw passwords, OAuth codes, access tokens, refresh tokens, cookies and session
values must not be requested, printed or written to docs/code/logs.

The smoke must not use a service role key to imitate a UI user and must not
bypass permission checks.

## Explicit env/session requirements

The current checker recognizes these shell-only gates by name:

- `GIA_PHA_AUTH_BROWSER_SMOKE=1`
- `GIA_PHA_SMOKE_BASE_URL`
- `GIA_PHA_AUTH_STORAGE_STATE_PATH`

The storage-state file must remain local, uncommitted and owner/operator
managed. The checker tests presence only; it does not read or print the file.

## Smoke result

Result:
`A09_AUTH_BROWSER_SMOKE_SKIPPED_MISSING_EXPLICIT_AUTH_SESSION`

Smoke classification: `SAFE_SKIP`.

## Safe-skip reason

All explicit A-09 auth/browser environment gates were absent in the Codex
execution process. An authenticated session with `tree.view`,
`tree.edit_layout` and the intended relationship/person permissions could not
be proven.

No browser session was treated as authorized by assumption.

## Permission result

Status: `NOT_RUN_MISSING_EXPLICIT_AUTH_SESSION`.

No permission bypass was attempted. If a future explicit session lacks the Tree
Editor permissions, the expected result is:
`A09_AUTH_BROWSER_SMOKE_FAILED_MISSING_TREE_PERMISSION`.

## Tree canvas result

Status: `NOT_RUN_MISSING_EXPLICIT_AUTH_SESSION`.

Static source checks confirm the canvas, selected-person state and Vietnamese
node/card copy remain present, but static evidence is not an authenticated
browser PASS.

## Toolbar result

Status: `NOT_RUN_MISSING_EXPLICIT_AUTH_SESSION`.

Static source guards confirm `Vừa màn hình`, `Phóng to`, `Thu nhỏ` and
`Sắp xếp lại cây`, and reject the old English toolbar copy. The controls were
not exercised through an authorized browser session.

## Add-relative panel result

Status: `NOT_RUN_MISSING_EXPLICIT_AUTH_SESSION`.

Static source guards confirm:

- `Thêm người thân`
- `Cha`, `Mẹ`, `Con`, `Vợ/chồng/bạn đời`
- `Chọn thành viên đã có`
- `Tạo thành viên mới`
- `Lưu và gắn quan hệ`
- pending/disabled submit behavior
- no manual UUID input copy

## Existing member attach result

`A09_ATTACH_EXISTING_MUTATION_SKIPPED_MISSING_EXPLICIT_SAFE_DATASET`

No relationship was created. There was no explicit authorized session and no
explicit safe smoke dataset approval.

## Create new person attach result

`A09_CREATE_PERSON_MUTATION_SKIPPED_MISSING_EXPLICIT_SAFE_DATASET`

No smoke person was created and no relationship was attached.

## Duplicate suggestion result

Status: `NOT_RUN_MISSING_EXPLICIT_AUTH_SESSION`.

Static checks confirm the Vietnamese duplicate suggestion copy, existing-member
choice, create-new-anyway choice and maximum-five suggestion guard remain in
source. No private/source note is part of this UI surface.

## Data quality warning result

Status: `NOT_RUN_MISSING_EXPLICIT_AUTH_SESSION`.

Static checks confirm `Gợi ý hoàn thiện dữ liệu` and the read-only statement
`Đây chỉ là gợi ý kiểm tra, hệ thống không tự thay đổi dữ liệu.` No merge or
delete action was added.

## Vietnamese UI result

Static result: PASS.

The Tree Editor source uses Vietnamese user-visible labels and guards against
the listed English toolbar, duplicate and UUID-entry copy. This result does not
replace authenticated browser evidence.

## Privacy/security result

- No credential was requested or printed.
- No storage-state/session file was read.
- No auth material was written to the repository.
- No private notes, source notes, service role material, token, cookie, signed
  URL, raw SQL or stack trace was exposed.
- No mutation request was made.

## Bugs found/fixed

No new Tree Editor bug was established because the authenticated browser smoke
could not run. No runtime UI code was changed in Plan A-09.

## Deferred items

- Authenticated Tree Editor canvas/browser execution.
- Existing-member attach mutation smoke.
- Create-person-and-attach mutation smoke.
- Runtime merge/dedupe.
- Migration/schema/database work.
- Worker/config/dependency/deploy work.

## Checker result

Added `scripts/check-tree-editor-auth-browser-smoke.cjs` and
`npm run check:tree-editor-auth-browser-smoke`.

The checker safe-skips without explicit env/session, rejects a false PASS,
guards static Tree Editor copy/privacy, requires mutation skip markers and
blocks migration/SQL/Worker/config/dependency/deploy drift.

## Validation results

Validation was run locally. Required checker, static project checks, typecheck,
lint and build evidence are recorded in the work log and handoff.

## Recommended next phase

Retry Plan A-09 only after the owner/operator prepares an explicit authorized
browser session and, for mutation cases, separately approves a safe local or
staging dataset. Otherwise continue with non-mutating Tree UX work.
