import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// --- ICONS ---
const ChevronRight = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
);
const ChevronDown = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
);
const CollapseIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" /></svg>
);

const SecondrySidebar = ({ heading, items, customNavigate }) => {
  const navigate = useNavigate();
  const [expandedKeys, setExpandedKeys] = useState(["sub1"]);
  const [isCollapsed, setIsCollapsed] = useState(false); // New Collapsed State

  // Auto-close submenus when sidebar collapses to avoid UI glitches
  useEffect(() => {
    if (isCollapsed) {
      setExpandedKeys([]);
    }
  }, [isCollapsed]);

  const toggleSubmenu = (key) => {
    // If collapsed, expanding a menu should auto-open the sidebar
    if (isCollapsed) setIsCollapsed(false);
    
    setExpandedKeys((prev) => 
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const handleClick = (item) => {
    if (item.key === "log-out") return console.log("log-out");

    if (item.children && item.children.length > 0) {
      toggleSubmenu(item.key);
    } else {
      navigate(`${customNavigate}${item.key}`);
    }
  };

  const renderMenuItems = (menuItems, level = 0) => {
    return menuItems.map((item) => {
      const hasChildren = item.children && item.children.length > 0;
      const isExpanded = expandedKeys.includes(item.key);
      const paddingLeft = isCollapsed ? "px-0 justify-center" : (level === 0 ? "px-4" : "pl-11"); 

      return (
        <div key={item.key} className="mb-1">
          <div
            onClick={() => handleClick(item)}
            className={`
              group relative flex items-center py-2.5 mx-2 rounded-lg cursor-pointer transition-all duration-200
              ${paddingLeft}
              ${!isCollapsed && "justify-between"} 
              ${hasChildren 
                ? "text-slate-800 font-bold hover:bg-slate-50" 
                : "text-slate-500 font-medium hover:text-[#ba2525] hover:bg-[#ba2525]/5" 
              }
            `}
          >
            {/* Label & Icon Wrapper */}
            <div className={`flex items-center gap-3 ${isCollapsed ? "justify-center" : ""}`}>
              {/* Icon */}
              {item.icon && (
                <span className={`text-lg shrink-0 transition-colors ${hasChildren ? "text-slate-600" : "opacity-70 group-hover:text-[#ba2525]"}`}>
                  {item.icon}
                </span>
              )}
              
              {/* Label (Hidden if Collapsed) */}
              {!isCollapsed && (
                <span className="text-sm tracking-wide whitespace-nowrap overflow-hidden text-ellipsis">
                  {item.label}
                </span>
              )}
            </div>

            {/* Accordion Arrow (Hidden if Collapsed) */}
            {!isCollapsed && hasChildren && (
              <span className="text-slate-400 group-hover:text-slate-600 transition-colors">
                {isExpanded ? <ChevronDown /> : <ChevronRight />}
              </span>
            )}

            {/* TOOLTIP (Only Visible when Collapsed) */}
            {isCollapsed && (
              <div className="fixed left-20 ml-8 bg-slate-800 text-white text-xs font-medium px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-[60] whitespace-nowrap hidden group-hover:block">
                {item.label}
                {/* Tiny arrow */}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full border-y-4 border-y-transparent border-r-4 border-r-slate-800"></div>
              </div>
            )}
          </div>

          {/* Nested Children (Only if Sidebar is OPEN) */}
          {!isCollapsed && hasChildren && (
            <div 
              className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"}`}
            >
              <div className="border-l-2 border-slate-100 ml-7 my-1 space-y-1">
                {renderMenuItems(item.children, level + 1)}
              </div>
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div 
      className={`
        h-screen bg-white border-r border-slate-200 flex flex-col font-['Urbanist'] shadow-sm transition-all duration-300 ease-in-out
        ${isCollapsed ? "w-20 min-w-[5rem]" : "w-64 min-w-[16rem]"}
      `}
    >
      
      {/* --- HEADER --- */}
      <div className={`p-6 pb-4 shrink-0 flex items-center ${isCollapsed ? "justify-center px-0" : "justify-between"}`}>
        
        {/* Title (Hidden if collapsed) */}
        <div className={`transition-opacity duration-200 ${isCollapsed ? "opacity-0 w-0 hidden" : "opacity-100"}`}>
          <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight whitespace-nowrap overflow-hidden">
            {heading}
          </h2>
          <div className="h-1 w-12 bg-[#ba2525] mt-2 rounded-full opacity-80"></div>
        </div>

        {/* --- HIDE/SHOW BUTTON --- */}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-full hover:bg-slate-100 text-slate-500 hover:text-[#ba2525] transition-all"
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          <div className={`transition-transform duration-300 ${isCollapsed ? "rotate-180" : "rotate-0"}`}>
            <CollapseIcon />
          </div>
        </button>
      </div>

      {/* --- MENU LIST --- */}
      <div className="flex-1 overflow-y-auto px-1 pb-4 custom-scrollbar">
        {renderMenuItems(items)}
      </div>

      {/* --- SCROLLBAR STYLE --- */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #cbd5e1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: #94a3b8;
        }
      `}</style>
    </div>
  );
};

export default SecondrySidebar;