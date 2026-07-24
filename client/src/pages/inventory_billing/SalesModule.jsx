import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const SalesModule = () => {
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  
  useEffect(() => {
    axios.get('/api/customers?limit=100', { withCredentials: true }).then(res => setCustomers(res.data.data));
    axios.get('/api/products?status=active&limit=200', { withCredentials: true }).then(res => setProducts(res.data.data));
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
      setCart([]);
      // You could trigger window.print() here for the invoice component
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create invoice');
    }
  };

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
