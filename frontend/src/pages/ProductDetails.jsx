import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { FiShoppingCart } from "react-icons/fi";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";

function ProductDetails() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        setErrorMessage("");
        const response = await axios.get(
          `http://192.168.1.9:5000/api/products/${id}`
        );
        setProduct(response.data.product);
      } catch (error) {
        setErrorMessage("Unable to load product details.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const specs = useMemo(() => {
    if (!product) {
      return [];
    }

    return [
      { label: "Category", value: product.category },
      { label: "Availability", value: `${product.stock} in stock` },
      { label: "Product ID", value: product._id },
      { label: "Shipping", value: "Ready to ship in 24-48 hrs" },
    ];
  }, [product]);

  return (
    <>
      <Navbar />

      <section className="mx-auto w-full max-w-6xl px-6 py-12">
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
          <div className="grid gap-10 md:grid-cols-[1.05fr_1fr]">
            <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-lg">
              <div className="aspect-[4/3] bg-slate-50 p-6">
                <img
                  src={product.imageUrl}
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
                <p className="mt-4 text-lg text-slate-600">
                  {product.description}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <span className="text-3xl font-bold text-blue-600">
                  ₹{product.price}
                </span>
                <span className="rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
                  {product.stock} available
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  addToCart(product);
                  showToast(`${product.productName} added to cart.`, {
                    action: { label: "Open Cart", to: "/cart" },
                  });
                }}
                className="inline-flex w-full items-center justify-center gap-3 rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/30 transition hover:-translate-y-0.5 hover:bg-slate-800 sm:w-auto"
              >
                <FiShoppingCart className="h-5 w-5" />
                Add to Cart
              </button>

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
        )}
      </section>

      <Footer />
    </>
  );
}

export default ProductDetails;
