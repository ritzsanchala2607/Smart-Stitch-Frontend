import { useState, useEffect } from 'react';
import Sidebar from '../../components/common/Sidebar';
import Topbar from '../../components/common/Topbar';
import { motion } from 'framer-motion';
import usePageTitle from '../../hooks/usePageTitle';
import { adminAPI } from '../../services/api';
import {
  Store,
  Users,
  Scissors,
  Package,
  TrendingUp,
  Activity,
  Calendar,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader2
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const AdminDashboard = () => {
  usePageTitle('Admin Dashboard');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for dashboard data
  const [kpiData, setKpiData] = useState({
    totalShops: 0,
    totalOwners: 0,
    totalWorkers: 0,
    totalOrders: 0,
    activeShops: 0,
    systemGrowth: 0
  });

  const [shopAnalytics, setShopAnalytics] = useState({
    monthlyShopRegistrations: [],
    monthlyOrdersProcessed: []
  });

  // Fetch dashboard data on component mount
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get token from localStorage
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        const token = userData.jwt || localStorage.getItem('token');

        if (!token) {
          throw new Error('No authentication token found');
        }

        // Fetch dashboard overview
        const dashboardResponse = await adminAPI.getDashboard(token);
        if (!dashboardResponse.success) {
          throw new Error(dashboardResponse.error);
        }

        // Fetch shop analytics
        const analyticsResponse = await adminAPI.getShopAnalytics(token);
        if (!analyticsResponse.success) {
          throw new Error(analyticsResponse.error);
        }

        // Update state with fetched data
        setKpiData(dashboardResponse.data);
        setShopAnalytics(analyticsResponse.data);

      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(err.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Data for orders processed (from API)
  const ordersPerMonth = shopAnalytics.monthlyOrdersProcessed?.length > 0
    ? shopAnalytics.monthlyOrdersProcessed.map(item => ({
        month: item.month,
        orders: item.ordersProcessed
      }))
    : [];

  // Debug: Log the data
  console.log('Shop Analytics Data:', shopAnalytics);
  console.log('Orders Per Month:', ordersPerMonth);

  // Mock recent activities
  const recentActivities = [
    {
      id: 1,
      type: 'shop_onboarded',
      message: 'New shop "Elite Tailors" onboarded',
      time: '2 hours ago',
      icon: Store,
      color: 'green'
    },
    {
      id: 2,
      type: 'owner_created',
      message: 'Owner account created for "Rajesh Kumar"',
      time: '5 hours ago',
      icon: Users,
      color: 'blue'
    },
    {
      id: 3,
      type: 'shop_inactive',
      message: 'Shop "Classic Tailoring" marked inactive',
      time: '1 day ago',
      icon: XCircle,
      color: 'red'
    },
    {
      id: 4,
      type: 'high_volume',
      message: 'High order volume alert - 150 orders today',
      time: '1 day ago',
      icon: AlertCircle,
      color: 'orange'
    },
    {
      id: 5,
      type: 'shop_onboarded',
      message: 'New shop "Modern Stitching" onboarded',
      time: '2 days ago',
      icon: Store,
      color: 'green'
    }
  ];

  // Show loading state
  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar role="admin" />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Topbar />
          <main className="flex-1 overflow-y-auto p-6 flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-blue-600 dark:text-blue-400 animate-spin mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">Loading dashboard data...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar role="admin" />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Topbar />
          <main className="flex-1 overflow-y-auto p-6 flex items-center justify-center">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-red-600 dark:text-red-400 mx-auto mb-4" />
              <p className="text-gray-900 dark:text-gray-100 font-semibold mb-2">Failed to load dashboard</p>
              <p className="text-gray-600 dark:text-gray-400">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Retry
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar role="admin" />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-7xl mx-auto space-y-6"
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Admin Dashboard</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">Platform overview and system metrics</p>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <Activity className="w-5 h-5 text-green-600 dark:text-green-400" />
                <span className="text-sm font-medium text-green-700 dark:text-green-400">System Online</span>
              </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-gray-100 dark:bg-gray-700">
                    <Store className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Total</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{kpiData.totalShops}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Shops Registered</p>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-gray-100 dark:bg-gray-700">
                    <Users className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                  </div>
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Total</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{kpiData.totalOwners}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Owners</p>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-gray-100 dark:bg-gray-700">
                    <Scissors className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                  </div>
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Total</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{kpiData.totalWorkers}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Workers Registered</p>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-gray-100 dark:bg-gray-700">
                    <Package className="w-8 h-8 text-green-600 dark:text-green-400" />
                  </div>
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Total</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{kpiData.totalOrders}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Orders Handled</p>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-gray-100 dark:bg-gray-700">
                    <Calendar className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400">This Month</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{kpiData.activeShops}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Active Shops</p>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-gray-100 dark:bg-gray-700">
                    <TrendingUp className="w-8 h-8 text-green-600 dark:text-green-400" />
                  </div>
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Growth</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">+{kpiData.systemGrowth}%</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">System Growth</p>
              </motion.div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 gap-6">
              {/* Orders Processed */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Orders Processed (Monthly)</h2>
                </div>
                {ordersPerMonth.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={ordersPerMonth}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="month" stroke="#9ca3af" />
                      <YAxis 
                        stroke="#9ca3af" 
                        allowDecimals={false}
                        domain={[0, 'dataMax + 2']}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1f2937',
                          border: 'none',
                          borderRadius: '8px',
                          color: '#fff'
                        }}
                      />
                      <Line type="monotone" dataKey="orders" stroke="#10b981" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[250px] flex items-center justify-center text-gray-500 dark:text-gray-400">
                    <div className="text-center">
                      <TrendingUp className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>No order processing data available</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Activity Panel */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Recent Activity</h2>
              <div className="space-y-3">
                {recentActivities.map((activity) => {
                  const Icon = activity.icon;
                  const colorClasses = {
                    green: 'bg-gray-100 dark:bg-gray-700 text-green-600 dark:text-green-400',
                    blue: 'bg-gray-100 dark:bg-gray-700 text-blue-600 dark:text-blue-400',
                    red: 'bg-gray-100 dark:bg-gray-700 text-red-600 dark:text-red-400',
                    orange: 'bg-gray-100 dark:bg-gray-700 text-orange-600 dark:text-orange-400'
                  };

                  return (
                    <div
                      key={activity.id}
                      className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${colorClasses[activity.color]}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{activity.message}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{activity.time}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
