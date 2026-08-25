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
      const res = await axios.get(`/api/products?search=${search}&page=${page}&category=${categoryFilter}`, { withCredentials: true });
      setProducts(res.data?.data || []);
      setTotalPages(res.data?.pagination?.pages || 1);
    } catch (err) {
      toast.error('Failed to fetch products');
    }
    setLoading(false);
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get('/api/categories?limit=100', { withCredentials: true });
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
        await axios.put(`/api/products/${editId}`, formData, { withCredentials: true });
        toast.success('Product updated');
      } else {
        await axios.post('/api/products', formData, { withCredentials: true });
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
      await axios.delete(`/api/products/${id}`, { withCredentials: true });
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
      const res = await axios.post('/api/purchases/scan-invoice', uploadData, {
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
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Product Management</h1>
        <div className="flex gap-3">
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
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-white shadow-sm transition-colors cursor-pointer ${isScanning ? 'bg-slate-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
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
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            + Add Product
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200">
          <input 
            type="text" 
            placeholder="Search by name, SKU..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full md:w-1/3 px-4 py-2 border border-slate-300 rounded-lg outline-none"
          />
        </div>

        {loading ? (
          <div className="p-8 text-center">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-sm">
                  <th className="p-4">Name / SKU</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Price (Purchase / Sell)</th>
                  <th className="p-4">Stock</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((prod) => (
                  <tr key={prod._id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="p-4">
                      <div className="font-medium text-slate-800">{prod.name}</div>
                      <div className="text-xs text-slate-500">{prod.sku}</div>
                    </td>
                    <td className="p-4 text-slate-600">{prod.category?.name || 'N/A'}</td>
                    <td className="p-4 text-slate-600">₹{prod.purchasePrice} / ₹{prod.sellingPrice}</td>
                    <td className="p-4">
                      <span className={`font-semibold ${prod.currentStock <= prod.minimumStock ? 'text-red-600' : 'text-green-600'}`}>
                        {prod.currentStock} {prod.unit}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs ${prod.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {prod.status}
                      </span>
                    </td>
                    <td className="p-4 space-x-3">
                      <button onClick={() => { setEditId(prod._id); setFormData({...prod, category: prod.category?._id}); setIsModalOpen(true); }} className="text-blue-600 font-medium hover:text-blue-800">Edit</button>
                      <button onClick={() => handleDelete(prod._id)} className="text-red-500 font-medium hover:text-red-700">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Pagination UI */}
        {!loading && products.length > 0 && (
          <div className="p-4 border-t border-slate-200 flex justify-between items-center bg-slate-50">
            <div className="text-sm text-slate-600">
              Page {page} of {totalPages}
            </div>
            <div className="space-x-2">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 border border-slate-300 rounded text-sm bg-white hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-3 py-1 border border-slate-300 rounded text-sm bg-white hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b sticky top-0 bg-white">
              <h2 className="text-xl font-bold">{editId ? 'Edit Product' : 'Add Product'}</h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="text-sm">Name*</label><input required value={formData.name} onChange={e=>setFormData({...formData, name:e.target.value})} className="w-full border p-2 rounded" /></div>
                <div><label className="text-sm">Category*</label>
                  <select required value={formData.category} onChange={e=>setFormData({...formData, category:e.target.value})} className="w-full border p-2 rounded">
                    <option value="">Select Category</option>
                    {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>
                <div><label className="text-sm">SKU (Auto if empty)</label><input value={formData.sku} onChange={e=>setFormData({...formData, sku:e.target.value})} className="w-full border p-2 rounded" /></div>
                <div><label className="text-sm">Barcode</label><input value={formData.barcode} onChange={e=>setFormData({...formData, barcode:e.target.value})} className="w-full border p-2 rounded" /></div>
                <div><label className="text-sm">Brand</label><input value={formData.brand} onChange={e=>setFormData({...formData, brand:e.target.value})} className="w-full border p-2 rounded" /></div>
                <div><label className="text-sm">Unit</label><input value={formData.unit} onChange={e=>setFormData({...formData, unit:e.target.value})} className="w-full border p-2 rounded" placeholder="pcs, kg, ltr" /></div>
                <div><label className="text-sm">Purchase Price*</label><input type="number" required value={formData.purchasePrice} onChange={e=>setFormData({...formData, purchasePrice:e.target.value})} className="w-full border p-2 rounded" /></div>
                <div><label className="text-sm">Selling Price*</label><input type="number" required value={formData.sellingPrice} onChange={e=>setFormData({...formData, sellingPrice:e.target.value})} className="w-full border p-2 rounded" /></div>
                <div><label className="text-sm">GST %</label><input type="number" value={formData.gstPercentage} onChange={e=>setFormData({...formData, gstPercentage:e.target.value})} className="w-full border p-2 rounded" /></div>
                <div><label className="text-sm">HSN Code</label><input value={formData.hsnCode} onChange={e=>setFormData({...formData, hsnCode:e.target.value})} className="w-full border p-2 rounded" /></div>
                <div><label className="text-sm">Min Stock Alert</label><input type="number" value={formData.minimumStock} onChange={e=>setFormData({...formData, minimumStock:e.target.value})} className="w-full border p-2 rounded" /></div>
                <div><label className="text-sm">Current Stock</label><input type="number" value={formData.currentStock} onChange={e=>setFormData({...formData, currentStock:e.target.value})} className="w-full border p-2 rounded" /></div>
                <div><label className="text-sm">Product Image URL</label><input value={formData.productImage || ''} onChange={e=>setFormData({...formData, productImage:e.target.value})} className="w-full border p-2 rounded" placeholder="https://..." /></div>
                <div><label className="text-sm">Status</label>
                  <select value={formData.status} onChange={e=>setFormData({...formData, status:e.target.value})} className="w-full border p-2 rounded">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div><label className="text-sm">Description</label><textarea value={formData.description} onChange={e=>setFormData({...formData, description:e.target.value})} className="w-full border p-2 rounded" rows="2"></textarea></div>
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button type="button" onClick={()=>setIsModalOpen(false)} className="px-4 py-2 border rounded">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Save Product</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManagement;
