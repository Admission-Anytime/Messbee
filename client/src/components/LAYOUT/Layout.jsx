import React, { useState, useEffect } from "react";
import { Outlet, useSearchParams } from "react-router-dom";
// ✅ Adjust these paths if your folders are different
import MainSidebar from "../mainsidebar/MainSidebar"; 
import MainHeading from "../header/MainHeading"; 
import QrConnectModal from "../Modol/QrConnectModal";

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  // Auto open QR modal if user registered via Free QR flow
  useEffect(() => {
    if (searchParams.get("welcome_qr") === "true") {
      setIsQrModalOpen(true);
      // Clean query parameter after opening
      searchParams.delete("welcome_qr");
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

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

      {/* QR Connect Modal for Free Tier WhatsApp */}
      <QrConnectModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
      />
    </div>
  );
};

export default Layout;