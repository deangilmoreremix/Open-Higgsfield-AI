/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'workflow-bg': '#0c0d0f',
        'workflow-card': '#151618',
        'workflow-border': '#1c1e21',
        'workflow-text': '#fafafa',
        'workflow-muted': '#71717a',
        'workflow-blue': '#3b82f6',
        'workflow-green': '#22c55e',
        'workflow-orange': '#f97316',
        'workflow-yellow': '#eab308',
      },
    },
  },
  plugins: [],
}