import React, { useState, useEffect, useRef } from "react";
import { 
  MagnifyingGlassIcon, 
  ChevronRightIcon, 
  XMarkIcon,
  DocumentDuplicateIcon,
  MapPinIcon
} from "@heroicons/react/24/outline";
import { CheckCircleIcon } from "@heroicons/react/24/solid";

const TABS = ["All Chats", "Mine", "Unread", "Active", "Resolved"];

const ContactCard = ({ chats, activeChatId, onChatSelect, activeTab, setActiveTab, onCreateChat }) => {
  const [searchTerm, setSearchTerm] = useState("");
  
  // State for the New Chat Modal
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
  const [newChatName, setNewChatName] = useState("");
  const [newChatPhone, setNewChatPhone] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  
  const displayChats = (chats || [])
    .filter((c) => {
      const matchesSearch = c.name?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    })
    .sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return 0; // Keep original order (which is usually by updatedAt from API)
    });

  const handleCreateNewChat = async () => {
    // Validate phone number
    if (!newChatPhone || newChatPhone.length !== 10) {
      setCreateError("Please enter a valid 10-digit phone number");
      return;
    }

    setIsCreating(true);
    setCreateError("");

    const fullPhone = `91${newChatPhone}`; // Add country code
    const name = newChatName.trim() || fullPhone;

    const result = await onCreateChat(name, fullPhone);

    if (result.success) {
      // Close modal and reset fields
      setIsNewChatModalOpen(false);
      setNewChatName("");
      setNewChatPhone("");
      setCreateError("");
    } else {
      setCreateError(result.error || "Failed to create chat. Please try again.");
    }

    setIsCreating(false);
  };

  const handleCloseModal = () => {
    setIsNewChatModalOpen(false);
    setNewChatName("");
    setNewChatPhone("");
    setCreateError("");
  };

  return (
    <div className="flex flex-col h-full bg-white relative font-sans">
      
      {/* 1. HEADER */}
      <div className="h-16 flex items-center justify-between px-5 shrink-0 bg-white z-40 relative">
         <h2 className="text-xl font-extrabold text-slate-900">Chats</h2>
         
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
                <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
                    <h3 className="text-base font-bold text-slate-900">Start New Chat</h3>
                    <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100 transition-colors -mr-1.5" disabled={isCreating}>
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>

                {/* Modal Body */}
                <div className="p-6 space-y-6">
                    
                    {/* Error Message */}
                    {createError && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                            {createError}
                        </div>
                    )}

                    {/* Contact Name (Optional) */}
                    <div>
                        <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Contact Name (Optional)</label>
                        <input 
                            type="text"
                            placeholder="Enter contact name"
                            value={newChatName}
                            onChange={(e) => setNewChatName(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium text-slate-900 outline-none focus:ring-1 focus:ring-[#22C55E] focus:border-[#22C55E]"
                            disabled={isCreating}
                        />
                    </div>
                    
                    {/* Enter Number */}
                    <div>
                        <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">WhatsApp Number *</label>
                        <div className="flex focus-within:ring-1 focus-within:ring-[#22C55E] focus-within:border-[#22C55E] rounded-xl transition-all shadow-sm">
                            <span className="inline-flex items-center px-4 py-3 rounded-l-xl border border-r-0 border-slate-200 bg-slate-50 text-slate-500 text-sm font-bold">
                                +91
                            </span>
                            <input 
                                type="text" 
                                placeholder="Enter 10-digit number" 
                                value={newChatPhone}
                                onChange={(e) => setNewChatPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                className="flex-1 min-w-0 block w-full px-4 py-3 rounded-r-xl border border-slate-200 text-sm font-medium text-slate-900 outline-none" 
                                autoFocus
                                disabled={isCreating}
                                maxLength={10}
                            />
                        </div>
                        <p className="mt-1 text-xs text-slate-500">Enter the WhatsApp number without country code</p>
                    </div>

                    {/* Info Box */}
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                        <p className="text-xs text-blue-800 font-medium">
                            💡 <strong>Tip:</strong> Make sure the number is registered on WhatsApp. You can start sending messages immediately after adding.
                        </p>
                    </div>
                </div>

                {/* Modal Footer */}
                <div className="flex items-center justify-end gap-3 px-6 py-4 bg-slate-50/50 border-t border-slate-100 shrink-0">
                    <button 
                        onClick={handleCloseModal} 
                        className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors rounded-xl hover:bg-slate-100"
                        disabled={isCreating}
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleCreateNewChat} 
                        className="px-6 py-2.5 text-sm font-bold text-white bg-[#22C55E] rounded-xl hover:bg-green-500 flex items-center gap-2 shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isCreating || !newChatPhone || newChatPhone.length !== 10}
                    >
                        {isCreating ? (
                            <>
                                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Creating...
                            </>
                        ) : (
                            <>
                                Start Conversation <ChevronRightIcon className="w-4 h-4" />
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* 2. SEARCH BAR */}
      <div className="px-5 pb-4 shrink-0">
         <div className="relative bg-slate-50 rounded-xl flex items-center px-4 py-2.5 border border-slate-100 focus-within:border-slate-300 focus-within:bg-white transition-all">
            <MagnifyingGlassIcon className="w-5 h-5 text-slate-400 mr-2" />
            <input 
              type="text" 
              placeholder="Search chats..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none text-xs text-slate-700 placeholder:text-slate-400"
            />
            <div className="w-5 h-5 border border-slate-200 rounded flex items-center justify-center text-[10px] text-slate-400 font-mono bg-white shadow-sm">/</div>
         </div>
      </div>

      {/* 3. FILTER TABS */}
      <div className="px-5 pb-3 overflow-x-auto hide-scrollbar flex gap-2 shrink-0 border-b border-slate-50">
         {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors shadow-sm ${
                activeTab === tab 
                  ? "bg-[#22C55E] text-white border border-[#22C55E]" 
                  : "bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100"
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
               flex gap-3 px-5 py-4 cursor-pointer transition-all border-b border-slate-50 relative
               ${activeChatId === (chat._id || chat.id) 
                 ? "bg-green-50 border-l-4 border-l-[#22C55E] shadow-sm" 
                 : "border-l-4 border-l-transparent hover:bg-slate-50"}
             `}
           >
              {/* Avatar */}
              <div className="relative shrink-0">
                <img src={chat.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(chat.name)}&background=random`} alt="" className="w-12 h-12 rounded-full object-cover" />
                {chat.status === 'active' && (
                  <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-[#22C55E] border-2 border-white rounded-full"></span>
                )}
              </div>

              {/* Chat Info */}
              <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
                 <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2 max-w-full overflow-hidden">
                      <h4 className="text-sm font-bold text-slate-900 truncate">{chat.name}</h4>
                      {chat.isPinned && (
                        <MapPinIcon className="w-3.5 h-3.5 text-green-500 fill-green-500 shrink-0" />
                      )}
                      {chat.source === 'whatsapp' && (
                        <span className="text-xs">
                          <svg className="w-3.5 h-3.5 fill-[#25D366]" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                          </svg>
                        </span>
                      )}
                    </div>
                     <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap">
                        {chat.updatedAt ? new Date(chat.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase() : (chat.lastMsgTime || "")}
                     </span>
                 </div>
                 <p className="text-xs truncate text-slate-500 font-medium">
                    {chat.lastMsg || "No messages yet"}
                 </p>
                 <div className="mt-1.5 flex justify-between items-center">
                    {chat.chatStatus && (
                      <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider shadow-sm ${
                        chat.chatStatus === 'open' ? 'text-[#16a34a] bg-[#f0fdf4] border border-[#bbf7d0]' :
                        chat.chatStatus === 'closed' ? 'text-slate-600 bg-slate-100 border border-slate-200' :
                        'text-blue-600 bg-blue-50 border border-blue-200'
                      }`}>
                         {chat.chatStatus}
                      </span>
                    )}
                    {chat.unread > 0 && (
                        <span className="min-w-[1.25rem] h-5 px-1.5 bg-[#22C55E] text-white text-[10px] font-bold flex items-center justify-center rounded-full shadow-sm">
                            {chat.unread}
                        </span>
                    )}
                 </div>
              </div>
           </div>
         )) : (
            <div className="flex flex-col items-center justify-center h-full px-6 text-center">
                <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                  <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">No chats yet</h3>
                <p className="text-sm text-slate-500 mb-4">Start a conversation by clicking the + button above</p>
                <button 
                  onClick={() => setIsNewChatModalOpen(true)}
                  className="px-6 py-2.5 text-sm font-bold text-white bg-[#22C55E] rounded-xl hover:bg-green-500 flex items-center gap-2 shadow-sm transition-colors"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 5V19M5 12H19" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Start New Chat
                </button>
            </div>
         )}
      </div>
    </div>
  );
};

export default ContactCard;