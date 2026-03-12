import React, { useState, useMemo, useEffect } from "react";
import ContactCard from "./ContactCard";
import Conversion from "./Conversion";
import UserProfilePanel from "./UserProfilePanel";
import ActivityLog from "./ActivityLog"; 
import axios from "../../context/axios";
import chatService from "../../services/chatService";
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
        const result = await chatService.getChats();
        
        if (result.success) {
          setChats(result.data);
          if (result.data.length > 0 && !activeChatId) {
            setActiveChatId(result.data[0]._id);
          }
        } else {
          setError(result.error);
        }
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching chats:", err);
        setError(err.response?.data?.message || "Failed to load chats. Please try again.");
        setLoading(false);
      }
    };

    fetchChats();

    // Listen for incoming messages
    socket.on("receive_message", (data) => {
      console.log('Received message:', data);
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

      // Update chat list - move to top only if it's not the active chat
      setChats((prevChats) => {
        const chatIndex = prevChats.findIndex(chat => chat._id === data.chatId);
        if (chatIndex === -1) return prevChats;
        
        const updatedChat = {
          ...prevChats[chatIndex],
          lastMsg: data.message.media ? `📸 ${data.message.mediaType}` : data.message.text,
          lastMsgTime: data.message.time,
          unread: data.chatId === activeChatId ? prevChats[chatIndex].unread : (prevChats[chatIndex].unread || 0) + 1
        };
        
        // If it's the active chat, keep it in the same position
        if (data.chatId === activeChatId) {
          const newChats = [...prevChats];
          newChats[chatIndex] = updatedChat;
          return newChats;
        }
        
        // If it's not the active chat, move it to the top
        const newChats = prevChats.filter(chat => chat._id !== data.chatId);
        return [updatedChat, ...newChats];
      });
    });

    // Listen for sent messages
    socket.on("message_sent", (data) => {
      console.log('Message sent confirmation:', data);
      // Update message status
      setMessages((prev) => 
        prev.map(msg => 
          msg._id === data.message._id || msg._id.startsWith('temp_') 
            ? { ...data.message, status: 'sent' } 
            : msg
        )
      );
    });

    // Listen for message status updates
    socket.on("message_status_update", (data) => {
      console.log('Message status update:', data);
      setMessages((prev) => 
        prev.map(msg => 
          msg._id === data.messageId || msg.whatsappMessageId === data.whatsappMessageId
            ? { ...msg, status: data.status } 
            : msg
        )
      );
    });

    // Listen for chat updates
    socket.on("chat_updated", (updatedChat) => {
      console.log('Chat updated:', updatedChat);
      setChats((prevChats) => 
        prevChats.map((chat) => 
          chat._id === updatedChat._id ? updatedChat : chat
        )
      );
    });

    // Listen for new chats created
    socket.on("chat_created", (newChat) => {
      console.log('New chat created:', newChat);
      setChats((prevChats) => [newChat, ...prevChats]);
    });

    return () => socket.disconnect();
  }, [activeChatId]);

  useEffect(() => {
    if (!activeChatId) return;

    const fetchMessages = async () => {
      try {
        const result = await chatService.getMessages(activeChatId);
        
        if (result.success) {
          setMessages(result.data);
        } else {
          console.error('Failed to fetch messages:', result.error);
          setMessages([]);
        }
        
        // Mark messages as read
        await chatService.markMessagesAsRead(activeChatId);
        
        // Join socket room for this chat
        socket.emit("join_chat", activeChatId);
        
        // Update unread count in chat list
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
    if (!text?.trim() && !media) return;
    
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const tempId = 'temp_' + Date.now();
    
    // Create temporary message for immediate UI update
    const tempMessage = {
      _id: tempId,
      chatId: activeChatId,
      text: text || '',
      media: media,
      sender: "me",
      time: time,
      status: 'pending',
      createdAt: new Date()
    };

    try {
      // Add temporary message to UI
      setMessages((prev) => [...prev, tempMessage]);

      // Update chat list optimistically - keep active chat in same position
      setChats((prev) => {
        return prev.map(c => 
          c._id === activeChatId 
            ? { ...c, lastMsg: media ? `📸 ${media.type || 'Media'}` : text, lastMsgTime: time } 
            : c
        );
      });

      // Send to backend
      let result;
      if (media) {
        // Determine media type from media object
        const mediaType = media.type || 'image';
        result = await chatService.sendMediaMessage(activeChatId, text, media, mediaType);
      } else {
        result = await chatService.sendMessage(activeChatId, text);
      }

      if (result.success) {
        // Replace temporary message with actual message from server
        setMessages((prev) => 
          prev.map(msg => 
            msg._id === tempId 
              ? { ...result.data, status: result.data.status || 'sent' } 
              : msg
          )
        );

        // Emit via socket for real-time updates to other clients
        socket.emit("send_message", { 
          chatId: activeChatId, 
          message: result.data 
        });
      } else {
        // Mark message as failed
        setMessages((prev) => 
          prev.map(msg => 
            msg._id === tempId 
              ? { ...msg, status: 'failed', error: result.error } 
              : msg
          )
        );
        console.error('Failed to send message:', result.error);
      }

    } catch (error) {
      console.error('Error in handleSendMessage:', error);
      // Mark message as failed
      setMessages((prev) => 
        prev.map(msg => 
          msg._id === tempId 
            ? { ...msg, status: 'failed' } 
            : msg
        )
      );
    }
  };

  const handleCreateChat = async (name, phone) => {
    try {
      setLoading(true);
      const result = await chatService.createChat(name, phone, 'whatsapp');
      
      if (result.success) {
        // Add to chat list if not already there
        setChats((prevChats) => {
          const exists = prevChats.find(c => c._id === result.data._id);
          if (exists) {
            return prevChats;
          }
          return [result.data, ...prevChats];
        });
        
        // Select the new chat
        setActiveChatId(result.data._id);
        setShowProfile(false);
        setLoading(false);
        
        return { success: true, data: result.data };
      } else {
        setLoading(false);
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Error creating chat:', error);
      setLoading(false);
      return { success: false, error: error.message };
    }
  };

  if (error && !loading) return <ErrorState onRetry={() => window.location.reload()} message={error} />;

  // ✅ IF showActivityLog is true, completely swap out the UI with the Activity Log
  if (showActivityLog) {
    return <ActivityLog onBack={() => setShowActivityLog(false)} />;
  }

  return (
    <div className="flex w-full h-full bg-white font-sans overflow-hidden">
      <style>{` .custom-scrollbar::-webkit-scrollbar { width: 5px; } .custom-scrollbar::-webkit-scrollbar-track { background: transparent; } .custom-scrollbar::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 10px; } .hide-scrollbar::-webkit-scrollbar { display: none; } `}</style>
      
      {/* LEFT: CONTACT LIST */}
      <div className={`w-full md:w-[350px] lg:w-[380px] flex flex-col border-r border-slate-100 h-full bg-white shrink-0 ${activeChatId ? 'hidden md:flex' : 'flex'}`}>
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <svg className="animate-spin h-10 w-10 text-[#22C55E] mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="text-slate-500 font-medium">Loading chats...</p>
            </div>
          </div>
        ) : (
          <ContactCard 
            chats={filteredChats} 
            activeChatId={activeChatId} 
            onChatSelect={(id) => { setActiveChatId(id); setShowProfile(false); }} 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
            onCreateChat={handleCreateChat} 
          />
        )}
      </div>
      
      {/* MIDDLE: CONVERSATION AREA */}
      <div className={`flex-1 flex flex-col h-full bg-white relative min-w-0 ${!activeChatId ? 'hidden md:flex' : 'flex'}`}>
        {activeChat ? (
          <div className="flex h-full w-full relative">
             <div className="flex-1 h-full min-w-0 flex flex-col border-r border-slate-100">
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
          <div className="flex flex-col items-center justify-center h-full text-slate-400 bg-slate-50/50"><p className="font-semibold text-slate-500">Select a conversation</p></div>
        )}
      </div>
    </div>
  );
};

export default Chat;