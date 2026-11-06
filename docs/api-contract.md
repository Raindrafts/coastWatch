# CoastWatch API Contract

**Base URL:** `/api` for the Express service. JSON uses UTF-8. All dates are UTC ISO-8601. The AI service is internal and has no `/api` prefix.

## Universal rules

Successful JSON responses are `{ "data": ..., "meta": { ... } }`; `meta` may be omitted only for a single mutation with no metadata. Errors are:

```json
{"error":{"code":"VALIDATION_ERROR","message":"Please correct the highlighted fields.","details":[{"path":"description","message":"Must contain at least 20 characters"}],"requestId":"req_..."}}
```

Use `400` invalid query/body, `401` unauthenticated, `403` unauthorized role, `404` absent public resource, `409` duplicate/conflicting transition, `413` oversize payload, `415` unsupported media, `422` valid JSON but semantically invalid, `429` rate limited, and `500` non-sensitive unexpected failure. IDs in route parameters accept the public ID or internal ID only if explicitly documented by the implementation; frontend uses public IDs.

List query defaults: `page=1`, `limit=25`, max `100`; response metadata is `{ "page": 1, "limit": 25, "total": 0, "hasMore": false }`. Unknown enum query values are rejected. `from`/`to` dates are UTC and cannot span more than 366 days.

## DTO definitions

`Report` contains `id`, `publicId`, `title`, `description`, `hazardType`, nullable `location` (`{longitude,latitude,placeName?}`), `eventTime`, `createdAt`, `updatedAt`, `source`, `sourceReference?`, `evidence[]`, `reportedSeverity`, `status`, `aiAnalysis`, `review` (role-redacted), `possibleRelatedReportIds[]`, and `incidentId?`.

`SocialPost` contains `id`, `externalId?`, `platform`, `sourceMode`, `text`, `createdAt`, `importedAt`, nullable `location`, `sourceUrl?`, `relevant?`, `predictedHazardType?`, `confidence?`, `sentiment?`, `modelName?`, `modelVersion?`, `analysisStatus`, `possibleIncidentIds[]`.

`Incident` contains `id`, `publicId`, `title`, `hazardType`, `reportIds[]`, `socialPostIds[]`, nullable `location`, `firstObservedAt?`, `lastObservedAt?`, `reviewStatus`, `priorityScore?`, `priorityReasons[]`, `createdAt`, `updatedAt`.

Contact information and unredacted reviewer data are never returned to public roles.

## Health, reports, and dashboard

| Method and route | Auth | Request | Success response |
|---|---|---|---|
| `GET /health` | none | — | `{data:{status:"ok"|"degraded",database:"connected"|"unavailable",ai:{status,modelLoaded,modelVersion?},storage:"configured"|"local"|"unavailable",mode:"demo"|"connected"}}` |
| `POST /reports` | public, rate-limited | `multipart/form-data`: `title` (1–140), `description` (20–5000), `hazardType`, `reportedSeverity`, `acknowledged=true`, optional `eventTime`, `placeName`, `latitude`, `longitude`, `contact`, and `evidence` image | `201 {data:{report:Report,analysisQueued:boolean}}`; response never exposes contact |
| `GET /reports` | analyst/admin (public may receive redacted list only if enabled) | `hazardType,status,severity,source,search,from,to,sort=newest|oldest|severity|priority,page,limit` | `{data:Report[],meta:Pagination}` |
| `GET /reports/:publicId` | role-appropriate | — | `{data:{report:Report,related:{reports:Report[],socialPosts:SocialPost[]}}}` |
| `PATCH /reports/:publicId` | reporter owner/admin as implemented | JSON limited to allowed mutable fields; no status here | `{data:{report:Report}}` |
| `PATCH /reports/:publicId/status` | reviewer/admin | `{status,reason?,notes?,reviewerId?}`; reason required for `verified` and `rejected` | `{data:{report:Report,auditEventId:string}}` |
| `GET /reports/:publicId/audit` | reviewer/admin | pagination | `{data:AuditEvent[],meta:Pagination}` |
| `GET /dashboard/summary` | analyst/admin | optional shared filters: `hazardType,status,from,to` | `{data:{totalReports,activeIncidents,awaitingReview,highPriorityReports,lastUpdated,filterScope}}` |
| `GET /analytics/reports-over-time` | analyst/admin | `days=1..90`, optional shared filters | `{data:{timezone:"UTC",series:[{date,count}]}}` (includes zero days) |
| `GET /analytics/hazards` | analyst/admin | optional shared filters | `{data:[{hazardType,count}]}` |
| `GET /analytics/priority-queue` | reviewer/admin | `limit=1..25` | `{data:[{report:Report,priorityScore:number,reasons:string[]}]}` |
| `GET /analytics/social` | analyst/admin | `from,to,hazardType,relevant,platform` | `{data:{total,relevant,irrelevant,byHazard,trend,topKeywords,recent:SocialPost[]}}` |

Status transitions are only `pending_review -> under_review|needs_information|rejected`, `under_review -> verified|rejected|needs_information`, and `needs_information -> under_review|rejected`. Admins may reopen `verified|rejected -> under_review` with a mandatory reason. Every successful transition creates an audit record.

## Incidents and notifications

| Method and route | Auth | Request | Success response |
|---|---|---|---|
| `GET /incidents` | analyst/admin | `hazardType,reviewStatus,from,to,page,limit` | `{data:Incident[],meta:Pagination}` |
| `GET /incidents/:publicId` | analyst/admin | — | `{data:{incident:Incident,reports:Report[],socialPosts:SocialPost[]}}` |
| `POST /incidents/:publicId/link-report` | reviewer/admin | `{reportId,reason}` | `{data:{incident:Incident,auditEventId}}` |
| `POST /incidents/:publicId/link-social-post` | reviewer/admin | `{socialPostId,reason}` | `{data:{incident:Incident,auditEventId}}` |
| `PATCH /incidents/:publicId/status` | reviewer/admin | `{reviewStatus,reason}` | `{data:{incident:Incident,auditEventId}}` |
| `GET /notifications` | authenticated | `unreadOnly,page,limit` | `{data:Notification[],meta:Pagination}` |
| `PATCH /notifications/:id/read` | notification owner | `{read:true}` | `{data:{notification:Notification}}` |

Link endpoints reject duplicate links and preserve every source record. They create an association, not a merge.

## Social CSV import

CSV headers: required `post_id,platform,text,created_at`; optional `author_id,latitude,longitude,source_url`. Formula-leading cells (`=`, `+`, `-`, `@`) are treated as plain text and never rendered as HTML. Limits come from environment configuration.

| Method and route | Auth | Request | Success response |
|---|---|---|---|
| `GET /social/import/template` | analyst/admin | — | `200 text/csv` attachment with header and sample row |
| `POST /social/import/preview` | analyst/admin | multipart `file` CSV | `{data:{previewToken,validRows,invalidRows,duplicateRows,skippedRows,rows:[{rowNumber,valid,errors?,normalized?}]}}` |
| `POST /social/import/commit` | analyst/admin | `{previewToken}` | `{201 data:{importJobId,created,duplicates,invalid,analysisPending}}` |
| `GET /social/posts` | analyst/admin | `search,platform,sourceMode,relevant,hazardType,from,to,page,limit` | `{data:SocialPost[],meta:Pagination}` |

A preview token is server-side, single-use, and expires after 15 minutes. Commit rejects a missing, expired, or already-consumed token.

## Internal FastAPI contract

`GET /health` returns `200 {"status":"ok"|"degraded","model_loaded":boolean,"model_name":string?,"model_version":string?}`.

`POST /analyze` requires `X-CoastWatch-Service-Token` when `AI_SERVICE_TOKEN` is set. Request:

```json
{"text":"Unusually high waves are reaching the road near the shore","source":"citizen_report"}
```

`source` is `citizen_report | social_import`. Success is:

```json
{"relevant":true,"hazard_type":"high_waves","confidence":0.82,"model_name":"tfidf-logistic-regression","model_version":"baseline-v1","analysis_status":"completed","needs_human_review":true}
```

`confidence` is omitted—not invented—when the model cannot produce a meaningful value. Invalid input returns FastAPI `422`; unavailable model returns `503 {"detail":"Model unavailable"}`. The API maps AI failures to report analysis status `failed` or `unavailable` and still returns report creation success.
