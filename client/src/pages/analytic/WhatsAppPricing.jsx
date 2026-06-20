import { useState } from "react";
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
} from "lucide-react";

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

  // ── spending rows ──────────────────────────────────────────────────────────
  const spending = [
    { label: "Today",        amount: "₹847",      color: "#10B981", barW: "4%",   convs: "3,660 conversations"   },
    { label: "This Week",    amount: "₹5,920",    color: "#3b82f6", barW: "30%",  convs: "25,610 conversations"  },
    { label: "This Month",   amount: "₹24,800",   color: "#f59e0b", barW: "60%",  convs: "107,280 conversations" },
    { label: "This Quarter", amount: "₹68,400",   color: "#a855f7", barW: "74%",  convs: "295,740 conversations" },
    { label: "This Year",    amount: "₹1,98,600", color: "#f43f5e", barW: "100%", convs: "858,900 conversations" },
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
  const donutSeries = [52, 25, 14, 9];

  // ── monthly cost trend (single total line, Jan–Dec) ────────────────────────
  const trendOptions = {
    chart: {
      type: chartType === "Area" ? "area" : "line",
      toolbar: { show: false },
      fontFamily: "Urbanist, sans-serif",
      background: "transparent",
      animations: { enabled: true },
    },
    colors: ["#10B981"],
    stroke: { curve: "smooth", width: 2, colors: ["#10B981"] },
    dataLabels: { enabled: false },
    markers: { size: 0 },
    xaxis: {
      categories: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: { style: { colors: "#94a3b8", fontSize: "10px", fontWeight: 600 } },
    },
    yaxis: {
      min: 0,
      max: 12000,
      tickAmount: 4,
      labels: {
        style: { colors: "#94a3b8", fontSize: "10px", fontWeight: 600 },
        formatter: (v) => `₹${(v / 1000).toFixed(0)}K`,
      },
    },
    grid: { borderColor: "#f1f5f9", strokeDashArray: 4 },
    legend: { show: false },
    tooltip: { theme: "light" },
    fill: chartType === "Area"
      ? {
          type: "gradient",
          gradient: {
            shade: "light",
            type: "vertical",
            shadeIntensity: 0.5,
            gradientToColors: ["#ccfbf1"],
            inverseColors: false,
            opacityFrom: 0.55,
            opacityTo: 0.05,
            stops: [0, 100],
          },
        }
      : { type: "solid", opacity: 1 },
  };

  const trendSeries = [
    { name: "Total Cost", data: [4500, 3500, 4600, 6500, 6000, 7000, 7500, 8000, 8500, 9500, 9000, null] },
  ];

  // ── conversation volume bar ────────────────────────────────────────────────
  const volOptions = {
    chart: { type: "bar", toolbar: { show: false }, fontFamily: "Urbanist, sans-serif" },
    colors: ["#3b82f6", "#10B981", "#06b6d4", "#f97316"],
    plotOptions: { bar: { columnWidth: "55%", borderRadius: 2 } },
    dataLabels: { enabled: false },
    xaxis: {
      categories: ["21 May","23 May","25 May","28 May","29 May","30 May","May","3 Jun","4 Jun","5 Jun","6 Jun","8 Jun","9 Jun","10 Jun","12 Jun","13 Jun","16 Jun","17 Jun"],
      labels: { style: { colors: "#94a3b8", fontSize: "9px", fontWeight: 600 }, rotate: -45 },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: { max: 40, tickAmount: 4, labels: { style: { colors: "#94a3b8", fontSize: "10px" } } },
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

  const volSeries = [
    { name: "MARKETING", data: [38,2,0,20,1,2,0,1,3,2,2,1,0,3,4,5,4,7] },
    { name: "UTILITY",   data: [2,1,0,2,1,0,1,2,1,1,1,0,15,2,1,2,3,1]  },
    { name: "AUTH",      data: [1,0,0,1,0,1,0,1,0,0,0,0,0,1,0,0,0,0]   },
    { name: "SERVICE",   data: [3,1,1,1,0,1,2,0,2,1,3,0,1,0,2,3,2,3]   },
  ];

  const breakdown = [
    { label: "Marketing",      pct: 52, color: "#10B981", cost: "₹12,840", convs: "55.6K convs" },
    { label: "Utility",        pct: 25, color: "#3b82f6", cost: "₹6,210",  convs: "28.7K convs" },
    { label: "Authentication", pct: 14, color: "#f59e0b", cost: "₹3,480",  convs: "17.4K convs" },
    { label: "Service",        pct: 9,  color: "#a855f7", cost: "₹2,270",  convs: "12.8K convs" },
  ];

  // ── category stat cards ────────────────────────────────────────────────────
  const catCards = [
    { label: "Marketing",      color: "#10B981", count: "55,620", perConv: "₹0.231", total: "₹12,840", totalColor: "text-emerald-600", barW: "55%"  },
    { label: "Utility",        color: "#3b82f6", count: "28,700", perConv: "₹0.216", total: "₹6,210",  totalColor: "text-blue-600",    barW: "30%"  },
    { label: "Authentication", color: "#f59e0b", count: "17,400", perConv: "₹0.200", total: "₹3,480",  totalColor: "text-amber-600",   barW: "18%"  },
    { label: "Service",        color: "#a855f7", count: "12,800", perConv: "₹0.177", total: "₹2,270",  totalColor: "text-purple-600",  barW: "12%"  },
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
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-2 border border-slate-200 rounded-full px-3 py-1.5 text-slate-600 bg-white cursor-pointer hover:bg-slate-50 transition-colors whitespace-nowrap">
              <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="font-semibold text-[12px]">Jun 1 – Jun 15, 2026</span>
              <svg className="w-3 h-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            <button
              className="flex items-center gap-2 bg-[#10B981] hover:bg-[#059669] text-white text-[12px] font-bold px-4 py-1.5 rounded-full transition-all shadow-md whitespace-nowrap"
            >
              <RefreshCw className="w-3.5 h-3.5 shrink-0" />
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
                  { badge: "+12.4%", badgeUp: true,  badgeColor: "bg-red-50 text-red-500",         label: "TOTAL CHARGES",       value: "₹24,800",  sub: "This month"        },
                  { badge: "+8.2%",  badgeUp: true,  badgeColor: "bg-emerald-50 text-emerald-600", label: "TOTAL CONVERSATIONS", value: "1,07,280", sub: "This month"        },
                  { badge: "-0.9%",  badgeUp: false, badgeColor: "bg-red-50 text-red-500",         label: "AVG COST / CONV.",    value: "₹0.231",   sub: "Per conversation" },
                  { badge: "+15.2%", badgeUp: true,  badgeColor: "bg-red-50 text-red-500",         label: "MARKETING COST",      value: "₹12,840",  sub: "55,620 convs"     },
                  { badge: "-3.4%",  badgeUp: false, badgeColor: "bg-red-50 text-red-500",         label: "SERVICE COST",        value: "₹2,270",   sub: "12,800 convs"     },
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
                  {heatDays.map((day, dIdx) => (
                    <div key={day} className="flex items-center gap-3">
                      <div className="w-8 text-[11px] text-slate-500 font-semibold text-left shrink-0">{day}</div>
                      <div className="flex flex-1 gap-[3px]">
                        {heatHours.map((h) => {
                          const v = getHeatVal(dIdx, h);
                          const color = heatColors[Math.min(v, heatColors.length - 1)];
                          return (
                            <div
                              key={h}
                              className="flex-1 h-[22px] rounded-full cursor-pointer hover:brightness-90 transition-all"
                              style={{ backgroundColor: color }}
                            />
                          );
                        })}
                      </div>
                    </div>
                  ))}
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

                <div className="flex gap-6 items-start">
                  {/* Left: 2x2 Cards Grid */}
                  <div className="grid grid-cols-2 gap-4 shrink-0" style={{ width: "42%" }}>
                    {[
                      { label: "Next 7 Days",  amount: "₹6,100",  convs: "26.4K convs", save: "Save ₹420"   },
                      { label: "Next 30 Days", amount: "₹26,800", convs: "115.9K convs", save: "Save ₹1,840" },
                      { label: "Next Quarter", amount: "₹71,200", convs: "307.8K convs", save: "Save ₹5,600" },
                      { label: "Next Year",    amount: "₹214,000", convs: "925.2K convs", save: "Save ₹18,400" },
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
                        colors: ["#10B981"],
                        stroke: { curve: "straight", width: 2 },
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
                          max: 14000,
                          tickAmount: 4,
                          labels: {
                            style: { colors: "#94a3b8", fontSize: "10px", fontWeight: 600 },
                            formatter: (v) => `₹${(v / 1000).toFixed(0)}K`,
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
                      series={[{ name: "Forecast", data: [9300, 8900, null, null, null, null] }]}
                      type="area"
                      height={200}
                    />
                  </div>
                </div>
              </div>

              {/* Campaign Cost Analysis */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-[15px] font-black text-slate-900 mb-0.5">Campaign Cost Analysis</h2>
                    <p className="text-[11px] text-slate-400 font-medium">Top spending campaigns ranked by ROI</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="bg-[#10B981] hover:bg-emerald-600 transition-colors text-white text-[11px] font-bold px-4 py-1.5 rounded-full shadow-sm">
                      Top Spend
                    </button>
                    <button className="bg-slate-100 hover:bg-slate-200 transition-colors text-slate-500 text-[11px] font-bold px-4 py-1.5 rounded-full">
                      Best ROI
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[700px]">
                    <thead>
                      <tr className="border-b border-slate-100">
                        <th className="pb-3 text-[11px] font-semibold text-slate-400">Campaign</th>
                        <th className="pb-3 text-[11px] font-semibold text-slate-400 text-right">Sent</th>
                        <th className="pb-3 text-[11px] font-semibold text-slate-400 text-right">Conversations</th>
                        <th className="pb-3 text-[11px] font-semibold text-slate-400 text-right">Charges</th>
                        <th className="pb-3 text-[11px] font-semibold text-slate-400 text-right">Conv. Rate</th>
                        <th className="pb-3 text-[11px] font-semibold text-slate-400 text-right">ROI</th>
                        <th className="pb-3 text-[11px] font-semibold text-slate-400 text-center">Status</th>
                        <th className="pb-3 text-[11px] font-semibold text-slate-400 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {[
                        { name: "Diwali Sale 2024",  sent: "48,200", convs: "21,400", charges: "₹4,945", rate: "44.4%", roi: "8.2x",  roiColor: "text-emerald-500", status: "Completed", statusBg: "bg-blue-50 text-blue-500" },
                        { name: "New Year Offer",    sent: "36,100", convs: "16,200", charges: "₹3,742", rate: "44.9%", roi: "7.8x",  roiColor: "text-orange-400",  status: "Completed", statusBg: "bg-blue-50 text-blue-500" },
                        { name: "Winter Collection", sent: "29,800", convs: "13,400", charges: "₹3,096", rate: "44.9%", roi: "6.4x",  roiColor: "text-orange-400",  status: "Active",    statusBg: "bg-emerald-50 text-emerald-500" },
                        { name: "Loyalty Rewards",   sent: "24,600", convs: "11,200", charges: "₹2,588", rate: "45.5%", roi: "9.1x",  roiColor: "text-emerald-500", status: "Active",    statusBg: "bg-emerald-50 text-emerald-500" },
                        { name: "Flash Sale Dec",    sent: "18,900", convs: "8,600",  charges: "₹1,985", rate: "45.5%", roi: "11.3x", roiColor: "text-emerald-500", status: "Active",    statusBg: "bg-emerald-50 text-emerald-500" },
                        { name: "Product Launch",    sent: "15,400", convs: "6,900",  charges: "₹1,595", rate: "44.8%", roi: "5.2x",  roiColor: "text-orange-400",  status: "Paused",    statusBg: "bg-orange-50 text-orange-400" },
                        { name: "Customer Win-back", sent: "12,800", convs: "5,700",  charges: "₹1,316", rate: "44.5%", roi: "7.6x",  roiColor: "text-orange-400",  status: "Active",    statusBg: "bg-emerald-50 text-emerald-500" },
                        { name: "Re-engagement Q4",  sent: "10,200", convs: "4,600",  charges: "₹1,063", rate: "45.1%", roi: "6.9x",  roiColor: "text-orange-400",  status: "Completed", statusBg: "bg-blue-50 text-blue-500" },
                      ].map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-4 text-[13px] font-black text-slate-700">{row.name}</td>
                          <td className="py-4 text-[13px] font-semibold text-slate-500 text-right">{row.sent}</td>
                          <td className="py-4 text-[13px] font-semibold text-slate-500 text-right">{row.convs}</td>
                          <td className="py-4 text-[13px] font-black text-slate-900 text-right">{row.charges}</td>
                          <td className="py-4 text-[13px] font-semibold text-slate-400 text-right">{row.rate}</td>
                          <td className={`py-4 text-[13px] font-black text-right ${row.roiColor}`}>{row.roi}</td>
                          <td className="py-4 text-center">
                            <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black ${row.statusBg}`}>
                              {row.status}
                            </span>
                          </td>
                          <td className="py-4 text-center text-slate-400">
                            <button className="hover:bg-slate-100 p-1 rounded transition-colors">
                              <MoreHorizontal className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Conversation Pricing Calculator */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-6">
                <h2 className="text-[15px] font-black text-slate-900 mb-0.5">Conversation Pricing Calculator</h2>
                <p className="text-[11px] text-slate-400 font-medium mb-6">Estimate your WhatsApp costs instantly</p>

                {/* Inputs */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Conversation Type</label>
                    <div className="h-10 w-full rounded-xl border border-slate-200 bg-white"></div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Expected Volume</label>
                    <div className="h-10 w-full rounded-xl border border-slate-200 bg-white px-4 flex items-center">
                      <span className="text-[13px] font-semibold text-slate-700">10000</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Country</label>
                    <div className="h-10 w-full rounded-xl border border-slate-200 bg-white"></div>
                  </div>
                </div>

                {/* Results */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: "Rate Per Conv.", value: "₹0.58" },
                    { label: "Est. Charges",   value: "₹58.00" },
                    { label: "Monthly Est.",   value: "₹58.00" },
                    { label: "Annual Est.",    value: "₹696" },
                  ].map((res) => (
                    <div key={res.label} className="bg-[#f0fdf4] rounded-[16px] py-4 flex flex-col items-center justify-center">
                      <p className="text-[11px] text-slate-400 font-semibold mb-1">{res.label}</p>
                      <p className="text-[17px] font-black text-[#10B981]">{res.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Country-Wise Pricing Analytics */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-6">
                <h2 className="text-[15px] font-black text-slate-900 mb-0.5">Country-Wise Pricing Analytics</h2>
                <p className="text-[11px] text-slate-400 font-medium mb-6">Regional cost comparison across conversation types</p>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[700px]">
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
                      {[
                        { country: "India",     flag: "🇮🇳", marketing: "₹0.58",  utility: "₹0.14",  auth: "₹0.15",  service: "₹0.00",  usage: "64,800", total: "₹14,820" },
                        { country: "USA",       flag: "🇺🇸", marketing: "$0.025", utility: "$0.015", auth: "$0.015", service: "$0.015", usage: "12,400", total: "₹8,680" },
                        { country: "Brazil",    flag: "🇧🇷", marketing: "$0.025", utility: "$0.008", auth: "$0.008", service: "$0.008", usage: "9,800",  total: "₹4,900" },
                        { country: "Indonesia", flag: "🇮🇩", marketing: "$0.018", utility: "$0.006", auth: "$0.006", service: "$0.006", usage: "8,200",  total: "₹3,280" },
                        { country: "Mexico",    flag: "🇲🇽", marketing: "$0.020", utility: "$0.008", auth: "$0.008", service: "$0.008", usage: "6,600",  total: "₹2,640" },
                      ].map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-4 flex items-center gap-2">
                            <span className="text-sm">{row.flag}</span>
                            <span className="text-[13px] font-black text-slate-700">{row.country}</span>
                          </td>
                          <td className="py-4 text-[13px] font-semibold text-slate-600 text-center">{row.marketing}</td>
                          <td className="py-4 text-[13px] font-semibold text-slate-600 text-center">{row.utility}</td>
                          <td className="py-4 text-[13px] font-semibold text-slate-600 text-center">{row.auth}</td>
                          <td className="py-4 text-[13px] font-semibold text-slate-600 text-center">{row.service}</td>
                          <td className="py-4 text-[13px] font-semibold text-slate-400 text-right">{row.usage}</td>
                          <td className="py-4 text-[13px] font-black text-[#10B981] text-right">{row.total}</td>
                        </tr>
                      ))}
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
                      <span className="text-[13px] font-black text-slate-900">Nov 1 – Nov 30, 2024</span>
                    </div>
                    <div className="flex justify-between items-center pb-4 border-b border-slate-50">
                      <span className="text-[12px] font-semibold text-slate-500">Total Charges</span>
                      <span className="text-[14px] font-black text-slate-900">₹24,800.00</span>
                    </div>
                    <div className="flex justify-between items-center pb-4 border-b border-slate-50">
                      <span className="text-[12px] font-semibold text-slate-500">GST (18%)</span>
                      <span className="text-[14px] font-black text-slate-900">₹4,464.00</span>
                    </div>
                    <div className="flex justify-between items-center pb-4 border-b border-slate-50">
                      <span className="text-[12px] font-semibold text-slate-500">Discount Applied</span>
                      <span className="text-[14px] font-black text-[#10B981]">-₹1,200.00</span>
                    </div>
                    <div className="flex justify-between items-center pb-4 border-b border-slate-50">
                      <span className="text-[12px] font-semibold text-slate-500">Coupon (SAVE10)</span>
                      <span className="text-[14px] font-black text-[#10B981]">-₹2,380.00</span>
                    </div>
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-[12px] font-semibold text-slate-500">Net Amount Due</span>
                      <span className="text-[16px] font-black text-[#10B981]">₹25,684.00</span>
                    </div>
                  </div>

                  <div className="bg-[#f0fdf4] rounded-[16px] p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-[#10B981]" />
                      <div>
                        <p className="text-[12px] font-bold text-[#10B981]">Payment Status: Paid</p>
                        <p className="text-[10px] font-medium text-slate-500">Next billing: Dec 1, 2024</p>
                      </div>
                    </div>
                    <button className="bg-[#10B981] hover:bg-emerald-600 transition-colors text-white text-[11px] font-bold px-4 py-2 rounded-full shadow-sm">
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
                        <p className="text-[11px] font-medium text-slate-500 leading-relaxed">Daily spend exceeded ₹1,000 threshold. Current: ₹1,240 today.</p>
                      </div>
                    </div>
                    
                    {/* Amber Alert */}
                    <div className="bg-[#fffbeb] border-l-4 border-amber-400 rounded-xl rounded-l-sm p-4 flex gap-3">
                      <BellRing className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" strokeWidth={2.5} />
                      <div>
                        <p className="text-[12px] font-bold text-slate-900 mb-1">Budget Threshold at 87%</p>
                        <p className="text-[11px] font-medium text-slate-500 leading-relaxed">Monthly budget of ₹28,500 is 87% utilized with 8 days remaining.</p>
                      </div>
                    </div>
                    
                    {/* Blue Alert */}
                    <div className="bg-[#eff6ff] border-l-4 border-blue-400 rounded-xl rounded-l-sm p-4 flex gap-3">
                      <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" strokeWidth={2.5} />
                      <div>
                        <p className="text-[12px] font-bold text-slate-900 mb-1">Pricing Update Notice</p>
                        <p className="text-[11px] font-medium text-slate-500 leading-relaxed">WhatsApp updated marketing conversation rates effective Dec 1, 2024.</p>
                      </div>
                    </div>
                    
                    {/* Green Alert */}
                    <div className="bg-[#f0fdf4] border-l-4 border-[#10B981] rounded-xl rounded-l-sm p-4 flex gap-3">
                      <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" strokeWidth={2.5} />
                      <div>
                        <p className="text-[12px] font-bold text-slate-900 mb-1">Cost Optimization Applied</p>
                        <p className="text-[11px] font-medium text-slate-500 leading-relaxed">Off-peak shift saved ₹420 compared to last week.</p>
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
                  {[
                    { label: "Cost Per\nConversation", val: "0.2",   ind: "0.3", dir: "up",   color: "#10B981", bg: "bg-emerald-50", fill: "60%" },
                    { label: "Conversation\nEfficiency",  val: "82%", ind: "74%", dir: "up",   color: "#10B981", bg: "bg-emerald-50", fill: "80%" },
                    { label: "Marketing Cost Share",     val: "52",  ind: "48%", dir: "down", color: "#f59e0b", bg: "bg-amber-50",   fill: "70%" },
                    { label: "Utility Cost Share",       val: "25",  ind: "29%", dir: "up",   color: "#10B981", bg: "bg-emerald-50", fill: "50%" },
                    { label: "Campaign ROI",             val: "7.9x",ind: "6.2", dir: "up",   color: "#10B981", bg: "bg-emerald-50", fill: "85%" },
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
                          <div className="h-full rounded-full" style={{ width: b.fill, backgroundColor: b.color }} />
                        </div>
                      </div>
                    </div>
                  ))}
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
                    <button className="w-full bg-[#10B981] hover:bg-emerald-600 transition-colors text-white text-[12px] font-bold rounded-full py-2.5 shadow-sm">
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

                {/* QUICK STATS (Placeholder) */}
                <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Quick Stats</p>
                  <div className="h-10 bg-slate-50 rounded-xl border border-slate-100"></div>
                </div>

              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default WhatsAppPricing;
