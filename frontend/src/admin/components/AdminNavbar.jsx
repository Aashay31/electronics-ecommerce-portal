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
      className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/80 px-6 backdrop-blur transition-all"
    >
      <div className="pl-12 lg:pl-0">
        <h2 className="text-sm font-semibold text-slate-900">Admin Panel</h2>
        <p className="text-xs text-slate-500">Manage your store</p>
      </div>

      <div className="flex items-center gap-4">
        <button
          type="button"
          className="relative rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
        >
          <Bell className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
            {user?.profileImage ? (
              <img
                src={user.profileImage}
                alt={user.fullName}
                className="h-9 w-9 rounded-full object-cover"
              />
            ) : (
              initials
            )}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-slate-900">{user?.fullName}</p>
            <p className="text-xs text-slate-500">{user?.role}</p>
          </div>
        </div>
      </div>
    </header>
  );
}

export default AdminNavbar;
