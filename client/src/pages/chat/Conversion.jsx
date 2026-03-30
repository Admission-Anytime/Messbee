import React, { useState, useEffect, useRef, useMemo } from "react";
import chatService from "../../services/chatService";
import { 
  PaperClipIcon, FaceSmileIcon, PhoneIcon, EllipsisVerticalIcon,
  TrashIcon, NoSymbolIcon, UserCircleIcon, 
  FolderIcon, ArchiveBoxIcon, LockClosedIcon, StarIcon, CheckCircleIcon,
  MagnifyingGlassIcon, XMarkIcon, ChatBubbleLeftRightIcon, VideoCameraIcon, BoltIcon,
  ClockIcon, PhotoIcon, FilmIcon, DocumentIcon, MusicalNoteIcon, ArrowUpTrayIcon,
  UserIcon, TagIcon, ArrowsRightLeftIcon, ChevronRightIcon, UserPlusIcon, MapPinIcon, UserMinusIcon, PlusCircleIcon, InformationCircleIcon
} from "@heroicons/react/24/outline";
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
  const [inputText, setInputText] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false); 
  const [isSearchOpen, setIsSearchOpen] = useState(false);   
  
  // Modals States
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [selectedMediaId, setSelectedMediaId] = useState(1);
  const [mediaCaption, setMediaCaption] = useState("");
  const [mediaTab, setMediaTab] = useState('recent'); 
  const [mediaSearch, setMediaSearch] = useState(""); 
  
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

  // Applied labels local state for the modal
  const [appliedLabels, setAppliedLabels] = useState([]);

  const messagesEndRef = useRef(null);
  const menuRef = useRef(null);
  const emojiRef = useRef(null);
  const templateRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [data.messages]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) setIsMenuOpen(false);
      if (emojiRef.current && !emojiRef.current.contains(event.target)) setShowEmojiPicker(false);
      if (templateRef.current && !templateRef.current.contains(event.target)) setShowTemplates(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
    if (!inputText.trim()) return;
    onSendMessage(inputText); 
    setInputText("");
    setShowEmojiPicker(false);
    setShowTemplates(false);
  };

  const onEmojiClick = (emojiObject) => setInputText((prev) => prev + emojiObject.emoji);
  
  const handleTemplateSelect = (template) => { 
    setInputText(template); 
    setShowTemplates(false); 
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setUploadingFile(true);
    setUploadError(null);
    
    try {
      const uploadResult = await chatService.uploadFile(file);
      
      if (uploadResult.success) {
        const mediaData = {
          id: uploadResult.mediaId,
          mediaId: uploadResult.mediaId,
          url: uploadResult.fileUrl,
          type: uploadResult.mimeType,
          fileName: uploadResult.fileName
        };
        
        const caption = mediaCaption || file.name;
        await onSendMessage(caption, mediaData);
        
        setMediaCaption("");
        setIsMediaModalOpen(false);
      } else {
        setUploadError(uploadResult.error);
        console.error('File upload failed:', uploadResult.error);
      }
    } catch (error) {
      setUploadError('Failed to upload file. Please try again.');
      console.error('File upload error:', error);
    } finally {
      setUploadingFile(false);
    }
  };

  const handleSendMedia = () => {
    const media = MOCK_MEDIA.find(m => m.id === selectedMediaId);
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

  const filteredMedia = MOCK_MEDIA.filter(item => item.name.toLowerCase().includes(mediaSearch.toLowerCase()) && (mediaTab === 'recent' ? true : item.type === mediaTab));
  const activeMedia = MOCK_MEDIA.find(m => m.id === selectedMediaId);
  const filteredAgents = AGENTS_LIST.filter(agent => agent.name.toLowerCase().includes(agentSearch.toLowerCase()));

  // Derived current labels for header display
  const headerLabels = useMemo(() => {
    if (!data.labels || availableLabels.length === 0) return [];
    return availableLabels.filter(l => data.labels.includes(l.name));
  }, [data.labels, availableLabels]);

  // Limit Quick Replies to top 3 as requested
  const displayQuickReplies = useMemo(() => {
    return quickReplies.slice(0, 3);
  }, [quickReplies]);

  return (
    <div className="flex flex-col h-full relative bg-[#F9FAFB] font-sans">
      
      {/* 1. HEADER */}
      <div className="h-20 px-6 bg-white border-b border-slate-100 flex items-center justify-between shrink-0 z-20 relative shadow-sm">
         {isSearchOpen ? (
            <div className="flex-1 flex items-center gap-3 animate-in fade-in duration-200">
                <MagnifyingGlassIcon className="w-5 h-5 text-slate-400" />
                <input type="text" placeholder="Search in conversation..." className="flex-1 border-none outline-none text-xs text-slate-700 placeholder:text-slate-400 h-full py-2" autoFocus />
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
                    <PhoneIcon className="w-6 h-6 cursor-pointer hover:text-slate-700 transition-colors" />
                    <VideoCameraIcon className="w-7 h-7 cursor-pointer hover:text-slate-700 transition-colors" />
                    
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
                                <button onClick={() => { onUpdateStatus && onUpdateStatus('archived'); setIsMenuOpen(false); }} className="w-full text-left px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-3 font-medium transition-colors">
                                    <ArchiveBoxIcon className="w-4 h-4 text-slate-400" /> Archive Chat
                                </button>
                                <button onClick={() => { onTogglePin && onTogglePin(); setIsMenuOpen(false); }} className="w-full text-left px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-3 font-medium transition-colors">
                                    <MapPinIcon className={`w-4 h-4 ${data.isPinned ? 'text-green-500 fill-green-500' : 'text-slate-400'}`} /> {data.isPinned ? 'Unpin Chat' : 'Pin Chat'}
                                </button>

                                <div className="border-t border-slate-100 my-1.5"></div>

                                {/* Group 4: Destructive Actions */}
                                <button onClick={() => { onClearChat && onClearChat(); setIsMenuOpen(false); }} className="w-full text-left px-4 py-2.5 text-xs text-red-500 hover:bg-red-50 flex items-center gap-3 font-medium transition-colors">
                                    <TrashIcon className="w-4 h-4 text-red-400" /> Clear Chat History
                                </button>
                                <button onClick={() => { onDeleteChat && onDeleteChat(); setIsMenuOpen(false); }} className="w-full text-left px-4 py-2.5 text-xs text-red-500 hover:bg-red-50 flex items-center gap-3 font-medium transition-colors">
                                    <UserMinusIcon className="w-4 h-4 text-red-400" /> Delete Contact
                                </button>
                                <button onClick={() => { onUpdateStatus && onUpdateStatus('blocked'); setIsMenuOpen(false); }} className="w-full text-left px-4 py-2.5 text-xs text-red-500 hover:bg-red-50 flex items-center gap-3 font-medium transition-colors">
                                    <NoSymbolIcon className="w-4 h-4 text-red-400" /> Block
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
         <div className="flex justify-center my-2 mb-6">
            <span className="px-4 py-1.5 bg-slate-50 border border-slate-100 rounded-full text-[11px] font-bold text-slate-400 uppercase tracking-widest">TODAY</span>
         </div>
         
         {data.messages?.map((msg, index) => (
           <div key={index} className={`flex items-end gap-3 ${msg.sender === "me" ? "justify-end" : "justify-start"}`}>
              {msg.sender !== "me" && (
                 <div className="w-8 h-8 rounded-xl bg-[#e2e8f0] overflow-hidden shrink-0 flex items-center justify-center mb-5">
                    <img src={data.avatar || `https://ui-avatars.com/api/?name=${data.name}`} alt="A" className="w-full h-full object-cover" />
                 </div>
              )}
              <div className={`flex flex-col ${msg.sender === "me" ? "items-end" : "items-start"} max-w-[70%]`}>
                 <div className={`px-5 py-3 text-sm shadow-sm ${msg.sender === "me" ? "bg-[#22C55E] text-white rounded-2xl rounded-br-sm" : "bg-[#F1F5F9] text-slate-800 rounded-2xl rounded-bl-sm"}`}>
                    {msg.media && (
                       <div className={`mb-1 ${msg.text ? 'border-b pb-3 mb-3' : ''} ${msg.sender === 'me' ? 'border-white/30' : 'border-slate-200'}`}>
                          {msg.media.type === 'image' ? (
                              <img src={msg.media.url} alt="attachment" className="max-w-full sm:max-w-[240px] rounded-xl object-cover shadow-sm" />
                          ) : (
                              <div className={`flex items-center gap-3 p-3 rounded-xl ${msg.sender === 'me' ? 'bg-white/20' : 'bg-slate-200'}`}>
                                 <DocumentIcon className="w-8 h-8 shrink-0" />
                                 <div className="flex flex-col min-w-0 pr-4">
                                    <span className="text-sm font-bold truncate">{msg.media.name}</span>
                                    <span className="text-[10px] opacity-80">{msg.media.size}</span>
                                 </div>
                              </div>
                          )}
                       </div>
                    )}
                    {msg.text && <p className="leading-relaxed">{msg.text}</p>}
                 </div>
                 <div className={`text-[10px] text-slate-400 mt-1.5 flex items-center gap-1 ${msg.sender === "me" ? "justify-end" : "justify-start"}`}>
                   {msg.time || "12:00 PM"} 
                   {msg.sender === "me" && <span className="text-[#22C55E] font-bold text-xs tracking-tighter">✓✓</span>}
                 </div>
              </div>
           </div>
         ))}
         <div ref={messagesEndRef} />
      </div>

      {/* 3. INPUT AREA */}
      <div className="p-4 bg-white z-20 relative">
         
         <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-3 px-1 mb-1">
            {QUICK_REPLIES_MOCK.map((reply, idx) => (
               <button key={idx} type="button" onClick={() => onSendMessage(reply)} className="px-4 py-1.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-full whitespace-nowrap transition-colors shadow-sm shrink-0">
                  {reply}
               </button>
            ))}
         </div>

         {showEmojiPicker && (
            <div className="absolute bottom-32 right-10 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-200" ref={emojiRef}>
               <EmojiPicker onEmojiClick={onEmojiClick} height={350} width={300} />
            </div>
         )}

         {showTemplates && (
            <div className="absolute bottom-28 left-6 w-[340px] bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden animate-in fade-in slide-in-from-bottom-2" ref={templateRef}>
                <div className="p-3 border-b border-slate-100 flex items-center justify-between">
                   <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-widest">Quick Replies</h4>
                   <span className="text-[10px] font-bold text-slate-400">{displayQuickReplies.length} REPLIES FOUND</span>
                </div>
                <div className="max-h-72 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                   {displayQuickReplies.map((reply) => (
                      <div 
                         key={reply._id}
                         onClick={() => handleTemplateSelect(reply.content)} 
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
                    <span>Type to filter</span><span>Enter to select</span>
                </div>
            </div>
         )}

         <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />

         <form onSubmit={handleSubmit} className="flex items-center bg-white border border-[#86efac] focus-within:border-[#22C55E] focus-within:ring-1 focus-within:ring-[#22C55E] rounded-full p-1.5 shadow-sm transition-all relative">
            <div className="flex items-center gap-1 pl-2">
                <button type="button" onClick={() => setIsMediaModalOpen(true)} className="text-slate-400 hover:text-slate-600 p-1.5 transition-colors">
                    <PaperClipIcon className="w-5 h-5" />
                </button>
                <button type="button" onClick={() => { setInputText(prev => prev + '/'); setShowTemplates(true); }} className="text-slate-400 font-mono font-bold hover:text-slate-600 p-1.5 text-lg leading-none transition-colors">
                    /
                </button>
            </div>
            <input 
               type="text" 
               value={inputText} 
               onChange={(e) => { 
                   setInputText(e.target.value); 
                   if (e.target.value.endsWith("/")) setShowTemplates(true); 
                   if (!e.target.value.includes("/")) setShowTemplates(false); 
               }} 
               placeholder="Type a message or use '/' for shortcuts..." 
               className="flex-1 bg-transparent border-none outline-none text-sm px-3 text-slate-800 placeholder:text-slate-400"
            />
            <div className="flex items-center gap-1.5 pr-1">
                <button type="button" onClick={() => setShowTemplates(!showTemplates)} className="text-[#22C55E] bg-green-50 rounded-full p-2 hover:bg-green-100 transition-colors flex items-center justify-center">
                    <BoltIcon className="w-5 h-5" />
                </button>
                <button type="button" onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="text-slate-400 hover:text-slate-600 p-1.5 transition-colors">
                    <FaceSmileIcon className="w-6 h-6" />
                </button>
                <button type="submit" disabled={!inputText.trim()} className="w-10 h-10 flex items-center justify-center bg-[#22C55E] text-white rounded-full hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md shrink-0">
                    <PaperAirplaneIcon className="w-4 h-4" />
                </button>
            </div>
         </form>
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
                    {filteredMedia.length > 0 ? (
                       <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                          {filteredMedia.map((item) => (
                             <div key={item.id} onClick={() => setSelectedMediaId(item.id)} className={`bg-white rounded-xl p-2 cursor-pointer transition-all border-2 ${selectedMediaId === item.id ? 'border-[#22C55E] shadow-md relative' : 'border-transparent shadow-sm hover:border-slate-200'}`}>
                                {selectedMediaId === item.id && <div className="absolute top-3 right-3 bg-white rounded-full z-10 shadow-sm"><SolidCheckCircle className="w-6 h-6 text-[#22C55E]" /></div>}
                                <div className="aspect-square bg-slate-50 rounded-lg mb-3 overflow-hidden flex items-center justify-center relative">
                                   {item.type === 'image' ? <img src={item.url} alt="" className="w-full h-full object-cover" /> : <div className="text-center text-blue-400"><DocumentIcon className="w-10 h-10 mx-auto mb-1"/><span className="text-[10px] font-bold uppercase">PDF</span></div>}
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
                       <div className="aspect-video bg-slate-50 rounded-xl mb-5 overflow-hidden flex items-center justify-center border border-slate-100">
                          {activeMedia?.type === 'image' ? <img src={activeMedia.url} alt="" className="w-full h-full object-cover" /> : <DocumentIcon className="w-16 h-16 text-blue-300" />}
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
                          <span key={label._id || label.id} className="flex items-center gap-1.5 px-3 py-1.5 border text-xs font-bold rounded-lg shadow-sm" style={{ backgroundColor: label.color + '15', color: label.color, borderColor: label.color + '30' }}>{label.name}<XMarkIcon className="w-3.5 h-3.5 cursor-pointer opacity-70 hover:opacity-100 transition-opacity" onClick={() => toggleLabel(label)}/></span>
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
                                 <span className="w-2 h-2 rounded-full shrink-0" style={{backgroundColor: label.color || '#94a3b8'}}></span><span className="text-sm font-medium text-slate-700 truncate">{label.name}</span>
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
                          <div className="flex items-center gap-3"><span className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: status.original?.color || '#cbd5e1'}}></span><span className={`text-sm font-bold ${selectedStatus === status.label.toLowerCase() ? 'text-slate-900' : 'text-slate-700'}`}>{status.label}</span></div>
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