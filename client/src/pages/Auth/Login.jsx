import React from "react";
import { Link } from "react-router-dom";
import LoginForm from "../../components/auth/LoginForm";
import FirstHeader from "../../components/header/FirstHeader";
import Google from "../../assets/googlelogo.svg";

const Login = () => {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-['Poppins']">
      {/* Header Section */}
      <FirstHeader />

      {/* Main Centered Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-[450px] bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 md:p-12 border border-slate-100">
          
          {/* Title Section */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-slate-800 mb-2">Login</h2>
            <p className="text-sm text-slate-500">
              Don't have an account?{" "}
              {/* ✅ MessBee Green Link */}
              <Link to="/signup" className="text-[#00B050] font-bold hover:underline transition-colors">
                Sign up
              </Link>
            </p>
          </div>

          {/* Login Form Component */}
          {/* Note: Ensure the button INSIDE LoginForm is also using bg-[#00B050] */}
          <div className="mb-6">
            <LoginForm />
          </div>

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-1 h-px bg-slate-200"></div>
            <span className="px-4 text-xs font-medium text-slate-400">OR</span>
            <div className="flex-1 h-px bg-slate-200"></div>
          </div>

          {/* Google Button */}
          <button className="w-full flex items-center justify-center gap-3 py-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all duration-200 group">
            <img src={Google} alt="Google" className="w-5 h-5" />
            <span className="text-sm font-medium text-slate-600 group-hover:text-slate-800">
              Continue with Google
            </span>
          </button>

        </div>
      </div>
    </div>
  );
};

export default Login;