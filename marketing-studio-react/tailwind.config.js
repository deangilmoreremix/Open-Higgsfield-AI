/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: '#22d3ee',
        'primary/5': 'rgba(34, 211, 238, 0.05)',
        'primary/40': 'rgba(34, 211, 238, 0.4)',
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.2s ease-out'
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        }
      }
    },
  },
  plugins: [],
}