import React, { useState, useEffect } from 'react';
import axios from '../../context/axios';
import { toast } from 'react-toastify';

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '', status: 'active' });
  const [editId, setEditId] = useState(null);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/categories?search=${search}&page=${page}`, { withCredentials: true });
      setCategories(res.data?.data || []);
      setTotalPages(res.data?.pagination?.pages || 1);
    } catch (err) {
      toast.error('Failed to fetch categories');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();
  }, [search, page]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await axios.put(`/categories/${editId}`, formData, { withCredentials: true });
        toast.success('Category updated successfully');
      } else {
        await axios.post('/categories', formData, { withCredentials: true });
        toast.success('Category created successfully');
      }
      setIsModalOpen(false);
      setFormData({ name: '', description: '', status: 'active' });
      setEditId(null);
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await axios.delete(`/categories/${id}`, { withCredentials: true });
        toast.success('Category deleted');
        fetchCategories();
      } catch (err) {
        toast.error('Failed to delete category');
      }
    }
  };

  return (
    <div className="p-4 md:p-6 bg-slate-50 min-h-screen font-['Urbanist',sans-serif]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">Category Management</h1>
          <p className="text-slate-500 text-[13px] mt-1 font-medium">Manage and organize your product categories</p>
        </div>
        <button 
          onClick={() => { setEditId(null); setFormData({ name: '', description: '', status: 'active' }); setIsModalOpen(true); }}
          className="bg-[#10B981] hover:bg-[#059669] text-white px-4 py-2 rounded-lg font-semibold text-sm flex items-center gap-2 transition-all shadow-sm"
        >
          <span className="text-base font-bold">+</span>
          Add Category
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-white">
          <input 
            type="text" 
            placeholder="Search categories..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full md:w-1/3 px-4 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] outline-none text-slate-800 placeholder:text-slate-400"
          />
        </div>

        {loading ? (
          <div className="p-8 text-center text-sm font-medium text-slate-500">Loading categories...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 text-xs font-semibold uppercase tracking-wider">
                  <th className="px-4 py-3.5 font-semibold">Name</th>
                  <th className="px-4 py-3.5 font-semibold">Description</th>
                  <th className="px-4 py-3.5 font-semibold">Status</th>
                  <th className="px-4 py-3.5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {categories.map((cat) => (
                  <tr key={cat._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-4 py-3.5 font-semibold text-slate-800">{cat.name}</td>
                    <td className="px-4 py-3.5 text-slate-600 text-sm">{cat.description || "—"}</td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${cat.status === 'active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                        {cat.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right space-x-2">
                      <button onClick={() => { setEditId(cat._id); setFormData(cat); setIsModalOpen(true); }} className="text-sm font-semibold text-blue-600 hover:text-blue-800 px-2 py-1 rounded hover:bg-blue-50 transition-colors">Edit</button>
                      <button onClick={() => handleDelete(cat._id)} className="text-sm font-semibold text-rose-600 hover:text-rose-800 px-2 py-1 rounded hover:bg-rose-50 transition-colors">Delete</button>
                    </td>
                  </tr>
                ))}
                {categories.length === 0 && (
                  <tr>
                    <td colSpan="4" className="p-8 text-center text-sm font-medium text-slate-400">No categories found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        <div className="p-4 border-t border-slate-200 flex justify-between items-center bg-slate-50/50 text-sm text-slate-600">
          <span className="text-sm font-medium text-slate-600">Page {page} of {totalPages}</span>
          <div className="space-x-2">
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm font-medium bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm">Prev</button>
            <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm font-medium bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm">Next</button>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden border border-slate-100 animate-fade-in">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-lg font-bold text-slate-800">{editId ? 'Edit Category' : 'Add Category'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-lg font-bold">&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">Category Name *</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] text-slate-800" placeholder="e.g. Beverages" />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">Description</label>
                <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] text-slate-800" rows="3" placeholder="Category details..."></textarea>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">Status</label>
                <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] text-slate-800 bg-white">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-[#10B981] hover:bg-[#059669] text-white rounded-lg text-sm font-semibold shadow-sm transition-colors">{editId ? 'Update Category' : 'Create Category'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryManagement;
