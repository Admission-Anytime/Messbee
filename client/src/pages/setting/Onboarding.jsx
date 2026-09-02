import React, { useState, useEffect, useContext, useRef, useCallback } from "react";
import { 
  CheckCircle2, 
  ArrowRight, 
  Smartphone, 
  MessageSquare, 
  Users, 
  BookOpen, 
  RotateCw, 
  Sparkles, 
  Radio
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "../../context/axios";
import { userContext } from "../../context/Context";
import logoIcon from "../../assets/MessBee Logo.png";
import io from "socket.io-client";

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  (import.meta.env.VITE_API_URL
    ? String(import.meta.env.VITE_API_URL).replace(/\/api\/?$/, '')
    : '');

export default function Onboarding() {
  const navigate = useNavigate();
  const { user } = useContext(userContext);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const socketRef = useRef(null);

  const [steps, setSteps] = useState([
    {
      id: "whatsapp",
      title: "Connect WhatsApp API",
      description: "Link your WhatsApp Business account to start sending and receiving messages.",
      icon: <Smartphone className="w-6 h-6 text-blue-500" />,
      completed: false,
      actionText: "Configure Now",
      path: "/admin/settings/whatsapp"
    },
    {
      id: "welcome",
      title: "Setup Welcome Message",
      description: "Create an automated welcome message for new customers who reach out.",
      icon: <MessageSquare className="w-6 h-6 text-amber-500" />,
      completed: false,
      actionText: "Create Message",
      path: "/admin/automation"
    },
    {
      id: "team",
      title: "Invite Team Members",
      description: "Add agents and managers to collaborate on responding to customer chats.",
      icon: <Users className="w-6 h-6 text-green-500" />,
      completed: false,
      actionText: "Manage Team",
      path: "/admin/settings/teams"
    },
    {
      id: "templates",
      title: "Create Message Templates",
      description: "Submit templates to Meta for approval to send outbound notifications.",
      icon: <BookOpen className="w-6 h-6 text-purple-500" />,
      completed: false,
      actionText: "Create Template",
      path: "/admin/templates/create"
    }
  ]);

  // Real-time resilient progress checker
  const checkProgress = useCallback(async (silent = false) => {
    if (!silent) setIsRefreshing(true);

    try {
      // Run all checks in parallel with allSettled to prevent single-point failures
      const [waResult, channelResult, tenantResult, autoResult, teamResult, templateResult] =
        await Promise.allSettled([
          axios.get("/settings/whatsapp_config"),
          axios.get("/whatsapp/channels"),
          axios.get("/tenant-settings"),
          axios.get("/automation"),
          axios.get("/users"),
          axios.get("/whatsapp/templates")
        ]);

      // 1. WhatsApp Connection Check
      const waConfigVal = waResult.status === "fulfilled" ? waResult.value.data?.value : null;
      const channels = channelResult.status === "fulfilled" && Array.isArray(channelResult.value.data) ? channelResult.value.data : [];
      const hasWaConfig = Boolean(
        user?.tenantWhatsAppConnected ||
        user?.whatsappConfig?.wabaId ||
        user?.whatsappConfig?.accessToken ||
        waConfigVal?.businessAccountId ||
        waConfigVal?.accessToken ||
        waConfigVal?.phoneNumberId ||
        channels.length > 0
      );

      // 2. Welcome Message / Automation Check
      const tenantData = tenantResult.status === "fulfilled" ? tenantResult.value.data : null;
      const automations = autoResult.status === "fulfilled" && Array.isArray(autoResult.value.data) ? autoResult.value.data : [];
      const hasWelcome = Boolean(
        tenantData?.welcomeMessage?.enabled ||
        (tenantData?.welcomeMessage?.message && tenantData.welcomeMessage.message.trim().length > 0) ||
        automations.length > 0
      );

      // 3. Team Members Check
      let teamList = [];
      if (teamResult.status === "fulfilled") {
        const d = teamResult.value.data;
        teamList = Array.isArray(d) ? d : Array.isArray(d?.data) ? d.data : Array.isArray(d?.users) ? d.users : [];
      }
      const hasTeam = teamList.length > 1;

      // 4. Templates Check
      let templateList = [];
      if (templateResult.status === "fulfilled") {
        const t = templateResult.value.data;
        templateList = Array.isArray(t) ? t : Array.isArray(t?.data) ? t.data : Array.isArray(t?.templates) ? t.templates : [];
      }
      const hasTemplates = templateList.length > 0;

      // Update state
      setSteps(prev =>
        prev.map(step => {
          if (step.id === "whatsapp") return { ...step, completed: hasWaConfig };
          if (step.id === "welcome") return { ...step, completed: hasWelcome };
          if (step.id === "team") return { ...step, completed: hasTeam };
          if (step.id === "templates") return { ...step, completed: hasTemplates };
          return step;
        })
      );

      setLastUpdated(new Date());
    } catch (err) {
      console.error("Error during real-time onboarding check:", err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [user]);

  // Initial load + periodic polling (every 4 seconds for real-time responsiveness)
  useEffect(() => {
    checkProgress();

    const interval = setInterval(() => {
      checkProgress(true);
    }, 4000);

    // Refresh immediately when user returns to window/tab
    const onFocus = () => checkProgress(true);
    window.addEventListener("focus", onFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
  }, [checkProgress]);

  // Socket.IO Real-Time listeners
  useEffect(() => {
    if (!SOCKET_URL) return;

    try {
      socketRef.current = io(SOCKET_URL, { withCredentials: true });

      const handleRealtimeEvent = () => {
        checkProgress(true);
      };

      socketRef.current.on("whatsapp_connected", handleRealtimeEvent);
      socketRef.current.on("channel_connected", handleRealtimeEvent);
      socketRef.current.on("template_created", handleRealtimeEvent);
      socketRef.current.on("template_updated", handleRealtimeEvent);
      socketRef.current.on("automation_updated", handleRealtimeEvent);
      socketRef.current.on("user_created", handleRealtimeEvent);
      socketRef.current.on("settings_updated", handleRealtimeEvent);

      return () => {
        if (socketRef.current) {
          socketRef.current.off("whatsapp_connected", handleRealtimeEvent);
          socketRef.current.off("channel_connected", handleRealtimeEvent);
          socketRef.current.off("template_created", handleRealtimeEvent);
          socketRef.current.off("template_updated", handleRealtimeEvent);
          socketRef.current.off("automation_updated", handleRealtimeEvent);
          socketRef.current.off("user_created", handleRealtimeEvent);
          socketRef.current.off("settings_updated", handleRealtimeEvent);
          socketRef.current.disconnect();
        }
      };
    } catch (e) {
      console.warn("Socket connection warning:", e);
    }
  }, [checkProgress]);

  const completedCount = steps.filter(s => s.completed).length;
  const progressPercent = Math.round((completedCount / steps.length) * 100);

  return (
    <div className="max-w-4xl mx-auto p-6 animate-fade-in font-sans">
      <style>{`
        @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      {/* Header Card */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 rounded-3xl p-8 text-white shadow-xl mb-8 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center justify-between flex-wrap gap-4 mb-2">
            <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2.5">
              Welcome to Messbee!
              <img src={logoIcon} alt="Messbee Logo" className="w-8 h-8 object-contain inline-block -mt-1 drop-shadow" />
            </h1>

            {/* Live Indicator + Refresh Button */}
            <div className="flex items-center gap-2 bg-white/15 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 text-xs">
              <span className="flex items-center gap-1.5 text-emerald-300 font-semibold">
                <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-300" />
                Live Sync
              </span>
              <span className="text-white/40">|</span>
              <button
                onClick={() => checkProgress(false)}
                disabled={isRefreshing}
                className="flex items-center gap-1 text-white hover:text-white/80 transition-colors cursor-pointer"
                title="Refresh Status"
              >
                <RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-emerald-300" : ""}`} />
                <span>{isRefreshing ? "Checking..." : "Refresh"}</span>
              </button>
            </div>
          </div>

          <p className="text-blue-100 max-w-lg mb-6 text-sm sm:text-base leading-relaxed">
            Let's get your workspace completely set up. Follow these quick steps to unlock the full power of your WhatsApp automation.
          </p>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 shadow-inner">
            <div className="flex items-center justify-between mb-3">
              <span className="font-semibold text-base sm:text-lg flex items-center gap-2">
                Setup Progress
                {progressPercent === 100 && <Sparkles className="w-5 h-5 text-amber-300 animate-bounce" />}
              </span>
              <span className="font-extrabold text-lg sm:text-xl tracking-tight text-white">{progressPercent}%</span>
            </div>

            <div className="w-full h-3.5 bg-black/20 rounded-full overflow-hidden p-0.5 border border-white/10">
              <div 
                className="h-full bg-gradient-to-r from-emerald-400 to-green-500 rounded-full transition-all duration-700 ease-out shadow-sm"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <div className="flex items-center justify-between mt-3 text-xs sm:text-sm text-blue-100 font-medium">
              <p>
                {completedCount === steps.length 
                  ? "🎉 All caught up! You are ready to go." 
                  : `You have completed ${completedCount} out of ${steps.length} essential steps.`}
              </p>
              <span className="text-xs text-blue-200/70 hidden sm:inline">
                Updated {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            </div>
          </div>
        </div>

        {/* Decorative background shapes */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 right-32 -mb-10 w-48 h-48 bg-blue-400 opacity-20 rounded-full blur-2xl pointer-events-none"></div>
      </div>

      {/* Checklist */}
      <div className="space-y-4">
        {loading ? (
          // Skeleton loading state
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center gap-4 animate-pulse">
              <div className="w-14 h-14 bg-gray-200 rounded-2xl"></div>
              <div className="flex-1">
                <div className="h-5 bg-gray-200 rounded w-1/3 mb-2"></div>
                <div className="h-4 bg-gray-100 rounded w-2/3"></div>
              </div>
            </div>
          ))
        ) : (
          steps.map((step) => (
            <div 
              key={step.id} 
              className={`group bg-white rounded-2xl p-6 border transition-all duration-300 ${
                step.completed 
                  ? "border-emerald-200 bg-gradient-to-r from-emerald-50/40 via-white to-white shadow-sm" 
                  : "border-gray-100 hover:border-blue-200 hover:shadow-md"
              }`}
            >
              <div className="flex items-start gap-5">
                {/* Icon Circle */}
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 transition-colors ${
                  step.completed ? "bg-emerald-100 text-emerald-600" : "bg-gray-50 group-hover:bg-blue-50"
                }`}>
                  {step.completed ? (
                    <CheckCircle2 className="w-7 h-7 text-emerald-600" />
                  ) : (
                    step.icon
                  )}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
                    <h3 className="text-lg font-bold text-gray-900">
                      {step.title}
                    </h3>
                    {step.completed ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-100/80 px-3 py-1 rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Completed
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                        Pending
                      </span>
                    )}
                  </div>

                  <p className="text-gray-500 text-sm mb-4 leading-relaxed">
                    {step.description}
                  </p>
                  
                  {/* Action Button */}
                  {!step.completed && (
                    <button 
                      onClick={() => navigate(step.path)}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl text-sm font-bold transition-all shadow-sm active:translate-y-px cursor-pointer"
                    >
                      {step.actionText}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

