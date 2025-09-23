/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        light: {
          bg: '#FAFAFA',
          surface: '#FFFFFF',
          'surface-variant': '#F5F5F7',
          primary: '#2563EB',
          secondary: '#64748B',
          accent: '#F59E0B',
          text: '#1E293B',
          'text-muted': '#64748B',
          border: '#E2E8F0',
        },
        dark: {
          bg: '#0F172A',
          surface: '#1E293B',
          'surface-variant': '#334155',
          primary: '#3B82F6',
          secondary: '#94A3B8',
          accent: '#FBBF24',
          text: '#F8FAFC',
          'text-muted': '#94A3B8',
          border: '#475569',
        },
        glass: {
          light: 'rgba(255, 255, 255, 0.1)',
          dark: 'rgba(15, 23, 42, 0.3)',
          border: 'rgba(255, 255, 255, 0.2)',
        }
      },
      fontFamily: {
        'display': ['Inter', 'system-ui', 'sans-serif'],
        'body': ['Inter', 'system-ui', 'sans-serif'],
        'mono': ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
        '7xl': ['4.5rem', { lineHeight: '1' }],
        '8xl': ['6rem', { lineHeight: '1' }],
        '9xl': ['8rem', { lineHeight: '1' }],
        'display-sm': ['2.25rem', { lineHeight: '2.5rem' }],
        'display-md': ['3rem', { lineHeight: '3.25rem' }],
        'display-lg': ['4rem', { lineHeight: '4.25rem' }],
        'display-xl': ['5rem', { lineHeight: '5.25rem' }],
      },
      screens: {
        'xs': '375px',
        'sm': '390px',
        'md': '428px',
        'tablet-portrait': '744px',
        'tablet': '820px',
        'lg': '1024px',
        'tablet-landscape': '1133px',
        'xl': '1180px',
        'tablet-pro': '1366px',
        'laptop-sm': '1440px',
        'laptop': '1512px',
        'laptop-lg': '1680px',
        'laptop-xl': '1728px',
        '2xl': '1920px',
        '3xl': '2560px',
        '4xl': '3840px',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
        '144': '36rem',
      },
      backdropBlur: {
        'xs': '2px',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'slide-up': 'slideUp 0.8s ease-out',
        'slide-in': 'slideIn 0.8s ease-out',
        'fade-in': 'fadeIn 0.6s ease-out',
        'scale-in': 'scaleIn 0.5s ease-out',
        'bounce-slow': 'bounce 3s infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 20s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' }
        },
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(59, 130, 246, 0.5)' },
          '100%': { boxShadow: '0 0 40px rgba(59, 130, 246, 0.8)' }
        },
        slideUp: {
          '0%': { 
            transform: 'translateY(100px)',
            opacity: '0'
          },
          '100%': { 
            transform: 'translateY(0)',
            opacity: '1'
          }
        },
        slideIn: {
          '0%': { 
            transform: 'translateX(-100px)',
            opacity: '0'
          },
          '100%': { 
            transform: 'translateX(0)',
            opacity: '1'
          }
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        scaleIn: {
          '0%': { 
            transform: 'scale(0.8)',
            opacity: '0'
          },
          '100%': { 
            transform: 'scale(1)',
            opacity: '1'
          }
        }
      },
      boxShadow: {
        'glass': '0 8px 32px rgba(31, 38, 135, 0.37)',
        'glass-lg': '0 25px 50px rgba(31, 38, 135, 0.25)',
        'glow-sm': '0 0 20px rgba(59, 130, 246, 0.3)',
        'glow': '0 0 40px rgba(59, 130, 246, 0.4)',
        'glow-lg': '0 0 60px rgba(59, 130, 246, 0.5)',
        'inner-glass': 'inset 0 2px 4px rgba(255, 255, 255, 0.1)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'noise': 'url("data:image/svg+xml,%3Csvg viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg"%3E%3Cfilter id="noiseFilter"%3E%3CfeTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="1" stitchTiles="stitch"/%3E%3C/filter%3E%3Crect width="100%" height="100%" filter="url(%23noiseFilter)" opacity="0.05"/%3E%3C/svg%3E")',
      }
    },
  },
  plugins: [
    function({ addUtilities }) {
      addUtilities({
        '.glass': {
          'backdrop-filter': 'blur(16px) saturate(180%)',
          'background-color': 'rgba(255, 255, 255, 0.05)',
          'border': '1px solid rgba(255, 255, 255, 0.1)',
          'box-shadow': '0 8px 32px rgba(31, 38, 135, 0.37)',
        },
        '.glass-dark': {
          'backdrop-filter': 'blur(16px) saturate(180%)',
          'background-color': 'rgba(15, 23, 42, 0.3)',
          'border': '1px solid rgba(255, 255, 255, 0.1)',
          'box-shadow': '0 8px 32px rgba(0, 0, 0, 0.3)',
        },
        '.glass-strong': {
          'backdrop-filter': 'blur(20px) saturate(180%)',
          'background-color': 'rgba(255, 255, 255, 0.15)',
          'border': '1px solid rgba(255, 255, 255, 0.2)',
          'box-shadow': '0 25px 50px rgba(31, 38, 135, 0.25)',
        }
      })
    }
  ],
}