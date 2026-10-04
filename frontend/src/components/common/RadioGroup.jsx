import React from 'react';

/**
 * RadioGroup Component (Modern Light Theme)
 */
export default function RadioGroup({
  label,
  name,
  options = [],
  value,
  onChange,
  error = null,
  required = false,
  disabled = false,
  layout = 'horizontal', // 'horizontal' | 'vertical' | 'grid'
  className = '',
}) {
  const groupName = name || `radio-group-${Math.random().toString(36).substr(2, 9)}`;

  const layoutClasses = {
    horizontal: 'flex flex-wrap gap-2.5',
    vertical: 'flex flex-col gap-2',
    grid: 'grid grid-cols-2 sm:grid-cols-3 gap-2.5',
  };

  return (
    <div className={`w-full flex flex-col gap-1.5 ${className}`}>
      {label && (
        <span className="text-xs font-semibold text-slate-700 tracking-wide flex items-center">
          {label}
          {required && <span className="text-rose-500 ml-1 font-bold">*</span>}
        </span>
      )}

      <div className={layoutClasses[layout] || layoutClasses.horizontal} role="radiogroup">
        {options.map((opt, index) => {
          const optValue = typeof opt === 'object' ? opt.value : opt;
          const optLabel = typeof opt === 'object' ? opt.label : opt;
          const optDesc = typeof opt === 'object' ? opt.description : null;
          const isSelected = value === optValue;

          return (
            <label
              key={optValue || index}
              className={`relative flex items-center gap-3 p-3 rounded-xl border transition-all duration-150 cursor-pointer select-none
                ${
                  isSelected
                    ? 'bg-sky-50/80 border-sky-500 text-sky-950 shadow-sm ring-2 ring-sky-500/20'
                    : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300 hover:bg-slate-50/80'
                }
                ${disabled ? 'opacity-50 pointer-events-none' : ''}
              `}
            >
              <input
                type="radio"
                name={groupName}
                value={optValue}
                checked={isSelected}
                onChange={() => onChange && onChange(optValue)}
                disabled={disabled}
                className="sr-only"
              />

              <div
                className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-colors
                  ${isSelected ? 'border-sky-600 bg-sky-600' : 'border-slate-300 bg-white'}
                `}
              >
                {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
              </div>

              <div className="flex flex-col">
                <span className={`text-sm font-semibold ${isSelected ? 'text-sky-950' : 'text-slate-800'}`}>
                  {optLabel}
                </span>
                {optDesc && <span className="text-xs text-slate-500">{optDesc}</span>}
              </div>
            </label>
          );
        })}
      </div>

      {error && (
        <p role="alert" className="text-xs text-rose-600 font-medium flex items-center gap-1 mt-0.5">
          <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}
