import ProductCard from "./ProductCard";

function ProductGrid({ products, isLoading }) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={`skeleton-${index}`}
            className="h-80 rounded-2xl border border-slate-100 bg-white p-4 shadow-md dark:border-white/10 dark:bg-slate-900"
          >
            <div className="h-40 w-full animate-pulse rounded-xl bg-slate-200 dark:bg-slate-700 dark:bg-white/10" />
            <div className="mt-4 h-4 w-3/4 animate-pulse rounded bg-slate-200 dark:bg-slate-700 dark:bg-white/10" />
            <div className="mt-3 h-3 w-1/2 animate-pulse rounded bg-slate-200 dark:bg-slate-700 dark:bg-white/10" />
            <div className="mt-6 h-9 w-full animate-pulse rounded-full bg-slate-200 dark:bg-slate-700 dark:bg-white/10" />
          </div>
        ))}
      </div>
    );
  }

  if (!products.length) {
    return (
      <div className="flex min-h-[240px] flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white p-10 text-center dark:border-white/10 dark:bg-slate-900">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">No products found</h3>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Try adjusting your filters or search query to discover more products.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  );
}

export default ProductGrid;
