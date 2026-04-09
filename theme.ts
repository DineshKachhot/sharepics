const sharedColors = {
  azureRadiance: '#007AFF',
  limedSpruce: '#38434D',
  cornflowerBlue: '#6366F1',
  astral: '#2E78B7',
} as const;

export const lightTheme = {
  colors: {
    ...sharedColors,
    primary: sharedColors.azureRadiance,
    typography: '#000000',
    textSecondary: '#666666',
    background: '#ffffff',
    surface: '#F3F4F6',
    border: '#E5E7EB',
    error: '#EF4444',
  },
  margins: {
    sm: 4,
    md: 8,
    lg: 16,
    xl: 24,
    xxl: 32,
  },
  radii: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
  }
} as const;

export const darkTheme = {
  colors: {
    ...sharedColors,
    primary: sharedColors.azureRadiance,
    typography: '#ffffff',
    textSecondary: '#9CA3AF',
    background: '#000000',
    surface: '#1F2937',
    border: '#374151',
    error: '#F87171',
  },
  margins: {
    sm: 4,
    md: 8,
    lg: 16,
    xl: 24,
    xxl: 32,
  },
  radii: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
  }
} as const;
