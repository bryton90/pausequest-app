// Application routes configuration
export const ROUTES = {
  // Auth routes
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  
  // App routes
  DASHBOARD: '/',
  TIMER: '/timer',
  STATS: '/stats',
  HISTORY: '/history',
  PROFILE: '/profile',
  SETTINGS: '/settings',
  
  // Other routes
  NOT_FOUND: '/404',
  SERVER_ERROR: '/500'
} as const;

export type Route = typeof ROUTES[keyof typeof ROUTES];
