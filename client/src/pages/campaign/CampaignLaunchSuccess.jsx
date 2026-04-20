import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

const CampaignLaunchSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ Dynamic data (fallback if nothing passed)
  const {
    campaignName = "Dev Demo Q3",
    contacts = 1248,
    credits = 936,
    duration = "15 minutes",
  } = location.state || {};

  const [isLive, setIsLive] = useState(true);

  // Optional: fake pulse / status effect
  useEffect(() => {
    const timer = setTimeout(() => setIsLive(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const toggleTheme = () => {
    document.documentElement.classList.toggle("dark");
  };

  return (
    <div className="bg-[#F8FAFC] dark:bg-[#0F172A] text-slate-900 dark:text-slate-100 min-h-screen flex items-center justify-center p-6 font-['Inter']">

      <div className="max-w-2xl w-full text-center space-y-8">

        {/* 🔥 Glow + Success Icon */}
        <div className="relative inline-flex items-center justify-center">
          
          {/* Glow */}
          <div className="absolute inset-0 bg-green-500/20 rounded-full blur-3xl scale-[1.8] animate-pulse"></div>

          {/* Outer Circle */}
          <div className="relative w-24 h-24 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center border-4 border-white dark:border-slate-800 shadow-xl">

            {/* Inner Circle */}
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-green-500/30">
              <span className="material-symbols-outlined text-4xl font-bold">
                check
              </span>
            </div>
          </div>
        </div>

        {/* 🧠 Heading */}
        <div className="space-y-3">
          <h1 className="text-3xl font-bold text-[#1E293B] dark:text-white">
            Your campaign is on its way!
          </h1>

          <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
            <span className="font-semibold text-slate-700 dark:text-slate-200">
              {campaignName}
            </span>{" "}
            has been successfully launched. We are now processing your messages
            for <span className="font-semibold">{contacts.toLocaleString()}</span> contacts.
          </p>
        </div>

        {/* 📊 Info Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm max-w-md mx-auto">

          <div className="grid grid-cols-1 divide-y divide-slate-100 dark:divide-slate-800">

            {/* Status */}
            <div className="flex items-center justify-between pb-4">
              <span className="text-sm font-medium text-slate-500">Status</span>

              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>

                <span className="text-sm font-bold text-green-500 uppercase tracking-wider">
                  {isLive ? "Live" : "Starting"}
                </span>
              </div>
            </div>

            {/* Completion */}
            <div className="flex items-center justify-between py-4">
              <span className="text-sm font-medium text-slate-500">
                Expected Completion
              </span>
              <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                Approximately {duration}
              </span>
            </div>

            {/* Credits */}
            <div className="flex items-center justify-between pt-4">
              <span className="text-sm font-medium text-slate-500">
                Credits Used
              </span>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                ₹{credits.toLocaleString()}
              </span>
            </div>

          </div>
        </div>

        {/* 🎯 Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">

          <button
            onClick={() => navigate("/admin/analytic")}
            className="w-full sm:w-auto px-8 py-3.5 bg-green-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-green-500/20 active:scale-95"
          >
            <span className="material-symbols-outlined text-lg">
              insights
            </span>
            View Live Analytics
          </button>

          <button
            onClick={() => navigate("/admin/campaign")}
            className="w-full sm:w-auto px-8 py-3.5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-lg">
              arrow_back
            </span>
            Back to Campaigns
          </button>
        </div>

        {/* Footer */}
        <p className="text-[11px] text-slate-400 font-medium">
          A confirmation report will be sent to your registered email once completed.
        </p>
      </div>

      {/* 🌙 Dark Mode Toggle */}
      <button
        onClick={toggleTheme}
        className="fixed bottom-6 right-6 w-12 h-12 bg-slate-800 dark:bg-white text-white dark:text-slate-800 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform z-[60]"
      >
        <span className="material-symbols-outlined">contrast</span>
      </button>
    </div>
  );
};

export default CampaignLaunchSuccess;