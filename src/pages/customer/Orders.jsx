import { useState, useEffect } from 'react';
import Sidebar from '../../components/common/Sidebar';
import Topbar from '../../components/common/Topbar';
import { motion, AnimatePresence } from 'framer-motion';
import usePageTitle from '../../hooks/usePageTitle';
import {
  Package,
  Search,
  Filter,
  Eye,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  Scissors,
  X,
  Download,
  MessageSquare,
  Calendar,
  DollarSign,
  User,
  Ruler,
  FileText,
  Image as ImageIcon,
  ChevronRight,
  Activity
} from 'lucide-react';
import { customerAPI } from '../../services/api';

const Orders = () => {
  usePageTitle('My Orders');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // State management
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showAlterationModal, setShowAlterationModal] = useState(false);
  const [alterationRequest, setAlterationRequest] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch orders on mount
  useEffect(() => {
    fetchMyOrders();
  }, []);

  const fetchMyOrders = async () => {
    setIsLoading(true);
    setError(null);

    // Get token
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
      console.error('No token found for fetching orders');
      setError('Authentication error. Please log in again.');
      setIsLoading(false);
      return;
    }

    try {
      const result = await customerAPI.getMyOrders(token);

      if (result.success) {
        console.log('Orders fetched successfully:', result.data);
        // Map API response to component format
        const mappedOrders = (result.data || []).map(order => {
          // Parse task statuses to determine overall status and items
          const taskStatuses = order.taskStatuses || [];
          
          // Use the order status from the database directly
          let orderStatus = order.orderStatus?.toLowerCase() || 'pending';

          // Extract task types from task statuses
          const items = taskStatuses.map((taskStatus, idx) => {
            const taskType = taskStatus.split('_')[0]; // e.g., "CUTTING_IN_PROGRESS" -> "CUTTING"
            return {
              type: taskType.charAt(0) + taskType.slice(1).toLowerCase(), // Capitalize first letter
              fabric: 'Standard',
              color: 'N/A',
              quantity: 1
            };
          });

          return {
            id: `ORD${String(order.orderId).padStart(3, '0')}`,
            orderId: order.orderId,
            customerId: null,
            customerName: order.customerName || 'Unknown',
            orderDate: order.createdAt ? new Date(order.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            deliveryDate: order.deadline || 'N/A',
            status: orderStatus,
            items: items.length > 0 ? items : [{ type: 'Order Item', fabric: 'Standard', color: 'N/A', quantity: 1 }],
            tasks: taskStatuses.map((taskStatus, idx) => {
              const [taskType, status] = taskStatus.split('_');
              return {
                taskType: taskType,
                status: status || 'PENDING'
              };
            }),
            totalAmount: 0, // Not provided in this endpoint
            paidAmount: 0, // Not provided in this endpoint
            balanceAmount: 0, // Not provided in this endpoint
            notes: 'No special instructions',
            paymentStatus: 'UNKNOWN',
            measurements: {}
          };
        });
        setOrders(mappedOrders);
      } else {
        console.error('Failed to fetch orders:', result.error);
        setError(result.error || 'Failed to load orders. Please try again.');
        setOrders([]);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Unable to load orders. The feature may not be available yet. Please try again later.');
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter orders
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.items.some(item => item.type.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    let matchesDate = true;
    if (dateFilter !== 'all') {
      const orderDate = new Date(order.orderDate);
      const today = new Date();
      const daysDiff = Math.floor((today - orderDate) / (1000 * 60 * 60 * 24));
      
      if (dateFilter === 'week') matchesDate = daysDiff <= 7;
      else if (dateFilter === 'month') matchesDate = daysDiff <= 30;
      else if (dateFilter === '3months') matchesDate = daysDiff <= 90;
    }
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  // Handle reorder
  const handleReorder = (order) => {
    setSuccessMessage(`Order ${order.id} items added to cart!`);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  // Handle alteration request
  const handleAlterationSubmit = () => {
    if (!alterationRequest.trim()) return;
    setSuccessMessage('Alteration request submitted successfully!');
    setShowAlterationModal(false);
    setAlterationRequest('');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  // Get status configuration
  const getStatusConfig = (status) => {
    const configs = {
      pending: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Pending', icon: Clock },
      cutting: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Cutting', icon: Scissors },
      stitching: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Stitching', icon: Scissors },
      fitting: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Fitting', icon: User },
      ready: { bg: 'bg-green-100', text: 'text-green-700', label: 'Ready', icon: CheckCircle },
      completed: { bg: 'bg-green-100', text: 'text-green-700', label: 'Completed', icon: CheckCircle },
      delivered: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Delivered', icon: Package }
    };
    return configs[status.toLowerCase()] || configs.pending;
  };

  // Get payment status
  const getPaymentStatus = (order) => {
    if (order.balanceAmount === 0) return { label: 'Paid', color: 'text-green-600', bg: 'bg-green-50' };
    if (order.paidAmount === 0) return { label: 'Unpaid', color: 'text-red-600', bg: 'bg-red-50' };
    return { label: 'Partial', color: 'text-orange-600', bg: 'bg-orange-50' };
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar role="customer" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
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
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Package className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">My Orders</h1>
                  <p className="text-gray-600 dark:text-gray-400">Track and manage your orders</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={fetchMyOrders}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
                  title="Refresh Orders"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Total Orders: <span className="font-bold text-gray-900 dark:text-gray-100">{orders.length}</span>
                </span>
              </div>
            </div>

            {/* Success Message */}
            <AnimatePresence>
              {successMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="flex items-center gap-2 p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg"
                >
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <span className="text-green-700 dark:text-green-400 font-medium">{successMessage}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Search and Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Search */}
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by Order ID or Garment Type..."
                    className="w-full pl-10 pr-4 py-2 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                  />
                </div>

                {/* Filter Toggle */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors text-gray-700 dark:text-gray-300"
                >
                  <Filter className="w-4 h-4" />
                  Filters
                </button>
              </div>

              {/* Filter Options */}
              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Status Filter */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
                        <select
                          value={statusFilter}
                          onChange={(e) => setStatusFilter(e.target.value)}
                          className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-gray-100"
                        >
                          <option value="all">All Status</option>
                          <option value="pending">Pending</option>
                          <option value="cutting">Cutting</option>
                          <option value="stitching">Stitching</option>
                          <option value="fitting">Fitting</option>
                          <option value="ready">Ready</option>
                          <option value="completed">Completed</option>
                          <option value="delivered">Delivered</option>
                        </select>
                      </div>

                      {/* Date Filter */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Date Range</label>
                        <select
                          value={dateFilter}
                          onChange={(e) => setDateFilter(e.target.value)}
                          className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-gray-100"
                        >
                          <option value="all">All Time</option>
                          <option value="week">Last 7 Days</option>
                          <option value="month">Last 30 Days</option>
                          <option value="3months">Last 3 Months</option>
                        </select>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Orders List */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                    <p className="text-gray-600 dark:text-gray-400">Loading orders...</p>
                  </div>
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <AlertCircle className="w-12 h-12 mx-auto mb-3 text-orange-400" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Orders Not Available</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4 max-w-md mx-auto">{error}</p>
                  <div className="flex gap-3 justify-center">
                    <button
                      onClick={fetchMyOrders}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Retry
                    </button>
                    <button
                      onClick={() => window.location.href = '/customer/dashboard'}
                      className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                    >
                      Go to Dashboard
                    </button>
                  </div>
                </div>
              ) : filteredOrders.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400">Order ID</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400">Garment Type</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400">Fabrics</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400">Delivery Date</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {filteredOrders.map((order) => {
                        const statusConfig = getStatusConfig(order.status);
                        const StatusIcon = statusConfig.icon;

                        return (
                          <motion.tr
                            key={order.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                          >
                            <td className="px-6 py-4">
                              <span className="font-semibold text-gray-900 dark:text-gray-100">{order.id}</span>
                              <p className="text-xs text-gray-500 dark:text-gray-400">{order.orderDate}</p>
                            </td>
                            <td className="px-6 py-4">
                              <div className="space-y-1">
                                {order.items.slice(0, 2).map((item, idx) => (
                                  <p key={idx} className="text-sm text-gray-900 dark:text-gray-100">{item.type}</p>
                                ))}
                                {order.items.length > 2 && (
                                  <p className="text-xs text-gray-500 dark:text-gray-400">+{order.items.length - 2} more</p>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="space-y-1">
                                {order.items.slice(0, 2).map((item, idx) => (
                                  <p key={idx} className="text-sm text-gray-600 dark:text-gray-400">{item.fabric}</p>
                                ))}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${statusConfig.bg} dark:${statusConfig.bg.replace('100', '900/30')} ${statusConfig.text} dark:${statusConfig.text.replace('700', '400')}`}>
                                <StatusIcon className="w-3 h-3" />
                                {statusConfig.label}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-900 dark:text-gray-100">{order.deliveryDate}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => setSelectedOrder(order)}
                                  className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                                  title="View Details"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleReorder(order)}
                                  className="p-2 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg transition-colors"
                                  title="Re-order"
                                >
                                  <RefreshCw className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </motion.tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Package className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">No Orders Found</h3>
                  <p className="text-gray-600 dark:text-gray-400">Try adjusting your filters or search terms</p>
                </div>
              )}
            </div>
          </motion.div>
        </main>
      </div>

      {/* Order Details Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto"
            onClick={() => setSelectedOrder(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full my-8"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Order Details</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{selectedOrder.id}</p>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6">
                {/* Order Status & Task Progress */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    Order Progress
                  </h3>
                  
                  {/* Current Status */}
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Current Status</p>
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                      {(() => {
                        const statusConfig = getStatusConfig(selectedOrder.status);
                        const StatusIcon = statusConfig.icon;
                        return (
                          <>
                            <StatusIcon className={`w-5 h-5 ${statusConfig.text} dark:${statusConfig.text.replace('700', '400')}`} />
                            <span className={`font-semibold ${statusConfig.text} dark:${statusConfig.text.replace('700', '400')}`}>
                              {statusConfig.label}
                            </span>
                          </>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Task Progress */}
                  {selectedOrder.tasks && selectedOrder.tasks.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Task Progress</p>
                      <div className="space-y-2">
                        {selectedOrder.tasks.map((task, idx) => {
                          const isCompleted = task.status === 'COMPLETED';
                          const isInProgress = task.status === 'IN_PROGRESS';
                          const isPending = task.status === 'PENDING';
                          
                          return (
                            <div key={idx} className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                isCompleted ? 'bg-green-100 dark:bg-green-900/30' :
                                isInProgress ? 'bg-blue-100 dark:bg-blue-900/30' :
                                'bg-gray-100 dark:bg-gray-700'
                              }`}>
                                {isCompleted ? (
                                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                                ) : isInProgress ? (
                                  <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400 animate-pulse" />
                                ) : (
                                  <Clock className="w-5 h-5 text-gray-400" />
                                )}
                              </div>
                              <div className="flex-1">
                                <p className="font-medium text-gray-900 dark:text-gray-100">{task.taskType}</p>
                                <p className={`text-xs ${
                                  isCompleted ? 'text-green-600 dark:text-green-400' :
                                  isInProgress ? 'text-blue-600 dark:text-blue-400' :
                                  'text-gray-500 dark:text-gray-400'
                                }`}>
                                  {isCompleted ? 'Completed' : isInProgress ? 'In Progress' : 'Pending'}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Items in Order */}
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                    <Package className="w-5 h-5 text-gray-900 dark:text-gray-100" />
                    Items in Order
                  </h3>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                            <Scissors className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-gray-100">{item.type}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{item.fabric}</p>
                            {item.quantity > 1 && (
                              <p className="text-xs text-gray-500 dark:text-gray-500">Quantity: {item.quantity}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Measurements Summary */}
                {selectedOrder.measurements && Object.keys(selectedOrder.measurements).length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                      <Ruler className="w-5 h-5 text-gray-900 dark:text-gray-100" />
                      Measurements
                    </h3>
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                      {Object.entries(selectedOrder.measurements).map(([category, measurements]) => (
                        <div key={category} className="mb-3 last:mb-0">
                          <p className="font-medium text-gray-900 dark:text-gray-100 capitalize mb-2">{category}</p>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                            {typeof measurements === 'object' && !Array.isArray(measurements) ? (
                              Object.entries(measurements).map(([key, value]) => (
                                <div key={key} className="flex justify-between">
                                  <span className="text-gray-600 dark:text-gray-400 capitalize">{key}:</span>
                                  <span className="font-medium text-gray-900 dark:text-gray-100">{value}"</span>
                                </div>
                              ))
                            ) : (
                              <p className="text-gray-600 dark:text-gray-400 col-span-3">{measurements}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Notes from Owner */}
                {selectedOrder.notes && selectedOrder.notes !== 'No special instructions' && (
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-gray-900 dark:text-gray-100" />
                      Special Instructions
                    </h3>
                    <div className="p-4 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                      <p className="text-gray-700 dark:text-yellow-200">{selectedOrder.notes}</p>
                    </div>
                  </div>
                )}

                {/* Delivery Information */}
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-gray-900 dark:text-gray-100" />
                    Delivery Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Order Date</p>
                      <p className="font-semibold text-gray-900 dark:text-gray-100">{selectedOrder.orderDate}</p>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Expected Delivery</p>
                      <p className="font-semibold text-gray-900 dark:text-gray-100">{selectedOrder.deliveryDate}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer - Action Buttons */}
              <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end">
                <button
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
                >
                  <Download className="w-5 h-5" />
                  Download Invoice
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Alteration Request Modal */}
      <AnimatePresence>
        {showAlterationModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4"
            onClick={() => setShowAlterationModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full"
            >
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Request Alteration</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">Describe the alterations you need for this order.</p>
              <textarea
                value={alterationRequest}
                onChange={(e) => setAlterationRequest(e.target.value)}
                placeholder="Please describe the alterations needed..."
                rows={5}
                className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 mb-4"
              />
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowAlterationModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAlterationSubmit}
                  disabled={!alterationRequest.trim()}
                  className="flex-1 px-4 py-2 bg-orange-600 hover:bg-orange-700 dark:bg-orange-600 dark:hover:bg-orange-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Submit Request
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Orders;
