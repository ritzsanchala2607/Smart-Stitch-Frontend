import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Auth Pages
import Login from '../components/Login';
import Signup from '../components/Signup';

// Owner Pages
import OwnerDashboard from '../pages/owner/Dashboard';
import OwnerWorkers from '../pages/owner/Workers';
import OwnerCustomers from '../pages/owner/Customers';
import OwnerOrders from '../pages/owner/Orders';
import OwnerBilling from '../pages/owner/Billing';
import OwnerInventory from '../pages/owner/Inventory';
import OwnerRatings from '../pages/owner/Ratings';
import OwnerChat from '../pages/owner/Chat';
import OwnerAnalytics from '../pages/owner/Analytics';
import WorkerDetails from '../pages/owner/WorkerDetails';
import OwnerProfile from '../pages/owner/OwnerProfile';
import OwnerNotifications from '../pages/owner/Notifications';

// Worker Pages
import WorkerDashboard from '../pages/worker/Dashboard';
import WorkerTasks from '../pages/worker/Tasks';
import WorkerProgress from '../pages/worker/Progress';
import WorkerStatistics from '../pages/worker/Statistics';
import WorkerChat from '../pages/worker/Chat';
import WorkerNotifications from '../pages/worker/Notifications';
import WorkerProfile from '../pages/worker/Profile';
import WorkerCalendar from '../pages/worker/Calendar';

// Customer Pages
import CustomerDashboard from '../pages/customer/Dashboard';
import CustomerMeasurements from '../pages/customer/Measurements';
import CustomerOrders from '../pages/customer/Orders';
import CustomerCatalogue from '../pages/customer/Catalogue';
import CustomerCart from '../pages/customer/Cart';
import CustomerPayment from '../pages/customer/Payment';
import CustomerSupport from '../pages/customer/Support';
import CustomerProfile from '../pages/customer/Profile';

const ProtectedRoute = ({ children, allowedRole }) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to={`/${user.role}/dashboard`} replace />;
  }

  return children;
};

const AppRoutes = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route 
        path="/login" 
        element={isAuthenticated ? <Navigate to={`/${user.role}/dashboard`} /> : <Login />} 
      />
      <Route 
        path="/signup" 
        element={isAuthenticated ? <Navigate to={`/${user.role}/dashboard`} /> : <Signup />} 
      />

      {/* Owner Routes */}
      <Route path="/owner/dashboard" element={<ProtectedRoute allowedRole="owner"><OwnerDashboard /></ProtectedRoute>} />
      <Route path="/owner/worker/:id" element={<ProtectedRoute allowedRole="owner"><WorkerDetails /></ProtectedRoute>} />
      <Route path="/owner/profile" element={<ProtectedRoute allowedRole="owner"><OwnerProfile /></ProtectedRoute>} />
      <Route path="/owner/notifications" element={<ProtectedRoute allowedRole="owner"><OwnerNotifications /></ProtectedRoute>} />
      <Route path="/owner/workers" element={<ProtectedRoute allowedRole="owner"><OwnerWorkers /></ProtectedRoute>} />
      <Route path="/owner/customers" element={<ProtectedRoute allowedRole="owner"><OwnerCustomers /></ProtectedRoute>} />
      <Route path="/owner/orders" element={<ProtectedRoute allowedRole="owner"><OwnerOrders /></ProtectedRoute>} />
      <Route path="/owner/billing" element={<ProtectedRoute allowedRole="owner"><OwnerBilling /></ProtectedRoute>} />
      <Route path="/owner/inventory" element={<ProtectedRoute allowedRole="owner"><OwnerInventory /></ProtectedRoute>} />
      <Route path="/owner/ratings" element={<ProtectedRoute allowedRole="owner"><OwnerRatings /></ProtectedRoute>} />
      <Route path="/owner/chat" element={<ProtectedRoute allowedRole="owner"><OwnerChat /></ProtectedRoute>} />
      <Route path="/owner/analytics" element={<ProtectedRoute allowedRole="owner"><OwnerAnalytics /></ProtectedRoute>} />
      <Route path="/owner/reports" element={<ProtectedRoute allowedRole="owner"><OwnerAnalytics /></ProtectedRoute>} />

      {/* Worker Routes */}
      <Route path="/worker/dashboard" element={<ProtectedRoute allowedRole="worker"><WorkerDashboard /></ProtectedRoute>} />
      <Route path="/worker/tasks" element={<ProtectedRoute allowedRole="worker"><WorkerTasks /></ProtectedRoute>} />
      <Route path="/worker/progress" element={<ProtectedRoute allowedRole="worker"><WorkerProgress /></ProtectedRoute>} />
      <Route path="/worker/statistics" element={<ProtectedRoute allowedRole="worker"><WorkerStatistics /></ProtectedRoute>} />
      <Route path="/worker/chat" element={<ProtectedRoute allowedRole="worker"><WorkerChat /></ProtectedRoute>} />
      <Route path="/worker/notifications" element={<ProtectedRoute allowedRole="worker"><WorkerNotifications /></ProtectedRoute>} />
      <Route path="/worker/profile" element={<ProtectedRoute allowedRole="worker"><WorkerProfile /></ProtectedRoute>} />
      <Route path="/worker/calendar" element={<ProtectedRoute allowedRole="worker"><WorkerCalendar /></ProtectedRoute>} />

      {/* Customer Routes */}
      <Route path="/customer/dashboard" element={<ProtectedRoute allowedRole="customer"><CustomerDashboard /></ProtectedRoute>} />
      <Route path="/customer/measurements" element={<ProtectedRoute allowedRole="customer"><CustomerMeasurements /></ProtectedRoute>} />
      <Route path="/customer/orders" element={<ProtectedRoute allowedRole="customer"><CustomerOrders /></ProtectedRoute>} />
      <Route path="/customer/catalogue" element={<ProtectedRoute allowedRole="customer"><CustomerCatalogue /></ProtectedRoute>} />
      <Route path="/customer/cart" element={<ProtectedRoute allowedRole="customer"><CustomerCart /></ProtectedRoute>} />
      <Route path="/customer/payment" element={<ProtectedRoute allowedRole="customer"><CustomerPayment /></ProtectedRoute>} />
      <Route path="/customer/support" element={<ProtectedRoute allowedRole="customer"><CustomerSupport /></ProtectedRoute>} />
      <Route path="/customer/profile" element={<ProtectedRoute allowedRole="customer"><CustomerProfile /></ProtectedRoute>} />

      {/* Default Route */}
      <Route path="/" element={<Navigate to={isAuthenticated ? `/${user.role}/dashboard` : "/login"} replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
