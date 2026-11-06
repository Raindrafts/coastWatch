import React, { useEffect, useState } from 'react';
import {
  Waves, ShieldAlert, BarChart3, MapPin, PlusCircle, CheckCircle2,
  Bell, AlertTriangle, Layers, ShieldCheck, Filter, Search, UserCheck
} from 'lucide-react';
import { HazardMap } from './features/map/HazardMap.js';
import { SocialAnalytics } from './features/social/SocialAnalytics.js';
import { IncidentList } from './features/incidents/IncidentList.js';
import { ReviewQueue } from './features/review/ReviewQueue.js';
import { Report, HazardType, Notification } from '@coastwatch/contracts';

type ActiveTab = 'map' | 'report' | 'incidents' | 'social' | 'review';
type UserRole = 'reporter' | 'analyst' | 'reviewer' | 'admin';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('map');
  const [currentRole, setCurrentRole] = useState<UserRole>('reviewer');
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedHazard, setSelectedHazard] = useState<HazardType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [summary, setSummary] = useState({
    totalReports: 0,
    activeIncidents: 0,
    awaitingReview: 0,
    highPriorityReports: 0
  });

  // Notifications State
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifs, setShowNotifs] = useState(false);

  // Citizen Report Form State
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newHazard, setNewHazard] = useState<HazardType>('coastal_flooding');
  const [newSeverity, setNewSeverity] = useState<'low' | 'medium' | 'high' | 'critical'>('high');
  const [newLat, setNewLat] = useState('13.0475');
  const [newLng, setNewLng] = useState('80.2824');
  const [newPlace, setNewPlace] = useState('Marina Beach');
  const [acknowledged, setAcknowledged] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitFeedback, setSubmitFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchReportsAndSummary = () => {
    fetch('/api/reports')
      .then((res) => res.json())
      .then((json) => {
        if (json.data) setReports(json.data);
      })
      .catch((err) => console.error('Error fetching reports:', err));

    fetch('/api/dashboard/summary')
      .then((res) => res.json())
      .then((json) => {
        if (json.data) setSummary(json.data);
      })
      .catch((err) => console.error('Error fetching summary:', err));

    fetch('/api/notifications')
      .then((res) => res.json())
      .then((json) => {
        if (json.data) setNotifications(json.data);
      })
      .catch((err) => console.error('Error fetching notifications:', err));
  };

  useEffect(() => {
    fetchReportsAndSummary();
  }, []);

  const handleMarkNotifRead = (id: string) => {
    fetch(`/api/notifications/${id}/read`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' }
    })
      .then(() => {
        setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
      })
      .catch((err) => console.error('Error marking read:', err));
  };

  const handleGeolocate = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setNewLat(pos.coords.latitude.toFixed(4));
          setNewLng(pos.coords.longitude.toFixed(4));
          setNewPlace('Current GPS Device Location');
        },
        () => {
          // Default to Chennai Marina coastal coordinate if denied
          setNewLat('13.0475');
          setNewLng('80.2824');
          setNewPlace('Marina Beach, Chennai');
        }
      );
    }
  };

  const handleSubmitReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDesc.trim()) return;

    if (newDesc.trim().length < 20) {
      setSubmitFeedback({ type: 'error', message: 'Description must be at least 20 characters long.' });
      return;
    }

    setSubmitting(true);
    setSubmitFeedback(null);

    const payload = {
      title: newTitle.trim(),
      description: newDesc.trim(),
      hazardType: newHazard,
      reportedSeverity: newSeverity,
      latitude: newLat ? parseFloat(newLat) : undefined,
      longitude: newLng ? parseFloat(newLng) : undefined,
      placeName: newPlace || 'Reported Coastal Location',
      acknowledged
    };

    fetch('/api/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(async (res) => {
        const json = await res.json();
        if (res.ok && json.data?.report) {
          setReports((prev) => [json.data.report, ...prev]);
          setSubmitFeedback({
            type: 'success',
            message: `Report filed successfully! Reference ID: ${json.data.report.publicId}. An analyst will review this observation.`
          });
          setNewTitle('');
          setNewDesc('');
          fetchReportsAndSummary();
        } else {
          setSubmitFeedback({
            type: 'error',
            message: json.error?.message || 'Failed to submit report.'
          });
        }
      })
      .catch((err) => setSubmitFeedback({ type: 'error', message: `Submission error: ${err}` }))
      .finally(() => setSubmitting(false));
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filteredReports = reports.filter((r) => {
    const matchesHazard = selectedHazard === 'all' || r.hazardType === selectedHazard;
    const matchesSearch =
      !searchQuery.trim() ||
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.publicId.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesHazard && matchesSearch;
  });

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 font-sans">
      {/* Top Navigation Bar */}
      <header className="bg-slate-900 border-b border-slate-800 text-white px-6 py-3.5 flex flex-wrap items-center justify-between sticky top-0 z-50 shadow-md">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-tr from-sky-500 to-cyan-400 rounded-lg text-slate-950 font-black shadow-sm">
            <Waves className="w-5 h-5 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black tracking-tight bg-gradient-to-r from-white via-sky-100 to-sky-300 bg-clip-text text-transparent">
                CoastWatch
              </h1>
              <span className="text-[10px] font-semibold bg-sky-950 text-sky-400 border border-sky-800 px-2 py-0.5 rounded-full uppercase">
                Prototype v1.0
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Crowdsourced Ocean Hazards & Social Signal Intelligence</p>
          </div>
        </div>

        {/* Primary Navigation Tabs */}
        <nav className="flex items-center gap-1.5 my-2 sm:my-0">
          <button
            onClick={() => setActiveTab('map')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'map' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Map & Explorer</span>
          </button>
          <button
            onClick={() => setActiveTab('report')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'report' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Submit Report</span>
          </button>
          <button
            onClick={() => setActiveTab('incidents')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'incidents' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Incident Clusters</span>
          </button>
          <button
            onClick={() => setActiveTab('social')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'social' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Social Signals & CSV</span>
          </button>
          <button
            onClick={() => setActiveTab('review')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'review' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Reviewer Queue</span>
          </button>
        </nav>

        {/* Role Selector & Notifications */}
        <div className="flex items-center gap-3">
          {/* Notifications Button */}
          <div className="relative">
            <button
              onClick={() => setShowNotifs(!showNotifs)}
              className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 relative transition"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white font-bold text-[9px] w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifs && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 z-50 p-3 text-slate-800">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
                  <span className="text-xs font-bold text-slate-900">Notifications ({unreadCount} unread)</span>
                  <button onClick={() => setShowNotifs(false)} className="text-[11px] text-slate-400 hover:text-slate-600">
                    Close
                  </button>
                </div>
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => handleMarkNotifRead(n.id)}
                      className={`p-2 rounded-lg text-xs cursor-pointer transition ${
                        n.read ? 'bg-slate-50 text-slate-500' : 'bg-sky-50 text-slate-800 font-medium'
                      }`}
                    >
                      <div className="font-semibold text-slate-900">{n.title}</div>
                      <p className="text-[11px] text-slate-600 mt-0.5">{n.message}</p>
                    </div>
                  ))}
                  {notifications.length === 0 && (
                    <p className="text-xs text-slate-400 text-center py-2">No notifications</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Development Role Selector */}
          <div className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700">
            <UserCheck className="w-3.5 h-3.5 text-sky-400" />
            <select
              value={currentRole}
              onChange={(e) => setCurrentRole(e.target.value as UserRole)}
              className="bg-transparent text-xs font-medium text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="reporter" className="bg-slate-900 text-white">Public Reporter</option>
              <option value="analyst" className="bg-slate-900 text-white">Analyst</option>
              <option value="reviewer" className="bg-slate-900 text-white">Reviewer</option>
              <option value="admin" className="bg-slate-900 text-white">Administrator</option>
            </select>
          </div>
        </div>
      </header>

      {/* Mandatory Safety Notice / Disclaimer Banner */}
      <div className="bg-amber-500/10 border-b border-amber-500/20 px-6 py-2 text-xs text-amber-900 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            <strong>RESEARCH & DEMO PROTOCOL:</strong> AI classifications and crowdsourced signals are advisory triage indications. Never treat unverified citizen reports as official evacuation orders or government bulletins.
          </span>
        </div>
        <span className="font-mono text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-bold uppercase">
          Advisory Mode
        </span>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">
        {/* KPI Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Reports</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{summary.totalReports || reports.length}</h3>
            </div>
            <div className="p-2.5 bg-sky-50 rounded-lg text-sky-600">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Incidents</p>
              <h3 className="text-2xl font-black text-emerald-600 mt-1">{summary.activeIncidents}</h3>
            </div>
            <div className="p-2.5 bg-emerald-50 rounded-lg text-emerald-600">
              <Layers className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Awaiting Review</p>
              <h3 className="text-2xl font-black text-amber-600 mt-1">{summary.awaitingReview}</h3>
            </div>
            <div className="p-2.5 bg-amber-50 rounded-lg text-amber-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Critical Signals</p>
              <h3 className="text-2xl font-black text-rose-600 mt-1">{summary.highPriorityReports}</h3>
            </div>
            <div className="p-2.5 bg-rose-50 rounded-lg text-rose-600">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Tab 1: Map & Explorer View */}
        {activeTab === 'map' && (
          <div className="space-y-6">
            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <Filter className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Filter Hazard:</span>
                {(['all', 'coastal_flooding', 'high_waves', 'oil_spill', 'coastal_erosion', 'marine_debris'] as const).map(
                  (hazard) => (
                    <button
                      key={hazard}
                      onClick={() => setSelectedHazard(hazard)}
                      className={`px-3 py-1 text-xs rounded-full font-semibold transition ${
                        selectedHazard === hazard
                          ? 'bg-sky-600 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {hazard === 'all' ? 'All Hazards' : hazard.replace('_', ' ')}
                    </button>
                  )
                )}
              </div>

              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search reports or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-sky-500 focus:outline-none w-56"
                />
              </div>
            </div>

            {/* Interactive Leaflet Map */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <HazardMap reports={filteredReports} selectedHazard={selectedHazard} />
            </div>

            {/* Reports List Explorer */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-800 text-sm">
                  Ocean Hazard Observations Feed ({filteredReports.length})
                </h3>
                <span className="text-xs text-slate-500">Live API Synchronized</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredReports.map((report) => (
                  <div
                    key={report.id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-sky-300 hover:shadow-sm transition flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="font-mono text-sky-800 bg-sky-100 px-2 py-0.5 rounded font-bold">
                          {report.publicId}
                        </span>
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                            report.reportedSeverity === 'critical'
                              ? 'bg-rose-100 text-rose-800'
                              : report.reportedSeverity === 'high'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {report.reportedSeverity}
                        </span>
                      </div>
                      <h4 className="font-bold text-xs text-slate-900 line-clamp-1">{report.title}</h4>
                      <p className="text-slate-600 text-xs mt-1 line-clamp-2">{report.description}</p>
                    </div>

                    <div className="border-t border-slate-200/70 pt-2 space-y-1.5 text-[11px] text-slate-500">
                      <div className="flex items-center justify-between">
                        <span className="capitalize font-semibold text-sky-700">
                          {report.hazardType.replace('_', ' ')}
                        </span>
                        <span className="font-mono">{report.location?.placeName || 'Coordinates Pending'}</span>
                      </div>
                      {report.aiAnalysis && (
                        <div className="bg-indigo-50 text-indigo-900 p-1.5 rounded text-[10px] flex items-center justify-between">
                          <span>AI: {report.aiAnalysis.hazardType.replace('_', ' ')}</span>
                          <span className="font-bold">Conf: {Math.round(report.aiAnalysis.confidence * 100)}%</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Submit Citizen Report Form */}
        {activeTab === 'report' && (
          <div className="max-w-2xl mx-auto bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
            <div>
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-sky-600" />
                Crowdsourced Marine Hazard Incident Report
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Submit observed coastal hazards for automated AI triage and verification by coastal authorities.
              </p>
            </div>

            {submitFeedback && (
              <div
                className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
                  submitFeedback.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                {submitFeedback.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                )}
                <span>{submitFeedback.message}</span>
              </div>
            )}

            <form onSubmit={handleSubmitReport} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Incident Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Unusual 3-meter surge flooding boardwalk"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-sky-500 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Primary Hazard Category <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={newHazard}
                    onChange={(e) => setNewHazard(e.target.value as HazardType)}
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-sky-500 focus:outline-none bg-white cursor-pointer"
                  >
                    <option value="coastal_flooding">Coastal Flooding / Surge</option>
                    <option value="high_waves">Dangerous High Waves</option>
                    <option value="oil_spill">Petrochemical / Oil Spill</option>
                    <option value="coastal_erosion">Coastal Erosion / Bluff Collapse</option>
                    <option value="marine_debris">Marine Debris & Entanglement</option>
                    <option value="other">Other Marine Hazard</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Perceived Severity</label>
                  <select
                    value={newSeverity}
                    onChange={(e) => setNewSeverity(e.target.value as any)}
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-sky-500 focus:outline-none bg-white cursor-pointer"
                  >
                    <option value="low">Low - Minor Observation</option>
                    <option value="medium">Medium - Potential Hazard</option>
                    <option value="high">High - Immediate Danger</option>
                    <option value="critical">Critical - Emergency Surging</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Detailed Description (Min. 20 chars) <span className="text-rose-500">*</span>
                </label>
                <textarea
                  placeholder="Provide precise details of water levels, affected structures, ongoing risk, or visible environmental damage..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  rows={4}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-sky-500 focus:outline-none"
                  required
                />
              </div>

              {/* Coordinates Section */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-sky-600" />
                    Geolocation Coordinates
                  </span>
                  <button
                    type="button"
                    onClick={handleGeolocate}
                    className="text-[11px] text-sky-700 hover:text-sky-800 font-semibold underline"
                  >
                    Use Browser Geolocation
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="Latitude (e.g. 13.0475)"
                    value={newLat}
                    onChange={(e) => setNewLat(e.target.value)}
                    className="text-xs p-2 border border-slate-300 rounded focus:ring-1 focus:ring-sky-500 focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Longitude (e.g. 80.2824)"
                    value={newLng}
                    onChange={(e) => setNewLng(e.target.value)}
                    className="text-xs p-2 border border-slate-300 rounded focus:ring-1 focus:ring-sky-500 focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Place Name"
                    value={newPlace}
                    onChange={(e) => setNewPlace(e.target.value)}
                    className="text-xs p-2 border border-slate-300 rounded focus:ring-1 focus:ring-sky-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Terms Acknowledgement */}
              <div className="flex items-start gap-2 pt-1">
                <input
                  type="checkbox"
                  id="ack"
                  checked={acknowledged}
                  onChange={(e) => setAcknowledged(e.target.checked)}
                  className="mt-0.5 rounded text-sky-600 focus:ring-sky-500 cursor-pointer"
                  required
                />
                <label htmlFor="ack" className="text-[11px] text-slate-600 cursor-pointer leading-tight">
                  I confirm this observation is truthful to the best of my knowledge and understand that submission data is shared with coastal emergency reviewers under the CoastWatch protocol.
                </label>
              </div>

              <button
                type="submit"
                disabled={submitting || !acknowledged}
                className="w-full bg-sky-600 text-white font-bold text-xs py-3 rounded-xl hover:bg-sky-700 disabled:opacity-50 transition shadow-sm"
              >
                {submitting ? 'Submitting & Initiating AI Triage...' : 'Transmit Hazard Report'}
              </button>
            </form>
          </div>
        )}

        {/* Tab 3: Incidents & Association */}
        {activeTab === 'incidents' && <IncidentList currentRole={currentRole} />}

        {/* Tab 4: Social Signals & CSV Engine */}
        {activeTab === 'social' && <SocialAnalytics />}

        {/* Tab 5: Reviewer Triage Queue */}
        {activeTab === 'review' && (
          <ReviewQueue currentRole={currentRole} onReportUpdated={fetchReportsAndSummary} />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 text-xs py-6 px-6 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Waves className="w-4 h-4 text-sky-400" />
            <span className="font-bold text-slate-200">CoastWatch Integrated Marine Hazard Platform</span>
            <span>•</span>
            <span>Demo Mode</span>
          </div>
          <p className="text-[11px]">
            Designed for Coastal Disaster Risk Reduction • Synchronized Shared Contracts & Fast AI Inference
          </p>
        </div>
      </footer>
    </div>
  );
};
