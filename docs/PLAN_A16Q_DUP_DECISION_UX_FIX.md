# A-16Q-DUP-DECISION-UX-FIX - Persist Saved Duplicate Decision UI State

Status: `A16Q_DUP_DECISION_UX_FIX_STATUS=SAVED_DECISION_UI_STATE_PERSISTED`

Marker: `A-16Q-DUP-DECISION-UX-FIX`

## Context

After A-16Q-DUP-LIVE-SAVE-FIX, duplicate decision save works. Owner verified
session:

```text
2af4bfb6-a20e-453e-9804-1b8c0afbdd68
```

Owner SQL result:

```text
owner_decision,count
create_new,8
```

That means all 8 duplicate decisions were saved to staging DB. The remaining
problem was UI clarity: after save/refresh, rows could look like they were not
saved clearly enough.

## Fix

Updated duplicate decision review UX:

- Drafts are initialized from the existing saved `ownerDecision` and
  `decisionNote` of each duplicate candidate.
- A saved row with `create_new`, `ignore_candidate`, `link_existing` or
  `needs_review` shows `Đã lưu quyết định`.
- `create_new` keeps the select value `Tạo người mới`.
- `needs_review` shows `Cần rà soát thêm` and remains a blocker for official
  import.
- `unresolved` means the row still has no saved owner decision and still blocks
  official import.
- Dirty state is tracked per candidate by comparing the draft decision/note
  against the saved candidate decision/note.
- `Lưu quyết định` is disabled when the row is not dirty, when another save is
  running, when the duplicate list is stale, or when the draft is invalid.
- The button text is:
  - `Đã lưu` when the row has a saved decision and no dirty change.
  - `Lưu quyết định` when the owner changes decision or note.
  - `Đang lưu...` while the PATCH is in flight.
- After PATCH success, local saved state is updated from the response and note,
  so the row immediately becomes clean/saved without making the owner wonder if
  the save worked.
- The UI keeps one save notice at a time, so success and error are not shown
  together.
- The UI does not auto decide duplicates for the owner.

The panel key now includes duplicate saved state, so a server refresh from DB
state like `create_new,8` remounts the duplicate review client with saved values
instead of retaining stale local state.

## Gate Behavior

Duplicate gate rules remain:

- `unresolved` blocks official import.
- `needs_review` blocks official import.
- `create_new`, `ignore_candidate` and `link_existing` are staging decisions
  only; they do not create, link, merge or delete real genealogy records in this
  phase.
- `canRunOfficialImport=false`.
- The official import button remains disabled.

## Boundary

A-16Q-DUP-DECISION-UX-FIX confirms:

```text
A16Q_DUP_DECISION_UX_FIX_SQL_STATUS=NOT_RUN
A16Q_DUP_DECISION_UX_FIX_DB_PUSH_STATUS=NOT_RUN
A16Q_DUP_DECISION_UX_FIX_MIGRATION_REPAIR_STATUS=NOT_RUN
A16Q_DUP_DECISION_UX_FIX_SEED_STATUS=NOT_RUN
A16Q_DUP_DECISION_UX_FIX_RPC_STATUS=NOT_CALLED
A16Q_DUP_DECISION_UX_FIX_OFFICIAL_IMPORT_POST_STATUS=NOT_CALLED
A16Q_DUP_DECISION_UX_FIX_REAL_GENEALOGY_WRITE_STATUS=NO_WRITE
A16Q_DUP_DECISION_UX_FIX_AUTO_DECISION_STATUS=NO_AUTO_DECISION
A16Q_DUP_DECISION_UX_FIX_DEPLOY_STATUS=NOT_DEPLOYED
A16Q_DUP_DECISION_UX_FIX_PUSH_STATUS=NOT_PUSHED
```

No SQL, no DB push, no migration repair, no seed, no RPC call, no POST
`/official-import`, no writes to real people/relationships/families/layout/tree/
revision/profile data, no auto duplicate decision, no deploy and no push.
