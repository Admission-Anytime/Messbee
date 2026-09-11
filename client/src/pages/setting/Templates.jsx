import { useState, useEffect, useCallback, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, Plus, RotateCw, Image as ImageIcon, Trash2, RefreshCw, Pencil, Copy, ChevronLeft, ChevronRight, ChevronDown, Phone, Video, Smile, Paperclip, Send, CheckCheck, CheckCircle, Info, X, Split, Lock, Sparkles, ArrowRight } from 'lucide-react';
import { userContext } from '../../context/Context';
import { getPlanLimit, hasPlanFeature } from '../../utils/planLimits';

const ROWS_OPTIONS = [10, 25, 50, 100];

function Pagination({ currentPage, totalPages, rowsPerPage, totalCount, onPageChange, onRowsChange }) {
  const start = totalCount === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1;
  const end = Math.min(currentPage * rowsPerPage, totalCount);

  const getPages = () => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages = [1];
    if (currentPage > 3) pages.push('...');
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) pages.push(i);
    if (currentPage < totalPages - 2) pages.push('...');
    pages.push(totalPages);
    return pages;
  };

  return (
    <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50 flex-wrap gap-2 font-sans">
      <span className="text-sm text-gray-500">Total templates: <strong className="text-gray-900">{totalCount}</strong></span>
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm text-gray-500">Rows per page:</span>
        <select
          value={rowsPerPage}
          onChange={e => { onRowsChange(Number(e.target.value)); onPageChange(1); }}
          className="border border-gray-200 rounded-md text-sm text-gray-700 px-2 py-1 cursor-pointer outline-none focus:border-emerald-400"
        >
          {ROWS_OPTIONS.map(n => <option key={n}>{n}</option>)}
        </select>
        <span className="text-sm text-gray-500 min-w-[90px] text-center">{start}–{end} of {totalCount}</span>
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-1.5 border border-gray-200 rounded-md text-gray-500 hover:border-emerald-400 hover:text-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div className="flex gap-1">
          {getPages().map((p, i) =>
            p === '...'
              ? <span key={`d${i}`} className="px-2 py-1 text-sm text-gray-400">…</span>
              : <button
                key={p}
                onClick={() => onPageChange(p)}
                className={`min-w-[32px] px-2 py-1 border rounded-md text-sm font-medium transition-all ${p === currentPage ? 'bg-emerald-500 text-white border-emerald-500 font-bold' : 'bg-white text-gray-500 border-gray-200 hover:border-emerald-400 hover:text-emerald-700'}`}
              >
                {p}
              </button>
          )}
        </div>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages || totalPages === 0}
          className="p-1.5 border border-gray-200 rounded-md text-gray-500 hover:border-emerald-400 hover:text-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
import { toast } from 'react-toastify';
import { fetchWhatsAppTemplates, mergeTemplates, deleteWhatsAppTemplate } from '../../services/TemplateApi';
import { formatWhatsAppMarkdown } from '../../utils/markdownParser';

// Human-readable descriptions for Meta's raw rejection reason codes
const META_REJECTION_REASONS = {
  INVALID_FORMAT: {
    label: 'Invalid Format',
    description: 'Template variables are malformed. Check that placeholders like {{1}}, {{2}} are correctly numbered, have no spaces inside the braces, and are sequential.',
  },
  TAG_CONTENT_MISMATCH: {
    label: 'Tag / Content Mismatch',
    description: 'The template category does not match the content. For example, marketing offers must use the MARKETING category.',
  },
  INCORRECT_CATEGORY: {
    label: 'Incorrect Category',
    description: 'Meta detected that the content belongs to a different category. Update the category and resubmit.',
  },
  SCAM: {
    label: 'Potential Scam',
    description: 'Meta flagged this template as potentially deceptive or scam-like content.',
  },
  ABUSIVE_CONTENT: {
    label: 'Abusive Content',
    description: 'The template contains content that violates Meta\'s policies.',
  },
  PROMOTIONAL: {
    label: 'Promotional Content',
    description: 'Promotional or sales content is not allowed in Utility or Authentication templates.',
  },
  NONE: {
    label: 'No Specific Reason',
    description: 'Meta did not provide a specific reason. Review the template against WhatsApp Business Policy guidelines.',
  },
};

const getRejectionInfo = (rawReason) => {
  if (!rawReason) return null;
  const key = String(rawReason).trim().toUpperCase();
  return META_REJECTION_REASONS[key] || {
    label: rawReason,
    description: 'Meta rejected this template. Review it against WhatsApp Business Policy guidelines and resubmit.',
  };
};

const Templates = ({ activeTab }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useContext(userContext);
  const currentPlan = (user?.subscriptionPlan || 'free').toLowerCase();
  const currentPlanCapitalized = currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1);
  const templateLimit = getPlanLimit(currentPlan, 'templates');

  // Syncing internal view with Sidebar activeTab
  const [view, setView] = useState('list');
  const [upgradeModal, setUpgradeModal] = useState({ isOpen: false, featureName: 'Templates', message: '' });

  useEffect(() => {
    if (activeTab === 'create-template') {
      setView('choose');
    } else if (activeTab === 'template-list') {
      setView('list');
    } else if (activeTab === 'template-gallery') {
      setView('gallery'); 
    }
  }, [activeTab]);


  // Success message banner after creating or editing a template
  const [successBanner, setSuccessBanner] = useState(null);

  useEffect(() => {
    // Only check when we land on the list page
    if (!location.pathname.includes('templates/list') && !location.pathname.includes('campaigns/templates')) return;
    // Read success flag written by CreateTemplate before navigating here
    try {
      const raw = localStorage.getItem('templateSuccessToast');
      if (raw) {
        const data = JSON.parse(raw);
        localStorage.removeItem('templateSuccessToast');
        // Guard against stale flags (older than 30 seconds)
        if (data && Date.now() - (data.ts || 0) < 30000) {
          const msg = data.message || 'Template saved successfully!';
          setSuccessBanner({ message: msg, isEditing: data.isEditing, templateName: data.templateName });
          toast.success(msg, { toastId: 'template-saved-success', autoClose: 5000 });
          const timer = setTimeout(() => setSuccessBanner(null), 7000);
          return () => clearTimeout(timer);
        }
      }
    } catch (_) {}
  }, [location.pathname]);



  // --- TEMPLATE DATA ---
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filteredTemplates, setFilteredTemplates] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [statusFilter, setStatusFilter] = useState('All');

  // Track locally deleted template names so they don't reappear after refresh
  const DELETED_KEY = 'messbee_deleted_templates';
  const getDeletedNames = () => {
    try { return JSON.parse(localStorage.getItem(DELETED_KEY) || '[]'); } catch { return []; }
  };
  const addDeletedName = (name) => {
    const existing = getDeletedNames();
    if (!existing.includes(name)) {
      localStorage.setItem(DELETED_KEY, JSON.stringify([...existing, name]));
    }
  };

  // Fetch templates from WhatsApp API
  // silent=true suppresses the success toast (used after delete or background sync to avoid double-toast)
  const loadTemplates = useCallback(async (silent = false) => {
    setLoading(true);
    try {
      const whatsappTemplates = await fetchWhatsAppTemplates();
      const templatesArray = whatsappTemplates.data?.data || [];
      const formatted = mergeTemplates(templatesArray, []);
      
      // Filter out locally deleted templates
      const deletedNames = getDeletedNames();
      const visibleTemplates = formatted.filter(t => !deletedNames.includes(t.name));
      
      setTemplates(visibleTemplates);
      
      if (visibleTemplates.length > 0) {
        setSelectedTemplate((prev) => prev || visibleTemplates[0]);
      }
      
      if (!silent) {
        toast.success('Templates synced from WhatsApp', {
          toastId: 'templates-sync-success',
        });
      }
    } catch (error) {
      console.warn('Failed to load templates from WhatsApp:', error);
      if (error?.response?.status !== 403) {
        toast.error('Failed to load templates from WhatsApp', {
          toastId: 'templates-sync-error',
        });
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  // Re-fetch templates every time the user navigates back to this page
  // (the component stays mounted inside the layout, so we watch location.key)
  useEffect(() => {
    loadTemplates(true); // silent = no toast on revisit
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.key]);

  // Filter templates based on search and status
  useEffect(() => {
    let filtered = templates;
    
    if (searchQuery) {
      filtered = filtered.filter(t => 
        t.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (statusFilter !== 'All') {
      filtered = filtered.filter(t => t.status === statusFilter);
    }
    
    setFilteredTemplates(filtered);
    setCurrentPage(1); // reset to page 1 whenever filters change
  }, [templates, searchQuery, statusFilter]);

  const [deleteModal, setDeleteModal] = useState({ isOpen: false, templateId: null, isDeleting: false });

  const handleDeleteClick = (e, id) => {
    e.stopPropagation();
    setDeleteModal({ isOpen: true, templateId: id, isDeleting: false });
  };

  const confirmDelete = async () => {
    const id = deleteModal.templateId;
    const templateToDelete = templates.find(t => t.id === id);
    
    if (!templateToDelete) {
      toast.error("Template not found");
      setDeleteModal({ isOpen: false, templateId: null, isDeleting: false });
      return;
    }

    setDeleteModal(prev => ({ ...prev, isDeleting: true }));

    try {
      await deleteWhatsAppTemplate(id, templateToDelete.name);
      
      // Save locally so it stays hidden on reloads
      addDeletedName(templateToDelete.name);

      // Remove from local state immediately
      const updatedTemplates = templates.filter(t => t.id !== id && t.name !== templateToDelete.name);
      setTemplates(updatedTemplates);
      setFilteredTemplates(prev => prev.filter(t => t.id !== id && t.name !== templateToDelete.name));
      
      if (selectedTemplate?.id === id) {
        setSelectedTemplate(updatedTemplates.length > 0 ? updatedTemplates[0] : null);
      }
      
      setDeleteModal({ isOpen: false, templateId: null, isDeleting: false });
      toast.success("Template deleted successfully");
    } catch (error) {
      console.error('❌ Error deleting template:', error);
      toast.error(error?.response?.data?.message || "Failed to delete template. Please try again.");
      setDeleteModal(prev => ({ ...prev, isDeleting: false }));
    }
  };


  const handleSync = async () => {
    setLoading(true);
    await loadTemplates();
  };

  const isLimitReached = templateLimit !== -1 && templates.length >= templateLimit;

  const handleCreateClick = () => {
    if (isLimitReached) {
      setUpgradeModal({
        isOpen: true,
        featureName: 'Templates',
        message: `You have reached your limit of ${templateLimit} templates on the ${currentPlanCapitalized} plan. Upgrade to create more templates!`
      });
      return;
    }
    navigate('/admin/templates/create');
  };

  // --- VIEW 1: LIST VIEW ---
  if (view === 'list') {
    return (
      <div className="flex flex-col lg:flex-row h-full w-full bg-[#F9FAFB] p-4 lg:p-6 gap-3 lg:gap-3 overflow-hidden font-sans antialiased relative">
        {/* UPGRADE PLAN MODAL */}
        {upgradeModal.isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl scale-in-center border border-slate-100 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 to-teal-500" />
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto mb-5 text-emerald-600 shadow-sm">
                <Lock className="w-8 h-8" />
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold mb-3">
                <span>Current: {currentPlanCapitalized} Plan</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Upgrade to Create More Templates</h3>
              <p className="text-slate-500 text-xs sm:text-sm mb-6 leading-relaxed">
                {upgradeModal.message || `You have reached the template limit for the ${currentPlanCapitalized} plan. Upgrade to unlock higher limits and premium features.`}
              </p>
              <div className="bg-slate-50 rounded-xl p-3.5 text-left border border-slate-100 mb-6 space-y-1.5 text-xs">
                <div className="flex items-center gap-2 font-bold text-slate-700">
                  <Sparkles className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>Template limits by plan:</span>
                </div>
                <p className="text-slate-500 leading-relaxed pl-6 space-y-0.5">
                  • <strong>Free Trial:</strong> 3 templates<br/>
                  • <strong>Basic:</strong> 15 templates & Template Gallery<br/>
                  • <strong>Growth:</strong> 50 templates & Analytics<br/>
                  • <strong>Professional:</strong> Unlimited templates
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setUpgradeModal({ isOpen: false, featureName: 'Templates', message: '' })}
                  className="flex-1 py-2.5 px-4 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setUpgradeModal({ isOpen: false, featureName: 'Templates', message: '' });
                    navigate('/admin/plan/upgrade');
                  }}
                  className="flex-1 py-2.5 px-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-200 transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Upgrade Plan</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* DELETE CONFIRMATION MODAL */}
        {deleteModal.isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl p-8 max-w-sm w-full mx-4 shadow-2xl scale-in-center border border-gray-100 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-6">
                <Trash2 size={32} className="text-red-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Confirm Delete</h2>
              
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4 w-full">
                <p className="text-sm font-semibold text-amber-900">⚠️ WhatsApp Template</p>
                <p className="text-xs text-amber-800 mt-1">This will permanently delete the template from your WhatsApp Business Account.</p>
              </div>
              
              <p className="text-gray-500 font-medium mb-8">
                Are you sure you want to delete this template? This action cannot be undone.
              </p>
              <div className="flex gap-3 w-full">
                <button 
                  onClick={() => setDeleteModal({ isOpen: false, templateId: null, isDeleting: false })}
                  disabled={deleteModal.isDeleting}
                  className="flex-1 py-3 px-4 border border-gray-200 rounded-xl font-bold text-gray-500 hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmDelete}
                  disabled={deleteModal.isDeleting}
                  className="flex-1 py-3 px-4 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold shadow-lg shadow-red-500/20 transition-all border border-red-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {deleteModal.isDeleting ? (
                    <>
                      <RefreshCw size={18} className="animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    'Yes. Delete'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <div className="flex items-center justify-between mb-6 gap-3">
            <div className="flex items-center gap-2 relative group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-center">
                  <Split className="w-5 h-5 text-emerald-600" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">Templates</h1>
              </div>
              <Info size={18} className="text-gray-400 cursor-pointer hover:text-blue-500 transition-colors" />
              <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 w-64 p-3 bg-gray-900 text-white text-xs rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none">
                <div className="absolute top-1/2 -left-1 -translate-y-1/2 border-[5px] border-transparent border-r-gray-900"></div>
                <p className="font-semibold mb-1">WhatsApp Templates</p>
                <p className="text-gray-300 font-medium">Templates must be approved by Meta before they can be used to start conversations with customers.</p>
              </div>
            </div>
            <div className="flex items-center gap-2 md:gap-3">
              {/* Template count indicator */}
              <div
                title={`${templates.length} templates`}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border bg-slate-50 text-slate-700 border-slate-200"
              >
                <span>{templates.length}</span>
                <span className="text-slate-400 font-normal">{templates.length === 1 ? 'Template' : 'Templates'}</span>
              </div>

              <button 
                onClick={handleSync}
                disabled={loading}
                className="flex items-center gap-2 text-gray-600 border border-gray-200 hover:bg-gray-50 px-3 md:px-4 py-2 rounded-lg transition-all font-semibold text-sm disabled:opacity-50 cursor-pointer"
              >
                <RotateCw size={16} className={loading ? 'animate-spin' : ''} />
                <span>{loading ? 'Syncing...' : 'Sync'}</span>
              </button>
              
              <button 
                onClick={handleCreateClick} 
                className={`flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 rounded-lg font-semibold text-sm transition-all shadow-sm whitespace-nowrap cursor-pointer ${
                  isLimitReached 
                    ? 'bg-amber-500 hover:bg-amber-600 text-white' 
                    : 'bg-[#10B981] hover:bg-[#059669] text-white'
                }`}
              >
                {isLimitReached ? <Lock size={15} /> : <Plus size={16} />}
                <span>{isLimitReached ? 'Upgrade Plan' : 'Create Template'}</span>
              </button>
            </div>
          </div>

          {/* In-page Success Notification Banner */}
          {successBanner && (
            <div className="mb-5 p-4 bg-emerald-50/90 border border-emerald-200/90 rounded-2xl flex items-center justify-between text-emerald-900 shadow-sm animate-fadeIn">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-sm shadow-emerald-200">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-sm text-slate-800 flex items-center gap-2 flex-wrap">
                    <span>{successBanner.isEditing ? 'Template Updated Successfully' : 'Template Submitted Successfully'}</span>
                    {successBanner.templateName && (
                      <span className="text-xs px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-mono font-medium">
                        {successBanner.templateName}
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                    {successBanner.message}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSuccessBanner(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-emerald-100/60 transition cursor-pointer ml-3 shrink-0"
                title="Dismiss"
              >
                <X size={16} />
              </button>
            </div>
          )}

          <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between min-h-[420px] overflow-hidden">
            {/* Filter bar */}
            <div className="sticky top-0 z-20 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/90 flex items-center justify-between px-4 sm:px-5 py-3.5 border-b border-gray-100 gap-3 flex-wrap rounded-t-2xl">
              <div className="flex items-center gap-2.5 flex-wrap flex-1 min-w-0">
                <span className="text-sm text-gray-500 font-medium">Filter Status:</span>
                <div className="relative">
                  <select 
                    value={statusFilter}
                    onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                    className="appearance-none pl-3 pr-8 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-700 font-medium bg-white cursor-pointer outline-none focus:border-green-400 transition-colors shadow-sm"
                  >
                    <option>All</option>
                    <option>Approved</option>
                    <option>Pending</option>
                    <option>Rejected</option>
                    <option>Blocked</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                </div>
              </div>
              <div className="relative w-full sm:w-72 xl:w-60 xl:ml-auto">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input 
                  type="text" 
                  placeholder="Search templates..." 
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  className="pl-8 pr-8 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 w-full outline-none focus:border-green-400 transition-colors shadow-sm" 
                />
                {searchQuery && (
                  <button
                    onClick={() => { setSearchQuery(""); setCurrentPage(1); }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500"
                    title="Clear search"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>

            {loading ? (
              <div className="flex-1 flex items-center justify-center h-64">
                <div className="flex flex-col items-center gap-2">
                  <RefreshCw size={32} className="text-gray-400 animate-spin" />
                  <p className="text-gray-400 font-medium">Loading templates...</p>
                </div>
              </div>
            ) : filteredTemplates.length === 0 ? (
              <div className="flex-1 flex items-center justify-center p-10 h-64">
                <div className="flex flex-col items-center gap-3 p-6 border border-gray-200 border-dashed rounded-xl bg-gray-50/50 text-center">
                  <p className="text-slate-400 font-medium">No templates found.</p>
                  <button 
                    onClick={handleCreateClick} 
                    className="flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-emerald-600 px-4 py-2 rounded-lg font-bold text-sm transition-all shadow-sm cursor-pointer"
                  >
                    <Plus size={16} />
                    <span>Create Template</span>
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-x-auto">
                  <table className="w-full table-fixed text-left border-collapse">
                    <thead className="bg-white sticky top-0 z-10 border-b border-gray-200">
                      <tr>
                        <th className="px-2 md:px-3 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-2 md:px-3 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Update Date</th>
                        <th className="px-2 md:px-3 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Category</th>
                        <th className="px-2 md:px-3 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-center">Status</th>
                        <th className="px-2 md:px-3 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-center">Source</th>
                        <th className="px-2 md:px-3 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredTemplates
                        .slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)
                        .map((temp) => (
                        <tr key={temp.id} onClick={() => setSelectedTemplate(temp)} className={`hover:bg-gray-50/50 cursor-pointer transition-colors ${selectedTemplate?.id === temp.id ? 'bg-green-50/60' : ''}`}>
                          <td className="px-2 md:px-3 py-3 text-sm font-medium text-gray-900 truncate" title={temp.name}>{temp.name}</td>
                          <td className="px-2 md:px-3 py-3 text-gray-500 text-[13px] font-medium hidden sm:table-cell truncate" title={temp.updated}>{temp.updated}</td>
                          <td className="px-2 md:px-3 py-3"><span className="inline-block max-w-full truncate px-2 py-1 rounded-md text-xs font-semibold bg-blue-50 text-blue-600" title={temp.category || 'General'}>{temp.category || 'General'}</span></td>
                          <td className="px-2 md:px-3 py-3 text-center">
                              <div className="flex flex-col items-center gap-1">
                                <div className="flex items-center justify-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${temp.status === 'Approved' ? 'bg-green-500' : (temp.status === 'Rejected' || temp.status === 'Blocked') ? 'bg-red-500' : 'bg-yellow-500'}`}></div>
                                    <span className="text-[13px] font-semibold text-gray-700">{temp.status || 'Pending'}</span>
                                </div>
                                {(temp.status === 'Rejected' || temp.status === 'Blocked') && temp.rejectedReason && (() => {
                                  const info = getRejectionInfo(temp.rejectedReason);
                                  return (
                                    <span
                                      className="inline-block max-w-[130px] truncate text-[10px] font-semibold text-red-600 bg-red-50 border border-red-100 rounded px-1.5 py-0.5 cursor-help"
                                      title={`${info.label}: ${info.description}`}
                                    >
                                      {info.label}
                                    </span>
                                  );
                                })()}
                              </div>
                          </td>
                          <td className="px-2 md:px-3 py-3 text-center">
                              <span className={`inline-block max-w-full truncate text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${temp.source === 'whatsapp' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                {temp.source || 'local'}
                              </span>
                          </td>
                          <td className="px-2 md:px-3 py-3">
                              <div className="flex items-center justify-center gap-3">
                                  <button 
                                      onClick={(e) => { 
                                        e.stopPropagation();
                                        navigate('/admin/templates/create', { state: { isEditing: true, templateData: temp } });
                                      }} 
                                      className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                      title="Edit template"
                                  >
                                      <Pencil size={18} />
                                  </button>
                                  <button 
                                      onClick={(e) => { 
                                        e.stopPropagation(); 
                                        if (isLimitReached) {
                                          setUpgradeModal({
                                            isOpen: true,
                                            featureName: 'Templates',
                                            message: `You have reached your limit of ${templateLimit} templates on the ${currentPlanCapitalized} plan. Upgrade your plan to duplicate and create more templates!`
                                          });
                                          return;
                                        }
                                        navigate('/admin/templates/create', { state: { isEditing: false, isDuplicate: true, templateData: temp } }); 
                                      }} 
                                      className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all cursor-pointer" 
                                      title="Duplicate template"
                                  >
                                      <Copy size={18} />
                                  </button>
                                  <button onClick={(e) => handleDeleteClick(e, temp.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Delete template">
                                      <Trash2 size={18} />
                                  </button>
                              </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <Pagination
                  currentPage={currentPage}
                  totalPages={Math.max(1, Math.ceil(filteredTemplates.length / rowsPerPage))}
                  rowsPerPage={rowsPerPage}
                  totalCount={filteredTemplates.length}
                  onPageChange={setCurrentPage}
                  onRowsChange={n => { setRowsPerPage(n); setCurrentPage(1); }}
                />
              </>
            )}
          </div>
        </div>
        
        <div className="w-full lg:w-[295px] bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col shadow-sm">
            <div className="flex-1 flex items-center justify-center p-3 sm:p-4 bg-gradient-to-br from-gray-50 to-gray-100/50">
              <MobilePreview 
                name={selectedTemplate?.name || '/template'} 
                headerType={selectedTemplate?.headerType || 'None'}
                headerMediaUrl={selectedTemplate?.headerMediaUrl || ''}
                footerText={selectedTemplate?.footerText || ''}
                buttons={selectedTemplate?.buttons || []}
                body={selectedTemplate?.bodyText || 'Your template message preview appears here.'} 
              />
            </div>
            
            {/* Rejection reason info box */}
            {(selectedTemplate?.status === 'Rejected' || selectedTemplate?.status === 'Blocked') && selectedTemplate?.rejectedReason && (() => {
              const info = getRejectionInfo(selectedTemplate.rejectedReason);
              return (
                <div className="mx-3 mb-2 p-3 bg-red-50 border border-red-200 rounded-xl">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span className="text-base">⛔</span>
                    <p className="text-[11px] font-bold text-red-700 uppercase tracking-wide">{info.label}</p>
                    <span className="text-[9px] font-mono text-red-400 ml-auto">{selectedTemplate.rejectedReason}</span>
                  </div>
                  <p className="text-[11px] text-red-600 leading-snug">{info.description}</p>
                </div>
              );
            })()}
            <div className="px-6 py-3 border-t border-gray-100 bg-gray-50/50">
              <p className="text-[10px] text-gray-400 text-center font-medium">
                Preview simulates actual WhatsApp appearance
              </p>
            </div>
        </div>
      </div>
    );
  }

  return null; 
};

const MobilePreview = ({ name, body, headerType, headerMediaUrl = '', footerText, buttons=[] }) => {
  const isMedia = headerType && ['Image', 'Video', 'Document'].includes(headerType);
  const isTextHeader = headerType === 'Text';
  const previewName = name || 'Business Update';
  const formattedBody = formatWhatsAppMarkdown(body);

  return (
  <div className="relative w-full max-w-[215px] sm:max-w-[245px] aspect-[245/500] mx-auto bg-gradient-to-b from-[#0b1118] via-[#111b24] to-[#0b1118] rounded-[2.25rem] sm:rounded-[2.75rem] border-[7px] sm:border-[9px] border-[#0a0f14] shadow-[0_28px_48px_-16px_rgba(0,0,0,0.45)] overflow-hidden font-sans flex flex-col">
    <div className="absolute inset-x-0 top-0 h-6 sm:h-7 bg-gradient-to-b from-black/40 to-transparent z-20 pointer-events-none" />
    <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-20 sm:w-24 h-4.5 sm:h-5 bg-black rounded-full z-30 border border-white/10" />
    <div className="h-full bg-[#e7ddd1] pt-7 sm:pt-8 relative flex flex-col">
      <div className="absolute inset-0 opacity-[0.22] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 24px 24px, #c7bbb0 1.2px, transparent 1.2px)', backgroundSize: '22px 22px' }}></div>
      <div className="absolute top-1.5 sm:top-2 inset-x-0 z-40 px-4 sm:px-5 flex items-center justify-between text-[10px] sm:text-[11px] font-semibold text-[#0b1118] pointer-events-none">
        <span>9:41</span>
        <div className="flex items-center gap-1.5 text-[#1f2937]">
          <span>5G</span>
          <span className="inline-flex items-center gap-[2px]">
            <span className="w-1 h-1 rounded-full bg-[#1f2937]" />
            <span className="w-1 h-1 rounded-full bg-[#1f2937]" />
            <span className="w-1 h-1 rounded-full bg-[#1f2937]" />
          </span>
        </div>
      </div>

      <div className="relative z-10 bg-[#0b6a61] px-3 sm:px-3.5 py-1.5 sm:py-2 flex items-center gap-2 sm:gap-2.5 shadow-lg shrink-0">
        <button className="text-white/90 text-base leading-none" type="button" aria-label="Back">
          <ChevronLeft size={16} />
        </button>
        <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-[#14b8a6] to-[#0f766e] rounded-full flex items-center justify-center border border-white/20 shrink-0">
          <span className="text-white text-[11px] sm:text-xs font-bold">MB</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white text-[11px] sm:text-[12px] font-bold leading-tight truncate">Your Business</p>
          <p className="text-white/80 text-[9px] sm:text-[10px] font-medium">verified business</p>
        </div>
        <div className="flex gap-2.5 text-white/90 text-sm items-center">
          <Video size={14} />
          <Phone size={14} />
        </div>
      </div>

      <div className="relative z-10 p-2.5 sm:p-3 overflow-y-auto flex-1 pb-10 sm:pb-11 no-scrollbar">
        <div className="bg-white rounded-2xl rounded-tl-md shadow-[0_12px_24px_-14px_rgba(15,23,42,0.65)] overflow-hidden max-w-[95%] border border-[#eef1f4]">
          {isMedia && (
            <>
              {headerType === 'Image' && headerMediaUrl ? (
                <div className="w-full flex items-center justify-center bg-slate-900/5 min-h-[110px] max-h-[220px] overflow-hidden border-b border-gray-200/70">
                  <img
                    src={headerMediaUrl}
                    alt={`${name || 'template'} header`}
                    className="h-auto max-h-[220px] w-full object-contain"
                  />
                </div>
              ) : headerType === 'Video' && headerMediaUrl ? (
                <div className="w-full flex items-center justify-center bg-black min-h-[110px] max-h-[220px] overflow-hidden border-b border-gray-200/70">
                  <video
                    src={headerMediaUrl}
                    className="h-auto max-h-[220px] w-full object-contain"
                    autoPlay
                    muted
                    loop
                    playsInline
                  />
                </div>
              ) : headerType === 'Document' && headerMediaUrl ? (
                <div className="h-28 sm:h-36 w-full border-b border-gray-200/70 bg-red-50 flex flex-col items-center justify-center gap-1.5">
                  <span className="text-xl">📄</span>
                  <span className="text-[9px] font-semibold text-red-700 uppercase tracking-wide">Document</span>
                  <span className="text-[8px] text-red-500 font-medium">Uploaded file preview</span>
                </div>
              ) : (
                <div className="h-28 sm:h-36 bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col items-center justify-center text-gray-300 gap-1.5 border-b border-gray-200/70">
                  <ImageIcon size={32} className="opacity-30"/>
                  <span className="text-[8px] font-bold text-gray-400 uppercase tracking-wider">{headerType}</span>
                </div>
              )}
            </>
          )}
          <div className="p-2.5 sm:p-3">
            {isTextHeader && (
              <p className="text-[12px] sm:text-[13px] text-gray-900 font-bold mb-1 leading-tight">{previewName}</p>
            )}
            {!isTextHeader && (
              <p className="text-[8px] sm:text-[9px] text-gray-400 font-bold mb-1.5 uppercase tracking-tight opacity-75 break-all leading-tight">{previewName}</p>
            )}
            <div className="text-[11px] sm:text-[13px] text-gray-800 font-medium leading-relaxed whitespace-pre-line" dangerouslySetInnerHTML={{ __html: formattedBody }}></div>
            {footerText && (
              <p className="text-[9px] sm:text-[10px] text-gray-400 font-medium mt-1.5 leading-tight">{footerText}</p>
            )}
            <div className="flex items-center justify-end gap-1 mt-1.5">
              <span className="text-[8px] text-gray-400 font-medium">12:30 PM</span>
              <CheckCheck size={11} className="text-[#34b7f1]" />
            </div>
          </div>
          {buttons && buttons.length > 0 && buttons.map((btn, idx) => (
            <div key={idx} className="bg-gray-50 p-2 border-t border-gray-100">
               <button className="text-sm text-[#008069] font-bold flex items-center justify-center gap-2 w-full py-2.5 md:py-3 bg-white rounded-xl shadow-sm border border-gray-100 hover:bg-[#f8fffd] transition-colors">
                  {btn.type === 'Visit Website' || btn.type === 'Visit website' ? <span className="text-[14px]">↗</span> : 
                   btn.type === 'Call phone number' ? <span className="text-[14px]">📞</span> :
                   btn.type === 'Copy offer code' ? <span className="text-[14px]">📋</span> : 
                   <span className="text-[14px]">↩️</span>}
                  {btn.text || 'Action Button'}
               </button>
            </div>
          ))}
        </div>
      </div>
      <div className="relative z-10 px-2 sm:px-2.5 pb-2 sm:pb-2.5">
        <div className="bg-white/95 backdrop-blur rounded-full border border-white/70 shadow-sm px-3 py-2 min-h-[36px] sm:min-h-[40px] flex items-center gap-2">
          <Smile size={15} className="text-gray-400" />
          <span className="text-[11px] sm:text-[12px] text-gray-400 font-medium flex-1">Type a message</span>
          <Paperclip size={15} className="text-gray-400" />
          <span className="text-white bg-[#00a884] w-6 h-6 sm:w-6.5 sm:h-6.5 rounded-full inline-flex items-center justify-center">
            <Send size={11} />
          </span>
        </div>
      </div>
    </div>
  </div>
)};

export default Templates;
