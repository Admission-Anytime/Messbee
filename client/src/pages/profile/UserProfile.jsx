import { useState, useRef, useEffect, useContext } from "react";
import { ToastContainer, toast } from "react-toastify";
import { userContext } from "../../context/Context";
import axios from "../../context/axios";
import "react-toastify/dist/ReactToastify.css";

const UserProfile = () => {
  const { user, updateUser } = useContext(userContext);
  
  const [isEditing, setIsEditing] = useState(false);
  const [isPrefEditing, setIsPrefEditing] = useState(false);
  const [show2FA, setShow2FA] = useState(false);
  const [method, setMethod] = useState("app");
  const [step, setStep] = useState(1);
  const [showSmsModal, setShowSmsModal] = useState(false);
  const [smsStep, setSmsStep] = useState(1);

  const fileInputRef = useRef(null);
  const [profileImage, setProfileImage] = useState(user?.avatar || null);
  const inputsRef = useRef([]);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timeLeft, setTimeLeft] = useState(59);

 const handleOtpChange = (e, index) => {
  const value = e.target.value.replace(/[^0-9]/g, "");

  const newOtp = [...otp];
  newOtp[index] = value;
  setOtp(newOtp);

  if (value && index < 5) {
    inputsRef.current[index + 1].focus();
  }
};

const handleKeyDown = (e, index) => {
  if (e.key === "Backspace") {
    const newOtp = [...otp];

    if (otp[index]) {
      newOtp[index] = "";
      setOtp(newOtp);
    } else if (index > 0) {
      inputsRef.current[index - 1].focus();
    }
  }
};



  const [formData, setFormData] = useState({
    name: user?.name || "Alex Rivera",
    email: user?.email || "alex.rivera@messbee.com",
    phone: user?.phone || "No Contact", // Default phone if missing
  });

  const [preferences, setPreferences] = useState({
    timezone: user?.timezone || "(GMT+05:30) India Standard Time",
    language: user?.language || "English (United States)",
  });

  // Update formData when user changes
  useEffect(() => {
    if (user) {
      const digits = user.phone ? user.phone.replace(/\D/g, "") : "";
      const sanitizedPhone = (digits && digits !== "91") ? digits.slice(0, 10) : "";
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: sanitizedPhone || "No Contact",
      });
      setProfileImage(user.avatar || null);
      setPreferences({
        timezone: user.timezone || "(GMT+05:30) India Standard Time",
        language: user.language || "English (United States)",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    let value = e.target.value;
    
    if (e.target.name === "phone") {
      value = value.replace(/\D/g, "").slice(0, 10);
    }

    setFormData({
      ...formData,
      [e.target.name]: value,
    });
  };

  const handlePrefChange = (e) => {
    setPreferences({
      ...preferences,
      [e.target.name]: e.target.value,
    });
  };


  const handleSaveProfile = async () => {
    try {
      const response = await axios.put("/users/profile", formData);
      if (response.data.success) {
        updateUser(response.data.data);
        setIsEditing(false);
        toast.success("Profile updated successfully");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    }
  };

  const handleSavePreferences = async () => {
    try {
      const response = await axios.put("/users/profile", preferences);
      if (response.data.success) {
        updateUser(response.data.data);
        setIsPrefEditing(false);
        toast.success("Preferences saved successfully");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save preferences");
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append("avatar", file);
      try {
        const response = await axios.post("/users/avatar", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        if (response.data.success) {
          updateUser(response.data.data.user);
          setProfileImage(URL.createObjectURL(file));
          toast.success("Profile photo updated");
        }
      } catch (error) {
        toast.error("Failed to upload avatar");
      }
    }
  };
  useEffect(() => {
  if (smsStep === 2) {
    inputsRef.current[0]?.focus();
  }
}, [smsStep]);

useEffect(() => {
  if (smsStep !== 2) return;

  const timer = setInterval(() => {
    setTimeLeft((prev) => {
      if (prev === 0) return 0;
      return prev - 1;
    });
  }, 1000);

  return () => clearInterval(timer);
}, [smsStep]);

  return (
    <div className="p-8 max-w-5xl mx-auto bg-[#f6f8fb] min-h-screen">
      <ToastContainer />

      {/* Profile Header Card */}
      <div className="bg-white rounded-2xl border border-gray-100 p-8 mb-8 shadow-sm">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="relative group">
            <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden shadow-md bg-green-500 flex items-center justify-center text-4xl font-bold text-white uppercase">
              {profileImage ? (
                <img
                  alt="Avatar"
                  className="w-full h-full object-cover"
                  src={profileImage.startsWith('blob:') ? profileImage : profileImage}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div className={`w-full h-full flex items-center justify-center ${profileImage ? 'hidden' : ''}`}>
                {user?.name ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2) : 'A'}
              </div>
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
              <p className="text-gray-500 md:mb-0 text-sm">
                {user?.role || "Member"} • Joined {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : "Recently"}
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
                  onClick={handleSaveProfile}
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
                  readOnly={true}
                  className={`w-full transition-all duration-300 outline-none text-gray-900 font-medium cursor-not-allowed opacity-70 ${
                    isEditing
                      ? "bg-gray-100 border border-gray-300 rounded-xl text-sm px-3 py-2"
                      : "bg-transparent border-transparent p-0 text-base"
                  }`}
                />
                {(user?.isEmailVerified || !isEditing) && (
                  <div
                    className={`transition-all duration-300 overflow-hidden flex items-center ${
                      isEditing && !user?.isEmailVerified ? "opacity-0 w-0" : "opacity-100 w-auto"
                    }`}
                  >
                    <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded uppercase whitespace-nowrap flex items-center gap-1">
                      {user?.isEmailVerified && <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>}
                      Verified
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center justify-between">
                Phone Number
                {user?.isPhoneVerified && <span className="text-[10px] text-green-600 font-bold bg-green-50 px-1.5 py-0.5 rounded border border-green-100 flex items-center gap-1 uppercase tracking-normal">
                  <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
                  Verified
                </span>}
              </label>
              <div className={`flex items-center transition-all duration-300 ${isEditing ? "bg-gray-50 border border-gray-300 overflow-hidden rounded-xl h-10" : "bg-transparent border-transparent"}`}>
                {(isEditing || (formData.phone && formData.phone !== "No Contact")) && (
                  <span className={`inline-flex items-center text-sm font-bold text-gray-500 transition-all ${isEditing ? "px-3 bg-gray-100 h-full border-r border-gray-200" : "pr-2"}`}>
                    +91
                  </span>
                )}
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  readOnly={!isEditing || user?.isPhoneVerified}
                  maxLength={10}
                  placeholder="No Contact"
                  className={`w-full transition-all duration-300 outline-none text-gray-900 font-medium ${
                    isEditing
                      ? (user?.isPhoneVerified ? "bg-gray-100 cursor-not-allowed opacity-70" : "bg-transparent px-3 py-2")
                      : "bg-transparent border-transparent p-0 text-base"
                  }`}
                />
              </div>
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
                  onClick={handleSavePreferences}
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
                <option>(GMT+05:30) India Standard Time</option>
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
                    onClick={() => {
                      setShow2FA(true);
                       setStep(1); // reset step
                       setMethod("app"); // optional reset
                          }}
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
  {show2FA && (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center">
  <div className="flex justify-center">
    <div className="w-full max-w-sm py-6 px-5 bg-white rounded-2xl border border-gray-200 shadow-[0_10px_40px_rgba(0,0,0,0.08)]">

      {step === 1 && (
        <>
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              
              {/* Shield Icon */}
              <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 1l7 3v5c0 5-3.5 9-7 10-3.5-1-7-5-7-10V4l7-3z" clipRule="evenodd"/>
                </svg>
              </div>

              <p className="font-semibold text-gray-800">MessBee</p>
            </div>

            {/* Help Icon */}
            <button className="text-gray-400 hover:text-black">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M18 10A8 8 0 11.001 10 8 8 0 0118 10zm-8-3a2 2 0 00-2 2h2a1 1 0 112 0c0 .552-.448 1-1 1h-1v2h1a3 3 0 000-6zm-1 8h2v-2H9v2z"/>
              </svg>
            </button>
          </div>

          {/* Title */}
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Secure your account with 2FA
          </h2>

          <p className="text-sm text-gray-500 mb-6">
            Two-factor authentication adds an extra layer of security to your
            account by requiring more than just a password to log in.
          </p>

          {/* OPTION 1 */}
          <div
            onClick={() => {
            setMethod("app"); // only select
            }}
            className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer mb-4 transition ${
              method === "app"
                ? "border-green-500 bg-green-50"
                : "border-gray-200"
            }`}
          >
            <div className="mt-1">
              <div
                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                  method === "app"
                    ? "border-green-500"
                    : "border-gray-300"
                }`}
              >
                {method === "app" && (
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <svg className="w-5 h-5 text-green-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2a5 5 0 00-5 5v2H4a2 2 0 00-2 2v5a2 2 0 002 2h12a2 2 0 002-2v-5a2 2 0 00-2-2h-1V7a5 5 0 00-5-5zm-3 7V7a3 3 0 016 0v2H7z"/>
              </svg>

              <div>
                <p className="font-medium text-gray-800">
                  Authenticator App (Recommended)
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Use an app like Google Authenticator to generate unique security codes
                </p>
              </div>
            </div>
          </div>

          {/* OPTION 2 */}
          <div
            onClick={() => {
           setMethod("sms");
           }}
            className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer mb-6 transition ${
              method === "sms"
                ? "border-green-500 bg-green-50"
                : "border-gray-200"
            }`}
          >
            <div className="mt-1">
              <div
                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                  method === "sms"
                    ? "border-green-500"
                    : "border-gray-300"
                }`}
              >
                {method === "sms" && (
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <svg className="w-5 h-5 text-gray-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 5a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2H6l-4 3V5z"/>
              </svg>

              <div>
                <p className="font-medium text-gray-800">SMS Verification</p>
                <p className="text-xs text-gray-500 mt-1">
                  Receive a security code via text message to your registered phone number
                </p>
              </div>
            </div>
          </div>

          {/* CONTINUE BUTTON */}
          <button
               onClick={() => {
            if (method === "app") {
            setStep(2);
               } else if (method === "sms") {
              setShow2FA(false);     // CLOSE current modal
              setShowSmsModal(true); // OPEN SMS modal
              }
              }}
            className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-semibold shadow-md transition"
          >
            Continue
          </button>

          {/* FOOTER */}
          <p
            onClick={() => setShow2FA(false)}
            className="text-center text-sm text-black mt-4 cursor-pointer"
          >
            I'll do this later
          </p>

          {/* PROGRESS */}
          <div className="flex justify-center gap-1 mt-3">
            <div className="w-6 h-1 bg-green-500 rounded-full"></div>
            <div className="w-2 h-1 bg-gray-300 rounded-full"></div>
            <div className="w-2 h-1 bg-gray-300 rounded-full"></div>
          </div>
        
        </>
      )}

      {step === 2 && method === "app" && (
  <>
    {/* Header */}
    <div className="flex justify-end mb-4">
      <button
        onClick={() => setShow2FA(false)}
        className="text-gray-400 hover:text-gray-700 transition-colors"
        aria-label="Close"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    {/* Title */}
    <h2 className="text-lg font-bold text-gray-900 text-center mb-2">
      Set up Authenticator App
    </h2>

    {/* Steps */}
    <p className="text-sm text-gray-500 text-center mb-6">
      1. Scan this QR code with your authenticator app (like Google Authenticator or Authy). <br />
      2. Enter the 6-digit code generated by the app.
    </p>

    {/* QR BOX */}
<div className="flex justify-center mb-4">
  <div className="p-3 rounded-xl border bg-gray-50 shadow-sm">
    <div className="w-24 h-24 flex items-center justify-center rounded-lg">
      <img
        src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=MessBee-2FA-Demo"
        alt="QR Code"
        className="w-full h-full object-contain"
      />
    </div>
  </div>
</div>

    {/* Verification Code */}
    <p className="text-xs text-gray-400 text-center mb-2 uppercase tracking-wider">
      Verification Code
    </p>

    {/* OTP Inputs */}
    <div className="flex justify-center gap-2 mb-4">
      {[...Array(6)].map((_, i) => (
  <input
    key={i}
    maxLength={1}
    ref={(el) => (inputsRef.current[i] = el)}
    onChange={(e) => handleOtpChange(e, i)}
    className="w-8 h-10 text-center border rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-green-500"
  />
))}
    </div>

    {/* Manual entry */}
    <p className="text-center text-sm text-green-600 mb-6 cursor-pointer">
      Can't scan? Enter code manually
    </p>

    {/* Verify Button */}
    <button
      onClick={() => setStep(3)}
      
      className="w-full bg-green-500 hover:bg-green-600 text-white py-2.5 rounded-xl font-semibold shadow-md transition"
    >
      Verify & Continue →
    </button>
    <button
      onClick={() => setStep(1)}
      className="w-full mt-3 bg-gray-100 py-2 rounded-xl font-medium"
    >
      Back
     </button>

    {/* Footer Step Indicator */}
    <p className="text-center text-xs text-gray-400 mt-4">
      Step 2 of 3: Security Verification
    </p>
  </>
)}
      {step === 3 && (
  <>
    {/* Header */}
    <div className="flex items-center gap-2 mb-4">
      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
        <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 2a8 8 0 100 16 8 8 0 000-16z"/>
        </svg>
      </div>
      <div>
        <p className="font-semibold text-gray-800 text-sm">
          Save your recovery codes
        </p>
        <p className="text-xs text-gray-400">
          Final step to secure your account
        </p>
      </div>
    </div>

    {/* Warning Box */}
    <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4 text-xs text-gray-600">
      <div className="flex gap-2 items-start">
        <span className="text-orange-500">⚠</span>
        <p>
          Recovery codes are used to access your account if you lose your
          authentication device. Store these in a safe place like a password manager!
        </p>
      </div>
    </div>

    {/* Codes Grid */}
    <div className="grid grid-cols-3 gap-2 mb-4">
      {[
        "ABCD-1234","EFGH-5678","IJKL-9012",
        "MNOP-3456","QRST-7890","UVWX-1122",
        "YZAB-3344","CDER-5566","GHTY-7788",
        "PLMK-9900","QWER-1212","ASDF-3434"
      ].map((code, i) => (
        <div
          key={i}
          className="bg-gray-100 text-gray-700 text-xs py-2 rounded-md text-center font-medium"
        >
          {code}
        </div>
      ))}
    </div>

    {/* Buttons */}
    <div className="flex gap-3 mb-4">
      <button className="flex-1 border rounded-lg py-2 text-sm bg-white hover:bg-gray-50">
        ⬇ Download PDF
      </button>
      <button className="flex-1 border rounded-lg py-2 text-sm bg-white hover:bg-gray-50">
        📋 Copy to clipboard
      </button>
    </div>

    {/* Checkbox */}
    <div className="mb-4 text-xs text-gray-600">
      <label className="flex items-start gap-2">
        <input type="checkbox" className="mt-1" />
        <span>
          I have saved my recovery codes <br />
          <span className="text-gray-400">
            I understand that these codes are the only way to recover my account if I lose my device.
          </span>
        </span>
      </label>
    </div>

    {/* Complete Button */}
    <button
      onClick={() => {
        toast.success("2FA Enabled Successfully");
        setShow2FA(false);
        setStep(1);
      }}
      className="w-full bg-green-500 hover:bg-green-600 text-white py-2.5 rounded-lg font-semibold"
    >
      Complete Setup ✓
    </button>

    {/* Back */}
    <p
      onClick={() => setStep(2)}
      className="text-center text-xs text-gray-400 mt-3 cursor-pointer"
    >
      ← Back to security settings
    </p>
  </>
)}
    </div>
                    </div>
                  </div>
                )}
    {showSmsModal && (
  <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
    <div className="bg-white rounded-2xl shadow-xl p-6 w-[380px]">

  {/* STEP 1 */}
  {smsStep === 1 && (
    <>
      <div className="text-center mb-4">
        <h2 className="text-lg font-bold">Set up SMS Verification</h2>
        <p className="text-sm text-gray-500 mt-1">
          Enter your phone number to receive a 6-digit security code
        </p>
      </div>

      <div className="mt-4">
        <label className="text-sm font-medium">Phone Number</label>
        <div className="flex mt-1">
          <select className="border rounded-l-lg px-2">
            <option>+91</option>
          </select>
          <input
            type="text"
            placeholder="98765 43210"
            className="border rounded-r-lg px-3 py-2 w-full outline-none"
          />
        </div>
      </div>

      <div className="bg-yellow-100 text-yellow-800 text-xs p-3 rounded-lg mt-3">
        A message with a verification code will be sent to this number.
      </div>

      <button
        onClick={() => {
          toast.success("OTP Sent");
          setSmsStep(2);
        }}
        className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg mt-4"
      >
        Send Verification Code →
      </button>

      <p
        onClick={() => {
          setShowSmsModal(false);
          setShow2FA(true);
        }}
        className="text-center text-sm text-gray-500 mt-3 cursor-pointer"
      >
        ← Back to selection
      </p>
    </>
  )}

  {/* STEP 2 (YOUR CODE HERE) */}
  {smsStep === 2 && (
  <>
    {/* CLOSE */}
    <div className="flex justify-end mb-3">
      <button
        onClick={() => { setShowSmsModal(false); setSmsStep(1); setOtp(["", "", "", "", "", ""]); }}
        className="text-gray-400 hover:text-gray-700 transition-colors"
        aria-label="Close"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    {/* TITLE */}
    <h2 className="text-xl font-bold text-gray-900 text-center">
      Verify your identity
    </h2>

    {/* SUBTEXT */}
    <p className="text-sm text-gray-500 text-center mt-2 mb-5">
      We've sent a 6-digit security code to your registered phone number{" "}
      <span className="font-medium text-gray-700">+91 •••• 4412</span>
    </p>

    {/* OTP INPUTS */}
    <div className="flex justify-center gap-3 mb-4">
  {[...Array(6)].map((_, i) => (
    <input
      key={i}
      maxLength={1}
      value={otp[i]}
      ref={(el) => (inputsRef.current[i] = el)}
      onChange={(e) => handleOtpChange(e, i)}
      onKeyDown={(e) => handleKeyDown(e, i)}
      className="w-12 h-12 text-center border border-gray-300 rounded-xl text-lg focus:outline-none focus:ring-2 focus:ring-green-500"
    />
  ))}
</div>


    {/* RESEND */}
    <p className="text-sm text-center text-gray-500 mb-2">
      Didn’t receive the code?{" "}
      <span
  onClick={() => {
    setTimeLeft(59);
    setOtp(["", "", "", "", "", ""]);
    inputsRef.current[0]?.focus();
    toast.success("Code resent!");
  }}
  className="text-green-600 font-medium cursor-pointer"
>
  Resend code
    </span>
    </p>

    {/* TIMER */}
    <div className="flex justify-center mb-5">
      <div className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full flex items-center gap-2">
        ⏱ 00:{timeLeft.toString().padStart(2, "0")} REMAINING
      </div>
    </div>

{/* BUTTON */}
<button
  onClick={() => {
    const enteredOtp = otp.join("");

    if (enteredOtp.length < 6) {
    toast.error("Enter complete OTP");
    return;
  }

  if (enteredOtp !== "123456") {
    toast.error("Invalid OTP");
    return;
  }

  setSmsStep(3); // 👈 THIS LINE IS THE KEY
  }}
      className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-semibold shadow-md transition"
    >
      Verify & Continue →
    </button>

    {/* PROGRESS */}
    <div className="flex justify-center gap-2 mt-6">
      <div className="w-6 h-1 bg-green-500 rounded-full"></div>
      <div className="w-6 h-1 bg-green-500 rounded-full"></div>
      <div className="w-6 h-1 bg-gray-300 rounded-full"></div>
    </div>

    <p className="text-xs text-center text-gray-400 mt-2">
      STEP 2 OF 3
    </p>
  </>
)}


{smsStep === 3 && (
  <>
    {/* HEADER */}
    <div className="flex items-center gap-2 mb-4">
      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
        <div className="w-2 h-2 bg-green-600 rounded-full"></div>
      </div>
      <div>
        <p className="font-semibold text-gray-800 text-sm">
          Save your recovery codes
        </p>
        <p className="text-xs text-gray-400">
          Final step to secure your account
        </p>
      </div>
    </div>

    {/* WARNING BOX */}
    <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4 text-xs text-gray-600">
      <div className="flex gap-2 items-start">
        <span className="text-orange-500">⚠</span>
        <p>
          Recovery codes are used to access your account if you lose your
          authentication device. Store these in a safe place like a password manager!
        </p>
      </div>
    </div>

    {/* CODES GRID (12 like design) */}
    <div className="grid grid-cols-3 gap-2 mb-4">
      {[
        "ABCD-1234","EFGH-5678","IJKL-9012",
        "MNOP-3456","QRST-7890","UVWX-1122",
        "YZAB-3344","CDER-5566","GHTY-7788",
        "PLMK-9900","QWER-1212","ASDF-3434"
      ].map((code, i) => (
        <div
          key={i}
          className="bg-gray-100 text-gray-700 text-xs py-2 rounded-md text-center font-medium"
        >
          {code}
        </div>
      ))}
    </div>

    {/* ACTION BUTTONS */}
    <div className="flex gap-3 mb-4">
      <button className="flex-1 border rounded-lg py-2 text-sm bg-white hover:bg-gray-50">
        ⬇ Download PDF
      </button>
      <button className="flex-1 border rounded-lg py-2 text-sm bg-white hover:bg-gray-50">
        📋 Copy to clipboard
      </button>
    </div>

    {/* CHECKBOX */}
    <div className="mb-4 text-xs text-gray-600">
      <label className="flex items-start gap-2">
        <input type="checkbox" className="mt-1" />
        <span>
          I have saved my recovery codes <br />
          <span className="text-gray-400">
            I understand that these codes are the only way to recover my account if I lose my device.
          </span>
        </span>
      </label>
    </div>

    {/* COMPLETE BUTTON */}
    <button
      onClick={() => {
        toast.success("2FA Enabled Successfully ✅");
        setShowSmsModal(false);
        setSmsStep(1);
        setOtp(["", "", "", "", "", ""]);
      }}
      className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-semibold"
    >
      Complete Setup ✓
    </button>

    {/* BACK */}
    <p
      onClick={() => setSmsStep(2)}
      className="text-center text-xs text-gray-400 mt-3 cursor-pointer"
    >
      ← Back to verification
    </p>
  </>
)}
</div>

    </div>
    )}
    </div>
  );
};

export default UserProfile;