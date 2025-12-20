import { useState } from 'react';
import Sidebar from '../../components/common/Sidebar';
import Topbar from '../../components/common/Topbar';
import { motion, AnimatePresence } from 'framer-motion';
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
  ChevronRight
} from 'lucide-react';
import { orders } from '../../data/dummyData';

const Orders = () => {
  // Mock customer ID (in real app, this would come from auth context)
  const currentCustomerId = 'CUST001';

  // Get customer's orders
  const customerOrders = orders.filter(o => o.customerId === currentCustomerId);

  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showAlterationModal, setShowAlterationModal] = useState(false);
  const [alterationRequest, setAlterationRequest] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Filter orders
  const filteredOrders = customerOrders.filter(order => {
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
      ready: { bg: 'bg-green-100', text: 'text-green-700', label: 'Ready', icon: CheckCircle }
    };
    return configs[status] || configs.pending;
  };

  // Get payment status
  const getPaymentStatus = (order) => {
    if (order.balanceAmount === 0) return { label: 'Paid', color: 'text-green-600', bg: 'bg-green-50' };
    if (order.paidAmount === 0) return { label: 'Unpaid', color: 'text-red-600', bg: 'bg-red-50' };
    return { label: 'Partial', color: 'text-orange-600', bg: 'bg-orange-50' };
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar role="customer" />
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
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Total Orders: <span className="font-bold text-gray-900 dark:text-gray-100">{customerOrders.length}</span>
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
                          <option value="ready">Ready / Completed</option>
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
              {filteredOrders.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400">Order ID</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400">Garment Type</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400">Fabrics</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400">Delivery Date</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400">Payment</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {filteredOrders.map((order) => {
                        const statusConfig = getStatusConfig(order.status);
                        const paymentStatus = getPaymentStatus(order);
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
                              <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${paymentStatus.bg} dark:${paymentStatus.bg.replace('50', '900/30')} ${paymentStatus.color} dark:${paymentStatus.color.replace('600', '400')}`}>
                                {paymentStatus.label}
                              </span>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">₹{order.totalAmount.toLocaleString()}</p>
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
                {/* Order Status Timeline */}
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-gray-900 dark:text-gray-100" />
                    Order Timeline
                  </h3>
                  <div className="space-y-3">
                    {selectedOrder.timeline.map((event, idx) => {
                      const statusConfig = getStatusConfig(event.status);
                      const StatusIcon = statusConfig.icon;
                      const isLast = idx === selectedOrder.timeline.length - 1;

                      return (
                        <div key={idx} className="flex items-start gap-3">
                          <div className="relative">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${statusConfig.bg} dark:${statusConfig.bg.replace('100', '900/30')}`}>
                              <StatusIcon className={`w-4 h-4 ${statusConfig.text} dark:${statusConfig.text.replace('700', '400')}`} />
                            </div>
                            {!isLast && (
                              <div className="absolute left-1/2 top-8 w-0.5 h-6 bg-gray-300 dark:bg-gray-600 transform -translate-x-1/2"></div>
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 dark:text-gray-100 capitalize">{event.status}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{event.date} at {event.time}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Items in Order */}
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                    <Package className="w-5 h-5 text-gray-900 dark:text-gray-100" />
                    Items in Order
                  </h3>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                            <Scissors className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-gray-100">{item.type}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{item.fabric} - {item.color}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-500">Quantity: {item.quantity}</p>
                          </div>
                        </div>
                        <p className="font-bold text-gray-900 dark:text-gray-100">₹{item.price.toLocaleString()}</p>
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

                {/* Tailor Assigned */}
                {selectedOrder.workerName && (
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                      <User className="w-5 h-5 text-gray-900 dark:text-gray-100" />
                      Assigned Tailor
                    </h3>
                    <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">{selectedOrder.workerName}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">ID: {selectedOrder.assignedWorker}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Notes from Owner */}
                {selectedOrder.notes && (
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

                {/* Payment Breakdown */}
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-gray-900 dark:text-gray-100" />
                    Payment Details
                  </h3>
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Total Amount:</span>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">₹{selectedOrder.totalAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Paid Amount:</span>
                      <span className="font-semibold text-green-600 dark:text-green-400">₹{selectedOrder.paidAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-gray-300 dark:border-gray-600">
                      <span className="text-gray-900 dark:text-gray-100 font-semibold">Balance Due:</span>
                      <span className="font-bold text-red-600 dark:text-red-400">₹{selectedOrder.balanceAmount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Delivery Information */}
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-gray-900 dark:text-gray-100" />
                    Delivery Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Order Date</p>
                      <p className="font-semibold text-gray-900 dark:text-gray-100">{selectedOrder.orderDate}</p>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Expected Delivery</p>
                      <p className="font-semibold text-gray-900 dark:text-gray-100">{selectedOrder.deliveryDate}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer - Action Buttons */}
              <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex flex-wrap gap-3">
                <button
                  onClick={() => {
                    setShowAlterationModal(true);
                    setSelectedOrder(null);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 dark:bg-orange-600 dark:hover:bg-orange-700 text-white rounded-lg transition-colors"
                >
                  <AlertCircle className="w-4 h-4" />
                  Request Alteration
                </button>
                <button
                  onClick={() => handleReorder(selectedOrder)}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Re-order
                </button>
                <button
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download Invoice
                </button>
                <button
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 dark:bg-purple-600 dark:hover:bg-purple-700 text-white rounded-lg transition-colors"
                >
                  <MessageSquare className="w-4 h-4" />
                  Contact Support
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
