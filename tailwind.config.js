/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        // Light theme colors
        'bg-color': 'var(--bg-color, #FAFAFA)',
        'bg-secondary': 'var(--bg-secondary, #E0F6E0)',
        'bg-hover': 'var(--bg-hover, #98FB98)',
        'text-primary': 'var(--text-primary, #2F4F4F)',
        'text-secondary': 'var(--text-secondary, #64748b)',
        'border-color': 'var(--border-color, #E0F6E0)',
        'primary': 'var(--primary-color, #98FB98)',
        'primary-dark': 'var(--primary-dark, #2E8B57)',
        'success': 'var(--success-color, #2E8B57)',
        'success-dark': 'var(--success-dark, #98FB98)',
        'warning': 'var(--warning-color, #f59e0b)',
        'error': 'var(--error-color, #ef4444)',
        
        // Dark theme colors
        dark: {
          'bg-color': 'var(--bg-color, #1a1a1a)',
          'bg-secondary': 'var(--bg-secondary, #2d2d2d)',
          'bg-hover': 'var(--bg-hover, #3d3d3d)',
          'text-primary': 'var(--text-primary, #FAFAFA)',
          'text-secondary': 'var(--text-secondary, #94a3b8)',
          'border-color': 'var(--border-color, #3d3d3d)',
          'primary': 'var(--primary-color, #98FB98)',
          'primary-dark': 'var(--primary-dark, #2E8B57)',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: []
}
