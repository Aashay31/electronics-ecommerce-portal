function QuickActionButtons({ actions = [], onAction, compact = false }) {
  if (!actions.length) {
    return null;
  }

  return (
    <div className={`flex flex-wrap gap-2 ${compact ? "mt-2" : "mt-3"}`}>
      {actions.map((action) => {
        const variantClasses =
          action.variant === "primary"
            ? "border-cyan-200 dark:border-cyan-400/40 bg-cyan-50 dark:bg-cyan-400/15 text-cyan-700 dark:text-cyan-100 hover:bg-cyan-100 dark:hover:bg-cyan-400/25"
            : action.variant === "danger"
              ? "border-rose-200 dark:border-rose-400/40 bg-rose-50 dark:bg-rose-400/10 text-rose-700 dark:text-rose-100 hover:bg-rose-100 dark:hover:bg-rose-400/20"
              : "border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10";

        return (
          <button
            key={`${action.action}-${action.value || action.label}`}
            type="button"
            onClick={() => onAction(action)}
            className={`rounded-full border px-3 py-2 text-xs font-semibold transition ${variantClasses}`}
          >
            {action.label}
          </button>
        );
      })}
    </div>
  );
}

export default QuickActionButtons;
