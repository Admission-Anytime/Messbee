import React, { useState, useRef } from "react";
import { toast } from "react-toastify";
import { 
  CameraIcon, 
  ComputerDesktopIcon,
  EnvelopeIcon,
  MapPinIcon,
  BuildingOfficeIcon,
  InformationCircleIcon,
  PencilSquareIcon
} from "@heroicons/react/24/outline";
import { CheckBadgeIcon } from "@heroicons/react/24/solid";

function Dashboard() {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Ref for the hidden file input (Avatar upload)
  const fileInputRef = useRef(null);

  // Simulated Database State
  const [savedData, setSavedData] = useState({
    fullName: "John Doe",
    professionalTitle: "Senior Technical Lead",
    email: "john.doe@enterprise.com",
    countryCode: "+1",
    phone: "555-0123",
    timeZone: "(GMT-08:00) Pacific Time (US & Canada)",
    language: "English (United States)",
  });

  // Temporary state for the form while editing
  const [formData, setFormData] = useState({ ...savedData });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEditClick = () => {
    setFormData({ ...savedData }); 
    setIsEditing(true);
  };

  const handleCancel = () => {
    setFormData({ ...savedData }); 
    setIsEditing(false);
    toast.info("Changes discarded.", { icon: "↩️" });
  };

  // --- Avatar Upload Logic ---
  const handleCameraClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click(); // Opens the file browser
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Simulate image upload process
      toast.success("Profile picture updated successfully!");
      // Note: In reality, you'd upload this file to your backend/S3 here.
    }
  };

  // --- Save Logic ---
  const handleSave = (e) => {
    e.preventDefault();
    setIsLoading(true);

    // ⚠️ Simulate a 1-second backend API call
    setTimeout(() => {
      setSavedData({ ...formData }); // Commit changes to "Database"
      setIsEditing(false); // Close edit mode
      setIsLoading(false); // Stop button spinner
      toast.success("Profile updated successfully!");
    }, 1000);
  };

  return (
    <div className="w-full h-full p-6 md:p-8 lg:p-12 font-sans text-slate-900 bg-white">
      
      {/* Hidden File Input for Avatar */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/*" 
        className="hidden" 
      />

      <div className="w-full max-w-[1600px] flex flex-col gap-12">
        
        {/* --- 1. PROFILE HEADER CARD --- */}
        <div className="w-full bg-white rounded-2xl border border-slate-200 p-8 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-8 shadow-sm">
          
          {/* Left Side: Avatar & Info */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8">
            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="w-28 h-28 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-center overflow-hidden">
                {/* Fallback Icon (Would be an <img> tag if user has a profile pic) */}
                <ComputerDesktopIcon className="w-12 h-12 text-slate-300" />
              </div>
              {/* Only show camera badge if editing */}
              {isEditing && (
                <button 
                  onClick={handleCameraClick}
                  type="button"
                  className="absolute -bottom-3 -right-3 w-9 h-9 bg-white border border-slate-200 rounded-full flex items-center justify-center shadow-sm hover:bg-slate-50 hover:text-[#00E56A] transition-colors text-slate-500 cursor-pointer animate-in zoom-in duration-200"
                >
                  <CameraIcon className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* User Info */}
            <div className="flex-1 text-center sm:text-left pt-2">
              <div className="flex flex-col sm:flex-row items-center sm:justify-start gap-4 mb-2">
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{savedData.fullName}</h1>
                <span className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-md uppercase tracking-wider">
                  <CheckBadgeIcon className="w-4 h-4" /> Verified
                </span>
              </div>
              <p className="text-base font-medium text-slate-500 mb-5">{savedData.professionalTitle}</p>
              
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-6 text-sm font-medium text-slate-500">
                <div className="flex items-center gap-2">
                  <EnvelopeIcon className="w-5 h-5 text-slate-400" />
                  {savedData.email}
                </div>
                <div className="flex items-center gap-2">
                  <MapPinIcon className="w-5 h-5 text-slate-400" />
                  San Francisco, CA
                </div>
              </div>
            </div>
          </div>
          {/* ✅ Removed the top right button entirely! */}
        </div>

        {/* --- FORM / VIEW SECTION --- */}
        <form id="profile-form" onSubmit={handleSave} className="w-full flex flex-col gap-12">
          
          {/* --- 2. PERSONAL INFORMATION --- */}
          <div className="w-full">
            <div className="w-full border-b border-slate-200 pb-4 mb-8">
              <h2 className="text-xl font-bold text-slate-900 mb-1.5">Personal Information</h2>
              <p className="text-sm text-slate-500">Update your personal details and how others see you on the platform.</p>
            </div>
            
            <div className="w-full grid grid-cols-1 xl:grid-cols-2 gap-x-12 gap-y-8">
              {/* Full Name */}
              <div className="w-full">
                <label className="text-[12px] font-bold text-slate-500 uppercase tracking-widest mb-2.5 block">Full Name</label>
                {isEditing ? (
                  <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:ring-2 focus:ring-[#00E56A]/20 focus:border-[#00E56A] outline-none transition-all shadow-sm" />
                ) : (
                  <p className="text-base font-semibold text-slate-900 py-2">{savedData.fullName}</p>
                )}
              </div>
              
              {/* Professional Title */}
              <div className="w-full">
                <label className="text-[12px] font-bold text-slate-500 uppercase tracking-widest mb-2.5 block">Professional Title</label>
                {isEditing ? (
                  <input type="text" name="professionalTitle" value={formData.professionalTitle} onChange={handleChange} required className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:ring-2 focus:ring-[#00E56A]/20 focus:border-[#00E56A] outline-none transition-all shadow-sm" />
                ) : (
                  <p className="text-base font-semibold text-slate-900 py-2">{savedData.professionalTitle}</p>
                )}
              </div>

              {/* Email Address */}
              <div className="w-full">
                <label className="text-[12px] font-bold text-slate-500 uppercase tracking-widest mb-2.5 block">Email Address</label>
                {isEditing ? (
                  <>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-500 focus:ring-2 focus:ring-[#00E56A]/20 focus:border-[#00E56A] outline-none transition-all shadow-sm" />
                    <p className="text-[11px] text-slate-400 font-medium mt-2.5">Email changes require security verification.</p>
                  </>
                ) : (
                  <p className="text-base font-semibold text-slate-900 py-2">{savedData.email}</p>
                )}
              </div>

              {/* Phone Number */}
              <div className="w-full">
                <label className="text-[12px] font-bold text-slate-500 uppercase tracking-widest mb-2.5 block">Phone Number</label>
                {isEditing ? (
                  <div className="flex gap-3">
                    <select name="countryCode" value={formData.countryCode} onChange={handleChange} className="w-[100px] px-4 py-3.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:ring-2 focus:ring-[#00E56A]/20 focus:border-[#00E56A] outline-none transition-all cursor-pointer shadow-sm">
                      <option value="+1">+1</option><option value="+91">+91</option><option value="+44">+44</option>
                    </select>
                    <input type="text" name="phone" value={formData.phone} onChange={handleChange} required className="flex-1 px-5 py-3.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:ring-2 focus:ring-[#00E56A]/20 focus:border-[#00E56A] outline-none transition-all shadow-sm" />
                  </div>
                ) : (
                  <p className="text-base font-semibold text-slate-900 py-2">{savedData.countryCode} {savedData.phone}</p>
                )}
              </div>
            </div>
          </div>

          {/* --- 3. LOCALIZATION --- */}
          <div className="w-full">
            <div className="w-full border-b border-slate-200 pb-4 mb-8">
              <h2 className="text-xl font-bold text-slate-900 mb-1.5">Localization</h2>
              <p className="text-sm text-slate-500">Set your preferred language and time zone for notifications and reports.</p>
            </div>
            
            <div className="w-full grid grid-cols-1 xl:grid-cols-2 gap-x-12 gap-y-8">
              {/* Time Zone */}
              <div className="w-full">
                <label className="text-[12px] font-bold text-slate-500 uppercase tracking-widest mb-2.5 block">Time Zone</label>
                {isEditing ? (
                  <select name="timeZone" value={formData.timeZone} onChange={handleChange} className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:ring-2 focus:ring-[#00E56A]/20 focus:border-[#00E56A] outline-none transition-all cursor-pointer shadow-sm">
                    <option value="(GMT-08:00) Pacific Time (US & Canada)">(GMT-08:00) Pacific Time (US & Canada)</option>
                    <option value="(GMT-05:00) Eastern Time (US & Canada)">(GMT-05:00) Eastern Time (US & Canada)</option>
                    <option value="(GMT+05:30) Indian Standard Time">(GMT+05:30) Indian Standard Time</option>
                  </select>
                ) : (
                  <p className="text-base font-semibold text-slate-900 py-2">{savedData.timeZone}</p>
                )}
              </div>

              {/* Language */}
              <div className="w-full">
                <label className="text-[12px] font-bold text-slate-500 uppercase tracking-widest mb-2.5 block">Language</label>
                {isEditing ? (
                  <select name="language" value={formData.language} onChange={handleChange} className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:ring-2 focus:ring-[#00E56A]/20 focus:border-[#00E56A] outline-none transition-all cursor-pointer shadow-sm">
                    <option value="English (United States)">English (United States)</option>
                    <option value="Spanish (Spain)">Spanish (Spain)</option>
                    <option value="French (France)">French (France)</option>
                  </select>
                ) : (
                  <p className="text-base font-semibold text-slate-900 py-2">{savedData.language}</p>
                )}
              </div>
            </div>
          </div>

          {/* --- 4. ORGANIZATION DETAILS (Always Read-Only) --- */}
          <div className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-8 md:p-10">
            <div className="flex items-center gap-3 mb-8">
              <BuildingOfficeIcon className="w-6 h-6 text-slate-700" />
              <h3 className="text-base font-bold text-slate-800 uppercase tracking-widest">Organization Details</h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Entity Name</p>
                <p className="text-base font-semibold text-slate-900">Nexus Technologies Inc.</p>
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Business ID</p>
                <p className="text-base font-semibold text-slate-900">TX-99201-B</p>
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Member Since</p>
                <p className="text-base font-semibold text-slate-900">Jan 12, 2023</p>
              </div>
            </div>
          </div>
        </form>

        {/* --- 5. FULL WIDTH FOOTER ACTION BAR --- */}
        <div className="w-full border-t border-slate-200 pt-8 pb-4 flex flex-col md:flex-row items-center justify-between gap-6 min-h-[80px]">
          
          {/* Left side info (Only shows when editing) */}
          <div className="flex items-center gap-2.5 text-sm font-medium text-slate-500 text-center md:text-left">
            {isEditing && (
              <div className="flex items-center gap-2.5 animate-in fade-in duration-300">
                <InformationCircleIcon className="w-6 h-6 shrink-0 text-slate-400" />
                All changes are logged for security auditing.
              </div>
            )}
          </div>
          
          {/* Right side buttons */}
          <div className="flex w-full md:w-auto items-center justify-center gap-4">
            
            {!isEditing ? (
              // ✅ Update Button now lives in the footer!
              <button 
                type="button"
                onClick={handleEditClick}
                className="flex-1 md:flex-none px-8 py-3.5 bg-[#121A26] text-white text-sm font-bold rounded-xl shadow-sm hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
              >
                <PencilSquareIcon className="w-4 h-4" />
                Update Profile
              </button>
            ) : (
              // Editing Buttons
              <div className="flex gap-4 w-full animate-in fade-in slide-in-from-right-4 duration-300">
                <button 
                  type="button" 
                  onClick={handleCancel}
                  disabled={isLoading}
                  className="flex-1 md:flex-none px-8 py-3.5 bg-white text-slate-700 border border-slate-300 text-sm font-bold rounded-xl hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-70"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  form="profile-form" 
                  disabled={isLoading}
                  className="flex-1 md:flex-none px-8 py-3.5 bg-[#121A26] hover:bg-slate-800 text-white text-sm font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-80 disabled:cursor-not-allowed min-w-[200px]"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    "Save Profile Updates"
                  )}
                </button>
              </div>
            )}
            
          </div>
        </div>

      </div>
    </div>
  );
}

export default Dashboard;