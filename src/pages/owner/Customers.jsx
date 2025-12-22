import Sidebar from '../../components/common/Sidebar';
import Topbar from '../../components/common/Topbar';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, X, Upload, CheckCircle, Search } from 'lucide-react';
import { useState, useEffect } from 'react';
import { validateCustomerForm } from '../../utils/validation';
import CustomerCard from '../../components/common/CustomerCard';
import { customerAPI } from '../../services/api';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  
  const [customerForm, setCustomerForm] = useState({
    name: '',
    mobile: '',
    email: '',
    password: '',
    measurements: {
      shirt: { chest: '', waist: '', shoulder: '', length: '' },
      pant: { waist: '', length: '', hip: '' },
      custom: ''
    },
    photo: null
  });

  const [errors, setErrors] = useState({});
  const [photoPreview, setPhotoPreview] = useState(null);

  // Fetch customers on component mount
  useEffect(() => {
    fetchCustomers();
  }, []);

  // Fetch customers from API
  const fetchCustomers = async () => {
    setIsLoading(true);
    setFetchError(null);

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
      setFetchError('Authentication required. Please login again.');
      setIsLoading(false);
      return;
    }

    try {
      const result = await customerAPI.getCustomers(token);
      
      if (result.success) {
        console.log('Customers fetched:', result.data);
        
        // Map API response to component format
        const mappedCustomers = (result.data || []).map(customer => ({
          id: customer.customerId || customer.id,
          name: customer.user?.name || customer.name,
          email: customer.user?.email || customer.email,
          phone: customer.user?.contactNumber || customer.phone,
          address: '',
          joinDate: customer.createdAt ? new Date(customer.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          totalOrders: 0,
          totalSpent: 0,
          measurements: {
            ...(customer.measurements?.chest && {
              shirt: {
                chest: customer.measurements.chest || 0,
                waist: customer.measurements.waist || 0,
                shoulder: customer.measurements.shoulder || 0,
                length: customer.measurements.shirtLength || 0
              }
            }),
            ...(customer.measurements?.waist && {
              pant: {
                waist: customer.measurements.waist || 0,
                length: customer.measurements.pantLength || 0,
                hip: customer.measurements.hip || 0
              }
            }),
            ...(customer.measurements?.customMeasurements && {
              custom: customer.measurements.customMeasurements
            })
          },
          avatar: customer.user?.profilePicture || `https://i.pravatar.cc/150?img=${customer.customerId || Math.floor(Math.random() * 70)}`
        }));
        
        setCustomers(mappedCustomers);
      } else {
        console.error('Failed to fetch customers:', result.error);
        setFetchError(result.error || 'Failed to load customers');
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
      setFetchError('Failed to load customers. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setCustomerForm(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleMeasurementChange = (type, field, value) => {
    setCustomerForm(prev => ({
      ...prev,
      measurements: {
        ...prev.measurements,
        [type]: typeof prev.measurements[type] === 'object' 
          ? { ...prev.measurements[type], [field]: value }
          : value
      }
    }));
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        setErrors(prev => ({
          ...prev,
          photo: 'Please upload a valid image file (JPG, PNG, or GIF)'
        }));
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          photo: 'File size must be less than 5MB'
        }));
        return;
      }

      setCustomerForm(prev => ({
        ...prev,
        photo: file
      }));

      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);

      setErrors(prev => ({
        ...prev,
        photo: ''
      }));
    }
  };

  const handleRemovePhoto = () => {
    setCustomerForm(prev => ({
      ...prev,
      photo: null
    }));
    setPhotoPreview(null);
  };

  const handleAddCustomer = async () => {
    const validation = validateCustomerForm(customerForm);
    
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    // Get JWT token
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

    try {
      // Prepare API payload
      const payload = {
        user: {
          name: customerForm.name,
          email: customerForm.email,
          password: customerForm.password || 'Customer@123', // Default password if not provided
          contactNumber: customerForm.mobile,
          roleId: 3 // Customer role ID
        },
        measurements: {
          chest: parseFloat(customerForm.measurements.shirt.chest) || 0,
          shoulder: parseFloat(customerForm.measurements.shirt.shoulder) || 0,
          shirtLength: parseFloat(customerForm.measurements.shirt.length) || 0,
          waist: parseFloat(customerForm.measurements.pant.waist) || 0,
          pantLength: parseFloat(customerForm.measurements.pant.length) || 0
        }
      };

      console.log('Creating customer with payload:', payload);

      const result = await customerAPI.addCustomer(payload, token);

      console.log('API Result:', result);

      if (!result.success) {
        if (result.error.includes('403')) {
          throw new Error('Access denied. Please ensure you are logged in as a shop owner.');
        }
        throw new Error(result.error);
      }

      console.log('Customer created successfully:', result.data);

      // Refresh the customers list from the backend
      await fetchCustomers();

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);

      // Reset form and close modal
      setCustomerForm({
        name: '',
        mobile: '',
        email: '',
        password: '',
        measurements: {
          shirt: { chest: '', waist: '', shoulder: '', length: '' },
          pant: { waist: '', length: '', hip: '' },
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
    }
  };

  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCustomerForView, setSelectedCustomerForView] = useState(null);
  const [editingCustomer, setEditingCustomer] = useState(null);

  const handleView = (customerId) => {
    const customer = customers.find(c => c.id === customerId);
    setSelectedCustomerForView(customer);
    setShowViewModal(true);
  };

  const handleEdit = (customerId) => {
    const customer = customers.find(c => c.id === customerId);
    setEditingCustomer(customer);
    
    // Pre-fill form with customer data
    setCustomerForm({
      name: customer.name,
      mobile: customer.phone,
      email: customer.email,
      measurements: {
        shirt: customer.measurements?.shirt || { chest: '', waist: '', shoulder: '', length: '' },
        pant: customer.measurements?.pant || { waist: '', length: '', hip: '' },
        custom: customer.measurements?.custom || ''
      },
      photo: null
    });
    
    // Set photo preview if customer has avatar
    if (customer.avatar) {
      setPhotoPreview(customer.avatar);
    }
    
    setShowEditModal(true);
  };

  const handleUpdateCustomer = () => {
    const validation = validateCustomerForm(customerForm);
    
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    const updatedCustomer = {
      ...editingCustomer,
      name: customerForm.name,
      email: customerForm.email,
      phone: customerForm.mobile,
      measurements: {
        ...(customerForm.measurements.shirt.chest && {
          shirt: {
            chest: parseFloat(customerForm.measurements.shirt.chest) || 0,
            waist: parseFloat(customerForm.measurements.shirt.waist) || 0,
            shoulder: parseFloat(customerForm.measurements.shirt.shoulder) || 0,
            length: parseFloat(customerForm.measurements.shirt.length) || 0
          }
        }),
        ...(customerForm.measurements.pant.waist && {
          pant: {
            waist: parseFloat(customerForm.measurements.pant.waist) || 0,
            length: parseFloat(customerForm.measurements.pant.length) || 0,
            hip: parseFloat(customerForm.measurements.pant.hip) || 0
          }
        }),
        ...(customerForm.measurements.custom && {
          custom: customerForm.measurements.custom
        })
      },
      avatar: photoPreview || editingCustomer.avatar
    };

    setCustomers(prev => prev.map(c => c.id === editingCustomer.id ? updatedCustomer : c));
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);

    // Reset form and close modal
    setCustomerForm({
      name: '',
      mobile: '',
      email: '',
      measurements: {
        shirt: { chest: '', waist: '', shoulder: '', length: '' },
        pant: { waist: '', length: '', hip: '' },
        custom: ''
      },
      photo: null
    });
    setPhotoPreview(null);
    setErrors({});
    setEditingCustomer(null);
    setShowEditModal(false);
  };

  const handleDelete = (customerId) => {
    if (window.confirm('Are you sure you want to delete this customer? This action cannot be undone.')) {
      setCustomers(prev => prev.filter(c => c.id !== customerId));
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  };

  // Filter customers based on search query
  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.phone.includes(searchQuery)
  );

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar role="owner" />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        
        <main className="flex-1 overflow-y-auto p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-7xl mx-auto"
          >
            {/* Success Message */}
            <AnimatePresence>
              {showSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: -50, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -50, scale: 0.9 }}
                  className="fixed top-6 right-6 z-50 bg-white dark:bg-gray-800 border-l-4 border-green-500 rounded-lg shadow-2xl p-6 max-w-md"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-7 h-7 text-green-600 dark:text-green-400" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">
                        Customer Added Successfully!
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        The customer has been added and can now place orders.
                      </p>
                    </div>
                    <button
                      onClick={() => setShowSuccess(false)}
                      className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Customer Management</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">Manage your customers and their profiles</p>
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

            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search customers by name, email, or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
              </div>
            </div>

            {/* Customers Grid */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Customers List ({filteredCustomers.length})
              </h2>
              
              {/* Loading State */}
              {isLoading ? (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"
                  />
                  <p className="text-gray-600 dark:text-gray-400">Loading customers...</p>
                </div>
              ) : fetchError ? (
                /* Error State */
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center">
                  <X className="w-16 h-16 text-red-500 mx-auto mb-4" />
                  <p className="text-red-600 dark:text-red-400 mb-4">{fetchError}</p>
                  <button
                    onClick={fetchCustomers}
                    className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    Retry
                  </button>
                </div>
              ) : filteredCustomers.length === 0 ? (
                /* Empty State */
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center">
                  <UserPlus className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">
                    {searchQuery ? 'No customers found matching your search.' : 'No customers yet. Add your first customer!'}
                  </p>
                </div>
              ) : (
                /* Customers Grid */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredCustomers.map((customer) => (
                    <CustomerCard
                      key={customer.id}
                      customer={customer}
                      onView={handleView}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </main>
      </div>

      {/* View Customer Modal */}
      <AnimatePresence>
        {showViewModal && selectedCustomerForView && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowViewModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Customer Details</h2>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6">
                {/* Customer Info */}
                <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <img
                    src={selectedCustomerForView.avatar}
                    alt={selectedCustomerForView.name}
                    className="w-20 h-20 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{selectedCustomerForView.name}</h3>
                    <p className="text-gray-600 dark:text-gray-400">{selectedCustomerForView.email}</p>
                    <p className="text-gray-600 dark:text-gray-400">{selectedCustomerForView.phone}</p>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Orders</p>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{selectedCustomerForView.totalOrders}</p>
                  </div>
                  <div className="p-4 bg-green-50 dark:bg-green-900/30 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Spent</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">${selectedCustomerForView.totalSpent}</p>
                  </div>
                </div>

                {/* Measurements */}
                {selectedCustomerForView.measurements && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Measurements</h3>
                    
                    {/* Shirt Measurements */}
                    {selectedCustomerForView.measurements.shirt && (
                      <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3">Shirt Measurements</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Chest</p>
                            <p className="font-semibold text-gray-900 dark:text-gray-100">{selectedCustomerForView.measurements.shirt.chest}"</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Waist</p>
                            <p className="font-semibold text-gray-900 dark:text-gray-100">{selectedCustomerForView.measurements.shirt.waist}"</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Shoulder</p>
                            <p className="font-semibold text-gray-900 dark:text-gray-100">{selectedCustomerForView.measurements.shirt.shoulder}"</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Length</p>
                            <p className="font-semibold text-gray-900 dark:text-gray-100">{selectedCustomerForView.measurements.shirt.length}"</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Pant Measurements */}
                    {selectedCustomerForView.measurements.pant && (
                      <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3">Pant Measurements</h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Waist</p>
                            <p className="font-semibold text-gray-900 dark:text-gray-100">{selectedCustomerForView.measurements.pant.waist}"</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Length</p>
                            <p className="font-semibold text-gray-900 dark:text-gray-100">{selectedCustomerForView.measurements.pant.length}"</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Hip</p>
                            <p className="font-semibold text-gray-900 dark:text-gray-100">{selectedCustomerForView.measurements.pant.hip}"</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Custom Measurements */}
                    {selectedCustomerForView.measurements.custom && (
                      <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Custom Measurements</h4>
                        <p className="text-gray-900 dark:text-gray-100">{selectedCustomerForView.measurements.custom}</p>
                      </div>
                    )}

                    {!selectedCustomerForView.measurements.shirt && 
                     !selectedCustomerForView.measurements.pant && 
                     !selectedCustomerForView.measurements.custom && (
                      <p className="text-gray-500 dark:text-gray-400 text-center py-4">No measurements recorded</p>
                    )}
                  </div>
                )}

                {/* Additional Info */}
                <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-medium">Customer ID:</span> {selectedCustomerForView.id}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    <span className="font-medium">Join Date:</span> {selectedCustomerForView.joinDate}
                  </p>
                </div>

                {/* Footer */}
                <div className="flex gap-4 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => {
                      setShowViewModal(false);
                      handleEdit(selectedCustomerForView.id);
                    }}
                    className="flex-1 py-3 rounded-lg font-semibold text-white bg-orange-500 hover:bg-orange-600 transition-colors"
                  >
                    Edit Customer
                  </button>
                  <button
                    onClick={() => setShowViewModal(false)}
                    className="flex-1 py-3 rounded-lg font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Customer Modal */}
      <AnimatePresence>
        {showEditModal && editingCustomer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => {
              setShowEditModal(false);
              setEditingCustomer(null);
              setPhotoPreview(null);
              setErrors({});
            }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Edit Customer</h2>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingCustomer(null);
                    setPhotoPreview(null);
                    setErrors({});
                  }}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                </button>
              </div>

              {/* Modal Body - Same as Add Customer Modal */}
              <div className="p-6">
                {/* Basic Information */}
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={customerForm.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 ${
                        errors.name ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
                      }`}
                      placeholder="Enter customer name"
                    />
                    {errors.name && (
                      <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.name}</p>
                    )}
                  </div>

                  {/* Mobile */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Mobile <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={customerForm.mobile}
                      onChange={(e) => handleInputChange('mobile', e.target.value)}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 ${
                        errors.mobile ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
                      }`}
                      placeholder="+1234567890"
                    />
                    {errors.mobile && (
                      <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.mobile}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={customerForm.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 ${
                        errors.email ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
                      }`}
                      placeholder="customer@email.com"
                    />
                    {errors.email && (
                      <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.email}</p>
                    )}
                  </div>

                  {/* Customer Photo */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Customer Photo
                    </label>
                    
                    {!photoPreview ? (
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-orange-500 transition-colors dark:bg-gray-700">
                        <Upload className="w-8 h-8 text-gray-400 dark:text-gray-500 mb-2" />
                        <span className="text-sm text-gray-600 dark:text-gray-300">Click to upload</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">JPG, PNG (max 5MB)</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          className="hidden"
                        />
                      </label>
                    ) : (
                      <div className="relative w-32 h-32">
                        <img
                          src={photoPreview}
                          alt="Preview"
                          className="w-full h-full object-cover rounded-lg"
                        />
                        <button
                          onClick={handleRemovePhoto}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                    
                    {errors.photo && (
                      <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.photo}</p>
                    )}
                  </div>
                </div>

                {/* Measurements Section */}
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 mt-6">Measurements (Optional)</h3>
                
                {/* Shirt Measurements */}
                <div className="mb-6">
                  <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-3">Shirt Measurements</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Chest</label>
                      <input
                        type="number"
                        value={customerForm.measurements.shirt.chest}
                        onChange={(e) => handleMeasurementChange('shirt', 'chest', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                        placeholder="0"
                        min="0"
                        step="0.1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Waist</label>
                      <input
                        type="number"
                        value={customerForm.measurements.shirt.waist}
                        onChange={(e) => handleMeasurementChange('shirt', 'waist', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                        placeholder="0"
                        min="0"
                        step="0.1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Shoulder</label>
                      <input
                        type="number"
                        value={customerForm.measurements.shirt.shoulder}
                        onChange={(e) => handleMeasurementChange('shirt', 'shoulder', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                        placeholder="0"
                        min="0"
                        step="0.1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Length</label>
                      <input
                        type="number"
                        value={customerForm.measurements.shirt.length}
                        onChange={(e) => handleMeasurementChange('shirt', 'length', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                        placeholder="0"
                        min="0"
                        step="0.1"
                      />
                    </div>
                  </div>
                </div>

                {/* Pant Measurements */}
                <div className="mb-6">
                  <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-3">Pant Measurements</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Waist</label>
                      <input
                        type="number"
                        value={customerForm.measurements.pant.waist}
                        onChange={(e) => handleMeasurementChange('pant', 'waist', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                        placeholder="0"
                        min="0"
                        step="0.1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Length</label>
                      <input
                        type="number"
                        value={customerForm.measurements.pant.length}
                        onChange={(e) => handleMeasurementChange('pant', 'length', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                        placeholder="0"
                        min="0"
                        step="0.1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Hip</label>
                      <input
                        type="number"
                        value={customerForm.measurements.pant.hip}
                        onChange={(e) => handleMeasurementChange('pant', 'hip', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                        placeholder="0"
                        min="0"
                        step="0.1"
                      />
                    </div>
                  </div>
                </div>

                {/* Custom Measurements */}
                <div>
                  <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-3">Custom Measurements</h4>
                  <textarea
                    value={customerForm.measurements.custom}
                    onChange={(e) => handleMeasurementChange('custom', null, e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                    placeholder="Enter any custom measurements or notes..."
                    rows="3"
                  />
                </div>

                {/* Modal Footer */}
                <div className="flex gap-4 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingCustomer(null);
                      setPhotoPreview(null);
                      setErrors({});
                    }}
                    className="flex-1 py-3 rounded-lg font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateCustomer}
                    className="flex-1 py-3 rounded-lg font-semibold text-white bg-orange-500 hover:bg-orange-600 transition-colors"
                  >
                    Update Customer
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Customer Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Add New Customer</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6">
                {/* API Error Message */}
                {errors.api && (
                  <div className="mb-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg p-4 flex items-center gap-3">
                    <X className="w-5 h-5 text-red-600 dark:text-red-400" />
                    <span className="text-red-800 dark:text-red-300 font-medium">
                      {errors.api}
                    </span>
                  </div>
                )}

                {/* Basic Information */}
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={customerForm.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 ${
                        errors.name ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
                      }`}
                      placeholder="Enter customer name"
                    />
                    {errors.name && (
                      <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.name}</p>
                    )}
                  </div>

                  {/* Mobile */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Mobile <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={customerForm.mobile}
                      onChange={(e) => handleInputChange('mobile', e.target.value)}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 ${
                        errors.mobile ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
                      }`}
                      placeholder="+1234567890"
                    />
                    {errors.mobile && (
                      <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.mobile}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={customerForm.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 ${
                        errors.email ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
                      }`}
                      placeholder="customer@email.com"
                    />
                    {errors.email && (
                      <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.email}</p>
                    )}
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Password <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      value={customerForm.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 ${
                        errors.password ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
                      }`}
                      placeholder="Enter password"
                    />
                    {errors.password && (
                      <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.password}</p>
                    )}
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Customer will use this to login
                    </p>
                  </div>

                  {/* Customer Photo */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Customer Photo
                    </label>
                    
                    {!photoPreview ? (
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-orange-500 transition-colors dark:bg-gray-700">
                        <Upload className="w-8 h-8 text-gray-400 dark:text-gray-500 mb-2" />
                        <span className="text-sm text-gray-600 dark:text-gray-300">Click to upload</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">JPG, PNG (max 5MB)</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          className="hidden"
                        />
                      </label>
                    ) : (
                      <div className="relative w-32 h-32">
                        <img
                          src={photoPreview}
                          alt="Preview"
                          className="w-full h-full object-cover rounded-lg"
                        />
                        <button
                          onClick={handleRemovePhoto}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                    
                    {errors.photo && (
                      <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.photo}</p>
                    )}
                  </div>
                </div>

                {/* Measurements Section */}
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 mt-6">Measurements (Optional)</h3>
                
                {/* Shirt Measurements */}
                <div className="mb-6">
                  <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-3">Shirt Measurements</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Chest</label>
                      <input
                        type="number"
                        value={customerForm.measurements.shirt.chest}
                        onChange={(e) => handleMeasurementChange('shirt', 'chest', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                        placeholder="0"
                        min="0"
                        step="0.1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Waist</label>
                      <input
                        type="number"
                        value={customerForm.measurements.shirt.waist}
                        onChange={(e) => handleMeasurementChange('shirt', 'waist', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                        placeholder="0"
                        min="0"
                        step="0.1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Shoulder</label>
                      <input
                        type="number"
                        value={customerForm.measurements.shirt.shoulder}
                        onChange={(e) => handleMeasurementChange('shirt', 'shoulder', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                        placeholder="0"
                        min="0"
                        step="0.1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Length</label>
                      <input
                        type="number"
                        value={customerForm.measurements.shirt.length}
                        onChange={(e) => handleMeasurementChange('shirt', 'length', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                        placeholder="0"
                        min="0"
                        step="0.1"
                      />
                    </div>
                  </div>
                </div>

                {/* Pant Measurements */}
                <div className="mb-6">
                  <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-3">Pant Measurements</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Waist</label>
                      <input
                        type="number"
                        value={customerForm.measurements.pant.waist}
                        onChange={(e) => handleMeasurementChange('pant', 'waist', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                        placeholder="0"
                        min="0"
                        step="0.1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Length</label>
                      <input
                        type="number"
                        value={customerForm.measurements.pant.length}
                        onChange={(e) => handleMeasurementChange('pant', 'length', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                        placeholder="0"
                        min="0"
                        step="0.1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Hip</label>
                      <input
                        type="number"
                        value={customerForm.measurements.pant.hip}
                        onChange={(e) => handleMeasurementChange('pant', 'hip', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                        placeholder="0"
                        min="0"
                        step="0.1"
                      />
                    </div>
                  </div>
                </div>

                {/* Custom Measurements */}
                <div>
                  <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-3">Custom Measurements</h4>
                  <textarea
                    value={customerForm.measurements.custom}
                    onChange={(e) => handleMeasurementChange('custom', null, e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                    placeholder="Enter any custom measurements or notes..."
                    rows="3"
                  />
                </div>

                {/* Modal Footer */}
                <div className="flex gap-4 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 py-3 rounded-lg font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleAddCustomer}
                    className="flex-1 py-3 rounded-lg font-semibold text-white bg-orange-500 hover:bg-orange-600 transition-colors"
                  >
                    Add Customer
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Customers;
