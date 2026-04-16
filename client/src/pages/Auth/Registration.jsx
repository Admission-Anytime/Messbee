import React from "react";
import { Link } from "react-router-dom";
import SignupForm from "../../components/auth/SignupForm";

// ✅ Import your real MessBee logos
import logoIcon from "../../assets/MessBee Logo.png"; 
import logoName from "../../assets/MessBee Name.png";

// Helper icon for the Trust Badges
const ShieldCheckIcon = () => (
  <svg className="w-3.5 h-3.5 text-[#00E56A]" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
  </svg>
);

const Registration = () => {
  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center p-6 font-['Poppins'] bg-[#F8FAFC] overflow-hidden">
      
      {/* --- Subtle Background Glow --- */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-[#00E56A] opacity-[0.04] blur-[100px] rounded-full"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-[#00E56A] opacity-[0.06] blur-[120px] rounded-full"></div>
      </div>

      <div className="relative z-10 w-full max-w-[480px] flex flex-col items-center">
        
        {/* --- Actual MessBee Logo --- */}
        <div className="flex items-center gap-2 mb-6">
          <img src={logoIcon} alt="MessBee Logo" className="w-10 h-10 object-contain" />
          <img src={logoName} alt="MessBee Name" className="h-7 w-auto object-contain" />
        </div>

        {/* --- Headings --- */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 mb-3">Create your account</h1>
          <p className="text-[#00B050] text-sm font-medium tracking-wide">
            Start your 14-day free trial today. No credit card required.
          </p>
        </div>

        {/* --- White Card Container --- */}
        <div className="w-full bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-8 mb-8">
          
          {/* Your Signup Form injects here */}
          <div className="w-full">
            <SignupForm />
          </div>

          {/* Trust Badges */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[11px] font-bold text-slate-500">
             <div className="flex items-center gap-1.5"><ShieldCheckIcon /> GDPR Compliant</div>
             <div className="flex items-center gap-1.5"><ShieldCheckIcon /> Secure SSL</div>
             <div className="flex items-center gap-1.5"><ShieldCheckIcon /> E2E Encrypted</div>
          </div>
        </div>

        {/* --- Login Link --- */}
        <p className="text-sm font-medium text-slate-500 mb-10">
          Already have an account?{" "}
          <Link to="/login" className="text-slate-900 font-bold hover:underline">
            Log in
          </Link>
        </p>

        {/* --- Footer Links --- */}
        <div className="flex flex-wrap justify-center gap-6 sm:gap-8 text-[10px] font-bold text-slate-400 tracking-widest uppercase">
          <Link to="#" className="hover:text-slate-600 transition-colors">Privacy Policy</Link>
          <Link to="#" className="hover:text-slate-600 transition-colors">Terms of Service</Link>
          <Link to="#" className="hover:text-slate-600 transition-colors">Contact Support</Link>
        </div>

      </div>
    </div>
  );
};

export default Registration;