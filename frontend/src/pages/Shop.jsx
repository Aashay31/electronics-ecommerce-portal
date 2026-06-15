import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { FiFilter, FiX } from "react-icons/fi";
import {
  BatteryCharging,
  Bot,
  CircuitBoard,
  Cpu,
  Package,
  PlugZap,
  Radar,
  Wifi,
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import CategoryCard from "../components/CategoryCard";
import FilterSidebar from "../components/FilterSidebar";
import SortDropdown from "../components/SortDropdown";
import ProductGrid from "../components/ProductGrid";
import api from "../utils/api";
import { useSearch } from "../context/SearchContext";
import { useSocket } from "../context/SocketContext";

const CATEGORY_META = [
  {
    key: "Microcontrollers",
    title: "Microcontrollers",
    description: "Power your builds with reliable MCU families.",
    icon: Cpu,
  },
  {
    key: "Sensors",
    title: "Sensors",
    description: "Track motion, temperature, and environment data.",
    icon: Radar,
  },
  {
    key: "Robotics",
    title: "Robotics",
    description: "Motors, drivers, and chassis for automation.",
    icon: Bot,
  },
  {
    key: "IoT Modules",
    title: "IoT Modules",
    description: "Connect projects with Wi-Fi and BLE modules.",
    icon: Wifi,
  },
  {
    key: "Development Boards",
    title: "Development Boards",
    description: "Prototyping boards for fast iteration cycles.",
    icon: CircuitBoard,
  },
  {
    key: "Power Supplies",
    title: "Power Supplies",
    description: "Stable power for every lab and workshop.",
    icon: BatteryCharging,
  },
  {
    key: "Components",
    title: "Components",
    description: "Resistors, ICs, and everyday essentials.",
    icon: PlugZap,
  },
  {
    key: "Accessories",
    title: "Accessories",
    description: "Cables, tools, and add-ons for builds.",
    icon: Package,
  },
];

const PRICE_BOUNDS = { min: 0, max: 50000 };
function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const categoriesRef = useRef(null);
  const productsRef = useRef(null);
  const { searchValue, setSearchValue } = useSearch();
  const socket = useSocket();

  const [products, setProducts] = useState([]);
  const [categoryCounts, setCategoryCounts] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0,
    filteredCount: 0,
    limit: 12,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const urlSearch = searchParams.get("search") || "";
  const [debouncedSearch, setDebouncedSearch] = useState(urlSearch);
  const [selectedCategories, setSelectedCategories] = useState(() => {
    const param = searchParams.get("category");
    return param ? param.split(",").filter(Boolean) : [];
  });
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");
  const [rating, setRating] = useState(searchParams.get("rating") || "");
  const [featured, setFeatured] = useState(searchParams.get("featured") === "true");
  const [stock, setStock] = useState(searchParams.get("stock") || "");
  const [newArrival, setNewArrival] = useState(searchParams.get("newArrival") === "true");
  const [sort, setSort] = useState(searchParams.get("sort") || "newest");
  const [page, setPage] = useState(Number(searchParams.get("page") || 1));
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearch(searchValue.trim());
    }, 350);
    return () => clearTimeout(timeoutId);
  }, [searchValue]);

  useEffect(() => {
    const params = {};
    if (debouncedSearch) params.search = debouncedSearch;
    if (selectedCategories.length) params.category = selectedCategories.join(",");
    if (minPrice) params.minPrice = minPrice;
    if (maxPrice) params.maxPrice = maxPrice;
    if (rating) params.rating = rating;
    if (featured) params.featured = "true";
    if (stock) params.stock = stock;
    if (newArrival) params.newArrival = "true";
    if (sort && sort !== "newest") params.sort = sort;
    if (page > 1) params.page = page.toString();
    setSearchParams(params, { replace: true });
  }, [
    debouncedSearch, selectedCategories, minPrice, maxPrice, rating,
    featured, stock, newArrival, sort, page, setSearchParams,
  ]);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const response = await api.get("/api/products", {
          params: {
            search: debouncedSearch || undefined,
            category: selectedCategories.length ? selectedCategories.join(",") : undefined,
            minPrice: minPrice || undefined,
            maxPrice: maxPrice || undefined,
            rating: rating || undefined,
            featured: featured ? "true" : undefined,
            stock: stock || undefined,
            newArrival: newArrival ? "true" : undefined,
            sort,
            page,
            limit: 12,
          },
        });
        setProducts(response.data.products || []);
        setCategoryCounts(response.data.categories || []);
        setPagination(response.data.pagination || pagination);
      } catch {
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, [debouncedSearch, selectedCategories, minPrice, maxPrice, rating, featured, stock, newArrival, sort, page]);

  useEffect(() => {
    if (location.hash === "#categories" && categoriesRef.current) {
      categoriesRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [location.hash]);

  // Socket: listen for real-time product events
  useEffect(() => {
    if (!socket) return;

    const handleStockUpdated = (data) => {
      setProducts((prev) =>
        prev.map((p) =>
          String(p._id) === String(data.productId)
            ? { ...p, stock: data.stock }
            : p
        )
      );
    };

    const handlePriceUpdated = (data) => {
      setProducts((prev) =>
        prev.map((p) =>
          String(p._id) === String(data.productId)
            ? { ...p, price: data.price }
            : p
        )
      );
    };

    const handleProductAdded = (product) => {
      setProducts((prev) => [...prev, product]);
    };

    const handleProductDeleted = (data) => {
      setProducts((prev) =>
        prev.filter((p) => String(p._id) !== String(data.productId))
      );
    };

    socket.on("product:stockUpdated", handleStockUpdated);
    socket.on("product:priceUpdated", handlePriceUpdated);
    socket.on("product:added", handleProductAdded);
    socket.on("product:deleted", handleProductDeleted);

    return () => {
      socket.off("product:stockUpdated", handleStockUpdated);
      socket.off("product:priceUpdated", handlePriceUpdated);
      socket.off("product:added", handleProductAdded);
      socket.off("product:deleted", handleProductDeleted);
    };
  }, [socket]);

  const availableCategories = useMemo(() => {
    if (categoryCounts.length) return categoryCounts;
    return CATEGORY_META.map((entry) => ({ name: entry.key, count: 0 }));
  }, [categoryCounts]);

  const activeFilters = useMemo(() => {
    const chips = [];
    if (debouncedSearch) chips.push({ key: "search", label: `Search: ${debouncedSearch}` });
    selectedCategories.forEach((cat) => chips.push({ key: cat, label: cat }));
    if (minPrice || maxPrice) chips.push({ key: "price", label: `₹${minPrice || 0} - ₹${maxPrice || "max"}` });
    if (rating) chips.push({ key: "rating", label: `${rating}+ stars` });
    if (featured) chips.push({ key: "featured", label: "Featured" });
    if (stock) chips.push({ key: "stock", label: stock === "in" ? "In stock" : "Out of stock" });
    if (newArrival) chips.push({ key: "newArrival", label: "New arrivals" });
    return chips;
  }, [debouncedSearch, selectedCategories, minPrice, maxPrice, rating, featured, stock, newArrival]);

  const handleCategoryToggle = (name) => {
    setPage(1);
    setSelectedCategories((prev) =>
      prev.includes(name) ? prev.filter((i) => i !== name) : [...prev, name]
    );
  };

  const handleClearFilters = () => {
    setSearchValue("");
    setSelectedCategories([]);
    setMinPrice("");
    setMaxPrice("");
    setRating("");
    setFeatured(false);
    setStock("");
    setNewArrival(false);
    setSort("newest");
    setPage(1);
  };

  const handleRemoveChip = (chipKey) => {
    if (chipKey === "search") setSearchValue("");
    else if (chipKey === "price") { setMinPrice(""); setMaxPrice(""); }
    else if (chipKey === "rating") setRating("");
    else if (chipKey === "featured") setFeatured(false);
    else if (chipKey === "stock") setStock("");
    else if (chipKey === "newArrival") setNewArrival(false);
    else setSelectedCategories((prev) => prev.filter((i) => i !== chipKey));
    setPage(1);
  };

  const handleCategoryCardClick = (key) => {
    setSelectedCategories([key]);
    setPage(1);
    if (productsRef.current) {
      productsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const sharedFilterProps = {
    categories: availableCategories,
    selectedCategories,
    minPrice,
    maxPrice,
    rating,
    featured,
    stock,
    newArrival,
    priceBounds: PRICE_BOUNDS,
    onCategoryChange: handleCategoryToggle,
    onPriceChange: (type, value) => {
      setPage(1);
      if (type === "min") setMinPrice(value);
      if (type === "max") setMaxPrice(value);
    },
    onRatingChange: (value) => { setPage(1); setRating(value); },
    onFeaturedChange: (value) => { setPage(1); setFeatured(value); },
    onStockChange: (value) => { setPage(1); setStock(value); },
    onNewArrivalChange: (value) => { setPage(1); setNewArrival(value); },
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Navbar />

      <main className="mx-auto w-full max-w-7xl flex-1 space-y-10 px-4 pt-36 pb-10 sm:px-6 lg:px-8 md:pt-28">

        {/* ── Hero ── */}
        <section className="rounded-[32px] border border-slate-200/60 bg-white/90 p-8 shadow-xl shadow-slate-200/60">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                Product Discovery
              </p>
              <h1 className="mt-3 text-3xl font-semibold text-slate-900 sm:text-4xl">
                Find components that power your next build.
              </h1>
              <p className="mt-3 max-w-2xl text-sm text-slate-600">
                Search across microcontrollers, sensors, and boards, then refine with smart filters.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate("/shop#categories")}
              className="inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/30 transition hover:-translate-y-0.5 hover:bg-slate-800"
            >
              Shop by Category
            </button>
          </div>
        </section>

        {/* ── Categories ── */}
        <section ref={categoriesRef} id="categories" className="space-y-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">Browse by Category</h2>
              <p className="mt-1 text-sm text-slate-500">Tap a category to instantly filter products below.</p>
            </div>
            {selectedCategories.length > 0 && (
              <button
                type="button"
                onClick={() => setSelectedCategories([])}
                className="text-xs font-semibold text-slate-500 transition hover:text-slate-700"
              >
                Clear category
              </button>
            )}
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {CATEGORY_META.map((cat) => {
              const countEntry = categoryCounts.find((i) => i.name === cat.key);
              return (
                <CategoryCard
                  key={cat.key}
                  title={cat.title}
                  description={cat.description}
                  icon={cat.icon}
                  count={countEntry?.count}
                  active={selectedCategories.includes(cat.key)}
                  onClick={() => handleCategoryCardClick(cat.key)}
                />
              );
            })}
          </div>
        </section>

        <div className="flex items-center justify-between gap-3 lg:hidden">
          <button
            type="button"
            onClick={() => setIsFilterOpen(true)}
            className="inline-flex shrink-0 items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-sm"
          >
            <FiFilter className="h-4 w-4" /> Filters
          </button>
          <SortDropdown value={sort} onChange={setSort} />
        </div>

        {/* ── Sidebar + Product grid ── */}
        <section className="grid gap-8 lg:grid-cols-[1fr_3fr] lg:items-start">

          {/* Desktop filter sidebar — sticky below the search bar */}
          <aside className="hidden rounded-3xl border border-slate-200/70 bg-white p-6 shadow-lg shadow-slate-200/60 lg:block lg:sticky lg:top-56">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-slate-900">Filters</h3>
              {activeFilters.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="text-xs font-semibold text-slate-500 transition hover:text-slate-700"
                >
                  Clear all
                </button>
              )}
            </div>
            <div className="mt-6">
              <FilterSidebar {...sharedFilterProps} />
            </div>
          </aside>

          {/* Right: result count + products + pagination */}
          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200/70 bg-white p-5 shadow-lg shadow-slate-200/60">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-700">Sort products</p>
                <SortDropdown value={sort} onChange={setSort} />
              </div>
              {activeFilters.length > 0 && (
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  {activeFilters.map((chip) => (
                    <span
                      key={chip.key}
                      className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600"
                    >
                      {chip.label}
                      <button
                        type="button"
                        onClick={() => handleRemoveChip(chip.key)}
                        className="rounded-full p-0.5 text-slate-400 transition hover:text-slate-600"
                      >
                        <FiX className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                  <button
                    type="button"
                    onClick={handleClearFilters}
                    className="text-xs font-semibold text-slate-500 transition hover:text-slate-700"
                  >
                    Clear all
                  </button>
                </div>
              )}
            </div>
            <div ref={productsRef} className="flex items-center justify-between text-sm text-slate-500">
              <span>
                Showing {pagination.filteredCount || 0} of {pagination.total || 0} products
              </span>
              {debouncedSearch && <span>Results for "{debouncedSearch}"</span>}
            </div>

            <ProductGrid products={products} isLoading={isLoading} />

            {pagination.pages > 1 && (
              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="text-xs font-semibold text-slate-600">
                  Page {pagination.page} of {pagination.pages}
                </span>
                <button
                  type="button"
                  disabled={page >= pagination.pages}
                  onClick={() => setPage((p) => Math.min(p + 1, pagination.pages))}
                  className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* ── Mobile filter drawer ── */}
      {isFilterOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <button
            type="button"
            onClick={() => setIsFilterOpen(false)}
            className="absolute inset-0 bg-slate-900/40"
          />
          <div className="relative ml-auto h-full w-[85%] max-w-sm overflow-y-auto bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-slate-900">Filters</h3>
              <button
                type="button"
                onClick={() => setIsFilterOpen(false)}
                className="rounded-full border border-slate-200 p-2 text-slate-600"
              >
                <FiX className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-6">
              <FilterSidebar {...sharedFilterProps} />
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default Shop;