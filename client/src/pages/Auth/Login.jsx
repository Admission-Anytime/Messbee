import React from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify"; // Added toast for the Google button
import LoginForm from "../../components/auth/LoginForm";
import Google from "../../assets/googlelogo.svg";

import logoIcon from "../../assets/MessBee Logo.png"; 
import logoName from "../../assets/MessBee Name.png";

const Login = () => {

  const handleGoogleLogin = () => {
    toast.info("Google SSO integration coming soon!", { icon: "🚀" });
  };

  return (
    <div className="min-h-screen w-full flex font-['Poppins'] bg-white">
      
      {/* =========================================
          LEFT SIDE: Dark Branding Area (Desktop)
      ========================================= */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-[#121A26] p-12 lg:p-20 relative overflow-hidden">
        
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#00E56A] opacity-[0.03] blur-3xl rounded-full"></div>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <img src={logoIcon} alt="MessBee Icon" className="w-10 h-10 object-contain" />
          <img src={logoName} alt="MessBee Text" className="h-7 w-auto object-contain" />
        </div>

        <div className="max-w-lg relative z-10 mt-10">
          <h1 className="text-4xl lg:text-5xl font-extrabold text-white leading-[1.15] mb-6">
            Scale your business <br /> with the power of <br />
            <span className="text-[#00E56A]">WhatsApp API.</span>
          </h1>
          <p className="text-slate-400 text-base lg:text-lg leading-relaxed max-w-md font-light">
            The most professional and secure platform for enterprise-grade communication. Connect with billions of users through a reliable, automated infrastructure.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-white/[0.03] border border-white/10 rounded-2xl py-3 px-5 w-max backdrop-blur-md relative z-10 mt-10">
          <div className="flex -space-x-3">
            <img src="https://i.pravatar.cc/100?img=1" className="w-10 h-10 rounded-full border-2 border-[#121A26]" alt="user" />
            <img src="https://i.pravatar.cc/100?img=2" className="w-10 h-10 rounded-full border-2 border-[#121A26]" alt="user" />
            <img src="https://i.pravatar.cc/100?img=3" className="w-10 h-10 rounded-full border-2 border-[#121A26]" alt="user" />
          </div>
          <div>
            <p className="text-white text-xs font-medium mb-0.5">Trusted by 2,000+ businesses</p>
            <div className="flex gap-0.5 text-[#00E56A] text-sm">★★★★★</div>
          </div>
        </div>
      </div>

      {/* =========================================
          RIGHT SIDE: Login Form Area
      ========================================= */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center relative p-6 sm:p-12">
        
        <div className="flex lg:hidden items-center gap-2 absolute top-8 left-8">
          <img src={logoIcon} alt="MessBee Icon" className="w-8 h-8 object-contain" />
          <img src={logoName} alt="MessBee Text" className="h-6 w-auto object-contain" />
        </div>

        <div className="w-full max-w-[400px] flex flex-col">
          <div className="mb-8">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-2">Welcome back</h2>
            <p className="text-slate-500 text-sm">Please enter your details to sign in.</p>
          </div>

          {/* ✅ Made Google Button Interactive */}
          <button 
            onClick={handleGoogleLogin}
            type="button"
            className="w-full flex items-center justify-center gap-3 py-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors mb-6 text-sm font-semibold text-slate-700 shadow-sm"
          >
            <img src={Google} alt="Google" className="w-5 h-5" />
            Sign in with Google
          </button>

          <div className="flex items-center mb-6">
            <div className="flex-1 h-px bg-slate-200"></div>
            <span className="px-4 text-xs font-medium text-slate-400">or</span>
            <div className="flex-1 h-px bg-slate-200"></div>
          </div>

          <div className="w-full">
            <LoginForm />
          </div>

          <p className="text-center text-sm text-slate-500 mt-6">
            Don't have an account?{" "}
            <Link to="/signup" className="text-[#00E56A] font-bold hover:underline transition-colors">
              Sign up
            </Link>
          </p>
        </div>

        <div className="absolute bottom-8 flex flex-wrap justify-center gap-4 sm:gap-8 text-[10px] font-bold text-slate-400 tracking-wider uppercase">
          <Link to="#" className="hover:text-slate-600 transition-colors">Privacy Policy</Link>
          <Link to="#" className="hover:text-slate-600 transition-colors">Terms of Service</Link>
          <Link to="#" className="hover:text-slate-600 transition-colors">Help Center</Link>
        </div>

      </div>
    </div>
  );
};

export default Login;