function RatingBreakdown({ stats }) {
  const total = stats?.totalReviews || 0;
  const breakdown = stats?.ratingBreakdown || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

  return (
    <div className="space-y-3">
      {[5, 4, 3, 2, 1].map((rating) => {
        const count = breakdown[rating] || 0;
        const percent = total ? Math.round((count / total) * 100) : 0;

        return (
          <div key={rating} className="flex items-center gap-3">
            <div className="w-12 text-sm font-semibold text-slate-600 dark:text-slate-400 dark:text-slate-500">{rating} star</div>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800 dark:bg-white/10">
              <div
                className="h-full rounded-full bg-amber-500 transition-all"
                style={{ width: `${percent}%` }}
              />
            </div>
            <div className="w-12 text-right text-xs font-semibold text-slate-500 dark:text-slate-400">
              {count}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default RatingBreakdown;
