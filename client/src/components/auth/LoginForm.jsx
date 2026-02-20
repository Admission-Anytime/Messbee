import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "../../context/axios";
import { toast } from "react-toastify";

const LoginForm = () => {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    // Check if the user is already logged in
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/admin/dashboard"); // Redirect to the dashboard
    }
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await axios.post("/login", formData);

      if (response && response.data && response.data.token) {
        toast.success("Successfully logged in");
        localStorage.setItem("token", response.data.token);
        navigate("/admin/dashboard");
      } else {
        toast.error(response.data.message || "Login failed");
        setErrorMessage("Oops! It seems like your email or password is incorrect.");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message || "Login failed");
      setErrorMessage("Oops! It seems like your email or password is incorrect.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-4">
        
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
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:ring-2 focus:ring-[#00E56A]/20 focus:border-[#00E56A] outline-none transition-all"
          />
        </div>

        {/* Password Input */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
             <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
               Password
             </label>
             {/* Optional Forgot Password Link */}
             <Link to="/forgot-password" className="text-[11px] font-bold text-[#00B050] hover:underline">Forgot password?</Link>
          </div>
          <input
            type="password"
            name="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:ring-2 focus:ring-[#00E56A]/20 focus:border-[#00E56A] outline-none transition-all"
          />
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
          className="w-full py-3.5 mt-2 bg-[#00E56A] hover:bg-[#00c95d] text-slate-900 font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin"></div>
          ) : (
            "Sign In"
          )}
        </button>
      </form>
    </div>
  );
};

export default LoginForm;