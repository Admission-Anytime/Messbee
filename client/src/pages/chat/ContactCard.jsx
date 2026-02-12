import React, { useState, useEffect, useRef } from "react";
import { 
  FunnelIcon, 
  MagnifyingGlassIcon, 
  Cog6ToothIcon, 
  ChatBubbleOvalLeftEllipsisIcon,
  XMarkIcon,
  DocumentDuplicateIcon,
  ChevronRightIcon,
  UserPlusIcon,
  UserGroupIcon,
  AdjustmentsHorizontalIcon,
  UserCircleIcon,
  BuildingOfficeIcon,
  QuestionMarkCircleIcon
} from "@heroicons/react/24/outline";
import { CheckIcon, CheckCircleIcon } from "@heroicons/react/24/solid";

const TABS = ["All Chats", "Unassigned", "Open", "Closed", "Archived", "Pinned", "Blocked"];

// Mock Data
const LABEL_OPTIONS = ["Cold Lead", "Warm Lead", "Issue Raised", "Resolved", "Payment Pending", "Payment Received", "Invoice Sent"];
const TEAM_OPTIONS = ["Akshay Tomar", "Priyanshu", "Arshlan", "Unassigned"];
const STATUS_OPTIONS = ["open", "closed", "unassigned", "archived"];

const ContactCard = ({ chats, activeChatId, onChatSelect, activeTab, setActiveTab }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeMenu, setActiveMenu] = useState(null); // 'filter', 'settings', 'newChat'
  const menuRef = useRef(null);

  // --- FILTER STATES ---
  const [filterTab, setFilterTab] = useState("Labels");
  const [filterConfig, setFilterConfig] = useState({
    unreadOnly: false,
    openSession: false,
    selectedStatus: [],
    selectedLabels: [],
    selectedTeam: []
  });

  // Handle Click Outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (activeMenu === 'newChat' && event.target.closest('.new-chat-modal')) return;
      
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        // Only close if not clicking a toggle button
        if (!event.target.closest('button[data-toggle]')) {
            setActiveMenu(null);
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [activeMenu]);

  // --- FILTER LOGIC ---
  const toggleFilter = (category, value) => {
    setFilterConfig(prev => {
      const list = prev[category];
      const newList = list.includes(value) ? list.filter(item => item !== value) : [...list, value];
      return { ...prev, [category]: newList };
    });
  };

  const clearFilters = () => {
    setFilterConfig({ unreadOnly: false, openSession: false, selectedStatus: [], selectedLabels: [], selectedTeam: [] });
  };

  const displayChats = (chats || []).filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesUnread = filterConfig.unreadOnly ? c.unread > 0 : true;
    const matchesOpenSession = filterConfig.openSession ? c.openSession === true : true;
    const matchesStatus = filterConfig.selectedStatus.length > 0 ? filterConfig.selectedStatus.includes(c.chatStatus) : true;
    const matchesLabels = filterConfig.selectedLabels.length > 0 ? (c.labels || []).some(l => filterConfig.selectedLabels.includes(l)) : true;
    const matchesTeam = filterConfig.selectedTeam.length > 0 ? filterConfig.selectedTeam.includes(c.teamMember) : true;
    return matchesSearch && matchesUnread && matchesOpenSession && matchesStatus && matchesLabels && matchesTeam;
  });

  return (
    <div className="flex flex-col h-full bg-white relative">
      
      {/* 1. HEADER */}
      <div className="h-16 flex items-center justify-between px-6 shrink-0 bg-white border-b border-transparent z-40 relative">
         <h2 className="text-xl font-bold text-slate-900">Chats</h2>
         
         {/* Icons Group */}
         <div className="flex items-center gap-3 text-slate-500" ref={menuRef}>
            
            {/* 1. FILTER ICON */}
            <div className="relative">
                <button 
                    data-toggle="filter"
                    onClick={() => setActiveMenu(activeMenu === 'filter' ? null : 'filter')} 
                    className={`p-2 rounded-full hover:bg-slate-100 transition-colors ${activeMenu === 'filter' ? 'text-[#ba2525] bg-red-50' : 'hover:text-black'}`}
                    title="Filter"
                >
                    <FunnelIcon className="w-5 h-5" />
                </button>

                {/* Filter Dropdown */}
                {activeMenu === 'filter' && (
                    <div className="absolute right-[-80px] top-12 w-[320px] bg-white border border-slate-100 shadow-2xl rounded-xl z-50 animate-in fade-in zoom-in-95 duration-100 overflow-hidden ring-1 ring-black/5">
                        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-50 bg-white">
                            <span className="font-bold text-slate-800">Filter</span>
                            <div className="flex gap-2">
                                <button className="text-[10px] font-semibold text-slate-500 hover:text-slate-800 border px-2 py-1 rounded">Advance filter</button>
                                <button onClick={clearFilters} className="text-[10px] font-semibold text-red-500 hover:bg-red-50 border border-red-100 px-2 py-1 rounded">Clear</button>
                            </div>
                        </div>
                        <div className="flex gap-2 p-3 bg-slate-50/50">
                            <button onClick={() => setFilterConfig(p => ({...p, unreadOnly: !p.unreadOnly}))} className={`flex-1 flex items-center justify-between px-3 py-2 rounded-lg border text-xs font-bold transition-all ${filterConfig.unreadOnly ? "bg-white border-green-500 text-slate-800 shadow-sm" : "bg-white border-slate-200 text-slate-500"}`}>
                                Unread chats {filterConfig.unreadOnly ? <CheckCircleIcon className="w-4 h-4 text-green-500" /> : <div className="w-4 h-4 rounded-full border border-slate-200"></div>}
                            </button>
                            <button onClick={() => setFilterConfig(p => ({...p, openSession: !p.openSession}))} className={`flex-1 flex items-center justify-between px-3 py-2 rounded-lg border text-xs font-bold transition-all ${filterConfig.openSession ? "bg-white border-green-500 text-slate-800 shadow-sm" : "bg-white border-slate-200 text-slate-500"}`}>
                                Open session {filterConfig.openSession ? <CheckCircleIcon className="w-4 h-4 text-green-500" /> : <div className="w-4 h-4 rounded-full border border-slate-200"></div>}
                            </button>
                        </div>
                        <div className="flex border-b border-slate-100 px-3 pt-2 bg-white">
                            {['Status', 'Labels', 'Team'].map(tab => (
                                <button key={tab} onClick={() => setFilterTab(tab)} className={`flex-1 pb-2 text-xs font-bold text-center border-b-2 transition-colors ${filterTab === tab ? "border-green-500 text-green-600" : "border-transparent text-slate-400 hover:text-slate-600"}`}>{tab === 'Team' ? 'Team members' : tab}</button>
                            ))}
                        </div>
                        <div className="max-h-60 overflow-y-auto p-2 bg-white custom-scrollbar">
                            {filterTab === 'Labels' && LABEL_OPTIONS.map(label => (
                                <div key={label} onClick={() => toggleFilter('selectedLabels', label)} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg cursor-pointer group">
                                    <span className="text-sm text-slate-700 font-medium">{label}</span>
                                    {filterConfig.selectedLabels.includes(label) ? <CheckIcon className="w-5 h-5 text-green-500" /> : <div className="w-5 h-5 rounded-full border border-slate-200 group-hover:border-slate-300"></div>}
                                </div>
                            ))}
                            {filterTab === 'Team' && TEAM_OPTIONS.map(member => (
                                <div key={member} onClick={() => toggleFilter('selectedTeam', member)} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg cursor-pointer group">
                                    <span className="text-sm text-slate-700 font-medium">{member}</span>
                                    {filterConfig.selectedTeam.includes(member) ? <CheckIcon className="w-5 h-5 text-green-500" /> : <div className="w-5 h-5 rounded-full border border-slate-200 group-hover:border-slate-300"></div>}
                                </div>
                            ))}
                            {filterTab === 'Status' && STATUS_OPTIONS.map(status => (
                                <div key={status} onClick={() => toggleFilter('selectedStatus', status)} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg cursor-pointer group">
                                    <span className="text-sm text-slate-700 font-medium capitalize">{status}</span>
                                    {filterConfig.selectedStatus.includes(status) ? <CheckIcon className="w-5 h-5 text-green-500" /> : <div className="w-5 h-5 rounded-full border border-slate-200 group-hover:border-slate-300"></div>}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* 2. NEW CHAT (SMS) ICON */}
            <button 
                data-toggle="newChat"
                onClick={() => setActiveMenu('newChat')}
                className="p-2 rounded-full hover:bg-slate-100 hover:text-black transition-colors"
                title="New Chat"
            >
                <ChatBubbleOvalLeftEllipsisIcon className="w-5 h-5" />
            </button>

            {/* 3. SETTINGS ICON */}
            <div className="relative">
                <button 
                    data-toggle="settings"
                    onClick={() => setActiveMenu(activeMenu === 'settings' ? null : 'settings')}
                    className={`p-2 rounded-full hover:bg-slate-100 transition-colors ${activeMenu === 'settings' ? 'text-black bg-slate-100' : 'hover:text-black'}`}
                    title="Settings"
                >
                    <Cog6ToothIcon className="w-5 h-5" />
                </button>
                
                {/* --- UPDATED SETTINGS MENU --- */}
                {activeMenu === 'settings' && (
                    <div className="absolute right-0 top-12 w-56 bg-white border border-slate-100 shadow-xl rounded-lg py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                        <button className="w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 text-slate-700 font-medium flex gap-3 items-center">
                            <UserCircleIcon className="w-4 h-4 text-slate-400" /> User Profile
                        </button>
                        <button className="w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 text-slate-700 font-medium flex gap-3 items-center">
                            <BuildingOfficeIcon className="w-4 h-4 text-slate-400" /> Business Profile
                        </button>
                        <button className="w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 text-slate-700 font-medium flex gap-3 items-center">
                            <AdjustmentsHorizontalIcon className="w-4 h-4 text-slate-400" /> Chat Settings
                        </button>
                        
                        <div className="border-t border-slate-100 my-1"></div>
                        
                        <button className="w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 text-slate-700 font-medium flex gap-3 items-center">
                            <QuestionMarkCircleIcon className="w-4 h-4 text-slate-400" /> Help & Support
                        </button>
                    </div>
                )}
            </div>

         </div>
      </div>

      {/* --- NEW CHAT MODAL (Center Screen) --- */}
      {activeMenu === 'newChat' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
            <div className="new-chat-modal bg-white w-full max-w-[500px] rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col">
                
                {/* Modal Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                    <h3 className="text-lg font-bold text-slate-900">New Chat</h3>
                    <button onClick={() => setActiveMenu(null)} className="text-slate-400 hover:text-slate-700 p-1 rounded-full hover:bg-slate-100">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>

                {/* Modal Body */}
                <div className="p-6 space-y-5">
                    {/* Phone Input */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Contact WhatsApp number</label>
                        <div className="flex">
                            <span className="inline-flex items-center px-3 py-2 rounded-l-lg border border-r-0 border-slate-300 bg-slate-50 text-slate-500 text-sm font-medium">
                                +91
                            </span>
                            <input 
                                type="text" 
                                placeholder="Enter number" 
                                className="flex-1 min-w-0 block w-full px-3 py-2 rounded-r-lg border border-slate-300 text-sm focus:ring-green-500 focus:border-green-500 outline-none"
                            />
                        </div>
                    </div>

                    {/* Template Select */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Template</label>
                        <div className="relative">
                            <select className="block w-full pl-3 pr-10 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-green-500 focus:border-green-500 outline-none appearance-none bg-white text-slate-700">
                                <option>Select template</option>
                                <option>Welcome Message</option>
                                <option>Payment Reminder</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                                <ChevronRightIcon className="w-4 h-4 rotate-90" />
                            </div>
                        </div>
                    </div>

                    {/* Direct Link */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="block text-xs font-bold text-slate-500 uppercase">Direct chat link</label>
                            <a href="#" className="text-xs text-blue-500 hover:underline">How to use?</a>
                        </div>
                        <div className="flex items-center bg-slate-50 border border-slate-300 rounded-lg px-3 py-2">
                            <input 
                                type="text" 
                                readOnly
                                value="https://app.messbee.business/send?phone="
                                className="flex-1 bg-transparent border-none outline-none text-xs text-slate-500"
                            />
                            <button className="ml-2 text-slate-400 hover:text-slate-700">
                                <DocumentDuplicateIcon className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Modal Footer */}
                <div className="flex items-center justify-end gap-3 px-6 py-4 bg-slate-50 border-t border-slate-100">
                    <button 
                        onClick={() => setActiveMenu(null)}
                        className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
                    >
                        Cancel
                    </button>
                    <button className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 flex items-center gap-2 shadow-sm shadow-green-200">
                        <CheckCircleIcon className="w-4 h-4" /> Send
                    </button>
                </div>

            </div>
        </div>
      )}

      {/* 2. Search Bar */}
      <div className="px-5 pb-3 shrink-0">
         <div className="relative bg-[#f3f4f6] rounded-lg flex items-center px-4 py-2.5">
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 mr-3" />
            <input 
              type="text" 
              placeholder="Search here" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none text-sm text-gray-700 placeholder:text-gray-500"
            />
         </div>
      </div>

      {/* 3. Filter Tabs (Pills) */}
      <div className="px-5 pb-2 overflow-x-auto hide-scrollbar flex gap-2 shrink-0">
         {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                activeTab === tab 
                  ? "bg-gray-300 text-slate-800" 
                  : "bg-gray-100 text-slate-500 hover:bg-gray-200"
              }`}
            >
              {tab}
            </button>
         ))}
      </div>

      {/* 4. Chat List */}
      <div className="flex-1 overflow-y-auto">
         {displayChats.length > 0 ? displayChats.map((chat) => (
           <div 
             key={chat.id} 
             onClick={() => onChatSelect(chat.id)}
             className={`
               flex gap-3 px-5 py-4 border-b border-gray-50 cursor-pointer transition-all hover:bg-gray-50 relative
               ${activeChatId === chat.id ? "bg-[#e3fadd]" : ""}
             `}
           >
              <div className="relative shrink-0">
                <img src={chat.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                {chat.status === "active" && <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></span>}
              </div>

              <div className="flex-1 min-w-0 flex flex-col justify-center">
                 <div className="flex justify-between items-center mb-1">
                    <h4 className="text-sm font-bold text-slate-900 truncate">{chat.name}</h4>
                    <span className={`text-[10px] font-medium ${chat.unread > 0 ? "text-green-600" : "text-gray-500"}`}>{chat.time}</span>
                 </div>
                 <div className="flex justify-between items-center">
                    <p className={`text-xs truncate max-w-[180px] ${chat.unread > 0 ? "text-slate-800 font-semibold" : "text-gray-500"}`}>{chat.lastMsg}</p>
                    
                    {activeChatId === chat.id ? (
                        <div className="w-4 h-4 bg-green-600 rounded flex items-center justify-center shadow-sm">
                            <CheckIcon className="w-3 h-3 text-white" />
                        </div>
                    ) : chat.unread > 0 ? (
                        <span className="min-w-[1.25rem] h-5 px-1 bg-green-600 text-white text-[10px] font-bold flex items-center justify-center rounded-full shadow-sm">
                           {chat.unread}
                        </span>
                    ) : null}
                 </div>
              </div>
           </div>
         )) : (
            <div className="flex flex-col items-center justify-center h-40 text-slate-400 text-xs">
                <p>No results found.</p>
            </div>
         )}
      </div>
    </div>
  );
};

export default ContactCard;