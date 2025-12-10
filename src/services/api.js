import { API_URL } from '../config';

/**
 * API Service for authentication endpoints
 * Handles all login and signup requests to the backend
 */

export const authAPI = {
  /**
   * Login user with email and password
   * @param {string} email - User email
   * @param {string} password - User password
   * @param {string} role - User role (Customer, Tailor, Owner)
   * @returns {Promise} Response with token and user info
   */
  login: async (email, password, role) => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          role,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      return {
        success: true,
        token: data.token,
        email: data.email,
        message: data.message,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Server error. Please try again later.',
      };
    }
  },

  /**
   * Register new user
   * @param {string} email - User email
   * @param {string} password - User password
   * @param {string} role - User role (Customer, Tailor, Owner)
   * @returns {Promise} Response with token and user info
   */
  register: async (email, password, role) => {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          role,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      return {
        success: true,
        token: data.token,
        email: data.email,
        role: data.role,
        message: data.message,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Server error. Please try again later.',
      };
    }
  },

  /**
   * Verify JWT token
   * @param {string} token - JWT token
   * @returns {Promise} Response with verification status
   */
  verifyToken: async (token) => {
    try {
      const response = await fetch(`${API_URL}/auth/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Token verification failed');
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Logout user (clear token from localStorage)
   */
  logout: () => {
    localStorage.removeItem('token');
    return { success: true };
  },

  /**
   * Get stored token from localStorage
   * @returns {string|null} JWT token or null
   */
  getToken: () => {
    return localStorage.getItem('token');
  },

  /**
   * Check if user is authenticated
   * @returns {boolean} True if token exists
   */
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },
};
