import { useAuth } from "../../context/AuthContext";
import { Bell } from "lucide-react";

function AdminNavbar() {
  const { user } = useAuth();

  const initials = user?.fullName
    ? user.fullName
        .split(" ")
        .map((p) => p[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "A";

  return (
    <header
      className="sticky top-0 z-20 flex h-[56px] items-center justify-between border-b border-[var(--admin-border)] bg-white px-8 shadow-[0_1px_3px_rgba(0,0,0,0.06)] transition-all"
    >
      <div className="pl-12 lg:pl-0">
        <h2 className="text-sm font-semibold text-[var(--admin-text-primary)]">Admin Panel</h2>
        <p className="text-xs text-[var(--admin-text-secondary)]">Manage your store</p>
      </div>

      <div className="flex items-center gap-4">
        <button
          type="button"
          className="relative rounded-md p-[7px] text-[var(--admin-text-secondary)] bg-transparent border border-[var(--admin-border)] transition hover:bg-[var(--admin-surface-2)] hover:border-[var(--admin-border-strong)]"
        >
          <Bell className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
              {initials}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-[var(--admin-text-primary)]">{user?.fullName}</p>
            <p className="text-xs text-[var(--admin-text-secondary)]">{user?.role}</p>
          </div>
        </div>
      </div>
    </header>
  );
}

export default AdminNavbar;
