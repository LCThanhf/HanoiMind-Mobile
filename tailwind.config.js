/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.{js,ts,tsx}', './components/**/*.{js,ts,tsx}'],

  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: '#2B8EF0',
        'primary-strong': '#1D4ED8',
        'primary-soft': '#EBF5FF',
        'primary-border': '#BFDBFE',
        success: '#22C55E',
        'success-soft': '#DCFCE7',
        'success-strong': '#16A34A',
        warning: '#F59E0B',
        'warning-soft': '#FEF3C7',
        'warning-strong': '#D97706',
        danger: '#EF4444',
        'danger-soft': '#FEE2E2',
        'danger-strong': '#DC2626',
        info: '#3B82F6',
        'info-soft': '#DBEAFE',
        'info-strong': '#1E3A8A',
        'surface-page': '#F8FAFC',
        'surface-muted': '#F3F4F6',
        'text-primary': '#111827',
        'text-secondary': '#374151',
        'text-tertiary': '#6B7280',
        'text-muted': '#9CA3AF',
      },
    },
  },
  plugins: [],
};
