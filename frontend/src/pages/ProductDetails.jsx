import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { FiHeart, FiShoppingCart } from "react-icons/fi";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import StarRating from "../components/StarRating";
import ReviewsSection from "../components/ReviewsSection";
import { useCart } from "../context/CartContext";
import { useProfile } from "../context/ProfileContext";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import { resolveImageUrl } from "../utils/imageUrl";

function ProductDetails() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { wishlist, toggleWishlist } = useProfile();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        setErrorMessage("");
        const response = await api.get(`/api/products/${id}`);
        setProduct(response.data.product);
      } catch (error) {
        setErrorMessage("Unable to load product details.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    if (!product) {
      return;
    }

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

  const specs = useMemo(() => {
    if (!product) {
      return [];
    }

    return [
      { label: "Category", value: product.category },
      { 
        label: "Availability", 
        value: product.stock <= 0 
          ? "Out of Stock" 
          : product.stock <= 5 
            ? `Low Stock (${product.stock} left)` 
            : `In Stock (${product.stock} available)` 
      },
      { label: "Product ID", value: product._id },
      { label: "Shipping", value: "Ready to ship in 24-48 hrs" },
    ];
  }, [product]);

  const isWishlisted = wishlist.some((item) => item._id === product?._id);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <section className="mx-auto w-full max-w-6xl flex-1 px-6 pb-12 pt-36 md:pt-28">
        {isLoading && (
          <div className="rounded-2xl border border-slate-100 bg-white p-10 text-center text-slate-500 shadow-md">
            Loading product details...
          </div>
        )}

        {!isLoading && errorMessage && (
          <div className="rounded-2xl border border-rose-100 bg-rose-50 p-10 text-center text-rose-600 shadow-md">
            {errorMessage}
          </div>
        )}

        {!isLoading && product && (
          <>
            <div className="grid gap-10 md:grid-cols-[1.05fr_1fr]">
              <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-lg">
                <div className="aspect-[4/3] bg-slate-50 p-6">
                  <img
                    src={resolveImageUrl(product.imageUrl)}
                    alt={product.productName}
                    className="h-full w-full object-contain transition duration-300 hover:scale-[1.02]"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-6">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-widest text-slate-400">
                    {product.category}
                  </p>
                  <h1 className="mt-3 text-3xl font-semibold text-slate-900 sm:text-4xl">
                    {product.productName}
                  </h1>
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <StarRating
                      value={product.averageRating ?? product.rating ?? 0}
                      readOnly
                      size={18}
                    />
                    <span className="text-sm font-semibold text-slate-600">
                      {(product.averageRating ?? product.rating ?? 0).toFixed(1)} rating
                    </span>
                    <span className="text-xs text-slate-400">
                      {product.totalReviews ?? product.ratingCount ?? 0} reviews
                    </span>
                  </div>
                  <p className="mt-4 text-lg text-slate-600">
                    {product.description}
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex flex-wrap items-center gap-4">
                    <span className="text-3xl font-bold text-blue-600">
                      ₹{product.price}
                    </span>
                    {product.stock <= 0 ? (
                      <span className="rounded-full bg-rose-50 border border-rose-200 px-4 py-1.5 text-sm font-bold uppercase tracking-wider text-rose-600 animate-pulse">
                        Out of Stock
                      </span>
                    ) : product.stock <= 5 ? (
                      <span className="rounded-full bg-amber-50 border border-amber-200 px-4 py-1.5 text-sm font-bold uppercase tracking-wider text-amber-600">
                        Low Stock
                      </span>
                    ) : (
                      <span className="rounded-full bg-emerald-50 border border-emerald-200 px-4 py-1.5 text-sm font-bold uppercase tracking-wider text-emerald-600">
                        In Stock
                      </span>
                    )}
                  </div>

                  {product.stock > 0 && product.stock <= 5 && (
                    <div className="mt-1 text-sm font-semibold text-amber-600 flex items-center gap-1.5 animate-pulse">
                      <span className="inline-block h-2 w-2 rounded-full bg-amber-500"></span>
                      Hurry! Only {product.stock} items left in stock.
                    </div>
                  )}
                  {product.stock > 5 && (
                    <div className="mt-1 text-sm font-medium text-slate-500">
                      {product.stock} items available
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-4">
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={product.stock <= 0}
                    className={`inline-flex w-full items-center justify-center gap-3 rounded-full px-6 py-3 text-sm font-semibold transition sm:w-auto ${
                      product.stock <= 0
                        ? "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
                        : "bg-slate-900 text-white shadow-lg shadow-slate-900/30 hover:-translate-y-0.5 hover:bg-slate-800"
                    }`}
                  >
                    <FiShoppingCart className="h-5 w-5" />
                    {product.stock <= 0 ? "Out of Stock" : "Add to Cart"}
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      if (!isAuthenticated) {
                        toast.error("Please login to save wishlist items");
                        return;
                      }
                      await toggleWishlist(product._id);
                    }}
                    className={`inline-flex w-full items-center justify-center gap-2 rounded-full border px-5 py-3 text-sm font-semibold transition sm:w-auto ${
                      isWishlisted
                        ? "border-rose-200 bg-rose-50 text-rose-500"
                        : "border-slate-200 text-slate-700 hover:border-rose-200 hover:text-rose-500"
                    }`}
                  >
                    <FiHeart className={isWishlisted ? "fill-current" : ""} />
                    {isWishlisted ? "Wishlisted" : "Add to Wishlist"}
                  </button>
                </div>

                <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-md">
                  <h2 className="text-lg font-semibold text-slate-900">
                    Product specifications
                  </h2>
                  <div className="mt-4 space-y-3 text-sm text-slate-600">
                    {specs.map((spec) => (
                      <div
                        key={spec.label}
                        className="flex items-center justify-between"
                      >
                        <span className="text-slate-500">{spec.label}</span>
                        <span className="font-medium text-slate-800">
                          {spec.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <ReviewsSection productId={product._id} />
          </>
        )}
      </section>

      <Footer />
    </div>
  );
}

export default ProductDetails;
