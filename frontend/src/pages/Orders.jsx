import { useEffect } from "react";
import { Link } from "react-router-dom";
import { FiEye } from "react-icons/fi";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useProfile } from "../context/ProfileContext";

function Orders() {
  const { orders, loadOrders } = useProfile();

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-100 via-white to-slate-200 text-slate-900">
      <Navbar />

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-slate-900">My Orders</h1>
          <p className="mt-2 text-sm text-slate-500">
            Track your recent purchases and delivery status.
          </p>
        </div>

        {orders.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center text-slate-500">
            No orders yet. Your purchases will appear here.
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order, index) => (
              <div
                key={`${order._id || index}`}
                className="rounded-3xl border border-slate-100 bg-white p-6 shadow-md"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                      Order #{order._id.slice(-8).toUpperCase()}
                    </p>
                    <h2 className="mt-1 text-lg font-semibold text-slate-900">
                      ₹{order.totalAmount?.toLocaleString() || 0}
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleDateString()
                        : "-"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-700" title="Payment Status">
                      Payment: {order.paymentStatus}
                    </span>
                    <span className={`rounded-full px-3 py-1 font-semibold ${
                      order.orderStatus === "Delivered" ? "bg-emerald-100 text-emerald-700" :
                      order.orderStatus === "Cancelled" ? "bg-rose-100 text-rose-700" :
                      "bg-indigo-100 text-indigo-700"
                    }`} title="Order Status">
                      {order.orderStatus}
                    </span>
                    <Link
                      to={`/orders/${order._id}`}
                      className="ml-2 flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1 font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      <FiEye className="h-4 w-4" /> Details
                    </Link>
                  </div>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  {order.items.map((item) => (
                    <div
                      key={item.product?._id || item._id}
                      className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4"
                    >
                      <div className="h-16 w-16 rounded-xl bg-white">
                        {item.product?.imageUrl && (
                          <img
                            src={item.product.imageUrl}
                            alt={item.product.productName}
                            className="h-full w-full rounded-xl object-contain"
                          />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          {item.product?.productName || "Product"}
                        </p>
                        <p className="text-xs text-slate-500">
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
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default Orders;
