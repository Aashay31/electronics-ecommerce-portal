import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";

export default function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`fixed left-0 right-0 top-0 z-50 transition-all duration-500 ${
        scrolled
          ? "border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-xl shadow-lg shadow-black/20"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 no-underline">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/20">
            <span className="text-sm font-bold text-indigo-400 tracking-wide">EM</span>
          </div>
          <span className="text-lg font-semibold text-white tracking-tight">
            Electro<span className="text-indigo-400">Mart</span>
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden items-center gap-8 md:flex">
          <a href="#features" className="text-sm font-medium text-slate-400 transition-colors hover:text-white no-underline">
            Features
          </a>
          <a href="#how-it-works" className="text-sm font-medium text-slate-400 transition-colors hover:text-white no-underline">
            How It Works
          </a>
          <Link
            to="/login"
            className="text-sm font-medium text-slate-400 transition-colors hover:text-white no-underline"
          >
            Login
          </Link>
          <Link
            to="/signup"
            className="btn-shimmer rounded-full bg-indigo-500 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-indigo-400 hover:shadow-lg hover:shadow-indigo-500/25 no-underline"
          >
            Get Started
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button
          className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 transition-colors hover:text-white md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="border-t border-white/5 bg-[#0a0a0f]/95 backdrop-blur-xl px-6 py-4 md:hidden"
        >
          <div className="flex flex-col gap-3">
            <a
              href="#features"
              className="rounded-xl px-3 py-2.5 text-sm font-medium text-slate-400 transition hover:bg-white/5 hover:text-white no-underline"
              onClick={() => setMobileOpen(false)}
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="rounded-xl px-3 py-2.5 text-sm font-medium text-slate-400 transition hover:bg-white/5 hover:text-white no-underline"
              onClick={() => setMobileOpen(false)}
            >
              How It Works
            </a>
            <Link
              to="/login"
              className="rounded-xl px-3 py-2.5 text-sm font-medium text-slate-400 transition hover:bg-white/5 hover:text-white no-underline"
              onClick={() => setMobileOpen(false)}
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="mt-1 rounded-xl bg-indigo-500 px-3 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-indigo-400 no-underline"
              onClick={() => setMobileOpen(false)}
            >
              Get Started
            </Link>
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
}
