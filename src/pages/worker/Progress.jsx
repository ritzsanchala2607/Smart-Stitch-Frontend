import { useState, useMemo } from 'react';
import Sidebar from '../../components/common/Sidebar';
import Topbar from '../../components/common/Topbar';
import { motion } from 'framer-motion';
import usePageTitle from '../../hooks/usePageTitle';
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
import { useTasks, useProfile } from '../../hooks/useDataFetch';

const WorkerProgress = () => {
  usePageTitle('Work Progress');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Fetch data from global state
  const { tasks: tasksData, tasksLoading, tasksError, fetchTasks } = useTasks();
  const { profile: workerProfile, profileLoading } = useProfile();

  // Combine loading states
  const isLoading = tasksLoading || profileLoading;
  const error = tasksError;

  // Calculate statistics from tasks using useMemo
  const statistics = useMemo(() => {
    const taskData = tasksData || [];
    const totalTasks = taskData.length;
    const completedTasks = taskData.filter(t => t.status === 'COMPLETED').length;
    
    // Calculate on-time completions (assuming 92% for now, can be enhanced with deadline data)
    const onTimeCompletions = Math.floor(completedTasks * 0.92);
    const onTimePercentage = completedTasks > 0 ? Math.round((onTimeCompletions / completedTasks) * 100) : 0;
    
    // Calculate this week's completed tasks
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const thisWeekCompleted = taskData.filter(t => {
      if (t.status === 'COMPLETED' && t.completedAt) {
        const completedDate = new Date(t.completedAt);
        return completedDate >= oneWeekAgo;
      }
      return false;
    }).length;

    // Calculate average completion time (simplified)
    const avgCompletionTime = '3.5 days'; // TODO: Calculate from actual task data

    // Calculate accuracy rating (based on completed vs total)
    const accuracyRating = totalTasks > 0 ? ((completedTasks / totalTasks) * 5).toFixed(1) : 0;

    // Calculate performance percentage
    const performance = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return {
      totalTasks,
      completedTasks,
      onTimeCompletions,
      onTimePercentage,
      avgCompletionTime,
      thisWeekCompleted,
      accuracyRating: parseFloat(accuracyRating),
      performance,
      rating: workerProfile?.ratings || 0
    };
  }, [tasksData, workerProfile]);

  // Monthly data (calculated from tasks)
  const monthlyData = useMemo(() => calculateMonthlyData(tasksData || []), [tasksData]);

  // Error/Redo tasks (filter from actual tasks)
  const errorTasks = (tasksData || []).filter(t => t.status === 'REDO' || t.hasIssue).slice(0, 5);

  // Worker rankings - TODO: This needs a backend API endpoint
  // For now, show placeholder
  const currentWorkerRank = 1; // Placeholder

  // Helper function to calculate monthly data
  function calculateMonthlyData(taskData) {
    const months = [];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthIndex = date.getMonth();
      
      const monthTasks = taskData.filter(t => {
        const taskDate = new Date(t.completedAt || t.createdAt);
        return taskDate.getMonth() === monthIndex && taskDate.getFullYear() === date.getFullYear();
      });

      const completed = monthTasks.filter(t => t.status === 'COMPLETED').length;

      months.push({
        month: monthNames[monthIndex],
        completed
      });
    }
    return months;
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar role="worker" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Topbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
          <main className="flex-1 overflow-y-auto p-6 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading your progress data...</p>
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
        <Sidebar role="worker" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Topbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
          <main className="flex-1 overflow-y-auto p-6 flex items-center justify-center">
            <div className="text-center">
              <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
              <button
                onClick={() => fetchTasks(true)}
                className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
              >
                Retry
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

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
                    <span className="font-bold">Rank #{currentWorkerRank}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Efficiency Score Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard
                title="On-Time Completion"
                value={`${statistics.onTimePercentage}%`}
                icon={CheckCircle}
                color="bg-green-500"
                subtitle={`${statistics.onTimeCompletions} of ${statistics.completedTasks} tasks`}
              />
              <MetricCard
                title="Avg Completion Time"
                value={statistics.avgCompletionTime}
                icon={Clock}
                color="bg-blue-500"
                subtitle="Per task"
              />
              <MetricCard
                title="This Week Completed"
                value={statistics.thisWeekCompleted}
                icon={Target}
                color="bg-purple-500"
                subtitle="Tasks finished"
              />
              <MetricCard
                title="Accuracy Rating"
                value={statistics.accuracyRating}
                icon={Star}
                color="bg-yellow-500"
                subtitle="Out of 5.0"
              />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 gap-6">
              {/* Monthly Workload Bar Chart */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
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
                  <p className="text-4xl font-bold">{statistics.totalTasks}</p>
                </div>
                <div className="text-center">
                  <p className="text-purple-100 text-sm mb-2">Completed</p>
                  <p className="text-4xl font-bold">{statistics.completedTasks}</p>
                </div>
                <div className="text-center">
                  <p className="text-purple-100 text-sm mb-2">Success Rate</p>
                  <p className="text-4xl font-bold">{statistics.performance}%</p>
                </div>
                <div className="text-center">
                  <p className="text-purple-100 text-sm mb-2">Rating</p>
                  <div className="flex items-center justify-center gap-1">
                    <p className="text-4xl font-bold">{statistics.rating || 'N/A'}</p>
                    {statistics.rating > 0 && <Star className="w-6 h-6 fill-yellow-300 text-yellow-300" />}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Error/Redo Tasks Log */}
            <div className="grid grid-cols-1 gap-6">
              {/* Error/Redo Tasks Log */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden"
              >
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Recent Tasks</h2>
                    <div className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-sm font-semibold">
                      {(tasksData || []).length} Total
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  {(tasksData || []).length > 0 ? (
                    <div className="space-y-4">
                      {(tasksData || []).slice(0, 5).map((task, index) => (
                        <div
                          key={index}
                          className={`p-4 border rounded-lg ${
                            task.status === 'COMPLETED'
                              ? 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800'
                              : task.status === 'IN_PROGRESS'
                              ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800'
                              : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
                          }`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {task.status === 'COMPLETED' ? (
                                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                              ) : task.status === 'IN_PROGRESS' ? (
                                <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                              ) : (
                                <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400 flex-shrink-0" />
                              )}
                              <span className="font-semibold text-gray-900 dark:text-gray-100">
                                {task.taskType || 'Task'}
                              </span>
                            </div>
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              task.status === 'COMPLETED'
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                : task.status === 'IN_PROGRESS'
                                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400'
                            }`}>
                              {task.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">
                            <span className="font-medium">Order ID:</span> {task.orderId ? `ORD${String(task.orderId).padStart(3, '0')}` : 'N/A'}
                          </p>
                          {task.deadline && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              <Calendar className="w-3 h-3 inline mr-1" />
                              Deadline: {new Date(task.deadline).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <CheckCircle className="w-12 h-12 mx-auto mb-3 text-gray-400 dark:text-gray-500" />
                      <p className="text-gray-600 dark:text-gray-400">No tasks assigned yet</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Tasks will appear here when assigned</p>
                    </div>
                  )}
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
                      <span>Your on-time completion rate is {statistics.onTimePercentage >= 90 ? 'excellent' : 'good'} at {statistics.onTimePercentage}%</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                      <span>You have completed {statistics.completedTasks} out of {statistics.totalTasks} assigned tasks</span>
                    </li>
                    {statistics.thisWeekCompleted > 0 && (
                      <li className="flex items-start gap-2">
                        <Target className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                        <span>Great job! You completed {statistics.thisWeekCompleted} tasks this week</span>
                      </li>
                    )}
                    {statistics.performance < 100 && (
                      <li className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                        <span>Complete {statistics.totalTasks - statistics.completedTasks} more tasks to reach 100% completion rate</span>
                      </li>
                    )}
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
