import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ReportsDashboard = () => {
  const [stats, setStats] = useState({
    monthlySales: 0, monthlyPurchases: 0, lowStockAlerts: 0,
    outOfStockAlerts: 0, totalProducts: 0, totalCustomers: 0, totalSuppliers: 0
  });
  const [salesReport, setSalesReport] = useState([]);
  const [purchaseReport, setPurchaseReport] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, salesRes, purchaseRes] = await Promise.all([
        axios.get('/api/reports/dashboard', { withCredentials: true }),
        axios.get('/api/reports/sales', { withCredentials: true }),
        axios.get('/api/reports/purchases', { withCredentials: true })
      ]);
      setStats(statsRes.data.data);
      setSalesReport(salesRes.data.data);
      setPurchaseReport(purchaseRes.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const exportToCSV = (data, filename) => {
    if (!data || !data.length) return;
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(obj => Object.values(obj).map(v => `"${v}"`).join(','));
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportSales = () => {
    const formatted = salesReport.map(item => ({
      'Product Name': item.productInfo?.name,
      'SKU': item.productInfo?.sku,
      'Qty Sold': item.totalQuantitySold,
      'Revenue (INR)': item.totalRevenue,
      'GST Collected (INR)': item.totalGST
    }));
    exportToCSV(formatted, 'sales_report.csv');
  };

  const exportPurchases = () => {
    const formatted = purchaseReport.map(item => ({
      'Product Name': item.productInfo?.name,
      'SKU': item.productInfo?.sku,
      'Qty Purchased': item.totalQuantityPurchased,
      'Amount Spent (INR)': item.totalSpent
    }));
    exportToCSV(formatted, 'purchase_report.csv');
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Reports & Analytics Dashboard</h1>
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-500">
          <h3 className="text-slate-500 text-sm font-medium">Monthly Sales</h3>
          <p className="text-3xl font-bold text-slate-800 mt-2">₹{stats.monthlySales.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-500">
          <h3 className="text-slate-500 text-sm font-medium">Monthly Purchases</h3>
          <p className="text-3xl font-bold text-slate-800 mt-2">₹{stats.monthlyPurchases.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-yellow-500 flex justify-between items-center">
          <div>
            <h3 className="text-slate-500 text-sm font-medium">Low Stock</h3>
            <p className="text-3xl font-bold text-slate-800 mt-2">{stats.lowStockAlerts}</p>
          </div>
          <div>
            <h3 className="text-slate-500 text-sm font-medium">Out of Stock</h3>
            <p className="text-3xl font-bold text-red-500 mt-2">{stats.outOfStockAlerts}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-purple-500">
          <h3 className="text-slate-500 text-sm font-medium">Entities</h3>
          <p className="text-sm font-bold text-slate-800 mt-2">{stats.totalProducts} Products</p>
          <p className="text-sm font-bold text-slate-800 mt-1">{stats.totalCustomers} Customers</p>
          <p className="text-sm font-bold text-slate-800 mt-1">{stats.totalSuppliers} Suppliers</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Sales Report Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          <div className="p-4 border-b bg-slate-50 flex justify-between items-center">
            <h2 className="font-bold text-lg text-slate-800">Top Selling Products</h2>
            <button onClick={exportSales} className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded font-medium hover:bg-blue-200">Export CSV</button>
          </div>
          <div className="overflow-x-auto p-4 flex-1">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-slate-500 border-b">
                  <th className="pb-2">Product</th>
                  <th className="pb-2 text-right">Qty</th>
                  <th className="pb-2 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {salesReport.slice(0, 5).map(item => (
                  <tr key={item._id} className="border-b last:border-0">
                    <td className="py-3 font-medium">{item.productInfo?.name}</td>
                    <td className="py-3 text-right">{item.totalQuantitySold}</td>
                    <td className="py-3 text-right text-green-600 font-medium">₹{item.totalRevenue.toLocaleString()}</td>
                  </tr>
                ))}
                {salesReport.length === 0 && <tr><td colSpan="3" className="py-4 text-center text-slate-400">No sales data</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        {/* Purchase Report Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          <div className="p-4 border-b bg-slate-50 flex justify-between items-center">
            <h2 className="font-bold text-lg text-slate-800">Highest Purchase Cost</h2>
            <button onClick={exportPurchases} className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded font-medium hover:bg-blue-200">Export CSV</button>
          </div>
          <div className="overflow-x-auto p-4 flex-1">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-slate-500 border-b">
                  <th className="pb-2">Product</th>
                  <th className="pb-2 text-right">Qty</th>
                  <th className="pb-2 text-right">Spent</th>
                </tr>
              </thead>
              <tbody>
                {purchaseReport.slice(0, 5).map(item => (
                  <tr key={item._id} className="border-b last:border-0">
                    <td className="py-3 font-medium">{item.productInfo?.name}</td>
                    <td className="py-3 text-right">{item.totalQuantityPurchased}</td>
                    <td className="py-3 text-right text-red-600 font-medium">₹{item.totalSpent.toLocaleString()}</td>
                  </tr>
                ))}
                {purchaseReport.length === 0 && <tr><td colSpan="3" className="py-4 text-center text-slate-400">No purchase data</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsDashboard;
