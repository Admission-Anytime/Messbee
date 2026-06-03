/* eslint-disable react/prop-types */
import { useState, useMemo, useRef, useEffect, useContext } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom"; 
import { Icon } from "@iconify/react";
import { Bars3Icon } from "@heroicons/react/24/outline";
import { userContext } from "../../context/Context";
import { ChatContext } from "../../context/ChatContext";
import { getDaysRemaining } from "../../utils/subscription";

// --- LOGO ASSETS ---
import logoIcon from "../../assets/MessBee Logo.png";
import logoName from "../../assets/MessBee Name.png";

const MENU_ITEMS = [
  {
    items: [
      { title: "Dashboard", path: "/admin/dashboard", icon: "feather:grid" },
      {
        title: "Chats",
        path: "/admin/chat",
        icon: "feather:message-circle",
      },
      {
        title: "Contacts & CRM",
        icon: "feather:users",
        isSubmenu: true,
        children: [
          { title: "Contacts", path: "/admin/contacts/list", icon: "feather:user" },
          { title: "Labels", path: "/admin/contacts/labels", icon: "feather:tag" },
          { title: "Custom fields", path: "/admin/contacts/fields", icon: "feather:list" },
          { title: "Quick reply", path: "/admin/contacts/quick-replies", icon: "feather:message-square" },
          { title: "Status", path: "/admin/contacts/status", icon: "feather:check-circle" },
        ],
      },
      {
        title: "Templates",
        icon: "feather:file-text",
        isSubmenu: true,
        children: [
          { title: "Template list", path: "/admin/templates/list", icon: "feather:list" },
          { title: "Create template", path: "/admin/templates/create", icon: "feather:plus-square" },
          { title: "Template gallery", path: "/admin/templates/gallery", icon: "feather:grid" },
        ],
      },
      { title: "Campaign", path: "/admin/campaigns", icon: "feather:send" },
      {
        title: "Analytics",
        icon: "feather:bar-chart-2",
        isSubmenu: true,
        children: [
          { title: "Conversational analytics", path: "/admin/analytic/conversation", icon: "feather:message-circle" },
          { title: "Messages analytics", path: "/admin/analytic/messages", icon: "feather:mail" },
          { title: "Template analytics", path: "/admin/analytic/template", icon: "feather:layout" },
          { title: "Campaign analytics", path: "/admin/analytic/campaign", icon: "feather:send" },
        ],
      },
      {
        title: "Commerce",
        icon: "feather:shopping-cart",
        isSubmenu: true,
        children: [
          { title: "Payment list", path: "/admin/commerce/payments", icon: "feather:dollar-sign" },
          { title: "Product list", path: "/admin/commerce/products", icon: "feather:package" },
          { title: "Inventory", path: "/admin/commerce/inventory", icon: "feather:archive" }, 
        ],
      },
      { title: "Automation", path: "/admin/automation", icon: "feather:cpu" },
      { title: "Developer API", path: "/admin/developer/api", icon: "feather:code" },
      { title: "App integration", path: "/admin/integration/apps", icon: "feather:link" },
      {
        title: "Settings",
        icon: "feather:settings",
        isSubmenu: true,
        children: [
          { title: "WhatsApp Config", path: "/admin/settings/whatsapp", icon: "feather:smartphone" },
          { title: "Media Settings", path: "/admin/settings/media", icon: "feather:image" },
          { title: "Manage Teams", path: "/admin/settings/teams", icon: "feather:users" },
        ],
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
          { title: "Payment methods", path: "/admin/plan/methods", icon: "feather:credit-card" },
        ],
      },
      {
        title: "Help & Support",
        icon: "feather:help-circle",
        isSubmenu: true,
        children: [
          { title: "Introduction", path: "/admin/help/introduction", icon: "feather:info" },
          { title: "API Documentation", path: "/admin/help/api-docs", icon: "feather:book" },
          { title: "FAQs", path: "/admin/help/faq", icon: "feather:message-circle" },
          { title: "Contact Support", path: "/admin/help/support", icon: "feather:headphones" },
        ],
      },
    ],
  },
];

const SidebarItem = ({ item, unreadCount, isActive, isExpanded, openSubmenu, activeFloating, onToggle, onFloatingToggle }) => {
  const isOpen = openSubmenu === item.title || !!item._forceOpen;
  const isFloatingOpen = activeFloating === item.title;
  const isChildActive = item.children?.some((child) => window.location.pathname.includes(child.path));
  const active = isActive(item.path);

  const activeClass = "bg-[#EBF5F0] text-slate-900 border-l-4 border-[#10B981]";
  const inactiveClass = "text-slate-600 hover:bg-slate-50 hover:text-black border-l-4 border-transparent";

  if (!isExpanded) {
    if (item.isSubmenu) {
      return (
        <div className="relative my-1 mx-2">
          <button
            onClick={(e) => { e.stopPropagation(); onFloatingToggle(item.title, e); }}
            className={`w-full flex justify-center items-center py-3 rounded-lg transition-colors cursor-pointer relative ${isChildActive || isFloatingOpen ? "bg-[#EBF5F0] text-[#10B981]" : "text-slate-500 hover:bg-slate-100 hover:text-black"}`}
            title={item.title}
          >
            <Icon icon={item.icon} className="w-5 h-5" />
            {(isChildActive || isFloatingOpen) && <span className="absolute right-1 top-1 w-1.5 h-1.5 bg-[#10B981] rounded-full"></span>}
          </button>
        </div>
      );
    }
    return (
      <Link to={item.path || "#"} className={`flex justify-center items-center py-3 my-1 mx-2 rounded-lg transition-colors ${active ? "bg-[#EBF5F0] text-[#10B981]" : "text-slate-500 hover:bg-slate-100 hover:text-black"}`} title={item.title}>
        <Icon icon={item.icon} className="w-5 h-5" />
      </Link>
    );
  }

  if (item.isSubmenu) {
    return (
      <div className="mb-1">
        <div onClick={() => onToggle(item.title)} className={`group flex items-center justify-between px-4 py-3 cursor-pointer transition-all duration-200 ${isChildActive ? activeClass : inactiveClass}`}>
          <div className="flex items-center gap-3 overflow-hidden">
            <Icon icon={item.icon} className={`w-5 h-5 min-w-[20px] transition-colors ${isChildActive ? "text-[#10B981]" : "text-slate-500 group-hover:text-black"}`} />
            <span className="truncate text-[14px] font-medium">{item.title}</span>
          </div>
          <Icon icon="feather:chevron-down" className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
        </div>
        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"}`}>
          <div className="bg-white py-1 space-y-0.5 border-l border-slate-100 ml-6 pl-2">
            {item.children.map((sub, idx) => (
              <Link key={idx} to={sub.path} className={`flex items-center gap-3 px-4 py-2 text-[13px] font-medium rounded-r-lg transition-colors ${isActive(sub.path) ? "text-slate-900 bg-[#EBF5F0]" : "text-slate-500 hover:text-black hover:bg-slate-50"}`}>
                <Icon icon={sub.icon} className={`w-4 h-4 min-w-[16px] ${isActive(sub.path) ? "text-[#10B981]" : "text-slate-400 group-hover:text-slate-600"}`} />
                <span className="truncate">{sub.title}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const displayBadge = item.title === "Chats" ? (unreadCount > 0 ? (unreadCount > 99 ? "99+" : unreadCount) : null) : item.badge;

  return (
    <div className="mb-1">
      <Link to={item.path} className={`group flex items-center px-4 py-3 transition-all duration-200 ${active ? activeClass : inactiveClass}`}>
        <div className="flex items-center gap-3 w-full overflow-hidden">
          <Icon icon={item.icon} className={`w-5 h-5 min-w-[20px] transition-colors ${active ? "text-[#10B981]" : "text-slate-500 group-hover:text-black"}`} />
          <div className="flex items-center justify-between w-full">
            <span className="truncate text-[14px] font-medium">{item.title}</span>
            {displayBadge && <span className="bg-[#00B050] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center shadow-sm">{displayBadge}</span>}
          </div>
        </div>
      </Link>
    </div>
  );
};

const MainSidebar = ({ isOpen, setIsOpen }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [openSubmenu, setOpenSubmenu] = useState("");
  const searchInputRef = useRef(null);
  const location = useLocation();
  const { unreadCount } = useContext(ChatContext);
  
  // Floating Window Logic
  const [activeFloating, setActiveFloating] = useState(null);
  const [floatingStyle, setFloatingStyle] = useState({ top: 0, left: "80px" });

  // Profile Popup Logic
  const [isProfilePopupOpen, setIsProfilePopupOpen] = useState(false);
  const profilePopupRef = useRef(null);

  const isActive = (path) => location.pathname === path;
  const handleSubmenuToggle = (title) => setOpenSubmenu((prev) => (prev === title ? "" : title));

  // Auto-open submenu based on URL
  useEffect(() => {
    const paths = ["templates", "contacts", "commerce", "plan", "help", "analytic"];
    const labels = ["Templates", "Contacts & CRM", "Commerce", "Plan & Pricing", "Help & Support", "Analytics"];
    paths.forEach((p, i) => { if (location.pathname.includes(`/admin/${p}`)) setOpenSubmenu(labels[i]); });
  }, [location.pathname]);

  // Click Outside logic for Profile Popup
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profilePopupRef.current && !profilePopupRef.current.contains(event.target)) {
        setIsProfilePopupOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const { logoutUser, user } = useContext(userContext);
  const handleLogout = async () => { await logoutUser(); navigate("/login"); };

  const filteredMenuItems = useMemo(() => {
    if (!searchQuery) return MENU_ITEMS;
    const q = searchQuery.toLowerCase();
    return MENU_ITEMS.map((cat) => ({
      ...cat,
      items: cat.items
        .map((item) => {
          // Direct top-level title match — include as-is
          if (item.title.toLowerCase().includes(q)) return item;
          // Submenu: filter children by sub-title match
          if (item.isSubmenu && item.children) {
            const matchedChildren = item.children.filter((child) =>
              child.title.toLowerCase().includes(q)
            );
            if (matchedChildren.length > 0) {
              return { ...item, children: matchedChildren, _forceOpen: true };
            }
          }
          return null;
        })
        .filter(Boolean),
    })).filter((cat) => cat.items.length > 0);
  }, [searchQuery]);

  const handleCollapsedSearchClick = () => { setIsOpen(true); setTimeout(() => searchInputRef.current?.focus(), 100); };

  const handleFloatingToggle = (title, e) => {
    if (activeFloating === title) { setActiveFloating(null); } 
    else {
      const rect = e.currentTarget.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const spaceBelow = windowHeight - rect.top;
      setFloatingStyle({ 
        left: "75px", 
        top: spaceBelow < 350 ? "auto" : rect.top + "px", 
        bottom: spaceBelow < 350 ? (windowHeight - rect.bottom) + "px" : "auto" 
      });
      setActiveFloating(title);
    }
  };

  useEffect(() => { if (isOpen) setActiveFloating(null); }, [isOpen]);

  return (
    <>
      <style>{`
        .sidebar-scroll::-webkit-scrollbar { width: 3px; }
        .sidebar-scroll::-webkit-scrollbar-track { background: transparent; }
        .sidebar-scroll::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 10px; }
        @keyframes fade-in { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        .animate-fade-in { animation: fade-in 0.15s ease-out forwards; }
      `}</style>

      {/* --- COLLAPSED: SLIDING SUBMENU --- */}
      {activeFloating && !isOpen && (
        <>
          <div className="fixed inset-0 z-[9990] bg-transparent" onClick={() => setActiveFloating(null)}></div>
          <div className="fixed w-60 bg-white shadow-[0_10px_40px_-10px_rgba(0,0,0,0.2)] rounded-2xl border border-slate-100 p-2 z-[9999] animate-fade-in origin-left" style={floatingStyle}>
            <div className="px-4 py-3 border-b border-slate-50 mb-2 bg-slate-50/50 rounded-t-xl flex justify-between items-center">
              <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">{activeFloating}</span>
              <button onClick={() => setActiveFloating(null)} className="text-slate-400 hover:text-red-500"><Icon icon="feather:x" /></button>
            </div>
            <div className="flex flex-col gap-1 max-h-[60vh] overflow-y-auto sidebar-scroll">
              {MENU_ITEMS[0].items.find((i) => i.title === activeFloating)?.children?.map((sub, idx) => (
                <Link key={idx} to={sub.path} onClick={() => setActiveFloating(null)} className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${isActive(sub.path) ? "text-[#10B981] bg-[#EBF5F0]" : "text-slate-600 hover:bg-slate-50 hover:text-black"}`}>
                  <Icon icon={sub.icon} className={`w-4 h-4 ${isActive(sub.path) ? "text-[#10B981]" : "text-slate-400"}`} />
                  <span className="truncate">{sub.title}</span>
                </Link>
              ))}
            </div>
          </div>
        </>
      )}

      <div className={`flex flex-col h-screen sticky top-0 bg-[#FDFDFD] border-r border-gray-100 shadow-sm z-30 font-['Urbanist'] transition-all duration-300 ease-in-out shrink-0 ${isOpen ? "w-[260px]" : "w-[70px]"}`}>
        
        {/* --- LOGO SECTION --- */}
        <div onClick={() => navigate('/admin/dashboard')} className={`h-[74px] sm:h-[80px] flex items-center cursor-pointer shrink-0 transition-all duration-300 min-w-0 ${isOpen ? "justify-start gap-2 sm:gap-3 px-3 sm:px-4" : "justify-center"}`}>
          <img src={logoIcon} alt="Logo" className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 object-contain shrink-0" />
          {isOpen && <img src={logoName} alt="MessBee" className="h-5 sm:h-6 lg:h-7 w-auto object-contain mt-0.5 animate-fade-in max-w-[150px]" />}
        </div>

        {/* --- SEARCH & TOGGLE --- */}
        <div className={`mb-2 flex items-center gap-2 shrink-0 transition-all duration-200 ${isOpen ? "px-4" : "px-2 flex-col gap-4"}`}>
          {isOpen ? (
            <div className="flex-1 flex items-center bg-[#F3F4F6] rounded-lg px-3 py-2 transition-all w-full">
              <Icon icon="feather:search" className="w-4 h-4 text-gray-400 mr-2 shrink-0" />
              <input ref={searchInputRef} type="text" placeholder="Search" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="bg-transparent border-none outline-none text-sm text-gray-700 w-full placeholder:text-gray-400" />
            </div>
          ) : (
            <button onClick={handleCollapsedSearchClick} className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 transition-colors" title="Click to Search">
              <Icon icon="feather:search" className="w-5 h-5" />
            </button>
          )}
          <button onClick={() => setIsOpen(!isOpen)} className="w-10 h-10 flex items-center justify-center rounded-lg text-slate-400 hover:text-black hover:bg-slate-50 transition-colors shrink-0">
            <Bars3Icon className="w-6 h-6" />
          </button>
        </div>

        {/* --- MENU SCROLL AREA --- */}
        <div className="flex-1 overflow-y-auto sidebar-scroll py-2">
          {filteredMenuItems.map((section, idx) => (
            <div key={idx} className="mb-4">
              {section.items.map((item, i) => (
                <SidebarItem key={i} item={item} unreadCount={unreadCount} isActive={isActive} isExpanded={isOpen} openSubmenu={openSubmenu} onToggle={handleSubmenuToggle} activeFloating={activeFloating} onFloatingToggle={handleFloatingToggle} />
              ))}
            </div>
          ))}
        </div>

        {/* --- FOOTER SECTION: PLAN & USER PROFILE --- */}
        <div className="p-3 border-t border-gray-100 mt-auto bg-white relative">
          
          {/* --- PROFILE POPUP WINDOW --- */}
          {isProfilePopupOpen && isOpen && (
            <div 
              ref={profilePopupRef}
              className="absolute bottom-16 left-full ml-2 w-72 bg-white shadow-[0_10px_40px_-10px_rgba(0,0,0,0.2)] rounded-2xl border border-slate-100 z-[100] animate-fade-in py-3 flex flex-col"
            >
              <div className="px-4 py-2 border-b border-slate-50">
                <div className="flex items-center gap-2 mb-1">
                  <Icon icon="feather:user" className="w-4 h-4 text-slate-400" />
                  <span className="text-sm font-bold text-slate-800">{user?.name || "User"} ({user?.role || "Member"})</span>
                </div>
                <div className="flex items-center gap-2">
                  <Icon icon="feather:mail" className="w-4 h-4 text-slate-400" />
                  <span className="text-[12px] font-medium text-slate-500">{user?.email || "user@messbee.com"}</span>
                </div>
              </div>

              <button 
                onClick={() => navigate('/admin/account/profile')}
                className="px-4 py-3 flex items-center gap-3 hover:bg-slate-50 text-slate-600 transition-colors w-full text-left"
              >
                <Icon icon="feather:user" className="w-4 h-4" />
                <span className="text-sm font-bold">User profile</span>
              </button>

              <button 
                onClick={() => navigate('/admin/profile/business')}
                className="px-4 py-3 flex items-center gap-3 hover:bg-slate-50 text-slate-600 transition-colors w-full text-left"
              >
                <Icon icon="feather:grid" className="w-4 h-4" />
                <span className="text-sm font-bold">Business profile</span>
              </button>

              <div className="px-4 py-3 border-t border-slate-50">
                <p className="text-[12px] font-bold text-slate-400 mb-2">Team member Availability</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-emerald-500">Active</span>
                  <div className="w-10 h-5 bg-emerald-500 rounded-full relative cursor-pointer">
                    <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full shadow-sm"></div>
                  </div>
                </div>
              </div>

              <div className="px-4 py-3 border-t border-slate-50">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[12px] font-bold text-slate-400">Plan</span>
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[10px] font-bold rounded-full border border-emerald-100">Active</span>
                </div>
                  <div className="flex items-center gap-2">
                    <Icon icon="feather:award" className="w-4 h-4 text-emerald-500" />
                    <span className="text-sm font-bold text-emerald-600">{user?.subscriptionPlan?.charAt(0).toUpperCase() + user?.subscriptionPlan?.slice(1) || "Free"}</span>
                  </div>
                  <span className="text-sm font-bold text-emerald-500">
                    {user?.subscriptionEndDate ? `${getDaysRemaining(user.subscriptionEndDate)} days left` : "No expiry"}
                  </span>
              </div>

              <div className="px-2 pt-2 border-t border-slate-50 flex flex-col">
                <button className="flex items-center gap-3 px-3 py-2 hover:bg-slate-50 rounded-lg text-slate-600 text-sm font-bold"><Icon icon="feather:headphones" className="w-4 h-4" /> Contact us</button>
                <button className="flex items-center gap-3 px-3 py-2 hover:bg-slate-50 rounded-lg text-slate-600 text-sm font-bold"><Icon icon="feather:external-link" className="w-4 h-4" /> Help doc</button>
                <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2 hover:bg-red-50 rounded-lg text-red-500 text-sm font-bold mt-1"><Icon icon="feather:log-out" className="w-4 h-4" /> Logout</button>
              </div>

              <div className="px-4 pt-3 border-t border-slate-50 mt-2">
                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-300 uppercase tracking-widest"><Icon icon="feather:info" className="w-3 h-3" /> Version 10.0.35</div>
              </div>
            </div>
          )}

                    {isOpen && (
            <div className="bg-[#F8FAFC] rounded-xl p-2.5 mb-2 border border-slate-50 shadow-sm">
              <div className="flex justify-between items-start">
                <div className="flex flex-col gap-0.5">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Plan</p>
                  <h4 className="text-[13px] font-extrabold text-slate-900">{user?.subscriptionPlan ? user.subscriptionPlan.charAt(0).toUpperCase() + user.subscriptionPlan.slice(1) : "Free"}</h4>
                </div>
                <div className="text-right flex flex-col gap-0.5">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">WCC Credit</p>
                  <span className="text-[13px] font-extrabold text-[#10B981]">₹{(user?.credits || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>
          )}


          {/* User Section trigger */}
          <div onClick={() => setIsProfilePopupOpen(!isProfilePopupOpen)} className={`flex items-center justify-between cursor-pointer group hover:bg-slate-50 p-1 rounded-xl transition-all ${isOpen ? "px-1" : "justify-center"}`}>
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="relative shrink-0">
                <div className="w-10 h-10 rounded-full bg-[#E2E8F0] flex items-center justify-center border-2 border-white shadow-sm overflow-hidden">
                   <img src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "User")}&background=10B981&color=fff`} alt="Avatar" className="w-full h-full object-cover" />
                </div>
                <span className="absolute bottom-0.5 right-0.5 w-3 h-3 bg-[#10B981] border-2 border-white rounded-full"></span>
              </div>
              {isOpen && (
                <div className="flex flex-col truncate">
                  <span className="text-[14px] font-bold text-slate-900 truncate">{user?.name || "User"}</span>
                  <span className="text-[11px] font-medium text-slate-400 truncate">{user?.role || "Member"}</span>
                </div>
              )}
            </div>
            {isOpen && <Icon icon="feather:chevron-right" className={`w-4 h-4 text-slate-300 transition-transform ${isProfilePopupOpen ? 'rotate-90' : ''}`} />}
          </div>
          
          {!isOpen && (
            <button onClick={handleLogout} className="mt-4 w-full flex justify-center p-2 text-slate-400 hover:text-red-500 transition-colors" title="Logout">
              <Icon icon="feather:log-out" className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default MainSidebar;