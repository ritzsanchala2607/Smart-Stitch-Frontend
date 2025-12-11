import Sidebar from '../../components/common/Sidebar';
import Topbar from '../../components/common/Topbar';
import { motion } from 'framer-motion';
import { UserCog, Plus } from 'lucide-react';
import { workers } from '../../data/dummyData';

const Workers = () => {
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
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Worker Management</h1>
                <p className="text-gray-600 mt-2">Manage your tailoring team</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-orange-500 text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-orange-600 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Add Worker
              </motion.button>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Worker</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Specialization</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Assigned Orders</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Performance</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {workers.map((worker) => (
                    <tr key={worker.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img src={worker.avatar} alt={worker.name} className="w-10 h-10 rounded-full" />
                          <div>
                            <p className="font-semibold text-gray-900">{worker.name}</p>
                            <p className="text-sm text-gray-600">{worker.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-900">{worker.specialization}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          worker.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {worker.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-900">{worker.assignedOrders}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-green-500 rounded-full"
                              style={{ width: `${worker.performance}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-600">{worker.performance}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button className="text-orange-600 hover:text-orange-700 font-medium text-sm">
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default Workers;
