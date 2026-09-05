import { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css";
import { toast } from "react-toastify";
import { userContext } from "../../context/Context";
import {
  requestSignupOTP,
  verifySignupOTP,
  resendOTP,
  saveAuthData,
  loginWithSocial,
} from "../../services/authService";
import { triggerGoogleLogin } from "../../utils/googleAuth";
import Google from "../../assets/googlelogo.svg";
import { FiEye, FiEyeOff } from "react-icons/fi";
import logoIcon from "../../assets/MessBee Logo.png";
import logoName from "../../assets/MessBee Name.png";

// ── Shared Section Label ──────────────────────────────────────
const SectionLabel = ({ icon, text }) => (
  <div className="flex items-center gap-2 mb-1.5 mt-0.5">
    {icon ? (
      <span className="text-slate-400">{icon}</span>
    ) : (
      <span className="w-[3px] h-[10px] bg-[#22c55e] rounded-full shrink-0" />
    )}
    <span className="text-[9px] font-bold text-slate-400 tracking-widest uppercase">
      {text}
    </span>
  </div>
);

// ── Field Wrapper ─────────────────────────────────────────────
const Field = ({ label, optional, hint, children }) => (
  <div className="mb-2">
    <label className="block text-[10px] font-medium text-slate-700 mb-0.5">
      {label}{" "}
      {optional && <span className="text-slate-400 font-normal">(Optional)</span>}
    </label>
    {children}
    {hint && <p className="mt-0.5 text-[9px] text-blue-500">{hint}</p>}
  </div>
);

// ── Input with icon ───────────────────────────────────────────
const IconInput = ({ icon, rightIcon, ...props }) => (
  <div className="flex items-center border border-slate-200 rounded-[7px] bg-white overflow-hidden focus-within:border-[#22c55e] focus-within:ring-2 focus-within:ring-[#22c55e]/10 transition-all min-w-0">
    {icon && (
      <span className="flex items-center px-2 text-slate-400 shrink-0">{icon}</span>
    )}
    <input
      {...props}
      className="flex-1 text-[11px] text-slate-700 py-[6px] pr-3 bg-transparent outline-none min-w-0 placeholder:text-slate-300"
    />
    {rightIcon}
  </div>
);

// ── Category Icons ────────────────────────────────────────────
const CATEGORIES = [
  {
    value: "education",
    label: "Education",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
        <path d="M6 12v5c3 3 9 3 12 0v-5" />
      </svg>
    ),
  },
  {
    value: "ecommerce",
    label: "E-commerce",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="21" r="1" />
        <circle cx="20" cy="21" r="1" />
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
      </svg>
    ),
  },
  {
    value: "realestate",
    label: "Real Estate",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    value: "hospital",
    label: "Hospital",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    ),
  },
  {
    value: "coaching",
    label: "Coaching",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    value: "marketing",
    label: "Marketing Agency",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
        <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
      </svg>
    ),
  },
  {
    value: "other",
    label: "Other",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="1" />
        <circle cx="19" cy="12" r="1" />
        <circle cx="5" cy="12" r="1" />
      </svg>
    ),
  },
];

const BUSINESS_TYPES = ["Individual", "Company", "Startup", "Agency"];

// ── Auto-generated ID helper ──────────────────────────────────
const genId = (prefix) => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const rand = Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  const yr = new Date().getFullYear();
  return `${prefix}-${yr}-${rand}`;
};

// ══════════════════════════════════════════════════════════════
// STEP 1 — Basic Personal Details
// ══════════════════════════════════════════════════════════════
const Step1 = ({ onNext }) => {
  const navigate = useNavigate();
  const { loginUser } = useContext(userContext);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    businessName: "",
    email: "",
    password: "",
    confirmPassword: "",
    referralCode: "",
  });
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const clientId = useState(() => genId("CLI"))[0];
  const trialId  = useState(() => genId("TRL"))[0];

  const handleGoogleSignup = async () => {
    try {
      setGoogleLoading(true);
      await triggerGoogleLogin({
        onSuccess: async (accessToken) => {
          try {
            const res = await loginWithSocial("google", accessToken);
            if (res.success) {
              toast.success("Successfully signed up with Google!");
              saveAuthData(res.data);
              loginUser(res.data.user);
              navigate("/admin/dashboard");
            }
          } catch (error) {
            const message = error?.response?.data?.message || "Google signup failed";
            toast.error(message);
          } finally {
            setGoogleLoading(false);
          }
        },
        onError: (error) => {
          console.error("Google Signup Error:", error);
          toast.error(error?.message || "Google sign in failed.");
          setGoogleLoading(false);
        },
        onCancel: () => {
          setGoogleLoading(false);
        }
      });
    } catch (error) {
      console.error("Google trigger error:", error);
      toast.error("Failed to initialize Google sign in.");
      setGoogleLoading(false);
    }
  };

  const handle = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const submit = (e) => {
    e.preventDefault();

    if (!formData.fullName.trim()) {
      toast.error("Full Name is required.");
      return;
    }
    if (!/[a-zA-Z]/.test(formData.fullName)) {
      toast.error("Full Name must contain at least one alphabetic character.");
      return;
    }

    if (!formData.businessName.trim()) {
      toast.error("Business Name is required.");
      return;
    }
    if (!/[a-zA-Z]/.test(formData.businessName)) {
      toast.error("Business Name must contain at least one alphabetic character.");
      return;
    }

    if (!formData.email.trim()) {
      toast.error("Email address is required.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      toast.error("Please enter a valid email address.");
      return;
    }

    if (!formData.password) {
      toast.error("Password is required.");
      return;
    }
    if (formData.password.length < 8) {
      toast.error("Password must be at least 8 characters long.");
      return;
    }
    if (!/[A-Z]/.test(formData.password)) {
      toast.error("Password must contain at least one uppercase letter (A-Z).");
      return;
    }
    if (!/[a-z]/.test(formData.password)) {
      toast.error("Password must contain at least one lowercase letter (a-z).");
      return;
    }
    if (!/[0-9]/.test(formData.password)) {
      toast.error("Password must contain at least one numeric digit (0-9).");
      return;
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(formData.password)) {
      toast.error("Password must contain at least one special character (!@#$%^&*).");
      return;
    }

    if (!formData.confirmPassword) {
      toast.error("Please confirm your password.");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    onNext({ ...formData, clientId, trialId });
  };

  const LockIcon = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );

  return (
    <div className="min-h-screen bg-[#f5f6fa] font-['Inter',sans-serif] flex flex-col items-center">
      <div className="w-full max-w-[430px] bg-white flex-1 min-h-screen flex flex-col">

        {/* Logo Bar */}
        <div className="px-5 pt-4 pb-1 flex items-center gap-2">
          <img src={logoIcon} alt="MessBee" className="w-6 h-6 object-contain" />
          <img src={logoName} alt="MessBee" className="h-4 object-contain" />
        </div>

        <form onSubmit={submit} noValidate className="flex-1 flex flex-col px-5 pb-4">
          {/* Header */}
          <div className="mt-2 mb-2">
            <h1 className="text-[1rem] font-bold text-slate-900 leading-tight mb-0.5">
              Basic Personal Details
            </h1>
            <p className="text-[10px] text-slate-500">
              Enter your business and account information to continue.
            </p>
          </div>

          {/* Quick Google Sign up */}
          <div className="mb-2">
            <button
              type="button"
              onClick={handleGoogleSignup}
              disabled={googleLoading}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 border border-slate-200 rounded-[8px] hover:bg-slate-50 transition-all text-xs font-semibold text-slate-700 shadow-sm disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
            >
              {googleLoading ? (
                <div className="w-4 h-4 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin"></div>
              ) : (
                <>
                  <img src={Google} alt="Google" className="w-4 h-4 shrink-0" />
                  <span>Sign up with Google</span>
                </>
              )}
            </button>

            <div className="flex items-center my-2">
              <div className="flex-1 h-px bg-slate-100"></div>
              <span className="px-3 text-[10px] font-medium text-slate-400">or register with email</span>
              <div className="flex-1 h-px bg-slate-100"></div>
            </div>
          </div>

          {/* Required Information */}
          <div className="border-t border-slate-100 pt-2">
            <SectionLabel text="Required Information" />
            <Field label="Full Name">
              <IconInput
                icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>}
                name="fullName" type="text" placeholder="John Doe"
                value={formData.fullName} onChange={handle} required
              />
            </Field>
            <Field label="Business Name">
              <IconInput
                icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>}
                name="businessName" type="text" placeholder="Acme Corporation"
                value={formData.businessName} onChange={handle} required
              />
            </Field>
            <Field label="Email Address" hint="We'll use this email for account communication.">
              <IconInput
                icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>}
                name="email" type="email" placeholder="john@example.com"
                value={formData.email} onChange={handle} required
              />
            </Field>
          </div>

          {/* Security */}
          <div className="border-t border-slate-100 pt-2">
            <SectionLabel
              text="Security"
              icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>}
            />
            <Field label="Password">
              <IconInput
                icon={<LockIcon />}
                name="password" type={showPwd ? "text" : "password"}
                placeholder="••••••••"
                value={formData.password} onChange={handle} required
                rightIcon={
                  <button type="button" onClick={() => setShowPwd(!showPwd)}
                    className="px-3 text-slate-400 hover:text-slate-600 transition-colors">
                    {showPwd ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                  </button>
                }
              />
            </Field>
            <Field label="Confirm Password">
              <IconInput
                icon={<LockIcon />}
                name="confirmPassword" type={showConfirm ? "text" : "password"}
                placeholder="••••••••"
                value={formData.confirmPassword} onChange={handle} required
                rightIcon={
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                    className="px-3 text-slate-400 hover:text-slate-600 transition-colors">
                    {showConfirm ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                  </button>
                }
              />
            </Field>
          </div>

          {/* Optional */}
          <div className="border-t border-slate-100 pt-2">
            <SectionLabel text="Optional" />
            <Field label="Referral Code" optional>
              <IconInput
                icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>}
                name="referralCode" type="text" placeholder="Enter code if you have one"
                value={formData.referralCode} onChange={handle}
              />
            </Field>
          </div>

          {/* Auto-generated */}
          <div className="border-t border-slate-100 pt-2 mb-3">
            <SectionLabel text="Auto-Generated by System" />
            <div className="grid grid-cols-2 gap-2">
              {[["Client ID", clientId], ["Trial Account ID", trialId]].map(([lbl, val]) => (
                <div key={lbl}>
                  <label className="block text-[10px] font-medium text-slate-700 mb-0.5">{lbl}</label>
                  <div className="flex items-center border border-slate-200 rounded-[7px] bg-slate-50 overflow-hidden min-w-0">
                    <span className="flex items-center px-2 text-slate-400 shrink-0">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/>
                        <line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/>
                      </svg>
                    </span>
                    <input readOnly value={val}
                      className="flex-1 text-[10px] font-medium text-slate-600 py-[6px] pr-2 bg-transparent outline-none min-w-0 overflow-hidden text-ellipsis whitespace-nowrap" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Continue */}
          <button type="submit"
            className="w-full py-[10px] bg-[#22c55e] hover:bg-[#16a34a] text-white font-semibold text-[13px] rounded-[10px] transition-all shadow-sm hover:shadow-[0_4px_16px_rgba(34,197,94,0.3)] active:scale-[0.98]">
            Continue
          </button>

          <p className="text-center text-[10px] text-slate-500 mt-2">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-500 font-semibold hover:underline">Sign In</Link>
          </p>
        </form>

        <div className="px-5 py-2 bg-[#f0f2f5] text-center">
          <p className="text-[10px] text-slate-400">
            By continuing, you agree to our{" "}
            <Link to="#" className="text-slate-500 font-medium hover:underline">Terms of Service</Link>{" "}
            and{" "}
            <Link to="#" className="text-slate-500 font-medium hover:underline">Privacy Policy</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════
// STEP 2 — Business Information
// ══════════════════════════════════════════════════════════════
const Step2 = ({ step1Data, onBack, onSubmit, isLoading }) => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [customCategory, setCustomCategory] = useState("");
  const [selectedType, setSelectedType] = useState("Individual");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("");
  const [gst, setGst] = useState("");
  const [website, setWebsite] = useState("");

  const submit = (e) => {
    e.preventDefault();
    if (!selectedCategory) { toast.error("Please select a Business Category."); return; }
    if (selectedCategory === "other" && !customCategory.trim()) { toast.error("Please enter your custom Business Category."); return; }
    if (!city.trim()) { toast.error("Please enter your City."); return; }
    if (!state.trim()) { toast.error("Please enter your State."); return; }
    if (!country.trim()) { toast.error("Please select your Country."); return; }
    
    const finalCategory = selectedCategory === "other" ? customCategory.trim() : selectedCategory;
    onSubmit({ selectedCategory: finalCategory, selectedType, city, state, country, gst, website });
  };

  const LocIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
    </svg>
  );

  return (
    <div className="min-h-screen bg-[#f5f6fa] font-['Inter',sans-serif] flex flex-col items-center">
      <div className="w-full max-w-[430px] bg-white flex-1 min-h-screen flex flex-col">

        {/* Logo Bar */}
        <div className="px-5 pt-4 pb-1 flex items-center gap-2">
          <img src={logoIcon} alt="MessBee" className="w-6 h-6 object-contain" />
          <img src={logoName} alt="MessBee" className="h-4 object-contain" />
        </div>

        <form onSubmit={submit} noValidate className="flex-1 flex flex-col px-5 pb-4">
          {/* Header */}
          <div className="mt-2 mb-2">
            <h1 className="text-[1rem] font-bold text-slate-900 leading-tight mb-0.5">
              Business Information
            </h1>
            <p className="text-[10px] text-slate-500">
              Tell us more about your business setup and location.
            </p>
          </div>

          {/* Business Category */}
          <div className="border-t border-slate-100 pt-2">
            <SectionLabel text="Business Category" />
            <div className="grid grid-cols-4 gap-1.5 mb-2">
              {CATEGORIES.map((cat) => (
                <button key={cat.value} type="button"
                  onClick={() => setSelectedCategory(cat.value)}
                  className={`flex flex-col items-center justify-center gap-1 py-2 px-1 border rounded-[8px] text-center transition-all cursor-pointer
                    ${selectedCategory === cat.value
                      ? "border-[#22c55e] bg-green-50 text-[#16a34a] shadow-[0_0_0_2px_rgba(34,197,94,0.13)]"
                      : "border-slate-200 bg-white text-slate-500 hover:border-[#22c55e] hover:bg-green-50 hover:text-[#16a34a]"}`}>
                  <span className={`scale-75 ${selectedCategory === cat.value ? "text-[#22c55e]" : "text-slate-400"}`}>
                    {cat.icon}
                  </span>
                  <span className="text-[9px] font-medium leading-tight">{cat.label}</span>
                </button>
              ))}
            </div>
            {selectedCategory === "other" && (
              <div className="mb-2">
                <Field label="Custom Category">
                  <IconInput 
                    icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>}
                    type="text" placeholder="Enter your business category"
                    value={customCategory} onChange={(e) => setCustomCategory(e.target.value)} required
                  />
                </Field>
              </div>
            )}
          </div>

          {/* Business Type */}
          <div className="border-t border-slate-100 pt-2">
            <SectionLabel text="Business Type" />
            <div className="grid grid-cols-4 border border-slate-200 rounded-[8px] overflow-hidden">
              {BUSINESS_TYPES.map((type, i) => (
                <button key={type} type="button"
                  onClick={() => setSelectedType(type)}
                  className={`py-[7px] px-2 text-[10px] font-medium text-center transition-colors
                    ${i < BUSINESS_TYPES.length - 1 ? "border-r border-slate-200" : ""}
                    ${selectedType === type
                      ? "bg-white text-slate-900 font-semibold"
                      : "bg-white text-slate-500 hover:bg-slate-50"}`}>
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Location Details */}
          <div className="border-t border-slate-100 pt-2">
            <SectionLabel text="Location Details" />
            <div className="grid grid-cols-2 gap-2">
              <Field label="City">
                <IconInput icon={<LocIcon />} type="text" placeholder="Enter your city"
                  value={city} onChange={(e) => setCity(e.target.value)} required />
              </Field>
              <Field label="State">
                <IconInput icon={<LocIcon />} type="text" placeholder="Enter your state"
                  value={state} onChange={(e) => setState(e.target.value)} required />
              </Field>
            </div>
            <Field label="Country">
              <div className="flex items-center border border-slate-200 rounded-[7px] bg-white overflow-hidden focus-within:border-[#22c55e] focus-within:ring-2 focus-within:ring-[#22c55e]/10 transition-all">
                <span className="flex items-center px-2 text-slate-400 shrink-0">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                  </svg>
                </span>
                <select value={country} onChange={(e) => setCountry(e.target.value)} required
                  className="flex-1 text-[11px] text-slate-700 py-[6px] pr-8 bg-transparent outline-none appearance-none cursor-pointer min-w-0">
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

          {/* Optional Details */}
          <div className="border-t border-slate-100 pt-2 mb-2">
            <SectionLabel text="Optional Details" />
            <div className="grid grid-cols-2 gap-2">
              <Field label="GST Number" optional>
                <IconInput
                  icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>}
                  type="text" placeholder="22AAAAA0000A1Z5" maxLength={15}
                  value={gst} onChange={(e) => setGst(e.target.value)}
                />
              </Field>
              <Field label="Website URL" optional>
                <IconInput
                  icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>}
                  type="url" placeholder="https://yourwebsite.com"
                  value={website} onChange={(e) => setWebsite(e.target.value)}
                />
              </Field>
            </div>
          </div>

          {/* Buttons */}
          <div className="grid grid-cols-2 gap-2 mt-auto">
            <button type="button" onClick={onBack}
              className="py-[9px] border-[1.8px] border-slate-200 text-slate-700 font-semibold text-[12px] rounded-[8px] hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-[0.97]">
              Back
            </button>
            <button type="submit" disabled={isLoading}
              className="py-[9px] bg-[#22c55e] hover:bg-[#16a34a] text-white font-semibold text-[12px] rounded-[8px] transition-all shadow-sm hover:shadow-[0_4px_16px_rgba(34,197,94,0.3)] active:scale-[0.97] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2">
              {isLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Continue"}
            </button>
          </div>
        </form>

        <div className="px-5 py-2 bg-[#f0f2f5] text-center">
          <p className="text-[10px] text-slate-400">
            By continuing, you agree to our{" "}
            <Link to="#" className="text-slate-500 font-medium hover:underline">Terms of Service</Link>{" "}
            and{" "}
            <Link to="#" className="text-slate-500 font-medium hover:underline">Privacy Policy</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════
// STEP 3 — OTP Verification (existing logic preserved)
// ══════════════════════════════════════════════════════════════
const Step3OTP = ({ allData, onBack, onPendingApproval }) => {
  const navigate = useNavigate();
  const { loginUser } = useContext(userContext);
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    sendOtp();
  }, []);

  useEffect(() => {
    if (countdown > 0) {
      const t = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [countdown]);

  const sendOtp = async () => {
    setIsLoading(true);
    try {
      const res = await requestSignupOTP(
        allData.fullName,
        allData.email,
        allData.password,
        allData.phone || "",
        {
          businessName: allData.businessName,
          businessCategory: allData.selectedCategory,
          businessType: allData.selectedType,
          city: allData.city,
          state: allData.state,
          country: allData.country,
          gst: allData.gst,
          website: allData.website,
          referralCode: allData.referralCode,
          clientId: allData.clientId,
          trialId: allData.trialId,
        }
      );
      if (res.success) {
        toast.success("OTP sent to your email!");
        setOtpSent(true);
        setCountdown(60);
      } else {
        toast.error(res.message || "Failed to send OTP");
        setErrorMessage(res.message || "Failed to send OTP");
      }
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || "Error";
      toast.error(msg);
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");
    try {
      const res = await verifySignupOTP(allData.email, otp);
      if (res.success) {
        if (res.pendingApproval) {
          // Account created but needs admin approval
          toast.success("Account created! Awaiting admin approval.");
          onPendingApproval();
        } else {
          // Normal flow (shouldn't happen with new logic, but kept for safety)
          toast.success("Account created successfully!");
          saveAuthData(res.data);
          loginUser(res.data.user);
          navigate("/onboarding");
        }
      } else {
        toast.error(res.message || "Invalid OTP");
        setErrorMessage(res.message || "Invalid OTP. Please try again.");
      }
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || "Verification failed";
      toast.error(msg);
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    setIsLoading(true);
    try {
      const res = await resendOTP(allData.email, "signup");
      if (res.success) { toast.success("OTP resent!"); setCountdown(60); }
    } catch { toast.error("Failed to resend OTP"); }
    finally { setIsLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#f5f6fa] font-['Inter',sans-serif] flex flex-col items-center">
      <div className="w-full max-w-[430px] bg-white flex-1 min-h-screen flex flex-col px-6 pt-6 pb-6">
        <div className="flex items-center gap-2 mb-8">
          <img src={logoIcon} alt="MessBee" className="w-7 h-7 object-contain" />
          <img src={logoName} alt="MessBee" className="h-5 object-contain" />
        </div>

        <h1 className="text-[1.45rem] font-bold text-slate-900 mb-1">Verify your email</h1>
        <p className="text-[13px] text-slate-500 mb-8">
          We sent a 6-digit code to <span className="font-semibold text-slate-700">{allData.email}</span>
        </p>

        {errorMessage && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-xs font-medium p-3 rounded-xl mb-4 flex items-center gap-2">
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleVerify} className="flex flex-col gap-4">
          <div>
            <label className="block text-[13px] font-medium text-slate-700 mb-1.5">Enter OTP</label>
            <input type="text" value={otp} onChange={(e) => setOtp(e.target.value)}
              placeholder="000000" maxLength={6} pattern="[0-9]{6}" required
              className="w-full border border-slate-200 rounded-[9px] py-[13px] px-4 text-center text-[18px] font-bold tracking-[0.4em] text-slate-800 outline-none focus:border-[#22c55e] focus:ring-2 focus:ring-[#22c55e]/10 transition-all" />
          </div>

          <div className="text-center text-[12px] text-slate-500">
            {countdown > 0 ? (
              <span>Resend in <strong className="text-slate-700">{countdown}s</strong></span>
            ) : (
              <button type="button" onClick={handleResend} disabled={isLoading}
                className="text-[#22c55e] font-semibold hover:underline">
                Resend OTP
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 mt-2">
            <button type="button" onClick={onBack}
              className="py-[14px] border-[1.8px] border-slate-200 text-slate-700 font-semibold text-[14px] rounded-[10px] hover:bg-slate-50 transition-all">
              Back
            </button>
            <button type="submit" disabled={isLoading || otp.length !== 6}
              className="py-[14px] bg-[#22c55e] hover:bg-[#16a34a] text-white font-semibold text-[14px] rounded-[10px] transition-all disabled:opacity-70 flex items-center justify-center gap-2">
              {isLoading
                ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : "Verify & Create Account"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════
// STEP 4 — Pending Admin Approval
// ══════════════════════════════════════════════════════════════
const Step4PendingApproval = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f8fafc] font-['Inter',sans-serif] flex flex-col items-center justify-center p-4">
      
      {/* Brand Header Floating Outside the Card */}
      <div className="flex items-center gap-2 mb-8">
        <img src={logoIcon} alt="MessBee" className="w-8 h-8 object-contain drop-shadow-sm" />
        <img src={logoName} alt="MessBee" className="h-6 object-contain" />
      </div>

      {/* Main Card */}
      <div className="w-full max-w-[420px] bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-slate-100 p-8 flex flex-col items-center text-center">
        
        {/* Animated Clock Icon */}
        <div className="relative mb-6">
          <div className="w-20 h-20 rounded-full bg-amber-50 border-2 border-amber-200 flex items-center justify-center" style={{ animation: 'pulse 2.5s ease-in-out infinite' }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-amber-400 flex items-center justify-center shadow-md">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </div>
        </div>

        <h1 className="text-[1.4rem] font-bold text-slate-900 mb-2 leading-tight">
          Account Under Review
        </h1>

        <p className="text-[13.5px] text-slate-500 mb-6 leading-relaxed px-2">
          Your account has been created successfully. Kindly wait for our admin team to review and approve your registration.
        </p>

        {/* Progress Tracker */}
        <div className="w-full bg-slate-50 rounded-2xl p-4 mb-8 text-left border border-slate-100 space-y-3">
          {[
            { icon: "✓", text: "Email Verified", done: true },
            { icon: "✓", text: "Business Details Submitted", done: true },
            { icon: "⏳", text: "Pending Admin Approval", done: false },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 shadow-sm ${
                item.done
                  ? 'bg-green-100 text-green-600 border border-green-200/50'
                  : 'bg-amber-100 text-amber-600 border border-amber-200/50'
              }`}>
                {item.icon}
              </span>
              <span className={`text-[12.5px] font-medium ${
                item.done ? 'text-slate-700' : 'text-amber-700'
              }`}>
                {item.text}
              </span>
            </div>
          ))}
        </div>

        <button
          onClick={() => navigate('/login')}
          className="w-full py-[14px] bg-[#22c55e] hover:bg-[#16a34a] text-white font-semibold text-[14px] rounded-xl transition-all shadow-sm hover:shadow-[0_4px_16px_rgba(34,197,94,0.3)] active:scale-[0.98]"
        >
          Go to Login
        </button>
      </div>

      <p className="text-[11.5px] text-slate-400 mt-8 font-medium">
        We will notify you via email once approved.
      </p>

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.85; }
        }
      `}</style>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════
// ROOT — Registration Page (orchestrates all steps)
// ══════════════════════════════════════════════════════════════
const Registration = () => {
  const navigate = useNavigate();
  const { isLoggedIn } = useContext(userContext);
  const [step, setStep] = useState(1);
  const [step1Data, setStep1Data] = useState(null);
  const [allData, setAllData] = useState(null);
  const [isLoading] = useState(false);

  useEffect(() => {
    if (isLoggedIn) navigate("/");
  }, [isLoggedIn, navigate]);

  const handleStep1Next = (data) => {
    setStep1Data(data);
    setStep(2);
  };

  const handleStep2Submit = (bizData) => {
    setAllData({ ...step1Data, ...bizData });
    setStep(3);
  };

  if (step === 1) return <Step1 onNext={handleStep1Next} />;
  if (step === 2) return <Step2 step1Data={step1Data} onBack={() => setStep(1)} onSubmit={handleStep2Submit} isLoading={isLoading} />;
  if (step === 3) return <Step3OTP allData={allData} onBack={() => setStep(2)} onPendingApproval={() => setStep(4)} />;
  if (step === 4) return <Step4PendingApproval />;
  return null;
};

export default Registration;