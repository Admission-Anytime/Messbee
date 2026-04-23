import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

const CampaignLaunchSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    campaignName = "Dev Demo Q3",
    contacts = 1248,
    credits = 936,
    duration = "15 minutes",
  } = location.state || {};

  const [isLive, setIsLive] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLive(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const toggleTheme = () => {
    document.documentElement.classList.toggle("dark");
  };

  return (
    <div className="bg-[#F8FAFC] text-slate-900 min-h-screen flex items-center justify-center p-6 font-['Inter']">

      <div className="max-w-2xl w-full text-center space-y-8">

        {/* ✅ Clean Success Icon */}
        <div className="flex items-center justify-center">
         <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-[0_8px_25px_rgba(34,197,94,0.4)]">
       <svg
         xmlns="http://www.w3.org/2000/svg"
         className="w-8 h-8 text-white"
         fill="none"
         viewBox="0 0 24 24"
         stroke="currentColor"
         strokeWidth={3}
          >
         <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 13l4 4L19 7"
          />
        </svg>
       </div>  
        </div>

        {/* 🧠 Heading */}
        <div className="space-y-3">
          <h1 className="text-3xl font-bold text-[#1E293B]">
            Your campaign is on its way!
          </h1>

          <p className="text-slate-500 max-w-md mx-auto leading-relaxed">
            <span className="font-semibold text-slate-700">
              {campaignName}
            </span>{" "}
            has been successfully launched. We are now processing your messages
            for <span className="font-semibold">{contacts.toLocaleString()}</span> contacts.
          </p>
        </div>

        {/* 📊 Info Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm max-w-md mx-auto">

          <div className="grid grid-cols-1 divide-y divide-slate-100">

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
              <span className="text-sm font-semibold text-slate-800">
                Approximately {duration}
              </span>
            </div>

            {/* Credits */}
            <div className="flex items-center justify-between pt-4">
              <span className="text-sm font-medium text-slate-500">
                Credits Used
              </span>
              <span className="text-sm font-bold text-slate-800">
                ₹{credits.toLocaleString()}
              </span>
            </div>

          </div>
        </div>

        {/* 🎯 Buttons */}
        <div className="max-w-md mx-auto flex gap-3 pt-4">

          <button
            onClick={() => navigate("/admin/analytic")}
            className="flex-1 px-6 py-2.5 bg-green-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-green-500/20 active:scale-95"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 17l6-6 4 4 8-8"
              />
            </svg>
            View Live Analytics
          </button>

          <button
            onClick={() => navigate("/admin/campaign")}
            className="flex-1 px-6 py-2.5 bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Campaigns
          </button>
        </div>

        {/* Footer */}
        <p className="text-[10px] text-slate-400 font-normal text-center max-w-md mx-auto whitespace-nowrap overflow-hidden text-ellipsis">
          A confirmation report will be sent to your email once completed.
        </p>
      </div>
    </div>
  );
};

export default CampaignLaunchSuccess;
