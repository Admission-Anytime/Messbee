import React from "react";
import { Lock, Sparkles, ArrowRight, X, CheckCircle2 } from "lucide-react";

/**
 * Universal UpgradePromptModal
 * Displays a popup whenever a user attempts to access a locked feature based on their current subscription plan.
 */
export default function UpgradePromptModal({
  isOpen,
  onClose,
  featureName = "This Feature",
  currentPlan = "Free",
  requiredPlan = "Growth",
  description,
  benefits = [],
}) {
  if (!isOpen) return null;

  const handleUpgrade = () => {
    onClose();
    try {
      window.location.href = "/admin/plan/upgrade";
    } catch (e) {
      // fallback
    }
  };

  const defaultBenefits = benefits.length > 0 ? benefits : [
    `Full access to ${featureName} without restrictions`,
    `Higher rate limits and message throughput`,
    `Priority 24/7 technical customer support`,
    `Access to all advanced marketing & automation workflows`
  ];

  return (
    <div 
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-100 relative animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top vibrant gradient stripe */}
        <div className="h-2.5 w-full bg-gradient-to-r from-amber-500 via-orange-500 to-emerald-500" />

        {/* Close Button */}
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-6 sm:p-8 text-center">
          {/* Lock Icon Badge */}
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-orange-200/80 flex items-center justify-center mx-auto mb-4 text-orange-500 shadow-md shadow-orange-500/10">
            <Lock className="w-8 h-8 stroke-[2.2]" />
          </div>

          {/* Current plan badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200/60 text-slate-600 text-xs font-bold mb-3">
            <span>Current Plan:</span>
            <span className="text-slate-900 capitalize font-extrabold">{currentPlan}</span>
          </div>

          {/* Title */}
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mb-2">
            Upgrade to Access {featureName}
          </h3>

          {/* Description */}
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed mb-6 font-medium">
            {description || (
              <>
                <strong className="text-slate-700">{featureName}</strong> is not available on your current <span className="capitalize font-bold text-slate-800">{currentPlan}</span> plan. Upgrade to the <strong className="text-emerald-600">{requiredPlan} Plan</strong> or above to unlock it.
              </>
            )}
          </p>

          {/* Benefits Box */}
          <div className="bg-slate-50/80 rounded-2xl p-4 text-left border border-slate-100 mb-6 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 mb-1">
              <Sparkles className="w-4 h-4 text-orange-500 flex-shrink-0" />
              <span>What you unlock with {requiredPlan}:</span>
            </div>
            {defaultBenefits.map((b, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs text-slate-600 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span>{b}</span>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-2.5">
            <button
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
            >
              Maybe Later
            </button>
            <button
              onClick={handleUpgrade}
              className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-bold transition shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Upgrade Now</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
