import React from 'react';

/**
 * Textarea Component (Modern Light Theme)
 */
export default function Textarea({
  label,
  id,
  name,
  value = '',
  onChange,
  onBlur,
  placeholder = '',
  rows = 3,
  maxLength = undefined,
  showCharCount = false,
  error = null,
  helperText = null,
  required = false,
  disabled = false,
  className = '',
  textareaClassName = '',
  ...props
}) {
  const textareaId = id || name || `textarea-${Math.random().toString(36).substr(2, 9)}`;
  const currentLength = typeof value === 'string' ? value.length : 0;

  return (
    <div className={`w-full flex flex-col gap-1.5 ${className}`}>
      {label && (
        <div className="flex items-center justify-between text-xs font-semibold text-slate-700 tracking-wide">
          <label htmlFor={textareaId}>
            {label}
            {required && <span className="text-rose-500 ml-1 font-bold">*</span>}
          </label>
          {showCharCount && maxLength && (
            <span className={`text-[11px] font-mono ${currentLength >= maxLength ? 'text-rose-600 font-bold' : 'text-slate-400'}`}>
              {currentLength}/{maxLength}
            </span>
          )}
        </div>
      )}

      <textarea
        id={textareaId}
        name={name}
        rows={rows}
        maxLength={maxLength}
        value={value ?? ''}
        onChange={onChange}
        onBlur={onBlur}
        disabled={disabled}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${textareaId}-error` : helperText ? `${textareaId}-helper` : undefined}
        className={`w-full bg-white text-slate-900 placeholder-slate-400 text-sm rounded-xl border p-3 transition-all duration-150 outline-none resize-y min-h-[80px]
          ${
            error
              ? 'border-rose-400 focus:border-rose-500 focus:ring-4 focus:ring-rose-100'
              : 'border-slate-300 hover:border-slate-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-100'
          }
          disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed
          ${textareaClassName}
        `}
        {...props}
      />

      {error && (
        <p id={`${textareaId}-error`} role="alert" className="text-xs text-rose-600 font-medium flex items-center gap-1 mt-0.5">
          <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </p>
      )}

      {!error && helperText && (
        <p id={`${textareaId}-helper`} className="text-xs text-slate-500 mt-0.5">
          {helperText}
        </p>
      )}
    </div>
  );
}
