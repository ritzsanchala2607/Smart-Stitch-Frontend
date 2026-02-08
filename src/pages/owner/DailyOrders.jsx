import { useState, useEffect, useMemo } from 'react';
import Sidebar from '../../components/common/Sidebar';
import Topbar from '../../components/common/Topbar';
import { motion, AnimatePresence } from 'framer-motion';
import usePageTitle from '../../hooks/usePageTitle';
import { Package, Eye, ArrowLeft, Calendar, AlertCircle, X, User, Phone, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useOrders } from '../../hooks/useDataFetch';

const DailyOrders = () => {
  usePageTitle('Daily Orders');
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const today = new Date().toISOString().split('T')[0];
  
  const [selectedDate, setSelectedDate] = useState(today);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Use global state management
  const { orders: globalOrders, ordersLoading, ordersError } = useOrders();

  // Filter orders by selected date using useMemo for performance
  const { dailyOrders, totalOrders } = useMemo(() => {
    if (!globalOrders || globalOrders.length === 0) {
      return { dailyOrders: [], totalOrders: 0 };
    }

    const filtered = globalOrders.filter(order => {
      const orderDate = order.orderDate || (order.createdAt ? new Date(order.createdAt).toISOString().split('T')[0] : null);
      return orderDate === selectedDate;
    });

    return {
      dailyOrders: filtered,
      totalOrders: filtered.length
    };
  }, [globalOrders, selectedDate]);

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

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setShowViewModal(true);
  };

  const handleCloseModal = () => {
    setShowViewModal(false);
    setSelectedOrder(null);
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
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate('/owner/dashboard')}
                  className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                </button>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Daily Orders</h1>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    {totalOrders} order{totalOrders !== 1 ? 's' : ''} on {new Date(selectedDate).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Date Picker */}
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  max={today}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  Orders for {new Date(selectedDate).toLocaleDateString()}
                </h2>
              </div>
              
              {ordersLoading ? (
                <div className="p-12 text-center">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
                    <p className="text-gray-600 dark:text-gray-400">Loading orders...</p>
                  </div>
                </div>
              ) : ordersError ? (
                <div className="p-12 text-center">
                  <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                  <p className="text-red-600 dark:text-red-400 mb-3">{ordersError}</p>
                </div>
              ) : dailyOrders.length === 0 ? (
                <div className="p-12 text-center">
                  <Package className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">No orders placed on this date</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400">Order ID</th>
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
                      {dailyOrders.map((order) => (
                        <tr key={order.orderId || order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">
                            {order.id}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                            {order.customerName}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                            <div className="flex flex-col gap-1">
                              {order.items && order.items.length > 0 ? (
                                order.items.map((item, idx) => (
                                  <span key={idx}>{item.itemName || item.itemType || item.type || item}</span>
                                ))
                              ) : (
                                <span>No items</span>
                              )}
                            </div>
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
                          <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                            {order.deliveryDate}
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => handleViewOrder(order)}
                              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                              title="View Order Details"
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

      {/* View Order Modal */}
      <AnimatePresence>
        {showViewModal && selectedOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={handleCloseModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  {selectedOrder.id} - {selectedOrder.customerName}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-5">
                {/* Status and Amount Row */}
                <div className="flex items-center justify-between mb-5 pb-4 border-b border-gray-200 dark:border-gray-700">
                  <span className={`px-3 py-1.5 text-sm font-semibold rounded-full ${getStatusColor(selectedOrder.status)}`}>
                    {selectedOrder.status}
                  </span>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    ₹{(selectedOrder.totalAmount || selectedOrder.totalPrice || 0).toLocaleString()}
                  </p>
                </div>

                {/* Grid Layout - 2 Columns */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Customer Info */}
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 h-full">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3 uppercase tracking-wide">Customer</h3>
                    <div className="space-y-2 text-sm">
                      <p className="text-gray-900 dark:text-gray-100 font-medium">{selectedOrder.customerName}</p>
                      {selectedOrder.customerPhone && (
                        <p className="text-gray-600 dark:text-gray-400">{selectedOrder.customerPhone}</p>
                      )}
                    </div>
                  </div>

                  {/* Worker Assignments */}
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 h-full">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3 uppercase tracking-wide">Workers</h3>
                    {selectedOrder.workerName ? (
                      <div className="text-sm">
                        <p className="font-medium text-gray-900 dark:text-gray-100">{selectedOrder.workerName}</p>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 dark:text-gray-400">Unassigned</p>
                    )}
                  </div>

                  {/* Order Items */}
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 h-full">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3 uppercase tracking-wide">Items</h3>
                    {selectedOrder.items && selectedOrder.items.length > 0 ? (
                      <ul className="space-y-1.5 text-sm">
                        {selectedOrder.items.map((item, idx) => (
                          <li key={idx} className="text-gray-900 dark:text-gray-100 flex items-start">
                            <span className="text-orange-500 mr-2">•</span>
                            <span>{item.itemName || item.itemType || item.type || item}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-500 dark:text-gray-400">No items</p>
                    )}
                  </div>

                  {/* Dates */}
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 h-full">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3 uppercase tracking-wide">Dates</h3>
                    <div className="space-y-2.5 text-sm">
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-500 uppercase tracking-wide mb-0.5">Order Date</p>
                        <p className="text-gray-900 dark:text-gray-100 font-medium">
                          {new Date(selectedOrder.orderDate || selectedDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-500 uppercase tracking-wide mb-0.5">Delivery Date</p>
                        <p className="text-gray-900 dark:text-gray-100 font-medium">{selectedOrder.deliveryDate}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end gap-2 p-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={handleCloseModal}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    handleCloseModal();
                    navigate('/owner/orders');
                  }}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm"
                >
                  View Full Details
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DailyOrders;
