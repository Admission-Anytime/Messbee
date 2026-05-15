import { useState } from "react";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import Chart from "react-apexcharts";
import { 
  Search, 
  Bell, 
  Settings, 
  ChevronDown,
  Calendar,
  LineChart,
  Send,
  CheckCircle2,
  Eye,
  TrendingUp,
  TrendingDown
} from "lucide-react";

const TemplateAnalytics = () => {
  const [dateRange, setDateRange] = useState([dayjs('2026-04-14'), dayjs('2026-04-20')]);
  const [sortBy, setSortBy] = useState("Daily");

  const inputSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: '12px', bgcolor: '#f1f5f9', height: '40px',
      '& fieldset': { borderColor: 'transparent' },
      '&:hover fieldset': { borderColor: '#10b981' },
      '&.Mui-focused fieldset': { borderColor: '#10b981' },
      '& .MuiInputBase-input': { fontWeight: 700, color: '#0f172a', fontSize: '0.813rem', padding: '0 10px' }
    }
  };

  // Chart options for Performance Tracking
  const chartOptions = {
    chart: {
      type: 'area',
      toolbar: { show: false },
      fontFamily: 'Urbanist, sans-serif',
      zoom: { enabled: false }
    },
    colors: ['#3b82f6', '#10b981', '#f43f5e'], // blue (Sent), green (Delivered), red (Read)
    dataLabels: {
      enabled: false
    },
    stroke: {
      width: 3,
      curve: 'smooth',
      lineCap: 'round'
    },
    markers: {
      size: 0,
      hover: {
        size: 6,
        sizeOffset: 3
      },
      colors: ['#fff'],
      strokeColors: ['#3b82f6', '#10b981', '#f43f5e'],
      strokeWidth: 3,
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.2,
        opacityTo: 0.05,
        stops: [0, 90, 100]
      }
    },
    xaxis: {
      categories: ['Apr 14', 'Apr 15', 'Apr 16', 'Apr 17', 'Apr 18', 'Apr 19', 'Apr 20'],
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: { 
        style: { colors: '#94a3b8', fontSize: '11px', fontWeight: 600 } 
      },
      crosshairs: {
        show: true,
        stroke: {
          color: '#e2e8f0',
          width: 1,
          dashArray: 4,
        },
      },
    },
    yaxis: {
      min: 0,
      max: 10000,
      tickAmount: 4,
      labels: { 
        formatter: (val) => val >= 1000 ? (val / 1000).toFixed(1) + 'k' : val,
        style: { colors: '#94a3b8', fontSize: '11px', fontWeight: 600 } 
      }
    },
    grid: {
      borderColor: '#f1f5f9',
      strokeDashArray: 4,
      yaxis: { lines: { show: true } },
      xaxis: { lines: { show: false } }
    },
    legend: {
      show: true,
      position: 'top',
      horizontalAlign: 'right',
      fontSize: '11px',
      fontWeight: 700,
      markers: { radius: 12, size: 5, offsetLeft: -5 },
      itemMargin: { horizontal: 15, vertical: 5 }
    },
    tooltip: {
      theme: 'light',
      shared: true,
      intersect: false,
      y: {
        formatter: (val) => val.toLocaleString()
      },
      style: {
        fontSize: '12px',
        fontFamily: 'Urbanist'
      }
    }
  };

  const chartSeries = [
    { name: 'SENT', data: [5000, 7500, 6000, 8500, 9500, 10000, 10000] },
    { name: 'DELIVERED', data: [4500, 6800, 5200, 7800, 8800, 9200, 9200] },
    { name: 'READ', data: [3800, 5200, 4500, 5800, 6500, 6800, 6800] }
  ];

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
    <div className="flex flex-col h-full bg-[#f8fafc] overflow-hidden font-['Urbanist']">
      
     
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6 lg:p-8 2xl:p-10">
        <div className="max-w-[1600px] mx-auto">
          
          {/* 2. HEADER SECTION */}
          <div className="mb-6 md:mb-8">
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 mb-1"> Template Analytics</h1>
            <p className="text-xs md:text-sm font-bold text-slate-400">Detailed performance metrics across communication channels</p>
          </div>

          {/* 3. FILTERS */}
          <div className="flex flex-wrap items-center gap-4 mb-8">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">SORT BY</span>
                <div className="bg-[#f1f5f9] rounded-xl px-3 py-2 flex items-center gap-1.5 min-w-[100px]">
                  <select 
                    value={sortBy} 
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full text-xs font-bold text-slate-900 focus:outline-none bg-transparent appearance-none cursor-pointer"
                  >
                    <option>Daily</option>
                    <option>Weekly</option>
                    <option>Monthly</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </div>
              </div>

              {/* Date Range Display */}
              <div className="bg-[#f1f5f9] rounded-xl px-3 py-2 flex items-center gap-2 min-w-[180px]">
                <Calendar className="w-4 h-4 text-slate-400" />
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

            <button className="ml-auto px-10 py-2.5 bg-[#10B981] text-white text-sm font-bold rounded-xl hover:bg-[#059669] transition-all shadow-lg shadow-[#10B981]/20">
              Apply Filter
            </button>
          </div>

          {/* 4. MAIN ANALYTICS CARDS */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
            
            {/* Template Engagement (Empty State) */}
            <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-100 shadow-sm p-6 md:p-8 flex flex-col min-h-[500px]">
              <div className="mb-8">
                <h3 className="text-lg font-black text-slate-900">Template Engagement</h3>
              </div>
              
              <div className="flex-1 flex flex-col">
                <div className="grid grid-cols-4 pb-4 border-b border-slate-50">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">TEMPLATE NAME</span>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">LANGUAGE</span>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">SENT</span>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">READ</span>
                </div>
                
                <div className="flex-1 flex flex-col items-center justify-center text-center px-10">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                    <LineChart className="w-8 h-8 text-slate-300" />
                  </div>
                  <h4 className="text-lg font-black text-slate-900 mb-2">No data available</h4>
                  <p className="text-xs font-bold text-slate-400 leading-relaxed">
                    No templates used in selected date range. Try adjusting your filters.
                  </p>
                </div>
              </div>
            </div>

            {/* Performance Tracking Chart */}
            <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-100 shadow-sm p-6 md:p-8 flex flex-col min-h-[500px]">
              <div className="mb-2">
                <h3 className="text-lg font-black text-slate-900">Performance Tracking</h3>
                <p className="text-xs font-bold text-slate-400">Real-time engagement velocity</p>
              </div>

              <div className="flex-1 relative mt-4">
                <Chart 
                  options={chartOptions} 
                  series={chartSeries} 
                  type="area" 
                  height="100%" 
                  width="100%"
                />
              </div>
            </div>
          </div>

          {/* 5. BOTTOM METRIC CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Total Sent */}
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center">
                  <Send className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">TOTAL SENT</p>
                  <h4 className="text-2xl font-black text-slate-900">24.8k</h4>
                </div>
              </div>
            </div>

            {/* Delivered */}
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">DELIVERED</p>
                  <div className="flex items-end gap-2">
                    <h4 className="text-2xl font-black text-slate-900">98.2%</h4>
                    <div className="flex items-center text-emerald-500 text-[10px] font-bold mb-1">
                      <TrendingUp className="w-3 h-3 mr-0.5" /> +0.4%
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Read Rate */}
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center">
                  <Eye className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">READ RATE</p>
                  <div className="flex items-end gap-2">
                    <h4 className="text-2xl font-black text-slate-900">42.1%</h4>
                    <div className="flex items-center text-rose-500 text-[10px] font-bold mb-1">
                      <TrendingDown className="w-3 h-3 mr-0.5" /> -1.2%
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
    </LocalizationProvider>
  );
};

export default TemplateAnalytics;
