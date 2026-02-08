import React, { useState, useMemo } from "react";
import Infobox from "./Infobox";
import ContactCard from "./ContactCard";
import Conversion from "./Conversion";
import UserProfilePanel from "./UserProfilePanel";

// --- 1. CRM DATA SOURCE ---
const CRM_DATABASE = [
  { id: 1, name: "Abhyan Morkal", whatsapp: "+911234567001", status: "pending", email: "abhyan@gmail.com", type: "inbox" },
  { id: 2, name: "Rahul Verma", whatsapp: "+919876543210", status: "deactive", email: "rahul@gmail.com", type: "blocked" },
  { id: 3, name: "Aditi Singh", whatsapp: "+919988776655", status: "active", email: "aditi@test.com", type: "starred" },
  { id: 4, name: "Priya Sharma", whatsapp: "+918877665544", status: "active", email: "priya@demo.com", type: "inbox" },
  { id: 5, name: "Amit Kumar", whatsapp: "+917766554433", status: "active", email: "amit@test.com", type: "unassigned" },
  { id: 6, name: "Sneha Gupta", whatsapp: "+916655443322", status: "deactive", email: "sneha@gmail.com", type: "inbox" },
];

const loadChatsFromCRM = () => {
  return CRM_DATABASE.map((contact) => ({
    ...contact,
    phone: contact.whatsapp,
    status: contact.status === "active" ? "online" : "offline",
    avatar: `https://ui-avatars.com/api/?name=${contact.name.replace(" ", "+")}&background=random&color=fff`,
    lastMsg: contact.status === "pending" ? "Inquiry about course details." : "Can you send the brochure?",
    time: "10:30 AM",
    unread: contact.status === "pending" ? 1 : 0,
    messages: [
        { id: 1, text: "Hello!", sender: "me", time: "10:00 AM" },
        { id: 2, text: "I want to know about the course.", sender: "them", time: "10:30 AM" }
    ]
  }));
};

const Chat = () => {
  const [chats, setChats] = useState(loadChatsFromCRM());
  const [activeChatId, setActiveChatId] = useState(chats[0]?.id);
  const [showProfile, setShowProfile] = useState(false);
  const [activeFilter, setActiveFilter] = useState("All Chat"); // Default Filter

  const activeChat = chats.find((c) => c.id === activeChatId);

  // --- FILTER LOGIC ---
  const filteredChats = useMemo(() => {
    switch (activeFilter) {
      case "Unassigned": return chats.filter(c => c.type === "unassigned");
      case "Pinned Chats": return chats.filter(c => c.type === "starred");
      case "Blocked Chats": return chats.filter(c => c.type === "blocked");
      case "My Chat": return chats.filter(c => c.status === "online"); // Dummy logic for "My Chat"
      default: return chats; // "All Chat"
    }
  }, [chats, activeFilter]);

  // --- ACTIONS ---
  const handleSendMessage = (text) => {
    const newMsg = {
      id: Date.now(),
      text: text,
      sender: "me",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setChats(prev => prev.map(chat => chat.id === activeChatId ? { ...chat, messages: [...chat.messages, newMsg], lastMsg: text, time: "Just now" } : chat));
  };

  const handleDeleteMessage = (msgId) => {
    setChats(prev => prev.map(chat => chat.id === activeChatId ? { ...chat, messages: chat.messages.filter(m => m.id !== msgId) } : chat));
  };

  const handleClearChat = () => {
    if(window.confirm("Clear this conversation?")) {
        setChats(prev => prev.map(chat => chat.id === activeChatId ? { ...chat, messages: [], lastMsg: "" } : chat));
    }
  };

  const handleDeleteChat = () => {
    if(window.confirm("Delete this contact permanently?")) {
        const newChats = chats.filter(c => c.id !== activeChatId);
        setChats(newChats);
        setActiveChatId(newChats.length > 0 ? newChats[0].id : null);
        setShowProfile(false);
    }
  };

  return (
    <div className="flex w-full h-full bg-white font-['Urbanist'] overflow-hidden">
      
      {/* Scrollbar Style */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: #94a3b8; }
      `}</style>

      {/* 1. INFOBOX (Filters) */}
      <div className="hidden md:flex w-64 flex-col border-r border-slate-200 h-full bg-white shrink-0">
        <Infobox activeFilter={activeFilter} onFilterSelect={setActiveFilter} />
      </div>

      {/* 2. CONTACT LIST */}
      <div className={`w-full md:w-80 lg:w-96 flex flex-col border-r border-slate-200 h-full bg-slate-50 shrink-0 ${activeChatId ? 'hidden md:flex' : 'flex'}`}>
        <ContactCard 
          chats={filteredChats} 
          activeChatId={activeChatId} 
          onChatSelect={(id) => { setActiveChatId(id); setShowProfile(false); }} 
        />
      </div>

      {/* 3. CONVERSION + PROFILE */}
      <div className={`flex-1 flex flex-col h-full bg-[#efeae2] relative min-w-0 ${!activeChatId ? 'hidden md:flex' : 'flex'}`}>
        {activeChat ? (
          <div className="flex h-full w-full relative">
             <div className="flex-1 h-full min-w-0 flex flex-col">
                <Conversion 
                  data={activeChat} 
                  onSendMessage={handleSendMessage} 
                  onDeleteMessage={handleDeleteMessage}
                  onClearChat={handleClearChat}
                  onDeleteChat={handleDeleteChat}
                  onBack={() => setActiveChatId(null)} 
                  onToggleProfile={() => setShowProfile(!showProfile)}
                />
             </div>
             
             {/* Profile Sidebar Slide-in */}
             {showProfile && (
                <div className="w-80 border-l border-slate-200 bg-white h-full shrink-0 hidden xl:block animate-in slide-in-from-right duration-300">
                    <UserProfilePanel data={activeChat} onClose={() => setShowProfile(false)} />
                </div>
             )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-400">
             <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-10 h-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
             </div>
             <p className="font-semibold text-slate-500">Select a conversation</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;