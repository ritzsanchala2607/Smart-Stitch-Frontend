import Sidebar from '../../components/common/Sidebar';
import Topbar from '../../components/common/Topbar';
import { motion } from 'framer-motion';
import { 
  Package, Users, DollarSign, TrendingUp, 
  AlertCircle, CheckCircle, Clock, UserCog 
} from 'lucide-react';
import { dashboardStats, orders, workers } from '../../data/dummyData';

const OwnerDashboard = () => {
  const stats = dashboardStats.owner;

  const recentOrders = orders.slice(0, 5);
  const activeWorkers = workers.filter(w => w.status === 'active');

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar role="owner" />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-7xl mx-auto"
          >
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Owner Dashboard</h1>
              <p className="text-gray-600 mt-2">Welcome back! Here's what's happening today.</p>
            </div>
            
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard 
                title="Total Orders" 
                value={stats.totalOrders} 
                icon={Package}
                color="bg-blue-500"
                trend="+12%"
              />
              <StatCard 
                title="Active Orders" 
                value={stats.activeOrders} 
                icon={Clock}
                color="bg-orange-500"
                trend="+5%"
              />
              <StatCard 
                title="Monthly Revenue" 
                value={`$${stats.monthlyRevenue.toLocaleString()}`} 
                icon={DollarSign}
                color="bg-green-500"
                trend="+18%"
              />
              <StatCard 
                title="Total Customers" 
                value={stats.totalCustomers} 
                icon={Users}
                color="bg-purple-500"
                trend="+8%"
              />
            </div>

            {/* Charts and Tables Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Recent Orders */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-lg shadow-md p-6"
              >
                <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Orders</h2>
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          order.status === 'ready' ? 'bg-green-100' :
                          order.status === 'stitching' ? 'bg-blue-100' :
                          'bg-orange-100'
                        }`}>
                          {order.status === 'ready' ? <CheckCircle className="w-5 h-5 text-green-600" /> :
                           order.status === 'stitching' ? <Clock className="w-5 h-5 text-blue-600" /> :
                           <AlertCircle className="w-5 h-5 text-orange-600" />}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{order.id}</p>
                          <p className="text-sm text-gray-600">{order.customerName}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">${order.totalAmount}</p>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          order.status === 'ready' ? 'bg-green-100 text-green-700' :
                          order.status === 'stitching' ? 'bg-blue-100 text-blue-700' :
                          'bg-orange-100 text-orange-700'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Active Workers */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-lg shadow-md p-6"
              >
                <h2 className="text-xl font-bold text-gray-900 mb-4">Active Workers</h2>
                <div className="space-y-4">
                  {activeWorkers.map((worker) => (
                    <div key={worker.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-4">
                        <img 
                          src={worker.avatar} 
                          alt={worker.name}
                          className="w-10 h-10 rounded-full"
                        />
                        <div>
                          <p className="font-semibold text-gray-900">{worker.name}</p>
                          <p className="text-sm text-gray-600">{worker.specialization}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-900">{worker.assignedOrders} tasks</p>
                        <div className="flex items-center gap-1 mt-1">
                          <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-green-500 rounded-full"
                              style={{ width: `${worker.performance}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-600">{worker.performance}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-lg shadow-md p-6"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <QuickActionButton icon={Package} label="New Order" color="bg-blue-500" />
                <QuickActionButton icon={UserCog} label="Add Worker" color="bg-green-500" />
                <QuickActionButton icon={Users} label="Add Customer" color="bg-purple-500" />
                <QuickActionButton icon={DollarSign} label="Generate Invoice" color="bg-orange-500" />
              </div>
            </motion.div>
          </motion.div>
        </main>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon: Icon, color, trend }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -5 }}
      className="bg-white rounded-lg shadow-md p-6 cursor-pointer"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {trend && (
          <span className="text-sm font-semibold text-green-600">{trend}</span>
        )}
      </div>
      <p className="text-gray-500 text-sm">{title}</p>
      <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
    </motion.div>
  );
};

const QuickActionButton = ({ icon: Icon, label, color }) => {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`${color} text-white rounded-lg p-4 flex flex-col items-center gap-2 hover:shadow-lg transition-shadow`}
    >
      <Icon className="w-6 h-6" />
      <span className="text-sm font-semibold">{label}</span>
    </motion.button>
  );
};

export default OwnerDashboard;
