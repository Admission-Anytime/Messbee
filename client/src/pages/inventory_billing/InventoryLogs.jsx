import React, { useState, useEffect } from 'react';
import axios from 'axios';

const InventoryLogs = () => {
  const [logs, setLogs] = useState([]);
  
  useEffect(() => {
    axios.get('/api/inventory/logs', { withCredentials: true })
      .then(res => setLogs(res.data.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Inventory Movement Logs</h1>
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b text-sm text-slate-600">
              <th className="p-4">Date</th>
              <th className="p-4">Product</th>
              <th className="p-4">Type</th>
              <th className="p-4">Quantity Change</th>
              <th className="p-4">Notes</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log._id} className="border-b">
                <td className="p-4">{new Date(log.createdAt).toLocaleString()}</td>
                <td className="p-4 font-medium">{log.product?.name}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs capitalize ${log.type === 'sale' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{log.type}</span>
                </td>
                <td className="p-4 font-bold">{log.quantity > 0 ? `+${log.quantity}` : log.quantity}</td>
                <td className="p-4 text-sm text-slate-500">{log.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default InventoryLogs;
