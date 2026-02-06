import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Search, User, Menu, X, Moon, Sun, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSearch } from '../../context/SearchContext';
import { useTheme } from '../../context/ThemeContext';
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const Topbar = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const { searchQuery, setSearchQuery } = useSearch();
  const { theme, toggleTheme, isDark } = useTheme();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [localSearchValue, setLocalSearchValue] = useState(searchQuery);
  const debounceTimerRef = useRef(null);
  const notificationRef = useRef(null);
  const profileRef = useRef(null);

  const notifications = [
    { id: 1, message: 'New order received', time: '5 min ago', unread: true },
    { id: 2, message: 'Order #ORD001 completed', time: '1 hour ago', unread: true },
    { id: 3, message: 'Low stock alert', time: '2 hours ago', unread: false },
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounce search input (300ms)
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      setSearchQuery(localSearchValue);
    }, 300);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [localSearchValue, setSearchQuery]);

  // Handle search input change
  const handleSearchChange = (e) => {
    setLocalSearchValue(e.target.value);
  };

  // Handle clear search
  const handleClearSearch = () => {
    setLocalSearchValue('');
    setSearchQuery('');
  };

  return (
    <motion.div
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between shadow-sm relative z-30"
    >
      {/* Left Side */}
      <div className="flex items-center gap-4 flex-1">
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          aria-label="Toggle menu"
          type="button"
        >
          <Menu className="w-6 h-6 text-gray-600 dark:text-gray-300" />
        </button>
        
        {/* Search Bar */}
        <div className="hidden md:flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg px-4 py-2 flex-1 max-w-md relative">
          <Search className="w-5 h-5 text-gray-400 dark:text-gray-500 mr-2" />
          <input
            type="text"
            placeholder="Search orders, customers, workers..."
            className="bg-transparent outline-none flex-1 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
            value={localSearchValue}
            onChange={handleSearchChange}
          />
          {localSearchValue && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={handleClearSearch}
              className="ml-2 p-1 hover:bg-gray-200 rounded-full transition-colors"
              aria-label="Clear search"
            >
              <X className="w-4 h-4 text-gray-500" />
            </motion.button>
          )}
        </div>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-4">
        {/* Dark/Light Mode Toggle */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleTheme}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDark ? (
            <Sun className="w-6 h-6 text-gray-600 dark:text-gray-300" />
          ) : (
            <Moon className="w-6 h-6 text-gray-600 dark:text-gray-300" />
          )}
        </motion.button>

        {/* Notifications */}
        <div className="relative" ref={notificationRef}>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <Bell className="w-6 h-6 text-gray-600 dark:text-gray-300" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </motion.button>

          {/* Notifications Dropdown */}
          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50"
              >
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">Notifications</h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer ${
                        notif.unread ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                      }`}
                    >
                      <p className="text-sm text-gray-900 dark:text-gray-100">{notif.message}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{notif.time}</p>
                    </div>
                  ))}
                </div>
                <div className="p-3 text-center border-t border-gray-200 dark:border-gray-700">
                  <button 
                    onClick={() => {
                      setShowNotifications(false);
                      navigate(`/${user?.role}/notifications`);
                    }}
                    className="text-sm text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 font-medium"
                  >
                    View All Notifications
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User Profile */}
        <div className="relative" ref={profileRef}>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-3 pl-4 border-l border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg p-2 transition-colors"
          >
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{user?.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user?.role}</p>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
          </motion.button>

          {/* Profile Dropdown */}
          <AnimatePresence>
            {showProfileMenu && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50"
              >
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <p className="font-semibold text-gray-900 dark:text-gray-100">{user?.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
                </div>
                
                <div className="p-2">
                  {/* Profile Settings */}
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      navigate(`/${user?.role}/profile`);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <Settings className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                    <span className="text-sm text-gray-700 dark:text-gray-200">Profile & Settings</span>
                  </button>

                  {/* Logout */}
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors text-red-600 dark:text-red-400"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="text-sm font-medium">Logout</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default Topbar;
