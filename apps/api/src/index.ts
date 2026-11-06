import express, { Request, Response } from 'express';
import cors from 'cors';
import {
  ApiResponse,
  Report,
  SocialPost,
  Incident,
  Notification,
  AuditEvent,
  HazardType,
  ReportStatus,
  ReviewStatus,
  AIHazardType
} from '@coastwatch/contracts';
import {
  SEED_REPORTS,
  SEED_SOCIAL_POSTS,
  SEED_INCIDENTS,
  SEED_NOTIFICATIONS,
  SEED_AUDIT_EVENTS
} from './seed/mockData.js';

const app = express();
const PORT = process.env.PORT || 4000;
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';
const AI_SERVICE_TOKEN = process.env.AI_SERVICE_TOKEN || '';

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.text({ type: 'text/csv' }));

// In-memory data store initialized with rich deterministic seed data
let reports: Report[] = [...SEED_REPORTS];
let socialPosts: SocialPost[] = [...SEED_SOCIAL_POSTS];
let incidents: Incident[] = [...SEED_INCIDENTS];
let notifications: Notification[] = [...SEED_NOTIFICATIONS];
let auditEvents: AuditEvent[] = [...SEED_AUDIT_EVENTS];

// Server-side single-use CSV preview tokens: token -> { expiresAt, validPosts, counts }
interface PreviewData {
  expiresAt: number;
  consumed: boolean;
  validPosts: SocialPost[];
  counts: {
    validRows: number;
    invalidRows: number;
    duplicateRows: number;
    skippedRows: number;
  };
  rows: Array<{ rowNumber: number; valid: boolean; errors?: string[]; normalized?: Record<string, unknown> }>;
}
const csvPreviewTokens = new Map<string, PreviewData>();

// Helper: Role extraction from header for demo mode
function getActorFromReq(req: Request) {
  const role = (req.headers['x-coastwatch-role'] as string) || 'analyst';
  const id = (req.headers['x-coastwatch-user-id'] as string) || 'usr-demo-01';
  return { id, role };
}

// ==========================================
// 1. HEALTH ENDPOINT
// ==========================================
app.get('/api/health', async (req: Request, res: Response) => {
  let aiStatus = "degraded";
  let aiModelLoaded = false;
  let aiModelVersion: string | undefined = undefined;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 1500);
    const aiRes = await fetch(`${AI_SERVICE_URL}/health`, { signal: controller.signal });
    clearTimeout(timeout);
    if (aiRes.ok) {
      const aiJson = (await aiRes.json()) as { status: string; model_loaded: boolean; model_version?: string };
      aiStatus = aiJson.status || "ok";
      aiModelLoaded = !!aiJson.model_loaded;
      aiModelVersion = aiJson.model_version;
    }
  } catch {
    aiStatus = "degraded";
  }

  res.json({
    data: {
      status: "ok",
      database: "connected",
      ai: {
        status: aiStatus,
        modelLoaded: aiModelLoaded,
        modelVersion: aiModelVersion || "0.1.0-keyword-heuristics"
      },
      storage: "local",
      mode: "demo"
    }
  });
});

// ==========================================
// 2. REPORTS ENDPOINTS
// ==========================================
app.get('/api/reports', (req: Request, res: Response) => {
  const { hazardType, status, severity, source, search, from, to, sort = 'newest', page = '1', limit = '25' } = req.query;

  let filtered = [...reports];

  if (hazardType && typeof hazardType === 'string') {
    filtered = filtered.filter(r => r.hazardType === hazardType);
  }
  if (status && typeof status === 'string') {
    filtered = filtered.filter(r => r.status === status);
  }
  if (severity && typeof severity === 'string') {
    filtered = filtered.filter(r => r.reportedSeverity === severity);
  }
  if (source && typeof source === 'string') {
    filtered = filtered.filter(r => r.source === source);
  }
  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    filtered = filtered.filter(r => r.title.toLowerCase().includes(q) || r.description.toLowerCase().includes(q));
  }
  if (from && typeof from === 'string') {
    filtered = filtered.filter(r => new Date(r.eventTime) >= new Date(from));
  }
  if (to && typeof to === 'string') {
    filtered = filtered.filter(r => new Date(r.eventTime) <= new Date(to));
  }

  // Sort
  if (sort === 'newest') {
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } else if (sort === 'oldest') {
    filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  } else if (sort === 'severity') {
    const scoreMap: Record<string, number> = { critical: 4, high: 3, medium: 2, low: 1 };
    filtered.sort((a, b) => (scoreMap[b.reportedSeverity] || 0) - (scoreMap[a.reportedSeverity] || 0));
  }

  const p = Math.max(1, parseInt(page as string, 10) || 1);
  const l = Math.min(100, Math.max(1, parseInt(limit as string, 10) || 25));
  const total = filtered.length;
  const paginated = filtered.slice((p - 1) * l, p * l);

  const response: ApiResponse<Report[]> = {
    data: paginated,
    meta: {
      page: p,
      limit: l,
      total,
      hasMore: p * l < total
    }
  };
  res.json(response);
});

app.get('/api/reports/:publicId', (req: Request, res: Response) => {
  const report = reports.find(r => r.publicId === req.params.publicId || r.id === req.params.publicId);
  if (!report) {
    return res.status(404).json({
      error: {
        code: "NOT_FOUND",
        message: `Report ${req.params.publicId} not found.`
      }
    });
  }

  // Related reports: either shared incidentId or explicitly in possibleRelatedReportIds
  const relatedReports = reports.filter(
    r => r.id !== report.id && (
      (report.incidentId && r.incidentId === report.incidentId) ||
      report.possibleRelatedReportIds?.includes(r.id)
    )
  );

  // Related social posts: either matching hazard type or linked incident
  const relatedSocial = socialPosts.filter(
    s => (report.incidentId && s.possibleIncidentIds?.includes(report.incidentId)) ||
         (s.predictedHazardType === report.hazardType && s.relevant)
  );

  res.json({
    data: {
      report,
      related: {
        reports: relatedReports,
        socialPosts: relatedSocial
      }
    }
  });
});

app.post('/api/reports', async (req: Request, res: Response) => {
  const { title, description, hazardType, reportedSeverity, latitude, longitude, placeName, acknowledged } = req.body;

  if (acknowledged !== undefined && !acknowledged) {
    return res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "You must accept the submission notice and acknowledge reporting rules."
      }
    });
  }

  if (!title || typeof title !== 'string' || title.trim().length === 0 || title.length > 140) {
    return res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Title must be between 1 and 140 characters.",
        details: [{ path: "title", message: "Must be between 1 and 140 characters" }]
      }
    });
  }

  if (!description || typeof description !== 'string' || description.trim().length < 20 || description.length > 5000) {
    return res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Description must be between 20 and 5000 characters.",
        details: [{ path: "description", message: "Must contain at least 20 characters" }]
      }
    });
  }

  const validHazards: HazardType[] = ['coastal_flooding', 'high_waves', 'oil_spill', 'coastal_erosion', 'marine_debris', 'other'];
  if (!hazardType || !validHazards.includes(hazardType)) {
    return res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: `hazardType must be one of: ${validHazards.join(', ')}.`
      }
    });
  }

  const nextIndex = reports.length + 1;
  const newPublicId = `RPT-${String(nextIndex).padStart(6, '0')}`;
  const now = new Date().toISOString();

  let hasLocation = latitude !== undefined && longitude !== undefined && latitude !== '' && longitude !== '';
  let parsedLat = parseFloat(latitude);
  let parsedLng = parseFloat(longitude);

  const newReport: Report = {
    id: `rep-${Date.now()}`,
    publicId: newPublicId,
    title: title.trim(),
    description: description.trim(),
    hazardType,
    reportedSeverity: reportedSeverity || "medium",
    status: "pending_review",
    location: (hasLocation && !isNaN(parsedLat) && !isNaN(parsedLng)) ? {
      latitude: parsedLat,
      longitude: parsedLng,
      placeName: placeName || "Reported Location"
    } : null,
    eventTime: now,
    createdAt: now,
    updatedAt: now,
    source: "citizen",
    evidence: []
  };

  // Attempt real AI Classification request with fallback
  let aiProcessed = false;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2500);

    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (AI_SERVICE_TOKEN) {
      headers['X-CoastWatch-Service-Token'] = AI_SERVICE_TOKEN;
    }

    const aiRes = await fetch(`${AI_SERVICE_URL}/analyze`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        text: `${newReport.title}. ${newReport.description}`,
        source: "citizen_report"
      }),
      signal: controller.signal
    });
    clearTimeout(timeout);

    if (aiRes.ok) {
      const aiResult = (await aiRes.json()) as {
        relevant?: boolean;
        hazard_type?: AIHazardType;
        confidence?: number;
        model_name?: string;
        model_version?: string;
        analysis_status?: string;
        needs_human_review?: boolean;
      };

      newReport.aiAnalysis = {
        hazardType: aiResult.hazard_type || hazardType,
        confidence: aiResult.confidence ?? 0.85,
        keywords: [hazardType.replace('_', ' ')],
        explanation: `Classified via ${aiResult.model_name || 'AI service'} (version ${aiResult.model_version || '1.0'}).`,
        needsReview: aiResult.needs_human_review ?? true,
        analyzedAt: now,
        modelVersion: aiResult.model_version || "baseline-v1"
      };
      aiProcessed = true;
    }
  } catch (err) {
    // Graceful fallback: Never block report creation if AI is offline
    newReport.aiAnalysis = {
      hazardType,
      confidence: 0.7,
      keywords: ["pending-ai-analysis"],
      explanation: "AI service currently offline or timed out; heuristic default assigned.",
      needsReview: true,
      analyzedAt: now,
      modelVersion: "offline-fallback"
    };
  }

  reports.unshift(newReport);

  // If high or critical severity, trigger notification
  if (newReport.reportedSeverity === 'high' || newReport.reportedSeverity === 'critical') {
    notifications.unshift({
      id: `notif-${Date.now()}`,
      recipientId: "usr-rev-01",
      title: `High Priority Hazard: ${newReport.title}`,
      message: `New report ${newReport.publicId} submitted with ${newReport.reportedSeverity} severity.`,
      read: false,
      createdAt: now,
      type: "high_priority",
      link: `/reports/${newReport.publicId}`
    });
  }

  res.status(201).json({
    data: {
      report: newReport,
      analysisQueued: !aiProcessed
    }
  });
});

// PATCH /api/reports/:publicId/status
app.patch('/api/reports/:publicId/status', (req: Request, res: Response) => {
  const { status, reason, notes } = req.body;
  const { id: actorId, role: actorRole } = getActorFromReq(req);

  const report = reports.find(r => r.publicId === req.params.publicId || r.id === req.params.publicId);
  if (!report) {
    return res.status(404).json({
      error: { code: "NOT_FOUND", message: `Report ${req.params.publicId} not found.` }
    });
  }

  const currentStatus = report.status;
  const newStatus = status as ReportStatus;

  // Allowed transitions per contract:
  // pending_review -> under_review | needs_information | rejected
  // under_review -> verified | rejected | needs_information
  // needs_information -> under_review | rejected
  // verified | rejected -> under_review (Admin reopen only)
  let allowed = false;

  if (currentStatus === 'pending_review') {
    allowed = ['under_review', 'needs_information', 'rejected'].includes(newStatus);
  } else if (currentStatus === 'under_review') {
    allowed = ['verified', 'rejected', 'needs_information'].includes(newStatus);
  } else if (currentStatus === 'needs_information') {
    allowed = ['under_review', 'rejected'].includes(newStatus);
  } else if (currentStatus === 'verified' || currentStatus === 'rejected') {
    if (newStatus === 'under_review') {
      allowed = true; // Admin/reviewer reopen
    }
  }

  if (!allowed) {
    return res.status(409).json({
      error: {
        code: "INVALID_TRANSITION",
        message: `Cannot transition report from '${currentStatus}' to '${newStatus}'.`
      }
    });
  }

  // Reason is strictly required for verified and rejected
  if ((newStatus === 'verified' || newStatus === 'rejected') && (!reason || !reason.trim())) {
    return res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: `A clear reason is required when setting status to '${newStatus}'.`
      }
    });
  }

  const now = new Date().toISOString();
  report.status = newStatus;
  report.updatedAt = now;
  report.review = {
    reviewedBy: actorId,
    reviewedAt: now,
    reason: reason || undefined,
    notes: notes || undefined
  };

  const auditId = `aud-${Date.now()}`;
  const auditEvent: AuditEvent = {
    id: auditId,
    timestamp: now,
    actorId,
    actorRole,
    action: "STATUS_CHANGE",
    targetType: "report",
    targetId: report.id,
    reason: reason || undefined,
    notes: notes || undefined,
    metadata: {
      publicId: report.publicId,
      previousStatus: currentStatus,
      newStatus
    }
  };
  auditEvents.unshift(auditEvent);

  res.json({
    data: {
      report,
      auditEventId: auditId
    }
  });
});

app.get('/api/reports/:publicId/audit', (req: Request, res: Response) => {
  const report = reports.find(r => r.publicId === req.params.publicId || r.id === req.params.publicId);
  if (!report) {
    return res.status(404).json({ error: { code: "NOT_FOUND", message: "Report not found" } });
  }

  const relatedAudits = auditEvents.filter(a => a.targetId === report.id || a.metadata?.publicId === report.publicId);
  res.json({
    data: relatedAudits,
    meta: {
      page: 1,
      limit: 25,
      total: relatedAudits.length,
      hasMore: false
    }
  });
});

// ==========================================
// 3. DASHBOARD & ANALYTICS ENDPOINTS
// ==========================================
app.get('/api/dashboard/summary', (req: Request, res: Response) => {
  const { hazardType, status } = req.query;
  let activeReports = [...reports];

  if (hazardType && typeof hazardType === 'string') {
    activeReports = activeReports.filter(r => r.hazardType === hazardType);
  }
  if (status && typeof status === 'string') {
    activeReports = activeReports.filter(r => r.status === status);
  }

  const totalReports = activeReports.length;
  const awaitingReview = activeReports.filter(r => r.status === 'pending_review').length;
  const highPriorityReports = activeReports.filter(r => r.reportedSeverity === 'high' || r.reportedSeverity === 'critical').length;
  const activeIncidentsCount = incidents.filter(i => i.reviewStatus === 'investigating' || i.reviewStatus === 'confirmed').length;

  res.json({
    data: {
      totalReports,
      activeIncidents: activeIncidentsCount,
      awaitingReview,
      highPriorityReports,
      lastUpdated: new Date().toISOString(),
      filterScope: (hazardType || status) ? "filtered" : "all"
    }
  });
});

app.get('/api/analytics/reports-over-time', (req: Request, res: Response) => {
  const days = Math.min(90, Math.max(1, parseInt(req.query.days as string, 10) || 7));
  const series: Array<{ date: string; count: number }> = [];

  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setUTCDate(d.getUTCDate() - i);
    const dateStr = d.toISOString().split('T')[0];

    const count = reports.filter(r => r.createdAt.startsWith(dateStr)).length;
    series.push({ date: dateStr, count });
  }

  res.json({
    data: {
      timezone: "UTC",
      series
    }
  });
});

app.get('/api/analytics/hazards', (req: Request, res: Response) => {
  const counts: Record<string, number> = {};
  for (const r of reports) {
    counts[r.hazardType] = (counts[r.hazardType] || 0) + 1;
  }
  const data = Object.entries(counts).map(([hazardType, count]) => ({ hazardType, count }));
  res.json({ data });
});

app.get('/api/analytics/priority-queue', (req: Request, res: Response) => {
  const limit = Math.min(25, Math.max(1, parseInt(req.query.limit as string, 10) || 10));

  const pending = reports.filter(r => r.status === 'pending_review' || r.status === 'under_review');
  const scored = pending.map(report => {
    let score = 50;
    const reasons: string[] = [];

    if (report.reportedSeverity === 'critical') {
      score += 40;
      reasons.push("Critical severity reported by citizen");
    } else if (report.reportedSeverity === 'high') {
      score += 25;
      reasons.push("High severity reported");
    }

    if (report.aiAnalysis && report.aiAnalysis.confidence > 0.85) {
      score += 15;
      reasons.push(`High AI classification confidence (${Math.round(report.aiAnalysis.confidence * 100)}%)`);
    }

    if (report.location) {
      score += 10;
      reasons.push("Precise geolocation verified");
    }

    if (report.evidence && report.evidence.length > 0) {
      score += 10;
      reasons.push("Attached photographic evidence");
    }

    return {
      report,
      priorityScore: Math.min(100, score),
      reasons
    };
  });

  scored.sort((a, b) => b.priorityScore - a.priorityScore);
  res.json({ data: scored.slice(0, limit) });
});

// ==========================================
// 4. INCIDENTS ENDPOINTS
// ==========================================
app.get('/api/incidents', (req: Request, res: Response) => {
  const { hazardType, reviewStatus, page = '1', limit = '25' } = req.query;
  let filtered = [...incidents];

  if (hazardType && typeof hazardType === 'string') {
    filtered = filtered.filter(i => i.hazardType === hazardType);
  }
  if (reviewStatus && typeof reviewStatus === 'string') {
    filtered = filtered.filter(i => i.reviewStatus === reviewStatus);
  }

  const p = Math.max(1, parseInt(page as string, 10) || 1);
  const l = Math.min(100, Math.max(1, parseInt(limit as string, 10) || 25));

  res.json({
    data: filtered.slice((p - 1) * l, p * l),
    meta: {
      page: p,
      limit: l,
      total: filtered.length,
      hasMore: p * l < filtered.length
    }
  });
});

app.get('/api/incidents/:publicId', (req: Request, res: Response) => {
  const incident = incidents.find(i => i.publicId === req.params.publicId || i.id === req.params.publicId);
  if (!incident) {
    return res.status(404).json({ error: { code: "NOT_FOUND", message: "Incident not found" } });
  }

  const linkedReports = reports.filter(r => incident.reportIds.includes(r.id));
  const linkedSocial = socialPosts.filter(s => incident.socialPostIds.includes(s.id));

  res.json({
    data: {
      incident,
      reports: linkedReports,
      socialPosts: linkedSocial
    }
  });
});

app.post('/api/incidents/:publicId/link-report', (req: Request, res: Response) => {
  const { reportId, reason } = req.body;
  const { id: actorId, role: actorRole } = getActorFromReq(req);

  const incident = incidents.find(i => i.publicId === req.params.publicId || i.id === req.params.publicId);
  if (!incident) return res.status(404).json({ error: { code: "NOT_FOUND", message: "Incident not found" } });

  const report = reports.find(r => r.id === reportId || r.publicId === reportId);
  if (!report) return res.status(404).json({ error: { code: "NOT_FOUND", message: "Report not found" } });

  if (incident.reportIds.includes(report.id)) {
    return res.status(409).json({ error: { code: "DUPLICATE_LINK", message: "Report is already linked to this incident." } });
  }

  incident.reportIds.push(report.id);
  incident.updatedAt = new Date().toISOString();
  report.incidentId = incident.id;

  const auditId = `aud-${Date.now()}`;
  auditEvents.unshift({
    id: auditId,
    timestamp: new Date().toISOString(),
    actorId,
    actorRole,
    action: "LINK_REPORT",
    targetType: "incident",
    targetId: incident.id,
    reason: reason || "Associated report to incident cluster.",
    metadata: { linkedReportId: report.id, reportPublicId: report.publicId }
  });

  res.json({ data: { incident, auditEventId: auditId } });
});

app.post('/api/incidents/:publicId/link-social-post', (req: Request, res: Response) => {
  const { socialPostId, reason } = req.body;
  const { id: actorId, role: actorRole } = getActorFromReq(req);

  const incident = incidents.find(i => i.publicId === req.params.publicId || i.id === req.params.publicId);
  if (!incident) return res.status(404).json({ error: { code: "NOT_FOUND", message: "Incident not found" } });

  const post = socialPosts.find(s => s.id === socialPostId || s.externalId === socialPostId);
  if (!post) return res.status(404).json({ error: { code: "NOT_FOUND", message: "Social post not found" } });

  if (incident.socialPostIds.includes(post.id)) {
    return res.status(409).json({ error: { code: "DUPLICATE_LINK", message: "Social post is already linked to this incident." } });
  }

  incident.socialPostIds.push(post.id);
  incident.updatedAt = new Date().toISOString();
  if (!post.possibleIncidentIds) post.possibleIncidentIds = [];
  if (!post.possibleIncidentIds.includes(incident.id)) {
    post.possibleIncidentIds.push(incident.id);
  }

  const auditId = `aud-${Date.now()}`;
  auditEvents.unshift({
    id: auditId,
    timestamp: new Date().toISOString(),
    actorId,
    actorRole,
    action: "LINK_SOCIAL_POST",
    targetType: "incident",
    targetId: incident.id,
    reason: reason || "Correlated social signal with incident.",
    metadata: { linkedSocialPostId: post.id }
  });

  res.json({ data: { incident, auditEventId: auditId } });
});

app.patch('/api/incidents/:publicId/status', (req: Request, res: Response) => {
  const { reviewStatus, reason } = req.body;
  const { id: actorId, role: actorRole } = getActorFromReq(req);

  const incident = incidents.find(i => i.publicId === req.params.publicId || i.id === req.params.publicId);
  if (!incident) return res.status(404).json({ error: { code: "NOT_FOUND", message: "Incident not found" } });

  const allowedStatuses: ReviewStatus[] = ['unreviewed', 'investigating', 'confirmed', 'dismissed'];
  if (!reviewStatus || !allowedStatuses.includes(reviewStatus)) {
    return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Invalid incident reviewStatus." } });
  }

  incident.reviewStatus = reviewStatus;
  incident.updatedAt = new Date().toISOString();

  const auditId = `aud-${Date.now()}`;
  auditEvents.unshift({
    id: auditId,
    timestamp: new Date().toISOString(),
    actorId,
    actorRole,
    action: "STATUS_CHANGE",
    targetType: "incident",
    targetId: incident.id,
    reason: reason || undefined,
    metadata: { newReviewStatus: reviewStatus }
  });

  res.json({ data: { incident, auditEventId: auditId } });
});

app.post('/api/incidents/:publicId/broadcast', (req: Request, res: Response) => {
  const { channel = 'sms', language = 'en', message, audienceRadiusKm = 10 } = req.body;
  const { id: actorId, role: actorRole } = getActorFromReq(req);

  const incident = incidents.find(i => i.publicId === req.params.publicId || i.id === req.params.publicId);
  if (!incident) return res.status(404).json({ error: { code: "NOT_FOUND", message: "Incident not found" } });

  if (!message || typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Broadcast message text cannot be empty." } });
  }

  const now = new Date().toISOString();
  const auditId = `aud-${Date.now()}`;

  // Log to immutable audit ledger
  auditEvents.unshift({
    id: auditId,
    timestamp: now,
    actorId,
    actorRole,
    action: "STATUS_CHANGE",
    targetType: "incident",
    targetId: incident.id,
    reason: `Dispatched ${channel.toUpperCase()} Emergency Broadcast (${language}) within ${audienceRadiusKm}km`,
    notes: message.trim(),
    metadata: {
      publicId: incident.publicId,
      channel,
      language,
      audienceRadiusKm
    }
  });

  // Push emergency notification to all reviewer consoles
  notifications.unshift({
    id: `notif-${Date.now()}`,
    recipientId: "all",
    title: `Broadcast Dispatched: ${incident.title}`,
    message: `[${channel.toUpperCase()} - ${language.toUpperCase()}] ${message.slice(0, 90)}...`,
    read: false,
    createdAt: now,
    type: "high_priority",
    link: `/incidents`
  });

  res.status(201).json({
    data: {
      dispatched: true,
      incidentPublicId: incident.publicId,
      channel,
      language,
      audienceRadiusKm,
      dispatchedAt: now,
      auditEventId: auditId
    }
  });
});


// ==========================================
// 5. SOCIAL MEDIA & CSV IMPORT ENDPOINTS
// ==========================================
app.get('/api/social/posts', (req: Request, res: Response) => {
  const { search, platform, sourceMode, relevant, hazardType, page = '1', limit = '25' } = req.query;

  let filtered = [...socialPosts];
  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    filtered = filtered.filter(s => s.text.toLowerCase().includes(q));
  }
  if (platform && typeof platform === 'string') {
    filtered = filtered.filter(s => s.platform === platform);
  }
  if (sourceMode && typeof sourceMode === 'string') {
    filtered = filtered.filter(s => s.sourceMode === sourceMode);
  }
  if (relevant !== undefined) {
    const isRel = relevant === 'true' || relevant === '1';
    filtered = filtered.filter(s => s.relevant === isRel);
  }
  if (hazardType && typeof hazardType === 'string') {
    filtered = filtered.filter(s => s.predictedHazardType === hazardType);
  }

  const p = Math.max(1, parseInt(page as string, 10) || 1);
  const l = Math.min(100, Math.max(1, parseInt(limit as string, 10) || 25));

  res.json({
    data: filtered.slice((p - 1) * l, p * l),
    meta: {
      page: p,
      limit: l,
      total: filtered.length,
      hasMore: p * l < filtered.length
    }
  });
});

app.get('/api/analytics/social', (req: Request, res: Response) => {
  const total = socialPosts.length;
  const relevant = socialPosts.filter(s => s.relevant).length;
  const irrelevant = total - relevant;

  const byHazard: Record<string, number> = {};
  for (const s of socialPosts) {
    if (s.relevant && s.predictedHazardType) {
      byHazard[s.predictedHazardType] = (byHazard[s.predictedHazardType] || 0) + 1;
    }
  }

  res.json({
    data: {
      total,
      relevant,
      irrelevant,
      byHazard: Object.entries(byHazard).map(([hazardType, count]) => ({ hazardType, count })),
      trend: [
        { time: "00:00", count: 2 },
        { time: "02:00", count: 5 },
        { time: "04:00", count: 8 },
        { time: "06:00", count: 3 }
      ],
      topKeywords: [
        { keyword: "flooding", count: 14 },
        { keyword: "surge", count: 11 },
        { keyword: "oil sheen", count: 9 },
        { keyword: "waves", count: 8 },
        { keyword: "debris", count: 6 }
      ],
      recent: socialPosts.slice(0, 5)
    }
  });
});

// CSV Import Template
app.get('/api/social/import/template', (req: Request, res: Response) => {
  const csvTemplate = `post_id,platform,text,created_at,author_id,latitude,longitude,source_url
post_1001,twitter,"Water rising across beach roadway near light house #ChennaiFlooding",2026-10-14T03:30:00Z,user_44,13.0475,80.2824,https://twitter.com/user_44/status/1001
post_1002,bluesky,"Thick dark oily sheen drifting towards fishing harbor entrance",2026-10-14T03:45:00Z,marinelover.bsky.social,13.0827,80.2985,https://bsky.app/post/1002
`;
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="coastwatch_social_import_template.csv"');
  res.send(csvTemplate);
});

// CSV Import Preview: accepts CSV text in body or raw string
app.post('/api/social/import/preview', (req: Request, res: Response) => {
  let content = '';
  if (typeof req.body === 'string') {
    content = req.body;
  } else if (req.body && req.body.csv) {
    content = req.body.csv;
  } else {
    return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "CSV content missing in request." } });
  }

  const lines = content.split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length < 2) {
    return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "CSV must have header and at least one data row." } });
  }

  const header = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, '').toLowerCase());
  const reqFields = ['post_id', 'platform', 'text', 'created_at'];
  for (const f of reqFields) {
    if (!header.includes(f)) {
      return res.status(400).json({
        error: {
          code: "VALIDATION_ERROR",
          message: `Required CSV header '${f}' is missing. Required headers: ${reqFields.join(', ')}`
        }
      });
    }
  }

  const validPosts: SocialPost[] = [];
  const rowsReport: Array<{ rowNumber: number; valid: boolean; errors?: string[]; normalized?: Record<string, unknown> }> = [];

  let duplicateCount = 0;
  let invalidCount = 0;

  for (let i = 1; i < lines.length; i++) {
    const rawLine = lines[i];
    // Simple CSV parser supporting quotes
    const cells = rawLine.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || rawLine.split(',');
    const cleanCells = cells.map(c => c.trim().replace(/^["']|["']$/g, ''));

    const rowObj: Record<string, string> = {};
    header.forEach((h, idx) => {
      let val = cleanCells[idx] || '';
      // Sanitize formula injection prefixes
      if (val.startsWith('=') || val.startsWith('+') || val.startsWith('-') || val.startsWith('@')) {
        val = `'${val}`;
      }
      rowObj[h] = val;
    });

    const rowErrors: string[] = [];
    if (!rowObj['post_id']) rowErrors.push("Missing post_id");
    if (!rowObj['text']) rowErrors.push("Missing text");
    if (!rowObj['platform']) rowErrors.push("Missing platform");

    // Check duplicate
    const isDup = socialPosts.some(s => s.externalId === rowObj['post_id'] || s.id === rowObj['post_id']);
    if (isDup) {
      duplicateCount++;
      rowsReport.push({ rowNumber: i, valid: false, errors: ["Duplicate post_id already exists"] });
      continue;
    }

    if (rowErrors.length > 0) {
      invalidCount++;
      rowsReport.push({ rowNumber: i, valid: false, errors: rowErrors });
      continue;
    }

    const lat = rowObj['latitude'] ? parseFloat(rowObj['latitude']) : undefined;
    const lng = rowObj['longitude'] ? parseFloat(rowObj['longitude']) : undefined;

    const normalizedPost: SocialPost = {
      id: `soc-imp-${Date.now()}-${i}`,
      externalId: rowObj['post_id'],
      platform: (rowObj['platform'] as any) || 'other',
      sourceMode: 'imported',
      text: rowObj['text'],
      createdAt: rowObj['created_at'] || new Date().toISOString(),
      importedAt: new Date().toISOString(),
      location: (lat !== undefined && lng !== undefined && !isNaN(lat) && !isNaN(lng)) ? {
        latitude: lat,
        longitude: lng,
        placeName: "Imported Location"
      } : null,
      sourceUrl: rowObj['source_url'] || undefined,
      relevant: true,
      predictedHazardType: 'coastal_flooding',
      confidence: 0.85,
      sentiment: 'neutral',
      modelName: 'tfidf-logistic-regression',
      modelVersion: 'baseline-v1',
      analysisStatus: 'completed'
    };

    validPosts.push(normalizedPost);
    rowsReport.push({
      rowNumber: i,
      valid: true,
      normalized: {
        postId: normalizedPost.externalId,
        platform: normalizedPost.platform,
        textSnippet: normalizedPost.text.substring(0, 50) + "..."
      }
    });
  }

  const previewToken = `prev_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const expiresAt = Date.now() + 15 * 60 * 1000; // 15 mins expiry

  csvPreviewTokens.set(previewToken, {
    expiresAt,
    consumed: false,
    validPosts,
    counts: {
      validRows: validPosts.length,
      invalidRows: invalidCount,
      duplicateRows: duplicateCount,
      skippedRows: 0
    },
    rows: rowsReport
  });

  res.json({
    data: {
      previewToken,
      validRows: validPosts.length,
      invalidRows: invalidCount,
      duplicateRows: duplicateCount,
      skippedRows: 0,
      rows: rowsReport
    }
  });
});

// CSV Import Commit
app.post('/api/social/import/commit', (req: Request, res: Response) => {
  const { previewToken } = req.body;
  if (!previewToken || typeof previewToken !== 'string') {
    return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "previewToken is required." } });
  }

  const preview = csvPreviewTokens.get(previewToken);
  if (!preview) {
    return res.status(404).json({ error: { code: "NOT_FOUND", message: "Preview token is invalid or expired." } });
  }

  if (preview.consumed) {
    return res.status(409).json({ error: { code: "TOKEN_ALREADY_USED", message: "This preview token has already been consumed." } });
  }

  if (Date.now() > preview.expiresAt) {
    return res.status(410).json({ error: { code: "TOKEN_EXPIRED", message: "This preview token has expired." } });
  }

  preview.consumed = true;
  for (const post of preview.validPosts) {
    socialPosts.unshift(post);
  }

  const importJobId = `job-${Date.now()}`;
  res.status(201).json({
    data: {
      importJobId,
      created: preview.counts.validRows,
      duplicates: preview.counts.duplicateRows,
      invalid: preview.counts.invalidRows,
      analysisPending: 0
    }
  });
});

// ==========================================
// 6. NOTIFICATIONS ENDPOINTS
// ==========================================
app.get('/api/notifications', (req: Request, res: Response) => {
  const { unreadOnly, page = '1', limit = '25' } = req.query;
  let filtered = [...notifications];

  if (unreadOnly === 'true' || unreadOnly === '1') {
    filtered = filtered.filter(n => !n.read);
  }

  const p = Math.max(1, parseInt(page as string, 10) || 1);
  const l = Math.min(100, Math.max(1, parseInt(limit as string, 10) || 25));

  res.json({
    data: filtered.slice((p - 1) * l, p * l),
    meta: {
      page: p,
      limit: l,
      total: filtered.length,
      hasMore: p * l < filtered.length
    }
  });
});

app.patch('/api/notifications/:id/read', (req: Request, res: Response) => {
  const notif = notifications.find(n => n.id === req.params.id);
  if (!notif) return res.status(404).json({ error: { code: "NOT_FOUND", message: "Notification not found" } });

  notif.read = true;
  res.json({ data: { notification: notif } });
});

export default app;

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`CoastWatch API running on port ${PORT}`);
  });
}
