import { useState, useEffect } from 'react';
import Sidebar from '../../components/common/Sidebar';
import Topbar from '../../components/common/Topbar';
import { motion } from 'framer-motion';
import usePageTitle from '../../hooks/usePageTitle';
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
import { useNavigate } from 'react-router-dom';
import { workerAPI } from '../../services/api';

const WorkerDashboard = () => {
  usePageTitle('Dashboard');
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // API State
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [tasks, setTasks] = useState([]);

  // Fetch dashboard data from API
  useEffect(() => {
    fetchWorkerTasks();
  }, []);

  const fetchWorkerTasks = async () => {
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
      const result = await workerAPI.getMyTasks(token);

      if (result.success) {
        console.log('Worker tasks fetched successfully:', result.data);
        const tasksData = result.data || [];
        setTasks(tasksData);
        
        // Calculate statistics from tasks
        const calculatedStats = calculateStatsFromTasks(tasksData);
        setDashboardData(calculatedStats);
      } else {
        console.error('Failed to fetch worker tasks:', result.error);
        setError(result.error);
      }
    } catch (error) {
      console.error('Error fetching worker tasks:', error);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate statistics from tasks data
  const calculateStatsFromTasks = (tasksData) => {
    const totalTasks = tasksData.length;
    const completedTasks = tasksData.filter(t => t.status === 'COMPLETED').length;
    const inProgressTasks = tasksData.filter(t => t.status === 'IN_PROGRESS').length;
    const pendingTasks = tasksData.filter(t => t.status === 'PENDING').length;
    
    // Calculate urgent tasks (tasks with deadline within 2 days)
    const today = new Date();
    const twoDaysFromNow = new Date(today);
    twoDaysFromNow.setDate(today.getDate() + 2);
    
    const urgentTasks = tasksData.filter(t => {
      if (t.status === 'COMPLETED') return false;
      if (!t.deadline) return false;
      const deadline = new Date(t.deadline);
      return deadline <= twoDaysFromNow;
    }).length;

    // Calculate performance (completion rate)
    const performance = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return {
      totalTasks,
      completedTasks,
      inProgressTasks,
      pendingTasks,
      urgentTasks,
      performance,
      avgRating: 4.5, // Mock data - will be from API when ratings endpoint is ready
      totalEarnings: 45000, // Mock data - will be from API when earnings endpoint is ready
      monthlyEarnings: 12000, // Mock data - will be from API when earnings endpoint is ready
      assignedTasks: totalTasks,
      avgCompletionTime: '2.5 hrs' // Mock data - will be calculated when we have completion timestamps
    };
  };

  // Calculate statistics from API data or use defaults
  const stats = dashboardData || {
    totalTasks: 0,
    completedTasks: 0,
    inProgressTasks: 0,
    pendingTasks: 0,
    urgentTasks: 0,
    performance: 0,
    avgRating: 0,
    totalEarnings: 0,
    monthlyEarnings: 0,
    assignedTasks: 0
  };

  // Calculate today's tasks
  const today = new Date().toISOString().split('T')[0];
  const todayTasks = tasks.filter(t => {
    const taskDate = t.createdAt ? new Date(t.createdAt).toISOString().split('T')[0] : null;
    const deadline = t.deadline ? new Date(t.deadline).toISOString().split('T')[0] : null;
    return taskDate === today || deadline === today;
  });

  // Task statistics
  const totalTasksToday = todayTasks.length;
  const completedTasks = stats.completedTasks || 0;
  const inProgressTasks = stats.inProgressTasks || 0;
  const pendingTasks = stats.pendingTasks || 0;
  const urgentTasks = stats.urgentTasks || 0;

  // Progress calculation
  const totalTasks = stats.totalTasks || 0;
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
    const assigned = tasks.filter(t => {
      const taskDate = t.createdAt ? new Date(t.createdAt).toISOString().split('T')[0] : null;
      return taskDate === date;
    }).length;
    const completed = tasks.filter(t => 
      t.status === 'COMPLETED' && t.completedAt && new Date(t.completedAt).toISOString().split('T')[0] === date
    ).length;
    return { date, assigned, completed };
  });

  // Upcoming deadlines
  const upcomingDeadlines = tasks
    .filter(t => t.status !== 'COMPLETED')
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
    .slice(0, 5);

  // Recent assigned tasks
  const recentTasks = tasks
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  // Mock notifications (in real app, would come from API)
  const unreadMessages = 3;
  const unreadNotifications = 5;
  const recentNotifications = [
    { id: 1, type: 'task', message: 'New task assigned', time: '5 min ago' },
    { id: 2, type: 'deadline', message: 'Deadline reminder: Task due today', time: '1 hour ago' },
    { id: 3, type: 'message', message: 'Owner: Please check measurements', time: '2 hours ago' }
  ];

  // Today's performance metrics
  const todayCompleted = todayTasks.filter(t => t.status === 'COMPLETED').length;
  const todayCompletionRate = totalTasksToday > 0 ? Math.round((todayCompleted / totalTasksToday) * 100) : 0;

  // Monthly summary
  const currentMonth = new Date().getMonth();
  const monthlyTasks = tasks.filter(t => {
    const taskDate = t.createdAt ? new Date(t.createdAt) : null;
    return taskDate && taskDate.getMonth() === currentMonth;
  });
  const monthlyCompleted = monthlyTasks.filter(t => t.status === 'COMPLETED').length;
  const avgCompletionTime = stats.avgCompletionTime || '2.5 hrs'; // From API or default
  const accuracyRating = stats.avgRating || 4.5; // From API or default

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

    if (status === 'COMPLETED') return 'completed';
    if (deadline < today) return 'overdue';
    if (deadline.toDateString() === today.toDateString()) return 'today';
    if (deadline.toDateString() === tomorrow.toDateString()) return 'tomorrow';
    return 'future';
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar role="worker" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Topbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
          <main className="flex-1 overflow-y-auto p-6 dark:bg-gray-900">
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">Loading dashboard...</p>
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
        <Sidebar role="worker" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Topbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
          <main className="flex-1 overflow-y-auto p-6 dark:bg-gray-900">
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
                <button
                  onClick={() => {
                    fetchWorkerTasks();
                  }}
                  className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
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

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar role="worker" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-y-auto p-6 dark:bg-gray-900">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-7xl mx-auto space-y-6"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Scissors className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Worker Dashboard</h1>
                  <p className="text-gray-600 dark:text-gray-400">Track your tasks and performance</p>
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
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
                >
                  <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">Task Progress</h2>
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
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed</span>
                      </div>
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{completedPercentage}%</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{completedTasks} tasks</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">In Progress</span>
                      </div>
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{inProgressPercentage}%</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{inProgressTasks} tasks</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending</span>
                      </div>
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{pendingPercentage}%</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{pendingTasks} tasks</p>
                    </div>
                  </div>
                </motion.div>

                {/* Workload Trend Chart */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
                >
                  <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">Workload Trend (Last 7 Days)</h2>
                  <WorkloadChart data={workloadTrend} />
                </motion.div>

                {/* Recent Assigned Tasks Table */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden"
                >
                  <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Recent Assigned Tasks</h2>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400">Order ID</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400">Customer</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400">Task Type</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400">Deadline</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {recentTasks.length === 0 ? (
                          <tr>
                            <td colSpan="6" className="px-6 py-12 text-center">
                              <Package className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                              <p className="text-gray-600 dark:text-gray-400">No tasks assigned yet</p>
                            </td>
                          </tr>
                        ) : (
                          recentTasks.map((task) => (
                            <tr key={task.taskId || task.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                              <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">
                                {task.order?.orderId ? `ORD${String(task.order.orderId).padStart(3, '0')}` : 'N/A'}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                                {task.order?.customer?.name || 'Unknown'}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                                {task.taskType || 'N/A'}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                                {task.deadline ? new Date(task.deadline).toLocaleDateString() : 'N/A'}
                              </td>
                              <td className="px-6 py-4">
                                <StatusBadge status={task.status} />
                              </td>
                              <td className="px-6 py-4">
                                <button
                                  onClick={() => navigate('/worker/tasks')}
                                  className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
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
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
                >
                  <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Quick Actions</h2>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => navigate('/worker/tasks')}
                      className="flex flex-col items-center justify-center p-4 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 rounded-lg transition-colors border border-gray-200 dark:border-gray-600"
                    >
                      <ListTodo className="w-6 h-6 text-blue-600 dark:text-blue-400 mb-2" />
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">My Tasks</span>
                    </button>
                    <button
                      onClick={() => navigate('/worker/progress')}
                      className="flex flex-col items-center justify-center p-4 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 rounded-lg transition-colors border border-gray-200 dark:border-gray-600"
                    >
                      <BarChart3 className="w-6 h-6 text-green-600 dark:text-green-400 mb-2" />
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Progress</span>
                    </button>
                    <button
                      onClick={() => navigate('/worker/chat')}
                      className="flex flex-col items-center justify-center p-4 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 rounded-lg transition-colors border border-gray-200 dark:border-gray-600"
                    >
                      <MessageSquare className="w-6 h-6 text-purple-600 dark:text-purple-400 mb-2" />
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Chat</span>
                    </button>
                    <button
                      onClick={() => navigate('/worker/statistics')}
                      className="flex flex-col items-center justify-center p-4 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 rounded-lg transition-colors border border-gray-200 dark:border-gray-600"
                    >
                      <Activity className="w-6 h-6 text-orange-600 dark:text-orange-400 mb-2" />
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Statistics</span>
                    </button>
                  </div>
                </motion.div>

                {/* Today's Performance vs Monthly Summary */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
                >
                  <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Performance Overview</h2>
                  
                  {/* Today's Performance */}
                  <div className="mb-4 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Today's Performance</h3>
                      <Award className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600 dark:text-gray-400">Total Tasks</span>
                        <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{totalTasksToday}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600 dark:text-gray-400">Completed</span>
                        <span className="text-sm font-bold text-green-600 dark:text-green-400">{todayCompleted}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600 dark:text-gray-400">Completion Rate</span>
                        <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{todayCompletionRate}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Monthly Summary */}
                  <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Monthly Summary</h3>
                      <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600 dark:text-gray-400">Total Completed</span>
                        <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{monthlyCompleted}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600 dark:text-gray-400">Avg Completion Time</span>
                        <span className="text-sm font-bold text-green-600 dark:text-green-400">{avgCompletionTime}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600 dark:text-gray-400">Accuracy Rating</span>
                        <span className="text-sm font-bold text-green-600 dark:text-green-400">{accuracyRating}/5 ⭐</span>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* New Messages/Notifications */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 }}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Recent Activity</h2>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => navigate('/worker/chat')}
                        className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        <MessageCircle className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                        {unreadMessages > 0 && (
                          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                            {unreadMessages}
                          </span>
                        )}
                      </button>
                      <button
                        onClick={() => navigate('/worker/notifications')}
                        className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
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
                        className="p-3 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg cursor-pointer transition-colors"
                        onClick={() => navigate('/worker/notifications')}
                      >
                        <div className="flex items-start gap-2">
                          <div className={`w-2 h-2 rounded-full mt-1.5 ${
                            notif.type === 'task' ? 'bg-blue-500' :
                            notif.type === 'deadline' ? 'bg-orange-500' :
                            'bg-purple-500'
                          }`}></div>
                          <div className="flex-1">
                            <p className="text-xs text-gray-900 dark:text-gray-100 font-medium">{notif.message}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{notif.time}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                    <button
                      onClick={() => navigate('/worker/notifications')}
                      className="w-full text-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium py-2"
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
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Overall Performance</h2>
                    <Activity className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="text-center">
                    <p className="text-5xl font-bold mb-2 text-gray-900 dark:text-gray-100">{stats.performance}%</p>
                    <p className="text-gray-600 dark:text-gray-400">Efficiency Score</p>
                  </div>
                  <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Avg Rating</span>
                      <span className="text-lg font-bold text-gray-900 dark:text-gray-100">{stats.avgRating}/5</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Completed</span>
                      <span className="text-lg font-bold text-gray-900 dark:text-gray-100">{stats.completedTasks}</span>
                    </div>
                  </div>
                </motion.div>

                {/* Upcoming Deadlines */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Upcoming Deadlines</h2>
                    <Calendar className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                  </div>
                  <div className="space-y-3">
                    {upcomingDeadlines.length > 0 ? (
                      upcomingDeadlines.map((task) => {
                        const deadlineStatus = getDeadlineStatus(task.deadline, task.status);
                        return (
                          <DeadlineCard
                            key={task.taskId || task.id}
                            task={task}
                            deadlineStatus={deadlineStatus}
                          />
                        );
                      })
                    ) : (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        <Calendar className="w-12 h-12 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
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
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
                >
                  <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Quick Stats</h2>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Earnings</span>
                      <span className="text-lg font-bold text-green-600 dark:text-green-400">₹{stats.totalEarnings.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">This Month</span>
                      <span className="text-lg font-bold text-blue-600 dark:text-blue-400">₹{stats.monthlyEarnings.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Assigned Tasks</span>
                      <span className="text-lg font-bold text-purple-600 dark:text-purple-400">{stats.assignedTasks}</span>
                    </div>
                  </div>
                </motion.div>

                {/* Motivational Tip */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">Daily Inspiration</h3>
                  </div>
                  <p className="text-sm italic leading-relaxed text-gray-700 dark:text-gray-300">
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
  // Extract color name from the color class (e.g., "bg-blue-500" -> "blue")
  const colorName = color.match(/bg-(\w+)-/)?.[1] || 'blue';
  const iconColorClass = `text-${colorName}-600 dark:text-${colorName}-400`;
  
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -5 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 cursor-pointer border border-gray-200 dark:border-gray-700"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-gray-100 dark:bg-gray-700">
          <Icon className={`w-6 h-6 ${iconColorClass}`} />
        </div>
      </div>
      <p className="text-gray-500 dark:text-gray-400 text-sm">{title}</p>
      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-2">{value}</p>
      {subtitle && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>}
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
        <p className="text-4xl font-bold text-gray-900 dark:text-gray-100">{total}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">Total Tasks</p>
      </div>
    </div>
  );
};

// Workload Chart Component
const WorkloadChart = ({ data }) => {
  // Calculate max value, ensure at least 1 to avoid division by zero
  const maxValue = Math.max(...data.map(d => Math.max(d.assigned, d.completed)), 1);
  
  // Check if there's any data
  const hasData = data.some(d => d.assigned > 0 || d.completed > 0);

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
      
      {!hasData ? (
        <div className="flex items-center justify-center h-48 bg-gray-50 dark:bg-gray-700 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
          <div className="text-center">
            <BarChart3 className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
            <p className="text-sm text-gray-500 dark:text-gray-400">No workload data for the last 7 days</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Data will appear as you complete tasks</p>
          </div>
        </div>
      ) : (
        <div className="flex items-end justify-between h-48 gap-3">
          {data.map((day, index) => {
            // Calculate heights with minimum 5% for visibility when value > 0
            const assignedHeight = day.assigned > 0 
              ? Math.max((day.assigned / maxValue) * 100, 5) 
              : 0;
            const completedHeight = day.completed > 0 
              ? Math.max((day.completed / maxValue) * 100, 5) 
              : 0;
            const dayLabel = new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' });

            return (
              <div key={index} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex items-end justify-center gap-1 h-40">
                  {/* Assigned Bar */}
                  <div className="relative flex-1 flex flex-col items-center">
                    {day.assigned > 0 && (
                      <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                        {day.assigned}
                      </span>
                    )}
                    <div
                      className={`w-full rounded-t transition-all ${
                        day.assigned > 0 
                          ? 'bg-blue-500 hover:bg-blue-600 cursor-pointer' 
                          : 'bg-gray-200 dark:bg-gray-700'
                      }`}
                      style={{ height: assignedHeight > 0 ? `${assignedHeight}%` : '2px' }}
                      title={`Assigned: ${day.assigned}`}
                    ></div>
                  </div>
                  
                  {/* Completed Bar */}
                  <div className="relative flex-1 flex flex-col items-center">
                    {day.completed > 0 && (
                      <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                        {day.completed}
                      </span>
                    )}
                    <div
                      className={`w-full rounded-t transition-all ${
                        day.completed > 0 
                          ? 'bg-green-500 hover:bg-green-600 cursor-pointer' 
                          : 'bg-gray-200 dark:bg-gray-700'
                      }`}
                      style={{ height: completedHeight > 0 ? `${completedHeight}%` : '2px' }}
                      title={`Completed: ${day.completed}`}
                    ></div>
                  </div>
                </div>
                <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">{dayLabel}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// Deadline Card Component
const DeadlineCard = ({ task, deadlineStatus }) => {
  const statusConfig = {
    overdue: { bg: 'bg-red-50 dark:bg-red-900/20', border: 'border-red-200 dark:border-red-800', text: 'text-red-600 dark:text-red-400', label: 'Overdue' },
    today: { bg: 'bg-orange-50 dark:bg-orange-900/20', border: 'border-orange-200 dark:border-orange-800', text: 'text-orange-600 dark:text-orange-400', label: 'Due Today' },
    tomorrow: { bg: 'bg-yellow-50 dark:bg-yellow-900/20', border: 'border-yellow-200 dark:border-yellow-800', text: 'text-yellow-600 dark:text-yellow-400', label: 'Tomorrow' },
    future: { bg: 'bg-green-50 dark:bg-green-900/20', border: 'border-green-200 dark:border-green-800', text: 'text-green-600 dark:text-green-400', label: task.deadline ? new Date(task.deadline).toLocaleDateString() : 'N/A' },
    completed: { bg: 'bg-gray-50 dark:bg-gray-700', border: 'border-gray-200 dark:border-gray-600', text: 'text-gray-600 dark:text-gray-400', label: 'Completed' }
  };

  const config = statusConfig[deadlineStatus];
  const orderId = task.order?.orderId ? `ORD${String(task.order.orderId).padStart(3, '0')}` : 'N/A';
  const customerName = task.order?.customer?.name || 'Unknown';
  const taskType = task.taskType || 'N/A';

  return (
    <div className={`p-3 rounded-lg border ${config.bg} ${config.border}`}>
      <div className="flex items-center justify-between mb-1">
        <span className="font-semibold text-sm text-gray-900 dark:text-gray-100">{orderId}</span>
        <span className={`text-xs font-medium ${config.text}`}>{config.label}</span>
      </div>
      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">{customerName}</p>
      <p className="text-xs text-gray-500 dark:text-gray-400">{taskType}</p>
    </div>
  );
};

// Status Badge Component
const StatusBadge = ({ status }) => {
  const statusConfig = {
    PENDING: { bg: 'bg-gray-100 dark:bg-gray-900/30', text: 'text-gray-700 dark:text-gray-400', label: 'Pending' },
    IN_PROGRESS: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400', label: 'In Progress' },
    COMPLETED: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400', label: 'Completed' },
    // Legacy status support
    pending: { bg: 'bg-gray-100 dark:bg-gray-900/30', text: 'text-gray-700 dark:text-gray-400', label: 'Pending' },
    cutting: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-400', label: 'Cutting' },
    stitching: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400', label: 'Stitching' },
    fitting: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-400', label: 'Fitting' },
    ready: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400', label: 'Ready' }
  };

  const config = statusConfig[status] || statusConfig.PENDING;

  return (
    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  );
};

export default WorkerDashboard;
