import { useState, useRef } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const UserProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [isPrefEditing, setIsPrefEditing] = useState(false);

  const fileInputRef = useRef(null);
  const [profileImage, setProfileImage] = useState(null);

  const [formData, setFormData] = useState({
    name: "Admission Anytime",
    email: "admin@admissionanytime.com",
    phone: "+1 (555) 012-3456",
  });

  const [preferences, setPreferences] = useState({
    timezone: "(GMT-05:00) Eastern Time",
    language: "English (US)",
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

  // ✅ Image Upload Handler
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setProfileImage(imageUrl);
      toast.success("Profile photo updated");
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-6 bg-[#f6f8fb] space-y-6">
      <ToastContainer />

      {/* HEADER */}
      <div className="bg-white rounded-2xl p-6 flex items-center shadow-sm border">
        <div className="flex items-center gap-5">
          
          {/* AVATAR */}
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-green-200 flex items-center justify-center text-2xl font-bold overflow-hidden">
              {profileImage ? (
                <img
                  src={profileImage}
                  alt="profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                "A"
              )}
            </div>

            {/* Camera Icon */}
            <div
              onClick={() => fileInputRef.current.click()}
              className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow border cursor-pointer"
            >
              <svg
                className="w-4 h-4 text-gray-600"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M4 7h3l2-2h6l2 2h3v13H4V7zm8 3a4 4 0 100 8 4 4 0 000-8z" />
              </svg>
            </div>

            {/* Hidden Input */}
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>

          {/* USER INFO */}
          <div>
            <h2 className="text-2xl font-bold">{formData.name}</h2>
            <p className="text-sm text-gray-500">
              Verified Agent • Joined Jan 2024
            </p>
          </div>
        </div>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* PERSONAL INFO */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold">Personal Information</h3>

            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="text-green-600 text-base font-semibold"
              >
                Edit
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setIsEditing(false);
                    toast.success("Changes saved");
                  }}
                  className="bg-green-500 text-white px-3 py-1 rounded-md text-sm font-medium"
                >
                  Save Changes
                </button>

                <button
                  onClick={() => setIsEditing(false)}
                  className="border px-3 py-1 rounded-md text-sm font-medium"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          <div className="border-b my-4"></div>

          <div className="space-y-4 text-sm">
            {["name", "email", "phone"].map((field) => (
              <div key={field}>
                <p className="text-gray-500 text-xs">
                  {field.toUpperCase().replace("_", " ")}
                </p>
                <input
                  type="text"
                  name={field}
                  value={formData[field]}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`w-full font-medium text-black disabled:text-black disabled:opacity-100 ${
                    isEditing ? "border rounded px-2 py-1" : "bg-transparent"
                  }`}
                />
              </div>
            ))}
          </div>
        </div>

        {/* ACCOUNT PREF */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold">Account Preferences</h3>

            {!isPrefEditing ? (
              <button
                onClick={() => setIsPrefEditing(true)}
                className="text-green-600 text-base font-semibold"
              >
                Edit
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setIsPrefEditing(false);
                    toast.success("Preferences saved");
                  }}
                  className="bg-green-500 text-white px-3 py-1 rounded-md text-sm font-medium"
                >
                  Save Changes
                </button>

                <button
                  onClick={() => setIsPrefEditing(false)}
                  className="border px-3 py-1 rounded-md text-sm font-medium"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          <div className="border-b my-4"></div>

          <div className="space-y-4 text-sm">
            <div>
              <p className="text-gray-500 text-xs">TIMEZONE</p>
              <select
                name="timezone"
                value={preferences.timezone}
                onChange={handlePrefChange}
                disabled={!isPrefEditing}
                className={`w-full font-medium text-black disabled:text-black disabled:opacity-100 ${
                  isPrefEditing
                    ? "border rounded px-2 py-2"
                    : "bg-transparent appearance-none"
                }`}
              >
                <option>(GMT-05:00) Eastern Time</option>
                <option>(GMT+00:00) UTC</option>
                <option>(GMT+05:30) India Standard Time</option>
              </select>
            </div>

            <div>
              <p className="text-gray-500 text-xs">LANGUAGE</p>
              <select
                name="language"
                value={preferences.language}
                onChange={handlePrefChange}
                disabled={!isPrefEditing}
                className={`w-full font-medium text-black disabled:text-black disabled:opacity-100 ${
                  isPrefEditing
                    ? "border rounded px-2 py-2"
                    : "bg-transparent appearance-none"
                }`}
              >
                <option>English (US)</option>
                <option>English (UK)</option>
                <option>Hindi</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* SECURITY */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border">
        <h3 className="font-semibold mb-4">Security</h3>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="border rounded-xl p-4 flex gap-3 hover:shadow-sm">
            <div className="w-10 h-10 flex items-center justify-center bg-green-100 rounded-lg">
              <svg className="w-5 h-5 text-green-600" fill="currentColor">
                <path d="M17 8V7a5 5 0 00-10 0v1H5v13h14V8h-2z"/>
              </svg>
            </div>
            <div>
              <p className="font-medium">Password</p>
              <p className="text-xs text-gray-500 mb-2">
                Last changed 3 months ago
              </p>
              <button
                onClick={() => toast.info("Coming soon")}
                className="bg-gray-100 px-3 py-1.5 rounded-md text-sm"
              >
                Change Password
              </button>
            </div>
          </div>

          <div className="border rounded-xl p-4 flex gap-3 hover:shadow-sm">
            <div className="w-10 h-10 flex items-center justify-center bg-blue-100 rounded-lg">
              <svg className="w-5 h-5 text-blue-600" fill="currentColor">
                <path d="M12 2l8 4v6c0 5-3.8 9.7-8 10-4.2-.3-8-5-8-10V6l8-4z"/>
              </svg>
            </div>
            <div>
              <p className="font-medium">Two-Factor Authentication</p>
              <p className="text-xs text-gray-500 mb-2">
                Extra security for your account
              </p>
              <button
                onClick={() => toast.info("2FA soon")}
                className="bg-gray-100 px-3 py-1.5 rounded-md text-sm"
              >
                Enable
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;