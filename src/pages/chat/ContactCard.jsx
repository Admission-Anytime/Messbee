import React, { useState } from "react";

const ContactCard = ({ chats, activeChatId, onChatSelect }) => {
  const [searchTerm, setSearchTerm] = useState("");

  // Local Search (filters the already filtered list)
  const displayChats = chats.filter((c) => c.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="flex flex-col h-full bg-white">
      
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100 shrink-0">
         <h2 className="text-lg font-bold text-slate-800">Messages</h2>
         <span className="bg-red-100 text-[#ba2525] text-xs font-bold px-2 py-1 rounded-full">{displayChats.length}</span>
      </div>

      <div className="p-3 border-b border-slate-100 shrink-0 bg-slate-50/50">
         <div className="relative">
            <input 
              type="text" 
              placeholder="Search contacts..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-200 text-sm pl-9 pr-4 py-2 rounded-full outline-none focus:border-[#ba2525] transition-all"
            />
            <svg className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
         </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
         {displayChats.length > 0 ? displayChats.map((chat) => (
           <div 
             key={chat.id} 
             onClick={() => onChatSelect(chat.id)}
             className={`
               flex items-center gap-3 p-4 border-b border-slate-50 cursor-pointer transition-all hover:bg-slate-50 group
               ${activeChatId === chat.id ? "bg-red-50 border-l-4 border-l-[#ba2525]" : "border-l-4 border-l-transparent"}
             `}
           >
              <div className="relative shrink-0">
                <img src={chat.avatar} alt="" className="w-12 h-12 rounded-full object-cover shadow-sm" />
                {chat.status === "online" && <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>}
              </div>
              <div className="flex-1 min-w-0">
                 <div className="flex justify-between items-center mb-1">
                    <h4 className={`text-sm font-bold truncate ${activeChatId === chat.id ? "text-slate-900" : "text-slate-700"}`}>{chat.name}</h4>
                    <span className="text-[10px] text-slate-400 font-medium">{chat.time}</span>
                 </div>
                 <div className="flex justify-between items-center">
                    <p className={`text-xs truncate max-w-[180px] ${activeChatId === chat.id ? "text-slate-600 font-medium" : "text-slate-500"}`}>{chat.lastMsg}</p>
                    {chat.unread > 0 && <span className="w-5 h-5 bg-[#ba2525] text-white text-[10px] font-bold flex items-center justify-center rounded-full shadow-sm">{chat.unread}</span>}
                 </div>
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