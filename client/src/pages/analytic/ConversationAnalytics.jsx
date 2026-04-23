import { useState } from "react";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import Chart from "react-apexcharts";
import { 
  FileText, 
  Megaphone, 
  Settings, 
  ShieldCheck, 
  UserRound,
  Download,
  Search,
  Bell,
  ChevronRight
} from "lucide-react";

const ConversationAnalytics = () => {
  const [view, setView] = useState("table"); // 'table' or 'chart'
  const [dateRange, setDateRange] = useState([dayjs('2023-10-01'), dayjs('2023-10-31')]);

  // Mock data for table
  const tableData = [
    { date: "Oct 01, 2023", marketing: { qty: 1240, cost: 1860 }, utility: { qty: 450, cost: 450 }, auth: { qty: 120, cost: 36 }, service: { qty: 890, cost: 0 }, totalConv: 2700, totalCharges: 2346 },
    { date: "Oct 02, 2023", marketing: { qty: 980, cost: 1470 }, utility: { qty: 520, cost: 520 }, auth: { qty: 145, cost: 43 }, service: { qty: 760, cost: 0 }, totalConv: 2405, totalCharges: 2033 },
    { date: "Oct 03, 2023", marketing: { qty: 1560, cost: 2340 }, utility: { qty: 310, cost: 310 }, auth: { qty: 88, cost: 26 }, service: { qty: 1120, cost: 0 }, totalConv: 3078, totalCharges: 2676 },
    { date: "Oct 04, 2023", marketing: { qty: 2100, cost: 3150 }, utility: { qty: 670, cost: 670 }, auth: { qty: 201, cost: 60 }, service: { qty: 940, cost: 0 }, totalConv: 3911, totalCharges: 3880 },
    { date: "Oct 05, 2023", marketing: { qty: 1850, cost: 2775 }, utility: { qty: 420, cost: 420 }, auth: { qty: 110, cost: 33 }, service: { qty: 1050, cost: 0 }, totalConv: 3430, totalCharges: 3228 },
    { date: "Oct 06, 2023", marketing: { qty: 1420, cost: 2130 }, utility: { qty: 580, cost: 580 }, auth: { qty: 130, cost: 39 }, service: { qty: 820, cost: 0 }, totalConv: 2950, totalCharges: 2749 },
    { date: "Oct 07, 2023", marketing: { qty: 1680, cost: 2520 }, utility: { qty: 490, cost: 490 }, auth: { qty: 150, cost: 45 }, service: { qty: 910, cost: 0 }, totalConv: 3230, totalCharges: 3055 },
    { date: "Oct 08, 2023", marketing: { qty: 1950, cost: 2925 }, utility: { qty: 610, cost: 610 }, auth: { qty: 170, cost: 51 }, service: { qty: 780, cost: 0 }, totalConv: 3510, totalCharges: 3586 },
    { date: "Oct 09, 2023", marketing: { qty: 1100, cost: 1650 }, utility: { qty: 380, cost: 380 }, auth: { qty: 90, cost: 27 }, service: { qty: 1200, cost: 0 }, totalConv: 2770, totalCharges: 2057 },
    { date: "Oct 10, 2023", marketing: { qty: 2300, cost: 3450 }, utility: { qty: 720, cost: 720 }, auth: { qty: 220, cost: 66 }, service: { qty: 850, cost: 0 }, totalConv: 4090, totalCharges: 4236 },
  ];

  // Mock data for chart
  const chartOptions = {
    chart: {
      type: 'bar',
      stacked: false,
      toolbar: { show: false },
      fontFamily: 'Urbanist, sans-serif'
    },
    colors: ['#3b82f6', '#10b981', '#60a5fa', '#f97316'], // blue, green, light blue, orange
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '55%',
        borderRadius: 4,
      },
    },
    dataLabels: { enabled: false },
    stroke: { show: true, width: 2, colors: ['transparent'] },
    xaxis: {
      categories: ['14 Apr', '15 Apr', '16 Apr', '17 Apr'],
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: { style: { colors: '#94a3b8', fontWeight: 600 } }
    },
    yaxis: {
      labels: { style: { colors: '#94a3b8', fontWeight: 600 } }
    },
    fill: { opacity: 1 },
    legend: {
      position: 'top',
      horizontalAlign: 'right',
      fontSize: '12px',
      fontWeight: 600,
      markers: { radius: 12 }
    },
    grid: {
      borderColor: '#f1f5f9',
      strokeDashArray: 4,
    }
  };

  if (!chartOptions) return null;

  const chartSeries = [
    { name: 'MARKETING', data: [44, 55, 41, 67] },
    { name: 'UTILITY', data: [13, 23, 20, 8] },
    { name: 'AUTH', data: [11, 17, 15, 15] },
    { name: 'SERVICE', data: [21, 7, 25, 13] }
  ];

  return (
    <div className="flex flex-col h-full bg-[#f8fafc] overflow-hidden font-['Urbanist']">
      


      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6 lg:p-8 2xl:p-10">
        <div className="max-w-[1800px] mx-auto">
          
          {/* 2. HEADER SECTION */}
          <div className="mb-6 md:mb-8">
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 mb-2"> Conversational Analytics</h1>
            <p className="text-xs md:text-sm font-bold text-slate-400">Detailed performance metrics across communication channels</p>
          </div>

          {/* 3. FILTERS & TOGGLE */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 w-full lg:w-auto">
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                  <div className="space-y-2 flex-1 sm:flex-none">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">From Date</p>
                    <DatePicker
                      value={dateRange[0]}
                      onChange={(val) => setDateRange([val, dateRange[1]])}
                      slotProps={{
                        textField: {
                          size: "small",
                          fullWidth: true,
                          sx: {
                            '& .MuiOutlinedInput-root': { borderRadius: '12px', bgcolor: 'white' }
                          }
                        }
                      }}
                    />
                  </div>
                  <div className="space-y-2 flex-1 sm:flex-none">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">To Date</p>
                    <DatePicker
                      value={dateRange[1]}
                      onChange={(val) => setDateRange([dateRange[0], val])}
                      slotProps={{
                        textField: {
                          size: "small",
                          fullWidth: true,
                          sx: {
                            '& .MuiOutlinedInput-root': { borderRadius: '12px', bgcolor: 'white' }
                          }
                        }
                      }}
                    />
                  </div>
                </div>
              </LocalizationProvider>
              
              {/* Toggle Button */}
              <div className="flex bg-[#f1f5f9] p-1 rounded-xl border border-slate-200 h-[40px] items-center w-full sm:w-auto">
                <button 
                  onClick={() => setView('table')}
                  className={`flex-1 sm:flex-none px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${view === 'table' ? 'bg-white text-[#10B981] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Table View
                </button>
                <button 
                  onClick={() => setView('chart')}
                  className={`flex-1 sm:flex-none px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${view === 'chart' ? 'bg-white text-[#10B981] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Chart View
                </button>
              </div>
            </div>

            <button className="w-full lg:w-auto px-10 py-2.5 bg-[#10B981] text-white text-sm font-bold rounded-xl hover:bg-[#059669] transition-all shadow-lg shadow-[#10B981]/20">
              Apply Filter
            </button>
          </div>

          {/* 4. MAIN CONTENT GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
            
            {/* Main Area (Table or Chart) */}
            <div className="lg:col-span-12 xl:col-span-9 2xl:col-span-10 space-y-6">
              {view === 'table' ? (
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full border-collapse min-w-[1000px] xl:min-w-0">
                      <thead>
                        <tr className="bg-gray-50">
                          <th rowSpan="2" className="px-2 md:px-4 py-3 text-[10px] md:text-[11px] font-bold text-gray-400 uppercase tracking-widest border-b-2 border-gray-100">Date</th>
                          <th colSpan="2" className="px-2 md:px-4 py-3 text-[10px] md:text-[11px] font-bold text-[#10B981] uppercase tracking-widest text-center border-b-2 border-gray-100 border-l border-gray-50">Marketing</th>
                          <th colSpan="2" className="px-2 md:px-4 py-3 text-[10px] md:text-[11px] font-bold text-emerald-600 uppercase tracking-widest text-center border-b-2 border-gray-100 border-l border-gray-50">Utility</th>
                          <th colSpan="2" className="px-2 md:px-4 py-3 text-[10px] md:text-[11px] font-bold text-rose-500 uppercase tracking-widest text-center border-b-2 border-gray-100 border-l border-gray-50">Auth</th>
                          <th colSpan="2" className="px-2 md:px-4 py-3 text-[10px] md:text-[11px] font-bold text-gray-500 uppercase tracking-widest text-center border-b-2 border-gray-100 border-l border-gray-50">Service</th>
                          <th rowSpan="2" className="px-2 md:px-4 py-3 text-[10px] md:text-[11px] font-bold text-gray-900 uppercase tracking-widest border-b-2 border-gray-100 border-l border-gray-50">Total Conv..</th>
                          <th rowSpan="2" className="px-2 md:px-4 py-3 text-[10px] md:text-[11px] font-bold text-gray-900 uppercase tracking-widest border-b-2 border-gray-100 border-l border-gray-50 whitespace-nowrap">Total Charges (INR)</th>
                        </tr>
                        <tr className="bg-gray-50">
                          {['Qty', 'Cost', 'Qty', 'Cost', 'Qty', 'Cost', 'Qty', 'Cost'].map((label, i) => (
                            <th key={i} className={`px-2 md:px-4 py-2 text-[10px] md:text-[11px] font-bold text-gray-400 uppercase text-center border-b-2 border-gray-100 ${i % 2 === 0 ? 'border-l border-gray-50' : ''}`}>{label}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {tableData.map((row, i) => (
                          <tr key={i} className="group border-b border-gray-50 hover:bg-slate-50 transition-colors duration-100 cursor-pointer">
                            <td className="px-2 md:px-4 py-3.5 text-xs md:text-sm text-gray-800 font-medium">{row.date}</td>
                            <td className="px-2 md:px-4 py-3.5 text-xs md:text-sm text-gray-800 text-center border-l border-gray-50">{row.marketing.qty.toLocaleString()}</td>
                            <td className="px-2 md:px-4 py-3.5 text-xs md:text-sm text-gray-800 text-center">₹{row.marketing.cost.toLocaleString()}</td>
                            <td className="px-2 md:px-4 py-3.5 text-xs md:text-sm text-gray-800 text-center border-l border-gray-50">{row.utility.qty.toLocaleString()}</td>
                            <td className="px-2 md:px-4 py-3.5 text-xs md:text-sm text-gray-800 text-center">₹{row.utility.cost.toLocaleString()}</td>
                            <td className="px-2 md:px-4 py-3.5 text-xs md:text-sm text-gray-800 text-center border-l border-gray-50">{row.auth.qty.toLocaleString()}</td>
                            <td className="px-2 md:px-4 py-3.5 text-xs md:text-sm text-gray-800 text-center">₹{row.auth.cost.toLocaleString()}</td>
                            <td className="px-2 md:px-4 py-3.5 text-xs md:text-sm text-gray-800 text-center border-l border-gray-50">{row.service.qty.toLocaleString()}</td>
                            <td className="px-2 md:px-4 py-3.5 text-xs md:text-sm text-gray-800 text-center">₹{row.service.cost.toLocaleString()}</td>
                            <td className="px-2 md:px-4 py-3.5 text-xs md:text-sm font-bold text-gray-900 border-l border-gray-50">{row.totalConv.toLocaleString()}</td>
                            <td className="px-2 md:px-4 py-3.5 text-xs md:text-sm font-bold text-[#10B981] border-l border-gray-50 whitespace-nowrap">₹{row.totalCharges.toLocaleString()}.00</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-4 md:p-8">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                      <h3 className="text-lg md:text-xl font-black text-slate-900">Conversation Volume</h3>
                      <p className="text-xs md:text-sm font-bold text-slate-400">Daily traffic categorized by intent</p>
                    </div>
                  </div>
                  <Chart options={chartOptions} series={chartSeries} type="bar" height={350} />
                </div>
              )}

              {/* Growth Opportunity Card (from chart image) */}
              {view === 'chart' && (
                <div className="bg-[#EBF5F0] rounded-3xl border border-[#D1FAE5] p-4 md:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-full flex items-center justify-center text-[#10B981] shadow-sm shrink-0">
                      <ShieldCheck className="w-5 h-5 md:w-6 md:h-6" />
                    </div>
                    <div>
                      <h4 className="text-xs md:text-sm font-black text-slate-900">Growth Opportunity Detected</h4>
                      <p className="text-[10px] md:text-xs font-bold text-slate-500">Your marketing campaigns are performing 15% better this week.</p>
                    </div>
                  </div>
                  <button className="w-full md:w-auto px-6 py-2 bg-white border border-slate-200 text-[#10B981] text-xs font-black rounded-xl hover:bg-slate-50 transition-all">
                    View Analysis
                  </button>
                </div>
              )}
            </div>

            {/* Right Sidebar - Summary Report */}
            <div className="lg:col-span-12 xl:col-span-3 2xl:col-span-2 space-y-6">
              <div className="bg-[#10B981] rounded-3xl p-6 text-white relative overflow-hidden shadow-xl shadow-[#10B981]/20">
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md">
                      <FileText className="w-5 h-5" />
                    </div>
                    <span className="px-3 py-1 bg-white/20 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-md">Report</span>
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-1">Total Conversations</p>
                  <h2 className="text-xl md:text-2xl font-black mb-4 tracking-tight">{view === 'table' ? '12,094' : '293'}</h2>
                  <div className="w-full h-px bg-white/20 mb-4"></div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-1">Total Charges</p>
                  <h2 className="text-xl md:text-2xl font-black tracking-tight">{view === 'table' ? '₹10,935.00' : '₹197.60'}</h2>
                </div>
                {/* Abstract shape decoration */}
                <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
              </div>

              {/* Breakdown Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-1 gap-4">
                {[
                  { title: 'Marketing', count: view === 'table' ? '5,880' : '208', charge: view === 'table' ? '₹1.50' : '₹197.60', totalCharge: view === 'table' ? '' : '₹197.60', icon: <Megaphone className="w-5 h-5" />, color: 'text-[#10B981]', bg: 'bg-[#f0fdf4]' },
                  { title: 'Utility', count: view === 'table' ? '1,950' : '0', charge: view === 'table' ? '₹1.00' : '₹0.00', icon: <Settings className="w-5 h-5" />, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                  { title: 'Authentication', count: view === 'table' ? '554' : '0', charge: view === 'table' ? '₹0.30' : '₹0.00', icon: <ShieldCheck className="w-5 h-5" />, color: 'text-rose-500', bg: 'bg-rose-50' },
                  { title: 'Service', count: view === 'table' ? '3,710' : '85', charge: view === 'table' ? '₹0.00' : '₹0.00', icon: <UserRound className="w-5 h-5" />, color: 'text-slate-500', bg: 'bg-slate-50' },
                ].map((item, i) => (
                  <div key={i} className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all group">
                    <div className="flex items-center gap-4 mb-4">
                      <div className={`w-10 h-10 ${item.bg} ${item.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                        {item.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{item.title}</p>
                        </div>
                        <p className="text-base md:text-lg font-black text-slate-800">{item.count} <span className="text-[10px] text-slate-400 font-bold ml-1">items</span></p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                      <p className="text-[10px] font-bold text-slate-400">Avg Charge</p>
                      <p className={`text-xs md:text-sm font-black ${item.color}`}>{item.charge}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Export Button */}
              <button className="w-full py-4 bg-white border border-slate-200 text-slate-700 text-xs font-black rounded-2xl hover:bg-slate-50 transition-all flex items-center justify-center gap-2 shadow-sm">
                <Download className="w-4 h-4" /> Export Detailed Report
              </button>

              {/* Pricing Link (from chart image) */}
              <div className="bg-[#064e3b] rounded-3xl p-6 text-white cursor-pointer group hover:bg-[#065f46] transition-all">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[8px] font-black uppercase tracking-widest text-white/50 mb-1">Pricing Details</p>
                    <p className="text-sm font-black">WhatsApp Conversation Pricing</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-white/50 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ConversationAnalytics;
