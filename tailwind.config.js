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
        'bg-color': 'var(--bg-color, #ffffff)',
        'bg-secondary': 'var(--bg-secondary, #f8fafc)',
        'bg-hover': 'var(--bg-hover, #f1f5f9)',
        'text-primary': 'var(--text-primary, #0f172a)',
        'text-secondary': 'var(--text-secondary, #64748b)',
        'border-color': 'var(--border-color, #e2e8f0)',
        'primary': 'var(--primary-color, #4f46e5)',
        'primary-dark': 'var(--primary-dark, #4338ca)',
        'success': 'var(--success-color, #10b981)',
        'success-dark': 'var(--success-dark, #0d9f6e)',
        'warning': 'var(--warning-color, #f59e0b)',
        'error': 'var(--error-color, #ef4444)',
        
        // Dark theme colors
        dark: {
          'bg-color': 'var(--bg-color, #0f172a)',
          'bg-secondary': 'var(--bg-secondary, #1e293b)',
          'bg-hover': 'var(--bg-hover, #334155)',
          'text-primary': 'var(--text-primary, #f8fafc)',
          'text-secondary': 'var(--text-secondary, #94a3b8)',
          'border-color': 'var(--border-color, #334155)',
          'primary': 'var(--primary-color, #6366f1)',
          'primary-dark': 'var(--primary-dark, #4f46e5)',
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
