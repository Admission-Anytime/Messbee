import React, { useState, useRef, useEffect, useContext } from "react";
import { 
  XMarkIcon, 
  CheckCircleIcon, 
  ClockIcon, 
  ArrowPathIcon, 
  ExclamationTriangleIcon, 
  ShieldCheckIcon,
  ArrowRightOnRectangleIcon
} from "@heroicons/react/24/outline";
import io from "socket.io-client";
import api from "../../context/axios";
import { toast } from "react-toastify";
import { userContext } from "../../context/Context";

const ConnectWhatsAppModal = ({ isOpen, onClose, isMandatory = false, user }) => {
  const overlayRef = useRef();
  const { logoutUser } = useContext(userContext);

  const handleLogout = async () => {
    try {
      await logoutUser();
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout error:", error);
    }
  };
  
  // Check if user is agent/employee (not allowed to connect)
  const isAgent = user?.role === 'agent' || user?.role === 'AGENT' || user?.role === 'user';
  const [wabaId, setWabaId] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState("");
  const [isFbInitialized, setIsFbInitialized] = useState(false);
  
  // Approval states
  const [localStatus, setLocalStatus] = useState(user?.wabaApprovalStatus || "NONE");
  const [rejectionReason, setRejectionReason] = useState("");
  const [showReconfigure, setShowReconfigure] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);

  useEffect(() => {
    if (user?.wabaApprovalStatus) {
      setLocalStatus(user.wabaApprovalStatus);
    }
  }, [user?.wabaApprovalStatus]);

  // Real-time listener for Super Admin approval
  useEffect(() => {
    const tenantId = user?.tenantId || user?._id;
    if (!tenantId) return;

    const socketUrl =
      import.meta.env.VITE_SOCKET_URL ||
      (import.meta.env.VITE_API_URL
        ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, "")
        : window.location.origin);

    const socket = io(socketUrl, { withCredentials: true });

    if (user?._id) socket.emit("join", user._id.toString());
    socket.emit("join_tenant", tenantId.toString());

    socket.on("waba_approval_update", (data) => {
      console.log("⚡ [ConnectWhatsAppModal] Received waba_approval_update:", data);
      if (data.status === "APPROVED") {
        setLocalStatus("APPROVED");
        toast.success("🎉 Super Admin has approved your Meta WhatsApp Business Account!");
        setTimeout(() => {
          window.location.reload();
        }, 1200);
      } else if (data.status === "REJECTED") {
        setLocalStatus("REJECTED");
        setRejectionReason(data.reason || "Super Admin rejected the approval request.");
        toast.error(`❌ Approval rejected: ${data.reason || "Please verify credentials."}`);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [user]);

  // Auto-poll approval status every 4 seconds when in PENDING state (instant unlock when Super Admin updates DB!)
  useEffect(() => {
    if (localStatus !== 'PENDING') return;

    const interval = setInterval(async () => {
      try {
        const res = await api.get('/super-admin/my-approval-status');
        if (res.data?.success) {
          const { wabaApprovalStatus, tenantWhatsAppConnected, latestRequest } = res.data.data;
          if (wabaApprovalStatus === 'APPROVED' && tenantWhatsAppConnected) {
            setLocalStatus('APPROVED');
            toast.success("🎉 Super Admin has approved your Meta WhatsApp Business Account!");
            clearInterval(interval);
            setTimeout(() => {
              window.location.reload();
            }, 1000);
          } else if (wabaApprovalStatus === 'REJECTED') {
            setLocalStatus('REJECTED');
            if (latestRequest?.rejectionReason) {
              setRejectionReason(latestRequest.rejectionReason);
            }
            clearInterval(interval);
          }
        }
      } catch (e) {
        // Silently continue polling
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [localStatus]);

  // Check Approval Status manually
  const handleCheckStatus = async () => {
    setIsCheckingStatus(true);
    try {
      const res = await api.get("/super-admin/my-approval-status");
      if (res.data?.success) {
        const { wabaApprovalStatus, latestRequest } = res.data.data;
        setLocalStatus(wabaApprovalStatus || "NONE");
        if (latestRequest?.rejectionReason) {
          setRejectionReason(latestRequest.rejectionReason);
        }

        if (wabaApprovalStatus === "APPROVED") {
          toast.success("🎉 Account approved by Super Admin! Reloading...");
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        } else if (wabaApprovalStatus === "REJECTED") {
          toast.error(`❌ Request rejected: ${latestRequest?.rejectionReason || "Please contact support."}`);
        } else {
          toast.info("⏳ Your request is currently under review by Super Admin.");
        }
      }
    } catch (err) {
      toast.error("Could not fetch approval status. Please try again.");
    } finally {
      setIsCheckingStatus(false);
    }
  };

  // Load Facebook SDK on mount
  useEffect(() => {
    const appId = import.meta.env.VITE_META_APP_ID || "1401700501230008"; // WhatsApp Embedded Signup App ID

    const initFB = () => {
      if (window.FB && window.FB.init) {
        try {
          window.FB.init({
            appId: appId,
            cookie: true,
            xfbml: true,
            version: "v20.0",
          });
        } catch (err) {
          console.warn("FB Init warning:", err);
        }
        setIsFbInitialized(true);
      }
    };

    // If FB is already loaded on window, initialize it immediately
    if (window.FB && window.FB.login) {
      initFB();
    } else {
      const prevAsyncInit = window.fbAsyncInit;
      window.fbAsyncInit = () => {
        if (typeof prevAsyncInit === "function") prevAsyncInit();
        initFB();
      };

      if (!document.getElementById("facebook-jssdk")) {
        const js = document.createElement("script");
        js.id = "facebook-jssdk";
        js.src = "https://connect.facebook.net/en_US/sdk.js";
        js.async = true;
        js.defer = true;
        js.onload = () => {
          if (window.FB) initFB();
        };
        const fjs = document.getElementsByTagName("script")[0];
        if (fjs && fjs.parentNode) {
          fjs.parentNode.insertBefore(js, fjs);
        } else {
          document.head.appendChild(js);
        }
      }
    }

    // Safety fallback: Poll every 500ms to ensure FB initialized as soon as loaded
    const checkInterval = setInterval(() => {
      if (window.FB && window.FB.login) {
        initFB();
        clearInterval(checkInterval);
      }
    }, 500);

    return () => clearInterval(checkInterval);
  }, []);

  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (isMandatory) return;
    if (overlayRef.current === e.target) {
      onClose();
    }
  };

  // One-click Meta integration (opens Meta popup)
  const handleConnectWhatsApp = (withCatalog) => {
    const appId = import.meta.env.VITE_META_APP_ID || "1401700501230008";

    // Dynamic check: If window.FB exists, ensure init is called and proceed immediately
    if (window.FB && window.FB.init && window.FB.login) {
      try {
        window.FB.init({
          appId: appId,
          cookie: true,
          xfbml: true,
          version: "v20.0",
        });
        setIsFbInitialized(true);
      } catch (e) {
        console.warn("FB init error during click:", e);
      }
    } else if (!isFbInitialized) {
      toast.info("Facebook SDK is initializing... Please wait a moment and click again.");
      return;
    }

    const scopes = [
      "whatsapp_business_management",
      "whatsapp_business_messaging",
      "catalog_management"
    ];

    const configId = import.meta.env.VITE_META_CONFIG_ID || "3478777475636588";

    // Setup listener for Embedded Signup v2 session info
    const sessionInfoListener = (event) => {
      const allowedOrigins = [
        "https://www.facebook.com",
        "https://web.facebook.com",
        "https://facebook.com"
      ];
      if (!allowedOrigins.includes(event.origin)) {
        return;
      }  
      try {
        const data = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
        if (data && data.type === "WA_EMBEDDED_SIGNUP" && data.event === "FINISH") {
          window.lastMetaSessionInfo = data;
          console.log("Captured Meta Session Info:", window.lastMetaSessionInfo);
        }
      } catch (error) {
        // Ignore non-JSON messages
      }
    };
    
    window.addEventListener("message", sessionInfoListener);


    window.FB.login(
      (response) => {
        if (response.authResponse) {
          const code = response.authResponse.code;
          console.log("Meta Auth Response:", response);
          if (code) {
            setIsConnecting(true);
            
            // Wait briefly to ensure message event is processed
            setTimeout(() => {
              const sessionInfo = window.lastMetaSessionInfo || {};
              window.removeEventListener("message", sessionInfoListener);
              window.lastMetaSessionInfo = null;

              api.post('/whatsapp/embedded-signup-callback', { 
                code,
                eventData: sessionInfo
              })
                .then((res) => {
                  if (res.data?.success) {
                    setLocalStatus("PENDING");
                    setShowReconfigure(false);
                    toast.success("✅ Meta WhatsApp Account connected! Submitted to Super Admin for approval.");
                    if (!isMandatory) {
                      onClose();
                    }
                  } else {
                    toast.error(res.data?.message || "Failed to connect WhatsApp account");
                  }
                })
                .catch((err) => {
                  console.error("Error connecting OAuth:", err);
                  toast.error(err.response?.data?.message || "Error connecting WhatsApp account");
                })
                .finally(() => {
                  setIsConnecting(false);
                });
            }, 500);
          } else {
             alert("Authenticated, but no code received.");
             window.removeEventListener("message", sessionInfoListener);
          }
        } else {
          console.log("User cancelled login or did not fully authorize.");
          window.removeEventListener("message", sessionInfoListener);
        }
      },
      {
        config_id: configId,
        response_type: "code",
        override_default_response_type: true,
        auth_type: "rerequest",
        return_scopes: true,
        extras: {
          feature: "whatsapp_embedded_signup",
          version: 2,
          sessionInfoVersion: "2",
          setup: {}
        },
        scope: scopes.join(",")
      }
    );
  };

  // Alternative manual connection
  const handleAlternativeConnect = async () => {
    if (!wabaId.trim() || !accessToken.trim()) {
      setError("Please fill in both fields.");
      return;
    }
    setError("");
    setIsConnecting(true);

    try {
      const res = await api.post('/whatsapp/connect-manual', { 
        wabaId, 
        accessToken
      });

      if (res.data?.success) {
        setLocalStatus("PENDING");
        setShowReconfigure(false);
        toast.success("✅ Meta credentials submitted! Awaiting Super Admin approval.");
        if (!isMandatory) {
          onClose();
        }
      } else {
        toast.error(res.data?.message || "Failed to connect WhatsApp account");
        setError(res.data?.message || "Connection failed");
      }
    } catch (err) {
      console.error("Error connecting manually:", err);
      const errorMessage = err.response?.data?.message || "Error connecting WhatsApp account manually. Please check your credentials.";
      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm font-['Urbanist']"
      style={{ animation: "fadeIn 0.2s ease-out" }}
    >
      <div
        className="relative w-full max-w-[900px] mx-4 sm:mx-6 max-h-[90vh] flex flex-col bg-white rounded-2xl shadow-2xl overflow-hidden"
        style={{ animation: "slideUp 0.3s ease-out" }}
      >
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4 lg:py-5 border-b border-gray-100 bg-gradient-to-r from-emerald-50/80 to-white">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              {(localStatus === 'PENDING' || localStatus === 'REJECTED') && !showReconfigure
                ? (localStatus === 'REJECTED' ? "Meta Account Approval Rejected" : "Meta Account Under Review")
                : (isMandatory ? "Verify your Meta Business Account" : "Connect WhatsApp Business")}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              {(localStatus === 'PENDING' || localStatus === 'REJECTED') && !showReconfigure
                ? (localStatus === 'REJECTED' 
                    ? "Your connection request was rejected by Super Admin. Re-connect or contact support." 
                    : "Awaiting approval from Messbee Super Admin (admin.messbee.com)")
                : (isMandatory ? "You must connect your Meta account to access all features." : "Choose your preferred integration method")}
            </p>
          </div>
          {!isMandatory ? (
            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-bold text-slate-500 hover:text-red-600 hover:bg-red-50 border border-slate-200 rounded-lg transition-colors"
            >
              Logout
            </button>
          )}
        </div>

        {/* Body — Scrollable */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {isAgent ? (
            <div className="col-span-1 md:col-span-2 text-center p-8 sm:p-12 bg-red-50 rounded-xl border border-red-100">
              <svg className="w-12 h-12 sm:w-16 sm:h-16 text-red-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <h3 className="text-lg sm:text-xl font-bold text-slate-800">Administrator Access Required</h3>
              <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-md mx-auto">
                Only the workspace owner or an administrator can connect the WhatsApp Business Account. Please contact your administrator to complete this setup.
              </p>
            </div>
          ) : (localStatus === 'PENDING' || localStatus === 'REJECTED') && !showReconfigure ? (
            /* Review Card */
            <div className="col-span-1 md:col-span-2 flex flex-col items-center justify-center py-6 px-4 sm:px-8 text-center max-w-2xl mx-auto">
              {/* Animated Status Icon */}
              <div className="relative mb-5">
                <div className={`w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg ${
                  localStatus === 'REJECTED' 
                    ? 'bg-red-50 text-red-600 border border-red-200' 
                    : 'bg-amber-50 text-amber-600 border border-amber-200'
                }`}>
                  {localStatus === 'REJECTED' ? (
                    <ExclamationTriangleIcon className="w-10 h-10" />
                  ) : (
                    <ClockIcon className="w-10 h-10 animate-pulse" />
                  )}
                </div>
                <span className={`absolute -bottom-2 -right-2 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-full text-white shadow-sm ${
                  localStatus === 'REJECTED' ? 'bg-red-600' : 'bg-amber-500'
                }`}>
                  {localStatus === 'REJECTED' ? 'Rejected' : 'Pending Review'}
                </span>
              </div>

              {/* Title & Description */}
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {localStatus === 'REJECTED' ? 'Approval Request Rejected' : 'Meta Business Account Under Review'}
              </h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed max-w-lg">
                {localStatus === 'REJECTED' ? (
                  rejectionReason || "Your Meta WhatsApp Business account connection was rejected by the Super Admin. Please reconfigure your credentials or contact support."
                ) : (
                  "Your Meta WhatsApp Business account has been linked successfully. To prevent platform abuse and ensure Meta compliance, an administrator at Messbee is reviewing your business details."
                )}
              </p>

              {/* Details Box */}
              <div className="w-full mt-6 bg-slate-50 border border-slate-200/80 rounded-2xl p-4 sm:p-5 text-left text-xs sm:text-sm space-y-3">
                <div className="flex items-center justify-between py-1 border-b border-slate-200/60">
                  <span className="font-semibold text-slate-500">Integration Type</span>
                  <span className="font-bold text-slate-800 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                    Official Meta Cloud API
                  </span>
                </div>
                {user?.whatsappConfig?.wabaId && (
                  <div className="flex items-center justify-between py-1 border-b border-slate-200/60">
                    <span className="font-semibold text-slate-500">WABA ID</span>
                    <span className="font-mono text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {user.whatsappConfig.wabaId}
                    </span>
                  </div>
                )}
                {user?.whatsappConfig?.phoneNumberId && (
                  <div className="flex items-center justify-between py-1 border-b border-slate-200/60">
                    <span className="font-semibold text-slate-500">Phone Number ID</span>
                    <span className="font-mono text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {user.whatsappConfig.phoneNumberId}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between py-1 border-b border-slate-200/60">
                  <span className="font-semibold text-slate-500">Super Admin Portal</span>
                  <a 
                    href="https://admin.messbee.com/" 
                    target="_blank" 
                    rel="noreferrer"
                    className="font-medium text-emerald-600 hover:underline"
                  >
                    admin.messbee.com
                  </a>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="font-semibold text-slate-500">Approval Status</span>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                    localStatus === 'REJECTED' 
                      ? 'bg-red-100 text-red-700' 
                      : 'bg-amber-100 text-amber-700'
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${
                      localStatus === 'REJECTED' ? 'bg-red-500' : 'bg-amber-500 animate-ping'
                    }`}></span>
                    {localStatus === 'REJECTED' ? 'REJECTED' : 'AWAITING APPROVAL'}
                  </span>
                </div>
              </div>

              {/* Live status notice */}
              <div className="mt-4 flex items-center justify-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-4 py-2.5 rounded-xl">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
                Real-time listener active — This screen will automatically unlock once approved!
              </div>

              {/* Action buttons */}
              <div className="w-full mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={handleCheckStatus}
                  disabled={isCheckingStatus}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md transition-all active:scale-95"
                >
                  <ArrowPathIcon className={`w-4 h-4 ${isCheckingStatus ? 'animate-spin' : ''}`} />
                  {isCheckingStatus ? "Checking Status..." : "Check Status Now"}
                </button>

                <button
                  onClick={() => setShowReconfigure(true)}
                  className="w-full sm:w-auto px-5 py-2.5 text-xs sm:text-sm font-bold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-all"
                >
                  Reconnect / Change Account
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* If user is reconfiguring, show a banner to go back */}
              {showReconfigure && (
                <div className="col-span-1 md:col-span-2 flex items-center justify-between p-3 bg-amber-50 border border-amber-200 rounded-xl mb-1 text-xs text-amber-900 font-medium">
                  <span>Reconfiguring your Meta account connection.</span>
                  <button 
                    onClick={() => setShowReconfigure(false)}
                    className="font-bold text-amber-800 underline hover:text-amber-950"
                  >
                    ← Return to Review Status
                  </button>
                </div>
              )}
              {/* Card 1: Recommended — One Click */}
              <div className="relative border-2 border-emerald-200 rounded-xl p-4 sm:p-5 lg:p-6 bg-gradient-to-b from-emerald-50/50 to-white hover:shadow-lg transition-shadow group h-full flex flex-col">
            {/* Recommended Badge */}
            <span className="absolute -top-2.5 left-4 sm:left-6 px-2.5 py-0.5 bg-emerald-500 text-white text-[9px] sm:text-[10px] font-bold uppercase tracking-wider rounded-full shadow-sm">
              Recommended
            </span>

            <div className="text-center mt-2 flex-1">
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                Connect WhatsApp Business
              </h3>
              <p className="text-xs sm:text-sm text-emerald-600 font-medium mt-1">
                One Click Business Integration
              </p>

              {/* Connect Buttons */}
              <div className="mt-5 sm:mt-6 flex flex-col gap-3">
                <button
                  onClick={() => handleConnectWhatsApp(true)}
                  className="w-full inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-lg shadow-emerald-200 hover:shadow-emerald-300 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  <span className="leading-tight text-center">Connect WhatsApp With Catalog Permission</span>
                </button>
                <button
                  onClick={() => handleConnectWhatsApp(false)}
                  className="w-full inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3 bg-gradient-to-r from-violet-400 to-indigo-400 hover:from-violet-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-bold rounded-xl shadow-lg shadow-violet-200 hover:shadow-violet-300 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  <span className="leading-tight text-center">Connect WhatsApp Without Catalog Permission</span>
                </button>
              </div>
            </div>

            {/* Info Points */}
            <ul className="mt-5 sm:mt-6 space-y-2 sm:space-y-3">
              <li className="flex items-start gap-2 sm:gap-2.5">
                <CheckCircleIcon className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500 shrink-0 mt-0.5" />
                <span className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  The seamless integration will open in a pop-up. Make sure your browser is not blocking pop-ups.
                </span>
              </li>
              <li className="flex items-start gap-2 sm:gap-2.5">
                <CheckCircleIcon className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500 shrink-0 mt-0.5" />
                <span className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  You will be asked to provide a phone number for WhatsApp Business integration. We strongly recommend using a new phone number.
                </span>
              </li>
              <li className="flex items-start gap-2 sm:gap-2.5">
                <CheckCircleIcon className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500 shrink-0 mt-0.5" />
                <span className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  However, if you already have a WhatsApp account associated with that number, back up your WhatsApp data and then delete that account.
                </span>
              </li>
            </ul>
          </div>

          {/* Card 2: Alternative — Manual */}
          <div className="border border-gray-200 rounded-xl p-4 sm:p-5 lg:p-6 bg-white hover:shadow-lg transition-shadow h-full flex flex-col justify-between">
            <div>
              <div className="text-center">
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  Connect WhatsApp Business
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Connect your WhatsApp account
                </p>
                <span className="inline-block mt-1.5 px-2.5 py-0.5 bg-slate-100 text-slate-500 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider rounded-full">
                  Alternative
                </span>
              </div>

              {/* WhatsApp Icon + Label */}
              <div className="flex items-center gap-2.5 sm:gap-3 mt-5 sm:mt-6 mb-4 sm:mb-5">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 sm:w-7 sm:h-7 text-emerald-500" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-bold text-emerald-600">WhatsApp</h4>
                  <div className="flex items-center gap-1 sm:gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-500"></span>
                    <span className="text-[10px] sm:text-xs text-slate-500 font-medium leading-none">Alternative account connection</span>
                  </div>
                </div>
              </div>

              {/* Form Fields */}
              <div>
                <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-2 sm:mb-3">
                  Business Account ID + Access Token
                </label>

                <div className="space-y-2.5 sm:space-y-3">
                  <input
                    type="text"
                    value={wabaId}
                    onChange={(e) => { setWabaId(e.target.value); setError(""); }}
                    placeholder="WhatsApp Business Account ID"
                    className="w-full px-3 py-2.5 sm:px-4 sm:py-3 border border-gray-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all font-medium"
                  />
                  <input
                    type="password"
                    value={accessToken}
                    onChange={(e) => { setAccessToken(e.target.value); setError(""); }}
                    placeholder="Access Token"
                    className="w-full px-3 py-2.5 sm:px-4 sm:py-3 border border-gray-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all font-medium"
                  />
                </div>

                {error && (
                  <p className="mt-2 text-[10px] sm:text-xs text-red-500 font-medium">{error}</p>
                )}
              </div>
            </div>
            
            <button
              onClick={handleAlternativeConnect}
              disabled={isConnecting}
              className="mt-5 sm:mt-6 w-full py-2.5 sm:py-3 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white text-xs sm:text-sm font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {isConnecting ? (
                <>
                  <svg className="animate-spin w-3.5 h-3.5 sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Connecting...
                </>
              ) : (
                "Connect Account"
              )}
            </button>
          </div>
          </>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-4 border-t border-gray-100 bg-gray-50/50">
          <p className="text-xs text-slate-400 text-center">
            Need help? Check our{" "}
            <a href="#" className="text-emerald-600 font-semibold hover:underline">
              WhatsApp Integration Guide
            </a>{" "}
            or contact{" "}
            <a href="mailto:support@messbee.com" className="text-emerald-600 font-semibold hover:underline">
              support@messbee.com
            </a>
          </p>
        </div>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
};

export default ConnectWhatsAppModal;
