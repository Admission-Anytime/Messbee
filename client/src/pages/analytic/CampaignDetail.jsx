import { useState } from "react";
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
} from "lucide-react";

const fmt = (dateStr) => {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit", hour12: true,
  });
};

// ─── Status pill ─────────────────────────────────────────────────────────────
const statusColors = {
  Failed:    { bg: "bg-red-50",    text: "text-red-500",    border: "border-red-100" },
  Read:      { bg: "bg-teal-50",   text: "text-teal-600",   border: "border-teal-100" },
  Delivered: { bg: "bg-blue-50",   text: "text-blue-600",   border: "border-blue-100" },
  Sent:      { bg: "bg-slate-50",  text: "text-slate-600",  border: "border-slate-200" },
};

const StatusPill = ({ status }) => {
  const c = statusColors[status] || statusColors.Sent;
  return (
    <span className={`px-3 py-1 rounded-full text-[11px] font-black border ${c.bg} ${c.text} ${c.border}`}>
      {status}
    </span>
  );
};

// ─── Info card ───────────────────────────────────────────────────────────────
const InfoCard = ({ label, value }) => (
  <div className="flex-1 min-w-[140px] rounded-2xl border border-gray-100 bg-white px-5 py-4 shadow-sm">
    <p className="text-[11px] font-bold text-slate-400 mb-1.5">{label}</p>
    <p className="text-sm font-black text-slate-800 truncate" title={value}>{value || "—"}</p>
  </div>
);

// ─── Stat box ────────────────────────────────────────────────────────────────
const StatBox = ({ label, value }) => (
  <div className="flex flex-col items-start">
    <p className="text-2xl font-black text-slate-900">{value ?? 0}</p>
    <p className="text-[11px] font-bold text-slate-500 mt-0.5">{label}</p>
  </div>
);

// ─── Main component ──────────────────────────────────────────────────────────
const CampaignDetail = ({ campaign, onBack }) => {
  const [page, setPage] = useState(1);
  const [showDropdown, setShowDropdown] = useState(null);

  if (!campaign) return null;

  // ── Derive display values from real campaign object ───────────────────────
  const stats     = campaign.stats || {};
  const total     = (stats.sent || 0) + (stats.failed || 0);
  const contacts  = campaign.targetAudience || [];   // populated array: {name, phone, email}
  const ITEMS     = 10;
  const totalPages = Math.max(1, Math.ceil(contacts.length / ITEMS));
  const visible   = contacts.slice((page - 1) * ITEMS, page * ITEMS);

  // Map a contact to a display status
  const contactStatus = (idx) => {
    if (idx < (stats.failed || 0)) return "Failed";
    if (idx < (stats.failed || 0) + (stats.read || 0)) return "Read";
    if (idx < (stats.failed || 0) + (stats.read || 0) + (stats.delivered || 0)) return "Delivered";
    return "Sent";
  };

  // Campaign-level status badge colour
  const statusBadgeClass = {
    Scheduled:  "bg-amber-50 text-amber-600 border-amber-100",
    Completed:  "bg-emerald-50 text-emerald-600 border-emerald-100",
    Processing: "bg-blue-50 text-blue-600 border-blue-100",
    Paused:     "bg-orange-50 text-orange-600 border-orange-100",
    Draft:      "bg-slate-50 text-slate-500 border-slate-200",
  }[campaign.status] || "bg-slate-50 text-slate-500 border-slate-200";

  return (
    <div className="flex flex-col h-full bg-[#f8fafc] font-['Urbanist'] overflow-hidden">

      {/* ── Top Bar ─────────────────────────────────────────────────────────── */}
      <div className="shrink-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center gap-4 shadow-sm z-10">
        <button
          onClick={onBack}
          className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
          title="Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-base font-black text-slate-900">
              Campaign: {campaign.title}
            </h2>
            <span className={`px-3 py-1 rounded-full text-[11px] font-black border ${statusBadgeClass}`}>
              Status: {campaign.status}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-bold mt-0.5">{fmt(campaign.rawCreatedAt)}</p>
        </div>
      </div>

      {/* ── Scrollable Body ──────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8 space-y-5">

        {/* Action Buttons */}
        <div className="flex items-center gap-3 flex-wrap">
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white text-slate-600 text-xs font-black hover:bg-slate-50 transition-colors shadow-sm">
            <RefreshCw className="w-3.5 h-3.5" /> Sync
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white text-slate-600 text-xs font-black hover:bg-slate-50 transition-colors shadow-sm">
            <Copy className="w-3.5 h-3.5" /> Duplicate
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white text-red-500 text-xs font-black hover:bg-red-50 hover:border-red-200 transition-colors shadow-sm">
            <Trash2 className="w-3.5 h-3.5" /> Delete
          </button>
        </div>

        {/* Template path breadcrumb */}
        <p className="text-[11px] text-slate-400 font-bold px-1">
          {campaign.templateName || "—"}
        </p>

        {/* Info Cards */}
        <div className="flex flex-wrap gap-4">
          <InfoCard label="Created On"        value={fmt(campaign.rawCreatedAt)} />
          <InfoCard label="Message Template"  value={campaign.templateName} />
          <InfoCard label="Target Contacts"   value={String(contacts.length)} />
          <InfoCard label="Estimate Cost"     value="—" />
        </div>

        {/* Overall Campaign Performance */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-5">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-black text-slate-800">Overall Campaign performance</h3>
            <button className="flex items-center gap-1.5 text-xs font-black text-blue-500 hover:text-blue-600 transition-colors">
              <BarChart2 className="w-3.5 h-3.5" /> Chart view
            </button>
          </div>
          <div className="flex flex-wrap gap-x-10 gap-y-4">
            <StatBox label="Overview"       value={total} />
            <StatBox label="Send"           value={stats.sent} />
            <StatBox label="Delivered"      value={stats.delivered} />
            <StatBox label="Read"           value={stats.read} />
            <StatBox label="Text reply"     value={stats.replied} />
            <StatBox label="Button clicked" value={0} />
            <StatBox label="Failed"         value={stats.failed} />
          </div>
        </div>

        {/* List of Contacts */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

          {/* Table toolbar */}
          <div className="px-6 py-4 border-b border-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-slate-400" />
              <h3 className="text-sm font-black text-slate-800">
                List of contacts
                <span className="ml-2 text-[11px] font-bold text-slate-400">({contacts.length})</span>
              </h3>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 bg-white text-xs font-black text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
                <RefreshCw className="w-3 h-3" /> Resend Campaign
              </button>
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 bg-white text-xs font-black text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
                <Download className="w-3 h-3" /> Download Report
              </button>
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 bg-white text-xs font-black text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
                Show <ChevronDown className="w-3 h-3" />
              </button>
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 bg-white text-xs font-black text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
                <Filter className="w-3 h-3" /> Filters
              </button>
              <div className="flex items-center gap-1 text-xs font-black text-slate-600 border border-gray-200 rounded-xl px-2 py-1.5 bg-white shadow-sm">
                <span>Page {page}</span>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
                  className="p-0.5 rounded hover:bg-slate-100 disabled:opacity-30 transition-colors">
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Contacts table */}
          <div className="w-full overflow-x-auto custom-scrollbar">
            <table className="w-full text-left min-w-[700px]">
              <thead>
                <tr className="bg-slate-50/60 border-b border-gray-100">
                  <th className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 w-[5%]">#</th>
                  <th className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 w-[20%]">Name</th>
                  <th className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 w-[20%]">WhatsApp</th>
                  <th className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 w-[16%]">Send Date</th>
                  <th className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 w-[13%]">Status</th>
                  <th className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {contacts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center text-sm text-slate-400 font-bold">
                      No contacts in this campaign.
                    </td>
                  </tr>
                ) : (
                  visible.map((contact, idx) => {
                    const globalIdx = (page - 1) * ITEMS + idx;
                    const status = contactStatus(globalIdx);
                    const phone  = contact.phone || contact.whatsapp || "—";
                    const name   = contact.name || "—";
                    return (
                      <tr key={contact._id || idx} className="group hover:bg-slate-50/60 transition-colors">
                        <td className="px-6 py-4 text-xs font-black text-slate-300 align-middle">{globalIdx + 1}</td>
                        <td className="px-6 py-4 align-middle">
                          <span className="text-xs font-black text-slate-700">{name}</span>
                        </td>
                        <td className="px-6 py-4 align-middle">
                          <span className="text-xs font-black text-slate-700">{phone}</span>
                        </td>
                        <td className="px-6 py-4 align-middle">
                          <span className="text-xs text-slate-500 font-medium">{fmt(campaign.rawCreatedAt)}</span>
                        </td>
                        <td className="px-6 py-4 align-middle">
                          <StatusPill status={status} />
                        </td>
                        <td className="px-6 py-4 align-middle">
                          <div className="flex items-center gap-2">
                            {/* Preview */}
                            <div className="relative">
                              <button
                                onClick={() => setShowDropdown(showDropdown === `p-${globalIdx}` ? null : `p-${globalIdx}`)}
                                className="flex items-center gap-1 pl-3 pr-2 py-1.5 rounded-lg bg-emerald-500 text-white text-[11px] font-black hover:bg-emerald-600 transition-colors"
                              >
                                <Eye className="w-3 h-3" /> Preview <ChevronDown className="w-3 h-3 ml-0.5" />
                              </button>
                              {showDropdown === `p-${globalIdx}` && (
                                <div className="absolute top-full left-0 mt-1 z-20 bg-white border border-gray-100 rounded-xl shadow-lg py-1 min-w-[110px]">
                                  <button className="w-full px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 text-left">View Message</button>
                                  <button className="w-full px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 text-left">Full Preview</button>
                                </div>
                              )}
                            </div>
                            {/* Send */}
                            <div className="relative">
                              <button
                                onClick={() => setShowDropdown(showDropdown === `s-${globalIdx}` ? null : `s-${globalIdx}`)}
                                className="flex items-center gap-1 pl-3 pr-2 py-1.5 rounded-lg bg-emerald-500 text-white text-[11px] font-black hover:bg-emerald-600 transition-colors"
                              >
                                <Send className="w-3 h-3" /> Send <ChevronDown className="w-3 h-3 ml-0.5" />
                              </button>
                              {showDropdown === `s-${globalIdx}` && (
                                <div className="absolute top-full left-0 mt-1 z-20 bg-white border border-gray-100 rounded-xl shadow-lg py-1 min-w-[110px]">
                                  <button className="w-full px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 text-left">Send Now</button>
                                  <button className="w-full px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 text-left">Schedule</button>
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
          {contacts.length > ITEMS && (
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/40 flex items-center justify-between">
              <p className="text-[11px] text-slate-400 font-bold">
                Showing{" "}
                <span className="font-black text-slate-600">{(page - 1) * ITEMS + 1}–{Math.min(page * ITEMS, contacts.length)}</span>{" "}
                of <span className="font-black text-slate-600">{contacts.length}</span> contacts
              </p>
              <div className="flex items-center gap-1.5">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="p-1.5 rounded-lg border border-gray-200 text-slate-500 hover:bg-slate-100 disabled:opacity-30 transition-colors">
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span className="px-3 py-1.5 rounded-lg bg-emerald-500 text-white text-xs font-black">{page}</span>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
                  className="p-1.5 rounded-lg border border-gray-200 text-slate-500 hover:bg-slate-100 disabled:opacity-30 transition-colors">
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Click-outside to close dropdowns */}
      {showDropdown && (
        <div className="fixed inset-0 z-10" onClick={() => setShowDropdown(null)} />
      )}
    </div>
  );
};

export default CampaignDetail;
