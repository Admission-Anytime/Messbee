import { useState } from 'react';
// Toaster imports
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const BusinessProfile = () => {
  // Logic for editing state
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    toast.success("Saved successfully!", {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      theme: "light",
    });
    setIsEditing(false); 
  };

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-500 pb-20 font-['Urbanist']">
      {/* Toast Container needs to be present in the component */}
      <ToastContainer />

      <div className="border-b border-slate-200 pb-4 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Organization Settings</h2>
          <p className="text-slate-500 text-sm">Manage your business identity, official API profile, billing, and regional compliance details.</p>
        </div>
        
        {/* EDIT BUTTON (Pencil Icon) */}
        <button 
          onClick={() => setIsEditing(!isEditing)}
          className={`p-2.5 rounded-xl border transition-all ${isEditing ? 'bg-emerald-100 border-emerald-500 text-emerald-600' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </button>
      </div>

      {/* 1. Organization Identity */}
      <div className={`bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm transition-all ${!isEditing && 'opacity-80'}`}>
        <div className="flex items-center gap-2 mb-6">
          <span className="text-green-600">🏢</span>
          <h3 className="text-md font-bold text-slate-800">Organization Identity</h3>
        </div>
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex flex-col items-center gap-3">
            <div className={`w-32 h-32 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-all group ${isEditing ? 'bg-green-50 border-green-200 cursor-pointer hover:bg-green-100' : 'bg-slate-50 border-slate-100 cursor-not-allowed'}`}>
              <span className="text-2xl group-hover:scale-110 transition-transform">📸</span>
            </div>
            <p className="text-[10px] text-slate-400 text-center uppercase font-semibold tracking-wider">Square, min 500x500px<br/>JPG, PNG or SVG</p>
          </div>
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700">Organization Name</label>
              <input disabled={!isEditing} type="text" defaultValue="MessBee" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all disabled:text-slate-400" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700">Website URL</label>
              <div className="flex group">
                <span className="px-4 py-3 bg-slate-50 border border-r-0 border-slate-200 rounded-l-xl text-slate-400 text-sm">https://</span>
                <input disabled={!isEditing} type="text" defaultValue="messbee.com" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-r-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all disabled:text-slate-400" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Official Business Profile */}
      <div className={`bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm transition-all ${!isEditing && 'opacity-80'}`}>
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
            <select disabled={!isEditing} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:text-slate-400">
              <option>Technology & Software</option>
              <option>Education</option>
              <option>Healthcare</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700">Business Description</label>
            <textarea disabled={!isEditing} rows="3" defaultValue="MessBee is a leading WhatsApp Business API platform providing automated messaging solutions for modern enterprises." className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none resize-none focus:ring-2 focus:ring-emerald-500/20 disabled:text-slate-400"></textarea>
            <p className="text-[11px] text-slate-400">Maximum 256 characters as per Meta guidelines.</p>
          </div>
          <div className="space-y-4">
             <label className="text-sm font-bold text-slate-700">Official Address</label>
             <input disabled={!isEditing} type="text" defaultValue="123 Innovation Drive, Tech Park, Suite 400" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 disabled:text-slate-400" />
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <input disabled={!isEditing} type="text" defaultValue="San Francisco" placeholder="City" className="px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 disabled:text-slate-400" />
                <input disabled={!isEditing} type="text" defaultValue="CA" placeholder="State" className="px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 disabled:text-slate-400" />
                <input disabled={!isEditing} type="text" defaultValue="94105" placeholder="Pincode" className="px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 disabled:text-slate-400" />
                <input disabled={!isEditing} type="text" defaultValue="USA" placeholder="Country" className="px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 disabled:text-slate-400" />
             </div>
          </div>
        </div>
      </div>

      {/* 3. Regional & Compliance */}
      <div className={`bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm transition-all ${!isEditing && 'opacity-80'}`}>
        <div className="flex items-center gap-2 mb-6">
          <span className="text-green-600">🌍</span>
          <h3 className="text-md font-bold text-slate-800">Regional & Compliance</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700">Base Currency</label>
            <select disabled={!isEditing} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:text-slate-400">
              <option>USD - US Dollar</option>
              <option>INR - Indian Rupee</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700">Default Timezone</label>
            <select disabled={!isEditing} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:text-slate-400">
              <option>(GMT-08:00) Pacific Time</option>
              <option>(GMT+05:30) India Standard Time</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700">Tax ID / GSTN</label>
            <input disabled={!isEditing} type="text" defaultValue="TX-987456123-A" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 disabled:text-slate-400" />
          </div>
        </div>
      </div>

      {/* 4. Billing Information */}
      <div className={`bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm transition-all ${!isEditing && 'opacity-80'}`}>
        <div className="flex items-center gap-2 mb-6">
          <span className="text-green-600">💵</span>
          <h3 className="text-md font-bold text-slate-800">Billing Information</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-4 space-y-1.5">
            <label className="text-sm font-bold text-slate-700">Billing Name</label>
            <input disabled={!isEditing} type="text" defaultValue="ATRI ADMISSION ANYTIME PVT LTD" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 disabled:text-slate-400" />
          </div>
          <div className="md:col-span-4 space-y-1.5">
            <label className="text-sm font-bold text-slate-700">Billing Address</label>
            <input disabled={!isEditing} type="text" defaultValue="S-14, Basement, DLF Dilshad Extension 2" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 disabled:text-slate-400" />
          </div>
          
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700">Country</label>
            <input disabled={!isEditing} type="text" defaultValue="India" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 disabled:text-slate-400" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700">State</label>
            <input disabled={!isEditing} type="text" defaultValue="Uttar Pradesh" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 disabled:text-slate-400" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700">City</label>
            <input disabled={!isEditing} type="text" defaultValue="Ghaziabad" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 disabled:text-slate-400" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700">Pincode / Zipcode</label>
            <input disabled={!isEditing} type="text" defaultValue="201005" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 disabled:text-slate-400" />
          </div>

          <div className="md:col-span-2 space-y-1.5">
            <label className="text-sm font-bold text-slate-700">Mobile Number</label>
            <input disabled={!isEditing} type="text" defaultValue="916284063840" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 disabled:text-slate-400" />
          </div>
          <div className="md:col-span-2 space-y-1.5">
            <label className="text-sm font-bold text-slate-700">Email Id</label>
            <input disabled={!isEditing} type="email" defaultValue="info@admissionanytime.com" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 disabled:text-slate-400" />
          </div>

          <div className="md:col-span-2 space-y-1.5">
            <label className="text-sm font-bold text-slate-700">Tax Type</label>
            <select disabled={!isEditing} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:text-slate-400">
              <option>GST</option>
              <option>VAT</option>
            </select>
          </div>
          <div className="md:col-span-2 space-y-1.5">
            <label className="text-sm font-bold text-slate-700">Tax Id</label>
            <input disabled={!isEditing} type="text" defaultValue="09AAXCA5870A1ZD" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 disabled:text-slate-400" />
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="sticky bottom-4 bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-slate-200 flex items-center justify-between shadow-xl z-10 transition-all hover:shadow-2xl">
        <p className="text-slate-400 text-xs flex items-center gap-1">
          <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span> Last saved 12 minutes ago
        </p>
        <div className="flex items-center gap-4">
          <button onClick={() => setIsEditing(false)} className="text-slate-500 font-bold text-sm hover:text-slate-800 transition-colors px-4 py-2">Discard Changes</button>
          <button 
            onClick={handleSave}
            disabled={!isEditing}
            className={`px-8 py-3 rounded-xl font-bold shadow-lg transition-all ${isEditing ? 'bg-emerald-500 text-white shadow-emerald-200 hover:bg-emerald-600 active:scale-95' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default BusinessProfile;