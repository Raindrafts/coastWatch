# CoastWatch — Marine Hazard Reporting & Social Analytics Platform

**CoastWatch** is an integrated platform combining crowdsourced ocean and coastal hazard reporting with social media signal analytics. It applies explainable AI-assisted classification and prioritization, clusters related signals into incident groupings, visualizes observations on an interactive geospatial map, and provides an audited reviewer triage workflow.

---

## Architecture Overview

```text
               +-------------------------------------------+
               |        React 18 + Vite Web App            |
               |  (Leaflet Map, Recharts, Tailwind CSS)    |
               +--------------------+----------------------+
                                    |
                            HTTP/REST API
                                    |
               +--------------------+----------------------+
               |          Express + TypeScript API         |
               |  (Validation, Status Machine, Audits,     |
               |   Incident Correlation, CSV Engine)       |
               +----------+-----------------------+--------+
                          |                       |
               Internal REST JSON          Shared Contracts
                          |                       |
               +----------+-----------+  +--------+--------+
               |   FastAPI AI Service |  |   @coastwatch/  |
               |  (Heuristic + ML NLP |  |    contracts    |
               |   Hazard Inference)  |  +-----------------+
               +----------------------+
```

---

## Workspaces Structure

- [`packages/contracts`](file:///c:/Users/admin/OneDrive/Desktop/CoastWatch/packages/contracts): Shared TypeScript DTOs, schemas, enums, and API envelopes.
- [`apps/api`](file:///c:/Users/admin/OneDrive/Desktop/CoastWatch/apps/api): Express REST API with full status state machines, CSV preview & commit pipeline, incident grouping, and audit logging.
- [`apps/ai`](file:///c:/Users/admin/OneDrive/Desktop/CoastWatch/apps/ai): Python FastAPI service implementing hazard classification, explainability keyword extraction, and confidence scoring.
- [`apps/web`](file:///c:/Users/admin/OneDrive/Desktop/CoastWatch/apps/web): React single-page application with Leaflet mapping, real-time KPI metrics, citizen submission form, incident linker, social charts, and reviewer triage queue.
- [`.agents/agents`](file:///c:/Users/admin/OneDrive/Desktop/CoastWatch/.agents/agents): Multi-agent specifications for collaborative IDE agents (orchestrator, backend, frontend, ai-nlp, maps-social, qa).
- [`docs`](file:///c:/Users/admin/OneDrive/Desktop/CoastWatch/docs): Complete architecture specs, API contract, implementation plan, task allocation table, and QA test matrix.

---

## Quickstart & Verification

### 1. Build All Workspaces
```bash
npm run build --workspaces
```

### 2. Run Test Suites
```bash
# Backend API integration tests (9 passing tests covering all contract endpoints)
npm test --workspace=@coastwatch/api

# AI / NLP FastAPI test suite (5 passing unit tests)
py -m pytest apps/ai/test_main.py
```

### 3. Launch Development Servers

```bash
# Terminal 1: AI Service (port 8000)
py -m uvicorn apps.ai.main:app --port 8000 --reload

# Terminal 2: Express Backend (port 4000)
npm run dev --workspace=@coastwatch/api

# Terminal 3: React Frontend (port 3000 / 5173)
npm run dev --workspace=@coastwatch/web
```

---

## Core Features Implemented

1. **Geospatial Hazard Map & Explorer**:
   - Interactive OpenStreetMap tile rendering via Leaflet.
   - Filterable markers by hazard category (`coastal_flooding`, `high_waves`, `oil_spill`, `coastal_erosion`, `marine_debris`).
   - Graceful fallback and non-mapped list counter for reports without coordinates.

2. **Citizen Hazard Reporting Flow**:
   - Client and server-side validated input (title, description min 20 chars, category, severity).
   - One-click browser geolocation or manual coordinate entry.
   - Automated reference ID generation (`RPT-xxxxxx`) and instant AI triage queuing.

3. **AI Classification & Explainability**:
   - Text inference returning detected hazard type, confidence score, extracted keywords, and human-readable explanation.
   - Fault-tolerant fallback: if AI is unavailable or times out, report persistence succeeds with an advisory fallback tag.

4. **Incident Clustering & Association**:
   - Grouping of multiple citizen reports and corroborating social signals into unified incidents (`INC-xxxxxx`).
   - Prioritization rationale scoring (severity, multi-source corroboration, infrastructure impact).
   - Audited linking workflow that preserves original source records.

5. **Social Signal Analytics & Bulk CSV Ingestion**:
   - Multi-platform sentiment and keyword trend analytics.
   - Downloadable CSV template and atomic two-step import pipeline:
     1. `POST /api/social/import/preview`: Schema validation, formula injection protection, duplicate detection, and 15-minute single-use `previewToken`.
     2. `POST /api/social/import/commit`: Consumes token and integrates records.

6. **Reviewer Triage Queue & Status State Machine**:
   - Role switcher (`Reporter`, `Analyst`, `Reviewer`, `Administrator`).
   - Strict transition constraints:
     - `pending_review` -> `under_review` | `needs_information` | `rejected`
     - `under_review` -> `verified` | `rejected` | `needs_information`
     - Mandatory written reason required when verifying or rejecting.
   - Immutable audit trail recording actor ID, timestamp, and transition metadata.

---

## Safety Disclaimer
CoastWatch is an experimental disaster risk reduction research prototype. AI classifications and citizen reports are advisory and subject to official human verification. Never treat unverified signals as confirmed civil protection warnings.
