import { useEffect, useState, useRef } from "react";
import toast from "react-hot-toast";
import { Plus, Search, Edit2, Trash2, X, Image as ImageIcon, Upload, Link } from "lucide-react";
import api from "../../utils/api";
import { resolveImageUrl } from "../../utils/imageUrl";
import ConfirmModal from "../components/ConfirmModal";

const initialForm = {
  productName: "",
  description: "",
  price: "",
  category: "",
  stock: "",
  imageUrl: "",
  featured: false,
};

function Products() {
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Image upload state
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [useUrlMode, setUseUrlMode] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  
  // Delete Modal state
  const [deleteId, setDeleteId] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Quick Stock Edit state
  const [quickEditStockId, setQuickEditStockId] = useState(null);
  const [quickStockValue, setQuickStockValue] = useState("");
  const [isQuickUpdating, setIsQuickUpdating] = useState(false);

  // Inventory Overview stats
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStockProducts: 0,
    outOfStockProducts: 0,
  });

  const fetchProducts = async (page = 1, searchQuery = search) => {
    try {
      const [prodRes, statsRes] = await Promise.all([
        api.get("/api/admin/products", {
          params: { page, limit: 10, search: searchQuery },
        }),
        api.get("/api/admin/stats").catch(() => null)
      ]);
      
      setProducts(prodRes.data.products);
      setPagination(prodRes.data.pagination);

      if (statsRes && statsRes.data?.success) {
        setStats(statsRes.data.stats);
      }
    } catch {
      toast.error("Failed to load products");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickStockSubmit = async (productId) => {
    const val = Number(quickStockValue);
    if (quickStockValue === "" || isNaN(val) || val < 0) {
      toast.error("Please enter a valid stock quantity");
      return;
    }
    setIsQuickUpdating(true);
    try {
      await api.put(`/api/admin/products/${productId}`, {
        stock: val,
      });
      toast.success("Stock updated successfully");
      setQuickEditStockId(null);
      fetchProducts(pagination.page, search);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update stock");
    } finally {
      setIsQuickUpdating(false);
    }
  };

  useEffect(() => {
    setTimeout(() => fetchProducts(1, ""), 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    setIsLoading(true);
    fetchProducts(1, search);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      setIsLoading(true);
      fetchProducts(newPage, search);
    }
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData(initialForm);
    setImageFile(null);
    setImagePreview("");
    setUseUrlMode(false);
    setIsModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditingId(product._id);
    setFormData({
      productName: product.productName,
      description: product.description,
      price: product.price,
      category: product.category,
      stock: product.stock,
      imageUrl: product.imageUrl || "",
      featured: product.featured || false,
    });
    setImageFile(null);
    // Show existing image as preview
    if (product.imageUrl) {
      const isLocalUpload = product.imageUrl.startsWith("/uploads/");
      setImagePreview(
        isLocalUpload
          ? `${import.meta.env.VITE_API_URL || "http://localhost:5000"}${product.imageUrl}`
          : product.imageUrl
      );
      setUseUrlMode(!isLocalUpload && product.imageUrl.startsWith("http"));
    } else {
      setImagePreview("");
      setUseUrlMode(false);
    }
    setIsModalOpen(true);
  };

  const handleFileSelect = (file) => {
    if (!file) return;
    // Validate type
    const allowed = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"];
    if (!allowed.includes(file.type)) {
      toast.error("Only image files (jpg, png, gif, webp, svg) are allowed");
      return;
    }
    // Validate size (5 MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5 MB");
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    // Clear URL mode value when a file is selected
    setFormData((prev) => ({ ...prev, imageUrl: "" }));
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Use FormData to support file upload
      const data = new FormData();
      data.append("productName", formData.productName);
      data.append("description", formData.description);
      data.append("price", formData.price);
      data.append("category", formData.category);
      data.append("stock", formData.stock);
      data.append("featured", formData.featured);

      if (imageFile) {
        data.append("image", imageFile);
      } else if (formData.imageUrl) {
        data.append("imageUrl", formData.imageUrl);
      }

      if (editingId) {
        await api.put(`/api/admin/products/${editingId}`, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Product updated successfully");
      } else {
        await api.post("/api/admin/products", data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Product created successfully");
      }
      setIsModalOpen(false);
      fetchProducts(pagination.page, search);
    } catch (error) {
      toast.error(error.response?.data?.message || "Operation failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/api/admin/products/${deleteId}`);
      toast.success("Product deleted successfully");
      setIsDeleteModalOpen(false);
      fetchProducts(pagination.page, search);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete product");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Products</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage your inventory and product details.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition hover:bg-slate-800"
        >
          <Plus className="h-4 w-4" />
          Add Product
        </button>
      </div>

      {/* Inventory Alerts & Overview */}
      <div className="grid gap-5 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Catalog Items</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900">{stats.totalProducts}</span>
            <span className="text-xs text-slate-500">Products</span>
          </div>
        </div>

        <div className="rounded-2xl border border-amber-100 bg-amber-50/30 p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-amber-500">Low Stock Alerts</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-amber-600">{stats.lowStockProducts}</span>
            <span className="text-xs text-amber-500">Items (1-5 stock)</span>
          </div>
          {stats.lowStockProducts > 0 && (
            <p className="mt-2 text-xs text-amber-700 font-medium">⚠️ Action required: Replenish stock soon.</p>
          )}
        </div>

        <div className="rounded-2xl border border-rose-100 bg-rose-50/30 p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-rose-500">Out of Stock Alerts</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-rose-600 animate-pulse">{stats.outOfStockProducts}</span>
            <span className="text-xs text-rose-500">Items (0 stock)</span>
          </div>
          {stats.outOfStockProducts > 0 && (
            <p className="mt-2 text-xs text-rose-700 font-medium">🚨 Customers cannot purchase these items!</p>
          )}
        </div>
      </div>

      {/* Search Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search products by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border-none bg-slate-50 py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button
            type="submit"
            className="rounded-xl bg-indigo-50 px-4 py-2.5 text-sm font-semibold text-indigo-600 transition hover:bg-indigo-100"
          >
            Search
          </button>
        </form>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full whitespace-nowrap text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-500">
              <tr>
                <th className="px-6 py-4 font-medium">Product</th>
                <th className="px-6 py-4 font-medium">Category</th>
                <th className="px-6 py-4 font-medium">Price</th>
                <th className="px-6 py-4 font-medium">Stock</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-slate-500">
                    Loading products...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-slate-500">
                    No products found.
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product._id} className="transition hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                          {product.imageUrl ? (
                            <img
                              src={resolveImageUrl(product.imageUrl)}
                              alt={product.productName}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <ImageIcon className="h-5 w-5 text-slate-400" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">
                            {product.productName}
                          </p>
                          {product.featured && (
                            <span className="mt-0.5 inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-600/20">
                              Featured
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{product.category}</td>
                    <td className="px-6 py-4 font-medium text-slate-900">
                      ₹{product.price.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      {quickEditStockId === product._id ? (
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            min="0"
                            className="w-16 rounded-lg border border-slate-200 px-2 py-1 text-xs focus:border-indigo-500 focus:outline-none"
                            value={quickStockValue}
                            onChange={(e) => setQuickStockValue(e.target.value)}
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={() => handleQuickStockSubmit(product._id)}
                            disabled={isQuickUpdating}
                            className="rounded-lg bg-emerald-600 p-1 text-white hover:bg-emerald-700 transition"
                            title="Save"
                          >
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            onClick={() => setQuickEditStockId(null)}
                            className="rounded-lg bg-slate-100 p-1 text-slate-500 hover:bg-slate-200 transition"
                            title="Cancel"
                          >
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 group">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border ${
                              product.stock <= 0
                                ? "bg-rose-50 border-rose-200 text-rose-700 animate-pulse"
                                : product.stock <= 5
                                ? "bg-amber-50 border-amber-200 text-amber-700 font-bold"
                                : "bg-emerald-50 border-emerald-200 text-emerald-700"
                            }`}
                          >
                            {product.stock <= 0
                              ? "Out of Stock"
                              : product.stock <= 5
                              ? `Low Stock (${product.stock})`
                              : `In Stock (${product.stock})`}
                          </span>
                          <button
                            onClick={() => {
                              setQuickEditStockId(product._id);
                              setQuickStockValue(product.stock);
                            }}
                            className="opacity-0 group-hover:opacity-100 transition rounded p-1 hover:bg-slate-100 text-slate-400 hover:text-slate-600"
                            title="Quick Edit Stock"
                          >
                            <Edit2 className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(product)}
                          className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-indigo-600"
                          title="Edit"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(product._id)}
                          className="rounded-lg p-1.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!isLoading && pagination.pages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-200 bg-white px-6 py-3">
            <p className="text-sm text-slate-500">
              Showing page <span className="font-medium text-slate-900">{pagination.page}</span> of{" "}
              <span className="font-medium text-slate-900">{pagination.pages}</span>
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm sm:p-0">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h3 className="text-lg font-semibold text-slate-900">
                {editingId ? "Edit Product" : "Add New Product"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Product Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.productName}
                    onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Description
                  </label>
                  <textarea
                    required
                    rows="3"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Price (₹)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Stock</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Category</label>
                  <input
                    type="text"
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <div className="mb-2 flex items-center justify-between">
                    <label className="block text-sm font-medium text-slate-700">
                      Product Image
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setUseUrlMode(!useUrlMode);
                        if (!useUrlMode) {
                          // Switching to URL mode — clear file
                          setImageFile(null);
                          setImagePreview("");
                          if (fileInputRef.current) fileInputRef.current.value = "";
                        } else {
                          // Switching to upload mode — clear URL
                          setFormData((prev) => ({ ...prev, imageUrl: "" }));
                        }
                      }}
                      className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 transition hover:text-indigo-800"
                    >
                      {useUrlMode ? (
                        <><Upload className="h-3 w-3" /> Upload file</>
                      ) : (
                        <><Link className="h-3 w-3" /> Use URL instead</>
                      )}
                    </button>
                  </div>

                  {useUrlMode ? (
                    /* ── URL Input Mode ── */
                    <div>
                      <input
                        type="url"
                        placeholder="https://example.com/image.jpg"
                        value={formData.imageUrl}
                        onChange={(e) => {
                          setFormData({ ...formData, imageUrl: e.target.value });
                          setImagePreview(e.target.value);
                        }}
                        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                      {imagePreview && (
                        <div className="relative mt-3 inline-block">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="h-24 w-24 rounded-lg border border-slate-200 object-cover"
                            onError={(e) => { e.target.style.display = "none"; }}
                          />
                        </div>
                      )}
                    </div>
                  ) : (
                    /* ── File Upload Mode ── */
                    <div>
                      {imagePreview ? (
                        /* Show preview with remove button */
                        <div className="relative inline-block">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="h-40 w-40 rounded-xl border border-slate-200 object-cover shadow-sm"
                          />
                          <button
                            type="button"
                            onClick={handleRemoveImage}
                            className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-rose-500 text-white shadow-md transition hover:bg-rose-600"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                          <p className="mt-1.5 text-xs text-slate-500">
                            {imageFile ? imageFile.name : "Current image"}
                          </p>
                        </div>
                      ) : (
                        /* Drop zone */
                        <div
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                          onDrop={handleDrop}
                          onClick={() => fileInputRef.current?.click()}
                          className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-8 transition ${
                            isDragging
                              ? "border-indigo-500 bg-indigo-50"
                              : "border-slate-300 bg-slate-50 hover:border-indigo-400 hover:bg-indigo-50/50"
                          }`}
                        >
                          <Upload className={`mb-2 h-8 w-8 ${isDragging ? "text-indigo-500" : "text-slate-400"}`} />
                          <p className="text-sm font-medium text-slate-600">
                            {isDragging ? "Drop image here" : "Click to upload or drag & drop"}
                          </p>
                          <p className="mt-1 text-xs text-slate-400">
                            JPG, PNG, GIF, WebP or SVG (max 5 MB)
                          </p>
                        </div>
                      )}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
                        onChange={(e) => handleFileSelect(e.target.files?.[0])}
                        className="hidden"
                      />
                    </div>
                  )}
                </div>

                <div className="sm:col-span-2 flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600"
                  />
                  <label htmlFor="featured" className="text-sm font-medium text-slate-700">
                    Featured Product (Show on homepage)
                  </label>
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-3 border-t border-slate-100 pt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition hover:bg-slate-800 disabled:opacity-70"
                >
                  {isSubmitting ? "Saving..." : "Save Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        open={isDeleteModalOpen}
        title="Delete Product"
        message="Are you sure you want to delete this product? This action cannot be undone."
        danger={true}
        onConfirm={confirmDelete}
        onCancel={() => setIsDeleteModalOpen(false)}
      />
    </div>
  );
}

export default Products;
