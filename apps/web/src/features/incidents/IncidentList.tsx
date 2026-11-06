import React, { useEffect, useState } from 'react';
import { Incident, Report, SocialPost } from '@coastwatch/contracts';
import { AlertTriangle, Layers, Link, Megaphone } from 'lucide-react';
import { BroadcastModal } from './BroadcastModal.js';




interface IncidentListProps {
  currentRole: string;
}

export const IncidentList: React.FC<IncidentListProps> = ({ currentRole }) => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [incidentDetails, setIncidentDetails] = useState<{
    incident: Incident;
    reports: Report[];
    socialPosts: SocialPost[];
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [linkingReportId, setLinkingReportId] = useState('');
  const [linkReason, setLinkReason] = useState('');
  const [linkFeedback, setLinkFeedback] = useState<string | null>(null);
  const [isBroadcastOpen, setIsBroadcastOpen] = useState(false);

  const fetchIncidents = () => {
    setLoading(true);
    fetch('/api/incidents')
      .then((res) => res.json())
      .then((json) => {
        if (json.data) {
          setIncidents(json.data);
          if (!selectedIncident && json.data.length > 0) {
            setSelectedIncident(json.data[0]);
          }
        }
      })
      .catch((err) => console.error('Error fetching incidents:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchIncidents();
  }, []);

  useEffect(() => {
    if (!selectedIncident) return;
    fetch(`/api/incidents/${selectedIncident.publicId}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.data) setIncidentDetails(json.data);
      })
      .catch((err) => console.error('Error fetching incident detail:', err));
  }, [selectedIncident]);

  const handleLinkReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIncident || !linkingReportId.trim()) return;

    fetch(`/api/incidents/${selectedIncident.publicId}/link-report`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CoastWatch-Role': currentRole
      },
      body: JSON.stringify({
        reportId: linkingReportId.trim(),
        reason: linkReason.trim() || 'Reviewer manual association'
      })
    })
      .then(async (res) => {
        const json = await res.json();
        if (res.ok) {
          setLinkFeedback(`Report ${linkingReportId} linked successfully to ${selectedIncident.publicId}!`);
          setLinkingReportId('');
          setLinkReason('');
          fetchIncidents();
          if (selectedIncident) {
            setSelectedIncident({ ...selectedIncident });
          }
        } else {
          setLinkFeedback(`Error: ${json.error?.message || 'Failed to link report'}`);
        }
      })
      .catch((err) => setLinkFeedback(`Network error: ${err}`));
  };

  const handleStatusChange = (newStatus: 'investigating' | 'confirmed' | 'dismissed') => {
    if (!selectedIncident) return;
    fetch(`/api/incidents/${selectedIncident.publicId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'X-CoastWatch-Role': currentRole
      },
      body: JSON.stringify({
        reviewStatus: newStatus,
        reason: `Status updated by ${currentRole} in incident workflow`
      })
    })
      .then(async (res) => {
        if (res.ok) {
          fetchIncidents();
          setSelectedIncident({ ...selectedIncident, reviewStatus: newStatus });
        }
      })
      .catch((err) => console.error('Error updating status:', err));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Incidents Master List */}
      <div className="lg:col-span-1 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
            <Layers className="w-4 h-4 text-sky-600" />
            Active Incident Clusters ({incidents.length})
          </h3>
          <span className="text-[11px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-mono">
            Auto-Grouped
          </span>
        </div>

        {loading && <div className="p-4 bg-slate-100 rounded-xl animate-pulse text-xs text-slate-500">Loading clusters...</div>}

        <div className="space-y-2">
          {incidents.map((inc) => {
            const isSelected = selectedIncident?.id === inc.id;
            return (
              <div
                key={inc.id}
                onClick={() => setSelectedIncident(inc)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-sky-50 border-sky-300 shadow-sm ring-1 ring-sky-400'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-mono font-bold text-sky-800">{inc.publicId}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                      inc.reviewStatus === 'confirmed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : inc.reviewStatus === 'investigating'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {inc.reviewStatus}
                  </span>
                </div>
                <h4 className="text-xs font-semibold text-slate-900 mb-1 line-clamp-1">{inc.title}</h4>
                <div className="flex items-center gap-3 text-[11px] text-slate-500">
                  <span>{inc.reportIds.length} Reports</span>
                  <span>•</span>
                  <span>{inc.socialPostIds.length} Social Signals</span>
                  {inc.priorityScore && (
                    <>
                      <span>•</span>
                      <span className="font-semibold text-rose-600">Priority: {inc.priorityScore}</span>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Incident Detail and Link Manager */}
      <div className="lg:col-span-2 space-y-4">
        {selectedIncident ? (
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded">
                    {selectedIncident.publicId}
                  </span>
                  <h3 className="font-bold text-base text-slate-900">{selectedIncident.title}</h3>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Location: {selectedIncident.location?.placeName || 'Multi-point coastal area'}
                </p>
              </div>

              {/* Actions: Broadcast & Status */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsBroadcastOpen(true)}
                  className="px-3 py-1.5 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-lg shadow-sm transition flex items-center gap-1.5"
                >
                  <Megaphone className="w-3.5 h-3.5" />
                  <span>Public Broadcast</span>
                </button>

                {(currentRole === 'reviewer' || currentRole === 'admin') && (
                  <>
                    <button
                      onClick={() => handleStatusChange('confirmed')}
                      className="px-2.5 py-1 text-xs font-medium bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
                    >
                      Confirm Incident
                    </button>
                    <button
                      onClick={() => handleStatusChange('investigating')}
                      className="px-2.5 py-1 text-xs font-medium bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition"
                    >
                      Investigating
                    </button>
                    <button
                      onClick={() => handleStatusChange('dismissed')}
                      className="px-2.5 py-1 text-xs font-medium bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition"
                    >
                      Dismiss
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Incident Priority Reasons */}
            {selectedIncident.priorityReasons && selectedIncident.priorityReasons.length > 0 && (
              <div className="bg-rose-50 border border-rose-200 p-3 rounded-lg text-xs">
                <div className="font-semibold text-rose-800 flex items-center gap-1.5 mb-1">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  Prioritization Rationale (Score: {selectedIncident.priorityScore}/100)
                </div>
                <ul className="list-disc list-inside text-rose-700 space-y-0.5">
                  {selectedIncident.priorityReasons.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Linked Reports Section */}
            <div>
              <h4 className="text-xs font-bold uppercase text-slate-500 tracking-wider mb-2">
                Correlated Citizen Reports ({incidentDetails?.reports.length || 0})
              </h4>
              <div className="space-y-2">
                {incidentDetails?.reports.map((rep) => (
                  <div key={rep.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-[10px] bg-slate-200 px-1 py-0.5 rounded font-bold">{rep.publicId}</span>
                        <span className="font-semibold text-slate-800">{rep.title}</span>
                      </div>
                      <p className="text-slate-600 text-[11px] line-clamp-1">{rep.description}</p>
                    </div>
                    <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-sky-100 text-sky-800">
                      {rep.status}
                    </span>
                  </div>
                ))}
                {(!incidentDetails?.reports || incidentDetails.reports.length === 0) && (
                  <p className="text-xs text-slate-400 italic">No reports linked yet.</p>
                )}
              </div>
            </div>

            {/* Linked Social Signals Section */}
            <div>
              <h4 className="text-xs font-bold uppercase text-slate-500 tracking-wider mb-2">
                Associated Social Signals ({incidentDetails?.socialPosts.length || 0})
              </h4>
              <div className="space-y-2">
                {incidentDetails?.socialPosts.map((post) => (
                  <div key={post.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                    <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                      <span className="font-semibold capitalize text-sky-700">Platform: {post.platform}</span>
                      <span>Sentiment: {post.sentiment || 'neutral'}</span>
                    </div>
                    <p className="text-slate-800 text-[11px] italic">"{post.text}"</p>
                  </div>
                ))}
                {(!incidentDetails?.socialPosts || incidentDetails.socialPosts.length === 0) && (
                  <p className="text-xs text-slate-400 italic">No social posts currently linked.</p>
                )}
              </div>
            </div>

            {/* Associate New Report to Incident */}
            {(currentRole === 'reviewer' || currentRole === 'admin') && (
              <div className="border-t border-slate-100 pt-4">
                <h4 className="text-xs font-bold text-slate-800 mb-2 flex items-center gap-1.5">
                  <Link className="w-3.5 h-3.5 text-sky-600" />
                  Link Another Report to this Incident
                </h4>
                {linkFeedback && (
                  <div className="mb-3 p-2 bg-sky-50 border border-sky-200 rounded text-xs text-sky-800">
                    {linkFeedback}
                  </div>
                )}
                <form onSubmit={handleLinkReport} className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="Report Public ID (e.g. RPT-000003)"
                    value={linkingReportId}
                    onChange={(e) => setLinkingReportId(e.target.value)}
                    className="p-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-sky-500 focus:outline-none"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Reason for linking..."
                    value={linkReason}
                    onChange={(e) => setLinkReason(e.target.value)}
                    className="p-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-sky-500 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="bg-sky-600 text-white rounded text-xs font-semibold py-2 px-3 hover:bg-sky-700 transition"
                  >
                    Confirm Association
                  </button>
                </form>
              </div>
            )}
          </div>
        ) : (
          <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-slate-400 text-xs">
            Select an incident cluster to view linked citizen reports and social observations.
          </div>
        )}
      </div>

      {selectedIncident && (
        <BroadcastModal
          incident={selectedIncident}
          isOpen={isBroadcastOpen}
          onClose={() => setIsBroadcastOpen(false)}
          currentRole={currentRole}
          onDispatched={() => {
            fetchIncidents();
          }}
        />
      )}
    </div>
  );
};


