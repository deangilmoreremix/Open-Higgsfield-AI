/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Cinematic dark theme tokens (will be expanded in Task 6)
        bg: '#0a0a0c',
        panel: '#111113',
        border: '#26262a',
        accent: '#a78bfa',
      }
    },
  },
  plugins: [],
}
