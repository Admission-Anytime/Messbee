import React, { useState, useMemo, useEffect } from "react";
import ContactCard from "./ContactCard";
import Conversion from "./Conversion";
import UserProfilePanel from "./UserProfilePanel";
import axios from "axios";
import io from "socket.io-client";

// --- CONFIGURATION ---
const API_URL = "http://localhost:5000/api";
const SOCKET_URL = "http://localhost:5000";

var socket;

const Chat = () => {
  const [chats, setChats] = useState([]); // List of contacts
  const [messages, setMessages] = useState([]); // Current conversation messages
  const [activeChatId, setActiveChatId] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [activeTab, setActiveTab] = useState("All Chats");
  const [loading, setLoading] = useState(true);

  // --- 1. INITIALIZE DATA & SOCKET ---
  useEffect(() => {
    // Connect Socket
    socket = io(SOCKET_URL);

    // Fetch Chat List
    const fetchChats = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/chats`);
        setChats(data);
        // Automatically select first chat if available
        if (data.length > 0 && !activeChatId) setActiveChatId(data[0]._id);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching chats:", err);
        setLoading(false);
      }
    };

    fetchChats();

    // Socket Listener for incoming messages
    socket.on("receive_message", (newMessage) => {
      // If the message belongs to the currently open chat, append it
      if (activeChatId === newMessage.chatId) {
        setMessages((prev) => [...prev, newMessage]);
      }
      
      // Update the sidebar preview for ANY chat
      setChats((prevChats) => 
        prevChats.map((chat) => 
          chat._id === newMessage.chatId 
            ? { ...chat, lastMsg: newMessage.text, lastMsgTime: newMessage.time }
            : chat
        )
      );
    });

    return () => {
      socket.disconnect();
    };
  }, [activeChatId]);

  // --- 2. FETCH MESSAGES WHEN CHAT IS SELECTED ---
  useEffect(() => {
    if (!activeChatId) return;

    const fetchMessages = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/messages/${activeChatId}`);
        setMessages(data);
        
        // Join Socket Room
        socket.emit("join_chat", activeChatId);
      } catch (err) {
        console.error("Error fetching messages:", err);
      }
    };

    fetchMessages();
  }, [activeChatId]);

  const activeChat = chats.find((c) => c._id === activeChatId);

  // --- 3. FILTER LOGIC ---
  const filteredChats = useMemo(() => {
    switch (activeTab) {
      case "Mine": return chats.filter((c) => c.teamMember === "Akshay Tomar");
      case "Open": return chats.filter((c) => c.chatStatus === "open");
      case "Closed": return chats.filter((c) => c.chatStatus === "closed");
      // Add other cases as needed matching your Backend Schema
      default: return chats;
    }
  }, [chats, activeTab]);

  // --- 4. SEND MESSAGE HANDLER ---
  const handleSendMessage = async (text) => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    const messageData = {
      chatId: activeChatId,
      text: text,
      sender: "me",
      time: time
    };

    try {
      // 1. Optimistic UI Update (Show immediately)
      setMessages((prev) => [...prev, messageData]);

      // 2. Update Sidebar Preview Immediately
      setChats((prev) => prev.map(c => c._id === activeChatId ? { ...c, lastMsg: text, lastMsgTime: time } : c));

      // 3. Send to Backend (Save to DB)
      await axios.post(`${API_URL}/message`, messageData);

      // 4. Emit to Socket (So user receives it instantly if they were online)
      socket.emit("send_message", messageData);

    } catch (error) {
      console.error("Failed to send message", error);
      alert("Failed to send message");
    }
  };

  // --- 5. RENDER ---
  return (
    <div className="flex w-full h-full bg-white font-['Urbanist'] overflow-hidden">
      <style>{` .hide-scrollbar::-webkit-scrollbar { display: none; } `}</style>

      {/* LEFT: CONTACT LIST */}
      <div className={`w-full md:w-[380px] flex flex-col border-r border-gray-200 h-full bg-white shrink-0 ${activeChatId ? 'hidden md:flex' : 'flex'}`}>
        {loading ? (
           <div className="p-10 text-center text-slate-400">Loading chats...</div>
        ) : (
           <ContactCard 
             chats={filteredChats} 
             activeChatId={activeChatId} 
             onChatSelect={(id) => { setActiveChatId(id); setShowProfile(false); }} 
             activeTab={activeTab}
             setActiveTab={setActiveTab}
           />
        )}
      </div>

      {/* MIDDLE: CONVERSATION AREA */}
      <div className={`flex-1 flex flex-col h-full bg-white relative min-w-0 ${!activeChatId ? 'hidden md:flex' : 'flex'}`}>
        {activeChat ? (
          <div className="flex h-full w-full relative">
             <div className="flex-1 h-full min-w-0 flex flex-col">
                {/* IMPORTANT: Pass 'messages' prop to Conversion. 
                   Ensure your Conversion component uses this prop instead of 'data.messages' 
                */}
                <Conversion 
                  data={{ ...activeChat, messages: messages }} // Merge live messages into chat object
                  onSendMessage={handleSendMessage} 
                  onBack={() => setActiveChatId(null)} 
                  onToggleProfile={() => setShowProfile(!showProfile)}
                  // Pass other handlers if needed (delete, clear, etc.)
                />
             </div>
             
             {/* RIGHT: PROFILE PANEL */}
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