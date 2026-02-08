import React from "react";
// ❌ REMOVED: import MainSidebar from "../../components/mainsidebar/MainSidebar";
import FirstHeader from "../../components/header/FirstHeader";
import MainHeading from "../../components/header/MainHeading";

const Automation = () => {
  return (
    // ✅ CHANGED: Standard Tailwind container that fills the Outlet space
    <div className="w-full h-full flex flex-col overflow-hidden bg-slate-50 font-['Urbanist']">
      
      {/* ❌ REMOVED: <MainSidebar /> */}

      {/* --- HEADERS (Fixed at Top) --- */}
      <div className="shrink-0 z-20 shadow-sm bg-white">
        <FirstHeader />
        <MainHeading />
      </div>

      {/* --- MAIN CONTENT AREA --- */}
      <div className="flex-1 overflow-auto p-6">
        
        {/* Placeholder Content for Automation */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 h-full flex flex-col items-center justify-center text-slate-400">
           <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
           </div>
           <h2 className="text-xl font-bold text-slate-600">Automation Rules</h2>
           <p className="text-sm mt-2">Configure your automated workflows here.</p>
        </div>

      </div>
    </div>
  );
};

export default Automation;