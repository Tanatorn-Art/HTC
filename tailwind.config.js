/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}', // ปรับตามโครงสร้างโปรเจกต์ของคุณ
    './components/**/*.{js,ts,jsx,tsx}',
    './styles/**/*.css',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1d4ed8',          // Blue-700
        secondary: '#1e293b',        // Slate-800
        background: '#ffffff',       // White
        muted: '#64748b',            // Slate-500
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.5rem',
      },
    },
  },
  plugins: [],
};
