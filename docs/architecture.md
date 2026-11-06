# CoastWatch Architecture

## Decision record

**Status:** approved implementation baseline (2026-10-14).  The repository currently has no application source, package manifest, lockfile, or test setup. The planned structure below is therefore a new, additive scaffold; the master specification remains the product source of truth.

**Chosen stack:** React 18 + TypeScript + Vite frontend; Express + TypeScript API; MongoDB + Mongoose persistence; Python FastAPI AI service. The application is a three-service workspace, with API contracts shared as a TypeScript package. This follows the supplied specification without introducing an unnecessary fourth service.

## Service boundary

```text
Browser (React/Vite) -- HTTPS /api --> Express API -- MongoDB
       |                                |
       |                                +-- HTTP (service token, timeout) --> FastAPI AI
       +-- OpenStreetMap tiles           +-- storage adapter (local in demo, Cloudinary when configured)
```

| Component | Owns | Must not own |
|---|---|---|
| `apps/web` | Routes, accessible UI, query cache, client-only form validation, map/chart rendering | Database access, private credentials, authoritative review/AI decisions |
| `apps/api` | Authentication/roles, validation, persistence, aggregation, uploads, imports, audit log, correlation orchestration | UI state, model training/inference implementation |
| `apps/ai` | Pydantic validation, model loading/inference, model metadata/health | MongoDB access, reviewer status, uploads |
| `packages/contracts` | Public DTOs, enum literals, API envelope types, non-secret validation-compatible types | Mongoose models, browser/runtime configuration |

The Express API is the only writer to MongoDB. AI output is advisory and is stored by the API separately from a reviewer’s verification status. Failure or timeout from AI never prevents report creation.

## Repository layout and exclusive ownership

```text
apps/
  web/                         # frontend specialist only
  api/                         # API/persistence specialist only
  ai/                          # AI specialist only
packages/
  contracts/                   # contracts owner only; changes require API + web review
docs/                          # lead/documentation owner; specialist-specific notes allowed
infra/                         # deployment/security owner only
```

Within the applications, intended ownership is:

| Path | Primary owner | Change rule |
|---|---|---|
| `apps/web/src/features/**`, `components/**`, `routes/**` | Frontend | Consume DTOs only; do not redefine API shapes. |
| `apps/api/src/routes/**`, `services/**`, `models/**`, `middleware/**` | API | Route behavior must match `docs/api-contract.md`. |
| `apps/ai/app/**`, `apps/ai/tests/**`, `apps/ai/data/**` | AI | Return only the `/health` and `/analyze` contract. |
| `packages/contracts/src/**` | Contracts owner | Version/API review required before a breaking edit. |
| root workspace files (`package.json`, lockfile, `.gitignore`) | Foundation owner | One owner prevents dependency/lockfile conflicts. |
| `.env.example`, `infra/**`, security docs | Platform/security | Never add actual secrets. |

## Core persistence model

MongoDB collections: `reports`, `social_posts`, `incidents`, `audit_events`, `notifications`, and `import_jobs`.

Common rules:

- IDs exposed to users are stable public IDs (`RPT-000123`, `INC-000042`), while Mongo `_id` stays internal.
- All timestamps are UTC ISO-8601 strings at the HTTP boundary.
- Geographic points use GeoJSON `[longitude, latitude]`; latitude is `-90..90`, longitude `-180..180`.
- Hazard type: `coastal_flooding | high_waves | oil_spill | coastal_erosion | other`; AI may additionally return `unknown`.
- Report status: `pending_review | under_review | verified | rejected | needs_information`.
- Severity: `low | medium | high | critical`.
- Incident status: `proposed | under_review | verified | closed | rejected`.
- Demo and imported social material is always labelled with its source mode; it is never presented as a live official feed.

Required indexes: unique `reports.publicId`; report indexes on `createdAt`, `status`, `hazardType`, `source`, and valid `location` as `2dsphere`; unique sparse social `(platform, externalId)`; social indexes on `createdAt` and predicted category; incident `publicId` unique. API list endpoints are capped and paginated.

## Workflow and reliability

1. The browser submits a multipart report to the API.
2. The API validates it, stores the report as `pending_review` with analysis `pending`, and stores permitted evidence through the storage adapter.
3. The API invokes FastAPI with a short configurable timeout. It writes a validated result as `completed`, or writes `failed`/`unavailable` without rolling back the report.
4. Query invalidation refreshes the dashboard, lists, and map from shared API data.
5. A reviewer makes a protected status transition. The API validates the transition, persists it, and writes an audit event and relevant notification.
6. Correlation creates suggestions only. A reviewer confirms links; source records are never merged or deleted automatically.

## Security and deployment posture

- Frontend receives only `VITE_*` public configuration. Database, AI token, session/JWT keys, and storage credentials are API-only.
- CORS uses an explicit origin allowlist. Helmet, payload/upload limits, structured request IDs, and route-specific rate limits are applied in API middleware.
- Public report submission is rate-limited. Review, import, incident-link, notification, and settings mutations require an authenticated reviewer/admin role.
- Local demo uploads reside outside public source paths and are not production persistence. Cloudinary is used only when all credentials are configured.
- `/api/health` is dependency-safe and never exposes secrets. FastAPI should be private to the API network in production and protected with `AI_SERVICE_TOKEN` when configured.

## Dependencies to install (not yet installed)

| Area | Required dependencies |
|---|---|
| Web | `react`, `react-dom`, `react-router-dom`, `@tanstack/react-query`, `react-hook-form`, `zod`, `@hookform/resolvers`, `leaflet`, `react-leaflet`, `recharts`, `lucide-react`, `date-fns` |
| API | `express`, `mongoose`, `zod`, `helmet`, `cors`, `express-rate-limit`, `multer`, `pino`, `pino-http`, `uuid`, `csv-parse` |
| AI | `fastapi`, `uvicorn`, `pydantic`, `scikit-learn`, `joblib`, `pytest`, `httpx` |
| Development/test | TypeScript, ESLint, Prettier, Vitest, React Testing Library, Supertest, Playwright, `tsx`, and type packages as applicable |

Pin exact versions in the generated lockfiles; do not install optional Cloudinary or an authentication library until their implementation task begins and the selected integration is recorded.
