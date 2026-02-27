const UserProfile = () => {
  return (
    <div className="w-full space-y-6 animate-in fade-in duration-500">
      {/* Header / Avatar Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="flex flex-col md:flex-row items-center gap-5 text-center md:text-left">
          <div className="relative">
            <div className="w-24 h-24 bg-teal-100 rounded-full flex items-center justify-center border-4 border-white shadow-md">
              <span className="text-teal-600 text-3xl font-bold">AA</span>
            </div>
            <button className="absolute bottom-0 right-0 bg-white p-1.5 rounded-full border border-slate-200 shadow-sm hover:bg-slate-50 transition-colors">
              <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
            </button>
          </div>
          <div>
            <div className="flex items-center gap-2 justify-center md:justify-start">
              <h2 className="text-2xl font-bold text-slate-800">Admission Anytime</h2>
              <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <span className="w-1 h-1 bg-green-500 rounded-full"></span> VERIFIED AGENT
              </span>
            </div>
            <p className="text-slate-500 text-sm mt-1 flex items-center gap-2 justify-center md:justify-start">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              Member since Jan 2024
            </p>
          </div>
        </div>
        <button className="px-6 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all shadow-sm">
          Update Photo
        </button>
      </div>

      {/* Form Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Details */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-1">Personal Details</h3>
          <p className="text-slate-500 text-sm mb-6">Manage your basic information and contact details.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700 ml-1">First Name</label>
              <input type="text" defaultValue="Admission" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700 ml-1">Last Name</label>
              <input type="text" defaultValue="Anytime" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700 ml-1">Work Email</label>
              <input type="email" defaultValue="admin@admissionanytime.com" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700 ml-1">WhatsApp Number</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2">📞</span>
                <input type="text" defaultValue="+1 (555) 012-3456" className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all" />
              </div>
            </div>
          </div>
        </div>

        {/* Localization */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Localization</h3>
          <div className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700">Language</label>
              <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none">
                <option>English (US)</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700">Timezone</label>
              <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none">
                <option>(GMT-05:00) Eastern Time</option>
              </select>
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-2">Security</h3>
          <p className="text-slate-500 text-sm mb-6">Keep your account secure with a strong password.</p>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">🔒</div>
              <div>
                <p className="text-sm font-bold text-slate-800">Password</p>
                <p className="text-[10px] text-slate-400 uppercase">Last changed 3 months ago</p>
              </div>
            </div>
            <button className="text-emerald-600 font-bold text-sm hover:underline">Change Password</button>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-4 pt-4 pb-10">
        <button className="px-6 py-2 text-slate-600 font-bold hover:text-slate-800 transition-colors">Cancel</button>
        <button className="px-10 py-3 bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-200 hover:bg-emerald-600 transform hover:-translate-y-0.5 transition-all">
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default UserProfile;