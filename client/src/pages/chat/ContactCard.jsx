import React, { useState, useEffect, useRef } from "react";
import { 
  MagnifyingGlassIcon, 
  ChevronRightIcon, 
  XMarkIcon,
  DocumentDuplicateIcon
} from "@heroicons/react/24/outline";
import { CheckCircleIcon } from "@heroicons/react/24/solid";

const TABS = ["All Chats", "Mine", "Unread", "Active", "Resolved"];

const ContactCard = ({ chats, activeChatId, onChatSelect, activeTab, setActiveTab }) => {
  const [searchTerm, setSearchTerm] = useState("");
  
  // State for the New Chat Modal
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false); 
  
  const displayChats = (chats || []).filter((c) => {
    const matchesSearch = c.name?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="flex flex-col h-full bg-white relative">
      
      {/* 1. HEADER */}
      <div className="h-16 flex items-center justify-between px-5 shrink-0 bg-white z-40 relative">
         <h2 className="text-2xl font-extrabold text-slate-900">Chats</h2>
         
         {/* ✅ NEW: Custom Chat-Plus Icon matching your screenshot exactly! */}
         <button 
            onClick={() => setIsNewChatModalOpen(true)} 
            className="p-1 text-slate-400 hover:text-slate-600 rounded-md transition-colors" 
            title="Start New Chat"
         >
             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Chat Bubble Body */}
                <path d="M21 5.5C21 4.11929 19.8807 3 18.5 3H5.5C4.11929 3 3 4.11929 3 5.5V16.5C3 17.8807 4.11929 19 5.5 19H16.5L21 23.5V5.5Z" fill="currentColor"/>
                {/* Inner Plus Sign */}
                <path d="M12 8V14M9 11H15" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
             </svg>
         </button>
      </div>

      {/* --- 🟢 FLOATING NEW CHAT MODAL 🟢 --- */}
      {isNewChatModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-[500px] rounded-3xl shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col">
                
                {/* Modal Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-slate-900">Start New Chat</h3>
                    <button onClick={() => setIsNewChatModalOpen(false)} className="text-gray-400 hover:text-gray-700 p-1.5 rounded-full hover:bg-gray-100 transition-colors -mr-1.5">
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>

                {/* Modal Body */}
                <div className="p-6 space-y-6">
                    
                    {/* Enter Number */}
                    <div>
                        <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">WhatsApp Number</label>
                        <div className="flex focus-within:ring-1 focus-within:ring-[#22C55E] focus-within:border-[#22C55E] rounded-xl transition-all shadow-sm">
                            <span className="inline-flex items-center px-4 py-3 rounded-l-xl border border-r-0 border-gray-200 bg-gray-50 text-gray-500 text-sm font-bold">
                                +91
                            </span>
                            <input 
                                type="text" 
                                placeholder="Enter 10-digit number" 
                                className="flex-1 min-w-0 block w-full px-4 py-3 rounded-r-xl border border-gray-200 text-sm font-medium text-slate-900 outline-none" 
                                autoFocus
                            />
                        </div>
                    </div>

                    {/* Select Template */}
                    <div>
                        <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Message Template</label>
                        <div className="relative">
                            <select className="block w-full pl-4 pr-10 py-3 text-sm font-medium border border-gray-200 rounded-xl focus:ring-1 focus:ring-[#22C55E] focus:border-[#22C55E] outline-none appearance-none bg-white text-slate-800 shadow-sm cursor-pointer">
                                <option value="" disabled selected>Select a template to start with...</option>
                                <option value="welcome">👋 Welcome Message</option>
                                <option value="reminder">💸 Payment Reminder</option>
                                <option value="followup">🗓️ General Follow-up</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
                                <ChevronRightIcon className="w-4 h-4 rotate-90" />
                            </div>
                        </div>
                    </div>

                    {/* Direct Link */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest">Direct Chat Link</label>
                        </div>
                        <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 shadow-inner">
                            <input 
                                type="text" 
                                readOnly
                                value="https://app.messbee.business/send?phone="
                                className="flex-1 bg-transparent border-none outline-none text-xs font-medium text-gray-500"
                            />
                            <button className="ml-2 p-1.5 text-gray-400 hover:text-[#22C55E] hover:bg-green-50 rounded-lg transition-colors">
                                <DocumentDuplicateIcon className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Modal Footer */}
                <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50/50 border-t border-gray-100 shrink-0">
                    <button onClick={() => setIsNewChatModalOpen(false)} className="px-5 py-2.5 text-sm font-bold text-gray-600 hover:text-gray-900 transition-colors rounded-xl hover:bg-gray-100">
                        Cancel
                    </button>
                    <button onClick={() => setIsNewChatModalOpen(false)} className="px-6 py-2.5 text-sm font-bold text-white bg-[#22C55E] rounded-xl hover:bg-green-500 flex items-center gap-2 shadow-sm transition-colors">
                        Start Conversation <ChevronRightIcon className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* 2. SEARCH BAR */}
      <div className="px-5 pb-4 shrink-0">
         <div className="relative bg-gray-50 rounded-xl flex items-center px-4 py-2.5 border border-gray-100 focus-within:border-gray-300 focus-within:bg-white transition-all">
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 mr-2" />
            <input 
              type="text" 
              placeholder="Search chats..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none text-sm text-gray-700 placeholder:text-gray-400"
            />
            <div className="w-5 h-5 border border-gray-200 rounded flex items-center justify-center text-[10px] text-gray-400 font-mono bg-white shadow-sm">/</div>
         </div>
      </div>

      {/* 3. FILTER TABS */}
      <div className="px-5 pb-3 overflow-x-auto hide-scrollbar flex gap-2 shrink-0 border-b border-gray-50">
         {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors shadow-sm ${
                activeTab === tab 
                  ? "bg-[#22C55E] text-white border border-[#22C55E]" 
                  : "bg-[#F8FAFC] text-slate-600 border border-gray-200 hover:bg-gray-100"
              }`}
            >
              {tab}
            </button>
         ))}
      </div>

      {/* 4. CHAT LIST */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
         {displayChats.length > 0 ? displayChats.map((chat) => (
           <div 
             key={chat._id || chat.id} 
             onClick={() => onChatSelect(chat._id || chat.id)}
             className={`
               flex gap-3 px-5 py-4 cursor-pointer transition-all border-b border-gray-50 relative
               ${activeChatId === (chat._id || chat.id) ? "bg-green-50/30 border-l-4 border-l-[#22C55E]" : "border-l-4 border-l-transparent hover:bg-gray-50"}
             `}
           >
              {/* Avatar */}
              <div className="relative shrink-0">
                <img src={chat.avatar || `https://ui-avatars.com/api/?name=${chat.name.replace(' ', '+')}&background=random`} alt="" className="w-12 h-12 rounded-full object-cover" />
                <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-[#22C55E] border-2 border-white rounded-full"></span>
              </div>

              {/* Chat Info */}
              <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
                 <div className="flex justify-between items-start">
                    <h4 className="text-[15px] font-bold text-slate-900 truncate">{chat.name}</h4>
                    <span className="text-[10px] font-bold text-gray-400 whitespace-nowrap">{chat.time || "12:12 PM"}</span>
                 </div>
                 <p className="text-xs truncate text-gray-500 font-medium">
                    {chat.lastMsg || "This Document Contains important in..."}
                 </p>
                 <div className="mt-1.5 flex justify-between items-center">
                    <span className="inline-block px-2 py-0.5 rounded text-[9px] font-extrabold text-[#16a34a] bg-[#f0fdf4] border border-[#bbf7d0] uppercase tracking-wider shadow-sm">
                       Warm Lead
                    </span>
                    {chat.unread > 0 && (
                        <span className="min-w-[1.25rem] h-5 px-1.5 bg-[#22C55E] text-white text-[10px] font-bold flex items-center justify-center rounded-full shadow-sm">
                            {chat.unread}
                        </span>
                    )}
                 </div>
              </div>
           </div>
         )) : (
            <div className="flex flex-col items-center justify-center h-40 text-slate-400 text-xs">
                <p className="font-medium">No chats found.</p>
            </div>
         )}
      </div>
    </div>
  );
};

export default ContactCard;