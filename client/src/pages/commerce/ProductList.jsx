import React, { useState, useEffect } from "react";
import { getProducts, createProduct, updateProduct, deleteProduct } from "../../services/CommerceApi";
import { toast } from "react-toastify";

const ProductList = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    category: "",
    price: "",
    stock: "",
    img: ""
  });
  const [dataSource, setDataSource] = useState([]);

  // Filters State
  const [filterSearch, setFilterSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterStock, setFilterStock] = useState("");

  const filteredDataSource = dataSource.filter(product => {
    const matchSearch = filterSearch ? (product.name?.toLowerCase().includes(filterSearch.toLowerCase()) || product.sku?.toLowerCase().includes(filterSearch.toLowerCase())) : true;
    const matchCategory = filterCategory ? product.category?.toLowerCase() === filterCategory.toLowerCase() : true;
    let matchStock = true;
    if (filterStock === "in") matchStock = product.stock > 0;
    if (filterStock === "low") matchStock = product.stock > 0 && product.stock < 10;
    if (filterStock === "out") matchStock = product.stock === 0;
    return matchSearch && matchCategory && matchStock;
  });

  // Fetch products from API
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await getProducts();
      if (response.success) {
        setDataSource(response.data.map(p => ({ ...p, key: p._id })));
      }
    } catch (error) {
      toast.error("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Pre-fill form when editing
  React.useEffect(() => {
    if (editingProduct) {
      setFormData({
        name: editingProduct.name || "",
        sku: editingProduct.sku || "",
        category: editingProduct.category || "",
        price: editingProduct.price || "",
        stock: editingProduct.stock?.toString() || "",
        img: editingProduct.img || ""
      });
    } else {
      setFormData({
        name: "",
        sku: "",
        category: "",
        price: "",
        stock: "",
        img: ""
      });
    }
  }, [editingProduct, isDrawerOpen]);

  const openEditDrawer = (product) => {
    setEditingProduct(product);
    setIsDrawerOpen(true);
  };

  const openAddDrawer = () => {
    setEditingProduct(null);
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setEditingProduct(null);
  };

  const updateFormField = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveProduct = async () => {
    // Validation
    if (!formData.name || !formData.sku || !formData.category || !formData.price || !formData.stock) {
      toast.warning("Please fill in all required fields");
      return;
    }

    try {
      const productData = {
        name: formData.name,
        sku: formData.sku,
        category: formData.category,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        img: formData.img
      };

      if (editingProduct) {
        const response = await updateProduct(editingProduct._id, productData);
        if (response.success) {
          toast.success("Product updated successfully");
        }
      } else {
        const response = await createProduct(productData);
        if (response.success) {
          toast.success("Product added successfully");
        }
      }
      fetchProducts();
      closeDrawer();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save product");
    }
  };

  const getStockStatus = (stock) => {
    if (stock === 0) return { label: "Out of Stock", bg: "bg-red-50", text: "text-red-800" };
    if (stock < 10) return { label: "Low Stock", bg: "bg-amber-50", text: "text-amber-800" };
    return { label: "In Stock", bg: "bg-emerald-50", text: "text-emerald-800" };
  };

  const confirmDelete = (product) => {
    setProductToDelete(product);
    setIsDeleteModalOpen(true);
  };

  const executeDelete = async () => {
    if (productToDelete) {
      try {
        const response = await deleteProduct(productToDelete._id);
        if (response.success) {
          toast.success("Product deleted successfully");
          fetchProducts();
        }
      } catch (error) {
        toast.error("Failed to delete product");
      }
    }
    setIsDeleteModalOpen(false);
    setProductToDelete(null);
  };

  const copySKU = (sku) => {
    navigator.clipboard.writeText(sku);
    // You can add a toast notification here
  };

  return (
    <div className="p-4 md:p-6 bg-[#F9FAFB] min-h-screen font-sans antialiased text-gray-900">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-800">Product List</h1>
          <p className="text-gray-500 text-[13px] mt-1 font-medium">Manage your digital catalog & inventory</p>
        </div>
        <button
          onClick={openAddDrawer}
          className="bg-[#10B981] hover:bg-[#059669] text-white px-4 py-2 rounded-lg font-semibold text-sm flex items-center gap-2 transition-all shadow-sm"
        >
          <span className="text-lg">+</span>
          Add Product
        </button>
      </div>

      {/* Filter Section */}
      <div className="bg-white p-5 rounded-xl border border-gray-200 mb-6 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Search by name, SKU..."
            value={filterSearch}
            onChange={(e) => setFilterSearch(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all"
          />
          <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all appearance-none bg-white">
            <option value="">All Categories</option>
            <option value="apparel">Apparel</option>
            <option value="accessories">Accessories</option>
          </select>
          <select value={filterStock} onChange={(e) => setFilterStock(e.target.value)} className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all appearance-none bg-white">
            <option value="">All Stock Status</option>
            <option value="in">In Stock</option>
            <option value="low">Low Stock</option>
            <option value="out">Out of Stock</option>
          </select>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
          </div>
        ) : filteredDataSource.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <p className="text-lg font-semibold text-gray-700">No products found</p>
            <p className="text-[13px] mt-1">Start by adding your first product</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-200">
                <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">SKU</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Stock</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredDataSource.map((product) => {
                const stockStatus = getStockStatus(product.stock);
                return (
                  <tr key={product.key} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden border border-gray-200">
                          <img 
                            src={product.img || "https://via.placeholder.com/150?text=Product"} 
                            alt={product.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "https://via.placeholder.com/150?text=No+Image";
                            }}
                          />
                        </div>
                        <div className="font-semibold text-gray-900 text-[14px]">{product.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-500 text-[11px] font-mono uppercase font-bold tracking-wide">{product.sku}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-md text-[12px] font-semibold bg-blue-50 text-blue-800">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-gray-900 text-[15px]">₹{product.price}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <span className={`px-2.5 py-1 rounded-md text-[13px] font-semibold ${stockStatus.bg} ${stockStatus.text}`}>
                          {stockStatus.label}
                        </span>
                        <div className="text-[10px] text-gray-400 font-medium mt-1">
                          {product.stock} units
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center gap-3 justify-end text-gray-400">
                        <button
                          onClick={() => openEditDrawer(product)}
                          className="hover:text-blue-500 transition-colors"
                          title="Edit"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => copySKU(product.sku)}
                          className="hover:text-emerald-500 transition-colors"
                          title="Copy SKU"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => confirmDelete(product)}
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
                );
              })}
            </tbody>
          </table>
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

      {/* --- ADD/EDIT DRAWER --- */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeDrawer} />
          <div className="absolute right-0 top-0 h-full w-full max-w-[580px] bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            {/* Drawer Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center z-10">
              <h2 className="text-[17px] font-bold text-gray-800 uppercase tracking-tight">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h2>
              <div className="flex items-center gap-3">
                <button
                  onClick={closeDrawer}
                  className="text-[13px] font-bold text-gray-500 hover:text-gray-700 transition-colors px-4 py-2"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSaveProduct}
                  className="bg-[#10B981] hover:bg-[#059669] text-white px-6 py-2.5 rounded-xl font-bold text-[13px] transition-all shadow-md active:translate-y-px"
                >
                  {editingProduct ? 'Update Product' : 'Save Product'}
                </button>
              </div>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {/* SECTION 1: BASIC INFO */}
              <section>
                <h3 className="text-[#10B981] font-bold text-[11px] tracking-[0.15em] mb-6 flex items-center gap-2 uppercase">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Basic Information
                </h3>
                <div className="space-y-5">
                  <div>
                    <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Product Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Premium Cotton Polo"
                      value={formData.name}
                      onChange={(e) => updateFormField("name", e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all outline-none text-sm font-medium bg-gray-50/30"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className="block text-[13px] font-bold text-gray-700 mb-1.5">SKU ID</label>
                      <input
                        type="text"
                        placeholder="PRD-001"
                        value={formData.sku}
                        onChange={(e) => updateFormField("sku", e.target.value)}
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all outline-none text-sm font-medium bg-gray-50/30"
                      />
                    </div>
                    <div>
                      <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Category</label>
                      <select 
                        value={formData.category}
                        onChange={(e) => updateFormField("category", e.target.value)}
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all outline-none text-sm font-medium bg-gray-50/30 appearance-none"
                      >
                        <option value="">Select Category</option>
                        <option value="Apparel">Apparel</option>
                        <option value="Accessories">Accessories</option>
                      </select>
                    </div>
                  </div>
                </div>
              </section>

              {/* SECTION 2: MEDIA */}
              <section>
                <h3 className="text-[#10B981] font-bold text-[11px] tracking-[0.15em] mb-6 uppercase">
                  Product Media
                </h3>
                <div className="border-2 border-dashed border-gray-200 rounded-2xl p-12 text-center bg-gray-50/30 hover:bg-gray-50 hover:border-emerald-300 transition-all cursor-pointer group">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4 text-gray-300 group-hover:text-emerald-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="text-gray-800 font-bold text-[14px]">Drag & drop images here</p>
                  <p className="text-gray-400 text-[11px] font-medium mt-1.5 uppercase tracking-wider">PNG, JPG or WebP up to 5MB</p>
                </div>
                <div className="mt-4">
                  <label className="block text-[11px] font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Or enter image URL</label>
                  <input
                    type="text"
                    placeholder="https://example.com/image.jpg"
                    value={formData.img}
                    onChange={(e) => updateFormField("img", e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all"
                  />
                </div>
              </section>

              {/* SECTION 3: PRICING & STOCK */}
              <section>
                <h3 className="text-[#10B981] font-bold text-[11px] tracking-[0.15em] mb-6 uppercase">
                  Pricing & Inventory
                </h3>
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Price (INR)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
                      <input
                        type="text"
                        placeholder="0.00"
                        value={formData.price}
                        onChange={(e) => updateFormField("price", e.target.value)}
                        className="w-full border border-gray-200 rounded-xl pl-8 pr-4 py-2.5 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all outline-none text-sm font-bold bg-gray-50/30"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Initial Stock</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={formData.stock}
                      onChange={(e) => updateFormField("stock", e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all outline-none text-sm font-bold bg-gray-50/30"
                    />
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductList;
