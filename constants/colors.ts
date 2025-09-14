export type Colors = typeof colors.light | typeof colors.dark

export const colors = {
  light: {
    background: '#FFFFFF',
    surface: '#F8F9FA',
    text: '#1F2937',
    textSecondary: '#6B7280',
    border: '#E5E7EB',
    eventBackground: '#3B82F6',
    eventText: '#FFFFFF',
    seperator: '#D1D5DB',
    currentTimeColor: '#EF4444'
  },
  dark: {
    background: '#111827',
    surface: '#1F2937',
    text: '#F9FAFB',
    textSecondary: '#9CA3AF',
    border: '#374151',
    eventBackground: '#2563EB',
    eventText: '#F9FAFB',
    seperator: '#4B5563',
    currentTimeColor: '#F87171'
  }
};