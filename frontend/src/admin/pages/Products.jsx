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
          <h1 className="text-[20px] font-semibold text-[var(--admin-text-primary)] tracking-[-0.01em]">Products</h1>
          <p className="mt-1 text-[13px] text-[var(--admin-text-secondary)]">
            Manage your inventory and product details.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-[var(--admin-accent)] px-[18px] py-[8px] text-[14px] font-medium text-white transition hover:bg-[var(--admin-accent-hover)] border-none"
        >
          <Plus className="h-4 w-4" />
          Add Product
        </button>
      </div>

      {/* Inventory Alerts & Overview */}
      <div className="grid gap-5 sm:grid-cols-3">
        <div className="rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface)] px-[24px] py-[20px] shadow-[0_1px_2px_rgba(0,0,0,0.04)] border-t-[3px] border-t-[var(--admin-accent)]">
          <p className="text-[12px] font-medium uppercase tracking-[0.05em] text-[var(--admin-text-secondary)]">Total Catalog Items</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-[28px] font-bold text-[var(--admin-text-primary)]">{stats.totalProducts}</span>
            <span className="text-[13px] text-[var(--admin-text-secondary)]">Products</span>
          </div>
        </div>

        <div className="rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface)] px-[24px] py-[20px] shadow-[0_1px_2px_rgba(0,0,0,0.04)] border-t-[3px] border-t-[var(--admin-warning)]">
          <p className="text-[12px] font-medium uppercase tracking-[0.05em] text-[var(--admin-text-secondary)]">Low Stock Alerts</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-[28px] font-bold text-[var(--admin-text-primary)]">{stats.lowStockProducts}</span>
            <span className="text-[13px] text-[var(--admin-text-secondary)]">Items (1-5 stock)</span>
          </div>
          {stats.lowStockProducts > 0 && (
            <p className="mt-2 text-[13px] font-medium text-[var(--admin-warning)]">⚠️ Action required: Replenish stock soon.</p>
          )}
        </div>

        <div className="rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface)] px-[24px] py-[20px] shadow-[0_1px_2px_rgba(0,0,0,0.04)] border-t-[3px] border-t-[var(--admin-danger)]">
          <p className="text-[12px] font-medium uppercase tracking-[0.05em] text-[var(--admin-text-secondary)]">Out of Stock Alerts</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-[28px] font-bold text-[var(--admin-text-primary)]">{stats.outOfStockProducts}</span>
            <span className="text-[13px] text-[var(--admin-text-secondary)]">Items (0 stock)</span>
          </div>
          {stats.outOfStockProducts > 0 && (
            <p className="mt-2 text-[13px] font-medium text-[var(--admin-danger)]">🚨 Customers cannot purchase these items!</p>
          )}
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-[12px] rounded-t-lg border border-b-0 border-[var(--admin-border)] bg-[var(--admin-surface)] px-[16px] py-[14px]">
        <form onSubmit={handleSearch} className="flex w-full items-center gap-[12px]">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--admin-text-muted)]" />
            <input
              type="text"
              placeholder="Search products by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-md border border-[var(--admin-border)] bg-[var(--admin-surface-2)] py-[8px] pl-10 pr-3 text-[14px] text-[var(--admin-text-primary)] placeholder-[var(--admin-text-muted)] outline-none focus:border-[var(--admin-accent)] focus:shadow-[0_0_0_3px_rgba(37,99,235,0.12)]"
            />
          </div>
          <button
            type="submit"
            className="rounded-md border border-[var(--admin-border-strong)] bg-[var(--admin-surface)] px-[18px] py-[8px] text-[14px] font-medium text-[var(--admin-text-primary)] transition hover:bg-[var(--admin-surface-2)]"
          >
            Search
          </button>
        </form>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-b-lg border border-[var(--admin-border)] bg-[var(--admin-surface)]">
        <div className="overflow-x-auto">
          <table className="w-full whitespace-nowrap text-left">
            <thead className="border-b-2 border-[var(--admin-border-strong)] bg-[var(--admin-surface-2)]">
              <tr>
                <th className="px-[16px] py-[12px] text-[12px] font-semibold uppercase tracking-[0.05em] text-[var(--admin-text-secondary)]">Product</th>
                <th className="px-[16px] py-[12px] text-[12px] font-semibold uppercase tracking-[0.05em] text-[var(--admin-text-secondary)]">Category</th>
                <th className="px-[16px] py-[12px] text-[12px] font-semibold uppercase tracking-[0.05em] text-[var(--admin-text-secondary)]">Price</th>
                <th className="px-[16px] py-[12px] text-[12px] font-semibold uppercase tracking-[0.05em] text-[var(--admin-text-secondary)]">Stock</th>
                <th className="px-[16px] py-[12px] text-[12px] font-semibold uppercase tracking-[0.05em] text-[var(--admin-text-secondary)] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--admin-border)]">
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="px-[16px] py-[14px] text-center text-[14px] text-[var(--admin-text-secondary)]">
                    Loading products...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-[16px] py-[14px] text-center text-[14px] text-[var(--admin-text-secondary)]">
                    No products found.
                  </td>
                </tr>
              ) : (
                products.map((product, idx) => (
                  <tr key={product._id} className={`cursor-pointer transition hover:bg-[var(--admin-accent-light)] ${idx % 2 === 0 ? "bg-[var(--admin-surface)]" : "bg-[#FAFBFC]"}`}>
                    <td className="px-[16px] py-[14px]">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface-2)]">
                          {product.imageUrl ? (
                            <img
                              src={resolveImageUrl(product.imageUrl)}
                              alt={product.productName}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <ImageIcon className="h-5 w-5 text-[var(--admin-text-muted)]" />
                          )}
                        </div>
                        <div>
                          <p className="text-[14px] text-[var(--admin-text-primary)]">
                            {product.productName}
                          </p>
                          {product.featured && (
                            <span className="mt-0.5 inline-flex items-center rounded-full bg-[var(--admin-info-bg)] px-[10px] py-[3px] text-[12px] font-medium text-[var(--admin-info)] border border-[#A5F3FC]">
                              Featured
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-[16px] py-[14px] text-[14px] text-[var(--admin-text-primary)]">{product.category}</td>
                    <td className="px-[16px] py-[14px] text-[14px] text-[var(--admin-text-primary)]">
                      ₹{product.price.toLocaleString()}
                    </td>
                    <td className="px-[16px] py-[14px]">
                      {quickEditStockId === product._id ? (
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            min="0"
                            className="w-16 rounded-md border border-[var(--admin-border)] px-2 py-1 text-[13px] focus:border-[var(--admin-accent)] focus:outline-none"
                            value={quickStockValue}
                            onChange={(e) => setQuickStockValue(e.target.value)}
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={() => handleQuickStockSubmit(product._id)}
                            disabled={isQuickUpdating}
                            className="rounded-md bg-[var(--admin-success)] p-1 text-white hover:opacity-90 transition"
                            title="Save"
                          >
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            onClick={() => setQuickEditStockId(null)}
                            className="rounded-md bg-[var(--admin-surface)] border border-[var(--admin-border)] p-1 text-[var(--admin-text-secondary)] hover:bg-[var(--admin-surface-2)] transition"
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
                            className={`inline-flex items-center rounded-full px-[10px] py-[3px] text-[12px] font-medium border ${
                              product.stock <= 0
                                ? "bg-[var(--admin-danger-bg)] border-[#FECACA] text-[var(--admin-danger)]"
                                : product.stock <= 5
                                ? "bg-[var(--admin-warning-bg)] border-[#FDE68A] text-[var(--admin-warning)] font-bold"
                                : "bg-[var(--admin-success-bg)] border-[#BBF7D0] text-[var(--admin-success)]"
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
                            className="opacity-0 group-hover:opacity-100 transition rounded p-1 hover:bg-[var(--admin-surface-2)] text-[var(--admin-text-secondary)]"
                            title="Quick Edit Stock"
                          >
                            <Edit2 className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="px-[16px] py-[14px] text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(product)}
                          className="rounded-md p-[7px] text-[var(--admin-text-secondary)] transition hover:bg-[var(--admin-surface-2)] hover:text-[var(--admin-accent)] border border-transparent hover:border-[var(--admin-border)]"
                          title="Edit"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(product._id)}
                          className="rounded-md p-[7px] text-[var(--admin-text-secondary)] transition hover:bg-[var(--admin-danger-bg)] hover:text-[var(--admin-danger)] border border-transparent hover:border-[#FECACA]"
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
          <div className="flex items-center justify-between border-t border-[var(--admin-border)] bg-[var(--admin-surface)] px-[24px] py-[12px]">
            <p className="text-[13px] text-[var(--admin-text-secondary)]">
              Showing page <span className="font-medium text-[var(--admin-text-primary)]">{pagination.page}</span> of{" "}
              <span className="font-medium text-[var(--admin-text-primary)]">{pagination.pages}</span>
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="rounded-md border border-[var(--admin-border-strong)] bg-[var(--admin-surface)] px-[12px] py-[6px] text-[13px] font-medium text-[var(--admin-text-primary)] transition hover:bg-[var(--admin-surface-2)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
                className="rounded-md border border-[var(--admin-border-strong)] bg-[var(--admin-surface)] px-[12px] py-[6px] text-[13px] font-medium text-[var(--admin-text-primary)] transition hover:bg-[var(--admin-surface-2)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 sm:p-0">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-[var(--admin-surface)] shadow-[0_1px_2px_rgba(0,0,0,0.04)] border border-[var(--admin-border)]">
            <div className="flex items-center justify-between border-b border-[var(--admin-border)] px-[24px] py-[16px]">
              <h3 className="text-[20px] font-semibold text-[var(--admin-text-primary)] tracking-[-0.01em]">
                {editingId ? "Edit Product" : "Add New Product"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-md p-[7px] text-[var(--admin-text-secondary)] bg-transparent border border-[var(--admin-border)] transition hover:bg-[var(--admin-surface-2)] hover:border-[var(--admin-border-strong)]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-[24px]">
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-[6px] block text-[13px] font-medium text-[var(--admin-text-secondary)]">
                    Product Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.productName}
                    onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                    className="w-full rounded-md border border-[var(--admin-border-strong)] bg-[var(--admin-surface)] px-[12px] py-[8px] text-[14px] text-[var(--admin-text-primary)] outline-none focus:border-[var(--admin-accent)] focus:shadow-[0_0_0_3px_rgba(37,99,235,0.12)] placeholder-[var(--admin-text-muted)]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-[6px] block text-[13px] font-medium text-[var(--admin-text-secondary)]">
                    Description
                  </label>
                  <textarea
                    required
                    rows="3"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full rounded-md border border-[var(--admin-border-strong)] bg-[var(--admin-surface)] px-[12px] py-[8px] text-[14px] text-[var(--admin-text-primary)] outline-none focus:border-[var(--admin-accent)] focus:shadow-[0_0_0_3px_rgba(37,99,235,0.12)] placeholder-[var(--admin-text-muted)]"
                  />
                </div>

                <div>
                  <label className="mb-[6px] block text-[13px] font-medium text-[var(--admin-text-secondary)]">Price (₹)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full rounded-md border border-[var(--admin-border-strong)] bg-[var(--admin-surface)] px-[12px] py-[8px] text-[14px] text-[var(--admin-text-primary)] outline-none focus:border-[var(--admin-accent)] focus:shadow-[0_0_0_3px_rgba(37,99,235,0.12)] placeholder-[var(--admin-text-muted)]"
                  />
                </div>

                <div>
                  <label className="mb-[6px] block text-[13px] font-medium text-[var(--admin-text-secondary)]">Stock</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full rounded-md border border-[var(--admin-border-strong)] bg-[var(--admin-surface)] px-[12px] py-[8px] text-[14px] text-[var(--admin-text-primary)] outline-none focus:border-[var(--admin-accent)] focus:shadow-[0_0_0_3px_rgba(37,99,235,0.12)] placeholder-[var(--admin-text-muted)]"
                  />
                </div>

                <div>
                  <label className="mb-[6px] block text-[13px] font-medium text-[var(--admin-text-secondary)]">Category</label>
                  <input
                    type="text"
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full rounded-md border border-[var(--admin-border-strong)] bg-[var(--admin-surface)] px-[12px] py-[8px] text-[14px] text-[var(--admin-text-primary)] outline-none focus:border-[var(--admin-accent)] focus:shadow-[0_0_0_3px_rgba(37,99,235,0.12)] placeholder-[var(--admin-text-muted)]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <div className="mb-[6px] flex items-center justify-between">
                    <label className="block text-[13px] font-medium text-[var(--admin-text-secondary)]">
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
                      className="inline-flex items-center gap-1 text-[13px] font-medium text-[var(--admin-accent)] transition hover:text-[var(--admin-accent-hover)]"
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
                        className="w-full rounded-md border border-[var(--admin-border-strong)] bg-[var(--admin-surface)] px-[12px] py-[8px] text-[14px] text-[var(--admin-text-primary)] outline-none focus:border-[var(--admin-accent)] focus:shadow-[0_0_0_3px_rgba(37,99,235,0.12)] placeholder-[var(--admin-text-muted)]"
                      />
                      {imagePreview && (
                        <div className="relative mt-3 inline-block">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="h-24 w-24 rounded-lg border border-[var(--admin-border)] object-cover"
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
                            className="h-40 w-40 rounded-lg border border-[var(--admin-border)] object-cover shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
                          />
                          <button
                            type="button"
                            onClick={handleRemoveImage}
                            className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-[var(--admin-danger)] text-white shadow-md transition hover:bg-[#B91C1C]"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                          <p className="mt-1.5 text-[13px] text-[var(--admin-text-secondary)]">
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
                          className={`flex cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed px-6 py-8 transition ${
                            isDragging
                              ? "border-[var(--admin-accent)] bg-[var(--admin-accent-light)]"
                              : "border-[var(--admin-border-strong)] bg-[var(--admin-surface)] hover:border-[var(--admin-accent)] hover:bg-[var(--admin-surface-2)]"
                          }`}
                        >
                          <Upload className={`mb-2 h-8 w-8 ${isDragging ? "text-[var(--admin-accent)]" : "text-[var(--admin-text-muted)]"}`} />
                          <p className="text-[14px] font-medium text-[var(--admin-text-secondary)]">
                            {isDragging ? "Drop image here" : "Click to upload or drag & drop"}
                          </p>
                          <p className="mt-1 text-[13px] text-[var(--admin-text-muted)]">
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
                    className="h-4 w-4 rounded border-[var(--admin-border-strong)] text-[var(--admin-accent)] focus:ring-[var(--admin-accent)]"
                  />
                  <label htmlFor="featured" className="text-[13px] font-medium text-[var(--admin-text-secondary)]">
                    Featured Product (Show on homepage)
                  </label>
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-3 border-t border-[var(--admin-border)] pt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-md bg-[var(--admin-surface)] text-[var(--admin-text-primary)] border border-[var(--admin-border-strong)] text-[14px] font-medium px-[18px] py-[8px] transition hover:bg-[var(--admin-surface-2)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-md bg-[var(--admin-accent)] px-[18px] py-[8px] text-[14px] font-medium text-white transition hover:bg-[var(--admin-accent-hover)] disabled:opacity-70 border-none"
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
