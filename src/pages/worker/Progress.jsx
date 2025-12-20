import { useState } from 'react';
import Sidebar from '../../components/common/Sidebar';
import Topbar from '../../components/common/Topbar';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  Award,
  Clock,
  CheckCircle,
  AlertTriangle,
  Target,
  Calendar,
  BarChart3,
  Trophy,
  Star
} from 'lucide-react';
import { orders, workers, dashboardStats } from '../../data/dummyData';

const WorkerProgress = () => {
  // Mock worker ID
  const currentWorkerId = 'WORK001';
  const currentWorker = workers.find(w => w.id === currentWorkerId);
  const workerTasks = orders.filter(o => o.assignedWorker === currentWorkerId);

  // Calculate metrics
  const completedTasks = workerTasks.filter(o => o.status === 'ready').length;
  const totalTasks = workerTasks.length;
  const onTimeCompletions = Math.floor(completedTasks * 0.92); // 92% on-time rate
  const onTimePercentage = totalTasks > 0 ? Math.round((onTimeCompletions / completedTasks) * 100) : 0;
  const avgCompletionTime = '3.5 days';
  const thisWeekCompleted = 8;
  const accuracyRating = 4.8;

  // Weekly data (last 4 weeks)
  const weeklyData = [
    { week: 'Week 1', assigned: 12, completed: 10 },
    { week: 'Week 2', assigned: 15, completed: 14 },
    { week: 'Week 3', assigned: 13, completed: 12 },
    { week: 'Week 4', assigned: 14, completed: 13 }
  ];

  // Monthly data (last 6 months)
  const monthlyData = [
    { month: 'Jul', completed: 42 },
    { month: 'Aug', completed: 48 },
    { month: 'Sep', completed: 45 },
    { month: 'Oct', completed: 52 },
    { month: 'Nov', completed: 49 },
    { month: 'Dec', completed: 38 }
  ];

  // Error/Redo tasks
  const errorTasks = [
    {
      id: 'ORD015',
      customer: 'John Smith',
      issue: 'Measurement mismatch',
      date: '2024-01-10',
      status: 'Fixed'
    },
    {
      id: 'ORD023',
      customer: 'Sarah Johnson',
      issue: 'Wrong fabric used',
      date: '2024-01-05',
      status: 'Fixed'
    },
    {
      id: 'ORD031',
      customer: 'Mike Brown',
      issue: 'Stitching quality issue',
      date: '2023-12-28',
      status: 'Fixed'
    }
  ];

  // Worker rankings
  const workerRankings = workers
    .filter(w => w.status === 'active')
    .sort((a, b) => b.performance - a.performance)
    .map((worker, index) => ({
      ...worker,
      rank: index + 1
    }));

  const currentWorkerRank = workerRankings.find(w => w.id === currentWorkerId);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar role="worker" />
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
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Work Progress</h1>
                  <p className="text-gray-600 dark:text-gray-400">Track your performance and analytics</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg shadow-md">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-5 h-5" />
                    <span className="font-bold">Rank #{currentWorkerRank?.rank}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Efficiency Score Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard
                title="On-Time Completion"
                value={`${onTimePercentage}%`}
                icon={CheckCircle}
                color="bg-green-500"
                subtitle={`${onTimeCompletions} of ${completedTasks} tasks`}
              />
              <MetricCard
                title="Avg Completion Time"
                value={avgCompletionTime}
                icon={Clock}
                color="bg-blue-500"
                subtitle="Per task"
              />
              <MetricCard
                title="This Week Completed"
                value={thisWeekCompleted}
                icon={Target}
                color="bg-purple-500"
                subtitle="Tasks finished"
              />
              <MetricCard
                title="Accuracy Rating"
                value={accuracyRating}
                icon={Star}
                color="bg-yellow-500"
                subtitle="Out of 5.0"
              />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Task Completion Timeline Chart */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
              >
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">Weekly Task Timeline</h2>
                <WeeklyTimelineChart data={weeklyData} />
              </motion.div>

              {/* Monthly Workload Bar Chart */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
              >
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">Monthly Workload</h2>
                <MonthlyBarChart data={monthlyData} />
              </motion.div>
            </div>

            {/* Performance Overview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-md p-6 text-white"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Overall Performance</h2>
                <Award className="w-8 h-8" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <p className="text-purple-100 text-sm mb-2">Total Tasks</p>
                  <p className="text-4xl font-bold">{totalTasks}</p>
                </div>
                <div className="text-center">
                  <p className="text-purple-100 text-sm mb-2">Completed</p>
                  <p className="text-4xl font-bold">{completedTasks}</p>
                </div>
                <div className="text-center">
                  <p className="text-purple-100 text-sm mb-2">Success Rate</p>
                  <p className="text-4xl font-bold">{currentWorker?.performance}%</p>
                </div>
                <div className="text-center">
                  <p className="text-purple-100 text-sm mb-2">Rating</p>
                  <div className="flex items-center justify-center gap-1">
                    <p className="text-4xl font-bold">{currentWorker?.rating}</p>
                    <Star className="w-6 h-6 fill-yellow-300 text-yellow-300" />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Error/Redo Tasks Log & Worker Ranking */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Error/Redo Tasks Log */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden"
              >
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Error/Redo Tasks</h2>
                    <div className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full text-sm font-semibold">
                      {errorTasks.length} Issues
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  {errorTasks.length > 0 ? (
                    <div className="space-y-4">
                      {errorTasks.map((error, index) => (
                        <div
                          key={index}
                          className="p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                              <span className="font-semibold text-gray-900 dark:text-gray-100">{error.id}</span>
                            </div>
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              error.status === 'Fixed' 
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' 
                                : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                            }`}>
                              {error.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">
                            <span className="font-medium">Customer:</span> {error.customer}
                          </p>
                          <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">
                            <span className="font-medium">Issue:</span> {error.issue}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            <Calendar className="w-3 h-3 inline mr-1" />
                            {error.date}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-500 dark:text-green-400" />
                      <p className="text-gray-600 dark:text-gray-400">No errors or redo tasks!</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Keep up the great work!</p>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Worker Ranking */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden"
              >
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Worker Rankings</h2>
                    <Trophy className="w-6 h-6 text-yellow-500 dark:text-yellow-400" />
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Based on completion rate & quality</p>
                </div>
                <div className="p-6">
                  <div className="space-y-3">
                    {workerRankings.map((worker, index) => {
                      const isCurrentWorker = worker.id === currentWorkerId;
                      return (
                        <div
                          key={worker.id}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            isCurrentWorker
                              ? 'bg-purple-50 dark:bg-purple-900/30 border-purple-500 dark:border-purple-600 shadow-md'
                              : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            {/* Rank Badge */}
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                              index === 0 ? 'bg-yellow-400 text-yellow-900' :
                              index === 1 ? 'bg-gray-300 text-gray-700' :
                              index === 2 ? 'bg-orange-400 text-orange-900' :
                              'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
                            }`}>
                              {worker.rank}
                            </div>

                            {/* Worker Info */}
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`font-semibold ${
                                  isCurrentWorker ? 'text-purple-900 dark:text-purple-400' : 'text-gray-900 dark:text-gray-100'
                                }`}>
                                  {worker.name}
                                </span>
                                {isCurrentWorker && (
                                  <span className="px-2 py-0.5 bg-purple-500 text-white text-xs font-semibold rounded-full">
                                    You
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-gray-600 dark:text-gray-400">{worker.specialization}</p>
                            </div>

                            {/* Performance Score */}
                            <div className="text-right">
                              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{worker.performance}%</p>
                              <div className="flex items-center gap-1 justify-end">
                                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                <span className="text-sm text-gray-600 dark:text-gray-400">{worker.rating}</span>
                              </div>
                            </div>
                          </div>

                          {/* Progress Bar */}
                          <div className="mt-3">
                            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full transition-all ${
                                  isCurrentWorker ? 'bg-purple-500' : 'bg-blue-500'
                                }`}
                                style={{ width: `${worker.performance}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Insights & Tips */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-6"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-500 rounded-lg">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">Performance Insights</h3>
                  <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                      <span>Your on-time completion rate is excellent at {onTimePercentage}%</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                      <span>You're ranked #{currentWorkerRank?.rank} among all active workers</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                      <span>Focus on reducing errors to improve your accuracy rating</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Target className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                      <span>Complete {15 - thisWeekCompleted} more tasks this week to reach your target</span>
                    </li>
                  </ul>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </main>
      </div>
    </div>
  );
};

// Metric Card Component
const MetricCard = ({ title, value, icon: Icon, color, subtitle }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -5 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 cursor-pointer"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
      <p className="text-gray-500 dark:text-gray-400 text-sm">{title}</p>
      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-2">{value}</p>
      {subtitle && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>}
    </motion.div>
  );
};

// Weekly Timeline Chart Component
const WeeklyTimelineChart = ({ data }) => {
  const maxValue = Math.max(...data.flatMap(d => [d.assigned, d.completed]));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end gap-4 text-sm mb-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <span className="text-gray-600 dark:text-gray-400">Assigned</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="text-gray-600 dark:text-gray-400">Completed</span>
        </div>
      </div>

      {/* Line Chart */}
      <div className="relative h-64">
        <svg className="w-full h-full">
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map((percent) => (
            <line
              key={percent}
              x1="0"
              y1={`${percent}%`}
              x2="100%"
              y2={`${percent}%`}
              stroke="#e5e7eb"
              strokeWidth="1"
            />
          ))}

          {/* Assigned line */}
          <polyline
            points={data.map((d, i) => {
              const x = (i / (data.length - 1)) * 100;
              const y = 100 - (d.assigned / maxValue) * 90;
              return `${x}%,${y}%`;
            }).join(' ')}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Completed line */}
          <polyline
            points={data.map((d, i) => {
              const x = (i / (data.length - 1)) * 100;
              const y = 100 - (d.completed / maxValue) * 90;
              return `${x}%,${y}%`;
            }).join(' ')}
            fill="none"
            stroke="#10b981"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data points - Assigned */}
          {data.map((d, i) => {
            const x = (i / (data.length - 1)) * 100;
            const y = 100 - (d.assigned / maxValue) * 90;
            return (
              <circle
                key={`assigned-${i}`}
                cx={`${x}%`}
                cy={`${y}%`}
                r="5"
                fill="#3b82f6"
                stroke="white"
                strokeWidth="2"
              />
            );
          })}

          {/* Data points - Completed */}
          {data.map((d, i) => {
            const x = (i / (data.length - 1)) * 100;
            const y = 100 - (d.completed / maxValue) * 90;
            return (
              <circle
                key={`completed-${i}`}
                cx={`${x}%`}
                cy={`${y}%`}
                r="5"
                fill="#10b981"
                stroke="white"
                strokeWidth="2"
              />
            );
          })}
        </svg>

        {/* X-axis labels */}
        <div className="flex justify-between mt-2">
          {data.map((d, i) => (
            <span key={i} className="text-xs text-gray-600 dark:text-gray-400">{d.week}</span>
          ))}
        </div>
      </div>
    </div>
  );
};

// Monthly Bar Chart Component
const MonthlyBarChart = ({ data }) => {
  const maxValue = Math.max(...data.map(d => d.completed));

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between h-64 gap-3">
        {data.map((month, index) => {
          const height = (month.completed / maxValue) * 100;
          return (
            <div key={index} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full flex flex-col items-center h-56">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">{month.completed}</span>
                <div className="w-full flex items-end h-full">
                  <div
                    className="w-full bg-gradient-to-t from-purple-500 to-purple-400 rounded-t-lg transition-all hover:from-purple-600 hover:to-purple-500 cursor-pointer"
                    style={{ height: `${height}%` }}
                  ></div>
                </div>
              </div>
              <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">{month.month}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WorkerProgress;
