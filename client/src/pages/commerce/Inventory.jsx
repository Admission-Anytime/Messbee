import React, { useState, useEffect } from "react";
import { getProducts, createProduct, updateProduct, deleteProduct } from "../../services/CommerceApi";
import { toast } from "react-toastify";

/* ─── Add Product Drawer ─────────────────────────────────────────────────────── */
function AddProductDrawer({ isOpen, onClose, onAdd, editingProduct }) {
  const [formData, setFormData] = useState({
    name: "",
    desc: "",
    img: "",
    sku: "",
    stock: "",
    goal: "",
    price: "",
    category: "",
    shop: false,
  });

  // Pre-fill form when editing
  React.useEffect(() => {
    if (editingProduct) {
      setFormData({
        name: editingProduct.product?.name || "",
        desc: editingProduct.product?.desc || "",
        img: editingProduct.product?.img || "",
        sku: editingProduct.sku || "",
        stock: editingProduct.stock?.toString() || "",
        goal: editingProduct.goal?.toString() || "",
        price: editingProduct.price?.replace(/[₹,]/g, "") || "",
        category: editingProduct.category || "",
        shop: editingProduct.shop || false,
      });
    } else {
      setFormData({
        name: "",
        desc: "",
        img: "",
        sku: "",
        stock: "",
        goal: "",
        price: "",
        category: "",
        shop: false,
      });
    }
  }, [editingProduct, isOpen]);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");

  const categories = ["Electronics", "Gadgets", "Professional", "Accessories", "Clothing", "Others"];

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!formData.name.trim()) {
      setError("Product name is required");
      return;
    }
    if (!formData.sku.trim()) {
      setError("SKU is required");
      return;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      setError("Valid price is required");
      return;
    }
    if (!formData.stock || parseInt(formData.stock) < 0) {
      setError("Valid stock level is required");
      return;
    }
    if (!formData.goal || parseInt(formData.goal) <= 0) {
      setError("Valid goal is required");
      return;
    }

    setAdding(true);
    try {
      const newProduct = {
        key: Date.now().toString(),
        product: {
          name: formData.name.trim(),
          desc: formData.desc.trim(),
          img: formData.img.trim() || "https://via.placeholder.com/150?text=Product",
        },
        sku: formData.sku.trim(),
        stock: parseInt(formData.stock),
        goal: parseInt(formData.goal),
        price: `₹${parseFloat(formData.price).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        category: formData.category || "Others",
        status: parseInt(formData.stock) === 0 ? "OUT OF STOCK" : parseInt(formData.stock) < 10 ? "Low Stock" : "In stock",
        shop: formData.shop,
      };

      await onAdd(newProduct);
      
      // Reset form
      setFormData({
        name: "",
        desc: "",
        img: "",
        sku: "",
        stock: "",
        goal: "",
        price: "",
        category: "",
        shop: false,
      });
      onClose();
    } catch (err) {
      setError(err.message || "Failed to add product");
    } finally {
      setAdding(false);
    }
  };

  const updateField = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="fixed inset-0 z-[700] flex justify-end font-sans">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative w-[440px] bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h2 className="text-base font-bold text-gray-900">
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </h2>
          </div>
          <button
            onClick={handleSubmit}
            disabled={adding}
            className="bg-[#10B981] text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-[#059669] transition-colors disabled:opacity-60 shadow-sm"
          >
            {adding ? (editingProduct ? "Updating…" : "Adding…") : (editingProduct ? "Update Product" : "+ Add Product")}
          </button>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto px-5 py-5">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg px-4 py-2.5 font-medium">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Enter product name"
                value={formData.name}
                onChange={e => updateField("name", e.target.value)}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">Description</label>
              <input
                type="text"
                placeholder="Enter product description"
                value={formData.desc}
                onChange={e => updateField("desc", e.target.value)}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all"
              />
            </div>

            {/* Product Media */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-3">Product Media</label>
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center bg-gray-50/30 hover:bg-gray-50 hover:border-emerald-300 transition-all cursor-pointer group">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto mb-3 text-gray-300 group-hover:text-emerald-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="text-gray-800 font-bold text-[13px]">Drag & drop images here</p>
                <p className="text-gray-400 text-[10px] font-medium mt-1 uppercase tracking-wider">PNG, JPG or WebP up to 5MB</p>
              </div>
              <div className="mt-3">
                <label className="block text-[10px] font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Or enter image URL</label>
                <input
                  type="text"
                  placeholder="https://example.com/image.jpg"
                  value={formData.img}
                  onChange={e => updateField("img", e.target.value)}
                  className="w-full px-3.5 py-2 border border-gray-200 rounded-lg text-xs text-gray-800 placeholder-gray-400 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  SKU <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="SKU-XXX-000"
                  value={formData.sku}
                  onChange={e => updateField("sku", e.target.value.toUpperCase())}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.category}
                  onChange={e => updateField("category", e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all appearance-none bg-white"
                >
                  <option value="">Select</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Stock Level <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={formData.stock}
                  onChange={e => updateField("stock", e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Goal <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  placeholder="100"
                  value={formData.goal}
                  onChange={e => updateField("goal", e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Price (₹) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={formData.price}
                onChange={e => updateField("price", e.target.value)}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all"
              />
            </div>

            <div className="flex items-start gap-3 pt-2 pb-1">
              <button
                type="button"
                onClick={() => updateField("shop", !formData.shop)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none mt-0.5 ${
                  formData.shop ? "bg-emerald-500" : "bg-gray-300"
                }`}
              >
                <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ${
                  formData.shop ? "translate-x-5" : "translate-x-0"
                }`} />
              </button>
              <div>
                <p className="text-sm font-semibold text-gray-800 leading-snug">
                  Enable WhatsApp Shop
                </p>
                <p className={`text-xs mt-0.5 font-medium transition-colors ${formData.shop ? "text-emerald-600" : "text-gray-400"}`}>
                  {formData.shop
                    ? "✓ Product will be visible in WhatsApp Shop"
                    : "✗ Product will not be visible in WhatsApp Shop"}
                </p>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

const Inventory = () => {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const openEditDrawer = (product) => {
    setEditingProduct(product);
    setIsAddDrawerOpen(true);
  };

  const openAddDrawer = () => {
    setEditingProduct(null);
    setIsAddDrawerOpen(true);
  };

  const closeDrawer = () => {
    setIsAddDrawerOpen(false);
    setEditingProduct(null);
  };
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filters State
  const [filterSearch, setFilterSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("Category");
  const [filterStock, setFilterStock] = useState("Stock Levels");
  const [filteredProducts, setFilteredProducts] = useState([]);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await getProducts();
      if (response.success) {
        const mappedProducts = response.data.map(p => ({ ...p, key: p._id, product: { name: p.name, desc: p.description, img: p.img } }));
        setProducts(mappedProducts);
        setFilteredProducts(mappedProducts);
      }
    } catch (error) {
      toast.error("Failed to fetch inventory");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let result = [...products];
    if (filterSearch) {
      result = result.filter(item => 
        item.product?.name?.toLowerCase().includes(filterSearch.toLowerCase()) || 
        item.sku?.toLowerCase().includes(filterSearch.toLowerCase())
      );
    }
    if (filterCategory && filterCategory !== "Category") {
      result = result.filter(item => item.category?.toLowerCase() === filterCategory.toLowerCase());
    }
    if (filterStock && filterStock !== "Stock Levels") {
      if (filterStock === "In Stock") result = result.filter(item => item.stock > 0);
      if (filterStock === "Low Stock") result = result.filter(item => item.stock > 0 && item.stock < 10);
      if (filterStock === "Out of Stock") result = result.filter(item => item.stock === 0);
    }
    setFilteredProducts(result);
    setCurrentPage(1);
  }, [products, filterSearch, filterCategory, filterStock]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const exportCSV = () => {
    if (filteredProducts.length === 0) {
      toast.warning("No data to export");
      return;
    }
    const headers = ["Product Name", "SKU", "Stock", "Goal", "Price", "Category", "WhatsApp Shop"];
    const csvRows = [];
    csvRows.push(headers.join(","));
    for (const row of filteredProducts) {
      const values = [
        `"${row.product?.name || ""}"`,
        row.sku || "",
        row.stock || 0,
        row.goal || 0,
        row.price?.toString().replace(/,/g, "") || "",
        row.category || "",
        row.shop ? "Yes" : "No"
      ];
      csvRows.push(values.join(","));
    }
    const blob = new Blob([csvRows.join("\\n")], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventory_report_${new Date().getTime()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success("Inventory exported");
  };

  const toggleShop = async (productItem) => {
    try {
      const updatedItem = { ...productItem, shop: !productItem.shop };
      const apiData = {
        name: updatedItem.product.name,
        description: updatedItem.product.desc,
        img: updatedItem.product.img,
        sku: updatedItem.sku,
        stock: updatedItem.stock,
        goal: updatedItem.goal,
        price: parseFloat(updatedItem.price?.toString().replace(/[₹,]/g, "") || "0"),
        category: updatedItem.category,
        shop: updatedItem.shop
      };
      await updateProduct(updatedItem._id, apiData);
      setProducts(products.map(p => p._id === updatedItem._id ? updatedItem : p));
      toast.success(updatedItem.shop ? "Added to WhatsApp Shop" : "Removed from WhatsApp Shop");
    } catch (error) {
      toast.error("Failed to update product shop status");
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Stats Data calculated dynamically
  const totalProducts = products.length;
  const outOfStock = products.filter(p => p.stock === 0).length;
  const revenue = products.reduce((acc, p) => acc + (p.price * (p.goal - p.stock > 0 ? p.goal - p.stock : 0)), 0);

  const cards = [
    { title: "TOTAL PRODUCTS", value: totalProducts.toLocaleString(), change: "+0%", color: "blue" },
    { title: "OUT OF STOCK", value: outOfStock.toString(), change: "+0%", color: "red" },
    { title: "EST. REVENUE", value: `₹${(revenue/100000).toFixed(1)}L`, change: "+0%", color: "green" },
  ];

  const handleAddProduct = async (newProductData) => {
    try {
      const apiData = {
        name: newProductData.product.name,
        description: newProductData.product.desc,
        img: newProductData.product.img,
        sku: newProductData.sku,
        stock: newProductData.stock,
        goal: newProductData.goal,
        price: parseFloat(newProductData.price?.replace(/[₹,]/g, "") || "0"),
        category: newProductData.category,
        shop: newProductData.shop
      };

      if (editingProduct) {
        await updateProduct(editingProduct._id, apiData);
        toast.success("Product updated");
      } else {
        await createProduct(apiData);
        toast.success("Product added");
      }
      fetchProducts();
    } catch (error) {
      toast.error("Failed to save product");
      throw error;
    }
  };

  const confirmDelete = (product) => {
    setProductToDelete(product);
    setIsDeleteModalOpen(true);
  };

  const executeDelete = async () => {
    if (productToDelete) {
      try {
        await deleteProduct(productToDelete._id);
        toast.success("Product deleted");
        fetchProducts();
      } catch (error) {
        toast.error("Failed to delete product");
      }
    }
    setIsDeleteModalOpen(false);
    setProductToDelete(null);
  };

  const getStockColor = (stock, goal) => {
    if (stock === 0) return "bg-red-400";
    if (stock < goal * 0.2) return "bg-orange-400";
    return "bg-emerald-400";
  };

  const getStockTextColor = (stock) => {
    if (stock === 0) return "text-red-500";
    if (stock < 10) return "text-orange-500";
    return "text-emerald-500";
  };

  return (
    <div className="p-4 md:p-6 bg-[#F9FAFB] min-h-screen font-sans antialiased text-gray-900">{/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight text-gray-800">Inventory Management</h1>

        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={openAddDrawer}
            className="bg-[#10B981] hover:bg-[#059669] text-white px-4 py-2 rounded-lg font-semibold text-sm flex items-center gap-2 transition-all shadow-sm"
          >
            <span className="text-lg">+</span>
            Add Product
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {cards.map((card, i) => (
          <div
            key={i}
            className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-3">
              {card.title}
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-4">
              {card.value}
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700">
                {card.change}
              </span>
              <span className="text-[11px] text-gray-400 font-medium">
                vs last month
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-5 rounded-xl border border-gray-200 mb-6 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
          <div className="lg:col-span-5">
            <div className="relative">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search by SKU, Product name..."
                value={filterSearch}
                onChange={e => setFilterSearch(e.target.value)}
                className="w-full border border-gray-200 rounded-lg pl-10 pr-4 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all"
              />
            </div>
          </div>
          <div className="lg:col-span-2">
            <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all appearance-none bg-white">
              <option value="Category">Category</option>
              <option value="Electronics">Electronics</option>
              <option value="Gadgets">Gadgets</option>
              <option value="Professional">Professional</option>
              <option value="Accessories">Accessories</option>
              <option value="Apparel">Apparel</option>
              <option value="Clothing">Clothing</option>
              <option value="Others">Others</option>
            </select>
          </div>
          <div className="lg:col-span-2">
            <select value={filterStock} onChange={e => setFilterStock(e.target.value)} className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all appearance-none bg-white">
              <option value="Stock Levels">Stock Levels</option>
              <option value="In Stock">In Stock</option>
              <option value="Low Stock">Low Stock</option>
              <option value="Out of Stock">Out of Stock</option>
            </select>
          </div>
          <div className="lg:col-span-3 flex gap-2">
            <button onClick={() => setFilteredProducts([...filteredProducts])} className="flex-1 border border-gray-200 rounded-lg px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filter
            </button>
            <button onClick={exportCSV} className="border border-gray-200 rounded-lg px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <p className="text-lg font-semibold text-gray-700">No products found</p>
            <p className="text-[13px] mt-1">Your inventory will appear here</p>
          </div>
        ) : (
          <>
            <table className="w-full text-left border-collapse min-w-[1100px]">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-200">
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Product Info</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">SKU</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Stock Level</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">WhatsApp Shop</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {currentItems.map((item) => (
                  <tr key={item.key} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden border border-gray-200">
                          <img 
                            src={item.product.img || "https://via.placeholder.com/150?text=Product"} 
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "https://via.placeholder.com/150?text=No+Image";
                            }}
                          />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 text-[14px]">
                            {item.product.name}
                          </div>
                          <div className="text-[11px] text-gray-500 italic font-medium mt-0.5">
                            {item.product.desc}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-500 text-[11px] font-mono uppercase font-bold tracking-wide">
                        {item.sku}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="w-32">
                        <div className="flex justify-between mb-1.5">
                          <span className={`text-[11px] font-bold ${getStockTextColor(item.stock)}`}>
                            {item.stock} in stock
                          </span>
                          <span className="text-[9px] text-gray-400 font-bold uppercase">
                            Goal: {item.goal}
                          </span>
                        </div>
                        <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${getStockColor(item.stock, item.goal)}`}
                            style={{ width: `${Math.min((item.stock / item.goal) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-gray-900 text-[15px]">{item.price}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-md text-[12px] font-semibold bg-slate-100 text-slate-700">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleShop(item)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                          item.shop ? "bg-emerald-500" : "bg-gray-300"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                            item.shop ? "translate-x-6" : "translate-x-1"
                          }`}
                        />
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center gap-3 justify-end text-gray-400">
                        <button
                          onClick={() => openEditDrawer(item)}
                          className="hover:text-blue-500 transition-colors"
                          title="Edit"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => confirmDelete(item.product)}
                          className="hover:text-red-500 transition-colors"
                          title="Delete"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-gray-200 gap-4">
              <span className="text-[13px] font-medium text-gray-600">
                Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredProducts.length)} of {filteredProducts.length} products
              </span>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-lg text-[13px] font-semibold text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50"
                >
                  Previous
                </button>
                {[...Array(totalPages)].map((_, i) => (
                  <button 
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`min-w-[32px] h-8 px-2 rounded text-sm font-semibold transition-colors ${currentPage === i + 1 ? 'bg-[#10B981] text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button 
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="px-4 py-2 rounded-lg text-[13px] font-semibold text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* --- DELETE MODAL --- */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[360px] animate-in zoom-in duration-200 p-6 text-center">
            <div className="w-14 h-14 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-red-100">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <h3 className="text-[18px] font-bold text-gray-800 mb-2 leading-tight">Delete Product?</h3>
            <p className="text-[13px] font-medium text-gray-500 mb-8 px-2 leading-relaxed">
              {productToDelete ? (
                <>Are you sure you want to delete <span className="font-bold text-gray-800">{productToDelete.name}</span>? This action cannot be undone.</>
              ) : (
                "This will permanently remove the product. This action cannot be undone."
              )}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 order-2 sm:order-1 px-4 py-2.5 border border-gray-200 rounded-xl text-[13px] font-bold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={executeDelete}
                className="flex-1 order-1 sm:order-2 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-[13px] font-bold transition-all shadow-md active:translate-y-px"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Product Drawer */}
      <AddProductDrawer
        isOpen={isAddDrawerOpen}
        onClose={closeDrawer}
        onAdd={handleAddProduct}
        editingProduct={editingProduct}
      />
    </div>
  );
};

export default Inventory;
