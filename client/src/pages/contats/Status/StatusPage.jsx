import React, { useState, useEffect, useContext } from "react";
import { 
  PlusIcon, 
  InformationCircleIcon, 
  PencilSquareIcon,
  TrashIcon,
  XMarkIcon,
  CheckIcon,
  SwatchIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  ExclamationTriangleIcon
} from "@heroicons/react/24/outline";

// Import context
import { userContext } from "../../../context/Context";
import { PLAN_LIMITS } from "../../../utils/planLimits";

// Import the toast utility
import { showToast } from "../../../utils/showToast"; 
// Import the Status API
import { 
  getAllStatuses, 
  createStatus, 
  updateStatus, 
  deleteStatus 
} from "../../../services/StatusApi";
import ErrorState from "../../../components/ui/ErrorState";

const StatusPage = () => {
   // --- STATE ---
  const { user } = useContext(userContext);
  const [statuses, setStatuses] = useState([]); // ✅ Start empty
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const currentPlan = (user?.subscriptionPlan || 'free').toLowerCase();
  const PLAN_LIMIT = PLAN_LIMITS[currentPlan]?.status || PLAN_LIMIT.free.status;
  const usedCount = statuses.length;
  // ✅ NEW: Boolean to easily check if limit is reached
  const isLimitReached = usedCount >= PLAN_LIMIT;

  // --- FETCH STATUSES ON MOUNT ---
  useEffect(() => {
    fetchStatuses();
  }, []);

  const fetchStatuses = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getAllStatuses();
      setStatuses(data);
    } catch (error) {
      console.error('Error fetching statuses:', error);
      setError(error.response?.data?.message || "Failed to load statuses. Please try again.");
      showToast.error("Error", "Failed to load statuses. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- ACTIONS ---
  const openModal = (status = null) => {
    // ✅ NEW: Prevent opening modal if limit reached AND we are trying to add new
    if (!status && isLimitReached) {
      showToast.error("Plan Limit Reached", "You cannot add more than 5 statuses. Please upgrade your plan.");
      return;
    }

    if (status) {
      setIsEditMode(true);
      setCurrentStatus({ ...status });
    } else {
      setIsEditMode(false);
      setCurrentStatus({ name: "", description: "", color: "#3B82F6" });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    
    try {
      if (isEditMode) {
        // Update existing
        const updatedStatus = await updateStatus(currentStatus._id, {
          name: currentStatus.name,
          description: currentStatus.description,
          color: currentStatus.color,
          isActive: currentStatus.isActive
        });
        
        setStatuses(statuses.map(s => s._id === updatedStatus._id ? updatedStatus : s));
        showToast.success("Status Updated", "The status details have been successfully saved.");
      } else {
        // ✅ NEW: Double check limit before saving new status
        if (statuses.length >= PLAN_LIMIT) {
          showToast.error("Limit Exceeded", "You have reached the maximum number of statuses.");
          setIsModalOpen(false);
          return;
        }

        // Create new
        const newStatus = await createStatus({
          name: currentStatus.name,
          description: currentStatus.description,
          color: currentStatus.color,
          isActive: currentStatus.isActive !== undefined ? currentStatus.isActive : true
        });
        
        setStatuses([newStatus, ...statuses]);
        showToast.success("Status Created", "New status has been added to your list.");
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving status:', error);
      
      // Handle limit reached error
      if (error.response?.data?.limitReached) {
        showToast.error("Plan Limit Reached", error.response.data.message);
      } else {
        showToast.error("Error", error.response?.data?.message || "Failed to save status. Please try again.");
      }
    }
  };

  const initiateDelete = (id) => {
    setConfirmDeleteId(id);
  };

  const confirmDelete = async () => {
    if (confirmDeleteId) {
      try {
        await deleteStatus(confirmDeleteId);
        setStatuses(statuses.filter(s => s._id !== confirmDeleteId));
        showToast.success("Status Deleted", "The status has been permanently removed.");
        setConfirmDeleteId(null);
      } catch (error) {
        console.error('Error deleting status:', error);
        showToast.error("Error", error.response?.data?.message || "Failed to delete status. Please try again.");
      }
    }
  };

  const handleCopyColor = (code, id) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    showToast.success("Color Copied", `Color code ${code} copied to clipboard.`);
  };

  const [filterStatusState, setFilterStatusState] = useState('All Statuses');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const ROWS_OPTIONS = [10, 25, 50, 100];

  const filteredStatuses = statuses.filter(s => {
    const matchesSearch =
      (s.name && s.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (s.description && s.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (s.createdBy && s.createdBy.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;
    if (filterStatusState === 'Active') return !!s.isActive;
    if (filterStatusState === 'Inactive') return !s.isActive;
    return true;
  });

  const totalPages = Math.ceil(filteredStatuses.length / rowsPerPage) || 1;
  const pagedStatuses = filteredStatuses.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const getPages = () => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages = [1];
    if (currentPage > 3) pages.push("...");
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) pages.push(i);
    if (currentPage < totalPages - 2) pages.push("...");
    pages.push(totalPages);
    return pages;
  };

  const startIdx = filteredStatuses.length === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1;
  const endIdx = Math.min(currentPage * rowsPerPage, filteredStatuses.length);

  // Show error state if error occurred
  if (error && !isLoading) {
    return <ErrorState onRetry={fetchStatuses} message={error} />;
  }

  return (
    <div className="font-sans bg-gradient-to-b from-slate-50 via-[#f8fbf8] to-[#f6faf7] min-h-screen p-4 sm:p-5 xl:p-7 box-border">
      <div className="max-w-[1800px] mx-auto">
        
        {/* --- HEADER --- */}
        <div className="flex items-start justify-between mb-4 gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight leading-tight">Status</h1>
              <p className="text-sm text-gray-500 mt-1">Define and manage contact lifecycle statuses.</p>
            </div>
          </div>
          <div className="flex gap-2.5 flex-wrap items-center">
            <div className={`px-4 py-2 bg-white border rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-colors ${isLimitReached ? 'border-red-200 text-red-600 bg-red-50' : 'border-gray-200 text-slate-600'}`}>
              <span className={`w-2 h-2 rounded-full ${isLimitReached ? 'bg-red-500' : 'bg-emerald-500'}`}></span>
              Status: {usedCount}/{PLAN_LIMIT}
            </div>
            <button
              id="btn-add-status"
              onClick={() => openModal()}
              disabled={isLimitReached}
              className={`flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-[13px] font-bold transition-all shadow-md active:translate-y-px ${
                isLimitReached
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none'
                  : 'bg-[#10B981] hover:bg-[#059669] text-white'
              }`}
            >
              <PlusIcon className="w-4 h-4 stroke-[3]" /> Add Status
            </button>
          </div>
        </div>

        {/* --- TABLE CARD --- */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-10 min-h-[420px] flex flex-col justify-between">
           {/* Filter bar */}
           <div className="sticky top-0 z-20 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/90 flex items-center justify-between px-4 sm:px-5 py-3.5 border-b border-gray-100 gap-3 flex-wrap rounded-t-2xl">
             <div className="flex items-center gap-2.5 flex-wrap flex-1 min-w-0">
               <span className="text-sm text-gray-500 font-medium">Filter Status:</span>
               <div className="relative">
                 <select
                   value={filterStatusState}
                   onChange={e => { setFilterStatusState(e.target.value); setCurrentPage(1); }}
                   className="appearance-none pl-3 pr-8 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-700 font-medium bg-white cursor-pointer outline-none focus:border-green-400 transition-colors shadow-sm"
                 >
                   <option>All Statuses</option>
                   <option>Active</option>
                   <option>Inactive</option>
                 </select>
                 <ChevronDownIcon className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
               </div>
             </div>
             <div className="relative w-full sm:w-72 xl:w-60 xl:ml-auto">
               <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
               </svg>
               <input
                 type="text"
                 placeholder="Search statuses..."
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
                   <XMarkIcon className="w-4 h-4" />
                 </button>
               )}
             </div>
           </div>

           <div className="flex-1">
             <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 border-b border-gray-100 bg-gray-50/50 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <div className="col-span-3">Name</div>
                <div className="col-span-4">Description</div>
                <div className="col-span-2">Colour</div>
                <div className="col-span-2">Created By</div>
                <div className="col-span-1 text-center">Actions</div>
             </div>

             <div className="divide-y divide-gray-50">
              {isLoading ? (
                 Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="grid grid-cols-1 md:grid-cols-12 gap-4 px-6 py-5 items-center">
                       <div className="col-span-3"><div className="h-4 bg-gray-200 animate-pulse rounded w-24" /></div>
                       <div className="hidden md:block col-span-4"><div className="h-3 bg-gray-200 animate-pulse rounded w-3/4" /></div>
                       <div className="col-span-2"><div className="h-6 bg-gray-200 animate-pulse rounded w-20" /></div>
                       <div className="col-span-2"><div className="h-3 bg-gray-200 animate-pulse rounded w-20" /></div>
                       <div className="col-span-1 flex justify-center gap-2"><div className="h-8 w-8 bg-gray-200 animate-pulse rounded-lg" /><div className="h-8 w-8 bg-gray-200 animate-pulse rounded-lg" /></div>
                    </div>
                 ))
              ) : filteredStatuses.length > 0 ? (
                 pagedStatuses.map((status) => (
                    <div key={status._id} className="grid grid-cols-1 md:grid-cols-12 gap-4 px-6 py-5 items-center hover:bg-slate-50/50 transition-colors group">
                       
                       <div className="col-span-3 flex items-center gap-3">
                          <div className={`w-2.5 h-2.5 rounded-full ${status.isActive ? 'bg-emerald-500' : 'bg-gray-300'}`}></div>
                          <span className="text-sm font-bold text-slate-800">{status.name}</span>
                       </div>

                       <div className="hidden md:block col-span-4">
                          <span className="text-sm text-slate-500 italic">{status.description}</span>
                       </div>

                       <div className="col-span-2 flex items-center gap-3">
                          <button 
                            onClick={() => handleCopyColor(status.color, status._id)}
                            className="flex items-center gap-2 px-2 py-1 bg-white border border-gray-200 rounded text-xs font-mono text-slate-500 hover:border-slate-300 transition-colors"
                            title="Click to copy"
                          >
                             <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: status.color }}></div>
                             {copiedId === status._id ? "Copied!" : status.color}
                          </button>
                       </div>

                       <div className="col-span-2 flex items-center gap-3">
                          <img src={status.avatar} alt="" className="w-6 h-6 rounded-full" />
                          <span className="text-sm font-semibold text-slate-700">{status.createdBy}</span>
                       </div>

                       <div className="col-span-1 flex justify-center items-center gap-2">
                          <button 
                            onClick={() => openModal(status)}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                             <PencilSquareIcon className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => initiateDelete(status._id)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                             <TrashIcon className="w-4 h-4" />
                          </button>
                       </div>
                    </div>
                 ))
              ) : (
                 <div className="h-[480px] flex items-center justify-center text-slate-400 text-sm">
                   {searchQuery ? "No matching statuses found." : "No statuses found. Add one above!"}
                 </div>
              )}
             </div>
           </div>

           {/* Contact-Style Pagination */}
           <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50 flex-wrap gap-2 font-sans shrink-0">
             <span className="text-sm text-gray-500">Total status: <strong className="text-gray-900">{filteredStatuses.length}</strong></span>
             <div className="flex items-center gap-2 flex-wrap">
               <span className="text-sm text-gray-500">Rows per page:</span>
               <select
                 value={rowsPerPage}
                 onChange={e => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                 className="border border-gray-200 rounded-md text-sm text-gray-700 px-2 py-1 cursor-pointer outline-none focus:border-green-400 bg-white"
               >
                 {ROWS_OPTIONS.map(n => <option key={n}>{n}</option>)}
               </select>
               <span className="text-sm text-gray-500 min-w-[90px] text-center">{startIdx}–{endIdx} of {filteredStatuses.length}</span>
               <button
                 onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                 disabled={currentPage === 1}
                 className="p-1.5 border border-gray-200 rounded-md text-gray-500 hover:border-green-400 hover:text-green-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors bg-white"
               >
                 <ChevronLeftIcon className="w-4 h-4" />
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
                 <ChevronRightIcon className="w-4 h-4" />
               </button>
             </div>
           </div>

        </div>
      </div>

      {/* --- ADD/EDIT MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
           <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                 <h3 className="text-lg font-bold text-slate-800">{isEditMode ? "Edit Status" : "Create New Status"}</h3>
                 <button onClick={() => setIsModalOpen(false)}><XMarkIcon className="w-5 h-5 text-slate-400 hover:text-slate-600" /></button>
              </div>
              <form onSubmit={handleSave} className="p-6 space-y-4">
                  <div>
                     <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Name</label>
                     <input id="input-status-name" type="text" required value={currentStatus?.name || ""} onChange={(e) => setCurrentStatus({...currentStatus, name: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none" />
                  </div>
                  <div>
                     <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Description</label>
                     <textarea id="textarea-status-desc" rows="2" value={currentStatus?.description || ""} onChange={(e) => setCurrentStatus({...currentStatus, description: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none resize-none" />
                  </div>
                 <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Color</label>
                    <div className="flex gap-3 flex-wrap">
                       {['#00B050', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6'].map((color) => (
                          <div key={color} onClick={() => setCurrentStatus({...currentStatus, color: color})} className={`w-8 h-8 rounded-full cursor-pointer flex items-center justify-center ${currentStatus.color === color ? 'ring-2 ring-offset-2 ring-emerald-500' : ''}`} style={{ backgroundColor: color }}>{currentStatus.color === color && <CheckIcon className="w-4 h-4 text-white" />}</div>
                       ))}
                       <label className="w-8 h-8 rounded-full border border-gray-200 cursor-pointer flex items-center justify-center hover:bg-gray-50"><input type="color" className="opacity-0 w-0 h-0" onChange={(e) => setCurrentStatus({...currentStatus, color: e.target.value})} /><SwatchIcon className="w-4 h-4 text-slate-400" /></label>
                    </div>
                 </div>
                  <div className="pt-4 flex gap-3">
                     <button id="btn-cancel-status" type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-slate-600 font-bold hover:bg-gray-50">Cancel</button>
                     <button id="btn-save-status" type="submit" className="flex-1 py-2.5 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 shadow-lg shadow-slate-200">{isEditMode ? "Save Changes" : "Create Status"}</button>
                  </div>
              </form>
           </div>
        </div>
      )}

      {/* --- DELETE CONFIRMATION MODAL --- */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
           <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl p-6 text-center animate-in zoom-in-95 duration-200">
              
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
                 <ExclamationTriangleIcon className="w-6 h-6" />
              </div>
              
              <h3 className="text-lg font-bold text-slate-900">Delete Status?</h3>
              <p className="text-sm text-slate-500 mt-2 mb-6 leading-relaxed">
                 Are you sure you want to delete this status? This action cannot be undone.
              </p>
              
              <div className="flex gap-3">
                  <button 
                     id="btn-cancel-delete-status"
                     onClick={() => setConfirmDeleteId(null)} 
                     className="flex-1 py-2.5 rounded-xl border border-gray-200 text-slate-600 font-bold hover:bg-gray-50 transition-colors"
                  >
                     Cancel
                  </button>
                  <button 
                     id="btn-confirm-delete-status"
                     onClick={confirmDelete} 
                     className="flex-1 py-2.5 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 shadow-lg shadow-red-200 transition-colors"
                  >
                     Delete
                  </button>
              </div>

           </div>
        </div>
      )}

    </div>
  );
};

export default StatusPage;