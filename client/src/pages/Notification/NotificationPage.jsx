import React, { useState, useMemo } from "react";
import { 
  CheckCircleIcon, 
  TrashIcon, 
  MagnifyingGlassIcon,
  BellIcon,
  ChatBubbleLeftEllipsisIcon,
  ExclamationTriangleIcon,
  AtSymbolIcon,
  UserPlusIcon,
  ClockIcon,
  CheckBadgeIcon,
  ChevronDownIcon,
  ArrowTopRightOnSquareIcon,
  ArchiveBoxIcon,
  FunnelIcon
} from "@heroicons/react/24/outline";

// --- MOCK DATA ---
const MOCK_LOGS = [
  { 
    id: 1, type: 'chat', user: 'Sarah Miller', avatar: 'https://i.pravatar.cc/150?u=sarah', 
    title: 'Enterprise Plan Inquiry',
    message: 'Hi team, I am looking to upgrade to the Enterprise plan for my agency. Can you send over the pricing documentation and API limits?', 
    meta: [{ label: 'Source', value: 'Web Chat' }, { label: 'Region', value: 'North America' }],
    time: '10:42 AM', date: 'Today', isUnread: true, tag: 'Sales' 
  },
  { 
    id: 2, type: 'mention', user: 'David Chen', avatar: null, 
    title: 'Mentioned in Ticket #4829',
    message: 'Hey @Admission, could you check the webhook logs for this client? They are reporting a 403 error on callback.', 
    meta: [{ label: 'Priority', value: 'High' }],
    time: '09:15 AM', date: 'Today', isUnread: true, tag: 'Support' 
  },
  { 
    id: 3, type: 'system', user: 'System Alert', avatar: null, 
    title: 'Database Backup Successful',
    message: 'Daily automated backup completed successfully. Total size: 4.2GB. No errors reported.', 
    meta: [{ label: 'Server', value: 'AWS-East-1' }],
    time: '06:00 AM', date: 'Today', isUnread: false, tag: 'System' 
  },
  { 
    id: 4, type: 'lead', user: 'New Inbound Lead', avatar: null, 
    title: 'Lead from Google Ads',
    message: 'New contact via WhatsApp Widget. Interested in "Bulk Messaging" features.', 
    meta: [{ label: 'Campaign', value: 'Q1_Marketing' }],
    time: '04:30 PM', date: 'Yesterday', isUnread: false, tag: 'Marketing' 
  },
  { 
    id: 5, type: 'alert', user: 'API Credit Low', avatar: null, 
    title: 'Low Balance Warning',
    message: 'Your account balance has dropped below 1,000 credits. Auto-recharge is currently disabled.', 
    meta: [{ label: 'Balance', value: '980' }],
    time: '02:00 PM', date: 'Yesterday', isUnread: true, tag: 'Billing' 
  },
];

const NotificationPage = () => {
  const [logs, setLogs] = useState(MOCK_LOGS);
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState(null);

  // --- STATS ---
  const stats = {
    total: logs.length,
    unread: logs.filter(l => l.isUnread).length,
    critical: logs.filter(l => l.tag === 'Billing' || l.tag === 'System').length
  };

  // --- FILTERING ---
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const matchesSearch = log.message.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            log.user.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;
      if (activeFilter === "All") return true;
      if (activeFilter === "Unread") return log.isUnread;
      if (activeFilter === "System") return log.type === 'alert' || log.type === 'system';
      if (activeFilter === "Mentions") return log.type === 'mention';
      return true;
    });
  }, [logs, activeFilter, searchQuery]);

  // --- ACTIONS ---
  const handleCardClick = (id) => {
    setExpandedId(expandedId === id ? null : id);
    setLogs(prevLogs => prevLogs.map(log => log.id === id ? { ...log, isUnread: false } : log));
  };

  const markAllRead = () => setLogs(logs.map(l => ({ ...l, isUnread: false })));
  
  const deleteLog = (e, id) => {
    e.stopPropagation();
    setLogs(logs.filter(l => l.id !== id));
  };

  const markAsReadSingle = (e, id) => {
    e.stopPropagation();
    setLogs(logs.map(l => l.id === id ? { ...l, isUnread: false } : l));
  };

  // --- ICONS ---
  const renderAvatar = (log) => {
    if (log.avatar) return <img src={log.avatar} alt="" className="w-10 h-10 rounded-full object-cover border border-gray-200 shadow-sm" />;
    
    let Icon = CheckCircleIcon;
    let style = "bg-slate-100 text-slate-500";
    if (log.type === 'mention') { Icon = AtSymbolIcon; style = "bg-blue-100 text-blue-600"; }
    else if (log.type === 'alert') { Icon = ExclamationTriangleIcon; style = "bg-amber-100 text-amber-600"; }
    else if (log.type === 'lead') { Icon = UserPlusIcon; style = "bg-emerald-100 text-emerald-600"; }
    else if (log.type === 'system') { Icon = BellIcon; style = "bg-purple-100 text-purple-600"; }

    return (
      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${style} shadow-sm`}>
         <Icon className="w-5 h-5" />
      </div>
    );
  };

  return (
    <div className="flex-1 bg-[#F8FAFC] p-6 lg:p-10 font-['Urbanist'] w-full">
      <div className="w-full max-w-[1600px] mx-auto">
        
        {/* --- TITLE HEADER --- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
           <div>
              <h1 className="text-2xl font-bold text-slate-900">Activity Logs</h1>
              <p className="text-sm text-slate-500">Monitor your recent alerts and messages.</p>
           </div>
           
           <button 
             onClick={markAllRead} 
             className="px-4 py-2 bg-white border border-gray-200 text-slate-600 text-xs font-bold rounded-lg hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 transition-all shadow-sm flex items-center gap-2"
           >
              <CheckBadgeIcon className="w-4 h-4" /> Mark all read
           </button>
        </div>

        {/* --- NEW COMPACT STATS BAR --- */}
        {/* Unified container for a cleaner look */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-8 grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-100">
           
           {/* Total */}
           <div className="p-5 flex items-center justify-between group">
              <div>
                 <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total Events</p>
                 <h2 className="text-2xl font-black text-slate-800">{stats.total}</h2>
              </div>
              <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-slate-100 group-hover:text-slate-600 transition-colors">
                 <ArchiveBoxIcon className="w-5 h-5" />
              </div>
           </div>

           {/* Unread */}
           <div className="p-5 flex items-center justify-between group">
              <div>
                 <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Unread</p>
                 <h2 className="text-2xl font-black text-emerald-600">{stats.unread}</h2>
              </div>
              <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-100 transition-colors">
                 <ChatBubbleLeftEllipsisIcon className="w-5 h-5" />
              </div>
           </div>

           {/* Critical */}
           <div className="p-5 flex items-center justify-between group">
              <div>
                 <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Critical Alerts</p>
                 <h2 className="text-2xl font-black text-amber-500">{stats.critical}</h2>
              </div>
              <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-500 group-hover:bg-amber-100 transition-colors">
                 <ExclamationTriangleIcon className="w-5 h-5" />
              </div>
           </div>
        </div>

        {/* --- TOOLBAR (Filters + Search) --- */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6 sticky top-4 z-30">
           
           {/* Tabs */}
           <div className="bg-white p-1 rounded-lg border border-gray-200 shadow-sm flex w-full md:w-auto">
              {['All', 'Unread', 'Mentions', 'System'].map((tab) => (
                 <button 
                    key={tab} 
                    onClick={() => setActiveFilter(tab)} 
                    className={`flex-1 md:flex-none px-6 py-1.5 rounded-md text-sm font-bold transition-all ${activeFilter === tab ? 'bg-slate-800 text-white shadow-md' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}
                 >
                    {tab}
                 </button>
              ))}
           </div>

           {/* Search */}
           <div className="relative w-full md:w-80">
              <MagnifyingGlassIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Search activity..." 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
                className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm placeholder:text-slate-400" 
              />
           </div>
        </div>

        {/* --- LIST --- */}
        <div className="space-y-3 w-full">
           {filteredLogs.length > 0 ? (
              filteredLogs.map((log) => {
                 const isExpanded = expandedId === log.id;
                 return (
                    <div 
                      key={log.id} 
                      onClick={() => handleCardClick(log.id)}
                      className={`group relative bg-white rounded-xl border transition-all duration-200 cursor-pointer overflow-hidden w-full
                                 ${isExpanded ? 'border-emerald-500 shadow-lg ring-1 ring-emerald-500/20' : 'border-gray-200 hover:border-emerald-300 hover:shadow-md'}
                                 ${log.isUnread && !isExpanded ? 'bg-slate-50/40' : ''}`}
                    >
                       <div className="p-4 flex items-start gap-4">
                          {log.isUnread && <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500"></div>}

                          {renderAvatar(log)}

                          <div className="flex-1 min-w-0 pt-0.5">
                             <div className="flex justify-between items-start">
                                <div>
                                   <h4 className={`text-sm font-bold ${log.isUnread ? 'text-slate-900' : 'text-slate-700'}`}>
                                      {log.title}
                                   </h4>
                                   <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                                      {log.user} <span className="w-1 h-1 rounded-full bg-slate-300"></span> {log.date}
                                   </p>
                                </div>
                                <div className="flex items-center gap-3">
                                   <span className="text-xs font-semibold text-slate-400">{log.time}</span>
                                   
                                   <div className="hidden group-hover:flex items-center gap-1 opacity-100 transition-opacity">
                                      {log.isUnread && (
                                         <button onClick={(e) => markAsReadSingle(e, log.id)} className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors" title="Mark Read"><CheckCircleIcon className="w-4 h-4" /></button>
                                      )}
                                      <button onClick={(e) => deleteLog(e, log.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors" title="Delete"><TrashIcon className="w-4 h-4" /></button>
                                   </div>
                                   
                                   <ChevronDownIcon className={`w-4 h-4 text-slate-300 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                                </div>
                             </div>
                             
                             {!isExpanded && (
                                <p className={`mt-2 text-sm truncate ${log.isUnread ? 'text-slate-800 font-medium' : 'text-slate-500'}`}>
                                   {log.message}
                                </p>
                             )}
                          </div>
                       </div>

                       <div className={`transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-96 opacity-100 border-t border-gray-100' : 'max-h-0 opacity-0'}`}>
                          <div className="p-5 bg-slate-50/30">
                             <p className="text-sm text-slate-700 leading-relaxed">
                                {log.message}
                             </p>
                             
                             {log.meta && (
                                <div className="flex flex-wrap gap-2 mt-4">
                                   {log.meta.map((item, idx) => (
                                      <div key={idx} className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-md shadow-sm">
                                         <span className="text-[10px] font-bold text-slate-400 uppercase">{item.label}</span>
                                         <span className="text-xs font-semibold text-slate-700">{item.value}</span>
                                      </div>
                                   ))}
                                </div>
                             )}

                             <div className="flex items-center justify-end gap-3 mt-5 pt-4 border-t border-gray-100">
                                <button onClick={(e) => deleteLog(e, log.id)} className="text-xs font-bold text-red-500 hover:text-red-700 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors">
                                   Remove Log
                                </button>
                                <button className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center gap-2">
                                   View Context <ArrowTopRightOnSquareIcon className="w-3 h-3" />
                                </button>
                             </div>
                          </div>
                       </div>
                    </div>
                 );
              })
           ) : (
              <div className="flex flex-col items-center justify-center py-20 opacity-60">
                 <ArchiveBoxIcon className="w-12 h-12 text-slate-300 mb-2" />
                 <p className="text-slate-500 font-medium">No notifications found.</p>
              </div>
           )}
        </div>

      </div>
    </div>
  );
};

export default NotificationPage;