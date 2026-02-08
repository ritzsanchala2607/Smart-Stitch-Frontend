import { useState, useMemo } from 'react';
import Sidebar from '../../components/common/Sidebar';
import Topbar from '../../components/common/Topbar';
import { motion } from 'framer-motion';
import usePageTitle from '../../hooks/usePageTitle';
import { Package, Calendar, IndianRupee, Eye, ArrowLeft, TrendingUp, BarChart3, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useOrders } from '../../hooks/useDataFetch';

const WeeklyOrders = () => {
  usePageTitle('Weekly Orders');
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Use global state management
  const { orders: globalOrders, ordersLoading, ordersError } = useOrders();

  // Filter orders for last 7 days using useMemo for performance
  const { weeklyOrders, totalOrders, totalRevenue, completedOrders, pendingOrders, avgOrderValue } = useMemo(() => {
    if (!globalOrders || globalOrders.length === 0) {
      return {
        weeklyOrders: [],
        totalOrders: 0,
        totalRevenue: 0,
        completedOrders: 0,
        pendingOrders: 0,
        avgOrderValue: 0
      };
    }

    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    const filtered = globalOrders.filter(order => {
      const orderDate = order.orderDate || (order.createdAt ? new Date(order.createdAt).toISOString().split('T')[0] : null);
      const orderDateObj = new Date(orderDate);
      return orderDateObj >= weekAgo;
    });

    const revenue = filtered.reduce((sum, order) => sum + (order.totalAmount || order.totalPrice || 0), 0);
    const completed = filtered.filter(o => o.status?.toLowerCase() === 'completed' || o.status?.toLowerCase() === 'ready').length;
    const pending = filtered.filter(o => o.status?.toLowerCase() !== 'completed' && o.status?.toLowerCase() !== 'ready').length;
    const avg = filtered.length > 0 ? revenue / filtered.length : 0;

    return {
      weeklyOrders: filtered,
      totalOrders: filtered.length,
      totalRevenue: revenue,
      completedOrders: completed,
      pendingOrders: pending,
      avgOrderValue: avg
    };
  }, [globalOrders]);

  // Remove all the old state and fetch logic
  // const [weeklyOrders, setWeeklyOrders] = useState([]);
  // const [totalOrders, setTotalOrders] = useState(0);
  // const [totalRevenue, setTotalRevenue] = useState(0);
  // const [startDate, setStartDate] = useState('');
  // const [endDate, setEndDate] = useState('');
  // const [isLoading, setIsLoading] = useState(false);
  // const [error, setError] = useState(null);

  // useEffect(() => {
  //   fetchWeeklyOrders();
  // }, []);

  // const fetchWeeklyOrders = async () => { ... }
  
  // Calculate statistics - now computed in useMemo above
  // const completedOrders = weeklyOrders.filter(o => o.status?.toLowerCase() === 'completed' || o.status?.toLowerCase() === 'ready').length;
  // const pendingOrders = weeklyOrders.filter(o => o.status?.toLowerCase() !== 'completed' && o.status?.toLowerCase() !== 'ready').length;
  // const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  const getStatusColor = (status) => {
    const statusLower = status?.toLowerCase() || '';
    switch (statusLower) {
      case 'ready':
      case 'completed':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'stitching':
      case 'in_progress':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'cutting':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
      case 'new':
      case 'pending':
        return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar role="owner" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="flex-1 overflow-y-auto p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-7xl mx-auto"
          >
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
              <button
                onClick={() => navigate('/owner/dashboard')}
                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Weekly Orders</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">Orders from the last 7 days</p>
              </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <StatCard
                title="Total Orders"
                value={weeklyOrders.length}
                icon={Package}
                color="bg-purple-500"
              />
              <StatCard
                title="Completed"
                value={completedOrders}
                icon={TrendingUp}
                color="bg-green-500"
              />
              <StatCard
                title="Pending"
                value={pendingOrders}
                icon={Calendar}
                color="bg-orange-500"
              />
              <StatCard
                title="Total Revenue"
                value={`₹${totalRevenue.toLocaleString()}`}
                icon={IndianRupee}
                color="bg-blue-500"
              />
            </div>

            {/* Additional Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Average Order Value</h3>
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">₹{avgOrderValue.toFixed(2)}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Per order this week</p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Completion Rate</h3>
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {weeklyOrders.length > 0 ? Math.round((completedOrders / weeklyOrders.length) * 100) : 0}%
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Orders completed on time</p>
              </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Last 7 Days Orders</h2>
              </div>
              {ordersLoading ? (
                <div className="p-12 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
                </div>
              ) : ordersError ? (
                <div className="p-12 text-center">
                  <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                  <p className="text-red-600 dark:text-red-400">{ordersError}</p>
                </div>
              ) : weeklyOrders.length === 0 ? (
                <div className="p-12 text-center">
                  <Package className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">No orders in the last 7 days</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400">Order ID</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400">Customer</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400">Items</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400">Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400">Worker</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400">Delivery</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {weeklyOrders.map((order) => (
                        <tr key={order.orderId || order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">
                            {order.id}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                            {order.orderDate}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{order.customerName}</td>
                          <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                            {order.items && order.items.length > 0 ? (
                              <div className="flex flex-col gap-1">
                                {order.items.map((item, idx) => (
                                  <span key={idx}>{item.itemName || item.itemType || item.type || item}</span>
                                ))}
                              </div>
                            ) : (
                              'No items'
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-gray-100">
                            ₹{(order.totalAmount || order.totalPrice || 0).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                            {order.workerName || 'Unassigned'}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{order.deliveryDate}</td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => navigate('/owner/orders')}
                              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                              title="View in Orders"
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
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ title, value, icon: Icon, color }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
      <p className="text-gray-500 dark:text-gray-400 text-sm">{title}</p>
      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-2">{value}</p>
    </motion.div>
  );
};

export default WeeklyOrders;
