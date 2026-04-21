import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import InventoryApi from "../../services/InventoryApi";
import SafeImage from "../../components/ui/SafeImage";

const CATEGORIES = ["Electronics", "Gadgets", "Professional", "Accessories", "Clothing", "Others"];

const EMPTY_FORM = {
  name: "",
  desc: "",
  img: "",
  sku: "",
  stock: "",
  goal: "",
  price: "",
  category: "",
  shop: false,
};

const EMPTY_SUMMARY = {
  totalProducts: 0,
  outOfStock: 0,
  lowStock: 0,
  inventoryValue: 0,
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

const formatCompactCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value || 0);

function AddProductDrawer({ isOpen, onClose, onSave, editingProduct }) {
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (editingProduct) {
      setFormData({
        name: editingProduct.name || editingProduct.product?.name || "",
        desc: editingProduct.desc || editingProduct.product?.desc || "",
        img: editingProduct.img || editingProduct.product?.img || "",
        sku: editingProduct.sku || "",
        stock: editingProduct.stock?.toString() || "",
        goal: editingProduct.goal?.toString() || "",
        price:
          editingProduct.priceValue?.toString() ||
          editingProduct.price?.replace(/[₹,]/g, "") ||
          "",
        category: editingProduct.category || "",
        shop: Boolean(editingProduct.shop),
      });
    } else {
      setFormData(EMPTY_FORM);
    }

    setError("");
  }, [editingProduct, isOpen]);

  if (!isOpen) return null;

  const updateField = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (event) => {
    event?.preventDefault();
    setError("");

    if (!formData.name.trim()) {
      setError("Product name is required");
      return;
    }

    if (!formData.sku.trim()) {
      setError("SKU is required");
      return;
    }

    if (!formData.category) {
      setError("Category is required");
      return;
    }

    if (!formData.price || Number(formData.price) <= 0) {
      setError("Valid price is required");
      return;
    }

    if (formData.stock === "" || Number(formData.stock) < 0) {
      setError("Valid stock level is required");
      return;
    }

    if (!formData.goal || Number(formData.goal) <= 0) {
      setError("Valid goal is required");
      return;
    }

    setSaving(true);

    try {
      await onSave({
        name: formData.name.trim(),
        desc: formData.desc.trim(),
        img: formData.img.trim(),
        sku: formData.sku.trim().toUpperCase(),
        stock: parseInt(formData.stock, 10),
        goal: parseInt(formData.goal, 10),
        price: parseFloat(formData.price),
        category: formData.category,
        shop: formData.shop,
      });

      setFormData(EMPTY_FORM);
      onClose();
    } catch (saveError) {
      setError(saveError.message || "Failed to save product");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[700] flex justify-end font-sans">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative flex h-full w-[440px] flex-col bg-white shadow-2xl animate-in slide-in-from-right duration-200">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="rounded-lg p-1.5 transition-colors hover:bg-gray-100">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h2 className="text-base font-bold text-gray-900">
              {editingProduct ? "Edit Product" : "Add New Product"}
            </h2>
          </div>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="rounded-lg bg-[#10B981] px-6 py-2 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#059669] disabled:opacity-60"
          >
            {saving ? (editingProduct ? "Updating..." : "Adding...") : editingProduct ? "Update Product" : "+ Add Product"}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-xs font-medium text-red-700">
                {error}
              </div>
            )}

            <div>
              <label className="mb-1.5 block text-xs font-bold text-gray-700">
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Enter product name"
                value={formData.name}
                onChange={(e) => updateField("name", e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm text-gray-800 outline-none transition-all placeholder:text-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold text-gray-700">Description</label>
              <input
                type="text"
                placeholder="Enter product description"
                value={formData.desc}
                onChange={(e) => updateField("desc", e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm text-gray-800 outline-none transition-all placeholder:text-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
              />
            </div>

            <div>
              <label className="mb-3 block text-xs font-bold text-gray-700">Product Media</label>
              <div className="group cursor-pointer rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/30 p-8 text-center transition-all hover:border-emerald-300 hover:bg-gray-50">
                <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto mb-3 h-10 w-10 text-gray-300 transition-colors group-hover:text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="text-[13px] font-bold text-gray-800">Drag & drop images here</p>
                <p className="mt-1 text-[10px] font-medium uppercase tracking-wider text-gray-400">
                  PNG, JPG or WebP up to 5MB
                </p>
              </div>
              <div className="mt-3">
                <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-gray-500">
                  Or enter image URL
                </label>
                <input
                  type="text"
                  placeholder="https://example.com/image.jpg"
                  value={formData.img}
                  onChange={(e) => updateField("img", e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3.5 py-2 text-xs text-gray-800 outline-none transition-all placeholder:text-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-xs font-bold text-gray-700">
                  SKU <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="SKU-XXX-000"
                  value={formData.sku}
                  onChange={(e) => updateField("sku", e.target.value.toUpperCase())}
                  className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 font-mono text-sm text-gray-800 outline-none transition-all placeholder:text-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold text-gray-700">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => updateField("category", e.target.value)}
                  className="w-full appearance-none rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-800 outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
                >
                  <option value="">Select</option>
                  {CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-xs font-bold text-gray-700">
                  Stock Level <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={formData.stock}
                  onChange={(e) => updateField("stock", e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm text-gray-800 outline-none transition-all placeholder:text-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold text-gray-700">
                  Goal <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  placeholder="100"
                  value={formData.goal}
                  onChange={(e) => updateField("goal", e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm text-gray-800 outline-none transition-all placeholder:text-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold text-gray-700">
                Price (₹) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={formData.price}
                onChange={(e) => updateField("price", e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm text-gray-800 outline-none transition-all placeholder:text-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
              />
            </div>

            <div className="flex items-start gap-3 pb-1 pt-2">
              <button
                type="button"
                onClick={() => updateField("shop", !formData.shop)}
                className={`relative mt-0.5 inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                  formData.shop ? "bg-emerald-500" : "bg-gray-300"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ${
                    formData.shop ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
              <div>
                <p className="text-sm font-semibold leading-snug text-gray-800">Enable WhatsApp Shop</p>
                <p
                  className={`mt-0.5 text-xs font-medium transition-colors ${
                    formData.shop ? "text-emerald-600" : "text-gray-400"
                  }`}
                >
                  {formData.shop
                    ? "Product will be visible in WhatsApp Shop"
                    : "Product will not be visible in WhatsApp Shop"}
                </p>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

AddProductDrawer.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  editingProduct: PropTypes.shape({
    id: PropTypes.string,
    key: PropTypes.string,
    name: PropTypes.string,
    desc: PropTypes.string,
    img: PropTypes.string,
    sku: PropTypes.string,
    stock: PropTypes.number,
    goal: PropTypes.number,
    price: PropTypes.string,
    priceValue: PropTypes.number,
    category: PropTypes.string,
    shop: PropTypes.bool,
    product: PropTypes.shape({
      name: PropTypes.string,
      desc: PropTypes.string,
      img: PropTypes.string,
    }),
  }),
};

AddProductDrawer.defaultProps = {
  editingProduct: null,
};

const Inventory = () => {
  const [loading, setLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [products, setProducts] = useState([]);
  const [summary, setSummary] = useState(EMPTY_SUMMARY);
  const [filters, setFilters] = useState({
    search: "",
    category: "",
    stockStatus: "",
  });
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [initializingCommerce, setInitializingCommerce] = useState(false);
  const [updatingShopId, setUpdatingShopId] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  const hasActiveFilters = Boolean(filters.search || filters.category || filters.stockStatus);

  useEffect(() => {
    let isMounted = true;

    const timer = setTimeout(async () => {
      setLoading(true);

      try {
        const items = await InventoryApi.getInventoryItems({
          ...(filters.search ? { search: filters.search } : {}),
          ...(filters.category ? { category: filters.category } : {}),
          ...(filters.stockStatus ? { stockStatus: filters.stockStatus } : {}),
        });

        if (!isMounted) return;

        setProducts(items);
        setError("");
      } catch (fetchError) {
        if (!isMounted) return;

        setProducts([]);
        setError(getApiErrorMessage(fetchError));
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }, filters.search ? 400 : 0);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [filters.search, filters.category, filters.stockStatus, reloadKey]);

  // Handle searchTerm debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters(prev => ({ ...prev, search: searchTerm }));
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    let isMounted = true;

    const loadSummary = async () => {
      setSummaryLoading(true);

      try {
        const data = await InventoryApi.getInventorySummary();

        if (!isMounted) return;

        setSummary({ ...EMPTY_SUMMARY, ...data });
      } catch (summaryError) {
        if (!isMounted) return;

        console.error("Failed to fetch inventory summary:", summaryError);
        setSummary(EMPTY_SUMMARY);
      } finally {
        if (isMounted) {
          setSummaryLoading(false);
        }
      }
    };

    loadSummary();

    return () => {
      isMounted = false;
    };
  }, [reloadKey]);

  const refreshInventory = () => {
    setReloadKey((current) => current + 1);
  };

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

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setSearchTerm("");
    setFilters({
      search: "",
      category: "",
      stockStatus: "",
    });
  };

  const handleSaveProduct = async (payload) => {
    try {
      setNotice("");
      if (editingProduct?.id) {
        await InventoryApi.updateInventoryItem(editingProduct.id, payload);
      } else {
        await InventoryApi.createInventoryItem(payload);
      }

      refreshInventory();
    } catch (saveError) {
      throw new Error(getApiErrorMessage(saveError));
    }
  };

  const handleInitializeCommerce = async () => {
    setInitializingCommerce(true);
    setError("");
    setNotice("");

    try {
      const result = await InventoryApi.initializeCommerceSettings();
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

  const confirmDelete = (product) => {
    setProductToDelete(product);
    setIsDeleteModalOpen(true);
  };

  const executeDelete = async () => {
    if (!productToDelete?.id) return;

    setDeleting(true);

    try {
      await InventoryApi.deleteInventoryItem(productToDelete.id);
      setIsDeleteModalOpen(false);
      setProductToDelete(null);
      refreshInventory();
    } catch (deleteError) {
      setError(getApiErrorMessage(deleteError));
    } finally {
      setDeleting(false);
    }
  };

  const handleShopToggle = async (product) => {
    setUpdatingShopId(product.id);

    try {
      const updatedProduct = await InventoryApi.updateInventoryItem(product.id, {
        shop: !product.shop,
      });

      setProducts((prev) =>
        prev.map((item) => (item.id === updatedProduct.id ? updatedProduct : item))
      );
    } catch (toggleError) {
      setError(getApiErrorMessage(toggleError));
    } finally {
      setUpdatingShopId("");
    }
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

  const cards = [
    {
      title: "TOTAL PRODUCTS",
      value: summaryLoading ? "..." : summary.totalProducts.toLocaleString("en-IN"),
    },
    {
      title: "OUT OF STOCK",
      value: summaryLoading ? "..." : summary.outOfStock.toLocaleString("en-IN"),
    },
    {
      title: "INVENTORY VALUE",
      value: summaryLoading ? "..." : formatCompactCurrency(summary.inventoryValue),
    },
  ];

  return (
    <div className="min-h-screen bg-[#F9FAFB] p-4 font-sans antialiased text-gray-900 md:p-6">
      <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-800">Inventory Management</h1>
          <p className="mt-1 text-[13px] font-medium text-gray-500">
            Manage stock levels, sales goals and WhatsApp Shop visibility.
          </p>
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
            onClick={refreshInventory}
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

      <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-3">
        {cards.map((card) => (
          <div
            key={card.title}
            className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="mb-3 text-[11px] font-bold uppercase tracking-wider text-gray-500">
              {card.title}
            </div>
            <div className="mb-1 text-3xl font-bold text-gray-900">{card.value}</div>
          </div>
        ))}
      </div>

      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="grid grid-cols-1 items-center gap-4 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <div className="relative">
              <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by SKU, product name or description..."
                className="w-full rounded-lg border border-gray-200 py-2 pl-10 pr-4 text-sm outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
              />
            </div>
          </div>

          <div className="lg:col-span-3">
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange("category", e.target.value)}
              className="w-full appearance-none rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
            >
              <option value="">All Categories</option>
              {CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className="lg:col-span-2">
            <select
              value={filters.stockStatus}
              onChange={(e) => handleFilterChange("stockStatus", e.target.value)}
              className="w-full appearance-none rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
            >
              <option value="">All Stock Levels</option>
              <option value="in_stock">In Stock</option>
              <option value="low_stock">Low Stock</option>
              <option value="out_of_stock">Out of Stock</option>
            </select>
          </div>

          <div className="flex gap-2 lg:col-span-2">
            <button
              onClick={clearFilters}
              disabled={!hasActiveFilters}
              className="flex-1 rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Clear
            </button>
            <button
              onClick={refreshInventory}
              className="flex-1 rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-50"
            >
              Reload
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-emerald-500" />
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="mb-4 h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <p className="text-lg font-semibold text-gray-700">No products found</p>
            <p className="mt-1 text-[13px]">
              {hasActiveFilters
                ? "Try adjusting your filters to see more results."
                : "Your inventory will appear here once you add products."}
            </p>
          </div>
        ) : (
          <>
            <table className="min-w-[1100px] w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/50">
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-gray-500">Product Info</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-gray-500">SKU</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-gray-500">Stock Level</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-gray-500">Price</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-gray-500">Category</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-gray-500">WhatsApp Shop</th>
                  <th className="px-6 py-4 text-right text-[11px] font-bold uppercase tracking-wider text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map((item) => (
                  <tr key={item.key} className="transition-colors hover:bg-gray-50/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-gray-100">
                          <SafeImage
                            src={item.product.img}
                            alt={item.product.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div>
                          <div className="text-[14px] font-semibold text-gray-900">{item.product.name}</div>
                          <div className="mt-0.5 text-[11px] font-medium italic text-gray-500">
                            {item.product.desc || "No description"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-[11px] font-bold uppercase tracking-wide text-gray-500">
                        {item.sku}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="w-32">
                        <div className="mb-1.5 flex justify-between">
                          <span className={`text-[11px] font-bold ${getStockTextColor(item.stock)}`}>
                            {item.stock} in stock
                          </span>
                          <span className="text-[9px] font-bold uppercase text-gray-400">
                            Goal: {item.goal}
                          </span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                          <div
                            className={`h-full rounded-full ${getStockColor(item.stock, item.goal)}`}
                            style={{ width: `${Math.min((item.stock / item.goal) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[15px] font-bold text-gray-900">{item.price}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="rounded-md bg-slate-100 px-2.5 py-1 text-[12px] font-semibold text-slate-700">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleShopToggle(item)}
                        disabled={updatingShopId === item.id}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-60 ${
                          item.shop ? "bg-emerald-500" : "bg-gray-300"
                        }`}
                        title={item.shop ? "Disable WhatsApp Shop" : "Enable WhatsApp Shop"}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                            item.shop ? "translate-x-6" : "translate-x-1"
                          }`}
                        />
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-3 text-gray-400">
                        <button
                          onClick={() => openEditDrawer(item)}
                          className="transition-colors hover:text-blue-500"
                          title="Edit"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => confirmDelete(item)}
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
                ))}
              </tbody>
            </table>

            <div className="flex flex-col items-center justify-between gap-4 border-t border-gray-200 px-6 py-4 sm:flex-row">
              <span className="text-[13px] font-medium text-gray-600">
                Showing {products.length} product{products.length === 1 ? "" : "s"}
              </span>
              <button
                onClick={refreshInventory}
                className="rounded-lg border border-gray-200 px-4 py-2 text-[13px] font-semibold text-gray-600 transition-colors hover:bg-gray-100"
              >
                Refresh List
              </button>
            </div>
          </>
        )}
      </div>

      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-[360px] rounded-2xl bg-white p-6 text-center shadow-2xl animate-in zoom-in duration-200">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-red-100 bg-red-50 text-red-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <h3 className="mb-2 text-[18px] font-bold leading-tight text-gray-800">Delete Product?</h3>
            <p className="mb-8 px-2 text-[13px] font-medium leading-relaxed text-gray-500">
              {productToDelete ? (
                <>
                  Are you sure you want to delete{" "}
                  <span className="font-bold text-gray-800">{productToDelete.product?.name}</span>?
                  This action cannot be undone.
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

      <AddProductDrawer
        isOpen={isAddDrawerOpen}
        onClose={closeDrawer}
        onSave={handleSaveProduct}
        editingProduct={editingProduct}
      />
    </div>
  );
};

export default Inventory;
