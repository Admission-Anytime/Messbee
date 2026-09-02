import { useEffect, useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { userContext } from "../../context/Context";
import { 
  loginWithPassword, 
  requestLoginOTP, 
  verifyLoginOTP,
  resendOTP,
  saveAuthData 
} from "../../services/authService";
import { FiEye, FiEyeOff } from "react-icons/fi";

const LoginForm = () => {
  const navigate = useNavigate();
  const { loginUser, isLoggedIn } = useContext(userContext);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loginMethod, setLoginMethod] = useState("password"); // "password" or "otp"
  const [step, setStep] = useState("email"); // "email" or "verify"
  const [otpCountdown, setOtpCountdown] = useState(0);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    otp: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [pendingApproval, setPendingApproval] = useState(false);

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

  // Password-based login
  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await loginWithPassword(formData.email, formData.password);

      if (response.success) {
        toast.success("Successfully logged in!");
        saveAuthData(response.data);
        loginUser(response.data.user);
        navigate("/admin/dashboard");
      } else {
        toast.error(response.message || "Login failed");
        setErrorMessage("Invalid email or password");
      }
    } catch (error) {
      const message = error?.response?.data?.message || error.message || "Login failed";
      const isPending = error?.response?.data?.pendingApproval || false;
      if (isPending) {
        setPendingApproval(true);
        setErrorMessage(message);
      } else {
        toast.error(message);
        setErrorMessage("Oops! It seems like your email or password is incorrect.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // OTP-based login - Request OTP
  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await requestLoginOTP(formData.email);

      if (response.success) {
        toast.success("OTP sent to your email!");
        setStep("verify");
        setOtpCountdown(60); // 60 seconds countdown
      } else {
        toast.error(response.message || "Failed to send OTP");
        setErrorMessage("Failed to send OTP. Please try again.");
      }
    } catch (error) {
      const message = error?.response?.data?.message || error.message || "Failed to send OTP";
      const isPending = error?.response?.data?.pendingApproval || false;
      if (isPending) {
        setPendingApproval(true);
        setErrorMessage(message);
      } else {
        toast.error(message);
        setErrorMessage(message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // OTP-based login - Verify OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await verifyLoginOTP(formData.email, formData.otp);

      if (response.success) {
        toast.success("Login successful!");
        saveAuthData(response.data);
        loginUser(response.data.user);
        navigate("/admin/dashboard");
      } else {
        toast.error(response.message || "Invalid OTP");
        setErrorMessage("Invalid OTP. Please try again.");
      }
    } catch (error) {
      const message = error?.response?.data?.message || error.message || "Invalid OTP";
      const isPending = error?.response?.data?.pendingApproval || false;
      if (isPending) {
        setPendingApproval(true);
        setErrorMessage(message);
      } else {
        toast.error(message);
        setErrorMessage(message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    if (otpCountdown > 0) return;
    
    setIsLoading(true);
    try {
      const response = await resendOTP(formData.email, "login");
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
      {/* Pending Approval Banner */}
      {pendingApproval && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <div>
              <p className="text-[13px] font-bold text-amber-800 mb-0.5">Account Under Review</p>
              <p className="text-[12px] text-amber-700 leading-relaxed">
                Admin is reviewing your account. Kindly wait for admin approval.
              </p>
            </div>
          </div>
        </div>
      )}
      {/* Login Method Toggle */}
      <div className="flex gap-2 mb-6 p-1 bg-slate-100 rounded-xl">
        <button
          type="button"
          onClick={() => {
            setLoginMethod("password");
            setStep("email");
            setErrorMessage("");
          }}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${
            loginMethod === "password"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Password Login
        </button>
        <button
          type="button"
          onClick={() => {
            setLoginMethod("otp");
            setStep("email");
            setErrorMessage("");
          }}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${
            loginMethod === "otp"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          OTP Login
        </button>
      </div>

      {/* Password Login Form */}
      {loginMethod === "password" && (
        <form onSubmit={handlePasswordLogin} className="space-y-4">
          {/* Email Input */}
          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              placeholder="name@company.com"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-[#00E56A]/20 focus:border-[#00E56A] outline-none transition-all"
            />
          </div>

          {/* Password Input */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Password
              </label>
              <Link to="/forgot-password" className="text-[11px] font-bold text-[#00B050] hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-[#00E56A]/20 focus:border-[#00E56A] outline-none transition-all pr-12"
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

          {/* Error Message */}
          {errorMessage && (
            <div className="bg-red-50 text-red-600 text-xs p-3 rounded-lg border border-red-100">
              {errorMessage}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 mt-2 bg-[#00E56A] hover:bg-[#00c95d] text-slate-900 font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed text-sm"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin"></div>
            ) : (
              "Sign In"
            )}
          </button>
        </form>
      )}

      {/* OTP Login Form */}
      {loginMethod === "otp" && (
        <>
          {/* Step 1: Request OTP */}
          {step === "email" && (
            <form onSubmit={handleRequestOTP} className="space-y-4">
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="name@company.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-[#00E56A]/20 focus:border-[#00E56A] outline-none transition-all"
                />
              </div>

              {errorMessage && (
                <div className="bg-red-50 text-red-600 text-xs p-3 rounded-lg border border-red-100">
                  {errorMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 mt-2 bg-[#00E56A] hover:bg-[#00c95d] text-slate-900 font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed text-sm"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin"></div>
                ) : (
                  "Send OTP"
                )}
              </button>
            </form>
          )}

          {/* Step 2: Verify OTP */}
          {step === "verify" && (
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
                <p className="text-sm text-blue-800 font-medium">
                  We've sent a 6-digit OTP to <strong>{formData.email}</strong>
                </p>
                <button
                  type="button"
                  onClick={() => setStep("email")}
                  className="text-xs text-blue-600 hover:underline mt-1"
                >
                  Change email
                </button>
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
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 text-center tracking-widest focus:ring-2 focus:ring-[#00E56A]/20 focus:border-[#00E56A] outline-none transition-all"
                />
              </div>

              {errorMessage && (
                <div className="bg-red-50 text-red-600 text-xs p-3 rounded-lg border border-red-100">
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

              <button
                type="submit"
                disabled={isLoading || formData.otp.length !== 6}
                className="w-full py-2.5 mt-2 bg-[#00E56A] hover:bg-[#00c95d] text-slate-900 font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed text-sm"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin"></div>
                ) : (
                  "Verify & Sign In"
                )}
              </button>
            </form>
          )}
        </>
      )}
    </div>
  );
};

export default LoginForm;