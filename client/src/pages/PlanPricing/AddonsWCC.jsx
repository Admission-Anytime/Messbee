import React, { useState, useContext } from "react";
import { userContext } from "../../context/Context";
import {
   CurrencyRupeeIcon,
   CheckCircleIcon,
   RocketLaunchIcon,
   InformationCircleIcon,
   XMarkIcon
} from "@heroicons/react/24/outline";

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
   const balance = user?.credits != null ? parseFloat(user.credits) : 0;

   // --- MODAL STATE ---
   const [selectedAmount, setSelectedAmount] = useState(5000);
   const [customAmount, setCustomAmount] = useState("");
   const [paymentMethod, setPaymentMethod] = useState("card"); // 'card' or 'netbanking'

   // --- ADD NEW PAYMENT METHOD MODAL ---
   const [isAddPaymentOpen, setIsAddPaymentOpen] = useState(false);
   const [newCard, setNewCard] = useState({ number: "", expiry: "", cvv: "", name: "" });

   // --- REQUEST SERVICE MODAL ---
   const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
   const [serviceData, setServiceData] = useState({ type: "full_integration", description: "", priority: "normal" });

   const finalAmount = customAmount ? Number(customAmount) : selectedAmount;
   const taxes = finalAmount * 0.18; // 18% GST
   const totalPayable = finalAmount + taxes;

   const handlePayment = async () => {
      if (finalAmount < 100) {
         toast.error("Minimum amount should be ₹100", { autoClose: 3000 });
         return;
      }

      // ✅ Use Toast instead of Alert
      toast.success(`Processing payment of ${formatCurrency(totalPayable)}...`, {
         autoClose: 2000
      });

      // Simulate payment delay, then persist to backend
      setTimeout(async () => {
         try {
            const newCredits = parseFloat((balance + finalAmount).toFixed(2));
            
            const { default: axios } = await import("../../context/axios");

            // Record the transaction - The backend will now automatically add the credits
            await axios.post("/billing/transactions", {
               desc: "WCC Top-up Credit",
               amount: totalPayable,
               wccAmount: finalAmount,
               status: "Paid"
            });
            
            // Fetch latest user data to get accurate credits balance
            const userRes = await axios.get("/auth/me");
            
            // Update local state
            if (userRes.data && userRes.data.data) {
               updateUser(userRes.data.data);
            } else if (user) {
               updateUser({
                  ...user,
                  credits: newCredits
               });
            }
            setIsModalOpen(false);
            toast.success("Balance updated successfully!");
         } catch (error) {
            console.error("Failed to update balance:", error);
            toast.error("Payment successful but failed to sync balance. Please contact support.");
         }
      }, 2000);
   };

   const handleRequestService = () => {
      if (!serviceData.description.trim()) {
         toast.error("Please describe your service requirements.", { autoClose: 3000 });
         return;
      }
      toast.success("Service request submitted! Our team will contact you within 24 hours.", { autoClose: 4000 });
      setServiceData({ type: "full_integration", description: "", priority: "normal" });
      setIsServiceModalOpen(false);
   };

   const handleAddPaymentMethod = () => {
      if (!newCard.number || !newCard.expiry || !newCard.cvv || !newCard.name) {
         toast.error("Please fill in all card details.", { autoClose: 3000 });
         return;
      }
      toast.success("Payment method added successfully!", { autoClose: 3000 });
      setNewCard({ number: "", expiry: "", cvv: "", name: "" });
      setIsAddPaymentOpen(false);
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
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-center">
                     <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
                  </div>
                  <div>
                     <h1 className="text-2xl font-bold tracking-tight text-slate-900">Add-ons (WCC)</h1>
                     <p className="text-gray-500 text-[13px] mt-1 font-medium">Top up WhatsApp Conversation Credits for your campaigns</p>
                  </div>
               </div>
               <button className="text-sm font-bold text-slate-400 hover:text-slate-600 flex items-center gap-1">
                  <InformationCircleIcon className="w-4 h-4" /> Help Center
               </button>
            </div>

            {/* --- CARD 1: WCC CREDITS --- */}
            <div className="bg-white rounded-3xl border border-emerald-100 shadow-md shadow-emerald-500/5 p-8 relative overflow-hidden group hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300">
               <div className="absolute -top-20 -right-20 w-64 h-64 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-full blur-3xl opacity-60 group-hover:scale-125 transition-transform duration-700 pointer-events-none"></div>
               
               <div className="relative z-10 flex flex-col md:flex-row justify-between items-start gap-6">
                  <div className="space-y-3">
                     <div className="flex items-center gap-3">
                        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">WhatsApp Conversation Credit (WCC)</h2>
                        <span className="px-2.5 py-1 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-600 text-[10px] font-black uppercase tracking-wider rounded-md border border-blue-100/50 shadow-sm">Popular</span>
                     </div>
                     <p className="text-slate-500 text-sm max-w-lg leading-relaxed font-medium">
                        Top up your account balance to ensure uninterrupted messaging for your WhatsApp campaigns.
                     </p>
                     <button className="text-emerald-500 text-xs font-bold hover:text-emerald-600 transition-colors inline-flex items-center gap-1">View WCC Pricing <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M7 17l9.2-9.2M17 17V7H7"/></svg></button>
                  </div>
               </div>

               <div className="relative z-10 mt-8 bg-gradient-to-r from-slate-50 to-slate-50/50 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 border border-slate-100">
                  <div className="flex items-center gap-6">
                     <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Available Credit</span>
                        <div className="text-3xl font-black text-slate-900 flex items-center gap-2 mt-1">
                           {formatCurrency(balance)}
                           <span className="bg-emerald-100/80 text-emerald-600 p-1.5 rounded-lg shadow-sm"><CurrencyRupeeIcon className="w-4 h-4" /></span>
                        </div>
                     </div>
                     <div className="hidden md:block w-px h-12 bg-slate-200/60"></div>
                     <div className="flex items-center gap-3 bg-white px-5 py-2.5 rounded-full border border-orange-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                        <span className="text-xl drop-shadow-sm">🎁</span>
                        <span className="text-xs font-semibold text-slate-600">Get WCC as cashback. <span className="text-emerald-600 font-bold hover:underline">Learn more</span></span>
                     </div>
                  </div>

                  <button
                     onClick={() => setIsModalOpen(true)}
                     className="px-8 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:-translate-y-0.5 transition-all flex items-center gap-2 group/btn"
                  >
                     <CurrencyRupeeIcon className="w-5 h-5 group-hover/btn:scale-110 transition-transform" /> Add Credit
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
               <button
                  onClick={() => setIsServiceModalOpen(true)}
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
                                 className={`relative py-4 rounded-xl border flex flex-col items-center justify-center transition-all duration-300 cursor-pointer
                               ${selectedAmount === amt && !customAmount
                                       ? "border-emerald-500 bg-emerald-50/60 text-emerald-700 ring-2 ring-emerald-500 shadow-md scale-105 z-10"
                                       : "border-slate-200 hover:border-emerald-300 hover:bg-slate-50 hover:-translate-y-1"
                                    }`}
                              >
                                 {amt === 5000 && <span className="absolute -top-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-sm tracking-wider">BEST VALUE</span>}
                                 <span className="text-xl font-extrabold">₹{amt}</span>
                                 <span className="text-[9px] font-bold opacity-70 uppercase tracking-widest mt-1">{amt === 500 ? "Standard" : amt === 1000 ? "Pro" : "Enterprise"}</span>
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
                           <button onClick={() => setIsAddPaymentOpen(true)} className="text-[10px] font-bold text-emerald-600 hover:underline">+ Add New</button>
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
                        disabled={finalAmount < 100}
                        className={`w-full py-4 text-white font-bold rounded-2xl shadow-lg transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${
                           finalAmount < 100
                              ? "bg-slate-300 shadow-none cursor-not-allowed text-slate-500"
                              : "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:-translate-y-0.5"
                        }`}
                     >
                        Confirm & Pay
                     </button>

                  </div>
               </div>
            </div>
         )}

         {/* --- ADD NEW PAYMENT METHOD MODAL --- */}
         {isAddPaymentOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
               <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl">
                  <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                     <div>
                        <h3 className="text-lg font-bold text-slate-900">Add Payment Method</h3>
                        <p className="text-xs text-slate-500">Add a new card for future payments</p>
                     </div>
                     <button onClick={() => setIsAddPaymentOpen(false)}><XMarkIcon className="w-5 h-5 text-slate-400 hover:text-slate-600" /></button>
                  </div>
                  <div className="p-6 space-y-4">
                     <div>
                        <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">Cardholder Name</label>
                        <input
                           type="text"
                           placeholder="John Doe"
                           value={newCard.name}
                           onChange={(e) => setNewCard({ ...newCard, name: e.target.value })}
                           className="w-full px-4 py-2.5 bg-slate-50 border border-gray-200 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                        />
                     </div>
                     <div>
                        <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">Card Number</label>
                        <input
                           type="text"
                           placeholder="1234 5678 9012 3456"
                           maxLength={19}
                           value={newCard.number}
                           onChange={(e) => {
                              const val = e.target.value.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 ').slice(0, 19);
                              setNewCard({ ...newCard, number: val });
                           }}
                           className="w-full px-4 py-2.5 bg-slate-50 border border-gray-200 rounded-xl text-sm text-slate-900 tracking-wider focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                        />
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                           <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">Expiry Date</label>
                           <input
                              type="text"
                              placeholder="MM/YY"
                              maxLength={5}
                              value={newCard.expiry}
                              onChange={(e) => {
                                 let val = e.target.value.replace(/\D/g, '');
                                 if (val.length >= 2) val = val.slice(0, 2) + '/' + val.slice(2, 4);
                                 setNewCard({ ...newCard, expiry: val });
                              }}
                              className="w-full px-4 py-2.5 bg-slate-50 border border-gray-200 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                           />
                        </div>
                        <div>
                           <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">CVV</label>
                           <input
                              type="password"
                              placeholder="•••"
                              maxLength={4}
                              value={newCard.cvv}
                              onChange={(e) => setNewCard({ ...newCard, cvv: e.target.value.replace(/\D/g, '') })}
                              className="w-full px-4 py-2.5 bg-slate-50 border border-gray-200 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                           />
                        </div>
                     </div>
                     <button
                        onClick={handleAddPaymentMethod}
                        className="w-full py-3 bg-[#00B050] hover:bg-[#009b45] text-white font-bold rounded-xl shadow-lg shadow-emerald-200 transition-all mt-2"
                     >
                        Add Payment Method
                     </button>
                  </div>
               </div>
            </div>
         )}

         {/* --- REQUEST SERVICE MODAL --- */}
         {isServiceModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
               <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl">
                  <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                     <div className="flex gap-3">
                        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
                           <RocketLaunchIcon className="w-6 h-6" />
                        </div>
                        <div>
                           <h3 className="text-lg font-bold text-slate-900">Request Service</h3>
                           <p className="text-xs text-slate-500">Our experts will set everything up for you</p>
                        </div>
                     </div>
                     <button onClick={() => setIsServiceModalOpen(false)}><XMarkIcon className="w-5 h-5 text-slate-400 hover:text-slate-600" /></button>
                  </div>
                  <div className="p-6 space-y-5">
                     <div>
                        <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Service Type</label>
                        <div className="space-y-2">
                           {[
                              { value: "full_integration", label: "Full API Integration", desc: "Complete WhatsApp API setup end-to-end" },
                              { value: "template_setup", label: "Template Configuration", desc: "Message template creation & approval" },
                              { value: "chatbot_setup", label: "Chatbot & Automation", desc: "Automated workflows and bot setup" },
                              { value: "custom", label: "Custom Requirement", desc: "Describe your specific needs below" }
                           ].map((svc) => (
                              <div
                                 key={svc.value}
                                 onClick={() => setServiceData({ ...serviceData, type: svc.value })}
                                 className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                                    serviceData.type === svc.value
                                       ? 'border-indigo-500 bg-indigo-50/30 ring-1 ring-indigo-500'
                                       : 'border-gray-200 hover:border-indigo-200'
                                 }`}
                              >
                                 <div>
                                    <p className="text-sm font-bold text-slate-700">{svc.label}</p>
                                    <p className="text-[10px] text-slate-400">{svc.desc}</p>
                                 </div>
                                 <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                                    serviceData.type === svc.value ? 'border-indigo-500 bg-indigo-500' : 'border-gray-300'
                                 }`}>
                                    {serviceData.type === svc.value && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
                                 </div>
                              </div>
                           ))}
                        </div>
                     </div>
                     <div>
                        <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">Describe Your Requirements</label>
                        <textarea
                           rows={3}
                           placeholder="Tell us what you need help with..."
                           value={serviceData.description}
                           onChange={(e) => setServiceData({ ...serviceData, description: e.target.value })}
                           className="w-full px-4 py-2.5 bg-slate-50 border border-gray-200 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none resize-none"
                        />
                     </div>
                     <div>
                        <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Priority</label>
                        <div className="grid grid-cols-3 border border-gray-200 rounded-xl overflow-hidden">
                           {["normal", "high", "urgent"].map((p) => (
                              <button
                                 key={p}
                                 type="button"
                                 onClick={() => setServiceData({ ...serviceData, priority: p })}
                                 className={`py-2.5 text-xs font-bold capitalize transition-colors ${
                                    serviceData.priority === p
                                       ? 'bg-indigo-500 text-white'
                                       : 'bg-white text-slate-500 hover:bg-slate-50'
                                 }`}
                              >
                                 {p}
                              </button>
                           ))}
                        </div>
                     </div>
                     <button
                        onClick={handleRequestService}
                        className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-200 transition-all flex items-center justify-center gap-2"
                     >
                        <RocketLaunchIcon className="w-4 h-4" /> Submit Request
                     </button>
                  </div>
               </div>
            </div>
         )}

      </div>
   );
};

export default AddonsWCC;