import { useState, useEffect } from 'react';
import Sidebar from '../../components/common/Sidebar';
import Topbar from '../../components/common/Topbar';
import { motion } from 'framer-motion';
import usePageTitle from '../../hooks/usePageTitle';
import { BarChart3, AlertCircle } from 'lucide-react';
import { shopAPI } from '../../services/api';
import {
  OrderStatusDonutChart,
  RevenueTrendChart,
  WorkerPerformanceRadarChart,
  CustomerRatingsChart,
  OrdersLineChart
} from '../../components/charts/DashboardCharts';

const Analytics = () => {
  usePageTitle('Analytics');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // API State
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);

  // Fetch analytics data from API
  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
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
      setError('Authentication error. Please log in again.');
      setIsLoading(false);
      return;
    }

    try {
      const result = await shopAPI.getOwnerAnalytics(token);

      if (result.success) {
        console.log('Analytics data fetched successfully:', result.data);
        setAnalyticsData(result.data);
      } else {
        console.error('Failed to fetch analytics data:', result.error);
        setError(result.error);
      }
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      setError('Failed to load analytics data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar role="owner" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Topbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
          <main className="flex-1 overflow-y-auto p-6">
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">Loading analytics...</p>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar role="owner" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Topbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
          <main className="flex-1 overflow-y-auto p-6">
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
                <button
                  onClick={fetchAnalyticsData}
                  className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                  Retry
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // Extract and map data from API response to match chart expectations
  const dailyOrderTrend = analyticsData?.dailyOrderTrend || [];
  const monthlyRevenueTrend = analyticsData?.monthlyRevenueTrend || [];
  const orderStatusDistribution = analyticsData?.orderStatusDistribution || {};
  const workerPerformance = analyticsData?.workerPerformance || [];
  
  // Map order status distribution to orders array format for donut chart
  const orders = orderStatusDistribution.total ? [
    ...Array(orderStatusDistribution.pending || 0).fill({ status: 'pending' }),
    ...Array(orderStatusDistribution.cutting || 0).fill({ status: 'cutting' }),
    ...Array(orderStatusDistribution.stitching || 0).fill({ status: 'stitching' }),
    ...Array(orderStatusDistribution.fitting || 0).fill({ status: 'fitting' }),
    ...Array(orderStatusDistribution.completed || 0).fill({ status: 'completed' })
  ] : [];

  // Map worker performance data
  const workers = workerPerformance.map(worker => ({
    id: worker.workerId,
    name: worker.workerName,
    specialization: worker.specialty,
    completedTasks: worker.completedTasks,
    totalTasks: worker.totalTasks,
    performance: worker.performancePercentage,
    ratings: worker.averageRating
  }));

  // For now, reviews will be empty as they're not in the current API response
  // This can be enhanced when review data is added to the analytics endpoint
  const reviews = [];

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar role="owner" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        
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
              <OrdersLineChart data={{ dailyOrderTrend }} />

              {/* Revenue Trend Chart */}
              <RevenueTrendChart data={{ monthlyRevenueTrend }} />

              {/* Order Status Distribution */}
              <OrderStatusDonutChart orders={orders} />

              {/* Worker Performance */}
              <WorkerPerformanceRadarChart workers={workers} />

              {/* Customer Ratings - Hidden for now as not in API */}
              {reviews.length > 0 && (
                <div className="lg:col-span-2">
                  <CustomerRatingsChart reviews={reviews} />
                </div>
              )}
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default Analytics;
