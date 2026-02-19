import React from "react";
import { useNavigate } from "react-router-dom"; // ✅ Import Navigation
import { 
  CurrencyRupeeIcon, 
  PlusIcon, 
  CheckCircleIcon, 
} from "@heroicons/react/24/outline";

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
  const navigate = useNavigate(); // ✅ Hook

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
                    <h2 className="text-3xl font-extrabold text-slate-900">Custom (Silver)</h2>
                    <span className="bg-emerald-100 text-emerald-600 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Active</span>
                 </div>
                 <p className="text-xs text-slate-400 font-medium">Expiry date: <span className="text-slate-600">28 Apr, 2026 5:29 am</span></p>
              </div>

              {/* Days Remaining Box */}
              <div className="bg-slate-50 rounded-xl p-4 w-full md:w-48 text-center border border-slate-100">
                 <div className="text-4xl font-extrabold text-emerald-500 mb-1">74</div>
                 <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Days Remaining</div>
                 <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div className="w-[40%] h-full bg-emerald-400 rounded-full"></div>
                 </div>
              </div>
           </div>

           {/* Right: WCC Balance */}
           <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
              <div className="flex justify-between items-center mb-4">
                 <span className="text-xs font-bold text-slate-400 uppercase">WCC Balance</span>
                 <button onClick={handleAddCredit} className="text-[10px] font-bold text-emerald-500 hover:underline">WCC Pricing</button>
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 text-center mb-4">
                 <span className="text-2xl font-extrabold text-slate-900">₹618.51</span>
              </div>
              <button 
                onClick={handleAddCredit}
                className="w-full py-2.5 bg-[#00B050] hover:bg-[#009b45] text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2 text-sm shadow-md shadow-emerald-100"
              >
                 <PlusIcon className="w-4 h-4" /> Add Credit
              </button>
           </div>
        </div>

        {/* --- MIDDLE SECTION: RESOURCE USAGE GRID --- */}
        <div>
           <h3 className="text-lg font-bold text-slate-900 mb-4">Resources Usage</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <ResourceCard title="WhatsApp API Number" used={2} limit={1} warning={true} />
              <ResourceCard title="Custom Fields" used={1} limit={5} />
              <ResourceCard title="Quick Replies" used={2} limit={5} />
              <ResourceCard title="Status" used={2} limit={5} />
              <ResourceCard title="Label" used={1} limit={5} />
              <ResourceCard title="Team Member" used={4} limit={5} />
              
              {/* Special Card: Contact */}
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between h-32">
                 <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-50 rounded-lg"><div className="w-4 h-4 bg-slate-300 rounded-sm"></div></div>
                    <span className="text-sm font-bold text-slate-500">Contact</span>
                 </div>
                 <div className="flex gap-2">
                    <button onClick={() => toast.info("Import feature coming soon")} className="flex-1 py-1.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded hover:bg-slate-200 transition-colors">Import</button>
                    <button onClick={() => handleExport("Contacts")} className="flex-1 py-1.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded hover:bg-slate-200 transition-colors">Export ⓘ</button>
                 </div>
              </div>

              {/* Special Card: App Integration */}
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between h-32">
                 <div className="flex justify-between items-start">
                     <div className="p-2 bg-slate-50 rounded-lg"><div className="w-4 h-4 bg-slate-300 rounded-sm"></div></div>
                     <span className="text-lg font-bold text-slate-200">0/0</span>
                 </div>
                 <div>
                    <h4 className="text-xs font-bold text-slate-500 mb-2">App Integration</h4>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full"></div>
                 </div>
              </div>
           </div>
        </div>

        {/* --- BOTTOM SECTION: DETAILED CARDS --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           
           {/* Campaign Card */}
           <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                 <h3 className="font-bold text-slate-900">Campaign</h3>
                 <span className="font-bold text-slate-900">49<span className="text-slate-400 text-sm font-medium">/Unlimited</span></span>
              </div>
              <div className="flex flex-wrap gap-2">
                 <span className="bg-slate-50 border border-slate-100 text-slate-600 px-3 py-1.5 rounded-full text-[10px] font-bold flex items-center gap-1 cursor-pointer hover:bg-slate-100">Retarget Campaign ⓘ</span>
                 <button onClick={() => handleExport("Campaign Analytics")} className="bg-slate-50 border border-slate-100 text-slate-600 px-3 py-1.5 rounded-full text-[10px] font-bold flex items-center gap-1 hover:bg-slate-100">Export Analytics ⓘ</button>
              </div>
           </div>

           {/* Chatbot Card */}
           <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                 <h3 className="font-bold text-slate-900">Chatbot</h3>
                 <span className="font-bold text-orange-500">7<span className="text-orange-300 text-sm font-medium">/5</span></span>
              </div>
              <div className="flex flex-wrap gap-2">
                 {['Ask Question ⓘ', 'Action ⓘ', 'ChatGPT ⓘ', 'Garvik ⓘ'].map(tag => (
                    <span key={tag} className="bg-slate-50 border border-slate-100 text-slate-600 px-3 py-1.5 rounded-full text-[10px] font-bold cursor-pointer hover:bg-slate-100">{tag}</span>
                 ))}
              </div>
           </div>

           {/* Commerce Card */}
           <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                 <h3 className="font-bold text-slate-900">Commerce</h3>
                 <span className="bg-gray-100 text-gray-500 text-[9px] font-bold px-2 py-0.5 rounded uppercase">Status: Not Available</span>
              </div>
              <div className="flex flex-wrap gap-2 opacity-50 cursor-not-allowed">
                 {['Order Panel ⓘ', 'Auto Checkout ⓘ', 'Export Analytics ⓘ'].map(tag => (
                    <span key={tag} className="bg-slate-50 border border-slate-100 text-slate-600 px-3 py-1.5 rounded-full text-[10px] font-bold">{tag}</span>
                 ))}
              </div>
           </div>

           {/* Developer API Card */}
           <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 lg:col-span-1">
              <div className="flex justify-between items-center mb-6">
                 <h3 className="font-bold text-slate-900">Developer API</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                 <button onClick={handleCopyApiKey} className="bg-emerald-50 border border-emerald-100 text-emerald-600 px-3 py-1.5 rounded-full text-[10px] font-bold flex items-center gap-1 hover:bg-emerald-100 cursor-pointer">API Enabled <CheckCircleIcon className="w-3 h-3"/></button>
                 {['Webhook ⓘ', 'Messages APIs ⓘ', 'CRM APIs ⓘ', 'Campaign APIs ⓘ'].map(tag => (
                    <span key={tag} className="bg-slate-50 border border-slate-100 text-slate-600 px-3 py-1.5 rounded-full text-[10px] font-bold cursor-pointer hover:bg-slate-100">{tag}</span>
                 ))}
              </div>
           </div>

        </div>

      </div>
    </div>
  );
};

export default ActivePlan;