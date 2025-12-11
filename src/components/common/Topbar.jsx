import { motion } from 'framer-motion';
import { Bell, Search, User, Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSearch } from '../../context/SearchContext';
import { useState, useEffect, useRef } from 'react';

const Topbar = () => {
  const { user } = useAuth();
  const { searchQuery, setSearchQuery } = useSearch();
  const [showNotifications, setShowNotifications] = useState(false);
  const [localSearchValue, setLocalSearchValue] = useState(searchQuery);
  const debounceTimerRef = useRef(null);

  const notifications = [
    { id: 1, message: 'New order received', time: '5 min ago', unread: true },
    { id: 2, message: 'Order #ORD001 completed', time: '1 hour ago', unread: true },
    { id: 3, message: 'Low stock alert', time: '2 hours ago', unread: false },
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

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
      className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm"
    >
      {/* Left Side */}
      <div className="flex items-center gap-4 flex-1">
        <button className="lg:hidden">
          <Menu className="w-6 h-6 text-gray-600" />
        </button>
        
        {/* Search Bar */}
        <div className="hidden md:flex items-center bg-gray-100 rounded-lg px-4 py-2 flex-1 max-w-md relative">
          <Search className="w-5 h-5 text-gray-400 mr-2" />
          <input
            type="text"
            placeholder="Search orders, customers, workers..."
            className="bg-transparent outline-none flex-1 text-sm"
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
        {/* Notifications */}
        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Bell className="w-6 h-6 text-gray-600" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </motion.button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50"
            >
              <div className="p-4 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900">Notifications</h3>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                      notif.unread ? 'bg-blue-50' : ''
                    }`}
                  >
                    <p className="text-sm text-gray-900">{notif.message}</p>
                    <p className="text-xs text-gray-500 mt-1">{notif.time}</p>
                  </div>
                ))}
              </div>
              <div className="p-3 text-center border-t border-gray-200">
                <button className="text-sm text-orange-600 hover:text-orange-700 font-medium">
                  View All Notifications
                </button>
              </div>
            </motion.div>
          )}
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
            <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
          </div>
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center">
            <User className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Topbar;
