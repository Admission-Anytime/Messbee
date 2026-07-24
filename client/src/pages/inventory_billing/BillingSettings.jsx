import React, { useState, useEffect } from 'react';
import axios from 'axios';
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
      const res = await axios.get('/api/tenant-settings', { withCredentials: true });
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
      await axios.put('/api/tenant-settings', { billing: formData }, { withCredentials: true });
      toast.success('Billing Settings updated successfully!');
    } catch (error) {
      toast.error('Failed to update settings');
    }
    setLoading(false);
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Billing & Invoice Settings</h1>
      <div className="bg-white p-6 rounded-xl shadow-sm max-w-3xl border border-slate-200">
        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="font-medium text-slate-700">Company Name</label><input value={formData.companyName} onChange={e=>setFormData({...formData, companyName:e.target.value})} className="w-full border p-2 rounded mt-1" /></div>
            <div><label className="font-medium text-slate-700">GST Number</label><input value={formData.gstNumber} onChange={e=>setFormData({...formData, gstNumber:e.target.value})} className="w-full border p-2 rounded mt-1" /></div>
            <div className="md:col-span-2"><label className="font-medium text-slate-700">Company Logo URL</label><input value={formData.logo} onChange={e=>setFormData({...formData, logo:e.target.value})} placeholder="https://..." className="w-full border p-2 rounded mt-1" /></div>
            <div className="md:col-span-2"><label className="font-medium text-slate-700">Full Address</label><textarea value={formData.address} onChange={e=>setFormData({...formData, address:e.target.value})} className="w-full border p-2 rounded mt-1" rows="2"></textarea></div>
            <div><label className="font-medium text-slate-700">City</label><input value={formData.city} onChange={e=>setFormData({...formData, city:e.target.value})} className="w-full border p-2 rounded mt-1" /></div>
            <div><label className="font-medium text-slate-700">State</label><input value={formData.state} onChange={e=>setFormData({...formData, state:e.target.value})} className="w-full border p-2 rounded mt-1" /></div>
            <div><label className="font-medium text-slate-700">Pincode</label><input value={formData.pincode} onChange={e=>setFormData({...formData, pincode:e.target.value})} className="w-full border p-2 rounded mt-1" /></div>
            
            <div className="md:col-span-2 pt-4 border-t mt-2"><h3 className="text-lg font-bold">Invoice Defaults</h3></div>
            <div><label className="font-medium text-slate-700">Invoice Prefix</label><input value={formData.invoicePrefix} onChange={e=>setFormData({...formData, invoicePrefix:e.target.value})} className="w-full border p-2 rounded mt-1" /></div>
            <div><label className="font-medium text-slate-700">Tax Default (%)</label><input value={formData.taxPercentage} type="number" onChange={e=>setFormData({...formData, taxPercentage:e.target.value})} className="w-full border p-2 rounded mt-1" /></div>
            <div><label className="font-medium text-slate-700">Currency</label><input value={formData.currency} onChange={e=>setFormData({...formData, currency:e.target.value})} className="w-full border p-2 rounded mt-1" /></div>
          </div>
          
          <div className="pt-4 flex justify-end">
            <button disabled={loading} type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 rounded-lg font-bold shadow transition-colors">
              {loading ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BillingSettings;
