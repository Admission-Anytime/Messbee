import React from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { 
  BookOpenIcon, 
  QuestionMarkCircleIcon, 
  LifebuoyIcon, 
  CodeBracketIcon 
} from "@heroicons/react/24/outline";

const HelpLayout = () => {
  const location = useLocation();

  const navItems = [
    { name: "Introduction", path: "/admin/help/introduction", icon: BookOpenIcon },
    { name: "FAQ", path: "/admin/help/faq", icon: QuestionMarkCircleIcon },
    { name: "Support Center", path: "/admin/help/support", icon: LifebuoyIcon },
    { name: "API Documentation", path: "/admin/help/api-docs", icon: CodeBracketIcon },
  ];

  return (
    <div className="flex flex-col h-full bg-gray-50 w-full overflow-hidden font-sans">
      <div className="bg-white border-b border-gray-200 shrink-0 px-6 sm:px-10 z-10 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-6 pb-2">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Help & Support</h1>
            <p className="text-sm text-slate-500 font-medium mt-1">Everything you need to manage your MessBee account.</p>
          </div>
        </div>

        <div className="flex overflow-x-auto hide-scrollbar gap-6 mt-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.includes(item.path);

            return (
              <NavLink
                key={item.name}
                to={item.path}
                className={`flex items-center gap-2 pb-3 text-sm font-bold whitespace-nowrap transition-colors border-b-2 ${
                  isActive
                    ? "border-[#22C55E] text-[#22C55E]"
                    : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? "text-[#22C55E]" : "text-slate-400"}`} />
                {item.name}
              </NavLink>
            );
          })}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar relative">
        <Outlet />
      </div>
    </div>
  );
};

export default HelpLayout;