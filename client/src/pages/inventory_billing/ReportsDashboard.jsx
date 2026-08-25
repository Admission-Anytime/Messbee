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
        axios.get('/api/reports/dashboard', { withCredentials: true }),
        axios.get('/api/reports/sales', { withCredentials: true }),
        axios.get('/api/reports/purchases', { withCredentials: true }),
        axios.get('/api/products?limit=1000', { withCredentials: true }).catch(() => ({ data: { data: [] } }))
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 p-6 rounded-xl shadow-md border-0 text-white">
          <h3 className="text-indigo-100 text-sm font-medium">Net Profit</h3>
          <p className="text-3xl font-bold mt-2">₹{(stats.netProfit || 0).toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-500">
          <h3 className="text-slate-500 text-sm font-medium">Monthly Sales</h3>
          <p className="text-3xl font-bold text-slate-800 mt-2">₹{(stats.monthlySales || 0).toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-500">
          <h3 className="text-slate-500 text-sm font-medium">Monthly Purchases</h3>
          <p className="text-3xl font-bold text-slate-800 mt-2">₹{(stats.monthlyPurchases || 0).toLocaleString()}</p>
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

      {/* Analytics Chart */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-8">
        <h2 className="font-bold text-lg text-slate-800 mb-4">Sales & Profit Trends (This Month)</h2>
        <div className="h-[350px]">
          {stats.dailyTrends && stats.dailyTrends.length > 0 ? (
            <Chart
              options={{
                chart: { type: 'area', toolbar: { show: false }, fontFamily: 'inherit' },
                colors: ['#3b82f6', '#10b981'], // Blue for sales, Green for profit
                dataLabels: { enabled: false },
                stroke: { curve: 'smooth', width: 2 },
                xaxis: { 
                  categories: stats.dailyTrends.map(t => t.date),
                  labels: { style: { colors: '#64748b' } }
                },
                yaxis: { labels: { formatter: (val) => `₹${val.toLocaleString()}`, style: { colors: '#64748b' } } },
                tooltip: { y: { formatter: (val) => `₹${val.toLocaleString()}` } },
                fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0.05, stops: [0, 90, 100] } },
                legend: { position: 'top', horizontalAlign: 'right' }
              }}
              series={[
                { name: 'Revenue', data: stats.dailyTrends.map(t => t.sales) },
                { name: 'Net Profit', data: stats.dailyTrends.map(t => t.profit) }
              ]}
              type="area"
              height="100%"
            />
          ) : (
             <div className="h-full flex items-center justify-center text-slate-400">No sales data for this month to chart.</div>
          )}
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
    </>
  );

  const renderSales = () => (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
      <div className="p-4 border-b bg-slate-50 flex justify-between items-center">
        <h2 className="font-bold text-lg text-slate-800">Sales Report</h2>
        <button onClick={exportSales} className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded font-medium hover:bg-blue-200">Export CSV</button>
      </div>
      <div className="overflow-x-auto p-4 flex-1">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-slate-500 border-b bg-slate-50">
              <th className="p-3">Product Name</th>
              <th className="p-3">SKU</th>
              <th className="p-3 text-right">Qty Sold</th>
              <th className="p-3 text-right">GST Collected</th>
              <th className="p-3 text-right">Total Revenue</th>
            </tr>
          </thead>
          <tbody>
            {salesReport.map(item => (
              <tr key={item._id} className="border-b last:border-0 hover:bg-slate-50 transition-colors">
                <td className="p-3 font-medium text-slate-800">{item.productInfo?.name}</td>
                <td className="p-3 text-slate-500">{item.productInfo?.sku}</td>
                <td className="p-3 text-right font-medium">{item.totalQuantitySold}</td>
                <td className="p-3 text-right text-slate-600">₹{(item.totalGST || 0).toLocaleString()}</td>
                <td className="p-3 text-right text-green-600 font-bold">₹{item.totalRevenue.toLocaleString()}</td>
              </tr>
            ))}
            {salesReport.length === 0 && <tr><td colSpan="5" className="p-6 text-center text-slate-400">No sales data available</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderPurchases = () => (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
      <div className="p-4 border-b bg-slate-50 flex justify-between items-center">
        <h2 className="font-bold text-lg text-slate-800">Purchase Report</h2>
        <button onClick={exportPurchases} className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded font-medium hover:bg-blue-200">Export CSV</button>
      </div>
      <div className="overflow-x-auto p-4 flex-1">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-slate-500 border-b bg-slate-50">
              <th className="p-3">Product Name</th>
              <th className="p-3">SKU</th>
              <th className="p-3 text-right">Qty Purchased</th>
              <th className="p-3 text-right">Total Spent</th>
            </tr>
          </thead>
          <tbody>
            {purchaseReport.map(item => (
              <tr key={item._id} className="border-b last:border-0 hover:bg-slate-50 transition-colors">
                <td className="p-3 font-medium text-slate-800">{item.productInfo?.name}</td>
                <td className="p-3 text-slate-500">{item.productInfo?.sku}</td>
                <td className="p-3 text-right font-medium">{item.totalQuantityPurchased}</td>
                <td className="p-3 text-right text-red-600 font-bold">₹{item.totalSpent.toLocaleString()}</td>
              </tr>
            ))}
            {purchaseReport.length === 0 && <tr><td colSpan="4" className="p-6 text-center text-slate-400">No purchase data available</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderInventory = () => (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
      <div className="p-4 border-b bg-slate-50 flex justify-between items-center">
        <h2 className="font-bold text-lg text-slate-800">Inventory Status Report</h2>
        <button onClick={exportInventory} className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded font-medium hover:bg-blue-200">Export CSV</button>
      </div>
      <div className="overflow-x-auto p-4 flex-1">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-slate-500 border-b bg-slate-50">
              <th className="p-3">Product Name</th>
              <th className="p-3">SKU</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right">Current Stock</th>
              <th className="p-3 text-right">Purchase Price</th>
              <th className="p-3 text-right">Selling Price</th>
            </tr>
          </thead>
          <tbody>
            {products.map(item => {
              const isOut = item.currentStock === 0;
              const isLow = item.currentStock > 0 && item.currentStock <= item.lowStockThreshold;
              return (
                <tr key={item._id} className="border-b last:border-0 hover:bg-slate-50 transition-colors">
                  <td className="p-3 font-medium text-slate-800">{item.name}</td>
                  <td className="p-3 text-slate-500">{item.sku}</td>
                  <td className="p-3">
                    {isOut ? <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-bold">Out of Stock</span> :
                     isLow ? <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs font-bold">Low Stock</span> :
                     <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-bold">In Stock</span>}
                  </td>
                  <td className="p-3 text-right font-medium">{item.currentStock}</td>
                  <td className="p-3 text-right text-slate-600">₹{item.purchasePrice}</td>
                  <td className="p-3 text-right text-slate-600">₹{item.sellingPrice}</td>
                </tr>
              );
            })}
            {products.length === 0 && <tr><td colSpan="6" className="p-6 text-center text-slate-400">No inventory data available</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderGST = () => (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
      <div className="p-4 border-b bg-slate-50 flex justify-between items-center">
        <h2 className="font-bold text-lg text-slate-800">GST Output Report</h2>
        <button onClick={exportGST} className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded font-medium hover:bg-blue-200">Export CSV</button>
      </div>
      <div className="overflow-x-auto p-4 flex-1">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-slate-500 border-b bg-slate-50">
              <th className="p-3">Product Name</th>
              <th className="p-3">SKU</th>
              <th className="p-3 text-right">Total Quantity Sold</th>
              <th className="p-3 text-right">Total Revenue</th>
              <th className="p-3 text-right">Total GST Collected</th>
            </tr>
          </thead>
          <tbody>
            {salesReport.filter(item => item.totalGST > 0).map(item => (
              <tr key={item._id} className="border-b last:border-0 hover:bg-slate-50 transition-colors">
                <td className="p-3 font-medium text-slate-800">{item.productInfo?.name}</td>
                <td className="p-3 text-slate-500">{item.productInfo?.sku}</td>
                <td className="p-3 text-right font-medium">{item.totalQuantitySold}</td>
                <td className="p-3 text-right text-green-600 font-bold">₹{item.totalRevenue.toLocaleString()}</td>
                <td className="p-3 text-right text-indigo-600 font-bold">₹{(item.totalGST || 0).toLocaleString()}</td>
              </tr>
            ))}
            {salesReport.filter(item => item.totalGST > 0).length === 0 && <tr><td colSpan="5" className="p-6 text-center text-slate-400">No GST data available</td></tr>}
          </tbody>
          <tfoot className="bg-slate-50 font-bold border-t border-slate-200">
            <tr>
              <td colSpan="3" className="p-3 text-right text-slate-700">Total Output Tax (GST) Collected:</td>
              <td colSpan="2" className="p-3 text-right text-indigo-700 text-lg">
                ₹{salesReport.reduce((acc, curr) => acc + (curr.totalGST || 0), 0).toLocaleString()}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Reports & Analytics Dashboard</h1>
      
      <div className="flex flex-wrap gap-2 mb-6 bg-white p-2 rounded-xl shadow-sm border border-slate-100">
        {['dashboard', 'sales', 'purchase', 'inventory', 'gst'].map(t => (
          <button 
            key={t}
            onClick={() => navigate(`/admin/billing/reports${t === 'dashboard' ? '' : '/' + t}`)}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${activeTab === t ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}
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
