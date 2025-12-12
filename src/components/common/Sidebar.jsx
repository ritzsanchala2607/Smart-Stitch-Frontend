import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
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
  Calendar
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ role }) => {
  const location = useLocation();
  const { logout } = useAuth();

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
    { icon: HelpCircle, label: 'Support', path: '/customer/support' },
    { icon: Settings, label: 'Profile', path: '/customer/profile' },
  ];

  const menuItems = 
    role === 'owner' ? ownerMenuItems :
    role === 'worker' ? workerMenuItems :
    customerMenuItems;

  const isActive = (path) => location.pathname === path;

  return (
    <motion.div
      initial={{ x: -250 }}
      animate={{ x: 0 }}
      className="w-64 bg-gradient-to-b from-[#004E89] to-[#003366] text-white h-screen flex flex-col shadow-2xl"
    >
      {/* Logo */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
            <Scissors className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Smart Stitch</h1>
            <p className="text-xs text-orange-300 capitalize">{role} Panel</p>
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
                    ? 'bg-orange-500 text-white shadow-lg'
                    : 'text-white/80 hover:bg-white/10'
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
      <div className="p-4 border-t border-white/10">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 rounded-lg w-full text-white/80 hover:bg-red-500/20 hover:text-red-300 transition-all"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </motion.button>
      </div>
    </motion.div>
  );
};

export default Sidebar;
