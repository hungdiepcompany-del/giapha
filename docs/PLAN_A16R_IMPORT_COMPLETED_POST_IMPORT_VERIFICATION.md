# A-16R - Import Completed Post-Import Verification

## Status

`A16R_STATUS=IMPORT_COMPLETED_POST_IMPORT_VERIFICATION`

Owner evidence supplied for the successful same-run import:

```text
Status=IMPORT_COMPLETED
Imported people count=102
Warnings count=0
Transaction helper call count=1
All same-run gates passed.
```

Codex did not call the official import RPC again, did not click or retry
official import, and did not execute mutation SQL. This record only captures
the successful owner evidence and the read-only post-import verification.

## Scope

`A16R_POST_IMPORT_VERIFICATION_SQL=db/checks/20260712_check_a16r_import_completed_post_import_verification.sql`

`A16R_POST_IMPORT_SQL_SCOPE=SELECT_ONLY_AGGREGATE_POST_IMPORT_VERIFICATION`

The verifier reads aggregate/status evidence for the target import session,
audit batch, rollback manifest, write manifest, and the created core tree rows.
It reports only counts/statuses and does not print genealogy row contents.

## Verification Result

- `SESSION_COMPLETED_STATE=write_completed`
- `OWNER_EVIDENCE_IMPORT_STATUS=IMPORT_COMPLETED`
- `IMPORTED_PEOPLE_COUNT=102`
- `IMPORTED_RELATIONSHIP_COUNT=201`
- `AUDIT_RECORD_COUNT=169`
- `ROLLBACK_MANIFEST_STATUS=ready`
- `ROLLBACK_MANIFEST_COUNT=1`
- `TRANSACTION_HELPER_CALL_COUNT=1`
- `WRITE_MANIFEST_STATUS=write_completed`
- `BASIC_TREE_PEOPLE_VISIBLE=YES`
- `BASIC_TREE_RELATIONSHIPS_VISIBLE=YES`
- `BASIC_TREE_AUDIT_REVISIONS_VISIBLE=YES`
- `OWNER_RESULT_WARNINGS_COUNT=0`
- `STORED_SESSION_WARNING_COUNT=46`
- `UNRESOLVED_BLOCKER_WARNING_COUNT=0`

The owner-supplied same-run import result returned `Warnings count=0`. The
database session still retains the historical `warning_count=46` from earlier
review evidence; the post-import safety gate therefore verifies that unresolved
blocker warnings are `0` and records the stored session counter separately.

Raw post-import verification output, normalized as CSV rows:

```text
A16R_IMPORT_COMPLETED_POST_IMPORT_VERIFY,a16r_import_completed_post_import_verified,PASS,21/21
A16R_IMPORT_COMPLETED_POST_IMPORT_VERIFY,audit_record_count_matches_rollback_revisions,PASS,169
A16R_IMPORT_COMPLETED_POST_IMPORT_VERIFY,audit_record_count_present,PASS,169
A16R_IMPORT_COMPLETED_POST_IMPORT_VERIFY,basic_tree_audit_revisions_visible,PASS,169
A16R_IMPORT_COMPLETED_POST_IMPORT_VERIFY,basic_tree_people_visible,PASS,102
A16R_IMPORT_COMPLETED_POST_IMPORT_VERIFY,basic_tree_relationships_visible,PASS,201
A16R_IMPORT_COMPLETED_POST_IMPORT_VERIFY,imported_people_count_102,PASS,102
A16R_IMPORT_COMPLETED_POST_IMPORT_VERIFY,imported_relationship_count_present,PASS,201
A16R_IMPORT_COMPLETED_POST_IMPORT_VERIFY,one_completed_audit_batch,PASS,1
A16R_IMPORT_COMPLETED_POST_IMPORT_VERIFY,owner_evidence_import_completed_status,PASS,completed
A16R_IMPORT_COMPLETED_POST_IMPORT_VERIFY,owner_evidence_warnings_count_zero_recorded,PASS,owner_evidence=0
A16R_IMPORT_COMPLETED_POST_IMPORT_VERIFY,rollback_manifest_count_one,PASS,1
A16R_IMPORT_COMPLETED_POST_IMPORT_VERIFY,rollback_manifest_ready,PASS,ready
A16R_IMPORT_COMPLETED_POST_IMPORT_VERIFY,rollback_people_count_matches_batch,PASS,102
A16R_IMPORT_COMPLETED_POST_IMPORT_VERIFY,rollback_relationship_count_matches_batch,PASS,201
A16R_IMPORT_COMPLETED_POST_IMPORT_VERIFY,session_completed_state,PASS,write_completed
A16R_IMPORT_COMPLETED_POST_IMPORT_VERIFY,stored_session_warning_count_recorded,PASS,46
A16R_IMPORT_COMPLETED_POST_IMPORT_VERIFY,transaction_helper_call_count_one,PASS,1
A16R_IMPORT_COMPLETED_POST_IMPORT_VERIFY,unresolved_blocker_warning_count_zero,PASS,0
A16R_IMPORT_COMPLETED_POST_IMPORT_VERIFY,write_manifest_completed,PASS,write_completed
A16R_IMPORT_COMPLETED_POST_IMPORT_VERIFY,write_manifest_people_count_102,PASS,102
A16R_IMPORT_COMPLETED_POST_IMPORT_VERIFY,write_manifest_relationship_count_matches_batch,PASS,201
```

## Safety

- `SQL_EXECUTED=YES_READ_ONLY_SELECT_ONLY`
- `MUTATION_SQL_EXECUTED=NO`
- `IMPORT_RPC_CALLED=NO`
- `OFFICIAL_IMPORT_RETRY=NO`
- `OFFICIAL_IMPORT_CLICKED=NO`
- `A16R_RETRY=NO`
- `CODE_CHANGED=NO_RUNTIME_CODE_CHANGED`
- `DEPLOY=NO`
- `PUSH=NO`

## Validation

- `npx.cmd --yes supabase db query --linked --file db/checks/20260712_check_a16r_import_completed_post_import_verification.sql`: PASS
- `npm.cmd run check:a16r-import-completed-post-import-verification`: PASS

## Next Action

`NEXT_ACTION=OWNER_REVIEW_IMPORT_COMPLETION_EVIDENCE_THEN_PLAN_SEPARATE_BACKUP_AND_POST_IMPORT_SMOKE`
