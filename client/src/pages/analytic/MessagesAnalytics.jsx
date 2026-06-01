import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import weekOfYear from "dayjs/plugin/weekOfYear";
import advancedFormat from "dayjs/plugin/advancedFormat";

dayjs.extend(weekOfYear);
dayjs.extend(advancedFormat);

import Chart from "react-apexcharts";
import { 
  FileText,
  ChevronDown,
  Calendar,
  Play,
  Star,
  Crosshair,
  Loader2,
  AlertCircle
} from "lucide-react";
import AnalyticsApi from "../../services/AnalyticsApi";

// ─── helpers ────────────────────────────────────────────────────────────────
const fmt = (n) => {
  if (n === undefined || n === null) return "0";
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "k";
  return String(n);
};

const defaultRangeFor = (mode) => {
  const end = dayjs();
  if (mode === "Weekly")  return [end.subtract(12, "week"),  end];
  if (mode === "Monthly") return [end.subtract(12, "month"), end];
  return [end.subtract(30, "day"), end]; // Daily
};

const getInitialSort = () => {
  return localStorage.getItem("messages_analytics_sortBy") || "Daily";
};

const MessagesAnalytics = () => {
  const navigate = useNavigate();
  const initialSort = getInitialSort();
  
  const [timeframe, setTimeframe] = useState(initialSort);
  const [dateRange, setDateRange] = useState(defaultRangeFor(initialSort));

  const [appliedTimeframe, setAppliedTimeframe] = useState(initialSort);
  const [appliedDateRange, setAppliedDateRange] = useState(defaultRangeFor(initialSort));

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [summary, setSummary] = useState({
    totalSent: 0,
    totalDelivered: 0,
    successRate: 0,
  });

  const groupByMap = { Daily: "daily", Weekly: "weekly", Monthly: "monthly" };

  const fetchData = useCallback(async (range, group) => {
    const r = range || dateRange;
    let g = group || groupByMap[timeframe];

    // Smart groupBy: if Monthly selected but start & end are in the same month,
    // auto-switch to daily so we get a meaningful day-by-day breakdown
    if (g === 'monthly' && r[0] && r[1]) {
      const sameMonth = r[0].format('YYYY-MM') === r[1].format('YYYY-MM');
      if (sameMonth) g = 'daily';
    }
    // Similarly, if Weekly selected but range is within the same week, use daily
    if (g === 'weekly' && r[0] && r[1]) {
      const sameWeek = r[0].startOf('week').format('YYYY-MM-DD') === r[1].startOf('week').format('YYYY-MM-DD');
      if (sameWeek) g = 'daily';
    }

    setLoading(true);
    setError(null);
    try {
      const res = await AnalyticsApi.getMessageAnalytics({
        startDate: r[0]?.format("YYYY-MM-DD"),
        endDate:   r[1]?.format("YYYY-MM-DD"),
        groupBy:   g,
      });
      if (res.success) {
        setChartData(res.data.chartData || []);
        setSummary(res.data.summary || { totalSent: 0, totalDelivered: 0, successRate: 0 });
        
        setAppliedDateRange(r);
        // Store the effective groupBy used (may differ from user-selected timeframe)
        const fetchedMode = Object.keys(groupByMap).find(k => groupByMap[k] === g) || "Daily";
        setAppliedTimeframe(fetchedMode);
        localStorage.setItem("messages_analytics_sortBy", timeframe);
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load analytics.");
    } finally {
      setLoading(false);
    }
  }, [dateRange, timeframe]);

  useEffect(() => { fetchData(); }, []);

  const handleTimeframeChange = (newMode) => {
    setTimeframe(newMode);
    const newRange = defaultRangeFor(newMode);
    setDateRange(newRange);
  };

  const filledChartData = (() => {
    const start = appliedDateRange[0];
    const end   = appliedDateRange[1];
    if (!start || !end) return chartData;

    const lookup = {};
    chartData.forEach((d) => { lookup[d.date] = d; });

    const buckets = [];

    if (appliedTimeframe === "Monthly") {
      let cur = start.startOf("month");
      while (cur.isBefore(end.endOf("month"))) {
        const key = cur.format("YYYY-MM");
        buckets.push(lookup[key] || { date: key, sent: 0, delivered: 0 });
        cur = cur.add(1, "month");
      }
    } else if (appliedTimeframe === "Weekly") {
      let cur = start.startOf("week");
      while (cur.isBefore(end.endOf("week"))) {
        const key = cur.format("YYYY-ww");
        const altKey = `${cur.format("YYYY")}-${cur.format("ww")}`;
        const found  = lookup[key] || lookup[altKey] || null;
        buckets.push(found || { date: key, sent: 0, delivered: 0 });
        cur = cur.add(1, "week");
      }
    } else {
      let cur = start.startOf("day");
      while (cur.isBefore(end.add(1, "day").startOf("day"))) {
        const key = cur.format("YYYY-MM-DD");
        buckets.push(lookup[key] || { date: key, sent: 0, delivered: 0 });
        cur = cur.add(1, "day");
      }
    }
    return buckets;
  })();

  const totalBuckets = filledChartData.length;
  const labelStep    = totalBuckets > 14 ? Math.ceil(totalBuckets / 14) : 1;

  const categories = filledChartData.map((d, i) => {
    if (i % labelStep !== 0) return "";
    if (appliedTimeframe === "Monthly") return dayjs(d.date + "-01").format("MMM YY");
    if (appliedTimeframe === "Weekly")  return `Wk ${d.date.split("-")[1]}`;
    return dayjs(d.date).format("MMM D");
  });

  const chartOptions = {
    chart: {
      type: "area",
      toolbar: { show: false },
      fontFamily: "Urbanist, sans-serif",
      zoom: { enabled: false },
      animations: { enabled: true, speed: 800, easing: "easeinout" },
      background: "transparent",
    },
    colors: ["#3b82f6", "#10b981"],
    dataLabels: { enabled: false },
    stroke: { width: 2.5, curve: "smooth", lineCap: "round" },
    markers: {
      size: 0,
      colors: ["#fff"],
      strokeColors: ["#3b82f6", "#10b981"],
      strokeWidth: 2,
      hover: { size: 6, sizeOffset: 2 },
    },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.35,
        opacityTo: 0.02,
        stops: [0, 85, 100],
      },
    },
    xaxis: {
      categories: categories.length ? categories : ["No data"],
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: { style: { colors: "#94a3b8", fontSize: "11px", fontWeight: 600 } },
      crosshairs: { show: true, stroke: { color: "#e2e8f0", width: 1, dashArray: 4 } },
    },
    yaxis: {
      min: 0,
      labels: {
        formatter: (v) => fmt(v),
        style: { colors: "#94a3b8", fontSize: "11px", fontWeight: 600 },
      },
    },
    grid: {
      borderColor: "#f1f5f9",
      strokeDashArray: 4,
      padding: { left: 5, right: 5 },
      yaxis: { lines: { show: true } },
      xaxis: { lines: { show: false } },
    },
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "right",
      fontSize: "11px",
      fontWeight: 700,
      markers: { radius: 12, size: 5, offsetLeft: -5 },
      itemMargin: { horizontal: 15, vertical: 5 },
    },
    tooltip: {
      theme: "light",
      shared: true,
      intersect: false,
      y: { formatter: (v) => v?.toLocaleString() },
      style: { fontSize: "12px", fontFamily: "Urbanist" },
    },
    noData: { text: "No message data in range", style: { color: "#94a3b8", fontSize: "13px" } },
  };

  const chartSeries = [
    { name: 'SENT', data: filledChartData.map(d => d.sent) },
    { name: 'DELIVERED', data: filledChartData.map(d => d.delivered) }
  ];

  const inputSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: '12px', bgcolor: '#f1f5f9', height: '40px',
      '& fieldset': { borderColor: 'transparent' },
      '&:hover fieldset': { borderColor: '#10b981' },
      '&.Mui-focused fieldset': { borderColor: '#10b981' },
      '& .MuiInputBase-input': { fontWeight: 700, color: '#0f172a', fontSize: '0.813rem', padding: '0 10px' }
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
    <div className="flex flex-col h-full bg-[#f8fafc] overflow-hidden font-['Urbanist']">

      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6 lg:p-8 2xl:p-10">
        <div className="max-w-[1600px] mx-auto">
          
          {/* HEADER SECTION */}
          <div className="mb-6 md:mb-8 flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-center">
              <FileText className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800 tracking-tight">Message Analytics</h1>
              <p className="text-xs text-slate-400 font-medium mt-0.5">Detailed performance metrics across communication channels</p>
            </div>
          </div>

          {/* FILTERS */}
          <div className="flex flex-wrap items-center gap-4 mb-8">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">SORT BY</span>
                <div className="relative bg-[#f1f5f9] rounded-xl min-w-[100px]">
                  <select 
                    value={timeframe} 
                    onChange={(e) => handleTimeframeChange(e.target.value)}
                    className="w-full text-xs font-bold text-slate-900 focus:outline-none bg-transparent appearance-none cursor-pointer py-2 pl-3 pr-8"
                  >
                    <option>Daily</option>
                    <option>Weekly</option>
                    <option>Monthly</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
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

            <button 
              onClick={() => fetchData()}
              disabled={loading}
              className="ml-auto px-8 py-2.5 bg-[#10B981] text-white text-sm font-bold rounded-xl hover:bg-[#059669] transition-all shadow-lg shadow-[#10B981]/20 flex items-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Apply Filter
            </button>
          </div>

          {/* ERROR BANNER */}
          {error && (
            <div className="mb-6 bg-rose-50 border border-rose-100 rounded-2xl p-4 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />
              <p className="text-sm font-bold text-rose-600">{error}</p>
            </div>
          )}

          {/* MAIN ANALYTICS CARDS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            
            {/* Data Distribution Table */}
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
                
                {loading ? (
                  <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
                  </div>
                ) : filledChartData.every(d => d.sent === 0 && d.delivered === 0) ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center px-10">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                      <FileText className="w-8 h-8 text-slate-300" />
                    </div>
                    <h4 className="text-lg font-black text-slate-900 mb-2">No data available</h4>
                    <p className="text-xs font-bold text-slate-400 leading-relaxed">
                      Adjust your filter or timeframe to see message performance analytics.
                    </p>
                  </div>
                ) : (
                  <div className="flex-1 overflow-y-auto divide-y divide-slate-50 mt-1">
                    {filledChartData.filter(row => row.sent > 0 || row.delivered > 0).map((row, i) => (
                      <div
                        key={i}
                        className="grid grid-cols-3 py-3 hover:bg-slate-50 rounded-xl transition-colors"
                      >
                        <div className="flex items-center gap-2 pr-2">
                          <div className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
                          <span className="text-xs font-bold text-slate-800 truncate">
                            {appliedTimeframe === 'Monthly' 
                               ? dayjs(row.date + "-01").format("MMMM YYYY")
                               : appliedTimeframe === 'Weekly'
                                 ? `Week ${row.date.split("-")[1]}, ${row.date.split("-")[0]}`
                                 : dayjs(row.date).format("MMM DD, YYYY")}
                          </span>
                        </div>
                        <span className="text-xs font-black text-blue-500 text-center self-center">
                          {row.sent?.toLocaleString()}
                        </span>
                        <span className="text-xs font-black text-emerald-500 text-center self-center">
                          {row.delivered?.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Performance Trend Chart */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 md:p-8 flex flex-col min-h-[500px]">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-lg font-black text-slate-900">Performance Tracking</h3>
                  <p className="text-xs font-bold text-slate-400">Real-time engagement velocity</p>
                </div>
              </div>

              <div className="flex-1 relative mt-8">
                {loading ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
                  </div>
                ) : (
                  <Chart 
                    key={categories.join(',')}
                    options={chartOptions} 
                    series={chartSeries} 
                    type="area" 
                    height="100%" 
                    width="100%"
                  />
                )}
              </div>

              <div className="grid grid-cols-3 gap-4 pt-8 border-t border-slate-50">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">TOTAL SENT</p>
                  <p className="text-2xl font-black text-slate-900">
                    {loading ? <Loader2 className="w-5 h-5 animate-spin text-slate-300 inline" /> : summary.totalSent.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">TOTAL DELIVERED</p>
                  <p className="text-2xl font-black text-slate-900">
                    {loading ? <Loader2 className="w-5 h-5 animate-spin text-slate-300 inline" /> : summary.totalDelivered.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">SUCCESS RATE</p>
                  <p className="text-2xl font-black text-slate-900">
                    {loading ? <Loader2 className="w-5 h-5 animate-spin text-slate-300 inline" /> : `${summary.successRate}%`}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* BOTTOM NAVIGATION CARDS */}
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
