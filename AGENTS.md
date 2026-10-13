# AGENTS.md

This file defines working guidelines for AI coding agents in this repository. It applies throughout the repository unless a more specific `AGENTS.md` exists in a subdirectory.

## Project Overview

- This repository is an architectural-review proof of concept.
- The application uses React 19, Vite, and React Router.
- Tests use Jest, jsdom, and React Testing Library.
- Application source lives in `src/`; static assets live in `public/`.
- Consult `README.md` for setup and `DECISIONS.md` for documented architectural choices, when present.

## Priorities

1. Preserve existing behavior unless the task explicitly changes it.
2. Implement the requested outcome with focused, maintainable changes.
3. Follow established patterns and reuse existing code where practical.
4. Protect accessibility, responsive behavior, security, and test coverage.
5. Explain meaningful assumptions, tradeoffs, and verification results.

## Before Implementation

- Inspect relevant components, routes, utilities, styles, tests, and documentation before editing.
- Identify likely dependencies and regression risks.
- For substantial features, briefly outline the approach before implementation.
- Ask for clarification when ambiguity materially affects behavior, data integrity, security, user experience, or architecture.
- For minor details, follow existing conventions and disclose important assumptions.
- Do not assume prior chat history is available; use the repository as the source of truth.

## Working Agreement

- Keep changes scoped to the task; do not modify unrelated files or overwrite user changes.
- Reuse existing components before introducing new abstractions or competing implementations.
- Ask before adding production dependencies or making broad architectural changes that are not clearly required.
- Do not create commits, push branches, or open pull requests unless explicitly requested.
- Never commit secrets, credentials, generated build output, or local environment files.
- Do not weaken security or validation checks to make a feature work.

## Code Conventions

- Use modern JavaScript and functional React components.
- Keep components focused; use descriptive names for props, state, and handlers.
- Keep page-specific code in `src/pages/` and reusable UI in `src/components/`, consistent with the existing structure.
- Co-locate styles and tests where the repository already follows that pattern.
- Prefer semantic HTML and native controls; ensure accessible labels, keyboard support, and sensible focus behavior.
- Use ARIA where native semantics are insufficient, not as a replacement for them.
- Maintain existing responsive and styling conventions.
- Prefer local state unless shared state is demonstrably needed; do not introduce a state-management library without approval.
- Avoid premature memoization, speculative abstractions, and unrelated formatting changes.

## Feature Development

- Trace relevant user flows and consider loading, empty, error, and success states where applicable.
- Preserve established component APIs, validation patterns, and routing behavior unless the task requires changes.
- Handle user input and errors explicitly, following existing project patterns.
- When changing shared code, review its consumers and likely regression points.
- Avoid unrelated refactors; propose them separately when useful.

## Testing and Validation

- Add or update tests for changed behavior and bug fixes.
- Prefer tests of user-visible behavior over implementation details.
- Include relevant regression cases; do not delete or weaken tests merely to make them pass.
- Run the checks appropriate to the edited area. For a typical change, use:

```sh
npm test -- --runInBand
npm run lint
npm run build
```

- First confirm that these scripts exist in `package.json`; if they differ, use the repository's actual scripts.
- If checks fail or cannot be run, report the command and relevant failure without claiming successful verification.

## Architectural Continuity

- Consult `DECISIONS.md` before making changes that affect documented architectural choices.
- When a significant architectural decision is agreed upon, record its context, decision, and tradeoffs in `DECISIONS.md`.
- Do not treat unverified proposals as established decisions.
- Do not record routine implementation details as architectural decisions.
- If an existing decision conflicts with a new requirement, surface the conflict before changing the architecture.

## Communication and Handoff

- Keep updates concise and specific.
- On completion, summarize what changed and list the main files affected.
- State which tests, lint checks, and builds were run and their results.
- Mention significant assumptions, tradeoffs, remaining risks, or follow-up work.
- When introducing a meaningful new pattern, briefly explain why it was chosen.
- Do not imply that work was verified when it was not.

## Project-Specific Guidance

Add durable, verified project rules here as the application evolves, such as design-system conventions, API contracts, browser support targets, authentication boundaries, or directories that agents must not edit. Keep these instructions short and avoid duplicating `DECISIONS.md`.
