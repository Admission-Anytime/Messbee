import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { userContext } from "../../context/Context";
import { hasPlanFeature, getRequiredPlan } from "../../utils/planLimits";
import { Lock, Sparkles, ArrowRight, ArrowLeft } from "lucide-react";

/**
 * PlanGuard - Restricts route or component based on user's subscription plan.
 * @param {string} feature - Feature key defined in planLimits (e.g. 'developerApi', 'commerce', 'appsIntegration', 'webhook')
 * @param {React.ReactNode} children - Component to render if access is granted
 * @param {string} title - Optional title to display in lock card
 * @param {string} description - Optional description to display in lock card
 */
const PlanGuard = ({
  feature,
  children,
  title,
  description,
}) => {
  const { user } = useContext(userContext);
  const navigate = useNavigate();

  const currentPlan = (user?.subscriptionPlan || "free").toLowerCase();
  const isAllowed = hasPlanFeature(currentPlan, feature);

  if (isAllowed) {
    return <>{children}</>;
  }

  const req = getRequiredPlan(feature);
  const currentPlanCapitalized =
    currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1);

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-6 font-['Urbanist'] bg-[#F8FAFC]">
      <div className="max-w-lg w-full bg-white rounded-3xl p-8 md:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.06)] border border-slate-100 text-center relative overflow-hidden">
        {/* Top gradient accent */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 to-teal-500" />

        {/* Lock Icon Circle */}
        <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto mb-6 text-emerald-600 shadow-sm">
          <Lock className="w-8 h-8" />
        </div>

        {/* Plan badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold mb-4">
          <span>Current: {currentPlanCapitalized} Plan</span>
        </div>

        {/* Heading */}
        <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-3 tracking-tight">
          {title || `${req.name} Plan Required`}
        </h2>

        {/* Description */}
        <p className="text-sm text-slate-500 leading-relaxed mb-8 max-w-md mx-auto">
          {description ||
            `This feature is available exclusively on the ${req.name} plan and above. Upgrade your plan today to unlock this and many more powerful tools.`}
        </p>

        {/* Benefits Box */}
        <div className="bg-slate-50 rounded-2xl p-4 text-left border border-slate-100 mb-8 space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
            <Sparkles className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            <span>Unlock with {req.name}:</span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed pl-6">
            Instant access to this feature, higher limits, advanced messaging automations, and priority support.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex-1 py-3 px-4 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go Back</span>
          </button>
          <button
            onClick={() => navigate("/admin/plan/upgrade")}
            className="flex-1 py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-all shadow-md shadow-emerald-200 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Upgrade Plan</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlanGuard;
