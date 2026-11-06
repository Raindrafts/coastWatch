# CoastWatch Specialist Task Table

This table assigns exclusive file ownership before implementation. “Done” means the acceptance check is evidenced with commands/results, not merely that files exist. Specialists may read any file, but must not edit another specialist’s exclusive paths without coordinating a handoff.

| Order | Specialist | Exclusive files/directories | Scope | Inputs | Completion / acceptance criteria |
|---:|---|---|---|---|---|
| 1 | Foundation | root workspace files, `apps/web` bootstrap, `apps/api` bootstrap, `apps/ai` bootstrap | Create workspace, scripts, TypeScript/Python config, route skeletons, lint/test tooling; no product features. | Architecture + plan | All specified routes render placeholder states; install/dev/lint/typecheck scripts are truthful and pass. |
| 2 | Contracts & demo data | `packages/contracts/**`, `apps/api/src/seed/**` | Implement DTO/enums/schema types and deterministic synthetic records. | API contract | Contract compile passes; 15–25 reports and 20–40 social posts include varied states and missing coordinates; aggregations are tested. |
| 3 | API & persistence | `apps/api/src/{models,routes,services,middleware,config}/**`, `apps/api/tests/**` | Mongo models/indexes, API routes, storage/import/aggregation/correlation services, error/auth middleware. | Contracts + seed + API contract | Supertest covers creation, pagination, health, AI-down, transitions/audit, import preview, role failures; no response violates contract. |
| 4 | AI/NLP | `apps/ai/**` | FastAPI health/analyze endpoints, labelled examples, model build/evaluation, inference tests. | AI section of API contract | `pytest` covers valid, irrelevant, ambiguous, empty, low-confidence, unavailable model; model metrics/limitations are documented. |
| 5 | Reporting UI | `apps/web/src/features/reports/**` | Report form, upload preview, report detail/list/query hooks. | Contracts and live API endpoints | Client validation mirrors key rules; submission confirmation ID works; no contact data rendered publicly. |
| 6 | Dashboard/map UI | `apps/web/src/features/dashboard/**`, `features/map/**` | KPI, trends, distribution, queue, social card, Leaflet map/filter synchronisation. | Analytics/report endpoints | Cards/maps/charts derive solely from API/query data; zero/loading/error/no-coordinate states work; safety/disclaimer labels visible. |
| 7 | Incidents/social UI | `apps/web/src/features/{incidents,social}/**` | Incident views/link review, CSV preview/commit, social analytics/filtering. | Incident/social contract endpoints | Invalid CSV explained; import updates analytics; links are shown as possible/confirmed and never imply merge. |
| 8 | Review & auth UI | `apps/web/src/features/{review,auth,notifications,settings}/**` | Development role selector, guarded controls, review queue/actions, notifications/settings. | API role/status contract | Unauthorized controls/routes are blocked; successful status update refreshes all affected views; unread counts use API data. |
| 9 | Platform/security/docs | `infra/**`, `.env.example`, `README.md`, `docs/{threat-model.md,ai-evaluation.md,demo-script.md}` | Deployment manifests, environment docs, threat model, demo/runbook, release verification. | All services’ actual scripts/config | No secrets; CORS/health env documented; exact commands tested; known limitations stated. |
| 10 | QA/release integrator | `apps/web/e2e/**`, non-exclusive test-only fixes after owner approval | Cross-service smoke/E2E and accessibility/responsive audit. | Completed vertical slices | Evidence for report→AI/fallback→dashboard→review, valid/invalid CSV, AI outage, unauthorized review, mobile/map; release checklist maintained. |

## Handoff protocol

1. Contracts specialist lands or communicates the DTO change before API/web implementation begins.
2. API specialist publishes a local seeded endpoint and example responses before dependent UI work is accepted.
3. AI specialist supplies a mockable `analyze` response and explicit failure behavior; API owns fallback persistence.
4. UI specialists use the central API client and never add separate local truth for KPIs or review state.
5. Any breaking API or environment change requires updates to `docs/api-contract.md` and `docs/implementation-plan.md`, then acknowledgement from affected owners.

## Dependency sequence

`Foundation -> Contracts/demo -> API + AI (parallel) -> Reporting UI -> Dashboard/Map + Incidents/Social + Review/Auth (parallel by owned folders) -> Platform/QA`.

Do not begin a dependent task by guessing a missing interface; raise it through the contracts owner and amend the documented contract first.
