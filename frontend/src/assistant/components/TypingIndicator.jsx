function TypingIndicator({ label = "ElectroMart AI is thinking" }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 px-4 py-3">
      <div className="flex items-center gap-1">
        {[0, 1, 2].map((dot) => (
          <span
            key={dot}
            className="h-2 w-2 animate-bounce rounded-full bg-slate-500 dark:bg-slate-400"
            style={{ animationDelay: `${dot * 120}ms` }}
          />
        ))}
      </div>
      <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{label}</span>
    </div>
  );
}

export default TypingIndicator;
