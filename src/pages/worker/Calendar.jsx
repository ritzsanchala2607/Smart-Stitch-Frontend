import { useState, useEffect } from 'react';
import Sidebar from '../../components/common/Sidebar';
import Topbar from '../../components/common/Topbar';
import { motion } from 'framer-motion';
import usePageTitle from '../../hooks/usePageTitle';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Clock,
  Package,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { workerAPI } from '../../services/api';

const WorkerCalendar = () => {
  usePageTitle('Calendar');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [taskData, setTaskData] = useState({});
  const [expandedTasks, setExpandedTasks] = useState({});

  // Fetch tasks from API
  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setIsLoading(true);
    
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
      console.log('No token found for calendar');
      setIsLoading(false);
      return;
    }

    try {
      const result = await workerAPI.getMyTasks(token);
      
      console.log('Calendar - Tasks API Result:', result);
      
      if (result.success) {
        const fetchedTasks = result.data || [];
        console.log('Calendar - Fetched Tasks:', fetchedTasks);
        
        // Group tasks by deadline (same as Tasks page)
        const grouped = {};
        fetchedTasks.forEach(task => {
          console.log('Processing task:', task);
          
          // Use same field as Tasks page: task.order?.deadline
          const deadline = task.order?.deadline || task.dueDate || task.deliveryDate;
          
          if (deadline) {
            const dateStr = new Date(deadline).toISOString().split('T')[0];
            console.log('Task deadline:', deadline, 'Date string:', dateStr);
            
            if (!grouped[dateStr]) {
              grouped[dateStr] = { completed: 0, pending: 0, total: 0, tasks: [] };
            }
            grouped[dateStr].total++;
            if (task.status === 'COMPLETED') {
              grouped[dateStr].completed++;
            } else {
              grouped[dateStr].pending++;
            }
            
            // Add task with customer name and task type from API
            grouped[dateStr].tasks.push({
              ...task,
              customerName: task.order?.customer?.user?.name || 'Unknown Customer',
              taskType: task.taskType || 'Task',
              deadline: deadline // Store the deadline for display
            });
          } else {
            console.log('Task has no deadline:', task);
          }
        });
        
        console.log('Calendar - Grouped tasks:', grouped);
        setTaskData(grouped);
      } else {
        console.error('Failed to fetch tasks:', result.error);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Mark task as complete
  const handleCompleteTask = async (taskId) => {
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

    if (!token) return;

    try {
      const result = await workerAPI.completeTask(taskId, token);
      
      if (result.success) {
        // Refresh tasks
        fetchTasks();
      }
    } catch (error) {
      console.error('Error completing task:', error);
    }
  };

  // Toggle task details
  const toggleTaskDetails = (taskId) => {
    setExpandedTasks(prev => ({
      ...prev,
      [taskId]: !prev[taskId]
    }));
  };

  // Get calendar days
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const days = getDaysInMonth(currentDate);
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Navigation
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Get task intensity color
  const getIntensityColor = (total) => {
    if (total === 0) return 'bg-gray-100 dark:bg-gray-700';
    if (total <= 2) return 'bg-green-200 dark:bg-green-800';
    if (total <= 4) return 'bg-green-300 dark:bg-green-700';
    if (total <= 6) return 'bg-green-400 dark:bg-green-600';
    return 'bg-green-500 dark:bg-green-500';
  };

  // Format date for lookup
  const formatDate = (date) => {
    if (!date) return '';
    return date.toISOString().split('T')[0];
  };

  // Check if date is today
  const isToday = (date) => {
    if (!date) return false;
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  // Get selected date tasks
  const selectedDateTasks = selectedDate ? taskData[formatDate(selectedDate)] : null;
  const selectedDateTaskList = selectedDateTasks?.tasks || [];

  // Calculate weekly workload
  const getWeeklyWorkload = () => {
    const weeks = [];
    let currentWeek = [];
    
    days.forEach((day, index) => {
      currentWeek.push(day);
      if ((index + 1) % 7 === 0 || index === days.length - 1) {
        const weekTotal = currentWeek
          .filter(d => d)
          .reduce((sum, d) => {
            const data = taskData[formatDate(d)];
            return sum + (data?.total || 0);
          }, 0);
        weeks.push({ days: [...currentWeek], total: weekTotal });
        currentWeek = [];
      }
    });
    
    return weeks;
  };

  const weeklyWorkload = getWeeklyWorkload();

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
                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <CalendarIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Work Calendar</h1>
                  <p className="text-gray-600 dark:text-gray-400">Track your daily tasks and deadlines</p>
                </div>
              </div>
              <button
                onClick={goToToday}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Today
              </button>
            </div>

            {/* Calendar Navigation */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              {isLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Loading tasks...</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                    </h2>
                    <div className="flex gap-2">
                      <button
                        onClick={goToPreviousMonth}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-900 dark:text-gray-100"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        onClick={goToNextMonth}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-900 dark:text-gray-100"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-2">
                {/* Day headers */}
                {dayNames.map((day) => (
                  <div key={day} className="text-center font-semibold text-gray-600 dark:text-gray-400 text-sm py-2">
                    {day}
                  </div>
                ))}

                {/* Calendar days */}
                {days.map((day, index) => {
                  if (!day) {
                    return <div key={`empty-${index}`} className="aspect-square" />;
                  }

                  const dateStr = formatDate(day);
                  const data = taskData[dateStr];
                  const hasPending = data && data.pending > 0;
                  const isSelected = selectedDate && formatDate(selectedDate) === dateStr;
                  const isTodayDate = isToday(day);

                  return (
                    <motion.button
                      key={dateStr}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedDate(day)}
                      className={`aspect-square p-2 rounded-lg border-2 transition-all ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30'
                          : isTodayDate
                          ? 'border-green-600 bg-green-50 dark:bg-green-900/30'
                          : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                      } ${getIntensityColor(data?.total || 0)}`}
                    >
                      <div className="flex flex-col items-center justify-center h-full">
                        <span className={`text-sm font-semibold mb-1 ${
                          isTodayDate ? 'text-green-700 dark:text-green-400' : 'text-gray-900 dark:text-gray-100'
                        }`}>
                          {day.getDate()}
                        </span>
                        {data && data.total > 0 && (
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                              {data.total}
                            </span>
                            {hasPending && (
                              <Clock className="w-3 h-3 text-orange-600 dark:text-orange-400" />
                            )}
                          </div>
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="flex items-center justify-center gap-6 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-100 dark:bg-gray-700 rounded"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">No tasks</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-200 dark:bg-green-800 rounded"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">1-2 tasks</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-300 dark:bg-green-700 rounded"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">3-4 tasks</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-400 dark:bg-green-600 rounded"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">5-6 tasks</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">7+ tasks</span>
                </div>
              </div>
              
              {/* No tasks message */}
              {Object.keys(taskData).length === 0 && !isLoading && (
                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-center text-blue-700 dark:text-blue-400">
                    No tasks found. Tasks will appear here when they have deadlines assigned.
                  </p>
                </div>
              )}
              </>
              )}
            </div>

            {/* Selected Date Details */}
            {selectedDate && selectedDateTasks && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
              >
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                  {selectedDate.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="p-4 bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="flex items-center gap-3 mb-2">
                      <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Completed</span>
                    </div>
                    <p className="text-3xl font-bold text-green-600 dark:text-green-400">{selectedDateTasks.completed}</p>
                  </div>
                  <div className="p-4 bg-orange-50 dark:bg-orange-900/30 rounded-lg border border-orange-200 dark:border-orange-800">
                    <div className="flex items-center gap-3 mb-2">
                      <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Pending</span>
                    </div>
                    <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">{selectedDateTasks.pending}</p>
                  </div>
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-3 mb-2">
                      <CalendarIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Tasks</span>
                    </div>
                    <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{selectedDateTasks.total}</p>
                  </div>
                </div>

                {/* Task List */}
                {selectedDateTaskList.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Tasks for this day</h4>
                    {selectedDateTaskList.map((task) => {
                      const isExpanded = expandedTasks[task.taskId];
                      return (
                        <div
                          key={task.taskId}
                          className="bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden"
                        >
                          {/* Task Header */}
                          <div className="p-4">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                  <h5 className="font-semibold text-gray-900 dark:text-gray-100">
                                    Order #{task.orderId || task.order?.orderId || 'N/A'}
                                  </h5>
                                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                    task.status === 'COMPLETED'
                                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                      : task.status === 'IN_PROGRESS'
                                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                      : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                                  }`}>
                                    {task.status}
                                  </span>
                                </div>
                                
                                {/* Task Summary */}
                                <div className="mb-3 space-y-1">
                                  <p className="text-sm text-gray-700 dark:text-gray-300">
                                    <span className="font-medium">Customer:</span> {task.customerName || 'Not specified'}
                                  </p>
                                  <p className="text-sm text-gray-700 dark:text-gray-300">
                                    <span className="font-medium">Task Type:</span> {task.taskType || 'Not specified'}
                                  </p>
                                </div>
                                
                                {/* See Details Button */}
                                <button
                                  onClick={() => toggleTaskDetails(task.taskId)}
                                  className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                                >
                                  {isExpanded ? (
                                    <>
                                      <ChevronUp className="w-4 h-4" />
                                      Hide details
                                    </>
                                  ) : (
                                    <>
                                      <ChevronDown className="w-4 h-4" />
                                      See details
                                    </>
                                  )}
                                </button>
                              </div>
                              
                              {task.status !== 'COMPLETED' && (
                                <button
                                  onClick={() => handleCompleteTask(task.taskId)}
                                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 whitespace-nowrap"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                  Mark Complete
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Expandable Details */}
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="px-4 pb-4 border-t border-gray-200 dark:border-gray-600 pt-3"
                            >
                              <div className="space-y-2">
                                <div className="flex items-start gap-2">
                                  <span className="font-medium text-gray-700 dark:text-gray-300 min-w-[100px]">Task Type:</span>
                                  <span className="text-gray-600 dark:text-gray-400">
                                    {task.taskType || 'Not specified'}
                                  </span>
                                </div>
                                <div className="flex items-start gap-2">
                                  <span className="font-medium text-gray-700 dark:text-gray-300 min-w-[100px]">Customer:</span>
                                  <span className="text-gray-600 dark:text-gray-400">
                                    {task.customerName || 'Not specified'}
                                  </span>
                                </div>
                                {task.order?.customer?.user?.contactNumber && (
                                  <div className="flex items-start gap-2">
                                    <span className="font-medium text-gray-700 dark:text-gray-300 min-w-[100px]">Contact:</span>
                                    <span className="text-gray-600 dark:text-gray-400">
                                      {task.order.customer.user.contactNumber}
                                    </span>
                                  </div>
                                )}
                                {task.deadline && (
                                  <div className="flex items-start gap-2">
                                    <span className="font-medium text-gray-700 dark:text-gray-300 min-w-[100px]">Deadline:</span>
                                    <span className="text-gray-600 dark:text-gray-400">
                                      {new Date(task.deadline).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                      })}
                                    </span>
                                  </div>
                                )}
                                {task.order?.additionalNotes && (
                                  <div className="flex items-start gap-2">
                                    <span className="font-medium text-gray-700 dark:text-gray-300 min-w-[100px]">Notes:</span>
                                    <span className="text-gray-600 dark:text-gray-400">
                                      {task.order.additionalNotes}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}

            {/* Weekly Workload */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Weekly Workload</h3>
              <div className="space-y-3">
                {weeklyWorkload.map((week, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400 w-16">Week {index + 1}</span>
                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-8 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-green-400 to-green-600 h-8 flex items-center justify-end pr-3 transition-all"
                        style={{ width: `${Math.min((week.total / 50) * 100, 100)}%` }}
                      >
                        <span className="text-white text-sm font-semibold">{week.total} tasks</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default WorkerCalendar;
