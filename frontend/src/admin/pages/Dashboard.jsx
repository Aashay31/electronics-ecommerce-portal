import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  Package,
  Users,
  ShoppingCart,
  IndianRupee,
  Clock,
  AlertTriangle,
  Star,
  MessageSquare,
  ShieldAlert,
  Activity,
} from "lucide-react";
import api from "../../utils/api";
import StatsCard from "../components/StatsCard";
import InventoryAlerts from "../components/InventoryAlerts";
import { useSocket } from "../../context/SocketContext";

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const socket = useSocket();

  useEffect(() => {
    if (!socket) return;

    const handleStatsUpdated = (newStats) => {
      setStats(newStats);
    };

    socket.on("dashboard:statsUpdated", handleStatsUpdated);

    return () => {
      socket.off("dashboard:statsUpdated", handleStatsUpdated);
    };
  }, [socket]);

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
        <div className="h-8 w-48 rounded bg-[var(--admin-border)]" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 rounded-lg bg-[var(--admin-border)]" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[20px] font-semibold tracking-[-0.01em] text-[var(--admin-text-primary)]">Dashboard Overview</h1>
        <p className="mt-1 text-[13px] text-[var(--admin-text-secondary)]">Welcome to your admin panel.</p>
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
          title="Failed Payments"
          value={stats?.failedPayments || 0}
          icon={AlertTriangle}
          color="rose"
        />
        <StatsCard
          title="Refunded Payments"
          value={stats?.refundedPayments || 0}
          icon={AlertTriangle}
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
          color="amber"
        />
        <StatsCard
          title="Out of Stock Items"
          value={stats?.outOfStockProducts || 0}
          icon={AlertTriangle}
          color="rose"
        />
        <StatsCard
          title="Total Users"
          value={stats?.totalUsers || 0}
          icon={Users}
          color="violet"
        />
        <StatsCard
          title="Total Reviews"
          value={stats?.totalReviews || 0}
          icon={MessageSquare}
          color="indigo"
        />
        <StatsCard
          title="Average Rating"
          value={stats?.averageRating ? stats.averageRating.toFixed(1) : "0.0"}
          icon={Star}
          color="amber"
        />
        <StatsCard
          title="Critical Stock"
          value={stats?.criticalStockProducts || 0}
          icon={ShieldAlert}
          color="rose"
        />
        <StatsCard
          title="Inventory Health"
          value={`${stats?.inventoryHealth ?? 100}%`}
          icon={Activity}
          color={stats?.inventoryHealth >= 80 ? "emerald" : stats?.inventoryHealth >= 50 ? "amber" : "rose"}
        />
      </div>

      {/* Inventory Alerts Widget */}
      <div>
        <h2 className="text-[17px] font-semibold tracking-[-0.01em] text-[var(--admin-text-primary)] mb-4">Inventory Health</h2>
        <InventoryAlerts />
      </div>
    </div>
  );
}

export default Dashboard;
