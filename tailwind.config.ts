import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // Ini setting supaya dia kenal font Poppins
        sans: ['var(--font-poppins)', 'sans-serif'],
      },
      colors: {
        // Ini palet warna 'brand' biru kita tadi
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          900: '#1e3a8a',
        }
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
export default config;