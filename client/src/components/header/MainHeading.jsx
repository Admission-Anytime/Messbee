import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; 
import { 
  Bars3Icon, 
  Cog6ToothIcon, 
  RectangleGroupIcon, 
  QuestionMarkCircleIcon 
} from "@heroicons/react/24/outline"; 

// --- ASSETS ---
import logoIcon from "../../assets/MessBee Logo.png"; 
import logoName from "../../assets/MessBee Name.png";

const MainHeading = ({ onMenuClick }) => {
  const navigate = useNavigate(); 

  const [userProfile, setUserProfile] = useState({
    name: "Loading...",
    phone: "...",
    avatar: "https://via.placeholder.com/150"
  });

  useEffect(() => {
    // Simulating fetched data:
    const fetchedData = {
      name: "Admission Anytime",
      phone: "9910700098", 
      avatar: "https://i.pravatar.cc/150?u=admission" 
    };
    setUserProfile(fetchedData);
  }, []);

  return (
    // ✅ CHANGED: h-[85px] -> h-[70px]
    <div className="w-full flex items-center justify-between px-6 py-2 bg-[#EBF5F0] border-b border-gray-200 sticky top-0 z-50 font-['Urbanist'] h-[70px]">
      
      {/* --- LEFT: LOGO SECTION --- */}
      <div className="flex items-center gap-3 shrink-0">
        <button 
          onClick={onMenuClick} 
          className="lg:hidden p-2 text-slate-600 hover:bg-black/5 rounded-lg transition-colors"
        >
          <Bars3Icon className="w-7 h-7" />
        </button>

        <div 
          onClick={() => navigate('/admin/dashboard')} 
          className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
          title="Go to Dashboard"
        >
            <img 
              src={logoIcon} 
              alt="MessBee Logo" 
              className="w-8 h-8 object-contain" // Slightly smaller logo for 70px height
              onError={(e) => {e.target.style.display='none'}} 
            />
            <img 
              src={logoName} 
              alt="MessBee Name" 
              className="h-5 w-auto object-contain hidden sm:block" 
              onError={(e) => {e.target.style.display='none'}} 
            />
        </div>
      </div>

      {/* --- CENTER: SEARCH BAR --- */}
      <div className="flex-1 max-w-4xl mx-8 hidden md:block">
         <div className="w-full h-9 bg-white rounded-full shadow-sm border border-transparent focus-within:border-gray-200 transition-all relative flex items-center">
            <input 
              type="text" 
              className="w-full h-full bg-transparent rounded-full px-6 text-sm text-gray-700 placeholder-gray-400 focus:outline-none"
              placeholder="" 
            />
         </div>
      </div>

      {/* --- RIGHT: ICONS & PROFILE --- */}
      <div className="flex items-center gap-5 shrink-0">
        
        {/* Action Icons */}
        <div className="flex items-center gap-3 text-[#1F2937]">
           <button 
             onClick={() => navigate('/admin/help/support')}
             className="p-1.5 rounded-full hover:bg-black/5 transition-colors" 
             title="Help & Support"
           >
              <QuestionMarkCircleIcon className="w-6 h-6" />
           </button>
           
           <button 
             onClick={() => navigate('/admin/account/settings')}
             className="p-1.5 rounded-full hover:bg-black/5 transition-colors" 
             title="Account Settings"
           >
              <Cog6ToothIcon className="w-6 h-6" />
           </button>
           
           <button 
             onClick={() => navigate('/admin/templates/list')}
             className="p-1.5 rounded-full hover:bg-black/5 transition-colors" 
             title="Templates"
           >
              <RectangleGroupIcon className="w-6 h-6" />
           </button>
        </div>

        {/* --- PROFILE SECTION --- */}
        <div 
          onClick={() => navigate('/admin/account/profile')}
          className="flex flex-col items-center justify-center text-center leading-tight cursor-pointer group"
          title="View Profile"
        >
           <img 
             src={userProfile.avatar} 
             alt="Profile" 
             className="w-9 h-9 rounded-full object-cover border-2 border-white shadow-sm mb-0.5 group-hover:border-gray-300 transition-colors"
             onError={(e) => {e.target.onerror = null; e.target.src="https://via.placeholder.com/150"}} 
           />
           <div className="flex flex-col group-hover:opacity-80 transition-opacity">
              <span className="text-[11px] font-bold text-[#1e1b4b]">
                {userProfile.name}
              </span>
              <span className="text-[10px] font-semibold text-[#1e1b4b]">
                {userProfile.phone}
              </span>
           </div>
        </div>

      </div>

    </div>
  );
};

export default MainHeading;