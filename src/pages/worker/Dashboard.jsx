import { useState } from 'react';
import Sidebar from '../../components/common/Sidebar';
import Topbar from '../../components/common/Topbar';
import { motion } from 'framer-motion';
import {
  Package,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Calendar,
  Eye,
  Scissors,
  Activity,
  MessageCircle,
  Bell,
  ListTodo,
  BarChart3,
  MessageSquare,
  Award,
  Sparkles
} from 'lucide-react';
import { orders, dashboardStats } from '../../data/dummyData';
import { useNavigate } from 'react-router-dom';

const WorkerDashboard = () => {
  const navigate = useNavigate();
  const stats = dashboardStats.worker;

  // Mock worker ID (in real app, this would come from auth context)
  const currentWorkerId = 'WORK001';

  // Get worker's assigned orders
  const workerOrders = orders.filter(o => o.assignedWorker === currentWorkerId);

  // Calculate today's tasks
  const today = new Date().toISOString().split('T')[0];
  const todayTasks = workerOrders.filter(o => o.orderDate === today || o.deliveryDate === today);

  // Task statistics
  const totalTasksToday = todayTasks.length;
  const completedTasks = workerOrders.filter(o => o.status === 'ready').length;
  const inProgressTasks = workerOrders.filter(o => ['cutting', 'stitching', 'fitting'].includes(o.status)).length;
  const pendingTasks = workerOrders.filter(o => o.status === 'pending').length;
  const urgentTasks = workerOrders.filter(o => o.priority === 'high' && o.status !== 'ready').length;

  // Progress calculation
  const totalTasks = workerOrders.length;
  const completedPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const inProgressPercentage = totalTasks > 0 ? Math.round((inProgressTasks / totalTasks) * 100) : 0;
  const pendingPercentage = totalTasks > 0 ? Math.round((pendingTasks / totalTasks) * 100) : 0;

  // Last 7 days workload trend
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date.toISOString().split('T')[0];
  });

  const workloadTrend = last7Days.map(date => {
    const assigned = workerOrders.filter(o => o.orderDate === date).length;
    const completed = workerOrders.filter(o => 
      o.timeline && o.timeline.some(t => t.status === 'ready' && t.date === date)
    ).length;
    return { date, assigned, completed };
  });

  // Upcoming deadlines
  const upcomingDeadlines = workerOrders
    .filter(o => o.status !== 'ready')
    .sort((a, b) => new Date(a.deliveryDate) - new Date(b.deliveryDate))
    .slice(0, 5);

  // Recent assigned tasks
  const recentTasks = workerOrders
    .sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate))
    .slice(0, 5);

  // Mock notifications (in real app, would come from API)
  const unreadMessages = 3;
  const unreadNotifications = 5;
  const recentNotifications = [
    { id: 1, type: 'task', message: 'New task assigned: ORD-2024-001', time: '5 min ago' },
    { id: 2, type: 'deadline', message: 'Deadline reminder: ORD-2024-015 due today', time: '1 hour ago' },
    { id: 3, type: 'message', message: 'Owner: Please check measurements for ORD-2024-020', time: '2 hours ago' }
  ];

  // Today's performance metrics
  const todayCompleted = todayTasks.filter(t => t.status === 'ready').length;
  const todayCompletionRate = totalTasksToday > 0 ? Math.round((todayCompleted / totalTasksToday) * 100) : 0;

  // Monthly summary
  const currentMonth = new Date().getMonth();
  const monthlyTasks = workerOrders.filter(o => new Date(o.orderDate).getMonth() === currentMonth);
  const monthlyCompleted = monthlyTasks.filter(o => o.status === 'ready').length;
  const avgCompletionTime = '2.5 hrs'; // Mock data
  const accuracyRating = 4.5; // Mock data

  // Productivity badge
  const getProductivityBadge = () => {
    if (completedPercentage >= 90) return { text: 'Excellent Performance! 🌟', color: 'bg-green-100 text-green-700' };
    if (completedPercentage >= 75) return { text: 'Great Work! Keep Going 💪', color: 'bg-blue-100 text-blue-700' };
    if (completedPercentage >= 50) return { text: 'On Track! Stay Focused 🎯', color: 'bg-yellow-100 text-yellow-700' };
    return { text: 'Let\'s Pick Up the Pace! 🚀', color: 'bg-orange-100 text-orange-700' };
  };

  const badge = getProductivityBadge();

  // Get deadline status
  const getDeadlineStatus = (deliveryDate, status) => {
    const today = new Date();
    const deadline = new Date(deliveryDate);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (status === 'ready') return 'completed';
    if (deadline < today) return 'overdue';
    if (deadline.toDateString() === today.toDateString()) return 'today';
    if (deadline.toDateString() === tomorrow.toDateString()) return 'tomorrow';
    return 'future';
  };

  return (
    <div className="flex h-screen bg-gray-50">
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
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Scissors className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Worker Dashboard</h1>
                  <p className="text-gray-600">Track your tasks and performance</p>
                </div>
              </div>
              {/* Productivity Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-2 ${badge.color}`}
              >
                <Sparkles className="w-5 h-5" />
                {badge.text}
              </motion.div>
            </div>

            {/* Today's Work Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Tasks Assigned Today"
                value={totalTasksToday}
                icon={Package}
                color="bg-blue-500"
                subtitle="New assignments"
              />
              <StatCard
                title="Tasks Completed"
                value={completedTasks}
                icon={CheckCircle}
                color="bg-green-500"
                subtitle="All time"
              />
              <StatCard
                title="Tasks Remaining"
                value={inProgressTasks + pendingTasks}
                icon={Clock}
                color="bg-orange-500"
                subtitle="In progress + Pending"
              />
              <StatCard
                title="Urgent Priority"
                value={urgentTasks}
                icon={AlertCircle}
                color={urgentTasks > 3 ? 'bg-red-500' : 'bg-yellow-500'}
                subtitle="High priority tasks"
              />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - 2/3 width */}
              <div className="lg:col-span-2 space-y-6">
                {/* Task Progress Chart */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white rounded-lg shadow-md p-6"
                >
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Task Progress</h2>
                  <div className="flex items-center justify-center">
                    <DonutChart
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
                        <span className="text-sm font-medium text-gray-600">Completed</span>
                      </div>
                      <p className="text-2xl font-bold text-gray-900">{completedPercentage}%</p>
                      <p className="text-xs text-gray-500">{completedTasks} tasks</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span className="text-sm font-medium text-gray-600">In Progress</span>
                      </div>
                      <p className="text-2xl font-bold text-gray-900">{inProgressPercentage}%</p>
                      <p className="text-xs text-gray-500">{inProgressTasks} tasks</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                        <span className="text-sm font-medium text-gray-600">Pending</span>
                      </div>
                      <p className="text-2xl font-bold text-gray-900">{pendingPercentage}%</p>
                      <p className="text-xs text-gray-500">{pendingTasks} tasks</p>
                    </div>
                  </div>
                </motion.div>

                {/* Workload Trend Chart */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white rounded-lg shadow-md p-6"
                >
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Workload Trend (Last 7 Days)</h2>
                  <WorkloadChart data={workloadTrend} />
                </motion.div>

                {/* Recent Assigned Tasks Table */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white rounded-lg shadow-md overflow-hidden"
                >
                  <div className="p-6 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-900">Recent Assigned Tasks</h2>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Order ID</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Customer</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Task Type</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Deadline</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {recentTasks.map((task) => (
                          <tr key={task.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 text-sm font-medium text-gray-900">{task.id}</td>
                            <td className="px-6 py-4 text-sm text-gray-600">{task.customerName}</td>
                            <td className="px-6 py-4 text-sm text-gray-600">{task.items[0]?.type || 'N/A'}</td>
                            <td className="px-6 py-4 text-sm text-gray-600">{task.deliveryDate}</td>
                            <td className="px-6 py-4">
                              <StatusBadge status={task.status} />
                            </td>
                            <td className="px-6 py-4">
                              <button
                                onClick={() => navigate('/worker/tasks')}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              </div>

              {/* Right Column - 1/3 width */}
              <div className="space-y-6">
                {/* Quick Actions Section */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 }}
                  className="bg-white rounded-lg shadow-md p-6"
                >
                  <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => navigate('/worker/tasks')}
                      className="flex flex-col items-center justify-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                    >
                      <ListTodo className="w-6 h-6 text-blue-600 mb-2" />
                      <span className="text-xs font-medium text-gray-700">My Tasks</span>
                    </button>
                    <button
                      onClick={() => navigate('/worker/progress')}
                      className="flex flex-col items-center justify-center p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                    >
                      <BarChart3 className="w-6 h-6 text-green-600 mb-2" />
                      <span className="text-xs font-medium text-gray-700">Progress</span>
                    </button>
                    <button
                      onClick={() => navigate('/worker/chat')}
                      className="flex flex-col items-center justify-center p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
                    >
                      <MessageSquare className="w-6 h-6 text-purple-600 mb-2" />
                      <span className="text-xs font-medium text-gray-700">Chat</span>
                    </button>
                    <button
                      onClick={() => navigate('/worker/statistics')}
                      className="flex flex-col items-center justify-center p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors"
                    >
                      <Activity className="w-6 h-6 text-orange-600 mb-2" />
                      <span className="text-xs font-medium text-gray-700">Statistics</span>
                    </button>
                  </div>
                </motion.div>

                {/* Today's Performance vs Monthly Summary */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white rounded-lg shadow-md p-6"
                >
                  <h2 className="text-lg font-bold text-gray-900 mb-4">Performance Overview</h2>
                  
                  {/* Today's Performance */}
                  <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-semibold text-gray-700">Today's Performance</h3>
                      <Award className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">Total Tasks</span>
                        <span className="text-sm font-bold text-gray-900">{totalTasksToday}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">Completed</span>
                        <span className="text-sm font-bold text-green-600">{todayCompleted}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">Completion Rate</span>
                        <span className="text-sm font-bold text-blue-600">{todayCompletionRate}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Monthly Summary */}
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-semibold text-gray-700">Monthly Summary</h3>
                      <TrendingUp className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">Total Completed</span>
                        <span className="text-sm font-bold text-gray-900">{monthlyCompleted}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">Avg Completion Time</span>
                        <span className="text-sm font-bold text-green-600">{avgCompletionTime}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">Accuracy Rating</span>
                        <span className="text-sm font-bold text-green-600">{accuracyRating}/5 ⭐</span>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* New Messages/Notifications */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 }}
                  className="bg-white rounded-lg shadow-md p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-gray-900">Recent Activity</h2>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => navigate('/worker/chat')}
                        className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <MessageCircle className="w-5 h-5 text-gray-600" />
                        {unreadMessages > 0 && (
                          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                            {unreadMessages}
                          </span>
                        )}
                      </button>
                      <button
                        onClick={() => navigate('/worker/notifications')}
                        className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <Bell className="w-5 h-5 text-gray-600" />
                        {unreadNotifications > 0 && (
                          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                            {unreadNotifications}
                          </span>
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {recentNotifications.map((notif) => (
                      <div
                        key={notif.id}
                        className="p-3 bg-gray-50 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors"
                        onClick={() => navigate('/worker/notifications')}
                      >
                        <div className="flex items-start gap-2">
                          <div className={`w-2 h-2 rounded-full mt-1.5 ${
                            notif.type === 'task' ? 'bg-blue-500' :
                            notif.type === 'deadline' ? 'bg-orange-500' :
                            'bg-purple-500'
                          }`}></div>
                          <div className="flex-1">
                            <p className="text-xs text-gray-900 font-medium">{notif.message}</p>
                            <p className="text-xs text-gray-500 mt-1">{notif.time}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                    <button
                      onClick={() => navigate('/worker/notifications')}
                      className="w-full text-center text-sm text-blue-600 hover:text-blue-800 font-medium py-2"
                    >
                      View All Notifications
                    </button>
                  </div>
                </motion.div>

                {/* Performance Card */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-md p-6 text-white"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold">Overall Performance</h2>
                    <Activity className="w-6 h-6" />
                  </div>
                  <div className="text-center">
                    <p className="text-5xl font-bold mb-2">{stats.performance}%</p>
                    <p className="text-blue-100">Efficiency Score</p>
                  </div>
                  <div className="mt-6 pt-6 border-t border-blue-400">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-blue-100">Avg Rating</span>
                      <span className="text-lg font-bold">{stats.avgRating}/5</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-blue-100">Completed</span>
                      <span className="text-lg font-bold">{stats.completedTasks}</span>
                    </div>
                  </div>
                </motion.div>

                {/* Upcoming Deadlines */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white rounded-lg shadow-md p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-gray-900">Upcoming Deadlines</h2>
                    <Calendar className="w-5 h-5 text-gray-400" />
                  </div>
                  <div className="space-y-3">
                    {upcomingDeadlines.length > 0 ? (
                      upcomingDeadlines.map((task) => {
                        const deadlineStatus = getDeadlineStatus(task.deliveryDate, task.status);
                        return (
                          <DeadlineCard
                            key={task.id}
                            task={task}
                            deadlineStatus={deadlineStatus}
                          />
                        );
                      })
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Calendar className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                        <p className="text-sm">No upcoming deadlines</p>
                      </div>
                    )}
                  </div>
                </motion.div>

                {/* Quick Stats */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25 }}
                  className="bg-white rounded-lg shadow-md p-6"
                >
                  <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Stats</h2>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">Total Earnings</span>
                      <span className="text-lg font-bold text-green-600">₹{stats.totalEarnings.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">This Month</span>
                      <span className="text-lg font-bold text-blue-600">₹{stats.monthlyEarnings.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">Assigned Tasks</span>
                      <span className="text-lg font-bold text-purple-600">{stats.assignedTasks}</span>
                    </div>
                  </div>
                </motion.div>

                {/* Motivational Tip */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg shadow-md p-6 text-white"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-5 h-5" />
                    <h3 className="text-sm font-bold">Daily Inspiration</h3>
                  </div>
                  <p className="text-sm italic leading-relaxed">
                    "Small steps every day lead to mastery. Keep up the excellent work!"
                  </p>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ title, value, icon: Icon, color, subtitle }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -5 }}
      className="bg-white rounded-lg shadow-md p-6 cursor-pointer"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
      <p className="text-gray-500 text-sm">{title}</p>
      <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
      {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
    </motion.div>
  );
};

// Donut Chart Component
const DonutChart = ({ completed, inProgress, pending, total }) => {
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
        <p className="text-4xl font-bold text-gray-900">{total}</p>
        <p className="text-sm text-gray-500">Total Tasks</p>
      </div>
    </div>
  );
};

// Workload Chart Component
const WorkloadChart = ({ data }) => {
  const maxValue = Math.max(...data.map(d => Math.max(d.assigned, d.completed)), 1);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end gap-4 text-sm mb-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <span className="text-gray-600">Assigned</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="text-gray-600">Completed</span>
        </div>
      </div>
      <div className="flex items-end justify-between h-48 gap-3">
        {data.map((day, index) => {
          const assignedHeight = (day.assigned / maxValue) * 100;
          const completedHeight = (day.completed / maxValue) * 100;
          const dayLabel = new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' });

          return (
            <div key={index} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full flex items-end justify-center gap-1 h-40">
                <div className="relative flex-1 flex flex-col items-center">
                  <span className="text-xs font-semibold text-gray-700 mb-1">{day.assigned}</span>
                  <div
                    className="w-full bg-blue-500 rounded-t transition-all hover:bg-blue-600"
                    style={{ height: `${assignedHeight}%` }}
                  ></div>
                </div>
                <div className="relative flex-1 flex flex-col items-center">
                  <span className="text-xs font-semibold text-gray-700 mb-1">{day.completed}</span>
                  <div
                    className="w-full bg-green-500 rounded-t transition-all hover:bg-green-600"
                    style={{ height: `${completedHeight}%` }}
                  ></div>
                </div>
              </div>
              <span className="text-xs text-gray-600 font-medium">{dayLabel}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Deadline Card Component
const DeadlineCard = ({ task, deadlineStatus }) => {
  const statusConfig = {
    overdue: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-600', label: 'Overdue' },
    today: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-600', label: 'Due Today' },
    tomorrow: { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-600', label: 'Tomorrow' },
    future: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-600', label: task.deliveryDate },
    completed: { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-600', label: 'Completed' }
  };

  const config = statusConfig[deadlineStatus];

  return (
    <div className={`p-3 rounded-lg border ${config.bg} ${config.border}`}>
      <div className="flex items-center justify-between mb-1">
        <span className="font-semibold text-sm text-gray-900">{task.id}</span>
        <span className={`text-xs font-medium ${config.text}`}>{config.label}</span>
      </div>
      <p className="text-xs text-gray-600 mb-1">{task.customerName}</p>
      <p className="text-xs text-gray-500">{task.items[0]?.type || 'N/A'}</p>
    </div>
  );
};

// Status Badge Component
const StatusBadge = ({ status }) => {
  const statusConfig = {
    pending: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Pending' },
    cutting: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Cutting' },
    stitching: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Stitching' },
    fitting: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Fitting' },
    ready: { bg: 'bg-green-100', text: 'text-green-700', label: 'Ready' }
  };

  const config = statusConfig[status] || statusConfig.pending;

  return (
    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  );
};

export default WorkerDashboard;
