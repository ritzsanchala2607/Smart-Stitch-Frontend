import { useState } from 'react';
import Sidebar from '../../components/common/Sidebar';
import Topbar from '../../components/common/Topbar';
import { motion } from 'framer-motion';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';

const WorkerCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  // Mock task data for calendar
  const taskData = {
    '2024-12-10': { completed: 3, deadline: 1, total: 4 },
    '2024-12-11': { completed: 5, deadline: 2, total: 7 },
    '2024-12-12': { completed: 4, deadline: 1, total: 5 },
    '2024-12-13': { completed: 2, deadline: 3, total: 5 },
    '2024-12-14': { completed: 1, deadline: 0, total: 1 },
    '2024-12-15': { completed: 0, deadline: 0, total: 0 },
    '2024-12-16': { completed: 6, deadline: 2, total: 8 },
    '2024-12-17': { completed: 4, deadline: 1, total: 5 },
    '2024-12-18': { completed: 3, deadline: 2, total: 5 },
    '2024-12-19': { completed: 5, deadline: 1, total: 6 },
    '2024-12-20': { completed: 2, deadline: 3, total: 5 },
    '2024-12-21': { completed: 1, deadline: 0, total: 1 },
    '2024-12-22': { completed: 0, deadline: 0, total: 0 },
    '2024-12-23': { completed: 4, deadline: 2, total: 6 },
    '2024-12-24': { completed: 3, deadline: 1, total: 4 },
    '2024-12-25': { completed: 0, deadline: 0, total: 0 }
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
    if (total === 0) return 'bg-gray-100';
    if (total <= 2) return 'bg-green-200';
    if (total <= 4) return 'bg-green-300';
    if (total <= 6) return 'bg-green-400';
    return 'bg-green-500';
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
                  const hasDeadline = data && data.deadline > 0;
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
                            {hasDeadline && (
                              <AlertCircle className="w-3 h-3 text-red-600 dark:text-red-400" />
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Deadlines</span>
                    </div>
                    <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">{selectedDateTasks.deadline}</p>
                  </div>
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-3 mb-2">
                      <CalendarIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Tasks</span>
                    </div>
                    <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{selectedDateTasks.total}</p>
                  </div>
                </div>
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
