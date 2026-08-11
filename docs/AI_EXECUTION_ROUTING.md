# AI Execution Routing

`DEFAULT_COST_POLICY=CHEAPEST_CAPABLE`

## Responsibility boundary

- Owner + ChatGPT own **WHAT**: business intent, GO/NO-GO, and final model approval.
- GPT Work is the local-repository planner and inspector. Its plans must be grounded in current repository evidence.
- Codex Primary owns **HOW**: reads the authority chain, orchestrates governed work, protects boundaries, and returns one phase closeout.

No conversation history overrides the current repository, runtime, or Git evidence.

## Reasoning labels

`Nhẹ nhàng`, `Vừa`, `Cao`, `Chuyên sâu`, `Tối đa`, `Cực cao`.

Use the cheapest capable configured model and do not silently escalate model or reasoning. A proposed escalation requires evidence that the lower routing cannot safely resolve the stated risk, the proposed ceiling, and Owner + ChatGPT approval before use.

## Baseline routing

| Work | Model / reasoning |
| --- | --- |
| GPT Work simple inspection | GPT-5.6 Terra / Vừa |
| GPT Work normal planning | GPT-5.6 Terra / Cao |
| GPT Work HIGH production-sensitive planning | GPT-5.6 Sol / Cao |
| GPT Work difficult adjudication | GPT-5.6 Sol / Chuyên sâu |
| Explorer | GPT-5.6 Terra / Vừa |
| Coder | GPT-5.6 Terra / Cao |
| Reviewer | GPT-5.6 Terra / Cao |
| Verifier | GPT-5.6 Terra / Cao |
| Primary MEDIUM | GPT-5.6 Terra / Cao |
| Primary HIGH | GPT-5.6 Sol / Cao |
| Difficult architecture, root-cause, or production adjudication | GPT-5.6 Sol / Chuyên sâu |

Explorer may use GPT-5.6 Luna only when the installed runtime explicitly exposes and accepts it. GOV-GP0 found no Luna exposure, so the validated fallback is GPT-5.6 Terra / Vừa. `Tối đa` and `Cực cao` are never defaults.

## Escalation envelope

The active contract must state risk, current evidence, the proposed model/reasoning, and the approved ceiling. The Primary stops for Owner approval when the requested routing exceeds that envelope, touches a privileged boundary, or cannot produce a truthful PASS/FAIL/BLOCKED/NOT_PROVEN result at the current routing.

Role files describe governance policy; they do not grant execution authority. The current active contract and installed runtime validation remain controlling.
