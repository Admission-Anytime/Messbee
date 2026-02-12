import React, { useState, useRef, useEffect } from "react";
import { 
  Bars3Icon, 
  BellIcon, 
  SparklesIcon,
  ChevronDownIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  Cog6ToothIcon
} from "@heroicons/react/24/outline";

// Helper to get initials
const getInitials = (name) => name.substring(0, 2).toUpperCase();

const MainHeading = ({ onMenuClick }) => {
  const userName = "Hitesh";
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    // ✅ RESTORED RED GRADIENT: Matches your original preference
    <div className="w-full flex justify-between items-center bg-gradient-to-r from-[#ba2525] to-[#9f1b1b] px-4 md:px-6 py-3 shadow-md text-white sticky top-0 z-30 border-b border-white/10 font-['Urbanist']">
      
      {/* --- LEFT: Brand & Menu --- */}
      <div className="flex items-center gap-4">
        
        {/* Mobile Menu Icon (Hamburger) */}
        {/* You must pass `onMenuClick` from your parent layout to make this work */}
        <button 
          onClick={onMenuClick} 
          className="lg:hidden p-1.5 rounded-lg hover:bg-white/10 transition-colors text-white"
        >
          <Bars3Icon className="w-7 h-7" />
        </button>

        {/* Greeting / Brand */}
        <div className="flex flex-col">
          <div className="flex items-baseline gap-2 select-none">
            <span className="text-xl md:text-2xl font-medium text-amber-50 tracking-tight opacity-90">
              Hello,
            </span>
            <span className="text-xl md:text-2xl font-extrabold tracking-widest uppercase text-white drop-shadow-sm">
              {userName}
            </span>
          </div>
        </div>
      </div>

      {/* --- RIGHT: Actions --- */}
      <div className="flex items-center gap-3 md:gap-5">
        
        {/* 'Current Plan' Badge - Glass Effect */}
        <div className="hidden sm:flex items-center gap-2 px-4 py-1.5 bg-black/20 border border-white/10 rounded-full shadow-inner cursor-default hover:bg-black/30 transition-all">
          <SparklesIcon className="w-3.5 h-3.5 text-amber-300" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-white/90">
            Current Plan
          </span>
        </div>

        {/* Notification Bell */}
        <div className="relative cursor-pointer p-2 rounded-full hover:bg-white/10 transition-all group">
          <BellIcon className="w-6 h-6 text-white opacity-90 group-hover:opacity-100" />
          {/* Status Dot */}
          <span className="absolute top-2 right-2.5 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-400 border-2 border-[#a52020]"></span>
          </span>
        </div>

        {/* Divider */}
        <div className="h-8 w-px bg-white/20 hidden sm:block"></div>

        {/* Profile Dropdown */}
        <div className="relative" ref={profileRef}>
           <div 
             onClick={() => setIsProfileOpen(!isProfileOpen)}
             className="flex items-center gap-2 cursor-pointer group p-1 rounded-lg hover:bg-white/10 transition-all"
           >
              <div className="w-9 h-9 rounded-full bg-amber-50 text-[#ba2525] border-2 border-white/20 flex items-center justify-center font-bold text-xs shadow-sm">
                 {getInitials(userName)}
              </div>
              <ChevronDownIcon className={`w-4 h-4 text-white/80 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
           </div>

           {/* Dropdown Menu */}
           {isProfileOpen && (
             <div className="absolute right-0 top-12 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-2 text-slate-700 animate-fade-in-up z-50">
                <div className="px-4 py-2 border-b border-slate-100 mb-1">
                  <p className="text-xs text-slate-400 font-semibold">Signed in as</p>
                  <p className="text-sm font-bold text-slate-800 truncate">{userName}</p>
                </div>
                <button className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 flex items-center gap-2 transition-colors">
                  <UserCircleIcon className="w-4 h-4" /> Profile
                </button>
                <button className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 flex items-center gap-2 transition-colors">
                  <Cog6ToothIcon className="w-4 h-4" /> Settings
                </button>
                <div className="border-t border-slate-100 my-1"></div>
                <button className="w-full text-left px-4 py-2 text-sm text-[#ba2525] hover:bg-red-50 flex items-center gap-2 transition-colors font-medium">
                  <ArrowRightOnRectangleIcon className="w-4 h-4" /> Logout
                </button>
             </div>
           )}
        </div>

      </div>
    </div>
  );
};

export default MainHeading;