import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { resendOTP } from "../../services/authService";
import logoIcon from "../../assets/MessBee Logo.png"; 
import logoName from "../../assets/MessBee Name.png";

const VerifyOTP = () => {
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [isLoading, setIsLoading] = useState(false);
  
  // Timer State
  const [timeLeft, setTimeLeft] = useState(54); // Starts at 54 seconds
  const [canResend, setCanResend] = useState(false);
  
  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get email from navigation state
  const email = location.state?.email || '';
  const purpose = location.state?.purpose || 'forgot-password';
  
  useEffect(() => {
    if (!email) {
      toast.error('Email not found. Please start from forgot password page.');
      navigate('/forgot-password');
    }
  }, [email, navigate]);

  // --- Countdown Timer Logic ---
  useEffect(() => {
    if (timeLeft > 0) {
      const timerId = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timerId);
    } else {
      setCanResend(true);
    }
  }, [timeLeft]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  // --- OTP Input Logic ---
  const handleChange = (element, index) => {
    if (isNaN(element.value)) return false;
    
    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);

    // Auto-focus next input
    if (element.value !== "" && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    // Move to previous input on Backspace if current is empty
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6).split("");
    if (pastedData.length > 0) {
      const newOtp = [...otp];
      pastedData.forEach((char, i) => {
        if (!isNaN(char) && i < 6) newOtp[i] = char;
      });
      setOtp(newOtp);
      // Focus the next empty input or the last one
      const nextFocusIndex = pastedData.length < 6 ? pastedData.length : 5;
      inputRefs.current[nextFocusIndex].focus();
    }
  };

  const handleResend = async () => {
    try {
      await resendOTP(email, purpose);
      toast.success("A new verification code has been sent!");
      setOtp(new Array(6).fill("")); // Clear inputs
      setTimeLeft(60); // Reset timer to 60 seconds
      setCanResend(false);
      inputRefs.current[0].focus();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to resend OTP");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const code = otp.join("");
    
    if (code.length < 6) {
      toast.error("Please enter the complete 6-digit code.");
      return;
    }

    // Navigate to reset password with email and OTP
    toast.success("OTP verified! Please set your new password.");
    navigate("/reset-password", { state: { email, otp: code } });
  };

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center p-6 font-['Poppins'] bg-[#F8FAFC] overflow-hidden">
      
      {/* Subtle Background Glow */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-[#00E56A] opacity-[0.05] blur-[100px] rounded-full"></div>
      </div>

      <div className="relative z-10 flex items-center gap-2 mb-8">
        <img src={logoIcon} alt="MessBee Logo" className="w-8 h-8 object-contain" />
        <img src={logoName} alt="MessBee Name" className="h-6 w-auto object-contain" />
      </div>

      <div className="relative z-10 w-full max-w-[400px] bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-8 text-center">
        <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Verify your identity</h2>
        <p className="text-sm text-slate-500 mb-6 leading-relaxed">
          Enter the 6-digit code sent to <br/><span className="font-bold text-slate-800">{email}</span> to continue.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-center gap-2 sm:gap-3">
            {otp.map((data, index) => (
              <input
                key={index}
                type="text"
                maxLength="1"
                ref={(el) => (inputRefs.current[index] = el)}
                value={data}
                disabled={canResend} // Disables input fields when timer is up
                onChange={(e) => handleChange(e.target, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                onPaste={handlePaste}
                onFocus={(e) => e.target.select()}
                className="w-10 h-12 sm:w-12 sm:h-14 text-center text-xl font-bold text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#00E56A] focus:ring-2 focus:ring-[#00E56A]/20 outline-none transition-all disabled:opacity-50 disabled:bg-slate-100"
              />
            ))}
          </div>

          <button 
            type="submit" 
            // ✅ Button is now disabled if loading, code is incomplete, OR timer has run out
            disabled={isLoading || otp.join("").length < 6 || canResend}
            className="w-full py-3 bg-[#00E56A] hover:bg-[#00c95d] text-white font-bold rounded-xl transition-all shadow-sm flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
               <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
               "Verify & Continue →"
            )}
          </button>
        </form>

        <div className="text-xs text-slate-400 mt-6">
          Didn't receive the code? <br/>
          {canResend ? (
            <button 
              onClick={handleResend}
              className="mt-1 text-[#00E56A] font-bold hover:underline transition-all"
            >
              Click here to resend
            </button>
          ) : (
            <span className="text-slate-800 font-bold mt-1 inline-block">
              Resend code in <span className="text-[#00B050]">{formatTime(timeLeft)}</span>
            </span>
          )}
        </div>

        <div className="mt-8">
           <Link to="/login" className="text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors">
             ← Back to login
           </Link>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP;