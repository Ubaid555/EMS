import React from 'react';

/**
 * Alert Banner Component (Modern Light Theme)
 */
export default function Alert({
  type = 'error',
  title = null,
  message = null,
  errors = [],
  onClose = null,
  className = '',
}) {
  const typeConfig = {
    error: {
      container: 'bg-rose-50 border-rose-200 text-rose-800',
      iconColor: 'text-rose-600',
      icon: (
        <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    warning: {
      container: 'bg-amber-50 border-amber-200 text-amber-900',
      iconColor: 'text-amber-600',
      icon: (
        <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
    },
    success: {
      container: 'bg-emerald-50 border-emerald-200 text-emerald-800',
      iconColor: 'text-emerald-600',
      icon: (
        <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    info: {
      container: 'bg-sky-50 border-sky-200 text-sky-900',
      iconColor: 'text-sky-600',
      icon: (
        <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  };

  const current = typeConfig[type] || typeConfig.error;

  return (
    <div
      role="alert"
      className={`relative flex items-start gap-3 p-4 rounded-xl border shadow-sm ${current.container} ${className}`}
    >
      <div className={current.iconColor}>{current.icon}</div>

      <div className="flex-1 text-sm">
        {title && <h5 className="font-bold tracking-tight mb-0.5">{title}</h5>}
        {message && <p className="leading-relaxed text-xs">{message}</p>}

        {errors && errors.length > 0 && (
          <ul className="mt-2 list-disc list-inside space-y-1 text-xs font-medium">
            {errors.map((err, i) => (
              <li key={i}>{typeof err === 'string' ? err : err.message || JSON.stringify(err)}</li>
            ))}
          </ul>
        )}
      </div>

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 p-1 text-slate-400 hover:text-slate-700 transition-colors rounded-lg"
          aria-label="Dismiss alert"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}
