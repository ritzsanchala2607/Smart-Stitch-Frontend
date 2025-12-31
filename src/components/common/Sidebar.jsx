import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Users,
  UserCog,
  Package,
  DollarSign,
  Warehouse,
  Star,
  MessageSquare,
  ClipboardList,
  TrendingUp,
  Ruler,
  ShoppingCart,
  CreditCard,
  HelpCircle,
  LogOut,
  Scissors,
  Settings,
  Bell,
  Calendar,
  X,
  Store,
  BarChart3,
  FileText
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ role, isOpen, onClose }) => {
  const location = useLocation();
  const { logout } = useAuth();
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const ownerMenuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/owner/dashboard' },
    { icon: UserCog, label: 'Workers', path: '/owner/workers' },
    { icon: Users, label: 'Customers', path: '/owner/customers' },
    { icon: Package, label: 'Orders', path: '/owner/orders' },
    { icon: DollarSign, label: 'Billing & Reports', path: '/owner/billing' },
    { icon: Warehouse, label: 'Inventory', path: '/owner/inventory' },
    { icon: TrendingUp, label: 'Analytics', path: '/owner/analytics' },
    { icon: Star, label: 'Ratings & Feedback', path: '/owner/ratings' },
    { icon: MessageSquare, label: 'Internal Chat', path: '/owner/chat' },
    { icon: Settings, label: 'Profile & Settings', path: '/owner/profile' },
  ];

  const workerMenuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/worker/dashboard' },
    { icon: ClipboardList, label: 'My Tasks', path: '/worker/tasks' },
    { icon: TrendingUp, label: 'Work Progress', path: '/worker/progress' },
    { icon: TrendingUp, label: 'Statistics', path: '/worker/statistics' },
    { icon: MessageSquare, label: 'Chat', path: '/worker/chat' },
    { icon: Bell, label: 'Notifications', path: '/worker/notifications' },
    { icon: Calendar, label: 'Calendar', path: '/worker/calendar' },
    { icon: Settings, label: 'Profile', path: '/worker/profile' },
  ];

  const customerMenuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/customer/dashboard' },
    { icon: Ruler, label: 'Measurements', path: '/customer/measurements' },
    { icon: Package, label: 'My Orders', path: '/customer/orders' },
    { icon: Scissors, label: 'Catalogue', path: '/customer/catalogue' },
    { icon: ShoppingCart, label: 'Cart', path: '/customer/cart' },
    { icon: CreditCard, label: 'Payment', path: '/customer/payment' },
    { icon: Star, label: 'Ratings', path: '/customer/ratings' },
    { icon: HelpCircle, label: 'Support', path: '/customer/support' },
    { icon: Settings, label: 'Profile', path: '/customer/profile' },
  ];

  const adminMenuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
    { icon: Store, label: 'Owners & Shops', path: '/admin/owners-shops' },
    { icon: BarChart3, label: 'Platform Analytics', path: '/admin/analytics' },
    { icon: FileText, label: 'System Reports', path: '/admin/reports' },
    { icon: Settings, label: 'Settings', path: '/admin/profile' },
  ];

  const menuItems = 
    role === 'owner' ? ownerMenuItems :
    role === 'worker' ? workerMenuItems :
    role === 'admin' ? adminMenuItems :
    customerMenuItems;

  const isActive = (path) => location.pathname === path;

  // Close sidebar when route changes on mobile
  useEffect(() => {
    if (isMobile && onClose) {
      onClose();
    }
  }, [location.pathname, isMobile, onClose]);

  return (
    <>
      {/* Overlay for mobile */}
      <AnimatePresence>
        {isMobile && isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        initial={isMobile ? { x: -280 } : { x: 0 }}
        animate={isMobile ? { x: isOpen ? 0 : -280 } : { x: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className={`
          ${isMobile ? 'fixed' : 'relative'}
          w-64 bg-gradient-to-b from-[#004E89] to-[#003366] dark:from-gray-900 dark:to-gray-950 text-white h-screen flex flex-col shadow-2xl z-50
        `}
      >
        {/* Close button for mobile */}
        {isMobile && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-lg transition-colors lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      {/* Logo */}
      <div className="p-6 border-b border-white/10 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 dark:from-orange-600 dark:to-orange-700 rounded-lg flex items-center justify-center">
            <Scissors className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Smart Stitch</h1>
            <p className="text-xs text-orange-300 dark:text-orange-400 capitalize">{role} Panel</p>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <Link key={index} to={item.path}>
              <motion.div
                whileHover={{ scale: 1.02, x: 5 }}
                whileTap={{ scale: 0.98 }}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-all ${
                  active
                    ? 'bg-orange-500 dark:bg-orange-600 text-white shadow-lg'
                    : 'text-white/80 dark:text-gray-300 hover:bg-white/10 dark:hover:bg-gray-800'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-white/10 dark:border-gray-800">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 rounded-lg w-full text-white/80 dark:text-gray-300 hover:bg-red-500/20 dark:hover:bg-red-900/30 hover:text-red-300 dark:hover:text-red-400 transition-all"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </motion.button>
      </div>
      </motion.div>
    </>
  );
};

export default Sidebar;
