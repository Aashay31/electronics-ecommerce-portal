import { FiSearch, FiX } from "react-icons/fi";
import { resolveImageUrl } from "../utils/imageUrl";

function SearchBar({
  value,
  onChange,
  onClear,
  onSubmit,
  suggestions,
  recentSearches,
  onSelectSuggestion,
  onSelectRecent,
  isOpen,
}) {
  return (
    <div className="relative">
      <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white dark:bg-slate-900 px-4 py-3 shadow-sm transition focus-within:border-slate-300 dark:border-white/10 dark:bg-white/5 dark:focus-within:border-white/20">
        <FiSearch className="h-5 w-5 text-slate-400" />
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              onSubmit?.();
            }
          }}
          placeholder="Search microcontrollers, sensors, boards..."
          className="w-full bg-transparent text-sm text-slate-700 dark:text-slate-300 outline-none placeholder:text-slate-400 dark:text-white dark:placeholder:text-slate-500"
        />
        {value && (
          <button
            type="button"
            onClick={onClear}
            className="rounded-full p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-white/10 dark:hover:text-slate-300"
          >
            <FiX className="h-4 w-4" />
          </button>
        )}
      </div>

      {isOpen && (suggestions.length > 0 || recentSearches.length > 0) && (
        <div className="absolute left-0 right-0 top-[calc(100%+10px)] z-20 rounded-2xl border border-slate-200 bg-white dark:bg-slate-900 p-3 shadow-xl dark:border-white/10 dark:bg-slate-800">
          {recentSearches.length > 0 && (
            <div className="border-b border-slate-100 pb-3 dark:border-white/10">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Recent searches</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {recentSearches.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => onSelectRecent(item)}
                    className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 dark:border-white/10 dark:text-slate-300 dark:hover:border-white/20 dark:hover:bg-white/5"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          )}
          {suggestions.length > 0 && (
            <div className="pt-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Suggestions</p>
              <div className="mt-2 grid gap-2">
                {suggestions.map((item) => (
                  <button
                    key={item._id}
                    type="button"
                    onClick={() => onSelectSuggestion(item)}
                    className="flex items-center gap-3 rounded-xl border border-transparent px-2 py-2 text-left text-sm text-slate-700 dark:text-slate-300 transition hover:border-slate-200 hover:bg-slate-50 dark:text-slate-200 dark:hover:border-white/10 dark:hover:bg-white/5"
                  >
                    <img
                      src={resolveImageUrl(item.imageUrl)}
                      alt={item.productName}
                      className="h-10 w-10 rounded-lg border border-slate-100 bg-slate-50 dark:bg-slate-900 object-contain dark:border-white/10 dark:bg-white/5"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">{item.productName}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{item.category}</p>
                    </div>
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">₹{item.price}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default SearchBar;
