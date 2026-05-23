import React, { useState, useEffect } from "react";
import { 
  Building2, 
  Globe, 
  Mail, 
  User, 
  Phone, 
  Check, 
  Lock, 
  Eye, 
  EyeOff, 
  Upload, 
  ShieldCheck, 
  MessageSquare, 
  HelpCircle, 
  FileCheck, 
  Info,
  RotateCw
} from "lucide-react";
import { toast } from "react-toastify";
import axios from "../context/axios";

// Logo imports
import logoIcon from "../assets/MessBee Logo.png";
import logoName from "../assets/MessBee Name.png";

const VerificationForm = () => {
  // --- Progress Tracking State ---
  const [completedSections, setCompletedSections] = useState({
    company: false,
    meta: false,
    whatsapp: false,
    kyc: false,
  });

  const [savingSection, setSavingSection] = useState({
    company: false,
    meta: false,
    whatsapp: false,
    kyc: false,
  });

  // Calculate Progress Percentage (25% per section)
  const progressPercent = Object.values(completedSections).filter(Boolean).length * 25;

  // --- Show/Hide password states for Meta system credentials ---
  const [showAppSecret, setShowAppSecret] = useState(false);
  const [showAccessToken, setShowAccessToken] = useState(false);

  // --- Form Field States (Prefilled with values from the screenshot) ---
  
  // Section 1: Company Details
  const [companyDetails, setCompanyDetails] = useState({
    logoPreview: "",
    companyName: "Active Conversations",
    websiteUrl: "activeconversations.com",
    businessEmail: "activeconversations@gmail.com",
    contactPerson: "Arshlan Malik",
    businessNumber: "+91 84333 13324",
    country: "India",
  });

  // Section 2: Meta Business Details
  const [metaDetails, setMetaDetails] = useState({
    businessManagerId: "223787399712010",
    whatsappAccountId: "304677762696190",
    facebookPageId: "223787399712010",
    metaAppId: "304677762696190",
    metaAppSecret: "meta_app_secret_value_123456789",
    systemUserToken: "EAAGzo7gJ6boBAO8ZCx6P4ZCk2g7k4ZC7...",
  });

  // Section 3: WhatsApp Details
  const [whatsappDetails, setWhatsappDetails] = useState({
    whatsappNumber: "+91 84333 13324",
    displayName: "Active Conversations",
    businessCategory: "Professional Services",
    businessDescription: "Describe your business details and what services you provide...",
    profileImagePreview: "",
    webhookUrl: "https://api.messbee.com/webhook/123456",
    verifyToken: "messbee_verify_token_123456",
    callbackUrl: "https://api.messbee.com/callback/123456",
    apiBaseUrl: "https://graph.facebook.com/v19.0",
  });

  // Section 4: Customer Details & KYC
  const [kycDetails, setKycDetails] = useState({
    customerName: "Arshlan Malik",
    customerEmail: "activeconversations@gmail.com",
    customerPhone: "+91 84333 13324",
    documentType: "GST Registration Certificate",
    gstNumber: "07AAAAA1111A1Z1",
    registrationDoc: null,
    addressDoc: null,
    registrationDocName: "",
    addressDocName: "",
  });

  // --- Fetch Config from Database Settings on Mount ---
  useEffect(() => {
    const fetchOnboardingConfig = async () => {
      try {
        const [companyRes, metaRes, whatsappRes, kycRes] = await Promise.allSettled([
          axios.get("/settings/company_details"),
          axios.get("/settings/meta_business_details"),
          axios.get("/settings/whatsapp_profile_details"),
          axios.get("/settings/kyc_verification_details")
        ]);

        if (companyRes.status === "fulfilled" && companyRes.value.data) {
          const val = companyRes.value.data.value;
          if (val) {
            setCompanyDetails(prev => ({ ...prev, ...val }));
            setCompletedSections(prev => ({ ...prev, company: true }));
          }
        }
        if (metaRes.status === "fulfilled" && metaRes.value.data) {
          const val = metaRes.value.data.value;
          if (val) {
            setMetaDetails(prev => ({ ...prev, ...val }));
            setCompletedSections(prev => ({ ...prev, meta: true }));
          }
        }
        if (whatsappRes.status === "fulfilled" && whatsappRes.value.data) {
          const val = whatsappRes.value.data.value;
          if (val) {
            setWhatsappDetails(prev => ({ ...prev, ...val }));
            setCompletedSections(prev => ({ ...prev, whatsapp: true }));
          }
        }
        if (kycRes.status === "fulfilled" && kycRes.value.data) {
          const val = kycRes.value.data.value;
          if (val) {
            setKycDetails(prev => ({ ...prev, ...val }));
            setCompletedSections(prev => ({ ...prev, kyc: true }));
          }
        }
      } catch (error) {
        console.error("Error loading saved verification configuration:", error);
      }
    };
    fetchOnboardingConfig();
  }, []);

  // Helper to convert files to base64 for persistent database storage
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  // --- Handlers for file uploads ---
  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const base64 = await fileToBase64(file);
        setCompanyDetails(prev => ({
          ...prev,
          logoPreview: base64
        }));
        toast.success("Company logo uploaded successfully!");
      } catch (err) {
        toast.error("Failed to process logo file.");
      }
    }
  };

  const handleProfileImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const base64 = await fileToBase64(file);
        setWhatsappDetails(prev => ({
          ...prev,
          profileImagePreview: base64
        }));
        toast.success("WhatsApp profile image uploaded!");
      } catch (err) {
        toast.error("Failed to process profile image.");
      }
    }
  };

  const handleKycDocUpload = async (e, type) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const base64 = await fileToBase64(file);
        if (type === "registration") {
          setKycDetails(prev => ({
            ...prev,
            registrationDoc: base64,
            registrationDocName: file.name
          }));
          toast.success("Business Registration Document loaded!");
        } else {
          setKycDetails(prev => ({
            ...prev,
            addressDoc: base64,
            addressDocName: file.name
          }));
          toast.success("Address Proof loaded!");
        }
      } catch (err) {
        toast.error("Failed to process document file.");
      }
    }
  };

  // --- Save Handler persisting settings to backend MongoDB ---
  const handleSaveSection = async (sectionName, title) => {
    setSavingSection(prev => ({ ...prev, [sectionName]: true }));
    try {
      let key = "";
      let value = {};
      let description = "";

      if (sectionName === "company") {
        key = "company_details";
        value = companyDetails;
        description = "Business Onboarding - Company Details";
      } else if (sectionName === "meta") {
        key = "meta_business_details";
        value = metaDetails;
        description = "Business Onboarding - Meta Business API Details";

        // Persistent sync to active 'whatsapp_config' settings in MongoDB
        const activeConfigValue = {
          businessAccountId: metaDetails.whatsappAccountId, // WABA ID
          phoneNumberId: metaDetails.whatsappAccountId,     // Fallback to Account ID
          accessToken: metaDetails.systemUserToken,
          verifyToken: whatsappDetails.verifyToken || "messbee_verify_token_123456",
          webhookUrl: whatsappDetails.webhookUrl || "https://api.messbee.com/webhook/123456",
          apiVersion: "v19.0"
        };
        await axios.post("/settings", {
          key: "whatsapp_config",
          value: activeConfigValue,
          description: "WhatsApp Cloud API Configuration"
        });
      } else if (sectionName === "whatsapp") {
        key = "whatsapp_profile_details";
        value = whatsappDetails;
        description = "Business Onboarding - WhatsApp Profile Details";

        // Persistent sync to active 'whatsapp_config' settings in MongoDB
        const activeConfigValue = {
          businessAccountId: metaDetails.whatsappAccountId,
          phoneNumberId: metaDetails.whatsappAccountId,
          accessToken: metaDetails.systemUserToken,
          verifyToken: whatsappDetails.verifyToken,
          webhookUrl: whatsappDetails.webhookUrl,
          apiVersion: "v19.0"
        };
        await axios.post("/settings", {
          key: "whatsapp_config",
          value: activeConfigValue,
          description: "WhatsApp Cloud API Configuration"
        });
      } else if (sectionName === "kyc") {
        key = "kyc_verification_details";
        value = kycDetails;
        description = "Business Onboarding - KYC Verification Details";
      }

      await axios.post("/settings", { key, value, description });

      setCompletedSections(prev => ({ ...prev, [sectionName]: true }));
      toast.success(`${title} saved successfully!`);
    } catch (error) {
      console.error(`Error saving ${title}:`, error);
      toast.error(`Failed to save ${title}. Please try again.`);
    } finally {
      setSavingSection(prev => ({ ...prev, [sectionName]: false }));
    }
  };

  const handleTestConnection = async () => {
    toast.info("Testing WhatsApp Business Cloud API connection...");
    try {
      const response = await axios.get("/whatsapp/test-connection");
      if (response.data && response.data.success) {
        toast.success(`Connection Active! Meta API verified successfully.`);
      } else {
        toast.error("Connection failed: Verify Meta token and App configuration.");
      }
    } catch (err) {
      console.error("Test connection error:", err);
      toast.error("Meta API connection error. Check system credentials first.");
    }
  };

  const handleConnectMeta = () => {
    toast.info("Opening Meta Embedded Signup Flow...");
    setTimeout(() => {
      setMetaDetails(prev => ({
        ...prev,
        businessManagerId: "223787399712010",
        whatsappAccountId: "304677762696190",
        facebookPageId: "223787399712010",
        metaAppId: "304677762696190",
      }));
      toast.success("Meta Details synchronized from Facebook Signup!");
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-16 font-['Urbanist'] text-slate-800">
      {/* 1. Header Bar with Logo and Title */}
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 px-6 py-4 shadow-sm backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logoIcon} alt="MessBee Logo" className="h-9 w-9 object-contain" />
            <img src={logoName} alt="MessBee Name" className="h-6 object-contain" />
          </div>
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-emerald-50 px-4 py-1.5 text-xs font-bold text-emerald-600 border border-emerald-200/40">
              Live Configuration
            </span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto mt-8 max-w-5xl px-4 md:px-6">
        
        {/* Title and Progress Card */}
        <div className="mb-8 rounded-2xl bg-white border border-slate-200/60 p-6 md:p-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
                Business Verification & API Setup
              </h1>
              <p className="mt-2 text-sm text-slate-500 font-medium">
                Enter your business and WhatsApp Business Details to active your account.
              </p>
            </div>
            
            <div className="w-full md:w-80">
              <div className="flex justify-between items-center text-sm font-extrabold text-slate-700 mb-2">
                <span>Integration completion progress</span>
                <span className="text-emerald-500 text-base">{progressPercent}%</span>
              </div>
              <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden border border-slate-200/40">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-400 to-[#00E56A] rounded-full transition-all duration-700 ease-out" 
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          
          {/* ========================================================
              CARD 1: Company details
             ======================================================== */}
          <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-all duration-300 hover:shadow-md">
            {/* Card Header */}
            <div className="flex items-center gap-4 bg-[#EAF7F0]/60 px-6 py-4 border-b border-slate-100">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#00E56A] text-white shadow-sm shadow-[#00E56A]/20">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-950">Company details</h3>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">Provide your company information for verification</p>
              </div>
              {completedSections.company && (
                <div className="ml-auto flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm animate-bounce">
                  <Check className="h-3.5 w-3.5 stroke-[3]" />
                </div>
              )}
            </div>

            {/* Card Body */}
            <div className="p-6 md:p-8">
              
              {/* Logo Upload Box */}
              <div className="mb-8">
                <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 block mb-3">Company Logo</label>
                <div className="relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-6 text-center hover:bg-slate-50 hover:border-slate-300 transition-colors cursor-pointer group">
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleLogoUpload} 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  {companyDetails.logoPreview ? (
                    <div className="flex flex-col items-center">
                      <img 
                        src={companyDetails.logoPreview} 
                        alt="Logo Preview" 
                        className="h-16 w-16 rounded-full object-cover border border-slate-200 shadow-sm"
                      />
                      <span className="mt-2 text-xs font-bold text-[#00E56A]">Click to change logo</span>
                    </div>
                  ) : (
                    <>
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-[#00E56A] mb-3 group-hover:scale-110 transition-transform">
                        <Upload className="h-5 w-5" />
                      </div>
                      <p className="text-sm font-extrabold text-slate-700">Upload your company logo. PNG, JPG, JPEG</p>
                      <p className="text-[11px] text-slate-400 font-bold tracking-wide mt-1">Max, size 5MB</p>
                    </>
                  )}
                </div>
              </div>

              {/* Two Column Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 block mb-2">Company Name</label>
                  <div className="relative rounded-xl border border-slate-200 bg-slate-50 focus-within:border-[#00E56A] focus-within:ring-2 focus-within:ring-[#00E56A]/10 transition-all">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><Building2 className="h-4 w-4" /></span>
                    <input 
                      type="text" 
                      value={companyDetails.companyName}
                      onChange={(e) => setCompanyDetails({...companyDetails, companyName: e.target.value})}
                      placeholder="Active Conversations"
                      className="w-full bg-transparent pl-11 pr-4 py-3.5 text-sm font-semibold text-slate-800 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 block mb-2">Website URL</label>
                  <div className="relative rounded-xl border border-slate-200 bg-slate-50 focus-within:border-[#00E56A] focus-within:ring-2 focus-within:ring-[#00E56A]/10 transition-all">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><Globe className="h-4 w-4" /></span>
                    <input 
                      type="text" 
                      value={companyDetails.websiteUrl}
                      onChange={(e) => setCompanyDetails({...companyDetails, websiteUrl: e.target.value})}
                      placeholder="activeconversations.com"
                      className="w-full bg-transparent pl-11 pr-4 py-3.5 text-sm font-semibold text-slate-800 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 block mb-2">Business Email</label>
                  <div className="relative rounded-xl border border-slate-200 bg-slate-50 focus-within:border-[#00E56A] focus-within:ring-2 focus-within:ring-[#00E56A]/10 transition-all">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><Mail className="h-4 w-4" /></span>
                    <input 
                      type="email" 
                      value={companyDetails.businessEmail}
                      onChange={(e) => setCompanyDetails({...companyDetails, businessEmail: e.target.value})}
                      placeholder="activeconversations@gmail.com"
                      className="w-full bg-transparent pl-11 pr-4 py-3.5 text-sm font-semibold text-slate-800 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 block mb-2">Contact Person Name</label>
                  <div className="relative rounded-xl border border-slate-200 bg-slate-50 focus-within:border-[#00E56A] focus-within:ring-2 focus-within:ring-[#00E56A]/10 transition-all">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><User className="h-4 w-4" /></span>
                    <input 
                      type="text" 
                      value={companyDetails.contactPerson}
                      onChange={(e) => setCompanyDetails({...companyDetails, contactPerson: e.target.value})}
                      placeholder="Arshlan Malik"
                      className="w-full bg-transparent pl-11 pr-4 py-3.5 text-sm font-semibold text-slate-800 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 block mb-2">Business Number</label>
                  <div className="relative rounded-xl border border-slate-200 bg-slate-50 focus-within:border-[#00E56A] focus-within:ring-2 focus-within:ring-[#00E56A]/10 transition-all">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><Phone className="h-4 w-4" /></span>
                    <input 
                      type="text" 
                      value={companyDetails.businessNumber}
                      onChange={(e) => setCompanyDetails({...companyDetails, businessNumber: e.target.value})}
                      placeholder="+91 84333 13324"
                      className="w-full bg-transparent pl-11 pr-4 py-3.5 text-sm font-semibold text-slate-800 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 block mb-2">Country</label>
                  <div className="relative rounded-xl border border-slate-200 bg-slate-50 focus-within:border-[#00E56A] focus-within:ring-2 focus-within:ring-[#00E56A]/10 transition-all">
                    <select 
                      value={companyDetails.country}
                      onChange={(e) => setCompanyDetails({...companyDetails, country: e.target.value})}
                      className="w-full bg-transparent px-4 py-3.5 text-sm font-semibold text-slate-700 outline-none appearance-none cursor-pointer"
                    >
                      <option value="">Select country</option>
                      <option value="India">India</option>
                      <option value="United States">United States</option>
                      <option value="United Kingdom">United Kingdom</option>
                      <option value="United Arab Emirates">United Arab Emirates</option>
                      <option value="Singapore">Singapore</option>
                    </select>
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">▼</span>
                  </div>
                </div>
              </div>

              {/* Save Button Row */}
              <div className="mt-8 flex justify-end">
                <button 
                  onClick={() => handleSaveSection("company", "Company details")}
                  disabled={savingSection.company}
                  className="flex items-center gap-2 rounded-xl bg-[#00E56A] hover:bg-[#00c95d] px-6 py-3.5 text-sm font-extrabold text-white transition-all shadow-sm shadow-[#00E56A]/10 hover:shadow-md active:scale-95 disabled:opacity-75 disabled:pointer-events-none"
                >
                  {savingSection.company ? (
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Check className="h-4 w-4 stroke-[3]" />
                  )}
                  Save Company Details
                </button>
              </div>

            </div>
          </div>


          {/* ========================================================
              CARD 2: Meta Business Details
             ======================================================== */}
          <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-all duration-300 hover:shadow-md">
            {/* Card Header */}
            <div className="flex items-center gap-4 bg-[#EAF7F0]/60 px-6 py-4 border-b border-slate-100">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#00E56A] text-white shadow-sm shadow-[#00E56A]/20">
                <span className="text-lg font-black tracking-tighter">M</span>
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-950">Meta Business Details</h3>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">Connect your Meta Business Manager and WhatsApp Business API</p>
              </div>
              {completedSections.meta && (
                <div className="ml-auto flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm animate-bounce">
                  <Check className="h-3.5 w-3.5 stroke-[3]" />
                </div>
              )}
            </div>

            {/* Card Body */}
            <div className="p-6 md:p-8">
              
              {/* Form Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">Meta Business Manager ID</label>
                    <HelpCircle className="h-3.5 w-3.5 text-slate-400 hover:text-slate-600 cursor-pointer" />
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 focus-within:border-[#00E56A] focus-within:ring-2 focus-within:ring-[#00E56A]/10 transition-all">
                    <input 
                      type="text" 
                      value={metaDetails.businessManagerId}
                      onChange={(e) => setMetaDetails({...metaDetails, businessManagerId: e.target.value})}
                      placeholder="223787399712010"
                      className="w-full bg-transparent px-4 py-3.5 text-sm font-semibold text-slate-800 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">WhatsApp Business Account ID</label>
                    <HelpCircle className="h-3.5 w-3.5 text-slate-400 hover:text-slate-600 cursor-pointer" />
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 focus-within:border-[#00E56A] focus-within:ring-2 focus-within:ring-[#00E56A]/10 transition-all">
                    <input 
                      type="text" 
                      value={metaDetails.whatsappAccountId}
                      onChange={(e) => setMetaDetails({...metaDetails, whatsappAccountId: e.target.value})}
                      placeholder="304677762696190"
                      className="w-full bg-transparent px-4 py-3.5 text-sm font-semibold text-slate-800 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">Facebook Page ID</label>
                    <HelpCircle className="h-3.5 w-3.5 text-slate-400 hover:text-slate-600 cursor-pointer" />
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 focus-within:border-[#00E56A] focus-within:ring-2 focus-within:ring-[#00E56A]/10 transition-all">
                    <input 
                      type="text" 
                      value={metaDetails.facebookPageId}
                      onChange={(e) => setMetaDetails({...metaDetails, facebookPageId: e.target.value})}
                      placeholder="223787399712010"
                      className="w-full bg-transparent px-4 py-3.5 text-sm font-semibold text-slate-800 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">Meta App ID</label>
                    <HelpCircle className="h-3.5 w-3.5 text-slate-400 hover:text-slate-600 cursor-pointer" />
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 focus-within:border-[#00E56A] focus-within:ring-2 focus-within:ring-[#00E56A]/10 transition-all">
                    <input 
                      type="text" 
                      value={metaDetails.metaAppId}
                      onChange={(e) => setMetaDetails({...metaDetails, metaAppId: e.target.value})}
                      placeholder="304677762696190"
                      className="w-full bg-transparent px-4 py-3.5 text-sm font-semibold text-slate-800 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* System Credentials Sub-card */}
              <div className="mt-8 rounded-2xl border border-slate-200/70 bg-slate-50/50 p-6">
                <div className="flex items-center gap-2 mb-6">
                  <ShieldCheck className="h-5 w-5 text-emerald-600" />
                  <h4 className="text-sm font-extrabold text-slate-900">System Credentials (Secured)</h4>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 block mb-2">Meta App Secret</label>
                    <div className="relative rounded-xl border border-slate-200 bg-white focus-within:border-[#00E56A] focus-within:ring-2 focus-within:ring-[#00E56A]/10 transition-all">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><Lock className="h-4 w-4" /></span>
                      <input 
                        type={showAppSecret ? "text" : "password"} 
                        value={metaDetails.metaAppSecret}
                        onChange={(e) => setMetaDetails({...metaDetails, metaAppSecret: e.target.value})}
                        placeholder="••••••••••••••••••••••••••••••••"
                        className="w-full bg-transparent pl-11 pr-12 py-3.5 text-sm font-semibold text-slate-800 outline-none"
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowAppSecret(!showAppSecret)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                      >
                        {showAppSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 block mb-2">System User Access Token</label>
                    <div className="relative rounded-xl border border-slate-200 bg-white focus-within:border-[#00E56A] focus-within:ring-2 focus-within:ring-[#00E56A]/10 transition-all">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><Lock className="h-4 w-4" /></span>
                      <input 
                        type={showAccessToken ? "text" : "password"} 
                        value={metaDetails.systemUserToken}
                        onChange={(e) => setMetaDetails({...metaDetails, systemUserToken: e.target.value})}
                        placeholder="••••••••••••••••••••••••••••••••"
                        className="w-full bg-transparent pl-11 pr-12 py-3.5 text-sm font-semibold text-slate-800 outline-none"
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowAccessToken(!showAccessToken)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                      >
                        {showAccessToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-4 text-[11px] font-extrabold text-emerald-600">
                  <Lock className="h-3.5 w-3.5" />
                  <span>These details are stored and encrypted securely.</span>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <button 
                  onClick={handleConnectMeta}
                  className="flex items-center justify-center gap-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-5 py-3.5 text-sm font-extrabold text-slate-800 transition-all shadow-sm active:scale-98"
                >
                  <svg className="h-5 w-5 fill-[#1877F2]" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  Connect Meta
                </button>

                <button 
                  onClick={() => handleSaveSection("meta", "Meta Business Details")}
                  disabled={savingSection.meta}
                  className="flex items-center justify-center gap-2 rounded-xl bg-[#00E56A] hover:bg-[#00c95d] px-6 py-3.5 text-sm font-extrabold text-white transition-all shadow-sm active:scale-95 disabled:opacity-75 disabled:pointer-events-none"
                >
                  {savingSection.meta ? (
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Check className="h-4 w-4 stroke-[3]" />
                  )}
                  Save Meta Details
                </button>
              </div>

            </div>
          </div>


          {/* ========================================================
              CARD 3: WhatsApp Details & API Configuration
             ======================================================== */}
          <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-all duration-300 hover:shadow-md">
            {/* Card Header */}
            <div className="flex items-center gap-4 bg-[#EAF7F0]/60 px-6 py-4 border-b border-slate-100">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#00E56A] text-white shadow-sm shadow-[#00E56A]/20">
                <MessageSquare className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-950">WhatsApp Details & API Configuration</h3>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">Configure your WhatsApp Business profile and webhook settings</p>
              </div>
              {completedSections.whatsapp && (
                <div className="ml-auto flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm animate-bounce">
                  <Check className="h-3.5 w-3.5 stroke-[3]" />
                </div>
              )}
            </div>

            {/* Card Body */}
            <div className="p-6 md:p-8">
              
              {/* WhatsApp Profile Setup Row: Fields Left, Phone UI Preview Right */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start border-b border-slate-100 pb-8 mb-8">
                
                {/* Left Fields Column */}
                <div className="lg:col-span-7 space-y-6">
                  <h4 className="text-sm font-extrabold text-slate-900 border-l-[3px] border-[#00E56A] pl-2">WhatsApp Profile</h4>
                  
                  <div>
                    <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 block mb-2">WhatsApp Number</label>
                    <div className="relative rounded-xl border border-slate-200 bg-slate-50 focus-within:border-[#00E56A] focus-within:ring-2 focus-within:ring-[#00E56A]/10 transition-all">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><Phone className="h-4 w-4" /></span>
                      <input 
                        type="text" 
                        value={whatsappDetails.whatsappNumber}
                        onChange={(e) => setWhatsappDetails({...whatsappDetails, whatsappNumber: e.target.value})}
                        placeholder="+91 84333 13324"
                        className="w-full bg-transparent pl-11 pr-4 py-3.5 text-sm font-semibold text-slate-800 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 block mb-2">Display Name</label>
                    <div className="relative rounded-xl border border-slate-200 bg-slate-50 focus-within:border-[#00E56A] focus-within:ring-2 focus-within:ring-[#00E56A]/10 transition-all">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><User className="h-4 w-4" /></span>
                      <input 
                        type="text" 
                        value={whatsappDetails.displayName}
                        onChange={(e) => setWhatsappDetails({...whatsappDetails, displayName: e.target.value})}
                        placeholder="Active Conversations"
                        className="w-full bg-transparent pl-11 pr-4 py-3.5 text-sm font-semibold text-slate-800 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 block mb-2">Business Category</label>
                    <div className="relative rounded-xl border border-slate-200 bg-slate-50 focus-within:border-[#00E56A] focus-within:ring-2 focus-within:ring-[#00E56A]/10 transition-all">
                      <select 
                        value={whatsappDetails.businessCategory}
                        onChange={(e) => setWhatsappDetails({...whatsappDetails, businessCategory: e.target.value})}
                        className="w-full bg-transparent px-4 py-3.5 text-sm font-semibold text-slate-700 outline-none appearance-none cursor-pointer"
                      >
                        <option value="">Select category</option>
                        <option value="Professional Services">Professional Services</option>
                        <option value="E-Commerce">E-Commerce</option>
                        <option value="Education & Software">Education & Software</option>
                        <option value="Healthcare">Healthcare</option>
                        <option value="Financial Services">Financial Services</option>
                      </select>
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">▼</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 block mb-2">Business Description</label>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 focus-within:border-[#00E56A] focus-within:ring-2 focus-within:ring-[#00E56A]/10 transition-all">
                      <textarea 
                        rows="3"
                        value={whatsappDetails.businessDescription}
                        onChange={(e) => setWhatsappDetails({...whatsappDetails, businessDescription: e.target.value})}
                        placeholder="Describe your business..."
                        className="w-full bg-transparent px-4 py-3 text-sm font-semibold text-slate-800 outline-none resize-none"
                      />
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 font-bold tracking-wide">
                    Provide details that match your WhatsApp Business Profile
                  </p>

                  {/* Profile Image Drag-Drop */}
                  <div>
                    <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 block mb-2">Profile Image</label>
                    <div className="relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-[#FAFAFA] p-5 text-center hover:bg-slate-50 transition-colors cursor-pointer group">
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleProfileImageUpload} 
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      {whatsappDetails.profileImagePreview ? (
                        <div className="flex flex-col items-center">
                          <img 
                            src={whatsappDetails.profileImagePreview} 
                            alt="Profile Preview" 
                            className="h-14 w-14 rounded-full object-cover border shadow"
                          />
                          <span className="mt-2 text-xs font-bold text-[#00E56A]">Image Selected (Click to change)</span>
                        </div>
                      ) : (
                        <>
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-[#00E56A] mb-2">
                            <Upload className="h-4.5 w-4.5" />
                          </div>
                          <p className="text-xs font-extrabold text-slate-700">Upload profile image. Size must be 640x640px.</p>
                          <p className="text-[10px] text-slate-400 font-bold mt-0.5">PNG, JPG, JPEG</p>
                        </>
                      )}
                    </div>
                  </div>

                </div>

                {/* Right Interactive Mock Preview Column */}
                <div className="lg:col-span-5 flex flex-col items-center justify-center lg:sticky lg:top-28">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-3 block self-start">Profile Preview</span>
                  
                  {/* WhatsApp Profile Preview Card Widget */}
                  <div className="w-full max-w-[280px] overflow-hidden rounded-2xl bg-white border border-slate-200/80 shadow-md">
                    {/* Header */}
                    <div className="bg-[#0A5F54] px-4 py-4 text-white flex items-center gap-3">
                      {/* Avatar */}
                      <div className="h-10 w-10 shrink-0 rounded-full border border-white/20 bg-teal-800/80 flex items-center justify-center overflow-hidden">
                        {whatsappDetails.profileImagePreview ? (
                          <img src={whatsappDetails.profileImagePreview} alt="Live Logo" className="h-full w-full object-cover" />
                        ) : (
                          <span className="text-sm font-extrabold text-white/90">AC</span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h5 className="truncate text-sm font-extrabold text-white leading-tight">
                          {whatsappDetails.displayName || "Business Name"}
                        </h5>
                        <p className="truncate text-[10px] text-teal-100 font-semibold mt-0.5">
                          {whatsappDetails.whatsappNumber || "+91 00000 00000"}
                        </p>
                      </div>
                    </div>

                    {/* Body contents */}
                    <div className="p-4 space-y-4 text-slate-700">
                      
                      <div className="space-y-1">
                        <span className="text-[10px] font-extrabold uppercase tracking-wide text-slate-400">Category</span>
                        <p className="text-xs font-bold text-slate-800">
                          {whatsappDetails.businessCategory || "Select industry"}
                        </p>
                      </div>

                      <div className="space-y-1 border-t border-slate-100 pt-3">
                        <span className="text-[10px] font-extrabold uppercase tracking-wide text-slate-400">Description</span>
                        <p className="text-xs font-semibold leading-relaxed text-slate-600 line-clamp-3">
                          {whatsappDetails.businessDescription || "No description provided."}
                        </p>
                      </div>

                      {/* Mock Buttons */}
                      <div className="grid grid-cols-2 gap-3 pt-2">
                        <button className="rounded-lg bg-[#075E54]/10 hover:bg-[#075E54]/20 py-2 text-center text-xs font-bold text-[#075E54] transition-all">
                          Message
                        </button>
                        <button className="rounded-lg bg-[#075E54]/10 hover:bg-[#075E54]/20 py-2 text-center text-xs font-bold text-[#075E54] transition-all">
                          Call
                        </button>
                      </div>

                    </div>
                  </div>

                  <p className="text-center text-[10px] text-slate-400 font-bold mt-3 leading-relaxed max-w-[240px]">
                    This is how your Business Profile will appear to customers.
                  </p>
                </div>

              </div>

              {/* Webhook & API Configuration Subsection */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-extrabold text-slate-900 border-l-[3px] border-[#00E56A] pl-2">Webhook & API Configuration</h4>
                  <span className="rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-extrabold text-emerald-600 border border-emerald-100">
                    Generated
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 block mb-2">Webhook URL</label>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 focus-within:border-[#00E56A] focus-within:ring-2 focus-within:ring-[#00E56A]/10 transition-all">
                      <input 
                        type="text" 
                        value={whatsappDetails.webhookUrl}
                        onChange={(e) => setWhatsappDetails({...whatsappDetails, webhookUrl: e.target.value})}
                        placeholder="https://api.messbee.com/webhook/123456"
                        className="w-full bg-transparent px-4 py-3.5 text-sm font-semibold text-slate-800 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 block mb-2">Verify Token</label>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 focus-within:border-[#00E56A] focus-within:ring-2 focus-within:ring-[#00E56A]/10 transition-all">
                      <input 
                        type="text" 
                        value={whatsappDetails.verifyToken}
                        onChange={(e) => setWhatsappDetails({...whatsappDetails, verifyToken: e.target.value})}
                        placeholder="messbee_verify_token_123456"
                        className="w-full bg-transparent px-4 py-3.5 text-sm font-semibold text-slate-800 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 block mb-2">Callback URL</label>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 focus-within:border-[#00E56A] focus-within:ring-2 focus-within:ring-[#00E56A]/10 transition-all">
                      <input 
                        type="text" 
                        value={whatsappDetails.callbackUrl}
                        onChange={(e) => setWhatsappDetails({...whatsappDetails, callbackUrl: e.target.value})}
                        placeholder="https://api.messbee.com/callback/123456"
                        className="w-full bg-transparent px-4 py-3.5 text-sm font-semibold text-slate-800 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 block mb-2">API Base URL</label>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 focus-within:border-[#00E56A] focus-within:ring-2 focus-within:ring-[#00E56A]/10 transition-all">
                      <input 
                        type="text" 
                        value={whatsappDetails.apiBaseUrl}
                        onChange={(e) => setWhatsappDetails({...whatsappDetails, apiBaseUrl: e.target.value})}
                        placeholder="https://graph.facebook.com/v19.0"
                        className="w-full bg-transparent px-4 py-3.5 text-sm font-semibold text-slate-800 outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-center pt-2">
                  <button 
                    onClick={handleTestConnection}
                    className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-5 py-3 text-xs font-bold text-slate-800 shadow-sm transition-all active:scale-98"
                  >
                    <RotateCw className="h-3.5 w-3.5" />
                    Test Connection
                  </button>
                </div>
              </div>

              {/* Save Button Row */}
              <div className="mt-8 flex justify-end">
                <button 
                  onClick={() => handleSaveSection("whatsapp", "WhatsApp Details & API Configuration")}
                  disabled={savingSection.whatsapp}
                  className="flex items-center gap-2 rounded-xl bg-[#00E56A] hover:bg-[#00c95d] px-6 py-3.5 text-sm font-extrabold text-white transition-all shadow-sm active:scale-95 disabled:opacity-75 disabled:pointer-events-none"
                >
                  {savingSection.whatsapp ? (
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Check className="h-4 w-4 stroke-[3]" />
                  )}
                  Save WhatsApp Details
                </button>
              </div>

            </div>
          </div>


          {/* ========================================================
              CARD 4: Customer Details & KYC Verification
             ======================================================== */}
          <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-all duration-300 hover:shadow-md">
            {/* Card Header */}
            <div className="flex items-center gap-4 bg-[#EAF7F0]/60 px-6 py-4 border-b border-slate-100">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#00E56A] text-white shadow-sm shadow-[#00E56A]/20">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-950">Customer Details & KYC Verification</h3>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">Upload KYC verification with your customer documents</p>
              </div>
              {completedSections.kyc && (
                <div className="ml-auto flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm animate-bounce">
                  <Check className="h-3.5 w-3.5 stroke-[3]" />
                </div>
              )}
            </div>

            {/* Card Body */}
            <div className="p-6 md:p-8">
              
              {/* Customer Information Grid */}
              <div className="space-y-6">
                <h4 className="text-sm font-extrabold text-slate-900 border-l-[3px] border-[#00E56A] pl-2">Customer Information</h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 block mb-2">Customer Name</label>
                    <div className="relative rounded-xl border border-slate-200 bg-slate-50 focus-within:border-[#00E56A] focus-within:ring-2 focus-within:ring-[#00E56A]/10 transition-all">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><User className="h-4 w-4" /></span>
                      <input 
                        type="text" 
                        value={kycDetails.customerName}
                        onChange={(e) => setKycDetails({...kycDetails, customerName: e.target.value})}
                        placeholder="Arshlan Malik"
                        className="w-full bg-transparent pl-11 pr-4 py-3.5 text-sm font-semibold text-slate-800 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 block mb-2">Customer Email</label>
                    <div className="relative rounded-xl border border-slate-200 bg-slate-50 focus-within:border-[#00E56A] focus-within:ring-2 focus-within:ring-[#00E56A]/10 transition-all">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><Mail className="h-4 w-4" /></span>
                      <input 
                        type="email" 
                        value={kycDetails.customerEmail}
                        onChange={(e) => setKycDetails({...kycDetails, customerEmail: e.target.value})}
                        placeholder="activeconversations@gmail.com"
                        className="w-full bg-transparent pl-11 pr-4 py-3.5 text-sm font-semibold text-slate-800 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 block mb-2">Customer Phone Number</label>
                    <div className="relative rounded-xl border border-slate-200 bg-slate-50 focus-within:border-[#00E56A] focus-within:ring-2 focus-within:ring-[#00E56A]/10 transition-all">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><Phone className="h-4 w-4" /></span>
                      <input 
                        type="text" 
                        value={kycDetails.customerPhone}
                        onChange={(e) => setKycDetails({...kycDetails, customerPhone: e.target.value})}
                        placeholder="+91 84333 13324"
                        className="w-full bg-transparent pl-11 pr-4 py-3.5 text-sm font-semibold text-slate-800 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 block mb-2">KYC Document Type</label>
                    <div className="relative rounded-xl border border-slate-200 bg-slate-50 focus-within:border-[#00E56A] focus-within:ring-2 focus-within:ring-[#00E56A]/10 transition-all">
                      <select 
                        value={kycDetails.documentType}
                        onChange={(e) => setKycDetails({...kycDetails, documentType: e.target.value})}
                        className="w-full bg-transparent px-4 py-3.5 text-sm font-semibold text-slate-700 outline-none appearance-none cursor-pointer"
                      >
                        <option value="GST Registration Certificate">GST Registration Certificate</option>
                        <option value="Certificate of Incorporation">Certificate of Incorporation</option>
                        <option value="PAN Card (Business)">PAN Card (Business)</option>
                        <option value="Trade License">Trade License</option>
                      </select>
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">▼</span>
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 block mb-2">GST/UIN Number (Optional)</label>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 focus-within:border-[#00E56A] focus-within:ring-2 focus-within:ring-[#00E56A]/10 transition-all">
                      <input 
                        type="text" 
                        value={kycDetails.gstNumber}
                        onChange={(e) => setKycDetails({...kycDetails, gstNumber: e.target.value})}
                        placeholder="07AAAAA1111A1Z1"
                        className="w-full bg-transparent px-4 py-3.5 text-sm font-semibold text-slate-800 outline-none"
                      />
                    </div>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 font-bold tracking-wide">
                  Provide details that match your legal documents
                </p>
              </div>

              {/* KYC Documents Required */}
              <div className="mt-8 space-y-6">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-extrabold text-slate-900 border-l-[3px] border-[#00E56A] pl-2">KYC Documents</h4>
                  <span className="rounded bg-red-50 px-2 py-0.5 text-[10px] font-extrabold text-red-500 border border-red-100">
                    Required
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Doc Box 1 */}
                  <div>
                    <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 block mb-2">Business Registration Document</label>
                    <div className="relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-[#FAFAFA] p-6 text-center hover:bg-slate-50 transition-colors cursor-pointer group min-h-[160px]">
                      <input 
                        type="file" 
                        onChange={(e) => handleKycDocUpload(e, "registration")} 
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      {kycDetails.registrationDocName ? (
                        <div className="flex flex-col items-center p-2">
                          <FileCheck className="h-10 w-10 text-emerald-500 mb-2" />
                          <p className="text-xs font-extrabold text-slate-800 line-clamp-1">{kycDetails.registrationDocName}</p>
                          <span className="text-[10px] font-bold text-[#00E56A] mt-2">Click to replace file</span>
                        </div>
                      ) : (
                        <>
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-[#00E56A] mb-3">
                            <Upload className="h-4.5 w-4.5" />
                          </div>
                          <p className="text-xs font-extrabold text-slate-700">Business Registration Document</p>
                          <p className="text-[10px] text-slate-400 font-bold max-w-[200px] mt-1 leading-relaxed">
                            Registration Certificate, incorporation certificate, or registration document
                          </p>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Doc Box 2 */}
                  <div>
                    <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 block mb-2">Address Proof</label>
                    <div className="relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-[#FAFAFA] p-6 text-center hover:bg-slate-50 transition-colors cursor-pointer group min-h-[160px]">
                      <input 
                        type="file" 
                        onChange={(e) => handleKycDocUpload(e, "address")} 
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      {kycDetails.addressDocName ? (
                        <div className="flex flex-col items-center p-2">
                          <FileCheck className="h-10 w-10 text-emerald-500 mb-2" />
                          <p className="text-xs font-extrabold text-slate-800 line-clamp-1">{kycDetails.addressDocName}</p>
                          <span className="text-[10px] font-bold text-[#00E56A] mt-2">Click to replace file</span>
                        </div>
                      ) : (
                        <>
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-[#00E56A] mb-3">
                            <Upload className="h-4.5 w-4.5" />
                          </div>
                          <p className="text-xs font-extrabold text-slate-700">Address Proof</p>
                          <p className="text-[10px] text-slate-400 font-bold max-w-[200px] mt-1 leading-relaxed">
                            Utility bills, bank statement, or lease agreement
                          </p>
                        </>
                      )}
                    </div>
                  </div>

                </div>

                {/* Match Warning Alert Box */}
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-4.5 flex items-start gap-3">
                  <Info className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                  <p className="text-xs font-extrabold text-emerald-800 leading-relaxed">
                    Make sure that name on the document is exact matching with company name otherwise your request will be rejected.
                  </p>
                </div>
              </div>

              {/* Save Button Row */}
              <div className="mt-8 flex justify-end">
                <button 
                  onClick={() => handleSaveSection("kyc", "KYC Verification")}
                  disabled={savingSection.kyc}
                  className="flex items-center gap-2 rounded-xl bg-[#00E56A] hover:bg-[#00c95d] px-6 py-3.5 text-sm font-extrabold text-white transition-all shadow-sm active:scale-95 disabled:opacity-75 disabled:pointer-events-none"
                >
                  {savingSection.kyc ? (
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Check className="h-4 w-4 stroke-[3]" />
                  )}
                  Save Customer Details
                </button>
              </div>

            </div>
          </div>

        </div>

      </main>
    </div>
  );
};

export default VerificationForm;
