import React, { useState, useEffect, useMemo, useContext } from "react";
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
import NotificationApi from "../../services/NotificationApi";
import { userContext } from "../../context/Context";
import toast from "react-hot-toast";

const NotificationPage = () => {
  const { socket } = useContext(userContext);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 });
  const [unreadCount, setUnreadCount] = useState(0);

  // --- LOAD NOTIFICATIONS ON MOUNT ---
  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, []);

  // --- LISTEN FOR REAL-TIME NOTIFICATIONS ---
  useEffect(() => {
    if (!socket) return;

    socket.on('new_notification', (notification) => {
      console.log('🔔 New notification received:', notification);
      // Add to top of list
      setNotifications(prev => [notification, ...prev]);
      // Update unread count
      setUnreadCount(prev => prev + 1);
      // Show toast
      toast.success(`${notification.title}`);
    });

    return () => {
      socket.off('new_notification');
    };
  }, [socket]);

  // --- FETCH NOTIFICATIONS ---
  const fetchNotifications = async (page = 1, isRead = null) => {
    try {
      setLoading(true);
      const response = await NotificationApi.getNotifications(page, 10, isRead);
      if (response.success) {
        setNotifications(response.data);
        setPagination(response.pagination);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  // --- FETCH UNREAD COUNT ---
  const fetchUnreadCount = async () => {
    try {
      const response = await NotificationApi.getUnreadCount();
      if (response.success) {
        setUnreadCount(response.data.unreadCount);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  // --- STATS ---
  const stats = {
    total: pagination.total || 0,
    unread: unreadCount,
    critical: notifications.filter(n => n.type === 'alert' || n.type === 'system').length
  };

  // --- FILTERING ---
  const filteredNotifications = useMemo(() => {
    return notifications.filter(notif => {
      const matchesSearch = notif.message.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            notif.title.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;
      if (activeFilter === "All") return true;
      if (activeFilter === "Unread") return !notif.isRead;
      if (activeFilter === "System") return notif.type === 'alert' || notif.type === 'system';
      if (activeFilter === "Mentions") return notif.type === 'mention';
      return true;
    });
  }, [notifications, activeFilter, searchQuery]);

  // --- ACTIONS ---
  const handleCardClick = async (id) => {
    setExpandedId(expandedId === id ? null : id);
    // Mark as read
    const notif = notifications.find(n => n._id === id);
    if (notif && !notif.isRead) {
      try {
        await NotificationApi.markAsRead(id);
        setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    }
  };

  const markAllRead = async () => {
    try {
      await NotificationApi.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success('All marked as read');
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast.error('Failed to mark all as read');
    }
  };
  
  const deleteNotification = async (e, id) => {
    e.stopPropagation();
    try {
      await NotificationApi.deleteNotification(id);
      setNotifications(prev => prev.filter(n => n._id !== id));
      const notif = notifications.find(n => n._id === id);
      if (notif && !notif.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      toast.success('Notification deleted');
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Failed to delete notification');
    }
  };

  const markAsReadSingle = async (e, id) => {
    e.stopPropagation();
    try {
      await NotificationApi.markAsRead(id);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // --- FORMAT TIME ---
  const formatTime = (date) => {
    const now = new Date();
    const notifDate = new Date(date);
    const diffMs = now - notifDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return notifDate.toLocaleDateString();
  };

  // --- ICONS ---
  const renderAvatar = (notif) => {
    const typeConfig = {
      chat: { Icon: ChatBubbleLeftEllipsisIcon, style: "bg-blue-100 text-blue-600" },
      mention: { Icon: AtSymbolIcon, style: "bg-blue-100 text-blue-600" },
      system: { Icon: BellIcon, style: "bg-purple-100 text-purple-600" },
      alert: { Icon: ExclamationTriangleIcon, style: "bg-amber-100 text-amber-600" },
      lead: { Icon: UserPlusIcon, style: "bg-emerald-100 text-emerald-600" },
      campaign: { Icon: BellIcon, style: "bg-indigo-100 text-indigo-600" },
      contact: { Icon: UserPlusIcon, style: "bg-emerald-100 text-emerald-600" }
    };

    const config = typeConfig[notif.type] || typeConfig.system;
    const { Icon, style } = config;

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
           {loading ? (
              <div className="flex items-center justify-center py-20">
                 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
              </div>
           ) : filteredNotifications.length > 0 ? (
              filteredNotifications.map((notif) => {
                 const isExpanded = expandedId === notif._id;
                 return (
                    <div 
                      key={notif._id} 
                      onClick={() => handleCardClick(notif._id)}
                      className={`group relative bg-white rounded-xl border transition-all duration-200 cursor-pointer overflow-hidden w-full
                                 ${isExpanded ? 'border-emerald-500 shadow-lg ring-1 ring-emerald-500/20' : 'border-gray-200 hover:border-emerald-300 hover:shadow-md'}
                                 ${!notif.isRead && !isExpanded ? 'bg-slate-50/40' : ''}`}
                    >
                       <div className="p-4 flex items-start gap-4">
                          {!notif.isRead && <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500"></div>}

                          {renderAvatar(notif)}

                          <div className="flex-1 min-w-0 pt-0.5">
                             <div className="flex justify-between items-start">
                                <div>
                                   <h4 className={`text-sm font-bold ${!notif.isRead ? 'text-slate-900' : 'text-slate-700'}`}>
                                      {notif.title}
                                   </h4>
                                   <p className="text-xs text-slate-500 mt-0.5">
                                      {notif.type.toUpperCase()}
                                   </p>
                                </div>
                                <div className="flex items-center gap-3">
                                   <span className="text-xs font-semibold text-slate-400">{formatTime(notif.createdAt)}</span>
                                   
                                   <div className="hidden group-hover:flex items-center gap-1 opacity-100 transition-opacity">
                                      {!notif.isRead && (
                                         <button onClick={(e) => markAsReadSingle(e, notif._id)} className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors" title="Mark Read"><CheckCircleIcon className="w-4 h-4" /></button>
                                      )}
                                      <button onClick={(e) => deleteNotification(e, notif._id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors" title="Delete"><TrashIcon className="w-4 h-4" /></button>
                                   </div>
                                   
                                   <ChevronDownIcon className={`w-4 h-4 text-slate-300 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                                </div>
                             </div>
                             
                             {!isExpanded && (
                                <p className={`mt-2 text-sm truncate ${!notif.isRead ? 'text-slate-800 font-medium' : 'text-slate-500'}`}>
                                   {notif.message}
                                </p>
                             )}
                          </div>
                       </div>

                       <div className={`transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-96 opacity-100 border-t border-gray-100' : 'max-h-0 opacity-0'}`}>
                          <div className="p-5 bg-slate-50/30">
                             <p className="text-sm text-slate-700 leading-relaxed">
                                {notif.message}
                             </p>
                             
                             {notif.meta && notif.meta.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-4">
                                   {notif.meta.map((item, idx) => (
                                      <div key={idx} className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-md shadow-sm">
                                         <span className="text-[10px] font-bold text-slate-400 uppercase">{item.label}</span>
                                         <span className="text-xs font-semibold text-slate-700">{item.value}</span>
                                      </div>
                                   ))}
                                </div>
                             )}

                             <div className="flex items-center justify-end gap-3 mt-5 pt-4 border-t border-gray-100">
                                <button onClick={(e) => deleteNotification(e, notif._id)} className="text-xs font-bold text-red-500 hover:text-red-700 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors">
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