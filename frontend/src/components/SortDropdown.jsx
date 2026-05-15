function SortDropdown({ value, onChange }) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300"
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
