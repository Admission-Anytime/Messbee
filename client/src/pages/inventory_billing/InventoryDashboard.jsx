import React, { useState, useEffect } from 'react';
import axios from '../../context/axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const InventoryDashboard = () => {
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [outOfStock, setOutOfStock] = useState([]);
  
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [adjustData, setAdjustData] = useState({ productId: '', newStockLevel: 0, notes: '' });
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetchInventoryData();
  }, []);

  const fetchInventoryData = async () => {
    try {
      const [logsRes, lowRes, outRes, prodRes] = await Promise.all([
        axios.get('/inventory/logs?limit=10', { withCredentials: true }),
        axios.get('/inventory/low-stock', { withCredentials: true }),
        axios.get('/inventory/out-of-stock', { withCredentials: true }),
        axios.get('/products?status=active&limit=100', { withCredentials: true })
      ]);
      setLogs(logsRes.data.data);
      setLowStock(lowRes.data.data);
      setOutOfStock(outRes.data.data);
      setProducts(prodRes.data.data);
    } catch (err) {
      toast.error('Failed to load inventory data');
    }
  };

  const handleAdjustStock = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/inventory/adjust', adjustData, { withCredentials: true });
      toast.success('Stock adjusted successfully');
      setIsAdjustModalOpen(false);
      setAdjustData({ productId: '', newStockLevel: 0, notes: '' });
      fetchInventoryData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Adjustment failed');
    }
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Inventory Dashboard</h1>
        <button onClick={() => setIsAdjustModalOpen(true)} className="bg-orange-500 text-white px-4 py-2 rounded-lg font-medium">Adjust Stock</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Out of stock alerts */}
        <div className="bg-red-50 border border-red-200 p-6 rounded-xl shadow-sm">
          <h2 className="text-red-700 font-bold text-lg mb-4 flex items-center">
            <span className="mr-2">⚠️</span> Out of Stock ({outOfStock.length})
          </h2>
          <div className="max-h-48 overflow-y-auto">
            {outOfStock.length === 0 ? <p className="text-sm text-red-500">All products are in stock.</p> : (
              <ul className="space-y-2">
                {outOfStock.map(p => (
                  <li key={p._id} className="text-sm font-medium text-red-800 flex justify-between bg-white p-2 rounded shadow-sm border border-red-100">
                    <span>{p.name}</span>
                    <span>0 {p.unit}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Low stock alerts */}
        <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-xl shadow-sm flex flex-col h-full">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-yellow-700 font-bold text-lg flex items-center">
              <span className="mr-2">📉</span> Low Stock Alerts ({lowStock.length})
            </h2>
            {lowStock.length > 0 && (
              <button 
                onClick={() => navigate('/admin/purchase/bills', { state: { reorderItems: lowStock } })}
                className="bg-yellow-600 text-white px-3 py-1.5 rounded-lg text-sm font-bold shadow-sm hover:bg-yellow-700 transition-colors"
              >
                1-Click Restock All
              </button>
            )}
          </div>
          <div className="flex-1 overflow-y-auto pr-1">
            {lowStock.length === 0 ? <p className="text-sm text-yellow-600">No low stock items.</p> : (
              <ul className="space-y-3">
                {lowStock.map(p => {
                  const deficit = Math.max((p.minimumStock - p.currentStock), 10); // Standardize minimum restock to 10
                  return (
                    <li key={p._id} className="text-sm font-medium text-yellow-800 flex justify-between items-center bg-white p-3 rounded-lg shadow-sm border border-yellow-100">
                      <div>
                        <span className="font-bold">{p.name}</span>
                        <div className="text-xs text-yellow-600 mt-1 font-semibold">Current: {p.currentStock} {p.unit} | Min: {p.minimumStock}</div>
                      </div>
                      <button 
                        onClick={() => navigate('/admin/purchase/bills', { state: { reorderItems: [p] } })}
                        className="bg-slate-100 text-slate-700 border border-slate-200 px-3 py-1.5 rounded text-xs font-bold hover:bg-slate-200 hover:border-slate-300 transition-all shadow-sm flex gap-1 items-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                        Restock +{deficit}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b bg-slate-50"><h2 className="font-bold text-lg">Recent Stock Movement</h2></div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b text-sm text-slate-600">
              <th className="p-4">Date</th>
              <th className="p-4">Product</th>
              <th className="p-4">Type</th>
              <th className="p-4">Qty Change</th>
              <th className="p-4">Final Stock</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log._id} className="border-b">
                <td className="p-4 text-sm">{new Date(log.createdAt).toLocaleString()}</td>
                <td className="p-4 font-medium">{log.product?.name}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs capitalize ${log.type === 'sale' ? 'bg-red-100 text-red-700' : log.type === 'purchase' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>{log.type}</span>
                </td>
                <td className="p-4 font-bold">{log.quantity > 0 ? `+${log.quantity}` : log.quantity}</td>
                <td className="p-4 font-bold text-slate-700">{log.newStock}</td>
              </tr>
            ))}
            {logs.length === 0 && <tr><td colSpan="5" className="p-6 text-center text-slate-500">No stock movements found.</td></tr>}
          </tbody>
        </table>
      </div>

      {isAdjustModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b"><h2 className="text-xl font-bold">Manual Stock Adjustment</h2></div>
            <form onSubmit={handleAdjustStock} className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium">Select Product*</label>
                <select required value={adjustData.productId} onChange={e=>setAdjustData({...adjustData, productId:e.target.value})} className="w-full border p-2 rounded mt-1">
                  <option value="">-- Choose Product --</option>
                  {products.map(p => <option key={p._id} value={p._id}>{p.name} (Current: {p.currentStock})</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">New Final Stock Level*</label>
                <input type="number" required min="0" value={adjustData.newStockLevel} onChange={e=>setAdjustData({...adjustData, newStockLevel:Number(e.target.value)})} className="w-full border p-2 rounded mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium">Adjustment Notes</label>
                <textarea required value={adjustData.notes} onChange={e=>setAdjustData({...adjustData, notes:e.target.value})} className="w-full border p-2 rounded mt-1" placeholder="Reason for adjustment"></textarea>
              </div>
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button type="button" onClick={()=>setIsAdjustModalOpen(false)} className="px-4 py-2 border rounded">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-orange-500 text-white rounded font-medium">Apply Adjustment</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default InventoryDashboard;
