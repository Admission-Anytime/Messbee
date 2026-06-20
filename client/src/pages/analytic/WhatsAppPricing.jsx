import { useState, useEffect, useCallback } from "react";
import AnalyticsApi from "../../services/AnalyticsApi";
import dayjs from "dayjs";
import Chart from "react-apexcharts";
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  MessageCircle,
  DollarSign,
  Zap,
  BarChart2,
  Star,
  ChevronRight,
  MoreHorizontal,
  CheckCircle2,
  TriangleAlert,
  BellRing,
  Info,
  ArrowUpRight,
  ArrowDownRight,
  Shield,
  Activity,
  Target,
  Calendar,
  ChevronDown,
  RefreshCw,
  ChevronLeft,
} from "lucide-react";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { IconButton } from "@mui/material";

// ─── Custom Calendar Header ───────────────────────────────────────────────────
const CustomDatePickerHeader = ({ currentMonth, onMonthChange, view, onViewChange }) => {
  const monthLabel = currentMonth.format("MMMM");
  const yearLabel  = currentMonth.format("YYYY");
  const btnStyle = (active) => ({
    fontFamily: "Urbanist, sans-serif", fontWeight: 700, fontSize: "15px",
    color: active ? "#10B981" : "#1e293b",
    background: active ? "#f0fdf4" : "transparent",
    border: "none", borderRadius: "8px", padding: "4px 8px",
    cursor: "pointer", transition: "all 0.15s ease", lineHeight: 1.4,
  });
  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"8px 12px" }}>
      <IconButton size="small" onClick={() => onMonthChange(currentMonth.subtract(1,"month"),"right")}
        sx={{ color:"#64748b", "&:hover":{ color:"#10B981", backgroundColor:"#f0fdf4" } }}>
        <ChevronLeft size={18} />
      </IconButton>
      <div style={{ display:"flex", alignItems:"center", gap:"4px" }}>
        <button onClick={() => onViewChange(view==="month" ? "day" : "month")} style={btnStyle(view==="month")} title="Select month">{monthLabel}</button>
        <button onClick={() => onViewChange(view==="year"  ? "day" : "year")}  style={btnStyle(view==="year")}  title="Select year">{yearLabel}</button>
      </div>
      <IconButton size="small" onClick={() => onMonthChange(currentMonth.add(1,"month"),"left")}
        sx={{ color:"#64748b", "&:hover":{ color:"#10B981", backgroundColor:"#f0fdf4" } }}>
        <ChevronRight size={18} />
      </IconButton>
    </div>
  );
};

// ─── Pagination ───────────────────────────────────────────────────────────────
function Pagination({ currentPage, totalPages, rowsPerPage, totalCount, onPageChange, onRowsChange }) {
  const start = totalCount === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1;
  const end = Math.min(currentPage * rowsPerPage, totalCount);

  const getPages = () => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages = [1];
    if (currentPage > 3) pages.push("...");
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) pages.push(i);
    if (currentPage < totalPages - 2) pages.push("...");
    pages.push(totalPages);
    return pages;
  };

  return (
    <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex-wrap gap-4 font-sans rounded-b-2xl">
      <span className="text-sm text-slate-500 font-semibold">Total campaigns: <strong className="text-slate-900">{totalCount}</strong></span>
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm text-slate-500 font-medium">Rows per page:</span>
        <select
          value={rowsPerPage}
          onChange={e => { onRowsChange(Number(e.target.value)); onPageChange(1); }}
          className="bg-white border border-slate-200 rounded-lg text-sm text-slate-700 font-bold px-2.5 py-1.5 cursor-pointer outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981]"
        >
          {[5, 10, 25].map(n => <option key={n}>{n}</option>)}
        </select>
        <span className="text-sm text-slate-500 font-medium min-w-[90px] text-center ml-2">{start}–{end} of {totalCount}</span>
        <div className="flex items-center gap-1.5 ml-2">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-500 hover:border-[#10B981] hover:text-[#10B981] disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            <ChevronLeft className="w-4 h-4" strokeWidth={2.5} />
          </button>
          <div className="flex gap-1.5">
            {getPages().map((p, i) =>
              p === "..."
                ? <span key={`d${i}`} className="px-2 py-1.5 text-sm font-bold text-slate-400">…</span>
                : <button
                  key={p}
                  onClick={() => onPageChange(p)}
                  className={`min-w-[34px] px-2 py-1.5 border rounded-lg text-sm font-bold transition-all shadow-sm ${p === currentPage ? "bg-[#10B981] text-white border-[#10B981]" : "bg-white text-slate-600 border-slate-200 hover:border-[#10B981] hover:text-[#10B981]"}`}
                >
                  {p}
                </button>
            )}
          </div>
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages || totalPages === 0}
            className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-500 hover:border-[#10B981] hover:text-[#10B981] disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            <ChevronRight className="w-4 h-4" strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Insight bar ──────────────────────────────────────────────────────────────
const InsightBar = ({ label, value, color, icon: Icon }) => (
  <div className="py-2.5">
    <div className="flex justify-between items-center mb-1.5">
      <div className="flex items-center gap-1.5">
        <Icon className="w-3.5 h-3.5" style={{ color }} strokeWidth={2} />
        <span className="text-[12px] font-semibold" style={{ color }}>{label}</span>
      </div>
      <span className="text-[12px] font-black text-slate-900">{value}%</span>
    </div>
    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
      <div className="h-full rounded-full" style={{ width: `${value}%`, backgroundColor: color }} />
    </div>
  </div>
);

// ─── Main ─────────────────────────────────────────────────────────────────────
const WhatsAppPricing = ({ onBack }) => {
  const [chartType, setChartType] = useState("Area");
  const [data, setData] = useState(null);
  const [campaignData, setCampaignData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState([dayjs().subtract(30, "day"), dayjs()]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showOptimizationsModal, setShowOptimizationsModal] = useState(false);

  // ─── MUI input styles ─────────────────────────────────────────────────────
  const inputSx = {
    "& .MuiOutlinedInput-root": {
      borderRadius: "8px",
      bgcolor: "white",
      height: "42px",
      "& fieldset": { borderColor: "#e2e8f0" },
      "&:hover fieldset": { borderColor: "#10B981" },
      "&.Mui-focused fieldset": { borderColor: "#10B981" },
      "& .MuiInputBase-input": {
        fontWeight: 600,
        color: "#1e293b",
        fontSize: "0.875rem",
        padding: "0 10px",
        fontFamily: "Urbanist, sans-serif",
      },
    },
  };

  // Campaign Table Pagination
  const [campPage, setCampPage] = useState(1);
  const [campRowsPerPage, setCampRowsPerPage] = useState(5);

  // Calculator states
  const [calcType, setCalcType] = useState("Marketing");
  const [calcVol, setCalcVol] = useState(10000);
  const [calcCountry, setCalcCountry] = useState("India");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const startDate = dateRange[0].format("YYYY-MM-DD");
      const endDate = dateRange[1].format("YYYY-MM-DD");
      const [res, campRes] = await Promise.all([
        AnalyticsApi.getConversationAnalytics({ startDate, endDate }),
        AnalyticsApi.getCampaignAnalytics()
      ]);
      if (res.success) {
        setData(res.data);
      }
      if (campRes && campRes.success) {
        setCampaignData(campRes.data.campaigns || []);
      }
    } catch (err) {
      console.error("Failed to load pricing data", err);
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const fmtNum = (n = 0) => Number(n).toLocaleString("en-IN");
  const fmtCost = (n = 0) => `₹${Number(n).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

  const tableData = data?.tableData || [];
  const totals = data?.totals || {
    marketing: { qty: 0, cost: 0 },
    utility: { qty: 0, cost: 0 },
    auth: { qty: 0, cost: 0 },
    service: { qty: 0, cost: 0 },
  };
  const totalConversations = data?.totalConversations || 0;
  const totalCharges = data?.totalCharges || 0;
  const pricing = data?.pricing || { marketing: 1.5, utility: 1.0, auth: 0.3, service: 0.0 };

  // ── csv export ─────────────────────────────────────────────────────────────
  const handleDownloadBilling = () => {
    if (!tableData.length) return;
    const headers = "Date,Marketing Qty,Marketing Cost,Utility Qty,Utility Cost,Auth Qty,Auth Cost,Service Qty,Service Cost,Total Conv.,Total Charges\n";
    const rows = tableData.map((r) =>
      [
        r.date,
        r.marketing.qty, r.marketing.cost,
        r.utility.qty, r.utility.cost,
        r.auth.qty, r.auth.cost,
        r.service.qty, r.service.cost,
        r.totalConv,
        r.totalCharges,
      ].join(",")
    );
    
    // Billing Summary section
    const gst = totalCharges * 0.18;
    const discount = totalCharges * 0.05;
    const coupon = totalCharges * 0.08;
    const net = totalCharges + gst - discount - coupon;
    
    rows.push("");
    rows.push("BILLING SUMMARY,,,,,,,,,,");
    rows.push(`Total Charges,,,,,,,,,,${totalCharges.toFixed(2)}`);
    rows.push(`GST (18%),,,,,,,,,,${gst.toFixed(2)}`);
    rows.push(`Discount Applied,,,,,,,,,,${(-discount).toFixed(2)}`);
    rows.push(`Coupon (SAVE10),,,,,,,,,,${(-coupon).toFixed(2)}`);
    rows.push(`Net Amount Due,,,,,,,,,,${net.toFixed(2)}`);

    const csv = "data:text/csv;charset=utf-8," + headers + rows.join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csv));
    link.setAttribute("download", `billing_summary_${dayjs().format("MMM_YYYY")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  // ── spending rows ──────────────────────────────────────────────────────────
  const todayData = tableData.length ? tableData[tableData.length - 1] : null;
  const thisWeekData = tableData.slice(-7);
  const weekCharges = thisWeekData.reduce((acc, r) => acc + r.totalCharges, 0);
  const weekConvs = thisWeekData.reduce((acc, r) => acc + r.totalConv, 0);

  const quarterCharges = totalCharges * 3;
  const quarterConvs = totalConversations * 3;
  const yearCharges = totalCharges * 12;
  const yearConvs = totalConversations * 12;

  const maxCharges = Math.max(yearCharges, 1);

  const calcW = (val) => `${Math.max(2, Math.round((val / maxCharges) * 100))}%`;

  const spending = [
    { label: "Today",        amount: fmtCost(todayData?.totalCharges),      color: "#10B981", barW: calcW(todayData?.totalCharges || 0),   convs: `${fmtNum(todayData?.totalConv)} conversations`   },
    { label: "This Week",    amount: fmtCost(weekCharges),    color: "#3b82f6", barW: calcW(weekCharges),  convs: `${fmtNum(weekConvs)} conversations`  },
    { label: "This Month",   amount: fmtCost(totalCharges),   color: "#f59e0b", barW: calcW(totalCharges),  convs: `${fmtNum(totalConversations)} conversations` },
    { label: "This Quarter", amount: fmtCost(quarterCharges), color: "#a855f7", barW: calcW(quarterCharges),  convs: `${fmtNum(quarterConvs)} conversations` },
    { label: "This Year",    amount: fmtCost(yearCharges),    color: "#f43f5e", barW: calcW(yearCharges), convs: `${fmtNum(yearConvs)} conversations` },
  ];

  // ── donut ──────────────────────────────────────────────────────────────────
  const donutOptions = {
    chart: { type: "donut", fontFamily: "Urbanist, sans-serif" },
    colors: ["#10B981", "#3b82f6", "#f59e0b", "#a855f7"],
    labels: ["Marketing", "Utility", "Authentication", "Service"],
    dataLabels: { enabled: false },
    plotOptions: { pie: { donut: { size: "68%" } } },
    legend: { show: false },
    stroke: { width: 0 },
    tooltip: { theme: "light" },
  };
  const tot = Math.max(1, totalConversations);
  const donutSeries = [
    Math.round((totals.marketing.qty / tot) * 100) || 0,
    Math.round((totals.utility.qty / tot) * 100) || 0,
    Math.round((totals.auth.qty / tot) * 100) || 0,
    Math.round((totals.service.qty / tot) * 100) || 0,
  ];

  // ── monthly cost trend ────────────────────────
  const trendOptions = {
    chart: {
      type: chartType === "Area" ? "area" : "line",
      toolbar: { show: false },
      fontFamily: "Urbanist, sans-serif",
      background: "transparent",
      animations: { enabled: true },
    },
    colors: chartType === "Area" ? ["#10B981", "#3b82f6", "#f59e0b", "#a855f7"] : ["#10B981"],
    stroke: { 
      curve: chartType === "Area" ? "smooth" : "straight", 
      width: 2 
    },
    dataLabels: { enabled: false },
    markers: { 
      size: chartType === "Area" ? 0 : 5,
      colors: ["#10B981"],
      strokeColors: "#fff",
      strokeWidth: 2
    },
    xaxis: {
      categories: data?.chartCategories || ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: { style: { colors: "#94a3b8", fontSize: "10px", fontWeight: 600 } },
    },
    yaxis: {
      min: 0,
      tickAmount: 4,
      labels: {
        style: { colors: "#94a3b8", fontSize: "10px", fontWeight: 600 },
        formatter: (v) => {
          if (v >= 1000) return `₹${(v / 1000).toFixed(1)}K`;
          return `₹${v.toFixed(0)}`;
        },
      },
    },
    grid: { borderColor: "#f1f5f9", strokeDashArray: 4 },
    legend: { show: false },
    tooltip: { theme: "light" },
    fill: chartType === "Area"
      ? { type: "solid", opacity: 0.5 }
      : { type: "solid", opacity: 1 },
  };

  const trendSeriesArea = data ? [
    { name: "Marketing", data: tableData.map(r => r.marketing.cost) },
    { name: "Utility", data: tableData.map(r => r.utility.cost) },
    { name: "Authentication", data: tableData.map(r => r.auth.cost) },
    { name: "Service", data: tableData.map(r => r.service.cost) }
  ] : [
    { name: "Marketing", data: [2000, 1500, 2200, 3000, 2800, 3500, 3800, 4200, 4500, 5000, 4800, null] },
    { name: "Utility", data: [1500, 1200, 1400, 2000, 1800, 2000, 2200, 2300, 2500, 2800, 2600, null] },
    { name: "Authentication", data: [500, 400, 500, 800, 700, 800, 900, 900, 1000, 1100, 1000, null] },
    { name: "Service", data: [500, 400, 500, 700, 700, 700, 600, 600, 500, 600, 600, null] }
  ];

  const trendSeriesLine = [
    { name: "Total Cost", data: data ? tableData.map(r => r.totalCharges) : [4500, 3500, 4600, 6500, 6000, 7000, 7500, 8000, 8500, 9500, 9000, null] },
  ];

  const trendSeries = chartType === "Area" ? trendSeriesArea : trendSeriesLine;

  // ── conversation volume bar ────────────────────────────────────────────────
  const volOptions = {
    chart: { type: "bar", toolbar: { show: false }, fontFamily: "Urbanist, sans-serif" },
    colors: ["#3b82f6", "#10B981", "#06b6d4", "#f97316"],
    plotOptions: { bar: { columnWidth: "55%", borderRadius: 2 } },
    dataLabels: { enabled: false },
    xaxis: {
      categories: data?.chartCategories || ["21 May","23 May","25 May","28 May","29 May","30 May","May","3 Jun","4 Jun","5 Jun","6 Jun","8 Jun","9 Jun","10 Jun","12 Jun","13 Jun","16 Jun","17 Jun"],
      labels: { style: { colors: "#94a3b8", fontSize: "9px", fontWeight: 600 }, rotate: -45 },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: { 
      min: 0, 
      tickAmount: 4, 
      labels: { 
        style: { colors: "#94a3b8", fontSize: "10px" },
        formatter: (v) => Math.round(v)
      } 
    },
    grid: { borderColor: "#f1f5f9", strokeDashArray: 4 },
    legend: {
      show: true,
      horizontalAlign: "center",
      fontFamily: "Urbanist",
      fontWeight: 700,
      fontSize: "10px",
      labels: { colors: "#64748b" },
      itemMargin: { horizontal: 10 },
    },
    tooltip: { theme: "light" },
  };

  const volSeries = data?.chartSeries || [
    { name: "MARKETING", data: [38,2,0,20,1,2,0,1,3,2,2,1,0,3,4,5,4,7] },
    { name: "UTILITY",   data: [2,1,0,2,1,0,1,2,1,1,1,0,15,2,1,2,3,1]  },
    { name: "AUTH",      data: [1,0,0,1,0,1,0,1,0,0,0,0,0,1,0,0,0,0]   },
    { name: "SERVICE",   data: [3,1,1,1,0,1,2,0,2,1,3,0,1,0,2,3,2,3]   },
  ];

  const breakdown = [
    { label: "Marketing",      pct: donutSeries[0], color: "#10B981", cost: fmtCost(totals.marketing.cost), convs: `${fmtNum(totals.marketing.qty)} convs` },
    { label: "Utility",        pct: donutSeries[1], color: "#3b82f6", cost: fmtCost(totals.utility.cost),  convs: `${fmtNum(totals.utility.qty)} convs` },
    { label: "Authentication", pct: donutSeries[2], color: "#f59e0b", cost: fmtCost(totals.auth.cost),  convs: `${fmtNum(totals.auth.qty)} convs` },
    { label: "Service",        pct: donutSeries[3], color: "#a855f7", cost: fmtCost(totals.service.cost),  convs: `${fmtNum(totals.service.qty)} convs` },
  ];

  // ── category stat cards ────────────────────────────────────────────────────
  const catCards = [
    { label: "Marketing",      color: "#10B981", count: fmtNum(totals.marketing.qty), perConv: fmtCost(pricing.marketing), total: fmtCost(totals.marketing.cost), totalColor: "text-emerald-600", barW: `${donutSeries[0]}%`  },
    { label: "Utility",        color: "#3b82f6", count: fmtNum(totals.utility.qty), perConv: fmtCost(pricing.utility), total: fmtCost(totals.utility.cost),  totalColor: "text-blue-600",    barW: `${donutSeries[1]}%`  },
    { label: "Authentication", color: "#f59e0b", count: fmtNum(totals.auth.qty), perConv: fmtCost(pricing.auth), total: fmtCost(totals.auth.cost),  totalColor: "text-amber-600",   barW: `${donutSeries[2]}%`  },
    { label: "Service",        color: "#a855f7", count: fmtNum(totals.service.qty), perConv: fmtCost(pricing.service), total: fmtCost(totals.service.cost),  totalColor: "text-purple-600",  barW: `${donutSeries[3]}%`  },
  ];

  // ── heatmap data ───────────────────────────────────────────────────────────
  const heatDays = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
  const heatHours = Array.from({ length: 24 }, (_, i) => i);
  // opacities[0] = lowest (lightest), opacities[5] = highest (darkest)
  const heatColors = ["#dcfce7", "#bbf7d0", "#86efac", "#4ade80", "#22c55e", "#16a34a"];
  const getHeatVal = (dIdx, h) => {
    const isWeekend = dIdx >= 5;
    // Night: very low
    if (h >= 0 && h <= 5) return 0;
    // Early morning
    if (h >= 6 && h <= 7) return isWeekend ? 0 : 1;
    // Morning ramp
    if (h >= 8 && h <= 9) return isWeekend ? 1 : 2;
    // Mid-morning peak
    if (h >= 10 && h <= 12) return isWeekend ? 2 : 3;
    // Afternoon lull
    if (h >= 13 && h <= 14) return isWeekend ? 1 : 2;
    // Afternoon peak
    if (h >= 15 && h <= 16) return isWeekend ? 2 : 3;
    // Evening peak (highest activity)
    if (h >= 17 && h <= 20) return isWeekend ? 3 : 5;
    // Late evening
    if (h === 21) return isWeekend ? 2 : 4;
    // Late night wind-down
    return isWeekend ? 1 : 1;
  };

  return (
    <div
      className="flex h-full overflow-hidden"
      style={{ fontFamily: "Urbanist, sans-serif", background: "#f8fafc" }}
    >
      <div className="flex-1 overflow-y-auto">
        {/* ── PAGE HEADER ── */}
        <div className="bg-white border-b border-gray-100 px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {onBack && (
              <button
                onClick={onBack}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors mr-1 shrink-0"
              >
                <ArrowLeft className="w-4 h-4 text-slate-600" />
              </button>
            )}
            <div className="min-w-0">
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest">
                Analytics &rsaquo;
              </p>
              <h1 className="text-[20px] font-extrabold text-slate-900 leading-tight">
                WhatsApp Conversation Pricing
              </h1>
              <p className="text-[11px] text-slate-400 font-normal mt-0.5 max-w-lg">
                Monitor conversation costs, usage patterns, billing trends, and pricing performance across all WhatsApp categories.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0 relative">
            <div 
              onClick={() => setShowDatePicker(!showDatePicker)}
              className="flex items-center gap-2 border border-slate-200 rounded-full px-3 py-1.5 text-slate-600 bg-white cursor-pointer hover:bg-slate-50 transition-colors whitespace-nowrap"
            >
              <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="font-semibold text-[12px]">{dateRange[0].format("MMM D")} – {dateRange[1].format("MMM D, YYYY")}</span>
              <svg className="w-3 h-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            
            {showDatePicker && (
              <div className="absolute top-[calc(100%+8px)] right-[140px] z-50 bg-white shadow-xl rounded-2xl border border-slate-100 p-4 flex gap-4 animate-in fade-in slide-in-from-top-2">
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">From Date</p>
                    <DatePicker
                      value={dateRange[0]}
                      onChange={(val) => setDateRange([val, dateRange[1]])}
                      views={['year', 'month', 'day']}
                      slots={{ calendarHeader: CustomDatePickerHeader }}
                      slotProps={{ textField: { sx: { width: 160, ...inputSx } } }}
                    />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">To Date</p>
                    <DatePicker
                      value={dateRange[1]}
                      onChange={(val) => setDateRange([dateRange[0], val])}
                      views={['year', 'month', 'day']}
                      slots={{ calendarHeader: CustomDatePickerHeader }}
                      slotProps={{ textField: { sx: { width: 160, ...inputSx } } }}
                    />
                  </div>
                </LocalizationProvider>
              </div>
            )}
            <button
              onClick={fetchData}
              disabled={loading}
              className="flex items-center gap-2 bg-[#10B981] hover:bg-[#059669] text-white text-[12px] font-bold px-4 py-1.5 rounded-full transition-all shadow-md whitespace-nowrap disabled:opacity-60"
            >
              <RefreshCw className={`w-3.5 h-3.5 shrink-0 ${loading ? "animate-spin" : ""}`} />
              Refresh Analysis
            </button>
          </div>
        </div>

        {/* ── BODY ── */}
        <div className="p-6 lg:p-8">
        <div className="max-w-[1600px] mx-auto">

          {/* MAIN 2-COL GRID */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">

            {/* ── LEFT: 2/3 ── */}
            <div className="xl:col-span-2 space-y-6">

              {/* STAT CARDS ROW */}
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
                {[
                  { badge: "+12.4%", badgeUp: true,  badgeColor: "bg-red-50 text-red-500",         label: "TOTAL CHARGES",       value: fmtCost(totalCharges),  sub: "This month"        },
                  { badge: "+8.2%",  badgeUp: true,  badgeColor: "bg-emerald-50 text-emerald-600", label: "TOTAL CONVERSATIONS", value: fmtNum(totalConversations), sub: "This month"        },
                  { badge: "-0.9%",  badgeUp: false, badgeColor: "bg-red-50 text-red-500",         label: "AVG COST / CONV.",    value: fmtCost(totalConversations ? totalCharges/totalConversations : 0),   sub: "Per conversation" },
                  { badge: "+15.2%", badgeUp: true,  badgeColor: "bg-red-50 text-red-500",         label: "MARKETING COST",      value: fmtCost(totals.marketing.cost),  sub: `${fmtNum(totals.marketing.qty)} convs`     },
                  { badge: "-3.4%",  badgeUp: false, badgeColor: "bg-red-50 text-red-500",         label: "SERVICE COST",        value: fmtCost(totals.service.cost),   sub: `${fmtNum(totals.service.qty)} convs`     },
                  { badge: "+₹2,700",badgeUp: true,  badgeColor: "bg-emerald-50 text-emerald-600", label: "MONTHLY TREND",       value: "+12.4%",   sub: "vs last month"    },
                ].map((c) => (
                  <div key={c.label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-3.5 flex flex-col gap-1.5 min-w-0 overflow-hidden">
                    <div className={`inline-flex items-center gap-0.5 text-[9px] font-black px-1.5 py-0.5 rounded-md self-start shrink-0 ${c.badgeColor}`}>
                      {c.badgeUp
                        ? <ArrowUpRight className="w-2 h-2 shrink-0" strokeWidth={3} />
                        : <ArrowDownRight className="w-2 h-2 shrink-0" strokeWidth={3} />}
                      <span className="whitespace-nowrap">{c.badge}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5 truncate">{c.label}</p>
                      <p className="text-[15px] font-black text-slate-900 leading-tight truncate">{c.value}</p>
                      {c.sub && <p className="text-[9px] text-slate-400 font-medium mt-0.5 truncate">{c.sub}</p>}
                    </div>
                  </div>
                ))}
              </div>

              {/* BREAKDOWN + SPENDING */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Conversation Category Breakdown */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                  <h2 className="text-[15px] font-black text-slate-900 mb-0.5">Conversation Category Breakdown</h2>
                  <p className="text-[11px] text-slate-400 font-medium mb-6">Cost distribution across conversation types</p>

                  <div className="flex gap-4 items-start min-w-0">
                    <div className="shrink-0" style={{ width: 120, height: 120 }}>
                      <Chart options={donutOptions} series={donutSeries} type="donut" height={120} />
                    </div>

                    <div className="flex-1 mt-1 min-w-0">
                      {breakdown.map((row) => (
                        <div key={row.label} className="mb-3 last:mb-0">
                          <div className="flex items-center justify-between mb-1 gap-2">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: row.color }} />
                              <span className="text-[12px] font-semibold text-slate-700 truncate">{row.label}</span>
                              <span className="text-[11px] font-bold text-slate-400 shrink-0">{row.pct}%</span>
                            </div>
                            <span className="text-[12px] font-black text-slate-900 shrink-0">{row.cost}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full rounded-full transition-all duration-500" style={{ width: `${row.pct}%`, backgroundColor: row.color }} />
                            </div>
                            <span className="text-[10px] text-slate-400 font-medium shrink-0">{row.convs}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Spending Analytics */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                  <h2 className="text-[15px] font-black text-slate-900 mb-0.5">Spending Analytics</h2>
                  <p className="text-[11px] text-slate-400 font-medium mb-5">Cumulative spend across periods</p>

                  <div className="space-y-4">
                    {spending.map((row) => (
                      <div key={row.label}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[13px] font-semibold text-slate-700">{row.label}</span>
                          <span className="text-[13px] font-black" style={{ color: row.color }}>{row.amount}</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mb-1">
                          <div className="h-full rounded-full" style={{ width: row.barW, backgroundColor: row.color }} />
                        </div>
                        <p className="text-[10px] text-slate-400 font-medium">{row.convs}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Monthly Cost Trend */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-[15px] font-black text-slate-900">Monthly Cost Trend</h2>
                    <p className="text-[11px] text-slate-400 font-medium mt-0.5">Charges, volume, and projection over time</p>
                  </div>
                  <div className="flex bg-slate-100 rounded-full p-0.5">
                    {["Area", "Line"].map((t) => (
                      <button
                        key={t}
                        onClick={() => setChartType(t)}
                        className={`px-4 py-1.5 rounded-full text-[11px] font-bold transition-all ${
                          chartType === t
                            ? "bg-emerald-500 text-white shadow-sm"
                            : "text-slate-500 hover:text-slate-700"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <Chart
                  key={chartType}
                  options={trendOptions}
                  series={trendSeries}
                  type={chartType === "Area" ? "area" : "line"}
                  height={260}
                />
              </div>

              {/* Category Stat Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {catCards.map((c) => (
                  <div key={c.label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 min-w-0 overflow-hidden">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                      <span className="text-[13px] font-black text-slate-900 truncate">{c.label}</span>
                    </div>
                    <div className="space-y-2 mb-3">
                      <div className="flex justify-between items-center gap-2">
                        <span className="text-[11px] text-slate-400 font-medium shrink-0">Count</span>
                        <span className="text-[12px] font-black text-slate-900 truncate text-right">{c.count}</span>
                      </div>
                      <div className="flex justify-between items-center gap-2">
                        <span className="text-[11px] text-slate-400 font-medium shrink-0">Per Conv.</span>
                        <span className="text-[12px] font-black text-slate-900 truncate text-right">{c.perConv}</span>
                      </div>
                      <div className="flex justify-between items-center gap-2">
                        <span className="text-[11px] text-slate-400 font-medium shrink-0">Total</span>
                        <span className={`text-[12px] font-black truncate text-right ${c.totalColor}`}>{c.total}</span>
                      </div>
                    </div>
                    {/* colored dash bar at bottom — width proportional to share */}
                    <div className="h-1.5 rounded-full" style={{ width: c.barW, backgroundColor: c.color }} />
                  </div>
                ))}
              </div>


              {/* Conversation Usage Heatmap */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <h2 className="text-[15px] font-black text-slate-900 mb-0.5">Conversation Usage Heatmap</h2>
                <p className="text-[11px] text-slate-400 font-medium mb-6">Activity intensity by day and hour</p>

                {/* Hour labels */}
                <div className="flex items-center pl-[44px] mb-2">
                  {["0h","4h","8h","12h","16h","20h"].map((h) => (
                    <div key={h} className="flex-1 text-center text-[9px] text-slate-400 font-bold">{h}</div>
                  ))}
                </div>

                {/* Grid */}
                <div className="space-y-1.5">
                  {heatDays.map((day, dIdx) => {
                    // Calculate dynamic multiplier based on real data for this day of week
                    const dayVolumes = [0,0,0,0,0,0,0]; // Mon-Sun
                    tableData.forEach(r => {
                      const d = new Date(r.date).getDay();
                      const idx = d === 0 ? 6 : d - 1;
                      dayVolumes[idx] += r.totalConv;
                    });
                    const maxDayVol = Math.max(...dayVolumes, 1);
                    const dayMultiplier = dayVolumes[dIdx] / maxDayVol;

                    return (
                      <div key={day} className="flex items-center gap-3">
                        <div className="w-8 text-[11px] text-slate-500 font-semibold text-left shrink-0">{day}</div>
                        <div className="flex flex-1 gap-[3px]">
                          {heatHours.map((h) => {
                            const baseV = getHeatVal(dIdx, h);
                            // Scale intensity dynamically based on day volume
                            const v = Math.round(baseV * (0.4 + dayMultiplier * 0.6));
                            const color = heatColors[Math.min(v, heatColors.length - 1)];
                            return (
                              <div
                                key={h}
                                className="flex-1 aspect-square max-h-[26px] rounded-full cursor-pointer hover:brightness-90 transition-all"
                                style={{ backgroundColor: color }}
                              />
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Legend — bottom right */}
                <div className="flex items-center justify-end gap-2 mt-4 text-[10px] text-slate-400 font-medium">
                  <span>Low</span>
                  {heatColors.map((color, i) => (
                    <div key={i} className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                  ))}
                  <span>High</span>
                </div>
              </div>

              {/* Pricing Forecast Center */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <h2 className="text-[15px] font-black text-slate-900 mb-0.5">Pricing Forecast Center</h2>
                <p className="text-[11px] text-slate-400 font-medium mb-6">AI-powered spending predictions and trajectory</p>

                <div className="flex flex-col lg:flex-row gap-6 items-start">
                  {/* Left: 2x2 Cards Grid */}
                  <div className="grid grid-cols-2 gap-4 shrink-0 w-full lg:w-[42%]">
                    {[
                      { label: "Next 7 Days",  amount: fmtCost(totalCharges / 30 * 7),  convs: `${fmtNum((totalConversations / 30 * 7).toFixed(0))} convs`, save: `Save ${fmtCost(totalCharges / 30 * 7 * 0.05)}`   },
                      { label: "Next 30 Days", amount: fmtCost(totalCharges), convs: `${fmtNum(totalConversations)} convs`, save: `Save ${fmtCost(totalCharges * 0.05)}` },
                      { label: "Next Quarter", amount: fmtCost(totalCharges * 3), convs: `${fmtNum(totalConversations * 3)} convs`, save: `Save ${fmtCost(totalCharges * 3 * 0.05)}` },
                      { label: "Next Year",    amount: fmtCost(totalCharges * 12), convs: `${fmtNum(totalConversations * 12)} convs`, save: `Save ${fmtCost(totalCharges * 12 * 0.05)}` },
                    ].map((f) => (
                      <div key={f.label} className="bg-white rounded-[16px] border border-slate-100 p-4 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                        <p className="text-[11px] text-slate-400 font-semibold mb-1">{f.label}</p>
                        <p className="text-xl font-black text-slate-900 leading-tight mb-1">{f.amount}</p>
                        <p className="text-[11px] text-slate-400 font-semibold mb-3">{f.convs}</p>
                        <div className="inline-flex items-center gap-1 text-[11px] font-bold text-[#10B981]">
                          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.9 1.2 1.5 1.5 2.5" />
                            <path d="M9 18h6" />
                            <path d="M10 22h4" />
                          </svg>
                          {f.save}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Right: Forecast Chart */}
                  <div className="flex-1">
                    <Chart
                      options={{
                        chart: { type: "area", toolbar: { show: false }, fontFamily: "Urbanist, sans-serif", animations: { enabled: true } },
                        forecastDataPoints: { count: 4 },
                        colors: ["#10B981"],
                        stroke: { curve: "straight", width: 2, dashArray: [0, 0, 5, 5, 5, 5] },
                        dataLabels: { enabled: false },
                        markers: { size: 0 },
                        xaxis: {
                          categories: ["Oct","Nov","Dec","Jan","Feb","Mar"],
                          axisBorder: { show: false },
                          axisTicks: { show: false },
                          labels: { style: { colors: "#94a3b8", fontSize: "10px", fontWeight: 600 } },
                        },
                        yaxis: {
                          min: 0,
                          tickAmount: 4,
                          labels: {
                            style: { colors: "#94a3b8", fontSize: "10px", fontWeight: 600 },
                            formatter: (v) => {
                              if (v >= 1000) return `₹${(v / 1000).toFixed(1)}K`;
                              return `₹${v.toFixed(0)}`;
                            },
                          },
                        },
                        grid: { borderColor: "#f1f5f9", strokeDashArray: 4 },
                        legend: { show: false },
                        tooltip: { theme: "light" },
                        annotations: {
                          xaxis: [{
                            x: "Dec",
                            borderColor: "#94a3b8",
                            strokeDashArray: 4,
                          }],
                        },
                        fill: {
                          type: "gradient",
                          gradient: {
                            shade: "light",
                            type: "vertical",
                            shadeIntensity: 0.5,
                            gradientToColors: ["#ccfbf1"],
                            opacityFrom: 0.45,
                            opacityTo: 0.05,
                            stops: [0, 100],
                          },
                        },
                      }}
                      series={[{ name: "Forecast", data: [totalCharges * 0.9, totalCharges, totalCharges * 1.05, totalCharges * 1.12, totalCharges * 1.2, totalCharges * 1.28] }]}
                      type="area"
                      height={200}
                    />
                  </div>
                </div>
              </div>

              {/* Campaign Cost Analysis */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm pt-6 flex flex-col">
                <div className="flex justify-between items-start px-6 mb-6">
                  <div>
                    <h2 className="text-[15px] font-black text-slate-900 mb-0.5">Campaign Cost Analysis</h2>
                    <p className="text-[11px] text-slate-400 font-medium">Top spending campaigns ranked by ROI</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="bg-[#10B981] hover:bg-emerald-600 transition-colors text-white text-[11px] font-bold px-4 py-1.5 rounded-full shadow-sm">
                      Top Spend
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[700px] table-fixed">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/50">
                        <th className="pb-3 pt-3 px-6 text-[11px] font-semibold text-slate-400 w-[28%]">Campaign</th>
                        <th className="pb-3 pt-3 px-4 text-[11px] font-semibold text-slate-400 text-right">Sent</th>
                        <th className="pb-3 pt-3 px-4 text-[11px] font-semibold text-slate-400 text-right">Conversations</th>
                        <th className="pb-3 pt-3 px-4 text-[11px] font-semibold text-slate-400 text-right">Charges</th>
                        <th className="pb-3 pt-3 px-4 text-[11px] font-semibold text-slate-400 text-right">Conv. Rate</th>
                        <th className="pb-3 pt-3 px-4 text-[11px] font-semibold text-slate-400 text-right">ROI</th>
                        <th className="pb-3 pt-3 px-4 text-[11px] font-semibold text-slate-400 text-center">Status</th>
                        <th className="pb-3 pt-3 px-6 text-[11px] font-semibold text-slate-400 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {campaignData.length > 0 ? campaignData.slice((campPage - 1) * campRowsPerPage, campPage * campRowsPerPage).map((c, idx) => {
                        const sent = c.stats?.sent || 0;
                        const convs = Math.round(sent * 0.44); // Derived estimation
                        const charges = convs * (pricing.marketing || 1.5);
                        const rate = sent > 0 ? ((convs / sent) * 100).toFixed(1) : "0.0";
                        const roi = sent > 0 ? (parseFloat(rate) / 5).toFixed(1) : "0.0";
                        const roiColor = parseFloat(roi) > 7 ? "text-emerald-500" : "text-orange-400";
                        
                        let statusBg = "bg-slate-50 text-slate-500";
                        if (c.status === "active") statusBg = "bg-emerald-50 text-emerald-500";
                        else if (c.status === "completed") statusBg = "bg-blue-50 text-blue-500";
                        else if (c.status === "paused") statusBg = "bg-orange-50 text-orange-400";

                        return (
                          <tr key={c.id || idx} className="hover:bg-slate-50/50 transition-colors">
                            <td className="py-4 px-6 text-[13px] font-black text-slate-700 truncate" title={c.name}>{c.name}</td>
                            <td className="py-4 px-4 text-[13px] font-semibold text-slate-500 text-right">{fmtNum(sent)}</td>
                            <td className="py-4 px-4 text-[13px] font-semibold text-slate-500 text-right">{fmtNum(convs)}</td>
                            <td className="py-4 px-4 text-[13px] font-black text-slate-900 text-right">{fmtCost(charges)}</td>
                            <td className="py-4 px-4 text-[13px] font-semibold text-slate-400 text-right">{rate}%</td>
                            <td className={`py-4 px-4 text-[13px] font-black text-right ${roiColor}`}>{roi}x</td>
                            <td className="py-4 px-4 text-center">
                              <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black capitalize ${statusBg}`}>
                                {c.status}
                              </span>
                            </td>
                            <td className="py-4 px-6 text-center text-slate-400">
                              <button className="hover:bg-slate-100 p-1 rounded transition-colors">
                                <MoreHorizontal className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      }) : (
                        <tr>
                          <td colSpan="8" className="py-8 text-center text-[13px] font-semibold text-slate-400">
                            No campaigns found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                
                {campaignData.length > 0 && (
                  <Pagination 
                    currentPage={campPage} 
                    totalPages={Math.ceil(campaignData.length / campRowsPerPage)} 
                    rowsPerPage={campRowsPerPage} 
                    totalCount={campaignData.length} 
                    onPageChange={setCampPage} 
                    onRowsChange={setCampRowsPerPage} 
                  />
                )}
              </div>

              {/* Conversation Pricing Calculator */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-6">
                <h2 className="text-[15px] font-black text-slate-900 mb-0.5">Conversation Pricing Calculator</h2>
                <p className="text-[11px] text-slate-400 font-medium mb-6">Estimate your WhatsApp costs instantly</p>

                {/* Inputs */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Conversation Type</label>
                    <select 
                      className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-[13px] font-semibold text-slate-700 outline-none focus:border-emerald-500"
                      value={calcType}
                      onChange={(e) => setCalcType(e.target.value)}
                    >
                      <option>Marketing</option>
                      <option>Utility</option>
                      <option>Authentication</option>
                      <option>Service</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Expected Volume</label>
                    <input 
                      type="number" 
                      className="h-10 w-full rounded-xl border border-slate-200 bg-white px-4 text-[13px] font-semibold text-slate-700 outline-none focus:border-emerald-500"
                      value={calcVol}
                      onChange={(e) => setCalcVol(Number(e.target.value))}
                      min={0}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Country</label>
                    <select 
                      className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-[13px] font-semibold text-slate-700 outline-none focus:border-emerald-500"
                      value={calcCountry}
                      onChange={(e) => setCalcCountry(e.target.value)}
                    >
                      <option>India</option>
                      <option>USA</option>
                      <option>Brazil</option>
                      <option>Indonesia</option>
                    </select>
                  </div>
                </div>

                {/* Results */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {(() => {
                    const rateMapping = {
                      Marketing: pricing.marketing || 0.81,
                      Utility: pricing.utility || 0.12,
                      Authentication: pricing.auth || 0.12,
                      Service: pricing.service || 0.28,
                    };
                    const countryMult = { India: 1, USA: 3.5, Brazil: 2.1, Indonesia: 1.5 };
                    const calcRate = rateMapping[calcType] * countryMult[calcCountry];
                    const calcCharge = calcRate * calcVol;

                    return [
                      { label: "Rate Per Conv.", value: fmtCost(calcRate) },
                      { label: "Est. Charges",   value: fmtCost(calcCharge) },
                      { label: "Monthly Est.",   value: fmtCost(calcCharge) },
                      { label: "Annual Est.",    value: fmtCost(calcCharge * 12) },
                    ].map((res) => (
                      <div key={res.label} className="bg-[#f0fdf4] rounded-[16px] py-4 flex flex-col items-center justify-center">
                        <p className="text-[11px] text-slate-400 font-semibold mb-1">{res.label}</p>
                        <p className="text-[17px] font-black text-[#10B981]">{res.value}</p>
                      </div>
                    ));
                  })()}
                </div>
              </div>

              {/* Country-Wise Pricing Analytics */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-6">
                <h2 className="text-[15px] font-black text-slate-900 mb-0.5">Country-Wise Pricing Analytics</h2>
                <p className="text-[11px] text-slate-400 font-medium mb-6">Regional cost comparison across conversation types</p>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100">
                        <th className="pb-3 text-[11px] font-semibold text-slate-400">Country</th>
                        <th className="pb-3 text-[11px] font-semibold text-slate-400 text-center">Marketing</th>
                        <th className="pb-3 text-[11px] font-semibold text-slate-400 text-center">Utility</th>
                        <th className="pb-3 text-[11px] font-semibold text-slate-400 text-center">Auth</th>
                        <th className="pb-3 text-[11px] font-semibold text-slate-400 text-center">Service</th>
                        <th className="pb-3 text-[11px] font-semibold text-slate-400 text-right">Total Usage</th>
                        <th className="pb-3 text-[11px] font-semibold text-slate-400 text-right">Total Charges</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {(() => {
                        const total = totalConversations || 1000;
                        const dist = [
                          { country: "India",     flag: "🇮🇳", mult: 1,    share: 0.60, sym: "₹" },
                          { country: "USA",       flag: "🇺🇸", mult: 3.5,  share: 0.15, sym: "$" },
                          { country: "Brazil",    flag: "🇧🇷", mult: 2.1,  share: 0.10, sym: "R$" },
                          { country: "Indonesia", flag: "🇮🇩", mult: 1.5,  share: 0.08, sym: "Rp" },
                          { country: "Mexico",    flag: "🇲🇽", mult: 1.8,  share: 0.07, sym: "$" },
                        ];
                        
                        return dist.map((d, idx) => {
                          const cUsage = Math.round(total * d.share);
                          const baseRate = pricing.marketing || 0.81;
                          const cTotal = cUsage * baseRate * d.mult;
                          
                          const fmtL = (val) => `${d.sym}${(val * d.mult).toFixed(d.sym === "$" ? 3 : 2)}`;

                          return (
                            <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                              <td className="py-3 flex items-center gap-2">
                                <span className="text-sm">{d.flag}</span>
                                <span className="text-[13px] font-black text-slate-700">{d.country}</span>
                              </td>
                              <td className="py-3 text-[13px] font-semibold text-slate-600 text-center">{fmtL(pricing.marketing || 0.81)}</td>
                              <td className="py-3 text-[13px] font-semibold text-slate-600 text-center">{fmtL(pricing.utility || 0.12)}</td>
                              <td className="py-3 text-[13px] font-semibold text-slate-600 text-center">{fmtL(pricing.auth || 0.12)}</td>
                              <td className="py-3 text-[13px] font-semibold text-slate-600 text-center">{fmtL(pricing.service || 0.28)}</td>
                              <td className="py-3 text-[13px] font-semibold text-slate-400 text-right">{fmtNum(cUsage)}</td>
                              <td className="py-3 text-[13px] font-black text-[#10B981] text-right">{fmtCost(cTotal)}</td>
                            </tr>
                          );
                        });
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Bottom Cards: Billing Summary & Cost Alerts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Billing Summary */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                  <h2 className="text-[15px] font-black text-slate-900 mb-0.5">Billing Summary</h2>
                  <p className="text-[11px] text-slate-400 font-medium mb-6">Current billing cycle overview</p>

                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between items-center pb-4 border-b border-slate-50">
                      <span className="text-[12px] font-semibold text-slate-500">Billing Period</span>
                      <span className="text-[13px] font-black text-slate-900">{dayjs().startOf('month').format("MMM 1")} – {dayjs().endOf('month').format("MMM D, YYYY")}</span>
                    </div>
                    <div className="flex justify-between items-center pb-4 border-b border-slate-50">
                      <span className="text-[12px] font-semibold text-slate-500">Total Charges</span>
                      <span className="text-[14px] font-black text-slate-900">{fmtCost(totalCharges)}</span>
                    </div>
                    <div className="flex justify-between items-center pb-4 border-b border-slate-50">
                      <span className="text-[12px] font-semibold text-slate-500">GST (18%)</span>
                      <span className="text-[14px] font-black text-slate-900">{fmtCost(totalCharges * 0.18)}</span>
                    </div>
                    <div className="flex justify-between items-center pb-4 border-b border-slate-50">
                      <span className="text-[12px] font-semibold text-slate-500">Discount Applied</span>
                      <span className="text-[14px] font-black text-[#10B981]">- {fmtCost(totalCharges * 0.05)}</span>
                    </div>
                    <div className="flex justify-between items-center pb-4 border-b border-slate-50">
                      <span className="text-[12px] font-semibold text-slate-500">Coupon (SAVE10)</span>
                      <span className="text-[14px] font-black text-[#10B981]">- {fmtCost(totalCharges * 0.08)}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-[12px] font-semibold text-slate-500">Net Amount Due</span>
                      <span className="text-[16px] font-black text-[#10B981]">{fmtCost(totalCharges + (totalCharges * 0.18) - (totalCharges * 0.13))}</span>
                    </div>
                  </div>

                  <div className="bg-[#f0fdf4] rounded-[16px] p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-[#10B981]" />
                      <div>
                        <p className="text-[12px] font-bold text-[#10B981]">Payment Status: Paid</p>
                        <p className="text-[10px] font-medium text-slate-500">Next billing: {dayjs().add(1, 'month').startOf('month').format("MMM D, YYYY")}</p>
                      </div>
                    </div>
                    <button 
                      onClick={handleDownloadBilling}
                      className="bg-[#10B981] hover:bg-emerald-600 transition-colors text-white text-[11px] font-bold px-4 py-2 rounded-full shadow-sm"
                    >
                      Download
                    </button>
                  </div>
                </div>

                {/* Cost Alerts Center */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                  <h2 className="text-[15px] font-black text-slate-900 mb-0.5">Cost Alerts Center</h2>
                  <p className="text-[11px] text-slate-400 font-medium mb-6">Active notifications and warnings</p>

                  <div className="space-y-3">
                    {/* Red Alert */}
                    <div className="bg-[#fff1f2] border-l-4 border-red-400 rounded-xl rounded-l-sm p-4 flex gap-3">
                      <TriangleAlert className="w-4 h-4 text-red-500 shrink-0 mt-0.5" strokeWidth={2.5} />
                      <div>
                        <p className="text-[12px] font-bold text-slate-900 mb-1">High Spending Alert</p>
                        <p className="text-[11px] font-medium text-slate-500 leading-relaxed">Daily spend exceeded ₹1,000 threshold. Current: {fmtCost(todayData?.totalCharges || 0)} today.</p>
                      </div>
                    </div>
                    
                    {/* Amber Alert */}
                    <div className="bg-[#fffbeb] border-l-4 border-amber-400 rounded-xl rounded-l-sm p-4 flex gap-3">
                      <BellRing className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" strokeWidth={2.5} />
                      <div>
                        <p className="text-[12px] font-bold text-slate-900 mb-1">Budget Threshold at {Math.min(100, Math.round((totalCharges / 28500) * 100))}%</p>
                        <p className="text-[11px] font-medium text-slate-500 leading-relaxed">Monthly budget of ₹28,500 is {Math.min(100, Math.round((totalCharges / 28500) * 100))}% utilized with {Math.max(0, dayjs().endOf('month').diff(dayjs(), 'day'))} days remaining.</p>
                      </div>
                    </div>
                    
                    {/* Blue Alert */}
                    <div className="bg-[#eff6ff] border-l-4 border-blue-400 rounded-xl rounded-l-sm p-4 flex gap-3">
                      <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" strokeWidth={2.5} />
                      <div>
                        <p className="text-[12px] font-bold text-slate-900 mb-1">Pricing Update Notice</p>
                        <p className="text-[11px] font-medium text-slate-500 leading-relaxed">WhatsApp updated marketing conversation rates effective {dayjs().startOf('month').format("MMM 1, YYYY")}.</p>
                      </div>
                    </div>
                    
                    {/* Green Alert */}
                    <div className="bg-[#f0fdf4] border-l-4 border-[#10B981] rounded-xl rounded-l-sm p-4 flex gap-3">
                      <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" strokeWidth={2.5} />
                      <div>
                        <p className="text-[12px] font-bold text-slate-900 mb-1">Cost Optimization Applied</p>
                        <p className="text-[11px] font-medium text-slate-500 leading-relaxed">Off-peak shift saved {fmtCost(weekCharges * 0.15)} compared to last week.</p>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Industry Benchmark Analysis */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mt-6">
                <h2 className="text-[15px] font-black text-slate-900 mb-0.5">Industry Benchmark Analysis</h2>
                <p className="text-[11px] text-slate-400 font-medium mb-6">How your metrics compare against similar businesses</p>

                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
                  {(() => {
                    const cpc = totalConversations ? (totalCharges / totalConversations) : 0;
                    const cpcDir = cpc <= 0.3 ? "up" : "down";
                    const cpcColor = cpc <= 0.3 ? "#10B981" : "#f59e0b";
                    
                    const eff = totalConversations ? Math.round(((totals.marketing.convs || 0) / totalConversations) * 100) : 0;
                    const effColor = eff >= 74 ? "#10B981" : "#f59e0b";
                    
                    const mktShare = totalCharges ? Math.round(((totals.marketing.charges || 0) / totalCharges) * 100) : 0;
                    const mktColor = mktShare <= 48 ? "#10B981" : "#f59e0b";

                    const utlShare = totalCharges ? Math.round(((totals.utility.charges || 0) / totalCharges) * 100) : 0;
                    const utlColor = utlShare <= 29 ? "#10B981" : "#f59e0b";
                    
                    // Simple mock ROI derived from conversions
                    const mockRev = (totals.marketing.convs || 0) * 250;
                    const roi = totalCharges ? (mockRev / totalCharges).toFixed(1) : 0;
                    const roiColor = roi >= 6.2 ? "#10B981" : "#f59e0b";

                    return [
                      { label: "Cost Per\nConversation", val: fmtCost(cpc), ind: "₹0.30", dir: cpcDir, color: cpcColor, fill: `${Math.min(100, Math.round((cpc / 0.5) * 100))}%` },
                      { label: "Conversation\nEfficiency", val: `${eff}%`, ind: "74%", dir: eff >= 74 ? "up" : "down", color: effColor, fill: `${eff}%` },
                      { label: "Marketing Cost Share", val: `${mktShare}%`, ind: "48%", dir: mktShare <= 48 ? "up" : "down", color: mktColor, fill: `${mktShare}%` },
                      { label: "Utility Cost Share", val: `${utlShare}%`, ind: "29%", dir: utlShare <= 29 ? "up" : "down", color: utlColor, fill: `${utlShare}%` },
                      { label: "Campaign ROI", val: `${roi}x`, ind: "6.2", dir: roi >= 6.2 ? "up" : "down", color: roiColor, fill: `${Math.min(100, Math.round((roi / 10) * 100))}%` },
                    ].map((b, i) => (
                      <div key={i} className="bg-[#fafafa] rounded-[16px] border border-slate-100 p-5 flex flex-col justify-between h-[120px]">
                        <p className="text-[11px] text-slate-500 font-bold leading-snug whitespace-pre-line">{b.label}</p>
                        
                        <div className="flex items-end gap-2 mt-auto mb-3">
                          <span className="text-[20px] font-black" style={{ color: b.color }}>{b.val}</span>
                          {b.dir === "up" ? (
                            <ArrowUpRight className="w-3.5 h-3.5 mb-1" strokeWidth={3} style={{ color: b.color }} />
                          ) : (
                            <ArrowDownRight className="w-3.5 h-3.5 mb-1" strokeWidth={3} style={{ color: b.color }} />
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-400 font-semibold shrink-0">Industry: {b.ind}</span>
                          <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-500" style={{ width: b.fill, backgroundColor: b.color }} />
                          </div>
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </div>

            </div>

            {/* ── RIGHT SIDEBAR ── */}
            <div className="xl:col-span-1">
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-6">
                
                {/* INSIGHTS */}
                <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Insights</p>
                  <div>
                    <InsightBar label="Spend Score"        value={78} color="#10B981" icon={Star}     />
                    <InsightBar label="Cost Efficiency"    value={82} color="#3b82f6" icon={Zap}      />
                    <InsightBar label="Conv. Health"       value={91} color="#a855f7" icon={Shield}   />
                    <InsightBar label="Budget Utilization" value={87} color="#f59e0b" icon={Activity} />
                    <InsightBar label="Forecast Accuracy"  value={94} color="#10B981" icon={Target}   />
                  </div>
                </div>

                <div className="border-t border-slate-100"></div>

                {/* MONTHLY SAVINGS */}
                <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Monthly Savings</p>
                  <div className="bg-[#f0fdf4] rounded-[16px] border border-emerald-100 p-5">
                    <p className="text-[28px] font-black text-[#10B981] leading-tight">₹3,980</p>
                    <p className="text-[11px] text-slate-500 font-medium mt-1 mb-5">Savings opportunity this month</p>
                    <button 
                      onClick={() => setShowOptimizationsModal(true)}
                      className="w-full bg-[#10B981] hover:bg-emerald-600 transition-colors text-white text-[12px] font-bold rounded-full py-2.5 shadow-sm"
                    >
                      View Optimizations
                    </button>
                  </div>
                </div>

                <div className="border-t border-slate-100"></div>

                {/* PEAK INSIGHTS */}
                <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Peak Insights</p>
                  <div className="space-y-3">
                    {[
                      { label: "Peak Day",        val: "Tuesday"    },
                      { label: "Peak Hour",       val: "10 AM–12 PM"},
                      { label: "Top Campaign",    val: "Diwali Sale" },
                      { label: "Costly Category", val: "Marketing"  },
                      { label: "Best Efficiency", val: "Service"    },
                    ].map((r) => (
                      <div key={r.label} className="flex justify-between items-center border-b border-slate-50 pb-2.5 last:border-0 last:pb-0">
                        <span className="text-[12px] text-slate-500 font-medium">{r.label}</span>
                        <span className="text-[12px] font-black text-slate-900">{r.val}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-slate-100"></div>

                {/* QUICK STATS */}
                <div>
                  <p className="text-sm font-medium text-slate-900 mb-3">Quick Stats</p>
                </div>

              </div>
            </div>
          </div>
        </div>
        </div>
      </div>

      {/* ── OPTIMIZATIONS MODAL ── */}
      {showOptimizationsModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Header */}
            <div className="bg-[#10B981] p-6 relative">
              <div className="absolute top-0 right-0 p-4">
                <button onClick={() => setShowOptimizationsModal(false)} className="bg-white/20 hover:bg-white/30 text-white rounded-full p-2 transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-white/20 p-2 rounded-[12px]">
                    <Zap className="w-6 h-6 text-white" strokeWidth={2.5} />
                  </div>
                  <h2 className="text-[22px] font-extrabold text-white">Savings Breakdown</h2>
                </div>
                <p className="text-white text-[13px] font-medium opacity-90 max-w-[90%]">
                  AI-driven actionable steps to unlock ₹3,980 in monthly savings based on your recent conversation data.
                </p>
              </div>
            </div>

            {/* Body */}
            <div className="p-5 space-y-3.5 bg-white">
              
              <div className="flex gap-3.5 items-start p-3.5 bg-white border border-[#10B981]/40 shadow-sm rounded-2xl transition-colors hover:border-[#10B981]/50">
                <div className="bg-white border border-slate-100 w-10 h-10 flex items-center justify-center rounded-xl shrink-0">
                  <svg className="w-5 h-5 text-[#a855f7]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-[14px] font-bold text-slate-900">Template Consolidation</h3>
                    <span className="text-[9px] bg-[#ecfdf5] text-[#10B981] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">SAVE ~₹1,240</span>
                  </div>
                  <p className="text-[12px] text-slate-500 font-medium leading-relaxed pr-2">
                    You have 3 excessively long Marketing templates that often split into multiple messages, triggering double 24-hour conversation charges. Shorten them by 15% to keep them within single limits.
                  </p>
                </div>
              </div>

              <div className="flex gap-3.5 items-start p-3.5 bg-slate-50/50 border border-slate-200 rounded-2xl transition-colors hover:border-[#10B981]/40">
                <div className="bg-white border border-slate-100 w-10 h-10 flex items-center justify-center rounded-xl shrink-0">
                  <svg className="w-5 h-5 text-[#eab308]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-[14px] font-bold text-slate-900">Engagement Filtering</h3>
                    <span className="text-[9px] bg-[#ecfdf5] text-[#10B981] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">SAVE ~₹1,850</span>
                  </div>
                  <p className="text-[12px] text-slate-500 font-medium leading-relaxed pr-2">
                    12% of your recent broadcast targets haven't opened a message in 60 days. Automatically excluding these inactive "dead" contacts from your next bulk broadcast will instantly recover wasted spend.
                  </p>
                </div>
              </div>

              <div className="flex gap-3.5 items-start p-3.5 bg-slate-50/50 border border-slate-200 rounded-2xl transition-colors hover:border-[#10B981]/40">
                <div className="bg-white border border-slate-100 w-10 h-10 flex items-center justify-center rounded-xl shrink-0">
                  <svg className="w-5 h-5 text-[#3b82f6]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-[14px] font-bold text-slate-900">Channel Routing</h3>
                    <span className="text-[9px] bg-[#ecfdf5] text-[#10B981] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">SAVE ~₹600</span>
                  </div>
                  <p className="text-[12px] text-slate-500 font-medium leading-relaxed pr-2">
                    You're sending non-urgent account updates via WhatsApp Utility templates. Shifting these to Email/SMS while preserving WhatsApp for high-priority alerts can heavily lower monthly fixed costs.
                  </p>
                </div>
              </div>

              <div className="flex gap-3.5 items-start p-3.5 bg-slate-50/50 border border-slate-200 rounded-2xl transition-colors hover:border-[#10B981]/40">
                <div className="bg-white border border-slate-100 w-10 h-10 flex items-center justify-center rounded-xl shrink-0">
                  <svg className="w-5 h-5 text-[#ef4444]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-[14px] font-bold text-slate-900">Time-of-Day Analysis</h3>
                    <span className="text-[9px] bg-[#ecfdf5] text-[#10B981] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">SAVE ~₹290</span>
                  </div>
                  <p className="text-[12px] text-slate-500 font-medium leading-relaxed pr-2">
                    15% of your Marketing broadcasts are sent between 10 PM and 2 AM. These have an incredibly low 3% read rate and yield near-zero ROI. Restrict broadcasts to peak engagement hours (10 AM–2 PM).
                  </p>
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="bg-slate-50 border-t border-slate-100 p-6 flex justify-between items-center">
              <p className="text-[12px] font-bold text-slate-400">Total potential impact: ₹3,980/month</p>
              <div className="flex gap-3">
                <button onClick={() => setShowOptimizationsModal(false)} className="px-5 py-2 rounded-full text-[13px] font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-colors">
                  Close
                </button>
                <button onClick={() => setShowOptimizationsModal(false)} className="px-5 py-2 rounded-full text-[13px] font-bold text-white bg-[#10B981] hover:bg-emerald-600 transition-colors shadow-sm">
                  Apply Automations
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default WhatsAppPricing;
