# AI Workflow

## Authority startup policy

Every governed task reads, in order: `AGENTS.md`; this workflow; `docs/AI_EXECUTION_ROUTING.md`; exactly one real task-specific contract in `docs/exec-plans/active/`; current repository/runtime/Git evidence; relevant architecture/domain documents; then the handoff, work log, decision log, and historical plans. An active contract may be stricter but cannot weaken this policy.

## Risk, model, reasoning, and cost policy

Classify work as LOW, MEDIUM, HIGH, or PRODUCTION based on blast radius, reversibility, data/security sensitivity, and external effects. Follow the routing baseline and `DEFAULT_COST_POLICY=CHEAPEST_CAPABLE` in `docs/AI_EXECUTION_ROUTING.md`. Owner + ChatGPT retain final approval of model and reasoning. Evidence-backed escalation only; no silent escalation.

## One-writer and isolation policy

Exactly one application-source writer may hold an ACTIVE writer lease. A RESERVED lease does not authorize writes. The writer must Acquire, Verify, work, Complete, and Release through `scripts/ai/Invoke-AiWriterLease.ps1`. Stale leases are never broken or recovered automatically. Explorer, Reviewer, and Verifier have no writable-main-worktree access and must use a helper-created isolated snapshot. Snapshot contents are the Git baseline plus explicitly approved candidate paths; `.env*`, secrets, `node_modules`, `.next`, unrelated untracked work, and inherited dirt are excluded.

Primary orchestrates agents and may write approved governance/orchestration/documentation only when the current contract allows it. Coder is the sole application-source writer role, and only with an ACTIVE verified lease. Subagents return scope, commands, evidence, changed paths, PASS/FAIL/BLOCKED/NOT_PROVEN/NOT_RUN, and findings; Primary makes no unsupported inference from a fixture or static check.

## Git and checkpoint policy

Preserve unrelated dirty work. Never use broad staging, reset, stash, clean, checkout/restore, or an index mutation to hide inherited work. PASS never implies permission to commit, push, deploy, or checkpoint. A checkpoint requires the active contract, a protected-path audit, independent review and verification where required, and an explicit Owner decision. Commit and push are separate decisions.

## Privileged owner gates

Fresh Owner approval is required for HIGH/PRODUCTION work and each privileged action: Supabase production writes; schema changes or migrations; official Gia Phả import; transaction RPC; person/relationship deletion; destructive tree/layout mutation; Cloudflare/OpenNext deployment; OAuth/security behavior; production configuration/secrets; and rollback. A consumed one-shot authorization is never reused. Production, database, import, deploy, commit, and push flags in a contract are independent.

## Blocker, retry, and resume policy

Report facts truthfully as PASS, FAIL, BLOCKED, NOT_PROVEN, or NOT_RUN. A failed or unproven host/runtime policy is not made PASS by a fixture. Stop at a contract stop condition; do not auto-repair, retry, recover leases, or dispatch a Verifier after Reviewer P0/P1. On resume, reread the authority chain, current active contract, fresh Git/runtime evidence, and prior results; conversation history is context only. Update the work log and handoff after each completed phase; update the decision log for durable architecture/governance decisions.
