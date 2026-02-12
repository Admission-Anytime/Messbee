import React, { useState, useMemo } from "react";
import ContactCard from "./ContactCard";
import Conversion from "./Conversion";
import UserProfilePanel from "./UserProfilePanel";

// --- CRM DATA SOURCE ---
const CRM_DATABASE = [
  { 
    id: 1, 
    name: "Priyanshu Raghuvanshi", 
    phone: "+91 98765 43210", 
    status: "active", 
    chatStatus: "open", 
    isPinned: false, 
    isBlocked: false,
    openSession: true, 
    teamMember: "Akshay Tomar",
    labels: ["Warm Lead", "Payment Pending"],
    avatar: "https://i.pravatar.cc/150?u=1", 
    lastMsg: "This Document Contains...", 
    time: "12:12 PM", 
    unread: 1 
  },
  { 
    id: 2, 
    name: "Arshlan Khan", 
    phone: "+91 87654 32109", 
    status: "offline", 
    chatStatus: "closed", 
    isPinned: false, 
    isBlocked: true, 
    openSession: false,
    teamMember: "Priyanshu",
    labels: ["Resolved", "Issue Raised"],
    avatar: "https://i.pravatar.cc/150?u=2", 
    lastMsg: "Issue resolved, thank you.", 
    time: "Yesterday", 
    unread: 0 
  },
  { 
    id: 3, 
    name: "Keshri Singh Aarti", 
    phone: "+91 76543 21098", 
    status: "offline", 
    chatStatus: "unassigned", 
    isPinned: true, 
    isBlocked: false,
    openSession: true,
    teamMember: "Unassigned",
    labels: ["Cold Lead"],
    avatar: "https://i.pravatar.cc/150?u=3", 
    lastMsg: "Waiting for support agent...", 
    time: "5 Feb 2026", 
    unread: 2 
  },
  { 
    id: 4, 
    name: "Maneet Singh", 
    phone: "+91 65432 10987", 
    status: "offline", 
    chatStatus: "archived", 
    isPinned: false, 
    isBlocked: false,
    openSession: false,
    teamMember: "Akshay Tomar",
    labels: ["Invoice Sent"],
    avatar: "https://i.pravatar.cc/150?u=4", 
    lastMsg: "Project details attached.", 
    time: "4 Feb 2026", 
    unread: 0 
  },
  { 
    id: 5, 
    name: "Dhira Mishra", 
    phone: "+91 54321 09876", 
    status: "offline", 
    chatStatus: "open", 
    isPinned: true, 
    isBlocked: false,
    openSession: true,
    teamMember: "Priyanshu",
    labels: ["Warm Lead", "Issue Raised"],
    avatar: "https://i.pravatar.cc/150?u=5", 
    lastMsg: "Urgent: Payment failed.", 
    time: "28 Jan 2026", 
    unread: 1 
  },
  { 
    id: 6, 
    name: "Hitesh", 
    phone: "+91 43210 98765", 
    status: "offline", 
    chatStatus: "unassigned", 
    isPinned: false, 
    isBlocked: false,
    openSession: false,
    teamMember: "Unassigned",
    labels: [],
    avatar: "https://i.pravatar.cc/150?u=6", 
    lastMsg: "Inquiry about pricing.", 
    time: "11 Dec 2026", 
    unread: 0 
  },
];

const loadChatsFromCRM = () => {
  return CRM_DATABASE.map((contact) => ({
    ...contact,
    messages: [
        { id: 1, text: "Hello", sender: "them", time: "12:00 PM" },
        { id: 2, text: "What Are u doing ?", sender: "me", time: "12:01 PM" },
        { id: 3, text: "I am Working On my project.", sender: "them", time: "12:02 PM" },
        { id: 4, text: "How Much complete Your Work", sender: "me", time: "12:03 PM" },
        { id: 5, text: "Only two screen are left", sender: "them", time: "12:04 PM" },
        { id: 6, text: "Ok", sender: "me", time: "12:05 PM" }
    ]
  }));
};

const Chat = () => {
  const [chats, setChats] = useState(loadChatsFromCRM());
  const [activeChatId, setActiveChatId] = useState(chats[0]?.id);
  const [showProfile, setShowProfile] = useState(false);
  const [activeTab, setActiveTab] = useState("All Chats"); 

  const activeChat = chats.find((c) => c.id === activeChatId);

  // --- FILTER LOGIC ---
  const filteredChats = useMemo(() => {
    switch (activeTab) {
      case "Mine": return chats.filter((c) => c.teamMember === "Akshay Tomar" || c.isMine);
      case "Queue": return chats.filter((c) => c.chatStatus === "queue");
      case "Unassigned": return chats.filter((c) => c.chatStatus === "unassigned");
      case "Open": return chats.filter((c) => c.chatStatus === "open");
      case "Closed": return chats.filter((c) => c.chatStatus === "closed");
      case "Archived": return chats.filter((c) => c.chatStatus === "archived");
      case "Pinned": return chats.filter((c) => c.isPinned);
      case "Blocked": return chats.filter((c) => c.isBlocked);
      case "All Chats": default: return chats;
    }
  }, [chats, activeTab]);

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
        const nextChat = newChats.length > 0 ? newChats[0].id : null;
        setActiveChatId(nextChat);
        setShowProfile(false);
    }
  };

  // Logic for the 3-dot menu to update chat status
  const handleStatusChange = (newStatus) => {
    setChats(prev => prev.map(chat => {
        if (chat.id === activeChatId) {
            let updatedChat = { ...chat };
            if (newStatus === "pinned") updatedChat.isPinned = !updatedChat.isPinned;
            else if (newStatus === "blocked") updatedChat.isBlocked = !updatedChat.isBlocked;
            else {
                updatedChat.chatStatus = newStatus;
                if (newStatus !== 'archived') updatedChat.isBlocked = false; 
            }
            return updatedChat;
        }
        return chat;
    }));
  };

  return (
    <div className="flex w-full h-full bg-white font-['Urbanist'] overflow-hidden">
      <style>{` .hide-scrollbar::-webkit-scrollbar { display: none; } `}</style>

      {/* 1. CONTACT LIST */}
      <div className={`w-full md:w-[380px] flex flex-col border-r border-gray-200 h-full bg-white shrink-0 ${activeChatId ? 'hidden md:flex' : 'flex'}`}>
        <ContactCard 
          chats={filteredChats} 
          activeChatId={activeChatId} 
          onChatSelect={(id) => { setActiveChatId(id); setShowProfile(false); }} 
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      </div>

      {/* 2. CONVERSION AREA */}
      <div className={`flex-1 flex flex-col h-full bg-white relative min-w-0 ${!activeChatId ? 'hidden md:flex' : 'flex'}`}>
        {activeChat ? (
          <div className="flex h-full w-full relative">
             <div className="flex-1 h-full min-w-0 flex flex-col">
                <Conversion 
                  data={activeChat} 
                  onSendMessage={handleSendMessage} 
                  onDeleteMessage={handleDeleteMessage}
                  onClearChat={handleClearChat}
                  onDeleteChat={handleDeleteChat}
                  onUpdateStatus={handleStatusChange}
                  onBack={() => setActiveChatId(null)} 
                  onToggleProfile={() => setShowProfile(!showProfile)}
                />
             </div>
             
             {showProfile && (
                <div className="w-80 border-l border-gray-200 bg-white h-full shrink-0 hidden xl:block">
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