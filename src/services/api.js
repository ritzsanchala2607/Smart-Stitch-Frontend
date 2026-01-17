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
    },

    /**
     * Get worker's assigned tasks
     * @param {string} token - JWT token for authentication
     * @returns {Promise} Response with worker's tasks
     */
    getMyTasks: async (token) => {
        try {
            console.log('API Request - URL:', `${API_URL}/api/workers/me/tasks`);

            const response = await fetch(`${API_URL}/api/workers/me/tasks`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            console.log('API Response - Status:', response.status, response.statusText);

            const data = await response.json();
            console.log('API Response - Data:', data);

            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch tasks');
            }

            return {
                success: true,
                data: data.data || data,
                message: data.message
            };
        } catch (error) {
            console.error('Worker Tasks API Error:', error);
            return {
                success: false,
                error: error.message || 'Server error. Please try again later.'
            };
        }
    },

    /**
     * Start a task (change status from PENDING to IN_PROGRESS)
     * @param {number} taskId - Task ID
     * @param {string} token - JWT token for authentication
     * @returns {Promise} Response with updated task data
     */
    startTask: async (taskId, token) => {
        try {
            console.log('API Request - URL:', `${API_URL}/api/tasks/${taskId}/start`);

            const response = await fetch(`${API_URL}/api/tasks/${taskId}/start`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            console.log('API Response - Status:', response.status, response.statusText);

            const data = await response.json();
            console.log('API Response - Data:', data);

            if (!response.ok) {
                throw new Error(data.message || 'Failed to start task');
            }

            return {
                success: true,
                data: data.data || data,
                message: data.message || 'Task started successfully'
            };
        } catch (error) {
            console.error('Start Task API Error:', error);
            return {
                success: false,
                error: error.message || 'Server error. Please try again later.'
            };
        }
    },

    /**
     * Complete a task (change status from IN_PROGRESS to COMPLETED)
     * @param {number} taskId - Task ID
     * @param {string} token - JWT token for authentication
     * @returns {Promise} Response with updated task data
     */
    completeTask: async (taskId, token) => {
        try {
            console.log('API Request - URL:', `${API_URL}/api/tasks/${taskId}/complete`);

            const response = await fetch(`${API_URL}/api/tasks/${taskId}/complete`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            console.log('API Response - Status:', response.status, response.statusText);

            const data = await response.json();
            console.log('API Response - Data:', data);

            if (!response.ok) {
                throw new Error(data.message || 'Failed to complete task');
            }

            return {
                success: true,
                data: data.data || data,
                message: data.message || 'Task completed successfully'
            };
        } catch (error) {
            console.error('Complete Task API Error:', error);
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
    },

    /**
     * Search customers by name
     * @param {string} name - Customer name to search
     * @param {string} token - JWT token for authentication
     * @returns {Promise} Response with matching customers
     */
    searchCustomers: async (name, token) => {
        try {
            // Try with name parameter first
            console.log('API Request - URL:', `${API_URL}/api/customers?name=${encodeURIComponent(name)}`);

            const response = await fetch(`${API_URL}/api/customers?name=${encodeURIComponent(name)}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();
            console.log('Customer search response:', data);

            // If backend doesn't support name search, fall back to getting all customers
            // and filter on frontend
            if (!response.ok || (data.message && data.message.includes('unexpected error'))) {
                console.log('Backend search not supported, fetching all customers for client-side filtering');

                const allCustomersResponse = await fetch(`${API_URL}/api/customers`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                const allCustomersData = await allCustomersResponse.json();

                if (!allCustomersResponse.ok) {
                    throw new Error(allCustomersData.message || 'Failed to fetch customers');
                }

                // Filter customers by name on frontend
                const customers = allCustomersData.data || allCustomersData;
                const filtered = customers.filter(customer => {
                    const customerName = (customer.user && customer.user.name) || customer.name || '';
                    return customerName.toLowerCase().includes(name.toLowerCase());
                });

                return {
                    success: true,
                    data: filtered,
                    message: 'Customers filtered successfully'
                };
            }

            return {
                success: true,
                data: data.data || data,
                message: data.message
            };
        } catch (error) {
            console.error('Customer Search API Error:', error);
            return {
                success: false,
                error: error.message || 'Server error. Please try again later.'
            };
        }
    },

    /**
     * Delete customer
     * @param {number} customerId - Customer ID to delete
     * @param {string} token - JWT token for authentication
     * @returns {Promise} Response with deletion status
     */
    deleteCustomer: async (customerId, token) => {
        try {
            console.log('API Request - URL:', `${API_URL}/api/customers/${customerId}`);
            console.log('API Request - Method: DELETE');
            console.log('API Request - Token:', token ? `Bearer ${token.substring(0, 20)}...` : 'No token');

            const response = await fetch(`${API_URL}/api/customers/${customerId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
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
                    try {
                        data = JSON.parse(text);
                    } catch (e) {
                        console.error('Failed to parse JSON:', e);
                        data = {
                            message: text
                        };
                    }
                }
            } else {
                const text = await response.text();
                console.log('API Response - Body (non-JSON):', text);
                if (!response.ok) {
                    throw new Error(text || `Server error: ${response.status} ${response.statusText}`);
                }
                data = {
                    message: text || 'Customer deleted successfully'
                };
            }

            if (!response.ok) {
                const errorMessage = (data && data.message) || (data && data.error) || `Server error: ${response.status} ${response.statusText}`;
                console.error('Delete failed with error:', errorMessage);
                throw new Error(errorMessage);
            }

            return {
                success: true,
                data: data.data || null,
                message: (data && data.message) || 'Customer deleted successfully'
            };
        } catch (error) {
            console.error('Delete Customer API Error:', error);
            return {
                success: false,
                error: error.message || 'Server error. Please try again later.'
            };
        }
    },

    /**
     * Create measurement profile for customer
     * @param {Object} measurementData - Measurement profile data
     * @param {number} measurementData.customerId - Customer ID
     * @param {string} measurementData.dressType - Dress type (PANT, SHIRT, COAT, KURTA, DHOTI, CUSTOM)
     * @param {string} measurementData.notes - Optional notes
     * @param {Object} measurementData.measurements - Measurement values (varies by dress type)
     * @param {string} token - JWT token for authentication
     * @returns {Promise} Response with created measurement profile
     */
    createMeasurementProfile: async (measurementData, token) => {
        try {
            console.log('API Request - URL:', `${API_URL}/api/measurements`);
            console.log('API Request - Payload:', JSON.stringify(measurementData, null, 2));

            const response = await fetch(`${API_URL}/api/measurements`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(measurementData)
            });

            console.log('API Response - Status:', response.status, response.statusText);

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
                    message: text || 'Measurement profile created successfully'
                };
            }

            if (!response.ok) {
                throw new Error((data && data.message) || (data && data.error) || `Server error: ${response.status} ${response.statusText}`);
            }

            return {
                success: true,
                data: data.data || data,
                message: (data && data.message) || 'Measurement profile created successfully'
            };
        } catch (error) {
            console.error('Create Measurement Profile API Error:', error);
            return {
                success: false,
                error: error.message || 'Server error. Please try again later.'
            };
        }
    },

    /**
     * Get measurement profiles for a customer
     * @param {number} customerId - Customer ID
     * @param {string} token - JWT token for authentication
     * @returns {Promise} Response with measurement profiles list
     */
    getMeasurementProfiles: async (customerId, token) => {
        try {
            console.log('API Request - URL:', `${API_URL}/api/measurements/customer/${customerId}`);

            const response = await fetch(`${API_URL}/api/measurements/customer/${customerId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            console.log('API Response - Status:', response.status, response.statusText);

            const data = await response.json();
            console.log('API Response - Data:', data);

            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch measurement profiles');
            }

            return {
                success: true,
                data: data.data || data,
                message: data.message
            };
        } catch (error) {
            console.error('Get Measurement Profiles API Error:', error);
            return {
                success: false,
                error: error.message || 'Server error. Please try again later.'
            };
        }
    },

    /**
     * Get measurement profiles for a customer by customerId
     * @param {number} customerId - Customer ID
     * @param {string} token - JWT token for authentication
     * @returns {Promise} Response with measurement profiles list
     */
    getMeasurementProfilesByCustomerId: async (customerId, token) => {
        try {
            console.log('API Request - URL:', `${API_URL}/api/measurements/customer-id/${customerId}`);

            const response = await fetch(`${API_URL}/api/measurements/customer-id/${customerId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            console.log('API Response - Status:', response.status, response.statusText);

            const data = await response.json();
            console.log('API Response - Data:', data);

            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch measurement profiles');
            }

            return {
                success: true,
                data: data.data || data,
                message: data.message
            };
        } catch (error) {
            console.error('Get Measurement Profiles by Customer ID API Error:', error);
            return {
                success: false,
                error: error.message || 'Server error. Please try again later.'
            };
        }
    },

    /**
     * Update measurement profile
     * @param {number} profileId - Measurement profile ID
     * @param {Object} updateData - Updated measurement data
     * @param {string} updateData.notes - Optional notes
     * @param {Object} updateData.measurements - Updated measurement values
     * @param {string} token - JWT token for authentication
     * @returns {Promise} Response with updated measurement profile
     */
    updateMeasurementProfile: async (profileId, updateData, token) => {
        try {
            console.log('API Request - URL:', `${API_URL}/api/measurements/${profileId}`);
            console.log('API Request - Payload:', JSON.stringify(updateData, null, 2));

            const response = await fetch(`${API_URL}/api/measurements/${profileId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updateData)
            });

            console.log('API Response - Status:', response.status, response.statusText);

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
                    message: text || 'Measurement profile updated successfully'
                };
            }

            if (!response.ok) {
                throw new Error((data && data.message) || (data && data.error) || `Server error: ${response.status} ${response.statusText}`);
            }

            return {
                success: true,
                data: data.data || data,
                message: (data && data.message) || 'Measurement profile updated successfully'
            };
        } catch (error) {
            console.error('Update Measurement Profile API Error:', error);
            return {
                success: false,
                error: error.message || 'Server error. Please try again later.'
            };
        }
    },

    /**
     * Get customer's own orders (for logged-in customer)
     * @param {string} token - JWT token for authentication
     * @returns {Promise} Response with customer's orders
     */
    getMyOrders: async (token) => {
        try {
            console.log('API Request - URL:', `${API_URL}/api/orders/status`);

            const response = await fetch(`${API_URL}/api/orders/status`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            console.log('API Response - Status:', response.status, response.statusText);

            const data = await response.json();
            console.log('API Response - Data:', data);

            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch orders');
            }

            return {
                success: true,
                data: Array.isArray(data) ? data : (data.data || []),
                message: data.message || 'Orders fetched successfully'
            };
        } catch (error) {
            console.error('Customer Orders API Error:', error);
            return {
                success: false,
                error: error.message || 'Server error. Please try again later.'
            };
        }
    },

    /**
     * Get customer dashboard statistics
     * @param {string} token - JWT token for authentication
     * @returns {Promise} Response with customer statistics
     */
    getCustomerStats: async (token) => {
        try {
            console.log('API Request - URL:', `${API_URL}/api/customers/me/stats`);

            const response = await fetch(`${API_URL}/api/customers/me/stats`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            console.log('API Response - Status:', response.status, response.statusText);

            const data = await response.json();
            console.log('API Response - Data:', data);

            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch statistics');
            }

            return {
                success: true,
                data: data.data || data,
                message: data.message || 'Statistics fetched successfully'
            };
        } catch (error) {
            console.error('Customer Stats API Error:', error);
            return {
                success: false,
                error: error.message || 'Server error. Please try again later.'
            };
        }
    },

    /**
     * Get customer payment history
     * @param {string} token - JWT token for authentication
     * @returns {Promise} Response with payment history
     */
    getPaymentHistory: async (token) => {
        try {
            console.log('API Request - URL:', `${API_URL}/api/customers/me/payments`);

            const response = await fetch(`${API_URL}/api/customers/me/payments`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            console.log('API Response - Status:', response.status, response.statusText);

            const data = await response.json();
            console.log('API Response - Data:', data);

            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch payment history');
            }

            return {
                success: true,
                data: data.data || data,
                message: data.message || 'Payment history fetched successfully'
            };
        } catch (error) {
            console.error('Payment History API Error:', error);
            return {
                success: false,
                error: error.message || 'Server error. Please try again later.'
            };
        }
    },

    /**
     * Get customer order history with optional date filtering
     * @param {string} token - JWT token for authentication
     * @param {Object} filters - Optional filters (year, month, startDate, endDate)
     * @returns {Promise} Response with order history
     */
    getOrderHistory: async (token, filters = {}) => {
        try {
            // Build query string from filters
            const queryParams = new URLSearchParams();
            if (filters.year) queryParams.append('year', filters.year);
            if (filters.month) queryParams.append('month', filters.month);
            if (filters.startDate) queryParams.append('startDate', filters.startDate);
            if (filters.endDate) queryParams.append('endDate', filters.endDate);

            const queryString = queryParams.toString();
            const url = `${API_URL}/api/customers/me/orders/history${queryString ? `?${queryString}` : ''}`;

            console.log('API Request - URL:', url);

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            console.log('API Response - Status:', response.status, response.statusText);

            const data = await response.json();
            console.log('API Response - Data:', data);

            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch order history');
            }

            return {
                success: true,
                data: data.data || data,
                message: data.message || 'Order history fetched successfully'
            };
        } catch (error) {
            console.error('Order History API Error:', error);
            return {
                success: false,
                error: error.message || 'Server error. Please try again later.'
            };
        }
    },

    /**
     * Get recent activities for customer dashboard
     * @param {string} token - JWT token for authentication
     * @param {number} limit - Number of activities to fetch (default: 10)
     * @returns {Promise} Response with recent activities
     */
    getRecentActivities: async (token, limit = 10) => {
        try {
            const url = `${API_URL}/api/customers/me/activities${limit ? `?limit=${limit}` : ''}`;
            console.log('API Request - URL:', url);

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            console.log('API Response - Status:', response.status, response.statusText);

            const data = await response.json();
            console.log('API Response - Data:', data);

            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch recent activities');
            }

            return {
                success: true,
                data: data.data || data,
                message: data.message || 'Recent activities fetched successfully'
            };
        } catch (error) {
            console.error('Recent Activities API Error:', error);
            return {
                success: false,
                error: error.message || 'Server error. Please try again later.'
            };
        }
    }
};

/**
 * API Service for order management endpoints
 * Handles all order-related requests to the backend
 */
export const orderAPI = {
    /**
     * Create a new order
     * @param {Object} orderData - Order information
     * @param {string} token - JWT token for authentication
     * @returns {Promise} Response with created order data
     */
    createOrder: async (orderData, token) => {
        try {
            console.log('API Request - URL:', `${API_URL}/api/orders`);
            console.log('API Request - Payload:', JSON.stringify(orderData, null, 2));

            const response = await fetch(`${API_URL}/api/orders`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(orderData)
            });

            console.log('API Response - Status:', response.status, response.statusText);

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
                    message: text || 'Order created successfully'
                };
            }

            if (!response.ok) {
                throw new Error((data && data.message) || (data && data.error) || `Server error: ${response.status} ${response.statusText}`);
            }

            return {
                success: true,
                data: data.data || data,
                message: (data && data.message) || 'Order created successfully'
            };
        } catch (error) {
            console.error('Order API Error:', error);
            return {
                success: false,
                error: error.message || 'Server error. Please try again later.'
            };
        }
    },

    /**
     * Get all orders for the shop
     * @param {string} token - JWT token for authentication
     * @returns {Promise} Response with orders list
     */
    getOrders: async (token) => {
        try {
            console.log('API Request - URL:', `${API_URL}/api/orders`);

            const response = await fetch(`${API_URL}/api/orders`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            console.log('API Response - Status:', response.status, response.statusText);

            const data = await response.json();
            console.log('API Response - Data:', data);

            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch orders');
            }

            return {
                success: true,
                data: data.data || data,
                message: data.message
            };
        } catch (error) {
            console.error('Order Fetch API Error:', error);
            return {
                success: false,
                error: error.message || 'Server error. Please try again later.'
            };
        }
    },

    /**
     * Get daily orders summary for a specific date
     * @param {string} date - Date in YYYY-MM-DD format
     * @param {string} token - JWT token for authentication
     * @returns {Promise} Response with daily orders summary
     */
    getDailyOrders: async (date, token) => {
        try {
            console.log('API Request - URL:', `${API_URL}/api/orders/daily?date=${date}`);

            const response = await fetch(`${API_URL}/api/orders/daily?date=${date}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            console.log('API Response - Status:', response.status, response.statusText);

            const data = await response.json();
            console.log('API Response - Data:', data);

            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch daily orders');
            }

            return {
                success: true,
                data: data,
                message: data.message || 'Daily orders fetched successfully'
            };
        } catch (error) {
            console.error('Daily Orders API Error:', error);
            return {
                success: false,
                error: error.message || 'Server error. Please try again later.'
            };
        }
    },

    /**
     * Get weekly orders summary
     * @param {string} token - JWT token for authentication
     * @returns {Promise} Response with weekly orders summary
     */
    getWeeklyOrders: async (token) => {
        try {
            console.log('API Request - URL:', `${API_URL}/api/orders/weekly`);

            const response = await fetch(`${API_URL}/api/orders/weekly`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            console.log('API Response - Status:', response.status, response.statusText);

            const data = await response.json();
            console.log('API Response - Data:', data);

            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch weekly orders');
            }

            return {
                success: true,
                data: data,
                message: data.message || 'Weekly orders fetched successfully'
            };
        } catch (error) {
            console.error('Weekly Orders API Error:', error);
            return {
                success: false,
                error: error.message || 'Server error. Please try again later.'
            };
        }
    },

    /**
     * Mark order as delivered
     * @param {number} orderId - Order ID
     * @param {string} token - JWT token for authentication
     * @returns {Promise} Response with updated order data
     */
    markAsDelivered: async (orderId, token) => {
        try {
            console.log('API Request - URL:', `${API_URL}/api/orders/${orderId}/deliver`);

            const response = await fetch(`${API_URL}/api/orders/${orderId}/deliver`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            console.log('API Response - Status:', response.status, response.statusText);

            const data = await response.json();
            console.log('API Response - Data:', data);

            if (!response.ok) {
                throw new Error(data.message || 'Failed to mark order as delivered');
            }

            return {
                success: true,
                data: data.data || data,
                message: data.message || 'Order marked as delivered successfully'
            };
        } catch (error) {
            console.error('Mark as Delivered API Error:', error);
            return {
                success: false,
                error: error.message || 'Server error. Please try again later.'
            };
        }
    },

    /**
     * Get order by ID
     * @param {number} orderId - Order ID
     * @param {string} token - JWT token for authentication
     * @returns {Promise} Response with order details
     */
    getOrderById: async (orderId, token) => {
        try {
            console.log('API Request - URL:', `${API_URL}/api/orders/${orderId}`);

            const response = await fetch(`${API_URL}/api/orders/${orderId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            console.log('API Response - Status:', response.status, response.statusText);

            const data = await response.json();
            console.log('API Response - Data:', data);

            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch order details');
            }

            return {
                success: true,
                data: data.data || data,
                message: data.message || 'Order fetched successfully'
            };
        } catch (error) {
            console.error('Get Order API Error:', error);
            return {
                success: false,
                error: error.message || 'Server error. Please try again later.'
            };
        }
    },

    /**
     * Update order
     * @param {number} orderId - Order ID
     * @param {Object} orderData - Updated order data
     * @param {string} token - JWT token for authentication
     * @returns {Promise} Response with updated order data
     */
    updateOrder: async (orderId, orderData, token) => {
        try {
            console.log('API Request - URL:', `${API_URL}/api/orders/${orderId}`);
            console.log('API Request - Payload:', JSON.stringify(orderData, null, 2));

            const response = await fetch(`${API_URL}/api/orders/${orderId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(orderData)
            });

            console.log('API Response - Status:', response.status, response.statusText);

            const data = await response.json();
            console.log('API Response - Data:', data);

            if (!response.ok) {
                throw new Error(data.message || 'Failed to update order');
            }

            return {
                success: true,
                data: data.data || data,
                message: data.message || 'Order updated successfully'
            };
        } catch (error) {
            console.error('Update Order API Error:', error);
            return {
                success: false,
                error: error.message || 'Server error. Please try again later.'
            };
        }
    }
};


/**
 * API Service for rating endpoints
 * Handles all rating-related requests to the backend
 */
export const ratingAPI = {
    /**
     * Rate a shop
     * @param {Object} ratingData - Rating data
     * @param {number} ratingData.orderId - Order ID
     * @param {number} ratingData.rating - Rating (1-5)
     * @param {string} ratingData.review - Review text (optional)
     * @param {string} token - JWT token for authentication
     * @returns {Promise} Response with rating data
     */
    rateShop: async (ratingData, token) => {
        try {
            console.log('API Request - URL:', `${API_URL}/api/ratings/shop`);
            console.log('API Request - Payload:', JSON.stringify(ratingData, null, 2));

            const response = await fetch(`${API_URL}/api/ratings/shop`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(ratingData)
            });

            console.log('API Response - Status:', response.status, response.statusText);

            const data = await response.json();
            console.log('API Response - Data:', data);

            if (!response.ok) {
                throw new Error(data.message || 'Failed to submit shop rating');
            }

            return {
                success: true,
                data: data.data || data,
                message: data.message || 'Shop rating submitted successfully'
            };
        } catch (error) {
            console.error('Shop Rating API Error:', error);
            return {
                success: false,
                error: error.message || 'Server error. Please try again later.'
            };
        }
    },

    /**
     * Rate a worker
     * @param {Object} ratingData - Rating data
     * @param {number} ratingData.orderId - Order ID
     * @param {number} ratingData.workerId - Worker ID
     * @param {number} ratingData.rating - Rating (1-5)
     * @param {string} ratingData.review - Review text (optional)
     * @param {string} token - JWT token for authentication
     * @returns {Promise} Response with rating data
     */
    rateWorker: async (ratingData, token) => {
        try {
            console.log('API Request - URL:', `${API_URL}/api/ratings/worker`);
            console.log('API Request - Payload:', JSON.stringify(ratingData, null, 2));

            const response = await fetch(`${API_URL}/api/ratings/worker`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(ratingData)
            });

            console.log('API Response - Status:', response.status, response.statusText);

            const data = await response.json();
            console.log('API Response - Data:', data);

            if (!response.ok) {
                throw new Error(data.message || 'Failed to submit worker rating');
            }

            return {
                success: true,
                data: data.data || data,
                message: data.message || 'Worker rating submitted successfully'
            };
        } catch (error) {
            console.error('Worker Rating API Error:', error);
            return {
                success: false,
                error: error.message || 'Server error. Please try again later.'
            };
        }
    },

    /**
     * Get shop ratings
     * @param {number} shopId - Shop ID
     * @param {string} token - JWT token for authentication
     * @returns {Promise} Response with shop ratings
     */
    getShopRatings: async (shopId, token) => {
        try {
            console.log('API Request - URL:', `${API_URL}/api/ratings/shop/${shopId}`);

            const response = await fetch(`${API_URL}/api/ratings/shop/${shopId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            console.log('API Response - Status:', response.status, response.statusText);

            const data = await response.json();
            console.log('API Response - Data:', data);

            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch shop ratings');
            }

            return {
                success: true,
                data: data.data || data,
                message: data.message
            };
        } catch (error) {
            console.error('Get Shop Ratings API Error:', error);
            return {
                success: false,
                error: error.message || 'Server error. Please try again later.'
            };
        }
    },

    /**
     * Get shop rating summary
     * @param {number} shopId - Shop ID
     * @param {string} token - JWT token for authentication
     * @returns {Promise} Response with average rating and count
     */
    getShopRatingSummary: async (shopId, token) => {
        try {
            console.log('API Request - URL:', `${API_URL}/api/ratings/shop/${shopId}/summary`);

            const response = await fetch(`${API_URL}/api/ratings/shop/${shopId}/summary`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            console.log('API Response - Status:', response.status, response.statusText);

            const data = await response.json();
            console.log('API Response - Data:', data);

            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch shop rating summary');
            }

            return {
                success: true,
                data: data.data || data,
                message: data.message
            };
        } catch (error) {
            console.error('Get Shop Rating Summary API Error:', error);
            return {
                success: false,
                error: error.message || 'Server error. Please try again later.'
            };
        }
    },

    /**
     * Get worker ratings
     * @param {number} workerId - Worker ID
     * @param {string} token - JWT token for authentication
     * @returns {Promise} Response with worker ratings
     */
    getWorkerRatings: async (workerId, token) => {
        try {
            console.log('API Request - URL:', `${API_URL}/api/ratings/worker/${workerId}`);

            const response = await fetch(`${API_URL}/api/ratings/worker/${workerId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            console.log('API Response - Status:', response.status, response.statusText);

            const data = await response.json();
            console.log('API Response - Data:', data);

            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch worker ratings');
            }

            return {
                success: true,
                data: data.data || data,
                message: data.message
            };
        } catch (error) {
            console.error('Get Worker Ratings API Error:', error);
            return {
                success: false,
                error: error.message || 'Server error. Please try again later.'
            };
        }
    },

    /**
     * Get worker rating summary
     * @param {number} workerId - Worker ID
     * @param {string} token - JWT token for authentication
     * @returns {Promise} Response with average rating and count
     */
    getWorkerRatingSummary: async (workerId, token) => {
        try {
            console.log('API Request - URL:', `${API_URL}/api/ratings/worker/${workerId}/summary`);

            const response = await fetch(`${API_URL}/api/ratings/worker/${workerId}/summary`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            console.log('API Response - Status:', response.status, response.statusText);

            const data = await response.json();
            console.log('API Response - Data:', data);

            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch worker rating summary');
            }

            return {
                success: true,
                data: data.data || data,
                message: data.message
            };
        } catch (error) {
            console.error('Get Worker Rating Summary API Error:', error);
            return {
                success: false,
                error: error.message || 'Server error. Please try again later.'
            };
        }
    }
};

/**
 * API Service for shop information endpoints
 * Handles shop-related requests to the backend
 */
export const shopAPI = {
    /**
     * Get shop information with ratings
     * @param {number} shopId - Shop ID
     * @param {string} token - JWT token for authentication
     * @returns {Promise} Response with shop information
     */
    getShopInfo: async (shopId, token) => {
        try {
            console.log('API Request - URL:', `${API_URL}/api/shops/${shopId}`);

            const response = await fetch(`${API_URL}/api/shops/${shopId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            console.log('API Response - Status:', response.status, response.statusText);

            const data = await response.json();
            console.log('API Response - Data:', data);

            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch shop information');
            }

            return {
                success: true,
                data: data.data || data,
                message: data.message || 'Shop information fetched successfully'
            };
        } catch (error) {
            console.error('Shop Info API Error:', error);
            return {
                success: false,
                error: error.message || 'Server error. Please try again later.'
            };
        }
    }
};