import { useState, useMemo, useEffect, useRef, useContext } from "react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import ContactCard from "./ContactCard";
import Conversion from "./Conversion";
import UserProfilePanel from "./UserProfilePanel";
import ActivityLog from "./ActivityLog";
import chatService from "../../services/chatService";
import LabelApi from "../../services/LabelApi";
import StatusApi from "../../services/StatusApi";
import QuickReplyApi from "../../services/QuickReplyApi";
import io from "socket.io-client";
import ErrorState from "../../components/ui/ErrorState";
import { ChatContext } from "../../context/ChatContext";
import { userContext } from "../../context/Context";

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  (import.meta.env.VITE_API_URL
    ? String(import.meta.env.VITE_API_URL).replace(/\/api\/?$/, '')
    : '');

const Chat = () => {
  const { fetchChats: refreshGlobalUnread } = useContext(ChatContext);
  const { user, rolePermissions } = useContext(userContext);

  const roleCapitalized = user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1).toLowerCase() : "";
  const myPerms = rolePermissions && roleCapitalized ? rolePermissions[roleCapitalized] : null;

  const canViewConversations = !myPerms || myPerms.view_conversations !== false;
  const canReply = !myPerms || myPerms.reply_messages !== false;
  const canDelete = !myPerms || myPerms.delete_conversations !== false;
  const canAssign = !myPerms || myPerms.assign_conversations !== false;

  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [activeTab, setActiveTab] = useState("All");
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sendError, setSendError] = useState(null);  // WhatsApp send error

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
    onConfirm: () => { },
    type: "danger"
  });

  // Ref to always have latest activeChatId inside socket callbacks
  const activeChatIdRef = useRef(null);
  const socketRef = useRef(null);
  const previousChatIdRef = useRef(null);
  useEffect(() => {
    activeChatIdRef.current = activeChatId;
  }, [activeChatId]);

  // ── Initial socket + data fetch (runs once) ──────────────────────────────
  const [chatPage, setChatPage] = useState(1);
  const [hasMoreChats, setHasMoreChats] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  useEffect(() => {
    socketRef.current = io(SOCKET_URL, { withCredentials: true });

    const fetchChats = async () => {
      try {
        setError(null);
        const result = await chatService.getChats(1, 50);
        if (result.success) {
          setChats(result.data);
          setHasMoreChats(result.pagination?.hasMore ?? false);
          setChatPage(1);
          if (result.data.length > 0) {
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
        setStatusOptions(statusData.map(s => ({
          id: s._id,
          label: s.name,
          dot: s.color ? `bg-[${s.color}]` : 'bg-slate-300',
          original: s
        })));
        const replies = await QuickReplyApi.getQuickReplies();
        setQuickReplies(replies);
      } catch (error) {
        console.error("Error fetching dynamic chat data:", error);
      }
    };

    fetchChats();
    fetchLabelsAndStatuses();

    // ── SOCKET: incoming message from contact ('them') ──────────────────
    socketRef.current.on("receive_message", (data) => {
      const incomingChatId = data.chatId?.toString();


      // Add to message list only if viewing that chat
      if (activeChatIdRef.current?.toString() === incomingChatId) {
        setMessages(prev => {
          const isDuplicate = prev.some(m => m._id?.toString() === data.message?._id?.toString());
          if (isDuplicate) return prev;
          return [...prev, data.message];
        });
      }

      // Update sidebar chat preview
      setChats(prevChats => {
        // PERMISSION CHECK: Don't add chat if user is not authorized
        if (user?.role !== 'ADMIN' && user?.role !== 'admin' && data.chat) {
          const c = data.chat;
          if (c.user !== user?.id && c.teamMember !== user?.id && c.teamMember !== user?.name && c.teamMember !== 'Unassigned') {
            return prevChats;
          }
        }

        const idx = prevChats.findIndex(c => c._id?.toString() === incomingChatId);
        if (idx === -1) {
          if (!data.chat) return prevChats;
          const exists = prevChats.some(c => c._id?.toString() === data.chat._id?.toString());
          if (exists) return prevChats;
          return [data.chat, ...prevChats];
        }
        const updated = [
          ...prevChats.slice(0, idx),
          {
            ...prevChats[idx],
            lastMsg: data.message?.text || '📎 Media',
            lastMsgTime: data.message?.time,
            lastActivity: new Date(),
            // Increment unread only if NOT viewing this chat
            unread: activeChatIdRef.current?.toString() === incomingChatId
              ? 0
              : (prevChats[idx].unread || 0) + 1
          },
          ...prevChats.slice(idx + 1)
        ];
        // Sync global unread count
        refreshGlobalUnread();
        return updated;
      });
    });

    // ── SOCKET: our sent message confirmed by server ────────────────────
    socketRef.current.on("message_sent", (data) => {
      const sentChatId = data.chatId?.toString();

      // Replace temp message with real one
      if (activeChatIdRef.current?.toString() === sentChatId) {
        setMessages(prev =>
          prev.map(msg => {
            // Replace either the matching temp ID or a matching real ID
            if (
              (msg._id?.toString().startsWith('temp_')) ||
              msg._id?.toString() === data.message?._id?.toString()
            ) {
              return { ...data.message, status: data.message.status || 'sent' };
            }
            return msg;
          })
        );
      }
    });

    // ── SOCKET: delivery / read status update ──────────────────────────
    socketRef.current.on("message_status_update", (data) => {
      if (data.status === 'failed' && data.error) {
        setSendError(data.errorCode ? `[${data.errorCode}] ${data.error}` : data.error);
        setTimeout(() => setSendError(null), 10000);
      }

      setMessages(prev =>
        prev.map(msg =>
          msg._id?.toString() === data.messageId?.toString() ||
            msg.whatsappMessageId === data.whatsappMessageId
            ? { ...msg, status: data.status, error: data.error || msg.error }
            : msg
        )
      );
    });

    // ── SOCKET: chat metadata updated ───────────────────────────────────
    socketRef.current.on("chat_updated", (updatedChat) => {
      setChats(prev => {
        // PERMISSION CHECK
        if (user?.role !== 'ADMIN' && user?.role !== 'admin' && updatedChat) {
          if (updatedChat.user !== user?.id && updatedChat.teamMember !== user?.id && updatedChat.teamMember !== user?.name && updatedChat.teamMember !== 'Unassigned') {
            return prev.filter(c => c._id?.toString() !== updatedChat._id?.toString());
          }
        }
        return prev.map(c =>
          c._id?.toString() === updatedChat._id?.toString() ? updatedChat : c
        )
      });
    });

    // ── SOCKET: brand-new chat created via WhatsApp webhook ────────────
    socketRef.current.on("chat_created", (newChat) => {
      setChats(prev => {
        // PERMISSION CHECK
        if (user?.role !== 'ADMIN' && user?.role !== 'admin' && newChat) {
          if (newChat.user !== user?.id && newChat.teamMember !== user?.id && newChat.teamMember !== user?.name && newChat.teamMember !== 'Unassigned') {
            return prev;
          }
        }
        const exists = prev.some(c => c._id?.toString() === newChat._id?.toString());
        if (exists) return prev;
        return [newChat, ...prev];
      });
    });

    return () => {
      if (!socketRef.current) return;
      socketRef.current.off("receive_message");
      socketRef.current.off("message_sent");
      socketRef.current.off("message_status_update");
      socketRef.current.off("chat_updated");
      socketRef.current.off("chat_created");
      socketRef.current.disconnect();
      socketRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!activeChatId || !socketRef.current) return;

    // Clear previous messages immediately so there's no visual lag
    setMessages([]);
    setMessagesLoading(true);

    const fetchMessages = async () => {
      try {
        if (previousChatIdRef.current) {
          socketRef.current.emit("leave_chat", previousChatIdRef.current);
        }

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
        socketRef.current.emit("join_chat", activeChatId);
        previousChatIdRef.current = activeChatId;

        // Update unread count in chat list
        setChats((prevChats) =>
          prevChats.map((chat) =>
            chat._id === activeChatId ? { ...chat, unread: 0 } : chat
          )
        );
        // Sync global unread count
        refreshGlobalUnread();
      } catch (err) {
        console.error("Error fetching messages:", err);
      } finally {
        setMessagesLoading(false);
      }
    };

    fetchMessages();
  }, [activeChatId]);

  // ── Load more chats (pagination) ─────────────────────────────────────────
  const loadMoreChats = async () => {
    if (isLoadingMore || !hasMoreChats) return;
    setIsLoadingMore(true);
    try {
      const nextPage = chatPage + 1;
      const result = await chatService.getChats(nextPage, 50);
      if (result.success) {
        setChats(prev => {
          const existingIds = new Set(prev.map(c => c._id));
          const newChats = result.data.filter(c => !existingIds.has(c._id));
          return [...prev, ...newChats];
        });
        setHasMoreChats(result.pagination?.hasMore ?? false);
        setChatPage(nextPage);
      }
    } catch (err) {
      console.error("Error loading more chats:", err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const activeChat = chats.find((c) => c._id === activeChatId);

  const filteredChats = useMemo(() => {
    switch (activeTab) {
      case "Mine": return chats.filter((c) => c.teamMember === user?.id || c.teamMember === user?._id || c.teamMember === user?.name);
      case "Open": return chats.filter((c) => c.chatStatus === "open");
      case "Closed": return chats.filter((c) => c.chatStatus === "closed");
      case "WhatsApp": return chats.filter((c) => c.source === "whatsapp");
      default: return chats;
    }
  }, [chats, activeTab]);

  const handleSendMessage = async (text, media = null) => {
    if (!text?.trim() && !media) return;



    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase();
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
            ? { ...c, lastMsg: media ? `📸 ${media.type || 'Media'}` : text, lastMsgTime: time, lastActivity: new Date() }
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

        setSendError(null); // clear any previous error
        // Replace temporary message with actual message from server
        setMessages((prev) =>
          prev.map(msg => {
            if (msg._id === tempId) {

              return { ...result.data, status: result.data.status || 'sent' };
            }
            return msg;
          })
        );

        // Emit via socket for real-time updates to other clients

        socketRef.current?.emit("send_message", {
          chatId: activeChatId,
          message: result.data
        });
      } else {
        console.error('❌ Failed to send message:', result.error, 'Code:', result.errorCode);
        // Show WhatsApp error to user (include error code if available)
        const errMsg = result.error || 'Failed to send message via WhatsApp';
        const displayErr = result.errorCode ? `[${result.errorCode}] ${errMsg}` : errMsg;
        setSendError(displayErr);
        setTimeout(() => setSendError(null), 10000); // auto-dismiss after 10s
        // Replace temp message with the DB-saved failed message (or mark as failed)
        setMessages((prev) =>
          prev.map(msg =>
            msg._id === tempId
              ? result.data
                ? { ...result.data, status: 'failed', error: errMsg }
                : { ...msg, status: 'failed', error: errMsg }
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

  const handleSendTemplate = async (template) => {
    if (!activeChatId || !template?.name) return;

    const getBodyParamCount = (selectedTemplate) => {
      const bodyComponent = Array.isArray(selectedTemplate?.components)
        ? selectedTemplate.components.find((component) => String(component?.type || '').toUpperCase() === 'BODY')
        : null;
      const bodyText = bodyComponent?.text || '';
      const placeholders = bodyText.match(/{{\d+}}/g) || [];
      return new Set(placeholders).size;
    };

    const bodyParamCount = getBodyParamCount(template);
    const fallbackParamText = activeChat?.name || 'there';
    
    const components = [];

    // 1. Handle Header Component (Media)
    // Normalize header type to handle both 'Image' and 'IMAGE' from API
    const normalizedHeaderType = String(template.headerType || '').toUpperCase();
    // Use public URL for sending; fall back to preview URL if needed
    const mediaUrlForSend = template.headerMediaUrl || template.headerMediaUrlPreview;

    if (['IMAGE', 'VIDEO', 'DOCUMENT'].includes(normalizedHeaderType) && mediaUrlForSend) {
      let headerParamType = 'image';
      if (normalizedHeaderType === 'VIDEO') headerParamType = 'video';
      else if (normalizedHeaderType === 'DOCUMENT') headerParamType = 'document';

      components.push({
        type: 'header',
        parameters: [
          {
            type: headerParamType,
            [headerParamType]: {
              link: mediaUrlForSend
            }
          }
        ]
      });
    }

    // 2. Handle Body Component (Variables)
    if (bodyParamCount > 0) {
      components.push({
        type: 'body',
        parameters: Array.from({ length: bodyParamCount }, () => ({
          type: 'text',
          text: fallbackParamText
        }))
      });
    }

    try {
      const result = await chatService.sendTemplateMessage(
        activeChatId,
        template.name,
        template.language || 'en_US',
        components
      );

      if (result.success) {
        setSendError(null);
        setMessages((prev) => {
          const msgId = result?.data?._id?.toString();
          const alreadyExists = msgId && prev.some((msg) => msg._id?.toString() === msgId);
          if (alreadyExists) return prev;
          return [...prev, { ...result.data, status: result.data.status || 'sent' }];
        });
        socketRef.current?.emit('send_message', {
          chatId: activeChatId,
          message: result.data
        });
      } else {
        const errMsg = result.error || `Failed to send template ${template.name}`;
        const displayErr = result.errorCode ? `[${result.errorCode}] ${errMsg}` : errMsg;
        setSendError(displayErr);
        setTimeout(() => setSendError(null), 10000);
      }
    } catch (error) {
      const errMsg = error?.message || `Failed to send template ${template.name}`;
      setSendError(errMsg);
      setTimeout(() => setSendError(null), 10000);
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
        setIsConfirmModalOpen(false);
        
        // Optimistic UI Update
        setMessages([]);
        setChats(prev => prev.map(c => (c._id || c.id) === activeChatId ? { ...c, lastMsg: "Chat history cleared" } : c));

        try {
          const result = await chatService.clearChatHistory(activeChatId);
          if (!result.success) {
            console.error("Failed to clear chat on server:", result.error);
          }
        } catch (err) {
          console.error("Error clearing chat:", err);
        }
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

  const handleUpdateStatus = async (chatId, status) => {
    if (!chatId) return;

    // Optimistic UI update
    setChats(prev => prev.map(c => {
      if ((c._id || c.id) === chatId) {
        return {
          ...c,
          chatStatus: status,
          isBlocked: status === 'blocked',
          blocked: status === 'blocked',
          contactStatus: status === 'blocked' ? 'blocked' : (String(c.contactStatus || '').toLowerCase() === 'blocked' ? status : c.contactStatus)
        };
      }
      return c;
    }));

    try {
      const result = await chatService.updateChatStatus(chatId, status);
      if (!result.success) {
        console.error("Failed to update status on server:", result.error);
      }
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  const handleAssignAgent = async (chatId, agentId) => {
    if (!chatId || !agentId) return;

    // Optimistic UI update
    setChats(prev => prev.map(c => {
      if ((c._id || c.id) === chatId) {
        return {
          ...c,
          teamMember: agentId
        };
      }
      return c;
    }));

    try {
      const result = await chatService.assignChat(chatId, agentId);
      if (result.success && result.data) {
         setChats(prev => prev.map(c => ((c._id || c.id) === chatId ? result.data : c)));
      } else if (!result.success) {
        console.error("Failed to assign agent on server:", result.error);
      }
    } catch (err) {
      console.error("Error assigning agent:", err);
    }
  };

  const handleUpdateLabels = async (labels, targetChatId = activeChatId) => {
    if (!targetChatId) return;
    try {
      const result = await chatService.updateChatLabels(targetChatId, labels);
      if (result.success) {
        setChats(prev => prev.map(c => c._id === targetChatId ? { ...c, labels: labels } : c));
      }
    } catch (err) {
      console.error("Error updating labels:", err);
    }
  };

  const handleTogglePin = async (targetChatId = activeChatId) => {
    if (!targetChatId) return;
    try {
      const result = await chatService.toggleChatPin(targetChatId);
      if (result.success) {
        setChats(prev => prev.map(c => c._id === targetChatId ? { ...c, isPinned: !c.isPinned } : c));
      }
    } catch (err) {
      console.error("Error toggling pin status:", err);
    }
  };

  const handleUpdateProfile = async (chatId, profileData) => {
    try {
      const result = await chatService.updateChatProfile(chatId, profileData);
      if (result.success) {
        setChats(prev => prev.map(c => c._id === chatId ? result.data : c));
      }
    } catch (err) {
      console.error("Error updating profile:", err);
    }
  };

  if (error && !loading) return <ErrorState onRetry={() => window.location.reload()} message={error} />;

  if (showActivityLog) {
    return <ActivityLog data={activeChat} onBack={() => setShowActivityLog(false)} />;
  }

  // Access gate — shown when view_conversations is toggled off
  if (!canViewConversations) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-[#F8FAFC] p-4 font-['Urbanist']">
        <div className="max-w-md w-full bg-white rounded-3xl p-10 shadow-[0_20px_50px_rgba(0,0,0,0.05)] text-center space-y-6 border border-slate-100">
          <div className="w-20 h-20 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-2">
            <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 15v2m0 0v2m0-2h2m-2 0H10m2-6V7m0 0a4 4 0 100-8 4 4 0 000 8zm0 0v2"/>
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}/>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Access Restricted</h2>
          <p className="text-slate-500 text-sm leading-relaxed">
            You don't have permission to view conversations.<br/>
            Please contact your administrator.
          </p>
          <button
            onClick={() => window.history.back()}
            className="w-full py-4 bg-[#1e293b] hover:bg-[#0f172a] text-white font-bold rounded-2xl transition-all shadow-lg shadow-slate-200 cursor-pointer"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full h-full bg-white font-sans overflow-hidden">
      <style>{` .custom-scrollbar::-webkit-scrollbar { width: 5px; } .custom-scrollbar::-webkit-scrollbar-track { background: transparent; } .custom-scrollbar::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 10px; } .hide-scrollbar::-webkit-scrollbar { display: none; } `}</style>

      {/* LEFT: CONTACT LIST */}
      <div className="w-[330px] md:w-[350px] lg:w-[380px] flex flex-col border-r border-slate-100 h-full bg-white shrink-0">
        {loading ? (
          <div className="flex flex-col h-full">
            {/* Skeleton header */}
            <div className="h-16 px-5 flex items-center justify-between border-b border-slate-50 shrink-0">
              <div className="h-5 w-24 bg-slate-100 rounded animate-pulse" />
              <div className="flex gap-2">
                <div className="h-8 w-8 bg-slate-100 rounded-full animate-pulse" />
                <div className="h-8 w-8 bg-slate-100 rounded-full animate-pulse" />
              </div>
            </div>
            {/* Skeleton search */}
            <div className="px-5 py-3 shrink-0">
              <div className="h-9 bg-slate-100 rounded-xl animate-pulse" />
            </div>
            {/* Skeleton chat items */}
            <div className="flex-1 overflow-hidden">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3 border-b border-slate-50">
                  <div className="w-12 h-12 rounded-full bg-slate-100 animate-pulse shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="flex justify-between">
                      <div className="h-3.5 w-28 bg-slate-100 rounded animate-pulse" style={{ animationDelay: `${i * 60}ms` }} />
                      <div className="h-3 w-10 bg-slate-100 rounded animate-pulse" />
                    </div>
                    <div className="h-3 w-40 bg-slate-100 rounded animate-pulse" style={{ animationDelay: `${i * 80}ms` }} />
                  </div>
                </div>
              ))}
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
            onUpdateStatus={handleUpdateStatus}
            onTogglePin={(chatId) => handleTogglePin(chatId)}
            onUpdateLabels={(chatId, labels) => handleUpdateLabels(labels, chatId)}
            onLoadMore={loadMoreChats}
            hasMoreChats={hasMoreChats}
            isLoadingMore={isLoadingMore}
            statusOptions={statusOptions}
            canAssign={canAssign}
            canDelete={canDelete}
          />
        )}
      </div>

      {/* MIDDLE: CONVERSATION AREA */}
      <div className="flex-1 flex flex-col h-full bg-white relative min-w-0">
        {/* WhatsApp Send Error Banner */}
        {sendError && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 text-sm font-medium px-5 py-3 rounded-2xl shadow-lg max-w-[90%] animate-in fade-in slide-in-from-top-2 duration-300">
            <svg className="w-5 h-5 shrink-0 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
            <span>WhatsApp failed: {sendError}</span>
            <button onClick={() => setSendError(null)} className="ml-2 text-red-400 hover:text-red-600 font-bold text-lg leading-none">&times;</button>
          </div>
        )}
        {activeChat ? (
          <div className="flex h-full w-full relative">
            <div className="flex-1 h-full min-w-0 flex flex-col border-r border-slate-100 relative">

              <Conversion
                data={{ ...activeChat, messages: messages }}
                onSendMessage={canReply ? handleSendMessage : null}
                onSendTemplate={canReply ? handleSendTemplate : null}
                onBack={() => setActiveChatId(null)}
                onToggleProfile={() => setShowProfile(!showProfile)}
                onClearChat={canDelete ? handleClearChat : null}
                onDeleteChat={canDelete ? handleDeleteChat : null}
                onUpdateStatus={handleUpdateStatus}
                onUpdateLabels={handleUpdateLabels}
                onTogglePin={handleTogglePin}
                onViewHistory={() => setShowActivityLog(true)}
                availableLabels={availableLabels}
                statusOptions={statusOptions}
                quickReplies={quickReplies}
                canReply={canReply}
                canDelete={canDelete}
                canAssign={canAssign}
                onAssignAgent={handleAssignAgent}
              />
            </div>

            {/* RIGHT: PROFILE PANEL */}
            {showProfile && (
              <>
                {/* Mobile Backdrop */}
                <div 
                  className="xl:hidden fixed inset-0 z-40 bg-slate-900/10 backdrop-blur-[2px]" 
                  onClick={() => setShowProfile(false)} 
                />
                <div className="absolute right-0 top-0 z-50 w-[85%] max-w-[340px] bg-white h-full shadow-2xl xl:relative xl:shadow-none xl:block xl:w-[320px] lg:xl:w-[340px] shrink-0 border-l border-slate-100 animate-in slide-in-from-right duration-300">
                  <UserProfilePanel
                    data={activeChat}
                    onClose={() => setShowProfile(false)}
                    onViewHistory={() => setShowActivityLog(true)}
                    availableLabels={availableLabels}
                    statusOptions={statusOptions}
                    onUpdateProfile={handleUpdateProfile}
                    onUpdateLabels={handleUpdateLabels}
                  />
                </div>
              </>
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