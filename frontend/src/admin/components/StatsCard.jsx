function StatsCard({ title, value, icon: Icon, trend, color = "indigo" }) {
  const colorMap = {
    indigo: "bg-[#EFF4FF] text-[#2563EB]",
    emerald: "bg-[#F0FDF4] text-[#16A34A]",
    amber: "bg-[#FFFBEB] text-[#D97706]",
    rose: "bg-[#FEF2F2] text-[#DC2626]",
    sky: "bg-[#ECFEFF] text-[#0891B2]",
    violet: "bg-[#ECFEFF] text-[#0891B2]",
  };

  const borderTopMap = {
    indigo: "#2563EB",
    emerald: "#16A34A",
    amber: "#D97706",
    rose: "#DC2626",
    sky: "#0891B2",
    violet: "#0891B2",
  };

  return (
    <div
      className="rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface)] px-[24px] py-[20px] shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
      style={{ borderTop: `3px solid ${borderTopMap[color] || "var(--admin-accent)"}` }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[12px] font-medium uppercase tracking-[0.05em] text-[var(--admin-text-secondary)]">
            {title}
          </p>
          <p className="mt-2 text-[28px] font-bold text-[var(--admin-text-primary)]">{value}</p>
          {trend !== undefined && (
            <p
              className={`mt-1 text-xs font-semibold ${
                trend >= 0 ? "text-[#16A34A]" : "text-[#DC2626]"
              }`}
            >
              {trend >= 0 ? "↑" : "↓"} {Math.abs(trend)}%
            </p>
          )}
        </div>
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-md ${
            colorMap[color] || colorMap.indigo
          }`}
        >
          {Icon && <Icon className="h-5 w-5" />}
        </div>
      </div>
    </div>
  );
}

export default StatsCard;
