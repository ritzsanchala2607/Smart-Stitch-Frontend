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
import NewOrder from '../pages/owner/NewOrder';
import AddWorker from '../pages/owner/AddWorker';
import WorkerDetails from '../pages/owner/WorkerDetails';
import AddCustomer from '../pages/owner/AddCustomer';
import InvoicePage from '../pages/owner/InvoicePage';
import OwnerProfile from '../pages/owner/OwnerProfile';

// Worker Pages
import WorkerDashboard from '../pages/worker/Dashboard';
import WorkerTasks from '../pages/worker/Tasks';
import WorkerProgress from '../pages/worker/Progress';
import WorkerStatistics from '../pages/worker/Statistics';
import WorkerChat from '../pages/worker/Chat';

// Customer Pages
import CustomerDashboard from '../pages/customer/Dashboard';
import CustomerMeasurements from '../pages/customer/Measurements';
import CustomerOrders from '../pages/customer/Orders';
import CustomerCatalogue from '../pages/customer/Catalogue';
import CustomerCart from '../pages/customer/Cart';
import CustomerPayment from '../pages/customer/Payment';
import CustomerSupport from '../pages/customer/Support';

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
      <Route path="/owner/new-order" element={<ProtectedRoute allowedRole="owner"><NewOrder /></ProtectedRoute>} />
      <Route path="/owner/add-worker" element={<ProtectedRoute allowedRole="owner"><AddWorker /></ProtectedRoute>} />
      <Route path="/owner/worker/:id" element={<ProtectedRoute allowedRole="owner"><WorkerDetails /></ProtectedRoute>} />
      <Route path="/owner/add-customer" element={<ProtectedRoute allowedRole="owner"><AddCustomer /></ProtectedRoute>} />
      <Route path="/owner/invoice" element={<ProtectedRoute allowedRole="owner"><InvoicePage /></ProtectedRoute>} />
      <Route path="/owner/profile" element={<ProtectedRoute allowedRole="owner"><OwnerProfile /></ProtectedRoute>} />
      <Route path="/owner/workers" element={<ProtectedRoute allowedRole="owner"><OwnerWorkers /></ProtectedRoute>} />
      <Route path="/owner/customers" element={<ProtectedRoute allowedRole="owner"><OwnerCustomers /></ProtectedRoute>} />
      <Route path="/owner/orders" element={<ProtectedRoute allowedRole="owner"><OwnerOrders /></ProtectedRoute>} />
      <Route path="/owner/billing" element={<ProtectedRoute allowedRole="owner"><OwnerBilling /></ProtectedRoute>} />
      <Route path="/owner/inventory" element={<ProtectedRoute allowedRole="owner"><OwnerInventory /></ProtectedRoute>} />
      <Route path="/owner/ratings" element={<ProtectedRoute allowedRole="owner"><OwnerRatings /></ProtectedRoute>} />
      <Route path="/owner/chat" element={<ProtectedRoute allowedRole="owner"><OwnerChat /></ProtectedRoute>} />

      {/* Worker Routes */}
      <Route path="/worker/dashboard" element={<ProtectedRoute allowedRole="worker"><WorkerDashboard /></ProtectedRoute>} />
      <Route path="/worker/tasks" element={<ProtectedRoute allowedRole="worker"><WorkerTasks /></ProtectedRoute>} />
      <Route path="/worker/progress" element={<ProtectedRoute allowedRole="worker"><WorkerProgress /></ProtectedRoute>} />
      <Route path="/worker/statistics" element={<ProtectedRoute allowedRole="worker"><WorkerStatistics /></ProtectedRoute>} />
      <Route path="/worker/chat" element={<ProtectedRoute allowedRole="worker"><WorkerChat /></ProtectedRoute>} />

      {/* Customer Routes */}
      <Route path="/customer/dashboard" element={<ProtectedRoute allowedRole="customer"><CustomerDashboard /></ProtectedRoute>} />
      <Route path="/customer/measurements" element={<ProtectedRoute allowedRole="customer"><CustomerMeasurements /></ProtectedRoute>} />
      <Route path="/customer/orders" element={<ProtectedRoute allowedRole="customer"><CustomerOrders /></ProtectedRoute>} />
      <Route path="/customer/catalogue" element={<ProtectedRoute allowedRole="customer"><CustomerCatalogue /></ProtectedRoute>} />
      <Route path="/customer/cart" element={<ProtectedRoute allowedRole="customer"><CustomerCart /></ProtectedRoute>} />
      <Route path="/customer/payment" element={<ProtectedRoute allowedRole="customer"><CustomerPayment /></ProtectedRoute>} />
      <Route path="/customer/support" element={<ProtectedRoute allowedRole="customer"><CustomerSupport /></ProtectedRoute>} />

      {/* Default Route */}
      <Route path="/" element={<Navigate to={isAuthenticated ? `/${user.role}/dashboard` : "/login"} replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
