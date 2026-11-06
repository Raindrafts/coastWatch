import React, { useEffect, useState } from 'react';
import { Report, ReportStatus, AuditEvent } from '@coastwatch/contracts';
import { ShieldCheck, CheckCircle, AlertCircle, History, Sparkles } from 'lucide-react';


interface ReviewQueueProps {
  currentRole: string;
  onReportUpdated?: () => void;
}

export const ReviewQueue: React.FC<ReviewQueueProps> = ({ currentRole, onReportUpdated }) => {
  const [priorityReports, setPriorityReports] = useState<Array<{ report: Report; priorityScore: number; reasons: string[] }>>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [auditHistory, setAuditHistory] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(false);

  // Status transition state
  const [targetStatus, setTargetStatus] = useState<ReportStatus | null>(null);
  const [transitionReason, setTransitionReason] = useState('');
  const [transitionNotes, setTransitionNotes] = useState('');
  const [actionFeedback, setActionFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchQueue = () => {
    setLoading(true);
    fetch('/api/analytics/priority-queue?limit=15')
      .then((res) => res.json())
      .then((json) => {
        if (json.data) {
          setPriorityReports(json.data);
          if (json.data.length > 0 && !selectedReport) {
            setSelectedReport(json.data[0].report);
          }
        }
      })
      .catch((err) => console.error('Error fetching priority queue:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  useEffect(() => {
    if (!selectedReport) return;
    fetch(`/api/reports/${selectedReport.publicId}/audit`)
      .then((res) => res.json())
      .then((json) => {
        if (json.data) setAuditHistory(json.data);
      })
      .catch((err) => console.error('Error fetching audit history:', err));
  }, [selectedReport]);

  const handleApplyTransition = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReport || !targetStatus) return;

    if ((targetStatus === 'verified' || targetStatus === 'rejected') && !transitionReason.trim()) {
      setActionFeedback({ type: 'error', message: 'A clear reason is mandatory for verifying or rejecting a report.' });
      return;
    }

    fetch(`/api/reports/${selectedReport.publicId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'X-CoastWatch-Role': currentRole
      },
      body: JSON.stringify({
        status: targetStatus,
        reason: transitionReason.trim() || undefined,
        notes: transitionNotes.trim() || undefined
      })
    })
      .then(async (res) => {
        const json = await res.json();
        if (res.ok) {
          setActionFeedback({
            type: 'success',
            message: `Report ${selectedReport.publicId} status transitioned to '${targetStatus}'.`
          });
          setSelectedReport(json.data.report);
          setTargetStatus(null);
          setTransitionReason('');
          setTransitionNotes('');
          fetchQueue();
          if (onReportUpdated) onReportUpdated();
        } else {
          setActionFeedback({
            type: 'error',
            message: json.error?.message || 'Failed to update report status.'
          });
        }
      })
      .catch((err) => setActionFeedback({ type: 'error', message: `Network error: ${err}` }));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Priority Queue List */}
      <div className="lg:col-span-1 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Priority Triage Queue ({priorityReports.length})
          </h3>
          <span className="text-[11px] bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full font-semibold">
            Advisory Triage
          </span>
        </div>

        {loading && <div className="p-4 bg-slate-100 rounded-xl animate-pulse text-xs text-slate-500">Loading priority items...</div>}

        <div className="space-y-2">
          {priorityReports.map(({ report, priorityScore, reasons }) => {
            const isSelected = selectedReport?.id === report.id;
            return (
              <div
                key={report.id}
                onClick={() => setSelectedReport(report)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-sky-50 border-sky-300 shadow-sm ring-1 ring-sky-400'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-mono font-bold text-slate-800">{report.publicId}</span>
                  <span className="font-bold text-rose-600 text-[11px]">Score: {priorityScore}</span>
                </div>
                <h4 className="text-xs font-semibold text-slate-900 mb-1 line-clamp-1">{report.title}</h4>
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span className="capitalize">{report.hazardType.replace('_', ' ')}</span>
                  <span className="uppercase text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                    {report.status}
                  </span>
                </div>
                {reasons.length > 0 && (
                  <p className="mt-1.5 text-[10px] text-slate-500 line-clamp-1">
                    {reasons[0]}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Review & Transition Inspector */}
      <div className="lg:col-span-2 space-y-4">
        {selectedReport ? (
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-5">
            {/* Header and Details */}
            <div className="border-b border-slate-100 pb-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-sky-800 bg-sky-50 px-2 py-0.5 rounded">
                  {selectedReport.publicId}
                </span>
                <span className="text-xs text-slate-400">
                  Reported: {new Date(selectedReport.createdAt).toLocaleString()}
                </span>
              </div>
              <h3 className="font-bold text-base text-slate-900 mt-2">{selectedReport.title}</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200">
                {selectedReport.description}
              </p>
            </div>

            {/* AI Explainability & Analysis Card */}
            {selectedReport.aiAnalysis && (
              <div className="bg-gradient-to-br from-indigo-50/50 to-sky-50/50 border border-indigo-100 p-4 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-900">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    AI Advisory Classification & Explainability
                  </div>
                  <span className="text-[11px] font-mono text-indigo-700 bg-indigo-100/60 px-2 py-0.5 rounded">
                    Confidence: {Math.round(selectedReport.aiAnalysis.confidence * 100)}%
                  </span>
                </div>
                <p className="text-xs text-indigo-950 font-medium">{selectedReport.aiAnalysis.explanation}</p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {selectedReport.aiAnalysis.keywords.map((kw, i) => (
                    <span key={i} className="text-[10px] bg-white/80 text-indigo-700 px-2 py-0.5 rounded border border-indigo-200">
                      #{kw}
                    </span>
                  ))}
                  <span className="text-[10px] text-slate-400 ml-auto">
                    Model: {selectedReport.aiAnalysis.modelVersion || '0.1.0'}
                  </span>
                </div>
              </div>
            )}

            {/* Current Status and Review Actions */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold uppercase text-slate-500 tracking-wider">
                  Reviewer Workflow Actions
                </h4>
                <span className="text-xs text-slate-500">
                  Current Status: <strong className="uppercase text-slate-800">{selectedReport.status}</strong>
                </span>
              </div>

              {actionFeedback && (
                <div
                  className={`p-3 rounded-lg text-xs mb-3 flex items-center gap-2 ${
                    actionFeedback.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}
                >
                  {actionFeedback.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  {actionFeedback.message}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setTargetStatus('under_review')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    targetStatus === 'under_review'
                      ? 'bg-amber-600 text-white'
                      : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
                  }`}
                >
                  Mark Under Review
                </button>
                <button
                  type="button"
                  onClick={() => setTargetStatus('verified')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    targetStatus === 'verified'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                  }`}
                >
                  Verify Incident
                </button>
                <button
                  type="button"
                  onClick={() => setTargetStatus('needs_information')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    targetStatus === 'needs_information'
                      ? 'bg-sky-600 text-white'
                      : 'bg-sky-50 text-sky-800 hover:bg-sky-100 border border-sky-200'
                  }`}
                >
                  Request Info
                </button>
                <button
                  type="button"
                  onClick={() => setTargetStatus('rejected')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    targetStatus === 'rejected'
                      ? 'bg-rose-600 text-white'
                      : 'bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200'
                  }`}
                >
                  Reject Report
                </button>
              </div>

              {/* Transition Form Dialog */}
              {targetStatus && (
                <form onSubmit={handleApplyTransition} className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                    <span>
                      Transitioning to: <span className="uppercase text-sky-700">{targetStatus}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setTargetStatus(null)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      Cancel
                    </button>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Reason {(targetStatus === 'verified' || targetStatus === 'rejected') && <span className="text-rose-500">* (Mandatory)</span>}
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Confirmed against local sensor telemetry..."
                      value={transitionReason}
                      onChange={(e) => setTransitionReason(e.target.value)}
                      className="w-full text-xs p-2 border border-slate-300 rounded focus:ring-1 focus:ring-sky-500 focus:outline-none"
                      required={targetStatus === 'verified' || targetStatus === 'rejected'}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Internal Notes (Optional)</label>
                    <input
                      type="text"
                      placeholder="Action plan or reviewer dispatch notes..."
                      value={transitionNotes}
                      onChange={(e) => setTransitionNotes(e.target.value)}
                      className="w-full text-xs p-2 border border-slate-300 rounded focus:ring-1 focus:ring-sky-500 focus:outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-slate-900 text-white text-xs font-bold py-2 rounded hover:bg-slate-800 transition"
                  >
                    Commit Status Transition & Create Audit Record
                  </button>
                </form>
              )}
            </div>

            {/* Audit History Log */}
            <div>
              <h4 className="text-xs font-bold uppercase text-slate-500 tracking-wider mb-2 flex items-center gap-1.5">
                <History className="w-3.5 h-3.5" />
                Immutable Audit Trail ({auditHistory.length})
              </h4>
              <div className="space-y-1.5">
                {auditHistory.map((aud) => (
                  <div key={aud.id} className="p-2.5 bg-slate-50 rounded border border-slate-200 text-xs flex justify-between items-center">
                    <div>
                      <span className="font-semibold text-slate-800">{aud.action}</span>
                      {aud.reason && <p className="text-slate-600 text-[11px]">{aud.reason}</p>}
                    </div>
                    <div className="text-right text-[10px] text-slate-400">
                      <div>{aud.actorRole} ({aud.actorId})</div>
                      <div>{new Date(aud.timestamp).toLocaleTimeString()}</div>
                    </div>
                  </div>
                ))}
                {auditHistory.length === 0 && (
                  <p className="text-xs text-slate-400 italic">No audit records logged yet.</p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-slate-400 text-xs">
            Select a priority hazard report to review evidence and adjust review status.
          </div>
        )}
      </div>
    </div>
  );
};
