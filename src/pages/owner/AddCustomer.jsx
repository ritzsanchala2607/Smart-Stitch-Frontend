import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Upload, X, CheckCircle } from 'lucide-react';
import Sidebar from '../../components/common/Sidebar';
import Topbar from '../../components/common/Topbar';
import CustomerCard from '../../components/common/CustomerCard';
import { customers as initialCustomers } from '../../data/dummyData';
import { validateCustomerForm } from '../../utils/validation';

const AddCustomer = () => {
  const [customerForm, setCustomerForm] = useState({
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

  const [customers, setCustomers] = useState(initialCustomers);
  const [errors, setErrors] = useState({});
  const [photoPreview, setPhotoPreview] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleInputChange = (field, value) => {
    setCustomerForm(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error for this field when user starts typing
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
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        setErrors(prev => ({
          ...prev,
          photo: 'Please upload a valid image file (JPG, PNG, or GIF)'
        }));
        return;
      }

      // Validate file size (max 5MB)
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

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);

      // Clear error
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

  const handleAddCustomer = () => {
    // Validate form
    const validation = validateCustomerForm(customerForm);
    
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    // Create new customer object
    const newCustomer = {
      id: `CUST${String(customers.length + 1).padStart(3, '0')}`,
      name: customerForm.name,
      email: customerForm.email,
      phone: customerForm.mobile,
      address: '',
      joinDate: new Date().toISOString().split('T')[0],
      totalOrders: 0,
      totalSpent: 0,
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
      avatar: photoPreview || `https://i.pravatar.cc/150?img=${customers.length + 20}`
    };

    // Add customer to list
    setCustomers(prev => [...prev, newCustomer]);

    // Show success message
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);

    // Reset form
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
  };

  const handleView = (customerId) => {
    // For now, just show an alert. In a real app, this would navigate to customer details
    alert(`View customer ${customerId} - This feature will be implemented in a future update`);
  };

  const handleEdit = (customerId) => {
    // For now, just show an alert. In a real app, this would open an edit modal
    alert(`Edit customer ${customerId} - This feature will be implemented in a future update`);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar role="owner" />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar role="owner" />
        
        <main className="flex-1 overflow-y-auto p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <UserPlus className="w-8 h-8 text-orange-500" />
                Add Customer
              </h1>
              <p className="text-gray-600 mt-2">
                Add new customers and manage their profiles with measurements
              </p>
            </div>

            {/* Success Message */}
            {showSuccess && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3"
              >
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-green-800 font-medium">
                  Customer added successfully!
                </span>
              </motion.div>
            )}

            {/* Add Customer Form */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Customer Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={customerForm.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter customer name"
                  />
                  {errors.name && (
                    <p className="text-red-600 text-sm mt-1">{errors.name}</p>
                  )}
                </div>

                {/* Mobile */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mobile <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={customerForm.mobile}
                    onChange={(e) => handleInputChange('mobile', e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                      errors.mobile ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="+1234567890"
                  />
                  {errors.mobile && (
                    <p className="text-red-600 text-sm mt-1">{errors.mobile}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={customerForm.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="customer@email.com"
                  />
                  {errors.email && (
                    <p className="text-red-600 text-sm mt-1">{errors.email}</p>
                  )}
                </div>

                {/* Customer Photo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Customer Photo
                  </label>
                  
                  {!photoPreview ? (
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-orange-500 transition-colors">
                      <Upload className="w-8 h-8 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-600">Click to upload photo</span>
                      <span className="text-xs text-gray-500 mt-1">JPG, PNG or GIF (max 5MB)</span>
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
                    <p className="text-red-600 text-sm mt-1">{errors.photo}</p>
                  )}
                </div>
              </div>

              {/* Measurements Section */}
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Measurements (Optional)
                </h3>

                {/* Shirt Measurements */}
                <div className="mb-6">
                  <h4 className="text-md font-medium text-gray-700 mb-3">Shirt Measurements</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Chest</label>
                      <input
                        type="number"
                        value={customerForm.measurements.shirt.chest}
                        onChange={(e) => handleMeasurementChange('shirt', 'chest', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="0"
                        min="0"
                        step="0.1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Waist</label>
                      <input
                        type="number"
                        value={customerForm.measurements.shirt.waist}
                        onChange={(e) => handleMeasurementChange('shirt', 'waist', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="0"
                        min="0"
                        step="0.1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Shoulder</label>
                      <input
                        type="number"
                        value={customerForm.measurements.shirt.shoulder}
                        onChange={(e) => handleMeasurementChange('shirt', 'shoulder', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="0"
                        min="0"
                        step="0.1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Length</label>
                      <input
                        type="number"
                        value={customerForm.measurements.shirt.length}
                        onChange={(e) => handleMeasurementChange('shirt', 'length', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="0"
                        min="0"
                        step="0.1"
                      />
                    </div>
                  </div>
                </div>

                {/* Pant Measurements */}
                <div className="mb-6">
                  <h4 className="text-md font-medium text-gray-700 mb-3">Pant Measurements</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Waist</label>
                      <input
                        type="number"
                        value={customerForm.measurements.pant.waist}
                        onChange={(e) => handleMeasurementChange('pant', 'waist', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="0"
                        min="0"
                        step="0.1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Length</label>
                      <input
                        type="number"
                        value={customerForm.measurements.pant.length}
                        onChange={(e) => handleMeasurementChange('pant', 'length', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="0"
                        min="0"
                        step="0.1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Hip</label>
                      <input
                        type="number"
                        value={customerForm.measurements.pant.hip}
                        onChange={(e) => handleMeasurementChange('pant', 'hip', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="0"
                        min="0"
                        step="0.1"
                      />
                    </div>
                  </div>
                </div>

                {/* Custom Measurements */}
                <div>
                  <h4 className="text-md font-medium text-gray-700 mb-3">Custom Measurements</h4>
                  <textarea
                    value={customerForm.measurements.custom}
                    onChange={(e) => handleMeasurementChange('custom', null, e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Enter any custom measurements or notes..."
                    rows="3"
                  />
                </div>
              </div>

              {/* Create Customer Button */}
              <div className="mt-6 flex justify-end">
                <motion.button
                  onClick={handleAddCustomer}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium flex items-center gap-2"
                >
                  <UserPlus className="w-5 h-5" />
                  Create Customer
                </motion.button>
              </div>
            </div>

            {/* Customers List */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Customers List ({customers.length})
              </h2>
              
              {customers.length === 0 ? (
                <div className="bg-white rounded-lg shadow-md p-12 text-center">
                  <UserPlus className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">No customers yet. Add your first customer above!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {customers.map((customer) => (
                    <CustomerCard
                      key={customer.id}
                      customer={customer}
                      onView={handleView}
                      onEdit={handleEdit}
                    />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default AddCustomer;
