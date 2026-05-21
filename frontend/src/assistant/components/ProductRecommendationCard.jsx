import { resolveImageUrl } from "../../utils/imageUrl";

function ProductRecommendationCard({ product, onExplore }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-3 backdrop-blur-sm">
      <div className="flex gap-3">
        <div className="h-20 w-20 shrink-0 rounded-2xl bg-white p-2">
          <img
            src={resolveImageUrl(product.imageUrl)}
            alt={product.productName}
            className="h-full w-full object-contain"
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-white">{product.productName}</p>
          <p className="mt-1 text-xs uppercase tracking-[0.24em] text-slate-400">{product.category}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-300">
            <span className="font-semibold text-cyan-100">₹{product.price}</span>
            <span>{product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}</span>
            <span>{(product.averageRating || product.rating || 0).toFixed(1)}★</span>
          </div>
        </div>
      </div>
      <button
        type="button"
        onClick={() => onExplore(product)}
        className="mt-3 w-full rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/10"
      >
        View Product
      </button>
    </div>
  );
}

export default ProductRecommendationCard;
