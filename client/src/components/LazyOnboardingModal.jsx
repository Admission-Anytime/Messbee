import { useState, useEffect, useContext } from 'react';
import axios from '../context/axios';
import { toast } from 'react-toastify';
import { userContext } from '../context/Context';
import { Link } from "react-router-dom";

// ── Shared Components from Registration ──────────────────────────────────────
const SectionLabel = ({ icon, text }) => (
  <div className="flex items-center gap-2 mb-4 mt-2">
    {icon ? (
      <span className="text-slate-400">{icon}</span>
    ) : (
      <span className="w-[3px] h-[14px] bg-[#22c55e] rounded-full shrink-0" />
    )}
    <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">
      {text}
    </span>
  </div>
);

const Field = ({ label, optional, hint, children }) => (
  <div className="mb-4">
    <label className="block text-[13px] font-medium text-slate-700 mb-1.5">
      {label}{" "}
      {optional && <span className="text-slate-400 font-normal">(Optional)</span>}
    </label>
    {children}
    {hint && <p className="mt-1.5 text-[11px] text-blue-500">{hint}</p>}
  </div>
);

const IconInput = ({ icon, rightIcon, ...props }) => (
  <div className="flex items-center border border-slate-200 rounded-[9px] bg-white overflow-hidden focus-within:border-[#22c55e] focus-within:ring-2 focus-within:ring-[#22c55e]/10 transition-all min-w-0">
    {icon && (
      <span className="flex items-center px-3 text-slate-400 shrink-0">{icon}</span>
    )}
    <input
      {...props}
      className="flex-1 text-[13px] text-slate-700 py-[11px] pr-3 bg-transparent outline-none min-w-0 placeholder:text-slate-300"
    />
    {rightIcon}
  </div>
);

const LocIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
  </svg>
);

const GlobeIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
  </svg>
);

const UserIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);

const MailIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
  </svg>
);

const BuildingIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/>
  </svg>
);

const PhoneIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
  </svg>
);


const CATEGORIES = [
  { value: "education", label: "Education", icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" /></svg> },
  { value: "ecommerce", label: "E-commerce", icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" /></svg> },
  { value: "realestate", label: "Real Estate", icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg> },
  { value: "hospital", label: "Hospital", icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg> },
  { value: "coaching", label: "Coaching", icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg> },
  { value: "marketing", label: "Marketing Agency", icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14" /><path d="M15.54 8.46a5 5 0 0 1 0 7.07" /></svg> },
  { value: "other", label: "Other", icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" /></svg> },
];

const BUSINESS_TYPES = ["Individual", "Company", "Startup", "Agency"];

const LazyOnboardingModal = () => {
  const { user, updateUser } = useContext(userContext);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    phone: '',
    businessName: '',
    businessCategory: '',
    businessType: 'Individual',
    city: '',
    state: '',
    country: ''
  });

  useEffect(() => {
    const isNewUser = localStorage.getItem('isNewUser');
    if (isNewUser === 'true' && user) {
      setIsOpen(true);
      setFormData(prev => ({ ...prev, phone: user.phone || '' }));
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCategorySelect = (val) => setFormData(prev => ({ ...prev, businessCategory: val }));
  const handleTypeSelect = (val) => setFormData(prev => ({ ...prev, businessType: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Strict Validation
    const { phone, businessName, businessCategory, businessType, city, state, country } = formData;
    if (!phone || !businessName || !businessCategory || !businessType || !city || !state || !country) {
      toast.error("Please fill in all mandatory fields.");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.put('/users/profile', formData);
      if (res.data.success) {
        toast.success("Profile completed successfully!");
        localStorage.removeItem('isNewUser');
        
        // Update global context so the UI reflects changes immediately
        const updatedUser = { ...user, ...formData };
        updateUser(updatedUser);
        
        setIsOpen(false);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity p-4 sm:p-6 font-['Inter',sans-serif]">
      <div className="bg-white w-full max-w-[430px] rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
        
        {/* Header - Matching Registration Logo Bar */}
        <div className="px-6 pt-6 pb-2 flex items-center justify-center gap-2 border-b border-slate-100 bg-white shrink-0 shadow-sm z-10 relative">
          <div className="text-center w-full">
            <h2 className="text-[1.35rem] font-bold text-slate-900 leading-tight mb-1">
              Complete Profile
            </h2>
            <p className="text-[13px] text-slate-500 mb-3">
              Tell us about your business to get started.
            </p>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 bg-white">
          
          {/* Section: Locked Personal Details */}
          <SectionLabel text="Personal Details" />
          <Field label="Full Name">
            <IconInput icon={<UserIcon />} type="text" value={user?.name || ''} disabled className="opacity-60 bg-slate-50 cursor-not-allowed" />
          </Field>
          <Field label="Email Address">
            <IconInput icon={<MailIcon />} type="email" value={user?.email || ''} disabled className="opacity-60 bg-slate-50 cursor-not-allowed" />
          </Field>

          {/* Section: Business Info */}
          <div className="border-t border-slate-100 pt-3 mt-2">
             <SectionLabel text="Business Contact" />
             <Field label="Business Name">
               <IconInput icon={<BuildingIcon />} type="text" name="businessName" value={formData.businessName} onChange={handleChange} required placeholder="Enter business name" />
             </Field>
             <Field label="Phone Number">
               <IconInput icon={<PhoneIcon />} type="tel" name="phone" value={formData.phone} onChange={handleChange} required placeholder="e.g. +1 234 567 8900" />
             </Field>
          </div>

          {/* Business Category */}
          <div className="border-t border-slate-100 pt-3 mt-2">
            <SectionLabel text="Business Category" />
            <div className="grid grid-cols-4 gap-2 mb-2">
              {CATEGORIES.map((cat) => (
                <button key={cat.value} type="button"
                  onClick={() => handleCategorySelect(cat.value)}
                  className={`flex flex-col items-center justify-center gap-2 py-3 px-1 border rounded-[10px] text-center transition-all cursor-pointer
                    ${formData.businessCategory === cat.value
                      ? "border-[#22c55e] bg-green-50 text-[#16a34a] shadow-[0_0_0_3px_rgba(34,197,94,0.13)]"
                      : "border-slate-200 bg-white text-slate-500 hover:border-[#22c55e] hover:bg-green-50 hover:text-[#16a34a]"}`}>
                  <span className={formData.businessCategory === cat.value ? "text-[#22c55e]" : "text-slate-400"}>
                    {cat.icon}
                  </span>
                  <span className="text-[10px] font-medium leading-tight">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Business Type */}
          <div className="border-t border-slate-100 pt-3 mt-2">
            <SectionLabel text="Business Type" />
            <div className="grid grid-cols-4 border border-slate-200 rounded-[10px] overflow-hidden mb-2">
              {BUSINESS_TYPES.map((type, i) => (
                <button key={type} type="button"
                  onClick={() => handleTypeSelect(type)}
                  className={`py-[11px] px-2 text-[12px] font-medium text-center transition-colors
                    ${i < BUSINESS_TYPES.length - 1 ? "border-r border-slate-200" : ""}
                    ${formData.businessType === type
                      ? "bg-white text-slate-900 font-semibold"
                      : "bg-white text-slate-500 hover:bg-slate-50"}`}>
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Location Details */}
          <div className="border-t border-slate-100 pt-3 mt-2">
            <SectionLabel text="Location Details" />
            <div className="grid grid-cols-2 gap-3">
              <Field label="City">
                <IconInput icon={<LocIcon />} type="text" name="city" placeholder="Enter your city" value={formData.city} onChange={handleChange} required />
              </Field>
              <Field label="State">
                <IconInput icon={<LocIcon />} type="text" name="state" placeholder="Enter your state" value={formData.state} onChange={handleChange} required />
              </Field>
            </div>
            <Field label="Country">
              <div className="flex items-center border border-slate-200 rounded-[9px] bg-white overflow-hidden focus-within:border-[#22c55e] focus-within:ring-2 focus-within:ring-[#22c55e]/10 transition-all">
                <span className="flex items-center px-3 text-slate-400 shrink-0">
                  <GlobeIcon />
                </span>
                <select name="country" value={formData.country} onChange={handleChange} required
                  className="flex-1 text-[13px] text-slate-700 py-[11px] pr-8 bg-transparent outline-none appearance-none cursor-pointer min-w-0">
                  <option value="" disabled></option>
                  {["India","United States","United Kingdom","Australia","Canada","Singapore","UAE","Germany","France","Japan"].map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <span className="pr-3 text-slate-400 pointer-events-none shrink-0">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </span>
              </div>
            </Field>
          </div>

          {/* Submit Button */}
          <div className="pt-4 mt-2">
            <button type="submit" disabled={loading}
              className="w-full py-[14px] bg-[#22c55e] hover:bg-[#16a34a] text-white font-semibold text-[14px] rounded-[10px] transition-all shadow-sm hover:shadow-[0_4px_16px_rgba(34,197,94,0.3)] active:scale-[0.97] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2">
              {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Continue"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LazyOnboardingModal;
