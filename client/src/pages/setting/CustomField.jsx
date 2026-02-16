
import { useEffect, useMemo, useState } from "react";
import {
  BellIcon,
  PencilSquareIcon,
  TrashIcon,
  XMarkIcon,
  LockClosedIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
} from "@heroicons/react/24/outline";
import { toast } from "react-toastify";
import {
  createCustomFieldApi,
  updateCustomFieldApi,
  deleteCustomFieldApi,
  listCustomFieldsApi,
} from "../../services/CustomfieldApi";

const slugifyKey = (value) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .replace(/_+/g, "_");

const FIELD_TYPES = ["Text", "Number", "Date"];
const ITEMS_PER_PAGE = 8;

const CustomFieldsSection = () => {

  const [fields, setFields] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    let mounted = true;

    const fetchFields = async () => {
      try {
        const res = await listCustomFieldsApi();
        const list = res.data?.data || [];

        if (mounted) setFields(list);
      } catch (err) {
        if (mounted) {
          toast.error(err?.response?.data?.message || "Failed to load custom fields");
        }
      }
    };

    fetchFields();

    return () => {
      mounted = false;
    };
  }, []);

  const totalPages = Math.ceil(fields.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentFields = fields.slice(startIndex, endIndex);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
    if (totalPages === 0 && currentPage !== 1) setCurrentPage(1);
  }, [fields.length, currentPage, totalPages]);

  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const goToPage = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) setCurrentPage(pageNumber);
  };


  // Delete handlers
  const [deleteIndex, setDeleteIndex] = useState(null);
  const fieldToDelete = deleteIndex !== null ? fields[deleteIndex] : null;

  const openDeleteModal = (index) => setDeleteIndex(index);
  const closeDeleteModal = () => setDeleteIndex(null);

  const confirmDelete = async () => {
    if (deleteIndex === null) return;

    const deleting = fields[deleteIndex];
    const id = deleting?._id;

    if (!id) {
      toast.error("Missing field id");
      return;
    }

    try {
      await deleteCustomFieldApi(id);

      setFields((prev) => prev.filter((f) => f._id !== id));
      setDeleteIndex(null);

      toast.success(`Custom field "${deleting?.name ?? "Field"}" deleted successfully`);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Delete failed");
    }
  };

  
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    type: "Text",
    key: "",
    description: "",
  });

  const [editIndex, setEditIndex] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    type: "Text",
    key: "",
    description: "",
  });

  const openEditModal = (index) => {
    const f = fields[index];
    setEditIndex(index);
    setEditForm({
      name: f.name || "",
      type: f.type || "Text",
      key: f.key || "",
      description: f.description || "",
    });
    setIsEditOpen(true);
  };

  const closeEditModal = () => {
    setIsEditOpen(false);
    setEditIndex(null);
  };

  useEffect(() => {
    setForm((prev) => {
      const autoKey = slugifyKey(prev.name || "");
      const wasAuto = prev.key === autoKey || prev.key === "";
      const nextAutoKey = slugifyKey(form.name || "");
      if (!wasAuto) return prev;
      return { ...prev, key: nextAutoKey };
    });
  }, [form.name]);

  useEffect(() => {
    if (!isEditOpen) return;
    setEditForm((prev) => {
      const autoKey = slugifyKey(prev.name || "");
      const wasAuto = prev.key === autoKey || prev.key === "";
      const nextAutoKey = slugifyKey(editForm.name || "");
      if (!wasAuto) return prev;
      return { ...prev, key: nextAutoKey };
    });
  }, [editForm.name, isEditOpen]);

  const existingKeys = useMemo(() => new Set(fields.map((f) => f.key)), [fields]);

  const openCreateModal = () => {
    setForm({ name: "", type: "Text", key: "", description: "" });
    setIsCreateOpen(true);
  };
  
  const closeCreateModal = () => setIsCreateOpen(false);

  const toggleActive = (index) => {
    const currentField = fields[index];
    if (!currentField) return;

    const nextIsActive = !currentField.isActive;

    setFields((prev) =>
      prev.map((item, i) => (i === index ? { ...item, isActive: nextIsActive } : item))
    );
  };

  const validateCreate = () => {
    const name = form.name.trim();
    const key = slugifyKey(form.key || "");
    if (!name) return { ok: false, msg: "Field name is required." };
    if (!key) return { ok: false, msg: "Technical key is required." };
    if (existingKeys.has(key)) return { ok: false, msg: "Technical key must be unique." };
    return { ok: true, key, name };
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    const v = validateCreate();
    if (!v.ok) {
      toast.error(v.msg);
      return;
    }

    try {
      const payload = {
        name: v.name,
        type: form.type,
        key: v.key,
        description: form.description.trim(),
      };

      const res = await createCustomFieldApi(payload);
      const created = res.data?.data;

      setFields((prev) => [created, ...prev]);
      setIsCreateOpen(false);
      setCurrentPage(1);

      toast.success(`Custom field "${created.name}" created`);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Create failed");
    }
  };


  const createError = useMemo(() => {
    const v = validateCreate();
    return v.ok ? "" : v.msg;
  }, [form.name, form.key, existingKeys]);


  const validateEdit = () => {
    if (editIndex === null) return { ok: false, msg: "No field selected." };

    const name = editForm.name.trim();
    const key = slugifyKey(editForm.key || "");
    if (!name) return { ok: false, msg: "Field name is required." };
    if (!key) return { ok: false, msg: "Technical key is required." };

    const duplicates = fields.some((f, i) => i !== editIndex && f.key === key);
    if (duplicates) return { ok: false, msg: "Technical key must be unique." };

    return { ok: true, name, key };
  };

  const editError = useMemo(() => {
    if (!isEditOpen) return "";
    const v = validateEdit();
    return v.ok ? "" : v.msg;
  }, [editForm.name, editForm.key, fields, editIndex, isEditOpen]);


//edit handler
  const handleEditSave = async (e) => {
    e.preventDefault();
    const v = validateEdit();
    if (!v.ok) {
      toast.error(v.msg);
      return;
    }

    try {
      const id = fields[editIndex]?._id;
      if (!id) {
        toast.error("Missing field id");
        return;
      }

      const payload = {
        name: v.name,
        type: editForm.type,
        key: v.key,
        description: editForm.description.trim(),
      };

      
      const res = await updateCustomFieldApi(id, payload);
      const updated = res.data?.data;

      setFields((prev) => prev.map((f) => (f._id === updated._id ? updated : f)));

      toast.success(`Custom field "${updated.name}" updated`);
      closeEditModal();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Update failed");
    }
  };

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key !== "Escape") return;
      if (isCreateOpen) closeCreateModal();
      if (isEditOpen) closeEditModal();
      if (deleteIndex !== null) closeDeleteModal();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isCreateOpen, isEditOpen, deleteIndex]);

  const getUserInitials = (createdBy) => {
    if (!createdBy) return "?";
    if (typeof createdBy === 'string') return "U";
    
    const name = createdBy.name || createdBy.email || "";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "U";
  };

  const getUserName = (createdBy) => {
    if (!createdBy) return "Unknown";
    if (typeof createdBy === 'string') return "User";
    
    return createdBy.name || createdBy.email || "Unknown";
  };

  return (
    <div className="flex-1 bg-gray-50 overflow-hidden flex flex-col">
      <div className="sticky top-0 z-20 bg-gray-50 px-8 pt-8 pb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold text-gray-900">Custom Fields</h1>
            <button className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-xs hover:bg-gray-300">
              ?
            </button>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600 whitespace-nowrap">
              Custom field used: {fields.length}/5
            </span>

            <button
              onClick={openCreateModal}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 whitespace-nowrap font-medium"
            >
              <span className="text-lg">+</span>
              <span>Create Custom Fields</span>
            </button>

            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <BellIcon className="w-5 h-5 text-gray-600" />
            </button>

            <div className="w-10 h-10 rounded-full bg-orange-200 flex items-center justify-center text-orange-800 font-medium flex-shrink-0">
              U
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto px-7 pb-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div>
            <table className="w-full table-fixed">
              <thead className="sticky top-0 z-10 bg-white">
                <tr className="border-b border-gray-200 bg-white">
                  <th className="w-[15%] px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="w-[25%] px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="w-[10%] px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="w-[18%] px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Key
                  </th>
                  <th className="w-[17%] px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created By
                  </th>
                  <th className="w-[15%] px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-gray-200">
                {currentFields.map((field, displayIndex) => {
                  const actualIndex = startIndex + displayIndex;
                  return (
                    <tr key={field._id} className="hover:bg-gray-50">
                      <td className="px-3 py-3">
                        <div className="text-sm font-medium text-gray-900 truncate" title={field.name}>
                          {field.name}
                        </div>
                      </td>

                      <td className="px-3 py-3">
                        <div className="text-sm text-gray-600 truncate" title={field.description}>
                          {field.description}
                        </div>
                      </td>

                      <td className="px-3 py-3">
                        <span className="px-2 py-1 text-xs text-gray-600 bg-gray-100 rounded truncate inline-block max-w-full">
                          {field.type.toLowerCase()}
                        </span>
                      </td>

                      <td className="px-3 py-3">
                        <div className="text-sm text-gray-600 font-mono truncate" title={field.key}>
                          {field.key}
                        </div>
                      </td>

                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-700 flex-shrink-0">
                            {getUserInitials(field.createdBy)}
                          </div>
                          <span className="text-sm text-gray-900 truncate" title={getUserName(field.createdBy)}>
                            {getUserName(field.createdBy)}
                          </span>
                        </div>
                      </td>

                      <td className="px-3 py-3">
                        <div className="flex items-center gap-1 justify-end">
                          <button
                            type="button"
                            onClick={() => toggleActive(actualIndex)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 flex-shrink-0 ${
                              field.isActive ? "bg-green-500" : "bg-gray-300"
                            }`}
                            aria-pressed={field.isActive}
                            title={field.isActive ? "Active" : "Inactive"}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                                field.isActive ? "translate-x-6" : "translate-x-1"
                              }`}
                            />
                          </button>

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
                })}

                {fields.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-3 py-10 text-center text-sm text-gray-500">
                      No custom fields yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              Showing {fields.length === 0 ? 0 : startIndex + 1} to {Math.min(endIndex, fields.length)} of {fields.length} custom fields
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
                className={`p-1 rounded ${
                  currentPage === 1
                    ? "text-gray-300 cursor-not-allowed"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
                title="Previous page"
              >
                <ChevronLeftIcon className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => goToPage(pageNum)}
                    className={`min-w-[32px] h-8 px-2 rounded text-sm font-medium ${
                      currentPage === pageNum
                        ? "bg-green-500 text-white"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}
              </div>

              <button
                onClick={goToNextPage}
                disabled={currentPage === totalPages || totalPages === 0}
                className={`p-1 rounded ${
                  currentPage === totalPages || totalPages === 0
                    ? "text-gray-300 cursor-not-allowed"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
                title="Next page"
              >
                <ChevronRightIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {deleteIndex !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/30" onClick={closeDeleteModal} />
          <div className="relative w-full max-w-md max-h-[90vh] bg-white rounded-xl shadow-lg border border-gray-200">
            <div className="p-5 border-b border-gray-100 flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Delete custom field?</h3>
                <p className="mt-1 text-sm text-gray-600">
                  {fieldToDelete ? (
                    <>
                      You are about to delete{" "}
                      <span className="font-medium text-gray-900">{fieldToDelete.name}</span>. This action can not be
                      undone.
                    </>
                  ) : (
                    "This action can't be undone."
                  )}
                </p>
              </div>

              <button onClick={closeDeleteModal} className="p-2 rounded-md hover:bg-gray-100 text-gray-500" title="Close">
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={closeDeleteModal}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Keep
              </button>

              <button
                type="button"
                onClick={confirmDelete}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/30" onClick={closeCreateModal} />
          <div className="relative w-full max-w-lg max-h-[90vh] bg-white rounded-xl shadow-lg border border-gray-200 flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
              <h3 className="text-lg font-semibold text-gray-900">Create Custom Field</h3>

              <button
                type="button"
                onClick={closeCreateModal}
                className="p-2 rounded-md hover:bg-gray-100 text-gray-500"
                title="Close"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1">
              <form onSubmit={handleCreate} className="px-6 py-5">
                <div className="mb-5">
                  <label className="block text-sm font-medium text-gray-800 mb-2">Field Name</label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                    placeholder="Order Status"
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-green-200"
                  />
                </div>

                <div className="mb-5">
                  <label className="block text-sm font-medium text-gray-800 mb-2">Field Type</label>
                  <div className="relative">
                    <select
                      value={form.type}
                      onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}
                      className="w-full appearance-none border border-gray-200 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-green-200"
                    >
                      {FIELD_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>

                    <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <ChevronDownIcon className="w-5 h-5" />
                    </div>
                  </div>
                </div>

                <div className="mb-5">
                  <label className="block text-sm font-medium text-gray-800 mb-2">Technical Key</label>
                  <div className="relative">
                    <input
                      value={form.key}
                      onChange={(e) => setForm((p) => ({ ...p, key: e.target.value }))}
                      placeholder="order_status"
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 pr-10 outline-none focus:ring-2 focus:ring-green-200 font-mono text-sm"
                    />

                    <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <LockClosedIcon className="w-5 h-5" />
                    </div>
                  </div>

                  <p className="mt-1 text-xs text-gray-500">Automatically generated based on the field name.</p>
                  {createError && <p className="mt-2 text-sm text-red-600">{createError}</p>}
                </div>

                <div className="mb-2">
                  <label className="block text-sm font-medium text-gray-800 mb-2">Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                    placeholder="Briefly explain the purpose of this field"
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-green-200 min-h-[90px] resize-none"
                  />
                </div>

                <div className="mt-6 flex items-center justify-end gap-3 border-t border-gray-100 pt-4">
                  <button
                    type="button"
                    onClick={closeCreateModal}
                    className="px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={!!createError}
                    className={`px-4 py-2 rounded-lg text-white ${
                      createError ? "bg-green-300 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
                    }`}
                  >
                    Create Field
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/30" onClick={closeEditModal} />
          <div className="relative w-full max-w-lg max-h-[90vh] bg-white rounded-xl shadow-lg border border-gray-200 flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
              <h3 className="text-lg font-semibold text-gray-900">Edit Custom Field</h3>

              <button
                type="button"
                onClick={closeEditModal}
                className="p-2 rounded-md hover:bg-gray-100 text-gray-500"
                title="Close"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1">
              <form onSubmit={handleEditSave} className="px-6 py-5">
                <div className="mb-5">
                  <label className="block text-sm font-medium text-gray-800 mb-2">Field Name</label>
                  <input
                    value={editForm.name}
                    onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-green-200"
                  />
                </div>

                <div className="mb-5">
                  <label className="block text-sm font-medium text-gray-800 mb-2">Field Type</label>
                  <div className="relative">
                    <select
                      value={editForm.type}
                      onChange={(e) => setEditForm((p) => ({ ...p, type: e.target.value }))}
                      className="w-full appearance-none border border-gray-200 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-green-200"
                    >
                      {FIELD_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>

                    <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <ChevronDownIcon className="w-5 h-5" />
                    </div>
                  </div>
                </div>

                <div className="mb-5">
                  <label className="block text-sm font-medium text-gray-800 mb-2">Technical Key</label>
                  <input
                    value={editForm.key}
                    onChange={(e) => setEditForm((p) => ({ ...p, key: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-green-200 font-mono text-sm"
                  />
                  {editError && <p className="mt-2 text-sm text-red-600">{editError}</p>}
                </div>

                <div className="mb-2">
                  <label className="block text-sm font-medium text-gray-800 mb-2">Description</label>
                  <textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm((p) => ({ ...p, description: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-green-200 min-h-[90px] resize-none"
                  />
                </div>

                <div className="mt-6 flex items-center justify-end gap-3 border-t border-gray-100 pt-4">
                  <button
                    type="button"
                    onClick={closeEditModal}
                    className="px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={!!editError}
                    className={`px-4 py-2 rounded-lg text-white ${
                      editError ? "bg-green-300 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
                    }`}
                  >
                    Save Changes
                  </button>
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