import { useState } from "react";
import { FiX, FiAlertTriangle } from "react-icons/fi";

const defaultReasons = [
  "Ordered by mistake",
  "Found cheaper elsewhere",
  "Delivery taking too long",
  "Other",
];

function CancelOrderModal({ isOpen, onClose, onConfirm, isSubmitting }) {
  const [reason, setReason] = useState(defaultReasons[0]);

  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);

  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      setReason(defaultReasons[0]);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4 dark:bg-black/60">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white dark:bg-slate-900 shadow-2xl dark:bg-slate-800">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-white/10">
          <div className="flex items-center gap-2 text-slate-900 dark:text-white">
            <FiAlertTriangle className="h-5 w-5 text-rose-500" />
            <h3 className="text-lg font-semibold">Cancel Order</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-slate-500 transition hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/10"
            aria-label="Close"
          >
            <FiX className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4 px-5 py-5">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Are you sure you want to cancel this order? This action cannot be undone.
          </p>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Cancellation Reason
            </label>
            <select
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white dark:bg-slate-900 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 dark:border-white/10 dark:bg-slate-700 dark:text-white"
            >
              {defaultReasons.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-slate-100 px-5 py-4 dark:border-white/10">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5"
          >
            Keep Order
          </button>
          <button
            type="button"
            onClick={() => onConfirm(reason)}
            disabled={isSubmitting}
            className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-slate-900 dark:text-white shadow-lg shadow-rose-600/30 transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Cancelling..." : "Confirm Cancel"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CancelOrderModal;
