import React from "react";
import { Link } from "react-router-dom";
import SignupForm from "../../components/auth/SignupForm";
import FirstHeader from "../../components/header/FirstHeader";
import Google from "../../assets/googlelogo.svg";

const Registration = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-['Poppins']">
      {/* Header Section */}
      <FirstHeader />

      {/* Main Centered Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 md:p-10 border border-slate-100">
          
          {/* Title Section */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-slate-800 mb-2">Get Started</h2>
            <p className="text-sm text-slate-500">
              Already have an account?{" "}
              <Link to="/login" className="text-[#00B050] font-bold hover:underline">
                Log in
              </Link>
            </p>
          </div>

          {/* Signup Form Component */}
          <div className="mb-6">
            <SignupForm />
          </div>

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-1 h-px bg-slate-200"></div>
            <span className="px-4 text-xs font-medium text-slate-400">OR</span>
            <div className="flex-1 h-px bg-slate-200"></div>
          </div>

          {/* Google Button */}
          <button className="w-full flex items-center justify-center gap-3 py-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all duration-200 group">
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

export default Registration;