import React, { useState, useEffect } from 'react';
import axios from '../../context/axios';
import { toast } from 'react-toastify';

const SupplierManagement = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [purchaseHistory, setPurchaseHistory] = useState([]);
  
  const [formData, setFormData] = useState({ 
    companyName: '', contactPerson: '', mobile: '', email: '', 
    gstNumber: '', panNumber: '', address: '', city: '', state: '', pincode: '' 
  });
  const [editId, setEditId] = useState(null);

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/suppliers?search=${search}&page=${page}`, { withCredentials: true });
      setSuppliers(res.data?.data || []);
      setTotalPages(res.data?.pagination?.pages || 1);
    } catch (err) {
      toast.error('Failed to fetch suppliers');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSuppliers();
  }, [search, page]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await axios.put(`/suppliers/${editId}`, formData, { withCredentials: true });
        toast.success('Supplier updated successfully');
      } else {
        await axios.post('/suppliers', formData, { withCredentials: true });
        toast.success('Supplier created successfully');
      }
      setIsModalOpen(false);
      setEditId(null);
      fetchSuppliers();
    } catch (err) {
      toast.error('Operation failed');
    }
  };

  const handleViewHistory = async (supplierId) => {
    try {
      const res = await axios.get(`/suppliers/${supplierId}/purchases`, { withCredentials: true });
      setPurchaseHistory(res.data.data);
      setIsHistoryModalOpen(true);
    } catch (error) {
      toast.error('Failed to fetch purchase history');
    }
  };

  return (
    <div className="p-4 md:p-6 bg-slate-50 min-h-screen font-['Urbanist',sans-serif]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">Supplier Management</h1>
          <p className="text-slate-500 text-[13px] mt-1 font-medium">Manage vendor profiles, contact details, and purchase records</p>
        </div>
        <button 
          onClick={() => { setEditId(null); setFormData({ companyName: '', contactPerson: '', mobile: '', email: '', gstNumber: '', panNumber: '', address: '', city: '', state: '', pincode: '' }); setIsModalOpen(true); }} 
          className="bg-[#10B981] hover:bg-[#059669] text-white px-4 py-2 rounded-lg font-semibold text-sm flex items-center gap-2 transition-all shadow-sm"
        >
          <span className="text-base font-bold">+</span>
          Add Supplier
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-white">
          <input 
            type="text" 
            placeholder="Search suppliers by name, company..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            className="w-full md:w-1/3 px-4 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] outline-none text-slate-800 placeholder:text-slate-400" 
          />
        </div>
        {loading ? (
          <div className="p-8 text-center text-sm font-medium text-slate-500">Loading suppliers...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 text-xs font-semibold uppercase tracking-wider">
                  <th className="px-4 py-3.5 font-semibold">Company</th>
                  <th className="px-4 py-3.5 font-semibold">Contact Person</th>
                  <th className="px-4 py-3.5 font-semibold">Mobile</th>
                  <th className="px-4 py-3.5 font-semibold">City / State</th>
                  <th className="px-4 py-3.5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {suppliers.map((s) => (
                  <tr key={s._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-4 py-3.5 font-semibold text-slate-800">{s.companyName}</td>
                    <td className="px-4 py-3.5 text-slate-600 text-sm">{s.contactPerson}</td>
                    <td className="px-4 py-3.5 text-slate-600 text-sm font-mono">{s.mobile}</td>
                    <td className="px-4 py-3.5 text-slate-600 text-sm">{s.city} {s.state ? `, ${s.state}` : ''}</td>
                    <td className="px-4 py-3.5 text-right space-x-2">
                      <button onClick={() => { setEditId(s._id); setFormData(s); setIsModalOpen(true); }} className="text-sm font-semibold text-blue-600 hover:text-blue-800 px-2 py-1 rounded hover:bg-blue-50 transition-colors">Edit</button>
                      <button onClick={() => handleViewHistory(s._id)} className="text-sm font-semibold text-purple-600 hover:text-purple-800 px-2 py-1 rounded hover:bg-purple-50 transition-colors">History</button>
                    </td>
                  </tr>
                ))}
                {suppliers.length === 0 && (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-sm font-medium text-slate-400">No suppliers found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination UI */}
        {!loading && suppliers.length > 0 && (
          <div className="p-4 border-t border-slate-200 flex justify-between items-center bg-slate-50/50 text-sm text-slate-600">
            <span className="text-sm font-medium text-slate-600">Page {page} of {totalPages}</span>
            <div className="space-x-2">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm font-medium bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm">Prev</button>
              <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm font-medium bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm">Next</button>
            </div>
          </div>
        )}
      </div>

      {/* Supplier Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-slate-100 animate-fade-in">
            <div className="p-5 border-b border-slate-100 sticky top-0 bg-white z-10 flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-800">{editId ? 'Edit Supplier' : 'Add Supplier'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-lg font-bold">&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">Company Name *</label>
                  <input required value={formData.companyName} onChange={e=>setFormData({...formData, companyName:e.target.value})} className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] text-slate-800" placeholder="Vendor Inc" />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">Contact Person *</label>
                  <input required value={formData.contactPerson} onChange={e=>setFormData({...formData, contactPerson:e.target.value})} className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] text-slate-800" placeholder="John Doe" />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">Mobile *</label>
                  <input required value={formData.mobile} onChange={e=>setFormData({...formData, mobile:e.target.value})} className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] text-slate-800" placeholder="9876543210" />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">Email</label>
                  <input type="email" value={formData.email} onChange={e=>setFormData({...formData, email:e.target.value})} className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] text-slate-800" placeholder="supplier@example.com" />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">GST Number</label>
                  <input value={formData.gstNumber} onChange={e=>setFormData({...formData, gstNumber:e.target.value})} className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] text-slate-800" placeholder="22AAAAA0000A1Z5" />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">PAN Number</label>
                  <input value={formData.panNumber} onChange={e=>setFormData({...formData, panNumber:e.target.value})} className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] text-slate-800" placeholder="ABCDE1234F" />
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
                <button type="submit" className="px-4 py-2 bg-[#10B981] hover:bg-[#059669] text-white rounded-lg text-sm font-semibold shadow-sm transition-colors">{editId ? 'Update Supplier' : 'Save Supplier'}</button>
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
              <h2 className="text-lg font-bold text-slate-800">Supplier Purchase History</h2>
              <button onClick={() => setIsHistoryModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-lg font-bold">&times;</button>
            </div>
            <div className="p-5 overflow-y-auto flex-1 bg-slate-50/50">
              {purchaseHistory.length === 0 ? (
                <p className="text-slate-400 text-center text-sm font-medium py-8">No purchases recorded for this supplier.</p>
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
                      {purchaseHistory.map(ph => (
                        <tr key={ph._id} className="hover:bg-slate-50/60">
                          <td className="px-4 py-3.5 font-semibold text-blue-600 text-sm">{ph.invoiceNumber}</td>
                          <td className="px-4 py-3.5 text-slate-600 text-sm">{new Date(ph.purchaseDate).toLocaleDateString()}</td>
                          <td className="px-4 py-3.5 font-bold text-slate-800 text-sm">₹{ph.grandTotal}</td>
                          <td className="px-4 py-3.5 text-xs text-slate-500">
                            {ph.products.map(p => p.product?.name).join(', ')}
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
export default SupplierManagement;
