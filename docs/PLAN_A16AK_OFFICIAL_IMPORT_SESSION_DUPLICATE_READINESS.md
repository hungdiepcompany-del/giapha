# A-16AK - Official Import Session And Duplicate Decision Readiness

## Status

`A16AK_STATUS=PASS_SOURCE_UI_BINDS_IMPORT_READINESS_TO_AUDITED_SESSION_FAIL_CLOSED`

`A16AK_CLASSIFICATION=SOURCE_UI_SESSION_SELECTION_MISMATCH_FOR_IMPORT_READINESS`

`A16R_IMPORT_RETRY_NEXT=NO`

## Production observation that triggered this phase

- Official import button remains locked.
- Current viewed session:
  `cc7c7e6a-58fe-4824-be57-86d00b008306`.
- Audited official import session:
  `2af4bfb6-a20e-453e-9804-1b8c0afbdd68`.
- Production UI reported that the current viewed session did not match the
  audited official import session.
- Production UI reported 8 duplicate candidates still lacked owner decisions.
- Production UI reported the review pack was not ready for owner review.

## Diagnosis

The source issue was page-level session selection for the owner import review
surface.

Before A-16AK, `/admin/exports/import` loaded the latest listed import session
with:

`getImportManifest(importSessionsResult.sessions[0].id)`

That made `ImportSessionManifestPanel`, duplicate-decision review, review-pack
readiness and official-import gate messaging evaluate the currently latest
session instead of the audited A-16R session. This explains why production could
show a current viewed session mismatch and duplicate/readiness blockers for a
different session.

## Source fix

`/admin/exports/import` now loads the audited A-16R session directly:

`A16AK_UI_AUDITED_SESSION_SOURCE=A16R_AUDITED_OFFICIAL_IMPORT_SESSION_ID`

`A16AK_UI_GET_IMPORT_MANIFEST_CALL=getImportManifest(A16R_AUDITED_OFFICIAL_IMPORT_SESSION_ID)`

The owner-facing import page also displays the audited session id so the owner
can distinguish the reviewed A-16R session from the newest session and from the
general `family.json` backup.

## Gate behavior

- The duplicate decision UI is still staging-only.
- Duplicate decisions can only be saved through the scoped duplicate-decision
  endpoint for the loaded audited session.
- The official import button remains disabled in the UI.
- The source does not call `POST /official-import`.
- The source does not run direct/manual RPC from the UI.
- A-16R import retry remains `NO`.

## Remaining production blocker

`A16AK_BLOCKER=DEPLOY_AND_AUTHENTICATED_OWNER_REVIEW_REQUIRED_TO_PROVE_AUDITED_SESSION_DUPLICATE_DECISION_RUNTIME_STATE`

After this source fix is deployed, owner/admin must revisit `/admin/exports/import`
and review the audited session:

- If the audited session shows duplicate unresolved/needs_review count 0 and the
  review pack ready, a later read-only smoke can record readiness evidence.
- If the audited session still shows 8 unresolved duplicate candidates, owner
  must make the duplicate decisions in that audited session before any later
  import execution can be considered.

## Safety

- `A16AK_POST_OFFICIAL_IMPORT_CALLED=NO`
- `A16AK_DIRECT_RPC_CALLED=NO`
- `A16AK_REAL_GENEALOGY_WRITE=NO`
- `A16AK_SQL_RUN=NO`
- `A16AK_DB_PUSH_RUN=NO`
- `A16AK_MIGRATION_REPAIR_RUN=NO`
- `A16AK_SEED_RUN=NO`
- `A16AK_DEPLOY_RUN=NO`
- `A16AK_AUTH_USER_ROLE_PERMISSION_MEMBERSHIP_MUTATION=NO`
- `A16AK_RAW_JSON_COMMITTED=NO`
- `A16AK_WRANGLER_TOML_CHANGED=NO`

## Next action

Deploy A-16AK through the approved GitHub Actions path only after this commit is
pushed in a later explicit publication phase. Then run authenticated owner
read-only UI smoke on `/admin/exports/import` to verify the audited session and
duplicate decision readiness without running official import.
