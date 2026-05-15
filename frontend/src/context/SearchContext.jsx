import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../utils/api";

const SearchContext = createContext(null);
const SEARCH_STORAGE_KEY = "recentSearches";

export function SearchProvider({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [recentSearches, setRecentSearches] = useState(() => {
    const stored = localStorage.getItem(SEARCH_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  });
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const skipUrlSyncRef = useRef(false);
  const searchValueRef = useRef("");

  useEffect(() => {
    searchValueRef.current = searchValue;
  }, [searchValue]);

  useEffect(() => {
    if (location.pathname !== "/shop") {
      return;
    }
    if (skipUrlSyncRef.current) {
      skipUrlSyncRef.current = false;
      return;
    }
    const params = new URLSearchParams(location.search);
    const urlSearch = params.get("search") || "";
    if (urlSearch && urlSearch !== searchValueRef.current) {
      setSearchValue(urlSearch);
    }
  }, [location.pathname, location.search]);

  useEffect(() => {
    if (!searchValue || searchValue.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      try {
        const response = await api.get("/api/products", {
          params: { search: searchValue.trim(), suggest: "true", limit: 5 },
        });
        setSuggestions(response.data.products || []);
      } catch {
        setSuggestions([]);
      }
    }, 250);

    return () => clearTimeout(timeoutId);
  }, [searchValue]);

  const updateRecentSearches = useCallback((term) => {
    setRecentSearches((current) => {
      const updated = [term, ...current.filter((item) => item !== term)].slice(0, 6);
      localStorage.setItem(SEARCH_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const applySearchSelection = useCallback(
    (value) => {
      const trimmed = value.trim();
      if (!trimmed) {
        return;
      }
      updateRecentSearches(trimmed);
      setSearchValue(trimmed);
      setIsSearchOpen(false);
      navigate(`/shop?search=${encodeURIComponent(trimmed)}`);
    },
    [navigate, updateRecentSearches]
  );

  const handleSearchSubmit = useCallback(() => {
    applySearchSelection(searchValue);
  }, [applySearchSelection, searchValue]);

  const handleSelectSuggestion = useCallback(
    (item) => {
      applySearchSelection(item.productName);
    },
    [applySearchSelection]
  );

  const handleSelectRecent = useCallback(
    (value) => {
      applySearchSelection(value);
    },
    [applySearchSelection]
  );

  const clearSearch = useCallback(() => {
    skipUrlSyncRef.current = true;
    setSearchValue("");
    setIsSearchOpen(false);
    if (location.pathname === "/shop") {
      navigate("/shop");
    }
  }, [location.pathname, navigate]);

  const value = useMemo(
    () => ({
      searchValue,
      setSearchValue,
      suggestions,
      recentSearches,
      isSearchOpen,
      setIsSearchOpen,
      handleSearchSubmit,
      handleSelectSuggestion,
      handleSelectRecent,
      clearSearch,
    }),
    [
      searchValue,
      suggestions,
      recentSearches,
      isSearchOpen,
      handleSearchSubmit,
      handleSelectSuggestion,
      handleSelectRecent,
      clearSearch,
    ]
  );

  return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>;
}

export function useSearch() {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error("useSearch must be used within SearchProvider");
  }

  return context;
}
