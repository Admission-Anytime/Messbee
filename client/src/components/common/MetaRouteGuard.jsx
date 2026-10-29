import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { userContext } from "../../context/Context";
import { Lock, Sparkles, ArrowRight, ArrowLeft, MessageSquare, ShieldAlert } from "lucide-react";

/**
 * MetaRouteGuard - Prevents Free QR WhatsApp users from accessing Meta-exclusive features
 * (Campaigns, Templates, Automation, etc.) even if they inspect element or type the URL directly.
 * 
 * If the user is on the Free QR WhatsApp channel, this guard completely blocks rendering
 * the child component, preventing any DOM leakage, hook execution, or API calls.
 */
const MetaRouteGuard = ({
  children,
  featureName = "Meta Cloud Feature",
  description,
}) => {
  const { user, openConnectWhatsApp } = useContext(userContext);
  const navigate = useNavigate();

  const isFreeTier = user?.whatsappChannelType === "free_qr";

  // If user is NOT on free_qr, allow access to Meta features
  if (!isFreeTier) {
    return <>{children}</>;
  }

  // If user IS on free_qr, strictly block access and show premium lock screen
  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6 font-['Urbanist'] bg-[#F8FAFC]">
      <div className="max-w-xl w-full bg-white rounded-3xl p-8 md:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.06)] border border-slate-100 text-center relative overflow-hidden">
        {/* Top gradient accent */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600" />

        {/* Lock Icon Circle with Meta Badge */}
        <div className="relative w-20 h-20 mx-auto mb-6">
          <div className="w-20 h-20 rounded-3xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm">
            <Lock className="w-9 h-9" />
          </div>
          <div className="absolute -bottom-1 -right-1 bg-blue-600 text-white p-1.5 rounded-full shadow-md">
            <ShieldAlert className="w-4 h-4" />
          </div>
        </div>

        {/* Channel Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200/60 text-amber-800 text-xs font-bold mb-4">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          <span>Active Channel: Free WhatsApp Web (QR Scan)</span>
        </div>

        {/* Heading */}
        <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-3 tracking-tight">
          {featureName} Requires Meta WABA
        </h2>

        {/* Description */}
        <p className="text-sm text-slate-500 leading-relaxed mb-6 max-w-md mx-auto">
          {description ||
            `This feature is powered exclusively by Meta's Official WhatsApp Cloud API (WABA). Your account is currently using Free WhatsApp Web (QR Scan), which supports 1-on-1 Chat, Media Sharing, and Free Commerce & Inventory.`}
        </p>

        {/* Feature Comparison Box */}
        <div className="bg-slate-50 rounded-2xl p-5 text-left border border-slate-100 mb-8 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
            <Sparkles className="w-4 h-4 text-indigo-500 flex-shrink-0" />
            <span>Why is this locked for Free QR users?</span>
          </div>
          <ul className="text-xs text-slate-600 space-y-2 pl-6 list-disc">
            <li>
              <strong>Broadcast Campaigns:</strong> High-volume bulk messaging requires Meta's official spam compliance and Cloud servers.
            </li>
            <li>
              <strong>Approved Templates:</strong> Official interactive buttons and LTO cards must be pre-approved by Meta Graph API.
            </li>
            <li>
              <strong>Automations & Chatbots:</strong> Flow engines communicate directly with Meta's cloud webhooks.
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => navigate("/admin/chat")}
            className="flex-1 py-3.5 px-4 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
          >
            <MessageSquare className="w-4 h-4 text-emerald-600" />
            <span>Open Free 1-on-1 Chat</span>
          </button>
          <button
            onClick={() => {
              if (openConnectWhatsApp) {
                openConnectWhatsApp();
              } else {
                navigate("/admin/setting/wapi");
              }
            }}
            className="flex-1 py-3.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold transition-all shadow-md shadow-indigo-200 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Connect Official Meta WABA</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <p className="mt-4 text-xs text-slate-400">
          Already have Meta API credentials?{" "}
          <button
            onClick={() => navigate("/admin/setting/wapi")}
            className="text-indigo-600 hover:underline font-bold cursor-pointer"
          >
            Configure in WhatsApp Settings
          </button>
        </p>
      </div>
    </div>
  );
};

export default MetaRouteGuard;
