import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiEye } from "react-icons/fi";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useProfile } from "../context/ProfileContext";
import { resolveImageUrl } from "../utils/imageUrl";
import CancelOrderModal from "../components/CancelOrderModal";
import api from "../utils/api";
import { useSocket } from "../context/SocketContext";

function Orders() {
  const { orders, setOrders, loadOrders } = useProfile();
  const socket = useSocket();
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [activeOrderId, setActiveOrderId] = useState(null);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  // Socket: listen for real-time order events
  useEffect(() => {
    if (!socket) return;

    const handleOrderCreated = (newOrder) => {
      setOrders((prev) => [newOrder, ...prev]);
    };

    const handleOrderStatusUpdated = (data) => {
      setOrders((prev) =>
        prev.map((o) =>
          String(o._id) === String(data.orderId)
            ? { ...o, orderStatus: data.orderStatus, paymentStatus: data.paymentStatus || o.paymentStatus }
            : o
        )
      );
    };

    const handleOrderCancelled = (data) => {
      setOrders((prev) =>
        prev.map((o) =>
          String(o._id) === String(data.orderId)
            ? { ...o, orderStatus: "Cancelled" }
            : o
        )
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
  }, [socket, setOrders]);

  const handleOpenCancel = (orderId) => {
    setActiveOrderId(orderId);
    setIsCancelModalOpen(true);
  };

  const handleCancel = async (reason) => {
    if (!activeOrderId) return;

    setIsCancelling(true);
    try {
      const response = await api.put(`/api/orders/${activeOrderId}/cancel`, { reason });
      if (response.data.success) {
        toast.success("Order cancelled successfully");
        await loadOrders();
        setIsCancelModalOpen(false);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to cancel order");
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-100 via-white to-slate-200 text-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-white">
      <Navbar />

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 pt-36 pb-12 md:pt-28">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">My Orders</h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Track your recent purchases and delivery status.
          </p>
        </div>

        {orders.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 dark:bg-slate-900 p-10 text-center text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-400">
            No orders yet. Your purchases will appear here.
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order, index) => {
              const paymentLabel =
                order.paymentMethod === "Cash on Delivery" ? "COD" : order.paymentStatus;

              return (
                <div
                  key={`${order._id || index}`}
                  className="rounded-3xl border border-slate-100 bg-white p-6 shadow-md dark:border-white/10 dark:bg-slate-900"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                      Order #{order._id.slice(-8).toUpperCase()}
                    </p>
                    <h2 className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">
                      ₹{order.totalAmount?.toLocaleString() || 0}
                    </h2>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleDateString()
                        : "-"}
                    </p>
                    <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                      Method: <span className="font-semibold text-slate-700 dark:text-slate-300 dark:text-slate-200">{order.paymentMethod}</span>
                      {order.razorpayPaymentId && (
                        <span className="ml-2 text-slate-400">Txn: {order.razorpayPaymentId.slice(-10)}</span>
                      )}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs sm:gap-3 sm:text-sm">
                    <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 font-semibold text-slate-700 dark:text-slate-300 dark:text-slate-200" title="Payment Status">
                      Payment: {paymentLabel}
                    </span>
                    <span className={`rounded-full px-3 py-1 font-semibold ${
                      order.orderStatus === "Delivered" ? "bg-emerald-100 text-emerald-700" :
                      order.orderStatus === "Cancelled" ? "bg-rose-100 text-rose-700" :
                      "bg-indigo-100 text-indigo-700"
                    }`} title="Order Status">
                      {order.orderStatus}
                    </span>
                    {order.orderStatus !== "Cancelled" && (
                      order.paymentMethod === "Cash on Delivery" &&
                      ["Pending", "Confirmed"].includes(order.orderStatus) &&
                      order.paymentStatus !== "Paid" ? (
                        <button
                          type="button"
                          onClick={() => handleOpenCancel(order._id)}
                          className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1 font-semibold text-rose-600 transition hover:bg-rose-100"
                        >
                          Cancel Order
                        </button>
                      ) : (
                        <span
                          className="rounded-full border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900 px-3 py-1 font-semibold text-slate-400"
                          title={
                            order.paymentMethod !== "Cash on Delivery" || order.paymentStatus === "Paid"
                              ? "Paid orders cannot be cancelled online"
                              : "This order can no longer be cancelled"
                          }
                        >
                          Cancel Disabled
                        </span>
                      )
                    )}
                    <Link
                      to={`/orders/${order._id}`}
                      className="ml-2 flex items-center gap-1 rounded-full border border-slate-200 dark:border-white/10 px-3 py-1 font-semibold text-slate-700 dark:text-slate-300 transition hover:bg-slate-50 dark:hover:bg-white/5"
                    >
                      <FiEye className="h-4 w-4" /> Details
                    </Link>
                  </div>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  {order.items.map((item) => (
                    <div
                      key={item.product?._id || item._id}
                      className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50 dark:bg-slate-900 p-4 dark:bg-white/5"
                    >
                      <div className="h-16 w-16 rounded-xl bg-white dark:bg-slate-950">
                        {item.product?.imageUrl && (
                          <img
                            src={resolveImageUrl(item.product.imageUrl)}
                            alt={item.product.productName}
                            className="h-full w-full rounded-xl object-contain"
                          />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">
                          {item.product?.productName || "Product"}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Qty: {item.quantity}
                        </p>
                        <p className="text-sm font-semibold text-blue-600">
                          ₹{item.price}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />

      <CancelOrderModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirm={handleCancel}
        isSubmitting={isCancelling}
      />
    </div>
  );
}

export default Orders;
