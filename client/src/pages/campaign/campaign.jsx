import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import CampaignApi from '../../services/CampaignApi';
import { fetchWhatsAppTemplates, mergeTemplates } from '../../services/TemplateApi';
import { toast } from 'react-toastify';
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

/* ── helpers ── */
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
    stats: {
      total: (camp.stats?.sent || 0) + (camp.stats?.failed || 0),
      sent: camp.stats?.sent || 0,
      delivered: camp.stats?.delivered || 0,
      read: camp.stats?.read || 0,
      failed: camp.stats?.failed || 0,
    },
  };
};

/* ═══════════════════════════════════════════════════════════════ */

const CampaignDashboard = () => {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  /* modal state */
  const [analyticsTarget, setAnalyticsTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [duplicatedId, setDuplicatedId] = useState(null);

  /* dynamic filters state */
  const CAMPAIGN_STATUS_OPTIONS = ['Completed', 'Processing', 'Draft', 'Scheduled', 'Paused'];
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterTemplate, setFilterTemplate] = useState('All');
  const [templateOptions, setTemplateOptions] = useState([]);
  const [templatePreviewMap, setTemplatePreviewMap] = useState({});

  const loadApprovedTemplates = useCallback(async () => {
    try {
      const whatsappTemplates = await fetchWhatsAppTemplates();
      const approvedTemplates = whatsappTemplates.approvedTemplates || whatsappTemplates.data?.approvedTemplates || [];
      const formatted = mergeTemplates(approvedTemplates, []);

      const previewMap = formatted.reduce((acc, template) => {
        if (template?.name) {
          acc[template.name] = template.bodyText || template.name;
          acc[String(template.name).toLowerCase()] = template.bodyText || template.name;
        }
        return acc;
      }, {});

      setTemplatePreviewMap(previewMap);
    } catch (error) {
      console.error('Error loading approved templates:', error);
    }
  }, []);

  const fetchCampaigns = useCallback(async () => {
    try {
      setLoading(true);
      const res = await CampaignApi.getCampaigns();
      if (res.success) {
        const mapped = res.data.map((camp) => mapCampaign(camp, templatePreviewMap));
        setCampaigns(mapped);
        
        // Extract unique template names from campaigns for stable filter values.
        const uniqueTemplates = [...new Set(mapped.map(c => c.templateName))].filter(t => t !== '—');
        setTemplateOptions(uniqueTemplates);
      } else {
        toast.error(res.message || 'Failed to fetch campaigns');
      }
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      toast.error('Failed to fetch campaigns');
    } finally {
      setLoading(false);
    }
  }, [templatePreviewMap]);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  useEffect(() => {
    loadApprovedTemplates();
  }, [loadApprovedTemplates]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchCampaigns();
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

  const completedCount = campaigns.filter((c) => c.status === 'Completed').length;
  const processingCount = campaigns.filter((c) => c.status === 'Processing').length;

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
                onChange={(e) => setFilterStatus(e.target.value)}
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
                onChange={(e) => setFilterTemplate(e.target.value)}
                className="appearance-none flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-slate-600 hover:bg-gray-100 transition-colors font-medium outline-none cursor-pointer pr-8"
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
              onChange={(e) => setSearch(e.target.value)}
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
                <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-widest text-slate-400 w-[22%] whitespace-nowrap">Campaign Title</th>
                <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-widest text-slate-400 w-[22%] whitespace-nowrap">Template</th>
                <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-widest text-slate-400 w-[14%] whitespace-nowrap">Status</th>
                <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-widest text-slate-400 w-[14%] whitespace-nowrap">Sent On</th>
                <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-widest text-slate-400 w-[16%] whitespace-nowrap">Created By</th>
                <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-widest text-slate-400 w-[10%] text-right whitespace-nowrap">Actions</th>
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
                filtered.map((camp, index) => (
                  <tr
                    key={camp.id}
                    className={`group transition-colors ${duplicatedId === camp.id ? 'bg-emerald-50/60' : 'hover:bg-slate-50/60'}`}
                  >
                    <td className="px-5 py-4 text-sm font-semibold text-slate-300 align-middle">{index + 1}</td>
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
                    <td className="px-5 py-4 align-middle">
                      <span
                        className="inline-flex max-w-[240px] rounded-lg border border-emerald-100 bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 truncate align-middle"
                        title={camp.templateName}
                      >
                        {truncateText(camp.templateName, 48)}
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
                          onClick={() => setAnalyticsTarget(camp)}
                        />
                        <ActionBtn
                          icon={<DocumentDuplicateIcon className="w-4 h-4" />}
                          hoverColor="hover:text-blue-500 hover:bg-blue-50"
                          title="Duplicate"
                          onClick={() => handleDuplicate(camp)}
                        />
                        <ActionBtn
                          icon={<TrashIcon className="w-4 h-4" />}
                          hoverColor="hover:text-red-500 hover:bg-red-50"
                          title="Delete"
                          onClick={() => setDeleteTarget(camp)}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        {filtered.length > 0 && (
          <div className="px-6 py-3 border-t border-gray-100 bg-gray-50/40">
            <p className="text-xs text-slate-400 font-medium">
              Showing <span className="font-bold text-slate-600">{filtered.length}</span> of <span className="font-bold text-slate-600">{campaigns.length}</span> campaigns
            </p>
          </div>
        )}
      </div>

      {/* ── Analytics Modal ── */}
      {analyticsTarget && (
        <AnalyticsModal
          campaign={analyticsTarget}
          onClose={() => setAnalyticsTarget(null)}
        />
      )}

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
   Analytics Modal
═══════════════════════════════════════════════════════════════ */
const AnalyticsModal = ({ campaign, onClose }) => {
  const s = campaign.stats;
  const deliveryRate = s.sent > 0 ? Math.round((s.delivered / s.sent) * 100) : 0;
  const readRate = s.delivered > 0 ? Math.round((s.read / s.delivered) * 100) : 0;

  const rows = [
    { label: 'Total Recipients', value: s.total, icon: <UserGroupIcon className="w-4 h-4" />, bg: 'bg-slate-50', border: 'border-slate-100', text: 'text-slate-600' },
    { label: 'Sent', value: s.sent, icon: <PaperAirplaneIcon className="w-4 h-4" />, bg: 'bg-blue-50', border: 'border-blue-100', text: 'text-blue-600' },
    { label: 'Delivered', value: s.delivered, icon: <CheckIcon className="w-4 h-4" />, bg: 'bg-emerald-50', border: 'border-emerald-100', text: 'text-emerald-600' },
    { label: 'Read', value: s.read, icon: <EyeIcon className="w-4 h-4" />, bg: 'bg-violet-50', border: 'border-violet-100', text: 'text-violet-600' },
    { label: 'Failed', value: s.failed, icon: <ExclamationTriangleIcon className="w-4 h-4" />, bg: 'bg-red-50', border: 'border-red-100', text: 'text-red-500' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-2xl border border-gray-200 shadow-2xl w-full max-w-lg font-['Urbanist'] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-center">
              <ArrowTrendingUpIcon className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800 leading-tight">Campaign Analytics</h2>
              <p className="text-xs text-slate-400 font-medium mt-0.5 truncate max-w-[260px]">{campaign.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-gray-100 transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Meta row */}
        <div className="flex items-center gap-4 px-6 py-3 bg-gray-50/60 border-b border-gray-100 text-xs text-slate-500 font-medium">
          <span className="flex items-center gap-1.5">
            <ClockIcon className="w-3.5 h-3.5 text-slate-400" /> {campaign.sentOn}
          </span>
          <span className="flex items-center gap-1.5 truncate max-w-[160px]">
            <DocumentDuplicateIcon className="w-3.5 h-3.5 text-slate-400 shrink-0" /> {campaign.templateName}
          </span>
          <StatusBadge status={campaign.status} progress={campaign.progress} />
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 gap-3 p-6">
          {rows.map((r) => (
            <div
              key={r.label}
              className={`flex items-center gap-3 ${r.bg} border ${r.border} rounded-xl p-3.5`}
            >
              <div className={`w-8 h-8 rounded-lg bg-white border ${r.border} flex items-center justify-center ${r.text}`}>
                {r.icon}
              </div>
              <div>
                <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">{r.label}</p>
                <p className={`text-lg font-bold ${r.text}`}>{r.value.toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Rate bars */}
        <div className="px-6 pb-6 flex flex-col gap-3">
          <RateBar label="Delivery Rate" value={deliveryRate} color="bg-emerald-500" />
          <RateBar label="Read Rate" value={readRate} color="bg-violet-500" />
        </div>
      </div>
    </div>
  );
};

const RateBar = ({ label, value, color }) => (
  <div>
    <div className="flex justify-between items-center mb-1.5">
      <span className="text-xs font-semibold text-slate-500">{label}</span>
      <span className="text-xs font-bold text-slate-700">{value}%</span>
    </div>
    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full ${color} transition-all duration-700`}
        style={{ width: `${value}%` }}
      />
    </div>
  </div>
);

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