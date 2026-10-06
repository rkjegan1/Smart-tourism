import { CheckCircleIcon, AlertCircleIcon } from './Icons';

export default function Toast({ toasts, onDismiss }) {
  if (toasts.length === 0) return null;
  return (
    <div className="fixed top-20 right-4 z-50 flex flex-col gap-3 max-w-sm">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`animate-toast-in flex items-start gap-3 px-5 py-3.5 rounded-xl shadow-xl transition-all duration-300 ${
            toast.type === 'success'
              ? 'bg-primary-dark text-emerald-300'
              : toast.type === 'error'
              ? 'bg-primary-dark text-red-300'
              : 'bg-primary-dark text-surface'
          }`}
        >
          {toast.type === 'success' ? <CheckCircleIcon /> : <AlertCircleIcon />}
          <span className="text-sm text-surface flex-1">{toast.message}</span>
          <button
            onClick={() => onDismiss(toast.id)}
            className="text-surface/40 hover:text-surface transition-colors text-lg leading-none cursor-pointer mt-0.5"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
