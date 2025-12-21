import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import usePageTitle from '../../hooks/usePageTitle';
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  Award,
  TrendingUp,
  Edit,
  User,
  Briefcase,
  DollarSign,
  Star,
  Package
} from 'lucide-react';
import Sidebar from '../../components/common/Sidebar';
import Topbar from '../../components/common/Topbar';
import { workers, orders } from '../../data/dummyData';

const WorkerDetails = () => {
  usePageTitle('Worker Details');
  const { id } = useParams();
  const navigate = useNavigate();
  const [worker, setWorker] = useState(null);
  const [assignedOrders, setAssignedOrders] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    // Find worker by ID
    const foundWorker = workers.find((w) => w.id === id);
    if (foundWorker) {
      setWorker(foundWorker);
      
      // Find orders assigned to this worker
      const workerOrders = orders.filter((order) => order.assignedWorker === id);
      setAssignedOrders(workerOrders);
    } else {
      // Redirect if worker not found
      navigate('/owner/add-worker');
    }
  }, [id, navigate]);

  const handleEditWorker = () => {
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
  };

  if (!worker) {
    return (
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Topbar />
          <main className="flex-1 overflow-y-auto p-6">
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">Loading worker details...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="max-w-7xl mx-auto"
          >
            {/* Header with Back Button */}
            <div className="mb-6 flex items-center justify-between">
              <button
                onClick={() => navigate('/owner/add-worker')}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">Back to Workers</span>
              </button>
              
              <motion.button
                onClick={handleEditWorker}
                className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                whileTap={{ scale: 0.95 }}
              >
                <Edit className="w-4 h-4" />
                <span className="font-medium">Edit Worker Information</span>
              </motion.button>
            </div>

            {/* Personal Information Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6"
            >
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Personal Information</h2>
              
              <div className="flex flex-col md:flex-row gap-6">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  {worker.avatar ? (
                    <img
                      src={worker.avatar}
                      alt={worker.name}
                      className="w-32 h-32 rounded-full object-cover border-4 border-orange-100"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center border-4 border-orange-100">
                      <User className="w-16 h-16 text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Worker Details Grid */}
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <User className="w-5 h-5 text-orange-500 mt-1" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Name</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{worker.name}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-orange-500 mt-1" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{worker.email}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-orange-500 mt-1" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Phone</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{worker.phone}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Briefcase className="w-5 h-5 text-orange-500 mt-1" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Specialization</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{worker.specialization}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-orange-500 mt-1" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Join Date</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {new Date(worker.joinDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <DollarSign className="w-5 h-5 text-orange-500 mt-1" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Salary</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">${worker.salary}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Award className="w-5 h-5 text-orange-500 mt-1" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                          worker.status === 'active'
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
                            : worker.status === 'on-leave'
                            ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                        }`}
                      >
                        {worker.status}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Star className="w-5 h-5 text-orange-500 mt-1" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Rating</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{worker.rating} / 5.0</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Statistics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <Package className="w-8 h-8 text-blue-500 dark:text-blue-400" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Assigned Orders</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{worker.assignedOrders}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 dark:bg-green-900/30 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <Award className="w-8 h-8 text-green-500 dark:text-green-400" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Completed Orders</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{worker.completedOrders}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-orange-50 dark:bg-orange-900/30 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="w-8 h-8 text-orange-500 dark:text-orange-400" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Performance</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{worker.performance}%</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Performance Meter Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6"
              data-testid="performance-meter"
            >
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Performance Metrics</h2>
              
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Overall Performance</span>
                    <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{worker.performance}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${worker.performance}%` }}
                      transition={{ duration: 1, delay: 0.3 }}
                      className={`h-4 rounded-full ${
                        worker.performance >= 90
                          ? 'bg-green-500'
                          : worker.performance >= 70
                          ? 'bg-orange-500'
                          : 'bg-red-500'
                      }`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Completion Rate</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                      {worker.completedOrders > 0
                        ? Math.round((worker.completedOrders / (worker.completedOrders + worker.assignedOrders)) * 100)
                        : 0}%
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Average Rating</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{worker.rating} / 5.0</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Assigned Orders Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
              data-testid="assigned-orders-section"
            >
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Assigned Orders</h2>
              
              {assignedOrders.length > 0 ? (
                <div className="space-y-4">
                  {assignedOrders.map((order) => (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                      data-testid="assigned-order-item"
                    >
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{order.id}</h3>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                order.status === 'ready'
                                  ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
                                  : order.status === 'stitching'
                                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400'
                                  : order.status === 'cutting'
                                  ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400'
                                  : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                              }`}
                            >
                              {order.status}
                            </span>
                          </div>
                          
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                            Customer: <span className="font-medium text-gray-900 dark:text-gray-100">{order.customerName}</span>
                          </p>
                          
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Delivery Date:{' '}
                            <span className="font-medium text-gray-900 dark:text-gray-100">
                              {new Date(order.deliveryDate).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </span>
                          </p>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                          <p className="text-lg font-bold text-gray-900 dark:text-gray-100">${order.totalAmount}</p>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              order.priority === 'high'
                                ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'
                                : order.priority === 'medium'
                                ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                            }`}
                          >
                            {order.priority} priority
                          </span>
                        </div>
                      </div>

                      {/* Order Items */}
                      <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Items:</p>
                        <div className="flex flex-wrap gap-2">
                          {order.items.map((item) => (
                            <span
                              key={item.id}
                              className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs"
                            >
                              {item.type} ({item.quantity})
                            </span>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Package className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">No orders currently assigned to this worker</p>
                </div>
              )}
            </motion.div>
          </motion.div>
        </main>
      </div>

      {/* Edit Modal (UI Only) */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-4">Edit Worker Information</h3>
            <p className="text-gray-600 mb-6">
              Edit functionality will be implemented with backend integration.
            </p>
            <button
              onClick={handleCloseEditModal}
              className="w-full px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              Close
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default WorkerDetails;
