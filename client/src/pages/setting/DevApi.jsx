import { useState } from 'react';
import { Copy, Trash2, Plus, Eye, EyeOff, AlertTriangle, X, CheckCircle2, Lock } from 'lucide-react';
import { toast } from 'react-toastify';

// ─── Initial mock data ────────────────────────────────────────────────────────
const INITIAL_KEYS = [
  { id: 1, name: 'Production Key', masked: 'mb_••••••••••••3a9f', created: 'Oct 12, 2023' },
  { id: 2, name: 'Staging Key',    masked: 'mb_••••••••••••8c1d', created: 'Jan 05, 2024' },
];

const INITIAL_EVENTS = [
  { id: 'messages',  label: 'Messages Received', desc: 'Triggered when a new message arrives.',         enabled: true,  color: 'bg-green-500'  },
  { id: 'status',    label: 'Status Updates',     desc: 'Delivery, read, and delivery fail reports.',   enabled: true,  color: 'bg-blue-500'   },
  { id: 'alerts',    label: 'System Alerts',      desc: 'Critical errors and account notifications.',   enabled: false, color: 'bg-orange-500' },
];

// ─── Generate New API Key Modal ─────────────────────────────────────────────
function GenerateKeyModal({ onCancel, onSave }) {
  const [name, setName] = useState('');
  const [permission, setPermission] = useState('Read-only');

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[200] p-4">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-6 relative animate-in fade-in zoom-in duration-200">
        <button onClick={onCancel} className="absolute right-6 top-6 text-gray-400 hover:text-gray-600 transition-colors">
          <X size={20} />
        </button>
        <h3 className="text-xl font-bold text-gray-900 mb-6">Generate New API Key</h3>
        
        <div className="space-y-5 mb-8">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Key Name</label>
            <input 
              type="text" 
              placeholder="e.g., Development Key"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-green-400 focus:ring-4 focus:ring-green-50 transition-all text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Permission Level</label>
            <div className="relative">
              <select 
                value={permission}
                onChange={(e) => setPermission(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-green-400 focus:ring-4 focus:ring-green-50 transition-all bg-white text-sm appearance-none cursor-pointer"
              >
                <option>Read-only</option>
                <option>Full Access</option>
                <option>Admin</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 border border-green-100 rounded-xl p-3.5">
            <p className="text-[12px] text-green-700 leading-relaxed font-medium">
              <span className="font-bold">Security Note:</span> Your API key will be shown only once. Please copy and store it securely.
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-sm font-bold text-gray-400 hover:bg-gray-50 transition-all">
            Cancel
          </button>
          <button 
            disabled={!name.trim()}
            onClick={() => onSave(name, permission)}
            className="flex-1 px-4 py-3 rounded-xl bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold shadow-lg shadow-green-100 transition-all active:scale-95"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Generated Key Success Modal ────────────────────────────────────────────
function GeneratedKeySuccessModal({ apiKey, onDone }) {
  const handleCopy = () => {
    navigator.clipboard.writeText(apiKey);
    toast.success('API Key copied to clipboard!');
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[210] p-4 font-sans">
      <div className="bg-white w-full max-w-lg rounded-[2rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="p-10 text-center">
            <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
               <CheckCircle2 size={48} strokeWidth={1.5} />
            </div>
            
            <h3 className="text-2xl font-black text-gray-900 mb-2">API Key Generated</h3>
            <p className="text-sm text-gray-500 mb-8 max-w-xs mx-auto">
              Your new API key has been successfully generated for the <span className="font-bold text-gray-800">Production</span> environment.
            </p>

            <div className="text-left mb-8">
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2.5">Secret Key</label>
              <div className="flex items-center gap-3 p-4 bg-gray-50 border border-gray-100 rounded-2xl group">
                 <code className="text-xs text-gray-600 font-mono break-all flex-1 tracking-tight">{apiKey}</code>
                 <button 
                   onClick={handleCopy} 
                   className="p-2.5 text-gray-400 hover:text-green-500 hover:bg-white rounded-xl shadow-sm border border-transparent hover:border-green-100 transition-all active:scale-90"
                   title="Copy secret key"
                 >
                    <Copy size={18} />
                 </button>
              </div>
            </div>

            <div className="bg-orange-50 border border-orange-100/50 rounded-2xl p-4 flex items-start gap-3 text-left mb-10">
               <div className="p-1.5 bg-orange-100 rounded-lg text-orange-600">
                 <AlertTriangle size={16} />
               </div>
               <p className="text-[12px] text-orange-800 font-medium leading-relaxed">
                 For security reasons, this key will only be shown once. Please save it in a secure location immediately.
               </p>
            </div>

            <button 
              onClick={onDone}
              className="w-full py-4 bg-green-500 hover:bg-green-600 text-white font-bold rounded-2xl shadow-xl shadow-green-100 transition-all active:scale-95 text-base"
            >
              Done
            </button>
        </div>
        
        <div className="bg-gray-50/50 px-10 py-4 flex items-center justify-center gap-2 border-t border-gray-100 text-gray-400">
           <Lock size={14} />
           <span className="text-[10px] font-bold uppercase tracking-widest">Encrypted with 256-bit AES protection</span>
        </div>
      </div>
    </div>
  );
}

// ─── Delete confirm modal (same style as QuickReply) ─────────────────────────
function DeleteModal({ keyName, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[200] p-4">
      <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl p-6 text-center">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle size={32} />
        </div>
        <h3 className="text-lg font-bold text-slate-800 mb-2">Confirm Delete</h3>
        <p className="text-sm text-slate-500 mb-6">
          Are you sure you want to delete <span className="font-semibold text-slate-700">"{keyName}"</span>? This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-400 hover:bg-slate-50 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-bold shadow-lg shadow-red-200 transition-all active:scale-95"
          >
            Yes, Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Toggle switch ────────────────────────────────────────────────────────────
function Toggle({ enabled, onChange }) {
  return (
    <button
      onClick={onChange}
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none ${enabled ? 'bg-green-500' : 'bg-gray-200'}`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${enabled ? 'translate-x-5' : 'translate-x-0'}`}
      />
    </button>
  );
}

// ─── Main DevApi page ─────────────────────────────────────────────────────────
const DevApi = () => {
  const [apiKeys, setApiKeys]       = useState(INITIAL_KEYS);
  const [events, setEvents]         = useState(INITIAL_EVENTS);
  const [deleteTarget, setDeleteTarget] = useState(null); // key object to confirm delete
  const [callbackUrl, setCallbackUrl]   = useState('https://api.myapp.com/messbee-webhook');
  const [verifyToken, setVerifyToken]   = useState('bb814bf21f4320a7772bd20584475420f858');
  const [showToken, setShowToken]       = useState(false);
  const [nextId, setNextId]             = useState(10);
  
  // Modal states
  const [isCreating, setIsCreating]     = useState(false);
  const [generatedKey, setGeneratedKey] = useState(null); // stores the full key to show in success modal

  // Generate new API key flow
  const handleStartCreate = () => setIsCreating(true);

  const handleSaveKey = (name, permission) => {
    // Simulate raw secret key generation
    const rawKey = `mb_${Array.from({length: 48}, () => Math.floor(Math.random() * 36).toString(36)).join('')}`;
    const masked = `mb_••••••••••••${rawKey.slice(-4)}`;
    
    const newKey = {
      id: nextId,
      name: name,
      masked: masked,
      created: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
    };

    setApiKeys((prev) => [newKey, ...prev]);
    setNextId((n) => n + 1);
    setGeneratedKey(rawKey);
    setIsCreating(false);
    toast.success('Successfully generated new key');
  };

  // Copy masked key to clipboard
  const handleCopy = (key) => {
    navigator.clipboard.writeText(key.masked);
    toast.success(`"${key.name}" copied to clipboard`);
  };

  // Confirm delete
  const handleConfirmDelete = () => {
    setApiKeys((prev) => prev.filter((k) => k.id !== deleteTarget.id));
    toast.success(`"${deleteTarget.name}" revoked successfully!`);
    setDeleteTarget(null);
  };

  // Toggle event subscription
  const handleToggleEvent = (id) => {
    const event = events.find((e) => e.id === id);
    if (!event) return;

    const newStatus = !event.enabled;
    setEvents((prev) =>
      prev.map((e) => (e.id === id ? { ...e, enabled: newStatus } : e))
    );
    toast.success(`${event.label} ${newStatus ? 'enabled' : 'disabled'}`, { toastId: id });
  };

  // Save webhook config
  const handleSaveConfig = () => {
    if (!callbackUrl.trim()) {
      toast.warning('⚠️ Please enter a Callback URL');
      return;
    }
    toast.success('Webhook configuration saved successfully!');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans">

      {/* Create New Key Modal */}
      {isCreating && (
        <GenerateKeyModal 
          onCancel={() => setIsCreating(false)} 
          onSave={handleSaveKey} 
        />
      )}

      {/* Show Successfully Generated Key */}
      {generatedKey && (
        <GeneratedKeySuccessModal 
          apiKey={generatedKey} 
          onDone={() => setGeneratedKey(null)} 
        />
      )}

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <DeleteModal
          keyName={deleteTarget.name}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {/* ── Header ── */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="text-xs text-gray-400 mb-1">Settings &rsaquo; <span className="text-green-600 font-semibold">API &amp; Webhooks</span></p>
          <h1 className="text-2xl font-bold text-gray-900">API Access &amp; Webhooks</h1>
          <p className="text-sm text-gray-400 mt-0.5">Manage your authentication keys and real-time event notifications.</p>
        </div>
        <span className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 border border-green-200 rounded-full text-xs font-bold text-green-700">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
          API STATUS: ACTIVE
        </span>
      </div>

      {/* ── API Keys ── */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm mb-5">
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100">
          <div>
            <h2 className="text-base font-bold text-gray-900">API Keys</h2>
            <p className="text-xs text-gray-400 mt-0.5">Authentication keys for accessing the MessBee REST API.</p>
          </div>
          <button
            onClick={handleStartCreate}
            className="flex items-center gap-1.5 px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold rounded-xl shadow-sm transition active:scale-95"
          >
            <Plus size={16} />
            Generate New Key
          </button>
        </div>

        {/* Table */}
        <div className="px-6 py-2">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[11px] font-bold uppercase text-gray-400 tracking-wider border-b border-gray-100">
                <th className="py-3 pr-4">Key Name</th>
                <th className="py-3 pr-4">Masked Key</th>
                <th className="py-3 pr-4">Created Date</th>
                <th className="py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {apiKeys.map((key) => (
                <tr key={key.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition">
                  <td className="py-4 pr-4 text-sm font-semibold text-gray-800">{key.name}</td>
                  <td className="py-4 pr-4 text-sm text-gray-500 font-mono">{key.masked}</td>
                  <td className="py-4 pr-4 text-sm text-gray-400">{key.created}</td>
                  <td className="py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleCopy(key)}
                        className="p-2 text-gray-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-lg transition-colors"
                        title="Copy key"
                      >
                        <Copy size={16} />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(key)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Revoke key"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Webhook + Events row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">

        {/* Webhook Configuration */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
          <h2 className="text-base font-bold text-gray-900 mb-0.5">Webhook Configuration</h2>
          <p className="text-xs text-gray-400 mb-5">Configure your destination server to receive events.</p>

          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Callback URL</label>
            <input
              type="url"
              value={callbackUrl}
              onChange={(e) => setCallbackUrl(e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition"
              placeholder="https://your-server.com/webhook"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Verify Token</label>
            <div className="relative">
              <input
                type={showToken ? 'text' : 'password'}
                value={verifyToken}
                onChange={(e) => setVerifyToken(e.target.value)}
                className="w-full px-3 py-2.5 pr-10 text-sm border border-gray-200 rounded-xl bg-gray-50 outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition"
              />
              <button
                onClick={() => setShowToken(!showToken)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
              >
                {showToken ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-1.5">Used to verify that the request originated from Messbee.</p>
          </div>

          <div className="flex items-center justify-end gap-3">
            <button
              onClick={() => { setCallbackUrl(''); setVerifyToken(''); }}
              className="px-4 py-2 text-sm font-semibold text-gray-500 hover:text-gray-700 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveConfig}
              className="px-5 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold rounded-xl shadow-sm transition active:scale-95"
            >
              Save Config
            </button>
          </div>
        </div>

        {/* Event Subscriptions */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
          <h2 className="text-base font-bold text-gray-900 mb-0.5">Event Subscriptions</h2>
          <p className="text-xs text-gray-400 mb-5">Choose which events trigger a webhook delivery.</p>

          <div className="space-y-4">
            {events.map((ev) => (
              <div key={ev.id} className="flex items-center gap-4 py-3 border-b border-gray-50 last:border-0">
                <div className={`w-9 h-9 rounded-xl ${ev.color} flex items-center justify-center flex-shrink-0`}>
                  {ev.id === 'messages' && (
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  )}
                  {ev.id === 'status' && (
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  )}
                  {ev.id === 'alerts' && (
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800">{ev.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{ev.desc}</p>
                </div>
                <Toggle enabled={ev.enabled} onChange={() => handleToggleEvent(ev.id)} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Developer Security Tip ── */}
      <div className="bg-green-50 border border-green-100 rounded-2xl px-5 py-4 flex items-start gap-4">
        <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold text-gray-800">Developer Security Tip</p>
          <p className="text-xs text-gray-500 mt-0.5">
            Never share your secret API keys in public places. Use environment variables to store them securely.
            If you suspect a key is compromised, revoke it immediately and generate a new one.
          </p>
        </div>
        <button className="text-xs font-semibold text-green-700 border border-green-300 bg-white hover:bg-green-50 px-3 py-1.5 rounded-lg transition flex-shrink-0">
          Learn More
        </button>
      </div>

    </div>
  );
};

export default DevApi;
