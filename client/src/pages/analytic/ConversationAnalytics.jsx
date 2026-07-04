import { useState, useEffect, useCallback } from "react";
import GrowthOpportunityAnalysis from "./GrowthOpportunityAnalysis";
import WhatsAppPricing from "./WhatsAppPricing";
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
  ChevronRight,
  ChevronLeft,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { IconButton } from "@mui/material";
import AnalyticsApi from "../../services/AnalyticsApi";

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

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtDate = (dateStr) => {
  // dateStr is 'YYYY-MM-DD'
  if (!dateStr) return "";
  const [, m, d] = dateStr.split("-");
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${months[parseInt(m) - 1]} ${String(d).padStart(2, "0")}, ${dateStr.split("-")[0]}`;
};

const fmtNum = (n = 0) => Number(n).toLocaleString("en-IN");
const fmtCost = (n = 0) => `₹${Number(n).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

// ─── Category config ──────────────────────────────────────────────────────────
const CATEGORY_CONFIG = {
  marketing: {
    label: "MARKETING",
    color: "#10B981",
    icon: <Megaphone className="w-5 h-5 text-[#10B981]" />,
    iconBg: "bg-emerald-50",
    textColor: "text-slate-900",
  },
  utility: {
    label: "UTILITY",
    color: "#3b82f6",
    icon: <Settings className="w-5 h-5 text-blue-500" />,
    iconBg: "bg-blue-50",
    textColor: "text-slate-900",
  },
  auth: {
    label: "AUTHENTICATION",
    color: "#f43f5e",
    icon: <ShieldCheck className="w-5 h-5 text-rose-500" />,
    iconBg: "bg-rose-50",
    textColor: "text-rose-500",
  },
  service: {
    label: "SERVICE",
    color: "#94a3b8",
    icon: <UserRound className="w-5 h-5 text-slate-500" />,
    iconBg: "bg-slate-100",
    textColor: "text-slate-900",
  },
};

// ─── Main component ───────────────────────────────────────────────────────────
const ConversationAnalytics = () => {
  const [showGrowth, setShowGrowth] = useState(false);
  const [showPricing, setShowPricing] = useState(false);
  const [view, setView] = useState("table");
  const [dateRange, setDateRange] = useState([
    dayjs().subtract(30, "day"),
    dayjs(),
  ]);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async (start, end) => {
    setLoading(true);
    setError(null);
    try {
      const startDate = (start || dateRange[0]).format("YYYY-MM-DD");
      const endDate = (end || dateRange[1]).format("YYYY-MM-DD");
      const res = await AnalyticsApi.getConversationAnalytics({ startDate, endDate });
      if (res.success) {
        setData(res.data);
      } else {
        setError("Failed to load conversation analytics.");
      }
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || "Failed to load analytics data.");
    } finally {
      setLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Load on mount with default range
  useEffect(() => {
    fetchData(dateRange[0], dateRange[1]);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleApplyFilter = () => {
    fetchData(dateRange[0], dateRange[1]);
  };

  // ─── Derived values ───────────────────────────────────────────────────────
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

  // ─── Chart config ─────────────────────────────────────────────────────────
  const chartCategories = data?.chartCategories || [];
  const chartSeries = data?.chartSeries || [
    { name: "MARKETING", data: [] },
    { name: "UTILITY",   data: [] },
    { name: "AUTH",      data: [] },
    { name: "SERVICE",   data: [] },
  ];

  const chartOptions = {
    chart: {
      type: 'bar',
      stacked: false,
      toolbar: { show: false },
      fontFamily: 'Urbanist, sans-serif',
    },
    colors: ['#3b82f6', '#10b981', '#06b6d4', '#f97316'],
    plotOptions: {
      bar: { horizontal: false, columnWidth: '95%', borderRadius: 2 },
    },
    dataLabels: { enabled: false },
    stroke: { show: true, width: 2, colors: ['transparent'] },
    xaxis: {
      categories: chartCategories,
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: { style: { colors: '#94a3b8', fontWeight: 600, fontSize: '12px' } },
    },
    yaxis: {
      labels: { style: { colors: '#94a3b8', fontWeight: 600, fontSize: '12px' } },
    },
    fill: { opacity: 1 },
    legend: {
      position: 'top',
      horizontalAlign: 'right',
      fontSize: '12px',
      fontWeight: 700,
      markers: { radius: 12 },
    },
    grid: { borderColor: '#f1f5f9', strokeDashArray: 4 },
    tooltip: {
      theme: 'light',
      style: { fontFamily: "Urbanist, sans-serif" },
    },
    noData: {
      text: "No conversation data for this period",
      align: "center",
      verticalAlign: "middle",
      style: { color: "#94a3b8", fontSize: "14px" },
    },
  };

  // ─── Sidebar category cards ────────────────────────────────────────────────
  const sidebarCards = ["marketing", "utility", "auth", "service"].map((cat) => ({
    key: cat,
    ...CATEGORY_CONFIG[cat],
    count: fmtNum(
      view === "table" ? totals[cat]?.qty : (data?.chartSeries?.find(s => s.name === cat.toUpperCase())?.data?.reduce((a, b) => a + b, 0) || 0)
    ),
    avgCharge: fmtCost(pricing[cat]),
  }));

  // ─── MUI input styles ─────────────────────────────────────────────────────
  const inputSx = {
    "& .MuiOutlinedInput-root": {
      borderRadius: "8px",
      bgcolor: "white",
      height: "42px",
      "& fieldset": { borderColor: "#e2e8f0" },
      "&:hover fieldset": { borderColor: "#10b981" },
      "&.Mui-focused fieldset": { borderColor: "#10b981" },
      "& .MuiInputBase-input": {
        fontWeight: 600,
        color: "#1e293b",
        fontSize: "0.875rem",
        padding: "0 10px",
      },
    },
  };

  // ─── CSV Export ───────────────────────────────────────────────────────────
  const handleExport = () => {
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
    const csv = "data:text/csv;charset=utf-8," + headers + rows.join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csv));
    link.setAttribute("download", `conversation_analytics_${dateRange[0].format("YYYY-MM-DD")}_to_${dateRange[1].format("YYYY-MM-DD")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (showGrowth) {
    return <GrowthOpportunityAnalysis onBack={() => setShowGrowth(false)} />;
  }

  if (showPricing) {
    return <WhatsAppPricing onBack={() => setShowPricing(false)} />;
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <div className="flex flex-col h-full bg-[#f8fafc] overflow-hidden font-['Urbanist']">
        <div className="flex-1 overflow-y-auto p-6 lg:p-8">
          <div className="max-w-[1600px] mx-auto">

            {/* HEADER */}
            <div className="mb-6 flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-center">
                <FileText className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800 tracking-tight">
                  Conversational Analytics
                </h1>
                <p className="text-xs text-slate-400 font-medium mt-0.5">
                  Detailed performance metrics across communication channels
                </p>
              </div>
            </div>

            {/* MAIN GRID */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">

              {/* LEFT — TABLE or CHART */}
              <div className="xl:col-span-2 space-y-4">

                {/* FILTER ROW */}
                <div className="flex flex-wrap items-end gap-4">
                  <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
                      From Date
                    </p>
                    <DatePicker
                      value={dateRange[0]}
                      onChange={(val) => setDateRange([val, dateRange[1]])}
                      views={['year', 'month', 'day']}
                      slots={{ calendarHeader: CustomDatePickerHeader }}
                      slotProps={{ textField: { sx: { width: 170, ...inputSx } } }}
                    />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
                      To Date
                    </p>
                    <DatePicker
                      value={dateRange[1]}
                      onChange={(val) => setDateRange([dateRange[0], val])}
                      views={['year', 'month', 'day']}
                      slots={{ calendarHeader: CustomDatePickerHeader }}
                      slotProps={{ textField: { sx: { width: 170, ...inputSx } } }}
                    />
                  </div>

                  {/* View toggle */}
                  <div className="flex bg-gray-50/50 p-1.5 rounded-xl border border-gray-100 gap-1 h-fit">
                    <button
                      onClick={() => setView("table")}
                      className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
                        view === "table"
                          ? "bg-white shadow-sm text-gray-900 border border-gray-100"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      Table View
                    </button>
                    <button
                      onClick={() => setView("chart")}
                      className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
                        view === "chart"
                          ? "bg-white shadow-sm text-gray-900 border border-gray-100"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      Chart View
                    </button>
                  </div>
                </div>

                {/* TABLE VIEW */}
                {view === "table" ? (
                  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    {loading ? (
                      <div className="py-20 flex flex-col items-center gap-3 text-slate-400">
                        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                        <p className="text-sm font-medium">Loading analytics…</p>
                      </div>
                    ) : error ? (
                      <div className="py-20 flex flex-col items-center gap-3 text-slate-400">
                        <AlertCircle className="w-8 h-8 text-rose-400" />
                        <p className="text-sm font-medium text-rose-500">{error}</p>
                        <button
                          onClick={handleApplyFilter}
                          className="text-xs font-semibold text-emerald-600 hover:underline"
                        >
                          Retry
                        </button>
                      </div>
                    ) : tableData.length === 0 ? (
                      <div className="py-20 flex flex-col items-center gap-3 text-slate-400">
                        <FileText className="w-8 h-8 opacity-30" />
                        <p className="text-sm font-medium">No conversations found for this period.</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse min-w-[700px]">
                          <thead>
                            <tr className="bg-[#f8fafc]">
                              <th rowSpan="2" className="px-4 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-200 bg-[#f1f5f9] border-r border-slate-100 text-left w-24">
                                Date
                              </th>
                              <th colSpan="2" className="px-3 py-4 text-[10px] font-black text-[#10B981] uppercase tracking-widest text-center border-b border-slate-200 border-r border-slate-100">
                                Marketing
                              </th>
                              <th colSpan="2" className="px-3 py-4 text-[10px] font-black text-blue-500 uppercase tracking-widest text-center border-b border-slate-200 border-r border-slate-100">
                                Utility
                              </th>
                              <th colSpan="2" className="px-3 py-4 text-[10px] font-black text-rose-500 uppercase tracking-widest text-center border-b border-slate-200 border-r border-slate-100">
                                Auth
                              </th>
                              <th colSpan="2" className="px-3 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center border-b border-slate-200 border-r border-slate-100">
                                Service
                              </th>
                              <th rowSpan="2" className="px-3 py-4 text-[10px] font-black text-slate-600 uppercase tracking-widest border-b border-slate-200 border-r border-slate-100 text-center bg-[#f8fafc] leading-tight">
                                Total<br />Conv.
                              </th>
                              <th rowSpan="2" className="px-3 py-4 text-[10px] font-black text-slate-600 uppercase tracking-widest border-b border-slate-200 whitespace-nowrap text-center bg-[#f8fafc] leading-tight">
                                Total<br />Charges<br />(INR)
                              </th>
                            </tr>
                            <tr className="bg-[#f8fafc]">
                              {["Qty","Cost","Qty","Cost","Qty","Cost","Qty","Cost"].map((l, i) => (
                                <th
                                  key={i}
                                  className={`px-3 py-2 text-[10px] font-semibold text-slate-400 text-center border-b border-slate-200 ${
                                    i % 2 === 1 ? "border-r border-slate-100" : ""
                                  }`}
                                >
                                  {l}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {tableData.map((row, i) => {
                              const dateLabel = fmtDate(row.date).split(" ");
                              return (
                                <tr
                                  key={row.date}
                                  className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                                >
                                  <td
                                    className={`px-4 py-5 text-sm text-slate-900 font-bold border-r border-slate-100 leading-snug ${
                                      i % 2 === 0 ? "bg-[#f1f5f9]" : "bg-[#f8fafc]"
                                    }`}
                                  >
                                    <div className="flex flex-col">
                                      <span>{dateLabel[0]}</span>
                                      <span>{dateLabel[1]}</span>
                                      <span>{dateLabel[2]}</span>
                                    </div>
                                  </td>
                                  <td className="px-3 py-5 text-sm text-slate-700 text-center font-semibold">
                                    {fmtNum(row.marketing.qty)}
                                  </td>
                                  <td className="px-3 py-5 text-sm text-slate-700 text-center font-semibold border-r border-slate-100">
                                    {fmtCost(row.marketing.cost)}
                                  </td>
                                  <td className="px-3 py-5 text-sm text-slate-700 text-center font-semibold">
                                    {fmtNum(row.utility.qty)}
                                  </td>
                                  <td className="px-3 py-5 text-sm text-slate-700 text-center font-semibold border-r border-slate-100">
                                    {fmtCost(row.utility.cost)}
                                  </td>
                                  <td className="px-3 py-5 text-sm text-slate-700 text-center font-semibold">
                                    {fmtNum(row.auth.qty)}
                                  </td>
                                  <td className="px-3 py-5 text-sm text-slate-700 text-center font-semibold border-r border-slate-100">
                                    {fmtCost(row.auth.cost)}
                                  </td>
                                  <td className="px-3 py-5 text-sm text-slate-700 text-center font-semibold">
                                    {fmtNum(row.service.qty)}
                                  </td>
                                  <td className="px-3 py-5 text-sm text-slate-700 text-center font-semibold border-r border-slate-100">
                                    {fmtCost(row.service.cost)}
                                  </td>
                                  <td className="px-3 py-5 text-sm font-bold text-slate-900 border-r border-slate-100 text-center">
                                    {fmtNum(row.totalConv)}
                                  </td>
                                  <td className="px-3 py-5 text-sm font-bold text-[#10B981] whitespace-nowrap text-center">
                                    {fmtCost(row.totalCharges)}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                ) : (
                  /* CHART VIEW */
                  <>
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                      <h3 className="text-xl font-black text-slate-900">Conversation Volume</h3>
                      <p className="text-sm text-slate-500 mb-2">
                        Daily traffic categorised by intent
                      </p>
                      {loading ? (
                        <div className="h-[380px] flex items-center justify-center">
                          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                      ) : (
                        <Chart
                          options={chartOptions}
                          series={chartSeries}
                          type="bar"
                          height={380}
                        />
                      )}
                    </div>

                    {/* Growth Opportunity Detected banner */}
                    <div className="bg-[#ecfdf5] border border-emerald-100 rounded-2xl p-5 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 bg-[#10B981] rounded-full flex items-center justify-center text-white shrink-0">
                          <ShieldCheck className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-slate-900">Growth Opportunity Detected</h4>
                          <p className="text-xs text-slate-500 font-medium mt-0.5">
                            Marketing conversations are up 24% compared to last week.<br />
                            Consider scaling your current campaign.
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowGrowth(true)}
                        className="shrink-0 px-5 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-black rounded-xl hover:bg-slate-50 transition-all shadow-sm"
                      >
                        View Analysis
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* RIGHT SIDEBAR */}
              <div className="xl:col-span-1 space-y-4">

                {/* Apply Filter button */}
                <button
                  onClick={handleApplyFilter}
                  disabled={loading}
                  className="w-full h-[42px] mt-[21px] bg-[#10B981] text-white text-sm font-black rounded-2xl hover:bg-[#059669] transition-all shadow-lg shadow-emerald-500/25 disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Loading…
                    </>
                  ) : (
                    "Apply Filter"
                  )}
                </button>

                {view === "table" ? (
                  <>
                    {/* Green Summary Card */}
                    <div className="bg-[#10B981] rounded-2xl p-6 text-white relative overflow-hidden">
                      <div className="absolute -top-6 -right-6 w-28 h-28 bg-white/10 rounded-full blur-xl" />
                      <div className="relative z-10">
                        <div className="flex justify-between items-center mb-6">
                          <div className="p-2.5 bg-white/25 rounded-xl">
                            <FileText className="w-5 h-5 text-white" />
                          </div>
                          <span className="px-4 py-1 bg-white/25 rounded-full text-[10px] font-black uppercase tracking-[0.15em]">
                            Report
                          </span>
                        </div>
                        <div className="mb-5">
                          <p className="text-[9px] font-black text-white/70 uppercase tracking-[0.18em] mb-1.5">
                            Total Conversations
                          </p>
                          <p className="text-5xl font-black leading-none">
                            {loading ? "…" : fmtNum(totalConversations)}
                          </p>
                        </div>
                        <div>
                          <p className="text-[9px] font-black text-white/70 uppercase tracking-[0.18em] mb-1.5">
                            Total Charges
                          </p>
                          <p className="text-4xl font-black leading-none">
                            {loading ? "…" : fmtCost(totalCharges)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Category Breakdown Cards */}
                    {["marketing", "utility", "auth", "service"].map((cat) => {
                      const cfg = CATEGORY_CONFIG[cat];
                      const catData = totals[cat] || { qty: 0, cost: 0 };
                      return (
                        <div key={cat} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                          <div className="flex items-center gap-3 mb-4">
                            <div className={`w-10 h-10 ${cfg.iconBg} rounded-xl flex items-center justify-center shrink-0`}>
                              {cfg.icon}
                            </div>
                            <div>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-tight">
                                {cfg.label}
                              </p>
                              <p className="text-xl font-black text-slate-900 leading-tight">
                                {loading ? "…" : fmtNum(catData.qty)}{" "}
                                <span className="text-xs text-slate-400 font-semibold normal-case tracking-normal">
                                  Items
                                </span>
                              </p>
                            </div>
                          </div>
                          <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                            <span className="text-sm font-medium text-slate-400">Avg Charge</span>
                            <span className={`text-sm font-black ${cfg.textColor}`}>
                              {fmtCost(pricing[cat])}
                            </span>
                          </div>
                        </div>
                      );
                    })}

                    {/* Export */}
                    <button
                      onClick={handleExport}
                      disabled={loading || tableData.length === 0}
                      className="w-full flex items-center justify-center gap-2 py-3 text-sm font-bold text-[#10B981] hover:text-[#059669] transition-colors disabled:opacity-40"
                    >
                      <Download className="w-4 h-4" />
                      Export Detailed Report
                    </button>
                  </>
                ) : (
                  /* CHART VIEW SIDEBAR */
                  <>
                    {/* Summary Report Card */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                      <div className="flex items-center justify-between px-5 pt-5 pb-3">
                        <h3 className="text-base font-black text-slate-900">Summary Report</h3>
                        <button className="text-slate-300 hover:text-slate-500 text-lg leading-none">···</button>
                      </div>
                      <div className="px-5 py-4 border-l-4 border-[#10B981] ml-0">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                          Total Conversation
                        </p>
                        <p className="text-4xl font-black text-slate-900">
                          {loading ? "…" : fmtNum(totalConversations)}
                        </p>
                      </div>
                      <div className="px-5 py-4 border-t border-slate-50">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                          Total Charges
                        </p>
                        <p className="text-3xl font-black text-[#10B981]">
                          {loading ? "…" : fmtCost(totalCharges)}
                        </p>
                      </div>
                    </div>

                    {/* Marketing card */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                      <div className="flex items-center gap-2 mb-4">
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0" />
                        <span className="text-sm font-black text-slate-700">Marketing</span>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Count</p>
                          <p className="text-2xl font-black text-slate-900">
                            {loading ? "…" : fmtNum(totals.marketing.qty)}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Charges</p>
                          <p className="text-2xl font-black text-slate-900">
                            {loading ? "…" : fmtCost(totals.marketing.cost)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Service card */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                      <div className="flex items-center gap-2 mb-4">
                        <span className="w-2.5 h-2.5 rounded-full bg-orange-400 shrink-0" />
                        <span className="text-sm font-black text-slate-700">Service</span>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Count</p>
                          <p className="text-2xl font-black text-slate-900">
                            {loading ? "…" : fmtNum(totals.service.qty)}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Charges</p>
                          <p className="text-2xl font-black text-slate-900">
                            {fmtCost(0)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Utility + Auth Row */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0" />
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Utility</span>
                          </div>
                          <p className="text-3xl font-black text-slate-900">
                            {loading ? "…" : fmtNum(totals.utility.qty)}
                          </p>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shrink-0" />
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Auth</span>
                          </div>
                          <p className="text-3xl font-black text-slate-900">
                            {loading ? "…" : fmtNum(totals.auth.qty)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Pricing Details */}
                    <div
                      className="bg-[#064e3b] rounded-2xl p-5 text-white cursor-pointer group hover:bg-[#065f46] transition-all"
                      onClick={() => setShowPricing(true)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[9px] font-black uppercase tracking-widest text-white/50 mb-1">Pricing Details</p>
                          <p className="text-sm font-black">WhatsApp Conversation Pricing</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-white/60 group-hover:translate-x-1 transition-transform shrink-0" />
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </LocalizationProvider>
  );
};

export default ConversationAnalytics;
