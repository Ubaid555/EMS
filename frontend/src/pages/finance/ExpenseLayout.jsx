import React from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';

export default function ExpenseLayout() {
  const location = useLocation();

  const subSections = [
    {
      id: 'home',
      label: 'Home Expenses',
      path: '/finance/expenses/home',
      icon: (
        <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      id: 'other',
      label: 'Other Expenses',
      path: '/finance/expenses/other',
      icon: (
        <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Sleek, Compact Sub-Section Pill Bar with Multi-Line Flex-Wrap */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-2 shadow-2xs">
        <div className="flex items-center flex-wrap gap-1.5">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 shrink-0 hidden sm:inline-block">
            Expense Category:
          </span>

          {subSections.map((sec) => {
            const isActive = location.pathname.startsWith(sec.path);
            return (
              <NavLink
                key={sec.id}
                to={sec.path}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all select-none
                  ${
                    isActive
                      ? 'bg-sky-600 text-white shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }
                `}
              >
                {sec.icon}
                <span>{sec.label}</span>
              </NavLink>
            );
          })}
        </div>
      </div>

      {/* Active Sub-Section View (Home or Other Expenses) */}
      <Outlet />
    </div>
  );
}
