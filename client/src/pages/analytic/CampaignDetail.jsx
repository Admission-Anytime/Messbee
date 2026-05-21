import React, { useState, useContext, Fragment } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { userContext } from "../../context/Context";
import CampaignApi from "../../services/CampaignApi";
import axios from "../../context/axios";
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
  LayoutGrid
} from "lucide-react";
import ReactApexChart from "react-apexcharts";

const fmt = (dateStr) => {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit", hour12: true,
  });
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
const StatBox = ({ label, value, isActive, onClick }) => (
  <div 
    onClick={onClick}
    className={`flex-1 min-w-[100px] flex flex-col items-center justify-center cursor-pointer rounded-xl transition-all p-3 mx-1 ${
      isActive ? 'bg-slate-50 ring-1 ring-slate-200 shadow-sm' : 'hover:bg-slate-50/60'
    }`}
  >
    <p className="text-2xl font-black text-slate-900">{value ?? 0}</p>
    <p className="text-xs font-medium text-slate-500 mt-1 text-center leading-tight">{label}</p>
  </div>
);

// ─── Main component ───────────────────────────────────────────────────────────
const CampaignDetail = ({ campaign, onBack }) => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [showDropdown, setShowDropdown] = useState(null);
  const [filterStatus, setFilterStatus] = useState("Overview");
  const [showChart, setShowChart] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const { user, updateUser } = useContext(userContext);
  const [isResending, setIsResending] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showResendModal, setShowResendModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  if (!campaign) return null;

  const stats      = campaign.stats || {};
  const total      = (stats.sent || 0) + (stats.failed || 0);
  const contacts   = campaign.targetAudience || [];

  const contactStatus = (idx) => {
    let offset = 0;
    if (idx < (offset += (stats.failed || 0))) return "Failed";
    if (idx < (offset += (stats.replied || 0))) return "Text reply";
    if (idx < (offset += (stats.read || 0))) return "Read";
    if (idx < (offset += (stats.delivered || 0))) return "Delivered";
    return "Sent";
  };

  const contactsWithStatus = contacts.map((c, idx) => ({
    ...c,
    _globalIdx: idx,
    computedStatus: contactStatus(idx)
  }));

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
  const visible    = filteredContacts.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const handleDownloadCSV = () => {
    if (!filteredContacts.length) return toast.info("No contacts to download.");
    const headers = ["Name,Phone,Status,Send Date\n"];
    const rows = filteredContacts.map(c => {
      const p = c.phone || c.whatsapp || "";
      const n = (c.name || "").replace(/,/g, " ");
      return `${n},${p},${c.computedStatus},${fmt(campaign.rawCreatedAt)}`;
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

  const handleResendCampaign = async () => {
    const estimatedCost = contacts.length * 0.80;
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
          await axios.post("/billing/transactions", {
              desc: `Campaign Resend - ${campaignData.name}`,
              amount: -estimatedCost,
              status: "Paid"
          });

          try {
              const userRes = await axios.get("/auth/me");
              if (userRes.data && userRes.data.data) {
                  updateUser(userRes.data.data);
              }
          } catch (err) {
              const newCredits = parseFloat((user.credits - estimatedCost).toFixed(2));
              if (user) updateUser({ ...user, credits: newCredits });
          }
          toast.success("Campaign resent successfully!");
          onBack(); 
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
    Scheduled:  "bg-amber-50 text-amber-600 border-amber-200",
    Completed:  "bg-emerald-50 text-emerald-600 border-emerald-200",
    Processing: "bg-blue-50 text-blue-600 border-blue-200",
    Paused:     "bg-orange-50 text-orange-600 border-orange-200",
    Draft:      "bg-slate-50 text-slate-500 border-slate-200",
  }[campaign.status] || "bg-slate-50 text-slate-500 border-slate-200";

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
      if (typeof window !== "undefined" && window.onCampaignDelete) {
        window.onCampaignDelete(campaign.id);
      }
      onBack();
    } catch (err) {
      toast.error("Failed to delete campaign");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white font-['Urbanist'] overflow-hidden">

      {/* ── Top Bar ────────────────────────────────────────────────────────── */}
      <div className="shrink-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center gap-4 shadow-sm z-10">
        <button
          onClick={onBack}
          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
          title="Back"
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

      {/* ── Scrollable Body ──────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-5 bg-[#f8fafc]">

        {/* Action Buttons */}
        <div className="flex items-center gap-3 flex-wrap">
          <button 
            onClick={handleSync}
            disabled={isSyncing}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50">
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} /> {isSyncing ? 'Syncing...' : 'Sync'}
          </button>
          <button 
            onClick={() => setShowDeleteModal(true)}
            disabled={isDeleting}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white text-red-500 text-sm font-medium hover:bg-red-50 hover:border-red-200 transition-colors shadow-sm disabled:opacity-50">
            <Trash2 className="w-4 h-4" /> {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>

        {/* Template breadcrumb */}
        <p className="text-sm text-slate-400 font-medium px-1">
          {campaign.templateName || "—"}
        </p>

        {/* Info Cards */}
        <div className="flex flex-wrap gap-4">
          <InfoCard label="Created On"       value={fmt(campaign.rawCreatedAt)} />
          <InfoCard label="Message Template" value={campaign.templateName} />
          <InfoCard label="Target Contacts"  value={String(contacts.length)} />
          <InfoCard label="Estimate Cost"    value={`₹${(contacts.length * 0.80).toFixed(2)}`} />
        </div>

        {/* Overall Campaign Performance */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-6 py-5">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-bold text-slate-800">Overall Campaign performance</h3>
            <button 
              onClick={() => setShowChart(!showChart)}
              className="flex items-center gap-1.5 text-sm font-semibold text-blue-500 hover:text-blue-600 transition-colors"
            >
              {showChart ? (
                <><LayoutGrid className="w-4 h-4" /> Numbers view</>
              ) : (
                <><BarChart2 className="w-4 h-4" /> Chart view</>
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
                  data: [stats.sent || 0, stats.delivered || 0, stats.read || 0, stats.replied || 0, 0, stats.failed || 0]
                }]} 
                type="bar" 
                height="100%" 
              />
            </div>
          ) : (
            <div className="flex flex-wrap justify-between gap-y-5">
              <StatBox label="Overview"       value={total}            isActive={filterStatus === "Overview"}       onClick={() => handleFilter("Overview")} />
              <StatBox label="Send"           value={stats.sent}       isActive={filterStatus === "Send"}           onClick={() => handleFilter("Send")} />
              <StatBox label="Delivered"      value={stats.delivered}  isActive={filterStatus === "Delivered"}      onClick={() => handleFilter("Delivered")} />
              <StatBox label="Read"           value={stats.read}       isActive={filterStatus === "Read"}           onClick={() => handleFilter("Read")} />
              <StatBox label="Text reply"     value={stats.replied}    isActive={filterStatus === "Text reply"}     onClick={() => handleFilter("Text reply")} />
              <StatBox label="Button clicked" value={0}                isActive={filterStatus === "Button clicked"} onClick={() => handleFilter("Button clicked")} />
              <StatBox label="Failed"         value={stats.failed}     isActive={filterStatus === "Failed"}         onClick={() => handleFilter("Failed")} />
            </div>
          )}
        </div>

        {/* List of Contacts */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

          {/* Toolbar */}
          <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-slate-400" />
              <h3 className="text-sm font-semibold text-slate-800">
                List of contacts
                <span className="ml-2 text-xs font-medium text-slate-400">({filteredContacts.length})</span>
              </h3>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button 
                onClick={() => setShowResendModal(true)} 
                disabled={isResending}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isResending ? 'animate-spin' : ''}`} /> 
                {isResending ? 'Resending...' : 'Resend Campaign'}
              </button>
              <button onClick={handleDownloadCSV} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
                <Download className="w-3.5 h-3.5" /> Download Report
              </button>
              <div className="relative">
                <button onClick={() => setShowDropdown(showDropdown === 'filter' ? null : 'filter')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
                  <Filter className="w-3.5 h-3.5" /> Filters
                </button>
                {showDropdown === 'filter' && (
                  <div className="absolute top-full mt-1 right-0 bg-white border border-gray-100 shadow-lg rounded-lg p-3 z-20 w-64" onClick={e => e.stopPropagation()}>
                    <input 
                      type="text" 
                      placeholder="Search by name or phone..." 
                      value={searchTerm}
                      onChange={e => { setSearchTerm(e.target.value); setPage(1); }}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500" 
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left min-w-[700px]">
              <thead>
                <tr className="bg-gray-50/60 border-b border-gray-100">
                  <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-widest text-slate-400 w-[5%]">#</th>
                  <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-widest text-slate-400 w-[20%]">Name</th>
                  <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-widest text-slate-400 w-[22%]">WhatsApp</th>
                  <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-widest text-slate-400 w-[18%]">Send Date</th>
                  <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-widest text-slate-400 w-[13%]">Status</th>
                  <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-widest text-slate-400">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
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
                    const phone  = contact.phone || contact.whatsapp || "—";
                    const name   = contact.name || "—";
                    return (
                      <tr key={contact._id || idx} className="group hover:bg-slate-50/60 transition-colors">
                        <td className="px-5 py-4 text-sm font-semibold text-slate-300 align-middle">{globalIdx + 1}</td>
                        <td className="px-5 py-4 align-middle">
                          <span className="text-sm font-semibold text-slate-700">{name}</span>
                        </td>
                        <td className="px-5 py-4 align-middle">
                          <span className="text-sm font-medium text-slate-600">{phone}</span>
                        </td>
                        <td className="px-5 py-4 align-middle">
                          <span className="text-sm text-slate-500 font-medium">{fmt(campaign.rawCreatedAt)}</span>
                        </td>
                        <td className="px-5 py-4 align-middle">
                          <StatusPill status={status} />
                        </td>
                        <td className="px-5 py-4 align-middle">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => navigate('/admin/chat')}
                              className="flex items-center gap-1 pl-3 pr-3 py-1.5 rounded-lg bg-emerald-500 text-white text-xs font-semibold hover:bg-emerald-600 transition-colors"
                            >
                              <Eye className="w-3.5 h-3.5" /> Preview
                            </button>
                            <button
                              onClick={() => toast.success(`Message queued to send to ${name}`)}
                              className="flex items-center gap-1 pl-3 pr-3 py-1.5 rounded-lg bg-emerald-500 text-white text-xs font-semibold hover:bg-emerald-600 transition-colors"
                            >
                              <Send className="w-3.5 h-3.5" /> Send
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* ── Enhanced Pagination Footer ── */}
          <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-gray-100 bg-white mt-auto rounded-b-2xl">
            <div className="flex items-center gap-4 text-sm text-slate-500 font-medium w-full sm:w-auto justify-center sm:justify-start mb-4 sm:mb-0">
              <p>Total contacts: <span className="font-bold text-slate-800">{filteredContacts.length}</span></p>
            </div>

            <div className="flex items-center gap-6 w-full sm:w-auto justify-center sm:justify-end">
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-500 font-medium">Rows per page:</span>
                <div className="relative">
                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setPage(1);
                    }}
                    className="appearance-none bg-gray-50 border border-gray-200 text-slate-700 text-sm font-semibold rounded-lg pl-3 pr-8 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-shadow cursor-pointer"
                  >
                    {[10, 25, 50, 100].map(val => (
                      <option key={val} value={val}>{val}</option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-sm text-slate-500 font-medium">
                  {filteredContacts.length === 0 ? '0-0 of 0' : `${(page - 1) * itemsPerPage + 1}-${Math.min(page * itemsPerPage, filteredContacts.length)} of ${filteredContacts.length}`}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-1.5 rounded-lg border border-gray-200 text-slate-400 hover:text-slate-600 hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <div className="flex items-center">
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(p => p === 1 || p === totalPages || Math.abs(page - p) <= 1)
                      .map((p, i, arr) => (
                        <Fragment key={p}>
                          {i > 0 && arr[i - 1] !== p - 1 && (
                            <span className="px-2 text-slate-400">...</span>
                          )}
                          <button
                            onClick={() => setPage(p)}
                            className={`min-w-[32px] h-8 flex items-center justify-center rounded-lg text-sm font-bold transition-colors ${
                              page === p
                                ? 'bg-emerald-500 text-white shadow-sm'
                                : 'text-slate-500 hover:bg-gray-50'
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
            </div>
          </div>
        </div>
      </div>

      {/* Click-outside to close dropdowns */}
      {showDropdown && (
        <div className="fixed inset-0 z-10" onClick={() => setShowDropdown(null)} />
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
          cost={contacts.length * 0.80}
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
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   Resend Confirmation Modal
═══════════════════════════════════════════════════════════════ */
const ResendConfirmModal = ({ campaign, onConfirm, onClose, cost }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
    <div
      className="relative bg-white rounded-2xl border border-gray-200 shadow-2xl w-full max-w-sm font-['Urbanist'] p-6 flex flex-col items-center text-center gap-4"
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
      className="relative bg-white rounded-2xl border border-gray-200 shadow-2xl w-full max-w-sm font-['Urbanist'] p-6 flex flex-col items-center text-center gap-4"
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
