import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

// --- CONTEXT ---
import { userContext } from "../context/Context";

import {
   ArrowPathIcon,
   WalletIcon,
   BookOpenIcon,
   PlayCircleIcon,
   LifebuoyIcon,
   TicketIcon,
   LightBulbIcon,
} from "@heroicons/react/24/outline";
import { CheckCircleIcon } from "@heroicons/react/24/solid";

function Dashboard() {
   const navigate = useNavigate();
   const { user } = useContext(userContext);
   const [isSyncing, setIsSyncing] = useState(false);

   // --- DATE STATE ---
   const [selectedDate, setSelectedDate] = useState(dayjs());
   const [dateString, setDateString] = useState(dayjs().format("YYYY-MM-DD"));

   const [performanceData, setPerformanceData] = useState({
      chats: 217,
      unread: 31,
      open: 71,
      failed: 0,
      free: 13,
      agents: 4
   });

   const handleDateChange = (date) => {
      setSelectedDate(date);
      setDateString(date.format("YYYY-MM-DD"));
      setIsSyncing(true);

      setTimeout(() => {
         setPerformanceData({
            chats: Math.floor(Math.random() * 500) + 100,
            unread: Math.floor(Math.random() * 50),
            open: Math.floor(Math.random() * 100),
            failed: Math.floor(Math.random() * 5),
            free: Math.floor(Math.random() * 20),
            agents: 4
         });
         setIsSyncing(false);
      }, 800);
   };

   const handleSyncData = () => {
      setIsSyncing(true);
      setTimeout(() => { setIsSyncing(false); }, 2000);
   };

   return (
      <div className="p-4 md:p-6 lg:p-8 max-w-[1400px] mx-auto flex flex-col gap-6 h-full font-['Urbanist']">

         {/* 1. TOP PROFILE CARD */}
         <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            {/* Header Section: Flex Wrap added for responsiveness */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">

               {/* User Info */}
               <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full lg:w-auto">
                  <div className="w-16 h-16 bg-gradient-to-br from-teal-100 to-teal-50 rounded-xl border border-teal-100 flex items-center justify-center shrink-0">
                     <svg className="w-8 h-8 text-teal-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  </div>
                  <div>
                     <h2 className="text-xl font-bold text-slate-900 flex flex-wrap items-center gap-2">
                        Admission Anytime
                        <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded uppercase font-bold tracking-wider border border-slate-200 whitespace-nowrap">Official API</span>
                     </h2>
                     <p className="text-sm text-slate-500 font-medium">+91 1202611111</p>
                  </div>
               </div>

               {/* Action Buttons: Stack on mobile, row on desktop */}
               <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                  <button onClick={() => navigate('/admin/profile/business')} className="w-full sm:w-auto px-5 py-2.5 bg-[#1e293b] text-white text-sm font-bold rounded-lg hover:bg-slate-800 transition-colors shadow-sm text-center">
                     Update Profile
                  </button>
                  <button onClick={handleSyncData} disabled={isSyncing} className="w-full sm:w-auto px-5 py-2.5 bg-white text-slate-700 border border-slate-200 text-sm font-bold rounded-lg hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-70">
                     <ArrowPathIcon className={`w-4 h-4 ${isSyncing ? "animate-spin text-blue-600" : ""}`} />
                     {isSyncing ? "Syncing..." : "Sync Data"}
                  </button>
               </div>
            </div>

            {/* Stats Grid: Better spacing for small screens */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-gray-100">
               <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Message Limit Tier</p>
                  <p className="text-xl font-bold text-slate-800">10,000 <span className="text-sm font-medium text-slate-400">/ day</span></p>
               </div>
               <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Quality Score</p>
                  <p className="text-xl font-bold text-emerald-500 flex items-center gap-2">
                     High <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  </p>
               </div>
               <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Connection Status</p>
                  <p className="text-xl font-bold text-slate-800 flex items-center gap-2">
                     Connected <CheckCircleIcon className="w-5 h-5 text-emerald-500" />
                  </p>
               </div>
            </div>
         </div>

         {/* 2. BALANCE & SUBSCRIPTION */}
         <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

            {/* Card 1: Balance */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col justify-between relative overflow-hidden h-full">
               <div className="absolute top-6 right-6 text-slate-300"><WalletIcon className="w-6 h-6" /></div>
               <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Available Balance</p>
                  <div className="flex flex-wrap items-baseline gap-2 mb-1">
                     <h3 className="text-3xl font-black text-slate-900">₹{(user?.wccCredit !== undefined ? user.wccCredit : 618.51).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h3>
                     <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1 whitespace-nowrap"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Auto-recharge on</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Estimated 14 days of usage remaining based on current volume.</p>
               </div>
               <div className="flex flex-col sm:flex-row gap-3 mt-8">
                  <button onClick={() => navigate('/admin/plan/addons')} className="w-full sm:flex-1 py-2.5 bg-[#1e293b] text-white text-sm font-bold rounded-lg hover:bg-slate-800 transition-colors shadow-sm text-center">Add Credit</button>
                  <button onClick={() => navigate('/admin/plan/statement')} className="w-full sm:w-auto px-5 py-2.5 bg-white text-slate-700 border border-slate-200 text-sm font-bold rounded-lg hover:bg-slate-50 transition-colors text-center">Statement</button>
               </div>
            </div>

            {/* Card 2: Subscription */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col justify-between h-full">
               <div className="flex flex-wrap justify-between items-start mb-4 gap-2">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider pt-1">Active Subscription</p>
                  <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded border border-slate-200 whitespace-nowrap">ENTERPRISE PLAN</span>
               </div>
               <div className="mb-6">
                  <h3 className="text-3xl font-black text-slate-900 mb-1">76 Days <span className="text-lg font-medium text-slate-400">remaining</span></h3>
                  <p className="text-xs text-slate-400 mb-4">Next billing cycle starts April 28, 2026.</p>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full mb-1 overflow-hidden">
                     <div className="h-full bg-slate-800 w-[60%] rounded-full"></div>
                  </div>
               </div>
               <button onClick={() => navigate('/admin/plan/overview')} className="w-full py-2.5 bg-white text-slate-700 border border-slate-200 text-sm font-bold rounded-lg hover:bg-slate-50 transition-colors">Manage Subscription</button>
            </div>
         </div>

         {/* 3. PERFORMANCE CARD */}
         <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">

            {/* Header Row: Wrap on mobile */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
               <div>
                  <h3 className="text-lg font-bold text-slate-900">Performance Overview</h3>
                  <p className="text-xs text-slate-400 mt-1">
                     Showing data for: <span className="font-semibold text-slate-600">{dateString === dayjs().format("YYYY-MM-DD") ? "Today" : dateString}</span>
                  </p>
               </div>

               <div className="flex w-full md:w-auto items-center gap-3">
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                     <DatePicker
                        value={selectedDate}
                        onChange={handleDateChange}
                        format="MMMM DD, YYYY"
                        slotProps={{
                           textField: {
                              size: "small",
                              sx: {
                                 width: { xs: '100%', md: 240 },
                                 '& .MuiOutlinedInput-root': {
                                    fontFamily: 'Urbanist',
                                    fontWeight: 500,
                                    backgroundColor: '#F8FAFC',
                                    '&:hover fieldset': {
                                       borderColor: '#34D399',
                                    },
                                    '&.Mui-focused fieldset': {
                                       borderColor: '#10B981',
                                    },
                                 },
                              },
                           },
                        }}
                     />
                  </LocalizationProvider>

                  <button onClick={handleSyncData} className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100 transition-colors shrink-0">
                     <ArrowPathIcon className={`w-5 h-5 ${isSyncing ? "animate-spin text-[#10B981]" : ""}`} />
                  </button>
               </div>
            </div>

            {/* Stats Grid: Responsive Columns */}
            <div className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 transition-opacity duration-300 ${isSyncing ? "opacity-50" : "opacity-100"}`}>
               <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Chats</p>
                  <p className="text-2xl font-black text-slate-800">{performanceData.chats} <span className="text-xs font-bold text-emerald-500">↗ 12%</span></p>
               </div>
               <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Unread</p>
                  <p className="text-2xl font-black text-slate-800">{performanceData.unread} <span className="text-xs font-bold text-amber-500">↘ 5%</span></p>
               </div>
               <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Open Cases</p>
                  <p className="text-2xl font-black text-slate-800">{performanceData.open} <span className="text-xs font-bold text-slate-400">~ 0%</span></p>
               </div>
               <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Failed</p>
                  <p className="text-2xl font-black text-slate-800">{performanceData.failed} <span className="text-xs font-bold text-emerald-500">↘ 0%</span></p>
               </div>
               <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Free Tier</p>
                  <p className="text-2xl font-black text-slate-800">{performanceData.free} <span className="text-xs font-medium text-slate-400">/ 1k</span></p>
               </div>
               <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Agents</p>
                  <p className="text-2xl font-black text-slate-800">{performanceData.agents} <span className="text-xs font-bold text-emerald-500 uppercase">Active</span></p>
               </div>
            </div>
         </div>

         {/* 4. HELP & RESOURCES: Stack on mobile */}
         <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            <div onClick={() => navigate('/admin/help/docs')} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col justify-between hover:border-blue-200 transition-colors cursor-pointer group h-full">
               <div>
                  <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"><BookOpenIcon className="w-6 h-6" /></div>
                  <h4 className="font-bold text-slate-800 mb-2">Technical Documentation</h4>
                  <p className="text-sm text-slate-500 leading-relaxed">Access our comprehensive API references and integration SDKs.</p>
               </div>
               <div className="mt-6 flex items-center text-xs font-bold text-slate-800">Browse Docs <span className="ml-2">→</span></div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col justify-between hover:border-purple-200 transition-colors cursor-pointer group h-full">
               <div>
                  <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"><PlayCircleIcon className="w-6 h-6" /></div>
                  <h4 className="font-bold text-slate-800 mb-2">Video Tutorials</h4>
                  <p className="text-sm text-slate-500 leading-relaxed">Quick walkthroughs for common workflows and configurations.</p>
               </div>
               <div className="mt-6 flex items-center text-xs font-bold text-slate-800">Watch Lessons <span className="ml-2">→</span></div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col justify-between h-full">
               <div>
                  <div className="flex items-center gap-2 mb-3"><LifebuoyIcon className="w-5 h-5 text-slate-700" /><h4 className="font-bold text-slate-800">Need Assistance?</h4></div>
                  <p className="text-sm text-slate-500 leading-relaxed mb-6">Our technical support engineers are available Monday to Friday for integration assistance.</p>
               </div>
               <div className="space-y-3 mt-auto">
                  <button onClick={() => navigate('/admin/help/support')} className="w-full py-2.5 bg-[#1e293b] text-white text-sm font-bold rounded-lg hover:bg-slate-800 transition-colors shadow-sm flex items-center justify-center gap-2"><TicketIcon className="w-4 h-4" /> Open Support Ticket</button>
                  <button className="w-full py-2.5 bg-white text-slate-700 border border-slate-200 text-sm font-bold rounded-lg hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"><LightBulbIcon className="w-4 h-4" /> Request Feature</button>
               </div>
            </div>
         </div>

         {/* 5. FOOTER */}
         <div className="mt-auto pt-10 pb-4 flex flex-col-reverse md:flex-row justify-between items-center text-xs text-slate-400 font-medium border-t border-slate-100 gap-4">
            <p>&copy; 2026 whatsapp API Platform. All rights reserved @ MessBee.</p>
            <div className="flex gap-6">
               <a href="#" className="hover:text-slate-600 transition-colors">Privacy Policy</a>
               <a href="#" className="hover:text-slate-600 transition-colors">Terms of Service</a>
               <a href="#" className="hover:text-slate-600 transition-colors">API Status</a>
            </div>
         </div>

      </div>
   );
}

export default Dashboard;