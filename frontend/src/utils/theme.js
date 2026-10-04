/**
 * Enterprise Light Design Tokens & Theme Configuration
 * Clean, modern, highly accessible executive color scheme:
 * Crisp pure whites, executive slate surfaces, and vibrant sky/ocean blue accents.
 */

export const THEME_CONFIG = {
  // Brand Accent Palette (Sky / Royal Ocean Blue)
  brand: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9',
    600: '#0284c7', // Primary Brand Color
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
    950: '#082f49',
  },

  // Crisp Executive Gray / Slate Palette
  slate: {
    50: '#f8fafc',  // Main App Background
    100: '#f1f5f9', // Table headers, subtle secondary background
    200: '#e2e8f0', // Borders & dividers
    300: '#cbd5e1', // Input borders
    400: '#94a3b8', // Placeholder & icons
    500: '#64748b', // Muted text
    600: '#475569', // Secondary body text
    700: '#334155', // Subheadings & labels
    800: '#1e293b', // Headings
    900: '#0f172a', // Primary dark text
    950: '#020617',
  },

  // Semantic Status Colors for Light Mode
  status: {
    success: {
      bg: '#ecfdf5',
      border: '#a7f3d0',
      text: '#065f46',
      main: '#10b981',
    },
    warning: {
      bg: '#fffbeb',
      border: '#fde68a',
      text: '#92400e',
      main: '#f59e0b',
    },
    danger: {
      bg: '#fef2f2',
      border: '#fecaca',
      text: '#991b1b',
      main: '#ef4444',
    },
    info: {
      bg: '#f0f9ff',
      border: '#bae6fd',
      text: '#075985',
      main: '#0284c7',
    },
  },
};

/**
 * Standard CSS Class Aliases for Consistency across Forms and Cards
 */
export const THEME_CLASSES = {
  // Backgrounds
  bgApp: 'bg-slate-50',
  bgSurface: 'bg-white',
  bgSurfaceCard: 'bg-white border border-slate-200/80 shadow-sm rounded-2xl',
  bgSurfaceSubtle: 'bg-slate-50',
  bgSurfaceHover: 'hover:bg-slate-50/80',

  // Borders
  borderSubtle: 'border-slate-100',
  borderDefault: 'border-slate-200',
  borderFocus: 'focus:border-sky-500 focus:ring-4 focus:ring-sky-100',
  borderError: 'border-rose-400 focus:border-rose-500 focus:ring-4 focus:ring-rose-100',

  // Typography
  textPrimary: 'text-slate-900',
  textSecondary: 'text-slate-600',
  textMuted: 'text-slate-500',
  textBrand: 'text-sky-600',
  textError: 'text-rose-600',

  // Inputs & Controls
  inputBase:
    'w-full bg-white text-slate-900 placeholder-slate-400 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm transition-all duration-150 outline-none hover:border-slate-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-100 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed',

  // Buttons
  btnPrimary:
    'inline-flex items-center justify-center font-semibold rounded-xl text-sm px-4 py-2.5 transition-all duration-150 bg-sky-600 hover:bg-sky-700 text-white shadow-sm shadow-sky-600/30 focus:ring-4 focus:ring-sky-200 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]',
  btnSecondary:
    'inline-flex items-center justify-center font-medium rounded-xl text-sm px-4 py-2.5 transition-all duration-150 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 shadow-sm focus:ring-4 focus:ring-slate-100 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]',
  btnDanger:
    'inline-flex items-center justify-center font-semibold rounded-xl text-sm px-4 py-2.5 transition-all duration-150 bg-rose-600 hover:bg-rose-700 text-white shadow-sm shadow-rose-600/30 focus:ring-4 focus:ring-rose-200 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]',
  btnOutline:
    'inline-flex items-center justify-center font-medium rounded-xl text-sm px-4 py-2.5 transition-all duration-150 bg-white hover:bg-sky-50 text-sky-700 border border-sky-300 focus:ring-4 focus:ring-sky-100 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]',
  btnGhost:
    'inline-flex items-center justify-center font-medium rounded-xl text-sm px-4 py-2.5 transition-all duration-150 bg-transparent hover:bg-slate-100 text-slate-600 hover:text-slate-900 disabled:opacity-50 disabled:pointer-events-none',
};
