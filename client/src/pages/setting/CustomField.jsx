import { useEffect, useMemo, useState, useContext } from "react";
import {
  PencilSquareIcon,
  TrashIcon,
  XMarkIcon,
  LockClosedIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  InformationCircleIcon,
  PlusIcon
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

const slugifyKey = (value) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .replace(/_+/g, "_");

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

  const isFreePlan = !user?.subscriptionPlan || user.subscriptionPlan.toLowerCase() === "free";
  const PLAN_LIMIT = 5;

  const fetchCustomFields = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getCustomFields({ page: 1, limit: 1000 });
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
        showInContacts: field.showInContacts !== undefined ? field.showInContacts : true,
      }));

      setFields(transformedFields);
    } catch (err) {
      console.error("Error fetching custom fields:", err);
      setError(err.response?.data?.message || "Failed to load custom fields");
      showToast.error("Error", err.response?.data?.message || "Failed to load custom fields");
      setFields([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCustomFields(); }, []);

  const totalPages  = Math.ceil((fields?.length || 0) / ITEMS_PER_PAGE);
  const startIndex  = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex    = startIndex + ITEMS_PER_PAGE;
  const currentFields = Array.isArray(fields) ? fields.slice(startIndex, endIndex) : [];

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) setCurrentPage(totalPages);
  }, [fields, currentPage, totalPages]);

  const goToNextPage     = () => currentPage < totalPages && setCurrentPage(p => p + 1);
  const goToPreviousPage = () => currentPage > 1 && setCurrentPage(p => p - 1);

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

  const toggleActive = async (index) => {
    const field = currentFields[index];
    const actualIndex = startIndex + index;
    const newActive = !field.isActive;
    try {
      setFields(prev => {
        const next = prev.map((item, i) =>
          i === actualIndex ? { ...item, isActive: newActive, showInContacts: newActive } : item
        );
        broadcastFieldsChange(next);
        return next;
      });
      await toggleCustomField(field._id);
      await updateCustomField(field._id, { showInContacts: newActive });
      showToast.success("Success", `Custom field ${newActive ? "activated" : "deactivated"}`);
    } catch (err) {
      setFields(prev => {
        const next = prev.map((item, i) =>
          i === actualIndex ? { ...item, isActive: field.isActive, showInContacts: field.showInContacts } : item
        );
        broadcastFieldsChange(next);
        return next;
      });
      console.error("Error toggling custom field:", err);
      showToast.error("Error", err.response?.data?.message || "Failed to toggle custom field");
    }
  };

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [form, setForm] = useState({ name: "", type: "Text", key: "", description: "", showInContacts: true });
  const [createKeyManuallyEdited, setCreateKeyManuallyEdited] = useState(false);

  useEffect(() => {
    if (!createKeyManuallyEdited) {
      const autoKey = slugifyKey(form.name || "");
      setForm((prev) => ({ ...prev, key: autoKey }));
    }
  }, [form.name, createKeyManuallyEdited]);

  const [editIndex, setEditIndex]   = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editForm, setEditForm]     = useState({ name: "", type: "Text", key: "", description: "", showInContacts: true });
  const [editKeyManuallyEdited, setEditKeyManuallyEdited] = useState(false);

  const openEditModal = (index) => {
    const f = currentFields[index];
    setEditIndex(startIndex + index);
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

  useEffect(() => {
    if (isEditOpen && !editKeyManuallyEdited) {
      const autoKey = slugifyKey(editForm.name || "");
      setEditForm((prev) => ({ ...prev, key: autoKey }));
    }
  }, [editForm.name, isEditOpen, editKeyManuallyEdited]);

  const existingKeys = useMemo(() => new Set(Array.isArray(fields) ? fields.map((f) => f.key) : []), [fields]);

  const openCreateModal = () => {
    setForm({ name: "", type: "Text", key: "", description: "", showInContacts: true });
    setCreateKeyManuallyEdited(false);
    setIsCreateOpen(true);
  };
  const closeCreateModal = () => {
    setIsCreateOpen(false);
    setCreateKeyManuallyEdited(false);
  };

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

  const createError = useMemo(() => { const v = validateCreate(); return v.ok ? "" : v.msg; }, [form.name, form.key, fields]);
  const editError   = useMemo(() => { if (!isEditOpen) return ""; const v = validateEdit(); return v.ok ? "" : v.msg; }, [editForm.name, editForm.key, fields, editIndex, isEditOpen]);

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
        showInContacts: form.showInContacts,
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
        showInContacts: editForm.showInContacts,
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

  if (error && !loading) {
    return <ErrorState onRetry={fetchCustomFields} message={error} />;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 lg:p-10 font-['Urbanist'] w-full relative">
      <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-[#F8FAFC]/95 backdrop-blur-md -mt-6 -mx-6 px-6 py-4 lg:-mt-10 lg:-mx-10 lg:px-10 lg:py-6 border-b border-gray-200/50 mb-8 flex flex-col md:flex-row justify-between items-center gap-4 transition-all">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-slate-900">Custom Fields</h1>
          <InformationCircleIcon className="w-5 h-5 text-slate-400 cursor-help" />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className={`px-4 py-2 bg-white border rounded-lg text-xs font-bold flex items-center gap-2 shadow-sm transition-colors ${fields.length >= PLAN_LIMIT ? 'border-red-200 text-red-600 bg-red-50' : 'border-gray-200 text-slate-600'}`}>
            <span className={`w-2 h-2 rounded-full ${fields.length >= PLAN_LIMIT ? 'bg-red-500' : 'bg-emerald-500'}`}></span>
            Field used: {fields.length}/{PLAN_LIMIT}
          </div>
          <button 
            onClick={() => {
              if (isFreePlan && fields.length >= PLAN_LIMIT) {
                return showToast.error("Limit Reached", `You can only create up to ${PLAN_LIMIT} custom fields.`);
              }
              openCreateModal();
            }}
            disabled={isFreePlan && fields.length >= PLAN_LIMIT}
            className={`${isFreePlan && fields.length >= PLAN_LIMIT ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-[#00B050] hover:bg-[#009b45] text-white shadow-emerald-200'} px-5 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-all shadow-sm`}
          >
            <PlusIcon className="w-5 h-5" />
            Add Field
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-10 flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-200">
                <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Key</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="border-b border-gray-50">
                    <td className="px-6 py-5"><div className="h-4 bg-gray-100 animate-pulse rounded w-32" /></td>
                    <td className="px-6 py-5"><div className="h-4 bg-gray-100 animate-pulse rounded w-3/4" /></td>
                    <td className="px-6 py-5"><div className="h-4 bg-gray-100 animate-pulse rounded w-16" /></td>
                    <td className="px-6 py-5"><div className="h-4 bg-gray-100 animate-pulse rounded w-24" /></td>
                    <td className="px-6 py-5"><div className="h-4 bg-gray-100 animate-pulse rounded w-12 mx-auto" /></td>
                  </tr>
                ))
              ) : fields.length === 0 ? (
                <tr>
                  <td colSpan={5} className="h-[300px] text-center text-slate-400 text-sm">
                    No custom fields found. Add one above!
                  </td>
                </tr>
              ) : (
                currentFields.map((field, idx) => (
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
                      <div className="flex items-center gap-3 justify-end text-gray-400">
                        <ToggleSwitch
                          checked={field.isActive}
                          onChange={() => toggleActive(idx)}
                          title={field.isActive ? "Active" : "Inactive"}
                        />
                        <button onClick={() => openEditModal(idx)} className="hover:text-blue-500 transition-colors" title="Edit">
                          <PencilSquareIcon className="w-4 h-4" />
                        </button>
                        <button onClick={() => openDeleteModal(startIndex + idx)} className="hover:text-red-500 transition-colors" title="Delete">
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-white">
          <span className="text-xs font-medium text-slate-400">Showing {currentFields.length} of {fields.length} custom field(s)</span>
          <div className="flex items-center gap-1">
            <button onClick={goToPreviousPage} disabled={currentPage === 1} className="p-1.5 rounded-md border border-gray-200 text-slate-400 hover:bg-gray-50 disabled:opacity-50">
              <ChevronLeftIcon className="w-4 h-4" />
            </button>
            <button onClick={goToNextPage} disabled={currentPage === totalPages || totalPages === 0} className="p-1.5 rounded-md border border-gray-200 text-slate-400 hover:bg-gray-50 disabled:opacity-50">
              <ChevronRightIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
      </div>

      {/* Delete Confirm Modal */}
      {deleteIndex !== null && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[360px] p-6 text-center">
            <div className="w-14 h-14 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-red-100">
              <TrashIcon className="h-7 w-7" />
            </div>
            <h3 className="text-[18px] font-bold text-gray-800 mb-2">Delete Custom Field?</h3>
            <p className="text-[13px] font-medium text-gray-500 mb-8 px-2">
              Are you sure you want to delete <span className="font-bold text-gray-800">{fieldToDelete?.name}</span>? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={closeDeleteModal} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-[13px] font-bold text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={confirmDelete} className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-[13px] font-bold">Confirm</button>
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[440px] max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white flex justify-between items-center px-6 py-4 border-b z-10">
              <h2 className="text-[17px] font-bold text-gray-800">Create Custom Field</h2>
              <button onClick={closeCreateModal} className="text-gray-400 hover:text-gray-600 text-2xl font-light">&times;</button>
            </div>
            <div className="p-6 space-y-5">
              <form onSubmit={handleCreate} id="createForm" className="space-y-4">
                <div>
                  <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Field Name</label>
                  <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Order Status" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:border-emerald-500 outline-none text-sm font-medium bg-gray-50/30" />
                </div>
                <div>
                  <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Field Type</label>
                  <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:border-emerald-500 outline-none text-sm font-medium bg-gray-50/30">
                    {FIELD_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Technical Key</label>
                  <input value={form.key} onChange={e => { setForm(p => ({ ...p, key: e.target.value })); setCreateKeyManuallyEdited(true); }} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 font-mono text-sm bg-gray-50/30" />
                  {createError && <p className="mt-1 text-xs text-red-500">{createError}</p>}
                </div>
                <div>
                  <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Description</label>
                  <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium resize-none bg-gray-50/30 min-h-[80px]" />
                </div>
              </form>
            </div>
            <div className="sticky bottom-0 bg-white flex justify-end items-center gap-3 px-6 py-4 border-t">
              <button onClick={closeCreateModal} className="text-sm font-bold text-gray-500">Cancel</button>
              <button type="submit" form="createForm" disabled={!!createError} className={`px-6 py-2.5 rounded-xl font-bold text-sm text-white ${createError ? "bg-emerald-300" : "bg-[#10B981] hover:bg-[#059669]"}`}>Create Field</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[440px] max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white flex justify-between items-center px-6 py-4 border-b z-10">
              <h2 className="text-[17px] font-bold text-gray-800">Edit Custom Field</h2>
              <button onClick={closeEditModal} className="text-gray-400 hover:text-gray-600 text-2xl font-light">&times;</button>
            </div>
            <div className="p-6 space-y-5">
              <form onSubmit={handleEditSave} id="editForm" className="space-y-4">
                <div>
                  <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Field Name</label>
                  <input value={editForm.name} onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:border-emerald-500 outline-none text-sm font-medium bg-gray-50/30" />
                </div>
                <div>
                  <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Field Type</label>
                  <select value={editForm.type} onChange={e => setEditForm(p => ({ ...p, type: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:border-emerald-500 outline-none text-sm font-medium bg-gray-50/30">
                    {FIELD_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Technical Key</label>
                  <input value={editForm.key} onChange={e => { setEditForm(p => ({ ...p, key: e.target.value })); setEditKeyManuallyEdited(true); }} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 font-mono text-sm bg-gray-50/30" />
                  {editError && <p className="mt-1 text-xs text-red-500">{editError}</p>}
                </div>
                <div>
                  <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Description</label>
                  <textarea value={editForm.description} onChange={e => setEditForm(p => ({ ...p, description: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium resize-none bg-gray-50/30 min-h-[80px]" />
                </div>
              </form>
            </div>
            <div className="sticky bottom-0 bg-white flex justify-end items-center gap-3 px-6 py-4 border-t">
              <button onClick={closeEditModal} className="text-sm font-bold text-gray-500">Cancel</button>
              <button type="submit" form="editForm" disabled={!!editError} className={`px-6 py-2.5 rounded-xl font-bold text-sm text-white ${editError ? "bg-emerald-300" : "bg-[#10B981] hover:bg-[#059669]"}`}>Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomFieldsSection;