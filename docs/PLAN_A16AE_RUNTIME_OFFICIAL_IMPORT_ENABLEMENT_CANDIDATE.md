# A-16AE - Runtime Official Import Enablement Candidate

## Status

- Marker:
  `A-16AE-RUNTIME-OFFICIAL-IMPORT-ENABLEMENT-CANDIDATE`.
- Candidate status:
  `A16AE_RUNTIME_ENABLEMENT_CANDIDATE_STATUS=PASS_SOURCE_CANDIDATE_READY_NOT_EXECUTED`.
- Default state:
  `A16AE_DEFAULT_STATE=FAIL_CLOSED`.
- Execution allowed now:
  `A16AE_EXECUTION_ALLOWED_NOW=NO`.
- Final import command printed:
  `A16AE_FINAL_IMPORT_COMMAND_PRINTED=NO`.
- A-16R import retry remains:
  `A16R_IMPORT_RETRY_NEXT=NO`.

## Source Changes

A-16AE adds the minimal runtime source candidate to let
`canRunOfficialImport` become true only after all gates are satisfied. It does
not call the official import RPC and does not write real genealogy data.

Changed source:

- `lib/import/giapha4/official-import-service.ts`.

The service now computes:

```text
A16AE_CAN_RUN_SOURCE=const canRunOfficialImport = reasons.length === 0
```

When any gate is missing, the service still returns:

```text
status="BLOCKED"
canRunOfficialImport=false
transactionStatus="A16V_OWNER_VERIFIED_RUNTIME_STILL_DISABLED"
```

When all gates are satisfied, the service can return:

```text
status="CANDIDATE_READY_NOT_EXECUTED"
canRunOfficialImport=true
transactionStatus="A16AE_RUNTIME_ENABLEMENT_CANDIDATE_READY_NOT_EXECUTED"
```

This is a candidate-ready state only. It still records:

```text
importedPeopleCount=0
importedRelationshipCount=0
piiPrinted=false
```

## Default Fail-Closed Route

The route remains fail-closed by default:

```text
A16AE_ROUTE_FLAG=A16P_OFFICIAL_IMPORT_RUNTIME_CANDIDATE_ENABLED
A16AE_ROUTE_DEFAULT_LOCKED_RESPONSE=lockedResponse
A16AE_ROUTE_DEFAULT_CAN_RUN=false
```

The route still returns the locked response before calling the service unless
the route flag is explicitly true. A-16AE does not edit env, deploy config,
`wrangler.toml`, or production settings.

## Required Gates For canRunOfficialImport=true

`canRunOfficialImport` can only become true if all of these are satisfied in
the same service evaluation:

- `A16AE_GATE_ROUTE_FLAG_REQUIRED=true`.
- `A16AE_GATE_STRICT_PERMISSION_REQUIRED=imports.create+people.create+relationships.create+permissions.manage`.
- `A16AE_GATE_MANIFEST_OK_REQUIRED=true`.
- `A16AE_GATE_SESSION_STATUS_REQUIRED=staged`.
- `A16AE_GATE_SESSION_ID_REQUIRED=2af4bfb6-a20e-453e-9804-1b8c0afbdd68`.
- `A16AE_GATE_VALIDATION_ERROR_COUNT_REQUIRED=0`.
- `A16AE_GATE_DRY_RUN_BLOCKED_BY_ERROR_COUNT_REQUIRED=0`.
- `A16AE_GATE_REVIEW_PACK_READINESS_REQUIRED=READY_FOR_OWNER_REVIEW`.
- `A16AE_GATE_DUPLICATE_UNRESOLVED_REQUIRED=0`.
- `A16AE_GATE_DUPLICATE_NEEDS_REVIEW_REQUIRED=0`.
- `A16AE_GATE_RELATIONSHIP_AMBIGUITY_REQUIRED=clear`.
- `A16AE_GATE_CONFIRM_MARKER_REQUIRED=APPROVE_A16R_RUN_OFFICIAL_IMPORT_FOR_SESSION_2af4bfb6-a20e-453e-9804-1b8c0afbdd68`.
- `A16AE_GATE_CONFIRM_SESSION_ID_REQUIRED=2af4bfb6-a20e-453e-9804-1b8c0afbdd68`.
- `A16AE_GATE_CONFIRM_NO_VALIDATION_ERRORS_REQUIRED=true`.
- `A16AE_GATE_CONFIRM_NO_DRY_RUN_BLOCKERS_REQUIRED=true`.
- `A16AE_GATE_CONFIRM_DUPLICATE_DECISIONS_COMPLETE_REQUIRED=true`.
- `A16AE_GATE_CONFIRM_A16T_APPLY_VERIFIED_REQUIRED=true`.
- `A16AE_GATE_CONFIRM_A16U_LOCKED_BRANCH_READY_REQUIRED=true`.
- `A16AE_GATE_CONFIRM_A16V_APPLY_VERIFIED_REQUIRED=true`.
- `A16AE_GATE_CONFIRM_A16V_REAL_TRANSACTION_BRANCH_READY_REQUIRED=true`.
- `A16AE_GATE_CONFIRM_RUNTIME_EXECUTION_ENABLEMENT_MARKER_REQUIRED=APPROVE_A16R_RUNTIME_EXECUTION_AFTER_A16V_VERIFY`.
- `A16AE_GATE_CONFIRM_PRODUCTION_UI_VISIBLE_REQUIRED=true`.
- `A16AE_GATE_CONFIRM_PRODUCTION_DEPLOY_READY_REQUIRED=true`.
- `A16AE_GATE_CONFIRM_ROLLBACK_REVIEWED_REQUIRED=true`.
- `A16AE_GATE_CONFIRM_AUDIT_REVIEWED_REQUIRED=true`.

If any gate is missing, `reasons.length > 0`, `status` remains `BLOCKED`, and
`canRunOfficialImport` remains false.

## Not Execution

A-16AE does not execute official import.

- `A16AE_POST_OFFICIAL_IMPORT_CALLED=NO`.
- `A16AE_DIRECT_RPC_OFFICIAL_IMPORT_CALLED=NO`.
- `A16AE_RPC_CALL_PRESENT_IN_SOURCE=NO`.
- `A16AE_A16R_IMPORT_RETRY_RUN=NO`.
- `A16AE_REAL_GENEALOGY_WRITE=NO`.
- `A16AE_SQL_RUN=NO`.
- `A16AE_DB_PUSH_RUN=NO`.
- `A16AE_MIGRATION_REPAIR_RUN=NO`.
- `A16AE_SEED_RUN=NO`.
- `A16AE_DEPLOY_RUN=NO`.
- `A16AE_WRANGLER_DEPLOY_RUN=NO`.
- `A16AE_WRANGLER_TOML_CHANGED=NO`.
- `A16AE_APP_LAYOUT_TSX_CHANGED=NO`.
- `A16AE_RAW_JSON_CONTENT_PRINTED=NO`.
- `A16AE_RAW_FULL_JSON_EVIDENCE_COMMITTED=NO`.

## Next Required Phase

Minimum next safe phase:

`A-16AF-RUNTIME-ENABLEMENT-DEPLOY-SMOKE-GATE`

That phase must prove the candidate source is deployed and still fail-closed by
default before any later final execution phase can print a final owner-run
command or run official import.

## Runtime Guardrail Review

- Main Worker touched: `YES_LIMITED_OFFICIAL_IMPORT_ROUTE_SERVICE_CANDIDATE`.
- Runtime dependency added: `NO`.
- New service Worker created: `NO`.
- OpenNext/Wrangler config changed: `NO`.
- Worker size risk: `NO`.
- Service boundary recommendation:
  `NONE_FOR_THIS_SMALL_GATED_RUNTIME_CANDIDATE`.
