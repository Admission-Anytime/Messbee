import React, { useState } from "react";

export default function InviteModal({open,onClose,onInvite,toast}){
  const [form,setForm]=useState({name:"",email:"",role:"Admin",message:""});
  const [errors,setErrors]=useState({});
  const [sending,setSending]=useState(false);

  const validate=()=>{
    const e={};
    if(!form.name.trim())e.name="Full name is required";
    if(!form.email.trim())e.email="Work email is required";
    else if(!/\S+@\S+\.\S+/.test(form.email))e.email="Enter a valid email";
    return e;
  };

  const handleSubmit=async()=>{
    const e=validate();
    if(Object.keys(e).length){setErrors(e);return;}
    setSending(true);
    try{
      await onInvite({name:form.name,email:form.email,role:form.role.toUpperCase()});
      setForm({name:"",email:"",role:"Admin",message:""});
      setErrors({});
      onClose();
    }catch(err){
      // error handled by parent
    }finally{
      setSending(false);
    }
  };

  const handleClose=()=>{
    setForm({name:"",email:"",role:"Admin",message:""});
    setErrors({});
    onClose();
  };

  if(!open)return null;

  return(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 backdrop-blur-sm" onClick={handleClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4" style={{animation:"popIn 0.2s ease"}} onClick={e=>e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <h3 className="text-xl font-bold text-gray-900">Invite Team Member</h3>
          <button onClick={handleClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 transition text-lg">×</button>
        </div>
        <div className="px-6 pb-6 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1.5">Full Name</label>
            <input type="text" placeholder="e.g. John Doe" value={form.name} onChange={e=>{setForm(f=>({...f,name:e.target.value}));setErrors(er=>({...er,name:""}));}} className={`w-full px-4 py-2.5 text-sm border rounded-xl outline-none transition ${errors.name?"border-red-400 focus:ring-2 focus:ring-red-100":"border-gray-200 focus:border-green-400 focus:ring-2 focus:ring-green-100"}`}/>
            {errors.name&&<p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1.5">Work Email</label>
            <input type="email" placeholder="name@company.com" value={form.email} onChange={e=>{setForm(f=>({...f,email:e.target.value}));setErrors(er=>({...er,email:""}));}} className={`w-full px-4 py-2.5 text-sm border rounded-xl outline-none transition ${errors.email?"border-red-400 focus:ring-2 focus:ring-red-100":"border-gray-200 focus:border-green-400 focus:ring-2 focus:ring-green-100"}`}/>
            {errors.email&&<p className="text-xs text-red-500 mt-1">{errors.email}</p>}
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1.5">Select Role</label>
            <div className="relative">
              <select value={form.role} onChange={e=>setForm(f=>({...f,role:e.target.value}))} className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-green-400 appearance-none bg-white transition">
                <option>Admin</option>
                <option>Manager</option>
                <option>Agent</option>
              </select>
              <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/></svg>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-semibold text-gray-800">Personal Message</label>
              <span className="text-xs font-semibold text-gray-400 tracking-wider">OPTIONAL</span>
            </div>
            <textarea rows={3} placeholder="Welcome to the team!" value={form.message} onChange={e=>setForm(f=>({...f,message:e.target.value}))} className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl outline-none focus:border-green-400 resize-none transition placeholder-gray-300"/>
          </div>
          <div className="flex items-center justify-end gap-3 pt-1">
            <button onClick={handleClose} className="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:text-gray-800 transition">Cancel</button>
            <button onClick={handleSubmit} disabled={sending} className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-green-500 hover:bg-green-600 rounded-xl transition disabled:opacity-60">
              {sending&&<svg className="w-4 h-4" style={{animation:"spin 0.8s linear infinite"}} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>}
              {sending?"Sending...":"Send Invitation"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
