import React, { useState, useEffect } from 'react';
import axios from '../../context/axios';
import { toast } from 'react-toastify';

const BillingSettings = () => {
  const [formData, setFormData] = useState({
    companyName: '', logo: '', gstNumber: '', address: '', 
    city: '', state: '', pincode: '', invoicePrefix: 'INV-', taxPercentage: 18, currency: 'INR'
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await axios.get('/tenant-settings', { withCredentials: true });
      if (res.data?.billing) {
        setFormData(res.data.billing);
      }
    } catch (err) {
      console.log('Error fetching billing settings', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.put('/tenant-settings', { billing: formData }, { withCredentials: true });
      toast.success('Billing Settings updated successfully!');
    } catch (error) {
      toast.error('Failed to update settings');
    }
    setLoading(false);
  };

  return (
    <div className="p-4 md:p-6 bg-slate-50 min-h-screen font-['Urbanist',sans-serif]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">Billing & Invoice Settings</h1>
          <p className="text-slate-500 text-[13px] mt-1 font-medium">Configure company invoice details, logo, address, and tax defaults</p>
        </div>
      </div>
      <div className="bg-white p-6 rounded-xl shadow-sm max-w-3xl border border-slate-200">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">Company Name</label>
              <input value={formData.companyName} onChange={e=>setFormData({...formData, companyName:e.target.value})} className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] text-slate-800" placeholder="Business Name" />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">GST Number</label>
              <input value={formData.gstNumber} onChange={e=>setFormData({...formData, gstNumber:e.target.value})} className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] text-slate-800" placeholder="22AAAAA0000A1Z5" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">Company Logo URL</label>
              <input value={formData.logo} onChange={e=>setFormData({...formData, logo:e.target.value})} placeholder="https://..." className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] text-slate-800" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">Full Address</label>
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
            
            <div className="md:col-span-2 pt-4 border-t border-slate-100 mt-2">
              <h3 className="text-base font-bold text-slate-800">Invoice Defaults</h3>
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">Invoice Prefix</label>
              <input value={formData.invoicePrefix} onChange={e=>setFormData({...formData, invoicePrefix:e.target.value})} className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] text-slate-800" placeholder="INV-" />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">Tax Default (%)</label>
              <input value={formData.taxPercentage} type="number" onChange={e=>setFormData({...formData, taxPercentage:e.target.value})} className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] text-slate-800" />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">Currency</label>
              <input value={formData.currency} onChange={e=>setFormData({...formData, currency:e.target.value})} className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] text-slate-800" />
            </div>
          </div>
          
          <div className="pt-4 flex justify-end">
            <button disabled={loading} type="submit" className="bg-[#10B981] hover:bg-[#059669] text-white px-6 py-2.5 rounded-lg font-semibold text-sm shadow-sm transition-all">
              {loading ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BillingSettings;
