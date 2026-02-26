/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#10b981', // Emerald 500
          dark: '#064e3b',    // Emerald 950
          light: '#34d399',   // Emerald 400
        },
        secondary: {
          DEFAULT: '#84cc16', // Lime 500
          light: '#bef264',   // Lime 300
        },
        slate: {
          900: '#0f172a',
          800: '#1e293b',
          700: '#334155',
          600: '#475569',
          500: '#64748b',
        },
        bg: '#f8fafc',
        border: '#e2e8f0',
        accent: '#fbbf24', // Amber 400
      },
      boxShadow: {
        'premium': '0 10px 30px -5px rgba(0, 0, 0, 0.04), 0 20px 25px -5px rgba(0, 0, 0, 0.03)',
        'primary-glow': '0 0 20px rgba(16, 185, 129, 0.2)',
      },
      borderRadius: {
        '3xl': '1.5rem',
        '4xl': '2rem',
        '5xl': '3rem',
      }
    },
  },
  plugins: [],
}
