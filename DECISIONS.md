# DECISIONS.md

This file records durable architectural decisions for the Architectural Review application so they remain understandable across features and Codex conversations.

**Status:** Repository-verified baseline. Decisions below describe the current proof-of-concept architecture; unresolved topics remain questions rather than implementation instructions.

## How to Use This File

- Read relevant decisions before changing architecture or shared patterns.
- Record meaningful decisions after they are agreed upon or verified in the repository.
- For each decision, include its status, context, choice, rationale, and consequences.
- Mark superseded decisions rather than silently deleting their history.
- Do not add entries for ordinary bug fixes or routine component changes.

## Established Baseline

### ADR-001: Frontend Technology

**Status:** Established from project overview

**Context:** The application is an architectural-review proof of concept.

**Decision:** Use React 19, Vite, and React Router in the existing JavaScript application. Continue using the repository's current framework and build setup unless a change is explicitly approved.

**Rationale:** Consistency reduces unnecessary migration work and allows features to build on existing functionality.

**Consequences:** New features should integrate with the existing application and routing conventions rather than introducing a competing framework.

### ADR-002: Test Tooling and Coverage

**Status:** Established from repository implementation

**Context:** The repository uses a JavaScript testing stack and enforces global coverage thresholds in Jest configuration.

**Decision:** Continue using Jest, jsdom, and React Testing Library for applicable frontend tests. Maintain the configured 100% global thresholds for branches, functions, lines, and statements unless a change is explicitly approved.

**Rationale:** Reusing the current tools supports consistent regression testing without unnecessary dependencies. The configured thresholds make comprehensive coverage an explicit project constraint.

**Consequences:** Test user-visible behavior where practical, follow the existing test organization, and add cases for every new branch. Revisit the tools or thresholds only if a documented need warrants the change.

### ADR-003: Source Organization and Shared UI

**Status:** Established from repository implementation

**Context:** Application source is in `src/`, static assets are in `public/`, and the repository follows consistent page, component, utility, test, and stylesheet placement.

**Decision:** Keep page-level code in `src/pages/`, reusable UI in `src/components/`, and non-UI data utilities in `src/lib/`. Co-locate component and page styles and tests with the code they cover. Reuse shared primitives such as `Button`, `FormField`, `Alert`, and `AppShell` when their APIs fit.

**Rationale:** Predictable organization and reuse make behavior easier to locate, test, and maintain.

**Consequences:** Avoid parallel folder structures and competing UI primitives without a clear need. Introduce shared abstractions only when they represent repeated behavior rather than speculative future requirements.

### ADR-004: Static Hosting and Client Routing

**Status:** Established from repository implementation

**Context:** The application is configured with a `/arch-rev/` Vite base path and has no server-side route-rewrite configuration.

**Decision:** Use React Router's `HashRouter`, keep application routes declared centrally in `App.jsx`, and build for the `/arch-rev/` subpath.

**Rationale:** Hash-based routing works on static hosting without requiring the server to rewrite every application URL to `index.html`.

**Consequences:** Navigable application URLs include a hash fragment. Changing to history-based routing or changing the deployment subpath requires coordinated hosting and Vite configuration changes.

### ADR-005: Browser-Local Prototype Persistence

**Status:** Established for the proof of concept

**Context:** The application has no backend or API integration. Users, sessions, architectural requests, and password-reset records are stored in browser storage.

**Decision:** Centralize synchronous `localStorage` access in `src/lib/localData.js`. UI components should use that module's domain-oriented functions instead of accessing persistence keys directly. Treat this persistence model as a proof-of-concept implementation only.

**Rationale:** A small browser-local data layer supports complete workflow demonstrations without backend infrastructure and provides a single seam for later replacement.

**Consequences:** Data is limited to one browser and device, can be deleted by clearing site storage, and has no concurrency or remote synchronization. Passwords and reset codes are stored client-side and are not secure. Production use requires a secure backend and migration plan; sensitive production data must not be stored this way.

### ADR-006: Simulated Authentication and Route Protection

**Status:** Established for the proof of concept

**Context:** The proof of concept needs authenticated and unauthenticated user flows without an identity service.

**Decision:** Represent the current session in browser-local persistence and use the reusable `ProtectedRoute` component for authenticated-only pages. Keep login, signup, forgot-password, and reset-password routes public; protect `/home` and `/requests/new`.

**Rationale:** This provides consistent navigation behavior for demonstrating the application flow with minimal infrastructure.

**Consequences:** `ProtectedRoute` is a client-side user-interface guard, not an authorization or security boundary. Any production system must validate identity and authorization on a trusted server and replace the current credential and reset-code handling.

### ADR-007: Local UI State and Form Handling

**Status:** Established as the current implementation pattern

**Context:** Existing pages and forms manage transient behavior locally. Forms use native controls and explicit submission-time validation rather than a form or global-state library.

**Decision:** Prefer component-local React state for transient UI state. Use native form controls, `FormData`, and explicit validation state when the existing approach remains suitable. Route persistent domain operations through `src/lib/localData.js`.

**Rationale:** Local state and native browser form APIs keep the proof of concept understandable and avoid dependencies that current requirements do not justify.

**Consequences:** Introduce context, a state-management library, or a form library only when shared or complex requirements clearly warrant it and the architectural change is approved. The current use of placeholders and ARIA labels is an implementation detail, not a settled accessibility standard; future forms should still prefer visible labels and native semantics.

### ADR-008: Styling and Responsive Design

**Status:** Established from repository implementation

**Context:** The application uses plain CSS, global design tokens, and component- or page-specific stylesheets. Existing layouts are mobile-first and commonly change at 768 pixels.

**Decision:** Continue using plain CSS co-located with components and pages. Define shared color, typography, and semantic values as CSS custom properties in `src/index.css`. Build layouts mobile-first and use the existing 768-pixel breakpoint where it fits the design.

**Rationale:** This provides a lightweight design foundation without adding a styling framework and keeps styles close to their consumers.

**Consequences:** New styles should consume existing tokens before adding hard-coded alternatives. New tokens or breakpoints should represent reusable design needs, and component styles should avoid unintentionally broad global selectors.

### ADR-009: Architectural Request Persistence Schema

**Status:** Established from repository implementation and tests

**Context:** A request can contain multiple improvements, while older request data and consumers may expect a single improvement at the request's top level. Browser storage cannot retain uploaded `File` objects reliably as JSON.

**Decision:** Store improvements in an `improvements` array. Also expose the first improvement through the top-level `improvementType`, `description`, and `files` fields for backward compatibility. Persist uploaded-file metadata (`name`, `size`, and `type`) rather than file contents.

**Rationale:** The array supports the current multi-improvement workflow while the duplicated fields preserve compatibility with the earlier single-improvement shape. Metadata is sufficient for the local workflow demonstration and remains JSON-serializable.

**Consequences:** Code reading request data should prefer `improvements` while tolerating the legacy shape where needed. The duplicated fields can diverge if updates are not centralized. Actual file upload and retrieval require backend storage and a documented schema migration.

## Decisions to Confirm

The following topics are intentionally **not yet established decisions**. Inspect the current code and agree on a direction before recording them as accepted ADRs.

| Topic | Questions to resolve |
| --- | --- |
| API integration | What conventions govern requests, validation, errors, retries, and migration away from `localData.js`? |
| Production authentication and authorization | Which identity system, session mechanism, and role-based permissions are required? |
| Accessibility | Which accessibility standard and supported assistive-technology targets apply? |
| Browser support | Which browsers, versions, and device classes must be supported? |
| Deployment | Where is the application hosted, and what release checks are required? |

## Decision Record Template

Copy this section when a new architectural decision is made.

```md
### ADR-XXX: Decision Title

**Status:** Proposed | Accepted | Superseded
**Date:** YYYY-MM-DD

**Context:**
What problem or constraint prompted the decision?

**Decision:**
What approach was chosen?

**Rationale:**
Why was this approach selected over reasonable alternatives?

**Consequences:**
What tradeoffs, constraints, or follow-up work result?

**Supersedes / Related:**
Optional links to earlier decisions or relevant documentation.
```

## Decision History

| ID | Decision | Status |
| --- | --- | --- |
| ADR-001 | Frontend technology | Established |
| ADR-002 | Test tooling and coverage | Established |
| ADR-003 | Source organization and shared UI | Established |
| ADR-004 | Static hosting and client routing | Established |
| ADR-005 | Browser-local prototype persistence | Established for proof of concept |
| ADR-006 | Simulated authentication and route protection | Established for proof of concept |
| ADR-007 | Local UI state and form handling | Established current pattern |
| ADR-008 | Styling and responsive design | Established |
| ADR-009 | Architectural request persistence schema | Established |

Update this table when new decisions are accepted or superseded.
