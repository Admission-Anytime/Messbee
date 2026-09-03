import React, { useState } from "react";
import { 
  CreditCardIcon, 
  PlusIcon, 
  EllipsisVerticalIcon, 
  TrashIcon, 
  CheckCircleIcon,
  ShieldCheckIcon,
  BuildingOfficeIcon,
  DocumentDuplicateIcon,
  XMarkIcon,
  QrCodeIcon
} from "@heroicons/react/24/outline";

// ✅ Import Toastify
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const PaymentMethods = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("card"); // 'card' or 'upi'
  const [isProcessing, setIsProcessing] = useState(false);

  // Mock Data
  const [methods, setMethods] = useState([
    { id: 1, type: "card", brand: "Visa", last4: "4242", expiry: "12/2026", isDefault: true },
    { id: 2, type: "card", brand: "Mastercard", last4: "8831", expiry: "08/2025", isDefault: false },
    { id: 3, type: "card", brand: "Amex", last4: "1004", expiry: "11/2024", isDefault: false },
  ]);

  const [upiMethods, setUpiMethods] = useState([
    { id: 1, vpa: "acme@okaxis", bank: "Unified Payments Interface", isDefault: false }
  ]);

  // --- ACTIONS ---
  const handleAddMethod = (e) => {
    e.preventDefault();
    setIsProcessing(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsProcessing(false);
      setIsModalOpen(false);
      toast.success("Payment method added successfully!");
    }, 2000);
  };

  const handleSetDefault = (id, type) => {
      toast.info("Updating default payment method...");
      setTimeout(() => {
          // Logic to update state (mock)
          const updatedMethods = methods.map(m => ({ ...m, isDefault: m.id === id }));
          setMethods(updatedMethods);
          toast.success("Default payment method updated!");
      }, 1000);
  };

  const handleRemove = (id) => {
      if(window.confirm("Are you sure you want to remove this payment method?")) {
          setMethods(methods.filter(m => m.id !== id));
          toast.error("Payment method removed.");
      }
  };

  const handleCopyGST = () => {
      navigator.clipboard.writeText("36AAACA1234A1Z5");
      toast.success("GST ID copied to clipboard!");
  };

  const handleEditBilling = () => {
      toast.info("Billing address edit mode enabled (Simulated)");
  };

  return (
   <div className="min-h-screen bg-[#F8FAFC] p-3 sm:p-4 lg:p-5 xl:p-6 font-['Urbanist'] pb-12 lg:pb-14 relative">
      
      {/* ✅ FIXED: High Z-Index for Toasts */}
      <ToastContainer style={{ zIndex: 99999 }} position="top-right" />

      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-center">
                 <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
              </div>
              <div>
                 <h1 className="text-2xl font-bold tracking-tight text-slate-900">Payment Methods</h1>
                 <p className="text-gray-500 text-[13px] mt-1 font-medium">Manage your cards, UPI IDs, and billing information</p>
              </div>
           </div>
           <button 
             onClick={() => setIsModalOpen(true)}
             className="w-full md:w-auto px-5 py-2.5 bg-[#00B050] hover:bg-[#009b45] text-white text-sm font-bold rounded-lg shadow-lg shadow-emerald-100 flex items-center justify-center gap-2 transition-all active:scale-95"
           >
              <PlusIcon className="w-5 h-5" /> Add Payment Method
           </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 xl:grid-cols-3 gap-4 lg:gap-5 xl:gap-6">
           
           {/* --- LEFT COLUMN: PAYMENT METHODS --- */}
           <div className="lg:col-span-3 xl:col-span-2 space-y-6">
              
              {/* Default Method */}
              <section>
                 <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Default Payment Method</h3>
                 {methods.filter(m => m.isDefault).map(method => (
                    <div key={method.id} className="bg-white p-5 rounded-2xl border border-emerald-500 shadow-md shadow-emerald-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-all">
                       <div className="flex items-center gap-4">
                          <div className="w-12 h-8 bg-slate-900 rounded-md flex items-center justify-center text-white text-[10px] font-bold">
                             {method.brand}
                          </div>
                          <div>
                             <div className="flex items-center gap-3">
                                <span className="font-bold text-slate-900">{method.brand} ending in {method.last4}</span>
                                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded uppercase">Primary</span>
                             </div>
                             <p className="text-xs text-slate-500 mt-0.5">Expiry {method.expiry}</p>
                          </div>
                       </div>
                       <button className="text-slate-400 hover:text-slate-600"><EllipsisVerticalIcon className="w-6 h-6" /></button>
                    </div>
                 ))}
              </section>

              {/* Saved Cards */}
              <section>
                 <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Saved Cards</h3>
                 <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                    {methods.filter(m => !m.isDefault).map(method => (
                       <div key={method.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                          <div className="flex justify-between items-start mb-4">
                             <div className="w-10 h-7 bg-gray-100 rounded flex items-center justify-center text-slate-500 text-[9px] font-bold">{method.brand}</div>
                             <button className="text-slate-300 hover:text-slate-500"><EllipsisVerticalIcon className="w-5 h-5" /></button>
                          </div>
                          <div className="font-bold text-slate-900 mb-1">{method.brand} ending in {method.last4}</div>
                          <div className="text-xs text-slate-500 mb-4">Expiry {method.expiry}</div>
                          <div className="flex items-center gap-4 text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                             <button onClick={() => handleSetDefault(method.id, 'card')} className="text-slate-400 hover:text-emerald-600 transition-colors">Set as Default</button>
                             <button onClick={() => handleRemove(method.id)} className="text-red-400 hover:text-red-600 transition-colors">Remove</button>
                          </div>
                       </div>
                    ))}
                 </div>
              </section>

              {/* UPI IDs */}
              <section>
                 <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">UPI IDs</h3>
                 <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                    {upiMethods.map(upi => (
                       <div key={upi.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                          <div className="flex justify-between items-start mb-4">
                             <div className="w-8 h-8 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-500"><QrCodeIcon className="w-4 h-4" /></div>
                             <button className="text-slate-300 hover:text-slate-500"><EllipsisVerticalIcon className="w-5 h-5" /></button>
                          </div>
                          <div className="font-bold text-slate-900 mb-1">{upi.vpa}</div>
                          <div className="text-xs text-slate-500 mb-4">{upi.bank}</div>
                          <div className="flex items-center gap-4 text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                             <button className="text-slate-400 hover:text-emerald-600 transition-colors">Set as Default</button>
                             <button className="text-red-400 hover:text-red-600 transition-colors">Remove</button>
                          </div>
                       </div>
                    ))}
                 </div>
              </section>
           </div>

           {/* --- RIGHT COLUMN: BILLING DETAILS --- */}
           <div className="lg:col-span-2 xl:col-span-1 space-y-4">
              
              {/* Billing Address Card */}
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                 <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-slate-900">Billing Details</h3>
                    <button onClick={handleEditBilling} className="text-xs font-bold text-emerald-600 hover:underline">Edit</button>
                 </div>
                 
                 <div className="space-y-4">
                    <div>
                       <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Billing Address</label>
                       <p className="text-sm font-medium text-slate-700 leading-relaxed">
                          Acme Solutions Pvt Ltd<br/>
                          12th Floor, Cyber Plaza<br/>
                          Hitech City, Hyderabad<br/>
                          Telangana - 500081, India
                       </p>
                    </div>
                    
                    <div>
                       <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">GST / Tax ID</label>
                       <div className="flex items-center gap-2">
                          <code className="bg-slate-50 px-2 py-1 rounded text-sm text-slate-600 border border-slate-100">36AAACA1234A1Z5</code>
                          <button onClick={handleCopyGST} className="text-slate-400 hover:text-slate-600 cursor-pointer" title="Copy GST"><DocumentDuplicateIcon className="w-4 h-4" /></button>
                       </div>
                    </div>
                 </div>

                 <div className="mt-5 bg-blue-50 border border-blue-100 p-3 rounded-xl flex items-start gap-2.5">
                    <CheckCircleIcon className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-blue-700 leading-relaxed">
                       Your billing information is included in all your invoices. Ensure these details are correct for tax compliance.
                    </p>
                 </div>
              </div>

              {/* Security Badge */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                 <div className="flex items-center gap-2 mb-2">
                    <ShieldCheckIcon className="w-5 h-5 text-slate-400" />
                    <h3 className="font-bold text-slate-700">Secure Payments</h3>
                 </div>
                 <p className="text-xs text-slate-500 leading-relaxed">
                    We use industry-standard encryption to protect your payment details. Card information is never stored directly on our servers.
                 </p>
              </div>

           </div>
        </div>
      </div>

      {/* --- ADD PAYMENT METHOD MODAL --- */}
      {isModalOpen && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
               
               <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                  <h3 className="text-lg font-bold text-slate-900">Add Payment Method</h3>
                  <button onClick={() => setIsModalOpen(false)}><XMarkIcon className="w-5 h-5 text-slate-400 hover:text-slate-600" /></button>
               </div>

               {/* Tabs */}
               <div className="flex border-b border-gray-100">
                  <button 
                    onClick={() => setActiveTab('card')}
                    className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'card' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                  >
                     Credit/Debit Card
                  </button>
                  <button 
                    onClick={() => setActiveTab('upi')}
                    className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'upi' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                  >
                     UPI
                  </button>
               </div>

               <form onSubmit={handleAddMethod} className="p-6 space-y-5">
                  
                  {activeTab === 'card' ? (
                     <>
                        <div>
                           <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Cardholder Name</label>
                           <input type="text" placeholder="John Doe" className="w-full px-4 py-2.5 bg-slate-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none" required />
                        </div>
                        <div>
                           <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Card Number</label>
                           <div className="relative">
                              <input type="text" placeholder="0000 0000 0000 0000" className="w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none" required />
                              <CreditCardIcon className="w-5 h-5 text-slate-400 absolute right-3 top-2.5" />
                           </div>
                        </div>
                        <div className="flex gap-4">
                           <div className="flex-1">
                              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Expiry Date</label>
                              <input type="text" placeholder="MM / YY" className="w-full px-4 py-2.5 bg-slate-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none" required />
                           </div>
                           <div className="flex-1">
                              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">CVV</label>
                              <input type="password" placeholder="•••" className="w-full px-4 py-2.5 bg-slate-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none" required />
                           </div>
                        </div>
                     </>
                  ) : (
                     <div className="py-4">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">UPI ID / VPA</label>
                        <input type="text" placeholder="username@bank" className="w-full px-4 py-2.5 bg-slate-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none" required />
                        <p className="text-xs text-slate-400 mt-2">A verification request will be sent to your UPI app.</p>
                     </div>
                  )}

                  <div className="flex items-center gap-2 pt-2">
                     <input type="checkbox" id="default" className="w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500" />
                     <label htmlFor="default" className="text-sm font-medium text-slate-600 cursor-pointer">Set as primary payment method</label>
                  </div>

                  <div className="flex gap-3 pt-4">
                     <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 bg-white border border-gray-200 text-slate-600 text-sm font-bold rounded-xl hover:bg-slate-50">Cancel</button>
                     <button 
                        type="submit" 
                        disabled={isProcessing}
                        className="flex-1 py-3 bg-[#00B050] hover:bg-[#009b45] text-white text-sm font-bold rounded-xl shadow-lg shadow-emerald-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                     >
                        {isProcessing ? (
                           <>
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                              Processing...
                           </>
                        ) : (
                           "Add Method"
                        )}
                     </button>
                  </div>

               </form>
            </div>
         </div>
      )}

    </div>
  );
};

export default PaymentMethods;