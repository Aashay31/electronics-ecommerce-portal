import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useProfile } from "../context/ProfileContext";
import { useCart } from "../context/CartContext";

function Wishlist() {
  const { wishlist, toggleWishlist } = useProfile();
  const { addToCart } = useCart();

  const handleAdd = async (product) => {
    const added = await addToCart(product);
    if (added) {
      toast.success("Added to cart");
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-100 via-white to-slate-200 text-slate-900">
      <Navbar />

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-12">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">
              Wishlist
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Your saved items in one place.
            </p>
          </div>
          <Link
            to="/home"
            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
          >
            Continue Shopping
          </Link>
        </div>

        {wishlist.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center text-slate-500">
            Your wishlist is empty. Save products to see them here.
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {wishlist.map((product) => (
              <div
                key={product._id}
                className="rounded-3xl border border-slate-100 bg-white p-5 shadow-md"
              >
                <div className="aspect-[4/3] rounded-2xl bg-slate-50 p-4">
                  <img
                    src={product.imageUrl}
                    alt={product.productName}
                    className="h-full w-full object-contain"
                  />
                </div>
                <h2 className="mt-4 text-base font-semibold text-slate-900">
                  {product.productName}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {product.category}
                </p>
                <p className="mt-3 text-lg font-semibold text-blue-600">
                  ₹{product.price}
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => handleAdd(product)}
                    className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-sm shadow-slate-900/30 transition hover:-translate-y-0.5 hover:bg-slate-800"
                  >
                    Add to Cart
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleWishlist(product._id)}
                    className="rounded-full border border-rose-200 px-4 py-2 text-xs font-semibold text-rose-600 transition hover:border-rose-300 hover:bg-rose-50"
                  >
                    Remove
                  </button>
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

export default Wishlist;
