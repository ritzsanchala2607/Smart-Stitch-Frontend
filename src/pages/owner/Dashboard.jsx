import { useState, useEffect } from 'react';
import Sidebar from '../../components/common/Sidebar';
import Topbar from '../../components/common/Topbar';
import { motion } from 'framer-motion';
import usePageTitle from '../../hooks/usePageTitle';
import { 
  Package, Users, DollarSign, AlertCircle, CheckCircle, Clock, UserCog,
  Scissors, TrendingUp, Calendar, MessageSquare, Star, Search, X,
  ShoppingBag, FileText, BarChart3, Activity, Bell, ChevronRight,
  Eye, Zap, Box, AlertTriangle, User
} from 'lucide-react';
import { dashboardStats, orders, workers, customers, inventory, notifications, reviews } from '../../data/dummyData';
import { useNavigate } from 'react-router-dom';
import { orderAPI } from '../../services/api';

const OwnerDashboard = () => {
  usePageTitle('Dashboard');
  const stats = dashboardStats.owner;
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dailyOrdersCount, setDailyOrdersCount] = useState(0);
  const [isLoadingDailyOrders, setIsLoadingDailyOrders] = useState(false);
  const [weeklyOrdersCount, setWeeklyOrdersCount] = useState(0);
  const [isLoadingWeeklyOrders, setIsLoadingWeeklyOrders] = useState(false);
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);
  const [isLoadingPendingOrders, setIsLoadingPendingOrders] = useState(false);
  const [weeklyChartData, setWeeklyChartData] = useState([]);
  const [isLoadingWeeklyChart, setIsLoadingWeeklyChart] = useState(false);
  const [recentOrdersData, setRecentOrdersData] = useState([]);
  const [isLoadingRecentOrders, setIsLoadingRecentOrders] = useState(false);

  // Calculate today's and weekly orders
  const today = new Date().toISOString().split('T')[0];
  const todayOrders = orders.filter(o => o.orderDate === today);
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const weeklyOrders = orders.filter(o => o.orderDate >= weekAgo);

  // Fetch all dashboard data in parallel on mount
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    // Get token once
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

    if (!token) {
      console.error('No token found for dashboard');
      // Set all loading states to false
      setIsLoadingDailyOrders(false);
      setIsLoadingWeeklyOrders(false);
      setIsLoadingPendingOrders(false);
      setIsLoadingWeeklyChart(false);
      setIsLoadingRecentOrders(false);
      return;
    }

    // Set all loading states to true
    setIsLoadingDailyOrders(true);
    setIsLoadingWeeklyOrders(true);
    setIsLoadingPendingOrders(true);
    setIsLoadingWeeklyChart(true);
    setIsLoadingRecentOrders(true);

    // Load all data in parallel
    const today = new Date().toISOString().split('T')[0];
    
    try {
      const [dailyResult, weeklyResult, allOrdersResult] = await Promise.all([
        orderAPI.getDailyOrders(today, token).catch(err => ({ success: false, error: err })),
        orderAPI.getWeeklyOrders(token).catch(err => ({ success: false, error: err })),
        orderAPI.getOrders(token).catch(err => ({ success: false, error: err }))
      ]);

      // Process daily orders
      if (dailyResult.success) {
        const responseData = dailyResult.data.data || dailyResult.data;
        setDailyOrdersCount(responseData.totalOrders || 0);
      } else {
        console.error('Failed to fetch daily orders:', dailyResult.error);
        setDailyOrdersCount(todayOrders.length);
      }
      setIsLoadingDailyOrders(false);

      // Process weekly orders
      if (weeklyResult.success) {
        const responseData = weeklyResult.data.data || weeklyResult.data;
        setWeeklyOrdersCount(responseData.totalOrders || 0);
      } else {
        console.error('Failed to fetch weekly orders:', weeklyResult.error);
        setWeeklyOrdersCount(weeklyOrders.length);
      }
      setIsLoadingWeeklyOrders(false);

      // Process all orders for pending count, chart, and recent orders
      if (allOrdersResult.success) {
        const allOrders = allOrdersResult.data || [];

        // Calculate pending orders
        const pending = allOrders.filter(order => {
          const status = (order.status || '').toLowerCase();
          return status !== 'ready' && status !== 'delivered' && status !== 'completed';
        });
        setPendingOrdersCount(pending.length);
        setIsLoadingPendingOrders(false);

        // Calculate weekly chart data
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const todayDate = new Date();
        const last7Days = [];
        
        for (let i = 6; i >= 0; i--) {
          const date = new Date(todayDate);
          date.setDate(date.getDate() - i);
          const dayName = days[date.getDay()];
          const dateStr = date.toISOString().split('T')[0];
          
          const dayOrders = allOrders.filter(order => {
            const orderDate = order.createdAt ? new Date(order.createdAt).toISOString().split('T')[0] : null;
            return orderDate === dateStr;
          });
          
          const dayRevenue = dayOrders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);
          
          last7Days.push({
            day: dayName,
            orders: dayOrders.length,
            revenue: dayRevenue
          });
        }
        setWeeklyChartData(last7Days);
        setIsLoadingWeeklyChart(false);

        // Get recent orders
        const sortedOrders = allOrders
          .sort((a, b) => {
            const dateA = new Date(a.createdAt || 0);
            const dateB = new Date(b.createdAt || 0);
            return dateB - dateA;
          })
          .slice(0, 5);
        
        const mappedOrders = sortedOrders.map(order => ({
          id: `ORD${String(order.orderId).padStart(3, '0')}`,
          orderId: order.orderId,
          customerName: order.customer?.name || order.customerName || 'Unknown Customer',
          items: order.items || [],
          workerName: order.tasks && order.tasks.length > 0 
            ? order.tasks[0].workerName || order.tasks[0].worker?.name || 'Unassigned'
            : 'Unassigned',
          status: order.status ? order.status.toLowerCase() : 'pending',
          deliveryDate: order.deadline || 'N/A'
        }));
        
        setRecentOrdersData(mappedOrders);
        setIsLoadingRecentOrders(false);
      } else {
        console.error('Failed to fetch orders:', allOrdersResult.error);
        // Set fallback data
        setPendingOrdersCount(pendingOrders.length);
        setIsLoadingPendingOrders(false);
        
        setWeeklyChartData([
          { day: 'Mon', orders: 12, revenue: 15000 },
          { day: 'Tue', orders: 15, revenue: 18000 },
          { day: 'Wed', orders: 18, revenue: 22000 },
          { day: 'Thu', orders: 14, revenue: 17000 },
          { day: 'Fri', orders: 20, revenue: 25000 },
          { day: 'Sat', orders: 17, revenue: 21000 },
          { day: 'Sun', orders: 22, revenue: 28000 }
        ]);
        setIsLoadingWeeklyChart(false);
        
        setRecentOrdersData(orders.slice(0, 5));
        setIsLoadingRecentOrders(false);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      // Set all loading states to false
      setIsLoadingDailyOrders(false);
      setIsLoadingWeeklyOrders(false);
      setIsLoadingPendingOrders(false);
      setIsLoadingWeeklyChart(false);
      setIsLoadingRecentOrders(false);
    }
  };

  // Remove individual fetch functions - they're now part of loadDashboardData
  const fetchDailyOrdersCount = async () => {
    // Deprecated - now handled by loadDashboardData
  };

  const fetchWeeklyOrdersCount = async () => {
    // Deprecated - now handled by loadDashboardData
  };

  const fetchPendingOrdersCount = async () => {
    // Deprecated - now handled by loadDashboardData
  };

  const fetchWeeklyChartData = async () => {
    // Deprecated - now handled by loadDashboardData
  };

  const fetchRecentOrders = async () => {
    // Deprecated - now handled by loadDashboardData
  };
  
  // Pending work with urgency
  const pendingOrders = orders.filter(o => o.status !== 'ready');
  const urgentOrders = pendingOrders.filter(o => o.priority === 'high').length;
  const mediumOrders = pendingOrders.filter(o => o.priority === 'medium').length;
  const lowOrders = pendingOrders.filter(o => o.priority === 'low').length;

  // Worker performance
  const totalPerformance = workers.reduce((sum, w) => sum + w.performance, 0);
  const avgPerformance = Math.round(totalPerformance / workers.length);

  // Recent orders - use API data if available, fallback to dummy data
  const recentOrders = recentOrdersData.length > 0 ? recentOrdersData : orders.slice(0, 5);
  const activeWorkers = workers.filter(w => w.status === 'active');

  // Low stock items
  const lowStockItems = inventory.filter(item => item.quantity <= item.minStock);

  // Delivery calendar
  const upcomingDeliveries = orders
    .filter(o => o.status !== 'ready')
    .sort((a, b) => new Date(a.deliveryDate) - new Date(b.deliveryDate))
    .slice(0, 5);

  // Mock chat messages
  const recentMessages = [
    { id: 1, worker: 'Mike Tailor', message: 'Order #ORD001 is ready for fitting', time: '5 min ago', avatar: null },
    { id: 2, worker: 'Sarah Stitcher', message: 'Need more silk fabric for ORD002', time: '15 min ago', avatar: null },
    { id: 3, worker: 'David Designer', message: 'Customer approved the design', time: '1 hour ago', avatar: null }
  ];

  // Order timeline
  const orderTimeline = [
    { status: 'completed', count: orders.filter(o => o.status === 'ready').length, color: 'bg-green-500' },
    { status: 'active', count: orders.filter(o => ['stitching', 'cutting', 'fitting'].includes(o.status)).length, color: 'bg-blue-500' },
    { status: 'delayed', count: orders.filter(o => new Date(o.deliveryDate) < new Date() && o.status !== 'ready').length, color: 'bg-red-500' }
  ];

  // Use API data for chart, fallback to empty data if not loaded yet
  const weeklyData = weeklyChartData.length > 0 ? weeklyChartData : [
    { day: 'Mon', orders: 0, revenue: 0 },
    { day: 'Tue', orders: 0, revenue: 0 },
    { day: 'Wed', orders: 0, revenue: 0 },
    { day: 'Thu', orders: 0, revenue: 0 },
    { day: 'Fri', orders: 0, revenue: 0 },
    { day: 'Sat', orders: 0, revenue: 0 },
    { day: 'Sun', orders: 0, revenue: 0 }
  ];

  const maxOrders = Math.max(...weeklyData.map(d => d.orders), 1); // Minimum 1 to avoid division by zero

  // Quick actions
  const quickActions = [
    { icon: Package, label: 'New Order', color: 'bg-blue-500', path: '/owner/orders' },
    { icon: Users, label: 'Add Customer', color: 'bg-purple-500', path: '/owner/customers' },
    { icon: UserCog, label: 'Add Worker', color: 'bg-green-500', path: '/owner/workers' },
    { icon: DollarSign, label: 'Generate Invoice', color: 'bg-orange-500', path: '/owner/billing' },
    { icon: Box, label: 'Add Inventory', color: 'bg-indigo-500', path: '/owner/inventory' },
    { icon: BarChart3, label: 'Reports', color: 'bg-pink-500', path: '/owner/analytics' },
  ];

  // Search functionality
  const handleSearch = (query) => {
    setSearchQuery(query);
    setShowSearchResults(query.length > 0);
  };

  const searchResults = {
    orders: orders.filter(o => 
      o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 3),
    customers: customers.filter(c => 
      c.name.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 3),
    workers: workers.filter(w => 
      w.name.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 3)
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar role="owner" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-y-auto p-6 dark:bg-gray-900">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-7xl mx-auto space-y-6"
          >

            {/* Header with Search */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                  <Scissors className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Owner Dashboard</h1>
                  <p className="text-gray-600 dark:text-gray-400">Welcome back! Here's what's happening today.</p>
                </div>
              </div>

              {/* Global Search */}
              <div className="relative w-96">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                <input
                  type="text"
                  placeholder="Search orders, customers, workers..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setShowSearchResults(false);
                    }}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  >
                    <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                  </button>
                )}

                {/* Search Results Dropdown */}
                {showSearchResults && (
                  <div className="absolute top-full mt-2 w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 max-h-96 overflow-y-auto">
                    {searchResults.orders.length > 0 && (
                      <div className="p-3 border-b border-gray-100 dark:border-gray-700">
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">ORDERS</p>
                        {searchResults.orders.map(order => (
                          <div
                            key={order.id}
                            onClick={() => navigate('/owner/orders')}
                            className="p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded cursor-pointer"
                          >
                            <p className="font-medium text-sm text-gray-900 dark:text-gray-100">{order.id}</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">{order.customerName}</p>
                          </div>
                        ))}
                      </div>
                    )}
                    {searchResults.customers.length > 0 && (
                      <div className="p-3 border-b border-gray-100 dark:border-gray-700">
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">CUSTOMERS</p>
                        {searchResults.customers.map(customer => (
                          <div
                            key={customer.id}
                            onClick={() => navigate('/owner/customers')}
                            className="p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded cursor-pointer"
                          >
                            <p className="font-medium text-sm text-gray-900 dark:text-gray-100">{customer.name}</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">{customer.phone}</p>
                          </div>
                        ))}
                      </div>
                    )}
                    {searchResults.workers.length > 0 && (
                      <div className="p-3">
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">WORKERS</p>
                        {searchResults.workers.map(worker => (
                          <div
                            key={worker.id}
                            onClick={() => navigate('/owner/workers')}
                            className="p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded cursor-pointer"
                          >
                            <p className="font-medium text-sm text-gray-900 dark:text-gray-100">{worker.name}</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">{worker.specialization}</p>
                          </div>
                        ))}
                      </div>
                    )}
                    {searchResults.orders.length === 0 && searchResults.customers.length === 0 && searchResults.workers.length === 0 && (
                      <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm">
                        No results found
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions Toolbar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">Quick Actions</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {quickActions.map((action, index) => (
                  <QuickActionButton 
                    key={index}
                    icon={action.icon} 
                    label={action.label} 
                    color={action.color}
                    onClick={() => navigate(action.path)}
                  />
                ))}
              </div>
            </motion.div>

            {/* Dashboard Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard 
                title="Daily Orders" 
                value={isLoadingDailyOrders ? '...' : dailyOrdersCount} 
                icon={Package}
                color="bg-blue-500"
                subtitle="Today"
                onClick={() => navigate('/owner/daily-orders')}
              />
              <StatCard 
                title="Weekly Orders" 
                value={isLoadingWeeklyOrders ? '...' : weeklyOrdersCount} 
                icon={TrendingUp}
                color="bg-purple-500"
                subtitle="Last 7 days"
                onClick={() => navigate('/owner/weekly-orders')}
              />
              <StatCard 
                title="Pending Work" 
                value={isLoadingPendingOrders ? '...' : pendingOrdersCount}
                icon={Clock}
                color="bg-orange-500"
                subtitle="In progress"
                onClick={() => navigate('/owner/pending-work')}
              />
              <StatCard 
                title="Monthly Revenue" 
                value={`₹${stats.totalRevenue.toLocaleString()}`} 
                icon={DollarSign}
                color="bg-green-500"
                subtitle="This month"
              />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - 2/3 width */}
              <div className="lg:col-span-2 space-y-6">
                {/* Orders Overview Chart */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Orders Overview</h2>
                    <div className="flex gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span className="text-gray-600 dark:text-gray-400">Orders</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-gray-600 dark:text-gray-400">Revenue</span>
                      </div>
                    </div>
                  </div>
                  {isLoadingWeeklyChart ? (
                    <div className="flex items-center justify-center h-64">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
                    </div>
                  ) : (
                    <div className="flex items-end justify-between h-64 gap-2">
                      {weeklyData.map((data, index) => (
                        <div key={index} className="flex-1 flex flex-col items-center gap-2">
                          <div className="w-full flex flex-col items-center gap-1">
                            <div className="relative w-full">
                              <div
                                className="bg-blue-500 rounded-t-lg transition-all hover:bg-blue-600"
                                style={{ height: `${(data.orders / maxOrders) * 200}px` }}
                              ></div>
                              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-semibold text-gray-700 dark:text-gray-300">
                                {data.orders}
                              </div>
                            </div>
                          </div>
                          <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">{data.day}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>


                {/* Recent Orders Table */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden"
                >
                  <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Recent Orders</h2>
                  </div>
                  {isLoadingRecentOrders ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
                    </div>
                  ) : recentOrders.length === 0 ? (
                    <div className="p-12 text-center">
                      <Package className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-600 dark:text-gray-400">No recent orders</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400">Order ID</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400">Customer</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400">Items</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400">Worker</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400">Delivery</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                          {recentOrders.map((order) => (
                            <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                              <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">{order.id}</td>
                              <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{order.customerName}</td>
                              <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                                {order.items && order.items.length > 0 
                                  ? order.items.map(item => item.itemName || item.itemType || item.type).join(', ')
                                  : 'N/A'
                                }
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{order.workerName || 'Unassigned'}</td>
                              <td className="px-6 py-4">
                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                  order.status === 'ready' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                  order.status === 'delivered' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                  order.status === 'stitching' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                                  order.status === 'cutting' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                                  'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                                }`}>
                                  {order.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{order.deliveryDate}</td>
                              <td className="px-6 py-4">
                                <button
                                  onClick={() => navigate('/owner/orders')}
                                  className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </motion.div>

                {/* Customer Order Timeline Widget */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
                >
                  <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Order Timeline</h2>
                  <div className="flex items-center justify-between">
                    {orderTimeline.map((item, index) => (
                      <div key={index} className="flex-1 text-center">
                        <div className={`${item.color} text-white rounded-lg p-4 mb-2`}>
                          <p className="text-3xl font-bold">{item.count}</p>
                        </div>
                        <p className="text-sm font-medium text-gray-600 capitalize">{item.status}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>

              {/* Right Column - 1/3 width */}
              <div className="space-y-6">
                {/* Notifications Panel */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Notifications</h2>
                    <Bell className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                  </div>
                  <div className="space-y-3">
                    {/* Low Stock Alert */}
                    {lowStockItems.length > 0 && (
                      <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
                        <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold text-red-900">Low Stock Alert</p>
                          <p className="text-xs text-red-700">{lowStockItems.length} items running low</p>
                        </div>
                      </div>
                    )}

                    {/* Urgent Deliveries */}
                    {urgentOrders > 0 && (
                      <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                        <Clock className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold text-orange-900">Urgent Deliveries</p>
                          <p className="text-xs text-orange-700">{urgentOrders} orders need attention</p>
                        </div>
                      </div>
                    )}

                    {/* New Feedback */}
                    <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <Star className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-blue-900">New Feedback</p>
                        <p className="text-xs text-blue-700">{reviews.length} customer reviews</p>
                      </div>
                    </div>

                    {/* Worker Performance */}
                    {workers.filter(w => w.performance < 70).length > 0 && (
                      <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                        <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold text-yellow-900">Performance Issue</p>
                          <p className="text-xs text-yellow-700">{workers.filter(w => w.performance < 70).length} workers need support</p>
                        </div>
                      </div>
                    )}

                    {/* New Customers */}
                    <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                      <Users className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-green-900">New Customers</p>
                        <p className="text-xs text-green-700">{customers.filter(c => c.totalOrders === 0).length} new signups</p>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate('/owner/notifications')}
                    className="w-full mt-4 text-sm text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 font-medium flex items-center justify-center gap-1"
                  >
                    View All <ChevronRight className="w-4 h-4" />
                  </button>
                </motion.div>

                {/* Delivery Calendar Widget */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Upcoming Deliveries</h2>
                    <Calendar className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                  </div>
                  <div className="space-y-3">
                    {upcomingDeliveries.map((order) => {
                      const deliveryDate = new Date(order.deliveryDate);
                      const isLate = deliveryDate < new Date() && order.status !== 'ready';
                      const isToday = deliveryDate.toDateString() === new Date().toDateString();
                      
                      return (
                        <div key={order.id} className={`p-3 rounded-lg border ${
                          isLate ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' :
                          isToday ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' :
                          'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
                        }`}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold text-sm text-gray-900 dark:text-gray-100">{order.id}</span>
                            <span className={`text-xs font-medium ${
                              isLate ? 'text-red-600 dark:text-red-400' :
                              isToday ? 'text-green-600 dark:text-green-400' :
                              'text-gray-600 dark:text-gray-400'
                            }`}>
                              {isLate ? 'Late' : isToday ? 'Today' : order.deliveryDate}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400">{order.customerName}</p>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>

                {/* Mini Chat Preview */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Recent Messages</h2>
                    <MessageSquare className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                  </div>
                  <div className="space-y-3">
                    {recentMessages.map((msg) => (
                      <div key={msg.id} className="flex items-start gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg cursor-pointer">
                        {msg.avatar ? (
                          <img 
                            src={msg.avatar} 
                            alt={msg.worker}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                            <User className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-sm text-gray-900 dark:text-gray-100">{msg.worker}</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">{msg.time}</span>
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400 truncate">{msg.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => navigate('/owner/chat')}
                    className="w-full mt-4 text-sm text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 font-medium flex items-center justify-center gap-1"
                  >
                    Open Chat <ChevronRight className="w-4 h-4" />
                  </button>
                </motion.div>

                {/* Feedback & Ratings Preview */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Latest Reviews</h2>
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  </div>
                  <div className="space-y-3">
                    {reviews.slice(0, 3).map((review) => (
                      <div key={review.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-sm text-gray-900 dark:text-gray-100">{review.customerName}</span>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3 h-3 ${
                                  i < review.rating
                                    ? 'text-yellow-500 fill-yellow-500'
                                    : 'text-gray-300 dark:text-gray-600'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Average Rating</span>
                      <span className="text-lg font-bold text-orange-600 dark:text-orange-400">{stats.avgRating}/5</span>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate('/owner/ratings')}
                    className="w-full mt-4 text-sm text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 font-medium flex items-center justify-center gap-1"
                  >
                    View All Feedback <ChevronRight className="w-4 h-4" />
                  </button>
                </motion.div>

                {/* Worker Availability Bar */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
                >
                  <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Worker Availability</h2>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Available</span>
                      <span className="text-sm font-bold text-green-600 dark:text-green-400">
                        {workers.filter(w => w.status === 'active' && w.assignedOrders < 5).length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Busy</span>
                      <span className="text-sm font-bold text-orange-600 dark:text-orange-400">
                        {workers.filter(w => w.status === 'active' && w.assignedOrders >= 5).length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">On Leave</span>
                      <span className="text-sm font-bold text-gray-600 dark:text-gray-400">
                        {workers.filter(w => w.status === 'on-leave').length}
                      </span>
                    </div>
                  </div>
                </motion.div>

                {/* Fabric Stock Status */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 }}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
                >
                  <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Low Stock Items</h2>
                  <div className="space-y-2">
                    {lowStockItems.slice(0, 5).map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-2 bg-red-50 dark:bg-red-900/20 rounded">
                        <span className="text-sm text-gray-900 dark:text-gray-100">{item.name}</span>
                        <span className="text-sm font-bold text-red-600 dark:text-red-400">{item.quantity} {item.unit}</span>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => navigate('/owner/inventory')}
                    className="w-full mt-4 text-sm text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 font-medium flex items-center justify-center gap-1"
                  >
                    Manage Inventory <ChevronRight className="w-4 h-4" />
                  </button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ title, value, icon: Icon, color, subtitle, onClick }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -5 }}
      onClick={onClick}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 cursor-pointer"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
      <p className="text-gray-500 dark:text-gray-400 text-sm">{title}</p>
      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-2">{value}</p>
      {subtitle && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>}
    </motion.div>
  );
};

// Quick Action Button Component
const QuickActionButton = ({ icon: Icon, label, color, onClick }) => {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`${color} text-white rounded-lg p-4 flex flex-col items-center gap-2 hover:shadow-lg transition-shadow`}
    >
      <Icon className="w-6 h-6" />
      <span className="text-xs font-semibold text-center">{label}</span>
    </motion.button>
  );
};

export default OwnerDashboard;
