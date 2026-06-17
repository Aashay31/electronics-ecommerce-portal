import { AlertTriangle, X } from "lucide-react";

function ConfirmModal({ open, title, message, onConfirm, onCancel, danger = false }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50">
      <div className="mx-4 w-full max-w-md rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface)] p-[24px] shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        <div className="flex items-start gap-4">
          <div
            className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${
              danger ? "bg-rose-50 text-rose-500" : "bg-amber-50 text-amber-500"
            }`}
          >
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h3 className="text-[20px] font-semibold text-[var(--admin-text-primary)] tracking-[-0.01em]">{title}</h3>
            <p className="mt-1 text-[13px] text-[var(--admin-text-secondary)]">{message}</p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md p-[7px] bg-transparent border border-[var(--admin-border)] text-[var(--admin-text-secondary)] transition hover:bg-[var(--admin-surface-2)] hover:border-[var(--admin-border-strong)]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md bg-[var(--admin-surface)] text-[var(--admin-text-primary)] border border-[var(--admin-border-strong)] text-[14px] font-medium px-[18px] py-[8px] transition hover:bg-[var(--admin-surface-2)]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`rounded-md text-[14px] font-medium px-[18px] py-[8px] text-white transition ${
              danger
                ? "bg-[var(--admin-danger)]"
                : "bg-[var(--admin-accent)] hover:bg-[var(--admin-accent-hover)]"
            }`}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;
