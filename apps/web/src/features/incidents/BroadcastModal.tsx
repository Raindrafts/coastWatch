import React, { useState } from 'react';
import { Incident } from '@coastwatch/contracts';
import { Megaphone, Copy, Check, Radio, Send, X, ShieldAlert, Globe, MessageSquare } from 'lucide-react';

interface BroadcastModalProps {
  incident: Incident;
  isOpen: boolean;
  onClose: () => void;
  onDispatched?: () => void;
  currentRole: string;
}

type Channel = 'sms' | 'social' | 'siren';
type Language = 'en' | 'ta' | 'hi' | 'te';

export const BroadcastModal: React.FC<BroadcastModalProps> = ({
  incident,
  isOpen,
  onClose,
  onDispatched,
  currentRole
}) => {
  const [channel, setChannel] = useState<Channel>('sms');
  const [language, setLanguage] = useState<Language>('en');
  const [radiusKm, setRadiusKm] = useState(10);
  const [copied, setCopied] = useState(false);
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  if (!isOpen) return null;

  const place = incident.location?.placeName || 'coastal sector';
  const hazardName = incident.hazardType.replace('_', ' ');

  // Template generator based on channel and language
  const getTemplate = (chan: Channel, lang: Language): string => {
    if (chan === 'sms') {
      switch (lang) {
        case 'ta':
          return `[கடலோர எச்சரிக்கை] ${place} பகுதியில் ${hazardName} ஏற்பட்டுள்ளது. கடற்கரையை விட்டு விலகி பாதுகாப்பான இடத்திற்கு செல்லவும். அவசர எண்: 112 / 1070.`;
        case 'hi':
          return `[तटीय चेतावनी] ${place} में ${hazardName} की स्थिति। तट से दूर रहें और सुरक्षित ऊंचे स्थानों पर जाएं। आपातकालीन नंबर: 112.`;
        case 'te':
          return `[తీరప్రాంత హెచ్చరిక] ${place} వద్ద ${hazardName} పరిస్థితి. తీరానికి దూరంగా సురక్షిత ప్రాంతాలకు వెళ్లండి. హెల్ప్‌లైన్: 112.`;
        default:
          return `[COASTWATCH ALERT] High-risk ${hazardName} confirmed near ${place}. Stay clear of shoreline & follow local authorities. Emergency: 112.`;
      }
    } else if (chan === 'social') {
      switch (lang) {
        case 'ta':
          return `🚨 அவசர கடலோர எச்சரிக்கை: ${place} பகுதியில் தீவிர ${hazardName} கண்காணிக்கப்படுகிறது. பொதுமக்கள் கடற்கரைக்கு செல்வதை தவிர்க்கவும். #CoastWatch #கடலோரஎச்சரிக்கை #${hazardName.replace(' ', '')}`;
        case 'hi':
          return `🚨 तटीय आपातकालीन चेतावनी: ${place} में ${hazardName} की पुष्टि हुई है। सभी नागरिक समुद्र तट से दूर रहें और सुरक्षा निर्देशों का पालन करें। #CoastWatch #DisasterAlert`;
        case 'te':
          return `🚨 తీరప్రాంత అత్యవసర హెచ్చరిక: ${place} లో ${hazardName} తీవ్రత దృష్ట్యా ప్రజలు అప్రమత్తంగా ఉండాలి. #CoastWatch #EmergencyAlert`;
        default:
          return `🚨 COASTAL SAFETY ALERT: Confirmed ${hazardName} event in progress near ${place}. Avoid coastal promenades and low-lying beachfronts. Incident ID: ${incident.publicId}. Report updates: https://coastwatch.local #MarineSafety #CoastWatch #${incident.hazardType}`;
      }
    } else {
      // Siren / Public Address transcript
      switch (lang) {
        case 'ta':
          return `கவனம்! கடலோர பாதுகாப்பு அறிவிப்பு! ${place} பகுதியில் கடல் அலைகள் சீற்றமாக உள்ளன. மீனவர்கள் மற்றும் பொதுமக்கள் உடனே கடற்கரையிலிருந்து வெளியேறவும்.`;
        case 'hi':
          return `ध्यान दें! तटीय आपदा चेतावनी! ${place} क्षेत्र में समुद्र का जलस्तर बढ़ रहा है। कृपया तुरंत तट खाली करें और सुरक्षित स्थान पर जाएं।`;
        case 'te':
          return `గమనిక! తీరప్రాంత రక్షణ హెచ్చరిక! ${place} వద్ద ప్రమాదకర అలల ఉధృతి ఉంది. తక్షణమే తీరం ఖాళీ చేయండి.`;
        default:
          return `ATTENTION ALL CITIZENS. Coastal warning in effect for ${place}. A severe ${hazardName} hazard has been confirmed. Evacuate beaches immediately and follow disaster response wardens.`;
      }
    }
  };

  const messageText = getTemplate(channel, language);

  const handleCopy = () => {
    navigator.clipboard.writeText(messageText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDispatch = () => {
    setSending(true);
    setFeedback(null);

    fetch(`/api/incidents/${incident.publicId}/broadcast`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CoastWatch-Role': currentRole
      },
      body: JSON.stringify({
        channel,
        language,
        message: messageText,
        audienceRadiusKm: radiusKm
      })
    })
      .then(async (res) => {
        const json = await res.json();
        if (res.ok) {
          setFeedback({
            type: 'success',
            message: `Official ${channel.toUpperCase()} broadcast dispatched across ${radiusKm}km radius! Audit log updated.`
          });
          if (onDispatched) onDispatched();
        } else {
          setFeedback({
            type: 'error',
            message: json.error?.message || 'Failed to dispatch broadcast'
          });
        }
      })
      .catch((err) => setFeedback({ type: 'error', message: `Network error: ${err}` }))
      .finally(() => setSending(false));
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 text-white p-5 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rose-500/20 text-rose-400 rounded-xl border border-rose-500/30">
              <Megaphone className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono bg-rose-500/30 text-rose-300 border border-rose-400/40 px-2 py-0.5 rounded uppercase font-bold">
                  Emergency Broadcast
                </span>
                <span className="text-xs text-slate-400 font-mono">{incident.publicId}</span>
              </div>
              <h3 className="font-bold text-base text-white mt-0.5">{incident.title}</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {/* Channel Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              1. Distribution Channel
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setChannel('sms')}
                className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition ${
                  channel === 'sms'
                    ? 'bg-sky-50 border-sky-500 text-sky-900 ring-1 ring-sky-500'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <MessageSquare className="w-4 h-4 text-sky-600" />
                <div>
                  <div className="text-xs font-bold">SMS Broadcast</div>
                  <div className="text-[10px] text-slate-500">&lt; 160 Chars (Cellular)</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setChannel('social')}
                className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition ${
                  channel === 'social'
                    ? 'bg-sky-50 border-sky-500 text-sky-900 ring-1 ring-sky-500'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Globe className="w-4 h-4 text-sky-600" />
                <div>
                  <div className="text-xs font-bold">Social Media</div>
                  <div className="text-[10px] text-slate-500">X, Bluesky, RSS</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setChannel('siren')}
                className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition ${
                  channel === 'siren'
                    ? 'bg-sky-50 border-sky-500 text-sky-900 ring-1 ring-sky-500'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Radio className="w-4 h-4 text-sky-600" />
                <div>
                  <div className="text-xs font-bold">Coastal Siren / PA</div>
                  <div className="text-[10px] text-slate-500">Audio Announcer</div>
                </div>
              </button>
            </div>
          </div>

          {/* Language Selector & Radius */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                2. Target Language
              </label>
              <div className="grid grid-cols-4 gap-1.5 bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setLanguage('en')}
                  className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition ${
                    language === 'en' ? 'bg-white text-sky-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  English
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage('ta')}
                  className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition ${
                    language === 'ta' ? 'bg-white text-sky-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  தமிழ்
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage('hi')}
                  className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition ${
                    language === 'hi' ? 'bg-white text-sky-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  हिन्दी
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage('te')}
                  className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition ${
                    language === 'te' ? 'bg-white text-sky-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  తెలుగు
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                3. Warning Radius Buffer
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="2"
                  max="50"
                  value={radiusKm}
                  onChange={(e) => setRadiusKm(parseInt(e.target.value, 10))}
                  className="flex-1 accent-sky-600 cursor-pointer"
                />
                <span className="font-mono text-xs font-bold text-sky-700 bg-sky-50 px-2 py-1 rounded border border-sky-200">
                  {radiusKm} km
                </span>
              </div>
            </div>
          </div>

          {/* Formatted Message Preview */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Generated Emergency Alert Copy
              </label>
              <div className="flex items-center gap-2">
                {channel === 'sms' && (
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                      messageText.length > 160 ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                    }`}
                  >
                    {messageText.length}/160 chars
                  </span>
                )}
                <button
                  type="button"
                  onClick={handleCopy}
                  className="text-xs text-sky-700 hover:text-sky-900 font-semibold flex items-center gap-1 bg-sky-50 hover:bg-sky-100 px-2.5 py-1 rounded-lg transition"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
            </div>

            <div className="p-4 bg-slate-900 text-slate-100 rounded-xl font-mono text-xs border border-slate-800 leading-relaxed relative group">
              {messageText}
            </div>
          </div>

          {/* Feedback Message */}
          {feedback && (
            <div
              className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                feedback.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}
            >
              {feedback.type === 'success' ? (
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{feedback.message}</span>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="bg-slate-50 border-t border-slate-200 p-4 px-6 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-xl transition"
          >
            Close
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="px-4 py-2 text-xs font-semibold border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-xl transition flex items-center gap-1.5"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Alert Text</span>
            </button>

            <button
              type="button"
              disabled={sending}
              onClick={handleDispatch}
              className="px-5 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-sm transition flex items-center gap-2 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{sending ? 'Dispatching...' : 'Dispatch Simulated Broadcast'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
