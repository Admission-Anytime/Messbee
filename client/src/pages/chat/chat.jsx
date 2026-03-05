import React, { useState, useMemo, useEffect } from "react";
import ContactCard from "./ContactCard";
import Conversion from "./Conversion";
import UserProfilePanel from "./UserProfilePanel";
import ActivityLog from "./ActivityLog"; 
import axios from "../../context/axios";
import io from "socket.io-client";
import ErrorState from "../../components/ui/ErrorState";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";
var socket;

const Chat = () => {
  const [chats, setChats] = useState([]); 
  const [messages, setMessages] = useState([]); 
  const [activeChatId, setActiveChatId] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [activeTab, setActiveTab] = useState("All"); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ State to track if we are viewing the Activity Log instead of Chat
  const [showActivityLog, setShowActivityLog] = useState(false);

  useEffect(() => {
    socket = io(SOCKET_URL);

    const fetchChats = async () => {
      try {
        setError(null);
        // const { data } = await axios.get('/chats'); 
        
        const mockChats = [
          { _id: '1', name: "Priyanshu Raghuvanshi", time: "12:12 PM", lastMsg: "This Document Contains important in...", unread: 2, chatStatus: 'open' },
          { _id: '2', name: "Arshlan Khan", time: "YESTERDAY", lastMsg: "Please check the latest updates...", unread: 0, chatStatus: 'open' },
          { _id: '3', name: "Keshri Singh Aarti", time: "5 FEB", lastMsg: "Thank you for the quick response!", unread: 0, chatStatus: 'closed' },
        ];

        setChats(mockChats);
        if (mockChats.length > 0 && !activeChatId) setActiveChatId(mockChats[0]._id);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching chats:", err);
        setError(err.response?.data?.message || "Failed to load chats. Please try again.");
        setLoading(false);
      }
    };

    fetchChats();

    socket.on("receive_message", (data) => {
      if (activeChatId === data.chatId) {
        setMessages((prev) => {
          const isDuplicate = prev.some(msg => 
             msg._id === data.message._id || 
             (msg.text === data.message.text && msg.time === data.message.time && msg.sender === 'me')
          );
          if (isDuplicate) return prev; 
          return [...prev, data.message]; 
        });
      }

      setChats((prevChats) => 
        prevChats.map((chat) => 
          chat._id === data.chatId 
            ? { ...chat, lastMsg: data.message.media ? `📸 Image` : data.message.text, lastMsgTime: data.message.time, unread: chat._id === activeChatId ? chat.unread : (chat.unread || 0) + 1 } 
            : chat
        )
      );
    });

    return () => socket.disconnect();
  }, [activeChatId]);

  useEffect(() => {
    if (!activeChatId) return;

    const fetchMessages = async () => {
      try {
        // const { data } = await axios.get(`/messages/${activeChatId}`);
        // await axios.put(`/chats/${activeChatId}/read`);
        
        const mockMessages = [
          { _id: 'm1', text: "Hello!", sender: "them", time: "12:05 PM", status: "read" },
          { _id: 'm2', text: "What Are u doing ?", sender: "me", time: "12:07 PM", status: "read" },
          { _id: 'm3', text: "I am Working On my project.", sender: "them", time: "12:08 PM", status: "read" },
          { _id: 'm4', text: "Only two screen are left!", sender: "me", time: "12:12 PM", status: "delivered" },
        ];
        
        setMessages(mockMessages);
        socket.emit("join_chat", activeChatId);
        setChats((prevChats) => prevChats.map((chat) => chat._id === activeChatId ? { ...chat, unread: 0 } : chat));
      } catch (err) {
        console.error("Error fetching messages:", err);
      }
    };

    fetchMessages();
  }, [activeChatId]);

  const activeChat = chats.find((c) => c._id === activeChatId);

  const filteredChats = useMemo(() => {
    switch (activeTab) {
      case "Mine": return chats.filter((c) => c.teamMember !== "Unassigned");
      case "Open": return chats.filter((c) => c.chatStatus === "open");
      case "Closed": return chats.filter((c) => c.chatStatus === "closed");
      case "WhatsApp": return chats.filter((c) => c.source === "whatsapp");
      default: return chats;
    }
  }, [chats, activeTab]);

  const handleSendMessage = async (text, media = null) => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    const messageData = {
      chatId: activeChatId,
      text: text,
      media: media, 
      sender: "me",
      time: time
    };

    try {
      const tempMessage = { ...messageData, _id: 'temp_' + Date.now(), status: 'pending', createdAt: new Date() };
      setMessages((prev) => [...prev, tempMessage]);

      setChats((prev) => prev.map(c => c._id === activeChatId ? { ...c, lastMsg: media ? `📸 Image` : text, lastMsgTime: time } : c));

      // const response = await axios.post('/message', messageData);
      const mockResponse = { ...tempMessage, status: 'sent' };

      setMessages((prev) => prev.map(msg => msg._id === tempMessage._id ? { ...mockResponse, status: mockResponse.status || 'sent' } : msg));
      socket.emit("send_message", { chatId: activeChatId, message: mockResponse });

    } catch (error) {
      setMessages((prev) => prev.map(msg => msg._id === 'temp_' + Date.now() ? { ...msg, status: 'failed' } : msg));
    }
  };

  if (error && !loading) return <ErrorState onRetry={() => window.location.reload()} message={error} />;

  // ✅ IF showActivityLog is true, completely swap out the UI with the Activity Log
  if (showActivityLog) {
    return <ActivityLog onBack={() => setShowActivityLog(false)} />;
  }

  return (
    <div className="flex w-full h-full bg-white font-['Urbanist'] overflow-hidden">
      <style>{` .custom-scrollbar::-webkit-scrollbar { width: 5px; } .custom-scrollbar::-webkit-scrollbar-track { background: transparent; } .custom-scrollbar::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 10px; } .hide-scrollbar::-webkit-scrollbar { display: none; } `}</style>
      
      {/* LEFT: CONTACT LIST */}
      <div className={`w-full md:w-[350px] lg:w-[380px] flex flex-col border-r border-gray-100 h-full bg-white shrink-0 ${activeChatId ? 'hidden md:flex' : 'flex'}`}>
        {loading ? <div className="p-10 text-center text-slate-400">Loading chats...</div> : <ContactCard chats={filteredChats} activeChatId={activeChatId} onChatSelect={(id) => { setActiveChatId(id); setShowProfile(false); }} activeTab={activeTab} setActiveTab={setActiveTab} />}
      </div>
      
      {/* MIDDLE: CONVERSATION AREA */}
      <div className={`flex-1 flex flex-col h-full bg-white relative min-w-0 ${!activeChatId ? 'hidden md:flex' : 'flex'}`}>
        {activeChat ? (
          <div className="flex h-full w-full relative">
             <div className="flex-1 h-full min-w-0 flex flex-col border-r border-gray-100">
                <Conversion 
                  data={{ ...activeChat, messages: messages }} 
                  onSendMessage={handleSendMessage} 
                  onBack={() => setActiveChatId(null)} 
                  onToggleProfile={() => setShowProfile(!showProfile)} 
                  // ✅ Pass this so the 3-dot menu inside Chat can open the Activity Log
                  onViewHistory={() => setShowActivityLog(true)} 
                />
             </div>
             
             {/* RIGHT: PROFILE PANEL */}
             {showProfile && (
                <div className="w-[320px] lg:w-[340px] bg-white h-full shrink-0 hidden xl:block">
                   <UserProfilePanel 
                     data={activeChat} 
                     onClose={() => setShowProfile(false)} 
                     // ✅ Pass this so the button in the profile panel can open the Activity Log
                     onViewHistory={() => setShowActivityLog(true)} 
                   />
                </div>
             )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 bg-gray-50/50"><p className="font-semibold text-slate-500">Select a conversation</p></div>
        )}
      </div>
    </div>
  );
};

export default Chat;