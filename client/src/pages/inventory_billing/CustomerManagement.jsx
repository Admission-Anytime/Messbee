import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const CustomerManagement = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [salesHistory, setSalesHistory] = useState([]);

  const [formData, setFormData] = useState({ 
    customerName: '', mobile: '', email: '', gstNumber: '', address: '', city: '', state: '', pincode: '' 
  });
  const [editId, setEditId] = useState(null);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/customers?search=${search}&page=${page}`, { withCredentials: true });
      setCustomers(res.data?.data || []);
      setTotalPages(res.data?.pagination?.pages || 1);
    } catch (err) {
      toast.error('Failed to fetch customers');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCustomers();
  }, [search, page]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await axios.put(`/api/customers/${editId}`, formData, { withCredentials: true });
        toast.success('Customer updated successfully');
      } else {
        await axios.post('/api/customers', formData, { withCredentials: true });
        toast.success('Customer created successfully');
      }
      setIsModalOpen(false);
      setEditId(null);
      fetchCustomers();
    } catch (err) {
      toast.error('Operation failed');
    }
  };

  const handleViewHistory = async (customerId) => {
    try {
      const res = await axios.get(`/api/customers/${customerId}/sales`, { withCredentials: true });
      setSalesHistory(res.data.data);
      setIsHistoryModalOpen(true);
    } catch (error) {
      toast.error('Failed to fetch sales history');
    }
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Customer Management</h1>
        <button onClick={() => { setEditId(null); setFormData({ customerName: '', mobile: '', email: '', gstNumber: '', address: '', city: '', state: '', pincode: '' }); setIsModalOpen(true); }} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium">+ Add Customer</button>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200">
          <input type="text" placeholder="Search customers..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full md:w-1/3 px-4 py-2 border border-slate-300 rounded-lg outline-none" />
        </div>
        {loading ? <div className="p-8 text-center">Loading...</div> : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-sm">
                  <th className="p-4">Customer Name</th>
                  <th className="p-4">Mobile</th>
                  <th className="p-4">City / State</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c._id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="p-4 font-medium">{c.customerName}</td>
                    <td className="p-4">{c.mobile}</td>
                    <td className="p-4">{c.city} {c.state ? `, ${c.state}` : ''}</td>
                    <td className="p-4 space-x-3">
                      <button onClick={() => { setEditId(c._id); setFormData(c); setIsModalOpen(true); }} className="text-blue-600">Edit</button>
                      <button onClick={() => handleViewHistory(c._id)} className="text-purple-600">History</button>
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
            <div className="p-6 border-b sticky top-0 bg-white z-10"><h2 className="text-xl font-bold">{editId ? 'Edit Customer' : 'Add Customer'}</h2></div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="text-sm font-medium">Customer Name*</label><input required value={formData.customerName} onChange={e=>setFormData({...formData, customerName:e.target.value})} className="w-full border p-2 rounded" /></div>
                <div><label className="text-sm font-medium">Mobile*</label><input required value={formData.mobile} onChange={e=>setFormData({...formData, mobile:e.target.value})} className="w-full border p-2 rounded" /></div>
                <div><label className="text-sm font-medium">Email</label><input type="email" value={formData.email} onChange={e=>setFormData({...formData, email:e.target.value})} className="w-full border p-2 rounded" /></div>
                <div><label className="text-sm font-medium">GST Number</label><input value={formData.gstNumber} onChange={e=>setFormData({...formData, gstNumber:e.target.value})} className="w-full border p-2 rounded" /></div>
                <div className="md:col-span-2"><label className="text-sm font-medium">Address</label><textarea value={formData.address} onChange={e=>setFormData({...formData, address:e.target.value})} className="w-full border p-2 rounded"></textarea></div>
                <div><label className="text-sm font-medium">City</label><input value={formData.city} onChange={e=>setFormData({...formData, city:e.target.value})} className="w-full border p-2 rounded" /></div>
                <div><label className="text-sm font-medium">State</label><input value={formData.state} onChange={e=>setFormData({...formData, state:e.target.value})} className="w-full border p-2 rounded" /></div>
                <div><label className="text-sm font-medium">Pincode</label><input value={formData.pincode} onChange={e=>setFormData({...formData, pincode:e.target.value})} className="w-full border p-2 rounded" /></div>
              </div>
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button type="button" onClick={()=>setIsModalOpen(false)} className="px-4 py-2 border rounded hover:bg-slate-50">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Save Customer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* History Modal */}
      {isHistoryModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold">Customer Sales History</h2>
              <button onClick={() => setIsHistoryModalOpen(false)} className="text-slate-500 hover:text-red-500 text-xl font-bold">&times;</button>
            </div>
            <div className="p-6 overflow-y-auto flex-1 bg-slate-50">
              {salesHistory.length === 0 ? (
                <p className="text-slate-500 text-center">No sales recorded for this customer.</p>
              ) : (
                <table className="w-full text-left border-collapse bg-white rounded-lg shadow-sm">
                  <thead>
                    <tr className="bg-slate-100 text-sm">
                      <th className="p-3 border-b">Invoice No</th>
                      <th className="p-3 border-b">Date</th>
                      <th className="p-3 border-b">Grand Total</th>
                      <th className="p-3 border-b">Items</th>
                    </tr>
                  </thead>
                  <tbody>
                    {salesHistory.map(sh => (
                      <tr key={sh._id} className="border-b">
                        <td className="p-3 font-medium text-blue-600">{sh.invoiceNumber}</td>
                        <td className="p-3">{new Date(sh.salesDate).toLocaleDateString()}</td>
                        <td className="p-3 font-semibold">₹{sh.grandTotal}</td>
                        <td className="p-3 text-xs text-slate-500">
                          {sh.products.map(p => p.product?.name).join(', ')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default CustomerManagement;
