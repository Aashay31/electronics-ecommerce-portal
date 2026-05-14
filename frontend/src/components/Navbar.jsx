import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiShoppingCart, FiUser } from "react-icons/fi";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useProfile } from "../context/ProfileContext";

function Navbar() {
  const { itemCount } = useCart();
  const { isAuthenticated, user, logout } = useAuth();
  const { profile } = useProfile();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
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
    <nav className="navbar">
      <Link to="/" className="text-lg font-semibold">
        ElectroMart
      </Link>

      <div>
        <Link to="/home">Shop</Link>
        {!isAuthenticated && (
          <>
            <Link to="/login">Login</Link>
            <Link to="/signup">Register</Link>
          </>
        )}
        <Link to="/cart" className="relative inline-flex items-center">
          <FiShoppingCart className="h-5 w-5" />
          {itemCount > 0 && (
            <span className="absolute -right-2 -top-2 rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] font-semibold text-white">
              {itemCount}
            </span>
          )}
        </Link>
        {isAuthenticated && (
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setIsMenuOpen((open) => !open)}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-sm font-semibold text-white transition hover:bg-white/20"
            >
              {displayUser?.profileImage ? (
                <img
                  src={displayUser.profileImage}
                  alt={displayUser.fullName}
                  className="h-9 w-9 rounded-full object-cover"
                />
              ) : initials ? (
                initials
              ) : (
                <FiUser className="h-4 w-4" />
              )}
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
    </nav>
  );
}

export default Navbar;