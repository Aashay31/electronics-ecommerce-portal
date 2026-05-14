import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Package, Users, ShoppingCart, IndianRupee, Clock, AlertTriangle } from "lucide-react";
import api from "../../utils/api";
import StatsCard from "../components/StatsCard";

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get("/api/admin/stats");
        setStats(response.data.stats);
      } catch {
        toast.error("Failed to load dashboard statistics");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 rounded bg-slate-200" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 rounded-2xl bg-slate-200" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard Overview</h1>
        <p className="mt-1 text-sm text-slate-500">Welcome to your admin panel.</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <StatsCard
          title="Total Revenue"
          value={`₹${stats?.totalRevenue?.toLocaleString() || 0}`}
          icon={IndianRupee}
          color="emerald"
        />
        <StatsCard
          title="Total Orders"
          value={stats?.totalOrders || 0}
          icon={ShoppingCart}
          color="indigo"
        />
        <StatsCard
          title="Pending Orders"
          value={stats?.pendingOrders || 0}
          icon={Clock}
          color="amber"
        />
        <StatsCard
          title="Total Products"
          value={stats?.totalProducts || 0}
          icon={Package}
          color="sky"
        />
        <StatsCard
          title="Low Stock Items"
          value={stats?.lowStockProducts || 0}
          icon={AlertTriangle}
          color="rose"
        />
        <StatsCard
          title="Total Users"
          value={stats?.totalUsers || 0}
          icon={Users}
          color="violet"
        />
      </div>
    </div>
  );
}

export default Dashboard;
