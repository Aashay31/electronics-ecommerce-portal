import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Search, Package, User } from "lucide-react";
import api from "../../utils/api";
import { resolveImageUrl } from "../../utils/imageUrl";
import { useSocket } from "../../context/SocketContext";

const statusColors = {
  Pending: "bg-[var(--admin-warning-bg)] text-[var(--admin-warning)] border border-[#FDE68A]",
  Processing: "bg-[var(--admin-warning-bg)] text-[var(--admin-warning)] border border-[#FDE68A]",
  Shipped: "bg-[var(--admin-info-bg)] text-[var(--admin-info)] border border-[#A5F3FC]",
  Delivered: "bg-[var(--admin-success-bg)] text-[var(--admin-success)] border border-[#BBF7D0]",
  Cancelled: "bg-[var(--admin-danger-bg)] text-[var(--admin-danger)] border border-[#FECACA]",
};

function Orders() {
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const socket = useSocket();

  useEffect(() => {
    if (!socket) return;

    const handleOrderCreated = (newOrder) => {
      setOrders((prevOrders) => {
        // Avoid duplicates just in case
        if (prevOrders.some((o) => o._id === newOrder._id)) {
          return prevOrders;
        }
        return [newOrder, ...prevOrders];
      });
    };

    const handleOrderStatusUpdated = (data) => {
      setOrders((prevOrders) =>
        prevOrders.map((order) => {
          if (order._id === data.orderId) {
            return {
              ...order,
              deliveryStatus: data.orderStatus,
              paymentStatus: data.paymentStatus,
            };
          }
          return order;
        })
      );
    };

    const handleOrderCancelled = (data) => {
      setOrders((prevOrders) =>
        prevOrders.map((order) => {
          if (order._id === data.orderId) {
            return {
              ...order,
              deliveryStatus: "Cancelled",
            };
          }
          return order;
        })
      );
    };

    socket.on("order:created", handleOrderCreated);
    socket.on("order:statusUpdated", handleOrderStatusUpdated);
    socket.on("order:cancelled", handleOrderCancelled);

    return () => {
      socket.off("order:created", handleOrderCreated);
      socket.off("order:statusUpdated", handleOrderStatusUpdated);
      socket.off("order:cancelled", handleOrderCancelled);
    };
  }, [socket]);

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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between">
        <div>
          <h1 className="text-[20px] font-semibold text-[var(--admin-text-primary)] tracking-[-0.01em]">Orders</h1>
          <p className="mt-1 text-[13px] text-[var(--admin-text-secondary)]">
            Manage customer orders and fulfillments.
          </p>
        </div>
        <div className="flex w-max items-center gap-2 rounded-full border border-[#BBF7D0] bg-[var(--admin-success-bg)] px-[12px] py-[6px] shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--admin-success)] opacity-75"></span>
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[var(--admin-success)]"></span>
          </span>
          <span className="text-[12px] font-semibold uppercase tracking-[0.05em] text-[var(--admin-success)]">Live Updates</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-[12px] rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface)] px-[16px] py-[14px] shadow-[0_1px_2px_rgba(0,0,0,0.04)] sm:flex-row sm:items-center">
        <form onSubmit={handleSearch} className="flex flex-1 items-center gap-[12px]">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--admin-text-muted)]" />
            <input
              type="text"
              placeholder="Search by customer name or email..."
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
        <select
          value={statusFilter}
          onChange={handleFilterChange}
          className="rounded-md border border-[var(--admin-border-strong)] bg-[var(--admin-surface)] py-[8px] pl-3 pr-8 text-[14px] text-[var(--admin-text-primary)] outline-none focus:border-[var(--admin-accent)] focus:shadow-[0_0_0_3px_rgba(37,99,235,0.12)] sm:w-48"
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
          <div className="rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface)] p-[32px] text-center text-[14px] text-[var(--admin-text-secondary)]">
            Loading orders...
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface)] p-[32px] text-center text-[14px] text-[var(--admin-text-secondary)]">
            No orders found matching your criteria.
          </div>
        ) : (
          orders.map((order) => {
            const paymentLabel =
              order.paymentMethod === "Cash on Delivery" ? "COD" : order.paymentStatus || "-";

            return (
              <div
                key={order._id}
                className="overflow-hidden rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface)] shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition hover:shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-1px_rgba(0,0,0,0.06)]"
              >
              {/* Order Header */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--admin-border)] bg-[var(--admin-surface-2)] p-[20px]">
                <div className="flex flex-wrap items-center gap-[24px]">
                  <div>
                    <p className="text-[12px] font-semibold uppercase tracking-[0.05em] text-[var(--admin-text-secondary)]">Order ID</p>
                    <p className="font-mono text-[14px] font-semibold text-[var(--admin-text-primary)]">
                      #{order._id.slice(-8)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[12px] font-semibold uppercase tracking-[0.05em] text-[var(--admin-text-secondary)]">Date</p>
                    <p className="text-[14px] font-semibold text-[var(--admin-text-primary)]">
                      {new Date(order.orderedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-[12px] font-semibold uppercase tracking-[0.05em] text-[var(--admin-text-secondary)]">Total Amount</p>
                    <p className="text-[14px] font-semibold text-[var(--admin-text-primary)]">
                      ₹{order.total.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <select
                    value={order.deliveryStatus}
                    onChange={(e) => handleStatusUpdate(order.userId, order._id, e.target.value)}
                    className={`rounded-full px-[10px] py-[3px] text-[12px] font-medium outline-none cursor-pointer ${
                      statusColors[order.deliveryStatus] || statusColors.Pending
                    } focus:ring-2`}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                  <button
                    onClick={() => setExpandedOrderId(expandedOrderId === order._id ? null : order._id)}
                    className="text-[14px] font-medium text-[var(--admin-accent)] hover:text-[var(--admin-accent-hover)] transition"
                  >
                    {expandedOrderId === order._id ? "Hide Details" : "View Details"}
                  </button>
                </div>
              </div>

              {/* Order Details (Expanded) */}
              {expandedOrderId === order._id && (
                <div className="grid gap-[24px] p-[20px] md:grid-cols-2 lg:grid-cols-3">
                  <div className="space-y-[12px] rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface)] p-[16px]">
                    <div className="flex items-center gap-2 text-[14px] font-semibold text-[var(--admin-text-primary)]">
                      <Package className="h-4 w-4 text-[var(--admin-text-secondary)]" />
                      Payment Details
                    </div>
                    <div className="text-[13px] text-[var(--admin-text-secondary)] space-y-[4px]">
                      <p>
                        <span className="font-medium text-[var(--admin-text-primary)]">Method:</span> {order.paymentMethod || "-"}
                      </p>
                      <p>
                        <span className="font-medium text-[var(--admin-text-primary)]">Status:</span> {paymentLabel}
                      </p>
                      {order.transactionId && (
                        <p>
                          <span className="font-medium text-[var(--admin-text-primary)]">Transaction:</span> {order.transactionId}
                        </p>
                      )}
                      {order.cancellationReason && (
                        <p>
                          <span className="font-medium text-[var(--admin-text-primary)]">Cancel Reason:</span> {order.cancellationReason}
                        </p>
                      )}
                    </div>
                  </div>
                  {/* Customer Info */}
                  <div className="space-y-[12px] rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface)] p-[16px]">
                    <div className="flex items-center gap-2 text-[14px] font-semibold text-[var(--admin-text-primary)]">
                      <User className="h-4 w-4 text-[var(--admin-text-secondary)]" />
                      Customer Details
                    </div>
                    <div className="text-[13px] text-[var(--admin-text-secondary)] space-y-[4px]">
                      <p className="font-medium text-[var(--admin-text-primary)]">{order.customerName}</p>
                      <p>{order.customerEmail}</p>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="space-y-[12px] rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface)] p-[16px] lg:col-span-2">
                    <div className="flex items-center gap-2 text-[14px] font-semibold text-[var(--admin-text-primary)]">
                      <Package className="h-4 w-4 text-[var(--admin-text-secondary)]" />
                      Ordered Items
                    </div>
                    <div className="divide-y divide-[var(--admin-border)]">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between py-[8px] text-[14px]">
                          <div className="flex items-center gap-3">
                            <img
                              src={resolveImageUrl(item.product?.imageUrl)}
                              alt={item.product?.productName}
                              className="h-10 w-10 rounded border border-[var(--admin-border)] object-cover shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
                            />
                            <div>
                              <p className="font-medium text-[var(--admin-text-primary)]">
                                {item.product?.productName || "Unknown Product"}
                              </p>
                              <p className="text-[12px] text-[var(--admin-text-secondary)]">Qty: {item.quantity}</p>
                            </div>
                          </div>
                          <p className="font-semibold text-[var(--admin-text-primary)]">
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
        <div className="flex items-center justify-between rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface)] px-[24px] py-[12px] shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
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
  );
}

export default Orders;
