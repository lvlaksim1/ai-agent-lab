# Project Constraints

- No Work for production reasoning.
- No separately billed OpenAI API dependency.
- Runtime does not create/re-arm/reschedule Scheduled Tasks.
- Scheduler is immutable after explicit owner-approved configuration.
- GitHub is the only mutable orchestration substrate.
- At most one production worker concurrently.
- Manager + one worker is allowed; worker + worker is not.
- ОТК is independent; workers do not score themselves.
- Do not weaken tests/proof gates/Definition of Done.
- Do not persist credentials/secrets.
- New chats recover repository context before asking for recap.
- Never claim verbatim recovery of unavailable chats.
