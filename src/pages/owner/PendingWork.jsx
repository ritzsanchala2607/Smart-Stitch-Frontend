import { useState, useMemo } from 'react';
import Sidebar from '../../components/common/Sidebar';
import Topbar from '../../components/common/Topbar';
import { motion } from 'framer-motion';
import usePageTitle from '../../hooks/usePageTitle';
import { Clock, Eye, ArrowLeft, Users, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useOrders } from '../../hooks/useDataFetch';

const PendingWork = () => {
  usePageTitle('Pending Work');
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Use global state management
  const { orders: globalOrders, ordersLoading, ordersError, fetchOrders } = useOrders();

  // Filter pending orders using useMemo for performance
  const { pendingOrders, ordersByWorker } = useMemo(() => {
    if (!globalOrders || globalOrders.length === 0) {
      return { pendingOrders: [], ordersByWorker: {} };
    }

    // Filter pending orders (not ready, delivered, or completed)
    const pending = globalOrders.filter(order => {
      const status = (order.status || '').toLowerCase();
      return status !== 'ready' && status !== 'delivered' && status !== 'completed';
    });

    // Group by worker
    const workerGroups = {};
    pending.forEach(order => {
      const workerName = order.workerName || 'Unassigned';
      if (!workerGroups[workerName]) {
        workerGroups[workerName] = {
          count: 0,
          orders: []
        };
      }
      workerGroups[workerName].count++;
      workerGroups[workerName].orders.push(order.orderId || order.id);
    });

    return {
      pendingOrders: pending,
      ordersByWorker: workerGroups
    };
  }, [globalOrders]);

  // Remove old state and fetch logic
  // const [pendingOrders, setPendingOrders] = useState([]);
  // const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  // const [ordersError, setOrdersError] = useState(null);
  // const [ordersByWorker, setOrdersByWorker] = useState({});

  // useEffect(() => {
  //   fetchPendingOrders();
  // }, []);

  // const fetchPendingOrders = async () => { ... }

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
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Pending Work</h1>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">Orders that are still in progress</p>
                </div>
              </div>
              
              <button
                onClick={() => fetchOrders(true)}
                disabled={ordersLoading}
                className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${ordersLoading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>

            {/* Worker Workload Summary */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Worker Workload</h2>
              
              {ordersLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                </div>
              ) : ordersError ? (
                <div className="text-center py-8 text-red-600 dark:text-red-400">
                  {ordersError}
                </div>
              ) : Object.keys(ordersByWorker).length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No pending orders assigned to workers
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {Object.entries(ordersByWorker).map(([workerName, data]) => (
                    <div key={workerName} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center gap-3 mb-2">
                        <Users className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">{workerName}</h3>
                      </div>
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{data.count}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Pending orders</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Pending Orders Table */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">All Pending Orders</h2>
              </div>
              
              {ordersLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
                </div>
              ) : ordersError ? (
                <div className="p-12 text-center">
                  <p className="text-red-600 dark:text-red-400 mb-4">{ordersError}</p>
                  <button
                    onClick={() => fetchOrders(true)}
                    className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    Retry
                  </button>
                </div>
              ) : pendingOrders.length === 0 ? (
                <div className="p-12 text-center">
                  <Clock className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">No pending work</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400">Order ID</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400">Customer</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400">Items</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400">Order Date</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400">Delivery Date</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {pendingOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">{order.id}</td>
                          <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{order.customerName}</td>
                          <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                            {order.items.length > 0 
                              ? order.items.map(item => item.itemName || item.itemType || item.type || item).join(', ')
                              : 'N/A'
                            }
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              order.status === 'stitching' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                              order.status === 'cutting' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                              order.status === 'fitting' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' :
                              'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                            }`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{order.orderDate}</td>
                          <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                            {order.deliveryDate}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                            ₹{(order.totalAmount || order.totalPrice || 0).toLocaleString()}
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

export default PendingWork;
