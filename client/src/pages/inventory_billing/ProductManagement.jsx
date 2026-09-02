import React, { useState, useEffect } from 'react';
import axios from '../../context/axios';
import { toast } from 'react-toastify';

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    name: '', sku: '', barcode: '', category: '', brand: '', description: '',
    purchasePrice: 0, sellingPrice: 0, gstPercentage: 18, hsnCode: '', unit: 'pcs',
    minimumStock: 10, currentStock: 0, status: 'active'
  });

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/products?search=${search}&page=${page}&category=${categoryFilter}`, { withCredentials: true });
      setProducts(res.data?.data || []);
      setTotalPages(res.data?.pagination?.pages || 1);
    } catch (err) {
      toast.error('Failed to fetch products');
    }
    setLoading(false);
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get('/categories?limit=100', { withCredentials: true });
      setCategories(res.data?.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [search, page, categoryFilter]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await axios.put(`/products/${editId}`, formData, { withCredentials: true });
        toast.success('Product updated');
      } else {
        await axios.post('/products', formData, { withCredentials: true });
        toast.success('Product created');
      }
      setIsModalOpen(false);
      setEditId(null);
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await axios.delete(`/products/${id}`, { withCredentials: true });
      toast.success('Product deleted successfully');
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete product');
    }
  };

  const handleScanInvoice = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    const uploadData = new FormData();
    uploadData.append('invoice', file);

    try {
      const res = await axios.post('/purchases/scan-invoice', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true
      });
      
      const { data } = res.data;
      if (data.items && data.items.length > 0) {
        toast.success(`${data.items.length} products found and updated in inventory!`);
        fetchProducts(); // Refresh list to show new products
      } else {
        toast.info('No products could be extracted from this image.');
      }
      
      e.target.value = '';
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to scan invoice image');
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="p-4 md:p-6 bg-slate-50 min-h-screen font-['Urbanist',sans-serif]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">Product Management</h1>
          <p className="text-slate-500 text-[13px] mt-1 font-medium">Manage product inventory, pricing, and stock levels</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <input 
              type="file" 
              id="product-invoice-upload" 
              accept="image/*,application/pdf" 
              className="hidden" 
              onChange={handleScanInvoice} 
              disabled={isScanning}
            />
            <label 
              htmlFor="product-invoice-upload" 
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-semibold text-sm border transition-all shadow-sm cursor-pointer ${isScanning ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed' : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-emerald-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              {isScanning ? 'Scanning...' : 'Scan Image'}
            </label>
          </div>
          <button 
            onClick={() => { 
              setEditId(null); 
              setFormData({ name: '', sku: '', barcode: '', category: '', brand: '', description: '', purchasePrice: 0, sellingPrice: 0, gstPercentage: 18, hsnCode: '', unit: 'pcs', minimumStock: 10, currentStock: 0, status: 'active' }); 
              setIsModalOpen(true); 
            }}
            className="bg-[#10B981] hover:bg-[#059669] text-white px-4 py-2 rounded-lg font-semibold text-sm flex items-center gap-2 transition-all shadow-sm"
          >
            <span className="text-base font-bold">+</span>
            Add Product
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-white flex flex-col sm:flex-row gap-3">
          <input 
            type="text" 
            placeholder="Search by name, SKU..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-72 px-4 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] outline-none text-slate-800 placeholder:text-slate-400"
          />
          <select 
            value={categoryFilter} 
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] outline-none text-slate-700 bg-white"
          >
            <option value="">All Categories</option>
            {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
        </div>

        {loading ? (
          <div className="p-8 text-center text-sm font-medium text-slate-500">Loading products...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 text-xs font-semibold uppercase tracking-wider">
                  <th className="px-4 py-3.5 font-semibold">Name / SKU</th>
                  <th className="px-4 py-3.5 font-semibold">Category</th>
                  <th className="px-4 py-3.5 font-semibold">Price (Pur / Sell)</th>
                  <th className="px-4 py-3.5 font-semibold">Stock</th>
                  <th className="px-4 py-3.5 font-semibold">Status</th>
                  <th className="px-4 py-3.5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {products.map((prod) => (
                  <tr key={prod._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-slate-800 text-sm">{prod.name}</div>
                      <div className="text-xs text-slate-400 font-mono mt-0.5">{prod.sku || 'No SKU'}</div>
                    </td>
                    <td className="px-4 py-3.5 text-slate-600 text-sm">{prod.category?.name || '—'}</td>
                    <td className="px-4 py-3.5 text-slate-700 text-sm font-medium">₹{prod.purchasePrice} / <span className="font-semibold text-slate-900">₹{prod.sellingPrice}</span></td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${prod.currentStock <= prod.minimumStock ? (prod.currentStock === 0 ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-amber-50 text-amber-700 border border-amber-200') : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>
                        {prod.currentStock} {prod.unit}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${prod.status === 'active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                        {prod.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right space-x-2">
                      <button onClick={() => { setEditId(prod._id); setFormData({...prod, category: prod.category?._id}); setIsModalOpen(true); }} className="text-sm font-semibold text-blue-600 hover:text-blue-800 px-2 py-1 rounded hover:bg-blue-50 transition-colors">Edit</button>
                      <button onClick={() => handleDelete(prod._id)} className="text-sm font-semibold text-rose-600 hover:text-rose-800 px-2 py-1 rounded hover:bg-rose-50 transition-colors">Delete</button>
                    </td>
                  </tr>
                ))}
                {products.length === 0 && (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-sm font-medium text-slate-400">No products found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Pagination UI */}
        {!loading && products.length > 0 && (
          <div className="p-4 border-t border-slate-200 flex justify-between items-center bg-slate-50/50 text-sm text-slate-600">
            <div className="text-sm font-medium text-slate-600">
              Page {page} of {totalPages}
            </div>
            <div className="space-x-2">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm font-medium bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                Previous
              </button>
              <button 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm font-medium bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-slate-100 animate-fade-in">
            <div className="p-5 border-b border-slate-100 sticky top-0 bg-white z-10 flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-800">{editId ? 'Edit Product' : 'Add Product'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-lg font-bold">&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">Name *</label>
                  <input required value={formData.name} onChange={e=>setFormData({...formData, name:e.target.value})} className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] text-slate-800" placeholder="Product name" />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">Category *</label>
                  <select required value={formData.category} onChange={e=>setFormData({...formData, category:e.target.value})} className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] text-slate-800 bg-white">
                    <option value="">Select Category</option>
                    {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">SKU (Auto if empty)</label>
                  <input value={formData.sku} onChange={e=>setFormData({...formData, sku:e.target.value})} className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] text-slate-800" placeholder="e.g. SKU-001" />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">Barcode</label>
                  <input value={formData.barcode} onChange={e=>setFormData({...formData, barcode:e.target.value})} className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] text-slate-800" placeholder="Barcode" />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">Brand</label>
                  <input value={formData.brand} onChange={e=>setFormData({...formData, brand:e.target.value})} className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] text-slate-800" placeholder="Brand name" />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">Unit</label>
                  <input value={formData.unit} onChange={e=>setFormData({...formData, unit:e.target.value})} className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] text-slate-800" placeholder="pcs, kg, ltr" />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">Purchase Price (₹) *</label>
                  <input type="number" required value={formData.purchasePrice} onChange={e=>setFormData({...formData, purchasePrice:e.target.value})} className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] text-slate-800" />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">Selling Price (₹) *</label>
                  <input type="number" required value={formData.sellingPrice} onChange={e=>setFormData({...formData, sellingPrice:e.target.value})} className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] text-slate-800" />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">GST %</label>
                  <input type="number" value={formData.gstPercentage} onChange={e=>setFormData({...formData, gstPercentage:e.target.value})} className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] text-slate-800" />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">HSN Code</label>
                  <input value={formData.hsnCode} onChange={e=>setFormData({...formData, hsnCode:e.target.value})} className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] text-slate-800" />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">Min Stock Alert</label>
                  <input type="number" value={formData.minimumStock} onChange={e=>setFormData({...formData, minimumStock:e.target.value})} className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] text-slate-800" />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">Current Stock</label>
                  <input type="number" value={formData.currentStock} onChange={e=>setFormData({...formData, currentStock:e.target.value})} className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] text-slate-800" />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">Product Image URL</label>
                  <input value={formData.productImage || ''} onChange={e=>setFormData({...formData, productImage:e.target.value})} className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] text-slate-800" placeholder="https://..." />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">Status</label>
                  <select value={formData.status} onChange={e=>setFormData({...formData, status:e.target.value})} className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] text-slate-800 bg-white">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">Description</label>
                <textarea value={formData.description} onChange={e=>setFormData({...formData, description:e.target.value})} className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] text-slate-800" rows="2" placeholder="Product details..."></textarea>
              </div>
              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={()=>setIsModalOpen(false)} className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-[#10B981] hover:bg-[#059669] text-white rounded-lg text-sm font-semibold shadow-sm transition-colors">{editId ? 'Update Product' : 'Save Product'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManagement;
