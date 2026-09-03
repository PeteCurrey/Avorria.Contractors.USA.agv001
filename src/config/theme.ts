/**
 * AVORRIA DESIGN TOKENS & VISUAL FOUNDATION
 * 
 * EntireFM-inspired starting language:
 * - Premium, modern, dark/minimal, restrained
 * - Blue accent language (#0284c7, #2563eb, #38bdf8)
 * - Deep navy/slate card backgrounds (#0c1322)
 * - Subdued slate borders (#1e293b)
 * - High-contrast readable typography
 */

export const themeConfig = {
  colors: {
    background: {
      base: '#030712',      // Deepest background (zinc-950)
      subtle: '#090d16',    // Secondary surface
      card: '#0c1322',      // Deep navy/slate card background
      elevated: '#111c30',  // Modals / popovers / elevated panels
    },
    border: {
      subtle: '#1e293b',    // Slate-800 border
      light: '#334155',     // Slate-700 hover border
      focus: '#0284c7',     // Accent focus border
    },
    text: {
      primary: '#f8fafc',   // Slate-50
      secondary: '#94a3b8', // Slate-400
      muted: '#64748b',     // Slate-500
      inverse: '#030712',
    },
    brand: {
      primary: '#0284c7',   // Sky-600
      primaryHover: '#0369a1',
      accent: '#38bdf8',    // Sky-400
      subtle: 'rgba(2, 132, 199, 0.1)',
    },
    status: {
      success: '#10b981',   // Emerald-500
      successBg: 'rgba(16, 185, 129, 0.1)',
      warning: '#f59e0b',   // Amber-500
      warningBg: 'rgba(245, 158, 11, 0.1)',
      error: '#ef4444',     // Red-500
      errorBg: 'rgba(239, 68, 68, 0.1)',
      info: '#0284c7',      // Sky-600
      infoBg: 'rgba(2, 132, 199, 0.1)',
    },
  },
  typography: {
    fontFamily: {
      sans: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      mono: '"JetBrains Mono", Fira Code, ui-monospace, monospace',
    },
    fontSize: {
      xs: ['0.75rem', { lineHeight: '1rem' }],
      sm: ['0.875rem', { lineHeight: '1.25rem' }],
      base: ['1rem', { lineHeight: '1.5rem' }],
      lg: ['1.125rem', { lineHeight: '1.75rem' }],
      xl: ['1.25rem', { lineHeight: '1.75rem' }],
      '2xl': ['1.5rem', { lineHeight: '2rem' }],
      '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
      '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
      '5xl': ['3rem', { lineHeight: '1.16' }],
    },
  },
  radii: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    full: '9999px',
  },
  shadows: {
    card: '0 4px 20px -2px rgba(0, 0, 0, 0.5)',
    elevated: '0 10px 30px -4px rgba(0, 0, 0, 0.7)',
    glow: '0 0 25px -5px rgba(2, 132, 199, 0.25)',
  },
};

export type ThemeConfig = typeof themeConfig;
