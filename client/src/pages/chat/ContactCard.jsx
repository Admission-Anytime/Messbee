import React, { useState, useEffect } from "react";
import {
  MagnifyingGlassIcon,
  ChevronRightIcon,
  XMarkIcon,
  MapPinIcon,
  EllipsisVerticalIcon
} from "@heroicons/react/24/outline";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import chatService from "../../services/chatService";
import { getPresenceInfo } from "../../utils/presence";

const TABS = ["All Chats", "Mine", "Unread", "Active", "Resolved"];
const CREATED_AT_FILTERS = [
  { value: "all", label: "All time" },
  { value: "today", label: "Today" },
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" }
];
const LAST_SEEN_FILTERS = [
  { value: "all", label: "Any time" },
  { value: "online", label: "Online now" },
  { value: "24h", label: "Last 24 hours" },
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" }
];

const ContactCard = ({ chats, activeChatId, onChatSelect, activeTab, setActiveTab, onCreateChat, onUpdateStatus, onTogglePin, onUpdateLabels }) => {
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
  const [isAdvancedFilterOpen, setIsAdvancedFilterOpen] = useState(false);
  const [presenceNow, setPresenceNow] = useState(Date.now());

  const [quickFilters, setQuickFilters] = useState({
    unreadChats: false,
    openSessionChats: false,
    pinnedChats: false,
    mutedChats: false,
    unassignedChats: false,
    whatsappSource: false,
    archivedChats: false,
    blockedChats: false
  });

  const [advancedFilters, setAdvancedFilters] = useState({
    status: new Set(),
    labels: new Set(),
    teamMembers: new Set(),
    contactSource: new Set(),
    createdAt: "all",
    lastSeen: "all"
  });

  // State for bulk selection
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedChats, setSelectedChats] = useState(new Set());
  const [bulkActionModal, setBulkActionModal] = useState({
    isOpen: false,
    type: null
  });
  const [bulkActionForm, setBulkActionForm] = useState({
    status: "",
    labels: "",
    customFieldKey: "",
    customFieldValue: "",
    teamMember: "",
    campaignName: "",
    campaignMode: "now",
    campaignScheduleAt: ""
  });
  const [appNotice, setAppNotice] = useState({
    isOpen: false,
    type: "info",
    message: ""
  });

  // State for chat modifications (pin, mute, archive, delete)
  const [chatModifications, setChatModifications] = useState({
    pinned: {},
    muted: {},
    archived: {},
    status: {},
    labels: {},
    teamMembers: {},
    customFields: {},
    unreadForced: {},
    deleted: new Set(),
    readChats: new Set(),
    blocked: {}
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

  useEffect(() => {
    if (!appNotice.isOpen) return;
    const timeoutId = setTimeout(() => {
      setAppNotice((prev) => ({ ...prev, isOpen: false }));
    }, 3000);
    return () => clearTimeout(timeoutId);
  }, [appNotice.isOpen]);

  useEffect(() => {
    const timerId = setInterval(() => {
      setPresenceNow(Date.now());
    }, 60000);

    return () => clearInterval(timerId);
  }, []);

  const normalizedChats = chats || [];

  const toTitleCase = (text) => {
    if (!text || typeof text !== "string") return "Unknown";
    return text
      .replace(/[_-]+/g, " ")
      .split(" ")
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join(" ");
  };

  const getChatLabels = (chat) => {
    const chatId = chat._id || chat.id;
    if (Array.isArray(chatModifications.labels[chatId])) {
      return chatModifications.labels[chatId];
    }
    if (Array.isArray(chat.labels)) {
      return chat.labels
        .map((label) => (typeof label === "string" ? label : label?.name))
        .filter(Boolean);
    }
    if (chat.label && typeof chat.label === "string") {
      return [chat.label];
    }
    return [];
  };

  const getTeamMember = (chat) => {
    const chatId = chat._id || chat.id;
    if (chatModifications.teamMembers[chatId] !== undefined) {
      return chatModifications.teamMembers[chatId] || "Unassigned";
    }
    return (
      chat?.assignee?.name ||
      chat?.assignedTo?.name ||
      chat?.assignedToName ||
      chat?.agentName ||
      chat?.ownerName ||
      "Unassigned"
    );
  };

  const getChatSource = (chat) => {
    return chat?.source || chat?.contactSource || "unknown";
  };

  const getCreatedDate = (chat) => {
    const createdValue = chat?.createdAt || chat?.created_at;
    const date = createdValue ? new Date(createdValue) : null;
    return date && !Number.isNaN(date.getTime()) ? date : null;
  };

  const getLastSeenDate = (chat) => {
    return getPresenceInfo(chat, presenceNow).lastSeenDate;
  };

  const getChatUnreadCount = (chat) => {
    const chatId = chat._id || chat.id;
    if (chatModifications.unreadForced[chatId]) {
      return Math.max(1, chat.unread || 0);
    }
    if (chatModifications.readChats.has(chatId)) {
      return 0;
    }
    return chat.unread || 0;
  };

  const getChatStatus = (chat) => {
    const chatId = chat._id || chat.id;
    const status = chatModifications.status[chatId] ?? chat.chatStatus ?? chat.status ?? "";
    return String(status).toLowerCase();
  };

  const getIsPinned = (chat) => {
    const chatId = chat._id || chat.id;
    return chatModifications.pinned[chatId] !== undefined
      ? chatModifications.pinned[chatId]
      : !!chat.isPinned;
  };

  const formatChatTime = (updatedAt) => {
    if (!updatedAt) return "";
    const date = new Date(updatedAt);
    if (isNaN(date.getTime())) return "";

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfYesterday = new Date(startOfToday);
    startOfYesterday.setDate(startOfToday.getDate() - 1);

    if (date >= startOfToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    } else if (date >= startOfYesterday) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    }
  };

  const getIsMuted = (chat) => {
    const chatId = chat._id || chat.id;
    return chatModifications.muted[chatId] !== undefined
      ? chatModifications.muted[chatId]
      : !!chat.isMuted;
  };

  const getIsArchived = (chat) => {
    const chatId = chat._id || chat.id;
    if (chatModifications.archived[chatId] !== undefined) {
      return chatModifications.archived[chatId];
    }
    return chat.chatStatus === "archived" || !!chat.isArchived;
  };

  const uniqueLabels = [...new Set(normalizedChats.flatMap((chat) => getChatLabels(chat)))].sort();
  const uniqueTeamMembers = [...new Set(normalizedChats.map((chat) => getTeamMember(chat)))].sort();
  const uniqueContactSources = [...new Set(normalizedChats.map((chat) => getChatSource(chat)))].sort();
  const uniqueStatuses = [
    ...new Set(
      normalizedChats
        .map((chat) => getChatStatus(chat))
        .filter((status) => !!status)
    )
  ].sort();

  const toggleSetFilter = (filterKey, value) => {
    setAdvancedFilters((prev) => {
      const nextSet = new Set(prev[filterKey]);
      if (nextSet.has(value)) {
        nextSet.delete(value);
      } else {
        nextSet.add(value);
      }
      return {
        ...prev,
        [filterKey]: nextSet
      };
    });
  };

  const toggleQuickFilter = (key) => {
    setQuickFilters((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const resetQuickFilters = () => {
    setQuickFilters({
      unreadChats: false,
      openSessionChats: false,
      pinnedChats: false,
      mutedChats: false,
      unassignedChats: false,
      whatsappSource: false,
      archivedChats: false,
      blockedChats: false
    });
  };

  const resetAdvancedFilters = () => {
    setAdvancedFilters({
      status: new Set(),
      labels: new Set(),
      teamMembers: new Set(),
      contactSource: new Set(),
      createdAt: "all",
      lastSeen: "all"
    });
  };

  const matchesDateFilter = (date, filterValue) => {
    if (filterValue === "all") return true;
    if (!date) return false;

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (filterValue === "today") {
      return date >= startOfToday;
    }

    const days = Number(filterValue.replace("d", ""));
    if (!Number.isNaN(days)) {
      const threshold = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
      return date >= threshold;
    }

    return true;
  };

  const matchesLastSeenFilter = (chat, filterValue) => {
    if (filterValue === "all") return true;

    const presenceInfo = getPresenceInfo(chat, presenceNow);
    const lastSeenDate = getLastSeenDate(chat);
    if (filterValue === "online") {
      if (presenceInfo.isOnline) return true;
      if (!lastSeenDate) return false;
      return new Date().getTime() - lastSeenDate.getTime() <= 5 * 60 * 1000;
    }

    if (!lastSeenDate) return false;

    const days = filterValue === "24h" ? 1 : Number(filterValue.replace("d", ""));
    if (!Number.isNaN(days)) {
      const threshold = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      return lastSeenDate >= threshold;
    }

    return true;
  };

  const activeAdvancedFiltersCount =
    (advancedFilters.createdAt !== "all" ? 1 : 0) +
    (advancedFilters.lastSeen !== "all" ? 1 : 0) +
    advancedFilters.status.size +
    advancedFilters.labels.size +
    advancedFilters.teamMembers.size +
    advancedFilters.contactSource.size;

  const activeQuickFiltersCount = Object.values(quickFilters).filter(Boolean).length;

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
        const newUnreadForced = { ...prev.unreadForced };
        delete newUnreadForced[chatId];
        return {
          ...prev,
          readChats: newReadChats,
          unreadForced: newUnreadForced
        };
      });

      setOpenMenuId(null);

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

      // API call
      if (onTogglePin) {
        onTogglePin(chatId);
      } else {
        await chatService.toggleChatPin(chatId);
      }
    } catch (error) {
      console.error("❌ Failed to pin chat:", error);
    }
  };

  const handleDeleteChat = async (chatId, e) => {
    e.stopPropagation();

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

  const handleBlockChat = async (chatId, e) => {
    e.stopPropagation();
    const chat = chats.find((c) => (c._id || c.id) === chatId);
    if (!chat) return;

    const currentStatus = chatModifications.status[chatId] !== undefined
      ? chatModifications.status[chatId]
      : String(chat.chatStatus ?? chat.status ?? "").toLowerCase();

    const isCurrentlyBlocked = chatModifications.blocked[chatId] !== undefined
      ? chatModifications.blocked[chatId]
      : (chat.isBlocked || chat.blocked || currentStatus === "blocked" || String(chat.contactStatus || "").toLowerCase() === "blocked");

    const newStatus = isCurrentlyBlocked ? "active" : "blocked";

    try {
      setOpenMenuId(null);
      
      // Optimistic UI update
      setChatModifications(prev => ({
        ...prev,
        blocked: {
          ...prev.blocked,
          [chatId]: !isCurrentlyBlocked
        },
        status: {
          ...prev.status,
          [chatId]: newStatus
        }
      }));

      if (onUpdateStatus) {
        onUpdateStatus(chatId, newStatus);
      } else {
        await chatService.updateChatStatus(chatId, newStatus);
      }
    } catch (error) {
      console.error("❌ Failed to unblock/block chat:", error);
    }
  };

  const displayChats = (normalizedChats || [])
    .filter((c) => {
      const chatId = c._id || c.id;
      const searchValue = searchTerm.trim().toLowerCase();
      const normalizedActiveTab = String(activeTab || "All Chats").toLowerCase();
      const matchesSearch =
        searchValue.length === 0 ||
        c.name?.toLowerCase().includes(searchValue) ||
        c.phone?.toLowerCase().includes(searchValue) ||
        c.lastMsg?.toLowerCase().includes(searchValue);
      const isDeleted = chatModifications.deleted.has(chatId);
      const unreadCount = getChatUnreadCount(c);
      const chatStatus = getChatStatus(c);
      const labelList = getChatLabels(c);
      const teamMember = getTeamMember(c);
      const contactSource = getChatSource(c);
      const isPinned = getIsPinned(c);
      const isMuted = getIsMuted(c);

      const isCurrentlyArchived = chatModifications.archived[chatId] !== undefined
        ? chatModifications.archived[chatId]
        : (c.chatStatus === 'archived' || c.isArchived);
      const isCurrentlyBlocked = chatModifications.blocked[chatId] !== undefined
        ? chatModifications.blocked[chatId]
        : (c.isBlocked ||
          c.blocked ||
          chatStatus === "blocked" ||
          String(c.contactStatus || "").toLowerCase() === "blocked");

      const matchesTab =
        normalizedActiveTab === "all chats" ||
        normalizedActiveTab === "all" ||
        (normalizedActiveTab === "unread" && unreadCount > 0) ||
        (normalizedActiveTab === "active" && ["open", "active"].includes(chatStatus)) ||
        (normalizedActiveTab === "resolved" && ["resolved", "closed"].includes(chatStatus)) ||
        (normalizedActiveTab === "mine" && !!c.isMine);

      const matchesQuickFilters =
        (!quickFilters.unreadChats || unreadCount > 0) &&
        (!quickFilters.openSessionChats || ["open", "active"].includes(chatStatus) || c.isSessionOpen) &&
        (!quickFilters.pinnedChats || isPinned) &&
        (!quickFilters.mutedChats || isMuted) &&
        (!quickFilters.unassignedChats || teamMember === "Unassigned") &&
        (!quickFilters.whatsappSource || String(contactSource).toLowerCase() === "whatsapp") &&
        (!quickFilters.blockedChats || isCurrentlyBlocked);

      const matchesArchiveVisibility = quickFilters.archivedChats ? isCurrentlyArchived : !isCurrentlyArchived;

      const matchesAdvancedFilters =
        (advancedFilters.status.size === 0 || advancedFilters.status.has(chatStatus || "unknown")) &&
        (advancedFilters.labels.size === 0 || labelList.some((label) => advancedFilters.labels.has(label))) &&
        (advancedFilters.teamMembers.size === 0 || advancedFilters.teamMembers.has(teamMember)) &&
        (advancedFilters.contactSource.size === 0 || advancedFilters.contactSource.has(contactSource)) &&
        matchesDateFilter(getCreatedDate(c), advancedFilters.createdAt) &&
        matchesLastSeenFilter(c, advancedFilters.lastSeen);

      return matchesSearch && !isDeleted && matchesArchiveVisibility && matchesTab && matchesQuickFilters && matchesAdvancedFilters;
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
    return getChatUnreadCount(chat);
  };

  // Helper function to check if chat is pinned
  const isChatPinned = (chat) => {
    return getIsPinned(chat);
  };

  // Helper function to check if chat is muted
  const isChatMuted = (chat) => {
    return getIsMuted(chat);
  };

  // Helper function to check if chat is blocked
  const isChatBlocked = (chat) => {
    const chatId = chat._id || chat.id;
    const chatStatus = getChatStatus(chat);
    return chatModifications.blocked[chatId] !== undefined
      ? chatModifications.blocked[chatId]
      : (chat.isBlocked ||
        chat.blocked ||
        chatStatus === "blocked" ||
        String(chat.contactStatus || "").toLowerCase() === "blocked");
  };

  const handleBulkMarkAsRead = async () => {
    if (selectedChats.size === 0) return;

    // Update UI state with read chats
    setChatModifications(prev => {
      const newReadChats = new Set(prev.readChats);
      selectedChats.forEach(id => newReadChats.add(id));
      const newUnreadForced = { ...prev.unreadForced };
      selectedChats.forEach((id) => {
        delete newUnreadForced[id];
      });
      return { ...prev, readChats: newReadChats, unreadForced: newUnreadForced };
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
  };

  const handleBulkMute = async (forcedMuted = null) => {
    if (selectedChats.size === 0) return;

    const selectedIds = Array.from(selectedChats);
    const selectedChatMap = new Map(normalizedChats.map((chat) => [chat._id || chat.id, chat]));
    const targetMuted =
      forcedMuted === null
        ? !selectedIds.every((id) => {
          const chat = selectedChatMap.get(id);
          return chat ? getIsMuted(chat) : false;
        })
        : forcedMuted;

    setChatModifications((prev) => {
      const nextMuted = { ...prev.muted };
      selectedIds.forEach((id) => {
        nextMuted[id] = targetMuted;
      });
      return { ...prev, muted: nextMuted };
    });

    setIsSelectionMode(false);
    setSelectedChats(new Set());

    selectedIds.forEach(async (id) => {
      const chat = selectedChatMap.get(id);
      if (!chat) return;
      const currentMuted = getIsMuted(chat);
      if (currentMuted === targetMuted) return;
      try {
        await chatService.toggleMuteChat(id);
      } catch (error) {
        console.error("❌ Failed to bulk mute chat:", error);
      }
    });
  };

  const handleBulkArchive = async (forcedArchived = null) => {
    if (selectedChats.size === 0) return;

    const selectedIds = Array.from(selectedChats);
    const selectedChatMap = new Map(normalizedChats.map((chat) => [chat._id || chat.id, chat]));
    const targetArchived =
      forcedArchived === null
        ? !selectedIds.every((id) => {
          const chat = selectedChatMap.get(id);
          return chat ? getIsArchived(chat) : false;
        })
        : forcedArchived;

    setChatModifications((prev) => {
      const nextArchived = { ...prev.archived };
      selectedIds.forEach((id) => {
        nextArchived[id] = targetArchived;
      });
      return { ...prev, archived: nextArchived };
    });

    setIsSelectionMode(false);
    setSelectedChats(new Set());

    selectedIds.forEach(async (id) => {
      const chat = selectedChatMap.get(id);
      if (!chat) return;
      const currentArchived = getIsArchived(chat);
      if (currentArchived === targetArchived) return;
      try {
        await chatService.toggleArchiveChat(id);
      } catch (error) {
        console.error("❌ Failed to bulk archive chat:", error);
      }
    });
  };

  const handleBulkPin = async (forcedPinned = null) => {
    if (selectedChats.size === 0) return;

    const selectedIds = Array.from(selectedChats);
    const selectedChatMap = new Map(normalizedChats.map((chat) => [chat._id || chat.id, chat]));
    const targetPinned =
      forcedPinned === null
        ? !selectedIds.every((id) => {
          const chat = selectedChatMap.get(id);
          return chat ? getIsPinned(chat) : false;
        })
        : forcedPinned;

    setChatModifications((prev) => {
      const nextPinned = { ...prev.pinned };
      selectedIds.forEach((id) => {
        nextPinned[id] = targetPinned;
      });
      return { ...prev, pinned: nextPinned };
    });

    setIsSelectionMode(false);
    setSelectedChats(new Set());

    selectedIds.forEach(async (id) => {
      const chat = selectedChatMap.get(id);
      if (!chat) return;
      const currentPinned = getIsPinned(chat);
      if (currentPinned === targetPinned) return;
      try {
        await chatService.toggleChatPin(id);
      } catch (error) {
        console.error("❌ Failed to bulk pin chat:", error);
      }
    });
  };

  const handleBulkUpdateStatus = async (statusValue) => {
    if (selectedChats.size === 0 || !statusValue) return;
    const normalizedStatus = String(statusValue).toLowerCase();
    const selectedIds = Array.from(selectedChats);

    setChatModifications((prev) => {
      const nextStatus = { ...prev.status };
      selectedIds.forEach((id) => {
        nextStatus[id] = normalizedStatus;
      });
      return { ...prev, status: nextStatus };
    });

    setIsSelectionMode(false);
    setSelectedChats(new Set());

    selectedIds.forEach(async (chatId) => {
      try {
        await chatService.updateChatStatus(chatId, normalizedStatus);
      } catch (error) {
        console.error("❌ Failed to bulk update status:", error);
      }
    });
  };

  const handleBulkAssignLabel = async (labelInput) => {
    if (selectedChats.size === 0) return;
    if (!labelInput) return;
    const labels = labelInput.split(",").map((item) => item.trim()).filter(Boolean);
    if (labels.length === 0) return;

    const selectedIds = Array.from(selectedChats);
    setChatModifications((prev) => {
      const nextLabels = { ...prev.labels };
      selectedIds.forEach((id) => {
        nextLabels[id] = labels;
      });
      return { ...prev, labels: nextLabels };
    });

    setIsSelectionMode(false);
    setSelectedChats(new Set());

    selectedIds.forEach(async (chatId) => {
      try {
        await chatService.updateChatLabels(chatId, labels);
      } catch (error) {
        console.error("❌ Failed to bulk assign label:", error);
      }
    });
  };

  const handleBulkAssignCustomField = async (fieldKey, fieldValue) => {
    if (selectedChats.size === 0) return;
    if (!fieldKey || fieldValue === null || fieldValue === undefined) return;

    const selectedIds = Array.from(selectedChats);
    setChatModifications((prev) => {
      const nextCustomFields = { ...prev.customFields };
      selectedIds.forEach((id) => {
        nextCustomFields[id] = {
          ...(nextCustomFields[id] || {}),
          [fieldKey]: fieldValue
        };
      });
      return { ...prev, customFields: nextCustomFields };
    });

    setIsSelectionMode(false);
    setSelectedChats(new Set());

    selectedIds.forEach(async (chatId) => {
      try {
        await chatService.updateChatProfile(chatId, { customFields: { [fieldKey]: fieldValue } });
      } catch (error) {
        console.error("❌ Failed to bulk assign custom field:", error);
      }
    });
  };

  const handleBulkAssignTeamMember = async (teamName = null) => {
    if (selectedChats.size === 0) return;
    const memberName = teamName;
    if (memberName === null || memberName === undefined) return;

    const selectedIds = Array.from(selectedChats);
    setChatModifications((prev) => {
      const nextTeamMembers = { ...prev.teamMembers };
      selectedIds.forEach((id) => {
        nextTeamMembers[id] = memberName;
      });
      return { ...prev, teamMembers: nextTeamMembers };
    });

    setIsSelectionMode(false);
    setSelectedChats(new Set());

    selectedIds.forEach(async (chatId) => {
      try {
        await chatService.updateChatProfile(chatId, { assignedToName: memberName || "" });
      } catch (error) {
        console.error("❌ Failed to bulk assign team member:", error);
      }
    });
  };

  const handleBulkMarkAsUnread = () => {
    if (selectedChats.size === 0) return;

    setChatModifications((prev) => {
      const nextUnreadForced = { ...prev.unreadForced };
      const nextReadChats = new Set(prev.readChats);
      selectedChats.forEach((id) => {
        nextUnreadForced[id] = true;
        nextReadChats.delete(id);
      });
      return {
        ...prev,
        unreadForced: nextUnreadForced,
        readChats: nextReadChats
      };
    });

    setIsSelectionMode(false);
    setSelectedChats(new Set());
  };

  const handleBulkStartCampaign = ({ campaignName, campaignMode, campaignScheduleAt }) => {
    if (selectedChats.size === 0) return;

    const isScheduled = campaignMode === "scheduled" && !!campaignScheduleAt;
    const scheduleText = isScheduled
      ? ` Scheduled for ${new Date(campaignScheduleAt).toLocaleString()}.`
      : "";

    setAppNotice({
      isOpen: true,
      type: "success",
      message: `${campaignName || "Campaign"} queued for ${selectedChats.size} selected chats.${scheduleText}`
    });

    setIsSelectionMode(false);
    setSelectedChats(new Set());
  };

  const handleBulkDeleteContacts = () => {
    if (selectedChats.size === 0) return;
    handleBulkDelete();
  };

  const openBulkActionModal = (type) => {
    setBulkActionModal({ isOpen: true, type });
    if (type === "status") {
      setBulkActionForm((prev) => ({
        ...prev,
        status: prev.status || uniqueStatuses[0] || ""
      }));
    }
    if (type === "campaign") {
      setBulkActionForm((prev) => ({
        ...prev,
        campaignName: prev.campaignName || `Campaign ${new Date().toLocaleDateString()}`,
        campaignMode: prev.campaignMode || "now"
      }));
    }
  };

  const closeBulkActionModal = () => {
    setBulkActionModal({ isOpen: false, type: null });
  };

  const submitBulkActionModal = async () => {
    const { type } = bulkActionModal;
    if (!type) return;

    if (type === "status") {
      await handleBulkUpdateStatus(bulkActionForm.status);
    }
    if (type === "label") {
      await handleBulkAssignLabel(bulkActionForm.labels);
    }
    if (type === "custom-field") {
      await handleBulkAssignCustomField(
        bulkActionForm.customFieldKey,
        bulkActionForm.customFieldValue
      );
    }
    if (type === "team-member") {
      await handleBulkAssignTeamMember(bulkActionForm.teamMember);
    }
    if (type === "campaign") {
      handleBulkStartCampaign({
        campaignName: bulkActionForm.campaignName,
        campaignMode: bulkActionForm.campaignMode,
        campaignScheduleAt: bulkActionForm.campaignScheduleAt
      });
    }
    if (type === "confirm-delete-chats") {
      handleBulkDelete();
    }
    if (type === "confirm-delete-contacts") {
      handleBulkDeleteContacts();
    }

    closeBulkActionModal();
    setOpenMenuId(null);
  };

  const visibleChatIds = displayChats.map((chat) => chat._id || chat.id);
  const areAllVisibleSelected =
    visibleChatIds.length > 0 && visibleChatIds.every((id) => selectedChats.has(id));

  const handleToggleSelectAll = () => {
    if (visibleChatIds.length === 0) return;
    setSelectedChats((prev) => {
      if (areAllVisibleSelected) {
        return new Set();
      }
      return new Set(visibleChatIds);
    });
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
          <div className="flex items-center justify-between w-full gap-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => { setIsSelectionMode(false); setSelectedChats(new Set()); }}
                className="p-1 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
              <label className="flex items-center gap-2 text-slate-700 text-sm font-semibold cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={areAllVisibleSelected}
                  onChange={handleToggleSelectAll}
                  className="w-4 h-4 rounded border-slate-300 text-[#22C55E] focus:ring-[#22C55E]"
                  disabled={visibleChatIds.length === 0}
                />
                <span>
                  Select all <span className="text-slate-500 font-medium">({selectedChats.size})</span>
                </span>
              </label>
            </div>
            <div className="relative">
              <button
                data-menu-button="true"
                onClick={() => setOpenMenuId(openMenuId === "bulk-actions-menu" ? null : "bulk-actions-menu")}
                className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors inline-flex items-center gap-1.5 disabled:opacity-50"
                disabled={selectedChats.size === 0}
              >
                Bulk actions
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {openMenuId === "bulk-actions-menu" && (
                <div data-menu-content="true" className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-slate-200 z-50 py-1 max-h-[65vh] overflow-y-auto custom-scrollbar">
                  <p className="px-4 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wide">Assignment</p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openBulkActionModal("status");
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    Assign status
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openBulkActionModal("label");
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    Assign label
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openBulkActionModal("custom-field");
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    Assign custom field
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openBulkActionModal("team-member");
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    Assign team member
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBulkAssignTeamMember("");
                      setOpenMenuId(null);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    Un-assign team member
                  </button>

                  <div className="border-t border-slate-200 my-1"></div>
                  <p className="px-4 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wide">Campaign</p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openBulkActionModal("campaign");
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    Start campaign
                  </button>

                  <div className="border-t border-slate-200 my-1"></div>
                  <p className="px-4 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wide">Conversation State</p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBulkUpdateStatus("open");
                      setOpenMenuId(null);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    Open chats
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBulkUpdateStatus("closed");
                      setOpenMenuId(null);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    Close chats
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBulkArchive(true);
                      setOpenMenuId(null);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    Archived chats
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBulkArchive(false);
                      setOpenMenuId(null);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    Unarchived chats
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBulkPin(true);
                      setOpenMenuId(null);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    Pin chats
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBulkPin(false);
                      setOpenMenuId(null);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    Unpin chats
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBulkMarkAsRead();
                      setOpenMenuId(null);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    Mark as read
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBulkMarkAsUnread();
                      setOpenMenuId(null);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    Mark as un-read
                  </button>

                  <div className="border-t border-slate-200 my-1"></div>
                  <p className="px-4 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wide">Danger Zone</p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openBulkActionModal("confirm-delete-chats");
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    Delete chats
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openBulkActionModal("confirm-delete-contacts");
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    Delete contacts
                  </button>
                </div>
              )}
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
                  <div data-menu-content="true" className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-slate-200 z-50 py-1">
                    <p className="px-4 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wide">Quick filters</p>
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleQuickFilter("unreadChats"); setOpenMenuId(null); }}
                      className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      Unread chats
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleQuickFilter("openSessionChats"); setOpenMenuId(null); }}
                      className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2"
                    >
                      <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Open session chats
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleQuickFilter("mutedChats"); setOpenMenuId(null); }}
                      className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2"
                    >
                      <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5L6 9H3v6h3l5 4V5zm5.414 4.586a2 2 0 010 2.828M19 7l-2 2m0 6l2 2" />
                      </svg>
                      Muted chats
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleQuickFilter("unassignedChats"); setOpenMenuId(null); }}
                      className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2"
                    >
                      <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      Unassigned chats
                    </button>

                    <div className="border-t border-slate-200 my-1"></div>
                    <button
                      onClick={(e) => { e.stopPropagation(); setOpenMenuId(null); setIsAdvancedFilterOpen(true); }}
                      className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2"
                    >
                      <svg className="w-4 h-4 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                      </svg>
                      Advanced filters
                    </button>
                    <div className="border-t border-slate-200 my-1"></div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveTab("All Chats");
                        resetQuickFilters();
                        resetAdvancedFilters();
                        setOpenMenuId(null);
                      }}
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

              {(activeQuickFiltersCount > 0 || activeAdvancedFiltersCount > 0) && (
                <span className="min-w-5 h-5 px-1.5 rounded-full bg-[#22C55E] text-white text-[10px] font-bold flex items-center justify-center">
                  {activeQuickFiltersCount + activeAdvancedFiltersCount}
                </span>
              )}

              {/* NEW: Custom Chat-Plus Icon matching your screenshot exactly! */}
              <button
                onClick={() => setIsNewChatModalOpen(true)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-md transition-colors"
                title="Start New Chat"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Chat Bubble Body */}
                  <path d="M21 5.5C21 4.11929 19.8807 3 18.5 3H5.5C4.11929 3 3 4.11929 3 5.5V16.5C3 17.8807 4.11929 19 5.5 19H16.5L21 23.5V5.5Z" fill="currentColor" />
                  {/* Inner Plus Sign */}
                  <path d="M12 8V14M9 11H15" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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
                  <div data-menu-content="true" className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-slate-200 z-50 py-1">
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
                          try { await chatService.markMessagesAsRead(id); } catch (err) { }
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
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleQuickFilter("archivedChats");
                        setOpenMenuId(null);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2"
                    >
                      <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9-3h4" />
                      </svg>
                      {quickFilters.archivedChats ? "Hide archived chats" : "Archived chats"}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleQuickFilter("blockedChats");
                        setOpenMenuId(null);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2"
                    >
                      <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636L5.636 18.364M5.636 5.636l12.728 12.728" />
                      </svg>
                      {quickFilters.blockedChats ? "Hide blocked chats" : "Blocked chats"}
                    </button>
                    <div className="border-t border-slate-200 my-1"></div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleQuickFilter("pinnedChats");
                        setOpenMenuId(null);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2"
                    >
                      <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8V4" />
                      </svg>
                      {quickFilters.pinnedChats ? "Show all chats (disable pinned)" : "Show pinned chats"}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleQuickFilter("unassignedChats");
                        setOpenMenuId(null);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2"
                    >
                      <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197" />
                      </svg>
                      {quickFilters.unassignedChats ? "Show all chats (disable unassigned)" : "Show unassigned chats"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {appNotice.isOpen && (
        <div className="px-5 pt-3">
          <div className={`rounded-xl px-3 py-2 text-xs font-semibold border ${appNotice.type === "success"
              ? "bg-green-50 text-green-700 border-green-200"
              : "bg-blue-50 text-blue-700 border-blue-200"
            }`}>
            {appNotice.message}
          </div>
        </div>
      )}

      {(activeQuickFiltersCount > 0 || activeAdvancedFiltersCount > 0) && (
        <div className="px-3 lg:px-4 xl:px-5 pb-2 flex items-center justify-between gap-2 border-b border-slate-100">
          <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-600">
            {quickFilters.unreadChats && <span className="px-2 py-1 bg-green-50 text-green-700 rounded-full">Unread</span>}
            {quickFilters.openSessionChats && <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full">Open session</span>}
            {quickFilters.pinnedChats && <span className="px-2 py-1 bg-yellow-50 text-yellow-700 rounded-full">Pinned</span>}
            {quickFilters.mutedChats && <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded-full">Muted</span>}
            {quickFilters.unassignedChats && <span className="px-2 py-1 bg-purple-50 text-purple-700 rounded-full">Unassigned</span>}
            {quickFilters.whatsappSource && <span className="px-2 py-1 bg-emerald-50 text-emerald-700 rounded-full">WhatsApp</span>}
            {quickFilters.archivedChats && <span className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded-full">Archived</span>}
            {quickFilters.blockedChats && <span className="px-2 py-1 bg-red-50 text-red-700 rounded-full">Blocked</span>}
            {advancedFilters.status.size > 0 && <span className="px-2 py-1 bg-slate-100 rounded-full">Status: {advancedFilters.status.size}</span>}
            {advancedFilters.labels.size > 0 && <span className="px-2 py-1 bg-slate-100 rounded-full">Labels: {advancedFilters.labels.size}</span>}
            {advancedFilters.teamMembers.size > 0 && <span className="px-2 py-1 bg-slate-100 rounded-full">Team: {advancedFilters.teamMembers.size}</span>}
            {advancedFilters.contactSource.size > 0 && <span className="px-2 py-1 bg-slate-100 rounded-full">Source: {advancedFilters.contactSource.size}</span>}
            {advancedFilters.createdAt !== "all" && <span className="px-2 py-1 bg-slate-100 rounded-full">Created: {toTitleCase(advancedFilters.createdAt)}</span>}
            {advancedFilters.lastSeen !== "all" && <span className="px-2 py-1 bg-slate-100 rounded-full">Last seen: {toTitleCase(advancedFilters.lastSeen)}</span>}
          </div>
          <button
            onClick={() => {
              resetQuickFilters();
              resetAdvancedFilters();
            }}
            className="text-xs font-bold text-slate-500 hover:text-slate-800"
          >
            Clear all
          </button>
        </div>
      )}

      {bulkActionModal.isOpen && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/35 backdrop-blur-sm px-4">
          <div className="bg-white w-full max-w-[460px] max-h-[90vh] rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">
                {bulkActionModal.type === "status" && "Assign status"}
                {bulkActionModal.type === "label" && "Assign label"}
                {bulkActionModal.type === "custom-field" && "Assign custom field"}
                {bulkActionModal.type === "team-member" && "Assign team member"}
                {bulkActionModal.type === "campaign" && "Start campaign"}
                {bulkActionModal.type === "confirm-delete-chats" && "Delete chats"}
                {bulkActionModal.type === "confirm-delete-contacts" && "Delete contacts"}
              </h3>
              <button
                onClick={closeBulkActionModal}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-100"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 lg:p-6 space-y-4 overflow-y-auto custom-scrollbar">
              {bulkActionModal.type === "status" && (
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Status</label>
                  {uniqueStatuses.length > 0 ? (
                    <select
                      value={bulkActionForm.status}
                      onChange={(e) => setBulkActionForm((prev) => ({ ...prev, status: e.target.value }))}
                      className="w-full text-sm rounded-xl border border-slate-200 px-3 py-2.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#22C55E] focus:border-[#22C55E]"
                    >
                      {uniqueStatuses.map((statusValue) => (
                        <option key={statusValue} value={statusValue}>{toTitleCase(statusValue)}</option>
                      ))}
                    </select>
                  ) : (
                    <div className="w-full text-sm rounded-xl border border-slate-200 px-3 py-2.5 text-slate-500 bg-slate-50">
                      No status values available in current chats.
                    </div>
                  )}
                </div>
              )}

              {bulkActionModal.type === "label" && (
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Labels</label>
                  <input
                    type="text"
                    value={bulkActionForm.labels}
                    onChange={(e) => setBulkActionForm((prev) => ({ ...prev, labels: e.target.value }))}
                    placeholder="e.g. priority, vip"
                    className="w-full text-sm rounded-xl border border-slate-200 px-3 py-2.5 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#22C55E] focus:border-[#22C55E]"
                  />
                  <p className="mt-1.5 text-xs text-slate-500">Use comma to add multiple labels.</p>
                  {uniqueLabels.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {uniqueLabels.slice(0, 8).map((label) => (
                        <button
                          key={label}
                          type="button"
                          onClick={() => {
                            const current = bulkActionForm.labels.trim();
                            const nextValue = current
                              ? `${current}, ${label}`
                              : label;
                            setBulkActionForm((prev) => ({ ...prev, labels: nextValue }));
                          }}
                          className="px-2 py-1 text-[11px] font-semibold rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50"
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {bulkActionModal.type === "custom-field" && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Field name</label>
                    <input
                      type="text"
                      value={bulkActionForm.customFieldKey}
                      onChange={(e) => setBulkActionForm((prev) => ({ ...prev, customFieldKey: e.target.value }))}
                      placeholder="e.g. priority"
                      className="w-full text-sm rounded-xl border border-slate-200 px-3 py-2.5 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#22C55E] focus:border-[#22C55E]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Field value</label>
                    <input
                      type="text"
                      value={bulkActionForm.customFieldValue}
                      onChange={(e) => setBulkActionForm((prev) => ({ ...prev, customFieldValue: e.target.value }))}
                      placeholder="e.g. high"
                      className="w-full text-sm rounded-xl border border-slate-200 px-3 py-2.5 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#22C55E] focus:border-[#22C55E]"
                    />
                  </div>
                </>
              )}

              {bulkActionModal.type === "team-member" && (
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Team member</label>
                  <input
                    type="text"
                    value={bulkActionForm.teamMember}
                    onChange={(e) => setBulkActionForm((prev) => ({ ...prev, teamMember: e.target.value }))}
                    placeholder="e.g. Agent 1"
                    className="w-full text-sm rounded-xl border border-slate-200 px-3 py-2.5 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#22C55E] focus:border-[#22C55E]"
                  />
                  {uniqueTeamMembers.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {uniqueTeamMembers.slice(0, 8).map((member) => (
                        <button
                          key={member}
                          type="button"
                          onClick={() => setBulkActionForm((prev) => ({ ...prev, teamMember: member }))}
                          className="px-2 py-1 text-[11px] font-semibold rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50"
                        >
                          {member}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {bulkActionModal.type === "campaign" && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Campaign name</label>
                    <input
                      type="text"
                      value={bulkActionForm.campaignName}
                      onChange={(e) => setBulkActionForm((prev) => ({ ...prev, campaignName: e.target.value }))}
                      placeholder="Campaign name"
                      className="w-full text-sm rounded-xl border border-slate-200 px-3 py-2.5 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#22C55E] focus:border-[#22C55E]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Launch mode</label>
                    <select
                      value={bulkActionForm.campaignMode}
                      onChange={(e) => setBulkActionForm((prev) => ({ ...prev, campaignMode: e.target.value }))}
                      className="w-full text-sm rounded-xl border border-slate-200 px-3 py-2.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#22C55E] focus:border-[#22C55E]"
                    >
                      <option value="now">Start now</option>
                      <option value="scheduled">Schedule</option>
                    </select>
                  </div>
                  {bulkActionForm.campaignMode === "scheduled" && (
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Schedule at</label>
                      <input
                        type="datetime-local"
                        value={bulkActionForm.campaignScheduleAt}
                        onChange={(e) => setBulkActionForm((prev) => ({ ...prev, campaignScheduleAt: e.target.value }))}
                        className="w-full text-sm rounded-xl border border-slate-200 px-3 py-2.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#22C55E] focus:border-[#22C55E]"
                      />
                    </div>
                  )}
                </>
              )}

              {(bulkActionModal.type === "confirm-delete-chats" || bulkActionModal.type === "confirm-delete-contacts") && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
                  {bulkActionModal.type === "confirm-delete-chats"
                    ? `This will permanently delete ${selectedChats.size} selected chats.`
                    : `This will permanently delete ${selectedChats.size} selected contacts.`}
                </div>
              )}
            </div>

            <div className="px-4 lg:px-6 py-4 border-t border-slate-100 bg-slate-50/60 flex items-center justify-end gap-2">
              <button
                onClick={closeBulkActionModal}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={submitBulkActionModal}
                disabled={
                  (bulkActionModal.type === "status" && !bulkActionForm.status) ||
                  (bulkActionModal.type === "label" && !bulkActionForm.labels.trim()) ||
                  (bulkActionModal.type === "custom-field" && (!bulkActionForm.customFieldKey.trim() || !bulkActionForm.customFieldValue.trim())) ||
                  (bulkActionModal.type === "team-member" && !bulkActionForm.teamMember.trim()) ||
                  (bulkActionModal.type === "campaign" && !bulkActionForm.campaignName.trim()) ||
                  (bulkActionModal.type === "campaign" && bulkActionForm.campaignMode === "scheduled" && !bulkActionForm.campaignScheduleAt)
                }
                className="px-5 py-2 text-xs font-bold text-white bg-[#22C55E] rounded-lg hover:bg-green-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {bulkActionModal.type === "confirm-delete-chats" || bulkActionModal.type === "confirm-delete-contacts" ? "Confirm" : "Apply"}
              </button>
            </div>
          </div>
        </div>
      )}

      {isAdvancedFilterOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/35 backdrop-blur-sm px-4">
          <div className="bg-white w-full max-w-[760px] max-h-[90vh] rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Advanced filters</h3>
                <p className="text-xs text-slate-500 mt-0.5">Refine chats by team activity, source and time windows.</p>
              </div>
              <button
                onClick={() => setIsAdvancedFilterOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-100"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 lg:p-6 space-y-6 overflow-y-auto custom-scrollbar">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Status</p>
                <div className="flex flex-wrap gap-2">
                  {["open", "active", "resolved", "closed", "pending"].map((statusValue) => (
                    <button
                      key={statusValue}
                      onClick={() => toggleSetFilter("status", statusValue)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${advancedFilters.status.has(statusValue) ? "bg-[#22C55E] border-[#22C55E] text-white" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                    >
                      {toTitleCase(statusValue)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Labels</p>
                <div className="flex flex-wrap gap-2">
                  {uniqueLabels.length > 0 ? uniqueLabels.map((label) => (
                    <button
                      key={label}
                      onClick={() => toggleSetFilter("labels", label)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${advancedFilters.labels.has(label) ? "bg-[#22C55E] border-[#22C55E] text-white" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                    >
                      {label}
                    </button>
                  )) : <span className="text-xs text-slate-400">No labels available</span>}
                </div>
              </div>

              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Team members</p>
                <div className="flex flex-wrap gap-2">
                  {uniqueTeamMembers.map((member) => (
                    <button
                      key={member}
                      onClick={() => toggleSetFilter("teamMembers", member)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${advancedFilters.teamMembers.has(member) ? "bg-[#22C55E] border-[#22C55E] text-white" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                    >
                      {member}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Contact source</p>
                <div className="flex flex-wrap gap-2">
                  {uniqueContactSources.map((sourceValue) => (
                    <button
                      key={sourceValue}
                      onClick={() => toggleSetFilter("contactSource", sourceValue)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${advancedFilters.contactSource.has(sourceValue) ? "bg-[#22C55E] border-[#22C55E] text-white" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                    >
                      {toTitleCase(sourceValue)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Created at</p>
                  <select
                    value={advancedFilters.createdAt}
                    onChange={(e) => setAdvancedFilters((prev) => ({ ...prev, createdAt: e.target.value }))}
                    className="w-full text-sm rounded-xl border border-slate-200 px-3 py-2.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#22C55E] focus:border-[#22C55E]"
                  >
                    {CREATED_AT_FILTERS.map((item) => (
                      <option key={item.value} value={item.value}>{item.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Last seen</p>
                  <select
                    value={advancedFilters.lastSeen}
                    onChange={(e) => setAdvancedFilters((prev) => ({ ...prev, lastSeen: e.target.value }))}
                    className="w-full text-sm rounded-xl border border-slate-200 px-3 py-2.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#22C55E] focus:border-[#22C55E]"
                  >
                    {LAST_SEEN_FILTERS.map((item) => (
                      <option key={item.value} value={item.value}>{item.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="px-4 lg:px-6 py-4 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between">
              <button
                onClick={resetAdvancedFilters}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900"
              >
                Reset filters
              </button>
              <button
                onClick={() => setIsAdvancedFilterOpen(false)}
                className="px-5 py-2.5 text-xs font-bold text-white bg-[#22C55E] rounded-lg hover:bg-green-500 transition-colors"
              >
                Apply filters
              </button>
            </div>
          </div>
        </div>
      )}

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
      <div className="px-5 pb-2 shrink-0">
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
      <div className="px-5 pb-2 overflow-x-auto hide-scrollbar flex gap-2 shrink-0 border-b border-slate-50">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors shadow-sm ${activeTab === tab
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
               flex gap-2.5 px-4 py-2.5 cursor-pointer transition-all border-b border-slate-50 relative group
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
                {getPresenceInfo(chat, presenceNow).isOnline && (
                  <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-[#22C55E] border-2 border-white rounded-full"></span>
                )}
              </div>
            </div>

            {/* Chat Info */}
            <div className="flex-1 min-w-0 flex flex-col justify-center gap-0.5">
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
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                      </svg>
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap">{chat.lastMsgTime || formatChatTime(chat.updatedAt)}</span>

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
                          {getIsArchived(chat) ? "Unarchive" : "Archive"}
                        </button>
                        <div className="border-t border-slate-200 my-1"></div>
                        <button
                          onClick={(e) => handleBlockChat(chat._id || chat.id, e)}
                          className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                          </svg>
                          {isChatBlocked(chat) ? "Unblock" : "Block"}
                        </button>
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
              <div className="mt-1 flex justify-between items-center">
                {getChatStatus(chat) && (
                  <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider shadow-sm ${getChatStatus(chat) === 'open' ? 'text-[#16a34a] bg-[#f0fdf4] border border-[#bbf7d0]' :
                      getChatStatus(chat) === 'closed' ? 'text-slate-600 bg-slate-100 border border-slate-200' :
                        'text-blue-600 bg-blue-50 border border-blue-200'
                    }`}>
                    {getChatStatus(chat)}
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
                <path d="M12 5V19M5 12H19" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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