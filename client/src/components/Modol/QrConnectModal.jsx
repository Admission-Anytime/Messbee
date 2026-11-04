import { useState, useEffect, useContext } from "react";
import { userContext } from "../../context/Context";
import { getQrStatus, generateQrCode, disconnectQrSession, requestPairingCode } from "../../services/qrWhatsappService";
import { toast } from "react-toastify";
import io from "socket.io-client";

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  (import.meta.env.VITE_API_URL
    ? String(import.meta.env.VITE_API_URL).replace(/\/api\/?$/, '')
    : '');

const QrConnectModal = ({ isOpen, onClose }) => {
  const { user, refreshUser } = useContext(userContext);
  const isMobile = typeof window !== 'undefined' && (
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
    window.innerWidth < 768
  );
  const [activeTab, setActiveTab] = useState(isMobile ? "phone" : "qr"); // "qr" | "phone"
  const [status, setStatus] = useState("DISCONNECTED"); // DISCONNECTED | CONNECTING | QR_READY | CONNECTED
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [pushName, setPushName] = useState("");
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(45);

  // Pairing code specific state
  const [pairingPhone, setPairingPhone] = useState("");
  const [pairingCode, setPairingCode] = useState("");
  const [pairingLoading, setPairingLoading] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);

  // Initial fetch and socket listening
  useEffect(() => {
    if (!isOpen) return;

    fetchCurrentStatus();

    // Setup socket listener for real-time status updates
    const socket = io(SOCKET_URL, { withCredentials: true });
    const tenantId = user?.tenantId || user?._id || user?.id;

    if (tenantId) {
      socket.emit("join", tenantId.toString());
      socket.emit("join_tenant", tenantId.toString());
    }

    socket.on("qr_code", (data) => {
      setQrCodeDataUrl(data.qrCodeDataUrl);
      setStatus("QR_READY");
      setTimeLeft(45);
      setLoading(false);
    });

    socket.on("pairing_code", (data) => {
      if (data?.pairingCode) {
        setPairingCode(data.pairingCode);
        setPairingLoading(false);
        toast.info("Pairing code received! Enter it on your phone.");
      }
    });

    socket.on("qr_connected", (data) => {
      setStatus("CONNECTED");
      setPhoneNumber(data.phoneNumber);
      setPushName(data.pushName);
      setQrCodeDataUrl("");
      setPairingCode("");
      setLoading(false);
      setPairingLoading(false);
      toast.success(`WhatsApp Connected as +${data.phoneNumber}!`);
      if (refreshUser) refreshUser();
    });

    socket.on("qr_disconnected", () => {
      setStatus("DISCONNECTED");
      setPhoneNumber("");
      setPushName("");
      setQrCodeDataUrl("");
      setPairingCode("");
      setLoading(false);
      if (refreshUser) refreshUser();
    });

    return () => {
      socket.disconnect();
    };
  }, [isOpen, user]);

  // Countdown timer for QR refresh
  useEffect(() => {
    if (activeTab !== "qr" || status !== "QR_READY" || !isOpen) return;

    if (timeLeft <= 0) {
      // Auto-refresh QR when timer expires
      handleGenerateQr(false);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, status, isOpen, activeTab]);

  const fetchCurrentStatus = async () => {
    try {
      setLoading(true);
      const res = await getQrStatus();
      if (res.success) {
        setStatus(res.status);
        setPhoneNumber(res.phoneNumber || "");
        setPushName(res.pushName || "");
        if (res.status === "CONNECTED" || res.alreadyConnected) {
          setStatus("CONNECTED");
          setLoading(false);
          return;
        }
        if (res.qrCodeDataUrl && res.status === "QR_READY") {
          setQrCodeDataUrl(res.qrCodeDataUrl);
          setTimeLeft(30);
          setLoading(false);
        } else {
          // Auto generate QR code if not already connected
          handleGenerateQr(false);
        }
      }
    } catch (err) {
      console.error("Error fetching QR status:", err);
      setLoading(false);
    }
  };

  const handleGenerateQr = async (showToast = true) => {
    try {
      setLoading(true);
      const res = await generateQrCode();
      if (res.success && res.qrCodeDataUrl) {
        setQrCodeDataUrl(res.qrCodeDataUrl);
        setStatus("QR_READY");
        setTimeLeft(45);
        if (showToast) toast.info("New QR Code generated. Scan with your phone.");
      }
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to generate QR Code";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestPairing = async (e) => {
    if (e) e.preventDefault();
    let cleanNumber = pairingPhone.replace(/[^0-9]/g, "");
    if (cleanNumber.startsWith("0")) {
      cleanNumber = cleanNumber.replace(/^0+/, "");
    }
    if (cleanNumber.length === 10) {
      cleanNumber = `91${cleanNumber}`;
    }
    if (!cleanNumber || cleanNumber.length < 10) {
      toast.error("Please enter a valid phone number (e.g. 9876543210 or 919876543210)");
      return;
    }

    try {
      setPairingLoading(true);
      setPairingCode("");
      const res = await requestPairingCode(cleanNumber);
      if (res.success && res.pairingCode) {
        setPairingCode(res.pairingCode);
        toast.success("Pairing code generated! Enter it on WhatsApp.");
      } else {
        toast.info(res.message || "Pairing code requested. Awaiting WhatsApp...");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to get pairing code");
    } finally {
      setPairingLoading(false);
    }
  };

  const handleCopyCode = () => {
    if (!pairingCode) return;
    navigator.clipboard?.writeText(pairingCode).catch(() => {});
    setCodeCopied(true);
    toast.success("Pairing code copied to clipboard!");
    setTimeout(() => setCodeCopied(false), 2000);
  };

  const handleDisconnect = async () => {
    if (!window.confirm("Are you sure you want to unlink this WhatsApp number?")) return;
    try {
      setLoading(true);
      const res = await disconnectQrSession();
      if (res.success) {
        setStatus("DISCONNECTED");
        setPhoneNumber("");
        setPushName("");
        setQrCodeDataUrl("");
        setPairingCode("");
        toast.success("WhatsApp unlinked successfully.");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to disconnect session");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const formattedPairingCode = pairingCode
    ? pairingCode.length === 8
      ? `${pairingCode.slice(0, 4)} - ${pairingCode.slice(4)}`
      : pairingCode
    : "";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in font-['Urbanist']">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#22c55e]/10 flex items-center justify-center text-[#16a34a]">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7"></rect>
                <rect x="14" y="3" width="7" height="7"></rect>
                <rect x="14" y="14" width="7" height="7"></rect>
                <rect x="3" y="14" width="7" height="7"></rect>
              </svg>
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-none">
                Link WhatsApp Device
              </h2>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Messbee Free Multi-Device Connection
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 flex items-center justify-center transition-colors cursor-pointer"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* STATE 1: ALREADY CONNECTED */}
          {status === "CONNECTED" ? (
            <div className="flex flex-col items-center text-center py-6 px-4">
              <div className="w-16 h-16 rounded-full bg-green-100 border-4 border-green-200 flex items-center justify-center text-[#16a34a] mb-4 animate-bounce">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </div>

              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 border border-green-200 text-green-700 text-xs font-semibold mb-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-ping" />
                Active & Ready
              </div>

              <h3 className="text-lg font-bold text-slate-900">
                Connected to +{phoneNumber}
              </h3>
              {pushName && (
                <p className="text-xs text-slate-500 mt-0.5">
                  Account Name: <span className="font-semibold text-slate-700">{pushName}</span>
                </p>
              )}

              <p className="text-xs text-slate-500 max-w-sm mt-3 leading-relaxed">
                Your WhatsApp is actively connected. You can now chat with customers, broadcast safe campaigns, and receive orders directly!
              </p>

              <div className="flex items-center gap-3 mt-6 w-full max-w-xs">
                <button
                  onClick={onClose}
                  className="flex-1 py-2.5 px-4 bg-[#22c55e] hover:bg-[#16a34a] text-white text-xs font-semibold rounded-xl shadow-sm transition-all cursor-pointer"
                >
                  Start Chatting
                </button>
                <button
                  onClick={handleDisconnect}
                  disabled={loading}
                  className="py-2.5 px-4 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-semibold rounded-xl transition-all disabled:opacity-50 cursor-pointer"
                >
                  {loading ? "Unlinking..." : "Unlink Phone"}
                </button>
              </div>
            </div>
          ) : (
            /* STATE 2: NOT CONNECTED (TABS: SCAN QR OR PAIRING CODE) */
            <div className="space-y-5">
              {/* Tab Selector */}
              <div className="flex p-1 bg-slate-100 rounded-xl max-w-sm mx-auto">
                <button
                  onClick={() => setActiveTab("qr")}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    activeTab === "qr"
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  📷 Scan QR Code
                </button>
                <button
                  onClick={() => setActiveTab("phone")}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    activeTab === "phone"
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  🔢 Link with Phone Number
                </button>
              </div>

              {activeTab === "qr" ? (
                /* TAB A: QR CODE SCAN */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                  {/* Left Column: Instructions */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-800">
                      Follow these 4 simple steps:
                    </h3>
                    <ol className="space-y-3 text-xs text-slate-600">
                      <li className="flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center shrink-0 text-[10px]">
                          1
                        </span>
                        <span>Open <strong>WhatsApp</strong> on your phone</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center shrink-0 text-[10px]">
                          2
                        </span>
                        <span>
                          Tap <strong>Menu (⋮)</strong> or <strong>Settings</strong> and select <strong>Linked Devices</strong>
                        </span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center shrink-0 text-[10px]">
                          3
                        </span>
                        <span>
                          Tap <strong>Link a Device</strong>
                        </span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center shrink-0 text-[10px]">
                          4
                        </span>
                        <span>Point your phone camera at the QR code</span>
                      </li>
                    </ol>

                    {isMobile && (
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-[11px] text-blue-800 flex items-start gap-2">
                        <span className="text-base">📱</span>
                        <div>
                          <strong className="block font-bold">Opening on your mobile phone?</strong>
                          <span>You cannot scan your own screen! Switch to the <strong>&quot;Link with Phone Number&quot;</strong> tab above to link via code.</span>
                        </div>
                      </div>
                    )}

                    <div className="p-3 bg-amber-50/70 border border-amber-200/60 rounded-xl text-[11px] text-amber-800 flex items-start gap-2">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 mt-0.5 text-amber-600">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                      </svg>
                      <span>
                        No Meta Business Account or documents required. Connection is instant & free!
                      </span>
                    </div>
                  </div>

                  {/* Right Column: QR Code Display */}
                  <div className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-2xl border border-slate-200/70">
                    <div className="relative w-64 h-64 bg-white rounded-xl shadow-inner border border-slate-200 flex items-center justify-center overflow-hidden">
                      {loading ? (
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-8 h-8 border-3 border-[#22c55e]/20 border-t-[#22c55e] rounded-full animate-spin" />
                          <span className="text-[11px] font-medium text-slate-500">Generating QR...</span>
                        </div>
                      ) : qrCodeDataUrl ? (
                        <img
                          src={qrCodeDataUrl}
                          alt="WhatsApp Web QR Code"
                          className="w-full h-full object-contain p-2"
                        />
                      ) : (
                        <div className="flex flex-col items-center gap-2 p-4 text-center">
                          <span className="text-xs text-slate-500">No active QR code</span>
                          <button
                            onClick={() => handleGenerateQr(true)}
                            className="py-1.5 px-3 bg-[#22c55e] text-white text-xs font-semibold rounded-lg cursor-pointer"
                          >
                            Generate QR
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Countdown and Refresh Bar */}
                    <div className="flex items-center justify-between w-64 mt-3 text-[11px] text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse" />
                        <span>Auto refresh: <strong>{timeLeft}s</strong></span>
                      </div>
                      <button
                        onClick={() => handleGenerateQr(true)}
                        disabled={loading}
                        className="text-[#16a34a] font-semibold hover:underline flex items-center gap-1 disabled:opacity-50 cursor-pointer"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M23 4v6h-6"></path>
                          <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
                        </svg>
                        Refresh
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* TAB B: LINK WITH PHONE NUMBER (PAIRING CODE) */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                  {/* Left Column: Form and Pairing Code Display */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Your WhatsApp Phone Number
                      </label>
                      <p className="text-[11px] text-slate-500 mb-2">
                        Enter with country code, no + or spaces (e.g. 919876543210)
                      </p>
                      <form onSubmit={handleRequestPairing} className="flex gap-2">
                        <input
                          type="tel"
                          value={pairingPhone}
                          onChange={(e) => setPairingPhone(e.target.value)}
                          placeholder="e.g. 919876543210"
                          className="flex-1 px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#22c55e] focus:border-transparent"
                        />
                        <button
                          type="submit"
                          disabled={pairingLoading || !pairingPhone.trim()}
                          className="px-4 py-2 bg-[#22c55e] hover:bg-[#16a34a] text-white text-xs font-semibold rounded-xl shadow-xs transition-all disabled:opacity-50 cursor-pointer flex items-center gap-1.5 shrink-0"
                        >
                          {pairingLoading ? (
                            <>
                              <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                              <span>Requesting...</span>
                            </>
                          ) : (
                            <span>Get Code</span>
                          )}
                        </button>
                      </form>
                    </div>

                    {pairingCode ? (
                      <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl text-center space-y-3">
                        <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
                          Your 8-Digit Pairing Code
                        </span>
                        <div className="text-2xl font-mono font-black text-emerald-700 tracking-widest py-1 bg-white rounded-xl border border-emerald-100 shadow-inner">
                          {formattedPairingCode}
                        </div>
                        <div className="flex items-center justify-center gap-2 pt-1 flex-wrap">
                          <button
                            type="button"
                            onClick={handleCopyCode}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition cursor-pointer"
                          >
                            {codeCopied ? (
                              <>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5" /></svg>
                                <span>Copied!</span>
                              </>
                            ) : (
                              <>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                                <span>Copy Code</span>
                              </>
                            )}
                          </button>
                          <a
                            href="whatsapp://"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold shadow-xs transition cursor-pointer"
                          >
                            <span>📱 Open WhatsApp</span>
                          </a>
                        </div>
                        <p className="text-[10px] text-emerald-700">
                          Waiting for you to confirm on your phone...
                        </p>
                      </div>
                    ) : (
                      <div className="p-4 bg-slate-50 border border-dashed border-slate-200 rounded-2xl text-center text-xs text-slate-400">
                        Enter your WhatsApp number above and click <strong>Get Code</strong> to receive your 8-digit link code.
                      </div>
                    )}
                  </div>

                  {/* Right Column: Instructions for Pairing Code */}
                  <div className="space-y-3 p-4 bg-slate-50/80 rounded-2xl border border-slate-200/70">
                    <h3 className="text-xs font-bold text-slate-800">
                      How to link using phone number:
                    </h3>
                    <ol className="space-y-2.5 text-xs text-slate-600">
                      <li className="flex items-start gap-2">
                        <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center shrink-0 text-[10px]">
                          1
                        </span>
                        <span>Open WhatsApp on your phone</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center shrink-0 text-[10px]">
                          2
                        </span>
                        <span>Go to <strong>Linked Devices &gt; Link a Device</strong></span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-4 h-4 rounded-full bg-[#22c55e] text-white font-bold flex items-center justify-center shrink-0 text-[10px]">
                          3
                        </span>
                        <span>Tap <strong>Link with phone number instead</strong> at the bottom of screen</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-4 h-4 rounded-full bg-[#22c55e] text-white font-bold flex items-center justify-center shrink-0 text-[10px]">
                          4
                        </span>
                        <span>Type the <strong>8-digit code</strong> shown on this screen</span>
                      </li>
                    </ol>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs text-slate-400">
          <span>Protected by Messbee Free Multi-Device Engine</span>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-800 font-medium transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default QrConnectModal;
