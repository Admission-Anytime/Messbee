import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
    ChartBarIcon,
    CreditCardIcon,
    DocumentTextIcon,
} from "@heroicons/react/24/outline";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import { userContext } from "../../context/Context";

const usageItems = [
    { label: "Monthly Messages", used: 14200, total: 50000 },
    { label: "Team Members", used: 4, total: 10 },
    { label: "API Endpoints", used: 2, total: 5 },
];

function ManageSubscription() {
    const navigate = useNavigate();
    const { user } = useContext(userContext);

    const isFreePlan = !user?.subscriptionPlan || user.subscriptionPlan.toLowerCase() === "free";
    const planName = user?.subscriptionPlan ? user.subscriptionPlan.charAt(0).toUpperCase() + user.subscriptionPlan.slice(1) : "Free";

    let daysRemaining = 0;
    let nextBillingCycleStr = "";
    
    if (user?.subscriptionEndDate) {
      const endDate = new Date(user.subscriptionEndDate);
      const today = new Date();
      daysRemaining = Math.max(0, Math.ceil((endDate - today) / (1000 * 60 * 60 * 24)));
      nextBillingCycleStr = endDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    } else if (!isFreePlan) {
      daysRemaining = 76;
      nextBillingCycleStr = "Oct 24, 2024";
    }

    const isYearly = daysRemaining > 100;
    const cycleText = isYearly ? "Annually" : "Quarterly";
    const cycleSuffix = isYearly ? "/ year" : "/ quarter";

    const basePrices = {
      basic: 1537,
      professional: 2306,
      enterprise: 3844
    };
    
    const planKey = user?.subscriptionPlan?.toLowerCase() || "basic";
    const basePrice = basePrices[planKey] || 1537;
    
    const planAmount = isYearly
      ? Math.round(basePrice * 12 * 0.65)
      : Math.round(basePrice * 0.75 * 3);
    const gstAmount = Math.round(planAmount * 0.18);
    const amount = planAmount + gstAmount;

    const fmtNum = (n) => n.toLocaleString("en-US");

    return (
        <div className="font-['Urbanist']">
            {/* Main Content */}
            <div className="p-4 md:p-6 lg:p-8 max-w-[1400px] mx-auto flex flex-col gap-6">

                {/* Plan Card */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">

                        {/* Left: Plan Info */}
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h2 className="text-2xl font-black text-slate-900">{planName} Plan</h2>
                                <span className="flex items-center gap-1 text-[10px] font-bold bg-emerald-500 text-white px-2.5 py-1 rounded-full uppercase tracking-wider">
                                    <CheckCircleIcon className="w-3 h-3" /> Active
                                </span>
                            </div>
                            <p className="text-sm text-slate-400">
                                {isFreePlan ? "Free plan is active with basic restrictions" : `Billed ${cycleText} • Next renewal: ${nextBillingCycleStr}`}
                            </p>
                        </div>

                        {/* Right: Days + Buttons */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                            {/* Days Remaining Box */}
                            <div className="bg-[#1e293b] text-white rounded-xl px-6 py-3 text-center min-w-[100px]">
                                {isFreePlan ? (
                                    <>
                                        <p className="text-3xl font-black leading-none">∞</p>
                                        <p className="text-[10px] font-bold uppercase tracking-widest mt-1 opacity-70">
                                            Unlimited
                                        </p>
                                    </>
                                ) : (
                                    <>
                                        <p className="text-3xl font-black leading-none">{daysRemaining}</p>
                                        <p className="text-[10px] font-bold uppercase tracking-widest mt-1 opacity-70">
                                            Days Remaining
                                        </p>
                                    </>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col gap-2">
                                <button
                                    onClick={() => navigate("/admin/plan/upgrade")}
                                    className="px-6 py-2.5 bg-emerald-500 text-white text-sm font-bold rounded-lg hover:bg-emerald-600 transition-colors shadow-sm"
                                >
                                    Upgrade Plan
                                </button>
                                <button className="text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors text-center">
                                    Change Billing Cycle
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Resource Usage + Billing Details */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* Resource Usage Card */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                        <div className="flex items-center justify-between mb-6">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                Resource Usage
                            </p>
                            <ChartBarIcon className="w-5 h-5 text-slate-300" />
                        </div>
                        <div className="flex flex-col gap-5">
                            {usageItems.map(({ label, used, total }) => {
                                const pct = Math.round((used / total) * 100);
                                return (
                                    <div key={label}>
                                        <div className="flex justify-between text-sm font-semibold text-slate-700 mb-2">
                                            <span>{label}</span>
                                            <span className="text-slate-500 font-medium">
                                                {fmtNum(used)}{" "}
                                                <span className="text-slate-300">/</span>{" "}
                                                {fmtNum(total)}
                                            </span>
                                        </div>
                                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-slate-800 rounded-full transition-all"
                                                style={{ width: `${pct}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Billing Details Card */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col gap-5">
                        <div className="flex items-center justify-between">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                Billing Details
                            </p>
                            <CreditCardIcon className="w-5 h-5 text-slate-300" />
                        </div>

                        {/* Card Info */}
                        <div className="border border-slate-100 rounded-xl p-4 flex items-center justify-between gap-3 bg-slate-50/50">
                            <div className="flex items-center gap-3">
                                {/* VISA Badge */}
                                <div className="bg-blue-600 text-white text-[10px] font-black px-2 py-1 rounded tracking-wider">
                                    VISA
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-800 tracking-wider">•••• 4242</p>
                                    <p className="text-xs text-emerald-500 font-semibold">EXPIRES 12/26</p>
                                </div>
                            </div>
                            <button
                                onClick={() => navigate("/admin/plan/methods")}
                                className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors"
                            >
                                Change
                            </button>
                        </div>

                        {/* Next Payment */}
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                                Next Payment
                            </p>
                            <p className="text-3xl font-black text-slate-900">
                                {isFreePlan ? "₹0.00" : `₹${amount.toLocaleString("en-IN")}.00`}{" "}
                                {!isFreePlan && <span className="text-base font-medium text-slate-400">{cycleSuffix}</span>}
                            </p>
                        </div>

                        {/* View Invoices */}
                        <button
                            onClick={() => navigate("/admin/plan/history")}
                            className="w-full py-2.5 bg-white text-slate-700 border border-slate-200 text-sm font-bold rounded-lg hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 mt-auto"
                        >
                            <DocumentTextIcon className="w-4 h-4" />
                            View Invoices
                        </button>
                    </div>
                </div>

                {/* Bottom Info */}
                <div className="flex flex-col items-center gap-3 py-6">
                    <p className="text-sm text-slate-400 font-medium">
                        Managing subscription for Organization ID:{" "}
                        <span className="font-bold text-slate-600">NX-9921-X</span>
                    </p>
                    <button className="text-sm font-semibold text-red-400 hover:text-red-600 transition-colors">
                        Cancel Subscription
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ManageSubscription;
