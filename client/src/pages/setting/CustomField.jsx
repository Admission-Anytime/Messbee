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
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  // ─── Fetch custom fields ──────────────────────────────────────────────────
  const fetchCustomFields = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getCustomFields({ page: 1, limit: 1000 });

      const transformedFields = response.data.data.map((field) => ({
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCustomFields(); }, []);

  // ─── Pagination ───────────────────────────────────────────────────────────
  const totalPages  = Math.ceil(fields.length / ITEMS_PER_PAGE);
  const startIndex  = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex    = startIndex + ITEMS_PER_PAGE;
  const currentFields = fields.slice(startIndex, endIndex);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) setCurrentPage(totalPages);
  }, [fields.length, currentPage, totalPages]);

  const goToNextPage     = () => currentPage < totalPages && setCurrentPage(p => p + 1);
  const goToPreviousPage = () => currentPage > 1 && setCurrentPage(p => p - 1);
  const goToPage         = (n) => n >= 1 && n <= totalPages && setCurrentPage(n);

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

  const openCreateModal  = () => { setForm({ name: "", type: "Text", key: "", description: "", showInContacts: true }); setIsCreateOpen(true); };
  const closeCreateModal = () => setIsCreateOpen(false);

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
    setIsEditOpen(true);
  };

  const closeEditModal = () => { setIsEditOpen(false); setEditIndex(null); };

  useEffect(() => {
    if (!isEditOpen) return;
    setEditForm(prev => {
      const autoKey     = slugifyKey(prev.name || "");
      const wasAuto     = prev.key === autoKey || prev.key === "";
      const nextAutoKey = slugifyKey(editForm.name || "");
      if (!wasAuto) return prev;
      return { ...prev, key: nextAutoKey };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editForm.name, isEditOpen]);

  const existingKeys = useMemo(() => new Set(fields.map(f => f.key)), [fields]);

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

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="flex-1 bg-gray-50 overflow-hidden">
      <div className="bg-white rounded-lg shadow-sm">

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold text-gray-900">Custom Fields</h1>
            <button className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-xs">?</button>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600 whitespace-nowrap">Custom fields: {fields.length}</span>
            <button
              onClick={openCreateModal}
              className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg flex items-center gap-2 whitespace-nowrap"
            >
              <span className="text-lg">+</span>
              <span>Create Custom Fields</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden">
          <table className="w-full table-fixed">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="w-[15%] px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="w-[25%] px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="w-[10%] px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="w-[18%] px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Key</th>
                <th className="w-[17%] px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created By</th>
                <th className="w-[15%] px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-3 py-10 text-center text-sm text-gray-500">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
                      <span>Loading custom fields...</span>
                    </div>
                  </td>
                </tr>
              ) : fields.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 py-10 text-center text-sm text-gray-500">
                    No custom fields yet. Create your first custom field to get started.
                  </td>
                </tr>
              ) : (
                currentFields.map((field, displayIndex) => {
                  const actualIndex = startIndex + displayIndex;
                  return (
                    <tr key={field._id || field.key} className="hover:bg-gray-50">

                      <td className="px-3 py-3">
                        <div className="text-sm font-medium text-gray-900 truncate" title={field.name}>{field.name}</div>
                      </td>

                      <td className="px-3 py-3">
                        <div className="text-sm text-gray-600 truncate" title={field.description}>{field.description}</div>
                      </td>

                      <td className="px-3 py-3">
                        <span className="px-2 py-1 text-xs text-gray-600 bg-gray-100 rounded truncate inline-block max-w-full">
                          {field.type.toLowerCase()}
                        </span>
                      </td>

                      <td className="px-3 py-3">
                        <div className="text-sm text-gray-600 font-mono truncate" title={field.key}>{field.key}</div>
                      </td>

                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-700 flex-shrink-0">
                            {field.createdBy.initials}
                          </div>
                          <span className="text-sm text-gray-900 truncate" title={field.createdBy.name}>{field.createdBy.name}</span>
                        </div>
                      </td>

                      {/* Single toggle: controls both isActive + showInContacts together */}
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-1 justify-end">
                          <ToggleSwitch
                            checked={field.isActive}
                            onChange={() => toggleActive(actualIndex)}
                            title={field.isActive ? "Active — click to deactivate and hide from Contacts" : "Inactive — click to activate and show in Contacts"}
                          />
                          <button
                            type="button"
                            onClick={() => openEditModal(actualIndex)}
                            className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500 flex-shrink-0"
                            title="Edit"
                          >
                            <PencilSquareIcon className="w-5 h-5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => openDeleteModal(actualIndex)}
                            className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500 flex-shrink-0"
                            title="Delete"
                          >
                            <TrashIcon className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            Showing {fields.length === 0 ? 0 : startIndex + 1} to {Math.min(endIndex, fields.length)} of {fields.length} custom fields
          </div>
          <div className="flex items-center gap-2">
            <button onClick={goToPreviousPage} disabled={currentPage === 1} className={`p-1 rounded ${currentPage === 1 ? "text-gray-300 cursor-not-allowed" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"}`} title="Previous page">
              <ChevronLeftIcon className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                <button
                  key={pageNum}
                  onClick={() => goToPage(pageNum)}
                  className={`min-w-[32px] h-8 px-2 rounded text-sm font-medium ${currentPage === pageNum ? "bg-green-500 text-white" : "text-gray-600 hover:bg-gray-100"}`}
                >
                  {pageNum}
                </button>
              ))}
            </div>
            <button onClick={goToNextPage} disabled={currentPage === totalPages || totalPages === 0} className={`p-1 rounded ${currentPage === totalPages || totalPages === 0 ? "text-gray-300 cursor-not-allowed" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"}`} title="Next page">
              <ChevronRightIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* ─── Delete Confirm Modal ─────────────────────────────────────────────── */}
      {deleteIndex !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/30" onClick={closeDeleteModal} />
          <div className="relative w-full max-w-md bg-white rounded-xl shadow-lg border border-gray-200">
            <div className="p-5 border-b border-gray-100 flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Delete custom field?</h3>
                <p className="mt-1 text-sm text-gray-600">
                  {fieldToDelete ? (<>You are about to delete <span className="font-medium text-gray-900">{fieldToDelete.name}</span>. This will also remove it from the Contacts table. This action can't be undone.</>) : "This action can't be undone."}
                </p>
              </div>
              <button onClick={closeDeleteModal} className="p-2 rounded-md hover:bg-gray-100 text-gray-500" title="Close">
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 flex items-center justify-end gap-3">
              <button type="button" onClick={closeDeleteModal} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">Keep</button>
              <button type="button" onClick={confirmDelete} className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Create Modal ─────────────────────────────────────────────────────── */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/30" onClick={closeCreateModal} />
          <div className="relative w-full max-w-lg max-h-[90vh] bg-white rounded-xl shadow-lg border border-gray-200 flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
              <h3 className="text-lg font-semibold text-gray-900">Create Custom Field</h3>
              <button type="button" onClick={closeCreateModal} className="p-2 rounded-md hover:bg-gray-100 text-gray-500" title="Close">
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1">
              <form onSubmit={handleCreate} className="px-6 py-5">

                <div className="mb-5">
                  <label className="block text-sm font-medium text-gray-800 mb-2">Field Name</label>
                  <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Order Status" className="w-full border border-gray-200 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-green-200" />
                </div>

                <div className="mb-5">
                  <label className="block text-sm font-medium text-gray-800 mb-2">Field Type</label>
                  <div className="relative">
                    <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))} className="w-full appearance-none border border-gray-200 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-green-200">
                      {FIELD_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"><ChevronDownIcon className="w-5 h-5" /></div>
                  </div>
                </div>

                <div className="mb-5">
                  <label className="block text-sm font-medium text-gray-800 mb-2">Technical Key</label>
                  <div className="relative">
                    <input value={form.key} onChange={e => setForm(p => ({ ...p, key: e.target.value }))} placeholder="order_status" className="w-full border border-gray-200 rounded-lg px-4 py-2.5 pr-10 outline-none focus:ring-2 focus:ring-green-200 font-mono text-sm" />
                    <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"><LockClosedIcon className="w-5 h-5" /></div>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">Automatically generated based on the field name.</p>
                  {createError && <p className="mt-2 text-sm text-red-600">{createError}</p>}
                </div>

                <div className="mb-5">
                  <label className="block text-sm font-medium text-gray-800 mb-2">Description</label>
                  <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Briefly explain the purpose of this field" className="w-full border border-gray-200 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-green-200 min-h-[90px] resize-none" />
                </div>

                <div className="mt-6 flex items-center justify-end gap-3 border-t border-gray-100 pt-4">
                  <button type="button" onClick={closeCreateModal} className="px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100">Cancel</button>
                  <button type="submit" disabled={!!createError} className={`px-4 py-2 rounded-lg text-white ${createError ? "bg-green-300 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"}`}>Create Field</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ─── Edit Modal ───────────────────────────────────────────────────────── */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/30" onClick={closeEditModal} />
          <div className="relative w-full max-w-lg max-h-[90vh] bg-white rounded-xl shadow-lg border border-gray-200 flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
              <h3 className="text-lg font-semibold text-gray-900">Edit Custom Field</h3>
              <button type="button" onClick={closeEditModal} className="p-2 rounded-md hover:bg-gray-100 text-gray-500" title="Close">
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1">
              <form onSubmit={handleEditSave} className="px-6 py-5">

                <div className="mb-5">
                  <label className="block text-sm font-medium text-gray-800 mb-2">Field Name</label>
                  <input value={editForm.name} onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-green-200" />
                </div>

                <div className="mb-5">
                  <label className="block text-sm font-medium text-gray-800 mb-2">Field Type</label>
                  <div className="relative">
                    <select value={editForm.type} onChange={e => setEditForm(p => ({ ...p, type: e.target.value }))} className="w-full appearance-none border border-gray-200 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-green-200">
                      {FIELD_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"><ChevronDownIcon className="w-5 h-5" /></div>
                  </div>
                </div>

                <div className="mb-5">
                  <label className="block text-sm font-medium text-gray-800 mb-2">Technical Key</label>
                  <input value={editForm.key} onChange={e => setEditForm(p => ({ ...p, key: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-green-200 font-mono text-sm" />
                  {editError && <p className="mt-2 text-sm text-red-600">{editError}</p>}
                </div>

                <div className="mb-5">
                  <label className="block text-sm font-medium text-gray-800 mb-2">Description</label>
                  <textarea value={editForm.description} onChange={e => setEditForm(p => ({ ...p, description: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-green-200 min-h-[90px] resize-none" />
                </div>

                <div className="mt-6 flex items-center justify-end gap-3 border-t border-gray-100 pt-4">
                  <button type="button" onClick={closeEditModal} className="px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100">Cancel</button>
                  <button type="submit" disabled={!!editError} className={`px-4 py-2 rounded-lg text-white ${editError ? "bg-green-300 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"}`}>Save Changes</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomFieldsSection;