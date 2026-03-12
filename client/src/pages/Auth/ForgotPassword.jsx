import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "../../utils/showToast";
import { forgotPassword } from "../../services/authService";
import logoIcon from "../../assets/MessBee Logo.png"; 
import logoName from "../../assets/MessBee Name.png";

const ForgotPassword = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Added loading state
  const navigate = useNavigate();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await forgotPassword(email);
      if (response.success) {
        setIsSubmitted(true);
        toast.success("Password reset OTP sent to your email!");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send reset OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await forgotPassword(email);
      toast.success(`A new OTP has been sent to ${email}`);
    } catch (error) {
      toast.error("Failed to resend OTP");
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center p-6 font-['Poppins'] bg-[#F8FAFC] overflow-hidden">
      {/* Subtle Background Glow */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-[#00E56A] opacity-[0.05] blur-[100px] rounded-full"></div>
      </div>

      {/* Logo */}
      <div className="relative z-10 flex items-center gap-2 mb-8">
        <img src={logoIcon} alt="MessBee Logo" className="w-8 h-8 object-contain" />
        <img src={logoName} alt="MessBee Name" className="h-6 w-auto object-contain" />
      </div>

      {/* Main Card */}
      <div className="relative z-10 w-full max-w-[400px] bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-8 text-center">
        
        {!isSubmitted ? (
          <>
            <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4 text-[#00E56A]">
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Reset your password</h2>
            <p className="text-sm text-slate-500 mb-6 leading-relaxed">
              Enter the email associated with your account and we will send you a link to reset your password.
            </p>

            <form onSubmit={handleSubmit} className="text-left space-y-4">
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Email Address</label>
                <div className="relative">
                  <svg className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                  <input 
                    type="email" 
                    required 
                    placeholder="name@company.com" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#00E56A]/20 focus:border-[#00E56A] outline-none transition-all" 
                  />
                </div>
              </div>
              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full py-3 bg-[#00E56A] hover:bg-[#00c95d] text-white font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  "Send Reset Link →"
                )}
              </button>
            </form>
          </>
        ) : (
          <>
            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4 relative animate-in zoom-in duration-300">
               <svg className="w-8 h-8 text-[#00E56A]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
               <div className="absolute bottom-0 right-0 w-5 h-5 bg-[#00E56A] text-white rounded-full flex items-center justify-center border-2 border-white">
                 <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
               </div>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Check your email</h2>
            <p className="text-sm text-slate-500 mb-6 leading-relaxed">
              We have sent a password recovery link to <br/> <span className="font-bold text-slate-800">{email}</span>. Please check your inbox and follow the instructions.
            </p>
            
            {/* ✅ Navigate to verify OTP with email in state */}
            <button 
              onClick={() => navigate('/verify-otp', { state: { email, purpose: 'forgot-password' } })} 
              className="w-full py-3 bg-[#00E56A] hover:bg-[#00c95d] text-white font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 mb-3"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
              Continue to Verify OTP
            </button>
            
            <button 
              onClick={handleResend} 
              className="w-full py-3 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl transition-all hover:bg-slate-50"
            >
              Resend email
            </button>

            <p className="text-xs text-slate-400 mt-6">
              Didn't receive the email? Check your <span className="font-bold text-[#00E56A]">spam folder</span>.
            </p>
          </>
        )}

        <div className="mt-8">
           <Link to="/login" className="text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors">
             ← Back to login
           </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;