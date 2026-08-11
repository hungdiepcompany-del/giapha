# GOV-GP4 Repository Git and A16 Authority Reconciliation

TASK_ID=GOV-GP4_REPOSITORY_GIT_AND_A16_AUTHORITY_RECONCILIATION
RISK_CLASS=HIGH
OWNER_GATE=OWNER_APPROVED_GOV_GP4_READ_ONLY_RECONCILIATION_ONLY

## Objective

READ_ONLY_RECONCILIATION of local `main` identity, recorded `origin/main` identity, recorded deployed/production source identity, current tracked A16 repository authority, the A16R2F versus A16R3 naming/authority conflict, and the authoritative baseline for a later project phase.

## Execution mode and frozen boundaries

EXECUTION_MODE=READ_ONLY_RECONCILIATION
COMMIT_ALLOWED=false
PUSH_ALLOWED=false
DEPLOY_ALLOWED=false
PRODUCTION_MUTATION_ALLOWED=false
DATABASE_MUTATION_ALLOWED=false
OFFICIAL_IMPORT_ALLOWED=false
A16_EXECUTION_ALLOWED=false

No A16 operation, source modification, production/database/import action, deployment, commit, push, fetch, or pull is activated by this contract. Any later mutation or execution requires a fresh explicit Owner contract.

## Required evidence

Reconcile only from current repository and supplied recorded evidence. Preserve inherited dirt. Do not reset, clean, stash, restore, or stage. Report contradictions as `BLOCKED` or `NOT_PROVEN`; do not infer publication or production authority from local ancestry.

## GOV-GP4R1 R10 byte-preserving mixed-document reconstruction and local checkpoint

TASK_ID=GOV-GP4R1_R10_MIXED_DOCUMENT_RECONSTRUCTION_AND_LOCAL_CHECKPOINT
RISK_CLASS=MEDIUM
OWNER_GATE=OWNER_APPROVED_GOV_GP4R1_R10_BYTE_PRESERVING_MIXED_DOCUMENT_RECONSTRUCTION_AND_ONE_LOCAL_CHECKPOINT_ONLY
COMMIT_ALLOWED=true
PUSH_ALLOWED=false
DEPLOY_ALLOWED=false
A16_EXECUTION_ALLOWED=false
PRODUCTION_MUTATION_ALLOWED=false
DATABASE_MUTATION_ALLOWED=false
OFFICIAL_IMPORT_ALLOWED=false
RECOVERY_SCOPE=byte-preserving mixed-document reconstruction and one local governance checkpoint
RECOVERY_AUTHORIZATION_CONSUMED=YES

This one-shot recovery permits only raw-HEAD-byte mixed-document candidate reconstruction, the corresponding completed-GP1 correction, independent review/verification, narrow exact-object staging, and one local checkpoint commit. It does not authorize a Coder or writer lease, application work, push/fetch/pull, deployment, A16/A17 execution, production/database/import mutation, Auth/OAuth modification, or inherited-dirt cleanup.

## GOV-GP4R4 remote-base governance checkpoint transplant

TASK_ID=GOV-GP4R4_REMOTE_BASE_GOVERNANCE_CHECKPOINT_TRANSPLANT
RISK_CLASS=HIGH
OWNER_GATE=OWNER_APPROVED_GOV_GP4R4_REMOTE_BASE_GOVERNANCE_CHECKPOINT_TRANSPLANT_ONE_LOCAL_COMMIT_ONLY_8E1D85D617B74FDEB4C0274B458CAEBD
COMMIT_ALLOWED=true
PUSH_ALLOWED=false
DEPLOY_ALLOWED=false
PRODUCTION_MUTATION_ALLOWED=false
DATABASE_MUTATION_ALLOWED=false
OFFICIAL_IMPORT_ALLOWED=false
A16_EXECUTION_ALLOWED=false

This exact R4 authority permits only reconstruction of the governed remote-base candidate and one separately approved local integration commit after independent review and verification. `REMOTE_MAIN=8e842c67e8696cdeb62afa17a164e8c5c6538ba2`; `REMOTE_BASE_TREE=c1858eccf978dbbbcd447d52f8fcd5fa8f7759b8`.

Sanitized R2R2 production evidence is durable: `PRODUCTION_SOURCE=8e842c67e8696cdeb62afa17a164e8c5c6538ba2`; `PRODUCTION_WORKER=web-gia-pha`; `PRODUCTION_VERSION=3e24489c-7302-4e44-b759-56f04ec61a45`; `PRODUCTION_TRAFFIC_PERCENT=100`; `PRODUCTION_SOURCE_DECISION=PROVEN_CURRENT_SOURCE_EQUALS_REMOTE_MAIN`; `R2R2_REVIEWER=PASS`; `R2R2_VERIFIER=PASS`.

`A16_NEXT_PHASE=A16R3`, but the substantive current-session production staging/smoke prerequisite remains required. A16 execution, official import, push, deploy, production mutation, and database mutation are not authorized.

## GOV-GP4R4R1 reviewer snapshot 21-path materialization remediation

TASK_ID=GOV-GP4R4R1_REVIEWER_SNAPSHOT_21_PATH_MATERIALIZATION_REMEDIATION
OWNER_GATE=OWNER_APPROVED_GOV_GP4R4R1_21_PATH_SNAPSHOT_REMEDIATION_AND_ONE_LOCAL_CHECKPOINT_ONLY_6B62A1D94E384569A0D35F8C27B1E6A4
COMMIT_ALLOWED=true
PUSH_ALLOWED=false
DEPLOY_ALLOWED=false
A16_EXECUTION_ALLOWED=false
OFFICIAL_IMPORT_ALLOWED=false
PRODUCTION_MUTATION_ALLOWED=false
DATABASE_MUTATION_ALLOWED=false
PRIOR_R4_STATUS=BLOCKED_REVIEW_P1

This one-shot recovery authorizes only canonical 21-path governed snapshot-list synchronization, its persistent harness coverage, bounded R4R1 governance records, independent review and verification, and one local integration checkpoint if every gate passes.

## GOV-GP4R4R1C sparse-fixture harness correction and R4 resume

TASK_ID=GOV-GP4R4R1C_SPARSE_FIXTURE_HARNESS_CORRECTION_AND_R4_RESUME
RISK_CLASS=MEDIUM
OWNER_GATE=OWNER_APPROVED_GOV_GP4R4R1C_SPARSE_FIXTURE_HARNESS_CORRECTION_AND_R4_LOCAL_COMMIT_RESUME_ONCE_93E7C10D4B6A4F8297C3518AD04F625B
PRIOR_R4_STATUS=BLOCKED_REVIEW_P1
PRIOR_R4R1_STATUS=BLOCKED_LOCAL_CHECK
PRIOR_R4R1B_STATUS=PASS_LEASE_TERMINAL_RECOVERY_ONLY
COMMIT_ALLOWED=true
PUSH_ALLOWED=false
DEPLOY_ALLOWED=false
PRODUCTION_MUTATION_ALLOWED=false
DATABASE_MUTATION_ALLOWED=false
OFFICIAL_IMPORT_ALLOWED=false
A16_EXECUTION_ALLOWED=false

This one-shot authority permits only the sparse disposable-fixture assertion correction, bounded R4R1C governance records, fresh independent review and verification, and one local integration checkpoint if all gates pass. The canonical production candidate remains 21 paths; the intentionally sparse fixture must assert its four materialized approved paths separately. It does not authorize fetch, push, deploy, A16 execution, official import, production/database mutation, or reconstruction of the remote base, branch, worktree, or candidate.

## GOV-GP4R5R2 false auto-deploy assertion correction and unpushed integration commit replacement

TASK_ID=GOV-GP4R5R2_FALSE_AUTO_DEPLOY_ASSERTION_CORRECTION_AND_INTEGRATION_COMMIT_REPLACEMENT
RISK_CLASS=MEDIUM
OWNER_GATE=OWNER_APPROVED_GOV_GP4R5R2_FALSE_AUTO_DEPLOY_ASSERTION_CORRECTION_AND_UNPUSHED_INTEGRATION_COMMIT_REPLACEMENT_ONCE_C50E3A7F49124B5FB74AE963D810C26E
COMMIT_ALLOWED=true
PUSH_ALLOWED=false
DEPLOY_ALLOWED=false
PRODUCTION_MUTATION_ALLOWED=false
DATABASE_MUTATION_ALLOWED=false
OFFICIAL_IMPORT_ALLOWED=false
A16_EXECUTION_ALLOWED=false
PRIOR_R5_STATUS=BLOCKED_FALSE_AUTO_DEPLOY_ASSERTION
PRIOR_R5R1_STATUS=PASS
AUTO_DEPLOY_ON_MAIN_PUSH=NO
MAIN_PUSH_SIDE_EFFECT=CI_BUILD_GATE_ONLY
PRODUCTION_DEPLOY_REQUIRES_SEPARATE_MANUAL_WORKFLOW_DISPATCH=YES
SUPERSEDED_UNPUSHED_INTEGRATION_COMMIT=8c2314b41a8a452b5ae661547e921c56903a17b0

This one-shot authority permits only correction of the proven false auto-deploy assertion in the existing 21-path governance candidate, bounded truthful R5/R5R1/R5R2 governance records, fresh independent review and verification, and exactly one controlled amend of the unpushed integration commit if every gate passes. A `main` push triggers the OpenNext Cloudflare build gate only; production deployment of `web-gia-pha` remains a separate manual Cloudflare Deploy `workflow_dispatch` that runs the production deploy command. It does not authorize push, deployment, A16 execution, official import, production/database mutation, workflow or runtime changes, or a second commit.

## GOV-GP4R5R2B protected-suffix literal exception correction

TASK_ID=GOV-GP4R5R2B_PROTECTED_SUFFIX_FALSE_ASSERTION_EXCEPTION_CORRECTION
RISK_CLASS=MEDIUM
OWNER_GATE=OWNER_APPROVED_GOV_GP4R5R2B_SINGLE_PROTECTED_SUFFIX_LITERAL_EXCEPTION_AND_CORRECTED_UNPUSHED_COMMIT_ONCE_4F9C3B18E2674D3AA6105C72B8E491FD
COMMIT_ALLOWED=true
PUSH_ALLOWED=false
DEPLOY_ALLOWED=false
PRODUCTION_MUTATION_ALLOWED=false
DATABASE_MUTATION_ALLOWED=false
OFFICIAL_IMPORT_ALLOWED=false
A16_EXECUTION_ALLOWED=false
R5_STATUS=BLOCKED_PUSH_REVIEW_POLICY_ANALYSIS
R5R1_STATUS=PASS_PUSH_DEPLOY_TRIGGER_CORRECTION
R5R2_STATUS=BLOCKED_ACCEPTANCE_CONFLICT
R5R2A_STATUS=PASS_LEASE_TERMINAL_RECOVERY_ONLY
R5R2B_STATUS=ACTIVE_PROTECTED_SUFFIX_LITERAL_EXCEPTION_CORRECTION
REMOTE_SUFFIX_RULE=REMOTE_SUFFIX_WITH_ONE_EXACT_AUTHORIZED_LITERAL_REPLACEMENT

R5R2's requirement to correct the false inherited deployment assertion while preserving the entire remote suffix byte-identically was internally contradictory. This one-shot authority supersedes that suffix rule only for the one proven false literal in `docs/99_NEXT_AI_HANDOFF.md`: the corrected candidate must be derivable from the exact remote blob by the approved governance-block insertion and exactly one old-literal-to-corrected-literal replacement. All other inherited bytes remain protected. Fresh review and verification remain required before exactly one amend of the unpushed integration checkpoint. Push, deploy, A16 execution, official import, production mutation, and database mutation remain unauthorized.
