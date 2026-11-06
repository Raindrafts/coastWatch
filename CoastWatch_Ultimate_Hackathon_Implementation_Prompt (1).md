# ULTIMATE HACKATHON BUILD SPECIFICATION
## CoastWatch — Integrated Platform for Crowdsourced Ocean Hazard Reporting and Social Media Analytics

**Purpose:** This is the source-of-truth product specification and master implementation prompt for a coding AI IDE (Claude Code, Cursor, Windsurf, GitHub Copilot, or equivalent). Build the complete application in a disciplined, testable sequence. Do not stop at a landing page, a static dashboard, or disconnected mock screens.

**Project theme:** Marine / Ocean Hazard Reporting + Social Media Analytics  
**Primary outcome:** A polished, responsive, end-to-end working hackathon prototype that combines citizen-submitted ocean/coastal hazard reports with clearly labelled social-media/sample-post analytics, applies explainable AI-assisted classification and prioritisation, groups potentially related reports into incidents, and provides an interactive geospatial dashboard plus a human review workflow.

**Product name:** CoastWatch (working name; keep branding easy to change).  
**Prototype rule:** Demo data must be clearly labelled. Never claim simulated data, an unconnected API, an AI guess, or an unverified report is a real confirmed event or official warning.

---

# PART A — NON-NEGOTIABLE BUILD RULES

The coding AI must follow these rules throughout implementation.

1. **Inspect before editing.** Inspect the existing repository, package manager, framework, routes, conventions, environment variables, and available tests before changing anything. Preserve working code. Do not replace a working project with a fresh scaffold unless the repository is genuinely empty or broken and the reason is explained.
2. **Implement end to end.** Every visible primary control must work. Forms must validate and submit; filters must filter; cards must navigate or filter; charts must use actual application data; map markers must open details; review actions must persist changes; import must create records; loading, empty, and error states must exist.
3. **No dead buttons.** No `href="#"`, no buttons without handlers, no decorative controls pretending to work. If a feature is not implemented, mark it clearly as unavailable or provide a useful implemented placeholder.
4. **One source of truth.** KPIs, charts, map markers, reports, review queue, and incident detail must derive from shared data/API responses. Do not hardcode separate inconsistent numbers in each component.
5. **Use types and validation.** TypeScript on the frontend and backend is preferred. Validate API input on the server, not just in the browser. Define shared contracts where practical.
6. **Work in vertical slices.** Implement one end-to-end feature at a time, run it, test it, and fix it before moving on. Do not generate the whole application in one enormous unverified pass.
7. **No fake integrations.** Never claim live social-media ingestion, real-time environmental sensing, operational emergency alerts, or official verification unless genuinely implemented and configured. Use explicit demo modes and source labels.
8. **No unsafe emergency claims.** AI confidence and prioritisation are advisory only. The system must not autonomously issue an official tsunami, storm-surge, or evacuation warning. Display a clear safety disclaimer and link/space for official sources to be configured.
9. **No unauthorised scraping.** Do not scrape social platforms or bypass access controls. Begin with an imported CSV/demo dataset and only add an official/authorised API connector when credentials, platform permissions, and rate limits are available.
10. **No secrets in source control.** Use environment variables, `.env.example`, and server-side secrets. Never expose database credentials, API keys, upload secrets, or private tokens in frontend bundles or Git.
11. **Accessibility and responsiveness are requirements.** Keyboard access, visible focus, semantic labels, colour contrast, mobile layouts, reduced-motion awareness, and useful screen-reader names are part of completion.
12. **Professional visual quality.** Build a coherent application UI, not a generic marketing page. Use consistent spacing, typography, card styles, statuses, iconography, responsive grids, and helpful empty states.
13. **Explain tradeoffs.** When a dependency or external service is unavailable, implement a tested fallback and document the limitation. Do not silently omit a required feature.
14. **Keep the project runnable.** Maintain clear setup commands, environment documentation, seed/demo data, and a concise README. Run lint, typecheck, tests, and production builds after meaningful changes.
15. **Report completion honestly.** At the end of each phase, list what changed, commands run, tests and results, known limitations, and the exact next phase. Do not claim a test passed unless it was actually run.

---

# PART B — PRODUCT VISION AND USER FLOWS

## B1. Problem statement

Coastal hazard information can be fragmented across community observations, photos, news-like posts, and official updates. CoastWatch provides a unified interface to collect community reports, analyse permitted social posts, visualise locations, identify possible clusters, and help authorised reviewers prioritise reports.

## B2. Target users and roles

1. **Public reporter**
   - Submit a hazard report.
   - Provide description, hazard category, time, location, and optional evidence image.
   - Receive a submission confirmation and reference ID.
   - View the status of a report when appropriate.
2. **Analyst / reviewer**
   - View reports, filters, maps, social signals, and potential incident clusters.
   - Inspect evidence and AI output.
   - Mark a report pending, under review, verified, rejected, or needing more information.
   - Merge or associate duplicate reports when supported.
3. **Administrator**
   - Access reviewer functions.
   - Manage users/roles, import data, view system status, and inspect audit history.
4. **Hackathon evaluator**
   - Understand the problem and value quickly.
   - See the full workflow demonstrated with seeded data.
   - Distinguish real integrations from demo data.

Use role-based access control on protected API endpoints. If a full public account system is too costly for the first milestone, ship a working demo login/role selector only in development mode and clearly document it; do not present a hardcoded demo bypass as production security.

## B3. Core end-to-end scenario

The completed demo must support this scenario without manual database edits:

1. A reporter opens **Report a Hazard**.
2. They select a category, enter a description, select or provide a location, optionally attach a photo, accept the submission notice, and submit.
3. The frontend validates fields and sends the report to the backend.
4. The backend validates and stores the report with a unique ID, source, timestamp, location, and `pending_review` status.
5. The backend requests AI analysis from the Python service (or uses an explicit fallback mode if the service is unavailable).
6. The report is classified, with model/version, confidence, and analysis status stored separately from reviewer verification.
7. The dashboard refreshes and displays the new report, its marker if it has coordinates, and updated metrics.
8. The social analytics view shows imported demo posts and their classifications.
9. The incident correlation logic may suggest that a report and one or more social posts refer to the same event. It must show a *possible association*, not a proven fact.
10. A reviewer opens the report, inspects details/evidence and AI reasoning, and changes its review status.
11. The status update persists and appears consistently on the dashboard, map, report list, and detail panel.
12. The app clearly distinguishes `AI classified`, `pending review`, and `human verified`.

---

# PART C — RECOMMENDED TECH STACK

Use the following as the default stack. If the repository already has a sound alternative, retain it and explain the mapping.

## Frontend
- **React + TypeScript + Vite**
- **Tailwind CSS** for styling
- **shadcn/ui** (or an existing equivalent) for accessible UI primitives
- **React Router** for routes
- **TanStack Query** for server state, caching, invalidation, loading/error states
- **React Hook Form + Zod** for form handling and client-side schemas
- **Leaflet + React Leaflet** for map
- **Recharts** for data visualisations
- **Lucide React** for icons
- **date-fns** for readable timestamps
- **Vitest + React Testing Library** for frontend tests

## Main backend
- **Node.js + Express + TypeScript**
- **MongoDB Atlas + Mongoose** for persistent records
- **Zod** (or equivalent) for request validation
- **Helmet, CORS allowlist, rate limiting, and structured logging**
- **Jest/Vitest + Supertest** for API tests

## AI / NLP service
- **Python + FastAPI + Pydantic**
- Start with **scikit-learn TF-IDF + Logistic Regression** trained on a labelled dataset, or a transparent rules-based baseline while preparing labels.
- Optionally compare with a suitable pretrained Hugging Face text-classification model after the baseline works.
- Use `pytest` for tests.
- Make model loading and inference failure explicit. Never fabricate a model confidence when the model did not return one.

## Storage and deployment
- **MongoDB Atlas** for database.
- **Cloudinary** or a comparable object storage provider for evidence images. If credentials are not configured, support local development upload storage safely and document that it is not production persistence.
- **Vercel** for frontend.
- **Render** (or another compatible host) for Express and FastAPI services.
- Keep the frontend, main backend, and AI service deployable separately.
- Use **OpenStreetMap tiles through Leaflet** for the map, following tile usage policies. Do not treat map tiles as a hazard data feed.

## Why this stack
It supports a complete browser-based prototype, a separate NLP service, a persistent database, geospatial visualisation, and straightforward deployment. It is ambitious enough for a hackathon but can be delivered incrementally.

---

# PART D — SYSTEM ARCHITECTURE

## D1. Logical architecture

```text
Reporter / Analyst / Admin
          |
          v
React + TypeScript + Tailwind UI
  |         |             |
  |         |             +--> Leaflet Map / Recharts
  |         |
  |         +--> TanStack Query / API client
  |
  v
Express + TypeScript API
  |           |             |
  |           |             +--> File/Image Storage Adapter
  |           |
  |           +--> Python FastAPI AI Service
  |
  +--> MongoDB Atlas
  |
  +--> Import Pipeline (CSV / authorised connector)
  |
  +--> Incident Correlation / Audit Log
```

## D2. Service responsibilities

### Frontend
- Render pages and reusable components.
- Validate user inputs for usability.
- Call the backend through a central typed API client.
- Display loading, empty, success, and error states.
- Never connect directly to MongoDB.
- Never hold private API keys.
- Never determine official hazard status from AI output alone.

### Express API
- Authentication and authorisation.
- Request validation, sanitisation, rate limits, and CORS.
- Create/read/update reports.
- Persist AI analysis results and service errors.
- Import CSV data safely.
- Calculate dashboard summaries from stored data.
- Create and update incident groupings.
- Store audit events for sensitive review actions.
- Provide a health endpoint.

### Python AI service
- Validate input.
- Classify hazard relevance and category.
- Return class probabilities/confidence only if supported by the model.
- Include model name/version and analysis timestamp.
- Return clear error responses on failure.
- Do not access the database directly in the first version; the Express API owns persistence.
- Provide `/health` and `/analyze` endpoints.

### MongoDB
- Store reports, social posts, incidents, users, and audit logs.
- Index timestamps, status, hazard type, and geospatial coordinates where practical.
- Keep report source and verification status distinct.
- Keep raw input and analysis metadata separated.

## D3. Data flow for report submission

1. UI validates required fields.
2. UI sends `POST /api/reports`.
3. Express validates request body and uploaded file metadata.
4. Express stores report as `pending_review`, `analysisStatus: pending`.
5. Express calls AI service with the report text.
6. On success, persist analysis result. On failure, persist `analysisStatus: failed` and keep the report accessible for manual review.
7. Return report ID and status.
8. Frontend invalidates relevant TanStack Query keys.
9. KPI cards, recent reports, and map update from the API.
10. Reviewer action updates status via a protected endpoint and creates an audit event.

Use timeouts and avoid blocking the report from being saved solely because the AI service is down. For a hackathon implementation, synchronous analysis with a short timeout is acceptable if the failure path works; a background queue can be a later improvement.

---

# PART E — ROUTES AND NAVIGATION

Create these routes. Every route must work, be responsive, and have a useful empty/loading/error state.

| Route | Page | Access |
|---|---|---|
| `/` | Home Dashboard | Public summary or authenticated users, based on project choice |
| `/report` | Report a Hazard | Public reporter |
| `/reports` | Reports list | Analyst/admin; optionally public with limited details |
| `/reports/:id` | Report detail | Role-appropriate |
| `/map` | Incident Map | Analyst/admin |
| `/social` | Social Media Analytics | Analyst/admin |
| `/incidents` | Incident list | Analyst/admin |
| `/incidents/:id` | Incident detail | Analyst/admin |
| `/review` | Admin Review Queue | Reviewer/admin |
| `/settings` | Settings/system status | Admin |
| `/login` | Login | Public |
| `*` | Not-found page | Everyone |

If a route is not yet implemented, provide a clearly labelled functional placeholder with navigation back to implemented pages. Do not leave dead links.

---

# PART F — DETAILED FEATURE SPECIFICATION

## F1. Application shell and visual design

### Branding
- App name: **CoastWatch**
- Subtitle: `Crowdsourced Ocean Hazard Reporting & Social Analytics`
- Use an ocean/coastal visual identity without overusing waves or decorative imagery.
- Include a small `Prototype` label and `Demo Data` label when using seed data.

### Sidebar
- Home Dashboard
- Incident Map
- Report a Hazard
- Social Media Analytics
- Reports
- Admin Review
- Settings
- Logo and app name at top
- Active route state
- Collapse into a mobile drawer
- Keyboard-accessible navigation and visible focus states

### Top bar
- Current page title and contextual subtitle
- Search reports/locations/incident IDs
- Notifications with an unread count only if there is actual demo notification data
- User avatar/name/role menu
- Last updated timestamp
- Persistent demo-mode indicator

### Visual quality rules
- Professional operations dashboard, not a marketing landing page.
- Ocean navy/blue primary, teal secondary, neutral surfaces.
- Red/amber/green reserved for severity/status meaning.
- Consistent spacing scale, card radius, border, icon size, typography, and chart styling.
- Use responsive grid layouts.
- Avoid emoji as primary UI icons.
- Use skeletons or loading indicators, not layout-breaking spinners.
- Include accessible labels and text alternatives; never rely on colour alone to communicate severity.
- Keep animations subtle and respect reduced-motion settings.
- Prevent horizontal overflow at common mobile widths.

## F2. Home Dashboard

### Header
- Title: `Home Dashboard`
- Subtitle: `Coastal hazard monitoring and community reports`
- Search field
- Last-updated timestamp
- Demo data indicator

### Four KPI cards
1. **Total Reports** — count of all visible reports; example seed value may be around 248 but the actual number must derive from data.
2. **Active Incidents** — count of incidents not closed/rejected, using a documented rule.
3. **Awaiting Review** — count of reports with `pending_review` or the agreed equivalent.
4. **High-Priority Reports** — count meeting the documented prioritisation criteria.

Each card must:
- Have an icon, metric, descriptive caption, and optional trend if calculated from date-bounded data.
- Be clickable and navigate/filter to the relevant data.
- Derive from the API summary, not a hardcoded literal.
- Handle zero/loading/error values correctly.
- Never show fabricated percentage changes.

### Main monitoring area
Desktop: two columns. Mobile: stack vertically.

**Incident map card**
- Leaflet + OpenStreetMap.
- Marker per report/incident with coordinates.
- Marker/popup details: title, category, location, reported time, severity, source, verification/review status, `View details`.
- Filters: hazard type and status.
- Legend, map attribution, fit-bounds behaviour, zoom controls.
- Cluster nearby markers if useful and supported.
- Reports without coordinates remain in lists but are not placed on the map.
- Demo coordinates must be labelled illustrative.
- Map errors must not crash the entire dashboard.

**Recent reports card**
- Latest five reports from the shared dataset/API.
- Show ID, short title/description, location, time, source, severity, and status.
- `View all reports` navigates to `/reports`.
- Search and filters are consistent with the rest of the app.
- Clicking a row opens `/reports/:id` or a detail drawer.
- Add empty state when no reports match.

### Analytics cards
**Chart A — Hazard Reports Over Time**
- Line/area chart for last seven days.
- Derive daily counts from timestamps.
- Axis labels, tooltips, legend when needed.
- Include zero-count days.
- Clearly label the timezone used.

**Chart B — Reports by Hazard Type**
- Bar or donut chart for coastal flooding, high waves, oil spills, coastal erosion, and other.
- Use counts from current data/filter.
- Readable category names and tooltip.
- Accessible text summary or table alternative.

### Priority Review Queue
- Up to four highest-priority reports that still need review.
- Show category, location, report age, source, status, and reason for prioritisation.
- Example reasons: high reported severity, multiple nearby reports, recent report awaiting review.
- `Review report` opens detail/review workflow.
- Explain that priority is a triage aid, not an official danger rating.
- Do not prioritise only by negative sentiment.

### Social Media Signals card
- Number of relevant sample posts in a defined time window.
- Top detected hazard keywords.
- Recent sample excerpts with source, timestamp, category, relevance, and analysis status.
- Link to `/social`.
- Use `Demo Dataset` source labels unless a real authorised integration is configured.
- Do not invent claims about current real-world events.

### Safety footer
Display this notice:
> Prototype dashboard. Reports and social media signals may be incomplete, inaccurate, duplicated, or unverified. AI classifications are advisory only and are not official warnings. For emergencies, follow verified guidance from the relevant local authorities.

## F3. Report a Hazard form

Fields:
- Hazard category (required): coastal flooding, high waves, oil spill, coastal erosion, other.
- Short title (required; sensible maximum length).
- Description (required; minimum useful length and maximum limit).
- Location: choose map point, use browser geolocation with permission, or enter latitude/longitude. Manual place name may also be included.
- Event time (optional; validate against unreasonable future dates).
- Evidence photo (optional): validate file type and size; show preview; allow removal.
- Contact information (optional, only if needed; explain privacy handling).
- Reporter acknowledgement: user understands that the submission is unverified.
- Submit button with disabled/loading state.
- Success view with report ID and next steps.
- Error state that preserves user input when safe.

Requirements:
- Server-side validation mirrors critical client validation.
- Do not require geolocation permission; offer manual selection.
- Do not expose personal contact data in public views.
- Prevent oversized or unsupported uploads.
- Store file metadata and a secure URL, not a huge base64 image in MongoDB.
- Rate-limit submissions and protect against basic spam.
- New report appears in report list/dashboard after success.

## F4. Reports list and detail

List filters:
- Hazard type
- Status
- Severity
- Source
- Date range
- Location/text search
- Sort by newest, oldest, severity, or priority
- Pagination or sensible load-more behaviour
- Clear all filters

Report detail must show:
- Report ID, title, full description
- Location and map
- Submitted time and event time if different
- Source and evidence image
- AI classification, confidence if available, model version, analysis timestamp, and analysis status
- Reviewer status and reviewer notes where authorised
- Linked/possibly related reports and social posts, if available
- Audit history for reviewers/admins
- Actions permitted to current role

Separate AI prediction from human verification visually and in data. A confidence score is not proof.

## F5. Incident Map

- Full map page with filter panel and results list.
- Filter by hazard, status, severity, source, and time window.
- Clicking marker highlights the corresponding list entry.
- Clicking list entry opens marker popup or detail.
- Handle missing coordinates.
- Use clustering if it improves legibility.
- Display a legend and map attribution.
- Keep map state and filters synchronised.
- Include a useful no-results state.
- Do not use illustrative markers to imply current hazards.

## F6. Social Media Analytics

### Data ingestion
MVP: CSV import and seeded demo dataset.
CSV should support columns such as:
- `post_id`
- `platform`
- `text`
- `created_at`
- `author_id` (optional and should be anonymised where possible)
- `latitude` and `longitude` (optional)
- `source_url` (optional; validate and display safely)

Import behaviour:
- Validate required columns and row types.
- Show a preview before import.
- Report valid, invalid, duplicate, and skipped row counts.
- Avoid importing duplicate IDs twice.
- Provide a downloadable CSV template.
- Never execute CSV formulas or treat uploaded content as trusted HTML.
- Enforce file size and row-count limits.
- Log import summary without leaking secrets.

### Analytics
- Total posts analysed for selected period.
- Relevant vs irrelevant posts.
- Distribution by predicted hazard category.
- Trend over time.
- Top keywords/phrases.
- Sentiment as a secondary, non-authoritative signal.
- Recent posts table with text, source, timestamp, relevance, hazard type, confidence, location (if available), and analysis state.
- Search, date, category, relevance, and source filters.
- Explain that public social content may be noisy, sarcastic, duplicated, outdated, or misleading.

### Future authorised connector
Only implement if official API access and credentials are available. Use a provider adapter, server-side credentials, rate-limit handling, retries, and a clear source label. Do not scrape or bypass platform restrictions.

## F7. AI-assisted classification

### Required baseline capabilities
- Determine whether text is potentially relevant to ocean/coastal hazards.
- Predict one of the supported categories or `other/unknown`.
- Return confidence/probability only when calibrated or genuinely produced by the model.
- Track model name/version.
- Store analysis timestamp and status.
- Provide a safe fallback when the service is unavailable.
- Avoid unsupported claims about physical conditions or future events.

### Suggested implementation stages
1. Build labelled examples for each hazard class plus unrelated/ambiguous examples.
2. Split train/test data without leakage.
3. Implement TF-IDF + Logistic Regression baseline.
4. Evaluate per-class precision, recall, F1, confusion matrix, and false-negative/false-positive examples.
5. Add uncertainty handling: low-confidence cases become `needs_review`/`unknown`.
6. Optionally compare a pretrained transformer model.
7. Record model version and metrics in documentation.
8. Add unit tests for irrelevant text, ambiguous posts, empty text, non-English or noisy content if supported.
9. Never claim a trained model is accurate without evaluation.
10. Keep human review as the authority for verification.

### Suggested FastAPI contracts
`GET /health`
Returns service health and model-loaded state.

`POST /analyze`
Request:
```json
{
  "text": "Unusually high waves are reaching the road near the shore",
  "source": "citizen_report"
}
```

Response shape (example only; values must come from actual implementation):
```json
{
  "relevant": true,
  "hazard_type": "high_waves",
  "confidence": 0.82,
  "model_name": "tfidf-logistic-regression",
  "model_version": "v1",
  "analysis_status": "completed",
  "needs_human_review": true
}
```

If analysis fails, return a useful error and let the main backend preserve the report. Do not invent an AI result.

## F8. Incident correlation / deduplication

MVP should support **suggested** associations, not unreviewed claims that reports describe the same event.

Candidate features:
- Text similarity
- Same or nearby coordinates
- Time proximity
- Same hazard category
- Shared place names or keywords

Suggested flow:
1. Generate candidates based on category, location radius, and time window.
2. Compute text similarity for candidate pairs.
3. Apply documented thresholds.
4. Store `possibleRelatedReportIds` or proposed incident links.
5. Let a reviewer confirm/ignore a suggested link.
6. Preserve original records and audit changes.

Do not automatically merge and destroy reports. Do not treat repeated reposts of one original message as independent corroboration. Show the evidence used for the suggestion.

## F9. Risk prioritisation

Implement an explainable triage score, not a prediction of catastrophe. A documented weighted score can combine:
- User-reported severity
- Recency
- Number of plausibly independent nearby reports
- AI classification confidence, as one limited signal
- Evidence completeness

Requirements:
- Define score range and weights in code/docs.
- Do not let sentiment alone increase risk.
- Avoid double-counting duplicates or reposts.
- Display reasons, not only a score.
- Keep official status separate.
- Make thresholds configurable.
- Unit test boundary cases.
- Label output `Review priority` rather than `Disaster probability`.

## F10. Admin review workflow

Review queue columns:
- Report ID/title
- Hazard type
- Location
- Report age
- Reported severity
- AI category/confidence
- Source
- Status
- Priority reasons
- Actions

Actions:
- Open detail
- Assign to reviewer (optional)
- Move to under review
- Mark verified
- Reject with reason
- Request more information (if supported)
- Link to an incident / confirm possible duplicate
- Add reviewer note

Requirements:
- Protected endpoints.
- Validate transitions.
- Require reason for rejection and verification where appropriate.
- Store reviewer ID, timestamp, previous state, new state, and reason in audit history.
- No client-only status change; persist through the backend.
- Use optimistic UI only with rollback/error handling.

## F11. Notifications and alerts

MVP:
- In-app notification list for new high-priority demo reports and status changes.
- Unread count must come from actual notification objects.
- Mark read action works.
- No real SMS/email unless a provider is configured.

Later:
- Email/SMS through a legitimate provider.
- Alerts triggered only by configured, reviewed criteria.
- Clear distinction between internal review notifications and official public emergency alerts.

## F12. Settings and system status

Include:
- API health state
- AI service health/model state
- Database connection state (server-side only; never show connection string)
- Storage configuration status
- Data mode: Demo / Connected
- Model version
- Import history
- Basic configuration for review thresholds where safe
- Helpful guidance when a service is not configured

Never expose secrets or internal stack traces to normal users.

---

# PART G — DATA MODEL

Use a consistent schema. Adjust names to repository conventions but preserve semantics.

## G1. Report

```ts
type HazardType =
  | "coastal_flooding"
  | "high_waves"
  | "oil_spill"
  | "coastal_erosion"
  | "other";

type ReviewStatus =
  | "pending_review"
  | "under_review"
  | "verified"
  | "rejected"
  | "needs_information";

type Severity = "low" | "medium" | "high" | "critical";

interface Report {
  _id: string;
  publicId: string;                 // e.g. RPT-000123
  title: string;
  description: string;
  hazardType: HazardType;
  location?: {
    type: "Point";
    coordinates: [number, number];  // GeoJSON order: [longitude, latitude]
    placeName?: string;
  };
  eventTime?: string;
  createdAt: string;
  updatedAt: string;
  source: "citizen" | "social_import" | "sensor_demo" | "official_feed";
  sourceReference?: string;
  evidence?: Array<{
    url: string;
    mimeType: string;
    fileName?: string;
  }>;
  reportedSeverity: Severity;
  status: ReviewStatus;
  aiAnalysis?: {
    relevant: boolean;
    hazardType: HazardType | "unknown";
    confidence?: number;
    modelName?: string;
    modelVersion?: string;
    analyzedAt?: string;
    analysisStatus: "pending" | "completed" | "failed" | "unavailable";
    needsHumanReview: boolean;
  };
  review?: {
    reviewerId?: string;
    reviewedAt?: string;
    notes?: string;
    rejectionReason?: string;
  };
  possibleRelatedReportIds: string[];
  incidentId?: string;
}
```

Important:
- `reportedSeverity` is what the user reports.
- AI prediction is separate.
- `status: verified` means a human reviewer verified it according to project procedure, not that the system can guarantee physical truth.
- GeoJSON coordinate order is `[longitude, latitude]`, not `[latitude, longitude]`.
- Keep private reporter data out of public responses.

## G2. Social post

```ts
interface SocialPost {
  _id: string;
  externalId?: string;
  platform: string;
  sourceMode: "demo_dataset" | "csv_import" | "authorised_api";
  text: string;
  createdAt: string;
  importedAt: string;
  location?: {
    type: "Point";
    coordinates: [number, number];
    placeName?: string;
  };
  sourceUrl?: string;
  relevant?: boolean;
  predictedHazardType?: HazardType | "unknown";
  confidence?: number;
  sentiment?: "positive" | "neutral" | "negative" | "mixed" | "unknown";
  modelName?: string;
  modelVersion?: string;
  analysisStatus: "pending" | "completed" | "failed";
  possibleIncidentIds: string[];
}
```

Avoid collecting or storing unnecessary personal information. An author handle is not required for the MVP.

## G3. Incident

```ts
interface Incident {
  _id: string;
  publicId: string;                 // e.g. INC-000042
  title: string;
  hazardType: HazardType;
  reportIds: string[];
  socialPostIds: string[];
  location?: {
    type: "Point";
    coordinates: [number, number];
    placeName?: string;
  };
  firstObservedAt?: string;
  lastObservedAt?: string;
  reviewStatus: "proposed" | "under_review" | "verified" | "closed" | "rejected";
  priorityScore?: number;
  priorityReasons: string[];
  createdAt: string;
  updatedAt: string;
}
```

## G4. Audit event

Record important review/import/admin actions:
- Actor ID/role
- Action
- Entity type and ID
- Previous/new status where relevant
- Reason/note where appropriate
- Timestamp
- Minimal metadata required for traceability

Do not log passwords, tokens, uploaded file contents, or unnecessary personal data.

## G5. Indexes and data integrity
- Unique index on `publicId`.
- Unique compound index for external social post ID/platform when external ID exists.
- Index on `createdAt`, `status`, `hazardType`, and `source`.
- Geo index for valid GeoJSON locations.
- Add pagination limits and maximum date range.
- Avoid unbounded list endpoints.

---

# PART H — API CONTRACT

Use a consistent response/error envelope, for example:
```json
{
  "data": {},
  "meta": {}
}
```

Example error:
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Please correct the highlighted fields.",
    "details": []
  }
}
```

Do not expose stack traces to clients.

## H1. Health
- `GET /api/health` — backend health and dependency status, with no secrets.

## H2. Reports
- `POST /api/reports` — create report and initiate analysis.
- `GET /api/reports` — paginated list with validated filters.
- `GET /api/reports/:id` — report detail.
- `PATCH /api/reports/:id/status` — protected reviewer status transition.
- `PATCH /api/reports/:id` — permitted updates only; role checked.
- `GET /api/reports/:id/audit` — protected audit history if implemented.

## H3. Dashboard and analytics
- `GET /api/dashboard/summary`
- `GET /api/analytics/reports-over-time?days=7`
- `GET /api/analytics/hazards`
- `GET /api/analytics/social`
- `GET /api/analytics/priority-queue`

All aggregate counts must be derived from database records and documented filters.

## H4. Incidents
- `GET /api/incidents`
- `GET /api/incidents/:id`
- `POST /api/incidents/:id/link-report`
- `POST /api/incidents/:id/link-social-post`
- `PATCH /api/incidents/:id/status`

Protected mutations must validate roles and write audit events.

## H5. Social import
- `POST /api/social/import/preview`
- `POST /api/social/import/commit`
- `GET /api/social/posts`
- `GET /api/social/import/template`

If the implementation uses a simpler single-step import, still provide preview/validation in the UI and document the design.

## H6. AI service
- `GET /health`
- `POST /analyze`

Use request timeouts, error handling, and a fallback state. The AI service must not be publicly exposed without appropriate rate limits or service-to-service protection if the deployment allows it.

## H7. API conventions
- ISO 8601 timestamps in UTC.
- Consistent pagination (`page`, `limit`, `total`, `hasMore` or equivalent).
- Validate enum filters.
- Limit `limit` to a safe maximum.
- Reject invalid coordinates and unreasonable future timestamps.
- Protect state-changing endpoints.
- Use consistent status codes.
- Document routes in README or OpenAPI/Swagger.
- Add request IDs or structured logs for debugging.

---

# PART I — FRONTEND PROJECT STRUCTURE

Suggested structure (adapt to the repository; do not force unnecessary files):

```text
coastwatch/
  README.md
  .gitignore
  .env.example
  docker-compose.yml                 # optional local convenience
  apps/
    web/
      package.json
      vite.config.ts
      src/
        app/
          App.tsx
          router.tsx
          providers.tsx
        components/
          layout/
            AppSidebar.tsx
            TopBar.tsx
            MobileNav.tsx
            PageHeader.tsx
          dashboard/
            KpiCard.tsx
            IncidentMapCard.tsx
            RecentReports.tsx
            HazardTrendChart.tsx
            HazardTypeChart.tsx
            PriorityReviewQueue.tsx
            SocialMediaSignals.tsx
          reports/
            ReportForm.tsx
            ReportFilters.tsx
            ReportTable.tsx
            ReportDetailPanel.tsx
            StatusBadge.tsx
            SeverityBadge.tsx
          social/
            CsvImportWizard.tsx
            SocialPostsTable.tsx
            SocialAnalyticsCharts.tsx
          map/
            IncidentMap.tsx
            MapLegend.tsx
            MapFilters.tsx
          common/
            ErrorState.tsx
            EmptyState.tsx
            LoadingSkeleton.tsx
            ConfirmDialog.tsx
            DemoDataBadge.tsx
        pages/
          HomeDashboardPage.tsx
          ReportHazardPage.tsx
          ReportsPage.tsx
          ReportDetailPage.tsx
          IncidentMapPage.tsx
          SocialAnalyticsPage.tsx
          IncidentsPage.tsx
          IncidentDetailPage.tsx
          ReviewQueuePage.tsx
          SettingsPage.tsx
          LoginPage.tsx
          NotFoundPage.tsx
        features/
          auth/
          reports/
          incidents/
          social/
          analytics/
          notifications/
        lib/
          apiClient.ts
          queryClient.ts
          env.ts
          date.ts
          validation.ts
          utils.ts
        types/
          api.ts
          report.ts
          incident.ts
          social.ts
        styles/
          index.css
        test/
          setup.ts
      public/
  services/
    api/
      package.json
      src/
        app.ts
        server.ts
        config/
        middleware/
        routes/
        controllers/
        services/
        models/
        schemas/
        repositories/
        utils/
        jobs/
        tests/
    ai/
      requirements.txt
      pyproject.toml
      app/
        main.py
        schemas.py
        classifier.py
        preprocessing.py
        model_registry.py
        evaluation.py
      data/
        README.md
        sample_posts.csv
        labelled_examples.csv
      tests/
  docs/
    architecture.md
    api-contract.md
    data-dictionary.md
    ai-evaluation.md
    demo-script.md
    threat-model.md
```

Do not create empty folders or unnecessary abstraction for appearance. Build the simplest structure that remains maintainable.

---

# PART J — REPOSITORY AND ENVIRONMENT SETUP

## J1. Environment files

Create `.env.example` with variable names and safe placeholders only. Example:

```dotenv
# Frontend
VITE_API_BASE_URL=http://localhost:4000/api
VITE_APP_MODE=demo

# Express API
NODE_ENV=development
PORT=4000
MONGODB_URI=
FRONTEND_ORIGIN=http://localhost:5173
AI_SERVICE_URL=http://localhost:8000
AI_SERVICE_TOKEN=
SESSION_SECRET=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
MAX_UPLOAD_MB=5

# AI service
AI_PORT=8000
MODEL_PATH=
MODEL_VERSION=baseline-v1
```

Adjust environment variable names to actual code. Validate required environment values at startup and give clear errors. Do not put private variables in `VITE_*` variables. Never commit `.env`.

## J2. Local development commands
Document exact commands for the chosen monorepo/package manager. Target workflow should be simple, for example:
- Install web dependencies.
- Install API dependencies.
- Create and activate a Python virtual environment.
- Install AI requirements.
- Configure local environment variables.
- Start database (Atlas or local MongoDB).
- Run API, AI service, and frontend in separate terminals or with a root dev command.
- Seed demo data.
- Run tests and production builds.

Do not invent commands that do not exist in package scripts. Ensure README commands are tested.

## J3. Seed/demo data
- Provide a deterministic seed command.
- Use at least 10 reports and 8 social posts, preferably 15–25 reports and 20–40 posts for a richer demo.
- Include varied categories, statuses, severity, dates, sources, and a few missing coordinates.
- Include several plausible related reports to demonstrate correlation.
- Include irrelevant/noisy social posts to demonstrate filtering.
- Clearly label the dataset as synthetic/demo data.
- Ensure dashboard counts are computed from this data.
- Provide a reset/reseed command that is safe for local demo environments only.
- Never insert fabricated reports as real incidents.

---

# PART K — SECURITY, PRIVACY, RELIABILITY

## K1. Security baseline
- Server-side validation and sanitisation.
- Role checks for protected endpoints.
- Password hashing if local password authentication is implemented.
- Secure, HTTP-only, SameSite cookies or a properly implemented token strategy; do not invent custom cryptography.
- Rate limiting for login, report submission, and import endpoints.
- Helmet/security headers.
- Strict CORS allowlist.
- File upload MIME/size checks; do not trust file extensions alone.
- Safe rendering of user-provided text; never inject raw HTML.
- Parameterised/ODM-based database operations; avoid unsafe dynamic query construction.
- Secrets only in environment variables.
- No sensitive data in logs.
- Audit reviewer/admin actions.
- Clear demo-authentication limitations.

## K2. Privacy
- Collect minimum necessary reporter data.
- Do not publish email, phone number, exact private identity, or sensitive metadata.
- Explain how location and uploaded images are used.
- Do not store social account data unless necessary and permitted.
- Anonymise imported dataset identifiers where practical.
- Add a basic privacy notice appropriate for a prototype.

## K3. Reliability
- AI service timeout and fallback.
- Database unavailable state.
- Upload failure handling.
- Retry only safe operations; avoid duplicate submissions.
- Loading/empty/error states.
- Central error handling.
- Health checks.
- Structured server logs.
- Graceful shutdown where appropriate.
- Never lose an accepted report because AI classification failed.

## K4. Emergency safety
- AI classifications are not official hazard confirmation.
- No automatic public evacuation alerts.
- Human review and official-source verification are separate states.
- Do not imply that absence of reports means the area is safe.
- Include timestamps and source attribution.
- Clearly distinguish a reporter's claim, an AI prediction, a reviewer decision, and an official advisory.

---

# PART L — TEST STRATEGY AND QUALITY GATES

Do not consider a phase done until its relevant checks pass.

## L1. Unit tests
Frontend:
- Form validation
- Status/severity rendering
- Filter logic
- Date formatting
- KPI/analytics transformation functions
- Priority score reasons

Backend:
- Schema validation
- Report creation
- Status transitions and role permissions
- Summary aggregation
- CSV parsing, row validation, and duplicate handling
- Incident-link validation
- Upload validation

AI:
- Empty/invalid text
- Hazard examples by class
- Irrelevant examples
- Ambiguous examples
- Low-confidence handling
- Model unavailable path
- Output schema validity

## L2. Integration tests
- Create report -> database record -> analysis result/fallback -> response.
- Report creation works when AI service is down.
- Dashboard summary matches seeded records.
- Status update persists and creates audit event.
- CSV import preview accurately counts invalid/duplicate rows.
- Incident link operation preserves original reports.
- Access control prevents unauthorised status changes.
- API returns expected errors and status codes.

## L3. End-to-end acceptance tests
At minimum, test these scenarios in a browser:
1. Load dashboard and see consistent KPIs, map, recent reports, charts, queue, and social signals.
2. Submit a valid report and see its confirmation ID.
3. Find the report on the reports list.
4. See its map marker when coordinates are provided.
5. Search by text/location and filter by hazard/status.
6. Open the report detail view.
7. Change report status as an authorised reviewer and see the change persist across pages.
8. Import a valid CSV and see analytics update.
9. Upload invalid CSV and see a useful error without corrupting data.
10. Simulate AI service failure and verify that report submission still succeeds with analysis marked unavailable/failed.
11. Open the app at mobile width and verify navigation, forms, cards, tables, and map remain usable.
12. Verify no sample data is labelled live or official.

Use Playwright if feasible. If not, perform and document a structured manual smoke test.

## L4. Quality gates
Before declaring the project ready:
- [ ] App starts from documented commands.
- [ ] No TypeScript errors.
- [ ] Linter passes or remaining warnings are explained.
- [ ] Unit tests pass.
- [ ] API integration tests pass.
- [ ] Production build passes.
- [ ] No obvious browser console errors.
- [ ] No dead primary buttons.
- [ ] No secrets in repository.
- [ ] No inconsistent hardcoded KPIs.
- [ ] Mobile layout tested.
- [ ] Empty/error/loading states checked.
- [ ] Map attribution visible.
- [ ] AI limitations and demo labels visible.
- [ ] README setup and demo instructions are accurate.
- [ ] Deployment configuration has been tested if deployed.

---

# PART M — IMPLEMENTATION PLAN: FOLLOW IN ORDER

The AI IDE must implement these phases sequentially. Do not skip ahead to decorative features before the foundation works.

## Phase 0 — Repository audit and plan
Tasks:
1. Inspect files and identify framework, scripts, package manager, dependencies, and existing features.
2. Identify what already works and what is missing.
3. Propose a minimal-change plan.
4. Confirm the chosen stack and route structure.
5. Create or update `docs/implementation-plan.md`.
6. List risks, external credentials, and any assumptions.

Exit criteria:
- Repository understood.
- Plan matches current project.
- No code has been needlessly overwritten.

## Phase 1 — Foundation and design system
Tasks:
1. Establish routing.
2. Build app shell, sidebar, top bar, mobile nav, page container.
3. Add design tokens/consistent theme.
4. Add reusable status/severity badges, cards, buttons, skeletons, empty states, and error states.
5. Add not-found route.
6. Ensure desktop/mobile responsiveness.

Exit criteria:
- All routes render.
- Navigation works.
- UI shell is consistent and responsive.
- No dead links.

## Phase 2 — Data contracts and demo mode
Tasks:
1. Define typed report, social post, incident, and API contracts.
2. Create deterministic demo data.
3. Add a service layer that separates UI from data source.
4. Ensure all dashboard widgets derive from shared data.
5. Add `Demo Data` labelling.
6. Add unit tests for aggregation functions.

Exit criteria:
- Consistent sample data powers all widgets.
- Changing data updates related counts/charts/lists.
- No hardcoded contradictory metrics.

## Phase 3 — Backend and persistence
Tasks:
1. Build Express app/server and configuration validation.
2. Connect MongoDB.
3. Add models, indexes, validation schemas, and error handling.
4. Implement health and report endpoints.
5. Add deterministic seed command.
6. Add API tests.
7. Connect frontend API client and query hooks.

Exit criteria:
- Create/read reports persist.
- API filters and pagination work.
- Frontend handles loading/error/empty states.
- Report submission works end to end.

## Phase 4 — Report submission and evidence
Tasks:
1. Build report form with all required fields.
2. Add location selection/manual coordinates/geolocation permission flow.
3. Add optional image upload with validation and preview.
4. Add success screen/reference ID.
5. Add upload fallback when external storage is not configured.
6. Add rate limiting and server validation.
7. Verify new report appears in the app.

Exit criteria:
- Valid report is stored.
- Invalid report is rejected clearly.
- Upload errors are handled.
- No private details leak to public UI.

## Phase 5 — AI service
Tasks:
1. Create FastAPI app and Pydantic contracts.
2. Build a baseline classifier and labelled sample data.
3. Evaluate model with a test split and metrics.
4. Add confidence/uncertainty handling.
5. Connect Express to AI with timeout and failure fallback.
6. Persist model/version/timestamp and analysis status.
7. Add unit and integration tests.
8. Document the model's limitations.

Exit criteria:
- Real inference runs on input text.
- Output schema is validated.
- AI outage does not block report creation.
- No fabricated confidence values.
- Results are labelled as advisory.

## Phase 6 — Home dashboard
Tasks:
1. Build four KPI cards from the dashboard summary endpoint.
2. Build recent reports from report data.
3. Build interactive incident map.
4. Build seven-day trend chart.
5. Build hazard type distribution chart.
6. Build priority review queue.
7. Build social media signals card.
8. Connect card actions, filters, and report details.
9. Add safety note and demo badge.
10. Test data consistency.

Exit criteria:
- Every required dashboard section works.
- Every KPI derives from data.
- Filters and click interactions work.
- No dashboard section relies on invented live metrics.

## Phase 7 — Reports, details, map and incident correlation
Tasks:
1. Implement full reports list and filters.
2. Implement report detail.
3. Implement full incident map and synchronised filters.
4. Implement candidate duplicate/correlation suggestions.
5. Implement incident list/detail and link operations.
6. Add tests for location/time/text matching.
7. Preserve source records and require human confirmation for merges/links.

Exit criteria:
- Search/filter/pagination work.
- Detail screens are consistent.
- Correlation is explainable and reviewable.
- No destructive automatic merge.

## Phase 8 — Social analytics and CSV import
Tasks:
1. Provide CSV template download.
2. Build upload and preview flow.
3. Validate columns, rows, duplicates, dates, and size.
4. Import valid rows and report rejected rows.
5. Run AI analysis on imported text.
6. Build analytics charts, trends, keyword summaries, and posts table.
7. Synchronise analytics with selected filters.
8. Label data source clearly.

Exit criteria:
- CSV import works end to end.
- Invalid files fail safely.
- Analytics reflect imported data.
- No unauthorised scraping.

## Phase 9 — Review queue, roles, notifications and audit
Tasks:
1. Add reviewer/admin role checks.
2. Build review detail/actions.
3. Validate allowed status transitions.
4. Store audit events.
5. Build in-app notifications from actual events.
6. Add unread/read interactions.
7. Protect all mutating admin endpoints.
8. Add tests for unauthorised requests.

Exit criteria:
- Review actions persist.
- Audit history is recorded.
- Access controls are tested.
- Notifications are not fake counters.

## Phase 10 — Polish, security, and accessibility
Tasks:
1. Test at mobile, tablet, and desktop widths.
2. Check keyboard navigation and focus.
3. Check labels, contrast, and non-colour status cues.
4. Improve error/empty/loading states.
5. Validate uploads, rate limits, CORS, and secrets.
6. Remove debug UI and console noise.
7. Verify no dead controls.
8. Run all test/build checks.

Exit criteria:
- No major usability or security issues remain.
- UI feels like one cohesive product.
- Critical flows work without manual intervention.

## Phase 11 — Deployment and demo readiness
Tasks:
1. Configure environment variables for each service.
2. Deploy frontend, Express API, AI service, and database.
3. Configure CORS and allowed origins.
4. Add health checks.
5. Seed demo data safely.
6. Test deployed URLs and external service connectivity.
7. Write a demo script and backup offline screenshots/video if desired.
8. Document known limitations and future work.

Exit criteria:
- Public demo URL works if deployment is in scope.
- Core flows work on deployed services.
- Secrets are not exposed.
- Demo script can be completed reliably in 3–5 minutes.

---

# PART N — HACKATHON DEMO SCRIPT

Prepare a repeatable 3–5 minute walkthrough.

1. **Problem (20 seconds):** Coastal hazard information is fragmented and hard to correlate.
2. **Dashboard (30 seconds):** Show reports, review queue, hazard trends, and map; point out demo-data labelling.
3. **Citizen report (45 seconds):** Submit a new coastal flooding/high-wave report with a location and description.
4. **AI analysis (30 seconds):** Show predicted category, confidence if valid, and `needs human review`.
5. **Social analytics (30 seconds):** Show imported posts, relevant/irrelevant classifications, and trend chart.
6. **Correlation (30 seconds):** Show a suggested relationship between nearby/time-related reports and a social post, with evidence.
7. **Reviewer workflow (30 seconds):** Open the report, inspect evidence, change status, and show persistence/audit.
8. **Impact and limitations (20 seconds):** Explain how this helps analysts prioritise reports; clearly state it is decision support, not an official warning system.

Seed one coherent scenario before the demo. Avoid depending on a live external social API or a slow model download during judging.

---

# PART O — MASTER PROMPT FOR THE CODING AI IDE

Copy everything inside the following prompt into your coding AI IDE after adding this Markdown file to the repository or attaching it to the AI chat.

---

## MASTER IMPLEMENTATION PROMPT

You are the lead full-stack engineer, AI engineer, UX designer, QA engineer, security reviewer, and technical writer responsible for building **CoastWatch**, a hackathon-grade integrated platform for crowdsourced ocean hazard reporting and social media analytics.

### Your primary instruction
Treat this entire specification as the source of truth. Implement the complete application in the existing repository, not just a concept, landing page, static mockup, or isolated UI. All visible primary features must work end to end or be clearly labelled as not configured. Do not silently omit features to save time.

### Step 1: Inspect and report
Before changing files:
1. Inspect the complete project structure and important source files.
2. Identify framework, package manager, routes, installed dependencies, environment configuration, test setup, and current functionality.
3. Identify reusable code and avoid overwriting it.
4. Map current state to every feature and phase in this specification.
5. Write a concise implementation plan with dependencies and acceptance checks.
6. State any assumptions or external credentials needed.

Do not ask me to repeat information already in this specification. Ask a question only if a genuine blocking ambiguity cannot be resolved safely; otherwise choose a sensible default and document it.

### Step 2: Work phase by phase
Follow Parts M and L in order. Implement one phase at a time. At the end of each phase:
- Summarise files created/changed.
- Run relevant tests, type checks, lint, and/or build.
- Report the actual command and result.
- Fix failures before proceeding.
- List any known limitation and the next phase.
- Keep the app runnable throughout.

Do not generate a giant patch and assume it works. Do not stop after planning or scaffolding. Continue implementation until all feasible phases and acceptance criteria are completed, unless a real external dependency blocks progress. If blocked, implement a safe fallback and document the remaining integration step.

### Step 3: Enforce architecture
Use the existing stack if sound; otherwise use the recommended React/TypeScript/Vite frontend, Express/TypeScript API, MongoDB, and Python/FastAPI AI service. Maintain clear service boundaries:
- UI never accesses MongoDB directly.
- Private secrets never go in frontend environment variables.
- Express owns persistence and application workflow.
- AI returns structured advisory analysis; Express stores it.
- Social ingestion begins with seeded data and validated CSV import.
- Official API connectors are only added with legitimate access.
- Dashboard aggregates derive from shared backend data.
- Human verification is separate from AI classification.
- Correlation produces reviewable suggestions and never destroys source records.

### Step 4: Implement the entire product
At minimum, implement:
- Responsive app shell, sidebar, top bar, route navigation, and visual design system.
- Home dashboard with four dynamic KPIs, interactive map, recent reports, seven-day trends, hazard distribution, priority review queue, social media signals, demo-data badge, and safety notice.
- Hazard report form with category, description, location selection/manual coordinates/geolocation permission, optional validated image, server-side validation, success reference ID, and error recovery.
- Persistent reports list, filtering, search, sorting/pagination, and report detail page.
- Full incident map with marker popups, legend, attribution, filters, and list/map synchronisation.
- Social analytics with CSV template, preview, validation, duplicate detection, import results, AI analysis, trends, keywords, and posts table.
- Python AI service with a tested baseline text classifier, supported hazard classes, uncertainty handling, model metadata, and evaluation documentation.
- Explainable priority scoring and candidate incident correlation.
- Incident list/detail and reviewable report/post links.
- Protected admin review queue, status transitions, reviewer notes/reasons, and audit history.
- In-app notifications backed by real event data.
- Settings/system status page.
- Loading, empty, error, success, and offline/service-unavailable states.
- Deterministic demo data and seed/reset workflow.
- Automated tests, README, environment example, API docs, architecture docs, threat model, AI evaluation notes, and demo script.

### Step 5: Use best implementation practices
- Use TypeScript and strict typing where the repository supports it.
- Keep components small and responsibility-focused.
- Keep API calls in a central client/service layer.
- Use TanStack Query or existing server-state tools consistently.
- Use Zod/Pydantic or equivalent schemas.
- Use consistent API errors and ISO UTC timestamps.
- Add database indexes and pagination.
- Keep demo data in seed files rather than scattered UI constants.
- Derive metrics from data; never hardcode dashboard totals.
- Include map attribution and respect tile policies.
- Avoid adding unnecessary dependencies.
- Do not over-engineer microservices beyond the specified Express + AI split.
- Do not use a hosted AI API if it would introduce unapproved cost or require unavailable credentials; implement the local baseline.
- Do not rely on an external service for the critical demo path when a deterministic local fallback is practical.

### Step 6: Security and safety
- Validate all inputs server-side.
- Apply role checks to reviewer/admin actions.
- Use safe file upload handling, rate limits, CORS allowlists, security headers, and secret management.
- Do not expose reporter private information.
- Do not scrape platforms or bypass API controls.
- Do not claim AI predictions are verified facts.
- Do not present sample posts or illustrative map points as current events.
- Never issue official emergency warnings automatically.
- Ensure report creation still works if AI is down.
- Include the specified safety disclaimer in the UI.

### Step 7: Visual quality
The product must look like a polished coastal monitoring operations tool. Use a coherent navy/ocean-blue/teal palette, restrained semantic severity colours, consistent typography and spacing, accessible UI components, responsive cards, high-quality chart styling, clear table density, map legends, useful empty states, and mobile navigation. Avoid generic marketing-page layouts, oversized decorative hero sections, excessive gradients, placeholder charts, and unlabelled dummy controls.

### Step 8: Verification
Before claiming completion:
1. Run all available unit tests.
2. Run API integration tests.
3. Run frontend lint and type checks.
4. Run production builds for all services.
5. Run a browser smoke test or Playwright flow where feasible.
6. Exercise the full report submission -> persistence -> AI/fallback -> dashboard -> review -> persisted status path.
7. Exercise CSV import and analytics updates.
8. Test AI-service outage, missing coordinates, invalid uploads, empty filters, and unauthorised review actions.
9. Check responsive layouts and browser console.
10. Search the code for dead buttons, fake links, hardcoded KPI values, leaked secrets, and false live-data claims.

If a check cannot be run in this environment, explicitly state that it was not run. Do not invent test results.

### Final deliverables
When complete, provide:
- Working source code in the repository.
- Clear folder structure.
- README with exact setup/run/test/deploy commands.
- `.env.example` with safe placeholders.
- Seed/demo dataset and reset instructions.
- API documentation.
- Architecture and data dictionary.
- AI model evaluation and limitations.
- Threat model/security notes.
- Demo script.
- List of implemented features and verified acceptance criteria.
- Exact test/build commands and results.
- Deployment status and configuration still required.
- Known limitations and next improvements.

Begin with repository inspection now. Then implement Phase 0 and continue through the phases without stopping at a plan. Maintain quality and honesty at every step.

---

# PART P — SHORT OPERATING PROMPTS FOR EACH ITERATION

Use these follow-up prompts after the master prompt when your IDE works best in smaller tasks.

## Prompt 1 — Start the next phase
“Continue with the next incomplete phase in `docs/implementation-plan.md` and this CoastWatch specification. Inspect current code first, implement the full phase, run the relevant checks, fix failures, and report the exact results. Do not re-create working components or skip acceptance criteria.”

## Prompt 2 — Audit completeness
“Audit the current repository against every checkbox and requirement in the CoastWatch master specification. Produce a table with requirement, implementation location, status (pass/partial/missing), evidence, and corrective action. Verify by inspecting code and running tests; do not mark something complete because a component merely exists.”

## Prompt 3 — Fix broken functionality
“Run the app and tests, inspect console/network/server errors, and trace each failure to its root cause. Fix the underlying issue rather than hiding it with mock responses. Re-run the failed checks and report exact outcomes.”

## Prompt 4 — UI quality review
“Review the whole app as a senior product designer and accessibility engineer. Inspect desktop, tablet, and mobile layouts; hierarchy, spacing, typography, contrast, focus states, loading/empty/error states, charts, tables, map controls, and dead interactions. Implement improvements without removing required features or replacing real data flow with static mocks.”

## Prompt 5 — End-to-end test pass
“Test the complete user journey: submit report, persist it, run AI or fallback, display on dashboard/map, search/filter it, open detail, review it, persist status/audit event, import social CSV, and confirm analytics update. Test AI outage, invalid CSV, missing location, and unauthorised actions. Fix failures and provide evidence of results.”

## Prompt 6 — Hackathon demo readiness
“Prepare CoastWatch for a reliable 3–5 minute hackathon demo. Verify seed data, reset procedure, demo labels, map, charts, report submission, AI output, social import, correlation suggestions, and reviewer workflow. Eliminate reliance on unconfigured external APIs for the core path. Produce a step-by-step demo script and list any remaining risks.”

## Prompt 7 — Deployment readiness
“Review deployment configuration for frontend, Express API, AI service, database, and file storage. Verify environment variable names, CORS, health checks, build/start commands, secrets, database indexes, and demo seeding. Do not claim deployment is successful until the actual deployed endpoints have been checked.”

---

# PART Q — FINAL MASTER CHECKLIST

Use this checklist as the final acceptance gate. A feature is complete only when it works, has appropriate states, and is tested or explicitly documented as unverified.

## Product and UX
- [ ] Product name and purpose are clear.
- [ ] Application shell and navigation work.
- [ ] All routes render.
- [ ] Desktop, tablet, and mobile layouts work.
- [ ] Visual design is consistent and polished.
- [ ] Keyboard navigation, labels, contrast, and focus states are checked.
- [ ] Loading, empty, error, success, and unavailable states exist.
- [ ] No dead buttons or fake links.
- [ ] Demo data is always labelled clearly.

## Home dashboard
- [ ] Total Reports derives from data.
- [ ] Active Incidents derives from data.
- [ ] Awaiting Review derives from data.
- [ ] High-Priority Reports derives from documented criteria.
- [ ] KPI actions work.
- [ ] Incident map shows valid coordinates only.
- [ ] Map markers and popups work.
- [ ] Map attribution and legend are visible.
- [ ] Recent reports are data-driven.
- [ ] Seven-day trend chart is data-driven.
- [ ] Hazard distribution chart is data-driven.
- [ ] Priority review queue is data-driven and explainable.
- [ ] Social Media Signals card uses actual stored/demo posts.
- [ ] Safety disclaimer is visible.

## Reporting and incident workflow
- [ ] Report form validates.
- [ ] Location selection/manual entry works.
- [ ] Geolocation is optional and permission-based.
- [ ] Image upload validation and preview work.
- [ ] Submission persists and returns a reference ID.
- [ ] Report list/search/filter/sort/pagination work.
- [ ] Report detail is complete.
- [ ] Status changes persist.
- [ ] Reviewer actions are protected.
- [ ] Audit history is written.
- [ ] Possible duplicate links are reviewable.
- [ ] Source reports are never destructively merged.
- [ ] Missing coordinates do not break the UI.

## Social media analytics
- [ ] Demo posts exist.
- [ ] CSV template can be downloaded.
- [ ] CSV preview works.
- [ ] Invalid rows are explained.
- [ ] Duplicate IDs are handled.
- [ ] Import summary is accurate.
- [ ] Imported posts are stored.
- [ ] AI classification is integrated or its unavailable state is explicit.
- [ ] Analytics update after import.
- [ ] Filters and search work.
- [ ] Sources are labelled honestly.
- [ ] No unauthorised scraping exists.

## AI and prioritisation
- [ ] Supported classes are documented.
- [ ] Baseline model or transparent fallback works.
- [ ] Model is evaluated on held-out data.
- [ ] Confidence is genuine and not fabricated.
- [ ] Low-confidence cases are handled safely.
- [ ] Model/version/timestamp are recorded.
- [ ] AI failure does not block report creation.
- [ ] Risk prioritisation is explainable.
- [ ] Sentiment is not treated as hazard proof.
- [ ] AI results are separated from human verification.
- [ ] No automatic official emergency warnings are issued.

## Backend, data, and security
- [ ] API validation works.
- [ ] Database persistence works.
- [ ] Unique IDs and useful indexes exist.
- [ ] Pagination limits exist.
- [ ] Health endpoint works.
- [ ] CORS and rate limiting are configured.
- [ ] Protected actions enforce roles.
- [ ] Upload limits and MIME checks work.
- [ ] Secrets are not committed or exposed.
- [ ] Private reporter data is protected.
- [ ] Errors are handled without leaking stack traces.
- [ ] Audit events do not contain secrets.
- [ ] API documentation is present.

## Quality and delivery
- [ ] Seed and reset commands work.
- [ ] Unit tests pass.
- [ ] Integration tests pass.
- [ ] Frontend lint/typecheck passes.
- [ ] Production builds pass.
- [ ] Browser smoke/E2E tests pass or limitations are documented.
- [ ] AI-outage path is tested.
- [ ] Invalid CSV/upload paths are tested.
- [ ] README commands are accurate.
- [ ] Architecture, data dictionary, AI evaluation, and threat model docs exist.
- [ ] Deployment variables and health checks are documented.
- [ ] Hackathon demo script is rehearsed.
- [ ] Known limitations are stated honestly.

## Definition of “done”
The project is **not done** just because the UI looks good. It is done when a report can be submitted, persisted, analysed or safely marked analysis-unavailable, displayed consistently across the dashboard and map, correlated only as a suggestion, reviewed by an authorised user, and reflected in analytics—with tests and documentation supporting the flow.

---

**End of specification.**
