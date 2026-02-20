import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css";
import axios from "../../context/axios";
import { toast } from "react-toastify";

export const SignupForm = () => {
  const navigate = useNavigate();
  const [number, setNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false); // ✅ Added Eye Toggle State

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirm_password: "",
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/admin/dashboard");
    }
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

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
      const phone = number.replace(/^\D+91/g, ""); // Stripping logic
      const updatedFormData = { ...formData, phone };

      // ⚠️ NOTE: If your backend still says "Registration temporarily blocked", 
      // the real API call will fail. I have added a simulated success below so you can test the UI flow!
      
      /* --- REAL API CALL (Uncomment when backend is fixed) ---
      const response = await axios.post("/register", updatedFormData);
      if (response && response.data && response.data.token) {
        toast.success("Account created successfully!");
        localStorage.setItem("token", response.data.token);
        navigate("/onboarding");
      } else {
        toast.error(response.data.message || "Signup failed");
        setErrorMessage("Oops! Something went wrong while signing up.");
      }
      --------------------------------------------------------- */

      // --- 🚀 SIMULATED SUCCESS FOR UI TESTING ---
      setTimeout(() => {
        toast.success("Account created successfully!");
        navigate("/onboarding"); // Moves directly to the new Onboarding screen!
        setIsLoading(false);
      }, 1500);

    } catch (error) {
      toast.error(error?.response?.data?.message || "Sign Up error");
      setErrorMessage("Oops! Something went wrong while signing up.");
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
            Phone Number
          </label>
          <div className="focus-within:ring-2 focus-within:ring-[#00E56A]/20 rounded-xl transition-all">
            <PhoneInput
              defaultCountry="in"
              value={number}
              onChange={setNumber}
              forceDialCode={true}
              inputProps={{ required: true }}
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
                className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:ring-2 focus:ring-[#00E56A]/20 focus:border-[#00E56A] outline-none transition-all"
              />
              <svg 
                onClick={() => setShowPassword(!showPassword)}
                className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 cursor-pointer hover:text-slate-600 transition-colors" 
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                {showPassword ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path>
                ) : (
                  <>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                  </>
                )}
              </svg>
            </div>
          </div>
          
          {/* Confirm Password */}
          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">
              Confirm Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              name="confirm_password"
              placeholder="••••••••"
              value={formData.confirm_password}
              onChange={handleInputChange}
              required
              className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-sm font-medium outline-none transition-all focus:ring-2
                ${formData.confirm_password.length > 0 && formData.password !== formData.confirm_password 
                  ? 'border-red-300 focus:ring-red-200 focus:border-red-400' 
                  : 'border-slate-200 focus:ring-[#00E56A]/20 focus:border-[#00E56A]'
                }`}
            />
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
            <>Get Started Free <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg></>
          )}
        </button>

      </form>
    </div>
  );
};

export default SignupForm; // Ensure default export if used as default in Registration.jsx