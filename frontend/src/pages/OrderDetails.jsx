import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiMapPin, FiCreditCard, FiPackage, FiTruck, FiXCircle, FiCheckCircle } from "react-icons/fi";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import CancelOrderModal from "../components/CancelOrderModal";
import api from "../utils/api";
import { resolveImageUrl } from "../utils/imageUrl";
import { useSocket } from "../context/SocketContext";

const statusSteps = ["Pending", "Confirmed", "Processing", "Shipped", "Delivered"];

function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const socket = useSocket();
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  useEffect(() => {
    let active = true;

    const fetchOrder = async () => {
      try {
        const response = await api.get(`/api/orders/${id}`);
        if (active) {
          setOrder(response.data.order);
        }
      } catch {
        if (active) {
          toast.error("Failed to load order details");
          setTimeout(() => navigate("/orders"), 0);
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    if (id) {
      setTimeout(() => {
        if (active) fetchOrder();
      }, 0);
    }

    return () => {
      active = false;
    };
  }, [id, navigate]);

  // Socket: listen for real-time order status updates
  useEffect(() => {
    if (!socket || !id) return;

    const handleStatusUpdated = (data) => {
      if (String(data.orderId) === String(id)) {
        setOrder((prev) =>
          prev ? { ...prev, orderStatus: data.orderStatus, paymentStatus: data.paymentStatus || prev.paymentStatus } : prev
        );
      }
    };

    const handleCancelled = (data) => {
      if (String(data.orderId) === String(id)) {
        setOrder((prev) =>
          prev ? { ...prev, orderStatus: "Cancelled" } : prev
        );
      }
    };

    socket.on("order:statusUpdated", handleStatusUpdated);
    socket.on("order:cancelled", handleCancelled);

    return () => {
      socket.off("order:statusUpdated", handleStatusUpdated);
      socket.off("order:cancelled", handleCancelled);
    };
  }, [socket, id]);

  const handleCancel = async (reason) => {
    setIsCancelling(true);
    try {
      const response = await api.put(`/api/orders/${id}/cancel`, { reason });
      if (response.data.success) {
        toast.success("Order cancelled successfully");
        setOrder(response.data.order); // Update UI
        setIsCancelModalOpen(false);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to cancel order");
    } finally {
      setIsCancelling(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-slate-50">
        <Navbar />
        <main className="flex flex-1 items-center justify-center p-8">
          <div className="text-slate-500">Loading order details...</div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!order) return null;

  const currentStepIndex = statusSteps.indexOf(order.orderStatus);
  const isCancelled = order.orderStatus === "Cancelled";
  const isCodOrder = order.paymentMethod === "Cash on Delivery";
  const paymentLabel = isCodOrder ? "COD" : order.paymentStatus;
  const canCancel =
    isCodOrder &&
    order.paymentStatus !== "Paid" &&
    ["Pending", "Confirmed"].includes(order.orderStatus);
  const cancelMessage = !isCodOrder || order.paymentStatus === "Paid"
    ? "Paid orders cannot be cancelled online"
    : "This order can no longer be cancelled";

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Navbar />

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 pt-36 pb-8 sm:px-6 lg:px-8 md:pt-28">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <Link
            to="/orders"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-slate-900"
          >
            <FiArrowLeft className="h-4 w-4" /> Back to Orders
          </Link>

          {order.orderStatus !== "Cancelled" && (canCancel ? (
            <button
              type="button"
              onClick={() => setIsCancelModalOpen(true)}
              disabled={isCancelling}
              className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-100 disabled:opacity-50"
            >
              <FiXCircle className="h-4 w-4" />
              {isCancelling ? "Cancelling..." : "Cancel Order"}
            </button>
          ) : (
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-500" title={cancelMessage}>
              {cancelMessage}
            </div>
          ))}
        </div>

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          {/* Header */}
          <div className="border-b border-slate-100 bg-slate-900 p-6 sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4 text-white">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Order #{order._id.slice(-8).toUpperCase()}</h1>
                <p className="mt-1 text-slate-300">
                  Placed on {new Date(order.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit"
                  })}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">₹{order.totalAmount.toLocaleString()}</p>
                <div className="mt-1 flex items-center justify-end gap-2">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    order.paymentStatus === "Paid" ? "bg-emerald-500/20 text-emerald-300" :
                    order.paymentStatus === "Failed" ? "bg-rose-500/20 text-rose-300" :
                    "bg-amber-500/20 text-amber-300"
                  }`}>
                    {order.paymentStatus}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="border-b border-slate-100 p-6 sm:p-8">
            <h2 className="text-lg font-bold text-slate-900">Order Status</h2>
            
            {isCancelled ? (
              <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center text-rose-700">
                <FiXCircle className="mx-auto mb-2 h-8 w-8" />
                <h3 className="text-lg font-bold">Order Cancelled</h3>
                <p className="text-sm">This order has been cancelled and is no longer being processed.</p>
              </div>
            ) : (
              <div className="relative mt-8">
                <div className="absolute left-0 top-1/2 hidden h-1 w-full -translate-y-1/2 bg-slate-100 sm:block" />
                <div 
                  className="absolute left-0 top-1/2 hidden h-1 -translate-y-1/2 bg-indigo-600 transition-all sm:block"
                  style={{ width: `${(Math.max(currentStepIndex, 0) / (statusSteps.length - 1)) * 100}%` }}
                />
                
                <div className="relative flex flex-col gap-6 sm:flex-row sm:justify-between sm:gap-0">
                  {statusSteps.map((step, index) => {
                    const isCompleted = index <= currentStepIndex;
                    const isCurrent = index === currentStepIndex;
                    
                    return (
                      <div key={step} className="flex items-center gap-4 sm:flex-col sm:gap-2 text-center">
                        <div className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-4 border-white transition-colors ${
                          isCompleted ? "bg-indigo-600 text-white" : "bg-slate-200 text-slate-400"
                        } ${isCurrent ? "ring-4 ring-indigo-100" : ""}`}>
                          {index === 0 ? <FiPackage className="h-4 w-4" /> : 
                           index === statusSteps.length - 1 ? <FiCheckCircle className="h-4 w-4" /> : 
                           <FiTruck className="h-4 w-4" />}
                        </div>
                        <div className="sm:mt-2">
                          <p className={`text-sm font-bold ${isCompleted ? "text-slate-900" : "text-slate-400"}`}>
                            {step}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="grid gap-0 divide-y divide-slate-100 sm:grid-cols-2 sm:divide-x sm:divide-y-0">
            {/* Shipping Info */}
            <div className="p-6 sm:p-8">
              <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
                <FiMapPin className="h-5 w-5 text-indigo-600" /> Shipping Address
              </h2>
              <div className="mt-4 text-sm text-slate-600">
                <p className="line-clamp-3 leading-relaxed">
                  {order.shippingAddress.street}, <br />
                  {order.shippingAddress.city}, {order.shippingAddress.state} <br />
                  {order.shippingAddress.pincode}, {order.shippingAddress.country}
                </p>
                <p className="mt-4 font-semibold text-indigo-600">
                  Estimated Delivery: {new Date(order.estimatedDelivery).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Payment Info */}
            <div className="p-6 sm:p-8">
              <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
                <FiCreditCard className="h-5 w-5 text-emerald-600" /> Payment Details
              </h2>
              <div className="mt-4 space-y-3 text-sm text-slate-600">
                <div className="flex justify-between">
                  <span>Method</span>
                  <span className="font-semibold text-slate-900">{order.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span>Status</span>
                  <span className="font-semibold text-slate-900">{paymentLabel}</span>
                </div>
                {order.razorpayPaymentId && (
                  <div className="flex justify-between">
                    <span>Payment ID</span>
                    <span className="font-semibold text-slate-900">{order.razorpayPaymentId}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-900">₹{order.totalAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="font-semibold text-slate-900">Free</span>
                </div>
                <div className="flex justify-between border-t border-slate-100 pt-3 text-base">
                  <span>Total</span>
                  <span className="font-bold text-indigo-600">₹{order.totalAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="border-t border-slate-100 bg-slate-50 p-6 sm:p-8">
            <h2 className="text-lg font-bold text-slate-900">Ordered Items</h2>
            <div className="mt-6 space-y-4">
              {order.items.map((item) => (
                <div key={item.product._id} className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
                  <div className="h-24 w-24 shrink-0 rounded-xl bg-slate-50 p-2">
                    <img 
                      src={resolveImageUrl(item.product.imageUrl)} 
                      alt={item.product.productName}
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <div className="flex-1">
                    <Link to={`/products/${item.product._id}`} className="font-semibold text-slate-900 hover:text-indigo-600 hover:underline">
                      {item.product.productName}
                    </Link>
                    <p className="mt-1 text-sm text-slate-500">{item.product.category}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <p className="text-sm font-medium text-slate-700">Qty: {item.quantity}</p>
                      <p className="font-bold text-slate-900">₹{(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
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

export default OrderDetails;
