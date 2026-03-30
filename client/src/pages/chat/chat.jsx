import React, { useState, useMemo, useEffect } from "react";
import { ExclamationTriangleIcon, TrashIcon, XMarkIcon } from "@heroicons/react/24/outline";
import ContactCard from "./ContactCard";
import Conversion from "./Conversion";
import UserProfilePanel from "./UserProfilePanel";
import ActivityLog from "./ActivityLog"; 
import axios from "../../context/axios";
import chatService from "../../services/chatService";
import LabelApi from "../../services/LabelApi";
import StatusApi from "../../services/StatusApi";
import QuickReplyApi from "../../services/QuickReplyApi";
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

  // ✅ Dynamic Data for Labels, Statuses, and Quick Replies
  const [availableLabels, setAvailableLabels] = useState([]);
  const [statusOptions, setStatusOptions] = useState([]);
  const [quickReplies, setQuickReplies] = useState([]);

  // ✅ State to track if we are viewing the Activity Log instead of Chat
  const [showActivityLog, setShowActivityLog] = useState(false);

  // ✅ Confirmation Modal States
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState({
    title: "",
    message: "",
    confirmText: "",
    onConfirm: () => {},
    type: "danger" // 'danger' or 'warning'
  });

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

    const fetchLabelsAndStatuses = async () => {
      try {
        const labelsData = await LabelApi.getAllLabels();
        setAvailableLabels(labelsData);
        
        const statusData = await StatusApi.getAllStatuses();
        const formattedStatuses = statusData.map(s => ({
          id: s._id,
          label: s.name,
          dot: s.color ? `bg-[${s.color}]` : 'bg-slate-300',
          original: s
        }));
        setStatusOptions(formattedStatuses);

        // Fetch Quick Replies
        const replies = await QuickReplyApi.getQuickReplies();
        setQuickReplies(replies);
      } catch (error) {
        console.error("Error fetching dynamic chat data:", error);
      }
    };

    fetchChats();
    fetchLabelsAndStatuses();

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
      console.log('✅ Message sent confirmation:', data);
      console.log('   Chat ID:', data.chatId);
      console.log('   Message ID:', data.message?._id);
      console.log('   Active Chat ID:', activeChatId);
      
      // Update message status
      setMessages((prev) => {
        console.log('   Current messages count:', prev.length);
        const updated = prev.map(msg => {
          if (msg._id === data.message._id || msg._id.startsWith('temp_')) {
            console.log('   ✓ Updating message:', msg._id, '->', data.message._id);
            return { ...data.message, status: 'sent' };
          }
          return msg;
        });
        console.log('   Updated messages count:', updated.length);
        return updated;
      });
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
    
    console.log('📤 handleSendMessage called:', { 
      text: text?.substring(0, 50), 
      hasMedia: !!media, 
      activeChatId 
    });
    
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
      console.log('➕ Adding temporary message to UI:', tempId);
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
      console.log('🌐 Sending to backend...');
      let result;
      if (media) {
        // Determine media type from media object
        const mediaType = media.type || 'image';
        console.log('📎 Sending media message, type:', mediaType);
        result = await chatService.sendMediaMessage(activeChatId, text, media, mediaType);
      } else {
        console.log('💬 Sending text message');
        result = await chatService.sendMessage(activeChatId, text);
      }

      console.log('📬 Backend response:', result);

      if (result.success) {
        console.log('✅ Message sent successfully:', result.data._id);
        // Replace temporary message with actual message from server
        setMessages((prev) => 
          prev.map(msg => {
            if (msg._id === tempId) {
              console.log('🔄 Replacing temp message with real message');
              return { ...result.data, status: result.data.status || 'sent' };
            }
            return msg;
          })
        );

        // Emit via socket for real-time updates to other clients
        console.log('📡 Emitting socket event...');
        socket.emit("send_message", { 
          chatId: activeChatId, 
          message: result.data 
        });
      } else {
        console.error('❌ Failed to send message:', result.error);
        // Mark message as failed
        setMessages((prev) => 
          prev.map(msg => 
            msg._id === tempId 
              ? { ...msg, status: 'failed', error: result.error } 
              : msg
          )
        );
      }

    } catch (error) {
      console.error('💥 Error in handleSendMessage:', error);
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

  const handleClearChat = () => {
    if (!activeChatId) return;
    
    setConfirmConfig({
      title: "Clear Chat History",
      message: "Are you sure you want to clear this chat history? This action will remove all messages from your view and cannot be undone.",
      confirmText: "Clear History",
      type: "danger",
      onConfirm: async () => {
        try {
          const result = await chatService.clearChatHistory(activeChatId);
          if (result.success) {
            setMessages([]);
            setChats(prev => prev.map(c => c._id === activeChatId ? { ...c, lastMsg: "Chat history cleared" } : c));
          } else {
            console.error("Failed to clear chat:", result.error);
          }
        } catch (err) {
          console.error("Error clearing chat:", err);
        }
        setIsConfirmModalOpen(false);
      }
    });
    setIsConfirmModalOpen(true);
  };

  const handleDeleteChat = () => {
    if (!activeChatId) return;
    
    setConfirmConfig({
      title: "Delete Contact",
      message: "Are you sure you want to delete this contact and all its messages? This action is permanent and cannot be reversed.",
      confirmText: "Delete Contact",
      type: "danger",
      onConfirm: async () => {
        try {
          const result = await chatService.deleteChat(activeChatId);
          if (result.success) {
            const deletedId = activeChatId;
            setActiveChatId(null);
            setChats(prev => prev.filter(c => c._id !== deletedId));
          } else {
            console.error("Failed to delete chat:", result.error);
          }
        } catch (err) {
          console.error("Error deleting chat:", err);
        }
        setIsConfirmModalOpen(false);
      }
    });
    setIsConfirmModalOpen(true);
  };

  const handleUpdateStatus = async (status) => {
    if (!activeChatId) return;
    try {
      const result = await chatService.updateChatStatus(activeChatId, status);
      if (result.success) {
        setChats(prev => prev.map(c => c._id === activeChatId ? { ...c, chatStatus: status } : c));
      }
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  const handleUpdateLabels = async (labels) => {
    if (!activeChatId) return;
    try {
      const result = await chatService.updateChatLabels(activeChatId, labels);
      if (result.success) {
        setChats(prev => prev.map(c => c._id === activeChatId ? { ...c, labels: labels } : c));
      }
    } catch (err) {
      console.error("Error updating labels:", err);
    }
  };

  const handleTogglePin = async () => {
    if (!activeChatId) return;
    try {
      const result = await chatService.toggleChatPin(activeChatId);
      if (result.success) {
        setChats(prev => prev.map(c => c._id === activeChatId ? { ...c, isPinned: !c.isPinned } : c));
      }
    } catch (err) {
      console.error("Error toggling pin status:", err);
    }
  };

  if (error && !loading) return <ErrorState onRetry={() => window.location.reload()} message={error} />;

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
                  onClearChat={handleClearChat}
                  onDeleteChat={handleDeleteChat}
                  onUpdateStatus={handleUpdateStatus}
                  onUpdateLabels={handleUpdateLabels}
                  onTogglePin={handleTogglePin}
                  onViewHistory={() => setShowActivityLog(true)} 
                  availableLabels={availableLabels}
                  statusOptions={statusOptions}
                  quickReplies={quickReplies}
                />
             </div>
             
             {/* RIGHT: PROFILE PANEL */}
             {showProfile && (
                <div className="w-[320px] lg:w-[340px] bg-white h-full shrink-0 hidden xl:block">
                   <UserProfilePanel 
                     data={activeChat} 
                     onClose={() => setShowProfile(false)} 
                     onViewHistory={() => setShowActivityLog(true)} 
                     availableLabels={availableLabels}
                     statusOptions={statusOptions}
                   />
                </div>
             )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 bg-slate-50/50"><p className="font-semibold text-slate-500">Select a conversation</p></div>
        )}
      </div>

      {/* CUSTOM CONFIRMATION MODAL */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsConfirmModalOpen(false)}></div>
          <div className="bg-white w-full max-w-[400px] rounded-3xl shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="flex items-center justify-center w-14 h-14 bg-red-50 rounded-2xl mb-5 mx-auto">
                <ExclamationTriangleIcon className="w-8 h-8 text-red-500" />
              </div>
              
              <div className="text-center mb-8">
                <h3 className="text-xl font-bold text-slate-900 mb-2">{confirmConfig.title}</h3>
                <p className="text-sm font-medium text-slate-500 leading-relaxed px-2">
                  {confirmConfig.message}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => setIsConfirmModalOpen(false)}
                  className="px-6 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 rounded-2xl transition-colors border border-slate-100"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmConfig.onConfirm}
                  className="px-6 py-3 text-sm font-bold text-white bg-red-500 hover:bg-red-600 rounded-2xl transition-all shadow-lg shadow-red-100 active:scale-[0.98]"
                >
                  {confirmConfig.confirmText}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;