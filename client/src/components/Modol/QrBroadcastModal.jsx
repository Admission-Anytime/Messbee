import { useState, useEffect, useContext, useRef } from "react";
import { userContext } from "../../context/Context";
import { sendQrBroadcast } from "../../services/qrWhatsappService";
import { toast } from "react-toastify";
import io from "socket.io-client";

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  (import.meta.env.VITE_API_URL
    ? String(import.meta.env.VITE_API_URL).replace(/\/api\/?$/, "")
    : "");

const QrBroadcastModal = ({ isOpen, onClose, selectedContacts = [] }) => {
  const { user } = useContext(userContext);
  const [messageText, setMessageText] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [showMediaInput, setShowMediaInput] = useState(false);
  const [intervalSeconds, setIntervalSeconds] = useState(5);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [broadcastDone, setBroadcastDone] = useState(false);

  // Recipient list management
  const [recipients, setRecipients] = useState([]);
  const [showRecipientsList, setShowRecipientsList] = useState(false);
  const [manualPhone, setManualPhone] = useState("");

  // Progress tracking
  const [progress, setProgress] = useState({
    current: 0,
    total: 0,
    percentage: 0,
    lastPhone: "",
    sentCount: 0,
    failedCount: 0,
  });
  const [logs, setLogs] = useState([]);

  const textareaRef = useRef(null);

  // Sync recipient list whenever modal opens or selectedContacts change
  useEffect(() => {
    if (!isOpen) return;

    const parsed = selectedContacts
      .map((c) => {
        const phone = (c.whatsapp || c.phone || "").replace(/[^0-9]/g, "");
        return {
          id: c._id || phone,
          name: c.name || c.firstName || "Customer",
          phone: phone,
        };
      })
      .filter((r) => r.phone && r.phone.length >= 10);

    setRecipients(parsed);
  }, [isOpen, selectedContacts]);

  // Socket listener for real-time broadcast progress
  useEffect(() => {
    if (!isOpen) return;

    const socket = io(SOCKET_URL, { withCredentials: true });
    const tenantId = user?.tenantId || user?._id || user?.id;

    if (tenantId) {
      socket.emit("join", tenantId.toString());
      socket.emit("join_tenant", tenantId.toString());
    }

    socket.on("qr_broadcast_progress", (data) => {
      setProgress((prev) => ({
        current: data.current,
        total: data.total,
        percentage: data.percent || data.percentage || 0,
        lastPhone: data.phone,
        sentCount: data.sent !== undefined ? data.sent : (data.status === "sent" ? prev.sentCount + 1 : prev.sentCount),
        failedCount: data.failed !== undefined ? data.failed : (data.status === "failed" ? prev.failedCount + 1 : prev.failedCount),
      }));

      setLogs((prev) => [
        {
          phone: data.phone,
          status: data.error ? "failed" : "sent",
          error: data.error,
          time: new Date().toLocaleTimeString(),
        },
        ...prev.slice(0, 49),
      ]);
    });

    socket.on("qr_broadcast_completed", (data) => {
      setIsBroadcasting(false);
      setBroadcastDone(true);
      toast.success(
        `Broadcast finished! Sent: ${data.sent || data.totalSent || 0}, Failed: ${data.failed || data.totalFailed || 0}`
      );
    });

    return () => {
      socket.disconnect();
    };
  }, [isOpen, user]);

  const handleRemoveRecipient = (phoneToRemove) => {
    setRecipients((prev) => prev.filter((r) => r.phone !== phoneToRemove));
  };

  const handleAddManualPhone = (e) => {
    if (e) e.preventDefault();
    const clean = manualPhone.replace(/\D/g, "");
    if (!clean || clean.length < 10) {
      toast.error("Please enter a valid phone number with country code (e.g. 919876543210)");
      return;
    }
    if (recipients.some((r) => r.phone === clean)) {
      toast.info("This phone number is already in the recipient list.");
      return;
    }
    setRecipients((prev) => [
      ...prev,
      {
        id: `manual_${clean}`,
        name: `+${clean}`,
        phone: clean,
      },
    ]);
    setManualPhone("");
    toast.success(`+${clean} added to broadcast list.`);
  };

  const insertVariable = (tag) => {
    const textarea = textareaRef.current;
    if (!textarea) {
      setMessageText((prev) => prev + tag);
      return;
    }
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = messageText;
    const nextText = text.substring(0, start) + tag + text.substring(end);
    setMessageText(nextText);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + tag.length, start + tag.length);
    }, 50);
  };

  const handleStartBroadcast = async () => {
    if (!recipients.length) {
      toast.error("Please select or add at least one recipient.");
      return;
    }
    if (!messageText.trim()) {
      toast.error("Please enter a message to broadcast.");
      return;
    }

    try {
      setIsBroadcasting(true);
      setBroadcastDone(false);
      setProgress({
        current: 0,
        total: recipients.length,
        percentage: 0,
        lastPhone: "",
        sentCount: 0,
        failedCount: 0,
      });
      setLogs([]);

      const recipientPhones = recipients.map((r) => r.phone);
      const payload = {
        recipientPhones,
        messageText: messageText.trim(),
        intervalSeconds: Number(intervalSeconds) || 5,
        media: mediaUrl.trim() ? { url: mediaUrl.trim(), type: "image" } : null,
      };

      const res = await sendQrBroadcast(payload);
      if (res.success) {
        toast.info(res.message || "Broadcast started in background with anti-ban delay.");
      }
    } catch (err) {
      setIsBroadcasting(false);
      toast.error(err?.response?.data?.message || "Failed to start broadcast");
    }
  };

  const handleReset = () => {
    setIsBroadcasting(false);
    setBroadcastDone(false);
    setProgress({ current: 0, total: 0, percentage: 0, lastPhone: "", sentCount: 0, failedCount: 0 });
    setLogs([]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in font-['Urbanist']">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 2L11 13" />
                <path d="M22 2l-7 20-4-9-9-4 20-7z" />
              </svg>
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-none">
                Safe WhatsApp Broadcast
              </h2>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Multi-Device 5-by-5 Throttled Anti-Ban Engine
              </p>
            </div>
          </div>
          {!isBroadcasting && (
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 flex items-center justify-center transition-colors cursor-pointer"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          )}
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Recipients summary pill & toggle */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/70 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-xs font-bold text-slate-800">
                  {recipients.length} Recipient{recipients.length === 1 ? "" : "s"} Selected
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowRecipientsList(!showRecipientsList)}
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:underline cursor-pointer"
              >
                {showRecipientsList ? "Hide List ▲" : "View / Edit List ▼"}
              </button>
            </div>

            {/* Expandable Recipient Tags List */}
            {showRecipientsList && (
              <div className="pt-2 border-t border-slate-200 space-y-3 animate-fade-in">
                <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1">
                  {recipients.length === 0 ? (
                    <span className="text-xs text-slate-400 italic">No recipients selected yet.</span>
                  ) : (
                    recipients.map((r) => (
                      <span
                        key={r.phone}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 text-[11px] shadow-2xs font-medium"
                      >
                        <span>{r.name}</span>
                        <span className="text-slate-400 font-mono text-[10px]">+{r.phone}</span>
                        {!isBroadcasting && (
                          <button
                            type="button"
                            onClick={() => handleRemoveRecipient(r.phone)}
                            className="text-slate-300 hover:text-red-500 transition ml-0.5 cursor-pointer font-bold"
                            title="Remove"
                          >
                            ×
                          </button>
                        )}
                      </span>
                    ))
                  )}
                </div>

                {/* Add manual phone number */}
                {!isBroadcasting && (
                  <form onSubmit={handleAddManualPhone} className="flex gap-2 pt-1">
                    <input
                      type="tel"
                      value={manualPhone}
                      onChange={(e) => setManualPhone(e.target.value)}
                      placeholder="Add phone with country code (e.g. 919876543210)"
                      className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <button
                      type="submit"
                      disabled={!manualPhone.trim()}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg transition disabled:opacity-40 cursor-pointer shrink-0"
                    >
                      + Add Number
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>

          {/* Anti-Ban Advisory banner */}
          <div className="p-3 bg-amber-50/80 border border-amber-200/70 rounded-xl text-xs text-amber-900 flex items-start gap-2.5">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-amber-600 shrink-0 mt-0.5">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <div>
              <p className="font-semibold text-amber-950">
                Safe 5-by-5 Throttled Delivery (Anti-Ban Protection)
              </p>
              <p className="text-[11px] text-amber-800 mt-0.5 leading-relaxed">
                Messages are dispatched in batches of 5 with 5–8 second human intervals and cooldown pauses.
              </p>
            </div>
          </div>

          {/* Broadcast In-Flight State */}
          {isBroadcasting || broadcastDone ? (
            <div className="space-y-4 p-5 bg-slate-50 rounded-2xl border border-slate-200/70">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-800">
                    {broadcastDone ? "Broadcast Finished 🎉" : "Broadcasting in progress..."}
                  </span>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {progress.current} of {progress.total} recipients processed
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-lg font-black text-emerald-600">
                    {progress.percentage}%
                  </span>
                  <div className="flex items-center gap-2 text-[10px] text-slate-500">
                    <span className="text-emerald-600 font-bold">✓ {progress.sentCount} sent</span>
                    {progress.failedCount > 0 && (
                      <span className="text-red-500 font-bold">✗ {progress.failedCount} failed</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 transition-all duration-300 rounded-full"
                  style={{ width: `${progress.percentage}%` }}
                />
              </div>

              {/* Live Log Stream */}
              <div className="mt-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Recent Dispatch Activity
                </span>
                <div className="max-h-36 overflow-y-auto space-y-1 bg-white p-2.5 rounded-xl border border-slate-200 text-xs font-mono">
                  {logs.length === 0 ? (
                    <div className="text-slate-400 text-center py-2 text-[11px]">
                      Awaiting delivery confirmations...
                    </div>
                  ) : (
                    logs.map((log, idx) => (
                      <div
                        key={idx}
                        className={`flex items-center justify-between px-2 py-1 rounded text-[11px] ${
                          log.status === "sent"
                            ? "bg-emerald-50 text-emerald-800"
                            : "bg-red-50 text-red-800"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span>{log.status === "sent" ? "✅" : "❌"}</span>
                          <span>+{log.phone}</span>
                        </div>
                        <span className="text-[10px] opacity-70">{log.time}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {broadcastDone && (
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={handleReset}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition cursor-pointer"
                  >
                    Send Another
                  </button>
                  <button
                    onClick={onClose}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs transition cursor-pointer"
                  >
                    Done & Close
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Message Formulation State */
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    Message Content
                  </label>
                  {/* Variables */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-slate-400">Insert:</span>
                    <button
                      type="button"
                      onClick={() => insertVariable("{{name}}")}
                      className="px-2 py-0.5 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[10px] font-bold border border-emerald-200 transition cursor-pointer"
                      title="Insert contact's name"
                    >
                      + Name (&#123;&#123;name&#125;&#125;)
                    </button>
                    {["👋", "🔥", "🛍️", "🎉"].map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => insertVariable(emoji)}
                        className="px-1.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-xs transition cursor-pointer"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                <textarea
                  ref={textareaRef}
                  rows={5}
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Hi {{name}}, we have an exciting update for you!..."
                  className="w-full p-3 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent leading-relaxed"
                />

                <div className="flex items-center justify-between mt-1 text-[11px] text-slate-400">
                  <span>Characters: {messageText.length}</span>
                  <button
                    type="button"
                    onClick={() => setShowMediaInput(!showMediaInput)}
                    className="text-emerald-600 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    {showMediaInput ? "− Remove Image URL" : "+ Attach Image URL"}
                  </button>
                </div>
              </div>

              {/* Optional Media URL */}
              {showMediaInput && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 animate-fade-in">
                  <label className="text-xs font-bold text-slate-700 block">
                    Image Public URL
                  </label>
                  <input
                    type="url"
                    value={mediaUrl}
                    onChange={(e) => setMediaUrl(e.target.value)}
                    placeholder="https://example.com/promo-banner.jpg"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  {mediaUrl && (
                    <div className="mt-2 w-28 h-20 rounded-lg overflow-hidden border border-slate-200 bg-slate-100">
                      <img
                        src={mediaUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Settings: Throttle Delay */}
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">
                    Throttle Base Delay
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Base seconds between recipients (+ randomized anti-ban jitter & 5-msg pause)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={intervalSeconds}
                    onChange={(e) => setIntervalSeconds(Number(e.target.value))}
                    className="px-2.5 py-1 text-xs border border-slate-300 rounded-lg bg-white font-semibold text-slate-700 cursor-pointer"
                  >
                    <option value={5}>5s (Recommended)</option>
                    <option value={7}>7s (Extra Safe)</option>
                    <option value={10}>10s (High Caution)</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {!isBroadcasting && !broadcastDone && (
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleStartBroadcast}
              disabled={!recipients.length || !messageText.trim()}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition disabled:opacity-50 flex items-center gap-2 cursor-pointer"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M22 2L11 13" />
                <path d="M22 2l-7 20-4-9-9-4 20-7z" />
              </svg>
              <span>Start Safe Broadcast ({recipients.length})</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QrBroadcastModal;
