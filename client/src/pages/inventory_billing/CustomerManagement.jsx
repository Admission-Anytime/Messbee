import React, { useState, useEffect } from 'react';
import axios from '../../context/axios';
import { toast } from 'react-toastify';

const CustomerManagement = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
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
      const res = await axios.get(`/customers?search=${search}&page=${page}`, { withCredentials: true });
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
        await axios.put(`/customers/${editId}`, formData, { withCredentials: true });
        toast.success('Customer updated successfully');
      } else {
        await axios.post('/customers', formData, { withCredentials: true });
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
      const res = await axios.get(`/customers/${customerId}/sales`, { withCredentials: true });
      setSalesHistory(res.data.data);
      setIsHistoryModalOpen(true);
    } catch (error) {
      toast.error('Failed to fetch sales history');
    }
  };

  return (
    <div className="p-4 md:p-6 bg-slate-50 min-h-screen font-['Urbanist',sans-serif]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-center">
            <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Customer Management</h1>
            <p className="text-slate-500 text-[13px] mt-1 font-medium">Manage customer directory, contact details, and sales history</p>
          </div>
        </div>
        <button 
          onClick={() => { setEditId(null); setFormData({ customerName: '', mobile: '', email: '', gstNumber: '', address: '', city: '', state: '', pincode: '' }); setIsModalOpen(true); }} 
          className="bg-[#10B981] hover:bg-[#059669] text-white px-4 py-2 rounded-lg font-semibold text-sm flex items-center gap-2 transition-all shadow-sm"
        >
          <span className="text-base font-bold">+</span>
          Add Customer
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-white">
          <input 
            type="text" 
            placeholder="Search customers by name, phone..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            className="w-full md:w-1/3 px-4 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] outline-none text-slate-800 placeholder:text-slate-400" 
          />
        </div>
        {loading ? (
          <div className="p-8 text-center text-sm font-medium text-slate-500">Loading customers...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 text-xs font-semibold uppercase tracking-wider">
                  <th className="px-4 py-3.5 font-semibold">Customer Name</th>
                  <th className="px-4 py-3.5 font-semibold">Mobile</th>
                  <th className="px-4 py-3.5 font-semibold">City / State</th>
                  <th className="px-4 py-3.5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {customers.map((c) => (
                  <tr key={c._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-4 py-3.5 font-semibold text-slate-800">{c.customerName}</td>
                    <td className="px-4 py-3.5 text-slate-600 text-sm font-mono">{c.mobile}</td>
                    <td className="px-4 py-3.5 text-slate-600 text-sm">{c.city} {c.state ? `, ${c.state}` : ''}</td>
                    <td className="px-4 py-3.5 text-right space-x-2">
                      <button onClick={() => { setEditId(c._id); setFormData(c); setIsModalOpen(true); }} className="text-sm font-semibold text-blue-600 hover:text-blue-800 px-2 py-1 rounded hover:bg-blue-50 transition-colors">Edit</button>
                      <button onClick={() => handleViewHistory(c._id)} className="text-sm font-semibold text-purple-600 hover:text-purple-800 px-2 py-1 rounded hover:bg-purple-50 transition-colors">History</button>
                    </td>
                  </tr>
                ))}
                {customers.length === 0 && (
                  <tr>
                    <td colSpan="4" className="p-8 text-center text-sm font-medium text-slate-400">No customers found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination UI */}
        {!loading && customers.length > 0 && (
          <div className="p-4 border-t border-slate-200 flex justify-between items-center bg-slate-50/50 text-sm text-slate-600">
            <span className="text-sm font-medium text-slate-600">Page {page} of {totalPages}</span>
            <div className="space-x-2">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm font-medium bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm">Prev</button>
              <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm font-medium bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm">Next</button>
            </div>
          </div>
        )}
      </div>

      {/* Customer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-slate-100 animate-fade-in">
            <div className="p-5 border-b border-slate-100 sticky top-0 bg-white z-10 flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-800">{editId ? 'Edit Customer' : 'Add Customer'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-lg font-bold">&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">Customer Name *</label>
                  <input required value={formData.customerName} onChange={e=>setFormData({...formData, customerName:e.target.value})} className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] text-slate-800" placeholder="John Doe" />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">Mobile *</label>
                  <input required value={formData.mobile} onChange={e=>setFormData({...formData, mobile:e.target.value})} className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] text-slate-800" placeholder="9876543210" />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">Email</label>
                  <input type="email" value={formData.email} onChange={e=>setFormData({...formData, email:e.target.value})} className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] text-slate-800" placeholder="customer@example.com" />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">GST Number</label>
                  <input value={formData.gstNumber} onChange={e=>setFormData({...formData, gstNumber:e.target.value})} className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] text-slate-800" placeholder="GST number (optional)" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">Address</label>
                  <textarea value={formData.address} onChange={e=>setFormData({...formData, address:e.target.value})} className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] text-slate-800" rows="2" placeholder="Street address"></textarea>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">City</label>
                  <input value={formData.city} onChange={e=>setFormData({...formData, city:e.target.value})} className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] text-slate-800" placeholder="City" />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">State</label>
                  <input value={formData.state} onChange={e=>setFormData({...formData, state:e.target.value})} className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] text-slate-800" placeholder="State" />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">Pincode</label>
                  <input value={formData.pincode} onChange={e=>setFormData({...formData, pincode:e.target.value})} className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] text-slate-800" placeholder="110001" />
                </div>
              </div>
              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={()=>setIsModalOpen(false)} className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-[#10B981] hover:bg-[#059669] text-white rounded-lg text-sm font-semibold shadow-sm transition-colors">{editId ? 'Update Customer' : 'Save Customer'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* History Modal */}
      {isHistoryModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col border border-slate-100 animate-fade-in">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-lg font-bold text-slate-800">Customer Sales History</h2>
              <button onClick={() => setIsHistoryModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-lg font-bold">&times;</button>
            </div>
            <div className="p-5 overflow-y-auto flex-1 bg-slate-50/50">
              {salesHistory.length === 0 ? (
                <p className="text-slate-400 text-center text-sm font-medium py-8">No sales recorded for this customer.</p>
              ) : (
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/80 text-xs font-semibold uppercase text-slate-600 border-b border-slate-200">
                        <th className="px-4 py-3.5">Invoice No</th>
                        <th className="px-4 py-3.5">Date</th>
                        <th className="px-4 py-3.5">Grand Total</th>
                        <th className="px-4 py-3.5">Items</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                      {salesHistory.map(sh => (
                        <tr key={sh._id} className="hover:bg-slate-50/60">
                          <td className="px-4 py-3.5 font-semibold text-blue-600 text-sm">{sh.invoiceNumber}</td>
                          <td className="px-4 py-3.5 text-slate-600 text-sm">{new Date(sh.salesDate).toLocaleDateString()}</td>
                          <td className="px-4 py-3.5 font-bold text-slate-800 text-sm">₹{sh.grandTotal}</td>
                          <td className="px-4 py-3.5 text-xs text-slate-500">
                            {sh.products.map(p => p.product?.name).join(', ')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default CustomerManagement;
