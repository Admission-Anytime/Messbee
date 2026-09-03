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
    <div className="p-4 md:p-6 bg-slate-50 min-h-screen font-['Urbanist',sans-serif]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">Inventory Dashboard</h1>
          <p className="text-slate-500 text-[13px] mt-1 font-medium">Real-time stock levels, low-stock alerts, and movement logs</p>
        </div>
        <button 
          onClick={() => setIsAdjustModalOpen(true)} 
          className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg font-semibold text-sm flex items-center gap-2 transition-all shadow-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
          Adjust Stock
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Out of stock alerts */}
        <div className="bg-white border border-rose-200 p-5 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-rose-100">
            <h2 className="text-rose-700 font-bold text-base sm:text-lg flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Out of Stock ({outOfStock.length})
            </h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">Critical</span>
          </div>
          <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
            {outOfStock.length === 0 ? (
              <p className="text-sm font-medium text-slate-400 text-center py-4">All products are in stock.</p>
            ) : (
              <ul className="space-y-2">
                {outOfStock.map(p => (
                  <li key={p._id} className="text-sm font-medium text-slate-800 flex justify-between items-center bg-rose-50/50 p-2.5 rounded-lg border border-rose-100">
                    <span className="font-semibold text-slate-800">{p.name}</span>
                    <span className="text-xs font-bold text-rose-600 bg-white px-2 py-0.5 rounded border border-rose-200">0 {p.unit}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Low stock alerts */}
        <div className="bg-white border border-amber-200 p-5 rounded-xl shadow-sm flex flex-col h-full">
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-amber-100">
            <h2 className="text-amber-800 font-bold text-base sm:text-lg flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Low Stock Alerts ({lowStock.length})
            </h2>
            {lowStock.length > 0 && (
              <button 
                onClick={() => navigate('/admin/purchase/bills', { state: { reorderItems: lowStock } })}
                className="bg-amber-500 hover:bg-amber-600 text-white px-3 py-1 rounded-lg text-xs font-semibold shadow-sm transition-colors"
              >
                1-Click Restock All
              </button>
            )}
          </div>
          <div className="flex-1 overflow-y-auto pr-1 max-h-48">
            {lowStock.length === 0 ? (
              <p className="text-sm font-medium text-slate-400 text-center py-4">No low stock items.</p>
            ) : (
              <ul className="space-y-2">
                {lowStock.map(p => {
                  const deficit = Math.max((p.minimumStock - p.currentStock), 10);
                  return (
                    <li key={p._id} className="text-sm font-medium text-slate-800 flex justify-between items-center bg-amber-50/40 p-2.5 rounded-lg border border-amber-100">
                      <div>
                        <span className="font-semibold text-slate-800">{p.name}</span>
                        <div className="text-xs text-amber-700 mt-0.5 font-medium">Current: {p.currentStock} {p.unit} | Min: {p.minimumStock}</div>
                      </div>
                      <button 
                        onClick={() => navigate('/admin/purchase/bills', { state: { reorderItems: [p] } })}
                        className="bg-white text-slate-700 border border-slate-200 px-2.5 py-1 rounded text-xs font-semibold hover:bg-slate-50 transition-all shadow-xs flex gap-1 items-center"
                      >
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
        <div className="p-4 border-b border-slate-200 bg-white">
          <h2 className="font-bold text-base text-slate-800">Recent Stock Movement</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 text-xs font-semibold uppercase tracking-wider">
                <th className="px-4 py-3.5 font-semibold">Date</th>
                <th className="px-4 py-3.5 font-semibold">Product</th>
                <th className="px-4 py-3.5 font-semibold">Type</th>
                <th className="px-4 py-3.5 font-semibold">Qty Change</th>
                <th className="px-4 py-3.5 font-semibold">Final Stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {logs.map((log) => (
                <tr key={log._id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-4 py-3.5 text-xs sm:text-sm text-slate-500">{new Date(log.createdAt).toLocaleString()}</td>
                  <td className="px-4 py-3.5 font-semibold text-slate-800">{log.product?.name}</td>
                  <td className="px-4 py-3.5">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${log.type === 'sale' ? 'bg-rose-50 text-rose-700 border border-rose-200' : log.type === 'purchase' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                      {log.type}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 font-bold text-sm text-slate-800">{log.quantity > 0 ? `+${log.quantity}` : log.quantity}</td>
                  <td className="px-4 py-3.5 font-semibold text-slate-700 text-sm">{log.newStock}</td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-sm font-medium text-slate-400">No stock movements found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isAdjustModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden border border-slate-100 animate-fade-in">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-lg font-bold text-slate-800">Manual Stock Adjustment</h2>
              <button onClick={() => setIsAdjustModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-lg font-bold">&times;</button>
            </div>
            <form onSubmit={handleAdjustStock} className="p-5 space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">Select Product *</label>
                <select required value={adjustData.productId} onChange={e=>setAdjustData({...adjustData, productId:e.target.value})} className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] text-slate-800 bg-white">
                  <option value="">-- Choose Product --</option>
                  {products.map(p => <option key={p._id} value={p._id}>{p.name} (Current: {p.currentStock})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">New Final Stock Level *</label>
                <input type="number" required min="0" value={adjustData.newStockLevel} onChange={e=>setAdjustData({...adjustData, newStockLevel:Number(e.target.value)})} className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] text-slate-800" />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">Adjustment Notes *</label>
                <textarea required value={adjustData.notes} onChange={e=>setAdjustData({...adjustData, notes:e.target.value})} className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] text-slate-800" placeholder="Reason for adjustment" rows="2"></textarea>
              </div>
              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={()=>setIsAdjustModalOpen(false)} className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-semibold shadow-sm transition-colors">Apply Adjustment</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default InventoryDashboard;
