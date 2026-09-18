# Project Goals

## Primary goal

Build a reliable autonomous engineering/research system using native ChatGPT Plus capabilities and GitHub, without separately billed OpenAI API and without Work for production reasoning.

## Operating model

- ordinary Chat = reasoning/intelligence;
- GitHub = durable memory, queue, state machine, journal and event bus;
- native recurring Scheduled Chat = immutable cloud clock;
- GitHub Actions = deterministic intake/reporting;
- persistent «Начальник участка» across new chats;
- one production worker at a time;
- independent ОТК;
- manager may work concurrently with one production worker;
- brigade can move between project objects safely;
- new interactive Chat restores project semantics from this repository.
