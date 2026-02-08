import React, { useState, useMemo, useEffect } from "react"; 
import { Link, useLocation } from "react-router-dom";

// Assets
import logo from "../../assets/logo.svg";
import icon from "./assets/Chat.svg";
import contacts from "./assets/contacts.svg";
import campaign from "./assets/campaign.svg";
import automatin from "./assets/automation.svg";
import analytic from "./assets/analys.svg";
import setting from "./assets/Setting.svg";
import help from "./assets/help.svg";

// --- MENU CONFIGURATION ---
const MENU_ITEMS = [
  {
    category: "Menu",
    items: [
      { title: "Dashboard", path: "/admin/dashboard", icon: logo },
      { title: "Notification", path: "/admin/notifications", icon: help, badge: "10+" },
      { title: "Chats", path: "/admin/chat", icon: icon, badge: "10+" },
      { 
        title: "Contacts & CRM", 
        icon: contacts, 
        isSubmenu: true,
        children: [
          { title: "All Contacts", path: "/admin/contacts/list" },
          { title: "Labels", path: "/admin/contacts/labels" },
          { title: "Custom Fields", path: "/admin/contacts/fields" },
          { title: "Quick Replies", path: "/admin/contacts/quick-reply" },
          { title: "Contact Status", path: "/admin/contacts/status" }
        ]
      },
      { 
        title: "Templates", 
        icon: campaign, 
        isSubmenu: true,
        children: [
          { title: "Template List", path: "/admin/templates/list" },
          { title: "Create Template", path: "/admin/templates/create" },
          { title: "Template Gallery", path: "/admin/templates/gallery" }
        ]
      },
      { title: "Campaign", path: "/admin/campaigns", icon: campaign },
      { 
        title: "Commerce", 
        icon: analytic, 
        isSubmenu: true, 
        children: [
          { title: "Product Catalog", path: "/admin/commerce/products" },
          { title: "Orders & Payments", path: "/admin/commerce/orders" }
        ] 
      },
      { title: "Automation", path: "/admin/automation", icon: automatin },
      { 
        title: "Analytics", 
        icon: analytic, 
        isSubmenu: true, 
        children: [
          { title: "Conversations", path: "/admin/analytics/conversations" },
          { title: "Message Reports", path: "/admin/analytics/messages" },
          { title: "Campaign Stats", path: "/admin/analytics/campaigns" }
        ] 
      }
    ]
  },
  {
    category: "Developer",
    items: [
      { title: "Developer API", path: "/admin/developer/api", icon: setting },
      { title: "App Integration", path: "/admin/developer/integrations", icon: help }
    ]
  },
  {
    category: "System",
    items: [
      { 
        title: "Settings", 
        icon: setting, 
        isSubmenu: true, 
        children: [
          { title: "WhatsApp Config", path: "/admin/settings/whatsapp" },
          { title: "Team Management", path: "/admin/settings/team" },
          { title: "Media Gallery", path: "/admin/settings/media" }
        ] 
      },
      { 
        title: "Help & Support", 
        icon: help, 
        isSubmenu: true, 
        children: [
          { title: "Documentation", path: "/admin/help/docs" },
          { title: "Contact Support", path: "/admin/help/support" },
          { title: "FAQs", path: "/admin/help/faqs" }
        ] 
      },
      { 
        title: "Plan & Pricing", 
        icon: analytic, 
        isSubmenu: true, 
        children: [
          { title: "Current Subscription", path: "/admin/plan/overview" },
          { title: "Billing History", path: "/admin/plan/billing" }
        ] 
      },
      { 
        title: "My Profile", 
        icon: contacts, 
        isSubmenu: true, 
        children: [
          { title: "Personal Info", path: "/admin/profile/info" },
          { title: "Business Info", path: "/admin/profile/business" }
        ] 
      }
    ]
  }
];

// --- SIDEBAR ITEM COMPONENT ---
const SidebarItem = ({ item, isActive, location, isExpanded, searchQuery, openSubmenu, onToggle }) => {
  
  const isOpen = (openSubmenu === item.title) || (searchQuery && item.children && item.children.length > 0);

  // Styles - Tighter padding (px-2) for compressed look
  const activeClass = "bg-[#ba2525]/5 text-[#ba2525] border-r-[3px] border-[#ba2525]";
  const inactiveClass = "text-slate-600 hover:bg-slate-50 hover:text-slate-900";

  const isChildActive = item.children?.some(child => isActive(child.path));

  if (item.isSubmenu) {
    return (
      <div className="mb-1">
        <button 
          onClick={() => isExpanded && onToggle(item.title)} 
          className={`relative group w-full flex items-center justify-between px-2 py-2 text-[13px] font-medium transition-all duration-200 
            ${isChildActive ? "text-[#ba2525] font-semibold" : inactiveClass}`}
          title={!isExpanded ? item.title : ""}
        >
          <div className={`flex items-center gap-3 ${!isExpanded ? "justify-center w-full" : ""}`}>
             <div className="w-5 h-5 flex items-center justify-center opacity-70 shrink-0">
                <img src={item.icon} alt="icon" className={`w-full h-full object-contain ${isChildActive ? "" : "grayscale opacity-80"}`} />
             </div>
             <span className={`transition-opacity duration-200 truncate ${isExpanded ? "opacity-100" : "opacity-0 w-0 hidden"}`}>
                {item.title}
             </span>
          </div>
          {isExpanded && (
            <svg className={`w-3 h-3 transition-transform shrink-0 ${isOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          )}
          {!isExpanded && (
            <div className="fixed left-[3.5rem] ml-2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-[60] hidden group-hover:block whitespace-nowrap shadow-lg">
              {item.title}
            </div>
          )}
        </button>
        
        {/* Children Links */}
        {isOpen && isExpanded && (
          <div className="bg-slate-50/50 pl-8 pr-2 py-1 space-y-1 border-l-2 border-slate-100 ml-4">
            {item.children.map((sub, idx) => {
              const isSubActive = isActive(sub.path);
              return (
                <Link 
                  key={idx} 
                  to={sub.path}
                  className={`block py-1.5 text-xs font-medium transition-colors truncate ${isSubActive ? "text-[#ba2525] font-bold" : "text-slate-500 hover:text-[#ba2525]"}`}
                >
                  {sub.title}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // --- RENDER NORMAL LINK ---
  const active = isActive(item.path);
  return (
    <Link 
      to={item.path}
      onClick={() => onToggle(item.title)} 
      className={`relative group flex items-center justify-between px-2 py-2 mb-1 text-[13px] font-medium transition-all duration-200 ${active ? activeClass : inactiveClass}`}
    >
      <div className={`flex items-center gap-3 ${!isExpanded ? "justify-center w-full" : ""}`}>
        <div className={`w-5 h-5 flex items-center justify-center transition-all shrink-0 ${active ? "opacity-100 scale-110" : "opacity-70"}`}>
           <img src={item.icon} alt="icon" className={`w-full h-full object-contain ${active ? "" : "grayscale opacity-60"}`} />
        </div>
        <span className={`transition-opacity duration-200 truncate ${isExpanded ? "opacity-100" : "opacity-0 w-0 hidden"}`}>
          {item.title}
        </span>
      </div>
      
      {item.badge && isExpanded && (
        <span className="bg-green-100 text-green-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0">
          {item.badge}
        </span>
      )}

      {!isExpanded && (
        <div className="fixed left-[3.5rem] ml-2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-[60] hidden group-hover:block whitespace-nowrap shadow-lg">
          {item.title}
        </div>
      )}
    </Link>
  );
};

const MainSidebar = () => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [searchQuery, setSearchQuery] = useState(""); 
  const [openSubmenu, setOpenSubmenu] = useState(""); 
  const profileName = "Hitesh"; 
  const location = useLocation();

  const isActive = (path) => {
    if (path === "/admin/dashboard" && location.pathname === "/") return true;
    return location.pathname === path;
  };

  const toggleSidebar = () => setIsExpanded(!isExpanded);

  const handleSubmenuToggle = (title) => {
    setOpenSubmenu(prev => prev === title ? "" : title);
  };

  // ✅ RESPONSIVE LOGIC: Auto-collapse on small screens (< 1024px)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsExpanded(false);
      } else {
        setIsExpanded(true);
      }
    };

    // Initial check
    handleResize();

    // Listener
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Auto-open submenu based on URL
  useEffect(() => {
    if(searchQuery) return;
    let activeParent = "";
    MENU_ITEMS.forEach(category => {
      category.items.forEach(item => {
        if (item.children && item.children.some(child => child.path === location.pathname)) {
          activeParent = item.title;
        }
      });
    });
    setOpenSubmenu(activeParent);
  }, [location.pathname, searchQuery]);

  const filteredMenuItems = useMemo(() => {
    if (!searchQuery) return MENU_ITEMS;
    const lowerQuery = searchQuery.toLowerCase();
    return MENU_ITEMS.map(category => {
      const filteredItems = category.items.map(item => {
        const isParentMatch = item.title.toLowerCase().includes(lowerQuery);
        const filteredChildren = item.children?.filter(child => 
           child.title.toLowerCase().includes(lowerQuery)
        );
        if (isParentMatch) return item;
        if (filteredChildren && filteredChildren.length > 0) {
          return { ...item, children: filteredChildren };
        }
        return null;
      }).filter(Boolean); 
      return { ...category, items: filteredItems };
    }).filter(category => category.items.length > 0); 
  }, [searchQuery]);

  return (
    <>
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* SIDEBAR CONTAINER */}
      {/* ✅ COMPRESSED WIDTH: w-52 (Expanded) / w-16 (Collapsed) */}
      <div 
        className={`flex flex-col h-screen sticky top-0 bg-white border-r border-slate-200 shadow-xl z-50 font-['Urbanist'] transition-all duration-300 ease-in-out
        ${isExpanded ? "w-52 min-w-[13rem]" : "w-16 min-w-[4rem]"}
        `}
      >
        
        {/* 1. TOP HEADER */}
        {/* ✅ Tighter Padding: px-2 */}
        <div className="px-2 pt-4 pb-2 shrink-0">
          <div className={`flex items-center mb-4 transition-all duration-300 ${isExpanded ? "justify-between" : "justify-center flex-col-reverse gap-4"}`}>
             
             {/* Brand */}
             <Link 
               to="/admin/profile/business" 
               className={`flex items-center gap-2 overflow-hidden transition-all duration-300 cursor-pointer hover:bg-slate-50 p-1.5 -ml-1 rounded-lg group ${isExpanded ? "opacity-100" : "opacity-0 w-0 hidden"}`}
               title="View Business Profile"
             >
                <div className="w-7 h-7 bg-[#ba2525] rounded-full flex items-center justify-center text-white font-bold text-xs shadow-sm shrink-0 group-hover:scale-105 transition-transform">
                   AB
                </div>
                <div className="flex flex-col whitespace-nowrap">
                   <span className="text-sm font-bold text-slate-800 leading-none group-hover:text-[#ba2525] transition-colors">Admission Any...</span>
                   <span className="text-[10px] text-slate-400 mt-0.5">+91 1234567890</span>
                </div>
             </Link>

             {/* Toggle */}
             <button 
               onClick={toggleSidebar} 
               className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-[#ba2525] transition-colors"
             >
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
               </svg>
             </button>
          </div>

          {/* Search Input */}
          <div className={`relative group transition-all duration-300 ${isExpanded ? "opacity-100 block" : "opacity-0 hidden"}`}>
             <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#ba2525] transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
             </span>
             <input 
               type="text" 
               placeholder="Search..." 
               value={searchQuery} 
               onChange={(e) => setSearchQuery(e.target.value)} 
               className="w-full bg-slate-50 text-slate-700 text-xs pl-9 pr-2 py-2 rounded-lg border border-slate-100 focus:border-[#ba2525]/30 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#ba2525]/10 transition-all placeholder:text-slate-400"
             />
          </div>
        </div>

        {/* 2. MENU LIST */}
        <div className="flex-1 overflow-y-auto no-scrollbar py-2">
          {filteredMenuItems.length > 0 ? (
            filteredMenuItems.map((section, idx) => (
              <div key={idx} className="mb-3">
                {isExpanded && (
                  <div className="flex justify-between items-center px-3 mb-1">
                     <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 whitespace-nowrap">{section.category}</h3>
                  </div>
                )}
                {section.items.map((item, i) => (
                  <SidebarItem 
                    key={i} 
                    item={item} 
                    isActive={isActive} 
                    location={location} 
                    isExpanded={isExpanded} 
                    searchQuery={searchQuery} 
                    openSubmenu={openSubmenu}     
                    onToggle={handleSubmenuToggle} 
                  />
                ))}
              </div>
            ))
          ) : (
            <div className="text-center p-4">
              <p className="text-xs text-slate-400">No results found.</p>
            </div>
          )}
        </div>

        {/* 3. FOOTER */}
        {/* ✅ Tighter Padding: px-2 */}
        <div className={`border-t border-slate-100 bg-slate-50/50 p-2 shrink-0 transition-all duration-300 ${isExpanded ? "" : "bg-white"}`}>
           {isExpanded && (
             <div className="flex justify-between items-end mb-3 px-1">
               <div>
                  <p className="text-[9px] font-semibold text-slate-400 uppercase">Plan</p>
                  <p className="text-xs font-bold text-slate-800">Custom</p>
               </div>
               <div className="text-right">
                  <p className="text-[9px] font-semibold text-slate-400 uppercase">WCC Credit</p>
                  <p className="text-xs font-bold text-[#ba2525]">₹624.21</p>
               </div>
             </div>
           )}
           <Link to="/admin/profile" className={`flex items-center gap-2 p-1.5 rounded-lg bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow ${!isExpanded ? "justify-center border-none shadow-none bg-transparent" : ""}`}>
              <div className="w-7 h-7 bg-slate-200 rounded-full flex items-center justify-center text-slate-500 overflow-hidden shrink-0">
                 <span className="font-bold text-[10px]">HI</span>
              </div>
              {isExpanded && (
                <>
                  <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate">{profileName}</p>
                      <p className="text-[9px] text-slate-500 truncate">Team Member</p>
                  </div>
                  <svg className="w-3 h-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </>
              )}
           </Link>
        </div>

      </div>
    </>
  );
};

export default MainSidebar;