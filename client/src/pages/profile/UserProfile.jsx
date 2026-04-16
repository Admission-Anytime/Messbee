import { useState, useRef } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const UserProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [isPrefEditing, setIsPrefEditing] = useState(false);

  const fileInputRef = useRef(null);
  const [profileImage, setProfileImage] = useState(null);

  const [formData, setFormData] = useState({
    name: "Alex Rivera",
    email: "alex.rivera@messbee.com",
    phone: "+1 (555) 902-4412",
  });

  const [preferences, setPreferences] = useState({
    timezone: "(GMT-08:00) Pacific Time (US & Canada)",
    language: "English (United States)",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePrefChange = (e) => {
    setPreferences({
      ...preferences,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setProfileImage(imageUrl);
      toast.success("Profile photo updated");
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto bg-[#f6f8fb] min-h-screen">
      <ToastContainer />

      {/* Profile Header Card */}
      <div className="bg-white rounded-2xl border border-gray-100 p-8 mb-8 shadow-sm">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="relative group">
            <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden shadow-md bg-green-100 flex items-center justify-center text-4xl font-bold text-green-700">
              {profileImage ? (
                <img
                  alt="Avatar"
                  className="w-full h-full object-cover"
                  src={profileImage}
                />
              ) : (
                <img
                  alt="Avatar"
                  className="w-full h-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDMvK1ou6j6LgAUikPCeA1692LVrW1OoL0mtmrC46N-5_dPhBEcwT53cRSg2yxtDQDUFr7FzxzyKcy7M9pLAcwEdKbZCBXkIuhWHUADaEflwkqrSnl1NzONtDYM9UcipwMk_U9I3uomlb-nlC-CN7E4EIXP4fq50skX36wAcXPag5yGl82jNRpLnt-E2qs15aCx6PCpaddPJQLtR6SGeZnHo7Sn0OTGOhlUgIIMq4mpXNFpTneLSxYvzmULh931WiCPEjYgpuK3t6dQ"
                />
              )}
            </div>
            <button
              onClick={() => fileInputRef.current.click()}
              className="absolute bottom-0 right-0 bg-green-500 text-white w-10 h-10 rounded-full border-4 border-white flex items-center justify-center hover:scale-105 transition-transform shadow-sm"
              title="Change Photo"
            >
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M4 7h3l2-2h6l2 2h3v13H4V7zm8 3a4 4 0 100 8 4 4 0 000-8z" />
              </svg>
            </button>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>
          <div className="flex-1 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
                <h2 className="text-3xl font-bold text-gray-900">
                  {formData.name}
                </h2>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full w-fit mx-auto md:mx-0">
                  <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Verified Agent
                </span>
              </div>
              <p className="text-gray-500 md:mb-0">
                Senior Technical Consultant • Joined January 2023
              </p>
            </div>
            <div className="flex flex-wrap gap-3 justify-center">
              <button
                onClick={() => {
                  const newEditingState = !isEditing;
                  setIsEditing(newEditingState);
                  setIsPrefEditing(newEditingState);
                }}
                className="px-5 py-2 bg-green-500 text-white text-sm font-bold rounded-xl shadow-md hover:bg-green-600 transition-all"
              >
                {isEditing ? "Cancel Edit" : "Edit Profile"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Personal Information */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-bold text-gray-900">Personal Information</h3>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="text-green-600 text-sm font-semibold hover:underline"
              >
                Edit
              </button>
            ) : (
              <div className="flex gap-4">
                <button
                  onClick={() => setIsEditing(false)}
                  className="text-gray-500 text-sm font-semibold hover:underline"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    toast.success("Changes saved");
                  }}
                  className="text-green-600 text-sm font-semibold hover:underline"
                >
                  Save
                </button>
              </div>
            )}
          </div>
          <div className="p-6 space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                readOnly={!isEditing}
                className={`w-full transition-all duration-300 outline-none text-gray-900 font-medium ${
                  isEditing
                    ? "bg-gray-50 border border-gray-300 rounded-xl text-sm px-3 py-2 focus:border-green-500 focus:ring-1 focus:ring-green-500"
                    : "bg-transparent border-transparent p-0 text-base"
                }`}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Email Address
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  readOnly={!isEditing}
                  className={`w-full transition-all duration-300 outline-none text-gray-900 font-medium ${
                    isEditing
                      ? "bg-gray-50 border border-gray-300 rounded-xl text-sm px-3 py-2 focus:border-green-500 focus:ring-1 focus:ring-green-500"
                      : "bg-transparent border-transparent p-0 text-base"
                  }`}
                />
                <div
                  className={`transition-all duration-300 overflow-hidden flex items-center ${
                    isEditing ? "opacity-0 w-0" : "opacity-100 w-auto"
                  }`}
                >
                  <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded uppercase whitespace-nowrap">
                    Verified
                  </span>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Phone Number
              </label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                readOnly={!isEditing}
                className={`w-full transition-all duration-300 outline-none text-gray-900 font-medium ${
                  isEditing
                    ? "bg-gray-50 border border-gray-300 rounded-xl text-sm px-3 py-2 focus:border-green-500 focus:ring-1 focus:ring-green-500"
                    : "bg-transparent border-transparent p-0 text-base"
                }`}
              />
            </div>
          </div>
        </div>

        {/* Account Preferences */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-bold text-gray-900">Account Preferences</h3>
            {!isPrefEditing ? (
              <button
                onClick={() => setIsPrefEditing(true)}
                className="text-green-600 text-sm font-semibold hover:underline"
              >
                Edit
              </button>
            ) : (
              <div className="flex gap-4">
                <button
                  onClick={() => setIsPrefEditing(false)}
                  className="text-gray-500 text-sm font-semibold hover:underline"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setIsPrefEditing(false);
                    toast.success("Preferences saved");
                  }}
                  className="text-green-600 text-sm font-semibold hover:underline"
                >
                  Save Changes
                </button>
              </div>
            )}
          </div>
          <div className="p-6 space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Timezone
              </label>
              <select
                name="timezone"
                value={preferences.timezone}
                onChange={handlePrefChange}
                disabled={!isPrefEditing}
                className={`w-full transition-all duration-300 outline-none text-gray-900 font-medium ${
                  isPrefEditing
                    ? "bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 focus:border-green-500 focus:ring-1 focus:ring-green-500"
                    : "appearance-none bg-transparent border-transparent p-0 disabled:opacity-100"
                }`}
              >
                <option>(GMT-08:00) Pacific Time (US & Canada)</option>
                <option>(GMT-05:00) Eastern Time (US & Canada)</option>
                <option>(GMT+00:00) London</option>
                <option>(GMT+01:00) Paris</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Language
              </label>
              <select
                name="language"
                value={preferences.language}
                onChange={handlePrefChange}
                disabled={!isPrefEditing}
                className={`w-full transition-all duration-300 outline-none text-gray-900 font-medium ${
                  isPrefEditing
                    ? "bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 focus:border-green-500 focus:ring-1 focus:ring-green-500"
                    : "appearance-none bg-transparent border-transparent p-0 disabled:opacity-100"
                }`}
              >
                <option>English (United States)</option>
                <option>Spanish (Español)</option>
                <option>French (Français)</option>
                <option>German (Deutsch)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden lg:col-span-2">
          <div className="px-6 py-5 border-b border-gray-100">
            <h3 className="font-bold text-gray-900">Security</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-green-600 shrink-0">
                  <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900 mb-1">
                    Password
                  </h4>
                  <p className="text-sm text-gray-500 mb-4">
                    Last changed 3 months ago. We recommend changing it periodically.
                  </p>
                  <button
                    onClick={() => toast.info("Coming soon")}
                    className="px-4 py-2 bg-gray-100 text-gray-800 text-sm font-bold rounded-xl hover:bg-gray-200 transition-all"
                  >
                    Change Password
                  </button>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                  <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-bold text-gray-900">
                      Two-Factor Authentication
                    </h4>
                    <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded uppercase">
                      Enabled
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mb-4">
                    Protect your account by requiring an extra security code during login.
                  </p>
                  <button
                    onClick={() => toast.info("2FA soon")}
                    className="px-4 py-2 bg-gray-100 text-gray-800 text-sm font-bold rounded-xl hover:bg-gray-200 transition-all"
                  >
                    Configure 2FA
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;