const BusinessProfile = () => {
  return (
    <div className="w-full space-y-8 animate-in fade-in duration-500 pb-20 font-['Urbanist']">
      <div className="border-b border-slate-200 pb-4">
        <h2 className="text-2xl font-bold text-slate-800">Organization Settings</h2>
        <p className="text-slate-500 text-sm">Manage your business identity, official API profile, billing, and regional compliance details.</p>
      </div>

      {/* 1. Organization Identity */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <span className="text-green-600">🏢</span>
          <h3 className="text-md font-bold text-slate-800">Organization Identity</h3>
        </div>
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex flex-col items-center gap-3">
            <div className="w-32 h-32 bg-green-50 rounded-2xl border-2 border-dashed border-green-200 flex flex-col items-center justify-center cursor-pointer hover:bg-green-100 transition-all group">
              <span className="text-2xl group-hover:scale-110 transition-transform">📸</span>
            </div>
            <p className="text-[10px] text-slate-400 text-center uppercase font-semibold tracking-wider">Square, min 500x500px<br/>JPG, PNG or SVG</p>
          </div>
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700">Organization Name</label>
              <input type="text" defaultValue="MessBee" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700">Website URL</label>
              <div className="flex group">
                <span className="px-4 py-3 bg-slate-50 border border-r-0 border-slate-200 rounded-l-xl text-slate-400 text-sm">https://</span>
                <input type="text" defaultValue="messbee.com" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-r-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Official Business Profile */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <span className="text-green-600">✅</span>
            <h3 className="text-md font-bold text-slate-800">Official Business Profile</h3>
          </div>
          <span className="bg-green-100 text-green-600 text-[9px] font-bold px-2 py-1 rounded tracking-wider uppercase">WhatsApp API Ready</span>
        </div>
        <div className="space-y-6">
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700">Business Category</label>
            <select className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20">
              <option>Technology & Software</option>
              <option>Education</option>
              <option>Healthcare</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700">Business Description</label>
            <textarea rows="3" defaultValue="MessBee is a leading WhatsApp Business API platform providing automated messaging solutions for modern enterprises." className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none resize-none focus:ring-2 focus:ring-emerald-500/20"></textarea>
            <p className="text-[11px] text-slate-400">Maximum 256 characters as per Meta guidelines.</p>
          </div>
          <div className="space-y-4">
             <label className="text-sm font-bold text-slate-700">Official Address</label>
             <input type="text" defaultValue="123 Innovation Drive, Tech Park, Suite 400" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20" />
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <input type="text" defaultValue="San Francisco" placeholder="City" className="px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20" />
                <input type="text" defaultValue="CA" placeholder="State" className="px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20" />
                <input type="text" defaultValue="94105" placeholder="Pincode" className="px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20" />
                <input type="text" defaultValue="USA" placeholder="Country" className="px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20" />
             </div>
          </div>
        </div>
      </div>

      {/* 3. Regional & Compliance (The missing section you pointed out) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <span className="text-green-600">🌍</span>
          <h3 className="text-md font-bold text-slate-800">Regional & Compliance</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700">Base Currency</label>
            <select className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20">
              <option>USD - US Dollar</option>
              <option>INR - Indian Rupee</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700">Default Timezone</label>
            <select className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20">
              <option>(GMT-08:00) Pacific Time</option>
              <option>(GMT+05:30) India Standard Time</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700">Tax ID / GSTN</label>
            <input type="text" defaultValue="TX-987456123-A" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20" />
          </div>
        </div>
      </div>

      {/* 4. Billing Information (Updated with all fields from SS) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <span className="text-green-600">💵</span>
          <h3 className="text-md font-bold text-slate-800">Billing Information</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-4 space-y-1.5">
            <label className="text-sm font-bold text-slate-700">Billing Name</label>
            <input type="text" defaultValue="ATRI ADMISSION ANYTIME PVT LTD" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20" />
          </div>
          <div className="md:col-span-4 space-y-1.5">
            <label className="text-sm font-bold text-slate-700">Billing Address</label>
            <input type="text" defaultValue="S-14, Basement, DLF Dilshad Extension 2" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20" />
          </div>
          
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700">Country</label>
            <input type="text" defaultValue="India" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700">State</label>
            <input type="text" defaultValue="Uttar Pradesh" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700">City</label>
            <input type="text" defaultValue="Ghaziabad" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700">Pincode / Zipcode</label>
            <input type="text" defaultValue="201005" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20" />
          </div>

          <div className="md:col-span-2 space-y-1.5">
            <label className="text-sm font-bold text-slate-700">Mobile Number</label>
            <input type="text" defaultValue="916284063840" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20" />
          </div>
          <div className="md:col-span-2 space-y-1.5">
            <label className="text-sm font-bold text-slate-700">Email Id</label>
            <input type="email" defaultValue="info@admissionanytime.com" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20" />
          </div>

          <div className="md:col-span-2 space-y-1.5">
            <label className="text-sm font-bold text-slate-700">Tax Type</label>
            <select className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20">
              <option>GST</option>
              <option>VAT</option>
            </select>
          </div>
          <div className="md:col-span-2 space-y-1.5">
            <label className="text-sm font-bold text-slate-700">Tax Id</label>
            <input type="text" defaultValue="09AAXCA5870A1ZD" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20" />
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="sticky bottom-4 bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-slate-200 flex items-center justify-between shadow-xl z-10 transition-all hover:shadow-2xl">
        <p className="text-slate-400 text-xs flex items-center gap-1">
          <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span> Last saved 12 minutes ago
        </p>
        <div className="flex items-center gap-4">
          <button className="text-slate-500 font-bold text-sm hover:text-slate-800 transition-colors px-4 py-2">Discard Changes</button>
          <button className="bg-emerald-500 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-emerald-200 hover:bg-emerald-600 active:scale-95 transition-all">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default BusinessProfile;