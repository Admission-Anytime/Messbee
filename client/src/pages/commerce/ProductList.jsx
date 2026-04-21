import { useEffect, useState } from "react";
import SafeImage from "../../components/ui/SafeImage";
import ProductApi from "../../services/ProductApi";

const CATEGORY_OPTIONS = ["Apparel", "Accessories", "Others"];

const EMPTY_FORM = {
  name: "",
  sku: "",
  category: "",
  price: "",
  stock: "",
  img: "",
};

const getApiErrorMessage = (error) => {
  const apiMessage = error?.response?.data?.message;
  const verificationMessage = error?.response?.data?.metaVerification?.message;
  const rawError = error?.response?.data?.error;
  const detailMessage =
    typeof rawError === "string"
      ? rawError
      : rawError?.error?.message || rawError?.message;

  if (apiMessage && verificationMessage && !apiMessage.includes(verificationMessage)) {
    return `${apiMessage} (${verificationMessage})`;
  }

  if (apiMessage && detailMessage && !apiMessage.includes(detailMessage)) {
    return `${apiMessage} (${detailMessage})`;
  }

  return apiMessage || verificationMessage || detailMessage || error?.message || "Something went wrong";
};

const formatPrice = (value) =>
  new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value || 0);

const ProductList = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [drawerError, setDrawerError] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [initializingCommerce, setInitializingCommerce] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [dataSource, setDataSource] = useState([]);
  const [filters, setFilters] = useState({
    search: "",
    category: "",
    stockStatus: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (editingProduct) {
      setFormData({
        name: editingProduct.name || "",
        sku: editingProduct.sku || "",
        category: editingProduct.category || "",
        price: editingProduct.price?.toString() || "",
        stock: editingProduct.stock?.toString() || "",
        img: editingProduct.img || "",
      });
    } else {
      setFormData(EMPTY_FORM);
    }

    setDrawerError("");
  }, [editingProduct, isDrawerOpen]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((prev) => ({ ...prev, search: searchTerm }));
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    let isMounted = true;

    const loadProducts = async () => {
      setLoading(true);

      try {
        const items = await ProductApi.getProducts({
          ...(filters.search ? { search: filters.search } : {}),
          ...(filters.category ? { category: filters.category } : {}),
          ...(filters.stockStatus ? { stockStatus: filters.stockStatus } : {}),
        });

        if (!isMounted) return;

        setDataSource(items);
        setError("");
      } catch (fetchError) {
        if (!isMounted) return;

        setDataSource([]);
        setError(getApiErrorMessage(fetchError));
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadProducts();

    return () => {
      isMounted = false;
    };
  }, [filters.search, filters.category, filters.stockStatus, reloadKey]);

  const refreshProducts = () => {
    setReloadKey((current) => current + 1);
  };

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
    setDrawerError("");
  };

  const updateFormField = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) return "Product name is required";
    if (!formData.sku.trim()) return "SKU is required";
    if (!formData.category) return "Category is required";
    if (!formData.price || Number(formData.price) <= 0) return "Valid price is required";
    if (formData.stock === "" || Number(formData.stock) < 0) return "Valid stock level is required";
    return "";
  };

  const handleSaveProduct = async () => {
    const validationError = validateForm();
    if (validationError) {
      setDrawerError(validationError);
      return;
    }

    setSaving(true);
    setDrawerError("");
    setNotice("");

    try {
      const payload = {
        name: formData.name.trim(),
        sku: formData.sku.trim().toUpperCase(),
        category: formData.category,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock, 10),
        img: formData.img.trim(),
      };

      if (editingProduct?.id) {
        await ProductApi.updateProduct(editingProduct.id, payload);
      } else {
        await ProductApi.createProduct(payload);
      }

      closeDrawer();
      refreshProducts();
    } catch (saveError) {
      setDrawerError(getApiErrorMessage(saveError));
    } finally {
      setSaving(false);
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
    if (!productToDelete?.id) return;

    setDeleting(true);

    try {
      await ProductApi.deleteProduct(productToDelete.id);
      setIsDeleteModalOpen(false);
      setProductToDelete(null);
      refreshProducts();
    } catch (deleteError) {
      setError(getApiErrorMessage(deleteError));
    } finally {
      setDeleting(false);
    }
  };

  const copySKU = async (sku) => {
    try {
      await navigator.clipboard.writeText(sku);
      setNotice(`Copied SKU ${sku}`);
    } catch (copyError) {
      setError("Failed to copy SKU");
    }
  };

  const handleInitializeCommerce = async () => {
    setInitializingCommerce(true);
    setError("");
    setNotice("");

    try {
      const result = await ProductApi.initializeCommerceSettings();
      const displayPhoneNumber = result?.metaVerification?.phoneNumber?.displayPhoneNumber;

      setNotice(
        displayPhoneNumber
          ? `Meta commerce initialized for ${displayPhoneNumber}`
          : result?.message || "Meta commerce initialized successfully"
      );
    } catch (initError) {
      setError(getApiErrorMessage(initError));
    } finally {
      setInitializingCommerce(false);
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setFilters({
      search: "",
      category: "",
      stockStatus: "",
    });
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] p-4 font-sans antialiased text-gray-900 md:p-6">
      <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-800">Product List</h1>
          <p className="mt-1 text-[13px] font-medium text-gray-500">Manage your digital catalog & inventory</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleInitializeCommerce}
            disabled={initializingCommerce}
            className="rounded-lg border border-emerald-200 px-4 py-2 text-sm font-semibold text-emerald-700 transition-colors hover:bg-emerald-50 disabled:opacity-60"
          >
            {initializingCommerce ? "Initializing..." : "Init Commerce"}
          </button>
          <button
            onClick={refreshProducts}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-50"
          >
            Refresh
          </button>
          <button
            onClick={openAddDrawer}
            className="flex items-center gap-2 rounded-lg bg-[#10B981] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#059669]"
          >
            <span className="text-lg">+</span>
            Add Product
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      {notice && (
        <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          {notice}
        </div>
      )}

      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, SKU..."
              className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
            />
          </div>
          <div className="lg:col-span-3">
            <select
              value={filters.category}
              onChange={(e) => setFilters((prev) => ({ ...prev, category: e.target.value }))}
              className="w-full appearance-none rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
            >
              <option value="">All Categories</option>
              {CATEGORY_OPTIONS.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          <div className="lg:col-span-3">
            <select
              value={filters.stockStatus}
              onChange={(e) => setFilters((prev) => ({ ...prev, stockStatus: e.target.value }))}
              className="w-full appearance-none rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
            >
              <option value="">All Stock Status</option>
              <option value="in">In Stock</option>
              <option value="low">Low Stock</option>
              <option value="out">Out of Stock</option>
            </select>
          </div>
        </div>

        {(filters.search || filters.category || filters.stockStatus) && (
          <div className="mt-4 flex justify-end">
            <button
              onClick={clearFilters}
              className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 transition-colors hover:bg-gray-50"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-emerald-500"></div>
          </div>
        ) : dataSource.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="mb-4 h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <p className="text-lg font-semibold text-gray-700">No products found</p>
            <p className="mt-1 text-[13px]">Start by adding your first product</p>
          </div>
        ) : (
          <table className="min-w-[900px] w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/50">
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-gray-500">Product</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-gray-500">SKU</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-gray-500">Category</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-gray-500">Price</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-gray-500">Stock</th>
                <th className="px-6 py-4 text-right text-[11px] font-bold uppercase tracking-wider text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {dataSource.map((product) => {
                const stockStatus = getStockStatus(product.stock);

                return (
                  <tr key={product.key} className="transition-colors hover:bg-gray-50/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-gray-100">
                          <SafeImage
                            src={product.img || "https://via.placeholder.com/150?text=Product"}
                            alt={product.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="text-[14px] font-semibold text-gray-900">{product.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-[11px] font-bold uppercase tracking-wide text-gray-500">{product.sku}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="rounded-md bg-blue-50 px-2.5 py-1 text-[12px] font-semibold text-blue-800">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[15px] font-bold text-gray-900">₹{formatPrice(product.price)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <span className={`rounded-md px-2.5 py-1 text-[13px] font-semibold ${stockStatus.bg} ${stockStatus.text}`}>
                          {stockStatus.label}
                        </span>
                        <div className="mt-1 text-[10px] font-medium text-gray-400">{product.stock} units</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-3 text-gray-400">
                        <button
                          onClick={() => openEditDrawer(product)}
                          className="transition-colors hover:text-blue-500"
                          title="Edit"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => copySKU(product.sku)}
                          className="transition-colors hover:text-emerald-500"
                          title="Copy SKU"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => confirmDelete(product)}
                          className="transition-colors hover:text-red-500"
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

      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-[360px] animate-in zoom-in rounded-2xl bg-white p-6 text-center shadow-2xl duration-200">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-red-100 bg-red-50 text-red-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <h3 className="mb-2 text-[18px] font-bold leading-tight text-gray-800">Delete Product?</h3>
            <p className="mb-8 px-2 text-[13px] font-medium leading-relaxed text-gray-500">
              {productToDelete ? (
                <>
                  Are you sure you want to delete <span className="font-bold text-gray-800">{productToDelete.name}</span>? This action cannot be undone.
                </>
              ) : (
                "This will permanently remove the product. This action cannot be undone."
              )}
            </p>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="order-2 flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-[13px] font-bold text-gray-600 transition-colors hover:bg-gray-50 sm:order-1"
              >
                Cancel
              </button>
              <button
                onClick={executeDelete}
                disabled={deleting}
                className="order-1 flex-1 rounded-xl bg-red-500 px-4 py-2.5 text-[13px] font-bold text-white shadow-md transition-all hover:bg-red-600 active:translate-y-px disabled:opacity-60 sm:order-2"
              >
                {deleting ? "Deleting..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}

      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeDrawer} />
          <div className="absolute right-0 top-0 flex h-full w-full max-w-[580px] animate-in slide-in-from-right flex-col bg-white shadow-2xl duration-300">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
              <h2 className="text-[17px] font-bold uppercase tracking-tight text-gray-800">
                {editingProduct ? "Edit Product" : "Add New Product"}
              </h2>
              <div className="flex items-center gap-3">
                <button
                  onClick={closeDrawer}
                  className="px-4 py-2 text-[13px] font-bold text-gray-500 transition-colors hover:text-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveProduct}
                  disabled={saving}
                  className="rounded-xl bg-[#10B981] px-6 py-2.5 text-[13px] font-bold text-white shadow-md transition-all hover:bg-[#059669] active:translate-y-px disabled:opacity-60"
                >
                  {saving ? "Saving..." : editingProduct ? "Update Product" : "Save Product"}
                </button>
              </div>
            </div>

            <div className="flex-1 space-y-8 overflow-y-auto p-6">
              {drawerError && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                  {drawerError}
                </div>
              )}

              <section>
                <h3 className="mb-6 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.15em] text-[#10B981]">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Basic Information
                </h3>
                <div className="space-y-5">
                  <div>
                    <label className="mb-1.5 block text-[13px] font-bold text-gray-700">Product Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Premium Cotton Polo"
                      value={formData.name}
                      onChange={(e) => updateFormField("name", e.target.value)}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50/30 px-4 py-2.5 text-sm font-medium outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className="mb-1.5 block text-[13px] font-bold text-gray-700">SKU ID</label>
                      <input
                        type="text"
                        placeholder="PRD-001"
                        value={formData.sku}
                        onChange={(e) => updateFormField("sku", e.target.value.toUpperCase())}
                        className="w-full rounded-xl border border-gray-200 bg-gray-50/30 px-4 py-2.5 text-sm font-medium outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-[13px] font-bold text-gray-700">Category</label>
                      <select
                        value={formData.category}
                        onChange={(e) => updateFormField("category", e.target.value)}
                        className="w-full appearance-none rounded-xl border border-gray-200 bg-gray-50/30 px-4 py-2.5 text-sm font-medium outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
                      >
                        <option value="">Select Category</option>
                        {CATEGORY_OPTIONS.map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="mb-6 text-[11px] font-bold uppercase tracking-[0.15em] text-[#10B981]">
                  Product Media
                </h3>
                <div className="group cursor-pointer rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/30 p-12 text-center transition-all hover:border-emerald-300 hover:bg-gray-50">
                  <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto mb-4 h-12 w-12 text-gray-300 transition-colors group-hover:text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="text-[14px] font-bold text-gray-800">Drag & drop images here</p>
                  <p className="mt-1.5 text-[11px] font-medium uppercase tracking-wider text-gray-400">PNG, JPG or WebP up to 5MB</p>
                </div>
                <div className="mt-4">
                  <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-gray-500">Or enter image URL</label>
                  <input
                    type="text"
                    placeholder="https://example.com/image.jpg"
                    value={formData.img}
                    onChange={(e) => updateFormField("img", e.target.value)}
                    className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
                  />
                </div>
              </section>

              <section>
                <h3 className="mb-6 text-[11px] font-bold uppercase tracking-[0.15em] text-[#10B981]">
                  Pricing & Inventory
                </h3>
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="mb-1.5 block text-[13px] font-bold text-gray-700">Price (INR)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">₹</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        value={formData.price}
                        onChange={(e) => updateFormField("price", e.target.value)}
                        className="w-full rounded-xl border border-gray-200 bg-gray-50/30 py-2.5 pl-8 pr-4 text-sm font-bold outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-[13px] font-bold text-gray-700">Initial Stock</label>
                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={formData.stock}
                      onChange={(e) => updateFormField("stock", e.target.value)}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50/30 px-4 py-2.5 text-sm font-bold outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
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
