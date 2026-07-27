import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './features/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#F6F1FF',
          100: '#FCFAFF',
          200: '#E8DDFB',
          300: '#B9A3F5',
          500: '#8B6FE8',
          700: '#7A5CE0',
          900: '#312B4A'
        }
      }
    }
  },
  plugins: []
};

export default config;
