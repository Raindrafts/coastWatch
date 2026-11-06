# CoastWatch Implementation Plan

## Current audit

At 2026-10-14 the root contains only `CoastWatch_Ultimate_Hackathon_Implementation_Prompt (1).md` and an empty `docs/` directory. There are no application files, dependency manifests, environment files, tests, routes, or scripts. No existing code will be overwritten. The minimal-change approach is to add the planned workspace once in Phase 1 and build vertical slices after contracts are locked.

## Prerequisites and assumptions

- Node.js 20 LTS+, npm workspaces, Python 3.11+, and either local MongoDB 7+ or a MongoDB Atlas URI will be available to implementers.
- The initial release runs in `demo` mode with deterministic synthetic data and local storage fallback. No live social connector is in scope without authorised credentials.
- Authentication begins with a development-only demo role selector; production deployment requires a real identity provider/session implementation before reviewer endpoints are exposed.
- Required external configuration: MongoDB URI; optional Cloudinary credentials; deployment origins; and `AI_SERVICE_TOKEN` for service-to-service production traffic.

## Environment contract

Create `.env.example` only (never `.env`) with these exact names:

```dotenv
# browser-safe frontend configuration
VITE_API_BASE_URL=http://localhost:4000/api
VITE_APP_MODE=demo

# Express API
NODE_ENV=development
PORT=4000
MONGODB_URI=mongodb://localhost:27017/coastwatch
FRONTEND_ORIGIN=http://localhost:5173
AI_SERVICE_URL=http://localhost:8000
AI_SERVICE_TOKEN=replace-with-shared-local-token
SESSION_SECRET=replace-with-a-long-random-secret
MAX_UPLOAD_MB=5
MAX_IMPORT_MB=5
MAX_IMPORT_ROWS=1000
AI_TIMEOUT_MS=3000
STORAGE_MODE=local
UPLOAD_DIR=./data/uploads
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# FastAPI
AI_PORT=8000
MODEL_PATH=./data/model.joblib
MODEL_VERSION=baseline-v1
```

Startup validation: API requires `MONGODB_URI`, `FRONTEND_ORIGIN`, `SESSION_SECRET`, and `AI_SERVICE_URL` outside explicitly documented offline demo mode. AI validates `MODEL_PATH` or explicitly starts in a documented unavailable-model state. No private setting may use a `VITE_` name.

## Ordered phases

| Phase | Deliverable and dependencies | Acceptance criteria |
|---|---|---|
| 0 — completed | Repository audit plus these architecture, API, task, and implementation documents. | No implementation code changed; ownership, contracts, env, risks, dependencies are explicit. |
| 1 — foundation | Root npm workspace; Vite web app; API and Python app skeletons; routing, app shell, design primitives, lint/type/test scripts. Depends on Node/Python availability. | Every required route renders, navigation has no dead links, responsive shell works, root scripts run. |
| 2 — contracts/demo | `packages/contracts`; synthetic deterministic seed data; data service/query layer; demo labels and aggregate unit tests. Depends on Phase 1. | One data shape drives lists, KPIs, charts, and map; no contradictory hardcoded metrics. |
| 3 — API/persistence | Config validation, Mongo connection/models/indexes, health/reports routes, seed command, API tests. Depends on Phase 2 + MongoDB. | Create/read report persistence, validated filtering/pagination, health response, AI-unavailable creation path. |
| 4 — reporting | Report form, coordinate/geolocation flow, secure image validation/storage adapter, confirmation and rate limit. Depends on Phase 3. | Valid report persists/appears in UI; invalid input/upload fails clearly; privacy redaction is verified. |
| 5 — AI | FastAPI baseline, labelled data, test split/metrics, model artefact, API timeout/fallback. Depends on contracts and Python packages. | Genuine inference and metadata; low-confidence handling; outage does not block reports. |
| 6 — dashboard | Summary/analytics endpoints and dashboard KPI/map/charts/review/social cards. Depends on stored seed/report/social data. | Every KPI derives from endpoint data, filters/actions work, disclaimer and demo labels are visible. |
| 7 — investigations | Report list/detail, full map synchronisation, correlation suggestions, incidents/link review. Depends on Phase 6. | Search/sort/pagination, explainable suggestions, confirmed links audited, no destructive merge. |
| 8 — social import | Template, preview token, validation/duplicate handling, commit, analysis and analytics UI. Depends on API + AI. | CSV preview/commit works; invalid data cannot corrupt storage; analytics update. |
| 9 — review/security | Auth/role gate, status workflow, audit events, real notifications. Depends on report/incident APIs. | Unauthorized mutations fail; transitions persist with reasons/audit; unread count derives from records. |
| 10 — quality | Accessibility, responsive checks, error/empty/loading states, rate/CORS/upload/security review, complete quality gate. Depends on all prior phases. | Lint/type/unit/API/build checks pass; manual/Playwright critical-flow evidence recorded. |
| 11 — deployment/demo | Hosting config, health/CORS checks, seed/reset safety, README, demo script. Depends on deployment credentials. | Deployed endpoints are actually checked or deployment remains explicitly unverified; 3–5 minute demo is repeatable. |

## Cross-cutting acceptance gates

Before a phase is marked complete, its owner must: run its relevant test/build commands; record actual results; preserve the shared contracts; add loading/empty/error states for new UI; and verify no secret or unlabelled demo claim was introduced. Before release: run all workspaces’ lint, typecheck, unit tests, API integration tests, production builds, plus Playwright/manual flows for report submission, AI outage, CSV invalid/valid imports, review authorization, map missing coordinates, and mobile navigation.

## Risks and mitigations

| Risk | Mitigation |
|---|---|
| MongoDB or Cloudinary credentials unavailable | Use documented local demo storage; do not claim production persistence/deployment. |
| AI model unavailable/slow | Explicit `unavailable`/`failed` analysis state; bounded timeout; report persists. |
| Live social-data authority unavailable | CSV/demo-only, labelled source mode; no scraping. |
| Concurrent implementation conflicts | Respect the ownership table and change contracts only through the contracts owner. |
| Map tile/network failure | Render non-map list fallback and an informative unavailable state. |
| Reviewer auth deferred | Development selector only under `NODE_ENV=development`; production blocks protected operations until real auth is configured. |
