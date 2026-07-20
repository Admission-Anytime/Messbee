import React, { useState } from "react";

function getInitials(name){return name.split(" ").map(n=>n[0]).join("").toUpperCase().slice(0,2);}

function Avatar({member,size="md"}){
  const sz=size==="md"?"w-10 h-10 text-sm":size==="sm"?"w-9 h-9 text-xs":"w-8 h-8 text-xs";
  if(member.avatar)return<img src={member.avatar} alt={member.name} className={`${sz} rounded-full object-cover flex-shrink-0`}/>;
  return<div className={`${sz} rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-600 flex-shrink-0`}>{getInitials(member.name)}</div>;
}

export default function EditMemberModal({member,open,onClose,onSave,toast}){
  const[role,setRole]=useState(member?.role||"AGENT");
  const[status,setStatus]=useState(member?.status||"Active");

  const handleSave=()=>{
    onSave(member.id,{role,status});
    onClose();
    toast(`${member.name} updated successfully`);
  };

  if(!open||!member)return null;

  return(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6" style={{animation:"popIn 0.2s ease"}} onClick={e=>e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-gray-900">Edit Member</h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 transition text-lg">×</button>
        </div>
        <div className="flex items-center gap-3 mb-5 p-3 bg-gray-50 rounded-xl border border-gray-100">
          <Avatar member={member}/>
          <div>
            <p className="text-sm font-semibold text-gray-800">{member.name}</p>
            <p className="text-xs text-gray-400">{member.email}</p>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Role</label>
            <div className="relative">
              <select value={role} onChange={e=>setRole(e.target.value)} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-green-400 appearance-none bg-white">
                <option value="ADMIN">Admin</option>
                <option value="MANAGER">Manager</option>
                <option value="AGENT">Agent</option>
              </select>
              <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/></svg>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Status</label>
            <div className="relative">
              <select value={status} onChange={e=>setStatus(e.target.value)} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-green-400 appearance-none bg-white">
                <option>Active</option>
                <option>Offline</option>
                <option>Pending</option>
              </select>
              <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/></svg>
            </div>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 py-2.5 text-sm font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition">Cancel</button>
          <button onClick={handleSave} className="flex-1 py-2.5 text-sm font-semibold text-white bg-green-500 hover:bg-green-600 rounded-xl transition">Save Changes</button>
        </div>
      </div>
    </div>
  );
}
