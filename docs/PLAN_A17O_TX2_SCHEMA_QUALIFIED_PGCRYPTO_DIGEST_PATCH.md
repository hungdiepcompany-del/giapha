# A17O TX2 schema-qualified pgcrypto digest patch

A17O_TX2_STATUS=PASS_SOURCE_ONLY_PATCH_READY_NOT_APPLIED

## Purpose

This source-only outcome adds forward migration 0030 for the A17O grouped official-import executor. It derives the complete function/comment/revoke/grant tail from immutable migration 0025 and changes only the two digest chains to explicit pgcrypto and pg_catalog references.

IMMUTABLE_0025_SHA256=87EE4675746D948C3B32E8E7809A5945F8EA153EC2A6107355EF3E271E3DD4B2
QUALIFIED_EXTENSIONS_DIGEST_CALL_COUNT=2
UNQUALIFIED_EXECUTABLE_DIGEST_CALL_COUNT=0

## Preserved invariants

- Exact RPC identity, JSONB return, SECURITY INVOKER, VOLATILE behavior, and fixed search_path = public, auth, pg_temp remain unchanged.
- The full function tail, including idempotency, business rules, audit, rollback, comments, revokes, and grants, is mechanically derived from 0025.
- The dry-run return remains before idempotency, people, batch, family, audit, and rollback durable writes.
- The mirrored migration files are byte-identical.

## Verification boundary

The accompanying verifier is SELECT-only and does not call the executor. It binds precisely one overload by namespace, name, identity arguments, and oid; checks JSONB, provolatile = 'v', prosecdef = false, exactly one search-path configuration entry, ACL evidence through aclexplode, pgcrypto overload availability, digest counts, and dry-run ordering.

SELECT_ONLY_VERIFIER=YES
SQL_EXECUTED=NO
RPC_CALLED=NO
DATABASE_MUTATION=NO
MIGRATION_APPLIED=NO
RUNTIME_CHANGED=NO
DEPLOYMENT_CHANGED=NO

## Explicitly excluded

No SQL apply, RPC/import retry, runtime flag change, production access, adapter change, dependency change, staging, commit, push, or deployment is part of TX2.
