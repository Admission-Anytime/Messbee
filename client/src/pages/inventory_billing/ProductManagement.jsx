import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    name: '', sku: '', barcode: '', category: '', brand: '', description: '',
    purchasePrice: 0, sellingPrice: 0, gstPercentage: 18, hsnCode: '', unit: 'pcs',
    minimumStock: 10, status: 'active'
  });

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/products?search=${search}&page=${page}`, { withCredentials: true });
      setProducts(res.data.data);
      setTotalPages(res.data.pagination.pages);
    } catch (err) {
      toast.error('Failed to fetch products');
    }
    setLoading(false);
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`/api/categories?status=active&limit=100`, { withCredentials: true });
      setCategories(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [search, page]);

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

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Product Management</h1>
        <button 
          onClick={() => { 
            setEditId(null); 
            setFormData({ name: '', sku: '', barcode: '', category: '', brand: '', description: '', purchasePrice: 0, sellingPrice: 0, gstPercentage: 18, hsnCode: '', unit: 'pcs', minimumStock: 10, status: 'active' }); 
            setIsModalOpen(true); 
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          + Add Product
        </button>
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
                    <td className="p-4 space-x-2">
                      <button onClick={() => { setEditId(prod._id); setFormData({...prod, category: prod.category?._id}); setIsModalOpen(true); }} className="text-blue-600">Edit</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
