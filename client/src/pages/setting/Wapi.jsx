import { useState, useRef, useContext } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { userContext } from "../../context/Context";
import { Lock } from "lucide-react";
import HealthDiagnosticModal from "../../components/Modol/HealthDiagnosticModal";
import TestConnectionModal from "../../components/Modol/TestConnectionModal";
import { useWhatsAppConfig } from "../../hooks/useWhatsAppConfig";

// ─── Toggle ────────────────────────────────────────────────────────────────────
function Toggle({ enabled, onChange }) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onChange(!enabled); }}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-1 ${enabled ? "bg-green-500" : "bg-gray-300"}`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform duration-300 ${enabled ? "translate-x-6" : "translate-x-1"}`} />
    </button>
  );
}

// ─── Modal ─────────────────────────────────────────────────────────────────────
function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6"
        style={{ animation: "popIn 0.2s ease" }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-bold text-gray-900 mb-1">{title}</h3>
        {children}
      </div>
    </div>
  );
}

function generateToken(len = 48) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

// ─── CopyButton ────────────────────────────────────────────────────────────────
function CopyBtn({ text, onCopy }) {
  const [copied, setCopied] = useState(false);
  const handle = () => {
    navigator.clipboard?.writeText(text).catch(() => {});
    onCopy();
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button onClick={handle} className="text-gray-400 hover:text-green-500 transition" title="Copy">
      {copied ? (
        <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
      ) : (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
      )}
    </button>
  );
}

// ─── EyeBtn ────────────────────────────────────────────────────────────────────
function EyeBtn({ visible, onToggle }) {
  return (
    <button onClick={onToggle} className="text-gray-400 hover:text-gray-600 transition">
      {visible ? (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 4.411m0 0L21 21" /></svg>
      ) : (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
      )}
    </button>
  );
}

// ─── Spinner ───────────────────────────────────────────────────────────────────
function Spinner() {
  return (
    <svg className="w-4 h-4" style={{ animation: "spin 0.8s linear infinite" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  );
}



// ══════════════════════════════════════════════════════════════════════════════
export default function WhatsAppConfig() {
  const navigate = useNavigate();
  const { user, rolePermissions } = useContext(userContext);
  const userRole = user?.role ? (user.role.charAt(0).toUpperCase() + user.role.slice(1).toLowerCase()) : "Agent";
  const isAdmin = userRole === "Admin";

  // Check api_configuration permission — reads from rolePermissions for all roles including Admin
  const DEFAULT_API_PERMS = { Admin: true, Manager: false, Agent: false };
  const hasApiAccess = isAdmin || (rolePermissions?.[userRole]?.api_configuration
    ?? DEFAULT_API_PERMS[userRole]
    ?? false);




  const {
    businessId, setBusinessId,
    phoneId, setPhoneId,
    accessToken, setAccessToken,
    webhookUrl, setWebhookUrl,
    events, setEvents,
    loading, saving,
    connectionStatus, setConnectionStatus,
    lastSync, setLastSync,
    hasChanges,
    saveConfig,
    testWebhook,
    refreshConnection,
    exportConfig
  } = useWhatsAppConfig();

  const [showToken, setShowToken] = useState(false);
  const [editingCreds, setEditingCreds] = useState(false);
  const [credsDraft, setCredsDraft] = useState({});

  const [webhookDraft, setWebhookDraft] = useState("");
  const [verifyToken] = useState(generateToken(24));
  const [showVerifyToken, setShowVerifyToken] = useState(false);
  const [webhookStatus, setWebhookStatus] = useState("idle");
  const [webhookEditMode, setWebhookEditMode] = useState(false);

  const [refreshing, setRefreshing] = useState(false);

  const [pin, setPin] = useState(["", "", "", "", "", ""]);
  const [confirmPin, setConfirmPin] = useState(["", "", "", "", "", ""]);
  const [pinSet, setPinSet] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinError, setPinError] = useState("");
  const pinRefs = useRef([]);
  const confirmPinRefs = useRef([]);

  const [showDisconnectModal, setShowDisconnectModal] = useState(false);
  const [disconnectText, setDisconnectText] = useState("");
  const [disconnected, setDisconnected] = useState(false);
  const [showRotateModal, setShowRotateModal] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);
  const [showHealthModal, setShowHealthModal] = useState(false);


  // ── Access Restriction Check ──
  if (!hasApiAccess) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-[#F8FAFC] p-4 font-['Urbanist']">
        <div className="max-w-md w-full bg-white rounded-3xl p-10 shadow-[0_20px_50px_rgba(0,0,0,0.05)] text-center space-y-6 border border-slate-100">
          <div className="w-20 h-20 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-2">
            <Lock className="w-10 h-10 text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Access Restricted</h2>
          <p className="text-slate-500 text-sm leading-relaxed">
            You don't have the access to manage WhatsApp configuration or webhooks. 
            Please contact your administrator.
          </p>
          <button 
            onClick={() => navigate(-1)}
            className="w-full py-4 bg-[#1e293b] hover:bg-[#0f172a] text-white font-bold rounded-2xl transition-all shadow-lg shadow-slate-200 cursor-pointer"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleRefresh = () => refreshConnection({ setRefreshing, setShowTestModal });

  const handleTestWebhook = () => testWebhook({ webhookEditMode, webhookDraft, setWebhookStatus });

  const handleRotateConfirm = () => {
    setAccessToken(generateToken(48));
    setShowRotateModal(false);
    setShowToken(false);
    toast.info("New token generated — update your integrations now");
  };

  const handleSave = async () => {
    const success = await saveConfig({ verifyToken, webhookEditMode, webhookDraft });
    if (success) {
      setEditingCreds(false);
      setWebhookEditMode(false);
    }
  };

  const handleExport = () => exportConfig();

  const startEditCreds = () => { setCredsDraft({ businessId, phoneId }); setEditingCreds(true); };
  const cancelEditCreds = () => { setBusinessId(credsDraft.businessId); setPhoneId(credsDraft.phoneId); setEditingCreds(false); };
  const startEditWebhook = () => { setWebhookDraft(webhookUrl); setWebhookEditMode(true); };
  const cancelEditWebhook = () => { setWebhookEditMode(false); setWebhookDraft(""); };

  // ── PIN input logic ──
  const handlePinDigit = (idx, val, arr, setArr, refs) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...arr]; next[idx] = val; setArr(next);
    if (val && idx < 5) refs.current[idx + 1]?.focus();
  };
  const handlePinKey = (idx, e, arr, refs) => {
    if (e.key === "Backspace" && !arr[idx] && idx > 0) refs.current[idx - 1]?.focus();
  };
  const handleSetPin = () => {
    const p = pin.join(""), c = confirmPin.join("");
    if (p.length < 6) { setPinError("Please fill all 6 digits"); return; }
    if (p !== c) { setPinError("PINs don't match — try again"); setConfirmPin(["","","","","",""]); confirmPinRefs.current[0]?.focus(); return; }
    setPinError(""); setPinSet(true); setShowPinModal(false);
    toast.success("Two-step verification enabled!");
  };

  const handleDisconnect = () => {
    if (disconnectText !== "DISCONNECT") { toast.error('Type exactly "DISCONNECT" to confirm'); return; }
    setDisconnected(true); setShowDisconnectModal(false); setConnectionStatus("Disconnected");
    toast.error("Integration disconnected. Message processing halted.");
  };

  const eventList = [
    { key: "messages", label: "Messages", desc: "Receive inbound messages", icon: "✉️" },
    { key: "messageStatus", label: "Message Status", desc: "Delivery and read receipts", icon: "✓" },
    { key: "templateStatus", label: "Template Status", desc: "Approval and change alerts", icon: "📄" },
    { key: "securityAlerts", label: "Security Alerts", desc: "Compromise or change events", icon: "🛡️" },
    { key: "orderUpdates", label: "Order Updates", desc: "Catalog and cart changes", icon: "🛒" },
    { key: "profileUpdates", label: "Profile Updates", desc: "Account info changes", icon: "👤" },
  ];

  const activeCount = Object.values(events).filter(Boolean).length;

  return (
    <>
      <style>{`
        @keyframes slideIn { from { transform: translateX(40px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes popIn { from { transform: scale(0.92); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div className="min-h-screen bg-gray-50 p-6">

        {/* ── HEADER ── */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">WhatsApp Configuration</h1>
              <p className="text-sm text-gray-500 mt-0.5">Manage Business API credentials, health diagnostics, and webhooks.</p>
              {hasChanges && (
                <span className="inline-flex items-center gap-1 mt-1.5 text-xs font-semibold text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-2.5 py-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" />
                  Unsaved changes — click Save to apply
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 border border-gray-200 bg-white rounded-lg hover:bg-gray-50 shadow-sm transition">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              Export Config
            </button>
            <button
              onClick={handleSave}
              disabled={saving || disconnected || loading}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-lg shadow-sm transition disabled:opacity-50 ${hasChanges ? "bg-green-500 hover:bg-green-600 ring-2 ring-green-300 ring-offset-1" : "bg-green-500 hover:bg-green-600"}`}
            >
              {saving ? <Spinner /> : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>}
              {saving ? "Saving..." : loading ? "Loading..." : "Save Changes"}
            </button>
          </div>
        </div>

        {/* ── STATUS BAR ── */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 mb-5 flex flex-wrap items-center gap-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center ${connectionStatus === "Active" ? "bg-green-50" : connectionStatus === "Checking..." ? "bg-amber-50" : "bg-red-50"}`}>
              <span className="text-lg">📶</span>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">System Status</p>
              <p className="text-sm font-bold text-gray-800">
                Connection:{" "}
                <span className={connectionStatus === "Active" ? "text-green-500" : connectionStatus === "Checking..." ? "text-amber-500" : "text-red-500"}>
                  {connectionStatus}
                </span>
              </p>
            </div>
          </div>
          <div className="h-8 w-px bg-gray-100" />
          <div>
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Last Sync</p>
            <p className="text-sm font-semibold text-gray-700 flex items-center gap-1">
              <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {lastSync}
            </p>
          </div>
          <div className="h-8 w-px bg-gray-100" />
          <div>
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Environment</p>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200">PRODUCTION</span>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <button onClick={handleRefresh} disabled={disconnected} className="flex items-center gap-1.5 text-sm font-medium text-green-600 hover:text-green-700 transition disabled:opacity-50">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              Refresh Connection Status
            </button>
          </div>
        </div>

        {/* ── API CREDENTIALS + WEBHOOK ── */}
        <div className="grid grid-cols-2 gap-5 mb-5">

          {/* API Credentials */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-yellow-50 flex items-center justify-center">🔑</div>
                <h2 className="font-bold text-gray-800">API Credentials</h2>
              </div>
              {!editingCreds ? (
                <button onClick={startEditCreds} className="text-xs font-semibold text-blue-600 border border-blue-200 bg-blue-50 rounded-lg px-2.5 py-1 hover:bg-blue-100 transition">Edit</button>
              ) : (
                <div className="flex gap-2">
                  <button onClick={cancelEditCreds} className="text-xs font-semibold text-gray-500 border border-gray-200 rounded-lg px-2.5 py-1 hover:bg-gray-50 transition">Cancel</button>
                  <button onClick={handleSave} className="text-xs font-semibold text-white bg-green-500 rounded-lg px-2.5 py-1 hover:bg-green-600 transition">Save</button>
                </div>
              )}
            </div>

            {/* Business ID */}
            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-400 tracking-widest uppercase mb-1.5">WhatsApp Business Account ID</label>
              <div className={`flex items-center gap-2 bg-white border rounded-lg px-3 py-2.5 shadow-sm transition ${editingCreds ? "border-blue-300 ring-1 ring-blue-200" : "border-gray-200"}`}>
                <input type="text" value={businessId} onChange={(e) => setBusinessId(e.target.value)} readOnly={!editingCreds} className="flex-1 text-sm text-gray-700 bg-transparent outline-none font-mono" placeholder="Enter Business Account ID" />
                <CopyBtn text={businessId} onCopy={() => toast.success("Business Account ID copied")} />
              </div>
            </div>

            {/* Phone ID */}
            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-400 tracking-widest uppercase mb-1.5">Phone Number ID</label>
              <div className={`flex items-center gap-2 bg-white border rounded-lg px-3 py-2.5 shadow-sm transition ${editingCreds ? "border-blue-300 ring-1 ring-blue-200" : "border-gray-200"}`}>
                <input type="text" value={phoneId} onChange={(e) => setPhoneId(e.target.value)} readOnly={!editingCreds} className="flex-1 text-sm text-gray-700 bg-transparent outline-none font-mono" placeholder="Enter Phone Number ID" />
                <CopyBtn text={phoneId} onCopy={() => toast.success("Phone Number ID copied")} />
              </div>
            </div>

            {/* Access Token */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 tracking-widest uppercase mb-1.5">System User Access Token</label>
              <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2.5 shadow-sm">
                <input type={showToken ? "text" : "password"} value={accessToken} readOnly className="flex-1 text-sm text-gray-700 bg-transparent outline-none font-mono" />
                <EyeBtn visible={showToken} onToggle={() => setShowToken(!showToken)} />
                <CopyBtn text={accessToken} onCopy={() => toast.success("Access token copied")} />
                <button onClick={() => setShowRotateModal(true)} className="text-xs font-semibold text-gray-600 border border-gray-200 rounded-md px-2 py-1 hover:bg-amber-50 hover:border-amber-300 hover:text-amber-600 transition">
                  Rotate
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Keep this token secret. Never expose it in client-side code.
              </p>
            </div>
          </div>

          {/* Webhook Settings */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">🔗</div>
                <h2 className="font-bold text-gray-800">Webhook Settings</h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-green-600 bg-green-50 border border-green-200 rounded-full px-2.5 py-1 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                  99.8% SUCCESS RATE
                </span>
                {!webhookEditMode ? (
                  <button onClick={startEditWebhook} className="text-xs font-semibold text-blue-600 border border-blue-200 bg-blue-50 rounded-lg px-2.5 py-1 hover:bg-blue-100 transition">Edit</button>
                ) : (
                  <div className="flex gap-2">
                    <button onClick={cancelEditWebhook} className="text-xs font-semibold text-gray-500 border border-gray-200 rounded-lg px-2.5 py-1 hover:bg-gray-50 transition">Cancel</button>
                    <button onClick={() => { if (webhookDraft) { setWebhookUrl(webhookDraft); } setWebhookEditMode(false); toast.success("Webhook URL updated"); }} className="text-xs font-semibold text-white bg-green-500 rounded-lg px-2.5 py-1 hover:bg-green-600 transition">Apply</button>
                  </div>
                )}
              </div>
            </div>

            {/* Webhook URL */}
            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-400 tracking-widest uppercase mb-1.5">Webhook URL</label>
              <div className={`flex items-center gap-2 bg-white border rounded-lg px-3 py-2.5 shadow-sm transition ${
                webhookStatus === "success" ? "border-green-400 ring-1 ring-green-200" :
                webhookStatus === "error" ? "border-red-400 ring-1 ring-red-200" :
                webhookEditMode ? "border-blue-300 ring-1 ring-blue-200" : "border-gray-200"
              }`}>
                <input
                  type="text"
                  value={webhookEditMode ? webhookDraft : webhookUrl}
                  onChange={(e) => setWebhookDraft(e.target.value)}
                  readOnly={!webhookEditMode}
                  placeholder="https://your-server.com/webhook"
                  className="flex-1 text-sm text-gray-700 bg-transparent outline-none font-mono"
                />
                {webhookStatus === "success" && <span className="text-green-500 font-bold text-sm">✓</span>}
                {webhookStatus === "error" && <span className="text-red-500 font-bold text-sm">✕</span>}
                {webhookStatus === "testing" && <Spinner />}
                {webhookStatus === "idle" && (
                  <span className="text-green-500">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                  </span>
                )}
              </div>
            </div>

            {/* Verify Token */}
            <div className="mb-5">
              <label className="block text-xs font-semibold text-gray-400 tracking-widest uppercase mb-1.5">Verify Token</label>
              <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2.5 shadow-sm">
                <input type={showVerifyToken ? "text" : "password"} value={verifyToken} readOnly className="flex-1 text-sm text-gray-700 bg-transparent outline-none font-mono" />
                <EyeBtn visible={showVerifyToken} onToggle={() => setShowVerifyToken(!showVerifyToken)} />
                <CopyBtn text={verifyToken} onCopy={() => toast.success("Verify token copied")} />
              </div>
            </div>

            {/* Test Button */}
            <button
              onClick={handleTestWebhook}
              disabled={webhookStatus === "testing" || disconnected}
              className={`w-full flex items-center justify-center gap-2 py-2.5 border rounded-lg text-sm font-semibold transition disabled:opacity-60 ${
                webhookStatus === "success" ? "border-green-400 bg-green-50 text-green-700" :
                webhookStatus === "error" ? "border-red-300 bg-red-50 text-red-600 hover:bg-red-100" :
                "border-gray-200 text-gray-700 hover:bg-gray-50"
              }`}
            >
              {webhookStatus === "testing" ? <><Spinner /> Testing endpoint...</> :
               webhookStatus === "success" ? "✓ Endpoint Healthy" :
               webhookStatus === "error" ? "✕ Failed — Click to Retry" :
               <><span>▶</span> Test Webhook Endpoint</>}
            </button>
          </div>
        </div>

        {/* ── SUBSCRIBED EVENTS ── */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 mb-5 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">📬</div>
              <div>
                <h2 className="font-bold text-gray-800">Subscribed Events</h2>
                <p className="text-xs text-gray-400">{activeCount} of {eventList.length} events active</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setEvents({ messages: true, messageStatus: true, templateStatus: true, securityAlerts: true, orderUpdates: true, profileUpdates: true })} className="text-xs font-semibold text-gray-600 border border-gray-200 bg-white rounded-lg px-3 py-1.5 hover:bg-green-50 hover:border-green-300 hover:text-green-700 transition">Enable All</button>
              <button onClick={() => setEvents({ messages: false, messageStatus: false, templateStatus: false, securityAlerts: false, orderUpdates: false, profileUpdates: false })} className="text-xs font-semibold text-gray-600 border border-gray-200 bg-white rounded-lg px-3 py-1.5 hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition">Disable All</button>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {eventList.map(({ key, label, desc, icon }) => (
              <div
                key={key}
                onClick={() => setEvents((prev) => ({ ...prev, [key]: !prev[key] }))}
                className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer select-none transition-all duration-200 ${events[key] ? "border-green-200 bg-green-50 hover:bg-green-100" : "border-gray-100 bg-gray-50 hover:bg-gray-100"}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg border flex items-center justify-center text-sm shadow-sm transition ${events[key] ? "bg-white border-green-200" : "bg-white border-gray-200"}`}>{icon}</div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{label}</p>
                    <p className="text-xs text-gray-400">{desc}</p>
                  </div>
                </div>
                <Toggle enabled={events[key]} onChange={(val) => setEvents((prev) => ({ ...prev, [key]: val }))} />
              </div>
            ))}
          </div>
        </div>

        {/* ── TWO-STEP VERIFICATION ── */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 mb-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">🛡️</div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-bold text-gray-800">Two-Step Verification</h2>
                  {pinSet && <span className="text-xs font-bold bg-green-100 text-green-700 border border-green-200 rounded-full px-2 py-0.5">Enabled</span>}
                </div>
                <p className="text-sm text-gray-500 mt-0.5">Protect your number with a 6-digit PIN required to register with WhatsApp.</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex gap-1.5">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className={`w-9 h-9 rounded-lg border-2 flex items-center justify-center transition-all duration-300 ${pinSet ? "border-green-300 bg-green-50" : "border-gray-200 bg-gray-50"}`}>
                    <span className={`rounded-full block transition-all duration-300 ${pinSet ? "w-2.5 h-2.5 bg-green-500" : "w-2 h-2 bg-gray-300"}`} />
                  </div>
                ))}
              </div>
              <button
                onClick={() => { setPin(["","","","","",""]); setConfirmPin(["","","","","",""]); setPinError(""); setShowPinModal(true); setTimeout(() => pinRefs.current[0]?.focus(), 100); }}
                className={`text-sm font-semibold px-3 py-2 rounded-lg border transition ${pinSet ? "border-amber-300 text-amber-600 bg-amber-50 hover:bg-amber-100" : "border-blue-200 text-blue-600 bg-blue-50 hover:bg-blue-100"}`}
              >
                {pinSet ? "Change PIN" : "Set PIN"}
              </button>
            </div>
          </div>
        </div>

        {/* ── UNLINK SECTION ── */}
        <div className={`rounded-xl p-5 flex items-center justify-between shadow-sm border transition-all ${disconnected ? "bg-red-50 border-red-200" : "bg-white border-red-100"}`}>
          <div>
            <h3 className="font-bold text-red-500 text-sm">Unlink WhatsApp Number</h3>
            <p className="text-xs text-red-400 mt-0.5">
              {disconnected ? "⚠️ Integration disconnected. Reconnect via the setup wizard." : "This will permanently stop all message processing and delete configuration data."}
            </p>
          </div>
          <button
            onClick={() => !disconnected && (setDisconnectText(""), setShowDisconnectModal(true))}
            disabled={disconnected}
            className={`px-4 py-2 font-semibold text-sm rounded-lg border-2 transition ${disconnected ? "border-gray-300 text-gray-400 cursor-not-allowed bg-gray-50" : "border-red-400 text-red-500 bg-white hover:bg-red-500 hover:text-white hover:border-red-500"}`}
          >
            {disconnected ? "Disconnected" : "Disconnect Integration"}
          </button>
        </div>
      </div>

      {/* ══ MODAL: ROTATE TOKEN ══ */}
      <Modal open={showRotateModal} onClose={() => setShowRotateModal(false)} title="🔄 Rotate Access Token">
        <p className="text-sm text-gray-500 mt-1 mb-2">This will <strong>immediately invalidate</strong> the current token and generate a new one.</p>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
          <p className="text-xs text-amber-700 font-medium">⚠️ Update all apps and integrations using this token before rotating, or they will break.</p>
        </div>
        <div className="flex gap-3 justify-end">
          <button onClick={() => setShowRotateModal(false)} className="px-4 py-2 text-sm font-semibold text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition">Cancel</button>
          <button onClick={handleRotateConfirm} className="px-4 py-2 text-sm font-semibold text-white bg-amber-500 rounded-lg hover:bg-amber-600 transition">Yes, Rotate Token</button>
        </div>
      </Modal>

      {/* ══ MODAL: SET PIN ══ */}
      <Modal open={showPinModal} onClose={() => setShowPinModal(false)} title="🛡️ Set Verification PIN">
        <p className="text-sm text-gray-500 mt-1 mb-5">Enter a 6-digit PIN you'll remember. This is required to re-register your number with WhatsApp.</p>
        <div className="mb-5">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">New PIN</label>
          <div className="flex gap-2 justify-center">
            {pin.map((d, i) => (
              <input
                key={i}
                ref={(el) => pinRefs.current[i] = el}
                type="password"
                inputMode="numeric"
                maxLength={1}
                value={d}
                onChange={(e) => handlePinDigit(i, e.target.value, pin, setPin, pinRefs)}
                onKeyDown={(e) => handlePinKey(i, e, pin, pinRefs)}
                className="w-11 h-12 text-center text-xl font-bold border-2 border-gray-200 rounded-xl outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition bg-gray-50"
              />
            ))}
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Confirm PIN</label>
          <div className="flex gap-2 justify-center">
            {confirmPin.map((d, i) => (
              <input
                key={i}
                ref={(el) => confirmPinRefs.current[i] = el}
                type="password"
                inputMode="numeric"
                maxLength={1}
                value={d}
                onChange={(e) => handlePinDigit(i, e.target.value, confirmPin, setConfirmPin, confirmPinRefs)}
                onKeyDown={(e) => handlePinKey(i, e, confirmPin, confirmPinRefs)}
                className="w-11 h-12 text-center text-xl font-bold border-2 border-gray-200 rounded-xl outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition bg-gray-50"
              />
            ))}
          </div>
        </div>
        {pinError && <p className="text-xs text-center text-red-500 mb-1 font-medium">{pinError}</p>}
        <div className="flex gap-3 justify-end mt-5">
          <button onClick={() => setShowPinModal(false)} className="px-4 py-2 text-sm font-semibold text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition">Cancel</button>
          <button onClick={handleSetPin} className="px-4 py-2 text-sm font-semibold text-white bg-green-500 rounded-lg hover:bg-green-600 transition">Set PIN</button>
        </div>
      </Modal>

      {/* ══ MODAL: DISCONNECT ══ */}
      <Modal open={showDisconnectModal} onClose={() => setShowDisconnectModal(false)} title="⚠️ Disconnect Integration">
        <p className="text-sm text-gray-500 mt-1 mb-3">This will <strong>permanently stop</strong> all WhatsApp message processing and delete your configuration. This cannot be undone.</p>
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 text-xs text-red-700 font-medium space-y-1">
          <p>• All inbound messages will stop being received</p>
          <p>• Webhook subscriptions will be removed</p>
          <p>• API credentials will be cleared</p>
        </div>
        <label className="block text-xs font-semibold text-gray-500 mb-1.5">Type <strong className="text-red-500 font-mono">DISCONNECT</strong> to confirm:</label>
        <input
          type="text"
          value={disconnectText}
          onChange={(e) => setDisconnectText(e.target.value)}
          placeholder="DISCONNECT"
          className={`w-full border-2 rounded-lg px-3 py-2 text-sm outline-none transition mb-4 font-mono ${disconnectText === "DISCONNECT" ? "border-red-400 bg-red-50" : "border-gray-200 focus:border-red-300"}`}
        />
        <div className="flex gap-3 justify-end">
          <button onClick={() => setShowDisconnectModal(false)} className="px-4 py-2 text-sm font-semibold text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition">Keep Integration</button>
          <button onClick={handleDisconnect} disabled={disconnectText !== "DISCONNECT"} className="px-4 py-2 text-sm font-semibold text-white bg-red-500 rounded-lg hover:bg-red-600 transition disabled:opacity-40 disabled:cursor-not-allowed">
            Disconnect
          </button>
        </div>
      </Modal>
      {/* ══ MODAL: HEALTH DIAGNOSTIC ══ */}
      <HealthDiagnosticModal
        open={showHealthModal}
        onClose={() => setShowHealthModal(false)}
      />

      {/* ══ MODAL: TEST CONNECTION ══ */}
      <TestConnectionModal
        open={showTestModal}
        onClose={() => setShowTestModal(false)}
        onDone={() => {
          setConnectionStatus("Active");
          setLastSync("Just now");
          toast.success("Connection verified — all systems operational");
          setShowTestModal(false);
          setTimeout(() => setShowHealthModal(true), 350);
        }}
      />
    </>
  );
}