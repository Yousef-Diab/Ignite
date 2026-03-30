/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/renderer/src/**/*.{ts,tsx,html}',
    './src/renderer/index.html'
  ],
  theme: {
    extend: {
      colors: {
        surface: '#0f0f13',
        'surface-2': '#1a1a24',
        'surface-3': '#242433',
        border: '#2e2e42'
      }
    }
  },
  plugins: []
}
