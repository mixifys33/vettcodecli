// API Configuration for VettCode Developer Authentication

export const API_CONFIG = {
  // Base API URL - change based on environment
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001',
  
  // API Endpoints
  ENDPOINTS: {
    // Authentication
    SIGNUP: '/api/developer-auth/signup',
    LOGIN: '/api/developer-auth/login',
    LOGOUT: '/api/developer-auth/logout',
    ME: '/api/developer-auth/me',
    
    // Profile
    UPDATE_PROFILE: '/api/developer-auth/update-profile',
    GET_STATS: '/api/developer-auth/stats',
  },
  
  // Local Storage Keys
  STORAGE_KEYS: {
    TOKEN: 'vettcode_token',
    DEVELOPER: 'vettcode_developer',
    AUTHENTICATED: 'vettcode_authenticated',
  },
  
  // Request timeout (ms)
  TIMEOUT: 10000,
};

// Helper function to get full API URL
export const getApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Helper function to get auth headers
export const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem(API_CONFIG.STORAGE_KEYS.TOKEN);
  
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Helper function to check if user is authenticated
export const isAuthenticated = (): boolean => {
  return localStorage.getItem(API_CONFIG.STORAGE_KEYS.AUTHENTICATED) === 'true';
};

// Helper function to get developer data
export const getDeveloper = () => {
  const developerData = localStorage.getItem(API_CONFIG.STORAGE_KEYS.DEVELOPER);
  return developerData ? JSON.parse(developerData) : null;
};

// Helper function to logout (clear local storage)
export const logout = () => {
  localStorage.removeItem(API_CONFIG.STORAGE_KEYS.TOKEN);
  localStorage.removeItem(API_CONFIG.STORAGE_KEYS.DEVELOPER);
  localStorage.removeItem(API_CONFIG.STORAGE_KEYS.AUTHENTICATED);
  window.location.href = '/';
};
