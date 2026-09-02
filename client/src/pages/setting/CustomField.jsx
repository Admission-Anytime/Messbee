import { useEffect, useMemo, useState } from "react";
import {
  PencilSquareIcon,
  TrashIcon,
  XMarkIcon,
  LockClosedIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
} from "@heroicons/react/24/outline";
import {
  getCustomFields,
  createCustomField,
  updateCustomField,
  toggleCustomField,
  deleteCustomField,
} from "../../services/CustomfieldApi";
import { showToast } from "../../utils/showToast";
import ErrorState from "../../components/ui/ErrorState";
import { userContext } from "../../context/Context";
import { PLAN_LIMITS } from "../../utils/planLimits";
import { useContext } from "react";

const slugifyKey = (value) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .replace(/_+/g, "_");

// Broadcasts the current fields list to any other mounted page (e.g. ContactsCRM)
// so they update instantly without needing a refresh or polling.
const broadcastFieldsChange = (fields) => {
  window.dispatchEvent(new CustomEvent("customFieldsChanged", { detail: fields }));
};

const FIELD_TYPES = ["Text", "Number", "Date"];
const ITEMS_PER_PAGE = 8;

const getInitials = (name) => {
  if (!name) return "U";
  const parts = name.split(" ");
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.substring(0, 2).toUpperCase();
};

// ─── Reusable toggle switch UI ────────────────────────────────────────────────
function ToggleSwitch({ checked, onChange, title }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 flex-shrink-0 ${
        checked ? "bg-green-500" : "bg-gray-300"
      }`}
      aria-pressed={checked}
      title={title}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}

const CustomFieldsSection = () => {
  const { user } = useContext(userContext);
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Plan based limit
  const currentPlan = (user?.subscriptionPlan || 'free').toLowerCase();
  const PLAN_LIMIT = PLAN_LIMITS[currentPlan]?.customFields || PLAN_LIMITS.free.customFields;
  const isLimitReached = fields.length >= PLAN_LIMIT;

  // ─── Fetch custom fields ──────────────────────────────────────────────────
  const fetchCustomFields = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getCustomFields({ page: 1, limit: 1000 });

      // Add defensive checks to ensure data is an array
      const apiData = response?.data?.data;
      const dataArray = Array.isArray(apiData) ? apiData : [];

      const transformedFields = dataArray.map((field) => ({
        _id: field._id,
        name: field.name,
        description: field.description || "",
        type: field.type,
        key: field.key,
        createdBy: {
          name: field.createdBy?.name || "Unknown",
          initials: getInitials(field.createdBy?.name || "Unknown"),
        },
        isActive: field.isActive,
        // ✅ FIX: map showInContacts from API — default true if missing (legacy fields)
        showInContacts: field.showInContacts !== undefined ? field.showInContacts : true,
      }));

      setFields(transformedFields);
    } catch (err) {
      console.error("Error fetching custom fields:", err);
      setError(err.response?.data?.message || "Failed to load custom fields");
      showToast.error("Error", err.response?.data?.message || "Failed to load custom fields");
      // Reset to empty array on error
      setFields([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCustomFields(); }, []);

  // ─── Search & Pagination ───────────────────────────────────────────────────────────
  const [filterType, setFilterType] = useState('All Types');
  const [searchQuery, setSearchQuery] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const ROWS_OPTIONS = [10, 25, 50, 100];

  const filteredFields = (Array.isArray(fields) ? fields : []).filter(f => {
    const matchesSearch =
      (f.name && f.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (f.description && f.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (f.key && f.key.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (f.type && f.type.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (f.createdBy?.name && f.createdBy.name.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;
    if (filterType !== 'All Types') return f.type?.toLowerCase() === filterType.toLowerCase();
    return true;
  });

  const totalPages  = Math.ceil(filteredFields.length / rowsPerPage) || 1;
  const startIndex  = (currentPage - 1) * rowsPerPage;
  const endIndex    = startIndex + rowsPerPage;
  const currentFields = filteredFields.slice(startIndex, endIndex);

  const startIdx = filteredFields.length === 0 ? 0 : startIndex + 1;
  const endIdx   = Math.min(endIndex, filteredFields.length);

  const getPages = () => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages = [1];
    if (currentPage > 3) pages.push("...");
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) pages.push(i);
    if (currentPage < totalPages - 2) pages.push("...");
    pages.push(totalPages);
    return pages;
  };

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) setCurrentPage(totalPages);
  }, [filteredFields, currentPage, totalPages]);

  // ─── Delete ───────────────────────────────────────────────────────────────
  const [deleteIndex, setDeleteIndex] = useState(null);
  const fieldToDelete = deleteIndex !== null ? fields[deleteIndex] : null;

  const openDeleteModal  = (index) => setDeleteIndex(index);
  const closeDeleteModal = () => setDeleteIndex(null);

  const confirmDelete = async () => {
    if (deleteIndex === null) return;
    const field = fields[deleteIndex];
    try {
      await deleteCustomField(field._id);
      setFields(prev => {
        const next = prev.filter((_, i) => i !== deleteIndex);
        broadcastFieldsChange(next);
        return next;
      });
      showToast.success("Success", "Custom field deleted successfully");
      setDeleteIndex(null);
    } catch (err) {
      console.error("Error deleting custom field:", err);
      showToast.error("Error", err.response?.data?.message || "Failed to delete custom field");
    }
  };

  // ─── Single toggle: controls both isActive AND showInContacts together ───────
  const toggleActive = async (index) => {
    const field = fields[index];
    const newActive = !field.isActive;
    try {
      // Optimistic update both flags at once
      setFields(prev => {
        if (!Array.isArray(prev)) return [];
        const next = prev.map((item, i) =>
          i === index ? { ...item, isActive: newActive, showInContacts: newActive } : item
        );
        broadcastFieldsChange(next);
        return next;
      });
      // 1. Toggle isActive via the toggle endpoint
      await toggleCustomField(field._id);
      // 2. Sync showInContacts to match the new isActive value
      await updateCustomField(field._id, { showInContacts: newActive });
      showToast.success("Success", `Custom field ${newActive ? "activated and shown in Contacts" : "deactivated and hidden from Contacts"}`);
    } catch (err) {
      // Revert both on failure
      setFields(prev => {
        if (!Array.isArray(prev)) return [];
        const next = prev.map((item, i) =>
          i === index ? { ...item, isActive: field.isActive, showInContacts: field.showInContacts } : item
        );
        broadcastFieldsChange(next);
        return next;
      });
      console.error("Error toggling custom field:", err);
      showToast.error("Error", err.response?.data?.message || "Failed to toggle custom field");
    }
  };

  // ─── Create modal ─────────────────────────────────────────────────────────
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [form, setForm] = useState({
    name: "", type: "Text", key: "", description: "", showInContacts: true,
  });

  useEffect(() => {
    setForm(prev => {
      const autoKey    = slugifyKey(prev.name || "");
      const wasAuto    = prev.key === autoKey || prev.key === "";
      const nextAutoKey = slugifyKey(form.name || "");
      if (!wasAuto) return prev;
      return { ...prev, key: nextAutoKey };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.name]);

  // ─── Edit modal ───────────────────────────────────────────────────────────
  const [editIndex, setEditIndex]   = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editForm, setEditForm]     = useState({
    name: "", type: "Text", key: "", description: "", showInContacts: true,
  });

  const openEditModal = (index) => {
    const f = fields[index];
    setEditIndex(index);
    setEditForm({
      name:           f.name || "",
      type:           f.type || "Text",
      key:            f.key || "",
      description:    f.description || "",
      showInContacts: f.showInContacts !== undefined ? f.showInContacts : true,
    });
    setEditKeyManuallyEdited(false);
    setIsEditOpen(true);
  };

  const closeEditModal = () => {
    setIsEditOpen(false);
    setEditIndex(null);
    setEditKeyManuallyEdited(false);
  };

  // Track if user manually edited the key in CREATE form
  const [createKeyManuallyEdited, setCreateKeyManuallyEdited] = useState(false);

  // Track if user manually edited the key in EDIT form
  const [editKeyManuallyEdited, setEditKeyManuallyEdited] = useState(false);

  // auto-generate key in CREATE when typing name (only if user hasn't manually edited)
  useEffect(() => {
    if (!createKeyManuallyEdited) {
      const autoKey = slugifyKey(form.name || "");
      setForm((prev) => ({ ...prev, key: autoKey }));
    }
  }, [form.name, createKeyManuallyEdited]);

  // auto-generate key in EDIT when typing name (only if user hasn't manually edited)
  useEffect(() => {
    if (isEditOpen && !editKeyManuallyEdited) {
      const autoKey = slugifyKey(editForm.name || "");
      setEditForm((prev) => ({ ...prev, key: autoKey }));
    }
  }, [editForm.name, isEditOpen, editKeyManuallyEdited]);

  const existingKeys = useMemo(() => new Set(Array.isArray(fields) ? fields.map((f) => f.key) : []), [fields]);

  const openCreateModal = () => {
    if (isLimitReached) {
      showToast.error("Plan Limit Reached", `You can only create up to ${PLAN_LIMIT} custom fields.`);
      return;
    }
    setForm({ name: "", type: "Text", key: "", description: "", showInContacts: true });
    setCreateKeyManuallyEdited(false);
    setIsCreateOpen(true);
  };
  const closeCreateModal = () => {
    setIsCreateOpen(false);
    setCreateKeyManuallyEdited(false);
  };

  // ─── Validation ───────────────────────────────────────────────────────────
  const validateCreate = () => {
    const name = form.name.trim();
    const key  = slugifyKey(form.key || "");
    if (!name) return { ok: false, msg: "Field name is required." };
    if (!key)  return { ok: false, msg: "Technical key is required." };
    if (existingKeys.has(key)) return { ok: false, msg: "Technical key must be unique." };
    return { ok: true, key, name };
  };

  const validateEdit = () => {
    if (editIndex === null) return { ok: false, msg: "No field selected." };
    const name = editForm.name.trim();
    const key  = slugifyKey(editForm.key || "");
    if (!name) return { ok: false, msg: "Field name is required." };
    if (!key)  return { ok: false, msg: "Technical key is required." };
    const duplicates = fields.some((f, i) => i !== editIndex && f.key === key);
    if (duplicates) return { ok: false, msg: "Technical key must be unique." };
    return { ok: true, name, key };
  };

  const createError = useMemo(() => { const v = validateCreate(); return v.ok ? "" : v.msg; /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [form.name, form.key, fields]);
  const editError   = useMemo(() => { if (!isEditOpen) return ""; const v = validateEdit(); return v.ok ? "" : v.msg; /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [editForm.name, editForm.key, fields, editIndex, isEditOpen]);

  // ─── Create submit ────────────────────────────────────────────────────────
  const handleCreate = async (e) => {
    e.preventDefault();
    const v = validateCreate();
    if (!v.ok) return;
    try {
      const payload = {
        name:           v.name,
        description:    form.description.trim(),
        type:           form.type,
        key:            v.key,
        showInContacts: form.showInContacts, // ✅ send to backend
      };
      const response      = await createCustomField(payload);
      const newField      = response.data.data;
      const transformed   = {
        _id:            newField._id,
        name:           newField.name,
        description:    newField.description || "",
        type:           newField.type,
        key:            newField.key,
        createdBy:      { name: newField.createdBy?.name || "You", initials: getInitials(newField.createdBy?.name || "You") },
        isActive:       newField.isActive,
        showInContacts: newField.showInContacts !== undefined ? newField.showInContacts : form.showInContacts,
      };
      setFields(prev => {
        const next = [transformed, ...prev];
        broadcastFieldsChange(next);
        return next;
      });
      setIsCreateOpen(false);
      setCurrentPage(1);
      showToast.success("Success", "Custom field created successfully");
    } catch (err) {
      console.error("Error creating custom field:", err);
      showToast.error("Error", err.response?.data?.message || "Failed to create custom field");
    }
  };

  // ─── Edit submit ──────────────────────────────────────────────────────────
  const handleEditSave = async (e) => {
    e.preventDefault();
    const v = validateEdit();
    if (!v.ok) return;
    const fieldToUpdate = fields[editIndex];
    try {
      const payload = {
        name:           v.name,
        key:            v.key,
        type:           editForm.type,
        description:    editForm.description.trim(),
        showInContacts: editForm.showInContacts, // ✅ send to backend
      };
      const response    = await updateCustomField(fieldToUpdate._id, payload);
      const updatedField = response.data.data;
      const transformed  = {
        _id:            updatedField._id,
        name:           updatedField.name,
        description:    updatedField.description || "",
        type:           updatedField.type,
        key:            updatedField.key,
        createdBy:      { name: updatedField.createdBy?.name || "Unknown", initials: getInitials(updatedField.createdBy?.name || "Unknown") },
        isActive:       updatedField.isActive,
        showInContacts: updatedField.showInContacts !== undefined ? updatedField.showInContacts : editForm.showInContacts,
      };
      setFields(prev => {
        if (!Array.isArray(prev)) return [transformed];
        const next = prev.map((f, i) => i === editIndex ? transformed : f);
        broadcastFieldsChange(next);
        return next;
      });
      closeEditModal();
      showToast.success("Success", "Custom field updated successfully");
    } catch (err) {
      console.error("Error updating custom field:", err);
      showToast.error("Error", err.response?.data?.message || "Failed to update custom field");
    }
  };

  // ─── ESC closes modals ────────────────────────────────────────────────────
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key !== "Escape") return;
      if (isCreateOpen) closeCreateModal();
      if (isEditOpen)   closeEditModal();
      if (deleteIndex !== null) closeDeleteModal();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isCreateOpen, isEditOpen, deleteIndex]);

  // Show error state if error occurred
  if (error && !loading) {
    return <ErrorState onRetry={fetchCustomFields} message={error} />;
  }

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="font-sans bg-gradient-to-b from-slate-50 via-[#f8fbf8] to-[#f6faf7] min-h-screen p-4 sm:p-5 xl:p-7 box-border antialiased text-gray-900">
      {/* Header */}
      <div className="flex items-start justify-between mb-4 gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 leading-tight">Custom Fields</h1>
          <p className="text-sm text-gray-500 mt-1">Create and manage custom data fields for your contacts.</p>
        </div>
        <div className="flex gap-2.5 flex-wrap items-center">
          <div className={`px-4 py-2 bg-white border rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-colors ${isLimitReached ? 'border-red-200 text-red-600 bg-red-50' : 'border-gray-200 text-slate-600'}`}>
            <span className={`w-2 h-2 rounded-full ${isLimitReached ? 'bg-red-500' : 'bg-emerald-500'}`}></span>
            Custom fields: {fields.length}/{PLAN_LIMIT}
          </div>
          <button
            id="btn-add-custom-field"
            onClick={openCreateModal}
            disabled={isLimitReached}
            className={`flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-[13px] font-bold transition-all shadow-md active:translate-y-px ${isLimitReached ? 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none' : 'bg-[#10B981] hover:bg-[#059669] text-white'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
            Create Custom Field
          </button>
        </div>
      </div>

      {/* Table Section - Added responsive horizontal scroll */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between min-h-[420px] overflow-hidden">
        {/* Filter bar */}
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/90 flex items-center justify-between px-4 sm:px-5 py-3.5 border-b border-gray-100 gap-3 flex-wrap rounded-t-2xl">
          <div className="flex items-center gap-2.5 flex-wrap flex-1 min-w-0">
            <span className="text-sm text-gray-500 font-medium">Filter Type:</span>
            <div className="relative">
              <select
                value={filterType}
                onChange={e => { setFilterType(e.target.value); setCurrentPage(1); }}
                className="appearance-none pl-3 pr-8 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-700 font-medium bg-white cursor-pointer outline-none focus:border-green-400 transition-colors shadow-sm capitalize"
              >
                <option>All Types</option>
                <option value="text">Text</option>
                <option value="number">Number</option>
                <option value="date">Date</option>
                <option value="boolean">Boolean</option>
                <option value="select">Select</option>
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
              placeholder="Search custom fields..."
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

        {loading ? (
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-200">
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Key</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Created By</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-gray-50">
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 animate-pulse rounded w-32" /></td>
                    <td className="px-6 py-4"><div className="h-3 bg-gray-200 animate-pulse rounded w-3/4" /></td>
                    <td className="px-6 py-4"><div className="h-3 bg-gray-200 animate-pulse rounded w-16" /></td>
                    <td className="px-6 py-4"><div className="h-3 bg-gray-200 animate-pulse rounded w-24 font-mono" /></td>
                    <td className="px-6 py-4"><div className="h-3 bg-gray-200 animate-pulse rounded w-20" /></td>
                    <td className="px-6 py-4"><div className="flex justify-end gap-3"><div className="h-4 w-4 bg-gray-200 animate-pulse rounded" /><div className="h-4 w-4 bg-gray-200 animate-pulse rounded" /><div className="h-4 w-4 bg-gray-200 animate-pulse rounded" /></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : filteredFields.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-16 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-lg font-semibold">{searchQuery ? "No matching custom fields" : "No custom fields found"}</p>
            <p className="text-sm">{searchQuery ? "Try a different search query" : "Create your first custom field to get started"}</p>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-200">
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Key</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Created By</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
              {
                Array.isArray(currentFields) && currentFields.map((field, displayIndex) => {
                  const actualIndex = startIndex + displayIndex;
                  return (
                    <tr key={field._id || field.key} className="hover:bg-gray-50/50 transition-colors">

                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900 truncate" title={field.name}>{field.name}</div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="text-gray-500 text-[13px] font-medium leading-relaxed truncate" title={field.description}>{field.description || '-'}</div>
                      </td>

                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 text-xs text-gray-600 bg-gray-100 rounded-md font-semibold">
                          {field.type.toLowerCase()}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600 font-mono truncate" title={field.key}>{field.key}</div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center text-[10px] font-bold text-gray-500 border border-gray-200 flex-shrink-0">
                            {field.createdBy.initials}
                          </div>
                          <span className="text-gray-700 text-[13px] font-semibold truncate" title={field.createdBy.name}>{field.createdBy.name}</span>
                        </div>
                      </td>

                      {/* Single toggle: controls both isActive + showInContacts together */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3 justify-end text-gray-400">
                          <ToggleSwitch
                            checked={field.isActive}
                            onChange={() => toggleActive(actualIndex)}
                            title={field.isActive ? "Active — click to deactivate and hide from Contacts" : "Inactive — click to activate and show in Contacts"}
                          />
                          <button
                            type="button"
                            onClick={() => openEditModal(actualIndex)}
                            className="hover:text-blue-500 transition-colors"
                            title="Edit"
                          >
                            <PencilSquareIcon className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => openDeleteModal(actualIndex)}
                            className="hover:text-red-500 transition-colors"
                            title="Delete"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              }
              </tbody>
            </table>
            </div>

            {/* Contact-Style Pagination */}
            <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50 flex-wrap gap-2 font-sans shrink-0">
              <span className="text-sm text-gray-500">Total custom fields: <strong className="text-gray-900">{filteredFields.length}</strong></span>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm text-gray-500">Rows per page:</span>
                <select
                  value={rowsPerPage}
                  onChange={e => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                  className="border border-gray-200 rounded-md text-sm text-gray-700 px-2 py-1 cursor-pointer outline-none focus:border-green-400 bg-white"
                >
                  {ROWS_OPTIONS.map(n => <option key={n}>{n}</option>)}
                </select>
                <span className="text-sm text-gray-500 min-w-[90px] text-center">{startIdx}–{endIdx} of {filteredFields.length}</span>
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
          </>
        )}
      </div>

      {/* ─── Delete Confirm Modal ─────────────────────────────────────────────── */}
      {deleteIndex !== null && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[70] p-4" role="dialog" aria-modal="true">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[360px] animate-in zoom-in duration-200 p-6 text-center">
            <div className="w-14 h-14 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-red-100">
              <TrashIcon className="h-7 w-7" />
            </div>
            <h3 className="text-[18px] font-bold text-gray-800 mb-2 leading-tight">Delete Custom Field?</h3>
            <p className="text-[13px] font-medium text-gray-500 mb-8 px-2 leading-relaxed">
              {fieldToDelete ? (<>You are about to delete <span className="font-bold text-gray-800">{fieldToDelete.name}</span>. This will also remove it from the Contacts table. This action can't be undone.</>) : "This will permanently remove the custom field. This action can't be undone."}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <button id="btn-cancel-delete-custom-field" type="button" onClick={closeDeleteModal} className="flex-1 order-2 sm:order-1 px-4 py-2.5 border border-gray-200 rounded-xl text-[13px] font-bold text-gray-600 hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button id="btn-confirm-delete-custom-field" type="button" onClick={confirmDelete} className="flex-1 order-1 sm:order-2 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-[13px] font-bold transition-all shadow-md active:translate-y-px">
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Create Modal ─────────────────────────────────────────────────────── */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[440px] max-h-[90vh] overflow-y-auto animate-in zoom-in duration-200">
            <div className="sticky top-0 bg-white flex justify-between items-center px-6 py-4 border-b z-10">
              <h2 className="text-[17px] font-bold text-gray-800">Create Custom Field</h2>
              <button type="button" onClick={closeCreateModal} className="text-gray-400 hover:text-gray-600 text-2xl font-light transition-colors leading-none">&times;</button>
            </div>

            <div className="p-6 space-y-5">
              <form onSubmit={handleCreate} id="createForm">

                <div className="mb-5">
                  <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Field Name</label>
                  <input id="input-custom-field-name" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Order Status" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all outline-none text-sm font-medium bg-gray-50/30" />
                </div>

                <div className="mb-5">
                  <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Field Type</label>
                  <div className="relative">
                    <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))} className="w-full appearance-none border border-gray-200 rounded-xl px-4 py-2.5 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all outline-none text-sm font-medium bg-gray-50/30">
                      {FIELD_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"><ChevronDownIcon className="w-5 h-5" /></div>
                  </div>
                </div>

                <div className="mb-5">
                  <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Technical Key</label>
                  <div className="relative">
                    <input
                      value={form.key}
                      onChange={(e) => {
                        setForm((p) => ({ ...p, key: e.target.value }));
                        setCreateKeyManuallyEdited(true);
                      }}
                      placeholder="order_status"
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 pr-10 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all outline-none font-mono text-sm bg-gray-50/30"
                    />

                    <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <LockClosedIcon className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">Automatically generated based on the field name.</p>
                  {createError && <p className="mt-2 text-sm text-red-600">{createError}</p>}
                </div>

                <div className="mb-5">
                  <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Description</label>
                  <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Briefly explain the purpose of this field" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all outline-none text-sm font-medium resize-none bg-gray-50/30 leading-relaxed min-h-[90px]" />
                </div>

              </form>
            </div>

            <div className="sticky bottom-0 bg-white flex justify-end items-center gap-3 px-6 py-4 border-t">
              <button id="btn-cancel-custom-field" type="button" onClick={closeCreateModal} className="text-[13px] font-bold text-gray-500 hover:text-gray-700 transition-colors px-4 py-2">Cancel</button>
              <button id="btn-save-custom-field" type="submit" form="createForm" disabled={!!createError} className={`px-6 py-2.5 rounded-xl font-bold text-[13px] transition-all shadow-md active:translate-y-px text-white ${createError ? "bg-emerald-300 cursor-not-allowed" : "bg-[#10B981] hover:bg-[#059669]"}`}>Create Field</button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Edit Modal ───────────────────────────────────────────────────────── */}
      {isEditOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[440px] max-h-[90vh] overflow-y-auto animate-in zoom-in duration-200">
            <div className="sticky top-0 bg-white flex justify-between items-center px-6 py-4 border-b z-10">
              <h2 className="text-[17px] font-bold text-gray-800">Edit Custom Field</h2>
              <button type="button" onClick={closeEditModal} className="text-gray-400 hover:text-gray-600 text-2xl font-light transition-colors leading-none">&times;</button>
            </div>

            <div className="p-6 space-y-5">
              <form onSubmit={handleEditSave} id="editForm">

                <div className="mb-5">
                  <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Field Name</label>
                  <input value={editForm.name} onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all outline-none text-sm font-medium bg-gray-50/30" />
                </div>

                <div className="mb-5">
                  <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Field Type</label>
                  <div className="relative">
                    <select value={editForm.type} onChange={e => setEditForm(p => ({ ...p, type: e.target.value }))} className="w-full appearance-none border border-gray-200 rounded-xl px-4 py-2.5 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all outline-none text-sm font-medium bg-gray-50/30">
                      {FIELD_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"><ChevronDownIcon className="w-5 h-5" /></div>
                  </div>
                </div>

                <div className="mb-5">
                  <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Technical Key</label>
                  <input
                    value={editForm.key}
                    onChange={(e) => {
                      setEditForm((p) => ({ ...p, key: e.target.value }));
                      setEditKeyManuallyEdited(true);
                    }}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all outline-none font-mono text-sm bg-gray-50/30"
                  />
                  {editError && <p className="mt-2 text-sm text-red-600">{editError}</p>}
                </div>

                <div className="mb-5">
                  <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Description</label>
                  <textarea value={editForm.description} onChange={e => setEditForm(p => ({ ...p, description: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all outline-none text-sm font-medium resize-none bg-gray-50/30 leading-relaxed min-h-[90px]" />
                </div>

              </form>
            </div>

            <div className="sticky bottom-0 bg-white flex justify-end items-center gap-3 px-6 py-4 border-t">
              <button type="button" onClick={closeEditModal} className="text-[13px] font-bold text-gray-500 hover:text-gray-700 transition-colors px-4 py-2">Cancel</button>
              <button type="submit" form="editForm" disabled={!!editError} className={`px-6 py-2.5 rounded-xl font-bold text-[13px] transition-all shadow-md active:translate-y-px text-white ${editError ? "bg-emerald-300 cursor-not-allowed" : "bg-[#10B981] hover:bg-[#059669]"}`}>Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomFieldsSection;