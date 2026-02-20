import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom"; 
import { 
  Bars3Icon, 
  BellIcon, 
  QuestionMarkCircleIcon, 
  Cog6ToothIcon,
  WalletIcon,
  ArrowRightOnRectangleIcon,
  UserIcon,
  BuildingOfficeIcon,
  DocumentTextIcon,
  AtSymbolIcon,
  UserPlusIcon,
  ExclamationTriangleIcon,
  ArrowTopRightOnSquareIcon,
  XMarkIcon // ✅ Imported Close Icon
} from "@heroicons/react/24/outline"; 

// --- ASSETS ---
import logoIcon from "../../assets/MessBee Logo.png"; 
import logoName from "../../assets/MessBee Name.png";

// --- MOCK INITIAL DATA ---
const INITIAL_NOTIFICATIONS = [
  {
    id: 1,
    type: 'chat',
    user: 'Sarah Miller',
    avatar: 'https://i.pravatar.cc/150?u=sarah',
    message: '"Hi there! I\'m interested in the premium API plan. Could you send over pricing?"',
    time: '2m ago',
    tag: 'Sales Inquiry',
    isUnread: true
  },
  {
    id: 2,
    type: 'mention',
    user: 'David Chen',
    avatar: null, 
    message: 'mentioned you in Ticket #4829: @Felix could you take a look at the logs?',
    time: '15m ago',
    isUnread: true 
  },
  {
    id: 3,
    type: 'lead',
    user: 'New Inbound Lead',
    avatar: null,
    message: 'Marketing Source: Google Ads. Contacted via WhatsApp Widget.',
    time: '1h ago',
    isUnread: true
  },
  {
    id: 4,
    type: 'alert',
    user: 'API Credit Low',
    avatar: null,
    message: 'Your account has less than 1,000 messages remaining. Please top up soon.',
    time: '4h ago',
    isUnread: true
  }
];

const MainHeading = ({ onMenuClick }) => {
  const navigate = useNavigate(); 
  
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [activeTab, setActiveTab] = useState("All");

  const profileRef = useRef(null);
  const notifRef = useRef(null);

  const [userProfile, setUserProfile] = useState({
    name: "Admission Anytime",
    email: "admin@admissionanytime.com", 
    phone: "9910700098", 
    credits: "618.51", 
    avatar: "https://i.pravatar.cc/150?u=admission" 
  });

  // --- LOGIC: DYNAMIC COUNTS ---
  
  // 1. Bell Badge: Counts ALL unread items regardless of type
  const totalUnreadCount = notifications.filter(n => n.isUnread).length;

  // 2. Tab Specific Counts (Total items in that category, read or unread)
  const mentionCount = notifications.filter(n => n.type === 'mention').length;
  const systemCount = notifications.filter(n => n.type === 'alert' || n.type === 'lead').length;

  // --- LOGIC: LOGOUT ---
  const handleSignOut = () => {
    localStorage.clear(); // Clear all stored data
    sessionStorage.clear(); // Clear session data
    navigate("/login"); // Redirect to login page
  };

  const filteredNotifications = useMemo(() => {
    switch(activeTab) {
        case '@Mentions':
            return notifications.filter(n => n.type === 'mention');
        case 'System':
            return notifications.filter(n => n.type === 'alert' || n.type === 'lead');
        case 'All':
        default:
            return notifications;
    }
  }, [activeTab, notifications]);

  const markAllAsRead = () => {
    const updated = notifications.map(n => ({ ...n, isUnread: false }));
    setNotifications(updated);
  };

  const handleNotificationClick = (id) => {
    const updated = notifications.map(n => n.id === id ? { ...n, isUnread: false } : n);
    setNotifications(updated);
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const renderNotifIcon = (notif) => {
     if (notif.type === 'chat') return <img src={notif.avatar} className="w-10 h-10 rounded-full object-cover" alt="" />;
     if (notif.type === 'mention') return <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center"><AtSymbolIcon className="w-5 h-5" /></div>;
     if (notif.type === 'lead') return <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center"><UserPlusIcon className="w-5 h-5" /></div>;
     if (notif.type === 'alert') return <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center"><ExclamationTriangleIcon className="w-5 h-5" /></div>;
     return null;
  };

  return (
    <div className="w-full flex items-center justify-between px-4 lg:px-6 py-2 bg-white border-b border-gray-100 shadow-sm sticky top-0 z-50 font-['Urbanist'] h-[70px]">
      
      {/* --- LEFT: LOGO SECTION --- */}
      <div className="flex items-center gap-4 shrink-0">
        <button onClick={onMenuClick} className="lg:hidden p-2 text-slate-500 hover:bg-slate-50 rounded-lg transition-colors">
          <Bars3Icon className="w-6 h-6" />
        </button>

        <div onClick={() => navigate('/admin/dashboard')} className="flex items-center gap-2 cursor-pointer" title="Go to Dashboard">
            <img src={logoIcon} alt="MessBee Logo" className="w-8 h-8 object-contain" />
            <img src={logoName} alt="MessBee Name" className="h-6 w-auto object-contain mt-1" />
        </div>
      </div>

      {/* --- CENTER: SEARCH BAR --- */}
      <div className="flex-1 max-w-xl mx-6 hidden md:block">
         <div className="w-full h-10 bg-[#F1F5F9] rounded-lg border border-transparent focus-within:border-gray-300 focus-within:bg-white transition-all relative flex items-center group">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-gray-400 ml-3 group-focus-within:text-gray-600">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input type="text" className="w-full h-full bg-transparent rounded-lg px-3 text-sm text-gray-700 placeholder-gray-400 focus:outline-none font-medium" placeholder="Search conversations, contacts..." />
         </div>
      </div>

      {/* --- RIGHT: STATUS, CREDITS & PROFILE --- */}
      <div className="flex items-center gap-4 shrink-0">
        
        <button onClick={() => navigate('/admin/developer/api')} className="hidden xl:flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-full border border-emerald-100 hover:bg-emerald-100 transition-all cursor-pointer group">
           <span className="relative flex h-2 w-2">
             <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
             <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
           </span>
           <div className="flex flex-col leading-none items-start">
             <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-wide group-hover:text-emerald-700">API Status</span>
             <span className="text-[10px] font-bold text-emerald-700">Online</span>
           </div>
        </button>

        <button onClick={() => navigate('/admin/plan/billing')} className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-full border border-gray-200 hover:bg-gray-100 transition-all cursor-pointer group">
           <WalletIcon className="w-4 h-4 text-slate-500 group-hover:text-slate-700" />
           <div className="flex flex-col leading-none items-start">
             <span className="text-[9px] font-bold text-slate-400 uppercase group-hover:text-slate-500">Credits</span>
             <span className="text-[11px] font-bold text-slate-800">₹{userProfile.credits}</span>
           </div>
        </button>

        <div className="h-8 w-[1px] bg-gray-200 hidden md:block mx-1"></div>

        <div className="flex items-center gap-1 text-slate-500">
           
           {/* 1. NOTIFICATION DROPDOWN */}
           <div className="relative" ref={notifRef}>
              <button 
                 onClick={() => setIsNotifOpen(!isNotifOpen)} 
                 className={`p-2 rounded-full hover:bg-slate-50 hover:text-slate-800 transition-colors relative ${isNotifOpen ? 'bg-slate-50 text-slate-900' : ''}`}
              >
                 <BellIcon className="w-6 h-6" />
                 {/* COUNTER: Counts ALL unread */}
                 {totalUnreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex items-center justify-center min-w-[16px] h-4 px-0.5 bg-red-500 text-white text-[9px] font-bold rounded-full border-2 border-white shadow-sm">
                       {totalUnreadCount > 9 ? '9+' : totalUnreadCount}
                    </span>
                 )}
              </button>

              {isNotifOpen && (
                 <div className="absolute right-0 top-full mt-3 w-[380px] bg-white rounded-xl shadow-2xl border border-gray-100 z-[70] animate-in fade-in slide-in-from-top-2 duration-200 overflow-hidden">
                    <div className="px-5 pt-5 pb-2">
                       <div className="flex justify-between items-center mb-4">
                          <h3 className="text-lg font-bold text-slate-900">Notifications</h3>
                          <div className="flex items-center gap-3">
                             {totalUnreadCount > 0 && (
                                 <button onClick={markAllAsRead} className="text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:underline">
                                    Mark all as read
                                 </button>
                             )}
                             {/* ✅ CLOSE BUTTON */}
                             <button onClick={() => setIsNotifOpen(false)} className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1 rounded-md transition-colors">
                                <XMarkIcon className="w-5 h-5" />
                             </button>
                          </div>
                       </div>
                       
                       {/* Tabs with Dynamic Counts */}
                       <div className="flex gap-6 border-b border-gray-100 text-sm font-medium">
                          {['All', '@Mentions', 'System'].map((tab) => {
                             // Determine count for label
                             let count = 0;
                             if(tab === 'All') count = notifications.length;
                             if(tab === '@Mentions') count = mentionCount;
                             if(tab === 'System') count = systemCount;

                             return (
                                <button 
                                   key={tab}
                                   onClick={() => setActiveTab(tab)}
                                   className={`pb-3 border-b-2 transition-colors ${activeTab === tab ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
                                >
                                   {tab} <span className="text-xs opacity-70">({count})</span>
                                </button>
                             );
                          })}
                       </div>
                    </div>

                    <div className="max-h-[400px] overflow-y-auto">
                       <div className="px-5 py-2">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 mt-2">Recently</p>
                          
                          {filteredNotifications.length === 0 ? (
                             <div className="py-8 text-center text-slate-400 text-sm">No notifications found</div>
                          ) : (
                             <div className="space-y-4">
                                {filteredNotifications.map((notif) => (
                                   <div 
                                     key={notif.id} 
                                     onClick={() => handleNotificationClick(notif.id)}
                                     className={`flex gap-3 group cursor-pointer p-2 rounded-lg transition-colors ${notif.isUnread ? 'bg-emerald-50/50' : 'hover:bg-slate-50'}`}
                                   >
                                      <div className="shrink-0 pt-1">
                                         {renderNotifIcon(notif)}
                                      </div>
                                      <div className="flex-1">
                                         <div className="flex justify-between items-start mb-0.5">
                                            <h4 className={`text-sm font-bold transition-colors ${notif.isUnread ? 'text-slate-900' : 'text-slate-700'}`}>{notif.user}</h4>
                                            <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap ml-2">{notif.time}</span>
                                         </div>
                                         <p className={`text-xs leading-relaxed mb-1.5 line-clamp-2 ${notif.isUnread ? 'text-slate-800 font-medium' : 'text-slate-500'}`}>{notif.message}</p>
                                         {notif.tag && (
                                            <span className="inline-block px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded border border-slate-200">{notif.tag}</span>
                                         )}
                                      </div>
                                      {notif.isUnread && <div className="w-2 h-2 rounded-full bg-emerald-500 mt-2 shrink-0"></div>}
                                   </div>
                                ))}
                             </div>
                          )}
                       </div>
                       
                       <div className="p-4 border-t border-gray-50 bg-gray-50/50">
                          <button onClick={() => navigate('/admin/notifications')} className="w-full py-2.5 bg-white border border-gray-200 rounded-lg shadow-sm text-sm font-bold text-slate-700 flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors">
                             View all activity logs
                             <ArrowTopRightOnSquareIcon className="w-4 h-4 text-slate-400" />
                          </button>
                       </div>
                    </div>
                 </div>
              )}
           </div>
           
           <button onClick={() => navigate('/admin/help/support')} className="p-2 rounded-full hover:bg-slate-50 hover:text-slate-800 transition-colors">
              <QuestionMarkCircleIcon className="w-6 h-6" />
           </button>
           
           <button onClick={() => navigate('/admin/settings/whatsapp')} className="p-2 rounded-full hover:bg-slate-50 hover:text-slate-800 transition-colors">
              <Cog6ToothIcon className="w-6 h-6" />
           </button>
        </div>

        {/* PROFILE DROPDOWN */}
        <div className="relative" ref={profileRef}>
           <div onClick={() => setIsProfileOpen(!isProfileOpen)} className="flex items-center gap-3 cursor-pointer hover:bg-slate-50 p-1 rounded-lg transition-colors border border-transparent hover:border-slate-100">
              <img src={userProfile.avatar} alt="Profile" className="w-9 h-9 rounded-full object-cover border border-gray-200 shadow-sm" />
              <div className="hidden xl:flex flex-col items-start leading-tight">
                 <span className="text-[13px] font-bold text-slate-800">{userProfile.name}</span>
                 <span className="text-[11px] font-medium text-slate-400">{userProfile.phone}</span>
              </div>
           </div>

           {isProfileOpen && (
             <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-[60] animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-4 py-3 border-b border-gray-50 flex items-center gap-3 mb-1">
                   <img src={userProfile.avatar} className="w-10 h-10 rounded-full object-cover" alt="" />
                   <div className="overflow-hidden">
                      <p className="text-sm font-bold text-slate-900 truncate">{userProfile.name}</p>
                      <p className="text-xs text-slate-500 truncate">{userProfile.email}</p>
                   </div>
                </div>
                <div className="px-2">
                   <button onClick={() => navigate('/admin/account/profile')} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-lg transition-colors text-left"><UserIcon className="w-4 h-4" /> My Profile</button>
                   <button onClick={() => navigate('/admin/profile/business')} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-lg transition-colors text-left"><BuildingOfficeIcon className="w-4 h-4" /> Organization Settings</button>
                   <button onClick={() => navigate('/admin/help/docs')} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-lg transition-colors text-left"><DocumentTextIcon className="w-4 h-4" /> API Documentation</button>
                </div>
                <div className="h-px bg-gray-100 my-2 mx-2"></div>
                
                {/* ✅ UPDATED SIGN OUT BUTTON */}
                <div className="px-2">
                   <button 
                     onClick={handleSignOut} 
                     className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 rounded-lg transition-colors text-left"
                   >
                     <ArrowRightOnRectangleIcon className="w-4 h-4" /> Sign Out
                   </button>
                </div>
             </div>
           )}
        </div>

      </div>

    </div>
  );
};

export default MainHeading;