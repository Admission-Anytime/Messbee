import React, { useState, useMemo, useEffect } from "react";
import ContactCard from "./ContactCard";
import Conversion from "./Conversion";
import UserProfilePanel from "./UserProfilePanel";
import axios from "../../context/axios";
import io from "socket.io-client";

// --- CONFIGURATION ---
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

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
        const { data } = await axios.get('/chats');
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

    // Socket Listeners for WhatsApp integration
    
    // Handle incoming messages from WhatsApp
    socket.on("receive_message", (data) => {
      console.log("📱 Received message:", data);
      
      // If the message belongs to the currently open chat, append it
      if (activeChatId === data.chatId) {
        setMessages((prev) => [...prev, data.message]);
      }
      
      // Update the sidebar preview for ANY chat
      setChats((prevChats) => 
        prevChats.map((chat) => 
          chat._id === data.chatId 
            ? { 
                ...chat, 
                lastMsg: data.message.text, 
                lastMsgTime: data.message.time,
                unread: chat._id === activeChatId ? chat.unread : (chat.unread || 0) + 1
              }
            : chat
        )
      );
    });

    // Handle sent message confirmation
    socket.on("message_sent", (data) => {
      console.log("✅ Message sent:", data);
      
      // Update message status in UI
      if (activeChatId === data.chatId) {
        setMessages((prev) => 
          prev.map((msg) => 
            msg.whatsappMessageId === data.message.whatsappMessageId 
              ? { ...msg, status: data.message.status }
              : msg
          )
        );
      }
    });

    // Handle message status updates (delivered, read)
    socket.on("message_status_update", (data) => {
      console.log("📊 Status update:", data);
      
      setMessages((prev) => 
        prev.map((msg) => 
          msg._id === data.messageId || msg.whatsappMessageId === data.whatsappMessageId
            ? { ...msg, status: data.status }
            : msg
        )
      );
    });

    // Handle chat list updates
    socket.on("chat_updated", (updatedChat) => {
      console.log("🔄 Chat updated:", updatedChat);
      
      setChats((prevChats) => 
        prevChats.map((chat) => 
          chat._id === updatedChat._id ? updatedChat : chat
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
        const { data } = await axios.get(`/messages/${activeChatId}`);
        setMessages(data);
        
        // Join Socket Room
        socket.emit("join_chat", activeChatId);

        // Mark messages as read
        await axios.put(`/chats/${activeChatId}/read`);
        
        // Update unread count locally
        setChats((prevChats) => 
          prevChats.map((chat) => 
            chat._id === activeChatId ? { ...chat, unread: 0 } : chat
          )
        );
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
      case "Mine": return chats.filter((c) => c.teamMember !== "Unassigned");
      case "Open": return chats.filter((c) => c.chatStatus === "open");
      case "Closed": return chats.filter((c) => c.chatStatus === "closed");
      case "WhatsApp": return chats.filter((c) => c.source === "whatsapp");
      default: return chats;
    }
  }, [chats, activeTab]);

  // --- 4. SEND MESSAGE HANDLER (Enhanced for WhatsApp) ---
  const handleSendMessage = async (text) => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    const messageData = {
      chatId: activeChatId,
      text: text,
      sender: "me",
      time: time
    };

    try {
      // 1. Optimistic UI Update (Show immediately with 'pending' status)
      const tempMessage = { 
        ...messageData, 
        _id: 'temp_' + Date.now(),
        status: 'pending',
        createdAt: new Date()
      };
      setMessages((prev) => [...prev, tempMessage]);

      // 2. Update Sidebar Preview Immediately
      setChats((prev) => prev.map(c => 
        c._id === activeChatId 
          ? { ...c, lastMsg: text, lastMsgTime: time } 
          : c
      ));

      // 3. Send to Backend (will auto-detect WhatsApp and send via WhatsApp API)
      const response = await axios.post('/message', messageData);

      // 4. Replace temp message with real one from server
      setMessages((prev) => 
        prev.map(msg => 
          msg._id === tempMessage._id 
            ? { ...response.data, status: response.data.status || 'sent' }
            : msg
        )
      );

      // 5. Emit to Socket (for multi-device sync)
      socket.emit("send_message", {
        chatId: activeChatId,
        message: response.data
      });

    } catch (error) {
      console.error("Failed to send message", error);
      
      // Mark message as failed
      setMessages((prev) => 
        prev.map(msg => 
          msg._id === 'temp_' + Date.now() 
            ? { ...msg, status: 'failed' }
            : msg
        )
      );
      
      alert("Failed to send message. Please try again.");
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
                <Conversion 
                  data={{ ...activeChat, messages: messages }}
                  onSendMessage={handleSendMessage} 
                  onBack={() => setActiveChatId(null)} 
                  onToggleProfile={() => setShowProfile(!showProfile)}
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
             <svg className="w-32 h-32 mb-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
             </svg>
             <p className="font-semibold text-slate-500">Select a conversation</p>
             <p className="text-sm text-slate-400 mt-1">Choose from your WhatsApp chats</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;