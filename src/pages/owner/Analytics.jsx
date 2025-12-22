import Sidebar from '../../components/common/Sidebar';
import Topbar from '../../components/common/Topbar';
import { motion } from 'framer-motion';
import usePageTitle from '../../hooks/usePageTitle';
import { BarChart3 } from 'lucide-react';
import { orders, workers, inventory, reviews } from '../../data/dummyData';
import {
  OrderStatusDonutChart,
  RevenueTrendChart,
  WorkerPerformanceRadarChart,
  InventoryLowStockChart,
  CustomerRatingsChart,
  WorkerAvailabilityPieChart,
  OrdersLineChart
} from '../../components/charts/DashboardCharts';

const Analytics = () => {
  usePageTitle('Analytics');
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar role="owner" />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        
        <main className="flex-1 overflow-y-auto p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-7xl mx-auto space-y-6"
          >
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <BarChart3 className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Analytics & Reports</h1>
                <p className="text-gray-600 dark:text-gray-400">Comprehensive business insights and performance metrics</p>
              </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Daily Orders Line Chart */}
              <OrdersLineChart />

              {/* Revenue Trend Chart */}
              <RevenueTrendChart />

              {/* Order Status Distribution */}
              <OrderStatusDonutChart orders={orders} />

              {/* Worker Performance */}
              <WorkerPerformanceRadarChart workers={workers} />

              {/* Customer Ratings */}
              <CustomerRatingsChart reviews={reviews} />

              {/* Worker Availability */}
              <WorkerAvailabilityPieChart workers={workers} />

              {/* Inventory Low Stock */}
              <div className="lg:col-span-2">
                <InventoryLowStockChart inventory={inventory} />
              </div>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default Analytics;
