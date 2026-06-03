import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import { userContext } from "../../context/Context";

const CampaignLaunchSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, rolePermissions } = useContext(userContext);

  const {
    campaignName = "Dev Demo Q3",
    contacts = 1248,
    credits = 936,
    duration = "15 minutes",
  } = location.state || {};

  const [isLive, setIsLive] = useState(true);
  const [showAccessRestricted, setShowAccessRestricted] = useState(false);

  // Check view_analytics permission
  const userRole = user?.role ? (user.role.charAt(0).toUpperCase() + user.role.slice(1).toLowerCase()) : "Agent";
  const DEFAULT_ANALYTICS_PERMS = { Admin: true, Manager: true, Agent: false };
  const hasAnalyticsAccess = rolePermissions?.[userRole]?.view_analytics
    ?? DEFAULT_ANALYTICS_PERMS[userRole]
    ?? false;

  useEffect(() => {
    const timer = setTimeout(() => setIsLive(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const handleViewAnalytics = () => {
    if (!hasAnalyticsAccess) {
      setShowAccessRestricted(true);
    } else {
      navigate("/admin/analytic");
    }
  };

  return (
    <div className="bg-[#F8FAFC] text-slate-900 min-h-screen flex items-center justify-center p-6 font-['Inter']">

      {/* Access Restricted Modal */}
      {showAccessRestricted && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={() => setShowAccessRestricted(false)}>
          <div className="bg-white rounded-3xl p-10 shadow-2xl w-full max-w-md mx-4 text-center space-y-6 border border-slate-100" onClick={e => e.stopPropagation()}>
            <div className="w-20 h-20 bg-red-50 rounded-2xl flex items-center justify-center mx-auto">
              <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Access Restricted</h2>
            <p className="text-gray-500 text-sm leading-relaxed">You don't have permission to view analytics. Please contact your administrator.</p>
            <button onClick={() => setShowAccessRestricted(false)} className="w-full py-3.5 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-2xl transition-all">Close</button>
          </div>
        </div>
      )}

      <div className="max-w-2xl w-full text-center space-y-8">

        {/* ✅ Clean Success Icon */}
        <div className="flex items-center justify-center">
         <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-[0_8px_25px_rgba(34,197,94,0.4)]">
       <svg
         xmlns="http://www.w3.org/2000/svg"
         className="w-8 h-8 text-white"
         fill="none"
         viewBox="0 0 23 23"
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
            onClick={handleViewAnalytics}
            className={`flex-1 px-6 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all active:scale-95 ${hasAnalyticsAccess ? "bg-green-500 hover:bg-emerald-600 text-white shadow-lg shadow-green-500/20" : "bg-gray-100 text-gray-300 cursor-not-allowed border border-gray-200"}`}
            disabled={!hasAnalyticsAccess}
            title={!hasAnalyticsAccess ? "View Analytics permission is disabled" : ""}
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
