# Brigade Human Reporting Standard

## Purpose

Human-facing worker reports must be useful to the owner without forcing him to read raw CI logs or internal journals.

The report is written in first person singular from the reviewed worker's point of view, but ОТК remains the factual authority and publishes it only after independent verification.

## Authoritative time

Every production shift MUST preserve two authoritative timestamps:

- `shift_started_at_utc`
- `shift_completed_at_utc`

Do not invent them from the scheduler minute or from conversational memory.

Preferred source:
1. `shift_started_at_utc` = GitHub server timestamp of the commit that successfully claims the production lease;
2. `shift_completed_at_utc` = GitHub server timestamp of the final production journal/handoff commit, or the production-lease release commit if that is the first authoritative end marker available.

The worker must carry both timestamps into the supervisor-review event. ОТК may recover them from GitHub commit history if an older event lacks them.

Human output converts them to Moscow time using `Europe/Moscow` / UTC+03:00 and prints:

`DD.MM.YYYY HH:MM:SS МСК`

## Required report format

```text
Проект: <human project name>
Работник: <brigade display name>
Смена: №<global brigade shift number>
Начало смены: <DD.MM.YYYY HH:MM:SS МСК>
Конец смены: <DD.MM.YYYY HH:MM:SS МСК>

Доклад:

ОЦЕНКА ПРЕДЫДУЩЕГО:
<first-person paragraph>

МОЙ ПЛАН:
<first-person paragraph>

ЧТО ПОЛУЧИЛОСЬ:
<first-person paragraph>

СЛЕДУЮЩЕМУ:
<first-person paragraph>

Оценка ОТК: <score>/10 — <verdict>
Рейтинг: <new rating> (<signed delta>)
```

The four report sections are mandatory and stay inside the worker's `Доклад`.

ОТК score and rating are NOT part of the narrative. They always appear as separate lines after the report.

## Meaning of the sections

### ОЦЕНКА ПРЕДЫДУЩЕГО

The current worker assesses the immediately preceding production shift:
- what useful evidence or working state was inherited;
- what predecessor did well;
- what remained incomplete or awkward;
- no invented criticism.

A friendly jab is encouraged when it fits the evidence.

### МОЙ ПЛАН

This must reflect what the worker intended to do BEFORE making the substantive change, not a hindsight rewrite.

State:
- the immediate technical objective;
- the hypothesis or blocker being attacked;
- the success criterion.

### ЧТО ПОЛУЧИЛОСЬ

Explain:
- what was actually changed or established;
- what passed/failed;
- what the technical result means in plain Russian;
- any mismatch between plan and outcome.

### СЛЕДУЮЩЕМУ

Give the next worker a practical handoff:
- what to verify first;
- what not to repeat;
- what result unlocks the next stage.

## Technical depth

Reports must contain real technical substance, but remain readable to a technically literate owner who is not immersed in every implementation detail.

Good:
- subsystem/component names;
- concrete failing stage;
- nature of data corruption;
- exact kind of validation/test that passed or failed;
- a short explanation of specialized jargon.

Avoid:
- raw hashes;
- run IDs;
- long addresses;
- stack dumps;
- file paths unless essential;
- raw log walls.

## Humor and brigade voice

Humor is part of the brigade culture and should be more noticeable than before.

Allowed:
- 2–4 short jokes, ironic remarks or collegial jabs when the report length supports it;
- teasing the predecessor for leaving a crooked bolt, a half-dug trench, or an overenthusiastic hypothesis;
- teasing oneself for a failed experiment;
- dry factory-floor metaphors.

Requirements:
- humor must never alter factual meaning;
- no humiliation, insults, slurs or personal attacks;
- no invented biography or off-work behavior;
- do not joke over a serious blocker in a way that hides its severity.

Examples:
- «Борисыч наконец заставил CI назвать виновный патч по имени — до этого станок только мигал красной лампочкой и делал вид, что это исчерпывающая диагностика.»
- «Я в сам C-код не полез: когда табличка на ящике подписана криво, двигатель разбирать рановато.»
- «Следующему оставляю не ребус, а одну проверку. Если и тут умудримся заблудиться, придётся рисовать мелом стрелки на полу.»

## Evidence discipline

First-person prose is presentation only. ОТК verifies every material statement against journal/review/CI/repository evidence.

If the worker claimed something that ОТК cannot verify, the final human report must correct or qualify it.


## Publication semantics

Human report publication is append-only.

For every completed OTK review, create one immutable report file:

`.agent/reports/published/<review-event-id>.md`

The file contains exactly the final human report that is intended for Telegram.

Rules:
- create it once;
- never edit or overwrite an existing published report;
- if the same review is retried and the published file already exists, verify that it matches and do NOT republish it;
- after creating the immutable report, update `.agent/reports/latest.md` as a convenience mirror of the newest report;
- changing `latest.md` later is NOT a publication event.

Telegram delivery is triggered only by creation of a new immutable file under `.agent/reports/published/`.

This prevents an old shift from being resent merely because its formatting, documentation or `latest.md` was edited later.
