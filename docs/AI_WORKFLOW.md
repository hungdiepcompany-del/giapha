# AI Workflow

`WORKFLOW_VERSION=2.1.1`
`SOL_ALLOWED=false`
`DEFAULT_COST_POLICY=CHEAPEST_CAPABLE`
`ONE_WRITER_POLICY=EXACTLY_ONE_SOURCE_WRITER`
`DIAGNOSE_CLUSTER_BEFORE_PATCH=true`
`OWNER_VISIBLE_PROGRESS_POLICY=MINIMAL`
`VERIFIED_CHECKPOINT_POLICY=OWNER_DECISION_AFTER_VERIFIED_SOURCE_PHASE`
`GPT_WORK_RETURN_TO_OWNER_REQUIRES_NEXT_DIRECTION=true`
`CLOSEOUT_MUST_INCLUDE_NEXT_EXECUTION_PROPOSAL=true`
`GPT_WORK_CONTINUE_WITHIN_DELEGATED_ENVELOPE=true`
`OWNER_PLANNING_PROMPT_AFTER_NORMAL_CLOSEOUT=false`

## 1. Milestone-first operating model

The workflow exists to advance the product, not to maximize orchestration detail.
Every step must directly advance the milestone, enforce a mandatory safety
invariant, or be removed/minimized as optional plumbing.

Do not create recovery phases for ordinary execution plumbing.

## 2. Authority startup

For each governed outcome read `AGENTS.md`, this workflow,
`docs/AI_EXECUTION_ROUTING.md`, exactly one active contract, fresh
repository/runtime/Git evidence, only relevant domain/architecture docs, and
only latest relevant handoff/log/decision entries.

Historical plans are evidence, not runtime authority.

## 3. Cross-session controller flow

```text
Owner + ChatGPT
→ GOAL + business intent + hard boundaries + acceptance + model ceiling
→ GPT Work reads actual repo
→ GPT Work performs whole-path diagnosis if uncertainty is material
→ optional read-only Codex diagnostic dispatch
→ consolidated facts / defect cluster / risks / plan
→ Owner + ChatGPT GitHub cross-check when committed provenance matters
→ bounded execution envelope
→ GPT Work controller
→ Codex Primary HOW + agents + tests
→ autonomous continuation while inside envelope
→ terminal closeout or genuine hard gate
→ same closeout contains next direction + proposed next envelope
```

Owner is not a normal transport layer for Codex replies, leases, isolation paths,
fixture progress, or bounded wait/resume mechanics.

## 3A. Dynamic model/reasoning selection

The workflow fixes roles and authority boundaries, not permanent model choices.

```text
MODEL_ROUTING_MODE=DYNAMIC
REASONING_ROUTING_MODE=DYNAMIC
DEFAULT_COST_POLICY=CHEAPEST_CAPABLE
MODEL_CEILING=GPT-5.6 Terra
REASONING_CEILING=Chuyên sâu
SOL_ALLOWED=false
OWNER_CHATGPT_SET_MODEL_CEILING=true
OWNER_CHATGPT_SET_REASONING_CEILING=true
GPT_WORK_SELECTS_ROUTING_WITHIN_CEILING=true
PRIMARY_SELECTS_AGENT_ROUTING_WITHIN_ENVELOPE=true
ROLE_DOES_NOT_IMPLY_FIXED_MODEL=true
ROLE_DOES_NOT_IMPLY_FIXED_REASONING=true
NO_SILENT_ESCALATION=true
ESCALATION_MUST_BE_EVIDENCE_DRIVEN=true
DOWNGRADE_WHEN_TASK_BECOMES_MECHANICAL=true
```

GPT Work chooses routing from fresh evidence before each meaningful dispatch.
Codex Primary may dynamically route subagents inside the approved envelope.
Explorer, Coder, Reviewer, and Verifier have typical baselines, not permanent
model bindings. Closeouts report actual routing plus `ACTUAL_ROUTING_REASON`,
`ESCALATE_IF`, `DOWNGRADE_IF`, and `CHEAPEST_CAPABLE_MODEL_CONFIRMED`.

## 4. Outcome-oriented A17 roadmap

- `G0` — Governance reset
- `G1` — Local data foundation
- `G2` — Auth & permissions
- `G3` — Tree product acceptance
- `G4` — Public / mobile / privacy
- `G5` — Print / SVG / PDF
- `G6` — Final technical acceptance
- `G7` — Independent Reviewer + Verifier
- `G8` — Owner visual acceptance
- `G9` — Git / deploy / production, separately gated

A phase is named for a product outcome, not a technical attempt.

## 5. Required delegated envelope

Each outcome authorization contains only what is needed:

```text
GOAL
WHY_THIS_ADVANCES_CURRENT_MILESTONE
RISK_CLASS
MODEL / REASONING / CEILING
ALLOWED_MUTATIONS
FORBIDDEN_BOUNDARIES
MANDATORY_INVARIANTS
ACCEPTANCE_CRITERIA
TECHNICAL_RECOVERY_BUDGET
AUTONOMOUS_ACTION_CLASSES
HARD_GATES
CLOSEOUT_FIELDS
```

The envelope defines WHAT and safety. Codex Primary chooses HOW. Avoid
command-by-command orchestration unless exact procedure is itself a mandatory
safety invariant.

## 6. Whole-path diagnosis before mutation

When a failure may be part of a coupled defect class, GPT Work first runs a
read-only whole-path diagnostic.

`DIAGNOSE_CLUSTER_BEFORE_PATCH=true`

Inspect materially relevant call graph/data flow, state/transitions,
security/identity, runtime/platform compatibility, persistence/concurrency,
checkers/tests, and acceptance path.

Return:

```text
REPOSITORY_PROVEN_FACTS=
ROOT_CAUSE=
PROVEN_DEFECT_INVENTORY=
UNPROVEN_RISKS=
AFFECTED_ACCEPTANCE_CRITERIA=
OPTIONS=
RECOMMENDED_PLAN=
RECOMMENDED_ROUTING=
HARD_GATES=
MUTATION_REQUIRED=
```

One newly discovered defect is not one new Owner prompt. Prefer an integrated
repair plus one bounded regression when coupled defects can safely share one
envelope. Do not expand speculative tests/harnesses after the approved acceptance
matrix passes unless new evidence proves a mandatory invariant was omitted.

## 7. Bounded technical recovery

Quoting, transport, parser, path, serialization, wrapper, shell, temporary
command, fixture, wait/resume, agent-handoff, or startup mechanics may be
corrected inside the SAME outcome when root cause is proven, repository identity
remains valid, substantive scope is unchanged, no privileged boundary is
crossed, frozen source is untouched, and budget remains.

```text
MAX_TECHNICAL_CORRECTIONS_PER_OUTCOME=2
MAX_FRESH_PRIMARY_EXECUTIONS_PER_OUTCOME=2
```

Prefer continuation of the same Primary thread when safe. Repeat of the same
root-cause class after one correction => STOP. No recursive recovery children.
Account auth/quota/capacity stops execution and later resumes the SAME outcome.

## 8. Autonomous continuation policy

After Owner approves a delegated envelope:

```text
IF_NEXT_ACTION_WITHIN_CURRENT_DELEGATED_ENVELOPE=true
AND_GENUINE_OWNER_HARD_GATE=false
THEN_GPT_WORK_MUST_CONTINUE_AUTONOMOUSLY=true
```

GPT Work must not return merely because one bounded command failed, a permitted
fixture correction is needed, Codex needs normal resume, an agent needs normal
dispatch/wait, a local service needs normal startup mechanics, or an authorized
isolation needs normal lifecycle handling.

Return to Owner only for terminal success/failure, genuine hard gate,
scope/architecture expansion, privileged mutation, abnormal writer recovery,
model-ceiling escalation, checkpoint commit/push decision, deploy/production/
destructive work, or a stricter active-contract stop.

At terminal success, propose the next main outcome but do not auto-start it
unless the current Owner envelope explicitly authorized cross-outcome
continuation.

## 9. Mandatory next-direction closeout

Every GPT Work Owner return contains current result and forward plan in the SAME
closeout. Include where applicable:

```text
CURRENT_STAGE_RESULT=
FACTS=
EVIDENCE=
UNRESOLVED_BLOCKERS=
GOAL_ALIGNMENT_GATE=
NEXT_DIRECTION=
EXECUTION_OPTIONS_COUNT=
RECOMMENDED_OPTION=
RECOMMENDATION_REASON=
PROPOSED_NEXT_OBJECTIVE=
PROPOSED_NEXT_EXECUTION_ENVELOPE=
PROPOSED_ALLOWED_SCOPE=
PROPOSED_FORBIDDEN_SCOPE=
PROPOSED_AUTONOMOUS_ACTIONS=
PROPOSED_HARD_STOPS=
PROPOSED_SUCCESS_CRITERIA=
NEXT_PRIMARY_MODEL=
NEXT_PRIMARY_REASONING=
NEXT_CODER_MODEL=
NEXT_CODER_REASONING=
NEXT_REVIEWER_MODEL=
NEXT_REVIEWER_REASONING=
NEXT_VERIFIER_MODEL=
NEXT_VERIFIER_REASONING=
CHEAPEST_CAPABLE_MODEL_CONFIRMED=
OWNER_DECISION_REQUIRED=
IF_OWNER_GO_NEXT_ACTION=
```

`OWNER_PLANNING_PROMPT_AFTER_NORMAL_CLOSEOUT=false`. Do not manufacture
alternatives when only one evidence-backed route is sensible.

## 10. One-writer and isolation

Exactly one application-source writer may act when source mutation is authorized.
Preserve unrelated dirt. Reviewer and Verifier are independent non-writers. Use
existing repository-supported isolation when required. Do not build new
isolation/transport infrastructure unless the current milestone genuinely needs
it.

For persistent compatibility with the repository governance invariant, an
independent non-writer receives an isolated snapshot rather than direct access
to writable application-source state. Never use broad staging to conceal or
combine inherited work. Fresh Owner gates remain required for
Supabase production writes, schema changes or migrations, and official Gia Phả import.
PASS never implies permission to commit, push, deploy, or cross another
privileged boundary.

A validation mechanism that repeatedly blocks progress must be simplified or
replaced; it must not become another project.

## 11. Reviewer and Verifier

Reviewer independently evaluates correctness, scope, regressions,
security/privacy, and acceptance evidence. A blocking P0/P1/P2 stops the
outcome.

Verifier independently proves mandatory acceptance criteria. `FAIL`, `BLOCKED`,
or mandatory `NOT_PROVEN` stops.

Do not dispatch review/verification merely to satisfy process before the product
outcome reaches the relevant boundary.

## 12. Verified checkpoint policy

After a source-changing outcome completes required Coder/check/Reviewer/Verifier
gates and writer/isolation state is clean, GPT Work surfaces:

```text
CHECKPOINT_STATUS=
CHECKPOINT_DECISION_REQUIRED=
CHECKPOINT_COMMIT_HASH=
CHECKPOINT_PUSHED_REMOTE=
CHECKPOINT_DEFERRED=
CHECKPOINT_DEFER_REASON=
```

A checkpoint is preferred before a materially higher-risk dependent outcome,
production-facing validation/deploy, or when verified uncommitted source would
otherwise accumulate.

This policy does NOT authorize Git mutation. Commit and push are separate Owner
and contract gates. Never broad-stage inherited dirt. If checkpoint is deferred,
record the exact reason.

## 13. Git and privileged actions

Never broad-stage/reset/stash/clean/checkout/restore unrelated work.
Independent Owner gates include source-repair scope expansion not already
authorized, migration/schema/RLS/security/Auth changes, production/database
mutation, official import/RPC, destructive genealogy/layout work, abnormal
writer recovery, checkpoint/commit, push, deploy, and rollback.

PASS from local acceptance implies none of these permissions.

## 14. Resume policy

On resume, keep the same outcome ID unless the product objective changed,
reread active authority and fresh repo/runtime state, reuse already-proven
evidence when underlying inputs are unchanged, do not replay completed or
one-shot work, and do not make the Owner repeat a planning round merely to
continue inside an already-approved envelope.

Conversation history is context only.

## 15. Terminal closeout

Use only `PASS`, `FAIL`, `BLOCKED`, `NOT_PROVEN`, `NOT_RUN`.

Preferred terminal classifications:

```text
PASS_NEXT_OUTCOME_READY
PASS_OWNER_GATE_REQUIRED
BLOCKED_GENUINE_HARD_GATE
FAIL_PRODUCT_OR_ACCEPTANCE_DEFECT
NOT_PROVEN
```

Update work log/handoff after a meaningful terminal state or Owner gate. Update
decision log only for durable governance/architecture decisions. Do not invent a
new recovery phase to avoid a truthful terminal result.
