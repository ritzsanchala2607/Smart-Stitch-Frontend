import { useState } from 'react';
import Sidebar from '../../components/common/Sidebar';
import Topbar from '../../components/common/Topbar';
import { motion } from 'framer-motion';
import usePageTitle from '../../hooks/usePageTitle';
import { usePlatformAnalytics } from '../../hooks/useDataFetch';
import {
  BarChart3,
  TrendingUp,
  Calendar,
  Package,
  Store,
  Users,
  Activity,
  Loader2,
  AlertCircle
} from 'lucide-react';
import {
  BarChart,
  Bar,
  PieChart as RePieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';

const PlatformAnalytics = () => {
  usePageTitle('Platform Analytics');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Use global state hook
  const {
    platformAnalytics,
    platformAnalyticsLoading: loading,
    platformAnalyticsError: error
  } = usePlatformAnalytics();

  // Extract data from platformAnalytics
  const systemMetrics = platformAnalytics?.systemMetrics || {
    ordersToday: 0,
    ordersThisWeek: 0,
    ordersThisMonth: 0,
    averageOrdersPerShop: 0,
    averageWorkersPerShop: 0
  };

  const ordersVsShopsGrowth = platformAnalytics?.ordersVsShopsGrowth || [];
  const monthlyActiveUsers = platformAnalytics?.monthlyActiveUsers || [];

  // Orders Category Split Data
  const ordersCategorySplit = [
    { name: 'Shirts', value: 450, color: '#3b82f6' },
    { name: 'Pants', value: 380, color: '#8b5cf6' },
    { name: 'Kurtas', value: 280, color: '#10b981' },
    { name: 'Blouses', value: 220, color: '#f59e0b' },
    { name: 'Suits', value: 180, color: '#ef4444' },
    { name: 'Alterations', value: 150, color: '#6366f1' }
  ];

  // Shop Performance Distribution
  const shopPerformance = [
    { range: '0-20 orders', shops: 8, color: '#ef4444' },
    { range: '21-40 orders', shops: 15, color: '#f59e0b' },
    { range: '41-60 orders', shops: 12, color: '#10b981' },
    { range: '60+ orders', shops: 10, color: '#3b82f6' }
  ];

  // Show loading state
  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar role="admin" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Topbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
          <main className="flex-1 overflow-y-auto p-6 flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-blue-600 dark:text-blue-400 animate-spin mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">Loading analytics data...</p>
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
        <Sidebar role="admin" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Topbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
          <main className="flex-1 overflow-y-auto p-6 flex items-center justify-center">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-red-600 dark:text-red-400 mx-auto mb-4" />
              <p className="text-gray-900 dark:text-gray-100 font-semibold mb-2">Failed to load analytics</p>
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
      <Sidebar role="admin" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-y-auto p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-7xl mx-auto space-y-6"
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <BarChart3 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Platform Analytics</h1>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">System-wide insights and performance metrics</p>
                </div>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-blue-700 dark:text-blue-400">Read-Only View</span>
              </div>
            </div>

            {/* System Metrics Cards */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">System Metrics</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* Orders Today */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-md p-6 text-white"
                >
                  <div className="flex items-center justify-between mb-2">
                    <Calendar className="w-8 h-8" />
                    <span className="text-xs font-medium opacity-90">Today</span>
                  </div>
                  <h3 className="text-3xl font-bold mb-1">{systemMetrics.ordersToday}</h3>
                  <p className="text-sm opacity-90">Orders Today</p>
                </motion.div>

                {/* Orders This Week */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-md p-6 text-white"
                >
                  <div className="flex items-center justify-between mb-2">
                    <Calendar className="w-8 h-8" />
                    <span className="text-xs font-medium opacity-90">This Week</span>
                  </div>
                  <h3 className="text-3xl font-bold mb-1">{systemMetrics.ordersThisWeek}</h3>
                  <p className="text-sm opacity-90">Orders This Week</p>
                </motion.div>

                {/* Orders This Month */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-md p-6 text-white"
                >
                  <div className="flex items-center justify-between mb-2">
                    <Package className="w-8 h-8" />
                    <span className="text-xs font-medium opacity-90">This Month</span>
                  </div>
                  <h3 className="text-3xl font-bold mb-1">{systemMetrics.ordersThisMonth}</h3>
                  <p className="text-sm opacity-90">Orders This Month</p>
                </motion.div>

                {/* Average Orders Per Shop */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
                >
                  <div className="flex items-center justify-between mb-2">
                    <Store className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Average</span>
                  </div>
                  <h3 className="text-3xl font-bold mb-1">{systemMetrics.averageOrdersPerShop}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Orders Per Shop</p>
                </motion.div>

                {/* Average Workers Per Shop */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
                >
                  <div className="flex items-center justify-between mb-2">
                    <Users className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Average</span>
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">{systemMetrics.averageWorkersPerShop}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Workers Per Shop</p>
                </motion.div>
              </div>
            </div>

            {/* Advanced Graphs Section */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Advanced Analytics</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Orders vs Shops Growth */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Orders vs Shops Growth</h3>
                  </div>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={ordersVsShopsGrowth}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="month" stroke="#9ca3af" />
                      <YAxis yAxisId="left" stroke="#9ca3af" />
                      <YAxis yAxisId="right" orientation="right" stroke="#9ca3af" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1f2937',
                          border: '1px solid #374151',
                          borderRadius: '8px',
                          color: '#f3f4f6'
                        }}
                      />
                      <Legend />
                      <Bar yAxisId="left" dataKey="orders" fill="#3b82f6" name="Orders" />
                      <Bar yAxisId="right" dataKey="shops" fill="#10b981" name="Shops" />
                    </BarChart>
                  </ResponsiveContainer>
                </motion.div>

                {/* Monthly Active Users */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Monthly Active Users</h3>
                  </div>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={monthlyActiveUsers}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="month" stroke="#9ca3af" />
                      <YAxis stroke="#9ca3af" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1f2937',
                          border: '1px solid #374151',
                          borderRadius: '8px',
                          color: '#f3f4f6'
                        }}
                      />
                      <Legend />
                      <Area type="monotone" dataKey="owners" stackId="1" stroke="#8b5cf6" fill="#8b5cf6" name="Owners" />
                      <Area type="monotone" dataKey="workers" stackId="1" stroke="#3b82f6" fill="#3b82f6" name="Workers" />
                    </AreaChart>
                  </ResponsiveContainer>
                </motion.div>

                {/* Orders Category Split */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <Package className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Orders Category Split</h3>
                  </div>
                  <ResponsiveContainer width="100%" height={300}>
                    <RePieChart>
                      <Pie
                        data={ordersCategorySplit}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {ordersCategorySplit.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1f2937',
                          border: '1px solid #374151',
                          borderRadius: '8px',
                          color: '#f3f4f6'
                        }}
                      />
                    </RePieChart>
                  </ResponsiveContainer>
                </motion.div>

                {/* Shop Performance Distribution */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <Store className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Shop Performance Distribution</h3>
                  </div>
                  <ResponsiveContainer width="100%" height={300}>
                    <RePieChart>
                      <Pie
                        data={shopPerformance}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, shops }) => `${name}: ${shops} shops`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="shops"
                      >
                        {shopPerformance.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1f2937',
                          border: '1px solid #374151',
                          borderRadius: '8px',
                          color: '#f3f4f6'
                        }}
                      />
                    </RePieChart>
                  </ResponsiveContainer>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default PlatformAnalytics;
