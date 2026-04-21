import React, { useState } from "react";
import { 
  ArrowLeftIcon, 
  MoonIcon,
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
  ArrowsRightLeftIcon,
  MegaphoneIcon
} from "@heroicons/react/24/outline";

// ✅ Receives 'onBack' as a prop from Chat.jsx
const ActivityLog = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState("All Activity");
  const tabs = ["All Activity", "Messages", "Status Updates", "Campaigns", "Notes"];

  return (
    <div className="h-full flex flex-col bg-[#F9FAFB] w-full font-sans text-slate-900 overflow-hidden">
      
      {/* 1. HEADER */}
      <div className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-6 lg:px-10 shrink-0 shadow-sm">
        
        {/* Left: Back Button & User Info */}
        <div className="flex items-center gap-6">
          <button 
            onClick={onBack} // ✅ Triggers the back function
            className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors font-medium text-sm"
          >
            <ArrowLeftIcon className="w-4 h-4" /> Back to Chat
          </button>
          
          <div className="w-px h-8 bg-slate-200 hidden sm:block"></div>
          
          <div className="flex items-center gap-3">
            <img src="https://ui-avatars.com/api/?name=Priyanshu+Raghuvanshi&background=0D8ABC&color=fff" alt="" className="w-10 h-10 rounded-full object-cover" />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-extrabold text-slate-900">Priyanshu Raghuvanshi</h2>
                <span className="px-2 py-0.5 bg-[#f0fdf4] text-[#16a34a] text-[9px] font-bold rounded uppercase tracking-widest border border-[#bbf7d0]">
                  Warm Lead
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">+91 98765 43210</p>
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-4">
          <button className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 transition-colors shadow-sm hidden sm:block">
            Export Log
          </button>
          <button className="p-2.5 bg-[#0f172a] text-white rounded-full hover:bg-black transition-colors shadow-md">
            <MoonIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 2. MAIN CONTENT */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="max-w-4xl mx-auto px-6 py-10">
          
          {/* Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <p className="text-[11px] font-bold text-slate-400 mb-2 tracking-wide uppercase">Total Interactions</p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-2xl font-black text-slate-800">156</h3>
                <span className="text-xs font-bold text-[#22C55E] bg-green-50 px-2 py-0.5 rounded-md">+12 this week</span>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <p className="text-[11px] font-bold text-slate-400 mb-2 tracking-wide uppercase">Avg. Agent Response Time</p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-2xl font-black text-slate-800">4m</h3>
                <span className="text-xs font-medium text-slate-400 ml-1">Industry avg: 12m</span>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <p className="text-[11px] font-bold text-slate-400 mb-2 tracking-wide uppercase">Lead Since</p>
              <h3 className="text-2xl font-black text-slate-800">Jan 24, 2024</h3>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 overflow-x-auto hide-scrollbar mb-10 pb-2">
            {tabs.map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all shadow-sm border
                  ${activeTab === tab ? "bg-[#0f172a] border-[#0f172a] text-white" : "bg-white text-slate-500 hover:bg-slate-50 border-slate-200"}`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* 3. TIMELINE */}
          <div className="mb-6">
            <span className="px-4 py-1.5 bg-slate-200 text-slate-600 rounded-full text-[10px] font-extrabold uppercase tracking-widest">
              TODAY, FEB 20
            </span>
          </div>

          <div className="relative border-l-2 border-slate-200 ml-4 md:ml-6 pb-10 space-y-8">
            
            <div className="relative pl-8 md:pl-10">
              <span className="absolute top-5 -left-[7px] w-3 h-3 bg-amber-400 rounded-full ring-4 ring-[#F9FAFB]"></span>
              <div className="bg-[#fffbeb] border border-amber-200 p-5 rounded-2xl shadow-sm">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2 text-amber-600 font-bold text-xs">
                    <DocumentTextIcon className="w-5 h-5" /> Internal Note
                  </div>
                  <span className="text-xs font-bold text-amber-500">10:45 AM</span>
                </div>
                <p className="text-xs text-slate-700 italic leading-relaxed mb-4">
                  "Customer requested a callback regarding the MBBS application deadline for Delhi University. Follow up scheduled for tomorrow morning."
                </p>
                <div className="flex items-center gap-2">
                  <img src="https://ui-avatars.com/api/?name=Arshlan+Khan&background=f1f5f9" className="w-6 h-6 rounded-full" alt="Agent" />
                  <span className="text-xs font-bold text-slate-800">Arshlan Khan</span>
                </div>
              </div>
            </div>

            <div className="relative pl-8 md:pl-10">
              <span className="absolute top-5 -left-[7px] w-3 h-3 bg-[#22C55E] rounded-full ring-4 ring-[#F9FAFB]"></span>
              <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2 text-[#22C55E] font-bold text-xs">
                    <ChatBubbleLeftRightIcon className="w-5 h-5" /> Outgoing Message
                  </div>
                  <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                    09:12 AM <span className="text-[#3b82f6] text-[10px]">✓✓</span>
                  </span>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl">
                  <p className="text-xs text-slate-700">
                    Great! We'll wait for the documents then. Have a productive day ahead.
                  </p>
                </div>
              </div>
            </div>

            <div className="relative pl-8 md:pl-10">
              <span className="absolute top-5 -left-[7px] w-3 h-3 bg-blue-500 rounded-full ring-4 ring-[#F9FAFB]"></span>
              <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2 text-blue-600 font-bold text-xs">
                    <ArrowsRightLeftIcon className="w-5 h-5" /> Lifecycle Change
                  </div>
                  <span className="text-xs font-bold text-slate-400">Yesterday, 06:45 PM</span>
                </div>
                <p className="text-xs text-slate-600 flex items-center flex-wrap gap-1.5">
                  Status changed from <span className="px-2 py-0.5 bg-slate-100 text-slate-600 font-bold rounded text-[10px] uppercase">Cold Lead</span> 
                  to <span className="px-2 py-0.5 bg-[#f0fdf4] text-[#16a34a] border border-[#bbf7d0] font-bold rounded text-[10px] uppercase">Warm Lead</span> 
                  by <span className="font-bold text-slate-800">Arshlan Khan</span>
                </p>
              </div>
            </div>

            <div className="relative pl-8 md:pl-10">
              <span className="absolute top-5 -left-[7px] w-3 h-3 bg-purple-500 rounded-full ring-4 ring-[#F9FAFB]"></span>
              <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2 text-purple-600 font-bold text-xs">
                    <MegaphoneIcon className="w-5 h-5" /> Campaign Broadcast
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-400">Feb 18, 02:15 PM</span>
                    <span className="px-2 py-0.5 bg-green-50 text-green-600 font-bold rounded text-[9px] uppercase tracking-wider">Delivered</span>
                  </div>
                </div>
                <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-2">
                    <DocumentTextIcon className="w-3.5 h-3.5" /> TEMPLATE: MBBS_ADMISSION
                  </p>
                  <p className="text-xs text-slate-700 line-clamp-2">
                    "Hello Priyanshu! Registration for the upcoming MBBS batches in Delhi-NCR are now open. Secure your seat..."
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityLog;