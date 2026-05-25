import { useState, useEffect, useCallback } from "react";
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
  ChevronDown,
  Calendar,
  LineChart,
  Send,
  CheckCircle2,
  Eye,
  TrendingUp,
  Loader2,
  AlertCircle,
} from "lucide-react";
import AnalyticsApi from "../../services/AnalyticsApi";

// ─── helpers ────────────────────────────────────────────────────────────────
const fmt = (n) => {
  if (n === undefined || n === null) return "0";
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "k";
  return String(n);
};

const langLabel = (code) => {
  const map = { en_US: "English", hi: "Hindi", ta: "Tamil", te: "Telugu", mr: "Marathi" };
  return map[code] || code || "—";
};

// ─── component ───────────────────────────────────────────────────────────────

// Default date ranges that make sense per grouping
const defaultRangeFor = (mode) => {
  const end = dayjs();
  if (mode === "Weekly")  return [end.subtract(12, "week"),  end];
  if (mode === "Monthly") return [end.subtract(12, "month"), end];
  return [end.subtract(30, "day"), end]; // Daily
};

const getInitialSort = () => {
  return localStorage.getItem("template_analytics_sortBy") || "Daily";
};

const TemplateAnalytics = () => {
  const initialSort = getInitialSort();
  
  const [sortBy, setSortBy] = useState(initialSort);
  const [dateRange, setDateRange] = useState(defaultRangeFor(initialSort));

  // The actual applied states used by the chart (updates only on Apply Filter)
  const [appliedSortBy, setAppliedSortBy] = useState(initialSort);
  const [appliedDateRange, setAppliedDateRange] = useState(defaultRangeFor(initialSort));

  // data states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [engagement, setEngagement] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [summary, setSummary] = useState({
    totalSent: 0,
    totalDelivered: 0,
    totalRead: 0,
    deliveryRate: "0.0",
    readRate: "0.0",
  });

  const groupByMap = { Daily: "daily", Weekly: "weekly", Monthly: "monthly" };

  const fetchData = useCallback(async (range, group) => {
    const r = range  || dateRange;
    const g = group  || groupByMap[sortBy];
    setLoading(true);
    setError(null);
    try {
      const res = await AnalyticsApi.getTemplateAnalytics({
        startDate: r[0]?.format("YYYY-MM-DD"),
        endDate:   r[1]?.format("YYYY-MM-DD"),
        groupBy:   g,
      });
      if (res.success) {
        setEngagement(res.data.engagement || []);
        setChartData(res.data.chartData   || []);
        setSummary(res.data.summary       || {});
        
        // Save the *applied* settings used for this fetch so the chart renders correctly
        setAppliedDateRange(r);
        // Reverse lookup the mode from the group string ("daily" -> "Daily")
        const fetchedMode = Object.keys(groupByMap).find(k => groupByMap[k] === g) || "Daily";
        setAppliedSortBy(fetchedMode);
        
        // Persist preference
        localStorage.setItem("template_analytics_sortBy", fetchedMode);
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load analytics.");
    } finally {
      setLoading(false);
    }
  }, [dateRange, sortBy]);

  // load on mount
  useEffect(() => { fetchData(); }, []);

  // When Sort By changes → update date range (fetch waits for Apply Filter)
  const handleSortByChange = (newMode) => {
    setSortBy(newMode);
    const newRange = defaultRangeFor(newMode);
    setDateRange(newRange);
  };



  // ── chart config ────────────────────────────────────────────────────────────
  // Zero-fill: generate EVERY bucket in the selected range and merge API data.
  // This makes Daily(30 bars) vs Weekly(12 bars) vs Monthly(12 bars) clearly different.
  const filledChartData = (() => {
    const start = appliedDateRange[0];
    const end   = appliedDateRange[1];
    if (!start || !end) return chartData;

    // Build a lookup from what the API returned
    const lookup = {};
    chartData.forEach((d) => { lookup[d.date] = d; });

    const buckets = [];

    if (appliedSortBy === "Monthly") {
      let cur = start.startOf("month");
      while (cur.isBefore(end.endOf("month"))) {
        const key = cur.format("YYYY-MM");
        buckets.push(lookup[key] || { date: key, sent: 0, delivered: 0, read: 0 });
        cur = cur.add(1, "month");
      }
    } else if (appliedSortBy === "Weekly") {
      let cur = start.startOf("week");
      while (cur.isBefore(end.endOf("week"))) {
        const key = cur.format("YYYY-ww"); // e.g. "2026-21"
        // Backend uses %Y-%U (Sunday-based 0-padded). Try both formats.
        const altKey = `${cur.format("YYYY")}-${cur.format("ww")}`;
        const found  = lookup[key] || lookup[altKey] || null;
        buckets.push(found || { date: key, sent: 0, delivered: 0, read: 0 });
        cur = cur.add(1, "week");
      }
    } else {
      // Daily
      let cur = start.startOf("day");
      while (cur.isBefore(end.add(1, "day").startOf("day"))) {
        const key = cur.format("YYYY-MM-DD");
        buckets.push(lookup[key] || { date: key, sent: 0, delivered: 0, read: 0 });
        cur = cur.add(1, "day");
      }
    }

    return buckets;
  })();

  // Limit x-axis labels to avoid crowding (show max ~14 labels)
  const totalBuckets = filledChartData.length;
  const labelStep    = totalBuckets > 14 ? Math.ceil(totalBuckets / 14) : 1;

  const categories = filledChartData.map((d, i) => {
    if (i % labelStep !== 0) return "";          // hide crowded labels
    if (appliedSortBy === "Monthly") return dayjs(d.date + "-01").format("MMM YY");
    if (appliedSortBy === "Weekly")  return `Wk ${d.date.split("-")[1]}`;
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
    colors: ["#3b82f6", "#10b981", "#f43f5e"],
    dataLabels: { enabled: false },
    stroke: { width: 2.5, curve: "smooth", lineCap: "round" },
    markers: {
      size: totalBuckets > 14 ? 0 : 4,
      colors: ["#fff"],
      strokeColors: ["#3b82f6", "#10b981", "#f43f5e"],
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
    noData: { text: "No template data in range", style: { color: "#94a3b8", fontSize: "13px" } },
  };

  const chartSeries = [
    { name: "SENT",      data: filledChartData.map((d) => d.sent) },
    { name: "DELIVERED", data: filledChartData.map((d) => d.delivered) },
    { name: "READ",      data: filledChartData.map((d) => d.read) },
  ];



  const inputSx = {
    "& .MuiOutlinedInput-root": {
      borderRadius: "12px",
      bgcolor: "#f1f5f9",
      height: "40px",
      "& fieldset": { borderColor: "transparent" },
      "&:hover fieldset": { borderColor: "#10b981" },
      "&.Mui-focused fieldset": { borderColor: "#10b981" },
      "& .MuiInputBase-input": { fontWeight: 700, color: "#0f172a", fontSize: "0.813rem", padding: "0 10px" },
    },
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <div className="flex flex-col h-full bg-[#f8fafc] overflow-hidden font-['Urbanist']">
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6 lg:p-8 2xl:p-10">
          <div className="max-w-[1600px] mx-auto">

            {/* HEADER */}
            <div className="mb-6 md:mb-8 flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-center">
                <LineChart className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800 tracking-tight">Template Analytics</h1>
                <p className="text-xs text-slate-400 font-medium mt-0.5">
                  Detailed performance metrics across communication channels
                </p>
              </div>
            </div>

            {/* FILTERS */}
            <div className="flex flex-wrap items-center gap-4 mb-8">
              <div className="flex items-center gap-3 flex-wrap">
                {/* Sort By */}
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">
                    SORT BY
                  </span>
                  <div className="relative bg-[#f1f5f9] rounded-xl min-w-[100px]">
                    <select
                      value={sortBy}
                      onChange={(e) => handleSortByChange(e.target.value)}
                      className="w-full text-xs font-bold text-slate-900 focus:outline-none bg-transparent appearance-none cursor-pointer py-2 pl-3 pr-8"
                    >
                      <option>Daily</option>
                      <option>Weekly</option>
                      <option>Monthly</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* Date range display */}
                <div className="bg-[#f1f5f9] rounded-xl px-3 py-2 flex items-center gap-2 min-w-[180px]">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span className="text-xs font-bold text-slate-900">
                    {dateRange[0]?.format("DD-MM-YYYY")} — {dateRange[1]?.format("DD-MM-YYYY")}
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
                className="ml-auto px-10 py-2.5 bg-[#10B981] text-white text-sm font-bold rounded-xl hover:bg-[#059669] transition-all shadow-lg shadow-[#10B981]/20 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
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
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">

              {/* Template Engagement Table */}
              <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-100 shadow-sm p-6 md:p-8 flex flex-col min-h-[500px]">
                <div className="mb-6">
                  <h3 className="text-lg font-black text-slate-900">Template Engagement</h3>
                </div>

                <div className="flex-1 flex flex-col">
                  {/* Table header */}
                  <div className="grid grid-cols-4 pb-3 border-b border-slate-100">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">TEMPLATE NAME</span>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">LANGUAGE</span>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">SENT</span>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">READ</span>
                  </div>

                  {/* Rows */}
                  {loading ? (
                    <div className="flex-1 flex items-center justify-center">
                      <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
                    </div>
                  ) : engagement.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center px-10">
                      <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                        <LineChart className="w-8 h-8 text-slate-300" />
                      </div>
                      <h4 className="text-lg font-black text-slate-900 mb-2">No data available</h4>
                      <p className="text-xs font-bold text-slate-400 leading-relaxed">
                        No templates used in selected date range. Try adjusting your filters.
                      </p>
                    </div>
                  ) : (
                    <div className="flex-1 overflow-y-auto divide-y divide-slate-50 mt-1">
                      {engagement.map((row, i) => (
                        <div
                          key={i}
                          className="grid grid-cols-4 py-3 hover:bg-slate-50 rounded-xl transition-colors"
                        >
                          <div className="flex items-center gap-2 pr-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
                            <span
                              className="text-xs font-bold text-slate-800 truncate"
                              title={row.templateName || "—"}
                            >
                              {row.templateName || "—"}
                            </span>
                          </div>
                          <span className="text-xs font-semibold text-slate-500 text-center self-center">
                            {langLabel(row.templateLanguage)}
                          </span>
                          <span className="text-xs font-black text-blue-500 text-center self-center">
                            {row.sent?.toLocaleString()}
                          </span>
                          <span className="text-xs font-black text-rose-500 text-center self-center">
                            {row.read?.toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Performance Chart */}
              <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-100 shadow-sm p-6 md:p-8 flex flex-col min-h-[500px]">
                <div className="mb-2">
                  <h3 className="text-lg font-black text-slate-900">Performance Tracking</h3>
                  <p className="text-xs font-bold text-slate-400">Real-time engagement velocity</p>
                </div>

                <div className="flex-1 relative mt-4">
                  {loading ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
                    </div>
                  ) : (
                    <Chart
                      options={chartOptions}
                      series={chartSeries}
                      type="area"
                      height="100%"
                      width="100%"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* SUMMARY METRIC CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

              {/* Total Sent */}
              <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Send className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">TOTAL SENT</p>
                  <h4 className="text-2xl font-black text-slate-900">
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin text-slate-300 inline" />
                    ) : (
                      fmt(summary.totalSent)
                    )}
                  </h4>
                </div>
              </div>

              {/* Delivery Rate */}
              <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">DELIVERED</p>
                  <div className="flex items-end gap-2">
                    <h4 className="text-2xl font-black text-slate-900">
                      {loading ? (
                        <Loader2 className="w-5 h-5 animate-spin text-slate-300 inline" />
                      ) : (
                        `${summary.deliveryRate}%`
                      )}
                    </h4>
                    {!loading && parseFloat(summary.deliveryRate) > 0 && (
                      <div className="flex items-center text-emerald-500 text-[10px] font-bold mb-1">
                        <TrendingUp className="w-3 h-3 mr-0.5" />
                        {fmt(summary.totalDelivered)} msgs
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Read Rate */}
              <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex items-center gap-4">
                <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Eye className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">READ RATE</p>
                  <div className="flex items-end gap-2">
                    <h4 className="text-2xl font-black text-slate-900">
                      {loading ? (
                        <Loader2 className="w-5 h-5 animate-spin text-slate-300 inline" />
                      ) : (
                        `${summary.readRate}%`
                      )}
                    </h4>
                    {!loading && parseFloat(summary.readRate) > 0 && (
                      <div className="flex items-center text-rose-500 text-[10px] font-bold mb-1">
                        {fmt(summary.totalRead)} msgs
                      </div>
                    )}
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
