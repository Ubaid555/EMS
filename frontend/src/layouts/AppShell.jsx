import React, { useMemo } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Badge, Button } from '@/components/common';

// TIER 1: GLOBAL TOP MODULES
const MODULES = [
  { id: 'dashboard', label: 'Dashboard', path: '/dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { id: 'employee', label: 'Employee Profile', path: '/employee', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
  { id: 'finance', label: 'Finance Ledger', path: '/finance', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
  { id: 'family', label: 'Family Dossier', path: '/family', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
];

// TIER 2: HORIZONTAL SUB-NAVBAR SECTIONS (Expandable to 20+ sections)
const SUB_SECTIONS = {
  employee: [
    { label: 'Basic Info', path: '/employee/basic-info' },
    { label: 'CNIC', path: '/employee/cnic' },
    { label: 'Present Address', path: '/employee/present-address' },
    { label: 'Permanent Address', path: '/employee/permanent-address' },
    { label: 'Contacts', path: '/employee/contacts' },
    { label: 'Languages', path: '/employee/languages' },
  ],
  finance: [
    { label: 'Income', path: '/finance/income' },
    { label: 'Expense', path: '/finance/expenses' },
  ],
  family: [
    { label: 'Spouses', path: '/family/spouses' },
    { label: 'Children', path: '/family/children' },
    { label: 'Parents', path: '/family/parents' },
  ],
};

export default function AppShell() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Active top-level module
  const activeModuleId = useMemo(() => {
    const segment = location.pathname.split('/')[1] || 'dashboard';
    return segment.toLowerCase();
  }, [location.pathname]);

  const activeSubSections = SUB_SECTIONS[activeModuleId] || [];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const role = user?.credentials?.role || 'EMPLOYEE';
  const subCategory = user?.credentials?.subCategory;
  const assignedNumber = user?.credentials?.assignedNumber || 'N/A';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900">
      {/* ========================================================================= */}
      {/* TIER 1: GLOBAL TOP NAVIGATION BAR (Clean Executive Theme)                 */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo & Platform Name */}
          <NavLink to="/dashboard" className="flex items-center gap-2.5 group shrink-0">
            <div className="w-9 h-9 rounded-xl bg-sky-600 flex items-center justify-center font-black text-white text-base shadow-sm shadow-sky-600/30 group-hover:bg-sky-700 transition-colors">
              EMS
            </div>
            <div>
              <span className="font-bold text-slate-900 text-sm tracking-tight block">
                Employee Management System
              </span>
              <span className="text-[10px] text-slate-500 font-medium hidden sm:block">
                Enterprise Platform
              </span>
            </div>
          </NavLink>

          {/* Top Module Tabs */}
          <nav className="hidden md:flex items-center gap-1.5 bg-slate-100/80 p-1 rounded-xl border border-slate-200/80">
            {MODULES.map((mod) => {
              const isCurrent =
                mod.id === 'dashboard'
                  ? location.pathname === '/dashboard' || location.pathname === '/'
                  : location.pathname.startsWith(mod.path);

              return (
                <NavLink
                  key={mod.id}
                  to={mod.path}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all select-none
                    ${isCurrent
                      ? 'bg-white text-sky-700 shadow-xs font-bold border border-slate-200/60'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                    }
                  `}
                >
                  <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mod.icon} />
                  </svg>
                  <span>{mod.label}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* User Badge & Sign Out */}
          <div className="flex items-center gap-2.5">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="font-semibold text-slate-800">{assignedNumber}</span>
              <span className="text-slate-400">•</span>
              <Badge variant="primary" size="sm">
                {role} {subCategory ? `(${subCategory})` : ''}
              </Badge>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200 focus:ring-rose-100 text-xs"
              leftIcon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              }
            >
              Sign Out
            </Button>
          </div>
        </div>

        {/* Mobile Top Row */}
        <div className="md:hidden flex items-center flex-wrap gap-1 px-4 py-2 border-t border-slate-100 bg-slate-50/80">
          {MODULES.map((mod) => {
            const isCurrent =
              mod.id === 'dashboard'
                ? location.pathname === '/dashboard' || location.pathname === '/'
                : location.pathname.startsWith(mod.path);
            return (
              <NavLink
                key={mod.id}
                to={mod.path}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors
                  ${isCurrent ? 'bg-sky-600 text-white' : 'text-slate-600 hover:bg-white'}
                `}
              >
                {mod.label}
              </NavLink>
            );
          })}
        </div>
      </header>

      {/* ========================================================================= */}
      {/* TIER 2: HORIZONTAL SUB-NAVBAR (Replaces sidebar, supports 20+ sections)    */}
      {/* ========================================================================= */}
      {activeSubSections.length > 0 && (
        <div className="bg-white border-b border-slate-200/90 shadow-2xs sticky top-16 z-30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center flex-wrap gap-1.5 sm:gap-2 py-2.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pr-2 border-r border-slate-200 shrink-0 hidden sm:inline-block">
                {activeModuleId} Sections
              </span>

              {activeSubSections.map((sec) => {
                const isItemActive =
                  location.pathname === sec.path ||
                  (sec.path.startsWith('/finance/expenses') && location.pathname.startsWith('/finance/expenses'));

                return (
                  <NavLink
                    key={sec.path}
                    to={sec.path}
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap select-none
                      ${
                        isItemActive
                          ? 'bg-sky-600 text-white shadow-xs font-bold'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }
                    `}
                  >
                    <span>{sec.label}</span>
                  </NavLink>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TIER 3/4: FULL WIDTH WORKSPACE CANVAS                                     */}
      {/* ========================================================================= */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>
    </div>
  );
}
