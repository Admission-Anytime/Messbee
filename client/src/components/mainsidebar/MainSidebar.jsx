import React, { useState, useMemo, useEffect } from "react"; 
import { Link, useLocation } from "react-router-dom";
import { Icon } from "@iconify/react"; 

// Assets
import logo from "../../assets/logo.svg"; 

// --- MENU CONFIGURATION (Now with Icons for Sub-items) ---
const MENU_ITEMS = [
  {
    category: "Main",
    items: [
      { title: "Home", path: "/admin/dashboard", icon: "feather:home" },
      { title: "Chats", path: "/admin/chat", icon: "feather:message-circle" },
      { 
        title: "Customers", 
        icon: "feather:users", 
        isSubmenu: true,
        children: [
          { title: "Contacts", path: "/admin/contacts/list", icon: "feather:user" },
          { title: "Smart Labels", path: "/admin/contacts/labels", icon: "feather:tag" },
          { title: "Custom Fields", path: "/admin/contacts/fields", icon: "feather:list" },
          { title: "Quick Replies", path: "/admin/contacts/quick-replies", icon: "feather:zap" },
          { title: "Status Manager", path: "/admin/contacts/status", icon: "feather:trello" }
        ]
      },
      { 
        title: "Campaigns", 
        icon: "feather:send", 
        isSubmenu: true,
        children: [
          { title: "Template", path: "/admin/campaigns/templates", icon: "feather:layout" },
          { title: "Bulk Send", path: "/admin/campaigns/bulk", icon: "feather:mail" }
        ]
      },
      { title: "Automation", path: "/admin/automation", icon: "feather:cpu" },
      { title: "Business", path: "/admin/business", icon: "feather:briefcase" },
      { title: "Reports", path: "/admin/reports", icon: "feather:bar-chart-2" },
      { title: "Alerts", path: "/admin/alerts", icon: "feather:alert-triangle" },
      { 
        title: "Integrations", 
        icon: "feather:link", 
        isSubmenu: true,
        children: [
          { title: "API Access", path: "/admin/integration/api", icon: "feather:code" },
          { title: "App Connect", path: "/admin/integration/apps", icon: "feather:grid" }
        ]
      },
      { 
        title: "Account", 
        icon: "feather:user-check", 
        isSubmenu: true,
        children: [
          { title: "Admin", path: "/admin/account/admin", icon: "feather:shield" },
          { title: "Settings", path: "/admin/account/settings", icon: "feather:settings" },
          { title: "My Account", path: "/admin/account/profile", icon: "feather:user" },
          { title: "My Plan", path: "/admin/account/plan", icon: "feather:credit-card" }
        ]
      },
    ]
  }
];

// --- SIDEBAR ITEM COMPONENT ---
const SidebarItem = ({ item, isActive, isExpanded, openSubmenu, onToggle }) => {
  const isOpen = openSubmenu === item.title;
  const isChildActive = item.children?.some(child => isActive(child.path));
  const active = isActive(item.path);

  // Styling
  const baseClass = "group flex items-center justify-between px-5 py-3.5 text-[14px] font-medium transition-all duration-200 cursor-pointer border-l-4";
  const activeClass = "border-black bg-gray-100 text-black"; 
  const inactiveClass = "border-transparent text-gray-700 hover:bg-gray-50 hover:text-black";

  if (item.isSubmenu) {
    return (
      <div className="border-b border-gray-50 last:border-0">
        <div 
          onClick={() => isExpanded && onToggle(item.title)} 
          className={`${baseClass} ${isChildActive ? activeClass : inactiveClass}`}
          title={!isExpanded ? item.title : ""}
        >
          <div className="flex items-center gap-4">
             <Icon icon={item.icon} className={`w-5 h-5 min-w-[20px] transition-colors ${isChildActive ? "text-black" : "text-gray-500 group-hover:text-black"}`} />
             <span className={`truncate transition-opacity duration-200 ${isExpanded ? "opacity-100 w-auto" : "opacity-0 w-0 hidden"}`}>
                {item.title}
             </span>
          </div>
          {isExpanded && (
            <Icon icon="feather:chevron-down" className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
          )}
        </div>
        
        {/* Submenu Area */}
        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen && isExpanded ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0"}`}>
          <div className="bg-gray-50 py-2">
            {item.children.map((sub, idx) => {
              const isSubActive = isActive(sub.path);
              return (
                <Link 
                  key={idx} 
                  to={sub.path}
                  className={`
                    flex items-center gap-3 pl-12 pr-4 py-2.5 text-[13px] font-medium transition-colors
                    ${isSubActive ? "text-[#ba2525] font-semibold bg-gray-100" : "text-gray-500 hover:text-black hover:bg-gray-100"}
                  `}
                >
                  {/* ✅ Submenu Icon Rendered Here */}
                  <Icon icon={sub.icon} className={`w-4 h-4 min-w-[16px] ${isSubActive ? "text-[#ba2525]" : "text-gray-400"}`} />
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
    <Link 
      to={item.path}
      onClick={() => onToggle(item.title)} 
      className={`border-b border-gray-50 last:border-0 ${baseClass} ${active ? activeClass : inactiveClass}`}
    >
      <div className="flex items-center gap-4">
        <Icon icon={item.icon} className={`w-5 h-5 min-w-[20px] transition-colors ${active ? "text-black" : "text-gray-500 group-hover:text-black"}`} />
        <span className={`truncate transition-opacity duration-200 ${isExpanded ? "opacity-100 w-auto" : "opacity-0 w-0 hidden"}`}>
          {item.title}
        </span>
      </div>
    </Link>
  );
};

const MainSidebar = () => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [searchQuery, setSearchQuery] = useState(""); 
  const [openSubmenu, setOpenSubmenu] = useState(""); 
  const location = useLocation();

  const isActive = (path) => location.pathname === path;
  const toggleSidebar = () => setIsExpanded(!isExpanded);
  const handleSubmenuToggle = (title) => setOpenSubmenu(prev => prev === title ? "" : title);

  useEffect(() => {
    const handleResize = () => {
      if(window.innerWidth < 1024) setIsExpanded(false);
      else setIsExpanded(true);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const filteredMenuItems = useMemo(() => {
    if (!searchQuery) return MENU_ITEMS;
    return MENU_ITEMS.map(cat => ({
      ...cat,
      items: cat.items.filter(item => item.title.toLowerCase().includes(searchQuery.toLowerCase()))
    })).filter(cat => cat.items.length > 0);
  }, [searchQuery]);

  return (
    <>
      <style>{`
        .sidebar-scroll::-webkit-scrollbar { width: 4px; }
        .sidebar-scroll::-webkit-scrollbar-track { background: transparent; }
        .sidebar-scroll::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 10px; }
        .sidebar-scroll::-webkit-scrollbar-thumb:hover { background-color: #94a3b8; }
      `}</style>

      {/* SIDEBAR CONTAINER */}
      <div 
        className={`flex flex-col h-screen sticky top-0 bg-[#FDFDFD] border-r border-gray-200 shadow-xl z-50 font-['Urbanist'] transition-all duration-300 ease-in-out
        ${isExpanded ? "w-[260px] min-w-[260px]" : "w-[80px] min-w-[80px]"} 
        `}
      >
        
        {/* 1. HEADER */}
        <div className={`flex items-center shrink-0 bg-[#FDFDFD] h-20 transition-all duration-300 ${isExpanded ? "justify-between px-5" : "justify-center gap-2 px-1"}`}>
           
           {/* Logo Section */}
           <div className="flex items-center gap-3 overflow-hidden shrink-0">
              <div className="relative w-8 h-8 flex items-center justify-center shrink-0">
                 <img src={logo} alt="Logo" className="w-full h-full object-contain" />
              </div>
              <span className={`text-xl font-extrabold text-black tracking-tight whitespace-nowrap transition-all duration-200 ${isExpanded ? "opacity-100 w-auto" : "opacity-0 w-0 hidden"}`}>
                Mess bee
              </span>
           </div>
           
           {/* Collapse Toggle */}
           <button onClick={toggleSidebar} className="text-gray-400 hover:text-black transition-colors shrink-0 p-1 rounded-md hover:bg-gray-50">
              <Icon 
                icon={isExpanded ? "feather:chevron-left" : "feather:chevron-right"} 
                className="w-5 h-5" 
              />
           </button>
        </div>

        {/* 2. SEARCH BAR */}
        <div className={`mb-4 shrink-0 transition-all duration-200 ${isExpanded ? "px-4" : "px-2"}`}>
           {isExpanded ? (
             <div className="flex items-center bg-[#E5E7EB] rounded-md px-3 py-2.5">
                <Icon icon="feather:search" className="w-5 h-5 text-gray-500 mr-2" />
                <input 
                  type="text" 
                  placeholder="Search" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent border-none outline-none text-sm text-gray-700 w-full placeholder:text-gray-500"
                />
                <Icon icon="feather:help-circle" className="w-5 h-5 text-gray-500 ml-2 cursor-pointer hover:text-black" />
             </div>
           ) : (
             <div className="flex justify-center items-center bg-[#E5E7EB] rounded-md py-2.5 cursor-pointer hover:bg-gray-200 transition-colors h-[40px]" title="Search">
                <Icon icon="feather:search" className="w-5 h-5 text-gray-600" />
             </div>
           )}
        </div>

        {/* 3. MENU ITEMS */}
        <div className="flex-1 overflow-y-auto sidebar-scroll">
          {filteredMenuItems.map((section, idx) => (
            <div key={idx}>
              {section.items.map((item, i) => (
                <SidebarItem 
                  key={i} 
                  item={item} 
                  isActive={isActive} 
                  isExpanded={isExpanded} 
                  openSubmenu={openSubmenu}     
                  onToggle={handleSubmenuToggle} 
                />
              ))}
            </div>
          ))}
        </div>

        {/* 4. FOOTER (Logout) */}
        <div className="border-t border-gray-200 bg-[#F9FAFB] shrink-0">
           <button className={`w-full flex items-center px-5 py-4 text-gray-600 hover:text-red-600 hover:bg-red-50 transition-colors ${!isExpanded ? "justify-center" : ""}`}>
              <Icon icon="feather:log-out" className="w-5 h-5 min-w-[20px]" />
              {isExpanded && <span className="text-sm font-medium ml-3">Logout</span>}
           </button>
        </div>

      </div>
    </>
  );
};

export default MainSidebar;