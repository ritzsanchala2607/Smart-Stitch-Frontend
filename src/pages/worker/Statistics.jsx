import { useState } from 'react';
import Sidebar from '../../components/common/Sidebar';
import Topbar from '../../components/common/Topbar';
import { motion } from 'framer-motion';
import usePageTitle from '../../hooks/usePageTitle';
import {
  BarChart3,
  PieChart,
  Clock,
  Scissors,
  Package,
  TrendingUp,
  Calendar,
  Activity
} from 'lucide-react';
import { orders, inventory } from '../../data/dummyData';

const WorkerStatistics = () => {
  usePageTitle('Statistics');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // Mock worker ID
  const currentWorkerId = 'WORK001';
  const workerTasks = orders.filter(o => o.assignedWorker === currentWorkerId);

  // Status distribution
  const statusDistribution = {
    completed: workerTasks.filter(o => o.status === 'ready').length,
    inProgress: workerTasks.filter(o => ['cutting', 'stitching', 'fitting'].includes(o.status)).length,
    pending: workerTasks.filter(o => o.status === 'pending').length
  };

  const totalTasks = statusDistribution.completed + statusDistribution.inProgress + statusDistribution.pending;

  // Calculate percentages
  const completedPercentage = totalTasks > 0 ? Math.round((statusDistribution.completed / totalTasks) * 100) : 0;
  const inProgressPercentage = totalTasks > 0 ? Math.round((statusDistribution.inProgress / totalTasks) * 100) : 0;
  const pendingPercentage = totalTasks > 0 ? Math.round((statusDistribution.pending / totalTasks) * 100) : 0;

  // Productivity heatmap data (last 4 weeks, 7 days each)
  const heatmapData = [
    [3, 5, 4, 6, 5, 2, 1], // Week 1
    [4, 6, 5, 7, 6, 3, 2], // Week 2
    [5, 4, 6, 5, 7, 4, 1], // Week 3
    [6, 5, 4, 8, 6, 3, 2]  // Week 4
  ];

  // Average stitching time per garment
  const stitchingTimes = [
    { garment: 'Formal Shirt', time: 2.5, icon: '👔', color: 'bg-blue-500' },
    { garment: 'Pant', time: 3.0, icon: '👖', color: 'bg-purple-500' },
    { garment: 'Suit', time: 5.0, icon: '🤵', color: 'bg-gray-700' },
    { garment: 'Blouse', time: 3.0, icon: '👚', color: 'bg-pink-500' },
    { garment: 'Kurta', time: 3.5, icon: '🧥', color: 'bg-orange-500' },
    { garment: 'Sherwani', time: 6.0, icon: '👑', color: 'bg-yellow-600' }
  ];

  // Task type analysis
  const taskTypes = [
    { type: 'Stitching', count: 85, color: 'bg-blue-500' },
    { type: 'Alterations', count: 42, color: 'bg-green-500' },
    { type: 'Repairs', count: 18, color: 'bg-orange-500' },
    { type: 'Custom Orders', count: 25, color: 'bg-purple-500' }
  ];

  const maxTaskCount = Math.max(...taskTypes.map(t => t.count));

  // Material usage stats
  const materialUsage = [
    { material: 'Premium Cotton', used: 145, unit: 'meters', available: 150, color: 'bg-blue-500' },
    { material: 'Silk Fabric', used: 65, unit: 'meters', available: 80, color: 'bg-purple-500' },
    { material: 'Thread - Polyester', used: 38, unit: 'spools', available: 25, color: 'bg-green-500' },
    { material: 'Buttons', used: 320, unit: 'pieces', available: 500, color: 'bg-yellow-500' },
    { material: 'Zippers', used: 95, unit: 'pieces', available: 150, color: 'bg-red-500' }
  ];

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar role="worker" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
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
              <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                <BarChart3 className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Statistics</h1>
                <p className="text-gray-600 dark:text-gray-400">Detailed analytics and insights</p>
              </div>
            </div>

            {/* Top Row - Status Distribution & Productivity Heatmap */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Status Distribution Donut Chart */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
              >
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">Status Distribution</h2>
                <div className="flex items-center justify-center">
                  <StatusDonutChart
                    completed={completedPercentage}
                    inProgress={inProgressPercentage}
                    pending={pendingPercentage}
                    total={totalTasks}
                  />
                </div>
                <div className="grid grid-cols-3 gap-4 mt-6">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{statusDistribution.completed}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{completedPercentage}%</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">In Progress</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{statusDistribution.inProgress}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{inProgressPercentage}%</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{statusDistribution.pending}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{pendingPercentage}%</p>
                  </div>
                </div>
              </motion.div>

              {/* Productivity Heatmap */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
              >
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">Productivity Heatmap</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Daily task completion (Last 4 weeks)</p>
                <ProductivityHeatmap data={heatmapData} />
              </motion.div>
            </div>

            {/* Average Stitching Time Per Garment */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Average Stitching Time Per Garment</h2>
                <Clock className="w-6 h-6 text-gray-400 dark:text-gray-500" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {stitchingTimes.map((item, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.02 }}
                    className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 ${item.color} rounded-lg flex items-center justify-center text-2xl`}>
                          {item.icon}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-gray-100">{item.garment}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Average time</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{item.time}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">hours</p>
                    </div>
                    <div className="mt-3 w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${item.color}`}
                        style={{ width: `${(item.time / 6) * 100}%` }}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Task Type Analysis */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Task Type Analysis</h2>
                <Activity className="w-6 h-6 text-gray-400 dark:text-gray-500" />
              </div>
              <div className="space-y-4">
                {taskTypes.map((task, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 ${task.color} rounded`}></div>
                        <span className="font-medium text-gray-900 dark:text-gray-100">{task.type}</span>
                      </div>
                      <span className="text-lg font-bold text-gray-900 dark:text-gray-100">{task.count}</span>
                    </div>
                    <div className="relative w-full bg-gray-200 dark:bg-gray-700 rounded-full h-8 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(task.count / maxTaskCount) * 100}%` }}
                        transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                        className={`h-8 ${task.color} flex items-center justify-end pr-3`}
                      >
                        <span className="text-white text-sm font-semibold">
                          {Math.round((task.count / maxTaskCount) * 100)}%
                        </span>
                      </motion.div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-3">
                  <Package className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">Total Tasks Completed</p>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {taskTypes.reduce((sum, task) => sum + task.count, 0)}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Material Usage Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Material Usage Statistics</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Your consumption vs available inventory</p>
                </div>
                <Scissors className="w-6 h-6 text-gray-400 dark:text-gray-500" />
              </div>
              <div className="space-y-4">
                {materialUsage.map((material, index) => {
                  const usagePercentage = Math.round((material.used / material.available) * 100);
                  const isLow = usagePercentage > 80;
                  
                  return (
                    <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 ${material.color} rounded-full`}></div>
                          <span className="font-semibold text-gray-900 dark:text-gray-100">{material.material}</span>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                            {material.used} / {material.available} {material.unit}
                          </p>
                          {isLow && (
                            <span className="text-xs text-red-600 dark:text-red-400 font-semibold">Low Stock!</span>
                          )}
                        </div>
                      </div>
                      <div className="relative w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3 overflow-hidden">
                        <div
                          className={`h-3 ${material.color} transition-all`}
                          style={{ width: `${usagePercentage}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-600 dark:text-gray-400">Used: {material.used} {material.unit}</span>
                        <span className="text-xs text-gray-600 dark:text-gray-400">{usagePercentage}% consumed</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            {/* Summary Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-md p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <Calendar className="w-8 h-8 opacity-80" />
                  <span className="text-sm font-semibold bg-white/20 px-3 py-1 rounded-full">
                    This Month
                  </span>
                </div>
                <p className="text-4xl font-bold mb-2">38</p>
                <p className="text-blue-100">Tasks Completed</p>
              </div>

              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-md p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <TrendingUp className="w-8 h-8 opacity-80" />
                  <span className="text-sm font-semibold bg-white/20 px-3 py-1 rounded-full">
                    Efficiency
                  </span>
                </div>
                <p className="text-4xl font-bold mb-2">92%</p>
                <p className="text-green-100">Success Rate</p>
              </div>

              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-md p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <Clock className="w-8 h-8 opacity-80" />
                  <span className="text-sm font-semibold bg-white/20 px-3 py-1 rounded-full">
                    Average
                  </span>
                </div>
                <p className="text-4xl font-bold mb-2">3.2</p>
                <p className="text-purple-100">Hours Per Task</p>
              </div>
            </motion.div>
          </motion.div>
        </main>
      </div>
    </div>
  );
};

// Status Donut Chart Component
const StatusDonutChart = ({ completed, inProgress, pending, total }) => {
  const size = 200;
  const strokeWidth = 30;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const completedOffset = 0;
  const inProgressOffset = (completed / 100) * circumference;
  const pendingOffset = ((completed + inProgress) / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
        />
        
        {/* Completed segment */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#10b981"
          strokeWidth={strokeWidth}
          strokeDasharray={`${(completed / 100) * circumference} ${circumference}`}
          strokeDashoffset={0}
          strokeLinecap="round"
        />
        
        {/* In Progress segment */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#3b82f6"
          strokeWidth={strokeWidth}
          strokeDasharray={`${(inProgress / 100) * circumference} ${circumference}`}
          strokeDashoffset={-inProgressOffset}
          strokeLinecap="round"
        />
        
        {/* Pending segment */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#f97316"
          strokeWidth={strokeWidth}
          strokeDasharray={`${(pending / 100) * circumference} ${circumference}`}
          strokeDashoffset={-pendingOffset}
          strokeLinecap="round"
        />
      </svg>
      
      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <p className="text-4xl font-bold text-gray-900 dark:text-gray-100">{total}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">Total Tasks</p>
      </div>
    </div>
  );
};

// Productivity Heatmap Component
const ProductivityHeatmap = ({ data }) => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const maxValue = Math.max(...data.flat());

  const getColor = (value) => {
    const intensity = value / maxValue;
    if (intensity === 0) return 'bg-gray-100';
    if (intensity < 0.25) return 'bg-green-200';
    if (intensity < 0.5) return 'bg-green-300';
    if (intensity < 0.75) return 'bg-green-400';
    return 'bg-green-500';
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
        <span>Less</span>
        <div className="flex gap-1">
          <div className="w-4 h-4 bg-gray-100 rounded"></div>
          <div className="w-4 h-4 bg-green-200 rounded"></div>
          <div className="w-4 h-4 bg-green-300 rounded"></div>
          <div className="w-4 h-4 bg-green-400 rounded"></div>
          <div className="w-4 h-4 bg-green-500 rounded"></div>
        </div>
        <span>More</span>
      </div>
      <div className="space-y-2">
        {data.map((week, weekIndex) => (
          <div key={weekIndex} className="flex items-center gap-2">
            <span className="text-xs text-gray-600 w-16">Week {weekIndex + 1}</span>
            <div className="flex gap-2">
              {week.map((value, dayIndex) => (
                <div
                  key={dayIndex}
                  className={`w-10 h-10 ${getColor(value)} rounded flex items-center justify-center text-xs font-semibold text-gray-700 hover:ring-2 hover:ring-green-600 transition-all cursor-pointer`}
                  title={`${days[dayIndex]}: ${value} tasks`}
                >
                  {value}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-between text-xs text-gray-600 mt-2 pl-16">
        {days.map((day, index) => (
          <span key={index} className="w-10 text-center">{day}</span>
        ))}
      </div>
    </div>
  );
};

export default WorkerStatistics;
