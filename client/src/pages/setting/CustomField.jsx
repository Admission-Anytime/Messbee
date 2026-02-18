import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast"; 
import {
  PencilSquareIcon,
  TrashIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  XMarkIcon,
  LockClosedIcon,
  ChevronDownIcon,
  ExclamationTriangleIcon 
} from "@heroicons/react/24/outline";

const API_URL = "http://localhost:5000/api/custom-fields";

const slugifyKey = (value) =>
  value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "").replace(/_+/g, "_");

const ITEMS_PER_PAGE = 8;

const CustomFieldsSection = () => {
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Modals States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); // Naya Delete Modal
  const [editMode, setEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [form, setForm] = useState({ name: "", type: "Text", key: "", description: "" });

  const fetchFields = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_URL);
      setFields(response.data);
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  useEffect(() => { fetchFields(); }, []);

  // Handlers
  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name) return;
    try {
      if (editMode) {
        const res = await axios.put(`${API_URL}/${selectedId}`, form);
        setFields(fields.map(f => f._id === selectedId ? res.data : f));
        toast.success("Field updated successfully!");
      } else {
        const res = await axios.post(API_URL, form);
        setFields([res.data, ...fields]);
        toast.success("Field created successfully!");
      }
      closeModal();
    } catch (error) { toast.error("Error saving field"); }
  };

 // Final delete logic triggered by the confirmation modal

  const confirmDelete = async () => {
    try {
      await axios.delete(`${API_URL}/${selectedId}`);
      setFields(fields.filter(f => f._id !== selectedId));
      toast.success("Field deleted successfully!");
      setIsDeleteModalOpen(false);
      setSelectedId(null);
    } catch (error) { toast.error("Delete failed"); }
  };

  const toggleActive = async (id, currentStatus) => {
    try {
      const res = await axios.put(`${API_URL}/${id}`, { isActive: !currentStatus });
      setFields(fields.map(f => f._id === id ? res.data : f));
      toast.success(`Field ${!currentStatus ? 'Activated' : 'Deactivated'}`);
    } catch (error) { console.error(error); }
  };

  const openEdit = (field) => {
    setEditMode(true);
    setSelectedId(field._id);
    setForm({ name: field.name, type: field.type, key: field.key, description: field.description });
    setIsModalOpen(true);
  };

  const openDelete = (id) => {
    setSelectedId(id);
    setIsDeleteModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditMode(false);
    setForm({ name: "", type: "Text", key: "", description: "" });
  };

  const currentFields = fields.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div className="flex-1 bg-gray-50 p-4 min-h-screen font-sans">
      <Toaster position="top-right" reverseOrder={false} />

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h1 className="text-xl font-bold text-gray-800">Custom Fields</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">Custom field used: <span className="font-bold text-gray-700">{fields.length}</span></span>
            <button onClick={() => setIsModalOpen(true)} className="bg-[#22C55E] hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium">+ Create Custom Fields</button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Name</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Description</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Type</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Key</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {currentFields.map((field) => (
                <tr key={field._id} className="hover:bg-gray-50/50">
                  <td className="px-6 py-4 font-medium">{field.name}</td>
                  <td className="px-6 py-4 text-gray-500 text-sm">{field.description || "-"}</td>
                  <td className="px-6 py-4"><span className="px-2 py-1 text-xs bg-gray-100 rounded text-gray-600">{field.type}</span></td>
                  <td className="px-6 py-4 font-mono text-xs text-blue-600">{field.key}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <button onClick={() => toggleActive(field._id, field.isActive)} className={`w-9 h-5 flex items-center rounded-full px-1 transition-colors ${field.isActive ? 'bg-green-500' : 'bg-gray-300'}`}>
                        <div className={`bg-white w-3 h-3 rounded-full transition-transform ${field.isActive ? 'translate-x-4' : 'translate-x-0'}`} />
                      </button>
                      <button onClick={() => openEdit(field)} className="text-gray-400 hover:text-blue-600"><PencilSquareIcon className="w-5 h-5"/></button>
                      <button onClick={() => openDelete(field._id)} className="text-gray-400 hover:text-red-600"><TrashIcon className="w-5 h-5"/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="text-lg font-bold text-gray-800">{editMode ? 'Edit Custom Field' : 'Create Custom Field'}</h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600"><XMarkIcon className="w-6 h-6"/></button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Field Type</label>
                <div className="relative">
                  <select 
                    value={form.type}
                    onChange={(e) => setForm({...form, type: e.target.value})}
                    className="w-full border border-gray-200 rounded-xl p-3 appearance-none focus:ring-2 focus:ring-green-500 outline-none"
                  >
                    <option>Text</option><option>Number</option><option>Date</option>
                  </select>
                  <ChevronDownIcon className="w-5 h-5 absolute right-3 top-3.5 text-gray-400 pointer-events-none"/>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Field Name</label>
                <input 
                  type="text"
                  placeholder="e.g. Order Status"
                  className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-green-500 outline-none"
                  value={form.name}
                  onChange={(e) => setForm({...form, name: e.target.value, key: slugifyKey(e.target.value)})}
                />
                {!form.name && <p className="text-red-500 text-xs mt-1">Field name is required.</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Technical Key</label>
                <div className="relative">
                  <input 
                    type="text"
                    readOnly
                    className="w-full border border-gray-100 bg-gray-50 text-gray-400 rounded-xl p-3 outline-none font-mono text-sm"
                    value={form.key}
                  />
                  <LockClosedIcon className="w-5 h-5 absolute right-3 top-3.5 text-gray-300"/>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea 
                  rows="3"
                  placeholder="Briefly explain the purpose of this field"
                  className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-green-500 outline-none resize-none"
                  value={form.description}
                  onChange={(e) => setForm({...form, description: e.target.value})}
                />
              </div>

              <div className="flex items-center justify-end gap-4 pt-2">
                <button type="button" onClick={closeModal} className="text-gray-500 font-medium hover:text-gray-700">Cancel</button>
                <button 
                  type="submit" 
                  className="bg-[#22C55E]/20 text-[#22C55E] hover:bg-[#22C55E] hover:text-white px-6 py-2.5 rounded-xl font-bold transition-all border border-[#22C55E]/30"
                >
                  {editMode ? 'Update Field' : 'Create Field'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6 text-center animate-in fade-in zoom-in duration-200">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <ExclamationTriangleIcon className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Delete Field?</h3>
            <p className="text-gray-500 text-sm mb-6">
              Are you sure you want to delete this field? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl font-semibold hover:bg-gray-50"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 shadow-lg shadow-red-200"
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

export default CustomFieldsSection;