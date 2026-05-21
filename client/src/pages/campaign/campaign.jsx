import React, { useState, useEffect, useCallback, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import CampaignApi from '../../services/CampaignApi';
import { fetchWhatsAppTemplates, mergeTemplates } from '../../services/TemplateApi';
import { toast } from 'react-toastify';
import io from 'socket.io-client';
import { userContext } from '../../context/Context';
import {
  MagnifyingGlassIcon,
  PlusIcon,
  ChartBarIcon,
  DocumentDuplicateIcon,
  TrashIcon,
  ChevronDownIcon,
  MegaphoneIcon,
  FunnelIcon,
  XMarkIcon,
  PaperAirplaneIcon,
  CheckIcon,
  EyeIcon,
  ExclamationTriangleIcon,
  UserGroupIcon,
  ArrowTrendingUpIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import CampaignDetail from '../analytic/CampaignDetail';
const mapStatus = (status) => {
  switch (status) {
    case 'completed': return 'Completed';
    case 'active': return 'Processing';
    case 'paused': return 'Paused';
    case 'scheduled': return 'Scheduled';
    default: return 'Draft';
  }
};

const mapProgress = (camp) => {
  if (camp.status === 'completed') return 100;
  if (camp.stats?.sent > 0) return Math.round((camp.stats.delivered / camp.stats.sent) * 100);
  return 0;
};

const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  });

const truncateText = (value, maxLength = 120) => {
  const text = String(value || '');
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trimEnd()}...`;
};

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  (import.meta.env.VITE_API_URL
    ? String(import.meta.env.VITE_API_URL).replace(/\/api\/?$/, '')
    : 'http://localhost:5000');

const mapCampaign = (camp, templatePreviewMap = {}) => {
  const rawTemplateValue = String(camp.messageTemplate || '—').trim();
  const resolvedTemplate =
    templatePreviewMap[rawTemplateValue] ||
    templatePreviewMap[rawTemplateValue.toLowerCase()] ||
    rawTemplateValue;

  return {
    id: camp._id,
    title: camp.name,
    message: resolvedTemplate || '—',
    templateName: rawTemplateValue,
    status: mapStatus(camp.status),
    progress: mapProgress(camp),
    createdBy: camp.user?.name || 'User',
    initials: (camp.user?.name || camp.name || 'U').substring(0, 2).toUpperCase(),
    sentOn: formatDate(camp.createdAt),
    rawCreatedAt: camp.createdAt,
    count: String((camp.targetAudience || []).length),
    targetAudience: camp.targetAudience || [],
    stats: {
      total: (camp.stats?.sent || 0) + (camp.stats?.failed || 0),
      sent: camp.stats?.sent || 0,
      delivered: camp.stats?.delivered || 0,
      read: camp.stats?.read || 0,
      replied: camp.stats?.replied || 0,
      failed: camp.stats?.failed || 0,
    },
  };
};

/* ═══════════════════════════════════════════════════════════════ */

const CampaignDashboard = () => {
  const navigate = useNavigate();
  const { user } = useContext(userContext);
  const socketRef = useRef(null);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  /* state */
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [duplicatedId, setDuplicatedId] = useState(null);

  /* dynamic filters state */
  const CAMPAIGN_STATUS_OPTIONS = ['Completed', 'Processing', 'Draft', 'Scheduled', 'Paused'];
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterTemplate, setFilterTemplate] = useState('All');
  const [templateOptions, setTemplateOptions] = useState([]);
  const [templatePreviewMap, setTemplatePreviewMap] = useState({});

  // Real-time updates with Socket.io
  useEffect(() => {
    if (!user?._id && !user?.id) return;

    const userId = user._id || user.id;
    socketRef.current = io(SOCKET_URL, { withCredentials: true });

    socketRef.current.on('connect', () => {
      socketRef.current.emit('join', userId);
    });

    socketRef.current.on('campaign_stats_updated', (data) => {
      const { campaignId, stats, status } = data;
      console.log('📈 Campaign stats updated:', data);
      
      setCampaigns((prev) => 
        prev.map((c) => {
          if (String(c.id) === String(campaignId)) {
            return {
              ...c,
              stats: {
                total: (stats.sent || 0) + (stats.failed || 0),
                sent: stats.sent || 0,
                delivered: stats.delivered || 0,
                read: stats.read || 0,
                replied: stats.replied || c.stats?.replied || 0,
                failed: stats.failed || 0,
              },
              status: mapStatus(status),
              progress: mapProgress({ ...c, status, stats })
            };
          }
          return c;
        })
      );
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [user]);

  // Helper to fetch and format templates
  const getTemplatesMap = async () => {
    try {
      const whatsappTemplates = await fetchWhatsAppTemplates();
      const approvedTemplates = whatsappTemplates.approvedTemplates || whatsappTemplates.data?.approvedTemplates || [];
      const formatted = mergeTemplates(approvedTemplates, []);

      return formatted.reduce((acc, template) => {
        if (template?.name) {
          acc[template.name] = template.bodyText || template.name;
          acc[String(template.name).toLowerCase()] = template.bodyText || template.name;
        }
        return acc;
      }, {});
    } catch (error) {
      console.error('Error loading templates map:', error);
      return {};
    }
  };

  const fetchCampaigns = useCallback(async (showLoading = true, customTemplateMap = null) => {
    try {
      if (showLoading) setLoading(true);
      const res = await CampaignApi.getCampaigns();
      if (res.success) {
        const tMap = customTemplateMap || templatePreviewMap;
        const mapped = res.data.map((camp) => mapCampaign(camp, tMap));
        setCampaigns(mapped);
        
        const uniqueTemplates = [...new Set(mapped.map(c => c.templateName))].filter(t => t !== '—');
        setTemplateOptions(uniqueTemplates);
      } else {
        toast.error(res.message || 'Failed to fetch campaigns');
      }
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      toast.error('Failed to fetch campaigns');
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [templatePreviewMap]);

  // Initial load: Fetch both in parallel
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const tMap = await getTemplatesMap();
        setTemplatePreviewMap(tMap);
        // Pass tMap directly to fetchCampaigns to avoid waiting for state update
        await fetchCampaigns(false, tMap);
      } catch (error) {
        console.error('Initial load error:', error);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []); // Only once on mount

  // Background refresh
  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchCampaigns(false);
    }, 15000);

    return () => clearInterval(intervalId);
  }, [fetchCampaigns]);

  /* ── Actions ── */
  const handleDuplicate = async (camp) => {
    try {
      const res = await CampaignApi.createCampaign({
        name: `${camp.title} (Copy)`,
        messageTemplate: camp.message,
        status: 'draft',
      });
      if (res.success) {
        toast.success('Campaign duplicated as draft');
        setDuplicatedId(res.data._id);
        setTimeout(() => setDuplicatedId(null), 2000);
        fetchCampaigns();
      } else {
        toast.error(res.message || 'Failed to duplicate campaign');
      }
    } catch {
      toast.error('Failed to duplicate campaign');
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      const res = await CampaignApi.deleteCampaign(deleteTarget.id);
      if (res.success) {
        toast.success('Campaign deleted');
        setCampaigns((prev) => prev.filter((c) => c.id !== deleteTarget.id));
      } else {
        toast.error(res.message || 'Failed to delete campaign');
      }
    } catch {
      toast.error('Failed to delete campaign');
    } finally {
      setDeleteTarget(null);
    }
  };

  /* ── Derived ── */
  const filtered = campaigns.filter(cur => {
    const matchesSearch = cur.title.toLowerCase().includes(search.toLowerCase()) || 
                          cur.templateName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === 'All' || cur.status === filterStatus;
    const matchesTemplate = filterTemplate === 'All' || cur.templateName === filterTemplate;
    return matchesSearch && matchesStatus && matchesTemplate;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedStart = (safePage - 1) * itemsPerPage;
  const paginated = filtered.slice(paginatedStart, paginatedStart + itemsPerPage);

  // Reset to page 1 when filters/search change
  const handleSearchChange = (val) => { setSearch(val); setCurrentPage(1); };
  const handleStatusChange = (val) => { setFilterStatus(val); setCurrentPage(1); };
  const handleTemplateChange = (val) => { setFilterTemplate(val); setCurrentPage(1); };

  const completedCount = campaigns.filter((c) => c.status === 'Completed').length;
  const processingCount = campaigns.filter((c) => c.status === 'Processing').length;

  if (selectedCampaign) {
    return (
      <CampaignDetail
        campaign={selectedCampaign}
        onBack={() => setSelectedCampaign(null)}
      />
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-[1400px] mx-auto flex flex-col gap-6 font-['Urbanist']">

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-center">
            <MegaphoneIcon className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">Campaigns</h1>
            <p className="text-xs text-slate-400 font-medium mt-0.5">{campaigns.length} total campaigns</p>
          </div>
        </div>
        <button
          onClick={() => navigate('/admin/campaign/create')}
          className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-semibold transition-colors text-sm shadow-sm shadow-emerald-100"
        >
          <PlusIcon className="w-4 h-4" />
          Create Campaign
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 flex items-center gap-3">
          <div className="w-9 h-9 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center">
            <ChartBarIcon className="w-5 h-5 text-slate-500" />
          </div>
          <div>
            <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Total</p>
            <p className="text-xl font-bold text-slate-800">{campaigns.length}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 flex items-center gap-3">
          <div className="w-9 h-9 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center justify-center">
            <CheckCircleIcon className="w-5 h-5 text-emerald-500" />
          </div>
          <div>
            <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Completed</p>
            <p className="text-xl font-bold text-emerald-600">{completedCount}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-50 rounded-xl border border-blue-100 flex items-center justify-center">
            <ClockIcon className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Processing</p>
            <p className="text-xl font-bold text-blue-500">{processingCount}</p>
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <FunnelIcon className="w-4 h-4 text-slate-400" />
            <span className="font-medium">Filter by</span>
            
            <div className="relative group">
              <select 
                value={filterStatus}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="appearance-none flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-slate-600 hover:bg-gray-100 transition-colors font-medium outline-none cursor-pointer pr-8"
              >
                <option value="All">Status: All</option>
                {CAMPAIGN_STATUS_OPTIONS.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
              <ChevronDownIcon className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <div className="relative group">
              <select 
                value={filterTemplate}
                onChange={(e) => handleTemplateChange(e.target.value)}
                className="appearance-none flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-slate-600 hover:bg-gray-100 transition-colors font-medium outline-none cursor-pointer pr-8 max-w-[180px]"
              >
                <option value="All">Template: All</option>
                {templateOptions.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
              <ChevronDownIcon className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
          <div className="relative w-full sm:w-64">
            <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
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
                <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-widest text-slate-400 w-[18%] whitespace-nowrap">Created By</th>
                <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-widest text-slate-400 w-24 text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                      <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-sm font-medium">Loading campaigns...</p>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                      <MegaphoneIcon className="w-8 h-8 opacity-40" />
                      <p className="text-sm font-medium">No campaigns found</p>
                      <button
                        onClick={() => navigate('/admin/campaign/create')}
                        className="mt-1 text-xs font-semibold text-emerald-500 hover:text-emerald-600 underline underline-offset-2"
                      >
                        Create your first campaign
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                paginated.map((camp, index) => (
                  <tr
                    key={camp.id}
                    className={`group transition-colors cursor-pointer ${duplicatedId === camp.id ? 'bg-emerald-50/60' : 'hover:bg-slate-50/60'}`}
                    onClick={() => {
                      if (String(camp.status).toLowerCase() === 'draft') {
                        navigate('/admin/campaign/create', { state: { draftId: camp.id || camp._id, step: 2 } });
                      } else {
                        setSelectedCampaign(camp);
                      }
                    }}
                  >
                    <td className="px-5 py-4 text-sm font-semibold text-slate-300 align-middle">{paginatedStart + index + 1}</td>
                    <td className="px-5 py-4 align-middle">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-800">{camp.title}</span>
                        {duplicatedId === camp.id && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                            <CheckIcon className="w-3 h-3" /> Duplicated
                          </span>
                        )}
                      </div>
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
                      <div className="flex justify-end items-center gap-1">
                        <ActionBtn
                          icon={<ChartBarIcon className="w-4 h-4" />}
                          hoverColor="hover:text-emerald-500 hover:bg-emerald-50"
                          title="Analytics"
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
                          icon={<DocumentDuplicateIcon className="w-4 h-4" />}
                          hoverColor="hover:text-blue-500 hover:bg-blue-50"
                          title="Duplicate"
                          onClick={(e) => { e.stopPropagation(); handleDuplicate(camp); }}
                        />
                        <ActionBtn
                          icon={<TrashIcon className="w-4 h-4" />}
                          hoverColor="hover:text-red-500 hover:bg-red-50"
                          title="Delete"
                          onClick={(e) => { e.stopPropagation(); setDeleteTarget(camp); }}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer / Pagination */}
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

      {/* ── Delete Confirm Modal ── */}
      {deleteTarget && (
        <DeleteModal
          campaign={deleteTarget}
          onConfirm={handleDeleteConfirm}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   Delete Confirmation Modal
═══════════════════════════════════════════════════════════════ */
const DeleteModal = ({ campaign, onConfirm, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
    <div
      className="relative bg-white rounded-2xl border border-gray-200 shadow-2xl w-full max-w-sm font-['Urbanist'] p-6 flex flex-col items-center text-center gap-4"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="w-14 h-14 bg-red-50 border border-red-100 rounded-2xl flex items-center justify-center">
        <TrashIcon className="w-7 h-7 text-red-500" />
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

/* ═══════════════════════════════════════════════════════════════
   Shared sub-components
═══════════════════════════════════════════════════════════════ */
const StatusBadge = ({ status, progress }) => {
  const isProcessing = status === 'Processing';
  const isDraft = status === 'Draft';
  const isScheduled = status === 'Scheduled';
  const isPaused = status === 'Paused';

  const colorClass = isProcessing
    ? 'text-blue-600 bg-blue-50 border-blue-100'
    : isDraft
      ? 'text-slate-500 bg-slate-50 border-slate-100'
      : isScheduled
        ? 'text-amber-600 bg-amber-50 border-amber-100'
        : isPaused
          ? 'text-orange-600 bg-orange-50 border-orange-100'
          : 'text-emerald-600 bg-emerald-50 border-emerald-100';

  return (
    <div className="flex items-center gap-2">
      <StatusCircle percentage={progress} processing={isProcessing} />
      <span className={`text-xs font-semibold px-2 py-0.5 rounded-md border ${colorClass}`}>
        {status}
      </span>
    </div>
  );
};

const ActionBtn = ({ icon, hoverColor, title, onClick }) => (
  <button
    title={title}
    onClick={onClick}
    className={`p-1.5 rounded-lg text-slate-400 transition-colors ${hoverColor}`}
  >
    {icon}
  </button>
);

const StatusCircle = ({ percentage, processing }) => {
  const strokeColor = processing ? '#3b82f6' : '#10b981';
  const r = 11;
  const circ = 2 * Math.PI * r;
  const offset = circ - (percentage / 100) * circ;
  return (
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
      <span className="absolute text-[8px] font-bold text-slate-600">{percentage}%</span>
    </div>
  );
};

export default CampaignDashboard;