/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./pages/**/*.{js,jsx}', './components/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        orange: {
          primary: '#FF7A00',
          mid: '#FF8C2F',
          light: '#FFA94D',
          pale: '#FFF5EB',
          card: '#FFF0E0',
        }
      },
      maxWidth: { mobile: '420px' },
      borderRadius: { '3xl': '1.5rem', '4xl': '2rem' },
      boxShadow: {
        card: '0 4px 20px rgba(255, 122, 0, 0.12)',
        btn: '0 4px 15px rgba(255, 122, 0, 0.4)',
      },
      animation: {
        'bounce-soft': 'bounceSoft 2s ease-in-out infinite',
        'pulse-orange': 'pulseOrange 2s ease-in-out infinite',
      },
      keyframes: {
        bounceSoft: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-8px)' } },
        pulseOrange: { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.7 } }
      }
    }
  },
  plugins: []
}