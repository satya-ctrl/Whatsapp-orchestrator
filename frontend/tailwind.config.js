/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'wa-green':       '#25D366',
        'wa-green-dark':  '#128C7E',
        'wa-green-light': '#DCF8C6',
        'meta-blue':      '#0084FF',
        'meta-blue-light':'#4DA3FF',
        'meta-blue-dark': '#0060CC',
        'surface':        '#0d1117',
        'surface-2':      '#161b22',
        'surface-3':      '#21262d',
        'border-subtle':  'rgba(255,255,255,0.06)',
      },
      fontFamily: {
        'inter':      ['Inter', 'sans-serif'],
        'barlow':     ['Barlow', 'sans-serif'],
        'instrument': ['"Instrument Serif"', 'serif'],
        'dirtyline':  ['Dirtyline', 'sans-serif'],
        'fustat':     ['Inter', 'sans-serif'],
      },
      backdropBlur: {
        xs: '2px',
      },
      keyframes: {
        'fade-in': {
          '0%':   { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-right': {
          '0%':   { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'slide-in-left': {
          '0%':   { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'slide-up': {
          '0%':   { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-dot': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%':      { opacity: '0.5', transform: 'scale(0.85)' },
        },
        'bounce-dot': {
          '0%, 80%, 100%': { transform: 'translateY(0)' },
          '40%':           { transform: 'translateY(-6px)' },
        },
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 12px rgba(37,211,102,0.4)' },
          '50%':      { boxShadow: '0 0 24px rgba(37,211,102,0.8)' },
        },
        'shimmer': {
          '0%':   { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
      },
      animation: {
        'fade-in':        'fade-in 0.3s ease-out forwards',
        'slide-in-right': 'slide-in-right 0.3s ease-out forwards',
        'slide-in-left':  'slide-in-left 0.3s ease-out forwards',
        'slide-up':       'slide-up 0.4s ease-out forwards',
        'pulse-dot':      'pulse-dot 2s ease-in-out infinite',
        'bounce-dot':     'bounce-dot 1.4s ease-in-out infinite',
        'glow-pulse':     'glow-pulse 2s ease-in-out infinite',
        'shimmer':        'shimmer 2s linear infinite',
      },
      boxShadow: {
        'glass':     '0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)',
        'glass-sm':  '0 2px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)',
        'green-glow':'0 0 20px rgba(37,211,102,0.4)',
        'blue-glow': '0 0 20px rgba(0,132,255,0.4)',
      },
    },
  },
  plugins: [],
}
