export type Colors = typeof colors.light | typeof colors.dark

export const colors = {
  light: {
    background: '#FFFFFF',
    surface: '#F8F9FA',
    text: '#1F2937',
    textSecondary: '#6B7280',
    border: '#E5E7EB',
    primary: '#3B82F6',
    lightText: '#FFFFFF',
    semiSoft: '#D1D5DB',
    red: '#EF4444',
    ghostOpacity: 0.7,
  },
  dark: {
    background: '#111827',
    surface: '#1F2937',
    text: '#F9FAFB',
    textSecondary: '#9CA3AF',
    border: '#374151',
    primary: '#2563EB',
    lightText: '#F9FAFB',
    semiSoft: '#4B5563',
    red: '#F87171',
    ghostOpacity: 0.4,
  }
};