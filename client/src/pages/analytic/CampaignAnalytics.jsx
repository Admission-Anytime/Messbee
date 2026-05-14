import { useState, useEffect, useCallback } from "react";
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

// ─── StatusBadge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ status, progress }) => {
  const isCompleted = status === "Completed" || progress === 100;
  return (
    <div className="flex items-center gap-2">
      <div className="relative w-8 h-8 flex items-center justify-center shrink-0">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
          <circle cx="18" cy="18" r="16" fill="none" className="stroke-gray-100" strokeWidth="3" />
          <circle
            cx="18" cy="18" r="16" fill="none"
            className={isCompleted ? "stroke-emerald-500" : "stroke-blue-500"}
            strokeWidth="3" strokeDasharray="100"
            strokeDashoffset={100 - (progress || 0)}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 0.5s ease" }}
          />
        </svg>
        <span className={`absolute text-[9px] font-black ${isCompleted ? "text-emerald-600" : "text-blue-600"}`}>
          {progress}%
        </span>
      </div>
      <span className={`px-2.5 py-1 rounded-lg text-[11px] font-black uppercase tracking-wider ${
        isCompleted
          ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
          : "bg-blue-50 text-blue-600 border border-blue-100"
      }`}>
        {status}
      </span>
    </div>
  );
};

const ActionBtn = ({ icon, onClick, title, hoverColor }) => (
  <button
    onClick={onClick} title={title}
    className={`p-2 rounded-xl text-slate-400 transition-all ${hoverColor || "hover:bg-slate-100 hover:text-slate-600"}`}
  >
    {icon}
  </button>
);

// ─── Main component ───────────────────────────────────────────────────────────
const CampaignAnalytics = () => {
  const [campaigns,       setCampaigns]       = useState([]);
  const [loading,         setLoading]         = useState(true);
  const [search,          setSearch]          = useState("");
  const [filterStatus,    setFilterStatus]    = useState("All");
  const [filterTemplate,  setFilterTemplate]  = useState("All");
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [currentPage,     setCurrentPage]     = useState(1);
  const ITEMS_PER_PAGE = 10;

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

  // ── If a campaign is selected, show detail view ───────────────────────────
  if (selectedCampaign) {
    return (
      <CampaignDetail
        campaign={selectedCampaign}
        onBack={() => setSelectedCampaign(null)}
      />
    );
  }

  // ── Derived data ──────────────────────────────────────────────────────────
  const templateOptions = [...new Set(campaigns.map(c => c.templateName))].filter(t => t !== "—");

  const filtered = campaigns.filter(c =>
    (filterStatus   === "All" || c.status       === filterStatus) &&
    (filterTemplate === "All" || c.templateName === filterTemplate) &&
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages     = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const safePage       = Math.min(currentPage, totalPages);
  const paginatedStart = (safePage - 1) * ITEMS_PER_PAGE;
  const paginated      = filtered.slice(paginatedStart, paginatedStart + ITEMS_PER_PAGE);

  const handleSearch   = (v) => { setSearch(v);          setCurrentPage(1); };
  const handleStatus   = (v) => { setFilterStatus(v);    setCurrentPage(1); };
  const handleTemplate = (v) => { setFilterTemplate(v);  setCurrentPage(1); };

  return (
    <div className="flex flex-col h-full bg-[#f8fafc] overflow-hidden font-['Urbanist']">
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6 lg:p-8 2xl:p-10">
        <div className="max-w-[1600px] mx-auto">

          {/* Header */}
          <div className="mb-6 md:mb-8">
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 mb-1">Campaign Analytics</h1>
            <p className="text-xs md:text-sm font-bold text-slate-400">
              Detailed performance metrics across communication channels
            </p>
          </div>

          {/* Table Card */}
          <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm overflow-hidden">

            {/* Toolbar */}
            <div className="px-6 py-5 border-b border-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-slate-400 text-sm font-bold opacity-60">Filter by</span>

                <div className="relative">
                  <select value={filterStatus} onChange={e => handleStatus(e.target.value)}
                    className="appearance-none px-3 py-1.5 bg-[#eff3f6] rounded-lg text-slate-900 font-bold text-xs outline-none cursor-pointer pr-8">
                    <option value="All">Status: All</option>
                    {["Completed","Processing","Scheduled","Paused","Draft"].map(o =>
                      <option key={o} value={o}>{o}</option>)}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>

                <div className="relative">
                  <select value={filterTemplate} onChange={e => handleTemplate(e.target.value)}
                    className="appearance-none px-3 py-1.5 bg-[#eff3f6] rounded-lg text-slate-900 font-bold text-xs outline-none cursor-pointer pr-8 max-w-[180px]">
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
                  placeholder="Search campaigns..."
                  className="pl-9 pr-4 py-2 w-full rounded-xl bg-[#eff3f6] focus:outline-none focus:ring-2 focus:ring-[#10B981]/50 text-xs text-slate-900 placeholder:text-slate-400 font-bold transition"
                />
              </div>
            </div>

            {/* Table */}
            <div className="w-full overflow-x-auto custom-scrollbar">
              <table className="w-full text-left table-fixed min-w-[1000px]">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/60">
                    <th className="px-5 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 w-12">#</th>
                    <th className="px-5 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 w-[22%]">Campaign Title</th>
                    <th className="px-5 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 w-[18%]">Template</th>
                    <th className="px-5 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 w-[15%]">Status</th>
                    <th className="px-5 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 w-[15%]">Sent On</th>
                    <th className="px-5 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 w-[16%]">Created By</th>
                    <th className="px-5 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 w-[8%]">Count</th>
                    <th className="px-5 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 w-[9%] text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="py-20 text-center">
                        <div className="flex flex-col items-center gap-2 text-slate-400">
                          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                          <p className="text-sm font-bold">Loading campaigns…</p>
                        </div>
                      </td>
                    </tr>
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-20 text-center">
                        <div className="flex flex-col items-center gap-2 text-slate-400">
                          <Megaphone className="w-10 h-10 opacity-20 mb-2" />
                          <p className="text-sm font-bold">No campaigns found</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginated.map((camp, index) => (
                      <tr
                        key={camp.id}
                        className="group hover:bg-slate-50/60 transition-colors cursor-pointer"
                        onClick={() => setSelectedCampaign(camp)}
                      >
                        <td className="px-5 py-5 text-xs font-black text-slate-300 align-middle">
                          {paginatedStart + index + 1}
                        </td>
                        <td className="px-5 py-5 align-middle">
                          <span className="text-xs font-black text-slate-800">{camp.title}</span>
                        </td>
                        <td className="px-5 py-5 align-middle max-w-0">
                          <span
                            className="inline-block w-full max-w-[180px] rounded-lg border border-emerald-100 bg-emerald-50 px-2.5 py-1.5 text-[10px] font-black text-emerald-700 truncate"
                            title={camp.templateName}
                          >
                            {camp.templateName}
                          </span>
                        </td>
                        <td className="px-5 py-5 align-middle">
                          <StatusBadge status={camp.status} progress={camp.progress} />
                        </td>
                        <td className="px-5 py-5 align-middle">
                          <span className="text-[10px] text-slate-500 font-bold">{camp.sentOn}</span>
                        </td>
                        <td className="px-5 py-5 align-middle">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-[#10B981] flex items-center justify-center shrink-0">
                              <span className="text-[9px] font-black text-white uppercase">{camp.initials}</span>
                            </div>
                            <span className="text-xs font-black text-slate-700">{camp.createdBy}</span>
                          </div>
                        </td>
                        <td className="px-5 py-5 align-middle">
                          <span className="text-xs font-black text-slate-600">{camp.count}</span>
                        </td>
                        <td className="px-5 py-5 align-middle">
                          <div className="flex justify-end items-center gap-1">
                            <ActionBtn
                              icon={<BarChart2 className="w-4 h-4" />}
                              hoverColor="hover:text-[#10B981] hover:bg-emerald-50"
                              title="Analytics"
                              onClick={(e) => { e.stopPropagation(); setSelectedCampaign(camp); }}
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
              <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/40 flex flex-col sm:flex-row items-center justify-between gap-3">
                <p className="text-[11px] text-slate-400 font-bold">
                  Showing <span className="font-black text-slate-600">{paginatedStart + 1}</span>–
                  <span className="font-black text-slate-600">{Math.min(paginatedStart + ITEMS_PER_PAGE, filtered.length)}</span> of{" "}
                  <span className="font-black text-slate-600">{filtered.length}</span> campaigns
                </p>
                {totalPages > 1 && (
                  <div className="flex items-center gap-1">
                    <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={safePage === 1}
                      className="px-3 py-1.5 rounded-lg text-xs font-black border border-gray-200 text-slate-500 hover:bg-gray-100 disabled:opacity-40 transition-colors">
                      ← Prev
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                      <button key={p} onClick={() => setCurrentPage(p)}
                        className={`w-8 h-8 rounded-lg text-xs font-black border transition-colors ${
                          p === safePage
                            ? "bg-emerald-500 text-white border-emerald-500"
                            : "border-gray-200 text-slate-500 hover:bg-gray-100"
                        }`}>
                        {p}
                      </button>
                    ))}
                    <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={safePage === totalPages}
                      className="px-3 py-1.5 rounded-lg text-xs font-black border border-gray-200 text-slate-500 hover:bg-gray-100 disabled:opacity-40 transition-colors">
                      Next →
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignAnalytics;
