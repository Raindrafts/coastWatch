import React, { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts';
import { UploadCloud, CheckCircle2, AlertCircle, Download, ArrowRight } from 'lucide-react';
import { SocialPost } from '@coastwatch/contracts';


export const SocialAnalytics: React.FC = () => {
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [socialStats, setSocialStats] = useState<{
    total: number;
    relevant: number;
    irrelevant: number;
    byHazard: Array<{ hazardType: string; count: number }>;
    topKeywords: Array<{ keyword: string; count: number }>;
  } | null>(null);

  // CSV Import state
  const [csvText, setCsvText] = useState('');
  const [previewToken, setPreviewToken] = useState<string | null>(null);
  const [previewSummary, setPreviewSummary] = useState<{
    validRows: number;
    invalidRows: number;
    duplicateRows: number;
    rows: Array<{ rowNumber: number; valid: boolean; errors?: string[] }>;
  } | null>(null);
  const [importMessage, setImportMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchSocialData = () => {
    fetch('/api/social/posts?limit=30')
      .then((res) => res.json())
      .then((json) => {
        if (json.data) setPosts(json.data);
      })
      .catch((err) => console.error('Error fetching social posts:', err));

    fetch('/api/analytics/social')
      .then((res) => res.json())
      .then((json) => {
        if (json.data) setSocialStats(json.data);
      })
      .catch((err) => console.error('Error fetching social stats:', err));
  };

  useEffect(() => {
    fetchSocialData();
  }, []);

  // CSV Preview Request
  const handlePreview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvText.trim()) return;

    setLoading(true);
    setImportMessage(null);

    fetch('/api/social/import/preview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ csv: csvText })
    })
      .then(async (res) => {
        const json = await res.json();
        if (res.ok) {
          setPreviewToken(json.data.previewToken);
          setPreviewSummary(json.data);
          setImportMessage({
            type: 'success',
            text: `Preview verified: ${json.data.validRows} valid rows, ${json.data.duplicateRows} duplicates, ${json.data.invalidRows} errors.`
          });
        } else {
          setImportMessage({ type: 'error', text: json.error?.message || 'CSV validation failed.' });
        }
      })
      .catch((err) => setImportMessage({ type: 'error', text: `Network error: ${err}` }))
      .finally(() => setLoading(false));
  };

  // CSV Commit Request
  const handleCommit = () => {
    if (!previewToken) return;

    setLoading(true);
    fetch('/api/social/import/commit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ previewToken })
    })
      .then(async (res) => {
        const json = await res.json();
        if (res.ok) {
          setImportMessage({
            type: 'success',
            text: `Successfully committed ${json.data.created} social signals into the database.`
          });
          setCsvText('');
          setPreviewToken(null);
          setPreviewSummary(null);
          fetchSocialData();
        } else {
          setImportMessage({ type: 'error', text: json.error?.message || 'Failed to commit import.' });
        }
      })
      .catch((err) => setImportMessage({ type: 'error', text: `Commit error: ${err}` }))
      .finally(() => setLoading(false));
  };

  const handleDownloadTemplate = () => {
    window.open('/api/social/import/template', '_blank');
  };

  const hazardChartData = socialStats?.byHazard.map((item) => ({
    name: item.hazardType.replace('_', ' '),
    count: item.count
  })) || [];

  return (
    <div className="space-y-6">
      {/* Top Aggregates & Visualizations */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-bold uppercase text-slate-500 tracking-wider">Social Signals Volume</h4>
            <div className="text-3xl font-black text-slate-900 mt-2">{socialStats?.total || posts.length}</div>
            <div className="text-xs text-slate-500 mt-1">
              <span className="font-semibold text-emerald-600">{socialStats?.relevant || 0}</span> classified hazard-relevant
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap gap-1.5">
            {socialStats?.topKeywords.map((kw, i) => (
              <span key={i} className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono">
                #{kw.keyword} ({kw.count})
              </span>
            ))}
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm md:col-span-2">
          <h4 className="text-xs font-bold uppercase text-slate-500 tracking-wider mb-2">
            Social Hazard Topic Distribution
          </h4>
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hazardChartData}>
                <XAxis dataKey="name" fontSize={11} stroke="#64748b" />
                <YAxis fontSize={11} stroke="#64748b" allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="count" fill="#0284c7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* CSV Ingestion Engine */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <UploadCloud className="w-5 h-5 text-sky-600" />
            <h3 className="font-semibold text-slate-800 text-sm">Bulk Social Signal CSV Import</h3>
          </div>
          <button
            onClick={handleDownloadTemplate}
            className="flex items-center gap-1.5 text-xs text-sky-700 hover:text-sky-800 font-semibold bg-sky-50 px-3 py-1.5 rounded-lg border border-sky-200 transition"
          >
            <Download className="w-3.5 h-3.5" />
            Download Standard CSV Template
          </button>
        </div>

        <p className="text-xs text-slate-500 mb-3">
          Upload or paste CSV text with headers: <code>post_id, platform, text, created_at, latitude, longitude</code>.
          Preview tokens ensure atomic validation before committing to analytical indices.
        </p>

        {importMessage && (
          <div
            className={`p-3 rounded-lg text-xs mb-3 flex items-center gap-2 ${
              importMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            {importMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
            <span>{importMessage.text}</span>
          </div>
        )}

        <form onSubmit={handlePreview} className="space-y-3">
          <textarea
            value={csvText}
            onChange={(e) => setCsvText(e.target.value)}
            placeholder={`post_id,platform,text,created_at,latitude,longitude
tw_sample_01,twitter,"Waves surging over seawall near harbor",2026-10-14T04:00:00Z,13.08,80.29`}
            rows={4}
            className="w-full text-xs font-mono p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
          />

          <div className="flex items-center justify-between">
            <button
              type="submit"
              disabled={loading || !csvText.trim()}
              className="bg-slate-900 text-white text-xs font-bold py-2 px-4 rounded-lg hover:bg-slate-800 disabled:opacity-50 transition"
            >
              {loading ? 'Validating Schema...' : 'Verify & Preview Batch'}
            </button>

            {previewToken && previewSummary && (
              <button
                type="button"
                onClick={handleCommit}
                disabled={loading || previewSummary.validRows === 0}
                className="bg-emerald-600 text-white text-xs font-bold py-2 px-5 rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition flex items-center gap-1.5"
              >
                <span>Commit {previewSummary.validRows} Valid Rows</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Recent Ingested Feed */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
        <h4 className="text-xs font-bold uppercase text-slate-500 tracking-wider">
          Ingested Social Signals Feed ({posts.length})
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {posts.map((post) => (
            <div key={post.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="font-semibold text-sky-800 capitalize">Platform: {post.platform}</span>
                  <span className="font-mono text-[10px] text-slate-400">
                    {post.createdAt ? new Date(post.createdAt).toLocaleTimeString() : 'N/A'}
                  </span>
                </div>
                <p className="text-slate-800 leading-snug">"{post.text}"</p>
              </div>
              <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-500">
                <span className="capitalize bg-white px-1.5 py-0.5 rounded border border-slate-200">
                  {post.predictedHazardType ? post.predictedHazardType.replace('_', ' ') : 'unclassified'}
                </span>
                {post.confidence && <span>AI Conf: {Math.round(post.confidence * 100)}%</span>}
                <span className="uppercase font-bold text-slate-400">{post.sourceMode}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
