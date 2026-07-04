import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
   CurrencyRupeeIcon,
   PlusIcon,
   CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { getAccountLimits } from "../../services/authService";
import { userContext } from "../../context/Context";
import { getDaysRemaining, getSubscriptionProgress } from "../../utils/subscription";

// ✅ Import Toastify
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// --- REUSABLE COMPONENT: RESOURCE CARD ---
const ResourceCard = ({ title, used, limit, warning = false }) => {
   const percentage = limit === "Unlimited" ? 0 : (used / limit) * 100;
   const isOverLimit = limit !== "Unlimited" && used > limit;

   return (
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between h-32 hover:shadow-md transition-shadow">
         <div className="flex justify-between items-start">
            <div className="p-2 bg-slate-50 rounded-lg">
               <div className="w-4 h-4 bg-slate-300 rounded-sm"></div>
            </div>
            <span className={`text-lg font-bold ${isOverLimit || warning ? 'text-orange-500' : 'text-slate-900'}`}>
               {used}<span className="text-sm text-slate-400 font-medium">/{limit}</span>
            </span>
         </div>
         <div>
            <h4 className="text-xs font-bold text-slate-500 mb-2">{title}</h4>
            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
               <div
                  className={`h-full rounded-full ${isOverLimit || warning ? 'bg-orange-500' : 'bg-emerald-500'}`}
                  style={{ width: `${percentage > 100 ? 100 : percentage}%` }}
               ></div>
            </div>
         </div>
      </div>
   );
};

const ActivePlan = () => {
   const navigate = useNavigate();
   const { user } = useContext(userContext);
   const [limits, setLimits] = useState(null);

   // ── Dynamic plan data from userContext ──────────────────────────────────────
   const credits = user?.credits != null ? parseFloat(user.credits) : 0;
   const planName = user?.subscriptionPlan
      ? user.subscriptionPlan.charAt(0).toUpperCase() + user.subscriptionPlan.slice(1)
      : "Free";
   const isFreePlan = !user?.subscriptionPlan || user.subscriptionPlan.toLowerCase() === "free";

   let daysRemaining = 0;
   let expiryStr = "";
   let progressPct = 0;

   if (user?.subscriptionEndDate) {
      const endDate = new Date(user.subscriptionEndDate);
      daysRemaining = getDaysRemaining(endDate);
      progressPct = getSubscriptionProgress(daysRemaining);
      expiryStr = endDate.toLocaleString("en-IN", {
         day: "numeric", month: "short", year: "numeric",
         hour: "2-digit", minute: "2-digit"
      });
   }

   useEffect(() => {
      const fetchLimits = async () => {
         try {
            const data = await getAccountLimits();
            if (data.success) {
               setLimits(data.data);
            }
         } catch (error) {
            console.error("Failed to fetch account limits:", error);
         }
      };
      fetchLimits();
   }, []);

   // --- HANDLERS ---
   const handleAddCredit = () => {
      navigate("/admin/plan/addons"); // Redirect to Add-ons page
   };

   const handleExport = (type) => {
      toast.info(`Exporting ${type} data...`);
      // Simulate download delay
      setTimeout(() => toast.success(`${type} export completed!`), 1500);
   };

   const handleCopyApiKey = () => {
      navigator.clipboard.writeText("sk_live_123456789");
      toast.success("API Key copied to clipboard!");
   };

   return (
      <div className="min-h-screen bg-[#F8FAFC] p-6 lg:p-10 font-['Urbanist'] pb-20 relative">
         <ToastContainer />

         <div className="max-w-7xl mx-auto space-y-8">

            {/* --- HEADER --- */}
            <div>
               <h1 className="text-2xl font-bold text-slate-900">Active Plan</h1>
               <p className="text-sm text-slate-500">Manage your subscription and resource allocation.</p>
            </div>

            {/* --- TOP SECTION: PLAN & WCC --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

               {/* Left: Current Plan Details */}
               <div className="lg:col-span-2 bg-white rounded-2xl p-8 border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
                  <div>
                     <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Current Plan</p>
                     <div className="flex items-center gap-3 mb-2">
                        <h2 className="text-3xl font-extrabold text-slate-900">{planName} Plan</h2>
                        <span className="bg-emerald-100 text-emerald-600 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Active</span>
                     </div>
                     <p className="text-xs text-slate-400 font-medium">
                        {isFreePlan
                           ? "Free plan — no expiry"
                           : `Expiry date: ${expiryStr || "—"}`}
                     </p>
                  </div>

                  {/* Days Remaining Box */}
                  <div className="bg-slate-50 rounded-xl p-4 w-full md:w-48 text-center border border-slate-100">
                     {isFreePlan ? (
                        <>
                           <div className="text-4xl font-extrabold text-slate-400 mb-1">∞</div>
                           <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Unlimited</div>
                        </>
                     ) : (
                        <>
                           <div className="text-4xl font-extrabold text-emerald-500 mb-1">{daysRemaining}</div>
                           <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Days Remaining</div>
                           <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                 className="h-full bg-emerald-400 rounded-full transition-all duration-500"
                                 style={{ width: `${progressPct}%` }}
                              ></div>
                           </div>
                        </>
                     )}
                  </div>
               </div>

               {/* Right: WCC Balance */}
               <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
                  <div className="flex justify-between items-center mb-4">
                     <span className="text-xs font-bold text-slate-400 uppercase">WCC Balance</span>
                     <button onClick={handleAddCredit} className="text-[10px] font-bold text-emerald-500 hover:underline">WCC Pricing</button>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 text-center mb-4">
                     <span className="text-2xl font-extrabold text-slate-900">₹{credits.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <button
                     onClick={handleAddCredit}
                     className="w-full py-2.5 bg-[#00B050] hover:bg-[#009b45] text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2 text-sm shadow-md shadow-emerald-100"
                  >
                     <PlusIcon className="w-4 h-4" /> Add Credit
                  </button>
               </div>
            </div>

            {/* ═══════════════════════════════════════
           ACCOUNT LIMITS
           ═══════════════════════════════════════ */}
            <div>
               <div className="flex items-center gap-2 mb-5">
                  <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center">
                     <svg className="w-4 h-4 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="3" /><path d="M9 12h6M12 9v6" /></svg>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">Account Limits</h3>
               </div>

               <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                  {[
                     { label: "WhatsApp API Number", used: limits?.whatsappApiNumber?.used || 0, limit: limits?.whatsappApiNumber?.limit || 1, color: "#3B82F6" },
                     { label: "Custom Fields", used: limits?.customFields?.used || 0, limit: limits?.customFields?.limit || 5, color: "#3B82F6" },
                     { label: "Quick Replies", used: limits?.quickReplies?.used || 0, limit: limits?.quickReplies?.limit || 5, color: "#3B82F6" },
                     { label: "Team Members", used: limits?.teamMembers?.used || 0, limit: limits?.teamMembers?.limit || 5, color: "#1E293B" },
                     { label: "Storage Used", used: limits?.storage?.used || 0, limit: limits?.storage?.limit || 100, color: "#10B981", isPercent: true },
                  ].map((item) => {
                     const pct = item.isPercent ? item.used : Math.min((item.used / item.limit) * 100, 100);
                     const isOver = !item.isPercent && item.used > item.limit;
                     const circumference = 2 * Math.PI * 32;
                     const dashOffset = circumference - (pct / 100) * circumference;
                     const strokeColor = isOver ? "#F97316" : item.color;

                     return (
                        <div key={item.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col items-center text-center hover:shadow-md transition-shadow">
                           <div className="relative w-20 h-20 mb-3">
                              <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                                 <circle cx="40" cy="40" r="32" fill="none" stroke="#f1f5f9" strokeWidth="5" />
                                 <circle cx="40" cy="40" r="32" fill="none" stroke={strokeColor} strokeWidth="5" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={dashOffset} />
                              </svg>
                              <div className="absolute inset-0 flex items-center justify-center">
                                 <span className={`text-sm font-extrabold ${isOver ? "text-orange-500" : "text-slate-800"}`}>
                                    {item.isPercent ? `${item.used}%` : `${item.used}/${item.limit}`}
                                 </span>
                              </div>
                           </div>
                           <span className="text-xs font-semibold text-slate-500">{item.label}</span>
                        </div>
                     );
                  })}
               </div>
            </div>

            {/* ═══════════════════════════════════════
           ACTIVE FEATURES + DEVELOPER TOOLS
           ═══════════════════════════════════════ */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
               {/* LEFT: Active Features */}
               <div className="lg:col-span-2 space-y-5">
                  <div className="flex items-center gap-2">
                     <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center">
                        <svg className="w-4 h-4 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" /></svg>
                     </div>
                     <h3 className="text-lg font-bold text-slate-900">Active Features</h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     {/* Campaigns */}
                     <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                        <div className="flex items-start justify-between mb-3">
                           <h4 className="text-sm font-bold text-slate-800">Campaigns</h4>
                           <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                              <svg className="w-4 h-4 text-blue-500" viewBox="0 0 24 24" fill="currentColor"><path d="M3 5a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5zm4 1v3h10V6H7zm0 5v2h4v-2H7zm0 4v2h6v-2H7z" /></svg>
                           </div>
                        </div>
                        <div className="mb-4">
                           <span className="text-2xl font-extrabold text-slate-800">{limits?.activeFeatures?.campaigns?.used ?? 0}</span>
                           <span className="text-lg font-bold text-emerald-500 ml-1">/ {limits?.activeFeatures?.campaigns?.limit ?? 'Unlimited'}</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                           <span className="bg-slate-50 border border-slate-100 text-slate-600 px-3 py-1.5 rounded-full text-[10px] font-bold flex items-center gap-1">Retarget Campaign <span className="text-blue-400">ⓘ</span></span>
                           <button onClick={() => handleExport("Campaign Analytics")} className="bg-slate-50 border border-slate-100 text-slate-600 px-3 py-1.5 rounded-full text-[10px] font-bold flex items-center gap-1 hover:bg-slate-100 cursor-pointer">Export Analytics <span className="text-blue-400">ⓘ</span></button>
                        </div>
                     </div>

                     {/* Chatbots */}
                     <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                        <div className="flex items-start justify-between mb-3">
                           <h4 className="text-sm font-bold text-slate-800">Chatbots</h4>
                           <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
                              <svg className="w-4 h-4 text-green-500" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a2 2 0 012 2c0 .74-.4 1.39-1 1.73V7h3a4 4 0 014 4v1h1a2 2 0 110 4h-1v1a4 4 0 01-4 4H8a4 4 0 01-4-4v-1H3a2 2 0 110-4h1v-1a4 4 0 014-4h3V5.73A2 2 0 0112 2zm-2 10a1 1 0 100 2 1 1 0 000-2zm4 0a1 1 0 100 2 1 1 0 000-2z" /></svg>
                           </div>
                        </div>
                        <div className="mb-1">
                           <span className="text-2xl font-extrabold text-slate-800">{limits?.activeFeatures?.chatbots?.used ?? 0}</span>
                           <span className="text-lg font-bold text-orange-500 ml-1">/ {limits?.activeFeatures?.chatbots?.limit ?? 1}</span>
                        </div>
                        {((limits?.activeFeatures?.chatbots?.used ?? 0) > (limits?.activeFeatures?.chatbots?.limit ?? 1)) && <p className="text-[11px] text-orange-500 font-semibold italic mb-3">Quota Exceeded</p>}
                        <div className="flex flex-wrap gap-2">
                           {["ChatGPT ⚡", "Ask Question ⓘ", "Garvik ⓘ"].map((tag) => (
                              <span key={tag} className="bg-slate-50 border border-slate-100 text-slate-600 px-3 py-1.5 rounded-full text-[10px] font-bold cursor-pointer hover:bg-slate-100">{tag}</span>
                           ))}
                        </div>
                     </div>
                  </div>

                  {/* Commerce Hub */}
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                     <div className="flex items-center justify-between mb-3">
                        <div>
                           <h4 className="text-sm font-bold text-slate-800">Commerce Hub</h4>
                           <p className="text-[11px] text-slate-400">Status: <span className="italic">{limits?.commerceHub?.available ? 'Available' : 'Not available on your plan'}</span></p>
                        </div>
                        <button className="px-4 py-1.5 rounded-lg border-2 border-slate-200 text-[11px] font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all cursor-pointer uppercase tracking-wider">
                           Upgrade to Gold
                        </button>
                     </div>
                     <div className="flex flex-wrap gap-2 opacity-40">
                        {["Order Panel 🔒", "Auto Checkout 🔒", "Inventory Sync 🔒"].map((tag) => (
                           <span key={tag} className="bg-slate-50 border border-slate-100 text-slate-500 px-3 py-1.5 rounded-full text-[10px] font-bold">{tag}</span>
                        ))}
                     </div>
                  </div>
               </div>

               {/* RIGHT: Developer Tools */}
               <div className="space-y-5">
                  <div className="flex items-center gap-2">
                     <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center">
                        <svg className="w-4 h-4 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>
                     </div>
                     <h3 className="text-lg font-bold text-slate-900">Developer Tools</h3>
                  </div>

                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-5">
                     {/* API Access toggle */}
                     <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                           <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center">
                              <svg className="w-4 h-4 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 7h3a5 5 0 010 10h-3M9 17H6a5 5 0 010-10h3M8 12h8" /></svg>
                           </div>
                           <div>
                              <p className="text-sm font-bold text-slate-700">API Access</p>
                              <p className="text-[10px] text-slate-400">{limits?.developerTools?.apiAccess?.active ? `Active ${limits?.developerTools?.apiAccess?.version}` : 'Inactive'}</p>
                           </div>
                        </div>
                        <div className={`w-11 h-6 rounded-full p-0.5 cursor-pointer transition-colors duration-200 ${limits?.developerTools?.apiAccess?.active ? 'bg-emerald-400' : 'bg-slate-200'}`}>
                           <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${limits?.developerTools?.apiAccess?.active ? 'translate-x-5' : 'translate-x-0'}`}></div>
                        </div>
                     </div>

                     {/* Webhooks toggle */}
                     <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                           <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
                              <svg className="w-4 h-4 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" /></svg>
                           </div>
                           <div>
                              <p className="text-sm font-bold text-slate-700">Webhooks</p>
                              <p className="text-[10px] text-slate-400">{limits?.developerTools?.webhooks?.count ?? 0} Active</p>
                           </div>
                        </div>
                        <div className={`w-11 h-6 rounded-full p-0.5 cursor-pointer transition-colors duration-200 ${limits?.developerTools?.webhooks?.active ? 'bg-emerald-400' : 'bg-slate-200'}`}>
                           <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${limits?.developerTools?.webhooks?.active ? 'translate-x-5' : 'translate-x-0'}`}></div>
                        </div>
                     </div>

                     {/* Endpoints */}
                     <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">End-Points</p>
                        <div className="space-y-1">
                           {["Messages API", "CRM Integration", "Contact Manager"].map((ep) => (
                              <button key={ep} className="w-full flex items-center justify-between py-2.5 px-1 text-sm text-slate-600 hover:text-slate-800 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer">
                                 <span className="font-medium">{ep}</span>
                                 <svg className="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
                              </button>
                           ))}
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            {/* ═══════════════════════════════════════
           CONTACT MANAGEMENT BAR
           ═══════════════════════════════════════ */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                     <svg className="w-5 h-5 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" /></svg>
                  </div>
                  <div>
                     <h4 className="text-sm font-bold text-slate-800">Contact Management</h4>
                     <p className="text-[11px] text-slate-400">Import your list or export analytics for reporting.</p>
                  </div>
               </div>
               <div className="flex items-center gap-3">
                  <button onClick={() => toast.info("Import feature coming soon")} className="px-5 py-2 rounded-lg border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all cursor-pointer flex items-center gap-2">
                     <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" /></svg>
                     Import
                  </button>
                  <button onClick={() => handleExport("Contacts")} className="px-5 py-2 rounded-lg border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all cursor-pointer flex items-center gap-2">
                     <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" /></svg>
                     Export
                  </button>
               </div>
            </div>

         </div>
      </div>
   );
};

export default ActivePlan;