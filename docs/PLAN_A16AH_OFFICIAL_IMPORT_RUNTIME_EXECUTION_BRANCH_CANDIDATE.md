# A-16AH Official Import Runtime Execution Branch Candidate

## Marker

`A-16AH-OFFICIAL-IMPORT-RUNTIME-EXECUTION-BRANCH-CANDIDATE`

## Result

- `A16AH_STATUS=PASS_SOURCE_BRANCH_CANDIDATE_NOT_EXECUTED`
- `A16AH_BLOCKER=NONE_SOURCE_BRANCH_CANDIDATE_READY_BUT_NOT_EXECUTED_BY_PHASE_BOUNDARY`
- `A16AH_TARGET_SESSION_ID=2af4bfb6-a20e-453e-9804-1b8c0afbdd68`
- `A16R_IMPORT_RETRY_NEXT=NO`

## Runtime Branch Contract

- `A16AH_ROUTE_CANDIDATE_FLAG=A16P_OFFICIAL_IMPORT_RUNTIME_CANDIDATE_ENABLED`
- `A16AH_ENV_FLAG=A16AH_OFFICIAL_IMPORT_EXECUTION_BRANCH_ENABLED`
- `A16AH_EXECUTION_BRANCH_DEFAULT=DISABLED_UNLESS_A16AH_OFFICIAL_IMPORT_EXECUTION_BRANCH_ENABLED`
- `A16AH_APPROVED_TRANSACTION_HELPER=public.a16p_tx_execute_giapha4_official_import`
- `A16AH_RPC_FUNCTION=a16p_tx_execute_giapha4_official_import`
- `A16AH_SAME_RUN_GATE_REQUIRED=YES`
- `A16AH_EXECUTOR_CALL_PROOF=MOCKABLE_EXECUTOR_CALLED_EXACTLY_ONCE_ONLY_AFTER_SAME_RUN_GATES`

The runtime source now has a real execution branch candidate that can call the
approved transaction helper through one injected executor call. The route only
passes execution through when both the existing candidate flag and the new A-16AH
execution branch env flag are true.

The branch remains fail-closed by default. When all same-run gates pass but the
A-16AH execution env flag is absent, the service returns a ready-not-executed
candidate with zero executor calls.

## Same-Run Gates

Before the executor branch can run, the service must prove all of the following
in the same evaluation:

- authenticated user and strict official-import permission bundle;
- audited session `2af4bfb6-a20e-453e-9804-1b8c0afbdd68`;
- staged manifest readable;
- validation error count zero;
- dry-run blocking error count zero;
- duplicate unresolved and needs-review counts zero;
- relationship ambiguity clear;
- A-16T/A-16U/A-16V confirmation gates true;
- runtime enablement marker `APPROVE_A16R_RUNTIME_EXECUTION_AFTER_A16V_VERIFY`;
- session-specific execution marker
  `APPROVE_A16R_RUN_OFFICIAL_IMPORT_FOR_SESSION_2af4bfb6-a20e-453e-9804-1b8c0afbdd68`;
- rollback and audit review confirmations true.

## Safety Evidence

- `A16AH_OFFICIAL_IMPORT_POST_CALLED=NO`
- `A16AH_A16R_IMPORT_RETRY_EXECUTED=NO`
- `A16AH_DIRECT_MANUAL_RPC_IMPORT_CALLED=NO`
- `A16AH_REAL_GENEALOGY_WRITE=NO`
- `A16AH_SQL_RUN=NO`
- `A16AH_DB_PUSH_RUN=NO`
- `A16AH_MIGRATION_REPAIR_RUN=NO`
- `A16AH_SEED_RUN=NO`
- `A16AH_DEPLOY_RUN=NO`
- `A16AH_AUTH_USERS_ROLES_PERMISSIONS_MEMBERSHIPS_MUTATED=NO`
- `A16AH_RAW_JSON_COMMITTED=NO`
- `A16AH_RAW_JSON_PRINTED=NO`
- `A16AH_WRANGLER_TOML_CHANGED=NO`
- `A16AH_APP_LAYOUT_TSX_CHANGED=NO`

## Service Boundary Report

- Main Worker touched: `YES_LIMITED_OFFICIAL_IMPORT_ROUTE_SERVICE_CANDIDATE`
- Runtime dependency added: `NO`
- New service Worker created: `NO`
- OpenNext/Wrangler config changed: `NO`
- Worker size risk: `LOW_SMALL_ROUTE_SERVICE_BRANCH`
- Service boundary recommendation: `NONE_FOR_A16AH_SOURCE_CANDIDATE`; future
  large import work should remain governed by the existing import service
  boundary roadmap.

## Next Action

Do not run A-16R import from A-16AH. The next safe phase is a source/deploy
evidence gate for this branch candidate. Any later import execution phase must
explicitly authorize POST `/official-import`, re-check all gates in the same run
and stop after one official import call attempt.
