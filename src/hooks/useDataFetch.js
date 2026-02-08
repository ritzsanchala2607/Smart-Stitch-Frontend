import { useEffect } from 'react';
import { useData } from '../context/DataContext';

/**
 * Custom hook to fetch and use customers data
 * @param {Object} options - Configuration options
 * @param {boolean} options.skip - Skip automatic fetching on mount
 * @param {boolean} options.force - Force refetch even if cached
 * @returns {Object} Customers data, loading state, error, and fetch functions
 */
export const useCustomers = (options = {}) => {
  const { skip = false, force = false } = options;
  const {
    customers,
    customersLoading,
    customersError,
    fetchCustomers,
    invalidateCustomers
  } = useData();

  useEffect(() => {
    if (!skip) {
      fetchCustomers(force);
    }
  }, [skip, force, fetchCustomers]);

  return {
    customers,
    customersLoading,
    customersError,
    fetchCustomers,
    invalidateCustomers
  };
};

/**
 * Custom hook to fetch and use orders data
 */
export const useOrders = (options = {}) => {
  const { skip = false, force = false } = options;
  const {
    orders,
    ordersLoading,
    ordersError,
    fetchOrders,
    invalidateOrders
  } = useData();

  useEffect(() => {
    if (!skip) {
      fetchOrders(force);
    }
  }, [skip, force, fetchOrders]);

  return {
    orders,
    ordersLoading,
    ordersError,
    fetchOrders,
    invalidateOrders
  };
};

/**
 * Custom hook to fetch and use workers data
 */
export const useWorkers = (options = {}) => {
  const { skip = false, force = false } = options;
  const {
    workers,
    workersLoading,
    workersError,
    fetchWorkers,
    invalidateWorkers
  } = useData();

  useEffect(() => {
    if (!skip) {
      fetchWorkers(force);
    }
  }, [skip, force, fetchWorkers]);

  return {
    workers,
    workersLoading,
    workersError,
    fetchWorkers,
    invalidateWorkers
  };
};

/**
 * Custom hook to fetch and use tasks data (for workers)
 */
export const useTasks = (options = {}) => {
  const { skip = false, force = false } = options;
  const {
    tasks,
    tasksLoading,
    tasksError,
    fetchTasks,
    invalidateTasks
  } = useData();

  useEffect(() => {
    if (!skip) {
      fetchTasks(force);
    }
  }, [skip, force, fetchTasks]);

  return {
    tasks,
    tasksLoading,
    tasksError,
    fetchTasks,
    invalidateTasks
  };
};

/**
 * Custom hook to fetch and use profile data
 */
export const useProfile = (options = {}) => {
  const { skip = false, force = false } = options;
  const {
    profile,
    profileLoading,
    profileError,
    fetchProfile,
    invalidateProfile
  } = useData();

  useEffect(() => {
    if (!skip) {
      fetchProfile(force);
    }
  }, [skip, force, fetchProfile]);

  return {
    profile,
    profileLoading,
    profileError,
    fetchProfile,
    invalidateProfile
  };
};

/**
 * Generic hook to fetch multiple resources at once
 * @param {Array<string>} resources - Array of resource names to fetch
 * @param {Object} options - Configuration options
 * @returns {Object} All requested data with loading and error states
 */
export const useDataFetch = (resources = [], options = {}) => {
  const { skip = false, force = false } = options;
  const context = useData();

  useEffect(() => {
    if (!skip && Array.isArray(resources)) {
      resources.forEach(resource => {
        const fetchFn = context[`fetch${resource.charAt(0).toUpperCase() + resource.slice(1)}`];
        if (fetchFn) {
          fetchFn(force);
        }
      });
    }
  }, [skip, force, resources, context]);

  return context;
};

/**
 * Custom hook to fetch and use customer's own orders
 */
export const useMyOrders = (options = {}) => {
  const { skip = false, force = false } = options;
  const {
    myOrders,
    myOrdersLoading,
    myOrdersError,
    fetchMyOrders,
    invalidateMyOrders
  } = useData();

  useEffect(() => {
    if (!skip) {
      fetchMyOrders(force);
    }
  }, [skip, force, fetchMyOrders]);

  return {
    myOrders,
    myOrdersLoading,
    myOrdersError,
    fetchMyOrders,
    invalidateMyOrders
  };
};

/**
 * Custom hook to fetch and use customer stats
 */
export const useCustomerStats = (options = {}) => {
  const { skip = false, force = false } = options;
  const {
    customerStats,
    customerStatsLoading,
    customerStatsError,
    fetchCustomerStats,
    invalidateCustomerStats
  } = useData();

  useEffect(() => {
    if (!skip) {
      fetchCustomerStats(force);
    }
  }, [skip, force, fetchCustomerStats]);

  return {
    customerStats,
    customerStatsLoading,
    customerStatsError,
    fetchCustomerStats,
    invalidateCustomerStats
  };
};

/**
 * Custom hook to fetch and use recent activities
 */
export const useRecentActivities = (limit = 5, options = {}) => {
  const { skip = false, force = false } = options;
  const {
    recentActivities,
    recentActivitiesLoading,
    recentActivitiesError,
    fetchRecentActivities,
    invalidateRecentActivities
  } = useData();

  useEffect(() => {
    if (!skip) {
      fetchRecentActivities(limit, force);
    }
  }, [skip, force, limit, fetchRecentActivities]);

  return {
    recentActivities,
    recentActivitiesLoading,
    recentActivitiesError,
    fetchRecentActivities,
    invalidateRecentActivities
  };
};

/**
 * Custom hook to fetch and use measurement profiles
 */
export const useMeasurementProfiles = (customerId, options = {}) => {
  const { skip = false, force = false } = options;
  const {
    measurementProfiles,
    measurementProfilesLoading,
    measurementProfilesError,
    fetchMeasurementProfiles,
    invalidateMeasurementProfiles
  } = useData();

  useEffect(() => {
    if (!skip && customerId) {
      fetchMeasurementProfiles(customerId, force);
    }
  }, [skip, force, customerId, fetchMeasurementProfiles]);

  return {
    measurementProfiles,
    measurementProfilesLoading,
    measurementProfilesError,
    fetchMeasurementProfiles,
    invalidateMeasurementProfiles
  };
};

/**
 * Custom hook to fetch and use admin dashboard data
 */
export const useAdminDashboard = (options = {}) => {
  const { skip = false, force = false } = options;
  const {
    adminDashboard,
    adminDashboardLoading,
    adminDashboardError,
    fetchAdminDashboard,
    invalidateAdminDashboard
  } = useData();

  useEffect(() => {
    if (!skip) {
      fetchAdminDashboard(force);
    }
  }, [skip, force, fetchAdminDashboard]);

  return {
    adminDashboard,
    adminDashboardLoading,
    adminDashboardError,
    fetchAdminDashboard,
    invalidateAdminDashboard
  };
};

/**
 * Custom hook to fetch and use shop analytics data
 */
export const useShopAnalytics = (options = {}) => {
  const { skip = false, force = false } = options;
  const {
    shopAnalytics,
    shopAnalyticsLoading,
    shopAnalyticsError,
    fetchShopAnalytics,
    invalidateShopAnalytics
  } = useData();

  useEffect(() => {
    if (!skip) {
      fetchShopAnalytics(force);
    }
  }, [skip, force, fetchShopAnalytics]);

  return {
    shopAnalytics,
    shopAnalyticsLoading,
    shopAnalyticsError,
    fetchShopAnalytics,
    invalidateShopAnalytics
  };
};

/**
 * Custom hook to fetch and use all shops data with search support
 */
export const useAllShops = (searchQuery = '', options = {}) => {
  const { skip = false, force = false } = options;
  const {
    allShops,
    allShopsLoading,
    allShopsError,
    fetchAllShops,
    invalidateAllShops
  } = useData();

  useEffect(() => {
    if (!skip) {
      fetchAllShops(searchQuery, force);
    }
  }, [skip, force, searchQuery, fetchAllShops]);

  return {
    allShops,
    allShopsLoading,
    allShopsError,
    fetchAllShops,
    invalidateAllShops
  };
};

/**
 * Custom hook to fetch and use platform analytics data
 */
export const usePlatformAnalytics = (options = {}) => {
  const { skip = false, force = false } = options;
  const {
    platformAnalytics,
    platformAnalyticsLoading,
    platformAnalyticsError,
    fetchPlatformAnalytics,
    invalidatePlatformAnalytics
  } = useData();

  useEffect(() => {
    if (!skip) {
      fetchPlatformAnalytics(force);
    }
  }, [skip, force, fetchPlatformAnalytics]);

  return {
    platformAnalytics,
    platformAnalyticsLoading,
    platformAnalyticsError,
    fetchPlatformAnalytics,
    invalidatePlatformAnalytics
  };
};
