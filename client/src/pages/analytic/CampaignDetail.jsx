import React, { useState, useContext, Fragment } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { userContext } from "../../context/Context";
import CampaignApi from "../../services/CampaignApi";
import {
  ArrowLeft,
  RefreshCw,
  Copy,
  Trash2,
  ChevronRight,
  Download,
  Filter,
  Eye,
  Send,
  ChevronDown,
  BarChart2,
  ChevronLeft,
  Users,
  LayoutGrid,
  X,
  ExternalLink,
  Edit3
} from "lucide-react";
import ReactApexChart from "react-apexcharts";

const fmt = (dateStr) => {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const fmtDateTwoLines = (dateStr) => {
  if (!dateStr) return { date: "—", time: "" };
  const d = new Date(dateStr);
  const date = d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const time = d.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  return { date, time };
};

// ─── Row status pill ──────────────────────────────────────────────────────────
const statusColors = {
  Failed:           { bg: "bg-red-50",    text: "text-red-500",    border: "border-red-100" },
  Read:             { bg: "bg-teal-50",   text: "text-teal-600",   border: "border-teal-100" },
  Delivered:        { bg: "bg-blue-50",   text: "text-blue-600",   border: "border-blue-100" },
  Sent:             { bg: "bg-slate-50",  text: "text-slate-500",  border: "border-slate-200" },
  "Text reply":     { bg: "bg-purple-50", text: "text-purple-600", border: "border-purple-100" },
  "Button clicked": { bg: "bg-indigo-50", text: "text-indigo-600", border: "border-indigo-100" },
};

const StatusPill = ({ status }) => {
  const c = statusColors[status] || statusColors.Sent;
  return (
    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${c.bg} ${c.text} ${c.border}`}>
      {status}
    </span>
  );
};

// ─── Info card (top 4 cards) ──────────────────────────────────────────────────
const InfoCard = ({ label, value }) => (
  <div className="flex-1 min-w-[150px] rounded-2xl border border-gray-200 bg-white px-5 py-4 shadow-sm">
    <p className="text-xs font-medium text-slate-400 mb-1.5">{label}</p>
    <p className="text-sm font-bold text-slate-800 truncate" title={value}>{value || "—"}</p>
  </div>
);

// ─── Stat box ─────────────────────────────────────────────────────────────────
const StatBox = ({ label, value, subtext = "0 min", isActive, onClick }) => (
  <div 
    onClick={onClick}
    className={`flex-1 min-w-[100px] flex flex-col items-center justify-center cursor-pointer rounded-xl transition-all p-3 mx-1 ${
      isActive ? 'bg-slate-50 ring-1 ring-slate-200 shadow-sm' : 'hover:bg-slate-50/60'
    }`}
  >
    <p className="text-2xl font-black text-slate-900">{value ?? 0}</p>
    <p className="text-xs font-medium text-slate-500 mt-1 text-center leading-tight">{label}</p>
    {subtext && <p className="text-[10px] text-slate-400 mt-0.5 font-normal">{subtext}</p>}
  </div>
);

// ─── Main component ───────────────────────────────────────────────────────────
const CampaignDetail = ({ campaign, onBack, onDelete }) => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [showDropdown, setShowDropdown] = useState(null);
  const [filterStatus, setFilterStatus] = useState("Overview");
  const [showChart, setShowChart] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const { user } = useContext(userContext);
  const [isResending, setIsResending] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showResendModal, setShowResendModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [previewContact, setPreviewContact] = useState(null);
  const [showFailedInfoModal, setShowFailedInfoModal] = useState(false);

  if (!campaign) return null;

  const stats = campaign.stats || {};
  const contacts = Array.isArray(campaign.targetAudience) ? campaign.targetAudience : [];
  const targetCount =
    (contacts.length > 0 ? contacts.length : null) ??
    (campaign.count && !isNaN(Number(campaign.count)) && Number(campaign.count) > 0 ? Number(campaign.count) : null) ??
    (stats.totalTargeted > 0 ? stats.totalTargeted : null) ??
    (stats.total > 0 ? stats.total : null) ??
    0;

  const total = targetCount || (stats.sent || 0) + (stats.failed || 0);

  const contactStatus = (idx) => {
    let offset = 0;
    if (idx < (offset += (stats.failed || 0))) return "Failed";
    if (idx < (offset += (stats.replied || 0))) return "Text reply";
    if (idx < (offset += (stats.read || 0))) return "Read";
    if (idx < (offset += (stats.delivered || 0))) return "Delivered";
    return stats.sent > 0 ? "Sent" : "Scheduled";
  };

  const contactsWithStatus = (contacts.length > 0 ? contacts : [
    {
      _id: "contact-1",
      name: "Nayan",
      phone: "+91 98765 43210",
      whatsapp: "+91 98765 43210",
      textReply: stats.replied > 0 ? "Test\nNayan" : "",
      status: stats.failed > 0 ? "Failed" : (stats.read > 0 ? "Read" : (stats.delivered > 0 ? "Delivered" : (stats.sent > 0 ? "Sent" : "Scheduled"))),
      sentDate: campaign.rawCreatedAt,
      deliveredDate: campaign.rawCreatedAt
    },
    {
      _id: "contact-2",
      name: "Aditi Sharma",
      phone: "+91 98765 43211",
      whatsapp: "+91 98765 43211",
      textReply: "",
      status: stats.read > 1 ? "Read" : (stats.delivered > 1 ? "Delivered" : (stats.sent > 1 ? "Sent" : "Scheduled")),
      sentDate: campaign.rawCreatedAt,
      deliveredDate: campaign.rawCreatedAt
    }
  ]).slice(0, Math.max(total, 2)).map((c, idx) => ({
    ...c,
    _globalIdx: idx,
    computedStatus: c.status || contactStatus(idx),
    textReply: c.textReply || ""
  }));

  // Derive counts
  const countFailed  = stats.failed || 0;
  const countDel     = stats.delivered || 0;
  const countRead    = stats.read || 0;
  const countReply   = stats.replied || 0;
  const countBtn     = contactsWithStatus.filter(c => c.computedStatus === "Button clicked").length;
  const countSent    = stats.sent || (countDel + countRead + countFailed > 0 ? countDel + countRead : 0);

  const filteredContacts = (filterStatus === "Overview" 
    ? contactsWithStatus 
    : contactsWithStatus.filter(c => {
        if (filterStatus === "Send") return c.computedStatus === "Sent";
        if (filterStatus === "Delivered") return c.computedStatus === "Delivered";
        if (filterStatus === "Read") return c.computedStatus === "Read";
        if (filterStatus === "Text reply") return c.computedStatus === "Text reply";
        if (filterStatus === "Button clicked") return c.computedStatus === "Button clicked";
        if (filterStatus === "Failed") return c.computedStatus === "Failed";
        return true;
      })
  ).filter(c => 
    !searchTerm || 
    (c.name && c.name.toLowerCase().includes(searchTerm.toLowerCase())) || 
    (c.phone && c.phone.includes(searchTerm)) || 
    (c.whatsapp && c.whatsapp.includes(searchTerm))
  );

  const totalPages = Math.max(1, Math.ceil(filteredContacts.length / itemsPerPage));
  const visible = filteredContacts.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const handleDownloadCSV = () => {
    if (!filteredContacts.length) return toast.info("No contacts to download.");
    const headers = ["WhatsApp,Text Reply,Send Date,Delivered Date,Status\n"];
    const rows = filteredContacts.map(c => {
      const p = c.phone || c.whatsapp || "";
      const reply = (c.textReply || "").replace(/\n/g, " ");
      return `${p},${reply},${fmt(campaign.rawCreatedAt)},${fmt(campaign.rawCreatedAt)},${c.computedStatus}`;
    });
    const csvContent = "data:text/csv;charset=utf-8," + headers.concat(rows).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${campaign.title}_report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Report downloaded!");
  };

  const handleDuplicate = async () => {
    setIsDuplicating(true);
    try {
      const audienceIds = (campaign.targetAudience || []).map(c => c._id || c);
      const res = await CampaignApi.createCampaign({
        name: `${campaign.title} (Copy)`,
        messageTemplate: campaign.templateName || campaign.message,
        templateLanguage: campaign.templateLanguage || 'en_US',
        headerMediaUrl: campaign.headerMediaUrl,
        headerType: campaign.headerType,
        targetAudience: audienceIds,
        audienceFilter: campaign.audienceFilter || {},
        status: 'draft',
      });
      if (res.success) {
        toast.success(`"${campaign.title}" duplicated with audience!`);
        if (typeof window !== "undefined" && window.onCampaignRefresh) {
          window.onCampaignRefresh();
        }
      } else {
        toast.error(res.message || 'Failed to duplicate campaign');
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to duplicate campaign');
    } finally {
      setIsDuplicating(false);
    }
  };

  const handleResendCampaign = async () => {
    const estimatedCost = total * 0.80;
    if (user?.credits < estimatedCost) {
      toast.error(`Insufficient credits! You need ₹${estimatedCost.toFixed(2)} to resend this campaign.`);
      return;
    }
    
    try {
      setIsResending(true);
      const campaignData = {
        name: `${campaign.title} (Resend)`,
        messageTemplate: campaign.templateName,
        templateLanguage: campaign.templateLanguage || 'en_US',
        status: 'active',
        scheduledDate: null,
        audienceFilter: campaign.audienceFilter || { tags: [] },
        headerMediaUrl: campaign.headerMediaUrl,
        headerType: campaign.headerType
      };

      const res = await CampaignApi.createCampaign(campaignData);
      if (res.success) {
        toast.success("Campaign resend initiated successfully!");
        if (typeof window !== "undefined" && window.onCampaignRefresh) {
          window.onCampaignRefresh();
        }
      } else {
        toast.error(res.message || "Failed to resend campaign.");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Error resending campaign.");
    } finally {
      setIsResending(false);
    }
  };

  const handleFilter = (status) => {
    setFilterStatus(status);
    setPage(1);
  };

  const statusBadgeClass = {
    Scheduled:  "bg-emerald-50 text-emerald-600 border-emerald-200",
    Completed:  "bg-emerald-50 text-emerald-600 border-emerald-200",
    Processing: "bg-blue-50 text-blue-600 border-blue-200",
    Paused:     "bg-orange-50 text-orange-600 border-orange-200",
    Draft:      "bg-slate-50 text-slate-500 border-slate-200",
  }[campaign.status] || "bg-emerald-50 text-emerald-600 border-emerald-200";

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      if (typeof window !== "undefined" && window.onCampaignRefresh) {
        await window.onCampaignRefresh(campaign.id);
      }
      toast.success("Campaign synced successfully!");
    } catch (err) {
      console.error(err);
      toast.error(`Failed to sync campaign: ${err?.response?.data?.message || err.message || 'Unknown error'}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await CampaignApi.deleteCampaign(campaign.id);
      toast.success("Campaign deleted successfully!");
      if (typeof onDelete === "function") {
        onDelete(campaign.id);
      } else {
        onBack();
      }
    } catch (err) {
      toast.error("Failed to delete campaign");
    } finally {
      setIsDeleting(false);
    }
  };

  // Determine section title for the contacts table
  const tableSectionTitle = filterStatus === "Failed" 
    ? "List of failed contacts" 
    : (filterStatus === "Overview" ? "List of contacts" : `List of ${filterStatus.toLowerCase()} contacts`);

  return (
    <div className="flex flex-col h-full bg-[#f8fafc] font-['Urbanist'] overflow-hidden">

      {/* ── Top Bar ────────────────────────────────────────────────────────── */}
      <div className="shrink-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between shadow-sm z-10">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
            title="Back to campaigns"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-lg font-bold text-slate-900">
                Campaign: {campaign.title}
              </h2>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusBadgeClass}`}>
                Status: {campaign.status}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium mt-0.5">{fmt(campaign.rawCreatedAt)}</p>
          </div>
        </div>

        {String(campaign.status).toLowerCase() === 'draft' && (
          <button
            onClick={() => navigate('/admin/campaign/create', { state: { draftId: campaign.id || campaign._id, step: 2 } })}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold hover:bg-emerald-100 transition-colors shadow-sm"
          >
            <Edit3 className="w-3.5 h-3.5" /> Resume Draft
          </button>
        )}
      </div>

      {/* ── Scrollable Body ──────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">

        {/* Action Buttons */}
        <div className="flex items-center gap-3 flex-wrap">
          <button 
            onClick={handleSync}
            disabled={isSyncing}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-emerald-500' : 'text-slate-500'}`} /> 
            {isSyncing ? 'Syncing...' : 'Sync'}
          </button>
          <button 
            onClick={handleDuplicate}
            disabled={isDuplicating}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50"
          >
            <Copy className={`w-4 h-4 ${isDuplicating ? 'animate-spin text-blue-500' : 'text-slate-500'}`} /> 
            {isDuplicating ? 'Duplicating...' : 'Duplicate'}
          </button>
          <button 
            onClick={() => setShowDeleteModal(true)}
            disabled={isDeleting}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white text-slate-700 text-sm font-medium hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-colors shadow-sm disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4 text-slate-500 hover:text-red-500" /> 
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>

        {/* Template Breadcrumb Tag */}
        <p className="text-xs text-slate-400 font-medium px-1 tracking-wide">
          {campaign.templateName ? `${campaign.templateName} ID2 / 2P1.10` : "whatsapp_summer_promo_for_new_students ID2 / 2P1.10"}
        </p>

        {/* Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <InfoCard label="Created On" value={fmt(campaign.rawCreatedAt) || "Feb xxxxx xxxx"} />
          <InfoCard label="Message template" value={campaign.templateName || "Feb xxxxx xxxx"} />
          <InfoCard label="Target connect" value={String(total)} />
          <InfoCard label="Estimate cost" value={total > 0 ? `₹${(total * 0.80).toFixed(2)}` : "—"} />
        </div>

        {/* Overall Campaign Performance */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-6 py-5">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold text-slate-800">Overall Campaign performance</h3>
            <button 
              onClick={() => setShowChart(!showChart)}
              className="flex items-center gap-1.5 text-xs font-semibold text-blue-500 hover:text-blue-600 transition-colors"
            >
              {showChart ? (
                <><LayoutGrid className="w-3.5 h-3.5" /> Numbers view</>
              ) : (
                <><BarChart2 className="w-3.5 h-3.5" /> Chart view</>
              )}
            </button>
          </div>
          
          {showChart ? (
            <div className="w-full h-[250px]">
              <ReactApexChart 
                options={{
                  chart: { type: 'bar', toolbar: { show: false }, parentHeightOffset: 0 },
                  plotOptions: {
                    bar: { borderRadius: 4, horizontal: false, columnWidth: '40%' }
                  },
                  dataLabels: { enabled: false },
                  xaxis: {
                    categories: ['Send', 'Delivered', 'Read', 'Text reply', 'Button clicked', 'Failed'],
                    labels: { style: { colors: '#64748b', fontSize: '12px', fontFamily: 'Urbanist' } },
                    axisBorder: { show: false },
                    axisTicks: { show: false }
                  },
                  yaxis: {
                    labels: { style: { colors: '#64748b', fontSize: '12px', fontFamily: 'Urbanist' } }
                  },
                  grid: { borderColor: '#f1f5f9', strokeDashArray: 4 },
                  colors: ['#10b981'],
                  tooltip: { theme: 'light', style: { fontFamily: 'Urbanist' } }
                }} 
                series={[{
                  name: 'Contacts',
                  data: [countSent, countDel, countRead, countReply, countBtn, countFailed]
                }]} 
                type="bar" 
                height="100%" 
              />
            </div>
          ) : (
            <div className="flex flex-wrap justify-between gap-y-4">
              <StatBox label="Overview"       value={total}       subtext="0 min" isActive={filterStatus === "Overview"}       onClick={() => handleFilter("Overview")} />
              <StatBox label="Send"           value={countSent}   subtext="0 min" isActive={filterStatus === "Send"}           onClick={() => handleFilter("Send")} />
              <StatBox label="Delivered"      value={countDel}    subtext="0 min" isActive={filterStatus === "Delivered"}      onClick={() => handleFilter("Delivered")} />
              <StatBox label="Read"           value={countRead}   subtext="0 min" isActive={filterStatus === "Read"}           onClick={() => handleFilter("Read")} />
              <StatBox label="Text reply"     value={countReply}  subtext="0 min" isActive={filterStatus === "Text reply"}     onClick={() => handleFilter("Text reply")} />
              <StatBox label="Button clicked" value={countBtn}    subtext="0 min" isActive={filterStatus === "Button clicked"} onClick={() => handleFilter("Button clicked")} />
              <StatBox label="Failed"         value={countFailed} subtext="0 min" isActive={filterStatus === "Failed"}         onClick={() => handleFilter("Failed")} />
            </div>
          )}
        </div>

        {/* ── Failed Message Report Card ── */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-sm font-bold text-slate-800">Failed Message Report</h3>
          </div>
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/60 border-b border-gray-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="px-6 py-3 w-[15%]">Error Code</th>
                  <th className="px-6 py-3 w-[45%]">Reason</th>
                  <th className="px-6 py-3 w-[40%]">Recipient</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                <tr className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-semibold text-slate-800 align-top">
                    {campaign.failedReport?.errorCode || "UTM-94"}
                  </td>
                  <td className="px-6 py-4 text-slate-600 align-top leading-relaxed">
                    {campaign.failedReport?.reason || "This message was not delivered to maintain healthy ecosystem engagement"}
                  </td>
                  <td className="px-6 py-4 text-slate-500 align-top leading-relaxed">
                    <button 
                      onClick={() => setShowFailedInfoModal(true)}
                      className="text-blue-600 font-semibold hover:underline mr-1 inline-flex items-center"
                    >
                      See All
                    </button>
                    <span>67 hours before resending. See Fair User Marketing Template Message P1.10 </span>
                    <button 
                      onClick={() => setShowFailedInfoModal(true)}
                      className="text-blue-600 font-semibold hover:underline inline-flex items-center ml-1"
                    >
                      Learn more
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* ── List of failed contacts / List of contacts ── */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

          {/* Toolbar */}
          <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-800">
                {tableSectionTitle}
              </h3>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button 
                onClick={() => setShowResendModal(true)} 
                disabled={isResending}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isResending ? 'animate-spin text-emerald-500' : 'text-slate-500'}`} /> 
                {isResending ? 'Resending...' : 'Resend Campaign'}
              </button>
              <button 
                onClick={handleDownloadCSV} 
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" /> Download Report
              </button>
              
              {/* Show dropdown */}
              <div className="relative">
                <button 
                  onClick={() => setShowDropdown(showDropdown === 'show' ? null : 'show')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
                >
                  Show <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>
                {showDropdown === 'show' && (
                  <div className="absolute top-full mt-1 right-0 bg-white border border-gray-100 shadow-lg rounded-xl p-1 z-20 min-w-[100px]">
                    {[10, 25, 50, 100].map(val => (
                      <button
                        key={val}
                        onClick={() => { setItemsPerPage(val); setPage(1); setShowDropdown(null); }}
                        className={`w-full text-left px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${itemsPerPage === val ? 'bg-emerald-50 text-emerald-600' : 'text-slate-600 hover:bg-slate-50'}`}
                      >
                        {val} rows
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Filters button */}
              <div className="relative">
                <button 
                  onClick={() => setShowDropdown(showDropdown === 'filter' ? null : 'filter')} 
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
                >
                  <Filter className="w-3 h-3 text-slate-400" /> Filters
                </button>
                {showDropdown === 'filter' && (
                  <div className="absolute top-full mt-1 right-0 bg-white border border-gray-100 shadow-xl rounded-xl p-3 z-20 w-64" onClick={e => e.stopPropagation()}>
                    <p className="text-xs font-bold text-slate-600 mb-2">Filter by phone or name</p>
                    <input 
                      type="text" 
                      placeholder="Search phone or text..." 
                      value={searchTerm}
                      onChange={e => { setSearchTerm(e.target.value); setPage(1); }}
                      className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-emerald-500" 
                    />
                  </div>
                )}
              </div>

              {/* Page indicator & pagination button */}
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white shadow-sm">
                <span>Page {page}</span>
                <button 
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))} 
                  disabled={page >= totalPages}
                  className="p-0.5 rounded hover:bg-slate-100 disabled:opacity-30 transition-colors"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left min-w-[700px]">
              <thead>
                <tr className="bg-gray-50/60 border-b border-gray-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="px-6 py-3 w-[22%]">WhatsApp</th>
                  <th className="px-6 py-3 w-[20%]">Text reply</th>
                  <th className="px-6 py-3 w-[18%]">Send date</th>
                  <th className="px-6 py-3 w-[18%]">Delivered date</th>
                  <th className="px-6 py-3 w-[10%]">Status</th>
                  <th className="px-6 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs font-medium">
                {filteredContacts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center text-sm text-slate-400 font-medium">
                      No contacts found for this filter.
                    </td>
                  </tr>
                ) : (
                  visible.map((contact, idx) => {
                    const globalIdx = contact._globalIdx;
                    const status = contact.computedStatus;
                    const phone = contact.phone || contact.whatsapp || "+91##########";
                    const sendDates = fmtDateTwoLines(contact.sentDate || campaign.rawCreatedAt);
                    const delivDates = fmtDateTwoLines(contact.deliveredDate || campaign.rawCreatedAt);
                    const textReply = contact.textReply || "—";

                    return (
                      <tr key={contact._id || idx} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-6 py-4 align-middle font-medium text-slate-700">
                          {phone}
                        </td>
                        <td className="px-6 py-4 align-middle text-slate-600 whitespace-pre-line">
                          {textReply}
                        </td>
                        <td className="px-6 py-4 align-middle text-slate-600 leading-tight">
                          <p className="font-semibold">{sendDates.date}</p>
                          <p className="text-[11px] text-slate-400">{sendDates.time}</p>
                        </td>
                        <td className="px-6 py-4 align-middle text-slate-600 leading-tight">
                          <p className="font-semibold">{delivDates.date}</p>
                          <p className="text-[11px] text-slate-400">{delivDates.time}</p>
                        </td>
                        <td className="px-6 py-4 align-middle">
                          <StatusPill status={status} />
                        </td>
                        <td className="px-6 py-4 align-middle text-right">
                          <div className="flex items-center justify-end gap-2">
                            {/* Preview dropdown */}
                            <div className="relative">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setShowDropdown(showDropdown === `p-${globalIdx}` ? null : `p-${globalIdx}`);
                                }}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-emerald-300 text-emerald-600 bg-white hover:bg-emerald-50 text-xs font-semibold transition-colors"
                              >
                                Preview <ChevronDown className="w-3 h-3 ml-0.5" />
                              </button>
                              {showDropdown === `p-${globalIdx}` && (
                                <div className="absolute top-full right-0 mt-1 z-30 bg-white border border-gray-100 rounded-xl shadow-xl py-1 min-w-[120px] text-left">
                                  <button 
                                    onClick={() => {
                                      setShowDropdown(null);
                                      setPreviewContact({ ...contact, mode: 'message' });
                                    }}
                                    className="w-full px-3 py-2 text-xs font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-700"
                                  >
                                    View Message
                                  </button>
                                  <button 
                                    onClick={() => {
                                      setShowDropdown(null);
                                      setPreviewContact({ ...contact, mode: 'full' });
                                    }}
                                    className="w-full px-3 py-2 text-xs font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-700"
                                  >
                                    Full Preview
                                  </button>
                                </div>
                              )}
                            </div>

                            {/* Send dropdown */}
                            <div className="relative">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setShowDropdown(showDropdown === `s-${globalIdx}` ? null : `s-${globalIdx}`);
                                }}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-emerald-300 text-emerald-600 bg-white hover:bg-emerald-50 text-xs font-semibold transition-colors"
                              >
                                Send <ChevronDown className="w-3 h-3 ml-0.5" />
                              </button>
                              {showDropdown === `s-${globalIdx}` && (
                                <div className="absolute top-full right-0 mt-1 z-30 bg-white border border-gray-100 rounded-xl shadow-xl py-1 min-w-[120px] text-left">
                                  <button 
                                    onClick={() => {
                                      setShowDropdown(null);
                                      toast.success(`Message queued for ${phone}!`);
                                    }}
                                    className="w-full px-3 py-2 text-xs font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-700"
                                  >
                                    Send Now
                                  </button>
                                  <button 
                                    onClick={() => {
                                      setShowDropdown(null);
                                      toast.info(`Schedule dialog for ${phone}`);
                                    }}
                                    className="w-full px-3 py-2 text-xs font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-700"
                                  >
                                    Schedule
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Footer pagination */}
          {filteredContacts.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-gray-100 bg-white mt-auto">
              <div className="text-xs text-slate-500 font-medium mb-3 sm:mb-0">
                Showing {filteredContacts.length === 0 ? '0-0 of 0' : `${(page - 1) * itemsPerPage + 1}–${Math.min(page * itemsPerPage, filteredContacts.length)} of ${filteredContacts.length}`} contacts
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-1.5 rounded-lg border border-gray-200 text-slate-400 hover:text-slate-600 hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-1 px-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(p => p === 1 || p === totalPages || Math.abs(page - p) <= 1)
                    .map((p, i, arr) => (
                      <Fragment key={p}>
                        {i > 0 && arr[i - 1] !== p - 1 && (
                          <span className="px-1 text-slate-400 text-xs">...</span>
                        )}
                        <button
                          onClick={() => setPage(p)}
                          className={`min-w-[28px] h-7 flex items-center justify-center rounded-lg text-xs font-bold transition-colors ${
                            page === p
                              ? 'bg-emerald-500 text-white shadow-sm'
                              : 'text-slate-600 hover:bg-gray-50'
                          }`}
                        >
                          {p}
                        </button>
                      </Fragment>
                    ))}
                </div>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="p-1.5 rounded-lg border border-gray-200 text-slate-400 hover:text-slate-600 hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Click-outside backdrop to close any open dropdown */}
      {showDropdown && (
        <div className="fixed inset-0 z-20" onClick={() => setShowDropdown(null)} />
      )}

      {/* ── Resend Confirm Modal ── */}
      {showResendModal && (
        <ResendConfirmModal
          campaign={campaign}
          onConfirm={() => {
            setShowResendModal(false);
            handleResendCampaign();
          }}
          onClose={() => setShowResendModal(false)}
          cost={total * 0.80}
        />
      )}

      {/* ── Delete Confirm Modal ── */}
      {showDeleteModal && (
        <DeleteConfirmModal
          campaign={campaign}
          onConfirm={() => {
            setShowDeleteModal(false);
            handleDelete();
          }}
          onClose={() => setShowDeleteModal(false)}
        />
      )}

      {/* ── Contact Message Preview Modal ── */}
      {previewContact && (
        <MessagePreviewModal
          contact={previewContact}
          campaign={campaign}
          onClose={() => setPreviewContact(null)}
        />
      )}

      {/* ── Failed Reason Info Modal ── */}
      {showFailedInfoModal && (
        <FailedInfoModal onClose={() => setShowFailedInfoModal(false)} />
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   Message Preview Modal
═══════════════════════════════════════════════════════════════ */
const MessagePreviewModal = ({ contact, campaign, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
    <div
      className="relative bg-white rounded-2xl border border-gray-200 shadow-2xl w-full max-w-md font-['Urbanist'] p-6 flex flex-col gap-4 z-10"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
        <div>
          <h3 className="text-base font-bold text-slate-800">Message Preview</h3>
          <p className="text-xs text-slate-400 mt-0.5">{contact.phone || contact.whatsapp} ({contact.name || "Recipient"})</p>
        </div>
        <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-100">
        <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-2">Template: {campaign.templateName || "whatsapp_template"}</p>
        <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">
          {campaign.message || "Hello! We are excited to announce our upcoming admissions and updates. Contact our support team for any queries."}
        </p>
      </div>

      <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-gray-100">
        <span>Status: <strong className="text-slate-700">{contact.computedStatus}</strong></span>
        <span>Sent: <strong className="text-slate-700">{fmt(campaign.rawCreatedAt)}</strong></span>
      </div>

      <button
        onClick={onClose}
        className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs rounded-xl transition-colors mt-2"
      >
        Close Preview
      </button>
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════════════════
   Failed Policy / Learn More Modal
═══════════════════════════════════════════════════════════════ */
const FailedInfoModal = ({ onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
    <div
      className="relative bg-white rounded-2xl border border-gray-200 shadow-2xl w-full max-w-md font-['Urbanist'] p-6 flex flex-col gap-4 z-10"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
        <h3 className="text-base font-bold text-slate-800">WhatsApp Ecosystem Policy (UTM-94)</h3>
        <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400">
          <X className="w-5 h-5" />
        </button>
      </div>

      <p className="text-xs text-slate-600 leading-relaxed">
        WhatsApp limits marketing messages per recipient within rolling engagement windows to maintain user engagement and protect sender phone number reputation.
      </p>

      <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800 space-y-1">
        <p className="font-bold">Cool-down Period:</p>
        <p>Please wait 67 hours before resending marketing template messages to these recipients.</p>
      </div>

      <button
        onClick={onClose}
        className="w-full py-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs rounded-xl transition-colors mt-2"
      >
        Understood
      </button>
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════════════════
   Resend Confirmation Modal
═══════════════════════════════════════════════════════════════ */
const ResendConfirmModal = ({ campaign, onConfirm, onClose, cost }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
    <div
      className="relative bg-white rounded-2xl border border-gray-200 shadow-2xl w-full max-w-sm font-['Urbanist'] p-6 flex flex-col items-center text-center gap-4 z-10"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="w-14 h-14 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-center">
        <RefreshCw className="w-7 h-7 text-emerald-500" />
      </div>
      <div>
        <h2 className="text-base font-bold text-slate-800">Resend Campaign?</h2>
        <p className="text-sm text-slate-500 font-medium mt-1 leading-relaxed">
          You are about to resend <span className="font-semibold text-slate-700">"{campaign.title}"</span>.
          This will cost approximately <span className="font-semibold text-slate-700">₹{cost.toFixed(2)}</span>.
        </p>
      </div>
      <div className="flex gap-3 w-full mt-1">
        <button
          onClick={onClose}
          className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-slate-600 font-semibold text-sm hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="flex-1 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-sm transition-colors"
        >
          Resend
        </button>
      </div>
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════════════════
   Delete Confirmation Modal
═══════════════════════════════════════════════════════════════ */
const DeleteConfirmModal = ({ campaign, onConfirm, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
    <div
      className="relative bg-white rounded-2xl border border-gray-200 shadow-2xl w-full max-w-sm font-['Urbanist'] p-6 flex flex-col items-center text-center gap-4 z-10"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="w-14 h-14 bg-red-50 border border-red-100 rounded-2xl flex items-center justify-center">
        <Trash2 className="w-7 h-7 text-red-500" />
      </div>
      <div>
        <h2 className="text-base font-bold text-slate-800">Delete Campaign?</h2>
        <p className="text-sm text-slate-500 font-medium mt-1 leading-relaxed">
          <span className="font-semibold text-slate-700">"{campaign.title}"</span> will be permanently removed. This action cannot be undone.
        </p>
      </div>
      <div className="flex gap-3 w-full mt-1">
        <button
          onClick={onClose}
          className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-slate-600 font-semibold text-sm hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold text-sm transition-colors"
        >
          Delete
        </button>
      </div>
    </div>
  </div>
);

export default CampaignDetail;
