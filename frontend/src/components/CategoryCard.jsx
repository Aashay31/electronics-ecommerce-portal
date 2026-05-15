import { ArrowUpRight } from "lucide-react";

function CategoryCard({ title, description, icon: Icon, count, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative flex h-full flex-col rounded-3xl border p-5 text-left transition duration-300 hover:-translate-y-1 hover:shadow-xl sm:p-6 ${
        active
          ? "border-indigo-500 bg-indigo-50/70 shadow-lg"
          : "border-slate-200/80 bg-white shadow-md shadow-slate-200/60"
      }`}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-lg shadow-slate-900/30">
        {Icon ? <Icon className="h-6 w-6" /> : null}
      </div>
      <div className="mt-4 flex items-center justify-between gap-3">
        <h3 className="text-base font-semibold text-slate-900 sm:text-lg">{title}</h3>
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition group-hover:border-slate-300 group-hover:text-slate-700">
          <ArrowUpRight className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-2 text-sm text-slate-600">{description}</p>
      {typeof count === "number" && (
        <span className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
          {count} items
        </span>
      )}
    </button>
  );
}

export default CategoryCard;
