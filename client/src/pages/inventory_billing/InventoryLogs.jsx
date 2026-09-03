import React, { useState, useEffect } from 'react';
import axios from '../../context/axios';

const InventoryLogs = () => {
  const [logs, setLogs] = useState([]);
  
  useEffect(() => {
    axios.get('/inventory/logs', { withCredentials: true })
      .then(res => setLogs(res.data.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="p-4 md:p-6 bg-slate-50 min-h-screen font-['Urbanist',sans-serif]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-center">
            <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Inventory Movement Logs</h1>
            <p className="text-slate-500 text-[13px] mt-1 font-medium">History of all stock additions, deductions, sales, and manual adjustments</p>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 text-xs font-semibold uppercase tracking-wider">
                <th className="px-4 py-3.5">Date & Time</th>
                <th className="px-4 py-3.5">Product</th>
                <th className="px-4 py-3.5">Movement Type</th>
                <th className="px-4 py-3.5">Quantity Change</th>
                <th className="px-4 py-3.5">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {logs.map((log) => (
                <tr key={log._id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-4 py-3.5 text-slate-600 text-sm">{new Date(log.createdAt).toLocaleString()}</td>
                  <td className="px-4 py-3.5 font-semibold text-slate-800 text-sm">{log.product?.name}</td>
                  <td className="px-4 py-3.5">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${log.type === 'sale' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>{log.type}</span>
                  </td>
                  <td className="px-4 py-3.5 font-bold text-slate-800 text-sm">{log.quantity > 0 ? `+${log.quantity}` : log.quantity}</td>
                  <td className="px-4 py-3.5 text-xs text-slate-500">{log.notes || '—'}</td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-sm font-medium text-slate-400">No logs found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
export default InventoryLogs;
