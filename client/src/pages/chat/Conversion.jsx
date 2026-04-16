import React, { useState, useEffect, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import chatService from "../../services/chatService";
import { fetchWhatsAppTemplates, mergeTemplates, getLocalTemplates } from "../../services/TemplateApi";
import {
   PaperClipIcon, FaceSmileIcon, EllipsisVerticalIcon,
   TrashIcon, NoSymbolIcon, UserCircleIcon,
   FolderIcon, ArchiveBoxIcon, LockClosedIcon, StarIcon, CheckCircleIcon,
   MagnifyingGlassIcon, XMarkIcon, ChatBubbleLeftRightIcon, BoltIcon,
   ClockIcon, PhotoIcon, FilmIcon, DocumentIcon, MusicalNoteIcon, ArrowUpTrayIcon,
   UserIcon, TagIcon, ArrowsRightLeftIcon, ChevronRightIcon, UserPlusIcon, UserMinusIcon, PlusCircleIcon, InformationCircleIcon
} from "@heroicons/react/24/outline";
import { Pin } from "lucide-react";
import { PaperAirplaneIcon, MegaphoneIcon, DocumentTextIcon, Squares2X2Icon, CheckCircleIcon as SolidCheckCircle, CheckIcon } from "@heroicons/react/24/solid";
import EmojiPicker from "emoji-picker-react";

// --- MOCK DATA ---
const QUICK_REPLIES_MOCK = [
   "Yes, please!",
   "Can you share more details?",
   "I'll check and revert shortly.",
   "Thanks, I received it.",
   "Not right now, thanks."
];

const MOCK_MEDIA = [
   { id: 1, name: "Marketing_Banner_01.jpg", size: "1.2 MB", date: "Oct 24", fullDate: "Oct 24, 2023 at 10:45 AM", type: "image", url: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=400&q=80", res: "1920×1080" },
   { id: 2, name: "Q3_Report_Data.png", size: "2.4 MB", date: "Oct 23", fullDate: "Oct 23, 2023 at 02:15 PM", type: "image", url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=400&q=80", res: "1080×1920" },
   { id: 3, name: "Contract_v2_signed.pdf", size: "850 KB", date: "Oct 22", fullDate: "Oct 22, 2023 at 09:30 AM", type: "document" },
   { id: 4, name: "Product_Demo_Final.mp4", size: "45 MB", date: "Oct 21", fullDate: "Oct 21, 2023 at 11:20 AM", type: "video" },
];

const MEDIA_TABS = [
   { id: 'recent', label: 'Recent', icon: ClockIcon },
   { id: 'image', label: 'Images', icon: PhotoIcon },
   { id: 'video', label: 'Videos', icon: FilmIcon },
   { id: 'audio', label: 'Audio', icon: MusicalNoteIcon },
   { id: 'document', label: 'Documents', icon: DocumentIcon },
];

const AGENTS_LIST = [
   { id: 'a1', name: 'Alex Rivera', workload: 12, avatar: 'AR' },
   { id: 'a2', name: 'Sarah Chen', workload: 5, avatar: 'SC' },
   { id: 'a3', name: 'Jordan Smith', workload: 18, avatar: 'JS' },
   { id: 'a4', name: 'Taylor Wong', workload: 2, avatar: 'TW' },
   { id: 'a5', name: 'Marcus Lee', workload: 8, avatar: 'ML' },
];

const Conversion = ({
   data,
   onSendMessage,
   onSendTemplate,
   onBack,
   onToggleProfile,
   onClearChat,
   onDeleteChat,
   onUpdateStatus,
   onUpdateLabels,
   onTogglePin,
   onViewHistory,
   availableLabels = [],
   statusOptions = [],
   quickReplies = []
}) => {
   const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
   const [selectedMediaId, setSelectedMediaId] = useState(1);
   const [mediaCaption, setMediaCaption] = useState("");
   const [mediaTab, setMediaTab] = useState('recent');
   const [mediaSearch, setMediaSearch] = useState("");
   const [mediaAssets, setMediaAssets] = useState(MOCK_MEDIA);
   const [isLoadingMedia, setIsLoadingMedia] = useState(false);

   // Template loading state
   const [allTemplates, setAllTemplates] = useState([]);

   const [inputText, setInputText] = useState("");
   const [isMenuOpen, setIsMenuOpen] = useState(false);
   const [showEmojiPicker, setShowEmojiPicker] = useState(false);
   const [showQuickReplies, setShowQuickReplies] = useState(false);
   const [showTemplates, setShowTemplates] = useState(false);
   const [templateSearch, setTemplateSearch] = useState("");
  const [debouncedTemplateSearch, setDebouncedTemplateSearch] = useState("");
   const [templateCategory, setTemplateCategory] = useState("ALL");
   const [selectedTemplateId, setSelectedTemplateId] = useState(null);
   const [isSendingTemplate, setIsSendingTemplate] = useState(false);
   const [isConfirmTemplateModalOpen, setIsConfirmTemplateModalOpen] = useState(false);
   const [confirmTemplate, setConfirmTemplate] = useState(null);
  const [isConfirmSending, setIsConfirmSending] = useState(false);
   const [deliveryMode, setDeliveryMode] = useState("now");
   const [scheduleDate, setScheduleDate] = useState("");
   const [scheduleTime, setScheduleTime] = useState("12:00");
   const [confirmSendError, setConfirmSendError] = useState("");
   const [isSearchOpen, setIsSearchOpen] = useState(false);
   const [searchQuery, setSearchQuery] = useState("");
   const [activeSearchMatch, setActiveSearchMatch] = useState(0);

   const [isLabelModalOpen, setIsLabelModalOpen] = useState(false);
   const [labelSearch, setLabelSearch] = useState("");

   const [isChangeStatusModalOpen, setIsChangeStatusModalOpen] = useState(false);
   const [selectedStatus, setSelectedStatus] = useState('warm');
   const [statusReason, setStatusReason] = useState("");

   const [isAssignAgentModalOpen, setIsAssignAgentModalOpen] = useState(false);
   const [agentSearch, setAgentSearch] = useState("");
   const [selectedAgent, setSelectedAgent] = useState('a1');
   const [isSmartRouting, setIsSmartRouting] = useState(false);

   // File upload states
   const [uploadingFile, setUploadingFile] = useState(false);
   const [uploadError, setUploadError] = useState(null);
   const [countdownNow, setCountdownNow] = useState(Date.now());

   // Applied labels local state for the modal
   const [appliedLabels, setAppliedLabels] = useState([]);

   const messagesEndRef = useRef(null);
   const messageRefs = useRef({});
   const menuRef = useRef(null);
   const emojiRef = useRef(null);
   const templateRef = useRef(null);
   const fileInputRef = useRef(null);

   useEffect(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
   }, [data.messages]);

   // Load templates from API
   useEffect(() => {
      const loadTemplates = async () => {
         try {
            const whatsappTemplates = await fetchWhatsAppTemplates();
            const localTemplates = getLocalTemplates();
            const templatesArray = whatsappTemplates.data?.data || [];
            const merged = mergeTemplates(templatesArray, localTemplates);
            setAllTemplates(merged);
         } catch (error) {
            console.error('Error loading templates:', error);
            const localTemplates = getLocalTemplates();
            setAllTemplates(localTemplates);
         }
      };
      
      loadTemplates();
   }, []);

   useEffect(() => {
      const handleClickOutside = (event) => {
         if (menuRef.current && !menuRef.current.contains(event.target)) setIsMenuOpen(false);
         if (emojiRef.current && !emojiRef.current.contains(event.target)) setShowEmojiPicker(false);
         if (templateRef.current && !templateRef.current.contains(event.target)) {
            setShowTemplates(false);
            setShowQuickReplies(false);
         }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
   }, []);

  useEffect(() => {
     const timerId = window.setTimeout(() => {
        setDebouncedTemplateSearch(templateSearch);
     }, 180);

     return () => window.clearTimeout(timerId);
  }, [templateSearch]);

   // Sync applied labels from chat data
   useEffect(() => {
      if (data.labels && availableLabels.length > 0) {
         const chatLabels = availableLabels.filter(l => data.labels.includes(l.name));
         setAppliedLabels(chatLabels);
      } else {
         setAppliedLabels([]);
      }

      if (data.chatStatus) {
         setSelectedStatus(data.chatStatus);
      }
   }, [data.labels, data.chatStatus, availableLabels]);

   const handleSubmit = (e) => {
      e.preventDefault();
      if (!inputText || !inputText.trim()) return;
      onSendMessage(inputText);
      setInputText("");
      setShowEmojiPicker(false);
      setShowTemplates(false);
      setShowQuickReplies(false);
   };

   const onEmojiClick = (emojiObject) => setInputText((prev) => prev + emojiObject.emoji);

   const handleQuickReplySelect = (text) => {
      setInputText(text);
      setShowTemplates(false);
   };

   const handleTemplateSelect = async (template) => {
      if (!template?.name || !onSendTemplate) return;
      setIsSendingTemplate(true);
      try {
         await onSendTemplate(template);
         setShowTemplates(false);
         setShowQuickReplies(false);
      } finally {
         setIsSendingTemplate(false);
      }
   };

   const openConfirmTemplateModal = (template) => {
      if (!template?.name) return;
      setConfirmTemplate(template);
      setDeliveryMode("now");
      setScheduleDate("");
      setScheduleTime("12:00");
      setConfirmSendError("");
      setShowTemplates(false);
      setIsConfirmTemplateModalOpen(true);
   };

   const handleConfirmTemplateSend = async () => {
      if (!confirmTemplate?.name || isConfirmSending) return;
      setIsConfirmSending(true);
      setConfirmSendError("");

      try {
         if (deliveryMode === "schedule") {
            const scheduleValue = `${scheduleDate}T${scheduleTime}`;
            const scheduledTime = new Date(scheduleValue).getTime();
            const delayMs = scheduledTime - Date.now();
            if (!scheduleDate || !scheduleTime || Number.isNaN(scheduledTime) || delayMs <= 0) {
               setConfirmSendError("Please choose a future date and time.");
               return;
            }

            const safeDelay = Math.min(delayMs, 2147483647);
            const scheduledTemplate = confirmTemplate;
            window.setTimeout(() => {
               handleTemplateSelect(scheduledTemplate);
            }, safeDelay);
            setIsConfirmTemplateModalOpen(false);
            return;
         }

         await handleTemplateSelect(confirmTemplate);
         setIsConfirmTemplateModalOpen(false);
      } finally {
         setIsConfirmSending(false);
      }
   };

   const handleFileChange = async (e) => {
      if (isTemplateOnlyMode) {
         setUploadError('You can send only approved templates until the customer replies.');
         return;
      }

      const file = e.target.files[0];
      if (!file) return;

      setUploadingFile(true);
      setUploadError(null);

      try {
         const uploadResult = await chatService.uploadFile(file);

         if (uploadResult.success) {
            const newAsset = {
               id: uploadResult.mediaId || Date.now(),
               name: uploadResult.fileName || file.name,
               size: (file.size / 1024).toFixed(1) + ' KB',
               date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
               fullDate: new Date().toLocaleString(),
               type: uploadResult.mimeType?.startsWith('image/') ? 'image' : 
                     (uploadResult.mimeType?.startsWith('video/') ? 'video' : 
                     (uploadResult.mimeType?.startsWith('audio/') ? 'audio' : 'document')),
               url: uploadResult.fileUrl,
               whatsappMediaId: uploadResult.whatsappMediaId || null,
               res: ""
            };

            // Add to media assets and select it
            setMediaAssets(prev => [newAsset, ...prev]);
            setSelectedMediaId(newAsset.id);
            
            // Update media tab to show the new item if it's not 'recent'
            if (mediaTab !== 'recent') {
               setMediaTab(newAsset.type);
            }
         } else {
            setUploadError(uploadResult.error);
            console.error('File upload failed:', uploadResult.error);
         }
      } catch (error) {
         setUploadError('Failed to upload file. Please try again.');
         console.error('File upload error:', error);
      } finally {
         setUploadingFile(false);
         // Clear input so same file can be selected again
         if (e.target) e.target.value = '';
      }
   };

   const fetchMediaAssets = async () => {
      setIsLoadingMedia(true);
      try {
         const response = await chatService.getMediaAssets();
         if (response.success) {
            const mapped = response.data.map(a => ({
               id: a._id,
               name: a.name,
               size: a.size,
               date: new Date(a.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
               fullDate: new Date(a.createdAt).toLocaleString(),
               type: a.type === 'IMAGE' ? 'image' : (a.type === 'VIDEO' ? 'video' : (a.type === 'AUDIO' ? 'audio' : 'document')),
               url: a.url,
               whatsappMediaId: a.whatsappMediaId || null,
               res: a.res || ""
            }));
            setMediaAssets(mapped);
            if (mapped.length > 0 && !mapped.find(m => m.id === selectedMediaId)) {
               setSelectedMediaId(mapped[0].id);
            }
         }
      } catch (error) {
         console.error('Error fetching media assets:', error);
      } finally {
         setIsLoadingMedia(false);
      }
   };

   useEffect(() => {
      if (isMediaModalOpen) {
         fetchMediaAssets();
      }
   }, [isMediaModalOpen]);

   const handleSendMedia = () => {
      if (isTemplateOnlyMode) {
         setUploadError('You can send only approved templates until the customer replies.');
         return;
      }

      const media = mediaAssets.find(m => m.id === selectedMediaId);
      if (media) onSendMessage(mediaCaption, media);
      setIsMediaModalOpen(false);
      setMediaCaption("");
   };

   const toggleLabel = (label) => {
      const lid = label._id || label.id;
      const isApplied = appliedLabels.find(l => (l._id || l.id) === lid);
      let newApplied;
      if (isApplied) {
         newApplied = appliedLabels.filter(l => (l._id || l.id) !== lid);
      } else {
         newApplied = [...appliedLabels, label];
      }
      setAppliedLabels(newApplied);
   };

   const handleSaveLabels = async () => {
      if (onUpdateLabels) {
         const labelNames = appliedLabels.map(l => l.name);
         await onUpdateLabels(labelNames);
      }
      setIsLabelModalOpen(false);
   };

   const handleSaveStatus = async () => {
      if (onUpdateStatus) {
         await onUpdateStatus(selectedStatus);
      }
      setIsChangeStatusModalOpen(false);
   };

   const createNewLabel = () => {
      if (!labelSearch.trim()) return;
      // Note: In a real app, this would call an API to create the label first
      const newLabel = { id: `l${Date.now()}`, name: labelSearch.trim(), color: '#94a3b8' };
      setAppliedLabels([...appliedLabels, newLabel]);
      setLabelSearch("");
   };

   const filteredMedia = mediaAssets.filter(item => item.name.toLowerCase().includes(mediaSearch.toLowerCase()) && (mediaTab === 'recent' ? true : item.type === mediaTab));
   const activeMedia = mediaAssets.find(m => m.id === selectedMediaId);
   const filteredAgents = AGENTS_LIST.filter(agent => agent.name.toLowerCase().includes(agentSearch.toLowerCase()));

   const canSendFreeText = useMemo(() => {
      if (data?.source !== 'whatsapp') return true;

      const within24Hours = (dateValue) => {
         const dt = new Date(dateValue);
         if (Number.isNaN(dt.getTime())) return false;
         return (Date.now() - dt.getTime()) < (24 * 60 * 60 * 1000);
      };

      // If server says true, trust it immediately.
      if (data?.canSendFreeText === true) return true;

      // Prefer explicit inbound timestamp when available.
      if (data?.lastInboundAt && within24Hours(data.lastInboundAt)) {
         return true;
      }

      // Fallback for older chats where lastInboundAt/canSendFreeText might be stale.
      const latestInbound = Array.isArray(data?.messages)
         ? [...data.messages]
            .filter((message) => message?.sender === 'them')
            .sort((a, b) => new Date(b?.createdAt || 0).getTime() - new Date(a?.createdAt || 0).getTime())[0]
         : null;

      if (latestInbound?.createdAt && within24Hours(latestInbound.createdAt)) {
         return true;
      }

      // Fall back to server false only after local checks.
      if (data?.canSendFreeText === false) return false;

      return false;
   }, [data?.source, data?.canSendFreeText, data?.lastInboundAt, data?.messages]);

   const isTemplateOnlyMode = data?.source === 'whatsapp' && !canSendFreeText;

   const sessionExpiryMs = useMemo(() => {
      if (data?.source !== 'whatsapp') return null;

      const parseDate = (value) => {
         const dt = new Date(value);
         return Number.isNaN(dt.getTime()) ? null : dt.getTime();
      };

      const explicitInboundMs = parseDate(data?.lastInboundAt);
      if (explicitInboundMs) return explicitInboundMs + (24 * 60 * 60 * 1000);

      const latestInbound = Array.isArray(data?.messages)
         ? [...data.messages]
            .filter((message) => message?.sender === 'them')
            .sort((a, b) => new Date(b?.createdAt || 0).getTime() - new Date(a?.createdAt || 0).getTime())[0]
         : null;

      const latestInboundMs = parseDate(latestInbound?.createdAt);
      if (latestInboundMs) return latestInboundMs + (24 * 60 * 60 * 1000);

      return null;
   }, [data?.source, data?.lastInboundAt, data?.messages]);

   const sessionRemainingMs = useMemo(() => {
      if (!sessionExpiryMs) return null;
      return Math.max(0, sessionExpiryMs - countdownNow);
   }, [sessionExpiryMs, countdownNow]);

   useEffect(() => {
      if (!sessionExpiryMs) return;

      setCountdownNow(Date.now());
      const timerId = setInterval(() => {
         setCountdownNow(Date.now());
      }, 1000);

      return () => clearInterval(timerId);
   }, [sessionExpiryMs]);

   const sessionCountdown = useMemo(() => {
      if (sessionRemainingMs === null) return null;

      const totalSeconds = Math.floor(sessionRemainingMs / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      return [hours, minutes, seconds].map((part) => String(part).padStart(2, '0')).join(':');
   }, [sessionRemainingMs]);

   const searchMatches = useMemo(() => {
      const keyword = searchQuery.trim().toLowerCase();
      if (!keyword || !Array.isArray(data?.messages)) return [];

      return data.messages.reduce((acc, message, index) => {
         const haystack = [
            message?.text,
            message?.fileName,
            message?.media?.name,
            message?.mediaUrl
         ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase();

         if (haystack.includes(keyword)) {
            acc.push(index);
         }
         return acc;
      }, []);
   }, [data?.messages, searchQuery]);

   const searchMatchIndexSet = useMemo(() => {
      return new Set(searchMatches);
   }, [searchMatches]);

   const currentMatchMessageIndex = searchMatches.length > 0
      ? searchMatches[Math.min(activeSearchMatch, searchMatches.length - 1)]
      : -1;

   useEffect(() => {
      setActiveSearchMatch(0);
   }, [searchQuery]);

   useEffect(() => {
      if (!isSearchOpen) {
         setSearchQuery("");
         setActiveSearchMatch(0);
      }
   }, [isSearchOpen]);

   useEffect(() => {
      if (currentMatchMessageIndex < 0) return;
      const messageNode = messageRefs.current[currentMatchMessageIndex];
      messageNode?.scrollIntoView({ behavior: 'smooth', block: 'center' });
   }, [currentMatchMessageIndex]);

   const handleSearchNavigate = (direction) => {
      if (searchMatches.length === 0) return;
      setActiveSearchMatch((prev) => (prev + direction + searchMatches.length) % searchMatches.length);
   };

   // Derived current labels for header display
   const headerLabels = useMemo(() => {
      if (!data.labels || availableLabels.length === 0) return [];
      return availableLabels.filter(l => data.labels.includes(l.name));
   }, [data.labels, availableLabels]);

   // Limit Quick Replies to top 3 as requested
   const displayQuickReplies = useMemo(() => {
      return quickReplies.slice(0, 3);
   }, [quickReplies]);

   // Only approved templates can be used in chat send flow.
   const approvedTemplates = useMemo(() => {
      return allTemplates.filter((template) => {
         const status = String(template?.status || '').toUpperCase();
         return status === 'APPROVED';
      });
   }, [allTemplates]);

   // Show all approved templates in the template picker.
   const displayTemplates = useMemo(() => {
      return approvedTemplates;
   }, [approvedTemplates]);

   const templateCategories = useMemo(() => {
      const categories = new Set(
         displayTemplates
            .map((template) => String(template?.category || "").trim().toUpperCase())
            .filter(Boolean)
      );
      return ["ALL", ...Array.from(categories)];
   }, [displayTemplates]);

   const filteredTemplates = useMemo(() => {
      const query = debouncedTemplateSearch.trim().toLowerCase();
      const normalizedQuery = query.replace(/[_\-\s]+/g, "");
      return displayTemplates.filter((template) => {
         const category = String(template?.category || "").toUpperCase();
         const name = String(template?.name || "");
         const bodyText = String(template?.bodyText || "");
         const normalizedName = name.toLowerCase().replace(/[_\-\s]+/g, "");
         const categoryMatch = templateCategory === "ALL" || category === templateCategory;

         // For short inputs, only search in template name to avoid noisy body-text matches like "Hello".
         let searchMatch = !query || normalizedName.includes(normalizedQuery) || name.toLowerCase().includes(query);

         if (!searchMatch && query.length >= 3) {
            searchMatch =
               bodyText.toLowerCase().includes(query) ||
               category.toLowerCase().includes(query);
         }

         return categoryMatch && searchMatch;
      });
   }, [displayTemplates, templateCategory, debouncedTemplateSearch]);

   useEffect(() => {
      if (!showTemplates) return;
      if (filteredTemplates.length === 0) {
         setSelectedTemplateId(null);
         return;
      }
      if (!filteredTemplates.some((template) => template.id === selectedTemplateId)) {
         setSelectedTemplateId(filteredTemplates[0].id);
      }
   }, [showTemplates, filteredTemplates, selectedTemplateId]);

   const selectedTemplate = useMemo(() => {
      return filteredTemplates.find((template) => template.id === selectedTemplateId) || null;
   }, [filteredTemplates, selectedTemplateId]);

   const previewTemplate = selectedTemplate || filteredTemplates[0] || null;

   const previewTitle = previewTemplate?.name
      ? previewTemplate.name.replace(/_/g, " ").replace(/\b\w/g, (ch) => ch.toUpperCase())
      : "";

   const confirmPreviewText = useMemo(() => {
      const raw = String(confirmTemplate?.bodyText || "");
      const recipientName = data?.name || "Customer";
      return raw.replace(/\{\{\d+\}\}/g, recipientName);
   }, [confirmTemplate, data?.name]);

   const recipientPhone = data?.phone || data?.phoneNumber || data?.mobile || data?.waId || "";

   const formatMessageDate = (date) => {
      const d = new Date(date);
      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(today.getDate() - 1);

      if (d.toDateString() === today.toDateString()) return "Today";
      if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
      
      return d.toLocaleDateString('en-GB', {
         day: '2-digit',
         month: '2-digit',
         year: 'numeric'
      });
   };

   const formatMessageTime = (msg) => {
      if (!msg) return "";
      const date = msg.createdAt ? new Date(msg.createdAt) : new Date();
      return date.toLocaleTimeString([], { 
         hour: '2-digit', 
         minute: '2-digit', 
         hour12: true 
      }).toLowerCase();
   };

   const isCurrentlyBlocked = data?.chatStatus === "blocked" || data?.isBlocked || data?.blocked || String(data?.contactStatus || "").toLowerCase() === "blocked";

   useEffect(() => {
      if (!isCurrentlyBlocked) return;
      setIsSearchOpen(false);
      setShowEmojiPicker(false);
      setShowTemplates(false);
      setShowQuickReplies(false);
   }, [isCurrentlyBlocked]);

   return (
      <div className="flex flex-col h-full relative bg-[#F9FAFB] font-sans">

         {/* 1. HEADER */}
         <div className="h-20 px-6 bg-white border-b border-slate-100 flex items-center justify-between shrink-0 z-20 relative shadow-sm">
            {isSearchOpen ? (
               <div className="flex-1 flex items-center gap-3 animate-in fade-in duration-200">
                  <MagnifyingGlassIcon className="w-5 h-5 text-slate-400" />
                  <input
                     type="text"
                     value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
                     placeholder="Search in conversation..."
                     className="flex-1 border-none outline-none text-xs text-slate-700 placeholder:text-slate-400 h-full py-2"
                     autoFocus
                  />
                  <span className="px-2 py-1 rounded-md border border-slate-200 bg-slate-50 text-[10px] font-bold text-slate-500 min-w-[52px] text-center">
                     {searchMatches.length > 0 ? `${activeSearchMatch + 1}/${searchMatches.length}` : '0/0'}
                  </span>
                  <button onClick={() => handleSearchNavigate(-1)} className="p-2 hover:bg-slate-100 rounded-full text-slate-500" title="Previous match">
                     <ChevronRightIcon className="w-4 h-4 rotate-180" />
                  </button>
                  <button onClick={() => handleSearchNavigate(1)} className="p-2 hover:bg-slate-100 rounded-full text-slate-500" title="Next match">
                     <ChevronRightIcon className="w-4 h-4" />
                  </button>
                  <button onClick={() => setIsSearchOpen(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-500"><XMarkIcon className="w-5 h-5" /></button>
               </div>
            ) : (
               <>
                  <div className="flex items-center gap-4 cursor-pointer" onClick={onToggleProfile}>
                     <button onClick={(e) => { e.stopPropagation(); onBack(); }} className="md:hidden text-slate-500">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                     </button>
                     <div className="relative">
                        <img src={data.avatar || `https://ui-avatars.com/api/?name=${data.name}`} alt="" className="w-12 h-12 rounded-full object-cover" />
                        <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-[#22C55E] border-2 border-white rounded-full"></span>
                     </div>
                     <div className="flex flex-col justify-center">
                        <h3 className="text-[15px] font-bold text-slate-900 leading-tight">{data.name}</h3>
                        <div className="flex items-center gap-2 mt-0.5">
                           <span className="w-2 h-2 rounded-full bg-[#22C55E]"></span>
                           <span className="text-xs font-medium text-slate-500">Active now</span>
                           <span className="text-slate-300 text-xs">•</span>
                           <span className="px-2 py-0.5 text-[10px] font-bold rounded-md shadow-sm border" style={{
                              backgroundColor: (statusOptions.find(s => s.label.toLowerCase() === data.chatStatus?.toLowerCase())?.original?.color + '15') || '#f1f5f9',
                              color: statusOptions.find(s => s.label.toLowerCase() === data.chatStatus?.toLowerCase())?.original?.color || '#64748b',
                              borderColor: (statusOptions.find(s => s.label.toLowerCase() === data.chatStatus?.toLowerCase())?.original?.color + '30') || '#e2e8f0'
                           }}>
                              {data.chatStatus ? data.chatStatus.charAt(0).toUpperCase() + data.chatStatus.slice(1) : 'Open'}
                           </span>
                        </div>
                     </div>
                  </div>

                  <div className="flex items-center gap-4 text-slate-400">
                     {data?.source === 'whatsapp' && sessionCountdown && (
                        <div className={`h-8 px-2.5 rounded-lg border flex items-center gap-2 text-[11px] font-bold tracking-wide shadow-sm ${sessionRemainingMs > 0 ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-amber-50 border-amber-200 text-amber-700'}`}>
                           <ClockIcon className="w-3.5 h-3.5" />
                           <span className="tabular-nums">{sessionRemainingMs > 0 ? sessionCountdown : 'Expired'}</span>
                        </div>
                     )}
                     {!isCurrentlyBlocked && (
                        <button onClick={() => setIsSearchOpen(true)} className="p-1 rounded-full hover:text-slate-700 transition-colors" title="Search in chat">
                           <MagnifyingGlassIcon className="w-5 h-5" />
                        </button>
                     )}

                     <div className="relative" ref={menuRef}>
                        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className={`p-1 rounded-full transition-colors ${isMenuOpen ? "bg-slate-100 text-black" : "hover:text-slate-700"}`}>
                           <EllipsisVerticalIcon className="w-6 h-6 cursor-pointer" />
                        </button>

                        {isMenuOpen && (
                           <div className="absolute right-0 top-10 w-60 bg-white border border-slate-100 shadow-xl rounded-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100 origin-top-right">
                              {/* Group 1 */}
                              <button onClick={() => { onToggleProfile(); setIsMenuOpen(false); }} className="w-full text-left px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-3 font-medium transition-colors">
                                 <UserIcon className="w-4 h-4 text-slate-400" /> View Profile
                              </button>
                              <button onClick={() => { setIsLabelModalOpen(true); setIsMenuOpen(false); }} className="w-full text-left px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-3 font-medium transition-colors">
                                 <TagIcon className="w-4 h-4 text-slate-400" /> Manage Labels
                              </button>
                              <button onClick={() => { setIsChangeStatusModalOpen(true); setIsMenuOpen(false); }} className="w-full text-left px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center justify-between font-medium transition-colors">
                                 <div className="flex items-center gap-3"><ArrowsRightLeftIcon className="w-4 h-4 text-slate-400" /> Change Status</div>
                                 <ChevronRightIcon className="w-3 h-3 text-slate-400" />
                              </button>

                              <div className="border-t border-slate-100 my-1.5"></div>

                              {/* Group 2 */}
                              <button onClick={() => { onViewHistory && onViewHistory(); setIsMenuOpen(false); }} className="w-full text-left px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-3 font-medium transition-colors">
                                 <ClockIcon className="w-4 h-4 text-slate-400" /> View Full History
                              </button>
                              <button onClick={() => { setIsAssignAgentModalOpen(true); setIsMenuOpen(false); }} className="w-full text-left px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-3 font-medium transition-colors">
                                 <UserPlusIcon className="w-4 h-4 text-slate-400" /> Assign Agent
                              </button>

                              <div className="border-t border-slate-100 my-1.5"></div>

                              {/* Group 3 */}
                              <button onClick={() => { onUpdateStatus && onUpdateStatus(data._id || data.id, data.chatStatus === 'archived' ? 'open' : 'archived'); setIsMenuOpen(false); }} className="w-full text-left px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-3 font-medium transition-colors">
                                 <ArchiveBoxIcon className="w-4 h-4 text-slate-400" /> {data.chatStatus === 'archived' ? 'Unarchive Chat' : 'Archive Chat'}
                              </button>

                              <button onClick={() => { onTogglePin && onTogglePin(); setIsMenuOpen(false); }} className="w-full text-left px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-3 font-medium transition-colors">
                                 <Pin className={`w-4 h-4 ${data.isPinned ? 'text-green-500 fill-green-500' : 'text-slate-400'}`} /> {data.isPinned ? 'Unpin Chat' : 'Pin Chat'}
                              </button>

                              <div className="border-t border-slate-100 my-1.5"></div>

                              {/* Group 4: Destructive Actions */}
                              <button onClick={() => { onClearChat && onClearChat(); setIsMenuOpen(false); }} className="w-full text-left px-4 py-2.5 text-xs text-red-500 hover:bg-red-50 flex items-center gap-3 font-medium transition-colors">
                                 <TrashIcon className="w-4 h-4 text-red-400" /> Clear Chat History
                              </button>
                              <button onClick={() => { onDeleteChat && onDeleteChat(); setIsMenuOpen(false); }} className="w-full text-left px-4 py-2.5 text-xs text-red-500 hover:bg-red-50 flex items-center gap-3 font-medium transition-colors">
                                 <UserMinusIcon className="w-4 h-4 text-red-400" /> Delete Contact
                              </button>
                              <button onClick={() => { onUpdateStatus && onUpdateStatus(data._id || data.id, isCurrentlyBlocked ? 'active' : 'blocked'); setIsMenuOpen(false); }} className="w-full text-left px-4 py-2.5 text-xs text-red-500 hover:bg-red-50 flex items-center gap-3 font-medium transition-colors">
                                 <NoSymbolIcon className="w-4 h-4 text-red-400" /> {isCurrentlyBlocked ? 'Unblock Contact' : 'Block Contact'}
                              </button>
                           </div>
                        )}
                     </div>
                  </div>
               </>
            )}
         </div>

          {/* 2. MESSAGES AREA */}
         <div className="flex-1 overflow-y-auto p-6 space-y-6 z-10 custom-scrollbar bg-white">
            
            {data.messages?.map((msg, index) => {
               const msgDate = new Date(msg.createdAt || Date.now()).toDateString();
               const prevMsgDate = index > 0 ? new Date(data.messages[index - 1].createdAt || Date.now()).toDateString() : null;
               const showDateSeparator = msgDate !== prevMsgDate;

               return (
                  <React.Fragment key={index}>
                     {showDateSeparator && (
                        <div className="flex justify-center my-6">
                           <span className="px-4 py-1.5 bg-slate-50 border border-slate-100 rounded-full text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                              {formatMessageDate(msg.createdAt || Date.now())}
                           </span>
                        </div>
                     )}
                     <div
                        ref={(el) => {
                           if (el) messageRefs.current[index] = el;
                           else delete messageRefs.current[index];
                        }}
                        className={`flex items-end gap-3 ${msg.sender === "me" ? "justify-end" : "justify-start"} ${currentMatchMessageIndex === index ? 'ring-2 ring-emerald-300 rounded-2xl p-1 -m-1' : (searchMatchIndexSet.has(index) ? 'ring-1 ring-emerald-100 rounded-2xl p-1 -m-1' : '')}`}
                     >
                        {msg.sender !== "me" && (
                           <div className="w-8 h-8 rounded-xl bg-[#e2e8f0] overflow-hidden shrink-0 flex items-center justify-center mb-5">
                              <img src={data.avatar || `https://ui-avatars.com/api/?name=${data.name}`} alt="A" className="w-full h-full object-cover" />
                           </div>
                        )}
                        <div className={`flex flex-col ${msg.sender === "me" ? "items-end" : "items-start"} max-w-[70%]`}>
                           <div className={`px-5 py-3 text-sm shadow-sm ${
                              msg.sender === "me"
                                 ? msg.status === 'failed'
                                    ? "bg-red-50 text-red-800 rounded-2xl rounded-br-sm border border-red-200"
                                    : "bg-[#22C55E] text-white rounded-2xl rounded-br-sm"
                                 : "bg-[#F1F5F9] text-slate-800 rounded-2xl rounded-bl-sm"
                           }`}>
                              {(msg.media || msg.mediaUrl) && (
                                 <div className={`mb-1 ${msg.text ? 'border-b pb-3 mb-3' : ''} ${msg.sender === 'me' ? 'border-white/30' : 'border-slate-200'}`}>
                                    {((msg.media?.type === 'image') || (msg.messageType === 'image') || (msg.mediaUrl && (msg.mediaUrl.match(/\.(jpeg|jpg|gif|png|webp)$/i)))) ? (
                                       <img src={msg.media?.url || msg.mediaUrl} alt="attachment" className="max-w-full sm:max-w-[240px] rounded-xl object-cover shadow-sm bg-slate-100" />
                                    ) : (
                                       <div className={`flex items-center gap-3 p-3 rounded-xl ${msg.sender === 'me' ? 'bg-white/20' : 'bg-slate-200'}`}>
                                          {(msg.media?.type === 'video' || msg.messageType === 'video') ? <FilmIcon className="w-8 h-8 shrink-0" /> : 
                                          (msg.media?.type === 'audio' || msg.messageType === 'audio') ? <MusicalNoteIcon className="w-8 h-8 shrink-0" /> :
                                          <DocumentIcon className="w-8 h-8 shrink-0" />}
                                          <div className="flex flex-col min-w-0 pr-4">
                                             <span className="text-sm font-bold truncate">{msg.media?.name || msg.fileName || 'Document'}</span>
                                             <span className="text-[10px] opacity-80">{msg.media?.size || (msg.fileSize ? (msg.fileSize/1024).toFixed(1) + ' KB' : 'File')}</span>
                                          </div>
                                       </div>
                                    )}
                                 </div>
                              )}
                              {msg.text && <p className="leading-relaxed">{msg.text}</p>}
                              {msg.sender === "me" && msg.status === 'failed' && (
                                 <p className="text-[10px] text-red-500 font-semibold mt-1">⚠ Not delivered via WhatsApp</p>
                              )}
                           </div>
                           <div className={`text-[10px] text-slate-400 mt-1.5 flex items-center gap-1 ${msg.sender === "me" ? "justify-end" : "justify-start"}`}>
                              {formatMessageTime(msg)}
                              {msg.sender === "me" && (
                                 msg.status === 'failed'
                                    ? <span className="text-red-500 font-bold text-xs" title={msg.error || 'Failed to send'}>✗</span>
                                    : msg.status === 'pending'
                                       ? <span className="text-slate-400 font-bold text-xs animate-pulse">○</span>
                                       : <span className="text-[#22C55E] font-bold text-xs tracking-tighter">✓✓</span>
                              )}
                           </div>
                        </div>
                     </div>
                  </React.Fragment>
               );
            })}
            <div ref={messagesEndRef} />
         </div>

         {/* 3. INPUT AREA */}
         <div className="p-4 bg-white z-20 relative">

            {!isTemplateOnlyMode && (
            <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-3 px-1 mb-1">
               {QUICK_REPLIES_MOCK.map((reply, idx) => (
                  <button key={idx} type="button" onClick={() => onSendMessage(reply)} className="px-4 py-1.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-full whitespace-nowrap transition-colors shadow-sm shrink-0">
                     {reply}
                  </button>
               ))}
            </div>
            )}

            {isTemplateOnlyMode && (
               <div className="mb-3 px-3 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold">
                  Template-only mode: customer reply is required to open 24-hour free chat window.
               </div>
            )}

            {showEmojiPicker && (
               <div className="absolute bottom-32 right-10 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-200" ref={emojiRef}>
                  <EmojiPicker onEmojiClick={onEmojiClick} height={350} width={300} />
               </div>
            )}

            {showQuickReplies && (
               <div className="absolute bottom-28 left-6 w-[340px] bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden animate-in fade-in slide-in-from-bottom-2" ref={templateRef}>
                  <div className="p-3 border-b border-slate-100 flex items-center justify-between">
                     <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-widest">Quick Replies</h4>
                     <span className="text-[10px] font-bold text-slate-400">{displayQuickReplies.length} REPLIES</span>
                  </div>
                  <div className="max-h-72 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                     {displayQuickReplies.map((reply) => (
                        <div
                           key={reply._id}
                           onClick={() => { handleQuickReplySelect(reply.content); setShowQuickReplies(false); }}
                           className="flex gap-3 p-3 hover:bg-slate-50 rounded-xl cursor-pointer transition-colors group border-l-2 border-l-transparent hover:border-l-[#22C55E]"
                        >
                           <div className="w-10 h-10 rounded-xl bg-green-50 text-[#22C55E] flex items-center justify-center shrink-0">
                              <ChatBubbleLeftRightIcon className="w-5 h-5" />
                           </div>
                           <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-center mb-1">
                                 <h4 className="text-xs font-bold text-slate-900 truncate">{reply.shortcut}</h4>
                                 <span className="text-[9px] font-extrabold text-green-600 bg-green-100 px-1.5 py-0.5 rounded uppercase">Reply</span>
                              </div>
                              <p className="text-[11px] text-slate-500 truncate">{reply.content}</p>
                           </div>
                        </div>
                     ))}
                     {displayQuickReplies.length === 0 && (
                        <div className="p-8 text-center">
                           <p className="text-sm text-slate-400 font-medium">No quick replies found.</p>
                           <p className="text-[10px] text-slate-400 mt-1">Add them in CRM Settings</p>
                        </div>
                     )}
                  </div>
                  <div className="px-4 py-2.5 bg-slate-50 text-[10px] text-slate-400 border-t border-slate-100 flex justify-between">
                     <span>Click to insert</span><span>Closes after selecting</span>
                  </div>
               </div>
            )}

            {showTemplates && typeof document !== "undefined" && createPortal((
               <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 md:p-5 bg-black/30 backdrop-blur-[2px]">
                  <div className="bg-slate-50 w-[calc(100vw-240px)] max-w-[900px] h-[calc(100vh-28px)] max-h-[860px] rounded-xl shadow-[0_20px_40px_rgba(25,28,30,0.12)] overflow-hidden flex flex-col">
                     <header className="h-16 flex items-center justify-between px-8 bg-slate-100 border-b border-slate-200">
                        <div className="flex items-center gap-3">
                           <Squares2X2Icon className="w-5 h-5 text-emerald-600" />
                           <h2 className="text-xl font-bold tracking-tight text-slate-800">Select Template</h2>
                        </div>
                        <button
                           type="button"
                           onClick={() => setShowTemplates(false)}
                           className="p-2 hover:bg-slate-200 rounded-full transition-colors"
                        >
                           <XMarkIcon className="w-5 h-5 text-slate-600" />
                        </button>
                     </header>

                     <div className="flex-1 flex overflow-hidden">
                        <div className="w-[58%] border-r border-slate-200 flex flex-col bg-white min-w-0">
                           <div className="p-6 space-y-4">
                              <div className="relative">
                                 <MagnifyingGlassIcon className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                                 <input
                                    type="text"
                                    value={templateSearch}
                                    onChange={(e) => setTemplateSearch(e.target.value)}
                                    placeholder="Search templates by name or tag..."
                                    className="w-full bg-slate-100 border-none rounded-lg py-3 pl-12 pr-4 focus:ring-2 focus:ring-emerald-500/30 transition-all text-sm"
                                 />
                              </div>

                              <div className="flex gap-2 flex-wrap">
                                 {templateCategories.map((category) => {
                                    const active = templateCategory === category;
                                    return (
                                       <button
                                          key={category}
                                          type="button"
                                          onClick={() => setTemplateCategory(category)}
                                          className={`px-3 py-1 text-[0.75rem] font-bold tracking-wider rounded-full uppercase transition-colors ${
                                             active
                                                ? "bg-emerald-700 text-white"
                                                : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                                          }`}
                                       >
                                          {category}
                                       </button>
                                    );
                                 })}
                              </div>
                           </div>

                           <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-3 min-h-0">
                              {filteredTemplates.map((template) => {
                                 const isSelected = selectedTemplate?.id === template.id;
                                 const bodyPreview = template?.bodyText || "";
                                 return (
                                    <button
                                       key={template.id}
                                       type="button"
                                       onClick={() => setSelectedTemplateId(template.id)}
                                       className={`w-full p-4 rounded-lg transition-all cursor-pointer text-left border-l-4 ${
                                          isSelected
                                             ? "bg-slate-100 border-emerald-700 ring-1 ring-inset ring-slate-300"
                                             : "bg-white hover:bg-slate-50 border-transparent ring-1 ring-inset ring-slate-200"
                                       }`}
                                    >
                                       <div className="flex justify-between items-start mb-2 gap-3">
                                          <h3 className="font-bold text-slate-800 truncate">{template.name}</h3>
                                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full uppercase shrink-0">
                                             Approved
                                          </span>
                                       </div>
                                       <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{bodyPreview}</p>
                                       <div className="mt-3 flex gap-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                          <span>{template.category || "General"}</span>
                                          <span>{template.language || "en_US"}</span>
                                       </div>
                                    </button>
                                 );
                              })}

                              {filteredTemplates.length === 0 && <div className="p-8 rounded-lg border border-dashed border-slate-300 bg-slate-50" />}
                           </div>
                        </div>

                        <div className="w-[42%] min-w-[320px] bg-slate-100 flex flex-col items-center justify-center p-4">
                           <div className="mb-6 text-center">
                              <span className="text-[0.65rem] font-bold text-slate-500 uppercase tracking-[0.2em] block mb-2">Live Preview</span>
                              <h4 className="text-[38px] leading-tight font-extrabold text-slate-700 truncate max-w-[320px]">{previewTitle}</h4>
                           </div>

                           <div className="w-[275px] h-[520px] bg-[#0f1e3a] rounded-[3rem] p-3 shadow-2xl relative border-4 border-[#1d2f4d]">
                              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-7 bg-[#1d2f4d] rounded-b-2xl z-10 flex items-center justify-center">
                                 <div className="w-11 h-1.5 bg-[#334a6f] rounded-full" />
                              </div>

                              <div className="w-full h-full bg-white rounded-[2.25rem] overflow-hidden flex flex-col">
                                 <div className="h-9 bg-white flex justify-between items-end px-6 pb-1.5">
                                    <span className="text-[14px] font-extrabold">9:41</span>
                                    <div className="flex gap-1.5 items-center">
                                       <span className="w-2.5 h-2.5 rounded-full bg-slate-600" />
                                       <span className="w-2.5 h-2.5 rounded-full bg-slate-600" />
                                       <span className="w-2.5 h-2.5 rounded-full bg-slate-600" />
                                    </div>
                                 </div>

                                 <div className="flex-1 p-4 bg-slate-100 flex flex-col gap-4 overflow-hidden">
                                    {previewTemplate?.bodyText && (
                                       <div className="flex items-start gap-2">
                                          <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                                             <MegaphoneIcon className="w-4.5 h-4.5 text-emerald-700" />
                                          </div>
                                          <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm text-[14px] leading-relaxed text-slate-700 max-w-[85%] border border-slate-200">
                                             {previewTemplate.bodyText}
                                          </div>
                                       </div>
                                    )}
                                 </div>

                                 <div className="p-3 border-t border-slate-100 bg-white">
                                    <div className="h-10 rounded-full bg-slate-100 flex items-center px-4">
                                       <div className="w-2.5 h-5 bg-emerald-500 rounded-full animate-pulse" />
                                    </div>
                                 </div>
                              </div>
                           </div>
                        </div>
                     </div>

                     <footer className="h-14 px-6 bg-slate-100 border-t border-slate-200 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-slate-500">
                           <InformationCircleIcon className="w-4 h-4" />
                           <span className="text-xs font-medium">Compliance-approved template last updated 2 days ago.</span>
                        </div>
                        <div className="flex gap-3">
                           <button
                              type="button"
                              onClick={() => setShowTemplates(false)}
                              className="px-5 py-1.5 rounded-xl text-slate-700 font-bold text-sm hover:bg-slate-200 transition-colors border border-slate-300"
                           >
                              Cancel
                           </button>
                           <button
                              type="button"
                              onClick={() => selectedTemplate && openConfirmTemplateModal(selectedTemplate)}
                              disabled={!selectedTemplate || isSendingTemplate}
                              className="px-7 py-1.5 rounded-xl bg-gradient-to-br from-emerald-700 to-emerald-500 text-white font-bold text-sm shadow-[0_10px_20px_rgba(0,108,73,0.15)] hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                           >
                              {isSendingTemplate ? "Sending..." : "Use Template"}
                           </button>
                        </div>
                     </footer>
                  </div>
               </div>
            ), document.body)}

            {isConfirmTemplateModalOpen && typeof document !== "undefined" && createPortal((
               <div className="fixed inset-0 z-[2100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
                  <div className="bg-white w-full max-w-[520px] max-h-[95vh] rounded-2xl shadow-[0_20px_40px_rgba(25,28,30,0.12)] flex flex-col overflow-hidden">
                     <div className="px-4 sm:px-6 py-4 flex justify-between items-center bg-slate-100 border-b border-slate-200 shrink-0">
                        <h2 className="text-xl sm:text-2xl font-bold text-slate-700">Confirm &amp; Send Message</h2>
                        <button
                           type="button"
                           onClick={() => setIsConfirmTemplateModalOpen(false)}
                           className="text-slate-500 hover:text-slate-700 transition-colors"
                        >
                           <XMarkIcon className="w-6 h-6" />
                        </button>
                     </div>

                     <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">
                        <div>
                           <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-widest block mb-2">Recipient Summary</span>
                           <div className="flex items-center gap-3 text-slate-800">
                              <UserCircleIcon className="w-5 h-5 text-emerald-700" />
                              <span className="text-sm">
                                 Sending to: <span className="font-bold">{data?.name || "Unknown Contact"}</span>{recipientPhone ? ` (${recipientPhone})` : ""}
                              </span>
                           </div>
                        </div>

                        <div className="space-y-2">
                           <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-widest block">Message Preview</span>
                           <div className="bg-emerald-50 rounded-xl p-3">
                              <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white">
                                 <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-tight">Verified Sender</span>
                                 <SolidCheckCircle className="w-3.5 h-3.5 text-emerald-700" />
                              </div>
                              <div className="bg-white rounded-lg p-3 shadow-sm border border-slate-100">
                                 <p className="text-sm text-slate-800 leading-relaxed">{confirmPreviewText}</p>
                                 <div className="flex items-center justify-end gap-1 mt-2">
                                    <span className="text-[10px] text-slate-500">{new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                                    <CheckIcon className="w-3.5 h-3.5 text-emerald-500" />
                                 </div>
                              </div>
                           </div>
                        </div>

                        <div className="space-y-2">
                           <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-widest block">Delivery Options</span>
                           <label className={`flex items-center gap-3 p-3 rounded-xl bg-slate-100 border-2 cursor-pointer ${deliveryMode === "now" ? "border-emerald-300" : "border-transparent"}`}>
                              <input type="radio" name="deliveryMode" checked={deliveryMode === "now"} onChange={() => setDeliveryMode("now")} className="w-5 h-5 text-emerald-700 focus:ring-emerald-500 border-slate-300" />
                              <div className="flex flex-col">
                                 <span className="font-bold text-slate-800">Send Now</span>
                                 <span className="text-xs text-slate-500">Message will be dispatched immediately</span>
                              </div>
                           </label>
                           <label className={`block p-3 rounded-xl bg-slate-100 border-2 cursor-pointer ${deliveryMode === "schedule" ? "border-emerald-300" : "border-transparent"}`}>
                              <div className="flex items-start justify-between gap-3">
                                 <div className="flex items-start gap-3">
                                    <input
                                       type="radio"
                                       name="deliveryMode"
                                       checked={deliveryMode === "schedule"}
                                       onChange={() => setDeliveryMode("schedule")}
                                       className="w-5 h-5 mt-0.5 text-emerald-700 focus:ring-emerald-500 border-slate-300"
                                    />
                                    <div className="flex flex-col">
                                       <span className="font-bold text-slate-800">Schedule for later</span>
                                       <span className="text-xs text-slate-500">Select a specific date and time for delivery</span>
                                    </div>
                                 </div>
                                 <DocumentIcon className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                              </div>
                              {deliveryMode === "schedule" && (
                                 <div className="grid grid-cols-2 gap-3 mt-3 pl-8">
                                    <div>
                                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Select Date</p>
                                       <input
                                          type="date"
                                          value={scheduleDate}
                                          onChange={(e) => setScheduleDate(e.target.value)}
                                          className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-emerald-500"
                                       />
                                    </div>
                                    <div>
                                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Select Time</p>
                                       <input
                                          type="time"
                                          value={scheduleTime}
                                          onChange={(e) => setScheduleTime(e.target.value)}
                                          className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-emerald-500"
                                       />
                                    </div>
                                 </div>
                              )}
                           </label>
                        </div>

                        <div className="flex items-center gap-2 p-3 bg-slate-100 rounded-lg">
                           <InformationCircleIcon className="w-4 h-4 text-slate-500" />
                           <p className="text-xs text-slate-600">This will consume <span className="font-bold text-slate-800">1 WCC credit</span>. Remaining: <span className="font-bold text-emerald-700">617</span>.</p>
                        </div>
                        {confirmSendError && <p className="text-xs font-bold text-red-500">{confirmSendError}</p>}
                     </div>

                     <div className="px-4 sm:px-6 py-4 bg-slate-100 flex items-center justify-end gap-3 border-t border-slate-200 shrink-0">
                        <button
                           type="button"
                           onClick={() => setIsConfirmTemplateModalOpen(false)}
                           className="px-4 sm:px-6 py-2.5 rounded-full text-slate-700 font-medium hover:bg-slate-200 transition-colors text-sm sm:text-base"
                        >
                           Cancel
                        </button>
                        <button
                           type="button"
                           onClick={handleConfirmTemplateSend}
                           disabled={isSendingTemplate || isConfirmSending}
                           className="bg-gradient-to-br from-emerald-700 to-emerald-500 text-white font-bold px-5 sm:px-7 py-2.5 rounded-xl shadow-[0_4px_12px_rgba(17,186,130,0.3)] hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm sm:text-base"
                        >
                           {isConfirmSending ? "Sending..." : (deliveryMode === "schedule" ? "Schedule Message" : "Send Message Now")}
                           <PaperAirplaneIcon className="w-4 h-4" />
                        </button>
                     </div>
                  </div>
               </div>
            ), document.body)}

            {isCurrentlyBlocked ? (
               <div className="flex items-center justify-center gap-4 py-12 bg-[#F9FAFB] animate-in fade-in zoom-in-95 duration-200">
                  <button 
                     onClick={() => onDeleteChat && onDeleteChat()}
                     className="flex items-center gap-2.5 border border-slate-200 rounded-full px-10 py-3.5 bg-white text-rose-600 font-bold text-sm shadow-sm hover:shadow-md transition-all active:scale-95 whitespace-nowrap"
                  >
                     <TrashIcon className="w-5 h-5 text-rose-500" />
                     Delete chat
                  </button>
                  <button 
                     onClick={() => onUpdateStatus && onUpdateStatus(data._id || data.id, 'active')}
                     className="flex items-center gap-2.5 border border-slate-200 rounded-full px-10 py-3.5 bg-white text-emerald-600 font-bold text-sm shadow-sm hover:shadow-md transition-all active:scale-95 whitespace-nowrap"
                  >
                     <NoSymbolIcon className="w-5 h-5 text-emerald-500" />
                     Unblock
                  </button>
               </div>
            ) : (
               <>
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />

                  <form onSubmit={handleSubmit} className="flex items-center bg-white border border-[#86efac] focus-within:border-[#22C55E] focus-within:ring-1 focus-within:ring-[#22C55E] rounded-full p-1 shadow-sm transition-all relative overflow-hidden">
                     <div className="flex items-center gap-0.5 pl-2 shrink-0">
                        <button type="button" onClick={() => setIsMediaModalOpen(true)} className="text-slate-400 hover:text-slate-600 p-1.5 transition-colors">
                           <PaperClipIcon className="w-5 h-5" />
                        </button>
                        <button type="button" onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="text-slate-400 hover:text-slate-600 p-1.5 transition-colors">
                           <FaceSmileIcon className="w-6 h-6" />
                        </button>
                     </div>
                     <input
                        type="text"
                        value={inputText}
                        onChange={(e) => {
                           const val = e.target.value;
                           setInputText(val);
                           if (val.endsWith("/")) {
                              setShowTemplates(true);
                              setShowQuickReplies(false);
                           }
                           if (!val.includes("/")) setShowTemplates(false);
                        }}
                        placeholder="Type a message..."
                        className="flex-1 min-w-0 bg-transparent border-none outline-none text-sm px-3 text-slate-800 placeholder:text-slate-400"
                     />
                     <div className="flex items-center gap-1.5 pr-1 shrink-0">
                        <button type="button" onClick={() => { setShowQuickReplies(false); setShowTemplates(!showTemplates); }} className="text-slate-400 hover:text-slate-600 p-1.5 transition-colors" title="Templates">
                           <ChatBubbleLeftRightIcon className="w-5 h-5" />
                        </button>
                        <button type="button" onClick={() => { setShowTemplates(false); setShowQuickReplies(!showQuickReplies); }} className="text-[#22C55E] bg-green-50 rounded-full p-2 hover:bg-green-100 transition-colors flex items-center justify-center" title="Quick Replies">
                           <BoltIcon className="w-5 h-5" />
                        </button>
                        <button type="submit" disabled={!inputText || !inputText.trim()} className="w-10 h-10 flex items-center justify-center bg-[#22C55E] text-white rounded-full hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md shrink-0">
                           <PaperAirplaneIcon className="w-4 h-4" />
                        </button>
                     </div>
                  </form>
               </>
            )}
         </div>

         {/* MODALS */}
         {isMediaModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 md:p-8 animate-in fade-in duration-200">
               <div className="bg-white w-full max-w-[1100px] h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                  <div className="h-16 px-6 border-b border-slate-100 flex items-center justify-between shrink-0">
                     <h2 className="text-xl font-bold text-slate-800">Select Media to Send</h2>
                     <div className="flex items-center gap-4">
                        <div className="relative flex items-center bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 w-64 hidden md:flex focus-within:ring-1 focus-within:ring-green-500">
                           <MagnifyingGlassIcon className="w-4 h-4 text-slate-400 mr-2" />
                           <input type="text" placeholder="Search assets..." value={mediaSearch} onChange={(e) => setMediaSearch(e.target.value)} className="bg-transparent border-none outline-none text-sm text-slate-700 w-full" />
                        </div>
                        <button onClick={() => fileInputRef.current.click()} className="flex items-center gap-2 bg-[#22C55E] text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-green-500 transition-colors shadow-sm"><ArrowUpTrayIcon className="w-4 h-4" /> Upload New</button>
                        <div className="w-px h-6 bg-slate-200"></div>
                        <button onClick={() => setIsMediaModalOpen(false)} className="text-slate-400 hover:text-slate-700 p-1"><XMarkIcon className="w-6 h-6" /></button>
                     </div>
                  </div>
                  <div className="flex-1 flex overflow-hidden">
                     <div className="w-60 border-r border-slate-100 flex flex-col justify-between bg-white shrink-0">
                        <div className="p-4 space-y-1">
                           {MEDIA_TABS.map(tab => (
                              <button key={tab.id} onClick={() => setMediaTab(tab.id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-colors ${mediaTab === tab.id ? 'bg-[#f0fdf4] text-[#16a34a] font-bold' : 'text-slate-600 hover:bg-slate-50 font-medium'}`}>
                                 <tab.icon className="w-5 h-5" /> {tab.label}
                              </button>
                           ))}
                        </div>
                     </div>
                     <div className="flex-1 bg-[#F8FAFC] p-6 overflow-y-auto custom-scrollbar">
                         {isLoadingMedia ? (
                            <div className="flex flex-col items-center justify-center h-full">
                               <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                               <p className="text-gray-400 mt-4 font-medium italic">Synchronizing assets...</p>
                            </div>
                         ) : filteredMedia.length > 0 ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                               {filteredMedia.map((item) => (
                                  <div key={item.id} onClick={() => setSelectedMediaId(item.id)} className={`bg-white rounded-xl p-2 cursor-pointer transition-all border-2 ${selectedMediaId === item.id ? 'border-[#22C55E] shadow-md relative' : 'border-transparent shadow-sm hover:border-slate-200'}`}>
                                     {selectedMediaId === item.id && <div className="absolute top-3 right-3 bg-white rounded-full z-10 shadow-sm"><SolidCheckCircle className="w-6 h-6 text-[#22C55E]" /></div>}
                                    <div className="aspect-square bg-slate-50 rounded-lg mb-3 overflow-hidden flex items-center justify-center relative">
                                       {item.type === 'image' ? <img src={item.url} alt="" className="w-full h-full object-cover" /> : 
                                        <div className="text-center text-blue-400">
                                            {item.type === 'video' ? <FilmIcon className="w-10 h-10 mx-auto mb-1" /> : 
                                             item.type === 'audio' ? <MusicalNoteIcon className="w-10 h-10 mx-auto mb-1" /> :
                                             <DocumentIcon className="w-10 h-10 mx-auto mb-1" />}
                                            <span className="text-[10px] font-bold uppercase">{item.type}</span>
                                        </div>}
                                    </div>
                                     <div className="px-1 pb-1"><h4 className="text-sm font-bold text-slate-800 truncate">{item.name}</h4><div className="flex items-center text-xs text-slate-400 mt-1 gap-1.5"><span>{item.size}</span><span>•</span><span>{item.date}</span></div></div>
                                  </div>
                               ))}
                            </div>
                         ) : (
                            <div className="flex flex-col items-center justify-center h-full text-slate-400"><DocumentIcon className="w-16 h-16 mb-4 text-slate-300" /><p className="font-semibold text-slate-500">No media found</p></div>
                         )}
                     </div>
                     <div className="w-[320px] border-l border-slate-100 bg-white flex flex-col shrink-0">
            <div className="p-6 border-b border-slate-100">
                           <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Asset Preview</h3>
                           <div className="aspect-video bg-slate-50 rounded-xl mb-5 overflow-hidden flex items-center justify-center border border-slate-100 relative">
                              {uploadingFile ? (
                                 <div className="flex flex-col items-center justify-center">
                                    <div className="w-8 h-8 border-4 border-[#22C55E] border-t-transparent rounded-full animate-spin"></div>
                                    <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-tight">Uploading...</p>
                                 </div>
                              ) : uploadError ? (
                                 <div className="text-center p-4">
                                    <NoSymbolIcon className="w-12 h-12 text-red-300 mx-auto mb-2" />
                                    <p className="text-[10px] font-bold text-red-500 uppercase tracking-tight">{uploadError}</p>
                                 </div>
                              ) : activeMedia?.type === 'image' ? (
                                 <img src={activeMedia.url} alt="" className="w-full h-full object-cover" />
                              ) : (
                                 <div className="text-center">
                                    {activeMedia?.type === 'video' ? <FilmIcon className="w-16 h-16 text-blue-300" /> :
                                     activeMedia?.type === 'audio' ? <MusicalNoteIcon className="w-16 h-16 text-blue-300" /> :
                                     <DocumentIcon className="w-16 h-16 text-blue-300" />}
                                 </div>
                              )}
                           </div>
                           <div className="space-y-4">
                              <div><p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">File Name</p><p className="text-sm font-bold text-slate-800 break-words">{activeMedia?.name}</p></div>
                              <div className="grid grid-cols-2 gap-4">
                                 <div><p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Size</p><p className="text-sm font-bold text-slate-800">{activeMedia?.size}</p></div>
                                 {activeMedia?.res && <div><p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Resolution</p><p className="text-sm font-bold text-slate-800">{activeMedia?.res}</p></div>}
                              </div>
                           </div>
                        </div>
                        <div className="p-6 flex-1 bg-slate-50/50">
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Add Caption</p>
                           <textarea value={mediaCaption} onChange={(e) => setMediaCaption(e.target.value)} placeholder="Type a caption for your message..." className="w-full h-32 p-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#22C55E]/20 focus:border-[#22C55E] resize-none shadow-sm"></textarea>
                        </div>
                     </div>
                  </div>
                  <div className="h-20 border-t border-slate-100 bg-white px-6 flex items-center justify-end gap-3 shrink-0">
                     <button onClick={() => setIsMediaModalOpen(false)} className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 rounded-xl transition-colors">Cancel</button>
                     <button onClick={handleSendMedia} className="flex items-center gap-2 px-6 py-2.5 bg-[#22C55E] hover:bg-green-500 text-white text-sm font-bold rounded-xl transition-colors shadow-md shadow-green-200"><PaperAirplaneIcon className="w-4 h-4" /> Attach to Chat</button>
                  </div>
               </div>
            </div>
         )}

         {isLabelModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
               <div className="bg-white w-full max-w-[420px] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                  <div className="px-6 py-5 border-b border-slate-100 flex items-start justify-between">
                     <div><h2 className="text-lg font-bold text-slate-900 leading-none mb-1">Manage Labels</h2><p className="text-xs font-medium text-slate-500">{data.name}</p></div>
                     <button onClick={() => setIsLabelModalOpen(false)} className="text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100 transition-colors -mr-1.5 -mt-1.5"><XMarkIcon className="w-5 h-5" /></button>
                  </div>
                  <div className="p-6">
                     <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2.5 focus-within:border-[#22C55E] focus-within:ring-1 focus-within:ring-[#22C55E] transition-all mb-6">
                        <MagnifyingGlassIcon className="w-4 h-4 text-slate-400" />
                        <input type="text" value={labelSearch} onChange={(e) => setLabelSearch(e.target.value)} placeholder="Search or create a label..." className="flex-1 bg-transparent border-none outline-none text-sm text-slate-800 placeholder:text-slate-400" autoFocus />
                     </div>
                     <div className="mb-6">
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Applied Labels</h4>
                        <div className="flex flex-wrap gap-2 min-h-[30px]">
                           {appliedLabels.length === 0 && <p className="text-xs text-slate-400 italic">No labels applied yet.</p>}
                           {appliedLabels.map(label => (
                              <span key={label._id || label.id} className="flex items-center gap-1.5 px-3 py-1.5 border text-xs font-bold rounded-lg shadow-sm" style={{ backgroundColor: label.color + '15', color: label.color, borderColor: label.color + '30' }}>{label.name}<XMarkIcon className="w-3.5 h-3.5 cursor-pointer opacity-70 hover:opacity-100 transition-opacity" onClick={() => toggleLabel(label)} /></span>
                           ))}
                        </div>
                     </div>
                     <div>
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Label Library</h4>
                        <div className="max-h-48 overflow-y-auto custom-scrollbar -mx-2 px-2 space-y-0.5">
                           {labelSearch && !availableLabels.some(l => l.name.toLowerCase() === labelSearch.toLowerCase()) && (
                              <div onClick={createNewLabel} className="flex items-center gap-3 px-3 py-2.5 border border-dashed border-green-300 bg-green-50 rounded-xl cursor-pointer hover:bg-green-100 transition-colors mb-2">
                                 <PlusCircleIcon className="w-5 h-5 text-green-500" /><span className="text-sm font-bold text-green-600">Create "{labelSearch}"</span>
                              </div>
                           )}
                           {availableLabels.filter(l => l.name.toLowerCase().includes(labelSearch.toLowerCase())).map(label => {
                              const lid = label._id || label.id;
                              const isApplied = appliedLabels.some(al => (al._id || al.id) === lid);
                              return (
                                 <div key={lid} onClick={() => toggleLabel(label)} className="flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 rounded-xl cursor-pointer group transition-colors">
                                    <div className="w-5 flex justify-center items-center shrink-0">{isApplied ? <CheckIcon className="w-4 h-4 text-[#22C55E]" /> : <div className="w-4 h-4 rounded-full border border-slate-200 group-hover:border-slate-300"></div>}</div>
                                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: label.color || '#94a3b8' }}></span><span className="text-sm font-medium text-slate-700 truncate">{label.name}</span>
                                 </div>
                              );
                           })}
                        </div>
                     </div>
                  </div>
                  <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-end gap-3 shrink-0">
                     <button onClick={() => setIsLabelModalOpen(false)} className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors">Cancel</button>
                     <button onClick={handleSaveLabels} className="px-6 py-2.5 bg-[#22C55E] hover:bg-green-500 text-white text-sm font-bold rounded-xl transition-colors shadow-sm">Save Changes</button>
                  </div>
               </div>
            </div>
         )}

         {isChangeStatusModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
               <div className="bg-white w-full max-w-[450px] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                  <div className="px-6 py-5 border-b border-slate-100 flex items-start justify-between">
                     <div><h2 className="text-base font-bold text-slate-900 leading-none mb-1">Update Lead Status</h2><p className="text-xs font-medium text-slate-500"><span className="font-bold text-[#22C55E]">{data.name}</span></p></div>
                     <button onClick={() => setIsChangeStatusModalOpen(false)} className="text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100 transition-colors -mr-1.5 -mt-1.5"><XMarkIcon className="w-5 h-5" /></button>
                  </div>
                  <div className="p-6">
                     <p className="text-[11px] font-bold text-slate-500 mb-3 tracking-wide">Select New Status</p>
                     <div className="space-y-2.5 max-h-60 overflow-y-auto custom-scrollbar pr-1">
                        {statusOptions.map(status => (
                           <div key={status.id} onClick={() => setSelectedStatus(status.label.toLowerCase())} className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${selectedStatus === status.label.toLowerCase() ? 'border-[#22C55E] ring-1 ring-[#22C55E] bg-[#f0fdf4]' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                              <div className="flex items-center gap-3"><span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: status.original?.color || '#cbd5e1' }}></span><span className={`text-sm font-bold ${selectedStatus === status.label.toLowerCase() ? 'text-slate-900' : 'text-slate-700'}`}>{status.label}</span></div>
                              {selectedStatus === status.label.toLowerCase() && <SolidCheckCircle className="w-5 h-5 text-[#22C55E]" />}
                           </div>
                        ))}
                     </div>
                     <div className="mt-6">
                        <p className="text-[11px] font-bold text-slate-500 mb-2 tracking-wide">Internal Reason for Change</p>
                        <textarea value={statusReason} onChange={(e) => setStatusReason(e.target.value)} placeholder="Explain why you're changing the status..." className="w-full h-24 p-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#22C55E]/20 focus:border-[#22C55E] resize-none shadow-sm placeholder:text-slate-400"></textarea>
                     </div>
                  </div>
                  <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between shrink-0">
                     <button onClick={() => setIsChangeStatusModalOpen(false)} className="text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors">Cancel</button>
                     <button onClick={handleSaveStatus} className="flex items-center gap-2 px-6 py-2.5 bg-[#22C55E] hover:bg-green-500 text-white text-sm font-bold rounded-xl transition-colors shadow-sm">Confirm Status Update</button>
                  </div>
               </div>
            </div>
         )}

         {isAssignAgentModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
               <div className="bg-white w-full max-w-[450px] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                  <div className="px-6 py-5 border-b border-slate-100 flex items-start justify-between">
                     <div><h2 className="text-base font-bold text-slate-900">Assign Agent</h2><p className="text-sm font-medium text-slate-500">Select a team member to manage this chat</p></div>
                     <button onClick={() => setIsAssignAgentModalOpen(false)} className="text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100 transition-colors -mr-1.5 -mt-1.5"><XMarkIcon className="w-5 h-5" /></button>
                  </div>
                  <div className="p-6">
                     <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus-within:border-[#22C55E] focus-within:ring-1 focus-within:ring-[#22C55E] transition-all mb-4">
                        <MagnifyingGlassIcon className="w-5 h-5 text-slate-400" />
                        <input type="text" value={agentSearch} onChange={(e) => setAgentSearch(e.target.value)} placeholder="Search agents by name or email..." className="flex-1 bg-transparent border-none outline-none text-sm text-slate-800 placeholder:text-slate-400" autoFocus />
                     </div>
                     <div className="max-h-64 overflow-y-auto custom-scrollbar -mx-2 px-2 space-y-1">
                        {filteredAgents.map(agent => (
                           <div key={agent.id} onClick={() => setSelectedAgent(agent.id)} className="flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors hover:bg-slate-50">
                              <div className="flex items-center gap-3">
                                 <div className="relative">
                                    <img src={`https://ui-avatars.com/api/?name=${agent.name.replace(' ', '+')}&background=random`} alt="" className="w-10 h-10 rounded-full object-cover" />
                                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                                 </div>
                                 <div>
                                    <p className="text-sm font-bold text-slate-900">{agent.name}</p>
                                    <p className="text-[11px] font-medium text-slate-500">Workload: {agent.workload} active chats</p>
                                 </div>
                              </div>
                              <div className="w-5 h-5 flex justify-center items-center shrink-0">{selectedAgent === agent.id ? <SolidCheckCircle className="w-6 h-6 text-[#22C55E]" /> : <div className="w-5 h-5 rounded-full border-2 border-slate-200"></div>}</div>
                           </div>
                        ))}
                     </div>
                     <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between bg-green-50/50 p-4 rounded-2xl border border-green-100">
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0"><StarIcon className="w-4 h-4" /></div>
                           <div><p className="text-sm font-bold text-slate-900">Smart Routing</p><p className="text-[11px] font-medium text-slate-500">Auto-assign based on agent workload</p></div>
                        </div>
                        <button onClick={() => setIsSmartRouting(!isSmartRouting)} className={`w-11 h-6 rounded-full relative transition-colors duration-200 ease-in-out ${isSmartRouting ? 'bg-[#22C55E]' : 'bg-slate-200'}`}>
                           <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform duration-200 ease-in-out shadow-sm ${isSmartRouting ? 'translate-x-5' : 'translate-x-0'}`}></span>
                        </button>
                     </div>
                  </div>
                  <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-end gap-4 shrink-0">
                     <button onClick={() => setIsAssignAgentModalOpen(false)} className="text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors">Cancel</button>
                     <button onClick={() => setIsAssignAgentModalOpen(false)} className="px-6 py-2.5 bg-[#22C55E] hover:bg-green-500 text-white text-sm font-bold rounded-xl transition-colors shadow-sm">Confirm Assignment</button>
                  </div>
               </div>
            </div>
         )}
      </div>
   );
};

export default Conversion;