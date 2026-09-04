import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7', // Primary accent blue
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49',
        },
        surface: {
          base: '#030712',      // Deepest background (zinc-950/black)
          subtle: '#090d16',    // Secondary dark surface
          card: '#0c1322',      // Deep navy/slate card background
          elevated: '#111c30',  // Elevated popover/modal
          border: '#1e293b',    // Subdued card border
          borderLight: '#334155',
          anchorDark: '#070c18', // Rich midnight dark section anchor
          // Light Theme Tokens
          page: '#f8fafc',       // Warm/cool off-white background
          cardLight: '#ffffff',  // Pure white card/section
          subtleLight: '#f1f5f9', // Very light slate section ground
          borderLightSubtle: '#e2e8f0', // Subtle light border
          borderLightStrong: '#cbd5e1', // Strong light border
        },
        navy: {
          950: '#060a14',
          900: '#0a0f1d',
          800: '#0f172a', // Primary dark navy typography
          700: '#1e293b',
          600: '#334155',
          500: '#475569',
          400: '#64748b',
          300: '#94a3b8',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
        mono: [
          'JetBrains Mono',
          'Fira Code',
          'ui-monospace',
          'monospace',
        ],
      },
      borderRadius: {
        'sm': '4px',
        'DEFAULT': '6px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
      },
      transitionTimingFunction: {
        brand: 'cubic-bezier(0.22, 0.61, 0.36, 1)',
      },
      backgroundImage: {
        'hero-pink-gradient': 'linear-gradient(100deg, #FF3E9D 0%, #ED3899 50%, #C026D3 100%)',
      },
    },
  },
  plugins: [],
};
export default config;
