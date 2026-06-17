function SortDropdown({ value, onChange }) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="rounded-2xl border border-slate-200 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 shadow-sm transition hover:border-slate-300 dark:border-white/10 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-white/20"
    >
      <option value="newest">Newest Products</option>
      <option value="price-asc">Price: Low to High</option>
      <option value="price-desc">Price: High to Low</option>
      <option value="best-selling">Best Selling</option>
      <option value="rating">Highest Rated</option>
    </select>
  );
}

export default SortDropdown;
