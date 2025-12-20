import { motion } from 'framer-motion';
import { TrendingUp, PieChart, BarChart3, Activity } from 'lucide-react';

// Order Status Distribution - Donut Chart
export const OrderStatusDonutChart = ({ orders }) => {
  const statusCounts = {
    pending: orders.filter(o => o.status === 'pending').length,
    cutting: orders.filter(o => o.status === 'cutting').length,
    stitching: orders.filter(o => o.status === 'stitching').length,
    fitting: orders.filter(o => o.status === 'fitting').length,
    ready: orders.filter(o => o.status === 'ready').length
  };

  const total = Object.values(statusCounts).reduce((a, b) => a + b, 0);
  const colors = {
    pending: '#f59e0b',
    cutting: '#8b5cf6',
    stitching: '#3b82f6',
    fitting: '#06b6d4',
    ready: '#10b981'
  };

  let currentAngle = 0;
  const segments = Object.entries(statusCounts).map(([status, count]) => {
    const percentage = (count / total) * 100;
    const angle = (percentage / 100) * 360;
    const segment = {
      status,
      count,
      percentage: percentage.toFixed(1),
      startAngle: currentAngle,
      endAngle: currentAngle + angle,
      color: colors[status]
    };
    currentAngle += angle;
    return segment;
  });

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
    >
      <div className="flex items-center gap-2 mb-4">
        <PieChart className="w-5 h-5 text-orange-500 dark:text-orange-400" />
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Order Status Distribution</h2>
      </div>
      
      <div className="flex items-center justify-center gap-8">
        {/* Donut Chart */}
        <div className="relative w-48 h-48">
          <svg viewBox="0 0 100 100" className="transform -rotate-90">
            {segments.map((segment, index) => {
              const radius = 40;
              const innerRadius = 25;
              const startAngle = (segment.startAngle * Math.PI) / 180;
              const endAngle = (segment.endAngle * Math.PI) / 180;
              
              const x1 = 50 + radius * Math.cos(startAngle);
              const y1 = 50 + radius * Math.sin(startAngle);
              const x2 = 50 + radius * Math.cos(endAngle);
              const y2 = 50 + radius * Math.sin(endAngle);
              
              const x3 = 50 + innerRadius * Math.cos(endAngle);
              const y3 = 50 + innerRadius * Math.sin(endAngle);
              const x4 = 50 + innerRadius * Math.cos(startAngle);
              const y4 = 50 + innerRadius * Math.sin(startAngle);
              
              const largeArc = segment.endAngle - segment.startAngle > 180 ? 1 : 0;
              
              const pathData = [
                `M ${x1} ${y1}`,
                `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`,
                `L ${x3} ${y3}`,
                `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4}`,
                'Z'
              ].join(' ');
              
              return (
                <path
                  key={index}
                  d={pathData}
                  fill={segment.color}
                  className="hover:opacity-80 transition-opacity cursor-pointer"
                />
              );
            })}
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{total}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Total</p>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="space-y-2">
          {segments.map((segment, index) => (
            <div key={index} className="flex items-center gap-3">
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: segment.color }}
              />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 capitalize">{segment.status}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{segment.count} orders ({segment.percentage}%)</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

// Revenue Trend - Area Chart
export const RevenueTrendChart = () => {
  const monthlyData = [
    { month: 'Jan', revenue: 45000, expense: 30000 },
    { month: 'Feb', revenue: 52000, expense: 32000 },
    { month: 'Mar', revenue: 48000, expense: 31000 },
    { month: 'Apr', revenue: 61000, expense: 35000 },
    { month: 'May', revenue: 55000, expense: 33000 },
    { month: 'Jun', revenue: 67000, expense: 38000 }
  ];

  const maxRevenue = Math.max(...monthlyData.map(d => d.revenue));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-orange-500 dark:text-orange-400" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Revenue Trend</h2>
        </div>
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-gray-600 dark:text-gray-400">Revenue</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-gray-600 dark:text-gray-400">Expense</span>
          </div>
        </div>
      </div>

      <div className="relative h-64">
        {/* Grid lines */}
        <div className="absolute inset-0 flex flex-col justify-between">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="border-t border-gray-100"></div>
          ))}
        </div>

        {/* Bars */}
        <div className="relative h-full flex items-end justify-between gap-2 px-4">
          {monthlyData.map((data, index) => {
            const revenueHeight = (data.revenue / maxRevenue) * 100;
            const expenseHeight = (data.expense / maxRevenue) * 100;
            
            return (
              <div key={index} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex gap-1 items-end" style={{ height: '200px' }}>
                  <div className="flex-1 relative group">
                    <div
                      className="bg-green-500 rounded-t hover:bg-green-600 transition-colors"
                      style={{ height: `${revenueHeight}%` }}
                    >
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        ${data.revenue.toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 relative group">
                    <div
                      className="bg-red-500 rounded-t hover:bg-red-600 transition-colors"
                      style={{ height: `${expenseHeight}%` }}
                    >
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        ${data.expense.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{data.month}</span>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};

// Worker Performance - Radar Chart
export const WorkerPerformanceRadarChart = ({ workers }) => {
  const topWorkers = workers.slice(0, 5);
  const maxPerformance = 100;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
    >
      <div className="flex items-center gap-2 mb-4">
        <Activity className="w-5 h-5 text-orange-500 dark:text-orange-400" />
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Worker Performance</h2>
      </div>

      <div className="space-y-4">
        {topWorkers.map((worker, index) => {
          const performance = worker.performance || 0;
          const rating = worker.rating || 0;
          const completionRate = worker.completedOrders > 0 
            ? Math.min((worker.completedOrders / (worker.completedOrders + worker.assignedOrders)) * 100, 100)
            : 0;

          return (
            <div key={worker.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={worker.avatar}
                    alt={worker.name}
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100 text-sm">{worker.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{worker.specialization}</p>
                  </div>
                </div>
                <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{performance}%</span>
              </div>

              {/* Performance Bars */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-600 dark:text-gray-400">Performance</span>
                    <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">{performance}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all"
                      style={{ width: `${performance}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-600 dark:text-gray-400">Rating</span>
                    <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">{rating}/5</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-yellow-500 h-2 rounded-full transition-all"
                      style={{ width: `${(rating / 5) * 100}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-600 dark:text-gray-400">Completion</span>
                    <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">{completionRate.toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all"
                      style={{ width: `${completionRate}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};

// Inventory Low-Stock Chart - Horizontal Bar
export const InventoryLowStockChart = ({ inventory }) => {
  const lowStockItems = inventory
    .filter(item => item.quantity <= item.minStock)
    .slice(0, 5);

  const maxQuantity = Math.max(...lowStockItems.map(item => item.minStock));

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
    >
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="w-5 h-5 text-orange-500 dark:text-orange-400" />
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Low Stock Alert</h2>
      </div>

      <div className="space-y-4">
        {lowStockItems.map((item, index) => {
          const percentage = (item.quantity / item.minStock) * 100;
          const isVeryLow = percentage < 30;
          const isCritical = percentage < 10;

          return (
            <div key={item.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{item.name}</span>
                <span className={`text-sm font-bold ${
                  isCritical ? 'text-red-600 dark:text-red-400' :
                  isVeryLow ? 'text-orange-600 dark:text-orange-400' :
                  'text-yellow-600 dark:text-yellow-400'
                }`}>
                  {item.quantity} / {item.minStock} {item.unit}
                </span>
              </div>
              <div className="relative">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      isCritical ? 'bg-red-500' :
                      isVeryLow ? 'bg-orange-500' :
                      'bg-yellow-500'
                    }`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  />
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    {percentage.toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {lowStockItems.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <p className="text-sm">All items are well stocked!</p>
        </div>
      )}
    </motion.div>
  );
};

// Customer Ratings Distribution - Bar Chart
export const CustomerRatingsChart = ({ reviews }) => {
  const ratingCounts = {
    5: reviews.filter(r => r.rating === 5).length,
    4: reviews.filter(r => r.rating === 4).length,
    3: reviews.filter(r => r.rating === 3).length,
    2: reviews.filter(r => r.rating === 2).length,
    1: reviews.filter(r => r.rating === 1).length
  };

  const maxCount = Math.max(...Object.values(ratingCounts));
  const totalReviews = Object.values(ratingCounts).reduce((a, b) => a + b, 0);
  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-orange-500 dark:text-orange-400" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Customer Ratings</h2>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">{avgRating}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{totalReviews} reviews</p>
        </div>
      </div>

      <div className="space-y-3">
        {[5, 4, 3, 2, 1].map((rating) => {
          const count = ratingCounts[rating];
          const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;

          return (
            <div key={rating} className="flex items-center gap-3">
              <div className="flex items-center gap-1 w-16">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{rating}</span>
                <svg className="w-4 h-4 text-yellow-500 fill-yellow-500" viewBox="0 0 20 20">
                  <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                </svg>
              </div>
              <div className="flex-1">
                <div className="relative">
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-yellow-500 h-full rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400 w-20 text-right">
                {count} ({percentage.toFixed(0)}%)
              </span>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};

// Worker Availability Pie Chart
export const WorkerAvailabilityPieChart = ({ workers }) => {
  const available = workers.filter(w => w.status === 'active' && w.assignedOrders < 5).length;
  const busy = workers.filter(w => w.status === 'active' && w.assignedOrders >= 5).length;
  const onLeave = workers.filter(w => w.status === 'on-leave').length;
  const inactive = workers.filter(w => w.status === 'inactive').length;

  const total = workers.length;
  const data = [
    { label: 'Available', count: available, color: '#10b981', percentage: (available / total) * 100 },
    { label: 'Busy', count: busy, color: '#f59e0b', percentage: (busy / total) * 100 },
    { label: 'On Leave', count: onLeave, color: '#6b7280', percentage: (onLeave / total) * 100 },
    { label: 'Inactive', count: inactive, color: '#ef4444', percentage: (inactive / total) * 100 }
  ].filter(d => d.count > 0);

  let currentAngle = 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
    >
      <div className="flex items-center gap-2 mb-4">
        <PieChart className="w-5 h-5 text-orange-500 dark:text-orange-400" />
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Worker Availability</h2>
      </div>

      <div className="flex items-center justify-center gap-8">
        {/* Pie Chart */}
        <div className="relative w-48 h-48">
          <svg viewBox="0 0 100 100" className="transform -rotate-90 w-full h-full">
            {data.map((segment, index) => {
              const angle = (segment.percentage / 100) * 360;
              const startAngle = (currentAngle * Math.PI) / 180;
              const endAngle = ((currentAngle + angle) * Math.PI) / 180;
              
              const x1 = 50 + 45 * Math.cos(startAngle);
              const y1 = 50 + 45 * Math.sin(startAngle);
              const x2 = 50 + 45 * Math.cos(endAngle);
              const y2 = 50 + 45 * Math.sin(endAngle);
              
              const largeArc = angle > 180 ? 1 : 0;
              
              const pathData = [
                `M 50 50`,
                `L ${x1} ${y1}`,
                `A 45 45 0 ${largeArc} 1 ${x2} ${y2}`,
                'Z'
              ].join(' ');
              
              currentAngle += angle;
              
              return (
                <path
                  key={index}
                  d={pathData}
                  fill={segment.color}
                  className="hover:opacity-80 transition-opacity cursor-pointer"
                />
              );
            })}
          </svg>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center bg-white dark:bg-gray-800 rounded-full w-20 h-20 flex flex-col items-center justify-center shadow-sm">
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{total}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Workers</p>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="space-y-2">
          {data.map((segment, index) => (
            <div key={index} className="flex items-center gap-3">
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: segment.color }}
              />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{segment.label}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{segment.count} ({segment.percentage.toFixed(0)}%)</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

// Daily/Weekly Orders Line Chart
export const OrdersLineChart = () => {
  const dailyData = [
    { day: 'Mon', orders: 12 },
    { day: 'Tue', orders: 15 },
    { day: 'Wed', orders: 18 },
    { day: 'Thu', orders: 14 },
    { day: 'Fri', orders: 20 },
    { day: 'Sat', orders: 17 },
    { day: 'Sun', orders: 22 }
  ];

  const maxOrders = Math.max(...dailyData.map(d => d.orders));
  const minOrders = Math.min(...dailyData.map(d => d.orders));
  const range = maxOrders - minOrders;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
    >
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp className="w-5 h-5 text-orange-500 dark:text-orange-400" />
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Daily Orders Trend</h2>
      </div>

      <div className="relative h-64">
        <svg className="w-full h-full" viewBox="0 0 700 250">
          {/* Grid lines */}
          {[0, 1, 2, 3, 4].map((i) => (
            <line
              key={i}
              x1="50"
              y1={50 + i * 40}
              x2="650"
              y2={50 + i * 40}
              stroke="#e5e7eb"
              strokeWidth="1"
            />
          ))}

          {/* Line path */}
          <path
            d={dailyData.map((d, i) => {
              const x = 50 + (i * 600) / (dailyData.length - 1);
              const y = 210 - ((d.orders - minOrders) / range) * 160;
              return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
            }).join(' ')}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Area fill */}
          <path
            d={[
              ...dailyData.map((d, i) => {
                const x = 50 + (i * 600) / (dailyData.length - 1);
                const y = 210 - ((d.orders - minOrders) / range) * 160;
                return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
              }),
              `L 650 210`,
              `L 50 210`,
              'Z'
            ].join(' ')}
            fill="url(#gradient)"
            opacity="0.2"
          />

          {/* Data points */}
          {dailyData.map((d, i) => {
            const x = 50 + (i * 600) / (dailyData.length - 1);
            const y = 210 - ((d.orders - minOrders) / range) * 160;
            return (
              <g key={i}>
                <circle cx={x} cy={y} r="5" fill="#3b82f6" />
                <text x={x} y={y - 15} textAnchor="middle" className="text-xs font-semibold" fill="#374151">
                  {d.orders}
                </text>
                <text x={x} y="235" textAnchor="middle" className="text-xs" fill="#6b7280">
                  {d.day}
                </text>
              </g>
            );
          })}

          {/* Gradient definition */}
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </motion.div>
  );
};
