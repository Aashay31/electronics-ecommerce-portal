import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { FiHeart, FiShoppingCart } from "react-icons/fi";
import { useCart } from "../context/CartContext";
import { useProfile } from "../context/ProfileContext";
import { useAuth } from "../context/AuthContext";
import { resolveImageUrl } from "../utils/imageUrl";
import StarRating from "./StarRating";

function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { wishlist, toggleWishlist } = useProfile();
  const navigate = useNavigate();

  const isWishlisted = wishlist.some((item) => item._id === product._id);

  const handleAddToCart = async () => {
    const added = await addToCart(product);
    if (!added) {
      return;
    }

    toast.custom((toastInstance) => (
      <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 shadow-lg shadow-slate-200/70">
        <span>{product.productName} added to cart.</span>
        <button
          type="button"
          onClick={() => {
            navigate("/cart");
            toast.dismiss(toastInstance.id);
          }}
          className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
        >
          Open Cart
        </button>
      </div>
    ));
  };

  return (
    <div className="group relative flex h-full flex-col rounded-2xl border border-slate-100 bg-white p-4 shadow-md shadow-slate-200/70 transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      <button
        type="button"
        onClick={async () => {
          if (!isAuthenticated) {
            toast.error("Please login to save wishlist items");
            return;
          }
          await toggleWishlist(product._id);
        }}
        className={`absolute right-4 top-4 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full border text-sm transition ${
          isWishlisted
            ? "border-rose-200 bg-rose-50 text-rose-500"
            : "border-slate-200 bg-white text-slate-500 hover:border-rose-200 hover:text-rose-500"
        }`}
      >
        <FiHeart className={isWishlisted ? "fill-current" : ""} />
      </button>
      <Link to={`/products/${product._id}`} className="flex flex-col">
        <div className="aspect-[4/3] overflow-hidden rounded-xl bg-slate-50">
          <img
            src={resolveImageUrl(product.imageUrl)}
            alt={product.productName}
            className="h-full w-full object-contain transition duration-300 group-hover:scale-105"
          />
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
            {product.category}
          </span>
          {product.stock <= 0 ? (
            <span className="rounded-full bg-rose-50 border border-rose-200 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-rose-600 animate-pulse">
              Out of Stock
            </span>
          ) : product.stock <= 5 ? (
            <span className="rounded-full bg-amber-50 border border-amber-200 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-600">
              Only {product.stock} Left
            </span>
          ) : (
            <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-600">
              In Stock
            </span>
          )}
        </div>

        <h2 className="mt-3 min-h-[3rem] text-base font-semibold text-slate-900 line-clamp-2">
          {product.productName}
        </h2>

        <p className="mt-2 min-h-[2.5rem] text-sm text-slate-600 line-clamp-2">
          {product.description}
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <StarRating value={product.averageRating ?? product.rating ?? 0} readOnly size={14} />
          <span className="text-xs font-semibold text-slate-500">
            {(product.averageRating ?? product.rating ?? 0).toFixed(1)}
          </span>
          <span className="text-[10px] text-slate-400">
            ({product.totalReviews ?? product.ratingCount ?? 0})
          </span>
        </div>
      </Link>

      <div className="mt-auto flex items-center justify-between gap-3 pt-4">
        <span className="text-base font-bold text-blue-600 whitespace-nowrap">₹{product.price}</span>
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={product.stock <= 0}
          className={`inline-flex items-center gap-2 whitespace-nowrap rounded-full px-3 py-2 text-[11px] font-semibold transition ${
            product.stock <= 0
              ? "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
              : "bg-slate-900 text-white shadow-sm shadow-slate-900/30 hover:-translate-y-0.5 hover:bg-slate-800"
          }`}
        >
          <FiShoppingCart className="h-4 w-4" />
          {product.stock <= 0 ? "Out of Stock" : "Add to Cart"}
        </button>
      </div>
    </div>
  );
}

export default ProductCard;