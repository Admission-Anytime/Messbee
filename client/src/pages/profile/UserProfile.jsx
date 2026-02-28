import { useState, useRef } from 'react';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const UserProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef(null);

  // Form state
  const [formData, setFormData] = useState({
    firstName: "Admission",
    lastName: "Anytime",
    email: "admin@admissionanytime.com",
    phone: "+1 (555) 012-3456",
    language: "English (US)",
    timezone: "(GMT-05:00) Eastern Time"
  });

  const [errors, setErrors] = useState({});

  const handleEditClick = () => {
    if (isEditing) {
      // Reset form data on cancel
      setFormData({
        firstName: "Admission",
        lastName: "Anytime",
        email: "admin@admissionanytime.com",
        phone: "+1 (555) 012-3456",
        language: "English (US)",
        timezone: "(GMT-05:00) Eastern Time"
      });
      setErrors({});
    }
    setIsEditing(!isEditing);
  };

  const triggerImageUpload = () => fileInputRef.current?.click();

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      toast.error("Please fix the errors before saving", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "light",
      });
      return;
    }

    setIsSaving(true);
    
    // Simulate API call
    setTimeout(() => {
      toast.success("Profile updated successfully!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "light",
      });
      setIsEditing(false);
      setIsSaving(false);
    }, 800);
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 font-sans text-gray-800 bg-[#f8f9fa] p-8">
      <ToastContainer />

      {/* Header / Avatar Section */}
      <div className="bg-white rounded-[20px] border border-gray-100 p-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm hover:shadow-md transition-shadow duration-300">
        <div className="flex items-center gap-5">
          <div className="relative group">
            <div className="w-[90px] h-[90px] bg-gradient-to-br from-[#99d9cd] to-[#7cc4b5] rounded-full flex items-center justify-center border-4 border-white shadow-lg">
              {/* Custom Icon */}
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="8" r="4" stroke="white" strokeWidth="1.5" />
                <path d="M6 20V18C6 15.7909 7.79086 14 10 14H14C16.2091 14 18 15.7909 18 18V20" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M10 20H14V22H10V20Z" stroke="white" strokeWidth="1.5" />
              </svg>
            </div>
            {/* Edit pencil icon */}
            <button 
              onClick={triggerImageUpload}
              className="absolute bottom-0 right-0 bg-white p-[6px] rounded-full border border-gray-100 shadow-md hover:shadow-lg hover:scale-110 z-10 box-border text-[#10b981] transition-all duration-200"
              aria-label="Update profile photo"
            >
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M7.127 22.562l-7.127 1.438 1.438-7.128 5.689 5.69zm1.414-1.414l11.228-11.225-5.69-5.692-11.227 11.227 5.689 5.69zm9.768-21.148l-2.816 2.817 5.691 5.691 2.816-2.819-5.691-5.689z" /></svg>
            </button>
            <input 
              ref={fileInputRef} 
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  toast.info("Photo upload feature coming soon!", {
                    position: "top-right",
                    autoClose: 2000,
                  });
                }
              }}
            />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-[22px] font-bold text-gray-900">{formData.firstName} {formData.lastName}</h2>
              <span className="bg-gradient-to-r from-[#e6f4ea] to-[#d4ede0] text-[#1e8e3e] text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 border border-[#cce8d6] shadow-sm">
                <svg className="w-3 h-3 text-[#1e8e3e] bg-white rounded-full p-[1px]" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                VERIFIED AGENT
              </span>
            </div>
            <div className="text-gray-500 text-sm mt-1 flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" strokeWidth="2" /><line x1="16" y1="2" x2="16" y2="6" strokeWidth="2" /><line x1="8" y1="2" x2="8" y2="6" strokeWidth="2" /><line x1="3" y1="10" x2="21" y2="10" strokeWidth="2" /></svg>
              Member since Jan 2024
            </div>
          </div>
        </div>
        <button 
          onClick={triggerImageUpload}
          className="px-5 py-2 whitespace-nowrap border border-gray-200 text-sm font-semibold rounded-[10px] text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 shadow-sm bg-white"
        >
          Update Photo
        </button>
      </div>

      {/* Personal Details */}
      <div className="bg-white rounded-[20px] border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col">
        <div className="p-6 border-b border-gray-100 flex items-start justify-between">
          <div>
            <h3 className="text-[17px] font-bold text-gray-900">Personal Details</h3>
            <p className="text-gray-500 text-[13px] mt-0.5">Manage your basic information and contact details.</p>
          </div>
          <button
            onClick={handleEditClick}
            className={`px-4 py-2 whitespace-nowrap border text-sm font-semibold rounded-[10px] transition-all duration-200 shadow-sm flex items-center gap-2 ${
              isEditing 
                ? 'border-red-200 text-red-700 bg-red-50 hover:bg-red-100 hover:border-red-300' 
                : 'border-gray-200 text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-300'
            }`}
          >
            {isEditing ? (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
                Cancel
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M7.127 22.562l-7.127 1.438 1.438-7.128 5.689 5.69zm1.414-1.414l11.228-11.225-5.69-5.692-11.227 11.227 5.689 5.69zm9.768-21.148l-2.816 2.817 5.691 5.691 2.816-2.819-5.691-5.689z" />
                </svg>
                Edit
              </>
            )}
          </button>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
          <div className="flex flex-col gap-2">
            <label className="text-[14px] font-bold text-[#1f2937]">
              First Name <span className="text-red-500">*</span>
            </label>
            {isEditing ? (
              <>
                <input 
                  type="text" 
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  className={`w-full px-4 py-3 bg-[#fafafa] border rounded-xl text-[14px] text-gray-800 focus:outline-none transition-all duration-200 ${
                    errors.firstName 
                      ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200' 
                      : 'border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-100'
                  }`}
                  placeholder="Enter first name"
                />
                {errors.firstName && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.firstName}
                  </p>
                )}
              </>
            ) : (
              <p className="text-[14px] text-gray-800 py-3 font-medium">{formData.firstName}</p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[14px] font-bold text-[#1f2937]">
              Last Name <span className="text-red-500">*</span>
            </label>
            {isEditing ? (
              <>
                <input 
                  type="text" 
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  className={`w-full px-4 py-3 bg-[#fafafa] border rounded-xl text-[14px] text-gray-800 focus:outline-none transition-all duration-200 ${
                    errors.lastName 
                      ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200' 
                      : 'border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-100'
                  }`}
                  placeholder="Enter last name"
                />
                {errors.lastName && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.lastName}
                  </p>
                )}
              </>
            ) : (
              <p className="text-[14px] text-gray-800 py-3 font-medium">{formData.lastName}</p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[14px] font-bold text-[#1f2937]">
              Work Email <span className="text-red-500">*</span>
            </label>
            {isEditing ? (
              <>
                <input 
                  type="email" 
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`w-full px-4 py-3 bg-[#fafafa] border rounded-xl text-[14px] text-gray-800 focus:outline-none transition-all duration-200 ${
                    errors.email 
                      ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200' 
                      : 'border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-100'
                  }`}
                  placeholder="Enter email address"
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.email}
                  </p>
                )}
              </>
            ) : (
              <p className="text-[14px] text-gray-800 py-3 font-medium">{formData.email}</p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[14px] font-bold text-[#1f2937]">
              WhatsApp Number <span className="text-red-500">*</span>
            </label>
            {isEditing ? (
              <>
                <div className="relative flex items-center">
                  <div className="absolute left-4 pointer-events-none">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22.0461 4.70773C19.7891 2.3755 16.7126 1.09117 13.4338 1.09117C6.44754 1.09117 0.760742 6.77797 0.760742 13.7643C0.760742 15.9961 1.34181 18.1633 2.44109 20.0638L0.640625 26.6669L7.38787 24.8966C9.21522 25.8942 11.2941 26.421 13.43 26.421H13.4338C20.4201 26.421 26.1068 20.7342 26.1068 13.748C26.1068 10.3664 24.7915 7.15286 22.0461 4.70773ZM13.4338 24.2882C11.536 24.2882 9.69502 23.7788 8.08375 22.8228L7.70116 22.5956L3.69238 23.6457L4.76106 19.7431L4.51139 19.3458C3.45543 17.6695 2.89437 15.7538 2.89437 13.7643C2.89437 7.95304 7.62637 3.22104 13.4414 3.22104C16.2625 3.22104 18.8831 4.32043 20.877 6.31435C22.8709 8.30827 23.9703 10.9288 23.9703 13.7555C23.9703 19.5668 19.2383 24.2988 13.4338 24.2882ZM19.227 16.38C18.9085 16.2207 17.3466 15.4549 17.0282 15.3412C16.7098 15.2275 16.4823 15.1706 16.2548 15.489C16.0274 15.8075 15.3905 16.5467 15.1933 16.7666C14.9962 16.9865 14.799 17.013 14.4806 16.8538C14.1622 16.6946 13.1386 16.3609 11.9331 15.2843C10.9946 14.4464 10.3653 13.4115 10.1681 13.0931C9.97096 12.7746 10.1453 12.6078 10.3045 12.4486C10.4486 12.3045 10.6229 12.077 10.7821 11.8951C10.9413 11.7131 11.002 11.5842 11.1612 11.3567C11.3204 11.1293 11.237 10.9169 11.1612 10.7577C11.0854 10.5985 10.3653 8.84699 10.062 8.12674C9.76625 7.42923 9.47432 7.52778 9.27339 7.51261C9.08384 7.50124 8.85638 7.50124 8.62892 7.50124C8.40146 7.50124 8.03752 7.58464 7.74176 7.90308C7.44601 8.22151 6.61198 9.00623 6.61198 10.5985C6.61198 12.1907 7.77209 13.726 7.93132 13.9383C8.09054 14.1506 10.1983 17.5851 13.593 18.8968C14.4005 19.2077 15.0336 19.3896 15.534 19.5261C16.3377 19.7801 17.0656 19.7422 17.6532 19.6436C18.3129 19.5337 19.6743 18.7831 19.9624 17.9642C20.2505 17.1454 20.2505 16.4478 20.1709 16.2962C20.0913 16.1446 19.8638 16.0536 19.5454 15.8944Z" fill="#1ebd74" />
                    </svg>
                  </div>
                  <input 
                    type="text" 
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className={`w-full pl-11 pr-4 py-3 bg-[#fafafa] border rounded-xl text-[14px] text-gray-800 focus:outline-none transition-all duration-200 ${
                      errors.phone 
                        ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200' 
                        : 'border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-100'
                    }`}
                    placeholder="Enter phone number"
                  />
                </div>
                {errors.phone && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.phone}
                  </p>
                )}
              </>
            ) : (
              <div className="flex items-center gap-2 py-3">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.0461 4.70773C19.7891 2.3755 16.7126 1.09117 13.4338 1.09117C6.44754 1.09117 0.760742 6.77797 0.760742 13.7643C0.760742 15.9961 1.34181 18.1633 2.44109 20.0638L0.640625 26.6669L7.38787 24.8966C9.21522 25.8942 11.2941 26.421 13.43 26.421H13.4338C20.4201 26.421 26.1068 20.7342 26.1068 13.748C26.1068 10.3664 24.7915 7.15286 22.0461 4.70773ZM13.4338 24.2882C11.536 24.2882 9.69502 23.7788 8.08375 22.8228L7.70116 22.5956L3.69238 23.6457L4.76106 19.7431L4.51139 19.3458C3.45543 17.6695 2.89437 15.7538 2.89437 13.7643C2.89437 7.95304 7.62637 3.22104 13.4414 3.22104C16.2625 3.22104 18.8831 4.32043 20.877 6.31435C22.8709 8.30827 23.9703 10.9288 23.9703 13.7555C23.9703 19.5668 19.2383 24.2988 13.4338 24.2882ZM19.227 16.38C18.9085 16.2207 17.3466 15.4549 17.0282 15.3412C16.7098 15.2275 16.4823 15.1706 16.2548 15.489C16.0274 15.8075 15.3905 16.5467 15.1933 16.7666C14.9962 16.9865 14.799 17.013 14.4806 16.8538C14.1622 16.6946 13.1386 16.3609 11.9331 15.2843C10.9946 14.4464 10.3653 13.4115 10.1681 13.0931C9.97096 12.7746 10.1453 12.6078 10.3045 12.4486C10.4486 12.3045 10.6229 12.077 10.7821 11.8951C10.9413 11.7131 11.002 11.5842 11.1612 11.3567C11.3204 11.1293 11.237 10.9169 11.1612 10.7577C11.0854 10.5985 10.3653 8.84699 10.062 8.12674C9.76625 7.42923 9.47432 7.52778 9.27339 7.51261C9.08384 7.50124 8.85638 7.50124 8.62892 7.50124C8.40146 7.50124 8.03752 7.58464 7.74176 7.90308C7.44601 8.22151 6.61198 9.00623 6.61198 10.5985C6.61198 12.1907 7.77209 13.726 7.93132 13.9383C8.09054 14.1506 10.1983 17.5851 13.593 18.8968C14.4005 19.2077 15.0336 19.3896 15.534 19.5261C16.3377 19.7801 17.0656 19.7422 17.6532 19.6436C18.3129 19.5337 19.6743 18.7831 19.9624 17.9642C20.2505 17.1454 20.2505 16.4478 20.1709 16.2962C20.0913 16.1446 19.8638 16.0536 19.5454 15.8944Z" fill="#1ebd74" />
                </svg>
                <p className="text-[14px] text-gray-800 font-medium">{formData.phone}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Grid: Localization & Security */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Localization */}
        <div className="bg-white rounded-[20px] border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300 p-6 flex flex-col">
          <h3 className="text-[17px] font-bold text-gray-900 mb-6">Localization</h3>
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label className="text-[14px] font-bold text-[#1f2937]">Language</label>
              <select 
                value={formData.language}
                onChange={(e) => handleInputChange('language', e.target.value)}
                className="w-full px-4 py-3 bg-[#fafafa] border border-gray-200 rounded-xl text-[14px] text-gray-800 appearance-none focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20viewBox%3D%220%200%2020%2020%20%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M5%207.5L10%2012.5L15%207.5%22%20stroke%3D%22%236B7280%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[length:20px_20px] bg-[position:right_1rem_center] bg-no-repeat pr-10 hover:bg-[#f3f4f6] transition-colors cursor-pointer" 
              >
                <option>English (US)</option>
                <option>English (UK)</option>
                <option>Spanish</option>
                <option>French</option>
                <option>German</option>
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[14px] font-bold text-[#1f2937]">Timezone</label>
              <select 
                value={formData.timezone}
                onChange={(e) => handleInputChange('timezone', e.target.value)}
                className="w-full px-4 py-3 bg-[#fafafa] border border-gray-200 rounded-xl text-[14px] text-gray-800 appearance-none focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20viewBox%3D%220%200%2020%2020%20%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M5%207.5L10%2012.5L15%207.5%22%20stroke%3D%22%236B7280%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[length:20px_20px] bg-[position:right_1rem_center] bg-no-repeat pr-10 hover:bg-[#f3f4f6] transition-colors cursor-pointer"
              >
                <option>(GMT-05:00) Eastern Time</option>
                <option>(GMT-08:00) Pacific Time</option>
                <option>(GMT-06:00) Central Time</option>
                <option>(GMT+00:00) UTC</option>
                <option>(GMT+01:00) Central European Time</option>
              </select>
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="bg-white rounded-[20px] border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300 p-6 flex flex-col">
          <h3 className="text-[17px] font-bold text-gray-900">Security</h3>
          <p className="text-gray-500 text-[13px] mt-0.5 mb-6">Keep your account secure with a strong password.</p>
          <div className="bg-gradient-to-br from-[#fafafa] to-[#f5f5f5] p-4 rounded-xl border border-gray-100 flex items-center justify-between hover:shadow-sm transition-shadow duration-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-[#ffe8d6] to-[#ffd9bf] rounded-[10px] shadow-sm">
                <svg className="w-[18px] h-[18px] text-[#f97316]" fill="currentColor" viewBox="0 0 24 24"><path d="M18 10v-4c0-3.313-2.687-6-6-6s-6 2.687-6 6v4h-3v14h18v-14h-3zm-10-4c0-2.206 1.794-4 4-4s4 1.794 4 4v4h-8v-4zm4 13.25c-1.104 0-2-.896-2-20s.896-2 2-2 2 .896 2 2-.896 2-2 2zm3-1.25h-6v-6h6v6z" /></svg>
              </div>
              <div className="flex flex-col gap-[2px]">
                <p className="text-[14px] font-bold text-gray-900 leading-none">Password</p>
                <p className="text-[10px] text-gray-500 font-semibold tracking-wider uppercase leading-none mt-1">Last changed 3 months ago</p>
              </div>
            </div>
            <button 
              onClick={() => toast.info("Change password feature coming soon!", {
                position: "top-right",
                autoClose: 2000,
              })}
              className="font-semibold text-[14px] text-[#22c55e] hover:text-green-600 hover:scale-105 transition-all duration-200"
            >
              Change Password
            </button>
          </div>
        </div>
      </div>

      {isEditing && (
        <>
          <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent mt-8 mb-6"></div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-4 pb-2">
            <button 
              onClick={handleEditClick}
              disabled={isSaving}
              className="px-5 py-2.5 text-[15px] font-bold text-[#334155] hover:opacity-80 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-6 py-3 bg-gradient-to-r from-[#1ebd74] to-[#19a565] hover:from-[#19a565] hover:to-[#168f54] text-white text-[15px] font-bold rounded-[10px] shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 min-w-[160px] justify-center"
            >
              {isSaving ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Save Changes
                </>
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default UserProfile;
