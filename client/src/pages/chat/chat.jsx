import React, { useState, useMemo } from "react";
import Infobox from "./Infobox";
import ContactCard from "./ContactCard";
import Conversion from "./Conversion";
import UserProfilePanel from "./UserProfilePanel";

// --- CRM DATA SOURCE ---
const CRM_DATABASE = [
  { id: 1, name: "Abhyan Morkal", whatsapp: "+911234567001", status: "open", type: "inbox", timer: "04:30:00", tags: ["Hot Lead", "Urgent"] },
  { id: 2, name: "Rahul Verma", whatsapp: "+919876543210", status: "closed", type: "blocked", timer: null, tags: ["Closed"] },
  { id: 3, name: "Aditi Singh", whatsapp: "+919988776655", status: "open", type: "starred", timer: "23:15:00", tags: ["New"] },
  { id: 4, name: "Priya Sharma", whatsapp: "+918877665544", status: "open", type: "inbox", timer: "01:05:00", tags: ["Follow-up"] },
  { id: 5, name: "Amit Kumar", whatsapp: "+917766554433", status: "unassigned", type: "unassigned", timer: null, tags: [] },
  { id: 6, name: "Sneha Gupta", whatsapp: "+916655443322", status: "archived", type: "inbox", timer: null, tags: ["Archived"] },
];

const loadChatsFromCRM = () => {
  return CRM_DATABASE.map((contact) => ({
    ...contact,
    phone: contact.whatsapp,
    status: contact.status === "active" ? "online" : "offline",
    avatar: `https://ui-avatars.com/api/?name=${contact.name.replace(" ", "+")}&background=random&color=fff`,
    lastMsg: contact.status === "pending" ? "Inquiry about course details." : "Can you send the brochure?",
    time: "10:30 AM",
    unread: contact.status === "open" ? 1 : 0,
    messages: [
        { id: 1, text: "Hello!", sender: "me", time: "10:00 AM", type: "text" },
        { id: 2, text: "I want to know about the course.", sender: "them", time: "10:30 AM", type: "text" }
    ]
  }));
};

const Chat = () => {
  const [chats, setChats] = useState(loadChatsFromCRM());
  const [activeChatId, setActiveChatId] = useState(chats[0]?.id);
  const [showProfile, setShowProfile] = useState(false);
  const [activeFolder, setActiveFolder] = useState("All Chat"); 
  const [activeTab, setActiveTab] = useState("All"); 

  const activeChat = chats.find((c) => c.id === activeChatId);

  // --- FILTER LOGIC ---
  const filteredChats = useMemo(() => {
    let result = chats;
    if (activeTab === "My Chat") result = result.filter(c => c.status === "open"); 
    if (activeTab === "Unassigned") result = result.filter(c => c.status === "unassigned");
    if (activeTab === "Open") result = result.filter(c => c.status === "open");
    if (activeTab === "Closed") result = result.filter(c => c.status === "closed");
    if (activeTab === "Archived") result = result.filter(c => c.status === "archived");

    if (activeFolder === "Blocked Chats") result = result.filter(c => c.type === "blocked");
    if (activeFolder === "Pinned Chats") result = result.filter(c => c.type === "starred");

    return result;
  }, [chats, activeFolder, activeTab]);

  const handleSendMessage = (text) => {
    const newMsg = {
      id: Date.now(),
      text: text,
      sender: "me",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: "text"
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
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: #94a3b8; }
      `}</style>

      {/* 1. INFOBOX (Filters) - ✅ REMOVED 'w-64' so it can shrink */}
      <div className="hidden md:flex flex-col border-r border-slate-200 h-full bg-white shrink-0">
        <Infobox activeFilter={activeFolder} onFilterSelect={setActiveFolder} />
      </div>

      {/* 2. CONTACT LIST */}
      <div className={`w-full md:w-80 lg:w-[350px] flex flex-col border-r border-slate-200 h-full bg-white shrink-0 ${activeChatId ? 'hidden md:flex' : 'flex'}`}>
        <ContactCard 
          chats={filteredChats} 
          activeChatId={activeChatId} 
          onChatSelect={(id) => { setActiveChatId(id); setShowProfile(false); }} 
          activeTab={activeTab}
          setActiveTab={setActiveTab}
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
             
             {showProfile && (
                <div className="w-80 border-l border-slate-200 bg-white h-full shrink-0 hidden xl:block animate-in slide-in-from-right duration-300">
                    <UserProfilePanel data={activeChat} onClose={() => setShowProfile(false)} />
                </div>
             )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-400">
             <p className="font-semibold text-slate-500">Select a conversation</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;