import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import Chart from "react-apexcharts";
import { 
  Search, 
  Bell, 
  Settings, 
  FileText,
  Megaphone,
  ShieldCheck,
  ChevronRight,
  Layout,
  Send,
  Link2
} from "lucide-react";

const MessagesAnalytics = () => {
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState([dayjs('2026-04-19'), dayjs('2026-04-20')]);
  const [timeframe, setTimeframe] = useState("Daily");

  // Chart options for Performance Trend
  const chartOptions = {
    chart: {
      type: 'line',
      toolbar: { show: false },
      fontFamily: 'Urbanist, sans-serif',
      zoom: { enabled: false }
    },
    colors: ['#3b82f6', '#10b981'], // blue for Sent, green for Delivered
    stroke: {
      width: 2,
      curve: 'smooth'
    },
    xaxis: {
      categories: ['APR 19, 00:00', 'APR 19, 12:00', 'APR 20, 00:00', 'APR 20, 12:00', 'APR 20, 23:59'],
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: { 
        style: { colors: '#94a3b8', fontSize: '10px', fontWeight: 600 } 
      }
    },
    yaxis: {
      min: 0,
      max: 100,
      tickAmount: 4,
      labels: { 
        style: { colors: '#94a3b8', fontSize: '10px', fontWeight: 600 } 
      }
    },
    grid: {
      borderColor: '#f1f5f9',
      strokeDashArray: 4,
      yaxis: { lines: { show: true } }
    },
    legend: {
      position: 'top',
      horizontalAlign: 'right',
      fontSize: '10px',
      fontWeight: 700,
      markers: { radius: 12 },
      itemMargin: { horizontal: 10 }
    },
    tooltip: {
      theme: 'light',
      x: { show: true }
    }
  };

  const chartSeries = [
    { name: 'SENT', data: [20, 20, 20, 20, 20] }, // Mock baseline
    { name: 'DELIVERED', data: [30, 30, 30, 30, 30] } // Mock baseline
  ];

  return (
    <div className="flex flex-col h-full bg-[#f8fafc] overflow-hidden font-['Urbanist']">
      


      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6 lg:p-8 2xl:p-10">
        <div className="max-w-[1600px] mx-auto">
          
          {/* 2. HEADER SECTION */}
          <div className="mb-6 md:mb-8">
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 mb-1">Message Analytics</h1>
            <p className="text-xs md:text-sm font-bold text-slate-400">Detailed performance metrics across communication channels</p>
          </div>

          {/* 3. FILTERS */}
          <div className="flex flex-wrap items-center gap-4 mb-8">
            <div className="bg-white border border-slate-200 rounded-xl px-4 py-2 flex items-center gap-2 min-w-[120px]">
              <select 
                value={timeframe} 
                onChange={(e) => setTimeframe(e.target.value)}
                className="w-full text-xs font-bold text-slate-700 focus:outline-none bg-transparent appearance-none cursor-pointer"
              >
                <option>Daily</option>
                <option>Weekly</option>
                <option>Monthly</option>
              </select>
              <ChevronRight className="w-4 h-4 text-slate-400 rotate-90" />
            </div>

            <div className="bg-white border border-slate-200 rounded-xl px-4 py-2 flex items-center gap-3">
              <FileText className="w-4 h-4 text-[#10B981]" />
              <span className="text-xs font-bold text-slate-600">19 Apr 2026 – 20 Apr 2026</span>
            </div>

            <div className="flex items-center bg-slate-100 rounded-xl px-4 py-2 gap-2">
              <span className="text-xs font-bold text-slate-400">2026-04-19</span>
              <span className="text-slate-300">/</span>
              <span className="text-xs font-bold text-slate-400">2026-04-20</span>
            </div>

            <button className="ml-auto px-8 py-2.5 bg-[#10B981] text-white text-sm font-bold rounded-xl hover:bg-[#059669] transition-all shadow-lg shadow-[#10B981]/20">
              Apply Filter
            </button>
          </div>

          {/* 4. MAIN ANALYTICS CARDS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            
            {/* Data Distribution Table (Empty State) */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 md:p-8 flex flex-col min-h-[500px]">
              <div className="mb-6">
                <h3 className="text-lg font-black text-slate-900">Data Distribution</h3>
              </div>
              
              <div className="flex-1 flex flex-col">
                <div className="grid grid-cols-3 pb-4 border-b border-slate-50">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">DATE</span>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">SENT</span>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">DELIVERED</span>
                </div>
                
                <div className="flex-1 flex flex-col items-center justify-center text-center px-10">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                    <FileText className="w-8 h-8 text-slate-300" />
                  </div>
                  <h4 className="text-lg font-black text-slate-900 mb-2">No data available</h4>
                  <p className="text-xs font-bold text-slate-400 leading-relaxed">
                    Adjust your filter or timeframe to see message performance analytics.
                  </p>
                </div>
              </div>
            </div>

            {/* Performance Trend Chart (Empty State Style) */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 md:p-8 flex flex-col min-h-[500px]">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-lg font-black text-slate-900">Performance Trend</h3>
                  <p className="text-xs font-bold text-slate-400">Daily volume comparison</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    <span className="text-[10px] font-black text-slate-400 uppercase">SENT</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                    <span className="text-[10px] font-black text-slate-400 uppercase">DELIVERED</span>
                  </div>
                </div>
              </div>

              <div className="flex-1 relative mt-8">
                <Chart 
                  options={chartOptions} 
                  series={chartSeries} 
                  type="line" 
                  height="100%" 
                  width="100%"
                />
              </div>

              <div className="grid grid-cols-3 gap-4 pt-8 border-t border-slate-50">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">TOTAL SENT</p>
                  <p className="text-2xl font-black text-slate-900">0</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">TOTAL DELIVERED</p>
                  <p className="text-2xl font-black text-slate-900">0</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">SUCCESS RATE</p>
                  <p className="text-2xl font-black text-slate-900">0%</p>
                </div>
              </div>
            </div>
          </div>

          {/* 5. BOTTOM NAVIGATION CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div 
              onClick={() => navigate('/admin/analytic/campaign')}
              className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group cursor-pointer"
            >
              <div className="w-10 h-10 bg-emerald-50 text-[#10B981] rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Send className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-black text-slate-900 mb-1">Campaign Analysis</h4>
              <p className="text-[11px] font-bold text-slate-400 mb-4">Review active broadcast segments.</p>
              <div className="flex items-center text-[#10B981] text-[11px] font-black uppercase tracking-widest">
                View Details <ChevronRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            <div 
              onClick={() => navigate('/admin/analytic/template')}
              className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group cursor-pointer"
            >
              <div className="w-10 h-10 bg-emerald-50 text-[#10B981] rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Layout className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-black text-slate-900 mb-1">Template Performance</h4>
              <p className="text-[11px] font-bold text-slate-400 mb-4">Top converting message flows.</p>
              <div className="flex items-center text-[#10B981] text-[11px] font-black uppercase tracking-widest">
                View Details <ChevronRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            <div 
              onClick={() => navigate('/admin/integration/apps')}
              className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group cursor-pointer"
            >
              <div className="w-10 h-10 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Link2 className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-black text-slate-900 mb-1">API Integration</h4>
              <p className="text-[11px] font-bold text-slate-400 mb-4">Status of endpoint connections.</p>
              <div className="flex items-center text-[#10B981] text-[11px] font-black uppercase tracking-widest">
                View Details <ChevronRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default MessagesAnalytics;
