import React, { useState, useContext, useEffect } from "react";
import {
   CurrencyRupeeIcon,
   CheckCircleIcon,
   RocketLaunchIcon,
   InformationCircleIcon,
   XMarkIcon
} from "@heroicons/react/24/outline";

// --- CONTEXT ---
import { userContext } from "../../context/Context";

// ✅ Import Toastify
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Helper for currency formatting
const formatCurrency = (amount) => {
   return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
   }).format(amount);
};

const AddonsWCC = () => {
   const { user, updateUser } = useContext(userContext);
   const [isModalOpen, setIsModalOpen] = useState(false);
   const [balance, setBalance] = useState(user?.wccCredit || 618.51);

   // Sync balance with user context if it changes
   useEffect(() => {
      if (user?.wccCredit !== undefined) {
         setBalance(user.wccCredit);
      }
   }, [user?.wccCredit]);

   // --- MODAL STATE ---
   const [selectedAmount, setSelectedAmount] = useState(5000);
   const [customAmount, setCustomAmount] = useState("");
   const [paymentMethod, setPaymentMethod] = useState("card"); // 'card' or 'netbanking'

   const finalAmount = customAmount ? Number(customAmount) : selectedAmount;
   const taxes = finalAmount * 0.18; // 18% GST
   const totalPayable = finalAmount + taxes;

   const handlePayment = () => {
      // Validate minimum amount
      if (finalAmount < 100) {
         toast.error("Minimum amount must be ₹100 or more.");
         return;
      }

      // ✅ Show the base amount in toast as requested
      toast.success(`Processing payment of ${formatCurrency(finalAmount)}...`, {
         autoClose: 2000
      });

      setTimeout(() => {
         const newBalance = balance + finalAmount;
         setBalance(newBalance);
         
         // Determine Plan Name based on amount
         let newPlanName = user?.planName || "Standard";
         if (finalAmount === 500) newPlanName = "Standard";
         else if (finalAmount === 1000) newPlanName = "Professional";
         else if (finalAmount === 5000) newPlanName = "Enterprise";

         // Update global user context
         if (user) {
            updateUser({
               ...user,
               wccCredit: newBalance,
               planName: newPlanName
            });
         }
         
         setIsModalOpen(false);
         toast.success("Balance updated successfully!");
      }, 2000);
   };

   const handleRequestService = () => {
      toast.info("Service request sent! Our team will contact you shortly.");
   };

   const handleContactSupport = () => {
      window.location.href = "mailto:support@messbee.com?subject=Support Request";
   };

   return (
      <div className="min-h-screen bg-[#F8FAFC] p-6 lg:p-10 font-['Urbanist'] relative">
         <ToastContainer />

         <div className="max-w-5xl mx-auto space-y-8">

            {/* --- PAGE HEADER --- */}
            <div className="flex justify-between items-center">
               <h1 className="text-2xl font-bold text-slate-900">WTB Add-ons</h1>
               <button className="text-sm font-bold text-slate-400 hover:text-slate-600 flex items-center gap-1">
                  <InformationCircleIcon className="w-4 h-4" /> Help Center
               </button>
            </div>

            {/* --- CARD 1: WCC CREDITS --- */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
               <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                  <div className="space-y-3">
                     <div className="flex items-center gap-3">
                        <h2 className="text-lg font-bold text-slate-900">WhatsApp Conversation Credit (WCC)</h2>
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-bold uppercase rounded-md">Popular</span>
                     </div>
                     <p className="text-slate-500 text-sm max-w-lg leading-relaxed">
                        Top up your account balance to ensure uninterrupted messaging for your WhatsApp campaigns.
                     </p>
                     <button className="text-emerald-500 text-xs font-bold hover:underline">View WCC Pricing ↗</button>
                  </div>
               </div>

               <div className="mt-8 bg-slate-50 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-6">
                     <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Available Credit</span>
                        <div className="text-3xl font-extrabold text-slate-900 flex items-center gap-2">
                           {formatCurrency(balance)}
                           <span className="bg-emerald-100 text-emerald-600 p-1 rounded-md"><CurrencyRupeeIcon className="w-4 h-4" /></span>
                        </div>
                     </div>
                     <div className="hidden md:block w-px h-12 bg-gray-200"></div>
                     <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-orange-100 shadow-sm">
                        <span className="text-lg">🎁</span>
                        <span className="text-xs font-medium text-slate-600">Get WCC as cashback. <button className="text-emerald-600 font-bold hover:underline">Learn more</button></span>
                     </div>
                  </div>

                  <button
                     onClick={() => setIsModalOpen(true)}
                     className="px-6 py-2.5 bg-[#00B050] hover:bg-[#009b45] text-white text-sm font-bold rounded-lg shadow-lg shadow-emerald-100 transition-all flex items-center gap-2"
                  >
                     <CurrencyRupeeIcon className="w-4 h-4" /> Add Credit
                  </button>
               </div>
            </div>

            {/* --- CARD 2: SERVICES --- */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 flex flex-col md:flex-row items-center justify-between gap-6">
               <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                     <RocketLaunchIcon className="w-6 h-6 text-indigo-500" />
                  </div>
                  <div>
                     <h3 className="text-lg font-bold text-slate-900">Done-for-you setup services</h3>
                     <p className="text-sm text-slate-500 max-w-md mt-1 leading-relaxed">
                        Get expert setup, trust the process, and scale your WhatsApp operations effortlessly.
                     </p>
                  </div>
               </div>
               {/* ✅ Added Interaction */}
               <button
                  onClick={handleRequestService}
                  className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold rounded-lg shadow-lg shadow-emerald-100 transition-all"
               >
                  Request Service
               </button>
            </div>

            {/* --- FEATURES GRID --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               {[
                  { title: "Full Integration", desc: "Complete API setup" },
                  { title: "Template Support", desc: "Approved in 24 hours" },
                  { title: "Scale Ready", desc: "Built for growth" }
               ].map((item, i) => (
                  <div key={i} className="bg-white p-5 rounded-xl border border-gray-100 flex items-center gap-3">
                     <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500">
                        <CheckCircleIcon className="w-5 h-5" />
                     </div>
                     <div>
                        <h4 className="text-xs font-bold text-slate-900">{item.title}</h4>
                        <p className="text-[10px] text-slate-400">{item.desc}</p>
                     </div>
                  </div>
               ))}
            </div>

            {/* --- SUPPORT BANNER --- */}
            <div className="bg-blue-50/50 rounded-xl p-5 border border-blue-100 flex flex-col md:flex-row justify-between items-center gap-4">
               <div className="flex items-center gap-3">
                  <InformationCircleIcon className="w-6 h-6 text-blue-500" />
                  <div>
                     <h4 className="text-xs font-bold text-slate-800">Need help with your credits or services?</h4>
                     <p className="text-[10px] text-slate-500">Our support team is available 24/7 for technical assistance.</p>
                  </div>
               </div>
               {/* ✅ Added Email Link */}
               <button
                  onClick={handleContactSupport}
                  className="px-4 py-2 bg-white border border-blue-200 text-blue-600 text-xs font-bold rounded-lg hover:bg-blue-50"
               >
                  Contact Support
               </button>
            </div>

         </div>

         {/* --- MODAL (POPUP) --- */}
         {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
               <div className="bg-white w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200">

                  {/* Header */}
                  <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-start">
                     <div className="flex gap-3">
                        <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                           <CurrencyRupeeIcon className="w-6 h-6" />
                        </div>
                        <div>
                           <h3 className="text-lg font-bold text-slate-900">Add WCC Credits</h3>
                           <p className="text-xs text-slate-500">Top up your balance instantly</p>
                        </div>
                     </div>
                     <button onClick={() => setIsModalOpen(false)}><XMarkIcon className="w-5 h-5 text-slate-400 hover:text-slate-600" /></button>
                  </div>

                  <div className="p-6 space-y-6">

                     {/* Amount Selection */}
                     <div>
                        <label className="text-xs font-bold text-slate-500 uppercase mb-3 block">Select Amount</label>
                        <div className="grid grid-cols-3 gap-3">
                           {[500, 1000, 5000].map((amt) => (
                              <button
                                 key={amt}
                                 onClick={() => { setSelectedAmount(amt); setCustomAmount(""); }}
                                 className={`relative py-3 rounded-xl border flex flex-col items-center justify-center transition-all
                               ${selectedAmount === amt && !customAmount
                                       ? "border-emerald-500 bg-emerald-50 text-emerald-700 ring-1 ring-emerald-500"
                                       : "border-gray-200 hover:border-emerald-300 hover:bg-slate-50"
                                    }`}
                              >
                                 {amt === 5000 && <span className="absolute -top-2 bg-emerald-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">BEST VALUE</span>}
                                 <span className="text-lg font-bold">₹{amt}</span>
                                 <span className="text-[9px] font-medium opacity-60 uppercase">{amt === 500 ? "Standard" : amt === 1000 ? "Professional" : "Enterprise"}</span>
                              </button>
                           ))}
                        </div>
                     </div>

                     {/* Custom Amount */}
                     <div>
                        <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Or Enter Custom Amount</label>
                        <div className="relative">
                           <span className="absolute left-4 top-3 text-slate-400">₹</span>
                           <input
                              type="number"
                              min="100"
                              placeholder="Enter amount (min. ₹100)"
                              value={customAmount}
                              onChange={(e) => setCustomAmount(e.target.value)}
                              className="w-full pl-8 pr-4 py-2.5 bg-slate-50 border border-gray-200 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                           />
                        </div>
                     </div>

                     {/* Payment Method */}
                     <div>
                        <div className="flex justify-between items-center mb-3">
                           <label className="text-xs font-bold text-slate-500 uppercase">Payment Method</label>
                           <button className="text-[10px] font-bold text-emerald-600 hover:underline">+ Add New</button>
                        </div>
                        <div className="space-y-3">
                           <div onClick={() => setPaymentMethod('card')} className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${paymentMethod === 'card' ? 'border-emerald-500 bg-emerald-50/30 ring-1 ring-emerald-500' : 'border-gray-200'}`}>
                              <div className="flex items-center gap-3">
                                 <div className="w-8 h-5 bg-slate-800 rounded flex items-center justify-center text-white text-[8px] font-bold">VISA</div>
                                 <div className="text-sm font-bold text-slate-700">•••• 4242 <span className="text-[10px] font-normal text-slate-400 block">Expires 12/28</span></div>
                              </div>
                              <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${paymentMethod === 'card' ? 'border-emerald-500 bg-emerald-500' : 'border-gray-300'}`}>
                                 {paymentMethod === 'card' && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
                              </div>
                           </div>

                           <div onClick={() => setPaymentMethod('netbanking')} className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${paymentMethod === 'netbanking' ? 'border-emerald-500 bg-emerald-50/30 ring-1 ring-emerald-500' : 'border-gray-200'}`}>
                              <div className="flex items-center gap-3">
                                 <div className="w-8 h-5 bg-gray-200 rounded flex items-center justify-center text-slate-500 text-[8px] font-bold">Bank</div>
                                 <div className="text-sm font-bold text-slate-700">•••• 8812 <span className="text-[10px] font-normal text-slate-400 block">Expires 09/25</span></div>
                              </div>
                              <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${paymentMethod === 'netbanking' ? 'border-emerald-500 bg-emerald-500' : 'border-gray-300'}`}>
                                 {paymentMethod === 'netbanking' && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
                              </div>
                           </div>
                        </div>
                     </div>

                     {/* Summary */}
                     <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                        <div className="flex justify-between text-xs text-slate-500">
                           <span>Top-up Amount</span>
                           <span className="font-bold">₹{finalAmount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-xs text-slate-500">
                           <span>Applicable Taxes (18%)</span>
                           <span className="font-bold">₹{taxes.toFixed(2)}</span>
                        </div>
                        <div className="border-t border-gray-200 my-2 pt-2 flex justify-between items-center">
                           <span className="text-sm font-bold text-slate-900">Total Amount</span>
                           <span className="text-lg font-extrabold text-emerald-600">₹{totalPayable.toFixed(2)}</span>
                        </div>
                     </div>

                     <button
                        onClick={handlePayment}
                        className="w-full py-3.5 bg-[#00B050] hover:bg-[#009b45] text-white font-bold rounded-xl shadow-lg shadow-emerald-200 transition-all flex items-center justify-center gap-2"
                     >
                        Confirm & Pay
                     </button>

                  </div>
               </div>
            </div>
         )}

      </div>
   );
};

export default AddonsWCC;