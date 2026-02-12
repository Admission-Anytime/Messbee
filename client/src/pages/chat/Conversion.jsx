import React, { useState, useEffect, useRef } from "react";
import { 
  PaperClipIcon, FaceSmileIcon, PhoneIcon, EllipsisVerticalIcon,
  TrashIcon, NoSymbolIcon, UserCircleIcon, 
  FolderIcon, ArchiveBoxIcon, LockClosedIcon, StarIcon, CheckCircleIcon,
  MagnifyingGlassIcon, DocumentTextIcon, XMarkIcon, ChatBubbleLeftRightIcon
} from "@heroicons/react/24/outline";
import { PaperAirplaneIcon } from "@heroicons/react/24/solid";
import EmojiPicker from "emoji-picker-react"; 

// Mock Templates Data
const TEMPLATES = [
  "👋 Welcome Message",
  "💸 Payment Reminder",
  "✅ Issue Resolved",
  "📍 Address Request"
];

const Conversion = ({ data, onSendMessage, onBack, onToggleProfile, onClearChat, onDeleteChat, onUpdateStatus }) => {
  const [inputText, setInputText] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false); 
  
  // --- NEW STATES ---
  const [isPrivateMode, setIsPrivateMode] = useState(false); 
  const [isSearchOpen, setIsSearchOpen] = useState(false);   
  
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText); 
    setInputText("");
    setShowEmojiPicker(false);
    setShowTemplates(false);
  };

  const onEmojiClick = (emojiObject) => {
    setInputText((prev) => prev + emojiObject.emoji);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) alert(`Selected file: ${file.name}`); 
  };

  const handleTemplateSelect = (template) => {
    setInputText(template);
    setShowTemplates(false);
  };

  return (
    <div className="flex flex-col h-full relative bg-white">
      
      {/* 1. HEADER */}
      <div className="h-20 px-6 bg-white border-b border-gray-100 flex items-center justify-between shrink-0 z-20 relative">
         
         {/* Search Overlay */}
         {isSearchOpen ? (
            <div className="flex-1 flex items-center gap-3 animate-in fade-in duration-200">
                <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
                <input 
                    type="text" 
                    placeholder="Search in conversation..." 
                    className="flex-1 border-none outline-none text-sm text-slate-700 placeholder:text-slate-400 h-full py-2"
                    autoFocus
                />
                <button onClick={() => setIsSearchOpen(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-500">
                    <XMarkIcon className="w-5 h-5" />
                </button>
            </div>
         ) : (
             <>
                 <div className="flex items-center gap-4 cursor-pointer" onClick={onToggleProfile}>
                    <button onClick={(e) => { e.stopPropagation(); onBack(); }} className="md:hidden text-slate-500">
                       <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <img src={data.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                    <div>
                       <h3 className="text-base font-bold text-slate-900">{data.name}</h3>
                       <span className="text-xs text-gray-400 capitalize">{data.chatStatus} {data.isPinned && "• Pinned"} {data.isBlocked && "• Blocked"}</span>
                    </div>
                 </div>
                 
                 <div className="flex items-center gap-3 text-gray-500">
                    
                    {/* SEARCH ICON */}
                    <div className="relative group">
                        <button onClick={() => setIsSearchOpen(true)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                            <MagnifyingGlassIcon className="w-5 h-5" />
                        </button>
                        <span className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                            Search Chat
                        </span>
                    </div>

                    {/* PRIVATE CHAT TOGGLE */}
                    <div className="relative group">
                        <button 
                            onClick={() => setIsPrivateMode(!isPrivateMode)} 
                            className={`p-2 rounded-full transition-colors ${isPrivateMode ? "bg-amber-100 text-amber-600" : "hover:bg-slate-100"}`}
                        >
                            {isPrivateMode ? <LockClosedIcon className="w-5 h-5" /> : <ChatBubbleLeftRightIcon className="w-5 h-5" />}
                        </button>
                        <span className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                            {isPrivateMode ? "Switch to Public" : "Private Note"}
                        </span>
                    </div>

                    <div className="w-px h-6 bg-gray-200 mx-1"></div>

                    <PhoneIcon className="w-5 h-5 cursor-pointer hover:text-black" />
                    
                    {/* --- RESTORED 3-DOT MENU --- */}
                    <div className="relative" ref={menuRef}>
                        <button 
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className={`p-1 rounded-full transition-colors ${isMenuOpen ? "bg-slate-100 text-black" : "hover:text-black"}`}
                        >
                            <EllipsisVerticalIcon className="w-5 h-5 cursor-pointer" />
                        </button>

                        {isMenuOpen && (
                            <div className="absolute right-0 top-10 w-56 bg-white border border-slate-100 shadow-xl rounded-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100 origin-top-right">
                                
                                <div className="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">Move To</div>
                                
                                <button onClick={() => { onUpdateStatus("unassigned"); setIsMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                                    <FolderIcon className="w-4 h-4 text-gray-400" /> Unassigned
                                </button>
                                <button onClick={() => { onUpdateStatus("open"); setIsMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                                    <CheckCircleIcon className="w-4 h-4 text-green-500" /> Open
                                </button>
                                <button onClick={() => { onUpdateStatus("closed"); setIsMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                                    <CheckCircleIcon className="w-4 h-4 text-gray-400" /> Closed
                                </button>
                                <button onClick={() => { onUpdateStatus("archived"); setIsMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                                    <ArchiveBoxIcon className="w-4 h-4 text-blue-400" /> Archived
                                </button>

                                <div className="border-t border-slate-100 my-1"></div>
                                <div className="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">Actions</div>

                                <button onClick={() => { onUpdateStatus("pinned"); setIsMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                                    <StarIcon className={`w-4 h-4 ${data.isPinned ? "fill-yellow-400 text-yellow-400" : "text-gray-400"}`} /> 
                                    {data.isPinned ? "Unpin Chat" : "Pin Chat"}
                                </button>
                                <button onClick={() => { onUpdateStatus("blocked"); setIsMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                                    <LockClosedIcon className={`w-4 h-4 ${data.isBlocked ? "text-red-500" : "text-gray-400"}`} /> 
                                    {data.isBlocked ? "Unblock Contact" : "Block Contact"}
                                </button>

                                <div className="border-t border-slate-100 my-1"></div>
                                
                                <button onClick={() => { onToggleProfile(); setIsMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                                    <UserCircleIcon className="w-4 h-4" /> Contact Info
                                </button>
                                <button onClick={() => { onClearChat && onClearChat(); setIsMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                                    <NoSymbolIcon className="w-4 h-4" /> Clear Chat
                                </button>
                                <button onClick={() => { onDeleteChat && onDeleteChat(); setIsMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 font-medium">
                                    <TrashIcon className="w-4 h-4" /> Delete Chat
                                </button>
                            </div>
                        )}
                    </div>
                 </div>
             </>
         )}
      </div>

      {/* 2. MESSAGES AREA */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 z-10 bg-slate-50/30">
         {data.messages.map((msg, index) => (
           <div key={index} className={`flex flex-col ${msg.sender === "me" ? "items-end" : "items-start"}`}>
              <div 
                className={`
                  relative px-5 py-3 text-sm rounded-lg max-w-[70%] font-medium shadow-sm
                  ${msg.sender === "me" 
                    ? "bg-[#86efac] text-slate-900 rounded-tr-none" 
                    : "bg-white text-slate-800 rounded-tl-none border border-gray-100" 
                  }
                `}
              >
                 <p className="leading-relaxed">{msg.text}</p>
              </div>
           </div>
         ))}
         <div ref={messagesEndRef} />
      </div>

      {/* 3. FOOTER */}
      <div className={`p-5 z-20 relative transition-colors duration-300 ${isPrivateMode ? "bg-amber-50/50" : "bg-white"}`}>
         
         {/* Emoji Picker */}
         {showEmojiPicker && (
            <div className="absolute bottom-20 right-10 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-200" ref={emojiRef}>
               <EmojiPicker onEmojiClick={onEmojiClick} height={400} width={300} />
            </div>
         )}

         {/* Template Picker */}
         {showTemplates && (
            <div className="absolute bottom-20 left-10 w-64 bg-white border border-slate-200 shadow-2xl rounded-xl z-50 animate-in fade-in slide-in-from-bottom-2 duration-200 overflow-hidden" ref={templateRef}>
                <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase">Select Template</div>
                <div className="max-h-48 overflow-y-auto">
                    {TEMPLATES.map((tpl, i) => (
                        <button key={i} onClick={() => handleTemplateSelect(tpl)} className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 border-b border-slate-50 last:border-0 transition-colors">
                            {tpl}
                        </button>
                    ))}
                </div>
            </div>
         )}

         <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />

         {/* Typing Bar */}
         <form onSubmit={handleSubmit} className={`flex items-center gap-3 rounded-xl px-4 py-3 border transition-all ${isPrivateMode ? "bg-amber-100 border-amber-200" : "bg-[#f3f4f6] border-transparent"}`}>
            
            {/* TEMPLATES BUTTON (With Tooltip) */}
            <div className="relative group">
                <button 
                    type="button" 
                    onClick={() => setShowTemplates(!showTemplates)} 
                    className={`p-1.5 rounded-md transition-colors ${showTemplates ? "bg-black/10 text-black" : "text-slate-500 hover:text-black"}`}
                >
                    <DocumentTextIcon className="w-5 h-5" />
                </button>
                <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                    Use Template
                </span>
            </div>

            <div className="w-px h-5 bg-slate-300 mx-1"></div>

            <input 
               type="text" 
               value={inputText} 
               onChange={(e) => setInputText(e.target.value)} 
               placeholder={isPrivateMode ? "Add a private note (internal only)..." : "Write Message..."} 
               className={`flex-1 bg-transparent border-none outline-none text-sm font-medium ${isPrivateMode ? "text-amber-900 placeholder:text-amber-500" : "text-slate-700 placeholder:text-slate-500"}`}
            />

            <div className="flex items-center gap-4 text-slate-500">
               <div className="relative group">
                   <button type="button" onClick={() => fileInputRef.current.click()} className="hover:text-black transition-colors">
                     <PaperClipIcon className="w-5 h-5" />
                   </button>
                   <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                       Attach File
                   </span>
               </div>

               <div className="relative group">
                   <button type="button" onClick={() => setShowEmojiPicker(!showEmojiPicker)} className={`transition-colors ${showEmojiPicker ? 'text-[#ba2525]' : 'hover:text-black'}`}>
                     <FaceSmileIcon className="w-5 h-5" />
                   </button>
               </div>
               
               <button type="submit" className={`p-2 rounded-lg text-white transition-colors shadow-sm ${isPrivateMode ? "bg-amber-500 hover:bg-amber-600" : "bg-[#86efac] hover:bg-green-400"}`}>
                  <PaperAirplaneIcon className={`w-4 h-4 -rotate-45 translate-x-0.5 -translate-y-0.5 ${isPrivateMode ? "text-white" : "text-black"}`} />
               </button>
            </div>
         </form>
         
         {/* Private Mode Indicator */}
         {isPrivateMode && (
             <div className="absolute bottom-1 left-0 right-0 text-center">
                 <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-t-md border-t border-x border-amber-200">PRIVATE NOTE MODE</span>
             </div>
         )}
      </div>

    </div>
  );
};

export default Conversion;