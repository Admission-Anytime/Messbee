import React, { useState } from "react";
import { FunnelIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";

const TABS = ["All", "My Chat", "Unassigned", "Open", "Closed", "Archived"];

const ContactCard = ({ chats, activeChatId, onChatSelect, activeTab, setActiveTab }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const displayChats = chats.filter((c) => c.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="flex flex-col h-full bg-white">
      
      {/* 1. Header with Title & Filter Icon */}
      <div className="h-14 flex items-center justify-between px-4 shrink-0 bg-white">
         <h2 className="text-xl font-bold text-slate-800">Chats</h2>
         <div className="flex gap-3 text-slate-500">
            <button className="hover:bg-slate-100 p-2 rounded-full"><FunnelIcon className="w-5 h-5" /></button>
         </div>
      </div>

      {/* 2. Search Bar (Material Style) */}
      <div className="px-3 pb-2 shrink-0">
         <div className="relative bg-slate-100 rounded-lg flex items-center px-3 py-2">
            <MagnifyingGlassIcon className="w-5 h-5 text-slate-400 mr-3" />
            <input 
              type="text" 
              placeholder="Search here" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none text-sm placeholder:text-slate-500 text-slate-700"
            />
         </div>
      </div>

      {/* 3. TABS BAR (Scrollable) */}
      <div className="flex items-center gap-4 px-4 border-b border-slate-100 overflow-x-auto no-scrollbar shrink-0">
         {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab 
                  ? "border-[#ba2525] text-[#ba2525]" // YOUR THEME COLOR
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              {tab}
            </button>
         ))}
      </div>

      {/* 4. Chat List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
         {displayChats.length > 0 ? displayChats.map((chat) => (
           <div 
             key={chat.id} 
             onClick={() => onChatSelect(chat.id)}
             className={`
               flex gap-3 p-3 border-b border-slate-50 cursor-pointer transition-all hover:bg-slate-50 relative group
               ${activeChatId === chat.id ? "bg-red-50/40" : ""}
             `}
           >
              {/* Avatar */}
              <div className="relative shrink-0">
                <img src={chat.avatar} alt="" className="w-11 h-11 rounded-full object-cover" />
                {chat.status === "online" && <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                 <div className="flex justify-between items-baseline">
                    <h4 className="text-sm font-bold text-slate-900 truncate">{chat.name}</h4>
                    <span className={`text-[10px] ${chat.unread ? "text-[#ba2525] font-bold" : "text-slate-400"}`}>{chat.time}</span>
                 </div>
                 
                 <div className="flex justify-between items-center mt-0.5">
                    <p className="text-[13px] text-slate-500 truncate max-w-[180px]">{chat.lastMsg}</p>
                    
                    {/* Unread Badge */}
                    {chat.unread > 0 && (
                      <span className="min-w-[1.25rem] h-5 px-1 bg-[#ba2525] text-white text-[10px] font-bold flex items-center justify-center rounded-full">
                        {chat.unread}
                      </span>
                    )}
                 </div>

                 {/* Tags (Tiny dots/labels like the image) */}
                 {chat.tags && chat.tags.length > 0 && (
                    <div className="flex gap-1 mt-1.5">
                       {chat.tags.map((tag, i) => (
                          <span key={i} className="px-1.5 py-0.5 rounded-sm bg-blue-50 text-blue-600 text-[9px] font-bold border border-blue-100">
                             {tag}
                          </span>
                       ))}
                    </div>
                 )}
              </div>
           </div>
         )) : (
            <div className="flex flex-col items-center justify-center h-40 text-slate-400 text-xs">
                <p>No contacts found.</p>
            </div>
         )}
      </div>
    </div>
  );
};

export default ContactCard;