import React from "react";
import FirstHeader from "../components/header/FirstHeader";
import MainHeading from "../components/header/MainHeading";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { 
  BellAlertIcon, 
  ServerIcon, 
  CreditCardIcon
} from "@heroicons/react/24/outline";

// --- PROFESSIONAL DATA ---
const notificationLog = [
  { type: "info", title: "API Usage Update", body: "WhatsApp Official API v2.4 is now live. Check documentation.", date: "Today, 09:00 AM" },
  { type: "alert", title: "Scheduled Maintenance", body: "System maintenance on Sunday (12:00 AM - 02:00 AM).", date: "Yesterday" },
  { type: "success", title: "Team Roles Enabled", body: "You can now assign 'Manager' and 'Analyst' roles.", date: "Feb 10" },
  { type: "info", title: "Analytics Module", body: "New dashboard widgets are available in Reports.", date: "Feb 08" },
  { type: "info", title: "Billing Cycle", body: "Your next billing cycle starts on the 1st of March.", date: "Feb 05" },
];

function Dashboard() {
  return (
    <div className="flex flex-col h-full bg-[#f8fafc] font-['Urbanist'] overflow-hidden">
      
      {/* --- HEADER --- */}
      <div className="shrink-0 z-20 bg-white border-b border-gray-200 shadow-sm">
          <FirstHeader />
          <MainHeading />
      </div>
      
      {/* --- SCROLLABLE WORKSPACE --- */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
        <div className="max-w-[1600px] mx-auto flex flex-col gap-6">
          
          {/* ==================== TOP ROW: GRID SYSTEM ==================== */}
          {/* Mobile: 1 Col | Tablet: 2 Cols | Desktop: 3 Cols */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            
            {/* --- PANEL 1: SYSTEM NOTIFICATIONS --- */}
            {/* Spans 1 column normally. On large tablets/small laptops, it height matches others */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col overflow-hidden h-[400px] xl:h-[450px]">
              <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 shrink-0">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <BellAlertIcon className="w-5 h-5 text-slate-500" />
                  System Notifications
                </h3>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Log</span>
              </div>
              <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
                <div className="flex flex-col">
                  {notificationLog.map((item, index) => (
                    <div key={index} className="p-3 hover:bg-slate-50 rounded-lg transition-colors border-b border-gray-50 last:border-0 cursor-default group">
                      <div className="flex justify-between items-start mb-1">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${
                          item.type === 'alert' ? 'bg-amber-50 text-amber-700 border-amber-100' : 
                          item.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                          'bg-blue-50 text-blue-700 border-blue-100'
                        }`}>
                          {item.type === 'alert' ? 'Maintenance' : item.type === 'success' ? 'Feature' : 'Update'}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">{item.date}</span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-700 mt-1">{item.title}</h4>
                      <p className="text-xs text-slate-500 leading-relaxed mt-0.5 line-clamp-2">
                        {item.body}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* --- PANEL 2: RESOURCE UTILIZATION --- */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col h-[400px] xl:h-[450px]">
              <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 shrink-0">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <ServerIcon className="w-5 h-5 text-slate-500" />
                  Resource Utilization
                </h3>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-xs font-bold text-emerald-700">Online</span>
                </div>
              </div>
              
              <div className="p-6 flex flex-col justify-center flex-1 gap-6">
                
                {/* Tier Usage Widget */}
                <div className="bg-slate-50 rounded-xl p-5 border border-slate-100 shadow-inner">
                   <div className="flex justify-between items-end mb-3">
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Tier Usage (Dec)</p>
                        <p className="text-lg font-black text-slate-800">5 <span className="text-sm font-medium text-slate-400">/ 1000 msgs</span></p>
                      </div>
                      <span className="text-[10px] font-bold text-slate-500 bg-white px-2 py-1 rounded shadow-sm border border-slate-100">0.5% Used</span>
                   </div>
                   <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-slate-800 w-[1%] rounded-full transition-all duration-1000"></div>
                   </div>
                </div>

                {/* KPI Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition-colors">
                     <p className="text-xs text-slate-400 font-medium mb-1">Unread Chats</p>
                     <p className="text-xl font-bold text-slate-700">0</p>
                  </div>
                  <div className="p-3 rounded-lg border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition-colors">
                     <p className="text-xs text-slate-400 font-medium mb-1">Unassigned</p>
                     <p className="text-xl font-bold text-slate-700">0</p>
                  </div>
                  <div className="p-3 rounded-lg border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition-colors">
                     <p className="text-xs text-slate-400 font-medium mb-1">Active Agents</p>
                     <p className="text-xl font-bold text-emerald-600">2</p>
                  </div>
                  <div className="p-3 rounded-lg border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition-colors">
                     <p className="text-xs text-slate-400 font-medium mb-1">Campaigns</p>
                     <p className="text-xl font-bold text-slate-700">0</p>
                  </div>
                </div>
              </div>
            </div>

            {/* --- PANEL 3: CALENDAR --- */}
            {/* Tablet: Spans 2 cols to fill row. Desktop: 1 col */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex items-center justify-center p-4 md:col-span-2 xl:col-span-1 h-[400px] xl:h-[450px]">
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DateCalendar 
                    views={['day']} 
                    showDaysOutsideCurrentMonth
                    sx={{
                      width: '100%',
                      maxWidth: '350px', // Prevents it from getting too huge on tablets
                      '& .MuiPickersCalendarHeader-root': { marginTop: '0px' },
                      '& .MuiTypography-root': { fontWeight: '700', fontSize: '0.9rem', fontFamily: 'Urbanist' },
                      '& .MuiPickersDay-root': { fontFamily: 'Urbanist', fontSize: '0.9rem', fontWeight: '600' },
                      '& .MuiPickersDay-root.Mui-selected': { backgroundColor: '#1e293b !important' },
                      '& .MuiPickersDay-today': { borderColor: '#1e293b !important' }
                    }}
                  />
                </LocalizationProvider>
            </div>

          </div>

          {/* ==================== BOTTOM ROW: WCC WALLET ==================== */}
          <div className="w-full bg-white rounded-xl border border-gray-200 shadow-sm p-5 md:p-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
             
             {/* Text Section */}
             <div className="flex items-start gap-4">
                <div className="p-3 bg-teal-50 text-teal-600 rounded-lg border border-teal-100 hidden sm:block shrink-0">
                  <CreditCardIcon className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800">Business Wallet (WCC)</h3>
                  <p className="text-sm text-slate-500 mt-1 max-w-lg">
                    Manage your conversation credits. Low balance may affect automated campaigns.
                  </p>
                </div>
             </div>

             {/* Balance & Action Section - Wraps on small screens */}
             <div className="flex flex-wrap items-center gap-4 sm:gap-8 w-full lg:w-auto bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div className="flex-1 lg:text-right min-w-[120px]">
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Current Balance</p>
                   <p className="text-2xl font-black text-slate-800">₹10,000<span className="text-lg text-slate-400">.00</span></p>
                </div>
                <div className="hidden sm:block h-10 w-px bg-slate-200 mx-2"></div>
                <button className="flex-1 sm:flex-none bg-[#ba2525] hover:bg-[#a01f1f] text-white px-6 py-3 rounded-lg text-sm font-bold shadow-md shadow-red-100 transition-all active:scale-95 whitespace-nowrap">
                   + Add Funds
                </button>
             </div>

          </div>

        </div>
      </div>
    </div>
  );
}

export default Dashboard;