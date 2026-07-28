import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { generateInvoicePDF } from '../../utils/generateInvoicePDF';
import { useLocation } from 'react-router-dom';

const PurchaseModule = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [notes, setNotes] = useState('');
  const [freight, setFreight] = useState(0);
  const [createdBill, setCreatedBill] = useState(null);
  const [isScanning, setIsScanning] = useState(false);

  const invoiceRef = useRef();
  const location = useLocation();

  useEffect(() => {
    // 1. Fetch suppliers and products
    Promise.all([
      axios.get('/api/suppliers?limit=100', { withCredentials: true }),
      axios.get('/api/products?status=active&limit=200', { withCredentials: true })
    ]).then(([supplierRes, productRes]) => {
      setSuppliers(supplierRes.data.data);
      setProducts(productRes.data.data);
    }).catch(err => toast.error('Failed to initialize purchase module'));
  }, []);

  // 2. Auto-fill cart if we arrived from "1-Click Reorder"
  useEffect(() => {
    if (location.state?.reorderItems && location.state.reorderItems.length > 0) {
      const prefilledCart = location.state.reorderItems.map(p => {
        const qty = Math.max((p.minimumStock - p.currentStock) || 10, 10);
        const price = p.purchasePrice || 0;
        const gst = p.gstPercentage || 18;
        return {
          product: p._id,
          name: p.name,
          quantity: qty,
          purchasePrice: price,
          discount: 0,
          gst: gst,
          total: (price * qty) * (1 + gst / 100)
        };
      });
      
      setCart(prefilledCart);
      toast.success(`Cart auto-filled with ${prefilledCart.length} low-stock item(s)!`);
    }
  }, [location.state]);

  const addProductToCart = (productId) => {
    const product = products.find(p => p._id === productId);
    if (!product) return;
    if (cart.find(item => item.product === productId)) {
      toast.info('Product already in bill. Update quantity instead.');
      return;
    }
    setCart([...cart, { 
      product: product._id, 
      name: product.name, 
      quantity: 1, 
      purchasePrice: product.purchasePrice, 
      discount: 0, 
      gst: product.gstPercentage,
      total: product.purchasePrice + (product.purchasePrice * (product.gstPercentage / 100))
    }]);
  };

  const updateCartItem = (index, field, value) => {
    const newCart = [...cart];
    newCart[index][field] = Number(value);
    
    // Recalculate total
    const item = newCart[index];
    const basePrice = item.purchasePrice * item.quantity;
    const afterDiscount = basePrice - item.discount;
    const gstAmount = afterDiscount * (item.gst / 100);
    item.total = afterDiscount + gstAmount;

    setCart(newCart);
  };

  const removeCartItem = (index) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const cartTotal = cart.reduce((acc, item) => acc + item.total, 0);
  const grandTotal = cartTotal + Number(freight);

  const handleGenerateBill = async () => {
    if (!selectedSupplier) return toast.error('Select a supplier');
    if (cart.length === 0) return toast.error('Add at least one product');

    try {
      const payload = {
        supplier: selectedSupplier,
        products: cart,
        freight: Number(freight),
        notes,
        grandTotal
      };
      const res = await axios.post('/api/purchases', payload, { withCredentials: true });
      toast.success('Purchase Bill Created! Auto-stock updated. Bill No: ' + res.data.data.invoiceNumber);
      
      const billData = {
        invoiceNumber: res.data.data.invoiceNumber,
        date: new Date().toLocaleDateString(),
        supplier: suppliers.find(s => s._id === selectedSupplier),
        items: [...cart],
        freight: Number(freight),
        notes,
        grandTotal
      };
      
      setCreatedBill(billData);
      setCart([]);
      setFreight(0);
      setNotes('');
      setSelectedSupplier('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create purchase bill');
    }
  };

  const handleScanInvoice = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    const formData = new FormData();
    formData.append('invoice', file);

    try {
      const res = await axios.post('/api/purchases/scan-invoice', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true
      });

      const { data } = res.data;
      if (data.supplierId) {
        setSelectedSupplier(data.supplierId);
        toast.success(`Matched Supplier: ${data.supplierName}`);
      } else {
        toast.info(`Could not match supplier: ${data.supplierName || 'Unknown'}. Please select manually.`);
      }

      setCart(data.items);
      toast.success('Invoice products extracted successfully!');

      // Reset file input
      e.target.value = '';
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to scan invoice image');
    } finally {
      setIsScanning(false);
    }
  };

  const handlePrint = () => {
    const printContent = document.getElementById('printable-bill').innerHTML;
    const printWindow = window.open('', '', 'height=800,width=800');
    printWindow.document.write('<html><head><title>Print Purchase Bill</title>');
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
        .total-row { display: flex; justify-content: space-between; margin-bottom: 8px; }
        .grand-total { font-size: 18px; font-weight: bold; border-top: 1px solid #eee; padding-top: 8px; margin-top: 8px; }
        .notes-section { margin-top: 30px; padding: 15px; background: #f8fafc; border-radius: 8px; font-size: 14px; }
      </style>
    `);
    printWindow.document.write('</head><body>');
    printWindow.document.write(printContent);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };


  if (createdBill) {
    return (
      <div className="p-6 bg-slate-50 min-h-screen flex flex-col items-center">
        <div className="w-full max-w-4xl bg-white p-8 rounded-xl shadow-md border border-slate-200 mb-6 relative">
          
          {/* Hidden Printable Content */}
          <div id="printable-bill" className="hidden">
            <div className="invoice-header">
              <div>
                <h1 className="invoice-title">PURCHASE BILL</h1>
              </div>
              <div className="invoice-details">
                <p><strong>Bill No:</strong> {createdBill.invoiceNumber}</p>
                <p><strong>Date:</strong> {createdBill.date}</p>
              </div>
            </div>
            
            <div className="customer-info">
              <h2>Supplier Details:</h2>
              <p><strong>{createdBill.supplier?.companyName}</strong></p>
              <p>Contact Person: {createdBill.supplier?.contactPerson}</p>
              <p>Mobile: {createdBill.supplier?.mobile}</p>
              {createdBill.supplier?.gstNumber && <p>GST: {createdBill.supplier?.gstNumber}</p>}
            </div>

            <table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th className="text-right">Qty</th>
                  <th className="text-right">Pur. Price</th>
                  <th className="text-right">GST(%)</th>
                  <th className="text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {createdBill.items.map((item, i) => (
                  <tr key={i}>
                    <td>{item.name}</td>
                    <td className="text-right">{item.quantity}</td>
                    <td className="text-right">₹{item.purchasePrice}</td>
                    <td className="text-right">{item.gst}%</td>
                    <td className="text-right">₹{item.total.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="total-section">
              <div className="total-box">
                <div className="total-row">
                  <span>Cart Total:</span>
                  <span>₹{(createdBill.grandTotal - createdBill.freight).toFixed(2)}</span>
                </div>
                <div className="total-row">
                  <span>Freight Charges:</span>
                  <span>₹{createdBill.freight.toFixed(2)}</span>
                </div>
                <div className="total-row grand-total">
                  <span>Grand Total:</span>
                  <span>₹{createdBill.grandTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {createdBill.notes && (
              <div className="notes-section">
                <strong>Notes:</strong> {createdBill.notes}
              </div>
            )}
          </div>

          {/* Visible Screen Content */}
          <div className="flex justify-between items-center mb-8 pb-6 border-b border-slate-100">
            <div>
              <h2 className="text-3xl font-bold text-slate-800">Purchase Bill Created!</h2>
              <p className="text-slate-500 mt-2">Bill #{createdBill.invoiceNumber}</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => generateInvoicePDF(createdBill)} className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-lg font-bold hover:bg-indigo-700 transition-colors shadow-sm">
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
              <button onClick={() => setCreatedBill(null)} className="bg-slate-100 text-slate-700 px-5 py-2.5 rounded-lg font-bold hover:bg-slate-200 transition-colors">
                Create New Bill
              </button>
            </div>
          </div>

          <div className="bg-slate-50 p-6 rounded-lg border border-slate-100">
            <h3 className="text-lg font-semibold mb-4 text-slate-800">Bill Summary</h3>
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <p className="text-sm text-slate-500 mb-1">Supplier</p>
                <p className="font-semibold text-slate-800">{createdBill.supplier?.companyName}</p>
                <p className="text-sm text-slate-600">{createdBill.supplier?.mobile}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-1">Date</p>
                <p className="font-semibold text-slate-800">{createdBill.date}</p>
              </div>
            </div>
            
            <div className="border-t border-slate-200 pt-4">
              <p className="text-sm text-slate-500 mb-2">Items ({createdBill.items.length})</p>
              <div className="flex justify-between items-center font-bold text-xl text-slate-800">
                <span>Grand Total:</span>
                <span>₹{createdBill.grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-slate-50 min-h-screen">

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Create Purchase Bill</h1>
        <div className="relative">
          <input 
            type="file" 
            id="invoice-upload" 
            accept="image/*,application/pdf" 
            className="hidden" 
            onChange={handleScanInvoice} 
            disabled={isScanning}
          />
          <label 
            htmlFor="invoice-upload" 
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold text-white shadow-sm transition-colors cursor-pointer ${isScanning ? 'bg-slate-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
            {isScanning ? 'Analyzing Invoice...' : 'Scan Auto-Invoice'}
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h2 className="font-semibold mb-4 text-lg">Select Supplier</h2>
            <select value={selectedSupplier} onChange={(e) => setSelectedSupplier(e.target.value)} className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">-- Choose Supplier --</option>
              {suppliers.map(s => <option key={s._id} value={s._id}>{s.companyName} ({s.contactPerson})</option>)}
            </select>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h2 className="font-semibold mb-4 text-lg no-print">Add Products</h2>
            <select onChange={(e) => { addProductToCart(e.target.value); e.target.value=''; }} className="w-full p-3 border rounded-lg mb-4 outline-none focus:ring-2 focus:ring-blue-500 no-print">
              <option value="">-- Search & Add Product --</option>
              {products.map(p => <option key={p._id} value={p._id}>{p.name} (Stock: {p.currentStock}) - ₹{p.purchasePrice}</option>)}
            </select>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-100 text-sm">
                    <th className="p-2">Product</th>
                    <th className="p-2 w-20">Qty</th>
                    <th className="p-2 w-24">Pur. Price</th>
                    <th className="p-2 w-20">Disc(₹)</th>
                    <th className="p-2 w-20">GST(%)</th>
                    <th className="p-2">Total</th>
                    <th className="p-2 no-print"></th>
                  </tr>
                </thead>
                <tbody>
                  {cart.map((item, i) => (
                    <tr key={i} className="border-b">
                      <td className="p-2">{item.name}</td>
                      <td className="p-2"><input type="number" min="1" value={item.quantity} onChange={(e) => updateCartItem(i, 'quantity', e.target.value)} className="w-full border p-1 rounded outline-none" /></td>
                      <td className="p-2"><input type="number" value={item.purchasePrice} onChange={(e) => updateCartItem(i, 'purchasePrice', e.target.value)} className="w-full border p-1 rounded outline-none" /></td>
                      <td className="p-2"><input type="number" value={item.discount} onChange={(e) => updateCartItem(i, 'discount', e.target.value)} className="w-full border p-1 rounded outline-none" /></td>
                      <td className="p-2">{item.gst}%</td>
                      <td className="p-2 font-medium">₹{item.total.toFixed(2)}</td>
                      <td className="p-2 no-print"><button onClick={() => removeCartItem(i)} className="text-red-500 hover:text-red-700 font-bold">✕</button></td>
                    </tr>
                  ))}
                  {cart.length === 0 && <tr><td colSpan="7" className="p-4 text-center text-slate-400">No products added</td></tr>}
                </tbody>
              </table>
            </div>
            
            <div className="mt-4 no-print">
              <label className="text-sm font-medium text-slate-700">Notes / Remarks</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} className="w-full border p-2 rounded-lg mt-1 outline-none focus:ring-2 focus:ring-blue-500" rows="2"></textarea>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-fit sticky top-6">
          <h2 className="font-bold text-xl mb-6">Order Summary</h2>
          <div className="space-y-4">
            <div className="flex justify-between text-slate-600">
              <span>Items Count:</span>
              <span>{cart.length}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Cart Total:</span>
              <span>₹{cartTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-slate-600">
              <span>Freight Charges:</span>
              <input type="number" value={freight} onChange={e => setFreight(e.target.value)} className="w-24 border p-1 rounded text-right no-print" />
              <span className="hidden print:inline">₹{freight}</span>
            </div>
            <div className="flex justify-between font-bold text-xl border-t pt-4 text-blue-600">
              <span>Grand Total:</span>
              <span>₹{grandTotal.toFixed(2)}</span>
            </div>
          </div>
          <button onClick={handleGenerateBill} className="w-full mt-6 bg-blue-600 text-white p-3 rounded-lg font-bold text-lg hover:bg-blue-700 transition-colors shadow-lg no-print">
            Save & Print Bill
          </button>
        </div>
      </div>
    </div>
  );
};

export default PurchaseModule;
