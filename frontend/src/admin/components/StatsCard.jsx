function StatsCard({ title, value, icon: Icon, trend, color = "indigo" }) {
  const colorMap = {
    indigo: "bg-indigo-50 text-indigo-600",
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    rose: "bg-rose-50 text-rose-600",
    sky: "bg-sky-50 text-sky-600",
    violet: "bg-violet-50 text-violet-600",
  };

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            {title}
          </p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
          {trend !== undefined && (
            <p
              className={`mt-1 text-xs font-semibold ${
                trend >= 0 ? "text-emerald-500" : "text-rose-500"
              }`}
            >
              {trend >= 0 ? "↑" : "↓"} {Math.abs(trend)}%
            </p>
          )}
        </div>
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${
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
