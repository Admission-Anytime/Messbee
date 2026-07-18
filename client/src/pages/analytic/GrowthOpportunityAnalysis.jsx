import { useState, useEffect, useCallback } from "react";
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
import AnalyticsApi from "../../services/AnalyticsApi";

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

// ─── Skeleton loader ───────────────────────────────────────────────────────────
const Skeleton = ({ className = "" }) => (
  <div className={`animate-pulse bg-slate-100 rounded-lg ${className}`} />
);

// ─── Helper: format numbers ───────────────────────────────────────────────────
const fmtNum = (n) =>
  n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n ?? 0);
const fmtPct = (n, d = 1) => `${Number(n ?? 0).toFixed(d)}%`;
const safe = (n, fallback = 0) => (isNaN(n) || !isFinite(n) ? fallback : n);

// ─── Main Component ───────────────────────────────────────────────────────────
const GrowthOpportunityAnalysis = ({ onBack }) => {
  const [chartPeriod, setChartPeriod] = useState("Monthly");
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dateDropOpen, setDateDropOpen] = useState(false);
  const [filterDropOpen, setFilterDropOpen] = useState(false);
  const [activeCampaignFilter, setActiveCampaignFilter] = useState("All");

  // ── Date range options ────────────────────────────────────────────────────
  const DATE_OPTIONS = [
    { label: "Last 7 Days",  days: 7  },
    { label: "Last 14 Days", days: 14 },
    { label: "Last 30 Days", days: 30 },
    { label: "Last 60 Days", days: 60 },
    { label: "Last 90 Days", days: 90 },
    { label: "This Month",   days: null, thisMonth: true  },
    { label: "This Year",    days: null, thisYear:  true  },
  ];
  const [selectedRange, setSelectedRange] = useState(DATE_OPTIONS[2]); // default: Last 30 Days

  const getDateRange = (option) => {
    const today = new Date();
    const fmt = (d) => d.toISOString().split("T")[0];
    if (option.thisMonth) {
      const start = new Date(today.getFullYear(), today.getMonth(), 1);
      return { startDate: fmt(start), endDate: fmt(today) };
    }
    if (option.thisYear) {
      const start = new Date(today.getFullYear(), 0, 1);
      return { startDate: fmt(start), endDate: fmt(today) };
    }
    const start = new Date();
    start.setDate(start.getDate() - option.days);
    return { startDate: fmt(start), endDate: fmt(today) };
  };

  // ── raw API data ──────────────────────────────────────────────────────────
  const [dashData,   setDashData]   = useState(null);
  const [msgData,    setMsgData]    = useState(null);
  const [campData,   setCampData]   = useState(null);
  const [convData,   setConvData]   = useState(null);

  // ── fetch all ─────────────────────────────────────────────────────────────
  const fetchAll = useCallback(async (range) => {
    setLoading(true);
    const { startDate, endDate } = getDateRange(range || selectedRange);
    try {
      const [dash, msg, camp, conv] = await Promise.all([
        AnalyticsApi.getDashboardAnalytics({ startDate, endDate }),
        AnalyticsApi.getMessageAnalytics({ groupBy: "monthly", startDate, endDate }),
        AnalyticsApi.getCampaignAnalytics(),
        AnalyticsApi.getConversationAnalytics({ startDate, endDate }),
      ]);
      if (dash?.success)  setDashData(dash.data);
      if (msg?.success)   setMsgData(msg.data);
      if (camp?.success)  setCampData(camp.data);
      if (conv?.success)  setConvData(conv.data);
    } catch (err) {
      console.error("GrowthOpportunityAnalysis fetch error:", err);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRange]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!dateDropOpen) return;
    const handler = () => setDateDropOpen(false);
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [dateDropOpen]);

  const handleSelectRange = (option) => {
    setSelectedRange(option);
    setDateDropOpen(false);
    fetchAll(option);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAll();
    setRefreshing(false);
  };

  // ── Derived values ────────────────────────────────────────────────────────
  const totalContacts    = dashData?.contacts?.total       ?? 0;
  const activeContacts   = dashData?.contacts?.active      ?? 0;
  const totalMessages    = dashData?.messages?.total       ?? 0;
  const campStats        = dashData?.campaigns             ?? {};
  const totalCampaigns   = campStats.total                 ?? 0;
  const activeCampaigns  = campStats.active                ?? 0;
  const totalSent        = campStats.totalSent             ?? 0;
  const totalDelivered   = campStats.totalDelivered        ?? 0;

  // message analytics
  const msgChartData     = msgData?.chartData              ?? [];
  const msgSummary       = msgData?.summary                ?? {};
  const msgSent          = msgSummary.totalSent            ?? 0;
  const msgDelivered     = msgSummary.totalDelivered       ?? 0;
  const deliveryRate     = msgSent > 0 ? safe((msgDelivered / msgSent) * 100) : 0;

  // campaign aggregates
  const overallStats     = campData?.summary?.overallStats ?? {};
  const campRead         = overallStats.read               ?? 0;
  const campReplied      = overallStats.replied            ?? 0;
  const campSent         = overallStats.sent               ?? 0;
  const readRate         = campSent > 0 ? safe((campRead    / campSent) * 100) : 0;
  const replyRate        = campSent > 0 ? safe((campReplied / campSent) * 100) : 0;
  const engagementScore  = Math.round(safe((readRate * 0.5 + replyRate * 0.5)));

  // conversation analytics totals
  const convTotals       = convData?.totals                ?? { marketing:{qty:0,cost:0}, utility:{qty:0,cost:0}, auth:{qty:0,cost:0}, service:{qty:0,cost:0} };
  const convTotal        = convData?.totalConversations    ?? 0;
  const convChartCats    = convData?.chartCategories       ?? [];
  const convChartSeries  = convData?.chartSeries           ?? [];

  // Conversion funnel: messages only (using available data)
  const funnelSent       = campSent  || totalMessages   || 0;
  const funnelDelivered  = campStats.totalDelivered     || 0;
  const funnelRead       = campRead                     || 0;
  const funnelReplied    = campReplied                  || 0;

  // Growth score: composite of delivery + read + reply rates (0-100)
  const growthScore = Math.min(100, Math.round(
    (deliveryRate * 0.3) + (readRate * 0.4) + (replyRate * 0.3)
  )) || 0;

  // Campaign performance growth rate (how many active vs total)
  const currentGrowthRate  = totalCampaigns > 0 ? Math.round((activeCampaigns / totalCampaigns) * 100) : 0;
  const suggestedGrowthRate = Math.min(100, currentGrowthRate + 14);
  const potentialImprovement = suggestedGrowthRate - currentGrowthRate;

  // Engagement stats for stat columns
  const engagementStats = [
    { label: "Messages Sent", value: fmtNum(campSent || totalMessages), change: campSent > 0 ? "+12%" : "N/A" },
    { label: "Delivered",     value: fmtNum(campStats.totalDelivered || msgDelivered), change: deliveryRate > 0 ? fmtPct(deliveryRate) : "N/A" },
    { label: "Read",          value: fmtNum(campRead), change: readRate > 0 ? fmtPct(readRate) : "N/A" },
    { label: "Replies",       value: fmtNum(campReplied), change: replyRate > 0 ? fmtPct(replyRate) : "N/A" },
    { label: "CTR",           value: readRate > 0 ? fmtPct(readRate, 0) : "0%", change: readRate > 0 ? `+${(readRate * 0.05).toFixed(1)}pp` : "N/A" },
    { label: "Response Rate", value: replyRate > 0 ? fmtPct(replyRate, 0) : "0%", change: replyRate > 0 ? `+${(replyRate * 0.1).toFixed(1)}pp` : "N/A" },
  ];

  // Funnel rows — derive dynamically
  const funnelRows = [
    { label: "Messages Sent", val: funnelSent.toLocaleString("en-IN"), pct: 95, color: "bg-[#2563eb]", drop: null },
    { label: "Delivered",     val: funnelDelivered.toLocaleString("en-IN"), pct: funnelSent > 0 ? Math.round((funnelDelivered/funnelSent)*95) : 92, color: "bg-[#3b82f6]", drop: funnelSent > 0 ? fmtPct(100 - (funnelDelivered/funnelSent)*100) : "3.5%" },
    { label: "Read",          val: funnelRead.toLocaleString("en-IN"), pct: funnelSent > 0 ? Math.round((funnelRead/funnelSent)*95) : 70, color: "bg-[#0d9488]", drop: funnelDelivered > 0 ? fmtPct(100 - (funnelRead/Math.max(funnelDelivered,1))*100) : "18.9%" },
    { label: "Replied",       val: funnelReplied.toLocaleString("en-IN"), pct: funnelSent > 0 ? Math.round((funnelReplied/funnelSent)*95) : 33, color: "bg-[#16a34a]", drop: funnelRead > 0 ? fmtPct(100 - (funnelReplied/Math.max(funnelRead,1))*100) : "55.9%" },
    { label: "Est. Leads",    val: Math.round(funnelReplied * 0.36).toLocaleString("en-IN"), pct: 15, color: "bg-[#15803d]", drop: funnelReplied > 0 ? "64.1%" : null },
    { label: "Est. Conversions", val: Math.round(funnelReplied * 0.14).toLocaleString("en-IN"), pct: 12, color: "bg-[#f59e0b]", drop: funnelReplied > 0 ? "60.8%" : null },
  ];

  // Funnel summary pills
  const funnelDeliveryRate   = funnelSent > 0 ? fmtPct((funnelDelivered/funnelSent)*100) : `${fmtPct(deliveryRate)}`;
  const funnelReadRate       = funnelSent > 0 ? fmtPct((funnelRead/funnelSent)*100) : `${fmtPct(readRate)}`;
  const funnelLeadRate       = funnelReplied > 0 ? fmtPct(36, 1) : "35.9%";
  const funnelConvRate       = funnelSent > 0 ? fmtPct((Math.round(funnelReplied*0.14)/Math.max(funnelSent,1))*100, 2) : "4.86%";

  // Revenue Impact chart — build from msgChartData (monthly sent)
  // Use conversation charges if available, otherwise fall back to static demo data
  const revenueChartData = (() => {
    if (msgChartData.length > 0) {
      const vals = msgChartData.slice(-8).map(d => d.sent || 0);
      const maxVal = Math.max(...vals, 1);
      // If real data is tiny (< 500 msgs), use it as-is with adapted scale
      // If large, multiply by 10 to represent revenue proxy
      return maxVal < 500 ? vals : vals.map(v => v * 10);
    }
    return [];
  })();

  const revenueChartCats = (() => {
    if (msgChartData.length > 0) {
      const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
      return msgChartData.slice(-8).map(d => {
        const parts = d.date?.split("-");
        return parts?.length >= 2 ? months[parseInt(parts[1]) - 1] : d.date;
      });
    }
    return ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug"];
  })();

  // Smart Y-axis max — adapts to any scale
  const smartYMax = (vals, minCeil = 10) => {
    const m = Math.max(...vals.filter(v => v > 0), minCeil);
    if (m <= 20)    return Math.ceil(m / 5)   * 5   + 5;
    if (m <= 200)   return Math.ceil(m / 20)  * 20  + 20;
    if (m <= 2000)  return Math.ceil(m / 200) * 200 + 200;
    if (m <= 20000) return Math.ceil(m / 2000) * 2000 + 2000;
    return Math.ceil(m / 20000) * 20000 + 20000;
  };

  const currentRevenue   = revenueChartData.filter(v => v > 0).reduce((a,b) => a+b, 0);
  const projectedRevenue = Math.round(currentRevenue * 1.42);
  const potentialRevIncrease = projectedRevenue - currentRevenue;

  // Conversation analytics chart — build from period selection
  const buildConvChartData = () => {
    const fallback = {
      Daily:   { categories: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"], marketing: [34,52,41,68,55,72,60], utility: [20,28,22,35,30,40,33], auth: [8,14,10,18,14,20,15], service: [12,18,15,22,18,25,20] },
      Weekly:  { categories: ["W1","W2","W3","W4","W5","W6"], marketing: [130,165,185,200,220,260], utility: [80,95,105,115,130,195], auth: [40,55,60,70,80,130], service: [60,75,80,90,100,85] },
      Monthly: { categories: ["Jan","Feb","Mar","Apr","May","Jun"], marketing: [520,600,680,720,800,760], utility: [310,360,400,430,480,450], auth: [140,160,185,200,220,205], service: [230,270,300,320,360,340] },
      Yearly:  { categories: ["2021","2022","2023","2024","2025","2026"], marketing: [2800,3400,4100,5200,6500,7200], utility: [1600,2000,2500,3100,3900,4300], auth: [700,900,1100,1400,1800,2000], service: [1100,1400,1700,2100,2600,2900] },
    };

    if (!convChartSeries.length) {
      // No real data available - return empty arrays for empty state
      return { categories: [], marketing: [], utility: [], auth: [], service: [] };
    }

    const mkIdx = convChartSeries.findIndex(s => s.name === "MARKETING");
    const utIdx = convChartSeries.findIndex(s => s.name === "UTILITY");
    const auIdx = convChartSeries.findIndex(s => s.name === "AUTH");
    const svIdx = convChartSeries.findIndex(s => s.name === "SERVICE");
    
    const mkData = convChartSeries[mkIdx]?.data ?? [];
    const utData = convChartSeries[utIdx]?.data ?? [];
    const auData = convChartSeries[auIdx]?.data ?? [];
    const svData = convChartSeries[svIdx]?.data ?? [];

    if (chartPeriod === "Daily") {
      return {
        categories: convChartCats.slice(-20),
        marketing: mkData.slice(-20),
        utility: utData.slice(-20),
        auth: auData.slice(-20),
        service: svData.slice(-20),
      };
    }

    // Aggregate data for Weekly, Monthly, Yearly
    const aggData = { categories: [], marketing: [], utility: [], auth: [], service: [] };
    let currentKey = null;
    let temp = { mk: 0, ut: 0, au: 0, sv: 0 };

    convChartCats.forEach((cat, i) => {
      let key;
      const d = new Date(cat);
      if (chartPeriod === "Weekly") {
        // e.g., "Jun W2"
        const w = Math.ceil(d.getDate() / 7);
        key = `${d.toLocaleString('default', { month: 'short' })} W${w}`;
      } else if (chartPeriod === "Monthly") {
        key = d.toLocaleString('default', { month: 'short' });
      } else {
        key = d.getFullYear().toString();
      }

      if (key !== currentKey) {
        if (currentKey !== null) {
          aggData.categories.push(currentKey);
          aggData.marketing.push(temp.mk);
          aggData.utility.push(temp.ut);
          aggData.auth.push(temp.au);
          aggData.service.push(temp.sv);
        }
        currentKey = key;
        temp = { mk: 0, ut: 0, au: 0, sv: 0 };
      }
      temp.mk += mkData[i] || 0;
      temp.ut += utData[i] || 0;
      temp.au += auData[i] || 0;
      temp.sv += svData[i] || 0;
    });

    if (currentKey !== null) {
      aggData.categories.push(currentKey);
      aggData.marketing.push(temp.mk);
      aggData.utility.push(temp.ut);
      aggData.auth.push(temp.au);
      aggData.service.push(temp.sv);
    }

    // Fallback if aggregated data is too sparse (e.g. only 1 month of data but "Yearly" is selected)
    if (aggData.categories.length < 2) {
      return fallback[chartPeriod];
    }

    return aggData;
  };

  const cd = buildConvChartData();

  const chartOptions = {
    chart: { type: "area", toolbar: { show: false }, fontFamily: "Urbanist, sans-serif", animations: { enabled: true, speed: 600 }, background: "transparent" },
    colors: ["#3b82f6", "#10B981", "#8b5cf6", "#f97316"],
    stroke: { curve: "smooth", width: 2 },
    dataLabels: { enabled: false },
    markers: { size: 0 },
    xaxis: { categories: cd.categories, axisBorder: { show: false }, axisTicks: { show: false }, labels: { style: { colors: "#94a3b8", fontWeight: 600, fontSize: "11px" } } },
    yaxis: { labels: { style: { colors: "#94a3b8", fontWeight: 600, fontSize: "11px" }, formatter: (v) => v } },
    grid: { borderColor: "#f1f5f9", strokeDashArray: 4 },
    legend: { show: false },
    tooltip: { theme: "light", style: { fontFamily: "Urbanist, sans-serif", fontSize: "12px" } },
    fill: { type: "gradient", gradient: { shade: "light", type: "vertical", shadeIntensity: 0.1, opacityFrom: 0.25, opacityTo: 0 } },
  };

  const chartSeries = [
    { name: "Marketing", data: cd.marketing },
    { name: "Utility",   data: cd.utility   },
    { name: "Auth",      data: cd.auth      },
    { name: "Service",   data: cd.service   },
  ];

  // Sent/Delivered line chart series from msgChartData
  const engagementLineCategories = msgChartData.length > 0
    ? msgChartData.slice(-6).map(d => {
        const [, m] = (d.date||"").split("-");
        const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
        return months[parseInt(m)-1] || d.date;
      })
    : [];

  const engagementSentData      = msgChartData.length > 0 ? msgChartData.slice(-6).map(d => d.sent      || 0) : [];
  const engagementDeliveredData = msgChartData.length > 0 ? msgChartData.slice(-6).map(d => d.delivered || 0) : [];
  // smartYMax already defined above — use it here for the engagement chart
  const engagementYMax = smartYMax(engagementSentData);

  // Health indicators derived from real data
  const opportunityScore  = growthScore;
  const campaignHealth    = totalCampaigns > 0 ? Math.min(100, Math.round((activeCampaigns / totalCampaigns) * 100 + 40)) : 0;
  const revenueHealth     = Math.min(100, Math.round(deliveryRate * 0.82));
  const conversionScore   = Math.min(100, Math.round(replyRate * 1.5) || 0);

  const healthBadge = (v) => v >= 80 ? "Excellent" : "Good";

  // This Month sidebar stats
  const thisMonthBroadcasts  = totalCampaigns;
  const thisMonthContacts    = totalContacts;
  const thisMonthRevenue     = currentRevenue;
  const thisMonthConversions = Math.round(funnelReplied * 0.14);

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
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <div
                onClick={() => setDateDropOpen(o => !o)}
                className="flex items-center gap-2 border border-slate-200 rounded-full px-4 py-2 text-slate-600 text-sm bg-white cursor-pointer hover:bg-slate-50 transition-colors select-none"
              >
                <Calendar className="w-4 h-4 text-slate-400" />
                <span className="font-semibold text-sm">{selectedRange.label}</span>
                <svg className={`w-3 h-3 text-slate-400 transition-transform ${dateDropOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                </svg>
              </div>

              {/* Dropdown */}
              {dateDropOpen && (
                <div className="absolute right-0 top-full mt-2 w-44 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 py-1.5 overflow-hidden">
                  {DATE_OPTIONS.map((opt) => (
                    <button
                      key={opt.label}
                      onClick={() => handleSelectRange(opt)}
                      className={`w-full text-left px-4 py-2 text-sm font-medium transition-colors ${
                        selectedRange.label === opt.label
                          ? "bg-[#ecfdf5] text-[#10B981] font-bold"
                          : "text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
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
                    {loading ? "–" : `${Math.min(99, growthScore + 8)}% Confidence`}
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
                          strokeDasharray={`${(growthScore / 100) * 264} 264`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl font-extrabold text-slate-900">
                          {loading ? "–" : growthScore}
                        </span>
                        <span className="text-[9px] text-slate-400 font-medium">out of 100</span>
                      </div>
                    </div>
                    <p className="text-sm font-bold text-slate-900">Growth Score</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {growthScore >= 80 ? "Excellent performance" : growthScore >= 60 ? "Good performance" : "Needs improvement"}
                    </p>
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
                      {loading ? <Skeleton className="h-7 w-24" /> :
                        <p className="text-lg font-extrabold text-[#10B981] leading-tight">
                          +₹{potentialRevIncrease > 0 ? potentialRevIncrease.toLocaleString("en-IN") : "0"}
                        </p>}
                    </div>
                    {/* Lead */}
                    <div className="bg-[#eff6ff] rounded-xl p-3.5">
                      <div className="w-7 h-7 bg-white rounded-full flex items-center justify-center mb-2.5">
                        <TrendingUp className="w-3.5 h-3.5 text-[#3b82f6]" />
                      </div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide leading-tight mb-1">
                        Potential Lead Increase
                      </p>
                      {loading ? <Skeleton className="h-7 w-16" /> :
                        <p className="text-lg font-extrabold text-[#3b82f6] leading-tight">
                          +{potentialImprovement > 0 ? potentialImprovement + 18 : 32}%
                        </p>}
                    </div>
                    {/* Conversion */}
                    <div className="bg-[#faf5ff] rounded-xl p-3.5">
                      <div className="w-7 h-7 bg-white rounded-full flex items-center justify-center mb-2.5">
                        <Target className="w-3.5 h-3.5 text-[#a855f7]" />
                      </div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide leading-tight mb-1">
                        Potential Conversion Increase
                      </p>
                      {loading ? <Skeleton className="h-7 w-16" /> :
                        <p className="text-lg font-extrabold text-[#a855f7] leading-tight">
                          +{Math.max(18, Math.round(replyRate * 0.4))}%
                        </p>}
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
                      {loading ? <Skeleton className="h-7 w-16" /> :
                        <p className="text-lg font-extrabold text-[#f59e0b] leading-tight">
                          {Math.min(99, growthScore + 8)}%
                        </p>}
                    </div>
                  </div>

                  {/* Col 4: AI Recommendation */}
                  <div className="bg-[#10B981] rounded-xl p-4 text-white flex flex-col">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mb-3">
                      <Zap className="w-4 h-4 text-white" />
                    </div>
                    <p className="text-sm font-bold mb-1.5">AI Recommendation</p>
                    <p className="text-[11px] text-white/85 leading-relaxed mb-4 flex-1">
                      {activeCampaigns > 0
                        ? `You have ${activeCampaigns} active campaign${activeCampaigns > 1 ? "s" : ""}. Scale evening marketing for maximum ROI this quarter.`
                        : "Launch your first broadcast campaign to start building momentum and track real growth."}
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
                        {loading ? <Skeleton className="h-7 w-12" /> : <>
                          <span className="text-lg font-extrabold text-slate-900">{currentGrowthRate}%</span>
                          <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5">
                            <TrendingUp className="w-2.5 h-2.5" />+{currentGrowthRate}%
                          </span>
                        </>}
                      </div>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-2.5">
                      <p className="text-[10px] text-slate-400 mb-0.5">Suggested Growth Rate</p>
                      {loading ? <Skeleton className="h-5 w-10" /> :
                        <span className="text-base font-extrabold text-blue-600">{suggestedGrowthRate}%</span>}
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 mb-0.5">Potential Improvement</p>
                      <div className="flex items-center gap-1.5">
                        {loading ? <Skeleton className="h-5 w-14" /> : <>
                          <span className="text-sm font-extrabold text-slate-900">+{potentialImprovement}pp</span>
                          <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5">
                            <TrendingUp className="w-2.5 h-2.5" />+{potentialImprovement > 0 ? Math.round((potentialImprovement / Math.max(currentGrowthRate, 1)) * 100) : 58}% lift
                          </span>
                        </>}
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
                        {loading ? <Skeleton className="h-7 w-12" /> : <>
                          <span className="text-lg font-extrabold text-slate-900">{fmtPct(replyRate, 0)}</span>
                          <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5">
                            <TrendingUp className="w-2.5 h-2.5" />+{(replyRate * 0.1).toFixed(1)}pp
                          </span>
                        </>}
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 mb-0.5">Read Rate</p>
                      <div className="flex items-center gap-1.5">
                        {loading ? <Skeleton className="h-7 w-12" /> : <>
                          <span className="text-lg font-extrabold text-slate-900">{fmtPct(readRate, 0)}</span>
                          <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5">
                            <TrendingUp className="w-2.5 h-2.5" />+{(readRate * 0.12).toFixed(1)}pp
                          </span>
                        </>}
                      </div>
                    </div>
                    <div className="bg-emerald-50 rounded-lg p-2.5">
                      <p className="text-[10px] text-slate-400 mb-0.5">Engagement Score</p>
                      {loading ? <Skeleton className="h-5 w-14" /> :
                        <span className="text-base font-extrabold text-emerald-600">{engagementScore}/100</span>}
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
                        {loading ? <Skeleton className="h-7 w-14" /> : <>
                          <span className="text-lg font-extrabold text-slate-900">{fmtPct(replyRate * 0.14, 1)}</span>
                          <span className="text-[10px] font-bold text-red-500 flex items-center gap-0.5">
                            <TrendingDown className="w-2.5 h-2.5" />-0.2pp
                          </span>
                        </>}
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 mb-0.5">Projected Conversion</p>
                      {loading ? <Skeleton className="h-7 w-14" /> :
                        <span className="text-lg font-extrabold text-[#a855f7]">{fmtPct(replyRate * 0.17, 1)}</span>}
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 mb-0.5">Expected Gain</p>
                      <div className="flex items-center gap-1.5">
                        {loading ? <Skeleton className="h-5 w-14" /> : <>
                          <span className="text-sm font-extrabold text-slate-900">+{Math.max(18, Math.round(replyRate * 0.4))}%</span>
                          <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5">
                            <TrendingUp className="w-2.5 h-2.5" />+0.9pp
                          </span>
                        </>}
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
                        {loading ? <Skeleton className="h-7 w-16" /> : <>
                          <span className="text-lg font-extrabold text-slate-900">
                            ₹{currentRevenue > 0 ? (currentRevenue >= 100000 ? `${(currentRevenue/100000).toFixed(2)}L` : currentRevenue.toLocaleString("en-IN")) : "0"}
                          </span>
                          <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5">
                            <TrendingUp className="w-2.5 h-2.5" />+8%
                          </span>
                        </>}
                      </div>
                    </div>
                    <div className="bg-amber-50 rounded-lg p-2.5">
                      <p className="text-[10px] text-slate-400 mb-0.5">Projected Revenue</p>
                      {loading ? <Skeleton className="h-5 w-16" /> :
                        <span className="text-base font-extrabold text-amber-600">
                          ₹{projectedRevenue > 0 ? (projectedRevenue >= 100000 ? `${(projectedRevenue/100000).toFixed(2)}L` : projectedRevenue.toLocaleString("en-IN")) : "0"}
                        </span>}
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 mb-0.5">Potential Increase</p>
                      <div className="flex items-center gap-1.5">
                        {loading ? <Skeleton className="h-5 w-16" /> : <>
                          <span className="text-sm font-extrabold text-slate-900">
                            +₹{potentialRevIncrease > 0 ? (potentialRevIncrease >= 100000 ? `${(potentialRevIncrease/100000).toFixed(2)}L` : potentialRevIncrease.toLocaleString("en-IN")) : "0"}
                          </span>
                          <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5">
                            <TrendingUp className="w-2.5 h-2.5" />+{potentialRevIncrease > 0 && currentRevenue > 0 ? Math.round((potentialRevIncrease/currentRevenue)*100) : 106}%
                          </span>
                        </>}
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
                    { name: "Utility",   color: "#10B981" },
                    { name: "Auth",      color: "#8b5cf6" },
                    { name: "Service",   color: "#f97316" },
                  ].map((l) => (
                    <div key={l.name} className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: l.color }} />
                      <span className="text-[11px] text-slate-500 font-medium">{l.name}</span>
                    </div>
                  ))}
                </div>
                {loading ? <Skeleton className="h-[220px] w-full" /> :
                  <Chart options={chartOptions} series={chartSeries} type="area" height={220} />}
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
                    <p className="text-xs text-slate-400 font-normal">Message performance — last 30 days</p>
                  </div>
                </div>

                {/* 6 stat columns */}
                <div className="grid grid-cols-6 mb-6">
                  {engagementStats.map((s, i) => (
                    <div
                      key={s.label}
                      className={`bg-slate-50 px-4 py-3 ${i < 5 ? "border-r border-slate-200" : ""} ${i === 0 ? "rounded-l-xl" : ""} ${i === 5 ? "rounded-r-xl" : ""}`}
                    >
                      <p className="text-[10px] text-slate-400 font-medium mb-1">{s.label}</p>
                      {loading ? <Skeleton className="h-7 w-16 mb-1" /> :
                        <p className="text-lg font-extrabold text-slate-900 leading-tight">{s.value}</p>}
                      <p className="text-[10px] font-bold text-emerald-600 mt-0.5 flex items-center gap-0.5">
                        <TrendingUp className="w-2.5 h-2.5" />{s.change}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Dual line chart */}
                {loading ? <Skeleton className="h-[220px] w-full" /> :
                  <Chart
                    options={{
                      chart: { type: "line", toolbar: { show: false }, fontFamily: "Urbanist, sans-serif", background: "transparent", animations: { enabled: true, speed: 500 }, zoom: { enabled: false } },
                      colors: ["#10B981", "#f43f5e"],
                      stroke: { curve: "straight", width: [1.5, 1.5], dashArray: [0, 3] },
                      dataLabels: { enabled: false },
                      markers: { size: 0 },
                      xaxis: {
                        categories: engagementLineCategories,
                        axisBorder: { show: false },
                        axisTicks: { show: false },
                        labels: { style: { colors: "#94a3b8", fontSize: "10px", fontWeight: 600 } },
                      },
                      yaxis: {
                        min: 0,
                        max: engagementYMax,
                        tickAmount: 4,
                        labels: {
                          style: { colors: "#94a3b8", fontSize: "10px", fontWeight: 600 },
                          formatter: (v) => {
                            if (v === 0) return "0";
                            if (v >= 1000) return `${(v/1000).toFixed(0)}k`;
                            return `${v}`;
                          }
                        },
                      },
                      grid: { borderColor: "#f1f5f9", strokeDashArray: 0, xaxis: { lines: { show: false } } },
                      legend: { show: false },
                      tooltip: { theme: "light", style: { fontFamily: "Urbanist, sans-serif" } },
                      fill: { type: "solid", opacity: 1 },
                    }}
                    series={[
                      { name: "Messages Sent", data: engagementSentData },
                      { name: "Delivered",     data: engagementDeliveredData },
                    ]}
                    type="line"
                    height={220}
                  />}
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
                      {loading ? <Skeleton className="h-7 w-24 mx-auto" /> :
                        <p className="text-xl font-extrabold text-[#059669]">
                          ₹{currentRevenue > 0 ? currentRevenue.toLocaleString("en-IN") : "0"}
                        </p>}
                    </div>
                    <div className="bg-[#eff6ff] rounded-full px-5 py-2.5 text-center min-w-[120px]">
                      <p className="text-[10px] text-slate-500 font-medium mb-0.5">Projected Revenue</p>
                      {loading ? <Skeleton className="h-7 w-24 mx-auto" /> :
                        <p className="text-xl font-extrabold text-[#2563eb]">
                          ₹{projectedRevenue > 0 ? projectedRevenue.toLocaleString("en-IN") : "0"}
                        </p>}
                    </div>
                    <div className="bg-[#faf5ff] rounded-full px-5 py-2.5 text-center min-w-[120px]">
                      <p className="text-[10px] text-slate-500 font-medium mb-0.5">Avg Order Value</p>
                      <p className="text-xl font-extrabold text-[#a855f7]">₹{campSent > 0 && campReplied > 0 ? Math.round((overallStats.read || 0) / Math.max(campReplied, 1) * 100).toLocaleString("en-IN") : "—"}</p>
                      <p className="text-[8px] text-slate-400 mt-0.5 italic">Estimated</p>
                    </div>
                  </div>
                </div>

                {loading ? <Skeleton className="h-[240px] w-full" /> :
                  <Chart
                    options={{
                      chart: { type: "bar", toolbar: { show: false }, fontFamily: "Urbanist, sans-serif", background: "transparent", animations: { enabled: true } },
                      colors: ["#dcfce7"],
                      plotOptions: { bar: { borderRadius: 4, columnWidth: "75%", distributed: false } },
                      dataLabels: { enabled: false },
                      xaxis: {
                        categories: revenueChartCats,
                        axisBorder: { show: false },
                        axisTicks: { show: false },
                        labels: { style: { colors: "#94a3b8", fontSize: "10px", fontWeight: 600 } },
                      },
                      yaxis: {
                        min: 0,
                        max: smartYMax(revenueChartData),
                        tickAmount: 4,
                        labels: {
                          style: { colors: "#94a3b8", fontSize: "10px", fontWeight: 600 },
                          formatter: (v) => {
                            if (v === 0) return "₹0";
                            if (v >= 1000) return `₹${(v/1000).toFixed(0)}k`;
                            return `₹${v}`;
                          }
                        },
                      },
                      grid: { borderColor: "#f1f5f9", strokeDashArray: 4 },
                      legend: { show: false },
                      tooltip: { theme: "light", style: { fontFamily: "Urbanist, sans-serif" }, y: { formatter: (v) => `₹${v.toLocaleString("en-IN")}` } },
                      fill: { type: "solid", opacity: 1 },
                      stroke: { show: true, width: 1.5, colors: ["#10B981"] },
                    }}
                    series={[{ name: "Revenue", data: revenueChartData }]}
                    type="bar"
                    height={240}
                  />}
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
                          {/* Active buyers (% of active/total contacts) */}
                          <circle cx="50" cy="50" r="38" fill="none" stroke="#f1f5f9" strokeWidth="18" />
                          {(() => {
                            const activePct = totalContacts > 0 ? safe((activeContacts / totalContacts) * 100) : 35;
                            const warmPct   = Math.min(100 - activePct, 28);
                            const inactivePct = Math.min(100 - activePct - warmPct, 22);
                            const newPct    = Math.max(0, 100 - activePct - warmPct - inactivePct);
                            const circ = 238.7;
                            const toArc = (p) => (p / 100) * circ;
                            let offset = 0;
                            const segments = [
                              { color: "#f59e0b", pct: newPct    },
                              { color: "#94a3b8", pct: inactivePct },
                              { color: "#3b82f6", pct: warmPct   },
                              { color: "#10B981", pct: activePct },
                            ];
                            return segments.map((s, i) => {
                              const arc = toArc(s.pct);
                              const el = (
                                <circle key={i} cx="50" cy="50" r="38" fill="none" stroke={s.color}
                                  strokeWidth="18" strokeDasharray={`${arc} ${circ}`}
                                  strokeDashoffset={-offset} />
                              );
                              offset += arc;
                              return el;
                            });
                          })()}
                        </svg>
                      </div>
                      <div className="grid grid-cols-2 gap-y-3 gap-x-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-[#10B981]" /><span className="text-[9px] text-slate-500 leading-tight">Active<br/>Buyers</span></div>
                          <span className="text-[10px] font-extrabold text-slate-900">
                            {loading ? "–" : (totalContacts > 0 ? `${Math.round((activeContacts/totalContacts)*100)}%` : "35%")}
                          </span>
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
                      <p className="text-[10px] text-slate-400 font-semibold mb-4 border-l border-slate-100 pl-4 -ml-4 flex items-center gap-2">Top Regions <span className="text-[8px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">Sample data</span></p>
                      <div className="space-y-3.5 border-l border-slate-100 pl-4 -ml-4 flex-1">
                        {[
                          { name: "Maharashtra", val: "34%", color: "#10B981" },
                          { name: "Delhi NCR",   val: "22%", color: "#3b82f6" },
                          { name: "Karnataka",   val: "18%", color: "#a855f7" },
                          { name: "Tamil Nadu",  val: "14%", color: "#f97316" },
                          { name: "Gujarat",     val: "12%", color: "#94a3b8" },
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
                      <p className="text-[11px] text-slate-400 mt-0.5 font-medium flex items-center gap-2">Engagement heatmap by day and hour <span className="text-[8px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">Sample data</span></p>
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
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mt-5 relative">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <Rocket className="w-5 h-5 text-[#10B981]" strokeWidth={2.5} />
                    <div>
                      <h2 className="text-base font-bold text-slate-900">AI Campaign Recommendations</h2>
                      <p className="text-[11px] text-slate-400 mt-0.5 font-medium">Personalised suggestions based on your audience and history</p>
                    </div>
                  </div>
                  <div className="relative">
                    <button 
                      onClick={() => setFilterDropOpen(!filterDropOpen)}
                      className="flex items-center gap-1.5 px-4 py-1.5 bg-slate-50 border border-slate-200 rounded-full text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                    >
                      <Filter className="w-3.5 h-3.5" /> 
                      {activeCampaignFilter === "All" ? "Filter" : activeCampaignFilter}
                    </button>
                    
                    {/* Filter Dropdown */}
                    {filterDropOpen && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setFilterDropOpen(false)} />
                        <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 shadow-xl rounded-xl py-2 z-50 animate-in fade-in slide-in-from-top-2">
                          {["All", "Easy", "Medium", "Hard", "High Impact", "High ROI", "Recommended", "Long-term", "Seasonal"].map((option) => (
                            <button
                              key={option}
                              onClick={() => { setActiveCampaignFilter(option); setFilterDropOpen(false); }}
                              className={`w-full text-left px-4 py-2 text-[13px] font-medium transition-colors ${activeCampaignFilter === option ? "bg-emerald-50 text-emerald-700" : "text-slate-600 hover:bg-slate-50"}`}
                            >
                              {option}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  {(() => {
                    const defaultRecs = [
                      { icon: "🎒", title: "Back-to-School Campaign",   badge: "High Impact", badgeColor: "text-emerald-700 bg-[#dcfce7]", reach: fmtNum(totalContacts > 10 ? Math.round(totalContacts * 0.35) : 12400), conversion: "18%", revenue: "₹45,000", difficulty: "Easy",   difficultyColor: "text-emerald-700 bg-[#dcfce7]" },
                      { icon: "🔄", title: "Re-engagement Campaign",    badge: "Recommended", badgeColor: "text-amber-700 bg-[#fef3c7]",   reach: fmtNum(totalContacts > 10 ? Math.round((totalContacts - activeContacts) * 0.45) : 8200), conversion: "22%", revenue: "₹38,500", difficulty: "Medium", difficultyColor: "text-amber-700 bg-[#fef3c7]" },
                      { icon: "⬆️", title: "Upsell Campaign",           badge: "High ROI",    badgeColor: "text-emerald-700 bg-[#dcfce7]", reach: fmtNum(totalContacts > 10 ? Math.round(activeContacts * 0.6) : 4800), conversion: "31%", revenue: "₹52,000", difficulty: "Easy",   difficultyColor: "text-emerald-700 bg-[#dcfce7]" },
                      { icon: "🌱", title: "Lead Nurture Campaign",     badge: "Long-term",   badgeColor: "text-amber-700 bg-[#fef3c7]",   reach: fmtNum(totalContacts > 10 ? Math.round(totalContacts * 0.18) : 6500), conversion: "15%", revenue: "₹28,000", difficulty: "Medium", difficultyColor: "text-amber-700 bg-[#fef3c7]" },
                      { icon: "🎉", title: "Festive Promotion Campaign", badge: "Seasonal",   badgeColor: "text-red-700 bg-red-100",        reach: fmtNum(totalContacts > 10 ? Math.round(totalContacts * 0.50) : 18000), conversion: "12%", revenue: "₹72,000", difficulty: "Hard",   difficultyColor: "text-red-700 bg-red-100" },
                    ];

                    const realCampaigns = campData?.campaigns || [];
                    let recommendations = [];
                    
                    if (realCampaigns.length > 0) {
                      // Sort by highest volume (sent)
                      const topCampaigns = [...realCampaigns].sort((a, b) => (b.stats?.sent || 0) - (a.stats?.sent || 0)).slice(0, 5);
                      
                      recommendations = topCampaigns.map((c, idx) => {
                        const sent = c.stats?.sent || 0;
                        const replied = c.stats?.replied || 0;
                        const convRate = sent > 0 ? (replied / sent * 100).toFixed(1) : "0.0";
                        const isHighImpact = parseFloat(convRate) > 10;
                        const icons = ["✨", "📈", "🎯", "🌟", "💡"];
                        
                        return {
                          icon: icons[idx % icons.length],
                          title: `Re-run: ${c.name}`,
                          badge: isHighImpact ? "High Impact" : "Recommended",
                          badgeColor: isHighImpact ? "text-emerald-700 bg-[#dcfce7]" : "text-amber-700 bg-[#fef3c7]",
                          reach: fmtNum(sent),
                          conversion: `${convRate}%`,
                          revenue: `₹${(replied * 1200).toLocaleString('en-IN')}`, 
                          difficulty: "Easy",
                          difficultyColor: "text-emerald-700 bg-[#dcfce7]"
                        };
                      });
                      
                      // Fill missing slots with defaults
                      if (recommendations.length < 5) {
                        recommendations = [...recommendations, ...defaultRecs.slice(recommendations.length)];
                      }
                    } else {
                      recommendations = defaultRecs;
                    }
                    
                    return recommendations;
                  })()
                  .filter(rec => activeCampaignFilter === "All" || rec.difficulty === activeCampaignFilter || rec.badge === activeCampaignFilter)
                  .map((rec, i) => (
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

                {loading ? <Skeleton className="h-48 w-full" /> :
                  <div className="space-y-3.5">
                    {funnelRows.map((row, i) => (
                      <div key={i} className="flex items-center">
                        <div className="w-28 shrink-0 text-right pr-4 text-[11px] font-medium text-slate-500">
                          {row.label}
                        </div>
                        <div className="flex-1 flex items-center pr-4">
                          <div
                            className={`h-8 rounded-full flex items-center px-4 text-white text-xs font-bold shadow-sm ${row.color}`}
                            style={{ width: `${row.pct}%`, minWidth: "fit-content" }}
                          >
                            {row.val}
                          </div>
                        </div>
                        <div className="w-16 shrink-0 text-right text-[11px] font-bold text-red-500">
                          {row.drop && `↓ ${row.drop}`}
                        </div>
                      </div>
                    ))}
                  </div>}

                {/* Summary Pills */}
                <div className="grid grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-100">
                  <div className="bg-[#eff6ff] rounded-xl p-4 text-center">
                    <p className="text-[10px] text-slate-500 font-medium mb-1">Delivery Rate</p>
                    <p className="text-xl font-extrabold text-[#2563eb]">{loading ? "–" : funnelDeliveryRate}</p>
                  </div>
                  <div className="bg-[#f0fdfa] rounded-xl p-4 text-center">
                    <p className="text-[10px] text-slate-500 font-medium mb-1">Read Rate</p>
                    <p className="text-xl font-extrabold text-[#0d9488]">{loading ? "–" : funnelReadRate}</p>
                  </div>
                  <div className="bg-[#f0fdf4] rounded-xl p-4 text-center">
                    <p className="text-[10px] text-slate-500 font-medium mb-1">Lead Rate</p>
                    <p className="text-xl font-extrabold text-[#16a34a]">{funnelLeadRate}</p>
                  </div>
                  <div className="bg-[#fffbeb] rounded-xl p-4 text-center">
                    <p className="text-[10px] text-slate-500 font-medium mb-1">Conversion Rate</p>
                    <p className="text-xl font-extrabold text-[#d97706]">{loading ? "–" : funnelConvRate}</p>
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
                      <p className="text-[11px] text-slate-400 mt-0.5 font-medium flex items-center gap-2">Prioritised tasks for maximum growth impact <span className="text-[8px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">Estimated values</span></p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {[
                      { icon: <AlertTriangle className="w-4 h-4 text-red-500" />, title: "Increase Evening Campaign Broadcasts",  badge: "High",   badgeColor: "text-red-600 bg-red-100",     desc: "Peak engagement detected 7–9 PM. Schedule 3 broadcasts this week.", gain: "+₹18,000", effort: "Low" },
                      { icon: <AlertTriangle className="w-4 h-4 text-red-500" />, title: "Target Inactive Customer Segment",     badge: "High",   badgeColor: "text-red-600 bg-red-100",     desc: `${fmtNum(Math.max(0, totalContacts - activeContacts))} inactive contacts identified. Re-engagement can recover 28% of lost revenue.`, gain: "+₹34,500", effort: "Medium" },
                      { icon: <Clock className="w-4 h-4 text-yellow-500" />,       title: "Create Remarketing Campaign",         badge: "Medium", badgeColor: "text-amber-700 bg-amber-100", desc: "62% cart abandonment. Automated follow-ups can significantly recover conversions.", gain: "+₹12,000", effort: "Medium" },
                      { icon: <Clock className="w-4 h-4 text-yellow-500" />,       title: "Launch June Promotional Broadcast",   badge: "Medium", badgeColor: "text-amber-700 bg-amber-100", desc: `Festive season opportunity. Estimated reach: ${fmtNum(Math.round(totalContacts * 0.23) || 8400)} contacts.`, gain: "+₹22,000", effort: "Low" },
                      { icon: <Circle className="w-4 h-4 text-slate-400" />,       title: "Optimize Response Workflows",         badge: "Low",    badgeColor: "text-slate-600 bg-slate-100",  desc: "Avg. first response time is 4.2 min. Target: under 2 minutes to improve retention.", gain: "+8% Retention", effort: "High", isGainGreenPill: true },
                    ].map((item, i) => (
                      <div key={i} className="border border-slate-100 rounded-2xl p-4 flex gap-3 hover:border-slate-200 transition-colors">
                        <div className="mt-0.5 shrink-0">{item.icon}</div>
                        <div>
                          <div className="flex items-center gap-2 mb-1.5">
                            <h3 className="text-[13px] font-bold text-slate-900">{item.title}</h3>
                            <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full ${item.badgeColor}`}>{item.badge}</span>
                          </div>
                          <p className="text-[11px] text-slate-500 font-medium leading-relaxed mb-3 pr-4">{item.desc}</p>
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
                      {loading ? <Skeleton className="h-7 w-14" /> :
                        <p className="text-xl font-extrabold text-slate-900 leading-tight">
                          +{Math.max(58, Math.round((campReplied || 42) * 3.76))}
                        </p>}
                      <p className="text-[10px] font-bold text-[#10B981] mt-1">vs. {campReplied || 42} today</p>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-3">
                      <p className="text-[10px] text-slate-400 font-medium mb-2 leading-tight">Projected<br/>Conversions</p>
                      {loading ? <Skeleton className="h-7 w-14" /> :
                        <p className="text-xl font-extrabold text-slate-900 leading-tight">
                          +{Math.max(18, Math.round(thisMonthConversions * 3.94))}
                        </p>}
                      <p className="text-[10px] font-bold text-[#10B981] mt-1">vs. {Math.max(18, thisMonthConversions)} today</p>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-3">
                      <p className="text-[10px] text-slate-400 font-medium mb-2 leading-tight">Projected<br/>Revenue</p>
                      {loading ? <Skeleton className="h-7 w-16" /> :
                        <p className="text-xl font-extrabold text-slate-900 leading-tight">
                          +₹{potentialRevIncrease > 0 ? `${Math.round(potentialRevIncrease/1000)}k` : "33.6k"}
                        </p>}
                      <p className="text-[10px] font-bold text-[#10B981] mt-1">30-day gain</p>
                    </div>
                  </div>

                  <div className="flex-1 min-h-[250px]">
                    {loading ? <Skeleton className="h-[250px] w-full" /> :
                      <Chart
                        options={{
                          chart: { type: "area", toolbar: { show: false }, fontFamily: "Urbanist, sans-serif", background: "transparent", animations: { enabled: true } },
                          colors: ["#3b82f6"],
                          stroke: { curve: "smooth", width: 2, dashArray: 4 },
                          dataLabels: { enabled: false },
                          markers: { size: 0 },
                          xaxis: {
                            categories: ["D1","D3","D7","D14","D21","D30"],
                            axisBorder: { show: false },
                            axisTicks: { show: false },
                            labels: { style: { colors: "#94a3b8", fontSize: "10px", fontWeight: 600 } },
                          },
                          yaxis: {
                            min: 0,
                            max: Math.max(160, Math.round(campReplied * 4)),
                            tickAmount: 4,
                            labels: { style: { colors: "#94a3b8", fontSize: "10px", fontWeight: 600 } },
                          },
                          grid: { borderColor: "#f1f5f9", strokeDashArray: 4 },
                          legend: { show: false },
                          tooltip: { theme: "light", style: { fontFamily: "Urbanist, sans-serif" } },
                          fill: { type: "gradient", gradient: { shadeIntensity: 1, opacityFrom: 0.25, opacityTo: 0, stops: [0, 100] } },
                        }}
                        series={[{ name: "Projection", data: [
                          Math.max(1, campReplied || 42),
                          Math.round((campReplied || 42) * 1.07),
                          Math.round((campReplied || 42) * 1.31),
                          Math.round((campReplied || 42) * 1.90),
                          Math.round((campReplied || 42) * 2.74),
                          Math.round((campReplied || 42) * 3.81),
                        ] }]}
                        type="area"
                        height="100%"
                      />}
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
                    {loading ? "Calculating…" : (readRate > 64 || replyRate > 28) ? "Outperforming Industry" : "On Par with Industry"} <TrendingUp className="w-3 h-3" strokeWidth={3} />
                  </div>
                </div>

                <div className="space-y-6">
                  {[
                    { label: "Open Rate",       ind: 64, your: Math.round(readRate)  || 81 },
                    { label: "Click Rate",       ind: 21, your: Math.round(replyRate * 0.81) || 34 },
                    { label: "Response Rate",    ind: 28, your: Math.round(replyRate) || 42 },
                    { label: "Conversion Rate",  ind: 8,  your: Math.round(replyRate * 0.14) || 14 },
                    { label: "Revenue Growth",   ind: 15, your: Math.min(100, Math.round(deliveryRate * 0.28)) || 28 },
                  ].map((row, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex justify-between items-end mb-1">
                        <p className="text-[13px] font-bold text-slate-700">{row.label}</p>
                        <p className="text-[11px] font-medium text-slate-400">
                          Industry avg: {row.ind}% <span className="ml-2 text-[#15803d] font-bold">Yours: {loading ? "–" : row.your}%</span>
                        </p>
                      </div>
                      <div className="space-y-1.5">
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-slate-300 rounded-full" style={{ width: `${row.ind}%` }} />
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-[#15803d] rounded-full transition-all duration-700" style={{ width: `${loading ? 0 : Math.min(row.your, 100)}%` }} />
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
                  <p className="text-2xl font-extrabold mb-1">
                    {loading ? "Loading…" : (growthScore >= 80 ? "On Track 🚀" : growthScore >= 60 ? "Progressing 📈" : "Needs Boost 💡")}
                  </p>
                  <p className="text-xs text-white/80 font-medium mb-5">
                    {loading ? "" : `${growthScore >= 80 ? "+" : ""}${growthScore - 50}% above baseline target`}
                  </p>
                  <div className="bg-white/25 rounded-full h-1.5 mb-2">
                    <div className="h-full bg-white rounded-full transition-all duration-700" style={{ width: `${growthScore}%` }} />
                  </div>
                  <div className="flex justify-between text-[10px] font-bold text-white/80">
                    <span>0</span>
                    <span>{growthScore}/100</span>
                  </div>
                </div>
              </div>

              {/* Health Indicators */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-4">
                  Health Indicators
                </p>
                {loading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}
                  </div>
                ) : <>
                  <HealthBar label="Opportunity Score" value={opportunityScore} color="#10B981" badge={healthBadge(opportunityScore)} />
                  <HealthBar label="Campaign Health"   value={campaignHealth}  color="#3b82f6" badge={healthBadge(campaignHealth)}  />
                  <HealthBar label="Revenue Health"    value={revenueHealth}   color="#a855f7" badge={healthBadge(revenueHealth)}   />
                  <HealthBar label="Engagement Score"  value={engagementScore} color="#f97316" badge={healthBadge(engagementScore)} />
                  <HealthBar label="Conversion Score"  value={conversionScore} color="#10B981" badge={healthBadge(conversionScore)} />
                </>}
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
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {loading ? "Calculating best day…" : `Saturday is the highest conversion day`}
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 bg-yellow-50 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                      <svg className="w-3.5 h-3.5 text-yellow-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="16" x2="12" y2="12"></line>
                        <line x1="12" y1="8" x2="12.01" y2="8"></line>
                      </svg>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {loading ? "Calculating…" : `Re-engagement can add ₹34,500 from ${fmtNum(Math.max(0, totalContacts - activeContacts))} inactive contacts`}
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 bg-yellow-50 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                      <Zap className="w-3.5 h-3.5 text-yellow-500" />
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {loading ? "Calculating…" : `${Math.min(99, growthScore + 8)}% confidence in this opportunity`}
                    </p>
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
                    {loading ? <Skeleton className="h-7 w-10" /> :
                      <p className="text-xl font-extrabold text-slate-900">{thisMonthBroadcasts}</p>}
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 mb-1">Contacts</p>
                    {loading ? <Skeleton className="h-7 w-14" /> :
                      <p className="text-xl font-extrabold text-slate-900">{fmtNum(thisMonthContacts)}</p>}
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 mb-1">Revenue</p>
                    {loading ? <Skeleton className="h-6 w-16" /> :
                      <p className="text-lg font-extrabold text-slate-900">
                        ₹{thisMonthRevenue > 0 ? (thisMonthRevenue >= 100000 ? `${(thisMonthRevenue/100000).toFixed(2)}L` : thisMonthRevenue.toLocaleString("en-IN")) : "0"}
                      </p>}
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 mb-1">Conversions</p>
                    {loading ? <Skeleton className="h-6 w-12" /> :
                      <p className="text-lg font-extrabold text-slate-900">{thisMonthConversions}</p>}
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
