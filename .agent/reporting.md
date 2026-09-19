# Brigade Human Reporting Standard v2

## Purpose

Worker reporting happens at the **beginning** of the production shift, while the worker is definitely alive.

OTK reporting happens **after** the shift ends or is recovered from runtime loss.

These are two different authoritative documents:
- the worker owns the immutable start report;
- OTK owns the immutable result report.

OTK MUST NOT reconstruct later events in the worker's first-person voice.

## Reporting policy

Current policy version: **2**.

Every new production shift after this policy is active uses:
- `reporting_policy_version: 2`;
- one immutable worker start report;
- one independent OTK result report after closure/recovery.

Legacy shifts and legacy OTK reports remain valid historical evidence and are not rewritten.

## Authoritative time

All shift timestamps follow `.agent/liveness.md`.

For production:
- `shift_started_at_utc` comes from the exact GitHub time-pulse commit used to claim the lease;
- factual shift end is the last authoritative worker action/heartbeat appropriate to the closure;
- for `runtime_loss`, factual end is exactly the last verified heartbeat, never the later administrative recovery time.

Human-facing timestamps are converted to Europe/Moscow / UTC+03:00 and printed:

`DD.MM.YYYY HH:MM:SS МСК`

## Worker start report

### When

Immediately after production lease claim and worker materialization, and **before any substantive target-repository work**, the worker MUST publish the start report.

No target-repository mutation, CI launch, evidence-changing action, or engineering patch may precede the start report.

Reading evidence needed to understand the inherited state is allowed.

### Immutable path

Create exactly one file:

`.agent/reports/starts/shift-<shift-number>-<worker-id>-<production-event>.md`

Create once. Never overwrite or revise it.

Persist its exact path and creation commit in runtime state:
- `shift_number`;
- `shift_start_report_path`;
- `shift_start_report_commit`;
- `reporting_policy_version: 2`.

If the worker dies before creating the report, OTK records that fact. OTK must never fabricate the missing report.

### Required worker format

```text
Проект: <human project name>
Работник: <brigade display name>
Смена: №<global brigade shift number>
Начало смены: <DD.MM.YYYY HH:MM:SS МСК>

СТАРТОВЫЙ ДОКЛАД:

ОЦЕНКА ПРЕДШЕСТВЕННИКА:
<first-person evidence-based assessment>

МОЙ ПЛАН:
<first-person concrete plan, immediate objective and success criterion>
```

Only these two narrative sections are required.

### Machine contract gate

The literal field labels above are protocol, not presentation suggestions. Markdown headings such as `# Смена ...` or `## МОЙ ПЛАН` do not substitute for the required labels.

The canonical marker-validation contract lives in `.github/scripts/lib/report-contract.cjs`; `tools/agent-report-contract.mjs` is the ESM/rendering wrapper. Both worker/OTK transition gates and `tests/agent-report-contract.test.mjs` use the same marker contract.

After creating the immutable start-report commit, the worker MUST re-read the exact file, verify it against the v2 contract, and wait for the exact report commit's `Agent Runtime Check` to finish successfully before any substantive target-repository mutation. If the contract check fails, do not rewrite the immutable report and do not touch the target repository; surface a control-plane defect for recovery/manager attention.

### ОЦЕНКА ПРЕДШЕСТВЕННИКА

The new worker evaluates the immediately preceding scored production shift using OTK evidence, journal/checkpoint and inherited project state.

It should state:
- what useful evidence/state was inherited;
- what the predecessor did well;
- what remains incomplete, doubtful or needs re-checking;
- no invented criticism and no hindsight about events that have not happened yet.

### МОЙ ПЛАН

This is a genuine pre-work plan, not a later rewrite.

It should state:
- immediate technical objective;
- blocker/hypothesis being attacked;
- intended evidence or verification;
- concrete success criterion;
- any important constraint from manager/OTK.

A later evidence-driven deviation is allowed and is not a defect by itself. OTK judges whether the deviation was justified.

## OTK result report

OTK independently reconstructs the actual shift from:
- immutable start report, when present;
- technical journal/checkpoints;
- exact heartbeat/time anchors;
- target repository commits/diffs;
- CI/tests/artifacts;
- continuation;
- management directive and Definition of Done.

The result report is written in the **OTK voice**, not in first person as the worker.

### Immutable path

Create exactly one file:

`.agent/reports/otk/shift-<shift-number>-<review-event-id>.md`

Create once. Never overwrite it.

Update convenience mirrors:
- `.agent/reports/latest-otk.md` = newest OTK result;
- `.agent/reports/latest.md` MAY mirror the newest OTK result for legacy consumers.

### Required OTK format

```text
Проект: <human project name>
Работник: <brigade display name>
Смена: №<global brigade shift number>
Начало смены: <DD.MM.YYYY HH:MM:SS МСК>
Конец смены: <DD.MM.YYYY HH:MM:SS МСК>
Причина завершения: <natural stop kind / runtime_loss>

ЗАКЛЮЧЕНИЕ ОТК:

ЧТО ПЛАНИРОВАЛ:
<concise summary of the immutable start report; if absent, say so>

ЧТО ФАКТИЧЕСКИ СДЕЛАНО:
<independently reconstructed actions>

ЧТО ПОДТВЕРЖДЕНО:
<verified technical result, tests, CI or evidence>

ГДЕ ОСТАНОВИЛСЯ:
<exact factual boundary; for runtime_loss use last verified heartbeat/action>

СЛЕДУЮЩЕМУ:
<the exact continuation / first thing to verify next>

Оценка ОТК:
Прогресс: <0..4>/4
Инженерное качество: <0..3>/3
Эффективность/фокус: <0..2>/2
Стартовая оценка и план: <0..1>/1
Итого: <0..10>/10 — <verdict>
Рейтинг: <new rating> (<signed delta>)
```

OTK may add one short explanatory paragraph when a verdict needs context, but must not turn the result into a raw log.

### OTK machine-contract gate

For `otk_finalize_policy_version: 1`, the deterministic transition planner MUST validate the complete OTK result body against the shared v2 marker contract before producing any finalization plan. A malformed OTK body is a control-plane error: no immutable OTK report, rating, done record, continuation mutation or lease release may be committed from that plan.

The report must also contain the exact reviewed shift number. This gate exists before the atomic CAS commit; Runtime Check remains the independent post-commit proof.

## Scoring relationship

The start report itself is not proof of progress.

OTK evaluates:
- whether the predecessor assessment was fair and evidence-based;
- whether the plan targeted the real blocker and had a useful success criterion;
- whether later deviations were justified by new evidence.

The worker is not penalized merely because the runtime died before a planned step could be completed.

A missing required start report yields 0/1 for the planning category, but runtime loss itself is not an automatic efficiency penalty.

## Technical depth

Both report types should remain readable to a technically literate owner.

Good:
- component/subsystem names;
- real blocker;
- concise evidence;
- exact class of validation that passed/failed;
- short explanation of specialized terms.

Avoid unless owner explicitly asks:
- long commit hashes;
- raw run IDs;
- stack dumps;
- long addresses;
- raw log walls;
- unnecessary file-path inventories.

## Humor and brigade voice

Worker start reports remain first-person brigade voice. Light factory-floor humor is welcome when it does not hide status.

OTK reports may retain dry factory-floor tone but must remain clearly independent supervision, not imitation of the worker.

No invented biography, humiliation or factual distortion.

## Publication semantics

Both new report classes are append-only publication events:

- worker starts: `.agent/reports/starts/*.md`;
- OTK results: `.agent/reports/otk/*.md`.

Legacy immutable OTK reports remain under:
- `.agent/reports/published/*.md`.

Telegram delivery is triggered by creation of a new immutable report in any of those three locations.

Redelivery requests remain under:

`.agent/reports/redelivery/*.request`

A request may point to one existing immutable report in `starts/`, `otk/`, or legacy `published/`.

External delivery must always be tied to the exact triggering commit (`${{ github.sha }}`), never the moving branch head.
