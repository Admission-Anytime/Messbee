import React, { useState } from "react";
import { Outlet } from "react-router-dom";
// ✅ Adjust these paths if your folders are different
import MainSidebar from "../mainsidebar/MainSidebar"; 
import MainHeading from "../header/MainHeading"; 

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden font-['Urbanist']">
      
      {/* 1. Sidebar (Fixed Left) */}
      <MainSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      {/* 2. Content Area (Right Side) */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* Header (Top) */}
        <MainHeading onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />

        {/* Dynamic Page Content (Middle) */}
        <main className="flex-1 overflow-y-auto pb-20 relative">
           {/* This <Outlet> is where Dashboard, Pricing, etc. will appear */}
           <Outlet /> 
        </main>
      </div>
    </div>
  );
};

export default Layout;