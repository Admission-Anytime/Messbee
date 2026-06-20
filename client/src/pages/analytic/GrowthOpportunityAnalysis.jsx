import { useState } from "react";
import Chart from "react-apexcharts";
import {
  TrendingUp,
  RefreshCw,
  Calendar,
  DollarSign,
  Target,
  Zap,
  ArrowLeft,
  CheckCircle,
  Flame,
  Star,
  MessageCircle,
  TrendingDown,
  Users,
  Clock,
  Rocket,
  Filter,
  AlertTriangle,
  Circle,
  Award,
} from "lucide-react";

// ─── Health Indicator Bar ─────────────────────────────────────────────────────
const HealthBar = ({ label, value, color, badge }) => {
  const pct = Math.min((value / 100) * 100, 100);
  const badgeColors =
    badge === "Excellent"
      ? { bg: "#d1fae5", text: "#059669" }
      : { bg: "#dbeafe", text: "#2563eb" };
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs text-slate-500 font-medium">{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-700">{value}</span>
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded-full"
            style={{ backgroundColor: badgeColors.bg, color: badgeColors.text }}
          >
            {badge}
          </span>
        </div>
      </div>
      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const GrowthOpportunityAnalysis = ({ onBack }) => {
  const [chartPeriod, setChartPeriod] = useState("Weekly");
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1200);
  };

  const chartData = {
    Daily: {
      categories: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      marketing: [34, 52, 41, 68, 55, 72, 60],
      utility: [20, 28, 22, 35, 30, 40, 33],
      auth: [8, 14, 10, 18, 14, 20, 15],
      service: [12, 18, 15, 22, 18, 25, 20],
    },
    Weekly: {
      categories: ["W1", "W2", "W3", "W4", "W5", "W6"],
      marketing: [130, 165, 185, 200, 220, 260],
      utility: [80, 95, 105, 115, 130, 195],
      auth: [40, 55, 60, 70, 80, 130],
      service: [60, 75, 80, 90, 100, 85],
    },
    Monthly: {
      categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
      marketing: [520, 600, 680, 720, 800, 760],
      utility: [310, 360, 400, 430, 480, 450],
      auth: [140, 160, 185, 200, 220, 205],
      service: [230, 270, 300, 320, 360, 340],
    },
    Yearly: {
      categories: ["2021", "2022", "2023", "2024", "2025", "2026"],
      marketing: [2800, 3400, 4100, 5200, 6500, 7200],
      utility: [1600, 2000, 2500, 3100, 3900, 4300],
      auth: [700, 900, 1100, 1400, 1800, 2000],
      service: [1100, 1400, 1700, 2100, 2600, 2900],
    },
  };

  const cd = chartData[chartPeriod];

  const chartOptions = {
    chart: {
      type: "area",
      toolbar: { show: false },
      fontFamily: "Urbanist, sans-serif",
      animations: { enabled: true, speed: 600 },
      background: "transparent",
    },
    colors: ["#3b82f6", "#10B981", "#8b5cf6", "#f97316"],
    stroke: { curve: "smooth", width: 2 },
    dataLabels: { enabled: false },
    markers: { size: 0 },
    xaxis: {
      categories: cd.categories,
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: { style: { colors: "#94a3b8", fontWeight: 600, fontSize: "11px" } },
    },
    yaxis: {
      labels: {
        style: { colors: "#94a3b8", fontWeight: 600, fontSize: "11px" },
        formatter: (v) => v,
      },
    },
    grid: { borderColor: "#f1f5f9", strokeDashArray: 4 },
    legend: {
      show: false,
    },
    tooltip: {
      theme: "light",
      style: { fontFamily: "Urbanist, sans-serif", fontSize: "12px" },
    },
    fill: {
      type: "gradient",
      gradient: {
        shade: "light",
        type: "vertical",
        shadeIntensity: 0.1,
        opacityFrom: 0.25,
        opacityTo: 0,
      },
    },
  };

  const chartSeries = [
    { name: "Marketing", data: cd.marketing },
    { name: "Utility", data: cd.utility },
    { name: "Auth", data: cd.auth },
    { name: "Service", data: cd.service },
  ];

  return (
    <div
      className="flex h-full overflow-hidden"
      style={{ fontFamily: "Urbanist, sans-serif", background: "#f8fafc" }}
    >
      <div className="flex-1 overflow-y-auto">
        {/* ── PAGE HEADER ── */}
        <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {onBack && (
              <button
                onClick={onBack}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors mr-1"
              >
                <ArrowLeft className="w-4 h-4 text-slate-600" />
              </button>
            )}
            <div>
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest">
                Analytics &rsaquo;
              </p>
              <h1 className="text-xl font-extrabold text-slate-900 leading-tight">
                Growth Opportunity Analysis
              </h1>
              <p className="text-xs text-slate-400 font-normal mt-0.5">
                Insights to improve engagement, conversions, and messaging performance
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 border border-slate-200 rounded-full px-4 py-2 text-slate-600 text-sm bg-white cursor-pointer hover:bg-slate-50 transition-colors">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span className="font-semibold text-sm">Jun 1 – Jun 15, 2026</span>
              <svg className="w-3 h-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 bg-[#10B981] hover:bg-[#059669] text-white text-sm font-bold px-5 py-2 rounded-full transition-all shadow-md"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
              Refresh Analysis
            </button>
          </div>
        </div>

        {/* ── BODY ── */}
        <div className="p-5 lg:p-6">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 items-start">

            {/* ── LEFT: 2/3 width ── */}
            <div className="xl:col-span-2 space-y-5">

              {/* Executive Summary Card */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                {/* Title row */}
                <div className="flex items-center gap-2.5 mb-5">
                  <Star className="w-5 h-5 text-[#10B981]" strokeWidth={2} />
                  <h2 className="text-lg font-bold text-slate-900">Executive Summary</h2>
                  <span className="ml-1 bg-red-50 text-red-500 text-[9px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider">
                    High Priority
                  </span>
                  <span className="bg-[#ecfdf5] text-[#10B981] text-[9px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider">
                    94% Confidence
                  </span>
                </div>

                {/* 4-column: [Score] [2x2 grid] [AI Rec] */}
                <div className="grid grid-cols-4 gap-4">

                  {/* Col 1: Growth Score donut */}
                  <div className="flex flex-col items-center justify-center py-2">
                    <div className="relative w-24 h-24 mb-3">
                      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                        <circle cx="50" cy="50" r="42" fill="none" stroke="#f0fdf4" strokeWidth="10" />
                        <circle
                          cx="50" cy="50" r="42" fill="none"
                          stroke="#10B981" strokeWidth="10"
                          strokeDasharray={`${(86 / 100) * 264} 264`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl font-extrabold text-slate-900">86</span>
                        <span className="text-[9px] text-slate-400 font-medium">out of 100</span>
                      </div>
                    </div>
                    <p className="text-sm font-bold text-slate-900">Growth Score</p>
                    <p className="text-xs text-slate-400 mt-0.5">Excellent performance</p>
                  </div>

                  {/* Col 2-3: 2×2 metric cards */}
                  <div className="col-span-2 grid grid-cols-2 gap-3">
                    {/* Revenue */}
                    <div className="bg-[#f0fdf4] rounded-xl p-3.5">
                      <div className="w-7 h-7 bg-white rounded-full flex items-center justify-center mb-2.5">
                        <DollarSign className="w-3.5 h-3.5 text-[#10B981]" />
                      </div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide leading-tight mb-1">
                        Potential Revenue Increase
                      </p>
                      <p className="text-lg font-extrabold text-[#10B981] leading-tight">+₹1,25,000</p>
                    </div>
                    {/* Lead */}
                    <div className="bg-[#eff6ff] rounded-xl p-3.5">
                      <div className="w-7 h-7 bg-white rounded-full flex items-center justify-center mb-2.5">
                        <TrendingUp className="w-3.5 h-3.5 text-[#3b82f6]" />
                      </div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide leading-tight mb-1">
                        Potential Lead Increase
                      </p>
                      <p className="text-lg font-extrabold text-[#3b82f6] leading-tight">+32%</p>
                    </div>
                    {/* Conversion */}
                    <div className="bg-[#faf5ff] rounded-xl p-3.5">
                      <div className="w-7 h-7 bg-white rounded-full flex items-center justify-center mb-2.5">
                        <Target className="w-3.5 h-3.5 text-[#a855f7]" />
                      </div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide leading-tight mb-1">
                        Potential Conversion Increase
                      </p>
                      <p className="text-lg font-extrabold text-[#a855f7] leading-tight">+18%</p>
                    </div>
                    {/* Confidence */}
                    <div className="bg-[#fffbeb] rounded-xl p-3.5">
                      <div className="w-7 h-7 bg-white rounded-full flex items-center justify-center mb-2.5">
                        <svg className="w-3.5 h-3.5 text-[#f59e0b]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="8" r="7"></circle>
                          <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
                        </svg>
                      </div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide leading-tight mb-1">
                        Opportunity Confidence
                      </p>
                      <p className="text-lg font-extrabold text-[#f59e0b] leading-tight">94%</p>
                    </div>
                  </div>

                  {/* Col 4: AI Recommendation */}
                  <div className="bg-[#10B981] rounded-xl p-4 text-white flex flex-col">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mb-3">
                      <Zap className="w-4 h-4 text-white" />
                    </div>
                    <p className="text-sm font-bold mb-1.5">AI Recommendation</p>
                    <p className="text-[11px] text-white/85 leading-relaxed mb-4 flex-1">
                      Scale evening marketing campaigns now for maximum ROI this quarter.
                    </p>
                    <div className="space-y-1.5">
                      {["Increase broadcasts", "Target inactive users", "Optimize send timing"].map((item) => (
                        <div key={item} className="flex items-center gap-2">
                          <CheckCircle className="w-3.5 h-3.5 text-white/80 shrink-0" strokeWidth={2} />
                          <span className="text-[10px] text-white font-medium leading-tight">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </div>

              {/* 4 Performance Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

                {/* Campaign Performance */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
                  <div className="flex items-center gap-1.5 mb-4">
                    <TrendingUp className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-[9px] font-extrabold text-slate-600 uppercase tracking-wider">Campaign Performance</span>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-[10px] text-slate-400 mb-0.5">Current Growth Rate</p>
                      <div className="flex items-center gap-1.5">
                        <span className="text-lg font-extrabold text-slate-900">24%</span>
                        <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5">
                          <TrendingUp className="w-2.5 h-2.5" />+24%
                        </span>
                      </div>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-2.5">
                      <p className="text-[10px] text-slate-400 mb-0.5">Suggested Growth Rate</p>
                      <span className="text-base font-extrabold text-blue-600">38%</span>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 mb-0.5">Potential Improvement</p>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-extrabold text-slate-900">+14pp</span>
                        <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5">
                          <TrendingUp className="w-2.5 h-2.5" />+58% lift
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Customer Engagement */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
                  <div className="flex items-center gap-1.5 mb-4">
                    <MessageCircle className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-[9px] font-extrabold text-slate-600 uppercase tracking-wider">Customer Engagement</span>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-[10px] text-slate-400 mb-0.5">Response Rate</p>
                      <div className="flex items-center gap-1.5">
                        <span className="text-lg font-extrabold text-slate-900">42%</span>
                        <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5">
                          <TrendingUp className="w-2.5 h-2.5" />+6pp
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 mb-0.5">Read Rate</p>
                      <div className="flex items-center gap-1.5">
                        <span className="text-lg font-extrabold text-slate-900">81%</span>
                        <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5">
                          <TrendingUp className="w-2.5 h-2.5" />+12pp
                        </span>
                      </div>
                    </div>
                    <div className="bg-emerald-50 rounded-lg p-2.5">
                      <p className="text-[10px] text-slate-400 mb-0.5">Engagement Score</p>
                      <span className="text-base font-extrabold text-emerald-600">76/100</span>
                    </div>
                  </div>
                </div>

                {/* Conversion Opportunity */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
                  <div className="flex items-center gap-1.5 mb-4">
                    <Target className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-[9px] font-extrabold text-slate-600 uppercase tracking-wider">Conversion Opportunity</span>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-[10px] text-slate-400 mb-0.5">Current Conversion</p>
                      <div className="flex items-center gap-1.5">
                        <span className="text-lg font-extrabold text-slate-900">4.8%</span>
                        <span className="text-[10px] font-bold text-red-500 flex items-center gap-0.5">
                          <TrendingDown className="w-2.5 h-2.5" />-0.2pp
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 mb-0.5">Projected Conversion</p>
                      <span className="text-lg font-extrabold text-[#a855f7]">5.7%</span>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 mb-0.5">Expected Gain</p>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-extrabold text-slate-900">+18%</span>
                        <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5">
                          <TrendingUp className="w-2.5 h-2.5" />+0.9pp
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Revenue Opportunity */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
                  <div className="flex items-center gap-1.5 mb-4">
                    <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-[9px] font-extrabold text-slate-600 uppercase tracking-wider">Revenue Opportunity</span>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-[10px] text-slate-400 mb-0.5">Current Revenue</p>
                      <div className="flex items-center gap-1.5">
                        <span className="text-lg font-extrabold text-slate-900">₹1.18L</span>
                        <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5">
                          <TrendingUp className="w-2.5 h-2.5" />+8%
                        </span>
                      </div>
                    </div>
                    <div className="bg-amber-50 rounded-lg p-2.5">
                      <p className="text-[10px] text-slate-400 mb-0.5">Projected Revenue</p>
                      <span className="text-base font-extrabold text-amber-600">₹2.43L</span>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 mb-0.5">Potential Increase</p>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-extrabold text-slate-900">+₹1.25L</span>
                        <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5">
                          <TrendingUp className="w-2.5 h-2.5" />+106%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Conversation Analytics Chart */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Conversation Analytics</h2>
                    <p className="text-xs text-slate-400 mt-0.5">Volume by conversation type</p>
                  </div>
                  <div className="flex bg-slate-50 border border-slate-100 rounded-full p-1 gap-1">
                    {["Daily", "Weekly", "Monthly", "Yearly"].map((p) => (
                      <button
                        key={p}
                        onClick={() => setChartPeriod(p)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                          chartPeriod === p
                            ? "bg-white text-slate-900 shadow-sm border border-slate-100"
                            : "text-slate-400 hover:text-slate-600"
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
                {/* Legend */}
                <div className="flex items-center gap-4 mb-3">
                  {[
                    { name: "Marketing", color: "#3b82f6" },
                    { name: "Utility", color: "#10B981" },
                    { name: "Auth", color: "#8b5cf6" },
                    { name: "Service", color: "#f97316" },
                  ].map((l) => (
                    <div key={l.name} className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: l.color }} />
                      <span className="text-[11px] text-slate-500 font-medium">{l.name}</span>
                    </div>
                  ))}
                </div>
                <Chart options={chartOptions} series={chartSeries} type="area" height={220} />
              </div>

              {/* Engagement Analysis */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                {/* Header */}
                <div className="flex items-center gap-2 mb-5">
                  <svg className="w-4 h-4 text-[#10B981]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                  </svg>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Engagement Analysis</h2>
                    <p className="text-xs text-slate-400 font-normal">Message performance — last 6 weeks</p>
                  </div>
                </div>

                {/* 6 stat columns with right-border dividers */}
                <div className="grid grid-cols-6 mb-6">
                  {[
                    { label: "Messages Sent", value: "11,400",  change: "+12%"   },
                    { label: "Delivered",      value: "11,142",  change: "+11.8%" },
                    { label: "Read",           value: "9,280",   change: "+18%"   },
                    { label: "Replies",        value: "3,680",   change: "+32%"   },
                    { label: "CTR",            value: "34%",     change: "+4pp"   },
                    { label: "Response Rate",  value: "42%",     change: "+6pp"   },
                  ].map((s, i) => (
                    <div
                      key={s.label}
                      className={`bg-slate-50 px-4 py-3 ${i < 5 ? "border-r border-slate-200" : ""} ${i === 0 ? "rounded-l-xl" : ""} ${i === 5 ? "rounded-r-xl" : ""}`}
                    >
                      <p className="text-[10px] text-slate-400 font-medium mb-1">{s.label}</p>
                      <p className="text-lg font-extrabold text-slate-900 leading-tight">{s.value}</p>
                      <p className="text-[10px] font-bold text-emerald-600 mt-0.5 flex items-center gap-0.5">
                        <TrendingUp className="w-2.5 h-2.5" />{s.change}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Dual line chart — green (Messages Sent) + red (Delivered) */}
                <Chart
                  options={{
                    chart: {
                      type: "line",
                      toolbar: { show: false },
                      fontFamily: "Urbanist, sans-serif",
                      background: "transparent",
                      animations: { enabled: true, speed: 500 },
                      zoom: { enabled: false },
                    },
                    colors: ["#10B981", "#f43f5e"],
                    stroke: { curve: "straight", width: [1.5, 1.5], dashArray: [0, 3] },
                    dataLabels: { enabled: false },
                    markers: { size: 0 },
                    xaxis: {
                      categories: ["Apr W1", "Apr W2", "Apr W3", "Apr W4", "May W1", "May W2"],
                      axisBorder: { show: false },
                      axisTicks: { show: false },
                      labels: { style: { colors: "#94a3b8", fontSize: "10px", fontWeight: 600 } },
                    },
                    yaxis: {
                      min: 0,
                      max: 13000,
                      tickAmount: 4,
                      labels: {
                        style: { colors: "#94a3b8", fontSize: "10px", fontWeight: 600 },
                        formatter: (v) => v === 0 ? "0" : `${v / 1000}000`,
                      },
                    },
                    grid: { borderColor: "#f1f5f9", strokeDashArray: 0, xaxis: { lines: { show: false } } },
                    legend: { show: false },
                    tooltip: { theme: "light", style: { fontFamily: "Urbanist, sans-serif" } },
                    fill: { type: "solid", opacity: 1 },
                  }}
                  series={[
                    { name: "Messages Sent", data: [8500, 8900, 9400, 9900, 10600, 12000] },
                    { name: "Delivered",     data: [8400, 8800, 9300, 9800, 10550, 11950] },
                  ]}
                  type="line"
                  height={220}
                />
              </div>

              {/* Revenue Impact Analysis */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Revenue Impact Analysis</h2>
                    <p className="text-[11px] text-slate-400 mt-0.5 font-medium">Current vs. projected revenue trajectory</p>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap justify-end">
                    <div className="bg-[#f0fdf4] rounded-full px-5 py-2.5 text-center min-w-[120px]">
                      <p className="text-[10px] text-slate-500 font-medium mb-0.5">Current Revenue</p>
                      <p className="text-xl font-extrabold text-[#059669]">₹1,18,000</p>
                    </div>
                    <div className="bg-[#eff6ff] rounded-full px-5 py-2.5 text-center min-w-[120px]">
                      <p className="text-[10px] text-slate-500 font-medium mb-0.5">Projected Revenue</p>
                      <p className="text-xl font-extrabold text-[#2563eb]">₹1,68,000</p>
                    </div>
                    <div className="bg-[#faf5ff] rounded-full px-5 py-2.5 text-center min-w-[120px]">
                      <p className="text-[10px] text-slate-500 font-medium mb-0.5">Avg Order Value</p>
                      <p className="text-xl font-extrabold text-[#a855f7]">₹2,430</p>
                    </div>
                  </div>
                </div>

                <Chart
                  options={{
                    chart: { type: "bar", toolbar: { show: false }, fontFamily: "Urbanist, sans-serif", background: "transparent", animations: { enabled: true } },
                    colors: ["#dcfce7"],
                    plotOptions: {
                      bar: { borderRadius: 4, columnWidth: "75%", distributed: false },
                    },
                    dataLabels: { enabled: false },
                    xaxis: {
                      categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"],
                      axisBorder: { show: false },
                      axisTicks: { show: false },
                      labels: { style: { colors: "#94a3b8", fontSize: "10px", fontWeight: 600 } },
                    },
                    yaxis: {
                      min: 0,
                      max: 180000,
                      tickAmount: 4,
                      labels: {
                        style: { colors: "#94a3b8", fontSize: "10px", fontWeight: 600 },
                        formatter: (v) => `₹${v >= 1000 ? (v / 1000).toFixed(0) + "k" : v}`,
                      },
                    },
                    grid: { borderColor: "#f1f5f9", strokeDashArray: 4 },
                    legend: { show: false },
                    tooltip: {
                      theme: "light",
                      style: { fontFamily: "Urbanist, sans-serif" },
                      y: { formatter: (v) => `₹${v.toLocaleString("en-IN")}` },
                    },
                    fill: { type: "solid", opacity: 1 },
                    stroke: { show: true, width: 1.5, colors: ["#10B981"] },
                  }}
                  series={[
                    { name: "Revenue", data: [75000, 82000, 90000, 95000, 105000, 115000, 0, 0] },
                  ]}
                  type="bar"
                  height={240}
                />
              </div>

              {/* Grid for Audience and Heatmap */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-5">
                
                {/* Audience Insights */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <Users className="w-4 h-4 text-[#10B981]" strokeWidth={2.5} />
                    <div>
                      <h2 className="text-base font-bold text-slate-900">Audience Insights</h2>
                      <p className="text-[11px] text-slate-400 mt-0.5 font-medium">Segmentation and geographic reach</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    {/* Donut Chart */}
                    <div>
                      <p className="text-[10px] text-slate-400 font-semibold mb-4">Audience Segments</p>
                      <div className="relative w-32 h-32 mx-auto mb-6">
                        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90 drop-shadow-sm">
                          {/* Segments: Green(35%), Blue(28%), Gray(22%), Orange(15%) */}
                          <circle cx="50" cy="50" r="38" fill="none" stroke="#f1f5f9" strokeWidth="18" />
                          <circle cx="50" cy="50" r="38" fill="none" stroke="#f59e0b" strokeWidth="18" strokeDasharray="36 238.7" strokeDashoffset="0" />
                          <circle cx="50" cy="50" r="38" fill="none" stroke="#94a3b8" strokeWidth="18" strokeDasharray="52.5 238.7" strokeDashoffset="-36" />
                          <circle cx="50" cy="50" r="38" fill="none" stroke="#3b82f6" strokeWidth="18" strokeDasharray="67 238.7" strokeDashoffset="-88.5" />
                          <circle cx="50" cy="50" r="38" fill="none" stroke="#10B981" strokeWidth="18" strokeDasharray="83.2 238.7" strokeDashoffset="-155.5" />
                        </svg>
                      </div>
                      <div className="grid grid-cols-2 gap-y-3 gap-x-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-[#10B981]" /><span className="text-[9px] text-slate-500 leading-tight">Active<br/>Buyers</span></div>
                          <span className="text-[10px] font-extrabold text-slate-900">35%</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-[#3b82f6]" /><span className="text-[9px] text-slate-500 leading-tight">Warm<br/>Leads</span></div>
                          <span className="text-[10px] font-extrabold text-slate-900">28%</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-[#94a3b8]" /><span className="text-[9px] text-slate-500 leading-tight">Inactive</span></div>
                          <span className="text-[10px] font-extrabold text-slate-900">22%</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]" /><span className="text-[9px] text-slate-500 leading-tight">New<br/>Users</span></div>
                          <span className="text-[10px] font-extrabold text-slate-900">15%</span>
                        </div>
                      </div>
                    </div>

                    {/* Top Regions */}
                    <div className="flex flex-col">
                      <p className="text-[10px] text-slate-400 font-semibold mb-4 border-l border-slate-100 pl-4 -ml-4">Top Regions</p>
                      <div className="space-y-3.5 border-l border-slate-100 pl-4 -ml-4 flex-1">
                        {[
                          { name: "Maharashtra", val: "34%", color: "#10B981" },
                          { name: "Delhi NCR", val: "22%", color: "#3b82f6" },
                          { name: "Karnataka", val: "18%", color: "#a855f7" },
                          { name: "Tamil Nadu", val: "14%", color: "#f97316" },
                          { name: "Gujarat", val: "12%", color: "#94a3b8" },
                        ].map(r => (
                          <div key={r.name}>
                            <div className="flex justify-between text-[10px] font-medium text-slate-600 mb-1">
                              <span>{r.name}</span>
                              <span className="font-extrabold text-slate-900">{r.val}</span>
                            </div>
                            <div className="h-1.5 bg-slate-100 rounded-full w-full">
                              <div className="h-full rounded-full" style={{ width: r.val, backgroundColor: r.color }} />
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="flex gap-2 mt-4 pt-4 border-l border-slate-100 pl-4 -ml-4">
                        <div className="bg-[#ecfdf5] rounded-xl px-3 py-2 flex-1">
                          <p className="text-[9px] text-slate-400 mb-0.5">Peak Time</p>
                          <p className="text-[11px] font-extrabold text-[#10B981]">7–9 PM</p>
                        </div>
                        <div className="bg-[#eff6ff] rounded-xl px-3 py-2 flex-1">
                          <p className="text-[9px] text-slate-400 mb-0.5">Best Day</p>
                          <p className="text-[11px] font-extrabold text-[#3b82f6]">Saturday</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Best Time to Send */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col">
                  <div className="flex items-center gap-2 mb-6">
                    <Clock className="w-4 h-4 text-[#10B981]" strokeWidth={2.5} />
                    <div>
                      <h2 className="text-base font-bold text-slate-900">Best Time to Send</h2>
                      <p className="text-[11px] text-slate-400 mt-0.5 font-medium">Engagement heatmap by day and hour</p>
                    </div>
                  </div>

                  <div className="flex-1">
                    {/* Heatmap */}
                    <div className="flex mb-2 text-[9px] text-slate-400 font-medium pl-8">
                      {[9,10,11,12,13,14,15,16,17,18,19,20].map(h => (
                        <div key={h} className="flex-1 text-center">{h}</div>
                      ))}
                    </div>
                    {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((day, dIdx) => (
                      <div key={day} className="flex items-center mb-1.5">
                        <div className="w-8 text-[9px] text-slate-400 font-medium pr-2 text-right">{day}</div>
                        <div className="flex flex-1 gap-1">
                          {[9,10,11,12,13,14,15,16,17,18,19,20].map((h, hIdx) => {
                             const opacities = [0.2, 0.4, 0.6, 0.8, 1];
                             let val = 1;
                             if (dIdx >= 5) {
                               val = (h >= 17 && h <= 19) ? 4 : (h >= 14 ? 3 : 2);
                             } else {
                               val = (h >= 18) ? 4 : (h === 13 ? 3 : 1);
                             }
                             if (day === "Sat" && h >= 18 && h <= 20) val = 4;
                             if (hIdx % 3 === dIdx % 3) val -= 1;
                             val = Math.max(0, Math.min(4, val));

                             return (
                               <div key={h} className="flex-1 aspect-square rounded-full transition-opacity duration-300 hover:opacity-100 cursor-pointer" style={{ backgroundColor: "#10B981", opacity: opacities[val] }} />
                             );
                          })}
                        </div>
                      </div>
                    ))}
                    
                    {/* Legend */}
                    <div className="flex items-center justify-center gap-1.5 mt-3 text-[9px] text-slate-400 font-medium pl-8">
                      <span>Low</span>
                      {[0.2, 0.4, 0.6, 0.8, 1].map((op, i) => (
                        <div key={i} className="w-2.5 h-2.5 rounded-full bg-[#10B981]" style={{ opacity: op }} />
                      ))}
                      <span>High</span>
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="flex gap-2 mt-6">
                    <div className="bg-[#f0fdf4] rounded-xl py-3 flex-1 flex flex-col items-center justify-center text-center">
                      <div className="flex items-center justify-center w-5 h-5 bg-white rounded-md mb-2 shadow-sm">
                        <Calendar className="w-3.5 h-3.5 text-[#10B981]" />
                      </div>
                      <p className="text-[9px] text-slate-400 mb-0.5">Best Day</p>
                      <p className="text-[11px] font-extrabold text-[#10B981]">Saturday</p>
                    </div>
                    <div className="bg-[#f0fdf4] rounded-xl py-3 flex-1 flex flex-col items-center justify-center text-center">
                      <div className="flex items-center justify-center w-5 h-5 bg-white rounded-md mb-2 shadow-sm">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                      <p className="text-[9px] text-slate-400 mb-0.5">Best Hour</p>
                      <p className="text-[11px] font-extrabold text-[#10B981]">8 PM</p>
                    </div>
                    <div className="bg-[#f0fdf4] rounded-xl py-3 flex-1 flex flex-col items-center justify-center text-center">
                      <div className="flex items-center justify-center w-5 h-5 bg-white rounded-md mb-2 shadow-sm">
                        <Star className="w-3 h-3 text-yellow-500" fill="currentColor" />
                      </div>
                      <p className="text-[9px] text-slate-400 mb-0.5">Recommended</p>
                      <p className="text-[11px] font-extrabold text-[#10B981]">Sat 7–9 PM</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Campaign Recommendations */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mt-5">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <Rocket className="w-5 h-5 text-[#10B981]" strokeWidth={2.5} />
                    <div>
                      <h2 className="text-base font-bold text-slate-900">AI Campaign Recommendations</h2>
                      <p className="text-[11px] text-slate-400 mt-0.5 font-medium">Personalised suggestions based on your audience and history</p>
                    </div>
                  </div>
                  <button className="flex items-center gap-1.5 px-4 py-1.5 bg-slate-50 border border-slate-200 rounded-full text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors">
                    <Filter className="w-3.5 h-3.5" /> Filter
                  </button>
                </div>

                <div className="space-y-3">
                  {[
                    {
                      icon: "🎒",
                      title: "Back-to-School Campaign",
                      badge: "High Impact",
                      badgeColor: "text-emerald-700 bg-[#dcfce7]",
                      reach: "12,400",
                      conversion: "18%",
                      revenue: "₹45,000",
                      difficulty: "Easy",
                      difficultyColor: "text-emerald-700 bg-[#dcfce7]"
                    },
                    {
                      icon: "🔄",
                      title: "Re-engagement Campaign",
                      badge: "Recommended",
                      badgeColor: "text-amber-700 bg-[#fef3c7]",
                      reach: "8,200",
                      conversion: "22%",
                      revenue: "₹38,500",
                      difficulty: "Medium",
                      difficultyColor: "text-amber-700 bg-[#fef3c7]"
                    },
                    {
                      icon: "⬆️",
                      title: "Upsell Campaign",
                      badge: "High ROI",
                      badgeColor: "text-emerald-700 bg-[#dcfce7]",
                      reach: "4,800",
                      conversion: "31%",
                      revenue: "₹52,000",
                      difficulty: "Easy",
                      difficultyColor: "text-emerald-700 bg-[#dcfce7]"
                    },
                    {
                      icon: "🌱",
                      title: "Lead Nurture Campaign",
                      badge: "Long-term",
                      badgeColor: "text-amber-700 bg-[#fef3c7]",
                      reach: "6,500",
                      conversion: "15%",
                      revenue: "₹28,000",
                      difficulty: "Medium",
                      difficultyColor: "text-amber-700 bg-[#fef3c7]"
                    },
                    {
                      icon: "🎉",
                      title: "Festive Promotion Campaign",
                      badge: "Seasonal",
                      badgeColor: "text-red-700 bg-red-100",
                      reach: "18,000",
                      conversion: "12%",
                      revenue: "₹72,000",
                      difficulty: "Hard",
                      difficultyColor: "text-red-700 bg-red-100"
                    }
                  ].map((rec, i) => (
                    <div key={i} className="bg-slate-50/50 rounded-2xl p-4 flex items-center justify-between border border-transparent hover:border-slate-100 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-lg border border-slate-50">
                          {rec.icon}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1.5">
                            <h3 className="text-[13px] font-bold text-slate-900">{rec.title}</h3>
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${rec.badgeColor}`}>
                              {rec.badge}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 font-medium">
                            Reach: <span className="font-bold text-slate-600">{rec.reach}</span>
                            <span className="mx-1.5 text-slate-300">•</span>
                            Conversion: <span className="font-bold text-slate-600">{rec.conversion}</span>
                            <span className="mx-1.5 text-slate-300">•</span>
                            Revenue: <span className="font-bold text-[#10B981]">{rec.revenue}</span>
                          </p>
                        </div>
                      </div>
                      <div className={`text-[11px] font-semibold px-3.5 py-1 rounded-full ${rec.difficultyColor}`}>
                        {rec.difficulty}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Conversion Funnel */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mt-5">
                <div className="flex items-start mb-6">
                  <div className="flex items-center gap-3">
                    <Target className="w-5 h-5 text-[#10B981]" strokeWidth={2.5} />
                    <div>
                      <h2 className="text-base font-bold text-slate-900">Conversion Funnel</h2>
                      <p className="text-[11px] text-slate-400 mt-0.5 font-medium">Message-to-revenue journey with drop-off analysis</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3.5">
                  {[
                    { label: "Messages Sent", val: "10,000", pct: 95, color: "bg-[#2563eb]", drop: null },
                    { label: "Delivered", val: "9,650", pct: 92, color: "bg-[#3b82f6]", drop: "3.5%" },
                    { label: "Read", val: "7,820", pct: 70, color: "bg-[#0d9488]", drop: "18.9%" },
                    { label: "Replied", val: "3,450", pct: 33, color: "bg-[#16a34a]", drop: "55.9%" },
                    { label: "Leads", val: "1,240", pct: 15, color: "bg-[#15803d]", drop: "64.1%" },
                    { label: "Conversions", val: "486", pct: 12, color: "bg-[#f59e0b]", drop: "60.8%" },
                    { label: "Revenue (₹)", val: "₹2,43,000", pct: 95, color: "bg-[#ea580c]", drop: null },
                  ].map((row, i) => (
                    <div key={i} className="flex items-center">
                      <div className="w-28 shrink-0 text-right pr-4 text-[11px] font-medium text-slate-500">
                        {row.label}
                      </div>
                      <div className="flex-1 flex items-center pr-4">
                        <div 
                          className={`h-8 rounded-full flex items-center px-4 text-white text-xs font-bold shadow-sm ${row.color}`}
                          style={{ width: `${row.pct}%`, minWidth: 'fit-content' }}
                        >
                          {row.val}
                        </div>
                      </div>
                      <div className="w-16 shrink-0 text-right text-[11px] font-bold text-red-500">
                        {row.drop && `↓ ${row.drop}`}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Summary Pills */}
                <div className="grid grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-100">
                  <div className="bg-[#eff6ff] rounded-xl p-4 text-center">
                    <p className="text-[10px] text-slate-500 font-medium mb-1">Delivery Rate</p>
                    <p className="text-xl font-extrabold text-[#2563eb]">96.5%</p>
                  </div>
                  <div className="bg-[#f0fdfa] rounded-xl p-4 text-center">
                    <p className="text-[10px] text-slate-500 font-medium mb-1">Read Rate</p>
                    <p className="text-xl font-extrabold text-[#0d9488]">81.0%</p>
                  </div>
                  <div className="bg-[#f0fdf4] rounded-xl p-4 text-center">
                    <p className="text-[10px] text-slate-500 font-medium mb-1">Lead Rate</p>
                    <p className="text-xl font-extrabold text-[#16a34a]">35.9%</p>
                  </div>
                  <div className="bg-[#fffbeb] rounded-xl p-4 text-center">
                    <p className="text-[10px] text-slate-500 font-medium mb-1">Conversion Rate</p>
                    <p className="text-xl font-extrabold text-[#d97706]">4.86%</p>
                  </div>
                </div>
              </div>

              {/* Grid for Action Plan and Forecasting */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-5">

                {/* Action Plan Center */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <Zap className="w-4 h-4 text-[#10B981]" strokeWidth={2.5} />
                    <div>
                      <h2 className="text-base font-bold text-slate-900">Action Plan Center</h2>
                      <p className="text-[11px] text-slate-400 mt-0.5 font-medium">Prioritised tasks for maximum growth impact</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {[
                      { icon: <AlertTriangle className="w-4 h-4 text-red-500" />, title: "Increase Evening Campaign Broadcasts", badge: "High", badgeColor: "text-red-600 bg-red-100", desc: "Peak engagement detected 7–9 PM. Schedule 3 broadcasts this week.", gain: "+₹18,000", effort: "Low" },
                      { icon: <AlertTriangle className="w-4 h-4 text-red-500" />, title: "Target Inactive Customer Segment", badge: "High", badgeColor: "text-red-600 bg-red-100", desc: "2,340 inactive contacts identified. Re-engagement can recover 28% of lost revenue.", gain: "+₹34,500", effort: "Medium" },
                      { icon: <Clock className="w-4 h-4 text-yellow-500" />, title: "Create Remarketing Campaign", badge: "Medium", badgeColor: "text-amber-700 bg-amber-100", desc: "62% cart abandonment. Automated follow-ups can significantly recover conversions.", gain: "+₹12,000", effort: "Medium" },
                      { icon: <Clock className="w-4 h-4 text-yellow-500" />, title: "Launch June Promotional Broadcast", badge: "Medium", badgeColor: "text-amber-700 bg-amber-100", desc: "Festive season opportunity. Estimated reach: 8,400 contacts.", gain: "+₹22,000", effort: "Low" },
                      { icon: <Circle className="w-4 h-4 text-slate-400" />, title: "Optimize Response Workflows", badge: "Low", badgeColor: "text-slate-600 bg-slate-100", desc: "Avg. first response time is 4.2 min. Target: under 2 minutes to improve retention.", gain: "+8% Retention", effort: "High", isGainGreenPill: true },
                    ].map((item, i) => (
                      <div key={i} className="border border-slate-100 rounded-2xl p-4 flex gap-3 hover:border-slate-200 transition-colors">
                        <div className="mt-0.5 shrink-0">{item.icon}</div>
                        <div>
                          <div className="flex items-center gap-2 mb-1.5">
                            <h3 className="text-[13px] font-bold text-slate-900">{item.title}</h3>
                            <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full ${item.badgeColor}`}>{item.badge}</span>
                          </div>
                          <p className="text-[11px] text-slate-500 font-medium leading-relaxed mb-3 pr-4">
                            {item.desc}
                          </p>
                          <div className="flex items-center gap-2 text-[10px] font-bold">
                            {item.isGainGreenPill ? (
                              <span className="bg-[#ecfdf5] text-[#10B981] px-2 py-0.5 rounded-full">{item.gain}</span>
                            ) : (
                              <span className="text-[#10B981]">{item.gain}</span>
                            )}
                            <span className="text-slate-400 font-medium ml-1">Effort: {item.effort}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Predictive Forecasting */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col">
                  <div className="flex items-center gap-2 mb-6">
                    <TrendingUp className="w-4 h-4 text-[#10B981]" strokeWidth={2.5} />
                    <div>
                      <h2 className="text-base font-bold text-slate-900">Predictive Forecasting</h2>
                      <p className="text-[11px] text-slate-400 mt-0.5 font-medium">AI-driven 30-day growth projections</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-6">
                    <div className="bg-slate-50 rounded-xl p-3">
                      <p className="text-[10px] text-slate-400 font-medium mb-2 leading-tight">Projected Leads<br/>(30d)</p>
                      <p className="text-xl font-extrabold text-slate-900 leading-tight">+158</p>
                      <p className="text-[10px] font-bold text-[#10B981] mt-1">vs. 42 today</p>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-3">
                      <p className="text-[10px] text-slate-400 font-medium mb-2 leading-tight">Projected<br/>Conversions</p>
                      <p className="text-xl font-extrabold text-slate-900 leading-tight">+71</p>
                      <p className="text-[10px] font-bold text-[#10B981] mt-1">vs. 18 today</p>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-3">
                      <p className="text-[10px] text-slate-400 font-medium mb-2 leading-tight">Projected<br/>Revenue</p>
                      <p className="text-xl font-extrabold text-slate-900 leading-tight">+₹33.6k</p>
                      <p className="text-[10px] font-bold text-[#10B981] mt-1">30-day gain</p>
                    </div>
                  </div>

                  <div className="flex-1 min-h-[250px]">
                    <Chart
                      options={{
                        chart: { type: "area", toolbar: { show: false }, fontFamily: "Urbanist, sans-serif", background: "transparent", animations: { enabled: true } },
                        colors: ["#3b82f6"],
                        stroke: { curve: "smooth", width: 2, dashArray: 4 },
                        dataLabels: { enabled: false },
                        markers: { size: 0 },
                        xaxis: {
                          categories: ["D1", "D3", "D7", "D14", "D21", "D30"],
                          axisBorder: { show: false },
                          axisTicks: { show: false },
                          labels: { style: { colors: "#94a3b8", fontSize: "10px", fontWeight: 600 } },
                        },
                        yaxis: {
                          min: 0,
                          max: 160,
                          tickAmount: 4,
                          labels: { style: { colors: "#94a3b8", fontSize: "10px", fontWeight: 600 } },
                        },
                        grid: { borderColor: "#f1f5f9", strokeDashArray: 4 },
                        legend: { show: false },
                        tooltip: { theme: "light", style: { fontFamily: "Urbanist, sans-serif" } },
                        fill: {
                          type: "gradient",
                          gradient: {
                            shadeIntensity: 1,
                            opacityFrom: 0.25,
                            opacityTo: 0,
                            stops: [0, 100]
                          }
                        },
                      }}
                      series={[
                        { name: "Projection", data: [42, 45, 55, 80, 115, 160] },
                      ]}
                      type="area"
                      height="100%"
                    />
                  </div>
                </div>
              </div>

              {/* Benchmark Comparison */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mt-5">
                <div className="flex items-start justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <Award className="w-5 h-5 text-[#15803d]" strokeWidth={2.5} />
                    <div>
                      <h2 className="text-base font-bold text-slate-900">Benchmark Comparison</h2>
                      <p className="text-[11px] text-slate-400 mt-0.5 font-medium">Your business vs. industry average</p>
                    </div>
                  </div>
                  <div className="bg-[#dcfce7] text-[#15803d] px-3 py-1.5 rounded-full text-[11px] font-bold flex items-center gap-1">
                    Outperforming Industry <TrendingUp className="w-3 h-3" strokeWidth={3} />
                  </div>
                </div>

                <div className="space-y-6">
                  {[
                    { label: "Open Rate", ind: 64, your: 81 },
                    { label: "Click Rate", ind: 21, your: 34 },
                    { label: "Response Rate", ind: 28, your: 42 },
                    { label: "Conversion Rate", ind: 8, your: 14 },
                    { label: "Revenue Growth", ind: 15, your: 28 },
                  ].map((row, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex justify-between items-end mb-1">
                        <p className="text-[13px] font-bold text-slate-700">{row.label}</p>
                        <p className="text-[11px] font-medium text-slate-400">
                          Industry avg: {row.ind}% <span className="ml-2 text-[#15803d] font-bold">Yours: {row.your}%</span>
                        </p>
                      </div>
                      <div className="space-y-1.5">
                        {/* Industry Bar */}
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-slate-300 rounded-full" style={{ width: `${row.ind}%` }} />
                        </div>
                        {/* Your Bar */}
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-[#15803d] rounded-full" style={{ width: `${row.your}%` }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Legend */}
                <div className="flex items-center gap-5 mt-8 pt-5 border-t border-slate-100 text-[11px] font-medium text-slate-500">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                    Industry Average
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#15803d]" />
                    Your Business
                  </div>
                </div>
              </div>

            </div>

            {/* ── RIGHT SIDEBAR: 1/3 width ── */}
            <div className="xl:col-span-1 space-y-5">

              {/* Growth Status */}
              <div className="bg-[#10B981] rounded-2xl p-5 text-white relative overflow-hidden">
                <div className="absolute -top-6 -right-6 w-28 h-28 bg-white/10 rounded-full blur-2xl" />
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
                    <span className="text-[9px] font-extrabold text-white uppercase tracking-widest">Growth Status</span>
                  </div>
                  <p className="text-2xl font-extrabold mb-1">On Track 🚀</p>
                  <p className="text-xs text-white/80 font-medium mb-5">+24% above monthly target</p>
                  <div className="bg-white/25 rounded-full h-1.5 mb-2">
                    <div className="h-full bg-white rounded-full" style={{ width: "86%" }} />
                  </div>
                  <div className="flex justify-between text-[10px] font-bold text-white/80">
                    <span>0</span>
                    <span>86/100</span>
                  </div>
                </div>
              </div>

              {/* Health Indicators */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-4">
                  Health Indicators
                </p>
                <HealthBar label="Opportunity Score" value={86} color="#10B981" badge="Excellent" />
                <HealthBar label="Campaign Health" value={78} color="#3b82f6" badge="Good" />
                <HealthBar label="Revenue Health" value={82} color="#a855f7" badge="Excellent" />
                <HealthBar label="Engagement Score" value={76} color="#f97316" badge="Good" />
                <HealthBar label="Conversion Score" value={71} color="#10B981" badge="Good" />
              </div>

              {/* Key Insights */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-4">
                  Key Insights
                </p>
                <div className="space-y-3.5">
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 bg-orange-50 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                      <Flame className="w-3.5 h-3.5 text-orange-500" />
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">Evening slots are 2.4x more effective</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 bg-slate-100 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                      <TrendingUp className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">Saturday is the highest conversion day</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 bg-yellow-50 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                      <svg className="w-3.5 h-3.5 text-yellow-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="16" x2="12" y2="12"></line>
                        <line x1="12" y1="8" x2="12.01" y2="8"></line>
                      </svg>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">Re-engagement can add ₹34,500</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 bg-yellow-50 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                      <Zap className="w-3.5 h-3.5 text-yellow-500" />
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">94% confidence in this opportunity</p>
                  </div>
                </div>
              </div>

              {/* This Month */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-4">
                  This Month
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] text-slate-400 mb-1">Broadcasts</p>
                    <p className="text-xl font-extrabold text-slate-900">24</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 mb-1">Contacts</p>
                    <p className="text-xl font-extrabold text-slate-900">12.4k</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 mb-1">Revenue</p>
                    <p className="text-lg font-extrabold text-slate-900">₹1.18L</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 mb-1">Conversions</p>
                    <p className="text-lg font-extrabold text-slate-900">486</p>
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

export default GrowthOpportunityAnalysis;
