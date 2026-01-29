import { useState, useEffect } from 'react';
import Layout from '../../components/common/Layout';
import { motion } from 'framer-motion';
import usePageTitle from '../../hooks/usePageTitle';
import {
  LayoutDashboard,
  Package,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Activity,
  Loader
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { customerAPI } from '../../services/api';

const Dashboard = () => {
  usePageTitle('Dashboard');
  const navigate = useNavigate();

  const [statsLoading, setStatsLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  const [activeOrders, setActiveOrders] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [orderTrendData, setOrderTrendData] = useState([]);
  const [customerData, setCustomerData] = useState({
    name: 'Customer',
    totalOrders: 0,
    activeOrders: 0,
    completedOrders: 0,
    pendingDelivery: 0,
    paymentDue: 0
  });

  // Get token from localStorage
  const getToken = () => {
    const token = localStorage.getItem('token');
    if (token) return token;
    
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        return user.jwt || user.token;
      } catch (e) {
        console.error('Error parsing user from localStorage:', e);
      }
    }
    return null;
  };

  // Get customer name from localStorage
  const getCustomerName = () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        return user.name || 'Customer';
      } catch (e) {
        console.error('Error parsing user from localStorage:', e);
      }
    }
    return 'Customer';
  };

  // Load all dashboard data in parallel on mount
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    const token = getToken();
    
    if (!token) {
      console.error('No token found');
      setStatsLoading(false);
      setOrdersLoading(false);
      setActivitiesLoading(false);
      return;
    }

    // Set all loading states
    setStatsLoading(true);
    setOrdersLoading(true);
    setActivitiesLoading(true);

    try {
      // Fetch all data in parallel
      const [statsResult, ordersResult, activitiesResult] = await Promise.all([
        customerAPI.getCustomerStats(token).catch(err => ({ success: false, error: err })),
        customerAPI.getMyOrders(token).catch(err => ({ success: false, error: err })),
        customerAPI.getRecentActivities(token, 5).catch(err => ({ success: false, error: err }))
      ]);

      // Process stats
      if (statsResult.success) {
        const stats = statsResult.data;
        setCustomerData(prev => ({
          ...prev,
          name: getCustomerName(),
          totalOrders: stats.totalOrders || 0,
          activeOrders: stats.activeOrders || 0,
          completedOrders: stats.completedOrders || 0,
          pendingDelivery: stats.activeOrders || 0,
          paymentDue: stats.pendingPayment || 0
        }));
      } else {
        console.error('Failed to fetch stats:', statsResult.error);
      }
      setStatsLoading(false);

      // Process orders (reuse for multiple purposes)
      if (ordersResult.success) {
        const orders = ordersResult.data || [];
        console.log('All orders from API:', orders);
        
        // Calculate category distribution from orders
        calculateCategoryDistribution(orders);
        
        // Calculate order trend from orders
        calculateOrderTrend(orders);
        
        // Sort by order ID descending to get most recent orders first
        const sortedOrders = [...orders].sort((a, b) => b.orderId - a.orderId);

        // Transform orders to match component structure
        const transformedOrders = sortedOrders.map(order => {
          const taskStatuses = order.taskStatuses || [];
          const itemNames = taskStatuses.map(ts => {
            const taskType = ts.split('_')[0];
            return taskType.charAt(0) + taskType.slice(1).toLowerCase();
          }).join(', ') || 'Order Items';
          
          const orderStatus = (order.orderStatus || 'PENDING').toUpperCase();
          console.log(`Order ${order.orderId} orderStatus: ${orderStatus}`);
          
          const stages = [
            { name: 'Ordered', completed: true },
            { 
              name: 'Cutting', 
              completed: orderStatus.includes('CUTTING') || orderStatus.includes('STITCHING') || 
                         orderStatus.includes('IRONING') || orderStatus === 'READY' || 
                         orderStatus === 'COMPLETED' || orderStatus === 'DELIVERED'
            },
            { 
              name: 'Stitching', 
              completed: orderStatus.includes('STITCHING') || orderStatus.includes('IRONING') || 
                         orderStatus === 'READY' || orderStatus === 'COMPLETED' || orderStatus === 'DELIVERED'
            },
            { 
              name: 'Ironing', 
              completed: orderStatus.includes('IRONING') || orderStatus === 'READY' || 
                         orderStatus === 'COMPLETED' || orderStatus === 'DELIVERED'
            },
            { 
              name: 'Ready', 
              completed: orderStatus === 'READY' || orderStatus === 'COMPLETED' || orderStatus === 'DELIVERED'
            }
          ];
          
          const completedStagesCount = stages.filter(s => s.completed).length;
          const totalStagesCount = stages.length;
          const progress = Math.round((completedStagesCount / totalStagesCount) * 100);
          const displayStatus = orderStatus.toLowerCase().replace('in_', '').replace('_', ' ');

          return {
            id: `ORD${String(order.orderId).padStart(3, '0')}`,
            item: itemNames,
            status: displayStatus,
            progress: progress,
            deliveryDate: order.deadline ? new Date(order.deadline).toLocaleDateString('en-US', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit'
            }) : 'TBD',
            stages: stages
          };
        });

        setActiveOrders(transformedOrders.slice(0, 3));
      } else {
        console.error('Failed to fetch orders:', ordersResult.error);
      }
      setOrdersLoading(false);

      // Process activities
      if (activitiesResult.success) {
        const activities = activitiesResult.data || [];
        console.log('Recent activities from API:', activities);
        
        const transformedActivities = activities.map(activity => {
          return activity.description || 'Activity update';
        });
        
        setRecentActivities(transformedActivities);
      } else {
        console.error('Failed to fetch activities:', activitiesResult.error);
        setRecentActivities([
          'No recent activities',
          'Check back later for updates'
        ]);
      }
      setActivitiesLoading(false);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setStatsLoading(false);
      setOrdersLoading(false);
      setActivitiesLoading(false);
    }
  };

  // Calculate category distribution from orders
  const calculateCategoryDistribution = (orders) => {
    const categoryCount = {};
    const categoryColors = {
      'CUTTING': '#3b82f6',
      'STITCHING': '#10b981',
      'IRONING': '#f59e0b',
      'SHIRT': '#8b5cf6',
      'PANT': '#ec4899',
      'COAT': '#14b8a6',
      'KURTA': '#f97316',
      'DHOTI': '#06b6d4'
    };
    
    orders.forEach(order => {
      const taskStatuses = order.taskStatuses || [];
      taskStatuses.forEach(ts => {
        const taskType = ts.split('_')[0];
        categoryCount[taskType] = (categoryCount[taskType] || 0) + 1;
      });
    });
    
    const categories = Object.entries(categoryCount).map(([category, count]) => ({
      category: category.charAt(0) + category.slice(1).toLowerCase() + 's',
      count: count,
      color: categoryColors[category] || '#6b7280'
    }));
    
    console.log('Category distribution calculated:', categories);
    setCategoryData(categories);
  };

  // Calculate order trend for last 6 months
  const calculateOrderTrend = (orders) => {
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        month: date.toLocaleString('en-US', { month: 'short' }),
        year: date.getFullYear(),
        monthNum: date.getMonth(),
        orders: 0
      });
    }
    
    orders.forEach(order => {
      if (order.createdAt) {
        const orderDate = new Date(order.createdAt);
        const orderMonth = orderDate.getMonth();
        const orderYear = orderDate.getFullYear();
        
        const monthData = months.find(m => 
          m.monthNum === orderMonth && m.year === orderYear
        );
        if (monthData) {
          monthData.orders++;
        }
      }
    });
    
    console.log('Order trend calculated:', months);
    setOrderTrendData(months);
  };



  return (
    <Layout role="customer">
      <div className="p-4 sm:p-6 bg-gray-50 dark:bg-gray-900">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-7xl mx-auto space-y-4 sm:space-y-6"
        >
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="p-2 sm:p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <LayoutDashboard className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100">
                Welcome back, {customerData.name}!
              </h1>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Here's your tailoring journey</p>
            </div>
          </div>

          {/* Summary Cards - 5 cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            <StatCard
              title="Total Orders"
              value={customerData.totalOrders}
              icon={Package}
              color="bg-blue-500"
              onClick={() => navigate('/customer/orders')}
              loading={statsLoading}
            />
            <StatCard
              title="Active Orders"
              value={customerData.activeOrders}
              icon={Clock}
              color="bg-orange-500"
              onClick={() => navigate('/customer/orders')}
              loading={statsLoading}
            />
            <StatCard
              title="Pending Delivery"
              value={customerData.pendingDelivery}
              icon={TrendingUp}
              color="bg-purple-500"
              onClick={() => navigate('/customer/orders')}
              loading={statsLoading}
            />
            <StatCard
              title="Delivered"
              value={customerData.completedOrders}
              icon={CheckCircle}
              color="bg-green-500"
              onClick={() => navigate('/customer/orders')}
              loading={statsLoading}
            />
            <StatCard
              title="Payment Due"
              value={`₹${customerData.paymentDue.toLocaleString()}`}
              icon={AlertCircle}
              color="bg-red-500"
              onClick={() => navigate('/customer/payment')}
              loading={statsLoading}
            />
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Orders Progress - Left Column */}
            <div className="lg:col-span-2">
              {/* Orders Progress */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Orders Progress</h2>
                  <button
                    onClick={() => navigate('/customer/orders')}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                  >
                    View All
                  </button>
                </div>

                {ordersLoading ? (
                  <div className="space-y-6">
                    {[1, 2].map((i) => (
                      <div key={i} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 animate-pulse">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex-1">
                            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2" />
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-40" />
                          </div>
                          <div className="text-right">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16 mb-2" />
                            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-24" />
                          </div>
                        </div>
                        <div className="mb-4">
                          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full" />
                        </div>
                        <div className="flex items-center justify-between">
                          {[1, 2, 3, 4, 5].map((j) => (
                            <div key={j} className="flex flex-col items-center flex-1">
                              <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full mb-2" />
                              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-12" />
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : activeOrders.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400 text-lg font-medium mb-2">No Orders Yet</p>
                    <p className="text-gray-400 dark:text-gray-500 text-sm mb-6">You haven't placed any orders yet</p>
                    <button
                      onClick={() => navigate('/customer/catalogue')}
                      className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
                    >
                      Browse Catalogue
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {activeOrders.map((order) => (
                      <div key={order.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-gray-100">{order.id}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{order.item}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-600 dark:text-gray-400">Delivery</p>
                            <p className="font-semibold text-gray-900 dark:text-gray-100">{order.deliveryDate}</p>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="mb-4">
                          <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-2">
                            <span>Progress</span>
                            <span>{order.progress}%</span>
                          </div>
                          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${order.progress}%` }}
                              transition={{ duration: 1, ease: 'easeOut' }}
                              className="h-full bg-gradient-to-r from-blue-500 to-green-500"
                            />
                          </div>
                        </div>

                        {/* Stage Timeline */}
                        <div className="flex items-center justify-between">
                          {order.stages.map((stage, idx) => (
                            <div key={idx} className="flex flex-col items-center flex-1">
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: idx * 0.1 }}
                                className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${
                                  stage.completed
                                    ? 'bg-green-500 dark:bg-green-600'
                                    : idx === order.stages.findIndex(s => !s.completed)
                                    ? 'bg-blue-500 dark:bg-blue-600 animate-pulse'
                                    : 'bg-gray-300 dark:bg-gray-600'
                                }`}
                              >
                                {stage.completed ? (
                                  <CheckCircle className="w-4 h-4 text-white" />
                                ) : (
                                  <Clock className="w-4 h-4 text-white" />
                                )}
                              </motion.div>
                              <p className="text-xs text-gray-600 dark:text-gray-400 text-center">{stage.name}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            </div>

            {/* Recent Activity - Right Column */}
            <div>
              {/* Recent Activity */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Activity className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Recent Activity</h2>
                </div>
                {activitiesLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-start gap-3 animate-pulse">
                        <div className="w-2 h-2 bg-gray-200 dark:bg-gray-700 rounded-full mt-2" />
                        <div className="flex-1">
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : recentActivities.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-gray-400 dark:text-gray-500 text-sm">No recent activities</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentActivities.map((activity, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full mt-2" />
                        <p className="text-sm text-gray-700 dark:text-gray-300">{activity}</p>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            </div>
          </div>

          {/* Order Trend Chart - Full Width */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
          >
            <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-4">Order Trend (Last 6 Months)</h3>
            {ordersLoading ? (
              <div className="flex items-end justify-between h-48 gap-2">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2">
                    <div className="h-4 w-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                    <div className="w-full h-24 bg-gray-200 dark:bg-gray-700 rounded-t animate-pulse" />
                    <div className="h-3 w-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  </div>
                ))}
              </div>
            ) : orderTrendData.length === 0 ? (
              <div className="flex items-center justify-center h-48">
                <p className="text-gray-400 dark:text-gray-500 text-sm">No data available</p>
              </div>
            ) : (
              <div className="flex items-end justify-between h-48 gap-2">
                {orderTrendData.map((data, idx) => {
                  const maxOrders = Math.max(...orderTrendData.map(d => d.orders), 1);
                  const height = data.orders > 0 ? (data.orders / maxOrders) * 100 : 0;
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                      <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{data.orders}</span>
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${height}%` }}
                        transition={{ delay: idx * 0.1 }}
                        className="w-full bg-blue-500 dark:bg-blue-600 rounded-t hover:bg-blue-600 dark:hover:bg-blue-500 transition-colors"
                        style={{ minHeight: data.orders > 0 ? '8px' : '0' }}
                      />
                      <span className="text-xs text-gray-600 dark:text-gray-400">{data.month}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        </motion.div>
      </div>
    </Layout>
  );
};

// Stat Card Component
const StatCard = ({ title, value, icon: Icon, color, onClick, loading }) => {
  const colorName = color.match(/bg-(\w+)-/)?.[1] || 'blue';
  const iconColorClass = `text-${colorName}-600 dark:text-${colorName}-400`;
  
  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -5 }}
      onClick={onClick}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-3 sm:p-4 lg:p-6 cursor-pointer border border-gray-200 dark:border-gray-700"
    >
      <div className="flex items-center justify-between mb-2 sm:mb-4">
        <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-lg flex items-center justify-center bg-gray-100 dark:bg-gray-700">
          {loading ? (
            <Loader className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-gray-400 animate-spin" />
          ) : (
            <Icon className={`w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 ${iconColorClass}`} />
          )}
        </div>
      </div>
      <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">{title}</p>
      {loading ? (
        <div className="h-6 sm:h-7 lg:h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mt-1 sm:mt-2" />
      ) : (
        <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1 sm:mt-2">{value}</p>
      )}
    </motion.div>
  );
};

export default Dashboard;
