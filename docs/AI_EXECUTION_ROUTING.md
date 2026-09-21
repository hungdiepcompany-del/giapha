# AI Execution Routing

`WORKFLOW_VERSION=2.1.1`
`SOL_ALLOWED=false`
`STATUS=ACTIVE`
`DEFAULT_COST_POLICY=CHEAPEST_CAPABLE`
`MODEL_ROUTING_APPROVAL=OWNER_PLUS_CHATGPT`
`GPT_WORK_ROLE=LOCAL_REPOSITORY_PHASE_CONTROLLER`
`CODEX_PRIMARY_ROLE=DELEGATED_TECHNICAL_EXECUTOR`
`GITHUB_ROLE=OWNER_CHATGPT_COMMITTED_BASELINE_HISTORY_PROVENANCE_CHECK`
`DIAGNOSE_CLUSTER_BEFORE_PATCH=true`
`OWNER_VISIBLE_PROGRESS_POLICY=MINIMAL`
`GPT_WORK_RETURN_TO_OWNER_REQUIRES_NEXT_DIRECTION=true`
`CLOSEOUT_MUST_INCLUDE_NEXT_EXECUTION_PROPOSAL=true`
`GPT_WORK_CONTINUE_WITHIN_DELEGATED_ENVELOPE=true`
`OWNER_PLANNING_PROMPT_AFTER_NORMAL_CLOSEOUT=false`
`VERIFIED_CHECKPOINT_POLICY=OWNER_DECISION_AFTER_VERIFIED_SOURCE_PHASE`

## 1. Current account ceiling and dynamic-routing law

```text
MODEL_CEILING=GPT-5.6 Terra
REASONING_CEILING=Chuyên sâu
SOL_ALLOWED=false

MODEL_ROUTING_MODE=DYNAMIC
REASONING_ROUTING_MODE=DYNAMIC
DEFAULT_COST_POLICY=CHEAPEST_CAPABLE

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

The current account ceiling is a hard upper bound, not a fixed role binding.
Historical model names do not grant current entitlement.


## 2. Canonical responsibility model

```text
Owner + ChatGPT
→ WHAT / GOAL / business intent / hard boundaries / model ceiling
→ GPT Work local-repo inspection + whole-path diagnosis
→ optional read-only Codex diagnostics within approved ceiling
→ consolidated facts / root cause / defect cluster / recommended plan
→ Owner + ChatGPT GitHub cross-check when committed provenance matters
→ one bounded execution envelope
→ GPT Work controller
→ Codex Primary HOW
→ autonomous continuation while inside envelope
→ terminal result or genuine hard gate
→ same closeout includes next direction + proposed next envelope
```

Owner + ChatGPT own strategic WHAT, hard/privileged gates, final scope,
model/reasoning ceilings, checkpoint GO/NO-GO, and next direction.

GPT Work is the local-repository phase controller. It inspects current durable
authority and fresh local state, diagnoses whole relevant paths, separates facts
from hypotheses, dispatches read-only Codex when useful, uses cheapest-capable
routing, consolidates defect clusters, proposes bounded envelopes, orchestrates
Codex after GO, continues autonomously while authorized, and returns only at a
terminal outcome or genuine hard gate where practical.

Codex Primary is the delegated technical executor and owns HOW inside the
approved envelope: technical decomposition, implementation when authorized,
one-writer/isolation lifecycle, tests, review/verification sequencing, evidence
integration, and bounded corrections.

GitHub is an independent committed evidence source only. It does not replace the
local active contract, dirty/untracked state, uncommitted candidate,
writer/isolation state, or local runtime evidence.

## 3. Phase-level interaction policy

Preferred interaction:

```text
1 GPT Work local-repo diagnosis/planning pass
→ 1 Owner + ChatGPT bounded GO when required
→ autonomous GPT Work/Codex execution
→ 1 terminal closeout or 1 genuine hard gate
```

Do not split a coupled defect cluster into Owner-relayed micro-prompts.
`OWNER_VISIBLE_PROGRESS_POLICY=MINIMAL`.

Routine agent, wait-thread, fixture-by-fixture, content-address, transport,
quoting, parser, or isolation mechanics stay internal when already authorized.

## 4. Dynamic routing baseline

Reasoning labels: `Nhẹ nhàng`, `Vừa`, `Cao`, `Chuyên sâu`.

Routing is chosen per task from current evidence. Typical starting points:

| Work shape | Candidate route |
| --- | --- |
| trivial Git/status/config inspection | Luna / Nhẹ nhàng |
| bounded read-only repo inspection | Luna / Vừa |
| repetitive filename/path/hash audit | Luna / Vừa |
| normal phase planning/controller | Terra / Cao |
| normal implementation | Terra / Cao |
| difficult root cause/Auth/data-integrity adjudication | Terra / Chuyên sâu |
| mechanical verification | Luna / Vừa |
| normal independent review | Terra / Cao |
| complex security/privacy verification | Terra / Cao or Chuyên sâu |

These are starting points only. Roles do not fix model or reasoning.

```text
SELECT_LOWEST_COST_ROUTE_THAT_IS_REASONABLY_CAPABLE=true
UPGRADE_ONLY_ON_EVIDENCE=true
DOWNGRADE_WHEN_SCOPE_BECOMES_MECHANICAL=true
```

No silent fallback after a launched model hits quota/capacity. Resume the SAME
outcome after capacity is restored or return the exact account-capacity gate.


## 5. Required execution header for Owner-facing prompts

Whenever ChatGPT instructs the Owner to start GPT Work or Codex, state outside
the copyable prompt:

```text
NƠI DÁN:
MÔ HÌNH:
MỨC ĐỘ THÔNG MINH:
PHASE:
ROLE:
EXECUTION_MODE:
MỤC TIÊU:
VÌ SAO CHỌN MÔ HÌNH NÀY:
DONE WHEN:
NÂNG MÔ HÌNH KHI:
HẠ MÔ HÌNH KHI:
```

Each executable prompt targets exactly one surface: `🟢 GPT Work` or
`🔴 CODEX PRIMARY`.

## 6. Diagnose-cluster routing rule

When root cause/defect scope is not proven:

`DIAGNOSE_CLUSTER_BEFORE_PATCH=true`

Preferred order:

```text
local whole-path diagnosis
→ proven defect cluster
→ acceptance impact
→ one integrated repair plan where practical
→ Owner bounded GO when mutation is required
→ integrated execution
→ full bounded regression
→ independent review/verification
```

Do not patch only the final failing line when evidence suggests coupled defects.

## 7. Model-approval protocol

A GPT Work result preparing execution should return, where relevant:

```text
RISK_CLASS=
GPT_WORK_MODEL=
GPT_WORK_REASONING=
PRIMARY_MODEL=
PRIMARY_REASONING=
PRIMARY_MODEL_JUSTIFICATION=
EXPLORER_MODEL=
EXPLORER_REASONING=
CODER_MODEL=
CODER_REASONING=
CODER_MODEL_JUSTIFICATION=
REVIEWER_MODEL=
REVIEWER_REASONING=
VERIFIER_MODEL=
VERIFIER_REASONING=
CHEAPEST_CAPABLE_MODEL_CONFIRMED=true|false
ESCALATE_IF=
DOWNGRADE_IF=
MODEL_ROUTING_IS_RECOMMENDATION_ONLY=true
```

No role may silently escalate. Anything above `GPT-5.6 Terra` requires a future
Owner-approved account/model ceiling update.

## 8. Mandatory next-direction closeout

A GPT Work return is incomplete if it only reports the current result. Include
where applicable:

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

Do not invent multiple options when one evidence-backed route is reasonable.
When the next action remains inside the current delegated envelope and no
genuine Owner hard gate exists, `GPT_WORK_MUST_CONTINUE_AUTONOMOUSLY=true`.

At terminal outcome success, GPT Work proposes the next outcome/checkpoint but
does not auto-start a new main outcome unless the current Owner envelope
explicitly permits it.

## 9. Verified checkpoint policy

Verified source work must not remain indefinitely as uncommitted state across
multiple completed outcomes. After a source-changing outcome completes all
required execution/review/verification gates, GPT Work must return:

```text
CHECKPOINT_STATUS=
CHECKPOINT_DECISION_REQUIRED=
CHECKPOINT_COMMIT_HASH=
CHECKPOINT_PUSHED_REMOTE=
CHECKPOINT_DEFERRED=
CHECKPOINT_DEFER_REASON=
```

Normal states: `NOT_REQUIRED`, `PENDING_OWNER_DECISION`, `COMMITTED_LOCAL`,
`PUSHED_REMOTE`, `DEFERRED`.

Checkpoint is especially relevant before production-facing validation,
deployment, a materially different dependent implementation phase, an operation
requiring exact commit provenance, or when verified source would otherwise
accumulate.

This is not automatic Git authorization. Commit requires explicit Owner/contract
authorization. Push requires separate explicit authorization. Commit does not
imply push; push does not imply deploy/production. With inherited dirt, broad
staging is forbidden.

## 10. Privileged gates

Separate Owner GO/NO-GO remains mandatory when required for production/database
mutation, migration/schema/RLS/security/Auth changes, official import/RPC,
destructive genealogy/layout work, architecture/scope expansion, abnormal writer
recovery, checkpoint commit, push, deploy, and rollback.

Consumed one-shot authority is never silently reused.

## 11. Failure policy

Fail closed when repository/active-contract authority is ambiguous,
writer/isolation safety cannot be proven when required, an Owner gate is absent,
source scope must expand, model/reasoning ceiling is insufficient, or technical
recovery budget is exhausted.

Return one concise blocker plus the smallest safe unblock **and** the required
next-direction package. Do not turn a normal failure into a long Owner-relayed
recovery workflow.
