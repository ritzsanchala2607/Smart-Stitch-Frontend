import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { customerAPI, orderAPI, workerAPI, adminAPI } from '../services/api';
import { useAuth } from './AuthContext';

const DataContext = createContext();

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within DataProvider');
  }
  return context;
};

/**
 * DataProvider - Global state management with caching
 * 
 * Features:
 * - Caches API responses to avoid redundant calls
 * - Provides data to all components via context
 * - Automatically refetches when data becomes stale
 * - Handles loading and error states globally
 * - Invalidates cache when mutations occur
 */
export const DataProvider = ({ children }) => {
  const { user } = useAuth();
  
  // Cache state
  const [cache, setCache] = useState({
    customers: { data: null, loading: false, error: null, timestamp: null },
    orders: { data: null, loading: false, error: null, timestamp: null },
    workers: { data: null, loading: false, error: null, timestamp: null },
    tasks: { data: null, loading: false, error: null, timestamp: null },
    profile: { data: null, loading: false, error: null, timestamp: null },
    // Customer-specific caches
    myOrders: { data: null, loading: false, error: null, timestamp: null },
    customerStats: { data: null, loading: false, error: null, timestamp: null },
    recentActivities: { data: null, loading: false, error: null, timestamp: null },
    measurementProfiles: { data: null, loading: false, error: null, timestamp: null },
    // Admin-specific caches
    adminDashboard: { data: null, loading: false, error: null, timestamp: null },
    shopAnalytics: { data: null, loading: false, error: null, timestamp: null },
    allShops: { data: null, loading: false, error: null, timestamp: null, searchQuery: '' },
    platformAnalytics: { data: null, loading: false, error: null, timestamp: null },
  });

  // Cache expiration time (5 minutes)
  const CACHE_DURATION = 5 * 60 * 1000;

  // Helper to check if cache is stale
  const isCacheStale = useCallback((key) => {
    const cached = cache[key];
    if (!cached.timestamp) return true;
    return Date.now() - cached.timestamp > CACHE_DURATION;
  }, [cache]);

  // Helper to get token
  const getToken = useCallback(() => {
    let token = localStorage.getItem('token');
    if (!token) {
      const userDataString = localStorage.getItem('user');
      if (userDataString) {
        try {
          const userData = JSON.parse(userDataString);
          token = userData.jwt || userData.token;
        } catch (e) {
          console.error('Error parsing user data:', e);
        }
      }
    }
    return token;
  }, []);

  // Update cache helper
  const updateCache = useCallback((key, updates) => {
    setCache(prev => ({
      ...prev,
      [key]: { ...prev[key], ...updates }
    }));
  }, []);

  // Clear all cache (useful on logout)
  const clearCache = useCallback(() => {
    setCache({
      customers: { data: null, loading: false, error: null, timestamp: null },
      orders: { data: null, loading: false, error: null, timestamp: null },
      workers: { data: null, loading: false, error: null, timestamp: null },
      tasks: { data: null, loading: false, error: null, timestamp: null },
      profile: { data: null, loading: false, error: null, timestamp: null },
      myOrders: { data: null, loading: false, error: null, timestamp: null },
      customerStats: { data: null, loading: false, error: null, timestamp: null },
      recentActivities: { data: null, loading: false, error: null, timestamp: null },
      measurementProfiles: { data: null, loading: false, error: null, timestamp: null },
      adminDashboard: { data: null, loading: false, error: null, timestamp: null },
      shopAnalytics: { data: null, loading: false, error: null, timestamp: null },
      allShops: { data: null, loading: false, error: null, timestamp: null, searchQuery: '' },
      platformAnalytics: { data: null, loading: false, error: null, timestamp: null },
    });
  }, []);

  // Clear cache on logout
  useEffect(() => {
    if (!user) {
      clearCache();
    }
  }, [user, clearCache]);

  // ==================== CUSTOMERS ====================
  
  const fetchCustomers = useCallback(async (force = false) => {
    // Return cached data if available and not stale
    if (!force && cache.customers.data && !isCacheStale('customers')) {
      return { success: true, data: cache.customers.data, fromCache: true };
    }

    // Prevent duplicate requests
    if (cache.customers.loading) {
      return { success: false, error: 'Request in progress', fromCache: false };
    }

    const token = getToken();
    if (!token) {
      const error = 'Authentication required';
      updateCache('customers', { error, loading: false });
      return { success: false, error };
    }

    updateCache('customers', { loading: true, error: null });

    try {
      const result = await customerAPI.getCustomers(token);
      
      if (result.success) {
        // Map and cache the data
        const mappedCustomers = (result.data || []).map(customer => {
          const userId = customer.user?.userId || customer.userId;
          const customerId = customer.customerId || customer.id;
          
          return {
            id: customerId,
            userId: userId,
            name: customer.user?.name || customer.name,
            email: customer.user?.email || customer.email,
            phone: customer.user?.contactNumber || customer.phone,
            address: '',
            joinDate: customer.createdAt ? new Date(customer.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            totalOrders: 0,
            totalSpent: 0,
            measurements: {
              pant: {
                length: customer.measurements?.pantLength || '',
                waist: customer.measurements?.pantWaist || '',
                seatHips: customer.measurements?.seatHips || customer.measurements?.seatHip || '',
                thigh: customer.measurements?.thigh || '',
                knee: customer.measurements?.knee || '',
                bottomOpening: customer.measurements?.bottomOpening || customer.measurements?.bottom || '',
                thighCircumference: customer.measurements?.thighCircumference || ''
              },
              shirt: {
                length: customer.measurements?.shirtLength || '',
                chest: customer.measurements?.chest || '',
                waist: customer.measurements?.shirtWaist || '',
                shoulder: customer.measurements?.shoulder || '',
                sleeveLength: customer.measurements?.sleeveLength || '',
                armhole: customer.measurements?.armhole || '',
                collar: customer.measurements?.collar || ''
              },
              coat: {
                length: customer.measurements?.coatLength || '',
                chest: customer.measurements?.coatChest || '',
                waist: customer.measurements?.coatWaist || '',
                shoulder: customer.measurements?.coatShoulder || '',
                sleeveLength: customer.measurements?.coatSleeveLength || '',
                armhole: customer.measurements?.coatArmhole || ''
              },
              kurta: {
                length: customer.measurements?.kurtaLength || '',
                chest: customer.measurements?.kurtaChest || '',
                waist: customer.measurements?.kurtaWaist || '',
                seatHips: customer.measurements?.kurtaSeatHips || customer.measurements?.kurtaHip || '',
                flare: customer.measurements?.kurtaFlare || '',
                shoulder: customer.measurements?.kurtaShoulder || '',
                armhole: customer.measurements?.kurtaArmhole || '',
                sleeve: customer.measurements?.kurtaSleeve || customer.measurements?.kurtaSleeveLength || '',
                bottomOpening: customer.measurements?.kurtaBottomOpening || '',
                frontNeck: customer.measurements?.kurtaFrontNeck || '',
                backNeck: customer.measurements?.kurtaBackNeck || ''
              },
              dhoti: {
                length: customer.measurements?.dhotiLength || '',
                waist: customer.measurements?.dhotiWaist || '',
                hip: customer.measurements?.dhotiHip || '',
                sideLength: customer.measurements?.sideLength || '',
                foldLength: customer.measurements?.foldLength || ''
              },
              custom: customer.measurements?.customMeasurements || ''
            },
            avatar: customer.user?.profilePicture || null
          };
        });

        updateCache('customers', {
          data: mappedCustomers,
          loading: false,
          error: null,
          timestamp: Date.now()
        });

        // Fetch orders in background to update stats
        fetchOrders().then(ordersResult => {
          if (ordersResult.success && ordersResult.data) {
            const customerStats = {};
            ordersResult.data.forEach(order => {
              const customerId = order.customer?.customerId || order.customerId;
              if (!customerId) return;

              if (!customerStats[customerId]) {
                customerStats[customerId] = { totalOrders: 0, totalSpent: 0 };
              }

              customerStats[customerId].totalOrders++;
              // Use totalPrice (total order value) for totalSpent, not paidAmount
              // totalSpent represents the total value of orders, not just what's been paid
              customerStats[customerId].totalSpent += order.totalPrice || order.totalAmount || 0;
            });

            // Update customers with stats
            const customersWithStats = mappedCustomers.map(customer => ({
              ...customer,
              totalOrders: customerStats[customer.id]?.totalOrders || 0,
              totalSpent: customerStats[customer.id]?.totalSpent || 0
            }));

            updateCache('customers', {
              data: customersWithStats,
              timestamp: Date.now()
            });
          }
        });

        return { success: true, data: mappedCustomers, fromCache: false };
      } else {
        updateCache('customers', { loading: false, error: result.error });
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorMsg = error.message || 'Failed to fetch customers';
      updateCache('customers', { loading: false, error: errorMsg });
      return { success: false, error: errorMsg };
    }
  }, [cache.customers, isCacheStale, getToken, updateCache]);

  // ==================== ORDERS ====================
  
  const fetchOrders = useCallback(async (force = false) => {
    if (!force && cache.orders.data && !isCacheStale('orders')) {
      return { success: true, data: cache.orders.data, fromCache: true };
    }

    if (cache.orders.loading) {
      return { success: false, error: 'Request in progress', fromCache: false };
    }

    const token = getToken();
    if (!token) {
      const error = 'Authentication required';
      updateCache('orders', { error, loading: false });
      return { success: false, error };
    }

    updateCache('orders', { loading: true, error: null });

    try {
      const result = await orderAPI.getOrders(token);

      if (result.success) {
        const mappedOrders = (result.data || []).map(order => ({
          id: `ORD${String(order.orderId).padStart(3, '0')}`,
          orderId: order.orderId,
          customerId: order.customer?.customerId || order.customerId,
          customerName: order.customer?.name || order.customerName || 'Unknown Customer',
          orderDate: order.createdAt ? new Date(order.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          deliveryDate: order.deadline,
          status: order.status ? order.status.toLowerCase() : 'pending',
          priority: 'medium',
          items: order.items || [],
          totalAmount: order.totalPrice || 0,
          paidAmount: order.paidAmount || order.advancePayment || 0,
          balanceAmount: (order.totalPrice || 0) - (order.paidAmount || order.advancePayment || 0),
          measurements: order.measurements || {},
          notes: order.notes || order.additionalNotes || '',
          assignedWorker: null,
          workerName: null,
          assignmentMode: 'individual',
          customer: order.customer // Keep full customer object for reference
        }));

        updateCache('orders', {
          data: mappedOrders,
          loading: false,
          error: null,
          timestamp: Date.now()
        });

        return { success: true, data: mappedOrders, fromCache: false };
      } else {
        updateCache('orders', { loading: false, error: result.error });
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorMsg = error.message || 'Failed to fetch orders';
      updateCache('orders', { loading: false, error: errorMsg });
      return { success: false, error: errorMsg };
    }
  }, [cache.orders, isCacheStale, getToken, updateCache]);

  // ==================== WORKERS ====================
  
  const fetchWorkers = useCallback(async (force = false) => {
    if (!force && cache.workers.data && !isCacheStale('workers')) {
      return { success: true, data: cache.workers.data, fromCache: true };
    }

    if (cache.workers.loading) {
      return { success: false, error: 'Request in progress', fromCache: false };
    }

    const token = getToken();
    if (!token) {
      const error = 'Authentication required';
      updateCache('workers', { error, loading: false });
      return { success: false, error };
    }

    updateCache('workers', { loading: true, error: null });

    try {
      const result = await workerAPI.getWorkers(token);

      if (result.success) {
        const mappedWorkers = (result.data.data || result.data || []).map(worker => ({
          id: worker.workerId || worker.id,
          name: worker.name,
          email: worker.email,
          phone: worker.contactNumber,
          specialization: worker.workType || 'General',
          experience: worker.experience || 0,
          status: 'active',
          ratings: worker.ratings || null,
          assignedOrders: 0,
          completedOrders: 0,
          performance: 0
        }));

        updateCache('workers', {
          data: mappedWorkers,
          loading: false,
          error: null,
          timestamp: Date.now()
        });

        return { success: true, data: mappedWorkers, fromCache: false };
      } else {
        updateCache('workers', { loading: false, error: result.error });
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorMsg = error.message || 'Failed to fetch workers';
      updateCache('workers', { loading: false, error: errorMsg });
      return { success: false, error: errorMsg };
    }
  }, [cache.workers, isCacheStale, getToken, updateCache]);

  // ==================== TASKS (for workers) ====================
  
  const fetchTasks = useCallback(async (force = false) => {
    if (!force && cache.tasks.data && !isCacheStale('tasks')) {
      return { success: true, data: cache.tasks.data, fromCache: true };
    }

    if (cache.tasks.loading) {
      return { success: false, error: 'Request in progress', fromCache: false };
    }

    const token = getToken();
    if (!token) {
      const error = 'Authentication required';
      updateCache('tasks', { error, loading: false });
      return { success: false, error };
    }

    updateCache('tasks', { loading: true, error: null });

    try {
      const result = await workerAPI.getMyTasks(token);

      if (result.success) {
        updateCache('tasks', {
          data: result.data,
          loading: false,
          error: null,
          timestamp: Date.now()
        });

        return { success: true, data: result.data, fromCache: false };
      } else {
        updateCache('tasks', { loading: false, error: result.error });
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorMsg = error.message || 'Failed to fetch tasks';
      updateCache('tasks', { loading: false, error: errorMsg });
      return { success: false, error: errorMsg };
    }
  }, [cache.tasks, isCacheStale, getToken, updateCache]);

  // ==================== PROFILE ====================
  
  const fetchProfile = useCallback(async (force = false) => {
    if (!force && cache.profile.data && !isCacheStale('profile')) {
      return { success: true, data: cache.profile.data, fromCache: true };
    }

    if (cache.profile.loading) {
      return { success: false, error: 'Request in progress', fromCache: false };
    }

    const token = getToken();
    if (!token || !user) {
      const error = 'Authentication required';
      updateCache('profile', { error, loading: false });
      return { success: false, error };
    }

    updateCache('profile', { loading: true, error: null });

    try {
      let result;
      
      // Call appropriate API based on user role
      if (user.role === 'customer') {
        result = await customerAPI.getCustomerProfile(token);
      } else if (user.role === 'worker' || user.role === 'tailor') {
        result = await workerAPI.getWorkerProfile(token);
      } else {
        // For owner, we might need a different endpoint
        result = { success: false, error: 'Profile fetch not implemented for this role' };
      }

      if (result.success) {
        let profileData = result.data;
        
        console.log('=== FETCH PROFILE DEBUG ===');
        console.log('User role:', user.role);
        console.log('Raw profile data from API:', JSON.stringify(profileData, null, 2));
        console.log('Has measurements?', !!profileData.measurements);
        if (profileData.measurements) {
          console.log('Raw measurements keys:', Object.keys(profileData.measurements));
          console.log('Raw measurements:', JSON.stringify(profileData.measurements, null, 2));
        }
        
        // Transform customer profile measurements to match expected format
        if (user.role === 'customer' && profileData.measurements) {
          const rawMeasurements = profileData.measurements;
          profileData = {
            ...profileData,
            measurements: {
              pant: {
                length: rawMeasurements.pantLength || '',
                waist: rawMeasurements.pantWaist || '',
                seatHips: rawMeasurements.seatHips || rawMeasurements.seatHip || '',
                thigh: rawMeasurements.thigh || '',
                knee: rawMeasurements.knee || '',
                bottomOpening: rawMeasurements.bottomOpening || rawMeasurements.bottom || '',
                thighCircumference: rawMeasurements.thighCircumference || ''
              },
              shirt: {
                length: rawMeasurements.shirtLength || '',
                chest: rawMeasurements.chest || '',
                waist: rawMeasurements.shirtWaist || '',
                shoulder: rawMeasurements.shoulder || '',
                sleeveLength: rawMeasurements.sleeveLength || '',
                armhole: rawMeasurements.armhole || '',
                collar: rawMeasurements.collar || ''
              },
              coat: {
                length: rawMeasurements.coatLength || '',
                chest: rawMeasurements.coatChest || '',
                waist: rawMeasurements.coatWaist || '',
                shoulder: rawMeasurements.coatShoulder || '',
                sleeveLength: rawMeasurements.coatSleeveLength || '',
                armhole: rawMeasurements.coatArmhole || ''
              },
              kurta: {
                length: rawMeasurements.kurtaLength || '',
                chest: rawMeasurements.kurtaChest || '',
                waist: rawMeasurements.kurtaWaist || '',
                seatHips: rawMeasurements.kurtaSeatHips || rawMeasurements.kurtaHip || '',
                flare: rawMeasurements.kurtaFlare || '',
                shoulder: rawMeasurements.kurtaShoulder || '',
                armhole: rawMeasurements.kurtaArmhole || '',
                sleeve: rawMeasurements.kurtaSleeve || rawMeasurements.kurtaSleeveLength || '',
                bottomOpening: rawMeasurements.kurtaBottomOpening || '',
                frontNeck: rawMeasurements.kurtaFrontNeck || '',
                backNeck: rawMeasurements.kurtaBackNeck || ''
              },
              dhoti: {
                length: rawMeasurements.dhotiLength || '',
                waist: rawMeasurements.dhotiWaist || '',
                hip: rawMeasurements.dhotiHip || '',
                sideLength: rawMeasurements.sideLength || '',
                foldLength: rawMeasurements.foldLength || ''
              },
              custom: rawMeasurements.customMeasurements || ''
            }
          };
          
          console.log('Transformed measurements:', JSON.stringify(profileData.measurements, null, 2));
        }
        console.log('=== END FETCH PROFILE DEBUG ===');
        
        updateCache('profile', {
          data: profileData,
          loading: false,
          error: null,
          timestamp: Date.now()
        });

        return { success: true, data: profileData, fromCache: false };
      } else {
        updateCache('profile', { loading: false, error: result.error });
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorMsg = error.message || 'Failed to fetch profile';
      updateCache('profile', { loading: false, error: errorMsg });
      return { success: false, error: errorMsg };
    }
  }, [cache.profile, isCacheStale, getToken, user, updateCache]);

  // ==================== CUSTOMER MY ORDERS ====================
  
  const fetchMyOrders = useCallback(async (force = false) => {
    if (!force && cache.myOrders.data && !isCacheStale('myOrders')) {
      return { success: true, data: cache.myOrders.data, fromCache: true };
    }

    if (cache.myOrders.loading) {
      return { success: false, error: 'Request in progress', fromCache: false };
    }

    const token = getToken();
    if (!token) {
      const error = 'Authentication required';
      updateCache('myOrders', { error, loading: false });
      return { success: false, error };
    }

    updateCache('myOrders', { loading: true, error: null });

    try {
      const result = await customerAPI.getMyOrders(token);

      if (result.success) {
        updateCache('myOrders', {
          data: result.data,
          loading: false,
          error: null,
          timestamp: Date.now()
        });

        return { success: true, data: result.data, fromCache: false };
      } else {
        updateCache('myOrders', { loading: false, error: result.error });
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorMsg = error.message || 'Failed to fetch orders';
      updateCache('myOrders', { loading: false, error: errorMsg });
      return { success: false, error: errorMsg };
    }
  }, [cache.myOrders, isCacheStale, getToken, updateCache]);

  // ==================== CUSTOMER STATS ====================
  
  const fetchCustomerStats = useCallback(async (force = false) => {
    if (!force && cache.customerStats.data && !isCacheStale('customerStats')) {
      return { success: true, data: cache.customerStats.data, fromCache: true };
    }

    if (cache.customerStats.loading) {
      return { success: false, error: 'Request in progress', fromCache: false };
    }

    const token = getToken();
    if (!token) {
      const error = 'Authentication required';
      updateCache('customerStats', { error, loading: false });
      return { success: false, error };
    }

    updateCache('customerStats', { loading: true, error: null });

    try {
      const result = await customerAPI.getCustomerStats(token);

      if (result.success) {
        updateCache('customerStats', {
          data: result.data,
          loading: false,
          error: null,
          timestamp: Date.now()
        });

        return { success: true, data: result.data, fromCache: false };
      } else {
        updateCache('customerStats', { loading: false, error: result.error });
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorMsg = error.message || 'Failed to fetch stats';
      updateCache('customerStats', { loading: false, error: errorMsg });
      return { success: false, error: errorMsg };
    }
  }, [cache.customerStats, isCacheStale, getToken, updateCache]);

  // ==================== RECENT ACTIVITIES ====================
  
  const fetchRecentActivities = useCallback(async (limit = 5, force = false) => {
    if (!force && cache.recentActivities.data && !isCacheStale('recentActivities')) {
      return { success: true, data: cache.recentActivities.data, fromCache: true };
    }

    if (cache.recentActivities.loading) {
      return { success: false, error: 'Request in progress', fromCache: false };
    }

    const token = getToken();
    if (!token) {
      const error = 'Authentication required';
      updateCache('recentActivities', { error, loading: false });
      return { success: false, error };
    }

    updateCache('recentActivities', { loading: true, error: null });

    try {
      const result = await customerAPI.getRecentActivities(token, limit);

      if (result.success) {
        updateCache('recentActivities', {
          data: result.data,
          loading: false,
          error: null,
          timestamp: Date.now()
        });

        return { success: true, data: result.data, fromCache: false };
      } else {
        updateCache('recentActivities', { loading: false, error: result.error });
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorMsg = error.message || 'Failed to fetch activities';
      updateCache('recentActivities', { loading: false, error: errorMsg });
      return { success: false, error: errorMsg };
    }
  }, [cache.recentActivities, isCacheStale, getToken, updateCache]);

  // ==================== MEASUREMENT PROFILES ====================
  
  const fetchMeasurementProfiles = useCallback(async (customerId, force = false) => {
    if (!force && cache.measurementProfiles.data && !isCacheStale('measurementProfiles')) {
      return { success: true, data: cache.measurementProfiles.data, fromCache: true };
    }

    if (cache.measurementProfiles.loading) {
      return { success: false, error: 'Request in progress', fromCache: false };
    }

    const token = getToken();
    if (!token || !customerId) {
      const error = 'Authentication required';
      updateCache('measurementProfiles', { error, loading: false });
      return { success: false, error };
    }

    updateCache('measurementProfiles', { loading: true, error: null });

    try {
      const result = await customerAPI.getMeasurementProfiles(customerId, token);

      if (result.success) {
        updateCache('measurementProfiles', {
          data: result.data,
          loading: false,
          error: null,
          timestamp: Date.now()
        });

        return { success: true, data: result.data, fromCache: false };
      } else {
        updateCache('measurementProfiles', { loading: false, error: result.error });
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorMsg = error.message || 'Failed to fetch measurement profiles';
      updateCache('measurementProfiles', { loading: false, error: errorMsg });
      return { success: false, error: errorMsg };
    }
  }, [cache.measurementProfiles, isCacheStale, getToken, updateCache]);

  // ==================== ADMIN DASHBOARD ====================
  
  const fetchAdminDashboard = useCallback(async (force = false) => {
    if (!force && cache.adminDashboard.data && !isCacheStale('adminDashboard')) {
      return { success: true, data: cache.adminDashboard.data, fromCache: true };
    }

    if (cache.adminDashboard.loading) {
      return { success: false, error: 'Request in progress', fromCache: false };
    }

    const token = getToken();
    if (!token) {
      const error = 'Authentication required';
      updateCache('adminDashboard', { error, loading: false });
      return { success: false, error };
    }

    updateCache('adminDashboard', { loading: true, error: null });

    try {
      const result = await adminAPI.getDashboard(token);

      if (result.success) {
        updateCache('adminDashboard', {
          data: result.data,
          loading: false,
          error: null,
          timestamp: Date.now()
        });

        return { success: true, data: result.data, fromCache: false };
      } else {
        updateCache('adminDashboard', { loading: false, error: result.error });
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorMsg = error.message || 'Failed to fetch admin dashboard';
      updateCache('adminDashboard', { loading: false, error: errorMsg });
      return { success: false, error: errorMsg };
    }
  }, [cache.adminDashboard, isCacheStale, getToken, updateCache]);

  // ==================== SHOP ANALYTICS ====================
  
  const fetchShopAnalytics = useCallback(async (force = false) => {
    if (!force && cache.shopAnalytics.data && !isCacheStale('shopAnalytics')) {
      return { success: true, data: cache.shopAnalytics.data, fromCache: true };
    }

    if (cache.shopAnalytics.loading) {
      return { success: false, error: 'Request in progress', fromCache: false };
    }

    const token = getToken();
    if (!token) {
      const error = 'Authentication required';
      updateCache('shopAnalytics', { error, loading: false });
      return { success: false, error };
    }

    updateCache('shopAnalytics', { loading: true, error: null });

    try {
      const result = await adminAPI.getShopAnalytics(token);

      if (result.success) {
        updateCache('shopAnalytics', {
          data: result.data,
          loading: false,
          error: null,
          timestamp: Date.now()
        });

        return { success: true, data: result.data, fromCache: false };
      } else {
        updateCache('shopAnalytics', { loading: false, error: result.error });
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorMsg = error.message || 'Failed to fetch shop analytics';
      updateCache('shopAnalytics', { loading: false, error: errorMsg });
      return { success: false, error: errorMsg };
    }
  }, [cache.shopAnalytics, isCacheStale, getToken, updateCache]);

  // ==================== ALL SHOPS ====================
  
  const fetchAllShops = useCallback(async (searchQuery = '', force = false) => {
    // Check if we need to refetch due to search query change
    const searchChanged = cache.allShops.searchQuery !== searchQuery;
    
    if (!force && !searchChanged && cache.allShops.data && !isCacheStale('allShops')) {
      return { success: true, data: cache.allShops.data, fromCache: true };
    }

    if (cache.allShops.loading) {
      return { success: false, error: 'Request in progress', fromCache: false };
    }

    const token = getToken();
    if (!token) {
      const error = 'Authentication required';
      updateCache('allShops', { error, loading: false });
      return { success: false, error };
    }

    updateCache('allShops', { loading: true, error: null, searchQuery });

    try {
      const result = await adminAPI.getAllShops(searchQuery, token);

      if (result.success) {
        updateCache('allShops', {
          data: result.data,
          loading: false,
          error: null,
          timestamp: Date.now(),
          searchQuery
        });

        return { success: true, data: result.data, fromCache: false };
      } else {
        updateCache('allShops', { loading: false, error: result.error, searchQuery });
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorMsg = error.message || 'Failed to fetch shops';
      updateCache('allShops', { loading: false, error: errorMsg, searchQuery });
      return { success: false, error: errorMsg };
    }
  }, [cache.allShops, isCacheStale, getToken, updateCache]);

  // ==================== PLATFORM ANALYTICS ====================
  
  const fetchPlatformAnalytics = useCallback(async (force = false) => {
    if (!force && cache.platformAnalytics.data && !isCacheStale('platformAnalytics')) {
      return { success: true, data: cache.platformAnalytics.data, fromCache: true };
    }

    if (cache.platformAnalytics.loading) {
      return { success: false, error: 'Request in progress', fromCache: false };
    }

    const token = getToken();
    if (!token) {
      const error = 'Authentication required';
      updateCache('platformAnalytics', { error, loading: false });
      return { success: false, error };
    }

    updateCache('platformAnalytics', { loading: true, error: null });

    try {
      const result = await adminAPI.getPlatformAnalytics(token);

      if (result.success) {
        updateCache('platformAnalytics', {
          data: result.data,
          loading: false,
          error: null,
          timestamp: Date.now()
        });

        return { success: true, data: result.data, fromCache: false };
      } else {
        updateCache('platformAnalytics', { loading: false, error: result.error });
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorMsg = error.message || 'Failed to fetch platform analytics';
      updateCache('platformAnalytics', { loading: false, error: errorMsg });
      return { success: false, error: errorMsg };
    }
  }, [cache.platformAnalytics, isCacheStale, getToken, updateCache]);

  // ==================== CACHE INVALIDATION ====================
  
  const invalidateCache = useCallback((keys) => {
    const keysArray = Array.isArray(keys) ? keys : [keys];
    setCache(prev => {
      const updated = { ...prev };
      keysArray.forEach(key => {
        if (updated[key]) {
          updated[key] = { ...updated[key], timestamp: null };
        }
      });
      return updated;
    });
  }, []);

  // Invalidate specific cache after mutations
  const invalidateCustomers = useCallback(() => invalidateCache('customers'), [invalidateCache]);
  const invalidateOrders = useCallback(() => invalidateCache(['orders', 'customers']), [invalidateCache]);
  const invalidateWorkers = useCallback(() => invalidateCache('workers'), [invalidateCache]);
  const invalidateTasks = useCallback(() => invalidateCache('tasks'), [invalidateCache]);
  const invalidateProfile = useCallback(() => invalidateCache('profile'), [invalidateCache]);
  const invalidateMyOrders = useCallback(() => invalidateCache('myOrders'), [invalidateCache]);
  const invalidateCustomerStats = useCallback(() => invalidateCache('customerStats'), [invalidateCache]);
  const invalidateRecentActivities = useCallback(() => invalidateCache('recentActivities'), [invalidateCache]);
  const invalidateMeasurementProfiles = useCallback(() => invalidateCache('measurementProfiles'), [invalidateCache]);
  const invalidateAdminDashboard = useCallback(() => invalidateCache('adminDashboard'), [invalidateCache]);
  const invalidateShopAnalytics = useCallback(() => invalidateCache('shopAnalytics'), [invalidateCache]);
  const invalidateAllShops = useCallback(() => invalidateCache('allShops'), [invalidateCache]);
  const invalidatePlatformAnalytics = useCallback(() => invalidateCache('platformAnalytics'), [invalidateCache]);

  const value = {
    // Data
    customers: cache.customers.data || [],
    orders: cache.orders.data || [],
    workers: cache.workers.data || [],
    tasks: cache.tasks.data || [],
    profile: cache.profile.data,
    myOrders: cache.myOrders.data || [],
    customerStats: cache.customerStats.data,
    recentActivities: cache.recentActivities.data || [],
    measurementProfiles: cache.measurementProfiles.data || [],
    adminDashboard: cache.adminDashboard.data,
    shopAnalytics: cache.shopAnalytics.data,
    allShops: cache.allShops.data || [],
    platformAnalytics: cache.platformAnalytics.data,
    
    // Loading states
    customersLoading: cache.customers.loading,
    ordersLoading: cache.orders.loading,
    workersLoading: cache.workers.loading,
    tasksLoading: cache.tasks.loading,
    profileLoading: cache.profile.loading,
    myOrdersLoading: cache.myOrders.loading,
    customerStatsLoading: cache.customerStats.loading,
    recentActivitiesLoading: cache.recentActivities.loading,
    measurementProfilesLoading: cache.measurementProfiles.loading,
    adminDashboardLoading: cache.adminDashboard.loading,
    shopAnalyticsLoading: cache.shopAnalytics.loading,
    allShopsLoading: cache.allShops.loading,
    platformAnalyticsLoading: cache.platformAnalytics.loading,
    
    // Error states
    customersError: cache.customers.error,
    ordersError: cache.orders.error,
    workersError: cache.workers.error,
    tasksError: cache.tasks.error,
    profileError: cache.profile.error,
    myOrdersError: cache.myOrders.error,
    customerStatsError: cache.customerStats.error,
    recentActivitiesError: cache.recentActivities.error,
    measurementProfilesError: cache.measurementProfiles.error,
    adminDashboardError: cache.adminDashboard.error,
    shopAnalyticsError: cache.shopAnalytics.error,
    allShopsError: cache.allShops.error,
    platformAnalyticsError: cache.platformAnalytics.error,
    
    // Fetch functions
    fetchCustomers,
    fetchOrders,
    fetchWorkers,
    fetchTasks,
    fetchProfile,
    fetchMyOrders,
    fetchCustomerStats,
    fetchRecentActivities,
    fetchMeasurementProfiles,
    fetchAdminDashboard,
    fetchShopAnalytics,
    fetchAllShops,
    fetchPlatformAnalytics,
    
    // Cache invalidation
    invalidateCustomers,
    invalidateOrders,
    invalidateWorkers,
    invalidateTasks,
    invalidateProfile,
    invalidateMyOrders,
    invalidateCustomerStats,
    invalidateRecentActivities,
    invalidateMeasurementProfiles,
    invalidateAdminDashboard,
    invalidateShopAnalytics,
    invalidateAllShops,
    invalidatePlatformAnalytics,
    clearCache,
    
    // Utility
    refetchAll: useCallback(() => {
      fetchCustomers(true);
      fetchOrders(true);
      fetchWorkers(true);
      fetchTasks(true);
      fetchProfile(true);
      fetchMyOrders(true);
      fetchCustomerStats(true);
      fetchRecentActivities(5, true);
      fetchAdminDashboard(true);
      fetchShopAnalytics(true);
      fetchAllShops('', true);
      fetchPlatformAnalytics(true);
    }, [fetchCustomers, fetchOrders, fetchWorkers, fetchTasks, fetchProfile, fetchMyOrders, fetchCustomerStats, fetchRecentActivities, fetchAdminDashboard, fetchShopAnalytics, fetchAllShops, fetchPlatformAnalytics])
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};
