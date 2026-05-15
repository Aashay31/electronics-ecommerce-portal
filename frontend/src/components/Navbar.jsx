import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiShoppingCart, FiUser } from "react-icons/fi";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useProfile } from "../context/ProfileContext";
import { useSearch } from "../context/SearchContext";
import SearchBar from "./SearchBar";

function Navbar() {
  const { itemCount } = useCart();
  const { isAuthenticated, user, logout } = useAuth();
  const { profile } = useProfile();
  const {
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
  } = useSearch();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const searchRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const displayUser = profile || user;
  const initials = displayUser?.fullName
    ? displayUser.fullName
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "";

  return (
    <nav className="fixed left-0 right-0 top-0 z-50 bg-[#111] px-4 py-3 text-white shadow-md md:px-10 md:py-4">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-y-4">
        <Link to="/home" className="text-lg font-semibold text-white no-underline">
          ElectroMart
        </Link>

        {/* Links & Icons (Order 2 on mobile, 3 on desktop) */}
        <div className="order-2 flex items-center gap-4 md:order-3 md:gap-5">
          <Link to="/shop" className="text-sm font-medium text-white no-underline transition-colors hover:text-indigo-400 md:text-base">Shop</Link>
          {!isAuthenticated && (
            <>
              <Link to="/login" className="text-sm font-medium text-white no-underline transition-colors hover:text-indigo-400 md:text-base">Login</Link>
              <Link to="/signup" className="hidden text-sm font-medium text-white no-underline transition-colors hover:text-indigo-400 sm:inline-block md:text-base">Register</Link>
            </>
          )}
          <Link to="/cart" className="relative inline-flex items-center text-white transition-colors hover:text-indigo-400">
            <FiShoppingCart className="h-5 w-5" />
            {itemCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-semibold text-white">
                {itemCount}
              </span>
            )}
          </Link>
          {isAuthenticated && (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setIsMenuOpen((open) => !open)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-xs font-semibold text-white transition hover:bg-white/20 md:h-9 md:w-9 md:text-sm"
              >
                {initials ? initials : <FiUser className="h-4 w-4" />}
              </button>

              {isMenuOpen && (
                <div className="absolute right-0 z-50 mt-3 w-52 rounded-2xl border border-slate-200 bg-white p-2 text-sm text-slate-700 shadow-xl">
                  {displayUser?.role === "admin" && (
                    <Link
                      to="/admin"
                      className="block rounded-xl px-3 py-2 font-semibold text-indigo-600 no-underline transition hover:bg-indigo-50 hover:text-indigo-700"
                    >
                      Admin Dashboard
                    </Link>
                  )}
                  <Link
                    to="/profile"
                    className="block rounded-xl px-3 py-2 text-slate-700 no-underline transition hover:bg-slate-100 hover:text-slate-900"
                  >
                    View Profile
                  </Link>
                  <Link
                    to="/profile/edit"
                    className="block rounded-xl px-3 py-2 text-slate-700 no-underline transition hover:bg-slate-100 hover:text-slate-900"
                  >
                    Edit Profile
                  </Link>
                  <Link
                    to="/orders"
                    className="block rounded-xl px-3 py-2 text-slate-700 no-underline transition hover:bg-slate-100 hover:text-slate-900"
                  >
                    My Orders
                  </Link>
                  <Link
                    to="/wishlist"
                    className="block rounded-xl px-3 py-2 text-slate-700 no-underline transition hover:bg-slate-100 hover:text-slate-900"
                  >
                    Wishlist
                  </Link>
                  <Link
                    to="/addresses"
                    className="block rounded-xl px-3 py-2 text-slate-700 no-underline transition hover:bg-slate-100 hover:text-slate-900"
                  >
                    Saved Addresses
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="mt-1 w-full rounded-xl px-3 py-2 text-left font-semibold text-rose-500 transition hover:bg-rose-50"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Search Bar (Order 3 on mobile, 2 on desktop) */}
        {isAuthenticated && (
          <div className="order-3 w-full md:order-2 md:w-auto md:flex-1 md:px-8">
            <div ref={searchRef} className="mx-auto w-full max-w-xl">
              <SearchBar
                value={searchValue}
                onChange={(value) => {
                  setSearchValue(value);
                  setIsSearchOpen(true);
                }}
                onClear={clearSearch}
                onSubmit={handleSearchSubmit}
                suggestions={suggestions}
                recentSearches={recentSearches}
                onSelectSuggestion={handleSelectSuggestion}
                onSelectRecent={handleSelectRecent}
                isOpen={isSearchOpen}
              />
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;