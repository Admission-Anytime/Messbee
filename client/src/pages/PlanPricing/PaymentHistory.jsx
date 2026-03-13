import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
   BanknotesIcon,
   ClockIcon,
   MagnifyingGlassIcon,
   FunnelIcon,
   ArrowDownTrayIcon,
   ExclamationCircleIcon,
   ChevronLeftIcon,
   ChevronRightIcon,
   CalendarDaysIcon,
   Cog6ToothIcon,
   EyeIcon
} from "@heroicons/react/24/outline";

import { toast } from '../../utils/showToast';
import 'react-toastify/dist/ReactToastify.css';

const PaymentHistory = () => {
   const navigate = useNavigate();

   // --- STATES ---
   const [searchTerm, setSearchTerm] = useState("");
   const [filterStatus, setFilterStatus] = useState("All Status");
   const [currentPage, setCurrentPage] = useState(1);
   const [startDate, setStartDate] = useState("");
   const [endDate, setEndDate] = useState("");

   // --- MOCK DATA ---
   const allTransactions = [
      { id: "TXN-49201948", date: "12 Oct, 2023", time: "10:45 AM", desc: "WCC Top-up Credit", amount: "₹618.51", status: "Paid" },
      { id: "TXN-38294821", date: "01 Oct, 2023", time: "09:00 AM", desc: "Plan Renewal - Silver", amount: "₹2,499.00", status: "Paid" },
      { id: "TXN-88273612", date: "25 Sep, 2023", time: "11:15 PM", desc: "WCC Top-up Credit", amount: "₹1,000.00", status: "Processing" },
      { id: "TXN-11203948", date: "15 Sep, 2023", time: "04:30 PM", desc: "API Messaging Overage", amount: "₹150.25", status: "Failed" },
      { id: "TXN-38290012", date: "01 Sep, 2023", time: "09:00 AM", desc: "Plan Renewal - Silver", amount: "₹2,499.00", status: "Paid" },
      { id: "TXN-99887766", date: "20 Aug, 2023", time: "02:15 PM", desc: "WCC Top-up Credit", amount: "₹500.00", status: "Paid" }, // Added for pagination demo
   ];

   // --- FILTER LOGIC ---
   const filteredTransactions = allTransactions.filter((txn) => {
      const matchesSearch = txn.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === "All Status" || txn.status === filterStatus;
      return matchesSearch && matchesStatus;
   });

   // --- ACTIONS ---
   const handleDownload = (id) => {
      toast.info(`Downloading Invoice for ${id}...`, { autoClose: 1500 });
   };

   const handleErrorView = () => {
      toast.error("Payment Failed: Card declined by bank.", { autoClose: 3000 });
   };

   const handleViewInvoice = (id) => {
      navigate(`/admin/plan/invoice/${id}`);
   };

   const handleApplyFilter = () => {
      toast.success(`Filters Applied: ${filteredTransactions.length} results found.`);
      setCurrentPage(1); // Reset to page 1 on filter
   };

   const handleSettings = () => {
      navigate("/admin/plan/methods");
   };

   const handlePageChange = (page) => {
      setCurrentPage(page);
      toast.info(`Navigating to Page ${page}`);
   };

   // Helper for Status Badge
   const getStatusBadge = (status) => {
      const styles = {
         Paid: "bg-emerald-50 text-emerald-600 border-emerald-100",
         Processing: "bg-amber-50 text-amber-600 border-amber-100",
         Failed: "bg-red-50 text-red-600 border-red-100",
      };
      const colors = {
         Paid: "bg-emerald-500",
         Processing: "bg-amber-500",
         Failed: "bg-red-500",
      };

      return (
         <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${styles[status]}`}>
            <div className={`w-1.5 h-1.5 rounded-full ${colors[status]}`}></div> {status}
         </span>
      );
   };

   return (
      <div className="min-h-screen bg-[#F8FAFC] p-6 lg:p-10 font-['Urbanist'] pb-20 relative">

         {/* ✅ FIXED: Added Z-Index so toasts appear on top */}
         

         <div className="max-w-7xl mx-auto space-y-8">

            {/* --- HEADER --- */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
               <div>
                  <h1 className="text-2xl font-bold text-slate-900">Payment History</h1>
                  <p className="text-sm text-slate-500">Review transactions and download your official invoices.</p>
               </div>
               <button
                  onClick={handleSettings}
                  className="px-4 py-2 bg-white border border-gray-200 text-slate-700 text-sm font-bold rounded-lg shadow-sm hover:bg-gray-50 flex items-center gap-2 active:scale-95 transition-all"
               >
                  <Cog6ToothIcon className="w-4 h-4" /> Billing Settings
               </button>
            </div>

            {/* --- STATS CARDS --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
               <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between h-32">
                  <div className="flex items-center gap-3 mb-2">
                     <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600"><BanknotesIcon className="w-5 h-5" /></div>
                     <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Spent (Year)</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                     <h2 className="text-3xl font-extrabold text-slate-900">₹14,520.00</h2>
                     <span className="text-xs font-bold text-emerald-50 bg-emerald-50 px-1.5 py-0.5 rounded">↑ 12%</span>
                  </div>
               </div>

               <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between h-32">
                  <div className="flex items-center gap-3 mb-2">
                     <div className="p-2 bg-slate-50 rounded-lg text-slate-500"><ClockIcon className="w-5 h-5" /></div>
                     <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Last Payment</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                     <h2 className="text-3xl font-extrabold text-slate-900">₹618.51</h2>
                     <span className="text-sm font-medium text-slate-400">12 Oct 2023</span>
                  </div>
               </div>
            </div>

            {/* --- FILTERS (Now Functional) --- */}
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-center">
               <div className="relative flex-1 w-full">
                  <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-2.5 text-slate-400" />
                  <input
                     type="text"
                     value={searchTerm}
                     onChange={(e) => setSearchTerm(e.target.value)} // ✅ Live Search
                     placeholder="Search Transaction ID..."
                     className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-slate-200 outline-none"
                  />
               </div>

               <div className="flex items-center gap-2 w-full md:w-auto">
                  <div className="relative">
                     <CalendarDaysIcon className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                     <input
                        type="text"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        placeholder="mm/dd/yyyy"
                        className="w-36 pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium outline-none"
                     />
                  </div>
                  <span className="text-slate-400 text-sm">to</span>
                  <div className="relative">
                     <CalendarDaysIcon className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                     <input
                        type="text"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        placeholder="mm/dd/yyyy"
                        className="w-36 pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium outline-none"
                     />
                  </div>
               </div>

               <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 outline-none cursor-pointer"
               >
                  <option>All Status</option>
                  <option>Paid</option>
                  <option>Processing</option>
                  <option>Failed</option>
               </select>

               <button
                  onClick={handleApplyFilter}
                  className="px-6 py-2 bg-slate-900 text-white text-sm font-bold rounded-lg hover:bg-slate-800 flex items-center gap-2 active:scale-95 transition-all"
               >
                  <FunnelIcon className="w-4 h-4" /> Apply Filters
               </button>
            </div>

            {/* --- TABLE --- */}
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
               <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                     <thead>
                        <tr className="bg-slate-50/50 border-b border-gray-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
                           <th className="px-6 py-4">Date & Time</th>
                           <th className="px-6 py-4">Transaction ID</th>
                           <th className="px-6 py-4">Description</th>
                           <th className="px-6 py-4">Amount</th>
                           <th className="px-6 py-4">Status</th>
                           <th className="px-6 py-4 text-center">Actions</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-gray-50 text-sm font-medium text-slate-600">
                        {filteredTransactions.length > 0 ? (
                           filteredTransactions.map((txn, index) => (
                              <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                                 <td className="px-6 py-4">
                                    <div className="font-bold text-slate-900">{txn.date}</div>
                                    <div className="text-xs text-slate-400 mt-0.5">{txn.time}</div>
                                 </td>
                                 <td className="px-6 py-4">
                                    <span className="bg-slate-100 text-slate-500 px-2 py-1 rounded text-xs font-mono">{txn.id}</span>
                                 </td>
                                 <td className="px-6 py-4 text-slate-700">{txn.desc}</td>
                                 <td className="px-6 py-4 font-bold text-slate-900">{txn.amount}</td>
                                 <td className="px-6 py-4">{getStatusBadge(txn.status)}</td>
                                 <td className="px-6 py-4 text-center">
                                    {txn.status === "Failed" ? (
                                       <button onClick={handleErrorView} className="p-2 text-slate-300 hover:text-red-500 transition-colors" title="View Error">
                                          <ExclamationCircleIcon className="w-5 h-5" />
                                       </button>
                                    ) : (
                                       <div className="flex items-center justify-center gap-1">
                                          <button
                                              onClick={() => handleViewInvoice(txn.id)}
                                              className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
                                              title="View Invoice"
                                          >
                                              <EyeIcon className="w-5 h-5" />
                                          </button>
                                          <button onClick={() => handleDownload(txn.id)} className="p-2 text-slate-400 hover:text-emerald-600 transition-colors" title="Download Invoice">
                                             <ArrowDownTrayIcon className="w-5 h-5" />
                                          </button>
                                       </div>
                                    )}
                                 </td>
                              </tr>
                           ))
                        ) : (
                           <tr>
                              <td colSpan="6" className="text-center py-10 text-slate-400">
                                 No transactions found matching your filters.
                              </td>
                           </tr>
                        )}
                     </tbody>
                  </table>
               </div>

               {/* --- PAGINATION (Interactive) --- */}
               <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-400">
                     Showing {filteredTransactions.length} results
                  </span>
                  <div className="flex items-center gap-2">
                     <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="p-2 rounded-lg border border-gray-200 text-slate-400 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                     >
                        <ChevronLeftIcon className="w-4 h-4" />
                     </button>

                     {[1, 2, 3].map((num) => (
                        <button
                           key={num}
                           onClick={() => handlePageChange(num)}
                           className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${currentPage === num
                                 ? "bg-emerald-500 text-white shadow-md shadow-emerald-200"
                                 : "border border-gray-200 text-slate-500 hover:bg-slate-50"
                              }`}
                        >
                           {num}
                        </button>
                     ))}

                     <span className="text-slate-300 text-xs">...</span>

                     <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        className="p-2 rounded-lg border border-gray-200 text-slate-400 hover:bg-slate-50"
                     >
                        <ChevronRightIcon className="w-4 h-4" />
                     </button>
                  </div>
               </div>
            </div>

         </div>
      </div>
   );
};

export default PaymentHistory;
