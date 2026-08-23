/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // A single, deliberate dark palette — driven by CSS custom
        // properties (see index.css) so opacity modifiers like bg-primary/20
        // keep working exactly as they did before, but the values behind
        // them are now ours, not DaisyUI's 32-theme grab bag.
        'base-100': 'rgb(var(--c-bg-0) / <alpha-value>)',
        'base-200': 'rgb(var(--c-bg-1) / <alpha-value>)',
        'base-300': 'rgb(var(--c-bg-2) / <alpha-value>)',
        'base-content': 'rgb(var(--c-text) / <alpha-value>)',
        primary: 'rgb(var(--c-accent) / <alpha-value>)',
        'primary-content': 'rgb(var(--c-on-accent) / <alpha-value>)',
        secondary: 'rgb(var(--c-accent-2) / <alpha-value>)',
        'secondary-content': 'rgb(var(--c-on-accent) / <alpha-value>)',
        accent: 'rgb(var(--c-accent) / <alpha-value>)',
        neutral: 'rgb(var(--c-bg-2) / <alpha-value>)',
        'neutral-content': 'rgb(var(--c-text) / <alpha-value>)',
        error: 'rgb(var(--c-danger) / <alpha-value>)',
        'error-content': 'rgb(var(--c-on-accent) / <alpha-value>)',
        success: 'rgb(var(--c-success) / <alpha-value>)',
        warning: 'rgb(var(--c-warning) / <alpha-value>)',
        info: 'rgb(var(--c-info) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        // A noticeably tighter, more geometric scale than Tailwind's
        // defaults — this is what actually kills the "bubbly AI app" look,
        // since every rounded-xl/2xl/3xl in the codebase inherits it
        // without needing to touch component markup.
        sm: '5px',
        DEFAULT: '6px',
        md: '7px',
        lg: '9px',
        xl: '11px',
        '2xl': '13px',
        '3xl': '16px',
        full: '9999px',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: 0, transform: 'translateY(4px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
        'ambient-drift': {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '50%': { transform: 'translate(2%, -3%) scale(1.05)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.25s ease-out',
        'ambient-drift': 'ambient-drift 18s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
