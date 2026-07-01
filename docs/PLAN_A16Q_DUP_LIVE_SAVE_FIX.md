# A-16Q-DUP-LIVE-SAVE-FIX - Live Duplicate Decision Session Binding Fix

Status: `A16Q_DUP_LIVE_SAVE_FIX_STATUS=LIVE_SESSION_BINDING_REPAIRED`

Marker: `A-16Q-DUP-LIVE-SAVE-FIX`

## Goal

A-16Q-DUP-LIVE-SAVE-FIX fixes the live UI failure where saving a duplicate
decision returned:

```text
DUPLICATE_DECISION_NOT_IN_SESSION
```

The phase focuses only on duplicate decision staging save/session binding. It
does not revalidate A-16G and does not open official import.

## Diagnosis

The duplicate review client initialized local React state from
`duplicateCandidates` and kept that state across server refreshes. After a new
manifest upload or a session refresh, the panel could render with the current
`sessionId` while the client still held duplicate candidates from the previous
session.

That stale state made PATCH call:

```text
/api/admin/import-sessions/[currentSessionId]/duplicates/[oldDuplicateId]
```

The server correctly rejected the request with
`DUPLICATE_DECISION_NOT_IN_SESSION`.

## Fix

Implemented UI/session binding repair:

- `components/imports/import-session-manifest-panel.tsx` keys
  `DuplicateDecisionReviewClient` by current session id and updated timestamp.
- `components/imports/duplicate-decision-review-client.tsx` snapshots the active
  session/list for the mounted component; the keyed parent remount resets
  candidates, drafts, notices and saved state for a new session.
- If the mounted component ever sees a different incoming session/list before
  remount, it fails closed with the stale-list warning.
- The client now detects stale duplicate list state and shows:
  `Danh sách ứng viên trùng đã cũ, vui lòng tải lại phiên nhập.`
- The save button is disabled while the duplicate list is stale.
- PATCH uses the duplicate candidate UUID from `candidate.id`, not
  `sourceRowIndex`.
- The client validates candidate id shape before PATCH to avoid sending
  row-number-like values.
- The UI keeps a single `saveNotice`, so success and error are not shown at the
  same time; success and error are not shown at the same time.
- The UI still never auto-decides duplicate candidates for the owner.

## Boundary

A-16Q-DUP-LIVE-SAVE-FIX confirms:

```text
A16Q_DUP_LIVE_SAVE_FIX_SQL_STATUS=NOT_RUN
A16Q_DUP_LIVE_SAVE_FIX_DB_PUSH_STATUS=NOT_RUN
A16Q_DUP_LIVE_SAVE_FIX_RPC_STATUS=NOT_CALLED
A16Q_DUP_LIVE_SAVE_FIX_OFFICIAL_IMPORT_POST_STATUS=NOT_CALLED
A16Q_DUP_LIVE_SAVE_FIX_REAL_GENEALOGY_WRITE_STATUS=NO_WRITE
A16Q_DUP_LIVE_SAVE_FIX_DEPLOY_STATUS=NOT_DEPLOYED
A16Q_DUP_LIVE_SAVE_FIX_PUSH_STATUS=NOT_PUSHED
```

No SQL, no DB push, no migration repair, no seed, no RPC call, no POST
`/official-import`, no writes to real people/relationships/families/layout/tree/
revision/profile data, no deploy and no push.

Official import remains locked:

```text
canRunOfficialImport=false
officialImportButtonDisabled=true
```

## Validation Target

Required checker:

```text
npm run check:a16q-dup-live-save-fix
```

The checker verifies the stale state guard, session-bound remount, duplicate UUID
PATCH path, no source-row-index PATCH, no auto decision, no RPC/official import
call and no migration/runtime deploy boundary changes.
