import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "../../context/axios";
import { FiEye, FiEyeOff, FiRefreshCw } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

const ChangePassword = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [strength, setStrength] = useState({
    score: 0,
    label: "NONE",
    color: "text-red-500",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === "newPassword") {
      calculateStrength(value);
    }
  };

  const calculateStrength = (password) => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    const labels = ["NONE", "WEAK", "FAIR", "GOOD", "STRONG"];
    const colors = [
      "text-red-500",
      "text-orange-500",
      "text-yellow-500",
      "text-blue-500",
      "text-green-500",
    ];

    setStrength({
      score: score,
      label: labels[score],
      color: colors[score],
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.newPassword !== formData.confirmPassword) {
      return toast.error("New passwords do not match");
    }

    if (formData.newPassword.length < 8) {
      return toast.error("Password must be at least 8 characters");
    }

    if (!/[A-Z]/.test(formData.newPassword)) {
      return toast.error("Password must include at least one uppercase letter");
    }

    if (!/\d/.test(formData.newPassword)) {
      return toast.error("Password must include at least one number");
    }

    if (!/[^A-Za-z0-9]/.test(formData.newPassword)) {
      return toast.error("Password must include at least one special character");
    }

    setLoading(true);
    try {
      const response = await axios.put("/auth/update-password", {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });

      if (response.data.success) {
        setSuccess(true);
        toast.success("Password updated successfully");
        setTimeout(() => {
          navigate("/admin/dashboard");
        }, 2000);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  const criteria = [
    { label: "8+ characters", met: formData.newPassword.length >= 8 },
    { label: "One uppercase letter", met: /[A-Z]/.test(formData.newPassword) },
    { label: "One number", met: /\d/.test(formData.newPassword) },
    { label: "One special character (!@#$...)", met: /[^A-Za-z0-9]/.test(formData.newPassword) },
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-140px)] p-4 pt-12 font-['Urbanist']">
      <style>{`
        /* Hide scrollbars globally while on this page */
        html, body, .overflow-y-auto {
          scrollbar-width: none !important;
          -ms-overflow-style: none !important;
        }
        ::-webkit-scrollbar {
          display: none !important;
        }
      `}</style>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-[380px] bg-white rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.04)] p-6 md:p-7 relative overflow-hidden"
      >
        <AnimatePresence mode="wait">
          {!success ? (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="text-center mb-6">
                <h1 className="text-xl font-bold text-[#1E293B]">
                  Change Password
                </h1>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Current Password Field (Added for functionality) */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider ml-1">
                    CURRENT PASSWORD
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrent ? "text" : "password"}
                      name="currentPassword"
                      value={formData.currentPassword}
                      onChange={handleChange}
                      required
                      placeholder="••••••••"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#10B981] transition-all text-[#1E293B] font-medium placeholder:text-[#CBD5E1]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrent(!showCurrent)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#64748B]"
                    >
                      {showCurrent ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                    </button>
                  </div>
                </div>

                {/* New Password Field */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider ml-1">
                    NEW PASSWORD
                  </label>
                  <div className="relative">
                    <input
                      type={showNew ? "text" : "password"}
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleChange}
                      required
                      placeholder="••••••••"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#10B981] transition-all text-[#1E293B] font-medium placeholder:text-[#CBD5E1]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew(!showNew)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#64748B]"
                    >
                      {showNew ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                    </button>
                  </div>
                </div>

                {/* Strength Indicator */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-[11px] font-bold tracking-wider uppercase ml-1">
                    <span className="text-[#64748B]">STRENGTH:</span>
                    <span className={strength.color}>{strength.label}</span>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-1.5">
                    {[1, 2, 3, 4].map((i) => (
                      <div 
                        key={i} 
                        className={`h-1 rounded-full transition-all duration-500 ${
                          strength.score >= i 
                            ? (strength.score === 1 ? 'bg-red-500' : strength.score === 2 ? 'bg-orange-500' : strength.score === 3 ? 'bg-blue-500' : 'bg-green-500') 
                            : 'bg-[#F1F5F9]'
                        }`}
                      />
                    ))}
                  </div>

                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 mt-2">
                    <ul className="grid grid-cols-2 gap-x-4 gap-y-2">
                      {criteria.map((item, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <div className={`w-1 h-1 rounded-full ${item.met ? 'bg-[#10B981]' : 'bg-[#CBD5E1]'}`} />
                          <span className={`text-[11px] font-bold ${item.met ? 'text-[#1E293B]' : 'text-[#94A3B8]'}`}>
                            {item.label}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Confirm Password Field */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider ml-1">
                    CONFIRM NEW PASSWORD
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirm ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      placeholder="••••••••"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#10B981] transition-all text-[#1E293B] font-medium placeholder:text-[#CBD5E1] pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#64748B]"
                    >
                      {showConfirm ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#10B981] hover:bg-[#059669] disabled:bg-[#F1F5F9] disabled:text-[#94A3B8] text-white py-3.5 rounded-xl font-bold text-base transition-all flex items-center justify-center gap-2 mt-4 shadow-sm"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <FiRefreshCw size={18} className={loading ? "animate-spin" : ""} />
                      <span>Update Password</span>
                    </>
                  )}
                </button>

                {/* Back Link */}
                <div className="text-center mt-4">
                  <button 
                    type="button"
                    onClick={() => navigate("/admin/account/profile")}
                    className="text-[12px] font-bold text-[#64748B] hover:text-[#10B981] transition-colors"
                  >
                    Back to profile
                  </button>
                </div>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-10 text-center flex flex-col items-center justify-center min-h-[400px]"
            >
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-[#10B981] mx-auto mb-6 shadow-sm border border-slate-100">
                <FiRefreshCw size={40} className="animate-[spin_4s_linear_infinite]" />
              </div>
              <h2 className="text-2xl font-bold text-[#1E293B] mb-2">Password Updated!</h2>
              <p className="text-[#64748B] text-sm max-w-[280px] mx-auto leading-relaxed">
                Your password has been changed successfully.
              </p>
              
              <div className="mt-8 flex flex-col items-center gap-3 w-full">
                <button
                  onClick={() => navigate("/admin/account/profile")}
                  className="w-full bg-[#10B981] text-white py-3 rounded-xl font-bold text-sm shadow-md hover:bg-[#059669] transition-all"
                >
                  Go to Profile
                </button>
                <p className="text-[11px] text-[#94A3B8] font-medium animate-pulse">
                  Redirecting automatically in 2s...
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default ChangePassword;
