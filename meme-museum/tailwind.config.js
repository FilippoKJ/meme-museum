/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        bebas: ['"Nunito"', 'sans-serif'],
        comic: ['"Comic Neue"', 'cursive'],
        mono: ['"Space Mono"', 'monospace'],
      },
      colors: {
        bg: '#0e0e0e',
        bg2: '#141414',
        card: '#1a1a1a',
        accent: '#7c5cbf',
        yellow: '#f0e040',
        border: '#2a2a2a',
        muted: '#888888',
      },
      animation: {
        float: 'float 4s ease-in-out infinite',
        'float-delay': 'float 4s ease-in-out 1s infinite',
        'float-delay2': 'float 4s ease-in-out 2s infinite',
        'spin-slow': 'spin 20s linear infinite',
        'spin-reverse': 'spinReverse 20s linear infinite',
        'fade-up': 'fadeUp 0.7s ease both',
        'fade-up-delay': 'fadeUp 0.7s ease 0.2s both',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        spinReverse: {
          to: { transform: 'rotate(-360deg)' },
        },
        fadeUp: {
          from: { opacity: 0, transform: 'translateY(20px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
