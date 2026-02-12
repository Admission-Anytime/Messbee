import React from "react";
import { XMarkIcon, PhoneIcon, VideoCameraIcon } from "@heroicons/react/24/outline";

const UserProfilePanel = ({ data, onClose }) => {
  return (
    <div className="h-full flex flex-col bg-white overflow-y-auto custom-scrollbar border-l border-gray-200">
      
      {/* --- HEADER (With Close Button) --- */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100 shrink-0 bg-white sticky top-0 z-10">
        <h3 className="text-base font-bold text-slate-800">Contact Info</h3>
        
        {/* Close / Minimize Button */}
        <button 
          onClick={onClose} 
          className="p-2 -mr-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-all"
          title="Close Profile"
        >
           <XMarkIcon className="w-5 h-5" />
        </button>
      </div>

      {/* --- PROFILE PIC --- */}
      <div className="p-6 flex flex-col items-center border-b border-slate-50">
        <div className="relative">
            <img src={data.avatar} alt="" className="w-24 h-24 rounded-full border-4 border-white shadow-md object-cover" />
            <span className={`absolute bottom-1 right-1 w-4 h-4 border-2 border-white rounded-full ${data.status === 'active' ? 'bg-green-500' : 'bg-gray-300'}`}></span>
        </div>
        
        <h2 className="text-xl font-bold text-slate-800 mt-3">{data.name}</h2>
        <p className="text-sm text-slate-500 font-medium mb-5">{data.phone}</p>
        
        <div className="flex gap-3 w-full">
           <button className="flex-1 py-2.5 bg-white text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 transition-colors border border-slate-200 flex items-center justify-center gap-2 shadow-sm">
             <PhoneIcon className="w-4 h-4 text-slate-500" />
             Call
           </button>
           <button className="flex-1 py-2.5 bg-white text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 transition-colors border border-slate-200 flex items-center justify-center gap-2 shadow-sm">
             <VideoCameraIcon className="w-4 h-4 text-slate-500" />
             Video
           </button>
        </div>
      </div>

      {/* --- CRM DETAILS --- */}
      <div className="p-6 space-y-6">
        
        {/* About */}
        <div>
           <h4 className="text-xs font-bold text-slate-400 uppercase mb-2 tracking-wider">About</h4>
           <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
             Lead generated via Facebook Campaign. Interested in Full Stack Development course.
           </p>
        </div>

        {/* Info Grid */}
        <div className="space-y-4">
           <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase mb-1 tracking-wider">Email</h4>
              <p className="text-sm font-semibold text-slate-700">{data.email || "No email provided"}</p>
           </div>
           
           <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase mb-2 tracking-wider">Tags</h4>
              <div className="flex flex-wrap gap-2">
                  {data.type === 'blocked' ? (
                      <span className="px-2.5 py-1 bg-red-50 text-red-600 text-[10px] font-bold rounded-md border border-red-100">Blocked</span>
                  ) : (
                      <>
                         <span className="px-2.5 py-1 bg-green-50 text-green-600 text-[10px] font-bold rounded-md border border-green-100">Active</span>
                         <span className="px-2.5 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-md border border-blue-100">Lead</span>
                      </>
                  )}
              </div>
           </div>
        </div>

        {/* Media */}
        <div>
           <h4 className="text-xs font-bold text-slate-400 uppercase mb-3 tracking-wider flex justify-between items-center">
              <span>Media (12)</span>
              <span className="text-[#ba2525] cursor-pointer hover:underline text-[10px]">View All</span>
           </h4>
           <div className="grid grid-cols-3 gap-2">
              <div className="aspect-square bg-slate-100 rounded-lg border border-slate-200"></div>
              <div className="aspect-square bg-slate-100 rounded-lg border border-slate-200"></div>
              <div className="aspect-square bg-slate-100 rounded-lg border border-slate-200"></div>
           </div>
        </div>

      </div>
    </div>
  );
};

export default UserProfilePanel;