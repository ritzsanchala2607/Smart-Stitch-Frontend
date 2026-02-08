/**
 * OPTIMIZED CUSTOMERS PAGE - Example Implementation
 * 
 * This file demonstrates how to use the global DataContext
 * to eliminate redundant API calls and improve performance.
 * 
 * Key Changes:
 * 1. Import useCustomers hook instead of calling API directly
 * 2. Remove local fetchCustomers function
 * 3. Use cached data from context
 * 4. Invalidate cache after mutations (add/edit/delete)
 */

import Sidebar from '../../components/common/Sidebar';
import Topbar from '../../components/common/Topbar';
import { motion, AnimatePresence } from 'framer-motion';
import usePageTitle from '../../hooks/usePageTitle';
import { UserPlus, X, Upload, CheckCircle, Search, Eye, EyeOff, AlertCircle, User, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { validateCustomerForm } from '../../utils/validation';
import CustomerCard from '../../components/common/CustomerCard';
import { customerAPI } from '../../services/api';
import MeasurementInputs from '../../components/common/MeasurementInputs';
import { useCustomers } from '../../hooks/useDataFetch'; // NEW: Import custom hook

const Customers = () => {
  usePageTitle('Customers');
  
  // NEW: Use global state instead of local state
  const {
    customers,
    customersLoading: isLoading,
    customersError: fetchError,
    fetchCustomers,
    invalidateCustomers
  } = useCustomers(); // Automatically fetches on mount and caches

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState({ title: '', description: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [measurementProfiles, setMeasurementProfiles] = useState([]);
  const [isLoadingMeasurements, setIsLoadingMeasurements] = useState(false);
  
  const [customerForm, setCustomerForm] = useState({
    name: '',
    mobile: '',
    email: '',
    password: '',
    measurements: {
      pant: { length: '', waist: '', seatHips: '', knee: '', bottomOpening: '', thighCircumference: '', thigh: '' },
      shirt: { length: '', chest: '', waist: '', shoulder: '', sleeveLength: '', armhole: '', collar: '' },
      coat: { length: '', chest: '', waist: '', shoulder: '', sleeveLength: '', armhole: '' },
      kurta: { length: '', chest: '', waist: '', seatHips: '', flare: '', shoulder: '', armhole: '', sleeve: '', bottomOpening: '', frontNeck: '', backNeck: '' },
      dhoti: { length: '', waist: '', hip: '', sideLength: '', foldLength: '' },
      custom: ''
    },
    photo: null
  });

  const [errors, setErrors] = useState({});
  const [photoPreview, setPhotoPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // REMOVED: useEffect(() => { fetchCustomers(); }, []);
  // REMOVED: const fetchCustomers = async () => { ... }
  // The useCustomers hook handles fetching automatically!

  const handleAddCustomer = async () => {
    if (isSubmitting) {
      console.log('Submission already in progress, ignoring duplicate click');
      return;
    }

    const validation = validateCustomerForm(customerForm);
    
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

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
      setErrors({ api: 'User not authenticated. Please login again.' });
      return;
    }

    setIsSubmitting(true);

    try {
      const customerPayload = {
        user: {
          name: customerForm.name,
          email: customerForm.email,
          password: customerForm.password || 'Customer@123',
          contactNumber: customerForm.mobile,
          roleId: 3
        }
      };

      console.log('Step 1: Creating customer without measurements:', customerPayload);

      const customerResult = await customerAPI.addCustomer(customerPayload, token);

      if (!customerResult.success) {
        if (customerResult.error.includes('403')) {
          throw new Error('Access denied. Please ensure you are logged in as a shop owner.');
        }
        throw new Error(customerResult.error);
      }

      console.log('Customer created successfully:', customerResult.data);

      const customerId = customerResult.data.customerId || customerResult.data.id;

      if (!customerId) {
        console.error('Customer ID not found in response:', customerResult.data);
        throw new Error('Customer created but ID not returned from server');
      }

      // Create measurement profiles...
      // (measurement creation code remains the same)

      // NEW: Invalidate cache to trigger refetch
      invalidateCustomers();
      await fetchCustomers(true); // Force refetch

      setSuccessMessage({
        title: 'Customer Added Successfully!',
        description: 'Customer created successfully.'
      });
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);

      // Reset form
      setCustomerForm({
        name: '',
        mobile: '',
        email: '',
        password: '',
        measurements: {
          pant: { length: '', waist: '', seatHips: '', knee: '', bottomOpening: '', thighCircumference: '', thigh: '' },
          shirt: { length: '', chest: '', waist: '', shoulder: '', sleeveLength: '', armhole: '', collar: '' },
          coat: { length: '', chest: '', waist: '', shoulder: '', sleeveLength: '', armhole: '' },
          kurta: { length: '', chest: '', waist: '', seatHips: '', flare: '', shoulder: '', armhole: '', sleeve: '', bottomOpening: '', frontNeck: '', backNeck: '' },
          dhoti: { length: '', waist: '', hip: '', sideLength: '', foldLength: '' },
          custom: ''
        },
        photo: null
      });
      setPhotoPreview(null);
      setErrors({});
      setShowAddModal(false);
    } catch (error) {
      console.error('Error creating customer:', error);
      setErrors({ api: error.message || 'Failed to create customer' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!customerToDelete) return;

    setIsDeleting(true);

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
      setSuccessMessage({
        title: 'Error',
        description: 'Authentication error. Please log in again.'
      });
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);
      setIsDeleting(false);
      setShowDeleteModal(false);
      return;
    }

    try {
      console.log('Deleting customer:', customerToDelete.id);
      const result = await customerAPI.deleteCustomer(customerToDelete.id, token);

      if (result.success) {
        setSuccessMessage({
          title: 'Success!',
          description: 'Customer deleted successfully!'
        });
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
        
        setShowDeleteModal(false);
        setCustomerToDelete(null);
        
        // NEW: Invalidate cache and refetch
        invalidateCustomers();
        await fetchCustomers(true);
      } else {
        console.error('Failed to delete customer:', result.error);
        setSuccessMessage({
          title: 'Error',
          description: `Failed to delete customer: ${result.error}`
        });
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 5000);
      }
    } catch (error) {
      console.error('Error deleting customer:', error);
      setSuccessMessage({
        title: 'Error',
        description: 'An error occurred while deleting the customer. Please try again.'
      });
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);
    } finally {
      setIsDeleting(false);
    }
  };

  // Rest of the component remains the same...
  // (filtering, pagination, rendering logic)

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.phone.includes(searchQuery)
  );

  // Pagination calculations
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCustomers = filteredCustomers.slice(startIndex, endIndex);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar role="owner" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="flex-1 overflow-y-auto p-6">
          {/* Success Message */}
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="fixed top-6 right-6 z-50 max-w-md"
            >
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl border-2 border-green-500 dark:border-green-400 p-4 flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-1">
                    {successMessage.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {successMessage.description}
                  </p>
                </div>
                <button
                  onClick={() => setShowSuccess(false)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                >
                  <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                </button>
              </div>
            </motion.div>
          )}

          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Customer Management</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">Manage your customer database</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowAddModal(true)}
              className="bg-orange-500 text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-orange-600 transition-colors"
            >
              <UserPlus className="w-5 h-5" />
              Add Customer
            </motion.button>
          </div>

          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                placeholder="Search customers by name, email, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading customers...</p>
            </div>
          )}

          {/* Error State */}
          {fetchError && !isLoading && (
            <div className="flex flex-col items-center justify-center py-20">
              <AlertCircle className="w-16 h-16 text-red-400 mb-4" />
              <p className="text-red-600 dark:text-red-400 mb-4">{fetchError}</p>
              <button
                onClick={() => fetchCustomers(true)} // Force refetch
                className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                Retry
              </button>
            </div>
          )}

          {/* Customers Grid */}
          {!isLoading && !fetchError && (
            <>
              {paginatedCustomers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <User className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">
                    {searchQuery ? 'No customers found matching your search.' : 'No customers yet. Add your first customer!'}
                  </p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {paginatedCustomers.map((customer) => (
                      <CustomerCard
                        key={customer.id}
                        customer={customer}
                        onView={() => {/* handle view */}}
                        onEdit={() => {/* handle edit */}}
                        onDelete={() => {/* handle delete */}}
                      />
                    ))}
                  </div>

                  {/* Pagination */}
                  {filteredCustomers.length > 0 && totalPages > 1 && (
                    <div className="flex items-center justify-between mt-6">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Showing {startIndex + 1} to {Math.min(endIndex, filteredCustomers.length)} of {filteredCustomers.length} customers
                      </p>
                      {/* Pagination controls... */}
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default Customers;
