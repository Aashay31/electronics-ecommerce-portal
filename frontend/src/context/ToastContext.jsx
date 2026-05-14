import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const ToastContext = createContext(null);

const DEFAULT_DURATION = 2400;

function ToastContainer({ toasts, onDismiss }) {
  const navigate = useNavigate();

  return (
    <div className="fixed right-5 top-5 z-50 flex flex-col gap-3">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 shadow-lg shadow-slate-200/70 transition"
        >
          <span>{toast.message}</span>
          {toast.action && (
            <button
              type="button"
              onClick={() => {
                navigate(toast.action.to);
                onDismiss(toast.id);
              }}
              className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
            >
              {toast.action.label}
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismissToast = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback((message, options = {}) => {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const { duration = DEFAULT_DURATION, action } = options;

    setToasts((current) => [...current, { id, message, action }]);

    window.setTimeout(() => {
      dismissToast(id);
    }, duration);
  }, [dismissToast]);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }

  return context;
}
