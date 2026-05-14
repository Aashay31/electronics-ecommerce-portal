import { Link } from "react-router-dom";
import { FiMinus, FiPlus, FiTrash2 } from "react-icons/fi";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useCart } from "../context/CartContext";

function Cart() {
  const { items, cartTotal, removeFromCart, updateQuantity, isLoading } =
    useCart();

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <section className="mx-auto w-full max-w-6xl flex-1 px-6 py-12">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">Your Cart</h1>
            <p className="mt-2 text-sm text-slate-500">
              Review your items before checkout.
            </p>
          </div>
          <Link
            to="/home"
            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
          >
            Continue Shopping
          </Link>
        </div>

        {isLoading ? (
          <div className="mt-10 rounded-2xl border border-slate-100 bg-white p-10 text-center text-slate-500 shadow-md">
            Loading your cart...
          </div>
        ) : items.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center">
            <h2 className="text-lg font-semibold text-slate-800">
              Your cart is empty
            </h2>
            <p className="mt-3 text-sm text-slate-500">
              Add products to your cart to see them here.
            </p>
          </div>
        ) : (
          <div className="mt-10 grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-6">
              {items.map((entry) => (
                <div
                  key={entry.product?._id || entry.product}
                  className="flex flex-col gap-6 rounded-2xl border border-slate-100 bg-white p-4 shadow-md sm:flex-row sm:items-center"
                >
                  <div className="h-28 w-full overflow-hidden rounded-xl bg-slate-50 sm:h-24 sm:w-32">
                    <img
                      src={entry.product?.imageUrl}
                      alt={entry.product?.productName}
                      className="h-full w-full object-contain"
                    />
                  </div>

                  <div className="flex-1">
                    <h3 className="text-base font-semibold text-slate-900">
                      {entry.product?.productName}
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      {entry.product?.category}
                    </p>
                    <p className="mt-3 text-lg font-semibold text-blue-600">
                      ₹{entry.product?.price}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center rounded-full border border-slate-200">
                      <button
                        type="button"
                        className="px-3 py-2 text-slate-600 transition hover:text-slate-900"
                        onClick={() =>
                          updateQuantity(
                            entry.product?._id || entry.product,
                            entry.quantity - 1
                          )
                        }
                        disabled={entry.quantity <= 1 || !entry.product}
                      >
                        <FiMinus className="h-4 w-4" />
                      </button>
                      <span className="min-w-10 text-center text-sm font-semibold text-slate-800">
                        {entry.quantity}
                      </span>
                      <button
                        type="button"
                        className="px-3 py-2 text-slate-600 transition hover:text-slate-900"
                        onClick={() =>
                          updateQuantity(
                            entry.product?._id || entry.product,
                            entry.quantity + 1
                          )
                        }
                        disabled={!entry.product}
                      >
                        <FiPlus className="h-4 w-4" />
                      </button>
                    </div>

                    <button
                      type="button"
                      className="inline-flex items-center gap-2 rounded-full border border-rose-200 px-4 py-2 text-xs font-semibold text-rose-600 transition hover:border-rose-300 hover:bg-rose-50"
                      onClick={() =>
                        removeFromCart(entry.product?._id || entry.product)
                      }
                      disabled={!entry.product}
                    >
                      <FiTrash2 className="h-4 w-4" />
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="h-fit rounded-2xl border border-slate-100 bg-white p-6 shadow-md">
              <h2 className="text-lg font-semibold text-slate-900">
                Order Summary
              </h2>
              <div className="mt-6 space-y-3 text-sm text-slate-600">
                <div className="flex items-center justify-between">
                  <span>Subtotal</span>
                  <span>₹{cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <div className="flex items-center justify-between border-t border-slate-200 pt-4 text-base font-semibold text-slate-900">
                  <span>Total</span>
                  <span>₹{cartTotal.toFixed(2)}</span>
                </div>
              </div>

              <Link
                to="/checkout"
                className="mt-6 flex w-full justify-center rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/30 transition hover:-translate-y-0.5 hover:bg-slate-800"
              >
                Proceed to Checkout
              </Link>
            </div>
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}

export default Cart;
