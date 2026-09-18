# User Rules

## REQUIREMENT — autonomy

- Heavy reasoning in ordinary Chat, not Work.
- Avoid separately billed OpenAI API.
- GitHub is durable memory/state/queue.
- Scheduled Tasks are cloud clocks, not mutable orchestration state.

## REQUIREMENT — scheduler

Runtime never re-arms/reschedules/enables/disables Scheduled Tasks. Scheduler changes only on explicit owner instruction.

## REQUIREMENT — concurrency

One production worker maximum. Worker + manager is acceptable. Worker + worker is not.

## REQUIREMENT — management

User is project owner. Persistent manager is «Начальник участка». Manager does not score workers. ОТК independently accepts/scores shifts.

## PREFERENCE — reports

First-person, technically accurate but understandable; explicit predecessor assessment, plan, result and recommendation; more humor/irony/teasing; Moscow start/end; OTK score and rating on separate lines.

## REQUIREMENT — context

Project Context Capsule is the standard mechanism for preserving development history and substantial project chats in each repository.
