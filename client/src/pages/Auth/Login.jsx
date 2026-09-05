import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify"; // Added toast for the Google button
import LoginForm from "../../components/auth/LoginForm";
import Google from "../../assets/googlelogo.svg";
import Facebook from "../../assets/facebooklogo.svg";
import FacebookLogin from "@greatsumini/react-facebook-login";
import { userContext } from "../../context/Context";
import { loginWithFacebook, loginWithSocial, saveAuthData } from "../../services/authService";
import { triggerGoogleLogin } from "../../utils/googleAuth";

import logoIcon from "../../assets/MessBee Logo.png"; 
import logoName from "../../assets/MessBee Name.png";

const Login = () => {
  const navigate = useNavigate();
  const { loginUser } = useContext(userContext);
  const [fbLoading, setFbLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      setGoogleLoading(true);
      await triggerGoogleLogin({
        onSuccess: async (accessToken) => {
          try {
            const res = await loginWithSocial("google", accessToken);
            if (res.success) {
              toast.success("Successfully logged in with Google!");
              saveAuthData(res.data);
              loginUser(res.data.user);
              navigate("/admin/dashboard");
            }
          } catch (error) {
            const message = error?.response?.data?.message || "Google login failed";
            const isPending = error?.response?.data?.pendingApproval || false;
            if (isPending) {
              toast.info(message, { autoClose: 5000 });
            } else {
              toast.error(message);
            }
          } finally {
            setGoogleLoading(false);
          }
        },
        onError: (error) => {
          console.error("Google Login Error:", error);
          toast.error(error?.message || "Google sign in failed.");
          setGoogleLoading(false);
        },
        onCancel: () => {
          setGoogleLoading(false);
        }
      });
    } catch (error) {
      console.error("Google trigger error:", error);
      toast.error("Failed to initialize Google login.");
      setGoogleLoading(false);
    }
  };

  const handleFacebookSuccess = async (response) => {
    if (!response.accessToken) {
      toast.error("Failed to get access token from Facebook.");
      return;
    }

    try {
      setFbLoading(true);
      const res = await loginWithFacebook(response.accessToken);
      
      if (res.success) {
        toast.success("Successfully logged in with Facebook!");
        saveAuthData(res.data);
        loginUser(res.data.user);
        navigate("/admin/dashboard");
      }
    } catch (error) {
      const message = error?.response?.data?.message || "Facebook login failed";
      const isPending = error?.response?.data?.pendingApproval || false;
      if (isPending) {
        toast.info(message, { autoClose: 5000 });
      } else {
        toast.error(message);
      }
    } finally {
      setFbLoading(false);
    }
  };

  const handleFacebookFail = (error) => {
    console.error("Facebook Login Failed:", error);
    toast.error("Facebook login cancelled or failed.");
  };

  return (
    <div className="h-screen w-full flex font-['Poppins'] bg-white overflow-hidden">

      {/* LEFT SIDE */}
      <div className="hidden lg:flex flex-col w-1/2 bg-[#121A26] px-14 pt-10 pb-10 relative overflow-hidden">

        {/* Background glows */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#00E56A] opacity-[0.04] blur-3xl rounded-full"></div>
          <div className="absolute bottom-0 right-0 w-72 h-72 bg-[#00E56A] opacity-[0.03] blur-3xl rounded-full"></div>
          <div className="absolute top-1/2 right-10 w-48 h-48 bg-blue-500 opacity-[0.02] blur-3xl rounded-full"></div>
        </div>

        {/* Logo — top aligned */}
        <div className="flex items-center gap-3 relative z-10 mb-auto mt-6">
          <img src={logoIcon} alt="MessBee Icon" className="w-7 h-7 object-contain" />
          <img src={logoName} alt="MessBee Text" className="h-5 w-auto object-contain" />
        </div>

        {/* Main content — centered vertically in remaining space */}
        <div className="relative z-10 my-auto">
          <div className="max-w-lg mb-8">
            <h1 className="text-2xl lg:text-3xl font-extrabold text-white leading-[1.15] mb-4">
              Scale your business <br /> with the power of <br />
              <span className="text-[#00E56A]">WhatsApp API.</span>
            </h1>
            <p className="text-slate-400 text-xs lg:text-sm leading-relaxed max-w-md font-light">
              The most professional and secure platform for enterprise-grade communication. Connect with billions of users through a reliable, automated infrastructure.
            </p>
          </div>
          <div className="flex flex-col gap-0">
            {[
              {
                icon: (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  </svg>
                ),
                title: "Bulk WhatsApp Broadcasting",
                desc: "Send campaigns to thousands instantly",
                color: "from-[#00E56A]/20 to-[#00E56A]/5",
                iconColor: "text-[#00E56A]",
              },
              {
                icon: (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
                  </svg>
                ),
                title: "AI-Powered Automation",
                desc: "Chatbots & workflows that run 24/7",
                color: "from-violet-500/20 to-violet-500/5",
                iconColor: "text-violet-400",
              },
              {
                icon: (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
                  </svg>
                ),
                title: "Real-Time Analytics",
                desc: "Track delivery, opens & conversions",
                color: "from-blue-500/20 to-blue-500/5",
                iconColor: "text-blue-400",
              },
            ].map((f, i) => (
              <div key={i} className={`flex items-center gap-4 py-3.5 ${i < 2 ? "border-b border-white/[0.05]" : ""}`}>
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${f.color} border border-white/[0.08] flex items-center justify-center shrink-0 ${f.iconColor}`}>
                  {f.icon}
                </div>
                <div>
                  <p className="text-white text-[12px] font-semibold tracking-tight">{f.title}</p>
                  <p className="text-slate-500 text-[10px] mt-0.5">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Spacer bottom */}
        <div className="mb-auto" />
      </div>

      {/* RIGHT SIDE */}
      <div className="w-full lg:w-1/2 flex flex-col items-center px-6 sm:px-12 pt-10 pb-10 h-full overflow-y-auto relative">

        {/* Mobile logo */}
        <div className="flex lg:hidden items-center gap-2 self-start mb-8">
          <img src={logoIcon} alt="MessBee Icon" className="w-8 h-8 object-contain" />
          <img src={logoName} alt="MessBee Text" className="h-6 w-auto object-contain" />
        </div>

        {/* Form — centered in remaining space */}
        <div className="w-full max-w-[340px] flex flex-col my-auto">
          <div className="mb-4 text-center">
            <h2 className="text-xl font-extrabold text-slate-900 mb-1">Welcome back</h2>
            <p className="text-slate-500 text-[11px]">Please enter your details to sign in.</p>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-3">
            <button
              onClick={handleGoogleLogin}
              type="button"
              disabled={googleLoading || fbLoading}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all text-xs font-semibold text-slate-700 shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {googleLoading ? (
                <div className="w-5 h-5 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin"></div>
              ) : (
                <>
                  <img src={Google} alt="Google" className="w-5 h-5 shrink-0" />
                  <span>Google</span>
                </>
              )}
            </button>
            <FacebookLogin
              appId={import.meta.env.VITE_FB_LOGIN_APP_ID || "921773847630961"}
              scope="public_profile,email"
              fields="name,email,picture"
              onSuccess={handleFacebookSuccess}
              onFail={handleFacebookFail}
              onProfileSuccess={(response) => console.log('Profile:', response)}
              disabled={fbLoading}
              render={({ onClick, disabled }) => (
                <button onClick={onClick} disabled={disabled || fbLoading} type="button"
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all text-xs font-semibold text-slate-700 shadow-sm disabled:opacity-70 disabled:cursor-not-allowed">
                  {fbLoading ? (
                    <div className="w-5 h-5 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <img src={Facebook} alt="Facebook" className="w-5 h-5 shrink-0" />
                      <span>Facebook</span>
                    </>
                  )}
                </button>
              )}
            />
          </div>

          <div className="flex items-center mb-3">
            <div className="flex-1 h-px bg-slate-200"></div>
            <span className="px-4 text-xs font-medium text-slate-400">or</span>
            <div className="flex-1 h-px bg-slate-200"></div>
          </div>

          <div className="w-full">
            <LoginForm />
          </div>

          <p className="text-center text-xs text-slate-500 mt-4">
            Don't have an account?{" "}
            <Link to="/signup" className="text-[#00E56A] font-bold hover:underline transition-colors">Sign up</Link>
          </p>
        </div>

        {/* Footer links */}
        <div className="flex flex-wrap justify-center gap-4 sm:gap-8 text-[10px] font-bold text-slate-400 tracking-wider uppercase mt-auto pt-4">
          <Link to="#" className="hover:text-slate-600 transition-colors">Privacy Policy</Link>
          <Link to="#" className="hover:text-slate-600 transition-colors">Terms of Service</Link>
          <Link to="#" className="hover:text-slate-600 transition-colors">Help Center</Link>
        </div>

      </div>
    </div>
  );
};

export default Login;