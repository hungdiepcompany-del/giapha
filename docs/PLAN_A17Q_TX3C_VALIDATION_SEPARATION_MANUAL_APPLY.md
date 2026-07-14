# A-17Q-TX3C - validation separation and manual apply gate

Status:

```text
A17Q_TX3C_VALIDATION_SEPARATION_STATUS=PASS_POLICY_READY
A17Q_TX3C_MANUAL_APPLY_STATUS=PENDING_EXTERNAL_ADMIN_ACCESS
POLICY_SEPARATION_IMPLEMENTED=YES
```

## Durable Validation Policy

Starting with A17Q_TX3C, application UI validation, external browser-access
validation, and database mutation validation are independent gates. A
database-only phase must not rerun general UI smoke unless a frontend-affecting
change, UI-specific objective, new relevant deployment, or contradictory
production evidence requires it.

Historical evidence remains valid only for the gate it actually proves. A
Supabase Dashboard browser check proves external administrative access; it does
not prove, fail, or require Gia Pha application UI behavior.

## Change Classification

```text
PHASE_CHANGE_CLASS=DATABASE_SCHEMA+EXTERNAL_ADMIN_ACCESS
FRONTEND_AFFECTING_CHANGE=NO
RUNTIME_APPLICATION_CHANGE=NO
DEPLOYMENT_CHANGE=NO
```

## UI Validation Gate

UI validation is required only when one of these is true:

- frontend or UI source files changed;
- application routing, authentication UI, forms, visual state, browser workflow,
  or client behavior changed;
- a new deployment contains UI-affecting changes;
- production evidence indicates a UI regression;
- the current phase explicitly has a UI acceptance objective.

Chrome use for Supabase SQL Editor access is not application UI testing.

For A17Q_TX3C:

```text
UI_VALIDATION_REQUIRED=NO
UI_VALIDATION_REASON=database-only migration apply; no frontend-affecting change
UI_VALIDATION_EVIDENCE_REUSED=NO
UI_SMOKE_EXECUTED=NO
APPLICATION_UI_TESTED=NO
```

## Browser Access Gate

Browser access validation proves only that automation can inspect the required
external administrative interface.

For Supabase SQL phases it may verify only:

- Chrome extension connection;
- visible target Supabase project identity;
- SQL Editor belongs to that project;
- intended SQL text is loaded before execution.

For A17Q_TX3C:

```text
BROWSER_ACCESS_REQUIRED=YES
BROWSER_ACCESS_STATUS=PENDING_VISIBLE_SUPABASE_PROJECT_REF
VISIBLE_EXTERNAL_TARGET_VERIFIED=PENDING
TARGET_PROJECT_REF=frkyeuxrlcflmsxxsolp
VISIBLE_PROJECT_REF_VERIFIED=REQUIRED
SQL_EDITOR_PROJECT_VERIFIED=REQUIRED
APPLICATION_UI_TESTED=NO
```

## Database Mutation Gate

Database mutation validation is independent from UI and browser access.

Before executing SQL, A17Q_TX3C requires only:

- exact target project ref;
- approved migration identity;
- exact migration checksum;
- confirmation that the SQL Editor belongs to the target project;
- explicit owner authorization;
- confirmation that the migration has not already been applied, where safely
  determinable;
- approved mutation scope.

After execution, A17Q_TX3C requires only:

- SQL execution result;
- expected object verification;
- security properties and grants verification;
- read-only post-apply checks;
- confirmation that prohibited RPC, reconciliation, import, and unrelated
  mutations were not performed.

For A17Q_TX3C:

```text
DATABASE_MUTATION_AUTHORIZED=OWNER_AUTHORIZED_AFTER_TARGET_AND_CHECKSUM_VERIFIED
DATABASE_TARGET_VERIFIED=REQUIRED
MIGRATION_IDENTITY_VERIFIED=REQUIRED
MIGRATION_FILE=db/migrations/20260714_0028_a17q_tx3_family_parents_rls_boundary_patch.sql
MIGRATION_SHA256=9BBDB8CC9F161EC93A6B2FA97FE0F899C13242A270D2CAB328A95BE8893A23F7
MIGRATION_EXECUTED=PENDING
POST_APPLY_DATABASE_VERIFICATION=PENDING
```

## Evidence Reuse

Existing evidence may be reused when all relevant identity dimensions remain
unchanged:

- source commit;
- deployed commit, when deployment evidence is relevant;
- environment;
- target project ref;
- migration file;
- migration SHA256;
- authentication or permission context, when relevant to the operation;
- no contradictory runtime evidence exists.

For A17Q_TX3C:

```text
EVIDENCE_REUSE_ALLOWED=YES
REUSED_EVIDENCE=A17Q_TX3C_PRECHECK_STATUS=PASS; ORIGIN_MAIN_CONTAINS_9D1CF0A=YES; REMOTE_SYNC=0/0; WORKTREE_CLEAN=YES; TARGET_PROJECT_REF=frkyeuxrlcflmsxxsolp; MIGRATION_SHA256=9BBDB8CC9F161EC93A6B2FA97FE0F899C13242A270D2CAB328A95BE8893A23F7
EVIDENCE_INVALIDATION_REASON=NONE
```

## Safety Boundary

```text
RPC_CALLED=NO
RECONCILIATION_EXECUTED=NO
FAMILY_DATA_MUTATED=NO_BEFORE_APPROVED_MIGRATION_APPLY
UNRELATED_SQL_EXECUTED=NO
DEPLOY=NO
PUSH=NO
```

## Checker

```text
CHECKER=scripts/check-a17q-tx3c-validation-separation.cjs
PACKAGE_SCRIPT=check:a17q-tx3c-validation-separation
```

The checker fails if this database-only TX3C plan requires unrelated
application UI smoke, if Chrome/Supabase access is not categorized as
`EXTERNAL_ADMIN_ACCESS`, if target project and migration checksum gates are not
mandatory, if evidence reuse is not represented, or if RPC/reconciliation are
not explicitly prohibited.

## Next Action

```text
NEXT_ACTION=A17Q_TX3C_MANUAL_APPLY_FROM_VISIBLE_SUPABASE_PROJECT_REF_GATE
```
