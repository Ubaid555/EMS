import React from 'react';

/**
 * Universal Select Component (Modern Light Theme)
 */
export default function Select({
  label,
  id,
  name,
  value = '',
  onChange,
  options = [],
  placeholder = 'Select an option...',
  error = null,
  helperText = null,
  required = false,
  disabled = false,
  className = '',
  selectClassName = '',
  ...props
}) {
  const selectId = id || name || `select-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={`w-full flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label
          htmlFor={selectId}
          className="text-xs font-semibold text-slate-700 tracking-wide flex items-center justify-between"
        >
          <span>
            {label}
            {required && <span className="text-rose-500 ml-1 font-bold">*</span>}
          </span>
        </label>
      )}

      <div className="relative w-full">
        <select
          id={selectId}
          name={name}
          value={value ?? ''}
          onChange={onChange}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${selectId}-error` : helperText ? `${selectId}-helper` : undefined}
          className={`w-full appearance-none bg-white text-slate-900 text-sm rounded-xl border px-3.5 py-2.5 pr-10 transition-all duration-150 outline-none cursor-pointer
            ${
              error
                ? 'border-rose-400 focus:border-rose-500 focus:ring-4 focus:ring-rose-100'
                : 'border-slate-300 hover:border-slate-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-100'
            }
            disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed
            ${selectClassName}
          `}
          {...props}
        >
          {placeholder && (
            <option value="" disabled className="text-slate-400">
              {placeholder}
            </option>
          )}

          {options.map((opt, index) => {
            const optVal = typeof opt === 'object' ? opt.value : opt;
            const optLabel = typeof opt === 'object' ? opt.label : opt;
            const optKey = typeof opt === 'object' ? opt.key || optVal || index : index;

            return (
              <option key={optKey} value={optVal} className="text-slate-900 py-1">
                {optLabel}
              </option>
            );
          })}
        </select>

        {/* Custom Chevron Icon */}
        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {error && (
        <p id={`${selectId}-error`} role="alert" className="text-xs text-rose-600 font-medium flex items-center gap-1 mt-0.5">
          <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </p>
      )}

      {!error && helperText && (
        <p id={`${selectId}-helper`} className="text-xs text-slate-500 mt-0.5">
          {helperText}
        </p>
      )}
    </div>
  );
}
