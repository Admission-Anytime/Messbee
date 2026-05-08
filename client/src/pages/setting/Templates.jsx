/* eslint-disable react/prop-types */
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, RotateCw, Image as ImageIcon, Trash2, RefreshCw, Pencil, Copy, ChevronLeft, Phone, Video, Smile, Paperclip, Send, CheckCheck } from 'lucide-react';
import { toast } from 'react-toastify';
import { fetchWhatsAppTemplates, mergeTemplates, deleteWhatsAppTemplate } from '../../services/TemplateApi';
import { formatWhatsAppMarkdown } from '../../utils/markdownParser';

const Templates = ({ activeTab }) => {
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
      const whatsappTemplates = await fetchWhatsAppTemplates();
      const templatesArray = whatsappTemplates.data?.data || [];
      const formatted = mergeTemplates(templatesArray, []);
      setTemplates(formatted);
      
      if (formatted.length > 0) {
        setSelectedTemplate((prev) => prev || formatted[0]);
      }
      
      toast.success('Templates synced from WhatsApp', {
        toastId: 'templates-sync-success',
      });
    } catch (error) {
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
      await deleteWhatsAppTemplate(id, templateToDelete.name);
      const updatedTemplates = templates.filter(t => t.id !== id);
      setTemplates(updatedTemplates);
      
      if (selectedTemplate?.id === id) {
        setSelectedTemplate(updatedTemplates.length > 0 ? updatedTemplates[0] : null);
      }
      
      setDeleteModal({ isOpen: false, templateId: null, isDeleting: false });
      toast.success("Template deleted successfully from WhatsApp");
      
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
      <div className="flex flex-col lg:flex-row h-full w-full bg-[#F9FAFB] p-3 lg:p-4 gap-3 lg:gap-3 overflow-hidden font-sans antialiased relative">
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
          <div className="flex items-center justify-between mb-4 gap-3">
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-xl font-bold tracking-tight text-gray-800">Templates</h1>
              <span className="text-gray-400 cursor-pointer text-base hover:text-gray-600" title="Templates from WhatsApp API">ⓘ</span>
            </div>
            <div className="flex items-center gap-2 md:gap-3">
              <button 
                onClick={handleSync}
                disabled={loading}
                className="flex items-center gap-2 text-gray-600 border border-gray-200 hover:bg-gray-50 px-3 md:px-3.5 py-1.5 rounded-lg transition-all font-semibold text-[13px] disabled:opacity-50"
              >
                <RotateCw size={14} className={loading ? 'animate-spin' : ''} />
                <span>{loading ? 'Syncing...' : 'Sync'}</span>
              </button>
              
              <button 
                onClick={() => navigate('/admin/templates/create')} 
                className="flex items-center gap-1.5 md:gap-2 bg-[#10B981] hover:bg-[#059669] text-white px-3 md:px-3.5 py-1.5 rounded-lg font-semibold text-[13px] transition-all shadow-sm whitespace-nowrap"
              >
                <Plus size={14} />
                <span>Create Template</span>
              </button>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 md:gap-3 mb-4">
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type="text" 
                placeholder="Search templates..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all text-[13px] font-medium bg-white" 
              />
            </div>
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 md:px-3 py-2 border border-gray-200 rounded-lg text-gray-700 bg-white outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all font-semibold text-[13px] min-w-0"
            >
              <option>All</option>
              <option>Approved</option>
              <option>Pending</option>
              <option>Rejected</option>
              <option>Blocked</option>
            </select>
          </div>

          <div className="flex-1 overflow-y-auto overflow-x-hidden bg-white rounded-xl border border-gray-200 shadow-sm">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="flex flex-col items-center gap-2">
                  <RefreshCw size={32} className="text-gray-400 animate-spin" />
                  <p className="text-gray-400 font-medium">Loading templates...</p>
                </div>
              </div>
            ) : filteredTemplates.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-8 bg-gray-50/30">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
                  {/* Create Card */}
                  <div 
                    onClick={() => navigate('/admin/templates/create')}
                    className="group bg-white p-6 rounded-2xl border-2 border-dashed border-gray-200 hover:border-emerald-500 hover:shadow-xl hover:shadow-emerald-500/5 transition-all cursor-pointer flex flex-col items-center text-center"
                  >
                    <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Plus className="text-emerald-500" size={28} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 mb-1">Create Template</h3>
                    <p className="text-sm text-gray-500">Design a new WhatsApp message template from scratch.</p>
                  </div>

                  {/* Gallery/Import Card */}
                  <div 
                    onClick={() => navigate('/admin/setting/templates-gallery')}
                    className="group bg-white p-6 rounded-2xl border-2 border-dashed border-gray-200 hover:border-emerald-500 hover:shadow-xl hover:shadow-emerald-500/5 transition-all cursor-pointer flex flex-col items-center text-center"
                  >
                    <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <RefreshCw className="text-emerald-500" size={24} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 mb-1">Explore Gallery</h3>
                    <p className="text-sm text-gray-500">Choose from our pre-made industry-standard templates.</p>
                  </div>
                </div>
                
                <div className="mt-10 flex items-center gap-2 text-gray-400 bg-white px-4 py-2 rounded-full border border-gray-100 shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <p className="text-xs font-semibold uppercase tracking-widest">No templates found in your account</p>
                </div>
              </div>
            ) : (
              <table className="w-full table-fixed text-left border-collapse">
                <thead className="bg-white sticky top-0 z-10 border-b border-gray-200">
                  <tr>
                    <th className="px-2 md:px-3 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider w-[25%]">Name</th>
                    <th className="px-2 md:px-3 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider hidden sm:table-cell w-[15%]">Update Date</th>
                    <th className="px-2 md:px-3 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider w-[15%]">Category</th>
                    <th className="px-2 md:px-3 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-center w-[15%]">Status</th>
                    <th className="px-2 md:px-3 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-center w-[12%]">Source</th>
                    <th className="px-2 md:px-3 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-center w-[18%]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredTemplates.map((temp) => (
                    <tr key={temp.id} onClick={() => setSelectedTemplate(temp)} className={`hover:bg-gray-50/50 cursor-pointer transition-colors ${selectedTemplate?.id === temp.id ? 'bg-green-50/60' : ''}`}>
                      <td className="px-2 md:px-3 py-2 text-[13px] font-medium text-gray-900 truncate" title={temp.name}>{temp.name}</td>
                      <td className="px-2 md:px-3 py-2 text-gray-500 text-[12px] font-medium hidden sm:table-cell truncate" title={temp.updated}>{temp.updated}</td>
                      <td className="px-2 md:px-3 py-2"><span className="inline-block max-w-full truncate px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-600" title={temp.category || 'General'}>{temp.category || 'General'}</span></td>
                      <td className="px-2 md:px-3 py-2 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                              <div className={`w-1.5 h-1.5 rounded-full ${temp.status === 'Approved' ? 'bg-green-500' : (temp.status === 'Rejected' || temp.status === 'Blocked') ? 'bg-red-500' : 'bg-yellow-500'}`}></div>
                              <span className="text-[12px] font-semibold text-gray-700">{temp.status || 'Pending'}</span>
                          </div>
                      </td>
                      <td className="px-2 md:px-3 py-2 text-center">
                          <span className={`inline-block max-w-full truncate text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${temp.source === 'whatsapp' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                            {temp.source || 'local'}
                          </span>
                      </td>
                      <td className="px-2 md:px-3 py-2">
                          <div className="flex items-center justify-center gap-2">
                              <button 
                                  onClick={(e) => { 
                                    e.stopPropagation();
                                    navigate('/admin/templates/create', { state: { isEditing: true, templateData: temp } });
                                  }} 
                                  className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                  title="Edit template"
                              >
                                  <Pencil size={16} />
                              </button>
                              <button 
                                  onClick={(e) => { e.stopPropagation(); navigate('/admin/templates/create', { state: { isEditing: false, isDuplicate: true, templateData: temp } }); }} 
                                  className="p-1 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all" 
                                  title="Duplicate template"
                              >
                                  <Copy size={16} />
                              </button>
                              <button onClick={(e) => handleDeleteClick(e, temp.id)} className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Delete template">
                                  <Trash2 size={16} />
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
        
        <div className="w-full lg:w-[320px] xl:w-[350px] bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col shadow-sm">
            <div className="flex-1 flex items-center justify-center p-2 sm:p-3 bg-gradient-to-br from-gray-50 to-gray-100/50">
              <MobilePreview 
                name={selectedTemplate?.name || "Template Preview"} 
                headerType={selectedTemplate?.headerType || 'None'}
                headerMediaUrl={selectedTemplate?.headerMediaUrl || ''}
                footerText={selectedTemplate?.footerText || 'Business Name'}
                buttons={selectedTemplate?.buttons || []}
                body={selectedTemplate?.bodyText || 'Select a template from the list to see how it will appear to your customers on WhatsApp.\n\nYou can also click "Create Template" to start designing your own message.'} 
              />
            </div>
            
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
    <div className="flex flex-col items-center w-full max-w-[240px] mx-auto animate-in fade-in zoom-in-95 duration-500">
      <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">Live Preview</p>
      
      {/* Phone Frame */}
      <div className="relative w-full aspect-[240/460] bg-[#0f172a] rounded-[2.5rem] p-2 shadow-[0_30px_60px_-12px_rgba(15,23,42,0.4)] border-[3px] border-slate-800">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-5 bg-[#0f172a] rounded-b-xl z-20" />
        
        {/* Screen */}
        <div className="w-full h-full bg-[#e8e1d9] rounded-[2rem] overflow-hidden relative flex flex-col pt-8">
          {/* Subtle WhatsApp Pattern Overlay */}
          <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 1.5px 1.5px, #000 1px, transparent 0)', backgroundSize: '20px 20px' }}></div>
          
          <div className="relative z-10 px-2.5 flex-1 flex flex-col">
            {/* Message Bubble */}
            <div className="bg-white rounded-xl rounded-tl-sm shadow-sm border border-black/5 overflow-hidden max-w-[95%] mb-3 animate-in slide-in-from-bottom-4 duration-700">
              {isMedia && (
                <div className="h-28 bg-gray-100 border-b border-gray-100 flex items-center justify-center overflow-hidden">
                   {headerType === 'Image' && headerMediaUrl ? (
                    <img src={headerMediaUrl} alt="header" className="w-full h-full object-cover" />
                  ) : headerType === 'Video' && headerMediaUrl ? (
                    <video src={headerMediaUrl} className="w-full h-full object-cover" autoPlay muted loop />
                  ) : (
                    <div className="flex flex-col items-center text-slate-300">
                      <ImageIcon size={28} />
                      <span className="text-[7px] font-bold mt-1 uppercase tracking-wider">{headerType}</span>
                    </div>
                  )}
                </div>
              )}
              
              <div className="p-2.5">
                {isTextHeader && (
                  <p className="text-[11px] font-bold text-slate-900 mb-1 leading-tight">{previewName}</p>
                )}
                {!isTextHeader && (
                  <p className="text-[8px] font-bold text-slate-400 mb-1.5 uppercase tracking-tight opacity-75">{previewName}</p>
                )}
                <div className="text-[11px] text-slate-800 font-medium leading-relaxed whitespace-pre-line" dangerouslySetInnerHTML={{ __html: formattedBody }}></div>
                {footerText && (
                  <p className="text-[9px] text-slate-400 font-medium mt-1.5 italic">{footerText}</p>
                )}
                <div className="flex items-center justify-end gap-1 mt-1">
                  <span className="text-[8px] text-slate-400 font-medium">10:15 AM</span>
                  <CheckCheck size={11} className="text-[#34b7f1]" />
                </div>
              </div>

              {/* Action Buttons */}
              {buttons && buttons.length > 0 && (
                <div className="border-t border-slate-50">
                  {buttons.map((btn, idx) => (
                    <button key={idx} className="w-full py-2 px-2.5 text-[#06b6d4] text-[12px] font-bold border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors flex items-center justify-center gap-2">
                       {btn.type?.toLowerCase().includes('website') ? '↗' : btn.type?.toLowerCase().includes('call') ? '📞' : '↩️'}
                       {btn.text || 'Action Button'}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* End to End Encryption Label */}
            <div className="mt-auto mb-10 text-center">
              <p className="text-[9px] font-bold text-slate-400/60 uppercase tracking-[0.2em]">End-to-end encrypted</p>
            </div>
          </div>
        </div>
      </div>

      {/* Use this template Button */}
      <button className="mt-5 w-full bg-[#0f172a] hover:bg-slate-800 text-white py-3 rounded-xl font-bold text-[13px] flex items-center justify-center gap-2.5 transition-all shadow-xl shadow-slate-900/10 active:scale-[0.98]">
        Use this template
        <div className="w-4.5 h-4.5 bg-emerald-500 rounded-full flex items-center justify-center">
          <CheckCheck size={10} className="text-white" />
        </div>
      </button>
    </div>
  );
};

export default Templates;
