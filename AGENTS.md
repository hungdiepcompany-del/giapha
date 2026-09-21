# GIA PHẢ AI Operating Law

`WORKFLOW_VERSION=2.1.1`
`DEFAULT_COST_POLICY=CHEAPEST_CAPABLE`
`DIAGNOSE_CLUSTER_BEFORE_PATCH=true`
`OWNER_VISIBLE_PROGRESS_POLICY=MINIMAL`
`GPT_WORK_RETURN_TO_OWNER_REQUIRES_NEXT_DIRECTION=true`
`CLOSEOUT_MUST_INCLUDE_NEXT_EXECUTION_PROPOSAL=true`
`GPT_WORK_CONTINUE_WITHIN_DELEGATED_ENVELOPE=true`
`OWNER_PLANNING_PROMPT_AFTER_NORMAL_CLOSEOUT=false`
`VERIFIED_CHECKPOINT_POLICY=OWNER_DECISION_AFTER_VERIFIED_SOURCE_PHASE`
`MODEL_CEILING=GPT-5.6 Terra`
`LIGHTWEIGHT_MODEL=GPT-5.6 Luna`
`SOL_ALLOWED=false`

## 1. North-star rule: product milestone first

Every phase, validation gate, agent dispatch, governance rule, recovery action,
and model choice must directly advance the current product milestone or enforce
a mandatory safety invariant. Otherwise remove it, merge it into the current
phase, or downgrade it to diagnostic evidence.

Orchestration, harnesses, markers, wrappers, leases, snapshots, and governance
plumbing are means, never project goals.

Current A17 outcome roadmap:

`G0 Governance reset → G1 Local data foundation → G2 Auth/Permissions → G3 Tree product → G4 Public/Mobile/Privacy → G5 Print/Export → G6 Final technical → G7 Reviewer+Verifier → G8 Owner visual acceptance`.

`G9 Git/Deploy/Production` is always separately Owner-gated.

## 2. Startup authority order

Before governed work, read only what is necessary, in this order:

1. `AGENTS.md`
2. `docs/AI_WORKFLOW.md`
3. `docs/AI_EXECUTION_ROUTING.md`
4. exactly one real active contract under `docs/exec-plans/active/`
5. fresh repository/runtime/Git evidence
6. only architecture/domain documents relevant to the current outcome
7. latest relevant handoff/work-log/decision-log entries

Do not load the entire historical `.md` corpus by default. Repository/runtime/Git
evidence outranks conversation memory and historical plans. The active contract
may be stricter but cannot weaken this law.

## 3. Canonical responsibility boundary

Normal chain:

```text
Owner + ChatGPT
→ define WHAT / GOAL / business intent / hard boundaries / model ceiling
→ GPT Work inspects current local repository and active authority
→ GPT Work may dispatch read-only Codex Primary/agents for whole-path diagnosis
→ GPT Work consolidates facts / root cause / defect cluster / risks / plan
→ Owner + ChatGPT cross-check committed GitHub evidence when it can affect adjudication
→ Owner + ChatGPT approve one bounded execution envelope
→ GPT Work orchestrates Codex Primary/agents inside that envelope
→ GPT Work continues autonomously while still inside that envelope
→ GPT Work returns only at terminal result or a genuine Owner hard gate
→ the same closeout includes next direction + proposed next envelope
```

- **Owner + ChatGPT own WHAT**: business intent, current milestone, strategic
  architecture intent, GO/NO-GO, hard boundaries, acceptance criteria,
  privileged gates, and final model/reasoning ceiling.
- **GPT Work is the local-repository phase controller/adjudicator**: inspect the
  real repo, reconcile authority/evidence, diagnose whole relevant paths,
  create bounded envelopes, dispatch Codex, adjudicate closeouts, and continue
  autonomously when already authorized.
- **Codex Primary owns HOW** inside the delegated envelope: decomposition,
  technical execution, agents, writer/isolation lifecycle, tests, review,
  verification, and evidence integration.
- **Coder** is the sole application-source writer when source mutation is
  explicitly authorized and the current repository writer invariant is satisfied.
- **Explorer/Reviewer/Verifier** are non-writers and must remain isolated from
  unauthorized writable application-source state.
- **GitHub** is a committed-baseline/history/provenance cross-check only. It does
  not replace local dirty state, active contracts, uncommitted candidates,
  writer/isolation state, or runtime evidence.

Owner must not be used as a manual relay for ordinary Codex replies, writer
lease IDs, isolation paths, fixture progress, wait/resume mechanics, or bounded
technical transitions when GPT Work/Primary can handle them safely.

## 3A. Dynamic model and reasoning routing

Model and reasoning are dynamic execution choices, not permanent role identities.

```text
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

Current account ceilings:

```text
MODEL_CEILING=GPT-5.6 Terra
REASONING_CEILING=Chuyên sâu
SOL_ALLOWED=false
```

These are ceilings, not defaults for every task. GPT Work selects routing from
risk, ambiguity, task shape, consequence of error, independence needs, and
whether work has become mechanical. Codex Primary may dynamically route agents
inside the same approved envelope and ceilings.

Typical starting points only:

- simple Git/config/file inspection -> Luna / Nhẹ nhàng or Vừa;
- repetitive path/hash/migration-name audit -> Luna / Vừa;
- normal implementation/acceptance/review -> Terra / Cao when needed;
- difficult Auth/data-integrity/root-cause adjudication -> Terra / Chuyên sâu;
- mechanical verification -> Luna / Vừa when sufficient;
- complex security/privacy verification -> Terra / Cao or Chuyên sâu.

Every meaningful closeout must state actual routing, why it was cheapest-capable,
and the evidence-based upgrade/downgrade conditions.

## 4. Diagnose the cluster before patching

`DIAGNOSE_CLUSTER_BEFORE_PATCH=true`

When an observed failure may be one symptom of a coupled defect class, GPT Work
must inspect the whole relevant execution path before requesting mutation.
Inspect materially relevant call graph, state/transitions, data flow,
security/identity, runtime compatibility, persistence/concurrency boundaries,
and acceptance/test path.

Return a consolidated defect map:

```text
REPOSITORY_PROVEN_FACTS=
ROOT_CAUSE=
PROVEN_DEFECT_INVENTORY=
UNPROVEN_RISKS=
AFFECTED_ACCEPTANCE_CRITERIA=
RECOMMENDED_PLAN=
MUTATION_REQUIRED=
```

One newly discovered defect does not automatically create one new Owner prompt.
Do not patch only the last failing line when evidence suggests a wider coupled
path.

## 5. Outcome phases, not recovery chains

A technical failure does not create a new product phase. Ordinary command,
quoting, path, parser, serialization, transport, fixture, wait/resume,
agent-handoff, or local-startup mechanics remain inside the same outcome when
root cause is proven, substantive scope is unchanged, no privileged boundary is
crossed, and budget remains.

Default budget unless the active contract is stricter:

- `MAX_TECHNICAL_CORRECTIONS_PER_OUTCOME=2`
- `MAX_FRESH_PRIMARY_EXECUTIONS_PER_OUTCOME=2`
- repeat of the same root-cause class after one correction => STOP
- no recursive recovery-child creation

Do not create `G1R1`, `G1R2`, `R52`, `R53`, etc. merely for technical plumbing.

Account authentication/quota/capacity, repository identity drift, unproven root
cause after budget, scope/architecture expansion, or newly required privileged
mutation is a genuine hard gate.

## 6. Autonomous continuation and Owner-return policy

If the next action is already authorized by the current delegated envelope and
no genuine Owner hard gate exists:

`GPT_WORK_MUST_CONTINUE_AUTONOMOUSLY=true`

GPT Work must not return merely for routine orchestration approval.

When GPT Work does return, the closeout is incomplete unless it includes both
the current result and the repository-grounded next direction. Include where
applicable:

```text
CURRENT_STAGE_RESULT=
FACTS=
EVIDENCE=
UNRESOLVED_BLOCKERS=
GOAL_ALIGNMENT_GATE=
NEXT_DIRECTION=
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

Do not manufacture alternatives when one evidence-backed route is clearly
superior. At terminal success, propose the next outcome/checkpoint direction,
but do not auto-start a new main outcome unless the current Owner envelope
explicitly authorizes it.

## 7. Writer, Git, and isolation safety

Preserve unrelated dirty work. Never broad-stage, reset, stash, clean,
checkout/restore, or mutate the index to hide inherited work.

Exactly one application-source writer may act at a time. Use existing
repository-supported writer/isolation machinery only when the current task
actually needs source mutation or independent isolation. Do not create a new
governance harness merely to prove the harness.

Reviewer and Verifier remain independent non-writers.

PASS never grants staging, checkpoint, commit, push, deploy, production access,
production mutation, database mutation, or official import.

## 8. Verified checkpoint decision policy

After a source-changing outcome has completed all required gates, including
where applicable Coder completion, local checks, Reviewer PASS, Verifier PASS,
zero active writer/isolation state, exact phase-owned paths, and preserved
inherited dirt, GPT Work must surface:

```text
CHECKPOINT_STATUS=NOT_REQUIRED|PENDING_OWNER_DECISION|COMMITTED_LOCAL|PUSHED_REMOTE|DEFERRED
CHECKPOINT_DECISION_REQUIRED=true|false
CHECKPOINT_DEFER_REASON=
```

This is a provenance/safety decision, not automatic Git authorization.

Commit requires a fresh explicit Owner/contract gate. Push requires a separate
fresh explicit Owner/contract gate. Commit never implies push. Push never
implies deploy or production.

With inherited dirt, broad staging (`git add .`, `git add -A`, equivalent) is
forbidden. Stage only exact approved paths after Owner authorization.

Before a materially higher-risk outcome depends on verified uncommitted source,
GPT Work must explicitly adjudicate whether a checkpoint is required or may be
deferred. Do not silently carry verified source across unrelated phases.

## 9. Privileged boundaries

Fresh explicit Owner authorization is required for:

- production access or mutation;
- Supabase production SQL/schema/migration work;
- official Gia Phả import or transaction RPC execution;
- person/relationship deletion or destructive genealogy/layout mutation;
- OAuth/security/RLS/grant/auth-architecture change;
- dependency/stack/service-boundary expansion with material risk;
- abnormal writer recovery;
- rollback;
- staging/checkpoint/commit;
- push;
- deploy.

Never weaken RLS, expose secrets, hardcode credentials, delete genealogy data
to satisfy a test, mix genealogy data with tree-layout data, or bypass required
portability contracts.

Read `docs/RUNTIME_WORKER_GUARDRAIL.md` only for Worker/OpenNext/Wrangler/runtime/
deploy/dependency/service-boundary work, and `docs/SERVICE_BOUNDARY_ROADMAP.md`
additionally for export/import/media/backup/GEDCOM/large-validation/new-service
planning.

## 10. Evidence and closeout

Use only: `PASS`, `FAIL`, `BLOCKED`, `NOT_PROVEN`, `NOT_RUN`.

A terminal outcome closeout must state milestone advanced, model/reasoning,
repository identity, substantive work, validation evidence, changed paths,
technical-correction/execution counts, privileged actions, Reviewer/Verifier
status when applicable, checkpoint state when applicable, remaining blockers,
and the next-direction package.

Update `docs/08_AI_WORK_LOG.md` and `docs/99_NEXT_AI_HANDOFF.md` after a meaningful
terminal outcome or Owner gate. Record durable governance/architecture decisions
in `docs/09_DECISION_LOG.md`.

The project must never spend more effort proving orchestration than advancing or
safely protecting the current product milestone.
