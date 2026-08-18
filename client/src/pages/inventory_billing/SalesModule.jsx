import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { generateInvoicePDF } from '../../utils/generateInvoicePDF';

const SalesModule = () => {
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [createdInvoice, setCreatedInvoice] = useState(null);
  
  useEffect(() => {
    // 1. Fetch customers and products
    Promise.all([
      axios.get('/api/customers?limit=100', { withCredentials: true }),
      axios.get('/api/products?status=active&limit=200', { withCredentials: true })
    ]).then(([customerRes, productRes]) => {
      setCustomers(customerRes.data?.data || []);
      setProducts(productRes.data?.data || []);
    }).catch(err => toast.error('Failed to initialize sales module'));
  }, []);

  const addProductToCart = (productId) => {
    const product = products.find(p => p._id === productId);
    if (!product) return;
    if (cart.find(item => item.product === productId)) {
      toast.info('Product already in invoice. Update quantity.');
      return;
    }
    setCart([...cart, { 
      product: product._id, 
      name: product.name, 
      quantity: 1, 
      sellingPrice: product.sellingPrice, 
      discount: 0, 
      gst: product.gstPercentage,
      total: product.sellingPrice + (product.sellingPrice * (product.gstPercentage / 100))
    }]);
  };

  const updateCartItem = (index, field, value) => {
    const newCart = [...cart];
    newCart[index][field] = Number(value);
    
    // Recalculate total
    const item = newCart[index];
    const basePrice = item.sellingPrice * item.quantity;
    const afterDiscount = basePrice - item.discount;
    const gstAmount = afterDiscount * (item.gst / 100);
    item.total = afterDiscount + gstAmount;

    setCart(newCart);
  };

  const removeCartItem = (index) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const grandTotal = cart.reduce((acc, item) => acc + item.total, 0);

  const handleGenerateInvoice = async () => {
    if (!selectedCustomer) return toast.error('Select a customer');
    if (cart.length === 0) return toast.error('Add at least one product');

    try {
      const payload = {
        customer: selectedCustomer,
        products: cart,
        grandTotal
      };
      const res = await axios.post('/api/sales', payload, { withCredentials: true });
      toast.success('Sales Invoice Created! Invoice No: ' + res.data.data.invoiceNumber);
      
      const invoiceData = {
        invoiceNumber: res.data.data.invoiceNumber,
        date: new Date().toLocaleDateString(),
        customer: customers.find(c => c._id === selectedCustomer),
        items: [...cart],
        grandTotal
      };
      setCreatedInvoice(invoiceData);
      setCart([]);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create invoice');
    }
  };

  const handlePrint = () => {
    const printContent = document.getElementById('printable-invoice').innerHTML;
    const printWindow = window.open('', '', 'height=800,width=800');
    printWindow.document.write('<html><head><title>Print Invoice</title>');
    printWindow.document.write(`
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; padding: 20px; }
        .invoice-header { display: flex; justify-content: space-between; margin-bottom: 30px; border-bottom: 2px solid #eee; padding-bottom: 20px; }
        .invoice-title { font-size: 28px; font-weight: bold; color: #1e293b; margin: 0; }
        .invoice-details { text-align: right; }
        .invoice-details p { margin: 4px 0; color: #64748b; }
        .customer-info { margin-bottom: 30px; }
        .customer-info h2 { font-size: 16px; color: #475569; border-bottom: 1px solid #eee; padding-bottom: 8px; margin-bottom: 12px; }
        .customer-info p { margin: 4px 0; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #eee; }
        th { background-color: #f8fafc; color: #475569; font-weight: 600; }
        .text-right { text-align: right; }
        .total-section { display: flex; justify-content: flex-end; }
        .total-box { width: 300px; border-top: 2px solid #eee; padding-top: 15px; }
        .total-row { display: flex; justify-content: space-between; font-size: 18px; font-weight: bold; }
      </style>
    `);
    printWindow.document.write('</head><body>');
    printWindow.document.write(printContent);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.focus();
    // Use a slight timeout to ensure styles are applied before printing
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };


  if (createdInvoice) {
    return (
      <div className="p-6 bg-slate-50 min-h-screen flex flex-col items-center">
        <div className="w-full max-w-4xl bg-white p-8 rounded-xl shadow-md border border-slate-200 mb-6 relative">
          
          {/* Hidden Printable Content */}
          <div id="printable-invoice" className="hidden">
            <div className="invoice-header">
              <div>
                <h1 className="invoice-title">INVOICE</h1>
              </div>
              <div className="invoice-details">
                <p><strong>Invoice No:</strong> {createdInvoice.invoiceNumber}</p>
                <p><strong>Date:</strong> {createdInvoice.date}</p>
              </div>
            </div>
            
            <div className="customer-info">
              <h2>Billed To:</h2>
              <p><strong>{createdInvoice.customer?.customerName}</strong></p>
              <p>Mobile: {createdInvoice.customer?.mobile}</p>
              {createdInvoice.customer?.email && <p>Email: {createdInvoice.customer?.email}</p>}
              {createdInvoice.customer?.address && <p>Address: {createdInvoice.customer?.address}</p>}
            </div>

            <table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th className="text-right">Qty</th>
                  <th className="text-right">Price</th>
                  <th className="text-right">GST(%)</th>
                  <th className="text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {createdInvoice.items.map((item, i) => (
                  <tr key={i}>
                    <td>{item.name}</td>
                    <td className="text-right">{item.quantity}</td>
                    <td className="text-right">₹{item.sellingPrice}</td>
                    <td className="text-right">{item.gst}%</td>
                    <td className="text-right">₹{item.total.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="total-section">
              <div className="total-box">
                <div className="total-row">
                  <span>Grand Total:</span>
                  <span>₹{createdInvoice.grandTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Visible Screen Content */}
          <div className="flex justify-between items-center mb-8 pb-6 border-b border-slate-100">
            <div>
              <h2 className="text-3xl font-bold text-slate-800">Invoice Created Successfully!</h2>
              <p className="text-slate-500 mt-2">Invoice #{createdInvoice.invoiceNumber}</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => generateInvoicePDF(createdInvoice)} className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-lg font-bold hover:bg-indigo-700 transition-colors shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
                </svg>
                Download Pro PDF
              </button>
              <button onClick={handlePrint} className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" />
                </svg>
                Print Receipt
              </button>
              <button onClick={() => setCreatedInvoice(null)} className="bg-slate-100 text-slate-700 px-5 py-2.5 rounded-lg font-bold hover:bg-slate-200 transition-colors">
                Create New Invoice
              </button>
            </div>
          </div>

          <div className="bg-slate-50 p-6 rounded-lg border border-slate-100">
            <h3 className="text-lg font-semibold mb-4 text-slate-800">Invoice Summary</h3>
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <p className="text-sm text-slate-500 mb-1">Customer</p>
                <p className="font-semibold text-slate-800">{createdInvoice.customer?.customerName}</p>
                <p className="text-sm text-slate-600">{createdInvoice.customer?.mobile}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-1">Date</p>
                <p className="font-semibold text-slate-800">{createdInvoice.date}</p>
              </div>
            </div>
            
            <div className="border-t border-slate-200 pt-4">
              <p className="text-sm text-slate-500 mb-2">Items ({createdInvoice.items.length})</p>
              <div className="flex justify-between items-center font-bold text-xl text-slate-800">
                <span>Grand Total:</span>
                <span>₹{createdInvoice.grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Create Sales Invoice</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h2 className="font-semibold mb-4 text-lg">Select Customer</h2>
            <select value={selectedCustomer} onChange={(e) => setSelectedCustomer(e.target.value)} className="w-full p-3 border rounded-lg">
              <option value="">-- Choose Customer --</option>
              {customers.map(c => <option key={c._id} value={c._id}>{c.customerName} ({c.mobile})</option>)}
            </select>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h2 className="font-semibold mb-4 text-lg">Add Products</h2>
            <select onChange={(e) => { addProductToCart(e.target.value); e.target.value=''; }} className="w-full p-3 border rounded-lg mb-4">
              <option value="">-- Search & Add Product --</option>
              {products.map(p => <option key={p._id} value={p._id}>{p.name} (Stock: {p.currentStock}) - ₹{p.sellingPrice}</option>)}
            </select>

            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-100 text-sm">
                  <th className="p-2">Product</th>
                  <th className="p-2 w-20">Qty</th>
                  <th className="p-2 w-24">Price</th>
                  <th className="p-2 w-20">Disc(₹)</th>
                  <th className="p-2 w-20">GST(%)</th>
                  <th className="p-2">Total</th>
                  <th className="p-2"></th>
                </tr>
              </thead>
              <tbody>
                {cart.map((item, i) => (
                  <tr key={i} className="border-b">
                    <td className="p-2">{item.name}</td>
                    <td className="p-2"><input type="number" min="1" value={item.quantity} onChange={(e) => updateCartItem(i, 'quantity', e.target.value)} className="w-full border p-1 rounded" /></td>
                    <td className="p-2"><input type="number" value={item.sellingPrice} onChange={(e) => updateCartItem(i, 'sellingPrice', e.target.value)} className="w-full border p-1 rounded" /></td>
                    <td className="p-2"><input type="number" value={item.discount} onChange={(e) => updateCartItem(i, 'discount', e.target.value)} className="w-full border p-1 rounded" /></td>
                    <td className="p-2">{item.gst}%</td>
                    <td className="p-2 font-medium">₹{item.total.toFixed(2)}</td>
                    <td className="p-2"><button onClick={() => removeCartItem(i)} className="text-red-500">X</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-fit sticky top-6">
          <h2 className="font-bold text-xl mb-6">Summary</h2>
          <div className="space-y-4">
            <div className="flex justify-between text-slate-600">
              <span>Items Count:</span>
              <span>{cart.length}</span>
            </div>
            <div className="flex justify-between font-bold text-xl border-t pt-4">
              <span>Grand Total:</span>
              <span>₹{grandTotal.toFixed(2)}</span>
            </div>
          </div>
          <button onClick={handleGenerateInvoice} className="w-full mt-6 bg-blue-600 text-white p-3 rounded-lg font-bold text-lg hover:bg-blue-700">
            Generate Invoice
          </button>
        </div>
      </div>
    </div>
  );
};

export default SalesModule;
