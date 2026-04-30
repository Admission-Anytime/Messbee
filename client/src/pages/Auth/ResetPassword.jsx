import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { resetPassword } from "../../services/authService";
`import { FiEye, FiEyeOff } from "react-icons/fi";
import logoIcon from "../../assets/MessBee Logo.png"; 
import logoName from "../../assets/MessBee Name.png";

const ResetPassword = () => {
  const [isSuccess, setIsSuccess] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [countdown, setCountdown] = useState(5);
  const [isLoading, setIsLoading] = useState(false);
  
  // ✅ New state to toggle password visibility
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get email and OTP from navigation state
  const email = location.state?.email || '';
  const otp = location.state?.otp || '';
  
  useEffect(() => {
    if (!email || !otp) {
      toast.error('Invalid password reset link. Please start from forgot password page.');
      navigate('/forgot-password');
    }
  }, [email, otp, navigate]);

  // --- Password Strength Logic ---
  const criteria = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  const score = Object.values(criteria).filter(Boolean).length;
  
  let strengthText = "WEAK";
  let strengthColor = "text-red-500";
  if (score === 2 || score === 3) { strengthText = "GOOD"; strengthColor = "text-yellow-500"; }
  if (score === 4) { strengthText = "GREAT"; strengthColor = "text-[#00E56A]"; }

  // --- Handle Auto Redirect on Success ---
  useEffect(() => {
    let timer;
    if (isSuccess && countdown > 0) {
      timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    } else if (isSuccess && countdown === 0) {
      navigate("/login");
    }
    return () => clearTimeout(timer);
  }, [isSuccess, countdown, navigate]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    
    // Validation checks
    if (!email || !otp) {
      toast.error("Missing email or OTP. Please start from forgot password page.");
      navigate('/forgot-password');
      return;
    }
    
    if (score < 4) {
      toast.warning("Please ensure your password meets all criteria.");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }
    
    setIsLoading(true);
    try {
      console.log('Attempting password reset...', { 
        email, 
        hasOtp: !!otp, 
        otpLength: otp?.length,
        passwordLength: password.length 
      });
      
      const response = await resetPassword(email, otp, password);
      if (response.success) {
        toast.success("Password reset successful!");
        setIsSuccess(true);
      }
    } catch (error) {
      console.error('Password reset error:', error);
      const errorMessage = error.response?.data?.message || "Failed to reset password. Please try again.";
      toast.error(errorMessage);
      
      // If OTP is invalid or expired, redirect to forgot password
      if (errorMessage.includes('OTP') || errorMessage.includes('expired')) {
        setTimeout(() => {
          navigate('/forgot-password');
        }, 2000);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const CheckIcon = ({ active }) => (
    <svg className={`w-3.5 h-3.5 ${active ? 'text-[#00E56A]' : 'text-slate-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      {active ? (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
      ) : (
        <circle cx="12" cy="12" r="6" fill="currentColor" stroke="none" />
      )}
    </svg>
  );

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center p-6 font-['Poppins'] bg-[#F8FAFC] overflow-hidden">
      
      {/* ✅ CSS to hide the ugly default browser eye icon (Edge/Chrome) */}
      <style>{`
        input[type="password"]::-ms-reveal,
        input[type="password"]::-ms-clear {
          display: none;
        }
      `}</style>

      <div className="relative z-10 flex items-center gap-2 mb-8">
        <img src={logoIcon} alt="MessBee Logo" className="w-8 h-8 object-contain" />
        <img src={logoName} alt="MessBee Name" className="h-6 w-auto object-contain" />
      </div>

      <div className="relative z-10 w-full max-w-[400px] bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-8">
        
        {!isSuccess ? (
          <>
            <h2 className="text-2xl font-extrabold text-slate-900 mb-2 text-center">Create New Password</h2>
            <p className="text-sm text-slate-500 mb-6 leading-relaxed text-center">
              Choose a strong password to protect your MessBee dashboard.
            </p>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">New Password</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    required 
                    placeholder="••••••••" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#00E56A]/20 focus:border-[#00E56A] outline-none transition-all pr-12" 
                  />
                  
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>
              </div>
                
                {/* Dynamic Strength Meter */}
                <div className="mt-3">
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider mb-1.5">
                    <span className="text-slate-400">Strength: <span className={strengthColor}>{password.length === 0 ? "NONE" : strengthText}</span></span>
                  </div>
                  <div className="flex gap-1.5 h-1.5 w-full">
                    <div className={`h-full flex-1 rounded-full transition-colors ${score >= 1 ? 'bg-[#00E56A]' : 'bg-slate-100'}`}></div>
                    <div className={`h-full flex-1 rounded-full transition-colors ${score >= 2 ? 'bg-[#00E56A]' : 'bg-slate-100'}`}></div>
                    <div className={`h-full flex-1 rounded-full transition-colors ${score >= 3 ? 'bg-[#00E56A]' : 'bg-slate-100'}`}></div>
                    <div className={`h-full flex-1 rounded-full transition-colors ${score >= 4 ? 'bg-[#00E56A]' : 'bg-slate-100'}`}></div>
                  </div>
                </div>

                <div className="mt-4 space-y-1.5 text-xs font-medium bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div className={`flex items-center gap-2 transition-colors ${criteria.length ? 'text-[#00E56A]' : 'text-slate-400'}`}>
                    <CheckIcon active={criteria.length} /> 8+ characters
                  </div>
                  <div className={`flex items-center gap-2 transition-colors ${criteria.uppercase ? 'text-[#00E56A]' : 'text-slate-400'}`}>
                    <CheckIcon active={criteria.uppercase} /> One uppercase letter
                  </div>
                  <div className={`flex items-center gap-2 transition-colors ${criteria.number ? 'text-[#00E56A]' : 'text-slate-400'}`}>
                    <CheckIcon active={criteria.number} /> One number
                  </div>
                  <div className={`flex items-center gap-2 transition-colors ${criteria.special ? 'text-[#00E56A]' : 'text-slate-400'}`}>
                    <CheckIcon active={criteria.special} /> One special character (!@#$...)
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Confirm New Password</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    required 
                    placeholder="••••••••" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-sm font-medium outline-none transition-all focus:ring-2 pr-12
                      ${confirmPassword.length > 0 && password !== confirmPassword 
                        ? 'border-red-300 focus:ring-red-200 focus:border-red-400' 
                        : 'border-slate-200 focus:ring-[#00E56A]/20 focus:border-[#00E56A]'
                      }`} 
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={score < 4 || password !== confirmPassword || isLoading}
                className="w-full py-3.5 mt-2 bg-[#00E56A] hover:bg-[#00c95d] text-white font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                    Update Password
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
               <Link to="/login" className="text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors">Back to login</Link>
            </div>
          </>
        ) : (
          <div className="text-center py-4 animate-in fade-in zoom-in duration-300">
            <div className="w-14 h-14 bg-[#00E56A] text-white rounded-full flex items-center justify-center mx-auto mb-5 shadow-lg shadow-[#00E56A]/30">
               <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Password updated</h2>
            <p className="text-sm text-slate-500 mb-8 leading-relaxed px-4">
              Your password has been changed successfully. You can now use your new password to sign in to your account.
            </p>
            <button onClick={() => navigate("/login")} className="w-full py-3.5 bg-[#00E56A] hover:bg-[#00c95d] text-white font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 mb-4">
              Sign in to MessBee →
            </button>
            <div className="flex justify-center items-center gap-2 text-xs font-medium text-slate-400">
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Redirecting to login in {countdown} seconds...
            </div>
          </div>
        )}
      </div>

      <div className="absolute bottom-8 flex flex-col items-center gap-2">
         <div className="flex gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <Link to="#" className="hover:text-slate-600 transition-colors">Help Center</Link>
            <Link to="#" className="hover:text-slate-600 transition-colors">Privacy Policy</Link>
            <Link to="#" className="hover:text-slate-600 transition-colors">Contact Support</Link>
         </div>
         <p className="text-[10px] text-slate-400">© 2024 MessBee WhatsApp API Platform. All rights reserved.</p>
      </div>
    </div>
  );
};

export default ResetPassword;