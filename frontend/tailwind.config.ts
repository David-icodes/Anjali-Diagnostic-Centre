import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: '',
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: { '2xl': '1400px' },
    },
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: '#1BAE9A',
          foreground: '#FFFFFF',
          50: '#E6F7F5',
          100: '#B3EBE4',
          200: '#80DED3',
          300: '#4DD1C2',
          400: '#26C7B4',
          500: '#1BAE9A',
          600: '#168E7E',
          700: '#116E62',
          800: '#0C4E46',
          900: '#072E2A',
        },
        secondary: {
          DEFAULT: '#4CAF50',
          foreground: '#FFFFFF',
          50: '#E8F5E9',
          100: '#C8E6C9',
          200: '#A5D6A7',
          300: '#81C784',
          400: '#66BB6A',
          500: '#4CAF50',
          600: '#43A047',
          700: '#388E3C',
          800: '#2E7D32',
          900: '#1B5E20',
        },
        accent: {
          DEFAULT: '#00C2A8',
          foreground: '#FFFFFF',
          50: '#E0FAF6',
          100: '#B3F2E8',
          200: '#80E9DA',
          300: '#4DE0CC',
          400: '#26D9C0',
          500: '#00C2A8',
          600: '#009E89',
          700: '#007A6A',
          800: '#00564B',
          900: '#00322C',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-16px)' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        float: 'float 6s ease-in-out infinite',
        'fade-in-up': 'fade-in-up 0.6s ease-out forwards',
        'fade-in': 'fade-in 0.5s ease-out forwards',
        shimmer: 'shimmer 2s infinite linear',
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg, #1BAE9A 0%, #00C2A8 50%, #4CAF50 100%)',
        'card-gradient': 'linear-gradient(135deg, rgba(27,174,154,0.05) 0%, rgba(0,194,168,0.08) 100%)',
        'green-gradient': 'linear-gradient(135deg, #4CAF50 0%, #388E3C 100%)',
        'teal-gradient': 'linear-gradient(135deg, #1BAE9A 0%, #00C2A8 100%)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

export default config
