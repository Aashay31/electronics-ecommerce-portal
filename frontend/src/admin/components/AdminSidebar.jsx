import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  MessageSquare,
  LogOut,
  ChevronLeft,
  Menu,
  X,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const links = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { to: "/admin/reviews", label: "Reviews", icon: MessageSquare },
  { to: "/admin/users", label: "Users", icon: Users },
];

function AdminSidebar({ collapsed, setCollapsed }) {
  const location = useLocation();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const isActive = (path) => {
    if (path === "/admin") return location.pathname === "/admin";
    return location.pathname.startsWith(path);
  };

  const sidebarContent = (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b border-slate-800 px-4">
        {!collapsed && (
          <Link to="/admin" className="text-lg font-bold text-white tracking-tight">
            ElectroMart
          </Link>
        )}
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className="hidden rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-800 hover:text-white lg:block"
        >
          <ChevronLeft
            className={`h-5 w-5 transition-transform ${collapsed ? "rotate-180" : ""}`}
          />
        </button>
        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-800 hover:text-white lg:hidden"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {links.map((link) => {
          const Icon = link.icon;
          const active = isActive(link.to);
          return (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                active
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              } ${collapsed ? "justify-center" : ""}`}
              title={collapsed ? link.label : undefined}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {!collapsed && <span>{link.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-slate-800 px-3 py-4 space-y-1">
        <button
          type="button"
          onClick={handleLogout}
          className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-400 transition hover:bg-rose-500/10 hover:text-rose-400 ${
            collapsed ? "justify-center" : ""
          }`}
          title={collapsed ? "Logout" : undefined}
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile hamburger */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-4 z-50 rounded-xl bg-slate-900 p-2 text-white shadow-lg lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 transition-transform duration-300 lg:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Desktop sidebar */}
      <aside
        className={`hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:flex lg:flex-col lg:bg-slate-900 lg:transition-all lg:duration-300 ${
          collapsed ? "lg:w-20" : "lg:w-64"
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
}

export default AdminSidebar;
