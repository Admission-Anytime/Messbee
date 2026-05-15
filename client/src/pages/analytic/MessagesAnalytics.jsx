import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import Chart from "react-apexcharts";
import { 
  FileText,
  ChevronDown,
  Calendar,
  Play,
  Star,
  Crosshair
} from "lucide-react";

const MessagesAnalytics = () => {
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState([dayjs('2026-04-19'), dayjs('2026-04-20')]);
  const [timeframe, setTimeframe] = useState("Daily");

  const inputSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: '12px', bgcolor: '#f1f5f9', height: '40px',
      '& fieldset': { borderColor: 'transparent' },
      '&:hover fieldset': { borderColor: '#10b981' },
      '&.Mui-focused fieldset': { borderColor: '#10b981' },
      '& .MuiInputBase-input': { fontWeight: 700, color: '#0f172a', fontSize: '0.813rem', padding: '0 10px' }
    }
  };

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
      show: false
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
    <LocalizationProvider dateAdapter={AdapterDayjs}>
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
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">SORT BY</span>
                <div className="bg-[#f1f5f9] rounded-xl px-3 py-2 flex items-center gap-1.5 min-w-[100px]">
                  <select 
                    value={timeframe} 
                    onChange={(e) => setTimeframe(e.target.value)}
                    className="w-full text-xs font-bold text-slate-900 focus:outline-none bg-transparent appearance-none cursor-pointer"
                  >
                    <option>Daily</option>
                    <option>Weekly</option>
                    <option>Monthly</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
                </div>
              </div>

              {/* Date Range Display */}
              <div className="bg-[#f1f5f9] rounded-xl px-3 py-2 flex items-center gap-2 min-w-[180px]">
                <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="text-xs font-bold text-slate-900">
                  {dateRange[0]?.format('DD-MM-YYYY')} — {dateRange[1]?.format('DD-MM-YYYY')}
                </span>
              </div>

              {/* From DatePicker */}
              <DatePicker
                value={dateRange[0]}
                onChange={(val) => setDateRange([val, dateRange[1]])}
                slotProps={{ textField: { sx: { width: 130, ...inputSx } } }}
              />

              <span className="text-slate-300 font-bold text-lg">/</span>

              {/* To DatePicker */}
              <DatePicker
                value={dateRange[1]}
                onChange={(val) => setDateRange([dateRange[0], val])}
                slotProps={{ textField: { sx: { width: 130, ...inputSx } } }}
              />
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

            {/* Campaign Analysis */}
            <div
              onClick={() => navigate('/admin/analytic/campaign')}
              className="bg-[#F1F5F9] border border-slate-200 rounded-2xl p-6 cursor-pointer hover:bg-slate-200/40 transition-all group"
            >
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center mb-5">
                <Play className="w-4 h-4 text-[#059669]" fill="#059669" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 mb-1.5">Campaign Analysis</h4>
              <p className="text-[13px] text-slate-500 mb-5 leading-snug">Review active broadcast segments.</p>
              <span className="text-sm font-semibold text-[#10B981]">View Details →</span>
            </div>

            {/* Template Performance */}
            <div
              onClick={() => navigate('/admin/analytic/template')}
              className="bg-[#F1F5F9] border border-slate-200 rounded-2xl p-6 cursor-pointer hover:bg-slate-200/40 transition-all group"
            >
              <div className="w-10 h-10 bg-slate-200 rounded-lg flex items-center justify-center mb-5">
                <Star className="w-4 h-4 text-slate-600" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 mb-1.5">Template Performance</h4>
              <p className="text-[13px] text-slate-500 mb-5 leading-snug">Top converting message flows.</p>
              <span className="text-sm font-semibold text-[#10B981]">View Details →</span>
            </div>

            {/* API Integration */}
            <div
              onClick={() => navigate('/admin/integration/apps')}
              className="bg-[#F1F5F9] border border-slate-200 rounded-2xl p-6 cursor-pointer hover:bg-slate-200/40 transition-all group"
            >
              <div className="w-10 h-10 bg-rose-100 rounded-lg flex items-center justify-center mb-5">
                <Crosshair className="w-4 h-4 text-rose-500" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 mb-1.5">API Integration</h4>
              <p className="text-[13px] text-slate-500 mb-5 leading-snug">Status of endpoint connections.</p>
              <span className="text-sm font-semibold text-[#10B981]">View Details →</span>
            </div>

          </div>

        </div>
      </div>
    </div>
    </LocalizationProvider>
  );
};

export default MessagesAnalytics;
