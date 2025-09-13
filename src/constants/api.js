// src/constants/api.js
// For physical device with your IP
// export const API_BASE_URL = 'http://192.168.1.103:8000/api/v1';
export const API_BASE_URL = 'https://btr.topscripts.in/peter_boyle@facebook_integration/test/kalam-backend/public/api/v1';

export const API_ENDPOINTS = {
  // Auth endpoints
  REGISTER: '/auth/register',
  LOGIN: '/auth/login',
  LOGOUT: '/logout',
  USER: '/user',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
  
  
  // Test endpoint
  TEST: '/test',  
};

// src/constants/theme.js
export const COLORS = {
  // Based on your Kalam logo
  primary: '#6B46C1', // Purple from logo
  secondary: '#F59E0B', // Gold from logo
  background: '#1F1B2E', // Dark purple background
  surface: '#2D2438',
  text: {
    primary: '#FFFFFF',
    secondary: '#D1D5DB',
    accent: '#F59E0B',
  },
  error: '#EF4444',
  success: '#10B981',
  warning: '#F59E0B',
  info: '#3B82F6',
};

export const FONTS = {
  regular: 'System',
  medium: 'System',
  bold: 'System',
  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};
