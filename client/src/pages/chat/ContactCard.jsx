import React, { useState, useEffect, useRef } from "react";
import { 
  MagnifyingGlassIcon, 
  ChevronRightIcon, 
  XMarkIcon,
  DocumentDuplicateIcon,
  MapPinIcon,
  EllipsisVerticalIcon
} from "@heroicons/react/24/outline";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import chatService from "../../services/chatService";

const TABS = ["All Chats", "Mine", "Unread", "Active", "Resolved"];

const ContactCard = ({ chats, activeChatId, onChatSelect, activeTab, setActiveTab, onCreateChat }) => {
  const [searchTerm, setSearchTerm] = useState("");
  
  // State for the New Chat Modal
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
  const [newChatName, setNewChatName] = useState("");
  const [newChatPhone, setNewChatPhone] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  
  // State for delete confirmation modal
  const [chatToDelete, setChatToDelete] = useState(null);
  
  // State for chat options menu
  const [openMenuId, setOpenMenuId] = useState(null);
  const containerRef = useRef(null);

  // State for bulk selection
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedChats, setSelectedChats] = useState(new Set());
  
  // State for chat modifications (pin, mute, archive, delete)
  const [chatModifications, setChatModifications] = useState({
    pinned: {},
    muted: {},
    archived: {},
    deleted: new Set(),
    readChats: new Set()
  });
  
  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Don't close if clicking inside the menu or on menu buttons
      if (event.target.closest('[data-menu-button="true"]') || event.target.closest('[data-menu-content="true"]')) {
        return;
      }
      setOpenMenuId(null);
    };
    
    if (openMenuId) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [openMenuId]);

  // Handler functions for menu options
  const handleMuteChat = async (chatId, e) => {
    e.stopPropagation();
    console.log("✅ Mute clicked for chat:", chatId);
    
    const chat = chats.find(c => (c._id || c.id) === chatId);
    
    try {
      // Update UI state with correct previous state
      setChatModifications(prev => {
        const isCurrentlyMuted = prev.muted[chatId] !== undefined 
          ? prev.muted[chatId] 
          : chat?.isMuted;
          
        return {
          ...prev,
          muted: {
            ...prev.muted,
            [chatId]: !isCurrentlyMuted
          }
        };
      });
      
      setOpenMenuId(null);
      console.log("✅ Chat muted/unmuted successfully:", chatId);
      // API call
      await chatService.toggleMuteChat(chatId);
    } catch (error) {
      console.error("❌ Failed to mute chat:", error);
    }
  };

  const handleArchiveChat = async (chatId, e) => {
    e.stopPropagation();
    console.log("✅ Archive clicked for chat:", chatId);
    
    const chat = chats.find(c => (c._id || c.id) === chatId);
    
    try {
      // Update UI state with correct previous state
      setChatModifications(prev => {
        const isCurrentlyArchived = prev.archived[chatId] !== undefined 
          ? prev.archived[chatId] 
          : chat?.chatStatus === 'archived';
          
        return {
          ...prev,
          archived: {
            ...prev.archived,
            [chatId]: !isCurrentlyArchived
          }
        };
      });
      
      setOpenMenuId(null);
      console.log("✅ Chat archived/unarchived successfully:", chatId);
      // API call
      await chatService.toggleArchiveChat(chatId);
    } catch (error) {
      console.error("❌ Failed to archive chat:", error);
    }
  };

  const handleMarkAsRead = async (chatId, e) => {
    e.stopPropagation();
    console.log("✅ Mark as read clicked for chat:", chatId);
    
    try {
      // Update UI state
      setChatModifications(prev => {
        const newReadChats = new Set(prev.readChats);
        newReadChats.add(chatId);
        return {
          ...prev,
          readChats: newReadChats
        };
      });
      
      setOpenMenuId(null);
      console.log("✅ Chat marked as read successfully:", chatId);
      // API call
      await chatService.markMessagesAsRead(chatId);
    } catch (error) {
      console.error("❌ Failed to mark as read:", error);
    }
  };

  const handlePinChat = async (chatId, e) => {
    e.stopPropagation();
    console.log("✅ Pin clicked for chat:", chatId);
    
    const chat = chats.find(c => (c._id || c.id) === chatId);
    
    try {
      // Update UI state with correct previous state
      setChatModifications(prev => {
        const isCurrentlyPinned = prev.pinned[chatId] !== undefined 
          ? prev.pinned[chatId] 
          : chat?.isPinned;
          
        return {
          ...prev,
          pinned: {
            ...prev.pinned,
            [chatId]: !isCurrentlyPinned
          }
        };
      });
      
      setOpenMenuId(null);
      console.log("✅ Chat pinned/unpinned successfully:", chatId);
      // API call
      await chatService.toggleChatPin(chatId);
    } catch (error) {
      console.error("❌ Failed to pin chat:", error);
    }
  };

  const handleDeleteChat = async (chatId, e) => {
    e.stopPropagation();
    console.log("✅ Delete clicked for chat:", chatId);
    setOpenMenuId(null);
    setChatToDelete(chatId);
  };

  const confirmDeleteChat = async () => {
    if (!chatToDelete) return;
    
    try {
      // Update UI state to hide the chat
      setChatModifications(prev => {
        const newDeleted = new Set(prev.deleted);
        newDeleted.add(chatToDelete);
        return {
          ...prev,
          deleted: newDeleted
        };
      });
      
      console.log("✅ Chat deleted successfully:", chatToDelete);
      // API call
      await chatService.deleteChat(chatToDelete);
    } catch (error) {
      console.error("❌ Failed to delete chat:", error);
      // Revert deletion if API fails
      setChatModifications(prev => {
        const newDeleted = new Set(prev.deleted);
        newDeleted.delete(chatToDelete);
        return {
          ...prev,
          deleted: newDeleted
        };
      });
    } finally {
      setChatToDelete(null);
    }
  };
  
  const displayChats = (chats || [])
    .filter((c) => {
      const chatId = c._id || c.id;
      const matchesSearch = c.name?.toLowerCase().includes(searchTerm.toLowerCase());
      const isDeleted = chatModifications.deleted.has(chatId);
      
      const isCurrentlyArchived = chatModifications.archived[chatId] !== undefined 
        ? chatModifications.archived[chatId] 
        : (c.chatStatus === 'archived' || c.isArchived);
        
      return matchesSearch && !isDeleted && !isCurrentlyArchived;
    })
    .sort((a, b) => {
      const aId = a._id || a.id;
      const bId = b._id || b.id;
      
      // Check pinned state from modifications or original data
      const aIsPinned = chatModifications.pinned[aId] !== undefined 
        ? chatModifications.pinned[aId] 
        : a.isPinned;
      const bIsPinned = chatModifications.pinned[bId] !== undefined 
        ? chatModifications.pinned[bId] 
        : b.isPinned;
      
      if (aIsPinned && !bIsPinned) return -1;
      if (!aIsPinned && bIsPinned) return 1;
      return 0;
    });
  
  // Helper function to get chat's unread count considering modifications
  const getUnreadCount = (chat) => {
    const chatId = chat._id || chat.id;
    if (chatModifications.readChats.has(chatId)) {
      return 0;
    }
    return chat.unread || 0;
  };
  
  // Helper function to check if chat is pinned
  const isChatPinned = (chat) => {
    const chatId = chat._id || chat.id;
    return chatModifications.pinned[chatId] !== undefined 
      ? chatModifications.pinned[chatId] 
      : chat.isPinned;
  };
  
  // Helper function to check if chat is muted
  const isChatMuted = (chat) => {
    const chatId = chat._id || chat.id;
    return chatModifications.muted[chatId] !== undefined 
      ? chatModifications.muted[chatId] 
      : chat.isMuted;
  };

  const handleBulkMarkAsRead = async () => {
    if (selectedChats.size === 0) return;
    
    // Update UI state with read chats
    setChatModifications(prev => {
      const newReadChats = new Set(prev.readChats);
      selectedChats.forEach(id => newReadChats.add(id));
      return { ...prev, readChats: newReadChats };
    });
    
    const chatsToUpdate = Array.from(selectedChats);
    setIsSelectionMode(false);
    setSelectedChats(new Set());
    
    chatsToUpdate.forEach(async (chatId) => {
      try {
        await chatService.markMessagesAsRead(chatId);
      } catch (error) {
        console.error("❌ Failed to mark chat as read:", error);
      }
    });
  };

  const handleBulkDelete = () => {
    if (selectedChats.size === 0) return;
    if (window.confirm(`Are you sure you want to delete ${selectedChats.size} selected chats?`)) {
      // Optimistically delete from UI
      setChatModifications(prev => {
        const newDeleted = new Set(prev.deleted);
        selectedChats.forEach(id => newDeleted.add(id));
        return { ...prev, deleted: newDeleted };
      });
      
      const chatsToDelete = Array.from(selectedChats);
      setIsSelectionMode(false);
      setSelectedChats(new Set());
      
      chatsToDelete.forEach(async (chatId) => {
        try {
          await chatService.deleteChat(chatId);
        } catch (error) {
          console.error("❌ Failed to bulk delete chat:", error);
        }
      });
    }
  };

  const toggleSelection = (chatId, e) => {
    if (e) e.stopPropagation();
    setSelectedChats(prev => {
      const newSet = new Set(prev);
      if (newSet.has(chatId)) {
        newSet.delete(chatId);
      } else {
        newSet.add(chatId);
      }
      return newSet;
    });
  };

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
      <div className="h-16 flex items-center justify-between px-5 shrink-0 bg-white z-40 relative border-b border-slate-50">
         {isSelectionMode ? (
            <div className="flex items-center justify-between w-full">
               <div className="flex items-center gap-3">
                  <button 
                    onClick={() => { setIsSelectionMode(false); setSelectedChats(new Set()); }} 
                    className="p-1 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
                  >
                     <XMarkIcon className="w-5 h-5" />
                  </button>
                  <span className="font-bold text-slate-700 text-sm">
                     {selectedChats.size} selected
                  </span>
               </div>
               <div className="flex items-center gap-1">
                  <button 
                     onClick={handleBulkMarkAsRead}
                     className="p-1.5 text-slate-500 hover:text-[#22C55E] hover:bg-green-50 rounded-md transition-colors" 
                     title="Mark selected as read"
                     disabled={selectedChats.size === 0}
                  >
                     <CheckCircleIcon className="w-5 h-5" />
                  </button>
                  <button 
                     onClick={handleBulkDelete}
                     className="p-1.5 text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors" 
                     title="Delete selected"
                     disabled={selectedChats.size === 0}
                  >
                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
               </div>
            </div>
         ) : (
         <>
         <h2 className="text-xl font-extrabold text-slate-900">Chats</h2>
         
         <div className="flex items-center gap-2">
            {/* Filter Dropdown */}
            <div className="relative">
               <button 
                  onClick={() => setOpenMenuId(openMenuId === 'filter-menu' ? null : 'filter-menu')}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-md transition-colors"
                  title="Filter Chats"
                  data-menu-button="true"
               >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
                  </svg>
               </button>

               {/* Filter Dropdown Menu */}
               {openMenuId === 'filter-menu' && (
                  <div data-menu-content="true" className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 z-50 py-1">
                     <button
                        onClick={(e) => { e.stopPropagation(); setActiveTab("Unread"); setOpenMenuId(null); }}
                        className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2"
                     >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        Unread chats
                     </button>
                     <button
                        onClick={(e) => { e.stopPropagation(); setActiveTab("Active"); setOpenMenuId(null); }}
                        className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2"
                     >
                        <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Active chats
                     </button>
                     <div className="border-t border-slate-200 my-1"></div>
                     <button
                        onClick={(e) => { e.stopPropagation(); setActiveTab("All Chats"); setOpenMenuId(null); }}
                        className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2"
                     >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                        </svg>
                        Clear Filters
                     </button>
                  </div>
               )}
            </div>

            {/* NEW: Custom Chat-Plus Icon matching your screenshot exactly! */}
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
            
            {/* Options Menu Button (Three Dots) */}
            <div className="relative">
               <button 
                  onClick={() => setOpenMenuId(openMenuId === 'header-menu' ? null : 'header-menu')}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-md transition-colors"
                  title="More Options"
                  data-menu-button="true"
               >
                  <EllipsisVerticalIcon className="w-5 h-5" />
               </button>
               
               {/* Dropdown Menu */}
               {openMenuId === 'header-menu' && (
                  <div data-menu-content="true" className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 z-50 py-1">
                     <button
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          const ids = displayChats.map(c => c._id || c.id);
                          setChatModifications(prev => {
                            const newReadChats = new Set(prev.readChats);
                            ids.forEach(id => newReadChats.add(id));
                            return { ...prev, readChats: newReadChats };
                          });
                          ids.forEach(async (id) => {
                             try { await chatService.markMessagesAsRead(id); } catch(err) {}
                          });
                          setOpenMenuId(null); 
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2"
                     >
                        <CheckCircleIcon className="w-4 h-4" />
                        Mark all as read
                     </button>
                     <button
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          setOpenMenuId(null); 
                          setIsSelectionMode(true);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2"
                     >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                        Select chats
                     </button>
                     <div className="border-t border-slate-200 my-1"></div>
                     <button
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          setOpenMenuId(null); 
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2"
                     >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Settings
                     </button>
                  </div>
               )}
            </div>
         </div>
         </>
         )}
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

      {/* --- 🔴 DELETE CONFIRMATION MODAL 🔴 --- */}
      {chatToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-[400px] rounded-3xl shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col">
                <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
                    <h3 className="text-base font-bold text-slate-900">Delete Chat</h3>
                    <button onClick={() => setChatToDelete(null)} className="text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100 transition-colors -mr-1.5">
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>
                <div className="p-6">
                    <p className="text-sm text-slate-600">Are you sure you want to delete this conversation? This action cannot be undone and you will lose all the message history.</p>
                </div>
                <div className="flex items-center justify-end gap-3 px-6 py-4 bg-slate-50/50 border-t border-slate-100 shrink-0">
                    <button 
                        onClick={() => setChatToDelete(null)} 
                        className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors rounded-xl hover:bg-slate-100"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={confirmDeleteChat} 
                        className="px-6 py-2.5 text-sm font-bold text-white bg-red-600 rounded-xl hover:bg-red-700 flex items-center gap-2 shadow-sm transition-colors"
                    >
                        Delete
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
             onClick={() => {
               if (isSelectionMode) {
                 toggleSelection(chat._id || chat.id);
               } else {
                 onChatSelect(chat._id || chat.id);
               }
             }}
             className={`
               flex gap-3 px-5 py-4 cursor-pointer transition-all border-b border-slate-50 relative group
               ${activeChatId === (chat._id || chat.id) && !isSelectionMode
                 ? "bg-green-50 border-l-4 border-l-[#22C55E] shadow-sm" 
                 : "border-l-4 border-l-transparent hover:bg-slate-50"}
               ${isSelectionMode && selectedChats.has(chat._id || chat.id) ? "bg-slate-50" : ""}
             `}
           >
              {/* Avatar */}
              <div className="relative shrink-0 flex items-center">
                {isSelectionMode && (
                  <div className="mr-3" onClick={(e) => { e.stopPropagation(); toggleSelection(chat._id || chat.id, e); }}>
                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${selectedChats.has(chat._id || chat.id) ? 'bg-[#22C55E] border-[#22C55E]' : 'border-slate-300 bg-white'}`}>
                      {selectedChats.has(chat._id || chat.id) && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                    </div>
                  </div>
                )}
                <div className="relative">
                  <img src={chat.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(chat.name)}&background=random`} alt="" className="w-12 h-12 rounded-full object-cover" />
                  {chat.status === 'active' && (
                    <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-[#22C55E] border-2 border-white rounded-full"></span>
                  )}
                </div>
              </div>

              {/* Chat Info */}
              <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
                 <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2 max-w-full overflow-hidden">
                      <h4 className="text-sm font-bold text-slate-900 truncate">{chat.name}</h4>
                      {isChatPinned(chat) && (
                        <svg className="w-3.5 h-3.5 text-slate-400 shrink-0 rotate-45" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M16 11.232L16 6.5C16 5.119 14.881 4 13.5 4L10.5 4C9.119 4 8 5.119 8 6.5L8 11.232L6.113 15.006C5.556 16.12 6.368 17.5 7.618 17.5L11 17.5L11 21C11 21.552 11.448 22 12 22C12.552 22 13 21.552 13 21L13 17.5L16.382 17.5C17.632 17.5 18.444 16.12 17.887 15.006L16 11.232Z" />
                        </svg>
                      )}
                      {isChatMuted(chat) && (
                        <svg className="w-3.5 h-3.5 text-slate-400" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M13.5 4.06c0-1.336-1.616-2.256-2.73-1.72l-5.24 2.97A3 3 0 004 9.25v5.5a3 3 0 001.53 2.59l5.24 2.97c1.11.535 2.73-.384 2.73-1.72V4.06zM15.5 12c0-1.657.895-3.095 2.223-3.868l1.277 1.277a6 6 0 010 8.486l-1.277 1.277A3.996 3.996 0 0015.5 12z" />
                        </svg>
                      )}
                      {chat.source === 'whatsapp' && (
                        <span className="text-xs">
                          <svg className="w-3.5 h-3.5 fill-[#25D366]" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                          </svg>
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap">{chat.lastMsgTime || new Date(chat.updatedAt).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit', hour12: true})}</span>
                      
                      {/* Three Dot Menu Button */}
                      <div className="relative">
                        {!isSelectionMode && (
                        <button 
                          data-menu-button="true"
                          onClick={(e) => {
                            e.stopPropagation();
                            const chatId = chat._id || chat.id;
                            setOpenMenuId(openMenuId === chatId ? null : chatId);
                          }}
                          className="p-1 text-slate-400 hover:text-slate-600 rounded-md opacity-0 group-hover:opacity-100 transition-all hover:bg-slate-100"
                          title="Chat options"
                        >
                          <EllipsisVerticalIcon className="w-4 h-4" />
                        </button>
                        )}
                        
                        {/* Dropdown Menu */}
                        {openMenuId === (chat._id || chat.id) && (
                          <div data-menu-content="true" className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-slate-200 z-50 py-1">
                            <button
                              onClick={(e) => handlePinChat(chat._id || chat.id, e)}
                              className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2"
                            >
                              <MapPinIcon className="w-4 h-4" />
                              {isChatPinned(chat) ? "Unpin Chat" : "Pin Chat"}
                            </button>
                            <button
                              onClick={(e) => handleMarkAsRead(chat._id || chat.id, e)}
                              className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2"
                            >
                              <CheckCircleIcon className="w-4 h-4" />
                              Mark as Read
                            </button>
                            <button
                              onClick={(e) => handleMuteChat(chat._id || chat.id, e)}
                              className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1V4a1 1 0 011-1h5V2a1 1 0 011-1h2a1 1 0 011 1v1h5a1 1 0 011 1v10a1 1 0 01-1 1h-1.586l4.707 4.707a1 1 0 01-1.414 1.414L17 16.414V20a2 2 0 01-2 2h-2a2 2 0 01-2-2v-3.586l-4.707 4.707a1 1 0 01-1.414-1.414L5.586 15z" />
                              </svg>
                              {isChatMuted(chat) ? "Unmute Chat" : "Mute Chat"}
                            </button>
                            <button
                              onClick={(e) => handleArchiveChat(chat._id || chat.id, e)}
                              className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9-3h4" />
                              </svg>
                              Archive
                            </button>
                            <div className="border-t border-slate-200 my-1"></div>
                            <button
                              onClick={(e) => handleDeleteChat(chat._id || chat.id, e)}
                              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
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
                    {getUnreadCount(chat) > 0 && (
                        <span className="min-w-[1.25rem] h-5 px-1.5 bg-[#22C55E] text-white text-[10px] font-bold flex items-center justify-center rounded-full shadow-sm">
                            {getUnreadCount(chat)}
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