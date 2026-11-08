/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Sora', 'Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        canvas: '#05070E',
        card: '#0D1424',
        panel: '#161F38',
        silver: '#94A3B8',
        ink: '#F4F7FF',
        success: '#6EE7B7',
        danger: '#FB7185',
      },
      boxShadow: {
        glass: '0 24px 70px -24px rgba(2, 6, 23, 0.85), inset 0 1px 0 rgba(255, 255, 255, 0.06)',
        'glass-lg': '0 32px 90px -28px rgba(2, 6, 23, 0.95), inset 0 1px 0 rgba(255, 255, 255, 0.07)',
        'glow-sky': '0 0 28px -6px rgba(56, 189, 248, 0.55)',
        'glow-violet': '0 0 28px -6px rgba(139, 92, 246, 0.55)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(14px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'pop-in': {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'glow-pulse': {
          '0%, 100%': { opacity: '0.45' },
          '50%': { opacity: '0.9' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        drift: {
          '0%, 100%': { transform: 'translate3d(0, 0, 0) scale(1)' },
          '50%': { transform: 'translate3d(40px, -30px, 0) scale(1.08)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        aurora: {
          '0%, 100%': { opacity: '0.55', transform: 'translate3d(0, 0, 0) scale(1) rotate(0deg)' },
          '50%': { opacity: '0.85', transform: 'translate3d(60px, -40px, 0) scale(1.15) rotate(8deg)' },
        },
        'spin-slow': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.6s cubic-bezier(0.22, 1, 0.36, 1) backwards',
        'fade-in': 'fade-in 0.35s ease-out backwards',
        'pop-in': 'pop-in 0.35s cubic-bezier(0.22, 1, 0.36, 1) backwards',
        'glow-pulse': 'glow-pulse 4s ease-in-out infinite',
        shimmer: 'shimmer 2.4s ease-in-out infinite',
        drift: 'drift 18s ease-in-out infinite',
        aurora: 'aurora 22s ease-in-out infinite',
        float: 'float 3.2s ease-in-out infinite',
        'spin-slow': 'spin-slow 14s linear infinite',
      },
    },
  },
  plugins: [],
};
