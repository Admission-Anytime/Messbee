import React, { useState, useRef, useEffect } from "react";
import { XMarkIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import api from "../../context/axios";
import { toast } from "react-toastify";

const ConnectWhatsAppModal = ({ isOpen, onClose, isMandatory = false, user }) => {
  const overlayRef = useRef();
  
  // Check if user is agent/employee (not allowed to connect)
  const isAgent = user?.role === 'agent' || user?.role === 'AGENT' || user?.role === 'user';
  const [wabaId, setWabaId] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState("");
  const [isFbInitialized, setIsFbInitialized] = useState(false);

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
    ];

    if (withCatalog) {
      scopes.push("catalog_management");
    }

    const configId = import.meta.env.VITE_META_CONFIG_ID || "3478777475636588";

    // Setup listener for Embedded Signup v2 session info
    const sessionInfoListener = (event) => {
      if (event.origin !== "https://www.facebook.com" && event.origin !== "https://web.facebook.com") {
        return;
      }  
      try {
        const data = JSON.parse(event.data);
        if (data.type === "WA_EMBEDDED_SIGNUP" && data.event === "FINISH") {
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
                    toast.success("WhatsApp Business Account connected successfully!");
                    if (!isMandatory) {
                      onClose();
                    } else {
                      window.location.reload(); // Reload to refresh global state and clear lock
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
        toast.success("WhatsApp Business Account connected manually!");
        if (!isMandatory) {
          onClose();
        } else {
          window.location.reload(); // Reload to refresh global state and clear lock
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
        className="relative w-full max-w-[900px] mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden"
        style={{ animation: "slideUp 0.3s ease-out" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-gray-100 bg-gradient-to-r from-emerald-50/80 to-white">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {isMandatory ? "Verify your Meta Business Account" : "Connect WhatsApp Business"}
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              {isMandatory ? "You must connect your Meta account to access all features." : "Choose your preferred integration method"}
            </p>
          </div>
          {!isMandatory && (
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Body — Conditional Rendering for Agents vs Admins */}
        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {isAgent ? (
            <div className="col-span-1 md:col-span-2 text-center p-12 bg-red-50 rounded-xl border border-red-100">
              <svg className="w-16 h-16 text-red-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <h3 className="text-xl font-bold text-slate-800">Administrator Access Required</h3>
              <p className="mt-2 text-slate-600 max-w-md mx-auto">
                Only the workspace owner or an administrator can connect the WhatsApp Business Account. Please contact your administrator to complete this setup.
              </p>
            </div>
          ) : (
            <>
              {/* Card 1: Recommended — One Click */}
              <div className="relative border-2 border-emerald-200 rounded-xl p-6 bg-gradient-to-b from-emerald-50/50 to-white hover:shadow-lg transition-shadow group">
            {/* Recommended Badge */}
            <span className="absolute -top-3 left-6 px-3 py-0.5 bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-wider rounded-full shadow-sm">
              Recommended
            </span>

            <div className="text-center mt-2">
              <h3 className="text-lg font-bold text-slate-900">
                Connect WhatsApp Business
              </h3>
              <p className="text-sm text-emerald-600 font-medium mt-1">
                One Click Business Integration
              </p>

              {/* Connect Buttons */}
              <div className="mt-6 flex flex-col gap-3">
                <button
                  onClick={() => handleConnectWhatsApp(true)}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-emerald-200 hover:shadow-emerald-300 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  <span className="leading-tight text-center">Connect WhatsApp With Catalog Permission</span>
                </button>
                <button
                  onClick={() => handleConnectWhatsApp(false)}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-violet-400 to-indigo-400 hover:from-violet-500 hover:to-indigo-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-violet-200 hover:shadow-violet-300 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  <span className="leading-tight text-center">Connect WhatsApp Without Catalog Permission</span>
                </button>
              </div>
            </div>

            {/* Info Points */}
            <ul className="mt-6 space-y-3">
              <li className="flex items-start gap-2.5">
                <CheckCircleIcon className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <span className="text-sm text-slate-600 leading-relaxed">
                  The seamless integration will open in a pop-up. Make sure your browser is not blocking pop-ups.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircleIcon className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <span className="text-sm text-slate-600 leading-relaxed">
                  You will be asked to provide a phone number for WhatsApp Business integration. We strongly recommend using a new phone number.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircleIcon className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <span className="text-sm text-slate-600 leading-relaxed">
                  However, if you already have a WhatsApp account associated with that number, back up your WhatsApp data and then delete that account.
                </span>
              </li>
            </ul>
          </div>

          {/* Card 2: Alternative — Manual */}
          <div className="border border-gray-200 rounded-xl p-6 bg-white hover:shadow-lg transition-shadow">
            <div className="text-center">
              <h3 className="text-lg font-bold text-slate-900">
                Connect WhatsApp Business
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                Connect your WhatsApp account
              </p>
              <span className="inline-block mt-1 px-2.5 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-wider rounded-full">
                Alternative
              </span>
            </div>

            {/* WhatsApp Icon + Label */}
            <div className="flex items-center gap-3 mt-6 mb-5">
              <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center">
                <svg className="w-7 h-7 text-emerald-500" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </div>
              <div>
                <h4 className="text-base font-bold text-emerald-600">WhatsApp</h4>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span className="text-xs text-slate-500 font-medium">Alternative account connection</span>
                </div>
              </div>
            </div>

            {/* Form Fields */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-3">
                Business Account ID + Access Token
              </label>

              <div className="space-y-3">
                <input
                  type="text"
                  value={wabaId}
                  onChange={(e) => { setWabaId(e.target.value); setError(""); }}
                  placeholder="WhatsApp Business Account ID"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all font-medium"
                />
                <input
                  type="password"
                  value={accessToken}
                  onChange={(e) => { setAccessToken(e.target.value); setError(""); }}
                  placeholder="Access Token"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all font-medium"
                />
              </div>

              {error && (
                <p className="mt-2 text-xs text-red-500 font-medium">{error}</p>
              )}

              <button
                onClick={handleAlternativeConnect}
                disabled={isConnecting}
                className="mt-4 w-full py-3 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white text-sm font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {isConnecting ? (
                  <>
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
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
