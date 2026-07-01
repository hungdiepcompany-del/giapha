# PLAN A-16Q-DUP-RLS-VERIFY-UI-WRITE-PASS

## Marker

- Phase: `A-16Q-DUP-RLS-VERIFY-UI-WRITE-PASS`.
- Status:
  `A16Q_DUP_RLS_UI_WRITE_STATUS=OWNER_RLS_VERIFY_PASS_UI_WRITE_ENABLED`.
- Session:
  `A16Q_DUP_IMPORT_SESSION_ID=8158711d-1c3c-4208-987d-6fec6a1c5a1a`.

## Owner Evidence

- Owner provided `A16Q_DUP_RLS_OWNER_APPLY_CONFIRMED`.
- Owner provided `A16Q_DUP_RLS_VERIFY_PASS_CONFIRMED`.
- Owner manually applied:
  `db/migrations/20260701_0013_a16q_dup_duplicate_decision_rls_candidate.sql`.
- Owner ran and confirmed PASS for:
  `db/checks/20260701_check_a16q_dup_duplicate_decision_rls.sql`.
- Current duplicate state from owner evidence: `unresolved_duplicate_rows=8`.

## Scope

- Enable staging decision write only for duplicate candidates.
- Active route:
  `PATCH /api/admin/import-sessions/[sessionId]/duplicates/[duplicateId]`.
- The PATCH route updates only `import_duplicate_candidates`.
- The PATCH route updates only:
  `owner_decision`, `decided_by`, `decided_at`, `decision_note`.
- It validates both `sessionId` and `duplicateId`.
- It validates allowed owner decisions:
  `unresolved`, `create_new`, `link_existing`, `ignore_candidate`,
  `needs_review`.
- `link_existing` is valid only when the staging row has
  `existing_person_id`.

## Guardrails

- `create_new` only records a staging decision; it does not create a real
  person.
- `link_existing` only records a staging decision; it does not link a real
  person in this phase.
- `ignore_candidate` only records a staging decision; it does not delete
  staging data.
- `unresolved` and `needs_review` still block the future official import gate.
- `canRunOfficialImport=false`.
- The official import button remains disabled.
- No RPC call to `public.a16p_tx_execute_giapha4_official_import`.
- No POST call to `/official-import`.
- No SQL run by Codex.
- No DB push, no migration repair and no seed.
- No writes to real genealogy tables:
  `people`, `relationships`, `families`, `layout`, `tree`, `revision`,
  `profile`.
- No auto merge, no auto link existing and no owner decision chosen by Codex.
- No deploy and no push.

## UI

- The “Ứng viên trùng cần quyết định” block now allows owner to choose a
  staging decision and press “Lưu quyết định”.
- The UI copy states the decision is saved only in staging and has not been
  written into the real genealogy tree.
- The panel still shows that official import is locked until duplicate
  blockers are resolved and a later explicit execution phase is approved.

## Next Step

- Owner reviews the remaining 8 duplicate candidates and saves decisions.
- If all duplicates become `create_new`, `link_existing` or
  `ignore_candidate`, the duplicate blocker can be rechecked in a later phase.
- Official import still requires a separate session-specific execution
  approval phase.
