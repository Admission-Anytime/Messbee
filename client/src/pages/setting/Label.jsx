import React, { useState, useEffect, useContext } from 'react';
import { getAllLabels, createLabel, updateLabel, deleteLabel } from '../../services/LabelApi';
import { Tag } from 'lucide-react';
import { toast } from 'react-toastify';
import ErrorState from '../../components/ui/ErrorState';
import { userContext } from '../../context/Context';
import { PLAN_LIMITS } from '../../utils/planLimits';

const Label = () => {
  const { user } = useContext(userContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLabel, setEditingLabel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Plan based limit
  const currentPlan = (user?.subscriptionPlan || 'free').toLowerCase();
  const PLAN_LIMIT = PLAN_LIMITS[currentPlan]?.labels || PLAN_LIMITS.free.labels; 
  
  // --- DELETE MODAL STATE ---
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [labelToDelete, setLabelToDelete] = useState(null);
  
  const [labelName, setLabelName] = useState('');
  const [labelDesc, setLabelDesc] = useState('');
  const [selectedColor, setSelectedColor] = useState('#EF4444'); 

  const colorPalette = [
    '#EF4444', '#F97316', '#F59E0B', '#10B981', '#3B82F6', '#6366F1',
    '#A855F7', '#F43F5E', '#334155', '#14B8A6', '#06B6D4', '#D946EF'
  ];

  const [labels, setLabels] = useState([]);

  // Fetch labels on component mount
  useEffect(() => {
    fetchLabels();
  }, []);

  const fetchLabels = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllLabels();
      // Ensure data is always an array before setting state
      setLabels(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch labels:', error);
      setError(error.response?.data?.message || 'Failed to load labels');
      toast.error('❌ Failed to load labels');
      // Reset to empty array on error
      setLabels([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (label = null) => {
    if (!label && labels.length >= PLAN_LIMIT) {
      return toast.warning(`⚠️ Limit Reached: You can only create up to ${PLAN_LIMIT} labels`);
    }
    if (label) {
      setEditingLabel(label);
      setLabelName(label.name);
      setLabelDesc(label.desc);
      setSelectedColor(label.color);
    } else {
      setEditingLabel(null);
      setLabelName('');
      setLabelDesc('');
      setSelectedColor('#EF4444');
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!labelName.trim()) return toast.warning('⚠️ Please enter a label name');
    if (labelName.length > 25) return toast.warning('⚠️ Label name cannot exceed 25 characters');
    
    try {
      const labelData = {
        name: labelName,
        desc: labelDesc,
        color: selectedColor,
        isSystem: false
      };

      if (editingLabel) {
        // Update existing label
        await updateLabel(editingLabel._id, labelData);
        await fetchLabels(); // Refresh the list
        toast.success('Label updated successfully');
      } else {
        // Create new label
        await createLabel(labelData);
        await fetchLabels(); // Refresh the list
        toast.success('Label created successfully');
      }
      closeModal();
    } catch (error) {
      console.error('Failed to save label:', error);
      toast.error(`❌ ${error.response?.data?.message || 'Failed to save label'}`);
    }
  };

  const confirmDelete = (label) => {
    setLabelToDelete(label);
    setIsDeleteModalOpen(true);
  };

  const executeDelete = async () => {
    try {
      await deleteLabel(labelToDelete._id);
      await fetchLabels(); // Refresh the list
      setIsDeleteModalOpen(false);
      setLabelToDelete(null);
    } catch (error) {
      console.error('Failed to delete label:', error);
      toast.error(`❌ ${error.response?.data?.message || 'Failed to delete label'}`);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingLabel(null);
  };

  const [filterCategory, setFilterCategory] = useState('All Labels');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const ROWS_OPTIONS = [10, 25, 50, 100];

  const filteredLabels = labels.filter(l => {
    const matchesSearch = 
      (l.name && l.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (l.desc && l.desc.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (l.creator && l.creator.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;
    if (filterCategory === 'With Description') return !!l.desc;
    if (filterCategory === 'No Description') return !l.desc;
    return true;
  });

  const totalPages = Math.ceil(filteredLabels.length / rowsPerPage) || 1;
  const pagedLabels = filteredLabels.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const getPages = () => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages = [1];
    if (currentPage > 3) pages.push("...");
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) pages.push(i);
    if (currentPage < totalPages - 2) pages.push("...");
    pages.push(totalPages);
    return pages;
  };

  const startIdx = filteredLabels.length === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1;
  const endIdx = Math.min(currentPage * rowsPerPage, filteredLabels.length);

  // Show error state if error occurred
  if (error && !loading) {
    return <ErrorState onRetry={fetchLabels} message={error} />;
  }

  return (
    <div className="font-sans bg-gradient-to-b from-slate-50 via-[#f8fbf8] to-[#f6faf7] min-h-screen p-4 sm:p-5 xl:p-7 box-border">
      <div className="max-w-[1800px] mx-auto">
      {/* Header */}
        <div className="flex items-start justify-between mb-4 gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-center">
              <Tag className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight leading-tight">Labels</h1>
              <p className="text-sm text-gray-500 mt-1">Manage and organise contact labels from one place.</p>
            </div>
          </div>
          <div className="flex gap-2.5 flex-wrap items-center">
            <div className={`px-4 py-2 bg-white border rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-colors ${labels.length >= PLAN_LIMIT ? 'border-red-200 text-red-600 bg-red-50' : 'border-gray-200 text-slate-600'}`}>
              <span className={`w-2 h-2 rounded-full ${labels.length >= PLAN_LIMIT ? 'bg-red-500' : 'bg-emerald-500'}`}></span>
              Labels: {labels.length}/{PLAN_LIMIT}
            </div>
            <button
              id="btn-add-label"
              onClick={() => handleOpenModal()}
              disabled={labels.length >= PLAN_LIMIT}
              className={`flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-[13px] font-bold transition-all shadow-md active:translate-y-px ${
                labels.length >= PLAN_LIMIT
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none'
                  : 'bg-[#10B981] hover:bg-[#059669] text-white'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
              Add Labels
            </button>
          </div>
        </div>

      {/* Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-10 flex flex-col justify-between min-h-[420px]">
        {/* Filter bar */}
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/90 flex items-center justify-between px-4 sm:px-5 py-3.5 border-b border-gray-100 gap-3 flex-wrap rounded-t-2xl">
          <div className="flex items-center gap-2.5 flex-wrap flex-1 min-w-0">
            <span className="text-sm text-gray-500 font-medium">Filter:</span>
            <div className="relative">
              <select
                value={filterCategory}
                onChange={e => { setFilterCategory(e.target.value); setCurrentPage(1); }}
                className="appearance-none pl-3 pr-8 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-700 font-medium bg-white cursor-pointer outline-none focus:border-green-400 transition-colors shadow-sm"
              >
                <option>All Labels</option>
                <option>With Description</option>
                <option>No Description</option>
              </select>
              <svg className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
              </svg>
            </div>
          </div>
          <div className="relative w-full sm:w-72 xl:w-60 xl:ml-auto">
            <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
            <input
              type="text"
              placeholder="Search labels..."
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="pl-8 pr-8 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 w-full outline-none focus:border-green-400 transition-colors shadow-sm"
            />
            {searchQuery && (
              <button
                onClick={() => { setSearchQuery(""); setCurrentPage(1); }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500"
                title="Clear search"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Name</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Colour</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Created By</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-5"><div className="h-4 bg-gray-100 animate-pulse rounded w-24" /></td>
                    <td className="px-6 py-5"><div className="h-4 bg-gray-100 animate-pulse rounded w-full" /></td>
                    <td className="px-6 py-5"><div className="h-4 bg-gray-100 animate-pulse rounded w-16" /></td>
                    <td className="px-6 py-5"><div className="h-4 bg-gray-100 animate-pulse rounded w-24" /></td>
                    <td className="px-6 py-5"><div className="h-4 bg-gray-100 animate-pulse rounded w-12 mx-auto" /></td>
                  </tr>
                ))
              ) : filteredLabels.length === 0 ? (
                <tr>
                  <td colSpan={5} className="h-[480px] text-center text-slate-400 text-sm align-middle">
                    {searchQuery ? "No matching labels found." : "No labels found. Add one above!"}
                  </td>
                </tr>
              ) : (
                pagedLabels.map((label) => (
                  <tr key={label._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-5">
                      <span 
                        className="px-2.5 py-1 rounded-md text-[13px] font-black border"
                        style={{ 
                          backgroundColor: label.color ? `${label.color}15` : '#F3F4F6',
                          color: label.color || '#374151',
                          borderColor: label.color ? `${label.color}30` : '#E5E7EB'
                        }}
                      >
                        {label.name}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-gray-500 text-[13px] font-medium leading-relaxed truncate max-w-xs" title={label.desc}>{label.desc || '-'}</div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 w-fit px-2 py-1 bg-white border border-gray-200 rounded text-xs font-mono text-gray-500">
                        <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: label.color }}></span>
                        {label.color}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        {(label.avatar || (user && label.creator === user.name && user.avatar)) ? (
                          <img src={label.avatar || user.avatar} alt="" className="w-6 h-6 rounded-full" />
                        ) : (
                          <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-[9px] font-black text-gray-500 border border-gray-200">
                            {label.creator ? label.creator.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '??'}
                          </div>
                        )}
                        <span className="text-sm font-bold text-slate-700">{label.creator}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex justify-center items-center gap-2">
                        <button onClick={() => handleOpenModal(label)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                          </svg>
                        </button>
                        <button onClick={() => confirmDelete(label)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Contact-Style Pagination */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50 flex-wrap gap-2 font-sans shrink-0">
          <span className="text-sm text-gray-500">Total labels: <strong className="text-gray-900">{filteredLabels.length}</strong></span>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-gray-500">Rows per page:</span>
            <select
              value={rowsPerPage}
              onChange={e => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1); }}
              className="border border-gray-200 rounded-md text-sm text-gray-700 px-2 py-1 cursor-pointer outline-none focus:border-green-400 bg-white"
            >
              {ROWS_OPTIONS.map(n => <option key={n}>{n}</option>)}
            </select>
            <span className="text-sm text-gray-500 min-w-[90px] text-center">{startIdx}–{endIdx} of {filteredLabels.length}</span>
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="p-1.5 border border-gray-200 rounded-md text-gray-500 hover:border-green-400 hover:text-green-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors bg-white"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
              </svg>
            </button>
            <div className="flex gap-1">
              {getPages().map((p, i) =>
                p === "..."
                  ? <span key={`d${i}`} className="px-2 py-1 text-sm text-gray-400">…</span>
                  : <button
                    key={p}
                    onClick={() => setCurrentPage(p)}
                    className={`min-w-[32px] px-2 py-1 border rounded-md text-sm font-medium transition-all ${p === currentPage ? "bg-green-500 text-white border-green-500 font-bold" : "bg-white text-gray-500 border-gray-200 hover:border-green-400 hover:text-green-700"}`}
                  >
                    {p}
                  </button>
              )}
            </div>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="p-1.5 border border-gray-200 rounded-md text-gray-500 hover:border-green-400 hover:text-green-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors bg-white"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      </div>

      {/* --- ADD/EDIT MODAL (RESPONSIVE) --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[440px] max-h-[90vh] overflow-y-auto animate-in zoom-in duration-200">
            <div className="sticky top-0 bg-white flex justify-between items-center px-6 py-4 border-b z-10">
              <h2 className="text-[17px] font-bold text-gray-800">{editingLabel ? 'Edit Label' : 'Add New Label'}</h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 text-2xl font-light transition-colors leading-none">&times;</button>
            </div>
            
            <div className="p-6 space-y-5">
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-[13px] font-bold text-gray-700">Label Name</label>
                  <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">{labelName.length} / 25</span>
                </div>
                <input id="input-label-name" type="text" value={labelName} onChange={(e) => setLabelName(e.target.value)} maxLength={25} placeholder="e.g. VIP Customer" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all outline-none text-sm font-medium bg-gray-50/30" />
              </div>

              <div>
                <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Description</label>
                <textarea id="textarea-label-desc" rows="3" value={labelDesc} onChange={(e) => setLabelDesc(e.target.value)} placeholder="Add a description for this label..." className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all outline-none text-sm font-medium resize-none bg-gray-50/30 leading-relaxed" />
              </div>

              <div>
                <label className="block text-[13px] font-bold text-gray-700 mb-4">Label Colour</label>
                <div className="grid grid-cols-6 gap-3 mb-6">
                  {colorPalette.map((color) => (
                    <button key={color} onClick={() => setSelectedColor(color)} className={`aspect-square rounded-full transition-transform active:scale-95 flex items-center justify-center ${selectedColor === color ? 'ring-2 ring-offset-2 ring-emerald-500 scale-110 shadow-sm' : 'hover:scale-105 shadow-inner'}`} style={{ backgroundColor: color }} />
                  ))}
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 flex items-center border border-gray-200 rounded-xl px-4 py-2.5 bg-gray-50 focus-within:border-emerald-500 transition-colors">
                    <span className="text-gray-400 text-sm font-mono mr-1">#</span>
                    <input type="text" value={selectedColor.replace('#', '')} onChange={(e) => setSelectedColor(`#${e.target.value}`)} className="bg-transparent w-full outline-none text-sm font-mono font-bold uppercase text-gray-700" />
                  </div>
                  <div className="w-11 h-11 rounded-xl border border-gray-100 shadow-sm transition-colors" style={{ backgroundColor: selectedColor }} />
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-white flex justify-end items-center gap-3 px-6 py-4 border-t">
              <button id="btn-cancel-label" onClick={closeModal} className="text-[13px] font-bold text-gray-500 hover:text-gray-700 transition-colors px-4 py-2">Cancel</button>
              <button id="btn-save-label" onClick={handleSave} className="bg-[#10B981] hover:bg-[#059669] text-white px-6 py-2.5 rounded-xl font-bold text-[13px] transition-all shadow-md active:translate-y-px">Save Label</button>
            </div>
          </div>
        </div>
      )}

      {/* --- CUSTOM DELETE MODAL (RESPONSIVE) --- */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[360px] animate-in zoom-in duration-200 p-6 text-center">
            <div className="w-14 h-14 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-red-100">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </div>
            <h3 className="text-[18px] font-bold text-gray-800 mb-2 leading-tight">Delete Label?</h3>
            <p className="text-[13px] font-medium text-gray-500 mb-8 px-2 leading-relaxed">This will permanently remove the label. Are you sure you want to proceed?</p>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <button id="btn-cancel-delete-label" onClick={() => setIsDeleteModalOpen(false)} className="flex-1 order-2 sm:order-1 px-4 py-2.5 border border-gray-200 rounded-xl text-[13px] font-bold text-gray-600 hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button id="btn-confirm-delete-label" onClick={executeDelete} className="flex-1 order-1 sm:order-2 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-[13px] font-bold transition-all shadow-md active:translate-y-px">
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Label;