import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { userContext } from "../../context/Context";
import axios from "../../context/axios";
import { getDaysRemaining } from "../../utils/subscription";
import {
    CreditCardIcon,
    MapPinIcon,
    ClockIcon,
    DocumentTextIcon,
    ArrowDownTrayIcon,
    QuestionMarkCircleIcon,
    XCircleIcon,
} from "@heroicons/react/24/outline";
import { CheckCircleIcon } from "@heroicons/react/24/solid";

function SubscriptionManagement() {
    const navigate = useNavigate();
    const { user } = useContext(userContext);
    const [billingHistory, setBillingHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBillingHistory = async () => {
            try {
                const response = await axios.get("/billing/transactions");
                if (response.data && response.data.success) {
                    const formatted = response.data.data.slice(0, 5).map(txn => ({
                        id: txn.transactionId,
                        date: new Date(txn.date).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
                        amount: `₹${txn.amount.toLocaleString("en-IN")}`,
                        status: txn.status
                    }));
                    setBillingHistory(formatted);
                }
            } catch (error) {
                console.error("Error fetching billing history:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchBillingHistory();
    }, []);

    const isFreePlan = !user?.subscriptionPlan || user.subscriptionPlan.toLowerCase() === "free";
    
    let daysRemaining = 0;
    let nextInvoiceDate = "N/A";
    if (user?.subscriptionEndDate) {
        const endDate = new Date(user.subscriptionEndDate);
        daysRemaining = getDaysRemaining(endDate);
        nextInvoiceDate = endDate.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
    }

    const planLimits = {
        free: { messages: 1000, seats: 1, price: 0 },
        basic: { messages: 10000, seats: 5, price: 1537 },
        professional: { messages: 50000, seats: 10, price: 2306 },
        enterprise: { messages: 100000, seats: 20, price: 3844 }
    };

    const currentPlan = user?.subscriptionPlan?.toLowerCase() || "free";
    const limits = planLimits[currentPlan] || planLimits.free;

    const billingSettings = [
        { label: "Payment Methods", icon: CreditCardIcon, path: "/admin/plan/methods" },
        { label: "Billing Address", icon: MapPinIcon, path: "/admin/plan/billing-address" },
        { label: "Billing History", icon: ClockIcon, path: "/admin/plan/history" },
        { label: "Tax Information", icon: DocumentTextIcon, path: "/admin/plan/tax-information" },
    ];

    return (
        <div className="font-['Urbanist']">
            {/* Main Content */}
            <div className="p-4 md:p-6 lg:p-8 max-w-[1400px] mx-auto flex flex-col lg:flex-row gap-6">
                {/* Left Column */}
                <div className="flex-1 flex flex-col gap-6">

                    {/* Active Plan Card */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                            <div>
                                <div className="flex items-center gap-3 mb-1">
                                    <h2 className="text-2xl font-black text-slate-900">
                                        {(user?.subscriptionPlan || "Free").charAt(0).toUpperCase() + (user?.subscriptionPlan || "Free").slice(1)} Plan
                                    </h2>
                                    <span className={`flex items-center gap-1 text-[10px] font-bold ${daysRemaining > 0 ? "bg-emerald-500 text-white" : "bg-slate-400 text-white"} px-2.5 py-1 rounded-full uppercase tracking-wider`}>
                                        {daysRemaining > 0 ? <><CheckCircleIcon className="w-3 h-3" /> Active</> : "Expired"}
                                    </span>
                                </div>
                                <p className="text-sm text-slate-400">
                                    {isFreePlan ? "Free forever plan" : `Subscription plan • Next invoice: ${nextInvoiceDate}`}
                                </p>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                <button
                                    onClick={() => navigate("/admin/plan/upgrade")}
                                    className="px-5 py-2.5 bg-emerald-500 text-white text-sm font-bold rounded-lg hover:bg-emerald-600 transition-colors shadow-sm"
                                >
                                    {isFreePlan ? "Upgrade Plan" : "Change Plan"}
                                </button>
                                {!isFreePlan && (
                                    <button className="flex items-center gap-1.5 text-sm font-semibold text-red-500 hover:text-red-600 transition-colors">
                                        <XCircleIcon className="w-4 h-4" /> Cancel Subscription
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Stats Row */}
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="bg-slate-50 rounded-xl p-4">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Time Remaining</p>
                                <p className="text-3xl font-black text-slate-900">{isFreePlan ? "Unlimited" : `${daysRemaining} Days`}</p>
                            </div>
                            <div className="bg-slate-50 rounded-xl p-4">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Billing Amount</p>
                                <p className="text-3xl font-black text-slate-900">
                                    ₹{limits.price.toLocaleString("en-IN")} <span className="text-base font-medium text-slate-400">/mo</span>
                                </p>
                            </div>
                        </div>

                        {/* Resource Usage */}
                        <div>
                            <p className="text-sm font-bold text-slate-700 mb-3">Resource Usage</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <div className="flex justify-between text-xs font-medium text-slate-500 mb-1.5">
                                        <span>Team Seats</span>
                                        <span>{user?.agents?.length || 1} / {limits.seats} Seats</span>
                                    </div>
                                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-slate-800 rounded-full" style={{ width: `${Math.min(100, ((user?.agents?.length || 1) / limits.seats) * 100)}%` }}></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-xs font-medium text-slate-500 mb-1.5">
                                        <span>Monthly Message Limit</span>
                                        <span>{user?.monthlyMessagesUsed || 0} / {limits.messages.toLocaleString()}</span>
                                    </div>
                                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-slate-800 rounded-full" style={{ width: `${Math.min(100, ((user?.monthlyMessagesUsed || 0) / limits.messages) * 100)}%` }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Recent Billing History */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                        <div className="flex items-center justify-between mb-5">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Recent Billing History</p>
                            <button
                                onClick={() => navigate("/admin/plan/history")}
                                className="text-xs font-bold text-slate-700 hover:text-slate-900 transition-colors"
                            >
                                View All
                            </button>
                        </div>
                        <div className="flex flex-col gap-4">
                            {loading ? (
                                <p className="text-sm text-slate-400 text-center py-4">Loading history...</p>
                            ) : billingHistory.length > 0 ? (
                                billingHistory.map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center border border-slate-100">
                                                <DocumentTextIcon className="w-4 h-4 text-slate-400" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-800">Invoice #{item.id}</p>
                                                <p className="text-xs text-slate-400">{item.date}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="text-sm font-bold text-slate-800">{item.amount}</span>
                                            <button className="text-slate-400 hover:text-slate-600 transition-colors">
                                                <ArrowDownTrayIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-slate-400 text-center py-4">No billing history found.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className="w-full lg:w-64 flex flex-col gap-6">

                    {/* Billing Settings */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Billing Settings</p>
                        <div className="flex flex-col gap-1">
                            {billingSettings.map(({ label, icon: Icon, path }) => (
                                <button
                                    key={label}
                                    onClick={() => navigate(path)}
                                    className="flex items-center justify-between px-3 py-3 rounded-lg hover:bg-slate-50 transition-colors group w-full text-left"
                                >
                                    <div className="flex items-center gap-3">
                                        <Icon className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors shrink-0" />
                                        <span className="text-sm font-semibold text-slate-700 group-hover:text-slate-900 transition-colors">
                                            {label}
                                        </span>
                                    </div>
                                    <span className="text-slate-300 group-hover:text-slate-500 transition-colors text-base">›</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Financial Button */}
                    <button
                        onClick={() => navigate("/admin/plan/financial")}
                        className="w-full py-3 bg-[#1e293b] text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition-colors shadow-sm flex items-center justify-center gap-2"
                    >
                        <DocumentTextIcon className="w-4 h-4" />
                        Financial Statement
                    </button>

                    {/* Need Help Card */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-6 h-6 rounded-full border-2 border-slate-800 flex items-center justify-center">
                                <QuestionMarkCircleIcon className="w-4 h-4 text-slate-800" />
                            </div>
                            <p className="text-sm font-bold text-slate-800">Need help?</p>
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed mb-4">
                            Questions about your Enterprise plan or need a custom quote for higher message volume?
                        </p>
                        <button className="w-full py-2.5 bg-white text-slate-800 border border-slate-200 text-sm font-bold rounded-lg hover:bg-slate-50 transition-colors">
                            Contact Billing Support
                        </button>
                    </div>
                </div>
            </div>

        </div>
    );
}

export default SubscriptionManagement;
