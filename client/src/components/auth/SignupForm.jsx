import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css";
import { toast } from "react-toastify";
import { userContext } from "../../context/Context";
import { 
  requestSignupOTP, 
  verifySignupOTP,
  resendOTP,
  saveAuthData 
} from "../../services/authService";
import { FiEye, FiEyeOff } from "react-icons/fi";

export const SignupForm = () => {
  const navigate = useNavigate();
  const { loginUser, isLoggedIn } = useContext(userContext);
  const [number, setNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState("form"); // "form" or "verify"
  const [otpCountdown, setOtpCountdown] = useState(0);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirm_password: "",
    otp: "",
  });

  // Redirect if already logged in (checked via context state)
  useEffect(() => {
    if (isLoggedIn) {
      navigate("/admin/dashboard");
    }
  }, [isLoggedIn, navigate]);

  // OTP countdown timer
  useEffect(() => {
    if (otpCountdown > 0) {
      const timer = setTimeout(() => setOtpCountdown(otpCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [otpCountdown]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrorMessage("");
  };

  // Step 1: Request OTP
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (formData.password !== formData.confirm_password) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    if (formData.password.length < 6) {
      setErrorMessage("Password must be at least 6 characters.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await requestSignupOTP(
        formData.name,
        formData.email,
        formData.password,
        number
      );

      if (response.success) {
        toast.success("OTP sent to your email!");
        setStep("verify");
        setOtpCountdown(60); // 60 seconds countdown
      } else {
        toast.error(response.message || "Signup failed");
        setErrorMessage(response.message || "Oops! Something went wrong.");
      }
    } catch (error) {
      const message = error?.response?.data?.message || error.message || "Sign Up error";
      toast.error(message);
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await verifySignupOTP(formData.email, formData.otp);

      if (response.success) {
        if (response.pendingApproval) {
          toast.success("Account created! Awaiting admin approval.");
          setErrorMessage("Your account is under review. Kindly wait for admin approval before logging in.");
          // Do NOT login the user
        } else {
          toast.success("Account created successfully!");
          saveAuthData(response.data);
          loginUser(response.data.user);
          navigate("/admin/dashboard");
        }
      } else {
        toast.error(response.message || "Invalid OTP");
        setErrorMessage(response.message || "Invalid OTP. Please try again.");
      }
    } catch (error) {
      const message = error?.response?.data?.message || error.message || "Verification failed";
      toast.error(message);
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    if (otpCountdown > 0) return;
    
    setIsLoading(true);
    try {
      const response = await resendOTP(formData.email, "signup");
      if (response.success) {
        toast.success("OTP resent successfully!");
        setOtpCountdown(60);
      }
    } catch (error) {
      toast.error("Failed to resend OTP");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      {/* Hide native browser eye icon & Style Phone Input */}
      <style>{`
        input[type="password"]::-ms-reveal,
        input[type="password"]::-ms-clear {
          display: none;
        }
        .react-international-phone-input {
          width: 100% !important;
          height: 48px !important;
          border-radius: 0 12px 12px 0 !important;
          border: 1px solid #e2e8f0 !important;
          border-left: none !important;
          background-color: #f8fafc !important;
          font-family: inherit !important;
          font-size: 14px !important;
          color: #0f172a !important;
        }
        .react-international-phone-country-selector-button {
          height: 48px !important;
          border-radius: 12px 0 0 12px !important;
          border: 1px solid #e2e8f0 !important;
          background-color: #f8fafc !important;
          padding: 0 12px !important;
        }
        .react-international-phone-input:focus, .react-international-phone-country-selector-button:focus {
           outline: none !important;
        }
      `}</style>

      {/* Step 1: Registration Form */}
      {step === "form" && (
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Full Name */}
          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              placeholder="John Doe"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:ring-2 focus:ring-[#00E56A]/20 focus:border-[#00E56A] outline-none transition-all"
            />
          </div>

          {/* Work Email */}
          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">
              Work Email
            </label>
            <input
              type="email"
              name="email"
              placeholder="name@company.com"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:ring-2 focus:ring-[#00E56A]/20 focus:border-[#00E56A] outline-none transition-all"
            />
          </div>

          {/* Phone Input */}
          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">
              Phone Number (Optional)
            </label>
            <div className="focus-within:ring-2 focus-within:ring-[#00E56A]/20 rounded-xl transition-all">
              <PhoneInput
                defaultCountry="in"
                value={number}
                onChange={setNumber}
                forceDialCode={true}
              />
            </div>
          </div>

          {/* Passwords - Side by Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Create Password */}
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">
                Create Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="At least 6 chars"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:ring-2 focus:ring-[#00E56A]/20 focus:border-[#00E56A] outline-none transition-all"
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
            
            {/* Confirm Password */}
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="confirm_password"
                  placeholder="••••••••"
                  value={formData.confirm_password}
                  onChange={handleInputChange}
                  required
                  className={`w-full pl-4 pr-12 py-3 bg-slate-50 border rounded-xl text-sm font-medium outline-none transition-all focus:ring-2
                    ${formData.confirm_password.length > 0 && formData.password !== formData.confirm_password 
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
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="bg-red-50 text-red-600 text-xs font-medium p-3 rounded-xl border border-red-100 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              {errorMessage}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 mt-2 bg-[#00E56A] hover:bg-[#00c95d] text-slate-900 font-extrabold rounded-xl shadow-md shadow-[#00E56A]/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin"></div>
            ) : (
              <>Send OTP <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg></>
            )}
          </button>

        </form>
      )}

      {/* Step 2: OTP Verification */}
      {step === "verify" && (
        <form onSubmit={handleVerifyOTP} className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
              </svg>
              <div className="flex-1">
                <p className="text-sm text-blue-800 font-medium">
                  We've sent a 6-digit OTP to
                </p>
                <p className="text-sm text-blue-900 font-bold mt-0.5">{formData.email}</p>
                <button
                  type="button"
                  onClick={() => setStep("form")}
                  className="text-xs text-blue-600 hover:underline mt-1"
                >
                  Change email
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">
              Enter OTP
            </label>
            <input
              type="text"
              name="otp"
              placeholder="000000"
              value={formData.otp}
              onChange={handleInputChange}
              required
              maxLength={6}
              pattern="[0-9]{6}"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 text-center tracking-widest focus:ring-2 focus:ring-[#00E56A]/20 focus:border-[#00E56A] outline-none transition-all"
            />
            <p className="text-xs text-slate-500 mt-2">
              Check your email inbox (and spam folder) for the OTP.
            </p>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="bg-red-50 text-red-600 text-xs font-medium p-3 rounded-xl border border-red-100 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              {errorMessage}
            </div>
          )}

          {/* Resend OTP */}
          <div className="text-center">
            {otpCountdown > 0 ? (
              <p className="text-xs text-slate-500">
                Resend OTP in <span className="font-bold text-slate-700">{otpCountdown}s</span>
              </p>
            ) : (
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={isLoading}
                className="text-xs text-[#00B050] font-bold hover:underline"
              >
                Resend OTP
              </button>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || formData.otp.length !== 6}
            className="w-full py-3.5 mt-2 bg-[#00E56A] hover:bg-[#00c95d] text-slate-900 font-extrabold rounded-xl shadow-md shadow-[#00E56A]/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin"></div>
            ) : (
              <>Verify & Create Account <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg></>
            )}
          </button>

        </form>
      )}
    </div>
  );
};

export default SignupForm;