function TypingIndicator({ label = "ElectroMart AI is thinking" }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
      <div className="flex items-center gap-1">
        {[0, 1, 2].map((dot) => (
          <span
            key={dot}
            className="h-2 w-2 animate-bounce rounded-full bg-cyan-300"
            style={{ animationDelay: `${dot * 120}ms` }}
          />
        ))}
      </div>
      <span className="text-xs font-medium text-slate-300">{label}</span>
    </div>
  );
}

export default TypingIndicator;
