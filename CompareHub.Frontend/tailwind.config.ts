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
          50: '#FBF0E6',
          100: '#FEFAF7',
          200: '#F0D8C4',
          300: '#E0A57B',
          500: '#C1592E',
          700: '#9C4623',
          900: '#3A2417'
        }
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' }
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' }
        },
        kenBurns: {
          '0%': { transform: 'scale(1)' },
          '100%': { transform: 'scale(1.06)' }
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%': { transform: 'translateX(-4px)' },
          '40%': { transform: 'translateX(4px)' },
          '60%': { transform: 'translateX(-3px)' },
          '80%': { transform: 'translateX(3px)' }
        },
        floatY: {
          '0%, 100%': { transform: 'translate(0, 0)' },
          '50%': { transform: 'translate(14px, -26px)' }
        }
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.6s cubic-bezier(0.16,1,0.3,1) both',
        'fade-in': 'fadeIn 0.5s ease-out both',
        'scale-in': 'scaleIn 0.45s cubic-bezier(0.16,1,0.3,1) both',
        shimmer: 'shimmer 1.8s linear infinite',
        'ken-burns': 'kenBurns 24s ease-in-out infinite alternate',
        shake: 'shake 0.4s ease-in-out',
        'float-slow': 'floatY 11s ease-in-out infinite',
        'float-slower': 'floatY 17s ease-in-out infinite',
        'float-fast': 'floatY 8s ease-in-out infinite'
      }
    }
  },
  plugins: []
};

export default config;
