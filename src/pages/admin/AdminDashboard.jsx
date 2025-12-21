import { useState } from 'react';
import Sidebar from '../../components/common/Sidebar';
import Topbar from '../../components/common/Topbar';
import { motion } from 'framer-motion';
import usePageTitle from '../../hooks/usePageTitle';
import {
  Store,
  Users,
  Scissors,
  Package,
  TrendingUp,
  Activity,
  BarChart3,
  PieChart,
  Calendar,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart as RePieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const AdminDashboard = () => {
  usePageTitle('Admin Dashboard');
  // Mock data for KPI cards
  const kpiData = {
    totalShops: 45,
    totalOwners: 45,
    totalWorkers: 234,
    totalOrders: 3456,
    activeShops: 38,
    systemGrowth: 23.5
  };

  // Mock data for shops registered per month
  const shopsPerMonth = [
    { month: 'Jan', shops: 3 },
    { month: 'Feb', shops: 5 },
    { month: 'Mar', shops: 7 },
    { month: 'Apr', shops: 6 },
    { month: 'May', shops: 8 },
    { month: 'Jun', shops: 10 },
    { month: 'Jul', shops: 6 }
  ];

  // Mock data for orders processed
  const ordersPerMonth = [
    { month: 'Jan', orders: 320 },
    { month: 'Feb', orders: 450 },
    { month: 'Mar', orders: 580 },
    { month: 'Apr', orders: 520 },
    { month: 'May', orders: 670 },
    { month: 'Jun', orders: 750 },
    { month: 'Jul', orders: 820 }
  ];

  // Mock data for shop status
  const shopStatus = [
    { name: 'Active', value: 38, color: '#10b981' },
    { name: 'Inactive', value: 7, color: '#ef4444' }
  ];

  // Mock data for workers distribution
  const workersDistribution = [
    { name: '1-3 Workers', value: 15, color: '#3b82f6' },
    { name: '4-6 Workers', value: 18, color: '#8b5cf6' },
    { name: '7-10 Workers', value: 8, color: '#f59e0b' },
    { name: '10+ Workers', value: 4, color: '#10b981' }
  ];

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
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
              >
                <div className="flex items-center justify-between mb-2">
                  <Store className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Total</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{kpiData.totalShops}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Shops Registered</p>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
              >
                <div className="flex items-center justify-between mb-2">
                  <Users className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Total</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{kpiData.totalOwners}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Owners</p>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
              >
                <div className="flex items-center justify-between mb-2">
                  <Scissors className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Total</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{kpiData.totalWorkers}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Workers Registered</p>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
              >
                <div className="flex items-center justify-between mb-2">
                  <Package className="w-8 h-8 text-green-600 dark:text-green-400" />
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Total</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{kpiData.totalOrders}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Orders Handled</p>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
              >
                <div className="flex items-center justify-between mb-2">
                  <Calendar className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400">This Month</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{kpiData.activeShops}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Active Shops</p>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-md p-6"
              >
                <div className="flex items-center justify-between mb-2">
                  <TrendingUp className="w-8 h-8 text-white" />
                  <span className="text-xs font-medium text-white/80">Growth</span>
                </div>
                <h3 className="text-2xl font-bold text-white">+{kpiData.systemGrowth}%</h3>
                <p className="text-sm text-white/90">System Growth</p>
              </motion.div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Shops Registered Per Month */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Shops Registered Per Month</h2>
                </div>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={shopsPerMonth}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="month" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1f2937',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#fff'
                      }}
                    />
                    <Bar dataKey="shops" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Orders Processed */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Orders Processed (Monthly)</h2>
                </div>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={ordersPerMonth}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="month" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
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
              </div>

              {/* Shop Status Distribution */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <div className="flex items-center gap-2 mb-4">
                  <PieChart className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Active vs Inactive Shops</h2>
                </div>
                <ResponsiveContainer width="100%" height={250}>
                  <RePieChart>
                    <Pie
                      data={shopStatus}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {shopStatus.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </RePieChart>
                </ResponsiveContainer>
              </div>

              {/* Workers Distribution */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Scissors className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Workers Per Shop Distribution</h2>
                </div>
                <ResponsiveContainer width="100%" height={250}>
                  <RePieChart>
                    <Pie
                      data={workersDistribution}
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      dataKey="value"
                      label
                    >
                      {workersDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </RePieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Recent Activity Panel */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Recent Activity</h2>
              <div className="space-y-3">
                {recentActivities.map((activity) => {
                  const Icon = activity.icon;
                  const colorClasses = {
                    green: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
                    blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
                    red: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
                    orange: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400'
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
