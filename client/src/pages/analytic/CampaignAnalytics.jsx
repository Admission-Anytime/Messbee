import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  ChevronDown,
  Megaphone,
  Trash2,
  Copy,
  BarChart2,
  Check,
} from "lucide-react";
import CampaignApi from "../../services/CampaignApi";
import CampaignDetail from "./CampaignDetail";

// ─── helpers (mirrored from campaign.jsx) ────────────────────────────────────
const mapStatus = (s) => {
  switch (s) {
    case "completed":  return "Completed";
    case "active":     return "Processing";
    case "paused":     return "Paused";
    case "scheduled":  return "Scheduled";
    default:           return "Draft";
  }
};

const mapProgress = (camp) => {
  if (camp.status === "completed") return 100;
  if (camp.stats?.sent > 0)
    return Math.round((camp.stats.delivered / camp.stats.sent) * 100);
  return 0;
};

const formatDate = (d) =>
  d
    ? new Date(d).toLocaleString("en-IN", {
        day: "2-digit", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit", hour12: true,
      })
    : "—";

const mapCampaign = (c) => ({
  id:            c._id,
  title:         c.name,
  templateName:  String(c.messageTemplate || "—").trim(),
  status:        mapStatus(c.status),
  progress:      mapProgress(c),
  sentOn:        formatDate(c.createdAt),
  rawCreatedAt:  c.createdAt,
  createdBy:     c.user?.name || "User",
  initials:      (c.user?.name || c.name || "U").substring(0, 2).toUpperCase(),
  count:         String((c.targetAudience || []).length),
  stats:         {
    sent:      c.stats?.sent      || 0,
    delivered: c.stats?.delivered || 0,
    read:      c.stats?.read      || 0,
    replied:   c.stats?.replied   || 0,
    failed:    c.stats?.failed    || 0,
  },
  targetAudience: c.targetAudience || [],
});

// ─── StatusBadge (matches campaign.jsx exactly) ──────────────────────────────
const StatusBadge = ({ status, progress }) => {
  const isProcessing = status === "Processing";
  const isDraft      = status === "Draft";
  const isScheduled  = status === "Scheduled";
  const isPaused     = status === "Paused";

  const colorClass = isProcessing
    ? "text-blue-600 bg-blue-50 border-blue-100"
    : isDraft
      ? "text-slate-500 bg-slate-50 border-slate-100"
      : isScheduled
        ? "text-amber-600 bg-amber-50 border-amber-100"
        : isPaused
          ? "text-orange-600 bg-orange-50 border-orange-100"
          : "text-emerald-600 bg-emerald-50 border-emerald-100";

  const strokeColor = isProcessing ? "#3b82f6" : "#10b981";
  const r    = 11;
  const circ = 2 * Math.PI * r;
  const offset = circ - (progress / 100) * circ;

  return (
    <div className="flex items-center gap-2">
      <div className="relative inline-flex items-center justify-center">
        <svg className="w-7 h-7 -rotate-90" viewBox="0 0 28 28">
          <circle cx="14" cy="14" r={r} stroke="#f1f5f9" strokeWidth="2.5" fill="transparent" />
          <circle
            cx="14" cy="14" r={r}
            stroke={strokeColor}
            strokeWidth="2.5"
            fill="transparent"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        </svg>
        <span className="absolute text-[8px] font-bold text-slate-600">{progress}%</span>
      </div>
      <span className={`text-sm font-semibold px-2 py-0.5 rounded-md border ${colorClass}`}>
        {status}
      </span>
    </div>
  );
};

const ActionBtn = ({ icon, onClick, title, hoverColor }) => (
  <button
    onClick={onClick} title={title}
    className={`p-1.5 rounded-lg text-slate-400 transition-colors ${hoverColor || "hover:bg-slate-100 hover:text-slate-600"}`}
  >
    {icon}
  </button>
);

// ─── Main component ───────────────────────────────────────────────────────────
const CampaignAnalytics = () => {
  const navigate = useNavigate();
  const [campaigns,        setCampaigns]       = useState([]);
  const [loading,          setLoading]         = useState(true);
  const [search,           setSearch]          = useState("");
  const [filterStatus,     setFilterStatus]    = useState("All");
  const [filterTemplate,   setFilterTemplate]  = useState("All");
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [currentPage,      setCurrentPage]     = useState(1);
  const [itemsPerPage,     setItemsPerPage]    = useState(10);

  const fetchCampaigns = useCallback(async () => {
    try {
      setLoading(true);
      const res = await CampaignApi.getCampaigns();
      if (res.success) {
        setCampaigns(res.data.map(mapCampaign));
      }
    } catch (e) {
      console.error("Failed to fetch campaigns", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCampaigns(); }, [fetchCampaigns]);

  useEffect(() => {
    window.onCampaignRefresh = async (id) => {
      try {
        const res = await CampaignApi.getCampaignById(id);
        if (res.success && res.data) {
          setSelectedCampaign(mapCampaign(res.data));
          fetchCampaigns(); // refresh the main list as well
        }
      } catch (e) {
        console.error("Failed to refresh campaign", e);
        throw e;
      }
    };

    window.onCampaignDelete = () => {
      fetchCampaigns();
    };

    return () => {
      delete window.onCampaignRefresh;
      delete window.onCampaignDelete;
    };
  }, [fetchCampaigns]);

  if (selectedCampaign) {
    return (
      <CampaignDetail
        campaign={selectedCampaign}
        onBack={() => setSelectedCampaign(null)}
      />
    );
  }

  const templateOptions = [...new Set(campaigns.map(c => c.templateName))].filter(t => t !== "—");

  const filtered = campaigns.filter(c =>
    (filterStatus   === "All" || c.status       === filterStatus) &&
    (filterTemplate === "All" || c.templateName === filterTemplate) &&
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages     = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const safePage       = Math.min(currentPage, totalPages);
  const paginatedStart = (safePage - 1) * itemsPerPage;
  const paginated      = filtered.slice(paginatedStart, paginatedStart + itemsPerPage);

  const handleSearch   = (v) => { setSearch(v);         setCurrentPage(1); };
  const handleStatus   = (v) => { setFilterStatus(v);   setCurrentPage(1); };
  const handleTemplate = (v) => { setFilterTemplate(v); setCurrentPage(1); };

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-[1400px] mx-auto flex flex-col gap-6 font-['Urbanist']">

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-center">
          <BarChart2 className="w-5 h-5 text-emerald-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">Campaign Analytics</h1>
          <p className="text-xs text-slate-400 font-medium mt-0.5">Detailed performance metrics across communication channels</p>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span className="font-medium">Filter by</span>

            <div className="relative">
              <select value={filterStatus} onChange={e => handleStatus(e.target.value)}
                className="appearance-none flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-slate-600 hover:bg-gray-100 transition-colors font-medium outline-none cursor-pointer pr-8">
                <option value="All">Status: All</option>
                {["Completed","Processing","Scheduled","Paused","Draft"].map(o =>
                  <option key={o} value={o}>{o}</option>)}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <div className="relative">
              <select value={filterTemplate} onChange={e => handleTemplate(e.target.value)}
                className="appearance-none flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-slate-600 hover:bg-gray-100 transition-colors font-medium outline-none cursor-pointer pr-8 max-w-[180px]">
                <option value="All">Template: All</option>
                {templateOptions.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text" value={search} onChange={e => handleSearch(e.target.value)}
              placeholder="Search campaigns…"
              className="pl-9 pr-4 py-2 w-full border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400 text-sm text-slate-700 placeholder:text-slate-400 font-medium transition"
            />
          </div>
        </div>

        {/* Table */}
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left table-fixed">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60">
                <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-widest text-slate-400 w-12 whitespace-nowrap">#</th>
                <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-widest text-slate-400 w-[20%] whitespace-nowrap">Campaign Title</th>
                <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-widest text-slate-400 w-[18%] whitespace-nowrap">Template</th>
                <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-widest text-slate-400 w-[14%] whitespace-nowrap">Status</th>
                <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-widest text-slate-400 w-[16%] whitespace-nowrap">Sent On</th>
                <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-widest text-slate-400 w-[15%] whitespace-nowrap">Created By</th>
                <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-widest text-slate-400 w-[8%] whitespace-nowrap">Count</th>
                <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-widest text-slate-400 w-24 text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                      <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                      <p className="text-sm font-medium">Loading campaigns...</p>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                      <Megaphone className="w-8 h-8 opacity-40" />
                      <p className="text-sm font-medium">No campaigns found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginated.map((camp, index) => (
                  <tr
                    key={camp.id}
                    className="group hover:bg-slate-50/60 transition-colors cursor-pointer"
                    onClick={() => {
                      if (String(camp.status).toLowerCase() === 'draft') {
                        navigate('/admin/campaign/create', { state: { draftId: camp.id || camp._id, step: 2 } });
                      } else {
                        setSelectedCampaign(camp);
                      }
                    }}
                  >
                    <td className="px-5 py-4 text-sm font-semibold text-slate-300 align-middle">
                      {paginatedStart + index + 1}
                    </td>
                    <td className="px-5 py-4 align-middle">
                      <span className="text-sm font-semibold text-slate-800">{camp.title}</span>
                    </td>
                    <td className="px-5 py-4 align-middle max-w-0">
                      <span
                        className="inline-block max-w-[180px] rounded-lg border border-emerald-100 bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 truncate"
                        title={camp.templateName}
                      >
                        {camp.templateName}
                      </span>
                    </td>
                    <td className="px-5 py-4 align-middle">
                      <StatusBadge status={camp.status} progress={camp.progress} />
                    </td>
                    <td className="px-5 py-4 align-middle">
                      <span className="text-xs text-slate-500 font-medium">{camp.sentOn}</span>
                    </td>
                    <td className="px-5 py-4 align-middle">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center shrink-0">
                          <span className="text-[10px] font-bold text-white">{camp.initials}</span>
                        </div>
                        <span className="text-sm font-semibold text-slate-700">{camp.createdBy}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 align-middle">
                      <span className="text-sm font-semibold text-slate-600">{camp.count}</span>
                    </td>
                    <td className="px-5 py-4 align-middle">
                      <div className="flex justify-end items-center gap-1">
                        <ActionBtn
                          icon={<BarChart2 className="w-4 h-4" />}
                          title="Analytics" hoverColor="hover:text-emerald-500 hover:bg-emerald-50"
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            if (String(camp.status).toLowerCase() === 'draft') {
                              navigate('/admin/campaign/create', { state: { draftId: camp.id || camp._id, step: 2 } });
                            } else {
                              setSelectedCampaign(camp);
                            }
                          }}
                        />
                        <ActionBtn
                          icon={<Copy className="w-4 h-4" />}
                          hoverColor="hover:text-blue-500 hover:bg-blue-50"
                          title="Duplicate"
                          onClick={(e) => e.stopPropagation()}
                        />
                        <ActionBtn
                          icon={<Trash2 className="w-4 h-4" />}
                          hoverColor="hover:text-red-500 hover:bg-red-50"
                          title="Delete"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer pagination */}
        {filtered.length > 0 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50 flex-wrap gap-2 font-sans">
            <span className="text-sm text-gray-500">Total campaigns: <strong className="text-gray-900">{filtered.length}</strong></span>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-gray-500">Rows per page:</span>
              <select
                value={itemsPerPage}
                onChange={e => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                className="border border-gray-200 rounded-md text-sm text-gray-700 px-2 py-1 cursor-pointer outline-none focus:border-emerald-400"
              >
                {[10, 25, 50, 100].map(n => <option key={n}>{n}</option>)}
              </select>
              <span className="text-sm text-gray-500 min-w-[90px] text-center">{paginatedStart + 1}–{Math.min(paginatedStart + itemsPerPage, filtered.length)} of {filtered.length}</span>
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={safePage === 1}
                className="p-1.5 border border-gray-200 rounded-md text-gray-500 hover:border-emerald-400 hover:text-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
              </button>
              <div className="flex gap-1">
                {(() => {
                  const getPages = () => {
                    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
                    const pages = [1];
                    if (safePage > 3) pages.push("...");
                    for (let i = Math.max(2, safePage - 1); i <= Math.min(totalPages - 1, safePage + 1); i++) pages.push(i);
                    if (safePage < totalPages - 2) pages.push("...");
                    pages.push(totalPages);
                    return pages;
                  };
                  return getPages().map((p, i) =>
                    p === "..."
                      ? <span key={`d${i}`} className="px-2 py-1 text-sm text-gray-400">…</span>
                      : <button
                        key={p}
                        onClick={() => setCurrentPage(p)}
                        className={`min-w-[32px] px-2 py-1 border rounded-md text-sm font-medium transition-all ${p === safePage ? "bg-emerald-500 text-white border-emerald-500 font-bold" : "bg-white text-gray-500 border-gray-200 hover:border-emerald-400 hover:text-emerald-700"}`}
                      >
                        {p}
                      </button>
                  )
                })()}
              </div>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={safePage === totalPages || totalPages === 0}
                className="p-1.5 border border-gray-200 rounded-md text-gray-500 hover:border-emerald-400 hover:text-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CampaignAnalytics;

