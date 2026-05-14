import { Link } from "react-router-dom";
import { FiShoppingCart } from "react-icons/fi";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";

function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { showToast } = useToast();

  return (
    <div className="group flex h-full flex-col rounded-2xl border border-slate-100 bg-white p-4 shadow-md shadow-slate-200/70 transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      <Link to={`/products/${product._id}`} className="flex flex-col">
        <div className="aspect-[4/3] overflow-hidden rounded-xl bg-slate-50">
          <img
            src={product.imageUrl}
            alt={product.productName}
            className="h-full w-full object-contain transition duration-300 group-hover:scale-105"
          />
        </div>

        <div className="mt-4 flex items-center justify-between">
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
            {product.category}
          </span>
          <span className="text-sm text-slate-500">
            Stock: {product.stock}
          </span>
        </div>

        <h2 className="mt-3 text-base font-semibold text-slate-900">
          {product.productName}
        </h2>

        <p className="mt-2 max-h-10 overflow-hidden text-sm text-slate-600">
          {product.description}
        </p>
      </Link>

      <div className="mt-auto flex items-center justify-between pt-4">
        <span className="text-lg font-bold text-blue-600">₹{product.price}</span>
        <button
          type="button"
          onClick={() => {
            addToCart(product);
            showToast(`${product.productName} added to cart.`, {
              action: { label: "Open Cart", to: "/cart" },
            });
          }}
          className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-sm shadow-slate-900/30 transition hover:-translate-y-0.5 hover:bg-slate-800"
        >
          <FiShoppingCart className="h-4 w-4" />
          Add to Cart
        </button>
      </div>
    </div>
  );
}

export default ProductCard;