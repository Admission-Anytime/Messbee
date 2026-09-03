import React, { useState, useEffect } from 'react';
import axios from '../../context/axios';
import { useParams, useNavigate } from 'react-router-dom';
import Chart from 'react-apexcharts';

const ReportsDashboard = () => {
  const { tab } = useParams();
  const navigate = useNavigate();
  const activeTab = tab || 'dashboard';

  const [stats, setStats] = useState({
    monthlySales: 0, monthlyPurchases: 0, netProfit: 0, dailyTrends: [], 
    lowStockAlerts: 0, outOfStockAlerts: 0, totalProducts: 0, totalCustomers: 0, totalSuppliers: 0
  });
  const [salesReport, setSalesReport] = useState([]);
  const [purchaseReport, setPurchaseReport] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, salesRes, purchaseRes, productsRes] = await Promise.all([
        axios.get('/reports/dashboard', { withCredentials: true }),
        axios.get('/reports/sales', { withCredentials: true }),
        axios.get('/reports/purchases', { withCredentials: true }),
        axios.get('/products?limit=1000', { withCredentials: true }).catch(() => ({ data: { data: [] } }))
      ]);
      setStats(statsRes.data.data);
      setSalesReport(salesRes.data.data);
      setPurchaseReport(purchaseRes.data.data);
      setProducts(productsRes.data.data || []);
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

  const exportInventory = () => {
    const formatted = products.map(item => ({
      'Product Name': item.name,
      'SKU': item.sku,
      'Stock Status': item.currentStock <= item.lowStockThreshold ? (item.currentStock === 0 ? 'Out of Stock' : 'Low Stock') : 'In Stock',
      'Current Stock': item.currentStock,
      'Purchase Price (INR)': item.purchasePrice,
      'Selling Price (INR)': item.sellingPrice
    }));
    exportToCSV(formatted, 'inventory_report.csv');
  };

  const exportGST = () => {
    const formatted = salesReport.map(item => ({
      'Product Name': item.productInfo?.name,
      'Qty Sold': item.totalQuantitySold,
      'Total Sales (INR)': item.totalRevenue,
      'GST Collected (INR)': item.totalGST || 0
    }));
    exportToCSV(formatted, 'gst_report.csv');
  };

  const renderOverview = () => (
    <>
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 p-5 rounded-xl shadow-sm text-white">
          <h3 className="text-emerald-100 text-xs font-semibold uppercase tracking-wider">Net Profit</h3>
          <p className="text-2xl sm:text-3xl font-bold mt-2">₹{(stats.netProfit || 0).toLocaleString()}</p>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 border-l-4 border-l-blue-500">
          <h3 className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Monthly Sales</h3>
          <p className="text-2xl sm:text-3xl font-bold text-slate-800 mt-2">₹{(stats.monthlySales || 0).toLocaleString()}</p>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 border-l-4 border-l-emerald-500">
          <h3 className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Monthly Purchases</h3>
          <p className="text-2xl sm:text-3xl font-bold text-slate-800 mt-2">₹{(stats.monthlyPurchases || 0).toLocaleString()}</p>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 border-l-4 border-l-amber-500 flex justify-between items-center">
          <div>
            <h3 className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Low Stock</h3>
            <p className="text-2xl sm:text-3xl font-bold text-amber-600 mt-2">{stats.lowStockAlerts}</p>
          </div>
          <div>
            <h3 className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Out Stock</h3>
            <p className="text-2xl sm:text-3xl font-bold text-rose-600 mt-2">{stats.outOfStockAlerts}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 border-l-4 border-l-indigo-500">
          <h3 className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Entities</h3>
          <p className="text-xs font-semibold text-slate-700 mt-2">{stats.totalProducts} Products</p>
          <p className="text-xs font-semibold text-slate-700 mt-1">{stats.totalCustomers} Customers</p>
          <p className="text-xs font-semibold text-slate-700 mt-1">{stats.totalSuppliers} Suppliers</p>
        </div>
      </div>

      {/* Analytics Chart */}
      <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 mb-6">
        <h2 className="font-bold text-base text-slate-800 mb-4">Sales & Profit Trends (This Month)</h2>
        <div className="h-[320px]">
          {stats.dailyTrends && stats.dailyTrends.length > 0 ? (
            <Chart
              options={{
                chart: { type: 'area', toolbar: { show: false }, fontFamily: 'Urbanist, sans-serif' },
                colors: ['#3b82f6', '#10b981'],
                dataLabels: { enabled: false },
                stroke: { curve: 'smooth', width: 2 },
                xaxis: { 
                  categories: stats.dailyTrends.map(t => t.date),
                  labels: { style: { colors: '#64748b', fontSize: '12px', fontFamily: 'Urbanist, sans-serif' } }
                },
                yaxis: { labels: { formatter: (val) => `₹${val.toLocaleString()}`, style: { colors: '#64748b', fontSize: '12px', fontFamily: 'Urbanist, sans-serif' } } },
                tooltip: { y: { formatter: (val) => `₹${val.toLocaleString()}` } },
                fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0.05, stops: [0, 90, 100] } },
                legend: { position: 'top', horizontalAlign: 'right', fontFamily: 'Urbanist, sans-serif' }
              }}
              series={[
                { name: 'Revenue', data: stats.dailyTrends.map(t => t.sales) },
                { name: 'Net Profit', data: stats.dailyTrends.map(t => t.profit) }
              ]}
              type="area"
              height="100%"
            />
          ) : (
             <div className="h-full flex items-center justify-center text-sm font-medium text-slate-400">No sales data for this month to chart.</div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Report Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-100 bg-white flex justify-between items-center">
            <h2 className="font-bold text-base text-slate-800">Top Selling Products</h2>
            <button onClick={exportSales} className="text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-lg transition-colors">Export CSV</button>
          </div>
          <div className="overflow-x-auto p-4 flex-1">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-slate-600 text-xs font-semibold uppercase tracking-wider border-b border-slate-100 pb-2">
                  <th className="pb-2.5">Product</th>
                  <th className="pb-2.5 text-right">Qty</th>
                  <th className="pb-2.5 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {salesReport.slice(0, 5).map(item => (
                  <tr key={item._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 font-semibold text-slate-800 text-sm">{item.productInfo?.name}</td>
                    <td className="py-3 text-right text-slate-600 text-sm">{item.totalQuantitySold}</td>
                    <td className="py-3 text-right text-[#10B981] font-bold text-sm">₹{item.totalRevenue.toLocaleString()}</td>
                  </tr>
                ))}
                {salesReport.length === 0 && <tr><td colSpan="3" className="py-6 text-center text-sm font-medium text-slate-400">No sales data</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        {/* Purchase Report Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-100 bg-white flex justify-between items-center">
            <h2 className="font-bold text-base text-slate-800">Highest Purchase Cost</h2>
            <button onClick={exportPurchases} className="text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-lg transition-colors">Export CSV</button>
          </div>
          <div className="overflow-x-auto p-4 flex-1">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-slate-600 text-xs font-semibold uppercase tracking-wider border-b border-slate-100 pb-2">
                  <th className="pb-2.5">Product</th>
                  <th className="pb-2.5 text-right">Qty</th>
                  <th className="pb-2.5 text-right">Spent</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {purchaseReport.slice(0, 5).map(item => (
                  <tr key={item._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 font-semibold text-slate-800 text-sm">{item.productInfo?.name}</td>
                    <td className="py-3 text-right text-slate-600 text-sm">{item.totalQuantityPurchased}</td>
                    <td className="py-3 text-right text-rose-600 font-bold text-sm">₹{item.totalSpent.toLocaleString()}</td>
                  </tr>
                ))}
                {purchaseReport.length === 0 && <tr><td colSpan="3" className="py-6 text-center text-sm font-medium text-slate-400">No purchase data</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );

  const renderSales = () => (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
      <div className="p-4 border-b border-slate-200 bg-white flex justify-between items-center">
        <h2 className="font-bold text-base text-slate-800">Sales Report</h2>
        <button onClick={exportSales} className="text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-lg transition-colors">Export CSV</button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 text-xs font-semibold uppercase tracking-wider">
              <th className="px-4 py-3.5">Product Name</th>
              <th className="px-4 py-3.5">SKU</th>
              <th className="px-4 py-3.5 text-right">Qty Sold</th>
              <th className="px-4 py-3.5 text-right">GST Collected</th>
              <th className="px-4 py-3.5 text-right">Total Revenue</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {salesReport.map(item => (
              <tr key={item._id} className="hover:bg-slate-50/60 transition-colors">
                <td className="px-4 py-3.5 font-semibold text-slate-800 text-sm">{item.productInfo?.name}</td>
                <td className="px-4 py-3.5 text-slate-500 text-xs font-mono">{item.productInfo?.sku}</td>
                <td className="px-4 py-3.5 text-right font-medium text-slate-700 text-sm">{item.totalQuantitySold}</td>
                <td className="px-4 py-3.5 text-right text-slate-600 text-sm">₹{(item.totalGST || 0).toLocaleString()}</td>
                <td className="px-4 py-3.5 text-right text-[#10B981] font-bold text-sm">₹{item.totalRevenue.toLocaleString()}</td>
              </tr>
            ))}
            {salesReport.length === 0 && <tr><td colSpan="5" className="p-8 text-center text-sm font-medium text-slate-400">No sales data available</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderPurchases = () => (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
      <div className="p-4 border-b border-slate-200 bg-white flex justify-between items-center">
        <h2 className="font-bold text-base text-slate-800">Purchase Report</h2>
        <button onClick={exportPurchases} className="text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-lg transition-colors">Export CSV</button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 text-xs font-semibold uppercase tracking-wider">
              <th className="px-4 py-3.5">Product Name</th>
              <th className="px-4 py-3.5">SKU</th>
              <th className="px-4 py-3.5 text-right">Qty Purchased</th>
              <th className="px-4 py-3.5 text-right">Total Spent</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {purchaseReport.map(item => (
              <tr key={item._id} className="hover:bg-slate-50/60 transition-colors">
                <td className="px-4 py-3.5 font-semibold text-slate-800 text-sm">{item.productInfo?.name}</td>
                <td className="px-4 py-3.5 text-slate-500 text-xs font-mono">{item.productInfo?.sku}</td>
                <td className="px-4 py-3.5 text-right font-medium text-slate-700 text-sm">{item.totalQuantityPurchased}</td>
                <td className="px-4 py-3.5 text-right text-rose-600 font-bold text-sm">₹{item.totalSpent.toLocaleString()}</td>
              </tr>
            ))}
            {purchaseReport.length === 0 && <tr><td colSpan="4" className="p-8 text-center text-sm font-medium text-slate-400">No purchase data available</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderInventory = () => (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
      <div className="p-4 border-b border-slate-200 bg-white flex justify-between items-center">
        <h2 className="font-bold text-base text-slate-800">Inventory Status Report</h2>
        <button onClick={exportInventory} className="text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-lg transition-colors">Export CSV</button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 text-xs font-semibold uppercase tracking-wider">
              <th className="px-4 py-3.5">Product Name</th>
              <th className="px-4 py-3.5">SKU</th>
              <th className="px-4 py-3.5">Status</th>
              <th className="px-4 py-3.5 text-right">Current Stock</th>
              <th className="px-4 py-3.5 text-right">Purchase Price</th>
              <th className="px-4 py-3.5 text-right">Selling Price</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {products.map(item => {
              const isOut = item.currentStock === 0;
              const isLow = item.currentStock > 0 && item.currentStock <= item.lowStockThreshold;
              return (
                <tr key={item._id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-4 py-3.5 font-semibold text-slate-800 text-sm">{item.name}</td>
                  <td className="px-4 py-3.5 text-slate-500 text-xs font-mono">{item.sku}</td>
                  <td className="px-4 py-3.5">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${isOut ? 'bg-rose-50 text-rose-700 border border-rose-200' : isLow ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>
                      {isOut ? 'Out of Stock' : isLow ? 'Low Stock' : 'In Stock'}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right font-medium text-slate-800 text-sm">{item.currentStock}</td>
                  <td className="px-4 py-3.5 text-right text-slate-600 text-sm">₹{item.purchasePrice}</td>
                  <td className="px-4 py-3.5 text-right text-slate-900 font-semibold text-sm">₹{item.sellingPrice}</td>
                </tr>
              );
            })}
            {products.length === 0 && <tr><td colSpan="6" className="p-8 text-center text-sm font-medium text-slate-400">No inventory data available</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderGST = () => (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
      <div className="p-4 border-b border-slate-200 bg-white flex justify-between items-center">
        <h2 className="font-bold text-base text-slate-800">GST Output Report</h2>
        <button onClick={exportGST} className="text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-lg transition-colors">Export CSV</button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 text-xs font-semibold uppercase tracking-wider">
              <th className="px-4 py-3.5">Product Name</th>
              <th className="px-4 py-3.5">SKU</th>
              <th className="px-4 py-3.5 text-right">Total Quantity Sold</th>
              <th className="px-4 py-3.5 text-right">Total Revenue</th>
              <th className="px-4 py-3.5 text-right">Total GST Collected</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {salesReport.filter(item => item.totalGST > 0).map(item => (
              <tr key={item._id} className="hover:bg-slate-50/60 transition-colors">
                <td className="px-4 py-3.5 font-semibold text-slate-800 text-sm">{item.productInfo?.name}</td>
                <td className="px-4 py-3.5 text-slate-500 text-xs font-mono">{item.productInfo?.sku}</td>
                <td className="px-4 py-3.5 text-right font-medium text-slate-700 text-sm">{item.totalQuantitySold}</td>
                <td className="px-4 py-3.5 text-right text-[#10B981] font-bold text-sm">₹{item.totalRevenue.toLocaleString()}</td>
                <td className="px-4 py-3.5 text-right text-indigo-600 font-bold text-sm">₹{(item.totalGST || 0).toLocaleString()}</td>
              </tr>
            ))}
            {salesReport.filter(item => item.totalGST > 0).length === 0 && <tr><td colSpan="5" className="p-8 text-center text-sm font-medium text-slate-400">No GST data available</td></tr>}
          </tbody>
          <tfoot className="bg-slate-50/90 font-bold border-t border-slate-200">
            <tr>
              <td colSpan="3" className="px-4 py-3.5 text-right text-slate-700 text-sm">Total Output Tax (GST) Collected:</td>
              <td colSpan="2" className="px-4 py-3.5 text-right text-indigo-700 font-bold text-base">
                ₹{salesReport.reduce((acc, curr) => acc + (curr.totalGST || 0), 0).toLocaleString()}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );

  return (
    <div className="p-4 md:p-6 bg-slate-50 min-h-screen font-['Urbanist',sans-serif]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-center">
            <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Reports &amp; Analytics Dashboard</h1>
            <p className="text-slate-500 text-[13px] mt-1 font-medium">Financial overview, sales, purchases, inventory, and tax reports</p>
          </div>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2 mb-6 bg-white p-1.5 rounded-xl shadow-sm border border-slate-200">
        {['dashboard', 'sales', 'purchase', 'inventory', 'gst'].map(t => (
          <button 
            key={t}
            onClick={() => navigate(`/admin/billing/reports${t === 'dashboard' ? '' : '/' + t}`)}
            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${activeTab === t ? 'bg-[#10B981] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
          >
            {t === 'dashboard' ? 'Overview' : `${t.charAt(0).toUpperCase() + t.slice(1)} Report`}
          </button>
        ))}
      </div>

      {activeTab === 'dashboard' && renderOverview()}
      {activeTab === 'sales' && renderSales()}
      {activeTab === 'purchase' && renderPurchases()}
      {activeTab === 'inventory' && renderInventory()}
      {activeTab === 'gst' && renderGST()}
      
    </div>
  );
};

export default ReportsDashboard;
