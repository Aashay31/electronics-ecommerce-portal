import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  AlertTriangle,
  Package,
  ShieldAlert,
  Activity,
  TrendingDown,
  CheckCircle,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import api from "../../utils/api";
import { resolveImageUrl } from "../../utils/imageUrl";

function InventoryAlerts() {
  const [inventory, setInventory] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchAlerts = async (showToast = false) => {
    try {
      if (showToast) setIsRefreshing(true);
      const response = await api.get("/api/admin/inventory/alerts");
      setInventory(response.data.inventory);
      if (showToast) toast.success("Inventory data refreshed");
    } catch {
      if (showToast) toast.error("Failed to refresh inventory data");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const response = await api.get("/api/admin/inventory/alerts");
        if (!cancelled) setInventory(response.data.inventory);
      } catch {
        // silent on initial load
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (isLoading) {
    return (
      <div className="rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface)] p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        <div className="animate-pulse space-y-4">
          <div className="h-5 w-40 rounded bg-[var(--admin-border)]" />
          <div className="h-8 w-full rounded bg-[var(--admin-border)]" />
          <div className="grid grid-cols-4 gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 rounded bg-[var(--admin-border)]" />
            ))}
          </div>
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-14 rounded bg-[var(--admin-border)]" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!inventory) return null;

  const {
    totalProducts,
    outOfStockCount,
    lowStockCount,
    criticalStockCount,
    inventoryHealth,
    lowStockProducts,
    outOfStockProducts,
    nearThresholdProducts,
    frequentlyLowStock,
  } = inventory;

  const allIssueProducts = [...outOfStockProducts, ...lowStockProducts];
  const hasIssues = allIssueProducts.length > 0;

  const healthColor =
    inventoryHealth >= 80
      ? "#16A34A"
      : inventoryHealth >= 50
        ? "#D97706"
        : "#DC2626";
  const healthBg =
    inventoryHealth >= 80
      ? "rgba(22,163,106,0.08)"
      : inventoryHealth >= 50
        ? "rgba(217,119,6,0.08)"
        : "rgba(220,38,38,0.08)";
  const healthLabel =
    inventoryHealth >= 80
      ? "Healthy"
      : inventoryHealth >= 50
        ? "Needs Attention"
        : "Critical";

  const getStockBadge = (stock) => {
    if (stock <= 0) {
      return (
        <span
          className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide"
          style={{ backgroundColor: "#7F1D1D", color: "#FEE2E2" }}
        >
          Out of Stock
        </span>
      );
    }
    if (stock <= 2) {
      return (
        <span
          className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide animate-pulse"
          style={{ backgroundColor: "#DC2626", color: "#ffffff" }}
        >
          ⚠ Critical
        </span>
      );
    }
    return (
      <span
        className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide"
        style={{ backgroundColor: "#F59E0B", color: "#ffffff" }}
      >
        Low Stock
      </span>
    );
  };

  return (
    <div className="rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface)] shadow-[0_1px_2px_rgba(0,0,0,0.04)] overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center justify-between px-6 py-4 border-b border-[var(--admin-border)]"
        style={{ borderTop: `3px solid ${healthColor}` }}
      >
        <div className="flex items-center gap-3">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-lg"
            style={{ backgroundColor: healthBg }}
          >
            <Activity className="h-4.5 w-4.5" style={{ color: healthColor }} />
          </div>
          <div>
            <h3 className="text-[15px] font-semibold text-[var(--admin-text-primary)] flex items-center gap-2">
              Inventory Alerts
              {hasIssues && (
                <span
                  className="inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-bold text-white"
                  style={{ backgroundColor: criticalStockCount > 0 ? "#DC2626" : "#D97706" }}
                >
                  {allIssueProducts.length}
                </span>
              )}
            </h3>
            <p className="text-[12px] text-[var(--admin-text-secondary)]">
              Real-time inventory health monitoring
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => fetchAlerts(true)}
          disabled={isRefreshing}
          className="flex items-center gap-1.5 rounded-md border border-[var(--admin-border)] px-3 py-1.5 text-[12px] font-medium text-[var(--admin-text-secondary)] transition hover:bg-[var(--admin-bg)] hover:text-[var(--admin-text-primary)] disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      <div className="p-6 space-y-5">
        {/* Health Bar */}
        <div
          className="rounded-xl p-4"
          style={{ backgroundColor: healthBg }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[12px] font-semibold uppercase tracking-wider" style={{ color: healthColor }}>
              Inventory Health
            </span>
            <span className="text-[12px] font-bold" style={{ color: healthColor }}>
              {healthLabel}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2.5 rounded-full overflow-hidden" style={{ backgroundColor: "rgba(0,0,0,0.08)" }}>
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{ width: `${inventoryHealth}%`, backgroundColor: healthColor }}
              />
            </div>
            <span className="text-[18px] font-extrabold tabular-nums" style={{ color: healthColor }}>
              {inventoryHealth}%
            </span>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-3">
          <div className="rounded-lg border border-[var(--admin-border)] bg-[var(--admin-bg)] p-3 text-center">
            <Package className="h-4 w-4 mx-auto text-[#2563EB] mb-1" />
            <div className="text-[16px] font-bold text-[var(--admin-text-primary)]">{totalProducts}</div>
            <div className="text-[10px] font-medium uppercase tracking-wider text-[var(--admin-text-secondary)]">Total</div>
          </div>
          <div className="rounded-lg border border-[var(--admin-border)] p-3 text-center" style={{ backgroundColor: lowStockCount > 0 ? "rgba(217,119,6,0.06)" : "var(--admin-bg)" }}>
            <TrendingDown className="h-4 w-4 mx-auto mb-1" style={{ color: "#D97706" }} />
            <div className="text-[16px] font-bold" style={{ color: lowStockCount > 0 ? "#D97706" : "var(--admin-text-primary)" }}>{lowStockCount}</div>
            <div className="text-[10px] font-medium uppercase tracking-wider text-[var(--admin-text-secondary)]">Low Stock</div>
          </div>
          <div className="rounded-lg border border-[var(--admin-border)] p-3 text-center" style={{ backgroundColor: outOfStockCount > 0 ? "rgba(220,38,38,0.06)" : "var(--admin-bg)" }}>
            <AlertTriangle className="h-4 w-4 mx-auto mb-1" style={{ color: "#DC2626" }} />
            <div className="text-[16px] font-bold" style={{ color: outOfStockCount > 0 ? "#DC2626" : "var(--admin-text-primary)" }}>{outOfStockCount}</div>
            <div className="text-[10px] font-medium uppercase tracking-wider text-[var(--admin-text-secondary)]">Out of Stock</div>
          </div>
          <div className="rounded-lg border border-[var(--admin-border)] p-3 text-center" style={{ backgroundColor: criticalStockCount > 0 ? "rgba(220,38,38,0.06)" : "var(--admin-bg)" }}>
            <ShieldAlert className="h-4 w-4 mx-auto mb-1" style={{ color: criticalStockCount > 0 ? "#DC2626" : "#9ca3af" }} />
            <div className="text-[16px] font-bold" style={{ color: criticalStockCount > 0 ? "#DC2626" : "var(--admin-text-primary)" }}>{criticalStockCount}</div>
            <div className="text-[10px] font-medium uppercase tracking-wider text-[var(--admin-text-secondary)]">Critical</div>
          </div>
        </div>

        {/* Product List */}
        {hasIssues ? (
          <div>
            <h4 className="text-[13px] font-semibold text-[var(--admin-text-primary)] mb-3 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-[#D97706]" />
              Products Requiring Restocking
            </h4>
            <div className="max-h-[320px] overflow-y-auto rounded-lg border border-[var(--admin-border)] divide-y divide-[var(--admin-border)]">
              {allIssueProducts.slice(0, 10).map((product) => (
                <div
                  key={product._id}
                  className="flex items-center gap-3 px-4 py-3 transition hover:bg-[var(--admin-bg)]"
                >
                  <img
                    src={resolveImageUrl(product.imageUrl)}
                    alt={product.productName}
                    className="h-10 w-10 rounded-md object-cover border border-[var(--admin-border)] flex-shrink-0"
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/40x40?text=N/A";
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-[var(--admin-text-primary)] truncate">
                      {product.productName}
                    </p>
                    <p className="text-[11px] text-[var(--admin-text-secondary)]">
                      {product.category} · Threshold: {product.lowStockThreshold}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    {getStockBadge(product.stock)}
                    <a
                      href="/admin/products"
                      className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-[#2563EB] transition hover:bg-[rgba(37,99,235,0.08)]"
                    >
                      Restock
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              ))}
              {allIssueProducts.length > 10 && (
                <div className="px-4 py-2.5 text-center">
                  <a
                    href="/admin/products"
                    className="text-[12px] font-medium text-[#2563EB] hover:underline"
                  >
                    View all {allIssueProducts.length} products →
                  </a>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <CheckCircle className="h-10 w-10 mx-auto mb-3" style={{ color: "#16A34A" }} />
            <p className="text-[14px] font-semibold text-[var(--admin-text-primary)]">
              All products are well-stocked!
            </p>
            <p className="text-[12px] text-[var(--admin-text-secondary)] mt-1">
              No products are below their restocking threshold.
            </p>
          </div>
        )}

        {/* Near Threshold Warning */}
        {nearThresholdProducts && nearThresholdProducts.length > 0 && (
          <div>
            <h4 className="text-[13px] font-semibold text-[var(--admin-text-primary)] mb-2 flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-[#D97706]" />
              Approaching Threshold
              <span className="text-[11px] font-normal text-[var(--admin-text-secondary)]">
                (within 2 units)
              </span>
            </h4>
            <div className="rounded-lg border border-[var(--admin-border)] divide-y divide-[var(--admin-border)]">
              {nearThresholdProducts.slice(0, 5).map((product) => (
                <div
                  key={product._id}
                  className="flex items-center justify-between px-4 py-2.5"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-[13px] font-medium text-[var(--admin-text-primary)] truncate">
                      {product.productName}
                    </span>
                    <span className="text-[11px] text-[var(--admin-text-secondary)]">
                      {product.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-[12px] font-bold text-[#D97706]">
                      {product.stock}
                    </span>
                    <span className="text-[11px] text-[var(--admin-text-secondary)]">
                      / {product.lowStockThreshold}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Frequently Low Stock */}
        {frequentlyLowStock && frequentlyLowStock.length > 0 && (
          <div>
            <h4 className="text-[13px] font-semibold text-[var(--admin-text-primary)] mb-2 flex items-center gap-2">
              <Activity className="h-4 w-4 text-[#6366F1]" />
              Recently Flagged Products
            </h4>
            <div className="flex flex-wrap gap-2">
              {frequentlyLowStock.map((product) => (
                <span
                  key={product._id}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[var(--admin-border)] bg-[var(--admin-bg)] px-3 py-1.5 text-[11px] font-medium text-[var(--admin-text-secondary)]"
                >
                  {product.productName}
                  <span className="font-bold" style={{ color: product.stock <= 2 ? "#DC2626" : "#D97706" }}>
                    ({product.stock})
                  </span>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default InventoryAlerts;
