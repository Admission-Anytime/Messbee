import React, { useState, useMemo, useRef, useEffect } from "react"; 
import { Link, useLocation } from "react-router-dom";
import { Icon } from "@iconify/react"; 
import { Bars3Icon } from "@heroicons/react/24/outline"; 

// --- MENU CONFIGURATION ---
const MENU_ITEMS = [
  {
    items: [
      { title: "Home", path: "/admin/dashboard", icon: "feather:grid" },
      { title: "Alert", path: "/admin/notifications", icon: "feather:bell", badge: "2" },
      { title: "Chats", path: "/admin/chat", icon: "feather:message-circle", badge: "10+" },
      { 
        title: "Contacts & CRM", 
        icon: "feather:users", 
        isSubmenu: true,
        children: [
          { title: "Contacts", path: "/admin/contacts/list", icon: "feather:user" },
          { title: "Labels", path: "/admin/contacts/labels", icon: "feather:tag" },
          { title: "Custom fields", path: "/admin/contacts/fields", icon: "feather:list" },
          { title: "Quick reply", path: "/admin/contacts/quick-replies", icon: "feather:message-square" },
          { title: "Status", path: "/admin/contacts/status", icon: "feather:check-circle" }
        ]
      },
      { 
        title: "Templates", 
        icon: "feather:file-text", 
        isSubmenu: true,
        children: [
          { title: "Template list", path: "/admin/templates/list", icon: "feather:list" },
          { title: "Create template", path: "/admin/campaigns/templates", icon: "feather:plus-square" },
          { title: "Template gallery", path: "/admin/templates/gallery", icon: "feather:grid" }
        ]
      },
      { title: "Campaign", path: "/admin/campaigns", icon: "feather:send" },
      { 
        title: "Commerce", 
        icon: "feather:shopping-cart", 
        isSubmenu: true,
        children: [
          { title: "Payment list", path: "/admin/commerce/payments", icon: "feather:dollar-sign" },
          { title: "Product list", path: "/admin/commerce/products", icon: "feather:package" }
        ]
      },
      { title: "Automation", path: "/admin/automation", icon: "feather:cpu" },
      { 
        title: "Analytics", 
        icon: "feather:bar-chart-2", 
        isSubmenu: true,
        children: [
          { title: "Conversation analytics", path: "/admin/analytic/conversation", icon: "feather:message-circle" },
          { title: "Messages analytics", path: "/admin/analytic/messages", icon: "feather:mail" },
          { title: "Template analytics", path: "/admin/analytic/template", icon: "feather:layout" },
          { title: "Campaign analytics", path: "/admin/analytic", icon: "feather:send" }
        ]
      },
      { title: "Developer API", path: "/admin/developer/api", icon: "feather:code" },
      { title: "App integration", path: "/admin/integration/apps", icon: "feather:link" },
      { 
        title: "Settings", 
        icon: "feather:settings", 
        isSubmenu: true,
        children: [
          { title: "WhatsApp Config", path: "/admin/settings/whatsapp", icon: "feather:smartphone" },
          { title: "Media Settings", path: "/admin/settings/media", icon: "feather:image" }
        ]
      },
      { 
        title: "Plan & Pricing", 
        icon: "feather:credit-card", 
        isSubmenu: true,
        children: [
          { title: "Upgrade plan", path: "/admin/plan/upgrade", icon: "feather:arrow-up-circle" },
          { title: "Add-ons (WCC)", path: "/admin/plan/addons", icon: "feather:plus-circle" },
          { title: "Active plan", path: "/admin/plan/active", icon: "feather:check-square" },
          { title: "Payment history", path: "/admin/plan/history", icon: "feather:clock" },
          { title: "Payment methods", path: "/admin/plan/methods", icon: "feather:credit-card" }
        ]
      },
      { 
        title: "Profile", 
        icon: "feather:briefcase", 
        isSubmenu: true,
        children: [
          { title: "Profile Information", path: "/admin/account/profile", icon: "feather:user" },
          { title: "Business Information", path: "/admin/profile/business", icon: "feather:briefcase" }
        ]
      },
    ]
  }
];

const findMenuItem = (title) => {
  for (const group of MENU_ITEMS) {
    const found = group.items.find(item => item.title === title);
    if (found) return found;
  }
  return null;
};

const SidebarItem = ({ item, isActive, isExpanded, openSubmenu, activeFloating, onToggle, onFloatingToggle }) => {
  const isOpen = openSubmenu === item.title;
  const isFloatingOpen = activeFloating === item.title;
  const isChildActive = item.children?.some(child => isActive(child.path));
  const active = isActive(item.path);

  const activeClass = "bg-[#EBF5F0] text-slate-900 border-l-4 border-[#10B981]";
  const inactiveClass = "text-slate-600 hover:bg-slate-50 hover:text-black border-l-4 border-transparent";

  // --- 1. COLLAPSED MODE ---
  if (!isExpanded) {
    if (item.isSubmenu) {
      return (
        <div className="relative my-1 mx-2">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onFloatingToggle(item.title, e); 
            }}
            className={`w-full flex justify-center items-center py-3 rounded-lg transition-colors cursor-pointer relative ${isChildActive || isFloatingOpen ? "bg-[#EBF5F0] text-[#10B981]" : "text-slate-500 hover:bg-slate-100 hover:text-black"}`}
            title={item.title}
          >
            <Icon icon={item.icon} className="w-5 h-5" />
            {isFloatingOpen && <span className="absolute right-1 top-1 w-1.5 h-1.5 bg-[#10B981] rounded-full"></span>}
          </button>
        </div>
      );
    }
    return (
      <Link 
        to={item.path || "#"} 
        className={`flex justify-center items-center py-3 my-1 mx-2 rounded-lg transition-colors ${active ? "bg-[#EBF5F0] text-[#10B981]" : "text-slate-500 hover:bg-slate-100 hover:text-black"}`}
        title={item.title}
      >
        <Icon icon={item.icon} className="w-5 h-5" />
      </Link>
    );
  }

  // --- 2. EXPANDED MODE ---
  if (item.isSubmenu) {
    return (
      <div className="mb-1">
        <div 
          onClick={() => onToggle(item.title)} 
          className={`group flex items-center justify-between px-4 py-3 cursor-pointer transition-all duration-200 ${isChildActive ? activeClass : inactiveClass}`}
        >
          <div className="flex items-center gap-3 overflow-hidden">
             <Icon icon={item.icon} className={`w-5 h-5 min-w-[20px] transition-colors ${isChildActive ? "text-[#10B981]" : "text-slate-500 group-hover:text-black"}`} />
             <span className="truncate text-[14px] font-medium">{item.title}</span>
          </div>
          <Icon icon="feather:chevron-down" className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
        </div>
        
        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"}`}>
          <div className="bg-white py-1 space-y-0.5 border-l border-slate-100 ml-6 pl-2">
            {item.children.map((sub, idx) => {
              const isSubActive = isActive(sub.path);
              return (
                <Link 
                  key={idx} 
                  to={sub.path}
                  className={`
                    flex items-center gap-3 px-4 py-2 text-[13px] font-medium rounded-r-lg transition-colors
                    ${isSubActive ? "text-slate-900 bg-[#EBF5F0]" : "text-slate-500 hover:text-black hover:bg-slate-50"}
                  `}
                >
                  <Icon icon={sub.icon} className={`w-4 h-4 min-w-[16px] ${isSubActive ? "text-[#10B981]" : "text-slate-400 group-hover:text-slate-600"}`} />
                  <span className="truncate">{sub.title}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-1">
      <Link 
        to={item.path}
        className={`group flex items-center px-4 py-3 transition-all duration-200 ${active ? activeClass : inactiveClass}`}
      >
        <div className="flex items-center gap-3 w-full overflow-hidden">
          <Icon icon={item.icon} className={`w-5 h-5 min-w-[20px] transition-colors ${active ? "text-[#10B981]" : "text-slate-500 group-hover:text-black"}`} />
          <div className="flex items-center justify-between w-full">
             <span className="truncate text-[14px] font-medium">{item.title}</span>
             {item.badge && (
               <span className="bg-[#00B050] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center shadow-sm">
                 {item.badge}
               </span>
             )}
          </div>
        </div>
      </Link>
    </div>
  );
};

const MainSidebar = ({ isOpen, setIsOpen }) => {
  const [searchQuery, setSearchQuery] = useState(""); 
  const [openSubmenu, setOpenSubmenu] = useState(""); 
  const searchInputRef = useRef(null); 
  const location = useLocation();

  const [activeFloating, setActiveFloating] = useState(null);
  const [floatingStyle, setFloatingStyle] = useState({ top: 0, left: '80px' }); 

  const isActive = (path) => location.pathname === path;
  const handleSubmenuToggle = (title) => setOpenSubmenu(prev => prev === title ? "" : title);

  const filteredMenuItems = useMemo(() => {
    if (!searchQuery) return MENU_ITEMS;
    return MENU_ITEMS.map(cat => ({
      ...cat,
      items: cat.items.filter(item => item.title.toLowerCase().includes(searchQuery.toLowerCase()))
    })).filter(cat => cat.items.length > 0);
  }, [searchQuery]);

  const handleCollapsedSearchClick = () => {
    setIsOpen(true);
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 100);
  };

  const handleFloatingToggle = (title, e) => {
    if (activeFloating === title) {
      setActiveFloating(null);
    } else {
      const rect = e.currentTarget.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const spaceBelow = windowHeight - rect.top;

      if (spaceBelow < 350) {
         setFloatingStyle({ 
            left: '75px', 
            bottom: (windowHeight - rect.bottom) + 'px', 
            top: 'auto' 
         });
      } else {
         setFloatingStyle({ 
            left: '75px', 
            top: rect.top + 'px', 
            bottom: 'auto' 
         });
      }
      setActiveFloating(title);
    }
  };

  useEffect(() => { if(isOpen) setActiveFloating(null); }, [isOpen]);

  const activeItemData = useMemo(() => activeFloating ? findMenuItem(activeFloating) : null, [activeFloating]);

  return (
    <>
      <style>{`
        .sidebar-scroll::-webkit-scrollbar { width: 3px; }
        .sidebar-scroll::-webkit-scrollbar-track { background: transparent; }
        .sidebar-scroll::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 10px; }
        .sidebar-scroll::-webkit-scrollbar-thumb:hover { background-color: #94a3b8; }
        
        @keyframes fade-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in {
          animation: fade-in 0.15s ease-out forwards;
        }
      `}</style>

      {activeFloating && !isOpen && (
        <div className="fixed inset-0 z-[9990] bg-transparent" onClick={() => setActiveFloating(null)}></div>
      )}

      {activeFloating && !isOpen && activeItemData && (
        <div 
          className="fixed w-60 bg-white shadow-[0_5px_30px_-5px_rgba(0,0,0,0.2)] rounded-xl border border-slate-100 p-2 z-[9999] animate-fade-in origin-left"
          style={floatingStyle}
        >
           <div className="px-4 py-3 border-b border-slate-50 mb-2 bg-slate-50/50 rounded-t-lg flex justify-between items-center">
              <span className="text-xs font-extrabold text-slate-500 uppercase tracking-widest">{activeItemData.title}</span>
              <button onClick={() => setActiveFloating(null)} className="text-slate-400 hover:text-red-500"><Icon icon="feather:x" /></button>
           </div>
           <div className="flex flex-col gap-1 max-h-[60vh] overflow-y-auto sidebar-scroll">
              {activeItemData.children.map((sub, idx) => {
                 const isSubActive = isActive(sub.path);
                 return (
                   <Link 
                     key={idx} 
                     to={sub.path}
                     onClick={() => setActiveFloating(null)}
                     className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${isSubActive ? "text-[#10B981] bg-[#EBF5F0]" : "text-slate-600 hover:bg-slate-50 hover:text-black"}`}
                   >
                     <Icon icon={sub.icon} className={`w-4 h-4 ${isSubActive ? "text-[#10B981]" : "text-slate-400"}`} />
                     <span className="truncate">{sub.title}</span>
                   </Link>
                 )
              })}
           </div>
        </div>
      )}

      <div 
        className={`flex flex-col h-full bg-[#FDFDFD] border-r border-gray-100 shadow-sm z-30 font-['Urbanist'] transition-all duration-300 ease-in-out shrink-0
        ${isOpen ? "w-[260px] min-w-[260px]" : "w-[70px] min-w-[70px]"} 
        `}
      >
        
        {/* 1. SEARCH & TOGGLE (Responsive Fix) */}
        <div className={`mt-5 mb-2 flex items-center gap-2 shrink-0 transition-all duration-200 ${isOpen ? "px-4" : "px-2 flex-col gap-4"}`}>
           
           {/* ✅ Conditional Rendering: Show Input ONLY when expanded */}
           {isOpen ? (
             <div className="flex-1 flex items-center bg-[#F3F4F6] rounded-lg px-3 py-2 transition-all w-full">
                <Icon icon="feather:search" className="w-4 h-4 text-gray-400 mr-2 shrink-0" />
                <input 
                  ref={searchInputRef}
                  type="text" 
                  placeholder="Search" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent border-none outline-none text-sm text-gray-700 w-full placeholder:text-gray-400"
                />
             </div>
           ) : (
             // ✅ Collapsed Mode: Just the Icon Button
             <button 
                onClick={handleCollapsedSearchClick} 
                className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 transition-colors" 
                title="Click to Search"
             >
                <Icon icon="feather:search" className="w-5 h-5" />
             </button>
           )}

           {/* Hamburger Toggle (Visible on Desktop) */}
           <button 
             onClick={() => setIsOpen(!isOpen)} 
             className="w-10 h-10 flex items-center justify-center rounded-lg text-slate-400 hover:text-black hover:bg-slate-50 transition-colors hidden lg:flex shrink-0"
             title={isOpen ? "Collapse" : "Expand"}
           >
             <Bars3Icon className="w-6 h-6" />
           </button>
        </div>

        {/* 2. MENU LIST */}
        <div className="flex-1 overflow-y-auto sidebar-scroll py-2">
          {filteredMenuItems.map((section, idx) => (
            <div key={idx} className="mb-4">
              {section.items.map((item, i) => (
                <SidebarItem 
                  key={i} 
                  item={item} 
                  isActive={isActive} 
                  isExpanded={isOpen} 
                  openSubmenu={openSubmenu}     
                  onToggle={handleSubmenuToggle} 
                  activeFloating={activeFloating}
                  onFloatingToggle={handleFloatingToggle}
                />
              ))}
            </div>
          ))}
        </div>

        {/* 3. LOGOUT */}
        <div className="border-t border-gray-100 bg-[#F9FAFB] shrink-0 p-2">
           <button className={`w-full flex items-center px-3 py-3 text-slate-600 hover:text-slate-900 hover:bg-[#EBF5F0] rounded-lg transition-colors ${!isOpen ? "justify-center" : ""}`}>
              <Icon icon="feather:log-out" className="w-5 h-5 min-w-[20px]" />
              {isOpen && <span className="text-sm font-medium ml-3">Logout</span>}
           </button>
        </div>

      </div>
    </>
  );
};

export default MainSidebar;