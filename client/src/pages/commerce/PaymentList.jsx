import React, { useState, useEffect } from 'react';
import { getPayments } from "../../services/CommerceApi";
import { toast } from "react-toastify";

const PaymentList = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filters State
  const [filterFrom, setFilterFrom] = useState('');
  const [filterTo, setFilterTo] = useState('');
  const [filterStatus, setFilterStatus] = useState('All Status');

  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);

  const viewDetails = (payment) => {
    setSelectedPayment(payment);
    setIsDetailsModalOpen(true);
  };

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const response = await getPayments();
      if (response.success) {
        const formattedData = response.data.map(p => ({ 
          ...p, 
          key: p._id,
          amount: p.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 }),
          date: new Date(p.date).toLocaleString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
          rawDate: new Date(p.date)
        }));
        setData(formattedData);
        setFilteredData(formattedData);
      }
    } catch (error) {
      toast.error("Failed to fetch payments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Paid':
        return 'bg-emerald-50 text-emerald-800';
      case 'Pending':
        return 'bg-amber-50 text-amber-800';
      case 'Failed':
        return 'bg-red-50 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const applyFilters = () => {
    let result = [...data];
    if (filterStatus && filterStatus !== 'All Status') {
      result = result.filter(item => item.status === filterStatus);
    }
    if (filterFrom) {
      const fromDate = new Date(filterFrom);
      fromDate.setHours(0, 0, 0, 0);
      result = result.filter(item => item.rawDate >= fromDate);
    }
    if (filterTo) {
      const toDate = new Date(filterTo);
      toDate.setHours(23, 59, 59, 999);
      result = result.filter(item => item.rawDate <= toDate);
    }
    setFilteredData(result);
  };

  const exportCSV = () => {
    if (filteredData.length === 0) {
      toast.warning("No data to export");
      return;
    }
    const headers = ["Reference ID", "Customer Name", "WhatsApp Number", "Amount", "Currency", "Status", "Date"];
    const csvRows = [];
    csvRows.push(headers.join(","));
    for (const row of filteredData) {
      const values = [
        row.refId || "",
        `"${row.name || ""}"`,
        row.number || "",
        row.amount?.replace(/,/g, "") || "",
        row.currency || "",
        row.status || "",
        `"${row.date || ""}"`
      ];
      csvRows.push(values.join(","));
    }
    const blob = new Blob([csvRows.join("\\n")], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payments_report_${new Date().getTime()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success("Report downloaded");
  };

  return (
    <div className="p-4 md:p-6 bg-[#F9FAFB] min-h-screen font-sans antialiased text-gray-900">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-gray-800">Payment List</h1>
          <span className="text-gray-400 cursor-pointer text-lg hover:text-gray-600">ⓘ</span>
        </div>
        <button onClick={exportCSV} className="bg-[#10B981] hover:bg-[#059669] text-white px-4 py-2 rounded-lg font-semibold text-sm flex items-center gap-2 transition-all shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download Report
        </button>
      </div>

      {/* Filter Section */}
      <div className="bg-white p-5 rounded-xl border border-gray-200 mb-6 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">From Date</label>
            <input type="date" value={filterFrom} onChange={e => setFilterFrom(e.target.value)} className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all" />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">To Date</label>
            <input type="date" value={filterTo} onChange={e => setFilterTo(e.target.value)} className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all" />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Status</label>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all appearance-none bg-white">
              <option value="All Status">All Status</option>
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
              <option value="Failed">Failed</option>
            </select>
          </div>
          <button onClick={applyFilters} className="bg-[#10B981] hover:bg-[#059669] text-white px-5 py-2 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Apply Filter
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <p className="text-lg font-semibold">No payments found</p>
            <p className="text-sm">Payment transactions will appear here</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-200">
                <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">WhatsApp Number</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Reference ID</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Currency</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Created Date</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredData.map((payment) => (
                <tr key={payment.key} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-900 text-[13px]">{payment.number || "**********"}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{payment.name}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-gray-500 text-[13px] font-mono">{payment.refId}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-bold text-gray-900 text-[14px]">₹{payment.amount}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-gray-700 text-[13px] font-semibold">{payment.currency}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-md text-[13px] font-semibold ${getStatusColor(payment.status)}`}>
                      {payment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-gray-600 text-[13px]">{payment.date}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => viewDetails(payment)}
                      className="text-gray-400 hover:text-blue-500 transition-colors p-1"
                      title="View Details"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Payment Details Modal */}
      {isDetailsModalOpen && selectedPayment && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[480px] animate-in zoom-in duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-[18px] font-bold text-gray-800">Payment Details</h3>
              <button
                onClick={() => setIsDetailsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Reference ID</label>
                <p className="text-[14px] font-mono text-gray-900 font-semibold">{selectedPayment.refId}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Customer Name</label>
                  <p className="text-[14px] text-gray-900 font-semibold">{selectedPayment.name}</p>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">WhatsApp Number</label>
                  <p className="text-[14px] text-gray-900 font-semibold">{selectedPayment.number}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Amount</label>
                  <p className="text-[18px] font-bold text-gray-900">₹{selectedPayment.amount}</p>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Currency</label>
                  <p className="text-[14px] text-gray-900 font-semibold">{selectedPayment.currency}</p>
                </div>
              </div>
              
              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Status</label>
                <span className={`inline-block px-2.5 py-1 rounded-md text-[13px] font-semibold ${getStatusColor(selectedPayment.status)}`}>
                  {selectedPayment.status}
                </span>
              </div>
              
              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Created Date</label>
                <p className="text-[14px] text-gray-900 font-semibold">{selectedPayment.date}</p>
              </div>
            </div>
            
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50">
              <button
                onClick={() => setIsDetailsModalOpen(false)}
                className="px-6 py-2 text-sm font-bold text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default PaymentList;
