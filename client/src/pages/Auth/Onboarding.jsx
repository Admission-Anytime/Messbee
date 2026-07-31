import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import logoIcon from "../../assets/MessBee Logo.png";
import logoName from "../../assets/MessBee Name.png";
import ConnectWhatsAppModal from "../../components/Modol/ConnectWhatsAppModal";

// ── Icons & Options ──
const LocIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
  </svg>
);

const SectionLabel = ({ icon, text }) => (
  <div className="flex items-center gap-2 mb-3 mt-4">
    {icon ? (
      <span className="text-slate-400">{icon}</span>
    ) : (
      <span className="w-[3px] h-[14px] bg-[#00E56A] rounded-full shrink-0" />
    )}
    <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">
      {text}
    </span>
  </div>
);

const GlobeIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
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
const COUNTRIES = ["India", "United States", "United Kingdom", "Australia", "Canada", "Singapore", "UAE", "Germany", "France", "Japan"];


const Onboarding = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  
  // -- Form State --
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedType, setSelectedType] = useState("Individual");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("");

  // --- Reusable Icons ---
  const CheckIcon = ({ className = "w-3.5 h-3.5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
    </svg>
  );

  // ==========================================
  // STEP 1: PROFILE SETUP
  // ==========================================
  if (step === 1) {
    return (
      <div className="min-h-screen bg-[#F1F5F9] font-['Poppins'] flex items-center justify-center p-6">
        <div className="max-w-[900px] w-full bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row overflow-hidden">
          
          {/* Left Form Area */}
          <div className="w-full md:w-[55%] p-8 md:p-12">
            <div className="flex items-center gap-2 mb-6">
              <img src={logoIcon} alt="MessBee Logo" className="w-8 h-8 object-contain" />
              <h1 className="text-2xl font-extrabold text-slate-900">Welcome, Arshlan!</h1>
            </div>
            <p className="text-sm text-slate-500 mb-8 leading-relaxed">
              Let's personalize your workspace to get you started with MessBee WhatsApp API.
            </p>

            {/* Stepper Tabs */}
            <div className="flex gap-6 border-b border-slate-100 mb-10 text-xs font-bold uppercase tracking-wider">
              <div className="pb-3 border-b-2 border-[#00E56A] text-slate-900">1. Profile Setup</div>
              <div className="pb-3 text-slate-300">2. Connect API</div>
              <div className="pb-3 text-slate-300">3. First Campaign</div>
            </div>

            {/* Upload Area */}
            <div className="flex flex-col items-center mb-8 text-center">
              <div className="relative w-24 h-24 rounded-full border-2 border-dashed border-slate-200 bg-slate-50 flex items-center justify-center mb-4">
                {/* User Avatar Placeholder */}
                <svg className="w-10 h-10 text-slate-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
                {/* Camera Badge */}
                <div className="absolute bottom-0 right-0 w-8 h-8 bg-[#00E56A] rounded-full flex items-center justify-center text-white border-[3px] border-white shadow-sm cursor-pointer hover:bg-[#00c95d] transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                </div>
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">Profile Picture</h3>
              <p className="text-[11px] text-slate-400 mb-4">Upload a photo for your workspace. PNG or JPG, max 5MB.</p>
              <button className="px-5 py-2 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl transition-colors">
                Upload Image
              </button>
            </div>

            {/* Business Category - SVG Grid */}
            <div className="mb-6">
              <SectionLabel text="Business Category" />
              <div className="grid grid-cols-4 gap-2">
                {CATEGORIES.map((cat) => (
                  <button key={cat.value} type="button"
                    onClick={() => setSelectedCategory(cat.value)}
                    className={`flex flex-col items-center justify-center gap-2 py-3 px-1 border rounded-[10px] text-center transition-all cursor-pointer
                      ${selectedCategory === cat.value
                        ? "border-[#00E56A] bg-[#00E56A]/10 text-[#00c95d] shadow-[0_0_0_3px_rgba(0,229,106,0.13)]"
                        : "border-slate-200 bg-white text-slate-500 hover:border-[#00E56A] hover:bg-[#00E56A]/5 hover:text-[#00c95d]"}`}>
                    <span className={selectedCategory === cat.value ? "text-[#00E56A]" : "text-slate-400"}>
                      {cat.icon}
                    </span>
                    <span className="text-[10px] font-medium leading-tight">{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Business Type */}
            <div className="mb-6">
              <SectionLabel text="Business Type" />
              <div className="grid grid-cols-4 border border-slate-200 rounded-[10px] overflow-hidden">
                {BUSINESS_TYPES.map((type, i) => (
                  <button key={type} type="button"
                    onClick={() => setSelectedType(type)}
                    className={`py-[11px] px-2 text-[12px] font-medium text-center transition-colors
                      ${i < BUSINESS_TYPES.length - 1 ? "border-r border-slate-200" : ""}
                      ${selectedType === type
                        ? "bg-white text-slate-900 font-semibold"
                        : "bg-slate-50 text-slate-500 hover:bg-slate-100"}`}>
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Location Details */}
            <div className="mb-10">
              <SectionLabel text="Location Details" />
              <div className="grid grid-cols-2 gap-3 mb-3">
                 <div className="flex items-center border border-slate-200 rounded-[9px] bg-white overflow-hidden focus-within:border-[#00E56A] focus-within:ring-2 focus-within:ring-[#00E56A]/10 transition-all">
                    <span className="pl-3 text-slate-400"><LocIcon /></span>
                    <input type="text" placeholder="City" value={city} onChange={e=>setCity(e.target.value)} className="w-full px-3 py-[11px] bg-transparent text-[13px] text-slate-700 outline-none placeholder:text-slate-300" />
                 </div>
                 <div className="flex items-center border border-slate-200 rounded-[9px] bg-white overflow-hidden focus-within:border-[#00E56A] focus-within:ring-2 focus-within:ring-[#00E56A]/10 transition-all">
                    <span className="pl-3 text-slate-400"><LocIcon /></span>
                    <input type="text" placeholder="State" value={state} onChange={e=>setState(e.target.value)} className="w-full px-3 py-[11px] bg-transparent text-[13px] text-slate-700 outline-none placeholder:text-slate-300" />
                 </div>
              </div>
              <div className="flex items-center border border-slate-200 rounded-[9px] bg-white overflow-hidden focus-within:border-[#00E56A] focus-within:ring-2 focus-within:ring-[#00E56A]/10 transition-all">
                 <span className="pl-3 text-slate-400"><GlobeIcon /></span>
                 <select value={country} onChange={e=>setCountry(e.target.value)} className="flex-1 text-[13px] text-slate-700 py-[11px] px-3 bg-transparent outline-none appearance-none cursor-pointer">
                    <option value="" disabled>Select Country</option>
                    {COUNTRIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                 </select>
                 <span className="pr-3 text-slate-400 pointer-events-none shrink-0">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9"/>
                    </svg>
                 </span>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-4">
              <button onClick={() => setStep(2)} className="px-8 py-3.5 bg-[#00E56A] hover:bg-[#00c95d] text-white font-bold rounded-xl shadow-sm transition-all">
                Next Step
              </button>
              <button onClick={() => navigate("/admin/dashboard")} className="px-6 py-3.5 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors">
                Skip for now
              </button>
            </div>
          </div>

          {/* Right Info Panel */}
          <div className="w-full md:w-[45%] bg-[#F8FAFC] p-8 md:p-12 border-l border-slate-100 flex flex-col justify-center">
            <h3 className="text-lg font-extrabold text-slate-900 mb-8">What you can do today</h3>
            <div className="space-y-8">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-emerald-100/50 flex items-center justify-center shrink-0 text-[#00E56A]">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"></path></svg>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 mb-1">Send broadcasts</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">Reach thousands of customers instantly via WhatsApp.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-emerald-100/50 flex items-center justify-center shrink-0 text-[#00E56A]">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2a10 10 0 00-7.743 16.33l-1.964 1.963A1 1 0 003 22h1.67a10.001 10.001 0 0017.33-10A10 10 0 0012 2zm-1 14h2v2h-2v-2zm1-3a1 1 0 01-1-1V8a1 1 0 012 0v4a1 1 0 01-1 1z"></path></svg>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 mb-1">Automate chats</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">Set up AI-powered responses for common queries.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-emerald-100/50 flex items-center justify-center shrink-0 text-[#00E56A]">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"></path></svg>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 mb-1">Manage team members</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">Collaborate with your team on a single shared inbox.</p>
                </div>
              </div>
            </div>

            {/* Trust Badge */}
            <div className="mt-12 bg-white rounded-xl p-4 flex items-center gap-3 shadow-sm border border-slate-100 w-max">
               <div className="flex items-center text-[#f59e0b] text-sm font-bold gap-1 mr-2">
                 <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
               </div>
               <div className="flex flex-col">
                  <p className="text-[11px] font-extrabold text-slate-800 uppercase tracking-wide">Trusted by 500+ Brands</p>
                  <div className="flex -space-x-2 mt-1">
                    <img src="https://i.pravatar.cc/100?img=1" className="w-6 h-6 rounded-full border-2 border-white" alt="user" />
                    <img src="https://i.pravatar.cc/100?img=2" className="w-6 h-6 rounded-full border-2 border-white" alt="user" />
                    <img src="https://i.pravatar.cc/100?img=3" className="w-6 h-6 rounded-full border-2 border-white" alt="user" />
                    <div className="w-6 h-6 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[8px] font-bold text-slate-500">+12</div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // STEP 2: CONNECT API
  // ==========================================
  if (step === 2) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] font-['Poppins'] flex flex-col">
        {/* Top Header */}
        <header className="px-8 py-4 bg-white border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={logoIcon} alt="MessBee" className="w-7 h-7" />
            <img src={logoName} alt="MessBee" className="h-5" />
          </div>
          <div className="flex items-center gap-4 text-sm">
            <button className="font-bold text-slate-500 hover:text-slate-900 transition-colors">Save & Exit</button>
            <button className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-bold flex items-center gap-2 transition-colors">
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> Support
            </button>
          </div>
        </header>

        <main className="flex-1 flex flex-col items-center p-8">
          <div className="w-full max-w-4xl">
            
            {/* Progress Header */}
            <div className="flex justify-between text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4">
              <span className="text-[#00E56A]">STEP 2: CONNECT API</span>
              <span>40% Completed</span>
            </div>
            
            {/* Visual Stepper */}
            <div className="flex items-center justify-between w-full mb-12 relative">
               <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-200 -z-10 -translate-y-1/2 rounded-full"></div>
               <div className="absolute top-1/2 left-0 w-[40%] h-1 bg-[#00E56A] -z-10 -translate-y-1/2 rounded-full transition-all duration-500"></div>
               
               <div className="flex flex-col items-center gap-2">
                 <div className="w-8 h-8 rounded-full bg-[#00E56A] text-white flex items-center justify-center"><CheckIcon /></div>
                 <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">PROFILE</span>
               </div>
               <div className="flex flex-col items-center gap-2">
                 <div className="w-8 h-8 rounded-full bg-white border-[3px] border-[#00E56A] text-[#00E56A] flex items-center justify-center font-bold text-sm">2</div>
                 <span className="text-[10px] font-bold text-[#00E56A] uppercase tracking-wider">WHATSAPP API</span>
               </div>
               <div className="flex flex-col items-center gap-2">
                 <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center font-bold text-sm">3</div>
                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">VERIFICATION</span>
               </div>
               <div className="flex flex-col items-center gap-2">
                 <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center font-bold text-sm">4</div>
                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">LAUNCH</span>
               </div>
            </div>

            {/* Connection Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row overflow-hidden mb-6">
              
              {/* Left Action Area */}
              <div className="w-full md:w-[50%] p-12 flex flex-col justify-center">
                <h2 className="text-3xl font-extrabold text-slate-900 mb-4 leading-tight">Connect your <br/>WhatsApp API</h2>
                <p className="text-slate-500 text-sm mb-8 leading-relaxed">
                  Link your business phone number to start sending messages at scale using the official WhatsApp Business Platform.
                </p>
                
                <button onClick={() => setIsWhatsAppModalOpen(true)} className="w-full py-4 bg-[#00E56A] hover:bg-[#00c95d] text-white font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-3 mb-3">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                  Connect with Facebook
                </button>
                <p className="text-[11px] text-slate-400 font-medium text-center mb-10">Powered by Meta Embedded Signup</p>
                
                <div className="flex justify-between items-center mt-auto border-t border-slate-100 pt-6">
                  <button onClick={() => setStep(1)} className="text-sm font-bold text-slate-500 hover:text-slate-800 flex items-center gap-2 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg> Back
                  </button>
                  <button onClick={() => setStep(3)} className="text-sm font-bold text-[#00E56A] hover:text-[#00c95d] transition-colors">
                    Manual Configuration
                  </button>
                </div>
              </div>

              {/* Right Info Area */}
              <div className="w-full md:w-[50%] bg-[#F0FDF4]/50 p-12 flex flex-col items-center justify-center border-l border-slate-100">
                {/* Illustration Box */}
                <div className="w-64 h-64 bg-emerald-100/50 rounded-full flex flex-col items-center justify-center mb-10 relative">
                   <div className="w-14 h-14 bg-[#00E56A] rounded-xl text-white flex items-center justify-center absolute top-10 shadow-lg shadow-[#00E56A]/20">
                     <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                   </div>
                   <div className="flex gap-2 mb-2 mt-12">
                     <div className="w-1.5 h-1.5 rounded-full bg-[#00E56A]"></div>
                     <div className="w-1.5 h-1.5 rounded-full bg-[#00E56A]"></div>
                     <div className="w-1.5 h-1.5 rounded-full bg-[#00E56A]"></div>
                   </div>
                   <div className="w-14 h-14 bg-white border border-slate-100 rounded-xl text-[#00E56A] flex items-center justify-center absolute bottom-10 shadow-sm">
                     <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"></path></svg>
                   </div>
                </div>

                <div className="w-full">
                  <h4 className="text-[12px] font-extrabold text-slate-900 uppercase tracking-wider mb-4">WHAT YOU'LL NEED</h4>
                  <ul className="space-y-4 text-sm text-slate-700 font-medium">
                    <li className="flex items-start gap-3"><div className="w-5 h-5 rounded-full bg-[#00E56A] text-white flex items-center justify-center shrink-0"><CheckIcon /></div> Facebook Business Account (Verified)</li>
                    <li className="flex items-start gap-3"><div className="w-5 h-5 rounded-full bg-[#00E56A] text-white flex items-center justify-center shrink-0"><CheckIcon /></div> A phone number not linked to personal WhatsApp</li>
                    <li className="flex items-start gap-3"><div className="w-5 h-5 rounded-full bg-[#00E56A] text-white flex items-center justify-center shrink-0"><CheckIcon /></div> Administrative access to Meta Business Suite</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Badges Below Card */}
            <div className="flex justify-center gap-6 text-xs font-bold text-slate-600 mb-8">
               <div className="bg-white border border-slate-200 rounded-full px-5 py-2.5 flex items-center gap-2 shadow-sm">
                 <div className="w-4 h-4 bg-[#00E56A] text-white rounded-full flex items-center justify-center"><CheckIcon className="w-3 h-3" /></div>
                 Official Meta Business Partner
               </div>
               <div className="bg-white border border-slate-200 rounded-full px-5 py-2.5 flex items-center gap-2 shadow-sm text-slate-500">
                 <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
                 SSL Encrypted
               </div>
            </div>

            <p className="text-center text-[11px] text-slate-400 max-w-md mx-auto leading-relaxed">
              By connecting your account, you agree to MessBee's <Link to="#" className="text-[#00E56A] hover:underline">Terms of Service</Link> and <Link to="#" className="text-[#00E56A] hover:underline">Privacy Policy</Link>. We never store your personal Meta login credentials.
            </p>

          </div>
        </main>
        
        <ConnectWhatsAppModal
          isOpen={isWhatsAppModalOpen}
          onClose={() => {
            setIsWhatsAppModalOpen(false);
            // Optionally auto-advance to step 3 on close if successful
            // For now, let the user manually click 'Next' or we can add a callback
          }}
        />
      </div>
    );
  }

  // ==========================================
  // STEP 3: FIRST CAMPAIGN
  // ==========================================
  if (step === 3) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] font-['Poppins'] flex flex-col">
        {/* Header */}
        <header className="px-8 py-4 bg-white border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={logoIcon} alt="MessBee" className="w-7 h-7" />
            <img src={logoName} alt="MessBee" className="h-5" />
          </div>
          <div className="flex items-center gap-5">
             <div className="w-9 h-9 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 cursor-pointer hover:bg-slate-200 transition-colors">
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
             </div>
             <div className="w-9 h-9 bg-slate-800 rounded-full flex items-center justify-center text-white font-bold text-xs cursor-pointer">
               AR
             </div>
          </div>
        </header>

        <main className="flex-1 flex flex-col items-center p-8">
          <div className="w-full max-w-5xl">
            
            {/* Visual Stepper */}
            <div className="flex justify-center items-center gap-6 md:gap-12 w-full mb-16 pt-4">
               <div className="flex flex-col items-center gap-3">
                 <div className="w-10 h-10 rounded-full border-2 border-[#00E56A] text-[#00E56A] flex items-center justify-center"><CheckIcon className="w-4 h-4" /></div>
                 <span className="text-[10px] font-bold text-slate-600 capitalize">Account</span>
               </div>
               <div className="h-0.5 bg-emerald-200 w-24 md:w-48 mb-6"></div>
               <div className="flex flex-col items-center gap-3">
                 <div className="w-10 h-10 rounded-full border-2 border-[#00E56A] text-[#00E56A] flex items-center justify-center"><CheckIcon className="w-4 h-4" /></div>
                 <span className="text-[10px] font-bold text-slate-600 capitalize">Verification</span>
               </div>
               <div className="h-0.5 bg-emerald-200 w-24 md:w-48 mb-6"></div>
               <div className="flex flex-col items-center gap-3">
                 <div className="w-12 h-12 rounded-full bg-[#00E56A] text-white flex items-center justify-center shadow-lg shadow-[#00E56A]/20">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.5 10.5L21 3m-7.5 7.5v6.364c0 .825-.494 1.574-1.25 1.875L9.375 20.25l-2.625-2.625-1.5-1.5-2.625-2.625 1.5-1.5 1.5-1.5 1.5-1.5c.301-.756 1.05-1.25 1.875-1.25H10.5m3 3L18 7.5m-4.5 4.5V15m-3-3h3"></path></svg>
                 </div>
                 <span className="text-[11px] font-bold text-[#00E56A] capitalize">First Campaign</span>
               </div>
            </div>

            {/* Header Area */}
            <div className="text-center mb-12">
              <div className="w-16 h-16 bg-[#F0FDF4] rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">
                 🎉
              </div>
              <h2 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">Launch your first campaign</h2>
              <p className="text-slate-500 text-base">Choose a template to start engaging with your customers immediately.<br/>You're just seconds away from your first broadcast.</p>
            </div>

            {/* Template Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
               {/* Card 1 */}
               <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 flex flex-col hover:border-[#00E56A] hover:shadow-lg transition-all cursor-pointer group h-full">
                  <div className="w-full h-40 bg-[#F0FDF4] rounded-2xl mb-8 flex items-center justify-center text-[#00E56A] opacity-80 group-hover:opacity-100 transition-opacity">
                     <svg className="w-14 h-14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11"></path></svg>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">Welcome Message</h3>
                  <p className="text-sm text-slate-500 leading-relaxed mb-8 flex-1">Automate a warm greeting for every new customer who contacts you.</p>
                  <button className="text-xs font-bold text-[#00E56A] uppercase tracking-widest text-left">TRY TEMPLATE →</button>
               </div>
               
               {/* Card 2 */}
               <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 flex flex-col hover:border-[#00E56A] hover:shadow-lg transition-all cursor-pointer group h-full">
                  <div className="w-full h-40 bg-[#F0FDF4] rounded-2xl mb-8 flex items-center justify-center text-[#00E56A] opacity-80 group-hover:opacity-100 transition-opacity">
                     <svg className="w-14 h-14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"></path></svg>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">Marketing Broadcast</h3>
                  <p className="text-sm text-slate-500 leading-relaxed mb-8 flex-1">Send a special promo or announcement to a small test group.</p>
                  <button className="text-xs font-bold text-[#00E56A] uppercase tracking-widest text-left">TRY TEMPLATE →</button>
               </div>

               {/* Card 3 */}
               <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 flex flex-col hover:border-[#00E56A] hover:shadow-lg transition-all cursor-pointer group h-full">
                  <div className="w-full h-40 bg-[#F0FDF4] rounded-2xl mb-8 flex items-center justify-center text-[#00E56A] opacity-80 group-hover:opacity-100 transition-opacity">
                     <svg className="w-14 h-14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">Utility Update</h3>
                  <p className="text-sm text-slate-500 leading-relaxed mb-8 flex-1">Send a sample order confirmation or shipping update notification.</p>
                  <button className="text-xs font-bold text-[#00E56A] uppercase tracking-widest text-left">TRY TEMPLATE →</button>
               </div>
            </div>

            <div className="flex flex-col items-center gap-6 pb-12">
              <button onClick={() => setStep(4)} className="px-14 py-4 bg-[#00E56A] hover:bg-[#00c95d] text-slate-900 font-extrabold text-lg rounded-2xl shadow-lg shadow-[#00E56A]/20 transition-all flex items-center gap-3">
                Go to Campaign Builder <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" /></svg>
              </button>
              <div className="flex items-center gap-4 text-xs font-bold">
                 <span className="text-slate-900 flex items-center gap-1">Finish Setup <CheckIcon className="w-3 h-3"/></span>
                 <span className="text-slate-300">|</span>
                 <button onClick={() => navigate('/admin/dashboard')} className="text-slate-400 hover:text-slate-600 transition-colors">Skip to Dashboard</button>
              </div>
            </div>

            {/* Bottom Progress Bar */}
            <div className="w-full max-w-4xl mx-auto border-t border-slate-200 pt-8 mt-4">
               <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest mb-3">
                 <span className="text-slate-600">Setup Status: Almost Finished</span>
                 <span className="text-[#00E56A] italic">95% Complete</span>
               </div>
               <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                 <div className="h-full bg-[#00E56A] w-[95%] rounded-full"></div>
               </div>
               <p className="text-center text-[10px] text-slate-400 mt-4">Finish this step to unlock your full messaging suite.</p>
            </div>

          </div>
        </main>
      </div>
    );
  }

  // ==========================================
  // STEP 4: SUCCESS MODAL
  // ==========================================
  return (
    <div className="min-h-screen relative flex items-center justify-center p-6 font-['Poppins'] bg-[#E2E8F0] overflow-hidden">
      
      {/* Container Background matches UI dark gray theme */}
      <div className="absolute inset-0 bg-slate-800"></div>

      <div className="relative z-10 w-full max-w-[480px] bg-white rounded-3xl shadow-2xl p-10 text-center flex flex-col items-center">
        
        {/* Top border decoration line */}
        <div className="absolute top-0 left-0 w-full h-1 bg-[#00E56A] rounded-t-3xl opacity-50"></div>

        {/* Floating background details (simulating confetti) */}
        <div className="absolute top-1/4 left-6 w-2 h-4 bg-emerald-200 rounded rotate-45 opacity-50"></div>
        <div className="absolute top-1/3 right-8 w-2 h-6 bg-emerald-200 rounded -rotate-12 opacity-50"></div>
        <div className="absolute bottom-1/4 left-10 w-2 h-2 bg-emerald-200 rounded opacity-50"></div>
        <div className="absolute bottom-1/3 right-6 w-3 h-3 bg-emerald-200 rounded opacity-50"></div>

        {/* 3D Rocket Element Simulation */}
        <div className="w-40 h-40 bg-[#124B3C] rounded-2xl flex items-center justify-center mb-10 shadow-inner relative overflow-hidden">
           {/* Glow effect inside square */}
           <div className="absolute bottom-0 w-full h-2/3 bg-gradient-to-t from-white/30 to-transparent blur-md"></div>
           
           {/* SVG representation of the Rocket since actual 3D asset is not available */}
           <svg className="w-20 h-20 text-white z-10 drop-shadow-xl" fill="currentColor" viewBox="0 0 24 24">
             <path d="M12 2C12 2 8 6 8 12c0 2.21 1.79 4 4 4s4-1.79 4-4c0-6-4-10-4-10zM7.5 15.5l-2.5 5h3l1.5-3m7-2l1.5 3h3l-2.5-5" />
             <circle cx="12" cy="10" r="1.5" fill="#124B3C" />
           </svg>
           {/* Simple smoke dots */}
           <div className="absolute bottom-2 flex gap-1 z-10">
             <div className="w-3 h-3 bg-white/80 rounded-full blur-[1px]"></div>
             <div className="w-5 h-5 bg-white rounded-full blur-[1px] -mt-1"></div>
             <div className="w-3 h-3 bg-white/80 rounded-full blur-[1px]"></div>
           </div>
        </div>

        <h2 className="text-3xl font-extrabold text-slate-900 mb-4">
          You're all set, <span className="text-[#00E56A]">Arshlan!</span>
        </h2>
        <p className="text-sm text-slate-600 mb-8 leading-relaxed max-w-[300px]">
          Your WhatsApp API is connected and your workspace is ready for growth.
        </p>

        {/* Checklist Box */}
        <div className="w-full bg-[#F0FDF4]/80 rounded-2xl p-6 mb-10 text-left space-y-4">
           <div className="flex items-center gap-3 text-sm font-bold text-slate-700">
             <div className="w-6 h-6 rounded-full bg-[#00E56A] text-white flex items-center justify-center shrink-0"><CheckIcon /></div>
             Profile personalized
           </div>
           <div className="flex items-center gap-3 text-sm font-bold text-slate-700">
             <div className="w-6 h-6 rounded-full bg-[#00E56A] text-white flex items-center justify-center shrink-0"><CheckIcon /></div>
             API Connected
           </div>
           <div className="flex items-center gap-3 text-sm font-bold text-slate-700">
             <div className="w-6 h-6 rounded-full bg-[#00E56A] text-white flex items-center justify-center shrink-0"><CheckIcon /></div>
             Campaign builder ready
           </div>
        </div>

        {/* Action Buttons */}
        <button onClick={() => navigate("/admin/dashboard")} className="w-full py-4 bg-[#00E56A] hover:bg-[#00c95d] text-slate-900 font-extrabold text-[15px] rounded-xl shadow-lg shadow-[#00E56A]/20 transition-all flex items-center justify-center gap-2 mb-6">
          Go to Dashboard <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
        </button>

        <button className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center justify-center gap-2">
           <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
           Watch a 1-min quick start guide
        </button>

      </div>
    </div>
  );
};

export default Onboarding;