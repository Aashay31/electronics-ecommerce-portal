import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { FiMapPin, FiCreditCard, FiTruck, FiChevronLeft } from "react-icons/fi";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useCart } from "../context/CartContext";
import { useProfile } from "../context/ProfileContext";
import api from "../utils/api";

function Checkout() {
  const { items, cartTotal, refreshCart } = useCart();
  const { profile } = useProfile();
  const navigate = useNavigate();

  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("Cash on Delivery");
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const shippingCharge = cartTotal > 500 ? 0 : 50;
  const taxAmount = cartTotal * 0.18; // 18% GST Example
  const finalTotal = cartTotal + shippingCharge + taxAmount;

  useEffect(() => {
    if (items.length === 0) {
      navigate("/cart");
    }
  }, [items, navigate]);

  useEffect(() => {
    if (profile?.savedAddresses?.length > 0) {
      const defaultAddr = profile.savedAddresses.find((a) => a.isDefault);
      setSelectedAddress(defaultAddr || profile.savedAddresses[0]);
    }
  }, [profile]);

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      return toast.error("Please select a shipping address");
    }

    setIsPlacingOrder(true);
    try {
      const orderItems = items.map((item) => ({
        product: item.product._id,
        quantity: item.quantity,
        price: item.product.price,
      }));

      const payload = {
        items: orderItems,
        shippingAddress: {
          street: selectedAddress.street,
          city: selectedAddress.city,
          state: selectedAddress.state,
          pincode: selectedAddress.pincode,
          country: selectedAddress.country,
        },
        paymentMethod,
        totalAmount: finalTotal,
      };

      const response = await api.post("/api/orders", payload);
      
      if (response.data.success) {
        toast.success("Order placed successfully!");
        await refreshCart(); // Refresh cart to empty state
        navigate(`/order-success/${response.data.order._id}`);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to place order");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (!items.length) return null;

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Navbar />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <Link
          to="/cart"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-slate-900"
        >
          <FiChevronLeft className="h-4 w-4" /> Back to Cart
        </Link>

        <div className="grid gap-8 lg:grid-cols-12">
          {/* Left Column: Details */}
          <div className="space-y-6 lg:col-span-8">
            {/* Shipping Address */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                  <FiMapPin className="h-5 w-5" />
                </div>
                <h2 className="text-lg font-bold text-slate-900">Shipping Address</h2>
              </div>

              <div className="mt-6 space-y-4">
                {!profile?.savedAddresses?.length ? (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                    You have no saved addresses. Please{" "}
                    <Link to="/addresses" className="font-semibold underline">
                      add an address
                    </Link>{" "}
                    first.
                  </div>
                ) : (
                  profile.savedAddresses.map((address) => (
                    <label
                      key={address._id}
                      className={`flex cursor-pointer items-start gap-4 rounded-xl border p-4 transition ${
                        selectedAddress?._id === address._id
                          ? "border-indigo-600 bg-indigo-50/50 shadow-sm ring-1 ring-indigo-600"
                          : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="address"
                        className="mt-1 h-4 w-4 text-indigo-600 focus:ring-indigo-600"
                        checked={selectedAddress?._id === address._id}
                        onChange={() => setSelectedAddress(address)}
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900">{address.label}</span>
                          {address.isDefault && (
                            <span className="rounded bg-indigo-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-indigo-700">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-sm text-slate-600">
                          {address.street}, {address.city}, {address.state} {address.pincode},{" "}
                          {address.country}
                        </p>
                      </div>
                    </label>
                  ))
                )}
              </div>
            </section>

            {/* Payment Method */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                  <FiCreditCard className="h-5 w-5" />
                </div>
                <h2 className="text-lg font-bold text-slate-900">Payment Method</h2>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                {["Cash on Delivery", "UPI", "Card"].map((method) => (
                  <label
                    key={method}
                    className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border p-4 text-center transition ${
                      paymentMethod === method
                        ? "border-emerald-600 bg-emerald-50/50 shadow-sm ring-1 ring-emerald-600"
                        : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      className="sr-only"
                      checked={paymentMethod === method}
                      onChange={() => setPaymentMethod(method)}
                    />
                    <span className="text-sm font-semibold text-slate-900">{method}</span>
                    {method !== "Cash on Delivery" && (
                      <span className="text-xs text-slate-500">(UI Only Simulation)</span>
                    )}
                  </label>
                ))}
              </div>
            </section>
          </div>

          {/* Right Column: Order Summary */}
          <div className="lg:col-span-4">
            <section className="sticky top-24 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="bg-slate-900 p-5 text-white">
                <h2 className="text-lg font-bold">Order Summary</h2>
                <p className="mt-1 text-sm text-slate-300">{items.length} items</p>
              </div>

              <div className="max-h-64 overflow-y-auto p-5">
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.product._id} className="flex gap-4">
                      <div className="h-16 w-16 flex-shrink-0 rounded-lg border border-slate-100 bg-slate-50 p-1">
                        <img
                          src={item.product.imageUrl}
                          alt={item.product.productName}
                          className="h-full w-full object-contain"
                        />
                      </div>
                      <div className="flex flex-1 flex-col justify-center">
                        <p className="line-clamp-1 text-sm font-semibold text-slate-900">
                          {item.product.productName}
                        </p>
                        <div className="mt-1 flex items-center justify-between text-sm">
                          <span className="text-slate-500">Qty: {item.quantity}</span>
                          <span className="font-semibold text-slate-900">
                            ₹{(item.product.price * item.quantity).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-slate-100 bg-slate-50 p-5">
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal</span>
                    <span className="font-medium text-slate-900">
                      ₹{cartTotal.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Shipping fee</span>
                    <span className="font-medium text-slate-900">
                      {shippingCharge === 0 ? "Free" : `₹${shippingCharge.toLocaleString()}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Estimated Tax (18%)</span>
                    <span className="font-medium text-slate-900">
                      ₹{taxAmount.toLocaleString()}
                    </span>
                  </div>
                  <div className="mt-4 flex justify-between border-t border-slate-200 pt-4 text-base font-bold text-slate-900">
                    <span>Total Amount</span>
                    <span className="text-indigo-600">₹{finalTotal.toLocaleString()}</span>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={isPlacingOrder || !selectedAddress}
                  onClick={handlePlaceOrder}
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-600/30 transition hover:-translate-y-0.5 hover:bg-indigo-700 disabled:pointer-events-none disabled:opacity-50"
                >
                  <FiTruck className="h-4 w-4" />
                  {isPlacingOrder ? "Processing..." : "Place Order"}
                </button>
              </div>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default Checkout;
