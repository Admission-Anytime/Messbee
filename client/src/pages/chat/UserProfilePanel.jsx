import React from "react";

const UserProfilePanel = ({ data, onClose }) => {
  return (
    <div className="h-full flex flex-col bg-white overflow-y-auto custom-scrollbar">
      
      {/* Header */}
      <div className="h-16 flex items-center px-6 border-b border-slate-100 shrink-0 bg-slate-50/50">
        <button onClick={onClose} className="mr-4 text-slate-400 hover:text-slate-600 xl:hidden">
           <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
        <h3 className="text-base font-bold text-slate-800">Contact Info</h3>
      </div>

      {/* Profile Pic */}
      <div className="p-6 flex flex-col items-center border-b border-slate-50">
        <img src={data.avatar} alt="" className="w-24 h-24 rounded-full border-4 border-slate-50 mb-3 shadow-sm" />
        <h2 className="text-xl font-bold text-slate-800">{data.name}</h2>
        <p className="text-sm text-slate-500 font-medium">{data.phone}</p>
        
        <div className="flex gap-3 mt-5 w-full">
           <button className="flex-1 py-2.5 bg-slate-50 text-slate-600 text-xs font-bold rounded-xl hover:bg-slate-100 transition-colors border border-slate-100 flex items-center justify-center gap-2">
             <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
             Call
           </button>
           <button className="flex-1 py-2.5 bg-slate-50 text-slate-600 text-xs font-bold rounded-xl hover:bg-slate-100 transition-colors border border-slate-100 flex items-center justify-center gap-2">
             <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
             Video
           </button>
        </div>
      </div>

      {/* CRM Details */}
      <div className="p-6 space-y-6">
        <div>
           <h4 className="text-xs font-bold text-slate-400 uppercase mb-2 tracking-wider">About</h4>
           <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
             Lead generated via Facebook Campaign. Interested in Full Stack Development course.
           </p>
        </div>

        <div className="space-y-4">
           <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase mb-1 tracking-wider">Email</h4>
              <p className="text-sm font-semibold text-slate-700">{data.email}</p>
           </div>
           <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase mb-2 tracking-wider">Tags</h4>
              <div className="flex flex-wrap gap-2">
                 {data.type === 'blocked' ? (
                     <span className="px-2.5 py-1 bg-red-100 text-red-700 text-[10px] font-bold rounded-md">Blocked</span>
                 ) : (
                     <>
                        <span className="px-2.5 py-1 bg-green-100 text-green-700 text-[10px] font-bold rounded-md">Active</span>
                        <span className="px-2.5 py-1 bg-blue-100 text-blue-700 text-[10px] font-bold rounded-md">Lead</span>
                     </>
                 )}
              </div>
           </div>
        </div>

        <div>
           <h4 className="text-xs font-bold text-slate-400 uppercase mb-3 tracking-wider flex justify-between">
              <span>Media (12)</span>
              <span className="text-[#ba2525] cursor-pointer hover:underline">View All</span>
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