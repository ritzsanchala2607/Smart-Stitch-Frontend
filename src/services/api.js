import {
    API_URL
} from '../config';

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

            return {
                success: true
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    },

    /**
     * Logout user (clear token from localStorage)
     */
    logout: () => {
        localStorage.removeItem('token');
        return {
            success: true
        };
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

/**
 * API Service for worker management endpoints
 * Handles all worker-related requests to the backend
 */
export const workerAPI = {
    /**
     * Add a new worker to the shop
     * @param {Object} workerData - Worker information
     * @param {Object} workerData.user - User details (name, email, password, contactNumber, roleId)
     * @param {Object} workerData.worker - Worker details (workType, experience)
     * @param {Array} workerData.rates - Array of rate objects (workType, rate)
     * @param {string} token - JWT token for authentication
     * @returns {Promise} Response with created worker data
     */
    addWorker: async (workerData, token) => {
        try {
            console.log('API Request - URL:', `${API_URL}/api/workers`);
            console.log('API Request - Token:', token ? `Bearer ${token.substring(0, 20)}...` : 'No token');
            console.log('API Request - Payload:', JSON.stringify(workerData, null, 2));

            const response = await fetch(`${API_URL}/api/workers`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(workerData)
            });

            console.log('API Response - Status:', response.status, response.statusText);
            console.log('API Response - Headers:', Object.fromEntries(response.headers.entries()));

            // Check if response has content
            const contentType = response.headers.get('content-type');
            let data = null;

            if (contentType && contentType.includes('application/json')) {
                const text = await response.text();
                console.log('API Response - Body (text):', text);
                if (text) {
                    data = JSON.parse(text);
                }
            } else {
                // If not JSON, get text response
                const text = await response.text();
                console.log('API Response - Body (non-JSON):', text);
                if (!response.ok) {
                    throw new Error(text || `Server error: ${response.status} ${response.statusText}`);
                }
                data = {
                    message: text || 'Worker added successfully'
                };
            }

            if (!response.ok) {
                throw new Error((data && data.message) || (data && data.error) || `Server error: ${response.status} ${response.statusText}`);
            }

            return {
                success: true,
                data: data,
                message: (data && data.message) || 'Worker added successfully'
            };
        } catch (error) {
            console.error('Worker API Error:', error);
            return {
                success: false,
                error: error.message || 'Server error. Please try again later.'
            };
        }
    },

    /**
     * Get all workers for the shop
     * @param {string} token - JWT token for authentication
     * @returns {Promise} Response with workers list
     */
    getWorkers: async (token) => {
        try {
            const response = await fetch(`${API_URL}/api/workers`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch workers');
            }

            return {
                success: true,
                data: data
            };
        } catch (error) {
            return {
                success: false,
                error: error.message || 'Server error. Please try again later.'
            };
        }
    },

    /**
     * Search workers by name
     * @param {string} name - Worker name to search
     * @param {string} token - JWT token for authentication
     * @returns {Promise} Response with matching workers
     */
    searchWorkers: async (name, token) => {
        try {
            const response = await fetch(`${API_URL}/api/workers?name=${encodeURIComponent(name)}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to search workers');
            }

            return {
                success: true,
                data: data.data || data,
                message: data.message
            };
        } catch (error) {
            return {
                success: false,
                error: error.message || 'Server error. Please try again later.'
            };
        }
    },

    /**
     * Get worker details by ID
     * @param {string} workerId - Worker ID
     * @param {string} token - JWT token for authentication
     * @returns {Promise} Response with worker details
     */
    getWorkerById: async (workerId, token) => {
        try {
            const response = await fetch(`${API_URL}/api/workers/${workerId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch worker details');
            }

            return {
                success: true,
                data: data
            };
        } catch (error) {
            return {
                success: false,
                error: error.message || 'Server error. Please try again later.'
            };
        }
    },

    /**
     * Update worker information
     * @param {string} workerId - Worker ID
     * @param {Object} workerData - Updated worker information
     * @param {string} token - JWT token for authentication
     * @returns {Promise} Response with updated worker data
     */
    updateWorker: async (workerId, workerData, token) => {
        try {
            const response = await fetch(`${API_URL}/api/workers/${workerId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(workerData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to update worker');
            }

            return {
                success: true,
                data: data,
                message: 'Worker updated successfully'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message || 'Server error. Please try again later.'
            };
        }
    },

    /**
     * Delete worker
     * @param {string} workerId - Worker ID
     * @param {string} token - JWT token for authentication
     * @returns {Promise} Response with deletion status
     */
    deleteWorker: async (workerId, token) => {
        try {
            const response = await fetch(`${API_URL}/api/workers/${workerId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Failed to delete worker');
            }

            return {
                success: true,
                message: 'Worker deleted successfully'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message || 'Server error. Please try again later.'
            };
        }
    }
};

/**
 * API Service for customer management endpoints
 * Handles all customer-related requests to the backend
 */
export const customerAPI = {
    /**
     * Add a new customer
     * @param {Object} customerData - Customer information
     * @param {Object} customerData.user - User details (name, email, password, contactNumber, roleId)
     * @param {Object} customerData.measurements - Customer measurements (chest, shoulder, shirtLength, waist, pantLength)
     * @param {string} token - JWT token for authentication
     * @returns {Promise} Response with created customer data
     */
    addCustomer: async (customerData, token) => {
        try {
            console.log('API Request - URL:', `${API_URL}/api/customers`);
            console.log('API Request - Payload:', JSON.stringify(customerData, null, 2));

            const response = await fetch(`${API_URL}/api/customers`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(customerData)
            });

            console.log('API Response - Status:', response.status, response.statusText);

            // Check if response has content
            const contentType = response.headers.get('content-type');
            let data = null;

            if (contentType && contentType.includes('application/json')) {
                const text = await response.text();
                console.log('API Response - Body (text):', text);
                if (text) {
                    data = JSON.parse(text);
                }
            } else {
                const text = await response.text();
                console.log('API Response - Body (non-JSON):', text);
                if (!response.ok) {
                    throw new Error(text || `Server error: ${response.status} ${response.statusText}`);
                }
                data = {
                    message: text || 'Customer added successfully'
                };
            }

            if (!response.ok) {
                throw new Error((data && data.message) || (data && data.error) || `Server error: ${response.status} ${response.statusText}`);
            }

            return {
                success: true,
                data: data.data || data,
                message: (data && data.message) || 'Customer added successfully'
            };
        } catch (error) {
            console.error('Customer API Error:', error);
            return {
                success: false,
                error: error.message || 'Server error. Please try again later.'
            };
        }
    },

    /**
     * Get all customers for the shop
     * @param {string} token - JWT token for authentication
     * @returns {Promise} Response with customers list
     */
    getCustomers: async (token) => {
        try {
            const response = await fetch(`${API_URL}/api/customers`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch customers');
            }

            return {
                success: true,
                data: data.data || data
            };
        } catch (error) {
            return {
                success: false,
                error: error.message || 'Server error. Please try again later.'
            };
        }
    },

    /**
     * Get customer profile (for logged-in customer)
     * @param {string} token - JWT token for authentication
     * @returns {Promise} Response with customer profile data
     */
    getCustomerProfile: async (token) => {
        try {
            console.log('API Request - URL:', `${API_URL}/api/customers/me`);
            console.log('API Request - Token:', token ? `Bearer ${token.substring(0, 20)}...` : 'No token');

            const response = await fetch(`${API_URL}/api/customers/me`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            console.log('API Response - Status:', response.status, response.statusText);

            const data = await response.json();
            console.log('API Response - Data:', data);

            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch profile');
            }

            return {
                success: true,
                data: data.data || data
            };
        } catch (error) {
            console.error('Customer Profile API Error:', error);
            return {
                success: false,
                error: error.message || 'Server error. Please try again later.'
            };
        }
    }
};