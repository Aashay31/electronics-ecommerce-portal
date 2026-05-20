import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Search, Package, User } from "lucide-react";
import api from "../../utils/api";
import { resolveImageUrl } from "../../utils/imageUrl";

const statusColors = {
  Pending: "bg-amber-50 text-amber-700 ring-amber-600/20",
  Processing: "bg-blue-50 text-blue-700 ring-blue-600/20",
  Shipped: "bg-indigo-50 text-indigo-700 ring-indigo-600/20",
  Delivered: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  Cancelled: "bg-rose-50 text-rose-700 ring-rose-600/20",
};

function Orders() {
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  const fetchOrders = async (page = 1, searchQuery = search, status = statusFilter) => {
    try {
      const response = await api.get("/api/admin/orders", {
        params: { page, limit: 10, search: searchQuery, status },
      });
      setOrders(response.data.orders);
      setPagination(response.data.pagination);
    } catch {
      toast.error("Failed to load orders");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setTimeout(() => fetchOrders(1, "", ""), 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    setIsLoading(true);
    fetchOrders(1, search, statusFilter);
  };

  const handleFilterChange = (e) => {
    const newStatus = e.target.value;
    setStatusFilter(newStatus);
    setIsLoading(true);
    fetchOrders(1, search, newStatus);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      setIsLoading(true);
      fetchOrders(newPage, search, statusFilter);
    }
  };

  const handleStatusUpdate = async (userId, orderId, newStatus) => {
    try {
      await api.put(`/api/admin/orders/${userId}/${orderId}`, {
        deliveryStatus: newStatus,
        status: newStatus === "Delivered" ? "Completed" : "Processing"
      });
      toast.success("Order status updated");
      fetchOrders(pagination.page, search, statusFilter);
    } catch {
      toast.error("Failed to update status");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Orders</h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage customer orders and fulfillments.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm sm:flex-row">
        <form onSubmit={handleSearch} className="flex flex-1 items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by customer name or email..."
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
        <select
          value={statusFilter}
          onChange={handleFilterChange}
          className="rounded-xl border-none bg-slate-50 py-2.5 pl-4 pr-10 text-sm focus:ring-2 focus:ring-indigo-500 sm:w-48"
        >
          <option value="">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="Processing">Processing</option>
          <option value="Shipped">Shipped</option>
          <option value="Delivered">Delivered</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">
            Loading orders...
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">
            No orders found matching your criteria.
          </div>
        ) : (
          orders.map((order) => {
            const paymentLabel =
              order.paymentMethod === "Cash on Delivery" ? "COD" : order.paymentStatus || "-";

            return (
              <div
                key={order._id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
              >
              {/* Order Header */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 bg-slate-50/50 p-5">
                <div className="flex flex-wrap items-center gap-6">
                  <div>
                    <p className="text-xs font-medium text-slate-500">Order ID</p>
                    <p className="font-mono text-sm font-semibold text-slate-900">
                      #{order._id.slice(-8)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500">Date</p>
                    <p className="text-sm font-semibold text-slate-900">
                      {new Date(order.orderedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500">Total Amount</p>
                    <p className="text-sm font-semibold text-slate-900">
                      ₹{order.total.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <select
                    value={order.deliveryStatus}
                    onChange={(e) => handleStatusUpdate(order.userId, order._id, e.target.value)}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ring-inset ${
                      statusColors[order.deliveryStatus] || statusColors.Pending
                    } border-none focus:ring-2`}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                  <button
                    onClick={() => setExpandedOrderId(expandedOrderId === order._id ? null : order._id)}
                    className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
                  >
                    {expandedOrderId === order._id ? "Hide Details" : "View Details"}
                  </button>
                </div>
              </div>

              {/* Order Details (Expanded) */}
              {expandedOrderId === order._id && (
                <div className="grid gap-6 p-5 md:grid-cols-2 lg:grid-cols-3">
                  <div className="space-y-3 rounded-xl border border-slate-100 bg-slate-50 p-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                      <Package className="h-4 w-4 text-slate-400" />
                      Payment Details
                    </div>
                    <div className="text-sm text-slate-600">
                      <p>
                        <span className="font-medium text-slate-900">Method:</span> {order.paymentMethod || "-"}
                      </p>
                      <p>
                        <span className="font-medium text-slate-900">Status:</span> {paymentLabel}
                      </p>
                      {order.transactionId && (
                        <p>
                          <span className="font-medium text-slate-900">Transaction:</span> {order.transactionId}
                        </p>
                      )}
                      {order.cancellationReason && (
                        <p>
                          <span className="font-medium text-slate-900">Cancel Reason:</span> {order.cancellationReason}
                        </p>
                      )}
                    </div>
                  </div>
                  {/* Customer Info */}
                  <div className="space-y-3 rounded-xl border border-slate-100 bg-slate-50 p-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                      <User className="h-4 w-4 text-slate-400" />
                      Customer Details
                    </div>
                    <div className="text-sm text-slate-600">
                      <p className="font-medium text-slate-900">{order.customerName}</p>
                      <p>{order.customerEmail}</p>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="space-y-3 rounded-xl border border-slate-100 bg-slate-50 p-4 lg:col-span-2">
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                      <Package className="h-4 w-4 text-slate-400" />
                      Ordered Items
                    </div>
                    <div className="divide-y divide-slate-200">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between py-2 text-sm">
                          <div className="flex items-center gap-3">
                            <img
                              src={resolveImageUrl(item.product?.imageUrl)}
                              alt={item.product?.productName}
                              className="h-10 w-10 rounded bg-white object-cover shadow-sm"
                            />
                            <div>
                              <p className="font-medium text-slate-900">
                                {item.product?.productName || "Unknown Product"}
                              </p>
                              <p className="text-xs text-slate-500">Qty: {item.quantity}</p>
                            </div>
                          </div>
                          <p className="font-semibold text-slate-900">
                            ₹{(item.price * item.quantity).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {!isLoading && pagination.pages > 1 && (
        <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-6 py-3 shadow-sm">
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
  );
}

export default Orders;
