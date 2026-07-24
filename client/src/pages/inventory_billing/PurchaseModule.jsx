import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const PurchaseModule = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [notes, setNotes] = useState('');
  const [freight, setFreight] = useState(0);

  const invoiceRef = useRef();

  useEffect(() => {
    axios.get('/api/suppliers?limit=100', { withCredentials: true }).then(res => setSuppliers(res.data.data));
    axios.get('/api/products?status=active&limit=200', { withCredentials: true }).then(res => setProducts(res.data.data));
  }, []);

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
      
      // Print Invoice Logic
      setTimeout(() => {
        window.print();
      }, 500);

      setCart([]);
      setFreight(0);
      setNotes('');
      setSelectedSupplier('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create purchase bill');
    }
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen printable-area">
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .printable-area, .printable-area * { visibility: visible; }
          .printable-area { position: absolute; left: 0; top: 0; width: 100%; background: white; padding: 20px; }
          .no-print { display: none !important; }
        }
      `}</style>
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Create Purchase Bill</h1>
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
