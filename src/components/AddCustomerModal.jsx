import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { isValidName, isValidPhone, isValidEmail } from '../utils/validation';

/**
 * AddCustomerModal Component
 * Modal for quick customer creation from New Order page
 * 
 * Props:
 * - isOpen: boolean - Controls modal visibility
 * - onClose: function - Callback to close the modal
 * - onSave: function - Callback with customer data when saved
 * 
 * Backend Integration Notes:
 * - Replace handleSave with API call to /api/customers
 * - Send: { name, mobile, email }
 * - Receive: { success: boolean, customer: Object, message: string }
 * - Add duplicate checking for mobile/email
 * - Implement proper error handling for network failures
 */
function AddCustomerModal({ isOpen, onClose, onSave }) {
  // Form state management
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: ''
  });

  const [errors, setErrors] = useState({
    name: null,
    mobile: null,
    email: null
  });

  const [isLoading, setIsLoading] = useState(false);

  // Handle input changes and clear field-specific error
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for the field being edited
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  // Validate form fields
  const validateForm = () => {
    const newErrors = {
      name: null,
      mobile: null,
      email: null
    };

    let isValid = true;

    // Name validation
    if (!isValidName(formData.name)) {
      newErrors.name = 'Name must be between 2 and 50 characters';
      isValid = false;
    }

    // Mobile validation
    if (!isValidPhone(formData.mobile)) {
      newErrors.mobile = 'Please enter a valid phone number (10-15 digits)';
      isValid = false;
    }

    // Email validation
    if (!isValidEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
      isValid = false;
    }

    // Update errors state
    setErrors(newErrors);

    return isValid;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Call validateForm on form submission
    if (!validateForm()) {
      // Prevent submission if validation fails
      return;
    }

    // Set loading state to true during submission
    setIsLoading(true);

    // Simulate customer creation with setTimeout (500ms delay)
    setTimeout(() => {
      // Create customer object with generated ID
      const newCustomer = {
        id: `CUST${Date.now()}`,
        name: formData.name.trim(),
        mobile: formData.mobile.trim(),
        email: formData.email.trim(),
        joinDate: new Date().toISOString(),
        totalOrders: 0,
        totalSpent: 0,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=FFA500&color=fff`
      };
      
      // Log customer data to console (frontend-only simulation)
      console.log('Customer created:', newCustomer);
      
      setIsLoading(false);
      
      // Call onSave callback with new customer data
      if (onSave) {
        onSave(newCustomer);
      }
      
      // Reset form data
      setFormData({
        name: '',
        mobile: '',
        email: ''
      });
      
      // Reset errors
      setErrors({
        name: null,
        mobile: null,
        email: null
      });
      
      // Close modal
      onClose();
    }, 500);
  };

  // Handle backdrop click to close modal
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  // Handle modal close
  const handleClose = () => {
    // Reset form data
    setFormData({
      name: '',
      mobile: '',
      email: ''
    });
    
    // Reset errors
    setErrors({
      name: null,
      mobile: null,
      email: null
    });
    
    // Call onClose callback
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={handleBackdropClick}
        >
          <motion.div
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-8 relative"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Header */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Add New Customer
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Enter customer details to create a new profile
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name Input Field */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Customer Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter customer name"
                  className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors placeholder-gray-500 dark:placeholder-gray-400 ${
                    errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                )}
              </div>

              {/* Mobile Input Field */}
              <div>
                <label htmlFor="mobile" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Mobile Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  id="mobile"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleInputChange}
                  placeholder="Enter mobile number"
                  className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors placeholder-gray-500 dark:placeholder-gray-400 ${
                    errors.mobile ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                />
                {errors.mobile && (
                  <p className="text-red-500 text-xs mt-1">{errors.mobile}</p>
                )}
              </div>

              {/* Email Input Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter email address"
                  className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors placeholder-gray-500 dark:placeholder-gray-400 ${
                    errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <motion.button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 py-3 rounded-lg font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  type="submit"
                  disabled={isLoading}
                  className={`flex-1 py-3 rounded-lg font-semibold text-white transition-colors ${
                    isLoading
                      ? 'bg-orange-400 cursor-not-allowed'
                      : 'bg-orange-500 hover:bg-orange-600'
                  }`}
                  whileHover={!isLoading ? { scale: 1.02 } : {}}
                  whileTap={!isLoading ? { scale: 0.98 } : {}}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Saving...
                    </span>
                  ) : (
                    'Save Customer'
                  )}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default AddCustomerModal;
