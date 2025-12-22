import { useState } from 'react';
import Sidebar from '../../components/common/Sidebar';
import Topbar from '../../components/common/Topbar';
import { motion } from 'framer-motion';
import usePageTitle from '../../hooks/usePageTitle';
import {
  Bell,
  Package,
  Clock,
  AlertTriangle,
  MessageSquare,
  CheckCircle,
  X,
  Filter
} from 'lucide-react';

const WorkerNotifications = () => {
  usePageTitle('Notifications');
  const [filter, setFilter] = useState('all');
  
  // Mock notifications
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'task',
      title: 'New Task Assigned',
      message: 'Order #ORD001 has been assigned to you. Priority: High',
      time: '5 minutes ago',
      read: false,
      icon: Package,
      color: 'bg-blue-500'
    },
    {
      id: 2,
      type: 'deadline',
      title: 'Deadline Reminder',
      message: 'Order #ORD002 is due tomorrow. Please complete on time.',
      time: '1 hour ago',
      read: false,
      icon: Clock,
      color: 'bg-orange-500'
    },
    {
      id: 3,
      type: 'material',
      title: 'Material Shortage Alert',
      message: 'Silk fabric is running low. Only 15 meters remaining.',
      time: '2 hours ago',
      read: false,
      icon: AlertTriangle,
      color: 'bg-red-500'
    },
    {
      id: 4,
      type: 'comment',
      title: 'Owner Comment',
      message: 'John Owner: "Great work on Order #ORD003! Keep it up."',
      time: '3 hours ago',
      read: true,
      icon: MessageSquare,
      color: 'bg-green-500'
    },
    {
      id: 5,
      type: 'chat',
      title: 'New Chat Message',
      message: 'John Owner sent you a message about Order #ORD004',
      time: '4 hours ago',
      read: true,
      icon: MessageSquare,
      color: 'bg-purple-500'
    },
    {
      id: 6,
      type: 'task',
      title: 'Task Completed',
      message: 'Order #ORD005 has been marked as completed.',
      time: '5 hours ago',
      read: true,
      icon: CheckCircle,
      color: 'bg-green-500'
    },
    {
      id: 7,
      type: 'deadline',
      title: 'Urgent Deadline',
      message: 'Order #ORD006 is overdue! Please complete immediately.',
      time: '6 hours ago',
      read: true,
      icon: Clock,
      color: 'bg-red-500'
    },
    {
      id: 8,
      type: 'material',
      title: 'Material Restocked',
      message: 'Premium Cotton has been restocked. 200 meters available.',
      time: '1 day ago',
      read: true,
      icon: Package,
      color: 'bg-blue-500'
    }
  ]);

  // Filter notifications
  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notif.read;
    return notif.type === filter;
  });

  // Mark as read
  const markAsRead = (id) => {
    setNotifications(notifications.map(notif =>
      notif.id === id ? { ...notif, read: true } : notif
    ));
  };

  // Mark all as read
  const markAllAsRead = () => {
    setNotifications(notifications.map(notif => ({ ...notif, read: true })));
  };

  // Delete notification
  const deleteNotification = (id) => {
    setNotifications(notifications.filter(notif => notif.id !== id));
  };

  // Count unread
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar role="worker" />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto space-y-6"
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Bell className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Notifications</h1>
                  <p className="text-gray-600 dark:text-gray-400">
                    {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up!'}
                  </p>
                </div>
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                >
                  Mark all as read
                </button>
              )}
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
              <div className="flex items-center gap-2 overflow-x-auto">
                <Filter className="w-5 h-5 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                {[
                  { value: 'all', label: 'All' },
                  { value: 'unread', label: 'Unread' },
                  { value: 'task', label: 'Tasks' },
                  { value: 'deadline', label: 'Deadlines' },
                  { value: 'material', label: 'Materials' },
                  { value: 'comment', label: 'Comments' },
                  { value: 'chat', label: 'Chat' }
                ].map((filterOption) => (
                  <button
                    key={filterOption.value}
                    onClick={() => setFilter(filterOption.value)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                      filter === filterOption.value
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {filterOption.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Notifications List */}
            <div className="space-y-3">
              {filteredNotifications.length > 0 ? (
                filteredNotifications.map((notification) => {
                  const Icon = notification.icon;
                  return (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 transition-all ${
                        !notification.read ? 'border-l-4 border-blue-600' : ''
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        {/* Icon */}
                        <div className={`${notification.color} p-3 rounded-lg flex-shrink-0`}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h3 className={`font-semibold ${!notification.read ? 'text-gray-900 dark:text-gray-100' : 'text-gray-700 dark:text-gray-300'}`}>
                              {notification.title}
                            </h3>
                            <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                              {notification.time}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{notification.message}</p>
                          
                          {/* Actions */}
                          <div className="flex items-center gap-2">
                            {!notification.read && (
                              <button
                                onClick={() => markAsRead(notification.id)}
                                className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                              >
                                Mark as read
                              </button>
                            )}
                            <button
                              onClick={() => deleteNotification(notification.id)}
                              className="text-xs text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium"
                            >
                              Delete
                            </button>
                          </div>
                        </div>

                        {/* Delete Button */}
                        <button
                          onClick={() => deleteNotification(notification.id)}
                          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors flex-shrink-0"
                        >
                          <X className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                        </button>
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center">
                  <Bell className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">No notifications</h3>
                  <p className="text-gray-600 dark:text-gray-400">You're all caught up! Check back later for updates.</p>
                </div>
              )}
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default WorkerNotifications;
