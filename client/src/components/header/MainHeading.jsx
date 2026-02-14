import React, { useState, useEffect, useRef } from "react";
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
  DocumentTextIcon
} from "@heroicons/react/24/outline"; 

// --- ASSETS ---
import logoIcon from "../../assets/MessBee Logo.png"; 
import logoName from "../../assets/MessBee Name.png";

const MainHeading = ({ onMenuClick }) => {
  const navigate = useNavigate(); 
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);

  // --- 1. USER DATA ---
  const [userProfile, setUserProfile] = useState({
    name: "Admission Anytime",
    email: "admin@admissionanytime.com", 
    phone: "9910700098", 
    credits: "618.51", 
    avatar: "https://i.pravatar.cc/150?u=admission" 
  });

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="w-full flex items-center justify-between px-4 lg:px-6 py-2 bg-white border-b border-gray-100 shadow-sm sticky top-0 z-50 font-['Urbanist'] h-[70px]">
      
      {/* --- LEFT: LOGO SECTION --- */}
      <div className="flex items-center gap-4 shrink-0">
        <button 
          onClick={onMenuClick} 
          className="lg:hidden p-2 text-slate-500 hover:bg-slate-50 rounded-lg transition-colors"
        >
          <Bars3Icon className="w-6 h-6" />
        </button>

        {/* Branding */}
        <div 
          onClick={() => navigate('/admin/dashboard')} 
          className="flex items-center gap-2 cursor-pointer"
          title="Go to Dashboard"
        >
            {/* Logo Icon */}
            <img 
              src={logoIcon} 
              alt="MessBee Logo" 
              className="w-8 h-8 object-contain" 
            />
            
            {/* Logo Name */}
            <img 
              src={logoName} 
              alt="MessBee Name" 
              className="h-6 w-auto object-contain mt-1" 
            />
        </div>
      </div>

      {/* --- CENTER: SEARCH BAR --- */}
      <div className="flex-1 max-w-xl mx-6 hidden md:block">
         <div className="w-full h-10 bg-[#F1F5F9] rounded-lg border border-transparent focus-within:border-gray-300 focus-within:bg-white transition-all relative flex items-center group">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-gray-400 ml-3 group-focus-within:text-gray-600">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input 
              type="text" 
              className="w-full h-full bg-transparent rounded-lg px-3 text-sm text-gray-700 placeholder-gray-400 focus:outline-none font-medium"
              placeholder="Search conversations, contacts..." 
            />
            
         </div>
      </div>

      {/* --- RIGHT: STATUS, CREDITS & PROFILE --- */}
      <div className="flex items-center gap-4 shrink-0">
        
        {/* 1. API Status Pill */}
        <button 
           onClick={() => navigate('/admin/developer/api')} 
           className="hidden xl:flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-full border border-emerald-100 hover:bg-emerald-100 hover:border-emerald-200 transition-all cursor-pointer group"
           title="View API Status"
        >
           <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
           </span>
           <div className="flex flex-col leading-none items-start">
              <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-wide group-hover:text-emerald-700">API Status</span>
              <span className="text-[10px] font-bold text-emerald-700">Online</span>
           </div>
        </button>

        {/* 2. Credits Pill */}
        <button 
           onClick={() => navigate('/admin/plan/billing')} 
           className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-full border border-gray-200 hover:bg-gray-100 hover:border-gray-300 transition-all cursor-pointer group" 
           title="Manage Credits"
        >
           <WalletIcon className="w-4 h-4 text-slate-500 group-hover:text-slate-700" />
           <div className="flex flex-col leading-none items-start">
              <span className="text-[9px] font-bold text-slate-400 uppercase group-hover:text-slate-500">Credits</span>
              <span className="text-[11px] font-bold text-slate-800">₹{userProfile.credits}</span>
           </div>
        </button>

        <div className="h-8 w-[1px] bg-gray-200 hidden md:block mx-1"></div>

        {/* 3. Action Icons */}
        <div className="flex items-center gap-1 text-slate-500">
           <button onClick={() => navigate('/admin/notifications')} className="p-2 rounded-full hover:bg-slate-50 hover:text-slate-800 transition-colors relative">
              <BellIcon className="w-6 h-6" />
              <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
           </button>
           
           <button onClick={() => navigate('/admin/help/support')} className="p-2 rounded-full hover:bg-slate-50 hover:text-slate-800 transition-colors">
              <QuestionMarkCircleIcon className="w-6 h-6" />
           </button>
           
           {/* ✅ FIXED: Points to WhatsApp Config instead of broken /admin/settings */}
           <button onClick={() => navigate('/admin/settings/whatsapp')} className="p-2 rounded-full hover:bg-slate-50 hover:text-slate-800 transition-colors">
              <Cog6ToothIcon className="w-6 h-6" />
           </button>
        </div>

        {/* 4. PROFILE DROPDOWN */}
        <div className="relative" ref={profileRef}>
           <div 
             onClick={() => setIsProfileOpen(!isProfileOpen)}
             className="flex items-center gap-3 cursor-pointer hover:bg-slate-50 p-1 rounded-lg transition-colors border border-transparent hover:border-slate-100"
           >
              <img 
                src={userProfile.avatar} 
                alt="Profile" 
                className="w-9 h-9 rounded-full object-cover border border-gray-200 shadow-sm"
              />
              <div className="hidden xl:flex flex-col items-start leading-tight">
                 <span className="text-[13px] font-bold text-slate-800">{userProfile.name}</span>
                 <span className="text-[11px] font-medium text-slate-400">{userProfile.phone}</span>
              </div>
           </div>

           {/* Dropdown Menu */}
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
                   <button onClick={() => navigate('/admin/account/profile')} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-lg transition-colors text-left">
                      <UserIcon className="w-4 h-4" /> My Profile
                   </button>
                   <button onClick={() => navigate('/admin/profile/business')} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-lg transition-colors text-left">
                      <BuildingOfficeIcon className="w-4 h-4" /> Organization Settings
                   </button>
                   <button onClick={() => navigate('/admin/help/docs')} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-lg transition-colors text-left">
                      <DocumentTextIcon className="w-4 h-4" /> API Documentation
                   </button>
                </div>

                <div className="h-px bg-gray-100 my-2 mx-2"></div>

                <div className="px-2">
                   <button className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 rounded-lg transition-colors text-left">
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