import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FiCheckCircle, FiPackage, FiShoppingBag, FiTruck } from "react-icons/fi";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import api from "../utils/api";

function OrderSuccess() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await api.get(`/api/orders/${id}`);
        setOrder(response.data.order);
      } catch (error) {
        console.error("Failed to fetch order", error);
      } finally {
        setIsLoading(false);
      }
    };
    if (id) fetchOrder();
  }, [id]);

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-900 dark:bg-slate-950">
      <Navbar />

      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl dark:border-white/10 dark:bg-slate-900">
          <div className="bg-indigo-600 px-6 py-12 text-center text-slate-900 dark:text-white">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-white/20 backdrop-blur">
              <FiCheckCircle className="h-10 w-10 text-slate-900 dark:text-white" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Order Successful!</h1>
            <p className="mt-2 text-indigo-100">
              Thank you for your purchase. Your order has been placed.
            </p>
          </div>

          {isLoading ? (
            <div className="p-12 text-center text-slate-500 dark:text-slate-400">Loading order details...</div>
          ) : order ? (
            <div className="p-8 sm:p-10">
              <div className="grid gap-8 sm:grid-cols-2">
                <div>
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
                    <FiPackage className="h-4 w-4 text-slate-400" />
                    Order Details
                  </h3>
                  <div className="mt-3 space-y-1 text-sm text-slate-600 dark:text-slate-400">
                    <p>
                      <span className="font-medium text-slate-900 dark:text-white">Order ID:</span> #{order._id.slice(-8)}
                    </p>
                    <p>
                      <span className="font-medium text-slate-900 dark:text-white">Date:</span>{" "}
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                    <p>
                      <span className="font-medium text-slate-900 dark:text-white">Amount:</span> ₹
                      {order.totalAmount.toLocaleString()}
                    </p>
                    <p>
                      <span className="font-medium text-slate-900 dark:text-white">Payment:</span> {order.paymentMethod}
                    </p>
                    {order.razorpayPaymentId && (
                      <p>
                        <span className="font-medium text-slate-900 dark:text-white">Payment ID:</span> {order.razorpayPaymentId}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
                    <FiTruck className="h-4 w-4 text-slate-400" />
                    Delivery Information
                  </h3>
                  <div className="mt-3 text-sm text-slate-600 dark:text-slate-400">
                    <p className="font-medium text-indigo-600">
                      Estimated: {new Date(order.estimatedDelivery).toLocaleDateString()}
                    </p>
                    <p className="mt-2 line-clamp-3">
                      {order.shippingAddress.street}, {order.shippingAddress.city},{" "}
                      {order.shippingAddress.state} {order.shippingAddress.pincode},{" "}
                      {order.shippingAddress.country}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Link
                  to="/orders"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white dark:bg-slate-950 px-6 py-3 text-sm font-semibold text-slate-700 dark:text-slate-300 shadow-sm transition hover:bg-slate-50 hover:text-slate-900 dark:border-white/10 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-white/5"
                >
                  <FiPackage className="h-4 w-4" /> Track Order
                </Link>
                <Link
                  to="/home"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-slate-900 dark:text-white shadow-lg shadow-indigo-600/30 transition hover:-translate-y-0.5 hover:bg-indigo-700"
                >
                  <FiShoppingBag className="h-4 w-4" /> Continue Shopping
                </Link>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-500 dark:text-slate-400">Order not found.</div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default OrderSuccess;
