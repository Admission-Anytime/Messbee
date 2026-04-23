import { useState, useRef } from 'react';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import defaultLogo from '../../assets/MessBee Logo.png';

const BusinessProfile = () => {
  const [activeEdit, setActiveEdit] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef(null);
  const [logoPreview, setLogoPreview] = useState(defaultLogo);
  const [savedLogo, setSavedLogo] = useState(defaultLogo);

  // Form state
  const [formData, setFormData] = useState({
    organizationName: "MessBee",
    websiteUrl: "messbee.com",
    businessCategory: "Technology & Software",
    businessDescription: "MessBee is a leading WhatsApp Business API platform providing automated messaging solutions for modern enterprises.",
    address: "123 Innovation Drive, Tech Park, Suite 400",
    city: "San Francisco",
    state: "CA",
    zipcode: "94105",
    country: "USA",
    currency: "USD - US Dollar",
    timezone: "(GMT-08:00) Pacific Time",
    taxId: "TX-987456123-A",
    billingName: "ATRI ADMISSION ANYTIME PVT LTD",
    billingAddress: "S-14, Basement, DLF Dilshad Extension 2",
    billingCountry: "India",
    billingState: "Uttar Pradesh",
    billingCity: "Ghaziabad",
    billingZipcode: "201005",
    mobileNumber: "916284063840",
    emailId: "info@admissionanytime.com",
    taxType: "GST",
    billingTaxId: "09AAXCA5870A1ZD"
  });

  const [errors, setErrors] = useState({});

  const handleEditToggle = (section) => {
  if (activeEdit === section) {
    setActiveEdit(null);
    setErrors({});
    if (section === "identity") {
      setLogoPreview(savedLogo);
    }
  } else {
    setActiveEdit(section);
  }
};

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (section) => {
    const newErrors = {};
    
    if (section === 'identity') {
      if (!formData.organizationName.trim()) {
        newErrors.organizationName = 'Organization name is required';
      }
      if (!formData.websiteUrl.trim()) {
        newErrors.websiteUrl = 'Website URL is required';
      }
    }
    
    if (section === 'billing') {
      if (!formData.emailId.trim()) {
        newErrors.emailId = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.emailId)) {
        newErrors.emailId = 'Please enter a valid email address';
      }
      if (!formData.billingName.trim()) {
        newErrors.billingName = 'Billing name is required';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (section) => {
    if (!validateForm(section)) {
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
      // Save logo when identity section is saved
      if (section === 'identity') {
        setSavedLogo(logoPreview);
      }
      
      toast.success("Section updated successfully!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "light",
      });
      setIsSaving(false);
      handleEditToggle(section);
    }, 800);
  };

  const triggerImageUpload = () => fileInputRef.current?.click();

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB", {
          position: "top-right",
          autoClose: 3000,
        });
        return;
      }
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error("Please upload a valid image file", {
          position: "top-right",
          autoClose: 3000,
        });
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
        toast.success("Logo uploaded successfully!", {
          position: "top-right",
          autoClose: 2000,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto bg-[#f6f8fb] min-h-screen space-y-8">
      
      <ToastContainer />

      <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
        <h1 className="text-3xl font-bold text-gray-900">Organization Settings</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your business identity, official API profile, billing, and regional compliance details.</p>
      </div>

      {/* 1. Organization Identity */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 flex items-center justify-center bg-green-50 rounded-lg">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 21H21" stroke="#1ebd74" strokeWidth="2" strokeLinecap="round" />
                <path d="M5 21V7C5 5.89543 5.89543 5 7 5H17C18.1046 5 19 5.89543 19 7V21" stroke="#1ebd74" strokeWidth="2" />
                <path d="M9 9H15" stroke="#1ebd74" strokeWidth="2" strokeLinecap="round" />
                <path d="M9 13H15" stroke="#1ebd74" strokeWidth="2" strokeLinecap="round" />
                <path d="M9 17H15" stroke="#1ebd74" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <h3 className="text-[18px] font-semibold text-gray-900 tracking-tight">Organization Identity</h3>
          </div>
          {!activeEdit || activeEdit !== "identity" ? (
            <button
              onClick={() => handleEditToggle('identity')}
              className="text-green-600 text-sm font-semibold hover:underline"
            >
              Edit
            </button>
          ) : (
            <div className="flex gap-4">
              <button
                onClick={() => handleEditToggle('identity')}
                disabled={isSaving}
                className="text-gray-500 text-sm font-semibold hover:underline disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSave('identity')}
                disabled={isSaving}
                className="text-green-600 text-sm font-semibold hover:underline disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </div>

        <div className="flex flex-col md:flex-row gap-12">
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <div 
                onClick={activeEdit === "identity" ? triggerImageUpload : undefined}
                className={`w-52 h-52 rounded-xl border-2 flex flex-col items-center justify-center relative overflow-hidden group transition-all duration-300 ${
                activeEdit === "identity" 
                ? 'border-dashed border-[#bcf0da] bg-[#f6fffb] cursor-pointer hover:border-[#1ebd74] hover:bg-[#ecfdf5]' 
                : 'border-solid border-gray-200 bg-white'
                 }`}
              >
                {logoPreview ? (
                  <>
                    <img 
                      src={logoPreview} 
                      alt="Organization Logo" 
                      className="w-full h-full object-contain p-4"
                    />
                    {activeEdit === "identity" &&  (
                      <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity duration-300 flex items-center justify-center">
                        <svg className="w-10 h-10 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-[#1ebd74]">
                 <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 16V4m0 0l-4 4m4-4l4 4M4 20h16" />
                </svg>
               {activeEdit === "identity" && (
               <span className="text-sm font-medium">Upload</span>
               )}
               </div>
                )}
              {activeEdit === "identity" && (
                <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-[#1ebd74] rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M7.127 22.562l-7.127 1.438 1.438-7.128 5.689 5.69zm1.414-1.414l11.228-11.225-5.69-5.692-11.227 11.227 5.689 5.69zm9.768-21.148l-2.816 2.817 5.691 5.691 2.816-2.819-5.691-5.689z" />
                  </svg>
                </div>
              )}
                          </div>
                     </div>
            
            <input  
              ref={fileInputRef} 
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={handleImageUpload}
            />
            <p className="text-[10px] text-gray-400 text-center uppercase font-bold tracking-wider leading-relaxed">
              Square, min 500×500px<br />JPG, PNG or SVG
              {activeEdit === "identity" && <span className="block text-[#1ebd74] mt-1">Click to upload</span>}
            </p>
          </div>

          <div className="flex-1 flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-[14px] font-bold text-gray-500">
                Organization Name {activeEdit === "identity" && <span className="text-red-500">*</span>}
              </label>
              {activeEdit === "identity" ? (
                <div>
                  <input 
                    type="text" 
                    value={formData.organizationName}
                    onChange={(e) => handleInputChange('organizationName', e.target.value)}
                    className={`w-full px-4 py-3 bg-[#fafafa] border rounded-xl text-[14px] text-gray-800 focus:outline-none transition-all duration-200 ${
                      errors.organizationName 
                        ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200' 
                        : 'border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-100'
                    }`}
                    placeholder="Enter organization name"
                  />
                  {errors.organizationName && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.organizationName}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-[15px] text-gray-900 py-3 font-semibold">
               {formData.organizationName}
               </p>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[14px] font-bold text-gray-500">
                Website URL {activeEdit === "identity" && <span className="text-red-500">*</span>}
              </label>
              {activeEdit === "identity" ? (
                <>
                  <div className="flex shadow-sm rounded-xl overflow-hidden border border-gray-200 focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-100 transition-all duration-200">
                    <span className="px-4 py-3 bg-[#f3f4f6] text-gray-500 text-[14px] border-r border-gray-200">https://</span>
                    <input 
                     type="text" 
                     value={formData.websiteUrl}
                     onChange={(e) => handleInputChange('websiteUrl', e.target.value)}
                     className={`w-full px-4 py-3 bg-[#fafafa] text-[14px] text-gray-800 focus:outline-none ${
                     errors.websiteUrl ? 'border-red-300' : ''
                     }`}
                      placeholder="example.com"
                      />
                  </div>
                  {errors.websiteUrl && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.websiteUrl}
                    </p>
                  )}
                </>
              ) : (
                <p className="text-[14px] py-3 font-medium">
                <span className="text-gray-500">https://</span>
                <span className="text-gray-900">{formData.websiteUrl}</span>
                </p>
              )}
            </div>
          </div>
        </div>
        

      </div>

      {/* 2. Official Business Profile */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 flex items-center justify-center bg-green-50 rounded-lg">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#1ebd74" strokeWidth="2" />
                <path d="M8 12L11 15L16 9" stroke="#1ebd74" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h3 className="text-[18px] font-semibold text-gray-900 tracking-tight">Official Business Profile</h3>
          </div>
          <div className="flex items-center gap-4">
            <span className="bg-green-100 text-green-700 text-[10px] font-bold px-3 py-1 rounded-full tracking-wider uppercase">WhatsApp API Ready</span>
            {!activeEdit || activeEdit !== "business" ? (
              <button
                onClick={() => handleEditToggle('business')}
                className="text-green-600 text-sm font-semibold hover:underline"
              >
                Edit
              </button>
            ) : (
              <div className="flex gap-4">
                <button
                  onClick={() => handleEditToggle('business')}
                  disabled={isSaving}
                  className="text-gray-500 text-sm font-semibold hover:underline disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleSave('business')}
                  disabled={isSaving}
                  className="text-green-600 text-sm font-semibold hover:underline disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex flex-col gap-2">
            <label className="text-[14px] font-bold text-gray-500">Business Category</label>
            {activeEdit === "business" ? (
              <select 
                value={formData.businessCategory}
                onChange={(e) => handleInputChange('businessCategory', e.target.value)}
                className="w-full px-4 py-3 bg-[#fafafa] border border-gray-200 rounded-xl text-[14px] text-gray-800 appearance-none focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20viewBox%3D%220%200%2020%2020%20%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M5%207.5L10%2012.5L15%207.5%22%20stroke%3D%22%236B7280%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[length:20px_20px] bg-[position:right_1rem_center] bg-no-repeat pr-10 hover:bg-[#f3f4f6] transition-colors cursor-pointer"
              >
                <option>Technology & Software</option>
                <option>E-commerce & Retail</option>
                <option>Healthcare</option>
                <option>Education</option>
                <option>Finance & Banking</option>
                <option>Real Estate</option>
                <option>Travel & Hospitality</option>
              </select>
            ) : (
              <p className="text-[14px] text-gray-800 py-3 font-medium">{formData.businessCategory}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[14px] font-bold text-gray-500">Business Description</label>
            {activeEdit === "business" ? (
              <>
                <textarea 
                  rows="3" 
                  value={formData.businessDescription}
                  onChange={(e) => handleInputChange('businessDescription', e.target.value)}
                  maxLength="256"
                  className="w-full px-4 py-3 bg-[#fafafa] border border-gray-200 rounded-xl text-[14px] text-gray-800 outline-none resize-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all duration-200"
                  placeholder="Describe your business..."
                ></textarea>
                <p className="text-[12px] text-gray-400 mt-0.5 flex items-center justify-between">
                  <span>Maximum 256 characters as per Meta guidelines.</span>
                  <span className={`font-semibold ${formData.businessDescription.length > 240 ? 'text-orange-500' : 'text-gray-500'}`}>
                    {formData.businessDescription.length}/256
                  </span>
                </p>
              </>
            ) : (
              <p className="text-[14px] text-gray-900 py-3 leading-relaxed">{formData.businessDescription || 'Not set'}</p>
            )}
          </div>

          <div className="flex flex-col gap-3">
            <label className="text-[14px] font-bold text-gray-500">Official Address</label>
            {activeEdit === "business" ? (
              <>
                <input 
                  type="text" 
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className="w-full px-4 py-3 bg-[#fafafa] border border-gray-200 rounded-xl text-[14px] text-gray-800 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all duration-200" 
                  placeholder="Street address"
                />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <input 
                    type="text" 
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    placeholder="City"
                    className="px-4 py-3 bg-[#fafafa] border border-gray-200 rounded-xl text-[14px] text-gray-800 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all duration-200" 
                  />
                  <input 
                    type="text" 
                    value={formData.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    placeholder="State"
                    className="px-4 py-3 bg-[#fafafa] border border-gray-200 rounded-xl text-[14px] text-gray-800 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all duration-200" 
                  />
                  <input 
                    type="text" 
                    value={formData.zipcode}
                    onChange={(e) => handleInputChange('zipcode', e.target.value)}
                    placeholder="Zipcode"
                    className="px-4 py-3 bg-[#fafafa] border border-gray-200 rounded-xl text-[14px] text-gray-800 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all duration-200" 
                  />
                  <input 
                    type="text" 
                    value={formData.country}
                    onChange={(e) => handleInputChange('country', e.target.value)}
                    placeholder="Country"
                    className="px-4 py-3 bg-[#fafafa] border border-gray-200 rounded-xl text-[14px] text-gray-800 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all duration-200" 
                  />
                </div>
              </>
            ) : (
              <div className="text-[14px] text-gray-900 py-3 leading-relaxed">
                 <p>{formData.address || 'Not set'}</p>
                 <p>{[formData.city, formData.state].filter(Boolean).join(', ')}</p>
                 <p>{[formData.zipcode, formData.country].filter(Boolean).join(', ')}</p>
              </div>
            )}
          </div>
        </div>


      </div>

      {/* 3. Regional & Compliance */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 flex items-center justify-center bg-green-50 rounded-lg">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#1ebd74" strokeWidth="2" />
                <path d="M2 12H22" stroke="#1ebd74" strokeWidth="2" />
                <path d="M12 2C14.5013 4.73835 15.9228 8.24815 15.9228 12C15.9228 15.7519 14.5013 19.2617 12 22C9.49872 19.2617 8.07725 15.7519 8.07725 12C8.07725 8.24815 9.49872 4.73835 12 2Z" stroke="#1ebd74" strokeWidth="2" />
              </svg>
            </div>
            <h3 className="text-[18px] font-semibold text-gray-900 tracking-tight">Regional & Compliance</h3>
          </div>
          {!activeEdit || activeEdit !== "regional" ? (
            <button
              onClick={() => handleEditToggle('regional')}
              className="text-green-600 text-sm font-semibold hover:underline"
            >
              Edit
            </button>
          ) : (
            <div className="flex gap-4">
              <button
                onClick={() => handleEditToggle('regional')}
                disabled={isSaving}
                className="text-gray-500 text-sm font-semibold hover:underline disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSave('regional')}
                disabled={isSaving}
                className="text-green-600 text-sm font-semibold hover:underline disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col gap-2">
            <label className="text-[14px] font-bold text-gray-500">Base Currency</label>
            {activeEdit === "regional" ? (
              <select 
                value={formData.currency}
                onChange={(e) => handleInputChange('currency', e.target.value)}
                className="w-full px-4 py-3 bg-[#fafafa] border border-gray-200 rounded-xl text-[14px] text-gray-800 appearance-none focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20viewBox%3D%220%200%2020%2020%20%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M5%207.5L10%2012.5L15%207.5%22%20stroke%3D%22%236B7280%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[length:20px_20px] bg-[position:right_1rem_center] bg-no-repeat pr-10 hover:bg-[#f3f4f6] transition-colors cursor-pointer"
              >
                <option>USD - US Dollar</option>
                <option>EUR - Euro</option>
                <option>GBP - British Pound</option>
                <option>INR - Indian Rupee</option>
                <option>AUD - Australian Dollar</option>
              </select>
            ) : (
              <p className="text-[14px] text-gray-800 py-3 font-medium">{formData.currency}</p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[14px] font-bold text-gray-500">Default Timezone</label>
            {activeEdit === "regional" ? (
              <select 
                value={formData.timezone}
                onChange={(e) => handleInputChange('timezone', e.target.value)}
                className="w-full px-4 py-3 bg-[#fafafa] border border-gray-200 rounded-xl text-[14px] text-gray-800 appearance-none focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20viewBox%3D%220%200%2020%2020%20%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M5%207.5L10%2012.5L15%207.5%22%20stroke%3D%22%236B7280%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[length:20px_20px] bg-[position:right_1rem_center] bg-no-repeat pr-10 hover:bg-[#f3f4f6] transition-colors cursor-pointer"
              >
                <option>(GMT-08:00) Pacific Time</option>
                <option>(GMT-05:00) Eastern Time</option>
                <option>(GMT-06:00) Central Time</option>
                <option>(GMT+00:00) UTC</option>
                <option>(GMT+05:30) India Standard Time</option>
              </select>
            ) : (
              <p className="text-[14px] text-gray-800 py-3 font-medium">{formData.timezone}</p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[14px] font-bold text-gray-500">Tax ID / GSTN</label>
            {activeEdit === "regional" ? (
              <input 
                type="text" 
                value={formData.taxId}
                onChange={(e) => handleInputChange('taxId', e.target.value)}
                className="w-full px-4 py-3 bg-[#fafafa] border border-gray-200 rounded-xl text-[14px] text-gray-800 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all duration-200" 
                placeholder="Enter tax ID"
              />
            ) : (
              <p className="text-[14px] text-gray-800 py-3 font-medium">{formData.taxId || 'Not set'}</p>
            )}
          </div>
        </div>


      </div>

      {/* 4. Billing Information */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 flex items-center justify-center bg-green-50 rounded-lg">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="2" y="5" width="20" height="14" rx="2" stroke="#1ebd74" strokeWidth="2" />
                <path d="M2 10H22" stroke="#1ebd74" strokeWidth="2" />
                <path d="M7 15H11" stroke="#1ebd74" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <h3 className="text-[18px] font-semibold text-gray-900 tracking-tight">Billing Information</h3>
          </div>
          {!activeEdit || activeEdit !== "billing" ? (
            <button
              onClick={() => handleEditToggle('billing')}
              className="text-green-600 text-sm font-semibold hover:underline"
            >
              Edit
            </button>
          ) : (
            <div className="flex gap-4">
              <button
                onClick={() => handleEditToggle('billing')}
                disabled={isSaving}
                className="text-gray-500 text-sm font-semibold hover:underline disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSave('billing')}
                disabled={isSaving}
                className="text-green-600 text-sm font-semibold hover:underline disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-x-8 gap-y-6">
          <div className="md:col-span-4 flex flex-col gap-2">
            <label className="text-[14px] font-bold text-gray-500">
              Billing Name {activeEdit === "billing" && <span className="text-red-500">*</span>}
            </label>
            {activeEdit === "billing" ? (
              <>
                <input 
                  type="text" 
                  value={formData.billingName}
                  onChange={(e) => handleInputChange('billingName', e.target.value)}
                  className={`w-full px-4 py-3 bg-[#fafafa] border rounded-xl text-[14px] text-gray-800 focus:outline-none transition-all duration-200 ${
                    errors.billingName 
                      ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200' 
                      : 'border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-100'
                  }`}
                  placeholder="Enter billing name"
                />
                {errors.billingName && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.billingName}
                  </p>
                )}
              </>
            ) : (
              <p className="text-[14px] text-gray-800 py-3 font-medium">{formData.billingName}</p>
            )}
          </div>
          <div className="md:col-span-4 flex flex-col gap-2">
            <label className="text-[14px] font-bold text-gray-500">Billing Address</label>
            {activeEdit === "billing" ? (
              <input 
                type="text" 
                value={formData.billingAddress}
                onChange={(e) => handleInputChange('billingAddress', e.target.value)}
                className="w-full px-4 py-3 bg-[#fafafa] border border-gray-200 rounded-xl text-[14px] text-gray-800 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all duration-200" 
                placeholder="Enter billing address"
              />
            ) : (
              <p className="text-[14px] text-gray-800 py-3 font-medium">{formData.billingAddress || 'Not set'}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[14px] font-bold text-gray-500">Country</label>
            {activeEdit === "billing" ? (
              <input 
                type="text" 
                value={formData.billingCountry}
                onChange={(e) => handleInputChange('billingCountry', e.target.value)}
                className="w-full px-4 py-3 bg-[#fafafa] border border-gray-200 rounded-xl text-[14px] text-gray-800 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all duration-200" 
                placeholder="Country"
              />
            ) : (
              <p className="text-[14px] text-gray-800 py-3 font-medium">{formData.billingCountry || 'Not set'}</p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[14px] font-bold text-gray-500">State</label>
            {activeEdit === "billing" ? (
              <input 
                type="text" 
                value={formData.billingState}
                onChange={(e) => handleInputChange('billingState', e.target.value)}
                className="w-full px-4 py-3 bg-[#fafafa] border border-gray-200 rounded-xl text-[14px] text-gray-800 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all duration-200" 
                placeholder="State"
              />
            ) : (
              <p className="text-[14px] text-gray-800 py-3 font-medium">{formData.billingState || 'Not set'}</p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[14px] font-bold text-gray-500">City</label>
            {activeEdit === "billing" ? (
              <input 
                type="text" 
                value={formData.billingCity}
                onChange={(e) => handleInputChange('billingCity', e.target.value)}
                className="w-full px-4 py-3 bg-[#fafafa] border border-gray-200 rounded-xl text-[14px] text-gray-800 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all duration-200" 
                placeholder="City"
              />
            ) : (
              <p className="text-[14px] text-gray-800 py-3 font-medium">{formData.billingCity || 'Not set'}</p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[14px] font-bold text-gray-500">Pincode / Zipcode</label>
            {activeEdit === "billing" ? (
              <input 
                type="text" 
                value={formData.billingZipcode}
                onChange={(e) => handleInputChange('billingZipcode', e.target.value)}
                className="w-full px-4 py-3 bg-[#fafafa] border border-gray-200 rounded-xl text-[14px] text-gray-800 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all duration-200" 
                placeholder="Zipcode"
              />
            ) : (
              <p className="text-[14px] text-gray-800 py-3 font-medium">{formData.billingZipcode || 'Not set'}</p>
            )}
          </div>

          <div className="md:col-span-2 flex flex-col gap-2">
            <label className="text-[14px] font-bold text-gray-500">Mobile Number</label>
            {activeEdit === "billing" ? (
              <input 
                type="text" 
                value={formData.mobileNumber}
                onChange={(e) => handleInputChange('mobileNumber', e.target.value)}
                className="w-full px-4 py-3 bg-[#fafafa] border border-gray-200 rounded-xl text-[14px] text-gray-800 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all duration-200" 
                placeholder="Enter mobile number"
              />
            ) : (
              <p className="text-[14px] text-gray-800 py-3 font-medium">{formData.mobileNumber || 'Not set'}</p>
            )}
          </div>
          <div className="md:col-span-2 flex flex-col gap-2">
            <label className="text-[14px] font-bold text-gray-500">
              Email Id {activeEdit === "billing" && <span className="text-red-500">*</span>}
            </label>
            {activeEdit === "billing" ? (
              <>
                <input 
                  type="email" 
                  value={formData.emailId}
                  onChange={(e) => handleInputChange('emailId', e.target.value)}
                  className={`w-full px-4 py-3 bg-[#fafafa] border rounded-xl text-[14px] text-gray-800 focus:outline-none transition-all duration-200 ${
                    errors.emailId 
                      ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200' 
                      : 'border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-100'
                  }`}
                  placeholder="Enter email address"
                />
                {errors.emailId && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.emailId}
                  </p>
                )}
              </>
            ) : (
              <p className="text-[14px] text-gray-800 py-3 font-medium">{formData.emailId}</p>
            )}
          </div>

          <div className="md:col-span-2 flex flex-col gap-2">
            <label className="text-[14px] font-bold text-gray-500">Tax Type</label>
            {activeEdit === "billing" ? (
              <select 
                value={formData.taxType}
                onChange={(e) => handleInputChange('taxType', e.target.value)}
                className="w-full px-4 py-3 bg-[#fafafa] border border-gray-200 rounded-xl text-[14px] text-gray-800 appearance-none focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20viewBox%3D%220%200%2020%2020%20%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M5%207.5L10%2012.5L15%207.5%22%20stroke%3D%22%236B7280%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[length:20px_20px] bg-[position:right_1rem_center] bg-no-repeat pr-10 hover:bg-[#f3f4f6] transition-colors cursor-pointer"
              >
                <option>GST</option>
                <option>VAT</option>
                <option>Sales Tax</option>
                <option>Other</option>
              </select>
            ) : (
              <p className="text-[14px] text-gray-800 py-3 font-medium">{formData.taxType}</p>
            )}
          </div>
          <div className="md:col-span-2 flex flex-col gap-2">
            <label className="text-[14px] font-bold text-gray-500">Tax Id</label>
            {activeEdit === "billing" ? (
              <input 
                type="text" 
                value={formData.billingTaxId}
                onChange={(e) => handleInputChange('billingTaxId', e.target.value)}
                className="w-full px-4 py-3 bg-[#fafafa] border border-gray-200 rounded-xl text-[14px] text-gray-800 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all duration-200" 
                placeholder="Enter tax ID"
              />
            ) : (
              <p className="text-[14px] text-gray-800 py-3 font-medium">{formData.billingTaxId || 'Not set'}</p>
            )}
          </div>
        </div>


      </div>
    </div>
  );
};

export default BusinessProfile;
