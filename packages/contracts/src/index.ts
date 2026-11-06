/**
 * Core hazard types recognized across CoastWatch
 */
export type HazardType =
  | 'coastal_flooding'
  | 'high_waves'
  | 'oil_spill'
  | 'coastal_erosion'
  | 'marine_debris'
  | 'other';

export type AIHazardType = HazardType | 'unknown';

export type SeverityLevel = 'low' | 'medium' | 'high' | 'critical';

export type ReportStatus =
  | 'pending_review'
  | 'under_review'
  | 'verified'
  | 'rejected'
  | 'needs_information';

export type ReviewStatus = 'unreviewed' | 'investigating' | 'confirmed' | 'dismissed';

export type PlatformSource = 'citizen' | 'twitter' | 'bluesky' | 'facebook' | 'news' | 'other';

export interface LocationGeoJSON {
  longitude: number;
  latitude: number;
  placeName?: string;
}

export interface AIAnalysisResult {
  hazardType: AIHazardType;
  confidence: number;
  keywords: string[];
  explanation: string;
  needsReview: boolean;
  analyzedAt: string;
  modelVersion?: string;
}

export interface ReviewMetadata {
  reviewedBy?: string;
  reviewedAt?: string;
  notes?: string;
  reason?: string;
}

export interface Report {
  id: string;
  publicId: string;
  title: string;
  description: string;
  hazardType: HazardType;
  location?: LocationGeoJSON | null;
  eventTime: string;
  createdAt: string;
  updatedAt: string;
  source: PlatformSource;
  sourceReference?: string;
  evidence: string[];
  reportedSeverity: SeverityLevel;
  status: ReportStatus;
  aiAnalysis?: AIAnalysisResult;
  review?: ReviewMetadata;
  possibleRelatedReportIds?: string[];
  incidentId?: string;
}

export interface SocialPost {
  id: string;
  externalId?: string;
  platform: PlatformSource;
  sourceMode: 'simulated' | 'imported' | 'live';
  text: string;
  createdAt: string;
  importedAt: string;
  location?: LocationGeoJSON | null;
  sourceUrl?: string;
  relevant?: boolean;
  predictedHazardType?: AIHazardType;
  confidence?: number;
  sentiment?: 'positive' | 'neutral' | 'negative' | 'urgent';
  modelName?: string;
  modelVersion?: string;
  analysisStatus: 'pending' | 'completed' | 'failed';
  possibleIncidentIds?: string[];
}

export interface Incident {
  id: string;
  publicId: string;
  title: string;
  hazardType: HazardType;
  reportIds: string[];
  socialPostIds: string[];
  location?: LocationGeoJSON | null;
  firstObservedAt?: string;
  lastObservedAt?: string;
  reviewStatus: ReviewStatus;
  priorityScore?: number;
  priorityReasons?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

export interface ApiResponse<T> {
  data: T;
  meta?: PaginationMeta | Record<string, unknown>;
}

export interface ApiErrorDetail {
  path: string;
  message: string;
}

export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details?: ApiErrorDetail[];
    requestId?: string;
  };
}

export interface AIAnalyzeRequest {
  text: string;
  location?: string;
  timestamp?: string;
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  actorId: string;
  actorRole: string;
  action: string;
  targetType: 'report' | 'incident' | 'social_post';
  targetId: string;
  reason?: string;
  notes?: string;
  metadata?: Record<string, unknown>;
}

export interface Notification {
  id: string;
  recipientId: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  type: 'status_change' | 'link_created' | 'high_priority' | 'system';
  link?: string;
}

