import React, { useState, useEffect } from "react";
import axios from "axios"; // ✅ Import Axios
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
  ExclamationTriangleIcon
} from "@heroicons/react/24/outline";

// Import your custom toast utility
import { showToast } from "../../../utils/showToast"; 
const StatusPage = () => {
   // --- STATE ---
  const [statuses, setStatuses] = useState([]); // ✅ Start empty
  const [isLoading, setIsLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const PLAN_LIMIT = 5;
  const usedCount = statuses.length;
  const isLimitReached = usedCount >= PLAN_LIMIT;

  // --- HELPER: Get Auth Header ---
  const getAuthConfig = () => {
    // ⚠️ Adjust this key ('user') if you store your token differently
    const user = JSON.parse(localStorage.getItem('user'));
    const token = user?.token; 
    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  };

  // --- 1. FETCH DATA (READ) ---
  const fetchStatuses = async () => {
    try {
      const config = getAuthConfig();
      // ✅ Call Backend
      const response = await axios.get("http://localhost:5000/api/status", config);
      setStatuses(response.data);
      setIsLoading(false);
    } catch (error) {
      console.error(error);
      showToast.error("Error", "Failed to load statuses. Please login again.");
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStatuses();
  }, []);

  // --- ACTIONS ---
  const openModal = (status = null) => {
    // Prevent opening if limit reached (Frontend Check)
    if (!status && isLimitReached) {
      showToast.error("Plan Limit Reached", "You cannot add more than 5 statuses. Upgrade plan.");
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

  // --- 2. CREATE & UPDATE ---
  const handleSave = async (e) => {
    e.preventDefault();
    const config = getAuthConfig();

    try {
      if (isEditMode) {
        // --- UPDATE (PUT) ---
        // ✅ Uses _id because MongoDB uses underscores
        const res = await axios.put(
          `http://localhost:5000/api/status/${currentStatus._id}`, 
          currentStatus, 
          config
        );
        
        // Update UI instantly
        setStatuses(statuses.map(s => s._id === currentStatus._id ? res.data : s));
        showToast.success("Updated", "Status details saved successfully.");
      } else {
        // --- CREATE (POST) ---
        // Double check limit
        if (statuses.length >= PLAN_LIMIT) {
           showToast.error("Limit Exceeded", "You have reached the limit of 5 statuses.");
           setIsModalOpen(false);
           return;
        }

        const res = await axios.post(
          "http://localhost:5000/api/status", 
          currentStatus, 
          config
        );

        // Add new status to list
        setStatuses([...statuses, res.data]);
        showToast.success("Created", "New status added successfully.");
      }
      setIsModalOpen(false);
    } catch (error) {
      // Handle backend errors (like duplicate names or limit reached)
      const msg = error.response?.data?.message || "Something went wrong";
      showToast.error("Error", msg);
    }
  };

  // --- 3. DELETE ---
  const initiateDelete = (id) => {
    setConfirmDeleteId(id);
  };

  const confirmDelete = async () => {
    if (confirmDeleteId) {
      try {
        const config = getAuthConfig();
        await axios.delete(`http://localhost:5000/api/status/${confirmDeleteId}`, config);

        // Remove from UI
        setStatuses(statuses.filter(s => s._id !== confirmDeleteId));
        showToast.error("Deleted", "Status has been permanently removed.");
        setConfirmDeleteId(null);
      } catch (error) {
        const msg = error.response?.data?.message || "Delete failed";
        showToast.error("Error", msg);
      }
    }
  };

  const handleCopyColor = (code, id) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    showToast.success("Copied", `Color code ${code} copied.`);
  };

  // --- RENDER ---
  if (isLoading) {
      return <div className="p-10 text-center text-slate-500">Loading your statuses...</div>;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 lg:p-10 font-['Urbanist'] w-full relative">
      <div className="max-w-7xl mx-auto">
        
        {/* --- HEADER --- */}
        <div className="sticky top-0 z-30 bg-[#F8FAFC]/95 backdrop-blur-md -mt-6 -mx-6 px-6 py-4 lg:-mt-10 lg:-mx-10 lg:px-10 lg:py-6 border-b border-gray-200/50 mb-8 flex flex-col md:flex-row justify-between items-center gap-4 transition-all">
           <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900">Status</h1>
              <InformationCircleIcon className="w-5 h-5 text-slate-400 cursor-help" />
           </div>

           <div className="flex items-center gap-4">
              <div className={`px-4 py-2 bg-white border rounded-lg text-xs font-bold flex items-center gap-2 shadow-sm transition-colors ${isLimitReached ? 'border-red-200 text-red-600 bg-red-50' : 'border-gray-200 text-slate-600'}`}>
                 <span className={`w-2 h-2 rounded-full ${isLimitReached ? 'bg-red-500' : 'bg-emerald-500'}`}></span>
                 Status used: {usedCount}/{PLAN_LIMIT}
              </div>

              <button 
                onClick={() => openModal()}
                disabled={isLimitReached}
                className={`px-5 py-2 text-sm font-bold rounded-lg shadow-sm transition-all flex items-center gap-2
                  ${isLimitReached 
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                    : 'bg-[#00B050] hover:bg-[#009b45] text-white shadow-emerald-200'
                  }`}
              >
                 <PlusIcon className="w-5 h-5" /> Add Status
              </button>
           </div>
        </div>

        {/* --- TABLE CARD --- */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-10">
           
           <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 border-b border-gray-100 bg-gray-50/50 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <div className="col-span-3">Name</div>
              <div className="col-span-4">Description</div>
              <div className="col-span-2">Colour</div>
              <div className="col-span-2">Created By</div>
              <div className="col-span-1 text-center">Actions</div>
           </div>

           <div className="divide-y divide-gray-50 min-h-[300px]">
              {statuses.length > 0 ? (
                 statuses.map((status) => (
                    // ✅ KEY CHANGE: Use status._id (MongoDB ID)
                    <div key={status._id} className="grid grid-cols-1 md:grid-cols-12 gap-4 px-6 py-5 items-center hover:bg-slate-50/50 transition-colors group">
                       
                       <div className="col-span-3 flex items-center gap-3">
                          <div className={`w-2.5 h-2.5 rounded-full bg-emerald-500`}></div>
                          <span className="text-sm font-bold text-slate-800">{status.name}</span>
                       </div>

                       <div className="hidden md:block col-span-4">
                          <span className="text-sm text-slate-500 italic">{status.description}</span>
                       </div>

                       <div className="col-span-2 flex items-center gap-3">
                          <button 
                            onClick={() => handleCopyColor(status.color, status._id)}
                            className="flex items-center gap-2 px-2 py-1 bg-white border border-gray-200 rounded text-xs font-mono text-slate-500 hover:border-slate-300 transition-colors"
                          >
                             <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: status.color }}></div>
                             {copiedId === status._id ? "Copied!" : status.color}
                          </button>
                       </div>

                       <div className="col-span-2 flex items-center gap-3">
                          {/* Fallback avatar */}
                          <img src={status.avatar || "https://i.pravatar.cc/150?u=default"} alt="" className="w-6 h-6 rounded-full" />
                          <span className="text-sm font-semibold text-slate-700">{status.createdBy || "You"}</span>
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
                 <div className="p-10 text-center text-slate-400">No statuses found. Add one above!</div>
              )}
           </div>

           <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-white">
              <span className="text-xs font-medium text-slate-400">Showing {usedCount} of {usedCount} status</span>
              <div className="flex items-center gap-1">
                 <button className="p-1.5 rounded-md border border-gray-200 text-slate-400 bg-gray-50 opacity-50 cursor-not-allowed"><ChevronLeftIcon className="w-4 h-4" /></button>
                 <button className="p-1.5 rounded-md border border-gray-200 text-slate-400 bg-gray-50 opacity-50 cursor-not-allowed"><ChevronRightIcon className="w-4 h-4" /></button>
              </div>
           </div>
        </div>
      </div>

      {/* --- MODAL --- */}
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
                    <input type="text" required value={currentStatus?.name || ""} onChange={(e) => setCurrentStatus({...currentStatus, name: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none" />
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Description</label>
                    <textarea rows="2" value={currentStatus?.description || ""} onChange={(e) => setCurrentStatus({...currentStatus, description: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none resize-none" />
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
                    <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-slate-600 font-bold hover:bg-gray-50">Cancel</button>
                    <button type="submit" className="flex-1 py-2.5 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 shadow-lg shadow-slate-200">{isEditMode ? "Save Changes" : "Create Status"}</button>
                 </div>
              </form>
           </div>
        </div>
      )}

      {/* --- DELETE CONFIRMATION --- */}
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
                 <button onClick={() => setConfirmDeleteId(null)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-slate-600 font-bold hover:bg-gray-50 transition-colors">Cancel</button>
                 <button onClick={confirmDelete} className="flex-1 py-2.5 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 shadow-lg shadow-red-200 transition-colors">Delete</button>
              </div>
           </div>
        </div>
      )}

    </div>
  );
};

export default StatusPage;