import React from 'react';

/**
 * Universal EntitySelectorBar Component (Tier 3 Switcher)
 * Renders horizontal switchable pills/cards for multi-instance entities (Spouses, Children, Parents).
 */
export default function EntitySelectorBar({
  entities = [],
  activeId,
  onSelect,
  onAdd = null,
  addLabel = '+ Add Record',
  emptyMessage = 'No records found. Click below to add your first record.',
  className = '',
}) {
  return (
    <div className={`w-full flex flex-col gap-3 ${className}`}>
      <div className="flex items-center justify-between gap-3 flex-wrap">
        {/* Horizontal Scrollable Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full no-scrollbar">
          {entities.map((item, index) => {
            const isSelected = String(item.id || item._id) === String(activeId);
            return (
              <button
                key={item.id || item._id || index}
                type="button"
                onClick={() => onSelect(item.id || item._id)}
                className={`flex items-center gap-2.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap shadow-xs
                  ${
                    isSelected
                      ? 'bg-sky-600 text-white shadow-sm shadow-sky-600/30 ring-2 ring-sky-600/30'
                      : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }
                `}
              >
                <span>{item.label || `Record #${index + 1}`}</span>
                {item.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                      isSelected
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          {onAdd && (
            <button
              type="button"
              onClick={onAdd}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-sky-700 bg-sky-50 border border-sky-200 hover:bg-sky-100/80 transition-colors whitespace-nowrap"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              <span>{addLabel}</span>
            </button>
          )}
        </div>
      </div>

      {entities.length === 0 && (
        <div className="p-4 rounded-xl bg-slate-50 border border-dashed border-slate-200 text-center text-xs text-slate-500">
          {emptyMessage}
        </div>
      )}
    </div>
  );
}
