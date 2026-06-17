import { FiChevronDown } from "react-icons/fi";
import { useState } from "react";

function FilterSection({ title, children }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="border-b border-slate-100 pb-4 dark:border-white/10">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="flex w-full items-center justify-between text-sm font-semibold text-slate-900 dark:text-white"
      >
        {title}
        <FiChevronDown className={`h-4 w-4 text-slate-400 transition ${isOpen ? "rotate-180" : ""}`} />
      </button>
      {isOpen && <div className="mt-3 space-y-3 text-sm text-slate-600 dark:text-slate-300">{children}</div>}
    </div>
  );
}

function FilterSidebar({
  categories,
  selectedCategories,
  minPrice,
  maxPrice,
  rating,
  featured,
  stock,
  newArrival,
  priceBounds,
  onCategoryChange,
  onPriceChange,
  onRatingChange,
  onFeaturedChange,
  onStockChange,
  onNewArrivalChange,
}) {
  return (
    <div className="space-y-6">
      <FilterSection title="Categories">
        <div className="grid gap-2">
          {categories.map((category) => (
            <label key={category.name} className="flex items-center justify-between gap-2 text-xs">
              <span className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(category.name)}
                  onChange={() => onCategoryChange(category.name)}
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 dark:border-white/20"
                />
                {category.name}
              </span>
              <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-semibold text-slate-500 dark:bg-white/10 dark:text-slate-400">
                {category.count}
              </span>
            </label>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Price range">
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-xs">
            <input
              type="number"
              min={priceBounds.min}
              max={priceBounds.max}
              value={minPrice}
              onChange={(event) => onPriceChange("min", event.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 dark:border-white/10 dark:bg-white/5 dark:text-white"
              placeholder={`Min ₹${priceBounds.min}`}
            />
            <input
              type="number"
              min={priceBounds.min}
              max={priceBounds.max}
              value={maxPrice}
              onChange={(event) => onPriceChange("max", event.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 dark:border-white/10 dark:bg-white/5 dark:text-white"
              placeholder={`Max ₹${priceBounds.max}`}
            />
          </div>
          <div className="space-y-2">
            <input
              type="range"
              min={priceBounds.min}
              max={priceBounds.max}
              value={maxPrice || priceBounds.max}
              onChange={(event) => onPriceChange("max", event.target.value)}
              className="w-full accent-indigo-600"
            />
            <div className="flex justify-between text-[11px] text-slate-400 dark:text-slate-500">
              <span>₹{priceBounds.min}</span>
              <span>₹{priceBounds.max}</span>
            </div>
          </div>
        </div>
      </FilterSection>

      <FilterSection title="Rating">
        {[4, 3, 2].map((value) => (
          <label key={value} className="flex items-center gap-2 text-xs">
            <input
              type="radio"
              name="rating"
              checked={Number(rating) === value}
              onChange={() => onRatingChange(value)}
              className="h-4 w-4 text-indigo-600 dark:border-white/20"
            />
            {value}+ stars
          </label>
        ))}
        <button
          type="button"
          onClick={() => onRatingChange("")}
          className="text-xs font-semibold text-slate-500 transition hover:text-slate-700 dark:text-slate-400 dark:hover:text-white"
        >
          Clear rating
        </button>
      </FilterSection>

      <FilterSection title="Availability">
        <label className="flex items-center gap-2 text-xs">
          <input
            type="radio"
            name="stock"
            checked={stock === "in"}
            onChange={() => onStockChange("in")}
            className="h-4 w-4 text-indigo-600 dark:border-white/20"
          />
          In stock
        </label>
        <label className="flex items-center gap-2 text-xs">
          <input
            type="radio"
            name="stock"
            checked={stock === "out"}
            onChange={() => onStockChange("out")}
            className="h-4 w-4 text-indigo-600 dark:border-white/20"
          />
          Out of stock
        </label>
        <button
          type="button"
          onClick={() => onStockChange("")}
          className="text-xs font-semibold text-slate-500 transition hover:text-slate-700 dark:text-slate-400 dark:hover:text-white"
        >
          Clear availability
        </button>
      </FilterSection>

      <FilterSection title="Highlights">
        <label className="flex items-center gap-2 text-xs">
          <input
            type="checkbox"
            checked={featured}
            onChange={(event) => onFeaturedChange(event.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-indigo-600 dark:border-white/20"
          />
          Featured products
        </label>
        <label className="flex items-center gap-2 text-xs">
          <input
            type="checkbox"
            checked={newArrival}
            onChange={(event) => onNewArrivalChange(event.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-indigo-600 dark:border-white/20"
          />
          New arrivals
        </label>
      </FilterSection>
    </div>
  );
}

export default FilterSidebar;
