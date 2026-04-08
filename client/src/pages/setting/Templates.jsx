/* eslint-disable react/prop-types */
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, RotateCw, Image as ImageIcon, Trash2, RefreshCw } from 'lucide-react';
import { toast } from 'react-toastify';
import { fetchWhatsAppTemplates, mergeTemplates, deleteWhatsAppTemplate } from '../../services/TemplateApi';

const Templates = ({ activeTab, }) => {
  const navigate = useNavigate();
  
  // Syncing internal view with Sidebar activeTab
  const [view, setView] = useState('list');

  useEffect(() => {
    if (activeTab === 'create-template') {
      setView('choose');
    } else if (activeTab === 'template-list') {
      setView('list');
    } else if (activeTab === 'template-gallery') {
      setView('gallery'); 
    }
  }, [activeTab]);

  // --- TEMPLATE DATA ---
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filteredTemplates, setFilteredTemplates] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Fetch templates from WhatsApp API only
  const loadTemplates = useCallback(async () => {
    setLoading(true);
    try {
      console.log('📥 [Templates.jsx] Fetching templates from WhatsApp API...');
      
      const whatsappTemplates = await fetchWhatsAppTemplates();
      console.log('📥 [Templates.jsx] WhatsApp response:', whatsappTemplates);
      
      const templatesArray = whatsappTemplates.data?.data || [];
      console.log('📥 [Templates.jsx] Templates array:', templatesArray);
      
      const formatted = mergeTemplates(templatesArray, []);
      console.log('📥 [Templates.jsx] Formatted templates:', formatted);
      
      setTemplates(formatted);
      
      if (formatted.length > 0) {
        setSelectedTemplate((prev) => prev || formatted[0]);
      }
      
      console.log('✅ [Templates.jsx] Templates loaded successfully');
      toast.success('Templates synced from WhatsApp', {
        toastId: 'templates-sync-success',
      });
    } catch (error) {
      console.error('❌ [Templates.jsx] Error loading templates:', error);
      toast.error('Failed to load templates from WhatsApp', {
        toastId: 'templates-sync-error',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

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
      // Only WhatsApp templates (from API) can be deleted via API
      // All templates are now from WhatsApp API
      console.log('🗑️ Deleting WhatsApp template:', { id, name: templateToDelete.name });
      await deleteWhatsAppTemplate(id, templateToDelete.name);
      
      const updatedTemplates = templates.filter(t => t.id !== id);
      setTemplates(updatedTemplates);
      
      if (selectedTemplate?.id === id) {
        setSelectedTemplate(updatedTemplates.length > 0 ? updatedTemplates[0] : null);
      }
      
      setDeleteModal({ isOpen: false, templateId: null, isDeleting: false });
      toast.success("Template deleted successfully from WhatsApp");
      
      // Refresh templates to sync with WhatsApp
      setTimeout(() => {
        loadTemplates();
      }, 1000);
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

  // --- VIEW 1: LIST VIEW ---
  if (view === 'list') {
    return (
      <div className="flex flex-col lg:flex-row h-full w-full bg-[#F9FAFB] p-4 lg:p-6 gap-3 lg:gap-3 overflow-hidden font-sans antialiased relative">
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
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-gray-800">Templates</h1>
              <span className="text-gray-400 cursor-pointer text-lg hover:text-gray-600" title="Templates from WhatsApp API">ⓘ</span>
            </div>
            <div className="flex items-center gap-2 md:gap-3">
              <button 
                onClick={handleSync}
                disabled={loading}
                className="flex items-center gap-2 text-gray-600 border border-gray-200 hover:bg-gray-50 px-3 md:px-4 py-2 rounded-lg transition-all font-semibold text-sm disabled:opacity-50"
              >
                <RotateCw size={16} className={`md:hidden ${loading ? 'animate-spin' : ''}`} />
                <RotateCw size={18} className={`hidden md:block ${loading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">{loading ? 'Syncing...' : 'Sync'}</span>
              </button>
              
              {/* FIXED BUTTON: Ab yeh direct navigation handle  */}
              <button 
                onClick={() => navigate('/admin/templates/create')} 
                className="flex items-center gap-1.5 md:gap-2 bg-[#10B981] hover:bg-[#059669] text-white px-3 md:px-4 py-2 rounded-lg font-semibold text-sm transition-all shadow-sm whitespace-nowrap"
              >
                <Plus size={16} className="md:hidden" />
                <Plus size={18} className="hidden md:block" />
                <span className="hidden sm:inline">Create Template</span>
                <span className="sm:hidden">Create</span>
              </button>
            </div>
          </div>
          
          {/* SEARCH & FILTERS */}
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 mb-6">
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Search templates..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all text-sm font-medium bg-white" 
              />
            </div>
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 md:px-4 py-2.5 border border-gray-200 rounded-lg text-gray-700 bg-white outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all font-semibold text-sm min-w-0"
            >
              <option>All</option>
              <option>Approved</option>
              <option>Pending</option>
              <option>Rejected</option>
            </select>
          </div>

          {/* TABLE */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden bg-white rounded-xl border border-gray-200 shadow-sm">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="flex flex-col items-center gap-2">
                  <RefreshCw size={32} className="text-gray-400 animate-spin" />
                  <p className="text-gray-400 font-medium">Loading templates...</p>
                </div>
              </div>
            ) : filteredTemplates.length === 0 ? (
              <div className="flex items-center justify-center h-64">
                <div className="flex flex-col items-center gap-2">
                  <ImageIcon size={32} className="text-gray-300" />
                  <p className="text-gray-400 font-medium">No templates found</p>
                  <p className="text-gray-300 text-sm">Create one to get started</p>
                </div>
              </div>
            ) : (
              <table className="w-full table-fixed text-left border-collapse">
                <thead className="bg-gray-50/50 sticky top-0 border-b border-gray-200">
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
                  {filteredTemplates.map((temp) => (
                    <tr key={temp.id} onClick={() => setSelectedTemplate(temp)} className={`hover:bg-gray-50/50 cursor-pointer transition-colors ${selectedTemplate?.id === temp.id ? 'bg-green-50/60' : ''}`}>
                      <td className="px-2 md:px-3 py-3 text-sm font-medium text-gray-900 truncate" title={temp.name}>{temp.name}</td>
                      <td className="px-2 md:px-3 py-3 text-gray-500 text-[13px] font-medium hidden sm:table-cell truncate" title={temp.updated}>{temp.updated}</td>
                      <td className="px-2 md:px-3 py-3"><span className="inline-block max-w-full truncate px-2 py-1 rounded-md text-xs font-semibold bg-blue-50 text-blue-600" title={temp.category || 'General'}>{temp.category || 'General'}</span></td>
                      <td className="px-2 md:px-3 py-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${temp.status === 'Approved' ? 'bg-green-500' : temp.status === 'Rejected' ? 'bg-red-500' : 'bg-yellow-500'}`}></div>
                              <span className="text-[13px] font-semibold text-gray-700">{temp.status || 'Pending'}</span>
                          </div>
                      </td>
                      <td className="px-2 md:px-3 py-3 text-center">
                          <span className={`inline-block max-w-full truncate text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${temp.source === 'whatsapp' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                            {temp.source || 'local'}
                          </span>
                      </td>
                      <td className="px-2 md:px-3 py-3">
                          <div className="flex items-center justify-center gap-3">
                              <button onClick={(e) => handleDeleteClick(e, temp.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Delete template">
                                  <Trash2 size={18} />
                              </button>
                          </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
        
        {/* RIGHT PREVIEW */}
        <div className="w-full lg:w-[320px] bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col shadow-sm">

            
            {/* Mobile Preview */}
            <div className="flex-1 flex items-center justify-center p-3 sm:p-4 bg-gradient-to-br from-gray-50 to-gray-100/50">
              {selectedTemplate ? (
                  <MobilePreview 
                    name={selectedTemplate?.name} 
                    headerType={selectedTemplate?.headerType || 'None'}
                    footerText={selectedTemplate?.footerText || ''}
                    buttons={selectedTemplate?.buttons || []}
                    body={selectedTemplate?.bodyText || ''} 
                  />
              ) : (
                  <div className="text-center p-10 opacity-40">
                      <ImageIcon className="mx-auto mb-2 text-gray-300" size={40}/>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">No Selection</p>
                  </div>
              )}
            </div>
            
            {/* Preview Footer */}
            <div className="px-6 py-3 border-t border-gray-100 bg-gray-50/50">
              <p className="text-[10px] text-gray-400 text-center font-medium">
                Preview simulates actual WhatsApp appearance
              </p>
            </div>
        </div>
      </div>
    );
  }

  // --- DEFAULT VIEW  ---
  return null; 
};

// --- MOBILE PREVIEW COMPONENT ---
const MobilePreview = ({ name, body, headerType, footerText, buttons=[] }) => {
  const isMedia = headerType && ['Image', 'Video', 'Document'].includes(headerType);
  const isTextHeader = headerType === 'Text';

  return (
  <div className="relative w-[220px] sm:w-[260px] h-[420px] sm:h-[460px] bg-gradient-to-b from-[#0F172A] to-[#1e293b] rounded-[2rem] sm:rounded-[2.5rem] border-[6px] sm:border-[8px] border-[#0F172A] shadow-2xl overflow-hidden font-sans flex flex-col">
    {/* Phone notch */}
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-[#0F172A] rounded-b-2xl z-10"></div>
    
    {/* Screen content */}
    <div className="h-full bg-[#E5DDD5] pt-8 sm:pt-10 relative flex flex-col">
      {/* WhatsApp Header */}
      <div className="bg-[#075E54] px-3 sm:px-4 py-3 sm:py-3.5 flex items-center gap-2 sm:gap-3 shadow-md shrink-0">
        <div className="w-8 h-8 sm:w-9 sm:h-9 bg-white/30 rounded-full flex items-center justify-center">
          <span className="text-white text-xs font-bold">BA</span>
        </div>
        <div className="flex-1">
          <p className="text-white text-[11px] sm:text-[12px] font-bold leading-tight">Business AI</p>
          <p className="text-white/70 text-[8px] sm:text-[9px] font-semibold">online</p>
        </div>
        <div className="flex gap-3 sm:gap-4">
          <div className="w-1 h-1 bg-white/60 rounded-full"></div>
          <div className="w-1 h-1 bg-white/60 rounded-full"></div>
          <div className="w-1 h-1 bg-white/60 rounded-full"></div>
        </div>
      </div>
      
      {/* Chat Area */}
      <div className="p-3 sm:p-4 overflow-y-auto flex-1 pb-14 no-scrollbar">
        <div className="bg-white rounded-xl rounded-tl-sm shadow-md overflow-hidden max-w-[94%]">
          {isMedia && (
            <div className="h-28 sm:h-36 bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col items-center justify-center text-gray-300 gap-1.5 border-b border-gray-200/50">
                <ImageIcon size={32} className="opacity-30"/>
                <span className="text-[8px] font-bold text-gray-400 uppercase tracking-wider">{headerType}</span>
            </div>
          )}
          <div className="p-3 sm:p-3.5">
            {isTextHeader && (
              <p className="text-[12px] sm:text-[14px] text-gray-900 font-bold mb-1.5 leading-tight">{name || 'Header Text'}</p>
            )}
            {!isTextHeader && (
              <p className="text-[8px] sm:text-[9px] text-gray-400 font-bold mb-1.5 uppercase tracking-tight opacity-75 break-all leading-tight">{name}</p>
            )}
            
            {/* Using dangerouslySetInnerHTML to properly render formatting like bold/strikethrough/emojis stored by CreateTemplate */}
            <div className="text-[11px] sm:text-[13px] text-gray-800 font-medium leading-relaxed whitespace-pre-line" dangerouslySetInnerHTML={{ __html: body }}></div>
            
            {footerText && (
              <p className="text-[9px] sm:text-[10px] text-gray-400 font-medium mt-2 leading-tight">{footerText}</p>
            )}

            <div className="flex items-center justify-end gap-1 mt-1">
              <span className="text-[8px] text-gray-400 font-medium">12:30 PM</span>
            </div>
          </div>
          
          {buttons && buttons.length > 0 && buttons.map((btn, idx) => (
            <div key={idx} className="bg-gray-50 p-2 border-t border-gray-100">
               <button className="text-sm text-[#00A884] font-bold flex items-center justify-center gap-2 w-full py-2.5 md:py-3 bg-white rounded-xl shadow-sm border border-gray-100">
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
      
      {/* WhatsApp Bottom Bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-[#F0F0F0] px-3 py-2 border-t border-gray-200/50">
        <div className="bg-white rounded-full px-3 py-2 flex items-center gap-2 shadow-sm">
          <div className="w-5 h-5 rounded-full bg-gray-200/50"></div>
          <div className="flex-1 h-3 bg-gray-100 rounded"></div>
          <div className="w-5 h-5 rounded-full bg-gray-200/50"></div>
        </div>
      </div>
    </div>
  </div>
)};

export default Templates;